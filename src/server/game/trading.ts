import 'server-only'
// Simulador de órdenes y cartera (docs/03-mercado.md §4). Todo con el precio del servidor (F3).
import type { OrderPreviewT, OrderResultT, OrderT, PortfolioT, PriceAlertT, TradeT, TradingStatsT } from '@/shared/contract'
import { fix2, fix8 } from '@/shared/format'
import { isOpen, nextOpen, type ExchangeCode } from '@/shared/market-hours'
import { DAY_MS, addDays, dayOf } from '@/shared/time'
import type { Order, Position, Trade, User } from '@/generated/prisma/client'
import { loadAssets } from '../market/service'
import { addXp, bump, bumpGoal, endFx, fail, lumi, markActive, notify, RISK_PCT, START_CASH, unlockedFeatures, withCtx, type Ctx, type Tx } from './core'

// ── Libro de precios (una lectura por petición) ──────────
export interface Px { symbol: string; name: string; type: string; hours: ExchangeCode; currency: string; price: number; prevClose: number; eur: number; open: boolean }
export type Book = Map<string, Px>

export async function priceBook(): Promise<Book> {
  const rows = await loadAssets()
  const fx = rows.find(a => a.symbol === 'EURUSD')?.quote
  const eurPerUsd = fx ? 1 / Number(fx.price) : null
  const book: Book = new Map()
  for (const a of rows) {
    if (!a.quote) continue
    const price = Number(a.quote.price)
    const toEur = a.currency === 'USD' ? (eurPerUsd ? price * eurPerUsd : NaN) : price
    if (!Number.isFinite(toEur)) continue
    book.set(a.symbol, { symbol: a.symbol, name: a.name, type: a.type, hours: a.hours as ExchangeCode, currency: a.currency, price, prevClose: Number(a.quote.prevClose), eur: toEur, open: isOpen(a.hours as ExchangeCode) })
  }
  return book
}

const pxOf = (book: Book, sym: string) => book.get(sym) ?? fail(503, 'MARKET_UNAVAILABLE', 'Precio no disponible ahora mismo')
const fee = (amount: number) => Math.max(amount * 0.001, 1)
const fmtPrice = (p: Px, v: number) => (p.type === 'FX' ? v.toFixed(5) : v >= 1000 ? v.toFixed(2) : v.toFixed(4))
const n = (d: unknown) => Number(d ?? 0)

export async function portfolioRow(tx: Tx, user: User) {
  return tx.portfolio.upsert({ where: { userId: user.id }, create: { userId: user.id, cash: START_CASH[user.plan], resetsYear: new Date().getFullYear() }, update: {} })
}

function posValue(book: Book, p: Position) {
  const px = book.get(p.symbol)
  return n(p.qty) * (px ? px.eur : n(p.avgPrice)) // sin precio: a coste, nunca inventado
}

