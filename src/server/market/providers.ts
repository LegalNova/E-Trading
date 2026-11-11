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
      // Siempre frente al cierre anterior que se enseña: en las cripto Yahoo da el % de las últimas 24 h, pero el
      // cierre de las 00:00 UTC, y la ficha salía con «▼ −330 €» cuando el precio había subido
      changePct: ((m.regularMarketPrice - prev) / prev) * 100,
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

/**
 * Intervalos del gráfico: qué se pide a Yahoo para cada botón, comprobado con datos reales (nov. 2026).
 * - `range=max` NO vale con 1wk ni 1mo: Yahoo devuelve velas TRIMESTRALES (dataGranularity 3mo). Por eso
 *   el semanal pide 10 años y el mensual, desde 1970 (period1=0), que sí da velas de un mes.
 * - Límites de Yahoo: 1m, como mucho 7 días; 5m y 15m, 60 días; 60m, 730 días.
 * - Los periodos son algo más largos que lo que se enseña al abrir: lo de antes sirve para los indicadores
 *   (la media de 200) y para desplazarse hacia atrás. Las órdenes pendientes usan las de 5 min (un mes).
 * `step`: segundos de cada vela (aprox. en semanas y meses). `gran`: lo que Yahoo dice que ha devuelto.
 */
export const INTERVALS = {
  '1m': { yi: '1m', q: 'range=5d', step: 60, gran: ['1m'] },
  '5m': { yi: '5m', q: 'range=1mo', step: 300, gran: ['5m'] },
  '15m': { yi: '15m', q: 'range=1mo', step: 900, gran: ['15m'] },
  '1h': { yi: '60m', q: 'range=6mo', step: 3600, gran: ['1h', '60m'] },
  '1d': { yi: '1d', q: 'range=5y', step: 86_400, gran: ['1d'] },
  '1w': { yi: '1wk', q: 'range=10y', step: 7 * 86_400, gran: ['1wk'] },
  '1M': { yi: '1mo', q: 'period1=0', step: 30 * 86_400, gran: ['1mo'] },
} as const
export type Interval = keyof typeof INTERVALS
export const isInterval = (s: string): s is Interval => Object.hasOwn(INTERVALS, s)

interface ChartResp {
  chart?: {
    result?: {
      meta?: { dataGranularity?: string; exchangeTimezoneName?: string }
      timestamp?: number[]
      indicators: { quote: { open: (number | null)[]; high: (number | null)[]; low: (number | null)[]; close: (number | null)[]; volume?: (number | null)[] }[] }
    }[]
  }
}

export interface RawSeries {
  candles: RawCandle[]
  /** Zona horaria de la bolsa (America/New_York, Europe/Madrid, UTC…) */
  tz: string
  /** Yahoo devolvió otro intervalo del pedido: no se enseña (sería engañoso) */
  mismatch: boolean
}

/** Precio sin el ruido de los float32 de Yahoo (348.6300048828125 → 348.63; un float32 solo tiene unas 7 cifras buenas) */
const p8 = (n: number) => Number(n.toPrecision(7))

/** Fecha local (en la zona de la bolsa) de un instante, como medianoche UTC (lo que el gráfico entiende por «día») */
export function localDay(t: number, tz: string): number {
  let f = dayFmt.get(tz)
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch {
      f = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })
    }
    dayFmt.set(tz, f)
  }
  const [y, m, d] = f.format(new Date(t * 1000)).split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 1000
}
const dayFmt = new Map<string, Intl.DateTimeFormat>()

/** Periodo de una vela diaria, semanal o mensual: el día, el lunes de esa semana o el día 1 del mes (fecha de la bolsa) */
export function periodStart(interval: Interval, t: number, tz: string): number {
  const day = localDay(t, tz)
  if (interval === '1w') return day - ((new Date(day * 1000).getUTCDay() + 6) % 7) * 86_400
  if (interval === '1M') {
    const d = new Date(day * 1000)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 1000
  }
  return day
}

