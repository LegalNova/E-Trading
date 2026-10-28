// Validación del contenido (pura): soluciones de cada tipo de ejercicio, ids únicos, dependencias y reglas del curso v2.
// La usan scripts/check-content.ts (curso entero) y scripts/check-units.ts (unidades sueltas mientras se escriben).
import type { ContentQuestion, ContentUnit } from './dsl'

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
        if ('body' in s && s.body.length > 700) r.errors.push(`${l.id}: paso «${'title' in s ? s.title : ''}» demasiado largo (${s.body.length})`)
      }
      const qs = quizzes[l.quizId] ?? []
      if (!qs.length) r.errors.push(`${l.id}: sin quiz`)
      const extra = l.isUnitReview || l.isBoss
      if (!extra) r.content++
      if (!extra && qs.length) {
        const types = [...new Set(qs.map(q => q.type))].sort()
        if (v2) {
          if (qs.length < 8 || qs.length > 15) r.errors.push(`${l.id}: ${qs.length} ejercicios (deben ser 8-15)`)
          if (types.length < 3) r.errors.push(`${l.id}: solo ${types.length} tipos de ejercicio (mínimo 3)`)
          if (!qs.some(q => DYNAMIC.has(q.type))) r.errors.push(`${l.id}: ningún ejercicio dinámico (solo test y verdadero/falso)`)
          if (l.steps.length > 4) r.errors.push(`${l.id}: ${l.steps.length} pantallas de teoría (máximo 4)`)
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
  return r
}
