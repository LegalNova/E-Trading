// Formato de cifras según el idioma. El dinero llega como texto decimal (D-021).
const INTL: Record<string, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }

const cache = new Map<string, Intl.NumberFormat>()
function nf(locale: string, min: number, max: number): Intl.NumberFormat {
  const key = `${locale}:${min}:${max}`
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(INTL[locale] ?? 'es-ES', { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: 'always' } as Intl.NumberFormatOptions)
    cache.set(key, f)
  }
  return f
}

export const toNum = (v: string | number): number => (typeof v === 'number' ? v : Number(v))
const MINUS = '−'

/** En inglés el símbolo va delante (€10,482.35); en castellano y catalán, detrás (10.482,35 €) */
export function withSymbol(amount: string, currency: 'EUR' | 'USD', locale: string): string {
  const sym = currency === 'EUR' ? '€' : '$'
  return locale === 'en' ? sym + amount : amount + ' ' + sym
}

/** 10.482,35 € · −12,00 $ */
export function money(v: string | number, currency: 'EUR' | 'USD' = 'EUR', locale = 'es'): string {
  const n = toNum(v)
  const s = nf(locale, 2, 2).format(Math.abs(n))
  return (n < 0 ? MINUS : '') + withSymbol(s, currency, locale)
}

/** +38,10 € / −12,00 € */
export function signedMoney(v: string | number, currency: 'EUR' | 'USD' = 'EUR', locale = 'es'): string {
  const n = toNum(v)
  return (n >= 0 ? '+' : MINUS) + money(Math.abs(n), currency, locale)
}

/** 0,84 % (sin signo) */
export function pct(v: number, locale = 'es', digits = 2): string {
  return nf(locale, digits, digits).format(Math.abs(v)) + ' %'
}

/** ▲ +0,84 % / ▼ −1,12 % */
export function arrowPct(v: number, locale = 'es'): string {
  // Lo que redondea a 0,00 % no sube ni baja
  if (Math.abs(v) < 0.005) return pct(0, locale)
  return (v >= 0 ? '▲ +' : '▼ ' + MINUS) + pct(v, locale)
}

/** Número con decimales adaptados al tamaño (precios y cantidades) */
export function num(v: string | number, locale = 'es', maxDigits?: number): string {
  const n = toNum(v)
  const abs = Math.abs(n)
  const d = maxDigits ?? (abs >= 10000 ? 0 : abs >= 2 ? 2 : abs >= 0.01 ? 4 : 8)
  return (n < 0 ? MINUS : '') + nf(locale, Math.min(d, 2), d).format(abs)
}

/** Precio de un activo en su moneda */
export function price(v: string | number, currency: 'EUR' | 'USD', locale = 'es', fx = false): string {
  const n = toNum(v)
  if (fx) return nf(locale, 4, 4).format(n)
  return withSymbol(num(n, locale), currency, locale)
}

/** Cantidad de participaciones sin ceros sobrantes */
export function qty(v: string | number, locale = 'es'): string {
  const n = toNum(v)
  const d = n >= 100 ? 2 : n >= 0.01 ? 4 : 8
  return new Intl.NumberFormat(INTL[locale] ?? 'es-ES', { maximumFractionDigits: d }).format(n)
}

/** 4 d 7 h · 3 h 12 min · 42 min */
export function countdown(untilIso: string, now = Date.now()): string {
  const ms = Math.max(0, new Date(untilIso).getTime() - now)
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (d > 0) return `${d} d ${h} h`
  if (h > 0) return `${h} h ${m} min`
  return `${m} min`
}

/** h:mm:ss */
export function clock(untilIso: string, now = Date.now()): string {
  const s = Math.max(0, Math.floor((new Date(untilIso).getTime() - now) / 1000))
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Redondeo a 2 decimales como texto (para importes) */
export const fix2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2)
/** Redondeo a 8 decimales como texto (para cantidades) */
export const fix8 = (n: number) => (Math.round(n * 1e8) / 1e8).toFixed(8)
/** Precio con decimales suficientes para tres cifras significativas aunque valga 0,000004 (memecoins); 4 si vale 1 o más */
export const fixPrice = (n: number) => {
  const a = Math.abs(n)
  if (!a) return '0'
  if (a >= 1000) return n.toFixed(2)
  if (a >= 1) return n.toFixed(4)
  return n.toFixed(Math.min(12, Math.max(6, 2 - Math.floor(Math.log10(a)))))
}
