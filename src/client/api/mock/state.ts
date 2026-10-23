// Estado de la simulación, guardado en el navegador (localStorage).
// Reproduce las reglas de docs/02-gamificacion.md y docs/03-mercado.md
// para que el frontend se pueda probar entero antes de tener backend.
import type { GenderT, NotificationT, OrderT, PriceAlertT, SettingsT, TradeT } from '@/shared/contract'
import type { OnboardingDraft, AuditEntry } from '../types'
import { ASSETS, ASSET, UNITS } from './catalog'

export const KEY = 'et-mock-v1'
export const DAY = 86_400_000
export const LIVES_MAX = 5
export const LIFE_MS = 4 * 3_600_000
export const START_CASH = { FREE: 10_000, PREMIUM: 50_000 }

export interface LessonProgress { done: boolean; stars: number }
export interface Attempt {
  id: string
  mode: 'LESSON' | 'PLACEMENT' | 'REVIEW'
  lessonId: string | null
  qids: string[]
  answers: Record<string, { correct: boolean; ms: number }>
  startedAt: number
  finished?: unknown
}

export interface State {
  v: 1
  session: { signedIn: boolean; email: string | null }
  onboardingStep: number | null
  draft: OnboardingDraft
  profile: { id: string; name: string; email: string; gender: GenderT; plan: 'FREE' | 'PREMIUM'; trialEndsAt: string | null; renewsAt: string | null; billing: 'NONE' | 'TRIALING' | 'ACTIVE' | 'CANCELED'; interval: 'MONTH' | 'YEAR' | null; memberSince: string; companionName: string; skinId: string }
  xp: number
  weekXp: { week: string; xp: number }
  gems: number
  lives: { current: number; updatedAt: number }
  streak: { current: number; best: number; lastActive: string | null; freezes: number; history: Record<string, 'ACTIVE' | 'FROZEN' | 'MISSED'> }
  goals: { date: string; lesson: number; ops: number; perfect: number; rewarded: string[] }
  lessons: Record<string, LessonProgress>
  placementDone: boolean
  attempts: Record<string, Attempt>
  mistakes: string[]
  counters: { perfect: number; fastPerfect: number; reviewed: number; stops: number; tps: number; limits: number; alerts: number; crypto: number; etf: number; calmRisk: number; leagueUp: number; top3: number; freezeUsed: number; goalDays: number }
  achievements: Record<string, string> // code → unlockedAt
  cash: number
  realized: number
  positions: Record<string, { qty: number; avg: number }>
  orders: OrderT[]
  trades: TradeT[]
  tradesToday: { date: string; n: number }
  alerts: PriceAlertT[]
  watchlist: string[]
  resetsLeft: number
  prices: Record<string, { p: number; ref: number; t: number; day: string }>
  notifications: NotificationT[]
  settings: SettingsT
  audit: AuditEntry[]
}

// ── Utilidades ───────────────────────────────────────────
export const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))

/** Fecha local del usuario (Europa/Madrid en el MVP) */
export function dayOf(t = Date.now()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t))
}
export const addDays = (ymd: string, n: number) => dayOf(new Date(ymd + 'T12:00:00Z').getTime() + n * DAY)

/** Lunes de la semana (clave de la liga) */
export function weekOf(t = Date.now()): string {
  const d = new Date(dayOf(t) + 'T12:00:00Z')
  const wd = (d.getUTCDay() + 6) % 7
  return dayOf(d.getTime() - wd * DAY)
}

