// Nombres de las personas (auditoría P0-8).
// Las cuentas de invitado («Probar sin registrarme») nacían con el nombre «Anonymous», que ponía por defecto la librería
// de acceso. Ese texto llegaba al campo «¿Cómo te llamas?» de la bienvenida y, si la persona escribía sin borrarlo,
// quedaba pegado a su nombre («AnonymousMarta»). Aquí se limpia al leer, para que tampoco lo vean quienes ya lo tienen
// guardado: no hace falta tocar la base de datos.

/** Nombre real de la persona, o '' si no ha dicho ninguno. Quita el «Anonymous» heredado de las cuentas de invitado. */
export function realName(name: string | null | undefined): string {
  const s = (name ?? '').trim()
  if (/^anonymous$/i.test(s)) return ''
  // «AnonymousMarta» → «Marta» (alguien escribió su nombre detrás del texto que venía puesto)
  const m = /^Anonymous(?=\S)(.+)$/.exec(s)
  return m ? m[1].trim() : s
}

/** Cómo se muestra a los demás alguien que no ha dicho su nombre (liga, grupos, avisos) */
export const GUEST_NAME = { es: 'Invitado', ca: 'Convidat', en: 'Guest' } as const
export const guestName = (locale: string) => GUEST_NAME[locale as keyof typeof GUEST_NAME] ?? GUEST_NAME.es
