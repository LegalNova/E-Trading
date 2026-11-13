import 'server-only'
// Clases, quiz, test de nivel y repaso de fallos (docs/02 §2, docs/07 §3–4)
import { isScored, tally } from '@/shared/scoring'
import type { AnswerResultT, CoursePathT, LessonStepT, LessonT, PathUnitT, PlacementFinishT, QuestionT, QuizFinishT, QuizStartT, StepCheckT } from '@/shared/contract'
import type { User } from '@/generated/prisma/client'
import { walkTexts } from '@/shared/play'
import { GEM_PRICES, HINT_TYPES } from '@/shared/gem-shop'
import { closure, ordered, suggestedRoute, suggestedSections, type RouteChoice, type RouteUnit } from '@/shared/route'
import { courseMinutes, lessonMinutes, LESSON, PLACEMENT, QUIZZES, RISK_LESSONS, UNITS, type ContentQuestion } from '../content/catalog'
import { canOpen, FULL_UNIT_COUNT, minPlan } from '@/shared/plans'
import { grade } from '../content/grading'
import { numChoices } from '../content/choices'
import { engineT, lessonTitleT, questionT, stepsT, unitT } from '../content/translate'
import { currentLocale } from '../locale'
import { afterReview } from './srs'
import { trackDaily, trackLessonStart } from './analytics'
import { maybeRewardInvite } from './invites'
import { addXp, bump, bumpGoal, endFx, fail, LIVES_MAX, livesOf, lumi, markActive, minutesOf, withCtx, type Ctx, type Tx } from './core'

export const ALL_Q: Record<string, ContentQuestion> = Object.fromEntries([...Object.values(QUIZZES).flat(), ...PLACEMENT].map(q => [q.id, q]))
/** Preguntas que cuentan para la nota y pueden ir a la lista de fallos (sin la ronda de humildad, src/shared/scoring.ts) */
export const SCORED_IDS = Object.keys(ALL_Q).filter(id => isScored(ALL_Q[id]))
const scoredId = (id: string) => isScored(ALL_Q[id])
/**
 * XP que se anuncia en la lista de clases: la de aprobarla más 10 por cada pregunta que puntúa (lo que se gana
 * acertándolas todas, sin contar los extras de pleno y rapidez). Antes se anunciaban «+30 XP» y al terminar llegaban
 * más de 100 (auditoría APP-17).
 */
const shownXp = (l: { xp: number; quizId: string }) => l.xp + 10 * (QUIZZES[l.quizId] ?? []).filter(isScored).length
/** Lo que ve el alumno: nunca la solución, las consecuencias ni el futuro del gráfico */
/**
 * Sin emojis en lo que se enseña (quedan poco profesionales). Se quitan al enviar y no en el contenido: el orden en
 * que se barajan las opciones depende del texto original, y las traducciones van por posición.
 */
const EMOJI = /\s?[\u2190-\u21ff\u2300-\u23ff\u2460-\u27bf\u2b00-\u2bff\u{1F000}-\u{1FAFF}\ufe0f\u200d]+/gu
/** La app vuelve a llamarse E-Trading (Lumi es solo la mascota y profesora): el contenido ya dice «E-Trading» y se envía tal cual */
const brand = (t: string) => t
const clean = (t: string) => brand(t.replace(EMOJI, '').trim())
/** «(redondea…)» sobra cuando la cifra se elige entre opciones */
const ROUND_NOTE = /\s*\((?:redondea|arrodoneix|round)[^)]*\)/gi
const publicQ = (q: ContentQuestion): QuestionT => ({
  id: q.id, type: q.type, prompt: clean(q.type === 'NUMBER' ? q.prompt.replace(ROUND_NOTE, '') : q.prompt), options: q.options.map(clean), chart: q.chart, candles: q.candles, right: q.right?.map(clean),
  // Las de cifra se responden tocando una opción (una de ellas es la buena, como en un test)
  meta: q.type === 'NUMBER' ? { ...q.meta, choices: numChoices(q.id, q.solution as number, q.tol ?? 0.01) } : q.meta && { ...q.meta, lines: q.meta.lines?.map(clean), senders: q.meta.senders?.map(clean) },
})

