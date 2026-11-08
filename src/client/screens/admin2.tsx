'use client'
// Admin (etapa 1): avisos de fallos, regalos de planes y mandos de la ficha de usuario.
// Todos los mandos piden confirmación, quedan en la auditoría y no se pueden usar mientras se «ve como» a alguien.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { api, ApiFailure, type AdminReport, type AdminUserDetail, type ReportKind, type ReportStatus } from '../api'
import { useLang, useSession } from '../hooks'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { PageSkeleton, Seg } from '../ui/kit'
import { BillingAdmin } from './admin-billing'

const KINDS: ReportKind[] = ['CONTENT', 'BUG', 'MARKET', 'OTHER']
const PLAN = { FREE: 'Free', PLUS: 'Plus', PREMIUM: 'Max' } as const
const DURATIONS = [7, 30, 90, 180, 365] as const

const useDate = () => {
  const locale = useLang()
  return (s: string | null, time = true) => (s ? new Date(s).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) }) : '—')
}
const errText = (e: unknown, fallback: string) => (e instanceof ApiFailure ? e.message : fallback)

/** Duración legible: 30 → «1 mes», 12 → «12 días» */
function useDuration() {
  const t = useTranslations('admin2.gift')
  return (days: number) => (DURATIONS.includes(days as (typeof DURATIONS)[number]) ? t(`d${days}`) : t('days', { n: days }))
}

// ── Avisos de fallos ─────────────────────────────────────
export function ReportsTab({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  const t = useTranslations('admin2.reports')
  const tk = useTranslations('admin2.report.kinds')
  const [status, setStatus] = useState<ReportStatus | 'ALL'>('OPEN')
  const [kind, setKind] = useState<ReportKind | 'ALL'>('ALL')
  const { data, error } = useQuery({ queryKey: ['admin-reports', status, kind], queryFn: () => api.adminReports(status === 'ALL' ? undefined : status, kind === 'ALL' ? undefined : kind) })
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="t-title m-0">{t('title')}</h2>
        {data && <span className="chip">{t('openCount', { n: data.open })}</span>}
      </div>
      <p className="t-foot m-0">{t('what')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Seg
          label={t('status')}
          className="w-full max-w-[420px]"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'OPEN', label: t('st.OPEN') },
            { value: 'DONE', label: t('st.DONE') },
            { value: 'DISCARDED', label: t('st.DISCARDED') },
            { value: 'ALL', label: t('all') },
          ]}
        />
        <select className="input h-11 w-auto min-w-[180px]" value={kind} onChange={e => setKind(e.target.value as ReportKind | 'ALL')} aria-label={t('kind')}>
          <option value="ALL">{t('allKinds')}</option>
          {KINDS.map(k => (
            <option key={k} value={k}>
              {tk(k)}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="err">{errText(error, t('failed'))}</p> : !data ? <PageSkeleton /> : data.items.length ? data.items.map(r => <ReportCard key={r.id} r={r} onOpenUser={onOpenUser} />) : <p className="t-cap">{t('empty')}</p>}
    </div>
  )
}

