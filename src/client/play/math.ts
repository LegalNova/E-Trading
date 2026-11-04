// Cuentas de las piezas interactivas (sin React: se prueban en tests/play.test.ts)
import type { WidgetT } from '@/shared/play'

/** Valor año a año de un ahorro: colchón (sin interés), interés simple y compuesto (mensual) */
export function growthPath(initial: number, monthly: number, rate: number, years: number) {
  const r = rate / 100
  // Tipo mensual equivalente: así «un 7 % al año» es exactamente un 7 % al año (1.000 € → 7.612 € en 30 años)
  const rm = (1 + r) ** (1 / 12) - 1
  const out = { mattress: [] as number[], simple: [] as number[], compound: [] as number[] }
  for (let y = 0; y <= years; y++) {
    const n = y * 12
    out.mattress.push(initial + monthly * n)
    out.simple.push(initial * (1 + r * y) + monthly * n + monthly * rm * ((n * (n - 1)) / 2))
    out.compound.push(initial * (1 + rm) ** n + (rm ? monthly * (((1 + rm) ** n - 1) / rm) : monthly * n))
  }
  return out
}

/** Cuota de un préstamo francés */
export const payment = (amount: number, tinPct: number, months: number) => {
  const r = tinPct / 100 / 12
  return r ? (amount * r) / (1 - (1 + r) ** -months) : amount / months
}

/** TAE: el coste anual equivalente con la comisión de apertura (tipo mensual por bisección) */
export function tae(amount: number, fee: number, pay: number, months: number) {
  const got = amount - fee
  let lo = 0
  let hi = 1
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2
    const pv = mid ? (pay * (1 - (1 + mid) ** -months)) / mid : pay * months
    if (pv > got) lo = mid
    else hi = mid
  }
  return ((1 + lo) ** 12 - 1) * 100
}

interface Plan {
  months: number
  interest: number
  order: { name: string; icon: string; at: number }[]
}

/** Simula el pago de varias deudas: mínimos a todas y lo que sobra a la primera según el método */
export function payDebts(debts: Extract<WidgetT, { kind: 'debts' }>['debts'], extra: number, method: 'snowball' | 'avalanche'): Plan {
  const d = debts.map(x => ({ ...x, bal: x.balance, at: 0 }))
  const budget = debts.reduce((s, x) => s + x.min, 0) + extra
  let interest = 0
  let m = 0
  while (d.some(x => x.bal > 0.01) && m < 600) {
    m++
    for (const x of d) if (x.bal > 0) {
      const i = (x.bal * x.rate) / 100 / 12
      x.bal += i
      interest += i
    }
    let left = budget
    for (const x of d) if (x.bal > 0) {
      const p = Math.min(x.min, x.bal, left)
      x.bal -= p
      left -= p
    }
    const open = d.filter(x => x.bal > 0.01).sort((a, b) => (method === 'snowball' ? a.bal - b.bal : b.rate - a.rate))
    for (const x of open) {
      const p = Math.min(x.bal, left)
      x.bal -= p
      left -= p
    }
    for (const x of d) if (x.bal <= 0.01 && !x.at) x.at = m
  }
  return { months: m, interest, order: [...d].sort((a, b) => a.at - b.at).map(x => ({ name: x.name, icon: x.icon, at: x.at })) }
}

/** Cartera con varios activos (pesos en %): valor mes a mes, con o sin rebalanceo anual */
export function mixPath(assets: { closes: number[] }[], weights: number[], amount: number, rebalance = false) {
  const n = Math.min(...assets.map(a => a.closes.length))
  const tot = weights.reduce((s, w) => s + w, 0) || 1
  let units = assets.map((a, i) => (amount * weights[i]) / tot / a.closes[0])
  const out: number[] = []
  for (let t = 0; t < n; t++) {
    const v = assets.reduce((s, a, i) => s + units[i] * a.closes[t], 0)
    out.push(v)
    if (rebalance && t > 0 && t % 12 === 0) units = assets.map((a, i) => (v * weights[i]) / tot / a.closes[t])
  }
  return out
}

/** Peor caída desde un máximo (en %, negativa) */
export const maxDrawdown = (v: number[]) => {
  let peak = v[0]
  let dd = 0
  for (const x of v) {
    peak = Math.max(peak, x)
    dd = Math.min(dd, x / peak - 1)
  }
  return dd * 100
}

/** Precio de un bono con cupón anual: valor de hoy de los cupones y del nominal al tipo de mercado */
export function bondPrice(face: number, couponPct: number, years: number, ratePct: number) {
  const r = ratePct / 100
  const c = (face * couponPct) / 100
  let p = 0
  for (let t = 1; t <= years; t++) p += c / (1 + r) ** t
  return p + face / (1 + r) ** years
}

/** Base del ahorro del IRPF (tramos de 2025) */
export const SAVINGS_BRACKETS: [number, number][] = [[6000, 19], [50000, 21], [200000, 23], [300000, 27], [Infinity, 30]]
export function savingsTax(base: number) {
  let tax = 0
  let from = 0
  const parts: { upTo: number; rate: number; amount: number }[] = []
  for (const [upTo, rate] of SAVINGS_BRACKETS) {
    const inB = Math.max(0, Math.min(base, upTo) - from)
    if (inB > 0) parts.push({ upTo, rate, amount: (inB * rate) / 100 })
    tax += (inB * rate) / 100
    from = upTo
    if (base <= upTo) break
  }
  const marginal = SAVINGS_BRACKETS.find(([upTo]) => base <= upTo)?.[1] ?? 30
  return { tax, parts, marginal: base > 0 ? marginal : 0 }
}

/** Todo de golpe frente a repartir la compra en `spread` meses, mirando el valor al cabo de `window` meses */
export function dcaCompare(closes: number[], start: number, total: number, spread: number, window: number) {
  const end = Math.min(closes.length - 1, start + window)
  const lump = (total / closes[start]) * closes[end]
  const k = Math.min(spread, end - start)
  let units = 0
  for (let i = 0; i < k; i++) units += total / k / closes[start + i]
  return { lump, dca: units * closes[end], end }
}

/** Compra a mercado contra un libro de órdenes: precio medio y deslizamiento frente al mejor precio */
export function fillBuy(asks: { price: number; size: number }[], size: number) {
  let left = size
  let cost = 0
  for (const a of asks) {
    const q = Math.min(left, a.size)
    cost += q * a.price
    left -= q
    if (!left) break
  }
  const filled = size - left
  const avg = filled ? cost / filled : asks[0].price
  return { avg, filled, slippagePct: (avg / asks[0].price - 1) * 100 }
}

/** Con stop y objetivo puestos, ¿qué toca primero el precio en las velas siguientes? (si ambos en la misma vela, el stop) */
export function firstHit(future: [number, number, number, number][], stop: number, take: number) {
  for (let i = 0; i < future.length; i++) {
    const [, h, l] = future[i]
    if (l <= stop) return { hit: 1 as const, at: i }
    if (h >= take) return { hit: 2 as const, at: i }
  }
  return { hit: 0 as const, at: future.length - 1 }
}