/** El curso tal como lo necesitan las rutas: unidades en orden, con su sección y lo que esa sección necesita */
export const ROUTE_GRAPH: RouteUnit[] = UNITS.filter(u => !u.side).map(u => ({ id: u.id, section: u.section?.id ?? null, requires: u.section?.requires ?? [] }))
/** La ruta guardada del usuario, ya coherente (undefined: aún no ha elegido; sin unidades: curso entero) */
export function routeOf(user: User): RouteChoice | undefined {
  const r = (user.settings as { route?: Partial<RouteChoice> | null } | null)?.route
  if (!r) return undefined
  return { preset: r.preset === 'LONG' || r.preset === 'TRADING' ? r.preset : null, units: closure(ROUTE_GRAPH, Array.isArray(r.units) ? r.units.filter(x => typeof x === 'string') : []) }
}
/** El camino principal en orden (sin «Tu dinero en orden», que es opcional, ni las unidades paralelas) */
const MAIN_PATH = UNITS.filter(u => !u.side && u.section?.id !== 's1')
/**
 * Clases que supera la prueba de unidad: todas menos el reto final de sección (si la unidad lo lleva). El reto mezcla
 * toda la sección y abre las siguientes: la prueba de una sola unidad no lo puede aprobar por él.
 */
const testOutLessons = (u: (typeof UNITS)[number]) => u.lessons.filter(l => !l.isBoss)
/** ¿Superó la unidad con la prueba de unidad? (todas sus clases marcadas como saltadas) */
const testedOut = (u: (typeof UNITS)[number], done: Map<string, { skipped: boolean }>) => testOutLessons(u).every(l => done.get(l.id)?.skipped)

/** Unidades completas a las que tiene derecho su plan: las N primeras del camino, sin contar las superadas con la prueba */
function fullUnitsOf(plan: User['plan'], done: Map<string, { skipped: boolean }>) {
  const out = new Set<string>()
  let left = FULL_UNIT_COUNT[plan]
  for (const u of MAIN_PATH) {
    if (left <= 0) break
    out.add(u.id)
    if (!testedOut(u, done)) left--
  }
  return out
}

export async function pathOf(tx: Tx, user: User): Promise<CoursePathT> {
  const loc = currentLocale()
  const rows = await tx.lessonProgress.findMany({ where: { userId: user.id } })
  const done = new Map(rows.map(r => [r.lessonId, r]))
  const extra = fullUnitsOf(user.plan, done)
  // Una lección disponible cada vez en cada «camino»: el principal (o cada sección abierta del curso v2) y cada
  // unidad paralela (Vocabulario). Una sección se abre al aprobar el reto final de las secciones que necesita.
  const found = { main: false, side: new Set<string>(), sections: new Set<string>() }
  // El equipo (ADMIN) tiene todo abierto: puede entrar en cualquier clase sin hacer las anteriores
  const admin = user.role === 'ADMIN'
  // Quien aprobó el antiguo primer reto («Fundamentos del dinero», s1) antes del cambio de orden sigue teniendo abierto lo que ya tenía
  const bossDone = (sid: string) => admin || done.has(`${sid}boss`) || (sid === 's0' && done.has('s1boss'))
  const sectionOpen = (u: (typeof UNITS)[number]) => !u.section || u.section.requires.every(bossDone)
  let currentUnitId = UNITS[0].id
  let currentSet = false
  const units: PathUnitT[] = UNITS.map(u => {
    let idx = 0
    const lessons = u.lessons.map(l => {
      const p = done.get(l.id)
      const index = l.isUnitReview ? -1 : idx++
      // El reto final de sección está abierto en todos los planes (si no, el plan gratis no podría avanzar de sección)
      const requiredPlan = l.isBoss || (extra.has(u.id) && user.plan === 'FREE') ? 'FREE' : minPlan(u.id, index, !!l.isUnitReview, l.id)
      const requiresPremium = !l.isBoss && !canOpen(user.plan, u.id, index, !!l.isUnitReview, l.id, extra)
      let status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED' = 'LOCKED'
      const sec = u.section?.id
      const free = u.side ? !found.side.has(u.id) : sec ? sectionOpen(u) && !found.sections.has(sec) : !found.main
      if (p) status = 'COMPLETED'
      else if (admin) status = 'AVAILABLE'
      else if (!requiresPremium && free) {
        status = 'AVAILABLE'
        if (u.side) found.side.add(u.id)
        else {
          if (sec) found.sections.add(sec)
          else found.main = true
          if (!currentSet) {
            currentUnitId = u.id
            currentSet = true
          }
        }
      }
      return { id: l.id, title: lessonTitleT(loc, l.id, l.title), status, stars: p?.stars ?? 0, minutes: Math.max(1, Math.round(lessonMinutes(l))), xp: shownXp(l), isUnitReview: !!l.isUnitReview, requiresPremium, requiredPlan }
    })
    const n = lessons.filter(l => l.status === 'COMPLETED').length
    const plans = new Set(lessons.map(l => l.requiredPlan))
    const access = plans.has('PREMIUM') ? (plans.has('FREE') ? 'PARTIAL_MAX' : 'MAX') : plans.has('PLUS') ? 'PARTIAL_PLUS' : 'FREE'
    const titleOf = (sid: string) => {
      const x = UNITS.find(y => y.section?.id === sid)
      return (x && unitT(loc, x.id)?.section) ?? x?.section?.title ?? sid
    }
    const ut = unitT(loc, u.id)
    const section = u.section ? { id: u.section.id, title: ut?.section ?? u.section.title, open: sectionOpen(u), needs: u.section.requires.filter(r => !bossDone(r)).map(titleOf), requires: u.section.requires } : undefined
    // Prueba de unidad: en una sección abierta, con la unidad a su alcance y aún sin terminar
    const testOut = !u.side && sectionOpen(u) && testOutLessons(u).some(l => !done.has(l.id)) && lessons.every(l => !l.requiresPremium)
    return { id: u.id, order: u.order, title: ut?.title ?? u.title, description: ut?.description ?? u.description, progressPct: u.lessons.length ? Math.round((n / u.lessons.length) * 100) : 0, access, side: !!u.side, unlocksFeature: u.unlocksFeature, section, testOut, lessons }
  })
  // La ruta elegida (auditoría TEM-5): decide por dónde seguir y qué se enseña primero. No abre ni cierra nada.
  const choice = routeOf(user)
  const goals = ((user.onboarding as { goals?: unknown } | null)?.goals as unknown[] | undefined)?.filter((g): g is string => typeof g === 'string') ?? []
  const routeHint = { preset: suggestedRoute(goals), sections: suggestedSections(goals) }
  let route: CoursePathT['route'] = null
  if (choice?.units.length) {
    const order = ordered(ROUTE_GRAPH, choice.units, choice.preset)
    const mine = order.map(id => units.find(u => u.id === id)!).filter(Boolean)
    for (const u of mine) u.inRoute = true
    // (como en el resumen del curso: clases de contenido, sin repasos ni retos finales)
    const content = mine.flatMap(u => u.lessons).filter(l => !l.isUnitReview && !l.id.endsWith('boss'))
    const next = mine.flatMap(u => u.lessons.map(l => ({ l, u }))).find(x => x.l.status === 'AVAILABLE')
    if (next) currentUnitId = next.u.id
    route = { preset: choice.preset, units: order, done: content.filter(l => l.status === 'COMPLETED').length, total: content.length, minutesLeft: content.filter(l => l.status !== 'COMPLETED').reduce((a, l) => a + l.minutes, 0), nextLessonId: next?.l.id ?? null }
  }
  return { courseId: 'de-cero-a-inversor', title: engineT(loc).course, currentUnitId, units, minutesTotal: courseMinutes(), dailyGoalMinutes: minutesOf(user), route, routeChosen: !!choice, routeHint }
}

