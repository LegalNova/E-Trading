import { fundamentals } from '@/server/market/fundamentals'
import { fail, publicJson } from '@/server/http/respond'
import { safeDecode } from '@/shared/safe-decode'

// GET /api/market/assets/:symbol/fundamentals → capitalización, PER, dividendo, BPA y beta (Yahoo, una vez al día).
// Va aparte de la ficha para no frenarla: la primera vez espera al proveedor unos segundos como mucho.
export async function GET(_req: Request, ctx: RouteContext<'/api/market/assets/[symbol]/fundamentals'>) {
  const { symbol } = await ctx.params
  try {
    const f = await fundamentals(safeDecode(symbol))
    return f ? publicJson(f, f.available ? 3600 : 300) : fail(404, 'NOT_FOUND', 'Activo no encontrado')
  } catch (e) {
    console.error('market/fundamentals', e)
    return fail(503, 'MARKET_UNAVAILABLE', 'Datos de la empresa no disponibles')
  }
}
