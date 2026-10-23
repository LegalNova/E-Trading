'use client'
// 05 · Racha, logros, liga, perfil y avisos
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { AchievementT, NotificationT } from '@/shared/contract'
import { countdown, num, pct } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useMe, useRefreshAll } from '../hooks'
import { useToast } from '../providers'
import { Flame, Gem, Icon, type IconName } from '../ui/icons'
import { Bar, ErrorState, PageSkeleton, Sheet, TopBar } from '../ui/kit'
import { Lumi, LumiSays } from '../ui/lumi'

// ── Racha (05.1) ─────────────────────────────────────────
export function Streak() {
  const t = useTranslations('streak')
  const locale = useLang()
  const toast = useToast()
  const refresh = useRefreshAll()
  const { data: s, isError, refetch } = useQuery({ queryKey: ['streak'], queryFn: api.streak })
  const { data: me } = useMe()
  const buy = useMutation({
    mutationFn: api.buyStreakFreeze,
    onSuccess: () => (refresh(), toast(t('bought'))),
    onError: e => toast(e instanceof ApiFailure ? e.message : t('error')),
  })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!s) return <PageSkeleton />
  // Calendario de las últimas 5 semanas, empezando en lunes
  const first = new Date(s.days[0].date + 'T12:00:00')
  const lead = (first.getDay() + 6) % 7
  const cells = [...Array.from({ length: lead }, () => null), ...s.days]
  const today = s.days[s.days.length - 1].date
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'narrow' }))
  return (
    <>
      <TopBar back="/inicio" title={t('title')} />
      <div className="pad">
        <div className="hero flex items-center justify-between p-5">
          <div>
            <div className="text-[60px] leading-[60px] font-extrabold">{s.current}</div>
            <b>{t('days')}</b>
            <br />
            <span className="t-cap" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
              {t('best', { n: s.best })}
            </span>
          </div>
          <Flame color={s.todayDone ? '#2997FF' : 'rgb(255 255 255 / 0.3)'} size={70} />
        </div>
        {!s.todayDone && <LumiSays mood={s.current > 0 ? 'WORRIED' : 'HAPPY'} message={s.current > 0 ? t('atRisk', { n: s.current }) : t('startOne')} />}
        <div className="card">
          <b>{t('last5weeks')}</b>
          <div className="mt-2.5 grid grid-cols-7 gap-1.5 text-center">
            {weekdays.map((d, i) => (
              <span key={i} className="t-cap">
                {d}
              </span>
            ))}
            {cells.map((c, i) =>
              c === null ? (
                <span key={i} />
              ) : (
                <span
                  key={c.date}
                  title={c.date}
                  className="flex h-[34px] items-center justify-center rounded-[10px] text-[13px] font-bold"
                  style={c.status === 'ACTIVE' ? { background: 'var(--brand)', color: '#fff' } : c.status === 'FROZEN' ? { border: '2px dashed var(--brand)', color: 'var(--brand)' } : c.date === today ? { border: '2px solid var(--ink)' } : c.status === 'MISSED' ? { background: 'var(--fill)', color: 'var(--ink-3)' } : { background: 'var(--fill)' }}
                >
                  {Number(c.date.slice(8))}
                </span>
              ),
            )}
          </div>
          <div className="t-cap mt-2.5 flex flex-wrap gap-3">
            <span>■ {t('legendActive')}</span>
            <span>┅ {t('legendFrozen')}</span>
            <span>□ {t('legendToday')}</span>
          </div>
        </div>
        <div className="card flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Icon name="shield" size={22} />
            <span>
              <b>{t('freeze')}</b>
              <br />
              <span className="t-cap">{t('freezeInfo', { n: s.freezes })}</span>
            </span>
          </div>
          <button className="chip" style={{ background: 'var(--fill)' }} disabled={buy.isPending || s.freezes >= 2} onClick={() => buy.mutate()} aria-label={t('buyFreeze', { price: s.freezePrice })}>
            <Gem />
            {s.freezePrice}
          </button>
        </div>
        <p className="t-cap m-0">{t('rule', { tz: s.timezone, gems: me?.gems ?? 0 })}</p>
      </div>
    </>
  )
}

