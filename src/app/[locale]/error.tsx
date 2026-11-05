'use client'
// Si una pantalla falla: aviso amable en vez de una página en blanco, y el fallo llega al panel.
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { reportError } from '@/client/error-reporter'
import { Lumi } from '@/client/ui/lumi'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage')
  useEffect(() => reportError(error), [error])
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[420px] flex-col items-center justify-center gap-3 px-4 text-center">
      <Lumi mood="WORRIED" size={72} />
      <h1 className="t-title m-0">{t('title')}</h1>
      <p className="t-foot m-0">{t('body')}</p>
      <button className="btn btn-primary" onClick={reset}>
        {t('retry')}
      </button>
      <Link href="/" className="btn btn-plain">
        {t('home')}
      </Link>
    </div>
  )
}
