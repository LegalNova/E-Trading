'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'
import { useQuotes } from '@/hooks/useQuotes'
import { ASSET_BY_SYMBOL } from '@/data/assets'
import { PLANES } from '@/lib/plans'
import { syntheticSeries } from '@/lib/sim'
import { fprice, fpct } from '@/lib/format'
import { pathOf } from '@/components/ui/Spark'
import { Icon, ICONS } from '@/components/ui/Icon'
import { btnPrimary, btnSecondary, card, h2 } from '@/components/ui/styles'

const TICKER = ['AAPL', 'NVDA', 'BTC', 'SPY', 'MSFT', 'TSLA', 'ETH', 'ITX']

const VALUES = [
  { t: 'Simulador con precios reales', d: 'Compra y vende acciones, ETFs y cripto con 10.000 € virtuales.', icon: ICONS.market },
  { t: 'Clases de 10 minutos', d: '50 clases cortas, de lo más básico a estrategias avanzadas.', icon: ICONS.learn },
  { t: 'Profesora IA personal', d: 'Pregunta lo que quieras y entiende cada operación que haces.', icon: ICONS.chat },
]

const STEPS = [
  { t: 'Aprende lo básico', d: 'Una clase corta al día, a tu ritmo.' },
  { t: 'Practica sin riesgo', d: 'Invierte en el simulador con precios reales.' },
  { t: 'Gana confianza', d: 'Sube de nivel, mantén tu racha y compite en tu liga.' },
]

const FAQ: [string, string][] = [
  ['¿Se invierte dinero real?', 'No. Todo es una simulación con dinero virtual y precios reales del mercado. No puedes perder ni ganar dinero de verdad.'],
  ['¿Necesito saber algo antes?', 'No. Las clases empiezan desde cero y explican cada término la primera vez que aparece.'],
  ['¿Cuánto cuesta?', 'Puedes usar E-Trading gratis. Al registrarte tienes 7 días de Pro sin coste.'],
  ['¿Me recomendáis qué comprar?', 'No. E-Trading es educativo y no ofrece asesoramiento financiero.'],
]

const PLAN_DESC = (k: keyof typeof PLANES) => {
  const p = PLANES[k]
  if (p.clasesDia === null) return 'Todo ilimitado'
  return `${p.clasesDia} clases al día · ${p.opsSemana === null ? 'operaciones ilimitadas' : `${p.opsSemana} operaciones por semana`} · ${p.iaMsgsDia} mensajes de IA`
}

