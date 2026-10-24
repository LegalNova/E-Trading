// Contrato frontend ↔ backend (docs/07-contrato-api.md).
// Lo usan tanto los datos simulados (etapa 2) como la API real (etapa 3).
// El dinero viaja como texto decimal (D-021): "10482.35", "0.03100000".
import { z } from 'zod'

const money = z.string().regex(/^-?\d+(\.\d+)?$/)
const iso = z.string()

// ── Comunes ──────────────────────────────────────────────
export const Mood = z.enum(['HAPPY', 'CELEBRATE', 'WORRIED', 'CALM', 'SAD', 'SLEEPY', 'THINKING'])
export const Plan = z.enum(['FREE', 'PREMIUM'])
export const Gender = z.enum(['F', 'M', 'N'])
export const Feature = z.enum(['LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'])

export const CompanionLine = z.object({ message: z.string(), mood: Mood })

export const Achievement = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['LEARNING', 'TRADING', 'STREAK']),
  unlocked: z.boolean(),
  unlockedAt: iso.optional(),
  progress: z.number(),
  target: z.number(),
  reward: z.object({ gems: z.number(), xp: z.number() }),
})

/** Recompensas que devuelven las acciones que generan progreso */
export const Effects = z.object({
  xp: z.number(),
  goalsCompleted: z.array(z.string()),
  achievementsUnlocked: z.array(Achievement),
  levelUp: z.object({ from: z.number(), to: z.number() }).optional(),
  unlockedFeatures: z.array(Feature),
  companion: CompanionLine.optional(),
})

export const ApiError = z.object({ error: z.object({ code: z.string(), message: z.string() }) })

// ── Perfil e inicio ──────────────────────────────────────
export const Lives = z.object({
  current: z.number(),
  max: z.number(),
  nextRegenAt: iso.nullable(),
  regenHours: z.number(),
})

/** (+) xpLevelStart: XP donde empieza el nivel actual, para la barra de progreso */
export const Level = z.object({ n: z.number(), title: z.string(), xp: z.number(), xpLevelStart: z.number(), xpForNext: z.number() })

export const Me = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  plan: Plan,
  planRenewsAt: iso.nullable(),
  trialEndsAt: iso.nullable(),
  gender: Gender,
  memberSince: iso,
  level: Level,
  streak: z.number(),
  gems: z.number(),
  lives: Lives,
  lessonsCompleted: z.number(),
  achievementsCount: z.number(),
  achievementsTotal: z.number(),
  companion: z.object({ name: z.string(), skinId: z.string(), mood: Mood }),
  onboardingStep: z.number().nullable(),
})

export const DailyGoal = z.object({
  id: z.string(),
  label: z.string(),
  progress: z.number(),
  target: z.number(),
  xp: z.number(),
  done: z.boolean(),
})

export const Home = z.object({
  user: z.object({ name: z.string() }),
  streak: z.object({ days: z.number(), todayDone: z.boolean() }),
  gems: z.number(),
  lives: Lives,
  companion: CompanionLine,
  nextLesson: z
    .object({ id: z.string(), title: z.string(), unitTitle: z.string(), unitOrder: z.number(), minutes: z.number(), progressPct: z.number() })
    .nullable(),
  dailyGoals: z.array(DailyGoal),
  portfolio: z.object({ totalValue: money, dayChange: money, dayChangePct: z.number(), sparkline: z.array(z.number()) }),
})

// ── Clases ───────────────────────────────────────────────
export const LessonStatus = z.enum(['LOCKED', 'AVAILABLE', 'COMPLETED'])
export const PathLesson = z.object({
  id: z.string(),
  title: z.string(),
  status: LessonStatus,
  stars: z.number().min(0).max(3),
  minutes: z.number(),
  xp: z.number(),
  isUnitReview: z.boolean(),
  /** (+) Bloqueada por plan, no por orden: se abre Premium al tocarla */
  requiresPremium: z.boolean(),
})
export const PathUnit = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  progressPct: z.number(),
  premiumOnly: z.boolean(),
  unlocksFeature: Feature.optional(),
  lessons: z.array(PathLesson),
})
export const CoursePath = z.object({ courseId: z.string(), title: z.string(), currentUnitId: z.string(), units: z.array(PathUnit) })

