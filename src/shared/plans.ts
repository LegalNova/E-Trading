// Planes de E-Trading (D-053, revisado en docs/curso-v2/06-enganche-y-progresion.md). En la base de datos el plan completo
// se llama PREMIUM y se muestra como «Max».
//   Free: unidades 1–3 completas (la sección «Invierte desde hoy») + las 3 primeras lecciones de cada unidad.
//         Las unidades superadas con la prueba de unidad no gastan plan: se abre gratis la siguiente del camino.
//   Plus: además, u5 y u6 completas (las 5 primeras del camino) + las 5 primeras lecciones de cada unidad.
//   Max: todo.
export type PlanId = 'FREE' | 'PLUS' | 'PREMIUM'

export const PLAN_NAME: Record<PlanId, string> = { FREE: 'Free', PLUS: 'Plus', PREMIUM: 'Max' }
export const tierOf = (p: PlanId) => (p === 'PREMIUM' ? 2 : p === 'PLUS' ? 1 : 0)
export const isPaid = (p: PlanId) => p !== 'FREE'

const FULL_UNITS: Record<PlanId, string[]> = { FREE: ['h1', 'h2', 'h3'], PLUS: ['h1', 'h2', 'h3', 'u5', 'u6'], PREMIUM: [] }
/** Cuántas unidades completas da cada plan (las superadas con la prueba de unidad no cuentan) */
export const FULL_UNIT_COUNT: Record<PlanId, number> = { FREE: 3, PLUS: 5, PREMIUM: Infinity }
const FIRST_LESSONS: Record<PlanId, number> = { FREE: 3, PLUS: 5, PREMIUM: Infinity }
/** Siempre gratis: la clase del stop loss (sigue desbloqueando las órdenes avanzadas; desde la auditoría también las abre u24l3, en la sección 0) */
const ALWAYS_FREE = new Set(['u6l4'])

/**
 * ¿Puede este plan abrir la lección? `index` es la posición dentro de la unidad (0, 1, 2…); los repasos piden la unidad
 * entera. `extra`: unidades completas que ganó esa persona al superar otras con la prueba de unidad.
 */
export function canOpen(plan: PlanId, unitId: string, index: number, isReview: boolean, lessonId?: string, extra?: ReadonlySet<string>): boolean {
  if (plan === 'PREMIUM') return true
  if (lessonId && ALWAYS_FREE.has(lessonId)) return true
  if (FULL_UNITS[plan].includes(unitId) || extra?.has(unitId)) return true
  return !isReview && index < FIRST_LESSONS[plan]
}

/** Plan mínimo que abre la lección (para el candado y el texto «Incluido en Plus») */
export function minPlan(unitId: string, index: number, isReview: boolean, lessonId?: string): PlanId {
  return canOpen('FREE', unitId, index, isReview, lessonId) ? 'FREE' : canOpen('PLUS', unitId, index, isReview, lessonId) ? 'PLUS' : 'PREMIUM'
}

/** Prueba gratis de Max (7 días): se desbloquea con una racha de 5 días o llegando con una invitación. Una por persona. */
export const TRIAL_STREAK = 5
export const TRIAL_DAYS = 7
export const trialUnlocked = (bestStreak: number) => bestStreak >= TRIAL_STREAK

/** Lumi: preguntas al día y modos por plan */
export const TUTOR_LIMITS: Record<PlanId, number> = { FREE: 5, PLUS: 30, PREMIUM: 100 }
export const TUTOR_MODE_PLAN = { EXPLAIN: 'FREE', PATH: 'FREE', PORTFOLIO: 'PLUS', BIASES: 'PREMIUM' } as const satisfies Record<string, PlanId>

// ── Precios (IVA incluido, en euros) ─────────────────────
// Precio normal y precio de estudiante (lo aprueba el equipo; dura 12 meses). Grupos: precio por grupo.
// Stripe busca cada precio por su «lookup key» (scripts/stripe-setup.ts los crea con estos mismos importes).
export type PaidTier = 'PLUS' | 'PREMIUM'
export type BillingInterval = 'MONTH' | 'YEAR'
type PriceTable = Record<PaidTier, Record<BillingInterval, number>>

export const PRICES: { normal: PriceTable; student: PriceTable } = {
  normal: { PLUS: { MONTH: 5.99, YEAR: 47.99 }, PREMIUM: { MONTH: 11.99, YEAR: 89.99 } },
  student: { PLUS: { MONTH: 3.99, YEAR: 29.99 }, PREMIUM: { MONTH: 7.99, YEAR: 59.99 } },
}
export const priceOf = (tier: PaidTier, interval: BillingInterval, student: boolean) => PRICES[student ? 'student' : 'normal'][tier][interval]

/** Lookup key de Stripe de un plan individual: plus_month, max_year_student… */
export const lookupKey = (tier: PaidTier, interval: BillingInterval, student: boolean) => `${tier === 'PLUS' ? 'plus' : 'max'}_${interval === 'MONTH' ? 'month' : 'year'}${student ? '_student' : ''}`

/** Meses que dura el precio de estudiante desde que se aprueba */
export const STUDENT_MONTHS = 12
/** Solicitudes de precio de estudiante por persona y mes */
export const STUDENT_REQUESTS_PER_MONTH = 3
/** Justificante: JPG, PNG o PDF de hasta 3 MB */
export const STUDENT_MAX_BYTES = 3 * 1024 * 1024
export const STUDENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const

// ── Planes de grupo ──────────────────────────────────────
/** Tamaños: 4, 8 o 0 = sin límite (uso razonable: clases, academias, empresas; tope técnico de GROUP_CAP personas) */
export type GroupSize = 4 | 8 | 0
export const GROUP_SIZES: readonly GroupSize[] = [4, 8, 0]
export const GROUP_CAP = 100
/** Plazas del grupo (quien paga ocupa una) */
export const seatsOf = (size: GroupSize | number) => (size === 0 ? GROUP_CAP : size)

type GroupTable = Record<'4' | '8' | '0', Record<PaidTier, Record<BillingInterval, { normal: number; student: number }>>>
export const GROUP_PRICES: GroupTable = {
  '4': { PLUS: { MONTH: { normal: 15.99, student: 9.99 }, YEAR: { normal: 127.99, student: 79.99 } }, PREMIUM: { MONTH: { normal: 29.99, student: 19.99 }, YEAR: { normal: 239.99, student: 159.99 } } },
  '8': { PLUS: { MONTH: { normal: 27.99, student: 17.99 }, YEAR: { normal: 223.99, student: 143.99 } }, PREMIUM: { MONTH: { normal: 49.99, student: 34.99 }, YEAR: { normal: 399.99, student: 279.99 } } },
  '0': { PLUS: { MONTH: { normal: 59.99, student: 39.99 }, YEAR: { normal: 479.99, student: 319.99 } }, PREMIUM: { MONTH: { normal: 99.99, student: 69.99 }, YEAR: { normal: 799.99, student: 559.99 } } },
}
export const groupPriceOf = (size: GroupSize, tier: PaidTier, interval: BillingInterval, student: boolean) => GROUP_PRICES[String(size) as '4' | '8' | '0'][tier][interval][student ? 'student' : 'normal']

/** Lookup key de Stripe de un grupo: g4_plus_month, gu_max_year_student… */
export const groupLookupKey = (size: GroupSize, tier: PaidTier, interval: BillingInterval, student: boolean) => `g${size === 0 ? 'u' : size}_${lookupKey(tier, interval, student)}`
