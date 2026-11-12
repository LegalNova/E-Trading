// Auditoría P0-1, P0-2 y P0-3: los textos legales y la ayuda no pueden decir un precio distinto del que se cobra,
// ni negar el uso de IA de terceros, ni permitir cobros reales sin titular identificado.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { HELP } from '@/help'
import { LEGAL } from '@/legal'
import { chargeBlockedBy, OWNER, ownerMissing, ownerReady } from '@/legal/owner'
import { allowedAmounts, planPrice } from '@/legal/prices'
import { GIFT_PRICE } from '@/shared/gifts'
import { PRICES } from '@/shared/plans'

const LANGS = ['es', 'ca', 'en'] as const
const SRC = path.resolve(__dirname, '../src')

/** Todo el texto de un objeto (títulos, párrafos, listas y tablas) en una sola cadena */
const textOf = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(textOf).join('\n') : v && typeof v === 'object' ? Object.values(v).map(textOf).join('\n') : '')

/** Importes con céntimos junto al símbolo del euro: «5,99 €» (es, ca) o «€5.99» (en). «50.000 €» y «€50,000» no lo son */
function euroAmounts(text: string): number[] {
  const out: number[] = []
  for (const m of text.matchAll(/(?<![\d.,])(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})(?!\d)\s?€|€\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})(?!\d)/g)) {
    const raw = m[1] ?? m[2]
    out.push(Number(raw.replace(/[.,](?=\d{3})/g, '').replace(',', '.')))
  }
  return out
}

describe('precios en los textos legales y la ayuda', () => {
  const allowed = new Set(allowedAmounts().map(n => n.toFixed(2)))

  it.each(LANGS)('%s: todos los importes con céntimos salen de las tablas de cobro', l => {
    const found = euroAmounts(textOf(LEGAL[l]) + '\n' + textOf(HELP[l]))
    expect(found.length).toBeGreaterThan(20)
    const wrong = found.filter(n => !allowed.has(n.toFixed(2)))
    expect(wrong).toEqual([])
  })

  it.each(LANGS)('%s: las Condiciones publican el precio normal, el de estudiante y el de los regalos', l => {
    const t = textOf(LEGAL[l].contratacion)
    for (const tier of ['PLUS', 'PREMIUM'] as const)
      for (const iv of ['MONTH', 'YEAR'] as const) {
        expect(t).toContain(planPrice(tier, iv, l))
        expect(t).toContain(planPrice(tier, iv, l, true))
      }
    const gifts = new Set(euroAmounts(t).map(n => n.toFixed(2)))
    for (const tier of Object.values(GIFT_PRICE)) for (const n of Object.values(tier)) expect(gifts.has(n.toFixed(2))).toBe(true)
  })

  it.each(LANGS)('%s: la ayuda da el precio normal de Plus y de Max', l => {
    const item = HELP[l].categories.flatMap(c => c.items).find(i => i.id === 'diferencias')!
    const t = textOf(item.a)
    expect(t).toContain(planPrice('PLUS', 'MONTH', l))
    expect(t).toContain(planPrice('PREMIUM', 'MONTH', l))
    expect(euroAmounts(t)).toContain(PRICES.normal.PREMIUM.YEAR)
  })

  it('ningún precio está escrito a mano en src/legal ni en src/help', () => {
    for (const dir of ['legal', 'help'])
      for (const l of LANGS) {
        const file = readFileSync(path.join(SRC, dir, `${l}.ts`), 'utf8')
        expect(euroAmounts(file), `${dir}/${l}.ts`).toEqual([])
      }
  })
})

describe('Lumi e inteligencia artificial (una sola versión)', () => {
  const DENIALS = [/no se env[ií]an a ning[uú]n servicio de inteligencia artificial/i, /no s’envien a cap servei d’intel·ligència artificial/i, /not sent to any third-party AI/i]
  it.each(LANGS)('%s: ni la privacidad ni la ayuda niegan el uso de IA de terceros, y las dos nombran al proveedor', l => {
    const privacy = textOf(LEGAL[l].privacidad)
    const help = textOf(HELP[l])
    for (const re of DENIALS) {
      expect(privacy).not.toMatch(re)
      expect(help).not.toMatch(re)
    }
    expect(privacy.match(/Anthropic/g)?.length).toBeGreaterThanOrEqual(2)
    expect(help).toContain('Anthropic')
  })
})

describe('titular legal', () => {
  it('los cobros reales se bloquean mientras falte el NIF o el domicilio; el modo de prueba no', () => {
    const pending = { ...OWNER, nif: '[pendiente de completar]', address: '' }
    expect(ownerMissing(pending)).toEqual(['nif', 'address'])
    expect(ownerReady(pending)).toBe(false)
    expect(chargeBlockedBy(false, pending)).toEqual(['nif', 'address'])
    expect(chargeBlockedBy(true, pending)).toEqual([])
    const done = { ...OWNER, nif: '12345678Z', address: 'Calle Mayor 1, 08001 Barcelona' }
    expect(ownerReady(done)).toBe(true)
    expect(chargeBlockedBy(false, done)).toEqual([])
  })

  it.each(LANGS)('%s: las secciones de las Condiciones están numeradas seguidas', l => {
    const nums = LEGAL[l].contratacion.sections.map(s => Number(s.h.split('.')[0]))
    expect(nums).toEqual(nums.map((_, i) => i + 1))
  })
})
