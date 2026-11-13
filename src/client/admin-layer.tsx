'use client'
// Herramientas del equipo dentro de la app (solo ADMIN):
// - «Datos»: cada pantalla enseña sus números (quién la visita, dónde se abandona, qué se opera…).
// - «Ver como»: la app tal como la ve un usuario concreto, en solo lectura, con un aviso arriba.
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { api, type Lens, type LensRange } from './api'
import { VIEW_AS_KEY } from './api/http'
import { useSession } from './hooks'
import { Icon } from './ui/icons'
import { Seg } from './ui/kit'

const OPEN_KEY = 'lumi:lens'

export function AdminLayer() {
  const { data: session } = useSession()
  if (!session?.isAdmin) return null
  return (
    <>
      {session.viewAs && <ViewAsBanner who={session.viewAs.name || session.viewAs.email} />}
      <LensToggle />
    </>
  )
}

function ViewAsBanner({ who }: { who: string }) {
  const t = useTranslations('admin.lens')
  const qc = useQueryClient()
  const router = useRouter()
  // Deja sitio arriba para el aviso
  useEffect(() => {
    document.body.style.paddingTop = '40px'
    document.documentElement.style.setProperty('--viewas', '40px')
    return () => {
      document.body.style.paddingTop = ''
      document.documentElement.style.removeProperty('--viewas')
    }
  }, [])
  const exit = () => {
    try {
      sessionStorage.removeItem(VIEW_AS_KEY)
    } catch {
      // sin almacenamiento: no había nada que quitar
    }
    qc.clear()
    router.push('/admin')
  }
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[60] flex h-10 items-center justify-center gap-3 px-3 text-[13px] font-bold" style={{ background: 'var(--amber, #f5a623)', color: '#1d1d1f' }}>
      <Icon name="user" size={16} />
      <span className="truncate">{t('viewing', { who })}</span>
      <button className="rounded-full px-3 py-1 text-[12px]" style={{ background: '#1d1d1f', color: '#fff' }} onClick={exit}>
        {t('exit')}
      </button>
    </div>
  )
}

function LensToggle() {
  const t = useTranslations('admin.lens')
  // Solo se pinta en el navegador (tras cargar la sesión): se puede leer el almacenamiento al empezar
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(OPEN_KEY) === '1'
    } catch {
      return false
    }
  })
  const toggle = (v: boolean) => {
    setOpen(v)
    try {
      localStorage.setItem(OPEN_KEY, v ? '1' : '0')
    } catch {
      // sin almacenamiento: solo en esta visita
    }
  }
  return open ? (
    <LensPanel onClose={() => toggle(false)} />
  ) : (
    // En móvil, una pestañita pegada al borde derecho a media altura: no tapa los botones de abajo ni los paneles de
    // respuesta (auditoría APP-36); en pantallas grandes, el botón de siempre abajo a la derecha
    <button onClick={() => toggle(true)} className="fixed top-[42%] right-0 z-50 flex items-center gap-1.5 rounded-l-full py-2 pr-1.5 pl-2.5 text-[13px] font-bold shadow-lg md:top-auto md:right-5 md:bottom-5 md:rounded-full md:px-3.5" style={{ background: 'var(--ink)', color: 'var(--bg)' }} aria-label={t('open')}>
      <Icon name="chart" size={16} />
      <span className="hidden md:inline">{t('button')}</span>
    </button>
  )
}

