import { describe, expect, it } from 'vitest'
import { lastDayOf, madridMidnight, monthOf, monthReturnPct, monthStart, nextMonth, prevMonth, score, seasonPct, tradePoints, weekReturnPct } from '@/shared/league-points'

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

describe('temporada del mes', () => {
  it('rentabilidad del mes sin tope', () => expect(monthReturnPct(10_000, 11_500, 0)).toBe(15))
  it('el saldo extra de Max no es rentabilidad', () => expect(monthReturnPct(10_000, 50_000, 40_000)).toBe(0))
  it('reiniciar no borra lo perdido', () => expect(monthReturnPct(10_000, 10_000, 2_000)).toBeCloseTo(-16.67, 1))
  it('un salto imposible no cuenta', () => expect(monthReturnPct(10_000, 40_000, 0)).toBe(0))
  it('tope de ±10 %', () => {
    expect(seasonPct(15, false)).toBe(10)
    expect(seasonPct(-12.5, false)).toBe(-10)
  })
  it('concentrada: las ganancias valen la mitad, las pérdidas no', () => {
    expect(seasonPct(6, true)).toBe(3)
    expect(seasonPct(30, true)).toBe(10)
    expect(seasonPct(-4, true)).toBe(-4)
  })
  it('sin invertir: 0 %', () => expect(seasonPct(monthReturnPct(10_000, 10_000, 0), false)).toBe(0))
})

describe('meses de Madrid', () => {
  it('mes de un instante', () => {
    expect(monthOf(Date.parse('2026-10-31T22:30:00Z'))).toBe('2026-10') // 23:30 en Madrid
    expect(monthOf(Date.parse('2026-10-31T23:30:00Z'))).toBe('2026-11') // 00:30 del 1 de noviembre
  })
  it('mes anterior y siguiente', () => {
    expect(prevMonth('2027-01')).toBe('2026-12')
    expect(nextMonth('2026-12')).toBe('2027-01')
    expect(nextMonth('2026-01')).toBe('2026-02')
  })
  it('último día', () => {
    expect(lastDayOf('2026-10')).toBe('2026-10-31')
    expect(lastDayOf('2028-02')).toBe('2028-02-29')
  })
  it('empieza a las 00:00 de Madrid', () => expect(monthStart('2026-11').toISOString()).toBe('2026-10-31T23:00:00.000Z'))
})
