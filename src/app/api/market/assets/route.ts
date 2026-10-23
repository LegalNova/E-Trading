import type { NextRequest } from 'next/server'
import { CATALOG } from '@/server/market/catalog'
import { listAssets } from '@/server/market/service'
import { fail, publicJson } from '@/server/http/respond'

// GET /api/market/assets?symbols=AAPL,BTC&type=STOCK&q=app
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const type = p.get('type')
  const q = p.get('q')?.trim().toLowerCase()
  let symbols = p.get('symbols')?.split(',').filter(Boolean)
  if (type) symbols = CATALOG.filter(a => a.type === type).map(a => a.symbol)
  if (q) symbols = CATALOG.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)).map(a => a.symbol)
  try {
    return publicJson(await listAssets(symbols), 10)
  } catch (e) {
    console.error('market/assets', e)
    return fail(503, 'MARKET_UNAVAILABLE', 'Precios no disponibles')
  }
}
