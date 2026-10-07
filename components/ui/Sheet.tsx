'use client'
import { useEffect, useRef } from 'react'

/** Hoja inferior en móvil; panel centrado (máx. 480 px) en escritorio */
export function Sheet({ open, onClose, children, label }: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  label?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', animation: 'etfade 200ms ease-out' }} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{
          position: 'relative', width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto',
          background: 'var(--surface-1)', borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)', borderRadius: '6px 6px 0 0', boxShadow: 'var(--shadow)',
          padding: '8px 16px calc(24px + env(safe-area-inset-bottom, 0px))', animation: 'etsheet 220ms ease-out', outline: 'none',
        }}
      >
        <div style={{ width: 36, height: 4, background: 'var(--border-strong)', margin: '0 auto 12px' }} />
        {children}
      </div>
    </div>
  )
}
