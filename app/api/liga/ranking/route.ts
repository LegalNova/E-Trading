import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sql } from '@/lib/db'

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

    const db = sql()

    // Usuarios reales de esta semana (con nombre y racha)
    const weeklyUsers = (await db`
      SELECT lw.user_id, lw.xp_semanal, lw.liga_nivel, u.name, u.racha
      FROM liga_weekly lw JOIN users u ON u.id = lw.user_id
      WHERE lw.week_start = ${weekStart}
      ORDER BY lw.xp_semanal DESC
      LIMIT 30`) as {
        user_id: string; xp_semanal: number; liga_nivel: number; name: string | null; racha: number
      }[]

    const realEntries: {
      pos: number; name: string; xp: number; racha: number;
      isMe: boolean; isBot: boolean; initials: string; avatarColor: string; ligaNivel: number;
    }[] = []

    for (const wu of weeklyUsers) {
      realEntries.push({
        pos: 0,
        name: wu.name ?? wu.user_id.slice(0, 8),
        xp: wu.xp_semanal ?? 0,
        racha: wu.racha ?? 0,
        isMe: wu.user_id === userId,
        isBot: false,
        initials: getInitials(wu.name ?? 'U'),
        avatarColor: '#00D47A',
        ligaNivel: wu.liga_nivel ?? 1,
      })
    }

    // Check if current user is in the list
    const meInList = realEntries.some(e => e.isMe)
    if (!meInList) {
      const myRows = await db`SELECT name, racha, liga_nivel, xp FROM users WHERE id = ${userId} LIMIT 1`
      const myData = myRows[0] as { name: string | null; racha: number; liga_nivel: number; xp: number } | undefined

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

    const weekStart = getWeekStart()
    const ligaNivel = (user.liga_nivel as number) ?? 1

    await sql()`
      INSERT INTO liga_weekly (user_id, week_start, xp_semanal, liga_nivel)
      VALUES (${userId}, ${weekStart}, ${xpEarned}, ${ligaNivel})
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET xp_semanal = liga_weekly.xp_semanal + EXCLUDED.xp_semanal`

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Liga POST error:', err)
    return NextResponse.json({ error: 'Error al actualizar XP' }, { status: 500 })
  }
}
