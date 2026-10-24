import 'server-only'
// El «cerebro» de Lumi: entiende la intención de la pregunta y responde con el manual, cálculos reales
// y los datos del propio alumno. Todo es lógica propia: no usa ningún servicio ni modelo de IA externo.
import type { PortfolioT, TutorModeT } from '@/shared/contract'
import { lessonHead, norm, search, tokens, type Chunk } from './search'
import KB from './kb.json'

const GLOSSARY = (KB as Chunk[]).filter(c => c.module === 'Glosario')

// ── Utilidades de texto y números ────────────────────────
const eur = (v: number, d = 0) => `${v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d })} €`
const pc = (v: number, d = 1) => `${v.toLocaleString('es-ES', { maximumFractionDigits: d })} %`

/** Números de la pregunta: «10.000», «2,5 %», «10k», «1,5 millones» */
function numbers(q: string): { v: number; pct: boolean; at: number }[] {
  const out: { v: number; pct: boolean; at: number }[] = []
  for (const m of q.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(k|mil\b|millones?)?\s*(%|por ?ciento)?/gi)) {
    let raw = m[1]
    raw = /^\d{1,3}(\.\d{3})+$/.test(raw) ? raw.replace(/\./g, '') : raw.replace(',', '.')
    let v = Number(raw)
    if (m[2]) v *= /^k|mil/i.test(m[2]) ? 1000 : 1_000_000
    if (Number.isFinite(v)) out.push({ v, pct: !!m[3], at: m.index ?? 0 })
  }
  return out
}
/** Número que aparece justo después de alguna de estas palabras */
function after(q: string, words: RegExp): number | null {
  const m = q.match(new RegExp(`(?:${words.source})[^\\d]{0,14}(\\d{1,3}(?:\\.\\d{3})+|\\d+(?:[.,]\\d+)?)\\s*(k|mil\\b)?`, 'i'))
  if (!m) return null
  // Los dos últimos grupos son el número y el sufijo (las palabras pueden traer grupos propios)
  const num = m[m.length - 2], suf = m[m.length - 1]
  const raw = /^\d{1,3}(\.\d{3})+$/.test(num) ? num.replace(/\./g, '') : num.replace(',', '.')
  const v = Number(raw) * (suf ? 1000 : 1)
  return Number.isFinite(v) ? v : null
}

// ── Intenciones ──────────────────────────────────────────
const RE = {
  greet: /^(hola|buenas|hey|hello|hi|bon dia|buenos dias|buenas tardes|buenas noches)\b/,
  thanks: /\b(gracias|thank|merci|mil gracias)\b/,
  who: /(quien eres|que eres|que puedes hacer|como funcionas|para que sirves|ayuda$)/,
  advice: /(que (accion|acciones|cripto|criptomoneda|etf|fondo)? ?(compro|vendo|me compro)|deberia (comprar|vender|invertir en)|me recomiendas (comprar|una|un|que)|en que (invierto|deberia invertir)|donde (invierto|meto mi dinero)|es buen momento (para|de) (comprar|vender|invertir)|va a subir|va a bajar|subira|bajara|cual es la mejor (accion|inversion|cripto)|dame una (accion|senal)|que acciones? (me )?recomiendas)/,
  define: /(?:que es eso de|que es|que son|que significa|que quiere decir|define|definicion de|explica(?:me)?(?: que es| el| la| los| las)?)\s+(.+)/,
  diff: /diferencias? entre (.+?) y (.+)/,
  compound: /(interes compuesto|si (invierto|ahorro|aporto|meto)|aportando|aporto|al mes durante|cuanto tendre|cuanto tendria)/,
  position: /(tamano de (la )?posicion|cuantas acciones (compro|debo comprar|deberia comprar)|stop (en|a|loss)|cuanto (compro|arriesgo))/,
  recovery: /(si (pierdo|cae|baja)|caida del?|perder un|cae un|pierde un|baja un)/,
  doubling: /(duplica|doblar|duplicar)/,
  inflation: /inflacion/,
  tax: /(impuesto|hacienda|tributa|irpf|cuanto pago|pagare)/,
  expectancy: /(esperanza|acierto|aciertos?) .*(gano|ganancia|r\b)/,
}

