import 'server-only'
// Avisos en el móvil (Web Push con claves VAPID). Cada hora la tarea programada decide qué aviso toca a cada persona
// según su hora local y su estado real. Límites: 6 al día como mucho, 1 hora entre uno y otro y nada de 22:00 a 9:00.
// También aquí: el recordatorio del diario de operaciones (en la app para todos; en el móvil, con estos límites)
// y el resumen semanal de la cartera frente al S&P 500 (domingo a las 17:00, solo con datos fiables).
import webpush from 'web-push'
import type { User } from '@/generated/prisma/client'
import type { Tx } from './game/core'
import { DAY_MS, dayOf, weekOf } from '@/shared/time'
import { madridMidnight } from '@/shared/league-points'
import { ALL_Q, pathOf } from './game/learning'
import { priceBook } from './game/trading'
import { candles } from './market/service'
import { LESSON } from './content/catalog'
import { lessonTitleT } from './content/translate'
import { withLocale } from './locale'
import { db } from './db'
import { pushText, WHY, type Lang, type PushKind } from './push-messages'

const PUB = process.env.VAPID_PUBLIC_KEY ?? ''
const PRIV = process.env.VAPID_PRIVATE_KEY ?? ''
export const pushEnabled = PUB.length > 40 && PRIV.length > 20
if (pushEnabled) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'https://e-trading-app.vercel.app', PUB, PRIV)
export const vapidPublicKey = () => (pushEnabled ? PUB : null)

// Intensos pero con cabeza: hasta 6 al día, una hora entre uno y otro, nunca de 22:00 a 9:00
const MAX_PER_DAY = 6
const GAP_MS = 60 * 60_000
// Si aún no tiene ni cartera ni favoritos: los activos más conocidos (datos reales)
const POPULAR = ['BTC-EUR', 'ETH-EUR', 'SOL-EUR', 'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'META', 'ITX.MC', 'SAN.MC', 'SPY', 'GC=F']

// Preferencias de Ajustes: cada aviso pertenece a uno de estos grupos
const PREF: Record<PushKind, string> = { streak: 'STREAK_RISK', streak_last: 'STREAK_RISK', comeback: 'STREAK_RISK', nudge: 'STREAK_RISK', evening: 'STREAK_RISK', unfinished: 'NEW_LESSON', unfinished2: 'NEW_LESSON', review: 'NEW_LESSON', daily: 'NEW_LESSON', trial: 'NEW_LESSON', market: 'PRICE_ALERT', morning: 'PRICE_ALERT', pos_down: 'PRICE_ALERT', pos_up: 'PRICE_ALERT', watch_down: 'PRICE_ALERT', watch_up: 'PRICE_ALERT', league: 'LEAGUE_RESULT', journal: 'NEW_LESSON', weekly: 'PRICE_ALERT' }

export async function saveSubscription(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }, ua: string | null) {
  await db.pushSub.upsert({
    where: { endpoint: sub.endpoint },
    create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, ua: ua?.slice(0, 200) ?? null },
    update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth, fails: 0 },
  })
}

export async function removeSubscription(userId: string, endpoint: string) {
  await db.pushSub.deleteMany({ where: { userId, endpoint } })
}

/** Envía un aviso a todos los móviles de la persona; los que ya no existen se borran */
export async function sendPush(userId: string, msg: { title: string; body: string; url: string; kind: string; key?: string }) {
  if (!pushEnabled) return 0
  const subs = await db.pushSub.findMany({ where: { userId } })
  let ok = 0
  const url = `${msg.url}${msg.url.includes('?') ? '&' : '?'}aviso=${msg.kind}`
  await Promise.all(
    subs.map(async s => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: msg.title, body: msg.body, url, tag: msg.key ? `${msg.kind}-${msg.key}` : msg.kind }), { TTL: 4 * 3600, urgency: 'normal' })
        ok++
        await db.pushSub.update({ where: { id: s.id }, data: { lastOkAt: new Date(), fails: 0 } })
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode
        // 404/410: el móvil ya no acepta avisos (desinstalado o permiso retirado)
        if (code === 404 || code === 410 || s.fails >= 5) await db.pushSub.delete({ where: { id: s.id } }).catch(() => {})
        else await db.pushSub.update({ where: { id: s.id }, data: { fails: { increment: 1 } } }).catch(() => {})
      }
    }),
  )
  if (ok) await db.event.create({ data: { userId, name: 'push_sent', props: { kind: msg.kind, ...(msg.key ? { key: msg.key } : {}) } } })
  return ok
}

