'use client'
// Ligas de amigos (gratis): selector «General | Mis ligas» de la pestaña Liga, la lista de mis ligas,
// una liga por dentro (miembros, «Esta semana» y «Temporada del mes») y la página para unirse con un enlace.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { FriendLeagueT } from '@/shared/contract'
import { CODE_LEN, cleanName, isValidCode, isValidName, NAME_MAX, NAME_MIN, normalizeCode } from '@/shared/friend-leagues'
import { countdown, num } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useSession } from '../hooks'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, Seg, Sheet, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

// ── Código pendiente (llegó con un enlace sin tener cuenta) ─────────────
// Como el ?inv= de las invitaciones: se guarda mientras navega (y en la pestaña, por si entra con Google y vuelve),
// solo con su código de liga y solo porque lo ha pedido; se borra al usarlo.
const PENDING_KEY = 'lumi:liga'
let pending: string | null = null
export function rememberLeague(code: string) {
  pending = code
  try {
    sessionStorage.setItem(PENDING_KEY, code)
  } catch {
    // sin almacenamiento: vale mientras no recargue la página
  }
}
function pendingLeague() {
  if (pending) return pending
  try {
    return sessionStorage.getItem(PENDING_KEY)
  } catch {
    return null
  }
}
function forgetLeague() {
  pending = null
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // nada que borrar
  }
}

/** Si llegó con el enlace de una liga y ya tiene la cuenta lista, entra en ella (una vez) y la abre */
export function PendingLeagueJoin() {
  const t = useTranslations('friends')
  const { data: session } = useSession()
  const qc = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  const tried = useRef(false)
  const ready = !!session?.signedIn && session.onboardingStep === null && !session.viewAs
  const { mutate } = useMutation({
    mutationFn: api.joinFriendLeague,
    onSuccess: r => {
      qc.invalidateQueries({ queryKey: ['friends'] })
      toast(t('joined', { name: r.name }))
      router.push(`/liga?liga=${r.id}`)
    },
    onError: e => toast(errorText(t, e)),
    onSettled: forgetLeague,
  })
  useEffect(() => {
    if (!ready || tried.current) return
    const code = pendingLeague()
    if (!code) return
    tried.current = true
    mutate(code)
  }, [ready, mutate])
  return null
}

type T = ReturnType<typeof useTranslations<'friends'>>
function errorText(t: T, e: unknown) {
  if (e instanceof ApiFailure) return t.has(`errors.${e.code}`) ? t(`errors.${e.code}`) : e.message
  return t('errors.INTERNAL')
}

