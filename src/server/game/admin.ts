import 'server-only'
// Panel de administración (07). Solo ADMIN. Cifras reales de la base de datos; «null» = vacío real.
import { addDays, dayOf, weekOf } from '@/shared/time'
import { db, DB_SCHEMA } from '../db'
import { campaignSlug } from './analytics'
import { ACHIEVEMENTS, LESSON, QUIZZES, UNITS } from '../content/catalog'
import { realUser } from '../auth'
import { LIVE } from '../billing/stripe'
import { viewAs } from '../view'
import { fail, levelOf, LIVES_MAX, notify, type Tx } from './core'
import { grantPlan, revokeGift } from './grants'
import { cleanMessage, createTeamMessage, langOf as msgLang, pushLater, TEAM_PREFIX } from './messages'

/** Siempre quien ha iniciado sesión de verdad: también mientras «ve como» otro usuario */
export async function requireAdmin() {
  const u = await realUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (u!.role !== 'ADMIN') fail(403, 'FORBIDDEN', 'Solo para administración')
  return u!
}

export async function metrics(range: '7d' | '30d' | '90d') {
  await requireAdmin()
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range] ?? 30
  const today = dayOf()
  const from = addDays(today, -(days - 1))
  const [users, dau, mau, premium, trades, onboarded, firstLesson, firstTrade, active] = await Promise.all([
    db.user.count(),
    db.streakDay.count({ where: { day: today, status: 'ACTIVE' } }),
    db.gameState.count({ where: { lastActiveDay: { gte: addDays(today, -29) } } }),
    db.user.count({ where: { plan: 'PREMIUM' } }),
    db.trade.count({ where: { status: 'FILLED', createdAt: { gte: new Date(from + 'T00:00:00Z') } } }),
    db.user.count({ where: { onboardingStep: null } }),
    db.lessonProgress.groupBy({ by: ['userId'], where: { skipped: false } }).then(r => r.length),
    db.trade.groupBy({ by: ['userId'], where: { status: 'FILLED' } }).then(r => r.length),
    db.streakDay.groupBy({ by: ['day'], where: { day: { gte: from }, status: 'ACTIVE' }, _count: { _all: true } }),
  ])
  // Retención D7: de quienes se registraron hace 7–14 días, cuántos estuvieron activos 7 días después
  const cohort = await db.user.findMany({ where: { createdAt: { gte: new Date(Date.now() - 14 * 86_400_000), lt: new Date(Date.now() - 7 * 86_400_000) } }, select: { id: true, createdAt: true } })
  let retained = 0
  for (const u of cohort) {
    const d7 = addDays(dayOf(u.createdAt), 7)
    if (await db.streakDay.count({ where: { userId: u.id, day: { gte: d7 }, status: 'ACTIVE' } })) retained++
  }
  const byDay = new Map(active.map(a => [a.day, a._count._all]))
  const quotes = await db.quote.groupBy({ by: ['source'], _max: { updatedAt: true }, _count: { _all: true } })
  const SOURCES: Record<string, string> = { YAHOO: 'Yahoo Finance (todo el mercado)', ECB: 'BCE (respaldo de divisas)' }
  const [cohorts, money, sources, errors] = await Promise.all([cohortTable(today), moneyFunnel(from), bySource(), errorList()])
  return {
    cohorts,
    money,
    sources,
    errors,
    dau: users ? dau : null, mau: users ? mau : null, retentionD7: cohort.length ? Math.round((retained / cohort.length) * 100) : null, premiumConversion: users ? Math.round((premium / users) * 100) : null, simulatedTrades: trades,
    funnel: [
      { label: 'Registro', value: users },
      { label: 'Onboarding completo', value: onboarded },
      { label: 'Primera lección', value: firstLesson },
      { label: 'Primera operación', value: firstTrade },
      { label: 'Premium', value: premium },
    ],
    series: Array.from({ length: days }, (_, i) => byDay.get(addDays(from, i)) ?? 0),
    providers: Object.entries(SOURCES).map(([k, name]) => {
      const q = quotes.find(x => x.source === k)
      const age = q?._max.updatedAt ? Date.now() - q._max.updatedAt.getTime() : null
      return { name, status: (age === null ? 'DOWN' : age < 10 * 60_000 ? 'OK' : 'DEGRADED') as 'OK' | 'DEGRADED' | 'DOWN', latencyMs: null, note: age === null ? (k === 'ECB' ? 'Sin uso (solo si falla Yahoo)' : 'Sin datos') : `${q!._count._all} activos · actualizado hace ${Math.round(age / 60_000)} min` }
    }),
  }
}

/** Retención por semana de registro: % de usuarios activos el día 1, entre los días 7-13 y entre los días 30-36 */
async function cohortTable(today: string) {
  const since = addDays(weekOf(), -7 * 7)
  const people = await db.user.findMany({ where: { createdAt: { gte: new Date(since + 'T00:00:00Z') } }, select: { id: true, createdAt: true } })
  const days = await db.streakDay.findMany({ where: { userId: { in: people.map(p => p.id) }, status: 'ACTIVE' }, select: { userId: true, day: true } })
  const active = new Map<string, Set<string>>()
  for (const d of days) (active.get(d.userId) ?? active.set(d.userId, new Set()).get(d.userId)!).add(d.day)
  const weeks = new Map<string, { size: number; hit: [number, number, number]; due: [number, number, number] }>()
  const span = [
    [1, 1],
    [7, 13],
    [30, 36],
  ] as const
  for (const p of people) {
    const start = dayOf(p.createdAt)
    const w = weeks.get(weekOf(p.createdAt)) ?? { size: 0, hit: [0, 0, 0], due: [0, 0, 0] }
    weeks.set(weekOf(p.createdAt), w)
    w.size++
    const mine = active.get(p.id)
    span.forEach(([a, b], k) => {
      // Solo cuenta quien ya ha tenido tiempo de llegar a ese día
      if (addDays(start, b) > today) return
      w.due[k]++
      for (let n = a; n <= b; n++) if (mine?.has(addDays(start, n))) return void w.hit[k]++
    })
  }
  const pct = (h: number, d: number) => (d ? Math.round((h / d) * 100) : null)
  return [...weeks.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([week, w]) => ({ week, size: w.size, d1: pct(w.hit[0], w.due[0]), d7: pct(w.hit[1], w.due[1]), d30: pct(w.hit[2], w.due[2]) }))
}

