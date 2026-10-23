// Fechas «de calendario» en la zona horaria del usuario (la racha y los objetivos cuentan por día local)
export const DAY_MS = 86_400_000

export function dayOf(t: number | Date = Date.now(), tz = 'Europe/Madrid'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t))
}

export const addDays = (ymd: string, n: number) => new Date(Date.parse(ymd + 'T12:00:00Z') + n * DAY_MS).toISOString().slice(0, 10)

/** Lunes de la semana (clave de la liga) */
export function weekOf(t: number | Date = Date.now(), tz = 'Europe/Madrid'): string {
  const d = dayOf(t, tz)
  const wd = (new Date(d + 'T12:00:00Z').getUTCDay() + 6) % 7
  return addDays(d, -wd)
}
