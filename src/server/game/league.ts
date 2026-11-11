import 'server-only'
// Liga semanal (docs/02-gamificacion.md §Liga). Solo personas reales (D-019).
// - Todo el que usa la app en una semana entra en la liga: un único grupo para todos hasta 30 personas (luego se abre
//   otro). Los grupos mezclan divisiones; la división de cada uno sube o baja según su puesto. Semana = hora de Madrid.
// - Puntos = XP de la semana + puntos de inversión (rentabilidad de la cartera en la semana):
//   +10 por cada +1 % y −10 por cada −1 %, con tope de ±100 (un 10 %). Estudiar sigue pesando más (una clase ≈ 100 XP).
//   Si más del 40 % de lo invertido está en una sola acción (los fondos y ETF no cuentan), las ganancias valen la mitad:
//   jugárselo todo a una carta no sale a cuenta; las pérdidas cuentan enteras. El total nunca baja de 0.
//   Cuenta la cartera de ahora y la que había antes de cada venta de la semana (pasarlo todo a efectivo antes del
//   cierre no borra que se concentró; comprar poco a poco para diversificar no penaliza).
//   El dinero que entra o sale sin invertir (el saldo extra de Max, un reinicio de cartera) no es rentabilidad.
// - Cierre (lunes): con el grupo lleno (30) suben los 7 primeros (+30 gemas) y bajan los puestos 26–30; con menos gente,
//   en proporción (leagueZones en league-points.ts: sube al menos 1 y no baja nadie en grupos de menos de 6).
//   Para subir hace falta algo de XP en la semana. Nadie baja de Novato ni sube de Experto.
//   Empates: más XP; luego quien entró antes en la liga esa semana.
// - Ligas de amigos (friends.ts): «Esta semana» usa estos mismos puntos; «Temporada del mes» usa la rentabilidad del mes
//   natural de Madrid con las mismas reglas (tope ±10 %, concentrada = ganancias a la mitad). Base del mes: MonthBase,
//   que se apunta la primera vez que la persona usa la app ese mes (o la foto del último día del mes anterior).
import type { LeagueT } from '@/shared/contract'
import type { LeagueMember } from '@/generated/prisma/client'
import { addDays, DAY_MS, dayOf, weekOf } from '@/shared/time'
import { db } from '../db'
import { currentLocale } from '../locale'
import { DIVISIONS } from '../content/catalog'
import { bump, checkAchievements, notify, START_CASH, withCtx, type Ctx, type Tx } from './core'
import { priceBook } from './trading'
import { byStanding, FULL_GROUP, lastDayOf, leagueZones, madridMidnight, monthOf, monthReturnPct, monthStart, nextMonth, prevMonth, score, seasonPct, tradePoints, weekOutcome, weekReturnPct } from '@/shared/league-points'

export const GROUP_SIZE = FULL_GROUP
export const PROMOTE_GEMS = 30
/** Más de este peso en una sola acción (sin contar fondos/ETF) = cartera concentrada */
const CONCENTRATED = 0.4

/** Semana de la liga: la misma para todos (hora de Madrid, igual que el cierre de los lunes),
 *  aunque cada persona tenga su zona horaria. Así nadie queda en una «semana» distinta a la de los demás. */
export const leagueWeekKey = () => weekOf(Date.now())

/** XP de la semana de la liga (si su semana local aún no ha cambiado, cuenta 0) */
const weekXpOf = (c: Ctx, weekKey: string) => (c.g.weekKey === weekKey ? c.g.weekXp : 0)

/** Asegura que quien usa la app esta semana está en la liga (y actualiza sus puntos) */
export async function ensureMembership(c: Ctx, evenWithoutXp = false) {
  await ensureMonthBase(c)
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
  // Base de la rentabilidad: lo que vale su cartera al entrar en la liga esta semana
  // (sin cartera todavía: se creará con el saldo inicial de su plan)
  const startValue = (await portfolioValues(c.tx, [c.user.id])).get(c.user.id)?.value ?? START_CASH[c.user.plan]
  await c.tx.leagueMember.createMany({ data: [{ weekKey, userId: c.user.id, division: c.g.division, groupNo, xp, startValue }], skipDuplicates: true })
}

