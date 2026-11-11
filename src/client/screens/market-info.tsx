'use client'
// Ficha de un activo: el precio con su hora y el horario de su mercado, «Lo esencial» y «Más datos» (plegado),
// cada dato con un «¿Qué significa?» de una frase en lenguaje llano. Solo datos reales (Yahoo Finance):
// si no hay dato, la fila no sale. Nunca hay recomendaciones de compra o venta.
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { AssetDetailT, FundamentalsT } from '@/shared/contract'
import { tzOffset } from '@/shared/session-times'
import { pct, toNum } from '@/shared/format'
import { api } from '../api'
import { useLang } from '../hooks'
import { currencySymbol, fmtAssetPrice } from './market-ui'
import { bigMoney } from './market-extra'

const MADRID = 'Europe/Madrid'
const lessonHref = (id: string) => `/leccion/${id}`

/** Clase de cada dato que la tiene (src/server/content/v2) */
const LESSON: Partial<Record<InfoKey, string>> = { marketCap: 'u8l5', pe: 'u17l1', dividendYield: 'u17l4', eps: 'u16l2', beta: 'u29l2', ter: 'u10l3' }

type InfoKey =
  | 'change' | 'dayRange' | 'range52' | 'volume' | 'avgVolume' | 'prevClose' | 'marketCap' | 'pe' | 'dividendYield' | 'eps' | 'beta' | 'ter'
  | 'totalAssets' | 'family' | 'category' | 'inception' | 'circulating' | 'allTimeHigh' | 'sector' | 'industry' | 'employees'
  | 'country' | 'exchange' | 'currency' | 'delay' | 'indices' | 'contract'

// ── Fechas y horas (siempre en hora de Madrid) ───────────
const hm = (d: Date, locale: string) => d.toLocaleTimeString(locale, { timeZone: MADRID, hour: '2-digit', minute: '2-digit' })
const madridDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: MADRID })

/** Una hora de Nueva York de hoy, en hora de Madrid (la pausa diaria de los futuros es a las 17:00 de allí) */
function nyToday(h: number, locale: string) {
  const now = new Date()
  const [y, m, d] = now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }).split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d, h)
  return hm(new Date(guess - tzOffset(new Date(guess), 'America/New_York')), locale)
}