// ── Vista previa (04.3) ──────────────────────────────────
export interface OrderInput { symbol: string; side: 'BUY' | 'SELL'; type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT'; amount?: string; qty?: string; triggerPrice?: string; riskAcknowledged?: boolean; followedRiskAdvice?: boolean }

async function previewIn(c: Ctx, book: Book, i: OrderInput): Promise<OrderPreviewT> {
  const px = pxOf(book, i.symbol)
  const [pf, positions, features] = await Promise.all([portfolioRow(c.tx, c.user), c.tx.position.findMany({ where: { userId: c.user.id } }), unlockedFeatures(c.tx, c.user)])
  const cash = n(pf.cash)
  const total = cash + positions.reduce((t, p) => t + posValue(book, p), 0)
  const mine = positions.find(p => p.symbol === i.symbol)
  const held = n(mine?.qty)
  const current = mine ? posValue(book, mine) : 0
  const qty = i.qty ? Math.max(0, Number(i.qty)) : Math.max(0, Number(i.amount ?? 0)) / px.eur
  const amount = qty * px.eur
  const f = amount > 0 ? fee(amount) : 0
  const allowedTypes = ['MARKET', ...features] as OrderPreviewT['allowedTypes']
  const locked = (['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] as const).filter(t => !features.includes(t)).map(type => ({ type, unlockBy: 'LESSON:u3l3' }))
  const weight = total > 0 ? ((i.side === 'BUY' ? current + amount : current - amount) / total) * 100 : 0
  const flagged = i.side === 'BUY' && px.type !== 'INDEX' && weight > RISK_PCT && amount > 0
  const suggested = Math.max(0, (RISK_PCT / 100) * total - current)
  let error: OrderPreviewT['error'] = null
  if (amount > 0 && amount < 1) error = 'MIN_AMOUNT'
  else if (i.side === 'BUY' && amount + f > cash) error = 'INSUFFICIENT_FUNDS'
  else if (i.side === 'SELL' && qty > held + 1e-9) error = 'INSUFFICIENT_QTY'
  return {
    estPrice: fmtPrice(px, px.price), qty: fix8(qty), fee: fix2(f), total: fix2(i.side === 'BUY' ? amount + f : amount - f),
    cashAfter: fix2(i.side === 'BUY' ? cash - amount - f : cash + amount - f), weightPct: Math.max(0, weight),
    risk: { flagged, reason: flagged ? `${px.name} sería el ${Math.round(weight)} % de tu cartera` : null, thresholdPct: RISK_PCT, suggestedAmount: flagged ? fix2(suggested) : null },
    allowedTypes, locked, error,
  }
}

export async function preview(i: OrderInput) {
  const book = await priceBook()
  return withCtx(c => previewIn(c, book, i))
}

// ── Ejecución ────────────────────────────────────────────
const toOrderT = (o: Order): OrderT => ({
  id: o.id, symbol: o.symbol, side: o.side, type: o.type, status: o.status, qty: fix8(n(o.qty)), amount: fix2(n(o.amount)), triggerPrice: o.triggerPrice ? String(n(o.triggerPrice)) : null,
  fillPrice: o.fillPrice ? String(n(o.fillPrice)) : null, fee: fix2(n(o.fee)), createdAt: o.createdAt.toISOString(), filledAt: o.filledAt?.toISOString() ?? null, executesAt: o.executesAt?.toISOString() ?? null,
})
const toTradeT = (t: Trade): TradeT => ({
  id: t.id, side: t.side, type: t.type, symbol: t.symbol, qty: fix8(n(t.qty)), price: String(n(t.price)), fee: fix2(n(t.fee)), total: fix2(n(t.total)),
  realizedPnl: t.realizedPnl === null ? null : fix2(n(t.realizedPnl)), status: t.status as 'FILLED' | 'REJECTED', createdAt: t.createdAt.toISOString(), rejectReason: t.rejectReason,
})

/** Ejecuta una orden al precio actual del servidor. Devuelve la orden actualizada. */
async function fill(c: Ctx, book: Book, o: Order, silent = false): Promise<Order> {
  const px = pxOf(book, o.symbol)
  const pf = await portfolioRow(c.tx, c.user)
  const pos = await c.tx.position.findUnique({ where: { userId_symbol: { userId: c.user.id, symbol: o.symbol } } })
  let qty = n(o.qty)
  if (o.side === 'SELL') qty = Math.min(qty, n(pos?.qty))
  const amount = qty * px.eur
  const f = fee(amount)
  const reject = async (reason: string) => {
    await c.tx.trade.create({ data: { userId: c.user.id, orderId: o.id, side: o.side, type: o.type, symbol: o.symbol, qty: fix8(qty), price: px.price, fee: 0, total: fix2(amount), status: 'REJECTED', rejectReason: reason } })
    return c.tx.order.update({ where: { id: o.id }, data: { status: 'REJECTED' } })
  }
  if (qty <= 0) return reject('No tienes participaciones')
  if (o.side === 'BUY' && amount + f > n(pf.cash) + 1e-6) return reject('Saldo insuficiente')
  let pnl: number | null = null
  if (o.side === 'BUY') {
    const oldQ = n(pos?.qty)
    const avg = (oldQ * n(pos?.avgPrice) + amount) / (oldQ + qty)
    await c.tx.position.upsert({ where: { userId_symbol: { userId: c.user.id, symbol: o.symbol } }, create: { userId: c.user.id, symbol: o.symbol, qty: fix8(qty), avgPrice: avg.toFixed(8) }, update: { qty: fix8(oldQ + qty), avgPrice: avg.toFixed(8) } })
    await c.tx.portfolio.update({ where: { userId: c.user.id }, data: { cash: fix2(n(pf.cash) - amount - f) } })
    if (px.type === 'CRYPTO') bump(c, 'crypto')
    if (px.type === 'ETF') bump(c, 'etf')
  } else {
    pnl = (px.eur - n(pos!.avgPrice)) * qty - f
    const left = n(pos!.qty) - qty
    if (left < 1e-9) await c.tx.position.delete({ where: { userId_symbol: { userId: c.user.id, symbol: o.symbol } } })
    else await c.tx.position.update({ where: { userId_symbol: { userId: c.user.id, symbol: o.symbol } }, data: { qty: fix8(left) } })
    await c.tx.portfolio.update({ where: { userId: c.user.id }, data: { cash: fix2(n(pf.cash) + amount - f), realized: fix2(n(pf.realized) + pnl) } })
  }
  const now = new Date()
  await c.tx.trade.create({ data: { userId: c.user.id, orderId: o.id, side: o.side, type: o.type, symbol: o.symbol, qty: fix8(qty), price: px.price, fee: fix2(f), total: fix2(amount), realizedPnl: pnl === null ? null : fix2(pnl), status: 'FILLED' } })
  // XP solo en las 3 primeras operaciones del día (D-017)
  if (c.g.tradesToday < 3) addXp(c, 15)
  c.g.tradesToday++
  await bumpGoal(c, 'ops')
  await markActive(c)
  if (!silent) await notify(c, 'ORDER_FILLED', `Orden ejecutada: ${o.symbol}`, `${o.side === 'BUY' ? 'Compra' : 'Venta'} a ${fmtPrice(px, px.price)} ${px.currency === 'EUR' ? '€' : '$'}.`, '/mercado/cartera')
  return c.tx.order.update({ where: { id: o.id }, data: { status: 'FILLED', fillPrice: px.price, filledAt: now, fee: fix2(f), qty: fix8(qty), amount: fix2(amount) } })
}

export async function placeOrder(i: OrderInput, idempotencyKey?: string): Promise<OrderResultT> {
  const book = await priceBook()
  return withCtx(async c => {
    if (idempotencyKey) {
      const dup = await c.tx.order.findUnique({ where: { idempotencyKey } })
      if (dup) return { xp: 0, goalsCompleted: [], achievementsUnlocked: [], unlockedFeatures: [], order: toOrderT(dup) }
    }
    const px = pxOf(book, i.symbol)
    const pv = await previewIn(c, book, i)
    if (i.type !== 'MARKET' && !pv.allowedTypes.includes(i.type)) fail(422, 'FEATURE_LOCKED', 'Completa «Stop loss y take profit» o hazte Premium')
    if (px.type === 'INDEX') fail(422, 'VALIDATION_ERROR', 'Los índices no se compran directamente')
    if (Number(pv.qty) <= 0) fail(422, 'VALIDATION_ERROR', 'Indica un importe')
    if (pv.error === 'MIN_AMOUNT') fail(422, 'VALIDATION_ERROR', 'El importe mínimo es 1 €')
    if (pv.error === 'INSUFFICIENT_QTY') fail(422, 'INSUFFICIENT_FUNDS', 'No tienes tantas participaciones')
    if (pv.error === 'INSUFFICIENT_FUNDS' && i.type === 'MARKET') fail(422, 'INSUFFICIENT_FUNDS', 'No tienes saldo suficiente')
    if (i.type !== 'MARKET' && !(Number(i.triggerPrice) > 0)) fail(422, 'VALIDATION_ERROR', 'Indica el precio de activación')
    const firstTrade = (await c.tx.trade.count({ where: { userId: c.user.id, status: 'FILLED' } })) === 0
    if (i.followedRiskAdvice) bump(c, 'calmRisk')
    if (i.type === 'LIMIT') bump(c, 'limits')
    if (i.type === 'STOP_LOSS') bump(c, 'stops')
    if (i.type === 'TAKE_PROFIT') bump(c, 'tps')
    let o = await c.tx.order.create({
      data: {
        userId: c.user.id, symbol: i.symbol, side: i.side, type: i.type, status: 'PENDING', qty: pv.qty, amount: fix2(Number(pv.qty) * px.eur), fee: pv.fee,
        triggerPrice: i.type === 'MARKET' ? null : Number(i.triggerPrice), riskAcknowledged: !!i.riskAcknowledged, idempotencyKey: idempotencyKey ?? null,
      },
    })
    if (i.type === 'MARKET' && px.open) {
      o = await fill(c, book, o, true)
      c.fx.companion = firstTrade ? lumi(c, 'FIRST_TRADE') : lumi(c, 'TRADE_DONE')
    } else {
      // Mercado cerrado o condicional: queda pendiente (D-013)
      if (i.type === 'MARKET') o = await c.tx.order.update({ where: { id: o.id }, data: { executesAt: nextOpen(px.hours) } })
      await markActive(c)
    }
    return { ...(await endFx(c)), order: toOrderT(o) }
  })
}

/** Ejecuta órdenes pendientes y alertas que ya se cumplen (al leer y desde la tarea programada) */
export async function processPendingFor(c: Ctx, book: Book) {
  const orders = await c.tx.order.findMany({ where: { userId: c.user.id, status: 'PENDING' }, orderBy: { createdAt: 'asc' } })
  for (const o of orders) {
    const px = book.get(o.symbol)
    if (!px || !px.open) continue
    const p = px.price
    const trig = o.triggerPrice ? n(o.triggerPrice) : null
    const hit = o.type === 'MARKET' || (trig !== null && ((o.type === 'LIMIT' && (o.side === 'BUY' ? p <= trig : p >= trig)) || (o.type === 'STOP_LOSS' && p <= trig) || (o.type === 'TAKE_PROFIT' && p >= trig)))
    if (hit) await fill(c, book, o)
  }
  const alerts = await c.tx.priceAlert.findMany({ where: { userId: c.user.id, active: true } })
  for (const al of alerts) {
    const p = book.get(al.symbol)?.price
    if (p === undefined) continue
    if ((al.condition === 'ABOVE' && p >= n(al.price)) || (al.condition === 'BELOW' && p <= n(al.price))) {
      await c.tx.priceAlert.update({ where: { id: al.id }, data: { active: false } })
      await notify(c, 'PRICE_ALERT', `${al.symbol} ha ${al.condition === 'ABOVE' ? 'superado' : 'bajado de'} ${n(al.price)}`, 'Tu alerta de precio se ha cumplido.', `/mercado/${al.symbol}`)
    }
  }
}

// ── Cartera (04.6) ───────────────────────────────────────
export async function portfolioIn(c: Ctx, book: Book): Promise<PortfolioT> {
  const [pf, positions] = await Promise.all([portfolioRow(c.tx, c.user), c.tx.position.findMany({ where: { userId: c.user.id } })])
  const cash = n(pf.cash)
  const values = positions.map(p => ({ p, v: posValue(book, p), px: book.get(p.symbol) }))
  const total = cash + values.reduce((t, x) => t + x.v, 0)
  let dayChange = 0
  let unreal = 0
  const list = values
    .map(({ p, v, px }) => {
      const chg = px ? (px.price - px.prevClose) / px.prevClose : 0
      dayChange += v - v / (1 + chg)
      const cost = n(p.qty) * n(p.avgPrice)
      const pnl = v - cost
      unreal += pnl
      return { symbol: p.symbol, name: px?.name ?? p.symbol, type: (px?.type ?? 'STOCK') as PortfolioT['positions'][number]['type'], qty: fix8(n(p.qty)), avgPrice: fix2(n(p.avgPrice)), marketValue: fix2(v), unrealizedPnl: fix2(pnl), pnlPct: cost ? (pnl / cost) * 100 : 0, weightPct: total ? (v / total) * 100 : 0 }
    })
    .sort((a, b) => Number(b.marketValue) - Number(a.marketValue))
  const start = START_CASH[c.user.plan]
  // Foto diaria real del valor de la cartera (para el gráfico de evolución)
  await c.tx.portfolioSnapshot.upsert({ where: { userId_day: { userId: c.user.id, day: c.today } }, create: { userId: c.user.id, day: c.today, value: fix2(total) }, update: { value: fix2(total) } })
  return { totalValue: fix2(total), cash: fix2(cash), dayChange: fix2(dayChange), dayChangePct: total - dayChange ? (dayChange / (total - dayChange)) * 100 : 0, totalReturnPct: ((total - start) / start) * 100, realizedPnl: fix2(n(pf.realized)), unrealizedPnl: fix2(unreal), positions: list, resetsLeft: pf.resetsLeft }
}

export async function portfolio() {
  const book = await priceBook()
  return withCtx(async c => {
    await processPendingFor(c, book)
    const out = await portfolioIn(c, book)
    await endFx(c) // logros que hayan podido desbloquear las órdenes ejecutadas
    return out
  })
}

/** Evolución real: fotos diarias guardadas + el saldo inicial del día de alta. Nunca puntos inventados. */
export async function historyIn(c: Ctx, range: '1W' | '1M' | '3M' | 'ALL') {
  const days = { '1W': 7, '1M': 30, '3M': 90, ALL: 3650 }[range]
  const from = addDays(c.today, -days)
  const snaps = await c.tx.portfolioSnapshot.findMany({ where: { userId: c.user.id, day: { gte: from } }, orderBy: { day: 'asc' } })
  const signup = dayOf(c.user.createdAt, c.user.timezone)
  const pts = snaps.map(s => ({ t: s.day, v: n(s.value) }))
  if (signup >= from && !pts.some(p => p.t === signup)) pts.unshift({ t: signup, v: START_CASH[c.user.plan] })
  return pts
}

export async function history(range: '1W' | '1M' | '3M' | 'ALL') {
  const book = await priceBook()
  return withCtx(async c => {
    await portfolioIn(c, book) // asegura la foto de hoy
    return historyIn(c, range)
  })
}

export const orders = () => withCtx(async c => (await c.tx.order.findMany({ where: { userId: c.user.id, status: 'PENDING' }, orderBy: { createdAt: 'desc' } })).map(toOrderT))
export const trades = () => withCtx(async c => (await c.tx.trade.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'desc' }, take: 100 })).map(toTradeT))

