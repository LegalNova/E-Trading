import 'server-only'
// Mensajes del equipo desde el panel (solo ADMIN, nunca en «ver como»): a una persona o a varias.
// A varias: primero la vista previa (cuántas personas son), después el envío con ese mismo número
// (si ha cambiado entretanto, no se manda) y con límite de frecuencia. Todo queda en la auditoría.
import type { Prisma } from '@/generated/prisma/client'
import { addDays, dayOf } from '@/shared/time'
import { db } from '../db'
import { rateLimit } from '../http/ratelimit'
import { adminAction, audited, lockTarget, requireAdmin, run } from './admin'
import { batchPrefix, cleanMessage, createTeamBatch, createTeamMessage, newBatch, pushLater, TEAM_PREFIX } from './messages'
import { fail } from './core'

const DAY_MS = 86_400_000
export const AUDIENCES = ['ALL', 'NEW', 'INACTIVE'] as const
export interface Audience { kind: (typeof AUDIENCES)[number]; days?: number; lang?: 'es' | 'ca' | 'en' }
const MAX_RECIPIENTS = 5000
const BROADCAST_GAP_MIN = 2
const BROADCASTS_PER_DAY = 5

/** A una persona */
export async function sendToUser(userId: string, input: { title?: string; text: string }) {
  const a = await adminAction()
  const msg = cleanMessage(input.title, input.text)
  await rateLimit(`team-msg:${a.id}`, 40, 600)
  const sent = await run(async tx => {
    const u = await lockTarget(tx, userId)
    if (u.blockedAt) fail(409, 'CONFLICT', 'La cuenta está bloqueada: no verá el mensaje')
    // Dos clics seguidos no mandan dos mensajes iguales
    if (await tx.notification.count({ where: { userId, id: { startsWith: TEAM_PREFIX }, createdAt: { gte: new Date(Date.now() - 60_000) } } })) fail(429, 'RATE_LIMITED', 'Le has escrito hace un momento: espera un minuto')
    const s = await createTeamMessage(tx, u, msg)
    await audited(tx, a, 'TEAM_MESSAGE', userId, {}, { messageId: s.id, title: s.title, text: s.body })
    return s
  })
  pushLater([sent])
  return { id: sent.id }
}

/** Personas que recibirían un envío a varios: sin el equipo y sin cuentas bloqueadas */
function audienceWhere(a: Audience): Prisma.UserWhereInput {
  const days = a.days ?? 7
  const base: Prisma.UserWhereInput = { role: 'USER', blockedAt: null, ...(a.lang ? { locale: a.lang } : {}) }
  if (a.kind === 'NEW') return { ...base, createdAt: { gte: new Date(Date.now() - days * DAY_MS) } }
  if (a.kind === 'INACTIVE') {
    // Último día activo hace N días o más (y quien nunca ha tenido un día activo, si se registró antes)
    const cut = addDays(dayOf(), -days)
    const old = new Date(Date.now() - days * DAY_MS)
    return { ...base, OR: [{ game: { is: { lastActiveDay: { lte: cut } } } }, { game: { is: { lastActiveDay: null } }, createdAt: { lte: old } }, { game: { is: null }, createdAt: { lte: old } }] }
  }
  return base
}

function checkAudience(a: Audience) {
  if (a.kind !== 'ALL' && (!Number.isInteger(a.days) || a.days! < 1 || a.days! > 365)) fail(422, 'VALIDATION_ERROR', 'Elige entre 1 y 365 días')
}

/** Vista previa: cuántas personas son, cuántas tienen avisos en el móvil y unos nombres de ejemplo */
export async function audiencePreview(a: Audience) {
  await requireAdmin()
  checkAudience(a)
  const where = audienceWhere(a)
  const [count, withPush, sample] = await Promise.all([
    db.user.count({ where }),
    db.user.count({ where: { ...where, pushSubs: { some: {} } } }),
    db.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, email: true, isAnonymous: true } }),
  ])
  return { count, withPush, max: MAX_RECIPIENTS, sample: sample.map(s => (s.isAnonymous ? 'invitado' : s.name || s.email)) }
}

