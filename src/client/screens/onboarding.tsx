'use client'
// 02.6–02.12 · Onboarding en 7 pasos. Cada paso se guarda; si sales, vuelves al pendiente.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { GenderT, PlacementFinishT } from '@/shared/contract'
import { money } from '@/shared/format'
import { api, ApiFailure, type OnboardingDraft } from '../api'
import { useGuard } from '../shell'
import { Icon } from '../ui/icons'
import { Check, PageSkeleton, Seg, Steps } from '../ui/kit'
import { Lumi, SKINS } from '../ui/lumi'
import { QuestionView, type AnswerValue } from './quiz'

const TOTAL = 7

function Head({ n, onBack }: { n: number; onBack?: () => void }) {
  const t = useTranslations('common')
  return (
    <div className="topbar gap-2 pr-4">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label={t('back')}>
          <Icon name="back" />
        </button>
      ) : (
        <span className="w-11" />
      )}
      <Steps total={TOTAL} current={n} />
      <span className="t-cap w-9 text-right">
        {n}/{TOTAL}
      </span>
    </div>
  )
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function Placement({ onDone, onBack }: { onDone: (r: PlacementFinishT) => void; onBack: () => void }) {
  const t = useTranslations('onboarding')
  const start = useQuery({ queryKey: ['placement'], queryFn: () => api.quizStart('placement'), staleTime: Infinity, gcTime: 0, retry: false })
  const [i, setI] = useState(0)
  const [value, setValue] = useState<AnswerValue>(null)
  const finish = useMutation({ mutationFn: () => api.placementFinish(start.data!.attemptId), onSuccess: onDone })
  const answer = useMutation({
    mutationFn: (v: AnswerValue) => (v === null ? Promise.resolve(null) : api.answer(start.data!.attemptId, start.data!.questions[i].id, v as number, 0)),
    onSuccess: () => {
      if (i === start.data!.questions.length - 1) finish.mutate()
      else {
        setI(i + 1)
        setValue(null)
      }
    },
  })
  if (!start.data) return <PageSkeleton />
  const qs = start.data.questions
  const q = qs[i]
  return (
    <>
      <Head n={4} onBack={onBack} />
      <div className="pad">
        <span className="t-foot">{t('placementHint', { i: i + 1, n: qs.length })}</span>
        <h1 className="t-title">{q.prompt}</h1>
        <QuestionView key={q.id} q={q} value={value} onChange={setValue} reveal={null} />
        <p className="t-cap m-0">{t('placementNote')}</p>
        <button className="btn btn-primary" disabled={value === null || answer.isPending || finish.isPending} onClick={() => answer.mutate(value)}>
          {t('check')}
        </button>
        <button className="btn btn-plain" disabled={answer.isPending || finish.isPending} onClick={() => answer.mutate(null)}>
          {t('skip')}
        </button>
      </div>
    </>
  )
}

export function Onboarding() {
  const { ready } = useGuard('onboarding')
  const ob = useQuery({ queryKey: ['onboarding'], queryFn: api.onboarding, enabled: ready, staleTime: Infinity })
  if (!ready || !ob.data) return <PageSkeleton />
  return <Flow initialStep={Math.min(ob.data.step, 6)} initialDraft={ob.data.draft} />
}

