import { describe, expect, it } from 'vitest'
import { portfolioTip, type CoachHolding } from '@/server/tutor/portfolio-coach'
import es from '../messages/es.json'
import ca from '../messages/ca.json'
import en from '../messages/en.json'

const h = (name: string, weightPct: number, extra: Partial<CoachHolding> = {}): CoachHolding => ({ name, type: 'STOCK', weightPct, pnlPct: 0, hasStop: false, ...extra })

describe('coach de la cartera (PRO-28)', () => {
  it('cartera vacía', () => expect(portfolioTip({ holdings: [], cashPct: 100, tradesToday: 0 }).code).toBe('EMPTY'))
  it('un valor que pesa más del 20 % va primero', () => {
    const t = portfolioTip({ holdings: [h('Apple', 45), h('Inditex', 10)], cashPct: 45, tradesToday: 9 })
    expect(t).toEqual({ code: 'CONCENTRATED', params: { name: 'Apple', pct: 45, loss: 9 } })
  })
  it('mucha cripto', () => expect(portfolioTip({ holdings: [h('BTC', 18, { type: 'CRYPTO' }), h('ETH', 18, { type: 'CRYPTO' }), h('A', 15)], cashPct: 49, tradesToday: 0 }).code).toBe('CRYPTO'))
  it('muchas operaciones hoy', () => expect(portfolioTip({ holdings: [h('A', 10), h('B', 10), h('C', 10)], cashPct: 70, tradesToday: 6 }).code).toBe('BUSY'))
  it('pérdida grande sin stop', () => {
    const t = portfolioTip({ holdings: [h('A', 10, { pnlPct: -22 }), h('B', 10), h('C', 10)], cashPct: 70, tradesToday: 1 })
    expect(t).toEqual({ code: 'NO_STOP', params: { name: 'A', pct: 22 } })
  })
  it('con stop no se pregunta por el stop', () => expect(portfolioTip({ holdings: [h('A', 10, { pnlPct: -22, hasStop: true }), h('B', 10), h('C', 10)], cashPct: 70, tradesToday: 1 }).code).toBe('OK'))
  it('pocos valores', () => expect(portfolioTip({ holdings: [h('A', 15), h('B', 15)], cashPct: 70, tradesToday: 0 }).code).toBe('FEW'))
  it('casi todo en efectivo', () => expect(portfolioTip({ holdings: [h('A', 3), h('B', 3), h('C', 3)], cashPct: 91, tradesToday: 0 }).code).toBe('CASH'))
  it('nunca dice «compra» ni «vende» en ningún idioma', () => {
    for (const m of [es, ca, en]) {
      const all = Object.values(m.home.todayPlan.coach).join(' ').toLowerCase()
      expect(all).not.toMatch(/\b(compra|vende|compres|vendas|compri|venguis|buy|sell)\b/)
    }
  })
})
