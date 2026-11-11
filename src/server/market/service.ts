import 'server-only'
// Servicio de precios del mercado global (docs/03-mercado.md). Reglas:
// - F1: nunca un precio inventado. Si Yahoo falla se sirve el último guardado con stale=true.
// - Una llamada al proveedor sirve a todos: el precio se guarda en Quote (lotes de 20 símbolos).
// - Se refresca solo lo que se está viendo (y un repaso horario de todo el catálogo desde el cron).
import { after } from 'next/server'
import type { AssetDetailT, AssetItemT, AssetPageT, AssetTypeT, CandleT, ChartDataT, MarketOverviewT, RegionT } from '@/shared/contract'
import { isOpen, nextClose, nextOpen, SESSIONS } from '@/shared/market-hours'
import { tzOffset } from '@/shared/session-times'
import { fixPrice } from '@/shared/format'
import { tickerOf } from '@/shared/ticker'
import { Prisma } from '@/generated/prisma/client'
import { db, DB_SCHEMA } from '../db'
import { ecbRates, INTERVALS, isInterval, localDay, periodStart, yahooQuotes, yahooSeries, type Interval } from './providers'
import { refreshFundamentals } from './fundamentals'

const REFRESH_OPEN_MS = 5_000
const REFRESH_CLOSED_MS = 60 * 60_000
/** Más vieja que esto con el mercado abierto: se espera al proveedor en vez de servirla */
const MAX_SERVE_OLD_MS = 3 * 60_000
/** Un precio de un mercado abierto es «con retraso» si es más viejo que su retraso oficial + este margen */
const STALE_MARGIN_MS = 10 * 60_000

export type AssetRow = Prisma.AssetGetPayload<{ include: { quote: true } }>

// ── Monedas ──────────────────────────────────────────────
/** GBp (peniques) y USX (centavos) cotizan en centésimas */
export function normCurrency(cur: string): { cur: string; div: number } {
  if (cur === 'GBp' || cur === 'GBX') return { cur: 'GBP', div: 100 }
  if (cur === 'USX' || cur === 'USc') return { cur: 'USD', div: 100 }
  if (cur === 'ZAc') return { cur: 'ZAR', div: 100 }
  return { cur, div: 1 }
}

let fxCache: { at: number; rates: Record<string, number> } | null = null
let ecbCache: { at: number; rates: Record<string, number> | null } | null = null

/** Tipos diarios del BCE (cambian una vez al día): se piden como mucho cada 6 horas, o cada 10 minutos si falló */
async function ecbDaily() {
  if (ecbCache && Date.now() - ecbCache.at < (ecbCache.rates ? 6 * 3_600_000 : 10 * 60_000)) return ecbCache.rates
  ecbCache = { at: Date.now(), rates: await ecbRates() }
  return ecbCache.rates
}

/** Unidades de cada moneda por 1 euro (de las cotizaciones EUR{XXX}=X; respaldo del BCE) */
export async function fxRates(): Promise<Record<string, number>> {
  if (fxCache && Date.now() - fxCache.at < 30_000) return fxCache.rates
  const rows = await db.asset.findMany({ where: { type: 'FX', symbol: { startsWith: 'EUR' } }, include: { quote: true } })
  const rates: Record<string, number> = { EUR: 1 }
  for (const r of rows) {
    const m = r.symbol.match(/^EUR([A-Z]{3})=X$/)
    if (m && r.quote) rates[m[1]] = Number(r.quote.price)
  }
  // Monedas del catálogo sin par EUR{XXX}=X (THB, IDR, MYR, ZAR…): del BCE. Sin tipo de cambio no se puede operar ese activo
  const ecb = await ecbDaily()
  if (ecb) for (const [k, v] of Object.entries(ecb)) rates[k] ??= v
  fxCache = { at: Date.now(), rates }
  return rates
}

/** Precio en euros de una cotización en su moneda (null si no hay tipo de cambio) */
export function toEur(price: number, currency: string, rates: Record<string, number>): number | null {
  const { cur, div } = normCurrency(currency)
  const r = rates[cur]
  return r ? price / div / r : null
}

