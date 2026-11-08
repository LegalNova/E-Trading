import 'server-only'
// Proyecto final «Tu primera tesis de inversión»: una guía de 8 preguntas sobre UNA empresa real del mercado de la app.
// Se abre al aprobar el reto final de «Invierte desde hoy» (s0boss) y está en todos los planes.
// XP: +150 la primera tesis terminada y +50 las siguientes, como mucho una al día con XP.
import { randomBytes } from 'node:crypto'
import type { Thesis as ThesisRow, User } from '@/generated/prisma/client'
import { checkStep, currentStep, scoreThesis, StepInput, ThesisAnswers, THESIS_STEPS, type StepN, type ThesisAnswersT, type ThesisDetailT, type ThesisFactsT, type ThesisListT, type ThesisT } from '@/shared/thesis'
import type { EffectsT } from '@/shared/contract'
import { LESSON } from '../content/catalog'
import { lessonTitleT } from '../content/translate'
import { db } from '../db'
import { currentLocale } from '../locale'
import { assetDetail } from '../market/service'
import { track } from './analytics'
import { addXp, bump, endFx, fail, markActive, withCtx, type Tx } from './core'

/** Reto que abre el proyecto (quien aprobó el antiguo primer reto, s1boss, también lo tiene) */
export const THESIS_GATE = 's0boss'
const XP_FIRST = 150
const XP_NEXT = 50
const MAX_DRAFTS = 5
const MAX_TOTAL = 40

export async function thesisUnlocked(tx: Tx, user: User) {
  if (user.role === 'ADMIN') return true
  return (await tx.lessonProgress.count({ where: { userId: user.id, lessonId: { in: [THESIS_GATE, 's1boss'] } } })) > 0
}
async function requireUnlocked(tx: Tx, user: User) {
  if (!(await thesisUnlocked(tx, user))) fail(403, 'THESIS_LOCKED', 'Aprueba el reto final de «Invierte desde hoy» para abrir el proyecto')
}

const answersOf = (t: ThesisRow): ThesisAnswersT => {
  const r = ThesisAnswers.safeParse(t.answers)
  return r.success ? r.data : {}
}

async function namesOf(symbols: string[]) {
  const rows = symbols.length ? await db.asset.findMany({ where: { symbol: { in: [...new Set(symbols)] } }, select: { symbol: true, name: true } }) : []
  return new Map(rows.map(r => [r.symbol, r.name]))
}

function toT(t: ThesisRow, name: string, facts?: Pick<ThesisFactsT, 'pe' | 'sectorPe'>): ThesisT {
  const answers = answersOf(t)
  const parts = t.status === 'DONE' && facts ? scoreThesis(answers, facts).parts : []
  return { id: t.id, symbol: t.symbol, name, status: t.status === 'DONE' ? 'DONE' : 'DRAFT', step: currentStep(answers), answers, score: t.score, parts, shareCode: t.shareCode, createdAt: t.createdAt.toISOString(), completedAt: t.completedAt?.toISOString() ?? null }
}

// ── Datos reales de la ficha ─────────────────────────────
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export async function thesisFacts(symbol: string): Promise<ThesisFactsT> {
  const [a, f] = await Promise.all([assetDetail(symbol, 'EUR'), db.fundamentals.findUnique({ where: { symbol } })])
  const row = a ? null : await db.asset.findUnique({ where: { symbol }, select: { name: true, sector: true, country: true, currency: true, description: true } })
  const sector = a?.sector ?? row?.sector ?? ''
  // PER del sector: mediana de las empresas del mismo sector con dato (solo si hay al menos 5, para que signifique algo)
  let sectorPe: number | null = null
  let sectorN = 0
  if (sector) {
    const peers = await db.asset.findMany({ where: { sector, type: 'STOCK', enabled: true, symbol: { not: symbol } }, select: { symbol: true }, take: 2000 })
    const pes = peers.length ? (await db.fundamentals.findMany({ where: { symbol: { in: peers.map(p => p.symbol) }, pe: { gt: 0, lt: 300 } }, select: { pe: true } })).map(x => x.pe!) : []
    sectorN = pes.length
    if (pes.length >= 5) sectorPe = Math.round(median(pes) * 10) / 10
  }
  // PER histórico: solo si la fuente de datos lo trae (payload.peAvg5y); si no, el paso lo dice
  const payload = (f?.payload ?? null) as Record<string, unknown> | null
  const price = a ? Number(a.price) : null
  return {
    symbol,
    ticker: a?.ticker ?? symbol.split('.')[0],
    name: a?.name ?? row?.name ?? symbol,
    sector,
    country: a?.country ?? row?.country ?? '',
    currency: a?.currency ?? row?.currency ?? '',
    price: price && Number.isFinite(price) && price > 0 ? price : null,
    high52: a?.high52 ?? null,
    low52: a?.low52 ?? null,
    pe: num(f?.pe),
    dividendYield: num(f?.dividendYield),
    sectorPe,
    sectorN,
    peHistory: num(payload?.peAvg5y),
    description: a?.description ?? row?.description ?? '',
    asOf: a?.asOf ?? null,
    stale: a?.stale ?? true,
  }
}

