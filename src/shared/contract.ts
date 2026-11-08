// Contrato frontend ↔ backend (docs/07-contrato-api.md).
// Lo usan tanto los datos simulados (etapa 2) como la API real (etapa 3).
// El dinero viaja como texto decimal (D-021): "10482.35", "0.03100000".
import { z } from 'zod'
import { PlayStep, StoryStep } from './play'

const money = z.string().regex(/^-?\d+(\.\d+)?$/)
const iso = z.string()

// ── Comunes ──────────────────────────────────────────────
export const Mood = z.enum(['HAPPY', 'CELEBRATE', 'WORRIED', 'CALM', 'SAD', 'SLEEPY', 'THINKING'])
export const Plan = z.enum(['FREE', 'PLUS', 'PREMIUM'])
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
  /** (+) Bloqueada por el plan del usuario, no por orden */
  requiresPremium: z.boolean(),
  /** Plan mínimo que la abre */
  requiredPlan: Plan,
})
export const PathUnit = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  progressPct: z.number(),
  /** FREE: toda gratis · PARTIAL_PLUS / PARTIAL_MAX: algunas lecciones de pago · MAX: solo Max */
  access: z.enum(['FREE', 'PARTIAL_PLUS', 'PARTIAL_MAX', 'MAX']),
  /** Unidad paralela (se puede hacer en cualquier momento) */
  side: z.boolean(),
  unlocksFeature: Feature.optional(),
  /** Sección (curso v2): abierta o no y, si no, qué retos finales faltan */
  section: z.object({ id: z.string(), title: z.string(), open: z.boolean(), needs: z.array(z.string()) }).optional(),
  /** Se puede superar con la prueba de unidad («¿ya lo sabes?») */
  testOut: z.boolean().optional(),
  lessons: z.array(PathLesson),
})
export const CoursePath = z.object({ courseId: z.string(), title: z.string(), currentUnitId: z.string(), units: z.array(PathUnit), minutesTotal: z.number(), dailyGoalMinutes: z.number() })

