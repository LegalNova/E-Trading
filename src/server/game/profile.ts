import 'server-only'
import { cleanSource, track, trackDaily } from './analytics'
import { linkInviter, maybeRewardInvite } from './invites'
import { tierOf, TRIAL_DAYS, TRIAL_STREAK, trialUnlocked } from '@/shared/plans'
// Perfil, onboarding, Inicio, progreso, avisos, ajustes, Premium (simulado hasta Stripe) y RGPD
import type { BillingStatusT, HomeT, MeT, Mood, NotificationT, SettingsT, StreakT } from '@/shared/contract'
import { addDays, dayOf } from '@/shared/time'
import type { User } from '@/generated/prisma/client'
import { db } from '../db'
import { headers } from 'next/headers'
import { auth, currentUser, googleEnabled, mailEnabled, realUser } from '../auth'
import { viewAs } from '../view'
import { checkoutUrl, confirmCheckout, portalUrl, stripeEnabled, type PlanId as StripePlanId } from '../billing/stripe'
import { currentLocale } from '../locale'
import { forgetMemo } from '../request'
import { ACHIEVEMENTS } from '../content/catalog'
import { achievementList, endFx, fail, FREEZE_PRICE, goalDefs, goalsOf, minutesOf, levelOf, levelTitle, LIVES_MAX, livesOf, lumi, MAX_FREEZES, notify, REFILL_PRICE, START_CASH, withCtx } from './core'
import { ALL_Q, pathOf } from './learning'
import { portfolioIn, portfolioRow, processPendingFor, userBook } from './trading'
import { addFlow } from './league'

const DAY_MS = 86_400_000

// ── Sesión y onboarding ──────────────────────────────────
export async function session() {
  const v = viewAs()
  const [u, real] = await Promise.all([currentUser(), v ? realUser() : null])
  return {
    signedIn: !!u,
    email: u?.email ?? null,
    onboardingStep: u ? u.onboardingStep : null,
    isAdmin: (real ?? u)?.role === 'ADMIN',
    googleEnabled,
    mailEnabled,
    // Cuenta de invitado: aún no ha guardado su progreso con email y contraseña
    isGuest: !!u?.isAnonymous,
    // Un admin está viendo la app como este usuario (solo lectura)
    viewAs: v && u ? { id: u.id, email: u.email, name: u.name } : null,
  }
}

/** El invitado guarda su progreso: su misma cuenta pasa a tener email y contraseña (no se pierde nada) */
export async function saveGuest(email: string, password: string) {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (!u!.isAnonymous) fail(409, 'NOT_GUEST', 'Tu cuenta ya está guardada')
  const mail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || mail.length > 200) fail(422, 'VALIDATION_ERROR', 'Escribe un email válido')
  if (password.length < 8 || password.length > 128 || !/\d/.test(password)) fail(422, 'WEAK_PASSWORD', 'Mínimo 8 caracteres y un número')
  if (await db.user.findUnique({ where: { email: mail } })) fail(409, 'EMAIL_IN_USE', 'Ya hay una cuenta con este email')
  const hash = await (await auth.$context).password.hash(password)
  await db.$transaction([
    db.user.update({ where: { id: u!.id }, data: { email: mail, emailVerified: false, isAnonymous: false } }),
    db.account.create({ data: { id: crypto.randomUUID(), accountId: u!.id, providerId: 'credential', userId: u!.id, password: hash } }),
    db.event.create({ data: { userId: u!.id, name: 'guest_saved' } }),
  ])
  // Si llegó invitado y ya terminó una clase, ahora que tiene cuenta reciben los dos su mes de Max
  await db.$transaction(tx => maybeRewardInvite(tx, u!.id))
  forgetMemo()
  return session()
}

/** Cómo entra la cuenta: con contraseña, con Google o las dos */
export async function loginMethods() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  const acc = await db.account.findMany({ where: { userId: u!.id }, select: { providerId: true, password: true } })
  return { hasPassword: acc.some(a => a.providerId === 'credential' && !!a.password), google: acc.some(a => a.providerId === 'google'), isGuest: !!u!.isAnonymous }
}

