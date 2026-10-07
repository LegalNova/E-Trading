// Catálogo de clases (5 módulos × 10) y reglas del quiz.
import type { Plan } from '@/data/clases'
import { CLASE_BY_ID, ClaseContenido } from '@/data/clases-contenido'

export const QUIZ_PASS = 3 // aciertos necesarios de 5

export interface Modulo {
  n: 1 | 2 | 3 | 4 | 5
  titulo: string
  plan: Plan
}

export const MODULOS: Modulo[] = [
  { n: 1, titulo: 'Fundamentos', plan: 'free' },
  { n: 2, titulo: 'Estrategias', plan: 'starter' },
  { n: 3, titulo: 'Trading activo', plan: 'pro' },
  { n: 4, titulo: 'Psicología', plan: 'pro' },
  { n: 5, titulo: 'Avanzado', plan: 'elite' },
]

// Títulos de los módulos 2-5 (el contenido se irá publicando)
const PROXIMAS: Record<number, string[]> = {
  2: [
    'Inversión pasiva: el método que bate al 90 % de los gestores', 'Inversión en valor: invertir como Buffett',
    'Trading activo vs largo plazo', 'DCA: la estrategia del inversor inteligente', 'La regla que salva cuentas',
    'Los tipos de interés y cómo mueven los mercados', 'Criptomonedas sin arruinarse', 'ETFs: la inversión más inteligente',
    'Indicadores técnicos que funcionan', 'Forex: el mercado más grande del mundo',
  ],
  3: [
    'Patrones de velas japonesas', 'Soportes, resistencias y zonas clave', 'Entrar, mantener y salir',
    'El calendario económico', 'Swing trading', 'Cuánto dinero poner en cada operación', 'Materias primas',
    'Bonos para inversores', 'Opciones: conceptos básicos', 'Construye tu cartera definitiva',
  ],
  4: [
    'Los 8 sesgos que destruyen carteras', 'El diario de inversión', 'Cómo manejar las pérdidas',
    'Tu plan de inversión personal', 'Fiscalidad de las inversiones en España', 'Cómo investigar una empresa',
    'Sectores y rotación sectorial', 'Mercados internacionales', 'Small caps vs large caps', 'Preparándote para dinero real',
  ],
  5: [
    'Valoración DCF completa', 'Opciones con riesgo definido', 'Futuros y derivados', 'Sharpe, Sortino y drawdown',
    'Macroeconomía aplicada', 'El ciclo económico de Dalio', 'Cartera de dividendos', 'REITs e inmobiliario cotizado',
    'Trading algorítmico: introducción', 'Examen de certificación E-Trading',
  ],
}

export interface ClaseResumen {
  id: string
  numero: number
  modulo: number
  titulo: string
  duracion: string | null
  xp: number | null
  plan: Plan
  disponible: boolean // tiene contenido publicado
}

export const CATALOGO: ClaseResumen[] = MODULOS.flatMap(m =>
  Array.from({ length: 10 }, (_, i) => {
    const numero = (m.n - 1) * 10 + i + 1
    const id = `c${numero}`
    const c: ClaseContenido | undefined = CLASE_BY_ID[id]
    return {
      id,
      numero,
      modulo: m.n,
      titulo: c?.titulo ?? PROXIMAS[m.n]?.[i] ?? `Clase ${numero}`,
      duracion: c?.duracion ?? null,
      xp: c?.xp ?? null,
      plan: c?.plan ?? m.plan,
      disponible: !!c,
    }
  }),
)

const PLAN_ORDER: Plan[] = ['free', 'starter', 'pro', 'elite']
export function planIncludes(userPlan: Plan, required: Plan): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(required)
}

/** Tiempo de espera para reintentar un quiz suspendido */
export const RETRY_MS: Record<Plan, number> = {
  free: 24 * 3_600_000,
  starter: 3_600_000,
  pro: 15 * 60_000,
  elite: 0,
}

/** Corrige las respuestas en el servidor. Devuelve aciertos y si aprueba. */
export function gradeQuiz(clase: ClaseContenido, answers: unknown): { score: number; passed: boolean } | null {
  if (!Array.isArray(answers) || answers.length !== clase.quiz.length) return null
  let score = 0
  clase.quiz.forEach((q, i) => {
    if (answers[i] === q.correcta) score++
  })
  return { score, passed: score >= QUIZ_PASS }
}