/** Fallos de los últimos 7 días (app y servidor), agrupados por mensaje */
async function errorList() {
  const rows = await db.$queryRawUnsafe<{ kind: string; message: string; where: string; n: bigint; users: bigint; last: Date }[]>(
    `SELECT name AS kind, props->>'message' AS message, MAX(COALESCE(props->>'path', props->>'route')) AS "where", COUNT(*) AS n, COUNT(DISTINCT "userId") AS users, MAX("createdAt") AS last
     FROM "${DB_SCHEMA}"."Event" WHERE name IN ('client_error', 'server_error') AND "createdAt" >= NOW() - INTERVAL '7 days' GROUP BY 1, 2 ORDER BY n DESC LIMIT 15`,
  )
  return rows.map(r => ({ kind: r.kind === 'server_error' ? ('SERVER' as const) : ('APP' as const), message: r.message ?? '—', where: r.where ?? '—', count: Number(r.n), users: Number(r.users), last: r.last.toISOString() }))
}

/** Embudo de pago en el periodo: usuarios distintos en cada paso */
async function moneyFunnel(from: string) {
  const since = new Date(from + 'T00:00:00Z')
  const count = (name: string) => db.event.groupBy({ by: ['userId'], where: { name, createdAt: { gte: since } } }).then(r => r.length)
  const [views, walls, trials, paid, cancels] = await Promise.all(['premium_view', 'paywall', 'trial_start', 'paid', 'cancel'].map(count))
  return [
    { key: 'premium_view', value: views },
    { key: 'paywall', value: walls },
    { key: 'trial_start', value: trials },
    { key: 'paid', value: paid },
    { key: 'cancel', value: cancels },
  ]
}

/** Origen de los usuarios (primer contacto) y cuántos prueban o pagan */
async function bySource() {
  // Las invitaciones de usuarios (inv/código) se agrupan en una sola fila
  const raw = await db.user.groupBy({ by: ['source'], _count: { _all: true } })
  const key = (s: string | null) => (s?.startsWith('inv/') ? 'invitaciones de usuarios' : s)
  const rows = new Map<string | null, number>()
  for (const r of raw) rows.set(key(r.source), (rows.get(key(r.source)) ?? 0) + r._count._all)
  const of = async (name: string) => {
    const ev = await db.event.findMany({ where: { name }, distinct: ['userId'], select: { user: { select: { source: true } } } })
    const m = new Map<string | null, number>()
    for (const e of ev) m.set(key(e.user?.source ?? null), (m.get(key(e.user?.source ?? null)) ?? 0) + 1)
    return m
  }
  const [trials, paid] = await Promise.all([of('trial_start'), of('paid')])
  return [...rows.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([s, n]) => ({ source: s ?? '—', users: n, trials: trials.get(s) ?? 0, paid: paid.get(s) ?? 0 }))
}

export async function users(q?: string) {
  await requireAdmin()
  const where = q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { name: { contains: q, mode: 'insensitive' as const } }] } : {}
  const rows = await db.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { game: { select: { xp: true, lastActiveDay: true } } } })
  return rows.map(u => ({ id: u.id, name: u.name || '—', email: u.email, plan: u.plan, createdAt: u.createdAt.toISOString(), lastActive: u.game?.lastActiveDay ?? '—', blocked: !!u.blockedAt, xp: u.game?.xp ?? 0, source: u.source }))
}

/** Ficha completa de un usuario: perfil, progreso, operaciones y su historial de eventos */
export async function userDetail(id: string) {
  await requireAdmin()
  const u = await db.user.findUnique({ where: { id }, include: { game: true, portfolio: true, subscription: true, accounts: { select: { providerId: true } } } })
  if (!u) fail(404, 'NOT_FOUND', 'Usuario no encontrado')
  const [lessons, lessonsDone, answers, trades, tradeCount, positions, tutor, badges, events, sessions] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId: id }, orderBy: { completedAt: 'desc' }, take: 10 }),
    db.lessonProgress.count({ where: { userId: id, skipped: false } }),
    db.quizAnswer.groupBy({ by: ['correct'], where: { attempt: { userId: id } }, _count: { _all: true } }),
    db.trade.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    db.trade.count({ where: { userId: id, status: 'FILLED' } }),
    db.position.count({ where: { userId: id } }),
    db.tutorMessage.count({ where: { userId: id, role: 'user' } }),
    db.userAchievement.count({ where: { userId: id } }),
    db.event.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 40 }),
    db.session.findFirst({ where: { userId: id }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
  ])
  const right = answers.find(a => a.correct)?._count._all ?? 0
  const total = answers.reduce((a, x) => a + x._count._all, 0)
  const g = u!.game
  const ob = (u!.onboarding ?? {}) as { experience?: string; goals?: string[]; dailyGoalMinutes?: number }
  return {
    id: u!.id,
    name: u!.name || '—',
    email: u!.email,
    emailVerified: u!.emailVerified,
    login: u!.accounts.map(a => (a.providerId === 'credential' ? 'email' : a.providerId)),
    plan: u!.plan,
    subscription: u!.subscription ? { status: u!.subscription.status, trialEndsAt: u!.subscription.trialEndsAt?.toISOString() ?? null } : null,
    source: u!.source,
    locale: u!.locale,
    createdAt: u!.createdAt.toISOString(),
    lastSeen: sessions?.updatedAt.toISOString() ?? null,
    lastActive: g?.lastActiveDay ?? null,
    blocked: !!u!.blockedAt,
    onboarding: { done: u!.onboardingStep === null, step: u!.onboardingStep, experience: ob.experience ?? null, goals: ob.goals ?? [], minutes: ob.dailyGoalMinutes ?? null },
    game: g ? { xp: g.xp, level: levelOf(g.xp).n, streak: g.streak, bestStreak: g.bestStreak, gems: g.gems, lives: g.lives, division: g.division, weekXp: g.weekXp, freezes: g.freezes } : null,
    guest: !!u!.isAnonymous,
    isTeam: u!.role === 'ADMIN',
    learning: { lessonsDone, accuracy: total ? Math.round((right / total) * 100) : null, answers: total, last: lessons.map(l => ({ id: l.lessonId, title: LESSON[l.lessonId]?.title ?? l.lessonId, skipped: l.skipped, stars: l.stars, at: l.completedAt.toISOString() })) },
    market: { cash: u!.portfolio ? Number(u!.portfolio.cash) : null, positions, trades: tradeCount, last: trades.map(t => ({ symbol: t.symbol, side: t.side, total: Number(t.total), status: t.status, at: t.createdAt.toISOString() })) },
    tutorQuestions: tutor,
    badges,
    events: events.map(e => ({ name: e.name, props: e.props, at: e.createdAt.toISOString() })),
    admin2: await controlsOf(u!.id),
  }
}

