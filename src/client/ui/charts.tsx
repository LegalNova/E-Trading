'use client'
// Gráficas en SVG sin librerías: línea (con lectura al tocar), velas, sparkline y anillo.
import { useId, useMemo, useState } from 'react'

function pathOf(vals: number[], w: number, h: number, pad = 3) {
  if (vals.length < 2) return ''
  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const k = mx - mn
  // Serie plana: línea centrada
  return vals.map((v, i) => `${i ? 'L' : 'M'}${((i * w) / (vals.length - 1)).toFixed(1)} ${(pad + (h - 2 * pad) * (k ? 1 - (v - mn) / k : 0.5)).toFixed(1)}`).join(' ')
}

export function Sparkline({ values, up, width = 56, height = 22 }: { values: number[]; up: boolean; width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ flex: 'none' }}>
      <path d={pathOf(values, width, height, 2)} fill="none" stroke={up ? 'var(--up)' : 'var(--down)'} strokeWidth="1.6" />
    </svg>
  )
}

/** Línea a todo el ancho con área y lectura del valor al pasar el dedo */
export function LineChart({ values, up, height = 170, fill = true, label, format }: { values: number[]; up: boolean; height?: number; fill?: boolean; label: string; format?: (v: number, i: number) => string }) {
  const W = 340
  const [hover, setHover] = useState<number | null>(null)
  const d = useMemo(() => pathOf(values, W, height, 6), [values, height])
  const color = up ? 'var(--up)' : 'var(--down)'
  const mn = Math.min(...values)
  const mx = Math.max(...values)
  const y = (v: number) => 6 + (height - 12) * (1 - (v - mn) / (mx - mn || 1))
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / r.width) * (values.length - 1))
    setHover(Math.max(0, Math.min(values.length - 1, i)))
  }
  return (
    <div className="relative">
      {format && hover !== null && (
        <div className="t-cap absolute left-1/2 -top-1 -translate-x-1/2 rounded-full px-2 py-0.5 font-bold" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          {format(values[hover], hover)}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, touchAction: 'pan-y' }} role="img" aria-label={label} onPointerMove={format ? onMove : undefined} onPointerLeave={() => setHover(null)}>
        {fill && <path d={`${d} L${W} ${height} L0 ${height} Z`} fill={`color-mix(in srgb, ${color} 10%, transparent)`} />}
        <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {hover !== null && (
          <>
            <line x1={(hover * W) / (values.length - 1)} x2={(hover * W) / (values.length - 1)} y1="0" y2={height} stroke="var(--ink-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={(hover * W) / (values.length - 1)} cy={y(values[hover])} r="4" fill={color} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    </div>
  )
}

export function CandleChart({ candles, height = 170, label, selected, state, onPick }: { candles: { o: number; h: number; l: number; c: number }[]; height?: number; label: string; selected?: number | null; state?: 'ok' | 'bad' | null; onPick?: (i: number) => void }) {
  const W = 340
  const n = candles.length
  const lo = Math.min(...candles.map(c => c.l))
  const hi = Math.max(...candles.map(c => c.h))
  const pad = (hi - lo) * 0.05 || 1
  const y = (v: number) => 8 + (height - 16) * (1 - (v - (lo - pad)) / (hi - lo + 2 * pad))
  const step = W / n
  const bw = Math.max(2, Math.min(18, step * 0.55))
  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label={label}>
      {candles.map((c, i) => {
        const x = step * i + step / 2
        const col = c.c >= c.o ? 'var(--up)' : 'var(--down)'
        const ringCol = state === 'ok' ? 'var(--up)' : state === 'bad' ? 'var(--down)' : 'var(--brand)'
        return (
          <g key={i} onClick={onPick ? () => onPick(i) : undefined} style={onPick ? { cursor: 'pointer' } : undefined} role={onPick ? 'button' : undefined} aria-label={onPick ? `Vela ${i + 1}` : undefined} tabIndex={onPick ? 0 : undefined} onKeyDown={onPick ? e => (e.key === 'Enter' || e.key === ' ') && onPick(i) : undefined}>
            {selected === i && <rect x={x - step / 2 + 2} y="2" width={step - 4} height={height - 4} rx="10" fill="none" stroke={ringCol} strokeWidth="2" />}
            {onPick && <rect x={x - step / 2} y="0" width={step} height={height} fill="transparent" />}
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={n > 40 ? 1.2 : 2} />
            <rect x={x - bw / 2} y={y(Math.max(c.o, c.c))} width={bw} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx="1.5" fill={col} />
          </g>
        )
      })}
    </svg>
  )
}

/** Gráfico para preguntas de quiz (línea neutra; opcionalmente se puede tocar un punto) */
export function QuizChart({ values, picked, solution, onPick }: { values: number[]; picked?: number | null; solution?: number | null; onPick?: (i: number) => void }) {
  const W = 300
  const H = 130
  const mn = Math.min(...values)
  const mx = Math.max(...values)
  const pt = (v: number, i: number) => [(i * (W - 16)) / (values.length - 1) + 8, 10 + (H - 20) * (1 - (v - mn) / (mx - mn || 1))]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Gráfico de la pregunta">
      <path d={values.map((v, i) => (i ? 'L' : 'M') + pt(v, i).join(' ')).join(' ')} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
      {onPick &&
        values.map((v, i) => {
          const [x, y] = pt(v, i)
          const isSol = solution === i
          const isPick = picked === i
          return (
            <g key={i} onClick={() => onPick(i)} style={{ cursor: 'pointer' }}>
              <rect x={x - 11} y="0" width="22" height={H} fill="transparent" />
              <circle cx={x} cy={y} r={isPick || isSol ? 7 : 4} fill={isSol ? 'var(--up)' : isPick ? (solution != null ? 'var(--down)' : 'var(--brand)') : 'var(--ink-3)'} />
            </g>
          )
        })}
    </svg>
  )
}

export function Donut({ parts, size = 120 }: { parts: { value: number; color: string; label: string }[]; size?: number }) {
  const id = useId()
  const total = parts.reduce((t, p) => t + p.value, 0) || 1
  const r = 15.9155
  const pcts = parts.map(p => (p.value / total) * 100)
  const starts = pcts.map((_, i) => pcts.slice(0, i).reduce((a, b) => a + b, 0))
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" role="img" aria-labelledby={id} style={{ flex: 'none' }}>
      <title id={id}>{parts.map((p, i) => `${p.label} ${Math.round(pcts[i])} %`).join(', ')}</title>
      <circle cx="21" cy="21" r={r} fill="none" stroke="var(--fill)" strokeWidth="6" />
      {parts.map((p, i) => (
        <circle key={i} cx="21" cy="21" r={r} fill="none" stroke={p.color} strokeWidth="6" strokeDasharray={`${Math.max(0, pcts[i] - 0.6)} ${100 - pcts[i] + 0.6}`} strokeDashoffset={25 - starts[i]} />
      ))}
    </svg>
  )
}
