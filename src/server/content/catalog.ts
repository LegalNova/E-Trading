import 'server-only'
// Contenido del curso (D-016: vive en el repo). SOLO en el servidor: incluye las soluciones.
// El temario es provisional: el definitivo se prepara con Joan en la etapa 5.
import type { FeatureT, Mood, QuestionT } from '@/shared/contract'

// ── Curso «Trading desde cero» ───────────────────────────
type Step =
  | { kind: 'TEXT'; title: string; body: string; tip?: string }
  | { kind: 'IMAGE'; title: string; body: string; image: 'candles' | 'trend' | 'support'; tip?: string }
  | { kind: 'CHART'; prompt: string; caption: string; candles: [number, number, number, number][]; solution: number; ok: string; ko: string }
  | { kind: 'SIM'; title: string; body: string; task: string }

export interface ContentLesson {
  id: string
  title: string
  minutes: number
  xp: number
  steps: Step[]
  quizId: string
  isUnitReview?: boolean
}
export interface ContentUnit {
  id: string
  order: number
  title: string
  description: string
  premiumOnly: boolean
  freeLessonIds?: string[]
  unlocksFeature?: FeatureT
  lessons: ContentLesson[]
}

const soon = (title: string): Step[] => [
  { kind: 'TEXT', title, body: 'Esta lección está en preparación. En la versión final tendrá su explicación, ejemplos con datos reales y práctica en el Mercado.' },
]

