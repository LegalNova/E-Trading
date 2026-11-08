'use client'
// «Invita a un amigo»: lo primero que se ve al entrar en Inicio. Un toque comparte el enlace (WhatsApp, Instagram…):
// el amigo entra con 7 días de Max y quien invita suma 7 días más cuando su amigo termina la primera clase.
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { api } from './api'
import { useSession } from './hooks'
import { usePlanBadge } from './upgrade'
import { Icon } from './ui/icons'

export function InviteCard() {
  const t = useTranslations('inviteCard')
  const ti = useTranslations('invite')
  const { data: session } = useSession()
  const guest = !!session?.isGuest
  const { data: inv } = useQuery({ queryKey: ['invite'], queryFn: api.myInvites, retry: false, staleTime: 3_600_000, enabled: !!session && !guest })
  const { data: badge } = usePlanBadge()
  const [copied, setCopied] = useState(false)
  if (!session?.signedIn) return null
  // Quien ya tiene Max no «gana Max»: regala Max a su amigo. Quien paga, además, retrasa 7 días su próximo cobro.
  const hasMax = badge?.plan === 'PREMIUM'
  const pays = !!badge && badge.plan !== 'FREE' && !badge.daysLeft
  const title = hasMax ? t('titleGive') : t('title')
  const body = pays ? t('bodyPaid') : hasMax ? t('bodyMax') : t('body')
  const share = async () => {
    if (!inv) return
    const link = `${location.origin}/?inv=${inv.code}`
    const text = ti('shareText', { link })
    try {
      if (navigator.share) return void (await navigator.share({ title: 'Lumi', text }))
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // cancelado o sin permiso: no pasa nada
    }
  }
  return (
    <div className="hero flex flex-col gap-3" style={{ background: 'linear-gradient(150deg, var(--brand) 30%, color-mix(in srgb, var(--brand) 55%, var(--hero)))', color: '#fff' }}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl" style={{ background: 'rgb(255 255 255 / 0.18)' }}>
          <Icon name="gift" size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[18px] leading-[23px] tracking-[-0.01em]">{title}</b>
          <span className="mt-0.5 block text-[13px] leading-[18px]" style={{ color: 'rgb(255 255 255 / 0.85)' }}>
            {inv?.rewarded && !pays ? t('bodyEarned', { n: inv.daysEarned }) : body}{' '}
            <Link href="/perfil/invitar" className="font-bold whitespace-nowrap underline" style={{ color: '#fff' }}>
              {t('how')}
            </Link>
          </span>
        </span>
      </div>
      {guest ? (
        <Link href="/guardar" className="btn btn-sm w-full" style={{ background: '#fff', color: 'var(--brand-ink)' }}>
          {t('guestCta')}
        </Link>
      ) : (
        <button className="btn btn-sm w-full" style={{ background: '#fff', color: 'var(--brand-ink)' }} onClick={share} disabled={!inv}>
          <Icon name="chat" size={18} /> {copied ? t('copied') : t('cta')}
        </button>
      )}
    </div>
  )
}
