import 'server-only'
// Opinión de los usuarios: a la semana de empezar se les pide (en Inicio y con un aviso) y cuando quieran desde Perfil.
import { z } from 'zod'
import { FB_BLOCKERS, FB_LIKES, FB_PAY, FB_PRICE, FB_WANTS, FEEDBACK_GEMS } from '@/shared/feedback'
import { db } from '../db'
import { currentUser } from '../auth'
import { fail, withCtx } from './core'
import { track } from './analytics'

const DAY_MS = 86_400_000
export const FEEDBACK_AFTER_DAYS = 7

export const FeedbackInput = z.object({
  nps: z.number().int().min(0).max(10),
  likes: z.array(z.enum(FB_LIKES)).max(3),
  blockers: z.array(z.enum(FB_BLOCKERS)).max(4),
  pay: z.enum(FB_PAY),
  price: z.enum(FB_PRICE).optional(),
  wants: z.array(z.enum(FB_WANTS)).max(3),
  wantsOther: z.string().trim().max(300).optional(),
  comment: z.string().trim().max(1000).optional(),
})

/** ¿Toca pedirle opinión? (lleva 7 días, ha hecho algo, no ha respondido y no la ha aplazado hace poco) */
export async function feedbackStatus() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  const [answered, dismissed, lessons] = await Promise.all([
    db.feedback.count({ where: { userId: u!.id } }),
    db.event.findMany({ where: { userId: u!.id, name: 'feedback_later' }, orderBy: { createdAt: 'desc' }, take: 2, select: { createdAt: true } }),
    db.lessonProgress.count({ where: { userId: u!.id } }),
  ])
  const days = Math.floor((Date.now() - u!.createdAt.getTime()) / DAY_MS)
  const snoozed = dismissed.length >= 2 || (dismissed[0] && Date.now() - dismissed[0].createdAt.getTime() < 3 * DAY_MS)
  return { due: !answered && days >= FEEDBACK_AFTER_DAYS && lessons > 0 && !snoozed, answered: answered > 0, gems: FEEDBACK_GEMS }
}

/** «Ahora no»: se vuelve a pedir dentro de 3 días (como mucho dos veces) */
export async function feedbackLater() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  await db.event.create({ data: { userId: u!.id, name: 'feedback_later' } })
}

export const submitFeedback = (input: z.infer<typeof FeedbackInput>) =>
  withCtx(async c => {
    const first = !(await c.tx.feedback.count({ where: { userId: c.user.id } }))
    // Una opinión al día como mucho (se puede volver a opinar más adelante)
    if (await c.tx.feedback.count({ where: { userId: c.user.id, createdAt: { gte: new Date(Date.now() - DAY_MS) } } })) fail(429, 'RATE_LIMITED', 'Ya nos has dado tu opinión hoy. ¡Gracias!')
    const { nps, ...answers } = input
    await c.tx.feedback.create({ data: { userId: c.user.id, nps, answers, plan: c.user.plan, daysIn: Math.floor((Date.now() - c.user.createdAt.getTime()) / DAY_MS) } })
    if (first) c.g.gems += FEEDBACK_GEMS
    await track(c.tx, c.user.id, 'feedback', { nps })
    return { ok: true, gems: first ? FEEDBACK_GEMS : 0 }
  })