export const UNITS: ContentUnit[] = [
  {
    id: 'u1', order: 1, title: 'Primeros pasos', description: 'Qué es invertir, la bolsa y el interés compuesto', premiumOnly: false,
    lessons: [
      { id: 'u1l1', title: 'Qué es invertir', minutes: 4, xp: 25, quizId: 'q-u1l1', steps: soon('Qué es invertir') },
      { id: 'u1l2', title: 'Cómo funciona la bolsa', minutes: 5, xp: 25, quizId: 'q-u1l2', steps: soon('Cómo funciona la bolsa') },
      { id: 'u1l3', title: 'Acciones, ETFs y cripto', minutes: 5, xp: 30, quizId: 'q-u1l3', steps: soon('Acciones, ETFs y cripto') },
      { id: 'u1l4', title: 'Repaso de la unidad', minutes: 6, xp: 50, quizId: 'q-u1l4', steps: soon('Repaso de la unidad'), isUnitReview: true },
    ],
  },
  {
    id: 'u2', order: 2, title: 'Leer un gráfico', description: 'Precio, tendencias, velas y soportes', premiumOnly: false,
    lessons: [
      {
        id: 'u2l1', title: 'Qué es un gráfico de precios', minutes: 4, xp: 25, quizId: 'q-u2l1',
        steps: [
          { kind: 'TEXT', title: 'El precio cuenta una historia', body: 'Un gráfico muestra cómo ha cambiado el precio de un activo con el tiempo. El eje horizontal es el tiempo y el vertical, el precio.' },
          { kind: 'TEXT', title: 'Elige la ventana de tiempo', body: 'El mismo activo puede subir en el último mes y bajar en el último año. Por eso, antes de sacar conclusiones, mira varias escalas: día, semana, mes y año.', tip: 'Mira siempre más de una escala de tiempo.' },
        ],
      },
      {
        id: 'u2l2', title: 'Tendencias: alcista y bajista', minutes: 5, xp: 25, quizId: 'q-u2l2',
        steps: [
          { kind: 'IMAGE', title: 'Máximos y mínimos', body: 'En una tendencia alcista, cada máximo y cada mínimo es más alto que el anterior. En una bajista, cada uno es más bajo.', image: 'trend' },
          { kind: 'TEXT', title: 'La tendencia lateral', body: 'Cuando el precio sube y baja sin una dirección clara, se dice que está lateral. Es habitual y no indica nada por sí solo.' },
        ],
      },
      {
        id: 'u2l3', title: 'Velas japonesas: qué cuenta cada una', minutes: 5, xp: 30, quizId: 'q-u2l3',
        steps: [
          { kind: 'IMAGE', title: 'Cada vela resume un periodo', body: 'El cuerpo va del precio de apertura al de cierre. Las mechas marcan el máximo y el mínimo que tocó.', image: 'candles', tip: 'Truco: verde, cierra más arriba de lo que abrió.' },
          { kind: 'TEXT', title: 'Las mechas cuentan la pelea', body: 'Una mecha inferior larga significa que los vendedores empujaron el precio hacia abajo durante el periodo, pero los compradores lo recuperaron antes del cierre. Esa vela se llama «martillo».' },
          {
            kind: 'CHART', prompt: 'Toca la vela con la mecha inferior más larga', caption: 'AAPL · velas diarias · marzo de 2024 (en la versión final, datos reales)',
            candles: [[171.8, 173.1, 170.6, 172.6], [172.6, 174.2, 171.9, 172.1], [172.1, 172.8, 169.4, 169.9], [169.9, 170.6, 164.1, 170.3], [170.3, 173.6, 170.0, 173.2], [173.2, 175.1, 172.8, 174.7]],
            solution: 3, ok: 'Es un «martillo»: los vendedores empujaron, pero el precio se recuperó.', ko: 'Busca la línea fina más larga por debajo del cuerpo.',
          },
        ],
      },
      {
        id: 'u2l4', title: 'Soportes y resistencias', minutes: 6, xp: 30, quizId: 'q-u2l4',
        steps: [
          { kind: 'IMAGE', title: 'Zonas donde el precio rebota', body: 'Un soporte es una zona donde el precio ha dejado de caer varias veces. Una resistencia, donde ha dejado de subir.', image: 'support' },
          { kind: 'TEXT', title: 'Zonas, no líneas exactas', body: 'No son números mágicos: son zonas donde muchos compradores o vendedores se han puesto de acuerdo. Cuando se rompen, a veces cambian de papel.' },
        ],
      },
      { id: 'u2l5', title: 'Repaso de la unidad', minutes: 8, xp: 50, quizId: 'q-u2l5', steps: [{ kind: 'TEXT', title: 'Repaso de «Leer un gráfico»', body: 'Un quiz con preguntas de toda la unidad. Si aciertas, desbloqueas la unidad 3.' }], isUnitReview: true },
    ],
  },
  {
    id: 'u3', order: 3, title: 'Gestión del riesgo', description: 'Diversificar, tamaño de posición y stop loss', premiumOnly: true, freeLessonIds: ['u3l3'], unlocksFeature: 'STOP_LOSS',
    lessons: [
      { id: 'u3l1', title: 'Por qué diversificar', minutes: 5, xp: 30, quizId: 'q-u3l1', steps: soon('Por qué diversificar') },
      { id: 'u3l2', title: 'Cuánto poner en cada operación', minutes: 5, xp: 30, quizId: 'q-u3l2', steps: soon('Cuánto poner en cada operación') },
      { id: 'u3l3', title: 'Stop loss y take profit', minutes: 6, xp: 40, quizId: 'q-u3l3', steps: [...soon('Stop loss y take profit'), { kind: 'SIM', title: 'Practica en el Mercado', body: 'Al aprobar esta lección se desbloquean las órdenes límite, stop loss y take profit.', task: 'Compra cualquier activo con un stop loss.' }] },
    ],
  },
  { id: 'u4', order: 4, title: 'Psicología del inversor', description: 'Sesgos, miedo y FOMO', premiumOnly: true, lessons: [] },
  { id: 'u5', order: 5, title: 'Invertir a largo plazo', description: 'ETFs, DCA y fiscalidad básica', premiumOnly: true, lessons: [] },
  { id: 'u6', order: 6, title: 'Cripto y otros mercados', description: 'Volatilidad, custodia y divisas', premiumOnly: true, lessons: [] },
]

export const LESSON = Object.fromEntries(UNITS.flatMap(u => u.lessons.map(l => [l.id, { ...l, unit: u }]))) as Record<string, ContentLesson & { unit: ContentUnit }>

// ── Preguntas (con solución: en la etapa 3 solo existirá en el servidor) ──
export interface ContentQuestion extends QuestionT {
  solution: number | number[] | string
  explanation: string
}

