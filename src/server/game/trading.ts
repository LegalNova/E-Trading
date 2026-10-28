import 'server-only'
// Simulador de órdenes y cartera (docs/03-mercado.md §4). Todo con el precio del servidor (F3).
import type { OrderPreviewT, OrderResultT, OrderT, PortfolioT, PriceAlertT, TradeT, TradingStatsT } from '@/shared/contract'
import { fix2, fix8, fixPrice } from '@/shared/format'
import { isOpen, nextOpen, type ExchangeCode } from '@/shared/market-hours'
import { DAY_MS, addDays, dayOf } from '@/shared/time'
import type { Order, Position, Trade, User } from '@/generated/prisma/client'
import { db } from '../db'
import { fxRates, loadAssets, normCurrency, toEur } from '../market/service'
import { LESSON, lessonRef, RISK_LESSON } from '../content/catalog'
import { coach } from '../tutor/coach'
import { addXp, bump, bumpGoal, endFx, fail, lumi, markActive, notify, requireUser, RISK_PCT, START_CASH, unlockedFeatures, withCtx, type Ctx, type Tx } from './core'

// ── Libro de precios (solo los activos que necesita la petición) ──
export interface Px {
  symbol: string
  name: string
  type: string
  hours: ExchangeCode
  /** Moneda normalizada (GBp → GBP) y precio en ella */
  currency: string
  price: number
  prevClose: number
  /** Precio en euros, con el tipo de cambio real */
  eur: number
  open: boolean
  /** Mercado abierto y precio reciente: solo así se ejecuta una orden a mercado (un festivo cuenta como cerrado) */
  tradable: boolean
}
export type Book = Map<string, Px>

export async function priceBook(symbols: string[]): Promise<Book> {
  const [rows, rates] = await Promise.all([loadAssets([...new Set(symbols)]), fxRates()])
  const book: Book = new Map()
  const now = Date.now()
  for (const a of rows) {
    if (!a.quote) continue
    const { cur, div } = normCurrency(a.currency)
    const eur = toEur(Number(a.quote.price), a.currency, rates)
    if (eur === null) continue
    const open = isOpen(a.hours, new Date(now))
    const fresh = now - a.quote.asOf.getTime() < (a.delayedMinutes + 20) * 60_000
    book.set(a.symbol, { symbol: a.symbol, name: a.name, type: a.type, hours: a.hours, currency: cur, price: Number(a.quote.price) / div, prevClose: Number(a.quote.prevClose) / div, eur, open, tradable: open && fresh })
  }
  return book
}

/** Precios de lo que tiene el usuario (posiciones, órdenes pendientes y alertas) más los símbolos indicados */
export async function userBook(extra: string[] = [], userId?: string): Promise<Book> {
  const id = userId ?? (await requireUser()).id
  const [pos, ord, al] = await Promise.all([
    db.position.findMany({ where: { userId: id }, select: { symbol: true } }),
    db.order.findMany({ where: { userId: id, status: 'PENDING' }, select: { symbol: true } }),
    db.priceAlert.findMany({ where: { userId: id, active: true }, select: { symbol: true } }),
  ])
  return priceBook([...extra, ...pos.map(x => x.symbol), ...ord.map(x => x.symbol), ...al.map(x => x.symbol)])
}

const pxOf = (book: Book, sym: string) => book.get(sym) ?? fail(503, 'MARKET_UNAVAILABLE', 'Precio no disponible ahora mismo')
const fee = (amount: number) => Math.max(amount * 0.001, 1)
const fmtPrice = (p: Px, v: number) => (p.type === 'FX' ? v.toFixed(5) : fixPrice(v))
const n = (d: unknown) => Number(d ?? 0)

export async function portfolioRow(tx: Tx, user: User) {
  return tx.portfolio.upsert({ where: { userId: user.id }, create: { userId: user.id, cash: START_CASH[user.plan], resetsYear: new Date().getFullYear() }, update: {} })
}

function posValue(book: Book, p: Position) {
  const px = book.get(p.symbol)
  return n(p.qty) * (px ? px.eur : n(p.avgPrice)) // sin precio: a coste, nunca inventado
}

