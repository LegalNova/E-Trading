// Deja Stripe listo para E-Trading (se puede repetir sin duplicar nada):
//  · productos «E-Trading Plus» y «E-Trading Max» con sus precios mensual y anual (IVA incluido), normales y de estudiante
//  · productos de grupo («E-Trading Grupo 4 · Plus»…) con sus precios por grupo, normales y de estudiante
//  · los precios antiguos (lumi_plus_month…) se quedan tal cual: quien ya paga con ellos sigue igual
//  · portal del cliente: cambiar tarjeta, ver facturas, cambiar de plan y cancelar al final del periodo
//    (uno para el precio normal y otro para quien tiene precio de estudiante; el de por defecto no se toca)
//  · aviso (webhook): si ya existe, solo se le añaden los eventos que le falten. Solo se crea con --create-webhook
//    (su secreto se guarda en .env.local, sin mostrarlo)
// Los importes salen de src/shared/plans.ts (los mismos que enseña la app).
// Uso: npx tsx scripts/stripe-setup.ts            (lee STRIPE_SECRET_KEY de .env.local)
//      APP_URL=https://… npx tsx scripts/stripe-setup.ts [--create-webhook]
import { readFileSync, writeFileSync } from 'node:fs'
import { config } from 'dotenv'
import Stripe from 'stripe'
import { GROUP_PRICES, GROUP_SIZES, groupLookupKey, lookupKey, PRICES, type BillingInterval, type GroupSize, type PaidTier } from '../src/shared/plans'

config({ path: '.env.local', quiet: true })
const key = process.env.STRIPE_SECRET_KEY ?? ''
if (!/^(sk|rk)_test_/.test(key) && !process.argv.includes('--live')) throw new Error('Pon una clave de PRUEBA (sk_test_…) en STRIPE_SECRET_KEY de .env.local. Para la real, añade --live a propósito.')
const APP = (process.env.APP_URL ?? 'https://e-trading-app.vercel.app').replace(/\/$/, '')
const stripe = new Stripe(key)

const TIERS: PaidTier[] = ['PLUS', 'PREMIUM']
const INTERVALS: BillingInterval[] = ['MONTH', 'YEAR']
const tierName = (t: PaidTier) => (t === 'PLUS' ? 'Plus' : 'Max')
const sizeName = (s: GroupSize) => (s === 0 ? 'sin límite' : String(s))
const sizeKey = (s: GroupSize) => (s === 0 ? 'gu' : `g${s}`)

const PRODUCTS = [
  { tier: 'PLUS', name: 'E-Trading Plus', description: 'Unidades 1 a 5 completas, vidas ilimitadas, 50.000 € virtuales y 30 preguntas al día a Lumi.' },
  { tier: 'PREMIUM', name: 'E-Trading Max', description: 'Todo el curso, vidas ilimitadas, órdenes avanzadas desde el primer día y todos los modos de Lumi.' },
] as const
const GROUP_PRODUCTS = GROUP_SIZES.flatMap(size =>
  TIERS.map(tier => ({
    group: `${sizeKey(size)}_${tier === 'PLUS' ? 'plus' : 'max'}`,
    size,
    tier,
    name: `E-Trading Grupo ${sizeName(size)} · ${tierName(tier)}`,
    description: `${tierName(tier)} para ${size === 0 ? 'un grupo sin límite de personas (uso razonable: clases, academias, empresas)' : `un grupo de hasta ${size} personas`}. Quien paga ocupa una plaza.`,
  })),
)

type PriceSpec = { lookup: string; product: string; cents: number; interval: 'month' | 'year'; metadata: Record<string, string> }
// Precios antiguos de «Lumi» (los importes de estudiante): se conservan para quien ya paga con ellos
const LEGACY = ['lumi_plus_month', 'lumi_plus_year', 'lumi_max_month', 'lumi_max_year']
const EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.trial_will_end', 'invoice.paid', 'invoice.payment_failed', 'checkout.session.expired', 'checkout.session.async_payment_succeeded', 'charge.refunded']
const cents = (eur: number) => Math.round(eur * 100)

