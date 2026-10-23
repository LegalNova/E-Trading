import { candles } from '@/server/market/service'
import { publicJson } from '@/server/http/respond'

const RANGES = ['1D', '1W', '1M', '3M', '1Y']

// GET /api/market/assets/:symbol/candles?range=1M → velas reales del proveedor (nunca inventadas)
export async function GET(req: Request, ctx: RouteContext<'/api/market/assets/[symbol]/candles'>) {
  const { symbol } = await ctx.params
  const r = new URL(req.url).searchParams.get('range') ?? '1M'
  const range = RANGES.includes(r) ? r : '1M'
  return publicJson(await candles(symbol.toUpperCase(), range), range === '1D' ? 60 : 300)
}