// ── Vista previa (04.3) ──────────────────────────────────
export interface OrderInput { symbol: string; side: 'BUY' | 'SELL'; type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT'; amount?: string; qty?: string; triggerPrice?: string; stopLoss?: string; takeProfit?: string; riskAcknowledged?: boolean; followedRiskAdvice?: boolean }

async function previewIn(c: Ctx, book: Book, i: OrderInput): Promise<OrderPreviewT> {
  const px = pxOf(book, i.symbol)
  const since = new Date(Date.now() - 86_400_000)
  const [pf, positions, features, recent, buys, stops] = await Promise.all([
    portfolioRow(c.tx, c.user), c.tx.position.findMany({ where: { userId: c.user.id } }), unlockedFeatures(c.tx, c.user),
    c.tx.trade.findMany({ where: { userId: c.user.id, status: 'FILLED', createdAt: { gte: since } }, select: { side: true, realizedPnl: true } }),
    c.tx.trade.aggregate({ where: { userId: c.user.id, status: 'FILLED', side: 'BUY', createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } }, _avg: { total: true } }),
    c.tx.order.count({ where: { userId: c.user.id, symbol: i.symbol, status: 'PENDING', type: 'STOP_LOSS' } }),
  ])
  const cash = n(pf.cash)
  const total = cash + positions.reduce((t, p) => t + posValue(book, p), 0)
  const mine = positions.find(p => p.symbol === i.symbol)
  const held = n(mine?.qty)
  const current = mine ? posValue(book, mine) : 0
  const qty = i.qty ? Math.max(0, Number(i.qty)) : Math.max(0, Number(i.amount ?? 0)) / px.eur
  const amount = qty * px.eur
  const f = amount > 0 ? fee(amount) : 0
  const allowedTypes = ['MARKET', ...features] as OrderPreviewT['allowedTypes']
  const locked = (['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] as const).filter(t => !features.includes(t)).map(type => ({ type, unlockBy: `LESSON:${RISK_LESSON}` }))
  const weight = total > 0 ? ((i.side === 'BUY' ? current + amount : current - amount) / total) * 100 : 0
  const flagged = i.side === 'BUY' && px.type !== 'INDEX' && weight > RISK_PCT && amount > 0
  const suggested = Math.max(0, (RISK_PCT / 100) * total - current)
  // Stop loss y take profit de la compra: por debajo y por encima del precio de entrada
  const entry = i.type === 'LIMIT' && Number(i.triggerPrice) > 0 ? Number(i.triggerPrice) : px.price
  const sl = Number(i.stopLoss ?? 0), tp = Number(i.takeProfit ?? 0)
  let error: OrderPreviewT['error'] = null
  if (amount > 0 && amount < 1) error = 'MIN_AMOUNT'
  else if (i.side === 'BUY' && amount + f > cash) error = 'INSUFFICIENT_FUNDS'
  else if (i.side === 'SELL' && qty > held + 1e-9) error = 'INSUFFICIENT_QTY'
  else if (i.side === 'BUY' && sl > 0 && sl >= entry) error = 'BAD_STOP'
  else if (i.side === 'BUY' && tp > 0 && tp <= entry) error = 'BAD_TAKE_PROFIT'
  const cashAfter = i.side === 'BUY' ? cash - amount - f : cash + amount - f
  const cryptoNow = positions.reduce((t, p) => t + (book.get(p.symbol)?.type === 'CRYPTO' ? posValue(book, p) : 0), 0)
  const tips = error
    ? []
    : coach({
        side: i.side, type: i.type, name: px.name, assetType: px.type, dayChangePct: px.prevClose > 0 ? (px.price / px.prevClose - 1) * 100 : 0, amount, total, cashAfter,
        position: mine ? { avgEur: n(mine.avgPrice), nowEur: px.eur, value: current } : null,
        cryptoWeightAfter: total > 0 ? ((cryptoNow + (px.type === 'CRYPTO' ? (i.side === 'BUY' ? amount : -amount) : 0)) / total) * 100 : 0,
        tradesToday: recent.length, losingSellsDay: recent.filter(t => t.side === 'SELL' && n(t.realizedPnl) < 0).length, avgBuy: n(buys._avg.total),
        hasStop: stops > 0 || sl > 0, canStop: features.includes('STOP_LOSS'),
        bigLosers: positions.filter(p => p.symbol !== i.symbol && book.get(p.symbol) && book.get(p.symbol)!.eur / n(p.avgPrice) - 1 < -0.15).length,
      })
  return {
    coach: tips.map(t => ({ ...t, lessonId: lessonRef(t.lessonId) })),
    estPrice: fmtPrice(px, px.price), qty: fix8(qty), fee: fix2(f), total: fix2(i.side === 'BUY' ? amount + f : amount - f),
    cashAfter: fix2(cashAfter), weightPct: Math.max(0, weight),
    risk: { flagged, reason: flagged ? `${px.name} sería el ${Math.round(weight)} % de tu cartera` : null, thresholdPct: RISK_PCT, suggestedAmount: flagged ? fix2(suggested) : null },
    allowedTypes, locked, error,
    // Lo que se perdería o ganaría (en euros, sin comisiones) si salta el stop o el objetivo
    exits: { lossAtStop: sl > 0 ? fix2(qty * px.eur * (1 - sl / entry)) : null, gainAtTarget: tp > 0 ? fix2(qty * px.eur * (tp / entry - 1)) : null },
  }
}

export async function preview(i: OrderInput) {
  const book = await userBook([i.symbol])
  return withCtx(c => previewIn(c, book, i))
}

// ── Ejecución ────────────────────────────────────────────
const toOrderT = (o: Order): OrderT => ({
  id: o.id, symbol: o.symbol, side: o.side, type: o.type, status: o.status, qty: fix8(n(o.qty)), amount: fix2(n(o.amount)), triggerPrice: o.triggerPrice ? String(n(o.triggerPrice)) : null,
  fillPrice: o.fillPrice ? String(n(o.fillPrice)) : null, fee: fix2(n(o.fee)), createdAt: o.createdAt.toISOString(), filledAt: o.filledAt?.toISOString() ?? null, executesAt: o.executesAt?.toISOString() ?? null,
  stopLoss: o.stopLoss ? String(n(o.stopLoss)) : null, takeProfit: o.takeProfit ? String(n(o.takeProfit)) : null, parentId: o.parentId,
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
    await c.tx.trade.create({ data: { userId: c.user.id, orderId: o.id, side: o.side, type: o.type, symbol: o.symbol, qty: fix8(qty), price: fmtPrice(px, px.price), fee: 0, total: fix2(amount), status: 'REJECTED', rejectReason: reason } })
    return c.tx.order.update({ where: { id: o.id }, data: { status: 'REJECTED' } })
  }
  if (qty <= 0) return reject('No tienes participaciones')
  if (o.side === 'BUY' && amount + f > n(pf.cash) + 1e-6) return reject('Saldo insuficiente')
  let pnl: number | null = null
  if (o.side === 'BUY') {
    const oldQ = n(pos?.qty)
    const avg = (oldQ * n(pos?.avgPrice) + amount) / (oldQ + qty)
    await c.tx.position.upsert({ where: { userId_symbol: { userId: c.user.id, symbol: o.symbol } }, create: { userId: c.user.id, symbol: o.symbol, qty: fix8(qty), avgPrice: avg.toFixed(12) }, update: { qty: fix8(oldQ + qty), avgPrice: avg.toFixed(12) } })
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
  await c.tx.trade.create({ data: { userId: c.user.id, orderId: o.id, side: o.side, type: o.type, symbol: o.symbol, qty: fix8(qty), price: fmtPrice(px, px.price), fee: fix2(f), total: fix2(amount), realizedPnl: pnl === null ? null : fix2(pnl), status: 'FILLED' } })
  // XP solo en las 3 primeras operaciones del día (D-017)
  if (c.g.tradesToday < 3) addXp(c, 15)
  c.g.tradesToday++
  await bumpGoal(c, 'ops')
  await markActive(c)
  if (!silent) await notify(c, 'ORDER_FILLED', `Orden ejecutada: ${o.symbol}`, `${o.side === 'BUY' ? 'Compra' : 'Venta'} a ${fmtPrice(px, px.price)} ${px.currency}.`, '/mercado/cartera')
  // Compra con salidas: se crean el stop loss y el take profit por la cantidad comprada
  if (o.side === 'BUY') {
    const exits = [['STOP_LOSS', o.stopLoss], ['TAKE_PROFIT', o.takeProfit]] as const
    for (const [type, trig] of exits) {
      if (!trig) continue
      await c.tx.order.create({ data: { userId: c.user.id, symbol: o.symbol, side: 'SELL', type, status: 'PENDING', qty: fix8(qty), amount: fix2(qty * px.eur * (n(trig) / px.price)), triggerPrice: trig, parentId: o.id } })
    }
  }
  // Salida de una compra: al ejecutarse una, la otra se cancela (OCO)
  if (o.side === 'SELL' && o.parentId) await c.tx.order.updateMany({ where: { userId: c.user.id, parentId: o.parentId, status: 'PENDING', id: { not: o.id } }, data: { status: 'CANCELLED' } })
  return c.tx.order.update({ where: { id: o.id }, data: { status: 'FILLED', fillPrice: fmtPrice(px, px.price), filledAt: now, fee: fix2(f), qty: fix8(qty), amount: fix2(amount) } })
}

export async function placeOrder(i: OrderInput, idempotencyKey?: string): Promise<OrderResultT> {
  const book = await userBook([i.symbol])
  return withCtx(async c => {
    // La clave antiduplicados va ligada al usuario: nunca devuelve la orden de otra persona
    const key = idempotencyKey ? `${c.user.id}:${idempotencyKey}` : undefined
    if (key) {
      const dup = await c.tx.order.findUnique({ where: { idempotencyKey: key } })
      if (dup && dup.userId === c.user.id) return { xp: 0, goalsCompleted: [], achievementsUnlocked: [], unlockedFeatures: [], order: toOrderT(dup) }
    }
    const px = pxOf(book, i.symbol)
    const pv = await previewIn(c, book, i)
    if (i.type !== 'MARKET' && !pv.allowedTypes.includes(i.type)) fail(422, 'FEATURE_LOCKED', `Aprueba la lección «${LESSON[RISK_LESSON]?.title ?? 'El stop loss'}» (gratis) o hazte Premium`)
    if (px.type === 'INDEX') fail(422, 'VALIDATION_ERROR', 'Los índices no se compran directamente')
    if (Number(pv.qty) <= 0) fail(422, 'VALIDATION_ERROR', 'Indica un importe')
    if (pv.error === 'MIN_AMOUNT') fail(422, 'VALIDATION_ERROR', 'El importe mínimo es 1 €')
    if (pv.error === 'INSUFFICIENT_QTY') fail(422, 'INSUFFICIENT_FUNDS', 'No tienes tantas participaciones')
    if (pv.error === 'INSUFFICIENT_FUNDS' && i.type === 'MARKET') fail(422, 'INSUFFICIENT_FUNDS', 'No tienes saldo suficiente')
    if (i.type !== 'MARKET' && !(Number(i.triggerPrice) > 0)) fail(422, 'VALIDATION_ERROR', 'Indica el precio de activación')
    if (i.type !== 'MARKET' && Number(i.triggerPrice) > px.price * 10) fail(422, 'VALIDATION_ERROR', 'Precio de activación fuera de rango')
    if ((i.stopLoss || i.takeProfit) && i.side !== 'BUY') fail(422, 'VALIDATION_ERROR', 'El stop loss y el take profit se añaden al comprar')
    if (i.stopLoss && !pv.allowedTypes.includes('STOP_LOSS')) fail(422, 'FEATURE_LOCKED', `Aprueba la lección «${LESSON[RISK_LESSON]?.title ?? 'El stop loss'}» (gratis) o hazte Premium`)
    if (i.takeProfit && !pv.allowedTypes.includes('TAKE_PROFIT')) fail(422, 'FEATURE_LOCKED', `Aprueba la lección «${LESSON[RISK_LESSON]?.title ?? 'El stop loss'}» (gratis) o hazte Premium`)
    if (pv.error === 'BAD_STOP') fail(422, 'VALIDATION_ERROR', 'El stop loss tiene que estar por debajo del precio de compra')
    if (pv.error === 'BAD_TAKE_PROFIT') fail(422, 'VALIDATION_ERROR', 'El take profit tiene que estar por encima del precio de compra')
    if (Number(i.takeProfit) > px.price * 10) fail(422, 'VALIDATION_ERROR', 'Take profit fuera de rango')
    if ((await c.tx.order.count({ where: { userId: c.user.id, status: 'PENDING' } })) >= 30) fail(422, 'VALIDATION_ERROR', 'Máximo 30 órdenes pendientes')
    const firstTrade = (await c.tx.trade.count({ where: { userId: c.user.id, status: 'FILLED' } })) === 0
    if (i.followedRiskAdvice) bump(c, 'calmRisk')
    if (i.type === 'LIMIT') bump(c, 'limits')
    if (i.type === 'STOP_LOSS' || Number(i.stopLoss) > 0) bump(c, 'stops')
    if (i.type === 'TAKE_PROFIT' || Number(i.takeProfit) > 0) bump(c, 'tps')
    let o = await c.tx.order.create({
      data: {
        userId: c.user.id, symbol: i.symbol, side: i.side, type: i.type, status: 'PENDING', qty: pv.qty, amount: fix2(Number(pv.qty) * px.eur), fee: pv.fee,
        triggerPrice: i.type === 'MARKET' ? null : Number(i.triggerPrice), riskAcknowledged: !!i.riskAcknowledged, idempotencyKey: key ?? null,
        stopLoss: Number(i.stopLoss) > 0 ? Number(i.stopLoss) : null, takeProfit: Number(i.takeProfit) > 0 ? Number(i.takeProfit) : null,
      },
    })
    if (i.type === 'MARKET' && px.tradable) {
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
    if (!px || !px.tradable) continue
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
      return { symbol: p.symbol, name: px?.name ?? p.symbol, type: (px?.type ?? 'STOCK') as PortfolioT['positions'][number]['type'], qty: fix8(n(p.qty)), avgPrice: fixPrice(n(p.avgPrice)), marketValue: fix2(v), unrealizedPnl: fix2(pnl), pnlPct: cost ? (pnl / cost) * 100 : 0, weightPct: total ? (v / total) * 100 : 0 }
    })
    .sort((a, b) => Number(b.marketValue) - Number(a.marketValue))
  const start = START_CASH[c.user.plan]
  // Foto diaria real del valor de la cartera (para el gráfico de evolución)
  await c.tx.portfolioSnapshot.upsert({ where: { userId_day: { userId: c.user.id, day: c.today } }, create: { userId: c.user.id, day: c.today, value: fix2(total) }, update: { value: fix2(total) } })
  return { totalValue: fix2(total), cash: fix2(cash), dayChange: fix2(dayChange), dayChangePct: total - dayChange ? (dayChange / (total - dayChange)) * 100 : 0, totalReturnPct: ((total - start) / start) * 100, realizedPnl: fix2(n(pf.realized)), unrealizedPnl: fix2(unreal), positions: list, resetsLeft: pf.resetsLeft }
}

export async function portfolio() {
  const book = await userBook()
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
  const book = await userBook()
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
  const book = await userBook()
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

const DEFAULT_WATCH = ['AAPL', 'SAN.MC', 'BTC-EUR', '^GSPC', '^IBEX', 'EURUSD=X']
export const watchlist = () =>
  withCtx(async c => {
    const rows = await c.tx.watchItem.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'asc' } })
    if (rows.length) return rows.map(r => r.symbol)
    await c.tx.watchItem.createMany({ data: DEFAULT_WATCH.map((symbol, i) => ({ userId: c.user.id, symbol, createdAt: new Date(Date.now() + i) })), skipDuplicates: true })
    return DEFAULT_WATCH
  })

export const toggleWatch = (symbol: string) =>
  withCtx(async c => {
    if (!(await c.tx.asset.findUnique({ where: { symbol } }))) fail(404, 'NOT_FOUND', 'Activo no encontrado')
    const key = { userId_symbol: { userId: c.user.id, symbol } }
    if (!(await c.tx.watchItem.findUnique({ where: key })) && (await c.tx.watchItem.count({ where: { userId: c.user.id } })) >= 50) fail(422, 'VALIDATION_ERROR', 'Máximo 50 activos en seguimiento')
    if (await c.tx.watchItem.findUnique({ where: key })) await c.tx.watchItem.delete({ where: key })
    else await c.tx.watchItem.create({ data: { userId: c.user.id, symbol } })
    return (await c.tx.watchItem.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'asc' } })).map(r => r.symbol)
  })

// ── Hábitos (05.4) ───────────────────────────────────────
export async function tradingStats(): Promise<TradingStatsT> {
  const book = await userBook()
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