async function allProducts() {
  const out: Stripe.Product[] = []
  for await (const p of stripe.products.list({ limit: 100 })) out.push(p)
  return out
}

async function main() {
  const mode = key.startsWith('sk_live') || key.startsWith('rk_live') ? 'REAL' : 'PRUEBA'
  console.log(`Stripe en modo ${mode} · app ${APP}`)
  const existing = await allProducts()

  // 1) Productos (se buscan por su metadata; se renombran si hace falta)
  const products: Record<string, string> = {}
  const ensureProduct = async (id: string, find: (p: Stripe.Product) => boolean, spec: { name: string; description: string; metadata: Record<string, string> }) => {
    const found = existing.find(find)
    if (!found) {
      const p = await stripe.products.create({ name: spec.name, description: spec.description, metadata: spec.metadata, tax_code: 'txcd_10000000' })
      console.log(`+ producto ${spec.name}`)
      products[id] = p.id
      return
    }
    if (found.name !== spec.name || found.description !== spec.description || !found.active) {
      await stripe.products.update(found.id, { name: spec.name, description: spec.description, active: true })
      console.log(`~ producto ${found.name} → ${spec.name}`)
    } else console.log(`· producto ${spec.name}`)
    products[id] = found.id
  }
  for (const p of PRODUCTS) await ensureProduct(p.tier, x => x.metadata?.lumi_tier === p.tier && !x.metadata?.lumi_group, { name: p.name, description: p.description, metadata: { lumi_tier: p.tier } })
  for (const g of GROUP_PRODUCTS) await ensureProduct(g.group, x => x.metadata?.lumi_group === g.group, { name: g.name, description: g.description, metadata: { lumi_group: g.group } })

  // 2) Precios (IVA incluido; se buscan por lookup key)
  const specs: PriceSpec[] = []
  for (const tier of TIERS)
    for (const iv of INTERVALS)
      for (const student of [false, true])
        specs.push({ lookup: lookupKey(tier, iv, student), product: products[tier], cents: cents(PRICES[student ? 'student' : 'normal'][tier][iv]), interval: iv === 'MONTH' ? 'month' : 'year', metadata: { lumi_tier: tier, lumi_student: student ? '1' : '0' } })
  for (const g of GROUP_PRODUCTS)
    for (const iv of INTERVALS)
      for (const student of [false, true])
        specs.push({
          lookup: groupLookupKey(g.size, g.tier, iv, student),
          product: products[g.group],
          cents: cents(GROUP_PRICES[String(g.size) as '4' | '8' | '0'][g.tier][iv][student ? 'student' : 'normal']),
          interval: iv === 'MONTH' ? 'month' : 'year',
          metadata: { lumi_group: sizeKey(g.size), lumi_group_size: String(g.size), lumi_group_tier: g.tier, lumi_student: student ? '1' : '0' },
        })
  const priceIds: Record<string, string> = {}
  for (const pr of specs) {
    const found = (await stripe.prices.list({ lookup_keys: [pr.lookup], active: true, limit: 1 })).data[0]
    const ok = found && found.unit_amount === pr.cents && found.recurring?.interval === pr.interval && found.product === pr.product
    // Si el importe cambia, se crea un precio nuevo y se le pasa la lookup key (el viejo sigue para quien ya paga con él)
    const price = ok ? found : await stripe.prices.create({ product: pr.product, currency: 'eur', unit_amount: pr.cents, recurring: { interval: pr.interval }, lookup_key: pr.lookup, transfer_lookup_key: true, tax_behavior: 'inclusive', metadata: pr.metadata })
    priceIds[pr.lookup] = price.id
    console.log(`${ok ? '·' : '+'} precio ${pr.lookup} · ${(pr.cents / 100).toFixed(2)} € / ${pr.interval === 'month' ? 'mes' : 'año'}`)
  }
  for (const l of LEGACY) {
    const found = (await stripe.prices.list({ lookup_keys: [l], active: true, limit: 1 })).data[0]
    console.log(found ? `· precio antiguo ${l} · ${((found.unit_amount ?? 0) / 100).toFixed(2)} € (se conserva para quien ya paga)` : `- precio antiguo ${l}: no está (nada que conservar)`)
  }

  // 3) Portal del cliente: uno con los precios normales y otro con los de estudiante.
  //    Los grupos no se pueden cambiar de plan en el portal (solo cancelar, tarjeta y facturas).
  const portal = (student: boolean) => ({
    business_profile: { headline: 'E-Trading · gestiona tu suscripción', privacy_policy_url: `${APP}/es/legal/privacidad`, terms_of_service_url: `${APP}/es/legal/contratacion` },
    features: {
      customer_update: { enabled: true, allowed_updates: ['email' as const, 'address' as const] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end' as const, cancellation_reason: { enabled: true, options: ['too_expensive' as const, 'missing_features' as const, 'unused' as const, 'other' as const] } },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price' as const],
        proration_behavior: 'create_prorations' as const,
        products: TIERS.map(tier => ({ product: products[tier], prices: INTERVALS.map(iv => priceIds[lookupKey(tier, iv, student)]) })),
      },
    },
    default_return_url: `${APP}/es/ajustes`,
    metadata: { lumi_portal: student ? 'student' : 'normal' },
  })
  // (la app las pide por su metadata; el portal por defecto, que usa la versión anterior de la app, no se toca)
  const configs = (await stripe.billingPortal.configurations.list({ limit: 100 })).data
  for (const student of [false, true]) {
    const tag = student ? 'student' : 'normal'
    const found = configs.find(c => c.metadata?.lumi_portal === tag && c.active)
    if (found) await stripe.billingPortal.configurations.update(found.id, portal(student))
    else await stripe.billingPortal.configurations.create(portal(student))
    console.log(`${found ? '·' : '+'} portal del cliente (${student ? 'precio de estudiante' : 'precio normal'})`)
  }

  // 4) Webhook: el que ya existe no se toca salvo para añadir eventos que falten
  const url = `${APP}/api/stripe/webhook`
  const hooks = (await stripe.webhookEndpoints.list({ limit: 100 })).data.filter(h => h.url === url)
  let secret: string | undefined
  if (hooks.length) {
    const h = hooks[0]
    const have = new Set(h.enabled_events)
    const missing = have.has('*') ? [] : EVENTS.filter(e => !have.has(e))
    if (missing.length) {
      await stripe.webhookEndpoints.update(h.id, { enabled_events: [...h.enabled_events, ...missing] as Stripe.WebhookEndpointUpdateParams.EnabledEvent[] })
      console.log(`~ aviso (webhook): añadidos ${missing.join(', ')}`)
    } else console.log('· aviso (webhook) ya tiene todos los eventos')
  } else if (process.argv.includes('--create-webhook')) {
    const h = await stripe.webhookEndpoints.create({ url, enabled_events: EVENTS, description: 'E-Trading: pagos y suscripciones' })
    secret = h.secret
    console.log('+ aviso (webhook) creado')
  } else console.log(`! no hay aviso (webhook) para ${url}: no se crea (añade --create-webhook si de verdad hace falta)`)

  if (secret) {
    // Con la clave real, el secreto va a otro archivo (STRIPE_ENV_FILE) para no pisar el de prueba de .env.local
    const file = process.env.STRIPE_ENV_FILE ?? '.env.local'
    const env = (() => { try { return readFileSync(file, 'utf8') } catch { return '' } })()
    const line = `STRIPE_WEBHOOK_SECRET=${secret}`
    writeFileSync(file, /^STRIPE_WEBHOOK_SECRET=.*$/m.test(env) ? env.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, line) : `${env.trimEnd()}\n${line}\n`, { mode: 0o600 })
    console.log(`  secreto del aviso guardado en ${file} (no se muestra)`)
  }
  console.log('Listo.')
}
main().catch(e => {
  console.error('Error:', e instanceof Error ? e.message : e)
  process.exit(1)
})
