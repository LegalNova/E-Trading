'use client'
// Mercado de verdad: datos de empresa de la ficha, bolsas abiertas ahora e «Ideas para estudiar».
// Todo con datos reales: si no hay dato, no se enseña y se dice. Las listas nunca son recomendaciones.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { AssetDetailT, FundamentalsT, IdeaItemT, IdeaListIdT, IdeaListT } from '@/shared/contract'
import { isOpen, nextOpen } from '@/shared/market-hours'
import { sessionOn } from '@/shared/session-times'
import { countdown } from '@/shared/format'
import { api, ApiFailure } from '../api'
import { useLang } from '../hooks'
import { useToast } from '../providers'
import { ErrorState, TopBar } from '../ui/kit'
import { AssetBadge, assetHref, useStatus } from './market-ui'

const lessonHref = (id: string) => `/leccion/${id}`
const fmtDate = (iso: string, locale: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' })

// ── Datos de empresa de la ficha ─────────────────────────
type FactKey = 'marketCap' | 'pe' | 'dividendYield' | 'eps' | 'beta' | 'ter'
/** Clase de cada dato (src/server/content/v2) */
const FACT_LESSON: Record<FactKey, string> = { marketCap: 'u8l5', pe: 'u17l1', dividendYield: 'u17l4', eps: 'u16l2', beta: 'u29l2', ter: 'u10l3' }
const FACTS_FOR: Record<'STOCK' | 'ETF', FactKey[]> = { STOCK: ['marketCap', 'pe', 'dividendYield', 'eps', 'beta'], ETF: ['ter', 'dividendYield', 'beta'] }

type T = (k: string, v?: Record<string, string>) => string

/** Cifras grandes en palabras («154,2 mil millones €», «4,98 billones $»): «B» o «kM» confunden */
function bigMoney(v: number, currency: string, locale: string, t: T) {
  let sym = currency
  try {
    sym = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find(x => x.type === 'currency')?.value ?? currency
  } catch {
    // moneda rara: se enseña su código
  }
  const [div, unit] = v >= 1e12 ? [1e12, 't'] : v >= 1e9 ? [1e9, 'b'] : v >= 1e6 ? [1e6, 'm'] : [1, 'u']
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: v / div >= 100 ? 0 : v / div >= 10 ? 1 : 2 }).format(v / div)
  return t(`units.${unit}`, { n, cur: sym })
}
function plainMoney(v: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)
  } catch {
    return `${v.toFixed(2)} ${currency}`
  }
}
const dec = (v: number, locale: string, d: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)

/** Valor de cada dato ya formateado, o null si no hay (la fila no se enseña) */
function factValue(k: FactKey, f: FundamentalsT, locale: string, t: T): string | null {
  switch (k) {
    case 'marketCap': {
      if (f.marketCap === null || !f.currency) return null
      const main = bigMoney(f.marketCap, f.currency, locale, t)
      return f.currency !== 'EUR' && f.marketCapEur !== null ? `${main} · ${t('facts.approx', { value: bigMoney(f.marketCapEur, 'EUR', locale, t) })}` : main
    }
    case 'pe':
      // Sin PER porque la empresa perdió dinero: se dice (el BPA negativo es un dato real)
      return f.pe !== null ? dec(f.pe, locale, 1) : f.eps !== null && f.eps < 0 ? t('facts.peLoss') : null
    case 'dividendYield':
      return f.dividendYield !== null ? `${dec(f.dividendYield, locale, 2)} %` : null
    case 'eps':
      return f.eps !== null && f.epsCurrency ? plainMoney(f.eps, f.epsCurrency, locale) : null
    case 'beta':
      return f.beta !== null ? dec(f.beta, locale, 2) : null
    case 'ter':
      return f.ter !== null ? `${dec(f.ter, locale, 2)} %` : null
  }
}

