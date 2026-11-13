'use client'
// 03.5–03.8 · Quiz (7 tipos de pregunta), resultado y sin vidas. También el test de nivel.
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { ShareButton } from '../share'
import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { AnswerResultT, QuestionT, QuizFinishT } from '@/shared/contract'
import { clock, num } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useLives, useMe, useRefreshAll } from '../hooks'
import { useToast } from '../providers'
import { QuizChart } from '../ui/charts'
import { Gem, Heart, Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, Steps, TopBar } from '../ui/kit'
import { useGuard } from '../shell'
import { ReportButton } from '../report-button'
import { BadgeArt } from '../ui/badge'
import { Lumi } from '../ui/lumi'
import { Confetti, isStreakMilestone, StarsReveal, StreakFlame } from '../ui/celebrate'
import { GEM_PRICES, HINT_TYPES } from '@/shared/gem-shop'
import { useFx } from '../ui/sound'
import { MaxCard } from '../upgrade'
import { HelpTip } from '../ui/first-time'
import { TryItNow } from '../missions'
import { DYNAMIC, DynamicExercise, isAnswered } from './exercises'

export type AnswerValue = number | number[] | string | null
/** Respuesta cuando se acaba el tiempo de un reto cronometrado */
const TIMEOUT = '__timeout__'

const optClass = (reveal: AnswerResultT | null, isCorrect: boolean, isPicked: boolean) => (!reveal ? '' : isCorrect ? 'ok' : isPicked ? 'bad' : 'dim')

/** Pinta cualquier tipo de pregunta. `reveal` muestra la solución tras responder. */
export function QuestionView({ q, value, onChange, reveal, struck }: { q: QuestionT; value: AnswerValue; onChange: (v: AnswerValue) => void; reveal: AnswerResultT | null; struck?: number[] }) {
  const t = useTranslations('quiz')
  const sol = reveal?.correctAnswer
  const locked = !!reveal

  if (DYNAMIC.has(q.type)) return <DynamicExercise q={q} value={value} onChange={onChange} reveal={reveal} struck={struck} />

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
          <button key={i} className={`opt ${row ? 'justify-center text-center' : ''} ${optClass(reveal, sol === i, value === i)} ${struck?.includes(i) ? 'line-through opacity-35' : ''}`} aria-pressed={value === i} disabled={locked || struck?.includes(i)} onClick={() => onChange(i)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

const hasAnswer = (q: QuestionT, v: AnswerValue) => isAnswered(q, v)

/** Qué falta para poder comprobar, dicho según el tipo de ejercicio (el botón desactivado lo explica) */
const PICK: Partial<Record<QuestionT['type'], string>> = {
  MATCH: 'pickMatch', BUCKETS: 'pickBuckets', ORDER: 'pickOrder', PORTFOLIO: 'pickPortfolio', SIM_TRADE: 'pickSim',
  MULTIPLE: 'pickMany', SPOT: 'pickMany', PLACE_LEVEL: 'pickChart', CHART_POINT: 'pickChart', CHART_CANDLE: 'pickChart',
}

/** La respuesta buena en texto, para decirla al fallar (en el móvil el panel tapa a veces las opciones) */
function rightAnswer(q: QuestionT, sol: AnswerResultT['correctAnswer'] | undefined): string | null {
  if (typeof sol === 'string') return sol
  if (typeof sol === 'number' && ['SINGLE', 'TRUE_FALSE', 'CHART_TREND', 'SCENARIO', 'CHAT', 'UP_DOWN'].includes(q.type)) return q.options[sol] ?? null
  if (Array.isArray(sol) && q.type === 'MULTIPLE') return sol.map(i => q.options[i]).filter(Boolean).join(' · ') || null
  return null
}

/** Idea clave de la clase que más se parece a la pregunta (por palabras en común) */
function closestIdea(ideas: string[], text: string): string | null {
  const words = (x: string) => new Set(x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]{4,}/g) ?? [])
  const w = words(text)
  let best: string | null = null
  let score = 0
  for (const idea of ideas) {
    const n = [...words(idea)].filter(x => w.has(x)).length
    if (n > score) {
      best = idea
      score = n
    }
  }
  return best ?? ideas[0] ?? null
}

