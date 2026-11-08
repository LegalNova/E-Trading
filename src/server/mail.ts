import 'server-only'
// Emails transaccionales (fase 0): recuperar la contraseña y verificar el email.
// Con RESEND_API_KEY se envían por Resend; sin clave, en desarrollo se escriben en la consola del servidor.
// MAIL_FROM: remitente verificado en Resend, por ejemplo «E-Trading <hola@holalumi.app>».

type Lang = 'es' | 'ca' | 'en'
// Las claves de ejemplo («re_...») cuentan como ausentes
const KEY = /^re_[A-Za-z0-9_]{16,}$/.test(process.env.RESEND_API_KEY ?? '') ? process.env.RESEND_API_KEY : undefined
const FROM = process.env.MAIL_FROM ?? 'E-Trading <hola@holalumi.app>'

/** Hay forma de que el email llegue: Resend en producción o la consola en desarrollo */
export const mailEnabled = !!KEY || process.env.NODE_ENV !== 'production'

export const langOf = (req?: Request): Lang => {
  const l = req?.headers.get('x-locale')
  return l === 'ca' || l === 'en' ? l : 'es'
}

const COPY = {
  reset: {
    es: { subject: 'Cambia tu contraseña de E-Trading', title: 'Nueva contraseña', body: 'Has pedido cambiar la contraseña de tu cuenta. Toca el botón para elegir una nueva. El enlace caduca en una hora.', cta: 'Elegir contraseña', ignore: 'Si no lo has pedido tú, ignora este email: tu contraseña no cambia.' },
    ca: { subject: 'Canvia la contrasenya d’E-Trading', title: 'Contrasenya nova', body: 'Has demanat canviar la contrasenya del teu compte. Toca el botó per triar-ne una de nova. L’enllaç caduca d’aquí a una hora.', cta: 'Triar contrasenya', ignore: 'Si no ho has demanat tu, ignora aquest correu: la contrasenya no canvia.' },
    en: { subject: 'Change your E-Trading password', title: 'New password', body: 'You asked to change your account password. Tap the button to choose a new one. The link expires in one hour.', cta: 'Choose password', ignore: 'If you didn’t ask for this, ignore this email: your password stays the same.' },
  },
  verify: {
    es: { subject: 'Confirma tu email en E-Trading', title: 'Confirma tu email', body: 'Un toque y listo: así podrás recuperar tu cuenta si olvidas la contraseña.', cta: 'Confirmar email', ignore: 'Si no has creado una cuenta en E-Trading, ignora este email.' },
    ca: { subject: 'Confirma el teu correu a E-Trading', title: 'Confirma el correu', body: 'Un toc i a punt: així podràs recuperar el compte si oblides la contrasenya.', cta: 'Confirmar correu', ignore: 'Si no has creat cap compte a E-Trading, ignora aquest correu.' },
    en: { subject: 'Confirm your email for E-Trading', title: 'Confirm your email', body: 'One tap and you’re done: this lets you recover your account if you forget your password.', cta: 'Confirm email', ignore: 'If you didn’t create an E-Trading account, ignore this email.' },
  },
} as const

const FOOT = { es: 'E-Trading · Aprende a invertir sin arriesgar un euro. Simulación educativa.', ca: 'E-Trading · Aprèn a invertir sense arriscar ni un euro. Simulació educativa.', en: 'E-Trading · Learn to invest without risking a euro. Educational simulation.' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(lang: Lang, c: { title: string; body: string; cta: string; ignore: string }, url: string) {
  const html = `<!doctype html><html lang="${lang}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:22px;font-weight:800;letter-spacing:-0.03em">E-Trading<span style="color:#0071e3">.</span></td></tr>
<tr><td style="padding-top:24px;font-size:20px;font-weight:700">${esc(c.title)}</td></tr>
<tr><td style="padding-top:8px;font-size:15px;line-height:1.5;color:#424245">${esc(c.body)}</td></tr>
<tr><td style="padding-top:24px"><a href="${esc(url)}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:12px">${esc(c.cta)}</a></td></tr>
<tr><td style="padding-top:24px;font-size:13px;line-height:1.5;color:#6e6e73">${esc(c.ignore)}</td></tr>
</table>
<p style="font-size:12px;color:#86868b;max-width:480px">${esc(FOOT[lang])}</p>
</td></tr></table></body></html>`
  const text = `${c.title}\n\n${c.body}\n\n${c.cta}: ${url}\n\n${c.ignore}\n\n${FOOT[lang]}`
  return { html, text }
}

async function send(to: string, subject: string, html: string, text: string) {
  if (!KEY) {
    if (process.env.NODE_ENV !== 'production') console.info(`[mail] Para ${to} · ${subject}\n${text}`)
    else console.error('[mail] Falta RESEND_API_KEY: no se ha enviado el email')
    return
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
  })
  if (!r.ok) console.error(`[mail] Resend ${r.status}: ${(await r.text()).slice(0, 300)}`)
}

export function sendTemplate(kind: keyof typeof COPY, lang: Lang, to: string, url: string) {
  const c = COPY[kind][lang]
  const { html, text } = layout(lang, c, url)
  return send(to, c.subject, html, text)
}
