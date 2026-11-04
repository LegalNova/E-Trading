// Preguntas de cifra con opciones para tocar: nadie tiene que salir de la app a hacer cuentas.
// Las opciones salen siempre iguales para la misma pregunta, con el mismo «aspecto» que la respuesta
// (mismas cifras significativas) y nunca dentro del margen que se da por bueno.

/** FNV-1a: semilla estable a partir del id de la pregunta */
const hash = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261)

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Decimales con los que está escrita la cifra (como mucho 2) */
const decimals = (x: number) => Math.min(2, (String(x).split('.')[1] ?? '').length)

/** Unidad de redondeo: 7.612 → 1 · 3.000 → 100 · 2,5 → 0,1 · 0,75 → 0,01 */
function step(x: number) {
  const d = decimals(x)
  if (d) return 10 ** -d
  const a = Math.abs(x)
  if (a < 10) return 1
  let s = 1
  while (a % (s * 10) === 0 && s * 10 <= a / 10) s *= 10
  return s
}

export function numChoices(id: string, sol: number, tol: number): number[] {
  const r = rng(hash(id))
  const u = step(sol)
  const round = (x: number) => Math.round(x / u) * u
  const fix = (x: number) => Number(x.toFixed(decimals(u === 1 || u >= 1 ? 0 : u)))
  const band = Math.max(Math.abs(sol) * tol, 0.005)
  const small = Math.abs(sol) <= 30 && Number.isInteger(sol)
  // Errores típicos: la mitad, el doble, un poco más o menos; en cifras pequeñas, unas unidades arriba o abajo
  const cands = small
    ? [sol - 1, sol + 1, sol - 2, sol + 2, sol + 3, sol - 3, sol * 2, Math.round(sol / 2), sol + 5, sol - 5]
    : [sol * 0.5, sol * 1.5, sol * 2, sol * 0.75, sol * 1.25, sol * 0.8, sol * 1.2, sol * 3, sol * 0.6, sol * 1.4]
  // De reserva (cifras pequeñas o negativas): unos pasos arriba o abajo
  for (const k of [2, -2, 3, -3, 5, -5, 10, -10]) cands.push(sol + k * u)
  const pool = cands.map(round).map(fix)
  // Barajado estable de los candidatos
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const out: number[] = []
  for (const c of pool) {
    if (out.length === 3) break
    if (Math.abs(c - sol) <= band * 2.5) continue // demasiado cerca: podría darse por buena
    if (sol > 0 && c <= 0) continue // ni ceros ni negativos cuando la respuesta es positiva
    if (out.some(o => Math.abs(o - c) <= band)) continue
    out.push(c)
  }
  const all = [sol, ...out]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all
}
