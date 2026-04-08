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

const TABLE_STYLE = { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }
const TH = { textAlign: 'left' as const, padding: '8px 12px', background: 'var(--bg2)', color: 'var(--muted)', fontWeight: 600, fontSize: 11, letterSpacing: '.04em' }
const TD = { padding: '10px 12px', borderBottom: '.5px solid var(--border2)', verticalAlign: 'top' as const, color: 'var(--muted)', lineHeight: 1.5 }

export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies" updated="6 de abril de 2026">
      <Section title="¿Qué son las cookies?">
        <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo. Se usan para recordar tu sesión, preferencias y para analítica.</p>
      </Section>

      <Section title="Cookies que utilizamos">
        <table style={TABLE_STYLE}>
          <thead>
            <tr>
              <th style={TH}>Nombre</th>
              <th style={TH}>Tipo</th>
              <th style={TH}>Duración</th>
              <th style={TH}>Propósito</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'next-auth.session-token', type: 'Esencial', duration: '30 días', purpose: 'Mantiene tu sesión iniciada en E-Trading.' },
              { name: 'next-auth.csrf-token',    type: 'Esencial', duration: 'Sesión',  purpose: 'Protege contra ataques CSRF.' },
              { name: 'cookie-consent',          type: 'Esencial', duration: '1 año',   purpose: 'Guarda tus preferencias de cookies.' },
              { name: '_ga, _gid',               type: 'Analítica', duration: '2 años / 24h', purpose: 'Google Analytics: mide el uso de la plataforma de forma anónima. Solo activa si lo aceptas.' },
            ].map(c => (
              <tr key={c.name}>
                <td style={{ ...TD, fontWeight: 600, color: 'var(--white)', fontFamily: 'monospace' }}>{c.name}</td>
                <td style={TD}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700,
                    background: c.type === 'Esencial' ? 'rgba(0,212,122,.12)' : 'rgba(66,165,245,.12)',
                    color: c.type === 'Esencial' ? 'var(--green)' : '#42A5F5',
                  }}>{c.type}</span>
                </td>
                <td style={TD}>{c.duration}</td>
                <td style={TD}>{c.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Cómo gestionar las cookies">
        <p>Puedes gestionar tus preferencias en cualquier momento usando el <strong>banner de cookies</strong> que aparece en la parte inferior de la pantalla, o borrando las cookies desde la configuración de tu navegador.</p>
        <p>Ten en cuenta que deshabilitar las cookies esenciales puede impedir el uso correcto de la plataforma (por ejemplo, no podrás mantener la sesión iniciada).</p>
      </Section>
    </LegalPage>
  )
}
