// API de la app (docs/07-contrato-api.md). Las rutas de mercado y de acceso tienen su propio archivo.
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { HttpError } from '@/server/game/core'
import * as admin from '@/server/game/admin'
import * as learning from '@/server/game/learning'
import * as profile from '@/server/game/profile'
import * as trading from '@/server/game/trading'
import { requireUser } from '@/server/game/core'
import { db } from '@/server/db'
import { clientIp, rateLimit } from '@/server/http/ratelimit'

type Handler = (req: NextRequest, p: string[], body: unknown) => Promise<unknown>
interface Route { method: string; path: string; run: Handler }

const order = z.object({
  symbol: z.string().max(12),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT']),
  amount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  qty: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  triggerPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  riskAcknowledged: z.boolean().optional(),
  followedRiskAdvice: z.boolean().optional(),
})
const draft = z
  .object({
    name: z.string().max(30), gender: z.enum(['F', 'M', 'N']), birthDate: z.string().max(10), experience: z.enum(['NONE', 'SOME', 'EXPERIENCED']), goals: z.array(z.string().max(40)).max(10),
    dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]), skinId: z.enum(['azul', 'grafito', 'plata', 'hielo']), companionName: z.string().max(14), disclaimerAccepted: z.boolean(),
  })
  .partial()
const settings = z
  .object({
    locale: z.enum(['es', 'ca', 'en']), currency: z.enum(['EUR', 'USD']), dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]), theme: z.enum(['AUTO', 'LIGHT', 'DARK']),
    gender: z.enum(['F', 'M', 'N']), notificationPrefs: z.record(z.string(), z.object({ inApp: z.boolean(), email: z.boolean(), push: z.boolean() })), name: z.string().max(30), companionName: z.string().max(14), leagueVisible: z.boolean(),
  })
  .partial()
const range = (req: NextRequest) => {
  const r = req.nextUrl.searchParams.get('range')
  return (['1W', '1M', '3M', 'ALL'].includes(r ?? '') ? r : '1M') as '1W' | '1M' | '3M' | 'ALL'
}

