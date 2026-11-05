import 'server-only'
// Registro de eventos propio (fase 0): de dónde llega cada usuario y cuántos ven los planes, prueban, pagan o cancelan.
// Sin terceros: los datos se quedan en nuestra base de datos.
import type { Prisma } from '@/generated/prisma/client'
import type { Tx } from './core'

export type EventName = 'signup' | 'premium_view' | 'paywall' | 'trial_start' | 'paid' | 'cancel' | 'share' | 'invite'

export async function track(tx: Tx, userId: string | null, name: EventName, props?: Prisma.InputJsonValue) {
  await tx.event.create({ data: { userId, name, props } })
}

/** Como track, pero como mucho una vez cada 24 h por usuario (ver los planes, chocar con el muro) */
export async function trackDaily(tx: Tx, userId: string, name: EventName, props?: Prisma.InputJsonValue) {
  const since = new Date(Date.now() - 24 * 3_600_000)
  if (await tx.event.count({ where: { userId, name, createdAt: { gte: since } } })) return
  await track(tx, userId, name, props)
}

/** Origen limpio: minúsculas, sin caracteres raros, 60 caracteres como mucho */
export const cleanSource = (s: unknown) => (typeof s === 'string' ? s.toLowerCase().replace(/[^a-z0-9_\-/.]/g, '').slice(0, 60) || null : null)
