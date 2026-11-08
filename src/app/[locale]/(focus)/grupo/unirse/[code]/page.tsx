// Enlace para unirse a un plan de grupo: /grupo/unirse/<código>
import { Suspense } from 'react'
import { JoinGroup } from '@/client/screens/groups'
import { PageSkeleton } from '@/client/ui/kit'

async function WithCode({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <JoinGroup code={code} />
}

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithCode params={params} />
    </Suspense>
  )
}
