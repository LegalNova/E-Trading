'use client'
// Ventana «Mensaje del equipo de E-Trading»: sale al abrir la app si el equipo le ha escrito (y no lo ha leído),
// o al tocar el mensaje en Avisos o en el aviso del móvil (?mensaje=…). Al cerrarla queda como leído.
// Mientras un admin «ve como» a alguien no sale sola ni se marca nada (solo lectura).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { api, type TeamMessageT } from './api'
import { useLang, useSession } from './hooks'
import { Sheet } from './ui/kit'
import { Lumi } from './ui/lumi'

export function TeamMessage() {
  return (
    <Suspense>
      <TeamMessageInner />
    </Suspense>
  )
}

function TeamMessageInner() {
  const { data: s } = useSession()
  const params = useSearchParams()
  const wanted = params.get('mensaje')
  const signed = !!s?.signedIn && s.onboardingStep === null
  const viewing = !!s?.viewAs
  const pending = useQuery({ queryKey: ['team-pending'], queryFn: api.teamPending, enabled: signed && !viewing, staleTime: 5 * 60_000, refetchOnWindowFocus: false })
  const one = useQuery({ queryKey: ['team-message', wanted], queryFn: () => api.teamMessage(wanted!), enabled: signed && !!wanted && /^tm-[a-z0-9-]{4,60}$/.test(wanted), retry: false })
  const [closed, setClosed] = useState<string[]>([])
  const list = one.data && !closed.includes(one.data.id) ? [one.data] : (pending.data?.items ?? []).filter(m => !closed.includes(m.id))
  if (!list.length) return null
  return <Window key={list[0].id} msg={list[0]} left={list.length - 1} viewing={viewing} fromLink={!!wanted} onClosed={id => setClosed(c => [...c, id])} />
}

function Window({ msg, left, viewing, fromLink, onClosed }: { msg: TeamMessageT; left: number; viewing: boolean; fromLink: boolean; onClosed: (id: string) => void }) {
  const t = useTranslations('teamMessage')
  const locale = useLang()
  const qc = useQueryClient()
  const router = useRouter()
  const path = usePathname()
  const [open, setOpen] = useState(true)
  const seen = useMutation({
    mutationFn: api.teamSeen,
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
      void qc.invalidateQueries({ queryKey: ['home'] })
    },
  })
  const close = () => {
    if (!viewing && !msg.read) seen.mutate(msg.id)
    setOpen(false)
    onClosed(msg.id)
    // Venía de un enlace (Avisos o el móvil): se quita ?mensaje= para que no vuelva a salir
    if (fromLink) router.replace(path)
  }
  const date = new Date(msg.at).toLocaleDateString(locale, { day: 'numeric', month: 'long' })
  return (
    <Sheet open={open} onClose={close} label={msg.header}>
      <div className="flex items-center gap-3 pt-1">
        <Lumi mood="HAPPY" size={56} label={t('lumi')} />
        <div className="min-w-0 flex-1">
          <span className="t-cap block" style={{ color: 'var(--brand-ink)' }}>
            {msg.header}
          </span>
          <span className="t-cap">{date}</span>
        </div>
      </div>
      <div className="card flex flex-col gap-2" style={{ background: 'var(--surface)' }}>
        {msg.title && <h2 className="t-title m-0 break-words">{msg.title}</h2>}
        {/* Texto tal cual (React lo escapa: nada de HTML) */}
        <p className="t-body m-0 break-words whitespace-pre-wrap">{msg.text}</p>
        <span className="t-foot">{t('signature')}</span>
      </div>
      <button className="btn btn-primary" onClick={close}>
        {left > 0 ? t('next', { n: left }) : t('ok')}
      </button>
    </Sheet>
  )
}
