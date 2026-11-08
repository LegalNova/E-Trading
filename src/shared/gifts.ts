// Regalar Lumi (Plus o Max, 1 o 12 meses): constantes que comparten el servidor y la app.

/**
 * Hasta qué día (sin incluirlo, hora de Madrid) se ve la campaña de Navidad en Inicio.
 * Desde ese día el banner queda fijo con el texto «Regala Lumi». Para otra campaña, basta con cambiar la fecha.
 */
export const XMAS_UNTIL = '2027-01-07'

/** ¿Estamos en la campaña de Navidad? (se compara el día de Madrid, el mismo para todos) */
export function isXmas(now = Date.now()) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  return day < XMAS_UNTIL
}

export type GiftTier = 'PLUS' | 'PREMIUM'
export type GiftMonths = 1 | 12

/** Días que da cada duración al canjearlo */
export const GIFT_DAYS: Record<GiftMonths, number> = { 1: 30, 12: 365 }
/** Precio (el de 1 mes o el anual de la suscripción), en euros con impuestos */
export const GIFT_PRICE: Record<GiftTier, Record<GiftMonths, number>> = { PLUS: { 1: 3.99, 12: 29.99 }, PREMIUM: { 1: 7.99, 12: 59.99 } }
/** Meses que hay para canjearlo desde que se paga */
export const GIFT_REDEEM_MONTHS = 12
export const GIFT_MESSAGE_MAX = 200
export const GIFT_NAME_MAX = 40

/** Código del regalo: 10 caracteres sin letras que se confunden (sin I, L, O, 0 ni 1) */
export const GIFT_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const GIFT_CODE_LEN = 10
export const isGiftCode = (s: string) => new RegExp(`^[${GIFT_ALPHABET}]{${GIFT_CODE_LEN}}$`).test(s)
/** Normaliza lo que escribe o pega la persona (minúsculas, espacios, guiones) */
export const cleanGiftCode = (s: string) => s.toUpperCase().replace(/[\s-]/g, '').slice(0, 20)

/** Código guardado en el dispositivo mientras quien recibe el regalo crea su cuenta y pasa la bienvenida */
export const PENDING_GIFT_KEY = 'lumi:gift'
