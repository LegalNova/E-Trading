import 'server-only'
// Lumi, la profesora: responde con el manual del curso, cálculos y los datos del propio alumno.
// Es 100 % autónoma (src/server/tutor/brain.ts): no envía nada a ningún servicio de IA externo.
// Límites por plan (src/shared/plans.ts): Free 5 preguntas/día, Plus 30 y «Mi cartera», Max 100 y todos los modos.
import type { TutorAnswerT, TutorHistoryT, TutorModeT } from '@/shared/contract'
import { tierOf, TUTOR_LIMITS, TUTOR_MODE_PLAN } from '@/shared/plans'
import type { User } from '@/generated/prisma/client'
import { LESSON } from '../content/catalog'
import { db } from '../db'
import { fail } from '../game/core'
import { portfolio } from '../game/trading'
import { think, type BrainCtx } from './brain'
import type { Chunk } from './search'

/** Lección de la app que corresponde a una lección del manual («4.2» → u4l2) */
const BY_SOURCE = new Map(Object.values(LESSON).filter(l => l.source && l.source !== 'A').map(l => [l.source!, l]))
const sourceOf = (c: Chunk) => (c.lesson ? BY_SOURCE.get(c.lesson) : undefined)

const startOfDay = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d }

export async function usage(user: User) {
  const used = await db.tutorMessage.count({ where: { userId: user.id, role: 'user', createdAt: { gte: startOfDay() } } })
  return { used, limit: TUTOR_LIMITS[user.plan] }
}

export async function history(user: User): Promise<TutorHistoryT> {
  const rows = await db.tutorMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 40 })
  return {
    messages: rows.reverse().map(r => ({ id: r.id, role: r.role as 'user' | 'assistant', content: r.content, mode: r.mode as TutorModeT, sources: (r.sources as TutorAnswerT['sources']) ?? [], createdAt: r.createdAt.toISOString() })),
    usage: await usage(user),
    plan: user.plan,
  }
}

export async function clearHistory(user: User) {
  await db.tutorMessage.deleteMany({ where: { userId: user.id } })
}

async function brainContext(user: User, mode: TutorModeT, lastQuestion: string): Promise<BrainCtx> {
  const [g, done, mistakes, trades, stops] = await Promise.all([
    db.gameState.findUnique({ where: { userId: user.id } }),
    db.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true } }),
    db.mistake.count({ where: { userId: user.id } }),
    mode === 'BIASES' ? db.trade.findMany({ where: { userId: user.id, status: 'FILLED' }, orderBy: { createdAt: 'desc' }, take: 60 }) : Promise.resolve([]),
    mode === 'PORTFOLIO' ? db.order.findMany({ where: { userId: user.id, status: 'PENDING', type: 'STOP_LOSS' }, select: { symbol: true } }) : Promise.resolve([]),
  ])
  const doneIds = new Set(done.map(d => d.lessonId))
  const next = Object.values(LESSON).find(l => !doneIds.has(l.id) && !l.isUnitReview && !l.unit.side)
  return {
    name: user.name || 'tú', mode, lastQuestion, mistakes, streak: g?.streak ?? 0,
    doneLessons: doneIds.size, totalLessons: Object.keys(LESSON).length,
    nextLesson: next ? { id: next.id, title: next.title, unit: next.unit.title } : null,
    portfolio: mode === 'PORTFOLIO' || mode === 'BIASES' ? await portfolio() : null,
    trades: trades.map(t => ({ side: t.side, symbol: t.symbol, total: Number(t.total), realizedPnl: t.realizedPnl === null ? null : Number(t.realizedPnl), createdAt: t.createdAt })),
    stopsBySymbol: mode === 'PORTFOLIO' ? new Set(stops.map(s => s.symbol)) : undefined,
  }
}

export async function ask(user: User, question: string, mode: TutorModeT): Promise<TutorAnswerT> {
  const q = question.trim().slice(0, 600)
  if (q.length < 2) fail(400, 'VALIDATION_ERROR', 'Escribe una pregunta')
  const need = TUTOR_MODE_PLAN[mode]
  if (tierOf(user.plan) < tierOf(need)) fail(403, 'FEATURE_LOCKED', need === 'PLUS' ? 'Este modo está en el plan Plus' : 'Este modo está en el plan Max')
  const u = await usage(user)
  if (u.used >= u.limit) fail(429, 'TUTOR_LIMIT', user.plan === 'PREMIUM' ? 'Has llegado al límite de preguntas de hoy. Mañana más.' : `Has usado tus ${u.limit} preguntas de hoy. Con un plan superior tienes más.`)

  const lastUser = await db.tutorMessage.findFirst({ where: { userId: user.id, role: 'user' }, orderBy: { createdAt: 'desc' }, select: { content: true } })
  const ctx = await brainContext(user, mode, lastUser?.content ?? '')
  const { text, found } = think(q, ctx)

  const sources = [...new Map(found.slice(0, 3).map(sourceOf).filter(Boolean).map(l => [l!.id, { lessonId: l!.id, title: l!.title, unit: l!.unit.title }])).values()]
  const now = Date.now()
  await db.tutorMessage.createMany({
    data: [
      { userId: user.id, role: 'user', content: q, mode, createdAt: new Date(now) },
      { userId: user.id, role: 'assistant', content: text, mode, sources, engine: 'LUMI', createdAt: new Date(now + 1) },
    ],
  })
  return { answer: text, sources, usage: { used: u.used + 1, limit: u.limit } }
}
