'use client'
// Botón de Max siempre a mano (no solo al chocar con un límite): en Inicio, Clases, Perfil y el menú lateral.
// Free: «Prueba Max gratis». En prueba o regalo: días que quedan. Plus: «Pasa a Max». Max de pago: nada.
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { api } from './api'
import { Icon } from './ui/icons'

export function usePlanBadge() {
  return useQuery({ queryKey: ['plan-badge'], queryFn: api.planBadge, staleTime: 60_000 })
}

type Copy = { href: string; short: string; title: string; body: string; cta: string; progress?: number }

function useCopy(): Copy | null {
  const t = useTranslations('upgrade')
  const { data: b } = usePlanBadge()
  if (!b) return null
  const daysLeft = b.daysLeft
  if (b.plan === 'PREMIUM' && !daysLeft) return null
  const href = b.isGuest ? '/guardar' : '/premium'
  if (daysLeft) return { href, short: t('daysLeft', { n: daysLeft }), title: t(b.status === 'GIFT' ? 'giftTitle' : 'trialTitle', { n: daysLeft }), body: t('keepBody'), cta: t('keepCta') }
  if (b.plan === 'PLUS') return { href, short: t('toMax'), title: t('plusTitle'), body: t('plusBody'), cta: t('toMax') }
  if (b.trialUsed) return { href, short: 'Max', title: t('freeTitleNoTrial'), body: t('freeBody'), cta: t('seePlans') }
  // La prueba gratis se gana con la racha: se enseña cuánto falta
  if (!b.trialUnlocked) return { href, short: `${Math.min(b.streak, b.trialStreak)}/${b.trialStreak}`, title: t('freeLockedTitle', { n: b.trialStreak }), body: t('freeLockedBody', { s: Math.min(b.streak, b.trialStreak), n: b.trialStreak }), cta: t('seePlans'), progress: Math.min(1, b.streak / b.trialStreak) }
  return { href, short: t('short'), title: t('freeTitle'), body: t('unlockedBody'), cta: t('tryCta') }
}

/** Pastilla compacta para cabeceras */
export function MaxPill() {
  const c = useCopy()
  if (!c) return null
  return (
    <Link href={c.href} className="chip font-extrabold" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
      <Icon name="star" size={14} />
      {c.short}
    </Link>
  )
}

/** Tarjeta para Inicio y Perfil */
export function MaxCard() {
  const c = useCopy()
  if (!c) return null
  return (
    <Link href={c.href} className="card flex items-center gap-3.5" style={{ color: 'inherit', border: '1.5px solid var(--brand)' }}>
      <span className="grid h-10 w-10 flex-none place-items-center rounded-full" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
        <Icon name="star" size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <b>{c.title}</b>
        <br />
        <span className="t-foot">{c.body}</span>
        {c.progress !== undefined && (
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
            <span className="block h-full rounded-full" style={{ width: `${c.progress * 100}%`, background: 'var(--brand)' }} />
          </span>
        )}
      </span>
      <span className="btn btn-primary btn-sm w-auto flex-none px-3">{c.cta}</span>
    </Link>
  )
}

/** Bloque del menú lateral (pantallas grandes) */
export function MaxSide() {
  const c = useCopy()
  if (!c) return null
  return (
    <Link href={c.href} className="mx-1 mt-3 flex flex-col gap-1 rounded-2xl p-3.5" style={{ background: 'color-mix(in srgb, var(--brand) 12%, transparent)', color: 'var(--ink)' }}>
      <b className="flex items-center gap-1.5 text-[14px]">
        <Icon name="star" size={16} /> {c.title}
      </b>
      <span className="t-cap">{c.body}</span>
      <span className="btn btn-primary btn-sm mt-1.5">{c.cta}</span>
    </Link>
  )
}
