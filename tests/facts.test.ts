// Auditoría CON-10: los datos con fecha llevan valor, fecha, fuente y clases que los citan
import { describe, expect, it } from 'vitest'
import { esNum, FACTS, staleFacts, type Fact } from '@/server/content/facts'
import { LESSON } from '@/server/content/catalog'

const facts = Object.entries(FACTS) as [string, Fact][]

describe('hechos con fecha', () => {
  it.each(facts)('%s tiene fecha válida, fuente y clases que existen', (_, f) => {
    expect(Number.isNaN(Date.parse(f.asOf))).toBe(false)
    expect(Number.isNaN(Date.parse(f.checked))).toBe(false)
    expect(f.source.length).toBeGreaterThan(20)
    expect(f.usedIn.length).toBeGreaterThan(0)
    for (const id of f.usedIn) expect(LESSON[id], id).toBeDefined()
  })

  it('avisa de los que llevan más de 12 meses sin comprobar', () => {
    expect(staleFacts(Date.parse('2026-11-13'))).toEqual([])
    const late = staleFacts(Date.parse('2027-12-15'))
    expect(late.length).toBe(facts.length)
    expect(late[0]).toMatch(/se comprobó por última vez el 2026-11-12/)
  })

  it('el tipo del BCE se escribe como en la clase', () => {
    expect(esNum(FACTS.ecbDepositRate.value)).toBe('2,50')
    expect(LESSON.u18l3.steps.some(s => 'body' in s && s.body.includes('2,50'))).toBe(true)
  })
})
