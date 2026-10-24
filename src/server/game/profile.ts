import 'server-only'
// Perfil, onboarding, Inicio, progreso, avisos, ajustes, Premium (simulado hasta Stripe) y RGPD
import type { BillingStatusT, HomeT, MeT, Mood, NotificationT, SettingsT, StreakT } from '@/shared/contract'
import { addDays, dayOf } from '@/shared/time'
import type { User } from '@/generated/prisma/client'
import { db } from '../db'
import { currentUser, googleEnabled } from '../auth'
import { ACHIEVEMENTS } from '../content/catalog'
import { achievementList, endFx, fail, FREEZE_PRICE, goalDefs, goalsOf, minutesOf, levelOf, levelTitle, LIVES_MAX, livesOf, lumi, MAX_FREEZES, notify, REFILL_PRICE, START_CASH, withCtx } from './core'
import { pathOf } from './learning'
import { portfolioIn, portfolioRow, processPendingFor, userBook } from './trading'

const DAY_MS = 86_400_000

// ── Sesión y onboarding ──────────────────────────────────
export async function session() {
  const u = await currentUser()
  return { signedIn: !!u, email: u?.email ?? null, onboardingStep: u ? u.onboardingStep : null, isAdmin: u?.role === 'ADMIN', googleEnabled }
}

export interface Draft { name: string; gender: 'F' | 'M' | 'N'; birthDate: string; experience: 'NONE' | 'SOME' | 'EXPERIENCED'; goals: string[]; dailyGoalMinutes: 5 | 10 | 15 | 20; skinId: string; companionName: string; disclaimerAccepted: boolean }
const emptyDraft = (u: User): Draft => ({ name: u.name ?? '', gender: 'N', birthDate: '', experience: 'NONE', goals: [], dailyGoalMinutes: 10, skinId: 'azul', companionName: 'Lumi', disclaimerAccepted: false })

export const onboarding = () => withCtx(async c => ({ step: c.user.onboardingStep ?? 1, draft: { ...emptyDraft(c.user), ...((c.user.onboarding as object) ?? {}) } as Draft }))

export const saveOnboarding = (step: number, patch: Partial<Draft>) =>
  withCtx(async c => {
    if (patch.birthDate) {
      const t = Date.parse(patch.birthDate)
      if (!Number.isFinite(t)) fail(422, 'VALIDATION_ERROR', 'Fecha no válida')
      if ((Date.now() - t) / (365.25 * DAY_MS) < 14) fail(403, 'UNDER_MIN_AGE', 'E-Trading es para mayores de 14 años')
    }
    if (patch.name !== undefined && (patch.name.trim().length < 1 || patch.name.length > 30)) fail(422, 'VALIDATION_ERROR', 'Nombre no válido')
    const draft = { ...emptyDraft(c.user), ...((c.user.onboarding as object) ?? {}), ...patch }
    await c.tx.user.update({ where: { id: c.user.id }, data: { onboarding: draft, onboardingStep: Math.max(c.user.onboardingStep ?? 1, step + 1) } })
  })

export const completeOnboarding = () =>
  withCtx(async c => {
    const d = { ...emptyDraft(c.user), ...((c.user.onboarding as object) ?? {}) } as Draft
    if (!d.disclaimerAccepted) fail(422, 'VALIDATION_ERROR', 'Acepta el aviso legal para continuar')
    await c.tx.user.update({
      where: { id: c.user.id },
      data: {
        name: d.name.trim() || 'Tú', gender: d.gender, birthDate: d.birthDate ? new Date(d.birthDate) : null, companionName: d.companionName || 'Lumi', skinId: d.skinId,
        onboardingStep: null, disclaimerAt: new Date(), settings: { ...defaultSettings(c.user), gender: d.gender, dailyGoalMinutes: d.dailyGoalMinutes },
      },
    })
    await portfolioRow(c.tx, c.user)
    await notify(c, 'NEW_LESSON', 'Tu primera clase te espera', '«Qué es invertir»: 4 minutos.', '/clases')
  })

// ── Ajustes ──────────────────────────────────────────────
export function defaultSettings(u: User): SettingsT {
  const on = (email: boolean, push: boolean) => ({ inApp: true, email, push })
  return {
    locale: (['es', 'ca', 'en'].includes(u.locale) ? u.locale : 'es') as SettingsT['locale'], currency: 'EUR', dailyGoalMinutes: 10, theme: 'AUTO', gender: u.gender, leagueVisible: u.leagueVisible,
    notificationPrefs: { STREAK_RISK: on(true, true), ORDER_FILLED: on(false, true), PRICE_ALERT: on(false, true), ACHIEVEMENT: on(false, false), LEAGUE_RESULT: on(true, false), NEW_LESSON: on(false, false) },
  }
}
export const settingsOf = (u: User): SettingsT => ({ ...defaultSettings(u), ...((u.settings as object) ?? {}), gender: u.gender, leagueVisible: u.leagueVisible })