export async function lesson(user: User, tx: Tx, id: string, peek = false): Promise<LessonT> {
  const l = LESSON[id] ?? fail(404, 'NOT_FOUND', 'Lección no encontrada')
  const st = (await pathOf(tx, user)).units.flatMap(u => u.lessons).find(x => x.id === id)!
  if (st.requiresPremium && !peek) await trackDaily(tx, user.id, 'paywall', { lessonId: id })
  if (st.requiresPremium) fail(403, 'FEATURE_LOCKED', st.requiredPlan === 'PLUS' ? 'Esta lección está en el plan Plus' : 'Esta lección está en el plan Max')
  // Las lecciones se abren en orden: no se puede saltar a una bloqueada desde la URL
  if (st.status === 'LOCKED') fail(403, 'LESSON_LOCKED', 'Termina la clase anterior para abrir esta')
  if (!peek) await trackLessonStart(tx, user.id, id)
  const loc = currentLocale()
  const e = engineT(loc)
  const title = lessonTitleT(loc, id, l.title)
  const unitTitle = unitT(loc, l.unit.id)?.title ?? l.unit.title
  // Los repasos y retos finales llevan una introducción fija del motor; el resto, la traducción de sus pasos
  const src = l.isUnitReview || l.isBoss ? l.steps.map(s => (s.kind === 'TEXT' && loc !== 'es' ? { ...s, ...(l.isBoss ? e.boss(title) : e.review(unitTitle, l.unit.lessons.filter(x => !x.isUnitReview).map(x => lessonTitleT(loc, x.id, x.title).toLowerCase()).join(', '))) } : s)) : stepsT(loc, id, l.steps)
  const steps: LessonStepT[] = src.map((s, i): LessonStepT => {
    const sid = `${id}-s${i}`
    if (s.kind === 'TEXT') return { id: sid, type: 'TEXT', title: s.title, body: s.body, keyIdea: s.key, companionTip: s.tip }
    if (s.kind === 'IMAGE') return { id: sid, type: 'IMAGE', title: s.title, body: s.body, image: s.image, companionTip: s.tip }
    if (s.kind === 'CHART') return { id: sid, type: 'INTERACTIVE_CHART', prompt: s.prompt, caption: s.caption, candles: s.candles }
    if (s.kind === 'CALC') return { id: sid, type: 'CALCULATOR', title: s.title, body: s.body, calc: s.calc, companionTip: s.tip }
    if (s.kind === 'PLAY') return { id: sid, type: 'PLAY', ...s.play }
    if (s.kind === 'STORY') return { id: sid, type: 'STORY', ...s.story }
    return { id: sid, type: 'SIMULATOR_TASK', title: s.title, body: s.body, task: s.task }
  })
  steps.push({ id: `${id}-quiz`, type: 'QUIZ', quizId: l.quizId, title: e.quizTitle, body: e.quizBody((QUIZZES[l.quizId] ?? []).length, user.plan === 'FREE') }) // vidas ilimitadas en Plus y Max
  return { id, title, unitTitle, minutes: l.minutes, xp: shownXp(l), steps: steps.map(st => walkTexts(st, brand)) }
}

