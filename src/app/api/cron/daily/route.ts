// Tareas diarias (Vercel Cron, D-020):
//  ?job=close  → cierra la liga de la semana anterior (idempotente; corre cada día por si falló el lunes)
//  ?job=remind → avisa a quien tiene racha y aún no ha hecho nada hoy; los lunes, protector semanal de Premium
import { addDays, dayOf, weekOf } from '@/shared/time'
import { db } from '@/server/db'
import { MAX_FREEZES, notify } from '@/server/game/core'
import { closeWeek } from '@/server/game/league'
import { cronAuthorized } from '@/server/http/cron'

export const maxDuration = 60

export async function GET(req: Request) {
  if (!cronAuthorized(req)) return Response.json({ error: { code: 'UNAUTHORIZED', message: 'No autorizado' } }, { status: 401 })
  const job = new URL(req.url).searchParams.get('job')
  if (job === 'close') return Response.json(await closeWeek(addDays(weekOf(), -7)))
  if (job === 'remind') {
    const today = dayOf()
    const atRisk = await db.gameState.findMany({ where: { streak: { gt: 0 }, lastActiveDay: { lt: today } }, include: { user: { select: { id: true, blockedAt: true, settings: true } } }, take: 5000 })
    let sent = 0
    for (const g of atRisk) {
      if (g.user.blockedAt) continue
      const prefs = (g.user.settings as { notificationPrefs?: Record<string, { inApp?: boolean }> } | null)?.notificationPrefs
      if (prefs?.STREAK_RISK?.inApp === false) continue
      const already = await db.notification.count({ where: { userId: g.userId, type: 'STREAK_RISK', createdAt: { gte: new Date(today + 'T00:00:00Z') } } })
      if (already) continue
      await notify({ tx: db, user: { id: g.userId } as never }, 'STREAK_RISK', `Tu racha de ${g.streak} días está en peligro`, 'Una clase de 5 minutos basta para mantenerla hoy.', '/clases')
      sent++
    }
    // Lunes: un protector de racha para cada Premium (máximo 2 acumulados)
    let freezes = 0
    if (new Date().getUTCDay() === 1) freezes = (await db.gameState.updateMany({ where: { freezes: { lt: MAX_FREEZES }, user: { plan: 'PREMIUM' } }, data: { freezes: { increment: 1 } } })).count
    return Response.json({ reminders: sent, freezes })
  }
  return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'job=close|remind' } }, { status: 422 })
}
