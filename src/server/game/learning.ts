import 'server-only'
// Clases, quiz, test de nivel y repaso de fallos (docs/02 §2, docs/07 §3–4)
import type { AnswerResultT, CoursePathT, LessonStepT, LessonT, PathUnitT, PlacementFinishT, QuestionT, QuizFinishT, QuizStartT, StepCheckT } from '@/shared/contract'
import type { User } from '@/generated/prisma/client'
import { courseMinutes, lessonMinutes, LESSON, PLACEMENT, QUIZZES, RISK_LESSON, UNITS, type ContentQuestion } from '../content/catalog'
import { canOpen, minPlan } from '@/shared/plans'
import { grade } from '../content/grading'
import { engineT, lessonTitleT, questionT, stepsT, unitT } from '../content/translate'
import { currentLocale } from '../locale'
import { afterReview } from './srs'
import { addXp, bump, bumpGoal, endFx, fail, LIVES_MAX, livesOf, lumi, markActive, minutesOf, withCtx, type Ctx, type Tx } from './core'

export const ALL_Q: Record<string, ContentQuestion> = Object.fromEntries([...Object.values(QUIZZES).flat(), ...PLACEMENT].map(q => [q.id, q]))
/** Lo que ve el alumno: nunca la solución, las consecuencias ni el futuro del gráfico */
const publicQ = (q: ContentQuestion): QuestionT => ({ id: q.id, type: q.type, prompt: q.prompt, options: q.options, chart: q.chart, candles: q.candles, right: q.right, meta: q.meta })

export async function pathOf(tx: Tx, user: User): Promise<CoursePathT> {
  const loc = currentLocale()
  const rows = await tx.lessonProgress.findMany({ where: { userId: user.id } })
  const done = new Map(rows.map(r => [r.lessonId, r]))
  // Una lección disponible cada vez en cada «camino»: el principal (o cada sección abierta del curso v2) y cada
  // unidad paralela (Vocabulario). Una sección se abre al aprobar el reto final de las secciones que necesita.
  const found = { main: false, side: new Set<string>(), sections: new Set<string>() }
  const bossDone = (sid: string) => done.has(`${sid}boss`)
  const sectionOpen = (u: (typeof UNITS)[number]) => !u.section || u.section.requires.every(bossDone)
  let currentUnitId = UNITS[0].id
  let currentSet = false
  const units: PathUnitT[] = UNITS.map(u => {
    let idx = 0
    const lessons = u.lessons.map(l => {
      const p = done.get(l.id)
      const index = l.isUnitReview ? -1 : idx++
      // El reto final de sección está abierto en todos los planes (si no, el plan gratis no podría avanzar de sección)
      const requiredPlan = l.isBoss ? 'FREE' : minPlan(u.id, index, !!l.isUnitReview, l.id)
      const requiresPremium = !l.isBoss && !canOpen(user.plan, u.id, index, !!l.isUnitReview, l.id)
      let status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED' = 'LOCKED'
      const sec = u.section?.id
      const free = u.side ? !found.side.has(u.id) : sec ? sectionOpen(u) && !found.sections.has(sec) : !found.main
      if (p) status = 'COMPLETED'
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
      return { id: l.id, title: lessonTitleT(loc, l.id, l.title), status, stars: p?.stars ?? 0, minutes: Math.max(1, Math.round(lessonMinutes(l))), xp: l.xp, isUnitReview: !!l.isUnitReview, requiresPremium, requiredPlan }
    })
    const n = lessons.filter(l => l.status === 'COMPLETED').length
    const plans = new Set(lessons.map(l => l.requiredPlan))
    const access = plans.has('PREMIUM') ? (plans.has('FREE') ? 'PARTIAL_MAX' : 'MAX') : plans.has('PLUS') ? 'PARTIAL_PLUS' : 'FREE'
    const titleOf = (sid: string) => {
      const x = UNITS.find(y => y.section?.id === sid)
      return (x && unitT(loc, x.id)?.section) ?? x?.section?.title ?? sid
    }
    const ut = unitT(loc, u.id)
    const section = u.section ? { id: u.section.id, title: ut?.section ?? u.section.title, open: sectionOpen(u), needs: u.section.requires.filter(r => !bossDone(r)).map(titleOf) } : undefined
    return { id: u.id, order: u.order, title: ut?.title ?? u.title, description: ut?.description ?? u.description, progressPct: u.lessons.length ? Math.round((n / u.lessons.length) * 100) : 0, access, side: !!u.side, unlocksFeature: u.unlocksFeature, section, lessons }
  })
  return { courseId: 'de-cero-a-inversor', title: engineT(loc).course, currentUnitId, units, minutesTotal: courseMinutes(), dailyGoalMinutes: minutesOf(user) }
}

