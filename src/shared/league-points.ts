// Puntos de la liga (lógica pura, con pruebas en tests/league-points.test.ts).
// Puntos = XP de la semana + puntos de inversión. Inversión: +10 por cada +1 % de rentabilidad semanal y −10 por cada −1 %,
// con tope de ±100. Cartera concentrada (más del 40 % en una sola acción): las ganancias valen la mitad. Total ≥ 0.
// Temporada del mes (ligas de amigos): la rentabilidad del mes natural de Madrid con las mismas reglas
// (tope de ±10 % y, con la cartera concentrada, las ganancias cuentan la mitad).
import { addDays, dayOf } from './time'

/** Puntos por cada 1 % de rentabilidad semanal */
export const PTS_PER_PCT = 10
/** Tope de puntos de inversión, a favor y en contra (un 10 % de rentabilidad) */
export const PTS_CAP = 100
/** Tope de la rentabilidad que cuenta en la temporada del mes (el mismo 10 % que la liga semanal) */
export const SEASON_CAP_PCT = PTS_CAP / PTS_PER_PCT

/** Puntos de inversión de la semana a partir de la rentabilidad (en %) */
export function tradePoints(returnPct: number, concentrated: boolean) {
  let pts = Math.round(returnPct * PTS_PER_PCT)
  if (pts > 0 && concentrated) pts = Math.round(pts / 2)
  return Math.max(-PTS_CAP, Math.min(PTS_CAP, pts))
}

/** Rentabilidad en %: (valor ahora − base − entradas de dinero) / (base + entradas).
 *  Un salto mayor que `maxAbs` (datos raros) no puntúa antes que puntuar mal. */
function returnPct(start: number, now: number, flows: number, maxAbs: number) {
  const base = start + Math.max(0, flows)
  if (!(base > 0)) return 0
  const r = ((now - start - flows) / base) * 100
  return Number.isFinite(r) && Math.abs(r) <= maxAbs ? Math.round(r * 100) / 100 : 0
}

/** Rentabilidad de la semana en % */
export const weekReturnPct = (start: number, now: number, flows: number) => returnPct(start, now, flows, 50)

/** Rentabilidad del mes en % (sin tope: el tope se aplica al puntuar, con seasonPct) */
export const monthReturnPct = (start: number, now: number, flows: number) => returnPct(start, now, flows, 100)

/** Lo que cuenta en la temporada: con la cartera concentrada las ganancias valen la mitad; tope de ±10 % */
export function seasonPct(pct: number, concentrated: boolean) {
  const r = pct > 0 && concentrated ? pct / 2 : pct
  return Math.round(Math.max(-SEASON_CAP_PCT, Math.min(SEASON_CAP_PCT, r)) * 100) / 100
}

/** Puntos de la liga: XP de la semana + puntos de inversión (nunca por debajo de 0) */
export const score = (xp: number, tradePts: number) => Math.max(0, xp + tradePts)

/** Instante en que empieza un día en Madrid (00:00 de Madrid, con horario de invierno o de verano).
 *  La semana de la liga acaba el lunes a esta hora. */
export function madridMidnight(ymd: string) {
  const utc = Date.parse(ymd + 'T00:00:00Z')
  for (let h = -3; h <= 1; h++) if (dayOf(utc + h * 3_600_000) === ymd) return new Date(utc + h * 3_600_000)
  return new Date(utc)
}

// ── Meses (hora de Madrid) ──────────────────────────────
/** Mes natural de Madrid: 2026-11 */
export const monthOf = (t: number | Date = Date.now()) => dayOf(t).slice(0, 7)
/** Mes siguiente: 2026-12 → 2027-01 */
export const nextMonth = (month: string) => addDays(`${month}-28`, 7).slice(0, 7)
/** Mes anterior: 2027-01 → 2026-12 */
export const prevMonth = (month: string) => addDays(`${month}-01`, -1).slice(0, 7)
/** Último día del mes: 2026-02 → 2026-02-28 */
export const lastDayOf = (month: string) => addDays(`${nextMonth(month)}-01`, -1)
/** Instante en que empieza el mes en Madrid */
export const monthStart = (month: string) => madridMidnight(`${month}-01`)
