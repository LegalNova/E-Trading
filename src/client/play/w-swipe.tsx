'use client'
// «Desliza las tarjetas» (auditoría PRO-15): cada tarjeta se lanza a la izquierda o a la derecha según su grupo.
// Con el dedo (arrastrar) o con los dos botones de abajo; con teclado, flechas izquierda y derecha. Se corrige al momento.
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Glyph, GlyphTile } from './glyph'
import type { WidgetT } from '@/shared/play'
import { useMetrics } from './kit'

type W<K extends WidgetT['kind']> = { w: Extract<WidgetT, { kind: K }>; onMetrics: (m: Record<string, number>) => void }

const THRESHOLD = 80 // px de arrastre para lanzar la tarjeta

export function Swipe({ w, onMetrics }: W<'swipe'>) {
  const t = useTranslations('play')
  const [picks, setPicks] = useState<number[]>([])
  const [dx, setDx] = useState(0)
  const [fly, setFly] = useState<0 | 1 | null>(null)
  const [dragging, setDragging] = useState(false)
  const i = picks.length
  const card = w.cards[i]
  const last = i > 0 ? { c: w.cards[i - 1], ok: picks[i - 1] === w.cards[i - 1].bin } : null
  const correct = picks.filter((p, k) => p === w.cards[k].bin).length
  useMetrics({ done: i, cards: w.cards.length, correct, wrong: i - correct }, onMetrics)

  const pick = (bin: 0 | 1) => {
    if (!card || fly !== null) return
    setFly(bin)
    // La tarjeta sale volando y entra la siguiente
    setTimeout(() => {
      setPicks(p => [...p, bin])
      setFly(null)
      setDx(0)
    }, 220)
  }
  // Flechas del teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') pick(0)
      if (e.key === 'ArrowRight') pick(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const x = fly === null ? dx : fly === 0 ? -420 : 420
  const lean = Math.max(-1, Math.min(1, x / 160))
  return (
    <div className="flex flex-col gap-3">
      <span className="t-cap text-center">{t('swipeHint')}</span>
      <div className="relative grid min-h-[190px] place-items-center">
        {card ? (
          <div
            key={i}
            role="group"
            aria-label={card.label}
            className="card flex w-full max-w-[320px] touch-none flex-col items-center gap-1 py-6 text-center select-none"
            style={{ transform: `translateX(${x}px) rotate(${lean * 12}deg)`, transition: dragging ? 'none' : 'transform 0.22s ease-out', boxShadow: '0 8px 24px rgb(0 0 0 / 0.08)', cursor: 'grab' }}
            onPointerDown={e => {
              // El arrastre se sigue en toda la ventana: soltar fuera de la tarjeta también cuenta
              const x0 = e.clientX
              let last = 0
              setDragging(true)
              const move = (ev: PointerEvent) => {
                last = ev.clientX - x0
                setDx(last)
              }
              const up = () => {
                window.removeEventListener('pointermove', move)
                window.removeEventListener('pointerup', up)
                window.removeEventListener('pointercancel', up)
                setDragging(false)
                if (last <= -THRESHOLD) pick(0)
                else if (last >= THRESHOLD) pick(1)
                else setDx(0)
              }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', up)
              window.addEventListener('pointercancel', up)
            }}
          >
            {/* Qué grupo se elige al soltar, mientras se arrastra */}
            {Math.abs(lean) > 0.25 && (
              <span className="chip absolute top-3" style={{ [lean < 0 ? 'left' : 'right']: 12, opacity: Math.min(1, Math.abs(lean)) }}>
                {w.bins[lean < 0 ? 0 : 1].label}
              </span>
            )}
            <GlyphTile name={card.icon} size={64} />
            <b className="t-head">{card.label}</b>
            <span className="t-cap">
              {i + 1} / {w.cards.length}
            </span>
          </div>
        ) : (
          <div className="card animate-pop w-full py-4 text-center">
            <b className="t-head">{t('sortDone', { ok: correct, n: w.cards.length })}</b>
          </div>
        )}
      </div>
      {last && (
        <div key={`f${i}`} className="animate-rise rounded-2xl px-3.5 py-2.5" style={{ background: `color-mix(in srgb, var(--${last.ok ? 'up' : 'down'}) 11%, var(--surface))` }} aria-live="polite">
          <b className={last.ok ? 'up' : 'down'}>{last.ok ? t('right') : t('notQuite', { bin: w.bins[last.c.bin].label })}</b>
          <p className="t-foot m-0 mt-0.5" style={{ color: 'var(--ink)' }}>
            {last.c.why}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {w.bins.map((b, k) => (
          <button key={b.label} className="btn btn-secondary flex h-auto min-h-[56px] items-center gap-1.5 py-2" disabled={!card || fly !== null} onClick={() => pick(k as 0 | 1)}>
            {k === 0 && <span aria-hidden="true">←</span>}
            <span className="text-[14px] leading-tight">{b.label}</span>
            {k === 1 && <span aria-hidden="true">→</span>}
          </button>
        ))}
      </div>
      {!card && (
        <button className="btn btn-plain" onClick={() => setPicks([])}>
          <Glyph name="repeat" size={16} /> {t('again')}
        </button>
      )}
    </div>
  )
}
