import 'server-only'
// Pequeño lenguaje para escribir el curso (docs/curso) como contenido de la app.
// Cada lección: pasos de ~5 minutos + quiz. Las soluciones viven solo en el servidor.
// Los gráficos usan DATOS REALES de charts.json (scripts/build-lesson-charts.py); nunca precios inventados.
import type { FeatureT, QuestionT } from '@/shared/contract'
import CHARTS from './charts.json'

export type Illustration = 'candles' | 'trend' | 'support' | 'compound' | 'drawdown' | 'riskreward' | 'anatomy' | 'diversify'

export type Calc = 'compound' | 'inflation' | 'rule72' | 'position' | 'recovery' | 'fees' | 'dca' | 'budget' | 'loan'
export type Step =
  | { kind: 'TEXT'; title: string; body: string; tip?: string; key?: string }
  | { kind: 'CALC'; calc: Calc; title: string; body: string; tip?: string }
  | { kind: 'IMAGE'; title: string; body: string; image: Illustration; tip?: string }
  | { kind: 'CHART'; prompt: string; caption: string; candles: [number, number, number, number][]; solution: number; ok: string; ko: string }
  | { kind: 'SIM'; title: string; body: string; task: string }

type Ohlc = [number, number, number, number]
export interface PortfolioRules {
  /** Peso máximo de un solo activo (%) */
  maxWeight?: number
  /** Mínimo de activos con peso */
  minAssets?: number
  /** Peso máximo y mínimo por tipo (%), p. ej. { CRIPTO: 10 } */
  maxKind?: Record<string, number>
  minKind?: Record<string, number>
}
export interface ContentQuestion extends QuestionT {
  solution: number | number[] | string
  explanation: string
  /** Solo en el servidor: consecuencia de cada opción (escenarios y chat) */
  feedback?: string[]
  /** Solo en el servidor: margen aceptado (NUMBER, relativo) o rango de precio correcto (PLACE_LEVEL) */
  tol?: number
  range?: [number, number]
  rules?: PortfolioRules
  /** Solo en el servidor: lo que pasó después (se revela al responder) */
  hidden?: { candles?: Ohlc[]; closes?: number[]; caption: string; changePct?: number; minPct?: number }
}

export interface ContentLesson {
  id: string
  title: string
  minutes: number
  xp: number
  steps: Step[]
  quizId: string
  isUnitReview?: boolean
  /** Reto final de sección: mezcla de toda la sección; se aprueba con `passPct` */
  isBoss?: boolean
  passPct?: number
  /** Lección del manual (docs/curso) de la que sale, para la profesora */
  source?: string
}
export interface ContentUnit {
  id: string
  order: number
  title: string
  description: string
  unlocksFeature?: FeatureT
  /** Unidad paralela (Vocabulario): se puede hacer en cualquier momento, sin esperar al camino principal */
  side?: boolean
  /** Sección a la que pertenece (docs/curso-v2/02-curriculo.md) */
  section?: { id: string; title: string; requires: string[] }
  lessons: ContentLesson[]
}

interface ChartFixture {
  id: string; symbol: string; name: string; caption: string; candles?: Ohlc[]; closes?: number[]; target?: number
  future?: Ohlc[]; futureCloses?: number[]; outcome?: 'UP' | 'DOWN'; changePct?: number; minPct?: number; cutDate?: string
  entry?: number; support?: number; resistance?: number; atr?: number
}
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

/** Calculadora interactiva con deslizadores (interés compuesto, inflación, tamaño de posición…) */
export const calc = (kind: Calc, title: string, body: string, tip?: string): Step => ({ kind: 'CALC', calc: kind, title, body, tip })

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

