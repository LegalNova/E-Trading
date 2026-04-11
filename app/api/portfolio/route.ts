import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getUserByEmail, getPortfolio, getPositions, getTrades } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const user = await getUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const [portfolio, positions, trades] = await Promise.all([
    getPortfolio(user.id),
    getPositions(user.id),
    getTrades(user.id, 20),
  ])

  return NextResponse.json({
    portfolio: portfolio ?? { cash: 10000 },
    positions: positions ?? [],
    trades: trades ?? [],
  })
}
