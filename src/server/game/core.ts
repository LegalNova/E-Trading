import 'server-only'
// Núcleo del juego en el servidor: contexto de usuario, XP, niveles, racha, objetivos, vidas,
// logros, avisos y frases de Lumi. Reglas: docs/02-gamificacion.md.
import type { AchievementT, EffectsT, FeatureT, LivesT, Mood, NotificationT } from '@/shared/contract'
import { addDays, dayOf, weekOf } from '@/shared/time'
import { Prisma, type GameState, type User } from '@/generated/prisma/client'
import { db, DB_SCHEMA } from '../db'
import { asTeam, currentUser } from '../auth'
import { ACHIEVEMENTS, LEVEL_TITLES, LUMI, RISK_LESSONS, UNITS } from '../content/catalog'
import { achievementT } from '../content/translate'
import { currentLocale } from '../locale'
import { viewAs } from '../view'
import { TRIAL_DAYS, TRIAL_STREAK } from '@/shared/plans'
import { isReadRequest } from '../request'

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}
export const fail = (status: number, code: string, message: string): never => {
  throw new HttpError(status, code, message)
}

export const LIVES_MAX = 5
export const LIFE_MS = 4 * 3_600_000
export const START_CASH = { FREE: 10_000, PLUS: 50_000, PREMIUM: 50_000 } as const
export const RISK_PCT = 20
export const FREEZE_PRICE = 200
export const REFILL_PRICE = 350
export const MAX_FREEZES = 2

export type Tx = Prisma.TransactionClient
export type Counters = Record<string, number>

/** Efectos acumulados de una acción (contrato: Effects) */
export interface Fx {
  xp: number
  goals: string[]
  ach: AchievementT[]
  levelFrom: number
  features: FeatureT[]
  companion?: { message: string; mood: Mood }
}

export interface Ctx {
  tx: Tx
  user: User
  g: GameState
  counters: Counters
  today: string
  fx: Fx
  /** Fila del usuario bloqueada (escrituras). Las lecturas van sin bloqueo y lo piden con lockUser si van a cambiar algo */
  locked?: boolean
}

// ── Niveles: 500 × 1,4 ───────────────────────────────────
export const LEVEL_MIN = [0, 500, 1200, 2180, 3552, 5473, 8162, 11927]
export function levelOf(xp: number) {
  let n = 1
  for (let i = 0; i < LEVEL_MIN.length; i++) if (xp >= LEVEL_MIN[i]) n = i + 1
  return { n, min: LEVEL_MIN[n - 1], next: LEVEL_MIN[n] ?? null }
}
export const levelTitle = (gender: 'F' | 'M' | 'N', n: number) => (LEVEL_TITLES[n] ?? LEVEL_TITLES[8])[gender]

// ── Sesión ───────────────────────────────────────────────
export async function requireUser(): Promise<User> {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  return u!
}

/** Sale de la transacción deshaciéndola, pero con la respuesta ya calculada («ver como»: solo lectura) */
class ReadOnlyResult {
  constructor(readonly out: unknown) {}
}

/**
 * Ejecuta una acción del usuario en una transacción: carga (o crea) su estado de juego,
 * aplica el mantenimiento del día (racha, vidas, objetivos) y lo guarda al terminar.
 */
export async function withCtx<T>(fn: (c: Ctx) => Promise<T>, user?: User): Promise<T> {
  const u0 = user ?? (await requireUser())
  const readOnly = !!viewAs()
  // Lecturas (GET) sin bloquear al usuario: varias pantallas pueden pedir datos a la vez sin hacer cola.
  // Las tareas programadas (que pasan el usuario) y las escrituras bloquean como siempre.
  const read = !user && isReadRequest()
  try {
    return await inCtx(fn, u0, readOnly, read, !!user)
  } catch (e) {
    if (e instanceof ReadOnlyResult) return e.out as T
    throw e
  }
}

/** Semana como número (los contadores son números): 2026-11-02 → 20261102 */
const weekNo = (weekKey: string) => Number(weekKey.replaceAll('-', '')) || 0

