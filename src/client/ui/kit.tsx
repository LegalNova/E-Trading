'use client'
// Piezas comunes de la interfaz.
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Icon } from './icons'

export function TopBar({ title, back, close, right }: { title?: React.ReactNode; back?: string; close?: string; right?: React.ReactNode }) {
  const router = useRouter()
  const t = useTranslations('common')
  const target = back ?? close
  const go = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else if (target) router.push(target)
  }
  return (
    <div className="topbar">
      {target ? (
        <button className="icon-btn" onClick={go} aria-label={close ? t('close') : t('back')}>
          <Icon name={close ? 'close' : 'back'} />
        </button>
      ) : (
        <span className="w-11" />
      )}
      <span className="t-head flex-1 truncate text-center">{title}</span>
      {right ?? <span className="w-11" />}
    </div>
  )
}

export function Steps({ total, current, label }: { total: number; current: number; label?: string }) {
  return (
    <div className="steps" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < current ? 'on' : ''} />
      ))}
    </div>
  )
}

export function Bar({ pct, color, label }: { pct: number; color?: string; label?: string }) {
  return (
    <div className="bar flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <i style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  )
}

export function Seg<T extends string>({ value, options, onChange, label, className }: { value: T; options: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div className={`seg ${className ?? ''}`} role="group" aria-label={label}>
      {options.map(o => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" className="toggle" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />
}

export function Check({ on }: { on: boolean }) {
  return <span className={`check ${on ? 'on' : ''}`}>{on && <Icon name="check" size={16} strokeWidth={2.4} />}</span>
}

export function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span aria-label={`${n}/3`} style={{ fontSize: size, letterSpacing: 1 }}>
      <span style={{ color: 'var(--brand)' }}>{'★'.repeat(n)}</span>
      <span style={{ color: 'var(--ink-3)' }}>{'★'.repeat(3 - n)}</span>
    </span>
  )
}

/** Hoja inferior modal con foco atrapado y cierre con Escape */
export function Sheet({ open, onClose, label, children, alert }: { open: boolean; onClose?: () => void; label: string; children: React.ReactNode; alert?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('button, input, [tabindex]')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end md:items-center md:justify-center">
      <div className="absolute inset-0 animate-fade" style={{ background: 'var(--scrim)' }} onClick={onClose} />
      <div ref={ref} role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-label={label} className="relative flex max-h-[92dvh] w-full animate-rise flex-col gap-3.5 overflow-y-auto rounded-t-[26px] px-4 pt-2.5 md:max-w-[440px] md:rounded-[26px] md:pb-6" style={{ background: 'var(--bg)', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto mb-1 h-[5px] w-[38px] rounded-full md:hidden" style={{ background: 'var(--ink-3)' }} />
        {children}
      </div>
    </div>
  )
}

export function Skeleton({ h = 60, className }: { h?: number; className?: string }) {
  return <div className={`skel ${className ?? ''}`} style={{ height: h }} aria-hidden="true" />
}

export function PageSkeleton() {
  const t = useTranslations('common')
  return (
    <div className="pad" aria-busy="true" aria-label={t('loading')}>
      <Skeleton h={36} className="w-1/2" />
      <Skeleton h={80} />
      <Skeleton h={140} />
      <Skeleton h={100} />
    </div>
  )
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const t = useTranslations('common')
  return (
    <div className="pad items-center pt-10 text-center">
      <p className="t-head m-0">{t('errorTitle')}</p>
      <p className="t-foot m-0">{message ?? t('errorBody')}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          {t('retry')}
        </button>
      )}
    </div>
  )
}

export function Disclaimer() {
  const t = useTranslations('common')
  return <p className="t-cap m-0 mt-1 text-center">{t('disclaimer')}</p>
}

export function Section({ children }: { children: React.ReactNode }) {
  return <span className="t-foot pl-1">{children}</span>
}
