// Tarea programada (cada minuto desde cron-job.org, D-020): refresca precios y ejecuta
// órdenes pendientes y alertas de todos los usuarios (criterio F7). Protegida con CRON_SECRET.
import { db } from '@/server/db'
import { withCtx } from '@/server/game/core'
import { priceBook, processPendingFor } from '@/server/game/trading'

export const maxDuration = 60

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ error: { code: 'UNAUTHORIZED', message: 'No autorizado' } }, { status: 401 })
  const t0 = Date.now()
  const book = await priceBook()
  const users = await db.user.findMany({ where: { blockedAt: null, OR: [{ orders: { some: { status: 'PENDING' } } }, { alerts: { some: { active: true } } }] }, take: 500 })
  let done = 0
  for (const u of users) {
    try {
      await withCtx(c => processPendingFor(c, book), u)
      done++
    } catch (e) {
      console.error('cron/tick', u.id, e)
    }
  }
  return Response.json({ prices: book.size, users: users.length, processed: done, ms: Date.now() - t0 })
}
