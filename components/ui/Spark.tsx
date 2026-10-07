/** Camino SVG de una serie, normalizado al alto/ancho dados */
export function pathOf(values: number[], w: number, h: number, pad = 3, minRangeFrac = 0): string {
  if (values.length < 2) return `M0 ${h / 2} L${w} ${h / 2}`
  let mn = Math.min(...values)
  let mx = Math.max(...values)
  // Rango vertical mínimo: una variación diminuta no debe parecer un gran movimiento
  const minRange = Math.abs((mn + mx) / 2) * minRangeFrac
  if (mx - mn < minRange) {
    const mid = (mn + mx) / 2
    mn = mid - minRange / 2
    mx = mid + minRange / 2
  }
  const k = mx - mn
  return values
    .map((v, i) => `${i ? 'L' : 'M'}${((i * w) / (values.length - 1)).toFixed(1)} ${(k ? pad + (h - 2 * pad) * (1 - (v - mn) / k) : h / 2).toFixed(1)}`)
    .join(' ')
}

export function Spark({ values, up, w = 56, h = 24 }: { values: number[]; up: boolean; w?: number; h?: number }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ flex: 'none' }}>
      <path d={pathOf(values, w, h, 2)} fill="none" stroke={up ? 'var(--green)' : 'var(--red)'} strokeWidth={1.5} />
    </svg>
  )
}
