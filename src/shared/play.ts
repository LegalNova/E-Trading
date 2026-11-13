// Clases interactivas (docs/curso-v2/05-clases-interactivas.md): piezas para tocar (PLAY) e historias con decisiones (STORY).
// Una pieza calcula unas «métricas» (números) con lo que hace el alumno; el objetivo y las reacciones de Lumi son
// condiciones sobre esas métricas, así el contenido decide qué celebrar sin programar nada.
import { z } from 'zod'

export const Cmp = z.object({ metric: z.string(), op: z.enum(['<', '<=', '>', '>=', '==']), value: z.number() })
export type CmpT = z.infer<typeof Cmp>

/** Caras de Lumi que se usan en las clases */
export const LumiMood = z.enum(['HAPPY', 'CELEBRATE', 'WORRIED', 'CALM', 'SAD', 'THINKING'])

const Item = z.object({ icon: z.string(), name: z.string(), price: z.number() })
/** `usd`: la serie va en dólares; la pieza avisa de que no cuenta el cambio euro/dólar */
const Series = z.object({ caption: z.string(), dates: z.array(z.string()), closes: z.array(z.number()), usd: z.boolean().optional() })
const Mix = z.object({ caption: z.string(), usd: z.boolean().optional(), dates: z.array(z.string()), assets: z.array(z.object({ key: z.string(), name: z.string(), closes: z.array(z.number()) })) })
const Ohlc = z.tuple([z.number(), z.number(), z.number(), z.number()])
/** Velas reales de charts.json: las visibles, las que vienen después y el precio de entrada (si lo hay) */
const Candles = z.object({ caption: z.string(), candles: z.array(Ohlc), future: z.array(Ohlc), entry: z.number().optional() })

