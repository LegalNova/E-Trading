// Usos de las gemas (auditoría PRO-1, PRO-2 y PRO-7). Todos los precios en una sola tabla, para poder ajustarlos sin
// tocar nada más. Solo se gastan gemas ganadas en la app: aquí no hay ningún pago con dinero real (eso sería PRO-3,
// que va apagado y después del abogado).
export const GEM_PRICES = {
  /** Pista en una pregunta de opción única: quita una opción incorrecta */
  hint: 15,
  /** +5.000 € de dinero virtual para practicar (entra como aportación: no cuenta como rentabilidad ni en la liga) */
  cash: 250,
  /** Abrir para siempre una clase de pago suelta */
  lesson: 150,
  /** 10 preguntas más a Lumi, solo hoy */
  tutor: 60,
  /** Un reinicio más de la cartera virtual este año */
  reset: 300,
  /** Pase Max de 24 horas (solo plan gratis; dos al mes) */
  maxPass: 400,
} as const

/** Preguntas extra a Lumi que da una compra y pases Max que se pueden comprar al mes */
export const TUTOR_EXTRA = 10
export const MAX_PASSES_PER_MONTH = 2

/** Dinero virtual que da una compra y cuántas se pueden hacer al mes */
export const CASH_PACK = 5000
export const CASH_PACKS_PER_MONTH = 2

/** Colores de Lumi que se compran con gemas (los de siempre siguen siendo gratis o por nivel) */
export const GEM_SKINS: { id: string; color: string; price: number }[] = [
  { id: 'menta', color: '#30D158', price: 150 },
  { id: 'coral', color: '#FF6B6B', price: 150 },
  { id: 'lavanda', color: '#BF8CFF', price: 300 },
  { id: 'oro', color: '#E8B923', price: 600 },
]

/** Tipos de pregunta en los que se puede pedir pista (una sola respuesta buena entre tres o más) */
export const HINT_TYPES = new Set(['SINGLE', 'SCENARIO', 'CHAT'])
