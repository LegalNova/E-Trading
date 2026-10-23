// Implementación simulada de la API (etapa 2). Todo ocurre en el navegador.
import type {
  AchievementT, AssetDetailT, AssetItemT, CandleT, CoursePathT, EffectsT, FeatureT, HomeT, LessonStepT, LivesT, Mood,
  NotificationT, OrderPreviewT, OrderT, PathUnitT, PortfolioT, QuestionT, QuizFinishT, StreakT, TradeT,
} from '@/shared/contract'
import { fix2, fix8 } from '@/shared/format'
import { isOpen, nextOpen } from '@/shared/market-hours'
import { ApiFailure, type Api, type OrderInput } from '../types'
import { ACHIEVEMENTS, ASSET, ASSETS, DIVISIONS, LEAGUE_NAMES, LESSON, LEVEL_TITLES, LUMI, PLACEMENT, QUIZZES, UNITS, type MockQuestion } from './catalog'
import {
  DAY, LIFE_MS, LIVES_MAX, START_CASH, addDays, bridge, dayOf, freshState, gauss, levelOf, load, rng, sampleState, save, uid, weekOf,
  type Attempt, type State,
} from './state'

const wait = (ms = 140) => new Promise(r => setTimeout(r, ms + Math.random() * 80))
const fail = (code: string, message: string, status = 400): never => {
  throw new ApiFailure(code, message, status)
}
const ADMIN_EMAIL = 'jvidalalmirall@gmail.com'
const RISK_PCT = 20
const FREEZE_PRICE = 200
const REFILL_PRICE = 350

/** Ejecuta una operación sobre el estado y lo guarda */
async function tx<T>(fn: (s: State) => T, ms?: number): Promise<T> {
  await Promise.all([wait(ms), syncMarket()])
  const s = load()
  rollover(s)
  applyLive(s)
  tick(s)
  const out = fn(s)
  save(s)
  return structuredClone(out)
}

// ── Mantenimiento al leer: día nuevo, racha, vidas, precios ──
function rollover(s: State) {
  const today = dayOf()
  if (s.goals.date !== today) s.goals = { date: today, lesson: 0, ops: 0, perfect: 0, rewarded: [] }
  if (s.tradesToday.date !== today) s.tradesToday = { date: today, n: 0 }
  const wk = weekOf()
  if (s.weekXp.week !== wk) s.weekXp = { week: wk, xp: 0 }
  // Racha: si se saltó días, usar protectores o perderla
  const last = s.streak.lastActive
  if (last && last < addDays(today, -1) && s.streak.current > 0) {
    let d = addDays(last, 1)
    while (d < today) {
      if (s.streak.freezes > 0) {
        s.streak.freezes--
        s.streak.history[d] = 'FROZEN'
        s.counters.freezeUsed++
        s.streak.lastActive = d
      } else {
        s.streak.history[d] = 'MISSED'
        s.streak.current = 0
      }
      d = addDays(d, 1)
    }
  }
  // Vidas: 1 cada 4 h, calculado al leer
  if (s.lives.current < LIVES_MAX) {
    const n = Math.floor((Date.now() - s.lives.updatedAt) / LIFE_MS)
    if (n > 0) {
      s.lives.current = Math.min(LIVES_MAX, s.lives.current + n)
      s.lives.updatedAt = s.lives.current >= LIVES_MAX ? Date.now() : s.lives.updatedAt + n * LIFE_MS
    }
  }
}

// ── Precios reales (etapa 3): vienen de /api/market, nunca se inventan (F1) ──
const live = new Map<string, AssetItemT>()
let lastSync = 0
let syncing: Promise<void> | null = null
const SYNC_MS = 5_000

async function syncMarket() {
  if (Date.now() - lastSync < SYNC_MS) return
  syncing ??= fetch('/api/market/assets', { cache: 'no-store' })
    .then(r => (r.ok ? (r.json() as Promise<AssetItemT[]>) : []))
    .then(items => {
      for (const it of items) live.set(it.symbol, it)
      if (items.length) lastSync = Date.now()
    })
    .catch(() => undefined)
    .finally(() => (syncing = null))
  await syncing
}

/** Copia el último precio real en el estado (así, sin conexión, se sigue viendo el último conocido) */
function applyLive(s: State) {
  for (const it of live.values()) {
    const p = Number(it.price)
    s.prices[it.symbol] = { p, ref: p / (1 + it.changePct / 100), t: Date.parse(it.asOf), day: dayOf() }
  }
}

/** Ejecuta las órdenes pendientes y las alertas con los precios reales */
function tick(s: State) {
  processPending(s)
}

// ── Precios ──────────────────────────────────────────────
const eurPerUsd = (s: State) => (s.prices.EURUSD ? 1 / s.prices.EURUSD.p : 1 / 1.12)
const toEur = (s: State, sym: string, v: number) => (ASSET[sym].currency === 'USD' ? v * eurPerUsd(s) : v)
const priceEur = (s: State, sym: string) => (s.prices[sym] ? toEur(s, sym, s.prices[sym].p) : (s.positions[sym]?.avg ?? 0))
const changePct = (s: State, sym: string) => (s.prices[sym] ? ((s.prices[sym].p - s.prices[sym].ref) / s.prices[sym].ref) * 100 : 0)
const fmtPrice = (sym: string, v: number) => (ASSET[sym].type === 'FX' ? v.toFixed(5) : v >= 1000 ? v.toFixed(2) : v.toFixed(4).replace(/(\.\d\d\d?)0+$/, '$1'))

function item(s: State, sym: string): AssetItemT | null {
  const fresh = live.get(sym)
  if (fresh && Date.now() - lastSync < 2 * 60_000) return fresh
  // Sin conexión: último precio real guardado, marcado como «con retraso»
  const a = ASSET[sym]
  const q = s.prices[sym]
  if (!q) return null
  return {
    symbol: sym, name: a.name, type: a.type, exchange: a.exchange, isOpen: isOpen(a.hours), price: fmtPrice(sym, q.p), currency: a.currency,
    changePct: changePct(s, sym), sparkline: fresh?.sparkline ?? [q.ref, q.p], stale: true, asOf: new Date(q.t).toISOString(), delayedMinutes: a.delayedMinutes,
  }
}

// ── Cartera ──────────────────────────────────────────────
const posValue = (s: State, sym: string) => (s.positions[sym] ? s.positions[sym].qty * priceEur(s, sym) : 0)
const invested = (s: State) => Object.keys(s.positions).reduce((t, k) => t + posValue(s, k), 0)
const totalValue = (s: State) => s.cash + invested(s)
const fee = (amount: number) => Math.max(amount * 0.001, 1)

