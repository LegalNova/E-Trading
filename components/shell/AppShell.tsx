'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Icon, ICONS } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { MeProvider, useMe } from './MeProvider'

const TABS = [
  { href: '/dashboard', label: 'Inicio', icon: ICONS.home, match: ['/dashboard'] },
  { href: '/clases', label: 'Aprender', icon: ICONS.learn, match: ['/clases', '/retos'] },
  { href: '/mercado', label: 'Mercado', icon: ICONS.market, match: ['/mercado'] },
  { href: '/portafolio', label: 'Portafolio', icon: ICONS.portfolio, match: ['/portafolio'] },
  { href: '/mas', label: 'Más', icon: ICONS.more, match: ['/mas', '/liga', '/insignias', '/ia', '/brokers', '/precios'] },
]

const SIDEBAR: { title?: string; items: { href: string; label: string; icon: string }[] }[] = [
  { items: [{ href: '/dashboard', label: 'Inicio', icon: ICONS.home }] },
  { title: 'Aprender', items: [{ href: '/clases', label: 'Clases', icon: ICONS.learn }, { href: '/retos', label: 'Retos', icon: ICONS.target }] },
  {
    title: 'Invertir',
    items: [
      { href: '/mercado', label: 'Mercado', icon: ICONS.market },
      { href: '/portafolio', label: 'Portafolio', icon: ICONS.portfolio },
      { href: '/brokers', label: 'Brokers', icon: ICONS.bank },
    ],
  },
  { title: 'Comunidad', items: [{ href: '/liga', label: 'Liga', icon: ICONS.trophy }, { href: '/insignias', label: 'Insignias', icon: ICONS.badge }] },
  { items: [{ href: '/ia', label: 'Profesora IA', icon: ICONS.chat }] },
]

// Pantallas de detalle: tienen su propia barra inferior o son a pantalla completa
const DETAIL = [/^\/mercado\/[^/]+/, /^\/clases\/[^/]+/, /^\/retos\/[^/]+/]

function isActive(pathname: string, prefixes: string[]) {
  return prefixes.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function DailyCheckin() {
  const toast = useToast()
  const { refresh } = useMe()
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    try {
      if (localStorage.getItem('et-checkin') === today) return
    } catch {
      // sin almacenamiento: se hace el check-in igualmente (el servidor es idempotente)
    }
    fetch('/api/user/checkin', { method: 'POST' })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { isNewDay?: boolean; racha?: number; reward?: { message: string } | null; badges?: { nombre: string; emoji: string }[] } | null) => {
        try { localStorage.setItem('et-checkin', today) } catch { /* ignore */ }
        if (!d?.isNewDay) return
        if (d.badges?.length) toast(`Insignia desbloqueada: ${d.badges[0].emoji} ${d.badges[0].nombre}`)
        else if (d.reward) toast(d.reward.message)
        else if ((d.racha ?? 0) > 1) toast(`Racha de ${d.racha} días. ¡Sigue así!`)
        refresh()
      })
      .catch(() => {})
  }, [toast, refresh])
  return null
}

function Sidebar({ pathname }: { pathname: string }) {
  const { me } = useMe()
  return (
    <aside className="et-sidebar" aria-label="Navegación principal">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', font: '700 19px var(--font)', letterSpacing: '-0.02em' }}>
        E-Trading
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SIDEBAR.map((g, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {g.title && <span style={{ font: '500 12px var(--font)', color: 'var(--text-tertiary)', padding: '0 8px 4px' }}>{g.title}</span>}
            {g.items.map(it => {
              const on = isActive(pathname, [it.href])
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={on ? 'page' : undefined}
                  style={{
                    height: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', borderRadius: 4,
                    color: on ? 'var(--text-primary)' : 'var(--text-secondary)', background: on ? 'var(--surface-2)' : 'transparent',
                    font: `${on ? 600 : 500} 15px var(--font)`, textDecoration: 'none',
                  }}
                >
                  <Icon d={it.icon} size={18} color={on ? 'var(--green)' : 'currentColor'} />
                  {it.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <Link
        href="/mas"
        style={{ margin: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-primary)', textDecoration: 'none' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px var(--font)' }}>
            {me?.user.name?.[0]?.toUpperCase() ?? '·'}
          </span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: '600 14px var(--font)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.user.name ?? ' '}</span>
            <span style={{ font: '400 12px var(--font)', color: 'var(--text-secondary)' }}>{me ? `Nivel ${me.level.n} · ${me.user.xp} XP` : ' '}</span>
          </span>
          {me && <span style={{ font: '600 11px var(--font)', padding: '2px 6px', borderRadius: 2, color: me.user.plan === 'elite' ? 'var(--gold)' : 'var(--green)', border: `1px solid ${me.user.plan === 'elite' ? 'var(--gold)' : 'var(--green)'}` }}>{me.user.planLabel.toUpperCase()}</span>}
        </span>
        {me && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 12px var(--font)', color: 'var(--amber)' }}>
            <Icon d={ICONS.flame} size={14} />
            {me.user.racha} {me.user.racha === 1 ? 'día' : 'días'} de racha
          </span>
        )}
      </Link>
    </aside>
  )
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav className="et-tabbar" aria-label="Pestañas">
      {TABS.map(t => {
        const on = isActive(pathname, t.match)
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              color: on ? 'var(--green)' : 'var(--text-secondary)', font: '500 10px var(--font)', textDecoration: 'none',
            }}
          >
            <Icon d={t.icon} size={24} />
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const detail = DETAIL.some(r => r.test(pathname))
  return (
    <MeProvider>
      <DailyCheckin />
      <div className="et-shell">
        <Sidebar pathname={pathname} />
        <main className={`et-main${detail ? '' : ' with-tabs'}`}>{children}</main>
        {!detail && <TabBar pathname={pathname} />}
      </div>
    </MeProvider>
  )
}

