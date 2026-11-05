import { ca } from './ca'
import { en } from './en'
import { es } from './es'
import type { HelpDoc } from './types'

export const HELP: Record<'es' | 'ca' | 'en', HelpDoc> = { es, ca, en }
export type { HelpDoc }
