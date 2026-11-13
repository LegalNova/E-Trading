import { getRequestConfig } from 'next-intl/server'
import { routing, isLocale } from './routing'

/** Textos por áreas (messages/<idioma>/<área>.json) además del archivo general: cada área edita el suyo */
const AREAS = ['admin', 'gifts', 'missions', 'leagues', 'market', 'tutor', 'project', 'billing', 'brand', 'daily', 'inbox', 'route', 'shop'] as const

type Tree = Record<string, unknown>
const isObj = (v: unknown): v is Tree => !!v && typeof v === 'object' && !Array.isArray(v)
function merge(a: Tree, b: Tree): Tree {
  const out: Tree = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = isObj(out[k]) && isObj(v) ? merge(out[k] as Tree, v) : v
  return out
}

// El idioma viene del segmento [locale] de la URL (vía setRequestLocale),
// así las páginas se pueden prerenderizar sin leer cabeceras ni cookies.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = requested && isLocale(requested) ? requested : routing.defaultLocale
  let messages = (await import(`../../messages/${locale}.json`)).default as Tree
  for (const a of AREAS) messages = merge(messages, (await import(`../../messages/${locale}/${a}.json`)).default as Tree)
  return { locale, messages, timeZone: 'Europe/Madrid' }
})
