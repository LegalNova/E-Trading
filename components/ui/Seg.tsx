'use client'

/** Control segmentado (1D · 1S · 1M…, Comprar | Vender…) */
export function Seg<T extends string>({
  options,
  value,
  onChange,
  height = 32,
  label,
  render,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  height?: number
  label?: string
  render?: (v: T) => React.ReactNode
}) {
  return (
    <div role="tablist" aria-label={label} style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 4, padding: 2, gap: 2 }}>
      {options.map(o => {
        const on = o === value
        return (
          <button
            key={o}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o)}
            style={{
              flex: 1, height, border: 'none', borderRadius: 3, cursor: 'pointer',
              font: `${height > 32 ? 600 : 500} ${height > 32 ? 15 : 13}px var(--font)`,
              background: on ? 'var(--surface-1)' : 'transparent',
              color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: on ? '0 0 0 1px var(--border)' : 'none',
              transition: 'background 150ms ease-out, color 150ms ease-out',
            }}
          >
            {render ? render(o) : o}
          </button>
        )
      })}
    </div>
  )
}
