import 'server-only'
// Servicio de precios. Reglas (docs/03-mercado.md §1):
// - F1: nunca un precio inventado. Si el proveedor falla se sirve el último guardado con stale=true.
// - Una llamada al proveedor sirve a todos los usuarios: el precio se guarda en la tabla Quote.
// - Con el mercado abierto el precio se refresca si tiene más de REFRESH_OPEN_MS.
import type { AssetDetailT, AssetItemT, CandleT } from '@/shared/contract'
import { isOpen, nextClose, nextOpen, type ExchangeCode } from '@/shared/market-hours'
import { Prisma } from '@/generated/prisma/client'
import { db } from '../db'
import { CATALOG } from './catalog'
import { binanceCandles, binanceQuotes, ecbRates, finnhubQuotes, yahooCandles, yahooQuotes, type RawCandle, type RawQuote } from './providers'

const REFRESH_OPEN_MS = 20_000
const REFRESH_CLOSED_MS = 30 * 60_000
/** Un precio de un mercado abierto es «con retraso» si es más viejo que su retraso oficial + este margen */
const STALE_MARGIN_MS = 5 * 60_000

type AssetRow = Prisma.AssetGetPayload<{ include: { quote: true } }>

// ── Velas: reales del proveedor, con caché en memoria por instancia ──
const candleCache = new Map<string, { at: number; data: CandleT[] }>()
const CANDLE_TTL: Record<string, number> = { '1D': 60_000, '1W': 5 * 60_000, '1M': 30 * 60_000, '3M': 60 * 60_000, '1Y': 6 * 60 * 60_000 }


/** Varias peticiones a la vez en la misma instancia comparten la misma actualización */
let refreshing: Promise<void> | null = null

function needsRefresh(a: AssetRow, now: number) {
  if (!a.quote) return true
  const age = now - a.quote.updatedAt.getTime()
  return isOpen(a.hours as ExchangeCode, new Date(now)) ? age > REFRESH_OPEN_MS : age > REFRESH_CLOSED_MS
}

async function refresh(rows: AssetRow[]) {
  const by = (p: string) => rows.filter(a => a.provider === p).map(a => a.providerSymbol)
  const [fh, bn, yh] = await Promise.all([
    by('FINNHUB').length ? finnhubQuotes(by('FINNHUB')) : [],
    by('BINANCE').length ? binanceQuotes(by('BINANCE')) : [],
    by('YAHOO').length ? yahooQuotes(by('YAHOO')) : [],
  ])
  const raw: (RawQuote & { source: string })[] = [...fh.map(q => ({ ...q, source: 'FINNHUB' })), ...bn.map(q => ({ ...q, source: 'BINANCE' })), ...yh.map(q => ({ ...q, source: 'YAHOO' }))]
  // Respaldo de divisas: el tipo oficial del BCE (diario) si Yahoo no responde
  const fxMissing = rows.filter(a => a.type === 'FX' && !raw.some(r => r.providerSymbol === a.providerSymbol))
  if (fxMissing.length) {
    const ecb = await ecbRates()
    if (ecb)
      for (const a of fxMissing) {
        const v = a.symbol === 'EURUSD' ? ecb.USD : a.symbol === 'GBPUSD' ? ecb.USD / ecb.GBP : 0
        if (v > 0) raw.push({ providerSymbol: a.providerSymbol, price: v, prevClose: Number(a.quote?.prevClose ?? v), asOf: new Date(ecb.date + 'T16:00:00Z'), source: 'ECB' })
      }
  }
  await Promise.all(
    raw.map(q => {
      const a = rows.find(x => x.providerSymbol === q.providerSymbol && (x.provider === q.source || q.source === 'ECB'))
      if (!a) return null
      const data = { price: new Prisma.Decimal(q.price), prevClose: new Prisma.Decimal(q.prevClose), asOf: q.asOf, source: q.source }
      return db.quote.upsert({ where: { symbol: a.symbol }, create: { symbol: a.symbol, ...data }, update: data })
    }),
  )
}

/** Activos con su cotización, refrescando antes los que estén viejos */
export async function loadAssets(symbols?: string[]): Promise<AssetRow[]> {
  const where = { enabled: true, ...(symbols ? { symbol: { in: symbols } } : {}) }
  let rows = await db.asset.findMany({ where, include: { quote: true }, orderBy: { sortOrder: 'asc' } })
  const now = Date.now()
  const old = rows.filter(a => needsRefresh(a, now))
  if (old.length) {
    refreshing ??= refresh(old).finally(() => (refreshing = null))
    await refreshing
    rows = await db.asset.findMany({ where, include: { quote: true }, orderBy: { sortOrder: 'asc' } })
  }
  return rows
}

