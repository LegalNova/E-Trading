'use client'
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      /* 1. Crear usuario en la DB */
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al crear la cuenta.')
        setLoading(false)
        return
      }

      /* 2. Iniciar sesión automáticamente */
      const result = await signIn('credentials', {
        email, password,
        redirect: false,
      })

      if (result?.error) {
        setError('Cuenta creada, pero error al iniciar sesión. Ve a /login.')
        setLoading(false)
        return
      }

      /* 3. Onboarding */
      window.location.href = '/onboarding'

    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg)', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,var(--gglow) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-up" style={{
        background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 22,
        padding: '2.75rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 2,
      }}>
        <Link href="/" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Volver
        </Link>

        {/* Logo */}
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          E-Trading
        </div>

        {/* Trial badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'rgba(0,212,122,.1)', border: '.5px solid rgba(0,212,122,.3)',
          borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700,
          color: 'var(--green)', margin: '0 auto 1.5rem', width: 'fit-content',
        }}>
          ⚡ 7 días de Plan Pro gratis — Sin tarjeta
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,83,80,.12)', border: '.5px solid rgba(239,83,80,.35)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF5350',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" type="text" required />
          <InputField label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" required />
          <InputField label="Contraseña" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" type="password" required minLength={8} />
          <InputField label="Confirmar contraseña" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repite tu contraseña" type="password" required minLength={8} />

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 14, background: loading ? 'var(--bg3)' : 'var(--green)',
            color: loading ? 'var(--muted)' : 'var(--bg)',
            border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 15,
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid var(--muted)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Creando cuenta...
              </>
            ) : 'Crear cuenta gratis →'}
          </button>
        </form>

        {/* Google */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: '.5px', background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>o continúa con</span>
          <div style={{ flex: 1, height: '.5px', background: 'var(--border)' }} />
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
          style={{
            width: '100%', padding: '11px', background: 'var(--bg2)',
            border: '.5px solid var(--border2)', borderRadius: 10, color: 'var(--white)',
            fontFamily: 'var(--sans)', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Registrarse con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted2)', marginTop: '1.25rem' }}>
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--green)', textDecoration: 'none' }}>Inicia sesión</Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted2)', marginTop: 8, lineHeight: 1.5 }}>
          Al registrarte aceptas nuestros{' '}
          <Link href="/terminos" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Términos</Link>
          {' '}y{' '}
          <Link href="/privacidad" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Privacidad</Link>.
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type, required, minLength }: {
  label: string, value: string, onChange: (v: string) => void,
  placeholder: string, type: string, required?: boolean, minLength?: number,
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} minLength={minLength}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'var(--bg2)',
          border: focused ? '1px solid var(--green)' : '.5px solid var(--border2)',
          borderRadius: 10, padding: '12px 16px', color: 'var(--white)',
          fontFamily: 'var(--sans)', fontSize: 14, outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color .2s',
        }}
      />
    </div>
  )
}
