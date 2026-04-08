'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Consent = 'all' | 'essential' | null

export default function CookieBanner() {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) {
      // Pequeño delay para no aparecer instantáneamente
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  function accept(type: Consent) {
    localStorage.setItem('cookie-consent', type ?? 'essential')
    setVisible(false)
  }

  function saveCustom() {
    const value = analytics || marketing ? 'custom' : 'essential'
    localStorage.setItem('cookie-consent', value)
    localStorage.setItem('cookie-analytics', String(analytics))
    localStorage.setItem('cookie-marketing', String(marketing))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: 'rgba(7,9,10,.97)', backdropFilter: 'blur(20px)',
      borderTop: '.5px solid var(--border2)',
      padding: expanded ? '24px' : '16px 24px',
      animation: 'slideUp .4s ease-out',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {!expanded ? (
          /* ── Versión compacta ─────────────────────────────── */
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>🍪 Usamos cookies</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                Usamos cookies esenciales para el funcionamiento de la plataforma y analíticas para mejorar tu experiencia.
                {' '}<Link href="/cookies" style={{ color: 'var(--green)', textDecoration: 'none' }}>Saber más</Link>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              <button
                onClick={() => setExpanded(true)}
                style={{ padding: '9px 16px', background: 'transparent', border: '.5px solid var(--border2)', borderRadius: 9, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
              >
                Configurar
              </button>
              <button
                onClick={() => accept('essential')}
                style={{ padding: '9px 16px', background: 'transparent', border: '.5px solid var(--border2)', borderRadius: 9, fontSize: 12, color: 'var(--white)', cursor: 'pointer' }}
              >
                Solo esenciales
              </button>
              <button
                onClick={() => accept('all')}
                style={{ padding: '9px 20px', background: 'var(--green)', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, color: 'var(--bg)', cursor: 'pointer' }}
              >
                Aceptar todas
              </button>
            </div>
          </div>
        ) : (
          /* ── Versión expandida ────────────────────────────── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Preferencias de cookies</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Puedes elegir qué tipos de cookies aceptas. Las esenciales son necesarias para el funcionamiento.
                </div>
              </div>
              <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <Toggle
                label="Cookies esenciales"
                desc="Necesarias para login, sesión y funcionalidades básicas."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              <Toggle
                label="Cookies analíticas"
                desc="Nos ayudan a entender cómo usas E-Trading para mejorarla."
                checked={analytics}
                onChange={setAnalytics}
              />
              <Toggle
                label="Cookies de marketing"
                desc="Permiten mostrarte anuncios relevantes de E-Trading en otras webs."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => accept('essential')} style={{ padding: '9px 18px', background: 'transparent', border: '.5px solid var(--border2)', borderRadius: 9, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>
                Solo esenciales
              </button>
              <button onClick={saveCustom} style={{ padding: '9px 18px', background: 'transparent', border: '.5px solid var(--green)', borderRadius: 9, fontSize: 12, color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}>
                Guardar preferencias
              </button>
              <button onClick={() => accept('all')} style={{ padding: '9px 22px', background: 'var(--green)', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, color: 'var(--bg)', cursor: 'pointer' }}>
                Aceptar todas
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes slideUp { from { transform:translateY(100%); opacity:0 } to { transform:translateY(0); opacity:1 } }`}</style>
    </div>
  )
}

function Toggle({ label, desc, checked, disabled, onChange }: {
  label: string, desc: string, checked: boolean, disabled?: boolean, onChange: (v: boolean) => void,
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '12px 14px', background: 'var(--bg1)', borderRadius: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</div>
      </div>
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 100, flexShrink: 0,
          background: checked ? 'var(--green)' : 'var(--bg3)',
          position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1, transition: 'background .2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left .2s',
        }} />
      </div>
    </div>
  )
}
