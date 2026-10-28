// Repaso espaciado de los fallos (sistema de cajas tipo Leitner). Puro, para poder probarlo.
// Fallo en una clase → caja 0, se repasa ya. Cada acierto en el repaso lo aplaza: 1, 3, 7 y 16 días.
// Acertarlo en la última caja lo da por dominado (sale de la lista). Fallarlo en el repaso lo devuelve a la caja 0.
export const REVIEW_DAYS = [1, 3, 7, 16] as const
const DAY = 86_400_000

export type ReviewStep = { done: true } | { done: false; box: number; dueAt: Date }

export function afterReview(box: number, correct: boolean, now = new Date()): ReviewStep {
  if (!correct) return { done: false, box: 0, dueAt: new Date(now.getTime() + DAY) }
  if (box >= REVIEW_DAYS.length) return { done: true }
  return { done: false, box: box + 1, dueAt: new Date(now.getTime() + REVIEW_DAYS[box] * DAY) }
}
