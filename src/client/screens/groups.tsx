'use client'
// Planes de grupo: /grupo (crear y pagar, o ver y gestionar el grupo), /grupo/unirse/<código> y la unión pendiente
// de quien llega con el enlace sin cuenta (como las ligas de amigos: se une al terminar la bienvenida).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { GroupViewT } from '@/shared/contract'
import { cleanName, isValidName, NAME_MAX, normalizeCode } from '@/shared/friend-leagues'
import { money } from '@/shared/format'
import { GROUP_SIZES, type BillingInterval, type GroupSize, type PaidTier } from '@/shared/plans'
import { api, ApiFailure } from '../api'
import { useLang, useRefreshAll, useSession } from '../hooks'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, Seg, Sheet, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'
import { TestCardNote } from '../upgrade'

const PLAN = { PLUS: 'Plus', PREMIUM: 'Max' } as const

// ── Código pendiente (llegó con el enlace sin cuenta) ───
// Solo su código de grupo, solo porque lo ha pedido; se borra al usarlo
const PENDING_KEY = 'lumi:grupo'
let pending: string | null = null
function rememberGroup(code: string) {
  pending = code
  try {
    sessionStorage.setItem(PENDING_KEY, code)
  } catch {
    // sin almacenamiento: vale mientras no recargue la página
  }
}
function pendingGroup() {
  if (pending) return pending
  try {
    return sessionStorage.getItem(PENDING_KEY)
  } catch {
    return null
  }
}
function forgetGroup() {
  pending = null
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // nada que borrar
  }
}

type TJ = ReturnType<typeof useTranslations<'billing.join'>>
function joinError(t: TJ, e: unknown) {
  if (e instanceof ApiFailure) return t.has(`errors.${e.code}`) ? t(`errors.${e.code}`) : e.message
  return t('errors.INTERNAL')
}
type TG = ReturnType<typeof useTranslations<'billing.group'>>
function groupError(t: TG, e: unknown) {
  if (e instanceof ApiFailure) return t.has(`errors.${e.code}`) ? t(`errors.${e.code}`) : e.message
  return t('errors.INTERNAL')
}

/** Si llegó con el enlace de un grupo y ya tiene la cuenta lista, entra en él (una vez) y abre /grupo */
export function PendingGroupJoin() {
  const t = useTranslations('billing.join')
  const { data: session } = useSession()
  const refresh = useRefreshAll()
  const router = useRouter()
  const toast = useToast()
  const tried = useRef(false)
  const ready = !!session?.signedIn && session.onboardingStep === null && !session.viewAs && !session.isGuest
  const { mutate } = useMutation({
    mutationFn: api.joinGroup,
    onSuccess: r => {
      refresh()
      toast(r.mode === 'OWN' ? t('joinedOwn', { name: r.name }) : t('joined', { name: r.name }))
      router.push('/grupo')
    },
    onError: e => toast(joinError(t, e)),
    onSettled: forgetGroup,
  })
  useEffect(() => {
    if (!ready || tried.current) return
    const code = pendingGroup()
    if (!code) return
    tried.current = true
    mutate(code)
  }, [ready, mutate])
  return null
}

// ── /grupo ───────────────────────────────────────────────
export function GroupScreen() {
  // useSearchParams necesita su <Suspense>
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GroupRouter />
    </Suspense>
  )
}

function GroupRouter() {
  const q = useSearchParams()
  if (q.get('pago') === 'ok' && q.get('sid')) return <GroupPaid sid={q.get('sid')!} />
  return <GroupHome canceled={q.get('pago') === 'no'} />
}

