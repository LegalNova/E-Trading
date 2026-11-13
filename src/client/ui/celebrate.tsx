'use client'
// Momentos de celebración (auditoría PRO-10 a PRO-12): confeti, estrellas que aparecen una a una, caja de regalo que
// se abre y llama de racha que crece. Reglas: dura menos de 1,5 s, se corta al tocar la pantalla, nunca tapa ni
// bloquea un botón (no recibe toques) y no se hace nada si el sistema pide «reducir movimiento». Sin librerías: un
// lienzo y CSS, para no añadir peso a la primera carga.
import { useEffect, useRef } from 'react'

/** ¿Se puede animar? (respeta «reducir movimiento» del sistema) */
export const motionOK = () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

/**
 * Confeti en un lienzo a pantalla completa. `amount`: piezas (60 normal, 140 en los momentos grandes). Se dispara una
 * vez al montarse (o cuando cambia `fire`) y desaparece solo.
 */
export function Confetti({ amount = 70, fire = 1, duration = 1400 }: { amount?: number; fire?: number; duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv || !fire || !motionOK()) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = window.innerWidth
    const H = window.innerHeight
    cv.width = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)
    // Salen de dos puntos en la parte alta y caen con gravedad, girando
    const parts = Array.from({ length: amount }, (_, i) => {
      const fromLeft = i % 2 === 0
      const a = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.9
      const v = 7 + Math.random() * 7
      return {
        x: fromLeft ? W * 0.2 : W * 0.8,
        y: H * 0.3,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 5,
        h: 3 + Math.random() * 4,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[i % COLORS.length],
      }
    })
    const t0 = performance.now()
    let raf = 0
    let stopped = false
    const stop = () => {
      stopped = true
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, W, H)
    }
    const frame = (now: number) => {
      if (stopped) return
      const k = (now - t0) / duration
      ctx.clearRect(0, 0, W, H)
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, k - 0.6) / 0.4)
      for (const p of parts) {
        p.vy += 0.35
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.r += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.r)
        ctx.fillStyle = p.c
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (k < 1) raf = requestAnimationFrame(frame)
      else stop()
    }
    raf = requestAnimationFrame(frame)
    // Tocar la pantalla lo corta (y el toque llega igual a lo que haya debajo)
    window.addEventListener('pointerdown', stop, { once: true })
    return () => {
      stop()
      window.removeEventListener('pointerdown', stop)
    }
  }, [amount, fire, duration])
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />
}

/** Tres estrellas que aparecen una detrás de otra; las no ganadas se quedan grises */
export function StarsReveal({ n, size = 34 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-1.5" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={i < n ? 'star-in' : undefined}
          style={{ fontSize: size, lineHeight: 1, color: i < n ? 'var(--gold, #f5b301)' : 'var(--ink-3)', animationDelay: `${250 + i * 220}ms`, display: 'inline-block' }}
        >
          ★
        </span>
      ))}
    </span>
  )
}

/** Caja de regalo cuya tapa salta al abrirse (`open`), con rayos de luz detrás */
export function GiftBox({ open, size = 96, shaking }: { open: boolean; size?: number; shaking?: boolean }) {
  return (
    <span className={`relative inline-grid place-items-center ${shaking ? 'gift-shake' : ''}`} style={{ width: size, height: size }} aria-hidden="true">
      {open && <span className="gift-rays absolute inset-[-30%] rounded-full" />}
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: 'visible' }}>
        <g className={open ? 'gift-lid-off' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <rect x="6" y="14" width="36" height="9" rx="3" fill="var(--brand)" />
          <rect x="21" y="14" width="6" height="9" fill="var(--on-brand)" opacity="0.85" />
          <path d="M24 14c-3-6-11-6-9-1 1 2 6 1 9 1zm0 0c3-6 11-6 9-1-1 2-6 1-9 1z" fill="var(--brand)" stroke="var(--on-brand)" strokeWidth="1.2" />
        </g>
        <rect x="9" y="23" width="30" height="20" rx="3" fill="var(--brand)" />
        <rect x="9" y="23" width="30" height="20" rx="3" fill="#000" opacity="0.12" />
        <rect x="21" y="23" width="6" height="20" fill="var(--on-brand)" opacity="0.85" />
      </svg>
    </span>
  )
}

/** Llama de racha: crece con un latido cuando la racha acaba de subir */
export function StreakFlame({ grew, size = 22 }: { grew: boolean; size?: number }) {
  return (
    <span className={grew ? 'flame-grow' : undefined} style={{ display: 'inline-block', lineHeight: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4 0-6 1-9z" fill="#f97316" />
        <path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 2-3 0 1 .5 1.5 1 1.5 0-1.5-.2-2.5 0-3.5z" fill="#fde047" />
      </svg>
    </span>
  )
}

/** Hitos de racha con celebración especial */
export const STREAK_MILESTONES = [7, 30, 100] as const
export const isStreakMilestone = (days: number) => (STREAK_MILESTONES as readonly number[]).includes(days)