export const checkStep = (lessonId: string, stepId: string, idx: number) =>
  withCtx(async (c): Promise<StepCheckT> => {
    const l = LESSON[lessonId]
    const i = Number(stepId.split('-s')[1])
    const s = l && stepsT(currentLocale(), lessonId, l.steps)[i]
    if (!s || s.kind !== 'CHART') return fail(404, 'NOT_FOUND', 'Paso no encontrado')
    // Como la propia lección: una clase cerrada por plan o aún bloqueada no se puede corregir desde fuera
    const st = (await pathOf(c.tx, c.user)).units.flatMap(u => u.lessons).find(x => x.id === lessonId)
    if (st?.requiresPremium) fail(403, 'FEATURE_LOCKED', st.requiredPlan === 'PLUS' ? 'Esta lección está en el plan Plus' : 'Esta lección está en el plan Max')
    if (st?.status === 'LOCKED') fail(403, 'LESSON_LOCKED', 'Termina la clase anterior para abrir esta')
    const correct = idx === s.solution
    return { correct, explanation: correct ? s.ok : s.ko }
  })

/** Preguntas de cálculo (de cifra) como mucho por quiz de clase: ninguna en «Invierte desde hoy», una en el resto */
const maxNumbers = (unitSection?: string) => (unitSection === 's0' ? 0 : 1)
/** Repaso mezclado: preguntas de clases anteriores que tocaba repasar, al final del quiz de cada clase */
const MIXED_REVIEW = 2
/** Prueba de unidad: preguntas de todas sus clases (2 de cada una, primero las dinámicas, sin las de cifra), hasta 10 */
const TESTOUT_MAX = 10
export const TESTOUT_PASS = 0.8

function testOutQuestions(unitId: string) {
  const u = UNITS.find(x => x.id === unitId)
  if (!u) return []
  const lists = u.lessons.filter(l => !l.isUnitReview && !l.isBoss).map(l => {
    const qs = (QUIZZES[l.quizId] ?? []).filter(q => q.type !== 'NUMBER' && isScored(q))
    const dyn = qs.filter(q => !['SINGLE', 'TRUE_FALSE', 'FILL_BLANK'].includes(q.type))
    return [...dyn.slice(0, 1), ...qs.filter(q => q !== dyn[0]).slice(0, 1)]
  })
  const out: ContentQuestion[] = []
  for (let k = 0; out.length < TESTOUT_MAX && lists.some(l => k < l.length); k++) for (const l of lists) if (k < l.length && out.length < TESTOUT_MAX) out.push(l[k])
  return out
}

