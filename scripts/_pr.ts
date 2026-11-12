import { readFileSync, readdirSync } from 'node:fs'
import { QUIZZES } from '../src/server/content/dsl'
import '../src/server/content/catalog'
const V2 = 'src/server/content/v2'
const tr = (l: string) => Object.assign({}, ...readdirSync(`${V2}/i18n/${l}`).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => JSON.parse(readFileSync(`${V2}/i18n/${l}/${f}`, 'utf8')).questions ?? {})) as Record<string, { prompt: string }>
const [ca, en] = [tr('ca'), tr('en')]
const re = new RegExp(process.argv[2])
for (const q of Object.values(QUIZZES).flat()) if (re.test(q.prompt)) console.log(`${q.id} | ${q.prompt.slice(0, 70)} ¦ ${ca[q.id]?.prompt.slice(0, 70)} ¦ ${en[q.id]?.prompt.slice(0, 70)}`)