const generic = (topic: string): ContentQuestion[] => [
  { id: `${topic}-1`, type: 'TRUE_FALSE', prompt: 'Invertir siempre implica algún riesgo.', options: ['Verdadero', 'Falso'], solution: 0, explanation: 'Toda inversión puede bajar. Por eso se aprende a gestionar el riesgo.' },
  { id: `${topic}-2`, type: 'SINGLE', prompt: '¿Qué es diversificar?', options: ['Poner todo en una empresa', 'Repartir el dinero entre distintos activos', 'Vender en cuanto algo baja'], solution: 1, explanation: 'Repartir reduce el impacto de que una sola inversión salga mal.' },
  { id: `${topic}-3`, type: 'SINGLE', prompt: 'Si una acción cae un 50 %, ¿cuánto tiene que subir para volver al precio inicial?', options: ['50 %', '100 %', '150 %'], solution: 1, explanation: 'De 100 a 50 hay que doblar: +100 %.' },
]

const TREND_DOWN = [100, 103, 98, 101, 94, 97, 90, 92, 86, 88, 82, 84, 78]

export const QUIZZES: Record<string, ContentQuestion[]> = {
  'q-u2l3': [
    { id: 'u2l3-1', type: 'SINGLE', prompt: '¿Qué indica una vela con cuerpo muy pequeño y mechas largas?', options: ['Una subida fuerte', 'Una bajada fuerte', 'Indecisión entre compradores y vendedores', 'Que el mercado está cerrado'], solution: 2, explanation: 'Ni compradores ni vendedores ganaron el periodo.' },
    { id: 'u2l3-2', type: 'CHART_TREND', prompt: '¿Qué tendencia tiene BTC en este periodo?', options: ['Alcista', 'Bajista', 'Lateral'], chart: TREND_DOWN, solution: 1, explanation: 'Máximos y mínimos cada vez más bajos: tendencia bajista.' },
    { id: 'u2l3-3', type: 'TRUE_FALSE', prompt: 'Una vela verde cierra por encima del precio al que abrió.', options: ['Verdadero', 'Falso'], solution: 0, explanation: 'Verde significa que el cierre quedó por encima de la apertura.' },
    { id: 'u2l3-4', type: 'MULTIPLE', prompt: '¿Qué datos muestra una vela? Marca todos los correctos.', options: ['Apertura', 'Cierre', 'Máximo y mínimo', 'Número de empresas'], solution: [0, 1, 2], explanation: 'Apertura, cierre, máximo y mínimo: por eso se llaman velas OHLC.' },
    { id: 'u2l3-5', type: 'ORDER', prompt: 'Ordena de menor a mayor un periodo con vela verde: mínimo, apertura, cierre, máximo.', options: ['Cierre', 'Mínimo', 'Máximo', 'Apertura'], solution: [1, 3, 0, 2], explanation: 'En una vela verde: mínimo ≤ apertura < cierre ≤ máximo.' },
    { id: 'u2l3-6', type: 'FILL_BLANK', prompt: 'La vela con una mecha inferior larga y cuerpo pequeño arriba se llama ____.', options: ['martillo', 'doji', 'envolvente'], solution: 'martillo', explanation: 'El martillo aparece cuando los compradores recuperan una fuerte caída.' },
    { id: 'u2l3-7', type: 'CHART_POINT', prompt: 'Toca el punto más bajo del gráfico.', options: [], chart: TREND_DOWN, solution: 12, explanation: 'El mínimo del periodo está al final: el precio no ha dejado de caer.' },
  ],
  'q-u2l1': generic('u2l1'),
  'q-u2l2': [
    { id: 'u2l2-1', type: 'CHART_TREND', prompt: '¿Qué tendencia ves?', options: ['Alcista', 'Bajista', 'Lateral'], chart: [80, 84, 82, 88, 86, 92, 90, 97, 95, 101], solution: 0, explanation: 'Máximos y mínimos cada vez más altos.' },
    ...generic('u2l2'),
  ],
  'q-u2l4': generic('u2l4'),
  'q-u2l5': generic('u2l5'),
  'q-u1l1': generic('u1l1'),
  'q-u1l2': generic('u1l2'),
  'q-u1l3': generic('u1l3'),
  'q-u1l4': generic('u1l4'),
  'q-u3l1': generic('u3l1'),
  'q-u3l2': generic('u3l2'),
  'q-u3l3': generic('u3l3'),
}