/**
 * Velas reales (con volumen) de cualquier activo del catálogo, limpias:
 * - sin huecos (Yahoo manda velas vacías en las pausas) y sin tiempos repetidos;
 * - Yahoo añade al final un punto suelto con el último precio (21:00 tras la vela de 20:30, o el martes tras la
 *   vela de la semana): se funde con la vela a la que pertenece en vez de salir como una vela de más;
 * - t sigue siendo el instante real (segundos UNIX); el gráfico lo pasa a hora de Madrid o a fecha de la bolsa.
 */
export async function yahooSeries(symbol: string, interval: Interval): Promise<RawSeries | null> {
  const cfg = INTERVALS[interval]
  const q = cfg.q === 'period1=0' ? `period1=0&period2=${Math.floor(Date.now() / 1000)}` : cfg.q
  const d = await getJson<ChartResp>(`/v8/finance/chart/${encodeURIComponent(symbol)}?${q}&interval=${cfg.yi}&includePrePost=false`, 12000)
  const r = d?.chart?.result?.[0]
  if (!r) return null
  const tz = r.meta?.exchangeTimezoneName || 'UTC'
  const gran = r.meta?.dataGranularity
  if (gran && !(cfg.gran as readonly string[]).includes(gran)) {
    console.error('market/candles', symbol, interval, 'Yahoo devolvió', gran)
    return { candles: [], tz, mismatch: true }
  }
  const qq = r.indicators.quote[0]
  if (!r.timestamp || !qq) return { candles: [], tz, mismatch: false }
  const daily = cfg.step >= 86_400
  const out: RawCandle[] = []
  let prevKey = -Infinity
  r.timestamp.forEach((t, i) => {
    const o = qq.open[i], h = qq.high[i], l = qq.low[i], c = qq.close[i]
    if (!(ok(o) && ok(h) && ok(l) && ok(c))) return
    const v = qq.volume?.[i] ?? 0
    // Diario o más: cada vela es de su día, semana o mes (en la fecha de la bolsa). Intradía: a menos de un intervalo de la anterior
    const key = daily ? periodStart(interval, t, tz) : t
    const last = out[out.length - 1]
    if (last && (daily ? key === prevKey : key - prevKey < cfg.step)) {
      // Mismo periodo que la vela anterior: se funde (máximo, mínimo y cierre al día; el volumen ya lo traía)
      last.h = Math.max(last.h, p8(h))
      last.l = Math.min(last.l, p8(l))
      last.c = p8(c)
      last.v = Math.max(last.v, v)
      return
    }
    prevKey = key
    out.push({ t, o: p8(o), h: p8(h), l: p8(l), c: p8(c), v })
  })
  return { candles: out, tz, mismatch: false }
}

/** Velas reales (con volumen) de cualquier activo del catálogo */
export async function yahooCandles(symbol: string, interval: Interval): Promise<RawCandle[]> {
  return (await yahooSeries(symbol, interval))?.candles ?? []
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
  /** Solo en la ficha completa: perfil de la empresa, del fondo o de la cripto */
  profile?: RawProfile
}

export interface RawProfile {
  /** Clave de Yahoo (technology, financial-services…) y nombre en inglés */
  sectorKey: string | null
  industryKey: string | null
  industry: string | null
  /** Descripción de Yahoo (en inglés), recortada a unas frases */
  summary: string | null
  employees: number | null
  /** Volumen medio diario de los últimos 3 meses */
  avgVolume: number | null
  /** Fondos: patrimonio (en la moneda del fondo), gestora, categoría y fecha de creación */
  totalAssets: number | null
  family: string | null
  category: string | null
  inception: string | null
  /** Cripto: monedas en circulación y máximo histórico (en la moneda de la cotización) */
  circulating: number | null
  allTimeHigh: number | null
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
      summaryDetail?: {
        marketCap?: Raw; trailingPE?: Raw; forwardPE?: Raw; dividendYield?: Raw; trailingAnnualDividendYield?: Raw; yield?: Raw; beta?: Raw; currency?: string
        averageVolume?: Raw; totalAssets?: Raw; circulatingSupply?: Raw; allTimeHigh?: Raw
      }
      defaultKeyStatistics?: { trailingEps?: Raw; beta?: Raw; beta3Year?: Raw; annualReportExpenseRatio?: Raw; totalAssets?: Raw; fundFamily?: string; category?: string | null; fundInceptionDate?: Raw }
      financialData?: { financialCurrency?: string }
      price?: { currency?: string; marketCap?: Raw }
      fundProfile?: { family?: string; categoryName?: string | null; feesExpensesInvestment?: { annualReportExpenseRatio?: Raw } }
      summaryProfile?: { sectorKey?: string; industryKey?: string; industryDisp?: string; industry?: string; longBusinessSummary?: string; description?: string; fullTimeEmployees?: number }
    }[]
  }
}

