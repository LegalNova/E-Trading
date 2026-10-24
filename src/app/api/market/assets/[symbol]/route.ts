import { assetDetail } from '@/server/market/service'
import { fail, publicJson } from '@/server/http/respond'

// GET /api/market/assets/:symbol?currency=EUR
export async function GET(req: Request, ctx: RouteContext<'/api/market/assets/[symbol]'>) {
  const { symbol } = await ctx.params
  const currency = new URL(req.url).searchParams.get('currency') === 'USD' ? 'USD' : 'EUR'
  const a = await assetDetail(decodeURIComponent(symbol), currency)
  return a ? publicJson(a, 10) : fail(404, 'NOT_FOUND', 'Activo no encontrado')
}
