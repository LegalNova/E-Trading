'use client'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SimpleScreen } from '@/components/auth/SimpleScreen'
import { btnPrimary, input } from '@/components/ui/styles'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params?.get('token') ?? ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <SimpleScreen back="/forgot-password" title="Enlace no válido" subtitle="Este enlace está incompleto o ha caducado.">
        <Link href="/forgot-password" style={{ ...btnPrimary, textDecoration: 'none' }}>Pedir un enlace nuevo</Link>
      </SimpleScreen>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 8) { setError('La contraseña necesita al menos 8 caracteres'); return }
    if (pw !== pw2) { setError('Las contraseñas no coinciden'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: pw }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'No se pudo cambiar la contraseña'); return }
      router.push('/login')
    } catch {
      setError('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SimpleScreen back="/login" title="Nueva contraseña" subtitle="Elige una contraseña de al menos 8 caracteres.">
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '500 13px var(--font)' }}>Contraseña nueva</span>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" style={input} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '500 13px var(--font)' }}>Repite la contraseña</span>
          <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" style={input} />
        </label>
        {error && <span role="alert" style={{ font: '400 13px var(--font)', color: 'var(--red)' }}>{error}</span>}
        <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>{loading ? 'Guardando…' : 'Guardar contraseña'}</button>
      </form>
    </SimpleScreen>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
