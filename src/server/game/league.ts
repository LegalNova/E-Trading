import 'server-only'
// Liga semanal (docs/02-gamificacion.md §Liga). Solo personas reales (D-019).
// - Todo el que usa la app en una semana entra en la liga: un único grupo para todos hasta 30 personas (luego se abre
//   otro). Los grupos mezclan divisiones; la división de cada uno sube o baja según su puesto. Semana = hora de Madrid.
// - Puntos = XP de la semana + 100 × rentabilidad ajustada por riesgo (tope ±2 %): estudiar pesa más.
// - Cierre (lunes): suben los 7 primeros (+30 gemas), bajan los puestos 26–30. Nadie baja de Novato ni sube de Experto.
import type { LeagueT } from '@/shared/contract'
import { addDays, weekOf } from '@/shared/time'
import { db } from '../db'
import { DIVISIONS } from '../content/catalog'
import { bump, checkAchievements, notify, withCtx, type Ctx, type Tx } from './core'

export const GROUP_SIZE = 30
export const PROMOTE_TOP = 7
export const DEMOTE_FROM = 26
export const PROMOTE_GEMS = 30

/** Semana de la liga: la misma para todos (hora de Madrid, igual que el cierre de los lunes),
 *  aunque cada persona tenga su zona horaria. Así nadie queda en una «semana» distinta a la de los demás. */
export const leagueWeekKey = () => weekOf(Date.now())

/** XP de la semana de la liga (si su semana local aún no ha cambiado, cuenta 0) */
const weekXpOf = (c: Ctx, weekKey: string) => (c.g.weekKey === weekKey ? c.g.weekXp : 0)

/** Asegura que quien usa la app esta semana está en la liga (y actualiza sus puntos) */
export async function ensureMembership(c: Ctx, evenWithoutXp = false) {
  const weekKey = leagueWeekKey()
  const xp = weekXpOf(c, weekKey)
  if (xp <= 0 && !evenWithoutXp) return
  const exists = await c.tx.leagueMember.findUnique({ where: { weekKey_userId: { weekKey, userId: c.user.id } } })
  if (exists) {
    if (exists.xp !== xp && exists.finalRank === null) await c.tx.leagueMember.update({ where: { weekKey_userId: { weekKey, userId: c.user.id } }, data: { xp } })
    return
  }
  // Un solo grupo para todos hasta llenarlo (30); entonces se abre el siguiente. Sin separar por división.
  const groups = await c.tx.leagueMember.groupBy({ by: ['groupNo'], where: { weekKey }, _count: { _all: true }, orderBy: { groupNo: 'asc' } })
  const open = groups.find(g => g._count._all < GROUP_SIZE)
  const groupNo = open ? open.groupNo : (groups.at(-1)?.groupNo ?? 0) + 1
  // createMany + skipDuplicates: si otra petición del mismo usuario lo crea a la vez, no falla
  await c.tx.leagueMember.createMany({ data: [{ weekKey, userId: c.user.id, division: c.g.division, groupNo, xp }], skipDuplicates: true })
}

/** Junta los grupos de la semana que caben en uno (por ejemplo, si una versión antigua los separó por división
 *  o si dos personas entraron a la vez en grupos distintos). Idempotente; no toca semanas ya cerradas. */
export async function compactWeek(tx: Tx, weekKey: string) {
  const groups = await tx.leagueMember.groupBy({ by: ['groupNo'], where: { weekKey }, _count: { _all: true }, orderBy: { groupNo: 'asc' } })
  if (groups.length < 2) return 0
  if (await tx.leagueWeek.findUnique({ where: { weekKey } })) return 0
  const sizes = groups.map(g => ({ no: g.groupNo, n: g._count._all }))
  let moved = 0
  for (let i = 0; i < sizes.length; i++) {
    for (let j = sizes.length - 1; j > i; j--) {
      if (sizes[j].n === 0 || sizes[i].n + sizes[j].n > GROUP_SIZE) continue
      const r = await tx.leagueMember.updateMany({ where: { weekKey, groupNo: sizes[j].no }, data: { groupNo: sizes[i].no } })
      sizes[i].n += r.count
      sizes[j].n = 0
      moved += r.count
    }
  }
  return moved
}

/** Rentabilidad semanal real (fotos diarias de la cartera) con penalización por concentración */
async function riskAdjusted(tx: Tx, userIds: string[], weekKey: string) {
  const [snaps, positions] = await Promise.all([
    tx.portfolioSnapshot.findMany({ where: { userId: { in: userIds }, day: { gte: addDays(weekKey, -1), lt: addDays(weekKey, 7) } }, orderBy: { day: 'asc' } }),
    tx.position.findMany({ where: { userId: { in: userIds } }, select: { userId: true, qty: true, avgPrice: true } }),
  ])
  const out = new Map<string, number>()
  for (const id of userIds) {
    const s = snaps.filter(x => x.userId === id)
    let r = s.length >= 2 ? (Number(s[s.length - 1].value) / Number(s[0].value) - 1) * 100 : 0
    // Concentración: si un solo activo es más del 40 % de lo invertido, las ganancias cuentan la mitad
    const pos = positions.filter(p => p.userId === id).map(p => Number(p.qty) * Number(p.avgPrice))
    const invested = pos.reduce((a, b) => a + b, 0)
    if (r > 0 && invested > 0 && Math.max(...pos) / invested > 0.4) r /= 2
    out.set(id, Math.round(r * 100) / 100)
  }
  return out
}

