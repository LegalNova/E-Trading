// Validación del contenido (pura): soluciones de cada tipo de ejercicio, ids únicos, dependencias y reglas del curso v2.
// La usan scripts/check-content.ts (curso entero) y scripts/check-units.ts (unidades sueltas mientras se escriben).
import { isScored } from '@/shared/scoring'
import type { ContentQuestion, ContentUnit, Step } from './dsl'
import { GLYPHS } from '@/shared/glyphs'

export interface Report {
  errors: string[]
  warnings: string[]
  lessons: number
  content: number
  questions: number
  steps: number
  words: number
  byType: Record<string, number>
  sections: number
}

const DYNAMIC = new Set(['MATCH', 'BUCKETS', 'CHART_CANDLE', 'UP_DOWN', 'PLACE_LEVEL', 'SIM_TRADE', 'SCENARIO', 'NUMBER', 'PORTFOLIO', 'SPOT', 'CHAT', 'ORDER', 'FILL_BLANK', 'CHART_POINT', 'CHART_TREND'])

export function checkQuestion(q: ContentQuestion, needsExplanation = true): string[] {
  const out: string[] = []
  const bad = (m: string) => out.push(`${q.id}: ${m}`)
  const n = q.options.length
  const sol = q.solution
  const nums = Array.isArray(sol) ? sol : []
  if (q.id.length > 40) bad('id demasiado largo')
  if (needsExplanation && !q.explanation?.trim()) bad('sin explicación')
  if (q.prompt.length > 400) bad(`enunciado demasiado largo (${q.prompt.length})`)
  switch (q.type) {
    case 'SINGLE': case 'TRUE_FALSE': case 'CHART_TREND': case 'UP_DOWN': case 'SCENARIO': case 'CHAT':
      if (typeof sol !== 'number' || sol < 0 || sol >= n) bad('solución fuera de rango')
      if ((q.type === 'SCENARIO' || q.type === 'CHAT') && q.feedback?.length !== n) bad('falta la consecuencia de alguna opción')
      if (q.type === 'UP_DOWN' && !(q.hidden?.candles?.length || q.hidden?.closes?.length)) bad('sin futuro que revelar')
      break
    case 'MULTIPLE': case 'SPOT':
      if (!nums.length || nums.some(i => i < 0 || i >= n)) bad('solución múltiple inválida')
      break
    case 'ORDER':
      if ([...nums].sort((a, b) => a - b).join() !== q.options.map((_, i) => i).join()) bad('orden inválido')
      break
    case 'MATCH':
      if (nums.length !== n || new Set(nums).size !== n || nums.some(i => i < 0 || i >= (q.right?.length ?? 0))) bad('parejas inválidas (¿hay dos derechas iguales?)')
      break
    case 'BUCKETS':
      if (nums.length !== n || nums.some(i => i < 0 || i >= (q.right?.length ?? 0))) bad('grupos inválidos')
      if ((q.right?.length ?? 0) < 2) bad('menos de 2 grupos')
      break
    case 'FILL_BLANK':
      if (!q.prompt.includes('____')) bad('falta «____»')
      if (!q.options.includes(sol as string)) bad('la respuesta no está entre las opciones')
      if (String(sol).length > 60) bad('respuesta demasiado larga')
      break
    case 'CHART_POINT':
      if (!q.chart || typeof sol !== 'number' || sol >= q.chart.length) bad('punto fuera del gráfico')
      break
    case 'CHART_CANDLE':
      if (!q.candles || typeof sol !== 'number' || sol < 0 || sol >= q.candles.length) bad('vela fuera del gráfico')
      break
    case 'PLACE_LEVEL': {
      const e = q.meta?.entry ?? 0
      if (!q.range || q.range[0] >= q.range[1]) bad('rango de precio inválido')
      else if (q.meta?.level === 'STOP' && q.range[1] >= e) bad('el stop correcto debe quedar por debajo de la entrada')
      else if (q.meta?.level === 'TAKE' && q.range[0] <= e) bad('el objetivo debe quedar por encima de la entrada')
      break
    }
    case 'SIM_TRADE':
      if (!q.meta?.entry || !q.meta.cash || !q.meta.maxRiskPct || !q.hidden?.candles?.length) bad('simulación incompleta')
      break
    case 'NUMBER':
      if (typeof sol !== 'number' || !Number.isFinite(sol)) bad('número inválido')
      if (q.meta?.unit === undefined) bad('falta la unidad')
      break
    case 'PORTFOLIO':
      if (n < 3) bad('menos de 3 activos')
      if (!q.rules || !Object.keys(q.rules).length) bad('sin reglas')
      break
  }
  if (!['CHART_POINT', 'CHART_CANDLE', 'PLACE_LEVEL', 'SIM_TRADE', 'NUMBER'].includes(q.type) && new Set(q.options).size !== n) bad('opciones repetidas')
  if (q.meta?.timeLimit !== undefined && (q.meta.timeLimit < 5 || q.meta.timeLimit > 60)) bad('tiempo fuera de 5-60 s')
  return out
}

