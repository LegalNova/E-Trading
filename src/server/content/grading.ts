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
type Loc = 'es' | 'ca' | 'en'
const NUM: Record<Loc, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }
const pctL = (loc: Loc) => (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString(NUM[loc], { maximumFractionDigits: 1 })} %`
const eurL = (loc: Loc) => (v: number) => {
  const n = Math.abs(v).toLocaleString(NUM[loc], { maximumFractionDigits: 2, minimumFractionDigits: 2 })
  // En inglés el símbolo va delante («€1,250.00»), como en el resto de la app
  return `${v < 0 ? '−' : ''}${loc === 'en' ? `€${n}` : `${n} €`}`
}

/** Frases que genera el motor, en los tres idiomas */
const L = {
  es: {
    timeout: 'Se acabó el tiempo.', after: 'Variación después', fell: (p: string) => `Llegó a caer un ${p} por el camino.`,
    stopAbove: 'Un stop por encima del precio de compra saltaría al momento: tiene que ir por debajo.', takeBelow: 'Un objetivo por debajo del precio de compra no tiene sentido: tiene que ir por encima.',
    hitStop: 'El precio tocó tu stop.', hitTake: 'El precio llegó a tu objetivo.', noHit: 'En las sesiones siguientes no tocó tu nivel.',
    noStop: 'No pusiste stop loss: no sabías cuánto podías perder.', stopBelow: 'El stop tiene que estar por debajo del precio de compra.',
    amount: (c: string) => `El importe tiene que estar entre 0 y ${c}.`, tooMuch: (r: string, p: number, m: string) => `Arriesgabas ${r}: más del ${p} % de tu cartera (${m}).`,
    tooLittle: (r: string, m: string) => `Arriesgabas solo ${r}: puedes usar hasta ${m} con ese stop.`, sized: (r: string, m: string) => `Bien dimensionada: arriesgabas ${r} de ${m} posibles.`,
    stopOut: (v: string) => `Saltó tu stop: ${v}.`, final: (v: string) => `Resultado al final: ${v}.`,
    sum: (t: number) => `Has repartido el ${t} %: tiene que sumar 100 %.`, maxW: (a: string, w: number, m: number) => `${a} pesa un ${w} %: el máximo por activo es el ${m} %.`,
    minA: (n: number) => `Usa al menos ${n} activos.`, maxK: (k: string, w: number, m: number) => `${k}: ${w} %, el máximo es ${m} %.`, minK: (k: string, w: number, m: number) => `${k}: ${w} %, el mínimo es ${m} %.`, allOk: 'Cumple todas las reglas.',
  },
  ca: {
    timeout: 'S’ha acabat el temps.', after: 'Variació després', fell: (p: string) => `Va arribar a caure un ${p} pel camí.`,
    stopAbove: 'Un stop per sobre del preu de compra saltaria de seguida: ha d’anar per sota.', takeBelow: 'Un objectiu per sota del preu de compra no té sentit: ha d’anar per sobre.',
    hitStop: 'El preu va tocar el teu stop.', hitTake: 'El preu va arribar al teu objectiu.', noHit: 'A les sessions següents no va tocar el teu nivell.',
    noStop: 'No vas posar stop loss: no sabies quant podies perdre.', stopBelow: 'L’stop ha d’estar per sota del preu de compra.',
    amount: (c: string) => `L’import ha d’estar entre 0 i ${c}.`, tooMuch: (r: string, p: number, m: string) => `Arriscaves ${r}: més del ${p} % de la teva cartera (${m}).`,
    tooLittle: (r: string, m: string) => `Només arriscaves ${r}: pots fer servir fins a ${m} amb aquest stop.`, sized: (r: string, m: string) => `Ben dimensionada: arriscaves ${r} de ${m} possibles.`,
    stopOut: (v: string) => `Va saltar el teu stop: ${v}.`, final: (v: string) => `Resultat al final: ${v}.`,
    sum: (t: number) => `Has repartit el ${t} %: ha de sumar 100 %.`, maxW: (a: string, w: number, m: number) => `${a} pesa un ${w} %: el màxim per actiu és el ${m} %.`,
    minA: (n: number) => `Fes servir almenys ${n} actius.`, maxK: (k: string, w: number, m: number) => `${k}: ${w} %, el màxim és ${m} %.`, minK: (k: string, w: number, m: number) => `${k}: ${w} %, el mínim és ${m} %.`, allOk: 'Compleix totes les regles.',
  },
  en: {
    timeout: 'Time’s up.', after: 'Change afterwards', fell: (p: string) => `It fell as much as ${p} along the way.`,
    stopAbove: 'A stop above the purchase price would trigger straight away: it has to go below.', takeBelow: 'A target below the purchase price makes no sense: it has to go above.',
    hitStop: 'The price hit your stop.', hitTake: 'The price reached your target.', noHit: 'In the following sessions it didn’t touch your level.',
    noStop: 'You didn’t set a stop loss: you didn’t know how much you could lose.', stopBelow: 'The stop has to be below the purchase price.',
    amount: (c: string) => `The amount has to be between 0 and ${c}.`, tooMuch: (r: string, p: number, m: string) => `You were risking ${r}: more than ${p} % of your portfolio (${m}).`,
    tooLittle: (r: string, m: string) => `You were only risking ${r}: you can use up to ${m} with that stop.`, sized: (r: string, m: string) => `Well sized: you were risking ${r} out of a possible ${m}.`,
    stopOut: (v: string) => `Your stop was hit: ${v}.`, final: (v: string) => `Result at the end: ${v}.`,
    sum: (t: number) => `You’ve allocated ${t} %: it has to add up to 100 %.`, maxW: (a: string, w: number, m: number) => `${a} is ${w} %: the maximum per asset is ${m} %.`,
    minA: (n: number) => `Use at least ${n} assets.`, maxK: (k: string, w: number, m: number) => `${k}: ${w} %, the maximum is ${m} %.`, minK: (k: string, w: number, m: number) => `${k}: ${w} %, the minimum is ${m} %.`, allOk: 'It meets every rule.',
  },
} satisfies Record<Loc, unknown>
const isNums = (a: unknown, n?: number): a is number[] => Array.isArray(a) && a.every(x => typeof x === 'number' && Number.isFinite(x)) && (n === undefined || a.length === n)

/** Lo que pasó después en un gráfico real: activo, fechas y variación */
function history(q: ContentQuestion, loc: Loc): Reveal | undefined {
  const pct = pctL(loc), t = L[loc]
  const h = q.hidden
  if (!h) return undefined
  const last = q.candles?.length ? q.candles[q.candles.length - 1][3] : q.chart?.[q.chart.length - 1]
  const end = h.candles?.length ? h.candles[h.candles.length - 1][3] : h.closes?.[h.closes.length - 1]
  const ch = h.changePct ?? (last && end ? (end / last - 1) * 100 : undefined)
  const low = h.minPct !== undefined && h.minPct < -5 ? ` ${t.fell(pct(h.minPct).replace('−', ''))}` : ''
  return { candles: h.candles, closes: h.closes, caption: h.caption, outcome: ch !== undefined ? `${h.caption}. ${t.after}: ${pct(ch)}.${low}` : h.caption }
}

/** Recorre las velas siguientes: ¿toca antes el stop o el objetivo? */
function replay(future: [number, number, number, number][], stop?: number, take?: number) {
  for (const [, high, low] of future) {
    if (stop !== undefined && low <= stop) return { exit: stop, hit: 'STOP' as const }
    if (take !== undefined && high >= take) return { exit: take, hit: 'TAKE' as const }
  }
  return { exit: future.length ? future[future.length - 1][3] : undefined, hit: null }
}

export function grade(q: ContentQuestion, a: unknown, loc: Loc = 'es'): Graded {
  const base = q.explanation
  const t = L[loc], eur = eurL(loc)
  if (a === TIMEOUT) return { correct: false, explanation: `${t.timeout} ${base}`, reveal: history(q, loc) }
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
      return { correct: a === q.solution, explanation: base, reveal: history(q, loc) }
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
          ? t.stopAbove
          : t.takeBelow
        : r?.hit === 'STOP' ? t.hitStop : r?.hit === 'TAKE' ? t.hitTake : t.noHit
      return { correct: ok, explanation: base, reveal: { candles: q.hidden?.candles, caption: q.hidden?.caption, outcome: `${q.hidden?.caption}. ${what}`, levels: { entry, stop, take, exit: r?.exit } } }
    }
    case 'SIM_TRADE': {
      const entry = q.meta!.entry!, cash = q.meta!.cash!, maxRisk = (cash * q.meta!.maxRiskPct!) / 100
      if (!isNums(a, 2)) return { correct: false, explanation: base }
      const [amount, stop] = a
      const risk = stop > 0 && stop < entry ? (amount * (entry - stop)) / entry : Infinity
      const problems: string[] = []
      if (!(stop > 0)) problems.push(t.noStop)
      else if (stop >= entry) problems.push(t.stopBelow)
      if (amount <= 0 || amount > cash) problems.push(t.amount(eur(cash)))
      else if (risk > maxRisk * 1.05) problems.push(t.tooMuch(eur(risk), q.meta!.maxRiskPct!, eur(maxRisk)))
      else if (risk < maxRisk * 0.5) problems.push(t.tooLittle(eur(risk), eur(maxRisk)))
      const r = q.hidden?.candles ? replay(q.hidden.candles, stop > 0 && stop < entry ? stop : undefined) : null
      const pnl = r?.exit !== undefined && amount > 0 ? amount * (r.exit / entry - 1) : 0
      const what = r?.hit === 'STOP' ? t.stopOut(eur(pnl)) : t.final(eur(pnl))
      const ok = problems.length === 0
      return {
        correct: ok,
        explanation: ok ? `${t.sized(eur(risk), eur(maxRisk))} ${base}` : `${problems.join(' ')} ${base}`,
        reveal: { candles: q.hidden?.candles, caption: q.hidden?.caption, outcome: `${q.hidden?.caption}. ${what}`, levels: { entry, stop: stop > 0 ? stop : undefined, exit: r?.exit } },
      }
    }
    case 'PORTFOLIO': {
      const n = q.options.length
      if (!isNums(a, n) || a.some(w => w < 0)) return { correct: false, explanation: base }
      const total = a.reduce((s, w) => s + w, 0)
      const r = q.rules ?? {}
      // Las reglas usan los tipos de activo en español; al alumno se le nombran en su idioma
      const kinds = q.kindsEs ?? q.meta?.kinds ?? []
      const shown = q.meta?.kinds ?? kinds
      const problems: string[] = []
      if (Math.abs(total - 100) > 0.5) problems.push(t.sum(Math.round(total)))
      if (r.maxWeight !== undefined) a.forEach((w, i) => w > r.maxWeight! + 0.5 && problems.push(t.maxW(q.options[i], Math.round(w), r.maxWeight!)))
      if (r.minAssets !== undefined && a.filter(w => w > 0).length < r.minAssets) problems.push(t.minA(r.minAssets))
      const byKind = (k: string) => a.reduce((s, w, i) => s + (kinds[i] === k ? w : 0), 0)
      const label = (k: string) => shown[kinds.indexOf(k)] ?? k
      for (const [k, max] of Object.entries(r.maxKind ?? {})) if (byKind(k) > max + 0.5) problems.push(t.maxK(label(k), Math.round(byKind(k)), max))
      for (const [k, min] of Object.entries(r.minKind ?? {})) if (byKind(k) < min - 0.5) problems.push(t.minK(label(k), Math.round(byKind(k)), min))
      return { correct: problems.length === 0, explanation: problems.length ? `${problems.join(' ')} ${base}` : `${t.allOk} ${base}` }
    }
    default:
      return { correct: a === q.solution, explanation: base }
  }
}
