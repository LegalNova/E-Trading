import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
}

let _supabase: SupabaseClient | null = null
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
  }
  return _supabase
}

// Keep for backwards compat (client-side)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string]
  },
})

export function getServerSupabase(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    return createClient(getSupabaseUrl(), serviceKey)
  }
  return getSupabase()
}

/* ─── Types ─────────────────────────────────────────────────── */
export type DbUser = {
  id: string
  email: string
  name: string | null
  password_hash: string | null
  plan: 'free' | 'starter' | 'pro' | 'elite' | 'pro_trial'
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

/* ─── User helpers ───────────────────────────────────────────── */

/** Buscar usuario por email */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const db = getServerSupabase()
  const { data } = await db
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  return data ?? null
}

/** Buscar usuario por ID */
export async function getUserById(id: string): Promise<DbUser | null> {
  const db = getServerSupabase()
  const { data } = await db
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data ?? null
}

/** Buscar usuario por provider_id (Google) */
export async function getUserByProviderId(providerId: string): Promise<DbUser | null> {
  const db = getServerSupabase()
  const { data } = await db
    .from('users')
    .select('*')
    .eq('provider_id', providerId)
    .single()
  return data ?? null
}

/** Crear usuario nuevo */
export async function createUser(payload: {
  email: string
  name: string
  password_hash?: string
  provider?: string
  provider_id?: string
  avatar_url?: string
}): Promise<DbUser | null> {
  const db = getServerSupabase()
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await db
    .from('users')
    .insert({
      email: payload.email.toLowerCase(),
      name: payload.name,
      password_hash: payload.password_hash ?? null,
      plan: 'pro_trial',
      trial_ends_at: trialEndsAt,
      provider: payload.provider ?? 'credentials',
      provider_id: payload.provider_id ?? null,
      avatar_url: payload.avatar_url ?? null,
    })
    .select()
    .single()

  if (error || !data) return null

  // Crear portafolio inicial con 10.000€ virtuales
  await db
    .from('portfolio')
    .insert({ user_id: data.id, cash: 10000.00 })

  // Crear registro de liga semanal
  const weekStart = getMonday(new Date())
  await db
    .from('liga_weekly')
    .insert({ user_id: data.id, week_start: weekStart, liga_nivel: 1 })

  return data as DbUser
}

/** Actualizar last_active */
export async function touchLastActive(userId: string) {
  const db = getServerSupabase()
  const today = new Date().toISOString().slice(0, 10)
  await db
    .from('users')
    .update({ last_active: today })
    .eq('id', userId)
}

/** Actualizar XP del usuario */
export async function addXP(userId: string, amount: number) {
  const db = getServerSupabase()
  const { data: user } = await db
    .from('users')
    .select('xp')
    .eq('id', userId)
    .single()
  if (!user) return
  await db
    .from('users')
    .update({ xp: (user.xp ?? 0) + amount })
    .eq('id', userId)

  // Sumar a liga semanal
  const weekStart = getMonday(new Date())
  await db
    .from('liga_weekly')
    .upsert(
      { user_id: userId, week_start: weekStart, xp_semanal: amount },
      { onConflict: 'user_id,week_start', ignoreDuplicates: false }
    )
}

/** Obtener plan efectivo (degradar si trial expiró) */
export function getEffectivePlan(user: DbUser): 'free' | 'starter' | 'pro' | 'elite' {
  if (user.plan === 'pro_trial') {
    if (user.trial_ends_at && new Date(user.trial_ends_at) < new Date()) {
      return 'free'
    }
    return 'pro'
  }
  return user.plan as 'free' | 'starter' | 'pro' | 'elite'
}

/** Días restantes de trial */
export function trialDaysLeft(user: DbUser): number | null {
  if (user.plan !== 'pro_trial' || !user.trial_ends_at) return null
  const diff = new Date(user.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/* ─── Portfolio helpers ──────────────────────────────────────── */

export async function getPortfolio(userId: string) {
  const db = getServerSupabase()
  const { data } = await db
    .from('portfolio')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

/* ─── Utils ──────────────────────────────────────────────────── */

function getMonday(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}
