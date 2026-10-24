import type { NextRequest } from 'next/server'
import { overview } from '@/server/market/service'
import { fail, publicJson } from '@/server/http/respond'

const REGIONS = ['ALL', 'AMERICA', 'EUROPE', 'ASIA', 'GLOBAL'] as const

// GET /api/market/overview?region=EUROPE → índices y mayores subidas y bajadas del día
export async function GET(req: NextRequest) {
  const r = req.nextUrl.searchParams.get('region') ?? 'ALL'
  const region = (REGIONS as readonly string[]).includes(r) ? (r as (typeof REGIONS)[number]) : 'ALL'
  try {
    return publicJson(await overview(region), 30)
  } catch (e) {
    console.error('market/overview', e)
    return fail(503, 'MARKET_UNAVAILABLE', 'Precios no disponibles')
  }
}