/** Empieza a «ver como»: queda apuntado en la auditoría */
export async function startViewAs(id: string) {
  const a = await requireAdmin()
  const u = await db.user.findUnique({ where: { id }, select: { id: true, email: true } })
  if (!u) fail(404, 'NOT_FOUND', 'Usuario no encontrado')
  await db.auditLog.create({ data: { actor: a.email, action: 'VIEW_AS', entity: 'User', entityId: u!.id } })
  return { id: u!.id, email: u!.email }
}

export async function audit() {
  await requireAdmin()
  const rows = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return rows.map(a => ({ id: a.id, actor: a.actor, action: a.action, entity: a.entity, createdAt: a.createdAt.toISOString() }))
}

/** Contenido con soluciones, solo para revisarlo desde el panel */
export async function content() {
  await requireAdmin()
  return { units: UNITS.map(u => ({ id: u.id, order: u.order, title: u.title, lessons: u.lessons.map(l => ({ id: l.id, title: l.title, quizId: l.quizId })) })), quizzes: QUIZZES, achievements: ACHIEVEMENTS.length }
}

// ── Dónde se atascan (auditoría PRO-21) ──────────────────
// Con los datos que la app ya guarda: quién empieza cada clase (lesson_start), quién la termina (LessonProgress),
// en qué paso la deja (lesson_exit) y cada respuesta de quiz (QuizAnswer). Nada inventado: si hay pocos datos, se dice.
/** Mínimos para que un porcentaje signifique algo */
export const HOTSPOT_MIN_STARTS = 5
export const HOTSPOT_MIN_ANSWERS = 10

export async function hotspots() {
  await requireAdmin()
  const [events, done, answers] = await Promise.all([
    db.event.findMany({ where: { name: { in: ['lesson_start', 'lesson_exit'] } }, select: { name: true, userId: true, props: true }, orderBy: { createdAt: 'desc' }, take: 100_000 }),
    db.lessonProgress.groupBy({ by: ['lessonId'], where: { skipped: false }, _count: { _all: true } }),
    db.quizAnswer.groupBy({ by: ['questionId', 'correct'], where: { attempt: { mode: { not: 'PLACEMENT' } } }, _count: { _all: true } }),
  ])
  const starts = new Map<string, Set<string>>()
  const exits = new Map<string, number[]>()
  for (const e of events) {
    const p = (e.props ?? {}) as { lessonId?: string; step?: number; of?: number }
    if (!p.lessonId || !e.userId) continue
    if (e.name === 'lesson_start') starts.set(p.lessonId, (starts.get(p.lessonId) ?? new Set()).add(e.userId))
    else if (p.step && p.of) exits.set(p.lessonId, [...(exits.get(p.lessonId) ?? []), p.step / p.of])
  }
  const finished = new Map(done.map(d => [d.lessonId, d._count._all]))
  const lessons = [...starts.entries()]
    .map(([id, users]) => {
      const n = users.size
      const completed = Math.min(n, finished.get(id) ?? 0)
      const ex = exits.get(id) ?? []
      const l = LESSON[id]
      return { id, title: l?.title ?? id, unit: l?.unit.title ?? '', starts: n, completed, abandonPct: n ? Math.round(((n - completed) / n) * 100) : 0, exitAtPct: ex.length ? Math.round((ex.reduce((a, x) => a + x, 0) / ex.length) * 100) : null }
    })
    .filter(x => x.starts >= HOTSPOT_MIN_STARTS)
    .sort((a, b) => b.abandonPct - a.abandonPct || b.starts - a.starts)
    .slice(0, 20)
  const byQ = new Map<string, { ok: number; ko: number }>()
  for (const a of answers) {
    const x = byQ.get(a.questionId) ?? { ok: 0, ko: 0 }
    if (a.correct) x.ok += a._count._all
    else x.ko += a._count._all
    byQ.set(a.questionId, x)
  }
  const ALL = Object.fromEntries(Object.values(QUIZZES).flat().map(q => [q.id, q]))
  const questions = [...byQ.entries()]
    .map(([id, x]) => ({ id, prompt: ALL[id]?.prompt ?? id, type: ALL[id]?.type ?? '', lessonId: id.replace(/-\d+$/, ''), answers: x.ok + x.ko, failPct: Math.round((x.ko / (x.ok + x.ko)) * 100) }))
    .filter(x => x.answers >= HOTSPOT_MIN_ANSWERS && ALL[x.id])
    .sort((a, b) => b.failPct - a.failPct || b.answers - a.answers)
    .slice(0, 50)
  return { lessons, questions, minStarts: HOTSPOT_MIN_STARTS, minAnswers: HOTSPOT_MIN_ANSWERS, lessonsMeasured: starts.size, questionsMeasured: byQ.size }
}

// ── Enlaces de campaña ───────────────────────────────────
// Un enlace por sitio donde se comparte la app (?ref=nombre). Se cuentan visitas, altas, pruebas y pagos de cada uno.
interface Campaign {
  slug: string
  name: string
  createdAt: string
}
const CAMPAIGNS_KEY = 'campaigns'

async function campaignList(): Promise<Campaign[]> {
  const row = await db.appSetting.findUnique({ where: { key: CAMPAIGNS_KEY } })
  return (row?.value as unknown as Campaign[] | undefined) ?? []
}

export async function campaigns() {
  await requireAdmin()
  const list = await campaignList()
  const sources = list.map(c => `ref/${c.slug}`)
  const [visits, users, trials, paid] = await Promise.all([
    db.$queryRawUnsafe<{ ref: string; n: bigint }[]>(`SELECT props->>'ref' AS ref, COUNT(*) AS n FROM "${DB_SCHEMA}"."Event" WHERE name = 'screen_view' AND props ? 'ref' GROUP BY 1`),
    db.user.groupBy({ by: ['source'], where: { source: { in: sources }, role: 'USER' }, _count: { _all: true } }),
    db.event.findMany({ where: { name: 'trial_start', user: { is: { source: { in: sources } } } }, distinct: ['userId'], select: { user: { select: { source: true } } } }),
    db.event.findMany({ where: { name: 'paid', user: { is: { source: { in: sources } } } }, distinct: ['userId'], select: { user: { select: { source: true } } } }),
  ])
  const count = (rows: { user: { source: string | null } | null }[], s: string) => rows.filter(r => r.user?.source === s).length
  return list.map(c => {
    const s = `ref/${c.slug}`
    return { ...c, visits: Number(visits.find(v => v.ref === c.slug)?.n ?? 0), signups: users.find(u => u.source === s)?._count._all ?? 0, trials: count(trials, s), paid: count(paid, s) }
  })
}

