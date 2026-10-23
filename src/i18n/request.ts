import { getRequestConfig } from 'next-intl/server'
import { routing, isLocale } from './routing'

// El idioma viene del segmento [locale] de la URL (vía setRequestLocale),
// así las páginas se pueden prerenderizar sin leer cabeceras ni cookies.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = requested && isLocale(requested) ? requested : routing.defaultLocale
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Europe/Madrid',
  }
})
