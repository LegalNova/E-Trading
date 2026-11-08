import 'server-only'
// Precio de estudiante: la persona sube un justificante (carné o matrícula) y el equipo lo revisa en el admin.
//  · Al aprobarlo, User.studentUntil = hoy + 12 meses y el justificante se borra. Al rechazarlo, también se borra.
//  · Como mucho 3 solicitudes al mes por persona; con un precio de estudiante vigente no se puede pedir otro.
//  · Se aplica al pagar (checkout con los precios _student). Si ya pagaba el precio normal, su suscripción pasa al
//    de estudiante desde el siguiente cobro (sin prorrateo).
//  · Al caducar sigue con lo que pagaba; 15 días antes se le avisa para que lo renueve (cron diario).
import { db, DB_SCHEMA } from '../db'
import { currentUser } from '../auth'
import { cleanName } from '@/shared/friend-leagues'
import { STUDENT_MAX_BYTES, STUDENT_MONTHS, STUDENT_REQUESTS_PER_MONTH, STUDENT_TYPES } from '@/shared/plans'
import { isStudent, switchToStudentPrice } from '../billing/stripe'
import { fail, type Tx } from './core'
import { requireAdmin } from './admin'
import { groupToStudent } from './groups'

const DAY_MS = 86_400_000
type Loc = 'es' | 'ca' | 'en'
const locOf = (l: string | null | undefined): Loc => (l === 'ca' || l === 'en' ? l : 'es')
const dateOf = (d: Date, l: Loc) => d.toLocaleDateString(l === 'ca' ? 'ca-ES' : l === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' })

const TXT = {
  approved: {
    es: (until: string) => ['Ya tienes precio de estudiante', `Hasta el ${until} pagas menos en Plus, Max y los planes de grupo.`],
    ca: (until: string) => ["Ja tens preu d'estudiant", `Fins al ${until} pagues menys a Plus, Max i els plans de grup.`],
    en: (until: string) => ['You now have the student price', `Until ${until} you pay less for Plus, Max and group plans.`],
  },
  switched: {
    es: () => ['Tu suscripción pasa al precio de estudiante', 'Desde tu próximo cobro pagarás el precio de estudiante. Lo que ya has pagado no cambia.'],
    ca: () => ["La teva subscripció passa al preu d'estudiant", "Des del teu proper cobrament pagaràs el preu d'estudiant. El que ja has pagat no canvia."],
    en: () => ['Your subscription moves to the student price', "From your next charge you'll pay the student price. What you've already paid stays the same."],
  },
  rejected: {
    es: (why: string) => ['No hemos podido aprobar tu precio de estudiante', `${why} Puedes volver a pedirlo con otro justificante.`],
    ca: (why: string) => ["No hem pogut aprovar el teu preu d'estudiant", `${why} Pots tornar a demanar-lo amb un altre justificant.`],
    en: (why: string) => ["We couldn't approve your student price", `${why} You can apply again with another document.`],
  },
  expiring: {
    es: (until: string) => ['Tu precio de estudiante termina pronto', `Termina el ${until}. Si sigues estudiando, renuévalo con tu justificante de este curso.`],
    ca: (until: string) => ["El teu preu d'estudiant s'acaba aviat", `S'acaba el ${until}. Si continues estudiant, renova'l amb el justificant d'aquest curs.`],
    en: (until: string) => ['Your student price ends soon', `It ends on ${until}. If you're still studying, renew it with this year's document.`],
  },
} as const

async function tell(tx: Tx, user: { id: string; locale: string }, text: (l: Loc) => readonly string[], deepLink: string, type = 'NEW_LESSON') {
  const [title, body] = text(locOf(user.locale))
  await tx.notification.create({ data: { userId: user.id, type, title, body, deepLink } })
}

/** Firmas de los formatos admitidos: no basta con lo que diga el navegador */
export function sniffType(b: Uint8Array): (typeof STUDENT_TYPES)[number] | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf'
  return null
}

const clean = (s: string, max: number) => cleanName(s).slice(0, max)

