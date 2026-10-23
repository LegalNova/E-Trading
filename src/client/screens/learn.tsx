'use client'
// 03.1 Inicio · 03.2 Camino de clases · 03.3–03.4 Pasos de lección
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { LessonStepT, PathLessonT } from '@/shared/contract'
import { money, num, signedMoney } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useHome, useLang, useMe, usePath } from '../hooks'
import { useGuard } from '../shell'
import { useToast } from '../providers'
import { CandleChart, LineChart } from '../ui/charts'
import { Flame, Gem, Heart, Icon } from '../ui/icons'
import { Bar, ErrorState, PageSkeleton, Sheet, Stars, Steps } from '../ui/kit'
import { Lumi, LumiSays } from '../ui/lumi'

// ── Inicio ───────────────────────────────────────────────
export function Home() {
  const t = useTranslations('home')
  const tg = useTranslations('goals')
  const locale = useLang()
  const toast = useToast()
  const { data: h, isError, refetch } = useHome()
  const { data: me } = useMe()
  if (isError) return <ErrorState onRetry={refetch} />
  if (!h || !me) return <PageSkeleton />
  const done = h.dailyGoals.filter(g => g.done).length
  const premium = me.plan === 'PREMIUM'
  const dayUp = Number(h.portfolio.dayChange) >= 0
  return (
    <div className="pad">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <h1 className="t-title truncate">{t('hello', { name: h.user.name })}</h1>
        <div className="flex flex-none items-center gap-1.5">
          <Link href="/perfil/racha" className="chip" aria-label={t('streakLabel', { n: h.streak.days })}>
            <Flame color={h.streak.todayDone ? 'var(--brand)' : 'var(--ink-3)'} />
            {h.streak.days}
          </Link>
          <button className="chip" onClick={() => toast(t('gemsInfo', { n: h.gems }))} aria-label={t('gemsLabel', { n: h.gems })}>
            <Gem />
            {num(h.gems, locale, 0)}
          </button>
          <Link href="/sin-vidas" className="chip" aria-label={t('livesLabel')}>
            <Heart />
            {premium ? '∞' : h.lives.current}
          </Link>
          <Link href="/avisos" className="icon-btn hidden h-9 w-9 sm:flex md:hidden" aria-label={t('notifications')}>
            <Icon name="bell" size={20} />
          </Link>
        </div>
      </div>

      <LumiSays mood={h.companion.mood} message={h.companion.message} skin={me.companion.skinId} />

      {h.nextLesson ? (
        <div className="hero flex flex-col gap-2.5">
          <div className="t-cap flex justify-between" style={{ color: 'rgb(255 255 255 / 0.65)' }}>
            <span>{t('nextLesson', { unit: h.nextLesson.unitOrder })}</span>
            <span>{h.nextLesson.minutes} min</span>
          </div>
          <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]">{h.nextLesson.title}</span>
          <div className="flex items-center gap-2.5">
            <Bar pct={h.nextLesson.progressPct} color="#fff" label={t('unitProgress')} />
            <Link href={`/leccion/${h.nextLesson.id}`} className="btn btn-primary btn-sm">
              {t('continue')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="hero flex flex-col gap-2.5">
          <span className="text-[22px] font-extrabold">{premium ? t('allDone') : t('freeDone')}</span>
          <Link href={premium ? '/clases' : '/premium'} className="btn btn-primary btn-sm self-start">
            {premium ? t('seePath') : t('seePremium')}
          </Link>
        </div>
      )}

      <div className="card flex flex-col gap-2.5">
        <div className="flex justify-between">
          <span className="t-head">{t('goalsTitle')}</span>
          <span className="t-foot">{t('goalsCount', { done, total: h.dailyGoals.length })}</span>
        </div>
        {h.dailyGoals.map(g => (
          <div key={g.id} className="t-body flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className={`check ${g.done ? 'on' : ''}`} style={{ width: 20, height: 20, borderRadius: 6 }}>
                {g.done && <Icon name="check" size={13} strokeWidth={2.4} />}
              </span>
              {tg(g.id)}
            </span>
            <span className="t-foot" style={g.done ? { color: 'var(--up)', fontWeight: 700 } : undefined}>
              {g.done ? `+${g.xp} XP` : `${g.progress}/${g.target}`}
            </span>
          </div>
        ))}
        {done === h.dailyGoals.length && <span className="t-cap">{t('allGoals')}</span>}
      </div>

      <Link href="/mercado/cartera" className="card flex flex-col gap-1.5" style={{ color: 'inherit' }}>
        <span className="t-foot">{t('portfolio')}</span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[26px] font-extrabold tracking-[-0.02em]">{money(h.portfolio.totalValue, 'EUR', locale)}</span>
          <span className={`t-foot font-bold ${dayUp ? 'up' : 'down'}`}>
            {dayUp ? '▲' : '▼'} {signedMoney(h.portfolio.dayChange, 'EUR', locale)} {t('today')}
          </span>
        </div>
        <LineChart values={h.portfolio.sparkline} up={dayUp} height={50} fill={false} label={t('portfolioChart')} />
      </Link>

      <div className="t-foot flex items-center justify-between px-1">
        <Link href="/perfil" style={{ color: 'inherit' }}>
          {t('level', { n: me.level.n, title: me.level.title, xp: num(me.level.xp, locale, 0) })}
        </Link>
      </div>
    </div>
  )
}

