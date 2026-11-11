// Día de la racha y semana de la liga: el día cuenta en la zona horaria de la persona (Europe/Madrid por defecto),
// con el horario de verano e invierno, y la semana de la liga empieza el lunes a las 00:00 de Madrid
import { describe, expect, it } from 'vitest'
import { addDays, dayOf, weekOf } from '@/shared/time'

const at = (iso: string) => Date.parse(iso)

describe('día de la racha (hora de Madrid)', () => {
  it('en invierno el día cambia a las 23:00 UTC', () => {
    expect(dayOf(at('2026-11-11T22:59:59Z'))).toBe('2026-11-11')
    expect(dayOf(at('2026-11-11T23:00:00Z'))).toBe('2026-11-12')
  })
  it('en verano el día cambia a las 22:00 UTC', () => {
    expect(dayOf(at('2026-07-01T21:59:59Z'))).toBe('2026-07-01')
    expect(dayOf(at('2026-07-01T22:00:00Z'))).toBe('2026-07-02')
  })
  it('el día del cambio de hora de octubre (25 h) sigue siendo un solo día', () => {
    expect(dayOf(at('2026-10-24T22:00:00Z'))).toBe('2026-10-25') // 00:00 en verano
    expect(dayOf(at('2026-10-25T22:59:59Z'))).toBe('2026-10-25') // 23:59 en invierno
    expect(dayOf(at('2026-10-25T23:00:00Z'))).toBe('2026-10-26')
  })
  it('el día del cambio de hora de marzo (23 h) sigue siendo un solo día', () => {
    expect(dayOf(at('2026-03-28T23:00:00Z'))).toBe('2026-03-29') // 00:00 en invierno
    expect(dayOf(at('2026-03-29T21:59:59Z'))).toBe('2026-03-29') // 23:59 en verano
    expect(dayOf(at('2026-03-29T22:00:00Z'))).toBe('2026-03-30')
  })
  it('otra zona horaria', () => {
    expect(dayOf(at('2026-11-12T03:00:00Z'), 'America/New_York')).toBe('2026-11-11')
    expect(dayOf(at('2026-11-12T03:00:00Z'))).toBe('2026-11-12')
  })
})

describe('días seguidos (addDays)', () => {
  it('ayer y mañana, también al cruzar meses, años y el 29 de febrero', () => {
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
  })
  it('los cambios de hora no se saltan ni repiten ningún día', () => {
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
    expect(addDays('2026-10-26', -1)).toBe('2026-10-25')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
    expect(addDays('2026-03-30', -1)).toBe('2026-03-29')
  })
  it('las fechas se comparan como texto (así se cuentan los días saltados)', () => {
    const missed: string[] = []
    for (let d = addDays('2026-10-24', 1); d < '2026-10-28'; d = addDays(d, 1)) missed.push(d)
    expect(missed).toEqual(['2026-10-25', '2026-10-26', '2026-10-27'])
  })
})

describe('semana de la liga', () => {
  it('empieza el lunes a las 00:00 de Madrid', () => {
    expect(weekOf(at('2026-11-08T22:59:59Z'))).toBe('2026-11-02') // domingo 23:59
    expect(weekOf(at('2026-11-08T23:00:00Z'))).toBe('2026-11-09') // lunes 00:00
  })
  it('un domingo sigue en la semana del lunes anterior', () => expect(weekOf(at('2026-11-15T12:00:00Z'))).toBe('2026-11-09'))
  it('la semana del cambio de hora', () => {
    expect(weekOf(at('2026-10-25T22:59:59Z'))).toBe('2026-10-19')
    expect(weekOf(at('2026-10-25T23:00:00Z'))).toBe('2026-10-26')
  })
})
