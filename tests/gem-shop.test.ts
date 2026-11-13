// Auditoría PRO-1 a PRO-7: la tienda de gemas solo cambia gemas ganadas y no compite con Plus
import { describe, expect, it } from 'vitest'
import { CASH_PACK, CASH_PACKS_PER_MONTH, GEM_PRICES, GEM_SKINS, HINT_TYPES } from '@/shared/gem-shop'
import { SKINS } from '@/client/ui/lumi'

describe('tienda de gemas', () => {
  it('precios positivos y enteros', () => {
    for (const v of [...Object.values(GEM_PRICES), ...GEM_SKINS.map(s => s.price)]) {
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThan(0)
    }
  })
  it('los colores de la tienda no repiten nombre con los de siempre', () => {
    const ids = [...SKINS.map(s => s.id), ...GEM_SKINS.map(s => s.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('el dinero virtual tiene tope mensual', () => {
    expect(CASH_PACK).toBe(5000)
    expect(CASH_PACKS_PER_MONTH).toBeLessThanOrEqual(2)
  })
  it('la pista solo existe en preguntas de una respuesta', () => {
    expect([...HINT_TYPES].sort()).toEqual(['CHAT', 'SCENARIO', 'SINGLE'])
  })
})
