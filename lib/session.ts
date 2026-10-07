import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getUserById, getUserByEmail, getEffectivePlan, DbUser, Plan } from '@/lib/db'

/** Usuario de la sesión actual leído de la base de datos (o null) */
export async function getCurrentUser(): Promise<(DbUser & { effectivePlan: Plan }) | null> {
  const session = await getServerSession(authOptions)
  const s = session?.user as { id?: string; email?: string | null } | undefined
  if (!s) return null
  const user = s.id ? await getUserById(s.id) : s.email ? await getUserByEmail(s.email) : null
  if (!user) return null
  return { ...user, effectivePlan: getEffectivePlan(user) }
}
