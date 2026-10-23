'use client'
// 07 · Panel de administración (solo ADMIN). Muestra datos reales o «—»; nunca cifras inventadas.
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { num } from '@/shared/format'
import { api } from '../api'
import { useLang } from '../hooks'
import { useGuard } from '../shell'
import { LineChart } from '../ui/charts'
import { Icon, Logo } from '../ui/icons'
import { PageSkeleton, Seg } from '../ui/kit'

type Tab = 'metrics' | 'content' | 'users' | 'settings' | 'audit'
const dash = (v: number | null | undefined, locale: string, suffix = '') => (v === null || v === undefined ? '—' : num(v, locale, 0) + suffix)

function Metrics() {
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

function Users() {
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
          <span className="flex-1">{t('status')}</span>
        </div>
        {data?.length ? (
          data.map(u => (
            <div key={u.id} className="li plainline min-w-[560px]">
              <span className="flex-[2] truncate">
                <b>{u.name}</b>
                <br />
                <span className="t-cap">{u.email}</span>
              </span>
              <span className="flex-1">{u.plan}</span>
              <span className="flex-1">{num(u.xp, locale, 0)}</span>
              <span className="flex-1">{u.lastActive}</span>
              <span className="flex-1">{u.blocked ? t('blocked') : t('active')}</span>
            </div>
          ))
        ) : (
          <div className="li plainline t-foot">{t('noUsers')}</div>
        )}
      </div>
      <p className="t-cap m-0">{t('usersNote')}</p>
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
  const [tab, setTab] = useState<Tab>('metrics')
  if (!ready) return <PageSkeleton />
  const tabs: Tab[] = ['metrics', 'content', 'users', 'settings', 'audit']
  return (
    <div className="min-h-dvh md:flex">
      <aside className="flex flex-none gap-1 overflow-x-auto border-b p-3 md:h-dvh md:w-56 md:flex-col md:border-r md:border-b-0 md:py-5" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <Link href="/inicio" className="mr-3 flex flex-none items-center gap-2 px-2 font-extrabold md:mb-4" style={{ color: 'var(--ink)' }}>
          <Logo size={26} /> Admin
        </Link>
        {tabs.map(k => (
          <button key={k} onClick={() => setTab(k)} aria-current={tab === k ? 'page' : undefined} className="flex-none rounded-xl px-3 py-2 text-left text-sm font-bold" style={tab === k ? { background: 'color-mix(in srgb, var(--brand) 12%, transparent)', color: 'var(--brand)' } : { color: 'var(--ink-2)' }}>
            {t(`tabs.${k}`)}
          </button>
        ))}
        <Link href="/inicio" className="t-foot mt-auto hidden items-center gap-2 px-3 md:flex">
          <Icon name="back" size={16} /> {t('backToApp')}
        </Link>
      </aside>
      <main className="mx-auto w-full max-w-[1100px] flex-1 p-4 md:p-8">{tab === 'metrics' ? <Metrics /> : tab === 'content' ? <Content /> : tab === 'users' ? <Users /> : tab === 'settings' ? <GlobalSettings /> : <Audit />}</main>
    </div>
  )
}
