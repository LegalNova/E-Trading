'use client'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (res?.error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  async function handleGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg2)', border: '.5px solid var(--border2)',
    borderRadius: 10, padding: '12px 16px', color: 'var(--white)',
    fontFamily: 'var(--sans)', fontSize: 14, outline: 'none', marginBottom: 13,
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,var(--gglow) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 22, padding: '2.75rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        <Link href="/" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>← Volver</Link>

        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
          </div>
          E-Trading
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300, lineHeight: 1.65 }}>Bienvenido de nuevo. Continúa aprendiendo.</p>

        {error && (
          <div style={{ background: 'rgba(239,83,80,.1)', border: '.5px solid rgba(239,83,80,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required style={inputStyle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Contraseña</label>
            <Link href="/forgot-password" style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: loading ? 'var(--bg3)' : 'var(--green)', color: loading ? 'var(--muted)' : 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Entrando...' : 'Iniciar sesión →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '15px 0', color: 'var(--muted2)', fontSize: 11 }}>
          <div style={{ flex: 1, height: .5, background: 'var(--border)' }} />o continúa con<div style={{ flex: 1, height: .5, background: 'var(--border)' }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: 10, background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 9, color: 'var(--muted)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
          🔵 Continuar con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted2)', marginTop: '1.25rem' }}>
          ¿Sin cuenta? <Link href="/register" style={{ color: 'var(--green)', textDecoration: 'none' }}>Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
