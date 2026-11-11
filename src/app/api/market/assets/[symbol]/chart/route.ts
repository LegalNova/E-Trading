import { z } from 'zod'
import { chartData } from '@/server/market/service'
import { fail, publicJson } from '@/server/http/respond'
import { safeDecode } from '@/shared/safe-decode'

const Interval = z.enum(['1m', '5m', '15m', '1h', '1d', '1w', '1M'])
/** Segundos que la CDN puede servir el mismo gráfico a todos (como mucho lo que dura una vela, y nunca más de una hora) */
const CDN_S: Record<z.infer<typeof Interval>, number> = { '1m': 20, '5m': 60, '15m': 120, '1h': 300, '1d': 600, '1w': 3600, '1M': 3600 }

// GET /api/market/assets/:symbol/chart?interval=5m → velas de exactamente ese intervalo y el periodo que se ve al abrir.
// Un intervalo desconocido es un error (antes se servía el diario en su lugar, sin avisar).
export async function GET(req: Request, ctx: RouteContext<'/api/market/assets/[symbol]/chart'>) {
  const { symbol } = await ctx.params
  const i = Interval.safeParse(new URL(req.url).searchParams.get('interval') ?? '1d')
  if (!i.success) return fail(422, 'VALIDATION_ERROR', 'Intervalo no válido: usa 1m, 5m, 15m, 1h, 1d, 1w o 1M')
  try {
    const d = await chartData(safeDecode(symbol), i.data)
    return d ? publicJson(d, d.unavailable ? 60 : CDN_S[i.data]) : fail(404, 'NOT_FOUND', 'Activo no encontrado')
  } catch (e) {
    console.error('market/chart', e)
    return fail(503, 'MARKET_UNAVAILABLE', 'Gráfico no disponible ahora mismo')
  }
}