export async function createCampaign(name: string) {
  const a = await requireAdmin()
  const clean = name.trim().slice(0, 60)
  const slug = campaignSlug(clean)
  if (!slug) fail(422, 'VALIDATION_ERROR', 'Escribe un nombre con letras o números')
  const list = await campaignList()
  if (list.some(c => c.slug === slug)) fail(409, 'CAMPAIGN_EXISTS', 'Ya hay un enlace con ese nombre')
  if (list.length >= 200) fail(422, 'VALIDATION_ERROR', 'Hay demasiados enlaces: borra alguno')
  const next = [...list, { slug, name: clean, createdAt: new Date().toISOString() }]
  await db.appSetting.upsert({ where: { key: CAMPAIGNS_KEY }, create: { key: CAMPAIGNS_KEY, value: next as unknown as object }, update: { value: next as unknown as object } })
  await db.auditLog.create({ data: { actor: a.email, action: 'CAMPAIGN_CREATED', entity: 'Campaign', entityId: slug } })
  return { slug }
}

export async function deleteCampaign(slug: string) {
  const a = await requireAdmin()
  const next = (await campaignList()).filter(c => c.slug !== slug)
  await db.appSetting.upsert({ where: { key: CAMPAIGNS_KEY }, create: { key: CAMPAIGNS_KEY, value: next as unknown as object }, update: { value: next as unknown as object } })
  await db.auditLog.create({ data: { actor: a.email, action: 'CAMPAIGN_DELETED', entity: 'Campaign', entityId: slug } })
}

// ── Opiniones ─────────────────────────────────────────────
export async function feedbackSummary() {
  await requireAdmin()
  const rows = await db.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 500, include: { user: { select: { name: true, email: true, source: true } } } })
  const count = (key: string) => {
    const m = new Map<string, number>()
    for (const r of rows) {
      const v = (r.answers as Record<string, unknown>)[key]
      for (const x of Array.isArray(v) ? v : v ? [v] : []) m.set(String(x), (m.get(String(x)) ?? 0) + 1)
    }
    return Object.fromEntries(m)
  }
  const promoters = rows.filter(r => r.nps >= 9).length
  const detractors = rows.filter(r => r.nps <= 6).length
  return {
    total: rows.length,
    nps: rows.length ? Math.round(((promoters - detractors) / rows.length) * 100) : null,
    npsHist: Array.from({ length: 11 }, (_, i) => rows.filter(r => r.nps === i).length),
    likes: count('likes'),
    blockers: count('blockers'),
    pay: count('pay'),
    price: count('price'),
    wants: count('wants'),
    comments: rows
      .filter(r => (r.answers as { comment?: string; wantsOther?: string }).comment || (r.answers as { wantsOther?: string }).wantsOther)
      .slice(0, 60)
      .map(r => ({ id: r.id, userId: r.userId, who: r.user.name || r.user.email, nps: r.nps, plan: r.plan, daysIn: r.daysIn, comment: (r.answers as { comment?: string }).comment ?? '', wantsOther: (r.answers as { wantsOther?: string }).wantsOther ?? '', at: r.createdAt.toISOString() })),
  }
}


// ── Mandos de la ficha de usuario (admin2) ───────────────
// Todos: solo ADMIN, nunca mientras «ve como» a alguien (es solo lectura), en una transacción con la fila
// del usuario bloqueada (dos clics a la vez se aplican de uno en uno) y apuntados en la auditoría.
const DAY_MS = 86_400_000
const PLAN_NAME = { FREE: 'Free', PLUS: 'Plus', PREMIUM: 'Max' } as const
type Lang = 'es' | 'ca' | 'en'
const langOf = (l: string): Lang => (l === 'ca' || l === 'en' ? l : 'es')

export async function adminAction() {
  const a = await requireAdmin()
  if (viewAs()) fail(403, 'VIEW_ONLY', 'Sal de «ver como» para usar los mandos del admin')
  return a
}

export async function lockTarget(tx: Tx, id: string) {
  await tx.$queryRawUnsafe(`SELECT 1 FROM "${DB_SCHEMA}"."user" WHERE "id" = $1 FOR UPDATE`, id)
  const u = await tx.user.findUnique({ where: { id } })
  if (!u) fail(404, 'NOT_FOUND', 'Usuario no encontrado')
  return u!
}

/** Estado de juego bloqueado (el mismo bloqueo que usan las acciones del propio usuario) */
async function lockGame(tx: Tx, userId: string) {
  await tx.gameState.createMany({ data: [{ userId }], skipDuplicates: true })
  await tx.$queryRawUnsafe(`SELECT 1 FROM "${DB_SCHEMA}"."GameState" WHERE "userId" = $1 FOR UPDATE`, userId)
  return tx.gameState.findUniqueOrThrow({ where: { userId } })
}

export type Admin = Awaited<ReturnType<typeof requireAdmin>>
export const audited = (tx: Tx, a: Admin, action: string, userId: string, before: object, after: object) =>
  tx.auditLog.create({ data: { actorId: a.id, actor: a.email, action, entity: 'User', entityId: userId, before, after } })

export const run = <T>(fn: (tx: Tx) => Promise<T>) => db.$transaction(fn, { timeout: 20_000, maxWait: 10_000 })

