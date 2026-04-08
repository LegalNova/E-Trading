'use client'
import { useState, useEffect } from 'react'

/* ─── 20 mensajes educativos rotativos (uno por día del año) ── */
const DAILY_MESSAGES = [
  { icon: '🧠', title: 'Sesgo del día: FOMO', text: 'Si BTC ya subió 40%, la pregunta no es "me lo perdí" sino "¿puede subir otro 40% desde aquí?". El FOMO lleva a comprar en máximos.' },
  { icon: '📊', title: 'Dato histórico', text: 'El DCA mensual en SPY supera al 80% de gestores activos a 20 años. La consistencia vence al talento.' },
  { icon: '⚖️', title: 'La regla del 1-2%', text: 'Con €10.000, máximo €200 en riesgo por operación. Esta regla evita que un error borre meses de trabajo.' },
  { icon: '🔥', title: 'El poder de la racha', text: 'Los usuarios con 7+ días de racha completaron 3.6x más retos. No es motivación, es hábito compuesto.' },
  { icon: '💡', title: 'Sesgo: Anclaje de precio', text: 'Ver NVDA a $800 cuando estaba a $500 no significa que esté caro. El precio anterior es irrelevante para el futuro.' },
  { icon: '📈', title: 'Interés compuesto', text: '€300/mes durante 30 años al 7% anual = €340.000. El tiempo, no el capital inicial, es tu mayor ventaja.' },
  { icon: '🛡️', title: 'El stop-loss es tu seguro', text: 'Un 20% de pérdida necesita un 25% de ganancia para recuperarse. Uno del 50%, un 100%. Protege primero.' },
  { icon: '🌍', title: 'Diversificación real', text: '15 acciones del mismo sector NO es diversificación. La correlación entre ellas es casi 1. Mezcla sectores y geografías.' },
  { icon: '🧪', title: 'Sesgo de recencia', text: 'Porque mercados bajaron en 2022 no significa que siempre bajarán. Los ciclos promedian 7-10 años.' },
  { icon: '📉', title: 'Los mejores días del mercado', text: 'Perderse los 10 mejores días en 20 años reduce la rentabilidad a la mitad. Time in market > timing the market.' },
  { icon: '🏛️', title: 'Tipos de interés y bolsa', text: 'Cuando el BCE sube tipos, los bonos compiten con las acciones. Las growth stocks sufren más que las value.' },
  { icon: '💎', title: 'ETFs vs acciones individuales', text: 'El 90% de gestores profesionales no bate al S&P 500 a 15 años. El índice gana por coste y consistencia.' },
  { icon: '🎯', title: 'Ratio riesgo/beneficio', text: 'Una operación con R:R 1:3 puede fallar el 60% de las veces y aún ser rentable. La matemática gana a las emociones.' },
  { icon: '🔄', title: 'El rebalanceo trimestral', text: 'Rebalancear obliga a vender lo que subió y comprar lo que bajó. Es comprar barato automáticamente.' },
  { icon: '🧭', title: 'El plan de inversión', text: 'Sin un plan escrito, cada noticia de Bloomberg se convierte en una nueva estrategia. El plan te protege de ti mismo.' },
  { icon: '📰', title: 'Sesgo de confirmación', text: '¿Buscas noticias positivas sobre el activo que ya compraste? Eso es sesgo de confirmación. Busca activamente lo negativo.' },
  { icon: '👑', title: 'El efecto disposición', text: 'Tendemos a vender ganadores pronto y mantener perdedores demasiado. Es lo contrario de lo óptimo.' },
  { icon: '🏃', title: 'Sobreconfianza', text: 'Tras 5 operaciones ganadoras en demo, la mayoría cree que puede operar mejor que el mercado. Spoiler: no puede.' },
  { icon: '🌱', title: 'Empezar pequeño, escalar', text: '€50/mes con 20 años es mejor que €500/mes con 40. El tiempo importa más que el tamaño de la posición.' },
  { icon: '🔬', title: 'Mentalidad de rebaño', text: 'Si todo el mundo habla de un activo en redes sociales, probablemente ya llegaste tarde. El mercado descuenta el consenso.' },
]

type BannerProps = {
  forceDismiss?: boolean
  className?: string
}

