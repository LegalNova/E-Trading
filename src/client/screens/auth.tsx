'use client'
// 02.1–02.5 · Acceso. Solo Google y email por ahora (Apple más adelante, D-008).
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { api, ApiFailure, type Session } from '../api'
import { useSession } from '../hooks'
import { TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

function GoogleButton({ onDone }: { onDone: (s: Session) => void }) {
  const t = useTranslations('auth')
  const { data: session } = useSession()
  const m = useMutation({ mutationFn: api.signInWithGoogle, onSuccess: onDone })
  // Solo cuando Google está configurado en el servidor
  if (!session?.googleEnabled) return null
  return (
    <button className="btn btn-secondary" onClick={() => m.mutate()} disabled={m.isPending}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {t('google')}
    </button>
  )
}

function OrEmail() {
  const t = useTranslations('auth')
  const { data } = useSession()
  return data?.googleEnabled ? <div className="t-cap text-center">{t('orEmail')}</div> : null
}

function useAfterAuth() {
  const qc = useQueryClient()
  const router = useRouter()
  return (s: Session) => {
    qc.clear()
    router.replace(s.onboardingStep !== null ? '/onboarding' : '/inicio')
  }
}

function PasswordInput({ id, value, onChange, invalid }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const t = useTranslations('auth')
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} className="input pr-16" type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete="current-password" required aria-invalid={invalid} />
      <button type="button" className="link absolute top-1/2 right-2 -translate-y-1/2 text-sm" onClick={() => setShow(!show)}>
        {show ? t('hide') : t('show')}
      </button>
    </div>
  )
}

export function SignUp() {
  const t = useTranslations('auth')
  const done = useAfterAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const m = useMutation({ mutationFn: () => api.signUp(email.trim(), pass), onSuccess: done })
  const err = m.error instanceof ApiFailure ? m.error : null
  return (
    <>
      <TopBar back="/" />
      <form
        className="pad"
        onSubmit={e => {
          e.preventDefault()
          m.mutate()
        }}
      >
        <h1 className="t-large">{t('signUpTitle')}</h1>
        <GoogleButton onDone={done} />
        <OrEmail />
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input id="f-email" className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} aria-invalid={err?.code === 'VALIDATION_ERROR' || err?.code === 'EMAIL_IN_USE'} />
        </div>
        <div className="field">
          <label htmlFor="f-pass">{t('password')}</label>
          <PasswordInput id="f-pass" value={pass} onChange={setPass} invalid={err?.code === 'WEAK_PASSWORD'} />
          <span className={err?.code === 'WEAK_PASSWORD' ? 'err' : 't-cap'}>{t('passwordRule')}</span>
        </div>
        {err && err.code !== 'WEAK_PASSWORD' && <p className="err m-0">{t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message}</p>}
        <p className="t-cap my-1">
          {t.rich('acceptTerms', {
            terms: c => (
              <Link href="/legal/terminos" className="font-bold underline">
                {c}
              </Link>
            ),
            privacy: c => (
              <Link href="/legal/privacidad" className="font-bold underline">
                {c}
              </Link>
            ),
          })}
        </p>
        <button className="btn btn-primary" disabled={m.isPending}>
          {t('signUp')}
        </button>
        <p className="t-foot m-0 text-center">
          {t('haveAccount')}{' '}
          <Link href="/entrar" className="link">
            {t('signIn')}
          </Link>
        </p>
      </form>
    </>
  )
}

export function SignIn() {
  const t = useTranslations('auth')
  const done = useAfterAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const m = useMutation({ mutationFn: () => api.signIn(email.trim(), pass), onSuccess: done })
  return (
    <>
      <TopBar back="/" />
      <form
        className="pad"
        onSubmit={e => {
          e.preventDefault()
          m.mutate()
        }}
      >
        <h1 className="t-large">{t('signInTitle')}</h1>
        <GoogleButton onDone={done} />
        <OrEmail />
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input id="f-email" className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} aria-invalid={m.isError} />
        </div>
        <div className="field">
          <label htmlFor="f-pass">{t('password')}</label>
          <PasswordInput id="f-pass" value={pass} onChange={setPass} invalid={m.isError} />
        </div>
        <Link href="/recuperar" className="link self-start px-0 text-sm">
          {t('forgot')}
        </Link>
        {m.isError && <p className="err m-0">{t('errors.INVALID_CREDENTIALS')}</p>}
        <button className="btn btn-primary" disabled={m.isPending}>
          {t('signIn')}
        </button>
        <p className="t-foot m-0 text-center">
          {t('noAccount')}{' '}
          <Link href="/registro" className="link">
            {t('signUp')}
          </Link>
        </p>
      </form>
    </>
  )
}

export function Forgot() {
  const t = useTranslations('auth')
  return (
    <>
      <TopBar back="/entrar" />
      <div className="pad">
        <h1 className="t-large">{t('forgotTitle')}</h1>
        <div className="card flex items-center gap-3">
          <Lumi mood="CALM" size={40} />
          <span className="t-foot" style={{ color: 'var(--ink)' }}>
            {t('forgotSent')}
          </span>
        </div>
        <Link href="/#contacto" className="btn btn-secondary">
          {t('contact')}
        </Link>
      </div>
    </>
  )
}
