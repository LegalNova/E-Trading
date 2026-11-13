// API de la app (docs/07-contrato-api.md). Las rutas de mercado y de acceso tienen su propio archivo.
import type { NextRequest } from 'next/server'
import { withLocale } from '@/server/locale'
import { z } from 'zod'
import { RouteChoice } from '@/shared/contract'
import { HttpError } from '@/server/game/core'
import * as admin from '@/server/game/admin'
import * as reports from '@/server/game/reports'
import * as teamAdmin from '@/server/game/admin-messages'
import * as team from '@/server/game/messages'
import { recordClientEvent, recordServerError } from '@/server/game/analytics'
import { lens, lessonTable, type LensRange } from '@/server/game/lens'
import { realUser } from '@/server/auth'
import { withViewAs } from '@/server/view'
import { withRequest } from '@/server/request'
import * as feedback from '@/server/game/feedback'
import * as push from '@/server/push'
import * as invites from '@/server/game/invites'
import * as gifts from '@/server/game/gifts'
import * as gemStore from '@/server/game/gem-store'
import * as friends from '@/server/game/friends'
import * as learning from '@/server/game/learning'
import * as profile from '@/server/game/profile'
import * as trading from '@/server/game/trading'
import * as tutor from '@/server/tutor/tutor'
import * as thesis from '@/server/game/thesis'
import * as missions from '@/server/game/missions'
import { reviewGoalOnView } from '@/server/game/goals'
import * as journal from '@/server/game/journal'
import * as groups from '@/server/game/groups'
import * as students from '@/server/game/students'
import * as daily from '@/server/game/daily'
import { requireUser } from '@/server/game/core'
import { db } from '@/server/db'
import { clientIp, rateLimit } from '@/server/http/ratelimit'
import { safeDecode } from '@/shared/safe-decode'

type Handler = (req: NextRequest, p: string[], body: unknown) => Promise<unknown>
interface Route { method: string; path: string; run: Handler }

const order = z.object({
  symbol: z.string().max(24),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT']),
  amount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  qty: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  triggerPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  stopLoss: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  takeProfit: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  riskAcknowledged: z.boolean().optional(),
  followedRiskAdvice: z.boolean().optional(),
})
const draft = z
  .object({
    name: z.string().max(30), gender: z.enum(['F', 'M', 'N']), birthDate: z.string().max(10), experience: z.enum(['NONE', 'SOME', 'EXPERIENCED']), goals: z.array(z.string().max(40)).max(10),
    dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30)]), skinId: z.enum(['azul', 'grafito', 'plata', 'hielo']), companionName: z.string().max(14), disclaimerAccepted: z.boolean(),
  })
  .partial()
const settings = z
  .object({
    locale: z.enum(['es', 'ca', 'en']), currency: z.enum(['EUR', 'USD']), dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30)]), theme: z.enum(['AUTO', 'LIGHT', 'DARK']),
    gender: z.enum(['F', 'M', 'N']), notificationPrefs: z.record(z.string(), z.object({ inApp: z.boolean(), email: z.boolean(), push: z.boolean() })), name: z.string().max(30), companionName: z.string().max(14), skinId: z.enum(['azul', 'grafito', 'plata', 'hielo', 'menta', 'coral', 'lavanda', 'oro']), leagueVisible: z.boolean(),
    route: RouteChoice,
  })
  .partial()
const range = (req: NextRequest) => {
  const r = req.nextUrl.searchParams.get('range')
  return (['1W', '1M', '3M', 'ALL'].includes(r ?? '') ? r : '1M') as '1W' | '1M' | '3M' | 'ALL'
}

const lensRange = (req: NextRequest): LensRange => {
  const r = req.nextUrl.searchParams.get('range')
  return r === '7d' || r === 'all' ? r : '30d'
}