export const settings = () => withCtx(async c => settingsOf(c.user))

export const updateSettings = (patch: Partial<SettingsT> & { name?: string; companionName?: string }) =>
  withCtx(async c => {
    const { name, companionName, ...rest } = patch
    const base = settingsOf(c.user)
    if (rest.notificationPrefs) rest.notificationPrefs = Object.fromEntries(Object.keys(base.notificationPrefs).map(k => [k, rest.notificationPrefs![k] ?? base.notificationPrefs[k]]))
    const next = { ...base, ...rest }
    const u = await c.tx.user.update({
      where: { id: c.user.id },
      data: { settings: next, gender: next.gender, locale: next.locale, leagueVisible: next.leagueVisible, ...(name?.trim() ? { name: name.trim().slice(0, 30) } : {}), ...(companionName?.trim() ? { companionName: companionName.trim().slice(0, 14) } : {}) },
    })
    return settingsOf(u)
  })

// ── Inicio y perfil ──────────────────────────────────────
/** Frase de Lumi en Inicio: celebra, avisa o anima según lo que haya pasado */
function homeLine(c: Parameters<typeof lumi>[0] & { today: string }, todayDone: boolean) {
  const last = c.g.lastActiveDay
  if (todayDone) return lumi(c, 'HOME_DONE')
  if (last && last <= addDays(c.today, -3)) return lumi(c, 'INACTIVITY')
  if (c.g.streak === 0 && c.g.bestStreak > 1 && last === addDays(c.today, -2)) return lumi(c, 'STREAK_LOST', { dias_racha: c.g.bestStreak })
  if (c.g.streak > 0) return lumi(c, 'HOME_STREAK')
  return lumi(c, 'HOME_NEW')
}

export async function home(): Promise<HomeT> {
  const book = await userBook()
  return withCtx(async c => {
    await processPendingFor(c, book)
    const [path, pf, goals] = await Promise.all([pathOf(c.tx, c.user), portfolioIn(c, book), goalsOf(c)])
    const next = path.units.flatMap(u => u.lessons.map(l => ({ l, u }))).find(x => x.l.status === 'AVAILABLE')
    const todayDone = c.g.lastActiveDay === c.today
    // Minigráfica real: fotos diarias de la cartera (sin puntos inventados)
    const snaps = await c.tx.portfolioSnapshot.findMany({ where: { userId: c.user.id }, orderBy: { day: 'desc' }, take: 30 })
    const spark = snaps.reverse().map(s => Number(s.value))
    await endFx(c)
    return {
      user: { name: c.user.name },
      streak: { days: c.g.streak, todayDone },
      gems: c.g.gems,
      lives: livesOf(c.user, c.g),
      companion: homeLine(c, todayDone),
      nextLesson: next ? { id: next.l.id, title: next.l.title, unitTitle: next.u.title, unitOrder: next.u.order, minutes: next.l.minutes, progressPct: next.u.progressPct } : null,
      dailyGoals: goalDefs(minutesOf(c.user)).map(g => ({ id: g.id, label: g.id, progress: goals[g.id], target: g.target, xp: g.xp, done: goals[g.id] >= g.target })),
      portfolio: { totalValue: pf.totalValue, dayChange: pf.dayChange, dayChangePct: pf.dayChangePct, sparkline: spark.length > 1 ? spark : [Number(pf.totalValue), Number(pf.totalValue)] },
    }
  })
}

export const me = () =>
  withCtx(async (c): Promise<MeT> => {
    const lv = levelOf(c.g.xp)
    const [lessons, ach, sub] = await Promise.all([
      c.tx.lessonProgress.count({ where: { userId: c.user.id, skipped: false } }),
      c.tx.userAchievement.count({ where: { userId: c.user.id } }),
      c.tx.subscription.findUnique({ where: { userId: c.user.id } }),
    ])
    return {
      id: c.user.id, name: c.user.name, email: c.user.email, emailVerified: c.user.emailVerified, plan: c.user.plan, planRenewsAt: sub?.renewsAt?.toISOString() ?? null, trialEndsAt: sub?.trialEndsAt?.toISOString() ?? null,
      gender: c.user.gender, memberSince: c.user.createdAt.toISOString(), level: { n: lv.n, title: levelTitle(c.user.gender, lv.n), xp: c.g.xp, xpLevelStart: lv.min, xpForNext: lv.next ?? c.g.xp },
      streak: c.g.streak, gems: c.g.gems, lives: livesOf(c.user, c.g), lessonsCompleted: lessons, achievementsCount: ach, achievementsTotal: ACHIEVEMENTS.length,
      companion: { name: c.user.companionName, skinId: c.user.skinId, mood: (c.g.lastActiveDay === c.today ? 'HAPPY' : 'CALM') as Mood },
      onboardingStep: c.user.onboardingStep,
    }
  })

