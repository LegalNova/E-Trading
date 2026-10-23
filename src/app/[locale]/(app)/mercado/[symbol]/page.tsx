import { Suspense } from 'react'
import { CATALOG as ASSETS } from '@/server/market/catalog'
import { Asset } from '@/client/screens/market'
import { PageSkeleton } from '@/client/ui/kit'

export function generateStaticParams() {
  return ASSETS.map(a => ({ symbol: a.symbol }))
}

async function WithSymbol({ params }: { params: PageProps<'/[locale]/mercado/[symbol]'>['params'] }) {
  const { symbol } = await params
  return <Asset symbol={symbol} />
}

export default function Page({ params }: PageProps<'/[locale]/mercado/[symbol]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithSymbol params={params} />
    </Suspense>
  )
}
