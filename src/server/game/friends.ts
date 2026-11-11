import 'server-only'
// Ligas de amigos (gratis para todos). Se crean con un nombre y se entra con un código de 8 caracteres
// (o con el enlace /liga/unirse/<código>, que además lleva el código de invitación de quien lo comparte).
//  · Como mucho 5 ligas creadas por persona, 10 ligas en las que estar y 100 miembros por liga (friend-leagues.ts).
//  · Dos clasificaciones: «Esta semana» (los puntos de la liga general, league.ts) y «Temporada del mes»
//    (rentabilidad del mes con las mismas reglas). Arriba, el campeón del mes anterior.
//  · Nadie ve una liga a la que no pertenece: para todo lo demás, una liga ajena «no existe» (404).
//  · Los nombres siguen la preferencia leagueVisible, como en la liga general. No hay premios de dinero.
import { createHmac, randomInt } from 'node:crypto'
import { db, DB_SCHEMA } from '../db'
import type { FriendLeaguePeekT, FriendLeaguesT, FriendLeagueT, FriendMonthRowT, FriendWeekRowT } from '@/shared/contract'
import { CODE_ALPHABET, CODE_LEN, cleanName, isValidCode, isValidName, MAX_JOINED, MAX_MEMBERS, MAX_OWNED, NAME_MAX, NAME_MIN, normalizeCode } from '@/shared/friend-leagues'
import { fail, withCtx, type Ctx, type Tx } from './core'
import { displayName, ensureMembership, lastSeasonWinners, seasonOf, weekStandingsOf } from './league'
import { monthStart, monthOf } from '@/shared/league-points'

type Loc = 'es' | 'ca' | 'en'
const locOf = (l: string | null | undefined): Loc => (l === 'ca' || l === 'en' ? l : 'es')

/** Identificador del miembro dentro de una liga: no deja adivinar su cuenta (y cambia de una liga a otra) */
const memberKey = (leagueId: string, userId: string) =>
  createHmac('sha256', process.env.BETTER_AUTH_SECRET ?? 'lumi-friends').update(`${leagueId}:${userId}`).digest('base64url').slice(0, 16)

