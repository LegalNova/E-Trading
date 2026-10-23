'use client'
// Proveedores globales: datos (TanStack Query), avisos tipo toast y tema.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { THEME_KEY } from '@/shared/theme'
import { ApiFailure } from './api'

const ToastCtx = createContext<(msg: React.ReactNode, ms?: number) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export type ThemePref = 'AUTO' | 'LIGHT' | 'DARK'

/** Aplica el tema elegido (lo guarda en el navegador para pintarlo antes del primer render) */
export function applyTheme(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_KEY, pref)
  } catch {
    // sin almacenamiento: se aplica solo en esta visita
  }
  const root = document.documentElement
  if (pref === 'AUTO') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref === 'DARK' ? 'dark' : 'light')
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, refetchOnWindowFocus: true, retry: (n, e) => !(e instanceof ApiFailure) && n < 2 },
        },
      }),
  )
  const [toast, setToast] = useState<React.ReactNode>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const show = useCallback((msg: React.ReactNode, ms = 2600) => {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), ms)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <QueryClientProvider client={client}>
      <ToastCtx.Provider value={show}>
        {children}
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3.5" style={{ top: 'max(12px, env(safe-area-inset-top))' }}>
          {toast && (
            <div role="status" className="flex w-full max-w-[440px] animate-rise items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm font-bold shadow-float" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
              {toast}
            </div>
          )}
        </div>
      </ToastCtx.Provider>
    </QueryClientProvider>
  )
}