const langOf = (u: User): Lang => (u.locale === 'ca' || u.locale === 'en' ? u.locale : 'es')
const hourIn = (tz: string, d = new Date()) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(d))
const weekdayIn = (tz: string, d = new Date()) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short' }).format(d)
// (lo que redondea a 0,0 % va sin signo: «−0,0 %» no dice nada)
const pct = (v: number, lang: Lang) => `${Math.abs(v) < 0.05 ? '' : v >= 0 ? '+' : '−'}${new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(Math.abs(v))} %`

type Candidate = { kind: PushKind; vars: Record<string, string | number>; url: string; key?: string }
type PushUser = User & { game: { streak: number; lastActiveDay: string | null; xp: number; freezes?: number } | null }
/** Lo que ya se le ha enviado hoy (tipo y, en avisos de un activo, cuál) */
type Sent = { kind?: string; key?: string }[]

const list = (xs: string[], lang: Lang) => new Intl.ListFormat(lang === 'en' ? 'en-GB' : lang, { style: 'long', type: 'conjunction' }).format(xs)
const plural = (n: number, lang: Lang, one: Record<Lang, string>, many: Record<Lang, string>) => `${n} ${n === 1 ? one[lang] : many[lang]}`

// ── Diario de operaciones: recordatorio a los 14 días ────
/** Entradas del diario que ya toca revisar (como mucho de hace 30 días: después ya no se recuerdan) */
const dueJournal = (userId: string | undefined, now: Date) =>
  db.journalEntry.findMany({ where: { ...(userId ? { userId } : {}), reviewedAt: null, remindAt: { lte: now, gte: new Date(now.getTime() - 30 * DAY_MS) } }, orderBy: { remindAt: 'asc' }, take: userId ? 10 : 5000 })
export const journalLink = (id: string) => `/mercado/diario?entrada=${id}`
const assetName = async (symbol: string) => (await db.asset.findUnique({ where: { symbol }, select: { name: true } }))?.name ?? symbol
/** «porque te parecía barata» (con «Otro» y una línea escrita, esa línea entre comillas) */
const whyOf = (e: { tag: string; reason: string }, lang: Lang) => (e.tag === 'OTHER' && e.reason ? `«${e.reason.slice(0, 60)}»` : (WHY[lang][e.tag] ?? WHY[lang].OTHER))

const JOURNAL_IN_APP: Record<Lang, (name: string, side: string, why: string) => [string, string]> = {
  es: (name, side, why) => [`¿Se cumplió tu motivo con ${name}?`, `${side === 'SELL' ? 'Vendiste' : 'Compraste'} ${name} porque ${why}. ¿Se ha cumplido? Revísalo en tu diario.`],
  ca: (name, side, why) => [`S’ha complert el teu motiu amb ${name}?`, `Vas ${side === 'SELL' ? 'vendre' : 'comprar'} ${name} perquè ${why}. S’ha complert? Revisa-ho al teu diari.`],
  en: (name, side, why) => [`Did your reason for ${name} play out?`, `You ${side === 'SELL' ? 'sold' : 'bought'} ${name} because ${why}. Did it happen? Check it in your journal.`],
}

/** Aviso dentro de la app (para todos, tengan o no el móvil con avisos): uno por entrada y recordatorio, en horas de día */
export async function journalReminders(now = new Date()) {
  const due = await dueJournal(undefined, now)
  if (!due.length) return 0
  const users = new Map((await db.user.findMany({ where: { id: { in: [...new Set(due.map(d => d.userId))] }, blockedAt: null }, select: { id: true, timezone: true, locale: true } })).map(u => [u.id, u]))
  const doneUsers = new Set<string>()
  let created = 0
  for (const e of due) {
    const u = users.get(e.userId)
    if (!u || doneUsers.has(u.id)) continue // uno por persona y ronda
    const h = hourIn(u.timezone, now)
    if (h < 9 || h >= 22) continue
    const link = journalLink(e.id)
    if (await db.notification.findFirst({ where: { userId: u.id, deepLink: link, createdAt: { gte: e.remindAt } }, select: { id: true } })) continue
    const lang: Lang = u.locale === 'ca' || u.locale === 'en' ? u.locale : 'es'
    const [title, body] = JOURNAL_IN_APP[lang](await assetName(e.symbol), e.side, whyOf(e, lang))
    await db.notification.create({ data: { userId: u.id, type: 'ORDER_FILLED', title, body, deepLink: link } })
    doneUsers.add(u.id)
    created++
  }
  return created
}

