import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getServerSupabase, addXP } from '@/lib/db'
import { RETOS } from '@/data/retos'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) return NextResponse.json({ completedIds: [] })

    const db = getServerSupabase()
    const { data, error } = await db
      .from('reto_progress')
      .select('reto_id')
      .eq('user_id', userId)
      .eq('completed', true)

    if (error) {
      console.error('GET /api/progress/reto error:', error)
      return NextResponse.json({ completedIds: [] })
    }

    const completedIds = (data ?? []).map((r: { reto_id: string }) => r.reto_id)
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

    const db = getServerSupabase()

    // Check if already completed
    const { data: existing } = await db
      .from('reto_progress')
      .select('reto_id')
      .eq('user_id', userId)
      .eq('reto_id', retoId)
      .eq('completed', true)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true, xp: 0 })
    }

    // Upsert completion
    const { error: upsertError } = await db
      .from('reto_progress')
      .upsert(
        { user_id: userId, reto_id: retoId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,reto_id', ignoreDuplicates: false }
      )

    if (upsertError) {
      console.error('Upsert reto_progress error:', upsertError)
      return NextResponse.json({ error: 'Error al guardar progreso' }, { status: 500 })
    }

    // Add XP
    await addXP(userId, reto.xp)

    return NextResponse.json({ success: true, alreadyCompleted: false, xp: reto.xp })
  } catch (err) {
    console.error('POST /api/progress/reto unexpected:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
