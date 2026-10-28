'use client'
// Gráfico de los ejercicios con datos reales: velas o línea, el futuro revelado (sombreado), líneas de entrada,
// stop y objetivo, tocar una vela o arrastrar un nivel de precio.
import { useRef } from 'react'

type Ohlc = [number, number, number, number]
export interface Line {
  price: number
  color: string
  label: string
  dashed?: boolean
}

export function ExerciseChart({
  candles, closes, future, futureCloses, lines = [], selected, state, onPickCandle, onPrice, height = 190, label,
}: {
  candles?: Ohlc[]
  closes?: number[]
  future?: Ohlc[]
  futureCloses?: number[]
  lines?: Line[]
  selected?: number | null
  state?: 'ok' | 'bad' | null
  onPickCandle?: (i: number) => void
  /** Arrastrar o tocar el gráfico devuelve el precio de esa altura */
  onPrice?: (price: number) => void
  height?: number
  label: string
}) {
  const W = 340
  const svg = useRef<SVGSVGElement>(null)
  const visN = candles?.length ?? closes?.length ?? 0
  const futN = future?.length ?? futureCloses?.length ?? 0
  const n = visN + futN
  const highs = [...(candles ?? []).map(c => c[1]), ...(future ?? []).map(c => c[1]), ...(closes ?? []), ...(futureCloses ?? []), ...lines.map(l => l.price)]
  const lows = [...(candles ?? []).map(c => c[2]), ...(future ?? []).map(c => c[2]), ...(closes ?? []), ...(futureCloses ?? []), ...lines.map(l => l.price)]
  const lo = Math.min(...lows)
  const hi = Math.max(...highs)
  const pad = (hi - lo) * 0.06 || 1
  const top = 8, bottom = height - 8
  const y = (v: number) => top + (bottom - top) * (1 - (v - (lo - pad)) / (hi - lo + 2 * pad))
  const priceAt = (py: number) => lo - pad + (1 - (py - top) / (bottom - top)) * (hi - lo + 2 * pad)
  const step = W / Math.max(n, 1)
  const bw = Math.max(2, Math.min(14, step * 0.6))
  const xOf = (i: number) => step * i + step / 2

  const pointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onPrice || !svg.current) return
    if (e.type === 'pointermove' && e.buttons === 0) return
    const r = svg.current.getBoundingClientRect()
    const py = ((e.clientY - r.top) / r.height) * height
    onPrice(priceAt(Math.min(bottom, Math.max(top, py))))
  }

  const drawCandles = (cs: Ohlc[], offset: number, dim: boolean) =>
    cs.map(([o, h, l, c], k) => {
      const i = k + offset
      const x = xOf(i)
      const col = c >= o ? 'var(--up)' : 'var(--down)'
      const ring = state === 'ok' ? 'var(--up)' : state === 'bad' ? 'var(--down)' : 'var(--brand)'
      return (
        <g key={i} opacity={dim ? 0.9 : 1} onClick={onPickCandle && !dim ? () => onPickCandle(i) : undefined} style={onPickCandle && !dim ? { cursor: 'pointer' } : undefined} role={onPickCandle && !dim ? 'button' : undefined} aria-label={onPickCandle && !dim ? `Vela ${i + 1}` : undefined} tabIndex={onPickCandle && !dim ? 0 : undefined} onKeyDown={onPickCandle && !dim ? e => (e.key === 'Enter' || e.key === ' ') && onPickCandle(i) : undefined}>
          {selected === i && <rect x={x - step / 2 + 1} y="2" width={step - 2} height={height - 4} rx="8" fill="none" stroke={ring} strokeWidth="2" />}
          {onPickCandle && !dim && <rect x={x - step / 2} y="0" width={step} height={height} fill="transparent" />}
          <line x1={x} x2={x} y1={y(h)} y2={y(l)} stroke={col} strokeWidth={n > 50 ? 1 : 1.6} />
          <rect x={x - bw / 2} y={y(Math.max(o, c))} width={bw} height={Math.max(1.5, Math.abs(y(o) - y(c)))} rx="1" fill={col} />
        </g>
      )
    })
  const path = (vals: number[], offset: number) => vals.map((v, k) => `${k ? 'L' : 'M'}${xOf(k + offset).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const lastVisible = closes?.[closes.length - 1] ?? candles?.[candles.length - 1]?.[3]

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${height}`}
      style={{ width: '100%', height: 'auto', touchAction: onPrice ? 'none' : undefined, cursor: onPrice ? 'ns-resize' : undefined }}
      role="img"
      aria-label={label}
      onPointerDown={onPrice ? pointer : undefined}
      onPointerMove={onPrice ? pointer : undefined}
    >
      {/* El futuro revelado, sombreado y separado */}
      {futN > 0 && (
        <>
          <rect x={step * visN} y="0" width={W - step * visN} height={height} fill="var(--brand)" opacity="0.07" />
          <line x1={step * visN} x2={step * visN} y1="0" y2={height} stroke="var(--brand)" strokeDasharray="4 4" strokeWidth="1.2" />
        </>
      )}
      {candles && drawCandles(candles, 0, false)}
      {future && drawCandles(future, visN, true)}
      {closes && <path d={path(closes, 0)} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />}
      {futureCloses && lastVisible !== undefined && <path d={path([lastVisible, ...futureCloses], visN - 1)} fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinejoin="round" />}
      {lines.map(l => (
        <g key={l.label}>
          <line x1="0" x2={W} y1={y(l.price)} y2={y(l.price)} stroke={l.color} strokeWidth="1.6" strokeDasharray={l.dashed ? '5 4' : undefined} />
          <rect x={W - 92} y={y(l.price) - 15} width="90" height="14" rx="4" fill={l.color} />
          <text x={W - 47} y={y(l.price) - 5} fontSize="9.5" fontWeight="700" fill="#fff" textAnchor="middle">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
