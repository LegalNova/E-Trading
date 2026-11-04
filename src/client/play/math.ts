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
  order: { name: string; emoji: string; at: number }[]
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
  return { months: m, interest, order: [...d].sort((a, b) => a.at - b.at).map(x => ({ name: x.name, emoji: x.emoji, at: x.at })) }
}
