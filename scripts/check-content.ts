// Comprueba el curso entero: soluciones de cada tipo de ejercicio, ids únicos, dependencias entre secciones
// y las reglas del curso v2 (8-15 ejercicios, ≥3 tipos, ≥1 dinámico, ≤4 pantallas de teoría, ≥200 clases).
// Uso: npm run check:content
import { PLACEMENT, QUIZZES, UNITS } from '../src/server/content/catalog'
import { validateUnits } from '../src/server/content/validate'

const r = validateUnits(UNITS, QUIZZES, { placement: PLACEMENT })
if (UNITS.some(u => u.section) && r.content < 200) r.errors.push(`solo ${r.content} clases (mínimo 200)`)
console.log(`${UNITS.length} unidades · ${r.sections} secciones · ${r.lessons} lecciones (${r.content} de contenido) · ${r.steps} pasos · ${r.questions} ejercicios · ~${r.words} palabras en pasos`)
console.log('Ejercicios por tipo:', Object.entries(r.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '))
if (r.warnings.length) console.log(`Avisos (${r.warnings.length}):\n` + r.warnings.slice(0, 40).join('\n'))
if (r.errors.length) {
  console.log(`Errores (${r.errors.length}):\n` + r.errors.slice(0, 80).join('\n'))
  process.exit(1)
}
console.log('✓ Contenido correcto')
