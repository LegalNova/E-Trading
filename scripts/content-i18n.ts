// Traducción del curso (catalán e inglés).
//   export: escribe los textos en español de cada unidad en src/server/content/v2/i18n/es/<unidad>.json,
//           en el mismo orden en que se muestran (las soluciones son posiciones: no cambian al traducir).
//   check:  comprueba que cada traducción (ca/, en/) tiene la misma forma que el español, conserva las cifras,
//           los «____» de los huecos y el número de opciones.
// Uso: npx tsx --conditions=react-server scripts/content-i18n.ts export | check [u1 u2 …]
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { QUIZZES, UNITS } from '../src/server/content/catalog'
import { ACHIEVEMENTS } from '../src/server/content/catalog'
import type { UnitText } from '../src/server/content/i18n'

const DIR = 'src/server/content/v2/i18n'

function exportEs() {
  mkdirSync(`${DIR}/es`, { recursive: true })
  for (const u of UNITS) {
    const out: UnitText = {
      unit: { title: u.title, description: u.description, ...(u.section ? { section: u.section.title } : {}) },
      lessons: {},
      questions: {},
    }
    for (const l of u.lessons) {
      // Los repasos y retos se generan con textos fijos del motor: solo se traduce su título
      out.lessons[l.id] = { title: l.title, steps: l.isUnitReview || l.isBoss ? [] : l.steps.map(s => ('body' in s ? { title: s.title, body: s.body, ...(s.kind === 'TEXT' && s.key ? { key: s.key } : {}), ...('tip' in s && s.tip ? { tip: s.tip } : {}) } : s.kind === 'CHART' ? { prompt: s.prompt, ok: s.ok, ko: s.ko } : {})) }
      if (l.isUnitReview || l.isBoss) continue
      for (const q of QUIZZES[l.quizId] ?? []) {
        out.questions[q.id] = {
          prompt: q.prompt, options: q.options, explanation: q.explanation,
          ...(q.right ? { right: q.right } : {}), ...(q.feedback ? { feedback: q.feedback } : {}),
          ...(q.meta?.lines ? { lines: q.meta.lines } : {}), ...(q.meta?.senders ? { senders: q.meta.senders } : {}),
          ...(q.meta?.unit ? { unit: q.meta.unit } : {}), ...(q.meta?.horizon ? { horizon: q.meta.horizon } : {}), ...(q.meta?.kinds ? { kinds: q.meta.kinds } : {}),
        }
      }
    }
    writeFileSync(`${DIR}/es/${u.id}.json`, JSON.stringify(out, null, 1) + '\n')
  }
  writeFileSync(`${DIR}/es/_achievements.json`, JSON.stringify(Object.fromEntries(ACHIEVEMENTS.map(a => [a.code, { title: a.title, description: a.description }])), null, 1) + '\n')
  console.log(`Exportadas ${UNITS.length} unidades y ${ACHIEVEMENTS.length} insignias a ${DIR}/es`)
}

/** Cifras de un texto (para comprobar que la traducción no cambia ningún dato) */
const digits = (t: string) => (t.match(/\d+(?:[.,]\d+)*/g) ?? []).map(d => d.replace(/[.,]/g, '')).sort().join(' ')

