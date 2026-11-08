import 'server-only'
// Dar un plan (Plus o Max) durante unos días: regalos comprados, regalos del equipo desde el admin…
// (las invitaciones usan su propia versión en invites.ts, que es la misma lógica solo para Max).
//  · Paga con Stripe: los días retrasan de verdad su próximo cobro (no se le cambia el plan que paga).
//  · Pago simulado activo: se alarga el periodo.
//  · Regalo o prueba en marcha: los días se suman al final y se queda el plan más alto de los dos.
//  · Si no: regalo nuevo desde hoy. El saldo virtual sube a 50.000 € una sola vez (y no cuenta como rentabilidad en la liga).
import { after } from 'next/server'
import type { Plan } from '@/generated/prisma/client'
import { delayNextCharge, LIVE } from '../billing/stripe'
import { fail, START_CASH, type Tx } from './core'
import { addFlow } from './league'

const DAY_MS = 86_400_000
const rank = (p: Plan) => (p === 'PREMIUM' ? 2 : p === 'PLUS' ? 1 : 0)

export type GrantResult = { mode: 'DELAYED_CHARGE' | 'EXTENDED' | 'GIFT'; plan: Plan; until: Date | null }

/**
 * Da `tier` durante `days` días a `userId`. `key` identifica el regalo (para no aplicarlo dos veces en Stripe).
 * Se llama dentro de una transacción; lo que toca Stripe se hace al terminar la petición.
 */
export async function grantPlan(tx: Tx, userId: string, tier: 'PLUS' | 'PREMIUM', days: number, key: string): Promise<GrantResult> {
  if (!Number.isInteger(days) || days < 1 || days > 3660) fail(422, 'VALIDATION_ERROR', 'Duración no válida')
  const [sub, user] = await Promise.all([tx.subscription.findUnique({ where: { userId } }), tx.user.findUnique({ where: { id: userId }, select: { plan: true } })])
  if (!user) fail(404, 'NOT_FOUND', 'Usuario no encontrado')
  // Tiene el plan por su grupo: los días se guardan debajo del grupo (no se le quita el plan del grupo)
  if (sub?.status === 'GROUP') return (await import('./groups')).giftUnderGroup(tx, userId, tier, days)
  const now = Date.now()
  if (sub?.stripeSubId && LIVE.includes(sub.status)) {
    const subId = sub.stripeSubId
    const run = () => delayNextCharge(userId, subId, days, key)
    try {
      after(run)
    } catch {
      await run()
    }
    return { mode: 'DELAYED_CHARGE', plan: user!.plan, until: null }
  }
  if (sub?.status === 'ACTIVE' && !sub.stripeSubId) {
    const from = sub.renewsAt && sub.renewsAt.getTime() > now ? sub.renewsAt.getTime() : now
    const until = new Date(from + days * DAY_MS)
    await tx.subscription.update({ where: { userId }, data: { renewsAt: until } })
    return { mode: 'EXTENDED', plan: user!.plan, until }
  }
  const running = (sub?.status === 'GIFT' || sub?.status === 'TRIALING') && sub.trialEndsAt && sub.trialEndsAt.getTime() > now
  const until = new Date((running ? sub!.trialEndsAt!.getTime() : now) + days * DAY_MS)
  const plan: Plan = running && rank(user!.plan) > rank(tier) ? user!.plan : tier
  await tx.subscription.upsert({ where: { userId }, create: { userId, status: 'GIFT', trialEndsAt: until }, update: { status: 'GIFT', trialEndsAt: until, renewsAt: null, interval: null, stripeSubId: null } })
  await tx.user.update({ where: { id: userId }, data: { plan } })
  await tx.portfolio.createMany({ data: [{ userId, cash: START_CASH.FREE, resetsYear: new Date().getFullYear() }], skipDuplicates: true })
  const up = await tx.portfolio.updateMany({ where: { userId, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
  if (up.count) await addFlow(tx, userId, START_CASH.PREMIUM - START_CASH.FREE)
  return { mode: 'GIFT', plan, until }
}

/** Quita un regalo en marcha (solo regalos: una suscripción de pago se gestiona en Stripe) */
export async function revokeGift(tx: Tx, userId: string) {
  const sub = await tx.subscription.findUnique({ where: { userId } })
  if (sub?.status !== 'GIFT') fail(409, 'CONFLICT', 'No tiene ningún regalo en marcha')
  await tx.subscription.update({ where: { userId }, data: { status: 'CANCELED', trialEndsAt: new Date() } })
  await tx.user.update({ where: { id: userId }, data: { plan: 'FREE' } })
}
