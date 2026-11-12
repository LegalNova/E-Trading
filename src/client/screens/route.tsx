'use client'
// Ruta del curso (auditoría TEM-5): la persona elige una de las dos rutas de partida (o el curso entero) y la ajusta
// unidad a unidad. Lumi recomienda y avisa de lo que hace falta antes de cada unidad. Nada queda bloqueado por la ruta.
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { CoursePathT, PathUnitT } from '@/shared/contract'
import { ordered, presetUnits, ROUTE_IDS, withoutUnit, withUnit, type RouteId, type RouteUnit } from '@/shared/route'
import { api } from '../api'
import { useLang, useMe, usePath } from '../hooks'
import { useToast } from '../providers'
import { Icon } from '../ui/icons'
import { ErrorState, PageSkeleton, TopBar } from '../ui/kit'
import { Lumi, stageOf } from '../ui/lumi'

type Base = RouteId | 'ALL'
/** Clases de contenido de una unidad (sin repasos ni retos finales), como en el resumen del curso */
const contentOf = (u: PathUnitT) => u.lessons.filter(l => !l.isUnitReview && !l.id.endsWith('boss'))
const sizeOf = (us: PathUnitT[]) => {
  const ls = us.flatMap(contentOf)
  return { lessons: ls.length, minutes: ls.reduce((a, l) => a + l.minutes, 0) }
}
const hoursOf = (minutes: number) => Math.max(1, Math.round(minutes / 60))
/** La entrada al curso no se puede quitar: sin ella no se abre nada */
const ESSENTIAL = 's0'

export function RouteEditor() {
  const { data: p, isError, refetch } = usePath()
  if (isError) return <ErrorState onRetry={refetch} />
  if (!p) return <PageSkeleton />
  return <Editor p={p} />
}

