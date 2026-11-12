'use client'
// 02.1–02.5 · Acceso. Solo Google y email por ahora (Apple más adelante, D-008).
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { api, ApiFailure, type Session } from '../api'
import { useMe, useSession } from '../hooks'
import { Wordmark } from '../ui/icons'
import { TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

function GoogleButton({ onDone }: { onDone: (s: Session) => void }) {
  const t = useTranslations('auth')
  const { data: session } = useSession()
  const m = useMutation({ mutationFn: api.signInWithGoogle, onSuccess: onDone })
  // Mientras no se sabe si hay Google, se guarda su hueco: así el botón «Entrar» no se mueve al aparecer (auditoría APP-10)
  if (!session) return <div className="btn" aria-hidden="true" style={{ visibility: 'hidden' }} />
  // Solo cuando Google está configurado en el servidor
  if (!session.googleEnabled) return null
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
  if (data && !data.googleEnabled) return null
  return (
    <div className="t-cap text-center" aria-hidden={data ? undefined : true} style={data ? undefined : { visibility: 'hidden' }}>
      {t('orEmail')}
    </div>
  )
}

/**
 * Frase con los enlaces a los Términos y a la Privacidad. Va allí donde se crea una cuenta o se piden datos
 * (RGPD art. 13: informar en el momento de recogerlos). `newTab` abre los textos en otra pestaña para no perder
 * lo que la persona lleva escrito.
 */
export function LegalNote({ ns, k, className = 't-cap my-1', newTab = false }: { ns: 'auth' | 'onboarding'; k: string; className?: string; newTab?: boolean }) {
  const t = useTranslations(ns)
  const extra = newTab ? { target: '_blank', rel: 'noopener' } : {}
  return (
    <p className={className}>
      {t.rich(k, {
        terms: c => (
          <Link href="/legal/terminos" className="font-bold underline" {...extra}>
            {c}
          </Link>
        ),
        privacy: c => (
          <Link href="/legal/privacidad" className="font-bold underline" {...extra}>
            {c}
          </Link>
        ),
      })}
    </p>
  )
}

/**
 * «Probar sin registrarme»: entra al momento con una cuenta de invitado. `terms` añade debajo la frase legal
 * (en la pantalla de registro ya está encima del botón, así que allí no se repite).
 */
export function GuestButton({ className = 'btn btn-plain', terms = false }: { className?: string; terms?: boolean }) {
  const t = useTranslations('auth')
  const done = useAfterAuth()
  const m = useMutation({ mutationFn: api.signInGuest, onSuccess: done })
  const err = m.error instanceof ApiFailure ? m.error : null
  return (
    <>
      <button type="button" className={className} onClick={() => m.mutate()} disabled={m.isPending}>
        {t('guest')}
      </button>
      {err && <p className="err m-0">{t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message}</p>}
      {terms && <LegalNote ns="auth" k="guestTerms" className="t-cap m-0 text-center" />}
    </>
  )
}

/** El invitado guarda su progreso: la misma cuenta pasa a tener email y contraseña */
export function SaveProgress() {
  const t = useTranslations('guest')
  const ta = useTranslations('auth')
  const qc = useQueryClient()
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  // Quien entró con la bienvenida corta aún no ha dicho cómo se llama: se le pregunta aquí
  const { data: me } = useMe()
  const [name, setName] = useState('')
  const askName = !!me && !me.name.trim()
  const m = useMutation({
    mutationFn: () => api.saveGuest(email, pass, askName ? name : undefined),
    onSuccess: s => {
      qc.setQueryData(['session'], s)
      qc.invalidateQueries()
    },
  })
  const err = m.error instanceof ApiFailure ? m.error : null
  const signedOut = session && !session.signedIn
  useEffect(() => {
    if (signedOut) router.replace('/registro')
  }, [signedOut, router])
  return (
    <>
      <TopBar back="/inicio" title={<Wordmark size={18} />} />
      {m.isSuccess || (session && session.signedIn && !session.isGuest) ? (
        <div className="pad items-center pt-10 text-center">
          <Lumi mood="CELEBRATE" size={72} />
          <h1 className="t-title">{t('savedTitle')}</h1>
          <p className="t-foot">{t('savedBody')}</p>
          <Link href="/inicio" className="btn btn-primary">
            {t('continue')}
          </Link>
        </div>
      ) : (
        <form
          className="pad"
          onSubmit={e => {
            e.preventDefault()
            m.mutate()
          }}
        >
          <h1 className="t-large">{t('saveTitle')}</h1>
          <p className="t-foot m-0">{t('saveIntro')}</p>
          {askName && (
            <div className="field">
              <label htmlFor="g-name">{t('nameField')}</label>
              <input id="g-name" className="input" value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" maxLength={30} required />
            </div>
          )}
          <div className="field">
            <label htmlFor="g-email">Email</label>
            <input id="g-email" className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} aria-invalid={err?.code === 'VALIDATION_ERROR' || err?.code === 'EMAIL_IN_USE'} />
          </div>
          <div className="field">
            <label htmlFor="g-pass">{ta('password')}</label>
            <PasswordInput id="g-pass" value={pass} onChange={setPass} invalid={err?.code === 'WEAK_PASSWORD'} isNew />
            <span className={err?.code === 'WEAK_PASSWORD' ? 'err' : 't-cap'}>{ta('passwordRule')}</span>
          </div>
          {err && err.code !== 'WEAK_PASSWORD' && <p className="err m-0">{ta.has(`errors.${err.code}`) ? ta(`errors.${err.code}`) : err.message}</p>}
          <button className="btn btn-primary" disabled={m.isPending}>
            {t('save')}
          </button>
        </form>
      )}
    </>
  )
}

