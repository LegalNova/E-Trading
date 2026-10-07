import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sql } from '@/lib/db'
import { checkBadges } from '@/lib/badges'

const STREAK_REWARDS: { days: number; xp: number; message: string }[] = [
  { days: 3,   xp: 50,   message: '¡3 días seguidos! Vas bien.' },
  { days: 7,   xp: 200,  message: '¡Una semana seguida! Sigue así.' },
  { days: 14,  xp: 500,  message: '¡Dos semanas! Eres constante.' },
  { days: 30,  xp: 1000, message: '¡Un mes completo! Extraordinario.' },
  { days: 100, xp: 5000, message: '¡100 días! Eres una leyenda.' },
]

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = session.user as Record<string, unknown>
    const userId = user.id as string

    const db = sql()

    const rows = await db`SELECT racha, last_active, xp FROM users WHERE id = ${userId} LIMIT 1`
    const dbUser = rows[0] as { racha: number; last_active: string | null; xp: number } | undefined

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]
    const lastActive = dbUser.last_active ? dbUser.last_active.split('T')[0] : null

    // Already checked in today
    if (lastActive === today) {
      return NextResponse.json({
        racha: dbUser.racha,
        isNewDay: false,
      })
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const wasActiveYesterday = lastActive === yesterdayStr
    const newRacha = wasActiveYesterday ? (dbUser.racha ?? 0) + 1 : 1

    // Check for streak reward
    const reward = STREAK_REWARDS.find(r => r.days === newRacha)
    const bonusXP = reward?.xp ?? 0

    // Update user (condicional: dos check-ins simultáneos no suman dos veces)
    const updated = await db`
      UPDATE users SET racha = ${newRacha}, last_active = ${today}, xp = xp + ${bonusXP}
      WHERE id = ${userId} AND (last_active IS NULL OR last_active <> ${today}::date)
      RETURNING racha`
    if (updated.length === 0) {
      return NextResponse.json({ racha: dbUser.racha, isNewDay: false })
    }

    const badges = await checkBadges(userId)

    return NextResponse.json({
      racha: newRacha,
      isNewDay: true,
      bonusXP,
      reward: reward ? { xp: reward.xp, message: reward.message } : null,
      badges,
      wasActive: wasActiveYesterday,
    })
  } catch (err) {
    console.error('Checkin error:', err)
    return NextResponse.json({ error: 'Error en checkin' }, { status: 500 })
  }
}
