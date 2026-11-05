'use client'
// Avisos en el móvil: activar/desactivar, tarjeta para pedirlos en Inicio y aviso de «añádeme a la pantalla de
// inicio» en iPhone (Apple solo los permite así).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { api } from './api'
import { Icon } from './ui/icons'
import { Lumi } from './ui/lumi'

const DISMISS_KEY = 'lumi:push-later'
const noop = () => () => {}

function env() {
  if (typeof window === 'undefined') return { supported: false, ios: false, standalone: false, permission: 'default' as NotificationPermission }
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  return { supported, ios, standalone, permission: supported ? Notification.permission : ('default' as NotificationPermission) }
}
const envKey = () => JSON.stringify(env())

const b64ToBytes = (b64: string) => {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, c => c.charCodeAt(0))
}

async function currentSub() {
  const reg = await navigator.serviceWorker.getRegistration('/')
  return reg ? reg.pushManager.getSubscription() : null
}

export function usePush() {
  const qc = useQueryClient()
  const raw = useSyncExternalStore(noop, envKey, () => JSON.stringify({ supported: false, ios: false, standalone: false, permission: 'default' }))
  const e = JSON.parse(raw) as ReturnType<typeof env>
  const { data: key } = useQuery({ queryKey: ['push-key'], queryFn: api.pushKey, staleTime: Infinity, enabled: e.supported })
  const { data: subscribed, refetch } = useQuery({ queryKey: ['push-sub'], queryFn: async () => !!(await currentSub()), enabled: e.supported })
  const enable = useMutation({
    mutationFn: async () => {
      if (!key?.key) throw new Error('off')
      if ((await Notification.requestPermission()) !== 'granted') throw new Error('denied')
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key.key) }))
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      await api.pushSubscribe(j)
    },
    onSettled: () => (refetch(), qc.invalidateQueries({ queryKey: ['push-sub'] })),
  })
  const disable = useMutation({
    mutationFn: async () => {
      const sub = await currentSub()
      if (sub) {
        await api.pushUnsubscribe(sub.endpoint)
        await sub.unsubscribe()
      }
    },
    onSettled: () => refetch(),
  })
  return { ...e, available: e.supported && !!key?.key, subscribed: !!subscribed, enable, disable }
}

/** Tarjeta en Inicio para activar los avisos (o instrucciones en iPhone) */
export function PushCard() {
  const t = useTranslations('push')
  const p = usePush()
  const [later, setLater] = useState(() => {
    try {
      return Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now()
    } catch {
      return false
    }
  })
  if (later || p.subscribed || p.permission === 'denied') return null
  const dismiss = () => {
    setLater(true)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 5 * 86_400_000))
    } catch {
      // sin almacenamiento: se vuelve a enseñar en la siguiente visita
    }
  }
  // iPhone en Safari: primero hay que añadir Lumi a la pantalla de inicio
  if (p.ios && !p.standalone)
    return (
      <div className="card flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <Lumi mood="HAPPY" size={40} />
          <b className="flex-1">{t('iosTitle')}</b>
        </div>
        <ol className="t-foot m-0 flex list-decimal flex-col gap-1 pl-5">
          <li>{t('ios1')}</li>
          <li>{t('ios2')}</li>
          <li>{t('ios3')}</li>
        </ol>
        <button className="btn btn-plain btn-sm self-end" onClick={dismiss}>
          {t('later')}
        </button>
      </div>
    )
  if (!p.available) return null
  return (
    <div className="card flex flex-col gap-3" style={{ border: '1.5px solid var(--brand)' }}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
          <Icon name="bell" size={20} />
        </span>
        <span className="flex-1">
          <b>{t('title')}</b>
          <br />
          <span className="t-foot">{t('body')}</span>
        </span>
      </div>
      {p.enable.isError && <p className="err m-0">{(p.enable.error as Error).message === 'denied' ? t('denied') : t('error')}</p>}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button className="btn btn-primary btn-sm" onClick={() => p.enable.mutate()} disabled={p.enable.isPending}>
          {t('enable')}
        </button>
        <button className="btn btn-plain btn-sm w-auto" onClick={dismiss}>
          {t('later')}
        </button>
      </div>
    </div>
  )
}

/** Interruptor para Ajustes */
export function PushToggle() {
  const t = useTranslations('push')
  const p = usePush()
  if (p.ios && !p.standalone) return <p className="t-cap m-0 px-1">{t('iosHint')}</p>
  if (!p.available) return <p className="t-cap m-0 px-1">{t('unsupported')}</p>
  return (
    <div className="li plainline justify-between">
      <span className="flex flex-col">
        <span>{t('device')}</span>
        <span className="t-cap">{p.permission === 'denied' ? t('denied') : p.subscribed ? t('on') : t('off')}</span>
      </span>
      <button className={`btn btn-sm w-auto ${p.subscribed ? 'btn-secondary' : 'btn-primary'}`} disabled={p.enable.isPending || p.disable.isPending || p.permission === 'denied'} onClick={() => (p.subscribed ? p.disable.mutate() : p.enable.mutate())}>
        {p.subscribed ? t('disable') : t('enable')}
      </button>
    </div>
  )
}

/** Cuenta las aperturas desde un aviso (?aviso=tipo) y limpia la dirección */
export function PushOpenTracker() {
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    const kind = q.get('aviso')
    if (!kind) return
    api.trackEvent({ name: 'push_open', kind })
    q.delete('aviso')
    history.replaceState(null, '', location.pathname + (q.toString() ? `?${q}` : '') + location.hash)
  }, [])
  return null
}
