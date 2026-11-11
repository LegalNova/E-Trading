// Regalo diario: el plan de los 30 regalos, el cofre semanal de después y el cálculo del día.
// Sin base de datos ni servidor: lo usan src/server/game/daily.ts y los tests (tests/daily.test.ts).
//  · El calendario empieza el día en que se abre el primer regalo (así nadie empieza con días perdidos,
//    tampoco quien ya tenía cuenta antes de que existiera). Desde ahí, un regalo por día de calendario.
//  · Un día sin entrar se pierde. Solo se abre el de hoy.
//  · Tras los 30 días, un cofre pequeño cada semana (semana de Madrid, la de la liga).
import type { DailyItemT, DailyKindT } from './contract'

export const DAILY_DAYS = 30
/** Días grandes */
export const BIG_DAYS = [7, 14, 21, 30] as const
/** Si el premio no le sirve (vidas llenas o ilimitadas, protectores al máximo), se cambia por gemas */
export const SWAP_GEMS: Partial<Record<DailyKindT, number>> = { LIVES: 20, FREEZE: 40 }

const it = (kind: DailyKindT, amount: number): DailyItemT => ({ kind, amount })

/**
 * Los 30 regalos. Equilibrio con la economía actual:
 *  · Efectivo: 10.000 € en total (lo mismo que el saldo inicial de Free; Plus y Max empiezan con 50.000 €).
 *    Entra como aportación (addFlow): no cuenta como rentabilidad en la liga.
 *  · Gemas: 580 en total (un protector de racha cuesta 200 y recargar las vidas, 350; los objetivos del día dan 10).
 *  · XP: 260 en total, y no suma a la liga de la semana (solo al nivel): la liga se gana aprendiendo, no entrando.
 *  · Protectores: 4 (como mucho se pueden tener 2; si ya tiene 2, se cambian por gemas).
 */
export const DAILY_PLAN: readonly (readonly DailyItemT[])[] = [
  [it('CASH', 1000)], // 1: para empezar a invertir
  [it('GEMS', 20)],
  [it('LIVES', 5)],
  [it('XP', 30)],
  [it('GEMS', 25)],
  [it('FREEZE', 1)],
  [it('CASH', 1500), it('GEMS', 50)], // 7: grande
  [it('GEMS', 25)],
  [it('LIVES', 5)],
  [it('CASH', 500)],
  [it('XP', 40)],
  [it('GEMS', 30)],
  [it('FREEZE', 1)],
  [it('CASH', 1500), it('GEMS', 60)], // 14: grande
  [it('LIVES', 5)],
  [it('GEMS', 30)],
  [it('XP', 50)],
  [it('CASH', 500)],
  [it('GEMS', 35)],
  [it('LIVES', 5)],
  [it('CASH', 2000), it('GEMS', 80)], // 21: grande
  [it('FREEZE', 1)],
  [it('GEMS', 40)],
  [it('XP', 60)],
  [it('LIVES', 5)],
  [it('GEMS', 40)],
  [it('CASH', 500)],
  [it('XP', 80)],
  [it('GEMS', 45)],
  [it('CASH', 2500), it('GEMS', 100), it('FREEZE', 1)], // 30: el más grande
]

/** Regalo del día n (1…30) */
export const giftOf = (n: number): DailyItemT[] => [...(DAILY_PLAN[n - 1] ?? [])]
export const isBig = (n: number) => (BIG_DAYS as readonly number[]).includes(n)

/** Cofre semanal (después de los 30 días): va rotando cada semana */
const CHESTS: readonly (readonly DailyItemT[])[] = [[it('GEMS', 30)], [it('CASH', 500)], [it('FREEZE', 1)], [it('XP', 40)]]
export function chestOf(weekKey: string): DailyItemT[] {
  const weeks = Math.floor(Date.parse(weekKey + 'T12:00:00Z') / (7 * 86_400_000))
  return [...CHESTS[((weeks % CHESTS.length) + CHESTS.length) % CHESTS.length]]
}

// ── Días ────────────────────────────────────────────────
/** 2026-11-11 ↔ 20261111 (los contadores del estado de juego son números) */
export const ymdNum = (ymd: string) => Number(ymd.replaceAll('-', ''))
export const numYmd = (n: number) => {
  const s = String(n)
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

/** Día del calendario (1 = el día de inicio). Nunca menos de 1. */
export function dayIndex(start: string, today: string): number {
  const d = Math.round((Date.parse(today + 'T12:00:00Z') - Date.parse(start + 'T12:00:00Z')) / 86_400_000)
  return Number.isFinite(d) ? Math.max(1, d + 1) : 1
}

export const isOpened = (mask: number, n: number) => n >= 1 && n <= DAILY_DAYS && ((mask >>> (n - 1)) & 1) === 1
export const withOpened = (mask: number, n: number) => (mask | (1 << (n - 1))) >>> 0

export type DayStatus = 'OPENED' | 'TODAY' | 'MISSED' | 'UPCOMING'
/** Estado de cada uno de los 30 días. `day` es el día de hoy en el calendario (puede ser > 30). */
export function calendar(day: number, mask: number): DayStatus[] {
  return Array.from({ length: DAILY_DAYS }, (_, i) => {
    const n = i + 1
    if (isOpened(mask, n)) return 'OPENED'
    if (n === day) return 'TODAY'
    return n < day ? 'MISSED' : 'UPCOMING'
  })
}

// ── Premios que no sirven ───────────────────────────────
export interface WalletState { unlimitedLives: boolean; lives: number; livesMax: number; freezes: number; maxFreezes: number }
export type Granted = DailyItemT & { from?: DailyKindT }

/** Lo que se da de verdad: las vidas (si son ilimitadas o están llenas) y los protectores (si ya tiene el máximo) se cambian por gemas */
export function resolveItems(items: readonly DailyItemT[], s: WalletState): Granted[] {
  let freezes = s.freezes
  return items.map((x): Granted => {
    if (x.kind === 'LIVES' && (s.unlimitedLives || s.lives >= s.livesMax)) return { kind: 'GEMS', amount: SWAP_GEMS.LIVES!, from: 'LIVES' }
    if (x.kind === 'FREEZE') {
      if (freezes >= s.maxFreezes) return { kind: 'GEMS', amount: SWAP_GEMS.FREEZE!, from: 'FREEZE' }
      freezes += x.amount
    }
    return { ...x }
  })
}

/** Lo que se enseña antes de abrir: con vidas ilimitadas (Plus y Max), la recarga ya se enseña como gemas */
export const previewItems = (items: readonly DailyItemT[], unlimitedLives: boolean): DailyItemT[] =>
  items.map(x => (x.kind === 'LIVES' && unlimitedLives ? { kind: 'GEMS', amount: SWAP_GEMS.LIVES! } : { ...x }))
