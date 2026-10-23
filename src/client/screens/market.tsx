'use client'
// 04 · Mercado: lista, ficha, orden, aviso de riesgo, ejecutada/pendiente, cartera, órdenes y alertas
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { AssetDetailT, AssetItemT, AssetTypeT, OrderResultT, OrderSideT, OrderTypeT, PositionT } from '@/shared/contract'
import { arrowPct, countdown, money, num, pct, qty as fmtQty, signedMoney, toNum, withSymbol } from '@/shared/format'
import { api, ApiFailure, type CandleInterval, type OrderInput } from '../api'
import { useLang, useMe, usePortfolio, useRefreshAll } from '../hooks'
import { useToast } from '../providers'
import { CandleChart, Donut, LineChart, Sparkline } from '../ui/charts'
import { Icon } from '../ui/icons'
import { Disclaimer, ErrorState, PageSkeleton, Seg, Sheet, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

// ── Formato de precios por tipo de activo ────────────────
export function fmtAssetPrice(a: { price: string; currency: 'EUR' | 'USD'; type: AssetTypeT }, locale: string) {
  const v = toNum(a.price)
  if (a.type === 'FX') return num(v, locale, 4)
  if (a.type === 'INDEX') return num(v, locale, v >= 1000 ? 0 : 2)
  const d = v >= 10000 ? 0 : 2
  return withSymbol(num(v, locale, d), a.currency, locale)
}

function useStatus() {
  const t = useTranslations('market')
  return (a: Pick<AssetItemT, 'type' | 'exchange' | 'isOpen' | 'delayedMinutes'>) => {
    if (a.type === 'CRYPTO') return t('crypto247')
    const base = `${a.type === 'FX' ? t('fx') : a.type === 'INDEX' ? t('index') : a.exchange} · ${a.isOpen ? t('open') : t('closed')}`
    return a.delayedMinutes ? `${base} · ${t('delayed', { n: a.delayedMinutes })}` : base
  }
}

function useUnit() {
  const t = useTranslations('market')
  return (type: AssetTypeT, symbol: string) => (type === 'CRYPTO' ? symbol : type === 'FX' ? t('units') : type === 'ETF' ? t('shares') : t('stocks'))
}

/** Valor que parpadea en verde o rojo cuando cambia */
function Live({ value, children, className }: { value: number; children: React.ReactNode; className?: string }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState('')
  useEffect(() => {
    if (value !== prev.current) {
      setFlash(value > prev.current ? 'flash-up' : 'flash-down')
      prev.current = value
      const id = setTimeout(() => setFlash(''), 800)
      return () => clearTimeout(id)
    }
  }, [value])
  return <span className={`${className ?? ''} ${flash}`}>{children}</span>
}

function AssetRow({ a }: { a: AssetItemT }) {
  const locale = useLang()
  const status = useStatus()
  const up = a.changePct >= 0
  return (
    <Link href={`/mercado/${a.symbol}`} className="li">
      <span className="ava">{a.symbol.slice(0, 4)}</span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[15px]">{a.name}</b>
        <span className="t-cap block truncate">{status(a)}</span>
      </span>
      <Sparkline values={a.sparkline} up={up} />
      <span className="w-[96px] text-right">
        <Live value={toNum(a.price)} className="block text-[15px] font-bold">
          {fmtAssetPrice(a, locale)}
        </Live>
        <span className={`t-cap font-bold ${up ? 'up' : 'down'}`}>{arrowPct(a.changePct, locale)}</span>
      </span>
    </Link>
  )
}

type Filter = 'WATCH' | AssetTypeT

export function Market() {
  const t = useTranslations('market')
  const locale = useLang()
  const [filter, setFilter] = useState<Filter>('WATCH')
  const [q, setQ] = useState('')
  const { data: pf } = usePortfolio()
  const list = useQuery({ queryKey: ['assets', filter, q], queryFn: () => api.assets({ type: filter, q }), refetchInterval: 5_000, placeholderData: keepPreviousData })
  const filters: Filter[] = ['WATCH', 'STOCK', 'ETF', 'CRYPTO', 'INDEX', 'FX']
  const stale = list.data?.some(a => a.stale)
  return (
    <div className="pad">
      <div className="flex items-end justify-between px-0.5">
        <h1 className="t-large">{t('title')}</h1>
        <span className="t-foot text-right">
          {t('available')}
          <br />
          <b style={{ color: 'var(--ink)' }}>{pf ? money(pf.cash, 'EUR', locale) : '—'}</b>
        </span>
      </div>
      <MarketSeg active="assets" />
      <div className="relative">
        <Icon name="search" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2" />
        <input className="input pl-10" style={{ background: 'var(--fill)', border: 'none' }} placeholder={t('search')} aria-label={t('search')} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="pills" role="group" aria-label={t('filters')}>
        {filters.map(f => (
          <button key={f} aria-pressed={!q && filter === f} onClick={() => (setFilter(f), setQ(''))}>
            {t(`filter.${f}`)}
          </button>
        ))}
      </div>
      {list.isError ? (
        <ErrorState onRetry={() => list.refetch()} />
      ) : (
        <div className="list">
          {!list.data ? (
            <div className="li t-foot">{t('loading')}</div>
          ) : list.data.length ? (
            list.data.map(a => <AssetRow key={a.symbol} a={a} />)
          ) : (
            <div className="li t-foot">{q ? t('noResults') : t('emptyWatch')}</div>
          )}
        </div>
      )}
      {stale && <div className="banner">{t('stale')}</div>}
      <p className="t-cap m-0">{t('dataNote')}</p>
      <Disclaimer />
    </div>
  )
}

function MarketSeg({ active }: { active: 'assets' | 'portfolio' | 'orders' }) {
  const t = useTranslations('market')
  const router = useRouter()
  return (
    <Seg
      label={t('sections')}
      value={active}
      onChange={v => router.push(v === 'assets' ? '/mercado' : v === 'portfolio' ? '/mercado/cartera' : '/mercado/ordenes')}
      options={[
        { value: 'assets', label: t('assets') },
        { value: 'portfolio', label: t('portfolio') },
        { value: 'orders', label: t('orders') },
      ]}
    />
  )
}

// ── Ficha de activo ──────────────────────────────────────
const RANGES: CandleInterval[] = ['1D', '1W', '1M', '3M', '1Y']

function PriceChart({ a }: { a: AssetDetailT }) {
  const t = useTranslations('market')
  const locale = useLang()
  const [mode, setMode] = useState<'line' | 'candles'>('line')
  const [range, setRange] = useState<CandleInterval>('1M')
  const { data } = useQuery({ queryKey: ['candles', a.symbol, range], queryFn: () => api.candles(a.symbol, range), refetchInterval: 30_000, placeholderData: keepPreviousData })
  const closes = useMemo(() => data?.map(c => c.c) ?? [], [data])
  const up = closes.length > 1 ? closes[closes.length - 1] >= closes[0] : a.changePct >= 0
  const when = (i: number) => {
    const d = data?.[i]
    if (!d) return ''
    const date = new Date(d.t)
    return range === '1D' ? date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  }
  return (
    <>
      <div className="card px-2 pt-3 pb-2">
        {!data ? (
          <div className="skel h-[170px]" />
        ) : mode === 'line' ? (
          <LineChart values={closes} up={up} label={t('chartLabel', { name: a.name })} format={(v, i) => `${fmtAssetPrice({ ...a, price: String(v) }, locale)} · ${when(i)}`} />
        ) : (
          <CandleChart candles={data.slice(-40)} label={t('candlesLabel', { name: a.name })} />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Seg label={t('chartType')} className="w-[140px]" value={mode} onChange={setMode} options={[{ value: 'line', label: t('line') }, { value: 'candles', label: t('candles') }]} />
        <Seg label={t('range')} className="max-w-[230px] flex-1" value={range} onChange={setRange} options={RANGES.map(r => ({ value: r, label: t(`ranges.${r}`) }))} />
      </div>
    </>
  )
}

export function Asset({ symbol }: { symbol: string }) {
  const t = useTranslations('market')
  const locale = useLang()
  const toast = useToast()
  const status = useStatus()
  const unit = useUnit()
  const refresh = useRefreshAll()
  const { data: a, isError, refetch } = useQuery({ queryKey: ['asset', symbol], queryFn: () => api.asset(symbol), refetchInterval: 5_000 })
  const { data: pf } = usePortfolio()
  const { data: watch } = useQuery({ queryKey: ['watchlist'], queryFn: api.watchlist })
  const follow = useMutation({ mutationFn: () => api.toggleWatch(symbol), onSuccess: w => (refresh(), toast(w.includes(symbol) ? t('following') : t('unfollowed'))) })
  const [order, setOrder] = useState<OrderSideT | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [done, setDone] = useState<OrderResultT | null>(null)
  if (isError) return <ErrorState onRetry={refetch} />
  if (!a) return <PageSkeleton />
  if (done) return <Filled r={done} a={a} />
  const pos = pf?.positions.find(p => p.symbol === symbol)
  const up = a.changePct >= 0
  const watching = watch?.includes(symbol)
  const tradable = a.type !== 'INDEX'
  return (
    <>
      <TopBar
        back="/mercado"
        right={
          <div className="flex">
            <button className="link" onClick={() => follow.mutate()} aria-pressed={watching}>
              {watching ? `★ ${t('watching')}` : `☆ ${t('watch')}`}
            </button>
            <button className="link" onClick={() => setAlertOpen(true)}>
              {t('alert')}
            </button>
          </div>
        }
      />
      <div className="pad">
        <span className="t-foot">
          {a.symbol} · {status(a)}
          {a.closesAt && ` · ${t('closesIn', { time: countdown(a.closesAt) })}`}
          {a.opensAt && ` · ${t('opensIn', { time: countdown(a.opensAt) })}`}
        </span>
        <h1 className="t-title -mt-1.5">{a.name}</h1>
        <Live value={toNum(a.price)} className="big">
          {fmtAssetPrice(a, locale)}
        </Live>
        <span className={`t-body -mt-1.5 font-bold ${up ? 'up' : 'down'}`}>
          {up ? '▲ +' : '▼ −'}
          {num(Math.abs(toNum(a.change)), locale, a.type === 'FX' ? 4 : 2)} ({pct(a.changePct, locale)}) {t('today')}
        </span>
        {a.currency === 'USD' && a.type !== 'FX' && <span className="t-foot -mt-2">≈ {money(a.priceInUserCurrency, 'EUR', locale)}</span>}
        {a.stale && <div className="banner">{t('staleAsset')}</div>}
        <PriceChart a={a} />
        {pos ? (
          <div className="card grid grid-cols-2 gap-3.5">
            <div>
              <span className="t-cap">{t('yourPosition')}</span>
              <br />
              <b>
                {fmtQty(pos.qty, locale)} {unit(a.type, a.symbol)}
              </b>
            </div>
            <div>
              <span className="t-cap">{t('return')}</span>
              <br />
              <b className={toNum(pos.unrealizedPnl) >= 0 ? 'up' : 'down'}>
                {signedMoney(pos.unrealizedPnl, 'EUR', locale)} ({pos.pnlPct >= 0 ? '+' : '−'}{pct(pos.pnlPct, locale, 1)})
              </b>
            </div>
            <div>
              <span className="t-cap">{t('avgPrice')}</span>
              <br />
              <b>{money(pos.avgPrice, 'EUR', locale)}</b>
            </div>
            <div>
              <span className="t-cap">{t('weight')}</span>
              <br />
              <b>{num(pos.weightPct, locale, 0)} %</b>
            </div>
          </div>
        ) : (
          <div className="card t-foot">{tradable ? t('noPosition', { name: a.name }) : t('indexNote')}</div>
        )}
        <div className="card">
          <b className="t-head">{t('about')}</b>
          <p className="t-foot m-0 mt-1">{a.description}</p>
        </div>
        <Disclaimer />
      </div>
      {tradable && (
        <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] grid grid-cols-2 gap-2.5 px-4 py-2.5 md:bottom-0" style={{ background: 'var(--bg)' }}>
          <button className="btn btn-secondary" disabled={!pos} onClick={() => setOrder('SELL')}>
            {t('sell')}
          </button>
          <button className="btn btn-primary" onClick={() => setOrder('BUY')}>
            {t('buy')}
          </button>
        </div>
      )}
      {order && <OrderFlow a={a} side={order} position={pos} cash={toNum(pf?.cash ?? '0')} onClose={() => setOrder(null)} onDone={r => (setOrder(null), setDone(r), refresh())} />}
      <AlertSheet open={alertOpen} a={a} onClose={() => setAlertOpen(false)} />
    </>
  )
}

// ── Orden (04.3) + aviso de riesgo (04.4) + bloqueo ──────
function OrderFlow({ a, side, position, cash, onClose, onDone }: { a: AssetDetailT; side: OrderSideT; position?: PositionT; cash: number; onClose: () => void; onDone: (r: OrderResultT) => void }) {
  const t = useTranslations('market')
  const tc = useTranslations('common')
  const locale = useLang()
  const toast = useToast()
  const router = useRouter()
  const unit = useUnit()
  const { data: me } = useMe()
  const buy = side === 'BUY'
  const [type, setType] = useState<OrderTypeT>('MARKET')
  const [amount, setAmount] = useState(() => Math.min(500, Math.max(10, Math.floor(cash / 10) * 10)))
  const [sellPct, setSellPct] = useState(100)
  const [trigger, setTrigger] = useState(() => a.price)
  const [sheet, setSheet] = useState<'order' | 'risk' | 'lock'>('order')
  const [followed, setFollowed] = useState(false)

  const input: OrderInput = buy
    ? { symbol: a.symbol, side, type, amount: String(amount), triggerPrice: type === 'MARKET' ? undefined : trigger }
    : { symbol: a.symbol, side, type, qty: String((toNum(position?.qty ?? '0') * sellPct) / 100), triggerPrice: type === 'MARKET' ? undefined : trigger }
  const pv = useQuery({ queryKey: ['preview', input], queryFn: () => api.previewOrder(input), placeholderData: keepPreviousData })
  const place = useMutation({
    mutationFn: (ack: boolean) => api.placeOrder({ ...input, riskAcknowledged: ack, followedRiskAdvice: followed }),
    onSuccess: onDone,
    onError: e => toast(e instanceof ApiFailure ? e.message : t('orderError')),
  })
  const p = pv.data
  const locked = (k: OrderTypeT) => !!p?.locked.some(l => l.type === k)
  const types: { k: OrderTypeT; label: string }[] = [
    { k: 'MARKET', label: t('types.MARKET') },
    { k: 'LIMIT', label: t('types.LIMIT') },
    { k: 'STOP_LOSS', label: t('types.STOP_LOSS') },
    { k: 'TAKE_PROFIT', label: t('types.TAKE_PROFIT') },
  ].filter(x => buy ? x.k === 'MARKET' || x.k === 'LIMIT' : true) as { k: OrderTypeT; label: string }[]
  const review = () => {
    if (!p) return
    if (p.risk.flagged) setSheet('risk')
    else place.mutate(false)
  }
  const triggerHelp = type === 'LIMIT' ? (buy ? t('limitBuyHelp') : t('limitSellHelp')) : type === 'STOP_LOSS' ? t('stopHelp') : type === 'TAKE_PROFIT' ? t('tpHelp') : null
  const maxAmount = Math.max(10, Math.floor(cash))
  const ctaDisabled = !p || !!p.error || place.isPending || (type !== 'MARKET' && !(toNum(trigger) > 0))
  const errorText = p?.error ? t(`errors.${p.error}`) : null
  const suggested = p?.risk.suggestedAmount ? Math.floor(toNum(p.risk.suggestedAmount) / 10) * 10 : 0

  return (
    <>
      <Sheet open={sheet === 'order'} onClose={onClose} label={`${buy ? t('buy') : t('sell')} ${a.symbol}`}>
        <div className="flex items-center justify-between">
          <span className="t-head">
            {buy ? t('buy') : t('sell')} {a.symbol}
          </span>
          <button className="icon-btn" onClick={onClose} aria-label={tc('close')}>
            <Icon name="close" />
          </button>
        </div>
        <div className="seg" role="group" aria-label={t('orderType')}>
          {types.map(x => (
            <button key={x.k} aria-pressed={type === x.k} onClick={() => (locked(x.k) ? setSheet('lock') : setType(x.k))}>
              {x.label}
              {locked(x.k) && ' 🔒'}
            </button>
          ))}
        </div>
        {buy ? (
          <>
            <div className="py-1.5 text-center">
              <label htmlFor="o-amount" className="sr-only">
                {t('amountEur')}
              </label>
              <div className={`flex items-baseline justify-center gap-1 ${locale === 'en' ? 'flex-row-reverse' : ''}`}>
                <input id="o-amount" inputMode="decimal" style={{ width: `${Math.max(2, String(amount).length) + 0.6}ch` }} className="bg-transparent text-center text-[46px] leading-[52px] font-extrabold tracking-[-0.02em] outline-none" value={amount} onChange={e => setAmount(Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0))} />
                <span className="text-[30px] font-extrabold">€</span>
              </div>
              <span className="t-foot">
                ≈ {p ? fmtQty(p.qty, locale) : '—'} {unit(a.type, a.symbol)} · {fmtAssetPrice(a, locale)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[100, 500, 1000, 2500].map(v => (
                <button key={v} className="opt justify-center px-1 py-2.5" aria-pressed={amount === v} onClick={() => (setAmount(v), setFollowed(false))}>
                  {withSymbol(num(v, locale, 0), 'EUR', locale)}
                </button>
              ))}
            </div>
            <input type="range" min={10} max={maxAmount} step={10} value={Math.min(amount, maxAmount)} onChange={e => setAmount(Number(e.target.value))} aria-label={t('amountEur')} className="w-full" style={{ accentColor: 'var(--brand)' }} />
          </>
        ) : (
          <>
            <div className="py-1.5 text-center">
              <div className="big text-[46px] leading-[52px]">{sellPct} %</div>
              <span className="t-foot">
                {t('ofPosition')} · {fmtQty(input.qty ?? '0', locale)} {unit(a.type, a.symbol)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[25, 50, 75, 100].map(v => (
                <button key={v} className="opt justify-center px-1 py-2.5" aria-pressed={sellPct === v} onClick={() => setSellPct(v)}>
                  {v} %
                </button>
              ))}
            </div>
          </>
        )}
        {type !== 'MARKET' && (
          <div className="field">
            <label htmlFor="o-trigger">
              {t('triggerPrice')} ({a.currency === 'EUR' ? '€' : '$'})
            </label>
            <input id="o-trigger" className="input" inputMode="decimal" value={trigger} onChange={e => setTrigger(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))} />
            <span className="t-cap">{triggerHelp}</span>
          </div>
        )}
        <div className="card px-4 py-1" aria-live="polite">
          <div className="kv">
            <span>{t('estPrice')}</span>
            <span>{fmtAssetPrice({ ...a, price: p?.estPrice ?? a.price }, locale)}</span>
          </div>
          <div className="kv">
            <span>{t('fee')}</span>
            <span>{p ? money(p.fee, 'EUR', locale) : '—'}</span>
          </div>
          <div className="kv">
            <span>{buy ? t('cashAfter') : t('youGet')}</span>
            <span>{p ? money(buy ? p.cashAfter : p.total, 'EUR', locale) : '—'}</span>
          </div>
          <div className="kv">
            <span>{t('weight')}</span>
            <span style={p?.risk.flagged ? { color: 'var(--down)' } : undefined}>{p ? `${num(p.weightPct, locale, 0)} %` : '—'}</span>
          </div>
        </div>
        {p && p.locked.length > 0 && (
          <div className="t-cap flex items-center gap-2">
            <Icon name="lock" size={16} />
            <span>{t('lockedNote')}</span>
          </div>
        )}
        {!a.isOpen && type === 'MARKET' && <div className="banner">{t('closedNote')}</div>}
        <button className="btn btn-primary" disabled={ctaDisabled} onClick={review}>
          {errorText ?? (type === 'MARKET' ? (buy ? t('confirmBuy') : t('confirmSell')) : t('placeOrder'))}
        </button>
      </Sheet>

      <Sheet open={sheet === 'risk'} onClose={() => setSheet('order')} label={t('riskTitle')} alert>
        <div className="flex items-start gap-3">
          <Lumi mood="WORRIED" size={52} skin={me?.companion.skinId} />
          <span className="t-title text-[22px] leading-[27px]">{t('riskHead', { name: me?.name ?? '' })}</span>
        </div>
        <p className="t-body m-0">
          {t.rich('riskBody', {
            name: a.name,
            pct: num(p?.weightPct ?? 0, locale, 0),
            loss: money(amount * 0.1, 'EUR', locale),
            b: chunks => <b>{chunks}</b>,
          })}
        </p>
        <div className="card flex items-center justify-between px-3.5 py-3">
          <span className="t-foot">{t('riskLimit')}</span>
          <b>{t('riskLimitValue', { pct: p?.risk.thresholdPct ?? 20 })}</b>
        </div>
        {suggested >= 10 ? (
          <button className="btn btn-primary" onClick={() => (setAmount(suggested), setFollowed(true), setSheet('order'))}>
            {t('lowerTo', { amount: money(suggested, 'EUR', locale) })}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => router.push('/mercado')}>
            {t('lookOther')}
          </button>
        )}
        <button className="btn btn-secondary" disabled={place.isPending} onClick={() => place.mutate(true)}>
          {t('buyAnyway')}
        </button>
        <Link href="/clases" className="btn btn-plain text-[15px]">
          {t('whatDiversify')}
        </Link>
      </Sheet>

      <Sheet open={sheet === 'lock'} onClose={() => setSheet('order')} label={t('lockTitle')}>
        <div className="flex items-center gap-3">
          <Lumi mood="THINKING" size={48} />
          <span className="t-head">{t('lockTitle')}</span>
        </div>
        <p className="t-body muted m-0">{t('lockBody')}</p>
        <Link href="/leccion/u3l3" className="btn btn-primary">
          {t('goLesson')}
        </Link>
        <Link href="/premium" className="btn btn-secondary">
          {t('seePremium')}
        </Link>
        <button className="btn btn-plain" onClick={() => setSheet('order')}>
          {t('gotIt')}
        </button>
      </Sheet>
    </>
  )
}

