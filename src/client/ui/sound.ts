'use client'
// Sonido y vibración (auditoría PRO-13): opcionales y apagados por defecto (Ajustes → «Sonido y vibración»).
// Los sonidos se generan en el navegador (sin archivos que descargar): uno corto de acierto, otro de fallo
// y una pequeña fanfarria al terminar una clase. Con «reducir movimiento» no se vibra.
import { useCallback } from 'react'
import { useSettings } from '../hooks'

export type Fx = 'right' | 'wrong' | 'done'

let ctx: AudioContext | null = null
function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Una nota corta con subida y caída suaves (sin chasquidos) */
function note(a: AudioContext, freq: number, at: number, len: number, vol = 0.12, type: OscillatorType = 'sine') {
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(vol, at + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, at + len)
  o.connect(g).connect(a.destination)
  o.start(at)
  o.stop(at + len + 0.02)
}

const NOTES: Record<Fx, [number, number, number][]> = {
  // [frecuencia, empieza (s), dura (s)]
  right: [[880, 0, 0.12], [1318.5, 0.08, 0.18]],
  wrong: [[220, 0, 0.18]],
  done: [[523.25, 0, 0.14], [659.25, 0.12, 0.14], [783.99, 0.24, 0.14], [1046.5, 0.36, 0.32]],
}
const BUZZ: Record<Fx, number[]> = { right: [18], wrong: [40, 60, 40], done: [30, 50, 30, 50, 60] }

export function playFx(kind: Fx) {
  const a = audio()
  if (a) for (const [f, t, len] of NOTES[kind]) note(a, f, a.currentTime + t, len, kind === 'wrong' ? 0.08 : 0.12, kind === 'wrong' ? 'triangle' : 'sine')
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!still && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(BUZZ[kind])
    } catch {
      /* algunos navegadores no dejan vibrar: no pasa nada */
    }
  }
}

/** Devuelve una función que suena y vibra solo si la persona lo ha activado en Ajustes */
export function useFx() {
  const { data } = useSettings()
  const on = !!data?.sound
  return useCallback((kind: Fx) => on && playFx(kind), [on])
}
