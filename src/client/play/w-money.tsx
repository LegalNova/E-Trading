'use client'
// Piezas del dinero: inflación, interés simple y compuesto, empezar antes o después, duplicar y rentabilidad real.
// Métricas que publica cada una (para el reto y Lumi) en el comentario de su función.
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { WidgetT } from '@/shared/play'
import { GlyphTile } from './glyph'
import { Bars, Big, Lines, Row, Slide, useFmt, useMetrics } from './kit'
import { growthPath } from './math'

type W<K extends WidgetT['kind']> = { w: Extract<WidgetT, { kind: K }>; onMetrics: (m: Record<string, number>) => void }

/** Métricas: years, rate, items (los que aún compras), itemsPct (poder de compra %), lost (€ de poder perdido) */
export function Basket({ w, onMetrics }: W<'basket'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [years, setYears] = useState(w.years)
  const [rate, setRate] = useState(w.rate)
  const k = (1 + rate / 100) ** years
  // Se compra en orden mientras llegue el dinero
  const can: ((typeof w.items)[number] & { p: number; ok: boolean })[] = []
  let left = w.money
  for (const it of w.items) {
    const p = it.price * k
    const ok = p <= left + 1e-9
    if (ok) left -= p
    can.push({ ...it, p, ok })
  }
  const items = can.filter(x => x.ok).length
  const real = w.money / k
  useMetrics({ years, rate, items, itemsPct: Math.round((real / w.money) * 100), lost: Math.round(w.money - real) }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('basketWith', { money: f.eur(w.money), years })}</span>
        <div className="grid grid-cols-3 gap-2">
          {can.map(x => (
            <div key={x.name} className="flex flex-col items-center rounded-2xl py-2 transition-all" style={{ background: x.ok ? 'color-mix(in srgb, var(--up) 10%, var(--surface))' : 'var(--surface-2)', opacity: x.ok ? 1 : 0.4 }}>
              <GlyphTile name={x.icon} size={40} color="var(--up)" muted={!x.ok} />
              <span className="t-cap mt-1 text-center">{x.name}</span>
              <b className="t-cap tabular-nums" style={{ color: x.ok ? 'var(--ink)' : 'var(--down)', textDecoration: x.ok ? undefined : 'line-through' }}>
                {f.eur(x.p, x.p < 10 ? 2 : 0)}
              </b>
            </div>
          ))}
        </div>
      </div>
      <Row>
        <Big label={t('youBuy')} value={`${items} / ${w.items.length}`} tone={items === w.items.length ? 'up' : 'down'} />
        <Big label={t('purchasingPower')} value={f.pct((real / w.money) * 100, 0)} tone={real / w.money > 0.9 ? 'up' : 'down'} />
      </Row>
      <Slide label={t('years')} value={years} min={0} max={w.maxYears} step={1} show={t('nYears', { n: years })} onChange={setYears} />
      {!w.lockRate && <Slide label={t('inflation')} value={rate} min={0} max={w.maxRate} step={0.5} show={f.pct(rate)} onChange={setRate} color="var(--down)" />}
    </div>
  )
}

