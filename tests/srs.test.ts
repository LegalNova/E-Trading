// Repaso espaciado: los aciertos aplazan el repaso 1, 3, 7 y 16 días y el último lo da por dominado
import { describe, expect, it } from 'vitest'
import { afterReview } from '@/server/game/srs'

const now = new Date('2026-10-28T10:00:00Z')
const days = (d: Date) => Math.round((d.getTime() - now.getTime()) / 86_400_000)

describe('repaso espaciado', () => {
  it('cada acierto lo aplaza más', () => {
    const out = [0, 1, 2, 3].map(box => afterReview(box, true, now))
    expect(out.map(o => (o.done ? 'hecho' : days(o.dueAt)))).toEqual([1, 3, 7, 16])
    expect(out.map(o => (o.done ? -1 : o.box))).toEqual([1, 2, 3, 4])
  })
  it('acertar en la última caja lo da por dominado', () => {
    expect(afterReview(4, true, now)).toEqual({ done: true })
  })
  it('fallar en el repaso lo devuelve al principio para mañana', () => {
    const r = afterReview(3, false, now)
    expect(r.done).toBe(false)
    if (!r.done) {
      expect(r.box).toBe(0)
      expect(days(r.dueAt)).toBe(1)
    }
  })
})