export const PLACEMENT: ContentQuestion[] = [
  { id: 'p1', type: 'SINGLE', prompt: '¿Qué es una acción?', options: ['Un préstamo a una empresa', 'Una pequeña parte de una empresa', 'Un depósito en el banco', 'No lo sé'], solution: 1, explanation: '' },
  { id: 'p2', type: 'SINGLE', prompt: '¿Qué es un ETF?', options: ['Un fondo que cotiza en bolsa y reúne muchas empresas', 'Una criptomoneda', 'Un tipo de cuenta bancaria', 'No lo sé'], solution: 0, explanation: '' },
  { id: 'p3', type: 'SINGLE', prompt: 'Si una acción cae un 50 %, ¿cuánto tiene que subir para recuperar el precio inicial?', options: ['50 %', '100 %', '150 %', 'No lo sé'], solution: 1, explanation: '' },
  { id: 'p4', type: 'TRUE_FALSE', prompt: 'Con inflación, el dinero parado pierde poder de compra.', options: ['Verdadero', 'Falso'], solution: 0, explanation: '' },
  { id: 'p5', type: 'SINGLE', prompt: '¿Qué mide el S&P 500?', options: ['Las 500 mayores empresas de EE. UU.', 'Las 500 más rentables del mundo', 'El precio del oro', 'No lo sé'], solution: 0, explanation: '' },
  { id: 'p6', type: 'CHART_TREND', prompt: '¿Qué tendencia tiene este gráfico?', options: ['Alcista', 'Bajista', 'Lateral'], chart: TREND_DOWN, solution: 1, explanation: '' },
  { id: 'p7', type: 'SINGLE', prompt: '¿Qué indica una vela verde?', options: ['Que cerró por encima de su apertura', 'Que cerró por debajo de su apertura', 'Que hubo mucho volumen', 'No lo sé'], solution: 0, explanation: '' },
  { id: 'p8', type: 'SINGLE', prompt: '¿Qué es un soporte?', options: ['Una zona donde el precio suele dejar de caer', 'Un impuesto', 'Un tipo de orden', 'No lo sé'], solution: 0, explanation: '' },
]

