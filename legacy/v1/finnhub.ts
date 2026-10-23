import { ASSETS, ASSET_BY_SYMBOL } from '@/data/assets'
import { syntheticQuote } from '@/lib/sim'
import { sql } from '@/lib/db'
import { getFxTable, eurPer, FxTable } from '@/lib/fx'

export interface FinnhubQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
  volume: number
  timestamp: number
  /** true si el precio es simulado (sin dato real de Finnhub) */
  simulated?: boolean
  /** base de la simulación (para que el cliente calcule lo mismo) */
  base?: number
}

// Server-side cache to avoid hitting Finnhub rate limits.
// We keep TWO timestamps:
//   - `freshUntil`: under this, we serve directly without re-fetching
//   - the quote itself never expires — once we got a real quote we keep
//     serving it as the last-known value if Finnhub fails on retry.
//     This prevents random simulated drift overwriting real data.
interface CacheEntry {
  quote: FinnhubQuote
  freshUntil: number
}
const quoteCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60_000 // 60 s de dato "fresco" antes de volver a preguntar a Finnhub (plan gratuito: 60 llamadas/min)

// Main symbols with real Finnhub data (~105 total)
// - All 90 US stocks (ACCIONES_US)
// - All 15 ETFs
// - All 30 cryptos (via Binance feed)
// - 7 major Forex pairs
// - GOLD + SILVER
// European stocks, commodities other than GOLD/SILVER, and indices stay simulated
// because Finnhub's free plan has limited coverage for those.
export const MAIN_SYMBOLS = [
  // US stocks
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC',
  'CRM', 'ORCL', 'BRK.B', 'JPM', 'GS', 'JNJ', 'PFE', 'V', 'MA', 'KO',
  'MCD', 'NKE', 'DIS', 'SPOT', 'ABNB', 'UBER', 'LYFT', 'PLTR', 'CRWD', 'SNOW',
  'DDOG', 'NET', 'SQ', 'PYPL', 'SHOP', 'ZM', 'MRNA', 'BNTX', 'XOM', 'CVX',
  'BA', 'LMT', 'CAT', 'MMM', 'F', 'GM', 'STLA', 'RIVN', 'LCID', 'WMT',
  'UNH', 'LLY', 'AVGO', 'COST', 'ADBE', 'TMO', 'ACN', 'ABBV', 'TXN', 'DHR',
  'WFC', 'BAC', 'C', 'AXP', 'BLK', 'MS', 'QCOM', 'IBM', 'CSCO', 'VZ',
  'T', 'CMCSA', 'PEP', 'PG', 'HD', 'LOW', 'SBUX', 'TGT', 'GILD', 'AMGN',
  'MDLZ', 'MU', 'NOW', 'INTU', 'BKNG', 'COIN', 'MSTR', 'SMCI', 'ARM', 'DELL',
  // ETFs
  'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'GLD', 'SLV', 'IAU', 'USO', 'TLT',
  'HYG', 'EEM', 'VNQ', 'XLK', 'XLF',
  // Cryptos
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'DOT', 'LINK', 'UNI',
  'DOGE', 'SHIB', 'MATIC', 'LTC', 'ATOM', 'ALGO', 'XLM', 'VET', 'TRX', 'FIL',
  'THETA', 'HBAR', 'FTM', 'NEAR', 'APT', 'SUI', 'ARB', 'OP', 'STX', 'INJ',
  // Forex y materias primas no tienen datos en el plan gratuito: se simulan
  // (el forex, anclado al tipo de cambio oficial del BCE).
]