export const lives = () => withCtx(async c => livesOf(c.user, c.g))

export const refillLives = () =>
  withCtx(async c => {
    if (c.g.gems < REFILL_PRICE) fail(402, 'INSUFFICIENT_GEMS', `Necesitas ${REFILL_PRICE} gemas`)
    c.g.gems -= REFILL_PRICE
    c.g.lives = LIVES_MAX
    c.g.livesUpdatedAt = new Date()
    return livesOf(c.user, c.g)
  })

export const mistakesCount = () => withCtx(c => c.tx.mistake.count({ where: { userId: c.user.id } }))
export const path = () => withCtx(c => pathOf(c.tx, c.user))

// ── Racha y logros ───────────────────────────────────────
export const streak = () =>
  withCtx(async (c): Promise<StreakT> => {
    const from = addDays(c.today, -34)
    const rows = await c.tx.streakDay.findMany({ where: { userId: c.user.id, day: { gte: from } } })
    const map = new Map(rows.map(r => [r.day, r.status as 'ACTIVE' | 'FROZEN' | 'MISSED']))
    const days = Array.from({ length: 35 }, (_, i) => {
      const d = addDays(from, i)
      return { date: d, status: map.get(d) ?? ('NONE' as const) }
    })
    return { current: c.g.streak, best: c.g.bestStreak, todayDone: c.g.lastActiveDay === c.today, timezone: c.user.timezone, freezes: c.g.freezes, freezePrice: FREEZE_PRICE, days }
  })

export const buyFreeze = async () => {
  await withCtx(async c => {
    if (c.g.freezes >= MAX_FREEZES) fail(409, 'CONFLICT', `Ya tienes el máximo de ${MAX_FREEZES} protectores`)
    if (c.g.gems < FREEZE_PRICE) fail(402, 'INSUFFICIENT_GEMS', `Necesitas ${FREEZE_PRICE} gemas`)
    c.g.gems -= FREEZE_PRICE
    c.g.freezes++
  })
  return streak()
}

export const achievements = () => withCtx(c => achievementList(c.tx, c.user.id, c.g, c.counters))

export { league } from './league'

// ── Avisos ───────────────────────────────────────────────
export const notifications = () =>
  withCtx(async c =>
    (await c.tx.notification.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'desc' }, take: 50 })).map(
      (n): NotificationT => ({ id: n.id, type: n.type as NotificationT['type'], title: n.title, body: n.body, deepLink: n.deepLink, readAt: n.readAt?.toISOString() ?? null, createdAt: n.createdAt.toISOString() }),
    ),
  )

export const markRead = (ids: string[] | 'all') =>
  withCtx(async c => {
    await c.tx.notification.updateMany({ where: { userId: c.user.id, readAt: null, ...(ids === 'all' ? {} : { id: { in: ids } }) }, data: { readAt: new Date() } })
  })

// ── Premium (simulado hasta conectar Stripe en la etapa 7) ──
export const PLANS = [
  { id: 'premium-month', interval: 'MONTH' as const, price: '7.99', currency: 'EUR' as const, trialDays: 7 },
  { id: 'premium-year', interval: 'YEAR' as const, price: '59.99', currency: 'EUR' as const, trialDays: 7 },
]

const statusOf = (u: User, s: { status: string; renewsAt: Date | null; trialEndsAt: Date | null; interval: string | null } | null): BillingStatusT => ({
  plan: u.plan, status: (s?.status ?? 'NONE') as BillingStatusT['status'], renewsAt: s?.renewsAt?.toISOString() ?? null, trialEndsAt: s?.trialEndsAt?.toISOString() ?? null, interval: (s?.interval ?? null) as BillingStatusT['interval'],
})

export const billingStatus = () => withCtx(async c => statusOf(c.user, await c.tx.subscription.findUnique({ where: { userId: c.user.id } })))

