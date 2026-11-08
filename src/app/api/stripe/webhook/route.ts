// Avisos de Stripe (pagos, pruebas, cancelaciones). Firmados con STRIPE_WEBHOOK_SECRET: sin firma válida no se hace nada.
import type Stripe from 'stripe'
import { db } from '@/server/db'
import { GIFT_META, stripe, syncSubscription } from '@/server/billing/stripe'
import { notify } from '@/server/game/core'

/** Stripe puede reenviar el mismo aviso: cada uno se apunta una sola vez */
async function once(userId: string, name: string, key: string, props: Record<string, unknown>) {
  if (await db.event.count({ where: { userId, name, props: { path: ['key'], equals: key } } })) return false
  await db.event.create({ data: { userId, name, props: { ...props, key } as object } })
  return true
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return Response.json({ error: 'Stripe no está configurado' }, { status: 503 })
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get('stripe-signature') ?? '', secret)
  } catch {
    return Response.json({ error: 'Firma no válida' }, { status: 400 })
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object
        if (s.subscription) await syncSubscription(await stripe.subscriptions.retrieve(String(s.subscription)))
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const r = await syncSubscription(sub)
        const prev = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined
        if (r && event.type === 'customer.subscription.created' && sub.status === 'trialing') await once(r.userId, 'trial_start', sub.id, { plan: sub.metadata?.plan ?? null, stripe: true })
        // (una baja por suscripción: pedirla y que después termine cuentan como una sola)
        if (r && prev && 'cancel_at_period_end' in prev && sub.cancel_at_period_end) await once(r.userId, 'cancel', sub.id, { stripe: true })
        break
      }
      case 'customer.subscription.deleted': {
        const r = await syncSubscription(event.data.object)
        if (r) await once(r.userId, 'cancel', event.data.object.id, { stripe: true, ended: true })
        break
      }
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object
        const r = await syncSubscription(sub)
        const plan = r?.tier === 'PLUS' ? 'Plus' : 'Max'
        // Días regalados por invitar a quien ya pagaba (no es una prueba): se le avisa de que vuelve a cobrarse
        const gift = !!sub.metadata?.[GIFT_META]
        if (r && (await once(r.userId, gift ? 'gift_will_end' : 'trial_will_end', `${sub.id}-${sub.trial_end}`, {})))
          await notify(
            { tx: db, user: { id: r.userId } as never },
            'NEW_LESSON',
            gift ? 'Tus días regalados terminan pronto' : `Tu prueba de ${plan} termina pronto`,
            gift ? `En 3 días vuelve a cobrarse tu suscripción de ${plan}. Puedes gestionarla en Ajustes.` : 'En 3 días empieza tu suscripción. Si no quieres continuar, cancélala en Ajustes sin coste.',
            '/ajustes',
          )
        break
      }
      case 'invoice.payment_failed': {
        // Cobro rechazado (tarjeta caducada, sin saldo…): Stripe lo reintenta; se avisa una vez por factura
        const inv = event.data.object
        const sub = await db.subscription.findFirst({ where: { stripeCustomerId: String(inv.customer) }, select: { userId: true, user: { select: { plan: true } } } })
        const plan = sub?.user.plan === 'PLUS' ? 'Plus' : 'Max'
        if (sub && inv.id && (await once(sub.userId, 'payment_failed', inv.id, { amount: inv.amount_due / 100, currency: inv.currency })))
          await notify({ tx: db, user: { id: sub.userId } as never }, 'NEW_LESSON', 'No hemos podido cobrar tu suscripción', `No hemos podido cobrar tu suscripción. Revisa tu tarjeta en Ajustes › Gestionar suscripción para no perder ${plan}.`, '/ajustes')
        break
      }
      case 'invoice.paid': {
        const inv = event.data.object
        if (inv.amount_paid > 0) {
          const sub = await db.subscription.findFirst({ where: { stripeCustomerId: String(inv.customer) }, select: { userId: true } })
          // Recibo dentro de la app (una vez por factura)
          if (sub && (await once(sub.userId, 'paid', inv.id!, { amount: inv.amount_paid / 100, currency: inv.currency })))
            await notify({ tx: db, user: { id: sub.userId } as never }, 'ACHIEVEMENT', 'Pago recibido', `Hemos cobrado ${(inv.amount_paid / 100).toFixed(2).replace('.', ',')} € de tu suscripción. Gracias por apoyar Lumi.`, '/ajustes')
        }
        break
      }
    }
  } catch (e) {
    console.error('stripe webhook', event.type, e)
    return Response.json({ error: 'Error al procesar' }, { status: 500 })
  }
  return Response.json({ received: true })
}