const score = (xp: number, r: number) => xp + Math.round(Math.max(-2, Math.min(2, r)) * 100)

function displayName(name: string, visible: boolean) {
  if (!visible) return 'Jugador anónimo'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0] || '—'
}

/** Clasificación de un grupo (la usan la pantalla y el cierre semanal) */
async function standings(tx: Tx, weekKey: string, groupNo: number) {
  const members = await tx.leagueMember.findMany({ where: { weekKey, groupNo } })
  const ids = members.map(m => m.userId)
  const [users, rets] = await Promise.all([
    tx.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, leagueVisible: true, blockedAt: true } }),
    riskAdjusted(tx, ids, weekKey),
  ])
  return ids
    .map(id => {
      const u = users.find(x => x.id === id)
      const xp = members.find(x => x.userId === id)?.xp ?? 0
      const r = rets.get(id) ?? 0
      return { userId: id, division: members.find(x => x.userId === id)?.division ?? 1, exists: !!u, name: u?.name ?? '', visible: u?.leagueVisible ?? true, blocked: !!u?.blockedAt, weeklyXp: xp, riskAdjReturnPct: r, score: score(xp, r) }
    })
    .filter(m => m.exists && !m.blocked)
    .sort((a, b) => b.score - a.score || b.weeklyXp - a.weeklyXp)
    .map((m, i) => ({ ...m, rank: i + 1 }))
}

export const league = () => withCtx(leagueFor)

/** Liga de la semana para el usuario del contexto (entra en su grupo si aún no estaba) */
export async function leagueFor(c: Ctx): Promise<LeagueT> {
  const weekKey = leagueWeekKey()
  const division = c.g.division
  // Quien abre la liga entra ya (con 0 puntos si aún no tiene): así todos los que se conectan se ven entre ellos
  await ensureMembership(c, true)
  await compactWeek(c.tx, weekKey)
  const me = await c.tx.leagueMember.findUnique({ where: { weekKey_userId: { weekKey, userId: c.user.id } } })
  const rows = me ? await standings(c.tx, weekKey, me.groupNo) : []
  const members = rows.map(m => ({ rank: m.rank, userId: m.userId, displayName: m.userId === c.user.id ? c.user.name || '—' : displayName(m.name, m.visible), weeklyXp: m.weeklyXp, riskAdjReturnPct: m.riskAdjReturnPct, score: m.score, isMe: m.userId === c.user.id, division: DIVISIONS[m.division - 1] }))
  if (!me) members.push({ rank: 0, userId: c.user.id, displayName: c.user.name || '—', weeklyXp: 0, riskAdjReturnPct: 0, score: 0, isMe: true, division: DIVISIONS[division - 1] })
  return { division: { id: `d${division}`, name: DIVISIONS[division - 1], order: division }, divisions: DIVISIONS, endsAt: new Date(addDays(weekKey, 7) + 'T00:00:00Z').toISOString(), promoteTop: PROMOTE_TOP, demoteFrom: DEMOTE_FROM, members }
}

/** Cierra la semana indicada (idempotente: solo una vez por semana) */
export async function closeWeek(weekKey: string) {
  const already = await db.leagueWeek.findUnique({ where: { weekKey } })
  if (already) return { weekKey, closed: false, groups: 0 }
  await db.leagueWeek.create({ data: { weekKey } }) // marca primero: si se ejecuta dos veces a la vez, la segunda falla
  const groups = await db.leagueMember.groupBy({ by: ['groupNo'], where: { weekKey } })
  for (const g of groups) {
    const rows = await standings(db, weekKey, g.groupNo)
    for (const m of rows) {
      const up = m.rank <= PROMOTE_TOP && m.division < DIVISIONS.length && m.weeklyXp > 0
      const down = m.rank >= DEMOTE_FROM && m.division > 1
      const outcome = up ? 'UP' : down ? 'DOWN' : 'STAY'
      await db.leagueMember.update({ where: { weekKey_userId: { weekKey, userId: m.userId } }, data: { finalRank: m.rank, outcome } })
      const user = await db.user.findUnique({ where: { id: m.userId } })
      if (!user) continue
      await withCtx(async c => {
        if (up) {
          c.g.division = m.division + 1
          c.g.gems += PROMOTE_GEMS
          bump(c, 'leagueUp')
        }
        if (down) c.g.division = m.division - 1
        if (m.rank <= 3 && m.weeklyXp > 0) bump(c, 'top3')
        if (m.riskAdjReturnPct > 0) bump(c, 'weekPositive')
        const name = DIVISIONS[c.g.division - 1]
        await notify(c, 'LEAGUE_RESULT', `Semana cerrada: puesto ${m.rank} de ${rows.length}`, up ? `¡Subes a ${name}! +${PROMOTE_GEMS} gemas.` : down ? `Bajas a ${name}. Esta semana, a recuperar.` : `Sigues en ${name}.`, '/liga')
        await checkAchievements(c)
      }, user)
    }
  }
  return { weekKey, closed: true, groups: groups.length }
}
