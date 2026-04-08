export interface Nivel {
  nivel: number
  nombre: string
  xpMin: number
  xpMax: number | null
}

export const NIVELES: Nivel[] = [
  { nivel: 1, nombre: 'Principiante', xpMin: 0, xpMax: 500 },
  { nivel: 2, nombre: 'Aficionado', xpMin: 500, xpMax: 1500 },
  { nivel: 3, nombre: 'Intermedio', xpMin: 1500, xpMax: 3000 },
  { nivel: 4, nombre: 'Avanzado', xpMin: 3000, xpMax: 5000 },
  { nivel: 5, nombre: 'Maestro', xpMin: 5000, xpMax: null },
]

export function getNivel(xp: number): Nivel {
  for (let i = NIVELES.length - 1; i >= 0; i--) {
    if (xp >= NIVELES[i].xpMin) return NIVELES[i]
  }
  return NIVELES[0]
}

export function getXPProgress(xp: number): { nivel: Nivel; progreso: number; xpParaSiguiente: number | null } {
  const nivel = getNivel(xp)
  if (nivel.xpMax === null) {
    return { nivel, progreso: 100, xpParaSiguiente: null }
  }
  const rango = nivel.xpMax - nivel.xpMin
  const avance = xp - nivel.xpMin
  const progreso = Math.round((avance / rango) * 100)
  const xpParaSiguiente = nivel.xpMax - xp
  return { nivel, progreso, xpParaSiguiente }
}

export const LIGAS = [
  'Novato', 'Aprendiz', 'Analista', 'Trader', 'Estratega',
  'Gestor', 'Experto', 'Maestro', 'Élite', 'Leyenda',
]

export function getLigaNombre(nivel: number): string {
  return LIGAS[Math.min(nivel - 1, LIGAS.length - 1)] || 'Novato'
}
