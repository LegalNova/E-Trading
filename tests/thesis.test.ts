// Proyecto final: comprobaciones de cada paso y puntuación de la tesis (criterios fijos)
import { describe, expect, it } from 'vitest'
import { checkStep, currentStep, firstName, riskAtStop, scoreThesis, type ThesisAnswersT } from '@/shared/thesis'

const full: ThesisAnswersT = {
  business: 'Vende iPhone, Mac y servicios a cientos de millones de personas; gana sobre todo con el iPhone y cada vez más con suscripciones.',
  moatType: 'BRAND',
  moat: 'La marca y el ecosistema hacen que cambiar a otro móvil cueste: fotos, apps y relojes están conectados entre sí.',
  risks: ['Depende mucho de las ventas del iPhone', 'Regulación de la App Store en Europa', 'Fabrica casi todo en China'],
  valuation: 'EXPENSIVE',
  valuationWhy: 'Su PER de 30 está por encima del 22 de su sector: el mercado ya descuenta que el beneficio seguirá creciendo.',
  weightPct: 5,
  weightWhy: 'Es una sola empresa: no quiero que un mal año me hunda toda la cartera.',
  stop: 160,
  target: 240,
  priceAt: 180,
  horizon: 'Y5',
  invalidation: 'Si las ventas de servicios caen dos años seguidos o pierde la batalla regulatoria de la App Store.',
}

describe('comprobaciones de los pasos', () => {
  it('riesgos: al menos 2 y distintos', () => {
    expect(checkStep(3, { risks: [] }, null)).toBe('RISKS_MIN')
    expect(checkStep(3, { risks: ['Mucha deuda', ''] }, null)).toBe('RISKS_MIN')
    expect(checkStep(3, { risks: ['Mucha deuda', 'mucha  DEUDA'] }, null)).toBe('RISKS_SAME')
    expect(checkStep(3, { risks: ['Mucha deuda', 'Competencia china'] }, null)).toBeNull()
  })
  it('peso: no más del 20 %', () => {
    expect(checkStep(5, { weightPct: 25, weightWhy: 'porque sí, mucho' }, null)).toBe('WEIGHT_MAX')
    expect(checkStep(5, { weightPct: 0, weightWhy: 'porque sí, mucho' }, null)).toBe('WEIGHT_MIN')
    expect(checkStep(5, { weightPct: 20, weightWhy: 'porque sí, mucho' }, null)).toBeNull()
  })
  it('stop por debajo del precio y objetivo por encima', () => {
    expect(checkStep(6, { stop: 190, target: 240 }, 180)).toBe('STOP_ABOVE')
    expect(checkStep(6, { stop: 160, target: 170 }, 180)).toBe('TARGET_BELOW')
    expect(checkStep(6, { stop: 160, target: 240 }, null)).toBe('NO_PRICE')
    expect(checkStep(6, { stop: 160, target: 240 }, 180)).toBeNull()
  })
  it('textos con un mínimo razonable', () => {
    expect(checkStep(1, { business: 'Vende cosas' }, null)).toBe('SHORT')
    expect(checkStep(2, { moat: 'Tiene una marca muy fuerte' }, null)).toBe('CHOOSE')
    expect(checkStep(8, { invalidation: 'Si cae' }, null)).toBe('SHORT')
  })
  it('paso actual: el primero sin contestar', () => {
    expect(currentStep({})).toBe(1)
    expect(currentStep({ ...full, horizon: undefined })).toBe(7)
    expect(currentStep(full)).toBe(9)
  })
})

describe('puntuación de 0 a 100', () => {
  it('una tesis completa y coherente saca 100', () => {
    const s = scoreThesis(full, { pe: 30, sectorPe: 22 })
    expect(s.total).toBe(100)
    expect(s.parts.reduce((t, p) => t + p.max, 0)).toBe(100)
  })
  it('la regla del 1 %: con 5 % de peso y stop a −11 %, se arriesga el 0,56 %', () => {
    expect(riskAtStop(5, 180, 160)).toBeCloseTo(0.556, 3)
  })
  it('concentrar mucho y un stop lejano bajan la gestión del riesgo', () => {
    const s = scoreThesis({ ...full, weightPct: 20, stop: 100 }, { pe: 30, sectorPe: 22 })
    expect(s.parts.find(p => p.key === 'risk')!.points).toBe(5)
    expect(s.total).toBeLessThan(100)
  })
  it('una conclusión que contradice los datos puntúa menos en valoración', () => {
    const s = scoreThesis({ ...full, valuation: 'CHEAP' }, { pe: 30, sectorPe: 22 })
    expect(s.parts.find(p => p.key === 'valuation')!.points).toBe(10)
  })
  it('sin PER para comparar no se penaliza si se razona', () => {
    const s = scoreThesis(full, { pe: null, sectorPe: null })
    expect(s.parts.find(p => p.key === 'valuation')!.points).toBe(15)
  })
  it('una tesis vacía saca 0', () => {
    expect(scoreThesis({}, { pe: null, sectorPe: null }).total).toBe(0)
  })
})

describe('certificado', () => {
  it('solo el nombre de pila', () => {
    expect(firstName('María José García')).toBe('María')
    expect(firstName('  joan  vidal ')).toBe('joan')
    expect(firstName('x')).toBeNull()
    expect(firstName('<script>')).toBe('script')
    expect(firstName(null)).toBeNull()
  })
})
