// Justificante de una solicitud de precio de estudiante: solo para el equipo (requireAdmin) y mientras no se decida
// (al aprobar o rechazar se borra). Nunca se guarda en caché.
import { HttpError } from '@/server/game/core'
import { adminStudentPhoto } from '@/server/game/students'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  if (!/^[a-z0-9]{10,40}$/.test(id)) return Response.json({ error: { code: 'NOT_FOUND', message: 'No encontrado' } }, { status: 404 })
  try {
    const { bytes, type } = await adminStudentPhoto(id)
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': type,
        'Content-Disposition': `inline; filename="justificante-${id}.${type === 'application/pdf' ? 'pdf' : type === 'image/png' ? 'png' : 'jpg'}"`,
        'Cache-Control': 'no-store, private',
        'X-Content-Type-Options': 'nosniff',
        // Abierta sola, una imagen no puede cargar ni ejecutar nada (el visor de PDF del navegador ya va aislado)
        ...(type === 'application/pdf' ? {} : { 'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" }),
      },
    })
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: { code: e.code, message: e.message } }, { status: e.status })
    console.error('API GET /uploads/student/:id', e)
    return Response.json({ error: { code: 'INTERNAL', message: 'Algo no ha ido bien.' } }, { status: 500 })
  }
}