const routes: Route[] = [
  // Acceso y onboarding
  { method: 'GET', path: 'session', run: () => profile.session() },
  { method: 'GET', path: 'onboarding', run: () => profile.onboarding() },
  { method: 'PUT', path: 'onboarding', run: (_r, _p, b) => { const x = z.object({ step: z.number().int().min(1).max(7), patch: draft }).parse(b); return profile.saveOnboarding(x.step, x.patch) } },
  // Invitaciones: mi enlace y, sin sesión, el nombre de quien invita (para la portada)
  { method: 'GET', path: 'invite', run: async () => { const u = await requireUser(); return invites.myInvites(u.id, !!u.isAnonymous) } },
  { method: 'GET', path: 'invite/:code', run: async (r, p) => { await rateLimit(`inv:${clientIp(r)}`, 60, 60); return invites.inviterName(p[0]) } },
  // Avisos en el móvil
  { method: 'GET', path: 'push/key', run: async () => ({ key: push.vapidPublicKey() }) },
  { method: 'POST', path: 'push/subscribe', run: async (r, _p, b) => { const u = await requireUser(); const x = z.object({ endpoint: z.string().url().max(800).startsWith('https://'), keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }) }).parse(b); await rateLimit(`push:${u.id}`, 20, 3600); await push.saveSubscription(u.id, x, r.headers.get('user-agent')); await push.welcomePush(u) } },
  { method: 'POST', path: 'push/unsubscribe', run: async (_r, _p, b) => { const u = await requireUser(); await push.removeSubscription(u.id, z.object({ endpoint: z.string().max(800) }).parse(b).endpoint) } },
  // Opinión de los usuarios
  { method: 'GET', path: 'feedback', run: () => feedback.feedbackStatus() },
  { method: 'POST', path: 'feedback', run: (_r, _p, b) => feedback.submitFeedback(feedback.FeedbackInput.parse(b)) },
  { method: 'POST', path: 'feedback/later', run: () => feedback.feedbackLater() },
  { method: 'GET', path: 'admin/feedback', run: () => admin.feedbackSummary() },
  { method: 'POST', path: 'billing/portal', run: () => profile.billingPortal() },
  { method: 'GET', path: 'billing/badge', run: () => profile.planBadge() },
  { method: 'GET', path: 'account/login', run: () => profile.loginMethods() },
  { method: 'POST', path: 'account/password', run: (_r, _p, b) => { const x = z.object({ current: z.string().max(128).optional(), next: z.string().max(128) }).parse(b); return profile.setOwnPassword(x.current, x.next) } },
  { method: 'POST', path: 'account/save', run: (_r, _p, b) => { const x = z.object({ email: z.string().max(200), password: z.string().max(128), name: z.string().max(30).optional() }).parse(b); return profile.saveGuest(x.email, x.password, x.name) } },
  { method: 'POST', path: 'onboarding/complete', run: (_r, _p, b) => profile.completeOnboarding(z.object({ source: z.string().max(80).optional() }).catch({}).parse(b ?? {}).source) },
  // Inicio y perfil
  { method: 'GET', path: 'home', run: () => profile.home() },
  { method: 'GET', path: 'me', run: () => profile.me() },
  { method: 'GET', path: 'me/lives', run: () => profile.lives() },
  { method: 'POST', path: 'me/lives/refill', run: () => profile.refillLives() },
  { method: 'GET', path: 'shop/gems', run: () => profile.gemShop() },
  { method: 'POST', path: 'shop/cash', run: () => profile.buyCash() },
  { method: 'POST', path: 'shop/lesson', run: (_r, _p, b) => profile.buyLesson(z.object({ id: z.string().max(20) }).parse(b).id) },
  { method: 'POST', path: 'shop/tutor', run: () => profile.buyTutor() },
  { method: 'POST', path: 'shop/reset', run: () => profile.buyReset() },
  { method: 'POST', path: 'shop/max-pass', run: () => profile.buyMaxPass() },
  { method: 'POST', path: 'shop/skin', run: (_r, _p, b) => profile.buySkin(z.object({ id: z.string().max(20) }).parse(b).id) },
  { method: 'GET', path: 'me/trading-stats', run: () => trading.tradingStats() },
  { method: 'GET', path: 'me/settings', run: () => profile.settings() },
  { method: 'PATCH', path: 'me/settings', run: (_r, _p, b) => profile.updateSettings(settings.parse(b)) },
  { method: 'GET', path: 'me/export', run: () => profile.exportData() },
  { method: 'DELETE', path: 'me', run: () => profile.deleteAccount() },
  // Clases y quiz
  { method: 'GET', path: 'courses/path', run: () => profile.path() },
  { method: 'GET', path: 'lessons/:id', run: async (r, p) => { const u = await requireUser(); return learning.lesson(u, db, p[0], r.nextUrl.searchParams.get('peek') === '1') } },
  { method: 'POST', path: 'lessons/:id/steps/:step/check', run: async (_r, p, b) => { await requireUser(); return learning.checkStep(p[0], p[1], z.object({ candleIndex: z.number().int() }).parse(b).candleIndex) } },
  { method: 'POST', path: 'quiz/:id/start', run: (_r, p) => learning.quizStart(p[0]) },
  { method: 'POST', path: 'quiz/attempts/:id/answer', run: async (_r, p, b) => { await rateLimit(`ans:${(await requireUser()).id}`, 120, 60); const x = z.object({ questionId: z.string().max(40), answer: z.union([z.number(), z.array(z.number()).max(12), z.string().max(60)]), elapsedMs: z.number() }).parse(b); return learning.answer(p[0], x.questionId, x.answer, x.elapsedMs) } },
  { method: 'POST', path: 'quiz/attempts/:id/finish', run: (_r, p) => learning.quizFinish(p[0]) },
  { method: 'POST', path: 'quiz/attempts/:id/hint', run: (_r, p, b) => learning.hint(p[0], z.object({ questionId: z.string().max(40) }).parse(b).questionId) },
  { method: 'POST', path: 'quiz/attempts/:id/placement-finish', run: (_r, p) => learning.placementFinish(p[0]) },
  { method: 'GET', path: 'quiz/mistakes/count', run: () => profile.mistakesCount() },
  // Lumi, la profesora
  { method: 'GET', path: 'tutor', run: async () => tutor.history(await requireUser()) },
  { method: 'POST', path: 'tutor/ask', run: async (r, _p, b) => { const x = z.object({ question: z.string().min(1).max(600), mode: z.enum(['EXPLAIN', 'PATH', 'PORTFOLIO', 'BIASES']).default('EXPLAIN') }).parse(b); const u = await requireUser(); await rateLimit(`tutor:${u.id}`, 8, 60); return tutor.ask(u, x.question, x.mode) } },
  { method: 'DELETE', path: 'tutor', run: async () => tutor.clearHistory(await requireUser()) },
  // Proyecto final: «Tu primera tesis de inversión»
  { method: 'GET', path: 'thesis', run: () => thesis.thesisList() },
  { method: 'POST', path: 'thesis', run: async (_r, _p, b) => { const x = z.object({ symbol: z.string().min(1).max(24).regex(/^[A-Za-z0-9.^=\-]+$/) }).parse(b); await rateLimit(`thesis:${(await requireUser()).id}`, 10, 60); return thesis.thesisCreate(x.symbol) } },
  { method: 'GET', path: 'thesis/:id', run: (_r, p) => thesis.thesisGet(z.string().max(40).parse(p[0])) },
  { method: 'PUT', path: 'thesis/:id/steps/:n', run: async (_r, p, b) => { await rateLimit(`thesis-step:${(await requireUser()).id}`, 60, 60); return thesis.thesisStep(z.string().max(40).parse(p[0]), Number(p[1]), b) } },
  { method: 'POST', path: 'thesis/:id/finish', run: async (_r, p) => { await rateLimit(`thesis-fin:${(await requireUser()).id}`, 10, 60); return thesis.thesisFinish(z.string().max(40).parse(p[0])) } },
  { method: 'DELETE', path: 'thesis/:id', run: (_r, p) => thesis.thesisDelete(z.string().max(40).parse(p[0])) },
  // Mercado y cartera
  { method: 'GET', path: 'watchlist', run: () => trading.watchlist() },
  { method: 'POST', path: 'watchlist/:symbol', run: (_r, p) => trading.toggleWatch(p[0].toUpperCase()) },
  { method: 'POST', path: 'orders/preview', run: (_r, _p, b) => trading.preview(order.parse(b)) },
  { method: 'POST', path: 'orders', run: async (r, _p, b) => { await rateLimit(`ord:${(await requireUser()).id}`, 30, 60); return trading.placeOrder(order.parse(b), r.headers.get('idempotency-key')?.slice(0, 80) || undefined) } },
  { method: 'GET', path: 'orders', run: () => trading.orders() },
  { method: 'DELETE', path: 'orders/:id', run: (_r, p) => trading.cancelOrder(p[0]) },
  { method: 'GET', path: 'trades', run: () => trading.trades() },
  { method: 'GET', path: 'portfolio', run: () => trading.portfolio() },
  { method: 'GET', path: 'portfolio/history', run: r => trading.history(range(r)) },
  { method: 'POST', path: 'portfolio/reset', run: () => trading.resetPortfolio() },
  { method: 'GET', path: 'alerts', run: () => trading.alerts() },
  { method: 'POST', path: 'alerts', run: (_r, _p, b) => { const x = z.object({ symbol: z.string().max(24), condition: z.enum(['ABOVE', 'BELOW']), price: z.string().regex(/^\d+(\.\d+)?$/) }).parse(b); return trading.createAlert(x.symbol, x.condition, x.price) } },
  { method: 'DELETE', path: 'alerts/:id', run: (_r, p) => trading.deleteAlert(p[0]) },
  // Misiones «Pruébalo» y diario de operaciones
  { method: 'GET', path: 'missions', run: () => missions.missions() },
  { method: 'GET', path: 'missions/lesson/:id', run: (_r, p) => missions.lessonMission(z.string().regex(/^[a-z0-9-]{1,24}$/).parse(p[0])) },
  { method: 'POST', path: 'missions/seen', run: async (_r, _p, b) => { const x = z.object({ symbol: z.string().regex(/^[A-Za-z0-9.^=&-]{1,24}$/).optional(), portfolio: z.boolean().optional() }).parse(b); await rateLimit(`mseen:${(await requireUser()).id}`, 60, 60); return missions.missionSeen(x) } },
  { method: 'GET', path: 'journal', run: () => journal.journal() },
  { method: 'POST', path: 'journal', run: async (_r, _p, b) => { const x = z.object({ orderId: z.string().min(1).max(40), tag: z.string().regex(/^[A-Z_]{2,12}$/), reason: z.string().max(140).optional() }).parse(b); await rateLimit(`jrn:${(await requireUser()).id}`, 30, 60); return journal.createEntry(x) } },
  { method: 'POST', path: 'journal/:id/review', run: async (_r, p, b) => { const x = z.object({ verdict: z.enum(journal.VERDICTS), note: z.string().max(280).optional() }).parse(b); await rateLimit(`jrv:${(await requireUser()).id}`, 30, 60); return journal.reviewEntry(z.string().min(1).max(40).parse(p[0]), x.verdict, x.note) } },
  // Progreso
  { method: 'GET', path: 'streak', run: () => profile.streak() },
  { method: 'POST', path: 'shop/streak-freeze', run: () => profile.buyFreeze() },
  { method: 'GET', path: 'achievements', run: () => profile.achievements() },
  { method: 'GET', path: 'league/current', run: () => profile.league() },
  // Ligas de amigos (gratis). El id de la liga es un cuid; el código, 8 caracteres (se valida en friends.ts para dar un error claro)
  { method: 'GET', path: 'friends', run: () => friends.myLeagues() },
  { method: 'POST', path: 'friends', run: async (_r, _p, b) => { const x = z.object({ name: z.string().max(200) }).parse(b); await rateLimit(`flc:${(await requireUser()).id}`, 10, 3600); return friends.createLeague(x.name) } },
  { method: 'POST', path: 'friends/join', run: async (_r, _p, b) => { const x = z.object({ code: z.string().max(40) }).parse(b); await rateLimit(`flj:${(await requireUser()).id}`, 20, 3600); return friends.joinLeague(x.code) } },
  { method: 'GET', path: 'friends/code/:code', run: async (r, p) => { await rateLimit(`flp:${clientIp(r)}`, 30, 60); return friends.peekLeague(z.string().max(40).parse(p[0])) } },
  { method: 'GET', path: 'friends/:id', run: (_r, p) => friends.leagueDetail(z.string().regex(/^[a-z0-9]{10,40}$/).parse(p[0])) },
  { method: 'PATCH', path: 'friends/:id', run: async (_r, p, b) => { const x = z.object({ name: z.string().max(200) }).parse(b); await rateLimit(`fle:${(await requireUser()).id}`, 30, 3600); return friends.renameLeague(z.string().regex(/^[a-z0-9]{10,40}$/).parse(p[0]), x.name) } },
  { method: 'DELETE', path: 'friends/:id', run: (_r, p) => friends.deleteLeague(z.string().regex(/^[a-z0-9]{10,40}$/).parse(p[0])) },
  { method: 'POST', path: 'friends/:id/leave', run: (_r, p) => friends.leaveLeague(z.string().regex(/^[a-z0-9]{10,40}$/).parse(p[0])) },
  { method: 'DELETE', path: 'friends/:id/members/:key', run: async (_r, p) => { await rateLimit(`fle:${(await requireUser()).id}`, 30, 3600); return friends.removeMember(z.string().regex(/^[a-z0-9]{10,40}$/).parse(p[0]), z.string().regex(/^[A-Za-z0-9_-]{16}$/).parse(p[1])) } },
  { method: 'GET', path: 'notifications', run: () => profile.notifications() },
  { method: 'POST', path: 'notifications/read', run: (_r, _p, b) => { const x = z.object({ ids: z.union([z.array(z.string()).max(100), z.literal('all')]) }).parse(b); return profile.markRead(x.ids) } },
  // Premium (simulado hasta Stripe)
  { method: 'GET', path: 'billing/plans', run: () => profile.billingPlans() },
  // Precio de estudiante (la solicitud con el justificante se sube a /api/uploads/student) y planes de grupo
  { method: 'GET', path: 'billing/student', run: () => students.myStudent() },
  { method: 'GET', path: 'groups/mine', run: () => groups.myGroup() },
  { method: 'POST', path: 'groups', run: async (_r, _p, b) => { const x = z.object({ name: z.string().max(200), tier: z.enum(['PLUS', 'PREMIUM']), size: z.union([z.literal(4), z.literal(8), z.literal(0)]), interval: z.enum(['MONTH', 'YEAR']) }).parse(b); await rateLimit(`grc:${(await requireUser()).id}`, 15, 3600); return groups.createGroup(x) } },
  { method: 'POST', path: 'groups/confirm', run: async (_r, _p, b) => { await rateLimit(`grpay:${(await requireUser()).id}`, 40, 60); return groups.confirmGroup(z.object({ sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]{10,200}$/) }).parse(b).sessionId) } },
  { method: 'GET', path: 'groups/code/:code', run: async (r, p) => { await rateLimit(`grp:${clientIp(r)}`, 30, 60); return groups.peekGroup(z.string().max(40).parse(p[0])) } },
  { method: 'POST', path: 'groups/join', run: async (_r, _p, b) => { const x = z.object({ code: z.string().max(40) }).parse(b); await rateLimit(`grj:${(await requireUser()).id}`, 20, 3600); return groups.joinGroup(x.code) } },
  { method: 'POST', path: 'groups/leave', run: () => groups.leaveGroup() },
  { method: 'PATCH', path: 'groups/mine', run: async (_r, _p, b) => { const x = z.object({ name: z.string().max(200) }).parse(b); await rateLimit(`gre:${(await requireUser()).id}`, 30, 3600); return groups.renameGroup(x.name) } },
  { method: 'DELETE', path: 'groups/members/:key', run: async (_r, p) => { await rateLimit(`gre:${(await requireUser()).id}`, 30, 3600); return groups.removeGroupMember(z.string().regex(/^[A-Za-z0-9_-]{16}$/).parse(p[0])) } },
  { method: 'POST', path: 'groups/payment', run: async () => { await rateLimit(`grpo:${(await requireUser()).id}`, 20, 600); return groups.groupPayment() } },
  { method: 'GET', path: 'admin/students', run: () => students.adminStudentRequests() },
  { method: 'POST', path: 'admin/students/:id', run: (_r, p, b) => { const x = z.object({ approve: z.boolean(), note: z.string().max(300).optional() }).parse(b); return students.decideStudent(z.string().regex(/^[a-z0-9]{10,40}$/).parse(p[0]), x.approve, x.note) } },
  { method: 'GET', path: 'admin/groups', run: () => groups.adminGroups() },
  { method: 'GET', path: 'billing/status', run: () => profile.billingStatus() },
  { method: 'POST', path: 'billing/checkout', run: (_r, _p, b) => profile.checkout(z.object({ planId: z.string().max(40) }).parse(b).planId) },
  { method: 'POST', path: 'billing/cancel', run: () => profile.cancelSubscription() },
  { method: 'POST', path: 'billing/confirm', run: async (_r, _p, b) => { await rateLimit(`pay:${(await requireUser()).id}`, 30, 60); return profile.confirmPayment(z.object({ sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]{10,200}$/) }).parse(b).sessionId) } },
  // Público
  { method: 'GET', path: 'public/stats', run: () => profile.publicStats() },
  { method: 'POST', path: 'waitlist', run: async (r, _p, b) => { const x = z.object({ email: z.string().max(200), website: z.string().max(200).optional() }).parse(b); if (x.website) return; await rateLimit(`waitlist:${clientIp(r)}`, 5, 600); return profile.joinWaitlist(x.email, r.headers.get('accept-language')?.slice(0, 2) ?? 'es') } },
  { method: 'POST', path: 'contact', run: async (r, _p, b) => { const x = z.object({ name: z.string().max(100), email: z.string().max(200), reason: z.string().max(20), message: z.string().max(5000), website: z.string().max(200).optional() }).parse(b); if (x.website) return; await rateLimit(`contact:${clientIp(r)}`, 3, 600); return profile.contact(x) } },
  // Admin
  { method: 'GET', path: 'admin/metrics', run: r => admin.metrics((r.nextUrl.searchParams.get('range') ?? '30d') as '7d' | '30d' | '90d') },
  { method: 'GET', path: 'admin/users', run: r => admin.users(r.nextUrl.searchParams.get('q')?.slice(0, 100) || undefined) },
  { method: 'GET', path: 'admin/audit', run: () => admin.audit() },
  { method: 'GET', path: 'admin/content', run: () => admin.content() },
  { method: 'GET', path: 'admin/lens', run: async r => { await admin.requireAdmin(); return lens(r.nextUrl.searchParams.get('path')?.slice(0, 200) ?? '/', lensRange(r)) } },
  { method: 'GET', path: 'admin/lessons', run: async r => { await admin.requireAdmin(); return lessonTable(lensRange(r)) } },
  { method: 'GET', path: 'admin/users/:id', run: (_r, p) => admin.userDetail(p[0]) },
  { method: 'POST', path: 'admin/users/:id/view-as', run: (_r, p) => admin.startViewAs(p[0]) },
  { method: 'GET', path: 'admin/campaigns', run: () => admin.campaigns() },
  { method: 'POST', path: 'admin/campaigns', run: (_r, _p, b) => admin.createCampaign(z.object({ name: z.string().min(1).max(60) }).parse(b).name) },
  { method: 'DELETE', path: 'admin/campaigns/:slug', run: (_r, p) => admin.deleteCampaign(p[0]) },
  // «Algo no está bien» (avisos de fallos) y mandos de la ficha de usuario (admin2)
  { method: 'POST', path: 'reports', run: (_r, _p, b) => reports.createReport(reports.ReportInput.parse(b)) },
  { method: 'GET', path: 'admin/reports', run: r => { const s = r.nextUrl.searchParams; return reports.reports(z.enum(reports.REPORT_STATUS).optional().catch(undefined).parse(s.get('status') ?? undefined), z.enum(reports.REPORT_KINDS).optional().catch(undefined).parse(s.get('kind') ?? undefined)) } },
  { method: 'GET', path: 'admin/reports/open', run: () => reports.openReports() },
  { method: 'POST', path: 'admin/reports/:id', run: (_r, p, b) => { const x = z.object({ status: z.enum(reports.REPORT_STATUS), note: z.string().max(500).optional() }).parse(b); return reports.updateReport(p[0].slice(0, 40), x.status, x.note) } },
  { method: 'GET', path: 'admin/gifts', run: () => admin.adminGifts() },
  { method: 'POST', path: 'admin/users/:id/gift', run: (_r, p, b) => { const x = z.object({ tier: z.enum(['PLUS', 'PREMIUM']), days: z.number().int().min(1).max(3650), reason: z.string().max(200).optional() }).parse(b); return admin.giveGift(p[0], x.tier, x.days, x.reason) } },
  { method: 'POST', path: 'admin/users/:id/gift/revoke', run: (_r, p) => admin.removeGift(p[0]) },
  { method: 'POST', path: 'admin/users/:id/lives', run: (_r, p) => admin.refillLives(p[0]) },
  { method: 'POST', path: 'admin/users/:id/gems', run: (_r, p, b) => admin.giveGems(p[0], z.object({ amount: z.number().int().min(1).max(10_000) }).parse(b).amount) },
  { method: 'POST', path: 'admin/users/:id/streak', run: (_r, p, b) => admin.restoreStreak(p[0], z.object({ streak: z.number().int().min(0).max(3650) }).parse(b).streak) },
  { method: 'POST', path: 'admin/users/:id/block', run: (_r, p, b) => { const x = z.object({ blocked: z.boolean(), reason: z.string().max(300).optional() }).parse(b); return admin.setBlocked(p[0], x.blocked, x.reason) } },
  { method: 'POST', path: 'admin/users/:id/welcome', run: (_r, p) => admin.resendWelcome(p[0]) },
  // Repartir (dinero virtual, XP, gemas, vidas, protectores, racha) y mensajes del equipo (a una persona o a varias)
  { method: 'GET', path: 'admin/glance', run: () => admin.glance() },
  { method: 'POST', path: 'admin/users/:id/grant', run: (_r, p, b) => { const x = z.object({ kind: z.enum(admin.GRANT_KINDS), amount: z.number().finite().min(-1e12).max(1e12).optional(), league: z.boolean().optional(), reason: z.string().max(200).optional(), notify: z.boolean().optional(), title: z.string().max(200).optional(), text: z.string().max(2000).optional() }).parse(b); return admin.grant(z.string().max(64).parse(p[0]), x) } },
  { method: 'POST', path: 'admin/users/:id/message', run: (_r, p, b) => { const x = z.object({ title: z.string().max(200).optional(), text: z.string().max(2000) }).parse(b); return teamAdmin.sendToUser(z.string().max(64).parse(p[0]), x) } },
  { method: 'GET', path: 'admin/messages', run: () => teamAdmin.messageHistory() },
  { method: 'GET', path: 'admin/messages/audience', run: r => { const s = r.nextUrl.searchParams; return teamAdmin.audiencePreview({ kind: z.enum(teamAdmin.AUDIENCES).parse(s.get('kind') ?? 'ALL'), days: s.get('days') ? z.coerce.number().int().parse(s.get('days')) : undefined, lang: z.enum(['es', 'ca', 'en']).optional().parse(s.get('lang') || undefined) }) } },
  { method: 'POST', path: 'admin/messages/broadcast', run: (_r, _p, b) => { const x = z.object({ audience: z.object({ kind: z.enum(teamAdmin.AUDIENCES), days: z.number().int().optional(), lang: z.enum(['es', 'ca', 'en']).optional() }), title: z.string().max(200).optional(), text: z.string().max(2000), expected: z.number().int().min(1) }).parse(b); return teamAdmin.broadcast(x.audience, x) } },
  // Mensajes del equipo que recibe la persona: los pendientes (ventana al abrir la app), uno concreto y «visto»
  { method: 'GET', path: 'team-messages/pending', run: () => team.pendingTeamMessages() },
  { method: 'GET', path: 'team-messages/:id', run: (_r, p) => team.teamMessage(z.string().regex(/^tm-[a-z0-9-]{4,60}$/).parse(p[0])) },
  { method: 'POST', path: 'team-messages/:id/seen', run: async (_r, p) => { await rateLimit(`tmseen:${(await requireUser()).id}`, 60, 60); return team.seenTeamMessage(z.string().regex(/^tm-[a-z0-9-]{4,60}$/).parse(p[0])) } },
  // Regalar Lumi: comprar (pago único con Stripe), confirmar el pago, mis regalos y, con el código, ver y canjear
  { method: 'GET', path: 'gifts', run: () => gifts.myGifts() },
  // Tienda de gemas en euros (auditoría PRO-3): apagada salvo GEM_STORE=on, solo adultos
  { method: 'GET', path: 'shop/gem-store', run: () => gemStore.gemStore() },
  { method: 'POST', path: 'shop/gem-store/checkout', run: async (r, _p, b) => { await rateLimit(`gempay:${(await requireUser()).id}`, 10, 3600); const x = z.object({ packId: z.enum(['gems-500', 'gems-1200', 'gems-3000']), locale: z.enum(['es', 'ca', 'en']) }).parse(b); return gemStore.gemCheckout(x.packId, { origin: r.headers.get('origin') ?? `https://${r.headers.get('host')}`, locale: x.locale }) } },
  { method: 'POST', path: 'shop/gem-store/confirm', run: async (_r, _p, b) => { await rateLimit(`gempay:${(await requireUser()).id}`, 40, 60); return gemStore.confirmGems(z.object({ sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]{10,200}$/) }).parse(b).sessionId) } },
  { method: 'POST', path: 'gifts', run: async (_r, _p, b) => { const x = z.object({ tier: z.enum(['PLUS', 'PREMIUM']), months: z.union([z.literal(1), z.literal(12)]), fromName: z.string().max(80), toName: z.string().max(80).optional(), message: z.string().max(600).optional() }).parse(b); await rateLimit(`gift:${(await requireUser()).id}`, 12, 3600); return gifts.createGift(x) } },
  { method: 'POST', path: 'gifts/confirm', run: async (_r, _p, b) => { await rateLimit(`giftpay:${(await requireUser()).id}`, 40, 60); return gifts.confirmGift(z.object({ sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]{10,200}$/) }).parse(b).sessionId) } },
  { method: 'GET', path: 'gifts/code/:code', run: async (r, p) => { await rateLimit(`giftcode:${clientIp(r)}`, 60, 60); return gifts.publicGift(p[0].slice(0, 30)) } },
  { method: 'POST', path: 'gifts/code/:code/redeem', run: async (r, p) => { await rateLimit(`giftcode:${clientIp(r)}`, 60, 60); await rateLimit(`redeem:${(await requireUser()).id}`, 10, 600); return gifts.redeemGift(p[0].slice(0, 30)) } },
  // Analítica propia: pantallas vistas y dónde se deja una clase
  { method: 'POST', path: 'events', run: async (r, _p, b) => { await rateLimit(`ev:${clientIp(r)}`, 600, 60); await recordClientEvent(b); await reviewGoalOnView(b) } },
  // Regalo diario (30 días) y cofre semanal: el servidor decide el día y el premio (sin cuerpo)
  { method: 'GET', path: 'daily', run: () => daily.daily() },
  { method: 'POST', path: 'daily/open', run: async () => { await rateLimit(`daily:${(await requireUser()).id}`, 20, 60); return daily.openDaily() } },
]