/** Dinero que entra o sale de la cartera sin ser inversión (saldo extra de Max, reinicio): no cuenta como rentabilidad */
export async function addFlow(tx: Tx, userId: string, amount: number) {
  if (!amount || !Number.isFinite(amount)) return
  const flow = Math.round(amount * 100) / 100
  // La semana actual y cualquier semana aún sin cerrar (el lunes, entre las 00:00 y el cierre): su rentabilidad se mide
  // con el valor de la cartera al cerrar, así que un reinicio hecho en ese rato tampoco puede borrar lo perdido
  await tx.leagueMember.updateMany({ where: { userId, finalRank: null, weekKey: { lte: leagueWeekKey() } }, data: { flows: { increment: flow } } })
  // Temporada del mes: igual. Si aún no tiene base este mes pero hay foto del último día del mes anterior, la base es
  // esa foto (anterior a este dinero) y el dinero se apunta como entrada. Sin foto, no se apunta nada: la base se
  // tomará más tarde con el valor de después (que ya incluye este dinero), así que tampoco cuenta como rentabilidad.
  const month = monthOf()
  const up = await tx.monthBase.updateMany({ where: { userId, month }, data: { flows: { increment: flow } } })
  if (up.count) return
  const snap = await tx.portfolioSnapshot.findUnique({ where: { userId_day: { userId, day: lastDayOf(prevMonth(month)) } } })
  if (!snap) return
  const made = await tx.monthBase.createMany({ data: [{ userId, month, startValue: snap.value, flows: flow }], skipDuplicates: true })
  // Otra petición la acaba de crear: entonces se suma ahí
  if (!made.count) await tx.monthBase.updateMany({ where: { userId, month }, data: { flows: { increment: flow } } })
}

// ── Base del mes (temporada de las ligas de amigos) ─────
const monthNo = (month: string) => Number(month.replace('-', ''))

/** La primera vez que la persona usa la app en el mes se apunta su base (una vez por mes, con un contador) */
async function ensureMonthBase(c: Ctx) {
  const month = monthOf()
  if (c.counters.monthBase === monthNo(month)) return
  const got = await monthBases(c.tx, [c.user.id], month)
  // Sin cartera todavía (bienvenida a medias): se vuelve a mirar en la siguiente petición
  if (got.has(c.user.id)) c.counters.monthBase = monthNo(month)
}

/** Bases del mes de varias personas; crea las que faltan. Quien ya tenía cartera parte de la foto del último día del mes
 *  anterior; si no hay foto, de lo que vale ahora. Sin cartera no hay base (sale con 0 %). */
export async function monthBases(tx: Tx, userIds: string[], month = monthOf()) {
  const out = new Map<string, { startValue: number; flows: number; createdAt: Date }>()
  if (!userIds.length) return out
  const have = await tx.monthBase.findMany({ where: { month, userId: { in: userIds } } })
  const missing = userIds.filter(id => !have.some(h => h.userId === id))
  if (missing.length && month === monthOf()) {
    const [snaps, values] = await Promise.all([tx.portfolioSnapshot.findMany({ where: { userId: { in: missing }, day: lastDayOf(prevMonth(month)) } }), portfolioValues(tx, missing)])
    const data = missing.flatMap(userId => {
      const snap = snaps.find(s => s.userId === userId)
      const v = snap ? Number(snap.value) : values.get(userId)?.value
      return v === undefined ? [] : [{ userId, month, startValue: v }]
    })
    if (data.length) {
      await tx.monthBase.createMany({ data, skipDuplicates: true })
      have.push(...(await tx.monthBase.findMany({ where: { month, userId: { in: data.map(d => d.userId) } } })))
    }
  }
  for (const b of have) out.set(b.userId, { startValue: Number(b.startValue), flows: Number(b.flows), createdAt: b.createdAt })
  return out
}

