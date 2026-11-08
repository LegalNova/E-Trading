// Interfaz única de acceso a datos. La implementa `http.ts` contra /api/** con el contrato de docs/07.
import type {
  AchievementT, AnswerResultT, AssetDetailT, AssetItemT, AssetPageT, AssetTypeT, MarketOverviewT, RegionT, BillingPlanT, BillingStatusT, CandleT, CoursePathT,
  GenderT, HomeT, LeagueT, LessonT, LivesT, MeT, NotificationT, OrderPreviewT, OrderResultT, OrderSideT, OrderT, OrderTypeT,
  PlacementFinishT, PortfolioT, PriceAlertT, QuizFinishT, QuizStartT, SettingsT, StepCheckT, StreakT, TradeT, TradingStatsT,
  TutorAnswerT,
  TutorHistoryT,
  TutorModeT,
} from '@/shared/contract'
import type { GiftMineT, GiftPublicT, GiftRedeemT } from '@/shared/contract'
import type { FriendLeaguePeekT, FriendLeaguesT, FriendLeagueT } from '@/shared/contract'
import type { EffectsT } from '@/shared/contract'
import type { JournalT, JournalVerdictT, LessonMissionT, MissionsT } from '@/shared/contract'
import type { FundamentalsT, IdeasT } from '@/shared/contract'
import type { GroupPeekT, GroupViewT, StudentStatusT } from '@/shared/contract'
import type { ThesisDetailT, ThesisListT, ThesisT } from '@/shared/thesis'

export interface GiftInput { tier: 'PLUS' | 'PREMIUM'; months: 1 | 12; fromName: string; toName?: string; message?: string }

export class ApiFailure extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message)
  }
}

export interface Session { signedIn: boolean; email: string | null; onboardingStep: number | null; isAdmin: boolean; googleEnabled?: boolean; mailEnabled?: boolean; isGuest?: boolean; viewAs?: { id: string; email: string; name: string } | null }

export interface OnboardingDraft {
  name: string
  gender: GenderT
  birthDate: string // YYYY-MM-DD
  experience: 'NONE' | 'SOME' | 'EXPERIENCED'
  goals: string[]
  dailyGoalMinutes: 5 | 10 | 15 | 20 | 30
  skinId: string
  companionName: string
  disclaimerAccepted: boolean
}

export interface OrderInput {
  symbol: string
  side: OrderSideT
  type: OrderTypeT
  amount?: string
  qty?: string
  triggerPrice?: string
  /** Salidas de una compra: se crean al ejecutarse */
  stopLoss?: string
  takeProfit?: string
  riskAcknowledged?: boolean
  /** Bajó el importe al sugerido por Lumi (logro «Sangre fría») */
  followedRiskAdvice?: boolean
}

export type CandleInterval = '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M'
export interface AssetFilter { q?: string; type?: AssetTypeT; region?: RegionT; country?: string; sector?: string; index?: string; sort?: 'name' | 'gainers' | 'losers'; offset?: number; limit?: number }
export interface Facets { countries: { value: string; count: number }[]; sectors: { value: string; count: number }[]; indices: { value: string; count: number }[] }

export interface PortfolioPoint { t: string; v: number }

