// Proyecto final «Tu primera tesis de inversión»: pasos, comprobaciones y puntuación.
// Lo usan el servidor (que manda) y la pantalla (para avisar al momento). Criterios fijos y explicados en la app.
import { z } from 'zod'
import { realName } from './names'

export const MOATS = ['BRAND', 'NETWORK', 'COST', 'SWITCHING', 'PATENTS', 'SCALE', 'NONE'] as const
export const VALUATIONS = ['CHEAP', 'FAIR', 'EXPENSIVE', 'UNSURE'] as const
export const HORIZONS = ['M6', 'Y1', 'Y3', 'Y5', 'Y10'] as const
/** Pasos con pregunta (1–8). El 0 es elegir la empresa y el 9, el resumen */
export const THESIS_STEPS = 8
export const MAX_WEIGHT = 20

const txt = (max: number) => z.string().max(max).transform(s => s.trim())
const num = z.number().finite().min(0).max(1e9)

/** Lo que se envía en cada paso */
export const StepInput = {
  1: z.object({ business: txt(800) }),
  2: z.object({ moatType: z.enum(MOATS), moat: txt(800) }),
  3: z.object({ risks: z.array(txt(300)).min(1).max(5) }),
  4: z.object({ valuation: z.enum(VALUATIONS), valuationWhy: txt(800) }),
  5: z.object({ weightPct: num, weightWhy: txt(600) }),
  6: z.object({ stop: num, target: num }),
  7: z.object({ horizon: z.enum(HORIZONS), horizonWhy: txt(600).optional() }),
  8: z.object({ invalidation: txt(800) }),
} as const
export type StepN = keyof typeof StepInput

export const ThesisAnswers = z.object({
  business: z.string().optional(),
  moatType: z.enum(MOATS).optional(),
  moat: z.string().optional(),
  risks: z.array(z.string()).optional(),
  valuation: z.enum(VALUATIONS).optional(),
  valuationWhy: z.string().optional(),
  weightPct: z.number().optional(),
  weightWhy: z.string().optional(),
  stop: z.number().optional(),
  target: z.number().optional(),
  /** Precio de la empresa (del servidor) cuando se fijaron el stop y el objetivo */
  priceAt: z.number().optional(),
  horizon: z.enum(HORIZONS).optional(),
  horizonWhy: z.string().optional(),
  invalidation: z.string().optional(),
})
export type ThesisAnswersT = z.infer<typeof ThesisAnswers>

/** Datos reales de la ficha que se enseñan en cada paso. null = no hay dato (se dice y se sigue) */
export const ThesisFacts = z.object({
  symbol: z.string(),
  ticker: z.string(),
  name: z.string(),
  sector: z.string(),
  country: z.string(),
  currency: z.string(),
  price: z.number().nullable(),
  high52: z.number().nullable(),
  low52: z.number().nullable(),
  pe: z.number().nullable(),
  dividendYield: z.number().nullable(),
  /** Mediana del PER de las empresas del mismo sector con dato (y cuántas son) */
  sectorPe: z.number().nullable(),
  sectorN: z.number(),
  /** PER medio de los últimos años: hoy no hay fuente, se dice en el paso */
  peHistory: z.number().nullable(),
  description: z.string(),
  asOf: z.string().nullable(),
  stale: z.boolean(),
})
export type ThesisFactsT = z.infer<typeof ThesisFacts>

export const ScorePart = z.object({ key: z.enum(['complete', 'risks', 'valuation', 'risk', 'plan']), points: z.number(), max: z.number() })
export const Thesis = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  status: z.enum(['DRAFT', 'DONE']),
  /** Primer paso por contestar (1–8) o 9 si están todos */
  step: z.number(),
  answers: ThesisAnswers,
  score: z.number().nullable(),
  parts: z.array(ScorePart),
  shareCode: z.string().nullable(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
})
export const ThesisList = z.object({
  unlocked: z.boolean(),
  /** Reto que hay que aprobar para abrirlo */
  needs: z.string().nullable(),
  items: z.array(Thesis.pick({ id: true, symbol: true, name: true, status: true, step: true, score: true, createdAt: true, completedAt: true })),
})
export const ThesisDetail = z.object({ thesis: Thesis, facts: ThesisFacts })
export type ThesisT = z.infer<typeof Thesis>
export type ThesisListT = z.infer<typeof ThesisList>
export type ThesisDetailT = z.infer<typeof ThesisDetail>
export type ScorePartT = z.infer<typeof ScorePart>