/** Estado de mi precio de estudiante (pantalla /estudiante) */
export async function myStudent() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  const since = new Date(Date.now() - 30 * DAY_MS)
  const [pending, last, recent] = await Promise.all([
    db.studentRequest.findFirst({ where: { userId: u!.id, status: 'PENDING' }, orderBy: { createdAt: 'desc' }, select: { createdAt: true, institution: true } }),
    db.studentRequest.findFirst({ where: { userId: u!.id, status: { not: 'PENDING' } }, orderBy: { decidedAt: 'desc' }, select: { status: true, note: true, decidedAt: true } }),
    db.studentRequest.count({ where: { userId: u!.id, createdAt: { gte: since } } }),
  ])
  return {
    active: isStudent(u!),
    until: u!.studentUntil?.toISOString() ?? null,
    // En los últimos 30 días se puede renovar con el justificante del curso nuevo
    canRenew: isStudent(u!) && u!.studentUntil!.getTime() - Date.now() < 30 * DAY_MS,
    pending: pending ? { createdAt: pending.createdAt.toISOString(), institution: pending.institution } : null,
    last: last ? { status: last.status as 'APPROVED' | 'REJECTED', note: last.note, decidedAt: last.decidedAt?.toISOString() ?? null } : null,
    requestsLeft: Math.max(0, STUDENT_REQUESTS_PER_MONTH - recent),
    isGuest: !!u!.isAnonymous,
  }
}

/** Nueva solicitud (la sube /api/uploads/student, con el archivo ya comprobado) */
export async function requestStudent(input: { institution: string; studentEmail?: string | null; photo: Uint8Array; type: string }) {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (u!.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para pedir el precio de estudiante')
  if (u!.onboardingStep !== null) fail(403, 'FORBIDDEN', 'Termina el registro primero')
  const institution = clean(input.institution ?? '', 120)
  if (institution.length < 2) fail(422, 'INSTITUTION_REQUIRED', 'Escribe el nombre de tu centro de estudios')
  const studentEmail = input.studentEmail ? clean(input.studentEmail, 200).toLowerCase() : null
  if (studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) fail(422, 'INVALID_EMAIL', 'Ese email no parece válido')
  if (input.photo.byteLength > STUDENT_MAX_BYTES) fail(413, 'FILE_TOO_BIG', 'El archivo pesa más de 3 MB')
  if (input.photo.byteLength < 100) fail(422, 'FILE_REQUIRED', 'Adjunta una foto del carné o de la matrícula')
  const type = sniffType(input.photo)
  if (!type) fail(415, 'FILE_TYPE', 'Sube una foto JPG o PNG, o un PDF')
  return db.$transaction(async tx => {
    // Una solicitud a la vez por persona (dos envíos seguidos no pasan del límite)
    await tx.$queryRawUnsafe(`SELECT 1 FROM "${DB_SCHEMA}"."user" WHERE "id" = $1 FOR UPDATE`, u!.id)
    const fresh = await tx.user.findUniqueOrThrow({ where: { id: u!.id }, select: { studentUntil: true } })
    // Se puede renovar en los últimos 30 días del precio de estudiante; antes, no hace falta
    if (fresh.studentUntil && fresh.studentUntil.getTime() > Date.now() + 30 * DAY_MS) fail(409, 'ALREADY_STUDENT', 'Ya tienes precio de estudiante.')
    if (await tx.studentRequest.count({ where: { userId: u!.id, status: 'PENDING' } })) fail(409, 'REQUEST_PENDING', 'Ya tienes una solicitud en revisión. Te avisamos en 24-48 h.')
    if ((await tx.studentRequest.count({ where: { userId: u!.id, createdAt: { gte: new Date(Date.now() - 30 * DAY_MS) } } })) >= STUDENT_REQUESTS_PER_MONTH) fail(429, 'TOO_MANY_REQUESTS', `Como mucho ${STUDENT_REQUESTS_PER_MONTH} solicitudes al mes. Vuelve a intentarlo más adelante.`)
    const r = await tx.studentRequest.create({ data: { userId: u!.id, institution, studentEmail, photo: Buffer.from(input.photo), photoType: type } })
    await tx.event.create({ data: { userId: u!.id, name: 'student_request', props: { id: r.id } } })
    return { id: r.id, status: 'PENDING' as const }
  })
}

// ── Admin ────────────────────────────────────────────────
export async function adminStudentRequests() {
  await requireAdmin()
  const [pending, decided] = await Promise.all([
    db.studentRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 200, select: { id: true, institution: true, studentEmail: true, photoType: true, createdAt: true, user: { select: { id: true, name: true, email: true, studentUntil: true } } } }),
    db.studentRequest.findMany({ where: { status: { not: 'PENDING' } }, orderBy: { decidedAt: 'desc' }, take: 30, select: { id: true, institution: true, status: true, note: true, decidedBy: true, decidedAt: true, user: { select: { id: true, name: true, email: true, studentUntil: true } } } }),
  ])
  const user = (u: { id: string; name: string; email: string; studentUntil: Date | null }) => ({ id: u.id, name: u.name || '—', email: u.email, studentUntil: u.studentUntil?.toISOString() ?? null })
  return {
    pending: pending.map(r => ({ id: r.id, institution: r.institution, studentEmail: r.studentEmail, photoType: r.photoType, createdAt: r.createdAt.toISOString(), user: user(r.user) })),
    decided: decided.map(r => ({ id: r.id, institution: r.institution, status: r.status as 'APPROVED' | 'REJECTED', note: r.note, decidedBy: r.decidedBy, decidedAt: r.decidedAt?.toISOString() ?? null, user: user(r.user) })),
  }
}

