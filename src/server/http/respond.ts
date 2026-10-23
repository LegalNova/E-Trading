import 'server-only'
// Respuestas comunes de la API: siempre { error: { code, message } } en los errores (docs/07 §0)

export function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status })
}

/** JSON que la CDN de Vercel puede servir unos segundos a todos (datos públicos de mercado) */
export function publicJson(data: unknown, sMaxAge: number) {
  return Response.json(data, { headers: { 'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge * 3}` } })
}
