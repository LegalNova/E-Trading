import 'server-only'
// Planes de grupo: una persona paga Plus o Max para su grupo (4, 8 o sin límite de personas, al mes o al año).
//  · Se crea en PENDING y pasa a ACTIVE al confirmar el pago con Stripe (vuelta con ?sid= o aviso de Stripe).
//  · Quien paga también tiene el plan y ocupa una plaza. Al activarse se crea una liga de amigos para el grupo.
//  · Se entra con el enlace /grupo/unirse/<código> (8 letras y números, como las ligas de amigos).
//  · Quien no tiene suscripción propia viva pasa a Subscription.status = 'GROUP' con el plan del grupo (y 50.000 €
//    virtuales una sola vez). Quien ya paga por su cuenta se queda con lo suyo.
//  · Un regalo o una prueba en marcha se guardan «debajo» (evento group_base + trialEndsAt): al salir del grupo, si
//    siguen vigentes, vuelve a ellos. Mientras está en el grupo tiene el plan más alto de los dos.
//  · Pago fallido (PAST_DUE): el grupo sigue mientras Stripe reintenta, con aviso a quien paga. Cancelado: todos
//    los que tenían el plan por el grupo vuelven a Free (o a su regalo) con un aviso.
import { createHmac, randomInt } from 'node:crypto'
import type Stripe from 'stripe'
import { headers } from 'next/headers'
import type { GroupPlan, Plan } from '@/generated/prisma/client'
import { db, DB_SCHEMA } from '../db'
import { currentUser } from '../auth'
import { currentLocale } from '../locale'
import { CODE_ALPHABET, CODE_LEN, cleanName, isValidCode, isValidName, NAME_MAX, NAME_MIN, normalizeCode } from '@/shared/friend-leagues'
import { GROUP_SIZES, groupPriceOf, seatsOf, type BillingInterval, type GroupSize, type PaidTier } from '@/shared/plans'
import { checkoutSession, GROUP_KIND, groupCheckout, groupPortalUrl, isStudent, isStudentPrice, LIVE, stripe, stripeEnabled } from '../billing/stripe'
import { fail, START_CASH, withCtx, type Ctx, type Tx } from './core'
import { addFlow } from './league'

const DAY_MS = 86_400_000
/** Estados de un grupo que dan el plan */
export const LIVE_GROUP = ['ACTIVE', 'PAST_DUE']
const rank = (p: Plan) => (p === 'PREMIUM' ? 2 : p === 'PLUS' ? 1 : 0)
type Loc = 'es' | 'ca' | 'en'
const locOf = (l: string | null | undefined): Loc => (l === 'ca' || l === 'en' ? l : 'es')

/** Identificador de un miembro dentro del grupo (no deja adivinar su cuenta) */
const memberKey = (groupId: string, userId: string) =>
  createHmac('sha256', process.env.BETTER_AUTH_SECRET ?? 'lumi-groups').update(`group:${groupId}:${userId}`).digest('base64url').slice(0, 16)

