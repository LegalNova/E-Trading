'use client'
// «Algo no está bien»: un botón pequeño que abre una hoja para avisar de un fallo.
// Manda solo el contexto (ruta, clase, pregunta, símbolo); el equipo lo revisa en el admin.
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { usePathname } from '@/i18n/navigation'
import { api, ApiFailure, type ReportContext, type ReportKind } from './api'
import { useSession } from './hooks'
import { useToast } from './providers'
import { Icon } from './ui/icons'
import { Sheet } from './ui/kit'

const KINDS: ReportKind[] = ['CONTENT', 'BUG', 'MARKET', 'OTHER']
const MIN = 5
const MAX = 1000

/** Bandera (no está en el juego de iconos común) */
function Flag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </svg>
  )
}

/** Solo con sesión propia: mientras un admin «ve como» otro usuario no se puede mandar nada */
function useCanReport() {
  const { data } = useSession()
  return !!data?.signedIn && !data.viewAs
}

/** Icono para la cabecera (clase, quiz, ficha de un activo) */
export function ReportButton({ context, kind = 'CONTENT' }: { context?: ReportContext; kind?: ReportKind }) {
  const t = useTranslations('admin2.report')
  const [open, setOpen] = useState(false)
  const can = useCanReport()
  if (!can) return null
  return (
    <>
      <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label={t('open')} title={t('open')}>
        <Flag />
      </button>
      {open && <ReportSheet context={context} initialKind={kind} onClose={() => setOpen(false)} />}
    </>
  )
}

/** Fila para listas (Perfil) */
export function ReportRow() {
  const t = useTranslations('admin2.report')
  const [open, setOpen] = useState(false)
  const can = useCanReport()
  if (!can) return null
  return (
    <>
      <button type="button" className="li w-full text-left" onClick={() => setOpen(true)}>
        <span className="ava">
          <Flag size={18} />
        </span>
        <span className="flex-1 font-semibold">{t('open')}</span>
        <Icon name="chev" size={18} />
      </button>
      {open && <ReportSheet initialKind="BUG" onClose={() => setOpen(false)} />}
    </>
  )
}

function ReportSheet({ context, initialKind, onClose }: { context?: ReportContext; initialKind: ReportKind; onClose: () => void }) {
  const t = useTranslations('admin2.report')
  const path = usePathname()
  const toast = useToast()
  const [kind, setKind] = useState<ReportKind>(initialKind)
  const [message, setMessage] = useState('')
  const len = message.trim().length
  const send = useMutation({
    mutationFn: () => api.sendReport({ kind, message: message.trim(), path, context }),
    onSuccess: () => {
      onClose()
      toast(
        <>
          <Icon name="check" size={18} strokeWidth={2.4} /> {t('thanks')}
        </>,
      )
    },
  })
  const error = send.error ? (send.error instanceof ApiFailure ? send.error.message : t('failed')) : null
  return (
    <Sheet open onClose={onClose} label={t('title')}>
      <div className="flex items-center gap-2">
        <h2 className="t-title m-0 flex-1">{t('title')}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('close')}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <p className="t-foot m-0">{t('lead')}</p>
      <form
        className="flex flex-col gap-3"
        onSubmit={e => {
          e.preventDefault()
          if (len >= MIN && !send.isPending) send.mutate()
        }}
      >
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('kindLabel')}>
          {KINDS.map(k => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className="min-h-11 rounded-2xl px-3 py-2 text-left text-[14px] leading-tight font-bold"
              style={{ background: kind === k ? 'color-mix(in srgb, var(--brand) 12%, var(--surface))' : 'var(--fill)', color: kind === k ? 'var(--brand-ink)' : 'var(--ink)', boxShadow: kind === k ? 'inset 0 0 0 2px var(--brand)' : undefined }}
            >
              {t(`kinds.${k}`)}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="report-msg">{t('messageLabel')}</label>
          <textarea id="report-msg" className="input min-h-[120px] py-3" maxLength={MAX} value={message} onChange={e => setMessage(e.target.value)} placeholder={t(`placeholder.${kind}`)} aria-describedby="report-count" />
          <span id="report-count" className="t-cap text-right tabular-nums">
            {len < MIN ? t('min', { n: MIN }) : `${message.length}/${MAX}`}
          </span>
        </div>
        <p className="t-cap m-0">{t('context')}</p>
        {error && (
          <p className="err m-0" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={len < MIN || send.isPending}>
          {send.isPending ? t('sending') : t('send')}
        </button>
      </form>
    </Sheet>
  )
}
