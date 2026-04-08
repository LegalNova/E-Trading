'use client'
import { usePathname } from 'next/navigation'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/mercado':    'Mercado',
  '/portafolio': 'Portafolio',
  '/clases':     'Clases',
  '/retos':      'Retos',
  '/insignias':  'Insignias',
  '/liga':       'Liga',
  '/ia':         'E-AI Profesora',
  '/precios':    'Planes',
  '/brokers':    'Brókers Recomendados',
}

function isMarketOpen(): boolean {
  const now = new Date()
  // NYSE: Lun-Vie 14:30–21:00 UTC (aproximado)
  const day = now.getUTCDay()
  const h   = now.getUTCHours()
  const m   = now.getUTCMinutes()
  const mins = h * 60 + m
  return day >= 1 && day <= 5 && mins >= 870 && mins < 1260 // 14:30 - 21:00
}

export default function Topbar() {
  const pathname  = usePathname()
  const segments  = pathname.split('/').filter(Boolean)
  const pageLabel = ROUTE_LABELS[`/${segments[0]}`] ?? segments[0]
  const open      = isMarketOpen()

  return (
    <div style={{
      height: 58, borderBottom: '.5px solid var(--border2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', background: 'rgba(7,9,10,.7)', backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{ color: 'var(--muted)', fontWeight: 400 }}>E-Trading</span>
        <span style={{ color: 'rgba(238,242,240,.2)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--white)' }}>{pageLabel}</span>
        {segments[1] && (
          <>
            <span style={{ color: 'rgba(238,242,240,.2)' }}>/</span>
            <span style={{ fontWeight: 500, color: 'var(--muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {segments[1].toUpperCase()}
            </span>
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Market status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: open ? 'var(--green)' : 'var(--red)',
            animation: open ? 'blink 2s infinite' : 'none',
            display: 'inline-block',
          }} />
          <span style={{ color: open ? 'var(--green)' : 'var(--muted)' }}>
            NYSE {open ? 'abierto' : 'cerrado'}
          </span>
        </div>

        {/* Disclaimer mini */}
        <div style={{ fontSize: 10, color: 'rgba(238,242,240,.2)', letterSpacing: '.02em', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>📚</span> Simulación educativa
        </div>
      </div>
    </div>
  )
}
