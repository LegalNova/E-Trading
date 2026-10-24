// Base de conocimiento de Lumi (la profesora): trocea el manual docs/curso en fragmentos buscables.
// Uso: npx tsx scripts/build-tutor-kb.ts  → src/server/tutor/kb.json
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'docs', 'curso')
const OUT = path.join(process.cwd(), 'src', 'server', 'tutor', 'kb.json')
const MAX = 1400

interface Chunk { id: string; module: string; lesson: string | null; title: string; text: string }
const chunks: Chunk[] = []

for (const f of readdirSync(DIR).filter(f => f.endsWith('.md')).sort()) {
  const md = readFileSync(path.join(DIR, f), 'utf8')
  const moduleTitle = (md.match(/^# (.+)$/m)?.[1] ?? f).trim()
  if (f.startsWith('D-') || f.startsWith('C-')) continue // examen y ruta: no aportan para responder dudas
  if (f.startsWith('A-')) {
    // Glosario: un fragmento por término
    for (const m of md.matchAll(/^\*\*(.+?)\*\*(?: \((.+?)\))?\.\s+(.+?)(?:\s+→\s+([\d.y ]+))?$/gm)) {
      chunks.push({ id: `glosario-${chunks.length}`, module: 'Glosario', lesson: m[4]?.split(' ')[0] ?? null, title: m[1], text: `${m[1]}${m[2] ? ` (${m[2]})` : ''}: ${m[3]}` })
    }
    continue
  }
  // Secciones de nivel 2 (lecciones); los bancos de preguntas y las fuentes se omiten
  for (const sec of md.split(/\n(?=## )/).slice(1)) {
    const title = sec.match(/^## (.+)$/m)![1].trim()
    if (/^(Banco de preguntas|Fuentes)/.test(title)) continue
    const lesson = title.match(/^Lección (\d+\.\d+)/)?.[1] ?? null
    const body = sec.replace(/^## .+$/m, '').trim()
    // Subsecciones de nivel 3 como fragmentos, con el título de la lección delante
    const parts = body.split(/\n(?=### )/)
    let buf = ''
    const flush = () => {
      const text = buf.replace(/\n{3,}/g, '\n\n').trim()
      if (text.length > 60) chunks.push({ id: `c${chunks.length}`, module: moduleTitle, lesson, title, text: text.slice(0, MAX * 1.5) })
      buf = ''
    }
    for (const p of parts) {
      if (buf.length + p.length > MAX) flush()
      buf += (buf ? '\n\n' : '') + p
    }
    flush()
  }
}

mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(chunks))
console.log(`${chunks.length} fragmentos · ${Math.round(JSON.stringify(chunks).length / 1024)} KB → ${path.relative(process.cwd(), OUT)}`)