export async function lesson(user: User, tx: Tx, id: string): Promise<LessonT> {
  const l = LESSON[id] ?? fail(404, 'NOT_FOUND', 'Lección no encontrada')
  const st = (await pathOf(tx, user)).units.flatMap(u => u.lessons).find(x => x.id === id)!
  if (st.requiresPremium) fail(403, 'FEATURE_LOCKED', st.requiredPlan === 'PLUS' ? 'Esta lección está en el plan Plus' : 'Esta lección está en el plan Max')
  // Las lecciones se abren en orden: no se puede saltar a una bloqueada desde la URL
  if (st.status === 'LOCKED') fail(403, 'LESSON_LOCKED', 'Termina la lección anterior para abrir esta')
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
    return { id: sid, type: 'SIMULATOR_TASK', title: s.title, body: s.body, task: s.task }
  })
  steps.push({ id: `${id}-quiz`, type: 'QUIZ', quizId: l.quizId, title: e.quizTitle, body: e.quizBody((QUIZZES[l.quizId] ?? []).length) })
  return { id, title, unitTitle, minutes: l.minutes, xp: l.xp, steps }
}

export function checkStep(lessonId: string, stepId: string, idx: number): StepCheckT {
  const l = LESSON[lessonId]
  const i = Number(stepId.split('-s')[1])
  const s = l && stepsT(currentLocale(), lessonId, l.steps)[i]
  if (!s || s.kind !== 'CHART') return fail(404, 'NOT_FOUND', 'Paso no encontrado')
  const correct = idx === s.solution
  return { correct, explanation: correct ? s.ok : s.ko }
}

export const quizStart = (id: string) =>
  withCtx(async (c): Promise<QuizStartT> => {
    let mode: 'LESSON' | 'PLACEMENT' | 'REVIEW' = 'LESSON'
    let qs: ContentQuestion[]
    if (id === 'placement') {
      if (c.g.placementDone) fail(409, 'CONFLICT', 'El test de nivel solo se hace una vez')
      mode = 'PLACEMENT'
      qs = PLACEMENT
    } else if (id === 'review') {
      mode = 'REVIEW'
      const m = await c.tx.mistake.findMany({ where: { userId: c.user.id, questionId: { in: Object.keys(ALL_Q) }, dueAt: { lte: new Date() } }, orderBy: { dueAt: 'asc' }, take: 8 })
      qs = m.map(x => ALL_Q[x.questionId]).filter(Boolean)
      if (!qs.length) fail(404, 'NOT_FOUND', 'Hoy no te toca repasar nada: vuelve mañana')
    } else {
      const l = LESSON[id] ?? fail(404, 'NOT_FOUND', 'Lección no encontrada')
      await lesson(c.user, c.tx, id) // comprueba el acceso por plan
      if (livesOf(c.user, c.g).current <= 0) fail(409, 'NO_LIVES', 'Te has quedado sin vidas')
      qs = QUIZZES[l.quizId] ?? []
    }
    const at = await c.tx.quizAttempt.create({ data: { userId: c.user.id, mode, lessonId: mode === 'LESSON' ? id : null, questionIds: qs.map(q => q.id) } })
    const loc = currentLocale()
    return { attemptId: at.id, lessonId: at.lessonId, isPlacement: mode === 'PLACEMENT', questions: qs.map(q => publicQ(questionT(loc, q))), lives: livesOf(c.user, c.g) }
  })

async function attemptOf(c: Ctx, id: string) {
  const at = await c.tx.quizAttempt.findUnique({ where: { id }, include: { answers: true } })
  if (!at || at.userId !== c.user.id) fail(404, 'NOT_FOUND', 'Intento no encontrado')
  return at!
}

export const answer = (attemptId: string, questionId: string, value: unknown, elapsedMs: number) =>
  withCtx(async (c): Promise<AnswerResultT> => {
    const at = await attemptOf(c, attemptId)
    if (at.finishedAt) fail(409, 'CONFLICT', 'El quiz ya ha terminado')
    if (Date.now() - at.startedAt.getTime() > 3_600_000) fail(409, 'CONFLICT', 'Este quiz ha caducado. Empieza otro.')
    if (!at.questionIds.includes(questionId)) fail(404, 'NOT_FOUND', 'Pregunta no encontrada')
    if (at.answers.some(a => a.questionId === questionId)) fail(409, 'CONFLICT', 'Pregunta ya respondida')
    const premium = c.user.plan !== 'FREE' // vidas ilimitadas en Plus y Max
    if (at.mode === 'LESSON' && !premium && c.g.lives <= 0) fail(409, 'NO_LIVES', 'Te has quedado sin vidas')
    const q = ALL_Q[questionId]
    const loc = currentLocale()
    const g = grade(questionT(loc, q), value, loc)
    const correct = g.correct
    await c.tx.quizAnswer.create({ data: { attemptId, questionId, correct, elapsedMs: Math.max(0, Math.min(600_000, Math.round(elapsedMs) || 0)) } })
    if (!correct && at.mode === 'LESSON' && !premium) {
      if (c.g.lives >= LIVES_MAX) c.g.livesUpdatedAt = new Date()
      c.g.lives = Math.max(0, c.g.lives - 1)
    }
    if (at.mode !== 'PLACEMENT') {
      // Contadores de las insignias de ejercicios (cálculo, estafas, simulación, velas, «¿sube o baja?»)
      if (correct) bump(c, `ok_${q.type}`)
      if (q.type === 'UP_DOWN') bump(c, 'updown')
      const key = { userId_questionId: { userId: c.user.id, questionId } }
      if (at.mode === 'REVIEW') {
        // Repaso espaciado: cada acierto lo aplaza (1, 3, 7 y 16 días) y el último lo da por dominado
        const m = await c.tx.mistake.findUnique({ where: key })
        const step = afterReview(m?.box ?? 0, correct)
        if (step.done) await c.tx.mistake.deleteMany({ where: { userId: c.user.id, questionId } })
        else await c.tx.mistake.upsert({ where: key, create: { userId: c.user.id, questionId, box: step.box, dueAt: step.dueAt }, update: { box: step.box, dueAt: step.dueAt } })
        if (correct) bump(c, 'reviewed')
      } else if (!correct) await c.tx.mistake.upsert({ where: key, create: { userId: c.user.id, questionId }, update: { box: 0, dueAt: new Date() } })
    }
    return { correct, correctAnswer: q.solution, explanation: g.explanation, reveal: g.reveal, livesLeft: at.mode === 'LESSON' && !premium ? c.g.lives : null, xpGained: correct && at.mode !== 'PLACEMENT' ? 10 : 0 }
  })

