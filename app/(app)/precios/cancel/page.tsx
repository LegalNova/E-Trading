import Link from 'next/link'

export default function CancelPage() {
  return (
    <div style={{ padding: '60px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>😕</div>

      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Pago cancelado
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 32, maxWidth: 480 }}>
        No te preocupes — no se ha realizado ningún cargo. Puedes volver a elegir tu plan cuando quieras.
      </div>

      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: '20px 28px', marginBottom: 32, maxWidth: 420 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--amber)' }}>¿Sabías que…?</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
          Con el plan Pro tienes <strong style={{ color: 'var(--white)' }}>100 mensajes diarios con la IA</strong>, acceso a todos los retos y el escudo de racha para no perder tu racha cuando un día no puedas estudiar.
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted2)' }}>
          Solo 9€/mes · Cancela cuando quieras · Sin permanencia
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/precios" style={{
          padding: '13px 28px', background: 'var(--green)', color: 'var(--bg)',
          borderRadius: 12, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
          textDecoration: 'none',
        }}>
          Ver planes →
        </Link>
        <Link href="/dashboard" style={{
          padding: '13px 24px', background: 'transparent', color: 'var(--white)',
          border: '.5px solid var(--border2)', borderRadius: 12, fontSize: 14, fontWeight: 600,
          textDecoration: 'none',
        }}>
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
