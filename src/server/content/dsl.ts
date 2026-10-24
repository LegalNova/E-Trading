import 'server-only'
// Pequeño lenguaje para escribir el curso (docs/curso) como contenido de la app.
// Cada lección: pasos de ~5 minutos + quiz. Las soluciones viven solo en el servidor.
// Los gráficos usan DATOS REALES de charts.json (scripts/build-lesson-charts.py); nunca precios inventados.
import type { FeatureT, QuestionT } from '@/shared/contract'
import CHARTS from './charts.json'

export type Illustration = 'candles' | 'trend' | 'support' | 'compound' | 'drawdown' | 'riskreward' | 'anatomy' | 'diversify'

export type Step =
  | { kind: 'TEXT'; title: string; body: string; tip?: string; key?: string }
  | { kind: 'IMAGE'; title: string; body: string; image: Illustration; tip?: string }
  | { kind: 'CHART'; prompt: string; caption: string; candles: [number, number, number, number][]; solution: number; ok: string; ko: string }
  | { kind: 'SIM'; title: string; body: string; task: string }

export interface ContentQuestion extends QuestionT {
  solution: number | number[] | string
  explanation: string
}

export interface ContentLesson {
  id: string
  title: string
  minutes: number
  xp: number
  steps: Step[]
  quizId: string
  isUnitReview?: boolean
  /** Lección del manual (docs/curso) de la que sale, para la profesora */
  source?: string
}
export interface ContentUnit {
  id: string
  order: number
  title: string
  description: string
  premiumOnly: boolean
  freeLessonIds?: string[]
  unlocksFeature?: FeatureT
  lessons: ContentLesson[]
}

interface ChartFixture { id: string; symbol: string; name: string; caption: string; candles?: [number, number, number, number][]; closes?: number[]; target?: number }
const FIX = CHARTS as unknown as Record<string, ChartFixture>
const fixture = (id: string) => FIX[id] ?? (() => { throw new Error(`Falta el gráfico ${id}: ejecuta scripts/build-lesson-charts.py`) })()

// ── Pasos ────────────────────────────────────────────────
export const text = (title: string, body: string, tip?: string): Step => ({ kind: 'TEXT', title, body, tip })
/** Paso final con la idea clave destacada y el truco de Lumi */
export const key = (title: string, body: string, idea: string, tip?: string): Step => ({ kind: 'TEXT', title, body, key: idea, tip })
export const img = (image: Illustration, title: string, body: string, tip?: string): Step => ({ kind: 'IMAGE', title, body, image, tip })
export const sim = (title: string, body: string, task: string): Step => ({ kind: 'SIM', title, body, task })
/** «Toca la vela…» sobre un gráfico real; la vela correcta es la que detectó el script */
export const chart = (fixtureId: string, prompt: string, ok: string, ko: string): Step => {
  const f = fixture(fixtureId)
  return { kind: 'CHART', prompt, caption: f.caption, candles: f.candles!, solution: f.target!, ok, ko }
}