// ── Refresco ─────────────────────────────────────────────
let refreshing: Promise<void> | null = null
const pending = new Set<string>()
/** Símbolos que se están pidiendo ahora mismo: no se vuelven a pedir en cuanto termina la petición */
const inflight = new Set<string>()
/** Símbolos que el proveedor no devolvió: no se reintentan en cada petición (evita una llamada a Yahoo por visita) */
const failedAt = new Map<string, number>()
const RETRY_FAILED_MS = 60_000
/** Recién cerrada la bolsa (o con su retraso aún corriendo) se repasa cada minuto, para tener el precio de cierre */
const REFRESH_JUST_CLOSED_MS = 60_000

function needsRefresh(a: AssetRow, now: number) {
  if (!a.quote) return true
  const age = now - a.quote.updatedAt.getTime()
  if (isOpen(a.hours, new Date(now))) return age > REFRESH_OPEN_MS
  // La última vez que se pidió el mercado estaba abierto (o hace menos que su retraso + margen): falta el cierre
  const justClosed = isOpen(a.hours, new Date(a.quote.updatedAt.getTime() - (a.delayedMinutes + 20) * 60_000)) || isOpen(a.hours, a.quote.updatedAt)
  return age > (justClosed ? REFRESH_JUST_CLOSED_MS : REFRESH_CLOSED_MS)
}

/** Reparto entre instancias: marca como «pedidos ahora» los símbolos que nadie ha pedido en los últimos segundos y devuelve esos.
 *  Así muchas personas con el mismo activo abierto (aunque caigan en servidores distintos) comparten una sola llamada. */
async function claim(symbols: string[]): Promise<string[]> {
  if (!symbols.length) return []
  try {
    const rows = await db.$queryRawUnsafe<{ symbol: string }[]>(
      `UPDATE "${DB_SCHEMA}"."Quote" SET "updatedAt" = now() WHERE "symbol" = ANY($1::text[]) AND "updatedAt" < now() - make_interval(secs => $2) RETURNING "symbol"`,
      symbols,
      REFRESH_OPEN_MS / 1000 - 1,
    )
    return rows.map(r => r.symbol)
  } catch (e) {
    console.error('market/claim', e)
    return symbols
  }
}

/** Guarda las cotizaciones con una sola sentencia por lote (INSERT … ON CONFLICT), parametrizada */
async function save(raws: Awaited<ReturnType<typeof yahooQuotes>>) {
  for (let i = 0; i < raws.length; i += 400) {
    const rows = raws.slice(i, i + 400).map(q => ({
      symbol: q.symbol, price: q.price, prevClose: q.prevClose, changePct: q.changePct, dayHigh: q.dayHigh, dayLow: q.dayLow,
      high52: q.high52, low52: q.low52, volume: q.volume, spark: q.spark, asOf: q.asOf.toISOString(),
    }))
    await db
      .$executeRawUnsafe(
        `INSERT INTO "${DB_SCHEMA}"."Quote" ("symbol","price","prevClose","changePct","dayHigh","dayLow","high52","low52","volume","spark","asOf","source","updatedAt")
         SELECT r.symbol, r.price, r."prevClose", r."changePct", r."dayHigh", r."dayLow", r.high52, r.low52, r.volume, r.spark, r."asOf", 'YAHOO', now()
         FROM jsonb_to_recordset($1::jsonb) AS r(symbol text, price numeric, "prevClose" numeric, "changePct" float8, "dayHigh" float8, "dayLow" float8, high52 float8, low52 float8, volume float8, spark jsonb, "asOf" timestamptz)
         WHERE EXISTS (SELECT 1 FROM "${DB_SCHEMA}"."Asset" a WHERE a.symbol = r.symbol)
         ON CONFLICT ("symbol") DO UPDATE SET "price" = EXCLUDED."price", "prevClose" = EXCLUDED."prevClose", "changePct" = EXCLUDED."changePct",
           "dayHigh" = EXCLUDED."dayHigh", "dayLow" = EXCLUDED."dayLow", "high52" = EXCLUDED."high52", "low52" = EXCLUDED."low52", "volume" = EXCLUDED."volume",
           "spark" = EXCLUDED."spark", "asOf" = EXCLUDED."asOf", "source" = 'YAHOO', "updatedAt" = now()`,
        JSON.stringify(rows),
      )
      .catch(e => console.error('market/save', e))
  }
}

