// Centro de ayuda (preguntas frecuentes). Las respuestas describen cómo funciona la app de verdad:
// si cambia una regla (vidas, precios, límites), hay que actualizar también estos textos.
export interface HelpItem {
  id: string
  q: string
  a: string[]
  links?: { href: string; label: string }[]
}
export interface HelpCategory {
  id: string
  title: string
  items: HelpItem[]
}
export interface HelpDoc {
  title: string
  intro: string
  search: string
  noResults: string
  all: string
  contactTitle: string
  contactBody: string
  contactCta: string
  legalTitle: string
  categories: HelpCategory[]
}
