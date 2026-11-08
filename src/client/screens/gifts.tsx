'use client'
// Regalar Lumi: comprar un regalo (/regalar), la tarjeta para compartirlo, «Mis regalos», canjearlo (/regalo/<código>),
// el banner de Inicio (Navidad y, después, «Regala Lumi») y la sección de la portada.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { GiftMineT, GiftRedeemT } from '@/shared/contract'
import { money } from '@/shared/format'
import { GIFT_MESSAGE_MAX, GIFT_NAME_MAX, GIFT_PRICE, isXmas, PENDING_GIFT_KEY, type GiftMonths, type GiftTier } from '@/shared/gifts'
import { PLAN_NAME } from '@/shared/plans'
import { api, ApiFailure } from '../api'
import { useRefreshAll, useSession } from '../hooks'
import { useGuard } from '../shell'
import { Icon, Wordmark } from '../ui/icons'
import { ErrorState, PageSkeleton, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

// ── Código pendiente en el dispositivo ──────────────────────
// Quien abre un regalo sin cuenta lo guarda aquí mientras se registra y pasa la bienvenida (solo para eso: es
// necesario para el servicio que pide, no hace falta permiso de cookies). Caduca a los 7 días.
const BUY_INTENT_KEY = 'lumi:gift-buy'
const SENT_KEY = 'lumi:gift-sent'
const WEEK_MS = 7 * 86_400_000

function readPending(): string | null {
  try {
    const raw = localStorage.getItem(PENDING_GIFT_KEY)
    if (!raw) return null
    const [code, at] = raw.split('|')
    if (!code || Date.now() - Number(at) > WEEK_MS) return null
    return code
  } catch {
    return null
  }
}
export function savePendingGift(code: string) {
  try {
    localStorage.setItem(PENDING_GIFT_KEY, `${code}|${Date.now()}`)
  } catch {
    // sin almacenamiento: tendrá que volver a abrir el enlace
  }
}
function clearPendingGift() {
  try {
    localStorage.removeItem(PENDING_GIFT_KEY)
    sessionStorage.removeItem(SENT_KEY)
  } catch {
    // nada que borrar
  }
}
function saveBuyIntent() {
  try {
    localStorage.setItem(BUY_INTENT_KEY, String(Date.now()))
  } catch {
    // no pasa nada: llegará a Inicio y verá el banner
  }
}
/** El valor se lee una vez al pintar en el navegador (en el servidor no hay almacenamiento) */
const noSubscribe = () => () => {}
const usePending = () => useSyncExternalStore(noSubscribe, readPending, () => null)

// ── Textos comunes ────────────────────────────────────────
/** «Regalar Lumi» para la lista de Perfil (allí la etiqueta es un texto, sin hook) */
export const giftLinkLabel = (locale: string) => ({ es: 'Regalar Lumi', ca: 'Regalar la Lumi', en: 'Gift Lumi' })[locale as 'es'] ?? 'Regalar Lumi'

const giftUrl = (code: string) => `${location.origin}/regalo/${code}`
const prettyCode = (code: string) => `${code.slice(0, 5)}-${code.slice(5)}`
const dateOf = (iso: string | null, locale: string) => (iso ? new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '')

function useShare() {
  const [copied, setCopied] = useState(false)
  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // sin portapapeles: el enlace está a la vista para copiarlo a mano
    }
  }
  const share = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lumi', text })
      } catch {
        // cancelado: no pasa nada
      }
    } else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  return { copied, copy, share }
}

