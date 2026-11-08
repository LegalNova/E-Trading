// Tareas diarias (Vercel Cron, D-020):
//  ?job=close  → cierra la liga de la semana anterior (idempotente; corre cada día por si falló el lunes)
//  ?job=remind → avisa a quien tiene racha y aún no ha hecho nada hoy; los lunes, protector semanal de Premium
import { addDays, dayOf, weekOf } from '@/shared/time'
import { db } from '@/server/db'
import { MAX_FREEZES, notify } from '@/server/game/core'
import { closeWeek } from '@/server/game/league'
import { cronAuthorized } from '@/server/http/cron'
import { remindStudentExpiry } from '@/server/game/students'

export const maxDuration = 60

export async function GET(req: Request) {
  if (!cronAuthorized(req)) return Response.json({ error: { code: 'UNAUTHORIZED', message: 'No autorizado' } }, { status: 401 })
  const job = new URL(req.url).searchParams.get('job')
  if (job === 'close') {
    // La semana pasada y cualquier semana anterior que se quedara sin cerrar (el cierre se reanuda donde lo dejó)
    const open = await db.leagueMember.groupBy({ by: ['weekKey'], where: { weekKey: { lt: weekOf() }, finalRank: null }, orderBy: { weekKey: 'asc' } })
    const weeks = [...new Set([...open.map(w => w.weekKey), addDays(weekOf(), -7)])]
    const results = []
    for (const w of weeks) results.push(await closeWeek(w))
    const league = { weeks: results }
    // Invitados que no han vuelto en 30 días: se borran con todo su progreso (lo dice la política de privacidad)
    const old = new Date(Date.now() - 30 * 86_400_000)
    const guests = await db.user.deleteMany({ where: { isAnonymous: true, createdAt: { lt: old }, sessions: { none: { updatedAt: { gte: old } } } } })
    return Response.json({ ...league, guestsDeleted: guests.count })
  }
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
    // A la semana de empezar: aviso para darnos su opinión (una sola vez, si ha hecho alguna clase)
    const from = new Date(Date.now() - 8 * 86_400_000)
    const to = new Date(Date.now() - 7 * 86_400_000)
    const week = await db.user.findMany({ where: { createdAt: { gte: from, lt: to }, blockedAt: null, feedback: { none: {} }, lessons: { some: {} } }, select: { id: true }, take: 5000 })
    let asked = 0
    for (const u of week) {
      if (await db.notification.count({ where: { userId: u.id, deepLink: '/opinion' } })) continue
      await notify({ tx: db, user: { id: u.id } as never }, 'NEW_LESSON', 'Lumi quiere saber qué te parece', 'Seis preguntas rápidas, un minuto. Te lo agradecemos con 50 gemas.', '/opinion')
      asked++
    }
    // Precio de estudiante: aviso 15 días antes de que termine (una vez)
    const studentNotices = await remindStudentExpiry().catch(e => (console.error('cron/student', e), 0))
    return Response.json({ reminders: sent, freezes, feedbackAsked: asked, studentNotices })
  }
  return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'job=close|remind' } }, { status: 422 })
}
