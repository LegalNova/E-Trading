import 'server-only'
// Servicio de precios del mercado global (docs/03-mercado.md). Reglas:
// - F1: nunca un precio inventado. Si Yahoo falla se sirve el último guardado con stale=true.
// - Una llamada al proveedor sirve a todos: el precio se guarda en Quote (lotes de 20 símbolos).
// - Se refresca solo lo que se está viendo (y un repaso horario de todo el catálogo desde el cron).
import { after } from 'next/server'
import type { AssetDetailT, AssetItemT, AssetPageT, AssetTypeT, CandleT, MarketOverviewT, RegionT } from '@/shared/contract'
import { isOpen, nextClose, nextOpen, SESSIONS } from '@/shared/market-hours'
import { fixPrice } from '@/shared/format'
import { tickerOf } from '@/shared/ticker'
import { Prisma } from '@/generated/prisma/client'
import { db, DB_SCHEMA } from '../db'
import { ecbRates, yahooCandles, yahooQuotes, type Interval } from './providers'

const REFRESH_OPEN_MS = 15_000
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

/** Unidades de cada moneda por 1 euro (de las cotizaciones EUR{XXX}=X; respaldo del BCE) */
export async function fxRates(): Promise<Record<string, number>> {
  if (fxCache && Date.now() - fxCache.at < 30_000) return fxCache.rates
  const rows = await db.asset.findMany({ where: { type: 'FX', symbol: { startsWith: 'EUR' } }, include: { quote: true } })
  const rates: Record<string, number> = { EUR: 1 }
  for (const r of rows) {
    const m = r.symbol.match(/^EUR([A-Z]{3})=X$/)
    if (m && r.quote) rates[m[1]] = Number(r.quote.price)
  }
  if (!rates.USD || Object.keys(rates).length < 6) {
    const ecb = await ecbRates()
    if (ecb) for (const [k, v] of Object.entries(ecb)) rates[k] ??= v
  }
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

function needsRefresh(a: AssetRow, now: number) {
  if (!a.quote) return true
  const age = now - a.quote.updatedAt.getTime()
  return isOpen(a.hours, new Date(now)) ? age > REFRESH_OPEN_MS : age > REFRESH_CLOSED_MS
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
  symbols.forEach(s => pending.add(s))
  if (!refreshing) {
    refreshing = (async () => {
      while (pending.size) {
        const batch = [...pending].slice(0, 400)
        batch.forEach(s => pending.delete(s))
        await save(await yahooQuotes(batch))
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
  return { total: all.length, updated, ms: Date.now() - t0 }
}

/** Sirve lo guardado y actualiza en segundo plano; espera al proveedor solo si falta o es muy viejo. Devuelve si esperó. */
async function freshen(rows: AssetRow[]): Promise<boolean> {
  const now = Date.now()
  const old = rows.filter(a => needsRefresh(a, now))
  if (!old.length) return false
  const blocking = old.some(a => !a.quote || (isOpen(a.hours, new Date(now)) && now - a.quote.updatedAt.getTime() > MAX_SERVE_OLD_MS))
  const run = () => refresh(old.map(a => a.symbol))
  if (!blocking) {
    try {
      after(run)
    } catch {
      void run()
    }
    return false
  }
  await run()
  return true
}

export async function loadAssets(symbols: string[]): Promise<AssetRow[]> {
  if (!symbols.length) return []
  const where = { symbol: { in: symbols }, enabled: true }
  const rows = await db.asset.findMany({ where, include: { quote: true } })
  if (await freshen(rows)) return db.asset.findMany({ where, include: { quote: true } })
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
    ...(q ? { OR: [{ symbol: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] } : {}),
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
  return { indices: idx, gainers: items(g), losers: items(l), updatedAt: (latest._max.updatedAt ?? new Date()).toISOString() }
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
  }
}

// ── Velas: reales del proveedor, con caché en memoria por instancia ──
const candleCache = new Map<string, { at: number; data: CandleT[] }>()
const CANDLE_TTL: Record<string, number> = { '1m': 30_000, '5m': 60_000, '15m': 120_000, '1h': 300_000, '1d': 900_000, '1w': 3_600_000, '1M': 6 * 3_600_000 }

export async function candles(symbol: string, interval: Interval): Promise<CandleT[]> {
  const a = await db.asset.findUnique({ where: { symbol } })
  if (!a) return []
  const key = `${symbol}:${interval}`
  const hit = candleCache.get(key)
  if (hit && Date.now() - hit.at < (CANDLE_TTL[interval] ?? 60_000)) return hit.data
  const { div } = normCurrency(a.currency)
  const raw = await yahooCandles(symbol, interval)
  const data = raw.map(c => ({ t: c.t, o: c.o / div, h: c.h / div, l: c.l / div, c: c.c / div, v: c.v }))
  if (data.length) {
    if (candleCache.size > 500) candleCache.clear()
    candleCache.set(key, { at: Date.now(), data })
  }
  return data.length ? data : (hit?.data ?? [])
}
