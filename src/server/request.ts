import 'server-only'
// Contexto de la petición en curso: método (las lecturas no bloquean ni escriben) y resultados ya calculados
// (la sesión se comprueba una sola vez por petición aunque varias funciones la pidan).
import { AsyncLocalStorage } from 'node:async_hooks'

const store = new AsyncLocalStorage<{ method: string; memo: Map<string, Promise<unknown>> }>()

export const withRequest = <T>(method: string, fn: () => T): T => store.run({ method, memo: new Map() }, fn)

/** ¿Es una petición de solo lectura (GET)? Fuera de una petición (tareas programadas) se trata como escritura */
export const isReadRequest = () => store.getStore()?.method === 'GET'

/** Olvida lo calculado (tras cambiar el usuario dentro de la misma petición) */
export const forgetMemo = () => store.getStore()?.memo.clear()

/** Calcula una vez por petición */
export function memo<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const s = store.getStore()
  if (!s) return fn()
  const hit = s.memo.get(key) as Promise<T> | undefined
  if (hit) return hit
  const p = fn()
  s.memo.set(key, p)
  return p
}