function FactRow({ k, value }: { k: FactKey; value: string }) {
  const t = useTranslations('market2')
  const [open, setOpen] = useState(false)
  const id = `fact-${k}`
  return (
    <div className="flex flex-col" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="flex min-h-11 items-center gap-0.5">
        <span className="t-foot">{t(`facts.label.${k}`)}</span>
        <button type="button" className="-my-1 flex h-11 w-11 flex-none items-center justify-center" aria-expanded={open} aria-controls={id} aria-label={t('facts.what', { label: t(`facts.label.${k}`) })} onClick={() => setOpen(!open)}>
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] font-extrabold" style={open ? { background: 'var(--brand)', color: 'var(--on-brand)' } : { background: 'var(--fill)', color: 'var(--ink-2)' }} aria-hidden="true">
            ?
          </span>
        </button>
        <b className="ml-auto min-w-0 text-right text-[15px] tabular-nums [overflow-wrap:anywhere]">{value}</b>
      </div>
      {open && (
        <p id={id} className="t-foot m-0 pb-3">
          {t(`facts.help.${k}`)}{' '}
          <Link href={lessonHref(FACT_LESSON[k])} className="font-bold" style={{ color: 'var(--brand-ink)' }}>
            {t(`facts.lesson.${k}`)}
          </Link>
        </p>
      )}
    </div>
  )
}

/** «La empresa en cifras»: se carga aparte de la ficha (no la frena) */
export function CompanyFacts({ a }: { a: AssetDetailT }) {
  const t = useTranslations('market2')
  const locale = useLang()
  const kind = a.type === 'STOCK' || a.type === 'ETF' ? a.type : null
  const q = useQuery({ queryKey: ['fundamentals', a.symbol], queryFn: () => api.fundamentals(a.symbol), enabled: !!kind, staleTime: 10 * 60_000, retry: 1 })
  if (!kind) return null
  const f = q.data
  const keys = FACTS_FOR[kind]
  const rows = f ? keys.map(k => ({ k, v: factValue(k, f, locale, t) })) : []
  const shown = rows.filter((r): r is { k: FactKey; v: string } => r.v !== null)
  const missing = rows.filter(r => r.v === null).map(r => t(`facts.label.${r.k}`))
  return (
    <section className="card flex min-w-0 flex-col gap-1" aria-label={t(kind === 'ETF' ? 'facts.titleFund' : 'facts.title')} aria-busy={q.isLoading}>
      <b className="t-head mb-1">{t(kind === 'ETF' ? 'facts.titleFund' : 'facts.title')}</b>
      {q.isLoading ? (
        [0, 1, 2].map(i => <div key={i} className="skel my-1.5 h-8" />)
      ) : !f || !shown.length ? (
        <p className="t-foot m-0">{t('facts.none')}</p>
      ) : (
        <>
          {shown.map(r => (
            <FactRow key={r.k} k={r.k} value={r.v} />
          ))}
          {missing.length > 0 && <span className="t-cap pt-1">{t('facts.missing', { list: missing.join(', ') })}</span>}
        </>
      )}
      <span className="t-cap pt-1">{f?.updatedAt ? t('facts.source', { date: fmtDate(f.updatedAt, locale) }) : t('facts.sourcePlain')}</span>
    </section>
  )
}

// ── Bolsas abiertas ahora ────────────────────────────────
const WINDOWS: { key: 'us' | 'eu' | 'asia' | 'crypto'; code: string }[] = [
  { key: 'us', code: 'US' },
  { key: 'eu', code: 'BME' },
  { key: 'asia', code: 'TSE' },
  { key: 'crypto', code: 'CRYPTO' },
]

