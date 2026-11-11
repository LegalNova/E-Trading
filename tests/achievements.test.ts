// Insignias: el catálogo es coherente con el curso (cada insignia se puede conseguir y su texto dice lo que mide).
// Las condiciones se calculan en src/server/game/core.ts (achievementFacts); aquí, lo que se puede comprobar sin base de datos.
import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, QUIZZES, UNITS } from '@/server/content/catalog'

const byCode = Object.fromEntries(ACHIEVEMENTS.map(a => [a.code, a]))
const lessons = UNITS.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })))

/** Preguntas que salen en los quizzes de clase sin repetir ninguna (como quizStart: como mucho 1 de cifra por clase y
 *  ninguna en «Invierte desde hoy», salvo que el quiz se quedara con menos de 4) */
function reachable(type: string) {
  let n = 0
  for (const l of lessons) {
    const own = QUIZZES[l.quizId] ?? []
    const nums = own.filter(q => q.type === 'NUMBER')
    const keep = new Set(nums.slice(0, l.unit.section?.id === 's0' ? 0 : 1))
    const trimmed = own.filter(q => q.type !== 'NUMBER' || keep.has(q))
    n += (trimmed.length >= 4 ? trimmed : own).filter(q => q.type === type).length
  }
  return n
}

describe('catálogo de insignias', () => {
  it('43 insignias con código único, meta y recompensa', () => {
    expect(ACHIEVEMENTS).toHaveLength(43)
    expect(new Set(ACHIEVEMENTS.map(a => a.code)).size).toBe(ACHIEVEMENTS.length)
    for (const a of ACHIEVEMENTS) {
      expect(a.target, a.code).toBeGreaterThan(0)
      expect(a.gems, a.code).toBeGreaterThan(0)
      expect(a.xp, a.code).toBeGreaterThan(0)
    }
  })
  it('las de cantidad dicen en el texto la meta que miden', () => {
    for (const code of ['LESSONS_5', 'LESSONS_20', 'LESSONS_50', 'QUIZ_PERFECT_5', 'BOSS_5', 'UPDOWN_10', 'CALC_20', 'SCAM_5', 'SIM_5', 'CANDLE_10', 'REVIEW_10', 'TRADES_10', 'TRADES_50', 'DIVERSIFY_3', 'DIVERSIFY_5', 'CALM_RISK', 'STREAK_3', 'STREAK_7', 'STREAK_30', 'STREAK_100', 'GOALS_7'])
      expect(byCode[code].description, code).toContain(String(byCode[code].target))
  })
  it('las de unidad apuntan a una unidad que existe y la nombran bien', () => {
    // Las mismas unidades que mira achievementFacts (curso v2)
    const units: Record<string, string> = { UNIT_1: 'h1', UNIT_2: 'u20', UNIT_3: 'u24', HISTORY: 'u34', LAB: 'u35' }
    for (const [code, id] of Object.entries(units)) {
      const u = UNITS.find(x => x.id === id)
      expect(u, `${code} → ${id}`).toBeDefined()
      expect(byCode[code].description, code).toContain(`«${u!.title}»`)
    }
  })
  it('hay clases y retos finales de sobra para las de lecciones y retos', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(byCode.LESSONS_50.target)
    expect(lessons.filter(l => l.isBoss && l.id.endsWith('boss')).length).toBeGreaterThanOrEqual(byCode.BOSS_5.target)
  })
  it('las rachas van de menos a más', () => {
    const t = ['STREAK_3', 'STREAK_7', 'STREAK_30', 'STREAK_100'].map(c => byCode[c].target)
    expect(t).toEqual([...t].sort((a, b) => a - b))
  })
  it('los ejercicios de las insignias salen en el curso sin repetir clases', () => {
    expect(reachable('SPOT')).toBeGreaterThanOrEqual(byCode.SCAM_5.target)
    expect(reachable('SIM_TRADE')).toBeGreaterThanOrEqual(byCode.SIM_5.target)
    expect(reachable('CHART_CANDLE')).toBeGreaterThanOrEqual(byCode.CANDLE_10.target)
    expect(reachable('UP_DOWN')).toBeGreaterThanOrEqual(byCode.UPDOWN_10.target)
  })
  // «Calculadora humana» pide 10: el curso tiene 16 preguntas de cifra en los quizzes de clase
  it('las preguntas de cálculo alcanzan para «Calculadora humana» sin repetir', () => {
    expect(reachable('NUMBER')).toBeGreaterThanOrEqual(byCode.CALC_20.target)
  })
})
