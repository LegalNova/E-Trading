// Enlace para unirse a una liga de amigos: /liga/unirse/<código>?inv=<código de invitación de quien lo comparte>
import { Suspense } from 'react'
import { JoinLeague } from '@/client/screens/friends'
import { PageSkeleton } from '@/client/ui/kit'

async function WithCode({ params }: { params: PageProps<'/[locale]/liga/unirse/[code]'>['params'] }) {
  const { code } = await params
  return <JoinLeague code={code} />
}

export default function Page({ params }: PageProps<'/[locale]/liga/unirse/[code]'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WithCode params={params} />
    </Suspense>
  )
}