function match(method: string, parts: string[]) {
  for (const r of routes) {
    if (r.method !== method) continue
    const segs = r.path.split('/')
    if (segs.length !== parts.length) continue
    const params: string[] = []
    if (segs.every((s, i) => (s.startsWith(':') ? (params.push(safeDecode(parts[i])), true) : s === parts[i]))) return { r, params }
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
    // Límite general por IP (lecturas y escrituras); las escrituras, más estricto.
    // Holgado a propósito: en una clase o un evento decenas de personas comparten la misma wifi (misma IP)
    await rateLimit(`${mutating ? 'w' : 'r'}:${clientIp(req)}`, mutating ? 900 : 4000, 60)
    let body: unknown = undefined
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const text = await req.text()
      if (text.length > MAX_BODY) return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Petición demasiado grande' } }, { status: 413 })
      body = text ? JSON.parse(text) : {}
    }
    // «Ver como» (solo ADMIN): la app responde con los datos del usuario elegido y no deja cambiar nada
    const asId = req.headers.get('x-view-as')
    let view: { targetId: string; adminId: string } | null = null
    if (asId) {
      const admin = await realUser()
      if (admin?.role !== 'ADMIN') return Response.json({ error: { code: 'FORBIDDEN', message: 'Solo para administración' } }, { status: 403 })
      // «Ver como» es solo lectura: la única escritura permitida es empezar a ver como (todo lo demás, también del admin, se bloquea)
      if (mutating && !/^admin\/users\/[^/]+\/view-as$/.test(path.join('/'))) return Response.json({ error: { code: 'VIEW_ONLY', message: 'Estás viendo la app como otro usuario: solo lectura.' } }, { status: 403 })
      view = { targetId: asId.slice(0, 64), adminId: admin.id }
    }
    // Los textos del curso y del motor salen en el idioma de la pantalla del móvil
    const out = await withRequest(req.method, () => withLocale(req.headers.get('x-locale'), () => withViewAs(view, () => m.r.run(req, m.params, body))))
    return out === undefined ? new Response(null, { status: 204 }) : Response.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: { code: e.code, message: e.message } }, { status: e.status })
    if (e instanceof z.ZodError || e instanceof SyntaxError) return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos no válidos' } }, { status: 422 })
    console.error(`API ${req.method} /${path.join('/')}`, e)
    await recordServerError(`${req.method} /${path.join('/')}`, e)
    return Response.json({ error: { code: 'INTERNAL', message: 'Algo no ha ido bien. Prueba otra vez.' } }, { status: 500 })
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
