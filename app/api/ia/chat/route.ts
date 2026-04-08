import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { PLANES } from '@/lib/plans'

// In-memory rate limiting (replace with Redis in production)
const dailyUsage = new Map<string, { count: number; date: string }>()

function getDailyCount(userId: string): number {
  const today = new Date().toISOString().split('T')[0]
  const record = dailyUsage.get(userId)
  if (!record || record.date !== today) return 0
  return record.count
}

function incrementDaily(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const current = getDailyCount(userId)
  dailyUsage.set(userId, { count: current + 1, date: today })
}

// ── Mock responses keyed by mode and keywords ───────────────
const MOCK_RESPONSES: Record<string, { keywords: string[]; response: string }[]> = {
  explicar: [
    {
      keywords: ['bitcoin', 'btc', 'crypto', 'cripto'],
      response: '**Bitcoin** es la primera criptomoneda descentralizada, creada en 2009 por Satoshi Nakamoto. Es dinero digital que funciona sin bancos ni gobiernos.\n\n**Puntos clave:**\n- Oferta máxima: 21 millones de BTC\n- Funciona con tecnología blockchain\n- Volatilidad muy alta — puede subir o bajar un 20% en días\n- Se considera "oro digital" como reserva de valor\n\nRecuerda: en E-Trading operas con BTC virtual. **Acción sugerida:** Compra 0.001 BTC en el simulador y observa su comportamiento durante una semana.',
    },
    {
      keywords: ['etf', 'fondo', 'spy', 'qqq'],
      response: 'Un **ETF (Exchange Traded Fund)** es una cesta de activos que cotiza en bolsa como una acción normal.\n\n**¿Por qué son tan populares?**\n- Diversificación instantánea: compras el S&P 500 entero con un click\n- Comisiones muy bajas (0.03%-0.2% anual)\n- Liquidez total: puedes comprar o vender en cualquier momento\n\nEl **SPY** replica el S&P 500 (500 empresas de EE.UU.). El **QQQ** replica el Nasdaq 100 (tecnología). Son los más negociados del mundo.\n\n**Acción sugerida:** Compra 1 participación de SPY en el simulador y compara su comportamiento con AAPL.',
    },
    {
      keywords: ['per', 'valoracion', 'valoración', 'ratio', 'fundamenta'],
      response: 'El **PER (Price to Earnings Ratio)** es el ratio de valoración más usado en bolsa. Mide cuántas veces estás pagando los beneficios de una empresa.\n\n**Fórmula:** PER = Precio / BPA (Beneficio Por Acción)\n\n**Interpretación:**\n- PER < 15: empresa barata (posible trampa de valor)\n- PER 15-25: valoración razonable\n- PER > 30: cara (el mercado espera mucho crecimiento)\n\nEjemplo: Apple con PER 28 significa que pagas 28 años de beneficios actuales. ¿Está caro o barato? Depende del crecimiento esperado.\n\n**Acción sugerida:** Completa el reto #32 "PER, PVC y EV/EBITDA" para profundizar.',
    },
    {
      keywords: ['interes', 'interés', 'compuesto', 'compound'],
      response: 'El **interés compuesto** es la octava maravilla del mundo (Einstein dixit). Es el proceso de ganar intereses sobre los intereses ya generados.\n\n**Ejemplo real:**\n- 10.000€ al 8% simple: 10 años → 18.000€\n- 10.000€ al 8% compuesto: 10 años → **21.589€**\n\n**La regla del 72:** Divide 72 entre la rentabilidad anual y obtienes los años para doblar tu dinero. Al 8% → 72/8 = 9 años.\n\nEl factor más importante no es la cantidad inicial ni la rentabilidad — **es el tiempo**. Empezar hoy siempre es mejor que empezar mañana.\n\n**Acción sugerida:** Completa la clase "La octava maravilla del mundo" para ver los cálculos detallados.',
    },
    {
      keywords: ['riesgo', 'stop', 'loss', 'gestion', 'gestión'],
      response: 'La **gestión del riesgo** es lo más importante del trading. Los profesionales no evitan el riesgo, lo controlan.\n\n**Las 3 reglas de oro:**\n\n1. **Regla del 1%:** Nunca arriesgues más del 1% de tu capital en una operación. Con 10.000€ → máximo 100€ de pérdida posible.\n\n2. **Stop Loss:** Orden automática que cierra tu posición si el precio cae al nivel que defines. Sin stop loss eres vulnerable a pérdidas ilimitadas.\n\n3. **Ratio R/B mínimo 1:2:** Si arriesgas 100€, el objetivo debe ser al menos 200€. Así, aunque aciertes solo el 40%, eres rentable.\n\n**Acción sugerida:** Pon un stop loss en tu próxima operación del simulador.',
    },
    {
      keywords: [],
      response: 'Estoy aquí para ayudarte a entender los mercados financieros.\n\n**Conceptos que puedo explicarte:**\n- Acciones, ETFs, bonos, cripto\n- Análisis técnico y fundamental\n- Gestión del riesgo\n- Indicadores: RSI, medias móviles, MACD\n- Economía macro: tipos de interés, inflación\n- Sesgos conductuales\n\nPregúntame por cualquier concepto que no entiendas o que quieras profundizar. Cuanto más específica sea tu pregunta, mejor podré ayudarte.\n\n**Acción sugerida:** Empieza con la clase #1 "Tu dinero pierde valor cada día" si eres principiante.',
    },
  ],
  operacion: [
    {
      keywords: ['apple', 'aapl', 'microsoft', 'msft', 'google', 'googl'],
      response: 'Analizo tu operación en una empresa tecnológica. Aquí el marco que deberías aplicar:\n\n**Antes de entrar:**\n✓ ¿Cuál es tu tesis de inversión en 1 frase?\n✓ ¿Tienes stop loss definido?\n✓ ¿Cuál es tu objetivo de precio?\n✓ ¿Supera el ratio R/B 1:2?\n\n**Factores a vigilar en Big Tech:**\n- Resultados trimestrales (EPS y guidance)\n- Tipos de interés — afectan la valoración por DCF\n- Competencia y regulación antimonopolio\n- Márgenes y crecimiento de ingresos\n\n⚠️ Posible sesgo: **sobreconfianza** si llevas racha ganadora. El mercado siempre puede sorprender.\n\n**Acción sugerida:** Define tu stop loss antes de ejecutar la operación.',
    },
    {
      keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'cripto', 'crypto'],
      response: 'Analizando tu operación en cripto. Alta volatilidad = gestión de riesgo crítica.\n\n**Lo que debes tener claro:**\n- Cripto puede moverse ±20% en un día. ¿Puedes soportarlo emocionalmente?\n- Nunca inviertas más del 5-10% de tu portfolio en cripto\n- Los mercados cripto funcionan 24/7 — ten stop loss siempre\n\n**Posibles sesgos:**\n⚠️ **FOMO** — ¿Entras porque sube o porque tienes una tesis?\n⚠️ **Sesgo de recencia** — Las subidas recientes no garantizan continuidad\n\n**Framework para cripto:**\n1. ¿Cuál es el caso de uso real?\n2. ¿Cuánto del marketcap está justificado?\n3. ¿Dónde pongo el stop?\n\n**Acción sugerida:** Limita esta posición al 5% de tu capital virtual.',
    },
    {
      keywords: [],
      response: 'Para analizar bien tu operación necesito más contexto. Dime:\n\n1. **¿Qué activo?** (AAPL, BTC, SPY...)\n2. **¿Precio de entrada?**\n3. **¿Stop loss definido?**\n4. **¿Cuál es tu tesis?** (¿Por qué subirá?)\n5. **¿Horizonte temporal?** (días, semanas, meses)\n\n**Checklist rápido antes de operar:**\n✓ Ratio R/B mayor de 1:2\n✓ Stop loss puesto\n✓ Tamaño de posición correcto (regla del 1%)\n✓ No opero por emoción (FOMO, miedo)\n\n**Acción sugerida:** Describe tu operación con estos datos y te doy un análisis completo.',
    },
  ],
  aprender: [
    {
      keywords: ['empezar', 'principiante', 'nuevo', 'start'],
      response: 'Perfecto, empezamos desde cero. **Ruta óptima para principiantes:**\n\n**Semana 1-2 (Fase 1: Despertar Financiero)**\n→ Clase: "Tu dinero pierde valor cada día"\n→ Reto: "¿Qué es el dinero?"\n→ Reto: "Tu primera operación"\n\n**Semana 3-4 (Fase 1 continúa)**\n→ Clase: "Gestión del riesgo: lo más importante"\n→ Reto: "El poder del interés compuesto"\n\n**Por qué este orden:**\nAntes de operar, debes entender por qué inviertes y cómo proteger tu capital. Los errores de gestión del riesgo destruyen carteras.\n\n**Acción sugerida:** Completa hoy el reto #1 "¿Qué es el dinero?" — solo 5 minutos.',
    },
    {
      keywords: ['siguiente', 'próximo', 'proximo', 'ahora', 'continuar'],
      response: 'Para recomendarte el siguiente paso óptimo, el sistema analiza tu progreso. **Ruta de aprendizaje personalizada:**\n\n**Si estás en Fase 1-2:**\nPrioridad → Gestión del riesgo + primeras operaciones en el simulador\n\n**Si estás en Fase 3-4:**\nPrioridad → Análisis técnico (soportes, medias móviles, RSI) + análisis fundamental (PER, FCF)\n\n**Si estás en Fase 5-7:**\nPrioridad → Psicología del trading + construcción de sistema propio\n\n**Principio universal:** Siempre consolida antes de avanzar. Un reto bien asimilado vale más que diez completados a la ligera.\n\n**Acción sugerida:** Revisa tu portafolio virtual y analiza tus últimas 3 operaciones.',
    },
    {
      keywords: [],
      response: 'E-Trading tiene 100 retos en 7 fases diseñados para llevarte de principiante a inversor autónomo.\n\n**Las 7 fases:**\n1. Despertar Financiero — conceptos básicos\n2. Operador Informado — primeras operaciones\n3. Analista — análisis técnico y fundamental\n4. Estratega — estrategias completas\n5. Trader Activo — operativa avanzada\n6. Mente de Trader — psicología\n7. Inversor Autónomo — independencia\n\n**Mi recomendación:** Sigue el orden. Cada fase construye sobre la anterior. El impulso de saltarse fases es el primer sesgo que hay que controlar.\n\n**Acción sugerida:** Ve a la sección Retos y abre el siguiente reto de tu fase actual.',
    },
  ],
  mercado: [
    {
      keywords: ['bitcoin', 'btc', 'cripto', 'crypto'],
      response: '**Mercado cripto:** Los mercados de criptomonedas operan 24/7 y son significativamente más volátiles que los mercados tradicionales.\n\n**Factores que mueven el cripto:**\n- Decisiones regulatorias (SEC, BCE, gobiernos)\n- Movimientos de ballenas (grandes holders)\n- Sentimiento de mercado (Fear & Greed Index)\n- Eventos on-chain (halvings, actualizaciones)\n- Correlación inversa con dólar (DXY)\n\n**Señales a vigilar:**\n- Volumen: un movimiento sin volumen no es fiable\n- Dominancia de BTC: si sube, el dinero sale de altcoins\n- Funding rate en futuros: indica posicionamiento del mercado\n\n⚠️ Sesgo más común: **FOMO** en subidas rápidas.\n\n**Acción sugerida:** Observa el gráfico de BTC en distintos timeframes antes de operar.',
    },
    {
      keywords: ['bolsa', 'acciones', 'sp500', 's&p', 'nasdaq', 'mercado'],
      response: '**Mercado de renta variable:** Las bolsas reflejan las expectativas de beneficios futuros de las empresas.\n\n**Factores macro clave ahora:**\n- Política monetaria de la Fed y el BCE (tipos de interés)\n- Inflación y IPC\n- Resultados corporativos (earnings season)\n- Geopolítica y disrupciones de supply chain\n\n**Indicadores a seguir:**\n- VIX (índice del miedo): >25 = volatilidad alta\n- Curva de tipos: si se invierte, señal de recesión\n- Amplitud de mercado: ¿suben todos los sectores o solo unos pocos?\n\n**Regla de oro:** El mercado puede estar equivocado más tiempo del que tú puedes mantenerte solvente.\n\n**Acción sugerida:** Revisa el calendario económico esta semana y marca las fechas de resultados.',
    },
    {
      keywords: [],
      response: 'Los mercados financieros funcionan como un sistema de descuento de expectativas futuras. El precio de hoy refleja todo lo que el mercado sabe y espera.\n\n**Los 4 factores que mueven los mercados:**\n1. **Beneficios corporativos** — earnings, márgenes, guidance\n2. **Tipos de interés** — suben tipos → bajan bolsas (generalmente)\n3. **Liquidez** — más dinero en el sistema → activos de riesgo suben\n4. **Sentimiento** — el factor más irracional y poderoso a corto plazo\n\n**Ciclo económico:**\nExpansión → Pico → Contracción → Valle\nCada fase favorece sectores distintos (rotación sectorial).\n\n**Acción sugerida:** Completa el reto "Análisis de sectores" para entender la rotación.',
    },
  ],
  sesgos: [
    {
      keywords: ['fomo', 'subiendo', 'sube', 'perdiendo', 'perdiendo', 'oportunidad'],
      response: '**Sesgo detectado: FOMO (Fear Of Missing Out)**\n\nEl FOMO es el miedo a quedarse fuera de una oportunidad. Lleva a comprar en máximos, justo cuando el riesgo es mayor.\n\n**Síntomas:**\n- "Tengo que comprar ahora antes de que suba más"\n- "Todo el mundo está ganando menos yo"\n- Decisiones rápidas sin análisis\n\n**El antídoto:**\nPregúntate: "¿Compraría este activo si no hubiera subido un 20%?"\nSi la respuesta es no, es FOMO.\n\n**Dato estadístico:** Los inversores que compran en máximos por FOMO obtienen rentabilidades un 34% peores que los que siguen su plan.\n\n**Acción sugerida:** Antes de cualquier compra impulsiva, espera 24 horas y revisa tu tesis.',
    },
    {
      keywords: ['perdida', 'pérdida', 'perder', 'aversion', 'aversión', 'vender'],
      response: '**Sesgo detectado: Aversión a la pérdida**\n\nLas pérdidas duelen el doble que lo que satisfacen las ganancias equivalentes (Kahneman & Tversky). Esto lleva a mantener posiciones perdedoras demasiado tiempo.\n\n**Manifestaciones:**\n- No vender aunque la tesis haya cambiado\n- Promediar a la baja sin análisis\n- "Cuando vuelva al precio de compra, vendo"\n\n**La trampa del precio de compra:**\nEl mercado no sabe ni le importa a qué precio compraste. La única pregunta relevante es: "Si no tuviera esta posición, ¿la compraría hoy?"\n\n**Solución:** El stop loss elimina la decisión emocional antes de que la emoción aparezca.\n\n**Acción sugerida:** Revisa cada posición de tu portafolio con esta pregunta: ¿la comprarías hoy?',
    },
    {
      keywords: ['confirmacion', 'confirmación', 'busco', 'creo que', 'seguro'],
      response: '**Sesgo detectado: Sesgo de confirmación**\n\nBuscamos información que confirma lo que ya creemos e ignoramos la que nos contradice. En trading, es especialmente peligroso.\n\n**Ejemplo:** "Apple va a subir" → Solo lees noticias positivas de Apple. Ignoras las negativas.\n\n**El efecto:** Sobreconfianza en tus análisis, infraestimación del riesgo.\n\n**Cómo combatirlo:**\n1. Busca activamente argumentos en contra de tu tesis\n2. Lee análisis bajistas aunque seas alcista\n3. Pregúntate: "¿Qué tendría que pasar para que estuviera equivocado?"\n4. Habla con alguien que tenga la tesis opuesta\n\n**Acción sugerida:** Escribe los 3 principales riesgos de tu posición actual.',
    },
    {
      keywords: [],
      response: 'Los sesgos conductuales son errores sistemáticos de razonamiento que afectan a todos los inversores, incluso a los profesionales.\n\n**Los 8 sesgos más dañinos:**\n\n1. **Aversión a la pérdida** — Las pérdidas duelen más que las ganancias satisfacen\n2. **FOMO** — Miedo a quedarse fuera cuando todo sube\n3. **Sesgo de confirmación** — Solo buscamos lo que confirma nuestra tesis\n4. **Mentalidad de rebaño** — Hacemos lo que hace la mayoría\n5. **Sobreconfianza** — Creemos ser mejores de lo que somos\n6. **Anclaje de precio** — El precio de compra nos ancla psicológicamente\n7. **Sesgo de recencia** — Lo último que pasó nos parece más probable\n8. **Efecto disposición** — Vendemos ganadores pronto y mantenemos perdedores\n\n**Acción sugerida:** Descríbeme tu última operación y buscaré el sesgo presente.',
    },
  ],
}