// ── Ejecutada / pendiente (04.5) ─────────────────────────
function Filled({ r, a }: { r: OrderResultT; a: AssetDetailT }) {
  const t = useTranslations('market')
  const tg = useTranslations('goals')
  const locale = useLang()
  const unit = useUnit()
  const o = r.order
  const pending = o.status === 'PENDING'
  const when = new Date(o.filledAt ?? o.createdAt)
  const total = toNum(o.amount) + (o.side === 'BUY' ? toNum(o.fee) : -toNum(o.fee))
  return (
    <div className="pad min-h-[calc(100dvh-100px)] items-center pt-8 text-center">
      <div className="flex h-[72px] w-[72px] animate-pop items-center justify-center rounded-full text-white" style={{ background: pending ? 'var(--amber)' : 'var(--up)' }}>
        {pending ? <Icon name="clock" size={34} /> : <Icon name="check" size={36} strokeWidth={2.4} />}
      </div>
      <h1 className="t-large">{pending ? t('pendingTitle') : o.side === 'BUY' ? t('boughtTitle') : t('soldTitle')}</h1>
      {pending && <p className="t-body muted m-0">{o.type === 'MARKET' ? t('pendingMarket', { when: o.executesAt ? new Date(o.executesAt).toLocaleString(locale, { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : '—' }) : t('pendingTrigger', { price: o.triggerPrice ?? '' })}</p>}
      <div className="card w-full px-4 py-1 text-left">
        <div className="kv">
          <span>{t('asset')}</span>
          <span>
            {o.symbol} · {fmtQty(o.qty, locale)} {unit(a.type, a.symbol)}
          </span>
        </div>
        <div className="kv">
          <span>{pending ? t('estPrice') : t('fillPrice')}</span>
          <span>{fmtAssetPrice({ ...a, price: o.fillPrice ?? a.price }, locale)}</span>
        </div>
        <div className="kv">
          <span>{t('fee')}</span>
          <span>{money(o.fee, 'EUR', locale)}</span>
        </div>
        <div className="kv">
          <span>{t('totalWithFee')}</span>
          <span>{money(total, 'EUR', locale)}</span>
        </div>
        <div className="kv">
          <span>{t('time')}</span>
          <span>{when.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
      {r.xp > 0 && (
        <div className="banner banner-info w-full justify-center">
          +{r.xp} XP{r.goalsCompleted.map(g => ` · ${t('goalDone', { goal: tg(g) })}`).join('')}
        </div>
      )}
      {r.achievementsUnlocked.map(x => (
        <div key={x.code} className="card flex w-full items-center gap-3 text-left">
          <span className="ava" style={{ background: 'var(--brand)', color: '#fff' }}>
            {x.icon}
          </span>
          <b className="flex-1">{x.title}</b>
          <span className="t-cap">+{x.reward.gems} 💎</span>
        </div>
      ))}
      {r.companion && (
        <div className="card flex w-full items-center gap-3 text-left">
          <Lumi mood={r.companion.mood} size={40} />
          <span className="t-foot" style={{ color: 'var(--ink)' }}>
            {r.companion.message}
          </span>
        </div>
      )}
      <div className="flex-1" />
      <Link href="/mercado/cartera" className="btn btn-primary">
        {t('seePortfolio')}
      </Link>
      <Link href="/mercado" className="btn btn-plain">
        {t('keepMarket')}
      </Link>
    </div>
  )
}

// ── Alertas de precio ────────────────────────────────────
function AlertSheet({ open, a, onClose }: { open: boolean; a: AssetDetailT; onClose: () => void }) {
  const t = useTranslations('market')
  const toast = useToast()
  const refresh = useRefreshAll()
  const [cond, setCond] = useState<'ABOVE' | 'BELOW'>('BELOW')
  const [price, setPrice] = useState(a.price)
  const m = useMutation({ mutationFn: () => api.createAlert({ symbol: a.symbol, condition: cond, price }), onSuccess: () => (refresh(), toast(t('alertCreated')), onClose()) })
  return (
    <Sheet open={open} onClose={onClose} label={t('alertTitle')}>
      <span className="t-head">{t('alertTitle')} · {a.symbol}</span>
      <Seg label={t('alertCondition')} value={cond} onChange={setCond} options={[{ value: 'BELOW', label: t('below') }, { value: 'ABOVE', label: t('above') }]} />
      <div className="field">
        <label htmlFor="al-price">
          {t('price')} ({a.type === 'FX' || a.type === 'INDEX' ? '' : a.currency === 'EUR' ? '€' : '$'})
        </label>
        <input id="al-price" className="input" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))} />
      </div>
      <p className="t-cap m-0">{t('alertNote')}</p>
      <button className="btn btn-primary" disabled={!(toNum(price) > 0) || m.isPending} onClick={() => m.mutate()}>
        {t('createAlert')}
      </button>
    </Sheet>
  )
}