export interface BrainCtx {
  name: string
  mode: TutorModeT
  nextLesson: { id: string; title: string; unit: string } | null
  doneLessons: number
  totalLessons: number
  mistakes: number
  streak: number
  lastQuestion: string
  portfolio?: PortfolioT | null
  trades?: { side: 'BUY' | 'SELL'; symbol: string; total: number; realizedPnl: number | null; createdAt: Date }[]
  stopsBySymbol?: Set<string>
}

export interface BrainOut { text: string; found: Chunk[] }

// ── Respuestas de cálculo ────────────────────────────────
function compoundAnswer(q: string): string | null {
  const nums = numbers(q)
  const rate = nums.find(n => n.pct)?.v ?? 7
  const years = after(q, /durante|en|a lo largo de|por/) ?? nums.find(n => !n.pct && n.v >= 1 && n.v <= 60 && /a(n|ñ)os/.test(q.slice(n.at, n.at + 12)))?.v
  const monthly = /(al mes|mensual|cada mes|\/mes)/.test(q)
  const amount = nums.filter(n => !n.pct && n.v !== years).sort((a, b) => b.v - a.v)[0]?.v
  if (!amount || !years || years > 70) return null
  const fv = (r: number) => {
    if (!monthly) return amount * (1 + r / 100) ** years
    let v = 0
    for (let m = 0; m < years * 12; m++) v = v * (1 + r / 100 / 12) + amount
    return v
  }
  const put = monthly ? amount * 12 * years : amount
  const res = fv(rate)
  return [
    `**Hecho el cálculo:** ${monthly ? `${eur(amount)} al mes` : eur(amount)} durante ${years} años al ${pc(rate)} anual.`,
    `• Aportas en total: **${eur(put)}**\n• Valor final aproximado: **${eur(res)}**\n• De eso, ganancias del interés compuesto: **${eur(res - put)}**`,
    `Para comparar: al 0 % tendrías ${eur(put)} y al 2 % unos ${eur(fv(2))}.`,
    'Es un ejemplo, no una promesa: la bolsa no da lo mismo cada año y aquí no hay comisiones ni impuestos. Lo que sí es seguro: **cuanto antes empiezas, más trabaja el tiempo por ti**.',
  ].join('\n\n')
}

function positionAnswer(q: string): string | null {
  const nums = numbers(q)
  const capital = after(q, /capital|cuenta|tengo|cartera de|con/) ?? nums.filter(n => !n.pct).sort((a, b) => b.v - a.v)[0]?.v
  const risk = nums.find(n => n.pct)?.v ?? 1
  const entry = after(q, /entrada|entro|compro a|compro en|precio de|a un precio de|comprar a/)
  const stop = after(q, /stop(?: loss)?(?: en| a)?/)
  if (!capital || !entry || !stop || entry === stop) return null
  const perShare = Math.abs(entry - stop)
  const riskEur = (capital * risk) / 100
  const shares = Math.floor(riskEur / perShare)
  return [
    `**Tamaño de la posición** con la regla del ${pc(risk)}:`,
    `• Riesgo máximo: ${eur(capital)} × ${pc(risk)} = **${eur(riskEur, 2)}**\n• Distancia al stop: ${entry} − ${stop} = **${perShare.toLocaleString('es-ES', { maximumFractionDigits: 4 })}** por acción\n• Tamaño: ${eur(riskEur, 2)} ÷ ${perShare.toLocaleString('es-ES', { maximumFractionDigits: 4 })} = **${shares} acciones** (unos ${eur(shares * entry)} invertidos)`,
    `Si salta el stop, pierdes unos ${eur(shares * perShare, 2)}: el ${pc(risk)} de tu cuenta.${risk > 2 ? ' Ojo: más del 2 % por operación es mucho para empezar.' : ''}`,
  ].join('\n\n')
}

