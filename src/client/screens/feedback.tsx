'use client'
// Opinión: Lumi pregunta, una cosa por pantalla, y se responde con toques. Un minuto; al final, +50 gemas.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { FB_BLOCKERS, FB_LIKES, FB_PAY, FB_PRICE, FB_WANTS } from '@/shared/feedback'
import { api, ApiFailure } from '../api'
import { useGuard } from '../shell'
import { Icon } from '../ui/icons'
import { PageSkeleton, Steps, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

type Answers = { nps?: number; likes: string[]; blockers: string[]; pay?: string; price?: string; wants: string[]; wantsOther: string; comment: string }
type Step = 'nps' | 'likes' | 'blockers' | 'pay' | 'price' | 'wants' | 'comment'

/** Tarjeta en Inicio cuando toca pedir opinión */
export function FeedbackCard() {
  const t = useTranslations('feedback')
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['feedback'], queryFn: api.feedbackStatus, staleTime: 5 * 60_000 })
  const later = useMutation({ mutationFn: api.feedbackLater, onSuccess: () => qc.setQueryData(['feedback'], { ...data, due: false }) })
  if (!data?.due) return null
  return (
    <div className="card flex flex-col gap-3" style={{ border: '1.5px solid var(--brand)' }}>
      <div className="flex items-center gap-3">
        <Lumi mood="HAPPY" size={44} />
        <span>
          <b>{t('cardTitle')}</b>
          <br />
          <span className="t-foot">{t('cardBody', { gems: data.gems })}</span>
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Link href="/opinion" className="btn btn-primary btn-sm">
          {t('cardCta')}
        </Link>
        <button className="btn btn-plain btn-sm w-auto" onClick={() => later.mutate()} disabled={later.isPending}>
          {t('later')}
        </button>
      </div>
    </div>
  )
}

export function Feedback() {
  const { ready } = useGuard('app')
  return ready ? <FeedbackFlow /> : <PageSkeleton />
}

