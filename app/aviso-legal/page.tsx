import Link from 'next/link'

function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← Volver a E-Trading</Link>
        <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>Documento legal</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>{title}</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 40 }}>Última actualización: {updated}</p>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)' }}>{children}</div>
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '.5px solid var(--border)', fontSize: 12, color: 'var(--muted2)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/privacidad" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacidad</Link>
          <Link href="/terminos" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Términos</Link>
          <Link href="/cookies" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Cookies</Link>
          <Link href="/aviso-legal" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Aviso legal</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso Legal" updated="6 de abril de 2026">
      <Section title="Titular del sitio web">
        <p><strong>Denominación:</strong> E-Trading</p>
        <p><strong>Actividad:</strong> Plataforma educativa de simulación de inversión</p>
        <p><strong>Email de contacto:</strong> <a href="mailto:hola@e-trading.com" style={{ color: 'var(--green)' }}>hola@e-trading.com</a></p>
      </Section>

      <Section title="Objeto y actividad">
        <p>E-Trading es una plataforma de <strong>educación financiera</strong> que proporciona herramientas de simulación para que los usuarios aprendan sobre inversión en mercados financieros <strong>sin utilizar dinero real</strong>.</p>
        <p>E-Trading <strong>no está registrada ni regulada</strong> como entidad de servicios de inversión. No somos un bróker, no gestionamos activos reales, no prestamos asesoramiento financiero personalizado y no ejecutamos órdenes en mercados reales.</p>
      </Section>

      <Section title="Disclaimer financiero">
        <div style={{ background: 'rgba(239,83,80,.08)', border: '.5px solid rgba(239,83,80,.2)', borderRadius: 12, padding: '14px 18px' }}>
          <p><strong>E-Trading es una plataforma educativa con simulador virtual.</strong></p>
          <p>Todo el contenido publicado en E-Trading tiene carácter exclusivamente educativo e informativo. Nada en este sitio constituye asesoramiento financiero, recomendación de inversión ni oferta de compra o venta de valores.</p>
          <p>Las simulaciones son aproximaciones educativas y no reflejan con exactitud la operativa real de los mercados. Los resultados pasados en el simulador no garantizan resultados futuros.</p>
          <p>Antes de invertir dinero real, te recomendamos consultar con un asesor financiero regulado.</p>
        </div>
      </Section>

      <Section title="Propiedad intelectual">
        <p>El diseño, código, marca, contenidos educativos y demás elementos de E-Trading están protegidos por derechos de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.</p>
      </Section>

      <Section title="Legislación aplicable">
        <p>Este aviso legal se rige por la legislación española, en particular la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE) y el Reglamento General de Protección de Datos (RGPD).</p>
      </Section>
    </LegalPage>
  )
}