const newCode = () => Array.from({ length: CODE_LEN }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')

/** Bloquea la fila del grupo: dos personas que entran a la vez no pasan del número de plazas */
const lockGroup = (tx: Tx, id: string) => tx.$queryRawUnsafe(`SELECT 1 FROM "${DB_SCHEMA}"."GroupPlan" WHERE "id" = $1 FOR UPDATE`, id)

function validName(raw: string) {
  const name = cleanName(raw)
  if (!isValidName(name)) fail(422, 'INVALID_NAME', `El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres.`)
  return name
}

// ── Avisos (en el idioma de cada persona) ───────────────
const TXT = {
  active: {
    es: (g: string, n: number) => [`Tu grupo «${g}» ya está activo`, `Comparte el enlace para que se unan. Tenéis ${n} plazas, contando la tuya.`],
    ca: (g: string, n: number) => [`El teu grup «${g}» ja està actiu`, `Comparteix l'enllaç perquè s'hi uneixin. Teniu ${n} places, comptant la teva.`],
    en: (g: string, n: number) => [`Your group “${g}” is active`, `Share the link so people can join. You have ${n} seats, including yours.`],
  },
  joined: {
    es: (who: string, g: string, left: string) => [`${who} se ha unido a «${g}»`, left],
    ca: (who: string, g: string, left: string) => [`${who} s'ha unit a «${g}»`, left],
    en: (who: string, g: string, left: string) => [`${who} joined “${g}”`, left],
  },
  left: {
    es: (who: string, g: string) => [`${who} ha salido de «${g}»`, 'Su plaza vuelve a estar libre.'],
    ca: (who: string, g: string) => [`${who} ha sortit de «${g}»`, 'La seva plaça torna a estar lliure.'],
    en: (who: string, g: string) => [`${who} left “${g}”`, 'Their seat is free again.'],
  },
  removed: {
    es: (g: string, back: string) => [`Ya no estás en el grupo «${g}»`, `Quien paga el grupo te ha quitado. ${back}`],
    ca: (g: string, back: string) => [`Ja no ets al grup «${g}»`, `Qui paga el grup t'ha tret. ${back}`],
    en: (g: string, back: string) => [`You're no longer in the group “${g}”`, `The person who pays for the group removed you. ${back}`],
  },
  ended: {
    es: (g: string, back: string) => [`El plan de grupo «${g}» ha terminado`, back],
    ca: (g: string, back: string) => [`El pla de grup «${g}» ha acabat`, back],
    en: (g: string, back: string) => [`The group plan “${g}” has ended`, back],
  },
  pastDue: {
    es: (g: string) => [`No hemos podido cobrar el grupo «${g}»`, 'El grupo sigue unos días mientras lo volvemos a intentar. Revisa tu tarjeta en Grupo › Gestionar el pago para que nadie pierda el plan.'],
    ca: (g: string) => [`No hem pogut cobrar el grup «${g}»`, 'El grup continua uns dies mentre ho tornem a provar. Revisa la targeta a Grup › Gestionar el pagament perquè ningú perdi el pla.'],
    en: (g: string) => [`We couldn't charge the group “${g}”`, "The group keeps going for a few days while we retry. Check your card in Group › Manage payment so nobody loses the plan."],
  },
  paid: {
    es: (g: string, amount: string) => [`Pago del grupo recibido`, `Hemos cobrado ${amount} € del grupo «${g}». Gracias por apoyar E-Trading.`],
    ca: (g: string, amount: string) => [`Pagament del grup rebut`, `Hem cobrat ${amount} € del grup «${g}». Gràcies per donar suport a E-Trading.`],
    en: (g: string, amount: string) => [`Group payment received`, `We've charged €${amount} for the group “${g}”. Thanks for supporting E-Trading.`],
  },
  back: {
    free: { es: 'Sigues con todo lo de Free.', ca: 'Continues amb tot el de Free.', en: 'You keep everything in Free.' },
    gift: { es: 'Vuelves a tu regalo mientras dure.', ca: 'Tornes al teu regal mentre duri.', en: 'You go back to your gift while it lasts.' },
    own: { es: 'Sigues con tu suscripción propia.', ca: 'Continues amb la teva subscripció pròpia.', en: 'You keep your own subscription.' },
  },
  seatsLeft: {
    es: (n: number) => (n === 1 ? 'Queda 1 plaza.' : n ? `Quedan ${n} plazas.` : 'El grupo está completo.'),
    ca: (n: number) => (n === 1 ? 'Queda 1 plaça.' : n ? `Queden ${n} places.` : 'El grup és complet.'),
    en: (n: number) => (n === 1 ? '1 seat left.' : n ? `${n} seats left.` : 'The group is full.'),
  },
} as const

type Recipient = { id: string; locale: string }
async function tell(tx: Tx, to: Recipient, text: (l: Loc) => readonly string[], deepLink = '/grupo', type = 'NEW_LESSON') {
  const [title, body] = text(locOf(to.locale))
  await tx.notification.create({ data: { userId: to.id, type, title, body, deepLink } })
}

// ── El plan de cada miembro ──────────────────────────────
type Release = 'free' | 'gift' | 'own'

/** ¿Paga por su cuenta? (suscripción de Stripe viva o pago simulado activo) */
const ownPaid = (sub: { status: string; stripeSubId: string | null } | null) => !!sub && ((!!sub.stripeSubId && LIVE.includes(sub.status)) || (sub.status === 'ACTIVE' && !sub.stripeSubId))

/** Regalo o prueba que tenía debajo del grupo (para volver a ellos al salir) */
async function baseOf(tx: Tx, userId: string) {
  const e = await tx.event.findFirst({ where: { userId, name: 'group_base' }, orderBy: { createdAt: 'desc' }, select: { props: true } })
  const p = e?.props as { plan?: Plan; status?: string } | null
  return p?.plan && (p.status === 'GIFT' || p.status === 'TRIALING') ? { plan: p.plan, status: p.status } : null
}
const saveBase = (tx: Tx, userId: string, plan: Plan, status: string) => tx.event.create({ data: { userId, name: 'group_base', props: { plan, status } } })

/** Da el plan del grupo a un miembro (si no paga por su cuenta). Devuelve 'GROUP' o 'OWN' */
export async function applyGroupPlan(tx: Tx, userId: string, g: Pick<GroupPlan, 'tier' | 'interval' | 'renewsAt'>): Promise<'GROUP' | 'OWN'> {
  const [sub, user] = await Promise.all([tx.subscription.findUnique({ where: { userId } }), tx.user.findUnique({ where: { id: userId }, select: { plan: true } })])
  if (!user) return 'OWN'
  if (ownPaid(sub)) return 'OWN'
  const now = Date.now()
  let base: { plan: Plan } | null = null
  if (sub?.status === 'GROUP') base = sub.trialEndsAt && sub.trialEndsAt.getTime() > now ? await baseOf(tx, userId) : null
  else if ((sub?.status === 'GIFT' || (sub?.status === 'TRIALING' && !sub.stripeSubId)) && sub.trialEndsAt && sub.trialEndsAt.getTime() > now) {
    base = { plan: user.plan }
    await saveBase(tx, userId, user.plan, sub.status)
  }
  const keepUnder = base ? sub!.trialEndsAt : null
  const plan: Plan = base && rank(base.plan) > rank(g.tier) ? base.plan : g.tier
  const data = { status: 'GROUP', interval: g.interval, renewsAt: g.renewsAt, trialEndsAt: keepUnder }
  await tx.subscription.upsert({ where: { userId }, create: { userId, ...data }, update: data })
  await tx.user.update({ where: { id: userId }, data: { plan } })
  // Saldo virtual de los planes de pago: 50.000 € una sola vez (en la liga no cuenta como rentabilidad)
  await tx.portfolio.createMany({ data: [{ userId, cash: START_CASH.FREE, resetsYear: new Date().getFullYear() }], skipDuplicates: true })
  const up = await tx.portfolio.updateMany({ where: { userId, premiumTopUp: false }, data: { cash: { increment: START_CASH.PREMIUM - START_CASH.FREE }, premiumTopUp: true } })
  if (up.count) await addFlow(tx, userId, START_CASH.PREMIUM - START_CASH.FREE)
  return 'GROUP'
}

/** Le quita el plan del grupo: vuelve a su regalo o prueba si siguen vigentes; si no, a Free */
async function releaseGroupPlan(tx: Tx, userId: string): Promise<Release> {
  const sub = await tx.subscription.findUnique({ where: { userId } })
  if (sub?.status !== 'GROUP') return 'own'
  const base = sub.trialEndsAt && sub.trialEndsAt.getTime() > Date.now() ? await baseOf(tx, userId) : null
  if (base) {
    await tx.subscription.update({ where: { userId }, data: { status: base.status, interval: null, renewsAt: base.status === 'TRIALING' ? sub.trialEndsAt : null } })
    await tx.user.update({ where: { id: userId }, data: { plan: base.plan } })
    return 'gift'
  }
  await tx.subscription.update({ where: { userId }, data: { status: 'CANCELED', interval: null, renewsAt: null, trialEndsAt: null } })
  await tx.user.update({ where: { id: userId }, data: { plan: 'FREE' } })
  return 'free'
}

/**
 * Regalo (grants.ts o invitaciones) a quien tiene el plan por su grupo: los días se guardan debajo del grupo
 * (se suman a los que ya tuviera) y los disfruta al salir; si el regalo es de un plan más alto, lo tiene ya.
 */
export async function giftUnderGroup(tx: Tx, userId: string, tier: 'PLUS' | 'PREMIUM', days: number) {
  const [sub, user] = await Promise.all([tx.subscription.findUniqueOrThrow({ where: { userId } }), tx.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: true } })])
  const now = Date.now()
  const running = sub.trialEndsAt && sub.trialEndsAt.getTime() > now ? await baseOf(tx, userId) : null
  const until = new Date((running ? sub.trialEndsAt!.getTime() : now) + days * DAY_MS)
  const basePlan: Plan = running && rank(running.plan) > rank(tier) ? running.plan : tier
  await saveBase(tx, userId, basePlan, 'GIFT')
  await tx.subscription.update({ where: { userId }, data: { trialEndsAt: until } })
  const plan: Plan = rank(basePlan) > rank(user.plan) ? basePlan : user.plan
  if (plan !== user.plan) await tx.user.update({ where: { id: userId }, data: { plan } })
  return { mode: 'GIFT' as const, plan, until }
}

