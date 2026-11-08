import 'server-only'
// Regalar Lumi: alguien paga Plus o Max durante 1 o 12 meses (pago único con Stripe, sin renovación) y comparte un enlace
// /regalo/<código>. Quien lo recibe lo canjea con su cuenta y los días se le dan con grantPlan (se suman a lo que tenga;
// si paga una suscripción, se retrasa su próximo cobro).
//  · El regalo nace PENDING con su sesión de Stripe; pasa a READY al confirmarse el pago (vuelta a la app o aviso de Stripe).
//  · Se canjea una sola vez (REDEEMED), nunca por quien lo compró, y durante los 12 meses siguientes al pago.
//  · Si se devuelve el dinero antes de canjearlo, queda anulado (CANCELED).
import { randomInt } from 'node:crypto'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import type { Gift } from '@/generated/prisma/client'
import type { GiftMineT, GiftPublicT, GiftRedeemT } from '@/shared/contract'
import { cleanGiftCode, GIFT_ALPHABET, GIFT_CODE_LEN, GIFT_DAYS, GIFT_MESSAGE_MAX, GIFT_NAME_MAX, GIFT_PRICE, GIFT_REDEEM_MONTHS, isGiftCode, type GiftMonths, type GiftTier } from '@/shared/gifts'
import { PLAN_NAME } from '@/shared/plans'
import { db } from '../db'
import { currentUser } from '../auth'
import { checkoutSession, giftCheckout, GIFT_KIND, stripe, stripeEnabled } from '../billing/stripe'
import { currentLocale } from '../locale'
import { fail, HttpError, notify, requireUser, withCtx } from './core'
import { grantPlan } from './grants'

const DAY_MS = 86_400_000
const monthsOf = (days: number): GiftMonths => (days >= 365 ? 12 : 1)
const firstName = (s: string | null | undefined) => s?.trim().split(/\s+/)[0] || null

// ── Avisos (en el idioma de quien los recibe) ─────────────
type Lang = 'es' | 'ca' | 'en'
const langOf = (l: string | null | undefined): Lang => (l === 'ca' || l === 'en' ? l : 'es')
const localeOf = async (userId: string) => langOf((await db.user.findUnique({ where: { id: userId }, select: { locale: true } }))?.locale)
const NOTE = {
  es: {
    ready: (plan: string, to: string | null) => ['Tu regalo está listo', `Lumi ${plan} para ${to || 'quien tú quieras'}. Comparte el enlace: se puede canjear durante 12 meses.`],
    span: (m: GiftMonths) => (m === 12 ? '12 meses' : '1 mes'),
    redeemed: (plan: string, span: string, from: string | null, days: number, delayed: boolean) => [`Regalo canjeado: ${plan} ${span}`, delayed ? `Tu próximo cobro se retrasa ${days} días. Regalo de ${from || 'alguien que te aprecia'}.` : `Regalo de ${from || 'alguien que te aprecia'}. Disfruta aprendiendo.`],
    toBuyer: (who: string | null, plan: string, span: string) => [`${who || 'Alguien'} ha canjeado tu regalo`, `Ya tiene Lumi ${plan} durante ${span}. Gracias por regalar aprender a invertir.`],
  },
  ca: {
    ready: (plan: string, to: string | null) => ['El teu regal està a punt', `La Lumi ${plan} per a ${to || 'qui tu vulguis'}. Comparteix l’enllaç: es pot bescanviar durant 12 mesos.`],
    span: (m: GiftMonths) => (m === 12 ? '12 mesos' : '1 mes'),
    redeemed: (plan: string, span: string, from: string | null, days: number, delayed: boolean) => [`Regal bescanviat: ${plan} ${span}`, delayed ? `El teu proper cobrament es retarda ${days} dies. Regal de ${from || 'algú que t’aprecia'}.` : `Regal de ${from || 'algú que t’aprecia'}. Gaudeix aprenent.`],
    toBuyer: (who: string | null, plan: string, span: string) => [`${who || 'Algú'} ha bescanviat el teu regal`, `Ja té la Lumi ${plan} durant ${span}. Gràcies per regalar aprendre a invertir.`],
  },
  en: {
    ready: (plan: string, to: string | null) => ['Your gift is ready', `Lumi ${plan} for ${to || 'whoever you like'}. Share the link: it can be redeemed for 12 months.`],
    span: (m: GiftMonths) => (m === 12 ? '12 months' : '1 month'),
    redeemed: (plan: string, span: string, from: string | null, days: number, delayed: boolean) => [`Gift redeemed: ${plan} ${span}`, delayed ? `Your next charge is pushed back ${days} days. A gift from ${from || 'someone who cares about you'}.` : `A gift from ${from || 'someone who cares about you'}. Enjoy learning.`],
    toBuyer: (who: string | null, plan: string, span: string) => [`${who || 'Someone'} redeemed your gift`, `They now have Lumi ${plan} for ${span}. Thanks for giving the gift of learning to invest.`],
  },
} as const