// ── Camino de clases ─────────────────────────────────────
function LessonRow({ l, onLocked }: { l: PathLessonT; onLocked: (l: PathLessonT) => void }) {
  const t = useTranslations('path')
  const open = l.status === 'AVAILABLE'
  const done = l.status === 'COMPLETED'
  const body = (
    <>
      <span className="ava rounded-full" style={done ? { background: 'var(--up)', color: '#fff' } : open ? { background: 'var(--brand)', color: '#fff' } : undefined}>
        {done ? <Icon name="check" size={18} strokeWidth={2.4} /> : l.status === 'LOCKED' ? <Icon name="lock" size={16} /> : l.isUnitReview ? '★' : <Icon name="learn" size={17} />}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <b className="text-[15px]">{l.title}</b>
        <span className="t-cap" style={open ? { color: 'var(--brand)', fontWeight: 700 } : undefined}>
          {done ? (
            <>
              {t('completed')} · <Stars n={l.stars} size={12} />
            </>
          ) : open ? (
            t('available', { min: l.minutes, xp: l.xp })
          ) : l.requiresPremium ? (
            t('premium')
          ) : l.isUnitReview ? (
            t('lockedReview')
          ) : (
            t('locked')
          )}
        </span>
      </span>
      {l.requiresPremium && (
        <span className="chip text-[11px]" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          Premium
        </span>
      )}
    </>
  )
  const style = { border: `2px solid ${open ? 'var(--brand)' : 'transparent'}`, opacity: l.status === 'LOCKED' ? 0.6 : 1, color: 'inherit' }
  if (l.status === 'LOCKED')
    return (
      <button className="card flex items-center gap-3 text-left" style={style} onClick={() => onLocked(l)}>
        {body}
      </button>
    )
  return (
    <Link href={`/leccion/${l.id}`} className="card flex items-center gap-3 text-left" style={style}>
      {body}
    </Link>
  )
}

export function Path() {
  const t = useTranslations('path')
  const router = useRouter()
  const { data: p, isError, refetch } = usePath()
  const { data: mistakes = 0 } = useQuery({ queryKey: ['mistakes'], queryFn: api.mistakesCount })
  const [locked, setLocked] = useState<PathLessonT | null>(null)
  if (isError) return <ErrorState onRetry={refetch} />
  if (!p) return <PageSkeleton />
  const current = p.units.find(u => u.id === p.currentUnitId) ?? p.units[0]
  return (
    <div className="pad">
      <div className="flex items-center justify-between px-0.5">
        <h1 className="t-large">{t('title')}</h1>
        {mistakes > 0 && (
          <Link href="/quiz/review" className="link text-sm">
            {t('review', { n: mistakes })}
          </Link>
        )}
      </div>
      {p.units.map(u => {
        const empty = u.lessons.length === 0
        const isCurrent = u.id === current.id
        return (
          <section key={u.id} className="flex flex-col gap-3" aria-labelledby={`unit-${u.id}`}>
            {isCurrent ? (
              <div className="hero flex flex-col gap-2">
                <span className="t-cap" style={{ color: 'rgb(255 255 255 / 0.65)' }}>
                  {t('unitOf', { n: u.order, total: p.units.length })}
                </span>
                <span id={`unit-${u.id}`} className="text-2xl font-extrabold tracking-[-0.02em]">
                  {u.title}
                </span>
                <span className="t-cap" style={{ color: 'rgb(255 255 255 / 0.65)' }}>
                  {u.description}
                </span>
                <div className="flex items-center gap-2.5">
                  <Bar pct={u.progressPct} color="#fff" />
                  <span className="t-cap font-extrabold" style={{ color: '#fff' }}>
                    {u.progressPct} %
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-end justify-between gap-2 px-1">
                <span>
                  <b id={`unit-${u.id}`} className="t-head">
                    {t('unitN', { n: u.order })} · {u.title}
                  </b>
                  <br />
                  <span className="t-cap">{empty ? t('soon') : u.description}</span>
                </span>
                {u.premiumOnly && <span className="chip text-[11px]" style={{ background: 'var(--fill)' }}>Premium</span>}
              </div>
            )}
            {u.unlocksFeature && <div className="banner banner-info">{t('unlocksOrders')}</div>}
            {u.lessons.map(l => (
              <LessonRow key={l.id} l={l} onLocked={setLocked} />
            ))}
          </section>
        )
      })}
      <Sheet open={!!locked} onClose={() => setLocked(null)} label={t('lockedTitle')}>
        <div className="flex items-center gap-3">
          <Lumi mood="THINKING" size={48} />
          <span className="t-head">{locked?.requiresPremium ? t('premiumTitle') : t('lockedTitle')}</span>
        </div>
        <p className="t-body muted m-0">{locked?.requiresPremium ? t('premiumBody') : t('lockedBody')}</p>
        {locked?.requiresPremium && (
          <button className="btn btn-primary" onClick={() => router.push('/premium')}>
            {t('seePremium')}
          </button>
        )}
        <button className="btn btn-plain" onClick={() => setLocked(null)}>
          {t('ok')}
        </button>
      </Sheet>
    </div>
  )
}