// ── Lista, crear, ver ────────────────────────────────────
export const thesisList = () =>
  withCtx(async (c): Promise<ThesisListT> => {
    const unlocked = await thesisUnlocked(c.tx, c.user)
    const rows = await c.tx.thesis.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'desc' }, take: MAX_TOTAL })
    const names = await namesOf(rows.map(r => r.symbol))
    const gate = LESSON[THESIS_GATE]
    return {
      unlocked,
      needs: unlocked || !gate ? null : lessonTitleT(currentLocale(), THESIS_GATE, gate.title),
      items: rows.map(r => {
        const t = toT(r, names.get(r.symbol) ?? r.symbol)
        return { id: t.id, symbol: t.symbol, name: t.name, status: t.status, step: t.step, score: t.score, createdAt: t.createdAt, completedAt: t.completedAt }
      }),
    }
  })

export const thesisCreate = (symbol: string) =>
  withCtx(async (c): Promise<ThesisT> => {
    await requireUnlocked(c.tx, c.user)
    // Solo empresas: la tesis va de un negocio (ni índices, ni cripto, ni divisas)
    const asset = await c.tx.asset.findFirst({ where: { symbol, enabled: true, hidden: false }, select: { symbol: true, name: true, type: true } })
    if (!asset) fail(404, 'NOT_FOUND', 'Empresa no encontrada')
    if (asset!.type !== 'STOCK') fail(400, 'THESIS_NOT_STOCK', 'Elige una empresa (una acción): la tesis analiza un negocio')
    const [drafts, total] = await Promise.all([c.tx.thesis.count({ where: { userId: c.user.id, status: 'DRAFT' } }), c.tx.thesis.count({ where: { userId: c.user.id } })])
    if (drafts >= MAX_DRAFTS) fail(409, 'THESIS_DRAFTS', `Tienes ${MAX_DRAFTS} borradores: termina o borra alguno antes de empezar otro`)
    if (total >= MAX_TOTAL) fail(409, 'THESIS_MAX', 'Has llegado al máximo de tesis guardadas: borra alguna antigua')
    // Si ya hay un borrador de la misma empresa, se sigue con él
    const same = await c.tx.thesis.findFirst({ where: { userId: c.user.id, symbol, status: 'DRAFT' } })
    const t = same ?? (await c.tx.thesis.create({ data: { userId: c.user.id, symbol, answers: {} } }))
    return toT(t, asset!.name)
  })

async function ownThesis(tx: Tx, userId: string, id: string) {
  const t = await tx.thesis.findFirst({ where: { id, userId } })
  if (!t) fail(404, 'NOT_FOUND', 'Tesis no encontrada')
  return t!
}

export async function thesisGet(id: string): Promise<ThesisDetailT> {
  const t0 = await withCtx(async c => ownThesis(c.tx, c.user.id, id))
  const facts = await thesisFacts(t0.symbol)
  return { thesis: toT(t0, facts.name, facts), facts }
}

