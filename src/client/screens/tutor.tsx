'use client'
// Pregúntale a Lumi: chat con la profesora, que responde con el manual del curso y el progreso del alumno
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { TutorHistoryT, TutorMessageT, TutorModeT } from '@/shared/contract'
import { api, ApiFailure } from '../api'
import { useMe } from '../hooks'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'
import { RichText } from '../ui/rich-text'

const MODES: TutorModeT[] = ['EXPLAIN', 'PATH', 'PORTFOLIO', 'BIASES']
const PREMIUM_MODES: TutorModeT[] = ['PORTFOLIO', 'BIASES']

export function Tutor({ lessonTitle }: { lessonTitle?: string }) {
  const t = useTranslations('tutor')
  const qc = useQueryClient()
  const toast = useToast()
  const { data: me } = useMe()
  const hist = useQuery({ queryKey: ['tutor'], queryFn: api.tutorHistory })
  const [mode, setMode] = useState<TutorModeT>('EXPLAIN')
  const [q, setQ] = useState(lessonTitle ? t('aboutLesson', { title: lessonTitle }) : '')
  const [pending, setPending] = useState<string | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const name = me?.companion.name || 'Lumi'

  const ask = useMutation({
    mutationFn: (question: string) => api.tutorAsk(question, mode),
    onMutate: question => setPending(question),
    onSuccess: (r, question) => {
      qc.setQueryData<TutorHistoryT>(['tutor'], h => {
        if (!h) return h
        const now = new Date().toISOString()
        const add: TutorMessageT[] = [
          { id: `u-${now}`, role: 'user', content: question, mode, sources: [], createdAt: now },
          { id: `a-${now}`, role: 'assistant', content: r.answer, mode, sources: r.sources, createdAt: now },
        ]
        return { ...h, messages: [...h.messages, ...add], usage: r.usage }
      })
      setQ('')
    },
    onError: e => toast(e instanceof ApiFailure ? e.message : t('error')),
    onSettled: () => setPending(null),
  })
  const clear = useMutation({ mutationFn: api.tutorClear, onSuccess: () => (qc.invalidateQueries({ queryKey: ['tutor'] }), toast(t('cleared'))) })

  const count = hist.data?.messages.length ?? 0
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [count, pending])

  if (hist.isError) return <ErrorState onRetry={() => hist.refetch()} />
  if (!hist.data) return <PageSkeleton />
  const h = hist.data
  const left = Math.max(0, h.usage.limit - h.usage.used)
  const limited = left === 0
  const send = (text = q) => {
    const v = text.trim()
    if (!v || ask.isPending || limited) return
    if (PREMIUM_MODES.includes(mode) && !h.premium) return
    ask.mutate(v)
  }

  return (
    <div className="flex min-h-[calc(100dvh-90px)] flex-col">
      <TopBar
        back="/clases"
        title={t('title', { name })}
        right={
          h.messages.length > 0 ? (
            <button className="icon-btn" aria-label={t('clear')} onClick={() => clear.mutate()}>
              <Icon name="trash" size={19} />
            </button>
          ) : undefined
        }
      />
      <div className="pad flex-1">
        <div className="pills" role="group" aria-label={t('modes')}>
          {MODES.map(m => {
            const locked = PREMIUM_MODES.includes(m) && !h.premium
            return (
              <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {t(`mode.${m}`)}
                {locked && ' 🔒'}
              </button>
            )
          })}
        </div>
        <p className="t-cap m-0 px-0.5">{t(`modeHint.${mode}`)}</p>

        {h.messages.length === 0 && !pending && (
          <div className="card flex flex-col items-center gap-3 py-6 text-center">
            <Lumi mood="HAPPY" size={72} skin={me?.companion.skinId} label={name} />
            <b className="t-head">{t('hello', { name })}</b>
            <p className="t-foot m-0 max-w-[420px]">{t('intro')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(['s1', 's2', 's3', 's4'] as const).map(k => (
                <button key={k} className="chip" style={{ background: 'var(--fill)' }} onClick={() => send(t(`suggest.${k}`))} disabled={limited}>
                  {t(`suggest.${k}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3" aria-live="polite">
          {h.messages.map(m => (
            <Bubble key={m.id} m={m} name={name} skin={me?.companion.skinId} />
          ))}
          {pending && (
            <>
              <Bubble m={{ id: 'p', role: 'user', content: pending, mode, sources: [], createdAt: '' }} name={name} />
              <div className="flex items-center gap-2">
                <Lumi mood="THINKING" size={34} skin={me?.companion.skinId} label={name} />
                <span className="t-foot">{t('thinking', { name })}</span>
              </div>
            </>
          )}
          <div ref={end} />
        </div>

        {PREMIUM_MODES.includes(mode) && !h.premium && (
          <div className="card flex items-center gap-3">
            <Icon name="lock" />
            <span className="t-foot flex-1">{t('premiumMode')}</span>
            <Link href="/premium" className="btn btn-primary w-auto px-4 py-2 text-[14px]">
              {t('seePremium')}
            </Link>
          </div>
        )}
        {limited && (
          <div className="card flex items-center gap-3">
            <Lumi mood="SLEEPY" size={40} skin={me?.companion.skinId} label={name} />
            <span className="t-foot flex-1">{h.premium ? t('limitPremium') : t('limitFree')}</span>
            {!h.premium && (
              <Link href="/premium" className="btn btn-primary w-auto px-4 py-2 text-[14px]">
                {t('seePremium')}
              </Link>
            )}
          </div>
        )}
      </div>

      <form
        className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] flex flex-col gap-1.5 px-4 pt-2 pb-3 md:bottom-0"
        style={{ background: 'var(--bg)' }}
        onSubmit={e => {
          e.preventDefault()
          send()
        }}
      >
        <div className="flex items-end gap-2">
          <label htmlFor="tutor-q" className="sr-only">
            {t('placeholder')}
          </label>
          <textarea
            id="tutor-q"
            className="input min-h-[46px] flex-1 resize-none"
            rows={1}
            maxLength={600}
            placeholder={t('placeholder')}
            value={q}
            disabled={limited}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <button type="submit" className="btn btn-primary w-auto px-4" disabled={!q.trim() || ask.isPending || limited || (PREMIUM_MODES.includes(mode) && !h.premium)} aria-label={t('send')}>
            {t('send')}
          </button>
        </div>
        <span className="t-cap flex justify-between gap-2">
          <span>{t('left', { n: left, total: h.usage.limit })}</span>
          <span>{h.ai ? t('engineAi') : t('engineManual')}</span>
        </span>
      </form>
    </div>
  )
}

function Bubble({ m, name, skin }: { m: TutorMessageT; name: string; skin?: string }) {
  const t = useTranslations('tutor')
  if (m.role === 'user')
    return (
      <div className="ml-auto max-w-[85%] rounded-[18px] rounded-br-md px-3.5 py-2.5 text-[15px] leading-[22px] whitespace-pre-wrap" style={{ background: 'var(--brand)', color: '#fff' }}>
        {m.content}
      </div>
    )
  return (
    <div className="flex max-w-[95%] items-start gap-2">
      <Lumi mood="HAPPY" size={34} skin={skin} label={name} className="mt-1 flex-none" />
      <div className="card flex min-w-0 flex-1 flex-col gap-2 rounded-tl-md">
        <RichText text={m.content} />
        {m.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="t-cap">{t('sources')}</span>
            {m.sources.map(s => (
              <Link key={s.lessonId} href={`/leccion/${s.lessonId}`} className="chip" style={{ background: 'var(--fill)' }} title={s.unit}>
                {s.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