// ── Lección ──────────────────────────────────────────────
function Illustration({ kind }: { kind: string }) {
  const t = useTranslations('lesson')
  if (kind === 'candles')
    return (
      <>
        <div className="card flex justify-center gap-14 p-[22px]">
          <svg width="40" height="120" viewBox="0 0 40 120" role="img" aria-label={t('greenCandle')}>
            <line x1="20" x2="20" y1="6" y2="114" stroke="var(--up)" strokeWidth="2.5" />
            <rect x="8" y="28" width="24" height="60" rx="3" fill="var(--up)" />
          </svg>
          <svg width="40" height="120" viewBox="0 0 40 120" role="img" aria-label={t('redCandle')}>
            <line x1="20" x2="20" y1="10" y2="100" stroke="var(--down)" strokeWidth="2.5" />
            <rect x="8" y="22" width="24" height="44" rx="3" fill="var(--down)" />
          </svg>
        </div>
        <div className="t-foot flex justify-center gap-[72px] font-bold">
          <span className="up">{t('rises')}</span>
          <span className="down">{t('falls')}</span>
        </div>
      </>
    )
  const pts = kind === 'trend' ? [60, 70, 64, 80, 74, 92, 86, 104, 98, 116] : [70, 92, 74, 100, 72, 98, 75, 102, 73, 96]
  return (
    <div className="card">
      <svg viewBox="0 0 300 140" className="h-auto w-full" role="img" aria-label={kind === 'trend' ? t('trendImg') : t('supportImg')}>
        {kind === 'support' && (
          <>
            <rect x="0" y="100" width="300" height="16" fill="color-mix(in srgb, var(--up) 15%, transparent)" />
            <rect x="0" y="22" width="300" height="16" fill="color-mix(in srgb, var(--down) 15%, transparent)" />
          </>
        )}
        <path d={pts.map((v, i) => `${i ? 'L' : 'M'}${10 + i * 31} ${140 - v}`).join(' ')} fill="none" stroke="var(--ink)" strokeWidth="2.4" />
      </svg>
      {kind === 'support' && (
        <div className="t-cap flex justify-between">
          <span className="up font-bold">{t('support')}</span>
          <span className="down font-bold">{t('resistance')}</span>
        </div>
      )}
    </div>
  )
}