/** Cambiar la contraseña o, si la cuenta solo entraba con Google, crear una para entrar también con email */
export async function setOwnPassword(current: string | undefined, next: string) {
  const m = await loginMethods()
  if (m.isGuest) fail(403, 'GUEST_MUST_SAVE', 'Guarda primero tu progreso con email y contraseña')
  if (next.length < 8 || next.length > 128 || !/\d/.test(next)) fail(422, 'WEAK_PASSWORD', 'Mínimo 8 caracteres y un número')
  const h = await headers()
  try {
    if (m.hasPassword) await auth.api.changePassword({ body: { currentPassword: current ?? '', newPassword: next, revokeOtherSessions: true }, headers: h })
    else await auth.api.setPassword({ body: { newPassword: next }, headers: h })
  } catch (e) {
    const code = (e as { body?: { code?: string } })?.body?.code
    if (code === 'INVALID_PASSWORD') fail(422, 'INVALID_CREDENTIALS', 'La contraseña actual no es correcta')
    throw e
  }
  return { ok: true }
}

export interface Draft { name: string; gender: 'F' | 'M' | 'N'; birthDate: string; experience: 'NONE' | 'SOME' | 'EXPERIENCED'; goals: string[]; dailyGoalMinutes: 5 | 10 | 15 | 20 | 30; skinId: string; companionName: string; disclaimerAccepted: boolean }
const emptyDraft = (u: User): Draft => ({ name: u.name ?? '', gender: 'N', birthDate: '', experience: 'NONE', goals: [], dailyGoalMinutes: 10, skinId: 'azul', companionName: 'Lumi', disclaimerAccepted: false })

export const onboarding = () => withCtx(async c => ({ step: c.user.onboardingStep ?? 1, draft: { ...emptyDraft(c.user), ...((c.user.onboarding as object) ?? {}) } as Draft }))

export const saveOnboarding = (step: number, patch: Partial<Draft>) =>
  withCtx(async c => {
    if (patch.birthDate) {
      const t = Date.parse(patch.birthDate)
      if (!Number.isFinite(t)) fail(422, 'VALIDATION_ERROR', 'Fecha no válida')
      if ((Date.now() - t) / (365.25 * DAY_MS) < 14) fail(403, 'UNDER_MIN_AGE', 'Lumi es para mayores de 14 años')
    }
    if (patch.name !== undefined && (patch.name.trim().length < 1 || patch.name.length > 30)) fail(422, 'VALIDATION_ERROR', 'Nombre no válido')
    const draft = { ...emptyDraft(c.user), ...((c.user.onboarding as object) ?? {}), ...patch }
    await c.tx.user.update({ where: { id: c.user.id }, data: { onboarding: draft, onboardingStep: Math.max(c.user.onboardingStep ?? 1, step + 1) } })
  })

export const completeOnboarding = (source?: unknown) =>
  withCtx(async c => {
    const d = { ...emptyDraft(c.user), ...((c.user.onboarding as object) ?? {}) } as Draft
    if (!d.disclaimerAccepted) fail(422, 'VALIDATION_ERROR', 'Acepta el aviso legal para continuar')
    await c.tx.user.update({
      where: { id: c.user.id },
      data: {
        name: d.name.trim() || 'Tú', gender: d.gender, birthDate: d.birthDate ? new Date(d.birthDate) : null, companionName: d.companionName || 'Lumi', skinId: d.skinId,
        onboardingStep: null, disclaimerAt: new Date(), settings: { ...defaultSettings(c.user), gender: d.gender, dailyGoalMinutes: d.dailyGoalMinutes },
        // Primer contacto: solo se guarda una vez
        ...(c.user.source ? {} : { source: cleanSource(source) }),
      },
    })
    if (c.user.onboardingStep !== null) await track(c.tx, c.user.id, 'signup', { source: c.user.source ?? cleanSource(source) })
    // Llegó con el enlace de un amigo: se apunta para darles el mes de Max cuando termine su primera clase
    await linkInviter(c.tx, c.user.id, c.user.source ?? cleanSource(source))
    await portfolioRow(c.tx, c.user)
    await notify(c, 'NEW_LESSON', 'Tu primera clase te espera', '«Qué es invertir»: 4 minutos.', '/clases')
  })

