'use client'
// Piezas para el resto del curso: carteras con datos reales, comisiones, bonos, divisas, apalancamiento,
// tamaño de posición, órdenes sobre velas reales, impuestos, aportaciones periódicas, ¿sube o baja?,
// libro de órdenes y valoración. Métricas que publica cada una en el comentario de su función.
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { WidgetT } from '@/shared/play'
import { ExerciseChart } from '../ui/exercise-chart'
import { Glyph } from './glyph'
import { Bars, Big, Lines, Row, Slide, useFmt, useMetrics } from './kit'
import { bondPrice, dcaCompare, fillBuy, firstHit, growthPath, maxDrawdown, mixPath, savingsTax } from './math'

type W<K extends WidgetT['kind']> = { w: Extract<WidgetT, { kind: K }>; onMetrics: (m: Record<string, number>) => void }
const COLORS = ['var(--brand)', 'var(--amber)', 'var(--up)', '#BF5AF2']

/** Reparte el 100 % entre varios: al mover uno, los demás se ajustan en proporción */
function rebalanceTo(ws: number[], i: number, v: number) {
  const rest = ws.reduce((s, w, j) => s + (j === i ? 0 : w), 0)
  const left = 100 - v
  const out = ws.map((w, j) => (j === i ? v : rest ? Math.round((w / rest) * left) : Math.round(left / (ws.length - 1))))
  const diff = 100 - out.reduce((s, w) => s + w, 0)
  const k = out.findIndex((_, j) => j !== i)
  out[k] += diff
  return out
}

/** Métricas: totalPct (rentabilidad total %), maxDD (peor caída %, negativa), final (€), w0, w1, w2 (pesos %) */
export function Mix({ w, onMetrics }: W<'mix'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [ws, setWs] = useState(w.weights)
  const path = mixPath(w.series.assets, ws, w.amount, w.rebalance)
  const final = path[path.length - 1]
  const dd = maxDrawdown(path)
  const total = (final / w.amount - 1) * 100
  useMetrics({ totalPct: Math.round(total), maxDD: Math.round(dd), final: Math.round(final), ...Object.fromEntries(ws.map((x, i) => [`w${i}`, x])) }, onMetrics)
  // Cada activo solo, para comparar (100 % en él)
  const solo = w.series.assets.map(a => a.closes.map(c => (w.amount * c) / a.closes[0]))
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1.5">
        <Lines
          label={t('mixChart')}
          height={160}
          lines={[...solo.map((v, i) => ({ values: v, color: COLORS[i], label: w.series.assets[i].name, dashed: true })), { values: path, color: 'var(--ink)', label: t('yourMix') }]}
        />
        <span className="t-cap">{w.series.caption}</span>
      </div>
      <Row>
        <Big label={t('endsWith', { amount: f.eur(w.amount) })} value={f.eur(final)} tone={final >= w.amount ? 'up' : 'down'} />
        <Big label={t('worstDrop')} value={f.pct(dd, 0)} tone="down" />
      </Row>
      <div className="flex h-3 overflow-hidden rounded-full">
        {ws.map((x, i) => (
          <div key={i} style={{ width: `${x}%`, background: COLORS[i], transition: 'width .2s' }} />
        ))}
      </div>
      {w.series.assets.map((a, i) => (
        <Slide key={a.key} label={a.name} value={ws[i]} min={0} max={100} step={5} show={f.pct(ws[i], 0)} color={COLORS[i]} onChange={v => setWs(rebalanceTo(ws, i, v))} />
      ))}
    </div>
  )
}

