'use client'
import Link from 'next/link'
import { useState } from 'react'
import { SimpleScreen } from '@/components/auth/SimpleScreen'
import { btnPrimary, input, card } from '@/components/ui/styles'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const ok = /^\S+@\S+\.\S+$/.test(email.trim())

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ok) { setError('Revisa el email, parece que falta algo.'); return }
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) })
      setSent(true)
    } catch {
      setError('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SimpleScreen back="/login" title="¿Olvidaste tu contraseña?" subtitle="Escribe tu email y te enviaremos un enlace para crear una nueva.">
      {sent ? (
        <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: '600 17px var(--font)' }}>Revisa tu correo</span>
          <span style={{ font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>
            Si existe una cuenta con {email.trim()}, recibirás un enlace válido durante 1 hora.
          </span>
          <Link href="/login" style={{ font: '500 15px var(--font)', marginTop: 4 }}>Volver a iniciar sesión</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '500 13px var(--font)' }}>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" style={{ ...input, borderColor: error ? 'var(--red)' : 'var(--border)' }} />
            {error && <span role="alert" style={{ font: '400 13px var(--font)', color: 'var(--red)' }}>{error}</span>}
          </label>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>{loading ? 'Enviando…' : 'Enviar enlace'}</button>
        </form>
      )}
    </SimpleScreen>
  )
}
