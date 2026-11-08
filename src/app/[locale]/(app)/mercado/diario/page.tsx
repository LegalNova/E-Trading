import { Suspense } from 'react'
import { Journal } from '@/client/journal'
import { PageSkeleton } from '@/client/ui/kit'

// Diario de operaciones (desde Cartera; los recordatorios llegan con ?entrada=<id>)
export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Journal />
    </Suspense>
  )
}