/** Nombre del mes en el idioma de la pantalla (octubre, d'octubre en catalán…) */
function monthName(month: string, locale: string) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString(locale, { month: 'long', timeZone: 'UTC' })
}
const startsWithVowel = (s: string) => /^[aeiouàèéíòóúh]/i.test(s)
const signed = (n: number, locale: string, d = 1) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${num(Math.abs(n), locale, d)}`

// ── Pestaña Liga: General | Mis ligas ────────────────────
/** Envuelve la liga general: arriba el selector; con ?v=mis la lista de mis ligas; con ?liga=<id>, esa liga */
export function LeagueSwitch({ general }: { general: React.ReactNode }) {
  const t = useTranslations('friends')
  const router = useRouter()
  const q = useSearchParams()
  const open = q.get('liga')
  const view = open || q.get('v') === 'mis' ? 'mine' : 'general'
  if (open) return <FriendLeagueView id={open} />
  return (
    <>
      <PendingLeagueJoin />
      <div className="px-4 pt-1 pb-1">
        <Seg
          label={t('switchLabel')}
          className="[&>button]:h-11 [&>button]:text-[15px]"
          value={view}
          options={[
            { value: 'general', label: t('tabGeneral') },
            { value: 'mine', label: t('tabMine') },
          ]}
          onChange={v => router.replace(v === 'mine' ? '/liga?v=mis' : '/liga')}
        />
      </div>
      {view === 'mine' ? <MyLeagues /> : general}
    </>
  )
}

// ── Mis ligas ────────────────────────────────────────────
function MyLeagues() {
  const t = useTranslations('friends')
  const router = useRouter()
  const qc = useQueryClient()
  const { data, isError, refetch } = useQuery({ queryKey: ['friends'], queryFn: api.friendLeagues })
  const [sheet, setSheet] = useState<'create' | 'join' | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const opened = (id: string) => {
    qc.invalidateQueries({ queryKey: ['friends'] })
    setSheet(null)
    router.push(`/liga?liga=${id}`)
  }
  const create = useMutation({ mutationFn: () => api.createFriendLeague(cleanName(name)), onSuccess: r => opened(r.id) })
  const join = useMutation({ mutationFn: () => api.joinFriendLeague(normalizeCode(code)), onSuccess: r => opened(r.id) })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return <PageSkeleton />
  const nameOk = isValidName(cleanName(name))
  const codeOk = isValidCode(normalizeCode(code))
  const close = () => {
    setSheet(null)
    create.reset()
    join.reset()
  }
  const canCreateMore = data.owned < data.maxOwned && data.leagues.length < data.maxJoined
  return (
    <div className="pad">
      <h1 className="t-large">{t('title')}</h1>
      <p className="t-foot -mt-1 m-0">{t('intro')}</p>
      {data.leagues.length ? (
        <div className="list">
          {data.leagues.map(l => (
            <Link key={l.id} href={`/liga?liga=${l.id}`} className="li min-h-[60px]">
              <span className="ava" aria-hidden="true">
                <Icon name="league" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[16px]">{l.name}</b>
                <span className="t-cap">
                  {t('members', { n: l.members })}
                  {l.isOwner ? ` · ${t('yours')}` : ''}
                </span>
              </span>
              <Icon name="chev" size={18} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card flex items-start gap-3">
          <Lumi mood="HAPPY" size={48} />
          <span>
            <b>{t('emptyTitle')}</b>
            <br />
            <span className="t-foot">{t('emptyBody')}</span>
          </span>
        </div>
      )}
      {data.canCreate ? (
        <button className="btn btn-primary" onClick={() => setSheet('create')} disabled={!canCreateMore}>
          <Icon name="plus" size={20} />
          {t('create')}
        </button>
      ) : (
        <Link href="/guardar" className="banner banner-info min-h-11">
          <Icon name="info" size={18} />
          <span className="flex-1">{t('guestCreate')}</span>
        </Link>
      )}
      <button className="btn btn-secondary" onClick={() => setSheet('join')} disabled={data.leagues.length >= data.maxJoined}>
        {t('joinCode')}
      </button>
      <p className="t-cap m-0">{!canCreateMore && data.canCreate ? t(data.leagues.length >= data.maxJoined ? 'atJoinLimit' : 'atOwnLimit', { n: data.leagues.length >= data.maxJoined ? data.maxJoined : data.maxOwned }) : t('limits', { owned: data.maxOwned, joined: data.maxJoined, members: data.maxMembers })}</p>
      <p className="t-cap m-0">{t('noPrizes')}</p>

      <Sheet open={sheet === 'create'} onClose={close} label={t('createTitle')}>
        <form
          className="flex flex-col gap-3.5"
          onSubmit={e => {
            e.preventDefault()
            if (nameOk) create.mutate()
          }}
        >
          <h2 className="t-title">{t('createTitle')}</h2>
          <div className="field">
            <label htmlFor="fl-name">{t('nameLabel')}</label>
            <input id="fl-name" className="input" value={name} maxLength={NAME_MAX + 10} placeholder={t('namePlaceholder')} onChange={e => setName(e.target.value)} aria-invalid={!!create.error} aria-describedby="fl-name-hint" autoComplete="off" />
            <span id="fl-name-hint" className={create.error ? 'err' : 't-cap'}>
              {create.error ? errorText(t, create.error) : t('nameHint', { min: NAME_MIN, max: NAME_MAX })}
            </span>
          </div>
          <button className="btn btn-primary" disabled={!nameOk || create.isPending}>
            {t('createCta')}
          </button>
          <button type="button" className="btn btn-plain" onClick={close}>
            {t('cancel')}
          </button>
        </form>
      </Sheet>

      <Sheet open={sheet === 'join'} onClose={close} label={t('joinTitle')}>
        <form
          className="flex flex-col gap-3.5"
          onSubmit={e => {
            e.preventDefault()
            if (codeOk) join.mutate()
          }}
        >
          <h2 className="t-title">{t('joinTitle')}</h2>
          <div className="field">
            <label htmlFor="fl-code">{t('codeLabel')}</label>
            <input
              id="fl-code"
              className="input text-center font-bold tracking-[0.2em] uppercase"
              value={code}
              maxLength={CODE_LEN + 4}
              placeholder="ABCD2345"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              onChange={e => setCode(e.target.value)}
              aria-invalid={!!join.error}
              aria-describedby="fl-code-hint"
            />
            <span id="fl-code-hint" className={join.error ? 'err' : 't-cap'}>
              {join.error ? errorText(t, join.error) : t('codeHint')}
            </span>
          </div>
          <button className="btn btn-primary" disabled={!codeOk || join.isPending}>
            {t('joinCta')}
          </button>
          <button type="button" className="btn btn-plain" onClick={close}>
            {t('cancel')}
          </button>
        </form>
      </Sheet>
    </div>
  )
}

// ── Una liga por dentro ──────────────────────────────────
function FriendLeagueView({ id }: { id: string }) {
  const t = useTranslations('friends')
  const { data, error, refetch } = useQuery({ queryKey: ['friends', id], queryFn: () => api.friendLeague(id), refetchInterval: 30_000, retry: (n, e) => !(e instanceof ApiFailure && e.status < 500) && n < 2 })
  if (error instanceof ApiFailure && (error.code === 'LEAGUE_NOT_FOUND' || error.code === 'VALIDATION_ERROR'))
    return (
      <>
        <TopBar back="/liga?v=mis" title={t('title')} />
        <div className="pad items-center pt-8 text-center">
          <Lumi mood="THINKING" size={64} />
          <p className="t-body">{t('errors.LEAGUE_NOT_FOUND_VIEW')}</p>
          <Link href="/liga?v=mis" className="btn btn-primary">
            {t('back')}
          </Link>
        </div>
      </>
    )
  if (error) return <ErrorState onRetry={refetch} />
  if (!data) return <PageSkeleton />
  return <LeagueBody l={data} />
}

function LeagueBody({ l }: { l: FriendLeagueT }) {
  const t = useTranslations('friends')
  const tl = useTranslations('league')
  const locale = useLang()
  const toast = useToast()
  const [board, setBoard] = useState<'week' | 'month'>('week')
  const [manage, setManage] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [, tick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => tick(n => n + 1), 60_000)
    return () => clearInterval(iv)
  }, [])
  // El enlace lleva también tu código de invitación: tu amigo entra con 7 días de Max (las cuentas de invitado no tienen)
  const { data: inv } = useQuery({ queryKey: ['invite'], queryFn: api.myInvites, retry: false, staleTime: 3_600_000 })
  const link = `${typeof location !== 'undefined' ? location.origin : ''}/liga/unirse/${l.code}${inv?.code ? `?inv=${inv.code}` : ''}`
  const share = async () => {
    const text = t('inviteText', { name: l.name, link })
    if (navigator.share) {
      try {
        await navigator.share({ title: 'E-Trading', text })
      } catch {
        // cancelado: no pasa nada
      }
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      toast(t('copied'))
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    }
  }
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(l.code)
      toast(t('codeCopied'))
    } catch {
      // sin portapapeles: el código está a la vista
    }
  }
  const champ = l.champion
  const champMonth = champ ? monthName(champ.month, locale) : ''
  const monthNow = monthName(l.month.month, locale)
  return (
    <>
      <TopBar back="/liga?v=mis" title={t('back')} />
      <div className="pad">
        <div className="card flex flex-col gap-2">
          <h1 className="t-title break-words">{l.name}</h1>
          <span className="t-foot">
            {t('members', { n: l.members.length })} · {l.isOwner ? t('byYou') : t('by', { name: l.ownerName })}
          </span>
          <button type="button" className="chip min-h-11 self-start" onClick={copyCode} aria-label={t('copyCode', { code: l.code })}>
            {t('codeIs')} <span className="tracking-[0.15em] tabular-nums">{l.code}</span>
          </button>
        </div>
        <button className="btn btn-primary" onClick={share} disabled={l.members.length >= l.maxMembers}>
          <Icon name="user" size={20} />
          {t('invite')}
        </button>
        {l.members.length >= l.maxMembers && <p className="t-cap -mt-1 m-0">{t('full', { n: l.maxMembers })}</p>}

        {champ && (
          <div className="card flex items-center gap-3" style={{ boxShadow: 'inset 0 0 0 2px var(--brand)' }}>
            <span className="ava" style={{ color: 'var(--brand-ink)' }} aria-hidden="true">
              <Icon name="star" size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="t-cap font-bold">{t(locale === 'ca' && startsWithVowel(champMonth) ? 'championVowel' : 'champion', { month: champMonth })}</span>
              <b className="block truncate">{champ.isMe ? t('championMe', { names: champ.names.join(', ') }) : champ.names.join(', ')}</b>
            </span>
            <b className="up flex-none tabular-nums">{signed(champ.pct, locale)} %</b>
          </div>
        )}

        <Seg
          label={t('boardLabel')}
          className="[&>button]:h-11 [&>button]:text-[15px]"
          value={board}
          options={[
            { value: 'week', label: t('week') },
            { value: 'month', label: t('month') },
          ]}
          onChange={setBoard}
        />
        {board === 'week' ? (
          <>
            <span className="t-foot -mt-1">{t('weekEnds', { time: countdown(l.week.endsAt) })}</span>
            <div className="list">
              <div className="li plainline t-cap font-bold">
                <span className="w-6">#</span>
                <span className="flex-1">{tl('player')}</span>
                <span className="text-right">{tl('pointsCol')}</span>
              </div>
              {l.week.rows.map(m => (
                <div key={m.key} className="li plainline" style={m.isMe ? { background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))' } : undefined} aria-current={m.isMe ? 'true' : undefined}>
                  <b className="w-6">{m.rank}</b>
                  <span className="min-w-0 flex-1 truncate" style={{ fontWeight: m.isMe ? 800 : 600 }}>
                    {m.isMe ? tl('you', { name: m.displayName }) : m.displayName}
                    <span className="t-cap block truncate font-normal">
                      {tl('rowXp', { xp: num(m.weeklyXp, locale, 0) })}
                      {m.tradePts > 0 && (
                        <>
                          {' · '}
                          <span className="up">{tl('rowTrade', { pts: `+${m.tradePts}` })}</span>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="flex-none text-right font-bold tabular-nums">{num(m.score, locale, 0)}</span>
                </div>
              ))}
            </div>
            <p className="t-foot m-0">{t('weekRule')}</p>
          </>
        ) : (
          <>
            <span className="t-foot -mt-1">{t('monthEnds', { month: monthNow, time: countdown(l.month.endsAt) })}</span>
            <div className="list">
              <div className="li plainline t-cap font-bold">
                <span className="w-6">#</span>
                <span className="flex-1">{tl('player')}</span>
                <span className="text-right">{t('returnCol')}</span>
              </div>
              {l.month.rows.map(m => (
                <div key={m.key} className="li plainline" style={m.isMe ? { background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))' } : undefined} aria-current={m.isMe ? 'true' : undefined}>
                  <b className="w-6">{m.rank}</b>
                  <span className="min-w-0 flex-1 truncate" style={{ fontWeight: m.isMe ? 800 : 600 }}>
                    {m.isMe ? tl('you', { name: m.displayName }) : m.displayName}
                    {m.concentrated && <span className="t-cap block truncate font-normal">{t('concentrated')}</span>}
                  </span>
                  <span className={`flex-none text-right font-bold tabular-nums ${m.pct > 0 ? 'up' : m.pct < 0 ? 'down' : ''}`}>{signed(m.pct, locale, 2)} %</span>
                </div>
              ))}
            </div>
            <p className="t-foot m-0">{t('monthRule')}</p>
          </>
        )}
        <p className="t-cap m-0">{t('noPrizes')}</p>
        {l.isOwner ? (
          <button className="btn btn-secondary" onClick={() => setManage(true)}>
            <Icon name="gear" size={20} />
            {t('manage')}
          </button>
        ) : (
          <button className="btn btn-plain" style={{ color: 'var(--down)' }} onClick={() => setLeaving(true)}>
            {t('leave')}
          </button>
        )}
      </div>
      {l.isOwner && <ManageSheet l={l} open={manage} onClose={() => setManage(false)} />}
      <LeaveSheet l={l} open={leaving} onClose={() => setLeaving(false)} />
    </>
  )
}

function LeaveSheet({ l, open, onClose }: { l: FriendLeagueT; open: boolean; onClose: () => void }) {
  const t = useTranslations('friends')
  const qc = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  const leave = useMutation({
    mutationFn: () => api.leaveFriendLeague(l.id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['friends', l.id] })
      qc.invalidateQueries({ queryKey: ['friends'] })
      toast(t('left', { name: l.name }))
      router.replace('/liga?v=mis')
    },
  })
  return (
    <Sheet open={open} onClose={onClose} label={t('leave')} alert>
      <h2 className="t-title">{t('leave')}</h2>
      <p className="t-body m-0">{t(l.isOwner ? 'leaveConfirmOwner' : 'leaveConfirm', { name: l.name })}</p>
      {leave.error && <p className="err m-0">{errorText(t, leave.error)}</p>}
      <button className="btn btn-primary" style={{ background: 'var(--down)' }} onClick={() => leave.mutate()} disabled={leave.isPending}>
        {t('leaveYes')}
      </button>
      <button className="btn btn-plain" onClick={onClose}>
        {t('cancel')}
      </button>
    </Sheet>
  )
}

function ManageSheet({ l, open, onClose }: { l: FriendLeagueT; open: boolean; onClose: () => void }) {
  const t = useTranslations('friends')
  const qc = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState(l.name)
  const [confirm, setConfirm] = useState<{ kind: 'remove'; key: string; name: string } | { kind: 'delete' } | { kind: 'leave' } | null>(null)
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['friends'] })
  }
  const rename = useMutation({ mutationFn: () => api.renameFriendLeague(l.id, cleanName(name)), onSuccess: () => (refresh(), toast(t('renamed'))) })
  const remove = useMutation({ mutationFn: (key: string) => api.removeFriendLeagueMember(l.id, key), onSuccess: () => (refresh(), setConfirm(null)) })
  const del = useMutation({
    mutationFn: () => api.deleteFriendLeague(l.id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['friends', l.id] })
      refresh()
      toast(t('deleted', { name: l.name }))
      router.replace('/liga?v=mis')
    },
  })
  const close = () => {
    setConfirm(null)
    rename.reset()
    remove.reset()
    del.reset()
    onClose()
  }
  const nameOk = isValidName(cleanName(name)) && cleanName(name) !== l.name
  if (confirm?.kind === 'leave') return <LeaveSheet l={l} open={open} onClose={() => setConfirm(null)} />
  return (
    <Sheet open={open} onClose={close} label={t('manageTitle')} alert={!!confirm}>
      {confirm ? (
        <>
          <h2 className="t-title">{confirm.kind === 'delete' ? t('delete') : t('remove')}</h2>
          <p className="t-body m-0">{confirm.kind === 'delete' ? t('deleteConfirm', { name: l.name }) : t('removeConfirm', { name: confirm.name })}</p>
          {(remove.error || del.error) && <p className="err m-0">{errorText(t, remove.error ?? del.error)}</p>}
          <button className="btn btn-primary" style={{ background: 'var(--down)' }} disabled={remove.isPending || del.isPending} onClick={() => (confirm.kind === 'delete' ? del.mutate() : remove.mutate(confirm.key))}>
            {confirm.kind === 'delete' ? t('deleteYes') : t('removeYes')}
          </button>
          <button className="btn btn-plain" onClick={() => setConfirm(null)}>
            {t('cancel')}
          </button>
        </>
      ) : (
        <>
          <h2 className="t-title">{t('manageTitle')}</h2>
          <form
            className="flex flex-col gap-2"
            onSubmit={e => {
              e.preventDefault()
              if (nameOk) rename.mutate()
            }}
          >
            <div className="field">
              <label htmlFor="fl-rename">{t('rename')}</label>
              <input id="fl-rename" className="input" value={name} maxLength={NAME_MAX + 10} onChange={e => setName(e.target.value)} aria-invalid={!!rename.error} aria-describedby="fl-rename-hint" autoComplete="off" />
              <span id="fl-rename-hint" className={rename.error ? 'err' : 't-cap'}>
                {rename.error ? errorText(t, rename.error) : t('nameHint', { min: NAME_MIN, max: NAME_MAX })}
              </span>
            </div>
            <button className="btn btn-secondary" disabled={!nameOk || rename.isPending}>
              {t('save')}
            </button>
          </form>
          <b className="t-head mt-1">{t('membersTitle', { n: l.members.length, max: l.maxMembers })}</b>
          <div className="list">
            {l.members.map(m => (
              <div key={m.key} className="li plainline min-h-[56px]">
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {m.displayName}
                  {m.isOwner && <span className="t-cap block font-normal">{t('owner')}</span>}
                </span>
                {!m.isOwner && (
                  <button type="button" className="btn btn-plain btn-sm h-11 flex-none" style={{ color: 'var(--down)' }} onClick={() => setConfirm({ kind: 'remove', key: m.key, name: m.displayName })} aria-label={t('removeAria', { name: m.displayName })}>
                    {t('remove')}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="t-cap m-0">{t('removeNote')}</p>
          <button className="btn btn-secondary" onClick={() => setConfirm({ kind: 'leave' })}>
            {t('leave')}
          </button>
          <button className="btn btn-plain" style={{ color: 'var(--down)' }} onClick={() => setConfirm({ kind: 'delete' })}>
            <Icon name="trash" size={20} />
            {t('delete')}
          </button>
        </>
      )}
    </Sheet>
  )
}

// ── Página /liga/unirse/<código> ─────────────────────────
export function JoinLeague({ code: raw }: { code: string }) {
  const t = useTranslations('friends')
  const router = useRouter()
  const qc = useQueryClient()
  const code = normalizeCode(decodeURIComponent(raw))
  const q = useSearchParams()
  const inv = q.get('inv')
  const { data: session } = useSession()
  const { data: peek, isError, refetch } = useQuery({ queryKey: ['friends-peek', code], queryFn: () => api.friendLeaguePeek(code), retry: false })
  const { data: inviter } = useQuery({ queryKey: ['inviter', inv], queryFn: () => api.inviterName(inv!), enabled: !!inv, retry: false })
  const signedIn = !!session?.signedIn
  const onboarded = signedIn && session.onboardingStep === null
  const join = useMutation({
    mutationFn: () => api.joinFriendLeague(code),
    onSuccess: r => {
      forgetLeague()
      qc.invalidateQueries({ queryKey: ['friends'] })
      router.replace(`/liga?liga=${r.id}`)
    },
  })
  // Sin cuenta (o con la bienvenida a medias): se guarda el código para unirle en cuanto la tenga
  useEffect(() => {
    if (session && !onboarded && peek?.valid) rememberLeague(code)
  }, [session, onboarded, peek?.valid, code])
  return (
    <>
      <TopBar close={onboarded ? '/liga' : '/'} title={t('joinPageTitle')} />
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
            <Link href={onboarded ? '/liga?v=mis' : '/'} className="btn btn-primary">
              {onboarded ? t('back') : t('goHome')}
            </Link>
          </div>
        ) : (
          <>
            <div className="hero flex flex-col items-start gap-3 p-6">
              <Lumi mood="CELEBRATE" size={56} />
              {inviter?.valid && <span style={{ color: 'rgb(255 255 255 / 0.8)' }}>{inviter.name ? t('invitedBy', { name: inviter.name }) : t('invited')}</span>}
              <h1 className="t-title m-0 break-words">{peek.name}</h1>
              <span style={{ color: 'rgb(255 255 255 / 0.75)' }}>{t('members', { n: peek.members })}</span>
            </div>
            <p className="t-body m-0">{t('joinPageBody')}</p>
            {peek.full ? (
              <div className="banner">{t('errors.LEAGUE_FULL')}</div>
            ) : onboarded ? (
              <>
                {join.error && <p className="err m-0">{errorText(t, join.error)}</p>}
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
                {inviter?.valid && <p className="t-foot m-0">{t('maxNote')}</p>}
                <Link href="/registro" className="btn btn-primary">
                  {t('signUp')}
                </Link>
                <Link href="/entrar" className="btn btn-secondary">
                  {t('signIn')}
                </Link>
                <p className="t-cap m-0 text-center">{t('afterAuth')}</p>
              </>
            )}
            <p className="t-cap m-0">{t('noPrizes')}</p>
          </>
        )}
      </div>
    </>
  )
}