// ── Resumen semanal: tu cartera frente al S&P 500 ────────
/** Rentabilidad de la semana de la liga (base al entrar esta semana y dinero que entra o sale aparte, como en la liga)
 *  y la del S&P 500 en el mismo tiempo. null si no hay datos fiables: entonces no se manda nada. */
export async function weeklyNumbers(userId: string, now = new Date()) {
  const weekKey = weekOf(now)
  const m = await db.leagueMember.findUnique({ where: { weekKey_userId: { weekKey, userId } } })
  // Tiene que cubrir casi toda la semana (entró el lunes o el martes) y tener algo invertido
  if (!m || m.startValue === null || m.joinedAt.getTime() > madridMidnight(weekKey).getTime() + 2 * DAY_MS || m.joinedAt > now) return null
  if (!(await db.position.count({ where: { userId } }))) return null
  const { portfolioValues } = await import('./game/league')
  const v = (await portfolioValues(db as unknown as Tx, [userId])).get(userId)?.value
  if (v === undefined) return null
  const start = Number(m.startValue)
  const flows = Number(m.flows)
  const base = start + Math.max(0, flows)
  if (!(base > 0)) return null
  const me = ((v - start - flows) / base) * 100
  if (!Number.isFinite(me) || Math.abs(me) > 50) return null
  // S&P 500: último cierre antes de que empezara su semana y el precio guardado de ahora (reciente)
  const [q, days] = await Promise.all([db.quote.findUnique({ where: { symbol: '^GSPC' } }), candles('^GSPC', '1d').catch(() => [])])
  if (!q || now.getTime() - q.asOf.getTime() > 4 * DAY_MS) return null
  const before = days.filter(k => k.t * 1000 < m.joinedAt.getTime() && k.c > 0).at(-1)
  if (!before || m.joinedAt.getTime() - before.t * 1000 > 5 * DAY_MS) return null
  const idx = (Number(q.price) / before.c - 1) * 100
  if (!Number.isFinite(idx) || Math.abs(idx) > 30) return null
  return { me, idx }
}

/** Sus activos (cartera y favoritos) con la variación de hoy; solo precios recientes y reales */
async function movesOf(u: User, maxAgeMs: number) {
  const [pos, watch] = await Promise.all([db.position.findMany({ where: { userId: u.id }, select: { symbol: true } }), db.watchItem.findMany({ where: { userId: u.id }, select: { symbol: true } })])
  const held = new Set(pos.map(x => x.symbol))
  const watched = new Set(watch.map(x => x.symbol).filter(x => !held.has(x)))
  const book = await priceBook([...held, ...watched])
  const now = Date.now()
  return [...book.values()]
    .filter(p => p.prevClose > 0 && now - p.asOf < maxAgeMs)
    .map(p => ({ p, chg: (p.price / p.prevClose - 1) * 100, held: held.has(p.symbol), watched: watched.has(p.symbol) }))
    .sort((x, y) => Math.abs(y.chg) - Math.abs(x.chg))
}