/** Métricas: final, contributed, gain, multiple (final ÷ aportado), years, monthly, rate, initial, simpleFinal, mattressFinal */
export function Growth({ w, onMetrics }: W<'growth'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [v, setV] = useState({ initial: w.initial, monthly: w.monthly, rate: w.rate, years: w.years })
  const set = (k: keyof typeof v) => (n: number) => setV(s => ({ ...s, [k]: n }))
  const p = growthPath(v.initial, v.monthly, v.rate, v.years)
  const last = (a: number[]) => a[a.length - 1]
  const final = last(p[w.lines.includes('compound') ? 'compound' : w.lines.includes('simple') ? 'simple' : 'mattress'])
  const contributed = last(p.mattress)
  useMetrics(
    { final: Math.round(final), contributed: Math.round(contributed), gain: Math.round(final - contributed), multiple: Math.round((final / (contributed || 1)) * 10) / 10, years: v.years, monthly: v.monthly, rate: v.rate, initial: v.initial, simpleFinal: Math.round(last(p.simple)), mattressFinal: Math.round(contributed) },
    onMetrics,
  )
  const COL = { mattress: 'var(--ink-3)', simple: 'var(--amber)', compound: 'var(--up)' }
  const max = { initial: w.maxInitial, monthly: w.maxMonthly, rate: w.maxRate, years: w.maxYears }
  const step = { initial: w.maxInitial > 20000 ? 1000 : 100, monthly: 10, rate: 0.5, years: 1 }
  const show = (k: keyof typeof v) => (k === 'rate' ? f.pct(v.rate) : k === 'years' ? t('nYears', { n: v.years }) : f.eur(v[k]))
  return (
    <div className="flex flex-col gap-3">
      <div className="card">
        <Lines label={t('growthChart')} lines={w.lines.map(l => ({ values: p[l], color: COL[l], label: t(`line_${l}`), dashed: l === 'mattress' }))} />
      </div>
      <Row>
        <Big label={t('youPut')} value={f.eur(contributed)} />
        <Big label={t('youHave')} value={f.eur(final)} tone="up" />
      </Row>
      {w.lines.length > 1 && (
        <Bars rows={w.lines.map(l => ({ label: t(`line_${l}`), value: last(p[l]), show: f.eur(last(p[l])), color: COL[l] }))} />
      )}
      {w.controls.map(k => (
        <Slide key={k} label={t(`ctl_${k}`)} value={v[k]} min={k === 'years' ? 1 : 0} max={max[k]} step={step[k]} show={show(k)} onChange={set(k)} />
      ))}
    </div>
  )
}

/** Métricas: bAge, delay (años de retraso de B), ratio (A ÷ B), aFinal, bFinal, aPut, bPut */
export function Race({ w, onMetrics }: W<'race'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [bAge, setBAge] = useState(w.b.age)
  const yA = w.endAge - w.a.age
  const yB = Math.max(0, w.endAge - bAge)
  const pa = growthPath(0, w.monthly, w.rate, yA).compound
  const pb = growthPath(0, w.monthly, w.rate, yB).compound
  // Las dos líneas sobre la misma edad: B vale 0 hasta que empieza
  const lb = pa.map((_, i) => (i < yA - yB ? 0 : pb[i - (yA - yB)]))
  const aFinal = pa[pa.length - 1]
  const bFinal = pb[pb.length - 1] ?? 0
  const aPut = w.monthly * 12 * yA
  const bPut = w.monthly * 12 * yB
  useMetrics({ bAge, delay: bAge - w.a.age, ratio: Math.round((aFinal / (bFinal || 1)) * 10) / 10, aFinal: Math.round(aFinal), bFinal: Math.round(bFinal), aPut, bPut }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card">
        <Lines
          label={t('raceChart')}
          lines={[
            { values: pa, color: 'var(--up)', label: t('startsAt', { name: w.a.name, age: w.a.age }) },
            { values: lb, color: 'var(--brand)', label: t('startsAt', { name: w.b.name, age: bAge }) },
          ]}
        />
      </div>
      <Bars
        rows={[
          { label: t('raceRow', { name: w.a.name, put: f.eur(aPut) }), value: aFinal, show: f.eur(aFinal), color: 'var(--up)' },
          { label: t('raceRow', { name: w.b.name, put: f.eur(bPut) }), value: bFinal, show: f.eur(bFinal), color: 'var(--brand)' },
        ]}
      />
      <Slide label={t('whenStarts', { name: w.b.name })} value={bAge} min={w.a.age} max={w.maxAge} step={1} show={t('atAge', { n: bAge })} onChange={setBAge} />
      <p className="t-cap m-0">{t('raceNote', { monthly: f.eur(w.monthly), rate: f.pct(w.rate), end: w.endAge })}</p>
    </div>
  )
}