export const cancelOrder = (id: string) =>
  withCtx(async c => {
    await c.tx.order.updateMany({ where: { id, userId: c.user.id, status: 'PENDING' }, data: { status: 'CANCELLED' } })
  })

export async function resetPortfolio() {
  const book = await priceBook()
  return withCtx(async c => {
    const pf = await portfolioRow(c.tx, c.user)
    const year = new Date().getFullYear()
    const left = pf.resetsYear === year ? pf.resetsLeft : 3
    if (left <= 0) fail(429, 'RESET_LIMIT', 'Has usado los 3 reinicios de este año')
    await c.tx.position.deleteMany({ where: { userId: c.user.id } })
    await c.tx.order.updateMany({ where: { userId: c.user.id, status: 'PENDING' }, data: { status: 'CANCELLED' } })
    await c.tx.portfolio.update({ where: { userId: c.user.id }, data: { cash: START_CASH[c.user.plan], realized: 0, resetsLeft: left - 1, resetsYear: year } })
    await c.tx.auditLog.create({ data: { actorId: c.user.id, actor: c.user.email, action: 'PORTFOLIO_RESET', entity: 'Portfolio', entityId: c.user.id } })
    return portfolioIn(c, book)
  })
}

// ── Alertas y seguimiento ────────────────────────────────
const toAlert = (a: { id: string; symbol: string; condition: string; price: unknown; active: boolean }): PriceAlertT => ({ id: a.id, symbol: a.symbol, condition: a.condition as 'ABOVE' | 'BELOW', price: String(n(a.price)), active: a.active })