/** Su suscripción propia ha terminado y está en un grupo en marcha: vuelve a tener el plan del grupo */
export async function reapplyGroupPlan(userId: string) {
  const m = await db.groupMember.findUnique({ where: { userId }, include: { group: true } })
  if (!m || !LIVE_GROUP.includes(m.group.status)) return
  await db.$transaction(tx => applyGroupPlan(tx, userId, m.group))
}

// ── Activar y terminar ───────────────────────────────────
async function newLeagueCode(tx: Tx) {
  let code = newCode()
  for (let i = 0; i < 5 && (await tx.privateLeague.findUnique({ where: { code }, select: { id: true } })); i++) code = newCode()
  return code
}

/** Pago confirmado: quien paga entra con su plaza, se crea la liga del grupo y se le avisa */
async function activate(tx: Tx, g: GroupPlan) {
  const owner = await tx.user.findUniqueOrThrow({ where: { id: g.ownerId }, select: { id: true, locale: true } })
  let leagueId = g.leagueId
  if (!leagueId || !(await tx.privateLeague.findUnique({ where: { id: leagueId }, select: { id: true } }))) {
    const league = await tx.privateLeague.create({ data: { name: g.name, code: await newLeagueCode(tx), ownerId: g.ownerId, members: { create: { userId: g.ownerId } } } })
    leagueId = league.id
  }
  await tx.groupPlan.update({ where: { id: g.id }, data: { leagueId } })
  const other = await tx.groupMember.findUnique({ where: { userId: g.ownerId } })
  if (!other) await tx.groupMember.create({ data: { groupId: g.id, userId: g.ownerId } })
  else if (other.groupId !== g.id) console.error('group activate: el dueño ya está en otro grupo', g.id, other.groupId)
  if (!other || other.groupId === g.id) await applyGroupPlan(tx, g.ownerId, g)
  await tell(tx, owner, l => TXT.active[l](g.name, seatsOf(g.size)), '/grupo', 'ACHIEVEMENT')
  await tx.event.create({ data: { userId: g.ownerId, name: 'group_paid', props: { groupId: g.id, tier: g.tier, size: g.size, interval: g.interval, student: g.student } } })
}

