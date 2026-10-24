// Indicadores técnicos calculados sobre las velas reales. Fórmulas estándar.
import type { CandleT } from '@/shared/contract'

export interface Pt {
  time: number
  value: number
}

export function sma(c: CandleT[], n: number): Pt[] {
  const out: Pt[] = []
  let sum = 0
  for (let i = 0; i < c.length; i++) {
    sum += c[i].c
    if (i >= n) sum -= c[i - n].c
    if (i >= n - 1) out.push({ time: c[i].t, value: sum / n })
  }
  return out
}

export function ema(c: CandleT[], n: number, src: (x: CandleT) => number = x => x.c): Pt[] {
  const out: Pt[] = []
  const k = 2 / (n + 1)
  let prev: number | null = null
  let seed = 0
  for (let i = 0; i < c.length; i++) {
    const v = src(c[i])
    if (i < n - 1) {
      seed += v
      continue
    }
    if (prev === null) prev = (seed + v) / n
    else prev = v * k + prev * (1 - k)
    out.push({ time: c[i].t, value: prev })
  }
  return out
}

/** Bandas de Bollinger (media de n y ±k desviaciones típicas) */
export function bollinger(c: CandleT[], n = 20, k = 2) {
  const mid: Pt[] = [], up: Pt[] = [], low: Pt[] = []
  for (let i = n - 1; i < c.length; i++) {
    const w = c.slice(i - n + 1, i + 1).map(x => x.c)
    const m = w.reduce((a, b) => a + b, 0) / n
    const sd = Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / n)
    mid.push({ time: c[i].t, value: m })
    up.push({ time: c[i].t, value: m + k * sd })
    low.push({ time: c[i].t, value: m - k * sd })
  }
  return { mid, up, low }
}

/** RSI de Wilder */
export function rsi(c: CandleT[], n = 14): Pt[] {
  const out: Pt[] = []
  let g = 0, l = 0
  for (let i = 1; i < c.length; i++) {
    const d = c[i].c - c[i - 1].c
    const up = Math.max(d, 0), dn = Math.max(-d, 0)
    if (i <= n) {
      g += up / n
      l += dn / n
      if (i === n) out.push({ time: c[i].t, value: l === 0 ? 100 : 100 - 100 / (1 + g / l) })
      continue
    }
    g = (g * (n - 1) + up) / n
    l = (l * (n - 1) + dn) / n
    out.push({ time: c[i].t, value: l === 0 ? 100 : 100 - 100 / (1 + g / l) })
  }
  return out
}

/** MACD (12, 26, 9): línea, señal e histograma */
export function macd(c: CandleT[], fast = 12, slow = 26, sig = 9) {
  const f = new Map(ema(c, fast).map(p => [p.time, p.value]))
  const line: Pt[] = ema(c, slow).map(p => ({ time: p.time, value: (f.get(p.time) ?? p.value) - p.value }))
  const asC = line.map(p => ({ t: p.time, o: p.value, h: p.value, l: p.value, c: p.value, v: 0 }))
  const signal = ema(asC, sig)
  const s = new Map(signal.map(p => [p.time, p.value]))
  const hist = line.filter(p => s.has(p.time)).map(p => ({ time: p.time, value: p.value - s.get(p.time)! }))
  return { line, signal, hist }
}

/** Velas Heikin Ashi (suavizan el ruido para ver la tendencia) */
export function heikinAshi(c: CandleT[]): CandleT[] {
  const out: CandleT[] = []
  for (let i = 0; i < c.length; i++) {
    const x = c[i]
    const close = (x.o + x.h + x.l + x.c) / 4
    const open = i === 0 ? (x.o + x.c) / 2 : (out[i - 1].o + out[i - 1].c) / 2
    out.push({ t: x.t, o: open, h: Math.max(x.h, open, close), l: Math.min(x.l, open, close), c: close, v: x.v })
  }
  return out
}