/** Métricas: feeB, years, finalA, finalB, lost (€ que se llevan las comisiones de más), lostPct (% del final barato) */
export function Fees({ w, onMetrics }: W<'fees'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [feeB, setFeeB] = useState(w.feeB)
  const [years, setYears] = useState(w.years)
  const a = growthPath(w.amount, w.monthly, w.gross - w.feeA, years).compound
  const b = growthPath(w.amount, w.monthly, w.gross - feeB, years).compound
  const fa = a[a.length - 1]
  const fb = b[b.length - 1]
  useMetrics({ feeB, years, finalA: Math.round(fa), finalB: Math.round(fb), lost: Math.round(fa - fb), lostPct: Math.round(((fa - fb) / fa) * 100) }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card">
        <Lines label={t('feesChart')} lines={[{ values: a, color: 'var(--up)', label: t('cheapFund', { fee: f.pct(w.feeA, 2) }) }, { values: b, color: 'var(--down)', label: t('dearFund', { fee: f.pct(feeB, 2) }) }]} />
      </div>
      <Row>
        <Big label={t('cheapFund', { fee: f.pct(w.feeA, 2) })} value={f.eur(fa)} tone="up" />
        <Big label={t('dearFund', { fee: f.pct(feeB, 2) })} value={f.eur(fb)} tone="down" />
      </Row>
      <Big label={t('feesTake')} value={f.eur(fa - fb)} tone="down" small />
      <Slide label={t('dearFee')} value={feeB} min={w.feeA} max={w.maxFee} step={0.05} show={f.pct(feeB, 2)} onChange={setFeeB} color="var(--down)" />
      <Slide label={t('years')} value={years} min={1} max={w.maxYears} step={1} show={t('nYears', { n: years })} onChange={setYears} />
      <p className="t-cap m-0">{t('feesNote', { gross: f.pct(w.gross, 1) })}</p>
    </div>
  )
}

/** Métricas: rate, years, price, change (% frente a cuando se emitió al tipo del cupón) */
export function Bond({ w, onMetrics }: W<'bond'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [rate, setRate] = useState(w.rate)
  const [years, setYears] = useState(w.years)
  const price = bondPrice(w.face, w.coupon, years, rate)
  const change = (price / w.face - 1) * 100
  useMetrics({ rate, years, price: Math.round(price), change: Math.round(change * 10) / 10 }, onMetrics)
  const curve = Array.from({ length: 21 }, (_, i) => bondPrice(w.face, w.coupon, years, (w.maxRate * i) / 20))
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1">
        <span className="t-cap">{t('bondHead', { face: f.eur(w.face), coupon: f.pct(w.coupon, 1) })}</span>
        <Lines label={t('bondChart')} height={130} lines={[{ values: curve, color: 'var(--brand)', label: t('bondPrice') }]} marks={[{ at: (rate / w.maxRate) * 20, color: 'var(--ink)' }]} />
        <span className="t-cap flex justify-between">
          <span>0 %</span>
          <span>{t('marketRate')}</span>
          <span>{f.pct(w.maxRate, 0)}</span>
        </span>
      </div>
      <Row>
        <Big label={t('bondPrice')} value={f.eur(price)} tone={price >= w.face ? 'up' : 'down'} />
        <Big label={t('vsIssue')} value={`${change >= 0 ? '+' : ''}${f.pct(change)}`} tone={change >= 0 ? 'up' : 'down'} />
      </Row>
      <Slide label={t('marketRate')} value={rate} min={0} max={w.maxRate} step={0.25} show={f.pct(rate, 2)} onChange={setRate} color="var(--down)" />
      <Slide label={t('yearsLeft')} value={years} min={1} max={w.maxYears} step={1} show={t('nYears', { n: years })} onChange={setYears} />
    </div>
  )
}

/** Métricas: asset (% del activo en su moneda), fx (% que se mueve esa moneda frente al euro), eurPct (lo que ganas en euros) */
export function Fx({ w, onMetrics }: W<'fx'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [asset, setAsset] = useState(w.asset)
  const [fx, setFx] = useState(w.fx)
  const eur = ((1 + asset / 100) * (1 + fx / 100) - 1) * 100
  useMetrics({ asset, fx, eurPct: Math.round(eur * 10) / 10 }, onMetrics)
  const sign = (v: number) => `${v >= 0 ? '+' : ''}${f.pct(v)}`
  return (
    <div className="flex flex-col gap-3">
      <Bars
        rows={[
          { label: t('fxAsset', { currency: w.currency }), value: asset, show: sign(asset), color: asset >= 0 ? 'var(--up)' : 'var(--down)' },
          { label: t('fxMove', { currency: w.currency }), value: fx, show: sign(fx), color: fx >= 0 ? 'var(--up)' : 'var(--down)' },
          { label: t('fxEur'), value: eur, show: sign(eur), color: eur >= 0 ? 'var(--up)' : 'var(--down)' },
        ]}
      />
      <Row>
        <Big label={t('youInvest')} value={f.eur(w.amount)} />
        <Big label={t('youGetEur')} value={f.eur(w.amount * (1 + eur / 100))} tone={eur >= 0 ? 'up' : 'down'} />
      </Row>
      <Slide label={t('fxAsset', { currency: w.currency })} value={asset} min={-w.maxAsset} max={w.maxAsset} step={1} show={sign(asset)} onChange={setAsset} />
      <Slide label={t('fxMove', { currency: w.currency })} value={fx} min={-w.maxFx} max={w.maxFx} step={1} show={sign(fx)} onChange={setFx} color="var(--amber)" />
    </div>
  )
}

