'use client'
// 04 · Mercado global: portada por regiones, explorador con filtros, ficha con gráfico profesional,
// orden, aviso de riesgo, ejecutada/pendiente, cartera, órdenes y alertas
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { AssetDetailT, AssetItemT, AssetTypeT, OrderResultT, OrderSideT, OrderTypeT, PositionT, RegionT } from '@/shared/contract'
import { arrowPct, countdown, money, num, pct, qty as fmtQty, signedMoney, toNum, withSymbol } from '@/shared/format'
import { api, ApiFailure, type AssetFilter, type OrderInput } from '../api'
import { ProChart } from '../chart/pro-chart'
import { useLang, useMe, usePortfolio, useRefreshAll } from '../hooks'
import { useToast } from '../providers'
import { Donut, LineChart, Sparkline } from '../ui/charts'
import { Icon } from '../ui/icons'
import { Disclaimer, ErrorState, PageSkeleton, Seg, Sheet, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'
import { AssetBadge, AssetRow, assetHref, currencySymbol, decimalsFor, flagOf, fmtAssetPrice, Live, MarketSeg, useStatus, useUnit } from './market-ui'

export { fmtAssetPrice } from './market-ui'

type RegionSel = RegionT | 'ALL'
const REGIONS: RegionSel[] = ['ALL', 'AMERICA', 'EUROPE', 'ASIA']
const TYPES: AssetTypeT[] = ['STOCK', 'ETF', 'INDEX', 'CRYPTO', 'FX', 'COMMODITY']

/** Valor que se actualiza tras una pausa al escribir */
function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

function exploreHref(f: Partial<AssetFilter>) {
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]))
  const s = qs.toString()
  return s ? `/mercado/explorar?${s}` : '/mercado/explorar'
}