// ── La tarjeta regalo (la misma en la compra y en el canje) ─
export function GiftArt({ tier, months, toName, fromName, message, code }: { tier: GiftTier; months: GiftMonths; toName?: string | null; fromName?: string | null; message?: string | null; code?: string | null }) {
  const t = useTranslations('gifts')
  const max = tier === 'PREMIUM'
  return (
    <div
      className="relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-[24px] p-5"
      style={{ background: max ? 'linear-gradient(150deg, var(--hero) 35%, color-mix(in srgb, var(--brand) 70%, var(--hero)))' : 'linear-gradient(150deg, var(--brand) 25%, color-mix(in srgb, var(--brand) 55%, var(--hero)))', color: '#fff', boxShadow: '0 14px 34px color-mix(in srgb, var(--hero) 30%, transparent)' }}
      role="group"
      aria-label={t('cardLabel')}
    >
      {/* Lazo decorativo */}
      <svg className="pointer-events-none absolute -top-2 -right-2 h-28 w-28 opacity-20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.2" aria-hidden="true">
        <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
      <div className="flex items-center gap-2.5">
        <Lumi mood="CELEBRATE" size={40} />
        <span className="text-[12px] font-extrabold tracking-[0.08em] uppercase" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
          {t('cardLabel')}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[34px] leading-[38px] font-extrabold tracking-[-0.02em]">Lumi {PLAN_NAME[tier]}</span>
        <span className="text-[17px] font-bold" style={{ color: 'rgb(255 255 255 / 0.85)' }}>
          {t('length', { months })}
        </span>
      </div>
      {(toName || fromName) && (
        <div className="flex flex-col text-[15px] leading-[21px]">
          {toName && <b className="break-words">{t('cardFor', { name: toName })}</b>}
          {fromName && <span className="break-words" style={{ color: 'rgb(255 255 255 / 0.85)' }}>{t('cardFrom', { name: fromName })}</span>}
        </div>
      )}
      {message && (
        <p className="m-0 rounded-2xl px-3.5 py-3 text-[15px] leading-[21px] break-words whitespace-pre-line" style={{ background: 'rgb(255 255 255 / 0.14)' }}>
          «{message}»
        </p>
      )}
      {code && (
        <span className="t-cap font-bold tracking-[0.12em]" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
          {t('cardCode')} {prettyCode(code)}
        </span>
      )}
    </div>
  )
}

/** Tarjeta + enlace + compartir (tras pagar y desde «Mis regalos») */
function GiftCardView({ gift, fresh }: { gift: GiftMineT; fresh?: boolean }) {
  const t = useTranslations('gifts')
  const locale = useLocale()
  const { copied, copy, share } = useShare()
  const ready = gift.status === 'READY' && !!gift.code
  const link = gift.code ? giftUrl(gift.code) : ''
  const vars = { plan: PLAN_NAME[gift.tier], length: t('length', { months: gift.months }), link }
  const text = gift.fromName ? t('shareText', { ...vars, from: gift.fromName }) : t('shareTextAnon', vars)
  return (
    <>
      {/* Recién pagado no hay flecha atrás: volvería a la página de pago de Stripe */}
      {fresh ? <TopBar title={t('cardTitle')} /> : <TopBar back="/regalar" title={t('cardTitle')} />}
      <div className="pad">
        {fresh && (
          <div className="flex flex-col items-center gap-1 pt-2 text-center">
            <h1 className="t-large">{t('readyTitle')}</h1>
            <p className="t-body muted m-0">{gift.toName ? t('readyBody', { name: gift.toName }) : t('readyBodyAnon')}</p>
          </div>
        )}
        <div className={fresh ? 'animate-pop' : undefined}>
          <GiftArt tier={gift.tier} months={gift.months} toName={gift.toName} fromName={gift.fromName} message={gift.message} code={gift.code} />
        </div>
        {!fresh && <StatusLine gift={gift} />}
        {ready && (
          <div className="card flex flex-col gap-2.5">
            <b>{t('yourLink')}</b>
            <code className="truncate rounded-lg px-3 py-2 text-[14px]" style={{ background: 'var(--fill)' }}>
              {link}
            </code>
            <div className="grid grid-cols-2 gap-2.5">
              <button className="btn btn-secondary px-3" onClick={() => copy(link)}>
                {copied ? t('copied') : t('copy')}
              </button>
              <button className="btn btn-primary px-3" onClick={() => share(text)}>
                <Icon name="chat" size={18} /> {t('share')}
              </button>
            </div>
            <span className="t-cap">{t('linkNote')}</span>
          </div>
        )}
        {ready && gift.expiresAt && <p className="t-cap m-0 text-center">{t('until', { date: dateOf(gift.expiresAt, locale) })}</p>}
        <Link href="/regalar" className="btn btn-plain">
          {fresh ? t('another') : t('mine')}
        </Link>
      </div>
    </>
  )
}