/** Métricas: lev, move (% del precio), pnlPct (% de tu garantía), wiped (1 si pierdes toda la garantía), exposure */
export function Leverage({ w, onMetrics }: W<'leverage'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [lev, setLev] = useState(w.lev)
  const [move, setMove] = useState(w.move)
  const pnl = w.margin * lev * (move / 100)
  const pct = (pnl / w.margin) * 100
  const wiped = pct <= -100
  useMetrics({ lev, move, pnlPct: Math.round(Math.max(-100, pct)), wiped: wiped ? 1 : 0, exposure: w.margin * lev }, onMetrics)
  const left = Math.max(0, w.margin + pnl)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('levHead', { margin: f.eur(w.margin), exposure: f.eur(w.margin * lev) })}</span>
        <div className="h-5 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (left / (w.margin * 2)) * 100)}%`, background: pct >= 0 ? 'var(--up)' : 'var(--down)', transition: 'width .2s' }} />
        </div>
        {wiped && (
          <b className="down animate-shake flex items-center gap-1.5">
            <Glyph name="warning" size={16} /> {t('levWiped')}
          </b>
        )}
      </div>
      <Row>
        <Big label={t('levResult')} value={`${pnl >= 0 ? '+' : ''}${f.eur(Math.max(-w.margin, pnl))}`} tone={pnl >= 0 ? 'up' : 'down'} />
        <Big label={t('levOnMargin')} value={`${pct >= 0 ? '+' : ''}${f.pct(Math.max(-100, pct), 0)}`} tone={pct >= 0 ? 'up' : 'down'} />
      </Row>
      <Slide label={t('leverage')} value={lev} min={1} max={w.maxLev} step={1} show={`×${lev}`} onChange={setLev} color="var(--amber)" />
      <Slide label={t('priceMove')} value={move} min={-w.maxMove} max={w.maxMove} step={0.5} show={`${move >= 0 ? '+' : ''}${f.pct(move)}`} onChange={setMove} />
    </div>
  )
}

/** Métricas: riskPct, stopPct, size (€ a comprar), posPct (% de la cuenta), riskEur, after10 (cuenta tras 10 pérdidas seguidas) */
export function Position({ w, onMetrics }: W<'position'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [risk, setRisk] = useState(w.riskPct)
  const [stop, setStop] = useState(w.stopPct)
  const riskEur = (w.account * risk) / 100
  const size = Math.min(w.account, riskEur / (stop / 100))
  const shares = Math.floor(size / w.entry)
  const after10 = w.account * (1 - risk / 100) ** 10
  useMetrics({ riskPct: risk, stopPct: stop, size: Math.round(size), posPct: Math.round((size / w.account) * 100), riskEur: Math.round(riskEur), after10: Math.round(after10) }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('posHead', { account: f.eur(w.account), entry: f.eur(w.entry, 2) })}</span>
        <Bars
          rows={[
            { label: t('posSize'), value: size, show: `${f.eur(size)} · ${t('nShares', { n: shares })}`, color: 'var(--brand)' },
            { label: t('posRisk'), value: riskEur, show: f.eur(riskEur), color: 'var(--down)' },
          ]}
        />
      </div>
      <Row>
        <Big label={t('posSize')} value={f.pct((size / w.account) * 100, 0)} small />
        <Big label={t('after10')} value={f.eur(after10)} tone={after10 > w.account * 0.85 ? 'up' : 'down'} small />
      </Row>
      <Slide label={t('riskPerTrade')} value={risk} min={0.25} max={w.maxRisk} step={0.25} show={f.pct(risk, 2)} onChange={setRisk} color="var(--down)" />
      <Slide label={t('stopDistance')} value={stop} min={1} max={w.maxStop} step={0.5} show={f.pct(stop)} onChange={setStop} />
    </div>
  )
}