/** Generador pseudoaleatorio estable a partir de un texto */
export function rng(seed: string) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}
export function gauss(r: () => number = Math.random) {
  const u = Math.max(r(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

/** Serie estable de `n` puntos que acaba exactamente en `end` */
export function series(seed: string, n: number, end: number, vol: number): number[] {
  const r = rng(seed)
  const out: number[] = []
  let v = 1
  for (let i = 0; i < n; i++) {
    v *= 1 + gauss(r) * vol
    out.push(v)
  }
  const k = end / out[n - 1]
  return out.map(x => x * k)
}

/** Serie estable que va de `start` a `end` (para que la forma coincida con el cambio del día) */
export function bridge(seed: string, n: number, start: number, end: number, vol: number): number[] {
  const raw = series(seed, n, 1, vol)
  return raw.map((v, i) => {
    const w = i / (n - 1)
    // Ruido que vale 1 en los extremos × recta de `start` a `end`
    return (v / (raw[0] * (1 - w) + raw[n - 1] * w)) * (start + (end - start) * w)
  })
}

// ── Niveles: 500 × 1,4 ───────────────────────────────────
export const LEVEL_MIN = [0, 500, 1200, 2180, 3552, 5473, 8162, 11927]
export function levelOf(xp: number) {
  let n = 1
  for (let i = 0; i < LEVEL_MIN.length; i++) if (xp >= LEVEL_MIN[i]) n = i + 1
  return { n, min: LEVEL_MIN[n - 1], next: LEVEL_MIN[n] ?? null }
}

// ── Estado inicial ───────────────────────────────────────
const emptyDraft = (): OnboardingDraft => ({ name: '', gender: 'N', birthDate: '', experience: 'NONE', goals: [], dailyGoalMinutes: 10, skinId: 'azul', companionName: 'Lumi', disclaimerAccepted: false })

function seedPrices(now: number): State['prices'] {
  const day = dayOf(now)
  return Object.fromEntries(
    ASSETS.map(a => {
      const r = rng(a.symbol + day)
      const chg = gauss(r) * a.vol * 0.6
      const p = a.base
      return [a.symbol, { p, ref: p / (1 + chg / 100), t: now, day }]
    }),
  )
}

function baseSettings(): SettingsT {
  return {
    locale: 'es', currency: 'EUR', dailyGoalMinutes: 10, theme: 'AUTO', gender: 'N',
    notificationPrefs: {
      STREAK_RISK: { inApp: true, email: true, push: true },
      ORDER_FILLED: { inApp: true, email: false, push: true },
      PRICE_ALERT: { inApp: true, email: false, push: true },
      ACHIEVEMENT: { inApp: true, email: false, push: false },
      LEAGUE_RESULT: { inApp: true, email: true, push: false },
      NEW_LESSON: { inApp: true, email: false, push: false },
    },
  }
}

/** Cuenta nueva: lo que ve alguien que acaba de registrarse */
export function freshState(email: string | null = null): State {
  const now = Date.now()
  const today = dayOf(now)
  return {
    v: 1,
    session: { signedIn: !!email, email },
    onboardingStep: email ? 1 : null,
    draft: emptyDraft(),
    profile: { id: uid(), name: '', email: email ?? '', gender: 'N', plan: 'FREE', trialEndsAt: null, renewsAt: null, billing: 'NONE', interval: null, memberSince: new Date(now).toISOString(), companionName: 'Lumi', skinId: 'azul' },
    xp: 0,
    weekXp: { week: weekOf(now), xp: 0 },
    gems: 50,
    lives: { current: LIVES_MAX, updatedAt: now },
    streak: { current: 0, best: 0, lastActive: null, freezes: 0, history: {} },
    goals: { date: today, lesson: 0, ops: 0, perfect: 0, rewarded: [] },
    lessons: {},
    placementDone: false,
    attempts: {},
    mistakes: [],
    counters: { perfect: 0, fastPerfect: 0, reviewed: 0, stops: 0, tps: 0, limits: 0, alerts: 0, crypto: 0, etf: 0, calmRisk: 0, leagueUp: 0, top3: 0, freezeUsed: 0, goalDays: 0 },
    achievements: {},
    cash: START_CASH.FREE,
    realized: 0,
    positions: {},
    orders: [],
    trades: [],
    tradesToday: { date: today, n: 0 },
    alerts: [],
    watchlist: ['AAPL', 'BTC', 'SPY', 'IBEX', 'EURUSD'],
    resetsLeft: 3,
    prices: seedPrices(now),
    notifications: [],
    settings: baseSettings(),
    audit: [],
  }
}

/** Cuenta de ejemplo («Laura»): sirve para ver todas las pantallas con datos */
export function sampleState(email: string): State {
  const s = freshState(email)
  const now = Date.now()
  const today = dayOf(now)
  s.onboardingStep = null
  s.placementDone = true
  s.profile = { ...s.profile, name: 'Laura', gender: 'F', memberSince: new Date(now - 41 * DAY).toISOString() }
  s.settings.gender = 'F'
  s.xp = 860
  s.weekXp = { week: weekOf(now), xp: 310 }
  s.gems = 240
  s.lives = { current: 4, updatedAt: now - 3_600_000 }
  const history: State['streak']['history'] = {}
  for (let i = 1; i <= 30; i++) {
    const d = addDays(today, -i)
    history[d] = i <= 6 ? 'ACTIVE' : i === 7 ? 'MISSED' : i === 12 ? 'FROZEN' : i % 5 === 0 ? 'MISSED' : 'ACTIVE'
  }
  s.streak = { current: 6, best: 14, lastActive: addDays(today, -1), freezes: 1, history }
  s.goals = { date: today, lesson: 0, ops: 1, perfect: 0, rewarded: [] }
  s.lessons = {
    u1l1: { done: true, stars: 3 }, u1l2: { done: true, stars: 3 }, u1l3: { done: true, stars: 2 }, u1l4: { done: true, stars: 3 },
    u2l1: { done: true, stars: 3 }, u2l2: { done: true, stars: 2 },
  }
  s.mistakes = ['u2l2-3', 'u1l3-2']
  s.counters = { ...s.counters, perfect: 4, crypto: 1, etf: 1 }
  const ago = (d: number) => new Date(now - d * DAY).toISOString()
  for (const [code, d] of [['FIRST_LESSON', 40], ['LESSONS_5', 20], ['QUIZ_PERFECT', 38], ['UNIT_1', 25], ['PLACEMENT', 41], ['FIRST_TRADE', 33], ['STREAK_3', 30], ['STREAK_7', 18], ['TRADES_10', 9], ['DIVERSIFY_3', 12], ['CRYPTO_FIRST', 22], ['ETF_FIRST', 15], ['FIRST_ALERT', 14]] as const) s.achievements[code] = ago(d)
  s.cash = 4210.8
  s.realized = 121.8
  // Precio medio siempre en euros (moneda de la cartera)
  s.positions = { AAPL: { qty: 5, avg: 284.1 }, BTC: { qty: 0.025, avg: 71800 }, VWCE: { qty: 10, avg: 133.4 }, NVDA: { qty: 7, avg: 201.5 } }
  const t = (id: string, side: 'BUY' | 'SELL', type: TradeT['type'], symbol: string, qty: number, price: number, d: number, pnl: number | null, rejected?: string): TradeT => {
    // El total va en euros (moneda de la cartera); el precio, en la del activo
    const total = qty * price * (ASSET[symbol].currency === 'USD' ? 0.887 : 1)
    const fee = Math.max(total * 0.001, 1)
    return { id, side, type, symbol, qty: qty.toFixed(8), price: price.toFixed(2), fee: fee.toFixed(2), total: total.toFixed(2), realizedPnl: pnl === null ? null : pnl.toFixed(2), status: rejected ? 'REJECTED' : 'FILLED', createdAt: ago(d), rejectReason: rejected ?? null }
  }
  s.trades = [
    t('t5', 'SELL', 'MARKET', 'TSLA', 4, 321.05, 6, 84.2),
    t('t4', 'SELL', 'TAKE_PROFIT', 'NVDA', 3, 213.4, 8, 52.1),
    t('t3', 'BUY', 'MARKET', 'BTC', 0.05, 71200, 11, null, 'Saldo insuficiente'),
    t('t2', 'BUY', 'MARKET', 'BTC', 0.025, 71800, 22, null),
    t('t1', 'BUY', 'MARKET', 'AAPL', 5, 320.4, 33, null),
  ]
  s.tradesToday = { date: today, n: 1 }
  s.alerts = [{ id: 'al1', symbol: 'BTC', condition: 'BELOW', price: '70000', active: true }]
  s.watchlist = ['AAPL', 'BTC', 'IBEX', 'EURUSD', 'NVDA']
  s.resetsLeft = 2
  s.notifications = [
    { id: 'n1', type: 'STREAK_RISK', title: 'Tu racha de 6 días sigue viva', body: 'Una clase de 5 minutos basta para mantenerla hoy.', deepLink: '/clases', readAt: null, createdAt: new Date(now - 2 * 3_600_000).toISOString() },
    { id: 'n2', type: 'ORDER_FILLED', title: 'Orden ejecutada: TSLA', body: 'Venta de 4 acciones a 321,05 $.', deepLink: '/mercado/cartera', readAt: null, createdAt: ago(6) },
    { id: 'n3', type: 'ACHIEVEMENT', title: 'Logro: Diez operaciones', body: '+20 gemas y +20 XP.', deepLink: '/perfil/logros', readAt: ago(8), createdAt: ago(9) },
    { id: 'n4', type: 'LEAGUE_RESULT', title: 'Semana cerrada: puesto 9 de 30', body: 'Sigues en la división Aprendiz.', deepLink: '/liga', readAt: ago(4), createdAt: ago(4) },
  ]
  return s
}

// ── Persistencia ─────────────────────────────────────────
let memory: State | null = null

export function load(): State {
  if (memory) return memory
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as State
      if (parsed?.v === 1) return (memory = parsed)
    }
  } catch {
    // Almacenamiento bloqueado o corrupto: empezamos de cero
  }
  return (memory = freshState())
}

export function save(s: State) {
  memory = s
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // Sin almacenamiento (modo privado): la sesión dura lo que la pestaña
  }
}

export function replace(s: State) {
  save(s)
}

export const assetOf = (sym: string) => ASSET[sym]
export const allLessons = () => UNITS.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })))
