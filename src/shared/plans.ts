// Planes de E-Trading (D-053). En la base de datos el plan completo se llama PREMIUM y se muestra como «Max».
//   Free: unidades 1–3 completas + las 3 primeras lecciones de cada unidad.
//   Plus: además, unidades 4 y 5 completas + las 5 primeras lecciones de cada unidad.
//   Max: todo.
export type PlanId = 'FREE' | 'PLUS' | 'PREMIUM'

export const PLAN_NAME: Record<PlanId, string> = { FREE: 'Free', PLUS: 'Plus', PREMIUM: 'Max' }
export const tierOf = (p: PlanId) => (p === 'PREMIUM' ? 2 : p === 'PLUS' ? 1 : 0)
export const isPaid = (p: PlanId) => p !== 'FREE'

const FULL_UNITS: Record<PlanId, string[]> = { FREE: ['u1', 'u2', 'u3'], PLUS: ['u1', 'u2', 'u3', 'u4', 'u5'], PREMIUM: [] }
const FIRST_LESSONS: Record<PlanId, number> = { FREE: 3, PLUS: 5, PREMIUM: Infinity }

/** ¿Puede este plan abrir la lección? `index` es la posición dentro de la unidad (0, 1, 2…); los repasos piden la unidad entera. */
export function canOpen(plan: PlanId, unitId: string, index: number, isReview: boolean): boolean {
  if (plan === 'PREMIUM') return true
  if (FULL_UNITS[plan].includes(unitId)) return true
  return !isReview && index < FIRST_LESSONS[plan]
}

/** Plan mínimo que abre la lección (para el candado y el texto «Incluido en Plus») */
export function minPlan(unitId: string, index: number, isReview: boolean): PlanId {
  return canOpen('FREE', unitId, index, isReview) ? 'FREE' : canOpen('PLUS', unitId, index, isReview) ? 'PLUS' : 'PREMIUM'
}

/** Lumi: preguntas al día y modos por plan */
export const TUTOR_LIMITS: Record<PlanId, number> = { FREE: 5, PLUS: 30, PREMIUM: 100 }
export const TUTOR_MODE_PLAN = { EXPLAIN: 'FREE', PATH: 'FREE', PORTFOLIO: 'PLUS', BIASES: 'PREMIUM' } as const satisfies Record<string, PlanId>
