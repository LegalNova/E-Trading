'use client'
// Proyecto final «Tu primera tesis de inversión»: tarjeta en Clases, lista «Mis tesis» y la guía paso a paso
// sobre una empresa real, con los datos de su ficha. Educativo: enseña a analizar, nunca dice qué comprar.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { checkStep, HORIZONS, MAX_WEIGHT, MOATS, riskAtStop, THESIS_STEPS, VALUATIONS, validRisks, type StepError, type StepN, type ThesisAnswersT, type ThesisDetailT, type ThesisFactsT, type ThesisT } from '@/shared/thesis'
import { api, ApiFailure } from '../api'
import { useMe, usePortfolio } from '../hooks'
import { GlyphTile } from '../play/glyph'
import { Slide } from '../play/kit'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ExerciseChart, type Line } from '../ui/exercise-chart'
import { ErrorState, PageSkeleton, Seg, Sheet, Steps, TopBar } from '../ui/kit'
import { Lumi, LumiSays, stageOf } from '../ui/lumi'

const useList = () => useQuery({ queryKey: ['thesis'], queryFn: api.thesisList })

/** Precio con su moneda, en el idioma de la pantalla */
function useMoney() {
  const locale = useLocale()
  return (v: number | null | undefined, cur: string) => {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—'
    const d = v >= 1000 ? 0 : v < 10 ? 3 : 2
    try {
      return v.toLocaleString(locale, { style: 'currency', currency: cur || 'EUR', minimumFractionDigits: Math.min(d, 2), maximumFractionDigits: d })
    } catch {
      return `${v.toLocaleString(locale, { maximumFractionDigits: d })} ${cur}`
    }
  }
}
const pctOf = (locale: string, v: number, d = 1) => `${v.toLocaleString(locale, { maximumFractionDigits: d })} %`
/** «182,5» o «182.5» → 182.5 */
const parseNum = (s: string) => {
  const v = Number(s.replace(/\s/g, '').replace(',', '.'))
  return s.trim() && Number.isFinite(v) ? v : undefined
}

// ── Tarjeta en Clases ────────────────────────────────────
export function ProjectCard() {
  const t = useTranslations('project')
  const { data } = useList()
  if (!data) return null
  const drafts = data.items.filter(i => i.status === 'DRAFT').length
  const done = data.items.filter(i => i.status === 'DONE').length
  const sub = !data.unlocked ? t('card.locked', { needs: data.needs ?? '' }) : drafts ? t('card.draft') : done ? t('card.done', { n: done }) : t('card.new')
  return (
    <Link href="/proyecto" className="card flex items-center gap-3" style={{ color: 'var(--ink)', ...(data.unlocked && !done ? { boxShadow: 'inset 0 0 0 2px var(--brand)' } : {}) }}>
      <GlyphTile name="target" size={42} color="var(--brand)" muted={!data.unlocked} />
      <span className="min-w-0 flex-1">
        <span className="t-cap block font-bold">{t('card.kicker')}</span>
        <b className="block">{t('title')}</b>
        <span className="t-cap">{sub}</span>
      </span>
      <Icon name={data.unlocked ? 'chev' : 'lock'} size={18} />
    </Link>
  )
}

// ── «Mis tesis» y elegir empresa ─────────────────────────
export function ThesisHome() {
  const t = useTranslations('project')
  const { data, isError, refetch } = useList()
  const { data: me } = useMe()
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!data) return <PageSkeleton />
  return (
    <div>
      <TopBar back="/clases" title={t('title')} />
      <div className="pad">
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Lumi mood={data.unlocked ? 'HAPPY' : 'THINKING'} size={56} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} label={me?.companion.name || 'Lumi'} />
            <b className="t-head">{t('intro.title')}</b>
          </div>
          <p className="t-foot m-0">{t('intro.body')}</p>
          <ul className="t-foot m-0 flex list-none flex-col gap-1 p-0">
            <li>{t('intro.p1')}</li>
            <li>{t('intro.p2')}</li>
            <li>{t('intro.p3')}</li>
          </ul>
        </div>
        {data.unlocked ? (
          <Picker />
        ) : (
          <div className="card flex items-center gap-3">
            <Icon name="lock" />
            <span className="t-foot flex-1">{t('lockedBody', { needs: data.needs ?? '' })}</span>
            <Link href="/clases" className="btn btn-primary w-auto px-4 py-2 text-[14px]">
              {t('toClasses')}
            </Link>
          </div>
        )}
        {data.items.length > 0 && (
          <section className="flex flex-col gap-2" aria-labelledby="my-theses">
            <h2 id="my-theses" className="t-head m-0 px-0.5">
              {t('mine')}
            </h2>
            <div className="list">
              {data.items.map(i => (
                <Link key={i.id} href={`/tesis/${i.id}`} className="li" style={{ minHeight: 56 }}>
                  <GlyphTile name={i.status === 'DONE' ? 'verified' : 'document'} size={36} color={i.status === 'DONE' ? 'var(--up)' : 'var(--brand)'} />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate">{i.name}</b>
                    <span className="t-cap">{i.status === 'DONE' ? t('doneLine', { score: i.score ?? 0 }) : t('draftLine', { n: Math.min(i.step, THESIS_STEPS), total: THESIS_STEPS })}</span>
                  </span>
                  <Icon name="chev" size={16} />
                </Link>
              ))}
            </div>
          </section>
        )}
        <p className="t-cap m-0 px-0.5">{t('disclaimer')}</p>
      </div>
    </div>
  )
}