export const quizStart = (id: string) =>
  withCtx(async (c): Promise<QuizStartT> => {
    let mode: 'LESSON' | 'PLACEMENT' | 'REVIEW' | 'TESTOUT' = 'LESSON'
    let qs: ContentQuestion[]
    let attemptRef: string | null = null
    const reviewIds = new Set<string>()
    if (id.startsWith('testout-')) {
      // «¿Ya lo sabes?»: con el 80 % la unidad queda superada (no gasta vidas)
      const unitId = id.slice('testout-'.length)
      const pu = (await pathOf(c.tx, c.user)).units.find(u => u.id === unitId)
      if (!pu) fail(404, 'NOT_FOUND', 'Unidad no encontrada')
      if (!pu!.testOut) fail(403, 'LESSON_LOCKED', 'Esta unidad aún no se puede saltar')
      mode = 'TESTOUT'
      attemptRef = `testout:${unitId}`
      qs = testOutQuestions(unitId)
    } else if (id === 'placement') {
      if (c.g.placementDone) fail(409, 'CONFLICT', 'El test de nivel solo se hace una vez')
      mode = 'PLACEMENT'
      qs = PLACEMENT
    } else if (id === 'review') {
      mode = 'REVIEW'
      const m = await c.tx.mistake.findMany({ where: { userId: c.user.id, questionId: { in: SCORED_IDS }, dueAt: { lte: new Date() } }, orderBy: { dueAt: 'asc' }, take: 8 })
      qs = m.map(x => ALL_Q[x.questionId]).filter(Boolean)
      if (!qs.length) fail(404, 'NOT_FOUND', 'Hoy no te toca repasar nada: vuelve mañana')
      // Un solo repaso abierto a la vez: con varios abiertos se responderían los mismos fallos en cada uno
      // (XP repetida y fallos que se dan por dominados en un minuto)
      await c.tx.quizAttempt.updateMany({ where: { userId: c.user.id, mode: 'REVIEW', finishedAt: null }, data: { finishedAt: new Date() } })
    } else {
      const l = LESSON[id] ?? fail(404, 'NOT_FOUND', 'Lección no encontrada')
      await lesson(c.user, c.tx, id) // comprueba el acceso por plan
      if (livesOf(c.user, c.g).current <= 0) fail(409, 'NO_LIVES', 'Te has quedado sin vidas')
      const own = QUIZZES[l.quizId] ?? []
      // Sin cuentas a mano: como mucho las preguntas de cifra que permite la sección (si quedan al menos 4)
      const numbers = own.filter(q => q.type === 'NUMBER')
      const keep = new Set(numbers.slice(0, maxNumbers(l.unit.section?.id)))
      const trimmed = own.filter(q => q.type !== 'NUMBER' || keep.has(q))
      qs = trimmed.length >= 4 ? trimmed : own
      // Lo aprendido vuelve: hasta 2 fallos de clases anteriores que ya tocaba repasar
      const ownIds = new Set(own.map(q => q.id))
      const due = await c.tx.mistake.findMany({ where: { userId: c.user.id, dueAt: { lte: new Date() }, questionId: { in: SCORED_IDS } }, orderBy: { dueAt: 'asc' }, take: 6 })
      for (const m of due.filter(x => !ownIds.has(x.questionId) && ALL_Q[x.questionId].type !== 'NUMBER').slice(0, MIXED_REVIEW)) {
        qs = [...qs, ALL_Q[m.questionId]]
        reviewIds.add(m.questionId)
      }
    }
    const at = await c.tx.quizAttempt.create({ data: { userId: c.user.id, mode, lessonId: mode === 'LESSON' ? id : attemptRef, questionIds: qs.map(q => q.id) } })
    const loc = currentLocale()
    const pub = (q: ContentQuestion) => {
      const x = publicQ(questionT(loc, q))
      return reviewIds.has(q.id) ? { ...x, meta: { ...x.meta, review: true } } : x
    }
    return { attemptId: at.id, lessonId: mode === 'LESSON' ? at.lessonId : null, isPlacement: mode === 'PLACEMENT', questions: qs.map(pub), lives: livesOf(c.user, c.g) }
  })

async function attemptOf(c: Ctx, id: string) {
  const at = await c.tx.quizAttempt.findUnique({ where: { id }, include: { answers: true } })
  if (!at || at.userId !== c.user.id) fail(404, 'NOT_FOUND', 'Intento no encontrado')
  return at!
}

/**
 * Pista con gemas (auditoría PRO-1): quita una opción incorrecta de una pregunta de opción única aún sin responder.
 * Devuelve qué opción (posición, tal como se ve) se tacha. Se elige siempre la misma para la misma pregunta.
 */
export const hint = (attemptId: string, questionId: string) =>
  withCtx(async c => {
    const at = await attemptOf(c, attemptId)
    if (at.finishedAt) fail(409, 'CONFLICT', 'El quiz ya ha terminado')
    if (!at.questionIds.includes(questionId)) fail(404, 'NOT_FOUND', 'Pregunta no encontrada')
    if (at.answers.some(a => a.questionId === questionId)) fail(409, 'CONFLICT', 'Pregunta ya respondida')
    const q = ALL_Q[questionId]
    if (!q || !HINT_TYPES.has(q.type) || typeof q.solution !== 'number' || q.options.length < 3) fail(400, 'BAD_REQUEST', 'Esta pregunta no admite pista')
    if (c.g.gems < GEM_PRICES.hint) fail(402, 'INSUFFICIENT_GEMS', `Necesitas ${GEM_PRICES.hint} gemas`)
    c.g.gems -= GEM_PRICES.hint
    const wrong = q.options.map((_, i) => i).filter(i => i !== q.solution)
    let h = 0
    for (const ch of questionId) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const removed = wrong[h % wrong.length]
    await endFx(c)
    return { removed, gems: c.g.gems }
  })