export default function LandingPage() {
  const { status } = useSession()
  const { quotes } = useQuotes(TICKER)
  const [faq, setFaq] = useState(0)
  const hero = useMemo(() => pathOf(syntheticSeries('hero', 100, 30 * 86_400_000, 40, 104.8), 196, 70), [])
  const tick = TICKER.map(s => ({ s, q: quotes[s], a: ASSET_BY_SYMBOL[s] })).filter(t => t.q && t.a)

  return (
    <div style={{ minHeight: '100dvh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'color-mix(in srgb, var(--bg) 90%, transparent)', backdropFilter: 'saturate(180%) blur(16px)', WebkitBackdropFilter: 'saturate(180%) blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', height: 52, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ font: '700 17px var(--font)', letterSpacing: '-0.02em' }}>E-Trading</span>
          {status === 'authenticated' ? (
            <Link href="/dashboard" style={{ font: '500 15px var(--font)' }}>Abrir la app</Link>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/login" style={{ height: 36, padding: '0 12px', display: 'flex', alignItems: 'center', color: 'var(--text-primary)', font: '500 15px var(--font)', textDecoration: 'none' }}>Iniciar sesión</Link>
              <Link href="/register" className="et-desktop-only" style={{ ...btnPrimary, height: 36, font: '600 15px var(--font)', padding: '0 14px', textDecoration: 'none' }}>Empieza gratis</Link>
            </span>
          )}
        </div>
      </header>

      {/* Cinta de precios reales */}
      <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)', minHeight: 37 }} aria-label="Precios de mercado">
        {tick.length > 0 && (
          <div style={{ display: 'flex', width: 'max-content', animation: 'etk 40s linear infinite' }}>
            {[...tick, ...tick].map((t, i) => {
              const up = t.q.changePercent >= 0
              return (
                <span key={i} style={{ display: 'flex', gap: 8, padding: '10px 16px', font: '500 12px var(--mono)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.s}</span>
                  <span>{fprice(t.q.price, t.a.currency)}</span>
                  <span style={{ color: up ? 'var(--green)' : 'var(--red)' }}>{fpct(t.q.changePercent)}</span>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <main style={{ maxWidth: 1040, margin: '0 auto' }}>
        <section className="lp-hero">
          <div style={{ padding: '40px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ font: '500 12px/16px var(--font)', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i style={{ width: 6, height: 6, background: 'var(--green)', display: 'block' }} />Precios reales · dinero virtual
            </span>
            <h1 className="lp-title" style={{ margin: 0, font: '700 34px/41px var(--font)', letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}>
              Aprende a invertir sin arriesgar ni un euro
            </h1>
            <p style={{ margin: 0, font: '400 17px/24px var(--font)', color: 'var(--text-secondary)', maxWidth: 480 }}>
              Empieza con 10.000 € virtuales y clases de 10 minutos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, maxWidth: 400 }}>
              <Link href={status === 'authenticated' ? '/dashboard' : '/register'} style={{ ...btnPrimary, textDecoration: 'none' }}>
                {status === 'authenticated' ? 'Ir a mi inicio' : 'Empieza gratis'}
              </Link>
              <Link href="/demo" style={{ ...btnSecondary, height: 48, textDecoration: 'none' }}>Ver el mercado en directo</Link>
            </div>
          </div>
          <div style={{ padding: '0 16px 40px' }}>
            <div style={{ ...card, padding: '16px 16px 0', display: 'flex', justifyContent: 'center' }} aria-hidden="true">
              <div style={{ width: 220, border: '1px solid var(--border)', borderBottom: 'none', borderRadius: '6px 6px 0 0', background: 'var(--bg)', padding: '16px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ font: '400 11px var(--font)', color: 'var(--text-secondary)' }}>Valor del portafolio</span>
                <span style={{ font: '600 24px var(--font)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>10.482,35 €</span>
                <span style={{ font: '500 11px var(--font)', color: 'var(--green)' }}>▲ +38,10 € hoy</span>
                <svg viewBox="0 0 196 70" preserveAspectRatio="none" style={{ width: '100%', height: 70, display: 'block' }}>
                  <path d={hero} fill="none" stroke="var(--green)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-values" style={{ padding: '0 16px 40px', borderTop: '1px solid var(--border)' }}>
          {VALUES.map(v => (
            <div key={v.t} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, flex: 'none', border: '1px solid var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                <Icon d={v.icon} size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '600 17px/22px var(--font)' }}>{v.t}</span>
                <span style={{ font: '400 15px/20px var(--font)', color: 'var(--text-secondary)' }}>{v.d}</span>
              </div>
            </div>
          ))}
        </section>

        <section style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={h2}>Cómo funciona</h2>
          {STEPS.map((s, i) => (
            <div key={s.t} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ width: 28, height: 28, flex: 'none', border: '1px solid var(--text-primary)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px var(--font)' }}>{i + 1}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: '600 17px/22px var(--font)' }}>{s.t}</span>
                <span style={{ font: '400 15px/20px var(--font)', color: 'var(--text-secondary)' }}>{s.d}</span>
              </div>
            </div>
          ))}
        </section>

        <section id="precios" style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ ...h2, marginBottom: 4 }}>Planes</h2>
          <div className="lp-plans">
            {(['free', 'starter', 'pro', 'elite'] as const).map(k => {
              const p = PLANES[k]
              const rec = k === 'pro'
              return (
                <div key={k} style={{ ...card, borderColor: rec ? 'var(--green)' : 'var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ font: '600 17px var(--font)', color: k === 'elite' ? 'var(--gold)' : 'var(--text-primary)' }}>{p.label}</span>
                      {rec && <span style={{ font: '500 12px var(--font)', padding: '2px 6px', borderRadius: 2, color: 'var(--green)', background: 'color-mix(in srgb, var(--green) 12%, transparent)' }}>Recomendado</span>}
                    </span>
                    <span style={{ font: '600 17px var(--font)', fontVariantNumeric: 'tabular-nums' }}>
                      {p.precio} €<span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>{p.precio ? ' /mes' : ''}</span>
                    </span>
                  </div>
                  <span style={{ font: '400 13px/18px var(--font)', color: 'var(--text-secondary)' }}>{PLAN_DESC(k)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section style={{ padding: '0 16px 40px', maxWidth: 720 }}>
          <h2 style={{ ...h2, marginBottom: 8 }}>Preguntas frecuentes</h2>
          {FAQ.map(([q, a], i) => (
            <div key={q} style={{ borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i}
                style={{ width: '100%', minHeight: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, border: 'none', background: 'none', color: 'var(--text-primary)', font: '500 17px/22px var(--font)', textAlign: 'left', padding: '12px 0', cursor: 'pointer' }}>
                {q}
                <span style={{ font: '400 20px var(--font)', color: 'var(--text-secondary)', width: 16, textAlign: 'center' }}>{faq === i ? '−' : '+'}</span>
              </button>
              {faq === i && <p style={{ margin: '0 0 16px', font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>{a}</p>}
            </div>
          ))}
        </section>
      </main>

      <footer style={{ padding: '24px 16px 40px', borderTop: '1px solid var(--border)', background: 'var(--surface-1)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ font: '700 15px var(--font)' }}>E-Trading</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, font: '400 13px var(--font)' }}>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/aviso-legal">Aviso legal</Link>
          </div>
          <span style={{ font: '400 12px/16px var(--font)', color: 'var(--text-secondary)' }}>Simulación educativa · No es asesoramiento financiero. © 2026 E-Trading</span>
        </div>
      </footer>
    </div>
  )
}
