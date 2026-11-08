'use client'
// 01 · Landing pública: «la forma fiable de aprender a invertir» (sin gurús, sin señales, sin promesas),
// qué la hace distinta, planes con sus precios reales, regalar Lumi, aviso legal y contacto.
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState, useSyncExternalStore } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { arrowPct, money, num } from '@/shared/format'
import { PRICES } from '@/shared/plans'
import { GuestButton } from './auth'
import { api, ApiFailure, type ContactInput } from '../api'
import { Icon, Wordmark } from '../ui/icons'
import { Lumi } from '../ui/lumi'
import { LandingGift } from './gifts'

export function LanguageSwitch() {
  const locale = useLocale()
  const path = usePathname()
  const router = useRouter()
  const ts = useTranslations('settings')
  return (
    <div className="flex gap-1 text-xs font-bold" role="group" aria-label={ts('language')}>
      {routing.locales.map(l => (
        <button key={l} onClick={() => router.replace(path, { locale: l })} aria-pressed={l === locale} className="rounded-md px-1.5 py-1 uppercase" style={{ color: l === locale ? 'var(--ink)' : 'var(--ink-3)' }}>
          {l}
        </button>
      ))}
    </div>
  )
}

function Waitlist() {
  const t = useTranslations('landing')
  const [email, setEmail] = useState('')
  const m = useMutation({ mutationFn: (e: string) => api.joinWaitlist(e) })
  const err = m.error instanceof ApiFailure ? m.error : null
  return (
    <form
      className="flex w-full max-w-[460px] flex-col gap-2"
      onSubmit={e => {
        e.preventDefault()
        m.mutate(email.trim())
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className="input flex-1" type="email" required placeholder={t('emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" aria-invalid={err?.code === 'VALIDATION_ERROR'} />
        <button className="btn btn-dark sm:w-auto" disabled={m.isPending}>
          {t('join')}
        </button>
      </div>
      <p className="t-cap m-0" role="status" style={m.isSuccess ? { color: 'var(--up)', fontWeight: 700 } : err ? { color: err.code === 'CONFLICT' ? 'var(--brand-ink)' : 'var(--down)', fontWeight: 700 } : undefined}>
        {m.isSuccess ? t('joined', { email }) : err?.code === 'CONFLICT' ? t('already') : err ? t('invalidEmail') : t('waitlistNote')}
      </p>
    </form>
  )
}

function Ticker() {
  const locale = useLocale()
  const t = useTranslations('landing')
  const { data } = useQuery({ queryKey: ['ticker'], queryFn: api.publicTicker, refetchInterval: 15_000 })
  if (!data) return <div className="h-[46px]" />
  const items = [...data, ...data]
  return (
    <div className="overflow-hidden border-y py-3" style={{ borderColor: 'var(--line)' }} aria-label={t('tickerLabel')}>
      <div className="flex w-max gap-8 whitespace-nowrap [animation:ticker_40s_linear_infinite] motion-reduce:[animation:none]">
        {items.map((x, i) => (
          <span key={i} className="flex gap-2 text-sm font-bold" aria-hidden={i >= data.length}>
            {x.name}
            <span className={x.changePct >= 0 ? 'up' : 'down'}>{arrowPct(x.changePct, locale)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Contact() {
  const t = useTranslations('landing')
  const [f, setF] = useState<ContactInput>({ name: '', email: '', reason: 'SCHOOL', message: '' })
  const m = useMutation({ mutationFn: () => api.contact(f) })
  if (m.isSuccess) return <p className="card t-body m-0">{t('contactThanks')}</p>
  return (
    <form
      className="card flex flex-col gap-3"
      onSubmit={e => {
        e.preventDefault()
        m.mutate()
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="c-name">{t('name')}</label>
          <input id="c-name" className="input" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="c-email">Email</label>
          <input id="c-email" className="input" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-reason">{t('reason')}</label>
        <select id="c-reason" className="input" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value as ContactInput['reason'] })}>
          {(['SCHOOL', 'PRESS', 'SUPPORT', 'OTHER'] as const).map(r => (
            <option key={r} value={r}>
              {t(`reasons.${r}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="c-msg">{t('message')}</label>
        <textarea id="c-msg" className="input min-h-28 py-3" required minLength={10} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
      </div>
      {m.isError && <p className="err m-0">{t('contactError')}</p>}
      <button className="btn btn-primary sm:w-auto sm:self-start" disabled={m.isPending}>
        {t('send')}
      </button>
    </form>
  )
}

/** Ahorro del plan anual frente a pagar 12 meses (redondeado; calculado con los precios reales) */
const savingPct = (month: number, year: number) => Math.round((1 - year / (month * 12)) * 100)

const WHY = [
  ['noTips', 'shield'],
  ['realData', 'chart'],
  ['noRisk', 'wallet'],
  ['course', 'learn'],
  ['transparent', 'info'],
] as const

export function Landing({ lessons }: { lessons: number }) {
  const t = useTranslations('landing')
  const t2 = useTranslations('landing2')
  const locale = useLocale()
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: api.publicStats })
  // Llega con el enlace de un amigo (?inv=código): se le dice quién le invita y qué gana
  const inv = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(location.search).get('inv'),
    () => null,
  )
  const { data: inviter } = useQuery({ queryKey: ['inviter', inv], queryFn: () => api.inviterName(inv!), enabled: !!inv, retry: false })
  const tp = useTranslations('premium')
  const free = t2.raw('freeFeatures') as string[]
  const plus = tp.raw('plusFeatures') as string[]
  const max = tp.raw('maxFeatures') as string[]
  return (
    <div className="min-h-dvh overflow-x-clip" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-20 border-b" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 85%, transparent)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
            <Wordmark size={21} />
          </Link>
          <nav className="hidden flex-1 gap-5 text-sm font-semibold md:flex" style={{ color: 'var(--ink-2)' }}>
            <a href="#porque">{t2('navWhy')}</a>
            <a href="#como">{t('navHow')}</a>
            <a href="#planes">{t('navPlans')}</a>
            <a href="#regalar">{t2('navGift')}</a>
            <a href="#contacto">{t('navSchools')}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href="/entrar" className="link">
              {t('signIn')}
            </Link>
            <Link href="/registro" className="btn btn-primary btn-sm hidden sm:flex">
              {t('start')}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-4 py-10 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div className="flex min-w-0 flex-col items-start gap-5">
          {inviter?.valid && (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'color-mix(in srgb, var(--brand) 12%, transparent)' }}>
              <Lumi mood="CELEBRATE" size={40} />
              <span>
                <b>{inviter.name ? t('invitedBy', { name: inviter.name }) : t('invited')}</b>
                <br />
                <span className="t-foot">{t('invitedSub')}</span>
              </span>
            </div>
          )}
          <h1 className="m-0 text-[36px] leading-[40px] font-extrabold tracking-[-0.03em] text-balance md:text-[58px] md:leading-[62px]">
            {t2('hero')}{' '}
            <span className="block" style={{ color: 'var(--brand-ink)' }}>
              {t2('heroTag')}
            </span>
          </h1>
          <p className="t-body m-0 max-w-[480px] text-[17px] leading-[26px]" style={{ color: 'var(--ink-2)' }}>
            {t2('heroSub')}
          </p>
          <div className="flex w-full max-w-[460px] flex-col gap-2 sm:flex-row">
            <Link href="/registro" className="btn btn-primary sm:w-auto">
              {t('start')}
            </Link>
            <Link href="/entrar" className="btn btn-secondary sm:w-auto">
              {t('haveAccount')}
            </Link>
          </div>
          <div className="-mt-2 flex flex-col items-start">
            <GuestButton className="link text-[15px] font-bold" />
            <span className="t-cap">{t('guestNote')}</span>
          </div>
          <div className="mt-2 w-full">
            <p className="t-foot mb-2 font-bold" style={{ color: 'var(--ink)' }}>
              {t('waitlistTitle')}
            </p>
            <Waitlist />
          </div>
        </div>
        {/* Ilustración de la app (cifras de ejemplo, marcadas como tal) */}
        <div className="relative mx-auto w-full max-w-[380px] pb-8" aria-hidden="true">
          <div className="card flex flex-col gap-2 p-5 shadow-float">
            <div className="flex items-center justify-between gap-2">
              <span className="t-foot">{t('mockValue')}</span>
              <span className="chip" style={{ background: 'var(--fill)' }}>
                {t2('example')}
              </span>
            </div>
            <span className="big">{money(10482.35, 'EUR', locale)}</span>
            <span className="t-foot up font-bold">{t('mockReturn', { pct: num(4.82, locale, 2) })}</span>
            <svg viewBox="0 0 300 80" className="mt-2 h-20 w-full">
              <path d="M0 62 L30 58 L60 64 L90 50 L120 54 L150 40 L180 44 L210 30 L240 34 L270 20 L300 14" fill="none" stroke="var(--up)" strokeWidth="2.4" />
            </svg>
          </div>
          <div className="card absolute bottom-0 left-2 flex max-w-[270px] items-center gap-3 shadow-float sm:-left-8">
            <Lumi mood="HAPPY" size={40} />
            <span className="t-foot" style={{ color: 'var(--ink)' }}>
              {t('mockLumi')}
            </span>
          </div>
        </div>
      </section>

      <Ticker />
      <p className="t-cap mx-auto mt-2 max-w-[1120px] px-4">{t('tickerNote')}</p>

      <section id="porque" className="mx-auto max-w-[1120px] scroll-mt-16 px-4 pt-14">
        <h2 className="t-large mb-2">{t2('whyTitle')}</h2>
        <p className="t-body mb-6 max-w-[620px]" style={{ color: 'var(--ink-2)' }}>
          {t2('whySub')}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(([k, icon]) => (
            <div key={k} className="card flex min-w-0 flex-col gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand) 14%, var(--surface))', color: 'var(--brand-ink)' }} aria-hidden="true">
                <Icon name={icon} size={20} />
              </span>
              <b className="t-head">{t2(`why.${k}.title`, { n: num(lessons, locale, 0) })}</b>
              <p className="t-foot m-0">{t2(`why.${k}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como" className="mx-auto max-w-[1120px] scroll-mt-16 px-4 py-14">
        <h2 className="t-large mb-6">{t('howTitle')}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {(['learn', 'practice', 'compete'] as const).map((k, i) => (
            <div key={k} className="card flex flex-col gap-2">
              <span className="ava ava-dark text-sm">{i + 1}</span>
              <b className="t-head">{t(`how.${k}.title`)}</b>
              <p className="t-foot m-0">{t(`how.${k}.body`)}</p>
            </div>
          ))}
        </div>
        {/* Cifras reales de la base de datos: solo se enseñan cuando han llegado (nunca un «0» mientras cargan) */}
        {stats && stats.activeUsers > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {(['activeUsers', 'lessonsCompleted', 'simulatedTrades'] as const).map(k => (
              <div key={k} className="stat min-w-0 px-3 sm:px-3.5">
                <b className="truncate">{num(stats[k], locale, 0)}</b>
                <span className="t-cap">{t(`stats.${k}`)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="planes" className="mx-auto max-w-[1120px] scroll-mt-16 px-4 pb-14">
        <h2 className="t-large mb-2">{t('plansTitle')}</h2>
        <p className="t-foot mb-6">{t2('plansSub')}</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between gap-2">
              <b className="t-head">Free</b>
              <span className="chip" style={{ background: 'var(--fill)' }}>
                {t2('freeTag')}
              </span>
            </div>
            <span className="big">{money(0, 'EUR', locale).replace(/[.,]00/, '')}</span>
            {free.map(f => (
              <span key={f} className="t-body flex items-start gap-2">
                <Icon name="check" size={18} className="up mt-0.5 flex-none" /> {f}
              </span>
            ))}
            <Link href="/registro" className="btn btn-secondary mt-auto">
              {t('start')}
            </Link>
          </div>
          {(
            [
              ['Plus', PRICES.normal.PLUS.MONTH, PRICES.normal.PLUS.YEAR, plus, false],
              ['Max', PRICES.normal.PREMIUM.MONTH, PRICES.normal.PREMIUM.YEAR, max, true],
            ] as const
          ).map(([name, month, year, feats, hero]) => (
            <div key={name} className={`${hero ? 'hero' : 'card'} flex flex-col gap-3 p-6`}>
              <div className="flex items-center justify-between gap-2">
                <b className="t-head">{name}</b>
                <span className="chip" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                  {t('trial')}
                </span>
              </div>
              <span className="flex flex-col">
                <span className="big">
                  {money(month, 'EUR', locale)}
                  <span className="t-foot" style={hero ? { color: 'rgb(255 255 255 / 0.6)' } : undefined}>
                    {t2('perMonth')}
                  </span>
                </span>
                <span className="t-foot font-semibold" style={hero ? { color: 'rgb(255 255 255 / 0.75)' } : undefined}>
                  {t2('orYear', { year: money(year, 'EUR', locale), pct: savingPct(month, year) })}
                </span>
              </span>
              {feats.map(f => (
                <span key={f} className="t-body flex items-start gap-2">
                  <Icon name="check" size={18} className={`mt-0.5 flex-none ${hero ? '' : 'up'}`} /> {f}
                </span>
              ))}
              <Link href="/registro" className={`btn ${hero ? 'btn-primary' : 'btn-secondary'} mt-auto`}>
                {t('tryPremium')}
              </Link>
            </div>
          ))}
        </div>
        <p className="t-cap mt-3 mb-0">{t('trialNote')}</p>
        <p className="t-cap mt-2 mb-0">{t2('studentNote', { plus: money(PRICES.student.PLUS.MONTH, 'EUR', locale), max: money(PRICES.student.PREMIUM.MONTH, 'EUR', locale) })}</p>
        <p className="t-cap mt-2 mb-0">{t2('groupNote')}</p>
      </section>

      <LandingGift />

      <section className="mx-auto max-w-[1120px] px-4 pb-14" aria-labelledby="aviso">
        <div className="card flex items-start gap-3" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <span className="mt-0.5 flex-none" style={{ color: 'var(--ink-2)' }} aria-hidden="true">
            <Icon name="info" size={20} />
          </span>
          <span className="min-w-0">
            <b id="aviso" className="t-head block">
              {t2('legalTitle')}
            </b>
            <span className="t-foot mt-1 block">{t2('legal')}</span>
          </span>
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-[760px] scroll-mt-16 px-4 pb-14">
        <h2 className="t-large mb-2">{t('contactTitle')}</h2>
        <p className="t-foot mb-5">{t('contactSub')}</p>
        <Contact />
      </section>

      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center">
          <Wordmark size={17} />
          <p className="t-cap m-0 max-w-[620px] flex-1">{t('legal')}</p>
          <div className="t-cap flex flex-wrap gap-x-4 gap-y-1.5">
            <Link href="/ayuda">{t('help')}</Link>
            <Link href="/legal/aviso-legal">{t('legalNotice')}</Link>
            <Link href="/legal/privacidad">{t('privacy')}</Link>
            <Link href="/legal/cookies">{t('cookies')}</Link>
            <Link href="/legal/terminos">{t('terms')}</Link>
            <Link href="/legal/contratacion">{t('purchase')}</Link>
          </div>
          <LanguageSwitch />
        </div>
      </footer>
    </div>
  )
}