function recoveryAnswer(q: string): string | null {
  const p = numbers(q).find(n => n.pct || n.v < 100)?.v
  if (!p || p <= 0 || p >= 100) return null
  const need = (1 / (1 - p / 100) - 1) * 100
  return [`Si pierdes un **${pc(p, 0)}**, necesitas ganar un **${pc(need)}** para volver al punto de partida.`, `La fórmula: 1 ÷ (1 − ${(p / 100).toLocaleString('es-ES')}) − 1. Por eso evitar las pérdidas grandes importa más que buscar ganancias grandes: un −50 % exige un +100 %.`].join('\n\n')
}

function doublingAnswer(q: string): string | null {
  const r = numbers(q).find(n => n.pct)?.v ?? numbers(q)[0]?.v
  if (!r || r <= 0 || r > 50) return null
  return `Con la **regla del 72**: 72 ÷ ${r.toLocaleString('es-ES')} ≈ **${(72 / r).toLocaleString('es-ES', { maximumFractionDigits: 1 })} años** para duplicar el dinero (el cálculo exacto da ${(Math.log(2) / Math.log(1 + r / 100)).toLocaleString('es-ES', { maximumFractionDigits: 1 })}).`
}

function inflationAnswer(q: string): string | null {
  const nums = numbers(q)
  const rate = nums.find(n => n.pct)?.v
  const years = after(q, /en|durante|dentro de/) ?? nums.find(n => !n.pct && n.v <= 60 && n.v >= 1)?.v
  if (!rate || !years) return null
  const amount = nums.filter(n => !n.pct && n.v !== years).sort((a, b) => b.v - a.v)[0]?.v ?? 1000
  const real = amount / (1 + rate / 100) ** years
  return [`Con una inflación del **${pc(rate)}** durante ${years} años, **${eur(amount)}** comprarán lo mismo que hoy **${eur(real)}**: pierdes un ${pc((1 - real / amount) * 100)} de poder de compra.`, `Regla rápida: 70 ÷ ${rate.toLocaleString('es-ES')} ≈ ${Math.round(70 / rate)} años para que el dinero parado compre la mitad. Por eso conviene que tu dinero rinda más que la inflación.`].join('\n\n')
}

function taxAnswer(q: string): string | null {
  const g = after(q, /gan(o|ancia|ado|e|ar)|plusvalia|beneficio de/) ?? numbers(q).filter(n => !n.pct).sort((a, b) => b.v - a.v)[0]?.v
  if (!g || g <= 0) return null
  const brackets: [number, number][] = [[6000, 19], [50000, 21], [200000, 23], [300000, 27], [Infinity, 30]]
  let left = g, prev = 0, tax = 0
  const lines: string[] = []
  for (const [top, r] of brackets) {
    const part = Math.min(left, top - prev)
    if (part <= 0) break
    tax += (part * r) / 100
    lines.push(`• ${eur(part)} al ${r} % = ${eur((part * r) / 100, 2)}`)
    left -= part
    prev = top
  }
  return [`Con la escala estatal del ahorro (2026), una ganancia de **${eur(g)}** paga unos **${eur(tax, 2)}** (un ${pc((tax / g) * 100)} efectivo):`, lines.join('\n'), 'Solo tributa cuando vendes, y puedes restar las pérdidas del año (y de los 4 siguientes). País Vasco y Navarra tienen normas propias; para tu caso concreto, consulta la Agencia Tributaria.'].join('\n\n')
}

function expectancyAnswer(q: string): string | null {
  const nums = numbers(q)
  const win = nums.find(n => n.pct)?.v
  const gain = after(q, /gano|ganancia media de|ganancia de/)
  const loss = after(q, /pierdo|perdida media de|perdida de/) ?? 1
  if (!win || !gain) return null
  const e = (win / 100) * gain - (1 - win / 100) * loss
  return [`**Esperanza matemática:** ${pc(win, 0)} × ${gain} − ${pc(100 - win, 0)} × ${loss} = **${e.toLocaleString('es-ES', { maximumFractionDigits: 2 })}R** por operación.`, e > 0 ? 'Positiva: de media ganarías. Comprueba que lo sigue siendo después de comisiones y con al menos 50–100 operaciones registradas.' : 'Negativa o nula: aunque aciertes a menudo, este sistema pierde dinero a la larga. Busca que tus aciertos valgan más que tus fallos.'].join('\n\n')
}