/** Plan, suscripción y regalos de una persona, para la ficha */
async function controlsOf(userId: string) {
  const [u, sub, gifts, messages, pushDevices] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { plan: true, role: true, blockedAt: true, blockReason: true } }),
    db.subscription.findUnique({ where: { userId } }),
    db.gift.findMany({ where: { source: { in: ['ADMIN', 'PURCHASE'] }, redeemedById: userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
    db.notification.findMany({ where: { userId, id: { startsWith: TEAM_PREFIX } }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.pushSub.count({ where: { userId } }),
  ])
  const now = Date.now()
  const stripe = !!sub?.stripeSubId && LIVE.includes(sub.status)
  const giftRunning = sub?.status === 'GIFT' && !!sub.trialEndsAt && sub.trialEndsAt.getTime() > now
  const until = !sub ? null : sub.status === 'GIFT' || sub.status === 'TRIALING' ? sub.trialEndsAt : sub.status === 'ACTIVE' || stripe ? sub.renewsAt : null
  return {
    plan: u?.plan ?? 'FREE',
    isTeam: u?.role === 'ADMIN',
    blockedAt: u?.blockedAt?.toISOString() ?? null,
    blockReason: u?.blockReason ?? null,
    subscription: sub ? { status: sub.status, interval: sub.interval, stripe, until: until?.toISOString() ?? null } : null,
    giftRunning,
    gifts: gifts.map(g => ({ id: g.id, tier: g.tier as 'PLUS' | 'PREMIUM', days: g.days, by: g.buyerEmail, reason: g.source === 'PURCHASE' ? null : g.message, status: g.status, at: (g.redeemedAt ?? g.createdAt).toISOString(), source: g.source as 'ADMIN' | 'PURCHASE' })),
    // Mensajes del equipo que ha recibido (y si los ha leído) y si tiene avisos en el móvil
    messages: messages.map(m => ({ id: m.id, title: m.title, text: m.body, at: m.createdAt.toISOString(), readAt: m.readAt?.toISOString() ?? null, batch: m.id.startsWith(`${TEAM_PREFIX}b`) })),
    pushDevices,
  }
}

function giftText(lang: Lang, tier: 'PLUS' | 'PREMIUM', days: number, mode: 'DELAYED_CHARGE' | 'EXTENDED' | 'GIFT', until: Date | null) {
  const D = {
    es: { 7: '7 días', 30: '1 mes', 90: '3 meses', 180: '6 meses', 365: '1 año', n: `${days} días`, of: 'de', title: 'El equipo de E-Trading te ha regalado', delayed: `Tu próximo cobro se retrasa ${days} días.`, gift: 'Ya lo tienes hasta el', ext: 'Tu plan se alarga hasta el' },
    ca: { 7: '7 dies', 30: '1 mes', 90: '3 mesos', 180: '6 mesos', 365: '1 any', n: `${days} dies`, of: 'de', title: 'L’equip d’E-Trading t’ha regalat', delayed: `El teu proper cobrament es retarda ${days} dies.`, gift: 'Ja el tens fins al', ext: 'El teu pla s’allarga fins al' },
    en: { 7: '7 days', 30: '1 month', 90: '3 months', 180: '6 months', 365: '1 year', n: `${days} days`, of: 'of', title: 'The E-Trading team has gifted you', delayed: `Your next charge is pushed back ${days} days.`, gift: 'You have it until', ext: 'Your plan now runs until' },
  }[lang]
  const dur = (D as Record<string, string>)[String(days)] ?? D.n
  const date = until ? until.toLocaleDateString(lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }) : ''
  // Si paga con Stripe se queda con el plan que paga: el regalo son días sin cobro (no se promete otro plan)
  const title = mode === 'DELAYED_CHARGE' ? `${D.title} ${dur}` : `${D.title} ${dur} ${D.of} ${PLAN_NAME[tier]}`
  const body = mode === 'DELAYED_CHARGE' ? D.delayed : `${mode === 'GIFT' ? D.gift : D.ext} ${date}.`
  return { title, body }
}

/** Regala Plus o Max durante unos días (grantPlan). Si paga con Stripe, retrasa su próximo cobro */
export async function giveGift(userId: string, tier: 'PLUS' | 'PREMIUM', days: number, reason?: string) {
  const a = await adminAction()
  if (!Number.isInteger(days) || days < 1 || days > 3650) fail(422, 'VALIDATION_ERROR', 'Elige entre 1 y 3.650 días')
  const why = reason?.trim().slice(0, 200) || null
  return run(async tx => {
    const u = await lockTarget(tx, userId)
    const sub = await tx.subscription.findUnique({ where: { userId } })
    const before = { plan: u.plan, status: sub?.status ?? null, trialEndsAt: sub?.trialEndsAt?.toISOString() ?? null, renewsAt: sub?.renewsAt?.toISOString() ?? null }
    const log = await audited(tx, a, 'GIFT_PLAN', userId, before, { tier, days, reason: why })
    const key = `admin-${log.id}`
    const r = await grantPlan(tx, userId, tier, days, key)
    await tx.gift.create({ data: { code: key, tier, days, source: 'ADMIN', status: 'REDEEMED', buyerEmail: a.email, fromName: 'Equipo de E-Trading', message: why, redeemedById: userId, redeemedAt: new Date() } })
    const n = giftText(langOf(u.locale), tier, days, r.mode, r.until)
    await notify({ tx, user: u }, 'ACHIEVEMENT', n.title, n.body, '/premium')
    const until = r.until?.toISOString() ?? null
    await tx.auditLog.update({ where: { id: log.id }, data: { after: { tier, days, reason: why, mode: r.mode, plan: r.plan, until } } })
    return { mode: r.mode, plan: r.plan, until }
  })
}

/** Quita el regalo en marcha (revokeGift): vuelve a Free. Una suscripción de pago no se toca */
export async function removeGift(userId: string) {
  const a = await adminAction()
  return run(async tx => {
    const u = await lockTarget(tx, userId)
    const sub = await tx.subscription.findUnique({ where: { userId } })
    await revokeGift(tx, userId)
    await tx.gift.updateMany({ where: { source: 'ADMIN', redeemedById: userId, status: 'REDEEMED' }, data: { status: 'CANCELED' } })
    await audited(tx, a, 'GIFT_REVOKED', userId, { plan: u.plan, status: sub?.status ?? null, trialEndsAt: sub?.trialEndsAt?.toISOString() ?? null }, { plan: 'FREE', status: 'CANCELED' })
  })
}

/** Llena las vidas */
export async function refillLives(userId: string) {
  const a = await adminAction()
  return run(async tx => {
    await lockTarget(tx, userId)
    const g = await lockGame(tx, userId)
    await tx.gameState.update({ where: { userId }, data: { lives: LIVES_MAX, livesUpdatedAt: new Date() } })
    await audited(tx, a, 'LIVES_REFILLED', userId, { lives: g.lives }, { lives: LIVES_MAX })
    return { lives: LIVES_MAX }
  })
}

/** Suma gemas */
export async function giveGems(userId: string, amount: number) {
  const a = await adminAction()
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000) fail(422, 'VALIDATION_ERROR', 'Elige entre 1 y 10.000 gemas')
  return run(async tx => {
    await lockTarget(tx, userId)
    const g = await lockGame(tx, userId)
    const next = await tx.gameState.update({ where: { userId }, data: { gems: { increment: amount } } })
    await audited(tx, a, 'GEMS_GIVEN', userId, { gems: g.gems }, { gems: next.gems, amount })
    return { gems: next.gems }
  })
}

