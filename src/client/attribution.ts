// Primer contacto: de dónde llegó el usuario (?utm_source=tiktok, ?ref=creador…).
// Se guarda solo en memoria mientras navega por la app (nada en el dispositivo, así no hace falta
// pedir permiso de cookies) y se envía al terminar el onboarding. Con Google viaja en la URL de vuelta (?src=).
let source: string | null = null

export function captureSource() {
  if (source) return
  try {
    const q = new URLSearchParams(location.search)
    const src = q.get('src')
    const inv = q.get('inv')
    const ref = q.get('ref')
    const utm = q.get('utm_source')
    const camp = q.get('utm_campaign')
    let s = src ?? (inv ? `inv/${inv}` : ref ? `ref/${ref}` : utm ? (camp ? `${utm}/${camp}` : utm) : null)
    if (!s && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '')
      if (host && host !== location.hostname) s = host
    }
    source = (s ?? 'direct').slice(0, 80)
  } catch {
    source = 'direct'
  }
}

export const readSource = (): string | undefined => source ?? undefined
