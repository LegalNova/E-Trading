'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, ICONS } from './Icon'
import { h1 } from './styles'

/** true cuando la página se ha desplazado más de `threshold` px */
export function useScrolled(threshold = 36): boolean {
  const [s, setS] = useState(false)
  useEffect(() => {
    const on = () => setS(window.scrollY > threshold)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [threshold])
  return s
}

/**
 * Barra superior de 44 px estilo iOS: el título pequeño aparece al hacer
 * scroll (cuando el título grande ya no se ve).
 */
export function NavBar({
  title,
  back,
  backLabel,
  left,
  right,
  alwaysTitle,
}: {
  title: string
  back?: string | (() => void)
  backLabel?: string
  left?: React.ReactNode
  right?: React.ReactNode
  alwaysTitle?: boolean
}) {
  const scrolled = useScrolled()
  const router = useRouter()
  const show = alwaysTitle || scrolled
  const goBack = () => (typeof back === 'function' ? back() : back ? router.push(back) : router.back())

  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 30, height: 44, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 4px', paddingTop: 'env(safe-area-inset-top, 0px)', boxSizing: 'content-box',
        background: scrolled ? 'color-mix(in srgb, var(--bg) 88%, transparent)' : 'var(--bg)',
        backdropFilter: scrolled ? 'saturate(180%) blur(16px)' : undefined,
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(16px)' : undefined,
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition: 'border-color 150ms ease-out',
      }}
    >
      <div style={{ minWidth: 72, display: 'flex', alignItems: 'center' }}>
        {back !== undefined ? (
          <button
            onClick={goBack}
            style={{ height: 44, padding: '0 8px', border: 'none', background: 'none', color: 'var(--blue)', font: '400 17px var(--font)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Icon d={ICONS.back} size={20} />
            {backLabel}
          </button>
        ) : left}
      </div>
      <span
        aria-hidden={!show}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)', maxWidth: '55%', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', font: '600 17px var(--font)', opacity: show ? 1 : 0,
          transition: 'opacity 150ms ease-out', fontVariantNumeric: 'tabular-nums',
        }}
      >
        {title}
      </span>
      <div style={{ minWidth: 72, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{right}</div>
    </div>
  )
}

/** Título grande de página */
export function LargeTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={{ ...h1, padding: '4px 16px 0' }}>{children}</h1>
}
