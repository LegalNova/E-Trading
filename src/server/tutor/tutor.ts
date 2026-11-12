import 'server-only'
// Lumi, la profesora: responde con el manual del curso, cálculos y los datos del propio alumno.
// Por defecto es 100 % autónoma (src/server/tutor/brain.ts). En Max, si hay una clave real de Anthropic, responde con IA
// (Claude, src/server/tutor/ai.ts) hasta AI_DAILY_LIMIT veces al día; sin clave, sin cupo o si la IA falla, vuelve al cerebro propio.
// Límites por plan (src/shared/plans.ts): Free 5 preguntas/día, Plus 30 y «Mi cartera», Max 100 y todos los modos.
import type { TutorAnswerT, TutorHistoryT, TutorModeT } from '@/shared/contract'
import { tierOf, TUTOR_LIMITS, TUTOR_MODE_PLAN } from '@/shared/plans'
import type { User } from '@/generated/prisma/client'
import { LESSON } from '../content/catalog'
import { db } from '../db'
import { currentLocale } from '../locale'
import { track } from '../game/analytics'
import { fail, HttpError, levelOf } from '../game/core'
import { portfolio, priceBook } from '../game/trading'
import { rateLimit } from '../http/ratelimit'
import { aiAnswer, aiGlobalCap, aiKey, AI_DAILY_LIMIT, type AiContext } from './ai'
import { think, type BrainCtx } from './brain'
import { search, type Chunk } from './search'

/** Lección de la app que corresponde a una lección del manual («4.2» → u4l2) */
const BY_SOURCE = new Map(Object.values(LESSON).filter(l => l.source && l.source !== 'A').map(l => [l.source!, l]))
const sourceOf = (c: Chunk) => (c.lesson ? BY_SOURCE.get(c.lesson) : undefined)
const sourcesOf = (found: Chunk[]) => [...new Map(found.slice(0, 3).map(sourceOf).filter(Boolean).map(l => [l!.id, { lessonId: l!.id, title: l!.title, unit: l!.unit.title }])).values()]

const startOfDay = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d }
const REAL = (l: (typeof LESSON)[string]) => !l.isUnitReview && !l.isBoss

/** ¿Responde con IA esta persona? Solo Max y con clave real */
const aiFor = (user: User) => user.plan === 'PREMIUM' && !!aiKey()

async function aiUsage(user: User) {
  if (!aiFor(user)) return { on: false, used: 0, limit: 0 }
  const used = await db.tutorMessage.count({ where: { userId: user.id, role: 'assistant', engine: 'AI', createdAt: { gte: startOfDay() } } })
  return { on: true, used, limit: AI_DAILY_LIMIT }
}

export async function usage(user: User) {
  const used = await db.tutorMessage.count({ where: { userId: user.id, role: 'user', createdAt: { gte: startOfDay() } } })
  return { used, limit: TUTOR_LIMITS[user.plan] }
}

export async function history(user: User): Promise<TutorHistoryT> {
  const rows = await db.tutorMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 40 })
  return {
    messages: rows.reverse().map(r => ({ id: r.id, role: r.role as 'user' | 'assistant', content: r.content, mode: r.mode as TutorModeT, sources: (r.sources as TutorAnswerT['sources']) ?? [], createdAt: r.createdAt.toISOString(), ...(r.role === 'assistant' ? { engine: r.engine === 'AI' ? ('AI' as const) : ('LUMI' as const) } : {}) })),
    usage: await usage(user),
    plan: user.plan,
    ai: await aiUsage(user),
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
  const next = Object.values(LESSON).find(l => !doneIds.has(l.id) && !l.isUnitReview && !l.isBoss && !l.unit.side)
  return {
    name: user.name || 'tú', mode, lastQuestion, mistakes, streak: g?.streak ?? 0,
    // Solo clases de verdad (sin repasos ni retos finales): 226, como en el resto de la app
    doneLessons: Object.values(LESSON).filter(l => REAL(l) && doneIds.has(l.id)).length,
    totalLessons: Object.values(LESSON).filter(REAL).length,
    nextLesson: next ? { id: next.id, title: next.title, unit: next.unit.title } : null,
    portfolio: mode === 'PORTFOLIO' || mode === 'BIASES' ? await portfolio() : null,
    trades: trades.map(t => ({ side: t.side, symbol: t.symbol, total: Number(t.total), realizedPnl: t.realizedPnl === null ? null : Number(t.realizedPnl), createdAt: t.createdAt })),
    stopsBySymbol: mode === 'PORTFOLIO' ? new Set(stops.map(s => s.symbol)) : undefined,
  }
}

