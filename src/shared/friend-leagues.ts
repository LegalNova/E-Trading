// Ligas de amigos: reglas que comparten el servidor y la pantalla (nombre, código y límites).
export const MAX_OWNED = 5
export const MAX_JOINED = 10
export const MAX_MEMBERS = 100
export const NAME_MIN = 3
export const NAME_MAX = 30
export const CODE_LEN = 8
/** Sin letras ni números que se confunden al dictarlos o escribirlos (I, L, O, 0, 1) */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Código tal como lo escribe la gente: en mayúsculas y sin espacios ni guiones */
export const normalizeCode = (s: string) => s.toUpperCase().replace(/[\s\-_.]/g, '')

export const isValidCode = (code: string) => code.length === CODE_LEN && [...code].every(ch => CODE_ALPHABET.includes(ch))

/** Nombre de la liga sin caracteres invisibles ni espacios de más */
export const cleanName = (s: string) =>
  s
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const nameLength = (s: string) => [...s].length
export const isValidName = (s: string) => nameLength(s) >= NAME_MIN && nameLength(s) <= NAME_MAX
