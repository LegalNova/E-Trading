// Puntos de la liga (lógica pura, con pruebas en tests/league-points.test.ts).
// Puntos = XP de la semana + puntos de inversión. Inversión: +10 por cada +1 % de rentabilidad semanal y −10 por cada −1 %,
// con tope de ±100. Cartera concentrada (más del 40 % en una sola acción): las ganancias valen la mitad. Total ≥ 0.
import { dayOf } from './time'

/** Puntos por cada 1 % de rentabilidad semanal */
export const PTS_PER_PCT = 10
/** Tope de puntos de inversión, a favor y en contra (un 10 % de rentabilidad) */
export const PTS_CAP = 100

/** Puntos de inversión de la semana a partir de la rentabilidad (en %) */
export function tradePoints(returnPct: number, concentrated: boolean) {
  let pts = Math.round(returnPct * PTS_PER_PCT)
  if (pts > 0 && concentrated) pts = Math.round(pts / 2)
  return Math.max(-PTS_CAP, Math.min(PTS_CAP, pts))
}

/** Rentabilidad de la semana en %: (valor ahora − base − entradas de dinero) / (base + entradas) */
export function weekReturnPct(start: number, now: number, flows: number) {
  const base = start + Math.max(0, flows)
  if (!(base > 0)) return 0
  const r = ((now - start - flows) / base) * 100
  // Salto imposible para una semana (datos raros): no puntúa antes que puntuar mal
  return Number.isFinite(r) && Math.abs(r) <= 50 ? Math.round(r * 100) / 100 : 0
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
