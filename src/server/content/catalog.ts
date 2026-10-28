import 'server-only'
// Contenido del curso (D-016: vive en el repo). SOLO en el servidor: incluye las soluciones.
import type { Mood } from '@/shared/contract'

// ── Curso «De cero a inversor» (docs/curso-v2): secciones → unidades → clases, con retos finales ──
import { QUIZZES as Q, single, tf, trend, type ContentLesson, type ContentQuestion, type ContentUnit } from './dsl'
import { V2_UNITS } from './v2'
import { LEGACY_TO_V2 } from './v2/legacy-map'

export type { ContentLesson, ContentQuestion, ContentUnit }
// Curso v2 (docs/curso-v2): 13 secciones, 225 clases y el vocabulario aparte
export const UNITS: ContentUnit[] = V2_UNITS
export const QUIZZES = Q
export const LESSON = Object.fromEntries(UNITS.flatMap(u => u.lessons.map(l => [l.id, { ...l, unit: u }]))) as Record<string, ContentLesson & { unit: ContentUnit }>
/** Minutos estimados del curso: pasos de cada lección + unos 25 s por pregunta de quiz */
export const SECONDS_PER_QUESTION = 25
export const lessonMinutes = (l: ContentLesson) => l.minutes + ((QUIZZES[l.quizId]?.length ?? 0) * SECONDS_PER_QUESTION) / 60
export const courseMinutes = () => Math.round(UNITS.flatMap(u => u.lessons).reduce((a, l) => a + lessonMinutes(l), 0))
const V2 = UNITS.some(u => u.section)
/** Lección cuyo aprobado desbloquea las órdenes límite, stop loss y take profit */
export const RISK_LESSON = V2 ? 'u6l4' : 'u10l3'
/** Enlace a una lección escrito con los ids del curso anterior (avisos de Lumi): en el curso v2, su equivalente */
export const lessonRef = (id: string | null) => (id && V2 ? (LEGACY_TO_V2[id] ?? id) : id)

// Test de nivel: 8 preguntas de las unidades 1 y 2. Con 5 o más aciertos se salta la unidad 1.
const P = [
  single('¿Qué es una acción?', ['Un préstamo a una empresa', 'Una pequeña parte de una empresa', 'Un depósito en el banco', 'No lo sé'], 1, ''),
  single('¿Qué es un ETF?', ['Un fondo que cotiza en bolsa y reúne muchas empresas', 'Una criptomoneda', 'Un tipo de cuenta bancaria', 'No lo sé'], 0, ''),
  single('Si una acción cae un 50 %, ¿cuánto tiene que subir para recuperar el precio inicial?', ['50 %', '100 %', '150 %', 'No lo sé'], 1, ''),
  tf('Con inflación, el dinero parado pierde poder de compra.', true, ''),
  single('¿Qué mide el S&P 500?', ['Las 500 mayores empresas de EE. UU.', 'Las 500 más rentables del mundo', 'El precio del oro', 'No lo sé'], 0, ''),
  trend('¿Qué tendencia tiene este gráfico?', 'trend-down-2', 'Bajista', ''),
  single('Si los tipos de interés suben, el precio de los bonos que ya existen…', ['Sube', 'Baja', 'No cambia', 'No lo sé'], 1, ''),
  single('¿Qué es diversificar?', ['Poner todo en la empresa que más sube', 'Repartir el dinero entre muchos activos distintos', 'Vender cuando algo baja', 'No lo sé'], 1, ''),
]
export const PLACEMENT: ContentQuestion[] = P.map((q, i) => ({ ...q, id: `p${i + 1}` }))

