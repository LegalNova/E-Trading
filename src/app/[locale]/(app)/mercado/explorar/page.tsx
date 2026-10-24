import { Suspense } from 'react'
import type { AssetFilter } from '@/client/api'
import { Explore } from '@/client/screens/market'
import { PageSkeleton } from '@/client/ui/kit'

const TYPES = ['STOCK', 'ETF', 'INDEX', 'CRYPTO', 'FX', 'COMMODITY']
const REGIONS = ['AMERICA', 'EUROPE', 'ASIA', 'GLOBAL']
const SORTS = ['name', 'gainers', 'losers']

// Los filtros llegan en la URL (?type=STOCK&region=EUROPE&index=IBEX%2035…); se validan aquí
async function WithFilters({ searchParams }: { searchParams: PageProps<'/[locale]/mercado/explorar'>['searchParams'] }) {
  const sp = await searchParams
  const one = (k: string) => {
    const v = sp[k]
    const s = Array.isArray(v) ? v[0] : v
    return s ? s.slice(0, 80) : undefined
  }
  const pick = <T extends string>(k: string, ok: string[]) => (ok.includes(one(k) ?? '') ? (one(k) as T) : undefined)
  const initial: Partial<AssetFilter> = {
    q: one('q'),
    type: pick('type', TYPES),
    region: pick('region', REGIONS),
    sort: pick('sort', SORTS),
    country: one('country'),
    sector: one('sector'),
    index: one('index'),
  }
  return <Explore initial={initial} />
}

export default function Page({ searchParams }: PageProps<'/[locale]/mercado/explorar'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithFilters searchParams={searchParams} />
    </Suspense>
  )
}