// ── Logros (32) ──────────────────────────────────────────
export interface ContentAchievement { code: string; title: string; description: string; icon: string; category: 'LEARNING' | 'TRADING' | 'STREAK'; target: number; gems: number; xp: number }
export const ACHIEVEMENTS: ContentAchievement[] = [
  { code: 'FIRST_LESSON', title: 'Primera lección', description: 'Completa tu primera lección', icon: '1', category: 'LEARNING', target: 1, gems: 20, xp: 10 },
  { code: 'LESSONS_5', title: 'Cinco lecciones', description: 'Completa 5 lecciones', icon: '5', category: 'LEARNING', target: 5, gems: 20, xp: 20 },
  { code: 'LESSONS_20', title: 'Veinte lecciones', description: 'Completa 20 lecciones', icon: '20', category: 'LEARNING', target: 20, gems: 40, xp: 50 },
  { code: 'QUIZ_PERFECT', title: 'Quiz perfecto', description: 'Acierta todas las preguntas de un quiz', icon: '★', category: 'LEARNING', target: 1, gems: 20, xp: 10 },
  { code: 'QUIZ_PERFECT_5', title: 'Cinco perfectos', description: 'Consigue 5 quizzes perfectos', icon: '★5', category: 'LEARNING', target: 5, gems: 40, xp: 30 },
  { code: 'UNIT_1', title: 'Primeros pasos', description: 'Completa la Unidad 1', icon: 'U1', category: 'LEARNING', target: 1, gems: 30, xp: 30 },
  { code: 'UNIT_2', title: 'Lector de gráficos', description: 'Completa la Unidad 2', icon: 'U2', category: 'LEARNING', target: 5, gems: 30, xp: 30 },
  { code: 'UNIT_3', title: 'Gestor de riesgo', description: 'Completa la Unidad 3', icon: 'U3', category: 'LEARNING', target: 3, gems: 40, xp: 40 },
  { code: 'PLACEMENT', title: 'Punto de partida', description: 'Haz el test de nivel', icon: '?', category: 'LEARNING', target: 1, gems: 10, xp: 10 },
  { code: 'REVIEW_10', title: 'Aprender de los fallos', description: 'Repasa 10 preguntas falladas', icon: '↺', category: 'LEARNING', target: 10, gems: 20, xp: 20 },
  { code: 'SPEED', title: 'Rápido y certero', description: 'Termina un quiz perfecto en menos de 1 minuto', icon: '⚡', category: 'LEARNING', target: 1, gems: 20, xp: 20 },
  { code: 'FIRST_TRADE', title: 'Primera operación', description: 'Haz tu primera compra en el Mercado', icon: '1', category: 'TRADING', target: 1, gems: 20, xp: 10 },
  { code: 'TRADES_10', title: 'Diez operaciones', description: 'Ejecuta 10 operaciones', icon: '10', category: 'TRADING', target: 10, gems: 20, xp: 20 },
  { code: 'TRADES_50', title: 'Cincuenta operaciones', description: 'Ejecuta 50 operaciones', icon: '50', category: 'TRADING', target: 50, gems: 40, xp: 40 },
  { code: 'DIVERSIFY_3', title: 'Diversifica en 3 tipos', description: 'Ten activos de 3 tipos distintos a la vez', icon: '3', category: 'TRADING', target: 3, gems: 30, xp: 20 },
  { code: 'DIVERSIFY_5', title: 'Cartera variada', description: 'Ten 5 activos distintos a la vez', icon: '5', category: 'TRADING', target: 5, gems: 30, xp: 20 },
  { code: 'FIRST_STOP', title: 'Primer stop loss', description: 'Pon tu primer stop loss', icon: 'SL', category: 'TRADING', target: 1, gems: 30, xp: 20 },
  { code: 'FIRST_TP', title: 'Primer take profit', description: 'Pon tu primer take profit', icon: 'TP', category: 'TRADING', target: 1, gems: 30, xp: 20 },
  { code: 'FIRST_LIMIT', title: 'Primera orden límite', description: 'Pon tu primera orden límite', icon: 'L', category: 'TRADING', target: 1, gems: 20, xp: 20 },
  { code: 'WEEK_POSITIVE', title: 'Una semana en positivo', description: 'Acaba una semana con la cartera en positivo', icon: '+', category: 'TRADING', target: 1, gems: 30, xp: 20 },
  { code: 'CALM_RISK', title: 'Sangre fría', description: 'Haz caso al aviso de riesgo de Lumi 3 veces', icon: '◎', category: 'TRADING', target: 3, gems: 30, xp: 20 },
  { code: 'FIRST_ALERT', title: 'Vigilante', description: 'Crea tu primera alerta de precio', icon: '!', category: 'TRADING', target: 1, gems: 10, xp: 10 },
  { code: 'CRYPTO_FIRST', title: 'Primer paso en cripto', description: 'Compra tu primera criptomoneda', icon: '₿', category: 'TRADING', target: 1, gems: 10, xp: 10 },
  { code: 'ETF_FIRST', title: 'Primer ETF', description: 'Compra tu primer ETF', icon: 'E', category: 'TRADING', target: 1, gems: 10, xp: 10 },
  { code: 'STREAK_3', title: 'Racha de 3 días', description: 'Entra 3 días seguidos', icon: '3', category: 'STREAK', target: 3, gems: 20, xp: 10 },
  { code: 'STREAK_7', title: 'Racha de 7 días', description: 'Entra 7 días seguidos', icon: '7', category: 'STREAK', target: 7, gems: 50, xp: 20 },
  { code: 'STREAK_30', title: 'Racha de 30 días', description: 'Entra 30 días seguidos', icon: '30', category: 'STREAK', target: 30, gems: 100, xp: 50 },
  { code: 'STREAK_100', title: 'Racha de 100 días', description: 'Entra 100 días seguidos', icon: '100', category: 'STREAK', target: 100, gems: 200, xp: 100 },
  { code: 'FREEZE_USED', title: 'Salvavidas', description: 'Un protector salvó tu racha', icon: '❄', category: 'STREAK', target: 1, gems: 10, xp: 10 },
  { code: 'GOALS_7', title: 'Constancia', description: 'Cumple los 3 objetivos diarios 7 días', icon: '✓', category: 'STREAK', target: 7, gems: 40, xp: 30 },
  { code: 'LEAGUE_UP', title: 'Ascenso', description: 'Sube de división en la liga', icon: '▲', category: 'STREAK', target: 1, gems: 30, xp: 20 },
  { code: 'LEAGUE_TOP3', title: 'Podio', description: 'Termina una semana entre los 3 primeros', icon: '3', category: 'STREAK', target: 1, gems: 50, xp: 30 },
]

