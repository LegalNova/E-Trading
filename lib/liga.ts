// Ranking semanal: usuarios reales + bots deterministas hasta completar 30.
import { sql, getMonday } from '@/lib/db'
import { getLigaNombre } from '@/lib/xp'

const BOT_NAMES = [
  'Carlos M.', 'Ana García', 'Pedro L.', 'María S.', 'Juan A.',
  'Laura P.', 'Miguel R.', 'Sara T.', 'David F.', 'Lucía B.',
  'Marcos V.', 'Elena C.', 'Álvaro N.', 'Carla D.', 'Javier H.',
  'Natalia E.', 'Diego K.', 'Sofía G.', 'Rubén I.', 'Marta J.',
  'Pablo O.', 'Isabel Q.', 'Sergio U.', 'Cristina W.', 'Adrián X.',
  'Beatriz Y.', 'Víctor Z.', 'Nuria A.', 'Fernando B.', 'Rocío C.',
]

const AVATAR_COLORS = ['var(--green)', 'var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--red)']

export const GROUP_SIZE = 30
export const PROMOTE = 7
export const DEMOTE = 5

export interface RankingEntry {
  pos: number
  name: string
  xp: number
  racha: number
  isMe: boolean
  isBot: boolean
  initials: string
  avatarColor: string
  ligaNivel: number
}

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

/** Fin de la semana de liga: próximo lunes 00:00 */
export function weekEndsAt(now = new Date()): Date {
  const monday = new Date(getMonday(now) + 'T00:00:00')
  monday.setDate(monday.getDate() + 7)
  return monday
}

export async function getRanking(userId: string): Promise<RankingEntry[]> {
  const db = sql()
  const weekStart = getMonday(new Date())

  const weekly = (await db`
    SELECT lw.user_id, lw.xp_semanal, lw.liga_nivel, u.name, u.racha
    FROM liga_weekly lw JOIN users u ON u.id = lw.user_id
    WHERE lw.week_start = ${weekStart}
    ORDER BY lw.xp_semanal DESC
    LIMIT ${GROUP_SIZE}`) as {
      user_id: string; xp_semanal: number; liga_nivel: number; name: string | null; racha: number
    }[]

  const entries: RankingEntry[] = weekly.map(wu => ({
    pos: 0,
    name: wu.name ?? 'Inversor',
    xp: wu.xp_semanal ?? 0,
    racha: wu.racha ?? 0,
    isMe: wu.user_id === userId,
    isBot: false,
    initials: getInitials(wu.name ?? 'U'),
    avatarColor: 'var(--green)',
    ligaNivel: wu.liga_nivel ?? 1,
  }))

  if (!entries.some(e => e.isMe)) {
    const me = (await db`SELECT name, racha, liga_nivel FROM users WHERE id = ${userId} LIMIT 1`)[0] as
      { name: string | null; racha: number; liga_nivel: number } | undefined
    if (me) {
      entries.push({
        pos: 0, name: me.name ?? 'Tú', xp: 0, racha: me.racha ?? 0, isMe: true, isBot: false,
        initials: getInitials(me.name ?? 'TÚ'), avatarColor: 'var(--green)', ligaNivel: me.liga_nivel ?? 1,
      })
    }
  }

  // Bots: XP semanal crece con los días transcurridos de la semana
  const dayOfWeek = (new Date().getDay() + 6) % 7 // lunes = 0
  const weekSeed = Number(weekStart.replace(/-/g, ''))
  for (let i = 0; entries.length < GROUP_SIZE && i < BOT_NAMES.length; i++) {
    const r1 = seededRand(weekSeed + i * 7 + 1)
    const r2 = seededRand(weekSeed + i * 7 + 2)
    const r3 = seededRand(weekSeed + i * 7 + 3)
    entries.push({
      pos: 0,
      name: BOT_NAMES[i],
      // distribución sesgada: pocos bots muy activos y muchos con poco XP, como en una liga real
      xp: Math.floor((r1 * r1 * 150 + 5) * (dayOfWeek + 1)),
      racha: Math.floor(r2 * 20),
      isMe: false,
      isBot: true,
      initials: getInitials(BOT_NAMES[i]),
      avatarColor: AVATAR_COLORS[Math.floor(r3 * AVATAR_COLORS.length)],
      ligaNivel: 1,
    })
  }

  entries.sort((a, b) => b.xp - a.xp || Number(a.isBot) - Number(b.isBot))
  entries.forEach((e, i) => { e.pos = i + 1 })
  return entries
}

export function zoneOf(pos: number): 'up' | 'down' | 'safe' {
  if (pos <= PROMOTE) return 'up'
  if (pos > GROUP_SIZE - DEMOTE) return 'down'
  return 'safe'
}

export { getLigaNombre }
