import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import { HELP } from '@/help'
import { LEGAL, LEGAL_SLUGS } from '@/legal'
import { HelpCenter } from '@/client/help'
import { Wordmark } from '@/client/ui/icons'

type P = { params: Promise<{ locale: string }> }
const pick = (locale: string) => (locale === 'ca' || locale === 'en' ? locale : 'es')

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = HELP[pick((await params).locale)]
  return { title: d.title, description: d.intro }
}

async function Help({ params }: { params: P['params'] }) {
  const l = pick((await params).locale)
  const d = HELP[l]
  const legal = LEGAL_SLUGS.map(s => ({ href: `/legal/${s}`, label: LEGAL[l][s].title }))
  return (
    <main className="mx-auto max-w-[760px] px-4 py-8">
      <nav className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-extrabold" style={{ color: 'var(--ink)' }}>
          <Wordmark size={19} />
        </Link>
      </nav>
      <h1 className="t-large mb-2">{d.title}</h1>
      <p className="t-foot mb-6">{d.intro}</p>
      <HelpCenter doc={d} legal={legal} />
    </main>
  )
}

export default function Page({ params }: P) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[760px] px-4 py-8" />}>
      <Help params={params} />
    </Suspense>
  )
}