/** Envío a varios. `expected` = el número de la vista previa (si no coincide, no se manda nada) */
export async function broadcast(a0: Audience, input: { title?: string; text: string; expected: number }) {
  const a = await adminAction()
  checkAudience(a0)
  const msg = cleanMessage(input.title, input.text)
  await rateLimit(`team-bc:${a.id}`, 20, 3600)
  const out = await run(async tx => {
    // Un envío a varios cada vez (dos clics o dos pestañas a la vez esperan aquí)
    await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(hashtext('team-broadcast'))`)
    const last = await tx.auditLog.findFirst({ where: { action: 'TEAM_BROADCAST' }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
    if (last && Date.now() - last.createdAt.getTime() < BROADCAST_GAP_MIN * 60_000) fail(429, 'RATE_LIMITED', `Se acaba de hacer un envío a varios: espera ${BROADCAST_GAP_MIN} minutos`)
    const today = await tx.auditLog.count({ where: { action: 'TEAM_BROADCAST', createdAt: { gte: new Date(Date.now() - DAY_MS) } } })
    if (today >= BROADCASTS_PER_DAY) fail(429, 'RATE_LIMITED', `Como mucho ${BROADCASTS_PER_DAY} envíos a varios al día: así nadie se siente bombardeado`)
    const users = await tx.user.findMany({ where: audienceWhere(a0), orderBy: { createdAt: 'asc' }, take: MAX_RECIPIENTS + 1, select: { id: true, name: true, locale: true, isAnonymous: true } })
    if (!users.length) fail(422, 'VALIDATION_ERROR', 'No hay nadie con estos filtros')
    if (users.length > MAX_RECIPIENTS) fail(422, 'VALIDATION_ERROR', `Son más de ${MAX_RECIPIENTS} personas: afina los filtros`)
    if (users.length !== input.expected) fail(409, 'AUDIENCE_CHANGED', `La lista ha cambiado: ahora salen ${users.length} y en la vista previa había ${input.expected}. Revisa la vista previa y vuelve a enviar`)
    const batch = newBatch()
    const sent = await createTeamBatch(tx, users, msg, batch)
    await tx.auditLog.create({ data: { actorId: a.id, actor: a.email, action: 'TEAM_BROADCAST', entity: 'Broadcast', entityId: batch, before: {}, after: { audience: { kind: a0.kind, days: a0.kind === 'ALL' ? null : a0.days, lang: a0.lang ?? null }, title: msg.title, text: msg.text, count: users.length } } })
    return { batch, sent }
  })
  pushLater(out.sent)
  return { batch: out.batch, count: out.sent.length }
}

/** Historial: lo enviado (a una persona o a varias) y si se ha leído */
export async function messageHistory() {
  await requireAdmin()
  const rows = await db.auditLog.findMany({ where: { action: { in: ['TEAM_MESSAGE', 'TEAM_BROADCAST'] } }, orderBy: { createdAt: 'desc' }, take: 60 })
  type One = { messageId?: string; title?: string | null; text?: string; via?: string }
  type Many = { audience?: Audience & { days: number | null }; title?: string | null; text?: string; count?: number }
  const singles = rows.filter(r => r.action === 'TEAM_MESSAGE')
  const ids = singles.map(r => (r.after as One | null)?.messageId).filter((x): x is string => !!x)
  const [notes, users] = await Promise.all([
    db.notification.findMany({ where: { id: { in: ids } }, select: { id: true, readAt: true } }),
    db.user.findMany({ where: { id: { in: [...new Set(singles.map(r => r.entityId).filter((x): x is string => !!x))] } }, select: { id: true, name: true, email: true } }),
  ])
  const reads = new Map(notes.map(n => [n.id, n.readAt]))
  return Promise.all(
    rows.map(async r => {
      if (r.action === 'TEAM_MESSAGE') {
        const x = (r.after ?? {}) as One
        const u = users.find(v => v.id === r.entityId)
        const exists = !!x.messageId && reads.has(x.messageId)
        const readAt = x.messageId ? reads.get(x.messageId) : null
        return { id: r.id, kind: 'ONE' as const, at: r.createdAt.toISOString(), by: r.actor, title: x.title ?? null, text: x.text ?? '', via: x.via ?? null, user: u ? { id: u.id, name: u.name || '—', email: u.email } : null, count: 1, read: exists && readAt ? 1 : 0, readAt: readAt?.toISOString() ?? null, audience: null }
      }
      const x = (r.after ?? {}) as Many
      const prefix = batchPrefix(r.entityId ?? '')
      const [count, read] = r.entityId ? await Promise.all([db.notification.count({ where: { id: { startsWith: prefix } } }), db.notification.count({ where: { id: { startsWith: prefix }, readAt: { not: null } } })]) : [0, 0]
      return { id: r.id, kind: 'MANY' as const, at: r.createdAt.toISOString(), by: r.actor, title: x.title ?? null, text: x.text ?? '', via: null, user: null, count: x.count || count, read, readAt: null, audience: x.audience ? { kind: x.audience.kind, days: x.audience.days ?? null, lang: x.audience.lang ?? null } : null }
    }),
  )
}