/** El grupo termina: cada miembro vuelve a lo suyo (Free, su regalo o su suscripción propia) y se le avisa */
async function endGroup(tx: Tx, g: GroupPlan) {
  const members = await tx.groupMember.findMany({ where: { groupId: g.id }, select: { user: { select: { id: true, locale: true } } } })
  for (const m of members) {
    const r = await releaseGroupPlan(tx, m.user.id)
    await tell(tx, m.user, l => TXT.ended[l](g.name, TXT.back[r][l]), r === 'free' ? '/premium' : '/ajustes')
  }
  await tx.groupMember.deleteMany({ where: { groupId: g.id } })
  await tx.groupPlan.update({ where: { id: g.id }, data: { status: 'CANCELED', renewsAt: null } })
  await tx.event.create({ data: { userId: g.ownerId, name: 'group_end', props: { groupId: g.id, members: members.length } } })
}

const GROUP_STATUS: Record<string, string> = { active: 'ACTIVE', trialing: 'ACTIVE', past_due: 'PAST_DUE', unpaid: 'CANCELED', canceled: 'CANCELED', incomplete: 'PENDING', incomplete_expired: 'CANCELED', paused: 'CANCELED' }

/** Copia en el grupo el estado de su suscripción de Stripe (idempotente: avisos repetidos no cambian nada) */
export async function syncGroupSub(s: Stripe.Subscription) {
  const groupId = s.metadata?.groupId
  if (!groupId) return null
  const item = s.items.data[0]
  const next = GROUP_STATUS[s.status] ?? 'PENDING'
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null
  const duplicate = await db.$transaction(
    async tx => {
      await lockGroup(tx, groupId)
      const g = await tx.groupPlan.findUnique({ where: { id: groupId } })
      if (!g) return false
      // Una segunda suscripción del mismo grupo (dos pagos en dos pestañas): no pisa a la buena
      if (g.stripeSubId && g.stripeSubId !== s.id) return LIVE_GROUP.includes(g.status) && next !== 'CANCELED'
      // Terminado: no se vuelve a abrir (se crea un grupo nuevo)
      if (g.status === 'CANCELED') return false
      const renewsAt = s.cancel_at_period_end || next === 'CANCELED' ? null : periodEnd
      const updated = await tx.groupPlan.update({ where: { id: g.id }, data: { status: next, stripeSubId: s.id, renewsAt, ...(item ? { student: isStudentPrice(item.price) } : {}) } })
      if (LIVE_GROUP.includes(next)) {
        if (g.status === 'PENDING') await activate(tx, updated)
        else await tx.subscription.updateMany({ where: { status: 'GROUP', user: { groupMember: { is: { groupId: g.id } } } }, data: { renewsAt } })
        if (next === 'PAST_DUE' && g.status !== 'PAST_DUE') {
          const owner = await tx.user.findUniqueOrThrow({ where: { id: g.ownerId }, select: { id: true, locale: true } })
          await tell(tx, owner, l => TXT.pastDue[l](g.name))
        }
      }
      if (next === 'CANCELED' && g.status !== 'PENDING') await endGroup(tx, updated)
      else if (next === 'CANCELED') await tx.groupPlan.update({ where: { id: g.id }, data: { status: 'CANCELED' } })
      return false
    },
    { timeout: 20_000, maxWait: 10_000 },
  )
  // Pago repetido del mismo grupo: se cancela la segunda suscripción (y queda en el registro para devolverlo a mano)
  if (duplicate && stripe) {
    console.error('group: suscripción repetida, se cancela', groupId, s.id)
    await stripe.subscriptions.cancel(s.id).catch(e => console.error('group duplicate cancel', e))
  }
  return groupId
}

/** Factura pagada o rechazada de un grupo (avisos de Stripe): el recibo va a quien paga */
export async function groupInvoice(subId: string, kind: 'paid' | 'failed', amount: number, invoiceId: string) {
  const g = await db.groupPlan.findUnique({ where: { stripeSubId: subId }, include: { owner: { select: { id: true, locale: true } } } })
  if (!g) return
  if (await db.event.count({ where: { userId: g.ownerId, name: `group_${kind}`, props: { path: ['invoice'], equals: invoiceId } } })) return
  await db.event.create({ data: { userId: g.ownerId, name: `group_${kind}`, props: { invoice: invoiceId, amount, groupId: g.id } } })
  if (kind === 'paid' && amount > 0) await tell(db as unknown as Tx, g.owner, l => TXT.paid[l](g.name, (amount / 100).toFixed(2).replace('.', l === 'en' ? '.' : ',')), '/grupo', 'ACHIEVEMENT')
  if (kind === 'failed') await tell(db as unknown as Tx, g.owner, l => TXT.pastDue[l](g.name))
}

