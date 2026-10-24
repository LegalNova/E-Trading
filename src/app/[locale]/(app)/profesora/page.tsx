import { Suspense } from 'react'
import { Tutor } from '@/client/screens/tutor'
import { PageSkeleton } from '@/client/ui/kit'
import { LESSON } from '@/server/content/catalog'

// ?leccion=u8l5 abre el chat con una pregunta sobre esa lección
async function WithLesson({ searchParams }: { searchParams: PageProps<'/[locale]/profesora'>['searchParams'] }) {
  const sp = await searchParams
  const id = typeof sp.leccion === 'string' ? sp.leccion.slice(0, 12) : undefined
  return <Tutor lessonTitle={id ? LESSON[id]?.title : undefined} />
}

export default function Page({ searchParams }: PageProps<'/[locale]/profesora'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithLesson searchParams={searchParams} />
    </Suspense>
  )
}
