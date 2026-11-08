'use client'
// /estudiante: pedir el precio de estudiante (centro, email de estudiante opcional y foto del carné o la matrícula).
// Las fotos grandes se reducen aquí antes de enviarlas (máx. 1800 px, JPG); los PDF van tal cual (hasta 3 MB).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { money } from '@/shared/format'
import { PRICES, STUDENT_MAX_BYTES } from '@/shared/plans'
import { api, ApiFailure } from '../api'
import { useLang } from '../hooks'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, TopBar } from '../ui/kit'
import { Lumi } from '../ui/lumi'

const ACCEPT = 'image/jpeg,image/png,application/pdf'

/** Reduce una foto a 1800 px como mucho y la pasa a JPG (si así pesa menos). Los PDF no se tocan. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size < 900 * 1024) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close()
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.82))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    // Formato que el navegador no sabe abrir: se envía tal cual (el servidor lo comprueba)
    return file
  }
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

export function StudentScreen() {
  const t = useTranslations('billing.student')
  const locale = useLang()
  const qc = useQueryClient()
  const { data, isError, refetch } = useQuery({ queryKey: ['student'], queryFn: api.studentStatus })
  const [institution, setInstitution] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const send = useMutation({
    mutationFn: () => {
      const f = new FormData()
      f.set('institution', institution.trim())
      if (email.trim()) f.set('studentEmail', email.trim())
      f.set('photo', file!)
      return api.requestStudent(f)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student'] })
      qc.invalidateQueries({ queryKey: ['plan-badge'] })
    },
    onError: e => setError(e instanceof ApiFailure && t.has(`errors.${e.code}`) ? t(`errors.${e.code}`) : e instanceof ApiFailure ? e.message : t('errors.INTERNAL')),
  })
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return <PageSkeleton />
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const p = PRICES
  const intro = (
    <>
      <h1 className="t-large">{t('title')}</h1>
      <p className="t-body muted m-0">{t('intro')}</p>
      <p className="t-foot m-0">{t('prices', { plus: money(p.student.PLUS.MONTH, 'EUR', locale), max: money(p.student.PREMIUM.MONTH, 'EUR', locale), plusN: money(p.normal.PLUS.MONTH, 'EUR', locale), maxN: money(p.normal.PREMIUM.MONTH, 'EUR', locale) })}</p>
    </>
  )
  const shell = (body: React.ReactNode) => (
    <>
      <TopBar back="/premium" title={t('title')} />
      <div className="pad">{body}</div>
    </>
  )
  if (data.isGuest)
    return shell(
      <>
        {intro}
        <p className="t-body m-0">{t('guest')}</p>
        <Link href="/guardar" className="btn btn-primary">
          {t('guestCta')}
        </Link>
      </>,
    )
  if (send.isSuccess || data.pending)
    return shell(
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <Lumi mood="HAPPY" size={72} />
        <h1 className="t-title m-0">{send.isSuccess ? t('sentTitle') : t('pendingTitle')}</h1>
        <p className="t-body muted m-0">{data.pending && !send.isSuccess ? t('pendingBody', { institution: data.pending.institution, date: date(data.pending.createdAt) }) : t('sentBody')}</p>
        <Link href="/premium" className="btn btn-primary">
          {t('seePlans')}
        </Link>
      </div>,
    )
  const renewing = data.active && data.canRenew
  if (data.active && !renewing)
    return shell(
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <Lumi mood="CELEBRATE" size={72} />
        <h1 className="t-title m-0">{t('activeTitle')}</h1>
        <p className="t-body muted m-0">{t('activeBody', { date: date(data.until!) })}</p>
        <Link href="/premium" className="btn btn-primary">
          {t('seePlans')}
        </Link>
      </div>,
    )
  const pick = async (f: File | undefined) => {
    setError(null)
    if (!f) return
    if (!ACCEPT.split(',').includes(f.type)) return setError(t('errors.FILE_TYPE'))
    setBusy(true)
    const small = await shrink(f)
    setBusy(false)
    if (small.size > STUDENT_MAX_BYTES) return setError(t('errors.FILE_TOO_BIG'))
    setFile(small)
  }
  const ready = institution.trim().length >= 2 && !!file && !busy && !send.isPending && data.requestsLeft > 0
  return shell(
    <form
      className="flex flex-col gap-3.5"
      onSubmit={e => {
        e.preventDefault()
        setError(null)
        if (ready) send.mutate()
      }}
    >
      {intro}
      {renewing && <div className="banner banner-info">{t('renewNote')}</div>}
      {data.last?.status === 'REJECTED' && (
        <div className="banner">
          <span>
            <b>{t('rejectedTitle')}</b>
            {data.last.note && (
              <>
                <br />
                {t('rejectedBody', { note: data.last.note })}
              </>
            )}
          </span>
        </div>
      )}
      <div className="field">
        <label htmlFor="st-inst">{t('institution')}</label>
        <input id="st-inst" className="input" value={institution} onChange={e => setInstitution(e.target.value)} maxLength={120} placeholder={t('institutionPh')} autoComplete="organization" required />
      </div>
      <div className="field">
        <label htmlFor="st-mail">{t('email')}</label>
        <input id="st-mail" className="input" type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} placeholder={t('emailPh')} autoComplete="email" aria-describedby="st-mail-hint" />
        <span id="st-mail-hint" className="t-cap">
          {t('emailHint')}
        </span>
      </div>
      <div className="field">
        <span id="st-photo-label">{t('photo')}</span>
        <label className="btn btn-secondary cursor-pointer" aria-labelledby="st-photo-label">
          <Icon name={file ? 'check' : 'download'} size={18} />
          {busy ? t('compressing') : file ? t('change') : t('choose')}
          <input type="file" accept={ACCEPT} className="sr-only" onChange={e => pick(e.target.files?.[0])} aria-describedby="st-photo-hint" />
        </label>
        {file && (
          <span className="t-foot truncate">
            {file.name} · {kb(file.size)}
          </span>
        )}
        <span id="st-photo-hint" className="t-cap">
          {t('photoHint')}
        </span>
      </div>
      {error && (
        <p className="err m-0" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={!ready}>
        {send.isPending ? t('sending') : t('send')}
      </button>
      <p className="t-cap m-0">{data.requestsLeft > 0 ? t('left', { n: data.requestsLeft }) : t('none')}</p>
      <p className="t-cap m-0">{t('privacy')}</p>
    </form>,
  )
}