function StatusLine({ gift }: { gift: GiftMineT }) {
  const t = useTranslations('gifts')
  const locale = useLocale()
  const line =
    gift.status === 'REDEEMED' && gift.redeemedAt
      ? gift.redeemedBy
        ? t('redeemedBy', { name: gift.redeemedBy, date: dateOf(gift.redeemedAt, locale) })
        : t('redeemedOn', { date: dateOf(gift.redeemedAt, locale) })
      : gift.status === 'EXPIRED'
        ? t('expiredOn', { date: dateOf(gift.expiresAt, locale) })
        : gift.status === 'CANCELED'
          ? t('canceledNote')
          : null
  if (!line) return null
  return (
    <div className={`banner ${gift.status === 'REDEEMED' ? 'banner-info' : ''}`}>
      <Icon name={gift.status === 'REDEEMED' ? 'check' : 'info'} size={16} /> {line}
    </div>
  )
}

// ── /regalar ─────────────────────────────────────────────
export function GiftShop() {
  // useSearchParams necesita su <Suspense>
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GiftShopScreen />
    </Suspense>
  )
}

function GiftShopScreen() {
  const q = useSearchParams()
  const { ready } = useGuard('app')
  if (!ready) return <PageSkeleton />
  if (q.get('pago') === 'ok') return <GiftPaid sid={q.get('sid')} />
  return <GiftHome canceled={q.get('pago') === 'no'} view={q.get('ver')} />
}

/** Vuelta de Stripe: se confirma el pago y se enseña la tarjeta */
function GiftPaid({ sid }: { sid: string | null }) {
  const t = useTranslations('gifts')
  const qc = useQueryClient()
  const [tries, setTries] = useState(0)
  const [late, setLate] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setLate(true), 30_000)
    return () => clearTimeout(id)
  }, [tries])
  const confirm = useQuery({
    queryKey: ['gift-confirm', sid, tries],
    queryFn: () => api.confirmGift(sid ?? ''),
    enabled: !!sid,
    retry: 2,
    staleTime: Infinity,
    refetchInterval: q => (q.state.data && !q.state.data.done && !q.state.data.expired ? 2_000 : false),
  })
  const r = confirm.data
  const gift = r?.done ? r.gift : null
  // (recargar la página vuelve a confirmar sin repetir nada: el pago ya está apuntado)
  useEffect(() => {
    if (!gift) return
    qc.invalidateQueries({ queryKey: ['gifts'] })
    qc.invalidateQueries({ queryKey: ['notifications'] })
  }, [gift, qc])
  if (gift) return <GiftCardView gift={gift} fresh />
  if (!sid || confirm.isError || (r && !r.done && (r.expired || late)))
    return (
      <>
        <TopBar back="/regalar" title={t('title')} />
        <div className="pad items-center pt-12 text-center">
          <Lumi mood="THINKING" size={72} />
          <p className="t-head m-0">{r && !r.done && r.expired ? t('expired') : t('pending')}</p>
          <button className="btn btn-primary" onClick={() => (setLate(false), setTries(n => n + 1))}>
            {t('retry')}
          </button>
          <Link href="/ayuda" className="btn btn-plain">
            {t('help')}
          </Link>
        </div>
      </>
    )
  return (
    <div className="pad items-center pt-24 text-center" aria-busy="true">
      <Lumi mood="THINKING" size={72} />
      <p className="t-head m-0">{t('confirming')}</p>
    </div>
  )
}

function GiftHome({ canceled, view }: { canceled: boolean; view: string | null }) {
  const t = useTranslations('gifts')
  const { data, error, refetch } = useQuery({ queryKey: ['gifts'], queryFn: api.myGifts })
  if (error) return <ErrorState onRetry={refetch} message={error.message} />
  if (!data) return <PageSkeleton />
  const shown = view ? data.gifts.find(g => g.id === view) : null
  if (shown) return <GiftCardView gift={shown} />
  return (
    <>
      <TopBar back="/perfil" title={t('title')} />
      <div className="pad">
        {data.isGuest ? (
          <div className="flex flex-col items-center gap-3 pt-6 text-center">
            <Lumi mood="THINKING" size={64} />
            <p className="t-body m-0">{t('guest')}</p>
            <Link href="/guardar" className="btn btn-primary">
              {t('guestCta')}
            </Link>
          </div>
        ) : (
          <GiftForm defaultFrom={data.fromName ?? ''} payments={data.payments} canceled={canceled} />
        )}
        <MyGifts gifts={data.gifts} />
      </div>
    </>
  )
}

