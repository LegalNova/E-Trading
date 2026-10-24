import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { listAssets, searchAssets } from '@/server/market/service'
import { fail, publicJson } from '@/server/http/respond'

const filter = z.object({
  q: z.string().max(60).optional(),
  type: z.enum(['STOCK', 'ETF', 'INDEX', 'CRYPTO', 'FX', 'COMMODITY']).optional(),
  region: z.enum(['AMERICA', 'EUROPE', 'ASIA', 'GLOBAL']).optional(),
  country: z.string().max(40).optional(),
  sector: z.string().max(80).optional(),
  index: z.string().max(40).optional(),
  sort: z.enum(['name', 'gainers', 'losers']).optional(),
  offset: z.coerce.number().int().min(0).max(5000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

// GET /api/market/assets?symbols=AAPL,SAN.MC → lista de esos activos
// GET /api/market/assets?region=EUROPE&index=IBEX 35&sort=gainers&offset=0 → página filtrada
export async function GET(req: NextRequest) {
  const p = Object.fromEntries(req.nextUrl.searchParams)
  try {
    if (p.symbols) return publicJson(await listAssets(p.symbols.split(',').filter(Boolean).slice(0, 100)), 10)
    const f = filter.safeParse(p)
    if (!f.success) return fail(422, 'VALIDATION_ERROR', 'Filtros no válidos')
    return publicJson(await searchAssets(f.data), 15)
  } catch (e) {
    console.error('market/assets', e)
    return fail(503, 'MARKET_UNAVAILABLE', 'Precios no disponibles')
  }
}
