import 'server-only'
// Aplica las traducciones del curso (v2/i18n/<idioma>/*.json) sobre el contenido en español.
// Las soluciones son posiciones y no cambian; en «rellenar huecos» la respuesta pasa a ser la opción traducida.
import type { Loc } from '../locale'
import type { ContentQuestion, Step } from './dsl'
import type { QuestionText, StepText, UnitText } from './i18n'
import { ACHIEVEMENT_TEXTS, TEXTS } from './v2/i18n'

const idx = (loc: 'ca' | 'en') => {
  const units = TEXTS[loc]
  const q: Record<string, QuestionText> = {}
  const l: Record<string, { title: string; steps: StepText[] }> = {}
  for (const u of Object.values(units)) {
    Object.assign(q, u.questions)
    Object.assign(l, u.lessons)
  }
  return { units, q, l }
}
const IDX = { ca: idx('ca'), en: idx('en') }
const of = (loc: Loc) => (loc === 'es' ? null : IDX[loc])

/** «10.000 €» y «7 %» no se parten en dos líneas (igual que en el español) */
const nb = (t: string) => t.replace(/(\d) (€|%|\$)/g, '$1 $2')

export function unitT(loc: Loc, unitId: string): UnitText['unit'] | undefined {
  return of(loc)?.units[unitId]?.unit
}

export function lessonTitleT(loc: Loc, lessonId: string, fallback: string) {
  return of(loc)?.l[lessonId]?.title ?? fallback
}

/** Pasos de teoría traducidos (si falta la traducción de alguno, queda en español) */
export function stepsT(loc: Loc, lessonId: string, steps: Step[]): Step[] {
  const t = of(loc)?.l[lessonId]?.steps
  if (!t?.length) return steps
  return steps.map((s, i) => {
    const x = t[i]
    if (!x) return s
    if (s.kind === 'CHART') return { ...s, prompt: x.prompt ?? s.prompt, ok: x.ok ?? s.ok, ko: x.ko ?? s.ko, caption: captionT(loc, s.caption) }
    if (s.kind === 'TEXT') return { ...s, title: x.title ?? s.title, body: nb(x.body ?? s.body), key: x.key ?? s.key, tip: x.tip ?? s.tip }
    if (s.kind === 'CALC' || s.kind === 'IMAGE') return { ...s, title: x.title ?? s.title, body: nb(x.body ?? s.body), tip: x.tip ?? s.tip }
    if (s.kind === 'SIM') return { ...s, title: x.title ?? s.title, body: nb(x.body ?? s.body) }
    return s
  })
}

export function questionT(loc: Loc, q: ContentQuestion): ContentQuestion {
  if (loc !== 'es' && /^p\d+$/.test(q.id)) return placementT(loc, q)
  const t = of(loc)?.q[q.id]
  if (!t || t.options.length !== q.options.length) return q
  const solution = q.type === 'FILL_BLANK' && typeof q.solution === 'string' ? (t.options[q.options.indexOf(q.solution)] ?? q.solution) : q.solution
  return {
    ...q,
    prompt: nb(t.prompt),
    options: t.options.map(nb),
    explanation: nb(t.explanation),
    solution,
    right: t.right?.map(nb) ?? q.right,
    feedback: t.feedback?.map(nb) ?? q.feedback,
    meta: q.meta ? { ...q.meta, lines: t.lines ?? q.meta.lines, senders: t.senders ?? q.meta.senders, unit: t.unit ?? q.meta.unit, horizon: t.horizon ?? q.meta.horizon, kinds: t.kinds ?? q.meta.kinds } : q.meta,
    kindsEs: t.kinds && q.meta?.kinds ? q.meta.kinds : q.kindsEs,
    hidden: q.hidden ? { ...q.hidden, caption: captionT(loc, q.hidden.caption) } : q.hidden,
  }
}

export function achievementT(loc: Loc, code: string): { title: string; description: string } | undefined {
  return loc === 'es' ? undefined : ACHIEVEMENT_TEXTS[loc][code]
}

