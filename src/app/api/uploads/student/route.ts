// Solicitud de precio de estudiante con su justificante (multipart/form-data: institution, studentEmail, photo).
// Va aparte de /api/[...path] porque allí el cuerpo está limitado a 32 KB y aquí llega un archivo de hasta 3 MB.
import { HttpError } from '@/server/game/core'
import { requestStudent } from '@/server/game/students'
import { clientIp, rateLimit } from '@/server/http/ratelimit'
import { currentUser } from '@/server/auth'
import { STUDENT_MAX_BYTES } from '@/shared/plans'

const err = (status: number, code: string, message: string) => Response.json({ error: { code, message } }, { status })

/** Solo desde la propia app (protección CSRF), como el resto de la API */
function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return req.headers.get('sec-fetch-site') === 'same-origin'
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return err(403, 'FORBIDDEN', 'Origen no permitido')
  // «Ver como» (admin) es solo lectura
  if (req.headers.get('x-view-as')) return err(403, 'VIEW_ONLY', 'Estás viendo la app como otro usuario: solo lectura.')
  try {
    await rateLimit(`w:${clientIp(req)}`, 900, 60)
    const u = await currentUser()
    if (!u) return err(401, 'UNAUTHORIZED', 'Inicia sesión para continuar')
    await rateLimit(`stu:${u.id}`, 10, 3600)
    // Tamaño: se corta antes de leerlo entero (3 MB del archivo + los campos del formulario)
    const len = Number(req.headers.get('content-length') ?? 0)
    if (len > STUDENT_MAX_BYTES + 64 * 1024) return err(413, 'FILE_TOO_BIG', 'El archivo pesa más de 3 MB')
    let form: FormData
    try {
      form = await req.formData()
    } catch {
      return err(422, 'VALIDATION_ERROR', 'Datos no válidos')
    }
    const photo = form.get('photo')
    const institution = form.get('institution')
    const studentEmail = form.get('studentEmail')
    if (typeof institution !== 'string' || institution.length > 500) return err(422, 'INSTITUTION_REQUIRED', 'Escribe el nombre de tu centro de estudios')
    if (studentEmail !== null && (typeof studentEmail !== 'string' || studentEmail.length > 200)) return err(422, 'INVALID_EMAIL', 'Ese email no parece válido')
    if (!(photo instanceof File) || !photo.size) return err(422, 'FILE_REQUIRED', 'Adjunta una foto del carné o de la matrícula')
    if (photo.size > STUDENT_MAX_BYTES) return err(413, 'FILE_TOO_BIG', 'El archivo pesa más de 3 MB')
    const bytes = new Uint8Array(await photo.arrayBuffer())
    const out = await requestStudent({ institution, studentEmail: studentEmail || null, photo: bytes, type: photo.type })
    return Response.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof HttpError) return err(e.status, e.code, e.message)
    console.error('API POST /uploads/student', e)
    return err(500, 'INTERNAL', 'Algo no ha ido bien. Prueba otra vez.')
  }
}