function Picker() {
  const t = useTranslations('project')
  const router = useRouter()
  const toast = useToast()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300)
    return () => clearTimeout(id)
  }, [q])
  const res = useQuery({ queryKey: ['thesis-search', debounced], queryFn: () => api.searchAssets({ q: debounced, type: 'STOCK', limit: 8 }), enabled: debounced.length >= 2 })
  const create = useMutation({
    mutationFn: (symbol: string) => api.thesisCreate(symbol),
    onSuccess: th => {
      qc.invalidateQueries({ queryKey: ['thesis'] })
      router.push(`/tesis/${th.id}`)
    },
    onError: e => toast(e instanceof ApiFailure && t.has(`err.${e.code}`) ? t(`err.${e.code}`) : t('err.generic')),
  })
  return (
    <section className="card flex flex-col gap-3" aria-labelledby="pick-title">
      <b id="pick-title" className="t-head">
        {t('pick.title')}
      </b>
      <p className="t-foot m-0">{t('pick.body')}</p>
      <label htmlFor="thesis-q" className="sr-only">
        {t('pick.placeholder')}
      </label>
      <input id="thesis-q" className="input" value={q} onChange={e => setQ(e.target.value)} placeholder={t('pick.placeholder')} maxLength={40} autoComplete="off" />
      {debounced.length >= 2 && res.data && res.data.items.length === 0 && <p className="t-foot m-0">{t('pick.none')}</p>}
      {res.data && res.data.items.length > 0 && (
        <div className="list" style={{ background: 'var(--fill)' }}>
          {res.data.items.map(a => (
            <button key={a.symbol} className="li" style={{ minHeight: 52 }} disabled={create.isPending} onClick={() => create.mutate(a.symbol)} aria-label={t('pick.choose', { name: a.name })}>
              <span className="min-w-0 flex-1">
                <b className="block truncate">{a.name}</b>
                <span className="t-cap">
                  {a.ticker} · {a.exchange}
                  {a.sector ? ` · ${a.sector}` : ''}
                </span>
              </span>
              <Icon name="plus" size={18} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

// ── La guía paso a paso ──────────────────────────────────
export function ThesisFlow({ id }: { id: string }) {
  const q = useQuery({ queryKey: ['thesis', id], queryFn: () => api.thesis(id), retry: (n, e) => !(e instanceof ApiFailure && e.status === 404) && n < 2 })
  const t = useTranslations('project')
  if (q.isError) return q.error instanceof ApiFailure && q.error.status === 404 ? <ErrorState message={t('notFound')} /> : <ErrorState onRetry={() => q.refetch()} />
  if (!q.data) return <PageSkeleton />
  return <Flow key={q.data.thesis.id} d={q.data} />
}

function Flow({ d }: { d: ThesisDetailT }) {
  const t = useTranslations('project')
  const qc = useQueryClient()
  const toast = useToast()
  const router = useRouter()
  const th = d.thesis
  const [a, setA] = useState<ThesisAnswersT>(th.answers)
  const [step, setStep] = useState(th.status === 'DONE' ? THESIS_STEPS + 1 : Math.max(1, th.step))
  const [err, setErr] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)
  const set = (patch: Partial<ThesisAnswersT>) => (setA(x => ({ ...x, ...patch })), setErr(null))
  const put = (next: ThesisT) => qc.setQueryData<ThesisDetailT>(['thesis', th.id], old => (old ? { ...old, thesis: next } : old))
  const errText = (e: unknown) => {
    if (e instanceof ApiFailure) {
      const k = e.code.replace(/^THESIS_/, '')
      if (t.has(`check.${k}`)) return t(`check.${k}`)
      if (t.has(`err.${e.code}`)) return t(`err.${e.code}`)
    }
    return t('err.generic')
  }

  const save = useMutation({
    mutationFn: ({ n, answers }: { n: StepN; answers: ThesisAnswersT }) => api.thesisStep(th.id, n, payload(n, answers)),
    onSuccess: (next, { n }) => {
      put(next)
      setA(next.answers)
      setStep(n + 1)
      window.scrollTo({ top: 0 })
    },
    onError: e => setErr(errText(e)),
  })
  const finish = useMutation({
    mutationFn: () => api.thesisFinish(th.id),
    onSuccess: r => {
      put(r.thesis)
      qc.invalidateQueries({ queryKey: ['thesis'], exact: true })
      qc.invalidateQueries({ queryKey: ['me'] })
      if (r.xp) toast(t('xp', { n: r.xp }))
      window.scrollTo({ top: 0 })
    },
    onError: e => setErr(errText(e)),
  })
  const del = useMutation({
    mutationFn: () => api.thesisDelete(th.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['thesis'], exact: true })
      router.push('/proyecto')
    },
  })

  const current = qc.getQueryData<ThesisDetailT>(['thesis', th.id])?.thesis ?? th
  const done = current.status === 'DONE'
  const next = () => {
    if (step > THESIS_STEPS) return
    const n = step as StepN
    // El deslizador del peso empieza en el 5 %: si no se toca, vale eso
    const answers = n === 5 && a.weightPct === undefined ? { ...a, weightPct: 5 } : n === 3 ? { ...a, risks: (a.risks ?? []).map(s => s.trim()).filter(Boolean) } : a
    const problem: StepError | null = checkStep(n, answers, n === 6 ? d.facts.price : null)
    if (problem) return setErr(t(`check.${problem}`))
    save.mutate({ n, answers })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        close="/proyecto"
        title={d.facts.name}
        right={
          <button className="icon-btn" aria-label={t('delete')} onClick={() => setConfirmDel(true)}>
            <Icon name="trash" size={19} />
          </button>
        }
      />
      <div className="pad flex-1">
        {!done && <Steps total={THESIS_STEPS + 1} current={Math.min(step, THESIS_STEPS + 1)} label={t('progress', { n: Math.min(step, THESIS_STEPS), total: THESIS_STEPS })} />}
        <Facts f={d.facts} />
        {done ? (
          <Done th={current} f={d.facts} />
        ) : step > THESIS_STEPS ? (
          <>
            <Summary a={a} f={d.facts} onEdit={n => setStep(n)} />
            {err && <p className="err m-0" role="alert">{err}</p>}
            <button className="btn btn-primary" onClick={() => finish.mutate()} disabled={finish.isPending}>
              {t('finish')}
            </button>
          </>
        ) : (
          <>
            <StepBody n={step as StepN} a={a} f={d.facts} set={set} />
            {err && (
              <p className="err m-0" role="alert">
                {err}
              </p>
            )}
            <div className="flex gap-2">
              {step > 1 && (
                <button className="btn btn-secondary flex-1" onClick={() => (setStep(step - 1), setErr(null))}>
                  {t('prev')}
                </button>
              )}
              <button className="btn btn-primary flex-[2]" onClick={next} disabled={save.isPending}>
                {step === THESIS_STEPS ? t('toSummary') : t('next')}
              </button>
            </div>
          </>
        )}
      </div>
      <Sheet open={confirmDel} onClose={() => setConfirmDel(false)} label={t('deleteTitle')} alert>
        <b className="t-head">{t('deleteTitle')}</b>
        <p className="t-body muted m-0">{done ? t('deleteDone') : t('deleteBody')}</p>
        <button className="btn btn-danger" onClick={() => del.mutate()} disabled={del.isPending}>
          {t('deleteYes')}
        </button>
        <button className="btn btn-plain" onClick={() => setConfirmDel(false)}>
          {t('cancel')}
        </button>
      </Sheet>
    </div>
  )
}

/** Lo que se envía al servidor en cada paso */
function payload(n: StepN, a: ThesisAnswersT): Record<string, unknown> {
  switch (n) {
    case 1: return { business: a.business ?? '' }
    case 2: return { moatType: a.moatType, moat: a.moat ?? '' }
    case 3: return { risks: (a.risks ?? []).map(s => s.trim()).filter(Boolean) }
    case 4: return { valuation: a.valuation, valuationWhy: a.valuationWhy ?? '' }
    case 5: return { weightPct: a.weightPct ?? 0, weightWhy: a.weightWhy ?? '' }
    case 6: return { stop: a.stop ?? 0, target: a.target ?? 0 }
    case 7: return { horizon: a.horizon, ...(a.horizonWhy ? { horizonWhy: a.horizonWhy } : {}) }
    case 8: return { invalidation: a.invalidation ?? '' }
  }
}

// ── Datos reales de la ficha ─────────────────────────────
function Facts({ f }: { f: ThesisFactsT }) {
  const t = useTranslations('project')
  const locale = useLocale()
  const money = useMoney()
  const none = t('facts.none')
  return (
    <section className="card flex flex-col gap-1" aria-label={t('facts.title')}>
      <div className="flex items-baseline justify-between gap-2">
        <b className="truncate">
          {f.ticker} · {f.name}
        </b>
        <b className="tabular-nums flex-none">{money(f.price, f.currency)}</b>
      </div>
      <span className="t-cap">
        {f.sector || t('facts.noSector')}
        {f.country ? ` · ${f.country}` : ''}
        {f.asOf ? ` · ${t('facts.asOf', { time: new Date(f.asOf).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) })}` : ''}
        {f.stale ? ` · ${t('facts.stale')}` : ''}
      </span>
      <RangeBar f={f} />
      <div className="grid grid-cols-2 gap-x-3">
        <span className="t-cap">
          {t('facts.pe')}: <b>{f.pe !== null && f.pe > 0 ? f.pe.toLocaleString(locale, { maximumFractionDigits: 1 }) : none}</b>
        </span>
        <span className="t-cap">
          {t('facts.div')}: <b>{f.dividendYield !== null ? pctOf(locale, f.dividendYield, 2) : none}</b>
        </span>
      </div>
    </section>
  )
}

/** Rango de 52 semanas con el precio de hoy y, si los hay, el stop y el objetivo */
function RangeBar({ f, stop, target }: { f: ThesisFactsT; stop?: number; target?: number }) {
  const t = useTranslations('project')
  const money = useMoney()
  if (f.low52 === null || f.high52 === null || f.price === null || f.high52 <= f.low52) return <span className="t-cap">{t('facts.noRange')}</span>
  const lo = Math.min(f.low52, stop ?? Infinity, f.price)
  const hi = Math.max(f.high52, target ?? -Infinity, f.price)
  const x = (v: number) => `${((v - lo) / (hi - lo || 1)) * 100}%`
  const mark = (v: number | undefined, color: string, label: string) =>
    v !== undefined && v > 0 ? <i aria-hidden title={label} style={{ position: 'absolute', left: x(v), top: -4, width: 3, height: 16, marginLeft: -1.5, borderRadius: 2, background: color }} /> : null
  return (
    <div className="flex flex-col gap-1 py-1" role="img" aria-label={t('facts.rangeLabel', { low: money(f.low52, f.currency), high: money(f.high52, f.currency), price: money(f.price, f.currency) })}>
      <div className="relative mx-1.5 h-2 rounded-full" style={{ background: 'var(--fill)' }}>
        <i aria-hidden style={{ position: 'absolute', left: x(f.low52), width: `calc(${x(f.high52)} - ${x(f.low52)})`, top: 0, bottom: 0, borderRadius: 99, background: 'color-mix(in srgb, var(--brand) 30%, var(--fill))' }} />
        {mark(stop, 'var(--down)', t('s6.stop'))}
        {mark(target, 'var(--up)', t('s6.target'))}
        <i aria-hidden style={{ position: 'absolute', left: x(f.price), top: -3, width: 14, height: 14, marginLeft: -7, borderRadius: 99, background: 'var(--ink)', boxShadow: '0 0 0 2px var(--surface)' }} />
      </div>
      <span className="t-cap flex justify-between gap-2">
        <span>
          {t('facts.low')} {money(f.low52, f.currency)}
        </span>
        <span>
          {t('facts.high')} {money(f.high52, f.currency)}
        </span>
      </span>
    </div>
  )
}

// ── Cada paso ────────────────────────────────────────────
function Area({ id, label, value, onChange, max = 800, rows = 4, placeholder }: { id: string; label: string; value?: string; onChange: (v: string) => void; max?: number; rows?: number; placeholder?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} className="input resize-y" rows={rows} maxLength={max} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      <span className="t-cap text-right">
        {(value ?? '').length}/{max}
      </span>
    </div>
  )
}

function Options<T extends string>({ label, options, value, onChange, text }: { label: string; options: readonly T[]; value?: T; onChange: (v: T) => void; text: (v: T) => string }) {
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={label}>
      {options.map(o => (
        <button key={o} type="button" className="opt" style={{ minHeight: 48, padding: '11px 14px' }} aria-pressed={value === o} onClick={() => onChange(o)}>
          {text(o)}
        </button>
      ))}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe()
  return <LumiSays mood="THINKING" size={36} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} message={children} />
}

function StepBody({ n, a, f, set }: { n: StepN; a: ThesisAnswersT; f: ThesisFactsT; set: (p: Partial<ThesisAnswersT>) => void }) {
  const t = useTranslations('project')
  const locale = useLocale()
  const { data: pf } = usePortfolio()
  const total = pf ? Number(pf.totalValue) : null
  const eur = (v: number) => v.toLocaleString(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  const head = (
    <div className="flex flex-col gap-1">
      <span className="t-cap font-bold">{t('stepN', { n, total: THESIS_STEPS })}</span>
      <h1 className="t-title m-0">{t(`s${n}.q`, { name: f.name })}</h1>
      <p className="t-foot m-0">{t(`s${n}.help`)}</p>
    </div>
  )
  switch (n) {
    case 1:
      return (
        <>
          {head}
          {f.description && <p className="t-foot card m-0">{f.description}</p>}
          <Area id="s1" label={t('s1.label')} value={a.business} onChange={v => set({ business: v })} placeholder={t('s1.ph')} />
          <Hint>{t('s1.hint')}</Hint>
        </>
      )
    case 2:
      return (
        <>
          {head}
          <Options label={t('s2.choose')} options={MOATS} value={a.moatType} onChange={v => set({ moatType: v })} text={v => t(`moat.${v}`)} />
          <Area id="s2" label={t('s2.label')} value={a.moat} onChange={v => set({ moat: v })} placeholder={t('s2.ph')} />
          <Hint>{a.moatType === 'NONE' ? t('s2.hintNone') : t('s2.hint')}</Hint>
        </>
      )
    case 3: {
      const risks = a.risks?.length ? a.risks : ['', '']
      const ok = validRisks(risks).length
      return (
        <>
          {head}
          {risks.map((r, i) => (
            <div key={i} className="field">
              <label htmlFor={`risk-${i}`}>{t('s3.label', { n: i + 1 })}</label>
              <input id={`risk-${i}`} className="input" maxLength={300} value={r} placeholder={t(`s3.ph${Math.min(i, 2)}`)} onChange={e => set({ risks: risks.map((x, j) => (j === i ? e.target.value : x)) })} />
            </div>
          ))}
          {risks.length < 5 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => set({ risks: [...risks, ''] })}>
              <Icon name="plus" size={16} /> {t('s3.add')}
            </button>
          )}
          <span className="t-cap">{t('s3.count', { n: ok })}</span>
          <Hint>{t('s3.hint')}</Hint>
        </>
      )
    }
    case 4: {
      const pe = f.pe !== null && f.pe > 0 ? f.pe : null
      const fmt = (v: number) => v.toLocaleString(locale, { maximumFractionDigits: 1 })
      return (
        <>
          {head}
          <div className="card flex flex-col gap-1">
            <span className="kv">
              <span>{t('s4.pe')}</span>
              <b>{pe ? fmt(pe) : f.pe !== null && f.pe <= 0 ? t('s4.losses') : t('facts.none')}</b>
            </span>
            <span className="kv">
              <span>{t('s4.sector')}</span>
              <b>{f.sectorPe ? `${fmt(f.sectorPe)} (${t('s4.peers', { n: f.sectorN })})` : t('facts.none')}</b>
            </span>
            <span className="kv">
              <span>{t('s4.history')}</span>
              <b>{f.peHistory ? fmt(f.peHistory) : t('facts.none')}</b>
            </span>
            <p className="t-cap m-0">{pe ? (f.sectorPe ? t('s4.compare', { ratio: fmt(pe / f.sectorPe) }) : t('s4.noSector')) : t('s4.noPe')}</p>
            {!f.peHistory && <p className="t-cap m-0">{t('s4.noHistory')}</p>}
          </div>
          <Options label={t('s4.choose')} options={VALUATIONS} value={a.valuation} onChange={v => set({ valuation: v })} text={v => t(`valuation.${v}`)} />
          <Area id="s4" label={t('s4.label')} value={a.valuationWhy} onChange={v => set({ valuationWhy: v })} placeholder={t('s4.ph')} />
          <Hint>{t('s4.hint')}</Hint>
        </>
      )
    }
    case 5: {
      const w = a.weightPct ?? 5
      return (
        <>
          {head}
          <div className="card flex flex-col gap-2">
            <Slide label={t('s5.label')} value={w} min={0.5} max={30} step={0.5} show={pctOf(locale, w)} onChange={v => set({ weightPct: v })} color={w > MAX_WEIGHT ? 'var(--down)' : 'var(--brand)'} />
            {total ? <span className="t-cap">{t('s5.inEur', { eur: eur((total * w) / 100), total: eur(total) })}</span> : null}
            {w > MAX_WEIGHT ? <span className="err">{t('check.WEIGHT_MAX')}</span> : w > 10 ? <span className="t-cap">{t('s5.concentrated')}</span> : null}
          </div>
          <Area id="s5" label={t('s5.why')} value={a.weightWhy} onChange={v => set({ weightWhy: v, weightPct: w })} max={600} rows={3} placeholder={t('s5.ph')} />
          <Hint>{t('s5.hint')}</Hint>
        </>
      )
    }
    case 6:
      return <StopTarget a={a} f={f} set={set} head={head} />
    case 7:
      return (
        <>
          {head}
          <Options label={t('s7.choose')} options={HORIZONS} value={a.horizon} onChange={v => set({ horizon: v })} text={v => t(`horizon.${v}`)} />
          <Area id="s7" label={t('s7.label')} value={a.horizonWhy} onChange={v => set({ horizonWhy: v })} max={600} rows={3} placeholder={t('s7.ph')} />
          <Hint>{t('s7.hint')}</Hint>
        </>
      )
    case 8:
      return (
        <>
          {head}
          <Area id="s8" label={t('s8.label')} value={a.invalidation} onChange={v => set({ invalidation: v })} placeholder={t('s8.ph')} />
          <Hint>{t('s8.hint')}</Hint>
        </>
      )
  }
}

