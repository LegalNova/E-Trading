import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    /* ── Validaciones básicas ────────────────────────────── */
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    /* ── Verificar si el email ya existe ─────────────────── */
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 })
    }

    /* ── Hash de la contraseña ───────────────────────────── */
    const password_hash = await bcrypt.hash(password, 10)

    /* ── Crear usuario en Supabase ───────────────────────── */
    const user = await createUser({ email, name: name.trim(), password_hash })

    if (!user) {
      return NextResponse.json({ error: 'Error al crear la cuenta. Inténtalo de nuevo.' }, { status: 500 })
    }

    /* ── Enviar email de bienvenida (no bloqueante) ───────── */
    sendWelcomeEmail(user.email, user.name ?? name).catch(console.error)

    return NextResponse.json({
      ok: true,
      message: '¡Cuenta creada! Redirigiendo...',
    })

  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Error interno. Inténtalo de nuevo.' }, { status: 500 })
  }
}
