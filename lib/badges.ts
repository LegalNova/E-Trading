// Concesión de insignias a partir del estado real del usuario.
import { sql } from '@/lib/db'
import { INSIGNIAS } from '@/data/insignias'

interface Stats {
  clases: number
  retos: number
  trades: number
  positions: number
  categories: number
  ia: number
  racha: number
  xp: number
}

const RULES: [string, (s: Stats) => boolean][] = [
  ['primera-semilla', s => s.clases >= 1],
  ['estudiante', s => s.clases >= 5],
  ['primera-inversion', s => s.trades >= 1],
  ['analista-junior', s => s.retos >= 10],
  ['amigo-ia', s => s.ia >= 20],
  ['trader-practicas', s => s.trades >= 10],
  ['diversificador', s => s.positions >= 5],
  ['racha-fuego', s => s.racha >= 7],
  ['mente-maestra', s => s.retos >= 30],
  ['diamante', s => s.racha >= 30],
  ['mercado-global', s => s.categories >= 4],
  ['estrella-oro', s => s.xp >= 5000],
  ['mentalidad-elite', s => s.racha >= 100],
]

/** Revisa las reglas y concede las insignias nuevas. Devuelve las recién ganadas. */
export async function checkBadges(userId: string, categoriesTraded?: number): Promise<{ id: string; nombre: string; emoji: string }[]> {
  const db = sql()
  const rows = await db`
    SELECT
      (SELECT count(*) FROM clases_completadas WHERE user_id = ${userId}) AS clases,
      (SELECT count(*) FROM reto_progress WHERE user_id = ${userId} AND completed) AS retos,
      (SELECT count(*) FROM trades WHERE user_id = ${userId}) AS trades,
      (SELECT count(*) FROM positions WHERE user_id = ${userId}) AS positions,
      (SELECT count(*) FROM chat_history WHERE user_id = ${userId} AND role = 'user') AS ia,
      u.racha, u.xp
    FROM users u WHERE u.id = ${userId}`
  const r = rows[0] as Omit<Stats, 'categories'> | undefined
  if (!r) return []
  const stats: Stats = { ...r, categories: categoriesTraded ?? 0 }

  const earned = RULES.filter(([, ok]) => ok(stats)).map(([id]) => id)
  if (earned.length === 0) return []

  const inserted = await db`
    INSERT INTO badges (user_id, badge_id)
    SELECT ${userId}, unnest(${earned}::text[])
    ON CONFLICT (user_id, badge_id) DO NOTHING
    RETURNING badge_id`
  return inserted
    .map(row => INSIGNIAS.find(i => i.id === row.badge_id))
    .filter((i): i is (typeof INSIGNIAS)[number] => !!i)
    .map(i => ({ id: i.id, nombre: i.nombre, emoji: i.emoji }))
}