function compare(es: unknown, tr: unknown, at: string, errors: string[]) {
  if (typeof es === 'string') {
    if (typeof tr !== 'string' || !tr.trim()) return void errors.push(`${at}: falta el texto`)
    if (es.includes('____') !== tr.includes('____')) errors.push(`${at}: el hueco «____» no coincide`)
    if (digits(es) !== digits(tr)) errors.push(`${at}: las cifras no coinciden («${digits(es)}» → «${digits(tr)}»)`)
    return
  }
  if (Array.isArray(es)) {
    if (!Array.isArray(tr) || tr.length !== es.length) return void errors.push(`${at}: debe tener ${es.length} elementos`)
    es.forEach((x, i) => compare(x, tr[i], `${at}[${i}]`, errors))
    // Las repeticiones tienen que coincidir con las del español: opciones distintas siguen siendo distintas y
    // las etiquetas repetidas a propósito (tipos de activo de una cartera, remitentes) siguen siendo iguales
    if (es.every(x => typeof x === 'string'))
      for (let i = 0; i < es.length; i++)
        for (let j = i + 1; j < es.length; j++)
          if ((es[i] === es[j]) !== (tr[i] === tr[j])) errors.push(`${at}[${i}] y [${j}]: ${es[i] === es[j] ? 'en español son iguales y aquí no' : 'opciones repetidas'}`)
    return
  }
  if (es && typeof es === 'object') {
    if (!tr || typeof tr !== 'object') return void errors.push(`${at}: falta`)
    for (const k of Object.keys(es)) compare((es as Record<string, unknown>)[k], (tr as Record<string, unknown>)[k], `${at}.${k}`, errors)
    for (const k of Object.keys(tr)) if (!(k in es)) errors.push(`${at}.${k}: sobra`)
  }
}

function check(only: string[]) {
  const errors: string[] = []
  let done = 0
  for (const loc of ['ca', 'en']) {
    if (!existsSync(`${DIR}/${loc}`)) continue
    for (const f of readdirSync(`${DIR}/es`).filter(f => !only.length || only.includes(path.basename(f, '.json')))) {
      const p = `${DIR}/${loc}/${f}`
      if (!existsSync(p)) {
        errors.push(`${loc}/${f}: falta el archivo`)
        continue
      }
      compare(JSON.parse(readFileSync(`${DIR}/es/${f}`, 'utf8')), JSON.parse(readFileSync(p, 'utf8')), `${loc}/${path.basename(f, '.json')}`, errors)
      done++
    }
  }
  console.log(`${done} archivos traducidos comprobados`)
  if (errors.length) {
    console.log(`Errores (${errors.length}):\n` + errors.slice(0, 80).join('\n'))
    process.exit(1)
  }
  console.log('✓ Traducciones correctas')
}

/** Genera v2/i18n/index.ts con las traducciones que existan (importaciones estáticas: así viajan con el servidor) */
function index() {
  const lines = ['// Generado por scripts/content-i18n.ts index: no editar a mano.', "import type { AchievementText, UnitText } from '../../i18n'"]
  const maps: Record<string, string[]> = { ca: [], en: [] }
  const ach: Record<string, string> = { ca: '{}', en: '{}' }
  for (const loc of ['ca', 'en']) {
    if (!existsSync(`${DIR}/${loc}`)) continue
    for (const f of readdirSync(`${DIR}/${loc}`).filter(f => f.endsWith('.json')).sort()) {
      const id = path.basename(f, '.json')
      const v = `${loc}_${id.replace(/\W/g, '')}`
      lines.push(`import ${v} from './${loc}/${f}'`)
      if (id === '_achievements') ach[loc] = v
      else maps[loc].push(`${JSON.stringify(id)}: ${v} as UnitText`)
    }
  }
  lines.push('', `export const TEXTS: Record<'ca' | 'en', Record<string, UnitText>> = { ca: { ${maps.ca.join(', ')} }, en: { ${maps.en.join(', ')} } }`)
  lines.push(`export const ACHIEVEMENT_TEXTS: Record<'ca' | 'en', Record<string, AchievementText>> = { ca: ${ach.ca}, en: ${ach.en} }`, '')
  writeFileSync(`${DIR}/index.ts`, lines.join('\n'))
  console.log(`Índice: ${maps.ca.length} unidades en catalán, ${maps.en.length} en inglés`)
}

const cmd = process.argv[2]
if (cmd === 'index') index()
else if (cmd === 'export') exportEs()
else if (cmd === 'check') check(process.argv.slice(3))
else throw new Error('Uso: content-i18n.ts export|check|index')
