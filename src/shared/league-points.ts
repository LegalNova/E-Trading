// Puntos de la liga, zonas de ascenso y descenso y orden de la clasificación (lógica pura, con pruebas en tests/league-points.test.ts).
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

// ── Ascensos y descensos (en proporción al tamaño del grupo) ─────
/** Grupo completo: 30 personas, suben 7 y bajan 5 (puestos 26–30) */
export const FULL_GROUP = 30
export const FULL_PROMOTE = 7
export const FULL_DEMOTE = 5

/**
 * Zonas de ascenso y descenso de un grupo de `n` personas. Con el grupo lleno, suben las 7 primeras y bajan las 5
 * últimas; con menos gente, en proporción (docs/02-gamificacion.md): sin esto, en un grupo de 6 subían todas las que
 * tenían XP y nunca bajaba nadie. Sube siempre al menos 1; no baja nadie en grupos de menos de 6.
 * `demoteFrom` = primer puesto que baja (n + 1 si no baja nadie).
 */
export function leagueZones(n: number) {
  const size = Math.max(0, Math.floor(n))
  if (!size) return { promoteTop: 0, demoteFrom: 1 }
  const up = Math.max(1, Math.round((size * FULL_PROMOTE) / FULL_GROUP))
  const down = Math.min(Math.floor((size * FULL_DEMOTE) / FULL_GROUP), size - up)
  return { promoteTop: up, demoteFrom: size - down + 1 }
}

/** Resultado de la semana: sube quien queda en zona de ascenso con algo de XP (y no está ya arriba del todo);
 *  baja quien queda en zona de descenso (salvo en la primera división). */
export function weekOutcome(rank: number, n: number, weeklyXp: number, division: number, divisions: number): 'UP' | 'DOWN' | 'STAY' {
  const z = leagueZones(n)
  if (rank <= z.promoteTop && weeklyXp > 0 && division < divisions) return 'UP'
  if (rank >= z.demoteFrom && division > 1) return 'DOWN'
  return 'STAY'
}

/** Orden de la clasificación: más puntos; con empate, más XP; luego quien entró antes en la liga esa semana
 *  (y, por último, el identificador: el orden nunca depende de cómo devuelva las filas la base de datos) */
export function byStanding(a: { score: number; weeklyXp: number; joinedAt: number; userId: string }, b: { score: number; weeklyXp: number; joinedAt: number; userId: string }) {
  return b.score - a.score || b.weeklyXp - a.weeklyXp || a.joinedAt - b.joinedAt || (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0)
}

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
