'use client'
// Compartir un logro, una racha o una clase: en el móvil, como imagen (WhatsApp, Instagram…); si no, el enlace.
// Siempre lleva el enlace de invitación de quien comparte: quien entra tiene 7 días de Max.
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { api } from './api'
import { Icon } from './ui/icons'

export type ShareWhat = { t: 'logro'; id: string } | { t: 'racha'; n: number } | { t: 'clase'; id: string; s: number }

export function ShareButton({ what, className = 'btn btn-secondary' }: { what: ShareWhat; className?: string }) {
  const t = useTranslations('share')
  const locale = useLocale()
  const { data: inv } = useQuery({ queryKey: ['invite'], queryFn: api.myInvites, retry: false, staleTime: 3_600_000 })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const params = () => {
    const q = new URLSearchParams({ t: what.t })
    if (what.t === 'racha') q.set('n', String(what.n))
    else q.set('id', what.id)
    if (what.t === 'clase') q.set('s', String(what.s))
    if (inv?.code) q.set('inv', inv.code)
    return q
  }
  const share = async () => {
    setBusy(true)
    const q = params()
    const url = `${location.origin}/${locale}/s?${q.toString()}`
    const text = t('text')
    try {
      // Como imagen si el móvil lo permite
      const img = await fetch(`/api/share/image?${q.toString()}&l=${locale}&f=story`)
      const file = new File([await img.blob()], 'lumi.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `${text} ${url}` })
      else if (navigator.share) await navigator.share({ title: 'E-Trading', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setDone(true)
        setTimeout(() => setDone(false), 1800)
      }
    } catch {
      // cancelado o sin permiso: no pasa nada
    } finally {
      setBusy(false)
    }
  }
  return (
    <button className={className} onClick={share} disabled={busy}>
      <Icon name="chat" size={18} /> {done ? t('copied') : t('cta')}
    </button>
  )
}
