'use client'
// 06 · Premium, ajustes, cuenta y privacidad (RGPD)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { GenderT, SettingsT } from '@/shared/contract'
import { money } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useMe, usePortfolio, useRefreshAll, useSettings } from '../hooks'
import { applyTheme, useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, Section, Seg, Toggle, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

// ── Premium (06.1–06.2) ──────────────────────────────────
export function Premium() {
  const t = useTranslations('premium')
  const locale = useLang()
  const refresh = useRefreshAll()
  const toast = useToast()
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: api.billingPlans })
  const { data: status } = useQuery({ queryKey: ['billing'], queryFn: api.billingStatus })
  const [plan, setPlan] = useState('premium-year')
  const [step, setStep] = useState<'choose' | 'confirming' | 'done'>('choose')
  const checkout = useMutation({
    mutationFn: () => api.checkout(plan),
    onMutate: () => setStep('confirming'),
    onSuccess: () => (refresh(), setStep('done')),
    onError: e => (setStep('choose'), toast(e instanceof ApiFailure ? e.message : t('failed'))),
  })
  const features = t.raw('features') as string[]
  if (!plans || !status) return <PageSkeleton />
  const year = plans.find(p => p.interval === 'YEAR')!
  const month = plans.find(p => p.interval === 'MONTH')!
  const chosen = plans.find(p => p.id === plan)!

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
        <h1 className="t-large">{t('welcome')}</h1>
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

  if (status.plan === 'PREMIUM')
    return (
      <>
        <TopBar close="/perfil" />
        <div className="pad">
          <h1 className="t-large">{t('youArePremium')}</h1>
          <p className="t-body muted m-0">{status.status === 'TRIALING' && status.trialEndsAt ? t('trialUntil', { date: new Date(status.trialEndsAt).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) }) : t('active')}</p>
          <FeatureList features={features} />
          <Link href="/ajustes" className="btn btn-secondary">
            {t('manage')}
          </Link>
        </div>
      </>
    )

  const monthlyFromYear = Number(year.price) / 12
  const saving = Math.round((1 - Number(year.price) / (Number(month.price) * 12)) * 100)
  return (
    <>
      <TopBar close="/inicio" />
      <div className="pad">
        <h1 className="t-large">{t('title')}</h1>
        <FeatureList features={features} />
        <button className="opt" aria-pressed={plan === year.id} onClick={() => setPlan(year.id)}>
          <span className="flex-1">
            <b>{t('yearly')}</b>
            <br />
            <span className="t-foot">{t('yearlyPrice', { price: money(year.price, 'EUR', locale), month: money(monthlyFromYear, 'EUR', locale) })}</span>
          </span>
          <span className="chip" style={{ background: 'var(--up)', color: '#fff' }}>
            −{saving} %
          </span>
        </button>
        <button className="opt" aria-pressed={plan === month.id} onClick={() => setPlan(month.id)}>
          <span className="flex-1">
            <b>{t('monthly')}</b>
            <br />
            <span className="t-foot">{t('monthlyPrice', { price: money(month.price, 'EUR', locale) })}</span>
          </span>
        </button>
        <button className="btn btn-primary" onClick={() => checkout.mutate()}>
          {t('tryFree', { days: chosen.trialDays })}
        </button>
        <p className="t-cap m-0 text-center">{t('after', { price: money(chosen.price, 'EUR', locale), per: chosen.interval === 'YEAR' ? t('perYear') : t('perMonth') })}</p>
        <div className="banner banner-info">{t('demoNote')}</div>
      </div>
    </>
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
  const cancel = useMutation({ mutationFn: api.cancelSubscription, onSuccess: () => (qc.invalidateQueries(), toast(t('cancelled'))) })
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
            <b>{me.plan === 'PREMIUM' ? `Premium · ${status.interval === 'YEAR' ? t('yearly') : t('monthly')}` : 'Free'}</b>
          </div>
          {me.plan === 'PREMIUM' ? (
            <>
              {status.renewsAt && (
                <div className="li plainline justify-between">
                  <span>{status.status === 'TRIALING' ? t('trialEnds') : t('nextCharge')}</span>
                  <b>{new Date(status.renewsAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</b>
                </div>
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
            <Seg label={t('dailyGoal')} value={String(s.dailyGoalMinutes)} onChange={m => save.mutate({ dailyGoalMinutes: Number(m) as SettingsT['dailyGoalMinutes'] })} options={['5', '10', '15', '20'].map(m => ({ value: m, label: `${m} min` }))} />
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
            <span className="w-[51px] text-center">Email</span>
          </div>
          {groups.map(g => (
            <div key={g.key} className="li plainline">
              <span className="flex-1">{t(`notif.${g.key}`)}</span>
              <Toggle label={`${t(`notif.${g.key}`)} · ${t('inApp')}`} checked={pref(g.types[0]).inApp} onChange={v => setPref(g.types, 'inApp', v)} />
              <Toggle label={`${t(`notif.${g.key}`)} · Email`} checked={pref(g.types[0]).email} onChange={v => setPref(g.types, 'email', v)} />
            </div>
          ))}
        </div>
        <p className="t-cap m-0 px-1">{t('pushNote')}</p>

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
        <Section>{t('legal')}</Section>
        <div className="list">
          {(['aviso-legal', 'privacidad', 'cookies', 'terminos'] as const).map(slug => (
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
      a.download = 'e-trading-mis-datos.json'
      a.click()
      URL.revokeObjectURL(url)
    },
  })
  const logout = useMutation({ mutationFn: api.signOut, onSuccess: () => (qc.clear(), router.replace('/')) })
  const del = useMutation({ mutationFn: api.deleteAccount, onSuccess: () => (qc.clear(), router.replace('/')) })
  if (!me || !pf) return <PageSkeleton />
  const start = me.plan === 'PREMIUM' ? 50000 : 10000
  const word = t('deleteWord')
  return (
    <>
      <TopBar back="/ajustes" title={t('title')} />
      <div className="pad">
        <div className="list">
          <div className="li plainline justify-between">
            <span>Email</span>
            <span className="muted truncate">{me.email}</span>
          </div>
          <button className="li plainline justify-between" onClick={() => toast(t('stage3'))}>
            <span>{t('changePassword')}</span>
            <Icon name="chev" size={18} />
          </button>
          <div className="li plainline justify-between">
            <span>{t('linked')}</span>
            <span className="muted">Google</span>
          </div>
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
          <button className="li plainline" onClick={() => logout.mutate()} style={{ color: 'var(--down)', fontWeight: 700 }}>
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