// ── Contexto para la IA ─────────────────────────────────
const COMMON = new Set('Hola Qué Que Cómo Como Cuál Cual Cuánto Cuanto Por Para Puedo Debo Es Sí Si Mi Mis Tu Lumi Hello What How Why Should Can Com Què Quin Quina Puc Bon Gràcies Gracias'.split(' '))
/** Empresas o activos que nombra la pregunta (tickers en mayúsculas o nombres propios), para darle su precio real */
async function mentioned(question: string) {
  const tickers = [...question.matchAll(/\b[A-Z][A-Z0-9]{1,5}(?:[.-][A-Z]{1,3})?\b/g)].map(m => m[0]).slice(0, 4)
  const names = [...question.matchAll(/\b\p{Lu}[\p{L}&]{3,20}\b/gu)].map(m => m[0]).filter(w => !COMMON.has(w)).slice(0, 4)
  if (!tickers.length && !names.length) return []
  const rows = await db.asset.findMany({
    where: { enabled: true, hidden: false, OR: [{ symbol: { in: tickers } }, ...names.map(n => ({ name: { startsWith: n, mode: 'insensitive' as const } }))] },
    select: { symbol: true },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  })
  return rows.map(r => r.symbol)
}

const asOfText = (ms: number) => new Date(ms).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

async function aiContext(user: User, mode: TutorModeT, question: string, found: Chunk[]): Promise<AiContext> {
  const [g, done, journal, last, pf, syms] = await Promise.all([
    db.gameState.findUnique({ where: { userId: user.id } }),
    db.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true } }),
    db.journalEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
    db.tutorMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10, select: { role: true, content: true } }),
    portfolio().catch(() => null),
    mentioned(question),
  ])
  const doneIds = new Set(done.map(d => d.lessonId))
  const next = Object.values(LESSON).find(l => !doneIds.has(l.id) && REAL(l) && !l.unit.side)
  const total = pf ? Number(pf.totalValue) : 0
  // Precios: lo que nombra la pregunta y las posiciones más grandes (solo del libro de precios de la app)
  const book = await priceBook([...syms, ...(pf?.positions.slice(0, 6).map(p => p.symbol) ?? [])])
  const loc = currentLocale()
  return {
    locale: loc,
    mode,
    plan: user.plan,
    xp: g?.xp ?? 0,
    level: levelOf(g?.xp ?? 0).n,
    streak: g?.streak ?? 0,
    doneLessons: Object.values(LESSON).filter(l => REAL(l) && doneIds.has(l.id)).length,
    totalLessons: Object.values(LESSON).filter(REAL).length,
    nextLesson: next ? { id: next.id, title: next.title, unit: next.unit.title } : null,
    portfolio: pf ? { totalEur: total, cashPct: total ? (Number(pf.cash) / total) * 100 : 100, returnPct: pf.totalReturnPct, positions: pf.positions.map(p => ({ symbol: p.symbol, name: p.name, type: p.type, weightPct: p.weightPct, pnlPct: p.pnlPct })) } : null,
    journal: journal.map(j => ({ date: j.createdAt.toISOString().slice(0, 10), symbol: j.symbol, side: j.side, tag: j.tag, reason: j.reason, verdict: j.verdict })),
    prices: [...book.values()].map(p => ({ symbol: p.symbol, name: p.name, price: Number(p.price.toPrecision(6)), currency: p.currency, changePct: p.prevClose ? (p.price / p.prevClose - 1) * 100 : 0, asOf: asOfText(p.asOf) })),
    course: found.slice(0, 3).map(k => {
      const l = sourceOf(k)
      return { lessonId: l?.id ?? null, lessonTitle: l?.title ?? null, unit: l?.unit.title ?? null, title: k.title, text: k.text }
    }),
    history: last.reverse().map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
  }
}

