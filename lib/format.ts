// Formato español: coma decimal, punto de miles, € detrás.
const NF2 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' } as Intl.NumberFormatOptions)
const NF4 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4, useGrouping: 'always' } as Intl.NumberFormatOptions)
const NF0 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' } as Intl.NumberFormatOptions)

const MINUS = '−'

export const f2 = (n: number) => NF2.format(n)
export const f0 = (n: number) => NF0.format(n)

/** 1.250,00 € */
export const fe = (n: number) => (n < 0 ? MINUS : '') + NF2.format(Math.abs(n)) + ' €'

/** +38,10 € / −12,00 € */
export const fes = (n: number) => (n >= 0 ? '+' : MINUS) + NF2.format(Math.abs(n)) + ' €'

/** ▲ +1,24 % / ▼ −0,87 % */
export const fpct = (n: number) => (n >= 0 ? '▲ +' : '▼ ' + MINUS) + NF2.format(Math.abs(n)) + ' %'

/** +1,24 % sin flecha */
export const fpctPlain = (n: number) => (n >= 0 ? '+' : MINUS) + NF2.format(Math.abs(n)) + ' %'

const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'C$', AUD: 'A$', HKD: 'HK$' }

/** Precio en la moneda del activo con decimales adaptados al tamaño */
export function fprice(price: number, currency = 'USD', forex = false): string {
  const abs = Math.abs(price)
  let s: string
  if (forex || abs < 2) s = NF4.format(price)
  else if (abs >= 10000) s = NF0.format(price)
  else s = NF2.format(price)
  if (forex) return s
  return `${s} ${SYMBOL[currency] ?? currency}`
}

/** Participaciones: hasta 4 decimales sin ceros sobrantes */
export function fshares(n: number): string {
  const d = n >= 100 ? 2 : n >= 1 ? 4 : 6
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: d }).format(n)
}

/** Volumen compacto: 48,2 M */
export function fcompact(n: number): string {
  if (n >= 1e9) return NF2.format(n / 1e9).replace(/,?0+$/, '') + ' mil M'
  if (n >= 1e6) return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(n / 1e6) + ' M'
  if (n >= 1e3) return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(n / 1e3) + ' mil'
  return NF0.format(n)
}

/** "3 h 12 min" / "45 min" hasta una fecha futura */
export function fwait(untilIso: string | null): string {
  if (!untilIso) return ''
  const ms = new Date(untilIso).getTime() - Date.now()
  if (ms <= 0) return 'ya'
  const m = Math.ceil(ms / 60000)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm ? `${h} h ${rm} min` : `${h} h`
}

/** "4 d 7 h" hasta una fecha */
export function fcountdown(untilIso: string): string {
  const ms = Math.max(0, new Date(untilIso).getTime() - Date.now())
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  return d > 0 ? `${d} d ${h} h` : `${h} h`
}

/** "2 oct" o "Hoy · 15:42" */
export function fdate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return 'Hoy · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
