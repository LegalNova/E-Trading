// Uso interno (no se guarda en git): cambia el enunciado de preguntas en es/ca/en.  Formato: #id ¦ es ¦ ca ¦ en
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { QUIZZES } from '../src/server/content/dsl'
import '../src/server/content/catalog'
const V2 = 'src/server/content/v2'
const files = readdirSync(V2).filter(f => f.endsWith('.ts') && !['index.ts', 'legacy-map.ts'].includes(f))
const src: Record<string, string[]> = Object.fromEntries(files.map(f => [f, readFileSync(`${V2}/${f}`, 'utf8').split('\n')]))
const Q = Object.fromEntries(Object.values(QUIZZES).flat().map(q => [q.id, q]))
const i18n: Record<string, Record<string, { questions: Record<string, { prompt: string }> }>> = { ca: {}, en: {} }
for (const l of ['ca', 'en']) for (const f of readdirSync(`${V2}/i18n/${l}`).filter(f => f.endsWith('.json') && !f.startsWith('_'))) i18n[l][f] = JSON.parse(readFileSync(`${V2}/i18n/${l}/${f}`, 'utf8'))
const norm = (s: string) => s.replace(/ /g, ' ')
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
let ok = 0, fail = 0
const err = (m: string) => { console.log('✗', m); fail++ }
for (const row of readFileSync(process.argv[2], 'utf8').split('\n').filter(r => r.startsWith('#'))) {
  const p = row.slice(1).split('¦').map(s => s.trim())
  if (p.length !== 4) { err(`fila mal formada: ${row.slice(0, 50)}`); continue }
  const [id, es, cat, eng] = p
  const q = Q[id]
  if (!q) { err(`${id}: no existe`); continue }
  const lessonId = id.split('-')[0]
  let file = '', a = -1, z = -1
  for (const [f, lines] of Object.entries(src)) { const i = lines.findIndex(l => l.includes(`lesson('${lessonId}'`)); if (i >= 0) { file = f; a = i; z = lines.findIndex((l, k) => k > i && /^\s*\], \{.*\}\),?$/.test(l)) } }
  if (a < 0) { err(`${id}: clase no encontrada`); continue }
  const from = (q.meta as { from?: string } | undefined)?.from
  const back = (t: string) => (from ? t.replace(new RegExp(`\\b${from}\\b`, 'g'), 'Lumi') : t)
  const has = (k: number, t: string) => src[file][k].includes(`'${esc(t)}'`) || src[file][k].includes(`'${esc(back(t))}'`)
  const ks: number[] = []
  for (let k = a; k <= z; k++) if ((q.options.length ? q.options.every(o => has(k, norm(o))) : true) && (has(k, norm(q.prompt)))) ks.push(k)
  if (ks.length !== 1) { err(`${id}: ${ks.length} líneas candidatas`); continue }
  const k = ks[0]
  const old = [norm(q.prompt), back(norm(q.prompt))].find(t => src[file][k].includes(`'${esc(t)}'`))!
  src[file][k] = src[file][k].replace(`'${esc(old)}'`, `'${esc(es)}'`)
  const trs = (['ca', 'en'] as const).map(l => { const f = Object.keys(i18n[l]).find(x => i18n[l][x].questions?.[id]); return f ? i18n[l][f].questions[id] : null })
  if (trs.some(t => !t)) { err(`${id}: sin traducción`); continue }
  trs[0]!.prompt = cat; trs[1]!.prompt = eng
  ok++
}
if (fail) { console.log(`${fail} errores: no se escribe nada`); process.exit(1) }
for (const [f, lines] of Object.entries(src)) writeFileSync(`${V2}/${f}`, lines.join('\n'))
for (const l of ['ca', 'en']) for (const [f, j] of Object.entries(i18n[l])) writeFileSync(`${V2}/i18n/${l}/${f}`, JSON.stringify(j, null, 1) + '\n')
console.log(`Escrito: ${ok} enunciados`)
