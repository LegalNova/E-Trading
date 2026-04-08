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

// The 21 main assets from CLAUDE.md — these get real prices
// The rest of the 163 assets use simulation (avoids rate limit)
export const MAIN_SYMBOLS = [
  'AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'ITX',
  'BTC', 'ETH', 'SOL', 'BNB',
  'SPY', 'QQQ', 'IWM',
  'EURUSD', 'GBPUSD', 'USDJPY',
  'GOLD', 'WTI', 'SILVER',
]

// Map our symbol → Finnhub symbol
const FINNHUB_MAP: Record<string, string> = {
  'BTC': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT',
  'SOL': 'BINANCE:SOLUSDT',
  'BNB': 'BINANCE:BNBUSDT',
  'EURUSD': 'OANDA:EUR_USD',
  'GBPUSD': 'OANDA:GBP_USD',
  'USDJPY': 'OANDA:USD_JPY',
  'GOLD': 'OANDA:XAU_USD',
  'SILVER': 'OANDA:XAG_USD',
  'WTI': 'OANDA:WTICO_USD',
  'ITX': 'BME:ITX',
}

function getFinnhubSymbol(ourSymbol: string): string {
  return FINNHUB_MAP[ourSymbol] ?? ourSymbol
}

// Fetch a single quote from Finnhub REST API
async function fetchQuote(ourSymbol: string): Promise<FinnhubQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return null

  const finnhubSym = getFinnhubSymbol(ourSymbol)

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSym)}&token=${apiKey}`,
      { next: { revalidate: 10 }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null

    const data = await res.json()
    if (!data.c || data.c === 0) return null

    return {
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
  } catch {
    return null
  }
}

// Fetch prices for the 21 main assets in batches to respect rate limit
export async function getMainPrices(): Promise<FinnhubQuote[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return getSimulatedPrices(MAIN_SYMBOLS)

  // Fetch in parallel — 21 calls is within the 60/min free limit
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
