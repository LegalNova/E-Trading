'use client'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useMe } from '@/components/shell/MeProvider'
import { NavBar } from '@/components/ui/NavBar'
import { Icon, ICONS } from '@/components/ui/Icon'
import { ThemeSeg } from '@/components/ui/ThemeSheet'
import { card, h1 } from '@/components/ui/styles'

interface Row { t: string; v?: string; icon: string; href: string }

export default function MasPage() {
  const { me } = useMe()
  const plan = me?.user.plan
  const planColor = plan === 'elite' ? 'var(--gold)' : plan === 'free' ? 'var(--text-secondary)' : 'var(--green)'

  const groups: { t: string; rows: Row[] }[] = [
    {
      t: 'Comunidad',
      rows: [
        { t: 'Liga', v: me?.liga ? `${me.liga.nombre} · ${me.liga.pos}.º` : '', icon: ICONS.trophy, href: '/liga' },
        { t: 'Insignias', v: me ? `${me.counts.insignias} de 20` : '', icon: ICONS.badge, href: '/insignias' },
        { t: 'Profesora IA', v: me?.limits.iaMsgsDia ? `${me.limits.iaMsgsDia} mensajes/día` : me ? 'Ilimitada' : '', icon: ICONS.chat, href: '/ia' },
      ],
    },
    {
      t: 'Aprender e invertir',
      rows: [
        { t: 'Retos', v: me ? `${me.counts.retos} de 100` : '', icon: ICONS.target, href: '/retos' },
        { t: 'Brokers reales', icon: ICONS.bank, href: '/brokers' },
      ],
    },
    {
      t: 'Cuenta',
      rows: [
        {
          t: 'Plan y facturación',
          v: me ? (me.user.isTrial ? `Pro · prueba, ${me.user.trialDaysLeft} ${me.user.trialDaysLeft === 1 ? 'día' : 'días'}` : me.user.planLabel) : '',
          icon: ICONS.card,
          href: '/precios',
        },
        { t: 'Privacidad', icon: ICONS.shield, href: '/privacidad' },
        { t: 'Términos', icon: ICONS.learn, href: '/terminos' },
      ],
    },
  ]

  return (
    <div className="et-page" style={{ paddingBottom: 32 }}>
      <NavBar title="Más" />
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={h1}>Más</h1>

        <div style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 48, height: 48, flex: 'none', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 17px var(--font)' }}>
            {me?.user.name?.[0]?.toUpperCase() ?? ''}
          </span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {me ? (
              <>
                <span style={{ font: '600 17px var(--font)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me.user.name}</span>
                <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>
                  Nivel {me.level.n} · {me.level.nombre} · {me.user.xp.toLocaleString('es-ES')} XP
                </span>
                <span style={{ font: '400 13px var(--font)', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me.user.email}</span>
              </>
            ) : (
              <>
                <span className="skeleton" style={{ width: 120, height: 18 }} />
                <span className="skeleton" style={{ width: 180, height: 14 }} />
              </>
            )}
          </span>
          {me && <span style={{ font: '600 12px var(--font)', padding: '2px 6px', borderRadius: 2, color: planColor, border: `1px solid ${planColor}` }}>{me.user.planLabel.toUpperCase()}</span>}
        </div>

        {groups.map(g => (
          <div key={g.t} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '500 13px var(--font)', color: 'var(--text-secondary)', paddingLeft: 16 }}>{g.t}</span>
            <div style={card}>
              {g.rows.map((r, i) => (
                <Link key={r.t} href={r.href} style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16, color: 'var(--text-primary)', textDecoration: 'none' }}>
                  <Icon d={r.icon} size={20} color="var(--text-secondary)" />
                  <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minHeight: 48, paddingRight: 16, borderBottom: i < g.rows.length - 1 ? '1px solid var(--border)' : 'none', font: '400 17px var(--font)' }}>
                    <span style={{ flex: 1 }}>{r.t}</span>
                    {r.v && <span style={{ font: '400 15px var(--font)', color: 'var(--text-secondary)', textAlign: 'right' }}>{r.v}</span>}
                    <Icon d={ICONS.chevron} size={14} color="var(--text-tertiary)" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '500 13px var(--font)', color: 'var(--text-secondary)', paddingLeft: 16 }}>Apariencia</span>
          <div style={{ ...card, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ThemeSeg />
            <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Automático sigue la configuración de tu dispositivo.</span>
          </div>
        </div>

        <div style={card}>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ width: '100%', height: 48, border: 'none', background: 'none', color: 'var(--red)', font: '400 17px var(--font)', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
        <span style={{ font: '400 12px var(--font)', color: 'var(--text-tertiary)', textAlign: 'center' }}>Simulación educativa · No es asesoramiento financiero</span>
      </div>
    </div>
  )
}