function GiftForm({ defaultFrom, payments, canceled }: { defaultFrom: string; payments: boolean; canceled: boolean }) {
  const xmasNow = useXmas()
  const t = useTranslations('gifts')
  const locale = useLocale()
  const [tier, setTier] = useState<GiftTier>('PREMIUM')
  const [months, setMonths] = useState<GiftMonths>(12)
  const [toName, setToName] = useState('')
  const [fromName, setFromName] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const from = fromName ?? defaultFrom
  const price = money(GIFT_PRICE[tier][months], 'EUR', locale)
  const buy = useMutation({
    mutationFn: () => api.buyGift({ tier, months, fromName: from.trim(), toName: toName.trim() || undefined, message: message.trim() || undefined }),
    onSuccess: r => {
      location.href = r.url
    },
  })
  const err = buy.error instanceof ApiFailure ? buy.error : null
  const errText = err ? (t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message) : null
  const msgLen = [...message].length
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={e => {
        e.preventDefault()
        buy.mutate()
      }}
    >
      <div className="hero flex flex-col items-start gap-2 p-5">
        <Lumi mood="CELEBRATE" size={52} />
        <h1 className="t-title m-0">{xmasNow ? t('banner.xmasTitle') : t('headline')}</h1>
        <p className="m-0 text-[15px] leading-[21px]" style={{ color: 'rgb(255 255 255 / 0.78)' }}>
          {t('intro')}
        </p>
      </div>
      {canceled && (
        <div className="banner" role="status">
          <Icon name="info" size={16} /> {t('canceled')}
        </div>
      )}
      {!payments && (
        <div className="banner" role="status">
          <Icon name="info" size={16} /> {t('unavailable')}
        </div>
      )}

      <b className="t-head mt-1 px-0.5">{t('whatTitle')}</b>
      <div className="grid grid-cols-2 gap-2.5" role="group" aria-label={t('whatTitle')}>
        {(['PLUS', 'PREMIUM'] as const).map(x => (
          <button key={x} type="button" className="opt min-h-[88px] flex-col items-start gap-0.5" aria-pressed={tier === x} onClick={() => setTier(x)}>
            <b className="text-[17px]">{PLAN_NAME[x]}</b>
            <span className="t-cap">{t(x === 'PLUS' ? 'plusSub' : 'maxSub')}</span>
          </button>
        ))}
      </div>
      <b className="t-head mt-1 px-0.5">{t('lengthTitle')}</b>
      <div className="grid grid-cols-2 gap-2.5" role="group" aria-label={t('lengthTitle')}>
        {([1, 12] as const).map(m => (
          <button key={m} type="button" className="opt min-h-[64px] flex-col items-start gap-0.5" aria-pressed={months === m} onClick={() => setMonths(m)}>
            <b>{t('length', { months: m })}</b>
            <span className="t-foot">{money(GIFT_PRICE[tier][m], 'EUR', locale)}</span>
          </button>
        ))}
      </div>

      <div className="card mt-1 flex flex-col gap-3">
        <div className="field">
          <label htmlFor="g-to">{t('toName')}</label>
          <input id="g-to" className="input" maxLength={GIFT_NAME_MAX} autoComplete="off" placeholder={t('toPlaceholder')} value={toName} onChange={e => setToName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="g-from">{t('fromName')}</label>
          <input id="g-from" className="input" required maxLength={GIFT_NAME_MAX} autoComplete="given-name" placeholder={t('fromPlaceholder')} value={from} onChange={e => setFromName(e.target.value)} aria-invalid={err?.code === 'FROM_REQUIRED'} />
        </div>
        <div className="field">
          <label htmlFor="g-msg">{t('message')}</label>
          <textarea id="g-msg" className="input min-h-24 py-3" maxLength={GIFT_MESSAGE_MAX} placeholder={t('messagePlaceholder')} value={message} onChange={e => setMessage(e.target.value)} aria-invalid={err?.code === 'NO_LINKS'} aria-describedby="g-msg-n" />
          <span id="g-msg-n" className="t-cap self-end">
            {t('counter', { n: msgLen, max: GIFT_MESSAGE_MAX })}
          </span>
        </div>
      </div>

      <GiftArt tier={tier} months={months} toName={toName.trim() || null} fromName={from.trim() || null} message={message.trim() || null} />

      <div className="card flex flex-col gap-1">
        <div className="kv">
          <span>{t('mineItem', { plan: PLAN_NAME[tier], length: t('length', { months }) })}</span>
          <span>{price}</span>
        </div>
        <span className="t-cap">{t('payNote')}</span>
      </div>
      {errText && (
        <p className="err m-0" role="alert">
          {errText}
        </p>
      )}
      <button className="btn btn-primary" disabled={buy.isPending || buy.isSuccess || !payments || !from.trim()}>
        {t('pay', { price })}
      </button>
      <p className="t-cap m-0">
        {t.rich('terms', {
          terms: c => (
            <Link href="/legal/contratacion" className="underline">
              {c}
            </Link>
          ),
        })}
      </p>
    </form>
  )
}