const lockSql = () => `SELECT 1 FROM "${DB_SCHEMA}"."GameState" WHERE "userId" = $1 FOR UPDATE`

/** Antes de cambiar algo en una lectura (ejecutar órdenes, por ejemplo): bloquea y recarga el estado del usuario */
export async function lockUser(c: Ctx) {
  if (c.locked) return
  await c.tx.$queryRawUnsafe(lockSql(), c.user.id)
  c.g = await c.tx.gameState.findUniqueOrThrow({ where: { userId: c.user.id } })
  c.counters = { ...((c.g.counters as Counters) ?? {}) }
  c.locked = true
  await rollover(c)
}

const STATE_KEYS = ['xp', 'weekKey', 'weekXp', 'gems', 'lives', 'livesUpdatedAt', 'streak', 'bestStreak', 'lastActiveDay', 'freezes', 'placementDone', 'tradesDay', 'tradesToday', 'division'] as const
const stateOf = (g: GameState, counters: Counters) => JSON.stringify([...STATE_KEYS.map(k => g[k]), counters])

function inCtx<T>(fn: (c: Ctx) => Promise<T>, u0: User, readOnly: boolean, read: boolean, scheduled: boolean): Promise<T> {
  return db.$transaction(
    async tx => {
      // Crear el estado si no existe sin chocar con otra petición que lo esté creando a la vez
      let g = read ? await tx.gameState.findUnique({ where: { userId: u0.id } }) : null
      if (!g) {
        await tx.gameState.createMany({ data: [{ userId: u0.id }], skipDuplicates: true })
        // Bloqueo de la fila del usuario: sus acciones simultáneas se ejecutan de una en una
        // (evita gastar dos veces el mismo saldo, las mismas gemas o cobrar dos veces un logro)
        if (!read) await tx.$queryRawUnsafe(lockSql(), u0.id)
        g = await tx.gameState.findUniqueOrThrow({ where: { userId: u0.id } })
      }
      const u = asTeam(await expireTrial(tx, read ? u0 : ((await tx.user.findUnique({ where: { id: u0.id } })) ?? u0)))
      const c: Ctx = { tx, user: u, g, counters: { ...((g.counters as Counters) ?? {}) }, today: dayOf(Date.now(), u.timezone), fx: { xp: 0, goals: [], ach: [], levelFrom: levelOf(g.xp).n, features: [] }, locked: !read }
      const loaded = { at: g.updatedAt, state: stateOf(g, c.counters) }
      await rollover(c)
      const trades0 = c.g.tradesToday
      const out = await fn(c)
      // Liga: si ha vendido, se apunta si su cartera estaba concentrada antes de vender (vale para toda la semana:
      // pasarlo todo a efectivo justo antes del cierre no quita la penalización)
      if (c.g.tradesToday > trades0) await (await import('./league')).noteConcentration(c, c.g.tradesToday - trades0)
      // Liga: todo el que usa la app esta semana entra en su grupo (aunque aún no tenga XP), una vez por semana
      // (semana de la liga = la de Madrid, la misma para todos). Las tareas programadas (cierre de la liga, órdenes
      // pendientes, avisos) no son «usar la app»: solo meten en la liga a quien gana XP con ellas.
      const lw = weekNo(weekOf(Date.now()))
      if (scheduled) {
        if (c.g.weekXp > 0) await (await import('./league')).ensureMembership(c)
      } else if (c.counters.leagueWeek !== lw) {
        await (await import('./league')).ensureMembership(c, true)
        c.counters.leagueWeek = lw
      } else if (c.g.weekXp > 0) await (await import('./league')).ensureMembership(c)
      const { xp, weekKey, weekXp, gems, lives, livesUpdatedAt, streak, bestStreak, lastActiveDay, freezes, placementDone, tradesDay, tradesToday, division } = c.g
      const data = { xp, weekKey, weekXp, gems, lives, livesUpdatedAt, streak, bestStreak, lastActiveDay, freezes, placementDone, tradesDay, tradesToday, division, counters: c.counters }
      if (c.locked) await tx.gameState.update({ where: { userId: u.id }, data })
      // Lectura sin bloqueo: solo se guarda si el mantenimiento del día cambió algo y nadie escribió entretanto
      // (si alguien escribió, se deja: la siguiente petición lo recalcula sobre el estado nuevo)
      else if (stateOf(c.g, c.counters) !== loaded.state) await tx.gameState.updateMany({ where: { userId: u.id, updatedAt: loaded.at }, data })
      if (readOnly) throw new ReadOnlyResult(out)
      return out
    },
    { timeout: 20_000, maxWait: 10_000 },
  )
}

