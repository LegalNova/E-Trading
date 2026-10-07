import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 })
    }

    if (await getUserByEmail(email)) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    // Crea usuario + portafolio (10.000€) + registro de liga
    const user = await createUser({ email, name: name.trim(), password_hash })
    if (!user) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err: unknown) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
  }
}