/** Reglas por clase del curso v2 (docs/curso-v2/01-investigacion.md §3) */
export function validateUnits(units: ContentUnit[], quizzes: Record<string, ContentQuestion[]>, o: { v2Only?: boolean; placement?: ContentQuestion[] } = {}): Report {
  const r: Report = { errors: [], warnings: [], lessons: 0, content: 0, questions: 0, steps: 0, words: 0, byType: {}, sections: 0 }
  const lessonIds = new Set<string>()
  const qSeen = new Set<string>()
  const sections = new Map<string, string[]>()
  for (const u of units) {
    const v2 = o.v2Only || !!u.section
    if (u.section) sections.set(u.section.id, u.section.requires)
    let prevTypes = ''
    for (const l of u.lessons) {
      r.lessons++
      if (lessonIds.has(l.id)) r.errors.push(`${l.id}: id de lección repetido`)
      lessonIds.add(l.id)
      if (!l.steps.length) r.errors.push(`${l.id}: sin pasos`)
      for (const s of l.steps) {
        r.steps++
        const t = 'body' in s ? s.body : ''
        r.words += t.split(/\s+/).length
        if (s.kind === 'CHART' && (s.solution < 0 || s.solution >= s.candles.length)) r.errors.push(`${l.id}: vela solución fuera de rango`)
        if (s.kind === 'PLAY') r.errors.push(...checkPlay(l.id, s.play))
        if (s.kind === 'STORY') r.errors.push(...checkStory(l.id, s.story))
        if ('body' in s && s.body.length > 700) r.errors.push(`${l.id}: paso «${'title' in s ? s.title : ''}» demasiado largo (${s.body.length})`)
      }
      const qs = quizzes[l.quizId] ?? []
      if (!qs.length) r.errors.push(`${l.id}: sin quiz`)
      const extra = l.isUnitReview || l.isBoss
      if (!extra) r.content++
      if (!extra && qs.length) {
        const types = [...new Set(qs.map(q => q.type))].sort()
        if (v2) {
          // Clases interactivas: ya se practica dentro de la clase, así que el quiz puede ser más corto
          const live = l.steps.filter(s => s.kind === 'PLAY' || s.kind === 'STORY').length
          const [minQ, maxQ, maxSteps] = live ? [5, 12, 5] : [8, 15, 4]
          if (qs.length < minQ || qs.length > maxQ) r.errors.push(`${l.id}: ${qs.length} ejercicios (deben ser ${minQ}-${maxQ})`)
          if (types.length < 3) r.errors.push(`${l.id}: solo ${types.length} tipos de ejercicio (mínimo 3)`)
          if (!qs.some(q => DYNAMIC.has(q.type))) r.errors.push(`${l.id}: ningún ejercicio dinámico (solo test y verdadero/falso)`)
          if (l.steps.length > maxSteps) r.errors.push(`${l.id}: ${l.steps.length} pantallas de teoría (máximo ${maxSteps})`)
          if (live && l.steps.filter(s => s.kind === 'TEXT').length > 1) r.warnings.push(`${l.id}: clase interactiva con más de una pantalla de solo texto`)
          if (types.join() === prevTypes) r.warnings.push(`${l.id}: misma mezcla de ejercicios que la clase anterior`)
          const tf = qs.filter(q => q.type === 'TRUE_FALSE' || q.type === 'SINGLE').length
          if (tf / qs.length > 0.6) r.warnings.push(`${l.id}: ${tf} de ${qs.length} son test o verdadero/falso (máx. 60 %)`)
        } else if (qs.length < 4) r.errors.push(`${l.id}: menos de 4 preguntas`)
        prevTypes = types.join()
      }
      for (const q of qs) {
        if (qSeen.has(q.id)) continue
        qSeen.add(q.id)
        r.questions++
        r.byType[q.type] = (r.byType[q.type] ?? 0) + 1
        r.errors.push(...checkQuestion(q))
      }
    }
  }
  for (const q of o.placement ?? []) r.errors.push(...checkQuestion(q, false))
  for (const [id, req] of sections) for (const x of req) if (!sections.has(x)) r.errors.push(`sección ${id}: requiere ${x}, que no existe`)
  r.sections = sections.size
  const fair = examFairness(units, quizzes, o.placement)
  r.errors.push(...fair.errors)
  r.warnings.push(...fair.warnings)
  return r
}

