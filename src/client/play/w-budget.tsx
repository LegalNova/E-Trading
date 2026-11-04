'use client'
// Piezas del presupuesto: clasificar, repartir el sueldo, gastos hormiga, un año con imprevistos y objetivos.
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import type { WidgetT } from '@/shared/play'
import { Toggle } from '../ui/kit'
import { Big, Row, Slide, useFmt, useMetrics } from './kit'

type W<K extends WidgetT['kind']> = { w: Extract<WidgetT, { kind: K }>; onMetrics: (m: Record<string, number>) => void }

/** Métricas: done (tarjetas colocadas), cards (total), correct, wrong, net (suma con signo de lo bien colocado) */
export function Sort({ w, onMetrics }: W<'sort'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [picks, setPicks] = useState<number[]>([])
  const i = picks.length
  const card = w.cards[i]
  const last = i > 0 ? { c: w.cards[i - 1], ok: picks[i - 1] === w.cards[i - 1].bin } : null
  const correct = picks.filter((p, k) => p === w.cards[k].bin).length
  const net = picks.reduce((s, _, k) => s + (w.cards[k].value ?? 0) * (w.bins[w.cards[k].bin].sign ?? 1), 0)
  useMetrics({ done: i, cards: w.cards.length, correct, wrong: i - correct, net }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      {card ? (
        <div key={i} className="card flex animate-pop flex-col items-center gap-1 py-5 text-center">
          <span className="text-[44px] leading-none">{card.emoji}</span>
          <b className="t-head">{card.label}</b>
          {card.value !== undefined && <span className="t-body tabular-nums">{f.eur(card.value)}</span>}
          <span className="t-cap">
            {i + 1} / {w.cards.length}
          </span>
        </div>
      ) : (
        <div className="card animate-pop py-4 text-center">
          <b className="t-head">{t('sortDone', { ok: correct, n: w.cards.length })}</b>
        </div>
      )}
      {last && (
        <div key={`f${i}`} className="animate-rise rounded-2xl px-3.5 py-2.5" style={{ background: `color-mix(in srgb, var(--${last.ok ? 'up' : 'down'}) 11%, var(--surface))` }} aria-live="polite">
          <b className={last.ok ? 'up' : 'down'}>
            {last.c.emoji} {last.ok ? t('right') : t('notQuite', { bin: w.bins[last.c.bin].label })}
          </b>
          <p className="t-foot m-0 mt-0.5" style={{ color: 'var(--ink)' }}>
            {last.c.why}
          </p>
        </div>
      )}
      <div className={`grid gap-2 ${w.bins.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {w.bins.map((b, k) => {
          const sum = picks.reduce((s, p, j) => s + (p === k && w.cards[j].bin === k ? (w.cards[j].value ?? 0) : 0), 0)
          return (
            <button key={b.label} className="btn btn-secondary flex h-auto min-h-[64px] flex-col gap-0.5 py-2" disabled={!card} onClick={() => setPicks([...picks, k])}>
              <span className="text-[14px] leading-tight">{b.label}</span>
              {w.cards.some(c => c.value !== undefined) && <span className="t-cap tabular-nums">{f.eur(sum)}</span>}
            </button>
          )
        })}
      </div>
      {w.sumLabel && i > 0 && <Big label={w.sumLabel} value={f.eur(net)} tone={net >= 0 ? 'up' : 'down'} small />}
      {!card && (
        <button className="btn btn-plain" onClick={() => setPicks([])}>
          {t('again')}
        </button>
      )}
    </div>
  )
}

/** Métricas: needsPct, wantsPct, savePct (lo que sobra), offTarget (mayor desvío frente al objetivo, en puntos), left (€ que sobran) */
export function Budget({ w, onMetrics }: W<'budget'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [amt, setAmt] = useState(w.cats.map(c => c.amount))
  const sum = (g: number) => w.cats.reduce((s, c, k) => s + (c.group === g ? amt[k] : 0), 0)
  const needs = sum(0)
  const wants = sum(1)
  const left = w.salary - needs - wants
  const pcts = [needs, wants, left].map(v => (v / w.salary) * 100)
  const off = Math.max(...pcts.map((p, k) => Math.abs(p - w.targets[k])))
  useMetrics({ needsPct: Math.round(pcts[0]), wantsPct: Math.round(pcts[1]), savePct: Math.round(pcts[2]), offTarget: Math.round(off), left: Math.round(left) }, onMetrics)
  const COL = ['var(--brand)', 'var(--amber)', 'var(--up)']
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('salaryOf', { salary: f.eur(w.salary) })}</span>
        <div className="relative flex h-7 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
          {pcts.map((p, k) => (
            <div key={k} style={{ width: `${Math.max(0, p)}%`, background: left < 0 && k === 2 ? 'var(--down)' : COL[k], transition: 'width .25s ease' }} />
          ))}
          {[w.targets[0], w.targets[0] + w.targets[1]].map(x => (
            <i key={x} className="absolute top-0 h-full w-[2px]" style={{ left: `${x}%`, background: 'var(--ink)' }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {w.groups.map((g, k) => (
            <div key={g} className="flex flex-col">
              <span className="t-cap flex items-center gap-1">
                <i className="inline-block h-2 w-2 rounded-full" style={{ background: COL[k] }} />
                {g}
              </span>
              <b className="tabular-nums" style={{ color: k === 2 && left < 0 ? 'var(--down)' : 'var(--ink)' }}>
                {f.pct(pcts[k], 0)}
              </b>
              <span className="t-cap">{t('target', { n: w.targets[k] })}</span>
            </div>
          ))}
        </div>
      </div>
      {left < 0 && <p className="t-foot down m-0 font-bold">{t('overspend', { n: f.eur(-left) })}</p>}
      {w.cats.map((c, k) => (
        <Slide key={c.label} label={`${c.emoji} ${c.label}`} value={amt[k]} min={c.min} max={c.max} step={10} show={f.eur(amt[k])} color={COL[c.group]} onChange={v => setAmt(a => a.map((x, j) => (j === k ? v : x)))} />
      ))}
    </div>
  )
}

const PER = { day: 365, week: 52, month: 12 }

/** Métricas: yearly (gasto al año de lo encendido), cut (€ al año que has quitado), invested (lo quitado, invertido N años), on */
export function Leaks({ w, onMetrics }: W<'leaks'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [on, setOn] = useState(w.items.map(i => i.on))
  const year = (k: number) => w.items[k].amount * PER[w.items[k].per]
  const yearly = on.reduce((s, x, k) => s + (x ? year(k) : 0), 0)
  const start = w.items.reduce((s, it, k) => s + (it.on ? year(k) : 0), 0)
  const cut = Math.max(0, start - yearly)
  const rm = (1 + w.rate / 100) ** (1 / 12) - 1
  const n = w.years * 12
  const invested = rm ? (cut / 12) * (((1 + rm) ** n - 1) / rm) : cut * w.years
  useMetrics({ yearly: Math.round(yearly), cut: Math.round(cut), invested: Math.round(invested), on: on.filter(Boolean).length }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col divide-y" style={{ borderColor: 'var(--line)' }}>
        {w.items.map((it, k) => (
          <div key={it.name} className="flex items-center gap-3 py-2">
            <span className="text-[26px]">{it.emoji}</span>
            <span className="flex flex-1 flex-col">
              <b className="t-body">{it.name}</b>
              <span className="t-cap">
                {t(`per_${it.per}`, { amount: f.eur(it.amount, it.amount % 1 ? 2 : 0) })} · {t('perYear', { amount: f.eur(year(k)) })}
              </span>
            </span>
            <Toggle checked={on[k]} label={it.name} onChange={v => setOn(o => o.map((x, j) => (j === k ? v : x)))} />
          </div>
        ))}
      </div>
      <Row>
        <Big label={t('spendYear')} value={f.eur(yearly)} tone="down" />
        <Big label={t('cutYear')} value={f.eur(cut)} tone="up" />
      </Row>
      <Big label={t('ifInvested', { years: w.years, rate: f.pct(w.rate, 0) })} value={f.eur(invested)} tone="brand" />
    </div>
  )
}

/** Métricas: save, played (1 al terminar el año), fund (colchón final), debt (deuda final), covered (imprevistos pagados sin deber) */
export function Emergency({ w, onMetrics }: W<'emergency'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [save, setSave] = useState(0)
  const [month, setMonth] = useState(0) // 0 = sin empezar, 1..12 = mes mostrado
  // Simulación completa (determinista): el colchón paga los imprevistos y, si no llega, se pide prestado con la tarjeta
  const sim: { fund: number; debt: number; hit?: (typeof w.events)[number]; paid: boolean }[] = []
  let fund = w.start
  let debt = 0
  for (let m = 1; m <= 12; m++) {
    debt *= 1 + w.loanRate / 100 / 12
    fund += save
    const hit = w.events.find(e => e.month === m)
    let paid = true
    if (hit) {
      const fromFund = Math.min(fund, hit.cost)
      fund -= fromFund
      if (fromFund < hit.cost) {
        debt += hit.cost - fromFund
        paid = false
      }
    }
    sim.push({ fund, debt, hit, paid })
  }
  useEffect(() => {
    if (month === 0 || month >= 12) return
    const id = setTimeout(() => setMonth(m => m + 1), 650)
    return () => clearTimeout(id)
  }, [month])
  const cur = month ? sim[month - 1] : { fund: w.start, debt: 0, paid: true }
  const done = month >= 12
  const covered = sim.slice(0, month).filter(s => s.hit && s.paid).length
  useMetrics({ save, played: done ? 1 : 0, fund: Math.round(done ? sim[11].fund : cur.fund), debt: Math.round(done ? sim[11].debt : cur.debt), covered }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('emergencyHead', { salary: f.eur(w.salary), spend: f.eur(w.spend) })}</span>
        <div className="grid grid-cols-6 gap-1.5">
          {sim.map((s, k) => {
            const seen = k < month
            return (
              <div key={k} className="flex aspect-square flex-col items-center justify-center rounded-xl text-center transition-all" style={{ background: !seen ? 'var(--surface-2)' : s.hit ? `color-mix(in srgb, var(--${s.paid ? 'up' : 'down'}) 18%, var(--surface))` : 'color-mix(in srgb, var(--brand) 8%, var(--surface))', outline: k === month - 1 ? '2px solid var(--ink)' : undefined }}>
                <span className="text-[18px] leading-none">{seen && s.hit ? s.hit.emoji : seen ? '·' : ''}</span>
                <span className="t-cap">{t('monthShort', { n: k + 1 })}</span>
              </div>
            )
          })}
        </div>
        {month > 0 && sim[month - 1].hit && (
          <p key={month} className="t-foot m-0 animate-rise" style={{ color: 'var(--ink)' }}>
            {sim[month - 1].hit!.emoji} {sim[month - 1].hit!.text} (<b>{f.eur(sim[month - 1].hit!.cost)}</b>) · {sim[month - 1].paid ? t('paidFund') : t('paidCard')}
          </p>
        )}
      </div>
      <Row>
        <Big label={t('fund')} value={f.eur(cur.fund)} tone="up" />
        <Big label={t('cardDebt')} value={f.eur(cur.debt)} tone={cur.debt > 0 ? 'down' : undefined} />
      </Row>
      <Slide label={t('saveMonthly')} value={save} min={0} max={w.maxSave} step={10} show={f.eur(save)} onChange={v => (setSave(v), setMonth(0))} />
      <button className="btn btn-primary" disabled={month > 0 && !done} onClick={() => setMonth(1)}>
        {done ? t('replayYear') : t('playYear')}
      </button>
    </div>
  )
}

/** Métricas: needed (€ al mes para todos), available, fits (1 si cabe), slack (available − needed) */
export function GoalPlan({ w, onMetrics }: W<'goalplan'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [months, setMonths] = useState(w.goals.map(g => g.months))
  const per = w.goals.map((g, k) => g.amount / months[k])
  const needed = per.reduce((s, x) => s + x, 0)
  const fits = needed <= w.available + 0.5
  useMetrics({ needed: Math.round(needed), available: w.available, fits: fits ? 1 : 0, slack: Math.round(w.available - needed) }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      {w.goals.map((g, k) => (
        <div key={g.label} className="card flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[26px]">{g.emoji}</span>
            <span className="flex flex-1 flex-col">
              <b className="t-body">{g.label}</b>
              <span className="t-cap">{f.eur(g.amount)}</span>
            </span>
            <b className="tabular-nums">{t('perMonth', { amount: f.eur(per[k]) })}</b>
          </div>
          <Slide label={t('inMonths')} value={months[k]} min={1} max={w.maxMonths} step={1} show={t('nMonths', { n: months[k] })} onChange={v => setMonths(m => m.map((x, j) => (j === k ? v : x)))} />
        </div>
      ))}
      <Row>
        <Big label={t('needMonthly')} value={f.eur(needed)} tone={fits ? 'up' : 'down'} />
        <Big label={t('canSave')} value={f.eur(w.available)} />
      </Row>
    </div>
  )
}