/** Métricas: stopPct, takePct, rr (objetivo ÷ stop), played (1 tras revelar), hit (1 stop, 2 objetivo, 0 ninguno), pnlPct */
export function Orders({ w, onMetrics }: W<'orders'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [stopPct, setStopPct] = useState(w.stopPct)
  const [takePct, setTakePct] = useState(w.takePct)
  const [played, setPlayed] = useState(false)
  const c = w.chart
  const entry = c.entry ?? c.candles[c.candles.length - 1][3]
  const stop = entry * (1 - stopPct / 100)
  const take = entry * (1 + takePct / 100)
  const r = firstHit(c.future, stop, take)
  const exit = r.hit === 1 ? stop : r.hit === 2 ? take : c.future[c.future.length - 1][3]
  const pnl = (exit / entry - 1) * 100
  useMetrics({ stopPct, takePct, rr: Math.round((takePct / stopPct) * 10) / 10, played: played ? 1 : 0, hit: played ? r.hit : 0, pnlPct: played ? Math.round(pnl * 10) / 10 : 0 }, onMetrics)
  const shown = played ? c.future.slice(0, r.at + 1) : undefined
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1">
        <ExerciseChart
          candles={c.candles}
          future={shown}
          label={c.caption}
          lines={[
            { price: entry, color: 'var(--ink-2)', label: `${t('entry')} ${f.n(entry, 2)}`, dashed: true },
            { price: stop, color: 'var(--down)', label: `Stop ${f.n(stop, 2)}` },
            { price: take, color: 'var(--up)', label: `${t('targetLabel')} ${f.n(take, 2)}` },
          ]}
        />
        <span className="t-cap">{c.caption}</span>
      </div>
      {played && (
        <div className="card animate-pop" style={{ background: `color-mix(in srgb, var(--${r.hit === 2 ? 'up' : r.hit === 1 ? 'down' : 'brand'}) 11%, var(--surface))` }}>
          <b>{r.hit === 2 ? t('hitTake') : r.hit === 1 ? t('hitStop') : t('hitNone')}</b> <span className="tabular-nums">{`${pnl >= 0 ? '+' : ''}${f.pct(pnl)}`}</span>
        </div>
      )}
      <Big label={t('rrRatio')} value={`1 : ${f.n(takePct / stopPct, 1)}`} small />
      <Slide label={t('stopBelow')} value={stopPct} min={0.5} max={w.maxPct} step={0.5} show={f.pct(stopPct)} onChange={v => (setStopPct(v), setPlayed(false))} color="var(--down)" />
      <Slide label={t('takeAbove')} value={takePct} min={0.5} max={w.maxPct} step={0.5} show={f.pct(takePct)} onChange={v => (setTakePct(v), setPlayed(false))} color="var(--up)" />
      <button className="btn btn-primary" onClick={() => setPlayed(true)} disabled={played}>
        <Glyph name="chart" size={18} /> {t('seeWhatHappened')}
      </button>
    </div>
  )
}

/** Métricas: gain, loss, base, tax, effPct (tipo medio %), marginal (tipo del último euro %) */
export function Taxes({ w, onMetrics }: W<'taxes'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [gain, setGain] = useState(w.gain)
  const [loss, setLoss] = useState(w.loss)
  const base = Math.max(0, gain - loss)
  const r = savingsTax(base)
  const eff = base ? (r.tax / base) * 100 : 0
  useMetrics({ gain, loss, base, tax: Math.round(r.tax), effPct: Math.round(eff * 10) / 10, marginal: r.marginal }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <span className="t-cap">{t('taxHead')}</span>
        {r.parts.map(p => (
          <div key={p.rate} className="flex items-center justify-between">
            <span className="t-foot">{p.upTo === Infinity ? t('bracketTop', { rate: p.rate }) : t('bracketUpTo', { upTo: f.eur(p.upTo), rate: p.rate })}</span>
            <b className="tabular-nums">{f.eur(p.amount)}</b>
          </div>
        ))}
        {!r.parts.length && <span className="t-foot">{t('noTax')}</span>}
      </div>
      <Row>
        <Big label={t('taxToPay')} value={f.eur(r.tax)} tone="down" />
        <Big label={t('taxAvg')} value={f.pct(eff)} />
      </Row>
      <Slide label={t('gainSold')} value={gain} min={0} max={w.maxGain} step={500} show={f.eur(gain)} onChange={setGain} color="var(--up)" />
      <Slide label={t('lossSold')} value={loss} min={0} max={w.maxGain} step={500} show={f.eur(loss)} onChange={setLoss} color="var(--down)" />
    </div>
  )
}

