import 'server-only'
// Misiones «Pruébalo» (aprender haciendo). Al aprobar una clase con misión, la misión se abre (Mission.startedAt =
// cuándo se aprobó). Se comprueba «a posteriori», sin ganchos en el mercado: al pedir /api/missions se mira en la base
// de datos si desde que se abrió hay una compra, una orden, una alerta, un favorito, una pantalla vista o una entrada
// del diario que la cumpla. Cumplida: doneAt, +20 XP una sola vez y un aviso. Lo hecho antes de abrirla no cuenta.
import type { Prisma } from '@/generated/prisma/client'
import type { LessonMissionT, MissionsT, MissionT } from '@/shared/contract'
import { LESSON } from '../content/catalog'
import { hrefOf, MISSION_DAYS, MISSION_XP, MISSIONS, targetsOf, tryItIn, type MissionDef, type MissionKind } from '../content/missions'
import { lessonTitleT, stepsT } from '../content/translate'
import { currentLocale, type Loc } from '../locale'
import { walkTexts } from '@/shared/play'
import { DAY_MS } from '@/shared/time'
import { addXp, endFx, fail, lockUser, notify, withCtx, type Ctx } from './core'

// ── Frase de la clase en el idioma de la pantalla ────────
const textCache = new Map<string, string | null>()
export function missionText(loc: Loc, lessonId: string): string | null {
  const key = `${loc}:${lessonId}`
  if (textCache.has(key)) return textCache.get(key)!
  const l = LESSON[lessonId]
  let out: string | null = null
  if (l) {
    const steps = stepsT(loc, lessonId, l.steps)
    // De la última a la primera: la frase está casi siempre en el último paso (consejo o texto final de la pieza)
    for (let i = steps.length - 1; i >= 0 && !out; i--) {
      const s = steps[i]
      const texts: string[] = []
      if (s.kind === 'TEXT' || s.kind === 'IMAGE' || s.kind === 'CALC') texts.push(s.body, s.tip ?? '')
      else if (s.kind === 'PLAY') walkTexts(s.play, v => (texts.push(v), v))
      else if (s.kind === 'STORY') walkTexts(s.story, v => (texts.push(v), v))
      for (let k = texts.length - 1; k >= 0 && !out; k--) out = tryItIn(texts[k])
    }
  }
  textCache.set(key, out)
  return out
}

function toT(loc: Loc, lessonId: string, def: MissionDef, row: { startedAt: Date; doneAt: Date | null } | null): MissionT {
  const l = LESSON[lessonId]
  return {
    lessonId,
    lessonTitle: lessonTitleT(loc, lessonId, l?.title ?? lessonId),
    text: missionText(loc, lessonId) ?? missionText('es', lessonId) ?? '',
    kind: def.kind,
    symbols: targetsOf(def),
    href: hrefOf(def),
    xp: MISSION_XP,
    startedAt: row?.startedAt.toISOString() ?? null,
    doneAt: row?.doneAt?.toISOString() ?? null,
  }
}

/** «Misión cumplida» se sigue mostrando en Inicio durante 6 horas */
const RECENT_MS = 6 * 3_600_000

// ── Apertura perezosa (desde la clase aprobada) ──────────
const MISSION_IDS = Object.keys(MISSIONS).filter(id => LESSON[id])

/** Abre las misiones de las clases aprobadas desde que existen (sin contar las saltadas con una prueba de nivel) */
async function openFromLessons(c: Ctx) {
  // Desde cuándo: la primera vez que se miran sus misiones (quien se registró hace menos de un día, desde el alta).
  // Así a quien ya usaba la app no se le abren de golpe las misiones de todas sus clases antiguas.
  if (c.counters.missionsFrom === undefined) {
    await lockUser(c)
    if (c.counters.missionsFrom === undefined) {
      const signupMin = Math.floor(c.user.createdAt.getTime() / 60_000)
      const nowMin = Math.floor(Date.now() / 60_000)
      c.counters.missionsFrom = nowMin - signupMin < 24 * 60 ? signupMin : nowMin
    }
  }
  const from = Math.max(c.counters.missionsFrom * 60_000, Date.now() - MISSION_DAYS * DAY_MS)
  const done = await c.tx.lessonProgress.findMany({ where: { userId: c.user.id, skipped: false, lessonId: { in: MISSION_IDS }, completedAt: { gte: new Date(from) } }, select: { lessonId: true, completedAt: true } })
  if (!done.length) return
  const have = new Set((await c.tx.mission.findMany({ where: { userId: c.user.id, lessonId: { in: done.map(d => d.lessonId) } }, select: { lessonId: true } })).map(m => m.lessonId))
  const missing = done.filter(d => !have.has(d.lessonId))
  if (missing.length) await c.tx.mission.createMany({ data: missing.map(d => ({ userId: c.user.id, lessonId: d.lessonId, startedAt: d.completedAt })), skipDuplicates: true })
}

