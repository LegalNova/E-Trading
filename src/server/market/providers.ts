import 'server-only'
// Proveedores gratuitos de precios (docs/03-mercado.md). Cada función devuelve datos reales
// o nada: si un proveedor falla, el servicio sirve el último precio guardado con stale=true.

export interface RawQuote {
  providerSymbol: string
  price: number
  prevClose: number
  asOf: Date
}
export interface RawCandle {
  t: Date
  o: number
  h: number
  l: number
  c: number
}

const UA = { 'user-agent': 'Mozilla/5.0 (E-Trading educational simulator)' }

async function getJson<T>(url: string, ms = 8000): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(ms), cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0

// ── Finnhub: acciones y ETFs de EE. UU. en tiempo real (60 llamadas/min) ──
export async function finnhubQuotes(symbols: string[]): Promise<RawQuote[]> {
  const key = process.env.FINNHUB_API_KEY
  if (!key) return []
  const out = await Promise.all(
    symbols.map(async s => {
      const q = await getJson<{ c: number; pc: number; t: number }>(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${key}`)
      return q && ok(q.c) && ok(q.pc) ? { providerSymbol: s, price: q.c, prevClose: q.pc, asOf: new Date(q.t * 1000) } : null
    }),
  )
  return out.filter((x): x is RawQuote => x !== null)
}

// ── Binance: cripto 24/7 (API pública de datos de mercado, sin clave) ──
const BINANCE_HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com']

export async function binanceQuotes(symbols: string[]): Promise<RawQuote[]> {
  const q = encodeURIComponent(JSON.stringify(symbols))
  for (const host of BINANCE_HOSTS) {
    const rows = await getJson<{ symbol: string; lastPrice: string; openPrice: string; closeTime: number }[]>(`${host}/api/v3/ticker/24hr?symbols=${q}`)
    if (rows?.length)
      // En cripto, «hoy» = últimas 24 h, como en los exchanges
      return rows.map(r => ({ providerSymbol: r.symbol, price: Number(r.lastPrice), prevClose: Number(r.openPrice), asOf: new Date(r.closeTime) })).filter(r => ok(r.price) && ok(r.prevClose))
  }
  return []
}

const BINANCE_INTERVAL: Record<string, { interval: string; limit: number }> = {
  '1D': { interval: '15m', limit: 96 },
  '1W': { interval: '2h', limit: 84 },
  '1M': { interval: '1d', limit: 30 },
  '3M': { interval: '1d', limit: 90 },
  '1Y': { interval: '1w', limit: 52 },
}

export async function binanceCandles(symbol: string, range: string): Promise<RawCandle[]> {
  const cfg = BINANCE_INTERVAL[range] ?? BINANCE_INTERVAL['1M']
  for (const host of BINANCE_HOSTS) {
    const rows = await getJson<[number, string, string, string, string][]>(`${host}/api/v3/klines?symbol=${symbol}&interval=${cfg.interval}&limit=${cfg.limit}`)
    if (rows?.length) return rows.map(k => ({ t: new Date(k[0]), o: +k[1], h: +k[2], l: +k[3], c: +k[4] }))
  }
  return []
}

// ── Yahoo Finance (no oficial): bolsa española, Xetra, índices y divisas; velas de todo lo que no es cripto ──
interface YahooChart {
  chart: {
    result?: {
      meta: { regularMarketPrice: number; chartPreviousClose?: number; previousClose?: number; regularMarketTime: number }
      timestamp?: number[]
      indicators: { quote: { open: (number | null)[]; high: (number | null)[]; low: (number | null)[]; close: (number | null)[] }[] }
    }[]
  }
}

async function yahooChart(symbol: string, range: string, interval: string) {
  for (const host of ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']) {
    const d = await getJson<YahooChart>(`${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`)
    const r = d?.chart?.result?.[0]
    if (r?.meta) return r
  }
  return null
}

export async function yahooQuotes(symbols: string[]): Promise<RawQuote[]> {
  const out = await Promise.all(
    symbols.map(async s => {
      // range=2d con velas diarias: el cierre anterior es el de la vela de ayer
      const r = await yahooChart(s, '5d', '1d')
      if (!r) return null
      const closes = (r.indicators.quote[0]?.close ?? []).filter((c): c is number => ok(c))
      const price = r.meta.regularMarketPrice
      const lastDay = r.timestamp?.length ? new Date(r.timestamp[r.timestamp.length - 1] * 1000).toDateString() : ''
      const today = new Date(r.meta.regularMarketTime * 1000).toDateString()
      const prev = closes.length >= 2 ? closes[closes.length - (lastDay === today ? 2 : 1)] : (r.meta.previousClose ?? r.meta.chartPreviousClose)
      return ok(price) && ok(prev) ? { providerSymbol: s, price, prevClose: prev, asOf: new Date(r.meta.regularMarketTime * 1000) } : null
    }),
  )
  return out.filter((x): x is RawQuote => x !== null)
}

const YAHOO_RANGE: Record<string, { range: string; interval: string }> = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '30m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1wk' },
}

export async function yahooCandles(symbol: string, range: string): Promise<RawCandle[]> {
  const cfg = YAHOO_RANGE[range] ?? YAHOO_RANGE['1M']
  const r = await yahooChart(symbol, cfg.range, cfg.interval)
  const q = r?.indicators.quote[0]
  if (!r?.timestamp || !q) return []
  return r.timestamp
    .map((t, i) => ({ t: new Date(t * 1000), o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i] }))
    .filter((c): c is RawCandle => ok(c.o) && ok(c.h) && ok(c.l) && ok(c.c))
}

// ── BCE (Frankfurter): tipo de cambio diario de respaldo ──
export async function ecbRates(): Promise<{ USD: number; GBP: number; date: string } | null> {
  const d = await getJson<{ date: string; rates: { USD: number; GBP: number } }>('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP')
  return d && ok(d.rates?.USD) ? { USD: d.rates.USD, GBP: d.rates.GBP, date: d.date } : null
}
