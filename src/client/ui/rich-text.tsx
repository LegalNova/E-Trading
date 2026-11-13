'use client'
// Texto con formato mínimo para lecciones y respuestas de Lumi: párrafos, viñetas y **negrita**
import { useTranslations } from 'next-intl'
import { Fragment, useEffect, useState, type ReactNode } from 'react'

export type Gloss = { term: string; def: string }

/** Solo **negrita**, dentro de una frase (Lumi, retos, descubrimientos) */
export const inline = (line: string, mark?: (text: string) => ReactNode) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <b key={i}>{mark ? mark(part.slice(2, -2)) : part.slice(2, -2)}</b> : mark ? <Fragment key={i}>{mark(part)}</Fragment> : part,
  )

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Palabra del glosario: subrayada con puntos; al tocarla, su significado abajo (auditoría PRO-17) */
function Term({ text, g }: { text: string; g: Gloss }) {
  const t = useTranslations('lesson')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    // Tocar en cualquier otro sitio también la cierra
    const off = () => setOpen(false)
    const t0 = setTimeout(() => window.addEventListener('pointerdown', off), 0)
    window.addEventListener('keydown', close)
    return () => {
      clearTimeout(t0)
      window.removeEventListener('keydown', close)
      window.removeEventListener('pointerdown', off)
    }
  }, [open])
  return (
    <>
      <button
        type="button"
        className="inline p-0 font-[inherit] text-[inherit] leading-[inherit]"
        style={{ background: 'none', border: 0, color: 'inherit', textDecoration: 'underline dotted', textDecorationColor: 'var(--brand)', textUnderlineOffset: 4, textDecorationThickness: 2, cursor: 'help' }}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {text}
      </button>
      {open && (
        <span role="dialog" aria-label={g.term} className="card animate-rise fixed inset-x-4 z-[60] mx-auto flex max-w-[480px] flex-col gap-1 text-left font-normal" style={{ bottom: 'max(96px, calc(env(safe-area-inset-bottom) + 88px))', boxShadow: '0 12px 32px rgb(0 0 0 / 0.18)' }} onClick={() => setOpen(false)}>
          <b className="t-head">{g.term}</b>
          <span className="t-body">{g.def}</span>
          <span className="t-cap">{t('glossaryClose')}</span>
        </span>
      )}
    </>
  )
}

/** Marca la primera aparición de cada palabra del glosario dentro de un texto (sin repetir las ya marcadas) */
function marker(glossary: Gloss[] | undefined, used: Set<string>) {
  if (!glossary?.length) return undefined
  return (text: string): ReactNode => {
    const out: ReactNode[] = []
    let rest = text
    for (;;) {
      let best: { i: number; len: number; g: Gloss } | null = null
      for (const g of glossary) {
        if (used.has(g.term)) continue
        const m = new RegExp(`(?<![\\p{L}\\p{N}])${esc(g.term)}(?:e?s)?(?![\\p{L}\\p{N}])`, 'iu').exec(rest)
        if (m && (!best || m.index < best.i)) best = { i: m.index, len: m[0].length, g }
      }
      if (!best) break
      used.add(best.g.term)
      out.push(rest.slice(0, best.i), <Term key={out.length} text={rest.slice(best.i, best.i + best.len)} g={best.g} />)
      rest = rest.slice(best.i + best.len)
    }
    out.push(rest)
    return out
  }
}

/** Texto de las lecciones: párrafos (línea en blanco), viñetas («• » o «1. ») y **negrita**.
 *  Con `glossary`, las palabras del glosario se pueden tocar para ver qué significan. */
export function RichText({ text, glossary }: { text: string; glossary?: Gloss[] }) {
  const used = new Set<string>()
  const mark = marker(glossary, used)
  return (
    <div className="flex flex-col gap-2.5">
      {text.split(/\n\n+/).map((block, i) => {
        const lines = block.split('\n')
        const bullets = lines.every(l => /^(•|-|\d+\.)\s/.test(l))
        if (bullets)
          return (
            <ul key={i} className="m-0 flex list-none flex-col gap-1.5 p-0">
              {lines.map((l, j) => {
                const m = l.match(/^(•|-|\d+\.)\s(.*)$/)!
                return (
                  <li key={j} className="t-body flex gap-2 text-[17px] leading-[25px]">
                    <span className="flex-none font-bold" style={{ color: 'var(--brand-ink)', minWidth: 14 }}>
                      {m[1] === '•' || m[1] === '-' ? '•' : m[1]}
                    </span>
                    <span>{inline(m[2], mark)}</span>
                  </li>
                )
              })}
            </ul>
          )
        return (
          <p key={i} className="t-body m-0 text-[17px] leading-[26px]">
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l, mark)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