/** Refresca unos símbolos (las peticiones simultáneas de la misma instancia se agrupan) */
async function refresh(symbols: string[]) {
  const now = Date.now()
  for (const s of symbols) if (!inflight.has(s) && now - (failedAt.get(s) ?? 0) > RETRY_FAILED_MS) pending.add(s)
  if (!pending.size && !refreshing) return
  if (!refreshing) {
    refreshing = (async () => {
      while (pending.size) {
        const batch = [...pending].slice(0, 400)
        batch.forEach(s => (pending.delete(s), inflight.add(s)))
        try {
          const raws = await yahooQuotes(batch)
          const got = new Set(raws.map(r => r.symbol))
          if (failedAt.size > 5000) failedAt.clear()
          for (const s of batch) {
            if (got.has(s)) failedAt.delete(s)
            else failedAt.set(s, Date.now())
          }
          await save(raws)
        } finally {
          batch.forEach(s => inflight.delete(s))
        }
      }
    })().finally(() => (refreshing = null))
  }
  await refreshing
}

/** Repaso del catálogo (cron horario). Primero lo que tiene órdenes, alertas o posiciones; después lo más viejo,
 *  hasta agotar el tiempo (la función tiene 60 s). Lo que quede se refresca al abrirlo o en el siguiente repaso. */
export async function refreshAll(budgetMs = 38_000) {
  const t0 = Date.now()
  const [hot, all] = await Promise.all([
    Promise.all([
      db.order.findMany({ where: { status: 'PENDING' }, select: { symbol: true }, distinct: ['symbol'] }),
      db.priceAlert.findMany({ where: { active: true }, select: { symbol: true }, distinct: ['symbol'] }),
      db.position.findMany({ select: { symbol: true }, distinct: ['symbol'] }),
    ]).then(r => new Set(r.flat().map(x => x.symbol))),
    db.asset.findMany({ where: { enabled: true }, select: { symbol: true, quote: { select: { updatedAt: true } } } }),
  ])
  const age = (a: (typeof all)[number]) => a.quote?.updatedAt.getTime() ?? 0
  const queue = [...all.filter(a => hot.has(a.symbol)), ...all.filter(a => !hot.has(a.symbol)).sort((a, b) => age(a) - age(b))].map(a => a.symbol)
  let updated = 0
  for (let i = 0; i < queue.length && Date.now() - t0 < budgetMs; i += 320) {
    const raws = await yahooQuotes(queue.slice(i, i + 320), 8)
    await save(raws)
    updated += raws.length
  }
  fxCache = null
  // Datos de empresa (una vez al día por acción): lo que quede del minuto, con un máximo de 8 s
  const fundamentals = await refreshFundamentals(Math.min(8_000, Math.max(0, 44_000 - (Date.now() - t0)))).catch(e => (console.error('market/fundamentals', e), null))
  return { total: all.length, updated, ms: Date.now() - t0, fundamentals }
}

/** Sirve lo guardado y actualiza en segundo plano; espera al proveedor solo si falta o es muy viejo. Devuelve si esperó. */
async function freshen(rows: AssetRow[], mayWait = true): Promise<boolean> {
  const now = Date.now()
  const old = rows.filter(a => needsRefresh(a, now))
  if (!old.length) return false
  const blocking = mayWait && old.some(a => !a.quote || (isOpen(a.hours, new Date(now)) && now - a.quote.updatedAt.getTime() > MAX_SERVE_OLD_MS))
  if (!blocking) {
    // En segundo plano, y solo lo que no esté pidiendo ya otra instancia (los que aún no tienen fila no se pueden marcar: van siempre)
    const run = async () => {
      const withRow = old.filter(a => a.quote).map(a => a.symbol)
      const mine = await claim(withRow)
      await refresh([...old.filter(a => !a.quote).map(a => a.symbol), ...mine])
    }
    try {
      after(run)
    } catch {
      void run().catch(e => console.error('market/refresh', e))
    }
    return false
  }
  await refresh(old.map(a => a.symbol))
  return true
}

/** Forma de un símbolo del catálogo (AAPL, SAN.MC, ^GSPC, EURUSD=X, M&M.NS…): lo demás ni se busca */
export const validSymbol = (s: string) => /^[A-Za-z0-9.^=&-]{1,24}$/.test(s)

