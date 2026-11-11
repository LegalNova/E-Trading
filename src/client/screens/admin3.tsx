'use client'
// Admin: repartir (dinero virtual, XP, gemas, vidas, protectores, racha), mensajes del equipo
// (a una persona o a varias, con plantillas) y la tarjeta «De un vistazo» del panel.
// Todo pide confirmación, queda en la auditoría y está desactivado mientras se «ve como» a alguien.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { num } from '@/shared/format'
import { HAS_HTML, HAS_LINK, personalize, TEAM_HEADER, TEAM_TEMPLATES, TEMPLATE_TEXT, TEXT_MAX, TITLE_MAX, type TeamLang, type TeamTemplate } from '@/shared/team-messages'
import { api, ApiFailure, type AdminUserDetail, type GrantKind, type TeamAudience, type TeamAudienceKind } from '../api'
import { useLang, useSession } from '../hooks'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { PageSkeleton, Seg } from '../ui/kit'

const errText = (e: unknown, fallback: string) => (e instanceof ApiFailure ? e.message : fallback)
const langOf = (l: string | null | undefined): TeamLang => (l === 'ca' || l === 'en' ? l : 'es')
const selected = { boxShadow: 'inset 0 0 0 2px var(--brand)', color: 'var(--brand-ink)' }
const unselected = { background: 'var(--fill)' }
const line = { borderColor: 'var(--line)' }

function useInvalidate(id?: string) {
  const qc = useQueryClient()
  return () => {
    if (id) void qc.invalidateQueries({ queryKey: ['admin-user', id] })
    void qc.invalidateQueries({ queryKey: ['admin-messages'] })
    void qc.invalidateQueries({ queryKey: ['admin-audit'] })
    void qc.invalidateQueries({ queryKey: ['admin-users'] })
    void qc.invalidateQueries({ queryKey: ['admin-glance'] })
  }
}

const useDate = () => {
  const locale = useLang()
  return (s: string | null, time = true) => (s ? new Date(s).toLocaleString(locale, { day: 'numeric', month: 'short', ...(time ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }) }) : '—')
}

