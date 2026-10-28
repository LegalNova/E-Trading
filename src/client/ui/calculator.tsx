'use client'
// Calculadoras interactivas de la teoría: el alumno mueve los deslizadores y ve el resultado al momento.
// Todo se calcula aquí con fórmulas estándar; no hay datos de mercado.
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useLang } from '../hooks'

export type CalcKind = 'compound' | 'inflation' | 'rule72' | 'position' | 'recovery' | 'fees' | 'dca' | 'budget' | 'loan'

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  const locale = useLang()
  return (
    <label className="flex flex-col gap-1">
      <span className="t-foot flex justify-between" style={{ color: 'var(--ink)' }}>
        <span>{label}</span>
        <b className="tabular-nums">
          {value.toLocaleString(locale, { maximumFractionDigits: 2 })} {unit}
        </b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--brand)' }} />
    </label>
  )
}

function Result({ rows }: { rows: [string, string, boolean?][] }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl px-3.5 py-2.5" style={{ background: 'color-mix(in srgb, var(--brand) 9%, var(--surface))' }}>
      {rows.map(([k, v, big]) => (
        <div key={k} className="flex items-baseline justify-between gap-2">
          <span className="t-foot">{k}</span>
          <b className={`tabular-nums ${big ? 'text-[22px]' : ''}`} style={big ? { color: 'var(--brand)' } : undefined}>
            {v}
          </b>
        </div>
      ))}
    </div>
  )
}