export interface AdminMetrics {
  dau: number | null
  mau: number | null
  retentionD7: number | null
  premiumConversion: number | null
  simulatedTrades: number | null
  funnel: { label: string; value: number | null }[]
  series: number[]
  providers: { name: string; status: 'OK' | 'DEGRADED' | 'DOWN'; latencyMs: number | null; note: string }[]
  cohorts: { week: string; size: number; d1: number | null; d7: number | null; d30: number | null }[]
  money: { key: 'premium_view' | 'paywall' | 'trial_start' | 'paid' | 'cancel'; value: number }[]
  sources: { source: string; users: number; trials: number; paid: number }[]
  errors: { kind: 'APP' | 'SERVER'; message: string; where: string; count: number; users: number; last: string }[]
}
export interface AdminUser { id: string; name: string; email: string; plan: 'FREE' | 'PLUS' | 'PREMIUM'; createdAt: string; lastActive: string; blocked: boolean; xp: number; source: string | null }
export type LensRange = '7d' | '30d' | 'all'
type Cell = string | number | null
export interface Lens {
  title: string
  kpis: { label: string; value: Cell; hint?: string }[]
  bars?: { title: string; items: { label: string; value: number }[]; unit?: string }[]
  tables?: { title: string; head: string[]; rows: Cell[][]; note?: string }[]
  note?: string
}
export interface AdminFeedback {
  total: number
  nps: number | null
  npsHist: number[]
  likes: Record<string, number>
  blockers: Record<string, number>
  pay: Record<string, number>
  price: Record<string, number>
  wants: Record<string, number>
  comments: { id: string; userId: string; who: string; nps: number; plan: string; daysIn: number; comment: string; wantsOther: string; at: string }[]
}
export interface AdminCampaign { slug: string; name: string; createdAt: string; visits: number; signups: number; trials: number; paid: number }
export interface AdminLessonRow { id: string; unit: number; unitTitle: string; title: string; starts: number; quiz: number; done: number; skipped: number; completion: number | null }
export interface AdminUserDetail {
  id: string
  name: string
  email: string
  emailVerified: boolean
  login: string[]
  plan: 'FREE' | 'PLUS' | 'PREMIUM'
  subscription: { status: string; trialEndsAt: string | null } | null
  source: string | null
  locale: string
  createdAt: string
  lastSeen: string | null
  lastActive: string | null
  blocked: boolean
  onboarding: { done: boolean; step: number | null; experience: string | null; goals: string[]; minutes: number | null }
  game: { xp: number; level: number; streak: number; bestStreak: number; gems: number; lives: number; division: number; weekXp: number } | null
  learning: { lessonsDone: number; accuracy: number | null; answers: number; last: { id: string; title: string; skipped: boolean; stars: number; at: string }[] }
  market: { cash: number | null; positions: number; trades: number; last: { symbol: string; side: string; total: number; status: string; at: string }[] }
  tutorQuestions: number
  badges: number
  events: { name: string; props: unknown; at: string }[]
  admin2: AdminUserControls
}
export interface AdminQuestion { id: string; type: string; prompt: string; options: string[]; solution: number | number[] | string; explanation: string }
export interface AdminContent { units: { id: string; order: number; title: string; lessons: { id: string; title: string; quizId: string }[] }[]; quizzes: Record<string, AdminQuestion[]>; achievements: number }
// «Algo no está bien» y mandos del admin (admin2)
export type ReportKind = 'CONTENT' | 'BUG' | 'MARKET' | 'OTHER'
export type ReportStatus = 'OPEN' | 'DONE' | 'DISCARDED'
export interface ReportContext { lessonId?: string; quizId?: string; questionId?: string; step?: string; symbol?: string }
export interface AdminReport {
  id: string
  kind: ReportKind
  status: ReportStatus
  message: string
  path: string
  context: { lessonId: string | null; lessonTitle: string | null; quizId: string | null; questionId: string | null; step: string | null; symbol: string | null }
  note: string | null
  user: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}
export interface AdminUserControls {
  plan: 'FREE' | 'PLUS' | 'PREMIUM'
  isTeam: boolean
  blockedAt: string | null
  blockReason: string | null
  subscription: { status: string; interval: string | null; stripe: boolean; until: string | null } | null
  giftRunning: boolean
  gifts: { id: string; tier: 'PLUS' | 'PREMIUM'; days: number; by: string | null; reason: string | null; status: string; at: string }[]
}
export interface AdminStudentUser { id: string; name: string; email: string; studentUntil: string | null }
export interface AdminStudents {
  pending: { id: string; institution: string; studentEmail: string | null; photoType: string | null; createdAt: string; user: AdminStudentUser }[]
  decided: { id: string; institution: string; status: 'APPROVED' | 'REJECTED'; note: string | null; decidedBy: string | null; decidedAt: string | null; user: AdminStudentUser }[]
}
export interface AdminGroup { id: string; name: string; ownerId: string; ownerName: string; ownerEmail: string; tier: 'PLUS' | 'PREMIUM'; size: number; seats: number; members: number; interval: 'MONTH' | 'YEAR'; student: boolean; status: string; price: number; renewsAt: string | null; createdAt: string; stripe: boolean }
export interface AdminGift { id: string; userId: string; name: string; email: string; tier: 'PLUS' | 'PREMIUM'; days: number; by: string | null; reason: string | null; at: string; stripe: boolean; until: string | null }
export interface AuditEntry { id: string; actor: string; action: string; entity: string; createdAt: string }

