'use client'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
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
        padding: '2.75rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 2,
      }}>
        <Link href="/" style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          fontSize: 12, color: 'rgba(238,242,240,.45)', textDecoration: 'none',
        }}>
          ← Volver
        </Link>

        {/* Logo */}
        <div style={{
          fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 20, fontWeight: 800,
          textAlign: 'center', marginBottom: '.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#EEF2F0',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#00D47A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          E-Trading
        </div>

        <p style={{
          textAlign: 'center', fontSize: 13, color: 'rgba(238,242,240,.45)',
          marginBottom: '2rem', fontWeight: 300, lineHeight: 1.65,
        }}>
          Bienvenido de nuevo. Continúa aprendiendo.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,83,80,.12)', border: '.5px solid rgba(239,83,80,.35)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF5350', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <InputField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="tu@email.com"
            type="email"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'rgba(238,242,240,.45)',
            }}>
              Contraseña
            </label>
            <Link href="/forgot-password" style={{ fontSize: 11, color: 'rgba(238,242,240,.45)', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: '100%', background: '#101820',
              border: '.5px solid rgba(238,242,240,.08)',
              borderRadius: 10, padding: '12px 16px', color: '#EEF2F0',
              fontFamily: 'var(--sans, Mulish, sans-serif)', fontSize: 14, outline: 'none',
              marginBottom: 16, boxSizing: 'border-box',
            }}
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
              cursor: loading ? 'not-allowed' : 'pointer',
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
                Entrando...
              </>
            ) : 'Iniciar sesión →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(238,242,240,.35)', marginTop: '1.25rem' }}>
          ¿Sin cuenta?{' '}
          <Link href="/register" style={{ color: '#00D47A', textDecoration: 'none' }}>
            Regístrate gratis
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(238,242,240,.25); }
        input:focus { border-color: #00D47A !important; }
      `}</style>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
        textTransform: 'uppercase', color: 'rgba(238,242,240,.45)', marginBottom: 6, display: 'block',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          width: '100%', background: '#101820',
          border: '.5px solid rgba(238,242,240,.08)',
          borderRadius: 10, padding: '12px 16px', color: '#EEF2F0',
          fontFamily: 'var(--sans, Mulish, sans-serif)', fontSize: 14, outline: 'none',
          boxSizing: 'border-box', transition: 'border-color .2s',
        }}
      />
    </div>
  )
}