/** Prueba de Premium sin pago: al terminar vuelve a Free (no hay cobro hasta conectar Stripe) */
async function expireTrial(tx: Tx, u: User): Promise<User> {
  if (u.plan === 'FREE') return u
  const sub = await tx.subscription.findUnique({ where: { userId: u.id } })
  if ((sub?.status === 'TRIALING' || sub?.status === 'GIFT') && !(sub.status === 'TRIALING' && sub.stripeSubId) && sub.trialEndsAt && sub.trialEndsAt.getTime() < Date.now()) {
    // Solo una petición la cierra (si llegan dos a la vez, la segunda ya no encuentra nada que cerrar)
    const closed = await tx.subscription.updateMany({ where: { userId: u.id, status: sub.status }, data: { status: 'CANCELED', renewsAt: null } })
    if (!closed.count) return (await tx.user.findUnique({ where: { id: u.id } })) ?? u
    const gift = sub.status === 'GIFT'
    await tx.notification.create({ data: { userId: u.id, type: 'NEW_LESSON', title: gift ? 'Tu Max regalado ha terminado' : 'Tu prueba ha terminado', body: gift ? 'Sigues con todo lo de Free. Invita a más amigos para ganar más días, o pásate a Plus o Max.' : 'Sigues con todo lo de Free. Puedes volver a Plus o Max cuando quieras.', deepLink: gift ? '/perfil/invitar' : '/premium' } })
    return tx.user.update({ where: { id: u.id }, data: { plan: 'FREE' } })
  }
  return u
}

// ── Mantenimiento al leer: semana, racha, vidas ──────────
async function rollover(c: Ctx) {
  const { g, today, tx } = c
  // XP de la semana: semana de Madrid, la misma que la de la liga (con la semana local de cada uno, quien vive en
  // otra zona perdía XP de la liga o la veía a 0 el domingo). Se pone a 0 el lunes a las 00:00 de Madrid.
  const wk = weekOf(Date.now())
  if (g.weekKey !== wk) {
    g.weekKey = wk
    g.weekXp = 0
  }
  if (g.tradesDay !== today) {
    g.tradesDay = today
    g.tradesToday = 0
  }
  // Racha: días saltados → un protector por día si hay bastantes; si no, se pierde (y los protectores se guardan:
  // gastarlos en una racha que se pierde igualmente no tendría sentido)
  const last = g.lastActiveDay
  if (last && last < addDays(today, -1) && g.streak > 0) {
    const missed: string[] = []
    for (let d = addDays(last, 1); d < today; d = addDays(d, 1)) missed.push(d)
    const saved = g.freezes >= missed.length
    if (saved) {
      g.freezes -= missed.length
      c.counters.freezeUsed = (c.counters.freezeUsed ?? 0) + missed.length
      g.lastActiveDay = missed.at(-1)!
    } else g.streak = 0
    await tx.streakDay.createMany({ data: missed.map(day => ({ userId: g.userId, day, status: saved ? 'FROZEN' : 'MISSED' })), skipDuplicates: true })
  }
  // Vidas: 1 cada 4 h, calculado al leer
  if (g.lives < LIVES_MAX) {
    const n = Math.floor((Date.now() - g.livesUpdatedAt.getTime()) / LIFE_MS)
    if (n > 0) {
      g.lives = Math.min(LIVES_MAX, g.lives + n)
      g.livesUpdatedAt = g.lives >= LIVES_MAX ? new Date() : new Date(g.livesUpdatedAt.getTime() + n * LIFE_MS)
    }
  }
}