export const quizFinish = (attemptId: string) =>
  withCtx(async (c): Promise<QuizFinishT> => {
    const at = await attemptOf(c, attemptId)
    if (at.finishedAt && at.result) return at.result as unknown as QuizFinishT // idempotente
    if (at.mode === 'PLACEMENT') fail(400, 'VALIDATION_ERROR', 'Usa el final del test de nivel')
    const correct = at.answers.filter(a => a.correct).length
    const total = at.questionIds.length
    const ratio = total ? correct / total : 0
    const perfect = correct === total && total > 0
    const l = at.lessonId ? LESSON[at.lessonId] : null
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
    const repeatsToday = at.lessonId ? await c.tx.quizAttempt.count({ where: { userId: c.user.id, lessonId: at.lessonId, finishedAt: { gte: new Date(Date.now() - 86_400_000) } } }) : 0
    const farming = at.mode === 'REVIEW' ? false : repeatsToday >= 2
    const base = farming ? 0 : correct * 10 + lessonXp
    const perfectBonus = perfect && !farming ? Math.round(correct * 10 * 0.5) : 0
    const speedBonus = avgMs < 15_000 && correct > 0 && !farming ? Math.round(base * 0.1) : 0
    addXp(c, base + perfectBonus + speedBonus)
    const extendedToday = await markActive(c)
    if (at.lessonId && stars > 0) {
      await c.tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: c.user.id, lessonId: at.lessonId } },
        create: { userId: c.user.id, lessonId: at.lessonId, stars },
        update: { stars: Math.max(stars, prev?.stars ?? 0), skipped: false },
      })
      if (!prev) {
        await bumpGoal(c, 'lesson')
        if (at.lessonId === RISK_LESSON && c.user.plan !== 'PREMIUM') c.fx.features = ['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT']
      }
    }
    if (perfect && at.mode === 'LESSON' && !farming) {
      bump(c, 'perfect')
      if (durationMs < 60_000) bump(c, 'fastPerfect')
      await bumpGoal(c, 'perfect')
    }
    c.fx.companion = perfect ? lumi(c, 'QUIZ_PERFECT') : stars > 0 ? lumi(c, 'LESSON_COMPLETED', { concepto: l?.unit.title.toLowerCase() ?? 'inversión' }) : lumi(c, 'QUIZ_WRONG')
    const eff = await endFx(c)
    const out: QuizFinishT = { ...eff, correct, total, stars, durationMs, xpBreakdown: { base, perfectBonus, speedBonus, total: base + perfectBonus + speedBonus }, streak: { days: c.g.streak, extendedToday } }
    await c.tx.quizAttempt.update({ where: { id: at.id }, data: { finishedAt: new Date(), result: JSON.parse(JSON.stringify(out)) } })
    return out
  })

export const placementFinish = (attemptId: string) =>
  withCtx(async (c): Promise<PlacementFinishT> => {
    const at = await attemptOf(c, attemptId)
    if (at.mode !== 'PLACEMENT') fail(400, 'VALIDATION_ERROR', 'No es un test de nivel')
    if (c.g.placementDone || at.finishedAt) fail(409, 'CONFLICT', 'El test de nivel solo se hace una vez')
    const correct = at.answers.filter(a => a.correct).length
    const total = at.questionIds.length
    const skip = correct >= 5
    c.g.placementDone = true
    if (skip)
      await c.tx.lessonProgress.createMany({ data: UNITS[0].lessons.map(l => ({ userId: c.user.id, lessonId: l.id, stars: 0, skipped: true })), skipDuplicates: true })
    await c.tx.quizAttempt.update({ where: { id: at.id }, data: { finishedAt: new Date() } })
    const start = skip ? UNITS[1] : UNITS[0]
    return { correct, total, startUnitId: start.id, startUnitTitle: start.title, skippedUnitTitles: skip ? [UNITS[0].title] : [] }
  })