export const LessonStep = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('TEXT'), title: z.string(), body: z.string(), keyIdea: z.string().optional(), companionTip: z.string().optional() }),
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
  /** Calculadora interactiva (deslizadores) dentro de la teoría */
  z.object({ id: z.string(), type: z.literal('CALCULATOR'), title: z.string(), body: z.string(), calc: z.enum(['compound', 'inflation', 'rule72', 'position', 'recovery', 'fees', 'dca', 'budget', 'loan']), companionTip: z.string().optional() }),
  z.object({ id: z.string(), type: z.literal('QUIZ'), quizId: z.string(), title: z.string(), body: z.string() }),
  /** Clases interactivas: pieza para tocar y descubrir, e historia con decisiones */
  PlayStep,
  StoryStep,
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
export const QuestionType = z.enum([
  'SINGLE', 'MULTIPLE', 'TRUE_FALSE', 'ORDER', 'FILL_BLANK', 'CHART_POINT', 'CHART_TREND',
  // Tipos dinámicos (docs/curso-v2/03-ejercicios.md)
  'MATCH', 'BUCKETS', 'CHART_CANDLE', 'UP_DOWN', 'PLACE_LEVEL', 'SIM_TRADE', 'SCENARIO', 'NUMBER', 'PORTFOLIO', 'SPOT', 'CHAT',
])
const Ohlc = z.tuple([z.number(), z.number(), z.number(), z.number()])
export const Question = z.object({
  id: z.string(),
  type: QuestionType,
  prompt: z.string(),
  options: z.array(z.string()),
  chart: z.array(z.number()).optional(),
  /** Velas reales (apertura, máximo, mínimo, cierre) sin el futuro: se revela al responder */
  candles: z.array(Ohlc).optional(),
  /** Columna derecha de «emparejar» o grupos de «clasificar» */
  right: z.array(z.string()).optional(),
  /** Datos públicos del ejercicio (nunca la solución): precio de entrada, saldo, unidad, mensajes de Lumi, segundos… */
  meta: z
    .object({
      entry: z.number().optional(),
      level: z.enum(['STOP', 'TAKE']).optional(),
      cash: z.number().optional(),
      maxRiskPct: z.number().optional(),
      unit: z.string().optional(),
      kinds: z.array(z.string()).optional(),
      lines: z.array(z.string()).optional(),
      senders: z.array(z.string()).optional(),
      horizon: z.string().optional(),
      timeLimit: z.number().optional(),
      /** Preguntas de cifra: opciones para tocar (una es la buena), nunca hay que escribir ni hacer cuentas a mano */
      choices: z.array(z.number()).optional(),
      /** Pregunta de una clase anterior que tocaba repasar (se mezcla en el quiz de la clase) */
      review: z.boolean().optional(),
    })
    .optional(),
})
export const QuizStart = z.object({ attemptId: z.string(), lessonId: z.string().nullable(), isPlacement: z.boolean(), questions: z.array(Question), lives: Lives })
export const AnswerResult = z.object({
  correct: z.boolean(),
  correctAnswer: z.union([z.number(), z.array(z.number()), z.string()]),
  explanation: z.string(),
  livesLeft: z.number().nullable(),
  xpGained: z.number(),
  /** Lo que pasó de verdad (ejercicios con gráfico real): velas siguientes, activo y fechas, resultado */
  reveal: z
    .object({
      candles: z.array(Ohlc).optional(),
      closes: z.array(z.number()).optional(),
      caption: z.string().optional(),
      outcome: z.string().optional(),
      levels: z.object({ entry: z.number().optional(), stop: z.number().optional(), take: z.number().optional(), exit: z.number().optional() }).optional(),
    })
    .optional(),
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
/** (+) Datos de empresa de la ficha (Yahoo). null = sin dato: no se enseña */
export const Fundamentals = z.object({
  symbol: z.string(),
  /** Hay al menos un dato que enseñar */
  available: z.boolean(),
  /** En la moneda principal de la cotización (`currency`) */
  marketCap: z.number().nullable(),
  marketCapEur: z.number().nullable(),
  currency: z.string().nullable(),
  pe: z.number().nullable(),
  /** En %: 2.37 = 2,37 % */
  dividendYield: z.number().nullable(),
  eps: z.number().nullable(),
  /** Moneda de las cuentas de la empresa (la del BPA) */
  epsCurrency: z.string().nullable(),
  beta: z.number().nullable(),
  /** ETF: comisión anual en % */
  ter: z.number().nullable(),
  updatedAt: iso.nullable(),
})
/** (+) Ideas para estudiar: listas con un criterio transparente (nunca recomendaciones) */
export const IdeaListId = z.enum(['drops', 'dividend', 'lowPe', 'ibex', 'etf'])
export const IdeaItem = z.object({
  asset: AssetItem,
  /** Dato del criterio: % del día, rentabilidad por dividendo, PER o capitalización en euros */
  value: z.number().nullable(),
  /** PER bajo para su sector: la mediana del sector */
  ref: z.number().nullable(),
})
export const IdeaList = z.object({ id: IdeaListId, asOf: iso.nullable(), lessonId: z.string(), items: z.array(IdeaItem) })
export const Ideas = z.object({ lists: z.array(IdeaList) })
export const OrderSide = z.enum(['BUY', 'SELL'])
export const OrderType = z.enum(['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'])
/** Consejo de Lumi sobre una orden (lógica propia, src/server/tutor/coach.ts) */
export const CoachTip = z.object({ code: z.string(), level: z.enum(['OK', 'INFO', 'WARN']), title: z.string(), body: z.string(), lessonId: z.string().nullable() })
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
  error: z.enum(['INSUFFICIENT_FUNDS', 'INSUFFICIENT_QTY', 'MIN_AMOUNT', 'BAD_STOP', 'BAD_TAKE_PROFIT']).nullable(),
  exits: z.object({ lossAtStop: money.nullable(), gainAtTarget: money.nullable() }),
  coach: z.array(CoachTip),
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
  stopLoss: money.nullable(),
  takeProfit: money.nullable(),
  parentId: z.string().nullable(),
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
  /** Puntos por la rentabilidad de la semana (pueden ser negativos) */
  tradePts: z.number(),
  score: z.number(),
  isMe: z.boolean(),
  division: z.string().optional(),
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
  dailyGoalMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30)]),
  theme: z.enum(['AUTO', 'LIGHT', 'DARK']),
  gender: Gender,
  notificationPrefs: z.record(z.string(), z.object({ inApp: z.boolean(), email: z.boolean(), push: z.boolean() })),
  /** (+) Privacidad: mostrar el nombre en la liga o aparecer como «Jugador anónimo» */
  leagueVisible: z.boolean(),
})
export const BillingPlan = z.object({
  id: z.string(),
  /** Plan que activa: PLUS o PREMIUM («Max») */
  tier: z.enum(['PLUS', 'PREMIUM']),
  interval: z.enum(['MONTH', 'YEAR']),
  price: money,
  currency: z.literal('EUR'),
  trialDays: z.number(),
})
export const BillingStatus = z.object({ plan: Plan, status: z.enum(['NONE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'GIFT']), renewsAt: iso.nullable(), trialEndsAt: iso.nullable(), interval: z.enum(['MONTH', 'YEAR']).nullable() })

// ── Lumi, la profesora (chat con el manual del curso) ──
export const TutorMode = z.enum(['EXPLAIN', 'PATH', 'PORTFOLIO', 'BIASES'])
export const TutorSource = z.object({ lessonId: z.string(), title: z.string(), unit: z.string() })
export const TutorUsage = z.object({ used: z.number(), limit: z.number() })
/** (+) Respuestas con IA (Claude) de hoy: solo en Max y con la IA activada; on=false → responde el cerebro propio */
export const TutorAiUsage = z.object({ on: z.boolean(), used: z.number(), limit: z.number() })
/** (+) Quién respondió: LUMI (cerebro propio) o AI (Claude) */
export const TutorEngine = z.enum(['LUMI', 'AI'])
export const TutorAnswer = z.object({ answer: z.string(), sources: z.array(TutorSource), usage: TutorUsage, engine: TutorEngine.optional(), ai: TutorAiUsage.optional() })
export const TutorMessage = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), content: z.string(), mode: TutorMode, sources: z.array(TutorSource), createdAt: iso, engine: TutorEngine.optional() })
export const TutorHistory = z.object({ messages: z.array(TutorMessage), usage: TutorUsage, plan: Plan, ai: TutorAiUsage.optional() })

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
export type CoachTipT = z.infer<typeof CoachTip>
export type TutorModeT = z.infer<typeof TutorMode>
export type TutorAnswerT = z.infer<typeof TutorAnswer>
export type TutorHistoryT = z.infer<typeof TutorHistory>
export type TutorMessageT = z.infer<typeof TutorMessage>
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
export type FundamentalsT = z.infer<typeof Fundamentals>
export type IdeaListIdT = z.infer<typeof IdeaListId>
export type IdeaItemT = z.infer<typeof IdeaItem>
export type IdeaListT = z.infer<typeof IdeaList>
export type IdeasT = z.infer<typeof Ideas>
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

// ── Regalos (regalar Plus o Max) ─────────────────────────
export const GiftStatus = z.enum(['PENDING', 'READY', 'REDEEMED', 'CANCELED', 'EXPIRED'])
export const GiftMine = z.object({
  id: z.string(), code: z.string().nullable(), tier: z.enum(['PLUS', 'PREMIUM']), months: z.union([z.literal(1), z.literal(12)]), days: z.number(),
  fromName: z.string().nullable(), toName: z.string().nullable(), message: z.string().nullable(), amount: z.number().nullable(), status: GiftStatus,
  createdAt: z.string(), paidAt: z.string().nullable(), redeemedAt: z.string().nullable(), expiresAt: z.string().nullable(), redeemedBy: z.string().nullable(),
})
export const GiftPublic = z.object({
  code: z.string(), tier: z.enum(['PLUS', 'PREMIUM']), months: z.union([z.literal(1), z.literal(12)]), days: z.number(), fromName: z.string().nullable(), toName: z.string().nullable(), message: z.string().nullable(),
  status: GiftStatus, expiresAt: z.string().nullable(), mine: z.boolean(), redeemedByMe: z.boolean(),
})
export const GiftRedeem = z.object({ tier: z.enum(['PLUS', 'PREMIUM']), days: z.number(), months: z.union([z.literal(1), z.literal(12)]), mode: z.enum(['DELAYED_CHARGE', 'EXTENDED', 'GIFT']), plan: Plan, until: z.string().nullable(), fromName: z.string().nullable() })
export type GiftMineT = z.infer<typeof GiftMine>
export type GiftPublicT = z.infer<typeof GiftPublic>
export type GiftRedeemT = z.infer<typeof GiftRedeem>

// ── Ligas de amigos ──────────────────────────────────────
export const FriendLeagueItem = z.object({ id: z.string(), name: z.string(), members: z.number(), isOwner: z.boolean() })
export const FriendLeagues = z.object({
  leagues: z.array(FriendLeagueItem),
  owned: z.number(), maxOwned: z.number(), maxJoined: z.number(), maxMembers: z.number(),
  /** Las cuentas de invitado se pueden unir, pero para crear una liga hay que guardar la cuenta */
  canCreate: z.boolean(),
})
/** Fila de «Esta semana»: los mismos puntos que la liga general (XP de la semana + inversión) */
export const FriendWeekRow = z.object({ key: z.string(), rank: z.number(), displayName: z.string(), weeklyXp: z.number(), tradePts: z.number(), riskAdjReturnPct: z.number(), score: z.number(), isMe: z.boolean() })
/** Fila de «Temporada del mes»: rentabilidad del mes con tope de ±10 % (concentrada: ganancias a la mitad) */
export const FriendMonthRow = z.object({ key: z.string(), rank: z.number(), displayName: z.string(), pct: z.number(), concentrated: z.boolean(), isMe: z.boolean() })
export const FriendLeague = z.object({
  id: z.string(), name: z.string(), code: z.string(), isOwner: z.boolean(), ownerName: z.string(), maxMembers: z.number(),
  /** `key`: identificador opaco del miembro en esta liga (para que quien la creó pueda quitarlo); nunca el id de la cuenta */
  members: z.array(z.object({ key: z.string(), displayName: z.string(), isMe: z.boolean(), isOwner: z.boolean() })),
  week: z.object({ endsAt: iso, rows: z.array(FriendWeekRow) }),
  month: z.object({ month: z.string(), endsAt: iso, rows: z.array(FriendMonthRow) }),
  /** Ganador (o ganadores, si empatan) del mes anterior */
  champion: z.object({ month: z.string(), pct: z.number(), names: z.array(z.string()), isMe: z.boolean() }).nullable(),
})
export const FriendLeaguePeek = z.object({ valid: z.boolean(), name: z.string().nullable(), members: z.number(), full: z.boolean() })
export type FriendLeagueItemT = z.infer<typeof FriendLeagueItem>
export type FriendLeaguesT = z.infer<typeof FriendLeagues>
export type FriendLeagueT = z.infer<typeof FriendLeague>
export type FriendLeaguePeekT = z.infer<typeof FriendLeaguePeek>
export type FriendWeekRowT = z.infer<typeof FriendWeekRow>
export type FriendMonthRowT = z.infer<typeof FriendMonthRow>

// ── Misiones «Pruébalo» ──────────────────────────────────
export const MissionKind = z.enum(['VIEW_ASSET', 'BUY_TYPE', 'BUY_SYMBOL', 'SELL', 'WATCH', 'ALERT', 'LIMIT_ORDER', 'STOP_ORDER', 'TAKE_PROFIT', 'OPEN_PORTFOLIO', 'EXPLORE', 'JOURNAL'])
export const Mission = z.object({
  lessonId: z.string(), lessonTitle: z.string(),
  /** La frase «Pruébalo» de la clase (sin la entrada), en el idioma de la pantalla */
  text: z.string(),
  kind: MissionKind,
  /** Activos que la cumplen (vacío: vale cualquiera) */
  symbols: z.array(z.string()),
  href: z.string(), xp: z.number(), startedAt: iso.nullable(), doneAt: iso.nullable(),
})
export const Missions = z.object({ pending: z.array(Mission), recentDone: z.array(Mission), justDone: z.array(Mission), xpGained: z.number() })
export const LessonMission = z.object({ mission: Mission.nullable(), state: z.enum(['LOCKED', 'OPEN', 'DONE', 'EXPIRED', 'NONE']), xpGained: z.number() })
export type MissionKindT = z.infer<typeof MissionKind>
export type MissionT = z.infer<typeof Mission>
export type MissionsT = z.infer<typeof Missions>
export type LessonMissionT = z.infer<typeof LessonMission>

// ── Diario de operaciones ────────────────────────────────
export const JournalVerdict = z.enum(['MET', 'NOT_MET', 'TOO_EARLY'])
export const JournalEntry = z.object({
  id: z.string(), orderId: z.string().nullable(), symbol: z.string(), name: z.string(), type: z.string(), side: OrderSide, tag: z.string(), reason: z.string(),
  /** Precio al decidir (texto) y ahora (null si no hay cotización), en la moneda del activo */
  priceAt: money, priceNow: z.number().nullable(), currency: z.string(),
  createdAt: iso, remindAt: iso, reviewedAt: iso.nullable(), verdict: JournalVerdict.nullable(), note: z.string().nullable(), due: z.boolean(),
})
export const JournalSummary = z.object({ side: OrderSide, tag: z.string(), decided: z.number(), met: z.number(), total: z.number() })
export const Journal = z.object({ entries: z.array(JournalEntry), summary: z.array(JournalSummary), due: z.number() })
export type JournalVerdictT = z.infer<typeof JournalVerdict>
export type JournalEntryT = z.infer<typeof JournalEntry>
export type JournalSummaryT = z.infer<typeof JournalSummary>
export type JournalT = z.infer<typeof Journal>
