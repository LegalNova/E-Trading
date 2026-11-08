// Página pública de un logro compartido: la tarjeta, la vista previa para WhatsApp y redes, y el botón para probar Lumi
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import { Wordmark } from '@/client/ui/icons'
import { resolveShare } from '@/server/share'
import { OWNER } from '@/legal/owner'

type P = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
const qs = (sp: Record<string, string | string[] | undefined>) => new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])))
// La nota de los 7 días de Max solo vale si el enlace lleva el código de quien invita
const CTA = { es: ['Pruébalo gratis', 'Sin tarjeta. Si entras con este enlace, tienes 7 días de Max.', 'Sin tarjeta. El plan Free es gratis para siempre.'], ca: ['Prova-ho gratis', 'Sense targeta. Si entres amb aquest enllaç, tens 7 dies de Max.', 'Sense targeta. El pla Free és gratis per sempre.'], en: ['Try it free', 'No card needed. Join with this link and get 7 days of Max.', 'No card needed. The Free plan is free forever.'] }

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { locale } = await params
  const q = qs(await searchParams)
  q.set('l', locale)
  const card = await resolveShare(q)
  if (!card) return { title: 'Lumi' }
  const image = `/api/share/image?${q.toString()}`
  const title = `${card.big.match(/^\d+$/) ? card.big + ' ' : ''}${card.title}`
  return { metadataBase: new URL(OWNER.site), title, description: card.who ?? undefined, openGraph: { title, description: card.cta, images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', title, images: [image] }, robots: { index: false } }
}

async function Card({ params, searchParams }: P) {
  const { locale } = await params
  const q = qs(await searchParams)
  q.set('l', locale)
  const card = await resolveShare(q)
  const [cta, noteInvite, noteFree] = CTA[(locale as 'es') in CTA ? (locale as 'es') : 'es']
  const note = card?.code ? noteInvite : noteFree
  const join = card?.code ? `/?inv=${card.code}` : '/'
  return (
    <main className="mx-auto flex min-h-dvh max-w-[560px] flex-col gap-5 px-4 py-8">
      <Link href="/" className="self-start" style={{ color: 'var(--ink)' }}>
        <Wordmark size={20} />
      </Link>
      {card ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/share/image?${q.toString()}&f=story`} alt={`${card.big} ${card.title}`} className="w-full rounded-3xl shadow-xl" width={1080} height={1350} />
      ) : null}
      <Link href={join} className="btn btn-primary">
        {cta}
      </Link>
      <p className="t-cap m-0 text-center">{note}</p>
    </main>
  )
}

export default function Page(props: P) {
  return (
    <Suspense fallback={<main className="min-h-dvh" />}>
      <Card {...props} />
    </Suspense>
  )
}
