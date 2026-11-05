'use client'
// Centro de ayuda: buscador sin tildes, filtros por tema y respuestas plegables (enlazables con #id).
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { HelpDoc } from '@/help/types'
import { Icon } from './ui/icons'

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function HelpCenter({ doc, legal }: { doc: HelpDoc; legal: { href: string; label: string }[] }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  // Un enlace a /ayuda#vidas abre esa respuesta
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    const el = id ? document.getElementById(id) : null
    if (el instanceof HTMLDetailsElement) {
      el.open = true
      el.scrollIntoView({ block: 'center' })
    }
  }, [])
  const words = norm(q).split(/\s+/).filter(Boolean)
  const cats = doc.categories
    .filter(c => !cat || c.id === cat)
    .map(c => ({ ...c, items: c.items.filter(i => words.every(w => norm([i.q, ...i.a].join(' ')).includes(w))) }))
    .filter(c => c.items.length)
  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Icon name="search" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2" />
        <input className="input pl-10" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={doc.search} aria-label={doc.search} />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={doc.title}>
        {[{ id: null, title: doc.all }, ...doc.categories].map(c => (
          <button key={c.id ?? 'all'} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className="rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition-colors" style={cat === c.id ? { background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
            {c.title}
          </button>
        ))}
      </div>
      {cats.length ? (
        cats.map(c => (
          <section key={c.id} className="flex flex-col gap-2">
            <h2 className="t-head m-0">{c.title}</h2>
            <div className="card flex flex-col p-0">
              {c.items.map((i, k) => (
                <details key={i.id} id={i.id} className="group px-4" style={k ? { borderTop: '1px solid var(--line)' } : undefined}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{i.q}</span>
                    <span className="transition-transform group-open:rotate-90" style={{ color: 'var(--ink-3)' }}>
                      <Icon name="chev" size={18} />
                    </span>
                  </summary>
                  <div className="flex flex-col gap-2 pb-4">
                    {i.a.map((p, j) => (
                      <p key={j} className="t-body m-0" style={{ color: 'var(--ink-2)' }}>
                        {p}
                      </p>
                    ))}
                    {i.links?.map(l => (
                      <Link key={l.href} href={l.href} className="link self-start text-[14px] font-bold">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="t-foot">{doc.noResults}</p>
      )}
      <div className="card flex flex-col items-start gap-2">
        <b>{doc.contactTitle}</b>
        <span className="t-foot">{doc.contactBody}</span>
        <Link href="/#contacto" className="btn btn-primary w-auto">
          {doc.contactCta}
        </Link>
      </div>
      <nav className="flex flex-col gap-1.5" aria-label={doc.legalTitle}>
        <b className="t-cap">{doc.legalTitle}</b>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {legal.map(l => (
            <Link key={l.href} href={l.href} className="t-foot font-semibold">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
