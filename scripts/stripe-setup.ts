// Deja Stripe listo para Lumi (se puede repetir sin duplicar nada):
//  · productos «Lumi Plus» y «Lumi Max» con sus precios mensual y anual (IVA incluido) y «lookup keys»
//  · portal del cliente: cambiar tarjeta, ver facturas, cambiar de plan y cancelar al final del periodo
//  · aviso (webhook) a https://<app>/api/stripe/webhook; su secreto se guarda en .env.local (no se muestra)
// Uso: npx tsx scripts/stripe-setup.ts            (lee STRIPE_SECRET_KEY de .env.local)
//      APP_URL=https://… npx tsx scripts/stripe-setup.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { config } from 'dotenv'
import Stripe from 'stripe'

config({ path: '.env.local', quiet: true })
const key = process.env.STRIPE_SECRET_KEY ?? ''
if (!/^(sk|rk)_test_/.test(key) && process.argv[2] !== '--live') throw new Error('Pon una clave de PRUEBA (sk_test_…) en STRIPE_SECRET_KEY de .env.local. Para la real, añade --live a propósito.')
const APP = (process.env.APP_URL ?? 'https://e-trading-app.vercel.app').replace(/\/$/, '')
const stripe = new Stripe(key)

const PRODUCTS = [
  { tier: 'PLUS', name: 'Lumi Plus', description: 'Unidades 1 a 5 completas, vidas ilimitadas, 50.000 € virtuales y 30 preguntas al día a Lumi.' },
  { tier: 'PREMIUM', name: 'Lumi Max', description: 'Todo el curso, vidas ilimitadas, órdenes avanzadas desde el primer día y todos los modos de Lumi.' },
] as const
const PRICES = [
  { lookup: 'lumi_plus_month', tier: 'PLUS', cents: 399, interval: 'month' },
  { lookup: 'lumi_plus_year', tier: 'PLUS', cents: 2999, interval: 'year' },
  { lookup: 'lumi_max_month', tier: 'PREMIUM', cents: 799, interval: 'month' },
  { lookup: 'lumi_max_year', tier: 'PREMIUM', cents: 5999, interval: 'year' },
] as const
const EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.trial_will_end', 'invoice.paid']

async function main() {
  const mode = key.startsWith('sk_live') || key.startsWith('rk_live') ? 'REAL' : 'PRUEBA'
  console.log(`Stripe en modo ${mode} · app ${APP}`)

  // 1) Productos
  const products: Record<string, string> = {}
  for (const p of PRODUCTS) {
    const found = (await stripe.products.search({ query: `metadata['lumi_tier']:'${p.tier}'` })).data[0]
    const prod = found ?? (await stripe.products.create({ name: p.name, description: p.description, metadata: { lumi_tier: p.tier }, tax_code: 'txcd_10000000' }))
    products[p.tier] = prod.id
    console.log(`${found ? '·' : '+'} producto ${p.name}`)
  }

  // 2) Precios (con IVA incluido; se buscan por lookup key)
  const priceIds: string[] = []
  for (const pr of PRICES) {
    const found = (await stripe.prices.list({ lookup_keys: [pr.lookup], active: true, limit: 1 })).data[0]
    const ok = found && found.unit_amount === pr.cents && found.recurring?.interval === pr.interval && found.product === products[pr.tier]
    const price = ok ? found : await stripe.prices.create({ product: products[pr.tier], currency: 'eur', unit_amount: pr.cents, recurring: { interval: pr.interval }, lookup_key: pr.lookup, transfer_lookup_key: true, tax_behavior: 'inclusive', metadata: { lumi_tier: pr.tier } })
    priceIds.push(price.id)
    console.log(`${ok ? '·' : '+'} precio ${pr.lookup} · ${(pr.cents / 100).toFixed(2)} € / ${pr.interval === 'month' ? 'mes' : 'año'}`)
  }

  // 3) Portal del cliente
  const portal = {
    business_profile: { headline: 'Lumi · gestiona tu suscripción', privacy_policy_url: `${APP}/es/legal/privacidad`, terms_of_service_url: `${APP}/es/legal/contratacion` },
    features: {
      customer_update: { enabled: true, allowed_updates: ['email' as const, 'address' as const] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end' as const, cancellation_reason: { enabled: true, options: ['too_expensive' as const, 'missing_features' as const, 'unused' as const, 'other' as const] } },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price' as const],
        proration_behavior: 'create_prorations' as const,
        products: PRODUCTS.map(p => ({ product: products[p.tier], prices: PRICES.filter(x => x.tier === p.tier).map(x => priceIds[PRICES.indexOf(x)]) })),
      },
    },
    default_return_url: `${APP}/es/ajustes`,
  }
  const existing = (await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 })).data[0]
  if (existing) await stripe.billingPortal.configurations.update(existing.id, portal)
  else await stripe.billingPortal.configurations.create(portal)
  console.log(`${existing ? '·' : '+'} portal del cliente`)

  // 4) Webhook
  const url = `${APP}/api/stripe/webhook`
  const hooks = (await stripe.webhookEndpoints.list({ limit: 100 })).data.filter(h => h.url === url)
  let secret: string | undefined
  if (hooks.length) {
    await stripe.webhookEndpoints.update(hooks[0].id, { enabled_events: EVENTS })
    console.log('· aviso (webhook) ya existía: su secreto no se puede volver a leer; si hace falta, bórralo en Stripe y repite')
  } else {
    const h = await stripe.webhookEndpoints.create({ url, enabled_events: EVENTS, description: 'Lumi: pagos y suscripciones' })
    secret = h.secret
    console.log('+ aviso (webhook) creado')
  }

  if (secret) {
    const env = readFileSync('.env.local', 'utf8')
    const line = `STRIPE_WEBHOOK_SECRET=${secret}`
    writeFileSync('.env.local', /^STRIPE_WEBHOOK_SECRET=.*$/m.test(env) ? env.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, line) : `${env.trimEnd()}\n${line}\n`)
    console.log('  secreto del aviso guardado en .env.local (no se muestra)')
  }
  console.log('Listo.')
}
main().catch(e => {
  console.error('Error:', e instanceof Error ? e.message : e)
  process.exit(1)
})
