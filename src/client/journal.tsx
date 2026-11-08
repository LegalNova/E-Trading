'use client'
// Diario de operaciones: el motivo al comprar o vender (en la hoja de la orden), el enlace desde Cartera
// y la página del diario (revisar si se cumplió, la lección de Lumi según el motivo y el resumen por motivo).
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { AssetTypeT, JournalEntryT, JournalVerdictT, OrderResultT, OrderSideT } from '@/shared/contract'
import { arrowPct } from '@/shared/format'
import { api, ApiFailure } from './api'
import { useLang, useMe } from './hooks'
import { useMissions } from './missions'
import { useToast } from './providers'
import { fmtAssetPrice } from './screens/market-ui'
import { Icon } from './ui/icons'
import { ErrorState, PageSkeleton, TopBar } from './ui/kit'
import { LumiSays, stageOf } from './ui/lumi'

export const BUY_TAGS = ['QUALITY', 'CHEAP', 'DIVERSIFY', 'LONG_TERM', 'NEWS', 'SOCIAL', 'HUNCH', 'OTHER'] as const
export const SELL_TAGS = ['TARGET', 'CHANGED', 'REBALANCE', 'NEED_CASH', 'FEAR', 'NEWS', 'SOCIAL', 'HUNCH', 'OTHER'] as const

// ── Motivo en la hoja de la orden ────────────────────────
// La orden la pone la hoja (no este componente): el motivo elegido se guarda aquí y, cuando la orden sale bien
// (ejecutada o pendiente), se apunta en el diario con su id. Se escucha en la caché de TanStack Query, así que da
// igual que la hoja se cierre justo al terminar.
let draft: { symbol: string; side: OrderSideT; tag: string; reason: string; at: number } | null = null
let say: ((msg: string) => void) | null = null
const hooked = new WeakSet<QueryClient>()

function listen(qc: QueryClient) {
  if (hooked.has(qc)) return
  hooked.add(qc)
  qc.getMutationCache().subscribe(ev => {
    if (ev.type !== 'updated' || ev.action.type !== 'success') return
    const o = (ev.action.data as OrderResultT | undefined)?.order
    const d = draft
    if (!o?.id || !d || o.symbol !== d.symbol || o.side !== d.side || Date.now() - d.at > 30 * 60_000) return
    if (o.status !== 'FILLED' && o.status !== 'PENDING') return
    draft = null
    api
      .createJournal({ orderId: o.id, tag: d.tag, reason: d.reason.trim() || undefined })
      .then(() => {
        qc.invalidateQueries({ queryKey: ['journal'] })
        qc.invalidateQueries({ queryKey: ['missions'] })
        say?.('saved')
      })
      .catch(() => say?.('error'))
  })
}

/** «¿Por qué compras?» / «¿Por qué vendes?»: opcional, con chips y una línea de texto */
export function OrderReason({ symbol, side }: { symbol: string; side: OrderSideT }) {
  const t = useTranslations('journal')
  const qc = useQueryClient()
  const toast = useToast()
  const [tag, setTag] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  useEffect(() => {
    listen(qc)
    draft = null // hoja nueva: sin el motivo de una orden anterior
  }, [qc])
  useEffect(() => {
    say = k => toast(k === 'saved' ? t('savedToast') : t('saveError'))
  }, [toast, t])
  useEffect(() => {
    draft = tag ? { symbol, side, tag, reason, at: Date.now() } : null
  }, [tag, reason, symbol, side])
  const tags = side === 'BUY' ? BUY_TAGS : SELL_TAGS
  const group = side === 'BUY' ? 'buy' : 'sell'
  return (
    <div className="card flex flex-col gap-2.5 px-4 py-3">
      <span className="flex items-baseline justify-between gap-2">
        <b className="t-foot" style={{ color: 'var(--ink)' }} id={`why-${group}`}>
          {side === 'BUY' ? t('whyBuy') : t('whySell')}
        </b>
        <span className="t-cap">{t('optional')}</span>
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`why-${group}`}>
        {tags.map(k => {
          const on = tag === k
          return (
            <button key={k} type="button" className="chip min-h-11 px-3.5 text-[14px]" aria-pressed={on} style={on ? { background: 'var(--brand)', color: 'var(--on-brand)' } : { background: 'var(--fill)' }} onClick={() => setTag(on ? null : k)}>
              {t(`tags.${group}.${k}`)}
            </button>
          )
        })}
      </div>
      {tag && (
        <input className="input" maxLength={140} value={reason} onChange={e => setReason(e.target.value)} placeholder={t('reasonPlaceholder')} aria-label={t('reasonLabel')} />
      )}
      <span className="t-cap">{tag ? t('willRemind') : t('whyHint')}</span>
    </div>
  )
}