/** Qué aviso toca ahora a esta persona (o ninguno). `sent` = lo que ya se le envió hoy. */
export async function candidateFor(u: PushUser, lang: Lang, hour: number, today: string, sent: Sent = [], now = new Date()): Promise<Candidate | null> {
  const g = u.game
  const activeToday = g?.lastActiveDay === today
  const daysAway = g?.lastActiveDay ? Math.round((Date.parse(today) - Date.parse(g.lastActiveDay)) / 86_400_000) : 99
  const had = (k: PushKind) => sent.some(x => x.kind === k)
  const nextLesson = async () => {
    const p = await withLocale(lang, () => pathOf(db, u))
    const l = p.units.flatMap(x => x.lessons).find(x => x.status === 'AVAILABLE')
    return l ? { id: l.id, title: l.title, min: l.minutes } : null
  }
  const lessonUrl = (l: { id: string } | null) => (l ? `/leccion/${l.id}` : '/clases')
  /** Clase que dejó a medias en las últimas 30 h (y no ha terminado después) */
  const unfinished = async () => {
    const ex = await db.event.findFirst({ where: { userId: u.id, name: 'lesson_exit', createdAt: { gte: new Date(Date.now() - 30 * 3_600_000) } }, orderBy: { createdAt: 'desc' } })
    const p = ex?.props as { lessonId?: string; step?: number; of?: number } | undefined
    if (!p?.lessonId || !LESSON[p.lessonId] || (await db.lessonProgress.count({ where: { userId: u.id, lessonId: p.lessonId } }))) return null
    return { id: p.lessonId, title: lessonTitleT(lang, p.lessonId, LESSON[p.lessonId].title), step: p.step ?? 1, of: p.of ?? 6, xp: LESSON[p.lessonId].xp }
  }

  // 19:00 racha en peligro · 21:00 últimas horas (o, si ya ha hecho algo hoy, el resumen del día)
  if (hour === 21 && activeToday) {
    const since = new Date(Date.now() - 24 * 3_600_000)
    const [lessons, trades] = await Promise.all([
      db.lessonProgress.findMany({ where: { userId: u.id, completedAt: { gte: since } }, select: { completedAt: true } }),
      db.trade.findMany({ where: { userId: u.id, status: 'FILLED', createdAt: { gte: since } }, select: { createdAt: true } }),
    ])
    const nL = lessons.filter(x => dayOf(x.completedAt, u.timezone) === today).length
    const nT = trades.filter(x => dayOf(x.createdAt, u.timezone) === today).length
    const parts = [
      nL ? plural(nL, lang, { es: 'clase', ca: 'classe', en: 'lesson' }, { es: 'clases', ca: 'classes', en: 'lessons' }) : '',
      nT ? plural(nT, lang, { es: 'operación', ca: 'operació', en: 'trade' }, { es: 'operaciones', ca: 'operacions', en: 'trades' }) : '',
      g && g.streak > 0 ? { es: `racha de ${g.streak} ${g.streak === 1 ? 'día' : 'días'}`, ca: `ratxa de ${g.streak} ${g.streak === 1 ? 'dia' : 'dies'}`, en: `a ${g.streak}-day streak` }[lang] : '',
    ].filter(Boolean)
    const l = await nextLesson()
    if (parts.length) return { kind: 'evening', vars: { summary: list(parts, lang).replace(/^./, c => c.toUpperCase()), lesson: l?.title ?? '' }, url: lessonUrl(l) }
  }
  if (hour === 19 || hour === 21) {
    // (con protectores, la racha sigue viva aunque falte algún día: cada protector cubre uno)
    if (g && g.streak >= 1 && !activeToday && daysAway <= 1 + (g.freezes ?? 0)) {
      const l = await nextLesson()
      return { kind: hour === 21 ? 'streak_last' : 'streak', vars: { n: g.streak, lesson: l?.title ?? '' }, url: lessonUrl(l) }
    }
    if (hour === 19 && daysAway >= 3 && daysAway % 3 === 0 && daysAway <= 30) {
      const l = await nextLesson()
      return { kind: 'comeback', vars: { lesson: l?.title ?? '' }, url: l ? `/leccion/${l.id}` : '/inicio' }
    }
    // Sin racha que salvar y sin haber entrado hoy (pero vino hace poco): la clase de hoy
    if (hour === 19 && !activeToday && daysAway <= 2) {
      const l = await nextLesson()
      if (l) return { kind: 'nudge', vars: { lesson: l.title }, url: lessonUrl(l) }
    }
  }
  // 9:00 resumen de la mañana: cómo se mueve lo suyo (cotizaciones de las últimas 36 h) y la clase del día
  if (hour === 9) {
    const mv = (await movesOf(u, 36 * 3_600_000)).slice(0, 3)
    const l = await nextLesson()
    if (mv.length && l) return { kind: 'morning', vars: { moves: mv.map(m => `${m.p.name} ${pct(m.chg, lang)}`).join(' · '), lesson: l.title }, url: '/mercado' }
    if (!activeToday && l) return { kind: 'daily', vars: { lesson: l.title, min: l.min }, url: lessonUrl(l) }
  }
  // Domingo 17:00: la semana de su cartera frente al S&P 500 (solo con datos fiables)
  if (hour === 17 && weekdayIn(u.timezone, now) === 'Sun' && !had('weekly')) {
    const w = await weeklyNumbers(u.id, now)
    if (w) return { kind: 'weekly', vars: { me: pct(w.me, lang), idx: pct(w.idx, lang) }, url: '/mercado/cartera' }
  }
  // De 10:00 a 20:00 (menos a las 19, la hora de la racha): «Compraste X porque …, ¿se ha cumplido?». Uno al día.
  if (hour >= 10 && hour <= 20 && hour !== 19 && !had('journal')) {
    for (const e of await dueJournal(u.id, now)) {
      if (await db.event.findFirst({ where: { userId: u.id, name: 'push_sent', createdAt: { gte: e.remindAt }, props: { path: ['key'], equals: e.id } }, select: { id: true } })) continue
      return { kind: 'journal', vars: { name: await assetName(e.symbol), side: e.side, why: whyOf(e, lang) }, url: journalLink(e.id), key: e.id }
    }
  }
  // De 10:00 a 20:00: si algo suyo se mueve fuerte (cartera ±3 %, favoritos ±4 %), aviso al momento; hasta 2 al día, uno por activo
  if (hour >= 10 && hour <= 20 && sent.filter(x => x.kind?.startsWith('pos_') || x.kind?.startsWith('watch_')).length < 2) {
    const mv = (await movesOf(u, 90 * 60_000)).filter(m => m.p.tradable && !sent.some(x => x.key === m.p.symbol))
    const hit = mv.find(m => (m.held && Math.abs(m.chg) >= 3) || (m.watched && Math.abs(m.chg) >= 4))
    if (hit) {
      const kind: PushKind = hit.held ? (hit.chg < 0 ? 'pos_down' : 'pos_up') : hit.chg < 0 ? 'watch_down' : 'watch_up'
      return { kind, vars: { name: hit.p.name, chg: pct(hit.chg, lang) }, url: `/mercado/${encodeURIComponent(hit.p.symbol)}`, key: hit.p.symbol }
    }
  }
  // 11:00 días de Max que quedan (a 2 días y al último)
  if (hour === 11) {
    const sub = await db.subscription.findUnique({ where: { userId: u.id } })
    if ((sub?.status === 'TRIALING' || sub?.status === 'GIFT') && sub.trialEndsAt) {
      const left = Math.ceil((sub.trialEndsAt.getTime() - now.getTime()) / 86_400_000)
      if (left === 2 || left === 1) return { kind: 'trial', vars: { n: left }, url: '/clases' }
    }
  }
  // 12:00 repaso de lo que falló (si tiene 3 o más pendientes)
  if (hour === 12 && !activeToday) {
    const due = await db.mistake.count({ where: { userId: u.id, questionId: { in: Object.keys(ALL_Q) }, dueAt: { lte: new Date() } } })
    if (due >= 3) return { kind: 'review', vars: { n: due }, url: '/quiz/review' }
  }
  // 13:00 clase a medias · 18:00 segundo aviso si sigue sin terminarla
  if ((hour === 13 || (hour === 18 && had('unfinished'))) && !had('unfinished2')) {
    const x = await unfinished()
    if (x && hour === 13) return { kind: 'unfinished', vars: { lesson: x.title, step: x.step, of: x.of, xp: x.xp }, url: `/leccion/${x.id}` }
    if (x && hour === 18) return { kind: 'unfinished2', vars: { lesson: x.title, left: Math.max(1, x.of - x.step) }, url: `/leccion/${x.id}` }
  }
  // 16:00 (abre Wall Street; el fin de semana, cripto): el activo que más se mueve de los suyos o de los más conocidos
  if (hour === 16 && !sent.some(x => x.kind?.startsWith('pos_') || x.kind?.startsWith('watch_'))) {
    const own = await movesOf(u, 90 * 60_000)
    const pool = own.length ? own.map(m => m.p) : [...(await priceBook(POPULAR)).values()]
    const best = pool.filter(p => p.prevClose > 0 && p.tradable).map(p => ({ p, chg: (p.price / p.prevClose - 1) * 100 })).sort((a, b) => Math.abs(b.chg) - Math.abs(a.chg))[0]
    if (best && Math.abs(best.chg) >= 0.5) return { kind: 'market', vars: { name: best.p.name, chg: pct(best.chg, lang) }, url: `/mercado/${encodeURIComponent(best.p.symbol)}` }
  }
  // Miércoles 17:00 (mitad de semana) y domingo 18:00 (se cierra el lunes): cómo va en la liga
  const wd = weekdayIn(u.timezone, now)
  if ((hour === 18 && wd === 'Sun') || (hour === 17 && wd === 'Wed')) {
    const { withCtx } = await import('./game/core')
    const { leagueFor, leagueWeekKey } = await import('./game/league')
    // Solo a quien ya está en la liga esta semana (abrir la liga desde aquí le metería sin haber usado la app)
    if (!(await db.leagueMember.findUnique({ where: { weekKey_userId: { weekKey: leagueWeekKey(), userId: u.id } } }))) return null
    const l = await withCtx(c => leagueFor(c), u)
    const me = l.members.find(m => m.isMe)
    const cut = l.members.find(m => m.rank === l.promoteTop)
    if (me && me.rank > 0 && l.members.length > 1) {
      const hours = Math.max(1, Math.round((Date.parse(l.endsAt) - now.getTime()) / 3_600_000))
      // (para subir hace falta algo de XP esta semana: en zona de ascenso sin XP aún no se sube)
      const inZone = me.rank <= l.promoteTop && me.weeklyXp > 0
      return { kind: 'league', vars: { rank: me.rank, gap: inZone ? 0 : Math.max(1, (cut?.score ?? 0) - me.score + 1), hours }, url: '/liga' }
    }
  }
  return null
}

