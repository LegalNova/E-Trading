// Auditoría APP-38 (decisión de Joan): la liga puntúa aprender y los buenos hábitos, no la rentabilidad
import { describe, expect, it } from 'vitest'
import { HABIT_MAX, habitPoints, score } from '@/shared/league-points'

describe('puntos de buenos hábitos de la liga', () => {
  it('sin hábitos, cero (y nunca negativo)', () => {
    expect(habitPoints({ journal: 0, stops: 0, diversified: false })).toBe(0)
    expect(habitPoints({ journal: -2, stops: -1, diversified: false })).toBe(0)
  })
  it('10 por cada motivo apuntado y 10 por cada stop', () => {
    expect(habitPoints({ journal: 1, stops: 0, diversified: false })).toBe(10)
    expect(habitPoints({ journal: 2, stops: 1, diversified: false })).toBe(30)
  })
  it('operar más no da más: cada hábito cuenta hasta 3 veces por semana', () => {
    expect(habitPoints({ journal: 3, stops: 3, diversified: false })).toBe(60)
    expect(habitPoints({ journal: 40, stops: 40, diversified: false })).toBe(60)
  })
  it('20 por tener la cartera repartida', () => {
    expect(habitPoints({ journal: 0, stops: 0, diversified: true })).toBe(20)
  })
  it('el máximo de la semana es 80: menos que una clase', () => {
    expect(habitPoints({ journal: 9, stops: 9, diversified: true })).toBe(HABIT_MAX)
    expect(HABIT_MAX).toBe(80)
  })
  it('los puntos de la semana son XP + hábitos', () => {
    expect(score(250, habitPoints({ journal: 1, stops: 1, diversified: true }))).toBe(290)
  })
})