function MyGifts({ gifts }: { gifts: GiftMineT[] }) {
  const t = useTranslations('gifts')
  const locale = useLocale()
  return (
    <section className="mt-3 flex flex-col gap-2" aria-labelledby="my-gifts">
      <h2 id="my-gifts" className="t-head m-0 px-0.5">
        {t('mine')}
      </h2>
      {gifts.length === 0 ? (
        <p className="card t-foot m-0">{t('mineEmpty')}</p>
      ) : (
        <div className="list">
          {gifts.map(g => {
            const what = t('mineItem', { plan: PLAN_NAME[g.tier], length: t('length', { months: g.months }) })
            const sub = [g.toName ? t('mineFor', { name: g.toName }) : null, t(`status.${g.status}`), g.status === 'READY' && g.expiresAt ? t('until', { date: dateOf(g.expiresAt, locale) }) : null].filter(Boolean).join(' · ')
            return (
              <Link key={g.id} href={`/regalar?ver=${g.id}`} className="li min-h-[60px]" aria-label={t('openCard', { what })}>
                <span className="ava" style={g.status === 'READY' ? { background: 'color-mix(in srgb, var(--brand) 14%, var(--surface))', color: 'var(--brand-ink)' } : undefined}>
                  <Icon name={g.status === 'REDEEMED' ? 'check' : 'gift'} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate">{what}</b>
                  <span className="t-cap block truncate">{sub}</span>
                </span>
                <Icon name="chev" size={18} />
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── /regalo/<código> (pública) ──────────────────────────────
export function GiftRedeem({ code }: { code: string }) {
  const t = useTranslations('gifts.redeem')
  const tg = useTranslations('gifts')
  const tp = useTranslations('premium')
  const locale = useLocale()
  const qc = useQueryClient()
  const refresh = useRefreshAll()
  const { data: session } = useSession()
  const gift = useQuery({ queryKey: ['gift', code], queryFn: () => api.giftByCode(code), retry: (n, e) => !(e instanceof ApiFailure && e.status < 500) && n < 2 })
  const [done, setDone] = useState<GiftRedeemT | null>(null)
  const redeem = useMutation({
    mutationFn: () => api.redeemGift(code),
    onSuccess: r => {
      clearPendingGift()
      setDone(r)
      refresh()
    },
    // El estado puede haber cambiado (otra persona lo canjeó antes): se vuelve a mirar
    onError: () => qc.invalidateQueries({ queryKey: ['gift', code] }),
  })
  const g = gift.data
  const notFound = gift.error instanceof ApiFailure && gift.error.code === 'GIFT_NOT_FOUND'
  const canRedeem = !!g && g.status === 'READY' && !g.mine
  const signedOut = !!session && !session.signedIn
  const needsSetup = !!session?.signedIn && (!!session.isGuest || session.onboardingStep !== null)
  // Sin cuenta (o a medias): se guarda el código para canjearlo al volver de registrarse y de la bienvenida
  useEffect(() => {
    if (canRedeem && (signedOut || needsSetup)) savePendingGift(g!.code)
    else if (notFound || (g && !canRedeem)) clearPendingGift()
  }, [canRedeem, signedOut, needsSetup, notFound, g])

  const err = redeem.error instanceof ApiFailure ? redeem.error : null
  const errText = err ? (t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message) : null
  const features = g ? (tp.raw(g.tier === 'PLUS' ? 'plusFeatures' : 'maxFeatures') as string[]) : []

  let body: React.ReactNode
  if (done) body = <RedeemDone r={done} />
  else if (gift.isError && !notFound) body = <ErrorState onRetry={() => gift.refetch()} message={t('loadError')} />
  else if (notFound) body = <Blocked text={t('notFound')} />
  else if (!g || !session) body = <div className="skel h-[320px]" aria-busy="true" />
  else
    body = (
      <>
        <h1 className="t-large">{g.fromName ? t('title', { name: g.fromName }) : t('titleAnon')}</h1>
        <GiftArt tier={g.tier} months={g.months} toName={g.toName} fromName={g.fromName} message={g.message} />
        {g.status === 'READY' && !g.mine ? (
          <>
            <div className="card flex flex-col gap-2">
              <b>{t('includes', { plan: PLAN_NAME[g.tier], length: tg('length', { months: g.months }) })}</b>
              {features.map(f => (
                <span key={f} className="t-body flex items-start gap-2">
                  <Icon name="check" size={18} className="up mt-0.5 flex-none" /> {f}
                </span>
              ))}
            </div>
            <p className="t-foot m-0">{t('what')}</p>
            {signedOut ? (
              <>
                <Link href="/registro" className="btn btn-primary">
                  {t('signUp')}
                </Link>
                <Link href="/entrar" className="btn btn-secondary">
                  {t('signIn')}
                </Link>
                <p className="t-cap m-0 text-center">{t('signedOutNote')}</p>
              </>
            ) : session.isGuest ? (
              <>
                <p className="t-body m-0">{t('guest')}</p>
                <Link href="/guardar" className="btn btn-primary">
                  {t('guestCta')}
                </Link>
              </>
            ) : session.onboardingStep !== null ? (
              <>
                <p className="t-body m-0">{t('onboarding')}</p>
                <Link href="/onboarding" className="btn btn-primary">
                  {t('onboardingCta')}
                </Link>
              </>
            ) : (
              <>
                {errText && (
                  <p className="err m-0" role="alert">
                    {errText}
                  </p>
                )}
                <button className="btn btn-primary" onClick={() => redeem.mutate()} disabled={redeem.isPending}>
                  <Icon name="gift" size={20} /> {t('cta')}
                </button>
              </>
            )}
            {g.expiresAt && <p className="t-cap m-0 text-center">{t('until', { date: dateOf(g.expiresAt, locale) })}</p>}
          </>
        ) : g.mine && g.status === 'READY' ? (
          <Blocked text={t('mine')} cta={{ href: '/regalar', label: t('mineCta') }} />
        ) : (
          <Blocked
            text={g.status === 'REDEEMED' ? (g.redeemedByMe ? t('redeemedMine') : t('redeemed')) : g.status === 'EXPIRED' ? t('expired') : g.status === 'CANCELED' ? t('canceled') : t('notFound')}
            cta={g.redeemedByMe ? { href: '/inicio', label: t('goApp') } : undefined}
          />
        )}
      </>
    )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col gap-4 px-4 py-6">
      <Link href={session?.signedIn ? '/inicio' : '/'} className="self-start" style={{ color: 'var(--ink)' }} aria-label="Lumi">
        <Wordmark size={20} />
      </Link>
      {body}
      <p className="t-cap mt-auto mb-0 pt-4">{t('legal')}</p>
    </main>
  )
}

function Blocked({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  const t = useTranslations('gifts.redeem')
  const { data: session } = useSession()
  return (
    <div className="card flex flex-col items-center gap-3 py-6 text-center">
      <Lumi mood="THINKING" size={60} />
      <p className="t-body m-0">{text}</p>
      {cta ? (
        <Link href={cta.href} className="btn btn-primary">
          {cta.label}
        </Link>
      ) : (
        <Link href={session?.signedIn ? '/inicio' : '/'} className="btn btn-secondary">
          {session?.signedIn ? t('goApp') : t('knowMore')}
        </Link>
      )}
    </div>
  )
}

function RedeemDone({ r }: { r: GiftRedeemT }) {
  const t = useTranslations('gifts.redeem')
  const locale = useLocale()
  const date = dateOf(r.until, locale)
  // El plan con el que se queda: con Max ya en marcha, un Plus regalado suma días pero sigue siendo Max;
  // quien paga una suscripción la mantiene y se le retrasa el cobro
  const shown = r.plan === 'FREE' ? r.tier : r.plan
  const line = r.mode === 'DELAYED_CHARGE' ? t('doneDelayed', { days: r.days }) : r.mode === 'EXTENDED' ? t('doneExtended', { date }) : r.plan === 'PREMIUM' && r.tier === 'PLUS' ? t('doneKeepMax', { date }) : t('doneGift', { date })
  return (
    <div className="flex flex-col items-center gap-3 pt-6 text-center">
      <div className="animate-pop">
        <Lumi mood="CELEBRATE" size={96} />
      </div>
      <h1 className="t-large">{t('doneTitle', { plan: PLAN_NAME[shown] })}</h1>
      <p className="t-body muted m-0">{line}</p>
      {r.fromName && <p className="t-foot m-0">{t('doneFrom', { name: r.fromName })}</p>}
      <Link href="/clases" className="btn btn-primary mt-2">
        {t('start')}
      </Link>
      <Link href="/inicio" className="btn btn-plain">
        {t('home')}
      </Link>
    </div>
  )
}

// ── Inicio: banner de regalos ───────────────────────────────
/**
 * En Inicio, justo después de «Invita a un amigo»:
 *  · si hay un regalo guardado para canjear (llegó por un enlace sin cuenta), se le lleva a canjearlo una vez y,
 *    si vuelve sin hacerlo, se le recuerda aquí;
 *  · si no, la campaña de Navidad hasta XMAS_UNTIL y, después, «Regala Lumi».
 */
/** ¿Campaña de Navidad? En el navegador, con la fecha de hoy; al prerenderizar (sin «ahora»), sí */
const noop = () => () => {}
function useXmas() {
  return useSyncExternalStore(noop, () => isXmas(), () => true)
}

export function GiftBanner() {
  const t = useTranslations('gifts.banner')
  const router = useRouter()
  const pending = usePending()
  const xmas = useXmas()
  useEffect(() => {
    try {
      if (pending && sessionStorage.getItem(SENT_KEY) !== pending) {
        sessionStorage.setItem(SENT_KEY, pending)
        router.push(`/regalo/${pending}`)
        return
      }
      // Quería regalar desde la portada y tuvo que crear su cuenta antes
      const buy = Number(localStorage.getItem(BUY_INTENT_KEY) ?? 0)
      if (buy) {
        localStorage.removeItem(BUY_INTENT_KEY)
        if (Date.now() - buy < 86_400_000) router.push('/regalar')
      }
    } catch {
      // sin almacenamiento: se queda el banner
    }
  }, [pending, router])
  if (pending)
    return (
      <Link href={`/regalo/${pending}`} className="card flex min-h-[64px] items-center gap-3" style={{ color: 'inherit', boxShadow: 'inset 0 0 0 2px var(--brand)' }}>
        <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
          <Icon name="gift" size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block">{t('pendingTitle')}</b>
          <span className="t-foot block">{t('pendingBody')}</span>
        </span>
        <span className="btn btn-primary btn-sm flex-none">{t('pendingCta')}</span>
      </Link>
    )
  return (
    <Link href="/regalar" className="card flex min-h-[64px] items-center gap-3" style={{ color: 'inherit' }}>
      <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand) 14%, var(--surface))', color: 'var(--brand-ink)' }}>
        <Icon name="gift" size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block">{xmas ? t('xmasTitle') : t('title')}</b>
        <span className="t-foot block">{xmas ? t('xmasBody') : t('body')}</span>
      </span>
      <Icon name="chev" size={18} />
    </Link>
  )
}

// ── Portada: sección de regalo ──────────────────────────────
export function LandingGift() {
  const t = useTranslations('landing2')
  const locale = useLocale()
  const { data: session } = useSession()
  const inApp = !!session?.signedIn && session.onboardingStep === null
  const xmas = useXmas()
  return (
    <section id="regalar" className="mx-auto max-w-[1120px] scroll-mt-16 px-4 pb-14">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_380px]">
        <div className="flex flex-col items-start gap-3">
          <h2 className="t-large m-0">{xmas ? t('giftXmasTitle') : t('giftTitle')}</h2>
          <p className="t-body m-0 max-w-[520px]" style={{ color: 'var(--ink-2)' }}>
            {t('giftBody')}
          </p>
          <span className="t-head">{t('giftFrom', { price: money(GIFT_PRICE.PLUS[1], 'EUR', locale) })}</span>
          <div className="flex w-full max-w-[460px] flex-col gap-2 sm:flex-row">
            <Link href={inApp ? '/regalar' : '/registro'} onClick={() => !inApp && saveBuyIntent()} className="btn btn-primary sm:w-auto">
              <Icon name="gift" size={20} /> {t('giftCta')}
            </Link>
            {!inApp && (
              <Link href="/entrar" onClick={saveBuyIntent} className="btn btn-secondary sm:w-auto">
                {t('giftSignIn')}
              </Link>
            )}
          </div>
          <span className="t-cap">{t('giftNote')}</span>
        </div>
        <div className="mx-auto w-full max-w-[380px]">
          <GiftArt tier="PREMIUM" months={12} />
        </div>
      </div>
    </section>
  )
}
