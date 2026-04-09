'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

/* ─── Deterministic particles (no Math.random → no hydration errors) ──── */
const PARTICLES = [
  { id: 0, x: 8.3, y: 12.1, size: 2.1, dur: 14, delay: 0 },
  { id: 1, x: 15.7, y: 45.3, size: 1.4, dur: 18, delay: 1.2 },
  { id: 2, x: 22.4, y: 78.9, size: 3.0, dur: 11, delay: 0.6 },
  { id: 3, x: 31.0, y: 23.5, size: 1.8, dur: 16, delay: 2.4 },
  { id: 4, x: 38.6, y: 61.2, size: 2.5, dur: 13, delay: 1.8 },
  { id: 5, x: 44.1, y: 88.4, size: 1.2, dur: 19, delay: 3.0 },
  { id: 6, x: 52.8, y: 34.7, size: 2.8, dur: 12, delay: 0.3 },
  { id: 7, x: 60.3, y: 72.0, size: 1.6, dur: 17, delay: 2.1 },
  { id: 8, x: 67.9, y: 19.3, size: 2.3, dur: 10, delay: 1.5 },
  { id: 9, x: 74.5, y: 55.8, size: 1.9, dur: 15, delay: 0.9 },
  { id: 10, x: 82.1, y: 92.6, size: 1.3, dur: 20, delay: 3.6 },
  { id: 11, x: 89.7, y: 40.1, size: 2.6, dur: 11, delay: 1.1 },
  { id: 12, x: 5.2, y: 67.8, size: 1.7, dur: 14, delay: 4.2 },
  { id: 13, x: 18.9, y: 5.4, size: 2.9, dur: 9, delay: 2.7 },
  { id: 14, x: 27.6, y: 82.3, size: 1.5, dur: 16, delay: 0.4 },
  { id: 15, x: 35.0, y: 47.6, size: 2.2, dur: 13, delay: 3.3 },
  { id: 16, x: 48.4, y: 16.9, size: 1.1, dur: 18, delay: 1.9 },
  { id: 17, x: 56.1, y: 94.2, size: 2.7, dur: 12, delay: 5.1 },
  { id: 18, x: 63.7, y: 38.5, size: 1.4, dur: 17, delay: 0.7 },
  { id: 19, x: 71.3, y: 76.1, size: 3.0, dur: 10, delay: 4.5 },
  { id: 20, x: 79.0, y: 28.4, size: 1.8, dur: 19, delay: 2.2 },
  { id: 21, x: 86.5, y: 63.7, size: 2.4, dur: 11, delay: 1.3 },
  { id: 22, x: 93.2, y: 10.8, size: 1.6, dur: 15, delay: 3.8 },
  { id: 23, x: 11.8, y: 53.2, size: 2.0, dur: 14, delay: 0.2 },
  { id: 24, x: 24.3, y: 31.6, size: 1.3, dur: 20, delay: 5.5 },
]

const TICKER_ITEMS = [
  { sym: 'AAPL', chg: '+1.24%', up: true },
  { sym: 'BTC', chg: '+2.87%', up: true },
  { sym: 'TSLA', chg: '-0.83%', up: false },
  { sym: 'NVDA', chg: '+3.41%', up: true },
  { sym: 'ETH', chg: '+1.95%', up: true },
  { sym: 'SPY', chg: '+0.54%', up: true },
  { sym: 'AMZN', chg: '+1.12%', up: true },
  { sym: 'GOOGL', chg: '-0.31%', up: false },
  { sym: 'META', chg: '+2.18%', up: true },
  { sym: 'GOLD', chg: '+0.67%', up: true },
  { sym: 'EUR/USD', chg: '-0.12%', up: false },
  { sym: 'SOL', chg: '+4.23%', up: true },
]

const STEPS = [
  { n: '01', icon: '📚', title: 'Aprende', desc: 'Clases con vídeo real y teoría explicada desde cero. A tu ritmo, sin presión.' },
  { n: '02', icon: '🎯', title: 'Practica', desc: 'Retos interactivos y simulador con precios reales. Aprende haciendo, no memorizando.' },
  { n: '03', icon: '📈', title: 'Invierte', desc: 'Cuando domines el simulador, da el salto al mercado real con confianza y criterio.' },
]