export function Calculator({ kind }: { kind: CalcKind }) {
  const t = useTranslations('calc')
  const locale = useLang()
  const eur = (v: number) => `${Math.round(v).toLocaleString(locale)} €`
  const pct = (v: number) => `${v.toLocaleString(locale, { maximumFractionDigits: 1 })} %`
  const [a, setA] = useState<Record<string, number>>({})
  const v = (k: string, d: number) => a[k] ?? d
  const set = (k: string) => (n: number) => setA(s => ({ ...s, [k]: n }))

  let body: React.ReactNode
  switch (kind) {
    case 'compound': {
      const p = v('p', 1000), m = v('m', 100), r = v('r', 7) / 100, y = v('y', 20)
      const rm = r / 12, n = y * 12
      const fv = p * (1 + rm) ** n + (rm ? m * (((1 + rm) ** n - 1) / rm) : m * n)
      const put = p + m * n
      body = (
        <>
          <Slider label={t('initial')} value={p} min={0} max={20000} step={100} unit="€" onChange={set('p')} />
          <Slider label={t('monthly')} value={m} min={0} max={1000} step={10} unit="€" onChange={set('m')} />
          <Slider label={t('rate')} value={r * 100} min={0} max={12} step={0.5} unit="%" onChange={set('r')} />
          <Slider label={t('years')} value={y} min={1} max={45} step={1} unit={t('yrs')} onChange={set('y')} />
          <Result rows={[[t('final'), eur(fv), true], [t('contributed'), eur(put)], [t('interest'), eur(fv - put)]]} />
        </>
      )
      break
    }
    case 'inflation': {
      const x = v('x', 10000), i = v('i', 3) / 100, y = v('y', 10)
      const real = x / (1 + i) ** y
      body = (
        <>
          <Slider label={t('amount')} value={x} min={1000} max={50000} step={500} unit="€" onChange={set('x')} />
          <Slider label={t('inflation')} value={i * 100} min={0} max={10} step={0.5} unit="%" onChange={set('i')} />
          <Slider label={t('years')} value={y} min={1} max={40} step={1} unit={t('yrs')} onChange={set('y')} />
          <Result rows={[[t('realValue'), eur(real), true], [t('lost'), `${eur(x - real)} (${pct((1 - real / x) * 100)})`]]} />
        </>
      )
      break
    }
    case 'rule72': {
      const r = v('r', 6)
      body = (
        <>
          <Slider label={t('rate')} value={r} min={1} max={15} step={0.5} unit="%" onChange={set('r')} />
          <Result rows={[[t('rule72Years'), `${(72 / r).toLocaleString(locale, { maximumFractionDigits: 1 })} ${t('yrs')}`, true], [t('exactYears'), `${(Math.log(2) / Math.log(1 + r / 100)).toLocaleString(locale, { maximumFractionDigits: 1 })} ${t('yrs')}`]]} />
        </>
      )
      break
    }
    case 'position': {
      const c = v('c', 10000), rk = v('rk', 1), e = v('e', 50), sp = v('sp', 5)
      const stop = e * (1 - sp / 100)
      const risk = (c * rk) / 100
      const shares = risk / (e - stop)
      body = (
        <>
          <Slider label={t('capital')} value={c} min={1000} max={50000} step={500} unit="€" onChange={set('c')} />
          <Slider label={t('riskPct')} value={rk} min={0.25} max={5} step={0.25} unit="%" onChange={set('rk')} />
          <Slider label={t('entryPrice')} value={e} min={5} max={500} step={1} unit="€" onChange={set('e')} />
          <Slider label={t('stopDistance')} value={sp} min={1} max={20} step={0.5} unit="%" onChange={set('sp')} />
          <Result rows={[[t('positionSize'), eur(shares * e), true], [t('shares'), shares.toLocaleString(locale, { maximumFractionDigits: 1 })], [t('maxLoss'), eur(risk)], [t('weight'), pct(((shares * e) / c) * 100)]]} />
        </>
      )
      break
    }
    case 'recovery': {
      const l = v('l', 30)
      body = (
        <>
          <Slider label={t('loss')} value={l} min={5} max={90} step={5} unit="%" onChange={set('l')} />
          <Result rows={[[t('needed'), pct((1 / (1 - l / 100) - 1) * 100), true]]} />
        </>
      )
      break
    }
    case 'fees': {
      const x = v('x', 10000), r = v('r', 7) / 100, f1 = v('f1', 0.2) / 100, f2 = v('f2', 1.8) / 100, y = v('y', 30)
      const a1 = x * (1 + r - f1) ** y, a2 = x * (1 + r - f2) ** y
      body = (
        <>
          <Slider label={t('amount')} value={x} min={1000} max={50000} step={500} unit="€" onChange={set('x')} />
          <Slider label={t('rate')} value={r * 100} min={2} max={10} step={0.5} unit="%" onChange={set('r')} />
          <Slider label={t('cheapFee')} value={f1 * 100} min={0} max={1} step={0.05} unit="%" onChange={set('f1')} />
          <Slider label={t('expensiveFee')} value={f2 * 100} min={0.5} max={3} step={0.1} unit="%" onChange={set('f2')} />
          <Slider label={t('years')} value={y} min={5} max={40} step={1} unit={t('yrs')} onChange={set('y')} />
          <Result rows={[[t('cheap'), eur(a1)], [t('expensive'), eur(a2)], [t('difference'), eur(a1 - a2), true]]} />
        </>
      )
      break
    }
    case 'dca': {
      const m = v('m', 100), y = v('y', 15), r = v('r', 7) / 100
      const rm = r / 12, n = y * 12
      const fv = rm ? m * (((1 + rm) ** n - 1) / rm) : m * n
      body = (
        <>
          <Slider label={t('monthly')} value={m} min={10} max={1000} step={10} unit="€" onChange={set('m')} />
          <Slider label={t('rate')} value={r * 100} min={0} max={12} step={0.5} unit="%" onChange={set('r')} />
          <Slider label={t('years')} value={y} min={1} max={40} step={1} unit={t('yrs')} onChange={set('y')} />
          <Result rows={[[t('final'), eur(fv), true], [t('contributed'), eur(m * n)]]} />
        </>
      )
      break
    }
    case 'budget': {
      const inc = v('inc', 1500)
      body = (
        <>
          <Slider label={t('income')} value={inc} min={600} max={5000} step={50} unit="€" onChange={set('inc')} />
          <Result rows={[[t('needs'), eur(inc * 0.5)], [t('wants'), eur(inc * 0.3)], [t('savings'), eur(inc * 0.2), true]]} />
        </>
      )
      break
    }
    case 'loan': {
      const x = v('x', 10000), i = v('i', 8), y = v('y', 5)
      const r = i / 100 / 12, n = y * 12
      const pay = r ? (x * r) / (1 - (1 + r) ** -n) : x / n
      body = (
        <>
          <Slider label={t('borrowed')} value={x} min={1000} max={50000} step={500} unit="€" onChange={set('x')} />
          <Slider label={t('tin')} value={i} min={0} max={30} step={0.5} unit="%" onChange={set('i')} />
          <Slider label={t('years')} value={y} min={1} max={10} step={1} unit={t('yrs')} onChange={set('y')} />
          <Result rows={[[t('payment'), eur(pay), true], [t('totalInterest'), eur(pay * n - x)]]} />
        </>
      )
      break
    }
  }
  return <div className="card flex flex-col gap-3">{body}</div>
}