export const checkout = (planId: string) =>
  withCtx(async c => {
    const plan = PLANS.find(p => p.id === planId) ?? fail(422, 'VALIDATION_ERROR', 'Plan no válido')
    if (c.user.onboardingStep !== null) fail(403, 'FORBIDDEN', 'Termina el registro primero')
    if (c.user.plan === 'PREMIUM') fail(409, 'CONFLICT', 'Ya tienes Premium')
    // Una sola prueba gratis por cuenta
    if (c.user.trialUsed) fail(403, 'TRIAL_USED', 'Ya usaste tu prueba gratis. El pago con tarjeta llegará pronto.')
    // Menores de 18: hace falta el consentimiento de un adulto para contratar (02.13)
    const age = c.user.birthDate ? (Date.now() - c.user.birthDate.getTime()) / (365.25 * DAY_MS) : null
    if (age !== null && age < 18 && c.user.guardianConsent !== 'CONFIRMED') fail(403, 'GUARDIAN_CONSENT_REQUIRED', 'Para Premium hace falta que un adulto lo confirme')
    const trialEnds = new Date(Date.now() + plan.trialDays * DAY_MS)
    const pf = await portfolioRow(c.tx, c.user)
    if (!pf.premiumTopUp) await c.tx.portfolio.update({ where: { userId: c.user.id }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
    const sub = await c.tx.subscription.upsert({ where: { userId: c.user.id }, create: { userId: c.user.id, status: 'TRIALING', interval: plan.interval, trialEndsAt: trialEnds, renewsAt: trialEnds }, update: { status: 'TRIALING', interval: plan.interval, trialEndsAt: trialEnds, renewsAt: trialEnds } })
    const u = await c.tx.user.update({ where: { id: c.user.id }, data: { plan: 'PREMIUM', trialUsed: true } })
    c.g.lives = LIVES_MAX
    return statusOf(u, sub)
  })

export const cancelSubscription = () =>
  withCtx(async c => {
    const sub = await c.tx.subscription.upsert({ where: { userId: c.user.id }, create: { userId: c.user.id, status: 'CANCELED' }, update: { status: 'CANCELED', renewsAt: null, trialEndsAt: null, interval: null } })
    const u = await c.tx.user.update({ where: { id: c.user.id }, data: { plan: 'FREE' } })
    return statusOf(u, sub)
  })

// ── RGPD ─────────────────────────────────────────────────
export const exportData = () =>
  withCtx(async c => {
    const id = c.user.id
    const [portfolio, positions, orders, trades, alerts, lessons, achievements, streak, notifications] = await Promise.all([
      c.tx.portfolio.findUnique({ where: { userId: id } }), c.tx.position.findMany({ where: { userId: id } }), c.tx.order.findMany({ where: { userId: id } }), c.tx.trade.findMany({ where: { userId: id } }),
      c.tx.priceAlert.findMany({ where: { userId: id } }), c.tx.lessonProgress.findMany({ where: { userId: id } }), c.tx.userAchievement.findMany({ where: { userId: id } }),
      c.tx.streakDay.findMany({ where: { userId: id } }), c.tx.notification.findMany({ where: { userId: id } }),
    ])
    const { name, email, createdAt, gender, birthDate, locale, timezone, plan, companionName, skinId, settings } = c.user
    const profile = { name, email, createdAt, gender, birthDate, locale, timezone, plan, companionName, skinId, settings }
    return { exportedAt: new Date().toISOString(), profile, game: c.g, portfolio, positions, orders, trades, alerts, lessons, achievements, streak, notifications }
  })

export async function deleteAccount() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  // Las tablas del usuario se borran en cascada; queda constancia en la auditoría (sin datos personales)
  await db.$transaction([
    db.leagueMember.deleteMany({ where: { userId: u!.id } }),
    db.apiRateLimit.deleteMany({ where: { key: { contains: u!.id } } }),
    db.auditLog.create({ data: { actor: 'usuario', action: 'ACCOUNT_DELETED', entity: 'User', entityId: u!.id } }),
    db.user.delete({ where: { id: u!.id } }),
  ])
}

// ── Público (landing) ────────────────────────────────────
export async function publicStats() {
  const [activeUsers, lessonsCompleted, simulatedTrades] = await Promise.all([
    db.gameState.count({ where: { lastActiveDay: { gte: addDays(dayOf(), -30) } } }),
    db.lessonProgress.count({ where: { skipped: false } }),
    db.trade.count({ where: { status: 'FILLED' } }),
  ])
  return { activeUsers, lessonsCompleted, simulatedTrades }
}

export async function joinWaitlist(email: string, locale: string) {
  const e = email.trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(e) || e.length > 200) fail(422, 'VALIDATION_ERROR', 'Ese email no parece válido')
  if (await db.waitlistEntry.findUnique({ where: { email: e } })) fail(409, 'CONFLICT', 'Ya estás en la lista con este email')
  await db.waitlistEntry.create({ data: { email: e, locale } })
}

export async function contact(input: { name: string; email: string; reason: string; message: string }) {
  if (!input.name?.trim() || !/^\S+@\S+\.\S+$/.test(input.email ?? '') || (input.message ?? '').trim().length < 10 || input.message.length > 5000) fail(422, 'VALIDATION_ERROR', 'Revisa los campos')
  if (!['SCHOOL', 'PRESS', 'SUPPORT', 'OTHER'].includes(input.reason)) fail(422, 'VALIDATION_ERROR', 'Motivo no válido')
  await db.contactMessage.create({ data: { name: input.name.trim().slice(0, 100), email: input.email.trim().slice(0, 200), reason: input.reason, message: input.message.trim() } })
}
