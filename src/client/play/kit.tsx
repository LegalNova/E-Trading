'use client'
// Piezas comunes de las clases interactivas: deslizador grande, cifra destacada, gráfico de varias líneas y formatos.
import { useEffect, useRef } from 'react'
import { useLang } from '../hooks'

export function useFmt() {
  const locale = useLang()
  // Con decimales, siempre los dos (2,50 €, no 2,5 €); los enteros, sin ellos
  // Como el resto de la app: separador de miles siempre (6.038 €, no 6038 €)
  const n = (v: number, d = 0) => v.toLocaleString(locale, { maximumFractionDigits: d, minimumFractionDigits: d && Math.abs(v % 1) > 0.004 ? d : 0, useGrouping: 'always' } as Intl.NumberFormatOptions)
  // Igual que el resto de la app: «€1,250» en inglés y «1.250 €» en español y catalán
  const eur = (v: number, d = 0) => (locale === 'en' ? `${v < 0 ? '−' : ''}€${n(Math.abs(v), d)}` : `${v < 0 ? '−' : ''}${n(Math.abs(v), d)} €`)
  /** Precios: siempre con sus decimales (10,00 · 9,98) */
  const price = (v: number, d = 2) => v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' } as Intl.NumberFormatOptions)
  const pct = (v: number, d = 1) => `${v < 0 ? '−' : ''}${n(Math.abs(v), d)} %`
  return { n, eur, pct, price, locale }
}

/** Avisa a la pantalla de las métricas actuales cada vez que cambian */
export function useMetrics(m: Record<string, number>, onMetrics: (m: Record<string, number>) => void) {
  const key = JSON.stringify(m)
  const cb = useRef(onMetrics)
  useEffect(() => {
    cb.current = onMetrics
  })
  useEffect(() => {
    cb.current(JSON.parse(key))
  }, [key])
}

export function Slide({ label, value, min, max, step, show, onChange, color = 'var(--brand)' }: { label: React.ReactNode; value: number; min: number; max: number; step: number; show: string; onChange: (v: number) => void; color?: string }) {
  const pct = ((value - min) / (max - min || 1)) * 100
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-foot flex items-baseline justify-between" style={{ color: 'var(--ink)' }}>
        <span>{label}</span>
        <b className="tabular-nums text-[17px]" style={{ color }}>
          {show}
        </b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="play-range w-full"
        style={{ accentColor: color, background: `linear-gradient(90deg, ${color} ${pct}%, var(--fill) ${pct}%)` }}
      />
    </label>
  )
}

/** Cifra grande con su etiqueta */
export function Big({ label, value, tone, small }: { label: string; value: string; tone?: 'up' | 'down' | 'brand'; small?: boolean }) {
  const color = tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : tone === 'brand' ? 'var(--brand)' : 'var(--ink)'
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-2xl px-3 py-2" style={{ background: 'var(--surface-2)' }}>
      <span className="t-cap truncate">{label}</span>
      <b className={`tabular-nums leading-tight ${small ? 'text-[16px]' : 'text-[22px]'}`} style={{ color }}>
        {value}
      </b>
    </div>
  )
}

export const Row = ({ children }: { children: React.ReactNode }) => <div className="flex gap-2">{children}</div>

export interface Line {
  values: number[]
  color: string
  label: string
  dashed?: boolean
}

/** Varias líneas sobre el mismo eje (empiezan en el mismo punto) con leyenda */
export function Lines({ lines, height = 150, label, marks, length, domain }: { lines: Line[]; height?: number; label: string; marks?: { at: number; color: string }[]; length?: number; domain?: [number, number] }) {
  const W = 340
  const all = lines.flatMap(l => l.values)
  // Eje fijo (domain, length) para las series que se van dibujando poco a poco
  const mn = domain ? domain[0] : Math.min(0, ...all)
  const mx = domain ? domain[1] : Math.max(...all, 1)
  const len = length ?? Math.max(...lines.map(l => l.values.length), 2)
  const x = (i: number) => (i * W) / (len - 1)
  const y = (v: number) => 4 + (height - 8) * (1 - (v - mn) / (mx - mn || 1))
  return (
    <div className="flex flex-col gap-1.5">
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }} role="img" aria-label={label}>
        {mn < 0 && <line x1="0" x2={W} y1={y(0)} y2={y(0)} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        {marks?.map((m, i) => <line key={i} x1={x(m.at)} x2={x(m.at)} y1="0" y2={height} stroke={m.color} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />)}
        {lines.map(l => (
          <path
            key={l.label}
            d={l.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={l.color}
            strokeWidth="2.5"
            strokeDasharray={l.dashed ? '5 4' : undefined}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ transition: 'd .25s ease' }}
          />
        ))}
      </svg>
      {lines.length > 1 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {lines.map(l => (
            <span key={l.label} className="t-cap flex items-center gap-1.5">
              <i className="inline-block h-[3px] w-3.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Barras horizontales comparables (p. ej. aportado frente a final) */
export function Bars({ rows }: { rows: { label: string; value: number; show: string; color: string }[] }) {
  const mx = Math.max(...rows.map(r => Math.abs(r.value)), 1)
  return (
    <div className="flex flex-col gap-2">
      {rows.map(r => (
        <div key={r.label} className="flex flex-col gap-0.5">
          <span className="t-cap flex justify-between">
            <span>{r.label}</span>
            <b className="tabular-nums" style={{ color: 'var(--ink)' }}>
              {r.show}
            </b>
          </span>
          <div className="h-3 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
            <div className="h-full rounded-full" style={{ width: `${(Math.abs(r.value) / mx) * 100}%`, background: r.color, transition: 'width .3s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Generador pseudoaleatorio con semilla (las simulaciones salen igual para todos) */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
