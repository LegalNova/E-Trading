// Corrección de cualquier tipo de ejercicio y lo que se revela al responder. Puro (sin base de datos) para poder probarlo.
import type { AnswerResultT } from '@/shared/contract'
import type { ContentQuestion } from './dsl'

type Reveal = NonNullable<AnswerResultT['reveal']>
export interface Graded {
  correct: boolean
  explanation: string
  reveal?: Reveal
}

const TIMEOUT = '__timeout__'
const pct = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`
const eur = (v: number) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('es-ES', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} €`
const isNums = (a: unknown, n?: number): a is number[] => Array.isArray(a) && a.every(x => typeof x === 'number' && Number.isFinite(x)) && (n === undefined || a.length === n)

/** Lo que pasó después en un gráfico real: activo, fechas y variación */
function history(q: ContentQuestion): Reveal | undefined {
  const h = q.hidden
  if (!h) return undefined
  const last = q.candles?.length ? q.candles[q.candles.length - 1][3] : q.chart?.[q.chart.length - 1]
  const end = h.candles?.length ? h.candles[h.candles.length - 1][3] : h.closes?.[h.closes.length - 1]
  const ch = h.changePct ?? (last && end ? (end / last - 1) * 100 : undefined)
  const low = h.minPct !== undefined && h.minPct < -5 ? ` Llegó a caer un ${pct(h.minPct).replace('−', '')} por el camino.` : ''
  return { candles: h.candles, closes: h.closes, caption: h.caption, outcome: ch !== undefined ? `${h.caption}. Variación después: ${pct(ch)}.${low}` : h.caption }
}

/** Recorre las velas siguientes: ¿toca antes el stop o el objetivo? */
function replay(future: [number, number, number, number][], stop?: number, take?: number) {
  for (const [, high, low] of future) {
    if (stop !== undefined && low <= stop) return { exit: stop, hit: 'STOP' as const }
    if (take !== undefined && high >= take) return { exit: take, hit: 'TAKE' as const }
  }
  return { exit: future.length ? future[future.length - 1][3] : undefined, hit: null }
}