// ── Pies de los gráficos reales («Apple · velas diarias · julio–septiembre de 2026») ──
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MONTHS: Record<'ca' | 'en', string[]> = {
  ca: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const WORDS: Record<'ca' | 'en', [RegExp, string][]> = {
  ca: [[/velas diarias/g, 'espelmes diàries'], [/cierres cada 3 sesiones/g, 'tancaments cada 3 sessions'], [/cierres diarios/g, 'tancaments diaris'], [/cierres semanales/g, 'tancaments setmanals'], [/cierres mensuales/g, 'tancaments mensuals'], [/hasta el/g, 'fins al'], [/Oro/g, 'Or'], [/Plata/g, 'Plata'], [/Petróleo/g, 'Petroli'], [/Bonos del Tesoro a 20\+ años \(ETF\)/g, 'Bons del Tresor a 20+ anys (ETF)']],
  en: [[/velas diarias/g, 'daily candles'], [/cierres cada 3 sesiones/g, 'closes every 3 sessions'], [/cierres diarios/g, 'daily closes'], [/cierres semanales/g, 'weekly closes'], [/cierres mensuales/g, 'monthly closes'], [/hasta el/g, 'up to'], [/Oro/g, 'Gold'], [/Plata/g, 'Silver'], [/Petróleo WTI/g, 'WTI crude oil'], [/Bonos del Tesoro a 20\+ años \(ETF\)/g, '20+ year US Treasury bonds (ETF)']],
}
export function captionT(loc: Loc, caption: string): string {
  if (loc === 'es') return caption
  let c = caption
  for (const [re, to] of WORDS[loc]) c = c.replace(re, to)
  // «julio–septiembre de 2026», «marzo de 2024»
  c = c.replace(new RegExp(`\\b(${MONTHS_ES.join('|')})\\b`, 'g'), m => MONTHS[loc][MONTHS_ES.indexOf(m)])
  return loc === 'en' ? c.replace(/ de (\d{4})/g, ' $1') : c.replace(/ de (\d{4})/g, ' de $1').replace(/\bde (abril|agost|octubre)/g, "d'$1")
}

// ── Textos fijos que genera el motor (paso del quiz, introducción de repasos y retos finales) ──
const ENGINE = {
  es: {
    quizTitle: 'Hora del quiz', quizBody: (n: number) => `${n} preguntas para comprobar lo que has aprendido. Cada fallo cuesta una vida.`,
    review: (u: string, ls: string) => ({ title: `Repaso de «${u}»`, body: `Un quiz con preguntas de toda la unidad: ${ls}.\n\nSi fallas alguna, irá a tu lista de repaso para que la practiques más adelante.`, tip: 'Lee bien cada explicación al responder: así se fija lo aprendido.' }),
    boss: (t: string) => ({ title: t, body: '12 preguntas mezcladas de toda la sección. Para superarlo necesitas acertar el 80 %.\n\nSi no llegas, repasa los fallos y vuelve a intentarlo: no pierdes nada.', tip: 'Tómate tu tiempo: aquí no hay prisa, hay que demostrar que lo dominas.' }),
    course: 'De cero a inversor',
  },
  ca: {
    quizTitle: 'Hora del quiz', quizBody: (n: number) => `${n} preguntes per comprovar el que has après. Cada error costa una vida.`,
    review: (u: string, ls: string) => ({ title: `Repàs de «${u}»`, body: `Un quiz amb preguntes de tota la unitat: ${ls}.\n\nSi en falles alguna, anirà a la teva llista de repàs perquè la practiquis més endavant.`, tip: 'Llegeix bé cada explicació en respondre: així es fixa el que has après.' }),
    boss: (t: string) => ({ title: t, body: '12 preguntes barrejades de tota la secció. Per superar-lo has d’encertar el 80 %.\n\nSi no hi arribes, repassa els errors i torna-ho a provar: no perds res.', tip: 'Pren-te el teu temps: aquí no hi ha pressa, has de demostrar que ho domines.' }),
    course: 'De zero a inversor',
  },
  en: {
    quizTitle: 'Quiz time', quizBody: (n: number) => `${n} questions to check what you’ve learnt. Each mistake costs a life.`,
    review: (u: string, ls: string) => ({ title: `Review: “${u}”`, body: `A quiz with questions from the whole unit: ${ls}.\n\nIf you get any wrong, they’ll go to your review list so you can practise them later.`, tip: 'Read each explanation carefully as you answer: that’s how it sticks.' }),
    boss: (t: string) => ({ title: t, body: '12 mixed questions from the whole section. To pass you need 80 % right.\n\nIf you don’t make it, review your mistakes and try again: you lose nothing.', tip: 'Take your time: there’s no rush here, you need to show you’ve mastered it.' }),
    course: 'From zero to investor',
  },
} satisfies Record<Loc, unknown>
export const engineT = (loc: Loc) => ENGINE[loc]

// ── Test de nivel (catalog.ts): frase a frase, porque sus opciones van barajadas ──
const PLACEMENT: Record<'ca' | 'en', Record<string, string>> = {
  ca: {
    '¿Qué es una acción?': 'Què és una acció?', 'Un préstamo a una empresa': 'Un préstec a una empresa', 'Una pequeña parte de una empresa': 'Una petita part d’una empresa', 'Un depósito en el banco': 'Un dipòsit al banc', 'No lo sé': 'No ho sé',
    '¿Qué es un ETF?': 'Què és un ETF?', 'Un fondo que cotiza en bolsa y reúne muchas empresas': 'Un fons que cotitza en borsa i agrupa moltes empreses', 'Una criptomoneda': 'Una criptomoneda', 'Un tipo de cuenta bancaria': 'Un tipus de compte bancari',
    'Si una acción cae un 50 %, ¿cuánto tiene que subir para recuperar el precio inicial?': 'Si una acció cau un 50 %, quant ha de pujar per recuperar el preu inicial?',
    'Con inflación, el dinero parado pierde poder de compra.': 'Amb inflació, els diners aturats perden poder de compra.', Verdadero: 'Vertader', Falso: 'Fals',
    '¿Qué mide el S&P 500?': 'Què mesura l’S&P 500?', 'Las 500 mayores empresas de EE. UU.': 'Les 500 empreses més grans dels EUA', 'Las 500 más rentables del mundo': 'Les 500 més rendibles del món', 'El precio del oro': 'El preu de l’or',
    '¿Qué tendencia tiene este gráfico?': 'Quina tendència té aquest gràfic?', Alcista: 'Alcista', Bajista: 'Baixista', Lateral: 'Lateral',
    'Si los tipos de interés suben, el precio de los bonos que ya existen…': 'Si els tipus d’interès pugen, el preu dels bons que ja existeixen…', Sube: 'Puja', Baja: 'Baixa', 'No cambia': 'No canvia',
    '¿Qué es diversificar?': 'Què és diversificar?', 'Poner todo en la empresa que más sube': 'Posar-ho tot a l’empresa que més puja', 'Repartir el dinero entre muchos activos distintos': 'Repartir els diners entre molts actius diferents', 'Vender cuando algo baja': 'Vendre quan alguna cosa baixa',
  },
  en: {
    '¿Qué es una acción?': 'What is a share?', 'Un préstamo a una empresa': 'A loan to a company', 'Una pequeña parte de una empresa': 'A small part of a company', 'Un depósito en el banco': 'A bank deposit', 'No lo sé': 'I don’t know',
    '¿Qué es un ETF?': 'What is an ETF?', 'Un fondo que cotiza en bolsa y reúne muchas empresas': 'A fund that trades on the stock exchange and holds many companies', 'Una criptomoneda': 'A cryptocurrency', 'Un tipo de cuenta bancaria': 'A type of bank account',
    'Si una acción cae un 50 %, ¿cuánto tiene que subir para recuperar el precio inicial?': 'If a share falls 50 %, how much does it have to rise to get back to the starting price?',
    'Con inflación, el dinero parado pierde poder de compra.': 'With inflation, money sitting idle loses purchasing power.', Verdadero: 'True', Falso: 'False',
    '¿Qué mide el S&P 500?': 'What does the S&P 500 measure?', 'Las 500 mayores empresas de EE. UU.': 'The 500 largest US companies', 'Las 500 más rentables del mundo': 'The 500 most profitable companies in the world', 'El precio del oro': 'The price of gold',
    '¿Qué tendencia tiene este gráfico?': 'What trend does this chart show?', Alcista: 'Uptrend', Bajista: 'Downtrend', Lateral: 'Sideways',
    'Si los tipos de interés suben, el precio de los bonos que ya existen…': 'If interest rates rise, the price of existing bonds…', Sube: 'Rises', Baja: 'Falls', 'No cambia': 'Doesn’t change',
    '¿Qué es diversificar?': 'What is diversifying?', 'Poner todo en la empresa que más sube': 'Putting everything in the company that rises most', 'Repartir el dinero entre muchos activos distintos': 'Spreading your money across many different assets', 'Vender cuando algo baja': 'Selling when something falls',
  },
}
function placementT(loc: 'ca' | 'en', q: ContentQuestion): ContentQuestion {
  const d = PLACEMENT[loc]
  const tr = (x: string) => d[x.replace(/\u00a0/g, ' ')] ?? x
  // «¿Qué tendencia…? (Apple · cierres diarios · …)»: la pregunta y el pie del gráfico por separado
  const m = q.prompt.match(/^(.*?)( \(.*\))$/)
  const prompt = m && d[m[1]] ? `${d[m[1]]} ${captionT(loc, m[2].trim())}` : tr(q.prompt)
  return { ...q, prompt: nb(prompt), options: q.options.map(o => nb(tr(o))) }
}