const str = (s: unknown, max = 80) => (typeof s === 'string' && s.trim() && s.length <= max ? s.trim() : null)

/** Las primeras frases de una descripción larga (como mucho ~480 caracteres, sin cortar una frase) */
function firstSentences(s: unknown, max = 480): string | null {
  if (typeof s !== 'string' || s.trim().length < 20) return null
  const text = s.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('. '))
  return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/** Ficha completa (quoteSummary): beta, comisión de los fondos y el perfil (sector, industria, descripción, empleados…) */
export async function yahooSummary(symbol: string, kind: 'STOCK' | 'ETF' | 'CRYPTO'): Promise<RawFundamentals | null> {
  const isFund = kind === 'ETF'
  const modules =
    kind === 'ETF' ? 'summaryDetail,defaultKeyStatistics,price,fundProfile,summaryProfile' : kind === 'CRYPTO' ? 'summaryDetail,price,summaryProfile' : 'summaryDetail,defaultKeyStatistics,financialData,price,summaryProfile'
  const d = await getJsonAuth<SummaryResp>(`/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`, 8000)
  const r = d?.quoteSummary?.result?.[0]
  if (!r) return null
  const s = r.summaryDetail ?? {}
  const k = r.defaultKeyStatistics ?? {}
  const sp = r.summaryProfile ?? {}
  // Yahoo da la rentabilidad en tanto por uno (0,0237); aquí se guarda en % (2,37)
  const dy = pos(s.dividendYield?.raw) ?? (isFund ? pos(s.yield?.raw) : null)
  const ter = pos(r.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio?.raw) ?? pos(k.annualReportExpenseRatio?.raw)
  const inception = pos(k.fundInceptionDate?.raw)
  return {
    symbol,
    marketCap: isFund ? null : (pos(s.marketCap?.raw) ?? pos(r.price?.marketCap?.raw)),
    pe: kind === 'STOCK' ? pos(s.trailingPE?.raw) : null,
    forwardPe: kind === 'STOCK' ? pos(s.forwardPE?.raw) : null,
    dividendYield: dy === null || kind === 'CRYPTO' ? null : dy * 100,
    trailingYield: kind === 'CRYPTO' ? null : pct100(s.trailingAnnualDividendYield?.raw),
    eps: kind === 'STOCK' ? fin(k.trailingEps?.raw) : null,
    beta: kind === 'CRYPTO' ? null : (fin(s.beta?.raw) ?? fin(k.beta?.raw) ?? fin(k.beta3Year?.raw)),
    currency: r.price?.currency ?? s.currency ?? null,
    financialCurrency: r.financialData?.financialCurrency ?? null,
    ter: ter === null ? null : ter * 100,
    profile: {
      sectorKey: kind === 'STOCK' ? str(sp.sectorKey, 40) : null,
      industryKey: kind === 'STOCK' ? str(sp.industryKey, 60) : null,
      industry: kind === 'STOCK' ? str(sp.industryDisp ?? sp.industry, 80) : null,
      summary: firstSentences(sp.longBusinessSummary ?? sp.description),
      employees: kind === 'STOCK' ? pos(sp.fullTimeEmployees) : null,
      avgVolume: pos(s.averageVolume?.raw),
      totalAssets: isFund ? (pos(s.totalAssets?.raw) ?? pos(k.totalAssets?.raw)) : null,
      family: isFund ? str(r.fundProfile?.family ?? k.fundFamily) : null,
      category: isFund ? str(r.fundProfile?.categoryName ?? k.category) : null,
      inception: isFund && inception ? new Date(inception * 1000).toISOString().slice(0, 10) : null,
      circulating: kind === 'CRYPTO' ? pos(s.circulatingSupply?.raw) : null,
      allTimeHigh: kind === 'CRYPTO' ? pos(s.allTimeHigh?.raw) : null,
    },
  }
}
