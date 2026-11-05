import 'server-only'
// «Ver la app como este usuario» (solo ADMIN). La API ya ha comprobado que quien pide es admin;
// mientras dura la petición, la sesión es la del usuario elegido y no se guarda ningún cambio:
// las escrituras se rechazan (403) y las lecturas que escriben (racha, eventos) se deshacen al final.
import { AsyncLocalStorage } from 'node:async_hooks'

const store = new AsyncLocalStorage<{ targetId: string; adminId: string }>()

export const withViewAs = <T>(v: { targetId: string; adminId: string } | null, fn: () => T): T => (v ? store.run(v, fn) : fn())
export const viewAs = () => store.getStore() ?? null
