'use client'
import { useEffect, useMemo, useState } from 'react'
import { ASSET_BY_SYMBOL } from '@/data/assets'
import { syntheticQuote } from '@/lib/sim'
import { eurPer, FxTable } from '@/lib/fx'

export interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
  volume: number
  simulated: boolean
  base?: number
  currency: string
  /** precio de una unidad en euros */
  priceEur: number
}

type RawQuote = Omit<Quote, 'currency' | 'priceEur'>

// Caché de módulo: al cambiar de pantalla no se vuelve a ver todo vacío
let cache: Record<string, RawQuote> = {}
let fxCache: FxTable = {}

const POLL_MS = 15_000
const TICK_MS = 5_000

function enrich(q: RawQuote, fx: FxTable): Quote {
  const currency = ASSET_BY_SYMBOL[q.symbol]?.currency ?? 'USD'
  return { ...q, currency, priceEur: q.price * eurPer(currency, fx) }
}

/**
 * Cotizaciones del servidor (precio real o simulado determinista).
 * Sin `symbols` carga todo el catálogo.
 */
export function useQuotes(symbols?: string[]) {
  const key = symbols ? symbols.join(',') : '*'
  const [raw, setRaw] = useState<Record<string, RawQuote>>(cache)
  const [fx, setFx] = useState<FxTable>(fxCache)
  const [loaded, setLoaded] = useState(() => (symbols ?? []).every(s => !!cache[s]) && Object.keys(cache).length > 0)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const url = symbols ? `/api/market/quotes?symbols=${encodeURIComponent(key)}` : '/api/market/quotes'
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { quotes: RawQuote[]; fx: FxTable }
        cache = { ...cache, ...Object.fromEntries(data.quotes.map(q => [q.symbol, q])) }
        fxCache = data.fx
        if (alive) {
          setRaw(cache)
          setFx(data.fx)
          setLoaded(true)
        }
      } catch {
        // sin red: se mantienen los últimos valores
      }
    }
    load()
    const poll = setInterval(load, POLL_MS)

    // Los precios simulados avanzan entre consultas (misma fórmula que el servidor)
    const tick = setInterval(() => {
      const next = { ...cache }
      let changed = false
      for (const [s, q] of Object.entries(cache)) {
        if (!q.simulated) continue
        const base = q.base ?? ASSET_BY_SYMBOL[s]?.basePrice
        if (!base) continue
        next[s] = { ...syntheticQuote(s, base), simulated: true, base }
        changed = true
      }
      if (changed && alive) {
        cache = next
        setRaw(next)
      }
    }, TICK_MS)

    return () => {
      alive = false
      clearInterval(poll)
      clearInterval(tick)
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const quotes = useMemo(() => {
    const out: Record<string, Quote> = {}
    for (const [s, q] of Object.entries(raw)) out[s] = enrich(q, fx)
    return out
  }, [raw, fx])

  return { quotes, fx, loaded }
}