export interface ContactInput { name: string; email: string; reason: 'SCHOOL' | 'PRESS' | 'SUPPORT' | 'OTHER'; message: string }

export interface Api {
  // Público (landing)
  publicTicker(): Promise<{ symbol: string; name: string; changePct: number; stale: boolean }[]>
  publicStats(): Promise<{ activeUsers: number; lessonsCompleted: number; simulatedTrades: number }>
  joinWaitlist(email: string): Promise<void>
  contact(input: ContactInput): Promise<void>

  // Acceso y onboarding
  session(): Promise<Session>
  signIn(email: string, password: string): Promise<Session>
  signUp(email: string, password: string): Promise<Session>
  signInWithGoogle(): Promise<Session>
  signOut(): Promise<void>
  pushKey(): Promise<{ key: string | null }>
  pushSubscribe(sub: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void>
  pushUnsubscribe(endpoint: string): Promise<void>
  feedbackStatus(): Promise<{ due: boolean; answered: boolean; gems: number }>
  feedbackLater(): Promise<void>
  submitFeedback(a: { nps: number; likes: string[]; blockers: string[]; pay: string; price?: string; wants: string[]; wantsOther?: string; comment?: string }): Promise<{ ok: boolean; gems: number }>
  adminFeedback(): Promise<AdminFeedback>
  planBadge(): Promise<{ plan: 'FREE' | 'PLUS' | 'PREMIUM'; status: string; stripe: boolean; endsAt: string | null; daysLeft: number | null; trialUsed: boolean; isGuest: boolean; streak: number; trialUnlocked: boolean; trialStreak: number; payments: boolean; isAdmin: boolean; group?: { name: string; owner: boolean; tier: 'PLUS' | 'PREMIUM'; pastDue: boolean } | null; inAnyGroup?: boolean; student?: boolean; studentUntil?: string | null }>
  myInvites(): Promise<{ code: string; joined: number; rewarded: number; daysEarned: number; maxDays: number; days: number }>
  inviterName(code: string): Promise<{ valid: boolean; name: string | null }>
  signInGuest(): Promise<Session>
  saveGuest(email: string, password: string): Promise<Session>
  loginMethods(): Promise<{ hasPassword: boolean; google: boolean; isGuest: boolean }>
  setPassword(current: string | undefined, next: string): Promise<{ ok: boolean }>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, password: string): Promise<void>
  onboarding(): Promise<{ step: number; draft: OnboardingDraft }>
  saveOnboarding(step: number, patch: Partial<OnboardingDraft>): Promise<void>
  completeOnboarding(source?: string): Promise<void>

  // Inicio y perfil
  home(): Promise<HomeT>
  me(): Promise<MeT>
  lives(): Promise<LivesT>
  refillLives(): Promise<LivesT>

  // Clases y quiz
  path(): Promise<CoursePathT>
  /** peek: precarga (no cuenta como «la ha empezado») */
  lesson(id: string, peek?: boolean): Promise<LessonT>
  checkStep(lessonId: string, stepId: string, candleIndex: number): Promise<StepCheckT>
  quizStart(lessonId: string | 'placement' | 'review'): Promise<QuizStartT>
  answer(attemptId: string, questionId: string, answer: number | number[] | string, elapsedMs: number): Promise<AnswerResultT>
  quizFinish(attemptId: string): Promise<QuizFinishT>
  placementFinish(attemptId: string): Promise<PlacementFinishT>
  mistakesCount(): Promise<number>
  tutorHistory(): Promise<TutorHistoryT>
  tutorAsk(question: string, mode: TutorModeT): Promise<TutorAnswerT>
  tutorClear(): Promise<void>
  // Proyecto final: tesis de inversión
  thesisList(): Promise<ThesisListT>
  thesisCreate(symbol: string): Promise<ThesisT>
  thesis(id: string): Promise<ThesisDetailT>
  thesisStep(id: string, step: number, answer: Record<string, unknown>): Promise<ThesisT>
  thesisFinish(id: string): Promise<{ thesis: ThesisT; first: boolean; xp: number; effects: EffectsT }>
  thesisDelete(id: string): Promise<void>

