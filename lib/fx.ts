// Conversión de divisas a euros. Las cotizaciones de los activos vienen en su
// moneda (USD, GBP, JPY…) y toda la contabilidad del simulador es en euros.
// Fuente: tipos de referencia del BCE vía Frankfurter (gratuito, sin clave).

/** Euros por unidad de moneda si la fuente no responde (BCE, octubre 2026) */
const STATIC_EUR_PER: Record<string, number> = {
  EUR: 1,
  USD: 0.861,
  GBP: 1.178,
  JPY: 0.00561,
  CHF: 1.068,
  AUD: 0.62,
  CAD: 0.623,
  NZD: 0.498,
  HKD: 0.113,
  SEK: 0.089,
  NOK: 0.093,
  DKK: 0.134,
  BRL: 0.179,
  MXN: 0.049,
  SGD: 0.695,
  ZAR: 0.049,
}

export type FxTable = Record<string, number>

const TTL_MS = 6 * 3_600_000
let cache: { table: FxTable; until: number } | null = null

/** Tabla "euros por unidad de moneda" (servidor; caché de 6 h) */
export async function getFxTable(): Promise<FxTable> {
  if (cache && cache.until > Date.now()) return cache.table
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR', { signal: AbortSignal.timeout(4000), cache: 'no-store' })
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as { rates: Record<string, number> }
    const table: FxTable = { ...STATIC_EUR_PER, EUR: 1 }
    for (const [cur, perEur] of Object.entries(data.rates)) {
      if (perEur > 0) table[cur] = 1 / perEur
    }
    cache = { table, until: Date.now() + TTL_MS }
    return table
  } catch {
    // Reintenta en 10 min; mientras, último valor bueno o tabla estática
    const table = cache?.table ?? STATIC_EUR_PER
    cache = { table, until: Date.now() + 10 * 60_000 }
    return table
  }
}

/** Euros por unidad de `currency` */
export function eurPer(currency: string, table: FxTable): number {
  return table[currency] ?? STATIC_EUR_PER[currency] ?? 1
}
