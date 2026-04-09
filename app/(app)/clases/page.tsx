'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CLASES, ClaseCategoria } from '@/data/clases'
import { useSession } from 'next-auth/react'

const CATEGORIAS: { key: ClaseCategoria | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'fundamentos', label: 'Fundamentos' },
  { key: 'riesgo', label: 'Riesgo' },
  { key: 'macroeconomia', label: 'Macro' },
  { key: 'estrategia', label: 'Estrategia' },
  { key: 'analisis-tecnico', label: 'Técnico' },
  { key: 'criptomonedas', label: 'Cripto' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'forex', label: 'Forex' },
  { key: 'materias', label: 'Materias' },
  { key: 'opciones', label: 'Opciones' },
]

const PLAN_BADGE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  free:    { bg: 'rgba(0,212,122,.1)',   color: '#00D47A', border: 'rgba(0,212,122,.3)',  label: 'Free' },
  starter: { bg: 'rgba(66,165,245,.1)', color: '#42A5F5', border: 'rgba(66,165,245,.3)', label: 'Starter' },
  pro:     { bg: 'rgba(153,69,255,.1)', color: '#9945FF', border: 'rgba(153,69,255,.3)', label: 'Pro' },
  elite:   { bg: 'rgba(255,215,0,.1)',  color: '#FFD700', border: 'rgba(255,215,0,.3)',  label: 'Elite' },
}

const CAT_ICONS: Record<string, string> = {
  fundamentos: '📐', riesgo: '🛡️', macroeconomia: '🌍', estrategia: '🧭',
  'analisis-tecnico': '📈', criptomonedas: '₿', etfs: '🗂️', forex: '💱',
  materias: '🪙', opciones: '⚙️',
}

const DIFF_LABELS: Record<string, string> = {
  free: '★☆☆', starter: '★★☆', pro: '★★★', elite: '★★★',
}

export default function ClasesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userPlan = (session?.user as Record<string, unknown>)?.plan as string ?? 'free'

  const [cat, setCat] = useState<ClaseCategoria | 'todas'>('todas')
  const [completedIds, setCompletedIds] = useState<string[]>([])

  const planOrder: Record<string, number> = { free: 0, starter: 1, pro: 2, elite: 3, pro_trial: 2 }
  const userPlanLevel = planOrder[userPlan] ?? 0

  useEffect(() => {
    fetch('/api/progress/clase')
      .then(r => r.json())
      .then(d => { if (d.completedIds) setCompletedIds(d.completedIds) })
      .catch(() => {})
  }, [])

  const filtradas = cat === 'todas' ? CLASES : CLASES.filter(c => c.categoria === cat)
  const totalCompleted = completedIds.length

  function isLocked(plan: string): boolean {
    return planOrder[plan] > userPlanLevel
  }

  function handleOpen(claseId: string, locked: boolean) {
    if (locked) return
    router.push(`/clases/${claseId}`)
  }

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Clases</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {CLASES.length} clases · 10 categorías · De principiante a experto
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12,
        padding: '14px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Progreso</span>
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>
              {totalCompleted} / {CLASES.length} completadas
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(totalCompleted / CLASES.length) * 100}%`,
              background: 'linear-gradient(90deg,var(--green),#00F090)',
              borderRadius: 3, transition: 'width .6s',
            }} />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIAS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} style={{
            padding: '6px 14px', borderRadius: 100,
            border: `.5px solid ${cat === c.key ? 'var(--green)' : 'var(--border2)'}`,
            background: cat === c.key ? 'rgba(0,212,122,.08)' : 'transparent',
            color: cat === c.key ? 'var(--green)' : 'var(--muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
          }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid — 2 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {filtradas.map(clase => {
          const badge = PLAN_BADGE[clase.plan]
          const locked = isLocked(clase.plan)
          const done = completedIds.includes(clase.id)
          const icon = CAT_ICONS[clase.categoria] ?? '📚'
          const diff = DIFF_LABELS[clase.plan] ?? '★☆☆'

          return (
            <div
              key={clase.id}
              onClick={() => handleOpen(clase.id, locked)}
              style={{
                background: done ? 'rgba(0,212,122,.04)' : 'var(--bg1)',
                border: done
                  ? '.5px solid rgba(0,212,122,.25)'
                  : locked
                    ? '.5px solid rgba(238,242,240,.04)'
                    : '.5px solid var(--border2)',
                borderRadius: 14, padding: 18,
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.55 : 1,
                transition: 'all .15s', position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Number watermark */}
              <div style={{
                position: 'absolute', top: 8, right: 12,
                fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 800,
                color: 'var(--border2)', lineHeight: 1, opacity: 0.4, userSelect: 'none',
              }}>
                {String(clase.numero).padStart(2, '0')}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                  background: done ? 'rgba(0,212,122,.12)' : 'var(--bg2)',
                  border: `.5px solid ${done ? 'rgba(0,212,122,.2)' : 'var(--border2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {done ? '✅' : locked ? '🔒' : icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                      background: badge.bg, color: badge.color, border: `.5px solid ${badge.border}`,
                    }}>
                      {badge.label}
                    </span>
                    <span style={{
                      fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
                      letterSpacing: '.05em', fontWeight: 600,
                    }}>
                      {clase.categoria.replace('-', ' ')}
                    </span>
                    {clase.videoUrl && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100,
                        background: 'rgba(239,83,80,.1)', color: '#EF5350',
                        border: '.5px solid rgba(239,83,80,.25)',
                      }}>
                        ▶ Vídeo
                      </span>
                    )}
                  </div>

                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3, paddingRight: 40 }}>
                    {clase.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 12 }}>
                    {clase.descripcion}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>+{clase.xp} XP</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{clase.duracion} min</span>
                      <span style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '.05em' }}>{diff}</span>
                    </div>
                    {!locked && !done && (
                      <button style={{
                        padding: '5px 12px', background: 'var(--green)', color: 'var(--bg)',
                        borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}>
                        Empezar
                      </button>
                    )}
                    {done && (
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>Completada</span>
                    )}
                    {locked && (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔒 {badge.label}+</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