  // Mercado
  assets(filter?: { type?: AssetTypeT | 'WATCH'; q?: string }): Promise<AssetItemT[]>
  asset(symbol: string): Promise<AssetDetailT>
  candles(symbol: string, interval: CandleInterval): Promise<CandleT[]>
  searchAssets(f: AssetFilter): Promise<AssetPageT>
  marketOverview(region: RegionT | 'ALL'): Promise<MarketOverviewT>
  /** Datos de empresa de la ficha (capitalización, PER, dividendo, BPA, beta) */
  fundamentals(symbol: string): Promise<FundamentalsT>
  /** «Ideas para estudiar»: listas con criterio transparente */
  ideas(): Promise<IdeasT>
  facets(region?: RegionT, type?: AssetTypeT): Promise<Facets>
  watchlist(): Promise<string[]>
  toggleWatch(symbol: string): Promise<string[]>
  previewOrder(input: OrderInput): Promise<OrderPreviewT>
  placeOrder(input: OrderInput): Promise<OrderResultT>
  orders(): Promise<OrderT[]>
  cancelOrder(id: string): Promise<void>
  trades(): Promise<TradeT[]>
  portfolio(): Promise<PortfolioT>
  portfolioHistory(range: '1W' | '1M' | '3M' | 'ALL'): Promise<PortfolioPoint[]>
  resetPortfolio(): Promise<PortfolioT>
  alerts(): Promise<PriceAlertT[]>
  createAlert(a: Omit<PriceAlertT, 'id' | 'active'>): Promise<PriceAlertT>
  deleteAlert(id: string): Promise<void>
  tradingStats(): Promise<TradingStatsT>
  // Misiones «Pruébalo» y diario de operaciones
  missions(): Promise<MissionsT>
  lessonMission(lessonId: string): Promise<LessonMissionT>
  missionSeen(what: { symbol?: string; portfolio?: boolean }): Promise<MissionsT>
  journal(): Promise<JournalT>
  createJournal(e: { orderId: string; tag: string; reason?: string }): Promise<{ id: string }>
  reviewJournal(id: string, verdict: JournalVerdictT, note?: string): Promise<{ id: string; verdict: JournalVerdictT }>

  // Progreso
  streak(): Promise<StreakT>
  buyStreakFreeze(): Promise<StreakT>
  achievements(): Promise<AchievementT[]>
  league(): Promise<LeagueT>
  // Ligas de amigos
  friendLeagues(): Promise<FriendLeaguesT>
  friendLeague(id: string): Promise<FriendLeagueT>
  friendLeaguePeek(code: string): Promise<FriendLeaguePeekT>
  createFriendLeague(name: string): Promise<{ id: string; name: string; code: string }>
  joinFriendLeague(code: string): Promise<{ id: string; name: string; already: boolean }>
  renameFriendLeague(id: string, name: string): Promise<{ id: string; name: string }>
  deleteFriendLeague(id: string): Promise<void>
  leaveFriendLeague(id: string): Promise<void>
  removeFriendLeagueMember(id: string, key: string): Promise<void>
  notifications(): Promise<NotificationT[]>
  markNotificationsRead(ids: string[] | 'all'): Promise<void>

