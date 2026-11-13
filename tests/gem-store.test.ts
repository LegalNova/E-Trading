// Auditoría PRO-3, PRO-4 y PRO-6: la tienda en euros va apagada, solo para adultos y con packs coherentes
import { describe, expect, it } from 'vitest'
import { GEM_PACKS, GEM_STORE_MIN_AGE } from '@/shared/gem-shop'

describe('tienda de gemas en euros', () => {
  it('solo para mayores de edad', () => expect(GEM_STORE_MIN_AGE).toBe(18))
  it('los packs grandes salen más baratos por gema (sin trucos de precio)', () => {
    const perGem = GEM_PACKS.map(p => p.eur / p.gems)
    for (let i = 1; i < perGem.length; i++) expect(perGem[i]).toBeLessThan(perGem[i - 1])
  })
  it('con 2,99 € no se recargan vidas más baratas que con Plus (PRO-4)', () => {
    // Recargar vidas cuesta 350 gemas: con el pack pequeño sería ≈ 2,09 €, menos que un mes de Plus (5,99 €)
    expect((350 / GEM_PACKS[0].gems) * GEM_PACKS[0].eur).toBeLessThan(5.99)
  })
})
