// Apertura y cierre del día de cada bolsa, como instantes reales (para enseñarlos en la hora local de quien mira).
// Usa los horarios de market-hours.ts; el cambio de hora de cada país sale bien porque se calcula en su zona.
import { SESSIONS } from './market-hours'

/** Diferencia entre la hora de una zona y la UTC en ese instante (ms) */
export function tzOffset(d: Date, tz: string) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(d)
  const g = (k: string) => Number(p.find(x => x.type === k)?.value ?? 0)
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'), g('second')) - Math.floor(d.getTime() / 1000) * 1000
}

/** Apertura y cierre de la sesión del día (en la zona de la bolsa) en que cae `day`. Las pausas de mediodía no cortan el día. */
export function sessionOn(code: string, day: Date): { open: Date; close: Date } | null {
  const s = SESSIONS[code]
  if (!s) return null
  const [y, mo, d] = new Intl.DateTimeFormat('en-CA', { timeZone: s.tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(day).split('-').map(Number)
  const at = (mins: number) => {
    const guess = Date.UTC(y, mo - 1, d, 0, mins)
    return new Date(guess - tzOffset(new Date(guess), s.tz))
  }
  return { open: at(s.parts[0][0]), close: at(s.parts[s.parts.length - 1][1]) }
}
