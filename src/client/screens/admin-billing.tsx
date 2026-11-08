'use client'
// Panel de administración: «Estudiantes» (solicitudes de precio de estudiante con su justificante) y «Grupos».
// El justificante solo lo ve el equipo (/api/uploads/student/<id> pide admin) y se borra al aprobar o rechazar.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { money } from '@/shared/format'
import { api, ApiFailure, type AdminStudents } from '../api'
import { useLang, useSession } from '../hooks'
import { useToast } from '../providers'

const PLAN = { PLUS: 'Plus', PREMIUM: 'Max' } as const

export function BillingAdmin({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3 lg:col-span-2">
      <StudentsAdmin onOpenUser={onOpenUser} />
      <GroupsAdmin onOpenUser={onOpenUser} />
    </div>
  )
}

function useDate() {
  const locale = useLang()
  return (s: string | null) => (s ? new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
}

function StudentsAdmin({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  const t = useTranslations('billing.admin')
  const date = useDate()
  const { data } = useQuery({ queryKey: ['admin-students'], queryFn: api.adminStudents })
  return (
    <section className="card flex flex-col gap-3" aria-labelledby="adm-students">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="adm-students" className="t-head m-0">
          {t('students')}
        </h2>
        <span className="t-cap">{data ? t('studentsPending', { n: data.pending.length }) : t('loading')}</span>
      </div>
      {data?.pending.map(r => <StudentRequest key={r.id} r={r} onOpenUser={onOpenUser} />)}
      {!!data?.decided.length && (
        <details>
          <summary className="t-foot cursor-pointer font-bold">{t('recent')}</summary>
          <div className="mt-2 flex flex-col gap-1">
            {data.decided.map(r => (
              <div key={r.id} className="kv items-center">
                <button className="link min-w-0 truncate px-0 text-left" onClick={() => onOpenUser(r.user.id)}>
                  {r.user.name} · <span className="t-cap">{r.user.email}</span>
                </button>
                <span className="t-cap flex-none text-right">
                  {t(`status${r.status}`)} · {date(r.decidedAt)}
                  {r.decidedBy ? ` · ${t('by', { who: r.decidedBy })}` : ''}
                  {r.note ? <><br />{r.note}</> : null}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  )
}

function StudentRequest({ r, onOpenUser }: { r: AdminStudents['pending'][number]; onOpenUser: (id: string) => void }) {
  const t = useTranslations('billing.admin')
  const tg = useTranslations('billing.group')
  const date = useDate()
  const toast = useToast()
  const qc = useQueryClient()
  const viewing = !!useSession().data?.viewAs
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const decide = useMutation({
    mutationFn: (approve: boolean) => api.adminDecideStudent(r.id, approve, approve ? undefined : note.trim()),
    onSuccess: (x, approve) => {
      toast(approve ? (x.switched ? t('approvedSwitched') : t('approved')) : t('rejected'))
      void qc.invalidateQueries({ queryKey: ['admin-students'] })
      void qc.invalidateQueries({ queryKey: ['admin-audit'] })
    },
    onError: e => toast(e instanceof ApiFailure ? e.message : t('failed')),
  })
  const src = `/api/uploads/student/${r.id}`
  const pdf = r.photoType === 'application/pdf'
  return (
    <div className="flex flex-col gap-2 rounded-2xl p-3" style={{ background: 'var(--surface-2)' }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <button className="link min-w-0 truncate px-0 text-left font-bold" onClick={() => onOpenUser(r.user.id)}>
          {r.user.name} · <span className="t-cap">{r.user.email}</span>
        </button>
        <span className="t-cap">
          {t('sent')} {date(r.createdAt)}
        </span>
      </div>
      <div className="kv">
        <span>{t('institution')}</span>
        <b className="min-w-0 text-right break-words">{r.institution}</b>
      </div>
      {r.studentEmail && (
        <div className="kv">
          <span>{t('studentEmail')}</span>
          <span className="min-w-0 text-right break-all">{r.studentEmail}</span>
        </div>
      )}
      {r.user.studentUntil && <span className="t-cap">{t('until', { date: date(r.user.studentUntil) })}</span>}
      {pdf ? (
        <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
          {t('openPdf')}
        </a>
      ) : (
        <a href={src} target="_blank" rel="noopener noreferrer" aria-label={t('openProof')} className="block overflow-hidden rounded-xl" style={{ background: 'var(--fill)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada, sin optimizar ni guardar en caché */}
          <img src={src} alt={t('proof')} className="mx-auto max-h-72 w-auto max-w-full object-contain" />
        </a>
      )}
      {rejecting ? (
        <div className="field">
          <label htmlFor={`rej-${r.id}`}>{t('rejectReason')}</label>
          <input id={`rej-${r.id}`} className="input" value={note} onChange={e => setNote(e.target.value)} maxLength={300} placeholder={t('rejectPh')} />
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-plain btn-sm" onClick={() => setRejecting(false)}>
              {tg('cancel')}
            </button>
            <button className="btn btn-primary btn-sm" style={{ background: 'var(--down)' }} disabled={viewing || note.trim().length < 3 || decide.isPending} onClick={() => decide.mutate(false)}>
              {t('confirmReject')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-secondary btn-sm" disabled={viewing || decide.isPending} onClick={() => setRejecting(true)}>
            {t('reject')}
          </button>
          <button className="btn btn-primary btn-sm" disabled={viewing || decide.isPending} onClick={() => decide.mutate(true)}>
            {t('approve')}
          </button>
        </div>
      )}
    </div>
  )
}

function GroupsAdmin({ onOpenUser }: { onOpenUser: (id: string) => void }) {
  const t = useTranslations('billing.admin')
  const tg = useTranslations('billing.group')
  const locale = useLang()
  const date = useDate()
  const { data } = useQuery({ queryKey: ['admin-groups'], queryFn: api.adminGroups })
  const color: Record<string, string> = { ACTIVE: 'var(--up)', PAST_DUE: 'var(--amber, #f5a623)', PENDING: 'var(--ink-2)', CANCELED: 'var(--ink-2)' }
  return (
    <section className="card flex flex-col gap-1" aria-labelledby="adm-groups">
      <h2 id="adm-groups" className="t-head m-0 mb-1">
        {t('groups')}
      </h2>
      {!data ? (
        <span className="t-cap">{t('loading')}</span>
      ) : !data.length ? (
        <span className="t-cap">{t('noGroups')}</span>
      ) : (
        data.map(g => (
          <div key={g.id} className="kv items-start gap-3 py-1.5">
            <span className="min-w-0 flex-1">
              <b className="block truncate">{g.name}</b>
              <button className="link max-w-full truncate px-0 text-left" onClick={() => onOpenUser(g.ownerId)}>
                {t('owner')}: {g.ownerName} · <span className="t-cap">{g.ownerEmail}</span>
              </button>
              <span className="t-cap block">
                {PLAN[g.tier]} · {tg(`sizes.${g.size as 4 | 8 | 0}`)} · {g.interval === 'YEAR' ? tg('perYear', { price: money(g.price, 'EUR', locale) }) : tg('perMonth', { price: money(g.price, 'EUR', locale) })}
                {g.student ? ` · ${t('student')}` : ''} · {date(g.createdAt)}
              </span>
            </span>
            <span className="flex-none text-right">
              <b className="tabular-nums">{g.size === 0 ? t('membersUnlimited', { n: g.members }) : t('membersOf', { n: g.members, seats: g.seats })}</b>
              <br />
              <span className="t-cap font-bold" style={{ color: color[g.status] }}>
                {t(`status.${g.status as 'ACTIVE'}`)}
              </span>
            </span>
          </div>
        ))
      )}
    </section>
  )
}