// ── De un vistazo (tarjeta principal del panel) ──────────
export function Glance({ onOpenUser, onOpenReports, onOpenMessages }: { onOpenUser: (id: string) => void; onOpenReports: () => void; onOpenMessages: () => void }) {
  const t = useTranslations('admin3.glance')
  const locale = useLang()
  const date = useDate()
  const { data: g, error } = useQuery({ queryKey: ['admin-glance'], queryFn: api.adminGlance, staleTime: 30_000 })
  if (error) return <p className="err">{errText(error, t('failed'))}</p>
  if (!g) return <div className="skel" style={{ height: 180 }} aria-hidden="true" />
  const n = (v: number) => num(v, locale, 0)
  const tiles: { label: string; value: string; hint?: string; color?: string; onClick?: () => void }[] = [
    { label: t('users'), value: n(g.users), hint: g.guests ? t('guests', { n: g.guests }) : undefined },
    { label: t('new'), value: n(g.new24h), hint: t('new7d', { n: g.new7d }) },
    { label: t('active'), value: n(g.activeToday), hint: t('active7d', { n: g.active7d }) },
    { label: t('plans'), value: n(g.plus + g.max), hint: t('plansHint', { plus: g.plus, max: g.max, stripe: g.stripe }) },
    { label: t('reports'), value: n(g.openReports), color: g.openReports ? 'var(--amber, #f5a623)' : undefined, onClick: onOpenReports },
    { label: t('messages'), value: n(g.messages.sent7d), hint: g.messages.sent7d ? t('messagesRead', { n: g.messages.read7d }) : t('messagesNone'), onClick: onOpenMessages },
  ]
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <b>{t('title')}</b>
        {g.blocked > 0 && <span className="t-cap">{t('blocked', { n: g.blocked })}</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(x => {
          const body = (
            <>
              <span className="t-cap">{x.label}</span>
              <b className="text-[24px] leading-tight tabular-nums" style={x.color ? { color: x.color } : undefined}>
                {x.value}
              </b>
              {x.hint && <span className="t-cap">{x.hint}</span>}
            </>
          )
          return x.onClick ? (
            <button key={x.label} className="flex min-h-11 flex-col rounded-xl px-3 py-2 text-left" style={unselected} onClick={x.onClick}>
              {body}
            </button>
          ) : (
            <div key={x.label} className="flex flex-col rounded-xl px-3 py-2" style={unselected}>
              {body}
            </div>
          )
        })}
      </div>
      <div className="flex flex-col border-t pt-2" style={line}>
        <span className="t-cap mb-1">{t('recent')}</span>
        {g.recent.length ? (
          g.recent.map(r => (
            <div key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1">
              <button className="link min-w-0 flex-1 truncate px-0 text-left" onClick={() => onOpenUser(r.id)}>
                <b>{r.name}</b> <span className="t-cap">· {r.email}</span>
              </button>
              <span className="t-cap">
                {date(r.createdAt)}
                {!r.onboarded && ` · ${t('onboarding')}`}
              </span>
              {r.messaged ? (
                <span className="chip" style={unselected}>
                  <Icon name="check" size={14} /> {t('welcomed')}
                </span>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => onOpenUser(r.id)}>
                  {t('welcome')}
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="t-cap">{t('noRecent')}</span>
        )}
      </div>
    </div>
  )
}

// ── Repartir ─────────────────────────────────────────────
const GRANTS: GrantKind[] = ['CASH', 'XP', 'GEMS', 'LIVES', 'FREEZES', 'STREAK']
const QUICK: Partial<Record<GrantKind, number[]>> = { CASH: [1000, 5000, 10000], XP: [50, 100, 500], GEMS: [50, 100, 500], FREEZES: [1, 2] }
const LIMITS: Record<GrantKind, [number, number]> = { CASH: [0.01, 1_000_000], XP: [1, 100_000], GEMS: [1, 10_000], LIVES: [0, 0], FREEZES: [1, 10], STREAK: [0, 3650] }

export function Grants({ u, disabled }: { u: AdminUserDetail; disabled: boolean }) {
  const t = useTranslations('admin3.grant')
  const locale = useLang()
  const toast = useToast()
  const invalidate = useInvalidate(u.id)
  const [kind, setKind] = useState<GrantKind>('CASH')
  const [sign, setSign] = useState<'+' | '-'>('+')
  const [amount, setAmount] = useState('5000')
  const [league, setLeague] = useState(false)
  const [reason, setReason] = useState('')
  const [notify, setNotify] = useState(true)
  const [text, setText] = useState('')
  const g = u.game
  const value = Number(amount.replace(',', '.'))
  const [min, max] = LIMITS[kind]
  const okAmount = kind === 'LIVES' || (Number.isFinite(value) && value >= min && value <= max && (kind === 'CASH' || Number.isInteger(value)))
  const signed = kind === 'CASH' && sign === '-' ? -value : value
  const euro = (v: number) => (locale === 'en' ? `€${num(v, locale, 2)}` : `${num(v, locale, 2)} €`)
  const now: Record<GrantKind, string> = {
    CASH: u.market.cash === null ? t('noPortfolio') : euro(u.market.cash),
    XP: g ? `${num(g.xp, locale, 0)} XP · ${t('level', { n: g.level })}` : '—',
    GEMS: g ? num(g.gems, locale, 0) : '—',
    LIVES: g ? `${g.lives} / 5` : '—',
    FREEZES: g?.freezes !== undefined ? String(g.freezes) : '—',
    STREAK: g ? t('streakNow', { n: g.streak, best: g.bestStreak }) : '—',
  }
  const what = kind === 'CASH' ? euro(Math.abs(signed)) : kind === 'LIVES' ? '' : num(value, locale, 0)
  const textOk = !text.trim() || (!HAS_LINK.test(text) && !HAS_HTML.test(text))
  const go = useMutation({
    mutationFn: () => api.adminGrant(u.id, { kind, amount: kind === 'LIVES' ? undefined : signed, league: kind === 'XP' ? league : undefined, reason: reason.trim() || undefined, notify, text: notify && text.trim() ? text.trim() : undefined }),
    onSuccess: () => {
      toast(notify ? t('doneNotified') : t('done'))
      setReason('')
      setText('')
      invalidate()
    },
    onError: e => toast(errText(e, t('failed'))),
  })
  const pick = (k: GrantKind) => {
    setKind(k)
    setSign('+')
    setLeague(false)
    setNotify(true)
    setAmount(k === 'CASH' ? '5000' : k === 'XP' || k === 'GEMS' ? '100' : k === 'FREEZES' ? '1' : k === 'STREAK' ? String(g?.bestStreak || 1) : '')
  }
  return (
    <div className="card flex flex-col gap-2.5">
      <div>
        <b>{t('title')}</b>
        <p className="t-cap m-0">{t('lead')}</p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('what')}>
        {GRANTS.map(k => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} className="chip min-h-11 px-3" onClick={() => pick(k)} style={kind === k ? selected : unselected}>
            {t(`kinds.${k}`)}
          </button>
        ))}
      </div>
      <div className="kv">
        <span>{t('now')}</span>
        <b className="text-right">{now[kind]}</b>
      </div>
      {kind === 'CASH' && (
        <Seg
          label={t('direction')}
          value={sign}
          onChange={v => (setSign(v), setNotify(v === '+'))}
          options={[
            { value: '+', label: t('give') },
            { value: '-', label: t('take') },
          ]}
        />
      )}
      {kind !== 'LIVES' && (
        <div className="flex flex-col gap-1.5">
          <label className="t-foot" htmlFor={`grant-${u.id}`}>
            {t(`amount.${kind}`)}
          </label>
          <input id={`grant-${u.id}`} className="input h-11" type="number" inputMode="decimal" min={min} max={max} step={kind === 'CASH' ? '0.01' : '1'} value={amount} onChange={e => setAmount(e.target.value)} aria-invalid={!okAmount} />
          {QUICK[kind] && (
            <div className="flex flex-wrap gap-1.5">
              {QUICK[kind]!.map(q => (
                <button key={q} type="button" className="chip min-h-11 px-3" style={Number(amount) === q ? selected : unselected} onClick={() => setAmount(String(q))}>
                  {kind === 'CASH' ? euro(q) : num(q, locale, 0)}
                </button>
              ))}
            </div>
          )}
          <span className="t-cap">{t(`limit.${kind}`)}</span>
        </div>
      )}
      {kind === 'CASH' && <p className="t-cap m-0">{t('cashNote')}</p>}
      {kind === 'XP' && (
        <>
          <label className="t-foot flex min-h-11 items-center gap-2">
            <input type="checkbox" className="h-5 w-5" checked={league} onChange={e => setLeague(e.target.checked)} /> {t('league')}
          </label>
          <div className={`banner ${league ? '' : 'banner-info'}`}>{league ? t('leagueOn') : t('leagueOff')}</div>
        </>
      )}
      {kind === 'STREAK' && <p className="t-cap m-0">{t('streakNote')}</p>}
      <input className="input h-11" value={reason} onChange={e => setReason(e.target.value)} maxLength={200} placeholder={t('reason')} aria-label={t('reason')} />
      <label className="t-foot flex min-h-11 items-center gap-2">
        <input type="checkbox" className="h-5 w-5" checked={notify} onChange={e => setNotify(e.target.checked)} /> {t('notify')}
      </label>
      {notify && (
        <div className="flex flex-col gap-1">
          <textarea className="input min-h-[84px] py-2" value={text} onChange={e => setText(e.target.value)} maxLength={TEXT_MAX} placeholder={t('notifyPlaceholder')} aria-label={t('notifyText')} aria-invalid={!textOk} />
          <span className="t-cap">{textOk ? t('notifyHint', { example: t(`notice.${kind === 'CASH' && sign === '-' ? 'CASH_NEG' : kind}`, { n: what }) }) : t('noLinks')}</span>
        </div>
      )}
      <button
        className="btn btn-primary"
        disabled={disabled || !okAmount || !textOk || go.isPending}
        onClick={() => {
          const msg = t(`confirm.${kind === 'CASH' && sign === '-' ? 'CASH_NEG' : kind}`, { n: what, email: u.email }) + (kind === 'XP' && league ? `\n\n${t('confirmLeague')}` : '') + (notify ? `\n\n${t('confirmNotify')}` : '')
          if (confirm(msg)) go.mutate()
        }}
      >
        <Icon name="gift" size={18} /> {go.isPending ? t('working') : t(`button.${kind === 'CASH' && sign === '-' ? 'CASH_NEG' : kind}`)}
      </button>
    </div>
  )
}

