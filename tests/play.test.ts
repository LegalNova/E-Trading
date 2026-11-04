// Clases interactivas: las cuentas de las piezas coinciden con las cifras que citan las clases, y las condiciones
// de retos y Lumi y el recorrido de textos para traducir funcionan
import { describe, expect, it } from 'vitest'
import { growthPath, payDebts, payment, tae } from '@/client/play/math'
import { holds, walkTexts } from '@/shared/play'

describe('cuentas de las piezas', () => {
  it('interés compuesto: 1.000 € al 7 % durante 30 años son 7.612 € (simple: 3.100 €)', () => {
    const p = growthPath(1000, 0, 7, 30)
    expect(Math.round(p.compound[30])).toBe(7612)
    expect(Math.round(p.simple[30])).toBe(3100)
    expect(p.mattress[30]).toBe(1000)
  })
  it('Ana (25) y Bruno (35), 200 € al mes al 7 % hasta los 65: unos 494.000 € y 234.000 €', () => {
    expect(Math.round(growthPath(0, 200, 7, 40).compound[40] / 1000)).toBe(494)
    expect(Math.round(growthPath(0, 200, 7, 30).compound[30] / 1000)).toBe(234)
  })
  it('préstamo de 6.000 € a 4 años al 7 %: cuota de 143,68 € y TAE mayor que el TIN por la comisión', () => {
    const c = payment(6000, 7, 48)
    expect(c).toBeCloseTo(143.68, 2)
    const t = tae(6000, 180, c, 48)
    expect(t).toBeGreaterThan(7.23)
    expect(t).toBeLessThan(9)
    expect(tae(6000, 0, c, 48)).toBeCloseTo(7.23, 1) // sin comisión: solo el efecto de pagar cada mes
  })
  it('avalancha paga menos intereses que bola de nieve; la bola de nieve liquida antes la primera deuda', () => {
    const d = [
      { emoji: '💳', name: 'Tarjeta', balance: 1200, rate: 22, min: 40 },
      { emoji: '📱', name: 'Móvil', balance: 400, rate: 9, min: 40 },
      { emoji: '🚗', name: 'Coche', balance: 5000, rate: 8, min: 150 },
    ]
    const ava = payDebts(d, 100, 'avalanche')
    const snow = payDebts(d, 100, 'snowball')
    expect(ava.interest).toBeLessThan(snow.interest)
    expect(snow.order[0].name).toBe('Móvil')
    expect(snow.order[0].at).toBeLessThanOrEqual(ava.order[0].at)
  })
})

describe('retos y textos', () => {
  it('condiciones sobre métricas', () => {
    expect(holds({ metric: 'itemsPct', op: '<=', value: 51 }, { itemsPct: 51 })).toBe(true)
    expect(holds({ metric: 'years', op: '==', value: 10 }, { years: 9 })).toBe(false)
    expect(holds({ metric: 'nada', op: '>', value: 0 }, {})).toBe(false)
  })
  it('walkTexts recorre solo las frases (no ids, emojis ni condiciones) y en orden fijo', () => {
    const step = { title: 'Hola', lumi: [{ say: 'Bien', when: { metric: 'done', op: '==', value: 3 }, mood: 'HAPPY' }], widget: { kind: 'sort', cards: [{ emoji: '🏠', label: 'Alquiler', bin: 0, why: 'Fijo' }] } }
    const seen: string[] = []
    walkTexts(step, s => (seen.push(s), s))
    expect(seen).toEqual(['Hola', 'Bien', 'Alquiler', 'Fijo'])
    const up = walkTexts(step, s => s.toUpperCase())
    expect(up.widget.cards[0]).toEqual({ emoji: '🏠', label: 'ALQUILER', bin: 0, why: 'FIJO' })
    expect(up.lumi[0].when.metric).toBe('done')
  })
})

describe('preguntas de cifra con opciones', () => {
  it('4 opciones distintas, una es la buena, ninguna dentro del margen y siempre las mismas', async () => {
    const { numChoices } = await import('@/server/content/choices')
    for (const [id, sol, tol] of [['a', 2100, 0.01], ['b', 7612, 0.02], ['c', -1.2, 0.05], ['d', 3, 0.01], ['e', -0.02, 0.01], ['f', 17.5, 0.01]] as const) {
      const c = numChoices(id, sol, tol)
      expect(c).toHaveLength(4)
      expect(new Set(c).size).toBe(4)
      expect(c).toContain(sol)
      const band = Math.max(Math.abs(sol) * tol, 0.005)
      for (const x of c) if (x !== sol) expect(Math.abs(x - sol)).toBeGreaterThan(band)
      expect(numChoices(id, sol, tol)).toEqual(c)
    }
  })
})