export function DashboardBanner({ forceDismiss }: BannerProps) {
  const [visible, setVisible] = useState(false)
  const [msg,     setMsg]     = useState(DAILY_MESSAGES[0])

  useEffect(() => {
    const key  = 'banner-dismissed-' + new Date().toDateString()
    const dismissed = localStorage.getItem(key)
    if (!dismissed) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
      setMsg(DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length])
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('banner-dismissed-' + new Date().toDateString(), '1')
    setVisible(false)
  }

  if (!visible || forceDismiss) return null

  return (
    <div style={{
      background: 'rgba(0,212,122,.06)', border: '.5px solid rgba(0,212,122,.2)',
      borderRadius: 14, padding: '14px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20,
      animation: 'fadeUp .4s ease-out',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{msg.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>{msg.title}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{msg.text}</div>
      </div>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}
      >✕</button>
    </div>
  )
}

/* ─── Banner de alerta antes de operar (mercado) ─────────── */
const TRADE_BANNER_KEY = 'trade-warning-count'
const TRADE_MAX_SHOWS  = 5

export function TradingAlertBanner({ onConfirm, onAnalyze }: {
  onConfirm: () => void
  onAnalyze: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const count = parseInt(localStorage.getItem(TRADE_BANNER_KEY) ?? '0')
    if (count < TRADE_MAX_SHOWS) setVisible(true)
  }, [])

  function confirm() {
    const count = parseInt(localStorage.getItem(TRADE_BANNER_KEY) ?? '0')
    localStorage.setItem(TRADE_BANNER_KEY, String(count + 1))
    setVisible(false)
    onConfirm()
  }

  if (!visible) return null

  return (
    <div style={{
      background: 'rgba(249,168,37,.08)', border: '.5px solid rgba(249,168,37,.3)',
      borderRadius: 14, padding: '16px 20px', marginBottom: 20,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--amber)', marginBottom: 8 }}>
        ⏸️ Un momento antes de operar
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 14 }}>
        ¿Ya analizaste por qué quieres esta operación? Si hay emoción implicada (FOMO, miedo a perder, euforia), espera 10 minutos.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={confirm} style={{ padding: '9px 18px', background: 'var(--amber)', color: 'var(--bg)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Sí, lo tengo claro
        </button>
        <button onClick={onAnalyze} style={{ padding: '9px 18px', background: 'transparent', border: '.5px solid var(--border2)', borderRadius: 9, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
          Analizar con E-AI →
        </button>
      </div>
    </div>
  )
}

/* ─── Banner de pérdidas en portafolio ───────────────────── */
export function LossBanner({ worstLoss }: { worstLoss: number }) {
  const [dismissed, setDismissed] = useState(false)

  if (worstLoss > -10 || dismissed) return null

  return (
    <div style={{
      background: 'rgba(239,83,80,.07)', border: '.5px solid rgba(239,83,80,.25)',
      borderRadius: 14, padding: '14px 18px', marginBottom: 20,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#EF5350', marginBottom: 4 }}>
          Tienes posiciones con pérdidas significativas ({worstLoss.toFixed(1)}%)
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          ¿Las mantienes por convicción o por el <strong>efecto disposición</strong>? (tendencia a evitar confirmar pérdidas). Pregunta a la IA.
        </div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
    </div>
  )
}

/* ─── Banner de racha en retos ───────────────────────────── */
export function RachaBanner({ racha }: { racha: number }) {
  const [dismissed, setDismissed] = useState(false)

  if (racha < 3 || dismissed) return null

  return (
    <div style={{
      background: 'rgba(249,168,37,.08)', border: '.5px solid rgba(249,168,37,.25)',
      borderRadius: 14, padding: '12px 16px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontSize: 20, animation: 'flame 2s ease-in-out infinite' }}>🔥</span>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--amber)' }}>
        <strong>{racha} días de racha.</strong> Los usuarios con 7+ días de racha terminan siendo inversores reales con mucha más frecuencia. ¡Sigue!
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
    </div>
  )
}

/* ─── Banner afiliado post-operación (mercado) ───────────── */
export function BrokerAffiliateBanner({ totalOps }: { totalOps: number }) {
  const [dismissed, setDismissed] = useState(false)

  if (totalOps < 10 || dismissed) return null

  function handleClick() {
    fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broker: 'degiro', source: 'simulator' }),
    }).catch(() => {})
    window.open(process.env.NEXT_PUBLIC_AFFILIATE_DEGIRO ?? 'https://www.degiro.es', '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{
      background: 'rgba(0,212,122,.05)', border: '.5px solid rgba(0,212,122,.2)',
      borderRadius: 14, padding: '14px 18px', marginTop: 12,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <span style={{ fontSize: 22 }}>🚀</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>
          ¿Listo para invertir dinero real?
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Llevas {totalOps}+ operaciones virtuales. DEGIRO te permite invertir desde 2€ con comisiones muy bajas.
        </div>
      </div>
      <button
        onClick={handleClick}
        style={{ padding: '8px 16px', background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
      >
        Ver DEGIRO →
      </button>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
    </div>
  )
}
