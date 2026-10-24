import 'server-only'
// Lumi como entrenadora en cada orden: revisa la operación con las reglas del curso antes de confirmar.
// Todo es lógica propia (sin IA externa): compara la orden con la cartera, el precio de hoy y el historial reciente.
import type { CoachTipT } from '@/shared/contract'

export interface CoachInput {
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT'
  name: string
  assetType: string
  /** Variación de hoy en % (precio frente al cierre anterior) */
  dayChangePct: number
  amount: number
  /** Valor total de la cartera y efectivo, en euros */
  total: number
  cashAfter: number
  /** Posición actual en este activo: precio medio y precio de hoy en euros */
  position: { avgEur: number; nowEur: number; value: number } | null
  /** Peso de las cripto en la cartera tras la orden (%) */
  cryptoWeightAfter: number
  /** Operaciones ejecutadas hoy, ventas con pérdida en las últimas 24 h e importe medio de compra */
  tradesToday: number
  losingSellsDay: number
  avgBuy: number
  /** ¿Tiene ya un stop loss pendiente en este activo? ¿Puede usar stops? */
  hasStop: boolean
  canStop: boolean
  /** Otras posiciones con pérdida de más del 15 % (para el efecto disposición) */
  bigLosers: number
}

const pct = (v: number) => `${Math.abs(v).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`

export function coach(i: CoachInput): CoachTipT[] {
  const tips: CoachTipT[] = []
  const add = (code: string, level: CoachTipT['level'], title: string, body: string, lessonId: string | null = null) => tips.push({ code, level, title, body, lessonId })
  const gain = i.position ? (i.position.nowEur / i.position.avgEur - 1) * 100 : 0
  if (i.amount <= 0) return tips

  if (i.side === 'BUY') {
    const fomoAt = i.assetType === 'CRYPTO' ? 10 : 6
    if (i.dayChangePct >= fomoAt)
      add('FOMO', 'WARN', `${i.name} sube un ${pct(i.dayChangePct)} hoy`, 'Comprar justo después de una subida fuerte suele ser FOMO. Pregúntate si lo comprarías igual si nadie hablara de ello, o espera 48 horas.', 'u11l3')
    if (i.dayChangePct <= -8)
      add('KNIFE', 'WARN', `${i.name} cae un ${pct(i.dayChangePct)} hoy`, 'Una caída así suele tener un motivo (resultados, noticias). Averígualo antes: lo que ha caído mucho puede seguir cayendo.', 'u5l9')
    if (i.position && gain <= -10)
      add('AVERAGING_DOWN', 'WARN', `Ya pierdes un ${pct(gain)} en ${i.name}`, 'Comprar más para bajar tu precio medio (promediar a la baja) solo tiene sentido si tu tesis sigue intacta. Si no, es el sesgo del coste hundido.', 'u11l5')
    if (i.losingSellsDay >= 2 && i.avgBuy > 0 && i.amount > i.avgBuy * 1.5)
      add('REVENGE', 'WARN', 'Después de perder, una compra más grande', `Hoy has cerrado ${i.losingSellsDay} operaciones con pérdida y esta compra es mayor de lo habitual. Si es para recuperar, es operar por venganza: mejor parar hoy.`, 'u11l6')
    if (i.tradesToday >= 5)
      add('OVERTRADING', 'INFO', `Llevas ${i.tradesToday} operaciones hoy`, 'Operar mucho multiplica los costes y suele empeorar los resultados (Barber y Odean). ¿Esta operación está en tu plan?', 'u1l7')
    if (i.cryptoWeightAfter > 30 && i.assetType === 'CRYPTO')
      add('CRYPTO_HEAVY', 'WARN', `Las cripto serían el ${pct(i.cryptoWeightAfter)} de tu cartera`, 'Son muy volátiles y suelen caer a la vez: caídas del 70 % han pasado varias veces. Una parte pequeña es lo prudente.', 'u2l9')
    if (i.total > 0 && i.cashAfter / i.total < 0.05)
      add('NO_CASH', 'INFO', 'Te quedarías casi sin efectivo', 'Sin liquidez no podrás aprovechar una caída ni rebalancear. Muchos inversores guardan siempre una parte.', 'u4l4')
    if (i.canStop && !i.hasStop && i.type === 'MARKET' && i.assetType !== 'INDEX')
      add('NO_STOP', 'INFO', '¿Dónde te equivocas?', 'Decide ahora dónde pondrías el stop loss y calcula el tamaño con la regla del 1 %. Si no sabes dónde está tu stop, no sabes cuánto arriesgas.', 'u10l2')
    if (!tips.length) add('OK', 'OK', 'Buena pinta', 'No veo ninguna señal de alarma en esta compra. Recuerda por qué la haces y qué te haría vender.')
  } else {
    if (i.position && gain > 0 && i.bigLosers > 0)
      add('DISPOSITION', 'WARN', `Vendes ${i.name} ganando un ${pct(gain)}`, `Y mantienes ${i.bigLosers === 1 ? 'otra posición que pierde' : `${i.bigLosers} posiciones que pierden`} más de un 15 %. Vender lo que gana y aguantar lo que pierde es el efecto disposición.`, 'u11l2')
    if (i.position && gain < 0 && i.dayChangePct <= -5)
      add('PANIC', 'WARN', `Vendes en una caída del ${pct(i.dayChangePct)} de hoy`, 'Vender en pleno pánico suele ser vender cerca del mínimo. Si tu plan tenía un stop, respétalo; si no, decide con calma qué ha cambiado en tu tesis.', 'u3l6')
    if (i.tradesToday >= 5)
      add('OVERTRADING', 'INFO', `Llevas ${i.tradesToday} operaciones hoy`, 'Cada operación paga comisión y spread. ¿Esta venta está en tu plan?', 'u1l7')
  }
  return tips
}
