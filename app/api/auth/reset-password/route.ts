import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSupabase } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    }

    const db = getServerSupabase()

    // Buscar token válido
    const { data: reset } = await db
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (!reset) {
      return NextResponse.json({ error: 'El enlace es inválido o ha expirado.' }, { status: 400 })
    }

    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El enlace ha expirado. Solicita uno nuevo.' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    // Actualizar contraseña
    await db.from('users').update({ password_hash }).eq('id', reset.user_id)

    // Marcar token como usado
    await db.from('password_resets').update({ used: true }).eq('id', reset.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reset-password error:', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
