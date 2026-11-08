import 'server-only'
// «Algo no está bien»: avisos de fallos que manda cualquier usuario (contenido, app, datos del mercado…)
// y su revisión desde el admin. Límite: 10 avisos por hora y usuario.
import { z } from 'zod'
import { db } from '../db'
import { rateLimit } from '../http/ratelimit'
import { LESSON } from '../content/catalog'
import { viewAs } from '../view'
import { fail, requireUser } from './core'
import { requireAdmin } from './admin'

export const REPORT_KINDS = ['CONTENT', 'BUG', 'MARKET', 'OTHER'] as const
export const REPORT_STATUS = ['OPEN', 'DONE', 'DISCARDED'] as const
export type ReportKind = (typeof REPORT_KINDS)[number]
export type ReportStatus = (typeof REPORT_STATUS)[number]

const id = z.string().regex(/^[A-Za-z0-9_.:-]{1,60}$/)
/** Lo que manda la app: el contexto se rellena solo (ruta, clase, pregunta, símbolo) */
export const ReportInput = z.object({
  kind: z.enum(REPORT_KINDS),
  message: z.string().max(1000),
  path: z.string().max(200).startsWith('/'),
  context: z
    .object({ lessonId: id.optional(), quizId: id.optional(), questionId: id.optional(), step: id.optional(), symbol: z.string().regex(/^[A-Za-z0-9^=._/-]{1,24}$/).optional() })
    .strict()
    .optional(),
})

export async function createReport(input: z.infer<typeof ReportInput>) {
  const u = await requireUser()
  if (viewAs()) fail(403, 'VIEW_ONLY', 'Estás viendo la app como otro usuario: solo lectura.')
  const message = input.message.trim()
  if (message.length < 5) fail(422, 'VALIDATION_ERROR', 'Cuéntanos un poco más (mínimo 5 caracteres)')
  await rateLimit(`report:${u.id}`, 10, 3600)
  // Solo se guarda lo que existe de verdad: una clase inventada no se enlaza
  const c = input.context ?? {}
  const context = {
    ...(c.lessonId && LESSON[c.lessonId] ? { lessonId: c.lessonId } : {}),
    ...(c.quizId ? { quizId: c.quizId } : {}),
    ...(c.questionId ? { questionId: c.questionId } : {}),
    ...(c.step ? { step: c.step } : {}),
    ...(c.symbol ? { symbol: c.symbol.toUpperCase() } : {}),
  }
  // Ruta sin el idioma ni la búsqueda: /es/leccion/u1l1?x=1 → /leccion/u1l1
  const path = input.path.split(/[?#]/)[0].replace(/^\/(es|ca|en)(?=\/|$)/, '') || '/'
  const r = await db.report.create({ data: { userId: u.id, kind: input.kind, message, path: path.slice(0, 200), context } })
  return { id: r.id }
}

// ── Admin ────────────────────────────────────────────────
export async function reports(status?: ReportStatus, kind?: ReportKind) {
  await requireAdmin()
  const [rows, open] = await Promise.all([
    db.report.findMany({ where: { ...(status ? { status } : {}), ...(kind ? { kind } : {}) }, orderBy: { createdAt: 'desc' }, take: 200, include: { user: { select: { id: true, name: true, email: true } } } }),
    db.report.count({ where: { status: 'OPEN' } }),
  ])
  return {
    open,
    items: rows.map(r => {
      const c = (r.context ?? {}) as Record<string, string | undefined>
      return {
        id: r.id,
        kind: r.kind as ReportKind,
        status: r.status as ReportStatus,
        message: r.message,
        path: r.path,
        context: { lessonId: c.lessonId ?? null, lessonTitle: c.lessonId ? (LESSON[c.lessonId]?.title ?? null) : null, quizId: c.quizId ?? null, questionId: c.questionId ?? null, step: c.step ?? null, symbol: c.symbol ?? null },
        note: r.note,
        user: r.user ? { id: r.user.id, name: r.user.name || '—', email: r.user.email } : null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }
    }),
  }
}

export async function openReports() {
  await requireAdmin()
  return { open: await db.report.count({ where: { status: 'OPEN' } }) }
}

/** Marca un aviso como hecho, descartado o lo reabre, con una nota del equipo (queda en la auditoría) */
export async function updateReport(reportId: string, status: ReportStatus, note?: string) {
  const a = await requireAdmin()
  if (viewAs()) fail(403, 'VIEW_ONLY', 'Sal de «ver como» para usar los mandos del admin')
  const clean = note?.trim().slice(0, 500) || null
  return db.$transaction(async tx => {
    const r = await tx.report.findUnique({ where: { id: reportId } })
    if (!r) fail(404, 'NOT_FOUND', 'Aviso no encontrado')
    const next = await tx.report.update({ where: { id: reportId }, data: { status, note: clean ?? r!.note } })
    await tx.auditLog.create({ data: { actorId: a.id, actor: a.email, action: `REPORT_${status}`, entity: 'Report', entityId: reportId, before: { status: r!.status, note: r!.note }, after: { status: next.status, note: next.note } } })
    return { id: next.id, status: next.status as ReportStatus, note: next.note }
  })
}
