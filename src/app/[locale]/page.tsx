import { Landing } from '@/client/screens/landing'
import { UNITS } from '@/server/content/catalog'

// Clases del curso, contadas del propio catálogo (sin repasos de unidad ni retos de sección): la cifra de la portada
// siempre es la real
const LESSONS = UNITS.flatMap(u => u.lessons).filter(l => !/(r|boss)$/.test(l.id)).length

export default function Page() {
  return <Landing lessons={LESSONS} />
}