// ── Logros (05.2) ────────────────────────────────────────
function Badge({ a, onClick }: { a: AchievementT; onClick: () => void }) {
  return (
    <button className="card flex flex-col items-center gap-2 px-2 py-3.5 text-center" style={{ opacity: a.unlocked ? 1 : 0.5, color: 'inherit' }} onClick={onClick}>
      <span className="flex h-11 w-11 items-center justify-center rounded-[14px] font-extrabold" style={a.unlocked ? { background: 'var(--brand)', color: '#fff' } : { background: 'var(--fill)', color: 'var(--ink-2)' }}>
        {a.icon}
      </span>
      <span className="text-xs leading-[15px] font-bold">{a.title}</span>
    </button>
  )
}

export function Achievements() {
  const t = useTranslations('achievements')
  const locale = useLang()
  const { data, isError, refetch } = useQuery({ queryKey: ['achievements'], queryFn: api.achievements })
  const [open, setOpen] = useState<AchievementT | null>(null)
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return <PageSkeleton />
  const unlocked = data.filter(a => a.unlocked).length
  const inProgress = data.filter(a => !a.unlocked && a.progress > 0).sort((a, b) => b.progress / b.target - a.progress / a.target).slice(0, 3)
  return (
    <>
      <TopBar back="/perfil" title={t('title')} />
      <div className="pad">
        <div className="flex items-center justify-between">
          <span className="t-large">{t('title')}</span>
          <span className="t-foot">{t('count', { n: unlocked, total: data.length })}</span>
        </div>
        {inProgress.length > 0 && (
          <div className="card flex flex-col gap-3">
            <b>{t('inProgress')}</b>
            {inProgress.map(a => (
              <div key={a.code}>
                <div className="t-foot flex justify-between" style={{ color: 'var(--ink)' }}>
                  <span>{a.description}</span>
                  <b>
                    {a.progress}/{a.target}
                  </b>
                </div>
                <div className="mt-1.5 flex">
                  <Bar pct={(a.progress / a.target) * 100} />
                </div>
              </div>
            ))}
          </div>
        )}
        {(['LEARNING', 'TRADING', 'STREAK'] as const).map(cat => (
          <section key={cat} className="flex flex-col gap-2.5">
            <span className="t-head mt-1">{t(`cat.${cat}`)}</span>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {data
                .filter(a => a.category === cat)
                .map(a => (
                  <Badge key={a.code} a={a} onClick={() => setOpen(a)} />
                ))}
            </div>
          </section>
        ))}
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} label={open?.title ?? ''}>
        {open && (
          <div className="flex flex-col items-center gap-3 pb-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[20px] text-xl font-extrabold" style={open.unlocked ? { background: 'var(--brand)', color: '#fff' } : { background: 'var(--fill)', color: 'var(--ink-2)' }}>
              {open.icon}
            </span>
            <b className="t-title">{open.title}</b>
            <p className="t-body muted m-0">{open.description}</p>
            {open.unlocked ? <span className="t-foot">{t('unlockedOn', { date: new Date(open.unlockedAt!).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) })}</span> : (
              <div className="flex w-full items-center gap-2.5">
                <Bar pct={(open.progress / open.target) * 100} />
                <b className="t-foot">
                  {open.progress}/{open.target}
                </b>
              </div>
            )}
            <span className="chip" style={{ background: 'var(--fill)' }}>
              <Gem /> +{open.reward.gems} · +{open.reward.xp} XP
            </span>
          </div>
        )}
      </Sheet>
    </>
  )
}

