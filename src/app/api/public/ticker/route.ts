import { listAssets } from '@/server/market/service'
import { publicJson } from '@/server/http/respond'

// GET /api/public/ticker → cinta de la landing (desde la caché de precios)
export async function GET() {
  const items = await listAssets(['AAPL', 'BTC', 'IBEX', 'EURUSD', 'NVDA', 'ETH', 'SPX', 'SAN'])
  return publicJson(items.map(a => ({ symbol: a.symbol, name: a.name, changePct: a.changePct, stale: a.stale })), 30)
}