const FEATURES = [
  {
    title: 'IA Profesora Personal',
    desc: 'Tu profesor de inversión disponible 24/7. Analiza tus operaciones, detecta sesgos conductuales y te guía hacia el siguiente nivel con contexto real de tu portafolio.',
    icon: '🤖',
    color: '#00D47A',
    mockup: 'chat',
  },
  {
    title: 'Mercado Real en Vivo',
    desc: 'Practica con precios reales de bolsa, cripto y forex. Más de 300 activos de todo el mundo actualizados en tiempo real.',
    icon: '📊',
    color: '#42A5F5',
    mockup: 'market',
  },
  {
    title: 'Sistema de Ligas',
    desc: 'Compite con otros usuarios en tu liga. Los mejores ascienden. La gamificación basada en investigación de Duolingo que hace que aprender sea adictivo.',
    icon: '🏆',
    color: '#F9A825',
    mockup: 'liga',
  },
]

const PLANS = [
  { id: 'free', name: 'Free', monthly: 0, annual: 0, features: ['5 clases/día', '5 ops/semana', '10 msgs IA/día', 'Acceso básico al mercado'], cta: 'Empezar gratis', highlight: false },
  { id: 'starter', name: 'Starter', monthly: 1, annual: 10, features: ['10 clases/día', '20 ops/semana', '20 msgs IA/día', 'Retos Fase 1-3', 'Retry en 1h'], cta: 'Empezar por 1€', highlight: false },
  { id: 'pro', name: 'Pro', monthly: 9, annual: 90, features: ['20 clases/día', 'Ops ilimitadas', '100 msgs IA/día', 'Todos los retos', 'Retry en 15min', 'Escudo de racha'], cta: 'Ir al Pro', highlight: true },
  { id: 'elite', name: 'Elite', monthly: 16, annual: 160, features: ['Todo ilimitado', 'IA sin límites', 'Retry inmediato', 'Acceso anticipado', 'Soporte prioritario'], cta: 'Ir al Elite', highlight: false },
]