// ── Liga (05.3) ──────────────────────────────────────────
export function League() {
  const t = useTranslations('league')
  const locale = useLang()
  const { data: l, isError, refetch } = useQuery({ queryKey: ['league'], queryFn: api.league, refetchInterval: 30_000 })
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])
  if (isError) return <ErrorState onRetry={refetch} />
  if (!l) return <PageSkeleton />
  const me = l.members.find(m => m.isMe)
  return (
    <div className="pad">
      <h1 className="t-large">{t('title', { name: l.division.name })}</h1>
      <span className="t-foot -mt-2">{t('endsIn', { time: countdown(l.endsAt), n: l.promoteTop })}</span>
      <div className="flex gap-1" aria-label={t('divisions')}>
        {l.divisions.map((d, i) => (
          <span key={d} title={d} className="h-1.5 flex-1 rounded-full" style={{ background: i + 1 < l.division.order ? 'var(--ink-3)' : i + 1 === l.division.order ? 'var(--brand)' : 'var(--fill)' }} />
        ))}
      </div>
      {me && (
        <div className="card flex items-center justify-between">
          <span>
            <span className="t-cap">{t('yourPosition')}</span>
            <br />
            <b className="text-2xl">{me.rank}.º</b>
          </span>
          <span className="t-foot text-right">
            {me.rank <= l.promoteTop ? t('promoting') : me.rank >= l.demoteFrom ? t('demoting') : t('staying')}
            <br />
            <b style={{ color: 'var(--ink)' }}>{t('points', { n: num(me.score, locale, 0) })}</b>
          </span>
        </div>
      )}
      <div className="list">
        <div className="li plainline t-cap font-bold">
          <span className="w-6">#</span>
          <span className="flex-1">{t('player')}</span>
          <span className="w-16 text-right">{t('pointsCol')}</span>
          <span className="w-16 text-right">{t('riskAdj')}</span>
        </div>
        {l.members.map(m => (
          <div key={m.userId} className="contents">
            {m.rank === l.promoteTop + 1 && <div className="li plainline t-cap up px-3.5 py-1.5 font-bold">▲ {t('promoteZone', { n: l.promoteTop })}</div>}
            {m.rank === l.demoteFrom && <div className="li plainline t-cap down px-3.5 py-1.5 font-bold">▼ {t('demoteZone', { n: l.demoteFrom })}</div>}
            <div className="li plainline" style={m.isMe ? { background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))' } : undefined} aria-current={m.isMe ? 'true' : undefined}>
              <b className="w-6">{m.rank}</b>
              <span className="min-w-0 flex-1 truncate" style={{ fontWeight: m.isMe ? 800 : 600 }}>
                {m.isMe ? t('you', { name: m.displayName }) : m.displayName}
                <span className="t-cap block font-normal">{num(m.weeklyXp, locale, 0)} XP</span>
              </span>
              <span className="w-16 text-right font-bold tabular-nums">{num(m.score, locale, 0)}</span>
              <span className={`w-16 text-right font-bold tabular-nums ${m.riskAdjReturnPct >= 0 ? 'up' : 'down'}`}>
                {m.riskAdjReturnPct >= 0 ? '+' : '−'}
                {pct(m.riskAdjReturnPct, locale)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="t-foot m-0">{t('rule')}</p>
      <div className="banner banner-info">{t('sample')}</div>
    </div>
  )
}

// ── Perfil (05.4) ────────────────────────────────────────
export function Profile() {
  const t = useTranslations('profile')
  const locale = useLang()
  const { data: me, isError, refetch } = useMe()
  const { data: stats } = useQuery({ queryKey: ['stats-trading'], queryFn: api.tradingStats })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!me) return <PageSkeleton />
  const lv = me.level
  const pctLevel = lv.xpForNext > lv.xp ? ((lv.xp - lv.xpLevelStart) / (lv.xpForNext - lv.xpLevelStart)) * 100 : 100
  const since = new Date(me.memberSince).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const links: { href: string; icon: IconName; label: string }[] = [
    { href: '/perfil/racha', icon: 'clock', label: t('streak') },
    { href: '/perfil/logros', icon: 'star', label: t('achievements') },
    { href: '/avisos', icon: 'bell', label: t('notifications') },
    { href: '/mercado/cartera', icon: 'wallet', label: t('portfolio') },
    { href: '/ajustes', icon: 'gear', label: t('settings') },
  ]
  return (
    <div className="pad">
      <div className="flex items-center justify-between px-0.5">
        <h1 className="t-large">{t('title')}</h1>
        <Link href="/ajustes" className="link">
          {t('settings')}
        </Link>
      </div>
      <div className="card flex items-center gap-3.5">
        <Lumi mood={me.companion.mood} size={56} skin={me.companion.skinId} label={me.companion.name} />
        <div>
          <b className="text-lg">{me.name}</b>
          <br />
          <span className="t-foot">
            {t('since', { date: since })} · {me.plan === 'PREMIUM' ? 'Premium' : 'Free'}
          </span>
        </div>
      </div>
      <div className="card">
        <div className="flex justify-between">
          <b>{t('level', { n: lv.n, title: lv.title })}</b>
          <span className="t-foot tabular-nums">
            {num(lv.xp, locale, 0)} / {num(lv.xpForNext, locale, 0)} XP
          </span>
        </div>
        <div className="mt-2.5 flex">
          <Bar pct={pctLevel} label={t('levelProgress')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Link href="/perfil/racha" className="stat">
          <b>{me.streak}</b>
          <span className="t-cap">{t('streakDays')}</span>
        </Link>
        <div className="stat">
          <b>{num(me.gems, locale, 0)}</b>
          <span className="t-cap">{t('gems')}</span>
        </div>
        <Link href="/clases" className="stat">
          <b>{me.lessonsCompleted}</b>
          <span className="t-cap">{t('lessons')}</span>
        </Link>
        <Link href="/perfil/logros" className="stat">
          <b>
            {me.achievementsCount}
            <span className="t-foot"> / {me.achievementsTotal}</span>
          </b>
          <span className="t-cap">{t('achievementsN')}</span>
        </Link>
      </div>
      {stats && (
        <div className="card px-4 py-1">
          <div className="kv pt-3">
            <b>{t('habits')}</b>
            <span />
          </div>
          <div className="kv">
            <span>{t('tradesPerDay')}</span>
            <span>{num(stats.tradesPerDay, locale, 1)}</span>
          </div>
          <div className="kv">
            <span>{t('winRate')}</span>
            <span>{num(stats.winRatePct, locale, 0)} %</span>
          </div>
          <div className="kv">
            <span>{t('drawdown')}</span>
            <span className={stats.maxDrawdownPct < 0 ? 'down' : ''}>{num(stats.maxDrawdownPct, locale, 1)} %</span>
          </div>
        </div>
      )}
      {stats?.insights.map((x, i) => <LumiSays key={i} mood="THINKING" message={x} skin={me.companion.skinId} />)}
      <div className="list">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="li">
            <span className="ava">
              <Icon name={l.icon} size={18} />
            </span>
            <span className="flex-1 font-semibold">{l.label}</span>
            <Icon name="chev" size={18} />
          </Link>
        ))}
      </div>
      {me.plan === 'FREE' && (
        <Link href="/premium" className="btn btn-dark">
          {t('tryPremium')}
        </Link>
      )}
    </div>
  )
}

