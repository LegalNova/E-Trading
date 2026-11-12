// Uso interno (no se guarda en git): para repartir a tercios la posición de la correcta por longitud, propone recuperar
// el texto original (más completo) de la respuesta buena en parte de las preguntas donde hoy es la intermedia.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { QUIZZES } from '../src/server/content/dsl'
import { UNITS } from '../src/server/content/catalog'
const V2 = 'src/server/content/v2'
const OLD = 'auditoria/ronda-7-redundancias', PRE = 'c102e9a'
const show = (ref: string, l: string, f: string) => { try { return JSON.parse(execSync(`git show ${ref}:${V2}/i18n/${l}/${f}`, { encoding: 'utf8', maxBuffer: 1e8 })).questions ?? {} } catch { return {} } }
const files = readdirSync(`${V2}/i18n/es`).filter(f => f.endsWith('.json') && !f.startsWith('_'))
type M = Record<string, { options: string[] }>
const all = (get: (f: string) => M) => Object.assign({}, ...files.map(get)) as M
const cur = { ca: all(f => JSON.parse(readFileSync(`${V2}/i18n/ca/${f}`, 'utf8')).questions ?? {}), en: all(f => JSON.parse(readFileSync(`${V2}/i18n/en/${f}`, 'utf8')).questions ?? {}) }
const old = { es: all(f => show(OLD, 'es', f)), ca: all(f => show(OLD, 'ca', f)), en: all(f => show(OLD, 'en', f)) }
const pre = all(f => show(PRE, 'es', f))
const SKIP = new Set(['u1l1-10', 'u1l4-10', 'u2l2-11', 'u2l3-11', 'u2l5-11', 'u3l4-11', 'u8l5-11', 'u10l1-11', 'u10l4-11', 'u25l9-2', 'u31l3-11', 'vocabl8-4'])
const sp = (s: string) => s.replace(/ /g, ' ')
const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0 }
const rank = (L: number[], i: number) => { const me = L[i], lo = L.filter(x => x > me).length, sh = L.filter(x => x < me).length; return lo === 0 && sh === 2 ? 'larga' : sh === 0 && lo === 2 ? 'corta' : lo === 1 && sh === 1 ? 'media' : 'empate' }
const out: string[] = []; let total = 0
for (const u of UNITS) {
  const qs = u.lessons.filter(l => !l.isUnitReview && !l.isBoss).flatMap(l => QUIZZES[l.quizId] ?? []).filter(q => ['SINGLE', 'SCENARIO', 'CHAT'].includes(q.type) && q.options.length === 3 && typeof q.solution === 'number')
  if (!qs.length) continue
  const now = qs.filter(q => rank(q.options.map(o => o.length), q.solution as number) === 'larga').length
  const want = Math.round(qs.length / 3) - now
  const cands: { id: string; row: string }[] = []
  for (const q of qs) {
    const s = q.solution as number
    if (SKIP.has(q.id) || rank(q.options.map(o => o.length), s) !== 'media') continue
    const p = pre[q.id], o = old.es[q.id]
    if (!p || !o || !old.ca[q.id] || !old.en[q.id] || p.options.length !== 3 || o.options.length !== 3) continue
    const i = p.options.indexOf(q.options[s])
    if (i < 0) continue
    const from = (q.meta as { from?: string } | undefined)?.from
    const es = sp(q.type === 'CHAT' && from ? o.options[i].replace(new RegExp(`\\b${from}\\b`, 'g'), 'Lumi') : o.options[i]), ca = sp(old.ca[q.id].options[i]), en = sp(old.en[q.id].options[i])
    if (sp(o.options[i]) === sp(q.options[s])) continue
    const longest = (cs: string[], mine: string) => cs.every((x, k) => k === s || x.length < mine.length)
    if (!longest(q.options, o.options[i]) || !longest(cur.ca[q.id].options, ca) || !longest(cur.en[q.id].options, en)) continue
    if (mineTooLong(o.options[i], q.options, s)) continue
    cands.push({ id: q.id, row: `#${q.id}\n${s} ¦ ${es} ¦ ${ca} ¦ ${en}` })
  }
  cands.sort((a, b) => hash(a.id) - hash(b.id))
  const pick = cands.slice(0, Math.max(0, want))
  total += pick.length
  out.push(...pick.map(c => c.row))
  console.log(`${u.id}: ${qs.length} preguntas, ${now} con la correcta más larga, faltan ${Math.max(0, want)}, candidatas ${cands.length}, elegidas ${pick.length}`)
}
// (no recuperar textos que doblan con mucho a la opción mala más larga: volverían a delatar la respuesta)
function mineTooLong(mine: string, opts: string[], s: number) { const w = Math.max(...opts.filter((_, k) => k !== s).map(x => x.length)); return mine.length > w * 1.6 }
writeFileSync(process.argv[2], out.join('\n') + '\n')
console.log(`Total elegidas: ${total}`)
