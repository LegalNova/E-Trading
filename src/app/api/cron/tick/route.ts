// Tarea programada (cada hora con Vercel Cron; cada minuto si se añade cron-job.org, D-020/D-036): refresca precios y ejecuta
// órdenes pendientes y alertas de todos los usuarios (criterio F7). Protegida con CRON_SECRET.
import { db } from '@/server/db'
import { cronAuthorized } from '@/server/http/cron'
import { withCtx } from '@/server/game/core'
import { priceBook, processPendingFor } from '@/server/game/trading'
import { refreshAll } from '@/server/market/service'

export const maxDuration = 60

export async function GET(req: Request) {
  if (!cronAuthorized(req)) return Response.json({ error: { code: 'UNAUTHORIZED', message: 'No autorizado' } }, { status: 401 })
  const t0 = Date.now()
  // Repaso de precios de todo el catálogo (una vez por hora)
  const refreshed = await refreshAll()
  const users = await db.user.findMany({ where: { blockedAt: null, OR: [{ orders: { some: { status: 'PENDING' } } }, { alerts: { some: { active: true } } }] }, take: 500 })
  const [ord, al] = await Promise.all([db.order.findMany({ where: { status: 'PENDING' }, select: { symbol: true } }), db.priceAlert.findMany({ where: { active: true }, select: { symbol: true } })])
  const book = await priceBook([...ord, ...al].map(x => x.symbol))
  let done = 0
  for (const u of users) {
    try {
      await withCtx(c => processPendingFor(c, book), u)
      done++
    } catch (e) {
      console.error('cron/tick', u.id, e)
    }
  }
  return Response.json({ refreshed, prices: book.size, users: users.length, processed: done, ms: Date.now() - t0 })
}
