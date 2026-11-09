'use client'
// Botón de Max siempre a mano (no solo al chocar con un límite): en Inicio, Clases, Perfil y el menú lateral.
// Free: «Prueba Max gratis». En prueba o regalo: días que quedan. Plus: «Pasa a Max». Max de pago: nada.
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { money } from '@/shared/format'
import { api, ApiFailure } from './api'
import { useLang } from './hooks'
import { useToast } from './providers'
import { Icon } from './ui/icons'
import { Seg } from './ui/kit'

export function usePlanBadge() {
  return useQuery({ queryKey: ['plan-badge'], queryFn: api.planBadge, staleTime: 60_000 })
}

/** Mientras Stripe está en modo de prueba: no se cobra nada y se paga con la tarjeta de prueba */
export function TestCardNote() {
  const t = useTranslations('billing')
  const { data: b } = usePlanBadge()
  // Solo lo ve el equipo: al resto no se le habla de pruebas
  if (!b?.paymentsTest || !b.isAdmin) return null
  return (
    <div className="banner banner-info flex flex-col gap-0.5" role="note">
      <b>{t('testTitle')}</b>
      <span className="t-cap">{t('testBody')}</span>
      <span className="t-body font-bold tracking-[0.04em] tabular-nums">4242 4242 4242 4242</span>
    </div>
  )
}

type Copy = { href: string; short: string; title: string; body: string; cta: string; progress?: number }

