import { Suspense } from 'react'
import { ThesisFlow } from '@/client/screens/project'
import { PageSkeleton } from '@/client/ui/kit'

// Una tesis: la guía paso a paso, la ficha de tesis, la puntuación y el certificado
async function WithId({ params }: { params: PageProps<'/[locale]/tesis/[id]'>['params'] }) {
  const { id } = await params
  return <ThesisFlow id={id.slice(0, 40)} />
}

export default function Page({ params }: PageProps<'/[locale]/tesis/[id]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithId params={params} />
    </Suspense>
  )
}
