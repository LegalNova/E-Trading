'use client'
// Claro u oscuro de un toque (en Perfil y en el menú lateral). Se guarda en los ajustes de la cuenta.
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'
import { api } from './api'
import { applyTheme } from './providers'
import { Icon } from './ui/icons'

/** ¿Se ve en oscuro ahora mismo? (elegido a mano o por el sistema) */
function isDarkNow() {
  const set = document.documentElement.getAttribute('data-theme')
  return set ? set === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
}
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const mq = matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => (mo.disconnect(), mq.removeEventListener('change', cb))
}

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const t = useTranslations('settings')
  const qc = useQueryClient()
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false)
  const save = useMutation({ mutationFn: (theme: 'LIGHT' | 'DARK') => api.updateSettings({ theme }), onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }) })
  const flip = () => {
    const next = dark ? 'LIGHT' : 'DARK'
    applyTheme(next)
    save.mutate(next)
  }
  const label = dark ? t('toLight') : t('toDark')
  return (
    <button onClick={flip} className={withLabel ? 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold' : 'icon-btn'} style={withLabel ? { color: 'var(--ink-2)' } : undefined} aria-label={label} title={label}>
      <Icon name={dark ? 'sun' : 'moon'} size={withLabel ? 22 : 20} />
      {withLabel && label}
    </button>
  )
}