export async function loadAssets(symbols: string[]): Promise<AssetRow[]> {
  symbols = symbols.filter(validSymbol)
  if (!symbols.length) return []
  const where = { symbol: { in: symbols }, enabled: true }
  const rows = await db.asset.findMany({ where, include: { quote: true } })
  if (await freshen(rows)) return db.asset.findMany({ where, include: { quote: true } })
  return rows
}

/** Como loadAssets, pero sin esperar nunca al proveedor: sirve lo guardado y actualiza en segundo plano (listas largas) */
export async function loadAssetsLazy(symbols: string[]): Promise<AssetRow[]> {
  symbols = symbols.filter(validSymbol)
  if (!symbols.length) return []
  const rows = await db.asset.findMany({ where: { symbol: { in: symbols }, enabled: true }, include: { quote: true } })
  await freshen(rows, false)
  return rows
}

// ── Formato para la API ──────────────────────────────────
const fmt = (type: string, v: number) => (type === 'FX' ? v.toFixed(5) : fixPrice(v))

export { tickerOf }

export function toItem(a: AssetRow, now = Date.now()): AssetItemT | null {
  if (!a.quote) return null
  const open = isOpen(a.hours, new Date(now))
  const { cur, div } = normCurrency(a.currency)
  const price = Number(a.quote.price) / div
  const age = now - a.quote.asOf.getTime()
  const spark = Array.isArray(a.quote.spark) ? (a.quote.spark as number[]).map(v => v / div) : []
  return {
    symbol: a.symbol, ticker: tickerOf(a.symbol, a.type), name: a.name, type: a.type, exchange: a.exchangeName || a.exchange, isOpen: open,
    price: fmt(a.type, price), currency: cur, region: a.region as RegionT, country: a.country, sector: a.sector,
    changePct: a.quote.changePct, sparkline: spark.length > 1 ? spark : [Number(a.quote.prevClose) / div, price],
    stale: open && age > a.delayedMinutes * 60_000 + STALE_MARGIN_MS, asOf: a.quote.asOf.toISOString(), delayedMinutes: a.delayedMinutes,
  }
}

const items = (rows: AssetRow[]) => rows.map(a => toItem(a)).filter((x): x is AssetItemT => x !== null)

// ── Consultas ────────────────────────────────────────────
export async function listAssets(symbols: string[]): Promise<AssetItemT[]> {
  const rows = await loadAssets(symbols)
  const order = new Map(symbols.map((s, i) => [s, i]))
  return items(rows.sort((a, b) => (order.get(a.symbol) ?? 0) - (order.get(b.symbol) ?? 0)))
}

export interface AssetFilter {
  q?: string
  type?: AssetTypeT
  region?: RegionT
  country?: string
  sector?: string
  index?: string
  sort?: 'name' | 'gainers' | 'losers'
  offset?: number
  limit?: number
}

/** Búsqueda por texto ordenada por relevancia: ticker exacto, ticker que empieza así, nombre que empieza así, y el resto */
async function rankSearch(where: Prisma.AssetWhereInput, q: string, offset: number, limit: number) {
  const rows = await db.asset.findMany({ where, include: { quote: true }, orderBy: [{ sortOrder: 'asc' }], take: 400 })
  const Q = q.toUpperCase()
  const score = (a: AssetRow) => {
    const t = tickerOf(a.symbol, a.type).toUpperCase()
    const n = a.name.toUpperCase()
    if (t === Q || a.symbol.toUpperCase() === Q) return 0
    if (t.startsWith(Q)) return 1
    if (n.startsWith(Q)) return 2
    if (n.split(/[\s.,()-]+/).some(w => w.startsWith(Q))) return 3
    return 4
  }
  return rows.map((a, i) => ({ a, k: score(a) * 10_000 + i })).sort((x, y) => x.k - y.k).slice(offset, offset + limit).map(x => x.a)
}

const likeSafe = (q: string) => q.replace(/[\\%_]/g, m => `\\${m}`)