/** Métricas: rate, years (exacto, con 1 decimal), rule (72 ÷ rate), doublings40 (veces que se duplica en 40 años) */
export function Doubling({ w, onMetrics }: W<'doubling'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [rate, setRate] = useState(w.rate)
  const years = Math.log(2) / Math.log(1 + rate / 100)
  const rule = 72 / rate
  const times = Math.floor(40 / years)
  useMetrics({ rate, years: Math.round(years * 10) / 10, rule: Math.round(rule * 10) / 10, doublings40: times }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('in40', { amount: f.eur(w.amount) })}</span>
        {/* Cada barra es una duplicación: crece en altura y en intensidad */}
        <div className="flex h-[150px] items-end gap-1.5">
          {Array.from({ length: Math.min(times, 7) + 1 }, (_, i) => i).map((i, _, all) => (
            <div key={i} className="flex min-w-0 flex-1 animate-pop flex-col items-center justify-end gap-1" style={{ animationDelay: `${i * 40}ms` }}>
              <b className="t-cap whitespace-nowrap tabular-nums">{f.eur(w.amount * 2 ** i)}</b>
              <div className="w-full rounded-t-lg" style={{ height: `${18 + (i / Math.max(1, all.length - 1)) * 82}px`, background: `color-mix(in srgb, var(--up) ${35 + i * 9}%, var(--surface))`, transition: 'height .25s' }} />
              <span className="t-cap whitespace-nowrap">{i ? t('yearN', { n: Math.round(years * i) }) : t('today')}</span>
            </div>
          ))}
        </div>
      </div>
      <Row>
        <Big label={t('rule72')} value={t('nYears', { n: Math.round(rule * 10) / 10 })} tone="brand" />
        <Big label={t('exact')} value={t('nYears', { n: Math.round(years * 10) / 10 })} />
      </Row>
      <Slide label={t('ctl_rate')} value={rate} min={1} max={w.maxRate} step={1} show={f.pct(rate, 0)} onChange={setRate} />
    </div>
  )
}

/** Métricas: nominal, inflation, real (% anual, 1 decimal), value (lo que compran al final, en euros de hoy), balance */
export function RealRate({ w, onMetrics }: W<'realrate'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [nominal, setNominal] = useState(w.nominal)
  const [inflation, setInflation] = useState(w.inflation)
  const real = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100
  const bal = Array.from({ length: w.years + 1 }, (_, y) => w.amount * (1 + nominal / 100) ** y)
  const val = bal.map((b, y) => b / (1 + inflation / 100) ** y)
  useMetrics({ nominal, inflation, real: Math.round(real * 10) / 10, value: Math.round(val[w.years]), balance: Math.round(bal[w.years]) }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card">
        <Lines
          label={t('realChart')}
          lines={[
            { values: bal, color: 'var(--ink-3)', label: t('inAccount'), dashed: true },
            { values: val, color: real >= 0 ? 'var(--up)' : 'var(--down)', label: t('whatItBuys') },
          ]}
        />
      </div>
      <Row>
        <Big label={t('inAccountIn', { n: w.years })} value={f.eur(bal[w.years])} />
        <Big label={t('whatItBuys')} value={f.eur(val[w.years])} tone={real >= 0 ? 'up' : 'down'} />
      </Row>
      <Big label={t('realReturn')} value={`${real >= 0 ? '+' : ''}${f.pct(real)}`} tone={real >= 0 ? 'up' : 'down'} small />
      <Slide label={t('accountPays')} value={nominal} min={0} max={w.maxNominal} step={0.25} show={f.pct(nominal, 2)} onChange={setNominal} color="var(--up)" />
      <Slide label={t('inflation')} value={inflation} min={0} max={w.maxInflation} step={0.25} show={f.pct(inflation, 2)} onChange={setInflation} color="var(--down)" />
    </div>
  )
}
