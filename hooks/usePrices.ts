'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ASSETS, Asset } from '@/data/assets'
import { MAIN_SYMBOLS } from '@/lib/finnhub'

export interface PriceData {
  symbol: string
  price: number
  prevPrice: number
  change: number      // absoluto vs open/prevClose
  changePct: number   // %
  high: number
  low: number
  open: number
  volume: number
  timestamp: number
  direction: 'up' | 'down' | 'flat'
  source: 'live' | 'simulated'
}

type PriceMap = Record<string, PriceData>

// Set for O(1) lookup when deciding which symbols to simulate
const MAIN_SYMBOLS_SET = new Set(MAIN_SYMBOLS)

// Finnhub symbol mapping (client-side WebSocket)
const WS_SYMBOL_MAP: Record<string, string> = {
  'BTC': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT',
  'SOL': 'BINANCE:SOLUSDT',
  'BNB': 'BINANCE:BNBUSDT',
  'EURUSD': 'OANDA:EUR_USD',
  'GBPUSD': 'OANDA:GBP_USD',
  'USDJPY': 'OANDA:USD_JPY',
}

const REVERSE_WS_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(WS_SYMBOL_MAP).map(([k, v]) => [v, k])
)

function getWsSymbol(ourSymbol: string): string {
  return WS_SYMBOL_MAP[ourSymbol] ?? ourSymbol
}

function initPrices(): PriceMap {
  const map: PriceMap = {}
  for (const asset of ASSETS) {
    const price = asset.basePrice
    map[asset.symbol] = {
      symbol: asset.symbol,
      price,
      prevPrice: price,
      change: 0,
      changePct: 0,
      high: price,
      low: price,
      open: price,
      volume: 0,
      timestamp: 0,
      direction: 'flat',
      source: 'simulated',
    }
  }
  return map
}

// Very small zero-mean oscillation, clamped to ±0.5% of open price
// so the simulated price stays close to its real anchor.
function simulateTick(current: PriceData, _asset: Asset): PriceData {
  const vol = 0.0003 // very small — just a visible twitch
  const delta = (Math.random() - 0.5) * 2 * vol // pure oscillation, zero drift
  let newPrice = current.price * (1 + delta)

  // Clamp so it never drifts more than ±0.5% from open
  const anchor = current.open > 0 ? current.open : current.price
  const maxUp = anchor * 1.005
  const maxDown = anchor * 0.995
  if (newPrice > maxUp) newPrice = maxUp
  if (newPrice < maxDown) newPrice = maxDown
  if (newPrice < 0.0001) newPrice = 0.0001

  const absChange = newPrice - anchor
  const pctChange = anchor > 0 ? (absChange / anchor) * 100 : 0

  return {
    ...current,
    prevPrice: current.price,
    price: newPrice,
    change: absChange,
    changePct: pctChange,
    high: Math.max(current.high, newPrice),
    low: Math.min(current.low, newPrice),
    volume: current.volume + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    direction: newPrice > current.price ? 'up' : newPrice < current.price ? 'down' : 'flat',
    source: 'simulated',
  }
}

// Fetch real prices from our API (which calls Finnhub server-side)
async function fetchRealPrices(): Promise<PriceMap | null> {
  try {
    const res = await fetch('/api/market/quotes', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.quotes || data.source === 'simulated') return null

    const map: PriceMap = {}
    for (const q of data.quotes) {
      const asset = ASSETS.find(a => a.symbol === q.symbol)
      if (!asset) continue
      map[q.symbol] = {
        symbol: q.symbol,
        price: q.price,
        prevPrice: q.prevClose ?? q.price,
        change: q.change ?? 0,
        changePct: q.changePercent ?? 0,
        high: q.high ?? q.price,
        low: q.low ?? q.price,
        open: q.open ?? q.price,
        volume: q.volume ?? 0,
        timestamp: q.timestamp ?? Date.now(),
        direction: (q.change ?? 0) > 0 ? 'up' : (q.change ?? 0) < 0 ? 'down' : 'flat',
        source: 'live',
      }
    }
    return map
  } catch {
    return null
  }
}

