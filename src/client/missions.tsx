'use client'
// Misiones «Pruébalo» (aprender haciendo): la tarjeta del final de la clase, la de Inicio y la pista en la ficha de un activo.
// La comprobación es del servidor (/api/missions); aquí solo se muestra y se avisa al cumplirla.
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import type { MissionsT, MissionT } from '@/shared/contract'
import { api } from './api'
import { useToast } from './providers'
import { Icon } from './ui/icons'

/** Misiones del usuario (al pedirlas, el servidor comprueba las pendientes y cobra las cumplidas) */
export function useMissions(enabled = true) {
  const qc = useQueryClient()
  const toast = useToast()
  const t = useTranslations('missions')
  const q = useQuery({ queryKey: ['missions'], queryFn: api.missions, enabled, staleTime: 15_000 })
  useAnnounce(q.data, qc, toast, t)
  return q
}

/** Al cumplirse una misión: aviso y se refresca lo que muestra el XP */
function useAnnounce(d: MissionsT | undefined, qc: ReturnType<typeof useQueryClient>, toast: ReturnType<typeof useToast>, t: ReturnType<typeof useTranslations>) {
  const seen = useRef<string>('')
  useEffect(() => {
    if (!d?.justDone.length) return
    const key = d.justDone.map(m => m.lessonId).join(',')
    if (seen.current === key) return
    seen.current = key
    toast(t('doneToast', { xp: d.justDone.length * d.justDone[0].xp }))
    qc.invalidateQueries({ queryKey: ['home'] })
    qc.invalidateQueries({ queryKey: ['me'] })
  }, [d, qc, toast, t])
}

function XpChip({ xp, done }: { xp: number; done?: boolean }) {
  return (
    <span className="chip flex-none text-[12px]" style={done ? { background: 'color-mix(in srgb, var(--up) 16%, var(--surface))', color: 'var(--up)' } : { background: 'color-mix(in srgb, var(--brand) 12%, var(--surface))', color: 'var(--brand-ink)' }}>
      {done && <Icon name="check" size={13} strokeWidth={2.4} />}+{xp} XP
    </span>
  )
}

/** El botón: la propia frase de la clase, que lleva justo al sitio donde se hace */
function MissionLink({ m }: { m: MissionT }) {
  const t = useTranslations('missions')
  return (
    <Link href={m.href} className="opt min-h-11 text-left" style={{ boxShadow: 'inset 0 0 0 2px var(--brand)' }} aria-label={t('goAria', { text: m.text })}>
      <span className="min-w-0 flex-1">{m.text}</span>
      <Icon name="chev" size={18} />
    </Link>
  )
}

/** Resultado del quiz aprobado: «Pruébalo ahora» con la frase, el botón y +20 XP */
export function TryItNow({ lessonId }: { lessonId: string }) {
  const t = useTranslations('missions')
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['mission', lessonId], queryFn: () => api.lessonMission(lessonId) })
  // La misión se acaba de abrir: la lista de Inicio cambia
  useEffect(() => {
    if (data?.state === 'OPEN') qc.invalidateQueries({ queryKey: ['missions'] })
  }, [data?.state, qc])
  const m = data?.mission
  if (!m || (data.state !== 'OPEN' && data.state !== 'DONE')) return null
  const done = data.state === 'DONE'
  return (
    <div className="card flex w-full flex-col gap-2.5 text-left" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <b className="t-head">{done ? t('doneTitle') : t('tryNow')}</b>
        <XpChip xp={m.xp} done={done} />
      </div>
      {done ? <span className="t-foot">{m.text}</span> : (
        <>
          <span className="t-cap">{t('tryNowHint')}</span>
          <MissionLink m={m} />
        </>
      )}
    </div>
  )
}

/** Último paso de la clase (antes del quiz): qué misión se abrirá al aprobar. Sin botón: primero, el quiz. */
export function MissionPreview({ lessonId }: { lessonId: string }) {
  const t = useTranslations('missions')
  const { data } = useQuery({ queryKey: ['mission', lessonId], queryFn: () => api.lessonMission(lessonId) })
  const m = data?.mission
  if (!m || data.state === 'NONE' || data.state === 'EXPIRED') return null
  const done = data.state === 'DONE'
  return (
    <div className="card flex flex-col gap-1.5" style={{ background: 'color-mix(in srgb, var(--brand) 7%, var(--surface))' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="t-cap font-bold" style={{ color: 'var(--brand-ink)' }}>
          {done ? t('doneTitle') : data.state === 'OPEN' ? t('openTitle') : t('afterQuiz')}
        </span>
        <XpChip xp={m.xp} done={done} />
      </div>
      <span className="t-foot" style={{ color: 'var(--ink)' }}>
        {m.text}
      </span>
    </div>
  )
}

/** Inicio: la misión pendiente más reciente (y, recién cumplida, «Misión cumplida») */
export function HomeMission() {
  const t = useTranslations('missions')
  const { data } = useMissions()
  if (!data) return null
  const m = data.pending[0]
  const done = data.recentDone[0]
  const recent = !!done // (el servidor solo devuelve las cumplidas en las últimas 6 horas)
  if (!m && !recent) return null
  return (
    <div className="card flex flex-col gap-2.5">
      {recent && (
        <div className="flex items-center gap-2.5">
          <span className="ava flex-none rounded-full" style={{ background: 'var(--up)', color: '#fff' }} aria-hidden>
            <Icon name="check" size={18} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block">{t('doneTitle')}</b>
            <span className="t-cap line-clamp-2">{done.text}</span>
          </span>
          <XpChip xp={done.xp} done />
        </div>
      )}
      {m && (
        <>
          <div className="flex items-center justify-between gap-2">
            <b className="t-head">{t('pendingTitle')}</b>
            <XpChip xp={m.xp} />
          </div>
          <span className="t-cap">{t('fromLesson', { title: m.lessonTitle })}</span>
          <MissionLink m={m} />
          {data.pending.length > 1 && <span className="t-cap">{t('more', { n: data.pending.length - 1 })}</span>}
        </>
      )}
    </div>
  )
}

/** Ficha de un activo: pista pequeña si una misión abierta pasa por aquí. Abrir la ficha ya cumple las de «abre X». */
export function AssetMission({ symbol }: { symbol: string }) {
  const t = useTranslations('missions')
  const qc = useQueryClient()
  const { data } = useMissions()
  const reported = useRef('')
  const here = (m: MissionT) => m.symbols.includes(symbol) || (m.kind === 'VIEW_ASSET' && !m.symbols.length)
  const viewHere = !!data?.pending.some(m => m.kind === 'VIEW_ASSET' && here(m))
  useEffect(() => {
    if (!viewHere || reported.current === symbol) return
    reported.current = symbol
    api.missionSeen({ symbol }).then(d => qc.setQueryData(['missions'], d)).catch(() => {})
  }, [viewHere, symbol, qc])
  const m = data?.pending.find(m => m.symbols.includes(symbol)) ?? data?.justDone.find(here)
  if (!m) return null
  const done = !!m.doneAt
  return (
    <div className="banner banner-info flex items-center gap-2" role="status">
      <Icon name={done ? 'check' : 'flag'} size={16} />
      <span className="min-w-0 flex-1 text-[14px]">{done ? t('hintDone', { xp: m.xp }) : t('hint', { text: m.text })}</span>
    </div>
  )
}
