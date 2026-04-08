import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  let stripe
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      if (userId && plan) {
        await supabase
          .from('users')
          .update({ plan, trial_ends_at: null })
          .eq('id', userId)
        console.log(`[stripe/webhook] Updated user ${userId} to plan ${plan}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      const status = sub.status
      if (userId && status === 'active') {
        const plan = sub.metadata?.plan
        if (plan) {
          await supabase.from('users').update({ plan }).eq('id', userId)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (userId) {
        await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
        console.log(`[stripe/webhook] Downgraded user ${userId} to free`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string
      if (customerId) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (user) {
          // Keep plan for now — Stripe will retry. Downgrade after 3 failures.
          console.log(`[stripe/webhook] Payment failed for customer ${customerId}`)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
