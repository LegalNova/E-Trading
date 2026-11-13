'use client'
// 06 · Premium, ajustes, cuenta y privacidad (RGPD)
import { PLAN_NAME } from '@/shared/plans'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { GenderT, SettingsT } from '@/shared/contract'
import { money } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useMe, usePortfolio, useRefreshAll, useSession, useSettings } from '../hooks'
import { applyTheme, useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, Section, Seg, Toggle, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'
import { playFx } from '../ui/sound'
import { BuyPlans, TestCardNote, usePlanBadge } from '../upgrade'
import { PushToggle } from '../push'

// ── Premium (06.1–06.2) ──────────────────────────────────
/** Vuelta de Stripe en la URL: ?pago=ok&sid=cs_… (pagado) o ?pago=no (salió sin pagar) */
function usePaymentReturn(): { ok: true; sid: string | null } | { ok: false } | null {
  // Con useSearchParams el servidor y el navegador pintan lo mismo (sin saltos al cargar)
  const q = useSearchParams()
  return q.get('pago') === 'ok' ? { ok: true, sid: q.get('sid') } : q.get('pago') === 'no' ? { ok: false } : null
}

export function Premium() {
  // useSearchParams necesita su <Suspense> (si no, Next no puede preparar la página de antemano)
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PremiumScreen />
    </Suspense>
  )
}

function PremiumScreen() {
  const ret = usePaymentReturn()
  if (ret?.ok) return <PaymentDone sid={ret.sid} />
  return <PlansScreen canceled={ret?.ok === false} />
}

/** «Gracias»: confirma el pago con Stripe al volver y enseña el plan ya activo */
function PaymentDone({ sid }: { sid: string | null }) {
  const t = useTranslations('premium')
  const locale = useLang()
  const refresh = useRefreshAll()
  const [tries, setTries] = useState(0)
  // Medio minuto sin confirmación: se ofrece volver a comprobar (y ayuda)
  const [late, setLate] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setLate(true), 30_000)
    return () => clearTimeout(id)
  }, [tries])
  const confirm = useQuery({
    queryKey: ['pay-confirm', sid, tries],
    queryFn: () => (sid ? api.confirmPayment(sid) : api.billingStatus().then(s => ({ ...s, done: s.plan !== 'FREE', amount: 0, currency: 'EUR', trial: s.status === 'TRIALING' }) as Awaited<ReturnType<typeof api.confirmPayment>>)),
    retry: 2,
    staleTime: Infinity,
    // El banco puede tardar unos segundos: se vuelve a preguntar cada 2 s durante medio minuto
    refetchInterval: q => (q.state.data && !q.state.data.done && !q.state.data.expired ? 2_000 : false),
  })
  const r = confirm.data
  const done = !!r?.done
  useEffect(() => {
    if (!done) return
    refresh()
    // La URL vuelve a /premium: recargar no repite la confirmación
    window.history.replaceState(null, '', window.location.pathname)
  }, [done, refresh])

  if (confirm.isError || (r && !r.done && (r.expired || late)))
    return (
      <div className="pad items-center pt-16 text-center">
        <Lumi mood="THINKING" size={72} />
        <p className="t-head m-0">{r && !r.done && r.expired ? t('payExpired') : t('payPending')}</p>
        <button className="btn btn-primary" onClick={() => (setLate(false), setTries(n => n + 1))}>
          {t('payRetry')}
        </button>
        <Link href="/ayuda" className="btn btn-plain">
          {t('payHelp')}
        </Link>
      </div>
    )
  if (!r || !r.done)
    return (
      <div className="pad items-center pt-24 text-center" aria-busy="true">
        <Lumi mood="THINKING" size={72} />
        <p className="t-head m-0">{t('confirmingPay')}</p>
      </div>
    )
  const plan = r.plan === 'PLUS' ? 'PLUS' : 'PREMIUM'
  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) : '')
  const features = t.raw(plan === 'PLUS' ? 'plusFeatures' : 'maxFeatures') as string[]
  return (
    <div className="pad min-h-[calc(100dvh-120px)] pt-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="animate-pop">
          <Lumi mood="CELEBRATE" size={96} />
        </div>
        <h1 className="t-large">{t('paidTitle', { plan: PLAN_NAME[plan] })}</h1>
        <p className="t-body muted m-0">
          {r.trial ? t('paidTrialBody', { date: date(r.trialEndsAt) }) : r.amount > 0 ? t('paidBody', { amount: money(r.amount, r.currency === 'USD' ? 'USD' : 'EUR', locale), date: date(r.renewsAt) }) : t('paidBodyShort')}
        </p>
      </div>
      <div className="banner banner-info justify-center">
        <Icon name="check" size={16} /> {t('paidReceipt')}
      </div>
      <b className="t-head mt-2 px-0.5">{t('paidUnlocked')}</b>
      <FeatureList features={features} />
      <Link href="/clases" className="btn btn-primary">
        {t('startLearning')}
      </Link>
      <Link href="/inicio" className="btn btn-plain">
        {t('goHome')}
      </Link>
    </div>
  )
}

