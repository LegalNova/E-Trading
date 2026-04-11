'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardBanner } from '@/components/banners/EducationalBanner'
import { usePortfolio } from '@/hooks/usePortfolio'
import { usePrices, formatPrice } from '@/hooks/usePrices'

function TrialBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)

  const user = session?.user as Record<string, unknown> | undefined
  const plan = user?.plan as string | undefined
  const trialEndsAt = user?.trial_ends_at as string | null | undefined

  useEffect(() => {
    const key = 'trial_banner_dismissed'
    if (localStorage.getItem(key) === 'true') setDismissed(true)
  }, [])

  if (plan !== 'pro_trial' || dismissed) return null

  let daysLeft = 7
  if (trialEndsAt) {
    const diff = new Date(trialEndsAt).getTime() - Date.now()
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const urgent = daysLeft <= 2
  const bg = urgent ? 'rgba(239,83,80,.1)' : 'rgba(249,168,37,.08)'
  const border = urgent ? 'rgba(239,83,80,.35)' : 'rgba(249,168,37,.25)'
  const color = urgent ? 'var(--red)' : 'var(--amber)'

  function dismiss() {
    localStorage.setItem('trial_banner_dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div style={{ background: bg, border: `.5px solid ${border}`, borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 18 }}>{urgent ? '⚠️' : '🎉'}</span>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
        {urgent
          ? <><strong style={{ color }}>¡Solo te quedan {daysLeft} días de Plan Pro!</strong> Actualiza ahora para no perder el acceso a todas las funcionalidades.</>
          : <>Estás disfrutando del <strong style={{ color }}>Plan Pro gratis</strong> — te quedan <strong style={{ color }}>{daysLeft} días</strong>. Actualiza para no perder el acceso.</>
        }
      </div>
      <Link href="/precios" style={{ background: color, color: 'var(--bg)', padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Actualizar ahora
      </Link>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: portfolioData } = usePortfolio()
  const heldSymbols = portfolioData?.positions.map(p => p.symbol) ?? []
  const { prices } = usePrices(heldSymbols.length ? heldSymbols : undefined)

  const sessionUser = session?.user as Record<string, unknown> | undefined
  const xp = Number(sessionUser?.xp ?? 0)
  const racha = Number(sessionUser?.racha ?? 0)

  const cash = portfolioData?.cash ?? 10000
  const positions = portfolioData?.positions ?? []
  const invested = positions.reduce((acc, p) => acc + p.shares * p.avg_price, 0)
  const marketValue = positions.reduce((acc, p) => {
    const current = prices[p.symbol]?.price ?? p.avg_price
    return acc + p.shares * current
  }, 0)
  const totalValue = cash + marketValue
  const pnlEur = marketValue - invested
  const pnlPct = invested > 0 ? (pnlEur / invested) * 100 : 0
  const pnlColor = pnlEur >= 0 ? 'var(--green)' : 'var(--red)'

  const nivel =
    xp >= 5000 ? '5 · Maestro' :
    xp >= 3000 ? '4 · Avanzado' :
    xp >= 1500 ? '3 · Intermedio' :
    xp >= 500 ? '2 · Aficionado' :
    '1 · Principiante'

  const mockMovers = [
    { sym: 'NVDA', name: 'NVIDIA', price: 875.42, chg: 3.21, up: true },
    { sym: 'TSLA', name: 'Tesla', price: 174.83, chg: -1.87, up: false },
    { sym: 'BTC', name: 'Bitcoin', price: 67240, chg: 2.14, up: true },
    { sym: 'ETH', name: 'Ethereum', price: 3498, chg: -0.94, up: false },
  ]

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <TrialBanner />
      <DashboardBanner />
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Buenos días 👋
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Aquí tienes tu resumen de hoy</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Valor portafolio</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--white)' }}>
            €{formatPrice(totalValue)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            {positions.length === 0 ? 'Capital inicial' : `${positions.length} ${positions.length === 1 ? 'posición' : 'posiciones'}`}
          </div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>P&amp;L total</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: invested > 0 ? pnlColor : 'var(--white)' }}>
            {invested > 0 ? (pnlEur >= 0 ? '+' : '−') : ''}€{formatPrice(Math.abs(pnlEur))}
          </div>
          <div style={{ fontSize: 11, color: invested > 0 ? pnlColor : 'var(--muted)', marginTop: 4, fontWeight: 600 }}>
            {invested > 0 ? `${pnlEur >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%` : '0.00%'}
          </div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>XP total</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--white)' }}>{xp}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Nivel {nivel}</div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Racha actual</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--white)' }}>
            {racha} {racha === 1 ? 'día' : 'días'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            {racha === 0 ? 'Empieza hoy' : 'Sigue así'}
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Mayores movimientos */}
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Mayores movimientos
            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--green)', fontWeight: 500, cursor: 'pointer' }}>Ver mercado →</span>
          </div>
          {mockMovers.map(m => (
            <div key={m.sym} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '.5px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.sym}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700 }}>{m.price > 1000 ? m.price.toLocaleString() : m.price}</div>
                <div style={{ fontSize: 11, color: m.up ? 'var(--green)' : 'var(--red)' }}>
                  {m.up ? '+' : ''}{m.chg.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recomendaciones IA */}
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            🤖 E-AI recomienda
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 11, padding: 14, marginBottom: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
            Bienvenido a E-Trading. Para empezar bien, te recomiendo completar los primeros 3 retos de la <strong style={{ color: 'var(--white)' }}>Fase 1: Despertar Financiero</strong>. Tardarás menos de 30 minutos y ganarás 100 XP.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'var(--gfaint)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>SIGUIENTE RETO</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>¿Qué es el dinero?</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>SIGUIENTE CLASE</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Tu dinero pierde valor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta anti-sesgo */}
      <div style={{ background: 'rgba(249,168,37,.07)', border: '.5px solid rgba(249,168,37,.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 22 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Alerta de sesgo de recencia</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            NVDA sube un 3% hoy. Cuidado con el <strong style={{ color: 'var(--amber)' }}>FOMO</strong> — los movimientos de un día no predicen el futuro. Revisa tu tesis de inversión antes de actuar.
          </div>
        </div>
      </div>
    </div>
  )
}