// ── Contestar un paso ────────────────────────────────────
const STEP_MSG: Record<string, string> = {
  SHORT: 'Escribe un poco más: con una o dos frases basta',
  CHOOSE: 'Elige una opción',
  RISKS_MIN: 'Escribe al menos 2 riesgos',
  RISKS_SAME: 'Los riesgos tienen que ser distintos',
  WEIGHT_MIN: 'Indica qué parte de tu cartera le darías',
  WEIGHT_MAX: 'No más del 20 % de la cartera en una sola empresa',
  NO_PRICE: 'Ahora no tenemos el precio de esta empresa: vuelve en un rato',
  STOP_ZERO: 'Indica dónde pondrías el stop',
  STOP_ABOVE: 'El stop tiene que estar por debajo del precio actual',
  TARGET_BELOW: 'El objetivo tiene que estar por encima del precio actual',
}

export async function thesisStep(id: string, n: number, body: unknown): Promise<ThesisT> {
  if (!Number.isInteger(n) || n < 1 || n > THESIS_STEPS) fail(400, 'VALIDATION_ERROR', 'Paso no válido')
  const step = n as StepN
  const patch = StepInput[step].parse(body) as Partial<ThesisAnswersT>
  // El precio de referencia del stop y el objetivo es el del servidor, nunca el que envía el navegador
  const symbol = step === 6 ? (await withCtx(async c => ownThesis(c.tx, c.user.id, id))).symbol : null
  const price = symbol ? (await thesisFacts(symbol)).price : null
  return withCtx(async c => {
    const t = await ownThesis(c.tx, c.user.id, id)
    if (t.status === 'DONE') fail(409, 'THESIS_DONE', 'Esta tesis ya está terminada')
    const prev = answersOf(t)
    const next: ThesisAnswersT = { ...prev, ...patch, ...(step === 6 ? { priceAt: price ?? undefined } : {}) }
    if (step === 3) next.risks = (patch.risks ?? []).filter(s => s.length > 0)
    const err = checkStep(step, next, step === 6 ? price : null)
    if (err) fail(400, `THESIS_${err}`, STEP_MSG[err])
    const saved = await c.tx.thesis.update({ where: { id: t.id }, data: { answers: next } })
    return toT(saved, (await namesOf([t.symbol])).get(t.symbol) ?? t.symbol)
  })
}

// ── Terminar: puntuación, certificado y XP ───────────────
const dayNo = (ymd: string) => Number(ymd.replaceAll('-', ''))
const newCode = () => randomBytes(8).toString('hex').slice(0, 12)

export async function thesisFinish(id: string): Promise<{ thesis: ThesisT; first: boolean; xp: number; effects: EffectsT }> {
  const t0 = await withCtx(async c => ownThesis(c.tx, c.user.id, id))
  const facts = await thesisFacts(t0.symbol)
  return withCtx(async c => {
    const t = await ownThesis(c.tx, c.user.id, id)
    if (t.status === 'DONE') fail(409, 'THESIS_DONE', 'Esta tesis ya está terminada')
    const a = answersOf(t)
    const missing = currentStep(a)
    if (missing <= THESIS_STEPS) fail(400, 'THESIS_INCOMPLETE', `Te falta el paso ${missing}`)
    const { total } = scoreThesis(a, facts)
    const first = (c.counters.thesisDone ?? 0) === 0
    const today = dayNo(c.today)
    const xp = c.counters.thesisXpDay === today ? 0 : first ? XP_FIRST : XP_NEXT
    // Dos peticiones a la vez: solo una pasa de borrador a terminada
    const done = await c.tx.thesis.updateMany({ where: { id: t.id, status: 'DRAFT' }, data: { status: 'DONE', score: total, completedAt: new Date(), shareCode: newCode() } })
    if (!done.count) fail(409, 'THESIS_DONE', 'Esta tesis ya está terminada')
    bump(c, 'thesisDone')
    if (xp) {
      addXp(c, xp)
      c.counters.thesisXpDay = today
    }
    await markActive(c)
    await track(c.tx, c.user.id, 'thesis_done', { symbol: t.symbol, score: total, first, xp })
    const saved = await c.tx.thesis.findUniqueOrThrow({ where: { id: t.id } })
    return { thesis: toT(saved, facts.name, facts), first, xp, effects: await endFx(c) }
  })
}

export const thesisDelete = (id: string) =>
  withCtx(async c => {
    const t = await ownThesis(c.tx, c.user.id, id)
    await c.tx.thesis.delete({ where: { id: t.id } })
  })