function useAfterAuth() {
  const qc = useQueryClient()
  const router = useRouter()
  return (s: Session) => {
    qc.clear()
    router.replace(s.onboardingStep !== null ? '/onboarding' : '/inicio')
  }
}

function PasswordInput({ id, value, onChange, invalid, isNew }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; isNew?: boolean }) {
  const t = useTranslations('auth')
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} className="input pr-16" type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={isNew ? 'new-password' : 'current-password'} required aria-invalid={invalid} />
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
      <TopBar back="/" title={<Wordmark size={18} />} />
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
          <PasswordInput id="f-pass" value={pass} onChange={setPass} invalid={err?.code === 'WEAK_PASSWORD'} isNew />
          <span className={err?.code === 'WEAK_PASSWORD' ? 'err' : 't-cap'}>{t('passwordRule')}</span>
        </div>
        {err && err.code !== 'WEAK_PASSWORD' && <p className="err m-0">{t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message}</p>}
        <LegalNote ns="auth" k="acceptTerms" />
        <button className="btn btn-primary" disabled={m.isPending}>
          {t('signUp')}
        </button>
        <GuestButton />
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
  const m = useMutation({
    mutationFn: async () => {
      const s = await api.signIn(email.trim(), pass)
      // La contraseña es buena pero la cuenta está bloqueada: el servidor no da sesión. Se dice, en vez de volver aquí sin más
      if (!s.signedIn) {
        await api.signOut().catch(() => {})
        throw new ApiFailure('ACCOUNT_BLOCKED', 'Cuenta bloqueada', 403)
      }
      return s
    },
    onSuccess: done,
  })
  const err = m.error instanceof ApiFailure ? m.error : null
  const errText = !m.isError ? null : !err ? t('errors.INTERNAL') : err.code === 'INVALID_CREDENTIALS' || err.status === 401 ? t('errors.INVALID_CREDENTIALS') : t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : t('errors.INTERNAL')
  return (
    <>
      <TopBar back="/" title={<Wordmark size={18} />} />
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
        {errText && <p className="err m-0">{errText}</p>}
        <button className="btn btn-primary" disabled={m.isPending}>
          {t('signIn')}
        </button>
        <GuestButton terms />
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
  const { data: session } = useSession()
  const params = useSearchParams()
  const token = params.get('token')
  const expired = params.get('error') === 'INVALID_TOKEN'
  if (!session) return null
  return (
    <>
      <TopBar back="/entrar" />
      <div className="pad">
        <h1 className="t-large">{t('forgotTitle')}</h1>
        {!session.mailEnabled ? (
          <>
            <div className="card flex items-center gap-3">
              <Lumi mood="CALM" size={40} />
              <span className="t-foot" style={{ color: 'var(--ink)' }}>
                {t('forgotSent')}
              </span>
            </div>
            <Link href="/#contacto" className="btn btn-secondary">
              {t('contact')}
            </Link>
          </>
        ) : token ? (
          <NewPassword token={token} />
        ) : (
          <AskLink expired={expired} />
        )}
      </div>
    </>
  )
}

function AskLink({ expired }: { expired: boolean }) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const m = useMutation({ mutationFn: () => api.forgotPassword(email.trim()) })
  const err = m.error instanceof ApiFailure ? m.error : null
  if (m.isSuccess)
    return (
      <div className="card flex items-center gap-3">
        <Lumi mood="HAPPY" size={40} />
        <span className="t-foot" style={{ color: 'var(--ink)' }}>
          {t('resetSent', { email: email.trim() })}
        </span>
      </div>
    )
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={e => {
        e.preventDefault()
        m.mutate()
      }}
    >
      {expired && <p className="err m-0">{t('resetExpired')}</p>}
      <p className="t-foot m-0">{t('resetAsk')}</p>
      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input id="f-email" className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!err} />
      </div>
      {err && <p className="err m-0">{t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message}</p>}
      <button className="btn btn-primary" disabled={m.isPending}>
        {t('resetSend')}
      </button>
    </form>
  )
}

function NewPassword({ token }: { token: string }) {
  const t = useTranslations('auth')
  const [pass, setPass] = useState('')
  const m = useMutation({ mutationFn: () => api.resetPassword(token, pass) })
  const err = m.error instanceof ApiFailure ? m.error : null
  if (m.isSuccess)
    return (
      <>
        <div className="card flex items-center gap-3">
          <Lumi mood="CELEBRATE" size={40} />
          <span className="t-foot" style={{ color: 'var(--ink)' }}>
            {t('resetDone')}
          </span>
        </div>
        <Link href="/entrar" className="btn btn-primary">
          {t('signIn')}
        </Link>
      </>
    )
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={e => {
        e.preventDefault()
        m.mutate()
      }}
    >
      <div className="field">
        <label htmlFor="f-pass">{t('newPassword')}</label>
        <PasswordInput id="f-pass" value={pass} onChange={setPass} invalid={err?.code === 'WEAK_PASSWORD'} isNew />
        <span className={err?.code === 'WEAK_PASSWORD' ? 'err' : 't-cap'}>{t('passwordRule')}</span>
      </div>
      {err && err.code !== 'WEAK_PASSWORD' && <p className="err m-0">{err.code === 'INVALID_TOKEN' || err.status === 400 ? t('resetExpired') : t.has(`errors.${err.code}`) ? t(`errors.${err.code}`) : err.message}</p>}
      <button className="btn btn-primary" disabled={m.isPending}>
        {t('resetSave')}
      </button>
    </form>
  )
}
