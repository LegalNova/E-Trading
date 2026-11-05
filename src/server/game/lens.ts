import 'server-only'
// Capa de datos (solo ADMIN): cada pantalla de la app enseña sus números a quien la gestiona.
// Todo sale de la base de datos real; el equipo (rol ADMIN) no cuenta. «null» = aún no hay datos.
import { addDays, dayOf, weekOf } from '@/shared/time'
import { ACHIEVEMENTS, DIVISIONS, LESSON, QUIZZES, UNITS } from '../content/catalog'
import { db, DB_SCHEMA } from '../db'

export type LensRange = '7d' | '30d' | 'all'
type Cell = string | number | null
export interface Lens {
  title: string
  kpis: { label: string; value: Cell; hint?: string }[]
  bars?: { title: string; items: { label: string; value: number }[]; unit?: string }[]
  tables?: { title: string; head: string[]; rows: Cell[][]; note?: string }[]
  note?: string
}

const S = `"${DB_SCHEMA}"`
const USERS = { role: 'USER' } as const
const sinceOf = (r: LensRange) => (r === 'all' ? new Date(0) : new Date(Date.now() - (r === '7d' ? 7 : 30) * 86_400_000))
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null)
const cut = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const RANGE_TXT: Record<LensRange, string> = { '7d': 'últimos 7 días', '30d': 'últimos 30 días', all: 'desde el inicio' }

async function visitors(path: string, since: Date) {
  const where = { name: 'screen_view', createdAt: { gte: since }, props: { path: ['path'], equals: path } }
  const [users, anon] = await Promise.all([
    db.event.groupBy({ by: ['userId'], where: { ...where, user: { is: USERS } } }).then(r => r.length),
    db.event.count({ where: { ...where, userId: null } }),
  ])
  return { users, anon }
}

/** Por clase: cuántos la empiezan, llegan al quiz, la terminan o se la saltan (usuarios distintos) */
export async function lessonStats(since: Date) {
  const [starts, quiz, done] = await Promise.all([
    db.$queryRawUnsafe<{ id: string; n: bigint }[]>(
      `SELECT e.props->>'lessonId' AS id, COUNT(DISTINCT e."userId") AS n FROM ${S}."Event" e JOIN ${S}."user" u ON u.id = e."userId" AND u.role = 'USER' WHERE e.name = 'lesson_start' AND e."createdAt" >= $1 GROUP BY 1`,
      since,
    ),
    db.$queryRawUnsafe<{ id: string; n: bigint }[]>(
      `SELECT a."lessonId" AS id, COUNT(DISTINCT a."userId") AS n FROM ${S}."QuizAttempt" a JOIN ${S}."user" u ON u.id = a."userId" AND u.role = 'USER' WHERE a.mode = 'LESSON' AND a."startedAt" >= $1 GROUP BY 1`,
      since,
    ),
    db.lessonProgress.groupBy({ by: ['lessonId', 'skipped'], where: { completedAt: { gte: since }, user: USERS }, _count: { _all: true }, _avg: { stars: true } }),
  ])
  const m = new Map<string, { starts: number; quiz: number; done: number; skipped: number; stars: number | null }>()
  const get = (id: string) => m.get(id) ?? (m.set(id, { starts: 0, quiz: 0, done: 0, skipped: 0, stars: null }), m.get(id)!)
  for (const r of starts) get(r.id).starts = Number(r.n)
  for (const r of quiz) if (r.id) get(r.id).quiz = Number(r.n)
  for (const r of done) {
    const x = get(r.lessonId)
    if (r.skipped) x.skipped = r._count._all
    else {
      x.done = r._count._all
      x.stars = r._avg.stars
    }
  }
  return m
}