// ── Desde Cartera ────────────────────────────────────────
/** Enlace al diario (con las entradas que toca revisar). Abrir Cartera también cumple la misión «abre tu Cartera». */
export function JournalLink() {
  const t = useTranslations('journal')
  const qc = useQueryClient()
  const { data: j } = useQuery({ queryKey: ['journal'], queryFn: api.journal, staleTime: 60_000 })
  const { data: ms } = useMissions()
  const sent = useRef(false)
  const wants = !!ms?.pending.some(m => m.kind === 'OPEN_PORTFOLIO')
  useEffect(() => {
    if (!wants || sent.current) return
    sent.current = true
    api.missionSeen({ portfolio: true }).then(d => qc.setQueryData(['missions'], d)).catch(() => {})
  }, [wants, qc])
  return (
    <Link href="/mercado/diario" className="card flex min-h-11 items-center gap-3" style={{ color: 'var(--ink)' }}>
      <span className="ava flex-none rounded-full" style={{ background: 'var(--fill)' }} aria-hidden>
        <Icon name="learn" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block">{t('title')}</b>
        <span className="t-cap">{j?.due ? t('dueCount', { n: j.due }) : j?.entries.length ? t('entriesCount', { n: j.entries.length }) : t('linkHint')}</span>
      </span>
      {!!j?.due && (
        <span className="chip flex-none" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
          {j.due}
        </span>
      )}
      <Icon name="chev" size={18} />
    </Link>
  )
}

// ── Página del diario ────────────────────────────────────
const VERDICTS: JournalVerdictT[] = ['MET', 'NOT_MET', 'TOO_EARLY']

function Review({ e, onDone }: { e: JournalEntryT; onDone: () => void }) {
  const t = useTranslations('journal')
  const toast = useToast()
  const qc = useQueryClient()
  const [v, setV] = useState<JournalVerdictT | null>(null)
  const [note, setNote] = useState(e.note ?? '')
  const m = useMutation({
    mutationFn: () => api.reviewJournal(e.id, v!, note.trim() || undefined),
    onSuccess: () => (qc.invalidateQueries({ queryKey: ['journal'] }), toast(t(`reviewed.${v}`)), onDone()),
    onError: err => toast(err instanceof ApiFailure ? err.message : t('saveError')),
  })
  return (
    <div className="flex flex-col gap-2">
      <span className="t-foot font-bold" style={{ color: 'var(--ink)' }} id={`rv-${e.id}`}>
        {t('reviewQuestion')}
      </span>
      <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby={`rv-${e.id}`}>
        {VERDICTS.map(k => (
          <button key={k} type="button" className="opt min-h-11 justify-center px-1.5 py-2 text-center text-[14px]" aria-pressed={v === k} onClick={() => setV(k)}>
            {t(`verdict.${k}`)}
          </button>
        ))}
      </div>
      {v && (
        <>
          <input className="input" maxLength={280} value={note} onChange={x => setNote(x.target.value)} placeholder={t('notePlaceholder')} aria-label={t('noteLabel')} />
          <button className="btn btn-primary" disabled={m.isPending} onClick={() => m.mutate()}>
            {t('saveReview')}
          </button>
        </>
      )}
    </div>
  )
}

