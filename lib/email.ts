/* ─── Email con Resend ───────────────────────────────────────── */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'E-Trading <noreply@e-trading.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('[Email mock] To:', to, '| Subject:', subject)
    return { ok: true }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res
}

/* ─── Email de bienvenida ────────────────────────────────────── */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { background:#07090A; color:#EEF2F0; font-family:sans-serif; margin:0; padding:0; }
    .wrap { max-width:520px; margin:40px auto; padding:32px; background:#0C1014;
            border:1px solid rgba(238,242,240,0.08); border-radius:16px; }
    .logo { display:flex; align-items:center; gap:10px; margin-bottom:24px; }
    .logo-icon { width:36px; height:36px; background:#00D47A; border-radius:9px;
                 display:flex; align-items:center; justify-content:center; }
    h1 { font-size:26px; font-weight:800; margin:0 0 12px; }
    p  { font-size:14px; line-height:1.7; color:rgba(238,242,240,0.65); margin:0 0 16px; }
    .green { color:#00D47A; }
    .btn { display:inline-block; background:#00D47A; color:#07090A; padding:14px 32px;
           border-radius:10px; font-size:14px; font-weight:700; text-decoration:none;
           margin:16px 0; }
    .trial-badge { background:rgba(0,212,122,0.12); border:1px solid rgba(0,212,122,0.3);
                   border-radius:8px; padding:12px 16px; font-size:13px;
                   color:#00D47A; margin:16px 0; }
    .footer { font-size:11px; color:rgba(238,242,240,0.3); margin-top:24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">
      <div class="logo-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07090A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
      </div>
      <span style="font-size:18px;font-weight:800;">E-Trading</span>
    </div>

    <h1>¡Bienvenido, <span class="green">${name}</span>! 🎉</h1>
    <p>Tu cuenta está lista. Has comenzado el camino para convertirte en inversor autónomo.</p>

    <div class="trial-badge">
      ⚡ <strong>Tienes 7 días de Plan Pro gratis.</strong><br/>
      Acceso completo a todos los retos, clases y la IA sin límites.
    </div>

    <p>¿Qué puedes hacer ahora mismo?</p>
    <ul style="color:rgba(238,242,240,0.65);font-size:14px;line-height:2;">
      <li>🎯 Completar tu primer reto (solo 5 minutos)</li>
      <li>📊 Ejecutar tu primera operación virtual</li>
      <li>🤖 Hablar con E-AI para que te conozca</li>
      <li>🏆 Unirte a tu primera liga semanal</li>
    </ul>

    <a href="${APP_URL}/dashboard" class="btn">Ir al Dashboard →</a>

    <p style="font-size:12px;color:rgba(238,242,240,0.4);">
      E-Trading es una plataforma educativa. No gestionamos dinero real
      ni somos un servicio de inversión regulado.
    </p>

    <div class="footer">
      © 2026 E-Trading · <a href="${APP_URL}/privacidad" style="color:rgba(238,242,240,0.3);">Privacidad</a>
    </div>
  </div>
</body>
</html>`

  return sendEmail(to, '¡Bienvenido a E-Trading! Tu Plan Pro de 7 días empieza ahora', html)
}

/* ─── Email de recuperación de contraseña ───────────────────── */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { background:#07090A; color:#EEF2F0; font-family:sans-serif; margin:0; padding:0; }
    .wrap { max-width:520px; margin:40px auto; padding:32px; background:#0C1014;
            border:1px solid rgba(238,242,240,0.08); border-radius:16px; }
    h1 { font-size:22px; font-weight:800; margin:0 0 12px; }
    p  { font-size:14px; line-height:1.7; color:rgba(238,242,240,0.65); margin:0 0 16px; }
    .btn { display:inline-block; background:#00D47A; color:#07090A; padding:14px 32px;
           border-radius:10px; font-size:14px; font-weight:700; text-decoration:none;
           margin:16px 0; }
    .footer { font-size:11px; color:rgba(238,242,240,0.3); margin-top:24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Restablecer contraseña</h1>
    <p>Hola ${name}, recibimos una solicitud para restablecer la contraseña de tu cuenta E-Trading.</p>
    <p>Haz clic en el botón para crear una nueva contraseña. El enlace expira en <strong>1 hora</strong>.</p>
    <a href="${resetUrl}" class="btn">Restablecer contraseña →</a>
    <p style="font-size:12px;color:rgba(238,242,240,0.4);">
      Si no solicitaste este cambio, ignora este email. Tu contraseña no cambiará.
    </p>
    <div class="footer">© 2026 E-Trading</div>
  </div>
</body>
</html>`

  return sendEmail(to, 'Restablecer contraseña — E-Trading', html)
}
