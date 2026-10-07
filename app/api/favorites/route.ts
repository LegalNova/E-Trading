import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sql } from '@/lib/db'
import { ASSET_BY_SYMBOL } from '@/data/assets'

export const dynamic = 'force-dynamic'

// GET /api/favorites → { symbols: string[] }
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const rows = await sql()`SELECT symbol FROM favorites WHERE user_id = ${user.id} ORDER BY created_at`
  return NextResponse.json({ symbols: rows.map(r => r.symbol as string) })
}

// POST /api/favorites { symbol } → alterna favorito; devuelve { favorite: boolean }
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { symbol } = (await req.json().catch(() => ({}))) as { symbol?: string }
  const sym = String(symbol ?? '').toUpperCase()
  if (!ASSET_BY_SYMBOL[sym]) return NextResponse.json({ error: 'Activo inválido' }, { status: 400 })

  const db = sql()
  const removed = await db`DELETE FROM favorites WHERE user_id = ${user.id} AND symbol = ${sym} RETURNING symbol`
  if (removed.length > 0) return NextResponse.json({ favorite: false })
  await db`INSERT INTO favorites (user_id, symbol) VALUES (${user.id}, ${sym}) ON CONFLICT DO NOTHING`
  return NextResponse.json({ favorite: true })
}
