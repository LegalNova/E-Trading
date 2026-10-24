// Interfaz única de acceso a datos. La implementa `http.ts` contra /api/** con el contrato de docs/07.
import type {
  AchievementT, AnswerResultT, AssetDetailT, AssetItemT, AssetPageT, AssetTypeT, MarketOverviewT, RegionT, BillingPlanT, BillingStatusT, CandleT, CoursePathT,
  GenderT, HomeT, LeagueT, LessonT, LivesT, MeT, NotificationT, OrderPreviewT, OrderResultT, OrderSideT, OrderT, OrderTypeT,
  PlacementFinishT, PortfolioT, PriceAlertT, QuizFinishT, QuizStartT, SettingsT, StepCheckT, StreakT, TradeT, TradingStatsT,
} from '@/shared/contract'

export class ApiFailure extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message)
  }
}

export interface Session { signedIn: boolean; email: string | null; onboardingStep: number | null; isAdmin: boolean; googleEnabled?: boolean }

export interface OnboardingDraft {
  name: string
  gender: GenderT
  birthDate: string // YYYY-MM-DD
  experience: 'NONE' | 'SOME' | 'EXPERIENCED'
  goals: string[]
  dailyGoalMinutes: 5 | 10 | 15 | 20
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
}
export interface AdminUser { id: string; name: string; email: string; plan: 'FREE' | 'PREMIUM'; createdAt: string; lastActive: string; blocked: boolean; xp: number }
export interface AdminQuestion { id: string; type: string; prompt: string; options: string[]; solution: number | number[] | string; explanation: string }
export interface AdminContent { units: { id: string; order: number; title: string; lessons: { id: string; title: string; quizId: string }[] }[]; quizzes: Record<string, AdminQuestion[]>; achievements: number }
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
  forgotPassword(email: string): Promise<void>
  onboarding(): Promise<{ step: number; draft: OnboardingDraft }>
  saveOnboarding(step: number, patch: Partial<OnboardingDraft>): Promise<void>
  completeOnboarding(): Promise<void>

  // Inicio y perfil
  home(): Promise<HomeT>
  me(): Promise<MeT>
  lives(): Promise<LivesT>
  refillLives(): Promise<LivesT>

  // Clases y quiz
  path(): Promise<CoursePathT>
  lesson(id: string): Promise<LessonT>
  checkStep(lessonId: string, stepId: string, candleIndex: number): Promise<StepCheckT>
  quizStart(lessonId: string | 'placement' | 'review'): Promise<QuizStartT>
  answer(attemptId: string, questionId: string, answer: number | number[] | string, elapsedMs: number): Promise<AnswerResultT>
  quizFinish(attemptId: string): Promise<QuizFinishT>
  placementFinish(attemptId: string): Promise<PlacementFinishT>
  mistakesCount(): Promise<number>

  // Mercado
  assets(filter?: { type?: AssetTypeT | 'WATCH'; q?: string }): Promise<AssetItemT[]>
  asset(symbol: string): Promise<AssetDetailT>
  candles(symbol: string, interval: CandleInterval): Promise<CandleT[]>
  searchAssets(f: AssetFilter): Promise<AssetPageT>
  marketOverview(region: RegionT | 'ALL'): Promise<MarketOverviewT>
  facets(region?: RegionT): Promise<Facets>
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

  // Progreso
  streak(): Promise<StreakT>
  buyStreakFreeze(): Promise<StreakT>
  achievements(): Promise<AchievementT[]>
  league(): Promise<LeagueT>
  notifications(): Promise<NotificationT[]>
  markNotificationsRead(ids: string[] | 'all'): Promise<void>

  // Ajustes y pagos
  settings(): Promise<SettingsT>
  updateSettings(patch: Partial<SettingsT> & { name?: string; companionName?: string }): Promise<SettingsT>
  billingPlans(): Promise<BillingPlanT[]>
  billingStatus(): Promise<BillingStatusT>
  checkout(planId: string): Promise<BillingStatusT>
  cancelSubscription(): Promise<BillingStatusT>
  exportData(): Promise<string>
  deleteAccount(): Promise<void>

  // Admin
  adminMetrics(range: '7d' | '30d' | '90d'): Promise<AdminMetrics>
  adminUsers(q?: string): Promise<AdminUser[]>
  adminAudit(): Promise<AuditEntry[]>
  adminContent(): Promise<AdminContent>
}
