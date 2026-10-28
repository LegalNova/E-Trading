import 'server-only'
// Idioma de la petición en curso (el móvil lo envía en «x-locale»): los textos del curso y del motor se sirven en él.
import { AsyncLocalStorage } from 'node:async_hooks'

export type Loc = 'es' | 'ca' | 'en'
const store = new AsyncLocalStorage<Loc>()
const valid = (v: string | null | undefined): v is Loc => v === 'es' || v === 'ca' || v === 'en'

export const withLocale = <T>(header: string | null, fn: () => T): T => store.run(valid(header) ? header : 'es', fn)
export const currentLocale = (): Loc => store.getStore() ?? 'es'