// ── Ajustes ──────────────────────────────────────────────
export function defaultSettings(u: User): SettingsT {
  const on = (email: boolean, push: boolean) => ({ inApp: true, email, push })
  return {
    locale: (['es', 'ca', 'en'].includes(u.locale) ? u.locale : 'es') as SettingsT['locale'], currency: 'EUR', dailyGoalMinutes: 10, theme: 'AUTO', gender: u.gender, leagueVisible: u.leagueVisible,
    notificationPrefs: { STREAK_RISK: on(true, true), ORDER_FILLED: on(false, true), PRICE_ALERT: on(false, true), ACHIEVEMENT: on(false, true), LEAGUE_RESULT: on(true, true), NEW_LESSON: on(false, true) },
  }
}
export const settingsOf = (u: User): SettingsT => {
  const base = defaultSettings(u)
  const saved = (u.settings as (Partial<SettingsT> & { prefsTouched?: boolean }) | null) ?? {}
  // Avisos: mientras la persona no los toque, valen los de por defecto (que pueden mejorar con el tiempo)
  return { ...base, ...saved, notificationPrefs: saved.prefsTouched ? { ...base.notificationPrefs, ...saved.notificationPrefs } : base.notificationPrefs, gender: u.gender, leagueVisible: u.leagueVisible }
}

export const settings = () => withCtx(async c => settingsOf(c.user))