// ── Cartera (04.6) ───────────────────────────────────────
const TYPE_COLORS: Record<string, string> = { STOCK: 'var(--brand)', ETF: 'var(--up)', CRYPTO: 'var(--rare-epic)', FX: 'var(--amber)', INDEX: 'var(--ink-3)', CASH: 'var(--fill)' }

export function Portfolio() {
  const t = useTranslations('market')
  const locale = useLang()
  const unit = useUnit()
  const { data: pf, isError, refetch } = usePortfolio()
  const [range, setRange] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M')
  const hist = useQuery({ queryKey: ['history', range], queryFn: () => api.portfolioHistory(range), placeholderData: keepPreviousData })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!pf) return <PageSkeleton />
  const dayUp = toNum(pf.dayChange) >= 0
  const totalUp = pf.totalReturnPct >= 0
  const byType = pf.positions.reduce<Record<string, number>>((m, p) => ((m[p.type] = (m[p.type] ?? 0) + toNum(p.marketValue)), m), {})
  const parts = [...Object.entries(byType).map(([k, v]) => ({ label: t(`filter.${k}`), value: v, color: TYPE_COLORS[k] })), { label: t('cash'), value: toNum(pf.cash), color: 'var(--ink-3)' }]
  const total = toNum(pf.totalValue)
  return (
    <div className="pad">
      <h1 className="t-large px-0.5">{t('portfolio')}</h1>
      <MarketSeg active="portfolio" />
      <div className="card flex flex-col gap-1">
        <span className="t-foot">{t('totalValue')}</span>
        <Live value={total} className="big">
          {money(pf.totalValue, 'EUR', locale)}
        </Live>
        <span className={`t-foot font-bold ${dayUp ? 'up' : 'down'}`}>
          {dayUp ? '▲' : '▼'} {signedMoney(pf.dayChange, 'EUR', locale)} {t('today')}
        </span>
        <span className={`t-foot font-bold ${totalUp ? 'up' : 'down'}`}>
          {arrowPct(pf.totalReturnPct, locale)} {t('total')}
        </span>
        <div className="mt-1.5">{hist.data ? <LineChart values={hist.data.map(p => p.v)} up={totalUp} height={80} label={t('historyLabel')} format={(v, i) => `${money(v, 'EUR', locale)} · ${new Date(hist.data![i].t).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`} /> : <div className="skel h-20" />}</div>
        <Seg label={t('range')} value={range} onChange={setRange} options={(['1W', '1M', '3M', 'ALL'] as const).map(r => ({ value: r, label: t(`pranges.${r}`) }))} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="stat">
          <span className="t-cap">{t('cash')}</span>
          <b className="text-lg">{money(pf.cash, 'EUR', locale)}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('realized')}</span>
          <b className={`text-lg ${toNum(pf.realizedPnl) >= 0 ? 'up' : 'down'}`}>{signedMoney(pf.realizedPnl, 'EUR', locale)}</b>
        </div>
      </div>
      {pf.positions.length > 0 && (
        <div className="card flex items-center gap-4">
          <Donut parts={parts} size={104} />
          <div className="flex flex-1 flex-col gap-1.5">
            {parts.map(p => (
              <span key={p.label} className="t-foot flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                <span className="flex-1">{p.label}</span>
                <b>{num((p.value / total) * 100, locale, 0)} %</b>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="t-head">{t('positions', { n: pf.positions.length })}</span>
        <span className="t-foot">
          {t('unrealized')} <b className={toNum(pf.unrealizedPnl) >= 0 ? 'up' : 'down'}>{signedMoney(pf.unrealizedPnl, 'EUR', locale)}</b>
        </span>
      </div>
      <div className="list">
        {pf.positions.length ? (
          pf.positions.map(p => (
            <Link key={p.symbol} href={`/mercado/${p.symbol}`} className="li">
              <span className="ava">{p.symbol.slice(0, 4)}</span>
              <span className="min-w-0 flex-1">
                <b>{p.symbol}</b>
                <br />
                <span className="t-cap">
                  {fmtQty(p.qty, locale)} {unit(p.type, p.symbol)} · {num(p.weightPct, locale, 0)} %
                </span>
              </span>
              <span className="text-right">
                <Live value={toNum(p.marketValue)} className="font-bold">
                  {money(p.marketValue, 'EUR', locale)}
                </Live>
                <br />
                <span className={`t-cap font-bold ${p.pnlPct >= 0 ? 'up' : 'down'}`}>{arrowPct(p.pnlPct, locale)}</span>
              </span>
            </Link>
          ))
        ) : (
          <div className="li t-foot">
            {t('noPositions')}{' '}
            <Link href="/mercado" className="link">
              {t('goMarket')}
            </Link>
          </div>
        )}
      </div>
      <Disclaimer />
    </div>
  )
}

// ── Órdenes, historial y alertas (04.7) ──────────────────
export function Orders() {
  const t = useTranslations('market')
  const locale = useLang()
  const toast = useToast()
  const refresh = useRefreshAll()
  const orders = useQuery({ queryKey: ['orders'], queryFn: api.orders, refetchInterval: 10_000 })
  const trades = useQuery({ queryKey: ['trades'], queryFn: api.trades })
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: api.alerts })
  const cancel = useMutation({ mutationFn: (id: string) => api.cancelOrder(id), onSuccess: () => (refresh(), toast(t('cancelled'))) })
  const delAlert = useMutation({ mutationFn: (id: string) => api.deleteAlert(id), onSuccess: () => (refresh(), toast(t('alertDeleted'))) })
  const day = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) + ' · ' + new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="pad">
      <h1 className="t-large px-0.5">{t('orders')}</h1>
      <MarketSeg active="orders" />
      <span className="t-head">{t('pending', { n: orders.data?.length ?? 0 })}</span>
      <div className="list">
        {orders.data?.length ? (
          orders.data.map(o => (
            <div key={o.id} className="li plainline">
              <span className="flex-1">
                <b>
                  {t(`types.${o.type}`)} · {o.side === 'BUY' ? t('buy') : t('sell')} {o.symbol}
                </b>
                <br />
                <span className="t-cap">{o.triggerPrice ? t('pendingAt', { amount: money(o.amount, 'EUR', locale), price: o.triggerPrice }) : t('pendingOpen', { amount: money(o.amount, 'EUR', locale) })}</span>
              </span>
              <button className="link" onClick={() => cancel.mutate(o.id)}>
                {t('cancel')}
              </button>
            </div>
          ))
        ) : (
          <div className="li plainline t-foot">{t('noPending')}</div>
        )}
      </div>
      <span className="t-head">{t('history')}</span>
      <div className="list">
        {trades.data?.length ? (
          trades.data.slice(0, 50).map(x => {
            const rejected = x.status === 'REJECTED'
            const amount = toNum(x.total) + (x.side === 'BUY' ? toNum(x.fee) : -toNum(x.fee))
            return (
              <div key={x.id} className="li plainline">
                <span className="flex-1">
                  <b>
                    {x.type === 'MARKET' ? (x.side === 'BUY' ? t('buyNoun') : t('sellNoun')) : t(`types.${x.type}`)} · {x.symbol}
                  </b>
                  <br />
                  <span className="t-cap">
                    {day(x.createdAt)}
                    {rejected ? ` · ${t('rejected', { reason: x.rejectReason ?? '' })}` : x.realizedPnl !== null ? ` · ${t('result')} ${signedMoney(x.realizedPnl, 'EUR', locale)}` : ''}
                  </span>
                </span>
                <b className={rejected ? 'muted' : x.side === 'SELL' ? 'up' : ''}>{rejected ? money(0, 'EUR', locale) : `${x.side === 'BUY' ? '−' : '+'}${money(amount, 'EUR', locale)}`}</b>
              </div>
            )
          })
        ) : (
          <div className="li plainline t-foot">{t('noTrades')}</div>
        )}
      </div>
      <span className="t-head">{t('alerts')}</span>
      <div className="list">
        {alerts.data?.length ? (
          alerts.data.map(al => (
            <div key={al.id} className="li plainline">
              <span className="flex-1">
                <b>{t(al.condition === 'ABOVE' ? 'alertAbove' : 'alertBelow', { symbol: al.symbol, price: num(al.price, locale) })}</b>
                <br />
                <span className="t-cap">{al.active ? t('alertActive') : t('alertDone')}</span>
              </span>
              <button className="icon-btn" aria-label={t('deleteAlert')} onClick={() => delAlert.mutate(al.id)}>
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="li plainline t-foot">{t('noAlerts')}</div>
        )}
      </div>
      <Disclaimer />
    </div>
  )
}
