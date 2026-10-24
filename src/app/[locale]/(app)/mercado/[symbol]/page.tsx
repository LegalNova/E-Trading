import { Suspense } from 'react'
import { Asset } from '@/client/screens/market'
import { PageSkeleton } from '@/client/ui/kit'

// 1.675 activos: la ficha se genera bajo demanda (el símbolo puede llevar ^, = o .)
async function WithSymbol({ params }: { params: PageProps<'/[locale]/mercado/[symbol]'>['params'] }) {
  const { symbol } = await params
  return <Asset symbol={decodeURIComponent(symbol)} />
}

export default function Page({ params }: PageProps<'/[locale]/mercado/[symbol]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithSymbol params={params} />
    </Suspense>
  )
}
