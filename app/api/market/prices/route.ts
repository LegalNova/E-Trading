import { NextResponse } from 'next/server'
import { getMainPrices } from '@/lib/finnhub'

export const revalidate = 10

export async function GET() {
  try {
    const prices = await getMainPrices()
    const source = process.env.FINNHUB_API_KEY ? 'finnhub' : 'simulated'
    return NextResponse.json({ prices, source, timestamp: Date.now() })
  } catch (error) {
    console.error('Market prices error:', error)
    return NextResponse.json({ error: 'Error fetching prices' }, { status: 500 })
  }
}
