'use client'
// Avisa al servidor de los fallos de la app en el navegador (aparecen en el panel, en Métricas).
// Como mucho 5 por visita y sin repetir el mismo mensaje.
import { useEffect } from 'react'
import { api } from './api'

const sent = new Set<string>()

export function reportError(e: unknown) {
  const err = e instanceof Error ? e : new Error(typeof e === 'string' ? e : 'Error desconocido')
  const message = `${err.name}: ${err.message}`.slice(0, 300)
  // Fallos que no son nuestros: extensiones del navegador y peticiones cortadas al cambiar de pantalla
  if (/extension:\/\/|ResizeObserver loop|AbortError|Load failed|Failed to fetch|NetworkError/.test(message + (err.stack ?? ''))) return
  if (sent.size >= 5 || sent.has(message)) return
  sent.add(message)
  const path = location.pathname.replace(/^\/(es|ca|en)(?=\/|$)/, '') || '/'
  api.trackEvent({ name: 'client_error', message, path, stack: err.stack?.slice(0, 2000) })
}

export function ErrorReporter() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => reportError(e.error ?? e.message)
    const onRejection = (e: PromiseRejectionEvent) => reportError(e.reason)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  return null
}
