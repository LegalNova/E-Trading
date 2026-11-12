// Comprobaciones de los gráficos de datos reales (src/server/content/charts.json), añadidas en la auditoría:
//   P0-5  las fechas de cada bolsa (un mes corrido en el IBEX y el Nikkei) → valores conocidos en su mes correcto
//   P0-6  «toca la vela»: la vela buscada no puede caer casi siempre en la misma posición
//   CON-24 velas sin rango (huecos de datos)
// Lo usan `npm run check:content` y los tests. Los errores paran la comprobación; los avisos solo se muestran.

type Ohlc = [number, number, number, number]
export interface ChartEntry {
  id: string; symbol?: string; from?: string; to?: string; cutDate?: string; cutLabel?: string
  candles?: Ohlc[]; future?: Ohlc[]; closes?: number[]; futureCloses?: number[]; dates?: string[]; target?: number
}

/** Cierres mensuales comprobados en la fuente (Yahoo Finance, 12-11-2026): si la serie se desplaza, dejan de coincidir */
export const KNOWN_CLOSES: { series: string; month: string; close: number; what: string }[] = [
  { series: 'series-japan', month: '1989-12', close: 38915.87, what: 'máximo del Nikkei 225, 29 de diciembre de 1989' },
  { series: 'series-japan', month: '1985-01', close: 11992.31, what: 'Nikkei 225, enero de 1985' },
  { series: 'series-ibex', month: '2006-12', close: 14146.5, what: 'IBEX 35, diciembre de 2006' },
  { series: 'series-ibex', month: '2025-12', close: 17307.8, what: 'IBEX 35, diciembre de 2025' },
  { series: 'series-sp500-monthly', month: '2025-12', close: 6845.5, what: 'S&P 500, diciembre de 2025' },
]

/** Mayor proporción de ejercicios «toca la vela» que pueden compartir la misma posición */
export const MAX_SAME_TARGET = 0.3
const CRYPTO = /-(EUR|USD)$/

const weekend = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split('/').map(Number)
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return wd === 0 || wd === 6
}

export function checkCharts(charts: Record<string, ChartEntry>): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const all = Object.values(charts)

  for (const k of KNOWN_CLOSES) {
    const f = charts[k.series]
    const i = f?.dates?.indexOf(k.month) ?? -1
    const v = i >= 0 ? f!.closes?.[i] : undefined
    if (v === undefined) errors.push(`${k.series}: falta ${k.month} (${k.what})`)
    else if (Math.abs(v / k.close - 1) > 0.001) errors.push(`${k.series}: ${k.month} vale ${v} y debería ser ${k.close} (${k.what}): ¿fechas desplazadas?`)
  }

  for (const f of all) {
    // Series mensuales: cada mes una sola vez (un mes repetido delata el fallo de zona horaria)
    if (f.dates && /^\d{4}-\d{2}$/.test(f.dates[0] ?? '')) {
      if (new Set(f.dates).size !== f.dates.length) errors.push(`${f.id}: hay meses repetidos en la serie`)
      const n = f.dates.map(d => Number(d.slice(0, 4)) * 12 + Number(d.slice(5)))
      const gaps = n.filter((x, i) => i > 0 && x - n[i - 1] !== 1).length
      if (gaps) warnings.push(`${f.id}: la serie se salta ${gaps} ${gaps === 1 ? 'mes' : 'meses'} (faltan en la fuente)`)
    }
    const flat = [...(f.candles ?? []), ...(f.future ?? [])].filter(c => c[1] === c[2]).length
    if (flat) errors.push(`${f.id}: ${flat} velas sin rango (hueco de datos)`)
    if (f.cutDate && !f.cutLabel) errors.push(`${f.id}: falta cutLabel (cómo se dice el corte del gráfico)`)
    // Las series mensuales guardan el día 1 de cada mes (no una sesión): ahí un sábado o un domingo no es un fallo de zona horaria
    const monthly = /^\d{4}-\d{2}$/.test(f.dates?.[0] ?? '')
    if (f.symbol && !CRYPTO.test(f.symbol) && !monthly) for (const k of ['from', 'to', 'cutDate'] as const) if (f[k] && /^\d{2}\/\d{2}\/\d{4}$/.test(f[k]!) && weekend(f[k]!)) errors.push(`${f.id}: ${k} cae en fin de semana (${f[k]}): ¿zona horaria?`)
  }

  const targets = all.filter(f => f.target !== undefined && f.candles)
  const byPos = new Map<number, number>()
  for (const f of targets) byPos.set(f.target!, (byPos.get(f.target!) ?? 0) + 1)
  for (const [pos, n] of byPos) if (targets.length >= 8 && n / targets.length > MAX_SAME_TARGET) errors.push(`«toca la vela»: ${n} de ${targets.length} gráficos tienen la vela buscada en la posición ${pos + 1} (máximo ${Math.round(MAX_SAME_TARGET * 100)} %)`)
  for (const f of targets) if (f.target! < 2 || f.target! > f.candles!.length - 2) warnings.push(`${f.id}: la vela buscada está en un extremo del gráfico`)

  return { errors, warnings }
}