/** A partir de qué proporción «la opción correcta es la más larga» delata la respuesta (al azar, con 3 opciones, un 33 %) */
export const MAX_LONGEST_SHARE = 0.45

/**
 * Exámenes justos (auditoría EXA-7): que no se pueda aprobar por la forma de las preguntas ni suspender por azar.
 *   · Error: una pregunta de la ronda de humildad («¿sube o baja?» anónimo) dentro de un repaso, un reto final
 *     o el test de nivel (P0-7).
 *   · Aviso: unidades donde la opción correcta es la más larga demasiadas veces (EXA-1).
 *   · Aviso: «marca todas» con una sola opción falsa (EXA-2).
 * La posición de la vela en «toca la vela» se vigila en charts-check.ts.
 */
export function examFairness(units: ContentUnit[], quizzes: Record<string, ContentQuestion[]>, placement: ContentQuestion[] = []): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  for (const u of units) for (const l of u.lessons) if (l.isUnitReview || l.isBoss) for (const q of quizzes[l.quizId] ?? []) if (!isScored(q)) errors.push(`${l.id}: ${q.id} es de la ronda de humildad (no puntúa) y no puede entrar en un repaso ni en un reto`)
  for (const q of placement) if (!isScored(q)) errors.push(`test de nivel: ${q.id} es de la ronda de humildad`)

  const seen = new Set<string>()
  const longest: string[] = []
  let oneAll = 0
  let longAll = 0
  const oneFalse: string[] = []
  let multi = 0
  for (const u of units) {
    let one = 0
    let long = 0
    for (const l of u.lessons) {
      if (l.isUnitReview || l.isBoss) continue
      for (const q of quizzes[l.quizId] ?? []) {
        if (seen.has(q.id)) continue
        seen.add(q.id)
        if (['SINGLE', 'SCENARIO', 'CHAT'].includes(q.type) && q.options.length >= 3 && typeof q.solution === 'number') {
          one++
          if (q.options[q.solution].length === Math.max(...q.options.map(x => x.length))) long++
        }
        if (q.type === 'MULTIPLE' && Array.isArray(q.solution)) {
          multi++
          if (q.options.length - q.solution.length === 1) oneFalse.push(q.id)
        }
      }
    }
    oneAll += one
    longAll += long
    if (one >= 6 && long / one > MAX_LONGEST_SHARE) longest.push(`${u.id} ${Math.round((long / one) * 100)} %`)
  }
  if (longest.length) warnings.push(`La opción correcta es la más larga en el ${Math.round((longAll / Math.max(1, oneAll)) * 100)} % de las preguntas de opción única (objetivo: menos del ${Math.round(MAX_LONGEST_SHARE * 100)} %). Unidades por encima: ${longest.join(' · ')}`)
  if (oneFalse.length) warnings.push(`${oneFalse.length} de ${multi} preguntas «marca todas» tienen una sola opción falsa: ${oneFalse.slice(0, 12).join(', ')}${oneFalse.length > 12 ? '…' : ''}`)
  return { errors, warnings }
}

