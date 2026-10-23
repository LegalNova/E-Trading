export interface LegalSection {
  h: string
  p?: string[]
  list?: string[]
  table?: { head: string[]; rows: string[][] }
}
export interface LegalDoc {
  title: string
  intro: string
  sections: LegalSection[]
}
export type LegalSlug = 'aviso-legal' | 'privacidad' | 'cookies' | 'terminos'
export const LEGAL_SLUGS: LegalSlug[] = ['aviso-legal', 'privacidad', 'cookies', 'terminos']
