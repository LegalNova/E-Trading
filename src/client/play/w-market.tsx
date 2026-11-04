'use client'
// Piezas de mercado. Horizonte y crisis usan SERIES REALES (charts.json, con su pie); la de cara o cruz es una
// simulación matemática y lo dice.
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import type { WidgetT } from '@/shared/play'
import { Big, Lines, Row, Slide, rng, useFmt, useMetrics } from './kit'

type W<K extends WidgetT['kind']> = { w: Extract<WidgetT, { kind: K }>; onMetrics: (m: Record<string, number>) => void }

/** Métricas: years, windows (periodos comparados), lossPct (% de periodos con pérdida), worst y best (% total) */
export function Horizon({ w, onMetrics }: W<'horizon'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [years, setYears] = useState(w.years)
  const c = w.series.closes
  const rets = useMemo(() => {
    const out: number[] = []
    const n = years * 12
    for (let i = 0; i + n < c.length; i++) out.push((c[i + n] / c[i] - 1) * 100)
    return out
  }, [c, years])
  const losers = rets.filter(r => r < 0).length
  const lossPct = rets.length ? (losers / rets.length) * 100 : 0
  const worst = Math.min(...rets)
  const best = Math.max(...rets)
  useMetrics({ years, windows: rets.length, lossPct: Math.round(lossPct * 10) / 10, worst: Math.round(worst), best: Math.round(best) }, onMetrics)
  // Histograma: cuántos periodos acabaron en cada tramo de resultado
  const lo = Math.min(worst, -1)
  const hi = Math.max(best, 1)
  const B = 18
  const bins = Array.from({ length: B }, () => 0)
  for (const r of rets) bins[Math.min(B - 1, Math.floor(((r - lo) / (hi - lo)) * B))]++
  const mx = Math.max(...bins, 1)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('horizonHead', { years, n: rets.length })}</span>
        <div className="flex h-[110px] items-end gap-[3px]">
          {bins.map((b, k) => {
            const mid = lo + ((k + 0.5) / B) * (hi - lo)
            return <div key={k} className="flex-1 rounded-t" style={{ height: `${(b / mx) * 100}%`, minHeight: b ? 3 : 0, background: mid < 0 ? 'var(--down)' : 'var(--up)', transition: 'height .25s' }} />
          })}
        </div>
        <div className="t-cap flex justify-between tabular-nums">
          <span>{f.pct(lo, 0)}</span>
          <span>0 %</span>
          <span>+{f.pct(hi, 0)}</span>
        </div>
        <span className="t-cap">{w.series.caption}</span>
      </div>
      <Row>
        <Big label={t('lossPeriods')} value={f.pct(lossPct, 1)} tone={lossPct > 0 ? 'down' : 'up'} />
        <Big label={t('worstCase')} value={`${worst >= 0 ? '+' : ''}${f.pct(worst, 0)}`} tone={worst < 0 ? 'down' : 'up'} />
      </Row>
      <Slide label={t('holdFor')} value={years} min={1} max={w.maxYears} step={1} show={t('nYears', { n: years })} onChange={setYears} />
    </div>
  )
}

