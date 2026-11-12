// Uso interno (no se guarda en git): cifras de EXA-1 a EXA-3 con el contenido actual.
import { QUIZZES } from '../src/server/content/dsl'
import { UNITS } from '../src/server/content/catalog'
let n = 0, longest = 0, multi = 0, oneFalse = 0, sc = 0, todo = 0, loan = 0, cripto = 0
const by: Record<string, [number, number]> = {}
for (const u of UNITS) for (const l of u.lessons) {
  if (l.isUnitReview || l.isBoss) continue
  for (const q of QUIZZES[l.quizId] ?? []) {
    if (q.type === 'MULTIPLE' && Array.isArray(q.solution)) { multi++; if (q.options.length - q.solution.length === 1) oneFalse++ }
    if (['SCENARIO', 'CHAT'].includes(q.type) && typeof q.solution === 'number') {
      sc++
      const wrong = q.options.filter((_, i) => i !== q.solution).join(' | ')
      if (/\b(vend[oea]s? (ya )?(todo|todas)|lo vend[oe] todo|lo met[oe] todo|met[oe] todo|con todo)\b/i.test(wrong)) todo++
      if (/préstamo/i.test(wrong)) loan++
      if (/todo (a|en) (cripto|bitcoin)/i.test(wrong)) cripto++
    }
    if (!['SINGLE', 'SCENARIO', 'CHAT'].includes(q.type) || q.options.length !== 3 || typeof q.solution !== 'number') continue
    n++
    const L = q.options.map(o => o.length)
    const is = L[q.solution] === Math.max(...L) && L.filter(x => x === L[q.solution as number]).length === 1
    if (is) longest++
    by[q.type] ??= [0, 0]; by[q.type][0]++; if (is) by[q.type][1]++
  }
}
console.log(`Opción única con 3 opciones: ${n}; la correcta es la más larga en ${longest} (${Math.round(100 * longest / n)} %)`)
for (const [t, [a, b]] of Object.entries(by)) console.log(`  ${t}: ${b}/${a} (${Math.round(100 * b / a)} %)`)
console.log(`«Marca todas»: ${multi}; con una sola falsa: ${oneFalse}`)
console.log(`Escenarios y chats: ${sc}; «vendo/meto todo» como opción mala: ${todo}; «préstamo»: ${loan}; «todo a cripto»: ${cripto}`)