// ── Portada del Mercado ──────────────────────────────────
export function Market() {
  const t = useTranslations('market')
  const locale = useLang()
  const [region, setRegion] = useState<RegionSel>('ALL')
  const [movers, setMovers] = useState<'gainers' | 'losers'>('gainers')
  const [q, setQ] = useState('')
  const dq = useDebounced(q.trim())
  const { data: pf } = usePortfolio()
  const overview = useQuery({ queryKey: ['overview', region], queryFn: () => api.marketOverview(region), refetchInterval: 15_000, placeholderData: keepPreviousData })
  const watch = useQuery({ queryKey: ['assets', 'WATCH'], queryFn: () => api.assets({ type: 'WATCH' }), refetchInterval: 10_000 })
  const facets = useQuery({ queryKey: ['facets', region], queryFn: () => api.facets(region === 'ALL' ? undefined : region), staleTime: 3_600_000 })
  const search = useQuery({ queryKey: ['search', dq], queryFn: () => api.searchAssets({ q: dq, limit: 25 }), enabled: dq.length > 0, placeholderData: keepPreviousData })
  const ov = overview.data
  const stale = watch.data?.some(a => a.stale)

  return (
    <div className="pad wide">
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
        <input className="input pl-10" style={{ background: 'var(--fill)', border: 'none' }} placeholder={t('searchGlobal')} aria-label={t('searchGlobal')} value={q} onChange={e => setQ(e.target.value)} />
        {q && (
          <button className="icon-btn absolute top-1/2 right-1 -translate-y-1/2" aria-label={t('clearSearch')} onClick={() => setQ('')}>
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {dq ? (
        <>
          <span className="t-foot px-0.5">{search.data ? t('resultsCount', { n: search.data.total }) : t('loading')}</span>
          <div className="list">
            {search.data?.items.length ? search.data.items.map(a => <AssetRow key={a.symbol} a={a} />) : search.data && <div className="li t-foot">{t('noResults')}</div>}
          </div>
          {search.data && search.data.total > search.data.items.length && (
            <Link href={exploreHref({ q: dq })} className="btn btn-secondary">
              {t('seeAllResults', { n: search.data.total })}
            </Link>
          )}
        </>
      ) : (
        <>
          <div className="pills" role="group" aria-label={t('region')}>
            {REGIONS.map(r => (
              <button key={r} aria-pressed={region === r} onClick={() => setRegion(r)}>
                {t(`regions.${r}`)}
              </button>
            ))}
          </div>

          {/* Índices de la región */}
          <section aria-label={t('indices')} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="t-head">{t('indices')}</span>
              <Link href={exploreHref({ type: 'INDEX', region: region === 'ALL' ? undefined : region })} className="link text-[14px]">
                {t('seeAll')}
              </Link>
            </div>
            <div className="pills pb-1">
              {!ov
                ? [0, 1, 2, 3].map(i => <div key={i} className="skel h-[92px] w-[156px] flex-none rounded-2xl" />)
                : ov.indices.map(a => <IndexCard key={a.symbol} a={a} />)}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Tu lista */}
            <section aria-label={t('watchlist')} className="flex flex-col gap-2">
              <span className="t-head px-0.5">{t('watchlist')}</span>
              <div className="list">
                {!watch.data ? (
                  <div className="li t-foot">{t('loading')}</div>
                ) : watch.data.length ? (
                  watch.data.map(a => <AssetRow key={a.symbol} a={a} />)
                ) : (
                  <div className="li t-foot">{t('emptyWatch')}</div>
                )}
              </div>
            </section>

            {/* Lo que más se mueve hoy */}
            <section aria-label={t('movers')} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 px-0.5">
                <span className="t-head">{t('movers')}</span>
                <Seg label={t('movers')} className="w-[200px]" value={movers} onChange={setMovers} options={[{ value: 'gainers', label: t('gainers') }, { value: 'losers', label: t('losers') }]} />
              </div>
              <div className="list">
                {!ov ? (
                  <div className="li t-foot">{t('loading')}</div>
                ) : ov[movers].length ? (
                  ov[movers].map((a, i) => <AssetRow key={a.symbol} a={a} rank={i + 1} />)
                ) : (
                  <div className="li t-foot">{t('noMovers')}</div>
                )}
              </div>
              <Link href={exploreHref({ type: 'STOCK', region: region === 'ALL' ? undefined : region, sort: movers })} className="link px-0.5 text-[14px]">
                {t('seeRanking')}
              </Link>
            </section>
          </div>

          {/* Explorar por tipo */}
          <section aria-label={t('explore')} className="flex flex-col gap-2">
            <span className="t-head px-0.5">{t('explore')}</span>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TYPES.map(k => (
                <Link key={k} href={exploreHref({ type: k, region: region === 'ALL' || k === 'CRYPTO' || k === 'FX' || k === 'COMMODITY' ? undefined : region })} className="stat">
                  <span className="text-[22px]" aria-hidden="true">
                    {TYPE_EMOJI[k]}
                  </span>
                  <b className="text-[16px]">{t(`filter.${k}`)}</b>
                  <span className="t-cap">{t(`typeHint.${k}`)}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Explorar por índice */}
          {facets.data && facets.data.indices.length > 0 && (
            <section aria-label={t('byIndex')} className="flex flex-col gap-2">
              <span className="t-head px-0.5">{t('byIndex')}</span>
              <div className="flex flex-wrap gap-2">
                {facets.data.indices.map(ix => (
                  <Link key={ix.value} href={exploreHref({ index: ix.value })} className="chip">
                    {ix.value} <span className="t-cap">{ix.count}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {stale && <div className="banner">{t('stale')}</div>}
      <p className="t-cap m-0">{t('dataNoteGlobal')}</p>
      <Disclaimer />
    </div>
  )
}

const TYPE_EMOJI: Record<AssetTypeT, string> = { STOCK: '🏢', ETF: '🧺', INDEX: '📊', CRYPTO: '🪙', FX: '💱', COMMODITY: '🛢️' }

function IndexCard({ a }: { a: AssetItemT }) {
  const t = useTranslations('market')
  const locale = useLang()
  const up = a.changePct >= 0
  return (
    <Link href={assetHref(a.symbol)} className="card flex w-[156px] flex-none flex-col gap-0.5 p-3" style={{ color: 'var(--ink)' }}>
      <span className="t-cap truncate">
        {flagOf(a.country)} <span style={{ color: a.isOpen ? 'var(--up)' : undefined }}>●</span> {a.isOpen ? t('open') : t('closed')}
      </span>
      <b className="truncate text-[14px]">{a.name}</b>
      <Live value={toNum(a.price)} className="text-[15px] font-bold tabular-nums">
        {fmtAssetPrice(a, locale)}
      </Live>
      <span className="flex items-center justify-between gap-1">
        <span className={`t-cap font-bold tabular-nums ${up ? 'up' : 'down'}`}>{arrowPct(a.changePct, locale)}</span>
        <Sparkline values={a.sparkline} up={up} />
      </span>
    </Link>
  )
}

// ── Explorador con filtros ───────────────────────────────
const PAGE = 40

export function Explore({ initial }: { initial: Partial<AssetFilter> }) {
  const t = useTranslations('market')
  const router = useRouter()
  const [f, setF] = useState<AssetFilter>({ sort: 'name', ...initial })
  const [q, setQ] = useState(initial.q ?? '')
  const dq = useDebounced(q.trim())
  const filter: AssetFilter = { ...f, q: dq || undefined }
  const facets = useQuery({ queryKey: ['facets', f.region ?? 'ALL'], queryFn: () => api.facets(f.region), staleTime: 3_600_000 })
  const list = useInfiniteQuery({
    queryKey: ['explore', filter],
    queryFn: ({ pageParam }) => api.searchAssets({ ...filter, offset: pageParam, limit: PAGE }),
    initialPageParam: 0,
    getNextPageParam: last => last.nextOffset ?? undefined,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  })
  const sentinel = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list
  useEffect(() => {
    const el = sentinel.current
    if (!el || !hasNextPage) return
    const io = new IntersectionObserver(e => e[0].isIntersecting && !isFetchingNextPage && fetchNextPage(), { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // La URL refleja los filtros (se puede compartir y volver atrás)
  useEffect(() => {
    const qs = exploreHref({ ...f, q: dq || undefined, sort: f.sort === 'name' ? undefined : f.sort })
    window.history.replaceState(window.history.state, '', window.location.pathname + qs.slice('/mercado/explorar'.length))
  }, [f, dq])

  const set = (patch: Partial<AssetFilter>) => setF(prev => ({ ...prev, ...patch }))
  const items = list.data?.pages.flatMap(p => p.items) ?? []
  const total = list.data?.pages[0]?.total
  const geo = !f.type || f.type === 'STOCK' || f.type === 'ETF' || f.type === 'INDEX'
  const active = [f.type, f.region, f.country, f.sector, f.index].filter(Boolean).length

  return (
    <>
      <TopBar back="/mercado" title={t('explore')} />
      <div className="pad wide">
        <div className="relative">
          <Icon name="search" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2" />
          <input className="input pl-10" style={{ background: 'var(--fill)', border: 'none' }} placeholder={t('searchGlobal')} aria-label={t('searchGlobal')} value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="pills" role="group" aria-label={t('typeLabel')}>
          <button aria-pressed={!f.type} onClick={() => set({ type: undefined })}>
            {t('all')}
          </button>
          {TYPES.map(k => (
            <button key={k} aria-pressed={f.type === k} onClick={() => set({ type: k, ...(k === 'CRYPTO' || k === 'FX' || k === 'COMMODITY' ? { region: undefined, country: undefined, sector: undefined, index: undefined } : {}) })}>
              {t(`filter.${k}`)}
            </button>
          ))}
        </div>
        {geo && (
          <div className="pills" role="group" aria-label={t('region')}>
            {REGIONS.map(r => (
              <button key={r} aria-pressed={(f.region ?? 'ALL') === r} onClick={() => set({ region: r === 'ALL' ? undefined : r, country: undefined, index: undefined })}>
                {t(`regions.${r}`)}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {geo && (
            <>
              <FacetSelect label={t('indexLabel')} value={f.index} onChange={v => set({ index: v })} options={facets.data?.indices} />
              <FacetSelect label={t('countryLabel')} value={f.country} onChange={v => set({ country: v })} options={facets.data?.countries} render={v => `${flagOf(v)} ${v}`} />
              <FacetSelect label={t('sectorLabel')} value={f.sector} onChange={v => set({ sector: v })} options={facets.data?.sectors} />
            </>
          )}
          <label className="flex flex-col gap-1">
            <span className="t-cap">{t('sortLabel')}</span>
            <select className="input py-2.5" value={f.sort ?? 'name'} onChange={e => set({ sort: e.target.value as AssetFilter['sort'] })}>
              <option value="name">{t('sort.name')}</option>
              <option value="gainers">{t('sort.gainers')}</option>
              <option value="losers">{t('sort.losers')}</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between px-0.5">
          <span className="t-foot" aria-live="polite">
            {total === undefined ? t('loading') : t('resultsCount', { n: total })}
          </span>
          {active > 0 && (
            <button className="link text-[14px]" onClick={() => (setF({ sort: f.sort }), setQ(''))}>
              {t('clearFilters')}
            </button>
          )}
        </div>
        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} />
        ) : (
          <div className="list">
            {!list.data ? (
              <div className="li t-foot">{t('loading')}</div>
            ) : items.length ? (
              items.map(a => <AssetRow key={a.symbol} a={a} />)
            ) : (
              <div className="li t-foot">{t('noResults')}</div>
            )}
          </div>
        )}
        <div ref={sentinel} />
        {hasNextPage && (
          <button className="btn btn-secondary" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? t('loading') : t('loadMore')}
          </button>
        )}
        <button className="btn btn-plain" onClick={() => router.push('/mercado')}>
          {t('backHome')}
        </button>
        <p className="t-cap m-0">{t('dataNoteGlobal')}</p>
        <Disclaimer />
      </div>
    </>
  )
}

function FacetSelect({ label, value, onChange, options, render }: { label: string; value?: string; onChange: (v: string | undefined) => void; options?: { value: string; count: number }[]; render?: (v: string) => string }) {
  const t = useTranslations('market')
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="t-cap">{label}</span>
      <select className="input py-2.5" value={value ?? ''} onChange={e => onChange(e.target.value || undefined)}>
        <option value="">{t('all')}</option>
        {options?.map(o => (
          <option key={o.value} value={o.value}>
            {render ? render(o.value) : o.value} ({o.count})
          </option>
        ))}
        {value && !options?.some(o => o.value === value) && <option value={value}>{value}</option>}
      </select>
    </label>
  )
}

// ── Ficha de activo ──────────────────────────────────────
function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="t-cap truncate">{label}</span>
      <b className="truncate text-[15px] tabular-nums">{children}</b>
    </div>
  )
}

/** Barra de rango (mínimo–máximo) con la posición del precio actual */
function RangeBar({ low, high, value, fmt, label }: { low: number; high: number; value: number; fmt: (v: number) => string; label: string }) {
  const p = high > low ? Math.min(1, Math.max(0, (value - low) / (high - low))) : 0.5
  return (
    <div className="flex flex-col gap-1">
      <span className="t-cap">{label}</span>
      <div className="relative h-1.5 rounded-full" style={{ background: 'var(--fill)' }} role="img" aria-label={`${label}: ${fmt(low)} – ${fmt(high)}`}>
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${p * 100}%`, background: 'var(--ink)' }} />
      </div>
      <div className="t-cap flex justify-between tabular-nums">
        <span>{fmt(low)}</span>
        <span>{fmt(high)}</span>
      </div>
    </div>
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
  const price = toNum(a.price)
  const dec = decimalsFor(a.type, price)
  const fmt = (v: number) => fmtAssetPrice({ ...a, price: String(v) }, locale)
  const compact = (v: number) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 2 }).format(v)
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
      <div className="pad wide">
        <div className="flex items-center gap-3">
          <AssetBadge a={a} size={48} />
          <div className="min-w-0 flex-1">
            <span className="t-foot block truncate">
              {flagOf(a.country)} {a.ticker} · {status(a)}
              {a.closesAt && ` · ${t('closesIn', { time: countdown(a.closesAt) })}`}
              {a.opensAt && ` · ${t('opensIn', { time: countdown(a.opensAt) })}`}
            </span>
            <h1 className="t-title truncate">{a.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <Live value={price} className="big">
            {fmtAssetPrice(a, locale)}
          </Live>
          <span className={`t-body font-bold tabular-nums ${up ? 'up' : 'down'}`}>
            {up ? '▲ +' : '▼ −'}
            {num(Math.abs(toNum(a.change)), locale, dec)} ({pct(a.changePct, locale)}) {t('today')}
          </span>
        </div>
        {a.currency !== 'EUR' && a.type !== 'FX' && a.type !== 'INDEX' && <span className="t-foot -mt-2">≈ {money(a.priceInUserCurrency, 'EUR', locale)}</span>}
        {a.stale && <div className="banner">{t('staleAsset')}</div>}

        <ProChart symbol={a.symbol} decimals={dec} up={up} />

        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <div className="card flex flex-col gap-3.5">
            <b className="t-head">{t('keyData')}</b>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              <Stat label={t('prevClose')}>{fmt(a.prevClose)}</Stat>
              {a.volume !== null && a.type !== 'FX' && <Stat label={t('volume')}>{compact(a.volume)}</Stat>}
              <Stat label={t('currencyLabel')}>
                {a.type === 'INDEX' ? t('points') : `${a.currency} (${currencySymbol(a.currency, locale)})`}
              </Stat>
              <Stat label={t('exchangeLabel')}>{a.type === 'CRYPTO' ? t('crypto247') : a.exchangeName}</Stat>
              {a.country && a.type !== 'CRYPTO' && a.type !== 'FX' && <Stat label={t('countryLabel')}>{`${flagOf(a.country)} ${a.country}`}</Stat>}
              {a.sector && <Stat label={t('sectorLabel')}>{a.sector}</Stat>}
              <Stat label={t('delayLabel')}>{a.delayedMinutes ? t('delayed', { n: a.delayedMinutes }) : t('realtime')}</Stat>
              <Stat label={t('timezoneLabel')}>{a.timezone.split('/').pop()?.replace('_', ' ')}</Stat>
            </div>
            {a.dayLow !== null && a.dayHigh !== null && <RangeBar label={t('dayRange')} low={a.dayLow} high={a.dayHigh} value={price} fmt={fmt} />}
            {a.low52 !== null && a.high52 !== null && <RangeBar label={t('range52')} low={a.low52} high={a.high52} value={price} fmt={fmt} />}
            {a.indices.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="t-cap">{t('partOf')}</span>
                {a.indices.map(ix => (
                  <Link key={ix} href={exploreHref({ index: ix })} className="chip" style={{ background: 'var(--fill)' }}>
                    {ix}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {pos ? (
              <div className="card grid grid-cols-2 gap-3.5">
                <div>
                  <span className="t-cap">{t('yourPosition')}</span>
                  <br />
                  <b>
                    {fmtQty(pos.qty, locale)} {unit(a.type, a.ticker)}
                  </b>
                </div>
                <div>
                  <span className="t-cap">{t('return')}</span>
                  <br />
                  <b className={toNum(pos.unrealizedPnl) >= 0 ? 'up' : 'down'}>
                    {signedMoney(pos.unrealizedPnl, 'EUR', locale)} ({pos.pnlPct >= 0 ? '+' : '−'}
                    {pct(pos.pnlPct, locale, 1)})
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
          </div>
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
      <Sheet open={sheet === 'order'} onClose={onClose} label={`${buy ? t('buy') : t('sell')} ${a.ticker}`}>
        <div className="flex items-center justify-between">
          <span className="t-head">
            {buy ? t('buy') : t('sell')} {a.ticker}
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
                ≈ {p ? fmtQty(p.qty, locale) : '—'} {unit(a.type, a.ticker)} · {fmtAssetPrice(a, locale)}
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
                {t('ofPosition')} · {fmtQty(input.qty ?? '0', locale)} {unit(a.type, a.ticker)}
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
              {t('triggerPrice')} ({a.type === 'FX' || a.type === 'INDEX' ? a.currency : currencySymbol(a.currency, locale)})
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
            {o.symbol} · {fmtQty(o.qty, locale)} {unit(a.type, a.ticker)}
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
  const locale = useLang()
  const toast = useToast()
  const refresh = useRefreshAll()
  const [cond, setCond] = useState<'ABOVE' | 'BELOW'>('BELOW')
  const [price, setPrice] = useState(a.price)
  const m = useMutation({ mutationFn: () => api.createAlert({ symbol: a.symbol, condition: cond, price }), onSuccess: () => (refresh(), toast(t('alertCreated')), onClose()) })
  return (
    <Sheet open={open} onClose={onClose} label={t('alertTitle')}>
      <span className="t-head">{t('alertTitle')} · {a.ticker}</span>
      <Seg label={t('alertCondition')} value={cond} onChange={setCond} options={[{ value: 'BELOW', label: t('below') }, { value: 'ABOVE', label: t('above') }]} />
      <div className="field">
        <label htmlFor="al-price">
          {t('price')} ({a.type === 'FX' || a.type === 'INDEX' ? t('points') : currencySymbol(a.currency, locale)})
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
const TYPE_COLORS: Record<string, string> = { STOCK: 'var(--brand)', ETF: 'var(--up)', CRYPTO: 'var(--rare-epic)', FX: 'var(--amber)', COMMODITY: 'var(--down)', INDEX: 'var(--ink-3)', CASH: 'var(--fill)' }

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
            <Link key={p.symbol} href={assetHref(p.symbol)} className="li">
              <AssetBadge a={{ ticker: p.symbol.replace(/^\^/, '').split(/[.=-]/)[0], type: p.type }} />
              <span className="min-w-0 flex-1">
                <b className="block truncate">{p.name}</b>
                <span className="t-cap">
                  {fmtQty(p.qty, locale)} {unit(p.type, p.symbol.split(/[.=-]/)[0])} · {num(p.weightPct, locale, 0)} %
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
