'use client'
// Invitar amigos: tu enlace, cómo funciona y lo que llevas ganado (un mes de Max para los dos por amigo).
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { api, ApiFailure } from '../api'
import { useGuard } from '../shell'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'
import { usePlanBadge } from '../upgrade'

export function Invite() {
  const t = useTranslations('invite')
  const { ready } = useGuard('app')
  const { data, error, refetch } = useQuery({ queryKey: ['invite'], queryFn: api.myInvites, enabled: ready })
  const [copied, setCopied] = useState(false)
  const { data: badge } = usePlanBadge()
  // Textos según el plan: quien ya tiene Max regala Max; quien paga retrasa su próximo cobro
  const hasMax = badge?.plan === 'PREMIUM'
  const pays = !!badge && badge.plan !== 'FREE' && !badge.daysLeft
  if (error instanceof ApiFailure && error.code === 'GUEST_MUST_SAVE')
    return (
      <>
        <TopBar back="/perfil" title={t('title')} />
        <div className="pad items-center pt-8 text-center">
          <Lumi mood="THINKING" size={64} />
          <p className="t-body">{t('guest')}</p>
          <Link href="/guardar" className="btn btn-primary">
            {t('guestCta')}
          </Link>
        </div>
      </>
    )
  if (error) return <ErrorState onRetry={refetch} message={error.message} />
  if (!data) return <PageSkeleton />
  const link = `${location.origin}/?inv=${data.code}`
  const message = t('shareText', { link })
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // sin portapapeles: el enlace está a la vista para copiarlo a mano
    }
  }
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lumi', text: message })
        return
      } catch {
        // cancelado: no pasa nada
      }
    } else window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
  }
  const steps = [t('step1'), t('step2'), t(pays ? 'step3Paid' : 'step3')]
  return (
    <>
      <TopBar back="/perfil" title={t('title')} />
      <div className="pad">
        <div className="hero flex flex-col items-start gap-3 p-6">
          <Lumi mood="CELEBRATE" size={56} />
          <h1 className="t-title m-0">{t(hasMax ? 'headlineGive' : 'headline')}</h1>
          <p className="m-0" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
            {t(pays ? 'subPaid' : 'sub', { days: data.days })}
          </p>
        </div>
        <div className="card flex flex-col gap-2.5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full text-[13px] font-extrabold" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                {i + 1}
              </span>
              <span className="t-body pt-0.5">{s}</span>
            </div>
          ))}
        </div>
        <div className="card flex flex-col gap-2.5">
          <b>{t('yourLink')}</b>
          <code className="truncate rounded-lg px-3 py-2 text-[14px]" style={{ background: 'var(--fill)' }}>
            {link}
          </code>
          <div className="grid grid-cols-2 gap-2.5">
            <button className="btn btn-secondary" onClick={copy}>
              {copied ? t('copied') : t('copy')}
            </button>
            <button className="btn btn-primary" onClick={share}>
              <Icon name="chat" size={18} /> {t('share')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="stat">
            <span className="t-cap">{t('joined')}</span>
            <b>{data.joined}</b>
          </div>
          <div className="stat">
            <span className="t-cap">{t('daysEarned')}</span>
            <b>{data.daysEarned}</b>
          </div>
        </div>
        <p className="t-cap m-0">
          {t.rich('rules', {
            days: data.days,
            terms: c => (
              <Link href="/legal/terminos" className="underline">
                {c}
              </Link>
            ),
          })}
        </p>
      </div>
    </>
  )
}
