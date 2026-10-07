import Link from 'next/link'
import { Icon, ICONS } from '@/components/ui/Icon'

/** Pantalla sencilla de acceso: volver + título + contenido, columna de 400 px */
export function SimpleScreen({ back, title, subtitle, children }: { back: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: 'calc(8px + env(safe-area-inset-top, 0px)) 16px 32px' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
        <Link href={back} aria-label="Volver" style={{ width: 44, height: 44, marginLeft: -12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={ICONS.back} size={22} />
        </Link>
      </div>
      <div style={{ maxWidth: 400, width: '100%', margin: '16px auto 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, font: '700 28px/34px var(--font)', letterSpacing: '-0.02em' }}>{title}</h1>
          {subtitle && <p style={{ margin: 0, font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