// ── Diccionario ──────────────────────────────────────────
const termOf = (c: Chunk) => norm(c.title.replace(/\(.+?\)/g, '').trim())
function findTerm(text: string): Chunk | null {
  const t = ` ${norm(text).replace(/[¿?¡!.,;:]/g, ' ')} `
  let best: Chunk | null = null
  let len = 0
  for (const c of GLOSSARY) {
    // El término, y sus otros nombres entre paréntesis (en el título o antes de los dos puntos: «(*revenge trading*)»)
    const head = c.text.split(': ')[0]
    const alts = [...head.matchAll(/\(([^)]+)\)/g)].flatMap(m => m[1].split(/[,/]/)).map(s => norm(s.trim().replace(/^\*+|\*+$/g, '')))
    const variants = [termOf(c), ...alts].filter(v => v.length >= 2)
    for (const v of variants) {
      const re = new RegExp(`[^a-z0-9]${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?[^a-z0-9]`)
      if (re.test(t) && v.length > len) {
        best = c
        len = v.length
      }
    }
  }
  return best
}
function defineAnswer(term: Chunk): BrainOut {
  const def = term.text.split(': ').slice(1).join(': ')
  const head = term.lesson ? lessonHead(term.lesson) : undefined
  const idea = head?.text.match(/\*\*Idea clave:\*\*\s*(.+)/)?.[1]
  const lessonTitle = head?.title.replace(/^Lección [\d.]+ · /, '')
  return {
    text: [`**${term.title}:** ${def}`, idea ? `La idea que conviene recordar: ${idea}` : null, lessonTitle ? `Lo explicamos con ejemplos en la lección «${lessonTitle}».` : null].filter(Boolean).join('\n\n'),
    found: [term, ...(head ? [head] : [])],
  }
}

// ── Análisis personales ──────────────────────────────────
const TYPE_ES: Record<string, string> = { STOCK: 'acciones', ETF: 'ETFs', CRYPTO: 'cripto', FX: 'divisas', INDEX: 'índices', COMMODITY: 'materias primas' }
function pathAnswer(c: BrainCtx): string {
  const lines = [`Llevas **${c.doneLessons} de ${c.totalLessons} lecciones** y una racha de ${c.streak} ${c.streak === 1 ? 'día' : 'días'}.`]
  if (c.mistakes > 0) lines.push(`• Tienes **${c.mistakes} preguntas falladas** esperando repaso: repasarlas es lo que más fija lo aprendido. Las encontrarás en Clases → Repasar.`)
  if (c.nextLesson) lines.push(`• Tu siguiente paso: **«${c.nextLesson.title}»** (${c.nextLesson.unit}). Unos 5 minutos.`)
  lines.push('• Y cuando quieras, la unidad **Vocabulario del inversor** se puede hacer en paralelo: diez lecciones cortas con las palabras del mercado.')
  return lines.join('\n')
}