// ── Comprobación ─────────────────────────────────────────
type Facts = {
  orders: { symbol: string; side: string; type: string; status: string; stopLoss: unknown; takeProfit: unknown; createdAt: Date; assetType?: string }[]
  alerts: { symbol: string; createdAt: Date }[]
  watch: { symbol: string; createdAt: Date }[]
  views: { path: string; createdAt: Date }[]
  journal: { createdAt: Date }[]
}

const pathVariants = (sym: string) => [`/mercado/${sym}`, `/mercado/${encodeURIComponent(sym)}`].map(p => p.toLowerCase())
const RESERVED = new Set(['cartera', 'explorar', 'ordenes', 'diario'])
const isAssetPath = (p: string) => {
  const m = /^\/mercado\/([^/]+)$/.exec(p)
  return !!m && !RESERVED.has(m[1])
}

async function factsSince(c: Ctx, since: Date, kinds: Set<MissionKind>): Promise<Facts> {
  const uid = c.user.id
  const needOrders = ['BUY_TYPE', 'BUY_SYMBOL', 'SELL', 'LIMIT_ORDER', 'STOP_ORDER', 'TAKE_PROFIT'].some(k => kinds.has(k as MissionKind))
  const needViews = kinds.has('VIEW_ASSET') || kinds.has('OPEN_PORTFOLIO') || kinds.has('EXPLORE')
  const [orders, alerts, watch, events, journal] = await Promise.all([
    // Las salidas que se crean solas al comprar (parentId) no son una acción de la persona
    needOrders ? c.tx.order.findMany({ where: { userId: uid, createdAt: { gte: since }, status: { in: ['PENDING', 'FILLED'] }, parentId: null }, select: { symbol: true, side: true, type: true, status: true, stopLoss: true, takeProfit: true, createdAt: true }, take: 500 }) : [],
    kinds.has('ALERT') ? c.tx.priceAlert.findMany({ where: { userId: uid, createdAt: { gte: since } }, select: { symbol: true, createdAt: true }, take: 500 }) : [],
    kinds.has('WATCH') ? c.tx.watchItem.findMany({ where: { userId: uid }, select: { symbol: true, createdAt: true } }) : [],
    needViews ? c.tx.event.findMany({ where: { userId: uid, name: { in: ['screen_view', 'mission_seen'] }, createdAt: { gte: since } }, select: { props: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1000 }) : [],
    kinds.has('JOURNAL') ? c.tx.journalEntry.findMany({ where: { userId: uid, createdAt: { gte: since } }, select: { createdAt: true }, take: 100 }) : [],
  ])
  const syms = [...new Set(orders.map(o => o.symbol))]
  const types = syms.length ? new Map((await c.tx.asset.findMany({ where: { symbol: { in: syms } }, select: { symbol: true, type: true } })).map(a => [a.symbol, a.type as string])) : new Map<string, string>()
  // Favoritos de partida: la app crea varios de golpe la primera vez que se abre el mercado; esos no son de la persona
  const seeded = (t: Date) => watch.filter(w => Math.abs(w.createdAt.getTime() - t.getTime()) < 1500).length >= 4
  return {
    orders: orders.map(o => ({ ...o, assetType: types.get(o.symbol) })),
    alerts,
    watch: watch.filter(w => w.createdAt >= since && !seeded(w.createdAt)),
    views: events.map(e => ({ path: String((e.props as { path?: unknown } | null)?.path ?? '').toLowerCase(), createdAt: e.createdAt })),
    journal,
  }
}

/** ¿Se ha cumplido esta misión con lo hecho desde que se abrió? */
function met(def: MissionDef, startedAt: Date, f: Facts): boolean {
  const after = <T extends { createdAt: Date }>(xs: T[]) => xs.filter(x => x.createdAt >= startedAt)
  const syms = targetsOf(def)
  const symOk = (s: string) => !syms.length || syms.includes(s)
  const has = (v: unknown) => v !== null && v !== undefined && Number(v) > 0
  switch (def.kind) {
    case 'VIEW_ASSET': {
      const paths = new Set(syms.flatMap(pathVariants))
      return after(f.views).some(v => (syms.length ? paths.has(v.path) : isAssetPath(v.path)))
    }
    case 'OPEN_PORTFOLIO':
      return after(f.views).some(v => v.path === '/mercado/cartera')
    case 'EXPLORE':
      return after(f.views).some(v => v.path === '/mercado/explorar')
    case 'BUY_TYPE':
      return after(f.orders).some(o => o.side === 'BUY' && (!def.target || o.assetType === def.target))
    case 'BUY_SYMBOL':
      return after(f.orders).some(o => o.side === 'BUY' && symOk(o.symbol))
    case 'SELL':
      return after(f.orders).some(o => o.side === 'SELL' && symOk(o.symbol))
    case 'LIMIT_ORDER':
      return after(f.orders).some(o => o.type === 'LIMIT' && symOk(o.symbol))
    case 'STOP_ORDER':
      if (def.target === 'BOTH') return after(f.orders).some(o => o.side === 'BUY' && has(o.stopLoss) && has(o.takeProfit))
      return after(f.orders).some(o => o.type === 'STOP_LOSS' || (o.side === 'BUY' && has(o.stopLoss)))
    case 'TAKE_PROFIT':
      return after(f.orders).some(o => o.type === 'TAKE_PROFIT' || (o.side === 'BUY' && has(o.takeProfit)))
    case 'ALERT':
      return after(f.alerts).some(a => symOk(a.symbol))
    case 'WATCH':
      return after(f.watch).some(w => symOk(w.symbol))
    case 'JOURNAL':
      return after(f.journal).length > 0
  }
}

const DONE_TEXT: Record<Loc, (text: string, xp: number) => [string, string]> = {
  es: (text, xp) => ['Misión cumplida', `${text} · +${xp} XP`],
  ca: (text, xp) => ['Missió complerta', `${text} · +${xp} XP`],
  en: (text, xp) => ['Mission complete', `${text} · +${xp} XP`],
}
const userLoc = (l: string | null | undefined): Loc => (l === 'ca' || l === 'en' ? l : 'es')

/** Abre las misiones nuevas, comprueba las pendientes y cobra las cumplidas. Devuelve las cumplidas ahora. */
export async function evaluate(c: Ctx): Promise<{ lessonId: string; doneAt: Date }[]> {
  await openFromLessons(c)
  const pending = await c.tx.mission.findMany({ where: { userId: c.user.id, doneAt: null, startedAt: { gte: new Date(Date.now() - MISSION_DAYS * DAY_MS) } } })
  const live = pending.filter(m => MISSIONS[m.lessonId])
  if (!live.length) return []
  const since = new Date(Math.min(...live.map(m => m.startedAt.getTime())))
  const facts = await factsSince(c, since, new Set(live.map(m => MISSIONS[m.lessonId].kind)))
  const hit = live.filter(m => met(MISSIONS[m.lessonId], m.startedAt, facts))
  if (!hit.length) return []
  // Hay XP que dar: con el usuario bloqueado (en una lectura aún no lo estaba), y solo si nadie la ha cobrado antes
  await lockUser(c)
  const out: { lessonId: string; doneAt: Date }[] = []
  const loc = userLoc(c.user.locale)
  for (const m of hit) {
    const doneAt = new Date()
    const r = await c.tx.mission.updateMany({ where: { userId: c.user.id, lessonId: m.lessonId, doneAt: null }, data: { doneAt } })
    if (!r.count) continue
    addXp(c, MISSION_XP)
    const [title, body] = DONE_TEXT[loc](missionText(loc, m.lessonId) ?? '', MISSION_XP)
    await notify(c, 'ACHIEVEMENT', title, body.slice(0, 300), '/inicio')
    out.push({ lessonId: m.lessonId, doneAt })
  }
  return out
}

async function listIn(c: Ctx): Promise<MissionsT> {
  const just = await evaluate(c)
  const fx = just.length ? await endFx(c) : null
  const loc = currentLocale()
  const since = new Date(Date.now() - MISSION_DAYS * DAY_MS)
  const rows = await c.tx.mission.findMany({ where: { userId: c.user.id, OR: [{ doneAt: null, startedAt: { gte: since } }, { doneAt: { gte: new Date(Date.now() - RECENT_MS) } }] }, orderBy: { startedAt: 'desc' }, take: 50 })
  const known = rows.filter(r => MISSIONS[r.lessonId])
  const T = (r: (typeof rows)[number]) => toT(loc, r.lessonId, MISSIONS[r.lessonId], r)
  const justIds = new Set(just.map(j => j.lessonId))
  return {
    pending: known.filter(r => !r.doneAt).map(T),
    recentDone: known.filter(r => r.doneAt).sort((a, b) => b.doneAt!.getTime() - a.doneAt!.getTime()).map(T),
    justDone: known.filter(r => justIds.has(r.lessonId)).map(T),
    xpGained: fx?.xp ?? 0,
  }
}

/** GET /api/missions */
export const missions = () => withCtx(listIn)

/** GET /api/missions/lesson/:id: la misión de una clase (para la pantalla final) */
export const lessonMission = (lessonId: string) =>
  withCtx(async (c): Promise<LessonMissionT> => {
    const def = MISSIONS[lessonId]
    if (!def || !LESSON[lessonId] || !missionText('es', lessonId)) return { mission: null, state: 'NONE', xpGained: 0 }
    const just = await evaluate(c)
    const fx = just.length ? await endFx(c) : null
    const row = await c.tx.mission.findUnique({ where: { userId_lessonId: { userId: c.user.id, lessonId } } })
    const loc = currentLocale()
    const state = !row ? 'LOCKED' : row.doneAt ? 'DONE' : row.startedAt.getTime() < Date.now() - MISSION_DAYS * DAY_MS ? 'EXPIRED' : 'OPEN'
    return { mission: toT(loc, lessonId, def, row), state, xpGained: fx?.xp ?? 0 }
  })

/** POST /api/missions/seen: la app avisa de que se ha abierto la ficha de un activo o la cartera.
 *  (La analítica de pantallas cuenta una visita al día: si ya la había abierto hoy antes de la misión, no llegaba otra.)
 *  Solo se apunta si hay una misión abierta que lo pida. */
export const missionSeen = (what: { symbol?: string; portfolio?: boolean }) =>
  withCtx(async c => {
    const pending = await c.tx.mission.findMany({ where: { userId: c.user.id, doneAt: null, startedAt: { gte: new Date(Date.now() - MISSION_DAYS * DAY_MS) } }, select: { lessonId: true } })
    const defs = pending.map(m => MISSIONS[m.lessonId]).filter(Boolean)
    let path: string | null = null
    if (what.portfolio && defs.some(d => d.kind === 'OPEN_PORTFOLIO')) path = '/mercado/cartera'
    if (what.symbol) {
      const sym = what.symbol
      if (defs.some(d => d.kind === 'VIEW_ASSET' && (!targetsOf(d).length || targetsOf(d).includes(sym)))) {
        if (!(await c.tx.asset.findUnique({ where: { symbol: sym }, select: { symbol: true } }))) fail(404, 'NOT_FOUND', 'Activo no encontrado')
        path = `/mercado/${encodeURIComponent(sym)}`.toLowerCase()
      }
    }
    if (path) await c.tx.event.create({ data: { userId: c.user.id, name: 'mission_seen', props: { path } satisfies Prisma.InputJsonValue } })
    return listIn(c)
  })
