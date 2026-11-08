import 'server-only'
// Cobro real con Stripe. Se activa solo cuando hay STRIPE_SECRET_KEY (y STRIPE_WEBHOOK_SECRET para los avisos de Stripe);
// sin claves, la app sigue con la prueba simulada de siempre.
// Productos y precios los crea scripts/stripe-setup.ts y se buscan por su «lookup key» (no hace falta copiar IDs).
import Stripe from 'stripe'
import type { User } from '@/generated/prisma/client'
import { db } from '../db'
import { HttpError, START_CASH, type Tx } from '../game/core'
import { addFlow } from '../game/league'

const KEY = process.env.STRIPE_SECRET_KEY ?? ''
export const stripeEnabled = /^(sk|rk)_(test|live)_[A-Za-z0-9]{20,}$/.test(KEY)
export const stripe = stripeEnabled ? new Stripe(KEY, { maxNetworkRetries: 2, timeout: 15_000 }) : null

export type PlanId = 'plus-month' | 'plus-year' | 'premium-month' | 'premium-year'
export const LOOKUP: Record<PlanId, string> = { 'plus-month': 'lumi_plus_month', 'plus-year': 'lumi_plus_year', 'premium-month': 'lumi_max_month', 'premium-year': 'lumi_max_year' }
const TIER_OF_LOOKUP: Record<string, 'PLUS' | 'PREMIUM'> = { lumi_plus_month: 'PLUS', lumi_plus_year: 'PLUS', lumi_max_month: 'PREMIUM', lumi_max_year: 'PREMIUM' }

const priceCache = new Map<string, { id: string; at: number }>()
async function priceId(lookup: string) {
  const hit = priceCache.get(lookup)
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.id
  const list = await stripe!.prices.list({ lookup_keys: [lookup], active: true, limit: 1 })
  const id = list.data[0]?.id
  if (!id) {
    console.error(`Stripe: falta el precio ${lookup} (ejecuta scripts/stripe-setup.ts)`)
    throw new HttpError(503, 'PAYMENTS_UNAVAILABLE', 'Los pagos se están preparando. Vuelve a intentarlo en un rato.')
  }
  priceCache.set(lookup, { id, at: Date.now() })
  return id
}

/** Cliente de Stripe del usuario (se crea la primera vez) */
async function customerOf(user: User) {
  const sub = await db.subscription.findUnique({ where: { userId: user.id } })
  if (sub?.stripeCustomerId) return sub.stripeCustomerId
  const c = await stripe!.customers.create({ email: user.email, name: user.name || undefined, metadata: { userId: user.id } }, { idempotencyKey: `customer-${user.id}` })
  await db.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id, status: 'NONE', stripeCustomerId: c.id }, update: { stripeCustomerId: c.id } })
  return c.id
}

/** Página de pago de Stripe (con la prueba de 7 días si la ha desbloqueado) */
export async function checkoutUrl(user: User, plan: PlanId, opts: { trialDays: number | null; origin: string; locale: string }) {
  const customer = await customerOf(user)
  const session = await stripe!.checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price: await priceId(LOOKUP[plan]), quantity: 1 }],
    subscription_data: { metadata: { userId: user.id, plan }, ...(opts.trialDays ? { trial_period_days: opts.trialDays } : {}) },
    metadata: { userId: user.id, plan },
    allow_promotion_codes: true,
    locale: opts.locale === 'ca' ? 'auto' : (opts.locale as 'es' | 'en'),
    // Al volver, la app confirma el pago con Stripe ({CHECKOUT_SESSION_ID} lo rellena Stripe) y enseña el «Gracias»
    success_url: `${opts.origin}/${opts.locale}/premium?pago=ok&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/${opts.locale}/premium?pago=no`,
  })
  return session.url!
}

/** Portal de Stripe: cambiar tarjeta, ver facturas, cambiar de plan o cancelar */
export async function portalUrl(user: User, origin: string, locale: string) {
  const sub = await db.subscription.findUnique({ where: { userId: user.id } })
  if (!sub?.stripeCustomerId) return null
  const s = await stripe!.billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url: `${origin}/${locale}/ajustes` })
  return s.url
}

const STATUS: Record<string, string> = { trialing: 'TRIALING', active: 'ACTIVE', past_due: 'PAST_DUE', unpaid: 'PAST_DUE', canceled: 'CANCELED', incomplete: 'NONE', incomplete_expired: 'CANCELED', paused: 'CANCELED' }

/** Copia en nuestra base de datos el estado de una suscripción de Stripe (idempotente) */
export async function syncSubscription(s: Stripe.Subscription) {
  const userId = s.metadata?.userId ?? (await db.subscription.findFirst({ where: { stripeCustomerId: String(s.customer) }, select: { userId: true } }))?.userId
  if (!userId) return null
  const item = s.items.data[0]
  const lookup = item?.price.lookup_key ?? ''
  const tier = TIER_OF_LOOKUP[lookup] ?? 'PREMIUM'
  const status = STATUS[s.status] ?? 'NONE'
  const keeps = status === 'TRIALING' || status === 'ACTIVE' || status === 'PAST_DUE'
  const renewsAt = item?.current_period_end ? new Date(item.current_period_end * 1000) : null
  const trialEndsAt = s.trial_end ? new Date(s.trial_end * 1000) : null
  const interval = item?.price.recurring?.interval === 'year' ? 'YEAR' : 'MONTH'
  await db.subscription.upsert({
    where: { userId },
    create: { userId, status, interval, trialEndsAt, renewsAt: s.cancel_at_period_end ? null : renewsAt, stripeCustomerId: String(s.customer), stripeSubId: s.id },
    update: { status, interval, trialEndsAt, renewsAt: s.cancel_at_period_end ? null : renewsAt, stripeCustomerId: String(s.customer), stripeSubId: s.id },
  })
  await db.user.update({ where: { id: userId }, data: { plan: keeps ? tier : 'FREE', ...(status === 'TRIALING' ? { trialUsed: true } : {}) } })
  // Saldo virtual de los planes de pago (una sola vez, como en la prueba)
  // (condición en la misma sentencia: si el aviso de Stripe y la confirmación llegan a la vez, solo se suma una vez)
  if (keeps) {
    const up = await db.portfolio.updateMany({ where: { userId, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
    // En la liga, ese saldo extra no es rentabilidad
    if (up.count) await addFlow(db as unknown as Tx, userId, START_CASH.PREMIUM - START_CASH.FREE)
  }
  return { userId, status, tier }
}

/**
 * Vuelta de la página de pago: se pregunta a Stripe por esa sesión (no se fía de la URL) y, si está pagada,
 * se activa el plan al momento, sin esperar al aviso de Stripe (que puede tardar unos segundos).
 */
export async function confirmCheckout(userId: string, sessionId: string) {
  const s = await stripe!.checkout.sessions.retrieve(sessionId).catch(() => null)
  // Solo la persona que pagó puede confirmar su sesión
  if (!s || s.client_reference_id !== userId) throw new HttpError(404, 'NOT_FOUND', 'No encontramos ese pago')
  if (s.status !== 'complete' || !s.subscription) return { done: false as const, expired: s.status === 'expired' }
  const sub = await stripe!.subscriptions.retrieve(String(s.subscription))
  await syncSubscription(sub)
  return { done: true as const, amount: (s.amount_total ?? 0) / 100, currency: (s.currency ?? 'eur').toUpperCase(), trial: sub.status === 'trialing' }
}
