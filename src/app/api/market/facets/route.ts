import type { NextRequest } from 'next/server'
import { facets } from '@/server/market/service'
import { publicJson } from '@/server/http/respond'

// GET /api/market/facets?region=ASIA → países, sectores e índices para los filtros
export async function GET(req: NextRequest) {
  const r = req.nextUrl.searchParams.get('region')
  const region = r === 'AMERICA' || r === 'EUROPE' || r === 'ASIA' ? r : undefined
  return publicJson(await facets(region), 3600)
}