function newCode() {
  return Array.from({ length: CODE_LEN }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')
}

function validName(raw: string) {
  const name = cleanName(raw)
  if (!isValidName(name)) fail(422, 'INVALID_NAME', `El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres.`)
  return name
}

function validCode(raw: string) {
  const code = normalizeCode(raw)
  if (!isValidCode(code)) fail(422, 'INVALID_CODE', 'El código tiene 8 letras y números (sin O, I, L, 0 ni 1). Revísalo.')
  return code
}

/** Solo para miembros: si no lo es (o la liga no existe), la respuesta es la misma */
async function membership(c: Ctx, leagueId: string) {
  const m = await c.tx.privateLeagueMember.findUnique({ where: { leagueId_userId: { leagueId, userId: c.user.id } }, include: { league: true } })
  if (!m) fail(404, 'LEAGUE_NOT_FOUND', 'Esta liga no existe o ya no estás en ella.')
  return m!.league
}

async function ownLeague(c: Ctx, leagueId: string) {
  const league = await membership(c, leagueId)
  if (league.ownerId !== c.user.id) fail(403, 'NOT_OWNER', 'Solo quien creó la liga puede hacer esto.')
  return league
}

/** Bloquea la fila de la liga: dos personas que entran a la vez no pasan del máximo de miembros */
const lockLeague = (tx: Tx, id: string) => tx.$queryRawUnsafe(`SELECT 1 FROM "${DB_SCHEMA}"."PrivateLeague" WHERE "id" = $1 FOR UPDATE`, id)

// ── Avisos (en el idioma de cada persona) ───────────────
const TXT = {
  joined: {
    es: (who: string, league: string, n: number) => [`${who} se ha unido a «${league}»`, `Ya sois ${n} en la liga. Mira cómo va la clasificación.`],
    ca: (who: string, league: string, n: number) => [`${who} s'ha unit a «${league}»`, `Ja sou ${n} a la lliga. Mira com va la classificació.`],
    en: (who: string, league: string, n: number) => [`${who} joined “${league}”`, `There are ${n} of you in the league now. See how the standings look.`],
  },
  closed: {
    es: (league: string) => [`La liga «${league}» se ha cerrado`, 'Quien la creó la ha borrado. Puedes crear la tuya desde la pestaña Liga.'],
    ca: (league: string) => [`La lliga «${league}» s'ha tancat`, "Qui la va crear l'ha esborrada. Pots crear la teva des de la pestanya Lliga."],
    en: (league: string) => [`The league “${league}” has been closed`, 'Its creator deleted it. You can create your own from the League tab.'],
  },
  owner: {
    es: (league: string) => [`Ahora gestionas «${league}»`, 'Quien la creó ha salido de la liga y te ha tocado a ti: puedes cambiarle el nombre, invitar y quitar miembros.'],
    ca: (league: string) => [`Ara gestiones «${league}»`, "Qui la va crear ha sortit de la lliga i t'ha tocat a tu: pots canviar-li el nom, convidar i treure membres."],
    en: (league: string) => [`You now manage “${league}”`, 'Its creator left the league, so it passed to you: you can rename it, invite people and remove members.'],
  },
} as const

type Recipient = { id: string; locale: string; settings: unknown }
const wantsLeagueNews = (u: Recipient) => (u.settings as { notificationPrefs?: Record<string, { inApp?: boolean }> } | null)?.notificationPrefs?.LEAGUE_RESULT?.inApp !== false

async function tell(tx: Tx, to: Recipient[], text: (l: Loc) => readonly string[], deepLink: string, dedupe = false) {
  let list = to.filter(wantsLeagueNews)
  if (!list.length) return
  if (dedupe) {
    // Quien entra y sale varias veces no llena de avisos a los demás: como mucho uno igual por persona y día
    const title = (l: Loc) => text(l)[0]
    const since = new Date(Date.now() - 86_400_000)
    const seen = await tx.notification.findMany({ where: { userId: { in: list.map(u => u.id) }, deepLink, createdAt: { gte: since } }, select: { userId: true, title: true } })
    list = list.filter(u => !seen.some(s => s.userId === u.id && s.title === title(locOf(u.locale))))
  }
  if (list.length) await tx.notification.createMany({ data: list.map(u => ({ userId: u.id, type: 'LEAGUE_RESULT', title: text(locOf(u.locale))[0], body: text(locOf(u.locale))[1], deepLink })) })
}

const leagueLink = (id: string) => `/liga?liga=${id}`
/** Acción del registro cuando quien creó la liga quita a alguien */
const REMOVED = 'FRIEND_LEAGUE_REMOVE'

// ── Mis ligas ────────────────────────────────────────────
async function listIn(c: Ctx): Promise<FriendLeaguesT> {
  const rows = await c.tx.privateLeagueMember.findMany({
    where: { userId: c.user.id },
    orderBy: { joinedAt: 'asc' },
    select: { league: { select: { id: true, name: true, ownerId: true, _count: { select: { members: true } } } } },
  })
  return {
    leagues: rows.map(r => ({ id: r.league.id, name: r.league.name, members: r.league._count.members, isOwner: r.league.ownerId === c.user.id })),
    owned: rows.filter(r => r.league.ownerId === c.user.id).length,
    maxOwned: MAX_OWNED,
    maxJoined: MAX_JOINED,
    maxMembers: MAX_MEMBERS,
    canCreate: !c.user.isAnonymous,
  }
}
export const myLeagues = () => withCtx(listIn)

export const createLeague = (rawName: string) =>
  withCtx(async c => {
    if (c.user.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para crear una liga.')
    const name = validName(rawName)
    // El usuario está bloqueado en esta transacción (withCtx): dos creaciones a la vez no se saltan los límites
    const mine = await c.tx.privateLeagueMember.findMany({ where: { userId: c.user.id }, select: { league: { select: { ownerId: true } } } })
    if (mine.filter(m => m.league.ownerId === c.user.id).length >= MAX_OWNED) fail(409, 'OWN_LIMIT', `Ya has creado ${MAX_OWNED} ligas, el máximo. Borra una para crear otra.`)
    if (mine.length >= MAX_JOINED) fail(409, 'JOIN_LIMIT', `Ya estás en ${MAX_JOINED} ligas, el máximo. Sal de alguna para crear otra.`)
    let code = newCode()
    for (let i = 0; i < 5 && (await c.tx.privateLeague.findUnique({ where: { code }, select: { id: true } })); i++) code = newCode()
    const league = await c.tx.privateLeague.create({ data: { name, code, ownerId: c.user.id, members: { create: { userId: c.user.id } } } })
    return { id: league.id, name: league.name, code: league.code }
  })

export const joinLeague = (rawCode: string) =>
  withCtx(async c => {
    const code = validCode(rawCode)
    const league = await c.tx.privateLeague.findUnique({ where: { code } })
    if (!league) fail(404, 'LEAGUE_NOT_FOUND', 'No hay ninguna liga con ese código. Revisa que esté bien escrito.')
    const l = league!
    if (await c.tx.privateLeagueMember.findUnique({ where: { leagueId_userId: { leagueId: l.id, userId: c.user.id } } })) return { id: l.id, name: l.name, already: true }
    if (await c.tx.auditLog.count({ where: { action: REMOVED, entityId: l.id, after: { path: ['userId'], equals: c.user.id } } })) fail(403, 'REMOVED_FROM_LEAGUE', 'Quien creó esta liga te ha quitado de ella, así que no puedes volver a entrar.')
    if ((await c.tx.privateLeagueMember.count({ where: { userId: c.user.id } })) >= MAX_JOINED) fail(409, 'JOIN_LIMIT', `Ya estás en ${MAX_JOINED} ligas, el máximo. Sal de alguna para unirte a esta.`)
    await lockLeague(c.tx, l.id)
    const others = await c.tx.privateLeagueMember.findMany({ where: { leagueId: l.id }, select: { user: { select: { id: true, locale: true, settings: true } } } })
    if (others.length >= MAX_MEMBERS) fail(409, 'LEAGUE_FULL', `Esta liga ya tiene ${MAX_MEMBERS} miembros, el máximo.`)
    await c.tx.privateLeagueMember.createMany({ data: [{ leagueId: l.id, userId: c.user.id }], skipDuplicates: true })
    const n = others.length + 1
    await tell(c.tx, others.map(o => o.user), loc => TXT.joined[loc](displayName(c.user.name, c.user.leagueVisible, loc), l.name, n), leagueLink(l.id), true)
    return { id: l.id, name: l.name, already: false }
  })

/** Para el enlace de unirse, sin sesión: el nombre de la liga y cuántos son (quien tiene el código puede entrar igualmente) */
export async function peekLeague(rawCode: string): Promise<FriendLeaguePeekT> {
  const code = normalizeCode(rawCode)
  if (!isValidCode(code)) return { valid: false, name: null, members: 0, full: false }
  const league = await db.privateLeague.findUnique({ where: { code }, select: { name: true, _count: { select: { members: true } } } })
  if (!league) return { valid: false, name: null, members: 0, full: false }
  return { valid: true, name: league.name, members: league._count.members, full: league._count.members >= MAX_MEMBERS }
}

export const renameLeague = (id: string, rawName: string) =>
  withCtx(async c => {
    await ownLeague(c, id)
    const name = validName(rawName)
    await c.tx.privateLeague.update({ where: { id }, data: { name } })
    return { id, name }
  })

export const removeMember = (id: string, key: string) =>
  withCtx(async c => {
    const league = await ownLeague(c, id)
    await lockLeague(c.tx, id)
    const members = await c.tx.privateLeagueMember.findMany({ where: { leagueId: id }, select: { userId: true } })
    const target = members.find(m => memberKey(id, m.userId) === key)
    if (!target) fail(404, 'MEMBER_NOT_FOUND', 'Esa persona ya no está en la liga.')
    if (target!.userId === league.ownerId) fail(422, 'CANNOT_REMOVE_OWNER', 'No puedes quitarte a ti: si quieres, borra la liga.')
    await c.tx.privateLeagueMember.deleteMany({ where: { leagueId: id, userId: target!.userId } })
    // Queda apuntado (también sirve de registro): con el código no puede volver a entrar
    await c.tx.auditLog.create({ data: { actorId: c.user.id, actor: c.user.email, action: REMOVED, entity: 'PrivateLeague', entityId: id, after: { userId: target!.userId } } })
  })

export const deleteLeague = (id: string) =>
  withCtx(async c => {
    const league = await ownLeague(c, id)
    await lockLeague(c.tx, id)
    const others = await c.tx.privateLeagueMember.findMany({ where: { leagueId: id, userId: { not: c.user.id } }, select: { user: { select: { id: true, locale: true, settings: true } } } })
    await c.tx.privateLeague.delete({ where: { id } })
    await tell(c.tx, others.map(o => o.user), loc => TXT.closed[loc](league.name), '/liga')
  })

/** Salir. Si sale quien la creó, la liga pasa a quien lleva más tiempo en ella (o se borra si no queda nadie) */
export const leaveLeague = (id: string) =>
  withCtx(async c => {
    const league = await membership(c, id)
    await lockLeague(c.tx, id)
    if (league.ownerId === c.user.id) await handOverLeague(c.tx, id, league.name, c.user.id)
    await c.tx.privateLeagueMember.deleteMany({ where: { leagueId: id, userId: c.user.id } })
  })

/** Antes de borrar una cuenta: sus ligas pasan a quien lleve más tiempo en cada una (si no, se borrarían en cascada
 *  para todos sin avisar). Las que se quedan sin nadie se borran. */
export async function handOverLeagues(tx: Tx, userId: string) {
  const owned = await tx.privateLeague.findMany({ where: { ownerId: userId }, select: { id: true, name: true } })
  for (const l of owned) {
    await lockLeague(tx, l.id)
    await handOverLeague(tx, l.id, l.name, userId)
  }
}

/** La liga pasa a quien lleve más tiempo en ella (sin contar a quien se va ni cuentas bloqueadas); sin nadie, se borra */
async function handOverLeague(tx: Tx, id: string, name: string, from: string) {
  const next = await tx.privateLeagueMember.findFirst({ where: { leagueId: id, userId: { not: from }, user: { blockedAt: null } }, orderBy: [{ joinedAt: 'asc' }, { userId: 'asc' }], select: { user: { select: { id: true, locale: true, settings: true } } } })
  if (!next) {
    await tx.privateLeague.delete({ where: { id } })
    return
  }
  await tx.privateLeague.update({ where: { id }, data: { ownerId: next.user.id } })
  await tell(tx, [next.user], loc => TXT.owner[loc](name), leagueLink(id))
}

// ── Una liga: miembros y las dos clasificaciones ────────
export const leagueDetail = (id: string) =>
  withCtx(async (c): Promise<FriendLeagueT> => {
    const league = await membership(c, id)
    // Como al abrir la liga general: quien mira entra en la semana con sus puntos al día (y con su base del mes)
    await ensureMembership(c, true)
    const rows = await c.tx.privateLeagueMember.findMany({ where: { leagueId: id }, orderBy: { joinedAt: 'asc' }, select: { joinedAt: true, user: { select: { id: true, name: true, leagueVisible: true, blockedAt: true } } } })
    const members = rows.filter(r => !r.user.blockedAt)
    const ids = members.map(m => m.user.id)
    const me = c.user.id
    const nameOf = (u: { id: string; name: string; leagueVisible: boolean }) => (u.id === me ? c.user.name || '—' : displayName(u.name, u.leagueVisible))
    const keyOf = (userId: string) => memberKey(id, userId)

    // Esta semana: puntos de la liga general; quien aún no ha entrado esta semana, con 0
    const week = await weekStandingsOf(c.tx, ids)
    const scored = new Map(week.rows.map((r, i) => [r.userId, { ...r, pos: i }]))
    // Mismo orden que la liga general (con sus desempates); quien aún no ha entrado esta semana, detrás
    const weekRows: FriendWeekRowT[] = members
      .map(m => {
        const r = scored.get(m.user.id)
        return { key: keyOf(m.user.id), rank: 0, displayName: nameOf(m.user), weeklyXp: r?.weeklyXp ?? 0, tradePts: r?.tradePts ?? 0, riskAdjReturnPct: r?.riskAdjReturnPct ?? 0, score: r?.score ?? 0, isMe: m.user.id === me, pos: r?.pos ?? Number.MAX_SAFE_INTEGER }
      })
      .sort((a, b) => b.score - a.score || b.weeklyXp - a.weeklyXp || a.pos - b.pos)
      .map((r, i) => ({ key: r.key, rank: i + 1, displayName: r.displayName, weeklyXp: r.weeklyXp, tradePts: r.tradePts, riskAdjReturnPct: r.riskAdjReturnPct, score: r.score, isMe: r.isMe }))

    // Temporada del mes: misma rentabilidad = mismo puesto
    const season = await seasonOf(c.tx, ids)
    const sorted = members
      .map(m => ({ key: keyOf(m.user.id), displayName: nameOf(m.user), pct: season.rows.get(m.user.id)?.pct ?? 0, concentrated: season.rows.get(m.user.id)?.concentrated ?? false, isMe: m.user.id === me }))
      .sort((a, b) => b.pct - a.pct || a.displayName.localeCompare(b.displayName))
    const monthRows: FriendMonthRowT[] = sorted.map((r, i) => ({ ...r, rank: i > 0 && sorted[i - 1].pct === r.pct ? 0 : i + 1 }))
    for (let i = 1; i < monthRows.length; i++) if (!monthRows[i].rank) monthRows[i].rank = monthRows[i - 1].rank

    // Campeón del mes anterior: entre quienes ya estaban en la liga ese mes
    const start = monthStart(monthOf()).getTime()
    const before = members.filter(m => m.joinedAt.getTime() < start).map(m => m.user.id)
    const won = await lastSeasonWinners(c.tx, before)
    const champion = won.userIds.length ? { month: won.month, pct: won.pct, names: won.userIds.map(uid => nameOf(members.find(m => m.user.id === uid)!.user)), isMe: won.userIds.includes(me) } : null

    const owner = rows.find(r => r.user.id === league.ownerId)?.user
    return {
      id,
      name: league.name,
      code: league.code,
      isOwner: league.ownerId === me,
      ownerName: owner ? nameOf(owner) : '—',
      maxMembers: MAX_MEMBERS,
      members: members.map(m => ({ key: keyOf(m.user.id), displayName: nameOf(m.user), isMe: m.user.id === me, isOwner: m.user.id === league.ownerId })),
      week: { endsAt: week.endsAt.toISOString(), rows: weekRows },
      month: { month: season.month, endsAt: season.endsAt.toISOString(), rows: monthRows },
      champion,
    }
  })
