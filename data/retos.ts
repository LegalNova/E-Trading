import { Plan } from './clases'

export type RetoTipo = 'daily' | 'weekly' | 'monthly' | 'special'
export type RetoFase = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Reto {
  id: string
  numero: number
  fase: RetoFase
  faseName: string
  titulo: string
  descripcion: string
  tipo: RetoTipo
  plan: Plan
  xp: number
  duracion: number // minutos
}

export const FASES = [
  { fase: 1, nombre: 'Despertar Financiero', retos: 'r1–r15', plan: 'free', xpRange: '20–150' },
  { fase: 2, nombre: 'Operador Informado', retos: 'r16–r30', plan: 'free/starter', xpRange: '50–300' },
  { fase: 3, nombre: 'Analista', retos: 'r31–r45', plan: 'starter/pro', xpRange: '150–500' },
  { fase: 4, nombre: 'Estratega', retos: 'r46–r60', plan: 'free/starter/elite', xpRange: '50–800' },
  { fase: 5, nombre: 'Trader Activo', retos: 'r61–r75', plan: 'pro/elite', xpRange: '75–600' },
  { fase: 6, nombre: 'Mente de Trader', retos: 'r76–r88', plan: 'pro/elite', xpRange: '80–800' },
  { fase: 7, nombre: 'Inversor Autónomo', retos: 'r89–r100', plan: 'free→elite', xpRange: '400–2000' },
]