export const answer = (attemptId: string, questionId: string, value: unknown, elapsedMs: number) =>
  withCtx(async (c): Promise<AnswerResultT> => {
    const at = await attemptOf(c, attemptId)
    if (at.finishedAt) fail(409, 'CONFLICT', 'El quiz ya ha terminado')
    if (Date.now() - at.startedAt.getTime() > 3_600_000) fail(409, 'CONFLICT', 'Este quiz ha caducado. Empieza otro.')
    if (!at.questionIds.includes(questionId)) fail(404, 'NOT_FOUND', 'Pregunta no encontrada')
    if (at.answers.some(a => a.questionId === questionId)) fail(409, 'CONFLICT', 'Pregunta ya respondida')
    const premium = c.user.plan !== 'FREE' // vidas ilimitadas en Plus y Max
    if (at.mode === 'LESSON' && !premium && c.g.lives <= 0) fail(409, 'NO_LIVES', 'Te has quedado sin vidas')
    // Las preguntas de repaso mezcladas en una clase no quitan vidas y siguen el repaso espaciado
    const own = at.mode === 'LESSON' && at.lessonId && LESSON[at.lessonId] ? new Set((QUIZZES[LESSON[at.lessonId].quizId] ?? []).map(q => q.id)) : null
    const spaced = at.mode === 'REVIEW' || (!!own && !own.has(questionId))
    const q = ALL_Q[questionId]
    // Ronda de humildad («¿sube o baja?» sobre un gráfico anónimo): se responde y se revela, pero no puntúa
    const scored = isScored(q)
    // Las de «¿sube o baja?» no cuestan vida: aunque se razonen, tienen parte de azar
    const costsLife = at.mode === 'LESSON' && !spaced && !premium && q?.type !== 'UP_DOWN'
    const loc = currentLocale()
    const tq = questionT(loc, q)
    // «Completa el hueco» llega con el texto que se vio (sin emojis): se corrige con la opción original
    const v = tq.type === 'FILL_BLANK' && typeof value === 'string' ? (tq.options.find(o => clean(o) === value) ?? value) : value
    const g = grade(tq, v, loc)
    const correct = g.correct
    await c.tx.quizAnswer.create({ data: { attemptId, questionId, correct, elapsedMs: Math.max(0, Math.min(600_000, Math.round(elapsedMs) || 0)) } })
    if (!correct && costsLife) {
      if (c.g.lives >= LIVES_MAX) c.g.livesUpdatedAt = new Date()
      c.g.lives = Math.max(0, c.g.lives - 1)
    }
    if (at.mode !== 'PLACEMENT') {
      // Contadores de las insignias de ejercicios (cálculo, estafas, simulación, velas, «¿sube o baja?»)
      if (correct && scored) bump(c, `ok_${q.type}`)
      if (q.type === 'UP_DOWN') bump(c, 'updown')
      const key = { userId_questionId: { userId: c.user.id, questionId } }
      if (!scored) {
        // Si quedó en la lista de fallos de antes, se quita: aquí no hay nada que repasar
        await c.tx.mistake.deleteMany({ where: { userId: c.user.id, questionId } })
      } else if (spaced) {
        // Repaso espaciado: cada acierto lo aplaza (1, 3, 7 y 16 días) y el último lo da por dominado
        const m = await c.tx.mistake.findUnique({ where: key })
        const step = afterReview(m?.box ?? 0, correct)
        if (step.done) await c.tx.mistake.deleteMany({ where: { userId: c.user.id, questionId } })
        else await c.tx.mistake.upsert({ where: key, create: { userId: c.user.id, questionId, box: step.box, dueAt: step.dueAt }, update: { box: step.box, dueAt: step.dueAt } })
        if (correct) bump(c, 'reviewed')
      } else if (!correct) await c.tx.mistake.upsert({ where: key, create: { userId: c.user.id, questionId }, update: { box: 0, dueAt: new Date() } })
    }
    // La buena, tal como se vio (en «completa el hueco», la opción en su idioma)
    return { correct, correctAnswer: typeof tq.solution === 'string' ? clean(tq.solution) : tq.solution, explanation: clean(g.explanation), reveal: g.reveal, livesLeft: costsLife ? c.g.lives : null, xpGained: correct && scored && at.mode !== 'PLACEMENT' ? 10 : 0, scored }
  })