function ReportCard({ r, onOpenUser }: { r: AdminReport; onOpenUser: (id: string) => void }) {
  const t = useTranslations('admin2.reports')
  const tk = useTranslations('admin2.report.kinds')
  const date = useDate()
  const qc = useQueryClient()
  const toast = useToast()
  const [note, setNote] = useState(r.note ?? '')
  const viewing = !!useSession().data?.viewAs
  const set = useMutation({
    mutationFn: (s: ReportStatus) => api.adminUpdateReport(r.id, s, note.trim() || undefined),
    onSuccess: x => (toast(t(`done.${x.status}`)), qc.invalidateQueries({ queryKey: ['admin-reports'] }), qc.invalidateQueries({ queryKey: ['admin-open-reports'] })),
    onError: e => toast(errText(e, t('failed'))),
  })
  const c = r.context
  const color = r.status === 'OPEN' ? 'var(--amber, #f5a623)' : r.status === 'DONE' ? 'var(--up)' : 'var(--ink-3)'
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip" style={{ background: 'var(--fill)' }}>
          {tk(r.kind)}
        </span>
        <span className="chip" style={{ background: color, color: '#fff' }}>
          {t(`st.${r.status}`)}
        </span>
        <span className="t-cap ml-auto">{date(r.createdAt)}</span>
      </div>
      <p className="t-body m-0 break-words whitespace-pre-wrap">{r.message}</p>
      <div className="t-foot flex flex-wrap items-center gap-x-3 gap-y-1">
        {r.user ? (
          <button className="link px-0" onClick={() => onOpenUser(r.user!.id)}>
            <Icon name="user" size={14} className="mr-1 inline-block align-[-2px]" />
            {r.user.name} · {r.user.email}
          </button>
        ) : (
          <span>{t('noUser')}</span>
        )}
        <code className="rounded px-1.5 py-0.5 text-[12px] break-all" style={{ background: 'var(--fill)' }}>
          {r.path}
        </code>
        {c.lessonId && (
          <Link href={`/leccion/${c.lessonId}`} className="link px-0">
            {t('lesson')}: {c.lessonTitle ?? c.lessonId}
          </Link>
        )}
        {c.symbol && (
          <Link href={`/mercado/${encodeURIComponent(c.symbol)}`} className="link px-0">
            {t('asset')}: {c.symbol}
          </Link>
        )}
        {c.questionId && (
          <span>
            {t('question')}: <code className="text-[12px]">{c.questionId}</code>
          </span>
        )}
        {c.step && (
          <span>
            {t('step')}: <code className="text-[12px]">{c.step}</code>
          </span>
        )}
      </div>
      {r.note && r.status !== 'OPEN' && (
        <p className="t-foot m-0">
          <b>{t('note')}:</b> {r.note}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input className="input h-11 min-w-[200px] flex-1" value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder={t('notePlaceholder')} aria-label={t('note')} disabled={viewing} />
        {r.status !== 'DONE' && (
          <button className="btn btn-primary btn-sm" disabled={set.isPending || viewing} onClick={() => set.mutate('DONE')}>
            <Icon name="check" size={16} /> {t('markDone')}
          </button>
        )}
        {r.status !== 'DISCARDED' && (
          <button className="btn btn-secondary btn-sm" disabled={set.isPending || viewing} onClick={() => set.mutate('DISCARDED')}>
            {t('discard')}
          </button>
        )}
        {r.status !== 'OPEN' && (
          <button className="btn btn-plain btn-sm" disabled={set.isPending || viewing} onClick={() => set.mutate('OPEN')}>
            {t('reopen')}
          </button>
        )}
      </div>
    </div>
  )
}

/** Número de avisos abiertos (para el menú del panel) */
export function useOpenReports() {
  return useQuery({ queryKey: ['admin-open-reports'], queryFn: api.adminOpenReports, staleTime: 30_000 }).data?.open ?? null
}

// ── Tarjetas del panel ───────────────────────────────────
export function PanelCards({ onOpenUser, onOpenReports }: { onOpenUser: (id: string) => void; onOpenReports: () => void }) {
  const t = useTranslations('admin2.panel')
  const date = useDate()
  const dur = useDuration()
  const open = useOpenReports()
  const { data: gifts } = useQuery({ queryKey: ['admin-gifts'], queryFn: api.adminGifts })
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
      <button className="stat card text-left" onClick={onOpenReports}>
        <span className="t-cap">{t('openReports')}</span>
        <b className="text-[28px] leading-tight tabular-nums" style={open ? { color: 'var(--amber, #f5a623)' } : undefined}>
          {open ?? '—'}
        </b>
        <span className="t-cap" style={{ color: 'var(--brand-ink)' }}>
          {t('seeReports')}
        </span>
      </button>
      <div className="card flex flex-col gap-1">
        <b>{t('gifts')}</b>
        {!gifts ? (
          <span className="t-cap">{t('loading')}</span>
        ) : gifts.length ? (
          gifts.map(g => (
            <div key={g.id} className="kv items-center">
              <button className="link min-w-0 truncate px-0 text-left" onClick={() => onOpenUser(g.userId)}>
                {g.name} · <span className="t-cap">{g.email}</span>
              </button>
              <span className="t-foot flex-none text-right">
                {g.stripe ? dur(g.days) : `${dur(g.days)} ${PLAN[g.tier]}`}
                <br />
                <span className="t-cap">{g.stripe ? t('delayed') : t('until', { date: date(g.until, false) })}</span>
              </span>
            </div>
          ))
        ) : (
          <span className="t-cap">{t('noGifts')}</span>
        )}
      </div>
      {/* Estudiantes (precio de estudiante) y Grupos (planes de grupo) */}
      <BillingAdmin onOpenUser={onOpenUser} />
    </div>
  )
}

