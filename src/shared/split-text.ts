// Una idea por pantalla (auditoría PRO-16): un texto largo de una clase se reparte en varias pantallas,
// cortando solo entre párrafos (nunca a mitad de frase ni de una lista). El texto no cambia: así vale igual
// para el castellano, el catalán y el inglés.

/** Palabras por pantalla a partir de las cuales se intenta partir */
export const MAX_WORDS = 45
/** Como mucho, en cuántas pantallas se parte un texto */
export const MAX_PARTS = 3

export const wordCount = (s: string) => s.replace(/\*\*/g, '').split(/\s+/).filter(Boolean).length

/** Devuelve los trozos (uno solo si no hace falta o no se puede partir bien) */
export function splitText(body: string, max = MAX_WORDS): string[] {
  if (wordCount(body) <= max) return [body]
  const blocks = body.split(/\n\n+/).map(b => b.trim()).filter(Boolean)
  if (blocks.length < 2) return [body]
  // Reparto lo más igualado posible en 2 o 3 partes, cortando solo entre párrafos
  const total = wordCount(body)
  const parts = Math.min(MAX_PARTS, blocks.length, Math.ceil(total / max))
  const target = total / parts
  const out: string[][] = [[]]
  let acc = 0
  blocks.forEach((b, i) => {
    const w = wordCount(b)
    const left = blocks.length - i
    const groupsLeft = parts - out.length
    // Se abre un trozo nuevo si este ya va lleno y quedan párrafos para los que faltan
    if (out[out.length - 1].length && groupsLeft > 0 && (acc + w / 2 > target * out.length || left <= groupsLeft)) out.push([])
    out[out.length - 1].push(b)
    acc += w
  })
  const res = out.filter(g => g.length).map(g => g.join('\n\n'))
  // Un trozo diminuto (menos de 8 palabras) no merece pantalla propia: mejor no partir
  return res.some(r => wordCount(r) < 8) ? [body] : res
}
