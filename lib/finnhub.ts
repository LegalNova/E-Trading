import { ASSETS } from '@/data/assets'

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
const CACHE_TTL_MS = 20_000 // 20 seconds of "fresh" data before re-checking Finnhub

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
  // Forex (major pairs)
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  // Commodities (only GOLD/SILVER work reliably)
  'GOLD', 'SILVER',
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

// Fetch a single quote from Finnhub REST API (with server-side cache).
// If Finnhub fails but we have a previous successful quote in cache, we
// return that stale quote rather than null — this avoids the upstream
// `getMainPrices` falling through to `simulateQuote` and drifting the
// price randomly each call.
async function fetchQuote(ourSymbol: string): Promise<FinnhubQuote | null> {
  const cached = quoteCache.get(ourSymbol)
  // Serve fresh cache directly
  if (cached && cached.freshUntil > Date.now()) {
    return cached.quote
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return cached?.quote ?? null

  const finnhubSym = getFinnhubSymbol(ourSymbol)

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSym)}&token=${apiKey}`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return cached?.quote ?? null

    const data = await res.json()
    if (!data.c || data.c === 0) return cached?.quote ?? null

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
    return quote
  } catch {
    // Network error: serve last-known good value if we have one
    return cached?.quote ?? null
  }
}

// When Finnhub gives us nothing (no API key, network error, never seen),
// we still need to return *something*. We build a stable quote anchored
// to the asset's basePrice and remember it, so subsequent calls return
// the SAME value instead of generating a fresh random drift each poll.
function getStableFallback(sym: string): FinnhubQuote {
  const cached = quoteCache.get(sym)
  if (cached) return cached.quote

  const asset = ASSETS.find(a => a.symbol === sym)
  const base = asset?.basePrice ?? 100
  const quote: FinnhubQuote = {
    symbol: sym,
    price: base,
    change: 0,
    changePercent: 0,
    high: base,
    low: base,
    open: base,
    prevClose: base,
    volume: 0,
    timestamp: Date.now(),
  }
  // Persist as a "soft" cache entry — never expires, but the next time
  // Finnhub answers with real data we'll overwrite it.
  quoteCache.set(sym, { quote, freshUntil: 0 })
  return quote
}

// Fetch prices for all main assets
export async function getMainPrices(): Promise<FinnhubQuote[]> {
  // The cache layer absorbs the load so that concurrent requests don't
  // multiply Finnhub calls. Each symbol hits the network at most once per
  // CACHE_TTL_MS window.
  const results = await Promise.allSettled(
    MAIN_SYMBOLS.map(sym => fetchQuote(sym))
  )

  return results.map((result, i) => {
    const sym = MAIN_SYMBOLS[i]
    if (result.status === 'fulfilled' && result.value) {
      return result.value
    }
    return getStableFallback(sym)
  })
}

// Get prices for a specific list of symbols (used by /api/market/quotes)
export async function getPricesForSymbols(symbols: string[]): Promise<FinnhubQuote[]> {
  const apiKey = process.env.FINNHUB_API_KEY

  // Only fetch real prices for main symbols; simulate the rest
  const mainRequested = symbols.filter(s => MAIN_SYMBOLS.includes(s))
  const simRequested = symbols.filter(s => !MAIN_SYMBOLS.includes(s))

  const [realPrices, simPrices] = await Promise.all([
    apiKey && mainRequested.length > 0
      ? Promise.allSettled(mainRequested.map(s => fetchQuote(s)))
      : Promise.resolve([]),
    Promise.resolve(getSimulatedPrices(simRequested)),
  ])

  const real: FinnhubQuote[] = (realPrices as PromiseSettledResult<FinnhubQuote | null>[])
    .map((r, i) => {
      if (r.status === 'fulfilled' && r.value) return r.value
      return getStableFallback(mainRequested[i])
    })

  return [...real, ...simPrices]
}

// Simulate a quote for non-main assets
export function simulateQuote(symbol: string, basePrice: number): FinnhubQuote {
  const change = (Math.random() - 0.48) * basePrice * 0.02
  const price = Math.max(basePrice + change, 0.0001)
  const changePct = (change / basePrice) * 100
  return {
    symbol,
    price,
    change,
    changePercent: changePct,
    high: price * (1 + Math.random() * 0.01),
    low: price * (1 - Math.random() * 0.01),
    open: basePrice,
    prevClose: basePrice,
    volume: Math.floor(Math.random() * 2000000 + 100000),
    timestamp: Date.now(),
  }
}

export function getSimulatedPrices(symbols: string[]): FinnhubQuote[] {
  return symbols.map(sym => {
    const asset = ASSETS.find(a => a.symbol === sym)
    return simulateQuote(sym, asset?.basePrice ?? 100)
  })
}

// Legacy export for backwards compatibility
export function simulatePrice(basePrice: number, volatility = 0.002): number {
  const change = (Math.random() - 0.5) * 2 * volatility
  return basePrice * (1 + change)
}

export async function getAllPrices() {
  return getMainPrices()
}