/** Listado con filtros y paginación (en la BD); refresca solo la página que se devuelve */
export async function searchAssets(f: AssetFilter): Promise<AssetPageT> {
  const limit = Math.min(Math.max(f.limit ?? 40, 1), 100)
  const offset = Math.max(f.offset ?? 0, 0)
  const q = f.q?.trim()
  const where: Prisma.AssetWhereInput = {
    enabled: true,
    hidden: false,
    ...(f.type ? { type: f.type } : {}),
    ...(f.region ? { region: f.region } : {}),
    ...(f.country ? { country: f.country } : {}),
    ...(f.sector ? { sector: f.sector } : {}),
    ...(f.index ? { indices: { has: f.index } } : {}),
    // % y _ son comodines en SQL: se escapan para que «%» no devuelva el catálogo entero
    ...(q ? { OR: [{ symbol: { contains: likeSafe(q), mode: 'insensitive' } }, { name: { contains: likeSafe(q), mode: 'insensitive' } }] } : {}),
  }
  const orderBy: Prisma.AssetOrderByWithRelationInput[] =
    // Sin búsqueda: las acciones por nombre; cripto, ETFs, índices, divisas y materias primas en el orden curado (los más conocidos primero)
    f.sort === 'gainers' ? [{ quote: { changePct: 'desc' } }] : f.sort === 'losers' ? [{ quote: { changePct: 'asc' } }] : q || (f.type && f.type !== 'STOCK') ? [{ sortOrder: 'asc' }] : [{ name: 'asc' }]
  const [total, rows] = await Promise.all([
    db.asset.count({ where }),
    q && !f.sort?.match(/gainers|losers/) ? rankSearch(where, q, offset, limit) : db.asset.findMany({ where, include: { quote: true }, orderBy, skip: offset, take: limit }),
  ])
  const fresh = (await freshen(rows)) ? await db.asset.findMany({ where: { symbol: { in: rows.map(r => r.symbol) } }, include: { quote: true } }) : rows
  const byId = new Map(fresh.map(r => [r.symbol, r]))
  return { items: items(rows.map(r => byId.get(r.symbol) ?? r)), total, nextOffset: offset + limit < total ? offset + limit : null }
}

const OVERVIEW_INDICES: Record<RegionT | 'ALL', string[]> = {
  ALL: ['^GSPC', '^NDX', '^STOXX50E', '^IBEX', '^N225', '^HSI', 'BTC-EUR', 'GC=F'],
  AMERICA: ['^GSPC', '^NDX', '^DJI', '^RUT', '^VIX', '^GSPTSE', '^BVSP', '^MXX'],
  EUROPE: ['^STOXX50E', '^STOXX', '^IBEX', '^GDAXI', '^FCHI', '^FTSE', 'FTSEMIB.MI', '^AEX', '^SSMI'],
  ASIA: ['^N225', '^HSI', '000001.SS', '^NSEI', '^KS11', '^TWII', '^STI', '^AXJO'],
  GLOBAL: ['BTC-EUR', 'ETH-EUR', 'GC=F', 'SI=F', 'PL=F', 'CL=F', 'EURUSD=X', 'USDJPY=X'],
}

/** Portada del mercado: índices de la región y mayores subidas y bajadas del día */
export async function overview(region: RegionT | 'ALL'): Promise<MarketOverviewT> {
  const idx = await listAssets(OVERVIEW_INDICES[region])
  const base: Prisma.AssetWhereInput = { enabled: true, hidden: false, type: 'STOCK', ...(region !== 'ALL' && region !== 'GLOBAL' ? { region } : {}), quote: { isNot: null } }
  const [g, l, latest] = await Promise.all([
    db.asset.findMany({ where: base, include: { quote: true }, orderBy: { quote: { changePct: 'desc' } }, take: 8 }),
    db.asset.findMany({ where: base, include: { quote: true }, orderBy: { quote: { changePct: 'asc' } }, take: 8 }),
    db.quote.aggregate({ _max: { updatedAt: true } }),
  ])
  // La clasificación sale del repaso del catálogo; los precios que se enseñan, al día como en cualquier otra lista
  const fresh = new Map((await loadAssets([...g, ...l].map(a => a.symbol))).map(a => [a.symbol, a]))
  const now = (rows: AssetRow[]) => items(rows.map(a => fresh.get(a.symbol) ?? a))
  return { indices: idx, gainers: now(g), losers: now(l), updatedAt: (latest._max.updatedAt ?? new Date()).toISOString() }
}

