import 'server-only'
// Tienda de gemas en euros (auditoría PRO-3 a PRO-9). Pago único con Stripe, igual que «Regalar».
//  · Apagada salvo que GEM_STORE=on (decisión de Joan tras la revisión del abogado) y con Stripe configurado.
//  · Solo adultos: hace falta fecha de nacimiento y 18 años cumplidos.
//  · Cobros reales bloqueados mientras falten los datos del titular (assertCanCharge, auditoría P0-1).
//  · Las gemas se abonan una sola vez por pago: se apunta el id de la sesión en los contadores (sin tablas nuevas).
import type Stripe from 'stripe'
import { GEM_PACKS, GEM_STORE_MIN_AGE, type GemPackId } from '@/shared/gem-shop'
import { db } from '../db'
import { assertCanCharge, checkoutSession, stripe, stripeEnabled } from '../billing/stripe'
import { fail, requireUser } from './core'

export const GEM_KIND = 'gems'
export const gemStoreOn = () => process.env.GEM_STORE === 'on' && stripeEnabled

/** Edad cumplida hoy */
function ageOf(birth: Date | null) {
  if (!birth) return null
  const now = new Date()
  let a = now.getUTCFullYear() - birth.getUTCFullYear()
  if (now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) a--
  return a
}

/** Lo que ve la app: si la tienda está abierta para esta persona y, si no, por qué */
export async function gemStore() {
  const u = await requireUser()
  const age = ageOf(u.birthDate)
  const reason = !gemStoreOn() ? 'OFF' : age === null ? 'NO_AGE' : age < GEM_STORE_MIN_AGE ? 'MINOR' : null
  return { open: reason === null, reason, packs: GEM_PACKS.map(p => ({ ...p })) }
}

/** Abre el pago de un pack */
export async function gemCheckout(packId: GemPackId, opts: { origin: string; locale: string }) {
  const u = await requireUser()
  const st = await gemStore()
  if (!st.open) fail(403, 'FEATURE_LOCKED', 'La tienda de gemas no está disponible')
  const pack = GEM_PACKS.find(p => p.id === packId) ?? fail(404, 'NOT_FOUND', 'Pack no encontrado')
  assertCanCharge()
  const meta = { kind: GEM_KIND, packId: pack.id, gems: String(pack.gems), userId: u.id }
  const session = await stripe!.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: u.id,
    customer_email: u.email ?? undefined,
    line_items: [{ quantity: 1, price_data: { currency: 'eur', unit_amount: Math.round(pack.eur * 100), product_data: { name: `${pack.gems} gemas · E-Trading`, description: 'Moneda virtual para usar dentro de la app. Sin valor fuera de ella.' } } }],
    metadata: meta,
    payment_intent_data: { metadata: meta, description: `${pack.gems} gemas` },
    locale: opts.locale === 'ca' ? 'auto' : (opts.locale as 'es' | 'en'),
    success_url: `${opts.origin}/${opts.locale}/perfil/tienda?pago=ok&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/${opts.locale}/perfil/tienda?pago=no`,
  })
  return { url: session.url! }
}

/** Abona las gemas de un pago confirmado (una sola vez por sesión). Lo llaman el aviso de Stripe y la vuelta a la app. */
export async function creditGems(s: Stripe.Checkout.Session) {
  if (s.metadata?.kind !== GEM_KIND || s.payment_status !== 'paid') return false
  const userId = s.metadata.userId || s.client_reference_id
  const gems = Number(s.metadata.gems)
  if (!userId || !Number.isInteger(gems) || gems <= 0) return false
  return db.$transaction(async tx => {
    const g = await tx.gameState.findUnique({ where: { userId } })
    if (!g) return false
    const k = (g.counters ?? {}) as { gemOrders?: string[] }
    const done = k.gemOrders ?? []
    if (done.includes(s.id)) return false
    await tx.gameState.update({ where: { userId }, data: { gems: { increment: gems }, counters: { ...k, gemOrders: [...done, s.id].slice(-50) } } })
    await tx.event.create({ data: { userId, name: 'gems_bought', props: { packId: s.metadata!.packId, gems, amount: (s.amount_total ?? 0) / 100 } } })
    return true
  })
}

/** Vuelta de la página de pago: se pregunta a Stripe (no se fía de la URL) */
export async function confirmGems(sessionId: string) {
  const u = await requireUser()
  if (!stripeEnabled) fail(404, 'NOT_FOUND', 'El pago con tarjeta aún no está activo')
  const s = await checkoutSession(sessionId).catch(() => null)
  if (!s || s.client_reference_id !== u.id || s.metadata?.kind !== GEM_KIND) fail(404, 'NOT_FOUND', 'No encontramos ese pago')
  if (s!.payment_status !== 'paid') return { done: false }
  await creditGems(s!)
  return { done: true, gems: Number(s!.metadata!.gems) }
}