// ── Avisos (05.5) ────────────────────────────────────────
function ago(iso: string, locale: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 86_400_000 && d.getDate() === new Date().getDate()) return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  if (diff < 6 * 86_400_000) return d.toLocaleDateString(locale, { weekday: 'short' })
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

const NOTIF_ICON: Record<NotificationT['type'], IconName> = { STREAK_RISK: 'clock', ORDER_FILLED: 'check', PRICE_ALERT: 'bell', ACHIEVEMENT: 'star', LEAGUE_RESULT: 'league', NEW_LESSON: 'learn' }

export function Notifications() {
  const t = useTranslations('notifications')
  const locale = useLang()
  const router = useRouter()
  const refresh = useRefreshAll()
  const { data, isError, refetch } = useQuery({ queryKey: ['notifications'], queryFn: api.notifications })
  const read = useMutation({ mutationFn: (ids: string[] | 'all') => api.markNotificationsRead(ids), onSuccess: refresh })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return <PageSkeleton />
  const unread = data.filter(n => !n.readAt).length
  return (
    <>
      <TopBar
        back="/inicio"
        title={t('title')}
        right={
          <button className="link text-sm" disabled={!unread} onClick={() => read.mutate('all')}>
            {t('markAll')}
          </button>
        }
      />
      <div className="pad">
        {data.length ? (
          <div className="list">
            {data.map(n => (
              <button
                key={n.id}
                className="li plainline items-start"
                onClick={() => {
                  if (!n.readAt) read.mutate([n.id])
                  router.push(n.deepLink)
                }}
              >
                <i className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: n.readAt ? 'transparent' : 'var(--brand)' }} aria-label={n.readAt ? undefined : t('unread')} />
                <span className="ava h-8 w-8">
                  <Icon name={NOTIF_ICON[n.type]} size={16} />
                </span>
                <span className="flex-1">
                  <b className="text-[15px]">{n.title}</b>
                  <br />
                  <span className="t-foot">{n.body}</span>
                </span>
                <span className="t-cap">{ago(n.createdAt, locale)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-10 text-center">
            <Lumi mood="SLEEPY" size={72} />
            <p className="t-foot m-0">{t('empty')}</p>
          </div>
        )}
      </div>
    </>
  )
}