/**
 * Devuelve una racha perdida: la pone en `streak` días y deja «ayer» como último día activo,
 * así no se vuelve a perder al abrir la app y sigue creciendo si hoy hace algo.
 * Los días perdidos desde su último día activo pasan a «protegidos» en el calendario.
 */
export async function restoreStreak(userId: string, streak: number) {
  const a = await adminAction()
  if (!Number.isInteger(streak) || streak < 0 || streak > 3650) fail(422, 'VALIDATION_ERROR', 'Escribe un número entre 0 y 3.650')
  return run(async tx => {
    const u = await lockTarget(tx, userId)
    const g = await lockGame(tx, userId)
    const data = await applyStreak(tx, u, g, streak)
    await audited(tx, a, 'STREAK_RESTORED', userId, { streak: g.streak, bestStreak: g.bestStreak, lastActiveDay: g.lastActiveDay }, data)
    return { streak }
  })
}

async function applyStreak(tx: Tx, u: { id: string; timezone: string }, g: { streak: number; bestStreak: number; lastActiveDay: string | null }, streak: number) {
  const userId = u.id
  const today = dayOf(Date.now(), u.timezone)
  const yesterday = addDays(today, -1)
  const last = g.lastActiveDay
  const data: { streak: number; bestStreak: number; lastActiveDay?: string } = { streak, bestStreak: Math.max(g.bestStreak, streak) }
  if (streak > 0 && (!last || last < yesterday)) {
    data.lastActiveDay = yesterday
    const from = last && last > addDays(today, -60) ? addDays(last, 1) : addDays(today, -Math.min(streak, 60))
    const days: string[] = []
    for (let d = from; d <= yesterday; d = addDays(d, 1)) days.push(d)
    if (days.length) {
      await tx.streakDay.updateMany({ where: { userId, day: { in: days }, status: 'MISSED' }, data: { status: 'FROZEN' } })
      await tx.streakDay.createMany({ data: days.map(day => ({ userId, day, status: 'FROZEN' })), skipDuplicates: true })
    }
  }
  await tx.gameState.update({ where: { userId }, data })
  return data
}

// ── Repartir: dinero virtual, XP, gemas, vidas, protectores y racha ─────
// Una sola ruta para todo. Cada acción va con motivo opcional (solo lo ve el equipo), queda en la auditoría
// con el antes y el después y, si se pide, avisa a la persona con un mensaje del equipo.
export const GRANT_KINDS = ['CASH', 'XP', 'GEMS', 'LIVES', 'FREEZES', 'STREAK'] as const
export type GrantKind = (typeof GRANT_KINDS)[number]
export interface GrantInput { kind: GrantKind; amount?: number; league?: boolean; reason?: string; notify?: boolean; title?: string; text?: string }

export const CASH_MAX = 1_000_000
export const XP_MAX = 100_000
export const GEMS_MAX = 10_000
export const FREEZES_CAP = 10

const fmt = (v: number, lang: 'es' | 'ca' | 'en', unit = '') => {
  const s = new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang === 'ca' ? 'ca-ES' : 'es-ES', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(v) ? 0 : 2, useGrouping: 'always' }).format(Math.abs(v))
  return unit === '€' ? (lang === 'en' ? `€${s}` : `${s} €`) : s
}

/** Texto del aviso por defecto, en el idioma de la persona */
function grantNotice(lang: 'es' | 'ca' | 'en', kind: GrantKind, n: number) {
  const T = {
    es: { gift: 'Un regalo del equipo', adjust: 'Ajuste de tu cartera', CASH: `Hola {nombre}, el equipo de E-Trading te ha regalado ${fmt(n, lang, '€')} virtuales para tu cartera. No es dinero real: es para que practiques sin miedo.`, CASH_NEG: `Hola {nombre}, hemos ajustado tu cartera virtual: ${fmt(n, lang, '€')} menos en efectivo. Si tienes cualquier duda, escríbenos.`, XP: `Hola {nombre}, el equipo de E-Trading te ha regalado ${fmt(n, lang)} XP. ¡Sigue así!`, GEMS: `Hola {nombre}, el equipo de E-Trading te ha regalado ${fmt(n, lang)} gemas.`, LIVES: 'Hola {nombre}, te hemos llenado las vidas para que sigas aprendiendo.', FREEZES: `Hola {nombre}, te hemos regalado ${n === 1 ? 'un protector' : `${fmt(n, lang)} protectores`} de racha: si un día no puedes entrar, tu racha sigue viva.`, STREAK: `Hola {nombre}, te hemos devuelto tu racha: ${fmt(n, lang)} ${n === 1 ? 'día' : 'días'}. ¡A por más!` },
    ca: { gift: 'Un regal de l’equip', adjust: 'Ajust de la teva cartera', CASH: `Hola {nom}, l’equip d’E-Trading t’ha regalat ${fmt(n, lang, '€')} virtuals per a la teva cartera. No són diners reals: són perquè practiquis sense por.`, CASH_NEG: `Hola {nom}, hem ajustat la teva cartera virtual: ${fmt(n, lang, '€')} menys en efectiu. Si tens qualsevol dubte, escriu-nos.`, XP: `Hola {nom}, l’equip d’E-Trading t’ha regalat ${fmt(n, lang)} XP. Continua així!`, GEMS: `Hola {nom}, l’equip d’E-Trading t’ha regalat ${fmt(n, lang)} gemmes.`, LIVES: 'Hola {nom}, t’hem omplert les vides perquè continuïs aprenent.', FREEZES: `Hola {nom}, t’hem regalat ${n === 1 ? 'un protector' : `${fmt(n, lang)} protectors`} de ratxa: si un dia no pots entrar, la teva ratxa continua viva.`, STREAK: `Hola {nom}, t’hem retornat la ratxa: ${fmt(n, lang)} ${n === 1 ? 'dia' : 'dies'}. A per més!` },
    en: { gift: 'A gift from the team', adjust: 'Portfolio adjustment', CASH: `Hi {name}, the E-Trading team has given you ${fmt(n, lang, '€')} in virtual money for your portfolio. It’s not real money: it’s there so you can practise without fear.`, CASH_NEG: `Hi {name}, we’ve adjusted your virtual portfolio: ${fmt(n, lang, '€')} less in cash. If you have any questions, write to us.`, XP: `Hi {name}, the E-Trading team has given you ${fmt(n, lang)} XP. Keep it up!`, GEMS: `Hi {name}, the E-Trading team has given you ${fmt(n, lang)} gems.`, LIVES: 'Hi {name}, we’ve refilled your lives so you can keep learning.', FREEZES: `Hi {name}, we’ve given you ${n === 1 ? 'a streak freeze' : `${fmt(n, lang)} streak freezes`}: if you miss a day, your streak stays alive.`, STREAK: `Hi {name}, we’ve restored your streak: ${fmt(n, lang)} ${n === 1 ? 'day' : 'days'}. Go for more!` },
  }[lang]
  const neg = kind === 'CASH' && n < 0
  return { title: neg ? T.adjust : T.gift, text: neg ? T.CASH_NEG : T[kind] }
}

