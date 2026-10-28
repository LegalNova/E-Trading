'use client'
// Ejercicios dinámicos del quiz (docs/curso-v2/03-ejercicios.md): emparejar, clasificar, gráficos reales
// (toca la vela, ¿sube o baja?, coloca el stop, simula la operación), escenarios, chat con Lumi, cálculo,
// cartera y detectar la estafa. La solución nunca está en el móvil: llega al responder (`reveal`).
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { AnswerResultT, QuestionT } from '@/shared/contract'
import { useLang, useMe } from '../hooks'
import { ExerciseChart, type Line } from '../ui/exercise-chart'
import { Icon } from '../ui/icons'
import { Lumi, stageOf } from '../ui/lumi'

export type Value = number | number[] | string | null
const PAIR_COLORS = ['#0A84FF', '#FF9F0A', '#BF5AF2', '#30D158', '#FF375F', '#64D2FF', '#FFD60A', '#AC8E68']

export const DYNAMIC = new Set(['MATCH', 'BUCKETS', 'CHART_CANDLE', 'UP_DOWN', 'PLACE_LEVEL', 'SIM_TRADE', 'SCENARIO', 'NUMBER', 'PORTFOLIO', 'SPOT', 'CHAT'])

/** ¿Está lista la respuesta para comprobarla? */
export function isAnswered(q: QuestionT, v: Value): boolean {
  if (q.type === 'MATCH' || q.type === 'BUCKETS') return Array.isArray(v) && v.length === q.options.length && v.every(x => x >= 0)
  if (q.type === 'PORTFOLIO') return Array.isArray(v) && Math.round(v.reduce((a, b) => a + b, 0)) === 100
  if (q.type === 'SIM_TRADE') return Array.isArray(v) && v[0] > 0
  if (Array.isArray(v)) return v.length > 0
  return v !== null && v !== '' && !(typeof v === 'number' && Number.isNaN(v))
}

const optClass = (reveal: AnswerResultT | null, isCorrect: boolean, isPicked: boolean) => (!reveal ? '' : isCorrect ? 'ok' : isPicked ? 'bad' : 'dim')

