import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getUserByEmail, sql } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email requerido.' }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    // Siempre responder OK aunque el email no exista (seguridad)
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString('hex')
    const db = sql()

    // Invalidar tokens anteriores y crear el nuevo
    await db.transaction([
      db`UPDATE password_resets SET used = TRUE WHERE user_id = ${user.id} AND used = FALSE`,
      db`INSERT INTO password_resets (user_id, token) VALUES (${user.id}, ${token})`,
    ])

    // Enviar email (no bloqueante)
    sendPasswordResetEmail(user.email, user.name ?? 'Trader', token).catch(console.error)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Forgot-password error:', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
