// Primer contacto: de dónde llegó el usuario (?utm_source=tiktok, ?ref=creador…).
// Se guarda la primera vez en este navegador y se envía al terminar el onboarding.
const KEY = 'lumi:source'

export function captureSource() {
  try {
    if (localStorage.getItem(KEY)) return
    const q = new URLSearchParams(location.search)
    const ref = q.get('ref')
    const utm = q.get('utm_source')
    const camp = q.get('utm_campaign')
    let src = ref ? `ref/${ref}` : utm ? (camp ? `${utm}/${camp}` : utm) : null
    if (!src && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '')
      if (host && host !== location.hostname) src = host
    }
    localStorage.setItem(KEY, (src ?? 'direct').slice(0, 80))
  } catch {
    // Sin almacenamiento (modo privado): no pasa nada
  }
}

export function readSource(): string | undefined {
  try {
    return localStorage.getItem(KEY) ?? undefined
  } catch {
    return undefined
  }
}