export const LessonStep = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('TEXT'), title: z.string(), body: z.string(), companionTip: z.string().optional() }),
  z.object({ id: z.string(), type: z.literal('IMAGE'), title: z.string(), body: z.string(), image: z.string(), companionTip: z.string().optional() }),
  z.object({ id: z.string(), type: z.literal('VIDEO'), title: z.string(), url: z.string(), companionTip: z.string().optional() }),
  z.object({
    id: z.string(),
    type: z.literal('INTERACTIVE_CHART'),
    prompt: z.string(),
    caption: z.string(),
    candles: z.array(z.tuple([z.number(), z.number(), z.number(), z.number()])),
    companionTip: z.string().optional(),
  }),
  z.object({ id: z.string(), type: z.literal('SIMULATOR_TASK'), title: z.string(), body: z.string(), task: z.string() }),
  z.object({ id: z.string(), type: z.literal('QUIZ'), quizId: z.string(), title: z.string(), body: z.string() }),
])
export const Lesson = z.object({
  id: z.string(),
  title: z.string(),
  unitTitle: z.string(),
  minutes: z.number(),
  xp: z.number(),
  steps: z.array(LessonStep),
})
export const StepCheck = z.object({ correct: z.boolean(), explanation: z.string() })

// ── Quiz ─────────────────────────────────────────────────
export const QuestionType = z.enum(['SINGLE', 'MULTIPLE', 'TRUE_FALSE', 'ORDER', 'FILL_BLANK', 'CHART_POINT', 'CHART_TREND'])
export const Question = z.object({
  id: z.string(),
  type: QuestionType,
  prompt: z.string(),
  options: z.array(z.string()),
  chart: z.array(z.number()).optional(),
})
export const QuizStart = z.object({ attemptId: z.string(), lessonId: z.string().nullable(), isPlacement: z.boolean(), questions: z.array(Question), lives: Lives })
export const AnswerResult = z.object({
  correct: z.boolean(),
  correctAnswer: z.union([z.number(), z.array(z.number()), z.string()]),
  explanation: z.string(),
  livesLeft: z.number().nullable(),
  xpGained: z.number(),
})
export const QuizFinish = Effects.extend({
  correct: z.number(),
  total: z.number(),
  stars: z.number(),
  durationMs: z.number(),
  xpBreakdown: z.object({ base: z.number(), perfectBonus: z.number(), speedBonus: z.number(), total: z.number() }),
  streak: z.object({ days: z.number(), extendedToday: z.boolean() }),
})
export const PlacementFinish = z.object({
  correct: z.number(),
  total: z.number(),
  startUnitId: z.string(),
  startUnitTitle: z.string(),
  skippedUnitTitles: z.array(z.string()),
})

