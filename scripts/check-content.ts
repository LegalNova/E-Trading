// Comprueba el curso: soluciones válidas, ids únicos y cortos, huecos en los «rellenar», pasos con contenido.
// Uso: npx tsx --conditions=react-server scripts/check-content.ts
import { PLACEMENT, QUIZZES, UNITS } from '../src/server/content/catalog'

const errors: string[] = []
const ids = new Set<string>()
let lessons = 0, questions = 0, steps = 0, words = 0
for (const u of UNITS) {
  for (const l of u.lessons) {
    lessons++
    if (!l.steps.length) errors.push(`${l.id}: sin pasos`)
    for (const s of l.steps) {
      steps++
      const t = 'body' in s ? s.body : ''
      words += t.split(/\s+/).length
      if (s.kind === 'CHART' && (s.solution < 0 || s.solution >= s.candles.length)) errors.push(`${l.id}: vela solución fuera de rango`)
      if ('body' in s && s.body.length > 700) errors.push(`${l.id}: paso «${'title' in s ? s.title : ''}» demasiado largo (${s.body.length})`)
    }
    const qs = QUIZZES[l.quizId]
    if (!qs?.length) errors.push(`${l.id}: sin quiz`)
    if (!l.isUnitReview && qs && qs.length < 4) errors.push(`${l.id}: menos de 4 preguntas`)
  }
}
for (const q of [...Object.values(QUIZZES).flat(), ...PLACEMENT]) {
  if (ids.has(q.id)) continue
  ids.add(q.id)
  questions++
  if (q.id.length > 40) errors.push(`${q.id}: id demasiado largo`)
  const n = q.options.length
  const bad = (m: string) => errors.push(`${q.id}: ${m}`)
  switch (q.type) {
    case 'SINGLE': case 'TRUE_FALSE': case 'CHART_TREND':
      if (typeof q.solution !== 'number' || q.solution < 0 || q.solution >= n) bad('solución fuera de rango'); break
    case 'MULTIPLE':
      if (!Array.isArray(q.solution) || !q.solution.length || q.solution.some(i => i < 0 || i >= n)) bad('solución múltiple inválida'); break
    case 'ORDER':
      if (!Array.isArray(q.solution) || [...q.solution].sort().join() !== q.options.map((_, i) => i).join()) bad('orden inválido'); break
    case 'FILL_BLANK':
      if (!q.prompt.includes('____')) bad('falta «____»')
      if (!q.options.includes(q.solution as string)) bad('la respuesta no está entre las opciones')
      if (String(q.solution).length > 60) bad('respuesta demasiado larga'); break
    case 'CHART_POINT':
      if (!q.chart || typeof q.solution !== 'number' || q.solution >= q.chart.length) bad('punto fuera del gráfico'); break
  }
  if (q.type !== 'CHART_POINT' && new Set(q.options).size !== n) bad('opciones repetidas')
}
console.log(`${UNITS.length} unidades · ${lessons} lecciones · ${steps} pasos · ${questions} preguntas · ~${words} palabras en pasos`)
if (errors.length) { console.log(errors.join('\n')); process.exit(1) }
console.log('✓ Contenido correcto')