/** Texto escrito por la persona: sin caracteres de control ni de dirección del texto, espacios limpios */
function clean(s: string | undefined | null, max: number, multiline = false) {
  if (!s) return ''
  let t = s.normalize('NFC').replace(/[‪-‮⁦-⁩​-‏﻿]/g, '')
  t = multiline ? t.replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n') : t.replace(/\s+/g, ' ')
  t = t.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim()
  return [...t].length > max ? fail(422, 'VALIDATION_ERROR', `Como mucho ${max} caracteres`) : t
}

const NAMES: Record<'es' | 'ca' | 'en', (plan: string, months: GiftMonths) => [string, string]> = {
  es: (p, m) => [`Regalo: Lumi ${p} · ${m === 12 ? '12 meses' : '1 mes'}`, 'Pago único, sin renovación. Se canjea con un enlace durante 12 meses.'],
  ca: (p, m) => [`Regal: la Lumi ${p} · ${m === 12 ? '12 mesos' : '1 mes'}`, 'Pagament únic, sense renovació. Es bescanvia amb un enllaç durant 12 mesos.'],
  en: (p, m) => [`Gift: Lumi ${p} · ${m === 12 ? '12 months' : '1 month'}`, 'One-off payment, no renewal. Redeemed with a link within 12 months.'],
}

/** Estado que se enseña: un regalo listo cuyo plazo de canje ya pasó se ve como caducado */
function statusOf(g: Gift): GiftMineT['status'] {
  if (g.status === 'READY' && g.expiresAt && g.expiresAt.getTime() <= Date.now()) return 'EXPIRED'
  return g.status as GiftMineT['status']
}

function mineView(g: Gift, redeemedBy: string | null = null): GiftMineT {
  return {
    id: g.id, code: g.status === 'PENDING' ? null : g.code, tier: g.tier === 'PLUS' ? 'PLUS' : 'PREMIUM', months: monthsOf(g.days), days: g.days,
    fromName: g.fromName, toName: g.toName, message: g.message, amount: g.amount ? Number(g.amount) : null, status: statusOf(g),
    createdAt: g.createdAt.toISOString(), paidAt: g.paidAt?.toISOString() ?? null, redeemedAt: g.redeemedAt?.toISOString() ?? null, expiresAt: g.expiresAt?.toISOString() ?? null, redeemedBy,
  }
}

async function newCode() {
  for (let i = 0; i < 6; i++) {
    const code = Array.from({ length: GIFT_CODE_LEN }, () => GIFT_ALPHABET[randomInt(GIFT_ALPHABET.length)]).join('')
    if (!(await db.gift.findUnique({ where: { code }, select: { id: true } }))) return code
  }
  return fail(500, 'INTERNAL', 'No se ha podido preparar el regalo. Prueba otra vez.')
}