// ── Mercado ──────────────────────────────────────────────
export const AssetType = z.enum(['STOCK', 'ETF', 'INDEX', 'CRYPTO', 'FX', 'COMMODITY'])
export const Region = z.enum(['AMERICA', 'EUROPE', 'ASIA', 'GLOBAL'])
export const AssetItem = z.object({
  symbol: z.string(),
  /** (+) Símbolo corto para mostrar (SAN en vez de SAN.MC) */
  ticker: z.string(),
  name: z.string(),
  type: AssetType,
  exchange: z.string(),
  isOpen: z.boolean(),
  price: money,
  /** Moneda de cotización (USD, EUR, GBP, JPY…). GBp y USX se normalizan a GBP y USD */
  currency: z.string(),
  region: Region,
  country: z.string(),
  sector: z.string(),
  changePct: z.number(),
  sparkline: z.array(z.number()),
  stale: z.boolean(),
  asOf: iso,
  delayedMinutes: z.number(),
})
export const AssetDetail = AssetItem.extend({
  change: money,
  priceInUserCurrency: money,
  opensAt: iso.nullable(),
  closesAt: iso.nullable(),
  description: z.string(),
  dayHigh: z.number().nullable(),
  dayLow: z.number().nullable(),
  high52: z.number().nullable(),
  low52: z.number().nullable(),
  volume: z.number().nullable(),
  prevClose: z.number(),
  indices: z.array(z.string()),
  exchangeName: z.string(),
  timezone: z.string(),
})
/** t: segundos UNIX (formato de los gráficos); v: volumen */
export const Candle = z.object({ t: z.number(), o: z.number(), h: z.number(), l: z.number(), c: z.number(), v: z.number() })
/** (+) Portada del mercado */
export const MarketOverview = z.object({
  indices: z.array(AssetItem),
  gainers: z.array(AssetItem),
  losers: z.array(AssetItem),
  updatedAt: iso,
})
/** (+) Página de un listado con filtros */
export const AssetPage = z.object({ items: z.array(AssetItem), total: z.number(), nextOffset: z.number().nullable() })
export const OrderSide = z.enum(['BUY', 'SELL'])
export const OrderType = z.enum(['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'])
export const OrderPreview = z.object({
  estPrice: money,
  qty: money,
  fee: money,
  total: money,
  cashAfter: money,
  weightPct: z.number(),
  risk: z.object({ flagged: z.boolean(), reason: z.string().nullable(), thresholdPct: z.number(), suggestedAmount: money.nullable() }),
  allowedTypes: z.array(OrderType),
  locked: z.array(z.object({ type: OrderType, unlockBy: z.string() })),
  error: z.enum(['INSUFFICIENT_FUNDS', 'INSUFFICIENT_QTY', 'MIN_AMOUNT']).nullable(),
})
export const Order = z.object({
  id: z.string(),
  symbol: z.string(),
  side: OrderSide,
  type: OrderType,
  status: z.enum(['FILLED', 'PENDING', 'REJECTED', 'CANCELLED']),
  qty: money,
  amount: money,
  triggerPrice: money.nullable(),
  fillPrice: money.nullable(),
  fee: money,
  createdAt: iso,
  filledAt: iso.nullable(),
  executesAt: iso.nullable(),
})
export const OrderResult = Effects.extend({ order: Order })
export const Position = z.object({
  symbol: z.string(),
  name: z.string(),
  type: AssetType,
  qty: money,
  avgPrice: money,
  marketValue: money,
  unrealizedPnl: money,
  pnlPct: z.number(),
  weightPct: z.number(),
})
export const Portfolio = z.object({
  totalValue: money,
  cash: money,
  dayChange: money,
  dayChangePct: z.number(),
  totalReturnPct: z.number(),
  realizedPnl: money,
  unrealizedPnl: money,
  positions: z.array(Position),
  resetsLeft: z.number(),
})
export const Trade = z.object({
  id: z.string(),
  side: OrderSide,
  type: OrderType,
  symbol: z.string(),
  qty: money,
  price: money,
  fee: money,
  total: money,
  realizedPnl: money.nullable(),
  status: z.enum(['FILLED', 'REJECTED']),
  createdAt: iso,
  rejectReason: z.string().nullable(),
})
export const PriceAlert = z.object({ id: z.string(), symbol: z.string(), condition: z.enum(['ABOVE', 'BELOW']), price: money, active: z.boolean() })

// ── Progreso ─────────────────────────────────────────────
export const StreakDay = z.object({ date: z.string(), status: z.enum(['ACTIVE', 'FROZEN', 'MISSED', 'NONE']) })
export const Streak = z.object({
  current: z.number(),
  best: z.number(),
  todayDone: z.boolean(),
  timezone: z.string(),
  freezes: z.number(),
  freezePrice: z.number(),
  days: z.array(StreakDay),
})
export const LeagueMember = z.object({
  rank: z.number(),
  userId: z.string(),
  displayName: z.string(),
  weeklyXp: z.number(),
  riskAdjReturnPct: z.number(),
  score: z.number(),
  isMe: z.boolean(),
})
export const League = z.object({
  division: z.object({ id: z.string(), name: z.string(), order: z.number() }),
  divisions: z.array(z.string()),
  endsAt: iso,
  promoteTop: z.number(),
  demoteFrom: z.number(),
  members: z.array(LeagueMember),
})
export const TradingStats = z.object({
  tradesPerDay: z.number(),
  winRatePct: z.number(),
  maxDrawdownPct: z.number(),
  insights: z.array(z.string()),
})
export const NotificationType = z.enum(['STREAK_RISK', 'ORDER_FILLED', 'PRICE_ALERT', 'ACHIEVEMENT', 'LEAGUE_RESULT', 'NEW_LESSON'])
export const Notification = z.object({
  id: z.string(),
  type: NotificationType,
  title: z.string(),
  body: z.string(),
  deepLink: z.string(),
  readAt: iso.nullable(),
  createdAt: iso,
})

