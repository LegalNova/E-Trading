import 'server-only'
// Glosario al tocar (auditoría PRO-17). No inventa definiciones: salen de la unidad «Vocabulario del inversor»,
// escritas como «• **Palabra:** definición» y ya traducidas al catalán y al inglés con el resto del curso.
import type { Loc } from '../locale'
import { UNITS } from './catalog'
import { stepsT } from './translate'

export interface GlossaryEntry {
  term: string
  def: string
}

/** Palabras tan corrientes que no se subrayan en el texto (se nombran en castellano; en los demás idiomas, la misma posición) */
const COMMON = new Set(['Acción', 'Cuerpo', 'Volumen', 'Duración', 'Vencimiento', 'Confirmación', 'Venganza', 'Tendencia', 'Índice', 'Liquidez', 'Recencia', 'Base del ahorro', 'Traspaso'])

const LINE = /^\s*(?:•|-)\s+\*\*([^*:]{2,40}):\*\*\s+(.+)$/gm
const cache = new Map<Loc, GlossaryEntry[]>()

/** Todas las palabras del glosario en un idioma (las de la unidad de vocabulario) */
export function glossary(loc: Loc): GlossaryEntry[] {
  const hit = cache.get(loc)
  if (hit) return hit
  const unit = UNITS.find(u => u.id === 'vocab')
  const out: GlossaryEntry[] = []
  const seen = new Set<string>()
  for (const l of unit?.lessons ?? []) {
    for (const s of stepsT(loc, l.id, l.steps)) {
      if (s.kind !== 'TEXT') continue
      for (const m of s.body.matchAll(LINE)) {
        const term = m[1].trim()
        const key = term.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        const def = m[2].trim().replace(/\*\*/g, '')
        out.push({ term, def: def.charAt(0).toUpperCase() + def.slice(1) })
      }
    }
  }
  cache.set(loc, out)
  return out
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** La palabra suelta (no dentro de otra), sin distinguir mayúsculas */
export const termRe = (term: string) => new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?:e?s)?(?![\\p{L}\\p{N}])`, 'iu')

/** Las palabras del glosario que aparecen en estos textos (como mucho 15) */
export function glossaryFor(loc: Loc, texts: string[]): GlossaryEntry[] {
  const all = texts.join('\n')
  const es = glossary('es')
  return glossary(loc)
    .filter((g, i) => !COMMON.has(es[i]?.term ?? '') && termRe(g.term).test(all))
    .slice(0, 15)
}