export const quizFinish = (attemptId: string) =>
  withCtx(async (c): Promise<QuizFinishT> => {
    const at = await attemptOf(c, attemptId)
    if (at.finishedAt && at.result) return at.result as unknown as QuizFinishT // idempotente
    if (at.mode === 'PLACEMENT') fail(400, 'VALIDATION_ERROR', 'Usa el final del test de nivel')
    if (at.finishedAt) fail(409, 'CONFLICT', 'Este repaso se ha cerrado porque has empezado otro')
    if (at.mode === 'TESTOUT') return finishTestOut(c, at)
    // La ronda de humildad no cuenta: ni en los aciertos ni en el total (src/shared/scoring.ts)
    const { correct, total } = tally(at.questionIds, at.answers, scoredId)
    const l = at.lessonId ? LESSON[at.lessonId] : null
    // Las estrellas se ganan con las preguntas de la clase (las de repaso mezcladas suman XP, pero no cuentan aquí)
    const ownIds = l ? new Set((QUIZZES[l.quizId] ?? []).map(q => q.id)) : null
    const own = ownIds ? tally(at.questionIds, at.answers, scoredId, id => ownIds.has(id)) : { correct, total }
    const ownTotal = own.total
    const ownCorrect = own.correct
    const ratio = ownTotal ? ownCorrect / ownTotal : 0
    const perfect = ownCorrect === ownTotal && ownTotal > 0
    // Se aprueba con el 60 %; el reto final de sección exige su propio mínimo (80 %)
    const passMin = (l?.passPct ?? 60) / 100
    const stars = at.mode === 'REVIEW' ? 0 : perfect ? 3 : ratio >= Math.max(0.8, passMin) ? 2 : ratio >= passMin ? 1 : 0
    const durationMs = Date.now() - at.startedAt.getTime()
    // Rapidez medida con la hora del servidor (no la que envía el navegador)
    const lastAnswer = at.answers.reduce((m, a) => Math.max(m, a.createdAt.getTime()), at.startedAt.getTime())
    const avgMs = (lastAnswer - at.startedAt.getTime()) / Math.max(1, at.answers.length)
    const prev = at.lessonId ? await c.tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: c.user.id, lessonId: at.lessonId } } }) : null
    const lessonXp = l && stars > 0 && !prev ? l.xp : 0
    // Repetir el mismo quiz da XP solo 2 veces al día (no se puede «granjear» XP)
    // (cuenta todos los intentos terminados, aprobados o no: suspender a propósito tampoco da XP infinita)
    // El primer aprobado de una clase siempre da su XP (antes, quien había suspendido dos veces aprobaba a la tercera sin XP)
    const repeatsToday = at.lessonId ? await c.tx.quizAttempt.count({ where: { userId: c.user.id, lessonId: at.lessonId, finishedAt: { gte: new Date(Date.now() - 86_400_000) } } }) : 0
    const farming = at.mode === 'REVIEW' || lessonXp > 0 ? false : repeatsToday >= 2
    // Auditoría PRO-7: quedarse sin vidas no obliga a pagar. Un repaso de fallos con al menos un acierto devuelve una
    // vida en el plan gratis (como mucho tres al día, para que no sustituya a aprender clases)
    const lifeDay = c.counters as { lifeDay?: string; lifeWins?: number }
    const lifeWinsToday = lifeDay.lifeDay === c.today ? (lifeDay.lifeWins ?? 0) : 0
    const lifeWon = at.mode === 'REVIEW' && c.user.plan === 'FREE' && correct > 0 && c.g.lives < LIVES_MAX && lifeWinsToday < 3
    if (lifeWon) {
      c.g.lives += 1
      Object.assign(c.counters, { lifeDay: c.today, lifeWins: lifeWinsToday + 1 })
    }
    const base = farming ? 0 : correct * 10 + lessonXp
    const perfectBonus = perfect && !farming ? Math.round(correct * 10 * 0.5) : 0
    const speedBonus = avgMs < 15_000 && correct > 0 && !farming ? Math.round(base * 0.1) : 0
    addXp(c, base + perfectBonus + speedBonus)
    // La racha cuenta con el quiz terminado (todas las preguntas respondidas): empezar y cerrar uno vacío no es un día activo
    const complete = at.answers.length >= at.questionIds.length
    const extendedToday = complete ? await markActive(c) : false
    if (at.lessonId && stars > 0) {
      await c.tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: c.user.id, lessonId: at.lessonId } },
        create: { userId: c.user.id, lessonId: at.lessonId, stars },
        update: { stars: Math.max(stars, prev?.stars ?? 0), skipped: false },
      })
      if (!prev) {
        await bumpGoal(c, 'lesson')
        // Primera clase de alguien que llegó invitado: mes de Max para los dos
        await maybeRewardInvite(c.tx, c.user.id)
        // Órdenes avanzadas: se desbloquean con la primera de las clases que las abren (no se anuncia dos veces)
        if (RISK_LESSONS.includes(at.lessonId) && c.user.plan !== 'PREMIUM' && (await c.tx.lessonProgress.count({ where: { userId: c.user.id, lessonId: { in: RISK_LESSONS.filter(x => x !== at.lessonId) } } })) === 0) c.fx.features = ['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT']
      }
    }
    if (perfect && at.mode === 'LESSON' && !farming) {
      bump(c, 'perfect')
      if (durationMs < 60_000) bump(c, 'fastPerfect')
      await bumpGoal(c, 'perfect')
    }
    c.fx.companion = perfect ? lumi(c, 'QUIZ_PERFECT') : stars > 0 ? lumi(c, 'LESSON_COMPLETED', { concepto: l?.unit.title.toLowerCase() ?? 'inversión' }) : lumi(c, 'QUIZ_WRONG')
    const eff = await endFx(c)
    const out: QuizFinishT = { ...eff, correct, total, stars, durationMs, xpBreakdown: { base, perfectBonus, speedBonus, total: base + perfectBonus + speedBonus }, streak: { days: c.g.streak, extendedToday }, ...(lifeWon ? { lifeWon } : {}) }
    await c.tx.quizAttempt.update({ where: { id: at.id }, data: { finishedAt: new Date(), result: JSON.parse(JSON.stringify(out)) } })
    return out
  })

