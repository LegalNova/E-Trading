// Página pública de un regalo: quién lo regala, el mensaje, qué incluye y el botón para canjearlo.
// La vista previa (WhatsApp, redes) dice quién lo regala, sin el mensaje (eso solo lo ve quien abre el enlace).
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageSkeleton } from '@/client/ui/kit'
import { getTranslations } from 'next-intl/server'
import { GiftRedeem } from '@/client/screens/gifts'
import { db } from '@/server/db'
import { cleanGiftCode, isGiftCode } from '@/shared/gifts'
import { PLAN_NAME } from '@/shared/plans'
import { safeDecode } from '@/shared/safe-decode'

type P = PageProps<'/[locale]/regalo/[code]'>

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, code } = await params
  const t = await getTranslations({ locale, namespace: 'gifts.redeem' })
  const c = cleanGiftCode(safeDecode(code))
  const g = isGiftCode(c) ? await db.gift.findUnique({ where: { code: c }, select: { fromName: true, tier: true, paidAt: true, source: true } }).catch(() => null) : null
  const ok = g && (g.source !== 'PURCHASE' || g.paidAt)
  const plan = PLAN_NAME[g?.tier === 'PLUS' ? 'PLUS' : 'PREMIUM']
  const title = ok ? (g.fromName ? t('metaFrom', { name: g.fromName, plan }) : t('metaAnon', { plan })) : t('pageTitle')
  return { title, description: t('metaDescription'), openGraph: { title, description: t('metaDescription') }, robots: { index: false, follow: false } }
}

async function WithCode({ params }: { params: P['params'] }) {
  const { code } = await params
  return <GiftRedeem code={cleanGiftCode(safeDecode(code))} />
}

// El código solo se conoce al pedir la página: se pinta bajo demanda (como la ficha de un activo)
export default function Page({ params }: P) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithCode params={params} />
    </Suspense>
  )
}
