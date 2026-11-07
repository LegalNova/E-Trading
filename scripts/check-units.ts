// Comprueba unidades sueltas del curso v2 mientras se escriben (sin tocar el catálogo).
// Uso: npx tsx --conditions=react-server scripts/check-units.ts src/server/content/v2/u05.ts [más archivos…]
import path from 'node:path'
import { QUIZZES, type ContentUnit } from '../src/server/content/dsl'
import { validateUnits } from '../src/server/content/validate'

const main = async () => {
  const files = process.argv.slice(2)
  if (!files.length) throw new Error('Indica los archivos de unidad')
  const units: ContentUnit[] = []
  for (const f of files) {
    const m = (await import(path.resolve(f))).default as ContentUnit | ContentUnit['lessons']
    // Las unidades de la sección 0 (h1.ts, h2.ts, h3.ts) exportan la lista de clases: se montan como unidad
    units.push(Array.isArray(m) ? { id: path.basename(f, '.ts'), order: 0, title: path.basename(f, '.ts'), description: '', lessons: m } : m)
  }
  const r = validateUnits(units, QUIZZES, { v2Only: true })
  for (const u of units) {
    const ls = u.lessons.filter(l => !l.isUnitReview)
    console.log(`${u.id} · ${u.title}: ${ls.length} clases · ${ls.map(l => `${l.id} ${QUIZZES[l.quizId]?.length ?? 0}`).join(' · ')}`)
  }
  console.log('Ejercicios por tipo:', Object.entries(r.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '))
  if (r.warnings.length) console.log(`Avisos (${r.warnings.length}):\n` + r.warnings.join('\n'))
  if (r.errors.length) {
    console.log(`Errores (${r.errors.length}):\n` + r.errors.join('\n'))
    process.exit(1)
  }
  console.log('✓ Unidades correctas')
}
main()
