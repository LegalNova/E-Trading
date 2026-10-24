import 'server-only'
// Búsqueda en el manual del curso (BM25 con normalización para castellano). Sin servicios externos.
import KB from './kb.json'

export interface Chunk { id: string; module: string; lesson: string | null; title: string; text: string }
const CHUNKS = KB as Chunk[]
/** Primer fragmento de una lección del manual (lleva el objetivo y la idea clave) */
export const lessonHead = (lesson: string) => CHUNKS.find(c => c.lesson === lesson && c.module !== 'Glosario')

const STOP = new Set('a al algo ante antes como con contra cual cuando de del desde donde dos e el ella ellas ellos en entre era es esa ese eso esta este esto estos fue ha hay la las le les lo los mas me mi mis muy ni no nos o para pero por porque que se si sin sobre son su sus tambien te tiene tu tus un una uno unos y ya yo como cual cuales quien qué cómo cuál cuánto cuanto cuanta hace hacer puedo puede debo debe mejor sea ser estar está están es son the of and to in is what how'.split(' '))

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
/** Raíz aproximada: quita plurales y terminaciones frecuentes para que «velas» encuentre «vela» */
function stem(w: string) {
  if (w.length <= 4) return w
  for (const suf of ['amiento', 'imiento', 'aciones', 'ciones', 'mente', 'acion', 'cion', 'idad', 'ables', 'able', 'ando', 'iendo', 'ados', 'idos', 'ada', 'ado', 'ida', 'ido', 'es', 's']) if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length)
  return w
}
export const tokens = (s: string) => norm(s).replace(/[^a-z0-9%&/]+/g, ' ').split(' ').filter(w => w.length > 1 && !STOP.has(w)).map(stem)

// Índice BM25 en memoria (se construye una vez por instancia)
const docs = CHUNKS.map(c => tokens(`${c.title} ${c.title} ${c.text}`))
const avg = docs.reduce((a, d) => a + d.length, 0) / docs.length
const df = new Map<string, number>()
for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1)
const titles = CHUNKS.map(c => new Set(tokens(c.title)))
const tf = docs.map(d => d.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>()))

/** Sinónimos frecuentes en las preguntas de los alumnos */
const SYN: [RegExp, string[]][] = [
  [/^arriesg/, ['riesgo', 'tamano', 'posicion']], [/^impuest|^hacienda|^tribut/, ['tributan', 'irpf', 'ahorro']], [/^vela$/, ['velas', 'cuerpo', 'mecha']],
  [/^ahorr/, ['ahorrar']], [/^cripto|^bitcoin/, ['criptomoneda']], [/^estaf|^timo/, ['chiringuito', 'estafa']], [/^stop$/, ['stop', 'loss']],
  [/^llam|^contact|^whatsapp|^telegram|^ofrec/, ['chiringuito', 'estafa', 'contactan']], [/^garantiz|^mensual$/, ['garantizada', 'estafa', 'rentabilidad']],
]
const expand = (q: string[]) => [...new Set(q.flatMap(t => [t, ...SYN.filter(([re]) => re.test(t)).flatMap(([, w]) => w.map(stem))]))]

export function search(query: string, k = 4): { chunk: Chunk; score: number }[] {
  const q = expand([...new Set(tokens(query))])
  if (!q.length) return []
  const N = docs.length, k1 = 1.4, b = 0.75
  const scored = CHUNKS.map((chunk, i) => {
    let s = 0
    for (const t of q) {
      const f = tf[i].get(t)
      if (!f) continue
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5))
      s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * docs[i].length) / avg)))
    }
    // Coincidir con el título de la lección pesa más que una mención de pasada
    s += q.filter(t => titles[i].has(t)).length * 1.5
    // El glosario es corto: puntúa algo menos para que gane la lección completa
    return { chunk, score: chunk.module === 'Glosario' ? s * 0.8 : s }
  })
  return scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, k)
}