// ── Comprobaciones ligeras de cada paso ─────────────────
export type StepError = 'SHORT' | 'RISKS_MIN' | 'RISKS_SAME' | 'WEIGHT_MIN' | 'WEIGHT_MAX' | 'NO_PRICE' | 'STOP_ZERO' | 'STOP_ABOVE' | 'TARGET_BELOW' | 'CHOOSE'
/** Mínimos de texto: lo justo para que no se quede en blanco, sin exigir redacciones */
export const MIN = { business: 20, moat: 15, risk: 8, valuationWhy: 15, weightWhy: 10, invalidation: 15 }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
export const validRisks = (r: string[] | undefined) => {
  const seen = new Set<string>()
  return (r ?? []).map(s => s.trim()).filter(s => {
    const k = norm(s)
    if (s.length < MIN.risk || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** ¿Está bien contestado el paso? Devuelve el primer problema o null. `price` es el precio de referencia del paso 6 */
export function checkStep(n: StepN, a: ThesisAnswersT, price: number | null): StepError | null {
  const short = (s: string | undefined, min: number) => (s ?? '').trim().length < min
  switch (n) {
    case 1:
      return short(a.business, MIN.business) ? 'SHORT' : null
    case 2:
      return !a.moatType ? 'CHOOSE' : short(a.moat, MIN.moat) ? 'SHORT' : null
    case 3: {
      const filled = (a.risks ?? []).filter(s => s.trim().length >= MIN.risk)
      if (filled.length < 2) return 'RISKS_MIN'
      return validRisks(a.risks).length < 2 ? 'RISKS_SAME' : null
    }
    case 4:
      return !a.valuation ? 'CHOOSE' : short(a.valuationWhy, MIN.valuationWhy) ? 'SHORT' : null
    case 5:
      if (a.weightPct === undefined || a.weightPct <= 0) return 'WEIGHT_MIN'
      if (a.weightPct > MAX_WEIGHT) return 'WEIGHT_MAX'
      return short(a.weightWhy, MIN.weightWhy) ? 'SHORT' : null
    case 6:
      if (!price || price <= 0) return 'NO_PRICE'
      if (!a.stop || a.stop <= 0) return 'STOP_ZERO'
      if (a.stop >= price) return 'STOP_ABOVE'
      return !a.target || a.target <= price ? 'TARGET_BELOW' : null
    case 7:
      return a.horizon ? null : 'CHOOSE'
    case 8:
      return short(a.invalidation, MIN.invalidation) ? 'SHORT' : null
  }
}

/** Primer paso sin contestar bien (1–8); 9 si están todos */
export function currentStep(a: ThesisAnswersT): number {
  for (let n = 1 as StepN; n <= THESIS_STEPS; n = (n + 1) as StepN) if (checkStep(n, a, n === 6 ? (a.priceAt ?? null) : null)) return n
  return THESIS_STEPS + 1
}

/** Riesgo de la operación si salta el stop, en % de toda la cartera (regla del 1 %) */
export const riskAtStop = (weightPct: number, price: number, stop: number) => (price > 0 && stop < price ? (weightPct * (price - stop)) / price : 0)

// ── Puntuación de 0 a 100 (criterios fijos) ─────────────
// complete 40 · risks 10 · valuation 15 · risk 20 · plan 15
export function scoreThesis(a: ThesisAnswersT, f: Pick<ThesisFactsT, 'pe' | 'sectorPe'>): { total: number; parts: ScorePartT[] } {
  const len = (s?: string) => (s ?? '').trim().length
  const textPts = (s: string | undefined, min: number) => (len(s) >= 60 ? 5 : len(s) >= min ? 3 : 0)
  const risks = validRisks(a.risks)
  const price = a.priceAt ?? 0
  // 1. Completa: 5 puntos por paso (5 si se explica con algo de detalle, 3 si se queda en lo mínimo)
  const complete =
    textPts(a.business, MIN.business) +
    (a.moatType ? textPts(a.moat, MIN.moat) : 0) +
    (risks.length >= 2 ? (risks.join(' ').length >= 60 ? 5 : 3) : 0) +
    (a.valuation ? textPts(a.valuationWhy, MIN.valuationWhy) : 0) +
    (a.weightPct && a.weightPct <= MAX_WEIGHT ? textPts(a.weightWhy, MIN.weightWhy) : 0) +
    (checkStep(6, a, price) ? 0 : 5) +
    (a.horizon ? 5 : 0) +
    textPts(a.invalidation, MIN.invalidation)
  // 2. Riesgos: 2 riesgos distintos, 6; 3 o más, 10
  const riskPts = risks.length >= 3 ? 10 : risks.length === 2 ? 6 : 0
  // 3. Valoración: argumenta con una cifra o el PER (5), con detalle (5) y coherente con los datos (5)
  const why = a.valuationWhy ?? ''
  let val = (/\d/.test(why) || /\b(per|p\/e|pe ratio|beneficio|benefici|earnings)\b/i.test(why) ? 5 : 0) + (len(why) >= 60 ? 5 : 0)
  if (a.valuation) {
    const pe = f.pe && f.pe > 0 ? f.pe : null
    if (pe && f.sectorPe) {
      const r = pe / f.sectorPe
      const ok = a.valuation === 'CHEAP' ? r < 1 : a.valuation === 'EXPENSIVE' ? r > 1 : a.valuation === 'FAIR' ? r >= 0.8 && r <= 1.25 : false
      val += ok ? 5 : a.valuation === 'UNSURE' ? 2 : 0
    } else val += len(why) >= 40 ? 5 : 2 // sin datos para comparar: cuenta que lo razone
  }
  // 4. Gestión del riesgo: peso (≤ 10 %: 10; ≤ 20 %: 5) y lo que se pierde si salta el stop (≤ 1 % de la cartera: 10; ≤ 2 %: 5)
  const w = a.weightPct ?? 0
  const wPts = w > 0 && w <= 10 ? 10 : w > 0 && w <= MAX_WEIGHT ? 5 : 0
  const atStop = a.stop && price ? riskAtStop(w, price, a.stop) : Infinity
  const sPts = w > 0 && atStop <= 1 ? 10 : w > 0 && atStop <= 2 ? 5 : 0
  // 5. Plan: beneficio posible frente a pérdida posible (≥ 2: 8; ≥ 1: 4), horizonte de al menos un año (4) y qué le haría cambiar de opinión (3)
  const rr = a.stop && a.target && price > a.stop ? (a.target - price) / (price - a.stop) : 0
  const plan = (rr >= 2 ? 8 : rr >= 1 ? 4 : 0) + (a.horizon && a.horizon !== 'M6' ? 4 : a.horizon ? 1 : 0) + (len(a.invalidation) >= 40 ? 3 : 0)
  const parts: ScorePartT[] = [
    { key: 'complete', points: complete, max: 40 },
    { key: 'risks', points: riskPts, max: 10 },
    { key: 'valuation', points: val, max: 15 },
    { key: 'risk', points: wPts + sPts, max: 20 },
    { key: 'plan', points: plan, max: 15 },
  ]
  return { total: Math.max(0, Math.min(100, parts.reduce((t, p) => t + p.points, 0))), parts }
}

/** Nombre de pila para el certificado público: sin apellidos ni nada que no sean letras */
export const firstName = (name: string | null | undefined) => {
  const w = realName(name).split(/\s+/)[0] ?? ''
  const clean = w.replace(/[^\p{L}'-]/gu, '').slice(0, 20)
  return clean.length >= 2 ? clean : null
}
