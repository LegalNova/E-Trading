'use client'
// 03.1 Inicio · 03.2 Camino de clases · 03.3–03.4 Pasos de lección
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { CoursePathT, LessonStepT, PathLessonT } from '@/shared/contract'
import { money, num, signedMoney } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useHome, useLang, useLives, useMe, usePath } from '../hooks'
import { useGuard } from '../shell'
import { RichText } from '../ui/rich-text'
import { CandleChart, LineChart } from '../ui/charts'
import { Flame, Gem, Heart, Icon } from '../ui/icons'
import { Bar, ErrorState, PageSkeleton, Sheet, Stars, Steps } from '../ui/kit'
import { BadgeArt } from '../ui/badge'
import { Calculator } from '../ui/calculator'
import { HelpSteps, HelpTip } from '../ui/first-time'
import { PlayView, StoryView } from '../play/play-step'
import { Lumi, LumiSays, stageOf } from '../ui/lumi'
import { GlyphTile } from '../play/glyph'
import { BuyPlans, MaxPill } from '../upgrade'
import { InviteCard } from '../invite-card'
import { DailyGift } from '../daily-gift'
import { GiftBanner } from './gifts'
import { FeedbackCard } from './feedback'
import { PushCard } from '../push'
import { HomeMission, MissionPreview } from '../missions'
import { ReportButton } from '../report-button'
import { ProjectCard } from './project'

