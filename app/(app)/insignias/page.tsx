import { INSIGNIAS, InsigniaRareza } from '@/data/insignias'

const RAREZA_CONFIG: Record<InsigniaRareza, { label: string; color: string; bg: string }> = {
  comun: { label: 'Común', color: 'var(--green)', bg: 'var(--gfaint)' },
  rara: { label: 'Rara', color: 'var(--blue)', bg: 'rgba(66,165,245,.1)' },
  epica: { label: 'Épica', color: 'var(--purple)', bg: 'rgba(153,69,255,.1)' },
  legendaria: { label: 'Legendaria', color: 'var(--gold)', bg: 'rgba(255,215,0,.1)' },
}

const RAREZA_ORDER: InsigniaRareza[] = ['comun', 'rara', 'epica', 'legendaria']

export default function InsigniasPage() {
  const grupos = RAREZA_ORDER.map(r => ({
    rareza: r,
    config: RAREZA_CONFIG[r],
    insignias: INSIGNIAS.filter(i => i.rareza === r),
  }))

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Insignias</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>20 insignias · 4 rarezas · 0 obtenidas</div>
      </div>

      {grupos.map(grupo => (
        <div key={grupo.rareza} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ height: 2, flex: 1, background: `${grupo.config.color}30`, borderRadius: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: grupo.config.color, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {grupo.config.label}
            </span>
            <div style={{ height: 2, flex: 1, background: `${grupo.config.color}30`, borderRadius: 1 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {grupo.insignias.map(ins => (
              <div key={ins.id} style={{
                background: 'var(--bg1)', border: `.5px solid var(--border2)`,
                borderRadius: 14, padding: 16, textAlign: 'center',
                opacity: 0.45, filter: 'grayscale(60%)',
                transition: '.2s',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{ins.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{ins.nombre}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{ins.descripcion}</div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: grupo.config.bg, color: grupo.config.color }}>
                  {grupo.config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