function Editor({ p }: { p: CoursePathT }) {
  const t = useTranslations('route')
  const locale = useLang()
  const router = useRouter()
  const toast = useToast()
  const qc = useQueryClient()
  const { data: me } = useMe()
  const course = useMemo(() => p.units.filter(u => !u.side), [p.units])
  const graph = useMemo<RouteUnit[]>(() => course.map(u => ({ id: u.id, section: u.section?.id ?? null, requires: u.section?.requires ?? [] })), [course])
  const byId = useMemo(() => new Map(course.map(u => [u.id, u])), [course])
  const [base, setBase] = useState<Base | null>(p.route ? p.route.preset : p.routeChosen ? 'ALL' : null)
  const [units, setUnits] = useState<string[]>(p.route?.units ?? [])
  const [note, setNote] = useState<string | null>(null)
  const hint = p.routeHint?.preset ?? null
  const forYou = new Set(p.routeHint?.sections ?? [])
  const list = (ids: string[]) => new Intl.ListFormat(locale, { type: 'conjunction' }).format(ids.map(id => `«${byId.get(id)?.title ?? id}»`))

  const pick = (b: Base) => {
    setBase(b)
    setUnits(b === 'ALL' ? [] : presetUnits(graph, b))
    setNote(b === 'ALL' ? null : t('notePreset'))
  }
  const toggle = (u: PathUnitT) => {
    if (units.includes(u.id)) {
      const r = withoutUnit(graph, units, u.id)
      setUnits(r.units)
      setNote(r.removed.length ? t('noteRemoved', { unit: u.title, deps: list(r.removed), n: r.removed.length }) : t('noteRemovedPlain', { unit: u.title }))
    } else {
      const r = withUnit(graph, units, u.id)
      setUnits(r.units)
      setNote(r.added.length ? t('noteAdded', { unit: u.title, needs: list(r.added), n: r.added.length }) : t('noteAddedPlain', { unit: u.title }))
    }
  }
  const save = useMutation({
    mutationFn: () => api.updateSettings({ route: { preset: base === 'ALL' ? null : base, units: base === 'ALL' ? [] : units } }),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: ['path'] }), qc.invalidateQueries({ queryKey: ['settings'] }), qc.invalidateQueries({ queryKey: ['home'] })])
      toast(t('saved'))
      router.push('/clases')
    },
    onError: () => toast(t('error')),
  })

  const preset = base === 'ALL' ? null : base
  const mine = ordered(graph, units, preset).map(id => byId.get(id)!).filter(Boolean)
  const rest = course.filter(u => !units.includes(u.id))
  const total = sizeOf(mine)
  const editing = base !== 'ALL' && (base !== null || units.length > 0)
  const canSave = base === 'ALL' || units.length > 0

  /** Una lista de unidades agrupada por sección, con el consejo de Lumi sobre cada sección */
  const groups = (us: PathUnitT[]) => {
    const out: { id: string; title: string; units: PathUnitT[] }[] = []
    for (const u of us) {
      const s = u.section
      if (!s) continue
      const last = out[out.length - 1]
      if (last?.id === s.id) last.units.push(u)
      else out.push({ id: s.id, title: s.title, units: [u] })
    }
    return out
  }
  const group = (g: { id: string; title: string; units: PathUnitT[] }, inRoute: boolean) => (
    <section key={`${inRoute ? 'in' : 'out'}-${g.id}`} className="flex flex-col gap-2" aria-label={g.title}>
      <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
        <span className="t-cap font-extrabold tracking-wide uppercase" style={{ color: 'var(--brand-ink)' }}>
          {g.title}
        </span>
        {!inRoute && forYou.has(g.id) && (
          <span className="chip text-[11px]" style={{ background: 'color-mix(in srgb, var(--brand) 14%, var(--surface))', color: 'var(--brand-ink)' }}>
            {t('forYou')}
          </span>
        )}
      </div>
      <span className="t-cap -mt-1 px-1">{t(`why.${g.id}`)}</span>
      {g.units.map(u => {
        const size = sizeOf([u])
        const essential = u.section?.id === ESSENTIAL
        return (
          <div key={u.id} className="card flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <b className="block">{u.title}</b>
              <span className="t-cap">{t('unitMeta', { n: size.lessons, min: size.minutes })}</span>
            </span>
            {inRoute && essential ? (
              <span className="chip flex-none text-[11px]" style={{ background: 'var(--fill)' }}>
                {t('essential')}
              </span>
            ) : (
              <button className={`btn btn-sm flex-none ${inRoute ? 'btn-secondary' : 'btn-primary'}`} onClick={() => toggle(u)} aria-label={t(inRoute ? 'removeAria' : 'addAria', { unit: u.title })}>
                {t(inRoute ? 'remove' : 'add')}
              </button>
            )}
          </div>
        )
      })}
    </section>
  )

  return (
    <>
      <TopBar back="/clases" title={t('title')} />
      <div className="pad">
        <div className="card flex items-start gap-3">
          <Lumi mood="HAPPY" size={44} skin={me?.companion.skinId} stage={stageOf(me?.level.n ?? 1)} label={me?.companion.name || 'Lumi'} />
          <p className="t-foot m-0 self-center" style={{ color: 'var(--ink)' }}>
            {t(`lumiPick.${hint ?? 'NONE'}`)}
          </p>
        </div>

        <h2 className="t-head mt-1 px-0.5">{t('step1')}</h2>
        <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={t('step1')}>
          {([...ROUTE_IDS, 'ALL'] as Base[]).map(b => {
            const size = sizeOf(b === 'ALL' ? p.units : presetUnits(graph, b).map(id => byId.get(id)!))
            const on = base === b
            return (
              <button
                key={b}
                role="radio"
                aria-checked={on}
                className="card flex items-center gap-3 text-left"
                style={{ outline: on ? '2px solid var(--brand)' : 'none', outlineOffset: -2 }}
                onClick={() => pick(b)}
              >
                <span className="min-w-0 flex-1">
                  <b className="t-head block">{t(`names.${b}`)}</b>
                  <span className="t-cap block">{t(`blurbs.${b}`)}</span>
                  <span className="t-cap mt-1 block font-bold">{t('count', { lessons: size.lessons, hours: hoursOf(size.minutes) })}</span>
                  {hint === b && (
                    <span className="chip mt-1.5 text-[11px]" style={{ background: 'color-mix(in srgb, var(--brand) 14%, var(--surface))', color: 'var(--brand-ink)' }}>
                      {t('recommended')}
                    </span>
                  )}
                </span>
                <span className="grid h-6 w-6 flex-none place-items-center rounded-full" style={{ border: `2px solid ${on ? 'var(--brand)' : 'var(--line)'}`, background: on ? 'var(--brand)' : 'transparent', color: 'var(--on-brand)' }}>
                  {on && <Icon name="check" size={14} />}
                </span>
              </button>
            )
          })}
        </div>

        {editing && (
          <>
            <h2 className="t-head mt-3 px-0.5">{t('step2')}</h2>
            <span className="t-cap -mt-2 px-0.5">{t('step2Hint')}</span>
            <h3 className="t-cap mt-1 px-0.5 font-extrabold">{t('inRoute')}</h3>
            {groups(mine).map(g => group(g, true))}
            {rest.length > 0 && (
              <>
                <div className="mt-4 flex items-center gap-2 px-0.5">
                  <h3 className="t-cap m-0 font-extrabold">{t('outRoute')}</h3>
                  <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
                </div>
                <span className="t-cap -mt-2 px-0.5">{t('outHint')}</span>
                {groups(rest).map(g => group(g, false))}
              </>
            )}
          </>
        )}
      </div>

      {/* Siempre a la vista: lo que Lumi acaba de hacer, lo que mide la ruta y el botón de guardar */}
      {base !== null && (
        <div className="sticky bottom-0 flex flex-col gap-2 px-4 pt-2.5 pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-3" style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
          {editing && note && (
            <p className="banner banner-info m-0" role="status" aria-live="polite">
              {note}
            </p>
          )}
          {editing && units.length > 0 && (
            <span className="t-cap px-0.5">
              <b>{t('total', { lessons: total.lessons, hours: hoursOf(total.minutes) })}</b> {t('pace', { pace: p.dailyGoalMinutes, days: Math.ceil(total.minutes / p.dailyGoalMinutes) })}
            </span>
          )}
          <button className="btn btn-primary" disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
            {t(base === 'ALL' ? 'saveAll' : 'save')}
          </button>
        </div>
      )}
    </>
  )
}