function StopTarget({ a, f, set, head }: { a: ThesisAnswersT; f: ThesisFactsT; set: (p: Partial<ThesisAnswersT>) => void; head: React.ReactNode }) {
  const t = useTranslations('project')
  const locale = useLocale()
  const money = useMoney()
  const [stopS, setStopS] = useState(a.stop ? String(a.stop) : '')
  const [targetS, setTargetS] = useState(a.target ? String(a.target) : '')
  // El mismo gráfico de «colocar un nivel» de los ejercicios, con las velas semanales reales del último año
  const [which, setWhich] = useState<'stop' | 'target'>(a.stop && !a.target ? 'target' : 'stop')
  const weeks = useQuery({ queryKey: ['candles', f.symbol, '1w'], queryFn: () => api.candles(f.symbol, '1w'), staleTime: 3_600_000 })
  const ohlc = (weeks.data ?? []).slice(-52).map(c => [c.o, c.h, c.l, c.c] as [number, number, number, number])
  const price = f.price
  const stop = parseNum(stopS)
  const target = parseNum(targetS)
  const w = a.weightPct ?? 0
  const problem = price && (stop !== undefined || target !== undefined) ? checkStep(6, { ...a, stop, target }, price) : null
  const dist = price && stop ? ((price - stop) / price) * 100 : null
  const up = price && target ? ((target - price) / price) * 100 : null
  const risk = price && stop && stop < price ? riskAtStop(w, price, stop) : null
  const rr = price && stop && target && stop < price ? (target - price) / (price - stop) : null
  const fmt = (v: number, d = 1) => v.toLocaleString(locale, { maximumFractionDigits: d })
  return (
    <>
      {head}
      {price === null ? (
        <div className="banner banner-info">{t('check.NO_PRICE')}</div>
      ) : (
        <div className="card flex flex-col gap-3">
          <span className="t-foot">{t('s6.now', { price: money(price, f.currency) })}</span>
          {ohlc.length >= 8 ? (
            <>
              <Seg label={t('s6.place')} value={which} onChange={setWhich} options={[{ value: 'stop', label: t('s6.stop') }, { value: 'target', label: t('s6.target') }]} />
              <ExerciseChart
                candles={ohlc}
                label={t('s6.chart')}
                lines={[
                  { price, color: 'var(--ink-2)', label: `${t('s6.price')} ${money(price, f.currency)}`, dashed: true },
                  ...(stop ? [{ price: stop, color: 'var(--down)', label: `${t('s6.stop')} ${money(stop, f.currency)}` }] : []),
                  ...(target ? [{ price: target, color: 'var(--up)', label: `${t('s6.target')} ${money(target, f.currency)}` }] : []),
                ] satisfies Line[]}
                onPrice={p => {
                  const v = Number(p.toPrecision(5))
                  if (which === 'stop') {
                    setStopS(String(v))
                    set({ stop: v })
                  } else {
                    setTargetS(String(v))
                    set({ target: v })
                  }
                }}
              />
              <span className="t-cap">{t('s6.drag')}</span>
            </>
          ) : (
            <RangeBar f={f} stop={stop} target={target} />
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="field">
              <label htmlFor="stop">
                {t('s6.stop')} ({f.currency})
              </label>
              <input id="stop" className="input" inputMode="decimal" value={stopS} onChange={e => (setStopS(e.target.value), set({ stop: parseNum(e.target.value) }))} placeholder={f.low52 ? fmt(f.low52, 2) : ''} />
            </div>
            <div className="field">
              <label htmlFor="target">
                {t('s6.target')} ({f.currency})
              </label>
              <input id="target" className="input" inputMode="decimal" value={targetS} onChange={e => (setTargetS(e.target.value), set({ target: parseNum(e.target.value) }))} />
            </div>
          </div>
          {problem && problem !== 'STOP_ZERO' && problem !== 'TARGET_BELOW' ? <span className="err">{t(`check.${problem}`)}</span> : null}
          {problem === 'TARGET_BELOW' && target !== undefined ? <span className="err">{t('check.TARGET_BELOW')}</span> : null}
          <div className="flex flex-col gap-0.5" aria-live="polite">
            {dist !== null && dist > 0 && <span className="t-cap">{t('s6.dist', { pct: fmt(dist) })}</span>}
            {up !== null && up > 0 && <span className="t-cap">{t('s6.up', { pct: fmt(up) })}</span>}
            {risk !== null && w > 0 && (
              <span className="t-cap font-bold" style={{ color: risk <= 1 ? 'var(--up)' : risk <= 2 ? 'var(--ink)' : 'var(--down)' }}>
                {t('s6.risk', { w: fmt(w), risk: fmt(risk, 2) })} {risk <= 1 ? t('s6.riskOk') : t('s6.riskHigh')}
              </span>
            )}
            {rr !== null && rr > 0 && <span className="t-cap">{t('s6.rr', { rr: fmt(rr) })}</span>}
          </div>
        </div>
      )}
      <Hint>{t('s6.hint')}</Hint>
    </>
  )
}

// ── Ficha de tesis (resumen) ─────────────────────────────
function Summary({ a, f, onEdit }: { a: ThesisAnswersT; f: ThesisFactsT; onEdit?: (n: number) => void }) {
  const t = useTranslations('project')
  const locale = useLocale()
  const money = useMoney()
  const rows: [number, string, React.ReactNode][] = [
    [1, t('sum.business'), a.business],
    [2, t('sum.moat'), a.moatType ? `${t(`moat.${a.moatType}`)}. ${a.moat ?? ''}` : null],
    [3, t('sum.risks'), validRisks(a.risks).map((r, i) => <span key={i} className="block">· {r}</span>)],
    [4, t('sum.valuation'), a.valuation ? `${t(`valuation.${a.valuation}`)}. ${a.valuationWhy ?? ''}` : null],
    [5, t('sum.weight'), a.weightPct ? `${pctOf(locale, a.weightPct)}. ${a.weightWhy ?? ''}` : null],
    [6, t('sum.levels'), a.stop && a.target ? t('sum.levelsLine', { stop: money(a.stop, f.currency), target: money(a.target, f.currency), price: money(a.priceAt ?? f.price, f.currency) }) : null],
    [7, t('sum.horizon'), a.horizon ? `${t(`horizon.${a.horizon}`)}${a.horizonWhy ? `. ${a.horizonWhy}` : ''}` : null],
    [8, t('sum.invalidation'), a.invalidation],
  ]
  return (
    <section className="card flex flex-col gap-3" aria-labelledby="sum-title">
      <div className="flex items-center gap-2">
        <GlyphTile name="document" size={32} />
        <b id="sum-title" className="t-head">
          {t('sum.title', { name: f.name })}
        </b>
      </div>
      {rows.map(([n, label, value]) => (
        <div key={n} className="flex flex-col gap-0.5">
          <span className="t-cap flex items-center justify-between gap-2 font-bold">
            {label}
            {onEdit && (
              <button type="button" className="link min-h-[44px] px-2 text-[13px]" onClick={() => onEdit(n)} aria-label={t('sum.edit', { what: label })}>
                {t('sum.editShort')}
              </button>
            )}
          </span>
          <span className="t-foot break-words whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>
            {value || '—'}
          </span>
        </div>
      ))}
    </section>
  )
}

// ── Terminada: puntuación, certificado y simulador ───────
function Done({ th, f }: { th: ThesisT; f: ThesisFactsT }) {
  const t = useTranslations('project')
  const locale = useLocale()
  const { data: me } = useMe()
  return (
    <>
      <section className="card flex flex-col items-center gap-2 text-center" style={{ boxShadow: 'inset 0 0 0 2px var(--brand)' }}>
        <Lumi mood="CELEBRATE" size={64} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} label={me?.companion.name || 'Lumi'} />
        <span className="t-cap font-bold">{t('done.kicker')}</span>
        <b className="t-large tabular-nums">{th.score ?? 0}/100</b>
        <p className="t-foot m-0">{t('done.body', { name: f.name })}</p>
      </section>
      <section className="card flex flex-col gap-3" aria-labelledby="score-title">
        <b id="score-title" className="t-head">
          {t('score.title')}
        </b>
        {th.parts.map(p => (
          <div key={p.key} className="flex flex-col gap-1">
            <span className="flex justify-between gap-2 text-[15px]">
              <b>{t(`score.${p.key}`)}</b>
              <b className="tabular-nums">
                {p.points}/{p.max}
              </b>
            </span>
            <div className="bar" aria-hidden>
              <i style={{ width: `${(p.points / p.max) * 100}%` }} />
            </div>
            <span className="t-cap">{t(`score.${p.key}Help`)}</span>
          </div>
        ))}
      </section>
      <Summary a={th.answers} f={f} />
      {th.shareCode && <Certificate code={th.shareCode} name={f.name} />}
      <Link href={`/mercado/${encodeURIComponent(th.symbol)}`} className="btn btn-primary">
        {t('done.simulator')}
      </Link>
      <p className="t-cap m-0 text-center">{t('done.simulatorNote')}</p>
      <Link href="/proyecto" className="btn btn-secondary">
        {t('done.another')}
      </Link>
      {th.completedAt && <p className="t-cap m-0 text-center">{t('done.date', { date: new Date(th.completedAt).toLocaleDateString(locale) })}</p>}
    </>
  )
}

function Certificate({ code, name }: { code: string; name: string }) {
  const t = useTranslations('project')
  const locale = useLocale()
  const { data: inv } = useQuery({ queryKey: ['invite'], queryFn: api.myInvites, retry: false, staleTime: 3_600_000 })
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const q = new URLSearchParams({ t: 'tesis', code, ...(inv?.code ? { inv: inv.code } : {}) })
  const share = async () => {
    setBusy(true)
    const url = `${location.origin}/${locale}/s?${q.toString()}`
    const text = t('cert.text', { name })
    try {
      const img = await fetch(`/api/share/image?${q.toString()}&l=${locale}&f=story`)
      const file = new File([await img.blob()], 'lumi-tesis.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `${text} ${url}` })
      else if (navigator.share) await navigator.share({ title: 'E-Trading', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // cancelado o sin permiso
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="card flex flex-col gap-3" aria-labelledby="cert-title">
      <b id="cert-title" className="t-head">
        {t('cert.title')}
      </b>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/share/image?${new URLSearchParams({ t: 'tesis', code, l: locale }).toString()}`} alt={t('cert.alt', { name })} width={1200} height={630} className="h-auto w-full rounded-2xl" loading="lazy" />
      <p className="t-cap m-0">{t('cert.privacy')}</p>
      <button className="btn btn-secondary" onClick={share} disabled={busy}>
        <Icon name="chat" size={18} /> {copied ? t('cert.copied') : t('cert.share')}
      </button>
    </section>
  )
}