// ── Títulos de nivel (femenino, masculino, neutro) ───────
export const LEVEL_TITLES: Record<number, { F: string; M: string; N: string }> = {
  1: { F: 'Principiante', M: 'Principiante', N: 'Principiante' },
  2: { F: 'Aficionada', M: 'Aficionado', N: 'Con base' },
  3: { F: 'Aprendiz', M: 'Aprendiz', N: 'Aprendiz' },
  4: { F: 'Analista', M: 'Analista', N: 'Analista' },
  5: { F: 'Inversora', M: 'Inversor', N: 'Con criterio' },
  6: { F: 'Estratega', M: 'Estratega', N: 'Estratega' },
  7: { F: 'Experta', M: 'Experto', N: 'Con experiencia' },
  8: { F: 'Maestra', M: 'Maestro', N: 'Con maestría' },
}

// ── Frases de Lumi por evento ────────────────────────────
export const LUMI: Record<string, { mood: Mood; lines: string[] }> = {
  HOME_STREAK: { mood: 'HAPPY', lines: ['¡{dias} días seguidos, {nombre}! Una clase más y sigues sumando.', '¡Vas por {dias} días, {nombre}! Cinco minutos bastan hoy.'] },
  HOME_DONE: { mood: 'CELEBRATE', lines: ['¡Hoy ya cuenta, {nombre}! Mañana más.', 'Racha a salvo. Buen trabajo, {nombre}.'] },
  HOME_NEW: { mood: 'HAPPY', lines: ['Hola, {nombre}. Empezamos con algo corto: cinco minutos.'] },
  LESSON_COMPLETED: { mood: 'HAPPY', lines: ['¡Hecho, {nombre}! Ya sabes un poco más de {concepto}.', 'Lección terminada. Ahora pruébalo en el Mercado.'] },
  QUIZ_PERFECT: { mood: 'CELEBRATE', lines: ['¡Quiz perfecto! Eso es entenderlo de verdad.', '¡Todas bien, {nombre}! Así se aprende.'] },
  QUIZ_WRONG: { mood: 'CALM', lines: ['Casi. Lee la explicación con calma: así se aprende.', 'No pasa nada. Fallar es parte de aprender.'] },
  FIRST_TRADE: { mood: 'HAPPY', lines: ['¡Tu primera operación, {nombre}! Ahora deja que se mueva sin mirarla cada minuto.'] },
  TRADE_DONE: { mood: 'HAPPY', lines: ['Hecho. Recuerda: mirar el precio cada minuto no lo cambia.', 'Orden ejecutada. ¿Sabes por qué la has hecho? Esa es la clave.'] },
  RISKY_TRADE: { mood: 'WORRIED', lines: ['Espera, {nombre}. {activo} sería el {porcentaje} de tu cartera. Si cae un 10 %, perderías unos {perdida}. Repartir entre varios activos reduce ese golpe.'] },
  STREAK_AT_RISK: { mood: 'WORRIED', lines: ['Tu racha de {dias} días está en peligro. Una clase de 5 minutos basta.'] },
  NO_LIVES: { mood: 'SAD', lines: ['Te has quedado sin vidas. Descansa un poco: mientras, puedes repasar o practicar en el Mercado.'] },
  INACTIVITY: { mood: 'SLEEPY', lines: ['Te echaba de menos. ¿Cinco minutos para ponernos al día?'] },
  PORTFOLIO_ANALYSIS: { mood: 'THINKING', lines: ['Tus operaciones grandes suelen ser los lunes. ¿Repasamos «Psicología del inversor»?'] },
}

// ── Liga: sin jugadores de ejemplo (D-019) ──────────────
export const DIVISIONS = ['Novato', 'Aprendiz', 'Analista', 'Estratega', 'Experto']
