import { describe, expect, it } from 'vitest'
import { sessionOn } from '@/shared/session-times'

// Horas de apertura y cierre que enseña «Bolsas abiertas ahora» (en UTC, para que el test no dependa del ordenador)
describe('sessionOn', () => {
  it('Nueva York en invierno: 9:30–16:00 son 14:30–21:00 UTC', () => {
    const s = sessionOn('US', new Date('2026-11-09T15:00:00Z'))!
    expect(s.open.toISOString()).toBe('2026-11-09T14:30:00.000Z')
    expect(s.close.toISOString()).toBe('2026-11-09T21:00:00.000Z')
  })
  it('Nueva York en verano: una hora antes', () => {
    const s = sessionOn('US', new Date('2026-07-01T15:00:00Z'))!
    expect(s.open.toISOString()).toBe('2026-07-01T13:30:00.000Z')
  })
  it('Madrid: 9:00–17:30 hora local', () => {
    const s = sessionOn('BME', new Date('2026-11-09T10:00:00Z'))!
    expect(s.open.toISOString()).toBe('2026-11-09T08:00:00.000Z')
    expect(s.close.toISOString()).toBe('2026-11-09T16:30:00.000Z')
  })
  it('Tokio: la pausa de mediodía no corta el día (9:00–15:30)', () => {
    const s = sessionOn('TSE', new Date('2026-11-09T01:00:00Z'))!
    expect(s.open.toISOString()).toBe('2026-11-09T00:00:00.000Z')
    expect(s.close.toISOString()).toBe('2026-11-09T06:30:00.000Z')
  })
  it('sin horario: null', () => expect(sessionOn('NOPE', new Date())).toBeNull())
})