/** Debajo del precio: de cuándo es, si el mercado está abierto y su horario */
export function PriceStatus({ a }: { a: AssetDetailT }) {
  const t = useTranslations('market2.info.status')
  const locale = useLang()
  const at = new Date(a.asOf)
  const now = new Date()
  const time = madridDay(at) === madridDay(now) ? t('at', { time: at.toLocaleTimeString(locale, { timeZone: MADRID, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }) : t('atDay', { date: at.toLocaleString(locale, { timeZone: MADRID, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) })
  const first = [time, t('madrid'), ...(a.delayedMinutes ? [t('delayed', { n: a.delayedMinutes })] : [])].join(' · ')

  let state: string
  if (a.hoursKind === 'always') state = t('always')
  else if (a.isOpen) {
    // Cierre exacto del tramo en curso (en Asia, el de mediodía es una pausa: «cierra a las 4:30» y vuelve a abrir)
    const part = a.sessionParts?.find(p => new Date(p.open) <= now && now < new Date(p.close)) ?? a.sessionParts?.at(-1)
    state = part && new Date(part.close) > now ? `${t('open')} · ${t('closesAt', { time: hm(new Date(part.close), locale) })}` : t('open')
  } else if (a.opensAt) {
    const o = new Date(a.opensAt)
    state = `${t('closed')} · ${madridDay(o) === madridDay(now) ? t('opensAt', { time: hm(o, locale) }) : t('opensOn', { day: o.toLocaleDateString(locale, { timeZone: MADRID, weekday: 'long' }), time: hm(o, locale) })}`
  } else state = t('closed')

  let hours: string | null = null
  if (a.hoursKind === 'fx') hours = t('hoursFx')
  else if (a.hoursKind === 'futures') hours = t('hoursFutures', { range: `${nyToday(17, locale)}–${nyToday(18, locale)}` })
  else if (a.sessionParts?.length) hours = t('hours', { range: a.sessionParts.map(p => `${hm(new Date(p.open), locale)}–${hm(new Date(p.close), locale)}`).join(t('and')) })

  return (
    <div className="t-foot -mt-1 flex flex-col gap-0.5">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 flex-none rounded-full" style={{ background: a.isOpen ? 'var(--up)' : 'var(--ink-3)' }} aria-hidden="true" />
        <b style={{ color: 'var(--ink)' }}>{state}</b>
      </span>
      <span>
        {first} · {t('auto')}
      </span>
      {hours && <span>{hours}</span>}
    </div>
  )
}

// ── Una fila de dato con su «?» ──────────────────────────
function InfoRow({ k, label, value, help, children }: { k: InfoKey; label: string; value?: React.ReactNode; help: string; children?: React.ReactNode }) {
  const t = useTranslations('market2.info')
  const [open, setOpen] = useState(false)
  const id = `info-${k}`
  return (
    <div className="flex flex-col" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="flex min-h-11 items-center gap-0.5">
        <span className="t-foot min-w-0">{label}</span>
        <button type="button" className="-my-1 flex h-11 w-11 flex-none items-center justify-center" aria-expanded={open} aria-controls={id} aria-label={t('what', { label })} onClick={() => setOpen(!open)}>
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] font-extrabold" style={open ? { background: 'var(--brand)', color: 'var(--on-brand)' } : { background: 'var(--fill)', color: 'var(--ink-2)' }} aria-hidden="true">
            ?
          </span>
        </button>
        {value !== undefined && <b className="ml-auto min-w-0 text-right text-[15px] tabular-nums [overflow-wrap:anywhere]">{value}</b>}
      </div>
      {children && <div className="pb-2.5">{children}</div>}
      {open && (
        <p id={id} className="t-foot m-0 pb-3">
          {help}
          {LESSON[k] && (
            <>
              {' '}
              <Link href={lessonHref(LESSON[k])} className="font-bold" style={{ color: 'var(--brand-ink)' }}>
                {t(`lesson.${k}`)}
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  )
}

/** Barra mínimo–máximo con el punto en el precio de ahora */
function RangeBar({ low, high, value, fmt, label }: { low: number; high: number; value: number; fmt: (v: number) => string; label: string }) {
  const p = high > low ? Math.min(1, Math.max(0, (value - low) / (high - low))) : 0.5
  return (
    <div className="flex flex-col gap-1">
      <div className="relative mx-1.5 h-1.5 rounded-full" style={{ background: 'var(--fill)' }} role="img" aria-label={`${label}: ${fmt(low)} – ${fmt(high)}`}>
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${p * 100}%`, background: 'var(--ink)' }} />
      </div>
      <div className="t-cap flex justify-between gap-2 tabular-nums">
        <span>{fmt(low)}</span>
        <span>{fmt(high)}</span>
      </div>
    </div>
  )
}

const dec = (v: number, locale: string, d: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
const compact = (v: number, locale: string) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 2 }).format(v)
function plainMoney(v: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)
  } catch {
    return `${v.toFixed(2)} ${currency}`
  }
}

interface Row { k: InfoKey; label: string; value?: React.ReactNode; help: string; extra?: React.ReactNode }

/** Filas de la ficha según el tipo de activo: [lo esencial, más datos]. Lo que no tiene dato no entra. */
function useRows(a: AssetDetailT, f: FundamentalsT | undefined): [Row[], Row[]] {
  const t = useTranslations('market2.info')
  const tm = useTranslations('market2')
  const tOld = useTranslations('market')
  const locale = useLang()
  const price = toNum(a.price)
  const fmt = (v: number) => fmtAssetPrice({ ...a, price: String(v) }, locale)
  const type = a.type
  const pr = f?.profile ?? null
  const L = (k: InfoKey, variant?: string) => t(`label.${variant ? `${k}_${variant}` : k}`)
  const H = (k: InfoKey, variant?: string, v?: Record<string, string>) => t(`help.${variant ? `${k}_${variant}` : k}`, v)
  const ess: Row[] = []
  const more: Row[] = []
  const add = (list: Row[], r: Row | null | false) => r && list.push(r)

  // Variación del día (frente al cierre anterior; en las cripto, frente a las 00:00 UTC)
  const ch = toNum(a.change)
  const sign = ch > 0 ? '+' : ch < 0 ? '−' : ''
  const absCh = type === 'INDEX' || type === 'FX' ? dec(Math.abs(ch), locale, type === 'FX' ? 4 : 2) : fmt(Math.abs(ch))
  add(ess, {
    k: 'change',
    label: L('change', type === 'CRYPTO' ? 'crypto' : undefined),
    value: <span className={ch >= 0 ? 'up' : 'down'}>{`${sign}${absCh}${type === 'INDEX' ? ` ${tOld('points')}` : ''} (${sign}${pct(a.changePct, locale)})`}</span>,
    help: H('change', type === 'CRYPTO' ? 'crypto' : undefined),
  })
  if (a.dayLow !== null && a.dayHigh !== null) add(ess, { k: 'dayRange', label: L('dayRange'), help: H('dayRange'), extra: <RangeBar label={L('dayRange')} low={a.dayLow} high={a.dayHigh} value={price} fmt={fmt} /> })
  if (a.low52 !== null && a.high52 !== null) add(ess, { k: 'range52', label: L('range52'), help: H('range52'), extra: <RangeBar label={L('range52')} low={a.low52} high={a.high52} value={price} fmt={fmt} /> })

  // Volumen: las divisas no tienen (Yahoo da 0); en cripto es dinero negociado en 24 h; en materias primas, contratos
  const volVariant = type === 'CRYPTO' ? 'crypto' : type === 'COMMODITY' ? 'commodity' : type === 'INDEX' ? 'index' : type === 'ETF' ? 'etf' : undefined
  if (a.volume !== null && a.volume > 0 && type !== 'FX')
    add(type === 'INDEX' ? more : ess, { k: 'volume', label: L('volume', volVariant), value: type === 'CRYPTO' ? bigMoney(a.volume, a.currency, locale, tm) : compact(a.volume, locale), help: H('volume', volVariant) })

  // Datos de empresa, fondo o cripto (aparte, una vez al día)
  if (f) {
    const cur = f.currency ?? a.currency
    if (f.marketCap !== null) {
      const main = bigMoney(f.marketCap, cur, locale, tm)
      add(ess, { k: 'marketCap', label: L('marketCap'), value: cur !== 'EUR' && f.marketCapEur !== null ? `${main} · ${tm('facts.approx', { value: bigMoney(f.marketCapEur, 'EUR', locale, tm) })}` : main, help: H('marketCap', type === 'CRYPTO' ? 'crypto' : undefined) })
    }
    if (type === 'STOCK') {
      const pe = f.pe !== null ? dec(f.pe, locale, 1) : f.eps !== null && f.eps < 0 ? tm('facts.peLoss') : null
      if (pe) add(ess, { k: 'pe', label: L('pe'), value: pe, help: H('pe') })
    }
    if (f.ter !== null) add(ess, { k: 'ter', label: L('ter'), value: `${dec(f.ter, locale, 2)} %`, help: H('ter') })
    if (f.dividendYield !== null) add(ess, { k: 'dividendYield', label: L('dividendYield'), value: `${dec(f.dividendYield, locale, 2)} %`, help: H('dividendYield', type === 'ETF' ? 'etf' : undefined) })
    if (pr?.totalAssets) add(ess, { k: 'totalAssets', label: L('totalAssets'), value: bigMoney(pr.totalAssets, cur, locale, tm), help: H('totalAssets') })
    if (pr?.circulating) add(ess, { k: 'circulating', label: L('circulating'), value: `${compact(pr.circulating, locale)} ${a.ticker}`, help: H('circulating') })
    if (pr?.allTimeHigh) add(more, { k: 'allTimeHigh', label: L('allTimeHigh'), value: plainMoney(pr.allTimeHigh, cur, locale), help: H('allTimeHigh') })
    if (pr?.avgVolume && type !== 'FX' && type !== 'CRYPTO') add(more, { k: 'avgVolume', label: L('avgVolume'), value: compact(pr.avgVolume, locale), help: H('avgVolume') })
    if (f.beta !== null) add(more, { k: 'beta', label: L('beta'), value: dec(f.beta, locale, 2), help: H('beta') })
    if (f.eps !== null && f.epsCurrency) add(more, { k: 'eps', label: L('eps'), value: plainMoney(f.eps, f.epsCurrency, locale), help: H('eps') })
    if (pr?.family) add(more, { k: 'family', label: L('family'), value: pr.family, help: H('family') })
    if (pr?.category) add(more, { k: 'category', label: L('category'), value: <span lang="en">{pr.category}</span>, help: H('category') })
    if (pr?.inception) add(more, { k: 'inception', label: L('inception'), value: new Date(`${pr.inception}T12:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }), help: H('inception') })
  }

  add(more, { k: 'prevClose', label: L('prevClose', type === 'CRYPTO' ? 'crypto' : undefined), value: fmt(a.prevClose), help: H('prevClose', type === 'CRYPTO' ? 'crypto' : undefined) })
  if (type === 'STOCK' && a.sector) add(more, { k: 'sector', label: L('sector'), value: a.sector, help: H('sector') })
  if (type === 'STOCK' && pr?.industry) {
    const key = pr.industryKey ? `industries.${pr.industryKey}` : ''
    const translated = key && t.has(key) ? t(key) : null
    add(more, { k: 'industry', label: L('industry'), value: translated ?? <span lang="en">{pr.industry}</span>, help: H('industry') })
  }
  if (pr?.employees) add(more, { k: 'employees', label: L('employees'), value: new Intl.NumberFormat(locale).format(pr.employees), help: H('employees') })
  if (type === 'COMMODITY') add(more, { k: 'contract', label: L('contract'), value: a.exchangeName, help: H('contract') })
  if (a.country && type !== 'CRYPTO' && type !== 'FX' && type !== 'COMMODITY') add(more, { k: 'country', label: L('country', type === 'STOCK' ? undefined : 'listing'), value: a.country, help: H('country', type === 'STOCK' ? undefined : 'listing') })
  if (type !== 'CRYPTO' && type !== 'FX' && type !== 'COMMODITY') add(more, { k: 'exchange', label: L('exchange'), value: a.exchangeName, help: H('exchange') })
  add(more, {
    k: 'currency',
    label: L('currency'),
    value: type === 'INDEX' ? tOld('points') : type === 'FX' ? `${a.symbol.slice(3, 6)} ${t('perOne', { base: a.symbol.slice(0, 3) })}` : `${a.currency} (${currencySymbol(a.currency, locale)})`,
    help: H('currency', type === 'INDEX' ? 'index' : type === 'FX' ? 'fx' : undefined),
  })
  add(more, { k: 'delay', label: L('delay'), value: a.delayedMinutes ? tOld('delayed', { n: a.delayedMinutes }) : tOld('realtime'), help: H('delay') })
  return [ess, more]
}

/** «Lo esencial» a la vista y «Más datos» plegado */
export function AssetFacts({ a }: { a: AssetDetailT }) {
  const t = useTranslations('market2.info')
  const locale = useLang()
  const withData = a.type === 'STOCK' || a.type === 'ETF' || a.type === 'CRYPTO'
  const q = useFundamentals(a, withData)
  const [ess, more] = useRows(a, q.data)
  const [open, setOpen] = useState(false)
  const row = (r: Row) => (
    <InfoRow key={r.k} k={r.k} label={r.label} value={r.value} help={r.help}>
      {r.extra}
    </InfoRow>
  )
  return (
    <section className="card flex min-w-0 flex-col gap-1" aria-labelledby="facts-h" aria-busy={withData && q.isLoading}>
      <h2 id="facts-h" className="t-head m-0 mb-1">
        {t('essentials')}
      </h2>
      {ess.map(row)}
      {withData && q.isLoading && [0, 1].map(i => <div key={i} className="skel my-1.5 h-8" />)}
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <button type="button" className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-[15px] font-bold" aria-expanded={open} aria-controls="facts-more" onClick={() => setOpen(!open)}>
          {open ? t('less') : t('more', { n: String(more.length) })}
          <span aria-hidden="true" className="t-foot" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}>
            ▾
          </span>
        </button>
      </div>
      {open && (
        <div id="facts-more" className="flex flex-col">
          {more.map(row)}
          {a.indices.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 py-2.5" style={{ borderTop: '1px solid var(--line)' }}>
              <span className="t-foot">{t('indices')}</span>
              {a.indices.map(ix => (
                <Link key={ix} href={`/mercado/explorar?index=${encodeURIComponent(ix)}`} className="chip pointer-coarse:min-h-11" style={{ background: 'var(--fill)' }}>
                  {ix}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      <span className="t-cap pt-1">
        {q.data?.updatedAt && withData ? t('sourceDate', { date: new Date(q.data.updatedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) }) : t('source')} · {t('notAdvice')}
      </span>
    </section>
  )
}

function useFundamentals(a: AssetDetailT, enabled: boolean) {
  return useQuery({ queryKey: ['fundamentals', a.symbol], queryFn: () => api.fundamentals(a.symbol), enabled, staleTime: 10 * 60_000, retry: 1 })
}

/** «Qué es»: el texto de la app y, si Yahoo la da, la descripción de la empresa (en inglés; en la app en inglés, directa) */
export function AboutAsset({ a }: { a: AssetDetailT }) {
  const t = useTranslations('market2.info')
  const tOld = useTranslations('market')
  const locale = useLang()
  const withData = a.type === 'STOCK' || a.type === 'ETF' || a.type === 'CRYPTO'
  const q = useFundamentals(a, withData)
  const summary = q.data?.profile?.summary ?? null
  return (
    <section className="card flex flex-col gap-2" aria-labelledby="about-h">
      <h2 id="about-h" className="t-head m-0">
        {tOld('about')}
      </h2>
      {locale === 'en' && summary ? (
        <p className="t-foot m-0">{summary}</p>
      ) : (
        <>
          <p className="t-foot m-0">{a.description}</p>
          {summary && (
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-[14px] font-bold [&::-webkit-details-marker]:hidden">
                {t('yahooSummary')}
                <span aria-hidden="true" className="t-foot transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="t-foot m-0" lang="en">
                {summary}
              </p>
            </details>
          )}
        </>
      )}
    </section>
  )
}
