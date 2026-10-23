import { Suspense } from 'react'
import { LESSON } from '@/server/content/catalog'
import { Quiz } from '@/client/screens/quiz'
import { PageSkeleton } from '@/client/ui/kit'

export function generateStaticParams() {
  return [...Object.keys(LESSON), 'review'].map(id => ({ id }))
}

async function WithId({ params }: { params: PageProps<'/[locale]/quiz/[id]'>['params'] }) {
  const { id } = await params
  return <Quiz id={id} />
}

export default function Page({ params }: PageProps<'/[locale]/quiz/[id]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithId params={params} />
    </Suspense>
  )
}
