'use client'
import { useEffect, useState, useCallback } from 'react'

export interface Position {
  id: string
  symbol: string
  shares: number
  avg_price: number
  opened_at: string
}

export interface Trade {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  shares: number
  price: number
  total: number
  executed_at: string
}

export interface PortfolioData {
  cash: number
  positions: Position[]
  trades: Trade[]
}

type RawPosition = {
  id: string
  symbol: string
  shares: string | number
  avg_price: string | number
  opened_at: string
}

type RawTrade = {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  shares: string | number
  price: string | number
  total: string | number
  executed_at: string
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/portfolio', { cache: 'no-store' })
      if (!res.ok) throw new Error('Error al cargar portfolio')
      const json = await res.json()
      setData({
        cash: Number(json.portfolio?.cash ?? 10000),
        positions: (json.positions ?? []).map((p: RawPosition) => ({
          id: p.id,
          symbol: p.symbol,
          shares: Number(p.shares),
          avg_price: Number(p.avg_price),
          opened_at: p.opened_at,
        })),
        trades: (json.trades ?? []).map((t: RawTrade) => ({
          id: t.id,
          type: t.type,
          symbol: t.symbol,
          shares: Number(t.shares),
          price: Number(t.price),
          total: Number(t.total),
          executed_at: t.executed_at,
        })),
      })
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