/** ¿Se le puede enviar algo ahora? Nada de 22:00 a 9:00 (su hora), 6 al día como mucho y 1 hora entre uno y otro.
 *  `recent` = avisos enviados en las últimas 24 h. Devuelve su hora, su día y lo que ya se le envió hoy. */
export function pushSlot(u: Pick<User, 'id' | 'timezone'>, now: Date, recent: { userId: string | null; createdAt: Date; props: unknown }[]) {
  const hour = hourIn(u.timezone, now)
  if (hour < 9 || hour >= 22) return null
  const today = dayOf(now, u.timezone)
  const mine = recent.filter(r => r.userId === u.id && dayOf(r.createdAt, u.timezone) === today)
  if (mine.length >= MAX_PER_DAY) return null
  if (recent.some(r => r.userId === u.id && now.getTime() - r.createdAt.getTime() < GAP_MS)) return null
  return { hour, today, already: mine.map(r => (r.props ?? {}) as { kind?: string; key?: string }) }
}

/** Ronda de avisos (la llama la tarea programada cada hora) */
export async function runPushRound(now = new Date()) {
  // El recordatorio del diario dentro de la app va para todos (aunque no haya avisos en el móvil)
  const journal = await journalReminders(now).catch(e => (console.error('journal', e), 0))
  if (!pushEnabled) return { sent: 0, users: 0, journal, skipped: 'sin claves VAPID' }
  const users = await db.user.findMany({ where: { blockedAt: null, pushSubs: { some: {} } }, include: { game: { select: { streak: true, lastActiveDay: true, xp: true, freezes: true } } }, take: 5000 })
  const since = new Date(now.getTime() - 24 * 3_600_000)
  const recent = await db.event.findMany({ where: { name: 'push_sent', userId: { in: users.map(u => u.id) }, createdAt: { gte: since } }, select: { userId: true, createdAt: true, props: true } })
  let sent = 0
  const queue = [...users]
  // De 8 en 8 para no saturar
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let u = queue.shift(); u; u = queue.shift()) {
        try {
          const slot = pushSlot(u, now, recent)
          if (!slot) continue
          const { hour, today, already } = slot
          const lang = langOf(u)
          const c = await candidateFor(u, lang, hour, today, already, now)
          if (!c) continue
          // Cada tipo, una vez al día (los de un activo, una vez por activo)
          if (already.some(r => r.kind === c.kind && (r.key ?? null) === (c.key ?? null))) continue
          const prefs = (u.settings as { prefsTouched?: boolean; notificationPrefs?: Record<string, { push?: boolean }> } | null) ?? {}
          if (prefs.prefsTouched && prefs.notificationPrefs?.[PREF[c.kind]]?.push === false) continue
          const msg = pushText(c.kind, lang, c.vars, Number(today.replaceAll('-', '')) + u.id.length)
          sent += (await sendPush(u.id, { ...msg, url: `/${lang}${c.url}`, kind: c.kind, key: c.key })) ? 1 : 0
        } catch (e) {
          console.error('push', u.id, e)
        }
      }
    }),
  )
  return { sent, users: users.length, journal }
}

/** Primer aviso al activarlos: confirma que funcionan */
export async function welcomePush(user: User) {
  const lang = langOf(user)
  const T = { es: ['Avisos activados', 'Te avisaremos para no perder la racha, retomar tus clases y no perderte lo que pasa en el mercado.'], ca: ['Avisos activats', 'T’avisarem per no perdre la ratxa, reprendre les classes i no perdre’t el que passa al mercat.'], en: ['Notifications on', 'We’ll remind you to keep your streak, pick up your lessons and catch what’s happening in the market.'] }[lang]
  return sendPush(user.id, { title: T[0], body: T[1], url: `/${lang}/inicio`, kind: 'welcome' })
}