export const Widget = z.discriminatedUnion('kind', [
  /** Cesta de la compra que encoge con la inflación */
  z.object({ kind: z.literal('basket'), money: z.number(), items: z.array(Item), rate: z.number(), years: z.number(), maxYears: z.number(), maxRate: z.number(), lockRate: z.boolean().optional() }),
  /** Colchón, interés simple y compuesto con deslizadores */
  z.object({
    kind: z.literal('growth'), initial: z.number(), monthly: z.number(), rate: z.number(), years: z.number(),
    maxInitial: z.number(), maxMonthly: z.number(), maxRate: z.number(), maxYears: z.number(),
    lines: z.array(z.enum(['mattress', 'simple', 'compound'])), controls: z.array(z.enum(['initial', 'monthly', 'rate', 'years'])),
  }),
  /** Dos personas aportan lo mismo; una empieza más tarde */
  z.object({ kind: z.literal('race'), monthly: z.number(), rate: z.number(), endAge: z.number(), a: z.object({ name: z.string(), age: z.number() }), b: z.object({ name: z.string(), age: z.number() }), maxAge: z.number() }),
  /** ¿En cuántos años se duplica? Regla del 72 frente al cálculo exacto */
  z.object({ kind: z.literal('doubling'), amount: z.number(), rate: z.number(), maxRate: z.number() }),
  /** Rentabilidad real: lo que rinde menos la inflación */
  z.object({ kind: z.literal('realrate'), amount: z.number(), nominal: z.number(), inflation: z.number(), years: z.number(), maxNominal: z.number(), maxInflation: z.number() }),
  /** Clasificar tarjetas con respuesta al momento (con importes, suma por grupo) */
  z.object({
    kind: z.literal('sort'), bins: z.array(z.object({ label: z.string(), sign: z.number().optional() })),
    cards: z.array(z.object({ icon: z.string(), label: z.string(), value: z.number().optional(), bin: z.number(), why: z.string() })),
    sumLabel: z.string().optional(),
  }),
  /**
   * Desliza las tarjetas (auditoría PRO-15): las mismas tarjetas que «clasifica», con dos grupos, pero se lanzan a la
   * izquierda o a la derecha. Da variedad a las unidades donde «clasifica» pasaba de un tercio de las piezas (PRO-14).
   */
  z.object({
    kind: z.literal('swipe'), bins: z.array(z.object({ label: z.string() })).length(2),
    cards: z.array(z.object({ icon: z.string(), label: z.string(), bin: z.number(), why: z.string() })),
  }),
  /** Reparte el sueldo entre gastos y mira cómo queda frente a 50/30/20 */
  z.object({
    kind: z.literal('budget'), salary: z.number(), groups: z.array(z.string()), targets: z.array(z.number()),
    cats: z.array(z.object({ icon: z.string(), label: z.string(), group: z.number(), amount: z.number(), min: z.number(), max: z.number() })),
  }),
  /** Gastos hormiga: enciende y apaga pequeños gastos y mira lo que suman */
  z.object({ kind: z.literal('leaks'), items: z.array(z.object({ icon: z.string(), name: z.string(), amount: z.number(), per: z.enum(['day', 'week', 'month']), on: z.boolean() })), rate: z.number(), years: z.number() }),
  /** Un año con imprevistos: ¿te alcanza el colchón o acabas pidiendo prestado? */
  z.object({
    kind: z.literal('emergency'), salary: z.number(), spend: z.number(), start: z.number(), maxSave: z.number(), loanRate: z.number(),
    events: z.array(z.object({ month: z.number(), icon: z.string(), text: z.string(), cost: z.number() })),
  }),
  /** Préstamo: cuota, intereses y TAE */
  z.object({ kind: z.literal('loan'), amount: z.number(), tin: z.number(), months: z.number(), fee: z.number(), maxAmount: z.number(), maxTin: z.number(), maxMonths: z.number() }),
  /** Tarjeta revolving: cuánto tardas en pagarla según la cuota */
  z.object({ kind: z.literal('revolving'), debt: z.number(), apr: z.number(), payment: z.number(), minPayment: z.number(), maxPayment: z.number() }),
  /** Varias deudas: bola de nieve o avalancha */
  z.object({ kind: z.literal('debts'), debts: z.array(z.object({ icon: z.string(), name: z.string(), balance: z.number(), rate: z.number(), min: z.number() })), extra: z.number(), maxExtra: z.number() }),
  /** Objetivos con cifra y fecha: cuánto hay que apartar al mes */
  z.object({ kind: z.literal('goalplan'), available: z.number(), maxMonths: z.number(), goals: z.array(z.object({ icon: z.string(), label: z.string(), amount: z.number(), months: z.number() })) }),
  /** Datos reales: con cuántos años nunca se perdió dinero en el S&P 500 */
  z.object({ kind: z.literal('horizon'), series: Series, years: z.number(), maxYears: z.number() }),
  /** Datos reales: vive una crisis con tu dinero y decide si vendes */
  z.object({ kind: z.literal('crash'), series: Series, amount: z.number() }),
  /** Simulación (matemática, no datos de mercado): 1.000 personas que apuestan a cara o cruz pagando comisión */
  z.object({ kind: z.literal('coinflip'), traders: z.number(), trades: z.number(), maxTrades: z.number(), fee: z.number(), stake: z.number(), win: z.number() }),
  /** Datos reales: reparte una cartera entre varios activos y mira cómo le fue (rentabilidad total) */
  z.object({ kind: z.literal('mix'), series: Mix, weights: z.array(z.number()), amount: z.number(), rebalance: z.boolean().optional() }),
  /** Comisiones a largo plazo: el mismo ahorro con un fondo barato y otro caro */
  z.object({ kind: z.literal('fees'), amount: z.number(), monthly: z.number(), gross: z.number(), feeA: z.number(), feeB: z.number(), years: z.number(), maxFee: z.number(), maxYears: z.number() }),
  /** Precio de un bono cuando cambian los tipos (`head` sustituye la cabecera: sirve también para descontar un cobro futuro) */
  z.object({ kind: z.literal('bond'), head: z.string().optional(), face: z.number(), coupon: z.number(), years: z.number(), rate: z.number(), maxRate: z.number(), maxYears: z.number() }),
  /** Invertir fuera del euro: la rentabilidad del activo y la de la divisa */
  z.object({ kind: z.literal('fx'), amount: z.number(), asset: z.number(), fx: z.number(), maxAsset: z.number(), maxFx: z.number(), currency: z.string() }),
  /** Apalancamiento: un pequeño movimiento del precio, multiplicado */
  z.object({ kind: z.literal('leverage'), margin: z.number(), lev: z.number(), move: z.number(), maxLev: z.number(), maxMove: z.number() }),
  /** Tamaño de la posición: cuánto comprar para arriesgar solo un % de la cuenta */
  z.object({ kind: z.literal('position'), account: z.number(), riskPct: z.number(), stopPct: z.number(), entry: z.number(), maxRisk: z.number(), maxStop: z.number() }),
  /** Datos reales: coloca stop y objetivo sobre velas reales y mira qué toca primero */
  z.object({ kind: z.literal('orders'), chart: Candles, stopPct: z.number(), takePct: z.number(), maxPct: z.number() }),
  /** Impuestos de la base del ahorro en España (tramos de 2025) y compensar pérdidas */
  z.object({ kind: z.literal('taxes'), gain: z.number(), loss: z.number(), maxGain: z.number() }),
  /** Datos reales: todo de golpe o poco a poco, según el mes en que empiezas */
  z.object({ kind: z.literal('dca'), series: Series, total: z.number(), spread: z.number(), window: z.number(), start: z.number() }),
  /** Datos reales: ¿sube o baja? en varias rondas, y se revela lo que pasó */
  z.object({ kind: z.literal('guess'), rounds: z.array(Candles) }),
  /** Libro de órdenes de ejemplo: el precio medio de una compra grande y el deslizamiento */
  z.object({ kind: z.literal('book'), bids: z.array(z.object({ price: z.number(), size: z.number() })), asks: z.array(z.object({ price: z.number(), size: z.number() })), size: z.number(), maxSize: z.number() }),
  /** Valoración: PER, PEG y años para recuperar el precio con los beneficios */
  z.object({ kind: z.literal('valuation'), price: z.number(), eps: z.number(), growth: z.number(), maxPrice: z.number(), maxGrowth: z.number() }),
])
export type WidgetT = z.infer<typeof Widget>
export type WidgetKind = WidgetT['kind']