export async function grant(userId: string, input: GrantInput) {
  const a = await adminAction()
  const why = input.reason?.trim().slice(0, 200) || null
  const k = input.kind
  const raw = input.amount ?? 0
  const amount = k === 'CASH' ? Math.round(raw * 100) / 100 : raw
  // Topes: lo que el equipo puede repartir de una vez
  if (k === 'CASH' && (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > CASH_MAX)) fail(422, 'VALIDATION_ERROR', 'Escribe un importe entre −1.000.000 € y 1.000.000 € (distinto de 0)')
  if (k === 'XP' && (!Number.isInteger(amount) || amount < 1 || amount > XP_MAX)) fail(422, 'VALIDATION_ERROR', 'Elige entre 1 y 100.000 XP')
  if (k === 'GEMS' && (!Number.isInteger(amount) || amount < 1 || amount > GEMS_MAX)) fail(422, 'VALIDATION_ERROR', 'Elige entre 1 y 10.000 gemas')
  if (k === 'FREEZES' && (!Number.isInteger(amount) || amount < 1 || amount > FREEZES_CAP)) fail(422, 'VALIDATION_ERROR', `Elige entre 1 y ${FREEZES_CAP} protectores`)
  if (k === 'STREAK' && (!Number.isInteger(amount) || amount < 0 || amount > 3650)) fail(422, 'VALIDATION_ERROR', 'Escribe un número entre 0 y 3.650')
  // El texto propio del aviso se valida antes de tocar nada (sin enlaces ni HTML)
  const custom = input.notify && input.text?.trim() ? cleanMessage(input.title, input.text) : null
  const out = await run(async tx => {
    const u = await lockTarget(tx, userId)
    // El estado de juego bloqueado: las acciones del propio usuario (operar, comprar) esperan a que esto termine
    const g = await lockGame(tx, userId)
    let before: Record<string, unknown> = {}
    let after: Record<string, unknown> = {}
    let value: number
    if (k === 'CASH') {
      // giveCash (trading.ts): suma a la cartera y a su base de dinero regalado (no cuenta como rentabilidad) y apunta el flujo en la liga
      const { giveCash, portfolioRow } = await import('./trading')
      const cash = Number((await portfolioRow(tx, u)).cash)
      if (cash + amount < 0) fail(409, 'INSUFFICIENT_FUNDS', `Solo tiene ${fmt(cash, 'es', '€')} en efectivo: no se le puede quitar más`)
      if (cash + amount > 100_000_000) fail(422, 'VALIDATION_ERROR', 'Su efectivo pasaría de 100.000.000 €')
      const moved = await giveCash(tx, u, amount)
      const next = await tx.portfolio.findUniqueOrThrow({ where: { userId } })
      before = { cash }
      after = { cash: Number(next.cash), amount: moved }
      value = Number(next.cash)
    } else if (k === 'XP') {
      const wk = weekOf(Date.now())
      const data: { xp: number; weekKey?: string; weekXp?: number } = { xp: g.xp + amount }
      // Solo si se marca: también suma en la liga de esta semana
      if (input.league) Object.assign(data, { weekKey: wk, weekXp: (g.weekKey === wk ? g.weekXp : 0) + amount })
      const next = await tx.gameState.update({ where: { userId }, data })
      if (input.league) await tx.leagueMember.updateMany({ where: { weekKey: wk, userId, finalRank: null }, data: { xp: next.weekXp } })
      before = { xp: g.xp, weekXp: g.weekXp, level: levelOf(g.xp).n }
      after = { xp: next.xp, weekXp: next.weekXp, level: levelOf(next.xp).n, amount, league: !!input.league }
      value = next.xp
    } else if (k === 'GEMS') {
      const next = await tx.gameState.update({ where: { userId }, data: { gems: { increment: amount } } })
      before = { gems: g.gems }
      after = { gems: next.gems, amount }
      value = next.gems
    } else if (k === 'LIVES') {
      await tx.gameState.update({ where: { userId }, data: { lives: LIVES_MAX, livesUpdatedAt: new Date() } })
      before = { lives: g.lives }
      after = { lives: LIVES_MAX }
      value = LIVES_MAX
    } else if (k === 'FREEZES') {
      if (g.freezes + amount > FREEZES_CAP) fail(409, 'CONFLICT', `Ya tiene ${g.freezes}: como mucho puede tener ${FREEZES_CAP}`)
      const next = await tx.gameState.update({ where: { userId }, data: { freezes: { increment: amount } } })
      before = { freezes: g.freezes }
      after = { freezes: next.freezes, amount }
      value = next.freezes
    } else {
      const data = await applyStreak(tx, u, g, amount)
      before = { streak: g.streak, bestStreak: g.bestStreak, lastActiveDay: g.lastActiveDay }
      after = { ...data }
      value = amount
    }
    const ACTION: Record<GrantKind, string> = { CASH: amount < 0 ? 'CASH_REMOVED' : 'CASH_GIVEN', XP: 'XP_GIVEN', GEMS: 'GEMS_GIVEN', LIVES: 'LIVES_REFILLED', FREEZES: 'FREEZES_GIVEN', STREAK: 'STREAK_RESTORED' }
    let sent: Awaited<ReturnType<typeof createTeamMessage>> | null = null
    if (input.notify) {
      const msg = custom ?? grantNotice(msgLang(u.locale), k, k === 'LIVES' ? LIVES_MAX : amount)
      sent = await createTeamMessage(tx, u, msg)
      await audited(tx, a, 'TEAM_MESSAGE', userId, {}, { messageId: sent.id, title: sent.title, text: sent.body, via: ACTION[k] })
    }
    await audited(tx, a, ACTION[k], userId, before, { ...after, reason: why, messageId: sent?.id ?? null })
    return { kind: k, value, sent }
  })
  if (out.sent) pushLater([out.sent])
  return { kind: out.kind, value: out.value, messageId: out.sent?.id ?? null }
}

