import { Suspense } from 'react'
import { LESSON } from '@/server/content/catalog'
import { Lesson } from '@/client/screens/learn'
import { PageSkeleton } from '@/client/ui/kit'

export function generateStaticParams() {
  return Object.keys(LESSON).map(id => ({ id }))
}

async function WithId({ params }: { params: PageProps<'/[locale]/leccion/[id]'>['params'] }) {
  const { id } = await params
  return <Lesson id={id} />
}

export default function Page({ params }: PageProps<'/[locale]/leccion/[id]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithId params={params} />
    </Suspense>
  )
}