// Map our symbol → Finnhub symbol
const FINNHUB_MAP: Record<string, string> = {
  // Cryptos → Binance
  'BTC': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT',
  'SOL': 'BINANCE:SOLUSDT',
  'BNB': 'BINANCE:BNBUSDT',
  'XRP': 'BINANCE:XRPUSDT',
  'ADA': 'BINANCE:ADAUSDT',
  'AVAX': 'BINANCE:AVAXUSDT',
  'DOT': 'BINANCE:DOTUSDT',
  'LINK': 'BINANCE:LINKUSDT',
  'UNI': 'BINANCE:UNIUSDT',
  'DOGE': 'BINANCE:DOGEUSDT',
  'SHIB': 'BINANCE:SHIBUSDT',
  'MATIC': 'BINANCE:MATICUSDT',
  'LTC': 'BINANCE:LTCUSDT',
  'ATOM': 'BINANCE:ATOMUSDT',
  'ALGO': 'BINANCE:ALGOUSDT',
  'XLM': 'BINANCE:XLMUSDT',
  'VET': 'BINANCE:VETUSDT',
  'TRX': 'BINANCE:TRXUSDT',
  'FIL': 'BINANCE:FILUSDT',
  'THETA': 'BINANCE:THETAUSDT',
  'HBAR': 'BINANCE:HBARUSDT',
  'FTM': 'BINANCE:FTMUSDT',
  'NEAR': 'BINANCE:NEARUSDT',
  'APT': 'BINANCE:APTUSDT',
  'SUI': 'BINANCE:SUIUSDT',
  'ARB': 'BINANCE:ARBUSDT',
  'OP': 'BINANCE:OPUSDT',
  'STX': 'BINANCE:STXUSDT',
  'INJ': 'BINANCE:INJUSDT',
  // Forex → OANDA
  'EURUSD': 'OANDA:EUR_USD',
  'GBPUSD': 'OANDA:GBP_USD',
  'USDJPY': 'OANDA:USD_JPY',
  'USDCHF': 'OANDA:USD_CHF',
  'AUDUSD': 'OANDA:AUD_USD',
  'USDCAD': 'OANDA:USD_CAD',
  'NZDUSD': 'OANDA:NZD_USD',
  // Commodities → OANDA
  'GOLD': 'OANDA:XAU_USD',
  'SILVER': 'OANDA:XAG_USD',
  // European stock on Bolsa de Madrid
  'ITX': 'BME:ITX',
}

function getFinnhubSymbol(ourSymbol: string): string {
  return FINNHUB_MAP[ourSymbol] ?? ourSymbol
}

// ─── Límite de llamadas ──────────────────────────────────────
// El plan gratuito de Finnhub permite 60 llamadas/min por clave. Cada
// instancia del servidor gasta como mucho BUDGET_PER_MIN y, cuando se agota,
// sirve la última cotización real conocida (memoria o base de datos).
const BUDGET_PER_MIN = 30
let windowStart = 0
let used = 0
function takeBudget(): boolean {
  const now = Date.now()
  if (now - windowStart > 60_000) {
    windowStart = now
    used = 0
  }
  if (used >= BUDGET_PER_MIN) return false
  used++
  return true
}

// Símbolos para los que Finnhub no devuelve datos en el plan gratuito
const noDataUntil = new Map<string, number>()

// ─── Persistencia: última cotización real en Neon ────────────
// Así una instancia recién arrancada no muestra precios inventados.
let dbLoaded: Promise<void> | null = null
let dbLoadedAt = 0
const DB_RELOAD_MS = 60_000
function loadFromDb(): Promise<void> {
  // Se recarga cada minuto para aprovechar lo que hayan pedido otras instancias
  if (!dbLoaded || Date.now() - dbLoadedAt > DB_RELOAD_MS) {
    dbLoadedAt = Date.now()
    dbLoaded = (async () => {
      try {
        const rows = await sql()`SELECT symbol, quote, updated_at FROM quote_cache`
        for (const r of rows) {
          const sym = r.symbol as string
          const at = new Date(r.updated_at as string).getTime()
          const mem = quoteCache.get(sym)
          if (mem && mem.quote.timestamp >= at) continue
          quoteCache.set(sym, { quote: { ...(r.quote as FinnhubQuote), timestamp: at }, freshUntil: at + CACHE_TTL_MS })
        }
      } catch {
        dbLoadedAt = 0 // se reintenta en la siguiente petición
      }
    })()
  }
  return dbLoaded
}

const pendingWrites = new Map<string, FinnhubQuote>()
async function flushWrites(): Promise<void> {
  if (pendingWrites.size === 0) return
  const batch = Array.from(pendingWrites.values())
  pendingWrites.clear()
  try {
    await sql()`
      INSERT INTO quote_cache (symbol, quote, updated_at)
      SELECT x->>'symbol', x, NOW() FROM jsonb_array_elements(${JSON.stringify(batch)}::jsonb) AS x
      ON CONFLICT (symbol) DO UPDATE SET quote = EXCLUDED.quote, updated_at = NOW()`
  } catch (err) {
    console.error('quote_cache write failed', err)
  }
}