export function grade(q: ContentQuestion, a: unknown): Graded {
  const base = q.explanation
  if (a === TIMEOUT) return { correct: false, explanation: `Se acabó el tiempo. ${base}`, reveal: history(q) }
  switch (q.type) {
    case 'CHART_POINT':
      return { correct: typeof a === 'number' && Math.abs(a - (q.solution as number)) <= 1, explanation: base }
    case 'FILL_BLANK':
      return { correct: String(a).trim().toLowerCase() === String(q.solution).toLowerCase(), explanation: base }
    case 'MULTIPLE':
    case 'SPOT':
      return { correct: isNums(a) && [...a].sort().join() === [...(q.solution as number[])].sort().join(), explanation: base }
    case 'ORDER':
    case 'MATCH':
    case 'BUCKETS':
      return { correct: isNums(a) && a.join() === (q.solution as number[]).join(), explanation: base }
    case 'NUMBER': {
      const sol = q.solution as number
      const ok = typeof a === 'number' && Math.abs(a - sol) <= Math.max(Math.abs(sol) * (q.tol ?? 0.01), 0.005)
      return { correct: ok, explanation: base }
    }
    case 'SCENARIO':
    case 'CHAT': {
      const i = typeof a === 'number' ? a : -1
      const said = q.feedback?.[i]
      return { correct: i === q.solution, explanation: said ? `${said}\n\n${base}` : base }
    }
    case 'UP_DOWN':
      return { correct: a === q.solution, explanation: base, reveal: history(q) }
    case 'PLACE_LEVEL': {
      const [lo, hi] = q.range!
      const ok = typeof a === 'number' && a >= lo && a <= hi
      const entry = q.meta?.entry
      const stop = q.meta?.level === 'STOP' && typeof a === 'number' ? a : undefined
      const take = q.meta?.level === 'TAKE' && typeof a === 'number' ? a : undefined
      const misplaced = entry !== undefined && ((stop !== undefined && stop >= entry) || (take !== undefined && take <= entry))
      const r = q.hidden?.candles && !misplaced ? replay(q.hidden.candles, stop, take) : null
      const what = misplaced
        ? stop !== undefined
          ? 'Un stop por encima del precio de compra saltaría al momento: tiene que ir por debajo.'
          : 'Un objetivo por debajo del precio de compra no tiene sentido: tiene que ir por encima.'
        : r?.hit === 'STOP' ? 'El precio tocó tu stop.' : r?.hit === 'TAKE' ? 'El precio llegó a tu objetivo.' : 'En las sesiones siguientes no tocó tu nivel.'
      return { correct: ok, explanation: base, reveal: { candles: q.hidden?.candles, caption: q.hidden?.caption, outcome: `${q.hidden?.caption}. ${what}`, levels: { entry, stop, take, exit: r?.exit } } }
    }
    case 'SIM_TRADE': {
      const entry = q.meta!.entry!, cash = q.meta!.cash!, maxRisk = (cash * q.meta!.maxRiskPct!) / 100
      if (!isNums(a, 2)) return { correct: false, explanation: base }
      const [amount, stop] = a
      const risk = stop > 0 && stop < entry ? (amount * (entry - stop)) / entry : Infinity
      const problems: string[] = []
      if (!(stop > 0)) problems.push('No pusiste stop loss: no sabías cuánto podías perder.')
      else if (stop >= entry) problems.push('El stop tiene que estar por debajo del precio de compra.')
      if (amount <= 0 || amount > cash) problems.push(`El importe tiene que estar entre 0 y ${eur(cash)}.`)
      else if (risk > maxRisk * 1.05) problems.push(`Arriesgabas ${eur(risk)}: más del ${q.meta!.maxRiskPct} % de tu cartera (${eur(maxRisk)}).`)
      else if (risk < maxRisk * 0.5) problems.push(`Arriesgabas solo ${eur(risk)}: puedes usar hasta ${eur(maxRisk)} con ese stop.`)
      const r = q.hidden?.candles ? replay(q.hidden.candles, stop > 0 && stop < entry ? stop : undefined) : null
      const pnl = r?.exit !== undefined && amount > 0 ? amount * (r.exit / entry - 1) : 0
      const what = r?.hit === 'STOP' ? `Saltó tu stop: ${eur(pnl)}.` : `Resultado al final: ${eur(pnl)}.`
      const ok = problems.length === 0
      return {
        correct: ok,
        explanation: ok ? `Bien dimensionada: arriesgabas ${eur(risk)} de ${eur(maxRisk)} posibles. ${base}` : `${problems.join(' ')} ${base}`,
        reveal: { candles: q.hidden?.candles, caption: q.hidden?.caption, outcome: `${q.hidden?.caption}. ${what}`, levels: { entry, stop: stop > 0 ? stop : undefined, exit: r?.exit } },
      }
    }
    case 'PORTFOLIO': {
      const n = q.options.length
      if (!isNums(a, n) || a.some(w => w < 0)) return { correct: false, explanation: base }
      const total = a.reduce((s, w) => s + w, 0)
      const r = q.rules ?? {}
      const kinds = q.meta?.kinds ?? []
      const problems: string[] = []
      if (Math.abs(total - 100) > 0.5) problems.push(`Has repartido el ${Math.round(total)} %: tiene que sumar 100 %.`)
      if (r.maxWeight !== undefined) a.forEach((w, i) => w > r.maxWeight! + 0.5 && problems.push(`${q.options[i]} pesa un ${Math.round(w)} %: el máximo por activo es el ${r.maxWeight} %.`))
      if (r.minAssets !== undefined && a.filter(w => w > 0).length < r.minAssets) problems.push(`Usa al menos ${r.minAssets} activos.`)
      const byKind = (k: string) => a.reduce((s, w, i) => s + (kinds[i] === k ? w : 0), 0)
      for (const [k, max] of Object.entries(r.maxKind ?? {})) if (byKind(k) > max + 0.5) problems.push(`${k}: ${Math.round(byKind(k))} %, el máximo es ${max} %.`)
      for (const [k, min] of Object.entries(r.minKind ?? {})) if (byKind(k) < min - 0.5) problems.push(`${k}: ${Math.round(byKind(k))} %, el mínimo es ${min} %.`)
      return { correct: problems.length === 0, explanation: problems.length ? `${problems.join(' ')} ${base}` : `Cumple todas las reglas. ${base}` }
    }
    default:
      return { correct: a === q.solution, explanation: base }
  }
}
