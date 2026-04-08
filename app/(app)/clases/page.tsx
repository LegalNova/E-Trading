'use client'
import { useState } from 'react'
import { CLASES, ClaseCategoria } from '@/data/clases'

const CATEGORIAS: { key: ClaseCategoria | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'fundamentos', label: 'Fundamentos' },
  { key: 'riesgo', label: 'Riesgo' },
  { key: 'macroeconomia', label: 'Macro' },
  { key: 'estrategia', label: 'Estrategia' },
  { key: 'analisis-tecnico', label: 'Técnico' },
  { key: 'criptomonedas', label: 'Cripto' },
  { key: 'etfs', label: 'ETFs' },
]

const PLAN_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: 'var(--gfaint)', color: 'var(--green)', label: 'Free' },
  starter: { bg: 'rgba(66,165,245,.1)', color: 'var(--blue)', label: 'Starter' },
  pro: { bg: 'rgba(153,69,255,.1)', color: 'var(--purple)', label: 'Pro' },
  elite: { bg: 'rgba(255,215,0,.1)', color: 'var(--gold)', label: 'Elite' },
}

export default function ClasesPage() {
  const [cat, setCat] = useState<ClaseCategoria | 'todas'>('todas')
  const filtradas = cat === 'todas' ? CLASES : CLASES.filter(c => c.categoria === cat)

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Clases</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>12 clases · 6 categorías · De principiante a experto</div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIAS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} style={{
            padding: '6px 14px', borderRadius: 100,
            border: `.5px solid ${cat === c.key ? 'var(--green)' : 'var(--border2)'}`,
            background: cat === c.key ? 'var(--gfaint)' : 'transparent',
            color: cat === c.key ? 'var(--green)' : 'var(--muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{c.label}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {filtradas.map(clase => {
          const badge = PLAN_BADGE[clase.plan]
          const locked = clase.plan !== 'free'
          return (
            <div key={clase.id} style={{
              background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14,
              padding: 18, cursor: 'pointer', transition: '.15s', opacity: locked ? 0.7 : 1,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Number */}
              <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800, color: 'var(--border2)', lineHeight: 1 }}>
                {String(clase.numero).padStart(2, '0')}
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: badge.bg, color: badge.color, border: `.5px solid ${badge.color}40` }}>
                  {badge.label}
                </span>
              </div>

              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>
                {clase.categoria.replace('-', ' ')}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                {clase.titulo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>
                {clase.descripcion}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>+{clase.xp} XP</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{clase.duracion} min</span>
                </div>
                {locked
                  ? <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔒 {badge.label}+</span>
                  : <button style={{ padding: '6px 14px', background: 'var(--green)', color: 'var(--bg)', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Empezar</button>
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
