// Rutas del curso (auditoría TEM-5). Una ruta es una lista de unidades recomendadas, en orden, dentro del mismo curso:
// no mueve secciones ni bloquea nada, y lo que queda fuera sigue abierto en «Para saber más». La persona parte de una
// de las dos rutas y la ajusta a su gusto (por ejemplo, añade «Velas japonesas» a la de largo plazo).
//
// Lo único que una ruta no puede saltarse es el orden del propio curso: cada sección se abre al aprobar el reto final
// de las que necesita, y dentro de una sección las unidades van una detrás de otra. Por eso, al añadir una unidad se
// añaden también las que hacen falta para llegar a ella, y al quitar una salen las que dependían de ella.

export type RouteId = 'LONG' | 'TRADING'
export const ROUTE_IDS: readonly RouteId[] = ['LONG', 'TRADING']

/** Secciones de cada ruta, en el orden en que se recorren (respeta lo que cada sección necesita para abrirse) */
export const ROUTE_SECTIONS: Record<RouteId, readonly string[]> = {
  // Inicio → tu dinero → mercados → productos → psicología → cartera → impuestos, estafas y dónde invertir
  LONG: ['s0', 's1', 's2', 's3', 's9', 's10', 's11'],
  // Inicio → mercados → análisis técnico → riesgo, estrategias y plan → psicología → laboratorio
  TRADING: ['s0', 's2', 's7', 's8', 's9', 's13'],
}

/** Lo mínimo del curso para calcular una ruta: las unidades en su orden, con su sección y lo que esa sección necesita */
export interface RouteUnit { id: string; section: string | null; requires: string[] }
/** Lo que se guarda: la ruta de partida (o ninguna) y las unidades elegidas. Sin unidades = curso entero, como siempre */
export interface RouteChoice { preset: RouteId | null; units: string[] }

const known = (graph: RouteUnit[]) => new Set(graph.filter(u => u.section).map(u => u.id))
const inOrder = (graph: RouteUnit[], ids: Iterable<string>) => { const s = new Set(ids); return graph.filter(u => s.has(u.id)).map(u => u.id) }

/** Unidades que hay que hacer antes de una: las anteriores de su sección y, enteras, las secciones que la suya necesita */
export function needsOf(graph: RouteUnit[], id: string): string[] {
  const u = graph.find(x => x.id === id)
  if (!u?.section) return []
  const out = new Set<string>()
  const seen = new Set<string>()
  const whole = (s: string) => {
    if (seen.has(s)) return
    seen.add(s)
    const us = graph.filter(x => x.section === s)
    for (const x of us) out.add(x.id)
    us[0]?.requires.forEach(whole)
  }
  u.requires.forEach(whole)
  for (const x of graph) {
    if (x.section !== u.section) continue
    if (x.id === id) break
    out.add(x.id)
  }
  return inOrder(graph, out)
}

/** La lista completa y coherente: lo elegido más todo lo que hace falta antes, en el orden del curso */
export function closure(graph: RouteUnit[], units: string[]): string[] {
  const ok = known(graph)
  const out = new Set<string>()
  for (const id of units) {
    if (!ok.has(id)) continue
    out.add(id)
    for (const n of needsOf(graph, id)) out.add(n)
  }
  return inOrder(graph, out)
}

/** Las unidades de una de las dos rutas de partida */
export const presetUnits = (graph: RouteUnit[], preset: RouteId): string[] =>
  closure(graph, graph.filter(u => u.section && ROUTE_SECTIONS[preset].includes(u.section)).map(u => u.id))

/** Añadir una unidad: entra ella y, si faltaban, las que hacen falta antes (`added`) */
export function withUnit(graph: RouteUnit[], units: string[], id: string): { units: string[]; added: string[] } {
  const before = new Set(closure(graph, units))
  const next = closure(graph, [...before, id])
  return { units: next, added: next.filter(x => !before.has(x) && x !== id) }
}

/** Quitar una unidad: sale ella y, con ella, las que la necesitaban (`removed`) */
export function withoutUnit(graph: RouteUnit[], units: string[], id: string): { units: string[]; removed: string[] } {
  const cur = closure(graph, units)
  const removed = cur.filter(x => x !== id && needsOf(graph, x).includes(id))
  const gone = new Set([id, ...removed])
  return { units: cur.filter(x => !gone.has(x)), removed }
}

/**
 * El orden en que se recorre una ruta: primero las secciones de la ruta de partida, en su orden; después las añadidas,
 * en el orden del curso. Nunca coloca una sección antes de las que necesita.
 */
export function ordered(graph: RouteUnit[], units: string[], preset: RouteId | null): string[] {
  const mine = new Set(closure(graph, units))
  const sections = [...new Set(graph.filter(u => u.section && mine.has(u.id)).map(u => u.section as string))]
  const priority = [...(preset ? ROUTE_SECTIONS[preset].filter(s => sections.includes(s)) : []), ...sections].filter((s, i, a) => a.indexOf(s) === i)
  const requires = (s: string) => graph.find(u => u.section === s)?.requires ?? []
  const done: string[] = []
  while (done.length < priority.length) {
    const next = priority.find(s => !done.includes(s) && requires(s).every(r => !sections.includes(r) || done.includes(r))) ?? priority.find(s => !done.includes(s))!
    done.push(next)
  }
  return done.flatMap(s => graph.filter(u => u.section === s && mine.has(u.id)).map(u => u.id))
}

// ── La recomendación de Lumi ─────────────────────────────
// En la bienvenida la persona marca lo que quiere conseguir. Las respuestas se guardan con su texto (en su idioma),
// así que se reconocen por palabras clave y no por posición.
const GOAL: Record<'long' | 'money' | 'market' | 'crypto' | 'technical', RegExp> = {
  long: /largo plazo|llarg termini|long term/i,
  money: /finanzas|finances|ahorrar|estalviar|save/i,
  market: /la bolsa|la borsa|stock market/i,
  crypto: /cripto|crypto/i,
  technical: /t[eéè]cnic|technical/i,
}
const has = (goals: string[], k: keyof typeof GOAL) => goals.some(g => GOAL[k].test(g))

/** La ruta que Lumi recomienda según lo que la persona dijo que buscaba (o ninguna, si no está claro) */
export function suggestedRoute(goals: string[]): RouteId | null {
  if (has(goals, 'long') || has(goals, 'money')) return 'LONG'
  if (has(goals, 'technical')) return 'TRADING'
  return null
}

/** Secciones que Lumi señala como «te pueden interesar» por lo que la persona dijo que buscaba */
export function suggestedSections(goals: string[]): string[] {
  const out: string[] = []
  if (has(goals, 'money')) out.push('s1')
  if (has(goals, 'market')) out.push('s2')
  if (has(goals, 'crypto')) out.push('s4')
  if (has(goals, 'technical')) out.push('s7')
  if (has(goals, 'long')) out.push('s10')
  return out
}