// Fetch a single quote from Finnhub REST API (with server-side cache).
// If Finnhub fails, is rate-limited or out of budget, we return the last
// real quote we have rather than null.
async function fetchQuote(ourSymbol: string): Promise<FinnhubQuote | null> {
  const cached = quoteCache.get(ourSymbol)
  if (cached && cached.freshUntil > Date.now()) return cached.quote

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return cached?.quote ?? null
  if ((noDataUntil.get(ourSymbol) ?? 0) > Date.now()) return cached?.quote ?? null
  if (!takeBudget()) return cached?.quote ?? null

  const finnhubSym = getFinnhubSymbol(ourSymbol)
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSym)}&token=${apiKey}`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    )
    if (res.status === 429) {
      used = BUDGET_PER_MIN // agotado: no insistir hasta el siguiente minuto
      return cached?.quote ?? null
    }
    if (!res.ok) return cached?.quote ?? null

    const data = await res.json()
    if (!data.c || data.c === 0) {
      noDataUntil.set(ourSymbol, Date.now() + 3_600_000)
      return cached?.quote ?? null
    }

    const quote: FinnhubQuote = {
      symbol: ourSymbol,
      price: data.c,
      change: data.d ?? 0,
      changePercent: data.dp ?? 0,
      high: data.h ?? data.c,
      low: data.l ?? data.c,
      open: data.o ?? data.c,
      prevClose: data.pc ?? data.c,
      volume: data.v ?? 0,
      timestamp: Date.now(),
    }
    quoteCache.set(ourSymbol, { quote, freshUntil: Date.now() + CACHE_TTL_MS })
    pendingWrites.set(ourSymbol, quote)
    return quote
  } catch {
    return cached?.quote ?? null
  }
}

// When Finnhub gives us nothing (no API key, network error, never seen),
// serve the last real quote if we ever had one; otherwise a deterministic
// synthetic quote (same value on server and client, never random).
function getStableFallback(sym: string): FinnhubQuote {
  const cached = quoteCache.get(sym)
  if (cached) return cached.quote
  return synthetic(sym)
}

function synthetic(sym: string, fx?: FxTable): FinnhubQuote {
  const asset = ASSET_BY_SYMBOL[sym]
  let base = asset?.basePrice ?? 100
  // Pares de divisas: nivel real del BCE (p. ej. EURUSD = $ por €)
  if (asset?.category === 'forex' && fx && /^[A-Z]{6}$/.test(sym)) {
    const cross = eurPer(sym.slice(0, 3), fx) / eurPer(sym.slice(3), fx)
    if (cross > 0 && Number.isFinite(cross)) base = cross
  }
  return { ...syntheticQuote(sym, base), simulated: true, base }
}

// Fetch prices for all main assets
export async function getMainPrices(): Promise<FinnhubQuote[]> {
  await loadFromDb()
  // The cache layer absorbs the load so that concurrent requests don't
  // multiply Finnhub calls. Each symbol hits the network at most once per
  // CACHE_TTL_MS window.
  const results = await Promise.allSettled(
    MAIN_SYMBOLS.map(sym => fetchQuote(sym))
  )

  await flushWrites()
  return results.map((result, i) => {
    const sym = MAIN_SYMBOLS[i]
    if (result.status === 'fulfilled' && result.value) {
      return result.value
    }
    return getStableFallback(sym)
  })
}

const MAIN_SET = new Set(MAIN_SYMBOLS)

/** ¿Tiene este símbolo datos reales de Finnhub? */
export function hasRealData(sym: string): boolean {
  return MAIN_SET.has(sym) && !!process.env.FINNHUB_API_KEY
}

// Get prices for a specific list of symbols (real for main symbols, synthetic for the rest)
export async function getPricesForSymbols(symbols: string[]): Promise<FinnhubQuote[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  const hasForex = symbols.some(s => ASSET_BY_SYMBOL[s]?.category === 'forex')
  const [fx] = await Promise.all([hasForex ? getFxTable() : Promise.resolve(undefined), apiKey ? loadFromDb() : Promise.resolve()])
  // El orden importa: los primeros símbolos pedidos consumen antes el presupuesto
  const out = await Promise.all(
    symbols.map(async sym => {
      if (!apiKey || !MAIN_SET.has(sym)) return synthetic(sym, fx)
      try {
        return (await fetchQuote(sym)) ?? getStableFallback(sym)
      } catch {
        return getStableFallback(sym)
      }
    }),
  )
  await flushWrites()
  return out
}

/** Cotizaciones de todos los activos del catálogo */
export async function getAllQuotes(): Promise<FinnhubQuote[]> {
  return getPricesForSymbols(ASSETS.map(a => a.symbol))
}