function EntryCard({ e, focus }: { e: JournalEntryT; focus: boolean }) {
  const t = useTranslations('journal')
  const locale = useLang()
  const { data: me } = useMe()
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (focus) ref.current?.scrollIntoView({ block: 'center' })
  }, [focus])
  const group = e.side === 'BUY' ? 'buy' : 'sell'
  const type = e.type as AssetTypeT
  const at = Number(e.priceAt)
  const chg = e.priceNow !== null && at > 0 ? (e.priceNow / at - 1) * 100 : null
  const price = (v: number) => fmtAssetPrice({ price: String(v), currency: e.currency, type }, locale)
  const date = new Date(e.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  const remind = new Date(e.remindAt).toLocaleDateString(locale, { day: 'numeric', month: 'long' })
  return (
    <div ref={ref} className="card flex flex-col gap-2.5" style={e.due || focus ? { boxShadow: 'inset 0 0 0 2px var(--brand)' } : undefined}>
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 flex-1">
          <Link href={`/mercado/${encodeURIComponent(e.symbol)}`} className="block truncate font-bold" style={{ color: 'var(--ink)' }}>
            {e.name}
          </Link>
          <span className="t-cap">
            {e.side === 'BUY' ? t('bought') : t('sold')} · {date}
          </span>
        </span>
        <span className="chip flex-none text-[12px]" style={{ background: 'var(--fill)' }}>
          {t(`tags.${group}.${e.tag}`)}
        </span>
      </div>
      {e.reason && <p className="t-body m-0">«{e.reason}»</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="stat">
          <span className="t-cap">{t('priceThen')}</span>
          <b className="tabular-nums">{price(at)}</b>
        </div>
        <div className="stat">
          <span className="t-cap">{t('priceNow')}</span>
          {e.priceNow !== null ? (
            <b className="tabular-nums">
              {price(e.priceNow)} <span className={`text-[13px] ${chg! >= 0 ? 'up' : 'down'}`}>{arrowPct(chg!, locale)}</span>
            </b>
          ) : (
            <b className="t-foot">{t('noPrice')}</b>
          )}
        </div>
      </div>
      <LumiSays mood="THINKING" size={32} message={t(`lessons.${group}.${e.tag}`)} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} />
      {e.reviewedAt && e.verdict && !editing ? (
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1">
            <b className={e.verdict === 'MET' ? 'up' : e.verdict === 'NOT_MET' ? 'down' : undefined}>{t(`verdict.${e.verdict}`)}</b>
            {e.note && <span className="t-foot block">{e.note}</span>}
          </span>
          <button className="btn btn-plain btn-sm min-h-11" onClick={() => setEditing(true)}>
            {t('change')}
          </button>
        </div>
      ) : (
        <>
          {!e.due && !editing && <span className="t-cap">{e.verdict === 'TOO_EARLY' ? t('tooEarlyAgain', { date: remind }) : t('remindOn', { date: remind })}</span>}
          <Review e={e} onDone={() => setEditing(false)} />
        </>
      )}
    </div>
  )
}

export function Journal() {
  const t = useTranslations('journal')
  const sp = useSearchParams()
  const focus = sp.get('entrada')
  const [tab, setTab] = useState<'due' | 'all'>('all')
  const { data: j, isError, refetch } = useQuery({ queryKey: ['journal'], queryFn: api.journal })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!j) return <PageSkeleton />
  const list = tab === 'due' ? j.entries.filter(e => e.due) : j.entries
  return (
    <>
      <TopBar back="/mercado/cartera" title={t('title')} />
      <div className="pad">
        <p className="t-foot m-0 px-0.5">{t('intro')}</p>
        {j.summary.length > 0 && (
          <div className="card flex flex-col gap-2">
            <b className="t-head">{t('summaryTitle')}</b>
            {j.summary.map(s => (
              <span key={`${s.side}${s.tag}`} className="t-body">
                {t(s.side === 'BUY' ? 'summaryBuy' : 'summarySell', { why: t(`why.${s.side === 'BUY' ? 'buy' : 'sell'}.${s.tag}`), met: s.met, n: s.decided })}
              </span>
            ))}
            <span className="t-cap">{t('summaryNote')}</span>
          </div>
        )}
        {j.due > 0 && (
          <div className="seg" role="group" aria-label={t('filter')}>
            <button aria-pressed={tab === 'all'} onClick={() => setTab('all')}>
              {t('all')}
            </button>
            <button aria-pressed={tab === 'due'} onClick={() => setTab('due')}>
              {t('dueTab', { n: j.due })}
            </button>
          </div>
        )}
        {list.length ? (
          list.map(e => <EntryCard key={e.id} e={e} focus={focus === e.id} />)
        ) : (
          <div className="card flex flex-col gap-2.5">
            <b className="t-head">{t('emptyTitle')}</b>
            <span className="t-foot">{t('emptyBody')}</span>
            <Link href="/mercado" className="btn btn-primary">
              {t('goMarket')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