const routes: Route[] = [
  // Acceso y onboarding
  { method: 'GET', path: 'session', run: () => profile.session() },
  { method: 'GET', path: 'onboarding', run: () => profile.onboarding() },
  { method: 'PUT', path: 'onboarding', run: (_r, _p, b) => { const x = z.object({ step: z.number().int().min(1).max(7), patch: draft }).parse(b); return profile.saveOnboarding(x.step, x.patch) } },
  { method: 'POST', path: 'onboarding/complete', run: () => profile.completeOnboarding() },
  // Inicio y perfil
  { method: 'GET', path: 'home', run: () => profile.home() },
  { method: 'GET', path: 'me', run: () => profile.me() },
  { method: 'GET', path: 'me/lives', run: () => profile.lives() },
  { method: 'POST', path: 'me/lives/refill', run: () => profile.refillLives() },
  { method: 'GET', path: 'me/trading-stats', run: () => trading.tradingStats() },
  { method: 'GET', path: 'me/settings', run: () => profile.settings() },
  { method: 'PATCH', path: 'me/settings', run: (_r, _p, b) => profile.updateSettings(settings.parse(b)) },
  { method: 'GET', path: 'me/export', run: () => profile.exportData() },
  { method: 'DELETE', path: 'me', run: () => profile.deleteAccount() },
  // Clases y quiz
  { method: 'GET', path: 'courses/path', run: () => profile.path() },
  { method: 'GET', path: 'lessons/:id', run: async (_r, p) => { const u = await requireUser(); return learning.lesson(u, db, p[0]) } },
  { method: 'POST', path: 'lessons/:id/steps/:step/check', run: async (_r, p, b) => { await requireUser(); return learning.checkStep(p[0], p[1], z.object({ candleIndex: z.number().int() }).parse(b).candleIndex) } },
  { method: 'POST', path: 'quiz/:id/start', run: (_r, p) => learning.quizStart(p[0]) },
  { method: 'POST', path: 'quiz/attempts/:id/answer', run: (_r, p, b) => { const x = z.object({ questionId: z.string().max(40), answer: z.union([z.number(), z.array(z.number()).max(10), z.string().max(60)]), elapsedMs: z.number() }).parse(b); return learning.answer(p[0], x.questionId, x.answer, x.elapsedMs) } },
  { method: 'POST', path: 'quiz/attempts/:id/finish', run: (_r, p) => learning.quizFinish(p[0]) },
  { method: 'POST', path: 'quiz/attempts/:id/placement-finish', run: (_r, p) => learning.placementFinish(p[0]) },
  { method: 'GET', path: 'quiz/mistakes/count', run: () => profile.mistakesCount() },
  // Mercado y cartera
  { method: 'GET', path: 'watchlist', run: () => trading.watchlist() },
  { method: 'POST', path: 'watchlist/:symbol', run: (_r, p) => trading.toggleWatch(p[0].toUpperCase()) },
  { method: 'POST', path: 'orders/preview', run: (_r, _p, b) => trading.preview(order.parse(b)) },
  { method: 'POST', path: 'orders', run: (r, _p, b) => trading.placeOrder(order.parse(b), r.headers.get('idempotency-key')?.slice(0, 80) || undefined) },
  { method: 'GET', path: 'orders', run: () => trading.orders() },
  { method: 'DELETE', path: 'orders/:id', run: (_r, p) => trading.cancelOrder(p[0]) },
  { method: 'GET', path: 'trades', run: () => trading.trades() },
  { method: 'GET', path: 'portfolio', run: () => trading.portfolio() },
  { method: 'GET', path: 'portfolio/history', run: r => trading.history(range(r)) },
  { method: 'POST', path: 'portfolio/reset', run: () => trading.resetPortfolio() },
  { method: 'GET', path: 'alerts', run: () => trading.alerts() },
  { method: 'POST', path: 'alerts', run: (_r, _p, b) => { const x = z.object({ symbol: z.string().max(12), condition: z.enum(['ABOVE', 'BELOW']), price: z.string().regex(/^\d+(\.\d+)?$/) }).parse(b); return trading.createAlert(x.symbol, x.condition, x.price) } },
  { method: 'DELETE', path: 'alerts/:id', run: (_r, p) => trading.deleteAlert(p[0]) },
  // Progreso
  { method: 'GET', path: 'streak', run: () => profile.streak() },
  { method: 'POST', path: 'shop/streak-freeze', run: () => profile.buyFreeze() },
  { method: 'GET', path: 'achievements', run: () => profile.achievements() },
  { method: 'GET', path: 'league/current', run: () => profile.league() },
  { method: 'GET', path: 'notifications', run: () => profile.notifications() },
  { method: 'POST', path: 'notifications/read', run: (_r, _p, b) => { const x = z.object({ ids: z.union([z.array(z.string()).max(100), z.literal('all')]) }).parse(b); return profile.markRead(x.ids) } },
  // Premium (simulado hasta Stripe)
  { method: 'GET', path: 'billing/plans', run: async () => profile.PLANS },
  { method: 'GET', path: 'billing/status', run: () => profile.billingStatus() },
  { method: 'POST', path: 'billing/checkout', run: (_r, _p, b) => profile.checkout(z.object({ planId: z.string().max(40) }).parse(b).planId) },
  { method: 'POST', path: 'billing/cancel', run: () => profile.cancelSubscription() },
  // Público
  { method: 'GET', path: 'public/stats', run: () => profile.publicStats() },
  { method: 'POST', path: 'waitlist', run: async (r, _p, b) => { const x = z.object({ email: z.string().max(200), website: z.string().max(200).optional() }).parse(b); if (x.website) return; await rateLimit(`waitlist:${clientIp(r)}`, 5, 600); return profile.joinWaitlist(x.email, r.headers.get('accept-language')?.slice(0, 2) ?? 'es') } },
  { method: 'POST', path: 'contact', run: async (r, _p, b) => { const x = z.object({ name: z.string().max(100), email: z.string().max(200), reason: z.string().max(20), message: z.string().max(5000), website: z.string().max(200).optional() }).parse(b); if (x.website) return; await rateLimit(`contact:${clientIp(r)}`, 3, 600); return profile.contact(x) } },
  // Admin
  { method: 'GET', path: 'admin/metrics', run: r => admin.metrics((r.nextUrl.searchParams.get('range') ?? '30d') as '7d' | '30d' | '90d') },
  { method: 'GET', path: 'admin/users', run: r => admin.users(r.nextUrl.searchParams.get('q')?.slice(0, 100) || undefined) },
  { method: 'GET', path: 'admin/audit', run: () => admin.audit() },
  { method: 'GET', path: 'admin/content', run: () => admin.content() },
]

function match(method: string, parts: string[]) {
  for (const r of routes) {
    if (r.method !== method) continue
    const segs = r.path.split('/')
    if (segs.length !== parts.length) continue
    const params: string[] = []
    if (segs.every((s, i) => (s.startsWith(':') ? (params.push(decodeURIComponent(parts[i])), true) : s === parts[i]))) return { r, params }
  }
  return null
}

const MAX_BODY = 32 * 1024

/** Las peticiones que cambian datos solo se aceptan desde la propia app (protección CSRF) */
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!origin) return req.headers.get('sec-fetch-site') === 'same-origin'
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

async function handle(req: NextRequest, ctx: RouteContext<'/api/[...path]'>) {
  const { path } = await ctx.params
  const m = match(req.method, path)
  if (!m) return Response.json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } }, { status: 404 })
  const mutating = req.method !== 'GET'
  if (mutating && !sameOrigin(req)) return Response.json({ error: { code: 'FORBIDDEN', message: 'Origen no permitido' } }, { status: 403 })
  try {
    // Límite general por IP (lecturas y escrituras); las escrituras, más estricto
    await rateLimit(`${mutating ? 'w' : 'r'}:${clientIp(req)}`, mutating ? 90 : 600, 60)
    let body: unknown = undefined
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const text = await req.text()
      if (text.length > MAX_BODY) return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Petición demasiado grande' } }, { status: 413 })
      body = text ? JSON.parse(text) : {}
    }
    const out = await m.r.run(req, m.params, body)
    return out === undefined ? new Response(null, { status: 204 }) : Response.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: { code: e.code, message: e.message } }, { status: e.status })
    if (e instanceof z.ZodError || e instanceof SyntaxError) return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos no válidos' } }, { status: 422 })
    console.error(`API ${req.method} /${path.join('/')}`, e)
    return Response.json({ error: { code: 'INTERNAL', message: 'Algo no ha ido bien. Prueba otra vez.' } }, { status: 500 })
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
