import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getStripe, PLAN_PRICE_IDS } from '@/lib/stripe'
import { getSupabase } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { plan } = await req.json()
    const priceId = PLAN_PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }

    let stripe
    try {
      stripe = getStripe()
    } catch {
      return NextResponse.json({ error: 'Stripe no configurado. Añade STRIPE_SECRET_KEY al .env.local' }, { status: 503 })
    }

    // Get or create Stripe customer
    const supabase = getSupabase()
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id, email, name')
      .eq('id', session.user.id)
      .single()

    let customerId = user?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email ?? session.user.email ?? '',
        name: user?.name ?? session.user.name ?? '',
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', session.user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/precios/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/precios/cancel`,
      metadata: { userId: session.user.id, plan },
      subscription_data: {
        metadata: { userId: session.user.id, plan },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
