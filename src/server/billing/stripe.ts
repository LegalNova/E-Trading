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
/** Estados de una suscripción de Stripe que mantienen el plan */
export const LIVE = ['ACTIVE', 'TRIALING', 'PAST_DUE']
/**
 * Marca en la suscripción de Stripe: su periodo gratis es un regalo por invitar a alguien estando ya de pago
 * (no una prueba). Así no se le habla de «prueba» ni se le avisa de que «empieza la suscripción».
 */
export const GIFT_META = 'lumi_gift'
const DAY_MS = 86_400_000

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
export async function checkoutUrl(user: User, plan: PlanId, opts: { trialDays: number | null; freeUntil?: Date | null; origin: string; locale: string }) {
  const customer = await customerOf(user)
  // Pagos abiertos en otras pestañas: se cierran, para que no se pueda pagar dos suscripciones a la vez
  const open = await stripe!.checkout.sessions.list({ customer, status: 'open', limit: 10 }).catch(() => null)
  await Promise.all((open?.data ?? []).map(s => stripe!.checkout.sessions.expire(s.id).catch(() => null)))
  // Periodo sin cobro: la prueba (si la tiene) o los días de Max regalado que le queden (no se pierden al suscribirse).
  // Stripe pide que el final de un periodo gratis fijado a mano quede al menos 48 h por delante.
  const trialEnd = Math.max(opts.trialDays ? Date.now() + opts.trialDays * DAY_MS : 0, opts.freeUntil?.getTime() ?? 0)
  const free = trialEnd > Date.now() + 2 * DAY_MS + 60_000 ? { trial_end: Math.floor(trialEnd / 1000) } : {}
  const session = await stripe!.checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price: await priceId(LOOKUP[plan]), quantity: 1 }],
    subscription_data: { metadata: { userId: user.id, plan }, ...free },
    metadata: { userId: user.id, plan },
    allow_promotion_codes: true,
    locale: opts.locale === 'ca' ? 'auto' : (opts.locale as 'es' | 'en'),
    // Al volver, la app confirma el pago con Stripe ({CHECKOUT_SESSION_ID} lo rellena Stripe) y enseña el «Gracias»
    success_url: `${opts.origin}/${opts.locale}/premium?pago=ok&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/${opts.locale}/premium?pago=no`,
  })
  return session.url!
}

/**
 * Portal de Stripe: cambiar tarjeta, ver facturas, cambiar de plan o cancelar.
 * Con `plan`, abre directamente la confirmación del cambio a ese plan (de Plus a Max, de mensual a anual).
 */
export async function portalUrl(user: User, origin: string, locale: string, plan?: PlanId) {
  const sub = await db.subscription.findUnique({ where: { userId: user.id } })
  if (!sub?.stripeCustomerId) return null
  const return_url = `${origin}/${locale}/ajustes`
  let flow: Stripe.BillingPortal.SessionCreateParams.FlowData | undefined
  if (plan && sub.stripeSubId && LIVE.includes(sub.status)) {
    const s = await stripe!.subscriptions.retrieve(sub.stripeSubId).catch(() => null)
    const item = s?.items.data[0]
    if (s && item && item.price.lookup_key !== LOOKUP[plan] && !s.cancel_at_period_end)
      flow = { type: 'subscription_update_confirm', subscription_update_confirm: { subscription: s.id, items: [{ id: item.id, price: await priceId(LOOKUP[plan]), quantity: 1 }] }, after_completion: { type: 'redirect', redirect: { return_url } } }
  }
  const s = await stripe!.billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url, ...(flow ? { flow_data: flow } : {}) }).catch(e => {
    // Si el cambio directo no se puede preparar (portal sin ese plan, por ejemplo), se abre el portal normal
    if (!flow) throw e
    console.error('stripe portal flow', e)
    return stripe!.billingPortal.sessions.create({ customer: sub.stripeCustomerId!, return_url })
  })
  // Al volver del portal, la app vuelve a mirar en Stripe (por si el aviso de Stripe tarda o no llega)
  await db.event.create({ data: { userId: user.id, name: 'portal_open', props: { plan: plan ?? null } } }).catch(() => null)
  return s.url
}

/**
 * Si ha abierto el portal de Stripe después del último cambio que tenemos apuntado, se pregunta a Stripe por su
 * suscripción (cambio de plan, cancelación…) sin esperar al aviso. Como mucho una vez por minuto.
 */
export async function refreshAfterPortal(userId: string): Promise<boolean> {
  if (!stripe) return false
  const sub = await db.subscription.findUnique({ where: { userId } })
  if (!sub?.stripeSubId) return false
  if (Date.now() - sub.updatedAt.getTime() < 60_000) return false
  const opened = await db.event.findFirst({ where: { userId, name: 'portal_open', createdAt: { gt: sub.updatedAt, gte: new Date(Date.now() - 6 * 3600_000) } }, select: { id: true } })
  if (!opened) return false
  try {
    await syncSubscription(await stripe.subscriptions.retrieve(sub.stripeSubId))
    // Aunque no haya cambiado nada, queda apuntado que ya se ha mirado (no se vuelve a preguntar en cada pantalla)
    await db.subscription.update({ where: { userId }, data: { updatedAt: new Date() } })
    return true
  } catch (e) {
    console.error('stripe refresh', userId, e)
    return false
  }
}

