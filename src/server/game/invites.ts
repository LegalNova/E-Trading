import 'server-only'
// Invitaciones (plan de 10.000 €): cada usuario tiene su enlace (?inv=código). Cuando quien llega por él
// guarda su cuenta y termina su primera clase, los dos reciben un mes de Max. Como mucho 12 meses por persona.
import { randomInt } from 'node:crypto'
import { db } from '../db'
import { fail, notify, START_CASH, type Tx } from './core'
import { track } from './analytics'

export const INVITE_DAYS = 30
export const INVITE_CAP = 12
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
  return { code: code!, joined, rewarded, months: Math.min(rewarded, INVITE_CAP), cap: INVITE_CAP, days: INVITE_DAYS }
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
  if (res.count) await track(tx, userId, 'invite', { by: inviter.id })
}

/** Un mes de Max regalado: suma al regalo o a la prueba que ya tenga; con un pago activo, alarga el periodo */
async function giftMax(tx: Tx, userId: string, days: number) {
  const sub = await tx.subscription.findUnique({ where: { userId } })
  const now = Date.now()
  if (sub?.status === 'ACTIVE') {
    // Pago activo (cuando llegue Stripe, el regalo se aplicará como días sin cobro)
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
  if (pf && !pf.premiumTopUp) await tx.portfolio.update({ where: { userId }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
}

/** Se llama al terminar una clase y al guardar la cuenta de invitado: si ya cumple, los dos reciben su mes */
export async function maybeRewardInvite(tx: Tx, userId: string) {
  const u = await tx.user.findUnique({ where: { id: userId }, select: { invitedById: true, inviteRewardedAt: true, isAnonymous: true, name: true } })
  if (!u?.invitedById || u.inviteRewardedAt || u.isAnonymous) return
  if (!(await tx.lessonProgress.count({ where: { userId, skipped: false } }))) return
  // Marcar primero: si dos peticiones llegan a la vez, solo una da el regalo
  const mark = await tx.user.updateMany({ where: { id: userId, inviteRewardedAt: null }, data: { inviteRewardedAt: new Date() } })
  if (!mark.count) return
  const inviter = await tx.user.findUnique({ where: { id: u.invitedById }, select: { id: true, blockedAt: true } })
  await giftMax(tx, userId, INVITE_DAYS)
  await notify({ tx, user: { id: userId } as never }, 'ACHIEVEMENT', 'Tienes un mes de Max', 'Por llegar con una invitación y terminar tu primera clase. ¡A por todo el curso!', '/premium')
  await track(tx, userId, 'invite', { rewarded: true })
  if (!inviter || inviter.blockedAt) return
  const already = await tx.user.count({ where: { invitedById: inviter.id, inviteRewardedAt: { not: null }, id: { not: userId } } })
  if (already >= INVITE_CAP) return
  await giftMax(tx, inviter.id, INVITE_DAYS)
  const who = u.name?.trim().split(/\s+/)[0] || 'Tu invitado'
  await notify({ tx, user: { id: inviter.id } as never }, 'ACHIEVEMENT', 'Un mes más de Max', `${who} se ha unido gracias a ti y ha terminado su primera clase.`, '/perfil/invitar')
}
