import type { CSSProperties } from 'react'

// Estilos base del sistema de diseño (radios 6/4/2, bordes de 1 px)
export const card: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--surface-1)',
}

const btnBase: CSSProperties = {
  height: 48,
  border: 'none',
  borderRadius: 4,
  font: '600 17px var(--font)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 20px',
  transition: 'opacity 150ms ease-out',
}

export const btnPrimary: CSSProperties = { ...btnBase, background: 'var(--green)', color: 'var(--on-green)' }
export const btnDanger: CSSProperties = { ...btnBase, background: 'var(--red)', color: 'var(--on-red)' }
export const btnSecondary: CSSProperties = {
  ...btnBase,
  height: 44,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-primary)',
}
export const btnDisabled: CSSProperties = { ...btnBase, background: 'var(--surface-2)', color: 'var(--text-tertiary)', cursor: 'not-allowed' }
export const btnText: CSSProperties = {
  border: 'none',
  background: 'none',
  padding: '4px 0',
  color: 'var(--blue)',
  font: '500 15px var(--font)',
  cursor: 'pointer',
}

export const input: CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 12px',
  border: '1px solid var(--border)',
  borderRadius: 4,
  background: 'var(--surface-2)',
  color: 'var(--text-primary)',
  font: '400 17px var(--font)',
  outline: 'none',
}

export const h1: CSSProperties = { margin: 0, font: '700 34px/41px var(--font)', letterSpacing: '-0.02em' }
export const h2: CSSProperties = { margin: 0, font: '600 22px/28px var(--font)' }
export const label13: CSSProperties = { font: '400 13px var(--font)', color: 'var(--text-secondary)' }
export const sectionLabel: CSSProperties = { font: '600 13px var(--font)', color: 'var(--text-secondary)' }

export function chip(up: boolean): CSSProperties {
  const c = up ? 'var(--green)' : 'var(--red)'
  return {
    font: '500 12px var(--font)',
    padding: '2px 6px',
    borderRadius: 2,
    color: c,
    background: `color-mix(in srgb, ${c} 12%, transparent)`,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  }
}

export const tag: CSSProperties = {
  font: '500 12px var(--font)',
  padding: '2px 6px',
  borderRadius: 2,
  background: 'var(--surface-2)',
  color: 'var(--text-secondary)',
}

export function bar(pct: number, color = 'var(--green)'): { track: CSSProperties; fill: CSSProperties } {
  return {
    track: { height: 4, background: 'var(--surface-2)' },
    fill: { display: 'block', height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, background: color, transition: 'width 300ms ease-out' },
  }
}
