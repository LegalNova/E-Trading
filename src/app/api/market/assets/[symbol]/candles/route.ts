import { candles } from '@/server/market/service'
import { INTERVALS, type Interval } from '@/server/market/providers'
import { publicJson } from '@/server/http/respond'
import { safeDecode } from '@/shared/safe-decode'

// GET /api/market/assets/:symbol/candles?interval=1d → velas reales con volumen (nunca inventadas)
export async function GET(req: Request, ctx: RouteContext<'/api/market/assets/[symbol]/candles'>) {
  const { symbol } = await ctx.params
  const i = new URL(req.url).searchParams.get('interval') ?? '1d'
  const interval: Interval = i in INTERVALS ? (i as Interval) : '1d'
  return publicJson(await candles(safeDecode(symbol), interval), ['1m', '5m'].includes(interval) ? 30 : 300)
}