function PlansScreen({ canceled }: { canceled: boolean }) {
  const t = useTranslations('premium')
  const tb = useTranslations('billing')
  const { data: session } = useSession()
  const { data: badge } = usePlanBadge()
  const locale = useLang()
  const refresh = useRefreshAll()
  const toast = useToast()
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: api.billingPlans })
  const { data: status } = useQuery({ queryKey: ['billing'], queryFn: api.billingStatus })
  const [tier, setTier] = useState<'PLUS' | 'PREMIUM'>('PREMIUM')
  const [interval, setInterval_] = useState<'YEAR' | 'MONTH'>('YEAR')
  const [step, setStep] = useState<'choose' | 'confirming' | 'done'>('choose')
  const chosen = plans?.find(p => p.tier === tier && p.interval === interval)
  const checkout = useMutation({
    mutationFn: () => api.checkout(chosen!.id),
    onMutate: () => setStep('confirming'),
    onSuccess: r => {
      // Con Stripe: a su página de pago (vuelve a /premium?pago=ok)
      if (r.url) return window.location.assign(r.url)
      refresh()
      setStep('done')
    },
    onError: e => (setStep('choose'), toast(e instanceof ApiFailure ? e.message : t('failed'))),
  })
  if (!plans || !status || !chosen) return <PageSkeleton />
  const features = (k: 'PLUS' | 'PREMIUM') => t.raw(k === 'PLUS' ? 'plusFeatures' : 'maxFeatures') as string[]

  if (step === 'confirming')
    return (
      <div className="pad items-center pt-24 text-center" aria-busy="true">
        <Lumi mood="THINKING" size={72} />
        <p className="t-head m-0">{t('confirming')}</p>
      </div>
    )
  if (step === 'done')
    return (
      <div className="pad min-h-[calc(100dvh-20px)] items-center pt-12 text-center">
        <div className="animate-pop">
          <Lumi mood="CELEBRATE" size={96} />
        </div>
        <h1 className="t-large">{t('welcome', { plan: PLAN_NAME[tier] })}</h1>
        <p className="t-body muted m-0">
          {t.rich('trialEnds', {
            date: checkout.data?.trialEndsAt ? new Date(checkout.data.trialEndsAt).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) : '',
            amount: money(40000, 'EUR', locale),
            b: c => <b style={{ color: 'var(--ink)' }}>{c}</b>,
          })}
        </p>
        <div className="flex-1" />
        <Link href="/inicio" className="btn btn-primary">
          {t('start')}
        </Link>
      </div>
    )

  // Plan de grupo: ya lo tiene pagado, no se le ofrece pagar
  if (status.status === 'GROUP')
    return (
      <>
        <TopBar close="/perfil" />
        <div className="pad">
          <h1 className="t-large">{tb('inGroupTitle', { plan: PLAN_NAME[status.plan] })}</h1>
          <p className="t-body muted m-0">{tb('inGroupBody', { name: badge?.group?.name ?? '' })}</p>
          {badge?.group?.pastDue && <div className="banner">{tb('inGroupPastDue')}</div>}
          <FeatureList features={features(status.plan === 'PLUS' ? 'PLUS' : 'PREMIUM')} />
          <Link href="/grupo" className="btn btn-primary">
            {tb('seeGroup')}
          </Link>
        </div>
      </>
    )

  if (status.plan === 'PREMIUM')
    return (
      <>
        <TopBar close="/perfil" />
        <div className="pad">
          <h1 className="t-large">{t('youAre', { plan: 'Max' })}</h1>
          <p className="t-body muted m-0">{(status.status === 'TRIALING' || status.status === 'GIFT') && status.trialEndsAt ? t(status.status === 'GIFT' ? 'giftUntil' : badge?.stripe ? 'freeUntil' : 'trialUntil', { date: new Date(status.trialEndsAt).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) }) : t('active')}</p>
          <FeatureList features={features('PREMIUM')} />
          {/* Max regalado o prueba sin tarjeta: aquí mismo puede suscribirse (el cobro empieza cuando se acaban sus días) */}
          {badge?.daysLeft ? <BuyPlans /> : null}
          <Link href="/ajustes" className="btn btn-secondary">
            {t('manage')}
          </Link>
          <ExtraPlans student={badge?.student ? badge.studentUntil ?? null : undefined} />
        </div>
      </>
    )

  const isPlus = status.plan === 'PLUS'
  const year = plans.find(p => p.tier === tier && p.interval === 'YEAR')!
  const month = plans.find(p => p.tier === tier && p.interval === 'MONTH')!
  const saving = Math.round((1 - Number(year.price) / (Number(month.price) * 12)) * 100)
  return (
    <>
      <TopBar close="/inicio" />
      <div className="pad">
        <h1 className="t-large">{isPlus ? t('upgradeTitle') : t('title')}</h1>
        {canceled && <div className="banner">{t('payCanceled')}</div>}
        {isPlus && <p className="t-body muted m-0">{t('youAre', { plan: 'Plus' })}</p>}
        {!isPlus && (
          <Seg
            label={t('choosePlan')}
            value={tier}
            onChange={setTier}
            options={[
              { value: 'PLUS', label: 'Plus' },
              { value: 'PREMIUM', label: 'Max' },
            ]}
          />
        )}
        <p className="t-foot m-0">{t(tier === 'PLUS' ? 'plusPitch' : 'maxPitch')}</p>
        {/* Primero qué incluye; después cómo pagarlo (antes la lista salía debajo del botón de pago) */}
        <FeatureList features={features(isPlus ? 'PREMIUM' : tier)} />
        <b className="t-head mt-1">{t('chooseBilling')}</b>
        <button className="opt" aria-pressed={interval === 'YEAR'} onClick={() => setInterval_('YEAR')}>
          <span className="flex-1">
            <b>{t('yearly')}</b>
            <br />
            <span className="t-foot">{t('yearlyPrice', { price: money(year.price, 'EUR', locale), month: money(Number(year.price) / 12, 'EUR', locale) })}</span>
            {year.student && year.regularPrice && <Was price={money(year.regularPrice, 'EUR', locale)} />}
          </span>
          <span className="chip" style={{ background: 'var(--up)', color: '#fff' }}>
            −{saving} %
          </span>
        </button>
        <button className="opt" aria-pressed={interval === 'MONTH'} onClick={() => setInterval_('MONTH')}>
          <span className="flex-1">
            <b>{t('monthly')}</b>
            <br />
            <span className="t-foot">{t('monthlyPrice', { price: money(month.price, 'EUR', locale) })}</span>
            {month.student && month.regularPrice && <Was price={money(month.regularPrice, 'EUR', locale)} />}
          </span>
        </button>
        {session?.isGuest ? (
          <Link href="/guardar" className="btn btn-primary">
            {t('guestSave')}
          </Link>
        ) : badge && !isPlus && !badge.trialUsed && !badge.trialUnlocked && !badge.payments ? (
          <div className="card flex flex-col gap-2.5" style={{ background: 'color-mix(in srgb, var(--brand) 10%, var(--surface))' }}>
            <b>{t('lockedTitle')}</b>
            <span className="t-foot">{t('lockedBody', { n: badge.trialStreak, s: Math.min(badge.streak, badge.trialStreak) })}</span>
            <span className="block h-2 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
              <span className="block h-full rounded-full" style={{ width: `${Math.min(1, badge.streak / badge.trialStreak) * 100}%`, background: 'var(--brand)' }} />
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/clases" className="btn btn-primary btn-sm">
                {t('lockedCta')}
              </Link>
              <Link href="/perfil/invitar" className="btn btn-secondary btn-sm">
                {t('inviteCta')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <TestCardNote />
            <button className="btn btn-primary" onClick={() => checkout.mutate()}>
              {isPlus ? t('upgradeCta') : badge?.payments && (badge.trialUsed || !badge.trialUnlocked) ? t('subscribe', { plan: PLAN_NAME[tier] }) : t('tryFree', { days: chosen.trialDays, plan: PLAN_NAME[tier] })}
            </button>
          </>
        )}
        <p className="t-cap m-0 text-center">{t(badge?.payments && !isPlus && !badge.trialUsed && badge.trialUnlocked ? 'after' : 'chargedNow', { price: money(chosen.price, 'EUR', locale), per: chosen.interval === 'YEAR' ? t('perYear') : t('perMonth') })}</p>
        <p className="t-cap m-0 text-center">
          {t.rich('purchaseTerms', {
            terms: c => (
              <Link href="/legal/contratacion" className="font-bold underline">
                {c}
              </Link>
            ),
          })}
        </p>
        <div className="banner banner-info">{t('demoNote')}</div>
        <ExtraPlans student={badge?.student ? badge.studentUntil ?? null : undefined} />
      </div>
    </>
  )
}