export const PlayStep = z.object({
  id: z.string(),
  type: z.literal('PLAY'),
  /** EXPLORE: juega y descubre · MISSION: cumple un objetivo en el simulador */
  mode: z.enum(['EXPLORE', 'MISSION']),
  title: z.string(),
  intro: z.string(),
  widget: Widget,
  /** Antes de tocar: ¿qué crees que pasará? (no resta vidas) */
  /** `hold`: la respuesta no se desvela al elegir, sino al terminar la actividad (la pieza es la que la descubre) */
  predict: z.object({ prompt: z.string(), options: z.array(z.string()), answer: z.number(), why: z.string(), hold: z.boolean().optional() }).optional(),
  /** El reto de la pantalla: se cumple cuando todas las condiciones son ciertas */
  goal: z.object({ text: z.string(), when: z.array(Cmp) }).optional(),
  /** Lo que acabas de descubrir, en una o dos frases */
  insight: z.string(),
  /** Lumi comenta lo que pasa: gana la primera frase cuya condición se cumple */
  lumi: z.array(z.object({ say: z.string(), when: Cmp.optional(), mood: LumiMood.optional() })),
})
export type PlayStepT = z.infer<typeof PlayStep>

const Say = z.object({ who: z.string(), text: z.string() })
export const Beat = z.union([
  Say,
  z.object({ note: z.string() }),
  z.object({ choice: z.object({ prompt: z.string(), options: z.array(z.object({ text: z.string(), tone: z.enum(['good', 'ok', 'bad']), then: z.array(z.union([Say, z.object({ note: z.string() })])) })) }) }),
])
export type BeatT = z.infer<typeof Beat>

export const StoryStep = z.object({
  id: z.string(),
  type: z.literal('STORY'),
  title: z.string(),
  /** Personajes (además de «lumi» y «me», que siempre existen); se dibujan con sus iniciales */
  cast: z.array(z.object({ id: z.string(), name: z.string() })),
  beats: z.array(Beat),
})
export type StoryStepT = z.infer<typeof StoryStep>

/** ¿Se cumple la condición con estas métricas? */
export function holds(c: CmpT, m: Record<string, number>): boolean {
  const v = m[c.metric]
  if (v === undefined || Number.isNaN(v)) return false
  switch (c.op) {
    case '<': return v < c.value
    case '<=': return v <= c.value
    case '>': return v > c.value
    case '>=': return v >= c.value
    case '==': return Math.abs(v - c.value) < 1e-9
  }
}

/** Campos que no son texto para traducir (el resto de cadenas de un PLAY o STORY sí lo son, en este orden) */
export const NOT_TEXT = new Set(['id', 'type', 'mode', 'kind', 'icon', 'who', 'tone', 'per', 'metric', 'op', 'mood', 'dates', 'candles', 'future', 'closes', 'key', 'caption', 'usd', 'lines', 'controls'])

/** Recorre las cadenas traducibles de un paso en orden fijo; `map` puede sustituirlas */
export function walkTexts<T>(x: T, map: (s: string) => string, key = ''): T {
  if (typeof x === 'string') return (NOT_TEXT.has(key) ? x : map(x)) as T
  if (Array.isArray(x)) return (NOT_TEXT.has(key) ? x : x.map(v => walkTexts(v, map, key))) as T
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, NOT_TEXT.has(k) ? v : walkTexts(v, map, k)])) as T
  return x
}
