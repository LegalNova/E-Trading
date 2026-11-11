import 'server-only'
// Mensajes del equipo: el admin escribe a una persona (o a varias) desde el panel. Cada mensaje es un aviso
// (tabla Notification, id «tm-…») que se ve en Avisos y, la próxima vez que abre la app, como una ventana.
// Si tiene los avisos del móvil activados también le llega uno, con los límites de push.ts (horas, número y separación).
// Leído = la persona cerró la ventana o lo abrió en Avisos (readAt).
import { randomBytes } from 'node:crypto'
import { after } from 'next/server'
import { HAS_HTML, HAS_LINK, personalize, TEAM_HEADER, TEXT_MAX, TITLE_MAX, type TeamLang } from '@/shared/team-messages'
import { db } from '../db'
import { pushSlot, sendPush } from '../push'
import { fail, requireUser, type Tx } from './core'

export const TEAM_PREFIX = 'tm-'
/** Mensaje a una persona: tm-u<aleatorio> · envío a varios: tm-b<lote>-<n> */
export const batchPrefix = (batch: string) => `${TEAM_PREFIX}b${batch}-`
export const teamLink = (id: string) => `/avisos?mensaje=${id}`
const KEEP_DAYS = 60

export const langOf = (l: string | null | undefined): TeamLang => (l === 'ca' || l === 'en' ? l : 'es')
export const newBatch = () => randomBytes(6).toString('hex')

/** Texto limpio y validado: sin enlaces, sin HTML, sin caracteres de control y con un tamaño razonable */
export function cleanMessage(title: string | undefined, text: string) {
  const strip = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n')
  const t = strip(title ?? '').replace(/\s+/g, ' ').trim()
  const body = strip(text).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (body.length < 2) fail(422, 'VALIDATION_ERROR', 'Escribe el mensaje')
  if (body.length > TEXT_MAX) fail(422, 'VALIDATION_ERROR', `El mensaje puede tener hasta ${TEXT_MAX} caracteres`)
  if (t.length > TITLE_MAX) fail(422, 'VALIDATION_ERROR', `El título puede tener hasta ${TITLE_MAX} caracteres`)
  if (HAS_LINK.test(body) || HAS_LINK.test(t)) fail(422, 'NO_LINKS', 'El mensaje no puede llevar enlaces')
  if (HAS_HTML.test(body) || HAS_HTML.test(t)) fail(422, 'NO_HTML', 'Escribe solo texto, sin etiquetas HTML')
  return { title: t || null, text: body }
}

type Target = { id: string; name: string | null; locale: string; isAnonymous?: boolean | null }
const nameOf = (u: Target) => (u.isAnonymous ? '' : u.name)

/** Fila del aviso para una persona: título (o el del equipo en su idioma) y texto con su nombre */
function rowFor(u: Target, id: string, msg: { title: string | null; text: string }) {
  const lang = langOf(u.locale)
  return { id, userId: u.id, type: 'TEAM', title: msg.title ? personalize(msg.title, nameOf(u)) : TEAM_HEADER[lang], body: personalize(msg.text, nameOf(u)), deepLink: teamLink(id) }
}

/** Crea el mensaje para una persona (dentro de la transacción del que lo manda) */
export async function createTeamMessage(tx: Tx, u: Target, msg: { title: string | null; text: string }) {
  const id = `${TEAM_PREFIX}u${randomBytes(9).toString('hex')}`
  const row = rowFor(u, id, msg)
  await tx.notification.create({ data: row })
  return { id, title: row.title, body: row.body, userId: u.id, lang: langOf(u.locale) }
}

/** Crea el mismo mensaje para muchas personas de una vez (envío a varios) */
export async function createTeamBatch(tx: Tx, users: Target[], msg: { title: string | null; text: string }, batch: string) {
  const rows = users.map((u, i) => rowFor(u, `${batchPrefix(batch)}${i.toString(36)}`, msg))
  for (let i = 0; i < rows.length; i += 1000) await tx.notification.createMany({ data: rows.slice(i, i + 1000) })
  return rows.map((r, i) => ({ id: r.id, title: r.title, body: r.body, userId: r.userId, lang: langOf(users[i].locale) }))
}

type Sent = Awaited<ReturnType<typeof createTeamMessage>>

