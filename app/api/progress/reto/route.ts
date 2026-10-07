import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sql, addXP } from '@/lib/db'
import { RETOS } from '@/data/retos'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) return NextResponse.json({ completedIds: [] })

    const rows = await sql()`
      SELECT reto_id FROM reto_progress WHERE user_id = ${userId} AND completed = TRUE`
    const completedIds = rows.map(r => r.reto_id as string)
    return NextResponse.json({ completedIds })
  } catch (err) {
    console.error('GET /api/progress/reto unexpected:', err)
    return NextResponse.json({ completedIds: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no válido' }, { status: 400 })
    }

    const body = await req.json()
    const { retoId } = body
    if (!retoId || typeof retoId !== 'string') {
      return NextResponse.json({ error: 'retoId requerido' }, { status: 400 })
    }

    const reto = RETOS.find(r => r.id === retoId)
    if (!reto) {
      return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 })
    }

    // Marcar completado; solo devuelve fila si antes no lo estaba (evita XP doble)
    const updated = await sql()`
      INSERT INTO reto_progress (user_id, reto_id, completed, completed_at)
      VALUES (${userId}, ${retoId}, TRUE, NOW())
      ON CONFLICT (user_id, reto_id)
      DO UPDATE SET completed = TRUE, completed_at = NOW()
      WHERE reto_progress.completed = FALSE
      RETURNING reto_id`
    if (updated.length === 0) {
      return NextResponse.json({ success: true, alreadyCompleted: true, xp: 0 })
    }

    // Add XP
    await addXP(userId, reto.xp)

    return NextResponse.json({ success: true, alreadyCompleted: false, xp: reto.xp })
  } catch (err) {
    console.error('POST /api/progress/reto unexpected:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
