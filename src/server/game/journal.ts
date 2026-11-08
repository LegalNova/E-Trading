import 'server-only'
// Diario de operaciones: por qué compras (o vendes) y, a las dos semanas, si se cumplió.
// La entrada se guarda después de que la orden se ejecute o quede pendiente (con el id de la orden).
// El recordatorio (a los 14 días) lo envía la ronda de avisos (src/server/push.ts).
import type { JournalEntryT, JournalSummaryT, JournalT } from '@/shared/contract'
import { DAY_MS } from '@/shared/time'
import { priceBook } from './trading'
import { fail, withCtx } from './core'

export const BUY_TAGS = ['QUALITY', 'CHEAP', 'DIVERSIFY', 'LONG_TERM', 'NEWS', 'SOCIAL', 'HUNCH', 'OTHER'] as const
export const SELL_TAGS = ['TARGET', 'CHANGED', 'REBALANCE', 'NEED_CASH', 'FEAR', 'NEWS', 'SOCIAL', 'HUNCH', 'OTHER'] as const
export const VERDICTS = ['MET', 'NOT_MET', 'TOO_EARLY'] as const
export type Verdict = (typeof VERDICTS)[number]
export const REMIND_DAYS = 14

const n = (d: unknown) => Number(d ?? 0)

/** POST /api/journal: motivo de una orden recién puesta (la propia, ejecutada o pendiente, de la última hora) */
export async function createEntry(i: { orderId: string; tag: string; reason?: string }) {
  return withCtx(async c => {
    const o = await c.tx.order.findFirst({ where: { id: i.orderId, userId: c.user.id } })
    if (!o) return fail(404, 'NOT_FOUND', 'Orden no encontrada')
    if (o.parentId) fail(422, 'VALIDATION_ERROR', 'Las salidas automáticas no llevan motivo')
    if (o.status !== 'FILLED' && o.status !== 'PENDING') fail(422, 'VALIDATION_ERROR', 'Esta orden no se ha ejecutado')
    if (Date.now() - o.createdAt.getTime() > 3_600_000) fail(422, 'VALIDATION_ERROR', 'El motivo se apunta al poner la orden')
    const tags: readonly string[] = o.side === 'BUY' ? BUY_TAGS : SELL_TAGS
    if (!tags.includes(i.tag)) fail(422, 'VALIDATION_ERROR', 'Motivo no válido')
    // Idempotente: si ya se apuntó (doble toque, reintento), se devuelve la que hay
    const prev = await c.tx.journalEntry.findUnique({ where: { orderId: o.id } })
    if (prev) return { id: prev.id }
    // Precio al decidir: el de ejecución; si quedó pendiente, el de ahora. Nunca inventado.
    let price = o.fillPrice === null ? null : n(o.fillPrice)
    if (price === null) price = (await priceBook([o.symbol])).get(o.symbol)?.price ?? null
    if (!(price && price > 0)) fail(503, 'MARKET_UNAVAILABLE', 'Precio no disponible ahora mismo')
    const reason = (i.reason ?? '').replace(/\s+/g, ' ').trim().slice(0, 140)
    const e = await c.tx.journalEntry.create({ data: { userId: c.user.id, orderId: o.id, symbol: o.symbol, side: o.side, tag: i.tag, reason, priceAt: String(price), remindAt: new Date(Date.now() + REMIND_DAYS * DAY_MS) } })
    return { id: e.id }
  })
}

/** GET /api/journal */
export async function journal(): Promise<JournalT> {
  const { rows0, assets } = await withCtx(async c => {
    const rows = await c.tx.journalEntry.findMany({ where: { userId: c.user.id }, orderBy: { createdAt: 'desc' }, take: 200 })
    const syms = [...new Set(rows.map(r => r.symbol))]
    return { rows0: rows, assets: syms.length ? await c.tx.asset.findMany({ where: { symbol: { in: syms } }, select: { symbol: true, name: true, type: true, currency: true } }) : [] }
  })
  const book = rows0.length ? await priceBook(rows0.map(r => r.symbol)) : new Map()
  const meta = new Map(assets.map(a => [a.symbol, a]))
  const now = Date.now()
  const entries: JournalEntryT[] = rows0.map(r => {
    const px = book.get(r.symbol)
    const a = meta.get(r.symbol)
    return {
      id: r.id, orderId: r.orderId, symbol: r.symbol, name: px?.name ?? a?.name ?? r.symbol, type: px?.type ?? a?.type ?? 'STOCK', side: r.side, tag: r.tag, reason: r.reason,
      priceAt: String(n(r.priceAt)), priceNow: px ? px.price : null, currency: px?.currency ?? (a?.currency === 'GBp' ? 'GBP' : (a?.currency ?? '')),
      createdAt: r.createdAt.toISOString(), remindAt: r.remindAt.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null, verdict: (r.verdict as Verdict | null) ?? null, note: r.note,
      due: !r.reviewedAt && r.remindAt.getTime() <= now,
    }
  })
  const by = new Map<string, JournalSummaryT>()
  for (const e of entries) {
    const k = `${e.side}:${e.tag}`
    const s = by.get(k) ?? { side: e.side, tag: e.tag, decided: 0, met: 0, total: 0 }
    s.total++
    if (e.verdict === 'MET' || e.verdict === 'NOT_MET') s.decided++
    if (e.verdict === 'MET') s.met++
    by.set(k, s)
  }
  return { entries, summary: [...by.values()].filter(s => s.decided > 0).sort((a, b) => b.decided - a.decided), due: entries.filter(e => e.due).length }
}

/** POST /api/journal/:id/review: «Se cumplió», «No se cumplió» o «Aún es pronto» (vuelve a recordarlo en 14 días) */
export const reviewEntry = (id: string, verdict: Verdict, note?: string) =>
  withCtx(async c => {
    const e = await c.tx.journalEntry.findFirst({ where: { id, userId: c.user.id } })
    if (!e) return fail(404, 'NOT_FOUND', 'Entrada no encontrada')
    const clean = (note ?? '').replace(/\s+/g, ' ').trim().slice(0, 280) || null
    const early = verdict === 'TOO_EARLY'
    await c.tx.journalEntry.update({ where: { id: e.id }, data: { verdict, note: clean, reviewedAt: early ? null : new Date(), ...(early ? { remindAt: new Date(Date.now() + REMIND_DAYS * DAY_MS) } : {}) } })
    return { id: e.id, verdict }
  })
