'use client'
// Tienda de gemas (auditoría PRO-1, PRO-2, PRO-5 y PRO-7): solo se cambian gemas ganadas en la app, nunca dinero real.
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { money } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang, useMe, useRefreshAll } from '../hooks'
import { useToast } from '../providers'
import { Confetti } from '../ui/celebrate'
import { Gem, Heart, Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, TopBar } from '../ui/kit'
import { Lumi, stageOf } from '../ui/lumi'
import { useState } from 'react'

export function GemShop() {
  const t = useTranslations('shop')
  const locale = useLang()
  const toast = useToast()
  const refresh = useRefreshAll()
  const { data: me } = useMe()
  const shop = useQuery({ queryKey: ['gem-shop'], queryFn: api.gemShop })
  const [party, setParty] = useState(0)
  const onError = (e: unknown) => toast(e instanceof ApiFailure && e.code === 'INSUFFICIENT_GEMS' ? t('notEnough') : e instanceof ApiFailure ? e.message : t('error'))
  const cash = useMutation({
    mutationFn: api.buyCash,
    onSuccess: () => (refresh(), shop.refetch(), setParty(p => p + 1), toast(t('bought', { amount: money(shop.data?.cash.amount ?? 0, 'EUR', locale) }))),
    onError,
  })
  const skin = useMutation({
    mutationFn: (id: string) => api.buySkin(id),
    onSuccess: () => (refresh(), shop.refetch(), setParty(p => p + 1), toast(t('skinBought'))),
    onError,
  })
  const done = (msg: string) => () => (refresh(), shop.refetch(), setParty(p => p + 1), toast(msg))
  const pass = useMutation({ mutationFn: api.buyMaxPass, onSuccess: done(t('passBought')), onError })
  const tutor = useMutation({ mutationFn: api.buyTutor, onSuccess: done(t('tutorBought', { n: shop.data?.tutorExtra ?? 10 })), onError })
  const reset = useMutation({ mutationFn: api.buyReset, onSuccess: done(t('resetBought')), onError })
  if (shop.isError) return <ErrorState onRetry={shop.refetch} />
  if (!shop.data || !me) return <PageSkeleton />
  const s = shop.data
  const stage = stageOf(me.level.n)
  return (
    <>
      <TopBar back="/perfil" title={t('title')} />
      {party > 0 && <Confetti key={party} amount={60} />}
      <div className="pad">
        <div className="hero flex items-center gap-3">
          <Gem />
          <span className="flex-1">
            <b className="text-2xl font-extrabold">{t('balance', { n: s.gems })}</b>
            <br />
            <span className="t-cap" style={{ color: 'inherit', opacity: 0.8 }}>
              {t('earn')}
            </span>
          </span>
        </div>

        {/* Dinero virtual para practicar (PRO-2: entra como aportación, sin tocar la rentabilidad ni la liga) */}
        <div className="card flex flex-col gap-2">
          <b className="t-head">{t('cashTitle', { amount: money(s.cash.amount, 'EUR', locale) })}</b>
          <span className="t-foot">{t('cashBody')}</span>
          <span className="t-cap">{s.cash.left > 0 ? t('cashLeft', { n: s.cash.left }) : t('cashNone')}</span>
          <button className="btn btn-primary" disabled={s.cash.left <= 0 || s.gems < s.prices.cash || cash.isPending} onClick={() => cash.mutate()}>
            <Gem /> {t('buy', { n: s.prices.cash })}
          </button>
        </div>

        {/* Pase Max de 24 horas: solo en el plan gratis y dos al mes (auditoría PRO-5) */}
        <div className="card flex flex-col gap-2">
          <b className="t-head">{t('passTitle')}</b>
          <span className="t-foot">{t('passBody')}</span>
          <span className="t-cap">{s.maxPass.free ? (s.maxPass.left > 0 ? t('passLeft', { n: s.maxPass.left }) : t('cashNone')) : t('passNone')}</span>
          <button className="btn btn-secondary" disabled={!s.maxPass.free || s.maxPass.left <= 0 || s.gems < s.prices.maxPass || pass.isPending} onClick={() => pass.mutate()}>
            <Gem /> {t('buy', { n: s.prices.maxPass })}
          </button>
        </div>

        <div className="card flex flex-col gap-2">
          <b className="t-head">{t('tutorTitle', { n: s.tutorExtra })}</b>
          <span className="t-foot">{t('tutorBody')}</span>
          <button className="btn btn-secondary" disabled={s.gems < s.prices.tutor || tutor.isPending} onClick={() => tutor.mutate()}>
            <Gem /> {t('buy', { n: s.prices.tutor })}
          </button>
        </div>

        <div className="card flex flex-col gap-2">
          <b className="t-head">{t('resetTitle')}</b>
          <span className="t-foot">{t('resetBody')}</span>
          <button className="btn btn-secondary" disabled={s.gems < s.prices.reset || reset.isPending} onClick={() => reset.mutate()}>
            <Gem /> {t('buy', { n: s.prices.reset })}
          </button>
        </div>

        <div className="card flex items-start gap-3">
          <Icon name="lock" size={22} />
          <span className="flex-1">
            <b className="t-head block">{t('lessonTitle')}</b>
            <span className="t-foot">{t('lessonBody')}</span>
          </span>
          <span className="chip flex-none">
            <Gem /> {s.prices.lesson}
          </span>
        </div>

        {/* Colores de Lumi */}
        <div className="card flex flex-col gap-3">
          <b className="t-head">{t('skinsTitle')}</b>
          <div className="grid grid-cols-2 gap-2.5">
            {s.skins.map(k => {
              const on = me.companion.skinId === k.id
              return (
                <button
                  key={k.id}
                  className="opt flex-col gap-1.5 px-2 py-3 text-center"
                  aria-pressed={on}
                  disabled={on || skin.isPending || (!k.owned && s.gems < k.price)}
                  onClick={() => skin.mutate(k.id)}
                >
                  <Lumi mood="HAPPY" size={56} skin={k.id} stage={stage} />
                  <b className="text-sm">{t(`skins.${k.id}`)}</b>
                  <span className="t-cap inline-flex items-center gap-1">{on ? t('skinOn') : k.owned ? t('skinUse') : <><Gem /> {k.price}</>}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Lo que se gasta en otras pantallas: aquí se explica */}
        <div className="card flex items-start gap-3">
          <Icon name="info" size={22} />
          <span className="flex-1">
            <b className="t-head block">{t('hintTitle')}</b>
            <span className="t-foot">{t('hintBody')}</span>
          </span>
          <span className="chip flex-none">
            <Gem /> {s.prices.hint}
          </span>
        </div>
        <div className="card flex items-start gap-3">
          <Heart />
          <span className="flex-1">
            <b className="t-head block">{t('livesTitle')}</b>
            <span className="t-foot">{t('livesBody')}</span>
          </span>
        </div>

        {/* PRO-5: al lado de lo que se consigue con gemas, lo que da Plus */}
        {me.plan === 'FREE' && (
          <div className="banner banner-info flex-col items-start gap-2">
            <span>{t('plusNote')}</span>
            <Link href="/premium" className="link text-sm">
              {t('plusCta')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
