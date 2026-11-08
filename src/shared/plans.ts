// Planes de Lumi (D-053, revisado en docs/curso-v2/06-enganche-y-progresion.md). En la base de datos el plan completo
// se llama PREMIUM y se muestra como «Max».
//   Free: unidades 1–3 completas (la sección «Invierte desde hoy») + las 3 primeras lecciones de cada unidad.
//         Las unidades superadas con la prueba de unidad no gastan plan: se abre gratis la siguiente del camino.
//   Plus: además, u5 y u6 completas (las 5 primeras del camino) + las 5 primeras lecciones de cada unidad + las 5 primeras lecciones de cada unidad.
//   Max: todo.
export type PlanId = 'FREE' | 'PLUS' | 'PREMIUM'

export const PLAN_NAME: Record<PlanId, string> = { FREE: 'Free', PLUS: 'Plus', PREMIUM: 'Max' }
export const tierOf = (p: PlanId) => (p === 'PREMIUM' ? 2 : p === 'PLUS' ? 1 : 0)
export const isPaid = (p: PlanId) => p !== 'FREE'

const FULL_UNITS: Record<PlanId, string[]> = { FREE: ['h1', 'h2', 'h3'], PLUS: ['h1', 'h2', 'h3', 'u5', 'u6'], PREMIUM: [] }
/** Cuántas unidades completas da cada plan (las superadas con la prueba de unidad no cuentan) */
export const FULL_UNIT_COUNT: Record<PlanId, number> = { FREE: 3, PLUS: 5, PREMIUM: Infinity }
const FIRST_LESSONS: Record<PlanId, number> = { FREE: 3, PLUS: 5, PREMIUM: Infinity }
/** Siempre gratis: la clase del stop loss, que desbloquea las órdenes límite, stop y take profit del Mercado (curso v2) */
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
