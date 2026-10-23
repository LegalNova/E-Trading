import 'server-only'
// Las tareas programadas de Vercel envían «Authorization: Bearer CRON_SECRET»
export function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET
  return !!secret && req.headers.get('authorization') === `Bearer ${secret}`
}