/** El borrador guardado solo se usa como valor inicial: a partir de aquí manda el estado local */
function Flow({ initialStep, initialDraft }: { initialStep: number; initialDraft: OnboardingDraft }) {
  const t = useTranslations('onboarding')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const qc = useQueryClient()
  const [step, setStep] = useState(initialStep)
  const [d, setD] = useState<OnboardingDraft>(initialDraft)
  const [birth, setBirth] = useState(() => {
    const [year, m, day] = initialDraft.birthDate ? initialDraft.birthDate.split('-') : ['', '', '']
    return { day: day ? String(Number(day)) : '', month: m ? String(Number(m)) : '', year }
  })
  const [placement, setPlacement] = useState<PlacementFinishT | null>(null)

  const save = useMutation({
    mutationFn: ({ n, patch }: { n: number; patch: Partial<OnboardingDraft> }) => api.saveOnboarding(n, patch),
    onSuccess: (_, { n }) => setStep(n + 1),
  })
  const complete = useMutation({
    mutationFn: async () => {
      await api.saveOnboarding(6, { disclaimerAccepted: true })
      await api.completeOnboarding()
    },
    onSuccess: async () => {
      await qc.invalidateQueries()
      router.replace('/inicio')
    },
  })

  const set = (patch: Partial<OnboardingDraft>) => setD({ ...d, ...patch })
  const back = () => setStep(Math.max(1, step - 1))
  const err = save.error instanceof ApiFailure ? save.error : null

  if (step === 1) {
    const birthDate = birth.year.length === 4 && birth.month && birth.day ? `${birth.year}-${birth.month.padStart(2, '0')}-${birth.day.padStart(2, '0')}` : ''
    const validDate = !!birthDate && !Number.isNaN(new Date(birthDate).getTime()) && Number(birth.year) > 1900
    return (
      <>
        <Head n={1} />
        <form
          className="pad"
          onSubmit={e => {
            e.preventDefault()
            save.mutate({ n: 1, patch: { name: d.name.trim(), gender: d.gender, birthDate } })
          }}
        >
          <h1 className="t-title">{t('nameTitle')}</h1>
          <input className="input" value={d.name} onChange={e => set({ name: e.target.value })} aria-label={t('nameLabel')} autoComplete="given-name" maxLength={30} required />
          <h2 className="t-head m-0 mt-1.5">{t('genderTitle')}</h2>
          <Seg<GenderT> label={t('genderTitle')} value={d.gender} onChange={g => set({ gender: g })} options={(['F', 'M', 'N'] as const).map(g => ({ value: g, label: t(`gender.${g}`) }))} />
          <p className="t-cap m-0">{t('genderNote', { example: t(`genderExample.${d.gender}`) })}</p>
          <h2 className="t-head m-0 mt-1.5">{t('birthTitle')}</h2>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: '70px 1fr 90px' }}>
            <input className="input" inputMode="numeric" maxLength={2} placeholder={t('day')} aria-label={t('day')} value={birth.day} onChange={e => setBirth({ ...birth, day: e.target.value.replace(/\D/g, '') })} />
            <select className="input" aria-label={t('month')} value={birth.month} onChange={e => setBirth({ ...birth, month: e.target.value })}>
              <option value="">{t('month')}</option>
              {MONTHS.map(m => (
                <option key={m} value={m}>
                  {new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, m - 1, 1))}
                </option>
              ))}
            </select>
            <input className="input" inputMode="numeric" maxLength={4} placeholder={t('year')} aria-label={t('year')} value={birth.year} onChange={e => setBirth({ ...birth, year: e.target.value.replace(/\D/g, '') })} />
          </div>
          <p className="t-cap m-0">{t('birthNote')}</p>
          {err && <p className="err m-0">{err.code === 'UNDER_MIN_AGE' ? t('underAge') : err.message}</p>}
          <button className="btn btn-primary mt-2" disabled={!d.name.trim() || !validDate || save.isPending}>
            {tc('continue')}
          </button>
        </form>
      </>
    )
  }

  if (step === 2)
    return (
      <>
        <Head n={2} onBack={back} />
        <div className="pad">
          <h1 className="t-title">{t('expTitle')}</h1>
          {(['NONE', 'SOME', 'EXPERIENCED'] as const).map(k => (
            <button key={k} className="opt" aria-pressed={d.experience === k} onClick={() => set({ experience: k })}>
              <span className="flex flex-1 flex-col gap-0.5">
                <span>{t(`exp.${k}.title`)}</span>
                <span className="t-foot">{t(`exp.${k}.body`)}</span>
              </span>
            </button>
          ))}
          <button className="btn btn-primary mt-2" disabled={save.isPending} onClick={() => save.mutate({ n: 2, patch: { experience: d.experience } })}>
            {tc('continue')}
          </button>
        </div>
      </>
    )

  if (step === 3) {
    const goals = t.raw('goalOptions') as string[]
    return (
      <>
        <Head n={3} onBack={back} />
        <div className="pad">
          <h1 className="t-title">{t('goalsTitle')}</h1>
          <div className="flex flex-wrap gap-2">
            {goals.map(g => {
              const on = d.goals.includes(g)
              return (
                <button key={g} className="chip px-3.5 py-2.5 text-sm" aria-pressed={on} style={on ? { background: 'var(--brand)', color: 'var(--on-brand)' } : undefined} onClick={() => set({ goals: on ? d.goals.filter(x => x !== g) : [...d.goals, g] })}>
                  {g}
                </button>
              )
            })}
          </div>
          <h2 className="t-head m-0 mt-2">{t('dailyGoal')}</h2>
          <div className="grid grid-cols-5 gap-2">
            {([5, 10, 15, 20, 30] as const).map(m => (
              <button key={m} className="opt flex-col gap-0 px-1.5 py-3 text-center" aria-pressed={d.dailyGoalMinutes === m} onClick={() => set({ dailyGoalMinutes: m })}>
                <b className="text-xl">{m}</b>
                <span className="t-cap">min</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary mt-2" disabled={save.isPending} onClick={() => save.mutate({ n: 3, patch: { goals: d.goals, dailyGoalMinutes: d.dailyGoalMinutes } })}>
            {tc('continue')}
          </button>
        </div>
      </>
    )
  }

  if (step === 4) {
    if (!placement) return <Placement onBack={back} onDone={setPlacement} />
    return (
      <div className="pad min-h-dvh pt-10">
        <Lumi mood="CELEBRATE" size={64} skin={d.skinId} />
        <h1 className="t-large">{t('startAt', { unit: placement.startUnitTitle })}</h1>
        <p className="t-body muted m-0">{t('placementScore', { correct: placement.correct, total: placement.total })}</p>
        {placement.skippedUnitTitles.length > 0 && <p className="t-body muted m-0">{t('skipped', { units: placement.skippedUnitTitles.join(', ') })}</p>}
        <div className="flex-1" />
        <button className="btn btn-primary" onClick={() => save.mutate({ n: 4, patch: {} })}>
          {tc('continue')}
        </button>
      </div>
    )
  }

  if (step === 5)
    return (
      <>
        <Head n={5} onBack={back} />
        <div className="pad">
          <h1 className="t-title">{t('companionTitle', { name: d.companionName || 'Lumi' })}</h1>
          <div className="flex justify-center py-2">
            <Lumi mood="HAPPY" size={96} skin={d.skinId} label={d.companionName || 'Lumi'} />
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {SKINS.map(s => {
              const locked = s.unlockLevel > 1
              return (
                <button key={s.id} className="opt flex-col gap-1.5 px-1 py-2.5 text-center text-xs" aria-pressed={d.skinId === s.id} disabled={locked} onClick={() => set({ skinId: s.id })} style={locked ? { opacity: 0.55 } : undefined}>
                  <Lumi mood="HAPPY" size={34} skin={s.id} stage={1} animated={false} />
                  {t(`skins.${s.id}`)}
                  {locked && <span className="t-cap">{t('levelN', { n: s.unlockLevel })}</span>}
                </button>
              )
            })}
          </div>
          <div className="field">
            <label htmlFor="f-lumi">{t('companionName')}</label>
            <input id="f-lumi" className="input" value={d.companionName} maxLength={14} onChange={e => set({ companionName: e.target.value })} />
          </div>
          <button className="btn btn-primary" disabled={save.isPending} onClick={() => save.mutate({ n: 5, patch: { skinId: d.skinId, companionName: d.companionName.trim() || 'Lumi' } })}>
            {tc('continue')}
          </button>
        </div>
      </>
    )

  return (
    <>
      <Head n={7} onBack={back} />
      <div className="pad">
        <div className="card flex flex-col gap-1">
          <span className="t-foot">{t('balanceTitle')}</span>
          <span className="big">{money(10000, 'EUR', locale)}</span>
          <span className="t-cap">{t('balancePremium', { amount: money(50000, 'EUR', locale) })}</span>
        </div>
        <div className="card flex flex-col gap-3">
          <span className="t-head">{t('beforeStart')}</span>
          <p className="t-body muted m-0">{t('disclaimer')}</p>
          <button className="flex items-center gap-2.5 text-left" role="checkbox" aria-checked={d.disclaimerAccepted} onClick={() => set({ disclaimerAccepted: !d.disclaimerAccepted })}>
            <Check on={d.disclaimerAccepted} />
            <b>{t('accept')}</b>
          </button>
        </div>
        <button className="btn btn-primary" disabled={!d.disclaimerAccepted || complete.isPending} onClick={() => complete.mutate()}>
          {t('start')}
        </button>
      </div>
    </>
  )
}