function portfolioAnswer(c: BrainCtx): string {
  const pf = c.portfolio
  if (!pf || !pf.positions.length)
    return 'Aún no tienes posiciones en el simulador. Un buen primer paso: construye una cartera de 6–8 activos de regiones y tipos distintos (por ejemplo, ETFs amplios y alguna acción), sin que ninguno pase del 20 %. Después vuelve y la analizamos juntos.'
  const total = Number(pf.totalValue)
  const cashPct = (Number(pf.cash) / total) * 100
  const byType = pf.positions.reduce<Record<string, number>>((m, p) => ((m[p.type] = (m[p.type] ?? 0) + p.weightPct), m), {})
  const top = [...pf.positions].sort((a, b) => b.weightPct - a.weightPct)[0]
  const losers = pf.positions.filter(p => p.pnlPct <= -15)
  const noStop = c.stopsBySymbol ? pf.positions.filter(p => !c.stopsBySymbol!.has(p.symbol)).length : 0
  const pts: string[] = []
  let score = 100
  if (pf.positions.length < 4) {
    score -= 20
    pts.push(`• Tienes **${pf.positions.length} ${pf.positions.length === 1 ? 'posición' : 'posiciones'}**: con tan pocas, una mala noticia pesa mucho. Diversificar con más activos reduce el riesgo específico.`)
  }
  if (top.weightPct > 20) {
    score -= 25
    pts.push(`• **${top.name}** es el ${pc(top.weightPct, 0)} de tu cartera: por encima del 20 % recomendado por activo.`)
  }
  if ((byType.CRYPTO ?? 0) > 30) {
    score -= 15
    pts.push(`• Las cripto son el ${pc(byType.CRYPTO, 0)}: muy volátiles y suelen caer juntas.`)
  }
  if (Object.keys(byType).length === 1) {
    score -= 10
    pts.push(`• Todo es del mismo tipo (${TYPE_ES[Object.keys(byType)[0]] ?? Object.keys(byType)[0].toLowerCase()}): combinar tipos distintos suaviza la cartera.`)
  }
  if (cashPct < 3) {
    score -= 5
    pts.push('• Casi no te queda efectivo: sin liquidez no puedes rebalancear ni aprovechar caídas.')
  }
  if (cashPct > 70) pts.push(`• Tienes un ${pc(cashPct, 0)} en efectivo: está a salvo, pero parado no crece. ¿Es tu plan?`)
  if (losers.length) pts.push(`• ${losers.map(l => l.name).join(', ')} ${losers.length === 1 ? 'pierde' : 'pierden'} más de un 15 %. Pregúntate si tu tesis sigue en pie, no a cuánto compraste.`)
  if (noStop > 0 && c.stopsBySymbol) pts.push(`• ${noStop} ${noStop === 1 ? 'posición no tiene' : 'posiciones no tienen'} stop loss. Si son de largo plazo, vale; si son operaciones, decide dónde te equivocas.`)
  const verdict = score >= 85 ? 'Tu cartera está **bien repartida**.' : score >= 60 ? 'Tu cartera está **bastante bien**, con algunos puntos a mejorar.' : 'Tu cartera está **muy concentrada**: es el punto más importante a corregir.'
  return [`He mirado ${pf.positions.length === 1 ? 'tu única posición simulada' : `tus ${pf.positions.length} posiciones simuladas`} (${eur(total)} en total, ${pc(cashPct, 0)} en efectivo). ${verdict}`, pts.length ? pts.join('\n') : '• No veo concentraciones peligrosas. Mantén el reparto y rebalancea una vez al año.', 'Recuerda: es tu cartera de práctica. No te digo qué comprar, sino cómo se ve con las reglas del curso.'].join('\n\n')
}

