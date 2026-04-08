'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); router.push('/dashboard'); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  const sessionId = searchParams.get('session_id')

  return (
    <div style={{ padding: '60px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
      {/* Celebration */}
      <div style={{ fontSize: 72, marginBottom: 24, animation: 'bounce 0.6s ease infinite alternate' }}>🎉</div>

      <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
        ¡Bienvenido al club!
      </div>
      <div style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 8, maxWidth: 500 }}>
        Tu suscripción está activa. Ahora tienes acceso completo a todos los retos, clases y la IA profesora.
      </div>

      {sessionId && (
        <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 32 }}>
          ID de sesión: {sessionId.slice(0, 20)}...
        </div>
      )}

      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: '20px 28px', marginBottom: 32, maxWidth: 400 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--green)' }}>Lo que acabas de desbloquear:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            '✓ Acceso a todos los retos premium',
            '✓ Clases avanzadas desbloqueadas',
            '✓ Más mensajes con la IA profesora',
            '✓ Ligas semanales sin restricciones',
            '✓ Análisis técnico avanzado',
          ].map(item => (
            <div key={item} style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--green)' }}>{item.split(' ')[0]}</span>
              <span>{item.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/dashboard" style={{
          padding: '14px 32px', background: 'var(--green)', color: 'var(--bg)',
          borderRadius: 12, fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700,
          textDecoration: 'none',
        }}>
          Ir al Dashboard →
        </Link>
        <Link href="/retos" style={{
          padding: '14px 24px', background: 'transparent', color: 'var(--white)',
          border: '.5px solid var(--border2)', borderRadius: 12, fontSize: 14, fontWeight: 600,
          textDecoration: 'none',
        }}>
          Ver retos →
        </Link>
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--muted2)' }}>
        Redirigiendo automáticamente en {countdown}s...
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
