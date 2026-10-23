import { defineRouting } from 'next-intl/routing'

/** Idiomas de la app. Para añadir uno: añadirlo aquí y crear messages/<código>.json */
export const routing = defineRouting({
  locales: ['es', 'ca', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value)
}
