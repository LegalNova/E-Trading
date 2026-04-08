export type Plan = 'free' | 'starter' | 'pro' | 'elite'
export type ClaseCategoria = 'fundamentos' | 'riesgo' | 'macroeconomia' | 'estrategia' | 'analisis-tecnico' | 'criptomonedas' | 'etfs' | 'forex' | 'materias' | 'opciones'

export interface Clase {
  id: string
  numero: number
  categoria: ClaseCategoria
  titulo: string
  plan: Plan
  xp: number
  duracion: number // minutos
  descripcion: string
}

export const CLASES: Clase[] = [
  {
    id: 'c1', numero: 1, categoria: 'fundamentos',
    titulo: 'Tu dinero pierde valor cada día',
    plan: 'free', xp: 50, duracion: 8,
    descripcion: 'Descubre cómo la inflación erosiona tu poder adquisitivo y por qué guardar dinero bajo el colchón es una mala idea.',
  },
  {
    id: 'c2', numero: 2, categoria: 'fundamentos',
    titulo: 'Ahorrar no es invertir',
    plan: 'free', xp: 60, duracion: 7,
    descripcion: 'La diferencia crucial entre ahorrar e invertir, y cómo cada estrategia afecta tu futuro financiero.',
  },
  {
    id: 'c3', numero: 3, categoria: 'fundamentos',
    titulo: 'La octava maravilla del mundo',
    plan: 'free', xp: 75, duracion: 9,
    descripcion: 'El interés compuesto: cómo funciona, por qué Einstein lo llamó la octava maravilla, y cómo aprovecharlo.',
  },
  {
    id: 'c4', numero: 4, categoria: 'riesgo',
    titulo: 'Gestión del riesgo: lo más importante',
    plan: 'free', xp: 100, duracion: 10,
    descripcion: 'Los profesionales no evitan el riesgo, lo gestionan. Aprende las reglas de oro para proteger tu capital.',
  },
  {
    id: 'c5', numero: 5, categoria: 'macroeconomia',
    titulo: 'Tipos de interés y su impacto en bolsa',
    plan: 'free', xp: 90, duracion: 9,
    descripcion: 'Por qué cuando el banco central sube tipos, las bolsas suelen caer. La relación más importante del mercado.',
  },
  {
    id: 'c6', numero: 6, categoria: 'estrategia',
    titulo: 'Diversificación: la regla de oro',
    plan: 'starter', xp: 70, duracion: 8,
    descripcion: 'No pongas todos los huevos en la misma cesta. Cómo construir una cartera diversificada que resista crisis.',
  },
  {
    id: 'c7', numero: 7, categoria: 'analisis-tecnico',
    titulo: 'Soportes y resistencias',
    plan: 'starter', xp: 100, duracion: 10,
    descripcion: 'Los niveles clave del gráfico donde el precio suele rebotar. La base del análisis técnico.',
  },
  {
    id: 'c8', numero: 8, categoria: 'estrategia',
    titulo: 'Value Investing: invertir como Buffett',
    plan: 'starter', xp: 120, duracion: 12,
    descripcion: 'Comprar empresas buenas a precio justo. La filosofía que ha generado más millonarios que cualquier otra.',
  },
  {
    id: 'c9', numero: 9, categoria: 'criptomonedas',
    titulo: 'Bitcoin y Ethereum: qué son de verdad',
    plan: 'pro', xp: 80, duracion: 10,
    descripcion: 'Más allá del hype: qué resuelven realmente Bitcoin y Ethereum, y cómo evaluar proyectos cripto.',
  },
  {
    id: 'c10', numero: 10, categoria: 'etfs',
    titulo: 'ETFs: la forma más sencilla de invertir',
    plan: 'pro', xp: 65, duracion: 7,
    descripcion: 'Qué es un ETF, cómo funciona, y por qué muchos expertos los consideran la mejor opción para la mayoría.',
  },
  {
    id: 'c11', numero: 11, categoria: 'macroeconomia',
    titulo: 'Los 8 sesgos que destruyen carteras',
    plan: 'pro', xp: 75, duracion: 9,
    descripcion: 'FOMO, sesgo de confirmación, aversión a la pérdida... Los errores mentales que hacen perder dinero a los inversores.',
  },
  {
    id: 'c12', numero: 12, categoria: 'estrategia',
    titulo: 'Tu Declaración de Política de Inversión',
    plan: 'pro', xp: 150, duracion: 15,
    descripcion: 'El documento que todo inversor serio tiene. Define tu estrategia, objetivos y reglas antes de invertir.',
  },
  // ── Nuevas clases c13–c20 ──────────────────────────────────
  {
    id: 'c13', numero: 13, categoria: 'analisis-tecnico',
    titulo: 'Análisis fundamental avanzado',
    plan: 'pro', xp: 130, duracion: 14,
    descripcion: 'DCF, márgenes, ROIC y crecimiento de FCF. Las métricas que usan los analistas de Goldman Sachs.',
  },
  {
    id: 'c14', numero: 14, categoria: 'analisis-tecnico',
    titulo: 'Velas japonesas: los 10 patrones clave',
    plan: 'starter', xp: 110, duracion: 11,
    descripcion: 'Doji, martillo, engulfing alcista, estrella del amanecer... Los patrones con mayor tasa de éxito histórico.',
  },
  {
    id: 'c15', numero: 15, categoria: 'macroeconomia',
    titulo: 'Bonos y renta fija explicados',
    plan: 'pro', xp: 90, duracion: 10,
    descripcion: 'Yield, duración, curva de tipos invertida. Todo lo que necesitas saber sobre el mercado de renta fija.',
  },
  {
    id: 'c16', numero: 16, categoria: 'forex',
    titulo: 'Forex: el mayor mercado del mundo',
    plan: 'pro', xp: 100, duracion: 11,
    descripcion: '6 billones de dólares al día. Pares de divisas, sesiones, carry trade y cómo beneficiarte de los tipos de interés.',
  },
  {
    id: 'c17', numero: 17, categoria: 'materias',
    titulo: 'Materias primas: oro, petróleo y más',
    plan: 'pro', xp: 85, duracion: 9,
    descripcion: 'Oro como refugio, petróleo y geopolítica, metales industriales. Cómo incluir materias primas en tu cartera.',
  },
  {
    id: 'c18', numero: 18, categoria: 'opciones',
    titulo: 'Opciones financieras: una introducción',
    plan: 'elite', xp: 160, duracion: 16,
    descripcion: 'Calls, puts, prima, delta y estrategias básicas. El instrumento más versátil de los mercados financieros.',
  },
  {
    id: 'c19', numero: 19, categoria: 'estrategia',
    titulo: 'Inversión a largo plazo: el camino más seguro',
    plan: 'free', xp: 95, duracion: 10,
    descripcion: 'La evidencia histórica es aplastante: a 20 años, la bolsa nunca ha perdido dinero. Cómo aprovecharlo.',
  },
  {
    id: 'c20', numero: 20, categoria: 'estrategia',
    titulo: 'Construye tu cartera definitiva',
    plan: 'elite', xp: 200, duracion: 18,
    descripcion: 'Core-satellite, asignación por objetivos, rebalanceo automático. La cartera que te llevará a la libertad financiera.',
  },
]