/** Aciertos por pregunta del quiz de una clase */
async function questionStats(lessonId: string, since: Date) {
  const rows = await db.$queryRawUnsafe<{ q: string; n: bigint; ok: number; ms: number }[]>(
    `SELECT qa."questionId" AS q, COUNT(*) AS n, AVG(CASE WHEN qa.correct THEN 1 ELSE 0 END)::float AS ok, AVG(qa."elapsedMs")::float AS ms
     FROM ${S}."QuizAnswer" qa JOIN ${S}."QuizAttempt" a ON a.id = qa."attemptId" JOIN ${S}."user" u ON u.id = a."userId" AND u.role = 'USER'
     WHERE a."lessonId" = $1 AND qa."createdAt" >= $2 GROUP BY 1`,
    lessonId,
    since,
  )
  const qs = QUIZZES[LESSON[lessonId]?.quizId ?? ''] ?? []
  return rows
    .map(r => ({ q: qs.find(x => x.id === r.q), n: Number(r.n), ok: Math.round(r.ok * 100), s: Math.round(r.ms / 100) / 10 }))
    .filter(r => r.q)
    .sort((a, b) => a.ok - b.ok)
}

async function lessonLens(id: string, since: Date, range: LensRange, path: string): Promise<Lens> {
  const l = LESSON[id]
  if (!l) return { title: 'Clase desconocida', kpis: [] }
  const [stats, v, exits, qs] = await Promise.all([
    lessonStats(since).then(m => m.get(id)),
    visitors(path, since),
    db.event.findMany({ where: { name: 'lesson_exit', createdAt: { gte: since }, user: { is: USERS }, props: { path: ['lessonId'], equals: id } }, select: { props: true } }),
    questionStats(id, since),
  ])
  const s = stats ?? { starts: 0, quiz: 0, done: 0, skipped: 0, stars: null }
  const steps = new Map<number, number>()
  let of = 0
  for (const e of exits) {
    const p = e.props as { step: number; of: number }
    steps.set(p.step, (steps.get(p.step) ?? 0) + 1)
    of = Math.max(of, p.of)
  }
  return {
    title: `${l.unit.title} · ${l.title}`,
    kpis: [
      { label: 'La empiezan', value: s.starts },
      { label: 'Llegan al quiz', value: s.quiz, hint: s.starts ? `${pct(s.quiz, s.starts)} % de los que empiezan` : undefined },
      { label: 'La terminan', value: s.done, hint: s.starts ? `${pct(s.done, s.starts)} % de los que empiezan` : undefined },
      { label: 'Se la saltan (examen)', value: s.skipped },
      { label: 'Estrellas de media', value: s.stars === null ? null : Math.round(s.stars * 10) / 10 },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    bars: exits.length ? [{ title: `Dónde la dejan (paso alcanzado de ${of})`, items: Array.from({ length: of }, (_, i) => ({ label: `Paso ${i + 1}`, value: steps.get(i + 1) ?? 0 })), unit: 'personas' }] : undefined,
    tables: [
      {
        title: 'Quiz: preguntas de la más difícil a la más fácil',
        head: ['Pregunta', 'Tipo', 'Respuestas', 'Aciertos', 'Segundos'],
        rows: qs.map(r => [cut(r.q!.prompt), r.q!.type, r.n, `${r.ok} %`, r.s]),
        note: qs.length ? undefined : 'Aún nadie ha hecho este quiz en el periodo.',
      },
    ],
    note: `Usuarios distintos, ${RANGE_TXT[range]}. «Dónde la dejan» cuenta a quien salió de la clase sin llegar al quiz.`,
  }
}

async function learnLens(since: Date, range: LensRange, path: string): Promise<Lens> {
  const [m, v] = await Promise.all([lessonStats(since), visitors(path, since)])
  const all = UNITS.flatMap(u => u.lessons.map(l => ({ u, l, s: m.get(l.id) })))
  const withData = all.filter(x => x.s && (x.s.starts || x.s.done))
  const hardest = [...withData].filter(x => x.s!.starts >= 3).sort((a, b) => (pct(a.s!.done, a.s!.starts) ?? 0) - (pct(b.s!.done, b.s!.starts) ?? 0))
  const top = [...withData].sort((a, b) => b.s!.done - a.s!.done)
  const sum = (k: 'starts' | 'done' | 'skipped') => all.reduce((a, x) => a + (x.s?.[k] ?? 0), 0)
  return {
    title: 'Clases',
    kpis: [
      { label: 'Visitas a la pantalla', value: v.users },
      { label: 'Clases empezadas', value: sum('starts') },
      { label: 'Clases terminadas', value: sum('done') },
      { label: 'Saltadas con examen', value: sum('skipped') },
    ],
    tables: [
      { title: 'Donde más se abandona (3 o más que la empiezan)', head: ['Clase', 'Empiezan', 'Terminan', '%'], rows: hardest.slice(0, 12).map(x => [`${x.u.order} · ${cut(x.l.title, 50)}`, x.s!.starts, x.s!.done, `${pct(x.s!.done, x.s!.starts)} %`]), note: hardest.length ? undefined : 'Aún no hay clases con 3 o más usuarios.' },
      { title: 'Las más terminadas', head: ['Clase', 'Terminan'], rows: top.slice(0, 10).map(x => [`${x.u.order} · ${cut(x.l.title, 50)}`, x.s!.done]) },
    ],
    note: `Usuarios distintos, ${RANGE_TXT[range]}.`,
  }
}

async function homeLens(since: Date, range: LensRange, path: string): Promise<Lens> {
  const today = dayOf()
  const [total, fresh, dau, wau, lessons, trades, tutor, streaks, v] = await Promise.all([
    db.user.count({ where: USERS }),
    db.user.count({ where: { ...USERS, createdAt: { gte: since } } }),
    db.streakDay.count({ where: { day: today, status: 'ACTIVE', user: USERS } }),
    db.gameState.count({ where: { lastActiveDay: { gte: addDays(today, -6) }, user: USERS } }),
    db.lessonProgress.count({ where: { completedAt: { gte: since }, skipped: false, user: USERS } }),
    db.trade.count({ where: { createdAt: { gte: since }, status: 'FILLED', user: USERS } }),
    db.tutorMessage.count({ where: { createdAt: { gte: since }, role: 'user', user: USERS } }),
    db.gameState.count({ where: { streak: { gte: 3 }, user: USERS } }),
    visitors(path, since),
  ])
  return {
    title: 'Inicio',
    kpis: [
      { label: 'Usuarios', value: total },
      { label: 'Altas nuevas', value: fresh, hint: RANGE_TXT[range] },
      { label: 'Activos hoy', value: dau },
      { label: 'Activos 7 días', value: wau },
      { label: 'Clases terminadas', value: lessons, hint: RANGE_TXT[range] },
      { label: 'Operaciones', value: trades, hint: RANGE_TXT[range] },
      { label: 'Preguntas a Lumi', value: tutor, hint: RANGE_TXT[range] },
      { label: 'Rachas de 3+ días', value: streaks },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
  }
}

async function marketLens(since: Date, range: LensRange, path: string): Promise<Lens> {
  const [trades, traders, bySym, watched, v] = await Promise.all([
    db.trade.count({ where: { createdAt: { gte: since }, status: 'FILLED', user: USERS } }),
    db.trade.groupBy({ by: ['userId'], where: { createdAt: { gte: since }, status: 'FILLED', user: USERS } }).then(r => r.length),
    db.trade.groupBy({ by: ['symbol'], where: { createdAt: { gte: since }, status: 'FILLED', user: USERS }, _count: { _all: true }, _sum: { total: true }, orderBy: { _count: { symbol: 'desc' } }, take: 10 }),
    db.watchItem.groupBy({ by: ['symbol'], where: { user: USERS }, _count: { _all: true }, orderBy: { _count: { symbol: 'desc' } }, take: 8 }),
    visitors(path, since),
  ])
  return {
    title: 'Mercado',
    kpis: [
      { label: 'Visitas a la pantalla', value: v.users },
      { label: 'Operaciones', value: trades },
      { label: 'Usuarios que operan', value: traders },
    ],
    tables: [
      { title: 'Activos más operados', head: ['Activo', 'Operaciones', 'Volumen (€ virtuales)'], rows: bySym.map(r => [r.symbol, r._count._all, Math.round(Number(r._sum.total ?? 0))]) },
      { title: 'Más seguidos', head: ['Activo', 'En listas'], rows: watched.map(r => [r.symbol, r._count._all]) },
    ],
    note: `Operaciones con dinero virtual, ${RANGE_TXT[range]}.`,
  }
}

async function assetLens(symbol: string, since: Date, range: LensRange, path: string): Promise<Lens> {
  const where = { symbol, createdAt: { gte: since }, status: 'FILLED', user: USERS }
  const [asset, buys, sells, holders, watchers, alerts, v] = await Promise.all([
    db.asset.findUnique({ where: { symbol }, select: { name: true } }),
    db.trade.groupBy({ by: ['userId'], where: { ...where, side: 'BUY' } }).then(r => r.length),
    db.trade.groupBy({ by: ['userId'], where: { ...where, side: 'SELL' } }).then(r => r.length),
    db.position.count({ where: { symbol, user: USERS } }),
    db.watchItem.count({ where: { symbol, user: USERS } }),
    db.priceAlert.count({ where: { symbol, user: USERS } }),
    visitors(path, since),
  ])
  return {
    title: asset?.name ? `${asset.name} (${symbol})` : symbol,
    kpis: [
      { label: 'Visitas a la pantalla', value: v.users },
      { label: 'Compran', value: buys, hint: RANGE_TXT[range] },
      { label: 'Venden', value: sells, hint: RANGE_TXT[range] },
      { label: 'Lo tienen ahora', value: holders },
      { label: 'Lo siguen', value: watchers },
      { label: 'Alertas de precio', value: alerts },
    ],
  }
}

async function plansLens(since: Date, range: LensRange, path: string): Promise<Lens> {
  const count = (name: string) => db.event.groupBy({ by: ['userId'], where: { name, createdAt: { gte: since }, user: { is: USERS } } }).then(r => r.length)
  const [views, walls, trials, paid, cancels, plans, subs, v] = await Promise.all([
    count('premium_view'),
    count('paywall'),
    count('trial_start'),
    count('paid'),
    count('cancel'),
    db.user.groupBy({ by: ['plan'], where: USERS, _count: { _all: true } }),
    db.subscription.groupBy({ by: ['status'], where: { user: USERS }, _count: { _all: true } }),
    visitors(path, since),
  ])
  const PLAN: Record<string, string> = { FREE: 'Free', PLUS: 'Plus', PREMIUM: 'Max' }
  return {
    title: 'Planes',
    kpis: [
      { label: 'Ven los planes', value: views },
      { label: 'Chocan con el muro', value: walls },
      { label: 'Empiezan la prueba', value: trials, hint: views ? `${pct(trials, views)} % de los que ven los planes` : undefined },
      { label: 'Pagan', value: paid, hint: trials ? `${pct(paid, trials)} % de las pruebas` : undefined },
      { label: 'Cancelan', value: cancels },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    bars: [
      { title: 'Usuarios por plan (ahora)', items: ['FREE', 'PLUS', 'PREMIUM'].map(p => ({ label: PLAN[p], value: plans.find(x => x.plan === p)?._count._all ?? 0 })) },
      { title: 'Suscripciones por estado (ahora)', items: subs.map(s => ({ label: s.status, value: s._count._all })) },
    ],
    note: `Usuarios distintos, ${RANGE_TXT[range]}. El cobro aún es simulado: «Pagan» se llenará con Stripe.`,
  }
}

async function leagueLens(since: Date, path: string): Promise<Lens> {
  const week = weekOf()
  const [rows, v] = await Promise.all([db.leagueMember.groupBy({ by: ['division'], where: { weekKey: week }, _count: { _all: true }, _avg: { xp: true } }), visitors(path, since)])
  return {
    title: 'Liga',
    kpis: [
      { label: 'En liga esta semana', value: rows.reduce((a, r) => a + r._count._all, 0) },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    tables: [{ title: `Semana del ${week}`, head: ['División', 'Personas', 'XP media'], rows: rows.sort((a, b) => a.division - b.division).map(r => [DIVISIONS[r.division - 1] ?? r.division, r._count._all, Math.round(r._avg.xp ?? 0)]) }],
  }
}

async function badgesLens(since: Date, path: string): Promise<Lens> {
  const [rows, users, v] = await Promise.all([db.userAchievement.groupBy({ by: ['code'], where: { user: USERS }, _count: { _all: true } }), db.user.count({ where: USERS }), visitors(path, since)])
  return {
    title: 'Insignias',
    kpis: [
      { label: 'Insignias ganadas', value: rows.reduce((a, r) => a + r._count._all, 0) },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    tables: [{ title: 'Quién tiene cada insignia', head: ['Insignia', 'Personas', '% de usuarios'], rows: ACHIEVEMENTS.map(a => ({ a, n: rows.find(r => r.code === a.code)?._count._all ?? 0 })).sort((x, y) => y.n - x.n).map(({ a, n }) => [a.title, n, `${pct(n, users) ?? 0} %`]) }],
  }
}

async function streakLens(since: Date, path: string): Promise<Lens> {
  const [games, v] = await Promise.all([db.gameState.findMany({ where: { user: USERS }, select: { streak: true, freezes: true } }), visitors(path, since)])
  const buckets = [
    ['Sin racha', 0, 0],
    ['1-2 días', 1, 2],
    ['3-6 días', 3, 6],
    ['7-29 días', 7, 29],
    ['30+ días', 30, 1e9],
  ] as const
  return {
    title: 'Racha',
    kpis: [
      { label: 'Racha media', value: games.length ? Math.round((games.reduce((a, g) => a + g.streak, 0) / games.length) * 10) / 10 : null },
      { label: 'Con protector de racha', value: games.filter(g => g.freezes > 0).length },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    bars: [{ title: 'Usuarios por racha actual', items: buckets.map(([label, a, b]) => ({ label, value: games.filter(g => g.streak >= a && g.streak <= b).length })) }],
  }
}

async function tutorLens(since: Date, range: LensRange, path: string): Promise<Lens> {
  const where = { createdAt: { gte: since }, role: 'user', user: USERS }
  const [n, users, modes, last, v] = await Promise.all([
    db.tutorMessage.count({ where }),
    db.tutorMessage.groupBy({ by: ['userId'], where }).then(r => r.length),
    db.tutorMessage.groupBy({ by: ['mode'], where, _count: { _all: true } }),
    db.tutorMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: 12, select: { content: true, createdAt: true } }),
    visitors(path, since),
  ])
  return {
    title: 'Pregúntale a Lumi',
    kpis: [
      { label: 'Preguntas', value: n, hint: RANGE_TXT[range] },
      { label: 'Usuarios que preguntan', value: users },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    bars: [{ title: 'Por modo', items: modes.map(m => ({ label: m.mode, value: m._count._all })) }],
    tables: [{ title: 'Últimas preguntas (sin el nombre de quien pregunta)', head: ['Día', 'Pregunta'], rows: last.map(m => [dayOf(m.createdAt), cut(m.content, 120)]) }],
  }
}

async function onboardingLens(since: Date): Promise<Lens> {
  const [steps, done, sources] = await Promise.all([
    db.user.groupBy({ by: ['onboardingStep'], where: { ...USERS, createdAt: { gte: since }, onboardingStep: { not: null } }, _count: { _all: true } }),
    db.user.count({ where: { ...USERS, createdAt: { gte: since }, onboardingStep: null } }),
    db.user.groupBy({ by: ['source'], where: { ...USERS, createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
  ])
  const stuck = steps.reduce((a, s) => a + s._count._all, 0)
  return {
    title: 'Bienvenida (onboarding)',
    kpis: [
      { label: 'La terminan', value: done },
      { label: 'Se quedan a medias', value: stuck, hint: done + stuck ? `${pct(stuck, done + stuck)} % de las altas` : undefined },
    ],
    bars: [
      { title: 'En qué paso se quedan', items: steps.sort((a, b) => (a.onboardingStep ?? 0) - (b.onboardingStep ?? 0)).map(s => ({ label: `Paso ${s.onboardingStep}`, value: s._count._all })) },
      { title: 'De dónde vienen', items: sources.map(s => ({ label: s.source ?? 'sin dato', value: s._count._all })) },
    ],
  }
}

async function invitesLens(since: Date, range: LensRange, path: string): Promise<Lens> {
  const [joined, rewarded, top, gifts, v] = await Promise.all([
    db.user.count({ where: { invitedById: { not: null }, createdAt: { gte: since } } }),
    db.user.count({ where: { inviteRewardedAt: { gte: since } } }),
    db.user.groupBy({ by: ['invitedById'], where: { invitedById: { not: null }, createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
    db.subscription.count({ where: { status: 'GIFT', trialEndsAt: { gt: new Date() } } }),
    visitors(path, since),
  ])
  const names = await db.user.findMany({ where: { id: { in: top.map(t => t.invitedById!) } }, select: { id: true, name: true, email: true } })
  return {
    title: 'Invitaciones',
    kpis: [
      { label: 'Llegan invitados', value: joined, hint: RANGE_TXT[range] },
      { label: 'Terminan su primera clase', value: rewarded, hint: joined ? `${pct(rewarded, joined)} % de los invitados` : undefined },
      { label: 'Con Max regalado ahora', value: gifts },
      { label: 'Visitas a la pantalla', value: v.users },
    ],
    tables: [{ title: 'Quién invita más', head: ['Usuario', 'Invitados'], rows: top.map(t => { const n = names.find(x => x.id === t.invitedById); return [n?.name || n?.email || '—', t._count._all] }) }],
    note: 'El amigo recibe 14 días de Max al entrar; quien invita, 14 días cuando su amigo guarda la cuenta y termina su primera clase (hasta un año).',
  }
}

async function genericLens(title: string, since: Date, range: LensRange, path: string): Promise<Lens> {
  const v = await visitors(path, since)
  return { title, kpis: [{ label: 'Usuarios que la visitan', value: v.users, hint: RANGE_TXT[range] }, ...(v.anon ? [{ label: 'Visitas sin sesión', value: v.anon }] : [])] }
}

const TITLES: Record<string, string> = { '/': 'Página de inicio pública', '/avisos': 'Avisos', '/ajustes': 'Ajustes', '/ajustes/cuenta': 'Cuenta', '/perfil': 'Perfil', '/perfil/lumi': 'Lumi', '/entrar': 'Entrar', '/registro': 'Registro', '/sin-vidas': 'Sin vidas', '/recuperar': 'Recuperar contraseña' }

/** Números de la pantalla que está viendo el admin */
export async function lens(rawPath: string, range: LensRange): Promise<Lens> {
  const path = rawPath.toLowerCase().replace(/\/+$/, '') || '/'
  const since = sinceOf(range)
  const seg = path.split('/').filter(Boolean)
  if ((seg[0] === 'leccion' || seg[0] === 'quiz') && seg[1]) return lessonLens(seg[1], since, range, path)
  if (seg[0] === 'mercado' && seg[1] && !['explorar', 'cartera', 'ordenes'].includes(seg[1])) return assetLens(decodeURIComponent(seg[1]).toUpperCase(), since, range, path)
  switch (seg[0]) {
    case 'inicio':
      return homeLens(since, range, path)
    case 'clases':
      return learnLens(since, range, path)
    case 'mercado':
      return marketLens(since, range, path)
    case 'premium':
      return plansLens(since, range, path)
    case 'liga':
      return leagueLens(since, path)
    case 'insignias':
      return badgesLens(since, path)
    case 'profesora':
      return tutorLens(since, range, path)
    case 'onboarding':
      return onboardingLens(since)
  }
  if (path === '/perfil/logros') return badgesLens(since, path)
  if (path === '/perfil/racha') return streakLens(since, path)
  if (path === '/perfil/invitar') return invitesLens(since, range, path)
  return genericLens(TITLES[path] ?? path, since, range, path)
}

/** Tabla completa de clases para el panel */
export async function lessonTable(range: LensRange) {
  const m = await lessonStats(sinceOf(range))
  return UNITS.flatMap(u =>
    u.lessons.map(l => {
      const s = m.get(l.id)
      return { id: l.id, unit: u.order, unitTitle: u.title, title: l.title, starts: s?.starts ?? 0, quiz: s?.quiz ?? 0, done: s?.done ?? 0, skipped: s?.skipped ?? 0, completion: s && s.starts ? pct(s.done, s.starts) : null }
    }),
  )
}