/** Marca en los contadores de la persona que esta semana tuvo la cartera concentrada antes de vender
 *  (se llama tras operar con el número de operaciones hechas). Comprar poco a poco para diversificar no marca:
 *  solo cuenta la cartera que había justo antes de cada venta. Una clave por semana (conc_20261102). */
const concKey = (weekKey: string) => `conc_${weekKey.replaceAll('-', '')}`
/** Lo mismo para la temporada del mes (concm_202611) */
const concMonthKey = (month: string) => `concm_${monthNo(month)}`
export async function noteConcentration(c: Ctx, trades: number) {
  const weekKey = leagueWeekKey()
  const key = concKey(weekKey)
  const mkey = concMonthKey(monthOf())
  if (c.counters[key] && c.counters[mkey]) return
  const recent = await c.tx.trade.findMany({ where: { userId: c.user.id, status: 'FILLED' }, orderBy: { createdAt: 'desc' }, take: trades, select: { side: true, symbol: true, qty: true } })
  const sold = recent.filter(t => t.side === 'SELL')
  if (!sold.length) return
  // Cartera de antes de las ventas: la de ahora más lo vendido
  const now = await c.tx.position.findMany({ where: { userId: c.user.id }, select: { symbol: true, qty: true, avgPrice: true } })
  const before = new Map(now.map(p => [p.symbol, { qty: Number(p.qty), avgPrice: Number(p.avgPrice) }]))
  for (const t of sold) {
    const p = before.get(t.symbol)
    before.set(t.symbol, { qty: (p?.qty ?? 0) + Number(t.qty), avgPrice: p?.avgPrice ?? 0 })
  }
  const book = await priceBook([...before.keys()])
  if (!isConcentrated([...before].map(([symbol, p]) => ({ symbol, ...p })), book)) return
  const keep = concKey(addDays(weekKey, -7))
  const keepMonth = concMonthKey(prevMonth(monthOf()))
  for (const k of Object.keys(c.counters)) if ((k.startsWith('conc_') && k < keep) || (k.startsWith('concm_') && k < keepMonth)) delete c.counters[k]
  c.counters[key] = 1
  c.counters[mkey] = 1
}

type Held = { symbol: string; qty: number; avgPrice: number }
/** Valor de lo invertido y si más del 40 % está en una sola acción (sin precio: a coste, nunca inventado) */
function holdings(items: Held[], book: Awaited<ReturnType<typeof priceBook>>) {
  const mine = items.map(p => {
    const px = book.get(p.symbol)
    return { v: p.qty * (px ? px.eur : p.avgPrice), single: !px || (px.type !== 'ETF' && px.type !== 'INDEX') }
  })
  const invested = mine.reduce((a, x) => a + x.v, 0)
  const biggestSingle = Math.max(0, ...mine.filter(x => x.single).map(x => x.v))
  return { invested, concentrated: invested > 0 && biggestSingle / invested > CONCENTRATED }
}
const isConcentrated = (items: Held[], book: Awaited<ReturnType<typeof priceBook>>) => holdings(items, book).concentrated