// ── Insignias (43) ──────────────────────────────────────────
export interface ContentAchievement { code: string; title: string; description: string; icon: string; category: 'LEARNING' | 'TRADING' | 'STREAK'; target: number; gems: number; xp: number }
export const ACHIEVEMENTS: ContentAchievement[] = [
  { code: 'FIRST_LESSON', title: 'Primera lección', description: 'Completa tu primera lección', icon: '1', category: 'LEARNING', target: 1, gems: 20, xp: 10 },
  { code: 'LESSONS_5', title: 'Cinco lecciones', description: 'Completa 5 lecciones', icon: '5', category: 'LEARNING', target: 5, gems: 20, xp: 20 },
  { code: 'LESSONS_20', title: 'Veinte lecciones', description: 'Completa 20 lecciones', icon: '20', category: 'LEARNING', target: 20, gems: 40, xp: 50 },
  { code: 'QUIZ_PERFECT', title: 'Quiz perfecto', description: 'Acierta todas las preguntas de un quiz', icon: '★', category: 'LEARNING', target: 1, gems: 20, xp: 10 },
  { code: 'QUIZ_PERFECT_5', title: 'Cinco perfectos', description: 'Consigue 5 quizzes perfectos', icon: '★5', category: 'LEARNING', target: 5, gems: 40, xp: 30 },
  { code: 'LESSONS_50', title: 'Cincuenta lecciones', description: 'Completa 50 lecciones', icon: '50', category: 'LEARNING', target: 50, gems: 60, xp: 80 },
  { code: 'UNIT_1', title: 'Primeros pasos', description: 'Completa la unidad «El dinero y por qué invertir»', icon: 'U1', category: 'LEARNING', target: 1, gems: 30, xp: 30 },
  { code: 'UNIT_2', title: 'Lector de velas', description: 'Completa la unidad «Velas japonesas»', icon: 'U8', category: 'LEARNING', target: 1, gems: 40, xp: 40 },
  { code: 'UNIT_3', title: 'Gestor de riesgo', description: 'Completa la unidad «Gestión del riesgo»', icon: 'U10', category: 'LEARNING', target: 1, gems: 40, xp: 40 },
  { code: 'COURSE_DONE', title: 'Inversor autónomo', description: 'Completa todas las unidades del curso', icon: '★', category: 'LEARNING', target: 1, gems: 200, xp: 200 },
  { code: 'BOSS_1', title: 'Reto superado', description: 'Supera tu primer reto final de sección', icon: 'R', category: 'LEARNING', target: 1, gems: 40, xp: 40 },
  { code: 'BOSS_5', title: 'Cinco secciones', description: 'Supera 5 retos finales de sección', icon: 'R5', category: 'LEARNING', target: 5, gems: 100, xp: 80 },
  { code: 'UPDOWN_10', title: 'Humildad ante el mercado', description: 'Responde 10 retos «¿Sube o baja?» con datos reales', icon: '↕', category: 'LEARNING', target: 10, gems: 30, xp: 20 },
  { code: 'CALC_20', title: 'Calculadora humana', description: 'Acierta 20 ejercicios de cálculo', icon: '=', category: 'LEARNING', target: 20, gems: 40, xp: 30 },
  { code: 'SCAM_5', title: 'Detector de estafas', description: 'Detecta todas las estafas en 5 ejercicios', icon: '!', category: 'LEARNING', target: 5, gems: 40, xp: 30 },
  { code: 'SIM_5', title: 'Riesgo bajo control', description: 'Dimensiona bien 5 operaciones simuladas en las clases', icon: '%', category: 'LEARNING', target: 5, gems: 50, xp: 40 },
  { code: 'CANDLE_10', title: 'Cazavelas', description: 'Encuentra 10 patrones de velas en gráficos reales', icon: 'V', category: 'LEARNING', target: 10, gems: 30, xp: 20 },
  { code: 'HISTORY', title: 'Historiador', description: 'Completa la unidad «Burbujas y crisis»', icon: 'H', category: 'LEARNING', target: 1, gems: 50, xp: 40 },
  { code: 'LAB', title: 'Laboratorio', description: 'Completa la unidad «Retos con datos reales»', icon: 'L', category: 'LEARNING', target: 1, gems: 60, xp: 50 },
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
  STREAK_LOST: { mood: 'SAD', lines: ['Se acabó la racha, pero llegaste a {dias_racha} días. Hoy empieza otra: cinco minutos bastan.'] },
  LEVEL_UP: { mood: 'CELEBRATE', lines: ['¡Nivel {nivel}! Ahora eres «{titulo}». Lo estás haciendo muy bien, {nombre}.'] },
  PORTFOLIO_ANALYSIS: { mood: 'THINKING', lines: ['Tus operaciones grandes suelen ser los lunes. ¿Repasamos «Psicología del inversor»?'] },
}

// ── Liga: sin jugadores de ejemplo (D-019) ──────────────
export const DIVISIONS = ['Novato', 'Aprendiz', 'Analista', 'Estratega', 'Experto']