/** Pieza interactiva: la predicción tiene respuesta válida, hay frase de Lumi por defecto y las métricas existen */
const METRICS: Record<string, string[]> = {
  basket: ['years', 'rate', 'items', 'itemsPct', 'lost'],
  growth: ['final', 'contributed', 'gain', 'multiple', 'years', 'monthly', 'rate', 'initial', 'simpleFinal', 'mattressFinal'],
  race: ['bAge', 'delay', 'ratio', 'aFinal', 'bFinal', 'aPut', 'bPut'],
  doubling: ['rate', 'years', 'rule', 'doublings40'],
  realrate: ['nominal', 'inflation', 'real', 'value', 'balance'],
  sort: ['done', 'cards', 'correct', 'wrong', 'net'],
  budget: ['needsPct', 'wantsPct', 'savePct', 'offTarget', 'left'],
  leaks: ['yearly', 'cut', 'invested', 'on'],
  emergency: ['save', 'played', 'fund', 'debt', 'covered'],
  goalplan: ['needed', 'available', 'fits', 'slack'],
  loan: ['amount', 'tin', 'months', 'payment', 'interest', 'total', 'tae'],
  revolving: ['payment', 'months', 'interest', 'total'],
  debts: ['method', 'extra', 'months', 'interest', 'saved', 'firstPaid'],
  horizon: ['years', 'windows', 'lossPct', 'worst', 'best'],
  crash: ['played', 'sold', 'drop', 'final', 'hold', 'soldDrop'],
  coinflip: ['trades', 'losersPct', 'avg', 'best'],
  mix: ['totalPct', 'maxDD', 'final', 'w0', 'w1', 'w2', 'w3'],
  fees: ['feeB', 'years', 'finalA', 'finalB', 'lost', 'lostPct'],
  bond: ['rate', 'years', 'price', 'change'],
  fx: ['asset', 'fx', 'eurPct'],
  leverage: ['lev', 'move', 'pnlPct', 'wiped', 'exposure'],
  position: ['riskPct', 'stopPct', 'size', 'posPct', 'riskEur', 'after10'],
  orders: ['stopPct', 'takePct', 'rr', 'played', 'hit', 'pnlPct'],
  taxes: ['gain', 'loss', 'base', 'tax', 'effPct', 'marginal'],
  dca: ['start', 'lumpFinal', 'dcaFinal', 'lumpWins', 'diffPct'],
  guess: ['done', 'right', 'rounds'],
  book: ['size', 'avg', 'slippagePct', 'spreadPct'],
  valuation: ['price', 'growth', 'per', 'peg', 'yieldPct', 'payback'],
}
function checkPlay(id: string, p: Extract<Step, { kind: 'PLAY' }>['play']): string[] {
  const e: string[] = []
  const ok = METRICS[p.widget.kind] ?? []
  const conds = [...(p.goal?.when ?? []), ...p.lumi.flatMap(l => (l.when ? [l.when] : []))]
  for (const c of conds) if (!ok.includes(c.metric)) e.push(`${id}: la pieza ${p.widget.kind} no tiene la métrica «${c.metric}»`)
  if (p.predict && (p.predict.answer < 0 || p.predict.answer >= p.predict.options.length)) e.push(`${id}: predicción con respuesta fuera de rango`)
  if (!p.lumi.some(l => !l.when)) e.push(`${id}: Lumi necesita una frase sin condición (la de por defecto)`)
  if (p.lumi.findIndex(l => !l.when) !== p.lumi.length - 1) e.push(`${id}: la frase de Lumi sin condición tiene que ir la última`)
  if (p.mode === 'MISSION' && !p.goal) e.push(`${id}: una misión necesita un reto`)
  // Horizonte y aportaciones cuentan meses por posición: la serie tiene que ser mensual y sin huecos
  if (p.widget.kind === 'horizon' || p.widget.kind === 'dca') {
    const m = p.widget.series.dates.map(d => (/^\d{4}-\d{2}$/.test(d) ? Number(d.slice(0, 4)) * 12 + Number(d.slice(5)) : NaN))
    if (m.some((x, i) => i > 0 && x - m[i - 1] !== 1)) e.push(`${id}: ${p.widget.kind} necesita una serie mensual sin huecos`)
  }
  // Iconos del catálogo (nada de emojis en la interfaz)
  JSON.stringify(p.widget, (k, x) => (k === 'icon' && typeof x === 'string' && !(GLYPHS as readonly string[]).includes(x) && e.push(`${id}: icono «${x}» no existe (src/shared/glyphs.ts)`), x))
  if (p.widget.kind === 'sort' && p.widget.cards.some(c => c.bin < 0 || c.bin >= (p.widget as { bins: unknown[] }).bins.length)) e.push(`${id}: tarjeta con grupo fuera de rango`)
  return e
}
/** Historia: cada personaje que habla existe, y cada elección tiene una opción buena y consecuencias */
function checkStory(id: string, s: Extract<Step, { kind: 'STORY' }>['story']): string[] {
  const e: string[] = []
  const who = new Set(['lumi', 'me', ...s.cast.map(c => c.id)])
  const says = s.beats.flatMap(b => ('choice' in b ? b.choice.options.flatMap(o => o.then) : [b]))
  for (const b of says) if ('who' in b && !who.has(b.who)) e.push(`${id}: en la historia habla «${b.who}», que no está en el reparto`)
  for (const b of s.beats) if ('choice' in b) {
    if (!b.choice.options.some(o => o.tone === 'good')) e.push(`${id}: elección sin ninguna opción buena`)
    if (b.choice.options.some(o => !o.then.length)) e.push(`${id}: opción de la historia sin consecuencia`)
  }
  return e
}