/** Valor actual de la cartera de varias personas (precios guardados; sin precio, a coste: nunca inventado) */
export async function portfolioValues(tx: Tx, userIds: string[]) {
  const [pfs, positions] = await Promise.all([
    tx.portfolio.findMany({ where: { userId: { in: userIds } }, select: { userId: true, cash: true } }),
    tx.position.findMany({ where: { userId: { in: userIds } }, select: { userId: true, symbol: true, qty: true, avgPrice: true } }),
  ])
  const book = positions.length ? await priceBook(positions.map(p => p.symbol)) : new Map()
  const out = new Map<string, { value: number; concentrated: boolean }>()
  for (const pf of pfs) {
    const h = holdings(positions.filter(p => p.userId === pf.userId).map(p => ({ symbol: p.symbol, qty: Number(p.qty), avgPrice: Number(p.avgPrice) })), book)
    out.set(pf.userId, { value: Number(pf.cash) + h.invested, concentrated: h.concentrated })
  }
  return out
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

/** Rentabilidad de la semana y puntos de inversión de cada miembro. A quien entró antes de que existiera la base
 *  se le pone una: la última foto de su cartera antes de la semana (o su valor de ahora, sin entradas de dinero). */
async function returnsOf(tx: Tx, weekKey: string, members: { userId: string; startValue: unknown; flows: unknown; finalRank: number | null; tradePts: number }[]) {
  const ids = members.map(m => m.userId)
  const [values, states] = await Promise.all([portfolioValues(tx, ids), tx.gameState.findMany({ where: { userId: { in: ids } }, select: { userId: true, counters: true } })])
  // Concentrada ahora o en algún momento de la semana después de operar
  const concWeek = new Set(states.filter(g => (g.counters as Record<string, number> | null)?.[concKey(weekKey)]).map(g => g.userId))
  const out = new Map<string, { pct: number; pts: number }>()
  for (const m of members) {
    const v = values.get(m.userId)
    if (!v) {
      out.set(m.userId, { pct: 0, pts: 0 })
      continue
    }
    let start = m.startValue === null ? null : Number(m.startValue)
    let flows = Number(m.flows)
    if (start === null) {
      const snap = await tx.portfolioSnapshot.findFirst({ where: { userId: m.userId, day: { lt: weekKey } }, orderBy: { day: 'desc' } })
      start = snap ? Number(snap.value) : v.value
      if (!snap) flows = 0
      await tx.leagueMember.updateMany({ where: { weekKey, userId: m.userId, startValue: null }, data: { startValue: start, flows } })
    }
    const pct = weekReturnPct(start, v.value, flows)
    out.set(m.userId, { pct, pts: m.finalRank !== null ? m.tradePts : tradePoints(pct, v.concentrated || concWeek.has(m.userId)) })
  }
  return out
}


const ANON = { es: 'Jugador anónimo', ca: 'Jugador anònim', en: 'Anonymous player' } as const

/** Nombre en las clasificaciones: nombre e inicial, o «Jugador anónimo» si la persona lo eligió (leagueVisible) */
export function displayName(name: string, visible: boolean, locale: keyof typeof ANON = currentLocale()) {
  if (!visible) return ANON[locale] ?? ANON.es
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[1][0].toLocaleUpperCase('es')}.` : parts[0] || '—'
}

/** Clasificación de un grupo (la usan la pantalla y el cierre semanal) */
async function standings(tx: Tx, weekKey: string, groupNo: number) {
  return rank(tx, weekKey, await tx.leagueMember.findMany({ where: { weekKey, groupNo } }))
}

/** Puntos de la semana y orden (XP + inversión, desempate por XP). Lo comparten la liga general y las de amigos */
async function rank(tx: Tx, weekKey: string, members: LeagueMember[]) {
  const ids = members.map(m => m.userId)
  const [users, rets] = await Promise.all([
    tx.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, leagueVisible: true, blockedAt: true } }),
    returnsOf(tx, weekKey, members),
  ])
  return ids
    .map(id => {
      const u = users.find(x => x.id === id)
      const xp = members.find(x => x.userId === id)?.xp ?? 0
      const r = rets.get(id) ?? { pct: 0, pts: 0 }
      const joinedAt = members.find(x => x.userId === id)?.joinedAt.getTime() ?? 0
      return { userId: id, division: members.find(x => x.userId === id)?.division ?? 1, exists: !!u, name: u?.name ?? '', visible: u?.leagueVisible ?? true, blocked: !!u?.blockedAt, weeklyXp: xp, riskAdjReturnPct: r.pct, tradePts: r.pts, score: score(xp, r.pts), joinedAt }
    })
    .filter(m => m.exists && !m.blocked)
    .sort(byStanding)
    .map((m, i) => ({ ...m, rank: i + 1 }))
}

// ── Para las ligas de amigos (friends.ts) ──────────────
/** «Esta semana»: los mismos puntos y el mismo orden que la liga general, solo con estas personas.
 *  Quien aún no ha entrado en la liga esta semana no sale aquí (friends.ts lo pone con 0). */
export async function weekStandingsOf(tx: Tx, userIds: string[]) {
  const weekKey = leagueWeekKey()
  const rows = userIds.length ? await rank(tx, weekKey, await tx.leagueMember.findMany({ where: { weekKey, userId: { in: userIds } } })) : []
  return { endsAt: madridMidnight(addDays(weekKey, 7)), rows }
}

const concentratedIn = async (tx: Tx, userIds: string[], keys: string[]) =>
  new Set((await tx.gameState.findMany({ where: { userId: { in: userIds } }, select: { userId: true, counters: true } })).filter(g => keys.some(k => (g.counters as Record<string, number> | null)?.[k])).map(g => g.userId))

/** «Temporada del mes»: rentabilidad del mes natural (Madrid) con las reglas de la liga: tope de ±10 % y, si la cartera
 *  está o estuvo concentrada este mes, las ganancias cuentan la mitad. Sin cartera o sin base: 0 %. */
export async function seasonOf(tx: Tx, userIds: string[]) {
  const month = monthOf()
  const [bases, values, flagged] = await Promise.all([monthBases(tx, userIds, month), portfolioValues(tx, userIds), concentratedIn(tx, userIds, [concMonthKey(month), concKey(leagueWeekKey())])])
  const rows = new Map<string, { pct: number; concentrated: boolean }>()
  for (const id of userIds) {
    const b = bases.get(id)
    const v = values.get(id)
    if (!b || !v) {
      rows.set(id, { pct: 0, concentrated: false })
      continue
    }
    const raw = monthReturnPct(b.startValue, v.value, b.flows)
    const conc = v.concentrated || flagged.has(id)
    rows.set(id, { pct: seasonPct(raw, conc), concentrated: conc && raw > 0 })
  }
  return { month, endsAt: monthStart(nextMonth(month)), rows }
}

/** Ganadores del mes anterior entre estas personas, calculado al vuelo con las bases guardadas: la base de ese mes y,
 *  como valor final, su última foto de ese mes (o la base de este mes, si se tomó en sus primeros días).
 *  Sin datos no cuenta. Solo hay campeón si ganó algo (más de 0 %); con empate, varios. */
export async function lastSeasonWinners(tx: Tx, userIds: string[]) {
  const month = monthOf()
  const prev = prevMonth(month)
  if (!userIds.length) return { month: prev, pct: 0, userIds: [] as string[] }
  const [bases, nowBases, snaps, flagged] = await Promise.all([
    tx.monthBase.findMany({ where: { month: prev, userId: { in: userIds } } }),
    tx.monthBase.findMany({ where: { month, userId: { in: userIds } } }),
    tx.portfolioSnapshot.findMany({ where: { userId: { in: userIds }, day: { gte: `${prev}-01`, lte: lastDayOf(prev) } }, orderBy: { day: 'desc' } }),
    concentratedIn(tx, userIds, [concMonthKey(prev)]),
  ])
  const early = monthStart(month).getTime() + 3 * DAY_MS
  let best = 0
  let winners: string[] = []
  for (const b of bases) {
    const snap = snaps.find(x => x.userId === b.userId && x.day >= dayOf(b.createdAt))
    const cur = nowBases.find(x => x.userId === b.userId)
    const end = snap ? Number(snap.value) : cur && cur.createdAt.getTime() < early ? Number(cur.startValue) : null
    if (end === null) continue
    const pct = seasonPct(monthReturnPct(Number(b.startValue), end, Number(b.flows)), flagged.has(b.userId))
    if (pct <= 0 || pct < best) continue
    if (pct > best) winners = []
    best = pct
    winners.push(b.userId)
  }
  return { month: prev, pct: best, userIds: winners }
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
  // De quien se oculta no se envía ni el nombre ni su identificador
  const members = rows.map(m => ({ rank: m.rank, userId: m.visible || m.userId === c.user.id ? m.userId : `anon-${m.rank}`, displayName: m.userId === c.user.id ? c.user.name || '—' : displayName(m.name, m.visible), weeklyXp: m.weeklyXp, riskAdjReturnPct: m.riskAdjReturnPct, tradePts: m.tradePts, score: m.score, isMe: m.userId === c.user.id, division: DIVISIONS[m.division - 1] }))
  if (!me) members.push({ rank: 0, userId: c.user.id, displayName: c.user.name || '—', weeklyXp: 0, riskAdjReturnPct: 0, tradePts: 0, score: 0, isMe: true, division: DIVISIONS[division - 1] })
  // Zonas según cuántos hay ahora en el grupo (las mismas reglas que el cierre)
  const { promoteTop, demoteFrom } = leagueZones(rows.length)
  return { division: { id: `d${division}`, name: DIVISIONS[division - 1], order: division }, divisions: DIVISIONS, endsAt: madridMidnight(addDays(weekKey, 7)).toISOString(), promoteTop, demoteFrom, members }
}

/** Cierra la semana indicada. Solo una vez por semana: cada persona se cierra en su propia transacción
 *  (puesto, ascenso, gemas y aviso juntos), así que si el cierre se corta a medias, la siguiente ejecución
 *  termina a quien faltaba sin repetir nada a quien ya se cerró. */
export async function closeWeek(weekKey: string) {
  if (await db.leagueWeek.findUnique({ where: { weekKey } })) {
    // Ya marcada: solo se sigue si quedó alguien sin cerrar (cierre interrumpido)
    // (sin contar cuentas borradas o bloqueadas, que no salen en la clasificación)
    const open = await db.leagueMember.findMany({ where: { weekKey, finalRank: null }, select: { userId: true } })
    if (!open.length || !(await db.user.count({ where: { id: { in: open.map(x => x.userId) }, blockedAt: null } }))) return { weekKey, closed: false, groups: 0 }
  } else await db.leagueWeek.createMany({ data: [{ weekKey }], skipDuplicates: true })
  const groups = await db.leagueMember.groupBy({ by: ['groupNo'], where: { weekKey } })
  let members = 0
  for (const g of groups) {
    const rows = await standings(db, weekKey, g.groupNo)
    for (const m of rows) {
      const user = await db.user.findUnique({ where: { id: m.userId } })
      if (!user) continue
      const done = await withCtx(async c => {
        // Solo una vez por persona (si dos cierres coinciden, el segundo no encuentra nada que cerrar)
        const first = await c.tx.leagueMember.updateMany({ where: { weekKey, userId: m.userId, finalRank: null }, data: { finalRank: m.rank, tradePts: m.tradePts } })
        if (!first.count) return false
        // La división actual de la persona (no la que tenía al entrar): nunca se pierde ni se duplica un ascenso
        const from = c.g.division
        // Zonas en proporción al grupo (rows.length: los que salen en la clasificación)
        const outcome = weekOutcome(m.rank, rows.length, m.weeklyXp, from, DIVISIONS.length)
        const up = outcome === 'UP'
        const down = outcome === 'DOWN'
        await c.tx.leagueMember.update({ where: { weekKey_userId: { weekKey, userId: m.userId } }, data: { outcome: up ? 'UP' : down ? 'DOWN' : 'STAY' } })
        if (up) {
          c.g.division = from + 1
          c.g.gems += PROMOTE_GEMS
          bump(c, 'leagueUp')
        }
        if (down) c.g.division = from - 1
        // Si ya entró en la liga de la semana siguiente (antes del cierre), allí aparece con su división nueva
        if (c.g.division !== from) await c.tx.leagueMember.updateMany({ where: { userId: m.userId, weekKey: { gt: weekKey }, finalRank: null }, data: { division: c.g.division } })
        if (m.rank <= 3 && m.weeklyXp > 0) bump(c, 'top3')
        if (m.riskAdjReturnPct > 0) bump(c, 'weekPositive')
        const name = DIVISIONS[c.g.division - 1]
        await notify(c, 'LEAGUE_RESULT', `Semana cerrada: puesto ${m.rank} de ${rows.length}`, up ? `¡Subes a ${name}! +${PROMOTE_GEMS} gemas.` : down ? `Bajas a ${name}. Esta semana, a recuperar.` : `Sigues en ${name}.`, '/liga')
        await checkAchievements(c)
        return true
      }, user)
      if (done) members++
    }
  }
  return { weekKey, closed: true, groups: groups.length, members }
}