const fmt = (_sym: string, type: string, v: number) => (type === 'FX' ? v.toFixed(5) : v.toFixed(v >= 1000 ? 2 : 4))

/** Minigráfica con las velas reales del día si ya están en caché; si no, se piden en segundo plano
 *  y mientras tanto se pintan solo los dos puntos reales que tenemos (cierre anterior y precio actual). */
function sparkFrom(a: AssetRow): number[] {
  if (!a.quote) return []
  const hit = candleCache.get(`${a.symbol}:1D`)
  if (!hit || Date.now() - hit.at > CANDLE_TTL['1D']) void candles(a.symbol, '1D').catch(() => null)
  const closes = hit?.data.map(c => c.c) ?? []
  if (closes.length < 4) return [Number(a.quote.prevClose), Number(a.quote.price)]
  const step = Math.max(1, Math.floor(closes.length / 24))
  return [...closes.filter((_, i) => i % step === 0), Number(a.quote.price)]
}

export function toItem(a: AssetRow, now = Date.now()): AssetItemT | null {
  if (!a.quote) return null
  const open = isOpen(a.hours as ExchangeCode, new Date(now))
  const price = Number(a.quote.price)
  const prev = Number(a.quote.prevClose)
  const age = now - a.quote.asOf.getTime()
  const stale = open && age > a.delayedMinutes * 60_000 + STALE_MARGIN_MS
  return {
    symbol: a.symbol, name: a.name, type: a.type, exchange: a.exchange, isOpen: open, price: fmt(a.symbol, a.type, price),
    currency: a.currency as 'EUR' | 'USD', changePct: ((price - prev) / prev) * 100, sparkline: sparkFrom(a), stale, asOf: a.quote.asOf.toISOString(), delayedMinutes: a.delayedMinutes,
  }
}

export async function listAssets(symbols?: string[]): Promise<AssetItemT[]> {
  const rows = await loadAssets(symbols)
  return rows.map(a => toItem(a)).filter((x): x is AssetItemT => x !== null)
}

/** Euros por dólar, a partir de la cotización real de EUR/USD */
export async function eurPerUsd(): Promise<number> {
  const [fx] = await loadAssets(['EURUSD'])
  const v = Number(fx?.quote?.price ?? 0)
  if (v > 0) return 1 / v
  const ecb = await ecbRates()
  if (ecb) return 1 / ecb.USD
  throw new Error('Sin tipo de cambio')
}

export async function assetDetail(symbol: string, userCurrency: 'EUR' | 'USD' = 'EUR'): Promise<AssetDetailT | null> {
  const [a] = await loadAssets([symbol])
  const it = a && toItem(a)
  if (!a || !it) return null
  const price = Number(a.quote!.price)
  const rate = await eurPerUsd()
  const inUser = userCurrency === 'EUR' ? (a.currency === 'USD' ? price * rate : price) : a.currency === 'USD' ? price : price / rate
  const hours = a.hours as ExchangeCode
  return {
    ...it,
    change: fmt(a.symbol, a.type, price - Number(a.quote!.prevClose)),
    priceInUserCurrency: inUser.toFixed(2),
    opensAt: it.isOpen ? null : (nextOpen(hours)?.toISOString() ?? null),
    closesAt: nextClose(hours)?.toISOString() ?? null,
    description: a.description,
  }
}


export async function candles(symbol: string, range: string): Promise<CandleT[]> {
  const meta = CATALOG.find(a => a.symbol === symbol)
  if (!meta) return []
  const key = `${symbol}:${range}`
  const hit = candleCache.get(key)
  if (hit && Date.now() - hit.at < (CANDLE_TTL[range] ?? 60_000)) return hit.data
  // Las acciones de EE. UU. van por Finnhub en tiempo real, pero sus velas gratis vienen de Yahoo (mismo símbolo)
  const raw: RawCandle[] = meta.provider === 'BINANCE' ? await binanceCandles(meta.providerSymbol, range) : await yahooCandles(meta.providerSymbol, range)
  const data = raw.map(c => ({ t: c.t.toISOString(), o: c.o, h: c.h, l: c.l, c: c.c }))
  if (data.length) candleCache.set(key, { at: Date.now(), data })
  return data.length ? data : (hit?.data ?? [])
}