/** Reserva una respuesta con IA (atómico: dos peticiones a la vez no se saltan el cupo) */
async function reserveAi(user: User) {
  try {
    await rateLimit(`tutor-ai:${user.id}`, AI_DAILY_LIMIT, 86_400)
    await rateLimit('tutor-ai:all', aiGlobalCap(), 86_400)
    return true
  } catch (e) {
    if (e instanceof HttpError) return false
    throw e
  }
}

/** Intenta responder con IA. null = usa el cerebro propio */
async function tryAi(user: User, q: string, mode: TutorModeT, found: Chunk[]): Promise<string | null> {
  if (!aiFor(user)) return null
  const ai = await aiUsage(user)
  if (ai.used >= ai.limit || !(await reserveAi(user))) return null
  const r = await aiAnswer(q, await aiContext(user, mode, q, found))
  // Registro de uso y coste aproximado (lo ve el equipo en el admin): nunca el texto de la conversación
  await track(db, user.id, 'tutor_ai', r.ok ? { ok: true, model: r.model, mode, in: r.usage.input, out: r.usage.output, cacheRead: r.usage.cacheRead, cacheWrite: r.usage.cacheWrite, usd: r.usd, ms: r.ms } : { ok: false, reason: r.reason, mode, ms: r.ms, usd: r.usd ?? 0 }).catch(() => undefined)
  return r.ok ? r.text : null
}

export async function ask(user: User, question: string, mode: TutorModeT): Promise<TutorAnswerT> {
  const q = question.trim().slice(0, 600)
  if (q.length < 2) fail(400, 'VALIDATION_ERROR', 'Escribe una pregunta')
  const need = TUTOR_MODE_PLAN[mode]
  if (tierOf(user.plan) < tierOf(need)) fail(403, 'FEATURE_LOCKED', need === 'PLUS' ? 'Este modo está en el plan Plus' : 'Este modo está en el plan Max')
  const u = await usage(user)
  if (u.used >= u.limit) fail(429, 'TUTOR_LIMIT', user.plan === 'PREMIUM' ? 'Has llegado al límite de preguntas de hoy. Mañana más.' : `Has usado tus ${u.limit} preguntas de hoy. Con un plan superior tienes más.`)

  // Fragmentos del manual que encajan con la pregunta: contexto de la IA (RAG) y lecciones citadas
  const hits = search(q, 4).map(h => h.chunk)
  let text = await tryAi(user, q, mode, hits)
  let found = hits
  const engine = text ? 'AI' : 'LUMI'
  if (!text) {
    const lastUser = await db.tutorMessage.findFirst({ where: { userId: user.id, role: 'user' }, orderBy: { createdAt: 'desc' }, select: { content: true } })
    const out = think(q, await brainContext(user, mode, lastUser?.content ?? ''))
    text = out.text
    found = out.found
  }

  const sources = sourcesOf(found)
  const now = Date.now()
  await db.tutorMessage.createMany({
    data: [
      { userId: user.id, role: 'user', content: q, mode, createdAt: new Date(now) },
      { userId: user.id, role: 'assistant', content: text, mode, sources, engine, createdAt: new Date(now + 1) },
    ],
  })
  return { answer: text, sources, usage: { used: u.used + 1, limit: u.limit }, engine, ai: await aiUsage(user) }
}