function biasesAnswer(c: BrainCtx): string {
  const t = c.trades ?? []
  if (t.length < 3) return 'Aún tienes pocas operaciones para ver patrones. Cuando lleves unas cuantas en el simulador, revisaré si aparecen el efecto disposición, el FOMO, la venganza o el exceso de operaciones.'
  const found: string[] = []
  const week = t.filter(x => x.createdAt.getTime() > Date.now() - 7 * 86_400_000).length
  if (week >= 15) found.push(`• **Exceso de confianza / operar demasiado:** ${week} operaciones en 7 días. Los hogares que más operan ganan bastante menos que el mercado (Barber y Odean).`)
  const sells = t.filter(x => x.side === 'SELL' && x.realizedPnl !== null)
  const wins = sells.filter(x => (x.realizedPnl ?? 0) > 0).length
  const bigLosers = c.portfolio?.positions.filter(p => p.pnlPct <= -15).length ?? 0
  if (wins >= 2 && bigLosers > 0) found.push(`• **Efecto disposición:** has vendido ${wins} operaciones con ganancia y mantienes ${bigLosers} ${bigLosers === 1 ? 'posición' : 'posiciones'} perdiendo más de un 15 %. Pregúntate si las comprarías hoy.`)
  // Venganza: tras 2 ventas con pérdida el mismo día, una compra mayor que la media
  const avgBuy = t.filter(x => x.side === 'BUY').reduce((a, x, _, arr) => a + x.total / arr.length, 0)
  const byDay = new Map<string, typeof t>()
  for (const x of t) byDay.set(x.createdAt.toISOString().slice(0, 10), [...(byDay.get(x.createdAt.toISOString().slice(0, 10)) ?? []), x])
  const revenge = [...byDay.values()].some(d => {
    const sorted = [...d].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    let losses = 0
    return sorted.some(x => {
      if (x.side === 'SELL' && (x.realizedPnl ?? 0) < 0) losses++
      return x.side === 'BUY' && losses >= 2 && x.total > avgBuy * 1.5
    })
  })
  if (revenge) found.push('• **Operar por venganza:** algún día, tras dos pérdidas, hiciste una compra mucho mayor de lo habitual. Regla: después de tres pérdidas seguidas, para el día.')
  // Promediar a la baja: varias compras del mismo activo que hoy pierde
  const losingSymbols = new Set(c.portfolio?.positions.filter(p => p.pnlPct < -10).map(p => p.symbol) ?? [])
  const repeated = [...losingSymbols].filter(s => t.filter(x => x.side === 'BUY' && x.symbol === s).length >= 3)
  if (repeated.length) found.push(`• **Coste hundido:** has comprado varias veces ${repeated.join(', ')} mientras bajaba. Promediar solo tiene sentido si tu tesis sigue intacta.`)
  const crypto = c.portfolio?.positions.filter(p => p.type === 'CRYPTO').reduce((a, p) => a + p.weightPct, 0) ?? 0
  if (crypto > 40) found.push(`• **Posible FOMO:** las cripto son el ${pc(crypto, 0)} de tu cartera. Si compraste porque "todo el mundo gana", espera 48 horas antes de la próxima compra.`)
  return found.length
    ? [`He revisado tus últimas ${t.length} operaciones. Esto es lo que veo:`, found.join('\n'), 'Ponerle nombre a un sesgo es el primer paso. Escribe una regla para cada uno en tu plan y vuelve a preguntarme dentro de unas semanas.'].join('\n\n')
    : `He revisado tus últimas ${t.length} operaciones y **no veo patrones claros de sesgo**: ni exceso de operaciones, ni venganza, ni efecto disposición. Sigue llevando tu diario.`
}