// ── XP, racha y objetivos ────────────────────────────────
export function addXp(c: Ctx, n: number) {
  c.g.xp += n
  c.g.weekXp += n
  c.fx.xp += n
}

export const bump = (c: Ctx, key: string, n = 1) => (c.counters[key] = (c.counters[key] ?? 0) + n)

/** Marca el día como activo; devuelve true si la racha crece hoy */
export async function markActive(c: Ctx): Promise<boolean> {
  const { g, today } = c
  if (g.lastActiveDay === today) return false
  g.streak = g.lastActiveDay === addDays(today, -1) ? g.streak + 1 : 1
  g.bestStreak = Math.max(g.bestStreak, g.streak)
  g.lastActiveDay = today
  await c.tx.streakDay.upsert({ where: { userId_day: { userId: g.userId, day: today } }, create: { userId: g.userId, day: today, status: 'ACTIVE' }, update: { status: 'ACTIVE' } })
  // Al llegar a la racha que desbloquea la prueba gratis de Max (solo la primera vez)
  if (g.streak === TRIAL_STREAK && g.bestStreak === TRIAL_STREAK && c.user.plan === 'FREE' && !c.user.trialUsed && !c.user.isAnonymous)
    await notify(c, 'ACHIEVEMENT', `¡${TRIAL_STREAK} días seguidos! Max gratis desbloqueado`, `Tienes ${TRIAL_DAYS} días de Max gratis para probar todo el curso. Actívalos cuando quieras.`, '/premium')
  return true
}

export type GoalId = 'lesson' | 'ops' | 'perfect'
/** Objetivos del día según la meta elegida (5, 10, 15, 20 o 30 minutos). Cumplir los tres da +10 gemas. */
export function goalDefs(minutes: number): { id: GoalId; target: number; xp: number }[] {
  const m = [5, 10, 15, 20, 30].includes(minutes) ? minutes : 10
  return [
    { id: 'lesson', target: m >= 30 ? 4 : m >= 15 ? 2 : 1, xp: m >= 15 ? 30 : 20 },
    { id: 'ops', target: m === 5 ? 1 : m >= 20 ? 3 : 2, xp: 15 },
    { id: 'perfect', target: m >= 30 ? 3 : m === 20 ? 2 : 1, xp: 25 },
  ]
}
export const minutesOf = (u: User) => Number((u.settings as { dailyGoalMinutes?: number } | null)?.dailyGoalMinutes ?? 10)

export async function goalsOf(c: Ctx) {
  const where = { userId_day: { userId: c.user.id, day: c.today } }
  const row = await c.tx.dailyGoals.findUnique({ where })
  if (row) return row
  // Sin choques si dos peticiones lo crean a la vez
  await c.tx.dailyGoals.createMany({ data: [{ userId: c.user.id, day: c.today }], skipDuplicates: true })
  return c.tx.dailyGoals.findUniqueOrThrow({ where })
}

export async function bumpGoal(c: Ctx, id: GoalId) {
  const row = await goalsOf(c)
  const defs = goalDefs(minutesOf(c.user))
  const def = defs.find(x => x.id === id)!
  const value = Math.min(def.target, row[id] + 1)
  const rewarded = [...row.rewarded]
  if (value >= def.target && !rewarded.includes(id)) {
    rewarded.push(id)
    addXp(c, def.xp)
    c.fx.goals.push(id)
    if (rewarded.length === defs.length) {
      c.g.gems += 10
      bump(c, 'goalDays')
    }
  }
  await c.tx.dailyGoals.update({ where: { userId_day: { userId: c.user.id, day: c.today } }, data: { [id]: value, rewarded } })
}