export const RETOS: Reto[] = [
  // ─────────────────────────────────────────────────────────────
  // FASE 1: Despertar Financiero (r1–r15, free)
  // ─────────────────────────────────────────────────────────────
  { id: 'r1', numero: 1, fase: 1, faseName: 'Despertar Financiero', titulo: '¿Qué es el dinero?', descripcion: 'Aprende el concepto fundamental de qué es el dinero y cómo funciona la economía moderna.', tipo: 'daily', plan: 'free', xp: 20, duracion: 5 },
  { id: 'r2', numero: 2, fase: 1, faseName: 'Despertar Financiero', titulo: 'La inflación en tu vida', descripcion: 'Calcula cuánto poder adquisitivo has perdido en los últimos 5 años con la calculadora.', tipo: 'daily', plan: 'free', xp: 30, duracion: 7 },
  { id: 'r3', numero: 3, fase: 1, faseName: 'Despertar Financiero', titulo: 'Tu primera operación', descripcion: 'Compra tu primera acción en el simulador. Elige entre Apple, Microsoft o Tesla.', tipo: 'daily', plan: 'free', xp: 50, duracion: 8 },
  { id: 'r4', numero: 4, fase: 1, faseName: 'Despertar Financiero', titulo: 'El poder del interés compuesto', descripcion: 'Usa la calculadora para ver cuánto crecería €1.000 en 30 años al 7% anual.', tipo: 'daily', plan: 'free', xp: 40, duracion: 6 },
  { id: 'r5', numero: 5, fase: 1, faseName: 'Despertar Financiero', titulo: 'Mercados del mundo', descripcion: 'Identifica los 5 principales mercados bursátiles y sus zonas horarias.', tipo: 'daily', plan: 'free', xp: 35, duracion: 7 },
  { id: 'r6', numero: 6, fase: 1, faseName: 'Despertar Financiero', titulo: 'Tipos de activos financieros', descripcion: 'Aprende la diferencia entre acciones, bonos, ETFs, cripto y materias primas.', tipo: 'daily', plan: 'free', xp: 45, duracion: 8 },
  { id: 'r7', numero: 7, fase: 1, faseName: 'Despertar Financiero', titulo: 'Tu perfil inversor', descripcion: 'Descubre qué tipo de inversor eres: conservador, moderado o agresivo.', tipo: 'daily', plan: 'free', xp: 60, duracion: 9 },
  { id: 'r8', numero: 8, fase: 1, faseName: 'Despertar Financiero', titulo: 'La regla del 50/30/20', descripcion: 'Aprende a gestionar tu salario: 50% necesidades, 30% deseos, 20% ahorro/inversión.', tipo: 'daily', plan: 'free', xp: 55, duracion: 8 },
  { id: 'r9', numero: 9, fase: 1, faseName: 'Despertar Financiero', titulo: 'Activos vs pasivos', descripcion: 'La diferencia entre activos (generan dinero) y pasivos (consumen dinero) según Kiyosaki.', tipo: 'daily', plan: 'free', xp: 65, duracion: 8 },
  { id: 'r10', numero: 10, fase: 1, faseName: 'Despertar Financiero', titulo: 'El fondo de emergencia', descripcion: 'Por qué necesitas 3-6 meses de gastos en liquidez antes de invertir.', tipo: 'daily', plan: 'free', xp: 50, duracion: 7 },
  { id: 'r11', numero: 11, fase: 1, faseName: 'Despertar Financiero', titulo: 'Cómo funciona la bolsa', descripcion: 'Del mercado de tulipanes holandés al NYSE: historia y funcionamiento básico.', tipo: 'daily', plan: 'free', xp: 60, duracion: 8 },
  { id: 'r12', numero: 12, fase: 1, faseName: 'Despertar Financiero', titulo: 'Tu primera semana de seguimiento', descripcion: 'Sigue el precio de 3 activos diferentes durante 7 días y registra sus movimientos.', tipo: 'weekly', plan: 'free', xp: 100, duracion: 7 },
  { id: 'r13', numero: 13, fase: 1, faseName: 'Despertar Financiero', titulo: 'Finanzas personales básicas', descripcion: 'Calcula tu patrimonio neto: activos menos deudas. El primer paso de todo inversor.', tipo: 'daily', plan: 'free', xp: 70, duracion: 9 },
  { id: 'r14', numero: 14, fase: 1, faseName: 'Despertar Financiero', titulo: 'El costo de la deuda', descripcion: 'Por qué pagar deudas al 20% TAE es la mejor inversión que existe.', tipo: 'daily', plan: 'free', xp: 75, duracion: 8 },
  { id: 'r15', numero: 15, fase: 1, faseName: 'Despertar Financiero', titulo: 'Plan financiero personal', descripcion: 'Establece tus objetivos financieros a 1, 5 y 10 años. El mapa de tu independencia.', tipo: 'special', plan: 'free', xp: 150, duracion: 12 },

  // ─────────────────────────────────────────────────────────────
  // FASE 2: Operador Informado (r16–r30, free/starter)
  // ─────────────────────────────────────────────────────────────
  { id: 'r16', numero: 16, fase: 2, faseName: 'Operador Informado', titulo: 'Leer un gráfico de velas', descripcion: 'Aprende a interpretar los gráficos de velas japonesas: cuerpo, mecha, colores.', tipo: 'daily', plan: 'free', xp: 50, duracion: 8 },
  { id: 'r17', numero: 17, fase: 2, faseName: 'Operador Informado', titulo: 'Orden de mercado vs límite', descripcion: 'Entiende los tipos de órdenes y cuándo usar cada una para optimizar tus entradas.', tipo: 'daily', plan: 'free', xp: 60, duracion: 7 },
  { id: 'r18', numero: 18, fase: 2, faseName: 'Operador Informado', titulo: 'El spread y las comisiones', descripcion: 'Aprende cómo los brokers ganan dinero y cómo minimizar tus costes operativos.', tipo: 'daily', plan: 'free', xp: 55, duracion: 8 },
  { id: 'r19', numero: 19, fase: 2, faseName: 'Operador Informado', titulo: 'Comprar y vender cripto', descripcion: 'Ejecuta tu primera operación con Bitcoin o Ethereum en el simulador.', tipo: 'daily', plan: 'free', xp: 70, duracion: 9 },
  { id: 'r20', numero: 20, fase: 2, faseName: 'Operador Informado', titulo: 'Stop Loss: tu escudo', descripcion: 'Aprende a poner stop loss para limitar pérdidas y practica en el simulador.', tipo: 'daily', plan: 'free', xp: 80, duracion: 10 },
  { id: 'r21', numero: 21, fase: 2, faseName: 'Operador Informado', titulo: 'La regla del 1%', descripcion: 'Nunca arriesgues más del 1% de tu capital en una sola operación. La regla de oro.', tipo: 'daily', plan: 'starter', xp: 90, duracion: 8 },
  { id: 'r22', numero: 22, fase: 2, faseName: 'Operador Informado', titulo: 'Ratio riesgo/beneficio', descripcion: 'Calcula el ratio R/B antes de cada operación. Nunca entres con menos de 1:2.', tipo: 'daily', plan: 'starter', xp: 100, duracion: 9 },
  { id: 'r23', numero: 23, fase: 2, faseName: 'Operador Informado', titulo: 'Tamaño de posición', descripcion: 'Aprende a calcular cuántas acciones comprar según tu capital y tu stop loss.', tipo: 'daily', plan: 'starter', xp: 110, duracion: 10 },
  { id: 'r24', numero: 24, fase: 2, faseName: 'Operador Informado', titulo: 'Tu primera semana en bolsa', descripcion: 'Completa 5 operaciones en una semana y analiza tus resultados en el portafolio.', tipo: 'weekly', plan: 'starter', xp: 200, duracion: 7 },
  { id: 'r25', numero: 25, fase: 2, faseName: 'Operador Informado', titulo: 'ETFs: compra tu primera cesta', descripcion: 'Invierte en SPY o QQQ y entiende qué estás comprando exactamente.', tipo: 'daily', plan: 'starter', xp: 90, duracion: 8 },
  { id: 'r26', numero: 26, fase: 2, faseName: 'Operador Informado', titulo: 'Cómo leer noticias financieras', descripcion: 'Fuentes fiables, señales de ruido y cómo filtrar la información relevante.', tipo: 'daily', plan: 'starter', xp: 80, duracion: 9 },
  { id: 'r27', numero: 27, fase: 2, faseName: 'Operador Informado', titulo: 'El calendario económico', descripcion: 'NFP, PIB, IPC: los eventos macro que mueven los mercados cada mes.', tipo: 'daily', plan: 'starter', xp: 100, duracion: 9 },
  { id: 'r28', numero: 28, fase: 2, faseName: 'Operador Informado', titulo: 'Diversificación básica', descripcion: 'Construye un portafolio con al menos 3 activos de categorías diferentes.', tipo: 'daily', plan: 'starter', xp: 120, duracion: 10 },
  { id: 'r29', numero: 29, fase: 2, faseName: 'Operador Informado', titulo: 'Review semanal de portafolio', descripcion: 'Aprende a hacer tu review semanal: P&L, tesis vigentes, próximos catalizadores.', tipo: 'weekly', plan: 'starter', xp: 180, duracion: 10 },
  { id: 'r30', numero: 30, fase: 2, faseName: 'Operador Informado', titulo: 'Test del operador informado', descripcion: 'Examen de 20 preguntas sobre conceptos básicos. Necesitas el 80% para pasar.', tipo: 'special', plan: 'starter', xp: 300, duracion: 15 },

  // ─────────────────────────────────────────────────────────────
  // FASE 3: Analista (r31–r45, starter/pro)
  // ─────────────────────────────────────────────────────────────
  { id: 'r31', numero: 31, fase: 3, faseName: 'Analista', titulo: 'Análisis fundamental básico', descripcion: 'Aprende a leer la cuenta de resultados y el balance de una empresa cotizada.', tipo: 'daily', plan: 'starter', xp: 150, duracion: 12 },
  { id: 'r32', numero: 32, fase: 3, faseName: 'Analista', titulo: 'PER, PVC y EV/EBITDA', descripcion: 'Los ratios de valoración que usan los analistas profesionales de Wall Street.', tipo: 'daily', plan: 'starter', xp: 160, duracion: 10 },
  { id: 'r33', numero: 33, fase: 3, faseName: 'Analista', titulo: 'Soportes y resistencias', descripcion: 'Identifica niveles clave en el gráfico de 3 activos diferentes del simulador.', tipo: 'daily', plan: 'starter', xp: 180, duracion: 10 },
  { id: 'r34', numero: 34, fase: 3, faseName: 'Analista', titulo: 'Medias móviles 50 y 200', descripcion: 'Aprende a usar las medias móviles simples y exponenciales para identificar tendencias.', tipo: 'daily', plan: 'starter', xp: 200, duracion: 11 },
  { id: 'r35', numero: 35, fase: 3, faseName: 'Analista', titulo: 'RSI: momentum y reversiones', descripcion: 'Identifica zonas de sobrecompra (+70) y sobreventa (-30) con el RSI.', tipo: 'daily', plan: 'pro', xp: 220, duracion: 10 },
  { id: 'r36', numero: 36, fase: 3, faseName: 'Analista', titulo: 'Patrones de velas japonesas', descripcion: 'Doji, martillo, engulfing... Los 10 patrones más fiables del análisis técnico.', tipo: 'daily', plan: 'pro', xp: 200, duracion: 12 },
  { id: 'r37', numero: 37, fase: 3, faseName: 'Analista', titulo: 'Volumen como confirmación', descripcion: 'Un movimiento sin volumen es sospechoso. Aprende a usar el volumen como filtro.', tipo: 'daily', plan: 'pro', xp: 180, duracion: 9 },
  { id: 'r38', numero: 38, fase: 3, faseName: 'Analista', titulo: 'Análisis de sectores', descripcion: 'Comprende la rotación de sectores a lo largo del ciclo económico.', tipo: 'weekly', plan: 'pro', xp: 300, duracion: 12 },
  { id: 'r39', numero: 39, fase: 3, faseName: 'Analista', titulo: 'Flujos de caja libre (FCF)', descripcion: 'Por qué el FCF es la métrica más importante para valorar una empresa.', tipo: 'daily', plan: 'pro', xp: 250, duracion: 12 },
  { id: 'r40', numero: 40, fase: 3, faseName: 'Analista', titulo: 'Análisis de NVIDIA', descripcion: 'Aplica análisis técnico y fundamental a NVDA: tendencia, ratios y catalizadores.', tipo: 'weekly', plan: 'pro', xp: 320, duracion: 14 },
  { id: 'r41', numero: 41, fase: 3, faseName: 'Analista', titulo: 'Análisis de Bitcoin', descripcion: 'Aprende las métricas on-chain específicas de Bitcoin: hash rate, dominancia, ciclos.', tipo: 'weekly', plan: 'pro', xp: 280, duracion: 12 },
  { id: 'r42', numero: 42, fase: 3, faseName: 'Analista', titulo: 'Construye tu primera tesis', descripcion: 'Escribe una tesis de inversión completa para un activo del simulador (mín. 200 palabras).', tipo: 'weekly', plan: 'pro', xp: 350, duracion: 15 },
  { id: 'r43', numero: 43, fase: 3, faseName: 'Analista', titulo: 'Evalúa tu portafolio vs S&P 500', descripcion: 'Compara el rendimiento de tu simulador contra el benchmark más importante del mundo.', tipo: 'monthly', plan: 'pro', xp: 400, duracion: 12 },
  { id: 'r44', numero: 44, fase: 3, faseName: 'Analista', titulo: 'Riesgo de concentración', descripcion: 'Analiza qué pasa si tu activo más grande cae un 50%. Aprende a diversificar de verdad.', tipo: 'daily', plan: 'pro', xp: 300, duracion: 10 },
  { id: 'r45', numero: 45, fase: 3, faseName: 'Analista', titulo: 'Certificación de Analista', descripcion: 'Examen de 30 preguntas de análisis técnico y fundamental. Necesitas el 80%.', tipo: 'special', plan: 'pro', xp: 500, duracion: 20 },

  // ─────────────────────────────────────────────────────────────
  // FASE 4: Estratega (r46–r60)
  // ─────────────────────────────────────────────────────────────
  { id: 'r46', numero: 46, fase: 4, faseName: 'Estratega', titulo: 'Dollar Cost Averaging (DCA)', descripcion: 'Aprende e implementa la estrategia DCA en el simulador durante 4 semanas.', tipo: 'daily', plan: 'free', xp: 100, duracion: 8 },
  { id: 'r47', numero: 47, fase: 4, faseName: 'Estratega', titulo: 'Buy & Hold vs Trading activo', descripcion: 'Datos reales: ¿quién gana a largo plazo? Compara ambas estrategias con backtest.', tipo: 'daily', plan: 'starter', xp: 150, duracion: 10 },
  { id: 'r48', numero: 48, fase: 4, faseName: 'Estratega', titulo: 'Rebalanceo de cartera', descripcion: 'Aprende cuándo y cómo rebalancear tu portafolio para mantener tu asignación objetivo.', tipo: 'weekly', plan: 'starter', xp: 200, duracion: 11 },
  { id: 'r49', numero: 49, fase: 4, faseName: 'Estratega', titulo: 'Inversión en dividendos', descripcion: 'Construye una cartera que genere ingresos pasivos con acciones de alto dividendo.', tipo: 'weekly', plan: 'starter', xp: 220, duracion: 12 },
  { id: 'r50', numero: 50, fase: 4, faseName: 'Estratega', titulo: 'Value vs Growth investing', descripcion: 'Compara las filosofías de Buffett (value) vs Cathie Wood (growth) con ejemplos reales.', tipo: 'daily', plan: 'starter', xp: 180, duracion: 10 },
  { id: 'r51', numero: 51, fase: 4, faseName: 'Estratega', titulo: 'Cartera permanente de Harry Browne', descripcion: '25% acciones, 25% bonos, 25% oro, 25% efectivo. La cartera que sobrevive todo.', tipo: 'daily', plan: 'starter', xp: 200, duracion: 10 },
  { id: 'r52', numero: 52, fase: 4, faseName: 'Estratega', titulo: 'All-weather portfolio de Dalio', descripcion: 'La cartera para todas las estaciones de Ray Dalio. Construyela en el simulador.', tipo: 'weekly', plan: 'elite', xp: 400, duracion: 13 },
  { id: 'r53', numero: 53, fase: 4, faseName: 'Estratega', titulo: 'Portfolio Markowitz', descripcion: 'La teoría moderna de carteras: frontera eficiente y maximizar el ratio Sharpe.', tipo: 'weekly', plan: 'elite', xp: 500, duracion: 15 },
  { id: 'r54', numero: 54, fase: 4, faseName: 'Estratega', titulo: 'Hedging básico con inversas', descripcion: 'Aprende a proteger tu cartera con ETFs inversos y activos de cobertura.', tipo: 'weekly', plan: 'elite', xp: 450, duracion: 14 },
  { id: 'r55', numero: 55, fase: 4, faseName: 'Estratega', titulo: 'Rotación de activos macro', descripcion: 'Aprende qué activos funcionan mejor en cada fase del ciclo económico.', tipo: 'monthly', plan: 'elite', xp: 600, duracion: 15 },
  { id: 'r56', numero: 56, fase: 4, faseName: 'Estratega', titulo: 'Análisis macroeconómico global', descripcion: 'Evalúa cómo los tipos de interés, la inflación y el PIB afectan a cada activo.', tipo: 'monthly', plan: 'elite', xp: 700, duracion: 20 },
  { id: 'r57', numero: 57, fase: 4, faseName: 'Estratega', titulo: 'Inversión temática', descripcion: 'IA, energía verde, longevidad... Identifica mega-tendencias y cómo invertir en ellas.', tipo: 'weekly', plan: 'pro', xp: 350, duracion: 12 },
  { id: 'r58', numero: 58, fase: 4, faseName: 'Estratega', titulo: 'Factor investing', descripcion: 'Value, momentum, quality, low vol: los 5 factores que baten al mercado a largo plazo.', tipo: 'weekly', plan: 'elite', xp: 500, duracion: 14 },
  { id: 'r59', numero: 59, fase: 4, faseName: 'Estratega', titulo: 'Tu IPS provisional', descripcion: 'Redacta tu Investment Policy Statement: objetivos, horizonte, tolerancia al riesgo.', tipo: 'special', plan: 'starter', xp: 600, duracion: 15 },
  { id: 'r60', numero: 60, fase: 4, faseName: 'Estratega', titulo: 'Tu estrategia definitiva', descripcion: 'Define y documenta tu estrategia de inversión personal. El plan que seguirás 10 años.', tipo: 'special', plan: 'starter', xp: 800, duracion: 18 },

  // ─────────────────────────────────────────────────────────────
  // FASE 5: Trader Activo (r61–r75, pro/elite)
  // ─────────────────────────────────────────────────────────────
  { id: 'r61', numero: 61, fase: 5, faseName: 'Trader Activo', titulo: 'Trading intradía: las reglas', descripcion: 'Las reglas de oro del day trading y por qué el 90% de los traders pierde dinero.', tipo: 'daily', plan: 'pro', xp: 100, duracion: 9 },
  { id: 'r62', numero: 62, fase: 5, faseName: 'Trader Activo', titulo: 'Swing trading básico', descripcion: 'Captura movimientos de 2-10 días. Setup, entrada, gestión y salida.', tipo: 'weekly', plan: 'pro', xp: 200, duracion: 12 },
  { id: 'r63', numero: 63, fase: 5, faseName: 'Trader Activo', titulo: 'Breakout trading', descripcion: 'Aprende a identificar y operar rupturas de niveles clave con volumen de confirmación.', tipo: 'daily', plan: 'pro', xp: 150, duracion: 10 },
  { id: 'r64', numero: 64, fase: 5, faseName: 'Trader Activo', titulo: 'MACD: señales de entrada y salida', descripcion: 'Cruces de señal, divergencias y el histograma del MACD en la práctica.', tipo: 'daily', plan: 'pro', xp: 180, duracion: 10 },
  { id: 'r65', numero: 65, fase: 5, faseName: 'Trader Activo', titulo: 'Bandas de Bollinger', descripcion: 'Usa las bandas de Bollinger para detectar compresión, expansión y reversiones.', tipo: 'daily', plan: 'pro', xp: 170, duracion: 10 },
  { id: 'r66', numero: 66, fase: 5, faseName: 'Trader Activo', titulo: 'Fibonacci: retrocesos y extensiones', descripcion: 'Los niveles de Fibonacci usados por traders profesionales para fijar objetivos.', tipo: 'daily', plan: 'pro', xp: 200, duracion: 11 },
  { id: 'r67', numero: 67, fase: 5, faseName: 'Trader Activo', titulo: 'Gaps de apertura', descripcion: 'Gap up, gap down, gap de continuación y gap de agotamiento. Cómo operarlos.', tipo: 'daily', plan: 'pro', xp: 180, duracion: 10 },
  { id: 'r68', numero: 68, fase: 5, faseName: 'Trader Activo', titulo: 'Trading en forex', descripcion: 'EUR/USD, GBP/USD, USD/JPY: sesiones, pips, apalancamiento básico y noticias macro.', tipo: 'weekly', plan: 'pro', xp: 250, duracion: 12 },
  { id: 'r69', numero: 69, fase: 5, faseName: 'Trader Activo', titulo: 'Trading en cripto 24/7', descripcion: 'Cómo gestionar posiciones en mercados que no cierran nunca. Alertas y límites.', tipo: 'daily', plan: 'elite', xp: 300, duracion: 11 },
  { id: 'r70', numero: 70, fase: 5, faseName: 'Trader Activo', titulo: 'Semana de trading activo', descripcion: 'Realiza 10 operaciones en 5 días con tu estrategia documentada. Evalúa resultados.', tipo: 'weekly', plan: 'elite', xp: 400, duracion: 7 },
  { id: 'r71', numero: 71, fase: 5, faseName: 'Trader Activo', titulo: 'Diario de trading — 2 semanas', descripcion: 'Lleva un diario detallado con capturas, tesis, emociones y lecciones de cada trade.', tipo: 'weekly', plan: 'elite', xp: 500, duracion: 14 },
  { id: 'r72', numero: 72, fase: 5, faseName: 'Trader Activo', titulo: 'Análisis de tus errores', descripcion: 'Revisa tus últimas 20 operaciones e identifica los 3 errores recurrentes.', tipo: 'weekly', plan: 'elite', xp: 400, duracion: 12 },
  { id: 'r73', numero: 73, fase: 5, faseName: 'Trader Activo', titulo: 'Backtesting manual', descripcion: 'Prueba tu estrategia visualmente con datos históricos del simulador.', tipo: 'special', plan: 'elite', xp: 500, duracion: 20 },
  { id: 'r74', numero: 74, fase: 5, faseName: 'Trader Activo', titulo: 'Win rate y expectativa', descripcion: 'Calcula tu win rate y expectativa matemática con tus datos reales del simulador.', tipo: 'weekly', plan: 'elite', xp: 450, duracion: 12 },
  { id: 'r75', numero: 75, fase: 5, faseName: 'Trader Activo', titulo: 'Certificación Trader Activo', descripcion: 'Demuestra que puedes gestionar 10 operaciones con profit factor positivo en 4 semanas.', tipo: 'special', plan: 'elite', xp: 600, duracion: 28 },

  // ─────────────────────────────────────────────────────────────
  // FASE 6: Mente de Trader (r76–r88, pro/elite)
  // ─────────────────────────────────────────────────────────────
  { id: 'r76', numero: 76, fase: 6, faseName: 'Mente de Trader', titulo: 'Los 8 sesgos cognitivos', descripcion: 'FOMO, aversión a pérdidas, sesgo de confirmación, sobreconfianza: identifícalos en ti.', tipo: 'daily', plan: 'pro', xp: 120, duracion: 10 },
  { id: 'r77', numero: 77, fase: 6, faseName: 'Mente de Trader', titulo: 'Supera el FOMO', descripcion: 'El mercado siempre tendrá otra oportunidad. Técnicas para tomar decisiones racionales.', tipo: 'daily', plan: 'pro', xp: 150, duracion: 9 },
  { id: 'r78', numero: 78, fase: 6, faseName: 'Mente de Trader', titulo: 'Aversión a la pérdida', descripcion: 'Por qué perder 100€ duele el doble que ganar 100€. Kahneman y la prospect theory.', tipo: 'daily', plan: 'pro', xp: 160, duracion: 10 },
  { id: 'r79', numero: 79, fase: 6, faseName: 'Mente de Trader', titulo: 'El efecto disposición', descripcion: 'La tendencia a vender ganadores pronto y aguantar perdedores demasiado. Cómo corregirlo.', tipo: 'daily', plan: 'pro', xp: 170, duracion: 9 },
  { id: 'r80', numero: 80, fase: 6, faseName: 'Mente de Trader', titulo: 'Tu plan de trading escrito', descripcion: 'Crea un plan con reglas claras de entrada, gestión y salida. Sin plan, no operes.', tipo: 'weekly', plan: 'pro', xp: 400, duracion: 15 },
  { id: 'r81', numero: 81, fase: 6, faseName: 'Mente de Trader', titulo: 'Gestión emocional tras pérdidas', descripcion: 'Técnicas para mantener la disciplina cuando pierdes 3 operaciones seguidas.', tipo: 'weekly', plan: 'elite', xp: 500, duracion: 12 },
  { id: 'r82', numero: 82, fase: 6, faseName: 'Mente de Trader', titulo: 'Meditación y toma de decisiones', descripcion: 'Cómo los traders profesionales usan mindfulness para reducir el ruido emocional.', tipo: 'daily', plan: 'pro', xp: 200, duracion: 10 },
  { id: 'r83', numero: 83, fase: 6, faseName: 'Mente de Trader', titulo: 'El sesgo de recencia', descripcion: 'Por qué sobrepesamos lo que acaba de pasar. Cómo evitar cambiar tu estrategia tras un crash.', tipo: 'daily', plan: 'pro', xp: 180, duracion: 9 },
  { id: 'r84', numero: 84, fase: 6, faseName: 'Mente de Trader', titulo: 'Rutina diaria del trader pro', descripcion: 'Pre-market, sesión, post-market. La rutina de 3 horas que usan los profesionales.', tipo: 'special', plan: 'elite', xp: 600, duracion: 15 },
  { id: 'r85', numero: 85, fase: 6, faseName: 'Mente de Trader', titulo: 'Construye tu sistema de reglas', descripcion: 'Un sistema que opera incluso cuando tú no quieres. La disciplina como ventaja competitiva.', tipo: 'special', plan: 'elite', xp: 700, duracion: 15 },
  { id: 'r86', numero: 86, fase: 6, faseName: 'Mente de Trader', titulo: 'Evaluación de 30 días', descripcion: 'Revisa un mes completo de operaciones. Estadísticas, sesgos detectados y plan de mejora.', tipo: 'monthly', plan: 'elite', xp: 700, duracion: 20 },
  { id: 'r87', numero: 87, fase: 6, faseName: 'Mente de Trader', titulo: 'El costo del exceso de trading', descripcion: 'Overtrading: cómo operar demasiado destruye la rentabilidad incluso con estrategia correcta.', tipo: 'daily', plan: 'pro', xp: 200, duracion: 10 },
  { id: 'r88', numero: 88, fase: 6, faseName: 'Mente de Trader', titulo: 'Mentalidad élite: el examen final', descripcion: 'Test de 25 preguntas sobre psicología del trading. Solo para los más preparados.', tipo: 'special', plan: 'elite', xp: 800, duracion: 20 },

  // ─────────────────────────────────────────────────────────────
  // FASE 7: Inversor Autónomo (r89–r100, free→elite)
  // ─────────────────────────────────────────────────────────────
  { id: 'r89', numero: 89, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Tu declaración de inversión (IPS)', descripcion: 'Redacta tu Investment Policy Statement definitiva. El documento que guiará tu vida financiera.', tipo: 'special', plan: 'free', xp: 400, duracion: 20 },
  { id: 'r90', numero: 90, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Revisión trimestral Q1', descripcion: 'Analiza el rendimiento de tu portafolio en los primeros 90 días. Ajusta si es necesario.', tipo: 'monthly', plan: 'starter', xp: 500, duracion: 15 },
  { id: 'r91', numero: 91, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Impuestos e inversión en España', descripcion: 'Plusvalías, pérdidas compensables, ISR y cómo optimizar tu declaración fiscal.', tipo: 'special', plan: 'starter', xp: 450, duracion: 15 },
  { id: 'r92', numero: 92, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Pensión privada vs inversión', descripcion: 'Planes de pensiones, PPAs y fondos indexados: dónde y cómo preparar tu jubilación.', tipo: 'weekly', plan: 'starter', xp: 400, duracion: 12 },
  { id: 'r93', numero: 93, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Libertad financiera: el número', descripcion: 'Calcula tu número: cuánto capital necesitas para vivir de tus inversiones para siempre.', tipo: 'special', plan: 'pro', xp: 500, duracion: 15 },
  { id: 'r94', numero: 94, fase: 7, faseName: 'Inversor Autónomo', titulo: 'La regla del 4%', descripcion: 'El estudio Trinity: puedes retirar el 4% anual y tu cartera sobrevivirá 30 años.', tipo: 'daily', plan: 'pro', xp: 400, duracion: 10 },
  { id: 'r95', numero: 95, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Simulacro de crisis -30%', descripcion: 'Gestiona tu portafolio durante una caída simulada del 30%. ¿Aguantas o vendes?', tipo: 'special', plan: 'pro', xp: 600, duracion: 20 },
  { id: 'r96', numero: 96, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Enseñar para consolidar', descripcion: 'Explica a E-AI los 5 conceptos más importantes que has aprendido. La mejor forma de aprender.', tipo: 'special', plan: 'pro', xp: 500, duracion: 15 },
  { id: 'r97', numero: 97, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Cartera modelo definitiva', descripcion: 'Construye en el simulador la cartera que mantendrás durante los próximos 10 años.', tipo: 'special', plan: 'elite', xp: 700, duracion: 20 },
  { id: 'r98', numero: 98, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Transición al mundo real', descripcion: 'Checklist completa antes de abrir tu primera cuenta en un broker real. ¿Estás listo?', tipo: 'special', plan: 'elite', xp: 800, duracion: 15 },
  { id: 'r99', numero: 99, fase: 7, faseName: 'Inversor Autónomo', titulo: 'Certificación E-Trading', descripcion: 'Examen final de 50 preguntas sobre todo el programa. Necesitas el 85%. Obtén tu certificado.', tipo: 'special', plan: 'elite', xp: 1500, duracion: 40 },
  { id: 'r100', numero: 100, fase: 7, faseName: 'Inversor Autónomo', titulo: '¡Inversor Autónomo!', descripcion: 'Has completado el programa completo de EasyTrading. Eres un inversor autónomo. ¡Enhorabuena!', tipo: 'special', plan: 'elite', xp: 2000, duracion: 5 },
]
