'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { PLANES } from '@/lib/plans'
import Link from 'next/link'

const PLAN_ORDER = ['free', 'starter', 'pro', 'elite'] as const
const PLAN_COLORS = {
  free: { border: 'var(--border2)', glow: 'transparent', badge: null },
  starter: { border: 'var(--blue)', glow: 'rgba(66,165,245,.08)', badge: 'POPULAR' },
  pro: { border: 'var(--green)', glow: 'var(--gfaint)', badge: 'RECOMENDADO' },
  elite: { border: 'var(--gold)', glow: 'rgba(255,215,0,.06)', badge: 'ÉLITE' },
}

export default function PreciosPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const currentPlan = (session?.user as Record<string, unknown>)?.plan as string ?? 'free'

  async function handleUpgrade(plan: string) {
    if (plan === 'free') return
    if (!session) { window.location.href = '/login'; return }

    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Error')
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(null)
    }
  }

  const isPaidPlan = ['starter', 'pro', 'elite'].includes(currentPlan.replace('_trial', ''))

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Elige tu plan</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>Empieza gratis. Mejora cuando quieras. Sin permanencia.</div>
        {currentPlan === 'pro_trial' && (
          <div style={{ display: 'inline-block', marginTop: 10, background: 'var(--gfaint)', border: '.5px solid rgba(0,212,122,.3)', borderRadius: 10, padding: '8px 16px', fontSize: 12, color: 'var(--green)' }}>
            🎁 Estás en tu prueba Pro gratuita de 7 días. ¡Aprovéchala!
          </div>
        )}
      </div>

      {error && (
        <div style={{ maxWidth: 1100, margin: '0 auto 20px', background: 'rgba(239,83,80,.1)', border: '.5px solid rgba(239,83,80,.3)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--red)' }}>
          ⚠️ {error}
          {error.includes('configurado') && (
            <div style={{ marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>
              Para activar pagos, añade STRIPE_SECRET_KEY y los PRICE_IDs en tu .env.local
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
        {PLAN_ORDER.map(planKey => {
          const plan = PLANES[planKey]
          const colors = PLAN_COLORS[planKey]
          const isCurrentPlan = currentPlan === planKey || (currentPlan === 'pro_trial' && planKey === 'pro')
          const isLoading = loading === planKey

          return (
            <div key={planKey} style={{
              background: isCurrentPlan ? colors.glow !== 'transparent' ? colors.glow : 'var(--bg2)' : colors.glow !== 'transparent' ? colors.glow : 'var(--bg1)',
              border: `.5px solid ${isCurrentPlan ? colors.border : colors.border}`,
              borderRadius: 16, padding: 24, position: 'relative',
              display: 'flex', flexDirection: 'column',
              boxShadow: isCurrentPlan ? `0 0 20px ${colors.border}20` : 'none',
            }}>
              {colors.badge && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: colors.border, color: 'var(--bg)',
                  fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 100,
                  letterSpacing: '.08em', whiteSpace: 'nowrap',
                }}>
                  {colors.badge}
                </div>
              )}

              {isCurrentPlan && (
                <div style={{ position: 'absolute', top: -10, right: 16, background: 'var(--bg3)', border: '.5px solid var(--border2)', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 100, color: 'var(--muted)', letterSpacing: '.06em' }}>
                  TU PLAN
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{plan.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 800 }}>{plan.precio === 0 ? '0' : plan.precio}€</span>
                  {plan.precio > 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>/mes</span>}
                </div>
                {plan.precio === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Para siempre gratis</div>}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, marginBottom: 10, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {planKey === 'free' ? (
                <Link href="/dashboard" style={{
                  display: 'block', textAlign: 'center', padding: '12px',
                  background: 'transparent', color: 'var(--white)',
                  border: '.5px solid var(--border2)',
                  borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
                  textDecoration: 'none',
                }}>
                  {isCurrentPlan ? 'Plan actual' : 'Empezar gratis'}
                </Link>
              ) : isCurrentPlan ? (
                <button onClick={handlePortal} disabled={loading === 'portal'} style={{
                  display: 'block', width: '100%', textAlign: 'center', padding: '12px',
                  background: 'transparent', color: 'var(--white)',
                  border: `.5px solid ${colors.border}`,
                  borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', opacity: loading === 'portal' ? 0.6 : 1,
                }}>
                  {loading === 'portal' ? '...' : 'Gestionar suscripción'}
                </button>
              ) : (
                <button onClick={() => handleUpgrade(planKey)} disabled={isLoading} style={{
                  display: 'block', width: '100%', textAlign: 'center', padding: '12px',
                  background: planKey === 'pro' ? 'var(--green)' : 'transparent',
                  color: planKey === 'pro' ? 'var(--bg)' : 'var(--white)',
                  border: `.5px solid ${planKey === 'pro' ? 'var(--green)' : colors.border}`,
                  borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', opacity: isLoading ? 0.7 : 1,
                }}>
                  {isLoading ? 'Redirigiendo...' : `Elegir ${plan.label}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Comparativa */}
      <div style={{ maxWidth: 1100, margin: '40px auto 0', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '.5px solid var(--border)', fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700 }}>Comparativa completa</div>
        {[
          { feature: 'Clases al día', values: ['5', '10', '20', '∞'] },
          { feature: 'Operaciones por semana', values: ['5', '20', '∞', '∞'] },
          { feature: 'Mensajes IA al día', values: ['10', '20', '100', '∞'] },
          { feature: 'Retos desbloqueados', values: ['25', '45', '80', '100'] },
          { feature: 'Acceso a ligas', values: ['Novato', 'Todas', 'Todas', 'Todas'] },
          { feature: 'Escudo de racha', values: ['✗', '✗', '✓', '✓'] },
          { feature: 'Certificado oficial', values: ['✗', '✗', '✗', '✓'] },
          { feature: 'Soporte prioritario', values: ['✗', '✗', '✗', '✓'] },
        ].map((row, i) => (
          <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: i < 7 ? '.5px solid var(--border)' : 'none', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.feature}</span>
            {row.values.map((v, j) => (
              <span key={j} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: v === '✓' ? 'var(--green)' : v === '✗' ? 'rgba(238,242,240,.2)' : 'var(--white)' }}>{v}</span>
            ))}
          </div>
        ))}
      </div>

      {isPaidPlan && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={handlePortal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}>
            Gestionar facturación y suscripción →
          </button>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '24px auto 0', textAlign: 'center', fontSize: 11, color: 'var(--muted2)', lineHeight: 1.7 }}>
        Pagos procesados de forma segura por Stripe · SSL · Sin permanencia, cancela cuando quieras
      </div>
    </div>
  )
}
