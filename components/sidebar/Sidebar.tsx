'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

type NavItem = { href: string; label: string; icon: string; badge?: string }
const NAV: { section: string; items: NavItem[] }[] = [
  { section: 'Mercado', items: [
    { href: '/dashboard',  label: 'Dashboard',   icon: '📊' },
    { href: '/mercado',    label: 'Mercado',      icon: '🌍' },
    { href: '/portafolio', label: 'Portafolio',   icon: '💼' },
  ]},
  { section: 'Aprendizaje', items: [
    { href: '/clases',    label: 'Clases',       icon: '📚' },
    { href: '/retos',     label: 'Retos',        icon: '🎯' },
    { href: '/insignias', label: 'Insignias',    icon: '🏅' },
    { href: '/liga',      label: 'Liga',         icon: '🏆' },
    { href: '/ia',        label: 'E-AI',         icon: '🤖', badge: 'PRO' },
    { href: '/brokers',   label: 'Brókers',      icon: '🔗' },
  ]},
  { section: 'Cuenta', items: [
    { href: '/precios',   label: 'Planes',       icon: '💎' },
  ]},
]

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:       { label: 'Free',      color: 'var(--muted)' },
  starter:    { label: 'Starter',   color: '#42A5F5' },
  pro:        { label: 'Pro',       color: 'var(--green)' },
  pro_trial:  { label: 'Pro Trial', color: 'var(--green)' },
  elite:      { label: 'Elite',     color: '#FFD700' },
}

const LEVEL_NAMES = ['Principiante', 'Aficionado', 'Intermedio', 'Avanzado', 'Maestro']
const LEVEL_XP    = [0, 500, 1500, 3000, 5000, Infinity]

function getLevel(xp: number) {
  for (let i = LEVEL_XP.length - 2; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) {
      const pct = Math.min(100, ((xp - LEVEL_XP[i]) / (LEVEL_XP[i + 1] - LEVEL_XP[i])) * 100)
      return { level: i + 1, name: LEVEL_NAMES[i], pct, next: LEVEL_XP[i + 1] }
    }
  }
  return { level: 1, name: LEVEL_NAMES[0], pct: 0, next: 500 }
}

function trialDays(trial_ends_at: string | null | undefined): number | null {
  if (!trial_ends_at) return null
  const diff = new Date(trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const user     = session?.user
  const xp       = (user as Record<string, unknown>)?.xp as number ?? 0
  const racha    = (user as Record<string, unknown>)?.racha as number ?? 0
  const plan     = (user as Record<string, unknown>)?.plan as string ?? 'free'
  const trial    = (user as Record<string, unknown>)?.trial_ends_at as string | null ?? null
  const { level, name: levelName, pct, next } = getLevel(xp)
  const days     = trialDays(trial)
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? 'T')

  return (
    <div style={{
      width: 236, flexShrink: 0, background: 'var(--bg1)',
      borderRight: '.5px solid var(--border2)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* ── Logo ──────────────────────────────────────────── */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, letterSpacing: '-.02em' }}>E-Trading</span>
        <span style={{ fontSize: 8, fontWeight: 700, background: 'rgba(0,212,122,.1)', border: '.5px solid rgba(0,212,122,.25)', color: 'var(--green)', padding: '2px 5px', borderRadius: 3, letterSpacing: '.06em' }}>BETA</span>
      </div>

      {/* ── User card ─────────────────────────────────────── */}
      <div style={{ margin: '10px 10px 4px', background: 'rgba(255,255,255,.03)', border: '.5px solid var(--border2)', borderRadius: 14, padding: '12px 14px' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
          {user?.image ? (
            <img src={user.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 800, color: 'var(--bg)', flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Trader'}
            </div>
            <div style={{ fontSize: 10, color: planInfo.color, fontWeight: 700 }}>
              {planInfo.label}
              {plan === 'pro_trial' && days !== null && ` · ${days}d restantes`}
            </div>
          </div>
          {/* Menu dot */}
          <div
            onClick={() => setMenuOpen(o => !o)}
            style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1, flexShrink: 0, userSelect: 'none' }}
          >⋯</div>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 36, right: 0, background: 'var(--bg2)',
              border: '.5px solid var(--border2)', borderRadius: 12, padding: '4px',
              zIndex: 50, minWidth: 150,
            }}>
              <div onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}
                style={{ padding: '9px 12px', fontSize: 13, cursor: 'pointer', borderRadius: 8, color: 'var(--red)' }}
              >
                Cerrar sesión
              </div>
            </div>
          )}
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>Nivel {level} · {levelName}</span>
            <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>{xp} XP</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--green),#00F090)', borderRadius: 2, transition: 'width .4s' }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>
            {next < Infinity ? `${next - xp} XP para nivel ${level + 1}` : '¡Nivel máximo!'}
          </div>
        </div>

        {/* Racha + trial */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, animation: racha > 0 ? 'flame 2s ease-in-out infinite' : 'none' }}>🔥</span>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 800, color: racha > 0 ? 'var(--amber)' : 'var(--muted)', lineHeight: 1 }}>{racha}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>racha</div>
            </div>
          </div>
          {plan === 'pro_trial' && days !== null && (
            <div style={{ flex: 1, background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{days}</div>
              <div style={{ fontSize: 9, color: 'var(--green)' }}>días Pro</div>
            </div>
          )}
          {plan === 'free' && (
            <Link href="/precios" style={{
              flex: 1, background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.25)',
              borderRadius: 8, padding: '6px 8px', textAlign: 'center', textDecoration: 'none',
            }}>
              <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, lineHeight: 1.4 }}>⬆ Mejorar plan</div>
            </Link>
          )}
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px', scrollbarWidth: 'none' }}>
        {NAV.map(group => (
          <div key={group.section}>
            <div style={{ padding: '10px 10px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(238,242,240,.25)' }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
                  borderRadius: 10, fontSize: 13, fontWeight: active ? 600 : 400,
                  textDecoration: 'none', marginBottom: 1, transition: '.15s',
                  color:      active ? 'var(--white)'   : 'var(--muted)',
                  background: active ? 'rgba(255,255,255,.06)' : 'transparent',
                  borderLeft: active ? '2.5px solid var(--green)' : '2.5px solid transparent',
                }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background: 'var(--green)', color: 'var(--bg)', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100 }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Live strip ────────────────────────────────────── */}
      <div style={{ padding: '10px 14px', borderTop: '.5px solid var(--border)' }}>
        <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(238,242,240,.25)', fontWeight: 600, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'blink 1.5s infinite', display: 'inline-block' }} />
          En vivo
        </div>
        {[
          { sym: 'AAPL', price: '185.42', up: true },
          { sym: 'BTC',  price: '67,240', up: false },
          { sym: 'SPY',  price: '521.18', up: true  },
        ].map(t => (
          <div key={t.sym} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
            <span style={{ fontWeight: 600 }}>{t.sym}</span>
            <span style={{ color: t.up ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--serif)', fontWeight: 700 }}>${t.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
