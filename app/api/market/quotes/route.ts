import { NextRequest, NextResponse } from 'next/server'
import { getPricesForSymbols, getMainPrices } from '@/lib/finnhub'

// GET /api/market/quotes?symbols=AAPL,MSFT,BTC
// GET /api/market/quotes  → returns all 21 main assets
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get('symbols')

  try {
    let quotes

    if (symbolsParam) {
      const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())
      quotes = await getPricesForSymbols(symbols)
    } else {
      // Default: return all 21 main assets
      quotes = await getMainPrices()
    }

    const hasRealData = !!process.env.FINNHUB_API_KEY
    const source = hasRealData ? 'finnhub' : 'simulated'

    return NextResponse.json(
      { quotes, source, timestamp: Date.now() },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Quotes error:', error)
    return NextResponse.json({ error: 'Error fetching quotes' }, { status: 500 })
  }
}
