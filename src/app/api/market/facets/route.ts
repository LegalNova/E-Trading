import type { NextRequest } from 'next/server'
import { facets } from '@/server/market/service'
import { publicJson } from '@/server/http/respond'

// GET /api/market/facets?region=ASIA&type=ETF → países, sectores (o categorías) e índices para los filtros
export async function GET(req: NextRequest) {
  const r = req.nextUrl.searchParams.get('region')
  const region = r === 'AMERICA' || r === 'EUROPE' || r === 'ASIA' ? r : undefined
  const t = req.nextUrl.searchParams.get('type')
  const type = t === 'ETF' || t === 'COMMODITY' || t === 'INDEX' ? t : 'STOCK'
  return publicJson(await facets(region, type), 3600)
}