export const updateSettings = (patch: Partial<SettingsT> & { name?: string; companionName?: string; skinId?: string }) =>
  withCtx(async c => {
    const { name, companionName, skinId, ...rest } = patch
    // El color «hielo» se gana en el nivel 5 (también se comprueba aquí, no solo en la app)
    if (skinId === 'hielo' && levelOf(c.g.xp).n < 5) fail(403, 'FEATURE_LOCKED', 'Este color se desbloquea en el nivel 5')
    const base = settingsOf(c.user)
    if (rest.notificationPrefs) rest.notificationPrefs = Object.fromEntries(Object.keys(base.notificationPrefs).map(k => [k, rest.notificationPrefs![k] ?? base.notificationPrefs[k]]))
    // Si toca los avisos, se apunta: a partir de ahí se respetan tal cual (si no, valen los de por defecto)
    const next = { ...base, ...rest, ...(rest.notificationPrefs ? { prefsTouched: true } : {}) }
    const u = await c.tx.user.update({
      where: { id: c.user.id },
      data: { settings: next, gender: next.gender, locale: next.locale, leagueVisible: next.leagueVisible, ...(name?.trim() ? { name: name.trim().slice(0, 30) } : {}), ...(companionName?.trim() ? { companionName: companionName.trim().slice(0, 14) } : {}), ...(skinId ? { skinId } : {}) },
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

// Fallos que toca repasar hoy (repaso espaciado), solo de preguntas que siguen en el curso
export const mistakesCount = () => withCtx(c => c.tx.mistake.count({ where: { userId: c.user.id, questionId: { in: Object.keys(ALL_Q) }, dueAt: { lte: new Date() } } }))
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
// Precios provisionales (D-053): Plus es el plan intermedio y PREMIUM se muestra como «Max»
export const PLANS = [
  { id: 'plus-month', tier: 'PLUS' as const, interval: 'MONTH' as const, price: '3.99', currency: 'EUR' as const, trialDays: 7 },
  { id: 'plus-year', tier: 'PLUS' as const, interval: 'YEAR' as const, price: '29.99', currency: 'EUR' as const, trialDays: 7 },
  { id: 'premium-month', tier: 'PREMIUM' as const, interval: 'MONTH' as const, price: '7.99', currency: 'EUR' as const, trialDays: 7 },
  { id: 'premium-year', tier: 'PREMIUM' as const, interval: 'YEAR' as const, price: '59.99', currency: 'EUR' as const, trialDays: 7 },
]

const statusOf = (u: User, s: { status: string; renewsAt: Date | null; trialEndsAt: Date | null; interval: string | null } | null): BillingStatusT => ({
  plan: u.plan, status: (s?.status ?? 'NONE') as BillingStatusT['status'], renewsAt: s?.renewsAt?.toISOString() ?? null, trialEndsAt: s?.trialEndsAt?.toISOString() ?? null, interval: (s?.interval ?? null) as BillingStatusT['interval'],
})

/** Para el botón de Max que se ve en toda la app (no cuenta como «ha visto los planes») */
export async function planBadge() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  const sub = await db.subscription.findUnique({ where: { userId: u!.id } })
  // Temporal = regalo o prueba sin tarjeta. Una suscripción de Stripe en periodo gratis ya está contratada: no se le ofrece pagar
  const temporary = (sub?.status === 'TRIALING' || sub?.status === 'GIFT') && !sub.stripeSubId && sub.trialEndsAt && sub.trialEndsAt.getTime() > Date.now()
  const daysLeft = temporary ? Math.max(1, Math.ceil((sub!.trialEndsAt!.getTime() - Date.now()) / DAY_MS)) : null
  const g = await db.gameState.findUnique({ where: { userId: u!.id }, select: { streak: true, bestStreak: true } })
  return { plan: u!.plan, status: sub?.status ?? 'NONE', stripe: !!sub?.stripeSubId, endsAt: temporary ? sub!.trialEndsAt!.toISOString() : null, daysLeft, trialUsed: u!.trialUsed, isGuest: !!u!.isAnonymous, streak: g?.streak ?? 0, trialUnlocked: trialUnlocked(g?.bestStreak ?? 0), trialStreak: TRIAL_STREAK, payments: stripeEnabled, isAdmin: u!.role === 'ADMIN' && !viewAs() }
}

export const billingStatus = () =>
  withCtx(async c => {
    // La pantalla de planes pide el estado al abrirse: cuenta como «ha visto los planes» (una vez al día)
    await trackDaily(c.tx, c.user.id, 'premium_view')
    return statusOf(c.user, await c.tx.subscription.findUnique({ where: { userId: c.user.id } }))
  })

export const checkout = async (planId: string) => {
  // Con Stripe configurado: página de pago de Stripe (con la prueba si la ha desbloqueado)
  if (stripeEnabled) return stripeCheckout(planId)
  return simulatedCheckout(planId)
}

async function stripeCheckout(planId: string) {
  const plan = PLANS.find(p => p.id === planId) ?? fail(422, 'VALIDATION_ERROR', 'Plan no válido')
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (u!.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para suscribirte')
  if (u!.onboardingStep !== null) fail(403, 'FORBIDDEN', 'Termina el registro primero')
  const age = u!.birthDate ? (Date.now() - u!.birthDate.getTime()) / (365.25 * DAY_MS) : null
  if (age !== null && age < 18 && u!.guardianConsent !== 'CONFIRMED') fail(403, 'GUARDIAN_CONSENT_REQUIRED', 'Para un plan de pago hace falta que un adulto lo confirme')
  const h = await headers()
  const origin = h.get('origin') ?? `https://${h.get('host')}`
  const locale = currentLocale()
  const sub = await db.subscription.findUnique({ where: { userId: u!.id } })
  // Ya tiene una suscripción de pago: se cambia de plan desde el portal de Stripe
  if (sub?.stripeSubId && ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(sub.status)) return { url: (await portalUrl(u!, origin, locale))! }
  const g = await db.gameState.findUnique({ where: { userId: u!.id }, select: { bestStreak: true } })
  const trial = !u!.trialUsed && trialUnlocked(g?.bestStreak ?? 0) ? TRIAL_DAYS : null
  return { url: await checkoutUrl(u!, plan.id as StripePlanId, { trialDays: trial, origin, locale }) }
}

/** Vuelta de Stripe: confirma el pago y devuelve el plan ya activo (para el «Gracias» de la app) */
export async function confirmPayment(sessionId: string) {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (!stripeEnabled) fail(404, 'NOT_FOUND', 'El pago con tarjeta aún no está activo')
  const r = await confirmCheckout(u!.id, sessionId)
  const [fresh, sub] = await Promise.all([db.user.findUniqueOrThrow({ where: { id: u!.id } }), db.subscription.findUnique({ where: { userId: u!.id } })])
  return { ...r, ...statusOf(fresh, sub) }
}

/** Portal de Stripe para gestionar la suscripción (tarjeta, facturas, cambio de plan, cancelación) */
export async function billingPortal() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (!stripeEnabled) fail(404, 'NOT_FOUND', 'El pago con tarjeta aún no está activo')
  const h = await headers()
  const url = await portalUrl(u!, h.get('origin') ?? `https://${h.get('host')}`, currentLocale())
  if (!url) fail(404, 'NOT_FOUND', 'No tienes ninguna suscripción de pago')
  return { url: url! }
}

const simulatedCheckout = (planId: string) =>
  withCtx(async c => {
    const plan = PLANS.find(p => p.id === planId) ?? fail(422, 'VALIDATION_ERROR', 'Plan no válido')
    if (c.user.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para probar Plus o Max')
    if (c.user.onboardingStep !== null) fail(403, 'FORBIDDEN', 'Termina el registro primero')
    if (tierOf(c.user.plan) >= tierOf(plan.tier)) fail(409, 'CONFLICT', 'Ya tienes este plan o uno superior')
    const current = await c.tx.subscription.findUnique({ where: { userId: c.user.id } })
    // Durante la prueba se puede subir de Plus a Max sin gastar otra prueba
    const upgradingTrial = current?.status === 'TRIALING' && c.user.plan === 'PLUS'
    // Una sola prueba gratis por cuenta
    if (c.user.trialUsed && !upgradingTrial) fail(403, 'TRIAL_USED', 'Ya usaste tu prueba gratis. El pago con tarjeta llegará pronto.')
    // La prueba se gana: 5 días seguidos de racha (o llegar con una invitación, que ya la regala)
    if (!upgradingTrial && !trialUnlocked(c.g.bestStreak)) fail(403, 'TRIAL_LOCKED', `Consigue una racha de ${TRIAL_STREAK} días seguidos para desbloquear ${TRIAL_DAYS} días de Max gratis`)
    // Menores de 18: hace falta el consentimiento de un adulto para contratar (02.13)
    const age = c.user.birthDate ? (Date.now() - c.user.birthDate.getTime()) / (365.25 * DAY_MS) : null
    if (age !== null && age < 18 && c.user.guardianConsent !== 'CONFIRMED') fail(403, 'GUARDIAN_CONSENT_REQUIRED', 'Para un plan de pago hace falta que un adulto lo confirme')
    const trialEnds = upgradingTrial && current?.trialEndsAt ? current.trialEndsAt : new Date(Date.now() + plan.trialDays * DAY_MS)
    const pf = await portfolioRow(c.tx, c.user)
    if (!pf.premiumTopUp) {
      const up = await c.tx.portfolio.updateMany({ where: { userId: c.user.id, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
      if (up.count) await addFlow(c.tx, c.user.id, START_CASH.PREMIUM - START_CASH.FREE)
    }
    const sub = await c.tx.subscription.upsert({ where: { userId: c.user.id }, create: { userId: c.user.id, status: 'TRIALING', interval: plan.interval, trialEndsAt: trialEnds, renewsAt: trialEnds }, update: { status: 'TRIALING', interval: plan.interval, trialEndsAt: trialEnds, renewsAt: trialEnds } })
    const u = await c.tx.user.update({ where: { id: c.user.id }, data: { plan: plan.tier, trialUsed: true } })
    c.g.lives = LIVES_MAX
    await track(c.tx, c.user.id, 'trial_start', { plan: plan.id })
    return statusOf(u, sub)
  })

export const cancelSubscription = async () => {
  if (stripeEnabled) {
    const sub = await db.subscription.findFirst({ where: { user: { id: (await currentUser())?.id ?? '' } } })
    if (sub?.stripeSubId) return billingPortal()
  }
  return simulatedCancel()
}

const simulatedCancel = () =>
  withCtx(async c => {
    const sub = await c.tx.subscription.upsert({ where: { userId: c.user.id }, create: { userId: c.user.id, status: 'CANCELED' }, update: { status: 'CANCELED', renewsAt: null, trialEndsAt: null, interval: null } })
    const u = await c.tx.user.update({ where: { id: c.user.id }, data: { plan: 'FREE' } })
    await track(c.tx, c.user.id, 'cancel', { from: c.user.plan })
    return statusOf(u, sub)
  })

// ── RGPD ─────────────────────────────────────────────────
export const exportData = () =>
  withCtx(async c => {
    const id = c.user.id
    const [portfolio, positions, orders, trades, alerts, lessons, achievements, streak, notifications, tutorChat] = await Promise.all([
      c.tx.portfolio.findUnique({ where: { userId: id } }), c.tx.position.findMany({ where: { userId: id } }), c.tx.order.findMany({ where: { userId: id } }), c.tx.trade.findMany({ where: { userId: id } }),
      c.tx.priceAlert.findMany({ where: { userId: id } }), c.tx.lessonProgress.findMany({ where: { userId: id } }), c.tx.userAchievement.findMany({ where: { userId: id } }),
      c.tx.streakDay.findMany({ where: { userId: id } }), c.tx.notification.findMany({ where: { userId: id } }),
      c.tx.tutorMessage.findMany({ where: { userId: id }, orderBy: { createdAt: 'asc' }, select: { role: true, content: true, mode: true, createdAt: true } }),
    ])
    const { name, email, createdAt, gender, birthDate, locale, timezone, plan, companionName, skinId, settings } = c.user
    const profile = { name, email, createdAt, gender, birthDate, locale, timezone, plan, companionName, skinId, settings }
    return { exportedAt: new Date().toISOString(), profile, game: c.g, portfolio, positions, orders, trades, alerts, lessons, achievements, streak, notifications, tutorChat }
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
