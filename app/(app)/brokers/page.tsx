'use client'
import { BROKERS } from '@/data/brokers'

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? '#FFD700' : 'var(--border2)' }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  )
}

function trackClick(broker: string, url: string) {
  fetch('/api/affiliate/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ broker, source: 'broker_page' }),
  }).catch(() => {})
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function BrokersPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Cuando estés listo para invertir de verdad
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 12 }}>
          Brókers recomendados
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 620 }}>
          Cuando termines de practicar en E-Trading y estés preparado para invertir dinero real, estos son los brókers que recomendamos. Los hemos analizado en base a comisiones, seguridad y facilidad de uso.
        </p>

        {/* Disclaimer */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16,
          background: 'rgba(249,168,37,.06)', border: '.5px solid rgba(249,168,37,.2)',
          borderRadius: 12, padding: '12px 16px', fontSize: 12, color: 'rgba(249,168,37,.8)',
        }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <div>
            <strong>Transparencia:</strong> E-Trading recibe una compensación cuando abres cuenta con estos brókers a través de nuestros enlaces. Siempre recomendamos los mejores para el usuario, independientemente de la comisión. Invertir conlleva riesgo de pérdida.
          </div>
        </div>
      </div>

      {/* Broker cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {BROKERS.map(broker => (
          <div
            key={broker.id}
            style={{
              background: 'rgba(255,255,255,.03)',
              border: `.5px solid ${broker.id === 'degiro' ? `${broker.color}40` : 'var(--border2)'}`,
              borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden',
              transition: 'box-shadow .25s, transform .25s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${broker.color}18`
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none'
              ;(e.currentTarget as HTMLElement).style.transform = 'none'
            }}
          >
            {broker.badge && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: broker.color, color: broker.id === 'degiro' ? 'var(--bg)' : 'var(--bg)',
                fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100,
              }}>
                {broker.badge}
              </div>
            )}

            {/* Logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: `${broker.color}18`,
                border: `.5px solid ${broker.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {broker.logo}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, color: broker.color }}>
                  {broker.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{broker.tagline}</div>
              </div>
            </div>

            <Stars rating={broker.rating} />

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0' }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>Comisiones</div>
                <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{broker.commission}</div>
              </div>
              <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>Depósito mínimo</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{broker.minDeposit}</div>
              </div>
            </div>

            {/* Pros/Cons */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {broker.pros.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {p}
                  </div>
                ))}
                {broker.cons.slice(0, 1).map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(239,83,80,.7)' }}>
                    <span style={{ flexShrink: 0 }}>✗</span> {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Best for */}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: broker.color }}>Ideal para:</span> {broker.bestFor}
            </div>

            {/* CTA */}
            <button
              onClick={() => trackClick(broker.id, broker.url)}
              style={{
                width: '100%', padding: '12px', background: broker.id === 'degiro' ? broker.color : 'transparent',
                color: broker.id === 'degiro' ? 'var(--bg)' : broker.color,
                border: `.5px solid ${broker.color}60`,
                borderRadius: 12, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', letterSpacing: '-.01em',
              }}
            >
              Abrir cuenta en {broker.name} →
            </button>
          </div>
        ))}
      </div>

      {/* Bottom disclaimer */}
      <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
        <strong>Aviso legal:</strong> Los enlaces a los brókers son enlaces de afiliado. E-Trading puede recibir una compensación si abres una cuenta a través de ellos. Esta compensación no influye en nuestra valoración. Invertir en mercados financieros conlleva riesgo de pérdida de capital. E-Trading es una plataforma educativa y no presta servicios de inversión regulados. Antes de invertir dinero real, asegúrate de entender los riesgos.
      </div>
    </div>
  )
}