/** Filtros disponibles (países, sectores o categorías e índices de una región y un tipo de activo) */
export async function facets(region?: RegionT, type: AssetTypeT = 'STOCK') {
  const where: Prisma.AssetWhereInput = { enabled: true, hidden: false, type, ...(region ? { region } : {}) }
  const [countries, sectors, all] = await Promise.all([
    db.asset.groupBy({ by: ['country'], where, _count: { _all: true }, orderBy: { country: 'asc' } }),
    db.asset.groupBy({ by: ['sector'], where: { ...where, sector: { not: '' } }, _count: { _all: true }, orderBy: { _count: { sector: 'desc' } }, take: 30 }),
    db.asset.findMany({ where, select: { indices: true } }),
  ])
  const idx = new Map<string, number>()
  for (const a of all) for (const i of a.indices) idx.set(i, (idx.get(i) ?? 0) + 1)
  return {
    countries: countries.map(c => ({ value: c.country, count: c._count._all })),
    sectors: sectors.map(s => ({ value: s.sector, count: s._count._all })),
    indices: [...idx.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count })),
  }
}

/** Descripción a partir de los datos reales del activo, para los que no tienen una escrita a mano */
function describe(a: AssetRow): string {
  const t = tickerOf(a.symbol, a.type)
  const idx = a.indices.length ? ` Forma parte del ${a.indices.slice(0, 2).join(' y del ')}.` : ''
  switch (a.type) {
    case 'STOCK':
      return `${a.name} es una empresa${a.sector ? ` del sector ${a.sector.toLowerCase()}` : ''} que cotiza en ${a.exchangeName || a.exchange}${a.country ? ` (${a.country})` : ''}.${idx} Al comprar una acción te haces dueño de una pequeña parte de la empresa: ganas si vale más y cobras dividendos si los reparte.`
    case 'ETF':
      return `${a.name} es un fondo cotizado (ETF)${a.sector ? ` de la categoría «${a.sector}»` : ''}. Con una sola compra inviertes en muchos activos a la vez, así que el riesgo queda más repartido que con una acción suelta. Fíjate en su comisión anual y en qué índice replica.`
    case 'CRYPTO':
      return `${a.name} (${t}) es una criptomoneda. Cotiza las 24 horas, todos los días, y su precio puede subir o bajar mucho en poco tiempo: caídas del 50 % o más han pasado varias veces. No la respalda ningún banco central.`
    case 'COMMODITY':
      return `Precio del contrato de futuros de ${a.name[0].toLowerCase() + a.name.slice(1)} en los mercados de futuros de Estados Unidos y Londres, en ${a.currency}. Las materias primas se mueven por la oferta y la demanda mundial, el clima, la geopolítica y el dólar.`
    case 'FX': {
      const [b, q] = [a.symbol.slice(0, 3), a.symbol.slice(3, 6)]
      return `Tipo de cambio ${b}/${q}: cuántos ${q} cuesta 1 ${b}. El mercado de divisas abre de domingo a viernes casi sin pausa y es el más grande del mundo. Se mueve por los tipos de interés, la inflación y la economía de cada país.`
    }
    case 'INDEX':
      return `${a.name} es un índice: resume en un número cómo van las empresas que lo forman${a.country && a.country !== 'Europa' ? ` (${a.country})` : ''}. No se compra directamente; para invertir en él se usan fondos indexados o ETFs que lo replican.`
    default:
      return ''
  }
}

