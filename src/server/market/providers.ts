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

// ── Datos de empresa (capitalización, PER, dividendo, BPA, beta) ──
// quoteSummary y v7/quote piden una cookie de Yahoo y un «crumb» ligado a ella: la cookie A3 la da fc.yahoo.com
// (responde 404, pero con la cookie) y el crumb sale de /v1/test/getcrumb. Se guardan en memoria unas horas.
interface YahooAuth { at: number; cookie: string; crumb: string }
let yahooAuth: YahooAuth | null = null
let yahooAuthRun: Promise<YahooAuth | null> | null = null
let yahooAuthFailedAt = 0
const AUTH_TTL_MS = 6 * 3_600_000

async function getYahooAuth(force = false): Promise<YahooAuth | null> {
  if (!force && yahooAuth && Date.now() - yahooAuth.at < AUTH_TTL_MS) return yahooAuth
  // Si acaba de fallar, no se reintenta en cada petición
  if (!force && Date.now() - yahooAuthFailedAt < 60_000) return null
  yahooAuthRun ??= (async () => {
    try {
      const r = await fetch('https://fc.yahoo.com/', { headers: UA, redirect: 'manual', signal: AbortSignal.timeout(6000), cache: 'no-store' })
      const cookie = r.headers.getSetCookie().map(c => c.split(';')[0]).filter(c => c.startsWith('A3=')).join('; ')
      if (!cookie) throw new Error('sin cookie')
      for (const host of HOSTS) {
        const c = await fetch(`${host}/v1/test/getcrumb`, { headers: { ...UA, cookie }, signal: AbortSignal.timeout(6000), cache: 'no-store' }).catch(() => null)
        const crumb = c?.ok ? (await c.text()).trim() : ''
        // El crumb es corto y sin espacios; «Too Many Requests» o un HTML no lo son
        if (crumb && crumb.length < 40 && !/\s|</.test(crumb)) return (yahooAuth = { at: Date.now(), cookie, crumb })
      }
      throw new Error('sin crumb')
    } catch (e) {
      console.error('market/yahoo-auth', String(e).slice(0, 200))
      yahooAuthFailedAt = Date.now()
      return null
    } finally {
      yahooAuthRun = null
    }
  })()
  return yahooAuthRun
}

/** GET con cookie y crumb; si Yahoo dice que el crumb ya no vale (401), se pide otro una vez */
async function getJsonAuth<T>(path: string, ms = 9000): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const auth = await getYahooAuth(attempt > 0)
    if (!auth) return null
    const sep = path.includes('?') ? '&' : '?'
    let unauthorized = false
    for (const host of HOSTS) {
      try {
        const r = await fetch(`${host}${path}${sep}crumb=${encodeURIComponent(auth.crumb)}`, { headers: { ...UA, cookie: auth.cookie }, signal: AbortSignal.timeout(ms), cache: 'no-store' })
        if (r.ok) return (await r.json()) as T
        if (r.status === 401 || r.status === 403) unauthorized = true
        if (r.status === 404) return null
      } catch {
        // probar el otro servidor
      }
    }
    if (!unauthorized) return null
    yahooAuth = null
  }
  return null
}

export interface RawFundamentals {
  symbol: string
  marketCap: number | null
  pe: number | null
  forwardPe: number | null
  /** En %: 2,37 es un 2,37 % (la prevista, la que Yahoo da como principal) */
  dividendYield: number | null
  /** En %: la de los dividendos pagados en los últimos 12 meses */
  trailingYield: number | null
  eps: number | null
  beta: number | null
  /** Moneda de la cotización (GBp, USD…) y moneda en la que la empresa presenta sus cuentas (la del BPA) */
  currency: string | null
  financialCurrency: string | null
  /** Solo fondos: comisión anual en % */
  ter: number | null
}

const fin = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : null)
const pos = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null)
/** Tanto por uno → % */
const pct100 = (n: unknown) => {
  const v = pos(n)
  return v === null ? null : v * 100
}

