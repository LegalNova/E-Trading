'use client'
// Pantallas interactivas de las clases: PLAY (predice → juega → descubre) y STORY (chat con decisiones).
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { holds, type BeatT, type PlayStepT, type StoryStepT, type WidgetT } from '@/shared/play'
import { inline, RichText } from '../ui/rich-text'
import { Lumi, LumiSays } from '../ui/lumi'
import { Basket, Doubling, Growth, Race, RealRate } from './w-money'
import { Budget, Emergency, GoalPlan, Leaks, Sort } from './w-budget'
import { Debts, Loan, Revolving } from './w-debt'
import { Coinflip, Crash, Horizon } from './w-market'

type OnM = (m: Record<string, number>) => void
const WIDGETS: { [K in WidgetT['kind']]: (p: { w: Extract<WidgetT, { kind: K }>; onMetrics: OnM }) => React.ReactNode } = {
  basket: Basket, growth: Growth, race: Race, doubling: Doubling, realrate: RealRate,
  sort: Sort, budget: Budget, leaks: Leaks, emergency: Emergency, goalplan: GoalPlan,
  loan: Loan, revolving: Revolving, debts: Debts,
  horizon: Horizon, crash: Crash, coinflip: Coinflip,
}
function WidgetView({ w, onMetrics }: { w: WidgetT; onMetrics: OnM }) {
  const C = WIDGETS[w.kind] as (p: { w: WidgetT; onMetrics: OnM }) => React.ReactNode
  return <C w={w} onMetrics={onMetrics} />
}

/** Segundos tras los que se puede seguir sin cumplir el reto (para no atascar a nadie) */
const SKIP_AFTER = 40

export function PlayView({ s, done, onDone }: { s: PlayStepT; done: boolean; onDone: () => void }) {
  const t = useTranslations('play')
  const [guess, setGuess] = useState<number | null>(null)
  const [m, setM] = useState<Record<string, number>>({})
  const first = useRef<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const open = !s.predict || guess !== null
  const onMetrics = (x: Record<string, number>) => {
    const k = JSON.stringify(x)
    if (first.current === null) first.current = k
    else if (k !== first.current) setTouched(true)
    setM(x)
  }
  const goalMet = touched && (s.goal ? s.goal.when.every(c => holds(c, m)) : true)
  useEffect(() => {
    if (goalMet && !done) onDone()
  }, [goalMet, done, onDone])
  useEffect(() => {
    if (!open || done) return
    const id = setTimeout(() => setCanSkip(true), SKIP_AFTER * 1000)
    return () => clearTimeout(id)
  }, [open, done])
  const line = s.lumi.find(l => !l.when || holds(l.when, m))
  const mission = s.mode === 'MISSION'
  return (
    <div className="flex flex-col gap-3">
      {mission && (
        <span className="t-cap self-start rounded-full px-2.5 py-1 font-bold" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          🎯 {t('mission')}
        </span>
      )}
      <h1 className="t-title m-0">{s.title}</h1>
      <RichText text={s.intro} />
      {s.predict && (
        <div className="card flex flex-col gap-2" style={guess === null ? { outline: '2px solid var(--brand)' } : undefined}>
          <span className="t-cap font-bold" style={{ color: 'var(--brand)' }}>
            🤔 {t('predict')}
          </span>
          <b className="t-head">{inline(s.predict.prompt)}</b>
          <div className="flex flex-col gap-1.5">
            {s.predict.options.map((o, k) => {
              const picked = guess === k
              const right = guess !== null && k === s.predict!.answer
              return (
                <button
                  key={o}
                  aria-disabled={guess !== null}
                  onClick={() => guess === null && setGuess(k)}
                  className="btn btn-secondary h-auto justify-start py-2.5 text-left"
                  style={guess !== null ? { opacity: picked || right ? 1 : 0.5, outline: right ? '2px solid var(--up)' : picked ? '2px solid var(--down)' : undefined } : undefined}
                >
                  {inline(o)}
                </button>
              )
            })}
          </div>
          {guess !== null && (
            <p className="t-foot m-0 animate-rise" style={{ color: 'var(--ink)' }}>
              <b className={guess === s.predict.answer ? 'up' : 'down'}>{guess === s.predict.answer ? t('goodGuess') : t('surprise')}</b> {inline(s.predict.why)}
            </p>
          )}
        </div>
      )}
      {open && (
        <>
          {s.goal && (
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: goalMet ? 'color-mix(in srgb, var(--up) 14%, var(--surface))' : 'var(--surface-2)' }}>
              <span className="text-[20px]">{goalMet ? '✅' : '🎯'}</span>
              <span className="t-foot flex-1" style={{ color: 'var(--ink)' }}>
                <b>{goalMet ? t('goalDone') : t('goal')}</b> {inline(s.goal.text)}
              </span>
            </div>
          )}
          <div className="animate-rise">
            <WidgetView w={s.widget} onMetrics={onMetrics} />
          </div>
          {/* Con el reto cumplido, Lumi lo celebra; si no, comenta lo que estás haciendo */}
          {goalMet && s.goal ? (
            <LumiSays key="cheer" mood="CELEBRATE" message={t(`cheer${(s.id.length % 4) + 1}`)} size={38} />
          ) : (
            line && <LumiSays key={line.say} mood={line.mood ?? 'THINKING'} message={inline(line.say)} size={38} />
          )}
          {(goalMet || done) && (
            <div className="card animate-pop" style={{ background: 'color-mix(in srgb, var(--brand) 10%, var(--surface))' }}>
              <span className="t-cap font-bold" style={{ color: 'var(--brand)' }}>
                💡 {t('insight')}
              </span>
              <p className="t-head m-0 mt-1">{inline(s.insight)}</p>
            </div>
          )}
          {canSkip && !done && !goalMet && (
            <button className="btn btn-plain" onClick={onDone}>
              {t('skip')}
            </button>
          )}
        </>
      )}
    </div>
  )
}