/** Tramos de la sesión (hora local de la bolsa) del día en que cae `day`, como instantes reales */
function sessionPartsOn(code: string, day: Date): { open: string; close: string }[] {
  const s = SESSIONS[code]
  if (!s) return []
  const [y, mo, d] = new Intl.DateTimeFormat('en-CA', { timeZone: s.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(day).split('-').map(Number)
  const at = (mins: number) => {
    const guess = Date.UTC(y, mo - 1, d, 0, mins)
    return new Date(guess - tzOffset(new Date(guess), s.tz)).toISOString()
  }
  return s.parts.map(([a, b]) => ({ open: at(a), close: at(b) }))
}

export async function assetDetail(symbol: string, userCurrency: 'EUR' | 'USD' = 'EUR'): Promise<AssetDetailT | null> {
  const [a] = await loadAssets([symbol])
  const it = a && toItem(a)
  if (!a || !it || !a.quote) return null
  const { div } = normCurrency(a.currency)
  const price = Number(a.quote.price) / div
  const prev = Number(a.quote.prevClose) / div
  const rates = await fxRates()
  const eur = toEur(Number(a.quote.price), a.currency, rates) ?? price
  const inUser = userCurrency === 'EUR' ? eur : eur * (rates.USD ?? 1)
  const d = (v: number | null) => (v === null ? null : v / div)
  return {
    ...it,
    change: fmt(a.type, price - prev),
    priceInUserCurrency: fixPrice(inUser),
    opensAt: it.isOpen ? null : (nextOpen(a.hours)?.toISOString() ?? null),
    closesAt: nextClose(a.hours)?.toISOString() ?? null,
    description: a.description || describe(a),
    dayHigh: d(a.quote.dayHigh), dayLow: d(a.quote.dayLow), high52: d(a.quote.high52), low52: d(a.quote.low52), volume: a.quote.volume, prevClose: prev,
    indices: a.indices,
    exchangeName: a.exchangeName || it.exchange,
    timezone: SESSIONS[a.hours]?.tz ?? (a.hours === 'CME' ? 'America/New_York' : a.hours === 'FX' ? 'Europe/Madrid' : 'UTC'),
    hoursKind: a.hours === 'CRYPTO' ? 'always' : a.hours === 'FX' ? 'fx' : a.hours === 'CME' ? 'futures' : 'session',
    sessionParts: SESSIONS[a.hours] ? sessionPartsOn(a.hours, it.isOpen ? new Date() : (nextOpen(a.hours) ?? new Date())) : [],
  }
}

// ── Velas: reales del proveedor, con caché en memoria por instancia ──
interface Series { at: number; data: CandleT[]; tz: string; mismatch: boolean }
const candleCache = new Map<string, Series>()
/** Peticiones de velas en curso: muchas personas abriendo el mismo gráfico a la vez comparten una sola llamada */
const candleInflight = new Map<string, Promise<Series>>()
const CANDLE_TTL: Record<Interval, number> = { '1m': 30_000, '5m': 60_000, '15m': 120_000, '1h': 300_000, '1d': 900_000, '1w': 3_600_000, '1M': 6 * 3_600_000 }
const RETRY_CANDLES_MS = 30_000

/** Velas de un símbolo e intervalo, en su moneda principal (libras, no peniques), con t = instante real */
async function series(symbol: string, interval: Interval): Promise<Series> {
  const key = `${symbol}:${interval}`
  const hit = candleCache.get(key)
  if (hit && Date.now() - hit.at < CANDLE_TTL[interval]) return hit
  const running = candleInflight.get(key)
  if (running) return running
  const p = (async (): Promise<Series> => {
    const a = await db.asset.findUnique({ where: { symbol }, select: { currency: true } })
    if (!a) return { at: Date.now(), data: [], tz: 'UTC', mismatch: false }
    const { div } = normCurrency(a.currency)
    const d = (v: number) => (div === 1 ? v : Number((v / div).toPrecision(7)))
    const raw = await yahooSeries(symbol, interval)
    const data = (raw?.candles ?? []).map(c => ({ t: c.t, o: d(c.o), h: d(c.h), l: d(c.l), c: d(c.c), v: c.v }))
    if (candleCache.size > 500) candleCache.clear()
    let entry: Series
    if (raw && (data.length || raw.mismatch || !hit?.data.length)) entry = { at: Date.now(), data, tz: raw.tz, mismatch: raw.mismatch }
    // Si el proveedor falla (o llega vacío cuando antes había velas) se sigue sirviendo lo último y se reintenta en 30 s
    else entry = { at: Date.now() - CANDLE_TTL[interval] + RETRY_CANDLES_MS, data: hit?.data ?? [], tz: hit?.tz ?? raw?.tz ?? 'UTC', mismatch: false }
    candleCache.set(key, entry)
    return entry
  })().finally(() => candleInflight.delete(key))
  candleInflight.set(key, p)
  return p
}

/** Velas reales (t = instante real). Las usan las órdenes pendientes (5 min, un mes) y los avisos */
export async function candles(symbol: string, interval: Interval): Promise<CandleT[]> {
  if (!validSymbol(symbol) || !isInterval(interval)) return []
  return (await series(symbol, interval)).data
}

/** Periodo que se ve al abrir cada intervalo: N sesiones de bolsa (acciones, ETF, índices) o N días seguidos */
const CHART_WINDOW: Record<Interval, { sessions?: number; days: number | null }> = {
  '1m': { sessions: 1, days: 1 },
  '5m': { sessions: 5, days: 5 },
  '15m': { days: 14 },
  '1h': { days: 31 },
  '1d': { days: 365 },
  '1w': { days: 5 * 365 + 1 },
  '1M': { days: null },
}
/** Velas de antes del periodo a la vista: para la media de 200 y para desplazarse hacia atrás */
const WARMUP = 250
const DAY = 86_400

/** Desfase de Madrid (s) en un instante; cambia solo en horas en punto, así que se guarda por hora */
const madridOff = new Map<number, number>()
function madridWall(t: number) {
  const h = Math.floor(t / 3600)
  let off = madridOff.get(h)
  if (off === undefined) {
    if (madridOff.size > 20_000) madridOff.clear()
    off = tzOffset(new Date(h * 3600 * 1000), 'Europe/Madrid') / 1000
    madridOff.set(h, off)
  }
  return t + off
}

/**
 * Gráfico de la ficha: las velas del intervalo pedido (nunca otro), con el periodo que se ve al abrir y el eje en hora de pared:
 * intradía en hora de Madrid; diario, semanal y mensual con la fecha de la bolsa (una vela de Sídney del lunes es del lunes).
 */
export async function chartData(symbol: string, interval: Interval): Promise<ChartDataT | null> {
  if (!validSymbol(symbol) || !isInterval(interval)) return null
  const asset = await db.asset.findUnique({ where: { symbol }, select: { type: true, enabled: true } })
  if (!asset?.enabled) return null
  const s = await series(symbol, interval)
  const all = s.data
  const n = all.length
  const bySessions = asset.type === 'STOCK' || asset.type === 'ETF' || asset.type === 'INDEX'
  const w = CHART_WINDOW[interval]
  const step = INTERVALS[interval].step
  const window: ChartDataT['window'] = w.sessions && bySessions ? 'sessions' : 'rolling'
  const base = { symbol, interval, window, unavailable: s.mismatch || n === 0 }
  if (!n) return { ...base, candles: [], viewFrom: null, partial: false, firstAt: null, lastAt: null }

  // Primera vela del periodo a la vista
  let from = 0
  let partial = false
  if (window === 'sessions') {
    let count = 0
    let prevDay: number | null = null
    for (let i = n - 1; i >= 0; i--) {
      const day = localDay(all[i].t, s.tz)
      if (day === prevDay) continue
      prevDay = day
      if (++count > w.sessions!) {
        from = i + 1
        break
      }
    }
    partial = count < w.sessions!
  } else if (w.days !== null) {
    const start = all[n - 1].t - w.days * DAY
    from = Math.max(0, all.findIndex(c => c.t >= start))
    // Menos historia que el periodo (margen: un fin de semana largo o una vela)
    partial = all[0].t > start + Math.max(4 * DAY, 2 * step)
  }

  // Hora de pared: Madrid en intradía; fecha de la bolsa en diario o más. Siempre creciente (el cambio de hora repite una hora)
  const daily = step >= DAY
  const out: CandleT[] = []
  let viewFrom: number | null = null
  for (let i = Math.max(0, from - WARMUP); i < n; i++) {
    const c = all[i]
    const t = daily ? periodStart(interval, c.t, s.tz) : madridWall(c.t)
    const last = out[out.length - 1]
    if (last && t <= last.t) {
      last.h = Math.max(last.h, c.h)
      last.l = Math.min(last.l, c.l)
      last.c = c.c
      last.v += c.v
    } else out.push({ ...c, t })
    if (i === from) viewFrom = out[out.length - 1].t
  }
  return {
    ...base,
    candles: out,
    viewFrom,
    partial,
    firstAt: new Date(all[from].t * 1000).toISOString(),
    lastAt: new Date(all[n - 1].t * 1000).toISOString(),
  }
}
