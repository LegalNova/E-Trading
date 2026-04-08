export default function PortafolioPage() {
  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Mi Portafolio</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Capital inicial: €10.000 · 0 posiciones abiertas</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { lbl: 'Valor total', val: '€10.000,00' },
          { lbl: 'Cash disponible', val: '€10.000,00' },
          { lbl: 'P&L total', val: '€0,00' },
          { lbl: 'Rentabilidad', val: '0,00%' },
        ].map(s => (
          <div key={s.lbl} style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>{s.lbl}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Tu portafolio está vacío</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Empieza operando en el simulador de mercado</div>
        <a href="/mercado" style={{
          display: 'inline-block', padding: '12px 28px', background: 'var(--green)',
          color: 'var(--bg)', borderRadius: 10, fontFamily: 'var(--serif)',
          fontSize: 14, fontWeight: 700, textDecoration: 'none',
        }}>
          Ir al mercado →
        </a>
      </div>
    </div>
  )
}