function FeedbackFlow() {
  const t = useTranslations('feedback')
  const qc = useQueryClient()
  const router = useRouter()
  const [a, setA] = useState<Answers>({ likes: [], blockers: [], wants: [], wantsOther: '', comment: '' })
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const send = useMutation({
    mutationFn: () => api.submitFeedback({ nps: a.nps!, likes: a.likes, blockers: a.blockers, pay: a.pay!, price: a.price, wants: a.wants, wantsOther: a.wantsOther || undefined, comment: a.comment || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feedback'] })
      qc.invalidateQueries({ queryKey: ['home'] })
    },
  })
  // La pregunta del precio justo solo sale si diría que sí, pero más barato
  const steps: Step[] = ['nps', 'likes', 'blockers', 'pay', ...(a.pay === 'cheaper' ? (['price'] as Step[]) : []), 'wants', 'comment']
  const step = steps[i]
  const next = () => {
    setPicked(null)
    if (i < steps.length - 1) setI(i + 1)
    else send.mutate()
  }
  // Respuesta única: se ilumina y pasa sola
  const pickOne = (key: 'nps' | 'pay' | 'price', v: string | number) => {
    setA(x => ({ ...x, [key]: v }))
    setPicked(String(v))
    setTimeout(() => {
      setPicked(null)
      setI(n => n + 1)
    }, 380)
  }
  const toggle = (key: 'likes' | 'blockers' | 'wants', v: string, max: number) =>
    setA(x => {
      const has = x[key].includes(v)
      // «Nada, todo bien» no se mezcla con lo demás
      const base = key === 'blockers' ? (v === 'nothing' ? [] : x[key].filter(k => k !== 'nothing')) : x[key]
      return { ...x, [key]: has ? x[key].filter(k => k !== v) : base.length >= max ? base : [...base, v] }
    })

  if (send.isSuccess)
    return (
      <div className="pad min-h-[calc(100dvh-20px)] items-center justify-center text-center">
        <div className="animate-pop">
          <Lumi mood="CELEBRATE" size={96} />
        </div>
        <h1 className="t-large m-0">{t('thanksTitle')}</h1>
        <p className="t-body muted m-0">{send.data?.gems ? t('thanksGems', { gems: send.data.gems }) : t('thanksBody')}</p>
        <button className="btn btn-primary" onClick={() => router.push('/inicio')}>
          {t('done')}
        </button>
      </div>
    )

  const chips = (key: 'likes' | 'blockers' | 'wants', ids: readonly string[], max: number) => (
    <>
      <div className="flex flex-wrap gap-2">
        {ids.map(id => {
          const on = a[key].includes(id)
          return (
            <button key={id} onClick={() => toggle(key, id, max)} aria-pressed={on} className="rounded-full border px-4 py-2.5 text-[15px] font-bold transition-all active:scale-95" style={on ? { background: 'var(--brand)', borderColor: 'var(--brand)', color: 'var(--on-brand)' } : { borderColor: 'var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}>
              {t(`${key}.${id}`)}
            </button>
          )
        })}
      </div>
      <span className="t-cap">{t('upTo', { n: max })}</span>
    </>
  )
  const single = (key: 'pay' | 'price', ids: readonly string[]) => (
    <div className="flex flex-col gap-2">
      {ids.map(id => (
        <button key={id} className="opt" aria-pressed={picked === id || a[key] === id} onClick={() => pickOne(key, id)} style={picked === id ? { borderColor: 'var(--brand)', background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))' } : undefined}>
          <span className="flex-1">{t(`${key}.${id}`)}</span>
          {picked === id && <Icon name="check" size={18} />}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-[calc(100dvh-20px)] flex-col">
      <TopBar close="/inicio" title={<Steps total={steps.length} current={i + 1} label={t('title')} />} />
      <div key={step} className="pad flex-1 animate-rise">
        <div className="flex items-start gap-3">
          <Lumi mood={step === 'nps' ? 'HAPPY' : step === 'blockers' ? 'THINKING' : step === 'comment' ? 'CALM' : 'HAPPY'} size={52} />
          <div className="card m-0 flex-1 rounded-tl-md">
            <b className="text-[17px] leading-[23px]">{t(`q.${step}`, { price: '7,99 €', year: '59,99 €' })}</b>
            {step === 'nps' && <p className="t-cap m-0 mt-1">{t('npsHint')}</p>}
          </div>
        </div>

        {step === 'nps' && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
              {Array.from({ length: 11 }, (_, n) => (
                <button key={n} onClick={() => pickOne('nps', n)} aria-pressed={a.nps === n} className="aspect-square rounded-xl border text-[17px] font-extrabold transition-all active:scale-90" style={picked === String(n) || a.nps === n ? { background: 'var(--brand)', borderColor: 'var(--brand)', color: 'var(--on-brand)' } : { borderColor: 'var(--line)', background: 'var(--surface)' }}>
                  {n}
                </button>
              ))}
            </div>
            <div className="t-cap flex justify-between">
              <span>{t('npsLow')}</span>
              <span>{t('npsHigh')}</span>
            </div>
          </div>
        )}
        {step === 'likes' && chips('likes', FB_LIKES, 3)}
        {step === 'blockers' && chips('blockers', FB_BLOCKERS, 4)}
        {step === 'pay' && single('pay', FB_PAY)}
        {step === 'price' && single('price', FB_PRICE)}
        {step === 'wants' && (
          <>
            {chips('wants', FB_WANTS, 3)}
            {a.wants.includes('other') && <input className="input" maxLength={300} value={a.wantsOther} onChange={e => setA(x => ({ ...x, wantsOther: e.target.value }))} placeholder={t('otherPlaceholder')} aria-label={t('otherPlaceholder')} autoFocus />}
          </>
        )}
        {step === 'comment' && <textarea className="input min-h-[120px] py-3" maxLength={1000} value={a.comment} onChange={e => setA(x => ({ ...x, comment: e.target.value }))} placeholder={t('commentPlaceholder')} aria-label={t('q.comment')} />}
        {send.error && <p className="err m-0">{send.error instanceof ApiFailure ? send.error.message : t('error')}</p>}
      </div>
      {(step === 'likes' || step === 'blockers' || step === 'wants' || step === 'comment') && (
        <div className="sticky bottom-0 flex gap-2.5 px-4 pt-2.5" style={{ background: 'var(--bg)', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          <button className="btn btn-primary" onClick={next} disabled={send.isPending || (step !== 'comment' && step !== 'wants' && !a[step].length)}>
            {step === 'comment' ? (a.comment ? t('send') : t('sendWithout')) : t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