function unlockedFeatures(s: State): FeatureT[] {
  return s.profile.plan === 'PREMIUM' || s.lessons.u3l3?.done ? ['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] : []
}

// ── Efectos comunes (XP, objetivos, logros, racha) ──────
interface Fx { xp: number; goals: string[]; ach: AchievementT[]; levelFrom: number; features: FeatureT[]; companion?: { message: string; mood: Mood } }
const startFx = (s: State): Fx => ({ xp: 0, goals: [], ach: [], levelFrom: levelOf(s.xp).n, features: [] })

function addXp(s: State, fx: Fx, n: number) {
  s.xp += n
  s.weekXp.xp += n
  fx.xp += n
}

/** Marca el día como activo; devuelve true si la racha ha crecido hoy */
function markActive(s: State): boolean {
  const today = dayOf()
  if (s.streak.lastActive === today) return false
  s.streak.current = s.streak.lastActive === addDays(today, -1) ? s.streak.current + 1 : 1
  s.streak.best = Math.max(s.streak.best, s.streak.current)
  s.streak.lastActive = today
  s.streak.history[today] = 'ACTIVE'
  return true
}

const GOAL_DEFS = [
  { id: 'lesson', label: 'Completa una clase', target: 1, xp: 20 },
  { id: 'ops', label: 'Haz 2 operaciones', target: 2, xp: 15 },
  { id: 'perfect', label: 'Consigue un quiz perfecto', target: 1, xp: 25 },
] as const

function bumpGoal(s: State, fx: Fx, id: 'lesson' | 'ops' | 'perfect') {
  const def = GOAL_DEFS.find(g => g.id === id)!
  s.goals[id] = Math.min(def.target, s.goals[id] + 1)
  if (s.goals[id] >= def.target && !s.goals.rewarded.includes(id)) {
    s.goals.rewarded.push(id)
    addXp(s, fx, def.xp)
    fx.goals.push(id)
    if (s.goals.rewarded.length === GOAL_DEFS.length) {
      s.gems += 10
      s.counters.goalDays++
    }
  }
}

function achievementProgress(s: State, code: string): number {
  const done = Object.values(s.lessons).filter(l => l.done).length
  const unitDone = (u: string) => UNITS.find(x => x.id === u)!.lessons.filter(l => s.lessons[l.id]?.done).length
  const filled = s.trades.filter(t => t.status === 'FILLED').length
  const kinds = new Set(Object.keys(s.positions).map(k => ASSET[k].type)).size
  const map: Record<string, number> = {
    FIRST_LESSON: done, LESSONS_5: done, LESSONS_20: done, QUIZ_PERFECT: s.counters.perfect, QUIZ_PERFECT_5: s.counters.perfect,
    UNIT_1: unitDone('u1') >= 4 ? 1 : 0, UNIT_2: unitDone('u2'), UNIT_3: unitDone('u3'), PLACEMENT: s.placementDone ? 1 : 0,
    REVIEW_10: s.counters.reviewed, SPEED: s.counters.fastPerfect, FIRST_TRADE: filled, TRADES_10: filled, TRADES_50: filled,
    DIVERSIFY_3: kinds, DIVERSIFY_5: Object.keys(s.positions).length, FIRST_STOP: s.counters.stops, FIRST_TP: s.counters.tps,
    FIRST_LIMIT: s.counters.limits, WEEK_POSITIVE: 0, CALM_RISK: s.counters.calmRisk, FIRST_ALERT: s.counters.alerts + (s.alerts.length ? 1 : 0),
    CRYPTO_FIRST: s.counters.crypto, ETF_FIRST: s.counters.etf, STREAK_3: s.streak.best, STREAK_7: s.streak.best, STREAK_30: s.streak.best,
    STREAK_100: s.streak.best, FREEZE_USED: s.counters.freezeUsed, GOALS_7: s.counters.goalDays, LEAGUE_UP: s.counters.leagueUp, LEAGUE_TOP3: s.counters.top3,
  }
  return map[code] ?? 0
}

function achievementList(s: State): AchievementT[] {
  return ACHIEVEMENTS.map(a => {
    const at = s.achievements[a.code]
    return {
      id: a.code, code: a.code, title: a.title, description: a.description, icon: a.icon, category: a.category,
      unlocked: !!at, unlockedAt: at, progress: at ? a.target : Math.min(a.target, achievementProgress(s, a.code)), target: a.target, reward: { gems: a.gems, xp: a.xp },
    }
  })
}

function checkAchievements(s: State, fx: Fx) {
  for (const a of ACHIEVEMENTS) {
    if (s.achievements[a.code] || achievementProgress(s, a.code) < a.target) continue
    s.achievements[a.code] = new Date().toISOString()
    s.gems += a.gems
    addXp(s, fx, a.xp)
    notify(s, 'ACHIEVEMENT', `Logro: ${a.title}`, `+${a.gems} gemas y +${a.xp} XP.`, '/perfil/logros')
  }
  fx.ach = achievementList(s).filter(a => a.unlocked && a.unlockedAt && Date.now() - new Date(a.unlockedAt).getTime() < 2000)
}

function endFx(s: State, fx: Fx): EffectsT {
  checkAchievements(s, fx)
  const to = levelOf(s.xp).n
  return { xp: fx.xp, goalsCompleted: fx.goals, achievementsUnlocked: fx.ach, levelUp: to > fx.levelFrom ? { from: fx.levelFrom, to } : undefined, unlockedFeatures: fx.features, companion: fx.companion }
}

function notify(s: State, type: NotificationT['type'], title: string, body: string, deepLink: string) {
  s.notifications.unshift({ id: uid(), type, title, body, deepLink, readAt: null, createdAt: new Date().toISOString() })
  s.notifications = s.notifications.slice(0, 50)
}

function lumi(s: State, key: keyof typeof LUMI, vars: Record<string, string | number> = {}) {
  const t = LUMI[key]
  const line = t.lines[Math.floor(Math.random() * t.lines.length)]
  const all: Record<string, string | number> = { nombre: s.profile.name || 'tú', dias: s.streak.current, ...vars }
  return { message: line.replace(/\{(\w+)\}/g, (_, k) => String(all[k] ?? '')), mood: t.mood }
}

// ── Vidas ────────────────────────────────────────────────
function livesOf(s: State): LivesT {
  if (s.profile.plan === 'PREMIUM') return { current: LIVES_MAX, max: LIVES_MAX, nextRegenAt: null, regenHours: 4 }
  return { current: s.lives.current, max: LIVES_MAX, nextRegenAt: s.lives.current < LIVES_MAX ? new Date(s.lives.updatedAt + LIFE_MS).toISOString() : null, regenHours: 4 }
}

// ── Camino de clases ─────────────────────────────────────
function pathOf(s: State): CoursePathT {
  const premium = s.profile.plan === 'PREMIUM'
  let foundAvailable = false
  let currentUnitId = UNITS[0].id
  const units: PathUnitT[] = UNITS.map(u => {
    const lessons = u.lessons.map(l => {
      const p = s.lessons[l.id]
      const requiresPremium = u.premiumOnly && !premium && !(u.freeLessonIds ?? []).includes(l.id)
      let status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED' = 'LOCKED'
      if (p?.done) status = 'COMPLETED'
      else if (!requiresPremium && !foundAvailable) {
        status = 'AVAILABLE'
        foundAvailable = true
        currentUnitId = u.id
      }
      return { id: l.id, title: l.title, status, stars: p?.stars ?? 0, minutes: l.minutes, xp: l.xp, isUnitReview: !!l.isUnitReview, requiresPremium }
    })
    const done = lessons.filter(l => l.status === 'COMPLETED').length
    return { id: u.id, order: u.order, title: u.title, description: u.description, progressPct: u.lessons.length ? Math.round((done / u.lessons.length) * 100) : 0, premiumOnly: u.premiumOnly, unlocksFeature: u.unlocksFeature, lessons }
  })
  return { courseId: 'trading-desde-cero', title: 'Trading desde cero', currentUnitId, units }
}

// ── Quiz ─────────────────────────────────────────────────
const allQuestions = (): Record<string, MockQuestion> => Object.fromEntries([...Object.values(QUIZZES).flat(), ...PLACEMENT].map(q => [q.id, q]))
const publicQ = (q: MockQuestion): QuestionT => ({ id: q.id, type: q.type, prompt: q.prompt, options: q.options, chart: q.chart })

function isCorrect(q: MockQuestion, a: number | number[] | string): boolean {
  if (q.type === 'CHART_POINT') return typeof a === 'number' && Math.abs(a - (q.solution as number)) <= 1
  if (q.type === 'FILL_BLANK') return String(a).trim().toLowerCase() === String(q.solution).toLowerCase()
  if (q.type === 'MULTIPLE') return Array.isArray(a) && [...a].sort().join() === [...(q.solution as number[])].sort().join()
  if (q.type === 'ORDER') return Array.isArray(a) && a.join() === (q.solution as number[]).join()
  return a === q.solution
}

// ── Órdenes ──────────────────────────────────────────────
function preview(s: State, i: OrderInput): OrderPreviewT {
  const a = ASSET[i.symbol] ?? fail('NOT_FOUND', 'Activo no encontrado', 404)
  const pe = priceEur(s, i.symbol)
  const total = totalValue(s)
  const held = s.positions[i.symbol]?.qty ?? 0
  const qty = i.qty ? Number(i.qty) : Number(i.amount ?? 0) / pe
  const amount = qty * pe
  const f = amount > 0 ? fee(amount) : 0
  const features = unlockedFeatures(s)
  const allowedTypes = ['MARKET', ...features] as OrderPreviewT['allowedTypes']
  const locked = (['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] as const).filter(t => !features.includes(t)).map(type => ({ type, unlockBy: 'LESSON:u3l3' }))
  const weight = i.side === 'BUY' ? ((posValue(s, i.symbol) + amount) / total) * 100 : ((posValue(s, i.symbol) - amount) / total) * 100
  const flagged = i.side === 'BUY' && a.type !== 'INDEX' && weight > RISK_PCT && amount > 0
  const suggested = Math.max(0, (RISK_PCT / 100) * total - posValue(s, i.symbol))
  let error: OrderPreviewT['error'] = null
  if (amount > 0 && amount < 1) error = 'MIN_AMOUNT'
  else if (i.side === 'BUY' && amount + f > s.cash) error = 'INSUFFICIENT_FUNDS'
  else if (i.side === 'SELL' && qty > held + 1e-9) error = 'INSUFFICIENT_QTY'
  return {
    estPrice: fmtPrice(i.symbol, s.prices[i.symbol].p), qty: fix8(qty), fee: fix2(f), total: fix2(i.side === 'BUY' ? amount + f : amount - f),
    cashAfter: fix2(i.side === 'BUY' ? s.cash - amount - f : s.cash + amount - f), weightPct: Math.max(0, weight),
    risk: { flagged, reason: flagged ? `${a.name} sería el ${Math.round(weight)} % de tu cartera` : null, thresholdPct: RISK_PCT, suggestedAmount: flagged ? fix2(suggested) : null },
    allowedTypes, locked, error,
  }
}

function fill(s: State, o: OrderT, fx?: Fx): TradeT | null {
  const a = ASSET[o.symbol]
  const pe = priceEur(s, o.symbol)
  let qty = Number(o.qty)
  if (o.side === 'SELL') qty = Math.min(qty, s.positions[o.symbol]?.qty ?? 0)
  const amount = qty * pe
  const f = fee(amount)
  const reject = (reason: string) => {
    o.status = 'REJECTED'
    const t: TradeT = { id: uid(), side: o.side, type: o.type, symbol: o.symbol, qty: fix8(qty), price: fmtPrice(o.symbol, s.prices[o.symbol].p), fee: '0.00', total: fix2(amount), realizedPnl: null, status: 'REJECTED', createdAt: new Date().toISOString(), rejectReason: reason }
    s.trades.unshift(t)
    return null
  }
  if (qty <= 0) return reject('No tienes participaciones')
  if (o.side === 'BUY' && amount + f > s.cash + 1e-6) return reject('Saldo insuficiente')
  let pnl: number | null = null
  if (o.side === 'BUY') {
    const p = s.positions[o.symbol] ?? { qty: 0, avg: 0 }
    const avgEur = (p.qty * p.avg + amount) / (p.qty + qty)
    s.positions[o.symbol] = { qty: p.qty + qty, avg: avgEur }
    s.cash -= amount + f
    if (a.type === 'CRYPTO') s.counters.crypto++
    if (a.type === 'ETF') s.counters.etf++
  } else {
    const p = s.positions[o.symbol]
    pnl = (pe - p.avg) * qty - f
    s.realized += pnl
    p.qty -= qty
    if (p.qty < 1e-9) delete s.positions[o.symbol]
    s.cash += amount - f
  }
  o.status = 'FILLED'
  o.fillPrice = fmtPrice(o.symbol, s.prices[o.symbol].p)
  o.filledAt = new Date().toISOString()
  o.fee = fix2(f)
  o.qty = fix8(qty)
  const t: TradeT = { id: uid(), side: o.side, type: o.type, symbol: o.symbol, qty: fix8(qty), price: o.fillPrice, fee: fix2(f), total: fix2(amount), realizedPnl: pnl === null ? null : fix2(pnl), status: 'FILLED', createdAt: o.filledAt, rejectReason: null }
  s.trades.unshift(t)
  // Progreso: XP solo en las 3 primeras del día
  const local = fx ?? startFx(s)
  if (s.tradesToday.n < 3) addXp(s, local, 15)
  s.tradesToday.n++
  bumpGoal(s, local, 'ops')
  markActive(s)
  if (!fx) {
    checkAchievements(s, local)
    notify(s, 'ORDER_FILLED', `Orden ejecutada: ${o.symbol}`, `${o.side === 'BUY' ? 'Compra' : 'Venta'} a ${o.fillPrice} ${a.currency === 'EUR' ? '€' : '$'}.`, '/mercado/cartera')
  }
  return t
}

function processPending(s: State) {
  for (const o of s.orders) {
    if (o.status !== 'PENDING') continue
    const a = ASSET[o.symbol]
    if (!isOpen(a.hours)) continue
    const p = s.prices[o.symbol].p
    const trig = o.triggerPrice ? Number(o.triggerPrice) : null
    const hit = o.type === 'MARKET' || (o.type === 'LIMIT' && trig !== null && (o.side === 'BUY' ? p <= trig : p >= trig)) || (o.type === 'STOP_LOSS' && trig !== null && p <= trig) || (o.type === 'TAKE_PROFIT' && trig !== null && p >= trig)
    if (hit) fill(s, o)
  }
  for (const al of s.alerts) {
    if (!al.active) continue
    const p = s.prices[al.symbol]?.p
    if (p === undefined) continue
    if ((al.condition === 'ABOVE' && p >= Number(al.price)) || (al.condition === 'BELOW' && p <= Number(al.price))) {
      al.active = false
      notify(s, 'PRICE_ALERT', `${al.symbol} ha ${al.condition === 'ABOVE' ? 'superado' : 'bajado de'} ${al.price}`, 'Tu alerta de precio se ha cumplido.', `/mercado/${al.symbol}`)
    }
  }
}

// ── Cartera: resumen ─────────────────────────────────────
function portfolioOf(s: State): PortfolioT {
  const total = totalValue(s)
  const start = s.profile.plan === 'PREMIUM' ? START_CASH.PREMIUM : START_CASH.FREE
  let dayChange = 0
  let unreal = 0
  const positions = Object.entries(s.positions).map(([sym, p]) => {
    const a = ASSET[sym]
    const v = posValue(s, sym)
    const c = changePct(s, sym)
    dayChange += v - v / (1 + c / 100)
    const pnl = v - p.qty * p.avg
    unreal += pnl
    return { symbol: sym, name: a.name, type: a.type, qty: fix8(p.qty), avgPrice: fix2(p.avg), marketValue: fix2(v), unrealizedPnl: fix2(pnl), pnlPct: (pnl / (p.qty * p.avg)) * 100, weightPct: (v / total) * 100 }
  }).sort((a, b) => Number(b.marketValue) - Number(a.marketValue))
  return { totalValue: fix2(total), cash: fix2(s.cash), dayChange: fix2(dayChange), dayChangePct: (dayChange / (total - dayChange)) * 100, totalReturnPct: ((total - start) / start) * 100, realizedPnl: fix2(s.realized), unrealizedPnl: fix2(unreal), positions, resetsLeft: s.resetsLeft }
}

/** Fotos diarias de la cartera: empiezan en el saldo inicial y acaban en el valor actual */
function historyOf(s: State, range: '1W' | '1M' | '3M' | 'ALL') {
  const n = { '1W': 7, '1M': 30, '3M': 90, ALL: Math.max(7, Math.ceil((Date.now() - new Date(s.profile.memberSince).getTime()) / DAY)) }[range]
  const total = totalValue(s)
  const start = s.profile.plan === 'PREMIUM' ? START_CASH.PREMIUM : START_CASH.FREE
  const all = Math.max(7, Math.ceil((Date.now() - new Date(s.profile.memberSince).getTime()) / DAY))
  const full = bridge('hist' + s.profile.id, all + 1, start, total, 0.006)
  return full.slice(-(Math.min(n, all) + 1)).map((v, i, arr) => ({ t: dayOf(Date.now() - (arr.length - 1 - i) * DAY), v }))
}

function levelTitle(s: State, n: number) {
  return (LEVEL_TITLES[n] ?? LEVEL_TITLES[8])[s.profile.gender]
}

function meOf(s: State) {
  const lv = levelOf(s.xp)
  return {
    id: s.profile.id, name: s.profile.name, email: s.profile.email, emailVerified: true, plan: s.profile.plan, planRenewsAt: s.profile.renewsAt, trialEndsAt: s.profile.trialEndsAt,
    gender: s.profile.gender, memberSince: s.profile.memberSince, level: { n: lv.n, title: levelTitle(s, lv.n), xp: s.xp, xpLevelStart: lv.min, xpForNext: lv.next ?? s.xp },
    streak: s.streak.current, gems: s.gems, lives: livesOf(s), lessonsCompleted: Object.values(s.lessons).filter(l => l.done).length,
    achievementsCount: Object.keys(s.achievements).length, achievementsTotal: ACHIEVEMENTS.length,
    companion: { name: s.profile.companionName, skinId: s.profile.skinId, mood: (s.streak.lastActive === dayOf() ? 'HAPPY' : 'CALM') as Mood },
    onboardingStep: s.onboardingStep,
  }
}

function sessionOf(s: State) {
  return { signedIn: s.session.signedIn, email: s.session.email, onboardingStep: s.onboardingStep, isAdmin: s.session.email === ADMIN_EMAIL }
}

function requireUser(s: State) {
  if (!s.session.signedIn) fail('UNAUTHORIZED', 'Inicia sesión para continuar', 401)
}

// ── API ──────────────────────────────────────────────────
export const mockApi: Api = {
  publicTicker: async () => {
    const r = await fetch('/api/public/ticker')
    return r.ok ? r.json() : []
  },
  // Estadísticas públicas: siempre reales; en la simulación no hay usuarios todavía
  publicStats: () => tx(() => ({ activeUsers: 0, lessonsCompleted: 0, simulatedTrades: 0 }), 60),

  joinWaitlist: email =>
    tx(() => {
      if (!/^\S+@\S+\.\S+$/.test(email)) fail('VALIDATION_ERROR', 'Ese email no parece válido', 422)
      const list: string[] = JSON.parse(localStorage.getItem('et-waitlist') ?? '[]')
      if (list.includes(email.toLowerCase())) fail('CONFLICT', 'Ya estás en la lista con este email', 409)
      localStorage.setItem('et-waitlist', JSON.stringify([...list, email.toLowerCase()]))
    }, 400),

  contact: c =>
    tx(() => {
      if (!c.name.trim() || !/^\S+@\S+\.\S+$/.test(c.email) || c.message.trim().length < 10) fail('VALIDATION_ERROR', 'Revisa los campos', 422)
    }, 500),

  session: () => tx(s => sessionOf(s), 30),

  signIn: (email, password) =>
    tx(s => {
      if (!/^\S+@\S+\.\S+$/.test(email)) fail('VALIDATION_ERROR', 'Escribe un email válido', 422)
      if (password.length < 8) fail('INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401)
      // En la simulación, iniciar sesión carga la cuenta de ejemplo para ver la app con datos
      const next = s.session.email === email && s.onboardingStep === null ? s : sampleState(email)
      next.session = { signedIn: true, email }
      next.profile.email = email
      Object.assign(s, next)
      return sessionOf(s)
    }, 500),

  signUp: (email, password) =>
    tx(s => {
      if (!/^\S+@\S+\.\S+$/.test(email)) fail('VALIDATION_ERROR', 'Escribe un email válido', 422)
      if (password.length < 8 || !/\d/.test(password)) fail('WEAK_PASSWORD', 'Mínimo 8 caracteres y un número', 422)
      Object.assign(s, freshState(email))
      return sessionOf(s)
    }, 500),

  signInWithGoogle: () =>
    tx(s => {
      Object.assign(s, freshState('google@ejemplo.com'))
      return sessionOf(s)
    }, 600),

  signOut: () =>
    tx(s => {
      s.session = { signedIn: false, email: s.session.email }
    }),

  forgotPassword: () => tx(() => undefined, 400),

  onboarding: () => tx(s => ({ step: s.onboardingStep ?? 1, draft: s.draft })),

  saveOnboarding: (step, patch) =>
    tx(s => {
      requireUser(s)
      if (patch.birthDate) {
        const age = (Date.now() - new Date(patch.birthDate).getTime()) / (365.25 * DAY)
        if (age < 14) fail('UNDER_MIN_AGE', 'E-Trading es para mayores de 14 años', 403)
      }
      s.draft = { ...s.draft, ...patch }
      s.onboardingStep = Math.max(s.onboardingStep ?? 1, step + 1)
    }),

  completeOnboarding: () =>
    tx(s => {
      requireUser(s)
      const d = s.draft
      s.profile = { ...s.profile, name: d.name || 'Tú', gender: d.gender, companionName: d.companionName || 'Lumi', skinId: d.skinId }
      s.settings = { ...s.settings, gender: d.gender, dailyGoalMinutes: d.dailyGoalMinutes }
      s.onboardingStep = null
      notify(s, 'NEW_LESSON', 'Tu primera clase te espera', '«Qué es invertir»: 4 minutos.', '/clases')
    }),

  home: () =>
    tx((s): HomeT => {
      requireUser(s)
      const path = pathOf(s)
      const next = path.units.flatMap(u => u.lessons.map(l => ({ l, u }))).find(x => x.l.status === 'AVAILABLE')
      const todayDone = s.streak.lastActive === dayOf()
      const pf = portfolioOf(s)
      const hist = pf.positions.length === 0 ? [Number(pf.totalValue), Number(pf.totalValue)] : bridge('pf' + s.profile.id + dayOf(), 24, Number(pf.totalValue) - Number(pf.dayChange), Number(pf.totalValue), 0.0015)
      return {
        user: { name: s.profile.name },
        streak: { days: s.streak.current, todayDone },
        gems: s.gems,
        lives: livesOf(s),
        companion: lumi(s, todayDone ? 'HOME_DONE' : s.streak.current > 0 ? 'HOME_STREAK' : 'HOME_NEW'),
        nextLesson: next ? { id: next.l.id, title: next.l.title, unitTitle: next.u.title, unitOrder: next.u.order, minutes: next.l.minutes, progressPct: next.u.progressPct } : null,
        dailyGoals: GOAL_DEFS.map(g => ({ id: g.id, label: g.label, progress: s.goals[g.id], target: g.target, xp: g.xp, done: s.goals[g.id] >= g.target })),
        portfolio: { totalValue: pf.totalValue, dayChange: pf.dayChange, dayChangePct: pf.dayChangePct, sparkline: hist },
      }
    }),

  me: () => tx(s => (requireUser(s), meOf(s))),
  lives: () => tx(s => livesOf(s)),

  refillLives: () =>
    tx(s => {
      if (s.gems < REFILL_PRICE) fail('INSUFFICIENT_GEMS', `Necesitas ${REFILL_PRICE} gemas`, 402)
      s.gems -= REFILL_PRICE
      s.lives = { current: LIVES_MAX, updatedAt: Date.now() }
      return livesOf(s)
    }),

  path: () => tx(s => (requireUser(s), pathOf(s))),

  lesson: id =>
    tx(s => {
      const l = LESSON[id] ?? fail('NOT_FOUND', 'Lección no encontrada', 404)
      const st = pathOf(s).units.flatMap(u => u.lessons).find(x => x.id === id)!
      if (st.requiresPremium) fail('FEATURE_LOCKED', 'Esta lección es de Premium', 403)
      const steps: LessonStepT[] = l.steps.map((st, i): LessonStepT => {
        const sid = `${id}-s${i}`
        if (st.kind === 'TEXT') return { id: sid, type: 'TEXT', title: st.title, body: st.body, companionTip: st.tip }
        if (st.kind === 'IMAGE') return { id: sid, type: 'IMAGE', title: st.title, body: st.body, image: st.image, companionTip: st.tip }
        if (st.kind === 'CHART') return { id: sid, type: 'INTERACTIVE_CHART', prompt: st.prompt, caption: st.caption, candles: st.candles }
        return { id: sid, type: 'SIMULATOR_TASK', title: st.title, body: st.body, task: st.task }
      })
      steps.push({ id: `${id}-quiz`, type: 'QUIZ', quizId: l.quizId, title: 'Hora del quiz', body: `${(QUIZZES[l.quizId] ?? []).length} preguntas para comprobar lo que has aprendido. Cada fallo cuesta una vida.` })
      return { id, title: l.title, unitTitle: l.unit.title, minutes: l.minutes, xp: l.xp, steps }
    }),

  checkStep: (lessonId, stepId, idx) =>
    tx(() => {
      const i = Number(stepId.split('-s')[1])
      const st = LESSON[lessonId]?.steps[i]
      if (!st || st.kind !== 'CHART') return fail('NOT_FOUND', 'Paso no encontrado', 404)
      const correct = idx === st.solution
      return { correct, explanation: correct ? st.ok : st.ko }
    }, 90),

  quizStart: lessonId =>
    tx(s => {
      requireUser(s)
      let mode: Attempt['mode'] = 'LESSON'
      let qs: MockQuestion[]
      if (lessonId === 'placement') {
        mode = 'PLACEMENT'
        qs = PLACEMENT
      } else if (lessonId === 'review') {
        mode = 'REVIEW'
        const all = allQuestions()
        qs = s.mistakes.map(id => all[id]).filter(Boolean).slice(0, 8)
        if (!qs.length) fail('NOT_FOUND', 'No tienes fallos que repasar', 404)
      } else {
        const l = LESSON[lessonId] ?? fail('NOT_FOUND', 'Lección no encontrada', 404)
        if (livesOf(s).current <= 0) fail('NO_LIVES', 'Te has quedado sin vidas', 409)
        qs = QUIZZES[l.quizId] ?? []
      }
      const a: Attempt = { id: uid(), mode, lessonId: mode === 'LESSON' ? lessonId : null, qids: qs.map(q => q.id), answers: {}, startedAt: Date.now() }
      s.attempts = { [a.id]: a }
      return { attemptId: a.id, lessonId: a.lessonId, isPlacement: mode === 'PLACEMENT', questions: qs.map(publicQ), lives: livesOf(s) }
    }),

  answer: (attemptId, qid, ans, ms) =>
    tx(s => {
      const at = s.attempts[attemptId] ?? fail('NOT_FOUND', 'Intento no encontrado', 404)
      if (at.answers[qid]) fail('CONFLICT', 'Pregunta ya respondida', 409)
      const q = allQuestions()[qid]
      if (at.mode === 'LESSON' && livesOf(s).current <= 0) fail('NO_LIVES', 'Te has quedado sin vidas', 409)
      const correct = isCorrect(q, ans)
      at.answers[qid] = { correct, ms }
      if (!correct && at.mode === 'LESSON' && s.profile.plan !== 'PREMIUM') {
        if (s.lives.current >= LIVES_MAX) s.lives.updatedAt = Date.now()
        s.lives.current = Math.max(0, s.lives.current - 1)
      }
      if (at.mode !== 'PLACEMENT') {
        if (!correct && !s.mistakes.includes(qid)) s.mistakes.push(qid)
        if (correct && at.mode === 'REVIEW') {
          s.mistakes = s.mistakes.filter(x => x !== qid)
          s.counters.reviewed++
        }
      }
      return { correct, correctAnswer: q.solution, explanation: q.explanation, livesLeft: at.mode === 'LESSON' && s.profile.plan !== 'PREMIUM' ? s.lives.current : null, xpGained: correct && at.mode !== 'PLACEMENT' ? 10 : 0 }
    }, 80),

  quizFinish: attemptId =>
    tx((s): QuizFinishT => {
      const at = s.attempts[attemptId] ?? fail('NOT_FOUND', 'Intento no encontrado', 404)
      if (at.finished) return at.finished as QuizFinishT
      const fx = startFx(s)
      const answers = Object.values(at.answers)
      const correct = answers.filter(a => a.correct).length
      const total = at.qids.length
      const ratio = total ? correct / total : 0
      const perfect = correct === total && total > 0
      const stars = perfect ? 3 : ratio >= 0.8 ? 2 : ratio >= 0.6 ? 1 : 0
      const durationMs = Date.now() - at.startedAt
      const avgMs = answers.reduce((t, a) => t + a.ms, 0) / Math.max(1, answers.length)
      const l = at.lessonId ? LESSON[at.lessonId] : null
      const prev = at.lessonId ? s.lessons[at.lessonId] : undefined
      const lessonXp = l && stars > 0 && !prev?.done ? l.xp : 0
      const base = correct * 10 + lessonXp
      const perfectBonus = perfect ? Math.round(correct * 10 * 0.5) : 0
      const speedBonus = avgMs < 15_000 && correct > 0 ? Math.round(base * 0.1) : 0
      addXp(s, fx, base + perfectBonus + speedBonus)
      const extendedToday = markActive(s)
      if (at.lessonId && stars > 0) {
        s.lessons[at.lessonId] = { done: true, stars: Math.max(stars, prev?.stars ?? 0) }
        if (!prev?.done) {
          bumpGoal(s, fx, 'lesson')
          if (at.lessonId === 'u3l3' && s.profile.plan !== 'PREMIUM') fx.features = ['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT']
        }
      }
      if (perfect) {
        s.counters.perfect++
        if (durationMs < 60_000) s.counters.fastPerfect++
        bumpGoal(s, fx, 'perfect')
      }
      fx.companion = perfect ? lumi(s, 'QUIZ_PERFECT') : stars > 0 ? lumi(s, 'LESSON_COMPLETED', { concepto: l?.unit.title.toLowerCase() ?? 'inversión' }) : lumi(s, 'QUIZ_WRONG')
      const eff = endFx(s, fx)
      const out: QuizFinishT = { ...eff, correct, total, stars, durationMs, xpBreakdown: { base, perfectBonus, speedBonus, total: base + perfectBonus + speedBonus }, streak: { days: s.streak.current, extendedToday } }
      at.finished = out
      return out
    }, 300),

  placementFinish: attemptId =>
    tx(s => {
      const at = s.attempts[attemptId] ?? fail('NOT_FOUND', 'Intento no encontrado', 404)
      const correct = Object.values(at.answers).filter(a => a.correct).length
      const total = at.qids.length
      const skip = correct >= 5
      s.placementDone = true
      if (skip) for (const l of UNITS[0].lessons) s.lessons[l.id] = s.lessons[l.id] ?? { done: true, stars: 0 }
      const start = skip ? UNITS[1] : UNITS[0]
      return { correct, total, startUnitId: start.id, startUnitTitle: start.title, skippedUnitTitles: skip ? [UNITS[0].title] : [] }
    }, 400),

  mistakesCount: () => tx(s => s.mistakes.length, 40),

  // ── Mercado
  assets: (filter = {}) =>
    tx(s => {
      let list = ASSETS.map(a => a.symbol)
      if (filter.type === 'WATCH') list = s.watchlist.filter(x => ASSET[x])
      else if (filter.type) list = list.filter(x => ASSET[x].type === filter.type)
      const q = filter.q?.trim().toLowerCase()
      if (q) list = ASSETS.map(a => a.symbol).filter(x => x.toLowerCase().includes(q) || ASSET[x].name.toLowerCase().includes(q))
      return list.map(x => item(s, x)).filter((x): x is AssetItemT => x !== null)
    }, 90),

  // Ficha: del servidor (precio, horario, descripción); la moneda del usuario sale de los ajustes locales
  asset: async sym => {
    const currency = load().settings.currency
    const r = await fetch(`/api/market/assets/${sym}?currency=${currency}`)
    if (r.status === 404) fail('NOT_FOUND', 'Activo no encontrado', 404)
    if (!r.ok) {
      // Sin conexión: último precio conocido
      return tx((s): AssetDetailT => {
        const a = ASSET[sym]
        const it = item(s, sym) ?? fail('MARKET_UNAVAILABLE', 'Precio no disponible', 503)
        const q = s.prices[sym]
        return { ...it, change: fmtPrice(sym, q.p - q.ref), priceInUserCurrency: fix2(priceEur(s, sym)), opensAt: null, closesAt: null, description: a.description }
      })
    }
    return (await r.json()) as AssetDetailT
  },

  candles: async (sym, range) => {
    const r = await fetch(`/api/market/assets/${sym}/candles?range=${range}`)
    return r.ok ? ((await r.json()) as CandleT[]) : []
  },
  watchlist: () => tx(s => s.watchlist),
  toggleWatch: sym =>
    tx(s => {
      s.watchlist = s.watchlist.includes(sym) ? s.watchlist.filter(x => x !== sym) : [...s.watchlist, sym]
      return s.watchlist
    }, 60),

  previewOrder: i => tx(s => preview(s, i), 80),

  placeOrder: i =>
    tx(s => {
      requireUser(s)
      const pv = preview(s, i)
      if (i.type !== 'MARKET' && !pv.allowedTypes.includes(i.type)) fail('FEATURE_LOCKED', 'Completa «Stop loss y take profit» o hazte Premium', 422)
      if (ASSET[i.symbol].type === 'INDEX') fail('VALIDATION_ERROR', 'Los índices no se compran directamente', 422)
      if (pv.error === 'INSUFFICIENT_FUNDS' && i.type === 'MARKET') fail('INSUFFICIENT_FUNDS', 'No tienes saldo suficiente', 422)
      if (pv.error === 'INSUFFICIENT_QTY') fail('INSUFFICIENT_FUNDS', 'No tienes tantas participaciones', 422)
      if (pv.error === 'MIN_AMOUNT') fail('VALIDATION_ERROR', 'El importe mínimo es 1 €', 422)
      const a = ASSET[i.symbol]
      const fx = startFx(s)
      const firstTrade = !s.trades.some(t => t.status === 'FILLED')
      if (i.followedRiskAdvice) s.counters.calmRisk++
      const o: OrderT = {
        id: uid(), symbol: i.symbol, side: i.side, type: i.type, status: 'PENDING', qty: pv.qty, amount: fix2(Number(pv.qty) * priceEur(s, i.symbol)),
        triggerPrice: i.triggerPrice ?? null, fillPrice: null, fee: pv.fee, createdAt: new Date().toISOString(), filledAt: null, executesAt: null,
      }
      if (i.type === 'LIMIT') s.counters.limits++
      if (i.type === 'STOP_LOSS') s.counters.stops++
      if (i.type === 'TAKE_PROFIT') s.counters.tps++
      if (i.type === 'MARKET' && isOpen(a.hours)) {
        fill(s, o, fx)
        fx.companion = firstTrade ? lumi(s, 'FIRST_TRADE') : lumi(s, 'TRADE_DONE')
      } else {
        if (i.type === 'MARKET') o.executesAt = nextOpen(a.hours)?.toISOString() ?? null
        markActive(s)
      }
      s.orders.unshift(o)
      return { ...endFx(s, fx), order: o }
    }, 450),

  orders: () => tx(s => s.orders.filter(o => o.status === 'PENDING')),
  cancelOrder: id =>
    tx(s => {
      const o = s.orders.find(x => x.id === id)
      if (o && o.status === 'PENDING') o.status = 'CANCELLED'
    }),
  trades: () => tx(s => s.trades),
  portfolio: () => tx(s => portfolioOf(s), 100),

  portfolioHistory: range => tx(s => historyOf(s, range)),

  resetPortfolio: () =>
    tx(s => {
      if (s.resetsLeft <= 0) fail('RESET_LIMIT', 'Has usado los 3 reinicios de este año', 429)
      s.resetsLeft--
      s.cash = s.profile.plan === 'PREMIUM' ? START_CASH.PREMIUM : START_CASH.FREE
      s.positions = {}
      s.realized = 0
      s.orders = s.orders.map(o => (o.status === 'PENDING' ? { ...o, status: 'CANCELLED' as const } : o))
      s.audit.unshift({ id: uid(), actor: s.profile.email, action: 'PORTFOLIO_RESET', entity: 'Portfolio', createdAt: new Date().toISOString() })
      return portfolioOf(s)
    }, 400),

  alerts: () => tx(s => s.alerts),
  createAlert: a =>
    tx(s => {
      const al = { ...a, id: uid(), active: true }
      s.alerts.unshift(al)
      s.counters.alerts++
      checkAchievements(s, startFx(s))
      return al
    }),
  deleteAlert: id =>
    tx(s => {
      s.alerts = s.alerts.filter(a => a.id !== id)
    }),

  tradingStats: () =>
    tx(s => {
      const filled = s.trades.filter(t => t.status === 'FILLED')
      const sells = filled.filter(t => t.realizedPnl !== null)
      const wins = sells.filter(t => Number(t.realizedPnl) > 0).length
      const days = Math.max(1, (Date.now() - new Date(s.profile.memberSince).getTime()) / DAY)
      const insights: string[] = []
      if (filled.length === 0) insights.push('Aún no has operado. Empieza con una cantidad pequeña para ver cómo funciona.')
      else {
        const top = portfolioOf(s).positions[0]
        if (top && top.weightPct > RISK_PCT) insights.push(`${top.name} pesa el ${Math.round(top.weightPct)} % de tu cartera. Repartir reduce el golpe si cae.`)
        insights.push(`Has hecho ${filled.length} operaciones en ${Math.round(days)} días. Operar poco y con motivo suele ir mejor.`)
      }
      let peak = -Infinity
      let dd = 0
      for (const p of historyOf(s, 'ALL')) {
        peak = Math.max(peak, p.v)
        dd = Math.min(dd, (p.v - peak) / peak)
      }
      return { tradesPerDay: filled.length / days, winRatePct: sells.length ? (wins / sells.length) * 100 : 0, maxDrawdownPct: dd * 100, insights }
    }),

  // ── Progreso
  streak: () =>
    tx((s): StreakT => {
      const today = dayOf()
      const days: StreakT['days'] = []
      for (let i = 34; i >= 0; i--) {
        const d = addDays(today, -i)
        days.push({ date: d, status: s.streak.history[d] ?? 'NONE' })
      }
      return { current: s.streak.current, best: s.streak.best, todayDone: s.streak.lastActive === today, timezone: 'Europe/Madrid', freezes: s.streak.freezes, freezePrice: FREEZE_PRICE, days }
    }),

  buyStreakFreeze: () =>
    tx(s => {
      if (s.streak.freezes >= 2) fail('CONFLICT', 'Ya tienes el máximo de 2 protectores', 409)
      if (s.gems < FREEZE_PRICE) fail('INSUFFICIENT_GEMS', `Necesitas ${FREEZE_PRICE} gemas`, 402)
      s.gems -= FREEZE_PRICE
      s.streak.freezes++
    }).then(() => mockApi.streak()),

  achievements: () => tx(s => achievementList(s)),

  league: () =>
    tx(s => {
      const wk = weekOf()
      const elapsed = Math.min(1, (Date.now() - new Date(wk + 'T00:00:00+02:00').getTime()) / (7 * DAY))
      const others = LEAGUE_NAMES.map((name, i) => {
        const r = rng(name + wk)
        const xp = Math.round((60 + r() * 700) * Math.max(0.15, elapsed))
        const ret = Math.round(gauss(r) * 120) / 100
        return { userId: 'u' + i, displayName: name, weeklyXp: xp, riskAdjReturnPct: ret, score: xp + Math.round(Math.max(-2, Math.min(2, ret)) * 100), isMe: false }
      })
      const myRet = portfolioOf(s).dayChangePct
      const me = { userId: s.profile.id, displayName: s.profile.name || 'Tú', weeklyXp: s.weekXp.xp, riskAdjReturnPct: Math.round(myRet * 100) / 100, score: s.weekXp.xp + Math.round(Math.max(-2, Math.min(2, myRet)) * 100), isMe: true }
      const members = [...others, me].sort((a, b) => b.score - a.score).map((m, i) => ({ ...m, rank: i + 1 }))
      const ends = new Date(addDays(wk, 7) + 'T00:00:00')
      return { division: { id: 'd2', name: DIVISIONS[1], order: 2 }, divisions: DIVISIONS, endsAt: ends.toISOString(), promoteTop: 7, demoteFrom: 26, members }
    }),

  notifications: () => tx(s => s.notifications),
  markNotificationsRead: ids =>
    tx(s => {
      const now = new Date().toISOString()
      for (const n of s.notifications) if ((ids === 'all' || ids.includes(n.id)) && !n.readAt) n.readAt = now
    }, 60),

  // ── Ajustes y pagos
  settings: () => tx(s => s.settings, 60),
  updateSettings: patch =>
    tx(s => {
      const { name, companionName, ...rest } = patch
      s.settings = { ...s.settings, ...rest }
      if (rest.gender) s.profile.gender = rest.gender
      if (name) s.profile.name = name
      if (companionName) s.profile.companionName = companionName
      return s.settings
    }, 80),

  billingPlans: () =>
    tx(() => [
      { id: 'premium-month', interval: 'MONTH' as const, price: '7.99', currency: 'EUR' as const, trialDays: 7 },
      { id: 'premium-year', interval: 'YEAR' as const, price: '59.99', currency: 'EUR' as const, trialDays: 7 },
    ], 60),

  billingStatus: () => tx(s => ({ plan: s.profile.plan, status: s.profile.billing, renewsAt: s.profile.renewsAt, trialEndsAt: s.profile.trialEndsAt, interval: s.profile.interval })),

  checkout: planId =>
    tx(s => {
      const interval = planId === 'premium-year' ? 'YEAR' : 'MONTH'
      const trialEnds = new Date(Date.now() + 7 * DAY).toISOString()
      if (s.profile.plan === 'FREE') s.cash += START_CASH.PREMIUM - START_CASH.FREE
      s.profile = { ...s.profile, plan: 'PREMIUM', billing: 'TRIALING', trialEndsAt: trialEnds, renewsAt: trialEnds, interval }
      s.lives = { current: LIVES_MAX, updatedAt: Date.now() }
      return { plan: s.profile.plan, status: s.profile.billing, renewsAt: s.profile.renewsAt, trialEndsAt: s.profile.trialEndsAt, interval }
    }, 1200),

  cancelSubscription: () =>
    tx(s => {
      s.profile = { ...s.profile, plan: 'FREE', billing: 'CANCELED', renewsAt: null, trialEndsAt: null, interval: null }
      return { plan: s.profile.plan, status: s.profile.billing, renewsAt: null, trialEndsAt: null, interval: null }
    }),

  exportData: () => tx(s => JSON.stringify({ exportedAt: new Date().toISOString(), profile: s.profile, settings: s.settings, xp: s.xp, streak: s.streak, lessons: s.lessons, achievements: s.achievements, portfolio: { cash: s.cash, positions: s.positions }, trades: s.trades, orders: s.orders, alerts: s.alerts }, null, 2)),

  deleteAccount: () =>
    tx(s => {
      Object.assign(s, freshState())
    }, 600),

  // ── Admin: solo datos reales de este navegador; nunca cifras inventadas
  adminMetrics: () =>
    tx(s => {
      const signed = s.session.signedIn ? 1 : 0
      const trades = s.trades.filter(t => t.status === 'FILLED').length
      return {
        dau: signed, mau: signed, retentionD7: null, premiumConversion: s.profile.plan === 'PREMIUM' ? 100 : 0, simulatedTrades: trades,
        funnel: [
          { label: 'Registro', value: signed },
          { label: 'Onboarding completo', value: s.onboardingStep === null && signed ? 1 : 0 },
          { label: 'Primera lección', value: Object.keys(s.lessons).length ? 1 : 0 },
          { label: 'Primera operación', value: trades ? 1 : 0 },
          { label: 'Premium', value: s.profile.plan === 'PREMIUM' ? 1 : 0 },
        ],
        series: Array.from({ length: 30 }, (_, i) => (i === 29 ? signed : 0)),
        providers: [
          { name: 'Finnhub (acciones EE. UU.)', status: 'OK' as const, latencyMs: null, note: 'Simulado en esta versión' },
          { name: 'Binance (cripto)', status: 'OK' as const, latencyMs: null, note: 'Simulado en esta versión' },
          { name: 'BCE / Frankfurter (divisas)', status: 'OK' as const, latencyMs: null, note: 'Simulado en esta versión' },
        ],
      }
    }),

  adminUsers: q =>
    tx(s => {
      if (!s.session.signedIn) return []
      const u = { id: s.profile.id, name: s.profile.name || '—', email: s.profile.email, plan: s.profile.plan, createdAt: s.profile.memberSince, lastActive: s.streak.lastActive ?? '—', blocked: false, xp: s.xp }
      return !q || (u.name + u.email).toLowerCase().includes(q.toLowerCase()) ? [u] : []
    }),

  adminAudit: () => tx(s => s.audit),
}