/** Final de la prueba de unidad: con el 80 % la unidad queda superada (sus clases, marcadas como saltadas) */
async function finishTestOut(c: Ctx, at: Awaited<ReturnType<typeof attemptOf>>): Promise<QuizFinishT> {
  const unit = UNITS.find(u => `testout:${u.id}` === at.lessonId)
  const { correct, total } = tally(at.questionIds, at.answers, scoredId)
  const passed = !!unit && total > 0 && correct / total >= TESTOUT_PASS
  // Como en las clases: repetir la prueba da XP solo 2 veces al día
  const repeatsToday = await c.tx.quizAttempt.count({ where: { userId: c.user.id, lessonId: at.lessonId, finishedAt: { gte: new Date(Date.now() - 86_400_000) } } })
  const farming = repeatsToday >= 2 && !passed // superarla da su XP aunque sea al tercer intento (solo se supera una vez)
  const base = farming ? 0 : correct * 10 + (passed ? 50 : 0)
  if (passed) await c.tx.lessonProgress.createMany({ data: testOutLessons(unit!).map(l => ({ userId: c.user.id, lessonId: l.id, stars: 0, skipped: true })), skipDuplicates: true })
  addXp(c, base)
  const extendedToday = at.answers.length >= total ? await markActive(c) : false
  c.fx.companion = passed ? lumi(c, 'QUIZ_PERFECT') : lumi(c, 'QUIZ_WRONG')
  const eff = await endFx(c)
  const out: QuizFinishT = { ...eff, correct, total, stars: passed ? 3 : 0, durationMs: Date.now() - at.startedAt.getTime(), xpBreakdown: { base, perfectBonus: 0, speedBonus: 0, total: base }, streak: { days: c.g.streak, extendedToday } }
  await c.tx.quizAttempt.update({ where: { id: at.id }, data: { finishedAt: new Date(), result: JSON.parse(JSON.stringify(out)) } })
  return out
}

export const placementFinish = (attemptId: string) =>
  withCtx(async (c): Promise<PlacementFinishT> => {
    const at = await attemptOf(c, attemptId)
    if (at.mode !== 'PLACEMENT') fail(400, 'VALIDATION_ERROR', 'No es un test de nivel')
    if (c.g.placementDone || at.finishedAt) fail(409, 'CONFLICT', 'El test de nivel solo se hace una vez')
    const correct = at.answers.filter(a => a.correct).length
    const total = at.questionIds.length
    const skip = correct >= 5
    c.g.placementDone = true
    // El test de nivel pregunta por lo básico del dinero: si lo sabe, salta «El dinero y la inflación» (sección opcional).
    // Todos empiezan por «Invierte desde hoy»; ahí cada unidad se puede saltar con su prueba de unidad.
    const money = UNITS.find(u => u.id === 'u1')
    if (skip && money) await c.tx.lessonProgress.createMany({ data: money.lessons.map(l => ({ userId: c.user.id, lessonId: l.id, stars: 0, skipped: true })), skipDuplicates: true })
    await c.tx.quizAttempt.update({ where: { id: at.id }, data: { finishedAt: new Date() } })
    const start = UNITS[0]
    const ut = unitT(currentLocale(), start.id)
    return { correct, total, startUnitId: start.id, startUnitTitle: ut?.title ?? start.title, skippedUnitTitles: skip && money ? [unitT(currentLocale(), money.id)?.title ?? money.title] : [] }
  })
