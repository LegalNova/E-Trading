import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad" updated="6 de abril de 2026">
      <Section title="1. Responsable del tratamiento">
        <p>E-Trading (en adelante, «nosotros» o «E-Trading») es el responsable del tratamiento de los datos personales recogidos a través de esta plataforma.</p>
        <p>Para cualquier consulta sobre privacidad, puedes contactarnos en: <a href="mailto:privacidad@e-trading.com" style={{ color: 'var(--green)' }}>privacidad@e-trading.com</a></p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Recopilamos los siguientes datos cuando te registras o usas E-Trading:</p>
        <ul>
          <li><strong>Datos de cuenta:</strong> nombre, dirección de email, contraseña (almacenada como hash bcrypt irreversible).</li>
          <li><strong>Datos de uso:</strong> retos completados, clases vistas, operaciones virtuales, XP, racha, posición en liga.</li>
          <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador, cookies de sesión.</li>
          <li><strong>Datos de Google OAuth:</strong> si te registras con Google, recibimos tu nombre, email y foto de perfil de Google.</li>
        </ul>
        <p>No recogemos datos financieros reales (números de tarjeta, cuentas bancarias, etc.). Todo el dinero en E-Trading es <strong>virtual y educativo</strong>.</p>
      </Section>

      <Section title="3. Base legal del tratamiento">
        <ul>
          <li><strong>Ejecución del contrato:</strong> datos necesarios para prestarte el servicio (cuenta, portafolio virtual, progreso).</li>
          <li><strong>Interés legítimo:</strong> analítica interna para mejorar la plataforma.</li>
          <li><strong>Consentimiento:</strong> cookies analíticas y de marketing, solo si las aceptas en el banner.</li>
        </ul>
      </Section>

      <Section title="4. Cómo usamos tus datos">
        <ul>
          <li>Gestionar tu cuenta y acceso a la plataforma.</li>
          <li>Personalizar la experiencia educativa con la IA.</li>
          <li>Enviar emails transaccionales (bienvenida, recuperación de contraseña).</li>
          <li>Calcular rankings de la liga semanal.</li>
          <li>Mejorar la plataforma mediante analítica agregada y anonimizada.</li>
        </ul>
      </Section>

      <Section title="5. Tus derechos (RGPD)">
        <p>Como usuario europeo, tienes derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> solicitar una copia de todos tus datos.</li>
          <li><strong>Rectificación:</strong> corregir datos incorrectos.</li>
          <li><strong>Supresión («derecho al olvido»):</strong> eliminar tu cuenta y todos tus datos.</li>
          <li><strong>Portabilidad:</strong> exportar tus datos en formato legible.</li>
          <li><strong>Limitación:</strong> restringir cómo usamos tus datos.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
        </ul>
        <p>Puedes ejercer cualquiera de estos derechos enviando un email a <a href="mailto:privacidad@e-trading.com" style={{ color: 'var(--green)' }}>privacidad@e-trading.com</a>. Responderemos en 30 días.</p>
        <p>También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en <a href="https://www.aepd.es" style={{ color: 'var(--green)' }} target="_blank" rel="noopener noreferrer">www.aepd.es</a>.</p>
      </Section>

      <Section title="6. Retención de datos">
        <p>Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, eliminamos todos tus datos en un plazo de 30 días, excepto aquellos que debamos conservar por obligación legal.</p>
      </Section>

      <Section title="7. Transferencias internacionales">
        <p>Utilizamos los siguientes servicios que pueden procesar datos fuera de la UE, todos con las garantías adecuadas:</p>
        <ul>
          <li>Supabase (base de datos) — proveedores con sede en la UE disponibles.</li>
          <li>Anthropic (IA) — USA, protegido por Cláusulas Contractuales Estándar.</li>
          <li>Resend (emails) — USA, protegido por Cláusulas Contractuales Estándar.</li>
          <li>Vercel (hosting) — USA/UE, protegido por Data Processing Agreement.</li>
        </ul>
      </Section>

      <Section title="8. Cookies">
        <p>Consulta nuestra <Link href="/cookies" style={{ color: 'var(--green)' }}>Política de Cookies</Link> para más información.</p>
      </Section>
    </LegalPage>
  )
}

function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          ← Volver a E-Trading
        </Link>
        <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Documento legal
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>{title}</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 40 }}>Última actualización: {updated}</p>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)' }}>
          {children}
        </div>
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
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 12, letterSpacing: '-.02em' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}
