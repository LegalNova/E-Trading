'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const BROKERS = [
  {
    id: 'degiro',
    name: 'DEGIRO',
    logo: '🟠',
    badge: 'Recomendado',
    badgeColor: '#00D47A',
    tagline: 'El broker más popular en España',
    commission: 'Desde 0€',
    commissionNote: 'por operación en acciones EE.UU.',
    stars: 5,
    pros: ['Sin comisión de custodia', 'Acceso a 50+ bolsas mundiales', 'App muy intuitiva'],
    ideal: 'Ideal para acciones y ETFs',
    href: process.env.NEXT_PUBLIC_AFFILIATE_DEGIRO ?? '/brokers',
    color: '#FF6900',
  },
  {
    id: 'trading212',
    name: 'Trading212',
    logo: '🔵',
    badge: 'Sin comisiones',
    badgeColor: '#42A5F5',
    tagline: 'Cero comisiones en acciones y ETFs',
    commission: '0€',
    commissionNote: 'comisión en acciones y ETFs',
    stars: 5,
    pros: ['Fracciones de acciones desde 1€', 'ETFs de acumulación gratuitos', 'Cuenta remunerada al 5%'],
    ideal: 'Ideal para empezar con poco',
    href: process.env.NEXT_PUBLIC_AFFILIATE_TRADING212 ?? '/brokers',
    color: '#42A5F5',
  },
  {
    id: 'etoro',
    name: 'eToro',
    logo: '🟢',
    badge: 'Social Trading',
    badgeColor: '#9945FF',
    tagline: 'Copia a los mejores inversores',
    commission: '0€',
    commissionNote: 'en acciones y ETFs (spread en cripto)',
    stars: 4,
    pros: ['Copy trading: copia a expertos', 'Cripto y NFTs integrados', '30M+ de usuarios globales'],
    ideal: 'Ideal para cripto y copy trading',
    href: process.env.NEXT_PUBLIC_AFFILIATE_ETORO ?? '/brokers',
    color: '#9945FF',
  },
  {
    id: 'ib',
    name: 'Interactive Brokers',
    logo: '⚫',
    badge: 'Profesional',
    badgeColor: '#F9A825',
    tagline: 'El broker de los profesionales',
    commission: 'Desde 0.25€',
    commissionNote: 'mínimo por operación',
    stars: 4,
    pros: ['Acceso a todos los mercados globales', 'Tipos de interés altos en cash', 'Herramientas institucionales'],
    ideal: 'Ideal para inversores avanzados',
    href: process.env.NEXT_PUBLIC_AFFILIATE_IB ?? '/brokers',
    color: '#F9A825',
  },
]

function StarRating({ stars }: { stars: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 10, color: i <= stars ? '#F9A825' : 'var(--border2)' }}>★</span>
      ))}
    </div>
  )
}

export function BrokerSection() {
  return (
    <section style={{ padding: '100px 3rem', background: 'var(--bg1)', borderTop: '.5px solid var(--border)', borderBottom: '.5px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Cuando estés listo
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 16 }}>
            Los <span style={{ color: 'var(--green)' }}>mejores brokers</span> para empezar
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Después de practicar en el simulador, aquí están los brokers regulados que recomendamos para invertir con dinero real.
            Comparativa honesta — sin publicidad encubierta.
          </p>
        </motion.div>

        {/* Broker cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
          {BROKERS.map((broker, i) => (
            <motion.a
              key={broker.id}
              href={broker.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => {
                fetch('/api/affiliate/click', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ broker: broker.id, source: 'landing' }),
                }).catch(() => {})
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: `0 20px 60px ${broker.color}20` }}
              style={{
                display: 'block', textDecoration: 'none',
                background: 'rgba(255,255,255,.03)', backdropFilter: 'blur(12px)',
                border: '.5px solid var(--border2)', borderRadius: 20, padding: '24px 20px',
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer', transition: 'border-color .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = broker.color + '50' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
            >
              {/* Subtle gradient top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${broker.color}, transparent)` }} />

              {/* Badge */}
              <div style={{
                display: 'inline-block', marginBottom: 16,
                background: broker.badgeColor + '18', color: broker.badgeColor,
                border: `.5px solid ${broker.badgeColor}40`,
                fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 100,
                letterSpacing: '.08em', textTransform: 'uppercase',
              }}>
                {broker.badge}
              </div>

              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{broker.logo}</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, color: 'var(--white)' }}>{broker.name}</div>
                  <StarRating stars={broker.stars} />
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>{broker.tagline}</div>

              {/* Commission highlight */}
              <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, color: broker.badgeColor }}>{broker.commission}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{broker.commissionNote}</div>
              </div>

              {/* Pros */}
              <div style={{ marginBottom: 16 }}>
                {broker.pros.map(pro => (
                  <div key={pro} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                    {pro}
                  </div>
                ))}
              </div>

              {/* Ideal for */}
              <div style={{ fontSize: 10, color: broker.badgeColor, fontWeight: 600, marginBottom: 16 }}>{broker.ideal}</div>

              {/* CTA */}
              <div style={{
                display: 'block', textAlign: 'center', padding: '10px',
                background: broker.badgeColor + '15', border: `.5px solid ${broker.badgeColor}40`,
                color: broker.badgeColor, borderRadius: 10,
                fontSize: 12, fontWeight: 700,
              }}>
                Abrir cuenta →
              </div>
            </motion.a>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted2)', lineHeight: 1.7 }}>
          ⚠️ Los links de arriba son enlaces de afiliado. Si abres una cuenta, E-Trading recibe una pequeña comisión sin coste adicional para ti.
          Comparativa basada en análisis objetivo. Los CFDs implican un alto riesgo de perder dinero. Invierte solo lo que puedas permitirte perder.
          <Link href="/brokers" style={{ color: 'var(--muted)', marginLeft: 8, textDecoration: 'underline' }}>Ver comparativa completa →</Link>
        </div>
      </div>
    </section>
  )
}