// ── Comprar ───────────────────────────────────────────────
export async function createGift(input: { tier: GiftTier; months: GiftMonths; fromName: string; toName?: string; message?: string }) {
  const u = await requireUser()
  if (u.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para regalar Lumi')
  if (u.onboardingStep !== null) fail(403, 'FORBIDDEN', 'Termina el registro primero')
  // Como en las suscripciones: entre 14 y 17 años hace falta que un adulto lo confirme
  const age = u.birthDate ? (Date.now() - u.birthDate.getTime()) / (365.25 * DAY_MS) : null
  if (age !== null && age < 18 && u.guardianConsent !== 'CONFIRMED') fail(403, 'GUARDIAN_CONSENT_REQUIRED', 'Para comprar un regalo hace falta que un adulto lo confirme')
  if (!stripeEnabled) fail(503, 'PAYMENTS_UNAVAILABLE', 'El pago con tarjeta aún no está activo. Vuelve a intentarlo pronto.')
  const fromName = clean(input.fromName, GIFT_NAME_MAX)
  if (!fromName) fail(422, 'FROM_REQUIRED', 'Escribe tu nombre: así sabrá quién se lo regala')
  const toName = clean(input.toName, GIFT_NAME_MAX) || null
  const message = clean(input.message, GIFT_MESSAGE_MAX, true) || null
  // Sin enlaces en el mensaje: la página del regalo no puede servir para mandar a nadie a otra web
  if (message && /(https?:\/\/|www\.|\.(com|net|org|io|ly)\b)/i.test(message)) fail(422, 'NO_LINKS', 'El mensaje no puede llevar enlaces')
  // Pagos a medias: como mucho 5 en una hora (cada intento crea una sesión de Stripe)
  if ((await db.gift.count({ where: { buyerId: u.id, status: 'PENDING', createdAt: { gt: new Date(Date.now() - 3600_000) } } })) >= 5) fail(429, 'RATE_LIMITED', 'Has abierto muchos pagos seguidos. Espera un rato y vuelve a probar.')

  const amount = GIFT_PRICE[input.tier][input.months]
  const loc = currentLocale()
  const [name, description] = NAMES[loc](PLAN_NAME[input.tier], input.months)
  const gift = await db.gift.create({
    data: { code: await newCode(), tier: input.tier, days: GIFT_DAYS[input.months], source: 'PURCHASE', status: 'PENDING', buyerId: u.id, buyerEmail: u.email, fromName, toName, message, amount },
  })
  const h = await headers()
  const origin = h.get('origin') ?? `https://${h.get('host')}`
  try {
    const s = await giftCheckout(u, { id: gift.id, amount, name, description }, { origin, locale: loc })
    await db.gift.update({ where: { id: gift.id }, data: { stripeSessionId: s.id } })
    return { url: s.url }
  } catch (e) {
    await db.gift.update({ where: { id: gift.id }, data: { status: 'CANCELED' } }).catch(() => null)
    if (e instanceof HttpError) throw e
    console.error('gift checkout', gift.id, e)
    return fail(503, 'PAYMENTS_UNAVAILABLE', 'No hemos podido abrir el pago. Prueba otra vez en un momento.')
  }
}

/**
 * Pago confirmado por Stripe (vuelta a la app o aviso): el regalo pasa a READY una sola vez (idempotente).
 * Devuelve el regalo, o null si la sesión no corresponde a ningún regalo nuestro.
 */
export async function markGiftPaid(s: Stripe.Checkout.Session): Promise<Gift | null> {
  const id = s.metadata?.giftId
  if (s.metadata?.kind !== GIFT_KIND || !id) return null
  const g = await db.gift.findUnique({ where: { id } })
  if (!g || (g.stripeSessionId && g.stripeSessionId !== s.id) || (g.buyerId && s.client_reference_id && g.buyerId !== s.client_reference_id)) return null
  if (s.payment_status !== 'paid' || g.paidAt) return g
  // El importe cobrado tiene que ser el del regalo (nunca se da un regalo pagado a medias)
  const cents = Math.round(Number(g.amount ?? 0) * 100)
  if (s.amount_total !== cents || (s.currency ?? '').toLowerCase() !== 'eur') {
    console.error('gift: importe distinto', g.id, s.amount_total, cents, s.currency)
    return g
  }
  const now = new Date()
  const until = new Date(now)
  until.setUTCMonth(until.getUTCMonth() + GIFT_REDEEM_MONTHS)
  await db.$transaction(async tx => {
    // Condición en la misma sentencia: si la vuelta a la app y el aviso de Stripe llegan a la vez, solo uno lo marca
    const r = await tx.gift.updateMany({ where: { id: g.id, paidAt: null, status: { in: ['PENDING', 'CANCELED'] } }, data: { status: 'READY', paidAt: now, expiresAt: until, stripeSessionId: s.id, buyerEmail: g.buyerEmail ?? s.customer_details?.email ?? null } })
    if (!r.count || !g.buyerId) return
    await tx.event.create({ data: { userId: g.buyerId, name: 'gift_paid', props: { giftId: g.id, tier: g.tier, days: g.days, amount: Number(g.amount ?? 0) } } })
    const [title, body] = NOTE[await localeOf(g.buyerId)].ready(PLAN_NAME[g.tier === 'PLUS' ? 'PLUS' : 'PREMIUM'], g.toName)
    await notify({ tx, user: { id: g.buyerId } as never }, 'ACHIEVEMENT', title, body, '/regalar')
  })
  return db.gift.findUnique({ where: { id: g.id } })
}

/** Vuelta de la página de pago: se pregunta a Stripe por la sesión (no se fía de la URL) */
export async function confirmGift(sessionId: string) {
  const u = await requireUser()
  if (!stripeEnabled) fail(404, 'NOT_FOUND', 'El pago con tarjeta aún no está activo')
  const s = await checkoutSession(sessionId).catch(() => null)
  if (!s || s.client_reference_id !== u.id || s.metadata?.kind !== GIFT_KIND) fail(404, 'NOT_FOUND', 'No encontramos ese pago')
  if (s!.status === 'expired') return { done: false as const, expired: true }
  if (s!.payment_status !== 'paid') return { done: false as const, expired: false }
  const g = await markGiftPaid(s!)
  if (!g?.paidAt) return { done: false as const, expired: false }
  return { done: true as const, gift: mineView(g) }
}

/** La sesión de pago caducó sin pagar (aviso de Stripe): el regalo pendiente se anula */
export async function giftSessionExpired(s: Stripe.Checkout.Session) {
  if (s.metadata?.kind !== GIFT_KIND || !s.metadata.giftId) return
  await db.gift.updateMany({ where: { id: s.metadata.giftId, stripeSessionId: s.id, status: 'PENDING', paidAt: null }, data: { status: 'CANCELED' } })
}

/**
 * Devolución completa de un regalo (desistimiento en 14 días, aviso charge.refunded): si aún no se ha canjeado, se anula.
 * Un regalo ya canjeado no se devuelve (condiciones de contratación); si se devuelve igualmente desde Stripe, queda en el registro.
 */
export async function giftRefunded(charge: Stripe.Charge) {
  if (!stripe || !charge.refunded || !charge.payment_intent) return
  const sessions = await stripe.checkout.sessions.list({ payment_intent: String(charge.payment_intent), limit: 1 })
  const s = sessions.data[0]
  if (!s || s.metadata?.kind !== GIFT_KIND) return
  const r = await db.gift.updateMany({ where: { stripeSessionId: s.id, status: 'READY' }, data: { status: 'CANCELED' } })
  if (!r.count) console.error('gift: devolución de un regalo que no estaba listo (¿ya canjeado?)', s.id)
}

/**
 * Regalos pendientes de quien mira su lista: si salió de Stripe sin volver a la app y el aviso no ha llegado,
 * se pregunta a Stripe (solo los de las últimas 25 horas, como mucho 3).
 */
async function reconcile(userId: string) {
  if (!stripeEnabled) return
  const pending = await db.gift.findMany({ where: { buyerId: userId, status: 'PENDING', stripeSessionId: { not: null }, createdAt: { gt: new Date(Date.now() - 25 * 3600_000) } }, orderBy: { createdAt: 'desc' }, take: 3 })
  await Promise.all(
    pending.map(async g => {
      const s = await checkoutSession(g.stripeSessionId!).catch(() => null)
      if (s?.status === 'complete') await markGiftPaid(s)
      else if (s?.status === 'expired') await giftSessionExpired(s)
    }),
  )
}

/** «Mis regalos»: los que he comprado y pagado, con su estado */
export async function myGifts() {
  const u = await requireUser()
  await reconcile(u.id).catch(e => console.error('gift reconcile', e))
  const rows = await db.gift.findMany({ where: { buyerId: u.id, source: 'PURCHASE', paidAt: { not: null } }, orderBy: { createdAt: 'desc' }, take: 50 })
  const ids = [...new Set(rows.map(g => g.redeemedById).filter((x): x is string => !!x))]
  const names = new Map((ids.length ? await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : []).map(x => [x.id, firstName(x.name)]))
  return { payments: stripeEnabled, isGuest: !!u.isAnonymous, fromName: u.isAnonymous ? null : firstName(u.name), gifts: rows.map(g => mineView(g, g.redeemedById ? (names.get(g.redeemedById) ?? null) : null)) }
}

// ── Canjear ───────────────────────────────────────────────
/** Página pública del regalo: quién lo regala, el mensaje, qué incluye y si se puede canjear */
export async function publicGift(code: string): Promise<GiftPublicT> {
  const c = cleanGiftCode(code)
  const g = isGiftCode(c) ? await db.gift.findUnique({ where: { code: c } }) : null
  // Un regalo sin pagar (o anulado antes de pagarse) no existe para nadie
  if (!g || (g.source === 'PURCHASE' && !g.paidAt)) fail(404, 'GIFT_NOT_FOUND', 'Este código de regalo no existe. Revisa el enlace.')
  const u = await currentUser().catch(() => null)
  return {
    code: g!.code, tier: g!.tier === 'PLUS' ? 'PLUS' : 'PREMIUM', months: monthsOf(g!.days), days: g!.days, fromName: g!.fromName, toName: g!.toName, message: g!.message,
    status: statusOf(g!) as GiftPublicT['status'], expiresAt: g!.expiresAt?.toISOString() ?? null,
    mine: !!u && g!.buyerId === u.id, redeemedByMe: !!u && g!.redeemedById === u.id,
  }
}

/** Canjear: una sola vez, a la vez seguro (dos personas, o dos pestañas, con el mismo código) */
export async function redeemGift(code: string): Promise<GiftRedeemT> {
  const u = await requireUser()
  if (u.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu cuenta con email y contraseña para canjear el regalo')
  if (u.onboardingStep !== null) fail(403, 'ONBOARDING_REQUIRED', 'Termina la bienvenida para canjear el regalo')
  const c = cleanGiftCode(code)
  if (!isGiftCode(c)) fail(404, 'GIFT_NOT_FOUND', 'Este código de regalo no existe. Revisa el enlace.')
  // withCtx bloquea al usuario: dos regalos canjeados a la vez por la misma persona se suman bien
  return withCtx(async ctx => {
    const g = await ctx.tx.gift.findUnique({ where: { code: c } })
    if (!g || (g.source === 'PURCHASE' && !g.paidAt)) return fail(404, 'GIFT_NOT_FOUND', 'Este código de regalo no existe. Revisa el enlace.')
    if (g.status === 'REDEEMED') return fail(409, g.redeemedById === u.id ? 'GIFT_ALREADY_YOURS' : 'GIFT_REDEEMED', g.redeemedById === u.id ? 'Ya canjeaste este regalo' : 'Este regalo ya se ha canjeado')
    if (g.status === 'CANCELED') return fail(410, 'GIFT_CANCELED', 'Este regalo se anuló y ya no se puede canjear')
    if (g.status !== 'READY') return fail(404, 'GIFT_NOT_FOUND', 'Este código de regalo no existe. Revisa el enlace.')
    if (g.buyerId === u.id) return fail(403, 'OWN_GIFT', 'Este regalo lo has comprado tú: compártelo con la persona a la que quieras regalárselo')
    if (g.expiresAt && g.expiresAt.getTime() <= Date.now()) return fail(410, 'GIFT_EXPIRED', 'Este regalo ha caducado: se podía canjear durante 12 meses desde la compra')
    // Marcar primero, con la condición en la misma sentencia: si dos lo canjean a la vez, solo uno lo consigue
    const claimed = await ctx.tx.gift.updateMany({ where: { id: g.id, status: 'READY' }, data: { status: 'REDEEMED', redeemedById: u.id, redeemedAt: new Date() } })
    if (!claimed.count) return fail(409, 'GIFT_REDEEMED', 'Este regalo ya se ha canjeado')
    const tier = g.tier === 'PLUS' ? 'PLUS' : 'PREMIUM'
    const r = await grantPlan(ctx.tx, u.id, tier, g.days, `gift-${g.id}`)
    await ctx.tx.event.create({ data: { userId: u.id, name: 'gift_redeemed', props: { giftId: g.id, tier, days: g.days, mode: r.mode } } })
    const plan = PLAN_NAME[tier]
    const mine = NOTE[langOf(u.locale)]
    const [title, body] = mine.redeemed(plan, mine.span(monthsOf(g.days)), g.fromName, g.days, r.mode === 'DELAYED_CHARGE')
    await notify(ctx, 'ACHIEVEMENT', title, body, r.mode === 'DELAYED_CHARGE' ? '/ajustes' : '/clases')
    if (g.buyerId) {
      const theirs = NOTE[await localeOf(g.buyerId)]
      const [bt, bb] = theirs.toBuyer(firstName(u.name) || g.toName, plan, theirs.span(monthsOf(g.days)))
      await notify({ tx: ctx.tx, user: { id: g.buyerId } as never }, 'ACHIEVEMENT', bt, bb, '/regalar')
    }
    return { tier, days: g.days, months: monthsOf(g.days), mode: r.mode, plan: r.plan === 'PLUS' ? 'PLUS' : r.plan === 'PREMIUM' ? 'PREMIUM' : 'FREE', until: r.until?.toISOString() ?? null, fromName: g.fromName }
  })
}
