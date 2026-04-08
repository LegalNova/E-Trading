import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type IAModo = 'explicar' | 'operacion' | 'aprender' | 'mercado' | 'sesgos'

export interface UserContext {
  plan: string
  xp: number
  nivel: string
  retosCompletados: number
  clasesCompletadas: number
  numPosiciones: number
  cash: number
  racha: number
  totalOperaciones: number
}

export interface MarketTick {
  sym: string
  price: number
  chg: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const MODO_LABELS: Record<IAModo, string> = {
  explicar: '👨‍🏫 Explicar conceptos',
  operacion: '📊 Analizar mi operación',
  aprender: '🗺️ Qué aprender ahora',
  mercado: '🌍 Análisis del mercado',
  sesgos: '🧠 Detectar sesgos',
}

function buildSystemPrompt(user: UserContext, modo: IAModo, marketData: MarketTick[]): string {
  const marketLines = marketData
    .slice(0, 5)
    .map(a => `- ${a.sym}: ${a.price} (${a.chg > 0 ? '+' : ''}${a.chg.toFixed(2)}%)`)
    .join('\n')

  return `Eres E-AI, el profesor personal de inversión de E-Trading.

DATOS DEL USUARIO AHORA MISMO:
- Plan: ${user.plan}
- XP: ${user.xp} · Nivel: ${user.nivel}
- Retos completados: ${user.retosCompletados}/50
- Clases completadas: ${user.clasesCompletadas}/12
- Portafolio: ${user.numPosiciones} posiciones, €${user.cash.toFixed(2)} disponibles
- Racha: ${user.racha} días consecutivos
- Total operaciones: ${user.totalOperaciones}

MERCADO AHORA MISMO:
${marketLines || '- Datos de mercado no disponibles'}

MODO ACTUAL: ${MODO_LABELS[modo]}

INSTRUCCIONES:
- Habla en español, tono cercano y directo
- Personaliza CADA respuesta con datos del usuario
- Máximo 200 palabras
- Detecta sesgos conductuales si los hay (aversión a pérdida, FOMO, sesgo de confirmación, mentalidad de rebaño, sobreconfianza, anclaje de precio, sesgo de recencia, efecto disposición)
- Termina siempre con 1 acción concreta sugerida
- Usa ** para negrita en conceptos clave
- Nunca des consejo financiero real — es simulación educativa`
}

export async function chatIA({
  userMessage,
  user,
  mode,
  marketData,
  history,
}: {
  userMessage: string
  user: UserContext
  mode: IAModo
  marketData: MarketTick[]
  history: ChatMessage[]
}): Promise<string> {
  const systemPrompt = buildSystemPrompt(user, mode, marketData)

  // Keep last 10 messages for context
  const recentHistory = history.slice(-10)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 400,
    system: systemPrompt,
    messages: [
      ...recentHistory,
      { role: 'user', content: userMessage },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')
  return block.text
}
