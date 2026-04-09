import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSupabase } from '@/lib/db'

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

    const supabase = getServerSupabase()

    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        name: name.trim(),
        password_hash,
        plan: 'pro_trial',
        trial_ends_at: trialEndsAt,
        xp: 0,
        racha: 0,
      })
      .select('id')
      .single()

    if (error || !user) {
      console.error('Register DB error:', error)
      throw new Error('DB insert failed')
    }

    // Create portfolio
    await supabase.from('portfolio').insert({ user_id: user.id, cash: 10000 })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err: unknown) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
  }
}