export function DynamicExercise({ q, value, onChange, reveal }: { q: QuestionT; value: Value; onChange: (v: Value) => void; reveal: AnswerResultT | null }) {
  const t = useTranslations('quiz')
  const locale = useLang()
  const { data: me } = useMe()
  const locked = !!reveal
  const sol = reveal?.correctAnswer
  const fmt = (v: number) => v.toLocaleString(locale, { maximumFractionDigits: v >= 100 ? 2 : 4 })
  const eur = (v: number) => `${v.toLocaleString(locale, { maximumFractionDigits: 0 })} €`
  const [active, setActive] = useState<number | null>(null)

  // Lo que pasó de verdad, debajo del gráfico
  const outcome = reveal?.reveal?.outcome && <p className="t-foot m-0 px-1" style={{ color: 'var(--ink)' }}>{reveal.reveal.outcome}</p>

  switch (q.type) {
    case 'MATCH': {
      const v = Array.isArray(value) && value.length === q.options.length ? value : q.options.map(() => -1)
      const s = Array.isArray(sol) ? sol : []
      const right = q.right ?? []
      const pairOf = (r: number) => v.indexOf(r)
      return (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-2">
            {q.options.map((o, i) => {
              const c = v[i] >= 0 ? PAIR_COLORS[i % PAIR_COLORS.length] : undefined
              const wrong = reveal && v[i] !== s[i]
              return (
                <button key={i} className={`opt min-h-[52px] text-[14px] ${reveal ? (wrong ? 'bad' : 'ok') : ''}`} disabled={locked} aria-pressed={active === i} onClick={() => setActive(active === i ? null : i)} style={!reveal && (active === i || c) ? { borderColor: c ?? 'var(--brand)', borderWidth: 2 } : undefined}>
                  {c && <i className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: c }} />}
                  {o}
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-2">
            {right.map((r, j) => {
              const p = pairOf(j)
              const c = p >= 0 ? PAIR_COLORS[p % PAIR_COLORS.length] : undefined
              return (
                <button
                  key={j}
                  className="opt min-h-[52px] text-[14px]"
                  disabled={locked || active === null}
                  onClick={() => {
                    if (active === null) return
                    const next = v.map(x => (x === j ? -1 : x))
                    next[active] = j
                    onChange(next)
                    const free = next.findIndex(x => x < 0)
                    setActive(free >= 0 ? free : null)
                  }}
                  style={c ? { borderColor: c, borderWidth: 2 } : undefined}
                >
                  {c && <i className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: c }} />}
                  {r}
                </button>
              )
            })}
          </div>
          {reveal && !reveal.correct && (
            <p className="t-foot col-span-2 m-0">{t('rightPairs', { pairs: q.options.map((o, i) => `${o} → ${right[s[i]]}`).join(' · ') })}</p>
          )}
          {!reveal && <p className="t-cap col-span-2 m-0">{t('matchHint')}</p>}
        </div>
      )
    }

    case 'BUCKETS': {
      const v = Array.isArray(value) && value.length === q.options.length ? value : q.options.map(() => -1)
      const s = Array.isArray(sol) ? sol : []
      const groups = q.right ?? []
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((o, i) => (
            <div key={i} className={`card flex flex-col gap-2 px-3 py-2.5 ${reveal ? (v[i] === s[i] ? 'ok' : 'bad') : ''}`} style={reveal ? { outline: `2px solid ${v[i] === s[i] ? 'var(--up)' : 'var(--down)'}` } : undefined}>
              <b className="text-[15px]">{o}</b>
              <div className="seg" role="group" aria-label={o}>
                {groups.map((g, k) => (
                  <button key={k} aria-pressed={v[i] === k} disabled={locked} onClick={() => onChange(v.map((x, j) => (j === i ? k : x)))}>
                    {g}
                  </button>
                ))}
              </div>
              {reveal && v[i] !== s[i] && <span className="t-cap">{t('belongsTo', { group: groups[s[i]] })}</span>}
            </div>
          ))}
        </div>
      )
    }

    case 'CHART_CANDLE':
      return (
        <div className="card">
          <ExerciseChart candles={q.candles} selected={reveal ? (sol as number) : typeof value === 'number' ? value : null} state={reveal ? 'ok' : null} onPickCandle={locked ? undefined : i => onChange(i)} label={q.prompt} />
          {reveal && !reveal.correct && typeof value === 'number' && <p className="t-cap m-0 mt-1">{t('candleMarked')}</p>}
        </div>
      )

    case 'UP_DOWN':
      return (
        <div className="flex flex-col gap-3">
          <div className="card flex flex-col gap-1.5">
            <ExerciseChart candles={q.candles} closes={q.chart} future={reveal?.reveal?.candles} futureCloses={reveal?.reveal?.closes} label={q.prompt} />
            {!reveal && <span className="t-cap">{t('hiddenAsset', { horizon: q.meta?.horizon ?? '' })}</span>}
            {outcome}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((o, i) => (
              <button key={i} className={`opt justify-center text-center text-[17px] ${optClass(reveal, sol === i, value === i)}`} aria-pressed={value === i} disabled={locked} onClick={() => onChange(i)}>
                {i === 0 ? '▲' : '▼'} {o}
              </button>
            ))}
          </div>
        </div>
      )

    case 'PLACE_LEVEL': {
      const entry = q.meta?.entry ?? 0
      const isStop = q.meta?.level === 'STOP'
      const v = typeof value === 'number' ? value : null
      const lines: Line[] = [{ price: entry, color: 'var(--ink-2)', label: `${t('entry')} ${fmt(entry)}`, dashed: true }]
      if (v !== null) lines.push({ price: v, color: isStop ? 'var(--down)' : 'var(--up)', label: `${isStop ? 'Stop' : t('target')} ${fmt(v)}` })
      if (reveal && Array.isArray(sol)) lines.push({ price: (sol[0] + sol[1]) / 2, color: 'var(--brand)', label: t('goodZone'), dashed: true })
      const stepP = entry * 0.0025
      return (
        <div className="card flex flex-col gap-2">
          <ExerciseChart candles={q.candles} future={reveal?.reveal?.candles} lines={lines} onPrice={locked ? undefined : p => onChange(Number(p.toPrecision(6)))} label={q.prompt} />
          {!reveal && (
            <div className="flex items-center justify-between gap-2">
              <span className="t-cap">{v === null ? t('dragLevel') : `${isStop ? 'Stop' : t('target')}: ${fmt(v)} (${(((v - entry) / entry) * 100).toLocaleString(locale, { maximumFractionDigits: 1 })} %)`}</span>
              {v !== null && (
                <span className="flex gap-1.5">
                  <button className="icon-btn h-9 w-9" style={{ background: 'var(--fill)' }} aria-label={t('lower')} onClick={() => onChange(Number((v - stepP).toPrecision(6)))}>
                    −
                  </button>
                  <button className="icon-btn h-9 w-9" style={{ background: 'var(--fill)' }} aria-label={t('higher')} onClick={() => onChange(Number((v + stepP).toPrecision(6)))}>
                    +
                  </button>
                </span>
              )}
            </div>
          )}
          {outcome}
        </div>
      )
    }

    case 'SIM_TRADE': {
      const entry = q.meta?.entry ?? 0
      const cash = q.meta?.cash ?? 10_000
      const maxRiskPct = q.meta?.maxRiskPct ?? 1
      const [amount, stop] = Array.isArray(value) && value.length === 2 ? value : [0, 0]
      const risk = stop > 0 && stop < entry ? (amount * (entry - stop)) / entry : null
      const set = (a: number, s: number) => onChange([a, s])
      const lines: Line[] = [{ price: entry, color: 'var(--ink-2)', label: `${t('entry')} ${fmt(entry)}`, dashed: true }]
      if (stop > 0) lines.push({ price: stop, color: 'var(--down)', label: `Stop ${fmt(stop)}` })
      return (
        <div className="flex flex-col gap-3">
          <div className="card flex flex-col gap-1.5">
            <ExerciseChart candles={q.candles} future={reveal?.reveal?.candles} lines={lines} onPrice={locked ? undefined : p => set(amount, Number(Math.min(p, entry * 0.999).toPrecision(6)))} label={q.prompt} />
            {!reveal && <span className="t-cap">{t('simStopHint')}</span>}
            {outcome}
          </div>
          <div className="card flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="t-foot">{t('simAmount')}</span>
              <b className="text-[20px] tabular-nums">{eur(amount)}</b>
            </div>
            <input type="range" min={0} max={cash} step={50} value={amount} disabled={locked} onChange={e => set(Number(e.target.value), stop)} aria-label={t('simAmount')} className="w-full" style={{ accentColor: 'var(--brand)' }} />
            <div className="t-foot flex justify-between">
              <span>{t('simCash', { cash: eur(cash), pct: maxRiskPct })}</span>
            </div>
            <div className="kv">
              <span>{t('simRisk')}</span>
              <b style={{ color: risk === null ? 'var(--ink-3)' : risk > (cash * maxRiskPct) / 100 ? 'var(--down)' : 'var(--up)' }}>{risk === null ? t('simNoStop') : `${eur(risk)} (${((risk / cash) * 100).toLocaleString(locale, { maximumFractionDigits: 2 })} %)`}</b>
            </div>
          </div>
        </div>
      )
    }

    case 'NUMBER': {
      // Acepta coma o punto decimal y puntos de miles (1.250,5 → 1250.5)
      const parse = (raw: string) => {
        const clean = raw.replace(/\s/g, '')
        const n = Number(locale === 'en' ? clean.replace(/,/g, '') : clean.replace(/\./g, '').replace(',', '.'))
        onChange(clean === '' || !Number.isFinite(n) ? null : n)
      }
      return (
        <div className="card flex items-center gap-2" style={reveal ? { outline: `2px solid ${reveal.correct ? 'var(--up)' : 'var(--down)'}` } : undefined}>
          <input className="min-w-0 flex-1 bg-transparent text-[28px] font-extrabold tabular-nums outline-none" inputMode="decimal" placeholder="0" disabled={locked} onChange={e => parse(e.target.value)} aria-label={q.prompt} />
          {q.meta?.unit && <b className="text-[22px]">{q.meta.unit}</b>}
          {reveal && !reveal.correct && <span className="t-foot">{t('rightNumber', { n: fmt(sol as number) })}</span>}
        </div>
      )
    }

    case 'PORTFOLIO': {
      const v = Array.isArray(value) && value.length === q.options.length ? value : q.options.map(() => 0)
      const total = v.reduce((a, b) => a + b, 0)
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((o, i) => (
            <div key={i} className="card flex flex-col gap-1 px-3.5 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span>
                  <b className="text-[15px]">{o}</b> <span className="t-cap">{q.meta?.kinds?.[i]}</span>
                </span>
                <b className="tabular-nums">{v[i]} %</b>
              </div>
              <input type="range" min={0} max={100} step={5} value={v[i]} disabled={locked} aria-label={o} className="w-full" style={{ accentColor: 'var(--brand)' }} onChange={e => onChange(v.map((x, j) => (j === i ? Number(e.target.value) : x)))} />
            </div>
          ))}
          <div className="kv px-1">
            <span>{t('total')}</span>
            <b style={{ color: total === 100 ? 'var(--up)' : 'var(--down)' }}>{total} %</b>
          </div>
        </div>
      )
    }

    case 'SPOT': {
      const v = Array.isArray(value) ? value : []
      const s = Array.isArray(sol) ? sol : []
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((o, i) => {
            const on = v.includes(i)
            return (
              <button key={i} className={`opt flex-col items-start gap-1 text-left ${optClass(reveal, s.includes(i), on)}`} aria-pressed={on} disabled={locked} onClick={() => onChange(on ? v.filter(x => x !== i) : [...v, i])}>
                <span className="t-cap flex w-full items-center justify-between">
                  <span>💬 {q.meta?.senders?.[i]}</span>
                  {on && <b style={{ color: 'var(--down)' }}>⚠︎ {t('scam')}</b>}
                </span>
                <span className="text-[15px]">{o}</span>
              </button>
            )
          })}
          <p className="t-cap m-0">{t('spotHint')}</p>
        </div>
      )
    }

    case 'CHAT':
      return (
        <div className="flex flex-col gap-2.5">
          {(q.meta?.lines ?? []).map((l, i) => (
            <div key={i} className="flex items-end gap-2">
              {i === (q.meta?.lines?.length ?? 1) - 1 ? <Lumi mood="THINKING" size={32} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} /> : <span className="w-8 flex-none" />}
              <div className="card max-w-[85%] rounded-bl-md px-3.5 py-2.5 text-[15px]">{l}</div>
            </div>
          ))}
          <div className="mt-1 flex flex-col items-end gap-2">
            {q.options.map((o, i) => (
              <button key={i} className={`opt max-w-[88%] justify-end rounded-br-md text-right ${optClass(reveal, sol === i, value === i)}`} aria-pressed={value === i} disabled={locked} onClick={() => onChange(i)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )

    // SCENARIO: la historia va en el enunciado; cada decisión tiene su consecuencia (llega al responder)
    default:
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((o, i) => (
            <button key={i} className={`opt ${optClass(reveal, sol === i, value === i)}`} aria-pressed={value === i} disabled={locked} onClick={() => onChange(i)}>
              <Icon name="chev" size={16} />
              {o}
            </button>
          ))}
        </div>
      )
  }
}