function LensPanel({ onClose }: { onClose: () => void }) {
  const t = useTranslations('admin.lens')
  const path = usePathname()
  const [range, setRange] = useState<LensRange>('30d')
  const { data, isFetching, error } = useQuery({ queryKey: ['admin-lens', path, range], queryFn: () => api.adminLens(path, range), staleTime: 30_000 })
  // En pantallas grandes la app se aparta para que el panel no tape nada
  useEffect(() => {
    document.documentElement.dataset.lens = 'open'
    return () => {
      delete document.documentElement.dataset.lens
    }
  }, [])
  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 flex max-h-[78dvh] flex-col rounded-t-2xl border shadow-2xl md:top-[var(--viewas,0px)] md:right-0 md:bottom-0 md:left-auto md:max-h-none md:w-[380px] md:rounded-none md:border-y-0 md:border-r-0" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }} aria-label={t('title')}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--line)' }}>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          ADMIN
        </span>
        <b className="min-w-0 flex-1 truncate text-[15px]">{data?.title ?? t('title')}</b>
        <button className="icon-btn" onClick={onClose} aria-label={t('close')}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-2">
          <span className="t-cap truncate">{path}</span>
          <Seg
            label={t('range')}
            className="w-[190px] flex-none"
            value={range}
            onChange={setRange}
            options={[
              { value: '7d', label: '7 d' },
              { value: '30d', label: '30 d' },
              { value: 'all', label: t('all') },
            ]}
          />
        </div>
        {error ? <p className="err m-0">{error.message}</p> : !data ? <p className="t-cap m-0">{t('loading')}</p> : <LensBody lens={data} dim={isFetching} />}
        <Link href="/admin" className="btn btn-secondary mt-1">
          <Icon name="admin" size={18} />
          {t('panel')}
        </Link>
      </div>
    </aside>
  )
}

function LensBody({ lens, dim }: { lens: Lens; dim: boolean }) {
  const t = useTranslations('admin.lens')
  return (
    <div className="flex flex-col gap-3 transition-opacity" style={{ opacity: dim ? 0.6 : 1 }}>
      <div className="grid grid-cols-2 gap-2">
        {lens.kpis.map(k => (
          <div key={k.label} className="rounded-xl px-3 py-2.5" style={{ background: 'var(--fill)' }}>
            <div className="t-cap">{k.label}</div>
            <div className="text-[22px] leading-tight font-extrabold tabular-nums">{k.value ?? '—'}</div>
            {k.hint && <div className="t-cap">{k.hint}</div>}
          </div>
        ))}
      </div>
      {lens.bars?.map(b => {
        const max = Math.max(1, ...b.items.map(i => i.value))
        return (
          <div key={b.title} className="flex flex-col gap-1.5">
            <b className="text-[13px]">{b.title}</b>
            {b.items.length ? (
              b.items.map(i => (
                <div key={i.label} className="flex items-center gap-2 text-[12px]">
                  <span className="w-20 flex-none truncate">{i.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--fill)' }}>
                    <span className="block h-full rounded-full" style={{ width: `${(i.value / max) * 100}%`, background: 'var(--brand)' }} />
                  </span>
                  <span className="w-8 flex-none text-right font-bold tabular-nums">{i.value}</span>
                </div>
              ))
            ) : (
              <span className="t-cap">{t('empty')}</span>
            )}
          </div>
        )
      })}
      {lens.tables?.map(tb => (
        <div key={tb.title} className="flex flex-col gap-1">
          <b className="text-[13px]">{tb.title}</b>
          {tb.rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="t-cap text-left">
                  <tr>
                    {tb.head.map((h, i) => (
                      <th key={h} className={`py-1 pr-2 font-semibold ${i ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tb.rows.map((r, k) => (
                    <tr key={k} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      {r.map((c, i) => (
                        <td key={i} className={`py-1 pr-2 align-top ${i ? 'text-right tabular-nums' : ''}`}>
                          {c ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="t-cap">{tb.note ?? t('empty')}</span>
          )}
        </div>
      ))}
      {lens.note && <p className="t-cap m-0">{lens.note}</p>}
    </div>
  )
}

/** Pantalla vista (para la capa de datos y el embudo); el servidor la cuenta una vez al día por usuario */
export function ScreenTracker() {
  const path = usePathname()
  useEffect(() => {
    if (path.startsWith('/admin')) return
    // Enlace de campaña (?ref=) por el que se ha llegado, para contar sus visitas
    const ref = new URLSearchParams(location.search).get('ref') ?? undefined
    api.trackEvent({ name: 'screen_view', path, ref })
  }, [path])
  return null
}