/** Vuelta de Stripe: se confirma el pago y, si está, el grupo ya está activo */
function GroupPaid({ sid }: { sid: string }) {
  const t = useTranslations('billing.group')
  const refresh = useRefreshAll()
  const router = useRouter()
  const [tries, setTries] = useState(0)
  const [late, setLate] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setLate(true), 30_000)
    return () => clearTimeout(id)
  }, [tries])
  const q = useQuery({
    queryKey: ['group-confirm', sid, tries],
    queryFn: () => api.confirmGroup(sid),
    retry: 2,
    staleTime: Infinity,
    refetchInterval: s => (s.state.data && !s.state.data.done && !s.state.data.expired ? 2_000 : false),
  })
  const r = q.data
  useEffect(() => {
    if (!r?.done) return
    refresh()
  }, [r?.done, refresh])
  if (q.isError || (r && !r.done && (r.expired || late)))
    return (
      <div className="pad items-center pt-16 text-center">
        <Lumi mood="THINKING" size={72} />
        <p className="t-head m-0">{r?.expired ? t('payExpired') : t('payPending')}</p>
        <button className="btn btn-primary" onClick={() => (setLate(false), setTries(n => n + 1))}>
          {t('payRetry')}
        </button>
        <Link href="/grupo" className="btn btn-plain">
          {t('title')}
        </Link>
      </div>
    )
  if (!r?.done)
    return (
      <div className="pad items-center pt-24 text-center" aria-busy="true">
        <Lumi mood="THINKING" size={72} />
        <p className="t-head m-0">{t('confirming')}</p>
      </div>
    )
  return (
    <div className="pad min-h-[calc(100dvh-120px)] items-center pt-10 text-center">
      <div className="animate-pop">
        <Lumi mood="CELEBRATE" size={96} />
      </div>
      <h1 className="t-large">{t('paidTitle')}</h1>
      <p className="t-body muted m-0">{t('paidBody')}</p>
      <button className="btn btn-primary" onClick={() => router.replace('/grupo')}>
        {t('invite')}
      </button>
    </div>
  )
}

function GroupHome({ canceled }: { canceled: boolean }) {
  const t = useTranslations('billing.group')
  const { data, isError, refetch } = useQuery({ queryKey: ['group'], queryFn: api.myGroup })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return <PageSkeleton />
  const g = data.group
  return (
    <>
      <TopBar back="/perfil" title={t('title')} />
      {g && g.status !== 'PENDING' && g.status !== 'CANCELED' ? <GroupView data={data} /> : <CreateGroup data={data} canceled={canceled} />}
    </>
  )
}

