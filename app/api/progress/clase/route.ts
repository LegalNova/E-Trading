import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getServerSupabase, addXP } from '@/lib/db'
import { CLASES } from '@/data/clases'

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
      .from('clases_completadas')
      .select('clase_id')
      .eq('user_id', userId)

    if (error) {
      console.error('GET /api/progress/clase error:', error)
      return NextResponse.json({ completedIds: [] })
    }

    const completedIds = (data ?? []).map((r: { clase_id: string }) => r.clase_id)
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

    const db = getServerSupabase()

    // Check if already completed
    const { data: existing } = await db
      .from('clases_completadas')
      .select('clase_id')
      .eq('user_id', userId)
      .eq('clase_id', claseId)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true, xp: 0 })
    }

    // Insert completion
    const { error: insertError } = await db
      .from('clases_completadas')
      .insert({ user_id: userId, clase_id: claseId })

    if (insertError) {
      console.error('Insert clases_completadas error:', insertError)
      return NextResponse.json({ error: 'Error al guardar progreso' }, { status: 500 })
    }

    // Add XP
    await addXP(userId, clase.xp)

    // Update daily_usage
    const today = new Date().toISOString().slice(0, 10)
    await db
      .from('daily_usage')
      .upsert(
        { user_id: userId, date: today, clases_vistas: 1 },
        { onConflict: 'user_id,date', ignoreDuplicates: false }
      )

    return NextResponse.json({ success: true, alreadyCompleted: false, xp: clase.xp })
  } catch (err) {
    console.error('POST /api/progress/clase unexpected:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
