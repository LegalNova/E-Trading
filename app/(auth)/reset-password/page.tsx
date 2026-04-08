'use client'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ResetForm() {
  const params   = useSearchParams()
  const token    = params.get('token') ?? ''
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDone(true)
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--red)', marginBottom: 16 }}>Enlace inválido.</p>
        <Link href="/forgot-password" style={{ color: 'var(--green)' }}>Solicitar nuevo enlace</Link>
      </div>
    )
  }

  return done ? (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>¡Contraseña actualizada!</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
      <Link href="/login" style={{
        display: 'inline-block', padding: '12px 28px', background: 'var(--green)', color: 'var(--bg)',
        borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14,
      }}>Ir al login →</Link>
    </div>
  ) : (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Nueva contraseña</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Elige una contraseña segura de al menos 8 caracteres.</p>
      </div>
      {error && (
        <div style={{ background: 'rgba(239,83,80,.12)', border: '.5px solid rgba(239,83,80,.35)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF5350', marginBottom: 16 }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Nueva contraseña', val: password, set: setPassword, placeholder: 'Mínimo 8 caracteres' },
          { label: 'Confirmar contraseña', val: password2, set: setPassword2, placeholder: 'Repite la contraseña' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 13 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>{f.label}</label>
            <input
              type="password" value={f.val} onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder} required minLength={8}
              style={{ width: '100%', background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '12px 16px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 14, background: loading ? 'var(--bg3)' : 'var(--green)',
          color: loading ? 'var(--muted)' : 'var(--bg)',
          border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 15,
          fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
        }}>
          {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div className="animate-fade-up" style={{
        background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 22,
        padding: '2.75rem', width: '100%', maxWidth: 400, position: 'relative', zIndex: 2,
      }}>
        <Suspense fallback={<div style={{ color: 'var(--muted)', textAlign: 'center' }}>Cargando...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
