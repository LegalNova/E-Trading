import { Suspense } from 'react'
import { Tutor } from '@/client/screens/tutor'
import { PageSkeleton } from '@/client/ui/kit'
import { LESSON } from '@/server/content/catalog'

// ?leccion=u8l5 abre el chat con una pregunta sobre esa lección; ?q=… con una pregunta ya escrita
async function WithLesson({ searchParams }: { searchParams: PageProps<'/[locale]/profesora'>['searchParams'] }) {
  const sp = await searchParams
  const id = typeof sp.leccion === 'string' ? sp.leccion.slice(0, 12) : undefined
  // ?q=… llega desde «No lo entiendo» en un quiz: la pregunta ya escrita, lista para enviar
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 500) : undefined
  return <Tutor lessonTitle={id ? LESSON[id]?.title : undefined} initial={q} />
}

export default function Page({ searchParams }: PageProps<'/[locale]/profesora'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithLesson searchParams={searchParams} />
    </Suspense>
  )
}
