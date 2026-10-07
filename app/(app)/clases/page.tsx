'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavBar } from '@/components/ui/NavBar'
import { Seg } from '@/components/ui/Seg'
import { Sheet } from '@/components/ui/Sheet'
import { Icon, ICONS } from '@/components/ui/Icon'
import { card, h1, h2, bar, btnPrimary } from '@/components/ui/styles'
import { fwait } from '@/lib/format'

type Estado = 'completada' | 'disponible' | 'espera' | 'bloqueada' | 'proximamente'

interface ClaseItem {
  id: string
  numero: number
  modulo: number
  titulo: string
  duracion: string | null
  xp: number | null
  plan: 'free' | 'starter' | 'pro' | 'elite'
  estado: Estado
  retryAt: string | null
}

interface Data {
  plan: string
  modulos: { n: number; titulo: string; plan: string; total: number; completadas: number }[]
  clases: ClaseItem[]
}

const PLAN_LABEL: Record<string, string> = { free: 'Free', starter: 'Starter', pro: 'Pro', elite: 'Elite' }

export default function AprenderPage() {
  const router = useRouter()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState(false)
  const [locked, setLocked] = useState<ClaseItem | null>(null)
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true })

  useEffect(() => {
    fetch('/api/progress/clase', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: Data) => {
        setData(d)
        // abre el primer módulo con clases pendientes
        const firstOpen = d.modulos.find(m => d.clases.some(c => c.modulo === m.n && (c.estado === 'disponible' || c.estado === 'espera')))
        if (firstOpen) setOpen({ [firstOpen.n]: true })
      })
      .catch(() => setError(true))
  }, [])

  const nextId = data?.clases.find(c => c.estado === 'disponible')?.id

  return (
    <div className="et-page" style={{ paddingBottom: 32 }}>
      <NavBar title="Aprender" />
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={h1}>Aprender</h1>
        <Seg label="Sección" options={['Clases', 'Retos'] as const} value="Clases" onChange={v => v === 'Retos' && router.push('/retos')} />
      </div>

      {error && <p style={{ margin: '24px 16px', font: '400 15px var(--font)', color: 'var(--red)' }}>No se pudieron cargar las clases. Recarga la página.</p>}

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(data?.modulos ?? [1, 2, 3, 4, 5].map(n => ({ n, titulo: '', plan: 'free', total: 10, completadas: 0 }))).map(m => {
          const items = data?.clases.filter(c => c.modulo === m.n) ?? []
          const isOpen = !!open[m.n]
          const soon = items.length > 0 && items.every(c => c.estado === 'proximamente')
          const pct = (m.completadas / m.total) * 100
          return (
            <section key={m.n} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => setOpen(o => ({ ...o, [m.n]: !o[m.n] }))}
                aria-expanded={isOpen}
                style={{ border: 'none', background: 'none', padding: 0, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}
              >
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', gap: 12 }}>
                  <span style={h2}>{data ? `Módulo ${m.n} · ${m.titulo}` : <span className="skeleton" style={{ display: 'inline-block', width: 200, height: 24 }} />}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '500 13px var(--font)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', flex: 'none' }}>
                    {m.completadas}/{m.total}
                    <Icon d={ICONS.chevron} size={14} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease-out' }} />
                  </span>
                </span>
                <span style={{ ...bar(pct).track, display: 'block', width: '100%' }}><i style={bar(pct).fill} /></span>
                {!isOpen && soon && <span style={{ font: '400 13px var(--font)', color: 'var(--text-tertiary)' }}>Próximamente · plan {PLAN_LABEL[m.plan]}</span>}
              </button>

              {isOpen && items.length > 0 && (
                <div style={card}>
                  {items.map((c, i) => {
                    const dim = c.estado === 'bloqueada' || c.estado === 'proximamente'
                    const isNext = c.id === nextId
                    const status =
                      c.estado === 'completada' ? { t: 'Completada', c: 'var(--green)' }
                      : c.estado === 'espera' ? { t: `Reintenta en ${fwait(c.retryAt)}`, c: 'var(--amber)' }
                      : c.estado === 'bloqueada' ? { t: `Disponible en ${PLAN_LABEL[c.plan]}`, c: 'var(--text-tertiary)' }
                      : c.estado === 'proximamente' ? { t: 'Próximamente', c: 'var(--text-tertiary)' }
                      : isNext ? { t: 'Siguiente', c: 'var(--green)' } : null
                    const inner = (
                      <>
                        <span style={{
                          width: 36, height: 36, flex: 'none', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1px solid ${c.estado === 'completada' || isNext ? 'var(--green)' : 'var(--border)'}`,
                          background: c.estado === 'completada' ? 'var(--green)' : 'transparent',
                          color: c.estado === 'completada' ? 'var(--on-green)' : isNext ? 'var(--green)' : 'var(--text-secondary)',
                          font: '600 13px var(--font)', fontVariantNumeric: 'tabular-nums',
                        }}>
                          {c.estado === 'completada' ? <Icon d={ICONS.check} size={16} stroke={2} /> : String(c.numero).padStart(2, '0')}
                        </span>
                        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ font: '600 15px/20px var(--font)' }}>{c.titulo}</span>
                          {(c.duracion || c.xp) && <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>{[c.duracion, c.xp ? `+${c.xp} XP` : null].filter(Boolean).join(' · ')}</span>}
                          {status && <span style={{ font: '500 12px var(--font)', color: status.c }}>{status.t}</span>}
                        </span>
                        {c.estado === 'bloqueada' && <Icon d={ICONS.lock} size={18} color="var(--text-secondary)" />}
                        {c.estado !== 'proximamente' && <Icon d={ICONS.chevron} size={16} color="var(--text-tertiary)" />}
                      </>
                    )
                    const rowStyle: React.CSSProperties = {
                      width: '100%', minHeight: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: 'none',
                      borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', background: 'none', color: 'var(--text-primary)',
                      textAlign: 'left', textDecoration: 'none', opacity: dim ? 0.55 : 1, cursor: c.estado === 'proximamente' ? 'default' : 'pointer',
                    }
                    if (c.estado === 'bloqueada') return <button key={c.id} onClick={() => setLocked(c)} style={rowStyle}>{inner}</button>
                    if (c.estado === 'proximamente') return <div key={c.id} style={rowStyle}>{inner}</div>
                    return <Link key={c.id} href={`/clases/${c.id}`} style={rowStyle}>{inner}</Link>
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <Sheet open={!!locked} onClose={() => setLocked(null)} label="Contenido de pago">
        {locked && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <Icon d={ICONS.lock} size={28} color="var(--text-secondary)" />
            <span style={{ font: '600 22px/28px var(--font)' }}>Disponible en {PLAN_LABEL[locked.plan]}</span>
            <p style={{ margin: 0, font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>
              «{locked.titulo}» forma parte del plan {PLAN_LABEL[locked.plan]}. Tu plan actual es {PLAN_LABEL[data?.plan ?? 'free']}.
            </p>
            <Link href="/precios" style={{ ...btnPrimary, width: '100%', height: 44, marginTop: 8, textDecoration: 'none' }}>Ver planes</Link>
          </div>
        )}
      </Sheet>
    </div>
  )
}
