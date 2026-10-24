import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import { LEGAL, LEGAL_SLUGS, type LegalSlug } from '@/legal'
import { Wordmark } from '@/client/ui/icons'

type P = PageProps<'/[locale]/legal/[doc]'>

export function generateStaticParams() {
  return LEGAL_SLUGS.map(doc => ({ doc }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, doc } = await params
  const d = LEGAL[(locale as 'es') ?? 'es']?.[doc as LegalSlug]
  return d ? { title: d.title, description: d.intro } : {}
}

async function Doc({ params }: { params: P['params'] }) {
  const { locale, doc } = await params
  const docs = LEGAL[locale as 'es' | 'ca' | 'en'] ?? LEGAL.es
  const d = docs[doc as LegalSlug]
  if (!d) notFound()
  return (
    <article className="mx-auto max-w-[760px] px-4 py-8">
      <nav className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Legal">
        <Link href="/" className="mr-2 flex items-center gap-2 font-extrabold" style={{ color: 'var(--ink)' }}>
          <Wordmark size={19} />
        </Link>
        {LEGAL_SLUGS.map(s => (
          <Link key={s} href={`/legal/${s}`} className="t-foot font-semibold" aria-current={s === doc ? 'page' : undefined} style={s === doc ? { color: 'var(--brand)' } : undefined}>
            {docs[s].title}
          </Link>
        ))}
      </nav>
      <h1 className="t-large mb-2">{d.title}</h1>
      <p className="t-foot mb-8">{d.intro}</p>
      {d.sections.map(s => (
        <section key={s.h} className="mb-7">
          <h2 className="t-head mb-2">{s.h}</h2>
          {s.p?.map((t, i) => (
            <p key={i} className="t-body mb-2" style={{ color: 'var(--ink)' }}>
              {t}
            </p>
          ))}
          {s.list && (
            <ul className="t-body mb-2 list-disc space-y-1.5 pl-5">
              {s.list.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
          {s.table && (
            <div className="card mt-2 overflow-x-auto p-0">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {s.table.head.map(h => (
                      <th key={h} className="border-b px-3 py-2.5 font-bold" style={{ borderColor: 'var(--line)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (
                        <td key={j} className="border-b px-3 py-2.5 align-top" style={{ borderColor: 'var(--line)', fontWeight: j === 0 ? 600 : 400, wordBreak: 'break-word' }}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </article>
  )
}

export default function Page({ params }: P) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[760px] px-4 py-8" />}>
      <Doc params={params} />
    </Suspense>
  )
}
