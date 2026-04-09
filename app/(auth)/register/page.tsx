'use client'
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'El nombre es obligatorio'
    if (!email.trim()) errs.email = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email no válido'
    if (!password) errs.password = 'La contraseña es obligatoria'
    else if (password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (!confirmPassword) errs.confirmPassword = 'Confirma tu contraseña'
    else if (password !== confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError('')
    if (!validate()) return

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setGlobalError(data.error ?? 'Error al crear la cuenta')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setGlobalError('Cuenta creada. Ve a iniciar sesión.')
        setLoading(false)
        router.push('/login')
        return
      }

      router.push('/onboarding')
    } catch {
      setGlobalError('Error de conexión. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#07090A', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(238,242,240,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(238,242,240,.04) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(0,212,122,.12) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#0C1014', border: '.5px solid rgba(238,242,240,.08)', borderRadius: 22,
        padding: '2.75rem', width: '100%', maxWidth: 440, position: 'relative', zIndex: 2,
      }}>
        <Link href="/" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontSize: 12, color: 'rgba(238,242,240,.45)', textDecoration: 'none' }}>
          ← Volver
        </Link>

        {/* Logo */}
        <div style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#EEF2F0' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#00D47A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          EasyTrading
        </div>

        {/* Trial badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'rgba(0,212,122,.1)', border: '.5px solid rgba(0,212,122,.3)',
          borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700,
          color: '#00D47A', margin: '0 auto 1.5rem', width: 'fit-content',
        }}>
          ⚡ 7 días de Plan Pro gratis — Sin tarjeta
        </div>

        {globalError && (
          <div style={{
            background: 'rgba(239,83,80,.12)', border: '.5px solid rgba(239,83,80,.35)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF5350',
            marginBottom: 16,
          }}>
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field
            label="Nombre completo"
            value={name}
            onChange={v => { setName(v); setFieldErrors(p => ({ ...p, name: '' })) }}
            placeholder="Tu nombre"
            type="text"
            error={fieldErrors.name}
          />
          <Field
            label="Email"
            value={email}
            onChange={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: '' })) }}
            placeholder="tu@email.com"
            type="email"
            error={fieldErrors.email}
          />
          <Field
            label="Contraseña"
            value={password}
            onChange={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: '' })) }}
            placeholder="Mínimo 8 caracteres"
            type="password"
            error={fieldErrors.password}
          />
          <Field
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={v => { setConfirmPassword(v); setFieldErrors(p => ({ ...p, confirmPassword: '' })) }}
            placeholder="Repite tu contraseña"
            type="password"
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: 14,
              background: loading ? '#182030' : '#00D47A',
              color: loading ? 'rgba(238,242,240,.45)' : '#07090A',
              border: 'none', borderRadius: 10,
              fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .2s',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14, border: '2px solid rgba(238,242,240,.3)',
                  borderTopColor: '#00D47A', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block',
                }} />
                Creando cuenta...
              </>
            ) : 'Crear cuenta gratis →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(238,242,240,.35)', marginTop: '1.25rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: '#00D47A', textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type, error }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type: string
  error?: string
}) {
  const [focused, setFocused] = useState(false)
  const hasError = !!error

  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'rgba(238,242,240,.45)', marginBottom: 6, display: 'block',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: '#101820',
          border: hasError
            ? '1px solid #EF5350'
            : focused
              ? '1px solid #00D47A'
              : '.5px solid rgba(238,242,240,.08)',
          borderRadius: 10, padding: '12px 16px', color: '#EEF2F0',
          fontFamily: 'var(--sans, Mulish, sans-serif)', fontSize: 14, outline: 'none',
          boxSizing: 'border-box', transition: 'border-color .2s',
        }}
      />
      {hasError && (
        <div style={{ fontSize: 11, color: '#EF5350', marginTop: 4 }}>{error}</div>
      )}
    </div>
  )
}
