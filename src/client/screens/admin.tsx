'use client'
// 07 · Panel de administración (solo ADMIN). Muestra datos reales o «—»; nunca cifras inventadas.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { money, num } from '@/shared/format'
import { PLAN_NAME, PRICES } from '@/shared/plans'
import { FB_BLOCKERS, FB_LIKES, FB_PAY, FB_PRICE, FB_WANTS } from '@/shared/feedback'
import { api, type AdminLessonRow, type LensRange } from '../api'
import { VIEW_AS_KEY } from '../api/http'
import { useLang } from '../hooks'
import { useGuard } from '../shell'
import { LineChart } from '../ui/charts'
import { Icon, Logo } from '../ui/icons'
import { PageSkeleton, Seg } from '../ui/kit'
import { PanelCards, ReportsTab, UserControls, useOpenReports } from './admin2'
import { Glance, MessagesTab } from './admin3'

type Tab = 'metrics' | 'reports' | 'messages' | 'feedback' | 'lessons' | 'users' | 'campaigns' | 'content' | 'settings' | 'audit'
const dash = (v: number | null | undefined, locale: string, suffix = '') => (v === null || v === undefined ? '—' : num(v, locale, 0) + suffix)

function Metrics({ onOpenUser, onOpenReports, onOpenMessages }: { onOpenUser: (id: string) => void; onOpenReports: () => void; onOpenMessages: () => void }) {
  const t = useTranslations('admin')
  const locale = useLang()
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')
  const { data: m } = useQuery({ queryKey: ['admin-metrics', range], queryFn: () => api.adminMetrics(range) })
  if (!m) return <PageSkeleton />
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="t-title">{t('tabs.metrics')}</h2>
        <Seg label={t('range')} className="w-[200px]" value={range} onChange={setRange} options={(['7d', '30d', '90d'] as const).map(r => ({ value: r, label: r.replace('d', ' d') }))} />
      </div>
      {/* Lo importante de un vistazo: personas, actividad, planes, avisos, mensajes y las últimas altas */}
      <Glance onOpenUser={onOpenUser} onOpenReports={onOpenReports} onOpenMessages={onOpenMessages} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="stat">
          <span className="t-cap">{t('dauMau')}</span>
          <b>
            {dash(m.dau, locale)} / {dash(m.mau, locale)}
          </b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('retention')}</span>
          <b>{dash(m.retentionD7, locale, ' %')}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('conversion')}</span>
          <b>{dash(m.premiumConversion, locale, ' %')}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('trades')}</span>
          <b>{dash(m.simulatedTrades, locale)}</b>
        </div>
      </div>
      <PanelCards onOpenUser={onOpenUser} onOpenReports={onOpenReports} />
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="card">
          <b>{t('activeByDay')}</b>
          <LineChart values={m.series} up height={140} fill label={t('activeByDay')} />
        </div>
        <div className="card flex flex-col gap-2">
          <b>{t('funnel')}</b>
          {m.funnel.map(f => (
            <div key={f.label} className="kv">
              <span>{f.label}</span>
              <span>{dash(f.value, locale)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card flex flex-col gap-2">
          <b>{t('money')}</b>
          {m.money.map(f => (
            <div key={f.key} className="kv">
              <span>{t(`ev.${f.key}`)}</span>
              <span>{num(f.value, locale, 0)}</span>
            </div>
          ))}
        </div>
        <div className="card flex flex-col gap-2 overflow-x-auto">
          <b>{t('sourcesTitle')}</b>
          {m.sources.length ? (
            <table className="t-foot w-full">
              <thead className="t-cap text-left">
                <tr>
                  <th>{t('source')}</th>
                  <th className="text-right">{t('signups')}</th>
                  <th className="text-right">{t('trials')}</th>
                  <th className="text-right">{t('paid')}</th>
                </tr>
              </thead>
              <tbody>
                {m.sources.map(s => (
                  <tr key={s.source}>
                    <td>{s.source}</td>
                    <td className="text-right">{s.users}</td>
                    <td className="text-right">{s.trials}</td>
                    <td className="text-right">{s.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="t-cap">{t('noData')}</span>
          )}
        </div>
      </div>
      <div className="card flex flex-col gap-2 overflow-x-auto">
        <b>{t('cohorts')}</b>
        {m.cohorts.length ? (
          <table className="t-foot w-full">
            <thead className="t-cap text-left">
              <tr>
                <th>{t('week')}</th>
                <th className="text-right">{t('signups')}</th>
                <th className="text-right">D1</th>
                <th className="text-right">D7</th>
                <th className="text-right">D30</th>
              </tr>
            </thead>
            <tbody>
              {m.cohorts.map(c => (
                <tr key={c.week}>
                  <td>{c.week}</td>
                  <td className="text-right">{c.size}</td>
                  <td className="text-right">{dash(c.d1, locale, ' %')}</td>
                  <td className="text-right">{dash(c.d7, locale, ' %')}</td>
                  <td className="text-right">{dash(c.d30, locale, ' %')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="t-cap">{t('noData')}</span>
        )}
      </div>
      <div className="card flex flex-col gap-1 overflow-x-auto">
        <b>{t('errorsTitle')}</b>
        {m.errors.length ? (
          <table className="t-foot w-full min-w-[560px]">
            <thead className="t-cap text-left">
              <tr>
                <th>{t('errorWhere')}</th>
                <th>{t('errorMessage')}</th>
                <th className="text-right">{t('errorCount')}</th>
                <th className="text-right">{t('errorUsers')}</th>
                <th className="text-right">{t('errorLast')}</th>
              </tr>
            </thead>
            <tbody>
              {m.errors.map((e, k) => (
                <tr key={k} className="border-t align-top" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-1 pr-2">
                    <span className="chip mr-1" style={{ background: e.kind === 'SERVER' ? 'var(--down)' : 'var(--amber, #f5a623)', color: '#fff' }}>
                      {e.kind === 'SERVER' ? t('errorServer') : t('errorApp')}
                    </span>
                    {e.where}
                  </td>
                  <td className="py-1 pr-2 break-all">{e.message}</td>
                  <td className="py-1 text-right">{e.count}</td>
                  <td className="py-1 text-right">{e.users}</td>
                  <td className="py-1 text-right whitespace-nowrap">{new Date(e.last).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="t-cap">{t('noErrors')}</span>
        )}
      </div>
      <div className="card">
        <b>{t('providers')}</b>
        {m.providers.map(p => (
          <div key={p.name} className="kv">
            <span>{p.name}</span>
            <span>
              <span style={{ color: p.status === 'OK' ? 'var(--up)' : p.status === 'DEGRADED' ? 'var(--amber)' : 'var(--down)' }}>●</span> {p.status} · {p.note}
            </span>
          </div>
        ))}
      </div>
      <p className="t-cap m-0">{t('honest')}</p>
    </div>
  )
}

/** Las 20 clases que más se abandonan y las 50 preguntas que más se fallan (auditoría PRO-21) */
function Hotspots() {
  const t = useTranslations('admin')
  const { data } = useQuery({ queryKey: ['admin-hotspots'], queryFn: api.adminHotspots })
  if (!data) return null
  return (
    <div className="card flex flex-col gap-3">
      <b className="t-head">{t('hotLessons')}</b>
      <span className="t-cap">{t('hotLessonsNote', { min: data.minStarts, n: data.lessonsMeasured })}</span>
      {data.lessons.length ? (
        <div className="overflow-x-auto">
          <table className="t-foot w-full min-w-[520px] text-left tabular-nums">
            <thead>
              <tr className="t-cap">
                <th>{t('hotLesson')}</th>
                <th>{t('hotStarts')}</th>
                <th>{t('hotDone')}</th>
                <th>{t('hotAbandon')}</th>
                <th>{t('hotExitAt')}</th>
              </tr>
            </thead>
            <tbody>
              {data.lessons.map(l => (
                <tr key={l.id}>
                  <td>
                    <b style={{ color: 'var(--ink)' }}>{l.title}</b> <span className="t-cap">{l.id}</span>
                  </td>
                  <td>{l.starts}</td>
                  <td>{l.completed}</td>
                  <td className={l.abandonPct >= 50 ? 'down font-bold' : undefined}>{l.abandonPct} %</td>
                  <td>{l.exitAtPct === null ? '—' : `${l.exitAtPct} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <span className="t-foot">{t('hotEmpty')}</span>
      )}
      <b className="t-head mt-2">{t('hotQuestions')}</b>
      <span className="t-cap">{t('hotQuestionsNote', { min: data.minAnswers, n: data.questionsMeasured })}</span>
      {data.questions.length ? (
        <ol className="m-0 flex flex-col gap-1.5 pl-5">
          {data.questions.map(q => (
            <li key={q.id} className="t-foot">
              <b className="down">{q.failPct} %</b> · {q.prompt} <span className="t-cap">({q.id} · {t('hotAnswers', { n: q.answers })})</span>
            </li>
          ))}
        </ol>
      ) : (
        <span className="t-foot">{t('hotEmpty')}</span>
      )}
    </div>
  )
}

function Content() {
  const t = useTranslations('admin')
  const [sel, setSel] = useState('q-u2l3')
  const { data } = useQuery({ queryKey: ['admin-content'], queryFn: api.adminContent })
  if (!data) return <PageSkeleton />
  const qs = data.quizzes[sel] ?? []
  return (
    <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
      <div className="card flex flex-col gap-1">
        <b className="mb-1">Trading desde cero</b>
        {data.units.map(u => (
          <div key={u.id} className="flex flex-col">
            <span className="t-foot font-bold" style={{ color: 'var(--ink)' }}>
              {u.order} · {u.title}
            </span>
            {u.lessons.map(l => (
              <button key={l.id} className="t-foot rounded-lg px-2 py-1 text-left" style={sel === l.quizId ? { background: 'var(--fill)', color: 'var(--ink)' } : undefined} onClick={() => setSel(l.quizId)}>
                {l.title} · {(data.quizzes[l.quizId] ?? []).length} {t('questions')}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Hotspots />
        <div className="banner banner-info">{t('contentNote')}</div>
        {qs.map((q, i) => (
          <div key={q.id} className="card flex flex-col gap-1.5">
            <span className="t-cap">
              {i + 1} · {q.type}
            </span>
            <b>{q.prompt}</b>
            {q.options.map((o, k) => {
              const right = Array.isArray(q.solution) ? q.solution.includes(k) : q.solution === k || q.solution === o
              return (
                <span key={k} className="t-foot" style={right ? { color: 'var(--up)', fontWeight: 700 } : undefined}>
                  {right ? '✓' : '·'} {o}
                </span>
              )
            })}
            <span className="t-cap">{q.explanation}</span>
          </div>
        ))}
        <p className="t-cap m-0">{t('achievementsCount', { n: data.achievements })}</p>
      </div>
    </div>
  )
}

function Users({ sel, setSel }: { sel: string | null; setSel: (id: string | null) => void }) {
  return sel ? <UserDetail id={sel} onBack={() => setSel(null)} /> : <UserList onOpen={setSel} />
}

function UserList({ onOpen }: { onOpen: (id: string) => void }) {
  const t = useTranslations('admin')
  const locale = useLang()
  const [q, setQ] = useState('')
  const { data } = useQuery({ queryKey: ['admin-users', q], queryFn: () => api.adminUsers(q) })
  return (
    <div className="flex flex-col gap-3">
      <input className="input" placeholder={t('searchUsers')} value={q} onChange={e => setQ(e.target.value)} aria-label={t('searchUsers')} />
      <div className="list overflow-x-auto">
        <div className="li plainline t-cap min-w-[560px] font-bold">
          <span className="flex-[2]">{t('user')}</span>
          <span className="flex-1">{t('plan')}</span>
          <span className="flex-1">XP</span>
          <span className="flex-1">{t('lastActive')}</span>
          <span className="flex-1">{t('source')}</span>
          <span className="flex-1">{t('status')}</span>
        </div>
        {data?.length ? (
          data.map(u => (
            <button key={u.id} className="li plainline min-w-[560px] text-left" onClick={() => onOpen(u.id)}>
              <span className="flex-[2] truncate">
                <b>{u.name}</b>
                <br />
                <span className="t-cap">{u.email}</span>
              </span>
              <span className="flex-1">{PLAN_NAME[u.plan as keyof typeof PLAN_NAME] ?? u.plan}</span>
              <span className="flex-1">{num(u.xp, locale, 0)}</span>
              <span className="flex-1">{u.lastActive}</span>
              <span className="flex-1">{u.source ?? '—'}</span>
              <span className="flex-1">{u.blocked ? t('blocked') : t('active')}</span>
            </button>
          ))
        ) : (
          <div className="li plainline t-foot">{t('noUsers')}</div>
        )}
      </div>
      <p className="t-cap m-0">{t('usersNote')}</p>
    </div>
  )
}

function UserDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const t = useTranslations('admin.userCard')
  const t3 = useTranslations('admin3.card')
  const locale = useLang()
  const qc = useQueryClient()
  const router = useRouter()
  const { data: u, error } = useQuery({ queryKey: ['admin-user', id], queryFn: () => api.adminUser(id) })
  const view = useMutation({
    mutationFn: () => api.adminViewAs(id),
    onSuccess: () => {
      try {
        sessionStorage.setItem(VIEW_AS_KEY, id)
      } catch {
        // sin almacenamiento no se puede «ver como»
      }
      qc.clear()
      router.push('/inicio')
    },
  })
  const date = (s: string | null) => (s ? new Date(s).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
  const kv = (k: string, v: React.ReactNode) => (
    <div key={k} className="kv">
      <span>{k}</span>
      <span>{v ?? '—'}</span>
    </div>
  )
  if (error) return <p className="err">{error.message}</p>
  if (!u) return <PageSkeleton />
  const euro = (v: number) => (locale === 'en' ? `€${num(v, locale, 2)}` : `${num(v, locale, 2)} €`)
  const chips: [string, React.CSSProperties?][] = [
    [PLAN_NAME[u.plan as keyof typeof PLAN_NAME] ?? u.plan, { background: u.plan === 'FREE' ? 'var(--fill)' : 'color-mix(in srgb, var(--brand) 15%, transparent)', color: 'var(--ink)' }],
    ...(u.blocked ? [[t('blocked'), { background: 'var(--down)', color: '#fff' }] as [string, React.CSSProperties]] : []),
    ...(u.isTeam ? [[t3('team')] as [string]] : []),
    ...(u.guest ? [[t3('guest')] as [string]] : []),
    ...(!u.emailVerified && !u.guest ? [[t('notVerified')] as [string]] : []),
    ...(!u.onboarding.done ? [[t('step', { n: u.onboarding.step ?? 0 })] as [string]] : []),
  ]
  const stats: [string, string, string?][] = [
    [t3('level'), u.game ? String(u.game.level) : '—', u.game ? `${num(u.game.xp, locale, 0)} XP` : undefined],
    [t3('streak'), u.game ? String(u.game.streak) : '—', u.game ? t3('best', { n: u.game.bestStreak }) : undefined],
    [t3('lessons'), String(u.learning.lessonsDone), u.learning.accuracy === null ? undefined : t3('accuracy', { n: u.learning.accuracy })],
    [t3('trades'), String(u.market.trades), t3('positions', { n: u.market.positions })],
    [t3('cash'), u.market.cash === null ? '—' : euro(u.market.cash)],
    [t3('gems'), u.game ? num(u.game.gems, locale, 0) : '—', u.game ? t3('lives', { n: u.game.lives }) : undefined],
  ]
  return (
    <div className="flex flex-col gap-3">
      <button className="link flex min-h-11 items-center gap-1 self-start text-sm" onClick={onBack}>
        <Icon name="back" size={16} /> {t('back')}
      </button>
      {/* 1 · Quién es, su plan y su actividad */}
      <div className="card flex flex-col gap-3">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="t-title m-0 break-words">{u.name}</h2>
            <span className="t-foot break-all">{u.email}</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {chips.map(([label, style]) => (
                <span key={label} className="chip" style={style ?? { background: 'var(--fill)' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="#mensaje" className="btn btn-secondary w-auto">
              <Icon name="chat" size={18} /> {t3('write')}
            </a>
            <button className="btn btn-primary w-auto" onClick={() => view.mutate()} disabled={view.isPending}>
              <Icon name="user" size={18} /> {t('viewAs')}
            </button>
          </div>
        </div>
        <p className="t-cap m-0">{t3('since', { created: date(u.createdAt), active: u.lastActive ?? '—', seen: date(u.lastSeen), lang: u.locale, source: u.source ?? '—' })}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map(([k, v, hint]) => (
            <div key={k} className="rounded-xl px-3 py-2" style={{ background: 'var(--fill)' }}>
              <div className="t-cap">{k}</div>
              <b className="text-lg tabular-nums">{v}</b>
              {hint && <div className="t-cap">{hint}</div>}
            </div>
          ))}
        </div>
        <p className="t-cap m-0">{t('viewAsNote')}</p>
      </div>
      {/* 2 · Mandos */}
      <h3 className="t-head m-0 mt-1">{t3('controls')}</h3>
      <UserControls u={u} />
      {/* 3 · Detalle técnico */}
      <h3 className="t-head m-0 mt-1">{t3('detail')}</h3>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card flex flex-col">
          <b className="mb-1">{t('account')}</b>
          {kv(t('createdAt'), date(u.createdAt))}
          {kv(t('lastSeen'), date(u.lastSeen))}
          {kv(t('lastActive'), u.lastActive)}
          {kv(t('language'), u.locale)}
          {kv(t3('login'), u.login.join(' + ') || '—')}
          {kv(t('onboarding'), u.onboarding.done ? t('done') : t('step', { n: u.onboarding.step ?? 0 }))}
          {kv(t('experience'), u.onboarding.experience)}
          {kv(t('goals'), u.onboarding.goals.join(', ') || '—')}
          {kv(t('minutes'), u.onboarding.minutes)}
          {kv(t('subscription'), u.subscription ? `${u.subscription.status}${u.subscription.trialEndsAt ? ' · ' + date(u.subscription.trialEndsAt) : ''}` : '—')}
          {kv(t('status'), u.blocked ? t('blocked') : t('active'))}
        </div>
        <div className="card flex flex-col">
          <b className="mb-1">{t('game')}</b>
          {u.game ? (
            <>
              {kv(t('level'), u.game.level)}
              {kv('XP', num(u.game.xp, locale, 0))}
              {kv(t('weekXp'), num(u.game.weekXp, locale, 0))}
              {kv(t('streak'), `${u.game.streak} · ${t('best')} ${u.game.bestStreak}`)}
              {kv(t3('freezes'), u.game.freezes ?? '—')}
              {kv(t('division'), u.game.division)}
              {kv(t('gems'), u.game.gems)}
              {kv(t('lives'), u.game.lives)}
              {kv(t('badges'), u.badges)}
              {kv(t('tutor'), u.tutorQuestions)}
            </>
          ) : (
            <span className="t-cap">—</span>
          )}
        </div>
        <div className="card flex flex-col">
          <b className="mb-1">{t('learning')}</b>
          {kv(t('lessonsDone'), u.learning.lessonsDone)}
          {kv(t('accuracy'), u.learning.accuracy === null ? '—' : `${u.learning.accuracy} % · ${u.learning.answers}`)}
          <b className="mt-3 mb-1">{t('market')}</b>
          {kv(t('cash'), u.market.cash === null ? '—' : euro(u.market.cash))}
          {kv(t('positions'), u.market.positions)}
          {kv(t('trades'), u.market.trades)}
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card flex flex-col">
          <b className="mb-1">{t('lastLessons')}</b>
          {u.learning.last.length ? u.learning.last.map(l => kv(`${l.title}${l.skipped ? ' · ' + t('skipped') : ''}`, `${'★'.repeat(l.stars)} ${date(l.at)}`)) : <span className="t-cap">—</span>}
        </div>
        <div className="card flex flex-col">
          <b className="mb-1">{t('lastTrades')}</b>
          {u.market.last.length ? u.market.last.map((x, k) => <div key={k}>{kv(`${x.side} ${x.symbol}${x.status !== 'FILLED' ? ' · ' + x.status : ''}`, `${num(x.total, locale, 2)} € · ${date(x.at)}`)}</div>) : <span className="t-cap">—</span>}
        </div>
      </div>
      <details className="card flex flex-col">
        <summary className="flex min-h-11 cursor-pointer items-center font-bold">
          {t('events')} <span className="t-cap ml-2">({u.events.length})</span>
        </summary>
        {u.events.length ? (
          u.events.map((e, k) => (
            <div key={k} className="kv">
              <span className="min-w-0 break-all">
                <b>{e.name}</b> <span className="t-cap">{e.props ? JSON.stringify(e.props).slice(0, 80) : ''}</span>
              </span>
              <span>{date(e.at)}</span>
            </div>
          ))
        ) : (
          <span className="t-cap">—</span>
        )}
      </details>
    </div>
  )
}

function FeedbackTab() {
  const t = useTranslations('admin.feedbackTab')
  const tf = useTranslations('feedback')
  const locale = useLang()
  const { data: f } = useQuery({ queryKey: ['admin-feedback'], queryFn: api.adminFeedback })
  if (!f) return <PageSkeleton />
  const bars = (title: string, key: 'likes' | 'blockers' | 'pay' | 'price' | 'wants', ids: readonly string[]) => {
    const max = Math.max(1, ...ids.map(id => f[key][id] ?? 0))
    return (
      <div className="card flex flex-col gap-1.5">
        <b className="mb-1">{title}</b>
        {ids.map(id => (
          <div key={id} className="flex items-center gap-2 text-[13px]">
            <span className="w-[45%] flex-none truncate">{tf(`${key}.${id}`)}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
              <span className="block h-full rounded-full" style={{ width: `${((f[key][id] ?? 0) / max) * 100}%`, background: 'var(--brand)' }} />
            </span>
            <b className="w-8 text-right tabular-nums">{f[key][id] ?? 0}</b>
          </div>
        ))}
      </div>
    )
  }
  const histMax = Math.max(1, ...f.npsHist)
  return (
    <div className="flex flex-col gap-3">
      <h2 className="t-title">{t('title')}</h2>
      <p className="t-foot m-0">{t('what')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/opinion" className="btn btn-secondary w-auto">
          {t('preview')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="stat">
          <span className="t-cap">{t('answers')}</span>
          <b>{f.total}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('nps')}</span>
          <b>{f.nps ?? '—'}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('wouldPay')}</span>
          <b>{f.total ? `${Math.round(((f.pay.now ?? 0) / f.total) * 100)} %` : '—'}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('withComment')}</span>
          <b>{f.comments.length}</b>
        </div>
      </div>
      <div className="card flex flex-col gap-2">
        <b>{t('npsTitle')}</b>
        <div className="flex h-28 items-end gap-1.5">
          {f.npsHist.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="t-cap tabular-nums">{n || ''}</span>
              <span className="w-full rounded-t-md" style={{ height: `${(n / histMax) * 80}px`, minHeight: 2, background: i >= 9 ? 'var(--up)' : i <= 6 ? 'var(--down)' : 'var(--amber, #f5a623)' }} />
              <span className="t-cap">{i}</span>
            </div>
          ))}
        </div>
        <span className="t-cap">{t('npsNote')}</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {bars(t('likes'), 'likes', FB_LIKES)}
        {bars(t('blockers'), 'blockers', FB_BLOCKERS)}
        {bars(t('pay', { price: money(PRICES.normal.PREMIUM.MONTH, 'EUR', locale) }), 'pay', FB_PAY)}
        {bars(t('price'), 'price', FB_PRICE)}
        {bars(t('wants'), 'wants', FB_WANTS)}
      </div>
      <div className="card flex flex-col">
        <b className="mb-1">{t('comments')}</b>
        {f.comments.length ? (
          f.comments.map(c => (
            <div key={c.id} className="flex flex-col gap-0.5 border-t py-2.5 first:border-t-0" style={{ borderColor: 'var(--line)' }}>
              <span className="t-cap">
                {c.who} · {t('npsShort')} {c.nps} · {c.plan} · {t('day', { n: c.daysIn })} · {new Date(c.at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
              </span>
              {c.comment && <span className="t-body">{c.comment}</span>}
              {c.wantsOther && (
                <span className="t-foot">
                  {t('wantsOther')}: {c.wantsOther}
                </span>
              )}
            </div>
          ))
        ) : (
          <span className="t-cap">{t('empty')}</span>
        )}
      </div>
    </div>
  )
}

function Campaigns() {
  const t = useTranslations('admin.campaigns')
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const { data } = useQuery({ queryKey: ['admin-campaigns'], queryFn: api.adminCampaigns })
  const create = useMutation({ mutationFn: () => api.adminCreateCampaign(name), onSuccess: () => (setName(''), qc.invalidateQueries({ queryKey: ['admin-campaigns'] })) })
  const del = useMutation({ mutationFn: api.adminDeleteCampaign, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-campaigns'] }) })
  const link = (slug: string) => `${typeof location !== 'undefined' ? location.origin : ''}/?ref=${slug}`
  const copy = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(link(slug))
      setCopied(slug)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // sin portapapeles: el enlace se ve y se puede seleccionar
    }
  }
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : '—')
  return (
    <div className="flex flex-col gap-3">
      <h2 className="t-title">{t('title')}</h2>
      <p className="t-foot m-0">{t('what')}</p>
      <form
        className="card flex flex-wrap items-end gap-2"
        onSubmit={e => {
          e.preventDefault()
          if (name.trim()) create.mutate()
        }}
      >
        <div className="field min-w-[220px] flex-1">
          <label htmlFor="c-name">{t('name')}</label>
          <input id="c-name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder={t('placeholder')} maxLength={60} />
        </div>
        <button className="btn btn-primary w-auto" disabled={create.isPending || !name.trim()}>
          <Icon name="plus" size={18} /> {t('create')}
        </button>
        {create.error && <p className="err m-0 w-full">{create.error.message}</p>}
      </form>
      {!data ? (
        <PageSkeleton />
      ) : data.length ? (
        data.map(c => (
          <div key={c.slug} className="card flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <b className="flex-1">{c.name}</b>
              <button
                className="icon-btn"
                aria-label={t('delete')}
                title={t('delete')}
                onClick={() => {
                  if (confirm(t('confirmDelete', { name: c.name }))) del.mutate(c.slug)
                }}
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 text-[13px]" style={{ background: 'var(--fill)' }}>
                {link(c.slug)}
              </code>
              <button className="btn btn-secondary w-auto py-1.5 text-sm" onClick={() => copy(c.slug)}>
                {copied === c.slug ? t('copied') : t('copy')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                [t('visits'), c.visits],
                [t('signups'), c.signups],
                [t('trials'), c.trials],
                [t('paid'), c.paid],
                [t('conversion'), pct(c.signups, c.visits)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl px-3 py-2" style={{ background: 'var(--fill)' }}>
                  <div className="t-cap">{k}</div>
                  <b className="text-lg tabular-nums">{v}</b>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="t-cap">{t('empty')}</p>
      )}
      <p className="t-cap m-0">{t('note')}</p>
    </div>
  )
}

type SortKey = 'order' | 'starts' | 'done' | 'completion' | 'skipped'

function Lessons() {
  const t = useTranslations('admin.lessonsTab')
  const [range, setRange] = useState<LensRange>('30d')
  const [sort, setSort] = useState<SortKey>('order')
  const [onlyData, setOnlyData] = useState(true)
  const { data } = useQuery({ queryKey: ['admin-lessons', range], queryFn: () => api.adminLessons(range) })
  if (!data) return <PageSkeleton />
  const rows = data.map((r, i) => ({ ...r, order: i })).filter(r => !onlyData || r.starts || r.done || r.skipped)
  const val = (r: AdminLessonRow & { order: number }) => (sort === 'order' ? -r.order : sort === 'completion' ? -(r.completion ?? 101) : r[sort])
  rows.sort((a, b) => val(b) - val(a))
  const head: [SortKey | null, string][] = [
    ['order', t('lesson')],
    ['starts', t('starts')],
    [null, t('quiz')],
    ['done', t('done')],
    ['completion', '%'],
    ['skipped', t('skipped')],
  ]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="t-title">{t('title')}</h2>
        <div className="flex items-center gap-3">
          <label className="t-foot flex items-center gap-1.5">
            <input type="checkbox" checked={onlyData} onChange={e => setOnlyData(e.target.checked)} /> {t('onlyData')}
          </label>
          <Seg label={t('title')} className="w-[200px]" value={range} onChange={setRange} options={[{ value: '7d', label: '7 d' }, { value: '30d', label: '30 d' }, { value: 'all', label: t('all') }]} />
        </div>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="t-foot w-full min-w-[640px]">
          <thead className="t-cap text-left">
            <tr>
              {head.map(([k, label], i) => (
                <th key={label} className={`px-3 py-2 ${i ? 'text-right' : ''}`}>
                  {k ? (
                    <button className="font-bold" style={sort === k ? { color: 'var(--brand-ink)' } : undefined} onClick={() => setSort(k)}>
                      {label}
                    </button>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                <td className="px-3 py-1.5">
                  <Link href={`/leccion/${r.id}`} className="link">
                    {r.unit} · {r.title}
                  </Link>
                </td>
                <td className="px-3 text-right">{r.starts}</td>
                <td className="px-3 text-right">{r.quiz}</td>
                <td className="px-3 text-right">{r.done}</td>
                <td className="px-3 text-right" style={r.completion !== null && r.completion < 50 ? { color: 'var(--down)', fontWeight: 700 } : undefined}>
                  {r.completion === null ? '—' : `${r.completion} %`}
                </td>
                <td className="px-3 text-right">{r.skipped}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="t-cap px-3">{t('empty')}</p>}
      </div>
      <p className="t-cap m-0">{t('note')}</p>
    </div>
  )
}

function GlobalSettings() {
  const t = useTranslations('admin')
  const rows = t.raw('settingsRows') as [string, string][]
  return (
    <div className="card px-4 py-1">
      {rows.map(([k, v]) => (
        <div key={k} className="kv">
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
      <p className="t-cap my-3">{t('settingsNote')}</p>
    </div>
  )
}

function Audit() {
  const t = useTranslations('admin')
  const locale = useLang()
  const { data } = useQuery({ queryKey: ['admin-audit'], queryFn: api.adminAudit })
  return (
    <div className="list">
      {data?.length ? (
        data.map(a => (
          <div key={a.id} className="li plainline">
            <span className="t-cap w-32">{new Date(a.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            <span className="flex-1">
              <b>{a.action}</b> · {a.entity}
            </span>
            <span className="t-cap">{a.actor}</span>
          </div>
        ))
      ) : (
        <div className="li plainline t-foot">{t('noAudit')}</div>
      )}
    </div>
  )
}

export function Admin() {
  const t = useTranslations('admin')
  const { ready } = useGuard('admin')
  const t2 = useTranslations('admin2')
  const t3 = useTranslations('admin3')
  const [tab, setTab] = useState<Tab>('metrics')
  const [userSel, setUserSel] = useState<string | null>(null)
  const open = useOpenReports()
  if (!ready) return <PageSkeleton />
  const tabs: Tab[] = ['metrics', 'reports', 'messages', 'feedback', 'lessons', 'users', 'campaigns', 'content', 'settings', 'audit']
  const openUser = (id: string) => (setUserSel(id), setTab('users'), window.scrollTo(0, 0))
  // Abre la app con la capa de datos encendida
  const openWithData = () => {
    try {
      localStorage.setItem('lumi:lens', '1')
    } catch {
      // sin almacenamiento: se abre con el botón «Datos»
    }
  }
  return (
    <div className="min-h-dvh md:flex">
      <aside className="flex flex-none gap-1 overflow-x-auto border-b p-3 md:h-dvh md:w-56 md:flex-col md:border-r md:border-b-0 md:py-5" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <Link href="/inicio" className="mr-3 flex flex-none items-center gap-2 px-2 font-extrabold md:mb-4" style={{ color: 'var(--ink)' }}>
          <Logo size={26} /> Admin
        </Link>
        {tabs.map(k => (
          <button key={k} onClick={() => (setTab(k), k === 'users' && setUserSel(null))} aria-current={tab === k ? 'page' : undefined} className="flex flex-none items-center gap-1.5 rounded-xl px-3 py-2 text-left text-sm font-bold" style={tab === k ? { background: 'color-mix(in srgb, var(--brand) 12%, transparent)', color: 'var(--brand-ink)' } : { color: 'var(--ink-2)' }}>
            {k === 'reports' ? t2('tabs.reports') : k === 'messages' ? t3('tabs.messages') : t(`tabs.${k}`)}
            {k === 'reports' && !!open && (
              <span className="rounded-full px-1.5 text-[11px] leading-[18px] tabular-nums" style={{ background: 'var(--amber, #f5a623)', color: '#1d1d1f' }} aria-label={t2('tabs.openBadge', { n: open })}>
                {open}
              </span>
            )}
          </button>
        ))}
        <Link href="/inicio" onClick={openWithData} className="btn btn-primary mt-2 hidden w-auto px-3 text-sm md:flex">
          <Icon name="chart" size={16} /> {t('openWithData')}
        </Link>
        <Link href="/inicio" onClick={openWithData} className="flex flex-none items-center rounded-xl px-3 py-2 text-sm font-bold md:hidden" style={{ color: 'var(--brand-ink)' }}>
          {t('openWithData')}
        </Link>
        <Link href="/inicio" className="t-foot mt-auto hidden items-center gap-2 px-3 md:flex">
          <Icon name="back" size={16} /> {t('backToApp')}
        </Link>
      </aside>
      <main className="mx-auto w-full max-w-[1100px] flex-1 p-4 md:p-8">{tab === 'metrics' ? <Metrics onOpenUser={openUser} onOpenReports={() => setTab('reports')} onOpenMessages={() => setTab('messages')} /> : tab === 'reports' ? <ReportsTab onOpenUser={openUser} /> : tab === 'messages' ? <MessagesTab onOpenUser={openUser} /> : tab === 'feedback' ? <FeedbackTab /> : tab === 'lessons' ? <Lessons /> : tab === 'campaigns' ? <Campaigns /> : tab === 'content' ? <Content /> : tab === 'users' ? <Users sel={userSel} setSel={setUserSel} /> : tab === 'settings' ? <GlobalSettings /> : <Audit />}</main>
    </div>
  )
}