// ── Respuesta general con el manual ──────────────────────
export function manualAnswer(question: string, found: Chunk[]): string {
  if (!found.length) return 'No he encontrado ese tema en el curso. Prueba con otras palabras (por ejemplo, «qué es un ETF», «cómo se lee una vela» o «cuánto arriesgo por operación»), o pregúntame un cálculo: interés compuesto, tamaño de posición, impuestos…'
  const best = found.find(c => c.module !== 'Glosario') ?? found[0]
  const head = best.lesson ? lessonHead(best.lesson) : undefined
  const idea = (head ?? best).text.match(/\*\*Idea clave:\*\*\s*(.+)/)?.[1]
  const glossary = found.find(c => c.module === 'Glosario')
  const q = new Set(tokens(question))
  const blocks = [best, ...found.filter(c => c !== best && c.module !== 'Glosario').slice(0, 1)]
    .flatMap(c => c.text.split(/\n{2,}/))
    .map(b => b.trim())
    .filter(b => b && !/^(#|\||\*\*(Objetivo|Idea clave|En el simulador|Truco de Lumi))/.test(b) && !b.endsWith(':'))
  const scored = blocks.map((b, i) => ({ b, i, s: tokens(b).filter(t => q.has(t)).length }))
  const picked = scored.filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 3).sort((a, b) => a.i - b.i)
  const chosen = (picked.length ? picked : scored.slice(0, 2)).map(x => x.b.replace(/^> /gm, '').replace(/^- /gm, '• '))
  const title = (head ?? best).title.replace(/^Lección [\d.]+ · /, '')
  return [
    idea ? `**Idea clave:** ${idea}` : null,
    glossary && !chosen.some(c => c.includes(glossary.title)) ? `**${glossary.title}.** ${glossary.text.split(': ').slice(1).join(': ')}` : null,
    ...chosen,
    `Para verlo con calma: lección «${title}».`,
  ].filter(Boolean).join('\n\n')
}

const ADVICE = (name: string) =>
  [`Eso no te lo puedo decir, ${name}: E-Trading es una simulación educativa y nadie sabe qué subirá mañana. Lo que sí puedo es enseñarte a decidirlo tú.`, 'Antes de comprar algo, comprueba:\n• ¿Entiendo cómo gana dinero?\n• ¿Está sana (deuda, caja) y tiene ventaja competitiva?\n• ¿Está cara para lo que crece?\n• ¿Encaja en mi plan y no pasa del 20 % de mi cartera?\n• ¿Sé dónde está mi stop o qué me haría vender?', 'La lista completa está en la lección «Analizar una empresa en 30 minutos». Y si lo que buscas es invertir sin elegir empresas, mira «Carteras sencillas con fondos indexados».'].join('\n\n')

/** Punto de entrada: decide qué tipo de respuesta toca y la construye */
export function think(question: string, c: BrainCtx): BrainOut {
  const q = norm(question).replace(/[¿?¡!]/g, ' ').replace(/\s+/g, ' ').trim()
  const found = () => search(`${question} ${question} ${c.lastQuestion}`, 4).map(x => x.chunk)

  if (c.mode === 'PATH') return { text: pathAnswer(c), found: [] }
  if (c.mode === 'PORTFOLIO') return { text: portfolioAnswer(c), found: [] }
  if (c.mode === 'BIASES') return { text: biasesAnswer(c), found: [] }

  if (RE.greet.test(q) && q.split(' ').length <= 4) return { text: `¡Hola, ${c.name}! Soy Lumi. Pregúntame lo que no entiendas del curso, pídeme un cálculo (interés compuesto, tamaño de posición, impuestos…) o cambia de modo para que revise tu progreso o tu cartera.${c.nextLesson ? `\n\nPor cierto: tu siguiente lección es «${c.nextLesson.title}».` : ''}`, found: [] }
  if (RE.thanks.test(q) && q.split(' ').length <= 5) return { text: `¡A ti, ${c.name}! Si te surge otra duda, aquí estoy. Recuerda: cinco minutos al día valen más que una tarde al mes.`, found: [] }
  if (RE.who.test(q)) return { text: 'Soy Lumi, tu profesora del curso. Sé todo lo que hay en el manual de E-Trading y puedo:\n• Explicarte cualquier concepto o palabra.\n• Hacer cálculos: interés compuesto, inflación, tamaño de posición, recuperar una pérdida, impuestos, esperanza de un sistema.\n• Decirte qué aprender después según tu progreso.\n• Revisar tu cartera y tus sesgos (según tu plan).\n\nLo que no hago: decirte qué comprar. Te enseño a decidirlo tú.', found: [] }
  if (RE.advice.test(q)) return { text: ADVICE(c.name), found: [] }

  // Cálculos: solo si la pregunta trae los números necesarios
  const calcs: [RegExp, (s: string) => string | null][] = [
    [RE.position, positionAnswer], [RE.expectancy, expectancyAnswer], [RE.tax, taxAnswer], [RE.inflation, inflationAnswer],
    [RE.doubling, doublingAnswer], [RE.compound, compoundAnswer], [RE.recovery, recoveryAnswer],
  ]
  if (/\d/.test(q)) for (const [re, fn] of calcs) if (re.test(q)) { const r = fn(q); if (r) return { text: r, found: [] } }

  const d = q.match(RE.diff)
  if (d) {
    const a = findTerm(d[1]), b = findTerm(d[2])
    if (a && b && a !== b) return { text: [`**${a.title}:** ${a.text.split(': ').slice(1).join(': ')}`, `**${b.title}:** ${b.text.split(': ').slice(1).join(': ')}`, 'Si quieres, pregúntame por cualquiera de los dos y te lo explico con un ejemplo.'].join('\n\n'), found: [a, b] }
  }
  const def = q.match(RE.define)
  if (def) {
    const term = findTerm(def[1])
    if (term && def[1].split(' ').length <= 6) return defineAnswer(term)
  }
  const f = found()
  return { text: manualAnswer(question, f), found: f }
}