/** «No lo entiendo» tras un fallo (auditoría PRO-18, PRO-20 y PRO-27): una segunda explicación con otras palabras
 *  (la idea clave de la clase) y Lumi, con la pregunta ya escrita, para que explique por qué esa opción no era. */
function NotClear({ q, value, reveal, lessonId }: { q: QuestionT; value: AnswerValue; reveal: AnswerResultT; lessonId: string | null }) {
  const t = useTranslations('quiz')
  const [open, setOpen] = useState(false)
  const { data: lesson } = useQuery({ queryKey: ['lesson', lessonId], queryFn: () => api.lesson(lessonId!, true), enabled: open && !!lessonId, staleTime: Infinity })
  const ideas = (lesson?.steps ?? []).flatMap(s => (s.type === 'TEXT' && s.keyIdea ? [s.keyIdea] : []))
  const idea = closestIdea(ideas, `${q.prompt} ${reveal.explanation}`)
  const mine = typeof value === 'number' && q.options[value] ? q.options[value] : null
  const right = rightAnswer(q, reveal.correctAnswer)
  const ask = (mine && right ? t('askMine', { prompt: q.prompt, mine, right }) : t('askPlain', { prompt: q.prompt })).slice(0, 480)
  if (!open)
    return (
      <button className="btn btn-plain btn-sm self-start" onClick={() => setOpen(true)}>
        {t('notClear')}
      </button>
    )
  return (
    <div className="animate-rise flex flex-col gap-2 rounded-2xl px-3.5 py-3" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      {idea && (
        <span className="t-body">
          <b>{t('otherWay')}</b> {idea}
        </span>
      )}
      {mine && <span className="t-foot">{t('commonMistake', { mine })}</span>}
      <Link href={`/profesora?q=${encodeURIComponent(ask)}`} className="link text-[15px]">
        {t('askLumi')}
      </Link>
    </div>
  )
}

// Siempre en dos pasos: tocar elige (se puede cambiar) y «Comprobar» responde; después, «Continuar» pasa a la siguiente.
// Nada avanza solo: así un toque de más nunca responde la pregunta siguiente sin querer.
/** Milisegundos en los que una pregunta recién aparecida no acepta toques (evita el doble toque) */
const TAP_GUARD_MS = 450
/** Lo que se ha respondido en cada pregunta (para «Ver respuestas» al final) */
export type AnswerLog = { q: QuestionT; value: AnswerValue; reveal: AnswerResultT }[]

/** Texto de ayuda encima del enunciado según el tipo */
export function useTypeHint() {
  const t = useTranslations('quiz.types')
  return (q: QuestionT) => t(q.type)
}

