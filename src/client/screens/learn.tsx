'use client'
// 03.1 Inicio · 03.2 Camino de clases · 03.3–03.4 Pasos de lección
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { CoursePathT, LessonStepT, PathLessonT } from '@/shared/contract'
import { money, num, signedMoney } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useHome, useLang, useMe, usePath } from '../hooks'
import { useGuard } from '../shell'
import { RichText } from '../ui/rich-text'
import { useToast } from '../providers'
import { CandleChart, LineChart } from '../ui/charts'
import { Flame, Gem, Heart, Icon } from '../ui/icons'
import { Bar, ErrorState, PageSkeleton, Sheet, Stars, Steps } from '../ui/kit'
import { BadgeArt } from '../ui/badge'
import { Lumi, LumiSays, stageOf } from '../ui/lumi'

// ── Inicio ───────────────────────────────────────────────
export function Home() {
  const t = useTranslations('home')
  const tg = useTranslations('goals')
  const locale = useLang()
  const toast = useToast()
  const { data: h, isError, refetch } = useHome()
  const { data: me } = useMe()
  const { data: badges } = useQuery({ queryKey: ['achievements'], queryFn: api.achievements })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!h || !me) return <PageSkeleton />
  const done = h.dailyGoals.filter(g => g.done).length
  const premium = me.plan !== 'FREE'
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

      <LumiSays mood={h.companion.mood} message={h.companion.message} skin={me.companion.skinId} stage={stageOf(me.level.n)} />

      {h.nextLesson ? (
        <div className="hero flex flex-col gap-2.5">
          <div className="t-cap flex justify-between" style={{ color: 'rgb(255 255 255 / 0.65)' }}>
            <span>{t('nextLesson', { unit: h.nextLesson.unitOrder })}</span>
            <span>{h.nextLesson.minutes} min</span>
          </div>
          <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]">{h.nextLesson.title}</span>
          <Bar pct={h.nextLesson.progressPct} color="#fff" label={t('unitProgress')} />
          <Link href={`/leccion/${h.nextLesson.id}`} className="btn" style={{ background: '#fff', color: 'var(--brand)' }}>
            {t('continue')}
          </Link>
        </div>
      ) : (
        <div className="hero flex flex-col gap-2.5">
          <span className="text-[22px] font-extrabold">{premium ? t('allDone') : t('freeDone')}</span>
          <Link href={premium ? '/clases' : '/premium'} className="btn btn-primary btn-sm self-start">
            {premium ? t('seePath') : t('seePremium')}
          </Link>
        </div>
      )}

      {/* Accesos rápidos: lo principal de la app a un toque */}
      <nav aria-label={t('quick')} className="grid grid-cols-2 gap-2.5">
        {(
          [
            ['/clases', '📚', t('qLearn')],
            ['/mercado', '📈', t('qMarket')],
            ['/insignias', '🏅', t('qBadges')],
            ['/profesora', '💬', t('qLumi')],
          ] as const
        ).map(([href, emoji, label]) => (
          <Link key={href} href={href} className="card flex items-center gap-2.5 px-3.5 py-3" style={{ color: 'var(--ink)' }}>
            <span className="text-[22px]" aria-hidden="true">
              {emoji}
            </span>
            <b className="text-[15px] leading-tight">{label}</b>
          </Link>
        ))}
      </nav>

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

      {badges && (
        <Link href="/insignias" className="card flex flex-col gap-2.5" style={{ color: 'var(--ink)' }}>
          <div className="flex items-center justify-between">
            <span className="t-head">{t('badgesTitle')}</span>
            <span className="link text-[14px]">{t('badgesAll')}</span>
          </div>
          {badges.some(b => b.unlocked) ? (
            <div className="flex flex-wrap gap-2">
              {badges
                .filter(b => b.unlocked)
                .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
                .slice(0, 6)
                .map(b => (
                  <BadgeArt key={b.code} code={b.code} category={b.category} unlocked size={44} label={b.title} />
                ))}
            </div>
          ) : (
            <span className="t-foot">{t('badgesEmpty')}</span>
          )}
          <span className="t-cap">{t('badgesCount', { n: badges.filter(b => b.unlocked).length, total: badges.length })}</span>
        </Link>
      )}

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
            t(l.requiredPlan === 'PLUS' ? 'inPlus' : 'inMax')
          ) : l.isUnitReview ? (
            t('lockedReview')
          ) : (
            t('locked')
          )}
        </span>
      </span>
      {l.requiresPremium && (
        <span className="chip text-[11px]" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          {l.requiredPlan === 'PLUS' ? 'Plus' : 'Max'}
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

/** Resumen de arriba: cuánto llevas, cuánto falta a tu ritmo y un botón para seguir donde lo dejaste */
function Summary({ path }: { path: CoursePathT }) {
  const t = useTranslations('path')
  const all = path.units.flatMap(u => u.lessons)
  const done = all.filter(l => l.status === 'COMPLETED').length
  const left = all.filter(l => l.status !== 'COMPLETED').reduce((a, l) => a + l.minutes, 0)
  const next = path.units.find(u => u.id === path.currentUnitId)?.lessons.find(l => l.status === 'AVAILABLE') ?? all.find(l => l.status === 'AVAILABLE')
  return (
    <div className="card flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <b className="t-head">{t('summary', { done, total: all.length })}</b>
        <span className="t-foot">{all.length ? Math.round((done / all.length) * 100) : 0} %</span>
      </div>
      <Bar pct={all.length ? (done / all.length) * 100 : 0} />
      {left > 0 && <span className="t-cap">{t('daysAtPace', { days: Math.ceil(left / path.dailyGoalMinutes), pace: path.dailyGoalMinutes })}</span>}
      {next && (
        <>
          <span className="t-foot" style={{ color: 'var(--ink)' }}>
            {t('continueNext', { title: next.title })}
          </span>
          <Link href={`/leccion/${next.id}`} className="btn btn-primary">
            {t('continueBtn')}
          </Link>
        </>
      )}
    </div>
  )
}

/** Acceso a la profesora desde el camino de clases */
function AskLumi() {
  const t = useTranslations('tutor')
  const { data: me } = useMe()
  const name = me?.companion.name || 'Lumi'
  return (
    <Link href="/profesora" className="card flex items-center gap-3" style={{ color: 'var(--ink)' }}>
      <Lumi mood="HAPPY" size={42} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} label={name} />
      <span className="min-w-0 flex-1">
        <b className="block">{t('ask', { name })}</b>
        <span className="t-cap">{t('askHint')}</span>
      </span>
      <Icon name="chev" size={18} />
    </Link>
  )
}

export function Path() {
  const t = useTranslations('path')
  const router = useRouter()
  const { data: p, isError, refetch } = usePath()
  const { data: mistakes = 0 } = useQuery({ queryKey: ['mistakes'], queryFn: api.mistakesCount })
  const [locked, setLocked] = useState<PathLessonT | null>(null)
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set())
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
      <Summary path={p} />
      {p.units.map(u => {
        const empty = u.lessons.length === 0
        const isCurrent = u.id === current.id
        const expanded = isCurrent || openUnits.has(u.id)
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
              <button
                className="card flex items-center justify-between gap-3 text-left"
                aria-expanded={expanded}
                aria-controls={`lessons-${u.id}`}
                onClick={() => setOpenUnits(prev => { const n = new Set(prev); if (n.has(u.id)) n.delete(u.id); else n.add(u.id); return n })}
              >
                <span className="min-w-0 flex-1">
                  <b id={`unit-${u.id}`} className="t-head">
                    {u.side ? t('sideUnit') : t('unitN', { n: u.order })} · {u.title}
                  </b>
                  <br />
                  <span className="t-cap line-clamp-2">{empty ? t('soon') : u.description}</span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <Bar pct={u.progressPct} />
                    <span className="t-cap flex-none font-bold">{u.progressPct} %</span>
                  </span>
                </span>
                {u.access !== 'FREE' && (
                  <span className="chip flex-none text-[11px]" style={{ background: 'var(--fill)' }}>
                    {t(`access.${u.access}`)}
                  </span>
                )}
                <Icon name="chev" size={16} className={expanded ? 'rotate-90' : ''} />
              </button>
            )}
            {expanded && (
              <div id={`lessons-${u.id}`} className="flex flex-col gap-3">
                {u.unlocksFeature && <div className="banner banner-info">{t('unlocksOrders')}</div>}
                {u.lessons.map(l => (
                  <LessonRow key={l.id} l={l} onLocked={setLocked} />
                ))}
              </div>
            )}
          </section>
        )
      })}
      <AskLumi />
      <Sheet open={!!locked} onClose={() => setLocked(null)} label={t('lockedTitle')}>
        <div className="flex items-center gap-3">
          <Lumi mood="THINKING" size={48} />
          <span className="t-head">{locked?.requiresPremium ? t(locked.requiredPlan === 'PLUS' ? 'plusTitle' : 'maxTitle') : t('lockedTitle')}</span>
        </div>
        <p className="t-body muted m-0">{locked?.requiresPremium ? t(locked.requiredPlan === 'PLUS' ? 'plusBody' : 'maxBody') : t('lockedBody')}</p>
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
/** Ilustraciones vectoriales con los colores del tema */
function Diagram({ kind }: { kind: string }) {
  const t = useTranslations('lesson')
  if (kind === 'compound') {
    // 100 €/mes durante 30 años: aportado frente a 2 %, 5 % y 7 % (valores calculados)
    const years = Array.from({ length: 31 }, (_, y) => y)
    const fv = (r: number, y: number) => { let v = 0; for (let m = 0; m < y * 12; m++) v = v * (1 + r / 12) + 100; return v }
    const max = 122_000
    const path = (f: (y: number) => number) => years.map((y, i) => `${i ? 'L' : 'M'}${20 + y * 9.2} ${150 - (f(y) / max) * 135}`).join(' ')
    return (
      <div className="card">
        <svg viewBox="0 0 310 165" className="h-auto w-full" role="img" aria-label={t('img.compound')}>
          <line x1="20" x2="300" y1="150" y2="150" stroke="var(--line)" />
          <path d={path(y => y * 1200)} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 4" />
          <path d={path(y => fv(0.05, y))} fill="none" stroke="var(--ink-2)" strokeWidth="2" />
          <path d={path(y => fv(0.07, y))} fill="none" stroke="var(--brand)" strokeWidth="3" />
          <text x="296" y="20" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--brand)">7 % · 121.997 €</text>
          <text x="296" y="72" textAnchor="end" fontSize="11" fill="var(--ink-2)">5 % · 83.226 €</text>
          <text x="296" y="112" textAnchor="end" fontSize="11" fill="var(--ink-3)">{t('img.contributed')} · 36.000 €</text>
          <text x="20" y="162" fontSize="10" fill="var(--ink-3)">0</text>
          <text x="296" y="162" textAnchor="end" fontSize="10" fill="var(--ink-3)">30 {t('img.years')}</text>
        </svg>
      </div>
    )
  }
  if (kind === 'drawdown') {
    const rows: [number, number][] = [[10, 11.1], [20, 25], [30, 42.9], [50, 100], [75, 300]]
    return (
      <div className="card flex flex-col gap-2" role="img" aria-label={t('img.drawdown')}>
        {rows.map(([d, u]) => (
          <div key={d} className="grid grid-cols-[64px_1fr] items-center gap-2 text-[13px] font-bold tabular-nums">
            <span className="down">−{d} %</span>
            <span className="flex items-center gap-2">
              <i className="block h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.sqrt(u) * 5.8)}%`, background: 'var(--up)' }} />
              <span className="up">+{u.toLocaleString('es-ES')} %</span>
            </span>
          </div>
        ))}
        <span className="t-cap">{t('img.drawdownCap')}</span>
      </div>
    )
  }
  if (kind === 'riskreward')
    return (
      <div className="card">
        <svg viewBox="0 0 300 150" className="h-auto w-full" role="img" aria-label={t('img.riskreward')}>
          <rect x="40" y="20" width="220" height="70" rx="6" fill="color-mix(in srgb, var(--up) 16%, transparent)" />
          <rect x="40" y="90" width="220" height="30" rx="6" fill="color-mix(in srgb, var(--down) 16%, transparent)" />
          <line x1="40" x2="260" y1="90" y2="90" stroke="var(--ink)" strokeWidth="2" />
          <text x="48" y="40" fontSize="12" fontWeight="700" fill="var(--up)">{t('img.target')} · +3R</text>
          <text x="48" y="86" fontSize="12" fontWeight="700" fill="var(--ink)">{t('img.entry')}</text>
          <text x="48" y="112" fontSize="12" fontWeight="700" fill="var(--down)">Stop · −1R</text>
          <text x="150" y="142" textAnchor="middle" fontSize="11" fill="var(--ink-3)">{t('img.rrCap')}</text>
        </svg>
      </div>
    )
  if (kind === 'anatomy')
    return (
      <div className="card flex items-center justify-center gap-6 p-5">
        <svg width="70" height="150" viewBox="0 0 70 150" role="img" aria-label={t('img.anatomy')}>
          <line x1="35" x2="35" y1="8" y2="142" stroke="var(--up)" strokeWidth="2.5" />
          <rect x="18" y="40" width="34" height="62" rx="3" fill="var(--up)" />
        </svg>
        <div className="t-foot flex h-[150px] flex-col justify-between py-1 font-bold" style={{ color: 'var(--ink)' }}>
          <span>← {t('img.high')}</span>
          <span>← {t('img.close')}</span>
          <span>← {t('img.body')}</span>
          <span>← {t('img.open')}</span>
          <span>← {t('img.low')}</span>
        </div>
      </div>
    )
  if (kind === 'diversify')
    return (
      <div className="card grid grid-cols-2 gap-3" role="img" aria-label={t('img.diversify')}>
        {[{ n: 1, v: '30–35 %' }, { n: 25, v: '≈ 20 %' }, { n: 500, v: '≈ 15 %' }, { n: 3000, v: '≈ 15 %' }].map(x => (
          <div key={x.n} className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-[3px]">
              {Array.from({ length: Math.min(x.n, 40) }, (_, i) => (
                <i key={i} className="block h-2 w-2 rounded-full" style={{ background: 'var(--brand)', opacity: 0.35 + (i % 3) * 0.25 }} />
              ))}
            </div>
            <span className="t-cap">
              {x.n.toLocaleString('es-ES')} {x.n === 1 ? t('img.stock') : t('img.stocks')} · <b style={{ color: 'var(--ink)' }}>{x.v}</b>
            </span>
          </div>
        ))}
        <span className="t-cap col-span-2">{t('img.diversifyCap')}</span>
      </div>
    )
  return null
}

function Illustration({ kind }: { kind: string }) {
  const t = useTranslations('lesson')
  if (['compound', 'drawdown', 'riskreward', 'anatomy', 'diversify'].includes(kind)) return <Diagram kind={kind} />
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
          <RichText text={s.body} />
          {s.keyIdea && (
            <div className="card" style={{ background: 'color-mix(in srgb, var(--brand) 9%, var(--surface))' }}>
              <span className="t-cap font-bold" style={{ color: 'var(--brand)' }}>
                {t('keyIdea')}
              </span>
              <p className="t-head m-0 mt-1">{s.keyIdea}</p>
            </div>
          )}
          {tip}
        </>
      )
    case 'IMAGE':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <Illustration kind={s.image} />
          <RichText text={s.body} />
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
  const tt = useTranslations('tutor')
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
        <Link href={`/profesora?leccion=${l.id}`} className="icon-btn" aria-label={tt('askLesson')} title={tt('askLesson')}>
          <Icon name="chat" size={20} />
        </Link>
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
