import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sql } from '@/lib/db'

const KEYS = ['nivel', 'objetivo', 'riesgo', 'tiempo'] as const

// POST /api/user/onboarding { answers: [n, n, n, n] } (índice de la opción elegida en cada paso)
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { answers } = (await req.json().catch(() => ({}))) as { answers?: unknown }
  if (!Array.isArray(answers) || answers.length !== 4 || !answers.every(a => Number.isInteger(a) && a >= 0 && a <= 2)) {
    return NextResponse.json({ error: 'Respuestas inválidas' }, { status: 400 })
  }
  const data = Object.fromEntries(KEYS.map((k, i) => [k, answers[i]]))
  await sql()`UPDATE users SET onboarding = ${JSON.stringify({ ...data, completedAt: new Date().toISOString() })}::jsonb WHERE id = ${user.id}`
  return NextResponse.json({ ok: true })
}
