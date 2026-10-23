import 'server-only'
// Panel de administración (07). Solo ADMIN. Cifras reales de la base de datos; «null» = vacío real.
import { addDays, dayOf } from '@/shared/time'
import { db } from '../db'
import { ACHIEVEMENTS, QUIZZES, UNITS } from '../content/catalog'
import { fail, requireUser } from './core'

export async function requireAdmin() {
  const u = await requireUser()
  if (u.role !== 'ADMIN') fail(403, 'FORBIDDEN', 'Solo para administración')
  return u
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
  const SOURCES: Record<string, string> = { FINNHUB: 'Finnhub (acciones EE. UU.)', BINANCE: 'Binance (cripto)', YAHOO: 'Yahoo (España, Xetra, índices, divisas)', ECB: 'BCE (respaldo de divisas)' }
  return {
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

export async function users(q?: string) {
  await requireAdmin()
  const where = q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { name: { contains: q, mode: 'insensitive' as const } }] } : {}
  const rows = await db.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, include: { game: { select: { xp: true, lastActiveDay: true } } } })
  return rows.map(u => ({ id: u.id, name: u.name || '—', email: u.email, plan: u.plan, createdAt: u.createdAt.toISOString(), lastActive: u.game?.lastActiveDay ?? '—', blocked: !!u.blockedAt, xp: u.game?.xp ?? 0 }))
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
