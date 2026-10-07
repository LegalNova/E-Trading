// Precio simulado determinista para activos sin datos reales (o cuando Finnhub
// no responde). Es una función pura del símbolo y del instante: servidor y
// cliente obtienen exactamente el mismo valor, así que el precio que ve el
// usuario es el mismo al que se ejecuta la operación.

const DAY = 86_400_000
const HOUR = 3_600_000
const MIN = 60_000

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Número pseudoaleatorio estable en [0, 1) para una clave */
function unit(key: string): number {
  return hash(key) / 4294967296
}

/** Nivel diario (±3 %) interpolado para que el precio sea continuo entre días */
function dayLevel(symbol: string, t: number): number {
  const d = Math.floor(t / DAY)
  const frac = (t - d * DAY) / DAY
  const a = (unit(`${symbol}:${d}`) - 0.5) * 0.06
  const b = (unit(`${symbol}:${d + 1}`) - 0.5) * 0.06
  return a + (b - a) * frac
}

/** Precio simulado en el instante t */
export function syntheticPrice(symbol: string, base: number, t: number): number {
  const p1 = unit(`${symbol}:a`) * Math.PI * 2
  const p2 = unit(`${symbol}:b`) * Math.PI * 2
  const p3 = unit(`${symbol}:c`) * Math.PI * 2
  const wave =
    0.010 * Math.sin((2 * Math.PI * t) / (6.3 * HOUR) + p1) +
    0.004 * Math.sin((2 * Math.PI * t) / (53 * MIN) + p2) +
    0.0015 * Math.sin((2 * Math.PI * t) / (7 * MIN) + p3)
  return Math.max(base * (1 + dayLevel(symbol, t) + wave), 0.000001)
}

export interface SimQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
  volume: number
  timestamp: number
}

/** Cotización completa simulada (apertura = cierre anterior a las 00:00 UTC) */
export function syntheticQuote(symbol: string, base: number, now = Date.now()): SimQuote {
  const dayStart = Math.floor(now / DAY) * DAY
  const prevClose = syntheticPrice(symbol, base, dayStart)
  const price = syntheticPrice(symbol, base, now)
  let high = Math.max(prevClose, price)
  let low = Math.min(prevClose, price)
  for (let t = dayStart; t < now; t += 15 * MIN) {
    const v = syntheticPrice(symbol, base, t)
    if (v > high) high = v
    if (v < low) low = v
  }
  const dayFrac = (now - dayStart) / DAY
  const volume = Math.round((200_000 + unit(`${symbol}:v`) * 4_800_000) * dayFrac)
  return {
    symbol,
    price,
    change: price - prevClose,
    changePercent: ((price - prevClose) / prevClose) * 100,
    high,
    low,
    open: prevClose,
    prevClose,
    volume,
    timestamp: now,
  }
}

/**
 * Serie de `points` valores que termina exactamente en `endPrice`.
 * Si se pasa `startPrice`, la serie se corrige linealmente para empezar ahí
 * (útil para 1D: empieza en el cierre anterior).
 */
export function syntheticSeries(
  symbol: string,
  base: number,
  spanMs: number,
  points: number,
  endPrice: number,
  startPrice?: number,
  now = Date.now(),
): number[] {
  const raw: number[] = []
  for (let i = 0; i < points; i++) {
    const t = now - spanMs + (spanMs * i) / (points - 1)
    raw.push(syntheticPrice(symbol, base, t))
  }
  const last = raw[raw.length - 1]
  const scaled = raw.map(v => (v / last) * endPrice)
  if (startPrice === undefined) return scaled
  const delta = startPrice - scaled[0]
  return scaled.map((v, i) => v + delta * (1 - i / (points - 1)))
}

export const PERIODS = {
  '1D': { span: DAY, points: 48 },
  '1S': { span: 7 * DAY, points: 56 },
  '1M': { span: 30 * DAY, points: 60 },
  '3M': { span: 90 * DAY, points: 60 },
  '1A': { span: 365 * DAY, points: 73 },
  'Todo': { span: 5 * 365 * DAY, points: 90 },
} as const

export type Period = keyof typeof PERIODS
export const PERIOD_KEYS = Object.keys(PERIODS) as Period[]