const STATUS: Record<string, string> = { trialing: 'TRIALING', active: 'ACTIVE', past_due: 'PAST_DUE', unpaid: 'PAST_DUE', canceled: 'CANCELED', incomplete: 'NONE', incomplete_expired: 'CANCELED', paused: 'CANCELED' }

/** Copia en nuestra base de datos el estado de una suscripción de Stripe (idempotente) */
export async function syncSubscription(s: Stripe.Subscription) {
  const userId = s.metadata?.userId ?? (await db.subscription.findFirst({ where: { stripeCustomerId: String(s.customer) }, select: { userId: true } }))?.userId
  if (!userId) return null
  const item = s.items.data[0]
  const lookup = item?.price.lookup_key ?? ''
  const tier = (item?.price.metadata?.lumi_tier as 'PLUS' | 'PREMIUM' | undefined) ?? TIER_OF_LOOKUP[lookup] ?? 'PREMIUM'
  // Periodo gratis regalado a quien ya pagaba: para nosotros sigue siendo una suscripción activa (con el cobro retrasado)
  const status = s.status === 'trialing' && s.metadata?.[GIFT_META] ? 'ACTIVE' : (STATUS[s.status] ?? 'NONE')
  const keeps = LIVE.includes(status)
  const row = await db.subscription.findUnique({ where: { userId } })
  if (!keeps && row) {
    // Avisos viejos o repetidos de una suscripción que ya terminó: no pueden quitar un plan que sigue en vigor
    // (otra suscripción de pago más nueva, o Max regalado por invitar después de cancelar)
    const otherLive = !!row.stripeSubId && row.stripeSubId !== s.id && LIVE.includes(row.status)
    const liveGift = row.status === 'GIFT' && !!row.trialEndsAt && row.trialEndsAt.getTime() > Date.now()
    if (otherLive || liveGift) return { userId, status: row.status, tier, ignored: true as const }
  }
  const renewsAt = item?.current_period_end ? new Date(item.current_period_end * 1000) : null
  const trialEndsAt = s.trial_end ? new Date(s.trial_end * 1000) : null
  const interval = item?.price.recurring?.interval === 'year' ? 'YEAR' : 'MONTH'
  const data = { status, interval, trialEndsAt, renewsAt: s.cancel_at_period_end || !keeps ? null : renewsAt, stripeCustomerId: String(s.customer), stripeSubId: s.id }
  await db.subscription.upsert({ where: { userId }, create: { userId, ...data }, update: data })
  await db.user.update({ where: { id: userId }, data: { plan: keeps ? tier : 'FREE', ...(status === 'TRIALING' ? { trialUsed: true } : {}) } })
  // Saldo virtual de los planes de pago (una sola vez, como en la prueba)
  // (condición en la misma sentencia: si el aviso de Stripe y la confirmación llegan a la vez, solo se suma una vez)
  if (keeps) {
    const up = await db.portfolio.updateMany({ where: { userId, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
    // En la liga, ese saldo extra no es rentabilidad
    if (up.count) await addFlow(db as unknown as Tx, userId, START_CASH.PREMIUM - START_CASH.FREE)
  }
  return { userId, status, tier, ignored: false as const }
}

/**
 * Regalo por invitar a quien ya tiene suscripción de pago: su próximo cobro se retrasa `days` días
 * (periodo gratis en Stripe hasta la fecha de cobro + los días regalados). `key` evita darlo dos veces por el mismo amigo.
 */
export async function delayNextCharge(userId: string, subId: string, days: number, key: string) {
  if (!stripe) return
  try {
    const s = await stripe.subscriptions.retrieve(subId)
    if (!['active', 'trialing', 'past_due'].includes(s.status)) return
    const now = Math.floor(Date.now() / 1000)
    const from = Math.max(s.items.data[0]?.current_period_end ?? now, s.trial_end ?? 0, now)
    // Si ya estaba pagando, es un regalo (no una prueba); si estaba en su prueba gratis, sigue siendo su prueba
    const gift = s.status !== 'trialing' || !!s.metadata?.[GIFT_META]
    const updated = await stripe.subscriptions.update(subId, { trial_end: from + days * 86_400, proration_behavior: 'none', ...(gift ? { metadata: { [GIFT_META]: '1' } } : {}) }, { idempotencyKey: `gift-${subId}-${key}` })
    await syncSubscription(updated)
  } catch (e) {
    // Si Stripe falla, queda en el registro para revisarlo a mano (la clase del amigo ya se guardó)
    console.error('invite/gift stripe', userId, key, e)
  }
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
  const r = await syncSubscription(sub)
  // Pago aún sin confirmar por el banco (3D Secure, por ejemplo): se sigue esperando, no se dice «Gracias» todavía
  if (!r || !LIVE.includes(STATUS[sub.status] ?? 'NONE')) return { done: false as const, expired: sub.status === 'incomplete_expired' }
  return { done: true as const, amount: (s.amount_total ?? 0) / 100, currency: (s.currency ?? 'eur').toUpperCase(), trial: sub.status === 'trialing' }
}
