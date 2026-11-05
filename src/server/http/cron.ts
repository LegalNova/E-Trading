import 'server-only'
import { timingSafeEqual } from 'node:crypto'
// Las tareas programadas de Vercel envían «Authorization: Bearer CRON_SECRET».
// Comparación en tiempo constante: no deja adivinar la clave midiendo lo que tarda la respuesta.
export function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const got = Buffer.from(req.headers.get('authorization') ?? '')
  const want = Buffer.from(`Bearer ${secret}`)
  return got.length === want.length && timingSafeEqual(got, want)
}
