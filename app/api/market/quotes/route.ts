import { NextRequest, NextResponse } from 'next/server'
import { getPricesForSymbols, getAllQuotes, hasRealData } from '@/lib/finnhub'
import { getPriced } from '@/lib/market'

export const dynamic = 'force-dynamic'

// GET /api/market/quotes?symbols=AAPL,MSFT,BTC  → esos símbolos
// GET /api/market/quotes                        → todo el catálogo
// Incluye `fx` (euros por unidad de cada moneda) para convertir a €.
export async function GET(req: NextRequest) {
  const symbolsParam = new URL(req.url).searchParams.get('symbols')

  try {
    const quotes = symbolsParam
      ? await getPricesForSymbols(symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean))
      : await getAllQuotes()
    const { fx } = await getPriced([])

    return NextResponse.json(
      {
        quotes: quotes.map(q => ({ ...q, simulated: q.simulated ?? !hasRealData(q.symbol) })),
        fx,
        source: process.env.FINNHUB_API_KEY ? 'finnhub' : 'simulated',
        timestamp: Date.now(),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('Quotes error:', error)
    return NextResponse.json({ error: 'Error fetching quotes' }, { status: 500 })
  }
}