type Line = { who: string; text: string; tone?: 'good' | 'ok' | 'bad' } | { note: string }

/** Historia con decisiones: los mensajes van apareciendo como en un chat; en cada elección, sus consecuencias */
export function StoryView({ s, done, onDone }: { s: StoryStepT; done: boolean; onDone: () => void }) {
  const t = useTranslations('play')
  const [shown, setShown] = useState<Line[]>([])
  const [k, setK] = useState(0) // siguiente beat de la historia principal
  const [queue, setQueue] = useState<Line[]>([]) // consecuencias pendientes de la última elección
  const [run, setRun] = useState(0) // para volver a empezar
  const end = useRef<HTMLDivElement>(null)
  const cast = useMemo(() => Object.fromEntries(s.cast.map(c => [c.id, c])), [s.cast])
  const beat: BeatT | undefined = s.beats[k]
  const waiting = !queue.length && beat && 'choice' in beat
  const finished = !queue.length && !beat
  useEffect(() => {
    if (waiting || finished) return
    const next = queue.length ? queue[0] : (beat as Line)
    const delay = shown.length ? Math.min(1400, 450 + ('text' in next ? next.text.length : next.note.length) * 12) : 200
    const id = setTimeout(() => {
      setShown(x => [...x, next])
      if (queue.length) setQueue(q => q.slice(1))
      else setK(x => x + 1)
    }, delay)
    return () => clearTimeout(id)
  }, [waiting, finished, queue, beat, shown.length, run])
  useEffect(() => {
    if (finished && !done) onDone()
  }, [finished, done, onDone])
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [shown.length, waiting])
  const pick = (o: Extract<BeatT, { choice: unknown }>['choice']['options'][number]) => {
    setShown(x => [...x, { who: 'me', text: o.text, tone: o.tone }])
    setQueue(o.then.map(b => ('note' in b ? b : { ...b })))
    setK(x => x + 1)
  }
  const restart = () => (setShown([]), setK(0), setQueue([]), setRun(r => r + 1))
  return (
    <div className="flex flex-col gap-3">
      <h1 className="t-title m-0">{s.title}</h1>
      <div className="flex flex-col gap-2">
        {shown.map((l, i) =>
          'note' in l ? (
            <p key={i} className="t-cap m-0 animate-rise py-1 text-center italic">
              {l.note}
            </p>
          ) : l.who === 'me' ? (
            <div key={i} className="flex animate-rise justify-end">
              <div className="max-w-[82%] rounded-[18px] rounded-br-md px-3.5 py-2" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                {inline(l.text)}
              </div>
            </div>
          ) : (
            <div key={i} className="flex animate-rise items-end gap-2">
              {l.who === 'lumi' ? <Lumi mood="HAPPY" size={30} /> : <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[17px]" style={{ background: 'var(--surface-2)' }}>{cast[l.who]?.emoji ?? '🙂'}</span>}
              <div className="max-w-[82%] rounded-[18px] rounded-bl-md px-3.5 py-2" style={{ background: l.who === 'lumi' ? 'color-mix(in srgb, var(--brand) 10%, var(--surface))' : 'var(--surface)', boxShadow: 'var(--shadow)' }}>
                <span className="t-cap block font-bold">{l.who === 'lumi' ? 'Lumi' : cast[l.who]?.name}</span>
                <RichText text={l.text} />
              </div>
            </div>
          ),
        )}
        {!waiting && !finished && (
          <span className="t-cap animate-pulse pl-10" aria-hidden>
            •••
          </span>
        )}
      </div>
      {waiting && beat && 'choice' in beat && (
        <div className="card flex animate-pop flex-col gap-1.5" style={{ outline: '2px solid var(--brand)' }}>
          <b className="t-head">{inline(beat.choice.prompt)}</b>
          {beat.choice.options.map(o => (
            <button key={o.text} className="btn btn-secondary h-auto justify-start py-2.5 text-left" onClick={() => pick(o)}>
              {inline(o.text)}
            </button>
          ))}
        </div>
      )}
      {finished && (
        <button className="btn btn-plain" onClick={restart}>
          {t('tryOther')}
        </button>
      )}
      <div ref={end} />
    </div>
  )
}