export function usePrices(symbols?: string[]) {
  const [prices, setPrices] = useState<PriceMap>(initPrices)
  const [isLive, setIsLive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const targetSymbols = symbols ?? ASSETS.map(a => a.symbol)
  const targetAssets = ASSETS.filter(a => targetSymbols.includes(a.symbol))

  // Fetch real prices — always replace the price completely (real data wins)
  const loadRealPrices = useCallback(async () => {
    const real = await fetchRealPrices()
    if (!real) return

    setPrices(prev => {
      const updated = { ...prev }
      for (const [sym, data] of Object.entries(real)) {
        if (updated[sym]) {
          updated[sym] = { ...updated[sym], ...data }
        }
      }
      return updated
    })
    setIsLive(true)
  }, [])

  // Try Finnhub WebSocket for stocks (US market hours only)
  const connectWebSocket = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
    if (!apiKey) return

    try {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)
      wsRef.current = ws

      ws.onopen = () => {
        // Subscribe to US stocks (free plan: up to 50 subscriptions)
        const stockSymbols = targetAssets
          .filter(a => ['acciones-us', 'etfs'].includes(a.category))
          .slice(0, 40)
          .map(a => a.symbol)

        // Crypto via Binance feed
        const cryptoSymbols = targetAssets
          .filter(a => a.category === 'cripto')
          .slice(0, 10)
          .map(a => a.symbol)

        for (const sym of [...stockSymbols, ...cryptoSymbols]) {
          ws.send(JSON.stringify({ type: 'subscribe', symbol: getWsSymbol(sym) }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type !== 'trade' || !data.data?.length) return

          setPrices(prev => {
            const updated = { ...prev }
            for (const trade of data.data) {
              // Find our symbol by Finnhub symbol or reverse map
              const ourSym = REVERSE_WS_MAP[trade.s] ?? trade.s
              const current = updated[ourSym]
              if (!current) continue

              const newPrice = trade.p
              const absChange = newPrice - current.open
              const pctChange = current.open > 0 ? (absChange / current.open) * 100 : 0

              updated[ourSym] = {
                ...current,
                prevPrice: current.price,
                price: newPrice,
                change: absChange,
                changePct: pctChange,
                high: Math.max(current.high, newPrice),
                low: Math.min(current.low, newPrice),
                volume: current.volume + (trade.v ?? 0),
                timestamp: trade.t ?? Date.now(),
                direction: newPrice > current.price ? 'up' : newPrice < current.price ? 'down' : 'flat',
                source: 'live',
              }
            }
            return updated
          })
          setIsLive(true)
        } catch {
          // ignore parse errors
        }
      }

      ws.onerror = () => ws.close()
      ws.onclose = () => {
        wsRef.current = null
      }
    } catch {
      // WebSocket not supported or blocked
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    // 1. Load real prices immediately
    loadRealPrices()

    // 2. Try WebSocket for real-time updates
    connectWebSocket()

    // 3. Light simulation ONLY for non-main assets (those without real data).
    //    Main symbols always come from Finnhub or the WS — never simulated.
    intervalRef.current = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev }
        for (const asset of targetAssets) {
          const current = updated[asset.symbol]
          if (!current) continue
          // If the asset has real data from Finnhub, never overwrite it with sim.
          if (MAIN_SYMBOLS_SET.has(asset.symbol)) continue
          // Skip if WS just updated this symbol
          if (current.source === 'live' && Date.now() - current.timestamp < 3000) continue
          updated[asset.symbol] = simulateTick(current, asset)
        }
        return updated
      })
    }, 2000)

    // 4. Re-fetch REST prices every 10 seconds (server cache handles deduping).
    pollRef.current = setInterval(loadRealPrices, 10000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, []) // eslint-disable-line

  return {
    prices,
    priceList: Object.values(prices),
    isLive,
  }
}

export function formatPrice(price: number, symbol?: string): string {
  if (price >= 10000) return price.toLocaleString('es-ES', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('es-ES', { maximumFractionDigits: 2 })
  if (price >= 1) return price.toFixed(2)
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(8)
}