interface V7Quote { symbol: string; currency?: string; financialCurrency?: string; marketCap?: number; trailingPE?: number; forwardPE?: number; epsTrailingTwelveMonths?: number; dividendYield?: number; trailingAnnualDividendYield?: number }
const V7_FIELDS = 'marketCap,trailingPE,forwardPE,epsTrailingTwelveMonths,dividendYield,trailingAnnualDividendYield,financialCurrency,currency'

/** Datos de empresa de hasta 50 acciones por petición (v7/quote; no trae la beta) */
export async function yahooFundamentalsBatch(symbols: string[]): Promise<RawFundamentals[] | null> {
  if (!symbols.length) return []
  const d = await getJsonAuth<{ quoteResponse?: { result?: V7Quote[] } }>(`/v7/finance/quote?symbols=${symbols.map(encodeURIComponent).join(',')}&fields=${V7_FIELDS}`, 10000)
  if (!d?.quoteResponse?.result) return null
  return d.quoteResponse.result.map(r => ({
    symbol: r.symbol,
    marketCap: pos(r.marketCap),
    pe: pos(r.trailingPE),
    forwardPe: pos(r.forwardPE),
    dividendYield: pos(r.dividendYield),
    trailingYield: pct100(r.trailingAnnualDividendYield),
    eps: fin(r.epsTrailingTwelveMonths),
    beta: null,
    currency: r.currency ?? null,
    financialCurrency: r.financialCurrency ?? null,
    ter: null,
  }))
}

type Raw = { raw?: number } | undefined
interface SummaryResp {
  quoteSummary?: {
    result?: {
      summaryDetail?: { marketCap?: Raw; trailingPE?: Raw; forwardPE?: Raw; dividendYield?: Raw; trailingAnnualDividendYield?: Raw; yield?: Raw; beta?: Raw; currency?: string }
      defaultKeyStatistics?: { trailingEps?: Raw; beta?: Raw; beta3Year?: Raw; annualReportExpenseRatio?: Raw }
      financialData?: { financialCurrency?: string }
      price?: { currency?: string; marketCap?: Raw }
      fundProfile?: { feesExpensesInvestment?: { annualReportExpenseRatio?: Raw } }
    }[]
  }
}

/** Ficha completa de una acción o un ETF (quoteSummary): incluye la beta y, en los fondos, la comisión anual */
export async function yahooSummary(symbol: string, isFund: boolean): Promise<RawFundamentals | null> {
  const modules = isFund ? 'summaryDetail,defaultKeyStatistics,price,fundProfile' : 'summaryDetail,defaultKeyStatistics,financialData,price'
  const d = await getJsonAuth<SummaryResp>(`/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`, 8000)
  const r = d?.quoteSummary?.result?.[0]
  if (!r) return null
  const s = r.summaryDetail ?? {}
  const k = r.defaultKeyStatistics ?? {}
  // Yahoo da la rentabilidad en tanto por uno (0,0237); aquí se guarda en % (2,37)
  const dy = pos(s.dividendYield?.raw) ?? (isFund ? pos(s.yield?.raw) : null)
  const ter = pos(r.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio?.raw) ?? pos(k.annualReportExpenseRatio?.raw)
  return {
    symbol,
    marketCap: pos(s.marketCap?.raw) ?? pos(r.price?.marketCap?.raw),
    pe: pos(s.trailingPE?.raw),
    forwardPe: pos(s.forwardPE?.raw),
    dividendYield: dy === null ? null : dy * 100,
    trailingYield: pct100(s.trailingAnnualDividendYield?.raw),
    eps: isFund ? null : fin(k.trailingEps?.raw),
    beta: fin(s.beta?.raw) ?? fin(k.beta?.raw) ?? fin(k.beta3Year?.raw),
    currency: r.price?.currency ?? s.currency ?? null,
    financialCurrency: r.financialData?.financialCurrency ?? null,
    ter: ter === null ? null : ter * 100,
  }
}
