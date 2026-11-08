/** decodeURIComponent que no rompe con un «%» suelto (lo deja tal cual) */
export function safeDecode(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
