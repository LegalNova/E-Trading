'use client'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Icon } from './Icon'

interface ToastData {
  msg: string
  tone?: 'ok' | 'error' | 'info'
  action?: { label: string; onClick: () => void }
}

const Ctx = createContext<(t: ToastData | string) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const show = useCallback((t: ToastData | string) => {
    clearTimeout(timer.current)
    setToast(typeof t === 'string' ? { msg: t } : t)
    timer.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const color = toast?.tone === 'error' ? 'var(--red)' : toast?.tone === 'info' ? 'var(--blue)' : 'var(--green)'

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', top: 'calc(12px + env(safe-area-inset-top, 0px))', left: '50%', transform: 'translateX(-50%)',
            width: 'min(calc(100% - 32px), 440px)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-1)',
            boxShadow: 'var(--shadow)', animation: 'etsheet 200ms ease-out',
          }}
        >
          <Icon d={toast.tone === 'error' ? 'M12 3 2 20h20z M12 10v4 M12 17v.5' : 'M5 12l5 5 9-10'} size={18} color={color} stroke={2} />
          <span style={{ flex: 1, font: '500 15px/20px var(--font)' }}>{toast.msg}</span>
          {toast.action && (
            <button
              onClick={() => { toast.action?.onClick(); setToast(null) }}
              style={{ border: 'none', background: 'none', padding: 4, color: 'var(--blue)', font: '600 15px var(--font)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