// ── Preguntas ────────────────────────────────────────────
type Q = Omit<ContentQuestion, 'id'>
/** FNV-1a de 32 bits: reparte bien las posiciones */
const hash = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261)
/** Barajado determinista (siempre igual para la misma pregunta) que nunca deja el orden correcto */
function shuffle<T>(items: T[], seed: string): number[] {
  const idx = items.map((_, i) => i)
  let h = hash(seed)
  for (let i = idx.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0
    const j = h % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  if (idx.every((v, i) => v === i)) idx.push(idx.shift()!)
  return idx
}

/** Opciones barajadas de forma determinista para que la respuesta no esté siempre en el mismo sitio («No lo sé» se queda al final) */
function mix(prompt: string, options: string[], answers: number[]) {
  const fixed = options.filter(o => o === 'No lo sé')
  const free = options.filter(o => o !== 'No lo sé')
  let order = free.length > 1 ? shuffle(free, prompt + '|opts').map(i => free[i]) : free
  // Con una sola respuesta, su posición se reparte por igual entre las opciones
  if (answers.length === 1 && free.includes(options[answers[0]])) {
    const ans = options[answers[0]]
    const rest = order.filter(o => o !== ans)
    const pos = hash(prompt + '|pos') % free.length
    order = [...rest.slice(0, pos), ans, ...rest.slice(pos)]
  }
  const out = [...order, ...fixed]
  return { options: out, answers: answers.map(a => out.indexOf(options[a])) }
}
export const single = (prompt: string, options: string[], answer: number, explanation: string): Q => {
  const m = mix(prompt, options, [answer])
  return { type: 'SINGLE', prompt, options: m.options, solution: m.answers[0], explanation }
}
export const tf = (prompt: string, isTrue: boolean, explanation: string): Q => ({ type: 'TRUE_FALSE', prompt, options: ['Verdadero', 'Falso'], solution: isTrue ? 0 : 1, explanation })
export const multi = (prompt: string, options: string[], answers: number[], explanation: string): Q => {
  const m = mix(prompt, options, answers)
  return { type: 'MULTIPLE', prompt, options: m.options, solution: m.answers.sort((a, b) => a - b), explanation }
}
/** `inOrder` va en el orden correcto; se muestra barajado */
export const order = (prompt: string, inOrder: string[], explanation: string): Q => {
  const perm = shuffle(inOrder, prompt)
  const options = perm.map(i => inOrder[i])
  return { type: 'ORDER', prompt, options, solution: inOrder.map(x => options.indexOf(x)), explanation }
}
/** El enunciado lleva «____» donde va la respuesta */
export const fill = (prompt: string, answer: string, distractors: string[], explanation: string): Q => {
  const all = [answer, ...distractors]
  return { type: 'FILL_BLANK', prompt, options: shuffle(all, prompt).map(i => all[i]), solution: answer, explanation }
}
const TRENDS = ['Alcista', 'Bajista', 'Lateral'] as const
export const trend = (prompt: string, fixtureId: string, answer: (typeof TRENDS)[number], explanation: string): Q => {
  const f = fixture(fixtureId)
  return { type: 'CHART_TREND', prompt: `${prompt} (${f.caption})`, options: [...TRENDS], chart: f.closes!, solution: TRENDS.indexOf(answer), explanation }
}
export const point = (prompt: string, fixtureId: string, which: 'max' | 'min', explanation: string): Q => {
  const c = fixture(fixtureId).closes!
  const v = which === 'max' ? Math.max(...c) : Math.min(...c)
  return { type: 'CHART_POINT', prompt: `${prompt} (${fixture(fixtureId).caption})`, options: [], chart: c, solution: c.indexOf(v), explanation }
}

// ── Lecciones y unidades ─────────────────────────────────
export const QUIZZES: Record<string, ContentQuestion[]> = {}

export function lesson(id: string, title: string, steps: Step[], questions: Q[], o: { minutes?: number; xp?: number; source?: string } = {}): ContentLesson {
  QUIZZES[`q-${id}`] = questions.map((q, i) => ({ ...q, id: `${id}-${i + 1}` }))
  return { id, title, minutes: o.minutes ?? 5, xp: o.xp ?? 30, steps, quizId: `q-${id}`, source: o.source }
}

/** Repaso de unidad: 2 preguntas de cada lección (la 2.ª y la última), hasta 10 */
export function unit(u: ContentUnit): ContentUnit {
  const id = `${u.id}r`
  const picked = u.lessons.flatMap(l => {
    const qs = QUIZZES[l.quizId]
    return qs.length > 2 ? [qs[1], qs[qs.length - 1]] : qs
  })
  QUIZZES[`q-${id}`] = picked.slice(0, 10)
  const review: ContentLesson = {
    id, title: 'Repaso de la unidad', minutes: 6, xp: 50, quizId: `q-${id}`, isUnitReview: true,
    steps: [text(`Repaso de «${u.title}»`, `Un quiz con preguntas de toda la unidad: ${u.lessons.map(l => l.title.toLowerCase()).join(', ')}.\n\nSi fallas alguna, irá a tu lista de repaso para que la practiques más adelante.`, 'Lee bien cada explicación al responder: así se fija lo aprendido.')],
  }
  return { ...u, lessons: [...u.lessons, review] }
}
