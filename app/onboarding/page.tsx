'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    label: 'Paso 1 de 4', title: '¿Cuál es tu nivel?', sub: 'Sé honesto — esto personaliza tu experiencia.',
    options: [
      { ico: '🐣', txt: 'Principiante total', sub: 'Nunca he invertido ni sé cómo empezar' },
      { ico: '📚', txt: 'Algo de conocimiento', sub: 'He leído algo pero nunca he operado' },
      { ico: '📊', txt: 'Con algo de experiencia', sub: 'He hecho alguna inversión antes' },
    ],
  },
  {
    label: 'Paso 2 de 4', title: '¿Cuál es tu objetivo?', sub: 'Tu objetivo marca la ruta de aprendizaje.',
    options: [
      { ico: '🏠', txt: 'Comprar una vivienda', sub: 'Quiero hacer crecer mis ahorros para un gran objetivo' },
      { ico: '🌴', txt: 'Independencia financiera', sub: 'Quiero vivir de mis inversiones algún día' },
      { ico: '📈', txt: 'Aprender a invertir', sub: 'Quiero entender cómo funcionan los mercados' },
      { ico: '🧳', txt: 'Complementar ingresos', sub: 'Quiero un ingreso extra mensual' },
    ],
  },
  {
    label: 'Paso 3 de 4', title: '¿Cuánto riesgo toleras?', sub: 'Sin juicios — cada perfil tiene su estrategia.',
    options: [
      { ico: '🛡️', txt: 'Conservador', sub: 'Prefiero no perder aunque gane menos' },
      { ico: '⚖️', txt: 'Moderado', sub: 'Acepto algo de riesgo por mejores retornos' },
      { ico: '🚀', txt: 'Agresivo', sub: 'Busco maximizar ganancias asumiendo más riesgo' },
    ],
  },
  {
    label: 'Paso 4 de 4', title: '¿Cuánto tiempo tienes?', sub: 'Adaptamos los retos a tu disponibilidad.',
    options: [
      { ico: '⚡', txt: '5 minutos al día', sub: 'Solo tengo un momento' },
      { ico: '🕐', txt: '15 minutos al día', sub: 'Puedo dedicar un rato cada día' },
      { ico: '🕕', txt: '30 minutos o más', sub: 'Quiero aprender rápido' },
    ],
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const router = useRouter()

  const current = STEPS[step]
  const isSelected = selected[step] !== undefined

  function handleNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else router.push('/dashboard')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 100%)', pointerEvents: 'none' }} />

      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 22, padding: '2.75rem', width: '100%', maxWidth: 500, position: 'relative', zIndex: 2 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? 'rgba(0,212,122,.4)' : i === step ? 'var(--green)' : 'var(--border2)', transition: '.4s' }} />
          ))}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 7 }}>{current.label}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 800, marginBottom: 6 }}>{current.title}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem', fontWeight: 300 }}>{current.sub}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {current.options.map((opt, i) => (
            <div key={i} onClick={() => { const s = [...selected]; s[step] = i; setSelected(s) }} style={{
              border: `.5px solid ${selected[step] === i ? 'var(--green)' : 'var(--border2)'}`,
              background: selected[step] === i ? 'var(--gfaint)' : 'transparent',
              borderRadius: 12, padding: '13px 15px', cursor: 'pointer', transition: '.18s',
              display: 'flex', alignItems: 'center', gap: 13,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: selected[step] === i ? 'rgba(0,212,122,.15)' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {opt.ico}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{opt.txt}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleNext} disabled={!isSelected} style={{
          width: '100%', padding: 14, background: 'var(--green)', color: 'var(--bg)', border: 'none',
          borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700,
          cursor: isSelected ? 'pointer' : 'not-allowed', marginTop: '1.25rem', opacity: isSelected ? 1 : .3,
        }}>
          {step < STEPS.length - 1 ? 'Siguiente →' : '¡Empezar a aprender! →'}
        </button>
      </div>
    </div>
  )
}