/** La hora cambia cada minuto: se calcula en el navegador (en el servidor daría otra y no casaría) */
function useNow(ms = 60_000) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = setInterval(tick, ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

export function MarketWindow() {
  const t = useTranslations('market2')
  const locale = useLang()
  const now = useNow()
  const rows = useMemo(() => {
    if (!now) return null
    const hm = (d: Date) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
    return WINDOWS.map(w => {
      if (w.code === 'CRYPTO') return { key: w.key, open: true, range: t('window.always'), status: t('window.open') }
      const open = isOpen(w.code, now)
      const next = open ? now : nextOpen(w.code, now)
      const s = next && sessionOn(w.code, next)
      const range = s ? `${hm(s.open)}–${hm(s.close)}` : ''
      let status: string
      if (open && s) status = `${t('window.open')} · ${t('window.closesIn', { time: countdown(s.close.toISOString(), now.getTime()) })}`
      else if (next) status = `${t('window.closed')} · ${sameDay(next, now) ? t('window.opensAt', { time: hm(next) }) : t('window.opensOn', { day: next.toLocaleDateString(locale, { weekday: 'long' }), time: hm(next) })}`
      else status = t('window.closed')
      return { key: w.key, open, range, status }
    })
  }, [now, locale, t])
  return (
    <section aria-label={t('window.title')} className="flex min-w-0 flex-col gap-2">
      <span className="t-head px-0.5">{t('window.title')}</span>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {(rows ?? WINDOWS.map(w => ({ key: w.key, open: false, range: '', status: '' }))).map(r => (
          <div key={r.key} className="stat min-w-0 gap-0.5 p-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 flex-none rounded-full" style={{ background: rows ? (r.open ? 'var(--up)' : 'var(--ink-3)') : 'var(--fill)' }} aria-hidden="true" />
              <b className="text-[15px]">{t(`window.${r.key}`)}</b>
            </span>
            {rows ? (
              <>
                <span className="text-[14px] font-bold tabular-nums">{r.range}</span>
                <span className="t-cap">{r.status}</span>
              </>
            ) : (
              <span className="skel h-8" />
            )}
          </div>
        ))}
      </div>
      <span className="t-cap px-0.5">{t('window.note')}</span>
    </section>
  )
}

// ── Ideas para estudiar ──────────────────────────────────
function useFollow() {
  const t = useTranslations('market2')
  const toast = useToast()
  const qc = useQueryClient()
  const watch = useQuery({ queryKey: ['watchlist'], queryFn: api.watchlist })
  const m = useMutation({
    mutationFn: (symbol: string) => api.toggleWatch(symbol),
    onSuccess: (w, symbol) => {
      qc.setQueryData(['watchlist'], w)
      void qc.invalidateQueries({ queryKey: ['assets', 'WATCH'] })
      toast(w.includes(symbol) ? t('ideas.followed') : t('ideas.unfollowed'))
    },
    onError: e => toast(e instanceof ApiFailure ? e.message : t('ideas.followError')),
  })
  return { watching: (s: string) => !!watch.data?.includes(s), toggle: m.mutate, busy: m.isPending ? m.variables : null }
}

/** Dato del criterio de cada lista, ya en frase corta */
function useMetric() {
  const t = useTranslations('market2')
  const locale = useLang()
  return (id: IdeaListIdT, it: IdeaItemT): string | null => {
    const v = it.value
    if (id === 'drops' && v !== null) return t('ideas.metric.drops', { v: `${dec(Math.abs(v), locale, 2)} %` })
    if (id === 'dividend' && v !== null) return t('ideas.metric.dividend', { v: `${dec(v, locale, 2)} %` })
    if (id === 'lowPe' && v !== null) return it.ref !== null ? t('ideas.metric.lowPe', { v: dec(v, locale, 1), ref: dec(it.ref, locale, 1) }) : t('ideas.metric.pe', { v: dec(v, locale, 1) })
    if (id === 'ibex' && v !== null) return t('ideas.metric.cap', { v: bigMoney(v, 'EUR', locale, t) })
    return null
  }
}

function IdeaRow({ id, it, follow }: { id: IdeaListIdT; it: IdeaItemT; follow: ReturnType<typeof useFollow> }) {
  const t = useTranslations('market2')
  const status = useStatus()
  const metric = useMetric()(id, it)
  const a = it.asset
  const on = follow.watching(a.symbol)
  return (
    <div className="li py-2.5 pr-2">
      <Link href={assetHref(a.symbol)} className="flex min-w-0 flex-1 items-center gap-3" style={{ color: 'inherit', textDecoration: 'none' }}>
        <AssetBadge a={a} />
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] leading-5 [overflow-wrap:anywhere]">{a.name}</b>
          <span className="t-cap block">
            {a.ticker} · {metric ?? status(a)}
          </span>
        </span>
      </Link>
      <button
        type="button"
        className="chip min-h-11 flex-none px-3"
        style={on ? { background: 'var(--fill)', color: 'var(--ink)' } : { background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))', color: 'var(--brand-ink)' }}
        aria-pressed={on}
        aria-label={t(on ? 'ideas.unfollowAria' : 'ideas.followAria', { name: a.name })}
        disabled={follow.busy === a.symbol}
        onClick={() => follow.toggle(a.symbol)}
      >
        {on ? `★ ${t('ideas.following')}` : `☆ ${t('ideas.follow')}`}
      </button>
    </div>
  )
}