// ── Tipos dinámicos (docs/curso-v2/03-ejercicios.md) ─────
/** Emparejar: cada par [izquierda, derecha]; la columna derecha se muestra barajada */
export const match = (prompt: string, pairs: [string, string][], explanation: string): Q => {
  const rights = pairs.map(p => p[1])
  const perm = shuffle(rights, prompt + '|r')
  const right = perm.map(i => rights[i])
  return { type: 'MATCH', prompt, options: pairs.map(p => p[0]), right, solution: pairs.map(p => right.indexOf(p[1])), explanation }
}
/** Clasificar: cada elemento va a un grupo (índice de `groups`) */
export const buckets = (prompt: string, groups: string[], items: [string, number][], explanation: string): Q => {
  const perm = shuffle(items, prompt + '|b')
  const shown = perm.map(i => items[i])
  return { type: 'BUCKETS', prompt, options: shown.map(x => x[0]), right: groups, solution: shown.map(x => x[1]), explanation }
}
/** Toca la vela: el patrón que detectó el script en un gráfico real */
export const candle = (prompt: string, fixtureId: string, explanation: string): Q => {
  const f = fixture(fixtureId)
  return { type: 'CHART_CANDLE', prompt, options: [], candles: f.candles!, solution: f.target!, explanation: `${explanation} (${f.caption})` }
}
/** ¿Sube o baja? Gráfico real sin nombre ni fecha; al responder se revela el activo y lo que pasó */
export const upDown = (prompt: string, fixtureId: string, explanation: string, horizon?: string): Q => {
  const f = fixture(fixtureId)
  const up = f.outcome ? f.outcome === 'UP' : (f.changePct ?? 0) > 0
  const base = f.candles ? { candles: f.candles } : { chart: f.closes! }
  return {
    type: 'UP_DOWN', prompt, options: ['Sube', 'Baja'], ...base, solution: up ? 0 : 1, explanation,
    meta: { horizon: horizon ?? (f.future ? 'las 10 sesiones siguientes' : 'los meses siguientes') },
    hidden: { candles: f.future, closes: f.futureCloses, caption: f.caption, changePct: f.changePct, minPct: f.minPct },
  }
}
/** Coloca el stop (por debajo del mínimo reciente) o el objetivo (cerca del máximo anterior) en un gráfico real */
export const level = (prompt: string, fixtureId: string, which: 'STOP' | 'TAKE', explanation: string): Q => {
  const f = fixture(fixtureId)
  const { entry, support, resistance, atr } = f as Required<ChartFixture>
  const range: [number, number] = which === 'STOP' ? [support - 2 * atr, Math.min(support, entry - 0.2 * atr)] : [resistance - atr, resistance + 0.5 * atr]
  return {
    type: 'PLACE_LEVEL', prompt, options: [], candles: f.candles!, solution: range.map(v => Number(v.toPrecision(6))), range, explanation,
    meta: { entry, level: which }, hidden: { candles: f.future, caption: f.caption },
  }
}
/** Simula la operación: importe y stop con la regla del riesgo; luego se reproduce lo que pasó de verdad */
export const simTrade = (prompt: string, fixtureId: string, explanation: string, o: { cash?: number; maxRiskPct?: number } = {}): Q => {
  const f = fixture(fixtureId)
  return {
    type: 'SIM_TRADE', prompt, options: [], candles: f.candles!, solution: 0, explanation,
    meta: { entry: f.entry!, cash: o.cash ?? 10_000, maxRiskPct: o.maxRiskPct ?? 1 }, hidden: { candles: f.future, caption: f.caption },
  }
}
/** Escenario: cada opción [texto, consecuencia]; `best` es la mejor decisión */
export const scenario = (prompt: string, choices: [string, string][], best: number, explanation: string): Q => {
  const m = mix(prompt, choices.map(c => c[0]), [best])
  return { type: 'SCENARIO', prompt, options: m.options, solution: m.answers[0], feedback: m.options.map(o => choices.find(c => c[0] === o)![1]), explanation }
}
/** Conversación con Lumi: sus mensajes y tus posibles respuestas [texto, lo que contesta Lumi] */
export const chat = (lines: string[], prompt: string, replies: [string, string][], best: number, explanation: string): Q => {
  const m = mix(prompt + lines.join(), replies.map(r => r[0]), [best])
  return { type: 'CHAT', prompt, options: m.options, solution: m.answers[0], feedback: m.options.map(o => replies.find(r => r[0] === o)![1]), explanation, meta: { lines } }
}
/** Cálculo con respuesta numérica (margen relativo, 1 % por defecto) */
export const num = (prompt: string, answer: number, unit: string, explanation: string, tolPct = 1): Q => ({ type: 'NUMBER', prompt, options: [], solution: answer, tol: tolPct / 100, explanation, meta: { unit } })
/** Construye una cartera: reparte el 100 % entre activos [nombre, tipo] cumpliendo unas reglas */
export const portfolio = (prompt: string, assets: [string, string][], rules: PortfolioRules, explanation: string): Q => ({
  type: 'PORTFOLIO', prompt, options: assets.map(a => a[0]), solution: [], rules, explanation, meta: { kinds: assets.map(a => a[1]) },
})
/** Detecta la estafa: mensajes [remitente, texto, ¿es estafa?]; se marcan todas las estafas */
export const spot = (prompt: string, messages: [string, string, boolean][], explanation: string): Q => {
  const perm = shuffle(messages, prompt + '|s')
  const shown = perm.map(i => messages[i])
  return { type: 'SPOT', prompt, options: shown.map(m => m[1]), solution: shown.flatMap((m, i) => (m[2] ? [i] : [])), explanation, meta: { senders: shown.map(m => m[0]) } }
}
/** Reto cronometrado: la misma pregunta con cuenta atrás (si se acaba el tiempo, cuenta como fallo) */
export const timed = (q: Q, seconds = 12): Q => ({ ...q, meta: { ...(q.meta ?? {}), timeLimit: seconds } })

