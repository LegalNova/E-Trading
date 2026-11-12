// Importes que aparecen en los textos legales y en el centro de ayuda (auditoría P0-2).
// Regla: ningún precio se escribe a mano en src/legal ni en src/help. Todos salen de aquí, y aquí salen de las mismas
// tablas con las que se cobra (src/shared/plans.ts y src/shared/gifts.ts). tests/legal-prices.test.ts lo vigila.
import { money } from '@/shared/format'
import { GIFT_PRICE } from '@/shared/gifts'
import { GROUP_CAP, GROUP_PRICES, GROUP_SIZES, PRICES, STUDENT_MONTHS, TRIAL_DAYS, TRIAL_STREAK, TUTOR_LIMITS, type BillingInterval, type GroupSize, type PaidTier } from '@/shared/plans'

export type Lang = 'es' | 'ca' | 'en'

const PER: Record<Lang, Record<BillingInterval, string>> = {
  es: { MONTH: '/mes', YEAR: '/año' },
  ca: { MONTH: '/mes', YEAR: '/any' },
  en: { MONTH: '/month', YEAR: '/year' },
}

/** 5,99 € (castellano y catalán) · €5.99 (inglés) */
export const eur = (n: number, l: Lang) => money(n, 'EUR', l)

/** Precio de un plan individual: «5,99 €/mes» */
export const planPrice = (tier: PaidTier, interval: BillingInterval, l: Lang, student = false) => eur(PRICES[student ? 'student' : 'normal'][tier][interval], l) + PER[l][interval]

/** Precio de un plan de grupo: «15,99 €/mes» */
export const groupPrice = (size: GroupSize, tier: PaidTier, interval: BillingInterval, l: Lang, student = false) =>
  eur(GROUP_PRICES[String(size) as '4' | '8' | '0'][tier][interval][student ? 'student' : 'normal'], l) + PER[l][interval]

/** Precio de un regalo (pago único): 1 o 12 meses */
export const giftPrice = (tier: PaidTier, months: 1 | 12, l: Lang) => eur(GIFT_PRICE[tier][months], l)

/** Filas de la tabla de planes de grupo: tamaño · Plus al mes · Plus al año · Max al mes · Max al año */
export const groupRows = (l: Lang, sizeLabel: (size: GroupSize) => string, student = false): string[][] =>
  GROUP_SIZES.map(size => [sizeLabel(size), groupPrice(size, 'PLUS', 'MONTH', l, student), groupPrice(size, 'PLUS', 'YEAR', l, student), groupPrice(size, 'PREMIUM', 'MONTH', l, student), groupPrice(size, 'PREMIUM', 'YEAR', l, student)])

/** Cifras de las reglas que también citan los textos (para no escribirlas dos veces) */
export const RULES = { studentMonths: STUDENT_MONTHS, trialDays: TRIAL_DAYS, trialStreak: TRIAL_STREAK, groupCap: GROUP_CAP, tutor: TUTOR_LIMITS }

/** Todos los importes en euros que pueden aparecer en esos textos (lo usa el test) */
export function allowedAmounts(): number[] {
  const out: number[] = []
  for (const table of [PRICES.normal, PRICES.student]) for (const tier of Object.values(table)) out.push(...Object.values(tier))
  for (const size of Object.values(GROUP_PRICES)) for (const tier of Object.values(size)) for (const iv of Object.values(tier)) out.push(iv.normal, iv.student)
  for (const tier of Object.values(GIFT_PRICE)) out.push(...Object.values(tier))
  return out
}