function useCopy(): Copy | null {
  const t = useTranslations('upgrade')
  const { data: b } = usePlanBadge()
  if (!b) return null
  // El equipo no ve ofertas: tiene todo abierto. Con plan de grupo, tampoco: ya lo tiene pagado
  if (b.isAdmin || b.status === 'GROUP') return null
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

/** Pastilla compacta para cabeceras (al equipo le dice «Admin» y lleva al panel) */
export function MaxPill() {
  const c = useCopy()
  const { data: b } = usePlanBadge()
  if (b?.isAdmin)
    return (
      <Link href="/admin" className="chip font-extrabold" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
        <Icon name="admin" size={14} />
        Admin
      </Link>
    )
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
    <Link href={c.href} className="card flex items-center gap-3.5" style={{ color: 'inherit', background: 'color-mix(in srgb, var(--brand) 10%, var(--surface))' }}>
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
      <span className="hidden sm:flex btn btn-primary btn-sm w-auto flex-none px-3">{c.cta}</span>
      <Icon name="chev" size={18} className="sm:hidden" />
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

/**
 * «Hazte Plus o Max»: los dos planes con su precio y un botón que lleva directo al pago (Stripe), sin pasos intermedios.
 * Al final de Inicio y en Perfil. No sale a quien ya paga Max; a quien paga Plus solo le ofrece Max.
 */
export function BuyPlans({ id }: { id?: string }) {
  const t = useTranslations('buy')
  const tb = useTranslations('billing')
  const locale = useLang()
  const toast = useToast()
  const { data: b } = usePlanBadge()
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: api.billingPlans, staleTime: 3_600_000 })
  const [interval, setInterval_] = useState<'MONTH' | 'YEAR'>('MONTH')
  const [busy, setBusy] = useState<string | null>(null)
  const pay = useMutation({
    mutationFn: (planId: string) => api.checkout(planId),
    onMutate: planId => setBusy(planId),
    // Con Stripe: a su página de pago. Sin Stripe (pruebas): el plan queda activo y se va a la pantalla de planes.
    onSuccess: r => window.location.assign(r.url ?? `/${locale}/premium`),
    onError: e => (setBusy(null), toast(e instanceof ApiFailure ? e.message : t('failed'))),
  })
  // Con plan de grupo ya lo tiene pagado: no se le ofrece pagar
  if (!b || !plans || b.status === 'GROUP') return null
  const paid = b.plan !== 'FREE' && !b.daysLeft
  if (paid && b.plan === 'PREMIUM') return null
  // Max regalado (o en prueba) con más de 14 días por delante: aún no se le ofrece pagar (se ve en Premium si lo busca)
  if (b.plan === 'PREMIUM' && b.daysLeft && b.daysLeft > 14) return null
  const tiers = (paid && b.plan === 'PLUS' ? ['PREMIUM'] : ['PLUS', 'PREMIUM']) as ('PLUS' | 'PREMIUM')[]
  const of = (tier: 'PLUS' | 'PREMIUM', iv: 'MONTH' | 'YEAR') => plans.find(p => p.tier === tier && p.interval === iv)!
  const saving = Math.round((1 - Number(of('PREMIUM', 'YEAR').price) / (Number(of('PREMIUM', 'MONTH').price) * 12)) * 100)
  const trial = b.payments && !b.trialUsed && b.trialUnlocked
  return (
    <section id={id} aria-labelledby="buy-title" className="card flex scroll-mt-4 flex-col gap-3">
      <div>
        <h2 id="buy-title" className="t-head m-0">
          {t('title')}
        </h2>
        <span className="t-foot">{b.daysLeft ? t('keepBody', { n: b.daysLeft }) : t('body')}</span>
      </div>
      <Seg label={t('billing')} value={interval} onChange={setInterval_} options={[{ value: 'MONTH', label: t('monthly') }, { value: 'YEAR', label: t('yearly', { n: saving }) }]} />
      <div className={`grid gap-2.5 ${tiers.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {tiers.map(tier => {
          const p = of(tier, interval)
          const max = tier === 'PREMIUM'
          const perMonth = interval === 'YEAR' ? Number(p.price) / 12 : Number(p.price)
          return (
            <div key={tier} className="flex min-w-0 flex-col gap-2 rounded-2xl p-3" style={max ? { background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))', boxShadow: 'inset 0 0 0 2px var(--brand)' } : { background: 'var(--surface-2)' }}>
              <span className="flex items-center justify-between gap-1">
                <b className="text-[17px]">{max ? 'Max' : 'Plus'}</b>
                {max && tiers.length > 1 && (
                  <span className="chip px-2 py-0.5 text-[10px]" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                    {t('best')}
                  </span>
                )}
              </span>
              <span>
                <b className="text-[22px] tracking-[-0.02em]">{money(perMonth, 'EUR', locale)}</b>
                <span className="t-cap"> {t('perMonth')}</span>
                {/* Precio de estudiante: el normal, tachado */}
                {p.student && p.regularPrice && p.regularPrice !== p.price && (
                  <span className="t-cap block">
                    <s aria-label={tb('was', { price: money(interval === 'YEAR' ? Number(p.regularPrice) / 12 : p.regularPrice, 'EUR', locale) })}>{money(interval === 'YEAR' ? Number(p.regularPrice) / 12 : p.regularPrice, 'EUR', locale)}</s> · {tb('studentPrice')}
                  </span>
                )}
              </span>
              <span className="t-cap min-h-8">{interval === 'YEAR' ? t('billedYear', { price: money(p.price, 'EUR', locale) }) : t(max ? 'maxLine' : 'plusLine')}</span>
              {b.isGuest ? (
                <Link href="/guardar" className={`btn btn-sm w-full ${max ? 'btn-primary' : 'btn-secondary'}`}>
                  {t('cta')}
                </Link>
              ) : (
                <button className={`btn btn-sm w-full ${max ? 'btn-primary' : 'btn-secondary'}`} disabled={!!busy} onClick={() => pay.mutate(p.id)}>
                  {busy === p.id ? t('opening') : trial ? t('trialCta') : t('cta')}
                </button>
              )}
            </div>
          )
        })}
      </div>
      <TestCardNote />
      <p className="t-cap m-0">
        {trial ? t('trialNote') : t('note')}{' '}
        <Link href="/premium" className="font-bold" style={{ color: 'var(--brand-ink)' }}>
          {t('compare')}
        </Link>
      </p>
      {!b.student && !b.isGuest && (
        <Link href="/estudiante" className="t-cap font-bold" style={{ color: 'var(--brand-ink)' }}>
          {tb('studentLink')}
        </Link>
      )}
    </section>
  )
}

/** Tarjeta de Perfil: «Plan de grupo» (o «Tu grupo», si ya está en uno) */
export function GroupCard() {
  const t = useTranslations('billing')
  const { data: b } = usePlanBadge()
  if (!b || b.isAdmin) return null
  const g = b.group
  return (
    <Link href="/grupo" className="card flex items-center gap-3.5" style={{ color: 'inherit' }}>
      <span className="grid h-10 w-10 flex-none place-items-center rounded-full" style={{ background: 'var(--fill)', color: 'var(--brand-ink)' }}>
        <Icon name="league" size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block truncate">{g ? t('groupMine', { name: g.name }) : t('groupLink')}</b>
        <span className="t-foot">{g ? t('groupMineBody', { plan: g.tier === 'PLUS' ? 'Plus' : 'Max' }) : t('groupLinkBody')}</span>
      </span>
      <Icon name="chev" size={18} />
    </Link>
  )
}