// ── Ajustes y pagos ──────────────────────────────────────
export const Settings = z.object({
  locale: z.enum(['es', 'ca', 'en']),
  currency: z.enum(['EUR', 'USD']),
  dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  theme: z.enum(['AUTO', 'LIGHT', 'DARK']),
  gender: Gender,
  notificationPrefs: z.record(z.string(), z.object({ inApp: z.boolean(), email: z.boolean(), push: z.boolean() })),
  /** (+) Privacidad: mostrar el nombre en la liga o aparecer como «Jugador anónimo» */
  leagueVisible: z.boolean(),
})
export const BillingPlan = z.object({
  id: z.string(),
  interval: z.enum(['MONTH', 'YEAR']),
  price: money,
  currency: z.literal('EUR'),
  trialDays: z.number(),
})
export const BillingStatus = z.object({ plan: Plan, status: z.enum(['NONE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED']), renewsAt: iso.nullable(), trialEndsAt: iso.nullable(), interval: z.enum(['MONTH', 'YEAR']).nullable() })

export type Mood = z.infer<typeof Mood>
export type PlanT = z.infer<typeof Plan>
export type GenderT = z.infer<typeof Gender>
export type FeatureT = z.infer<typeof Feature>
export type CompanionLineT = z.infer<typeof CompanionLine>
export type AchievementT = z.infer<typeof Achievement>
export type EffectsT = z.infer<typeof Effects>
export type LivesT = z.infer<typeof Lives>
export type MeT = z.infer<typeof Me>
export type DailyGoalT = z.infer<typeof DailyGoal>
export type HomeT = z.infer<typeof Home>
export type PathLessonT = z.infer<typeof PathLesson>
export type PathUnitT = z.infer<typeof PathUnit>
export type CoursePathT = z.infer<typeof CoursePath>
export type LessonStepT = z.infer<typeof LessonStep>
export type LessonT = z.infer<typeof Lesson>
export type StepCheckT = z.infer<typeof StepCheck>
export type QuestionT = z.infer<typeof Question>
export type QuizStartT = z.infer<typeof QuizStart>
export type AnswerResultT = z.infer<typeof AnswerResult>
export type QuizFinishT = z.infer<typeof QuizFinish>
export type PlacementFinishT = z.infer<typeof PlacementFinish>
export type AssetTypeT = z.infer<typeof AssetType>
export type RegionT = z.infer<typeof Region>
export type MarketOverviewT = z.infer<typeof MarketOverview>
export type AssetPageT = z.infer<typeof AssetPage>
export type AssetItemT = z.infer<typeof AssetItem>
export type AssetDetailT = z.infer<typeof AssetDetail>
export type CandleT = z.infer<typeof Candle>
export type OrderSideT = z.infer<typeof OrderSide>
export type OrderTypeT = z.infer<typeof OrderType>
export type OrderPreviewT = z.infer<typeof OrderPreview>
export type OrderT = z.infer<typeof Order>
export type OrderResultT = z.infer<typeof OrderResult>
export type PositionT = z.infer<typeof Position>
export type PortfolioT = z.infer<typeof Portfolio>
export type TradeT = z.infer<typeof Trade>
export type PriceAlertT = z.infer<typeof PriceAlert>
export type StreakT = z.infer<typeof Streak>
export type LeagueT = z.infer<typeof League>
export type TradingStatsT = z.infer<typeof TradingStats>
export type NotificationT = z.infer<typeof Notification>
export type SettingsT = z.infer<typeof Settings>
export type BillingPlanT = z.infer<typeof BillingPlan>
export type BillingStatusT = z.infer<typeof BillingStatus>