// ── Pantalla /grupo ──────────────────────────────────────
function priceList(student: boolean) {
  return GROUP_SIZES.flatMap(size =>
    (['PLUS', 'PREMIUM'] as const).flatMap(tier =>
      (['MONTH', 'YEAR'] as const).map(interval => ({ size, tier, interval, price: groupPriceOf(size, tier, interval, student), regular: groupPriceOf(size, tier, interval, false), seats: seatsOf(size) })),
    ),
  )
}

async function viewOf(c: Ctx) {
  const userId = c.user.id
  const [m, sub] = await Promise.all([c.tx.groupMember.findUnique({ where: { userId }, include: { group: true } }), c.tx.subscription.findUnique({ where: { userId } })])
  const g = m?.group ?? (await c.tx.groupPlan.findFirst({ where: { ownerId: userId, status: 'PENDING' }, orderBy: { createdAt: 'desc' } }))
  const student = isStudent(c.user)
  const base = { student, payments: stripeEnabled, isGuest: !!c.user.isAnonymous, ownPaid: ownPaid(sub), prices: priceList(student) }
  if (!g) return { ...base, group: null, members: [] }
  const isOwner = g.ownerId === userId
  const rows = await c.tx.groupMember.findMany({ where: { groupId: g.id }, orderBy: [{ joinedAt: 'asc' }, { userId: 'asc' }], select: { joinedAt: true, user: { select: { id: true, name: true } } } })
  const owner = g.ownerId === userId ? c.user : await c.tx.user.findUnique({ where: { id: g.ownerId }, select: { name: true } })
  return {
    ...base,
    group: {
      id: g.id,
      name: g.name,
      code: isOwner ? g.code : null,
      tier: g.tier as PaidTier,
      size: g.size as GroupSize,
      seats: seatsOf(g.size),
      used: rows.length,
      interval: g.interval as BillingInterval,
      status: g.status as 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED',
      student: g.student,
      price: groupPriceOf(g.size as GroupSize, g.tier as PaidTier, g.interval as BillingInterval, g.student),
      renewsAt: g.renewsAt?.toISOString() ?? null,
      isOwner,
      ownerName: owner?.name || '—',
      leagueId: g.leagueId,
      // Tiene el plan por el grupo o por su cuenta (para explicarle que puede cancelar lo suyo)
      myMode: sub?.status === 'GROUP' ? ('GROUP' as const) : ('OWN' as const),
    },
    members: rows.map(r => ({ key: memberKey(g.id, r.user.id), name: r.user.name || '—', isMe: r.user.id === userId, isOwner: r.user.id === g.ownerId, joinedAt: r.joinedAt.toISOString() })),
  }
}

/** Si quien paga ha abierto el portal de Stripe después del último cambio del grupo, se pregunta a Stripe (como mucho una vez por minuto) */
async function refreshAfterPortal(userId: string) {
  if (!stripe) return
  const g = await db.groupPlan.findFirst({ where: { ownerId: userId, status: { in: LIVE_GROUP }, stripeSubId: { not: null } } })
  if (!g || Date.now() - g.updatedAt.getTime() < 60_000) return
  const opened = await db.event.findFirst({ where: { userId, name: 'portal_open', createdAt: { gt: g.updatedAt, gte: new Date(Date.now() - 6 * 3600_000) } }, select: { id: true } })
  if (!opened) return
  try {
    await syncGroupSub(await stripe.subscriptions.retrieve(g.stripeSubId!))
    await db.groupPlan.update({ where: { id: g.id }, data: { updatedAt: new Date() } })
  } catch (e) {
    console.error('group refresh', g.id, e)
  }
}

export async function myGroup() {
  const u = await currentUser()
  if (u) await refreshAfterPortal(u.id)
  return withCtx(viewOf)
}