/** Métricas: played (1 al terminar), sold (1 si vendiste), drop (% desde el inicio, negativo), final (tu resultado €), hold (si no hubieras vendido €), soldDrop */
export function Crash({ w, onMetrics }: W<'crash'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const c = w.series.closes
  const [i, setI] = useState(0)
  const [run, setRun] = useState(false)
  const [soldAt, setSoldAt] = useState<number | null>(null)
  useEffect(() => {
    if (!run || i >= c.length - 1) return
    const id = setTimeout(() => setI(x => x + 1), 70)
    return () => clearTimeout(id)
  }, [run, i, c.length])
  const done = i >= c.length - 1
  const val = (k: number) => (w.amount * c[k]) / c[0]
  const mine = soldAt !== null ? val(soldAt) : val(i)
  const drop = (c[i] / c[0] - 1) * 100
  useMetrics(
    { played: done ? 1 : 0, sold: soldAt !== null ? 1 : 0, drop: Math.round(drop), final: Math.round(done ? mine : 0), hold: Math.round(val(c.length - 1)), soldDrop: soldAt !== null ? Math.round((c[soldAt] / c[0] - 1) * 100) : 0 },
    onMetrics,
  )
  const shown = c.slice(0, i + 1).map((_, k) => val(k))
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="t-cap">{w.series.dates[i]}</span>
          <b className={`tabular-nums ${drop < 0 ? 'down' : 'up'}`}>
            {drop >= 0 ? '+' : ''}
            {f.pct(drop, 1)}
          </b>
        </div>
        <Lines
          label={t('crashChart')}
          height={150}
          length={c.length}
          domain={[(w.amount * Math.min(...c)) / c[0] * 0.95, (w.amount * Math.max(...c)) / c[0] * 1.02]}
          lines={[{ values: shown, color: drop < 0 ? 'var(--down)' : 'var(--up)', label: w.series.caption }]}
          marks={soldAt !== null ? [{ at: soldAt, color: 'var(--ink)' }] : undefined}
        />
        <span className="t-cap">{w.series.caption}</span>
      </div>
      <Row>
        <Big label={soldAt !== null ? t('yourCash') : t('yourInvestment')} value={f.eur(mine)} tone={mine >= w.amount ? 'up' : 'down'} />
        {soldAt !== null && <Big label={t('ifHeld')} value={f.eur(val(i))} tone={val(i) >= w.amount ? 'up' : 'down'} />}
      </Row>
      {done ? (
        <div className="card animate-pop flex flex-col gap-1" style={{ background: 'color-mix(in srgb, var(--brand) 9%, var(--surface))' }}>
          <b>{soldAt !== null ? t('crashSold', { at: w.series.dates[soldAt], cash: f.eur(mine), hold: f.eur(val(i)) }) : t('crashHeld', { end: f.eur(mine), date: w.series.dates[i] })}</b>
          <button className="btn btn-plain" onClick={() => (setI(0), setSoldAt(null), setRun(false))}>
            {t('again')}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setRun(r => !r)}>
            {run ? t('pause') : i ? t('resume') : t('startCrash')}
          </button>
          <button className="btn btn-danger" disabled={!i || soldAt !== null} onClick={() => setSoldAt(i)}>
            {t('sellAll')}
          </button>
        </div>
      )}
    </div>
  )
}

/** Métricas: trades, losersPct (% que acaba perdiendo), avg (resultado medio €), best (€) */
export function Coinflip({ w, onMetrics }: W<'coinflip'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [trades, setTrades] = useState(w.trades)
  const res = useMemo(() => {
    const r = rng(1234)
    return Array.from({ length: w.traders }, () => {
      let pnl = 0
      for (let k = 0; k < trades; k++) pnl += (r() < 0.5 ? w.stake * w.win : -w.stake) - w.fee
      return pnl
    })
  }, [trades, w])
  const losers = res.filter(x => x < 0).length
  const avg = res.reduce((s, x) => s + x, 0) / res.length
  const best = Math.max(...res)
  useMetrics({ trades, losersPct: Math.round((losers / res.length) * 100), avg: Math.round(avg), best: Math.round(best) }, onMetrics)
  const lo = Math.min(...res)
  const B = 20
  const bins = Array.from({ length: B }, () => 0)
  for (const x of res) bins[Math.min(B - 1, Math.floor(((x - lo) / (best - lo || 1)) * B))]++
  const mx = Math.max(...bins, 1)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('coinHead', { n: f.n(w.traders), stake: f.eur(w.stake), fee: f.eur(w.fee, 2) })}</span>
        <div className="flex h-[110px] items-end gap-[3px]">
          {bins.map((b, k) => {
            const mid = lo + ((k + 0.5) / B) * (best - lo)
            return <div key={k} className="flex-1 rounded-t" style={{ height: `${(b / mx) * 100}%`, minHeight: b ? 3 : 0, background: mid < 0 ? 'var(--down)' : 'var(--up)', transition: 'height .25s' }} />
          })}
        </div>
        <div className="t-cap flex justify-between tabular-nums">
          <span>{f.eur(lo)}</span>
          <span>{f.eur(best)}</span>
        </div>
        <span className="t-cap">{t('coinNote')}</span>
      </div>
      <Row>
        <Big label={t('losers')} value={f.pct((losers / res.length) * 100, 0)} tone="down" />
        <Big label={t('average')} value={f.eur(avg)} tone={avg < 0 ? 'down' : 'up'} />
      </Row>
      <Slide label={t('tradesEach')} value={trades} min={1} max={w.maxTrades} step={1} show={f.n(trades)} onChange={setTrades} />
    </div>
  )
}
