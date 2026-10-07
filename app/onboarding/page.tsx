'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CLASE_BY_ID } from '@/data/clases-contenido'
import { Icon, ICONS } from '@/components/ui/Icon'
import { btnPrimary, btnDisabled, card } from '@/components/ui/styles'

const STEPS: { q: string; h: string; o: [string, string][] }[] = [
  { q: '¿Cuánto sabes de inversión?', h: 'Sin juicios. Adaptamos las clases a tu punto de partida.', o: [['Nada, nunca he invertido', 'Empezamos desde cero'], ['Lo básico', 'He oído hablar de acciones y fondos'], ['Algo', 'He invertido alguna vez']] },
  { q: '¿Cuál es tu objetivo?', h: 'Puedes cambiarlo más adelante.', o: [['Entender cómo funciona', 'Perderle el miedo a la bolsa'], ['Hacer crecer mis ahorros', 'Pensando a largo plazo'], ['Prepararme para invertir de verdad', 'Practicar antes de usar dinero real']] },
  { q: 'Si tu inversión bajara un 20 %, ¿qué harías?', h: 'Nos ayuda a conocer tu perfil de riesgo.', o: [['Vendería todo', 'Prefiero no ver pérdidas'], ['Esperaría a ver qué pasa', 'Las bajadas son parte del camino'], ['Compraría más', 'Aprovecharía el precio más bajo']] },
  { q: '¿Cuánto tiempo puedes dedicar al día?', h: 'Una clase dura unos 10 minutos.', o: [['5 minutos', 'Un repaso rápido'], ['10 minutos', 'Una clase al día'], ['20 minutos o más', 'Clase y práctica en el simulador']] },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null])
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const first = CLASE_BY_ID.c1

  const s = STEPS[step]
  const sel = answers[step]

  async function next() {
    if (sel === null) return
    if (step < 3) { setStep(step + 1); return }
    setSaving(true)
    await fetch('/api/user/onboarding', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }),
    }).catch(() => {})
    setSaving(false)
    setReady(true)
  }

  const page: React.CSSProperties = {
    minHeight: '100dvh', maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column',
    padding: 'calc(8px + env(safe-area-inset-top, 0px)) 16px calc(24px + env(safe-area-inset-bottom, 0px))',
  }

  if (ready) {
    return (
      <div style={{ ...page, paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))', gap: 24 }}>
        <div style={{ width: 48, height: 48, border: '1px solid var(--green)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
          <Icon d={ICONS.check} size={24} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, font: '700 34px/41px var(--font)', letterSpacing: '-0.02em' }}>Tu plan está listo</h1>
          <p style={{ margin: 0, font: '400 17px/24px var(--font)', color: 'var(--text-secondary)' }}>Empezamos por lo esencial, 10 minutos al día.</p>
        </div>
        <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Tu saldo virtual</span>
          <span style={{ font: '600 40px/48px var(--font)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>10.000,00 €</span>
          <span style={{ font: '400 13px/18px var(--font)', color: 'var(--text-secondary)' }}>Dinero ficticio para practicar con precios reales.</span>
        </div>
        {first && (
          <div style={{ ...card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ font: '500 12px var(--font)', color: 'var(--text-secondary)' }}>Primera clase recomendada</span>
            <span style={{ font: '600 17px/22px var(--font)' }}>Clase 1 · {first.titulo}</span>
            <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Fundamentos · {first.duracion} · +{first.xp} XP</span>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => { router.push('/dashboard'); router.refresh() }} style={btnPrimary}>Ir a mi inicio</button>
      </div>
    )
  }

  return (
    <div style={page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44 }}>
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : router.push('/dashboard'))}
          aria-label={step > 0 ? 'Atrás' : 'Saltar'}
          style={{ width: 44, height: 44, marginLeft: -12, border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon d={step > 0 ? ICONS.back : ICONS.close} size={22} />
        </button>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {[0, 1, 2, 3].map(i => <i key={i} style={{ height: 4, background: i <= step ? 'var(--green)' : 'var(--surface-2)', transition: 'background 200ms ease-out' }} />)}
        </div>
        <span style={{ width: 32, textAlign: 'right', font: '500 12px var(--font)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{step + 1}/4</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '32px 0 24px' }}>
        <h1 style={{ margin: 0, font: '700 28px/34px var(--font)', letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}>{s.q}</h1>
        <p style={{ margin: 0, font: '400 15px/20px var(--font)', color: 'var(--text-secondary)' }}>{s.h}</p>
      </div>
      <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {s.o.map(([t, d], i) => {
          const on = sel === i
          return (
            <button
              key={t}
              role="radio"
              aria-checked={on}
              onClick={() => setAnswers(a => a.map((v, k) => (k === step ? i : v)))}
              style={{
                minHeight: 72, display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 6, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${on ? 'var(--green)' : 'var(--border)'}`, color: 'var(--text-primary)',
                background: on ? 'color-mix(in srgb, var(--green) 8%, var(--surface-1))' : 'var(--surface-1)',
                transition: 'border-color 150ms ease-out, background 150ms ease-out',
              }}
            >
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: '600 17px/22px var(--font)' }}>{t}</span>
                <span style={{ font: '400 15px/20px var(--font)', color: 'var(--text-secondary)' }}>{d}</span>
              </span>
              <span style={{
                width: 22, height: 22, flex: 'none', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-green)',
                border: `1.5px solid ${on ? 'var(--green)' : 'var(--text-tertiary)'}`, background: on ? 'var(--green)' : 'transparent',
              }}>
                {on && <Icon d={ICONS.check} size={14} stroke={2.5} />}
              </span>
            </button>
          )
        })}
      </div>
      <div style={{ flex: 1 }} />
      <button onClick={next} disabled={sel === null || saving} style={{ ...(sel === null ? btnDisabled : btnPrimary), marginTop: 24 }}>
        {step === 3 ? (saving ? 'Guardando…' : 'Ver mi plan') : 'Continuar'}
      </button>
    </div>
  )
}
