'use client'
import { useCallback, useEffect, useState } from 'react'

export interface PortfolioPosition {
  symbol: string
  name: string
  category: string | null
  currency: string
  shares: number
  avgPrice: number
  price: number
  changePct: number
  valueEur: number
  costEur: number
  pnlEur: number
  pnlPct: number
}

export interface PortfolioTrade {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  name: string
  shares: number
  price: number
  currency: string
  totalEur: number
  pnlEur: number | null
  executedAt: string
}

export interface PortfolioData {
  total: number
  cash: number
  invested: number
  pnlEur: number
  pnlPct: number
  todayEur: number
  todayPct: number
  allocation: { label: string; valueEur: number; pct: number; color: string }[]
  positions: PortfolioPosition[]
  history: { date: string; value: number }[]
  trades: PortfolioTrade[]
}

let cache: PortfolioData | null = null

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(cache)
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' })
      if (!res.ok) throw new Error(res.status === 401 ? 'Inicia sesión para ver tu portafolio' : 'No se pudo cargar el portafolio')
      const json = (await res.json()) as PortfolioData
      cache = json
      setData(json)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