// ── Escribir un mensaje (plantillas con su nombre) ───────
function Composer({ lang, name, disabled, pending, sendLabel, onSend, extra }: { lang: TeamLang; name: string | null; disabled: boolean; pending: boolean; sendLabel: string; onSend: (m: { title?: string; text: string }, reset: () => void) => void; extra?: React.ReactNode }) {
  const t = useTranslations('admin3.compose')
  const [tpl, setTpl] = useState<TeamTemplate | 'BLANK' | null>(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const use = (k: TeamTemplate | 'BLANK') => {
    if ((title || text) && tpl !== k && !confirm(t('replace'))) return
    setTpl(k)
    setTitle(k === 'BLANK' ? '' : TEMPLATE_TEXT[lang][k].title)
    setText(k === 'BLANK' ? '' : TEMPLATE_TEXT[lang][k].text)
  }
  const reset = () => (setTpl(null), setTitle(''), setText(''))
  const clean = text.trim()
  const bad = HAS_LINK.test(text) || HAS_LINK.test(title) ? t('noLinks') : HAS_HTML.test(text) || HAS_HTML.test(title) ? t('noHtml') : null
  const ok = clean.length >= 2 && !bad
  const previewTitle = title.trim() ? personalize(title.trim(), name) : null
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('templates')}>
        {[...TEAM_TEMPLATES, 'BLANK' as const].map(k => (
          <button key={k} type="button" role="radio" aria-checked={tpl === k} className="chip min-h-11 px-3" style={tpl === k ? selected : unselected} onClick={() => use(k)}>
            {t(`tpl.${k}`)}
          </button>
        ))}
      </div>
      <span className="t-cap">{t('tplNote', { lang: t(`lang.${lang}`) })}</span>
      <input className="input h-11" value={title} onChange={e => setTitle(e.target.value)} maxLength={TITLE_MAX} placeholder={t('title')} aria-label={t('title')} />
      <textarea className="input min-h-[120px] py-2" value={text} onChange={e => setText(e.target.value)} maxLength={TEXT_MAX} placeholder={t('text')} aria-label={t('text')} aria-invalid={!!bad} />
      <div className="flex flex-wrap justify-between gap-2">
        <span className="t-cap">{bad ?? t('nameHint')}</span>
        <span className="t-cap tabular-nums">
          {text.length} / {TEXT_MAX}
        </span>
      </div>
      {clean && (
        <div className="rounded-xl p-3" style={{ background: 'var(--fill)' }} aria-label={t('preview')}>
          <span className="t-cap block" style={{ color: 'var(--brand-ink)' }}>
            {t('preview')} · {TEAM_HEADER[lang]}
          </span>
          {previewTitle && <b className="block break-words">{previewTitle}</b>}
          <p className="t-foot m-0 break-words whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>
            {personalize(clean, name)}
          </p>
        </div>
      )}
      {extra}
      <button className="btn btn-primary" disabled={disabled || !ok || pending} onClick={() => onSend({ title: title.trim() || undefined, text: clean }, reset)}>
        <Icon name="chat" size={18} /> {pending ? t('sending') : sendLabel}
      </button>
    </div>
  )
}