// ── Ficha de usuario: plan, regalos y mandos ─────────────
export function UserControls({ u }: { u: AdminUserDetail }) {
  const t = useTranslations('admin2.user')
  const viewing = !!useSession().data?.viewAs
  return (
    <div className="flex flex-col gap-3">
      {viewing && <div className="banner">{t('viewOnly')}</div>}
      <div className="grid gap-3 lg:grid-cols-2">
        <GiftCard u={u} disabled={viewing} />
        <Commands u={u} disabled={viewing} />
      </div>
    </div>
  )
}

function useAdminAction<A>(id: string, fn: (a: A) => Promise<unknown>, done: string) {
  const qc = useQueryClient()
  const toast = useToast()
  const t = useTranslations('admin2.user')
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast(done)
      void qc.invalidateQueries({ queryKey: ['admin-user', id] })
      void qc.invalidateQueries({ queryKey: ['admin-gifts'] })
      void qc.invalidateQueries({ queryKey: ['admin-users'] })
      void qc.invalidateQueries({ queryKey: ['admin-audit'] })
    },
    onError: e => toast(errText(e, t('failed'))),
  })
}

const SUB_STATUS = ['GIFT', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED'] as const

function GiftCard({ u, disabled }: { u: AdminUserDetail; disabled: boolean }) {
  const t = useTranslations('admin2.gift')
  const date = useDate()
  const dur = useDuration()
  const c = u.admin2
  const [tier, setTier] = useState<'PLUS' | 'PREMIUM'>('PREMIUM')
  const [days, setDays] = useState<number | 'CUSTOM'>(30)
  const [custom, setCustom] = useState('')
  const [reason, setReason] = useState('')
  const n = days === 'CUSTOM' ? Number(custom) : days
  const valid = Number.isInteger(n) && n >= 1 && n <= 3650
  const give = useAdminAction(u.id, () => api.adminGiveGift(u.id, { tier, days: n, reason: reason.trim() || undefined }), t('given'))
  const revoke = useAdminAction(u.id, () => api.adminRevokeGift(u.id), t('revoked'))
  const sub = c.subscription
  const status = sub ? (SUB_STATUS.includes(sub.status as (typeof SUB_STATUS)[number]) ? t(`status.${sub.status}`) : sub.status) : t('status.NONE')
  return (
    <div className="card flex flex-col gap-2">
      <b>{t('title')}</b>
      <div className="kv">
        <span>{t('plan')}</span>
        <b>{PLAN[c.plan]}</b>
      </div>
      <div className="kv">
        <span>{t('subscription')}</span>
        <span className="text-right">
          {status}
          {sub?.stripe && ' · Stripe'}
          {sub?.interval && ` · ${sub.interval === 'YEAR' ? t('yearly') : t('monthly')}`}
        </span>
      </div>
      <div className="kv">
        <span>{sub?.stripe || sub?.status === 'ACTIVE' ? t('nextCharge') : t('until')}</span>
        <span>{date(sub?.until ?? null, false)}</span>
      </div>
      {sub?.stripe && <div className="banner banner-info">{t('stripeNote')}</div>}
      {c.isTeam && <p className="t-cap m-0">{t('teamNote')}</p>}
      <form
        className="flex flex-col gap-2 border-t pt-3"
        style={{ borderColor: 'var(--line)' }}
        onSubmit={e => {
          e.preventDefault()
          if (!valid || give.isPending) return
          const what = sub?.stripe ? dur(n) : `${dur(n)} ${t('of')} ${PLAN[tier]}`
          if (confirm(t(sub?.stripe ? 'confirmStripe' : 'confirm', { what, email: u.email, n }))) give.mutate(undefined)
        }}
      >
        <b className="text-[15px]">{t('give')}</b>
        <Seg
          label={t('tier')}
          value={tier}
          onChange={setTier}
          options={[
            { value: 'PLUS', label: 'Plus' },
            { value: 'PREMIUM', label: 'Max' },
          ]}
        />
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('duration')}>
          {[...DURATIONS, 'CUSTOM' as const].map(d => (
            <button key={d} type="button" role="radio" aria-checked={days === d} className="chip min-h-11 px-3" onClick={() => setDays(d)} style={days === d ? { boxShadow: 'inset 0 0 0 2px var(--brand)', color: 'var(--brand-ink)' } : { background: 'var(--fill)' }}>
              {d === 'CUSTOM' ? t('custom') : dur(d)}
            </button>
          ))}
        </div>
        {days === 'CUSTOM' && <input className="input h-11" type="number" inputMode="numeric" min={1} max={3650} value={custom} onChange={e => setCustom(e.target.value)} placeholder={t('customPlaceholder')} aria-label={t('customPlaceholder')} aria-invalid={!!custom && !valid} />}
        <input className="input h-11" value={reason} onChange={e => setReason(e.target.value)} maxLength={200} placeholder={t('reason')} aria-label={t('reason')} />
        <button className="btn btn-primary" disabled={disabled || !valid || give.isPending}>
          <Icon name="gift" size={18} /> {give.isPending ? t('giving') : t('giveButton')}
        </button>
      </form>
      {c.giftRunning && (
        <button
          className="btn btn-secondary"
          style={{ color: 'var(--down)' }}
          disabled={disabled || revoke.isPending}
          onClick={() => {
            if (confirm(t('confirmRevoke', { email: u.email }))) revoke.mutate(undefined)
          }}
        >
          {t('revoke')}
        </button>
      )}
      {c.gifts.length > 0 && (
        <div className="flex flex-col border-t pt-2" style={{ borderColor: 'var(--line)' }}>
          <span className="t-cap mb-1">{t('history')}</span>
          {c.gifts.map(g => (
            <div key={g.id} className="t-foot flex flex-wrap justify-between gap-x-2 py-1">
              <span>
                {dur(g.days)} {PLAN[g.tier]}
                {g.status === 'CANCELED' && ` · ${t('canceled')}`}
                {g.reason && <span className="t-cap"> · {g.reason}</span>}
              </span>
              <span className="t-cap">
                {date(g.at)} · {g.by ?? '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Commands({ u, disabled }: { u: AdminUserDetail; disabled: boolean }) {
  const t = useTranslations('admin2.user')
  const date = useDate()
  const c = u.admin2
  const [gems, setGems] = useState('100')
  const [streak, setStreak] = useState(String(u.game?.bestStreak || 1))
  const [reason, setReason] = useState('')
  const lives = useAdminAction(u.id, () => api.adminRefillLives(u.id), t('livesDone'))
  const giveGems = useAdminAction(u.id, (n: number) => api.adminGiveGems(u.id, n), t('gemsDone'))
  const setStreakM = useAdminAction(u.id, (n: number) => api.adminRestoreStreak(u.id, n), t('streakDone'))
  const block = useAdminAction(u.id, (b: boolean) => api.adminSetBlocked(u.id, b, b ? reason.trim() : undefined), c.blockedAt ? t('unblocked') : t('blockedDone'))
  const welcome = useAdminAction(u.id, () => api.adminResendWelcome(u.id), t('welcomeDone'))
  const gemsN = Number(gems)
  const streakN = Number(streak)
  const okGems = Number.isInteger(gemsN) && gemsN >= 1 && gemsN <= 10_000
  const okStreak = Number.isInteger(streakN) && streakN >= 0 && streakN <= 3650
  const ask = (msg: string, go: () => void) => {
    if (confirm(msg)) go()
  }
  const row = 'flex flex-wrap items-center gap-2 border-t py-2.5 first:border-t-0'
  const line = { borderColor: 'var(--line)' }
  return (
    <div className="card flex flex-col">
      <b className="mb-1">{t('title')}</b>
      <div className={row} style={line}>
        <span className="min-w-0 flex-1">
          {t('lives')} <span className="t-cap">· {t('now', { n: u.game?.lives ?? '—' })}</span>
        </span>
        <button className="btn btn-secondary btn-sm" disabled={disabled || lives.isPending} onClick={() => ask(t('confirmLives', { email: u.email }), () => lives.mutate(undefined))}>
          {t('refill')}
        </button>
      </div>
      <div className={row} style={line}>
        <span className="min-w-0 flex-1">
          {t('gems')} <span className="t-cap">· {t('now', { n: u.game?.gems ?? '—' })}</span>
        </span>
        <input className="input h-10 w-24" type="number" inputMode="numeric" min={1} max={10000} value={gems} onChange={e => setGems(e.target.value)} aria-label={t('gemsAmount')} aria-invalid={!okGems} />
        <button className="btn btn-secondary btn-sm" disabled={disabled || !okGems || giveGems.isPending} onClick={() => ask(t('confirmGems', { n: gemsN, email: u.email }), () => giveGems.mutate(gemsN))}>
          {t('give')}
        </button>
      </div>
      <div className={row} style={line}>
        <span className="min-w-0 flex-1">
          {t('streak')} <span className="t-cap">· {t('streakNow', { n: u.game?.streak ?? 0, best: u.game?.bestStreak ?? 0 })}</span>
        </span>
        <input className="input h-10 w-24" type="number" inputMode="numeric" min={0} max={3650} value={streak} onChange={e => setStreak(e.target.value)} aria-label={t('streakDays')} aria-invalid={!okStreak} />
        <button className="btn btn-secondary btn-sm" disabled={disabled || !okStreak || setStreakM.isPending} onClick={() => ask(t('confirmStreak', { n: streakN, email: u.email }), () => setStreakM.mutate(streakN))}>
          {t('setStreak')}
        </button>
      </div>
      <div className={row} style={line}>
        <span className="min-w-0 flex-1">{t('welcome')}</span>
        <button className="btn btn-secondary btn-sm" disabled={disabled || welcome.isPending} onClick={() => ask(t('confirmWelcome', { email: u.email }), () => welcome.mutate(undefined))}>
          {t('resend')}
        </button>
      </div>
      <div className={`${row} flex-col items-stretch`} style={line}>
        {c.blockedAt ? (
          <>
            <span>
              <b style={{ color: 'var(--down)' }}>{t('isBlocked')}</b> <span className="t-cap">· {date(c.blockedAt)}</span>
            </span>
            {c.blockReason && <span className="t-foot">{t('reasonWas', { reason: c.blockReason })}</span>}
            <button className="btn btn-secondary btn-sm self-start" disabled={disabled || block.isPending} onClick={() => ask(t('confirmUnblock', { email: u.email }), () => block.mutate(false))}>
              {t('unblock')}
            </button>
          </>
        ) : c.isTeam ? (
          <span className="t-cap">{t('teamNoBlock')}</span>
        ) : (
          <>
            <span>{t('block')}</span>
            <div className="flex flex-wrap gap-2">
              <input className="input h-10 min-w-[160px] flex-1" value={reason} onChange={e => setReason(e.target.value)} maxLength={300} placeholder={t('blockReason')} aria-label={t('blockReason')} />
              <button className="btn btn-danger btn-sm" disabled={disabled || reason.trim().length < 3 || block.isPending} onClick={() => ask(t('confirmBlock', { email: u.email }), () => block.mutate(true))}>
                {t('blockButton')}
              </button>
            </div>
            <span className="t-cap">{t('blockNote')}</span>
          </>
        )}
      </div>
    </div>
  )
}
