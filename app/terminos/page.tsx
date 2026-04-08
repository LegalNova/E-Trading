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

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones" updated="6 de abril de 2026">

      <div style={{ background: 'rgba(239,83,80,.08)', border: '.5px solid rgba(239,83,80,.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 28 }}>
        <strong style={{ color: '#EF5350' }}>⚠️ Aviso importante:</strong>
        <p style={{ marginTop: 6 }}>
          E-Trading es una plataforma educativa con simulador virtual. <strong>NO somos un servicio de inversión regulado, ni un bróker, ni un asesor financiero.</strong> Todo el contenido es educativo. El dinero en la plataforma es virtual. Invertir dinero real conlleva riesgo de pérdida.
        </p>
      </div>

      <Section title="1. Descripción del servicio">
        <p>E-Trading es una academia online de educación financiera que ofrece:</p>
        <ul>
          <li>Un simulador de inversión con dinero virtual (no real).</li>
          <li>Clases de educación financiera.</li>
          <li>Retos y sistema de gamificación.</li>
          <li>Un asistente de IA (E-AI) para aprendizaje personalizado.</li>
          <li>Rankings de liga entre usuarios.</li>
        </ul>
        <p>E-Trading no gestiona dinero real, no ejecuta órdenes reales en mercados financieros, y no está regulado por ningún organismo financiero (CNMV, FCA, SEC, etc.).</p>
      </Section>

      <Section title="2. Registro y cuenta">
        <p>Para usar E-Trading debes tener al menos 18 años y proporcionar información veraz en el registro. Eres responsable de mantener la seguridad de tu contraseña. Nos reservamos el derecho de suspender cuentas que incumplan estos términos.</p>
      </Section>

      <Section title="3. Planes y precios">
        <ul>
          <li><strong>Free (0€/mes):</strong> acceso limitado a funcionalidades.</li>
          <li><strong>Starter (1€/mes):</strong> más clases y operaciones virtuales.</li>
          <li><strong>Pro (9€/mes):</strong> acceso casi completo.</li>
          <li><strong>Elite (16€/mes):</strong> acceso total y sin límites.</li>
        </ul>
        <p>Los nuevos usuarios disfrutan de 7 días de Plan Pro gratis al registrarse, sin necesidad de tarjeta de crédito.</p>
      </Section>

      <Section title="4. Política de cancelación y reembolso">
        <p>Puedes cancelar tu suscripción en cualquier momento desde el portal de facturación. La cancelación es efectiva al final del período de facturación actual. No ofrecemos reembolsos por períodos parciales.</p>
        <p>En caso de error de facturación, contacta con nosotros en los 30 días siguientes al cargo para solicitar la revisión.</p>
      </Section>

      <Section title="5. Propiedad intelectual">
        <p>Todo el contenido de E-Trading (clases, retos, diseños, código, IA) es propiedad de E-Trading o sus licenciantes. No puedes reproducir, distribuir o crear obras derivadas sin permiso expreso.</p>
      </Section>

      <Section title="6. Limitación de responsabilidad">
        <p>E-Trading no es responsable de las decisiones de inversión que tomes con dinero real, aunque estén basadas en el aprendizaje obtenido en nuestra plataforma. El contenido educativo se proporciona «tal cual» y no constituye asesoramiento financiero personalizado.</p>
        <p>En la máxima medida permitida por la ley, nuestra responsabilidad se limita al importe pagado por el usuario en los últimos 3 meses.</p>
      </Section>

      <Section title="7. Modificaciones">
        <p>Nos reservamos el derecho de modificar estos términos. Notificaremos cambios importantes por email con al menos 15 días de antelación. El uso continuado tras la notificación implica aceptación.</p>
      </Section>

      <Section title="8. Ley aplicable">
        <p>Estos términos se rigen por la legislación española. Para cualquier disputa, ambas partes se someten a los Juzgados y Tribunales del domicilio del usuario, en aplicación de la normativa de consumidores.</p>
      </Section>
    </LegalPage>
  )
}