// ── Vidas ────────────────────────────────────────────────
export function livesOf(user: User, g: GameState): LivesT {
  if (user.plan !== 'FREE') return { current: LIVES_MAX, max: LIVES_MAX, nextRegenAt: null, regenHours: 4 }
  return { current: g.lives, max: LIVES_MAX, nextRegenAt: g.lives < LIVES_MAX ? new Date(g.livesUpdatedAt.getTime() + LIFE_MS).toISOString() : null, regenHours: 4 }
}

// ── Avisos y Lumi ────────────────────────────────────────
export async function notify(c: Pick<Ctx, 'tx' | 'user'>, type: NotificationT['type'], title: string, body: string, deepLink: string) {
  await c.tx.notification.create({ data: { userId: c.user.id, type, title, body, deepLink } })
}

export function lumi(c: Pick<Ctx, 'user' | 'g'>, key: keyof typeof LUMI, vars: Record<string, string | number> = {}) {
  const t = LUMI[key]
  const line = t.lines[Math.floor(Math.random() * t.lines.length)]
  const all: Record<string, string | number> = { nombre: c.user.name || 'tú', dias: c.g.streak, ...vars }
  return { message: line.replace(/\{(\w+)\}/g, (_, k) => String(all[k] ?? '')), mood: t.mood }
}

// ── Logros ───────────────────────────────────────────────
async function achievementFacts(tx: Tx, userId: string, g: GameState, counters: Counters) {
  const [lessons, filled, positions, alerts] = await Promise.all([
    tx.lessonProgress.findMany({ where: { userId, skipped: false }, select: { lessonId: true } }), // las saltadas con el test de nivel no cuentan
    tx.trade.count({ where: { userId, status: 'FILLED' } }),
    tx.position.findMany({ where: { userId }, select: { symbol: true } }),
    tx.priceAlert.count({ where: { userId } }),
  ])
  const assets = positions.length ? await tx.asset.findMany({ where: { symbol: { in: positions.map(p => p.symbol) } }, select: { type: true } }) : []
  const done = new Set(lessons.map(l => l.lessonId))
  const unitDone = (u: string) => { const x = UNITS.find(y => y.id === u); return x && x.lessons.every(l => done.has(l.id)) ? 1 : 0 }
  const n = (k: string) => counters[k] ?? 0
  const v2 = UNITS.some(u => u.section)
  const bosses = [...done].filter(id => id.endsWith('boss')).length
  return {
    FIRST_LESSON: done.size, LESSONS_5: done.size, LESSONS_20: done.size, LESSONS_50: done.size, QUIZ_PERFECT: n('perfect'), QUIZ_PERFECT_5: n('perfect'),
    // Curso v2 (con secciones): velas = u20 y gestión del riesgo = u24; antes, u8 y u10
    UNIT_1: unitDone('h1'), UNIT_2: unitDone(v2 ? 'u20' : 'u8'), UNIT_3: unitDone(v2 ? 'u24' : 'u10'), COURSE_DONE: UNITS.filter(u => !u.side).every(u => unitDone(u.id)) ? 1 : 0, PLACEMENT: g.placementDone ? 1 : 0,
    BOSS_1: bosses, BOSS_5: bosses, UPDOWN_10: n('updown'), CALC_20: n('ok_NUMBER'), SCAM_5: n('ok_SPOT'), SIM_5: n('ok_SIM_TRADE'), CANDLE_10: n('ok_CHART_CANDLE'),
    HISTORY: v2 ? unitDone('u34') : 0, LAB: v2 ? unitDone('u35') : 0,
    REVIEW_10: n('reviewed'), SPEED: n('fastPerfect'), FIRST_TRADE: filled, TRADES_10: filled, TRADES_50: filled,
    DIVERSIFY_3: new Set(assets.map(a => a.type)).size, DIVERSIFY_5: positions.length, FIRST_STOP: n('stops'), FIRST_TP: n('tps'),
    FIRST_LIMIT: n('limits'), WEEK_POSITIVE: n('weekPositive'), CALM_RISK: n('calmRisk'), FIRST_ALERT: Math.max(n('alerts'), alerts ? 1 : 0),
    CRYPTO_FIRST: n('crypto'), ETF_FIRST: n('etf'), STREAK_3: g.bestStreak, STREAK_7: g.bestStreak, STREAK_30: g.bestStreak,
    STREAK_100: g.bestStreak, FREEZE_USED: n('freezeUsed'), GOALS_7: n('goalDays'), LEAGUE_UP: n('leagueUp'), LEAGUE_TOP3: n('top3'),
  } as Record<string, number>
}

