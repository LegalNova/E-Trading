'use client'
import { useState } from 'react'
import { pathOf } from './Spark'

const W = 358

/**
 * Gráfico de línea con área suave. Con `tooltip`, al pasar el dedo o el ratón
 * aparece un cursor vertical con el valor y la fecha de ese punto.
 */
export function AreaChart({
  values,
  up,
  height = 150,
  label,
  tooltip,
}: {
  values: number[]
  up: boolean
  height?: number
  label: string
  tooltip?: (i: number) => { value: string; date: string }
}) {
  const [hover, setHover] = useState<number | null>(null)
  const color = up ? 'var(--green)' : 'var(--red)'
  const line = pathOf(values, W, height, 3, 0.01)
  const area = `${line} L${W} ${height} L0 ${height} Z`
  const n = values.length
  const tip = hover !== null && tooltip ? tooltip(hover) : null
  const x = hover !== null && n > 1 ? (hover * W) / (n - 1) : 0

  return (
    <div style={{ position: 'relative', height }}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        onPointerMove={tooltip ? e => {
          const r = e.currentTarget.getBoundingClientRect()
          const i = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (n - 1))
          if (i !== hover) setHover(i)
        } : undefined}
        onPointerLeave={tooltip ? () => setHover(null) : undefined}
        style={{ width: '100%', height, display: 'block', touchAction: tooltip ? 'pan-y' : undefined, cursor: tooltip ? 'crosshair' : undefined }}
      >
        <path d={area} fill={`color-mix(in srgb, ${color} 8%, transparent)`} />
        <path d={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {hover !== null && tooltip && (
          <line x1={x} x2={x} y1={0} y2={height} stroke="var(--text-tertiary)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {tip && (
        <div
          style={{
            position: 'absolute', top: -6, left: `${Math.min(Math.max((x / W) * 100, 16), 84)}%`, transform: 'translateX(-50%)',
            padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--surface-1)',
            boxShadow: 'var(--shadow)', display: 'flex', gap: 8, font: '500 12px var(--font)', fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}
        >
          <span>{tip.value}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{tip.date}</span>
        </div>
      )}
    </div>
  )
}