/** Precio normal tachado (cuando tiene precio de estudiante) */
function Was({ price }: { price: string }) {
  const t = useTranslations('billing')
  return (
    <span className="t-cap block">
      <s aria-label={t('was', { price })}>{price}</s> · {t('studentPrice')}
    </span>
  )
}

/** Debajo de los planes: precio de estudiante (o hasta cuándo lo tiene) y plan de grupo */
function ExtraPlans({ student }: { student?: string | null }) {
  const t = useTranslations('billing')
  const locale = useLang()
  const { data: session } = useSession()
  return (
    <div className="list">
      {student !== undefined ? (
        <div className="li plainline">
          <Icon name="check" size={18} />
          <span className="flex-1">{t('studentActive', { date: student ? new Date(student).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '' })}</span>
        </div>
      ) : (
        !session?.isGuest && (
          <Link href="/estudiante" className="li plainline justify-between">
            <span className="min-w-0 flex-1">
              <b>{t('studentLink')}</b>
              <br />
              <span className="t-foot">{t('studentLinkBody')}</span>
            </span>
            <Icon name="chev" size={18} />
          </Link>
        )
      )}
      <Link href="/grupo" className="li plainline justify-between">
        <span className="min-w-0 flex-1">
          <b>{t('groupLink')}</b>
          <br />
          <span className="t-foot">{t('groupLinkBody')}</span>
        </span>
        <Icon name="chev" size={18} />
      </Link>
    </div>
  )
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <div className="card flex flex-col gap-3">
      {features.map(f => (
        <div key={f} className="flex items-center gap-2.5">
          <span className="check on h-[22px] w-[22px] rounded-full">
            <Icon name="check" size={13} strokeWidth={2.6} />
          </span>
          <span className="t-body">{f}</span>
        </div>
      ))}
    </div>
  )
}

