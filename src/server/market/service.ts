import 'server-only'
// Servicio de precios del mercado global (docs/03-mercado.md). Reglas:
// - F1: nunca un precio inventado. Si Yahoo falla se sirve el último guardado con stale=true.
// - Una llamada al proveedor sirve a todos: el precio se guarda en Quote (lotes de 20 símbolos).
// - Se refresca solo lo que se está viendo (y un repaso horario de todo el catálogo desde el cron).
import { after } from 'next/server'
import type { AssetDetailT, AssetItemT, AssetPageT, AssetTypeT, CandleT, MarketOverviewT, RegionT } from '@/shared/contract'
import { isOpen, nextClose, nextOpen, SESSIONS } from '@/shared/market-hours'
import { Prisma } from '@/generated/prisma/client'
import { db } from '../db'
import { ecbRates, yahooCandles, yahooQuotes, type Interval } from './providers'

const REFRESH_OPEN_MS = 30_000
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

async function save(raws: Awaited<ReturnType<typeof yahooQuotes>>) {
  for (let i = 0; i < raws.length; i += 25) {
    await Promise.all(
      raws.slice(i, i + 25).map(q => {
        const data = {
          price: new Prisma.Decimal(q.price), prevClose: new Prisma.Decimal(q.prevClose), changePct: q.changePct, dayHigh: q.dayHigh, dayLow: q.dayLow,
          high52: q.high52, low52: q.low52, volume: q.volume, spark: q.spark, asOf: q.asOf, source: 'YAHOO',
        }
        return db.quote.upsert({ where: { symbol: q.symbol }, create: { symbol: q.symbol, ...data }, update: data }).catch(() => null)
      }),
    )
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

/** Repaso completo del catálogo (cron horario) */
export async function refreshAll() {
  const all = await db.asset.findMany({ where: { enabled: true }, select: { symbol: true } })
  const t0 = Date.now()
  const raws = await yahooQuotes(all.map(a => a.symbol), 8)
  await save(raws)
  fxCache = null
  return { total: all.length, updated: raws.length, ms: Date.now() - t0 }
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
const fmt = (type: string, v: number) => (type === 'FX' ? v.toFixed(5) : v.toFixed(Math.abs(v) >= 1000 ? 2 : Math.abs(v) >= 1 ? 4 : 6))

/** Símbolo corto: SAN.MC → SAN, ^GSPC → GSPC, BTC-EUR → BTC, EURUSD=X → EURUSD, GC=F → GC */
export function tickerOf(symbol: string, type: string) {
  if (type === 'CRYPTO') return symbol.replace(/-(EUR|USD)$/, '')
  if (type === 'FX') return symbol.replace('=X', '')
  if (type === 'COMMODITY') return symbol.replace('=F', '')
  if (type === 'INDEX') return symbol.replace(/^\^/, '').replace(/\..*$/, '')
  return symbol.replace(/\.[A-Z]+$/, '')
}

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
    f.sort === 'gainers' ? [{ quote: { changePct: 'desc' } }] : f.sort === 'losers' ? [{ quote: { changePct: 'asc' } }] : q ? [{ sortOrder: 'asc' }] : [{ name: 'asc' }]
  const [total, rows] = await Promise.all([db.asset.count({ where }), db.asset.findMany({ where, include: { quote: true }, orderBy, skip: offset, take: limit })])
  const fresh = (await freshen(rows)) ? await db.asset.findMany({ where: { symbol: { in: rows.map(r => r.symbol) } }, include: { quote: true } }) : rows
  const byId = new Map(fresh.map(r => [r.symbol, r]))
  return { items: items(rows.map(r => byId.get(r.symbol) ?? r)), total, nextOffset: offset + limit < total ? offset + limit : null }
}

const OVERVIEW_INDICES: Record<RegionT | 'ALL', string[]> = {
  ALL: ['^GSPC', '^NDX', '^STOXX50E', '^IBEX', '^N225', '^HSI', 'BTC-EUR', 'GC=F'],
  AMERICA: ['^GSPC', '^NDX', '^DJI', '^RUT', '^VIX'],
  EUROPE: ['^STOXX50E', '^STOXX', '^IBEX', '^GDAXI', '^FCHI', '^FTSE', 'FTSEMIB.MI', '^AEX', '^SSMI'],
  ASIA: ['^N225', '^HSI', '000001.SS', '^NSEI', '^KS11', '^TWII', '^STI', '^AXJO'],
  GLOBAL: ['BTC-EUR', 'ETH-EUR', 'GC=F', 'CL=F', 'EURUSD=X', 'USDJPY=X'],
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

/** Filtros disponibles (países, sectores e índices de una región) */
export async function facets(region?: RegionT) {
  const where: Prisma.AssetWhereInput = { enabled: true, hidden: false, type: 'STOCK', ...(region ? { region } : {}) }
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
    priceInUserCurrency: inUser.toFixed(2),
    opensAt: it.isOpen ? null : (nextOpen(a.hours)?.toISOString() ?? null),
    closesAt: nextClose(a.hours)?.toISOString() ?? null,
    description: a.description,
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
