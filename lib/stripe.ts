import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key || key.startsWith('sk_test_placeholder')) {
      // Return a proxy that throws helpful errors at runtime only
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  }
  return _stripe
}

export const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  elite: process.env.STRIPE_ELITE_PRICE_ID,
}

export const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter — 1€/mes',
  pro: 'Pro — 9€/mes',
  elite: 'Elite — 16€/mes',
}
