import { describe, expect, it } from 'vitest'
import { madridMidnight, score, tradePoints, weekReturnPct } from '@/shared/league-points'

describe('rentabilidad semanal', () => {
  it('sin cambios = 0', () => expect(weekReturnPct(10_000, 10_000, 0)).toBe(0))
  it('+2 %', () => expect(weekReturnPct(10_000, 10_200, 0)).toBe(2))
  it('−3 %', () => expect(weekReturnPct(10_000, 9_700, 0)).toBe(-3))
  it('el saldo extra de Max no es rentabilidad', () => expect(weekReturnPct(10_000, 50_000, 40_000)).toBe(0))
  it('saldo extra y además gana un 1 %', () => expect(weekReturnPct(10_000, 50_500, 40_000)).toBe(1))
  it('reiniciar no borra lo perdido', () => {
    // tenía 10.000, perdió 1.000 y reinició: vuelve a 10.000 con una entrada de 1.000
    expect(weekReturnPct(10_000, 10_000, 1_000)).toBeCloseTo(-9.09, 1)
  })
  it('un salto imposible no puntúa', () => expect(weekReturnPct(10_000, 30_000, 0)).toBe(0))
  it('sin base no hay rentabilidad', () => expect(weekReturnPct(0, 100, 0)).toBe(0))
})

describe('puntos de inversión', () => {
  it('10 por cada 1 %', () => expect(tradePoints(2.5, false)).toBe(25))
  it('las pérdidas restan', () => expect(tradePoints(-1.5, false)).toBe(-15))
  it('tope de ±100', () => {
    expect(tradePoints(30, false)).toBe(100)
    expect(tradePoints(-30, false)).toBe(-100)
  })
  it('concentrada: las ganancias valen la mitad, las pérdidas no', () => {
    expect(tradePoints(4, true)).toBe(20)
    expect(tradePoints(-4, true)).toBe(-40)
  })
  it('el total nunca baja de 0', () => {
    expect(score(30, -80)).toBe(0)
    expect(score(120, 25)).toBe(145)
  })
})

describe('fin de la semana de la liga (lunes 00:00 de Madrid)', () => {
  it('en invierno, 23:00 UTC del domingo', () => expect(madridMidnight('2026-11-09').toISOString()).toBe('2026-11-08T23:00:00.000Z'))
  it('en verano, 22:00 UTC del domingo', () => expect(madridMidnight('2026-06-15').toISOString()).toBe('2026-06-14T22:00:00.000Z'))
  it('semana del cambio de hora', () => expect(madridMidnight('2026-10-26').toISOString()).toBe('2026-10-25T23:00:00.000Z'))
})
