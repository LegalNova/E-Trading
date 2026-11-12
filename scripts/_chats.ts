// Uso interno (no se guarda en git): chats con enunciado genérico, con sus mensajes.
import { readFileSync, readdirSync } from 'node:fs'
import { QUIZZES } from '../src/server/content/dsl'
import { UNITS } from '../src/server/content/catalog'
const V2 = 'src/server/content/v2'
const tr = (l: string) => Object.assign({}, ...readdirSync(`${V2}/i18n/${l}`).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => JSON.parse(readFileSync(`${V2}/i18n/${l}/${f}`, 'utf8')).questions ?? {})) as Record<string, { prompt: string }>
const [ca, en] = [tr('ca'), tr('en')]
let n = 0, g = 0
for (const u of UNITS) for (const l of u.lessons) {
  if (l.isUnitReview || l.isBoss) continue
  for (const q of QUIZZES[l.quizId] ?? []) {
    if (q.type !== 'CHAT') continue
    n++
    if (q.prompt.length > 45) continue
    g++
    const m = q.meta as { lines: string[]; from: string }
    console.log(`#${q.id} [${m.from}] ${q.prompt} ¦ ${ca[q.id]?.prompt} ¦ ${en[q.id]?.prompt}\n   ${m.lines.join(' / ').replace(/ /g, ' ')}`)
  }
}
console.log(`${g} genéricos de ${n} chats`)
