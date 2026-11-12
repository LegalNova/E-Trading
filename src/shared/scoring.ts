// Qué preguntas cuentan para la nota (auditoría P0-7; decisión de Joan del 12-11-2026).
// Los «¿sube o baja?» sobre un gráfico anónimo (30 sesiones sin nombre, fecha ni contexto) son la «ronda de
// humildad»: se responden y se revela lo que pasó, pero acertarlos es azar. Por eso:
//   · no cuentan para las estrellas ni para aprobar, ni dan XP por acierto;
//   · no quitan vida ni van a la lista de fallos;
//   · no salen en los repasos de unidad, en los retos finales, en la prueba de unidad ni en el repaso espaciado.
// Los «¿sube o baja?» con contexto histórico («Julio de 2012: el IBEX lleva años de crisis…») sí puntúan.

type MaybeBlind = { meta?: { blind?: boolean } } | null | undefined

/** ¿Cuenta esta pregunta para la nota? */
export const isScored = (q: MaybeBlind) => !q?.meta?.blind

/** Aciertos y total de un intento, sin contar las preguntas que no puntúan */
export function tally(questionIds: readonly string[], answers: readonly { questionId: string; correct: boolean }[], scored: (id: string) => boolean, only?: (id: string) => boolean) {
  const counts = (id: string) => scored(id) && (!only || only(id))
  return { total: questionIds.filter(counts).length, correct: answers.filter(a => a.correct && counts(a.questionId)).length }
}
