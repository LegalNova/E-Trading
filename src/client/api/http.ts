// Implementación real de la API (etapa 3): llama a /api/** con el contrato de docs/07.
import { readSource } from '../attribution'
import { ApiFailure, type Api, type OrderInput } from './types'

export const VIEW_AS_KEY = 'lumi:viewAs'

/** Usuario que el admin está viendo en esta pestaña (solo lectura) */
export function viewingAs(): string | null {
  try {
    return sessionStorage.getItem(VIEW_AS_KEY)
  } catch {
    return null
  }
}

async function call<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const as = typeof window !== 'undefined' ? viewingAs() : null
  const r = await fetch(`/api${path}`, {
    method,
    // Idioma de la pantalla: el servidor devuelve las clases y sus textos en él
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), 'x-locale': typeof document !== 'undefined' ? document.documentElement.lang : 'es', ...(as ? { 'x-view-as': as } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (r.status === 204) return undefined as T
  const data = await r.json().catch(() => null)
  if (!r.ok) {
    const e = data?.error ?? data
    throw new ApiFailure(e?.code ?? 'INTERNAL', e?.message ?? 'Algo no ha ido bien', r.status)
  }
  return data as T
}

const get = <T>(p: string) => call<T>('GET', p)
const post = <T>(p: string, b: unknown = {}, h?: Record<string, string>) => call<T>('POST', p, b, h)

/** Traduce los errores de Better Auth a los códigos del contrato */
async function auth<T>(path: string, body: unknown): Promise<T> {
  try {
    return await post<T>(`/auth${path}`, body)
  } catch (e) {
    if (!(e instanceof ApiFailure)) throw e
    const map: Record<string, string> = { INVALID_EMAIL_OR_PASSWORD: 'INVALID_CREDENTIALS', USER_ALREADY_EXISTS: 'EMAIL_IN_USE', USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'EMAIL_IN_USE', PASSWORD_TOO_SHORT: 'WEAK_PASSWORD', INVALID_EMAIL: 'VALIDATION_ERROR' }
    throw new ApiFailure(e.status === 429 ? 'RATE_LIMITED' : (map[e.code] ?? e.code), e.message, e.status)
  }
}

export const httpApi: Api = {
  publicTicker: () => get('/public/ticker'),
  publicStats: () => get('/public/stats'),
  joinWaitlist: email => post('/waitlist', { email }),
  contact: c => post('/contact', c),

  session: () => get('/session'),
  signIn: async (email, password) => {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiFailure('VALIDATION_ERROR', 'Escribe un email válido', 422)
    await auth('/sign-in/email', { email, password })
    return get('/session')
  },
  signUp: async (email, password) => {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiFailure('VALIDATION_ERROR', 'Escribe un email válido', 422)
    if (password.length < 8 || !/\d/.test(password)) throw new ApiFailure('WEAK_PASSWORD', 'Mínimo 8 caracteres y un número', 422)
    await auth('/sign-up/email', { email, password, name: '', callbackURL: `${location.pathname.split('/').slice(0, 2).join('/')}/inicio` })
    return get('/session')
  },
  signInWithGoogle: async () => {
    const r = await auth<{ url?: string }>('/sign-in/social', { provider: 'google', callbackURL: `${location.origin}${location.pathname.split('/').slice(0, 2).join('/')}/inicio${readSource() ? `?src=${encodeURIComponent(readSource()!)}` : ''}` })
    if (r.url) location.href = r.url
    return new Promise(() => {}) // la página se va a Google
  },
  signOut: async () => void (await post('/auth/sign-out')),
  pushKey: () => get('/push/key'),
  pushSubscribe: sub => post('/push/subscribe', sub),
  pushUnsubscribe: endpoint => post('/push/unsubscribe', { endpoint }),
  feedbackStatus: () => get('/feedback'),
  feedbackLater: () => post('/feedback/later'),
  submitFeedback: a => post('/feedback', a),
  adminFeedback: () => get('/admin/feedback'),
  planBadge: () => get('/billing/badge'),
  myInvites: () => get('/invite'),
  inviterName: code => get(`/invite/${encodeURIComponent(code)}`),
  signInGuest: async () => {
    await auth('/sign-in/anonymous', {})
    return get('/session')
  },
  saveGuest: (email, password) => post('/account/save', { email: email.trim(), password }),
  loginMethods: () => get('/account/login'),
  setPassword: (current, next) => post('/account/password', { current, next }),
  // El servidor responde igual exista o no la cuenta (no revela quién está registrado)
  forgotPassword: async email => {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiFailure('VALIDATION_ERROR', 'Escribe un email válido', 422)
    await auth('/request-password-reset', { email, redirectTo: `${location.pathname.split('/').slice(0, 2).join('/')}/recuperar` })
  },
  resetPassword: async (token, password) => {
    if (password.length < 8 || !/\d/.test(password)) throw new ApiFailure('WEAK_PASSWORD', 'Mínimo 8 caracteres y un número', 422)
    await auth('/reset-password', { token, newPassword: password })
  },
  onboarding: () => get('/onboarding'),
  saveOnboarding: (step, patch) => call('PUT', '/onboarding', { step, patch }),
  completeOnboarding: source => post('/onboarding/complete', source ? { source } : {}),

  home: () => get('/home'),
  me: () => get('/me'),
  lives: () => get('/me/lives'),
  refillLives: () => post('/me/lives/refill'),

  path: () => get('/courses/path'),
  lesson: (id, peek) => get(`/lessons/${id}${peek ? '?peek=1' : ''}`),
  checkStep: (lessonId, stepId, candleIndex) => post(`/lessons/${lessonId}/steps/${stepId}/check`, { candleIndex }),
  quizStart: id => post(`/quiz/${id}/start`),
  answer: (attemptId, questionId, answer, elapsedMs) => post(`/quiz/attempts/${attemptId}/answer`, { questionId, answer, elapsedMs }),
  quizFinish: attemptId => post(`/quiz/attempts/${attemptId}/finish`),
  placementFinish: attemptId => post(`/quiz/attempts/${attemptId}/placement-finish`),
  mistakesCount: () => get('/quiz/mistakes/count'),
  tutorHistory: () => get('/tutor'),
  tutorAsk: (question, mode) => post('/tutor/ask', { question, mode }),
  tutorClear: () => call('DELETE', '/tutor'),
  thesisList: () => get('/thesis'),
  thesisCreate: symbol => post('/thesis', { symbol }),
  thesis: id => get(`/thesis/${encodeURIComponent(id)}`),
  thesisStep: (id, step, answer) => call('PUT', `/thesis/${encodeURIComponent(id)}/steps/${step}`, answer),
  thesisFinish: id => post(`/thesis/${encodeURIComponent(id)}/finish`),
  thesisDelete: id => call('DELETE', `/thesis/${encodeURIComponent(id)}`),

  assets: async (filter = {}) => {
    if (filter.type === 'WATCH' && !filter.q) {
      const w = await get<string[]>('/watchlist')
      return w.length ? get(`/market/assets?symbols=${w.map(encodeURIComponent).join(',')}`) : []
    }
    const page = await httpApi.searchAssets({ q: filter.q, type: filter.type === 'WATCH' ? undefined : filter.type, limit: 50 })
    return page.items
  },
  asset: async symbol => {
    const s = await httpApi.settings().catch(() => null)
    return get(`/market/assets/${encodeURIComponent(symbol)}?currency=${s?.currency ?? 'EUR'}`)
  },
  candles: (symbol, interval) => get(`/market/assets/${encodeURIComponent(symbol)}/candles?interval=${interval}`),
  searchAssets: f => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) if (v !== undefined && v !== '') p.set(k, String(v))
    return get(`/market/assets?${p}`)
  },
  marketOverview: region => get(`/market/overview?region=${region}`),
  fundamentals: symbol => get(`/market/assets/${encodeURIComponent(symbol)}/fundamentals`),
  ideas: () => get('/market/ideas'),
  facets: (region, type) => get(`/market/facets?${new URLSearchParams({ ...(region ? { region } : {}), ...(type ? { type } : {}) })}`),
  watchlist: () => get('/watchlist'),
  toggleWatch: symbol => post(`/watchlist/${encodeURIComponent(symbol)}`),
  previewOrder: (i: OrderInput) => post('/orders/preview', i),
  placeOrder: (i: OrderInput) => post('/orders', i, { 'idempotency-key': crypto.randomUUID() }),
  orders: () => get('/orders'),
  cancelOrder: id => call('DELETE', `/orders/${id}`),
  trades: () => get('/trades'),
  portfolio: () => get('/portfolio'),
  portfolioHistory: range => get(`/portfolio/history?range=${range}`),
  resetPortfolio: () => post('/portfolio/reset'),
  alerts: () => get('/alerts'),
  createAlert: a => post('/alerts', a),
  deleteAlert: id => call('DELETE', `/alerts/${id}`),
  tradingStats: () => get('/me/trading-stats'),
  missions: () => get('/missions'),
  lessonMission: id => get(`/missions/lesson/${encodeURIComponent(id)}`),
  missionSeen: w => post('/missions/seen', w),
  journal: () => get('/journal'),
  createJournal: e => post('/journal', e),
  reviewJournal: (id, verdict, note) => post(`/journal/${encodeURIComponent(id)}/review`, { verdict, note }),

  streak: () => get('/streak'),
  buyStreakFreeze: () => post('/shop/streak-freeze'),
  achievements: () => get('/achievements'),
  league: () => get('/league/current'),
  friendLeagues: () => get('/friends'),
  friendLeague: id => get(`/friends/${encodeURIComponent(id)}`),
  friendLeaguePeek: code => get(`/friends/code/${encodeURIComponent(code)}`),
  createFriendLeague: name => post('/friends', { name }),
  joinFriendLeague: code => post('/friends/join', { code }),
  renameFriendLeague: (id, name) => call('PATCH', `/friends/${encodeURIComponent(id)}`, { name }),
  deleteFriendLeague: id => call('DELETE', `/friends/${encodeURIComponent(id)}`),
  leaveFriendLeague: id => post(`/friends/${encodeURIComponent(id)}/leave`),
  removeFriendLeagueMember: (id, key) => call('DELETE', `/friends/${encodeURIComponent(id)}/members/${encodeURIComponent(key)}`),
  notifications: () => get('/notifications'),
  markNotificationsRead: ids => post('/notifications/read', { ids }),

  settings: () => get('/me/settings'),
  updateSettings: patch => call('PATCH', '/me/settings', patch),
  billingPlans: () => get('/billing/plans'),
  billingStatus: () => get('/billing/status'),
  checkout: planId => post('/billing/checkout', { planId }),
  cancelSubscription: () => post('/billing/cancel'),
  confirmPayment: sessionId => post('/billing/confirm', { sessionId }),
  billingPortal: () => post('/billing/portal'),
  studentStatus: () => get('/billing/student'),
  requestStudent: async form => {
    // Multipart (con el justificante): va a su propia ruta, fuera del límite de 32 KB de la API
    const r = await fetch('/api/uploads/student', { method: 'POST', body: form, credentials: 'same-origin', headers: { 'x-locale': document.documentElement.lang || 'es' } })
    const data = await r.json().catch(() => null)
    if (!r.ok) throw new ApiFailure(data?.error?.code ?? (r.status === 413 ? 'FILE_TOO_BIG' : 'INTERNAL'), data?.error?.message ?? 'Algo no ha ido bien. Prueba otra vez.', r.status)
    return data
  },
  myGroup: () => get('/groups/mine'),
  createGroup: g => post('/groups', g),
  confirmGroup: sessionId => post('/groups/confirm', { sessionId }),
  groupPeek: code => get(`/groups/code/${encodeURIComponent(code)}`),
  joinGroup: code => post('/groups/join', { code }),
  leaveGroup: () => post('/groups/leave'),
  renameGroup: name => call('PATCH', '/groups/mine', { name }),
  removeGroupMember: key => call('DELETE', `/groups/members/${encodeURIComponent(key)}`),
  groupPayment: () => post('/groups/payment'),
  adminStudents: () => get('/admin/students'),
  adminDecideStudent: (id, approve, note) => post(`/admin/students/${encodeURIComponent(id)}`, { approve, note }),
  adminGroups: () => get('/admin/groups'),
  exportData: async () => JSON.stringify(await get('/me/export'), null, 2),
  deleteAccount: () => call('DELETE', '/me'),

  adminMetrics: range => get(`/admin/metrics?range=${range}`),
  adminUsers: q => get(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  adminAudit: () => get('/admin/audit'),
  adminContent: () => get('/admin/content'),
  adminLens: (path, range) => get(`/admin/lens?path=${encodeURIComponent(path)}&range=${range}`),
  adminLessons: range => get(`/admin/lessons?range=${range}`),
  adminUser: id => get(`/admin/users/${encodeURIComponent(id)}`),
  adminViewAs: id => post(`/admin/users/${encodeURIComponent(id)}/view-as`),
  adminCampaigns: () => get('/admin/campaigns'),
  adminCreateCampaign: name => post('/admin/campaigns', { name }),
  adminDeleteCampaign: slug => call('DELETE', `/admin/campaigns/${encodeURIComponent(slug)}`),
  sendReport: r => post('/reports', r),
  adminReports: (status, kind) => get(`/admin/reports?${new URLSearchParams({ ...(status ? { status } : {}), ...(kind ? { kind } : {}) })}`),
  adminOpenReports: () => get('/admin/reports/open'),
  adminUpdateReport: (id, status, note) => post(`/admin/reports/${encodeURIComponent(id)}`, { status, note }),
  adminGifts: () => get('/admin/gifts'),
  adminGiveGift: (id, g) => post(`/admin/users/${encodeURIComponent(id)}/gift`, g),
  adminRevokeGift: id => post(`/admin/users/${encodeURIComponent(id)}/gift/revoke`),
  adminRefillLives: id => post(`/admin/users/${encodeURIComponent(id)}/lives`),
  adminGiveGems: (id, amount) => post(`/admin/users/${encodeURIComponent(id)}/gems`, { amount }),
  adminRestoreStreak: (id, streak) => post(`/admin/users/${encodeURIComponent(id)}/streak`, { streak }),
  adminSetBlocked: (id, blocked, reason) => post(`/admin/users/${encodeURIComponent(id)}/block`, { blocked, reason }),
  adminResendWelcome: id => post(`/admin/users/${encodeURIComponent(id)}/welcome`),
  myGifts: () => get('/gifts'),
  buyGift: g => post('/gifts', g),
  confirmGift: sessionId => post('/gifts/confirm', { sessionId }),
  giftByCode: code => get(`/gifts/code/${encodeURIComponent(code)}`),
  redeemGift: code => post(`/gifts/code/${encodeURIComponent(code)}/redeem`),
  trackEvent: e => {
    // Mientras un admin «ve como» otro usuario no se registra nada
    if (viewingAs()) return
    fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(e), keepalive: true, credentials: 'same-origin' }).catch(() => {})
  },
}
