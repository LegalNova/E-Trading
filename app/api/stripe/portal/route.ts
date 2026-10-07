import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getStripe } from '@/lib/stripe'
import { sql } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    let stripe
    try {
      stripe = getStripe()
    } catch {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })
    }

    const rows = await sql()`SELECT stripe_customer_id FROM users WHERE id = ${session.user.id} LIMIT 1`
    const user = rows[0] as { stripe_customer_id: string | null } | undefined

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: 'No tienes suscripción activa' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${appUrl}/precios`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[stripe/portal]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