/** Métricas: start (año en que empiezas), lumpFinal, dcaFinal, lumpWins (1 si gana todo de golpe), diffPct */
export function Dca({ w, onMetrics }: W<'dca'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const c = w.series.closes
  const maxStart = c.length - 1 - w.window
  const [start, setStart] = useState(Math.min(w.start, maxStart))
  const r = dcaCompare(c, start, w.total, w.spread, w.window)
  const year = Number(w.series.dates[start].slice(0, 4))
  useMetrics({ start: year, lumpFinal: Math.round(r.lump), dcaFinal: Math.round(r.dca), lumpWins: r.lump >= r.dca ? 1 : 0, diffPct: Math.round(((r.lump - r.dca) / r.dca) * 1000) / 10 }, onMetrics)
  const span = c.slice(start, r.end + 1)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1">
        <span className="t-cap">{t('dcaHead', { from: w.series.dates[start], to: w.series.dates[r.end] })}</span>
        <Lines label={w.series.caption} height={120} lines={[{ values: span, color: 'var(--brand)', label: w.series.caption }]} marks={[{ at: Math.min(w.spread, span.length - 1), color: 'var(--amber)' }]} />
        <span className="t-cap">{w.series.caption}</span>
      </div>
      <Row>
        <Big label={t('lumpSum', { total: f.eur(w.total) })} value={f.eur(r.lump)} tone={r.lump >= r.dca ? 'up' : undefined} />
        <Big label={t('spreadOut', { n: w.spread })} value={f.eur(r.dca)} tone={r.dca > r.lump ? 'up' : undefined} />
      </Row>
      <Slide label={t('startIn')} value={start} min={0} max={maxStart} step={1} show={w.series.dates[start]} onChange={setStart} />
    </div>
  )
}