export async function achievementList(tx: Tx, userId: string, g: GameState, counters: Counters): Promise<AchievementT[]> {
  const [facts, unlocked] = await Promise.all([achievementFacts(tx, userId, g, counters), tx.userAchievement.findMany({ where: { userId } })])
  const at = new Map(unlocked.map(u => [u.code, u.unlockedAt.toISOString()]))
  const loc = currentLocale()
  return ACHIEVEMENTS.map(a => ({
    id: a.code, code: a.code, title: achievementT(loc, a.code)?.title ?? a.title, description: achievementT(loc, a.code)?.description ?? a.description, icon: a.icon, category: a.category,
    unlocked: at.has(a.code), unlockedAt: at.get(a.code), progress: at.has(a.code) ? a.target : Math.min(a.target, facts[a.code] ?? 0), target: a.target, reward: { gems: a.gems, xp: a.xp },
  }))
}

/** Desbloquea los logros alcanzados, da sus recompensas y los añade a los efectos */
export async function checkAchievements(c: Ctx) {
  let list = await achievementList(c.tx, c.user.id, c.g, c.counters)
  // En una lectura (GET, sin bloqueo) hay algo que desbloquear: se bloquea y se vuelve a mirar. Sin bloqueo, dos
  // peticiones a la vez chocaban al crear el mismo logro, o el logro quedaba creado y sus gemas y XP se perdían
  // (el estado de una lectura no se guarda si otra petición escribió entretanto)
  if (!c.locked && list.some(a => !a.unlocked && a.progress >= a.target)) {
    await lockUser(c)
    list = await achievementList(c.tx, c.user.id, c.g, c.counters)
  }
  for (const a of list) {
    if (a.unlocked || a.progress < a.target) continue
    await c.tx.userAchievement.create({ data: { userId: c.user.id, code: a.code } })
    c.g.gems += a.reward.gems
    addXp(c, a.reward.xp)
    await notify(c, 'ACHIEVEMENT', `Insignia: ${a.title}`, `+${a.reward.gems} gemas y +${a.reward.xp} XP.`, '/insignias')
    c.fx.ach.push({ ...a, unlocked: true, unlockedAt: new Date().toISOString(), progress: a.target })
  }
}

/** Cierra una acción: logros, subida de nivel y efectos para la respuesta */
export async function endFx(c: Ctx): Promise<EffectsT> {
  await checkAchievements(c)
  const to = levelOf(c.g.xp).n
  if (to > c.fx.levelFrom) {
    const title = levelTitle(c.user.gender, to)
    await notify(c, 'ACHIEVEMENT', `¡Nivel ${to}: ${title}!`, 'Sigue así: cada nivel desbloquea títulos nuevos.', '/perfil')
    c.fx.companion = lumi(c, 'LEVEL_UP', { nivel: to, titulo: title })
  }
  return { xp: c.fx.xp, goalsCompleted: c.fx.goals, achievementsUnlocked: c.fx.ach, levelUp: to > c.fx.levelFrom ? { from: c.fx.levelFrom, to } : undefined, unlockedFeatures: c.fx.features, companion: c.fx.companion }
}

export const unlockedFeatures = async (tx: Tx, user: User): Promise<FeatureT[]> =>
  user.plan === 'PREMIUM' || (await tx.lessonProgress.count({ where: { userId: user.id, lessonId: { in: [...RISK_LESSONS] } } })) > 0 ? ['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] : []
