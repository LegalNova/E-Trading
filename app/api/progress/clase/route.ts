import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sql, addXP } from '@/lib/db'
import { CLASES } from '@/data/clases'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) return NextResponse.json({ completedIds: [] })

    const rows = await sql()`SELECT clase_id FROM clases_completadas WHERE user_id = ${userId}`
    const completedIds = rows.map(r => r.clase_id as string)
    return NextResponse.json({ completedIds })
  } catch (err) {
    console.error('GET /api/progress/clase unexpected:', err)
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
    const { claseId } = body
    if (!claseId || typeof claseId !== 'string') {
      return NextResponse.json({ error: 'claseId requerido' }, { status: 400 })
    }

    const clase = CLASES.find(c => c.id === claseId)
    if (!clase) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }

    const db = sql()

    // Insertar completada; si ya existía no devuelve fila (evita XP doble)
    const inserted = await db`
      INSERT INTO clases_completadas (user_id, clase_id) VALUES (${userId}, ${claseId})
      ON CONFLICT (user_id, clase_id) DO NOTHING
      RETURNING clase_id`
    if (inserted.length === 0) {
      return NextResponse.json({ success: true, alreadyCompleted: true, xp: 0 })
    }

    // Add XP
    await addXP(userId, clase.xp)

    // Update daily_usage
    await db`
      INSERT INTO daily_usage (user_id, date, clases_vistas) VALUES (${userId}, CURRENT_DATE, 1)
      ON CONFLICT (user_id, date) DO UPDATE SET clases_vistas = daily_usage.clases_vistas + 1`

    return NextResponse.json({ success: true, alreadyCompleted: false, xp: clase.xp })
  } catch (err) {
    console.error('POST /api/progress/clase unexpected:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
