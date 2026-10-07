import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getRanking, weekEndsAt, PROMOTE, DEMOTE } from '@/lib/liga'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const userId = (session.user as Record<string, unknown>).id as string
    const ranking = await getRanking(userId)
    return NextResponse.json({ ranking, endsAt: weekEndsAt().toISOString(), promote: PROMOTE, demote: DEMOTE })
  } catch (err) {
    console.error('Liga ranking error:', err)
    return NextResponse.json({ error: 'Error al obtener el ranking' }, { status: 500 })
  }
}