// ── Crear y pagar ────────────────────────────────────────
function CreateGroup({ data, canceled }: { data: GroupViewT; canceled: boolean }) {
  const t = useTranslations('billing.group')
  const locale = useLang()
  const pendingG = data.group?.status === 'PENDING' ? data.group : null
  const [name, setName] = useState(pendingG?.name ?? '')
  const [tier, setTier] = useState<PaidTier>(pendingG?.tier ?? 'PREMIUM')
  const [size, setSize] = useState<GroupSize>(pendingG?.size ?? 4)
  const [interval, setInterval_] = useState<BillingInterval>(pendingG?.interval ?? 'MONTH')
  const pay = useMutation({
    mutationFn: () => api.createGroup({ name: cleanName(name), tier, size, interval }),
    // Con Stripe: a su página de pago. Sin Stripe (desarrollo): el grupo ya está activo
    onSuccess: r => (r.url ? window.location.assign(r.url) : window.location.reload()),
  })
  const priceOf = (s: GroupSize, iv: BillingInterval = interval) => data.prices.find(p => p.size === s && p.tier === tier && p.interval === iv)!
  const chosen = priceOf(size)
  const nameOk = isValidName(cleanName(name))
  const perMonth = interval === 'YEAR' ? chosen.price / 12 : chosen.price
  if (data.isGuest)
    return (
      <div className="pad items-center pt-8 text-center">
        <Lumi mood="THINKING" size={64} />
        <p className="t-body">{t('guest')}</p>
        <Link href="/guardar" className="btn btn-primary">
          {t('guestCta')}
        </Link>
      </div>
    )
  return (
    <form
      className="pad"
      onSubmit={e => {
        e.preventDefault()
        if (nameOk && !pay.isPending) pay.mutate()
      }}
    >
      <div className="hero flex flex-col items-start gap-2 p-6">
        <Icon name="league" size={28} />
        <h1 className="t-title m-0">{t('headline')}</h1>
        <span style={{ color: 'rgb(255 255 255 / 0.8)' }}>{t('intro')}</span>
      </div>
      {canceled && <div className="banner">{t('payCanceled')}</div>}
      {pendingG && !canceled && <div className="banner banner-info">{t('pendingBanner')}</div>}
      <div className="field">
        <label htmlFor="g-name">{t('name')}</label>
        <input id="g-name" className="input" value={name} maxLength={NAME_MAX + 10} placeholder={t('namePh')} onChange={e => setName(e.target.value)} aria-invalid={!!name && !nameOk} autoComplete="off" required />
      </div>
      <Seg label={t('plan')} value={tier} onChange={setTier} options={[{ value: 'PLUS', label: 'Plus' }, { value: 'PREMIUM', label: 'Max' }]} />
      <Seg label={t('billing')} value={interval} onChange={setInterval_} options={[{ value: 'MONTH', label: t('monthly') }, { value: 'YEAR', label: t('yearly') }]} />
      <div role="group" aria-label={t('size')} className="flex flex-col gap-2">
        {GROUP_SIZES.map(s => {
          const p = priceOf(s)
          return (
            <button key={s} type="button" aria-pressed={size === s} className="opt" onClick={() => setSize(s)}>
              <span className="min-w-0 flex-1">
                <b>{t(`sizes.${s}`)}</b>
                <br />
                <span className="t-foot">{t(`sizeHints.${s}`)}</span>
              </span>
              <span className="flex-none text-right">
                <b>{money(p.price, 'EUR', locale)}</b>
                <br />
                <span className="t-cap">{interval === 'YEAR' ? t('perYear', { price: '' }).trim() : t('perMonth', { price: '' }).trim()}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="card flex flex-col gap-1.5">
        <b className="text-[17px]">
          {PLAN[tier]} · {t(`sizes.${size}`)}
        </b>
        <span className="t-body">{interval === 'YEAR' ? t('perYear', { price: money(chosen.price, 'EUR', locale) }) : t('perMonth', { price: money(chosen.price, 'EUR', locale) })}</span>
        {data.student && chosen.regular !== chosen.price && (
          <span className="t-cap">
            <s>{money(chosen.regular, 'EUR', locale)}</s> · {t('studentNote')}
          </span>
        )}
        <span className="t-cap">{t('perPerson', { price: money(perMonth / chosen.seats, 'EUR', locale) })}</span>
        <span className="t-cap">{t('ownerSeat')}</span>
      </div>
      {data.ownPaid && <div className="banner banner-info">{t('ownPaidNote')}</div>}
      {pay.error && <p className="err m-0">{groupError(t, pay.error)}</p>}
      <TestCardNote />
      <button className="btn btn-primary" disabled={!nameOk || pay.isPending}>
        {pay.isPending ? t('opening') : t('pay', { price: money(chosen.price, 'EUR', locale) })}
      </button>
      <p className="t-cap m-0 text-center">{t('note')}</p>
      <p className="t-cap m-0 text-center">
        {t.rich('terms', {
          terms: c => (
            <Link href="/legal/contratacion" className="font-bold underline">
              {c}
            </Link>
          ),
        })}
      </p>
    </form>
  )
}

// ── El grupo por dentro ──────────────────────────────────
function GroupView({ data }: { data: GroupViewT }) {
  const t = useTranslations('billing.group')
  const locale = useLang()
  const toast = useToast()
  const qc = useQueryClient()
  const refresh = useRefreshAll()
  const g = data.group!
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ kind: 'remove'; key: string; name: string } | { kind: 'leave' } | null>(null)
  const done = () => (qc.invalidateQueries({ queryKey: ['group'] }), refresh())
  const rename = useMutation({ mutationFn: (n: string) => api.renameGroup(n), onSuccess: () => (setName(null), done(), toast(t('saved'))), onError: e => toast(groupError(t, e)) })
  const remove = useMutation({ mutationFn: (key: string) => api.removeGroupMember(key), onSuccess: () => (setConfirm(null), done(), toast(t('removed'))), onError: e => toast(groupError(t, e)) })
  const leave = useMutation({ mutationFn: api.leaveGroup, onSuccess: () => (setConfirm(null), done(), toast(t('left'))), onError: e => toast(groupError(t, e)) })
  const payment = useMutation({ mutationFn: api.groupPayment, onSuccess: r => (r.url ? window.location.assign(r.url) : done()), onError: e => toast(groupError(t, e)) })
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const price = money(g.price, 'EUR', locale)
  // Sin idioma: quien lo abre lo ve en el suyo
  const link = g.code ? `${location.origin}/grupo/unirse/${g.code}` : ''
  const full = g.size !== 0 && g.used >= g.seats
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // sin portapapeles: el enlace está a la vista
    }
  }
  const share = async () => {
    const text = t('shareText', { name: g.name, plan: PLAN[g.tier], link })
    if (navigator.share) {
      try {
        await navigator.share({ title: g.name, text })
        return
      } catch {
        // cancelado
      }
    } else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  const nameOk = name !== null && isValidName(cleanName(name)) && cleanName(name) !== g.name
  return (
    <div className="pad">
      <div className="hero flex flex-col items-start gap-2 p-6">
        <span className="chip" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
          {PLAN[g.tier]}
        </span>
        <h1 className="t-title m-0 break-words">{g.name}</h1>
        <span style={{ color: 'rgb(255 255 255 / 0.8)' }}>{g.size === 0 ? t('seatsUnlimited', { used: g.used }) : t('seats', { used: g.used, seats: g.seats })}</span>
        {g.size !== 0 && (
          <span className="block h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgb(255 255 255 / 0.2)' }} aria-hidden="true">
            <span className="block h-full rounded-full" style={{ width: `${Math.min(1, g.used / g.seats) * 100}%`, background: 'var(--brand)' }} />
          </span>
        )}
        <span className="t-foot" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
          {g.isOwner ? (g.renewsAt ? t('renews', { date: date(g.renewsAt), price }) : null) : t('paidBy', { name: g.ownerName })}
        </span>
      </div>

      {g.status === 'PAST_DUE' && <div className="banner">{g.isOwner ? t('pastDueOwner') : t('pastDueMember')}</div>}
      {!g.isOwner && g.myMode === 'OWN' && <div className="banner banner-info">{t('ownMode')}</div>}

      {g.isOwner && (
        <div className="card flex flex-col gap-2.5">
          <b>{t('invite')}</b>
          <span className="t-foot">{full ? t('full') : t('inviteBody')}</span>
          {!full && (
            <>
              <code className="block overflow-hidden rounded-xl px-3 py-2.5 text-[13px] text-ellipsis whitespace-nowrap" style={{ background: 'var(--fill)' }}>
                {link}
              </code>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-secondary btn-sm" onClick={copy}>
                  <Icon name={copied ? 'check' : 'download'} size={16} />
                  {copied ? t('copied') : t('copy')}
                </button>
                <button className="btn btn-primary btn-sm" onClick={share}>
                  {t('share')}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <b className="t-head mt-1 px-0.5">{t('members')}</b>
      <div className="list">
        {data.members.map(m => (
          <div key={m.key} className="li plainline min-h-[52px]">
            <span className="ava" aria-hidden="true">
              <Icon name="user" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate">{m.isMe ? `${m.name} (${t('you')})` : m.name}</b>
              {m.isOwner && <span className="t-cap">{t('ownerTag')}</span>}
            </span>
            {g.isOwner && !m.isOwner && (
              <button className="btn btn-plain btn-sm w-auto flex-none px-3" style={{ color: 'var(--down)' }} onClick={() => setConfirm({ kind: 'remove', key: m.key, name: m.name })} aria-label={`${t('remove')}: ${m.name}`}>
                {t('remove')}
              </button>
            )}
          </div>
        ))}
      </div>

      {g.leagueId && (
        <Link href={`/liga?liga=${g.leagueId}`} className="btn btn-secondary">
          <Icon name="league" size={18} />
          {t('league')}
        </Link>
      )}

      {g.isOwner ? (
        <>
          <div className="field">
            <label htmlFor="g-rename">{t('rename')}</label>
            <div className="flex gap-2">
              <input id="g-rename" className="input" value={name ?? g.name} maxLength={NAME_MAX + 10} onChange={e => setName(e.target.value)} autoComplete="off" />
              <button className="btn btn-secondary btn-sm w-auto flex-none px-4" disabled={!nameOk || rename.isPending} onClick={() => rename.mutate(cleanName(name!))}>
                {t('save')}
              </button>
            </div>
          </div>
          <div className="list">
            <button className="li plainline justify-between text-left" onClick={() => payment.mutate()} disabled={payment.isPending}>
              <span className="min-w-0 flex-1">
                <b>{data.payments ? t('manage') : t('endNow')}</b>
                <br />
                <span className="t-cap">{t('manageHint')}</span>
              </span>
              <Icon name="chev" size={18} />
            </button>
          </div>
        </>
      ) : (
        <button className="btn btn-plain" style={{ color: 'var(--down)' }} onClick={() => setConfirm({ kind: 'leave' })}>
          {t('leave')}
        </button>
      )}

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} label={confirm?.kind === 'remove' ? t('removeTitle', { name: confirm.name }) : t('leaveTitle')} alert>
        <h2 className="t-title">{confirm?.kind === 'remove' ? t('removeTitle', { name: confirm.name }) : t('leaveTitle')}</h2>
        <p className="t-body m-0">{confirm?.kind === 'remove' ? t('removeBody') : t('leaveBody')}</p>
        <button
          className="btn btn-primary"
          style={{ background: 'var(--down)' }}
          disabled={remove.isPending || leave.isPending}
          onClick={() => (confirm?.kind === 'remove' ? remove.mutate(confirm.key) : leave.mutate())}
        >
          {confirm?.kind === 'remove' ? t('removeConfirm') : t('leaveConfirm')}
        </button>
        <button className="btn btn-plain" onClick={() => setConfirm(null)}>
          {t('cancel')}
        </button>
      </Sheet>
    </div>
  )
}

// ── /grupo/unirse/<código> ───────────────────────────────
export function JoinGroup({ code: raw }: { code: string }) {
  const t = useTranslations('billing.join')
  const router = useRouter()
  const refresh = useRefreshAll()
  const toast = useToast()
  const code = normalizeCode(decodeURIComponent(raw))
  const { data: session } = useSession()
  const { data: peek, isError, refetch } = useQuery({ queryKey: ['group-peek', code], queryFn: () => api.groupPeek(code), retry: false })
  const signedIn = !!session?.signedIn
  const onboarded = signedIn && session.onboardingStep === null
  const join = useMutation({
    mutationFn: () => api.joinGroup(code),
    onSuccess: r => {
      forgetGroup()
      refresh()
      toast(r.mode === 'OWN' ? t('joinedOwn', { name: r.name }) : t('joined', { name: r.name }))
      router.replace('/grupo')
    },
  })
  // Sin cuenta (o con la bienvenida a medias): se guarda el código para unirle en cuanto la tenga
  useEffect(() => {
    if (session && !onboarded && peek?.valid && peek.active && !peek.full) rememberGroup(code)
  }, [session, onboarded, peek?.valid, peek?.active, peek?.full, code])
  return (
    <>
      <TopBar close={onboarded ? '/inicio' : '/'} title={t('title')} />
      <div className="pad pt-4">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : !peek || !session ? (
          <PageSkeleton />
        ) : !peek.valid ? (
          <div className="flex flex-col items-center gap-3 pt-6 text-center">
            <Lumi mood="THINKING" size={64} />
            <h1 className="t-title">{t('badLinkTitle')}</h1>
            <p className="t-foot m-0">{t('badLinkBody')}</p>
            <Link href={onboarded ? '/inicio' : '/'} className="btn btn-primary">
              {onboarded ? t('back') : t('goHome')}
            </Link>
          </div>
        ) : (
          <>
            <div className="hero flex flex-col items-start gap-3 p-6">
              <Lumi mood="CELEBRATE" size={56} />
              <span style={{ color: 'rgb(255 255 255 / 0.8)' }}>{peek.ownerName ? t('invitedBy', { name: peek.ownerName }) : t('invited')}</span>
              <h1 className="t-title m-0 break-words">{peek.name}</h1>
              <span className="chip" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                {peek.tier ? PLAN[peek.tier] : ''}
              </span>
              {peek.active && !peek.full && <span style={{ color: 'rgb(255 255 255 / 0.75)' }}>{t('seatsLeft', { n: peek.seatsLeft })}</span>}
            </div>
            <p className="t-body m-0">{t('body', { plan: peek.tier ? PLAN[peek.tier] : '' })}</p>
            {!peek.active ? (
              <div className="banner">{t('notActive')}</div>
            ) : peek.full ? (
              <div className="banner">{t('errors.GROUP_FULL')}</div>
            ) : onboarded && session.isGuest ? (
              <>
                <p className="t-foot m-0">{t('guest')}</p>
                <Link href="/guardar" className="btn btn-primary">
                  {t('guestCta')}
                </Link>
              </>
            ) : onboarded ? (
              <>
                {join.error && <p className="err m-0">{joinError(t, join.error)}</p>}
                <button className="btn btn-primary" onClick={() => join.mutate()} disabled={join.isPending}>
                  {t('joinNow')}
                </button>
              </>
            ) : signedIn ? (
              <>
                <p className="t-foot m-0">{t('finishOnboarding')}</p>
                <Link href="/onboarding" className="btn btn-primary">
                  {t('continueOnboarding')}
                </Link>
              </>
            ) : (
              <>
                <Link href="/registro" className="btn btn-primary">
                  {t('signUp')}
                </Link>
                <Link href="/entrar" className="btn btn-secondary">
                  {t('signIn')}
                </Link>
                <p className="t-cap m-0 text-center">{t('afterAuth')}</p>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
