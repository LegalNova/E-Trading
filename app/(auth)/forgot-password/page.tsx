'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

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
        <Link href="/login" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Volver
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔑</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
            Escribe tu email y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        {sent ? (
          <div style={{
            background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.3)',
            borderRadius: 12, padding: '1.25rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✉️</div>
            <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 600, marginBottom: 6 }}>
              ¡Email enviado!
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Si existe una cuenta con ese email, recibirás un enlace en los próximos minutos.
            </p>
            <Link href="/login" style={{
              display: 'inline-block', marginTop: 16, fontSize: 13,
              color: 'var(--green)', textDecoration: 'none',
            }}>← Volver al login</Link>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: 'rgba(239,83,80,.12)', border: '.5px solid rgba(239,83,80,.35)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF5350', marginBottom: 16 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required
                style={{ width: '100%', background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '12px 16px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
              />
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: 14, background: loading ? 'var(--bg3)' : 'var(--green)',
                color: loading ? 'var(--muted)' : 'var(--bg)',
                border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 15,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid var(--muted)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Enviando...
                  </>
                ) : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
