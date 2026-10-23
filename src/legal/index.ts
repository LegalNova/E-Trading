import { ca } from './ca'
import { en } from './en'
import { es } from './es'
import type { LegalDoc, LegalSlug } from './types'

export const LEGAL: Record<'es' | 'ca' | 'en', Record<LegalSlug, LegalDoc>> = { es, ca, en }
export * from './types'
