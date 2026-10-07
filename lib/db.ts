import { neon, types, NeonQueryFunction } from '@neondatabase/serverless'

/* ─── Conexión (Neon serverless, HTTP) ───────────────────────── */

// Devolver tipos con la misma forma que antes (JSON-friendly):
// numeric → number, bigint → number, date → 'YYYY-MM-DD', timestamptz → ISO string
const parseTimestamp = types.getTypeParser(1184) as (v: string) => Date
types.setTypeParser(1700, (v: string) => parseFloat(v))                      // numeric
types.setTypeParser(20, (v: string) => parseInt(v, 10))                      // int8
types.setTypeParser(1082, (v: string) => v)                                  // date
types.setTypeParser(1184, (v: string) => parseTimestamp(v).toISOString())    // timestamptz

let _sql: NeonQueryFunction<false, false> | null = null

/** Cliente SQL de Neon. Uso: await sql()`SELECT * FROM users WHERE id = ${id}` */
export function sql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL no configurada')
    _sql = neon(url)
  }
  return _sql
}

/* ─── Types ─────────────────────────────────────────────────── */
export type Plan = 'free' | 'starter' | 'pro' | 'elite'

export type DbUser = {
  id: string
  email: string
  name: string | null
  password_hash: string | null
  plan: Plan | 'pro_trial'
  trial_ends_at: string | null
  xp: number
  racha: number
  last_active: string | null
  liga_nivel: number
  liga_pos: number | null
  onboarding: Record<string, unknown> | null
  provider: string
  provider_id: string | null
  stripe_customer_id: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
}

export type DbPortfolio = { id: string; user_id: string; cash: number; updated_at: string }

export type DbPosition = {
  id: string
  user_id: string
  symbol: string
  shares: number
  avg_price: number
  cost_eur: number
  opened_at: string
}

export type DbTrade = {
  id: string
  user_id: string
  type: 'buy' | 'sell'
  symbol: string
  shares: number
  price: number
  total: number
  currency: string
  fx_rate: number
  pnl_eur: number | null
  executed_at: string
}

/* ─── User helpers ───────────────────────────────────────────── */

/** Buscar usuario por email */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await sql()`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
  return (rows[0] as DbUser | undefined) ?? null
}

/** Buscar usuario por ID */
export async function getUserById(id: string): Promise<DbUser | null> {
  const rows = await sql()`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return (rows[0] as DbUser | undefined) ?? null
}

/** Buscar usuario por provider_id (Google) */
export async function getUserByProviderId(providerId: string): Promise<DbUser | null> {
  const rows = await sql()`SELECT * FROM users WHERE provider_id = ${providerId} LIMIT 1`
  return (rows[0] as DbUser | undefined) ?? null
}

/** Crear usuario nuevo (con portafolio de 10.000€ y registro de liga) */
export async function createUser(payload: {
  email: string
  name: string
  password_hash?: string
  provider?: string
  provider_id?: string
  avatar_url?: string
}): Promise<DbUser | null> {
  const db = sql()
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const rows = await db`
    INSERT INTO users (email, name, password_hash, plan, trial_ends_at, provider, provider_id, avatar_url)
    VALUES (
      ${payload.email.toLowerCase()}, ${payload.name}, ${payload.password_hash ?? null},
      'pro_trial', ${trialEndsAt}, ${payload.provider ?? 'credentials'},
      ${payload.provider_id ?? null}, ${payload.avatar_url ?? null}
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING *`
  const user = rows[0] as DbUser | undefined
  if (!user) return null

  const weekStart = getMonday(new Date())
  await db.transaction([
    db`INSERT INTO portfolio (user_id, cash) VALUES (${user.id}, 10000.00) ON CONFLICT (user_id) DO NOTHING`,
    db`INSERT INTO liga_weekly (user_id, week_start, liga_nivel) VALUES (${user.id}, ${weekStart}, 1)
       ON CONFLICT (user_id, week_start) DO NOTHING`,
  ])

  return user
}

/** Sumar XP al usuario y a su liga semanal (atómico) */
export async function addXP(userId: string, amount: number) {
  const db = sql()
  const weekStart = getMonday(new Date())
  await db.transaction([
    db`UPDATE users SET xp = xp + ${amount} WHERE id = ${userId}`,
    db`INSERT INTO liga_weekly (user_id, week_start, xp_semanal, liga_nivel)
       SELECT ${userId}, ${weekStart}, ${amount}, liga_nivel FROM users WHERE id = ${userId}
       ON CONFLICT (user_id, week_start)
       DO UPDATE SET xp_semanal = liga_weekly.xp_semanal + EXCLUDED.xp_semanal`,
  ])
}

/** Obtener plan efectivo (degradar si trial expiró) */
export function getEffectivePlan(user: DbUser): Plan {
  if (user.plan === 'pro_trial') {
    if (user.trial_ends_at && new Date(user.trial_ends_at) < new Date()) {
      return 'free'
    }
    return 'pro'
  }
  return user.plan
}

/** Días restantes de trial */
export function trialDaysLeft(user: DbUser): number | null {
  if (user.plan !== 'pro_trial' || !user.trial_ends_at) return null
  const diff = new Date(user.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/* ─── Portfolio helpers ──────────────────────────────────────── */

export async function getPortfolio(userId: string): Promise<DbPortfolio | null> {
  const rows = await sql()`SELECT * FROM portfolio WHERE user_id = ${userId} LIMIT 1`
  return (rows[0] as DbPortfolio | undefined) ?? null
}

export async function getPositions(userId: string): Promise<DbPosition[]> {
  const rows = await sql()`SELECT * FROM positions WHERE user_id = ${userId} ORDER BY opened_at DESC`
  return rows as DbPosition[]
}

export async function getPositionBySymbol(userId: string, symbol: string): Promise<DbPosition | null> {
  const rows = await sql()`SELECT * FROM positions WHERE user_id = ${userId} AND symbol = ${symbol} LIMIT 1`
  return (rows[0] as DbPosition | undefined) ?? null
}

export async function getTrades(userId: string, limit = 50): Promise<DbTrade[]> {
  const rows = await sql()`
    SELECT * FROM trades WHERE user_id = ${userId} ORDER BY executed_at DESC LIMIT ${limit}`
  return rows as DbTrade[]
}

/* ─── Utils ──────────────────────────────────────────────────── */

export function getMonday(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}
