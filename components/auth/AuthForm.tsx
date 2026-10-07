'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProviders, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Icon, ICONS } from '@/components/ui/Icon'
import { btnPrimary, btnSecondary, input } from '@/components/ui/styles'

type Mode = 'signup' | 'login'

/** Pantalla de registro / inicio de sesión del diseño móvil */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const params = useSearchParams()
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(params?.get('error') ? 'No se pudo iniciar sesión. Inténtalo de nuevo.' : '')
  const [hasGoogle, setHasGoogle] = useState(false)

  useEffect(() => {
    getProviders().then(p => setHasGoogle(!!p?.google)).catch(() => {})
  }, [])

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())
  const pwOk = pw.length >= 8
  const nameOk = !isSignup || name.trim().length >= 2
  const callbackUrl = params?.get('callbackUrl') ?? '/dashboard'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!emailOk || !pwOk || !nameOk) { setTouched(true); return }
    setLoading(true)
    try {
      if (isSignup) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password: pw }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { setError(data.error ?? 'No se pudo crear la cuenta'); return }
      }
      const r = await signIn('credentials', { email: email.trim(), password: pw, redirect: false })
      if (!r || r.error) {
        setError(isSignup ? 'Cuenta creada. Inicia sesión para continuar.' : 'Email o contraseña incorrectos.')
        if (isSignup) router.push('/login')
        return
      }
      router.push(isSignup ? '/onboarding' : callbackUrl)
      router.refresh()
    } catch {
      setError('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const field = (bad: boolean): React.CSSProperties => ({ ...input, borderColor: bad ? 'var(--red)' : 'var(--border)' })
  const err = (t: string) => <span style={{ font: '400 13px/18px var(--font)', color: 'var(--red)' }}>{t}</span>

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: 'calc(8px + env(safe-area-inset-top, 0px)) 16px 32px' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
        <Link href="/" aria-label="Volver" style={{ width: 44, height: 44, marginLeft: -12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={ICONS.back} size={22} />
        </Link>
      </div>
      <div style={{ maxWidth: 400, width: '100%', margin: '16px auto 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, font: '700 28px/34px var(--font)', letterSpacing: '-0.02em' }}>{isSignup ? 'Crea tu cuenta' : 'Hola de nuevo'}</h1>
          {isSignup && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 12, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-1)', font: '400 15px/20px var(--font)' }}>
              <span style={{ font: '500 12px var(--font)', padding: '2px 6px', borderRadius: 2, color: 'var(--green)', background: 'color-mix(in srgb, var(--green) 12%, transparent)', flex: 'none' }}>PRO</span>
              Al registrarte empiezas con 7 días de Pro gratis
            </div>
          )}
        </div>

        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isSignup && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ font: '500 13px var(--font)' }}>Nombre</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Cómo quieres que te llamemos" autoComplete="given-name" style={field(touched && !nameOk)} />
              {touched && !nameOk && err('Escribe tu nombre.')}
            </label>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '500 13px var(--font)' }}>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" inputMode="email" style={field(touched && !emailOk)} />
            {touched && !emailOk && err('Revisa el email, parece que falta algo.')}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', font: '500 13px var(--font)' }}>
              Contraseña
              {!isSignup && <Link href="/forgot-password" style={{ font: '500 13px var(--font)' }}>¿La has olvidado?</Link>}
            </span>
            <span style={{ position: 'relative', display: 'block' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder={isSignup ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                style={{ ...field(touched && !pwOk), paddingRight: 84 }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 0, top: 0, height: 44, padding: '0 12px', border: 'none', background: 'none', color: 'var(--blue)', font: '500 15px var(--font)', cursor: 'pointer' }}>
                {showPw ? 'Ocultar' : 'Mostrar'}
              </button>
            </span>
            {touched && !pwOk ? err('La contraseña necesita al menos 8 caracteres') : isSignup && (
              <span style={{ font: '400 13px/18px var(--font)', color: pwOk ? 'var(--green)' : 'var(--text-secondary)' }}>
                {pwOk ? 'Perfecto' : pw.length > 0 ? `${8 - pw.length} caracteres más` : 'Mínimo 8 caracteres'}
              </span>
            )}
          </label>
          {error && <span role="alert" style={{ font: '400 15px/20px var(--font)', color: 'var(--red)' }}>{error}</span>}
          <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 8, opacity: loading ? 0.6 : 1 }}>
            {loading ? (isSignup ? 'Creando cuenta…' : 'Entrando…') : isSignup ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        {hasGoogle && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, font: '400 13px var(--font)', color: 'var(--text-tertiary)' }}>
              <i style={{ flex: 1, height: 1, background: 'var(--border)' }} />o<i style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <button onClick={() => signIn('google', { callbackUrl: isSignup ? '/onboarding' : callbackUrl })} style={{ ...btnSecondary, height: 48, gap: 10 }}>
              <span style={{ width: 20, height: 20, border: '1px solid var(--border)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 12px var(--font)' }}>G</span>
              Continuar con Google
            </button>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, font: '400 15px var(--font)', color: 'var(--text-secondary)' }}>
          <span>
            {isSignup ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link href={isSignup ? '/login' : '/register'} style={{ font: '500 15px var(--font)' }}>{isSignup ? 'Inicia sesión' : 'Regístrate'}</Link>
          </span>
          {isSignup && (
            <span style={{ font: '400 12px/16px var(--font)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              Al continuar aceptas los <Link href="/terminos">Términos</Link> y la <Link href="/privacidad">Política de privacidad</Link>.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