function getMockResponse(mode: string, message: string): string {
  const msgLower = message.toLowerCase()
  const modeResponses = MOCK_RESPONSES[mode] ?? MOCK_RESPONSES.explicar
  for (const item of modeResponses) {
    if (item.keywords.length === 0) continue
    if (item.keywords.some(kw => msgLower.includes(kw))) {
      return item.response
    }
  }
  // Return the default (last) response for the mode
  const fallback = modeResponses[modeResponses.length - 1]
  return fallback?.response ?? 'Pregúntame cualquier duda sobre inversión y mercados. Estoy aquí para ayudarte a aprender.'
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { message, mode, history = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    // Get user plan
    const userPlan = ((session?.user as Record<string, unknown>)?.plan as string) ?? 'free'
    const userId = ((session?.user as Record<string, unknown>)?.id as string) ?? 'anonymous'

    // Check daily limit
    const planConfig = PLANES[userPlan as keyof typeof PLANES] ?? PLANES.free
    const dailyLimit = planConfig.iaMsgsDia
    if (dailyLimit !== null) {
      const used = getDailyCount(userId)
      if (used >= dailyLimit) {
        return NextResponse.json({
          error: `Has alcanzado el límite de ${dailyLimit} mensajes diarios del plan ${userPlan}. Mejora tu plan para continuar.`,
          limitReached: true,
        }, { status: 429 })
      }
    }

    const hasAnthropicKey = !!(process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-'))
    let response: string
    let isDemo = false

    if (hasAnthropicKey) {
      // Use real Anthropic API
      try {
        const { chatIA } = await import('@/lib/anthropic')
        const userContext = {
          plan: userPlan,
          xp: ((session?.user as Record<string, unknown>)?.xp as number) ?? 0,
          nivel: 'Principiante',
          retosCompletados: 0,
          clasesCompletadas: 0,
          numPosiciones: 0,
          cash: 10000,
          racha: 0,
          totalOperaciones: 0,
        }
        const marketData = [
          { sym: 'AAPL', price: 185.42, chg: 1.23 },
          { sym: 'NVDA', price: 875.20, chg: 3.21 },
          { sym: 'BTC', price: 67240, chg: 2.14 },
          { sym: 'SPY', price: 521.18, chg: 0.87 },
          { sym: 'ETH', price: 3498, chg: -0.94 },
        ]
        response = await chatIA({
          userMessage: message,
          user: userContext,
          mode: (mode as import('@/lib/anthropic').IAModo) || 'explicar',
          marketData,
          history: history.slice(-10),
        })
      } catch (err) {
        console.error('Anthropic API error, falling back to mock:', err)
        response = getMockResponse(mode || 'explicar', message)
        isDemo = true
      }
    } else {
      response = getMockResponse(mode || 'explicar', message)
      isDemo = true
    }

    // Count usage
    incrementDaily(userId)
    const remaining = dailyLimit !== null ? dailyLimit - getDailyCount(userId) : null

    return NextResponse.json({ response, remaining, isDemo })
  } catch (error) {
    console.error('IA chat error:', error)
    return NextResponse.json({ error: 'Error del servidor. Intenta de nuevo.' }, { status: 500 })
  }
}
