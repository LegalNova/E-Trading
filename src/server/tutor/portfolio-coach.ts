// Coach de la cartera (auditoría PRO-28): una sola idea al día sobre la cartera virtual, como dato o pregunta.
// Nunca dice «compra» ni «vende»: señala algo que mirar y deja la decisión a la persona.
// Es una función pura (sin base de datos) para poder probarla sola.

export interface CoachHolding {
  name: string
  type: string
  weightPct: number
  pnlPct: number
  hasStop: boolean
}
export interface PortfolioCoachInput {
  holdings: CoachHolding[]
  cashPct: number
  tradesToday: number
}
export type PortfolioTipCode = 'EMPTY' | 'CONCENTRATED' | 'CRYPTO' | 'BUSY' | 'NO_STOP' | 'FEW' | 'CASH' | 'OK'
export interface PortfolioTip {
  code: PortfolioTipCode
  params: Record<string, string | number>
}

/** Peso a partir del cual un solo valor pesa demasiado (la regla del 20 % que se enseña en el curso) */
export const MAX_WEIGHT = 20
/** Peso total en cripto a partir del cual se avisa */
export const MAX_CRYPTO = 30
/** Operaciones en un día a partir de las cuales se pregunta por las comisiones */
export const BUSY_TRADES = 5
/** Pérdida (en %) a partir de la cual se pregunta por el stop si no lo tiene */
export const STOP_LOSS_PCT = -15

const round = (x: number) => Math.round(x)

/** La idea más importante de hoy, por orden de prioridad */
export function portfolioTip(i: PortfolioCoachInput): PortfolioTip {
  const h = i.holdings.filter(x => x.weightPct > 0)
  if (!h.length) return { code: 'EMPTY', params: {} }
  const top = [...h].sort((a, b) => b.weightPct - a.weightPct)[0]
  if (top.weightPct > MAX_WEIGHT) return { code: 'CONCENTRATED', params: { name: top.name, pct: round(top.weightPct), loss: Math.max(1, round(top.weightPct * 0.2)) } }
  const crypto = h.filter(x => x.type === 'CRYPTO').reduce((a, x) => a + x.weightPct, 0)
  if (crypto > MAX_CRYPTO) return { code: 'CRYPTO', params: { pct: round(crypto) } }
  if (i.tradesToday >= BUSY_TRADES) return { code: 'BUSY', params: { n: i.tradesToday } }
  const loser = [...h].filter(x => x.pnlPct <= STOP_LOSS_PCT && !x.hasStop).sort((a, b) => a.pnlPct - b.pnlPct)[0]
  if (loser) return { code: 'NO_STOP', params: { name: loser.name, pct: round(Math.abs(loser.pnlPct)) } }
  if (h.length <= 2) return { code: 'FEW', params: { n: h.length } }
  if (i.cashPct > 90) return { code: 'CASH', params: { pct: round(i.cashPct) } }
  return { code: 'OK', params: { n: h.length } }
}