export function TeamMessageCard({ u, disabled }: { u: AdminUserDetail; disabled: boolean }) {
  const t = useTranslations('admin3.user')
  const date = useDate()
  const toast = useToast()
  const invalidate = useInvalidate(u.id)
  const lang = langOf(u.locale)
  const name = u.guest || u.name === '—' ? null : u.name
  const send = useMutation({
    mutationFn: (m: { title?: string; text: string }) => api.adminSendMessage(u.id, m),
    onSuccess: () => (toast(t('sent')), invalidate()),
    onError: e => toast(errText(e, t('failed'))),
  })
  const list = u.admin2.messages ?? []
  return (
    <div id="mensaje" className="card flex scroll-mt-4 flex-col gap-2.5">
      <div>
        <b>{t('title')}</b>
        <p className="t-cap m-0">{t('lead', { devices: u.admin2.pushDevices ?? 0 })}</p>
      </div>
      {u.blocked ? (
        <p className="t-cap m-0">{t('blocked')}</p>
      ) : (
        <Composer
          lang={lang}
          name={name}
          disabled={disabled}
          pending={send.isPending}
          sendLabel={t('send')}
          onSend={(m, reset) => {
            if (confirm(t('confirm', { email: u.email }))) send.mutate(m, { onSuccess: reset })
          }}
        />
      )}
      {list.length > 0 && (
        <div className="flex flex-col border-t pt-2" style={line}>
          <span className="t-cap mb-1">{t('history')}</span>
          {list.map(m => (
            <details key={m.id} className="border-t py-1.5 first:border-t-0" style={line}>
              <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="min-w-0 flex-1 truncate">{m.title}</span>
                <span className="chip" style={m.readAt ? { background: 'color-mix(in srgb, var(--up) 15%, transparent)', color: 'var(--ink)' } : unselected}>
                  {m.readAt ? t('read', { date: date(m.readAt) }) : t('unread')}
                </span>
                <span className="t-cap w-full">
                  {date(m.at)}
                  {m.batch && ` · ${t('batch')}`}
                </span>
              </summary>
              <p className="t-foot m-0 pt-1 break-words whitespace-pre-wrap">{m.text}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Pestaña «Mensajes»: envío a varios e historial ───────
export function MessagesTab({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  const t = useTranslations('admin3.messages')
  const locale = useLang()
  const date = useDate()
  const toast = useToast()
  const invalidate = useInvalidate()
  const viewing = !!useSession().data?.viewAs
  const [kind, setKind] = useState<TeamAudienceKind>('NEW')
  const [days, setDays] = useState('7')
  const [lang, setLang] = useState<'' | TeamLang>('')
  const d = Number(days)
  const okDays = kind === 'ALL' || (Number.isInteger(d) && d >= 1 && d <= 365)
  const audience: TeamAudience = { kind, ...(kind === 'ALL' ? {} : { days: d }), ...(lang ? { lang } : {}) }
  const preview = useQuery({ queryKey: ['admin-audience', kind, kind === 'ALL' ? 0 : d, lang], queryFn: () => api.adminAudience(audience), enabled: okDays })
  const history = useQuery({ queryKey: ['admin-messages'], queryFn: api.adminMessages })
  const send = useMutation({
    mutationFn: (m: { title?: string; text: string; expected: number }) => api.adminBroadcast(audience, m),
    onSuccess: r => (toast(t('sent', { n: r.count })), invalidate(), void preview.refetch()),
    onError: e => (toast(errText(e, t('failed'))), void preview.refetch()),
  })
  const count = preview.data?.count ?? null
  const tplLang: TeamLang = lang || langOf(locale)
  const audienceText = (a: { kind: TeamAudienceKind; days: number | null; lang: string | null } | null) => (a ? `${t(`aud.${a.kind}`, { n: a.days ?? 0 })}${a.lang ? ` · ${t(`langs.${a.lang}`)}` : ''}` : '')
  return (
    <div className="flex flex-col gap-3">
      <h2 className="t-title m-0">{t('title')}</h2>
      <p className="t-foot m-0">{t('what')}</p>
      {viewing && <div className="banner">{t('viewOnly')}</div>}
      <div className="card flex flex-col gap-2.5">
        <b>{t('toMany')}</b>
        <Seg
          label={t('who')}
          value={kind}
          onChange={setKind}
          options={[
            { value: 'NEW', label: t('kind.NEW') },
            { value: 'INACTIVE', label: t('kind.INACTIVE') },
            { value: 'ALL', label: t('kind.ALL') },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          {kind !== 'ALL' && (
            <label className="t-foot flex items-center gap-2">
              {t(kind === 'NEW' ? 'daysNew' : 'daysInactive')}
              <input className="input h-11 w-24" type="number" inputMode="numeric" min={1} max={365} value={days} onChange={e => setDays(e.target.value)} aria-invalid={!okDays} />
              {t('days')}
            </label>
          )}
          <select className="input h-11 w-auto min-w-[160px]" value={lang} onChange={e => setLang(e.target.value as '' | TeamLang)} aria-label={t('lang')}>
            <option value="">{t('langs.all')}</option>
            <option value="es">{t('langs.es')}</option>
            <option value="ca">{t('langs.ca')}</option>
            <option value="en">{t('langs.en')}</option>
          </select>
        </div>
        <div className="rounded-xl px-3 py-2" style={unselected} aria-live="polite">
          {!okDays ? (
            <span className="t-foot">{t('badDays')}</span>
          ) : preview.isLoading ? (
            <span className="t-foot">{t('counting')}</span>
          ) : preview.error ? (
            <span className="t-foot">{errText(preview.error, t('failed'))}</span>
          ) : (
            <>
              <b className="tabular-nums">{t('count', { n: count ?? 0 })}</b>
              <span className="t-cap block">{t('countHint', { push: preview.data?.withPush ?? 0 })}</span>
              {!!preview.data?.sample.length && <span className="t-cap block truncate">{t('sample', { names: preview.data.sample.join(', ') })}</span>}
            </>
          )}
        </div>
        <Composer
          lang={tplLang}
          name={null}
          disabled={viewing || !okDays || !count}
          pending={send.isPending}
          sendLabel={count ? t('send', { n: count }) : t('sendNone')}
          onSend={(m, reset) => {
            if (!count) return
            // Doble confirmación: cuántas personas son y, después, que no se puede deshacer
            if (!confirm(t('confirm1', { n: count, who: audienceText({ kind, days: kind === 'ALL' ? null : d, lang: lang || null }) }))) return
            if (!confirm(t('confirm2', { n: count }))) return
            send.mutate({ ...m, expected: count }, { onSuccess: reset })
          }}
        />
        <span className="t-cap">{t('limits')}</span>
      </div>
      <div className="card flex flex-col">
        <b className="mb-1">{t('history')}</b>
        {history.error ? (
          <p className="err">{errText(history.error, t('failed'))}</p>
        ) : !history.data ? (
          <PageSkeleton />
        ) : history.data.length ? (
          history.data.map(h => (
            <details key={h.id} className="border-t py-2 first:border-t-0" style={line}>
              <summary className="flex min-h-11 cursor-pointer list-none flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2">
                  <b className="min-w-0 flex-1 truncate">{h.title ?? t('noTitle')}</b>
                  <span className="chip" style={h.read ? { background: 'color-mix(in srgb, var(--up) 15%, transparent)', color: 'var(--ink)' } : unselected}>
                    {h.kind === 'MANY' ? t('readOf', { read: h.read, n: h.count }) : h.read ? t('read') : t('unread')}
                  </span>
                </span>
                <span className="t-cap">
                  {date(h.at)} · {h.kind === 'MANY' ? `${t('many', { n: h.count })} · ${audienceText(h.audience)}` : h.user ? h.user.name : t('deleted')}
                  {h.via && ` · ${t('viaGrant')}`} · {h.by}
                </span>
              </summary>
              <p className="t-foot m-0 pt-1 break-words whitespace-pre-wrap">{h.text}</p>
              {h.user && (
                <button className="link px-0 text-sm" onClick={() => onOpenUser(h.user!.id)}>
                  {t('openUser', { email: h.user.email })}
                </button>
              )}
            </details>
          ))
        ) : (
          <span className="t-cap">{t('empty')}</span>
        )}
      </div>
    </div>
  )
}