  // Ajustes y pagos
  settings(): Promise<SettingsT>
  updateSettings(patch: Partial<SettingsT> & { name?: string; companionName?: string; skinId?: string }): Promise<SettingsT>
  billingPlans(): Promise<BillingPlanT[]>
  billingStatus(): Promise<BillingStatusT>
  checkout(planId: string): Promise<BillingStatusT & { url?: string }>
  cancelSubscription(): Promise<BillingStatusT & { url?: string }>
  confirmPayment(sessionId: string): Promise<BillingStatusT & ({ done: true; amount: number; currency: string; trial: boolean } | { done: false; expired: boolean })>
  billingPortal(): Promise<{ url: string }>
  // Precio de estudiante y planes de grupo
  studentStatus(): Promise<StudentStatusT>
  requestStudent(form: FormData): Promise<{ id: string; status: 'PENDING' }>
  myGroup(): Promise<GroupViewT>
  createGroup(g: { name: string; tier: 'PLUS' | 'PREMIUM'; size: 4 | 8 | 0; interval: 'MONTH' | 'YEAR' }): Promise<{ id: string; url: string | null }>
  confirmGroup(sessionId: string): Promise<{ done: boolean; expired: boolean }>
  groupPeek(code: string): Promise<GroupPeekT>
  joinGroup(code: string): Promise<{ id: string; name: string; tier: 'PLUS' | 'PREMIUM'; mode: 'GROUP' | 'OWN'; already: boolean }>
  leaveGroup(): Promise<{ left: true; back: 'free' | 'gift' | 'own' }>
  renameGroup(name: string): Promise<{ id: string; name: string }>
  removeGroupMember(key: string): Promise<void>
  groupPayment(): Promise<{ url: string | null }>
  adminStudents(): Promise<AdminStudents>
  adminDecideStudent(id: string, approve: boolean, note?: string): Promise<{ id: string; status: string; until: string | null; switched: boolean }>
  adminGroups(): Promise<AdminGroup[]>
  exportData(): Promise<string>
  deleteAccount(): Promise<void>

  // Admin
  adminMetrics(range: '7d' | '30d' | '90d'): Promise<AdminMetrics>
  adminUsers(q?: string): Promise<AdminUser[]>
  adminAudit(): Promise<AuditEntry[]>
  adminContent(): Promise<AdminContent>
  adminLens(path: string, range: LensRange): Promise<Lens>
  adminLessons(range: LensRange): Promise<AdminLessonRow[]>
  adminUser(id: string): Promise<AdminUserDetail>
  adminViewAs(id: string): Promise<{ id: string; email: string }>
  adminCampaigns(): Promise<AdminCampaign[]>
  adminCreateCampaign(name: string): Promise<{ slug: string }>
  adminDeleteCampaign(slug: string): Promise<void>
  sendReport(r: { kind: ReportKind; message: string; path: string; context?: ReportContext }): Promise<{ id: string }>
  adminReports(status?: ReportStatus, kind?: ReportKind): Promise<{ open: number; items: AdminReport[] }>
  adminOpenReports(): Promise<{ open: number }>
  adminUpdateReport(id: string, status: ReportStatus, note?: string): Promise<{ id: string; status: ReportStatus; note: string | null }>
  adminGifts(): Promise<AdminGift[]>
  adminGiveGift(id: string, g: { tier: 'PLUS' | 'PREMIUM'; days: number; reason?: string }): Promise<{ mode: 'DELAYED_CHARGE' | 'EXTENDED' | 'GIFT'; plan: string; until: string | null }>
  adminRevokeGift(id: string): Promise<void>
  adminRefillLives(id: string): Promise<{ lives: number }>
  adminGiveGems(id: string, amount: number): Promise<{ gems: number }>
  adminRestoreStreak(id: string, streak: number): Promise<{ streak: number }>
  adminSetBlocked(id: string, blocked: boolean, reason?: string): Promise<{ blocked: boolean }>
  adminResendWelcome(id: string): Promise<void>
  // Regalos
  myGifts(): Promise<{ payments: boolean; isGuest: boolean; fromName: string | null; gifts: GiftMineT[] }>
  buyGift(g: GiftInput): Promise<{ url: string }>
  confirmGift(sessionId: string): Promise<{ done: true; gift: GiftMineT } | { done: false; expired: boolean }>
  giftByCode(code: string): Promise<GiftPublicT>
  redeemGift(code: string): Promise<GiftRedeemT>
  // Analítica propia (no bloquea nada si falla)
  trackEvent(e: { name: 'push_open'; kind: string } | { name: 'client_error'; message: string; path: string; stack?: string } | { name: 'screen_view'; path: string; ref?: string } | { name: 'lesson_exit'; lessonId: string; step: number; of: number }): void
}