const FAQS = [
  { q: '¿Necesito experiencia previa?', a: 'No. Empezamos desde cero absoluto. La primera fase está diseñada para personas que nunca han invertido ni un euro.' },
  { q: '¿Es dinero real?', a: 'No. Todo es simulación educativa con precios reales del mercado. No hay riesgo financiero real en ningún momento.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí, sin permanencia ni penalizaciones. Cancelas cuando quieras desde tu perfil en un clic.' },
  { q: '¿Qué diferencia hay entre los planes?', a: 'Más clases por día, más operaciones en el simulador, más mensajes de IA y acceso a retos avanzados. El plan Free es suficiente para empezar.' },
  { q: '¿Cuándo estaré listo para invertir de verdad?', a: 'Depende de tu ritmo. Entre 8 y 20 semanas. El reto final (Inversor Autónomo) marca el punto en que tienes criterio para decidir por ti mismo.' },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ChatMockup() {
  return (
    <div style={{ background: '#0C1014', borderRadius: 16, border: '.5px solid rgba(238,242,240,.08)', padding: 20, fontFamily: 'var(--sans, Mulish, sans-serif)' }}>
      {[
        { role: 'user', text: '¿Por qué bajó tanto TSLA hoy?' },
        { role: 'ai', text: 'Detecté **sesgo de recencia** en tu pregunta. La bajada de hoy (-3.2%) es normal en acciones de alta volatilidad. Tu posición sigue +18% en 3 meses. Acción sugerida: no hagas nada.' },
        { role: 'user', text: '¿Debería comprar más BTC?' },
        { role: 'ai', text: 'Cuidado con el **FOMO**. BTC subió +8% esta semana, pero ya tienes un 22% en cripto. Tu DPI de inversión dice máx. 20%. Completar el reto "Gestión del riesgo" te dará más contexto.' },
      ].map((m, i) => (
        <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
          <div style={{
            maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            background: m.role === 'user' ? 'rgba(0,212,122,.15)' : '#182030',
            border: `.5px solid ${m.role === 'user' ? 'rgba(0,212,122,.2)' : 'rgba(238,242,240,.06)'}`,
            fontSize: 12, lineHeight: 1.6, color: '#EEF2F0',
          }}>
            {m.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#00D47A' }}>{part}</strong> : part)}
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketMockup() {
  const MOCK = [
    { sym: 'AAPL', name: 'Apple', price: '185.42', chg: '+1.24%', up: true },
    { sym: 'NVDA', name: 'NVIDIA', price: '875.10', chg: '+3.41%', up: true },
    { sym: 'BTC', name: 'Bitcoin', price: '67.420', chg: '+2.87%', up: true },
    { sym: 'TSLA', name: 'Tesla', price: '174.89', chg: '-0.83%', up: false },
    { sym: 'ETH', name: 'Ethereum', price: '3.541', chg: '+1.95%', up: true },
  ]
  return (
    <div style={{ background: '#0C1014', borderRadius: 16, border: '.5px solid rgba(238,242,240,.08)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '.5px solid rgba(238,242,240,.06)', fontSize: 12, color: 'rgba(238,242,240,.45)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Activo</span><span>Precio</span><span>Cambio</span>
      </div>
      {MOCK.map(a => (
        <div key={a.sym} style={{ padding: '12px 20px', borderBottom: '.5px solid rgba(238,242,240,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{a.sym}</div>
            <div style={{ fontSize: 11, color: 'rgba(238,242,240,.35)' }}>{a.name}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>${a.price}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: a.up ? '#00D47A' : '#EF5350', background: a.up ? 'rgba(0,212,122,.1)' : 'rgba(239,83,80,.1)', padding: '3px 10px', borderRadius: 6 }}>{a.chg}</div>
        </div>
      ))}
    </div>
  )
}

function LigaMockup() {
  const USERS = [
    { pos: 1, name: 'carlos_m', xp: 1840, medal: '🥇' },
    { pos: 2, name: 'ana_garcia', xp: 1620, medal: '🥈' },
    { pos: 3, name: 'pedro_l', xp: 1410, medal: '🥉' },
    { pos: 4, name: 'TÚ', xp: 980, medal: null, isUser: true },
    { pos: 5, name: 'maria_s', xp: 870, medal: null },
  ]
  return (
    <div style={{ background: '#0C1014', borderRadius: 16, border: '.5px solid rgba(238,242,240,.08)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '.5px solid rgba(238,242,240,.06)', fontSize: 13, fontWeight: 700, color: '#F9A825' }}>
        🏆 Liga Analista — Semana actual
      </div>
      {USERS.map(u => (
        <div key={u.pos} style={{
          padding: '12px 20px', borderBottom: '.5px solid rgba(238,242,240,.04)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: u.isUser ? 'rgba(0,212,122,.06)' : 'transparent',
          borderLeft: u.isUser ? '2px solid #00D47A' : '2px solid transparent',
        }}>
          <span style={{ fontSize: 16, width: 28 }}>{u.medal ?? `#${u.pos}`}</span>
          <div style={{ flex: 1, fontSize: 13, fontWeight: u.isUser ? 700 : 400, color: u.isUser ? '#00D47A' : '#EEF2F0' }}>{u.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{u.xp} XP</div>
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#07090A', color: '#EEF2F0', fontFamily: 'var(--sans, Mulish, sans-serif)', overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(7,9,10,.9)' : 'transparent',
        borderBottom: scrolled ? '.5px solid rgba(238,242,240,.06)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all .3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00D47A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontWeight: 800, fontSize: 18 }}>E-Trading</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#como-funciona" style={{ fontSize: 13, color: 'rgba(238,242,240,.6)', textDecoration: 'none' }}>Cómo funciona</a>
          <a href="#precios" style={{ fontSize: 13, color: 'rgba(238,242,240,.6)', textDecoration: 'none' }}>Precios</a>
          <Link href="/demo" style={{ fontSize: 13, color: '#EEF2F0', textDecoration: 'none', padding: '7px 14px', border: '.5px solid rgba(238,242,240,.15)', borderRadius: 8 }}>Probar demo</Link>
          <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: '#07090A', background: '#00D47A', padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>Empezar gratis</Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,122,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(66,165,245,.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(153,69,255,.05) 0%,transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(238,242,240,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(238,242,240,.03) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%,black 20%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%,black 20%,transparent 100%)', pointerEvents: 'none' }} />

        {/* Particles */}
        {PARTICLES.map(p => (
          <div key={p.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: 'rgba(0,212,122,.4)', animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`, pointerEvents: 'none' }} />
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#00D47A', fontWeight: 600, marginBottom: 28 }}>
            🎓 La academia de trading más completa
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, maxWidth: 900, letterSpacing: '-0.02em' }}
        >
          Aprende trading<br />
          <span style={{ background: 'linear-gradient(90deg, #00D47A, #42A5F5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>de verdad.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(238,242,240,.6)', maxWidth: 580, lineHeight: 1.7, marginBottom: 40 }}
        >
          La plataforma educativa que convierte principiantes en inversores autónomos.<br />Sin dinero real. Sin riesgo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/register" style={{ padding: '14px 32px', background: '#00D47A', color: '#07090A', borderRadius: 10, fontFamily: 'var(--serif, Syne, sans-serif)', fontWeight: 800, fontSize: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Empezar gratis →
          </Link>
          <Link href="/demo" style={{ padding: '14px 28px', background: 'rgba(238,242,240,.06)', color: '#EEF2F0', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '.5px solid rgba(238,242,240,.12)' }}>
            Probar demo sin registro
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(238,242,240,.4)' }}
        >
          {['Sin tarjeta de crédito', '7 días Pro gratis', 'Cancela cuando quieras'].map((t, i) => (
            <span key={i}>✓ {t}</span>
          ))}
        </motion.div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────── */}
      <div style={{ borderTop: '.5px solid rgba(238,242,240,.06)', borderBottom: '.5px solid rgba(238,242,240,.06)', padding: '14px 0', overflow: 'hidden', background: 'rgba(12,16,20,.5)' }}>
        <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 32px', fontSize: 13, whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 700, color: '#EEF2F0' }}>{item.sym}</span>
              <span style={{ color: item.up ? '#00D47A' : '#EF5350', fontWeight: 600 }}>{item.chg}</span>
              <span style={{ color: 'rgba(238,242,240,.15)' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="como-funciona" style={{ padding: '120px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#00D47A', marginBottom: 16 }}>MÉTODO</div>
            <h2 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
              De cero a inversor<br />en 3 pasos
            </h2>
            <p style={{ color: 'rgba(238,242,240,.5)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              Un camino estructurado que funciona. Basado en investigación de gamificación y psicología del aprendizaje.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {STEPS.map((step, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div style={{
                background: '#0C1014', border: '.5px solid rgba(238,242,240,.07)',
                borderRadius: 20, padding: 32, position: 'relative',
                transition: 'border-color .2s, transform .2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,122,.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(238,242,240,.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: 'rgba(0,212,122,.5)', marginBottom: 20 }}>{step.n}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(238,242,240,.5)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section style={{ padding: '40px 24px 120px', maxWidth: 1100, margin: '0 auto' }}>
        {FEATURES.map((feat, i) => (
          <FadeIn key={i} delay={0.1}>
            <div style={{
              display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
              gap: 60, alignItems: 'center', marginBottom: 100,
              direction: i % 2 === 1 ? 'rtl' : 'ltr',
            }}>
              <div style={{ direction: 'ltr' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{feat.icon}</div>
                <h3 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>{feat.title}</h3>
                <p style={{ fontSize: 16, color: 'rgba(238,242,240,.55)', lineHeight: 1.8 }}>{feat.desc}</p>
              </div>
              <div style={{ direction: 'ltr' }}>
                {feat.mockup === 'chat' && <ChatMockup />}
                {feat.mockup === 'market' && <MarketMockup />}
                {feat.mockup === 'liga' && <LigaMockup />}
              </div>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="precios" style={{ padding: '120px 24px', background: 'rgba(12,16,20,.5)', borderTop: '.5px solid rgba(238,242,240,.06)', borderBottom: '.5px solid rgba(238,242,240,.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#00D47A', marginBottom: 16 }}>PLANES</div>
              <h2 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, marginBottom: 24 }}>Empieza gratis,<br />escala cuando quieras</h2>

              {/* Toggle */}
              <div style={{ display: 'inline-flex', background: '#0C1014', border: '.5px solid rgba(238,242,240,.08)', borderRadius: 100, padding: 4, gap: 2 }}>
                {['Mensual', 'Anual'].map((label, i) => (
                  <button key={i} onClick={() => setAnnual(i === 1)} style={{
                    padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: annual === (i === 1) ? '#00D47A' : 'transparent',
                    color: annual === (i === 1) ? '#07090A' : 'rgba(238,242,240,.55)',
                    transition: 'all .2s',
                  }}>{label}{i === 1 && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(0,212,122,.15)', color: '#00D47A', padding: '2px 6px', borderRadius: 4 }}>2 meses gratis</span>}</button>
                ))}
              </div>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {PLANS.map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{
                  background: plan.highlight ? 'rgba(0,212,122,.06)' : '#0C1014',
                  border: `.5px solid ${plan.highlight ? 'rgba(0,212,122,.35)' : 'rgba(238,242,240,.07)'}`,
                  borderRadius: 20, padding: 28, position: 'relative',
                }}>
                  {plan.highlight && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#00D47A', color: '#07090A', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                      Más popular
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 40, fontWeight: 800, marginBottom: 4 }}>
                    {plan.monthly === 0 ? '0€' : `${annual ? plan.annual : plan.monthly}€`}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(238,242,240,.35)', marginBottom: 24 }}>
                    {plan.monthly === 0 ? 'Siempre gratis' : annual ? '/año' : '/mes'}
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ fontSize: 13, color: 'rgba(238,242,240,.65)', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#00D47A', flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <Link href={plan.monthly === 0 ? '/register' : '/precios'} style={{
                    display: 'block', textAlign: 'center', padding: '11px',
                    background: plan.highlight ? '#00D47A' : 'rgba(238,242,240,.06)',
                    color: plan.highlight ? '#07090A' : '#EEF2F0',
                    border: `.5px solid ${plan.highlight ? 'transparent' : 'rgba(238,242,240,.1)'}`,
                    borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  }}>{plan.cta}</Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', maxWidth: 700, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, textAlign: 'center', marginBottom: 56 }}>Preguntas frecuentes</h2>
        </FadeIn>
        {FAQS.map((faq, i) => (
          <FadeIn key={i} delay={i * 0.07}>
            <div style={{ borderBottom: '.5px solid rgba(238,242,240,.08)' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#EEF2F0' }}
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>{faq.q}</span>
                <span style={{ fontSize: 20, color: 'rgba(238,242,240,.4)', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ fontSize: 14, color: 'rgba(238,242,240,.55)', lineHeight: 1.8, paddingBottom: 20 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────── */}
      <FadeIn>
        <section style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(0,212,122,.05)', border: '.5px solid rgba(0,212,122,.15)', borderRadius: 28, padding: '60px 40px' }}>
            <h2 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 16 }}>
              Empieza hoy.<br />Es gratis.
            </h2>
            <p style={{ color: 'rgba(238,242,240,.5)', fontSize: 16, marginBottom: 32 }}>
              Sin tarjeta de crédito. 7 días con el Plan Pro completo incluidos.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ padding: '14px 32px', background: '#00D47A', color: '#07090A', borderRadius: 10, fontFamily: 'var(--serif, Syne, sans-serif)', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
                Crear cuenta gratis →
              </Link>
              <Link href="/demo" style={{ padding: '14px 24px', background: 'transparent', color: '#EEF2F0', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '.5px solid rgba(238,242,240,.15)' }}>
                Probar demo primero
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ borderTop: '.5px solid rgba(238,242,240,.06)', padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#00D47A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontWeight: 800, fontSize: 16 }}>E-Trading</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(238,242,240,.4)', lineHeight: 1.7 }}>Aprende a invertir.<br />Sin riesgos.</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(238,242,240,.3)', marginBottom: 16 }}>Producto</div>
            {['Clases', 'Retos', 'Liga', 'IA Profesora'].map(l => (
              <div key={l} style={{ marginBottom: 10 }}><Link href="/login" style={{ fontSize: 13, color: 'rgba(238,242,240,.5)', textDecoration: 'none' }}>{l}</Link></div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(238,242,240,.3)', marginBottom: 16 }}>Legal</div>
            {[['Privacidad', '/privacidad'], ['Términos', '/terminos'], ['Cookies', '/cookies']].map(([l, h]) => (
              <div key={l} style={{ marginBottom: 10 }}><Link href={h} style={{ fontSize: 13, color: 'rgba(238,242,240,.5)', textDecoration: 'none' }}>{l}</Link></div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(238,242,240,.3)', marginBottom: 16 }}>Contacto</div>
            <div style={{ fontSize: 13, color: 'rgba(238,242,240,.5)' }}>hola@e-trading.app</div>
          </div>
        </div>
        <div style={{ borderTop: '.5px solid rgba(238,242,240,.06)', paddingTop: 24, fontSize: 12, color: 'rgba(238,242,240,.25)', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 E-Trading. Plataforma educativa.</span>
          <span>No somos asesores financieros. Toda la actividad es simulada.</span>
        </div>
      </footer>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: .3; }
          100% { transform: translateY(-20px) scale(1.2); opacity: .6; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