/** Bloquea (con motivo) o desbloquea. Al bloquear se cierran sus sesiones abiertas */
export async function setBlocked(userId: string, blocked: boolean, reason?: string) {
  const a = await adminAction()
  const why = reason?.trim().slice(0, 300) || null
  if (blocked && (!why || why.length < 3)) fail(422, 'VALIDATION_ERROR', 'Escribe el motivo del bloqueo')
  return run(async tx => {
    const u = await lockTarget(tx, userId)
    if (blocked && (u.role === 'ADMIN' || u.id === a.id)) fail(409, 'CONFLICT', 'No se puede bloquear a alguien del equipo')
    await tx.user.update({ where: { id: userId }, data: blocked ? { blockedAt: new Date(), blockReason: why } : { blockedAt: null, blockReason: null } })
    if (blocked) await tx.session.deleteMany({ where: { userId } })
    await audited(tx, a, blocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', userId, { blocked: !!u.blockedAt, reason: u.blockReason }, { blocked, reason: blocked ? why : null })
    return { blocked }
  })
}

/** Vuelve a mandar el aviso de bienvenida («Tu primera clase te espera») */
export async function resendWelcome(userId: string) {
  const a = await adminAction()
  return run(async tx => {
    const u = await lockTarget(tx, userId)
    // Dos clics seguidos no mandan dos avisos
    if (await tx.notification.count({ where: { userId, type: 'NEW_LESSON', createdAt: { gte: new Date(Date.now() - 60_000) } } })) fail(429, 'RATE_LIMITED', 'Ya se lo hemos mandado hace un momento')
    const T = {
      es: ['Tu primera clase te espera', '«Tu primera inversión en 3 minutos»: empieza por aquí.'],
      ca: ['La teva primera classe t’espera', '«La teva primera inversió en 3 minuts»: comença per aquí.'],
      en: ['Your first lesson is waiting', '“Your first investment in 3 minutes”: start here.'],
    }[langOf(u.locale)]
    await notify({ tx, user: u }, 'NEW_LESSON', T[0], T[1], '/clases')
    await audited(tx, a, 'WELCOME_RESENT', userId, {}, { type: 'NEW_LESSON' })
  })
}

/** Regalos en marcha (tarjeta del panel): los del equipo y los comprados en «Regalar» y ya canjeados */
export async function adminGifts() {
  await requireAdmin()
  const rows = await db.gift.findMany({ where: { source: { in: ['ADMIN', 'PURCHASE'] }, status: 'REDEEMED' }, orderBy: { redeemedAt: 'desc' }, take: 300 })
  const ids = [...new Set(rows.map(r => r.redeemedById).filter((x): x is string => !!x))]
  const [users, subs] = await Promise.all([db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true, plan: true } }), db.subscription.findMany({ where: { userId: { in: ids } } })])
  const now = Date.now()
  const latest = new Set<string>()
  return rows
    .filter(r => {
      if (!r.redeemedById || !r.redeemedAt) return false
      const first = !latest.has(r.redeemedById)
      latest.add(r.redeemedById)
      const sub = subs.find(s => s.userId === r.redeemedById)
      // Sigue en marcha si aún no han pasado sus días o, si es el último que se le dio, mientras dure su regalo (los días se suman)
      return r.redeemedAt.getTime() + r.days * DAY_MS > now || (first && sub?.status === 'GIFT' && !!sub.trialEndsAt && sub.trialEndsAt.getTime() > now)
    })
    .map(r => {
      const u = users.find(x => x.id === r.redeemedById)
      const sub = subs.find(s => s.userId === r.redeemedById)
      const stripe = !!sub?.stripeSubId && LIVE.includes(sub.status)
      const until = sub?.status === 'GIFT' ? sub.trialEndsAt : stripe || sub?.status === 'ACTIVE' ? sub.renewsAt : null
      return { id: r.id, userId: r.redeemedById!, name: u?.name || '—', email: u?.email ?? '—', tier: r.tier as 'PLUS' | 'PREMIUM', days: r.days, by: r.buyerEmail, reason: r.source === 'PURCHASE' ? null : r.message, at: (r.redeemedAt ?? r.createdAt).toISOString(), stripe, until: until?.toISOString() ?? null, source: r.source as 'ADMIN' | 'PURCHASE', plan: (u?.plan ?? 'FREE') as 'FREE' | 'PLUS' | 'PREMIUM' }
    })
}

/** De un vistazo (tarjeta principal del panel): personas, actividad, dinero, avisos y las últimas altas */
export async function glance() {
  await requireAdmin()
  const today = dayOf()
  const day = new Date(Date.now() - DAY_MS)
  const week = new Date(Date.now() - 7 * DAY_MS)
  const people = { role: 'USER' as const }
  const [users, guests, new24h, new7d, activeToday, active7d, plus, max, stripe, blocked, openReports, sent7d, read7d, recent] = await Promise.all([
    db.user.count({ where: people }),
    db.user.count({ where: { ...people, isAnonymous: true } }),
    db.user.count({ where: { ...people, createdAt: { gte: day } } }),
    db.user.count({ where: { ...people, createdAt: { gte: week } } }),
    db.streakDay.count({ where: { day: today, status: 'ACTIVE', user: people } }),
    db.gameState.count({ where: { lastActiveDay: { gte: addDays(today, -6) }, user: people } }),
    db.user.count({ where: { ...people, plan: 'PLUS' } }),
    db.user.count({ where: { ...people, plan: 'PREMIUM' } }),
    db.subscription.count({ where: { stripeSubId: { not: null }, status: { in: LIVE }, user: people } }),
    db.user.count({ where: { ...people, blockedAt: { not: null } } }),
    db.report.count({ where: { status: 'OPEN' } }),
    db.notification.count({ where: { id: { startsWith: TEAM_PREFIX }, createdAt: { gte: week } } }),
    db.notification.count({ where: { id: { startsWith: TEAM_PREFIX }, createdAt: { gte: week }, readAt: { not: null } } }),
    db.user.findMany({ where: { ...people, OR: [{ isAnonymous: false }, { isAnonymous: null }] }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, name: true, email: true, createdAt: true, onboardingStep: true, _count: { select: { notifications: { where: { id: { startsWith: TEAM_PREFIX } } } } } } }),
  ])
  return {
    users, guests, new24h, new7d, activeToday, active7d, plus, max, stripe, blocked, openReports,
    messages: { sent7d, read7d },
    recent: recent.map(r => ({ id: r.id, name: r.name || '—', email: r.email, createdAt: r.createdAt.toISOString(), onboarded: r.onboardingStep === null, messaged: r._count.notifications > 0 })),
  }
}
