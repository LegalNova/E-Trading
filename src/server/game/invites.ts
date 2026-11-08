import 'server-only'
// Invitaciones: cada usuario tiene su enlace (?inv=código).
//  · Quien llega por él recibe 7 días de Max nada más terminar la bienvenida: es su prueba gratis (una por persona).
//  · Quien invita recibe 7 días más cuando su amigo guarda la cuenta y termina su primera clase
//    (así no se ganan días con cuentas vacías). Como mucho 52 amigos premiados: un año de Max.
import { randomInt } from 'node:crypto'
import { db } from '../db'
import { fail, notify, START_CASH, type Tx } from './core'
import { track } from './analytics'
import { stripe } from '../billing/stripe'
import { addFlow } from './league'

export const INVITE_DAYS = 7
export const INVITE_CAP = 52
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // sin letras que se confunden (i, l, o, 0, 1)
const DAY_MS = 86_400_000

/** Código de invitación del usuario (se crea la primera vez que lo pide) */
async function codeOf(userId: string) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { inviteCode: true } })
  if (u?.inviteCode) return u.inviteCode
  for (let i = 0; i < 5; i++) {
    const code = Array.from({ length: 7 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
    try {
      await db.user.update({ where: { id: userId }, data: { inviteCode: code } })
      return code
    } catch {
      // código repetido (muy raro): se prueba otro
    }
  }
  fail(500, 'INTERNAL', 'No se ha podido crear tu enlace. Prueba otra vez.')
}

export async function myInvites(userId: string, isGuest: boolean) {
  if (isGuest) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para invitar')
  const code = await codeOf(userId)
  const [joined, rewarded] = await Promise.all([db.user.count({ where: { invitedById: userId } }), db.user.count({ where: { invitedById: userId, inviteRewardedAt: { not: null } } })])
  return { code: code!, joined, rewarded, daysEarned: Math.min(rewarded, INVITE_CAP) * INVITE_DAYS, maxDays: INVITE_CAP * INVITE_DAYS, days: INVITE_DAYS }
}

/** Para la portada: el nombre de pila de quien invita (si el código existe) */
export async function inviterName(code: string) {
  const u = await db.user.findUnique({ where: { inviteCode: code.toLowerCase().slice(0, 12) }, select: { name: true, blockedAt: true } })
  if (!u || u.blockedAt) return { valid: false, name: null }
  return { valid: true, name: u.name?.trim().split(/\s+/)[0] || null }
}

/** Al terminar la bienvenida: si llegó por un enlace de invitación, se apunta quién le invitó */
export async function linkInviter(tx: Tx, userId: string, source: string | null) {
  if (!source?.startsWith('inv/')) return
  const inviter = await tx.user.findUnique({ where: { inviteCode: source.slice(4) }, select: { id: true, blockedAt: true } })
  if (!inviter || inviter.id === userId || inviter.blockedAt) return
  const res = await tx.user.updateMany({ where: { id: userId, invitedById: null }, data: { invitedById: inviter.id } })
  if (!res.count) return
  await track(tx, userId, 'invite', { by: inviter.id })
  // Regalo de bienvenida para el amigo: 7 días de Max desde ya, que cuentan como su prueba gratis
  await giftMax(tx, userId, INVITE_DAYS)
  await tx.user.update({ where: { id: userId }, data: { trialUsed: true } })
  await notify({ tx, user: { id: userId } as never }, 'ACHIEVEMENT', `Tienes ${INVITE_DAYS} días de Max`, 'Regalo por llegar con una invitación: todo el curso y vidas ilimitadas.', '/premium')
}

/** Un mes de Max regalado: suma al regalo o a la prueba que ya tenga; con un pago activo, alarga el periodo */
async function giftMax(tx: Tx, userId: string, days: number) {
  const sub = await tx.subscription.findUnique({ where: { userId } })
  const now = Date.now()
  if (sub?.stripeSubId && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
    // Suscripción de pago en Stripe: el regalo son días sin cobro de verdad. El próximo cobro se retrasa
    // (periodo gratis hasta la fecha de cobro + los días regalados); el aviso de Stripe actualiza nuestra copia.
    if (!stripe) return
    try {
      const s = await stripe.subscriptions.retrieve(sub.stripeSubId)
      const periodEnd = s.items.data[0]?.current_period_end ?? Math.floor(now / 1000)
      const from = Math.max(periodEnd, s.trial_end ?? 0, Math.floor(now / 1000))
      const updated = await stripe.subscriptions.update(sub.stripeSubId, { trial_end: from + days * 86_400, proration_behavior: 'none' }, { idempotencyKey: `gift-${sub.stripeSubId}-${from}` })
      await tx.subscription.update({ where: { userId }, data: { renewsAt: new Date((updated.trial_end ?? from + days * 86_400) * 1000) } })
    } catch (e) {
      // Si Stripe falla, la clase del amigo no se rompe: queda apuntado para revisarlo a mano
      console.error('invite/gift stripe', userId, e)
    }
    return
  }
  if (sub?.status === 'ACTIVE') {
    // Pago sin Stripe (simulado): se alarga el periodo pagado
    const from = sub.renewsAt && sub.renewsAt.getTime() > now ? sub.renewsAt.getTime() : now
    await tx.subscription.update({ where: { userId }, data: { renewsAt: new Date(from + days * DAY_MS) } })
    return
  }
  const running = (sub?.status === 'GIFT' || sub?.status === 'TRIALING') && sub.trialEndsAt && sub.trialEndsAt.getTime() > now
  const end = new Date((running ? sub!.trialEndsAt!.getTime() : now) + days * DAY_MS)
  await tx.subscription.upsert({ where: { userId }, create: { userId, status: 'GIFT', trialEndsAt: end }, update: { status: 'GIFT', trialEndsAt: end, renewsAt: null, interval: null } })
  await tx.user.update({ where: { id: userId }, data: { plan: 'PREMIUM' } })
  // Como en la prueba: el saldo virtual sube a 50.000 € una sola vez
  const pf = await tx.portfolio.findUnique({ where: { userId } })
  if (pf && !pf.premiumTopUp) {
    const up = await tx.portfolio.updateMany({ where: { userId, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
    if (up.count) await addFlow(tx, userId, START_CASH.PREMIUM - START_CASH.FREE)
  }
}

/** Se llama al terminar una clase y al guardar la cuenta de invitado: si ya cumple, quien invitó recibe sus días */
export async function maybeRewardInvite(tx: Tx, userId: string) {
  const u = await tx.user.findUnique({ where: { id: userId }, select: { invitedById: true, inviteRewardedAt: true, isAnonymous: true, name: true } })
  if (!u?.invitedById || u.inviteRewardedAt || u.isAnonymous) return
  if (!(await tx.lessonProgress.count({ where: { userId, skipped: false } }))) return
  // Marcar primero: si dos peticiones llegan a la vez, solo una da el regalo
  const mark = await tx.user.updateMany({ where: { id: userId, inviteRewardedAt: null }, data: { inviteRewardedAt: new Date() } })
  if (!mark.count) return
  const inviter = await tx.user.findUnique({ where: { id: u.invitedById }, select: { id: true, blockedAt: true } })
  await track(tx, userId, 'invite', { rewarded: true })
  if (!inviter || inviter.blockedAt) return
  const already = await tx.user.count({ where: { invitedById: inviter.id, inviteRewardedAt: { not: null }, id: { not: userId } } })
  if (already >= INVITE_CAP) return
  await giftMax(tx, inviter.id, INVITE_DAYS)
  const who = u.name?.trim().split(/\s+/)[0] || 'Tu invitado'
  await notify({ tx, user: { id: inviter.id } as never }, 'ACHIEVEMENT', `${INVITE_DAYS} días más de Max`, `${who} se ha unido gracias a ti y ha terminado su primera clase.`, '/perfil/invitar')
}
