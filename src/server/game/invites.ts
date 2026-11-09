import 'server-only'
// Invitaciones: cada usuario tiene su enlace (?inv=código).
//  · Quien llega por él recibe 7 días de Max nada más terminar la bienvenida: es su prueba gratis (una por persona).
//  · Quien invita recibe 7 días más cuando su amigo guarda la cuenta y termina su primera clase
//    (así no se ganan días con cuentas vacías). Como mucho 52 amigos premiados: un año de Max.
import { randomInt } from 'node:crypto'
import { db } from '../db'
import { fail, notify, START_CASH, type Tx } from './core'
import { track } from './analytics'
import { after } from 'next/server'
import { delayNextCharge, LIVE } from '../billing/stripe'
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
  // Solo cuentas nuevas: quien ya usó su prueba, ya ha hecho clases, paga o se registró hace días no puede «llegar invitado»
  // (por ejemplo, repitiendo el final de la bienvenida con el código de otra cuenta suya)
  const me = await tx.user.findUnique({ where: { id: userId }, select: { trialUsed: true, createdAt: true, subscription: { select: { stripeSubId: true } } } })
  if (!me || me.trialUsed || me.subscription?.stripeSubId || Date.now() - me.createdAt.getTime() > 3 * DAY_MS) return
  // (las clases que se salta el test de nivel de la bienvenida no cuentan: se marcan antes de terminarla)
  if (await tx.lessonProgress.count({ where: { userId, skipped: false } })) return
  const res = await tx.user.updateMany({ where: { id: userId, invitedById: null }, data: { invitedById: inviter.id } })
  if (!res.count) return
  await track(tx, userId, 'invite', { by: inviter.id })
  // Regalo de bienvenida para el amigo: 7 días de Max desde ya, que cuentan como su prueba gratis
  await giftMax(tx, userId, INVITE_DAYS)
  await tx.user.update({ where: { id: userId }, data: { trialUsed: true } })
  await notify({ tx, user: { id: userId } as never }, 'ACHIEVEMENT', `Tienes ${INVITE_DAYS} días de Max`, 'Regalo por llegar con una invitación: todo el curso y vidas ilimitadas.', '/premium')
}

/**
 * Días de Max regalados: suman al regalo o a la prueba que ya tenga; con una suscripción de pago, retrasan el próximo cobro.
 * `friendId`: el amigo por el que se regala (evita darlo dos veces por el mismo amigo en Stripe).
 */
async function giftMax(tx: Tx, userId: string, days: number, friendId?: string) {
  const sub = await tx.subscription.findUnique({ where: { userId } })
  const now = Date.now()
  // Tiene el plan por su grupo: los días de Max se guardan debajo del grupo (no se le quita el plan del grupo)
  if (sub?.status === 'GROUP') return void (await (await import('./groups')).giftUnderGroup(tx, userId, 'PREMIUM', days))
  if (sub?.stripeSubId && LIVE.includes(sub.status)) {
    // Suscripción de pago en Stripe: el regalo son días sin cobro de verdad. Se pide a Stripe cuando la clase del amigo
    // ya está guardada (fuera de la transacción: si Stripe tarda, la clase no se queda esperando ni se pierde), y solo si
    // de verdad se guardó el premio (si la transacción se deshace, no se regala nada).
    const subId = sub.stripeSubId
    const run = async () => {
      if (friendId && !(await db.user.findUnique({ where: { id: friendId }, select: { inviteRewardedAt: true } }))?.inviteRewardedAt) return
      await delayNextCharge(userId, subId, days, friendId ?? String(now))
    }
    try {
      after(run)
    } catch {
      // Fuera de una petición (tareas programadas): se hace ya
      await run()
    }
    return
  }
  if (sub?.status === 'ACTIVE' && !sub.stripeSubId) {
    // Pago sin Stripe (simulado): se alarga el periodo pagado
    const from = sub.renewsAt && sub.renewsAt.getTime() > now ? sub.renewsAt.getTime() : now
    await tx.subscription.update({ where: { userId }, data: { renewsAt: new Date(from + days * DAY_MS) } })
    return
  }
  const running = (sub?.status === 'GIFT' || sub?.status === 'TRIALING') && sub.trialEndsAt && sub.trialEndsAt.getTime() > now
  const end = new Date((running ? sub!.trialEndsAt!.getTime() : now) + days * DAY_MS)
  // (una suscripción de Stripe ya terminada deja de contar: el regalo no tiene nada que ver con ella)
  await tx.subscription.upsert({ where: { userId }, create: { userId, status: 'GIFT', trialEndsAt: end }, update: { status: 'GIFT', trialEndsAt: end, renewsAt: null, interval: null, stripeSubId: null } })
  await tx.user.update({ where: { id: userId }, data: { plan: 'PREMIUM' } })
  // Como en la prueba: el saldo virtual sube a 50.000 € una sola vez. Al terminar la bienvenida aún no tiene cartera: se crea ya
  await tx.portfolio.createMany({ data: [{ userId, cash: START_CASH.FREE, resetsYear: new Date().getFullYear() }], skipDuplicates: true })
  const up = await tx.portfolio.updateMany({ where: { userId, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
  if (up.count) await addFlow(tx, userId, START_CASH.PREMIUM - START_CASH.FREE)
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
  const paying = await tx.subscription.findFirst({ where: { userId: inviter.id, stripeSubId: { not: null }, status: { in: LIVE } }, select: { userId: true } })
  await giftMax(tx, inviter.id, INVITE_DAYS, userId)
  const who = u.name?.trim().split(/\s+/)[0] || 'Tu invitado'
  // Quien paga no «suma días de Max»: se le retrasa el próximo cobro
  await notify({ tx, user: { id: inviter.id } as never }, 'ACHIEVEMENT', paying ? `Tu próximo cobro se retrasa ${INVITE_DAYS} días` : `${INVITE_DAYS} días más de Max`, `${who} se ha unido gracias a ti y ha terminado su primera clase.`, paying ? '/ajustes' : '/perfil/invitar')
}
