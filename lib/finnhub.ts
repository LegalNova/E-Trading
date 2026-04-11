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

// Server-side cache to avoid hitting Finnhub rate limits
interface CacheEntry {
  quote: FinnhubQuote
  expiry: number
}
const quoteCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 20_000 // 20 seconds

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

// Fetch a single quote from Finnhub REST API (with server-side cache)
async function fetchQuote(ourSymbol: string): Promise<FinnhubQuote | null> {
  // Check cache first
  const cached = quoteCache.get(ourSymbol)
  if (cached && cached.expiry > Date.now()) {
    return cached.quote
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return null

  const finnhubSym = getFinnhubSymbol(ourSymbol)

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSym)}&token=${apiKey}`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null

    const data = await res.json()
    if (!data.c || data.c === 0) return null

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
    quoteCache.set(ourSymbol, { quote, expiry: Date.now() + CACHE_TTL_MS })
    return quote
  } catch {
    return null
  }
}

// Fetch prices for all main assets
export async function getMainPrices(): Promise<FinnhubQuote[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return getSimulatedPrices(MAIN_SYMBOLS)

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
    // Fallback to simulation for this asset
    const asset = ASSETS.find(a => a.symbol === sym)
    return simulateQuote(sym, asset?.basePrice ?? 100)
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
      const asset = ASSETS.find(a => a.symbol === mainRequested[i])
      return simulateQuote(mainRequested[i], asset?.basePrice ?? 100)
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
