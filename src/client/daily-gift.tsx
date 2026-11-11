'use client'
// Regalo diario en Inicio: durante 30 días, un regalo cada día (dinero virtual, gemas, vidas, protectores, XP; los días
// 7, 14, 21 y 30, grande). Después, un cofre cada semana. El servidor decide el día y el premio (src/server/game/daily.ts).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { DailyDayT, DailyItemT, DailyKindT, DailyOpenT, DailyT } from '@/shared/contract'
import { num, withSymbol } from '@/shared/format'
import { api, ApiFailure } from './api'
import { useLang } from './hooks'
import { useToast } from './providers'
import { Gem, Heart, Icon } from './ui/icons'
import { Sheet } from './ui/kit'

const MAX_FREEZES = 2
const tint = (c: string, p = 14) => `color-mix(in srgb, ${c} ${p}%, var(--surface))`

function useGiftText() {
  const t = useTranslations('daily')
  const locale = useLang()
  const one = (x: DailyItemT) => (x.kind === 'CASH' ? t('item.CASH', { amount: withSymbol(num(x.amount, locale, 0), 'EUR', locale) }) : x.kind === 'LIVES' ? t('item.LIVES') : t(`item.${x.kind}`, { n: x.amount }))
  return { one, all: (items: DailyItemT[]) => items.map(one).join(' + ') }
}

function KindIcon({ kind, size = 20 }: { kind: DailyKindT; size?: number }) {
  if (kind === 'GEMS') return <Gem size={Math.round(size * 0.8)} />
  if (kind === 'LIVES') return <Heart size={Math.round(size * 0.8)} />
  return <Icon name={kind === 'CASH' ? 'wallet' : kind === 'FREEZE' ? 'shield' : 'star'} size={size} />
}

