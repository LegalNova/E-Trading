'use client'
// Piezas de deudas: préstamo con TAE, tarjeta revolving y varias deudas (bola de nieve o avalancha).
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { WidgetT } from '@/shared/play'
import { Seg } from '../ui/kit'
import { Glyph, GlyphTile } from './glyph'
import { Big, Lines, Row, Slide, useFmt, useMetrics } from './kit'
import { payDebts, payment, tae } from './math'

type W<K extends WidgetT['kind']> = { w: Extract<WidgetT, { kind: K }>; onMetrics: (m: Record<string, number>) => void }

/** Métricas: amount, tin, months, payment, interest (intereses + comisión), total, tae */
export function Loan({ w, onMetrics }: W<'loan'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [v, setV] = useState({ amount: w.amount, tin: w.tin, months: w.months })
  const set = (k: keyof typeof v) => (n: number) => setV(s => ({ ...s, [k]: n }))
  const fee = (v.amount * w.fee) / 100
  const pay = payment(v.amount, v.tin, v.months)
  const total = pay * v.months + fee
  const T = tae(v.amount, fee, pay, v.months)
  useMetrics({ amount: v.amount, tin: v.tin, months: v.months, payment: Math.round(pay * 100) / 100, interest: Math.round(total - v.amount), total: Math.round(total), tae: Math.round(T * 100) / 100 }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <div className="flex h-6 overflow-hidden rounded-full">
          <div style={{ width: `${(v.amount / total) * 100}%`, background: 'var(--brand)', transition: 'width .25s' }} />
          <div style={{ flex: 1, background: 'var(--down)' }} />
        </div>
        <div className="flex justify-between">
          <span className="t-cap">
            <i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: 'var(--brand)' }} />
            {t('borrowed')} {f.eur(v.amount)}
          </span>
          <span className="t-cap">
            <i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: 'var(--down)' }} />
            {t('costOf')} {f.eur(total - v.amount)}
          </span>
        </div>
      </div>
      <Row>
        <Big label={t('monthlyPay')} value={f.eur(pay, 2)} />
        <Big label={t('payTotal')} value={f.eur(total)} tone="down" />
      </Row>
      <Row>
        <Big label="TIN" value={f.pct(v.tin, 2)} small />
        <Big label={t('taeWithFee', { fee: f.pct(w.fee, 1) })} value={f.pct(T, 2)} tone="down" small />
      </Row>
      <Slide label={t('borrowed')} value={v.amount} min={500} max={w.maxAmount} step={500} show={f.eur(v.amount)} onChange={set('amount')} />
      <Slide label="TIN" value={v.tin} min={0} max={w.maxTin} step={0.5} show={f.pct(v.tin)} onChange={set('tin')} color="var(--down)" />
      <Slide label={t('term')} value={v.months} min={6} max={w.maxMonths} step={6} show={t('nMonths', { n: v.months })} onChange={set('months')} />
    </div>
  )
}

/** Métricas: payment, months (999 si nunca se acaba), interest, total */
export function Revolving({ w, onMetrics }: W<'revolving'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [pay, setPay] = useState(w.payment)
  const r = w.apr / 100 / 12
  const path = [w.debt]
  let bal = w.debt
  let paid = 0
  let m = 0
  while (bal > 0.01 && m < 600) {
    bal = bal * (1 + r)
    const p = Math.min(pay, bal)
    bal -= p
    paid += p
    m++
    if (m % 3 === 0) path.push(bal)
    if (pay <= w.debt * r) break
  }
  const never = pay <= w.debt * r
  if (bal <= 0.01) path.push(0)
  const months = never ? 999 : m
  useMetrics({ payment: pay, months, interest: Math.round(never ? 99999 : paid - w.debt), total: Math.round(paid) }, onMetrics)
  const yrs = Math.floor(months / 12)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1">
        <span className="t-cap">{t('cardDebtOf', { debt: f.eur(w.debt), apr: f.pct(w.apr, 1) })}</span>
        <Lines label={t('debtChart')} lines={[{ values: never ? [w.debt, w.debt * 1.02, w.debt * 1.04] : path, color: 'var(--down)', label: t('cardDebt') }]} height={120} />
      </div>
      <Row>
        <Big label={t('timeToPay')} value={never ? t('never') : yrs ? t('yearsMonths', { y: yrs, m: months % 12 }) : t('nMonths', { n: months })} tone="down" />
        <Big label={t('interestPaid')} value={never ? '∞' : f.eur(paid - w.debt)} tone="down" />
      </Row>
      <Slide label={t('payEachMonth')} value={pay} min={w.minPayment} max={w.maxPayment} step={5} show={f.eur(pay)} onChange={setPay} />
    </div>
  )
}

/** Métricas: method (0 bola de nieve, 1 avalancha), extra, months, interest, saved (intereses que ahorras frente al otro método), firstPaid (mes en que liquidas la primera) */
export function Debts({ w, onMetrics }: W<'debts'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [method, setMethod] = useState<'snowball' | 'avalanche'>('snowball')
  const [extra, setExtra] = useState(w.extra)
  const p = payDebts(w.debts, extra, method)
  const o = payDebts(w.debts, extra, method === 'snowball' ? 'avalanche' : 'snowball')
  useMetrics({ method: method === 'snowball' ? 0 : 1, extra, months: p.months, interest: Math.round(p.interest), saved: Math.round(o.interest - p.interest), firstPaid: p.order[0]?.at ?? 0 }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <Seg label={t('method')} value={method} onChange={setMethod} options={[{ value: 'snowball', label: <span className="inline-flex items-center gap-1.5"><Glyph name="snowflake" size={15} />{t('snowball')}</span> }, { value: 'avalanche', label: <span className="inline-flex items-center gap-1.5"><Glyph name="mountain" size={15} />{t('avalanche')}</span> }]} />
      <div className="card flex flex-col gap-2">
        {w.debts.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <GlyphTile name={d.icon} size={36} color="var(--down)" />
            <span className="flex flex-1 flex-col">
              <b className="t-foot" style={{ color: 'var(--ink)' }}>
                {d.name}
              </b>
              <span className="t-cap">
                {f.eur(d.balance)} · {f.pct(d.rate, 1)} · {t('minPay', { n: f.eur(d.min) })}
              </span>
            </span>
            <span className="t-cap rounded-full px-2 py-0.5 font-bold" style={{ background: 'var(--surface-2)' }}>
              {t('paidInMonth', { n: p.order.find(x => x.name === d.name)?.at ?? 0 })}
            </span>
          </div>
        ))}
        <div className="flex gap-1 pt-1">
          {p.order.map((x, k) => (
            <span key={x.name} className="t-cap animate-pop rounded-full px-2 py-0.5" style={{ background: 'color-mix(in srgb, var(--up) 14%, var(--surface))', animationDelay: `${k * 80}ms` }}>
              {k + 1}. {x.name}
            </span>
          ))}
        </div>
      </div>
      <Row>
        <Big label={t('debtFreeIn')} value={t('nMonths', { n: p.months })} />
        <Big label={t('interestPaid')} value={f.eur(p.interest)} tone="down" />
      </Row>
      <p className="t-foot m-0" style={{ color: 'var(--ink)' }}>
        {o.interest > p.interest + 1 ? t('cheaperThan', { n: f.eur(o.interest - p.interest) }) : o.interest + 1 < p.interest ? t('dearerThan', { n: f.eur(p.interest - o.interest) }) : t('sameCost')}
      </p>
      <Slide label={t('extraMonthly')} value={extra} min={0} max={w.maxExtra} step={10} show={f.eur(extra)} onChange={setExtra} />
    </div>
  )
}