/** Crear (o cambiar, si aún no está pagado) el grupo y abrir el pago de Stripe */
export async function createGroup(input: { name: string; tier: PaidTier; size: GroupSize; interval: BillingInterval }) {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (u!.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para crear un grupo')
  if (u!.onboardingStep !== null) fail(403, 'FORBIDDEN', 'Termina el registro primero')
  const age = u!.birthDate ? (Date.now() - u!.birthDate.getTime()) / (365.25 * DAY_MS) : null
  if (age !== null && age < 18 && u!.guardianConsent !== 'CONFIRMED') fail(403, 'GUARDIAN_CONSENT_REQUIRED', 'Para un plan de pago hace falta que un adulto lo confirme')
  const name = validName(input.name)
  const student = isStudent(u!)
  const g = await db.$transaction(async tx => {
    // Una creación a la vez por persona (doble clic, dos pestañas)
    await tx.$queryRawUnsafe(`SELECT 1 FROM "${DB_SCHEMA}"."user" WHERE "id" = $1 FOR UPDATE`, u!.id)
    if (await tx.groupMember.findUnique({ where: { userId: u!.id } })) fail(409, 'IN_GROUP', 'Ya estás en un grupo. Sal de él para crear otro.')
    if (await tx.groupPlan.findFirst({ where: { ownerId: u!.id, status: { in: LIVE_GROUP } } })) fail(409, 'IN_GROUP', 'Ya tienes un grupo en marcha.')
    const pending = await tx.groupPlan.findFirst({ where: { ownerId: u!.id, status: 'PENDING' }, orderBy: { createdAt: 'desc' } })
    const data = { name, tier: input.tier, size: input.size, interval: input.interval, student }
    if (pending) return tx.groupPlan.update({ where: { id: pending.id }, data })
    let code = newCode()
    for (let i = 0; i < 5 && (await tx.groupPlan.findUnique({ where: { code }, select: { id: true } })); i++) code = newCode()
    return tx.groupPlan.create({ data: { ...data, ownerId: u!.id, code } })
  })
  // Sin Stripe (desarrollo): el grupo se activa al momento, como el pago simulado de los planes
  if (!stripeEnabled) {
    await db.$transaction(async tx => {
      await lockGroup(tx, g.id)
      const renewsAt = new Date(Date.now() + (g.interval === 'YEAR' ? 365 : 30) * DAY_MS)
      await activate(tx, await tx.groupPlan.update({ where: { id: g.id }, data: { status: 'ACTIVE', renewsAt } }))
    })
    return { id: g.id, url: null }
  }
  // Un pago anterior a medias de este grupo se cierra: no se puede pagar dos veces
  if (g.stripeSessionId) {
    const old = await checkoutSession(g.stripeSessionId).catch(() => null)
    if (old?.status === 'open') await stripe!.checkout.sessions.expire(old.id).catch(() => null)
  }
  const h = await headers()
  const origin = h.get('origin') ?? `https://${h.get('host')}`
  const s = await groupCheckout(u!, { id: g.id, name: g.name, size: g.size, tier: g.tier as PaidTier, interval: g.interval as BillingInterval, student: g.student }, { origin, locale: currentLocale() })
  await db.groupPlan.update({ where: { id: g.id }, data: { stripeSessionId: s.id } })
  return { id: g.id, url: s.url }
}

/** Vuelta de la página de pago: se pregunta a Stripe por esa sesión y, si está pagada, el grupo se activa ya */
export async function confirmGroup(sessionId: string) {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  if (!stripeEnabled) fail(404, 'NOT_FOUND', 'El pago con tarjeta aún no está activo')
  const s = await checkoutSession(sessionId).catch(() => null)
  if (!s || s.client_reference_id !== u!.id || s.metadata?.kind !== GROUP_KIND || !s.metadata.groupId) fail(404, 'NOT_FOUND', 'No encontramos ese pago')
  if (s!.status !== 'complete' || !s!.subscription) return { done: false, expired: s!.status === 'expired' }
  await syncGroupSub(await stripe!.subscriptions.retrieve(String(s!.subscription)))
  const g = await db.groupPlan.findUnique({ where: { id: s!.metadata!.groupId }, select: { status: true } })
  return { done: !!g && LIVE_GROUP.includes(g.status), expired: false }
}

/** Para el enlace de unirse, sin sesión: nombre del grupo, plan y plazas libres */
export async function peekGroup(rawCode: string) {
  const code = normalizeCode(rawCode)
  const none = { valid: false, name: null, tier: null, seatsLeft: 0, full: false, active: false, ownerName: null }
  if (!isValidCode(code)) return none
  const g = await db.groupPlan.findUnique({ where: { code }, select: { name: true, tier: true, size: true, status: true, owner: { select: { name: true } }, _count: { select: { members: true } } } })
  if (!g || g.status === 'CANCELED') return none
  const left = Math.max(0, seatsOf(g.size) - g._count.members)
  return { valid: true, name: g.name, tier: g.tier as PaidTier, seatsLeft: left, full: left === 0, active: LIVE_GROUP.includes(g.status), ownerName: g.owner.name.split(/\s+/)[0] || null }
}

/** Acción del registro cuando quien paga quita a alguien (con el código no puede volver a entrar) */
const REMOVED = 'GROUP_REMOVE'

export const joinGroup = (rawCode: string) =>
  withCtx(async c => {
    const code = normalizeCode(rawCode)
    if (!isValidCode(code)) fail(422, 'INVALID_CODE', 'El código tiene 8 letras y números (sin O, I, L, 0 ni 1). Revísalo.')
    if (c.user.isAnonymous) fail(403, 'GUEST_MUST_SAVE', 'Guarda tu progreso con email y contraseña para unirte al grupo.')
    const g = await c.tx.groupPlan.findUnique({ where: { code } })
    if (!g || g.status === 'CANCELED') fail(404, 'GROUP_NOT_FOUND', 'No hay ningún grupo con ese código. Revisa el enlace.')
    if (!LIVE_GROUP.includes(g!.status)) fail(409, 'GROUP_NOT_ACTIVE', 'Este grupo aún no está activo: quien lo paga tiene que terminar el pago.')
    const mine = await c.tx.groupMember.findUnique({ where: { userId: c.user.id } })
    if (mine?.groupId === g!.id) return { id: g!.id, name: g!.name, tier: g!.tier as PaidTier, mode: (await c.tx.subscription.findUnique({ where: { userId: c.user.id } }))?.status === 'GROUP' ? 'GROUP' : 'OWN', already: true }
    if (mine) fail(409, 'IN_OTHER_GROUP', 'Ya estás en otro grupo. Sal de él para unirte a este.')
    if (await c.tx.auditLog.count({ where: { action: REMOVED, entityId: g!.id, after: { path: ['userId'], equals: c.user.id } } })) fail(403, 'REMOVED_FROM_GROUP', 'Quien paga este grupo te ha quitado de él, así que no puedes volver a entrar.')
    await lockGroup(c.tx, g!.id)
    const used = await c.tx.groupMember.count({ where: { groupId: g!.id } })
    const seats = seatsOf(g!.size)
    if (used >= seats) fail(409, 'GROUP_FULL', 'Este grupo ya está completo.')
    try {
      await c.tx.groupMember.create({ data: { groupId: g!.id, userId: c.user.id } })
    } catch (e) {
      // Dos uniones a la vez de la misma persona a dos grupos distintos: la segunda choca con «una persona, un grupo»
      if ((e as { code?: string })?.code === 'P2002') fail(409, 'IN_OTHER_GROUP', 'Ya estás en otro grupo. Sal de él para unirte a este.')
      throw e
    }
    const mode = await applyGroupPlan(c.tx, c.user.id, g!)
    if (g!.leagueId && (await c.tx.privateLeague.findUnique({ where: { id: g!.leagueId }, select: { id: true } }))) await c.tx.privateLeagueMember.createMany({ data: [{ leagueId: g!.leagueId, userId: c.user.id }], skipDuplicates: true })
    const owner = await c.tx.user.findUnique({ where: { id: g!.ownerId }, select: { id: true, locale: true } })
    if (owner && owner.id !== c.user.id) await tell(c.tx, owner, l => TXT.joined[l](c.user.name || '—', g!.name, TXT.seatsLeft[l](seats - used - 1)))
    await c.tx.event.create({ data: { userId: c.user.id, name: 'group_join', props: { groupId: g!.id, mode } } })
    return { id: g!.id, name: g!.name, tier: g!.tier as PaidTier, mode, already: false }
  })

async function myMembership(c: Ctx) {
  const m = await c.tx.groupMember.findUnique({ where: { userId: c.user.id }, include: { group: true } })
  if (!m) fail(404, 'GROUP_NOT_FOUND', 'No estás en ningún grupo.')
  return m!.group
}
async function ownGroup(c: Ctx) {
  const g = await myMembership(c)
  if (g.ownerId !== c.user.id) fail(403, 'NOT_OWNER', 'Solo quien paga el grupo puede hacer esto.')
  return g
}

/** Sale un miembro (o lo quita quien paga): pierde el plan del grupo y sale de su liga */
async function dropMember(tx: Tx, g: GroupPlan, userId: string) {
  await tx.groupMember.deleteMany({ where: { groupId: g.id, userId } })
  const r = await releaseGroupPlan(tx, userId)
  if (g.leagueId) await tx.privateLeagueMember.deleteMany({ where: { leagueId: g.leagueId, userId } })
  return r
}

export const leaveGroup = () =>
  withCtx(async c => {
    const g = await myMembership(c)
    if (g.ownerId === c.user.id) fail(409, 'OWNER_CANNOT_LEAVE', 'Pagas tú el grupo: para terminarlo, cancela el pago en «Gestionar el pago».')
    await lockGroup(c.tx, g.id)
    const r = await dropMember(c.tx, g, c.user.id)
    const owner = await c.tx.user.findUnique({ where: { id: g.ownerId }, select: { id: true, locale: true } })
    if (owner) await tell(c.tx, owner, l => TXT.left[l](c.user.name || '—', g.name))
    return { left: true, back: r }
  })

export const removeGroupMember = (key: string) =>
  withCtx(async c => {
    const g = await ownGroup(c)
    await lockGroup(c.tx, g.id)
    const rows = await c.tx.groupMember.findMany({ where: { groupId: g.id }, select: { user: { select: { id: true, locale: true } } } })
    const target = rows.find(r => memberKey(g.id, r.user.id) === key)?.user
    if (!target) fail(404, 'MEMBER_NOT_FOUND', 'Esa persona ya no está en el grupo.')
    if (target!.id === g.ownerId) fail(422, 'CANNOT_REMOVE_OWNER', 'No puedes quitarte a ti: pagas tú el grupo.')
    const r = await dropMember(c.tx, g, target!.id)
    await c.tx.auditLog.create({ data: { actorId: c.user.id, actor: c.user.email, action: REMOVED, entity: 'GroupPlan', entityId: g.id, after: { userId: target!.id } } })
    await tell(c.tx, target!, l => TXT.removed[l](g.name, TXT.back[r][l]), r === 'free' ? '/premium' : '/ajustes')
  })

export const renameGroup = (rawName: string) =>
  withCtx(async c => {
    const g = await ownGroup(c)
    const name = validName(rawName)
    await c.tx.groupPlan.update({ where: { id: g.id }, data: { name } })
    if (g.leagueId) await c.tx.privateLeague.updateMany({ where: { id: g.leagueId }, data: { name } })
    return { id: g.id, name }
  })

/** Gestionar el pago del grupo: portal de Stripe. Sin Stripe (desarrollo), el grupo se termina al momento */
export async function groupPayment() {
  const u = await currentUser()
  if (!u) fail(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
  const g = await db.groupPlan.findFirst({ where: { ownerId: u!.id, status: { in: LIVE_GROUP } } })
  if (!g) fail(404, 'GROUP_NOT_FOUND', 'No pagas ningún grupo.')
  if (stripeEnabled && g!.stripeSubId) {
    const h = await headers()
    const url = await groupPortalUrl(u!, h.get('origin') ?? `https://${h.get('host')}`, currentLocale())
    if (!url) fail(404, 'NOT_FOUND', 'No encontramos el pago del grupo')
    await db.event.create({ data: { userId: u!.id, name: 'portal_open', props: { group: g!.id } } })
    return { url: url! }
  }
  await db.$transaction(async tx => {
    await lockGroup(tx, g!.id)
    const fresh = await tx.groupPlan.findUniqueOrThrow({ where: { id: g!.id } })
    if (LIVE_GROUP.includes(fresh.status)) await endGroup(tx, fresh)
  })
  return { url: null }
}

/** Antes de borrar la cuenta de quien paga un grupo: se cancela su pago y cada miembro vuelve a lo suyo */
export async function beforeDeleteAccount(userId: string) {
  const owned = await db.groupPlan.findMany({ where: { ownerId: userId, status: { in: LIVE_GROUP } } })
  for (const g of owned) {
    if (g.stripeSubId && stripe) {
      try {
        await stripe.subscriptions.cancel(g.stripeSubId)
      } catch (e) {
        console.error('deleteAccount/group stripe', g.id, e)
        fail(502, 'PAYMENTS_UNAVAILABLE', 'No hemos podido cancelar el pago de tu grupo. Inténtalo de nuevo o escríbenos desde Ayuda.')
      }
    }
    await db.$transaction(async tx => {
      await lockGroup(tx, g.id)
      const fresh = await tx.groupPlan.findUniqueOrThrow({ where: { id: g.id } })
      if (fresh.status !== 'CANCELED') await endGroup(tx, fresh)
    })
  }
}

/** Le aprueban el precio de estudiante y paga un grupo con el precio normal: pasa al de estudiante desde el siguiente cobro */
export async function groupToStudent(userId: string) {
  const g = await db.groupPlan.findFirst({ where: { ownerId: userId, status: { in: LIVE_GROUP }, stripeSubId: { not: null }, student: false } })
  if (!g || !stripe) return false
  const { switchGroupToStudent } = await import('../billing/stripe')
  return switchGroupToStudent(g.stripeSubId!, { size: g.size, tier: g.tier as PaidTier, interval: g.interval as BillingInterval })
}

/** Para planBadge y otras pantallas: el grupo de la persona (si está en uno en marcha) */
export async function groupBadge(userId: string) {
  const m = await db.groupMember.findUnique({ where: { userId }, select: { group: { select: { name: true, ownerId: true, status: true, tier: true } } } })
  if (!m || !LIVE_GROUP.includes(m.group.status)) return null
  return { name: m.group.name, owner: m.group.ownerId === userId, tier: m.group.tier as PaidTier, pastDue: m.group.status === 'PAST_DUE' }
}

// ── Admin: lista de grupos ───────────────────────────────
export async function adminGroups() {
  const { requireAdmin } = await import('./admin')
  await requireAdmin()
  const rows = await db.groupPlan.findMany({ orderBy: { createdAt: 'desc' }, take: 300, include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { members: true } } } })
  return rows.map(g => ({
    id: g.id, name: g.name, ownerId: g.owner.id, ownerName: g.owner.name || '—', ownerEmail: g.owner.email, tier: g.tier as PaidTier, size: g.size, seats: seatsOf(g.size), members: g._count.members,
    interval: g.interval as BillingInterval, student: g.student, status: g.status, price: groupPriceOf(g.size as GroupSize, g.tier as PaidTier, g.interval as BillingInterval, g.student), renewsAt: g.renewsAt?.toISOString() ?? null, createdAt: g.createdAt.toISOString(), stripe: !!g.stripeSubId,
  }))
}