// ── Inicio ───────────────────────────────────────────────
export function Home() {
  const t = useTranslations('home')
  const tg = useTranslations('goals')
  const locale = useLang()
  const { data: h, isError, refetch } = useHome()
  const { data: me } = useMe()
  const { data: badges } = useQuery({ queryKey: ['achievements'], queryFn: api.achievements })
  const [info, setInfo] = useState(false)
  // La siguiente clase se precarga: al tocar «Continuar» se abre al momento
  const qc = useQueryClient()
  const nextId = h?.nextLesson?.id
  useEffect(() => {
    if (nextId) qc.prefetchQuery({ queryKey: ['lesson', nextId], queryFn: () => api.lesson(nextId, true) })
  }, [nextId, qc])
  if (isError) return <ErrorState onRetry={refetch} />
  if (!h || !me) return <PageSkeleton />
  const done = h.dailyGoals.filter(g => g.done).length
  const premium = me.plan !== 'FREE'
  /** Aún no ha terminado ninguna clase: la pantalla se centra en empezar */
  const firstDay = me.lessonsCompleted === 0
  const dayUp = Number(h.portfolio.dayChange) >= 0
  return (
    <div className="pad">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 px-0.5">
        <h1 className="t-title min-w-0 basis-full truncate sm:basis-auto">{h.user.name.trim() ? t('hello', { name: h.user.name.trim().split(/\s+/)[0] }) : t('helloNoName')}</h1>
        <div className="flex flex-none items-center gap-1.5">
          <MaxPill />
          {/* Los tres marcadores abren la misma hoja que explica qué es cada uno */}
          <button className="chip min-h-11" onClick={() => setInfo(true)} aria-label={t('streakLabel', { n: h.streak.days })} aria-haspopup="dialog">
            <Flame color={h.streak.todayDone ? 'var(--brand)' : 'var(--ink-3)'} />
            {h.streak.days}
          </button>
          <button className="chip min-h-11" onClick={() => setInfo(true)} aria-label={t('gemsLabel', { n: h.gems })} aria-haspopup="dialog">
            <Gem />
            {num(h.gems, locale, 0)}
          </button>
          <button className="chip min-h-11" onClick={() => setInfo(true)} aria-label={premium ? t('livesUnlimitedLabel') : t('livesCountLabel', { n: h.lives.current })} aria-haspopup="dialog">
            <Heart />
            {premium ? '∞' : h.lives.current}
          </button>
          <Link href="/avisos" className="icon-btn h-11 w-11 md:hidden" aria-label={t('notifications')}>
            <Icon name="bell" size={20} />
          </Link>
        </div>
      </div>

      {/* Lo primero al entrar: invitar a un amigo (7 días de Max para los dos).
          Quien acaba de llegar ve antes su primera clase: aún no sabe qué es la app como para invitar a nadie. */}
      {!firstDay && <InviteCard />}

      {h.nextLesson ? (
        <div className="hero flex flex-col gap-2.5">
          <div className="t-cap flex justify-between" style={{ color: 'rgb(255 255 255 / 0.65)' }}>
            <span>{firstDay ? t('firstLesson') : t('nextLesson', { unit: h.nextLesson.unitOrder })}</span>
            <span>{h.nextLesson.minutes} min</span>
          </div>
          <span className="text-[22px] leading-[27px] font-extrabold tracking-[-0.01em]">{h.nextLesson.title}</span>
          {firstDay ? (
            <span className="t-foot" style={{ color: 'rgb(255 255 255 / 0.8)' }}>
              {t('firstLessonHint')}
            </span>
          ) : (
            <Bar pct={h.nextLesson.progressPct} color="#fff" label={t('unitProgress')} />
          )}
          <Link href={`/leccion/${h.nextLesson.id}`} className="btn" style={{ background: '#fff', color: 'var(--brand-ink)' }}>
            {firstDay ? t('start') : t('continue')}
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

      <DailyGift />
      {/* La primera vez: qué es esto y qué se hace aquí, en tres líneas */}
      <HelpTip id="home" title={t('howTitle')}>
        <HelpSteps items={[t('how1'), t('how2'), t('how3')]} />
      </HelpTip>
      {firstDay && <InviteCard />}

      {/* Avisos que piden algo (activar notificaciones, dar tu opinión): solo cuando tocan */}
      {/* Aprender haciendo: la misión «Pruébalo» pendiente (o recién cumplida) */}
      <HomeMission />
      {/* Regalar Lumi (en Navidad, destacado): debajo de la clase para no quitarle el sitio a «Continuar» */}
      <GiftBanner />
      <PushCard />
      <FeedbackCard />

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
            <span className="t-foot flex-none text-right tabular-nums" style={g.done ? { color: 'var(--up)', fontWeight: 700 } : undefined}>
              {/* El premio se ve desde el principio: así se entiende para qué sirve cada objetivo */}
              {g.done ? t('goalEarned', { xp: g.xp }) : t('goalPending', { progress: g.progress, target: g.target, xp: g.xp })}
            </span>
          </div>
        ))}
        <span className="t-cap">{done === h.dailyGoals.length ? t('allGoals') : t('goalsHint')}</span>
      </div>

      <LumiSays mood={h.companion.mood} message={h.companion.message} skin={me.companion.skinId} stage={stageOf(me.level.n)} />

      <Link href="/mercado/cartera" className="card flex flex-col gap-1.5" style={{ color: 'inherit' }}>
        <span className="t-foot flex items-center justify-between gap-2">
          {t('portfolio')}
          <span className="t-cap">{t('portfolioVirtual')}</span>
        </span>
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

      {/* Abajo del todo: los planes, con un botón que lleva directo al pago */}
      <BuyPlans id="planes" />

      <div className="t-foot flex items-center justify-between px-1">
        <Link href="/perfil" style={{ color: 'inherit' }}>
          {t('level', { n: me.level.n, title: me.level.title, xp: num(me.level.xp, locale, 0) })}
        </Link>
      </div>

      {/* «¿Qué es esto?»: racha, gemas, vidas y XP explicados en una sola hoja */}
      <Sheet open={info} onClose={() => setInfo(false)} label={t('infoTitle')}>
        <b className="t-title">{t('infoTitle')}</b>
        <div className="list">
          <Link href="/perfil/racha" className="li items-start" onClick={() => setInfo(false)}>
            <span className="ava"><Flame color="var(--brand)" /></span>
            <span className="flex-1">
              <b>{t('infoStreak', { n: h.streak.days })}</b>
              <span className="t-foot block">{h.streak.todayDone ? t('infoStreakDone') : t('infoStreakBody')}</span>
            </span>
            <Icon name="chev" size={18} />
          </Link>
          <div className="li items-start">
            <span className="ava"><Gem /></span>
            <span className="flex-1">
              <b>{t('infoGems', { n: num(h.gems, locale, 0) })}</b>
              <span className="t-foot block">{t('infoGemsBody')}</span>
            </span>
          </div>
          <Link href="/sin-vidas" className="li items-start" onClick={() => setInfo(false)}>
            <span className="ava"><Heart /></span>
            <span className="flex-1">
              <b>{premium ? t('infoLivesUnlimited') : t('infoLives', { n: h.lives.current, max: h.lives.max })}</b>
              <span className="t-foot block">{premium ? t('infoLivesPremiumBody') : t('infoLivesBody', { h: h.lives.regenHours })}</span>
            </span>
            <Icon name="chev" size={18} />
          </Link>
          <Link href="/perfil" className="li items-start" onClick={() => setInfo(false)}>
            <span className="ava"><Icon name="star" size={18} /></span>
            <span className="flex-1">
              <b>{t('infoXp', { xp: num(me.level.xp, locale, 0) })}</b>
              <span className="t-foot block">{t('infoXpBody')}</span>
            </span>
            <Icon name="chev" size={18} />
          </Link>
        </div>
        <button className="btn btn-primary" onClick={() => setInfo(false)}>
          {t('infoOk')}
        </button>
      </Sheet>
    </div>
  )
}

