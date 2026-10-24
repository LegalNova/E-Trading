'use client'
// 03.5–03.8 · Quiz (7 tipos de pregunta), resultado y sin vidas. También el test de nivel.
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { AnswerResultT, QuestionT, QuizFinishT } from '@/shared/contract'
import { clock, num } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useLives, useMe, useRefreshAll } from '../hooks'
import { useToast } from '../providers'
import { QuizChart } from '../ui/charts'
import { Flame, Gem, Heart, Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, Stars, Steps, TopBar } from '../ui/kit'
import { useGuard } from '../shell'
import { Lumi } from '../ui/lumi'

export type AnswerValue = number | number[] | string | null

const optClass = (reveal: AnswerResultT | null, isCorrect: boolean, isPicked: boolean) => (!reveal ? '' : isCorrect ? 'ok' : isPicked ? 'bad' : 'dim')

/** Pinta cualquier tipo de pregunta. `reveal` muestra la solución tras responder. */
export function QuestionView({ q, value, onChange, reveal }: { q: QuestionT; value: AnswerValue; onChange: (v: AnswerValue) => void; reveal: AnswerResultT | null }) {
  const t = useTranslations('quiz')
  const sol = reveal?.correctAnswer
  const locked = !!reveal

  if (q.type === 'CHART_POINT') {
    return (
      <div className="card">
        <QuizChart values={q.chart ?? []} picked={typeof value === 'number' ? value : null} solution={reveal ? (sol as number) : null} onPick={locked ? () => {} : i => onChange(i)} />
      </div>
    )
  }

  if (q.type === 'MULTIPLE') {
    const v = Array.isArray(value) ? value : []
    const s = Array.isArray(sol) ? sol : []
    return (
      <div className="flex flex-col gap-2.5">
        {q.options.map((o, i) => {
          const on = v.includes(i)
          return (
            <button key={i} className={`opt ${optClass(reveal, s.includes(i), on)}`} aria-pressed={on} disabled={locked} onClick={() => onChange(on ? v.filter(x => x !== i) : [...v, i])}>
              <span className={`check ${on ? 'on' : ''}`} style={{ width: 22, height: 22, borderRadius: 7 }}>
                {on && <Icon name="check" size={14} strokeWidth={2.4} />}
              </span>
              {o}
            </button>
          )
        })}
      </div>
    )
  }

  if (q.type === 'ORDER') {
    const v = Array.isArray(value) ? value : []
    const s = Array.isArray(sol) ? sol : []
    return (
      <div className="flex flex-col gap-3">
        <div className="card flex min-h-[64px] flex-wrap items-center gap-2" aria-label={t('yourOrder')}>
          {v.length === 0 && <span className="t-foot">{t('tapInOrder')}</span>}
          {v.map((i, k) => (
            <button key={i} className="chip" disabled={locked} onClick={() => onChange(v.filter(x => x !== i))} style={reveal ? { background: s[k] === i ? 'color-mix(in srgb, var(--up) 18%, var(--surface))' : 'color-mix(in srgb, var(--down) 15%, var(--surface))' } : { background: 'var(--fill)' }}>
              {k + 1}. {q.options[i]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {q.options.map((o, i) =>
            v.includes(i) ? null : (
              <button key={i} className="opt w-auto" disabled={locked} onClick={() => onChange([...v, i])}>
                {o}
              </button>
            ),
          )}
        </div>
        {reveal && !reveal.correct && <p className="t-foot m-0">{t('rightOrder', { order: s.map(i => q.options[i]).join(' → ') })}</p>}
      </div>
    )
  }

  if (q.type === 'FILL_BLANK') {
    const [before, after] = q.prompt.split('____')
    return (
      <div className="flex flex-col gap-3">
        <p className="t-body card m-0 text-[17px] leading-7">
          {before}
          <b className="mx-1 inline-block min-w-20 rounded-lg border-b-2 px-2 text-center" style={{ borderColor: reveal ? (reveal.correct ? 'var(--up)' : 'var(--down)') : 'var(--brand)' }}>
            {typeof value === 'string' ? value : ' '}
          </b>
          {after}
        </p>
        <div className="flex flex-wrap gap-2">
          {q.options.map(o => (
            <button key={o} className={`opt w-auto ${optClass(reveal, sol === o, value === o)}`} aria-pressed={value === o} disabled={locked} onClick={() => onChange(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // SINGLE, TRUE_FALSE, CHART_TREND
  const row = q.type !== 'SINGLE'
  return (
    <div className="flex flex-col gap-3">
      {q.type === 'CHART_TREND' && q.chart && (
        <div className="card">
          <QuizChart values={q.chart} />
        </div>
      )}
      <div className={row ? 'grid gap-2' : 'flex flex-col gap-2.5'} style={row ? { gridTemplateColumns: `repeat(${q.options.length}, 1fr)` } : undefined}>
        {q.options.map((o, i) => (
          <button key={i} className={`opt ${row ? 'justify-center text-center' : ''} ${optClass(reveal, sol === i, value === i)}`} aria-pressed={value === i} disabled={locked} onClick={() => onChange(i)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

const hasAnswer = (v: AnswerValue) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== '')

/** Texto de ayuda encima del enunciado según el tipo */
export function useTypeHint() {
  const t = useTranslations('quiz.types')
  return (q: QuestionT) => t(q.type)
}

// ── Sin vidas (03.8) ─────────────────────────────────────
export function NoLives({ onClose }: { onClose?: () => void }) {
  const t = useTranslations('quiz')
  const toast = useToast()
  const refresh = useRefreshAll()
  const { data: lives } = useLives()
  const { data: me } = useMe()
  const { data: mistakes = 0 } = useQuery({ queryKey: ['mistakes'], queryFn: api.mistakesCount })
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const refill = useMutation({
    mutationFn: api.refillLives,
    onSuccess: () => {
      refresh()
      toast(t('refilled'))
      onClose?.()
    },
    onError: e => toast(e instanceof ApiFailure ? e.message : t('error')),
  })
  const gems = me?.gems ?? 0
  return (
    <div className="pad items-center pt-2.5 text-center">
      <Lumi mood="SAD" size={84} />
      <h1 className="t-large">{t('noLivesTitle')}</h1>
      <p className="t-body muted m-0">{t('noLivesBody')}</p>
      <div className="flex justify-center gap-1">
        {Array.from({ length: lives?.max ?? 5 }, (_, i) => (
          <Heart key={i} size={20} color={i < (lives?.current ?? 0) ? 'var(--down)' : 'var(--fill)'} />
        ))}
      </div>
      {lives?.nextRegenAt && (
        <span className="t-foot">
          {t('nextLife')} <b className="tabular-nums">{clock(lives.nextRegenAt, now)}</b>
        </span>
      )}
      <div className="h-2" />
      <Link href="/premium" className="btn btn-dark">
        {t('unlimited')}
      </Link>
      <button className="btn btn-secondary" disabled={gems < 350 || refill.isPending} onClick={() => refill.mutate()}>
        <Gem /> {t('refill', { have: gems })}
      </button>
      {mistakes > 0 && (
        <Link href="/quiz/review" className="btn btn-plain">
          {t('reviewMistakes', { n: mistakes })}
        </Link>
      )}
      <Link href="/mercado" className="btn btn-plain">
        {t('goMarket')}
      </Link>
    </div>
  )
}

// ── Resultado (03.7) ─────────────────────────────────────
function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let raf = 0
    const step = (n: number) => {
      const k = reduce ? 1 : Math.min(1, (n - t0) / 900)
      setV(Math.round(to * k))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    const done = setTimeout(() => setV(to), 1000) // por si la pestaña está en segundo plano
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(done)
    }
  }, [to])
  return <>+{v}</>
}

export function QuizResult({ r, lessonId, review, onRetry }: { r: QuizFinishT; lessonId: string | null; review?: boolean; onRetry: () => void }) {
  const t = useTranslations('quiz')
  const tg = useTranslations('goals')
  const locale = useLang()
  const { data: me } = useMe()
  const passed = r.stars > 0 || review
  const perfect = r.correct === r.total
  const secs = Math.round(r.durationMs / 1000)
  return (
    <div className="pad min-h-[calc(100dvh-20px)] items-center pt-9 text-center">
      <div className="animate-pop">
        <Lumi mood={r.companion?.mood ?? (perfect ? 'CELEBRATE' : passed ? 'HAPPY' : 'CALM')} size={84} />
      </div>
      <h1 className="t-large">{review ? t('reviewDone') : perfect ? t('perfect') : passed ? t('lessonDone') : t('almost')}</h1>
      {!review && (
        <div aria-label={t('starsLabel', { n: r.stars })}>
          <Stars n={r.stars} size={30} />
        </div>
      )}
      {r.companion && <p className="t-foot m-0 max-w-[340px]">{r.companion.message}</p>}
      <div className="grid w-full grid-cols-3 gap-2.5">
        <div className="stat items-center">
          <b className="up">
            <CountUp to={r.xp} />
          </b>
          <span className="t-cap">XP</span>
        </div>
        <div className="stat items-center">
          <b>
            {r.correct}/{r.total}
          </b>
          <span className="t-cap">{t('hits')}</span>
        </div>
        <div className="stat items-center">
          <b>
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </b>
          <span className="t-cap">{t('time')}</span>
        </div>
      </div>
      {r.xp > 0 && (
        <p className="t-cap m-0">
          {t('xpBreakdown', { base: r.xpBreakdown.base, perfect: r.xpBreakdown.perfectBonus, speed: r.xpBreakdown.speedBonus })}
          {r.xp > r.xpBreakdown.total && ` · ${t('xpExtra', { n: r.xp - r.xpBreakdown.total })}`}
        </p>
      )}
      <div className="banner banner-info w-full justify-center">
        <Flame /> {t('streak', { n: r.streak.days })}
        {r.streak.extendedToday ? ` · ${t('extended')}` : ''}
      </div>
      {r.goalsCompleted.map(g => (
        <div key={g} className="banner banner-info w-full justify-center">
          <Icon name="check" size={16} /> {t('goalDone', { goal: tg(g) })}
        </div>
      ))}
      {r.levelUp && (
        <div className="card animate-pop w-full">
          <b>{t('levelUp', { n: r.levelUp.to })}</b>
          <br />
          <span className="t-foot">{t('nowYouAre', { title: me?.level.title ?? '' })}</span>
        </div>
      )}
      {r.unlockedFeatures.length > 0 && <div className="card w-full text-left">{t('unlocked')}</div>}
      {r.achievementsUnlocked.map(a => (
        <div key={a.code} className="card animate-pop flex w-full items-center gap-3 text-left">
          <span className="ava" style={{ background: 'var(--brand)', color: '#fff' }}>
            {a.icon}
          </span>
          <span className="flex-1">
            <b>{a.title}</b>
            <br />
            <span className="t-cap">
              +{a.reward.gems} {t('gems')} · +{num(a.reward.xp, locale, 0)} XP
            </span>
          </span>
        </div>
      ))}
      <div className="flex-1" />
      {!passed && lessonId && (
        <button className="btn btn-primary" onClick={onRetry}>
          {t('retry')}
        </button>
      )}
      <Link href="/clases" className={`btn ${passed ? 'btn-primary' : 'btn-secondary'}`}>
        {t('continue')}
      </Link>
      <Link href="/mercado" className="btn btn-plain">
        {t('practice')}
      </Link>
    </div>
  )
}

// ── Quiz de lección y repaso (03.5–03.6) ─────────────────
export function Quiz({ id }: { id: string }) {
  const { ready } = useGuard('app')
  return ready ? <QuizInner id={id} /> : <PageSkeleton />
}

function QuizInner({ id }: { id: string }) {
  const t = useTranslations('quiz')
  const router = useRouter()
  const refresh = useRefreshAll()
  const hint = useTypeHint()
  const { data: me } = useMe()
  const [run, setRun] = useState(0)
  const start = useQuery({ queryKey: ['quiz-start', id, run], queryFn: () => api.quizStart(id), staleTime: Infinity, gcTime: 0, retry: false, refetchOnWindowFocus: false })
  const [i, setI] = useState(0)
  const [value, setValue] = useState<AnswerValue>(null)
  const [reveal, setReveal] = useState<AnswerResultT | null>(null)
  const [lives, setLives] = useState<number | null>(null)
  const [out, setOut] = useState(false)
  const shownAt = useRef(0)
  useEffect(() => {
    shownAt.current = Date.now()
  }, [i, run])

  const answer = useMutation({
    mutationFn: () => api.answer(start.data!.attemptId, start.data!.questions[i].id, value as number | number[] | string, Date.now() - shownAt.current),
    onSuccess: r => {
      setReveal(r)
      if (r.livesLeft !== null) setLives(r.livesLeft)
    },
  })
  const finish = useMutation({ mutationFn: () => api.quizFinish(start.data!.attemptId), onSuccess: refresh })

  const reset = () => {
    setI(0)
    setValue(null)
    setReveal(null)
    setLives(null)
    setOut(false)
    finish.reset()
    setRun(n => n + 1)
  }

  if (start.error instanceof ApiFailure && start.error.code === 'NO_LIVES') return <NoLives onClose={reset} />
  if (start.isError) return <ErrorState onRetry={() => start.refetch()} message={start.error.message} />
  if (!start.data) return <PageSkeleton />
  if (out) return <NoLives onClose={reset} />
  if (finish.data) return <QuizResult r={finish.data} lessonId={start.data.lessonId} review={id === 'review'} onRetry={reset} />

  const qs = start.data.questions
  const q = qs[i]
  const isLast = i === qs.length - 1
  const livesNow = lives ?? start.data.lives.current
  const lessonMode = id !== 'review'
  const next = () => {
    if (reveal && !reveal.correct && reveal.livesLeft === 0 && !isLast) {
      refresh()
      setOut(true)
      return
    }
    if (isLast) finish.mutate()
    else {
      setI(i + 1)
      setValue(null)
      setReveal(null)
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-20px)] flex-col">
      <div className="topbar gap-2 pr-3">
        <button className="icon-btn" onClick={() => router.push('/clases')} aria-label={t('exit')}>
          <Icon name="close" />
        </button>
        <Steps total={qs.length} current={i + (reveal ? 1 : 0)} label={t('progress', { i: i + 1, n: qs.length })} />
        {lessonMode && (
          <span className="chip bg-transparent px-1" aria-label={t('livesLabel')}>
            <Heart /> {me?.plan !== 'FREE' ? '∞' : livesNow}
          </span>
        )}
      </div>
      <div className="pad flex-1">
        <span className="t-foot">{id === 'review' ? t('reviewHint') : hint(q)}</span>
        {q.type !== 'FILL_BLANK' && <h1 className="t-title">{q.prompt}</h1>}
        <QuestionView key={q.id} q={q} value={value} onChange={setValue} reveal={reveal} />
      </div>
      <div className="sticky bottom-0" style={{ background: 'var(--bg)' }}>
        {reveal ? (
          <div className={`feedback ${reveal.correct ? 'ok' : 'bad'}`} aria-live="polite">
            <b className={reveal.correct ? 'up' : 'down'} style={{ fontSize: 17 }}>
              {reveal.correct ? t('correct') : reveal.livesLeft !== null ? t('wrongLife') : t('wrong')}
            </b>
            <span className="t-body">{reveal.explanation}</span>
            <button className={`btn ${reveal.correct ? 'btn-success' : 'btn-danger'}`} onClick={next} disabled={finish.isPending} autoFocus>
              {isLast ? t('seeResult') : reveal.correct ? t('continue') : t('gotIt')}
            </button>
          </div>
        ) : (
          <div className="px-4 pt-2.5" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <button className="btn btn-primary" disabled={!hasAnswer(value) || answer.isPending} onClick={() => answer.mutate()}>
              {hasAnswer(value) ? t('check') : t('pick')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Ruta /sin-vidas: protegida y con botón de cerrar */
export function NoLivesScreen() {
  const { ready } = useGuard('app')
  if (!ready) return <PageSkeleton />
  return (
    <>
      <TopBar close="/inicio" />
      <NoLives />
    </>
  )
}
