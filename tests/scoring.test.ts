// Auditoría P0-7 y EXA-7: la ronda de humildad no puntúa ni entra en repasos y retos
import { describe, expect, it } from 'vitest'
import { QUIZZES, UNITS, PLACEMENT } from '@/server/content/catalog'
import { examFairness } from '@/server/content/validate'
import { isScored, tally } from '@/shared/scoring'

const lessons = UNITS.flatMap(u => u.lessons)
const own = lessons.filter(l => !l.isUnitReview && !l.isBoss).flatMap(l => QUIZZES[l.quizId] ?? [])
const blind = own.filter(q => !isScored(q))

describe('ronda de humildad («¿sube o baja?» sobre un gráfico anónimo)', () => {
  it('existe, y solo son ejercicios «¿sube o baja?» con velas ocultas', () => {
    expect(blind.length).toBeGreaterThan(30)
    for (const q of blind) {
      expect(q.type).toBe('UP_DOWN')
      expect(q.hidden?.candles?.length).toBeGreaterThan(0)
    }
  })

  it('los «¿sube o baja?» con contexto histórico sí puntúan', () => {
    const historic = own.filter(q => q.type === 'UP_DOWN' && isScored(q))
    expect(historic.length).toBeGreaterThan(10)
    for (const q of historic) expect(q.hidden?.closes?.length).toBeGreaterThan(0)
  })

  it('no entra en ningún repaso de unidad, reto final ni en el test de nivel', () => {
    const pooled = lessons.filter(l => l.isUnitReview || l.isBoss).flatMap(l => QUIZZES[l.quizId] ?? [])
    expect(pooled.length).toBeGreaterThan(200)
    expect(pooled.filter(q => !isScored(q)).map(q => q.id)).toEqual([])
    expect(PLACEMENT.filter(q => !isScored(q))).toEqual([])
    expect(examFairness(UNITS, QUIZZES, PLACEMENT).errors).toEqual([])
  })

  it('los retos finales siguen teniendo sus 12 preguntas', () => {
    for (const l of lessons.filter(x => x.isBoss)) expect(QUIZZES[l.quizId].length, l.id).toBe(12)
  })

  it('el validador avisa si una se cuela en un reto', () => {
    const boss = lessons.find(l => l.isBoss)!
    const hacked = { ...QUIZZES, [boss.quizId]: [...QUIZZES[boss.quizId].slice(1), blind[0]] }
    expect(examFairness(UNITS, hacked).errors.join('\n')).toMatch(/ronda de humildad/)
  })
})

describe('nota del quiz sin la ronda de humildad', () => {
  const scored = (id: string) => !id.startsWith('blind')
  it('ni suma al total ni a los aciertos', () => {
    const ids = ['a', 'b', 'blind1', 'c', 'blind2']
    const answers = [{ questionId: 'a', correct: true }, { questionId: 'b', correct: false }, { questionId: 'blind1', correct: true }, { questionId: 'c', correct: true }, { questionId: 'blind2', correct: false }]
    expect(tally(ids, answers, scored)).toEqual({ total: 3, correct: 2 })
  })
  it('fallar todas las de humildad no impide el pleno', () => {
    const ids = ['a', 'blind1', 'blind2']
    const answers = [{ questionId: 'a', correct: true }, { questionId: 'blind1', correct: false }, { questionId: 'blind2', correct: false }]
    expect(tally(ids, answers, scored)).toEqual({ total: 1, correct: 1 })
  })
  it('respeta el filtro de «preguntas propias de la clase»', () => {
    const ids = ['a', 'b', 'repaso', 'blind1']
    const answers = ids.map(questionId => ({ questionId, correct: true }))
    expect(tally(ids, answers, scored, id => id !== 'repaso')).toEqual({ total: 2, correct: 2 })
  })
})
