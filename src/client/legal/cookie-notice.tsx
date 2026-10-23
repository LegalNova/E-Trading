'use client'
// Aviso de cookies informativo: solo usamos cookies técnicas y de preferencias elegidas por ti,
// exentas de consentimiento (LSSI-CE art. 22.2). Si algún día hubiera cookies que necesiten
// permiso, este aviso pasaría a tener «Aceptar» y «Rechazar» al mismo nivel (Guía AEPD 2023).
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'

const KEY = 'et-cookies'

export function CookieNotice() {
  const t = useTranslations('cookies')
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      // Se decide al montar para no desajustar el HTML estático
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      // Sin almacenamiento: no insistimos
    }
  }, [])
  if (!show) return null
  const close = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // Sin almacenamiento: solo se oculta en esta visita
    }
    setShow(false)
  }
  return (
    <div role="region" aria-label={t('label')} className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[560px] animate-rise flex-col gap-3 rounded-2xl p-3.5 shadow-float sm:flex-row sm:items-center md:bottom-4" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
      <p className="t-foot m-0 flex-1" style={{ color: 'var(--ink)' }}>
        {t('text')}{' '}
        <Link href="/legal/cookies" className="link px-0 text-[13px]">
          {t('more')}
        </Link>
      </p>
      <button className="btn btn-primary btn-sm w-full flex-none sm:w-auto" onClick={close}>
        {t('ok')}
      </button>
    </div>
  )
}