export const alerts = () => withCtx(async c => (await c.tx.priceAlert.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'desc' } })).map(toAlert))

export const createAlert = (symbol: string, condition: 'ABOVE' | 'BELOW', price: string) =>
  withCtx(async c => {
    if (!(Number(price) > 0)) fail(422, 'VALIDATION_ERROR', 'Precio no válido')
    if (!(await c.tx.asset.findUnique({ where: { symbol } }))) fail(404, 'NOT_FOUND', 'Activo no encontrado')
    if ((await c.tx.priceAlert.count({ where: { userId: c.user.id, active: true } })) >= 20) fail(422, 'VALIDATION_ERROR', 'Máximo 20 alertas activas')
    const a = await c.tx.priceAlert.create({ data: { userId: c.user.id, symbol, condition, price: Number(price) } })
    bump(c, 'alerts')
    await endFx(c)
    return toAlert(a)
  })

export const deleteAlert = (id: string) => withCtx(async c => void (await c.tx.priceAlert.deleteMany({ where: { id, userId: c.user.id } })))

const DEFAULT_WATCH = ['AAPL', 'BTC', 'SPY', 'IBEX', 'EURUSD']
export const watchlist = () =>
  withCtx(async c => {
    const rows = await c.tx.watchItem.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'asc' } })
    if (rows.length) return rows.map(r => r.symbol)
    await c.tx.watchItem.createMany({ data: DEFAULT_WATCH.map((symbol, i) => ({ userId: c.user.id, symbol, createdAt: new Date(Date.now() + i) })), skipDuplicates: true })
    return DEFAULT_WATCH
  })

