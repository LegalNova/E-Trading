import { describe, expect, it } from 'vitest'
import { closure, needsOf, ordered, presetUnits, ROUTE_IDS, ROUTE_SECTIONS, suggestedRoute, suggestedSections, withoutUnit, withUnit, type RouteUnit } from '@/shared/route'
import { UNITS } from '@/server/content/catalog'

// El curso real: las rutas tienen que valer para él, no para un ejemplo inventado
const graph: RouteUnit[] = UNITS.filter(u => !u.side).map(u => ({ id: u.id, section: u.section?.id ?? null, requires: u.section?.requires ?? [] }))
const lessonsOf = (ids: string[]) => UNITS.filter(u => ids.includes(u.id)).flatMap(u => u.lessons).filter(l => !l.isUnitReview && !l.isBoss).length

describe('las dos rutas de partida', () => {
  it('usan secciones que existen y empiezan por la de inicio', () => {
    const sections = new Set(graph.map(u => u.section))
    for (const id of ROUTE_IDS) {
      expect(ROUTE_SECTIONS[id][0]).toBe('s0')
      for (const s of ROUTE_SECTIONS[id]) expect(sections.has(s)).toBe(true)
    }
  })
  it('cada una es bastante más corta que el curso entero', () => {
    const all = lessonsOf(graph.map(u => u.id))
    for (const id of ROUTE_IDS) {
      const n = lessonsOf(presetUnits(graph, id))
      expect(n).toBeGreaterThan(60)
      expect(n).toBeLessThan(all * 0.6)
    }
  })
  it('no dejan fuera nada de lo que hace falta para recorrerlas', () => {
    for (const id of ROUTE_IDS) {
      const units = presetUnits(graph, id)
      for (const u of units) for (const n of needsOf(graph, u)) expect(units).toContain(n)
    }
  })
  it('se recorren en el orden previsto y nunca ponen una sección antes de las que necesita', () => {
    for (const id of ROUTE_IDS) {
      const order = ordered(graph, presetUnits(graph, id), id)
      const sections = order.map(u => graph.find(x => x.id === u)!.section).filter((s, i, a) => a.indexOf(s) === i)
      expect(sections).toEqual([...ROUTE_SECTIONS[id]])
      order.forEach((u, i) => { for (const n of needsOf(graph, u)) expect(order.indexOf(n)).toBeLessThan(i) })
    }
  })
  it('la de largo plazo pasa por «Tu dinero en orden» nada más terminar el inicio', () => {
    const order = ordered(graph, presetUnits(graph, 'LONG'), 'LONG')
    expect(order.slice(0, 4)).toEqual(['h1', 'h2', 'h3', 'u1'])
  })
})

describe('ajustar la ruta', () => {
  const long = presetUnits(graph, 'LONG')
  it('la de largo plazo no trae las velas japonesas', () => expect(long).not.toContain('u20'))
  it('añadir «Velas japonesas» añade también «Leer un gráfico», que va antes, y nada más', () => {
    const r = withUnit(graph, long, 'u20')
    expect(r.units).toContain('u20')
    expect(r.added).toEqual(['u19'])
    expect(r.units).toHaveLength(long.length + 2)
  })
  it('las unidades añadidas se recorren después de la ruta de partida', () => {
    const order = ordered(graph, withUnit(graph, long, 'u20').units, 'LONG')
    expect(order.slice(-2)).toEqual(['u19', 'u20'])
  })
  it('añadir una unidad que ya estaba no cambia nada', () => expect(withUnit(graph, long, 'u8')).toEqual({ units: long, added: [] }))
  it('quitar una unidad quita también las que la necesitaban', () => {
    const r = withoutUnit(graph, long, 'u9')
    // «Bonos» está en mitad de «Productos»: sin ella no se llega al reto de esa sección ni a lo que abre
    expect(r.units).not.toContain('u9')
    expect(r.removed).toEqual(expect.arrayContaining(['u10', 'u11', 'u29', 'u30', 'u31']))
    expect(r.units).toContain('u8')
    for (const u of r.units) for (const n of needsOf(graph, u)) expect(r.units).toContain(n)
  })
  it('quitar la última unidad de una sección que nadie necesita solo quita esa', () => {
    const r = withoutUnit(graph, long, 'u33')
    expect(r.removed).toEqual([])
    expect(r.units).toHaveLength(long.length - 1)
  })
  it('desde una lista vacía, una sola unidad trae su camino completo', () => {
    expect(closure(graph, ['u20'])).toEqual(['h1', 'h2', 'h3', 'u5', 'u6', 'u7', 'u19', 'u20'])
  })
  it('ignora unidades que no existen y la unidad paralela de vocabulario', () => expect(closure(graph, ['nope', 'vocab'])).toEqual([]))
})

describe('la recomendación de Lumi', () => {
  it('largo plazo, finanzas o ahorro → ruta de largo plazo (en los tres idiomas)', () => {
    expect(suggestedRoute(['Invertir a largo plazo'])).toBe('LONG')
    expect(suggestedRoute(['Estalviar millor'])).toBe('LONG')
    expect(suggestedRoute(['Understand my finances', 'Technical analysis'])).toBe('LONG')
  })
  it('solo análisis técnico → ruta de trading', () => {
    expect(suggestedRoute(['Análisis técnico'])).toBe('TRADING')
    expect(suggestedRoute(['Anàlisi tècnica', 'Per curiositat'])).toBe('TRADING')
  })
  it('si no está claro, no recomienda ninguna', () => {
    expect(suggestedRoute([])).toBeNull()
    expect(suggestedRoute(['Por curiosidad', 'Practicar sin arriesgar dinero'])).toBeNull()
  })
  it('señala las secciones que encajan con lo que busca', () => {
    expect(suggestedSections(['Cripto', 'Análisis técnico'])).toEqual(['s4', 's7'])
    expect(suggestedSections(['Just curious'])).toEqual([])
  })
})
