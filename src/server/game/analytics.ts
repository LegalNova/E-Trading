import 'server-only'
// Registro de eventos propio (fase 0): de dónde llega cada usuario, qué pantallas usa, dónde deja las clases
// y cuántos ven los planes, prueban, pagan o cancelan. Sin terceros: los datos se quedan en nuestra base de datos.
import { z } from 'zod'
import type { Prisma } from '@/generated/prisma/client'
import { realUser } from '../auth'
import { db } from '../db'
import { viewAs } from '../view'
import type { Tx } from './core'

export type EventName = 'signup' | 'premium_view' | 'paywall' | 'trial_start' | 'paid' | 'cancel' | 'share' | 'invite' | 'screen_view' | 'lesson_start' | 'lesson_exit' | 'client_error' | 'server_error' | 'guest_saved'

export async function track(tx: Tx, userId: string | null, name: EventName, props?: Prisma.InputJsonValue) {
  // Un admin «viendo como» otro usuario no deja rastro en sus datos
  if (viewAs()) return
  await tx.event.create({ data: { userId, name, props } })
}

/** Como track, pero como mucho una vez cada 24 h por usuario (ver los planes, chocar con el muro) */
export async function trackDaily(tx: Tx, userId: string, name: EventName, props?: Prisma.InputJsonValue) {
  const since = new Date(Date.now() - 24 * 3_600_000)
  if (await tx.event.count({ where: { userId, name, createdAt: { gte: since } } })) return
  await track(tx, userId, name, props)
}

/** Primera vez que un usuario abre una clase */
export async function trackLessonStart(tx: Tx, userId: string, lessonId: string) {
  if (await tx.event.count({ where: { userId, name: 'lesson_start', props: { path: ['lessonId'], equals: lessonId } } })) return
  await track(tx, userId, 'lesson_start', { lessonId })
}

/** Nombre de enlace de campaña: minúsculas, sin tildes ni espacios (Laura Creadora → laura-creadora) */
export const campaignSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

/** Origen limpio: minúsculas, sin caracteres raros, 60 caracteres como mucho */
export const cleanSource = (s: unknown) => (typeof s === 'string' ? s.toLowerCase().replace(/[^a-z0-9_\-/.]/g, '').slice(0, 60) || null : null)

const clientEvent = z.discriminatedUnion('name', [
  z.object({ name: z.literal('screen_view'), path: z.string().startsWith('/').max(120), ref: z.string().max(60).optional() }),
  z.object({ name: z.literal('client_error'), message: z.string().max(2000), path: z.string().max(200), stack: z.string().max(4000).optional() }),
  z.object({ name: z.literal('lesson_exit'), lessonId: z.string().regex(/^[a-z0-9-]{1,24}$/), step: z.number().int().min(1).max(60), of: z.number().int().min(1).max(60) }),
])

/** Eventos que manda la app: pantalla vista (una vez al día por pantalla) y hasta qué paso llegó en una clase que dejó */
export async function recordClientEvent(body: unknown) {
  const e = clientEvent.parse(body)
  const u = await realUser()
  // El equipo no cuenta en las estadísticas
  if (u?.role === 'ADMIN') return
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z')
  if (e.name === 'screen_view') {
    const path = e.path.toLowerCase().replace(/\/+$/, '') || '/'
    // Enlace de campaña por el que ha llegado (si lo hay): solo el nombre del enlace, nada de la persona
    const ref = e.ref ? campaignSlug(e.ref) : ''
    const extra = ref ? { ref } : {}
    // Sin sesión (página de inicio, legales): se cuentan visitas, sin ningún identificador
    if (!u) return void (await db.event.create({ data: { name: 'screen_view', props: { path, anon: true, ...extra } } }))
    if (await db.event.count({ where: { userId: u.id, name: 'screen_view', createdAt: { gte: today }, props: { path: ['path'], equals: path } } })) return
    await db.event.create({ data: { userId: u.id, name: 'screen_view', props: { path, ...extra } } })
    return
  }
  if (e.name === 'client_error') {
    // Tope global: si algo se dispara, no llenamos la base de datos de copias del mismo fallo
    if ((await db.event.count({ where: { name: 'client_error', createdAt: { gte: new Date(Date.now() - 3_600_000) } } })) > 300) return
    const message = e.message.slice(0, 300)
    if (u && (await db.event.count({ where: { userId: u.id, name: 'client_error', createdAt: { gte: today }, props: { path: ['message'], equals: message } } }))) return
    await db.event.create({ data: { userId: u?.id ?? null, name: 'client_error', props: { message, path: e.path.slice(0, 120), stack: e.stack?.slice(0, 800) ?? null } } })
    return
  }
  if (!u) return
  const prev = await db.event.findFirst({ where: { userId: u.id, name: 'lesson_exit', createdAt: { gte: today }, props: { path: ['lessonId'], equals: e.lessonId } } })
  const props = { lessonId: e.lessonId, step: Math.min(e.step, e.of), of: e.of }
  if (!prev) await db.event.create({ data: { userId: u.id, name: 'lesson_exit', props } })
  else if (((prev.props as { step?: number })?.step ?? 0) < props.step) await db.event.update({ where: { id: prev.id }, data: { props } })
}

/** Fallo del servidor (respuesta 500): se apunta para verlo en el panel. Nunca hace fallar la petición. */
export async function recordServerError(route: string, e: unknown) {
  try {
    const message = (e instanceof Error ? `${e.name}: ${e.message}` : String(e)).slice(0, 300)
    await db.event.create({ data: { name: 'server_error', props: { route: route.slice(0, 120), message } } })
  } catch {
    // si la base de datos tampoco responde, queda el registro de Vercel
  }
}