function IdeaSection({ l, follow }: { l: IdeaListT; follow: ReturnType<typeof useFollow> }) {
  const t = useTranslations('market2')
  const locale = useLang()
  const warn = l.id === 'drops' || l.id === 'dividend'
  return (
    <section id={l.id} aria-labelledby={`${l.id}-h`} className="flex min-w-0 scroll-mt-14 flex-col gap-2">
      <div className="flex flex-col gap-1 px-0.5">
        <h2 id={`${l.id}-h`} className="t-head m-0">
          {t(`ideas.lists.${l.id}.title`)}
        </h2>
        <p className="t-foot m-0">{t(`ideas.lists.${l.id}.criterion`)}</p>
        {l.asOf && <span className="t-cap">{t('ideas.asOf', { date: fmtDate(l.asOf, locale) })}</span>}
      </div>
      {warn && <div className="banner">{t(`ideas.lists.${l.id}.warning`)}</div>}
      <div className="list">{l.items.length ? l.items.map(it => <IdeaRow key={it.asset.symbol} id={l.id} it={it} follow={follow} />) : <div className="li plainline t-foot">{t('ideas.empty')}</div>}</div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 px-0.5">
        <Link href={lessonHref(l.lessonId)} className="link inline-flex min-h-11 items-center px-0">
          {t('ideas.learn')}
        </Link>
      </div>
      <p className="t-cap m-0 px-0.5">{t('ideas.notAdvice')}</p>
    </section>
  )
}

/** Página /mercado/ideas */
export function Ideas() {
  const t = useTranslations('market2')
  const q = useQuery({ queryKey: ['ideas'], queryFn: api.ideas, staleTime: 2 * 60_000, refetchInterval: 60_000 })
  const follow = useFollow()
  return (
    <>
      <TopBar back="/mercado" title={t('ideas.title')} />
      <div className="pad wide">
        <p className="t-body m-0 px-0.5">{t('ideas.intro')}</p>
        <div className="banner banner-info">{t('ideas.notAdvice')}</div>
        <nav aria-label={t('ideas.jump')} className="pills">
          {(['drops', 'dividend', 'lowPe', 'ibex', 'etf'] as const).map(id => (
            <a key={id} href={`#${id}`} className="chip min-h-11 flex-none px-3.5" style={{ background: 'var(--surface)' }}>
              {t(`ideas.lists.${id}.short`)}
            </a>
          ))}
        </nav>
        {q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : !q.data ? (
          [0, 1].map(i => <div key={i} className="skel h-64" />)
        ) : (
          q.data.lists.map(l => <IdeaSection key={l.id} l={l} follow={follow} />)
        )}
      </div>
    </>
  )
}

/** Sección de la portada del Mercado: una tarjeta por lista, con sus tres primeros activos */
export function IdeasTeaser() {
  const t = useTranslations('market2')
  const q = useQuery({ queryKey: ['ideas'], queryFn: api.ideas, staleTime: 2 * 60_000 })
  if (q.isError) return null
  return (
    <section aria-labelledby="ideas-h" className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 id="ideas-h" className="t-head m-0">
          {t('ideas.title')}
        </h2>
        <Link href="/mercado/ideas" className="link inline-flex min-h-11 items-center text-[14px]">
          {t('ideas.seeAll')}
        </Link>
      </div>
      <p className="t-cap m-0 px-0.5">{t('ideas.teaser')}</p>
      <div className="pills pb-1">
        {!q.data
          ? [0, 1, 2].map(i => <div key={i} className="skel h-[124px] w-[220px] flex-none rounded-2xl" />)
          : q.data.lists.map(l => (
              <Link key={l.id} href={`/mercado/ideas#${l.id}`} className="card flex w-[220px] flex-none flex-col gap-1.5 p-3.5" style={{ color: 'var(--ink)' }}>
                <b className="text-[15px] leading-5">{t(`ideas.lists.${l.id}.title`)}</b>
                <span className="t-cap">{t(`ideas.lists.${l.id}.short2`)}</span>
                <span className="mt-auto flex flex-wrap gap-1">
                  {l.items.length ? (
                    l.items.slice(0, 3).map(it => (
                      <span key={it.asset.symbol} className="chip max-w-[150px]" style={{ background: 'var(--fill)' }}>
                        <span className="truncate">{shortName(it.asset.name)}</span>
                      </span>
                    ))
                  ) : (
                    <span className="t-cap">{t('ideas.emptyShort')}</span>
                  )}
                </span>
              </Link>
            ))}
      </div>
      <p className="t-cap m-0 px-0.5">{t('ideas.notAdvice')}</p>
    </section>
  )
}

/** Nombre corto para una pastilla: sin «Inc.», «S.A.», «plc»… */
function shortName(name: string) {
  return name.replace(/[,.]?\s+(Inc|Corp|Corporation|Co|Ltd|plc|PLC|S\.?A\.?|SE|AG|N\.?V\.?|Holdings?|Group|Company)\.?$/i, '').trim() || name
}