export function DailyGift() {
  const t = useTranslations('daily')
  const { all } = useGiftText()
  const { data: d } = useQuery({ queryKey: ['daily'], queryFn: api.daily, retry: false })
  const [open, setOpen] = useState(false)
  if (!d) return null
  const chest = d.phase === 'CHEST'
  const today = chest ? null : d.days[d.day - 1]
  const sheet = <DailySheet open={open} onClose={() => setOpen(false)} d={d} />
  // Cofre ya abierto esta semana: nada en Inicio hasta el lunes
  if (chest && d.todayOpened) return sheet
  if (!d.todayOpened) {
    const title = chest ? t('chestTitle') : t('cardTitle', { n: d.day, total: d.total })
    const body = chest ? t('chestBody', { total: d.total, gift: all(d.chest?.items ?? []) }) : today?.big ? t('cardBig') : t('cardBody', { gift: all(today?.items ?? []) })
    return (
      <>
        <button type="button" className="card flex w-full items-center gap-3 text-left" style={{ boxShadow: 'inset 0 0 0 2px var(--brand)' }} onClick={() => setOpen(true)} aria-haspopup="dialog">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl" style={{ background: 'var(--brand)', color: 'var(--on-brand)', animation: 'lumi-hop 1.8s ease-in-out infinite' }} aria-hidden="true">
            <Icon name="gift" size={26} />
          </span>
          <span className="min-w-0 flex-1">
            <b className="t-head block">{title}</b>
            <span className="t-foot mt-0.5 block">{body}</span>
          </span>
          <span className="btn btn-primary btn-sm flex-none" aria-hidden="true">
            {t('open')}
          </span>
        </button>
        {sheet}
      </>
    )
  }
  const next = d.tomorrow
  return (
    <>
      <button type="button" className="card flex min-h-[60px] w-full items-center gap-3 text-left" style={{ paddingTop: 12, paddingBottom: 12 }} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${t('openedTitle')}. ${t('seeCalendar')}`}>
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl" style={{ background: tint('var(--brand)'), color: 'var(--brand-ink)' }} aria-hidden="true">
          <Icon name="check" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] leading-[20px]">
            {t('openedTitle')} · {d.day}/{d.total}
          </b>
          <span className="t-foot block">{next ? (next.big ? t('tomorrowBig') : t('tomorrow', { gift: all(next.items) })) : t('lastDone')}</span>
        </span>
        <span style={{ color: 'var(--ink-3)' }} aria-hidden="true">
          <Icon name="chev" size={18} />
        </span>
      </button>
      {sheet}
    </>
  )
}

function DailySheet({ open, onClose, d }: { open: boolean; onClose: () => void; d: DailyT }) {
  const t = useTranslations('daily')
  const { all } = useGiftText()
  const toast = useToast()
  const qc = useQueryClient()
  const [result, setResult] = useState<DailyOpenT | null>(null)
  const m = useMutation({
    mutationFn: api.openDaily,
    onSuccess: r => {
      qc.setQueryData(['daily'], r.daily)
      setResult(r)
      // Gemas, vidas, saldo, XP…: se refresca lo demás
      qc.invalidateQueries({ predicate: q => q.queryKey[0] !== 'daily' })
    },
    onError: e => {
      const code = e instanceof ApiFailure ? e.code : ''
      if (code === 'ALREADY_OPENED') return void qc.invalidateQueries({ queryKey: ['daily'] })
      toast(code === 'VIEW_ONLY' ? t('viewOnly') : t('error'))
    },
  })
  const close = () => {
    onClose()
    setResult(null)
  }
  const chest = d.phase === 'CHEST'
  const today = chest ? null : d.days[d.day - 1]
  const title = chest ? t('chestTitle') : t('cardTitle', { n: Math.min(d.day, d.total), total: d.total })
  return (
    <Sheet open={open} onClose={close} label={title}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="t-title min-w-0">{title}</h2>
        <button type="button" className="icon-btn" onClick={close} aria-label={t('close')}>
          <Icon name="close" size={22} />
        </button>
      </div>

      {result ? (
        <Reveal r={result} onClose={close} />
      ) : !d.todayOpened ? (
        <div className="card flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-24 w-24 place-items-center rounded-[28px]" style={{ background: 'var(--brand)', color: 'var(--on-brand)', animation: m.isPending ? 'shake 0.4s ease-in-out infinite' : 'lumi-hop 1.8s ease-in-out infinite' }} aria-hidden="true">
            <Icon name="gift" size={52} />
          </span>
          <p className="t-body m-0">{chest ? t('chestBody', { total: d.total, gift: all(d.chest?.items ?? []) }) : today?.big ? t('cardBig') : t('cardBody', { gift: all(today?.items ?? []) })}</p>
          <button type="button" className="btn btn-primary" disabled={!d.canOpen || m.isPending} onClick={() => m.mutate()} aria-label={chest ? t('chestAria') : t('openAria', { n: d.day, total: d.total })}>
            {m.isPending ? t('opening') : chest ? t('chestOpen') : t('openGift')}
          </button>
          {!d.canOpen && <p className="t-foot m-0">{t('viewOnly')}</p>}
        </div>
      ) : chest ? (
        <p className="t-body m-0">{t('chestOpened')}</p>
      ) : null}

      {!chest && <Calendar d={d} />}
    </Sheet>
  )
}

function Reveal({ r, onClose }: { r: DailyOpenT; onClose: () => void }) {
  const t = useTranslations('daily')
  const { one } = useGiftText()
  const big = r.kind === 'DAY' && r.daily.days[r.day - 1]?.big
  const hasCash = r.items.some(x => x.kind === 'CASH')
  const hasFreeze = r.items.some(x => x.kind === 'FREEZE')
  return (
    <div className="card flex flex-col items-center gap-3 py-5 text-center animate-pop" role="status">
      <span className="grid h-20 w-20 place-items-center rounded-[24px]" style={{ background: tint('var(--brand)', 16), color: 'var(--brand-ink)', animation: 'glow-ok 0.9s ease-out 0.2s' }} aria-hidden="true">
        <Icon name="gift" size={44} />
      </span>
      <b className="t-head">{r.kind === 'CHEST' ? t('revealChest') : big ? t('revealBig', { n: r.day }) : t('revealTitle', { n: r.day })}</b>
      <ul className="m-0 flex w-full list-none flex-col gap-2 p-0 text-left">
        {r.items.map((x, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl p-3 animate-pop" style={{ background: 'var(--surface-2)', animationDelay: `${180 + i * 140}ms` }}>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl" style={{ background: 'var(--surface)', color: 'var(--ink)' }} aria-hidden="true">
              <KindIcon kind={x.kind} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[16px] leading-[21px]">{one(x)}</b>
              <span className="t-foot block">
                {x.from === 'LIVES' ? `${t('swapLives')} ` : x.from === 'FREEZE' ? `${t('swapFreeze', { max: MAX_FREEZES })} ` : ''}
                {t(`why.${x.kind}`)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {r.effects.levelUp && <p className="t-head m-0" style={{ color: 'var(--brand-ink)' }}>{t('levelUp', { n: r.effects.levelUp.to })}</p>}
      {hasCash ? (
        <Link href="/mercado" className="btn btn-primary" onClick={onClose}>
          {t('goMarket')}
        </Link>
      ) : hasFreeze ? (
        <Link href="/perfil/racha" className="btn btn-primary" onClick={onClose}>
          {t('goStreak')}
        </Link>
      ) : null}
      <button type="button" className={hasCash || hasFreeze ? 'btn btn-plain' : 'btn btn-primary'} onClick={onClose}>
        {t('done')}
      </button>
    </div>
  )
}

function Calendar({ d }: { d: DailyT }) {
  const t = useTranslations('daily')
  const { all } = useGiftText()
  const status = { OPENED: t('legendOpened'), TODAY: t('legendToday'), MISSED: t('legendMissed'), UPCOMING: t('legendUpcoming') }
  const opened = d.days.filter(x => x.status === 'OPENED').length
  const missed = d.days.filter(x => x.status === 'MISSED').length
  return (
    <section className="flex flex-col gap-2.5" aria-labelledby="daily-cal">
      <div className="flex items-baseline justify-between">
        <span id="daily-cal" className="t-head">
          {t('calendarTitle')}
        </span>
        <span className="t-foot">
          {opened}/{d.total}
        </span>
      </div>
      <p className="t-foot m-0">{t('intro', { total: d.total })}</p>
      <ol className="m-0 grid list-none grid-cols-6 gap-1.5 p-0">
        {d.days.map(x => (
          <li key={x.n} className="flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[12px] leading-[14px] font-bold" style={cell(x)} aria-label={t('dayAria', { n: x.n, status: status[x.status], gift: all(x.items) })}>
            <span aria-hidden="true" style={x.status === 'MISSED' ? { textDecoration: 'line-through' } : undefined}>
              {x.n}
            </span>
            <span aria-hidden="true" className="grid h-4 place-items-center">
              {x.status === 'OPENED' ? <Icon name="check" size={14} strokeWidth={2.4} /> : x.status === 'MISSED' ? <Icon name="close" size={12} /> : x.big ? <Icon name="gift" size={15} /> : <KindIcon kind={x.items[0]?.kind ?? 'GEMS'} size={14} />}
            </span>
          </li>
        ))}
      </ol>
      <div className="t-cap flex flex-wrap gap-x-3 gap-y-1" aria-hidden="true">
        <Legend style={cell({ status: 'OPENED', big: false })} label={t('legendOpened')} />
        <Legend style={cell({ status: 'TODAY', big: false })} label={t('legendToday')} />
        <Legend style={cell({ status: 'MISSED', big: false })} label={t('legendMissed')} />
        <Legend style={cell({ status: 'UPCOMING', big: false })} label={t('legendUpcoming')} />
        <Legend style={cell({ status: 'UPCOMING', big: true })} label={t('legendBig')} />
      </div>
      {missed > 0 && <p className="t-foot m-0">{t('missed', { n: missed })}</p>}
      <p className="t-foot m-0">{t('rules', { total: d.total })}</p>
    </section>
  )
}

function Legend({ style, label }: { style: React.CSSProperties; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded" style={style} />
      {label}
    </span>
  )
}

function cell(x: Pick<DailyDayT, 'status' | 'big'>): React.CSSProperties {
  if (x.status === 'OPENED') return { background: tint('var(--brand)', 18), color: 'var(--brand-ink)' }
  if (x.status === 'TODAY') return { background: 'var(--surface)', color: 'var(--ink)', boxShadow: 'inset 0 0 0 2px var(--brand)' }
  if (x.status === 'MISSED') return { background: 'var(--fill)', color: 'var(--ink-2)' }
  return x.big ? { background: tint('var(--rare-legendary)', 16), color: 'var(--ink)' } : { background: 'var(--surface)', color: 'var(--ink-2)' }
}