// ── Repeticiones (auditoría RED-34) ──────────────────────
/** Como mucho, un tercio de las piezas de una unidad pueden ser el clasificador de tarjetas */
export const MAX_SORT_SHARE = 1 / 3

/**
 * Tres avisos para que el curso no se repita:
 *  1. un gráfico = una clase (si vuelve a salir en otra, se acierta de memoria);
 *  2. cada serie histórica se vive como pieza en una sola clase;
 *  3. no más de un tercio de las piezas de una unidad son «clasifica las tarjetas».
 */
export function reuseWarnings(units: ContentUnit[], use: Record<string, { steps: string[]; quiz: [string, string][] }>, charts: Record<string, { symbol?: string; from?: string; to?: string }> = {}): string[] {
  const out: string[] = []
  const live = new Set(units.flatMap(u => u.lessons.map(l => l.id)))
  // Gráfico → clases donde sale, sea en una pieza o en un ejercicio vivo. Dos usos dentro de la misma clase están bien
  // (la tendencia y, después, qué pasó): lo que se evita es volver a verlo en otra clase, ya con el desenlace sabido.
  const where = new Map<string, Set<string>>()
  for (const [lessonId, u] of Object.entries(use)) {
    if (!live.has(lessonId)) continue
    for (const f of [...u.steps, ...u.quiz.map(x => x[0])]) where.set(f, (where.get(f) ?? new Set()).add(lessonId))
  }
  const isSeries = (f: string) => /^(series|mix)-/.test(f)
  const list = (keep: (f: string) => boolean) => [...where].filter(([f, w]) => keep(f) && w.size > 1).sort((a, b) => b[1].size - a[1].size).map(([f, w]) => `${f} ×${w.size} (${[...w].join(', ')})`)
  const charts = list(f => !isSeries(f))
  if (charts.length) out.push(`${charts.length} gráficos salen en más de una clase: ${charts.slice(0, 14).join(' · ')}${charts.length > 14 ? '…' : ''}`)
  const series = list(isSeries)
  if (series.length) out.push(`${series.length} series históricas se viven como pieza en más de una clase: ${series.join(' · ')}`)
  // Dos gráficos con distinto nombre pero del mismo activo y casi las mismas fechas se ven iguales: también cuentan
  const day = (d: string) => { const [a, b, c] = d.split('/').map(Number); return Date.UTC(c, b - 1, a) / 864e5 }
  const family = (k: string) => (k.startsWith('trend') ? 'trend' : k.split('-')[0])
  const ids = [...where.keys()].filter(k => charts[k]?.symbol && charts[k].from && charts[k].to && !/^(hist|series|mix)/.test(k))
  const twins: string[] = []
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = charts[ids[i]], b = charts[ids[j]]
    if (a.symbol !== b.symbol || family(ids[i]) !== family(ids[j])) continue
    const shared = Math.min(day(a.to!), day(b.to!)) - Math.max(day(a.from!), day(b.from!))
    if (shared / Math.min(day(a.to!) - day(a.from!), day(b.to!) - day(b.from!)) > 0.5) twins.push(`${ids[i]} ≈ ${ids[j]}`)
  }
  if (twins.length) out.push(`${twins.length} parejas de gráficos muestran casi el mismo tramo del mismo activo: ${twins.join(' · ')}`)
  const sorty: string[] = []
  for (const u of units) {
    const kinds = u.lessons.flatMap(l => l.steps.flatMap(s => (s.kind === 'PLAY' ? [s.play.widget.kind] : [])))
    const n = kinds.filter(k => k === 'sort').length
    if (kinds.length >= 3 && n / kinds.length > MAX_SORT_SHARE) sorty.push(`${u.id} ${n}/${kinds.length}`)
  }
  if (sorty.length) out.push(`En ${sorty.length} unidades, más de un tercio de las piezas son «clasifica las tarjetas»: ${sorty.join(' · ')}`)
  return out
}