function StepView({ s, lessonId, onSolved, solved }: { s: LessonStepT; lessonId: string; onSolved: () => void; solved: boolean }) {
  const t = useTranslations('lesson')
  const [pick, setPick] = useState<number | null>(null)
  const check = useMutation({ mutationFn: (i: number) => api.checkStep(lessonId, s.id, i), onSuccess: r => r.correct && onSolved() })
  const tip = 'companionTip' in s && s.companionTip ? <LumiSays mood="THINKING" message={s.companionTip} size={36} /> : null
  switch (s.type) {
    case 'TEXT':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <p className="t-body m-0 text-[17px] leading-[26px]">{s.body}</p>
          {tip}
        </>
      )
    case 'IMAGE':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <Illustration kind={s.image} />
          <p className="t-body m-0 text-[17px] leading-[26px]">{s.body}</p>
          {tip}
        </>
      )
    case 'VIDEO':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <video src={s.url} controls className="w-full rounded-[18px]" />
          {tip}
        </>
      )
    case 'INTERACTIVE_CHART': {
      const r = check.data
      return (
        <>
          <h1 className="t-title">{s.prompt}</h1>
          <span className="t-cap">{s.caption}</span>
          <div className="card">
            <CandleChart
              candles={s.candles.map(([o, h, l, c]) => ({ o, h, l, c }))}
              label={s.caption}
              selected={pick}
              state={r ? (r.correct ? 'ok' : 'bad') : null}
              onPick={
                solved
                  ? undefined
                  : i => {
                      setPick(i)
                      check.mutate(i)
                    }
              }
            />
          </div>
          {r && (
            <div className="card" style={{ background: `color-mix(in srgb, var(--${r.correct ? 'up' : 'down'}) 11%, var(--surface))` }} aria-live="polite">
              <b className={r.correct ? 'up' : 'down'}>{r.correct ? t('wellSpotted') : t('almost')}</b>
              <p className="t-foot m-0 mt-1" style={{ color: 'var(--ink)' }}>
                {r.explanation}
                {!r.correct && ` ${t('tryAgain')}`}
              </p>
            </div>
          )}
        </>
      )
    }
    case 'SIMULATOR_TASK':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <p className="t-body m-0">{s.body}</p>
          <div className="card flex items-center gap-3">
            <Icon name="market" />
            <span className="t-body flex-1">
              <b>{t('task')}</b> {s.task}
            </span>
          </div>
        </>
      )
    case 'QUIZ':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <div className="flex justify-center py-3">
            <Lumi mood="HAPPY" size={88} />
          </div>
          <p className="t-body m-0">{s.body}</p>
        </>
      )
  }
}

/** Solo con sesión iniciada */
export function Lesson({ id }: { id: string }) {
  const { ready } = useGuard('app')
  return ready ? <LessonInner id={id} /> : <PageSkeleton />
}

function LessonInner({ id }: { id: string }) {
  const t = useTranslations('lesson')
  const router = useRouter()
  const { data: l, error, refetch } = useQuery({ queryKey: ['lesson', id], queryFn: () => api.lesson(id), retry: false })
  const [i, setI] = useState(0)
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  if (error instanceof ApiFailure && error.code === 'FEATURE_LOCKED')
    return (
      <div className="pad items-center pt-16 text-center">
        <Lumi mood="THINKING" size={72} />
        <h1 className="t-title">{t('premiumOnly')}</h1>
        <Link href="/premium" className="btn btn-primary">
          {t('seePremium')}
        </Link>
        <Link href="/clases" className="btn btn-plain">
          {t('back')}
        </Link>
      </div>
    )
  if (error) return <ErrorState onRetry={refetch} message={error.message} />
  if (!l) return <PageSkeleton />
  const s = l.steps[i]
  const last = i === l.steps.length - 1
  const blocked = s.type === 'INTERACTIVE_CHART' && !solved[s.id]
  return (
    <div className="flex min-h-[calc(100dvh-20px)] flex-col">
      <div className="topbar gap-2 pr-4">
        <button className="icon-btn" onClick={() => router.push('/clases')} aria-label={t('close')}>
          <Icon name="close" />
        </button>
        <Steps total={l.steps.length} current={i + 1} label={l.title} />
        <span className="t-cap w-9 text-right">
          {i + 1}/{l.steps.length}
        </span>
      </div>
      <div key={s.id} className="pad flex-1 animate-rise">
        {i === 0 && <span className="t-foot">{l.unitTitle} · {l.title}</span>}
        <StepView s={s} lessonId={l.id} solved={!!solved[s.id]} onSolved={() => setSolved({ ...solved, [s.id]: true })} />
      </div>
      <div className="sticky bottom-0 flex gap-2.5 px-4 pt-2.5" style={{ background: 'var(--bg)', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        {i > 0 && (
          <button className="btn btn-secondary w-auto" onClick={() => setI(i - 1)} aria-label={t('previous')}>
            <Icon name="back" />
          </button>
        )}
        <button className={`btn ${s.type === 'INTERACTIVE_CHART' && solved[s.id] ? 'btn-success' : 'btn-primary'}`} disabled={blocked} onClick={() => (last ? router.push(`/quiz/${l.id}`) : setI(i + 1))}>
          {last ? t('startQuiz') : blocked ? t('tapCandle') : t('continue')}
        </button>
      </div>
    </div>
  )
}