// ── Sin vidas (03.8) ─────────────────────────────────────
export function NoLives({ onClose }: { onClose?: () => void }) {
  const ts = useTranslations('shop')
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
  const premium = !!me && me.plan !== 'FREE'
  // Desde el quiz (onClose) llega sin vidas seguro. Desde los corazones de Inicio puede tener vidas: entonces se explica qué son
  const out = !!onClose || (!premium && (lives?.current ?? 0) === 0)
  const max = lives?.max ?? 5
  return (
    <div className="pad items-center pt-2.5 text-center">
      <Lumi mood={out ? 'SAD' : 'HAPPY'} size={84} />
      <h1 className="t-large">{out ? t('noLivesTitle') : premium ? t('livesUnlimitedTitle') : t('livesTitle', { n: lives?.current ?? 0, max })}</h1>
      <p className="t-body muted m-0">{out ? t('noLivesBody') : premium ? t('livesUnlimitedBody') : t('livesBody', { h: lives?.regenHours ?? 4 })}</p>
      {!premium && (
        <div className="flex justify-center gap-1" aria-hidden>
          {Array.from({ length: max }, (_, i) => (
            <Heart key={i} size={20} color={i < (lives?.current ?? 0) ? 'var(--down)' : 'var(--fill)'} />
          ))}
        </div>
      )}
      {!premium && lives?.nextRegenAt && (
        <span className="t-foot">
          {t('nextLife')} <b className="tabular-nums">{clock(lives.nextRegenAt, now)}</b>
        </span>
      )}
      <div className="h-2" />
      {!out && (
        <Link href="/clases" className="btn btn-primary">
          {t('keepLearning')}
        </Link>
      )}
      {!premium && (
        <Link href="/premium" className={`btn ${out ? 'btn-dark' : 'btn-secondary'}`}>
          {t('unlimited')}
        </Link>
      )}
      {!premium && (lives?.current ?? 0) < max && (
        <button className="btn btn-secondary" disabled={gems < 350 || refill.isPending} onClick={() => refill.mutate()}>
          <Gem /> {t('refill', { have: gems })}
        </button>
      )}
      {/* Salida gratis: repasar fallos devuelve una vida (auditoría PRO-7) */}
      {!premium && mistakes > 0 && (lives?.current ?? 0) < max && (
        <Link href="/quiz/review" className="card flex items-center gap-3 text-left" style={{ color: 'inherit' }}>
          <Heart />
          <span className="flex-1">
            <b className="block">{ts('reviewLife')}</b>
            <span className="t-cap">{ts('reviewLifeBody')}</span>
          </span>
          <Icon name="chev" size={16} />
        </Link>
      )}
      {out && mistakes > 0 && premium && (
        <Link href="/quiz/review" className="btn btn-plain">
          {t('reviewMistakes', { n: mistakes })}
        </Link>
      )}
      {out && (
        <Link href="/mercado" className="btn btn-plain">
          {t('goMarket')}
        </Link>
      )}
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

/** Repaso de lo respondido: cada pregunta con tu respuesta, la buena y el porqué */
function AnswersReview({ log }: { log: AnswerLog }) {
  const t = useTranslations('quiz')
  const hint = useTypeHint()
  return (
    <div className="flex w-full flex-col gap-3 text-left">
      {log.map(({ q, value, reveal }, k) => (
        <div key={q.id + k} className="card flex flex-col gap-2.5">
          <span className="t-cap flex items-center justify-between gap-2 font-bold">
            <span>{t('questionN', { n: k + 1 })} · {hint(q)}</span>
            {reveal.scored === false ? (
              <span className="chip">{t('humilityChip')}</span>
            ) : (
              <span className={`chip ${reveal.correct ? 'up' : 'down'}`}>
                <Icon name={reveal.correct ? 'check' : 'close'} size={14} /> {reveal.correct ? t('gotRight') : t('gotWrong')}
              </span>
            )}
          </span>
          {q.type === 'SCENARIO' ? <p className="t-body m-0">{q.prompt}</p> : q.type !== 'FILL_BLANK' && q.type !== 'CHAT' && <b className="t-head">{q.prompt}</b>}
          <div className="pointer-events-none" aria-disabled>
            <QuestionView q={q} value={value} onChange={() => {}} reveal={reveal} />
          </div>
          <div className={`feedback ${reveal.scored === false ? 'neutral' : reveal.correct ? 'ok' : 'bad'} rounded-2xl`} style={{ position: 'static' }}>
            <b className={reveal.scored === false ? undefined : reveal.correct ? 'up' : 'down'}>{reveal.scored === false ? t('humilityWhy') : reveal.correct ? t('whyRight') : t('whyWrong')}</b>
            <span className="t-body whitespace-pre-line">{reveal.explanation}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function QuizResult({ r, lessonId, review, testOut, onRetry, log = [] }: { r: QuizFinishT; lessonId: string | null; review?: boolean; testOut?: boolean; onRetry: () => void; log?: AnswerLog }) {
  const t = useTranslations('quiz')
  const [showAnswers, setShowAnswers] = useState(false)
  // La ronda de humildad no cuenta como fallo
  const misses = log.filter(x => !x.reveal.correct && x.reveal.scored !== false).length
  const tg = useTranslations('goals')
  const locale = useLang()
  const { data: me } = useMe()
  const ts = useTranslations('shop')
  const passed = r.stars > 0 || review
  const perfect = r.correct === r.total
  const secs = Math.round(r.durationMs / 1000)
  // Racha que llega hoy a 7, 30 o 100 días: celebración especial (auditoría PRO-10)
  const milestone = r.streak.extendedToday && isStreakMilestone(r.streak.days)
  const big = perfect || milestone || !!r.levelUp
  // «Lo que te llevas»: las ideas clave de la clase, que ya están en la caché de la lección (auditoría PRO-19)
  const { data: lesson } = useQuery({ queryKey: ['lesson', lessonId], queryFn: () => api.lesson(lessonId!, true), enabled: !!lessonId && passed && !review && !testOut, staleTime: Infinity })
  const takeaways = (lesson?.steps ?? []).flatMap(s => (s.type === 'TEXT' && s.keyIdea ? [s.keyIdea] : [])).slice(0, 3)
  // Sonido de clase terminada (solo si está activado en Ajustes)
  const fx = useFx()
  useEffect(() => {
    if (passed) fx('done')
  }, [passed, fx])
  return (
    <div className="pad min-h-[calc(100dvh-20px)] items-center pt-9 text-center">
      {passed && <Confetti amount={big ? 140 : 70} />}
      <div className="animate-pop">
        <Lumi mood={r.companion?.mood ?? (perfect ? 'CELEBRATE' : passed ? 'HAPPY' : 'CALM')} size={84} className={passed ? 'lumi-celebrate' : undefined} />
      </div>
      <h1 className="t-large">{testOut ? (passed ? t('testOutPassed') : t('testOutFailed')) : review ? t('reviewDone') : perfect ? t('perfect') : passed ? t('lessonDone') : t('almost')}</h1>
      {testOut && <p className="t-body m-0 max-w-[340px]">{passed ? t('testOutPassedBody') : t('testOutFailedBody')}</p>}
      {/* Suspendido: qué hacía falta para aprobar y qué hacer ahora */}
      {!testOut && !review && !passed && <p className="t-body m-0 max-w-[340px]">{t('failedBody', { pct: lessonId?.endsWith('boss') ? 80 : 60 })}</p>}
      {!review && (
        <div role="img" aria-label={t('starsLabel', { n: r.stars })}>
          <StarsReveal n={r.stars} />
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
          {/* Solo las partes que suman algo: «quiz perfecto +0» no dice nada */}
          {[
            t('xpBase', { n: r.xpBreakdown.base }),
            r.xpBreakdown.perfectBonus > 0 && t('xpPerfect', { n: r.xpBreakdown.perfectBonus }),
            r.xpBreakdown.speedBonus > 0 && t('xpSpeed', { n: r.xpBreakdown.speedBonus }),
            r.xp > r.xpBreakdown.total && t('xpExtra', { n: r.xp - r.xpBreakdown.total }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      <HelpTip id="xp" title={t('xpWhatTitle')} className="w-full text-left">
        <span>{t('xpWhatBody')}</span>
      </HelpTip>
      {r.lifeWon && (
        <div className="banner banner-info milestone-in w-full justify-center" role="status">
          <Heart /> {ts('lifeWon')}
        </div>
      )}
      {milestone && (
        <div className="hero milestone-in flex w-full items-center gap-3 text-left" role="status">
          <StreakFlame grew size={44} />
          <span className="flex-1">
            <b className="t-head block">{t('milestoneTitle', { n: r.streak.days })}</b>
            <span className="t-foot" style={{ color: 'inherit', opacity: 0.85 }}>
              {t('milestoneBody')}
            </span>
          </span>
        </div>
      )}
      {takeaways.length > 0 && (
        <div className="card milestone-in flex w-full flex-col gap-2 text-left" style={{ animationDelay: '0.9s' }}>
          <b className="t-head">{t('takeaways')}</b>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {takeaways.map(k => (
              <li key={k} className="t-body flex gap-2">
                <Icon name="check" size={18} className="mt-0.5 flex-none up" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="banner banner-info w-full justify-center">
        <StreakFlame grew={r.streak.extendedToday} size={18} /> {r.streak.extendedToday ? (r.streak.days === 1 ? t('streakStarted') : t('streakUp', { n: r.streak.days })) : t('dayStreak', { n: r.streak.days })}
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
          <BadgeArt code={a.code} category={a.category} unlocked size={44} label={a.title} />
          <span className="flex-1">
            <b>{a.title}</b>
            <br />
            <span className="t-cap">
              +{a.reward.gems} {t('gems')} · +{num(a.reward.xp, locale, 0)} XP
            </span>
          </span>
        </div>
      ))}
      {/* Al terminar «Invierte desde hoy» (el pico de motivación): el siguiente paso, con la oferta de Max si no la tiene */}
      {lessonId === 's0boss' && passed && (
        <div className="flex w-full flex-col gap-2 text-left">
          <b className="t-head">{t('s0Done')}</b>
          <MaxCard />
        </div>
      )}
      {passed && lessonId && !review && !testOut && <TryItNow lessonId={lessonId} />}
      {log.length > 0 && (
        <button className="btn btn-secondary" onClick={() => setShowAnswers(v => !v)} aria-expanded={showAnswers}>
          {showAnswers ? t('hideAnswers') : misses ? t('seeAnswersMisses', { n: misses }) : t('seeAnswers')}
        </button>
      )}
      {showAnswers && <AnswersReview log={log} />}
      <div className="flex-1" />
      {!passed && lessonId && (
        <button className="btn btn-primary" onClick={onRetry}>
          {t('retry')}
        </button>
      )}
      <Link href="/clases" className={`btn ${passed ? 'btn-primary' : 'btn-secondary'}`}>
        {t('continue')}
      </Link>
      {passed && lessonId && !review && <ShareButton what={{ t: 'clase', id: lessonId, s: r.stars }} />}
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
  const toast = useToast()
  const { data: me } = useMe()
  const [run, setRun] = useState(0)
  const start = useQuery({ queryKey: ['quiz-start', id, run], queryFn: () => api.quizStart(id), staleTime: Infinity, gcTime: 0, retry: false, refetchOnWindowFocus: false })
  const [i, setI] = useState(0)
  const [value, setValue] = useState<AnswerValue>(null)
  // Pista con gemas (auditoría PRO-1): opciones tachadas de la pregunta actual
  const [struck, setStruck] = useState<number[]>([])
  const ts = useTranslations('shop')
  const fx = useFx()
  const buyHint = useMutation({
    mutationFn: () => api.hint(start.data!.attemptId, start.data!.questions[i].id),
    onSuccess: r => (setStruck([r.removed]), refresh(), toast(ts('hintUsed'))),
    onError: e => toast(e instanceof ApiFailure && e.code === 'INSUFFICIENT_GEMS' ? ts('notEnough') : ts('error')),
  })
  const [reveal, setReveal] = useState<AnswerResultT | null>(null)
  const [lives, setLives] = useState<number | null>(null)
  const [out, setOut] = useState(false)
  /** Aciertos seguidos: la racha del quiz */
  const [streak, setStreak] = useState(0)
  const [log, setLog] = useState<AnswerLog>([])
  const shownAt = useRef(0)
  useEffect(() => {
    shownAt.current = Date.now()
  }, [i, run])

  const answer = useMutation({
    mutationFn: (v: AnswerValue) => api.answer(start.data!.attemptId, start.data!.questions[i].id, v as number | number[] | string, Date.now() - shownAt.current),
    onSuccess: (r, v) => {
      setReveal(r)
      const q = start.data?.questions[i]
      if (q) setLog(l => [...l.filter(x => x.q.id !== q.id), { q, value: v, reveal: r }])
      if (r.scored !== false) fx(r.correct ? 'right' : 'wrong')
      // La ronda de humildad ni suma ni corta la cadena de aciertos: no puntúa
      if (r.scored !== false) setStreak(n => (r.correct ? n + 1 : 0))
      if (r.livesLeft !== null) setLives(r.livesLeft)
    },
    // Sin esto, un fallo (sin vidas, quiz caducado o cerrado, sin conexión) dejaba el botón sin hacer nada
    onError: e => {
      if (e instanceof ApiFailure && e.code === 'NO_LIVES') {
        refresh()
        setOut(true)
      } else toast(e instanceof ApiFailure ? e.message : t('error'))
    },
  })
  const finish = useMutation({ mutationFn: () => api.quizFinish(start.data!.attemptId), onSuccess: refresh, onError: e => toast(e instanceof ApiFailure ? e.message : t('error')) })

  // Retos cronometrados: cuenta atrás; al llegar a 0 se responde solo (cuenta como fallo)
  const limit = start.data?.questions[i]?.meta?.timeLimit
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    if (!limit || reveal) return
    const t0 = Date.now()
    const id = setInterval(() => setLeft(Math.max(0, limit - Math.floor((Date.now() - t0) / 1000))), 250)
    return () => clearInterval(id)
  }, [limit, i, run, reveal])
  const { mutate: send, isPending: sending } = answer
  useEffect(() => {
    if (limit && left === 0 && !reveal && !sending) send(TIMEOUT)
  }, [left, limit, reveal, sending, send])

  const isLast = !!start.data && i === start.data.questions.length - 1
  function next() {
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
      setLeft(null)
      setStruck([])
    }
  }

  const reset = () => {
    setStreak(0)
    setLog([])
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
  if (finish.data) return <QuizResult r={finish.data} lessonId={start.data.lessonId} review={id === 'review'} testOut={id.startsWith('testout-')} onRetry={reset} log={log} />

  const qs = start.data.questions
  const q = qs[i]
  const livesNow = lives ?? start.data.lives.current
  const lessonMode = id !== 'review' && !id.startsWith('testout-')
  // Tocar solo elige (se puede cambiar); responder es siempre con «Comprobar»
  const pick = (v: AnswerValue) => {
    if (reveal || answer.isPending) return
    if (Date.now() - shownAt.current < TAP_GUARD_MS) return
    setValue(v)
  }

  return (
    <div className="flex min-h-[calc(100dvh-20px)] flex-col">
      <div className="topbar gap-2 pr-3">
        <button className="icon-btn" onClick={() => router.push('/clases')} aria-label={t('exit')}>
          <Icon name="close" />
        </button>
        <Steps total={qs.length} current={i + (reveal ? 1 : 0)} label={t('progress', { i: i + 1, n: qs.length })} />
        {/* Como en la clase: en qué pregunta vas, también en número */}
        <span className="t-cap flex-none tabular-nums" aria-hidden>
          {i + 1}/{qs.length}
        </span>
        {/* Aciertos seguidos dentro del quiz (no es la racha de días: por eso no lleva la llama) */}
        {streak >= 2 && (
          <span key={streak} className="chip animate-pop px-2" style={{ background: 'color-mix(in srgb, var(--up) 18%, var(--surface))' }} aria-label={t('streak', { n: streak })}>
            <Icon name="check" size={14} strokeWidth={2.4} /> ×{streak}
          </span>
        )}
        {lessonMode && (
          <span className="chip bg-transparent px-1" aria-label={t('livesLabel')}>
            <Heart /> {me?.plan !== 'FREE' ? '∞' : livesNow}
          </span>
        )}
        <ReportButton context={{ ...(start.data.lessonId ? { lessonId: start.data.lessonId } : {}), quizId: id, questionId: q.id }} />
      </div>
      <div className="pad flex-1">
        <span className="t-foot flex items-center justify-between gap-2">
          {id === 'review' ? t('reviewHint') : q.meta?.review ? <b style={{ color: 'var(--brand-ink)' }}>{t('mixedReview')}</b> : hint(q)}
          {limit && !reveal && (
            <b className="chip inline-flex items-center gap-1 tabular-nums" style={{ background: (left ?? limit) <= 3 ? 'var(--down)' : 'var(--fill)', color: (left ?? limit) <= 3 ? '#fff' : undefined }} aria-live="polite">
              <Icon name="clock" size={14} /> {left ?? limit} s
            </b>
          )}
        </span>
        {/* En el chat la pregunta («¿Qué le contestas?») va después de los mensajes: primero el contexto */}
        {q.type === 'SCENARIO' ? <p className="t-body card m-0 text-[17px] leading-7">{q.prompt}</p> : q.type !== 'FILL_BLANK' && q.type !== 'CHAT' && <h1 className="t-title">{q.prompt}</h1>}
        {/* Ronda de humildad: se avisa antes de responder de que no puntúa ni quita vida (P0-7) */}
        {q.meta?.blind && (
          <span className="chip self-start" style={{ background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))' }}>
            {t('humilityTag')}
          </span>
        )}
        <div key={`${q.id}-${reveal ? (reveal.correct ? 'ok' : 'ko') : 'q'}`} className={reveal && !reveal.correct && reveal.scored !== false ? 'animate-shake' : undefined}>
          <QuestionView key={q.id} q={q} value={value} onChange={pick} reveal={reveal} struck={struck} />
        </div>
        {/* Pista: solo en preguntas de una respuesta, antes de responder y una vez */}
        {!reveal && HINT_TYPES.has(q.type) && q.options.length >= 3 && struck.length === 0 && (
          <button className="chip self-start" onClick={() => buyHint.mutate()} disabled={buyHint.isPending} aria-label={ts('hintAria', { n: GEM_PRICES.hint })}>
            <Gem /> {ts('hint', { n: GEM_PRICES.hint })}
          </button>
        )}
      </div>
      <div className="sticky bottom-0" style={{ background: 'var(--bg)' }}>
        {reveal && reveal.scored === false ? (
          <div className="feedback neutral" aria-live="polite">
            <b className="inline-block self-start" style={{ fontSize: 17 }}>
              {reveal.correct ? t('humilityRight') : t('humilityWrong')}
            </b>
            <span className="t-body whitespace-pre-line">{reveal.explanation}</span>
            <button className="btn btn-primary" onClick={next} disabled={finish.isPending} autoFocus>
              {isLast ? t('seeResult') : t('continue')}
            </button>
          </div>
        ) : reveal ? (
          <div className={`feedback ${reveal.correct ? 'ok' : 'bad'}`} aria-live="polite">
            {/* Lumi reacciona: celebra los aciertos (más con racha) y anima tras un fallo (auditoría PRO-26) */}
            <span className="flex items-center gap-2.5">
              <Lumi key={q.id} mood={reveal.scored === false ? 'THINKING' : reveal.correct ? (streak >= 3 ? 'CELEBRATE' : 'HAPPY') : 'CALM'} size={38} className={reveal.correct ? 'lumi-celebrate animate-pop' : 'animate-pop'} />
              <b className={`${reveal.correct ? 'up animate-pop' : 'down'} inline-block`} style={{ fontSize: 17 }}>
                {reveal.correct ? (streak >= 2 ? t('correctStreak', { n: streak }) : t('correct')) : reveal.livesLeft !== null ? t('wrongLife', { n: reveal.livesLeft }) : t('wrong')}
              </b>
            </span>
            {!reveal.correct && rightAnswer(q, reveal.correctAnswer) && (
              <span className="t-body">
                <b>{t('rightAnswerIs')}</b> {rightAnswer(q, reveal.correctAnswer)}
              </span>
            )}
            <span className="t-body whitespace-pre-line">{reveal.explanation}</span>
            {!reveal.correct && <NotClear key={q.id} q={q} value={value} reveal={reveal} lessonId={start.data?.lessonId ?? null} />}
            <button className={`btn ${reveal.correct ? 'btn-success' : 'btn-danger'}`} onClick={next} disabled={finish.isPending} autoFocus>
              {isLast ? t('seeResult') : reveal.correct ? t('continue') : t('gotIt')}
            </button>
          </div>
        ) : (
          <div className="px-4 pt-2.5" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <button className="btn btn-primary" disabled={!hasAnswer(q, value) || answer.isPending} onClick={() => answer.mutate(value)}>
              {answer.isPending ? t('checking') : hasAnswer(q, value) ? t('check') : t(PICK[q.type] ?? 'pick')}
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