export const toggleWatch = (symbol: string) =>
  withCtx(async c => {
    const key = { userId_symbol: { userId: c.user.id, symbol } }
    if (await c.tx.watchItem.findUnique({ where: key })) await c.tx.watchItem.delete({ where: key })
    else await c.tx.watchItem.create({ data: { userId: c.user.id, symbol } })
    return (await c.tx.watchItem.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'asc' } })).map(r => r.symbol)
  })

// ── Hábitos (05.4) ───────────────────────────────────────
export async function tradingStats(): Promise<TradingStatsT> {
  const book = await priceBook()
  return withCtx(async c => {
    const filled = await c.tx.trade.findMany({ where: { userId: c.user.id, status: 'FILLED' }, select: { realizedPnl: true } })
    const sells = filled.filter(t => t.realizedPnl !== null)
    const wins = sells.filter(t => n(t.realizedPnl) > 0).length
    const days = Math.max(1, (Date.now() - c.user.createdAt.getTime()) / DAY_MS)
    const pf = await portfolioIn(c, book)
    const insights: string[] = []
    if (!filled.length) insights.push('Aún no has operado. Empieza con una cantidad pequeña para ver cómo funciona.')
    else {
      const top = pf.positions[0]
      if (top && top.weightPct > RISK_PCT) insights.push(`${top.name} pesa el ${Math.round(top.weightPct)} % de tu cartera. Repartir reduce el golpe si cae.`)
      insights.push(`Has hecho ${filled.length} operaciones en ${Math.round(days)} días. Operar poco y con motivo suele ir mejor.`)
    }
    let peak = -Infinity
    let dd = 0
    for (const p of await historyIn(c, 'ALL')) {
      peak = Math.max(peak, p.v)
      dd = Math.min(dd, (p.v - peak) / peak)
    }
    return { tradesPerDay: filled.length / days, winRatePct: sells.length ? (wins / sells.length) * 100 : 0, maxDrawdownPct: dd * 100, insights }
  })
}