/**
 * Avisos al móvil de los mensajes (después de responder: no retrasa al admin).
 * Con los límites de siempre: nada de 22:00 a 9:00 (su hora), 6 al día como mucho y 1 hora entre uno y otro.
 * Si no toca ahora, no se manda push: el mensaje igualmente le espera en la app.
 */
export function pushLater(sent: Sent[]) {
  if (!sent.length) return
  const run = () => pushTeam(sent).catch(e => console.error('team push', e))
  try {
    after(run)
  } catch {
    // fuera de una petición (scripts): se manda ahora
    void run()
  }
}

async function pushTeam(sent: Sent[]) {
  const now = new Date()
  const ids = [...new Set(sent.map(s => s.userId))]
  const users = await db.user.findMany({ where: { id: { in: ids }, blockedAt: null, pushSubs: { some: {} } }, select: { id: true, timezone: true, settings: true } })
  if (!users.length) return
  const recent = await db.event.findMany({ where: { name: 'push_sent', userId: { in: users.map(u => u.id) }, createdAt: { gte: new Date(now.getTime() - 24 * 3_600_000) } }, select: { userId: true, createdAt: true, props: true } })
  const queue = users.filter(u => {
    // Quien ha apagado todos los avisos del móvil en Ajustes no recibe este tampoco
    const p = (u.settings as { prefsTouched?: boolean; notificationPrefs?: Record<string, { push?: boolean }> } | null) ?? {}
    const prefs = Object.values(p.notificationPrefs ?? {})
    if (p.prefsTouched && prefs.length && prefs.every(x => x.push === false)) return false
    return !!pushSlot(u, now, recent)
  })
  const byUser = new Map(sent.map(s => [s.userId, s]))
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let u = queue.shift(); u; u = queue.shift()) {
        const s = byUser.get(u.id)
        if (!s) continue
        const custom = s.title !== TEAM_HEADER[s.lang]
        await sendPush(u.id, { title: custom ? s.title : TEAM_HEADER[s.lang], body: s.body.length > 170 ? s.body.slice(0, 168).trimEnd() + '…' : s.body, url: `/${s.lang}${teamLink(s.id)}`, kind: 'team', key: s.id }).catch(() => 0)
      }
    }),
  )
}

// ── Lo que ve la persona ─────────────────────────────────
export interface TeamMessageOut { id: string; header: string; title: string | null; text: string; at: string; read: boolean }

const toOut = (n: { id: string; title: string; body: string; createdAt: Date; readAt: Date | null }, lang: TeamLang): TeamMessageOut => {
  const header = TEAM_HEADER[lang]
  // Sin título propio, el aviso lleva la cabecera del equipo (en cualquiera de los idiomas): entonces no se repite
  const plain = Object.values(TEAM_HEADER).includes(n.title)
  return { id: n.id, header, title: plain ? null : n.title, text: n.body, at: n.createdAt.toISOString(), read: !!n.readAt }
}

/** Mensajes del equipo sin leer (los más antiguos primero, de los últimos 60 días): se enseñan al abrir la app */
export async function pendingTeamMessages() {
  const u = await requireUser()
  const rows = await db.notification.findMany({ where: { userId: u.id, readAt: null, id: { startsWith: TEAM_PREFIX }, createdAt: { gte: new Date(Date.now() - KEEP_DAYS * 86_400_000) } }, orderBy: { createdAt: 'asc' }, take: 5 })
  return { items: rows.map(r => toOut(r, langOf(u.locale))) }
}

/** Un mensaje concreto (al tocarlo en Avisos o en el aviso del móvil) */
export async function teamMessage(id: string) {
  const u = await requireUser()
  const n = await db.notification.findFirst({ where: { id, userId: u.id } })
  if (!n || !n.id.startsWith(TEAM_PREFIX)) fail(404, 'NOT_FOUND', 'Mensaje no encontrado')
  return toOut(n!, langOf(u.locale))
}

/** La persona ha visto el mensaje (cerró la ventana) */
export async function seenTeamMessage(id: string) {
  const u = await requireUser()
  if (!id.startsWith(TEAM_PREFIX)) fail(404, 'NOT_FOUND', 'Mensaje no encontrado')
  await db.notification.updateMany({ where: { id, userId: u.id, readAt: null }, data: { readAt: new Date() } })
}
