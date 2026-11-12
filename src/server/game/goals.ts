import 'server-only'
// Objetivo diario «Revisa tu cartera o tu diario» (auditoría APP-38). Sustituye a «haz 2 compras o ventas», que
// invitaba a operar por operar. Se cumple al abrir la cartera o el diario; conserva el nombre interno «ops».
import { bumpGoal, endFx, HttpError, withCtx } from './core'

const REVIEW_PATH = /\/mercado\/(cartera|diario)$/

/** ¿Es el aviso de «pantalla vista» de la cartera o del diario? */
export const isReviewView = (body: unknown) => {
  const e = body as { name?: unknown; path?: unknown } | null
  return e?.name === 'screen_view' && typeof e.path === 'string' && REVIEW_PATH.test(e.path.toLowerCase().replace(/\/+$/, ''))
}

/** Apunta el objetivo del día si la pantalla vista es la cartera o el diario (sin sesión, no hace nada) */
export async function reviewGoalOnView(body: unknown) {
  if (!isReviewView(body)) return
  try {
    await withCtx(async c => {
      await bumpGoal(c, 'ops')
      await endFx(c)
    })
  } catch (e) {
    // Sin sesión o con la cuenta a medio registrar: no hay objetivo que apuntar
    if (!(e instanceof HttpError)) throw e
  }
}
