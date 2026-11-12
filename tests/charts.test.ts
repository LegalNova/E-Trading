// Auditoría, ronda 2: fechas de las series (P0-5), posición de la vela (P0-6), velas planas (CON-24) y fechas legibles (APP-13)
import { describe, expect, it } from 'vitest'
import CHARTS from '@/server/content/charts.json'
import { checkCharts, type ChartEntry } from '@/server/content/charts-check'
import { seriesDate } from '@/shared/format'

const charts = CHARTS as unknown as Record<string, ChartEntry>

describe('gráficos de datos reales', () => {
  it('pasan las comprobaciones (valores conocidos en su mes, sin velas planas, vela buscada repartida)', () => {
    expect(checkCharts(charts).errors).toEqual([])
  })

  it('el máximo del Nikkei está en diciembre de 1989, no en noviembre', () => {
    const f = charts['series-japan']
    const until2020 = f.dates!.findIndex(d => d === '2020-01')
    const peak = f.closes!.slice(0, until2020).reduce((best, v, i, a) => (v > a[best] ? i : best), 0)
    expect(f.dates![peak]).toBe('1989-12')
    expect(charts['hist-japan-1989'].cutLabel).toBe('diciembre de 1989')
    expect(charts['hist-japan-1989'].closes!.at(-1)).toBeCloseTo(38915.87, 1)
  })

  it('detecta una serie desplazada un mes, un mes repetido, una vela plana y la vela siempre en el mismo sitio', () => {
    const shifted = { ...charts, 'series-japan': { ...charts['series-japan'], dates: charts['series-japan'].dates!.map((_, i, a) => a[Math.max(0, i - 1)]) } }
    expect(checkCharts(shifted).errors.join('\n')).toMatch(/series-japan: 1989-12 vale/)
    expect(checkCharts(shifted).errors.join('\n')).toMatch(/meses repetidos/)
    const flat = { ...charts, 'ud-1': { ...charts['ud-1'], candles: [[10, 10, 10, 10] as [number, number, number, number], ...charts['ud-1'].candles!.slice(1)] } }
    expect(checkCharts(flat).errors.join('\n')).toMatch(/ud-1: 1 velas sin rango/)
    const fixed = Object.fromEntries(Object.entries(charts).map(([k, f]) => [k, f.target !== undefined ? { ...f, target: 6 } : f]))
    expect(checkCharts(fixed).errors.join('\n')).toMatch(/toca la vela/)
  })
})

describe('fechas de las series, como se leen', () => {
  it('mes y año', () => {
    expect(seriesDate('1985-01', 'es')).toEqual({ text: 'enero de 1985', monthly: true })
    expect(seriesDate('2025-12', 'en')).toEqual({ text: 'December 2025', monthly: true })
    expect(seriesDate('1989-12', 'ca').text).toMatch(/desembre.*1989/)
  })
  it('día, mes y año', () => {
    expect(seriesDate('28/12/1998', 'es')).toEqual({ text: '28 dic 1998', monthly: false })
    expect(seriesDate('28/12/1998', 'en').text).toBe('28 Dec 1998')
  })
  it('lo que no reconoce lo deja igual', () => {
    expect(seriesDate('hoy', 'es').text).toBe('hoy')
  })
})
