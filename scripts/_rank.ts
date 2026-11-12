// Uso interno (no se guarda en git): posición de la correcta por longitud (más larga / media / más corta), por idioma.
import { readFileSync, readdirSync } from 'node:fs'
import { QUIZZES } from '../src/server/content/dsl'
import { UNITS } from '../src/server/content/catalog'
const V2 = 'src/server/content/v2'
const tr = (l: string) => Object.assign({}, ...readdirSync(`${V2}/i18n/${l}`).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => JSON.parse(readFileSync(`${V2}/i18n/${l}/${f}`, 'utf8')).questions ?? {})) as Record<string, { options: string[] }>
const T = { ca: tr('ca'), en: tr('en') }
const list = process.argv.includes('--list')
for (const loc of ['es', 'ca', 'en'] as const) {
  const c = { larga: 0, media: 0, corta: 0, empate: 0 }; let n = 0
  for (const u of UNITS) for (const l of u.lessons) {
    if (l.isUnitReview || l.isBoss) continue
    for (const q of QUIZZES[l.quizId] ?? []) {
      if (!['SINGLE', 'SCENARIO', 'CHAT'].includes(q.type) || q.options.length !== 3 || typeof q.solution !== 'number') continue
      const o = loc === 'es' ? q.options : T[loc][q.id].options
      const L = o.map(x => x.length), me = L[q.solution]
      n++
      const longer = L.filter(x => x > me).length, shorter = L.filter(x => x < me).length
      const k = longer === 0 && shorter === 2 ? 'larga' : shorter === 0 && longer === 2 ? 'corta' : longer === 1 && shorter === 1 ? 'media' : 'empate'
      c[k]++
      if (list && loc === 'es' && k === 'corta') console.log(q.id)
    }
  }
  if (!list) console.log(loc, n, Object.entries(c).map(([k, v]) => `${k} ${v} (${Math.round(100 * v / n)} %)`).join(' · '))
}
