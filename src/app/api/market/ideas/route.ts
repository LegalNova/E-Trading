import { ideas } from '@/server/market/ideas'
import { fail, publicJson } from '@/server/http/respond'

// GET /api/market/ideas → «Ideas para estudiar»: listas con criterio transparente (no son recomendaciones)
export async function GET() {
  try {
    return publicJson(await ideas(), 120)
  } catch (e) {
    console.error('market/ideas', e)
    return fail(503, 'MARKET_UNAVAILABLE', 'Listas no disponibles')
  }
}