/** Métricas: done (rondas respondidas), right (aciertos), rounds */
export function Guess({ w, onMetrics }: W<'guess'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [answers, setAnswers] = useState<('UP' | 'DOWN')[]>([])
  const [round, setRound] = useState(0)
  const truth = (x: (typeof w.rounds)[number]) => (x.future[x.future.length - 1][3] >= x.candles[x.candles.length - 1][3] ? 'UP' : 'DOWN')
  const right = answers.filter((a, i) => a === truth(w.rounds[i])).length
  useMetrics({ done: answers.length, right, rounds: w.rounds.length }, onMetrics)
  const r = w.rounds[round]
  const answered = answers.length > round
  const ok = answered && answers[round] === truth(r)
  const chg = (r.future[r.future.length - 1][3] / r.candles[r.candles.length - 1][3] - 1) * 100
  return (
    <div className="flex flex-col gap-3">
      <span className="t-cap">{t('roundOf', { i: round + 1, n: w.rounds.length, right })}</span>
      <div className="card flex flex-col gap-1">
        <ExerciseChart key={round} candles={r.candles} future={answered ? r.future : undefined} label={r.caption} />
        <span className="t-cap">{r.caption}</span>
      </div>
      {!answered ? (
        <div className="grid grid-cols-2 gap-2.5">
          {(['UP', 'DOWN'] as const).map(d => (
            <button key={d} className="opt justify-center text-[17px] font-extrabold" onClick={() => setAnswers([...answers, d])}>
              <Glyph name={d === 'UP' ? 'up' : 'down'} size={20} /> {t(d === 'UP' ? 'goesUp' : 'goesDown')}
            </button>
          ))}
        </div>
      ) : (
        <div className={`card flex flex-col gap-2 ${ok ? 'animate-glow' : 'animate-shake'}`} style={{ background: `color-mix(in srgb, var(--${ok ? 'up' : 'down'}) 11%, var(--surface))` }}>
          <b>
            {ok ? t('guessRight') : t('guessWrong')} <span className="tabular-nums">{`${chg >= 0 ? '+' : ''}${f.pct(chg)}`}</span>
          </b>
          {round < w.rounds.length - 1 && (
            <button className="btn btn-secondary" onClick={() => setRound(round + 1)}>
              {t('nextRound')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Métricas: size (acciones), avg (precio medio), slippagePct, spreadPct */
export function Book({ w, onMetrics }: W<'book'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [size, setSize] = useState(w.size)
  const r = fillBuy(w.asks, size)
  const spread = (w.asks[0].price / w.bids[0].price - 1) * 100
  useMetrics({ size, avg: Math.round(r.avg * 100) / 100, slippagePct: Math.round(r.slippagePct * 100) / 100, spreadPct: Math.round(spread * 100) / 100 }, onMetrics)
  // Cuánto se llena de cada nivel del libro (de mejor a peor precio)
  const takes: number[] = []
  let left = size
  for (const a of w.asks) {
    const q = Math.min(left, a.size)
    takes.push(q)
    left -= q
  }
  const mx = Math.max(...w.asks.map(a => a.size), ...w.bids.map(b => b.size))
  return (
    <div className="flex flex-col gap-3">
      <div className="card grid grid-cols-2 gap-x-3 gap-y-1">
        <span className="t-cap font-bold up">{t('bids')}</span>
        <span className="t-cap font-bold down">{t('asks')}</span>
        {w.asks.map((a, i) => {
          const b = w.bids[i]
          const take = takes[i]
          return [
            <div key={`b${i}`} className="relative flex justify-between rounded-md px-2 py-1 tabular-nums">
              <i className="absolute inset-y-0 right-0 rounded-md" style={{ width: `${(b ? b.size / mx : 0) * 100}%`, background: 'color-mix(in srgb, var(--up) 14%, transparent)' }} />
              <span className="relative">{b ? f.n(b.size) : ''}</span>
              <b className="relative">{b ? f.n(b.price, 2) : ''}</b>
            </div>,
            <div key={`a${i}`} className="relative flex justify-between rounded-md px-2 py-1 tabular-nums" style={{ outline: take ? '2px solid var(--brand)' : undefined }}>
              <i className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${(a.size / mx) * 100}%`, background: 'color-mix(in srgb, var(--down) 14%, transparent)' }} />
              <b className="relative">{f.n(a.price, 2)}</b>
              <span className="relative">{take ? `${f.n(take)} / ${f.n(a.size)}` : f.n(a.size)}</span>
            </div>,
          ]
        })}
        <span className="t-cap col-span-2 mt-1">{t('bookNote')}</span>
      </div>
      <Row>
        <Big label={t('avgPrice')} value={f.n(r.avg, 3)} />
        <Big label={t('slippage')} value={`+${f.pct(r.slippagePct, 2)}`} tone={r.slippagePct > 0.2 ? 'down' : undefined} />
      </Row>
      <Slide label={t('buyShares')} value={size} min={10} max={w.maxSize} step={10} show={f.n(size)} onChange={setSize} />
    </div>
  )
}

/** Métricas: price, growth, per, peg, yieldPct (beneficio ÷ precio), payback (años para que los beneficios igualen el precio) */
export function Valuation({ w, onMetrics }: W<'valuation'>) {
  const t = useTranslations('play')
  const f = useFmt()
  const [price, setPrice] = useState(w.price)
  const [growth, setGrowth] = useState(w.growth)
  const per = price / w.eps
  const peg = growth > 0 ? per / growth : 99
  let sum = 0
  let e = w.eps
  let years = 0
  while (sum < price && years < 60) {
    sum += e
    e *= 1 + growth / 100
    years++
  }
  useMetrics({ price, growth, per: Math.round(per * 10) / 10, peg: Math.round(peg * 100) / 100, yieldPct: Math.round((w.eps / price) * 1000) / 10, payback: years }, onMetrics)
  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-1">
        <span className="t-cap">{t('valHead', { eps: f.eur(w.eps, 2) })}</span>
        <Bars rows={[{ label: t('payback'), value: years, show: years >= 60 ? '60+' : t('nYears', { n: years }), color: years <= 15 ? 'var(--up)' : 'var(--amber)' }]} />
      </div>
      <Row>
        <Big label="PER" value={f.n(per, 1)} tone="brand" />
        <Big label="PEG" value={growth > 0 ? f.n(peg, 2) : '—'} />
        <Big label={t('earningsYield')} value={f.pct((w.eps / price) * 100)} small />
      </Row>
      <Slide label={t('sharePrice')} value={price} min={w.eps} max={w.maxPrice} step={1} show={f.eur(price)} onChange={setPrice} />
      <Slide label={t('profitGrowth')} value={growth} min={0} max={w.maxGrowth} step={1} show={f.pct(growth, 0)} onChange={setGrowth} color="var(--up)" />
    </div>
  )
}
