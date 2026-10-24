'use client'
// 01 · Landing pública
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { arrowPct, money, num } from '@/shared/format'
import { api, ApiFailure, type ContactInput } from '../api'
import { Icon, Wordmark } from '../ui/icons'
import { Lumi } from '../ui/lumi'

export function LanguageSwitch() {
  const locale = useLocale()
  const path = usePathname()
  const router = useRouter()
  return (
    <div className="flex gap-1 text-xs font-bold" role="group" aria-label="Idioma">
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
      <p className="t-cap m-0" role="status" style={m.isSuccess ? { color: 'var(--up)', fontWeight: 700 } : err ? { color: err.code === 'CONFLICT' ? 'var(--brand)' : 'var(--down)', fontWeight: 700 } : undefined}>
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

export function Landing() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: api.publicStats })
  const free = t.raw('freeFeatures') as string[]
  const premium = t.raw('premiumFeatures') as string[]
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-20 border-b" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 85%, transparent)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
            <Wordmark size={21} />
          </Link>
          <nav className="hidden flex-1 gap-5 text-sm font-semibold md:flex" style={{ color: 'var(--ink-2)' }}>
            <a href="#como">{t('navHow')}</a>
            <a href="#planes">{t('navPlans')}</a>
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

      <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div className="flex flex-col items-start gap-5">
          <h1 className="m-0 text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] md:text-[60px] md:leading-[62px]">{t('hero')}</h1>
          <p className="t-body m-0 max-w-[480px] text-[17px] leading-[26px]" style={{ color: 'var(--ink-2)' }}>
            {t('heroSub')}
          </p>
          <div className="flex w-full max-w-[460px] flex-col gap-2 sm:flex-row">
            <Link href="/registro" className="btn btn-primary sm:w-auto">
              {t('start')}
            </Link>
            <Link href="/entrar" className="btn btn-secondary sm:w-auto">
              {t('haveAccount')}
            </Link>
          </div>
          <div className="mt-2 w-full">
            <p className="t-foot mb-2 font-bold" style={{ color: 'var(--ink)' }}>
              {t('waitlistTitle')}
            </p>
            <Waitlist />
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[380px]">
          <div className="card flex flex-col gap-2 p-5 shadow-float">
            <span className="t-foot">{t('mockValue')}</span>
            <span className="big">{money(10482.35, 'EUR', locale)}</span>
            <span className="t-foot up font-bold">{t('mockReturn', { pct: num(4.82, locale, 2) })}</span>
            <svg viewBox="0 0 300 80" className="mt-2 h-20 w-full" aria-hidden="true">
              <path d="M0 62 L30 58 L60 64 L90 50 L120 54 L150 40 L180 44 L210 30 L240 34 L270 20 L300 14" fill="none" stroke="var(--up)" strokeWidth="2.4" />
            </svg>
          </div>
          <div className="card absolute -bottom-8 -left-2 flex max-w-[270px] items-center gap-3 shadow-float sm:-left-8">
            <Lumi mood="HAPPY" size={40} />
            <span className="t-foot" style={{ color: 'var(--ink)' }}>
              {t('mockLumi')}
            </span>
          </div>
        </div>
      </section>

      <Ticker />
      <p className="t-cap mx-auto mt-2 max-w-[1120px] px-4">{t('tickerNote')}</p>

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
        <div className="mt-3 grid grid-cols-3 gap-3">
          {(['activeUsers', 'lessonsCompleted', 'simulatedTrades'] as const).map(k => (
            <div key={k} className="stat">
              <b>{num(stats?.[k] ?? 0, locale, 0)}</b>
              <span className="t-cap">{t(`stats.${k}`)}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="planes" className="mx-auto max-w-[1120px] scroll-mt-16 px-4 pb-14">
        <h2 className="t-large mb-6">{t('plansTitle')}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card flex flex-col gap-3 p-6">
            <b className="t-head">Free</b>
            <span className="big">{money(0, 'EUR', locale).replace(/[.,]00/, '')}</span>
            {free.map(f => (
              <span key={f} className="t-body flex items-center gap-2">
                <Icon name="check" size={18} className="up" /> {f}
              </span>
            ))}
            <Link href="/registro" className="btn btn-secondary mt-2">
              {t('start')}
            </Link>
          </div>
          <div className="hero flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <b className="t-head">Premium</b>
              <span className="chip" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                {t('trial')}
              </span>
            </div>
            <span className="big">
              {money(7.99, 'EUR', locale)}
              <span className="t-foot" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                {' '}
                {t('perMonth', { year: money(59.99, 'EUR', locale) })}
              </span>
            </span>
            {premium.map(f => (
              <span key={f} className="t-body flex items-center gap-2">
                <Icon name="check" size={18} /> {f}
              </span>
            ))}
            <Link href="/registro" className="btn btn-primary mt-2">
              {t('tryPremium')}
            </Link>
          </div>
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
          <div className="t-cap flex gap-4">
            <Link href="/legal/aviso-legal">{t('legalNotice')}</Link>
            <Link href="/legal/privacidad">{t('privacy')}</Link>
            <Link href="/legal/cookies">{t('cookies')}</Link>
            <Link href="/legal/terminos">{t('terms')}</Link>
          </div>
          <LanguageSwitch />
        </div>
      </footer>
    </div>
  )
}
