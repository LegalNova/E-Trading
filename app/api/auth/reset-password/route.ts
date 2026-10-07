import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    }

    const db = sql()

    // Buscar token válido
    const rows = await db`
      SELECT id, user_id, expires_at FROM password_resets
      WHERE token = ${token} AND used = FALSE LIMIT 1`
    const reset = rows[0] as { id: string; user_id: string; expires_at: string } | undefined

    if (!reset) {
      return NextResponse.json({ error: 'El enlace es inválido o ha expirado.' }, { status: 400 })
    }

    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El enlace ha expirado. Solicita uno nuevo.' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    // Actualizar contraseña y marcar token como usado
    await db.transaction([
      db`UPDATE users SET password_hash = ${password_hash} WHERE id = ${reset.user_id}`,
      db`UPDATE password_resets SET used = TRUE WHERE id = ${reset.id}`,
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reset-password error:', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