// ── Camino de clases ─────────────────────────────────────
function LessonRow({ l, next, onLocked }: { l: PathLessonT; next?: boolean; onLocked: (l: PathLessonT) => void }) {
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
        <span className="t-cap" style={open ? { color: 'var(--brand-ink)', fontWeight: 700 } : undefined}>
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
          ) : l.id.endsWith('boss') ? (
            t('lockedBoss')
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
  // Solo la siguiente clase va resaltada (borde por dentro: no se sale de la columna)
  const style = { boxShadow: next ? 'inset 0 0 0 2px var(--brand)' : undefined, opacity: l.status === 'LOCKED' ? 0.6 : 1, color: 'inherit' }
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
  // Clases de contenido (sin repasos ni retos finales)
  const all = path.units.flatMap(u => u.lessons).filter(l => !l.isUnitReview && !l.id.endsWith('boss'))
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
  const { data: me } = useMe()
  const { data: mistakes = 0 } = useQuery({ queryKey: ['mistakes'], queryFn: api.mistakesCount })
  const [locked, setLocked] = useState<PathLessonT | null>(null)
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set())
  if (isError) return <ErrorState onRetry={refetch} />
  if (!p) return <PageSkeleton />
  const current = p.units.find(u => u.id === p.currentUnitId) ?? p.units[0]
  const nextId = current.lessons.find(l => l.status === 'AVAILABLE')?.id
  return (
    <div className="pad">
      <div className="flex items-center justify-between px-0.5">
        <h1 className="t-large">{t('title')}</h1>
        <div className="flex items-center gap-3">
          {mistakes > 0 && (
            <Link href="/quiz/review" className="link text-sm">
              {t('review', { n: mistakes })}
            </Link>
          )}
          <MaxPill />
        </div>
      </div>
      <Summary path={p} />
      {/* La primera vez: cómo está montado el curso (sección › unidad › clase, repaso y reto final) */}
      <HelpTip id="path" title={t('howTitle')}>
        <HelpSteps items={[t('how1'), t('how2'), t('how3')]} />
      </HelpTip>
      {p.units.map((u, ui) => {
        const empty = u.lessons.length === 0
        const newSection = u.section && u.section.id !== p.units[ui - 1]?.section?.id
        const isCurrent = u.id === current.id
        const expanded = isCurrent || openUnits.has(u.id)
        return (
          <section key={u.id} className="flex flex-col gap-3" aria-labelledby={`unit-${u.id}`}>
            {newSection && u.section && (
              <div className="mt-3 flex items-center gap-2 px-1">
                <span className="t-cap font-extrabold tracking-wide uppercase" style={{ color: u.section.open ? 'var(--brand-ink)' : 'var(--ink-3)' }}>
                  {!u.section.open && <><Icon name="lock" size={12} className="mb-0.5 inline-block align-middle" /> </>}
                  {u.section.title}
                </span>
                <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
              </div>
            )}
            {newSection && u.section && !u.section.open && <span className="t-cap -mt-2 px-1">{t('sectionNeeds', { needs: u.section.needs.join(', ') })}</span>}
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
                {/* «¿Ya lo sabes?»: quien domina la unidad la supera con una prueba y sigue adelante */}
                {u.testOut && u.progressPct < 100 && (
                  <Link href={`/quiz/testout-${u.id}`} className="card flex items-center gap-3" style={{ color: 'inherit' }}>
                    <GlyphTile name="verified" size={36} color="var(--brand)" />
                    <span className="flex-1">
                      <b>{t('testOutTitle')}</b>
                      <br />
                      <span className="t-foot">{me?.plan === 'FREE' ? t('testOutBodyFree') : t('testOutBody')}</span>
                    </span>
                    <Icon name="chev" size={16} />
                  </Link>
                )}
                {u.lessons.map(l => (
                  <LessonRow key={l.id} l={l} next={l.id === nextId} onLocked={setLocked} />
                ))}
              </div>
            )}
          </section>
        )
      })}
      <ProjectCard />
      <AskLumi />
      <Sheet open={!!locked} onClose={() => setLocked(null)} label={t('lockedTitle')}>
        <div className="flex items-center gap-3">
          <Lumi mood="THINKING" size={48} />
          <span className="t-head">{locked?.requiresPremium ? t(locked.requiredPlan === 'PLUS' ? 'plusTitle' : 'maxTitle') : t('lockedTitle')}</span>
        </div>
        <p className="t-body muted m-0">{locked?.requiresPremium ? t(locked.requiredPlan === 'PLUS' ? 'plusBody' : 'maxBody') : t('lockedBody')}</p>
        {locked?.requiresPremium && (
          <button className="btn btn-primary" onClick={() => router.push('/premium')}>
            {t('tryMaxFree')}
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
  const { data: me } = useMe()
  const { data: lives } = useLives()
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
              <span className="t-cap font-bold" style={{ color: 'var(--brand-ink)' }}>
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
    case 'CALCULATOR':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <RichText text={s.body} />
          <Calculator kind={s.calc} />
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
    case 'PLAY':
      return <PlayView s={s} done={solved} onDone={onSolved} />
    case 'STORY':
      return <StoryView s={s} done={solved} onDone={onSolved} />
    case 'QUIZ':
      return (
        <>
          <h1 className="t-title">{s.title}</h1>
          <div className="flex justify-center py-3">
            <Lumi mood="HAPPY" size={88} />
          </div>
          <p className="t-body m-0">{s.body}</p>
          {/* Cómo funciona el quiz, antes de empezarlo (y no a mitad) */}
          <div className="card flex flex-col gap-2">
            <b className="t-head">{t('quizHowTitle')}</b>
            <HelpSteps items={[t('quizHow1'), t('quizHow2', { pct: lessonId.endsWith('boss') ? 80 : 60 }), me && me.plan !== 'FREE' ? t('quizHow3Premium') : t('quizHow3', { n: lives?.current ?? 5 })]} />
          </div>
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
  // Se abre al momento si estaba precargada; aun así se confirma con el servidor (cuenta como empezada)
  const { data: l, error, refetch } = useQuery({ queryKey: ['lesson', id], queryFn: () => api.lesson(id), retry: false, refetchOnMount: 'always' })
  const [i, setI] = useState(0)
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  // Analítica: si sale de la clase sin llegar al quiz, hasta qué paso llegó
  const reached = useRef(1)
  const toQuiz = useRef(false)
  useEffect(() => {
    reached.current = Math.max(reached.current, i + 1)
  }, [i])
  useEffect(() => {
    if (!l) return
    let sent = false
    const send = () => {
      if (sent || toQuiz.current) return
      sent = true
      api.trackEvent({ name: 'lesson_exit', lessonId: l.id, step: reached.current, of: l.steps.length })
    }
    window.addEventListener('pagehide', send)
    return () => {
      window.removeEventListener('pagehide', send)
      send()
    }
  }, [l])
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
  const interactive = s.type === 'INTERACTIVE_CHART' || s.type === 'PLAY' || s.type === 'STORY'
  const blocked = interactive && !solved[s.id]
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
        <ReportButton context={{ lessonId: l.id, step: s.id }} />
      </div>
      <div key={s.id} className="pad flex-1 animate-rise">
        {i === 0 && <span className="t-foot">{l.unitTitle} · {l.title}</span>}
        <StepView s={s} lessonId={l.id} solved={!!solved[s.id]} onSolved={() => setSolved(x => ({ ...x, [s.id]: true }))} />
        {last && <MissionPreview lessonId={l.id} />}
      </div>
      <div className="sticky bottom-0 flex gap-2.5 px-4 pt-2.5" style={{ background: 'var(--bg)', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        {i > 0 && (
          <button className="btn btn-secondary w-auto" onClick={() => setI(i - 1)} aria-label={t('previous')}>
            <Icon name="back" />
          </button>
        )}
        <button className={`btn ${interactive && solved[s.id] ? 'btn-success' : 'btn-primary'}`} disabled={blocked} onClick={() => {
            if (!last) return setI(i + 1)
            toQuiz.current = true
            router.push(`/quiz/${l.id}`)
          }}>
          {last ? t('startQuiz') : blocked ? (s.type === 'INTERACTIVE_CHART' ? t('tapCandle') : s.type === 'STORY' ? t('finishStory') : t('finishActivity')) : t('continue')}
        </button>
      </div>
    </div>
  )
}