// ── Lecciones y unidades ─────────────────────────────────
export const QUIZZES: Record<string, ContentQuestion[]> = {}

/** «10.000 €» y «7 %» nunca se parten en dos líneas: espacio que no se rompe entre la cifra y el símbolo */
const nb = (t: string) => t.replace(/(\d) (€|%|\$)/g, '$1\u00a0$2')
const nbQ = (q: Q): Q => ({ ...q, prompt: nb(q.prompt), options: q.options.map(nb), solution: typeof q.solution === 'string' ? nb(q.solution) : q.solution, explanation: nb(q.explanation), feedback: q.feedback?.map(nb), right: q.right?.map(nb) })
const nbS = (s: Step): Step => ('body' in s ? { ...s, body: nb(s.body) } : s)

export function lesson(id: string, title: string, steps: Step[], questions: Q[], o: { minutes?: number; xp?: number; source?: string } = {}): ContentLesson {
  QUIZZES[`q-${id}`] = questions.map((q, i) => ({ ...nbQ(q), id: `${id}-${i + 1}` }))
  return { id, title, minutes: o.minutes ?? 5, xp: o.xp ?? 30, steps: steps.map(nbS), quizId: `q-${id}`, source: o.source }
}

/** Mezcla intercalada: una pregunta de cada lista por turnos (los repasos mezclan temas) */
function interleave<T>(lists: T[][], max: number): T[] {
  const out: T[] = []
  for (let k = 0; out.length < max && lists.some(l => k < l.length); k++) for (const l of lists) if (k < l.length && out.length < max) out.push(l[k])
  return out
}

/** Repaso de unidad: preguntas de todas sus lecciones intercaladas (las de ejercicio dinámico primero), hasta 10 */
export function unit(u: ContentUnit): ContentUnit {
  const id = `${u.id}r`
  const lists = u.lessons.map(l => {
    const qs = QUIZZES[l.quizId] ?? []
    const dyn = qs.filter(q => !['SINGLE', 'TRUE_FALSE'].includes(q.type))
    return [...dyn.slice(-1), ...qs.filter(q => !dyn.slice(-1).includes(q)).slice(1, 2)]
  })
  QUIZZES[`q-${id}`] = interleave(lists, 10)
  const review: ContentLesson = {
    id, title: 'Repaso de la unidad', minutes: 6, xp: 50, quizId: `q-${id}`, isUnitReview: true,
    steps: [text(`Repaso de «${u.title}»`, `Un quiz con preguntas de toda la unidad: ${u.lessons.map(l => l.title.toLowerCase()).join(', ')}.\n\nSi fallas alguna, irá a tu lista de repaso para que la practiques más adelante.`, 'Lee bien cada explicación al responder: así se fija lo aprendido.')],
  }
  return { ...u, lessons: [...u.lessons, review] }
}

/** Sección: une sus unidades y añade al final el reto (12 preguntas de toda la sección intercaladas; se aprueba con un 80 %) */
export function section(id: string, title: string, requires: string[], units: ContentUnit[]): ContentUnit[] {
  // Teoría corta: unos 40 s por pantalla (el quiz suma aparte unos 25 s por ejercicio)
  const tagged = units.map(u => ({ ...u, section: { id, title, requires }, lessons: u.lessons.map(l => (l.isUnitReview ? l : { ...l, minutes: Math.max(1, Math.round(l.steps.length * 0.67)) })) }))
  const lists = tagged.map(u => u.lessons.filter(l => !l.isUnitReview).flatMap(l => (QUIZZES[l.quizId] ?? []).slice(-3)))
  const bid = `${id}boss`
  QUIZZES[`q-${bid}`] = interleave(lists, 12)
  const boss: ContentLesson = {
    id: bid, title: `Reto final: ${title}`, minutes: 8, xp: 100, quizId: `q-${bid}`, isBoss: true, passPct: 80,
    steps: [text(`Reto final: ${title}`, `12 preguntas mezcladas de toda la sección. Para superarlo necesitas acertar el 80 %.\n\nSi no llegas, repasa los fallos y vuelve a intentarlo: no pierdes nada.`, 'Tómate tu tiempo: aquí no hay prisa, hay que demostrar que lo dominas.')],
  }
  const last = tagged[tagged.length - 1]
  return [...tagged.slice(0, -1), { ...last, lessons: [...last.lessons, boss] }]
}
