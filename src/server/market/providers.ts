import 'server-only'
// Proveedor de datos de mercado (docs/03-mercado.md §2 ter): Yahoo Finance para todo el catálogo
// (acciones de América, Europa y Asia, ETFs, índices, divisas, materias primas y cripto),
// con el BCE como respaldo para el tipo de cambio. Devuelven datos reales o nada (F1).

export interface RawQuote {
  symbol: string
  price: number
  prevClose: number
  changePct: number
  dayHigh: number | null
  dayLow: number | null
  high52: number | null
  low52: number | null
  volume: number | null
  asOf: Date
  spark: number[]
}
export interface RawCandle {
  t: number // segundos UNIX
  o: number
  h: number
  l: number
  c: number
  v: number
}

const UA = { 'user-agent': 'Mozilla/5.0 (E-Trading educational simulator)' }
const HOSTS = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']
const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0
const num = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : null)

async function getJson<T>(path: string, ms = 9000): Promise<T | null> {
  for (const host of HOSTS) {
    try {
      const r = await fetch(host + path, { headers: UA, signal: AbortSignal.timeout(ms), cache: 'no-store' })
      if (r.ok) return (await r.json()) as T
    } catch {
      // probar el otro servidor
    }
  }
  return null
}

interface SparkMeta {
  symbol: string
  regularMarketPrice?: number
  chartPreviousClose?: number
  previousClose?: number
  regularMarketChangePercent?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  regularMarketVolume?: number
  regularMarketTime?: number
}
interface SparkResp {
  spark?: { result?: { symbol: string; response?: { meta: SparkMeta; indicators?: { quote?: { close?: (number | null)[] }[] } }[] }[] }
}

/** Cotización y curva del día de hasta 20 símbolos por petición (spark de Yahoo) */
async function sparkBatch(symbols: string[]): Promise<RawQuote[]> {
  const q = symbols.map(s => encodeURIComponent(s)).join(',')
  const d = await getJson<SparkResp>(`/v7/finance/spark?symbols=${q}&range=1d&interval=15m`)
  const out: RawQuote[] = []
  for (const r of d?.spark?.result ?? []) {
    const resp = r.response?.[0]
    const m = resp?.meta
    if (!m || !ok(m.regularMarketPrice)) continue
    const prev = ok(m.previousClose) ? m.previousClose : ok(m.chartPreviousClose) ? m.chartPreviousClose : null
    if (!prev) continue
    const closes = (resp?.indicators?.quote?.[0]?.close ?? []).filter(ok)
    out.push({
      symbol: r.symbol,
      price: m.regularMarketPrice,
      prevClose: prev,
      changePct: num(m.regularMarketChangePercent) ?? ((m.regularMarketPrice - prev) / prev) * 100,
      dayHigh: num(m.regularMarketDayHigh), dayLow: num(m.regularMarketDayLow), high52: num(m.fiftyTwoWeekHigh), low52: num(m.fiftyTwoWeekLow), volume: num(m.regularMarketVolume),
      asOf: new Date((m.regularMarketTime ?? Date.now() / 1000) * 1000),
      spark: closes.length > 48 ? closes.filter((_, i) => i % Math.ceil(closes.length / 48) === 0) : closes,
    })
  }
  return out
}

/** Cotizaciones de muchos símbolos: lotes de 20, varios a la vez */
export async function yahooQuotes(symbols: string[], concurrency = 6): Promise<RawQuote[]> {
  const batches: string[][] = []
  for (let i = 0; i < symbols.length; i += 20) batches.push(symbols.slice(i, i + 20))
  const out: RawQuote[] = []
  for (let i = 0; i < batches.length; i += concurrency) {
    const res = await Promise.all(batches.slice(i, i + concurrency).map(b => sparkBatch(b).catch(() => [])))
    for (const r of res) out.push(...r)
  }
  return out
}

/** Intervalos del gráfico y el periodo máximo que da Yahoo para cada uno */
export const INTERVALS = {
  '1m': { yi: '1m', range: '5d' },
  '5m': { yi: '5m', range: '1mo' },
  '15m': { yi: '15m', range: '1mo' },
  '1h': { yi: '60m', range: '6mo' },
  '1d': { yi: '1d', range: '5y' },
  '1w': { yi: '1wk', range: 'max' },
  '1M': { yi: '1mo', range: 'max' },
} as const
export type Interval = keyof typeof INTERVALS

interface ChartResp {
  chart?: { result?: { timestamp?: number[]; indicators: { quote: { open: (number | null)[]; high: (number | null)[]; low: (number | null)[]; close: (number | null)[]; volume?: (number | null)[] }[] } }[] }
}

/** Velas reales (con volumen) de cualquier activo del catálogo */
export async function yahooCandles(symbol: string, interval: Interval): Promise<RawCandle[]> {
  const cfg = INTERVALS[interval] ?? INTERVALS['1d']
  const d = await getJson<ChartResp>(`/v8/finance/chart/${encodeURIComponent(symbol)}?range=${cfg.range}&interval=${cfg.yi}&includePrePost=false`, 12000)
  const r = d?.chart?.result?.[0]
  const q = r?.indicators.quote[0]
  if (!r?.timestamp || !q) return []
  const out: RawCandle[] = []
  r.timestamp.forEach((t, i) => {
    const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i]
    if (ok(o) && ok(h) && ok(l) && ok(c)) out.push({ t, o, h, l, c, v: q.volume?.[i] ?? 0 })
  })
  return out
}

// ── BCE (Frankfurter): tipos de cambio diarios de respaldo ──
export async function ecbRates(): Promise<Record<string, number> | null> {
  try {
    const r = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR', { headers: UA, signal: AbortSignal.timeout(8000), cache: 'no-store' })
    if (!r.ok) return null
    const d = (await r.json()) as { rates: Record<string, number> }
    return d.rates
  } catch {
    return null
  }
}