/** Justificante (solo admin; se sirve en /api/uploads/student/<id>) */
export async function adminStudentPhoto(id: string) {
  await requireAdmin()
  const r = await db.studentRequest.findUnique({ where: { id }, select: { photo: true, photoType: true } })
  if (!r?.photo) fail(404, 'NOT_FOUND', 'Este justificante ya no está (se borra al decidir)')
  return { bytes: r!.photo!, type: r!.photoType ?? 'application/octet-stream' }
}

export async function decideStudent(id: string, approve: boolean, note?: string) {
  const a = await requireAdmin()
  const why = clean(note ?? '', 300)
  if (!approve && why.length < 3) fail(422, 'NOTE_REQUIRED', 'Escribe el motivo del rechazo (lo verá la persona)')
  const r = await db.$transaction(async tx => {
    const req = await tx.studentRequest.findUnique({ where: { id }, select: { userId: true, status: true, institution: true } })
    if (!req) fail(404, 'NOT_FOUND', 'Solicitud no encontrada')
    // Dos admins a la vez: solo cuenta la primera decisión. El justificante se borra en la misma sentencia
    const done = await tx.studentRequest.updateMany({ where: { id, status: 'PENDING' }, data: { status: approve ? 'APPROVED' : 'REJECTED', note: why || null, decidedBy: a.email, decidedAt: new Date(), photo: null, photoType: null } })
    if (!done.count) fail(409, 'ALREADY_DECIDED', 'Otra persona del equipo ya ha decidido esta solicitud')
    const user = await tx.user.findUniqueOrThrow({ where: { id: req!.userId }, select: { id: true, locale: true, studentUntil: true } })
    let until: Date | null = null
    if (approve) {
      // 12 meses desde hoy (o desde el final del que tenga, si lo está renovando)
      const from = user.studentUntil && user.studentUntil.getTime() > Date.now() ? user.studentUntil : new Date()
      until = new Date(from)
      until.setMonth(until.getMonth() + STUDENT_MONTHS)
      await tx.user.update({ where: { id: user.id }, data: { studentUntil: until } })
      await tell(tx, user, l => TXT.approved[l](dateOf(until!, l)), '/premium', 'ACHIEVEMENT')
    } else await tell(tx, user, l => TXT.rejected[l](why.endsWith('.') ? why : `${why}.`), '/estudiante')
    await tx.auditLog.create({ data: { actorId: a.id, actor: a.email, action: approve ? 'STUDENT_APPROVED' : 'STUDENT_REJECTED', entity: 'User', entityId: user.id, before: { studentUntil: user.studentUntil?.toISOString() ?? null }, after: { requestId: id, institution: req!.institution, studentUntil: until?.toISOString() ?? null, note: why || null } } })
    return { userId: user.id, locale: user.locale, until }
  })
  // Ya pagaba el precio normal: su suscripción (y su grupo, si paga uno) pasa al de estudiante desde el siguiente cobro
  let switched = false
  if (approve) {
    try {
      const own = await switchToStudentPrice(r.userId)
      const group = await groupToStudent(r.userId)
      switched = own || group
      if (switched) await tell(db as unknown as Tx, { id: r.userId, locale: r.locale }, l => TXT.switched[l](), '/ajustes')
    } catch (e) {
      console.error('student/stripe switch', r.userId, e)
    }
  }
  return { id, status: approve ? 'APPROVED' : 'REJECTED', until: r.until?.toISOString() ?? null, switched }
}

/** Cron diario: aviso 15 días antes de que termine el precio de estudiante (una vez por fecha) */
export async function remindStudentExpiry() {
  const now = Date.now()
  const users = await db.user.findMany({ where: { studentUntil: { gt: new Date(now), lte: new Date(now + 15 * DAY_MS) }, blockedAt: null }, select: { id: true, locale: true, studentUntil: true }, take: 5000 })
  let sent = 0
  for (const u of users) {
    const key = u.studentUntil!.toISOString()
    if (await db.event.count({ where: { userId: u.id, name: 'student_expiry_notice', props: { path: ['until'], equals: key } } })) continue
    await db.event.create({ data: { userId: u.id, name: 'student_expiry_notice', props: { until: key } } })
    await tell(db as unknown as Tx, u, l => TXT.expiring[l](dateOf(u.studentUntil!, l)), '/estudiante')
    sent++
  }
  return sent
}
