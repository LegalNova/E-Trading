import 'server-only'
// Límite de peticiones por clave (usuario o IP), con ventana fija y guardado en BD:
// así funciona aunque Vercel reparta las peticiones entre varias instancias.
// Una sola sentencia atómica: sin carreras entre peticiones simultáneas.
import { db, DB_SCHEMA } from '../db'
import { HttpError } from '../game/core'

export async function rateLimit(key: string, max: number, windowSec: number) {
  const windowStart = new Date(Math.floor(Date.now() / (windowSec * 1000)) * windowSec * 1000)
  const rows = await db.$queryRawUnsafe<{ count: number }[]>(
    `INSERT INTO "${DB_SCHEMA}"."ApiRateLimit" ("key", "count", "windowStart") VALUES ($1, 1, $2)
     ON CONFLICT ("key") DO UPDATE SET
       "count" = CASE WHEN "ApiRateLimit"."windowStart" = EXCLUDED."windowStart" THEN "ApiRateLimit"."count" + 1 ELSE 1 END,
       "windowStart" = EXCLUDED."windowStart"
     RETURNING "count"`,
    key.slice(0, 200),
    windowStart,
  )
  if ((rows[0]?.count ?? 0) > max) throw new HttpError(429, 'RATE_LIMITED', 'Demasiadas peticiones. Espera un momento.')
}

/** IP del cliente tal como la entrega Vercel */
export function clientIp(req: Request) {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
}
