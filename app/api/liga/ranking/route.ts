import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getServerSupabase } from '@/lib/db'

const BOT_NAMES = [
  'Carlos M.', 'Ana García', 'Pedro L.', 'María S.', 'Juan A.',
  'Laura P.', 'Miguel R.', 'Sara T.', 'David F.', 'Lucía B.',
  'Marcos V.', 'Elena C.', 'Álvaro N.', 'Carla D.', 'Javier H.',
  'Natalia E.', 'Diego K.', 'Sofía G.', 'Rubén I.', 'Marta J.',
  'Pablo O.', 'Isabel Q.', 'Sergio U.', 'Cristina W.', 'Adrián X.',
  'Beatriz Y.', 'Víctor Z.', 'Nuria AA.', 'Fernando BB.', 'Rocío CC.',
]

const AVATAR_COLORS = [
  '#00D47A', '#42A5F5', '#9945FF', '#F9A825', '#EF5350',
  '#26C6DA', '#66BB6A', '#FFA726', '#AB47BC', '#29B6F6',
]

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = session.user as Record<string, unknown>
    const userId = user.id as string
    const weekStart = getWeekStart()

    const supabase = getServerSupabase()

    // Get real users from liga_weekly
    const { data: weeklyUsers } = await supabase
      .from('liga_weekly')
      .select('user_id, xp_semanal, liga_nivel')
      .eq('week_start', weekStart)
      .order('xp_semanal', { ascending: false })
      .limit(30)

    const realEntries: {
      pos: number; name: string; xp: number; racha: number;
      isMe: boolean; isBot: boolean; initials: string; avatarColor: string; ligaNivel: number;
    }[] = []

    if (weeklyUsers && weeklyUsers.length > 0) {
      // Fetch user names
      const userIds = weeklyUsers.map(u => u.user_id)
      const { data: users } = await supabase
        .from('users')
        .select('id, name, racha, liga_nivel')
        .in('id', userIds)

      const userMap = new Map((users ?? []).map(u => [u.id, u]))

      for (const wu of weeklyUsers) {
        const u = userMap.get(wu.user_id)
        if (!u) continue
        realEntries.push({
          pos: 0,
          name: u.name ?? u.id.slice(0, 8),
          xp: wu.xp_semanal ?? 0,
          racha: u.racha ?? 0,
          isMe: wu.user_id === userId,
          isBot: false,
          initials: getInitials(u.name ?? 'U'),
          avatarColor: '#00D47A',
          ligaNivel: wu.liga_nivel ?? 1,
        })
      }
    }

    // Check if current user is in the list
    const meInList = realEntries.some(e => e.isMe)
    if (!meInList) {
      const { data: myData } = await supabase
        .from('users')
        .select('name, racha, liga_nivel, xp')
        .eq('id', userId)
        .single()

      if (myData) {
        realEntries.push({
          pos: 0,
          name: myData.name ?? 'Tú',
          xp: myData.xp ?? 0,
          racha: myData.racha ?? 0,
          isMe: true,
          isBot: false,
          initials: getInitials(myData.name ?? 'TÚ'),
          avatarColor: '#00D47A',
          ligaNivel: myData.liga_nivel ?? 1,
        })
      }
    }

    // Fill with bots up to 30
    const botsNeeded = 30 - realEntries.length
    for (let i = 0; i < botsNeeded && i < BOT_NAMES.length; i++) {
      const r1 = seededRand(i * 7 + 1)
      const r2 = seededRand(i * 7 + 2)
      const r3 = seededRand(i * 7 + 3)
      realEntries.push({
        pos: 0,
        name: BOT_NAMES[i],
        xp: Math.floor(r1 * 1800 + 100),
        racha: Math.floor(r2 * 20),
        isMe: false,
        isBot: true,
        initials: getInitials(BOT_NAMES[i]),
        avatarColor: AVATAR_COLORS[Math.floor(r3 * AVATAR_COLORS.length)],
        ligaNivel: Math.floor(r1 * 3) + 1,
      })
    }

    // Sort and assign positions
    realEntries.sort((a, b) => b.xp - a.xp)
    realEntries.forEach((e, i) => { e.pos = i + 1 })

    return NextResponse.json({ ranking: realEntries })
  } catch (err) {
    console.error('Liga ranking error:', err)
    return NextResponse.json({ error: 'Error al obtener el ranking' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = session.user as Record<string, unknown>
    const userId = user.id as string
    const { xpEarned } = await req.json()

    if (!xpEarned || typeof xpEarned !== 'number') {
      return NextResponse.json({ error: 'xpEarned requerido' }, { status: 400 })
    }

    const supabase = getServerSupabase()
    const weekStart = getWeekStart()

    const { data: existing } = await supabase
      .from('liga_weekly')
      .select('xp_semanal')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (existing) {
      await supabase
        .from('liga_weekly')
        .update({ xp_semanal: (existing.xp_semanal ?? 0) + xpEarned })
        .eq('user_id', userId)
        .eq('week_start', weekStart)
    } else {
      await supabase
        .from('liga_weekly')
        .insert({ user_id: userId, week_start: weekStart, xp_semanal: xpEarned, liga_nivel: (user.liga_nivel as number) ?? 1 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Liga POST error:', err)
    return NextResponse.json({ error: 'Error al actualizar XP' }, { status: 500 })
  }
}
