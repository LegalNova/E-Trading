import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getServerSupabase } from '@/lib/db'

const STREAK_REWARDS: { days: number; xp: number; badge?: string; message: string }[] = [
  { days: 3,   xp: 50,   message: '¡3 días seguidos! Vas bien.' },
  { days: 7,   xp: 200,  badge: 'racha-fuego', message: '¡Una semana! Insignia de Racha de Fuego desbloqueada.' },
  { days: 14,  xp: 500,  message: '¡Dos semanas! Eres constante.' },
  { days: 30,  xp: 1000, message: '¡Un mes completo! Extraordinario.' },
  { days: 100, xp: 5000, badge: 'racha-legendaria', message: '¡100 días! Eres una leyenda.' },
]

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = session.user as Record<string, unknown>
    const userId = user.id as string

    const supabase = getServerSupabase()

    const { data: dbUser } = await supabase
      .from('users')
      .select('racha, last_active, xp')
      .eq('id', userId)
      .single()

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
    const newXP = (dbUser.xp ?? 0) + bonusXP

    // Update user
    const updateData: Record<string, unknown> = {
      racha: newRacha,
      last_active: today,
      xp: newXP,
    }

    await supabase.from('users').update(updateData).eq('id', userId)

    // Award badge if applicable
    if (reward?.badge) {
      await supabase
        .from('badges')
        .upsert({ user_id: userId, badge_id: reward.badge })
        .select()
    }

    return NextResponse.json({
      racha: newRacha,
      isNewDay: true,
      bonusXP,
      reward: reward ? { xp: reward.xp, message: reward.message, badge: reward.badge } : null,
      wasActive: wasActiveYesterday,
    })
  } catch (err) {
    console.error('Checkin error:', err)
    return NextResponse.json({ error: 'Error en checkin' }, { status: 500 })
  }
}