// ── Ajustes (06.3) ───────────────────────────────────────
export function Settings() {
  const t = useTranslations('settings')
  const tb = useTranslations('billing')
  const locale = useLocale()
  const path = usePathname()
  const router = useRouter()
  const toast = useToast()
  const qc = useQueryClient()
  const { data: s, isError, refetch } = useSettings()
  const { data: me } = useMe()
  const { data: status } = useQuery({ queryKey: ['billing'], queryFn: api.billingStatus })
  const save = useMutation({
    mutationFn: (patch: Partial<SettingsT> & { name?: string; companionName?: string }) => api.updateSettings(patch),
    onSuccess: () => qc.invalidateQueries(),
  })
  const cancel = useMutation({
    mutationFn: api.cancelSubscription,
    onSuccess: r => {
      if (r.url) return window.location.assign(r.url)
      qc.invalidateQueries()
      toast(t('cancelled'))
    },
  })
  const portal = useMutation({ mutationFn: api.billingPortal, onSuccess: r => window.location.assign(r.url), onError: e => toast(e instanceof ApiFailure ? e.message : t('error')) })
  const { data: badge } = usePlanBadge()
  const [name, setName] = useState<string | null>(null)
  if (isError) return <ErrorState onRetry={refetch} />
  if (!s || !me || !status) return <PageSkeleton />
  const setTheme = (theme: SettingsT['theme']) => {
    applyTheme(theme)
    save.mutate({ theme })
  }
  const setLocale = (l: SettingsT['locale']) => {
    save.mutate({ locale: l })
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`
    router.replace(path, { locale: l })
  }
  const pref = (type: string) => s.notificationPrefs[type] ?? { inApp: true, email: false, push: false }
  const setPref = (types: string[], channel: 'inApp' | 'email' | 'push', v: boolean) =>
    save.mutate({ notificationPrefs: { ...s.notificationPrefs, ...Object.fromEntries(types.map(k => [k, { ...pref(k), [channel]: v }])) } })
  const groups: { key: string; types: string[] }[] = [
    { key: 'streak', types: ['STREAK_RISK'] },
    { key: 'orders', types: ['ORDER_FILLED', 'PRICE_ALERT'] },
    { key: 'progress', types: ['ACHIEVEMENT', 'LEAGUE_RESULT', 'NEW_LESSON'] },
  ]
  return (
    <>
      <TopBar back="/perfil" title={t('title')} />
      <div className="pad">
        <Section>{t('subscription')}</Section>
        <div className="list">
          <div className="li plainline justify-between">
            <span>{t('plan')}</span>
            <b>{me.plan === 'FREE' ? 'Free' : status.status === 'GROUP' ? `${PLAN_NAME[me.plan]} · ${tb('settingsGroup')}` : status.status === 'GIFT' ? `${PLAN_NAME[me.plan]} · ${t('gift')}` : `${PLAN_NAME[me.plan]} · ${status.interval === 'YEAR' ? t('yearly') : t('monthly')}`}</b>
          </div>
          {me.plan !== 'FREE' && status.status === 'GROUP' ? (
            // Plan de grupo: se gestiona en /grupo (aquí no hay nada que cancelar)
            <Link href="/grupo" className="li plainline justify-between">
              <span className="min-w-0 flex-1">
                {tb('seeGroup')}
                <br />
                <span className="t-cap">{badge?.group?.owner ? tb('group.manageHint') : tb('settingsGroupLeave')}</span>
              </span>
              <Icon name="chev" size={18} />
            </Link>
          ) : me.plan !== 'FREE' && status.status === 'GIFT' ? (
            <>
              {status.trialEndsAt && (
                <div className="li plainline justify-between">
                  <span>{t('giftEnds')}</span>
                  <b>{new Date(status.trialEndsAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</b>
                </div>
              )}
              <Link href="/perfil/invitar" className="li plainline justify-between">
                <span>{t('giftMore')}</span>
                <Icon name="chev" size={18} />
              </Link>
            </>
          ) : me.plan !== 'FREE' ? (
            <>
              {status.renewsAt && (
                <div className="li plainline justify-between">
                  <span>{status.status === 'TRIALING' ? t('trialEnds') : t('nextCharge')}</span>
                  <b>{new Date(status.renewsAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</b>
                </div>
              )}
              {badge?.payments && (status.status === 'ACTIVE' || status.status === 'TRIALING' || status.status === 'PAST_DUE') && (
                <button className="li plainline justify-between" onClick={() => portal.mutate()} disabled={portal.isPending}>
                  <span>{t('manageSub')}</span>
                  <Icon name="chev" size={18} />
                </button>
              )}
              <button className="li plainline justify-between" onClick={() => confirm(t('cancelConfirm')) && cancel.mutate()}>
                <span style={{ color: 'var(--down)' }}>{t('cancel')}</span>
                <Icon name="chev" size={18} />
              </button>
            </>
          ) : (
            <Link href="/premium" className="li plainline justify-between">
              <span>{t('upgrade')}</span>
              <Icon name="chev" size={18} />
            </Link>
          )}
        </div>

        <Section>{t('profile')}</Section>
        <div className="list">
          <div className="li plainline flex-col items-stretch gap-2">
            <label htmlFor="s-name">{t('name')}</label>
            <div className="flex gap-2">
              <input id="s-name" className="input" value={name ?? me.name} onChange={e => setName(e.target.value)} maxLength={30} />
              <button className="btn btn-secondary btn-sm" disabled={!name || name === me.name} onClick={() => save.mutate({ name: name!.trim() }, { onSuccess: () => (setName(null), toast(t('saved'))) })}>
                {t('save')}
              </button>
            </div>
          </div>
          <div className="li plainline flex-col items-stretch gap-2">
            <span>{t('gender')}</span>
            <Seg<GenderT> label={t('gender')} value={s.gender} onChange={g => save.mutate({ gender: g })} options={(['F', 'M', 'N'] as const).map(g => ({ value: g, label: t(`genders.${g}`) }))} />
          </div>
        </div>

        <Section>{t('preferences')}</Section>
        <div className="list">
          <div className="li plainline flex-col items-stretch gap-2">
            <span>{t('language')}</span>
            <Seg label={t('language')} value={locale as SettingsT['locale']} onChange={setLocale} options={routing.locales.map(l => ({ value: l, label: t(`languages.${l}`) }))} />
          </div>
          <div className="li plainline flex-col items-stretch gap-2">
            <span>{t('currency')}</span>
            <Seg label={t('currency')} value={s.currency} onChange={c => save.mutate({ currency: c })} options={[{ value: 'EUR', label: 'EUR €' }, { value: 'USD', label: 'USD $' }]} />
          </div>
          <div className="li plainline flex-col items-stretch gap-2">
            <span>{t('dailyGoal')}</span>
            <Seg label={t('dailyGoal')} value={String(s.dailyGoalMinutes)} onChange={m => save.mutate({ dailyGoalMinutes: Number(m) as SettingsT['dailyGoalMinutes'] })} options={['5', '10', '15', '20', '30'].map(m => ({ value: m, label: `${m} min` }))} />
          </div>
          <div className="li plainline flex-col items-stretch gap-2">
            <span>{t('theme')}</span>
            <Seg label={t('theme')} value={s.theme} onChange={setTheme} options={(['AUTO', 'LIGHT', 'DARK'] as const).map(k => ({ value: k, label: t(`themes.${k}`) }))} />
          </div>
        </div>

        <Section>{t('notifications')}</Section>
        <div className="list">
          <div className="li plainline t-cap font-bold">
            <span className="flex-1" />
            <span className="w-[51px] text-center">{t('inApp')}</span>
            <span className="w-[51px] text-center">{t('mobile')}</span>
          </div>
          {groups.map(g => (
            <div key={g.key} className="li plainline">
              <span className="flex-1">{t(`notif.${g.key}`)}</span>
              <Toggle label={`${t(`notif.${g.key}`)} · ${t('inApp')}`} checked={pref(g.types[0]).inApp} onChange={v => setPref(g.types, 'inApp', v)} />
              <Toggle label={`${t(`notif.${g.key}`)} · ${t('mobile')}`} checked={pref(g.types[0]).push} onChange={v => setPref(g.types, 'push', v)} />
            </div>
          ))}
        </div>
        <div className="list">
          <PushToggle />
        </div>

        <Section>{t('soundSection')}</Section>
        <div className="list">
          <div className="li plainline">
            <span className="flex-1">
              {t('sound')}
              <br />
              <span className="t-cap">{t('soundNote')}</span>
            </span>
            <Toggle
              label={t('sound')}
              checked={!!s.sound}
              onChange={v => {
                save.mutate({ sound: v })
                // Al encenderlo se oye una muestra (y así el navegador deja sonar después)
                if (v) playFx('right')
              }}
            />
          </div>
        </div>

        <Section>{t('privacy')}</Section>
        <div className="list">
          <div className="li plainline">
            <span className="flex-1">
              {t('leagueVisible')}
              <br />
              <span className="t-cap">{t('leagueVisibleNote')}</span>
            </span>
            <Toggle label={t('leagueVisible')} checked={s.leagueVisible} onChange={v => save.mutate({ leagueVisible: v })} />
          </div>
        </div>

        <Section>{t('accountSection')}</Section>
        <div className="list">
          <Link href="/ajustes/cuenta" className="li plainline justify-between">
            <span>{t('account')}</span>
            <Icon name="chev" size={18} />
          </Link>
        </div>
        <Section>{t('helpSection')}</Section>
        <div className="list">
          <Link href="/ayuda" className="li plainline justify-between">
            <span>{t('help')}</span>
            <Icon name="chev" size={18} />
          </Link>
        </div>
        <Section>{t('legal')}</Section>
        <div className="list">
          {(['aviso-legal', 'privacidad', 'cookies', 'terminos', 'contratacion'] as const).map(slug => (
            <Link key={slug} href={`/legal/${slug}`} className="li plainline justify-between">
              <span>{t(`legalDocs.${slug}`)}</span>
              <Icon name="chev" size={18} />
            </Link>
          ))}
        </div>
        <p className="t-cap m-0 text-center">{t('version')}</p>
      </div>
    </>
  )
}

/** Cambiar la contraseña o crear una (si la cuenta solo entraba con Google) */
function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const t = useTranslations('account')
  const ta = useTranslations('auth')
  const toast = useToast()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const m = useMutation({
    mutationFn: () => api.setPassword(hasPassword ? current : undefined, next),
    onSuccess: () => {
      setOpen(false)
      setCurrent('')
      setNext('')
      qc.invalidateQueries({ queryKey: ['login-methods'] })
      toast(hasPassword ? t('passwordChanged') : t('passwordCreated'))
    },
  })
  const err = m.error instanceof ApiFailure ? m.error : null
  if (!open)
    return (
      <button className="li plainline flex-col items-stretch gap-0.5 text-left" onClick={() => setOpen(true)}>
        <span className="flex items-center justify-between">
          <span>{hasPassword ? t('changePassword') : t('createPassword')}</span>
          <Icon name="chev" size={18} />
        </span>
        {!hasPassword && <span className="t-cap">{t('createPasswordNote')}</span>}
      </button>
    )
  return (
    <form
      className="li plainline flex-col items-stretch gap-2"
      onSubmit={e => {
        e.preventDefault()
        m.mutate()
      }}
    >
      <b>{hasPassword ? t('changePassword') : t('createPassword')}</b>
      {hasPassword && (
        <div className="field">
          <label htmlFor="pw-cur">{t('currentPassword')}</label>
          <input id="pw-cur" className="input" type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} />
        </div>
      )}
      <div className="field">
        <label htmlFor="pw-new">{t('newPassword')}</label>
        <input id="pw-new" className="input" type="password" autoComplete="new-password" required value={next} onChange={e => setNext(e.target.value)} aria-invalid={err?.code === 'WEAK_PASSWORD'} />
        <span className={err?.code === 'WEAK_PASSWORD' ? 'err' : 't-cap'}>{ta('passwordRule')}</span>
      </div>
      {err && err.code !== 'WEAK_PASSWORD' && <p className="err m-0">{ta.has(`errors.${err.code}`) ? ta(`errors.${err.code}`) : err.message}</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" className="btn btn-secondary btn-sm w-full" onClick={() => setOpen(false)}>
          {t('cancel')}
        </button>
        <button className="btn btn-primary btn-sm w-full" disabled={m.isPending}>
          {t('savePassword')}
        </button>
      </div>
    </form>
  )
}

// ── Cuenta, cartera y privacidad (06.4) ──────────────────
export function Account() {
  const t = useTranslations('account')
  const locale = useLang()
  const toast = useToast()
  const router = useRouter()
  const qc = useQueryClient()
  const { data: me } = useMe()
  const { data: pf } = usePortfolio()
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')
  const reset = useMutation({
    mutationFn: api.resetPortfolio,
    onSuccess: () => (qc.invalidateQueries(), setConfirmReset(false), toast(t('resetDone'))),
    onError: e => toast(e instanceof ApiFailure ? e.message : t('error')),
  })
  const exportData = useMutation({
    mutationFn: api.exportData,
    onSuccess: json => {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'lumi-mis-datos.json'
      a.click()
      URL.revokeObjectURL(url)
    },
    onError: e => toast(e instanceof ApiFailure ? e.message : t('error')),
  })
  const { data: login } = useQuery({ queryKey: ['login-methods'], queryFn: api.loginMethods })
  const tg = useTranslations('guest')
  const logout = useMutation({ mutationFn: api.signOut, onSuccess: () => (qc.clear(), router.replace('/')) })
  const del = useMutation({ mutationFn: api.deleteAccount, onSuccess: () => (qc.clear(), router.replace('/')) })
  if (!me || !pf || !login) return <PageSkeleton />
  const start = me.plan !== 'FREE' ? 50000 : 10000
  const word = t('deleteWord')
  return (
    <>
      <TopBar back="/ajustes" title={t('title')} />
      <div className="pad">
        <div className="list">
          {login.isGuest ? (
            <Link href="/guardar" className="li plainline flex-col items-stretch gap-1">
              <b>{tg('saveTitle')}</b>
              <span className="t-foot">{tg('accountNote')}</span>
            </Link>
          ) : (
            <>
              <div className="li plainline justify-between">
                <span>Email</span>
                <span className="muted truncate">{me.email}</span>
              </div>
              <div className="li plainline justify-between">
                <span>{t('linked')}</span>
                <span className="muted">{[login.hasPassword && t('withPassword'), login.google && 'Google'].filter(Boolean).join(' · ')}</span>
              </div>
              <PasswordForm hasPassword={login.hasPassword} />
            </>
          )}
        </div>

        <div className="list">
          <div className="li plainline flex-col items-stretch gap-2">
            <b>{t('resetTitle')}</b>
            <span className="t-foot">{t('resetBody', { amount: money(start, 'EUR', locale), n: pf.resetsLeft })}</span>
            {confirmReset ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button className="btn btn-secondary btn-sm w-full" onClick={() => setConfirmReset(false)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-danger btn-sm w-full" disabled={reset.isPending} onClick={() => reset.mutate()}>
                  {t('reset')}
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm" disabled={!pf.resetsLeft} onClick={() => setConfirmReset(true)}>
                {t('reset')}
              </button>
            )}
          </div>
        </div>

        <div className="list">
          <button className="li plainline justify-between" onClick={() => exportData.mutate()}>
            <span>{t('export')}</span>
            <span className="muted flex items-center gap-1">
              JSON <Icon name="download" size={16} />
            </span>
          </button>
          <div className="li plainline justify-between">
            <span>{t('disclaimer')}</span>
            <span className="muted">v1</span>
          </div>
          <button className="li plainline" onClick={() => (!login.isGuest || confirm(tg('logoutWarning'))) && logout.mutate()} style={{ color: 'var(--down)', fontWeight: 700 }}>
            {t('logout')}
          </button>
        </div>

        <div className="list">
          <div className="li plainline flex-col items-stretch gap-2">
            <b style={{ color: 'var(--down)' }}>{t('deleteTitle')}</b>
            <span className="t-foot">{t('deleteBody')}</span>
            <label htmlFor="del" className="t-cap">
              {t('deleteType', { word })}
            </label>
            <input id="del" className="input" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} autoComplete="off" />
            <button className="btn btn-danger btn-sm" disabled={confirmDelete.trim().toUpperCase() !== word || del.isPending} onClick={() => del.mutate()}>
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
