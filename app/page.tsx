'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { BrokerSection } from '@/components/landing/BrokerSection'

/* ─── Animated counter hook ─────────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(target)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { ref, count }
}

/* ─── Floating particles (deterministic — no hydration errors) */
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
  { id: 25, x: 42.9, y: 99.1, size: 2.8, dur: 8, delay: 1.6 },
  { id: 26, x: 58.7, y: 58.7, size: 1.5, dur: 16, delay: 4.1 },
  { id: 27, x: 76.4, y: 85.3, size: 2.1, dur: 12, delay: 2.8 },
  { id: 28, x: 91.0, y: 44.9, size: 1.9, dur: 17, delay: 0.5 },
  { id: 29, x: 3.7, y: 97.4, size: 2.5, dur: 13, delay: 3.4 },
  { id: 30, x: 46.6, y: 7.2, size: 1.2, dur: 19, delay: 1.0 },
  { id: 31, x: 84.2, y: 22.8, size: 2.9, dur: 9, delay: 5.9 },
  { id: 32, x: 33.5, y: 69.5, size: 1.7, dur: 15, delay: 2.5 },
  { id: 33, x: 65.8, y: 13.4, size: 2.3, dur: 11, delay: 0.8 },
  { id: 34, x: 97.3, y: 80.6, size: 1.4, dur: 18, delay: 4.7 },
]

/* ─── Feature cards data ─────────────────────────────────── */
const FEATURES = [
  {
    icon: '🤖',
    title: 'E-AI Profesora Personal',
    desc: 'IA entrenada en inversión que conoce tu nivel, tu portafolio y tu historial. Responde en segundos con contexto real.',
    color: '#00D47A',
    gradient: 'linear-gradient(135deg,rgba(0,212,122,.15),rgba(0,212,122,.03))',
  },
  {
    icon: '📊',
    title: 'Mercado Real en Tiempo Real',
    desc: '133+ activos reales — acciones, cripto, ETFs, forex, materias primas. Precios actualizados al instante vía Finnhub.',
    color: '#42A5F5',
    gradient: 'linear-gradient(135deg,rgba(66,165,245,.15),rgba(66,165,245,.03))',
  },
  {
    icon: '🏆',
    title: 'Liga Semanal Competitiva',
    desc: 'Compite con 30 traders en tu liga. Top 7 ascienden cada lunes. 10 niveles: de Novato a Leyenda.',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,215,0,.03))',
  },
  {
    icon: '🎯',
    title: '100 Retos en 7 Fases',
    desc: 'Ruta de aprendizaje estructurada de 20 semanas. Cada reto con MCQ, simulador y reflexión guiada.',
    color: '#9945FF',
    gradient: 'linear-gradient(135deg,rgba(153,69,255,.15),rgba(153,69,255,.03))',
  },
  {
    icon: '💰',
    title: 'Simulador Sin Riesgo',
    desc: 'Opera con 10.000€ virtuales. Compra, vende, pierde, aprende. Sin dinero real, con aprendizaje real.',
    color: '#F9A825',
    gradient: 'linear-gradient(135deg,rgba(249,168,37,.15),rgba(249,168,37,.03))',
  },
]

/* ─── Steps data ─────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Crea tu cuenta gratis',
    desc: 'En 60 segundos. Sin tarjeta de crédito. Empiezas con 10.000€ virtuales y acceso inmediato a los primeros retos.',
    color: '#00D47A',
  },
  {
    num: '02',
    title: 'Aprende haciendo',
    desc: 'Opera en el mercado real, completa retos, habla con E-AI. Cada acción te enseña algo concreto y acumula XP.',
    color: '#42A5F5',
  },
  {
    num: '03',
    title: 'Conviértete en inversor',
    desc: 'En 20 semanas pasas de no saber nada a tener un criterio propio y una estrategia clara. Con certificado incluido.',
    color: '#9945FF',
  },
]

/* ─── Pricing plans ──────────────────────────────────────── */
const PLANS = [
  {
    id: 'free', name: 'Free',
    monthlyPrice: 0, annualPrice: 0, unit: '€/mes',
    color: 'var(--muted)', highlight: false,
    features: ['5 clases/día', '5 ops/semana', '10 msgs IA/día', '15 retos gratuitos'],
    cta: 'Empezar gratis',
  },
  {
    id: 'starter', name: 'Starter',
    monthlyPrice: 1, annualPrice: 10, unit: '€/mes',
    color: '#42A5F5', highlight: false,
    features: ['10 clases/día', '20 ops/semana', '20 msgs IA/día', '25 retos desbloqueados'],
    cta: 'Probar Starter',
  },
  {
    id: 'pro', name: 'Pro',
    monthlyPrice: 9, annualPrice: 90, unit: '€/mes',
    color: '#00D47A', highlight: true,
    features: ['20 clases/día', 'Ops ilimitadas', '100 msgs IA/día', 'Todos los retos', 'Liga Pro'],
    cta: 'Elegir Pro',
    badge: 'Más popular',
  },
  {
    id: 'elite', name: 'Elite',
    monthlyPrice: 16, annualPrice: 160, unit: '€/mes',
    color: '#FFD700', highlight: false,
    features: ['Clases ilimitadas', 'Ops ilimitadas', 'IA ilimitada', 'Todos los retos', 'Liga Elite', 'Certificado'],
    cta: 'Ir Elite',
  },
]

/* ─── Testimonials ───────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Marta G.', role: 'Diseñadora, 28 años', text: 'En 3 semanas entendí cosas de inversión que nadie me había explicado nunca. La IA es como tener un mentor personal.', avatar: 'MG' },
  { name: 'Carlos R.', role: 'Estudiante, 22 años', text: 'La liga semanal es adictiva. Llevo 47 días de racha y ya sé qué es un ETF, el PER y cómo funciona la Fed.', avatar: 'CR' },
  { name: 'Ana P.', role: 'Profesora, 35 años', text: 'Nunca pensé que podría aprender a invertir. E-Trading lo hace tan sencillo y entretenido que no parece estudiar.', avatar: 'AP' },
]

/* ─── Section wrapper with animation ─────────────────────── */
function Section({ children, className = '', delay = 0, style = {} }: {
  children: React.ReactNode, className?: string, delay?: number, style?: React.CSSProperties
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ─── Ticker tape ────────────────────────────────────────── */
const TICKER = ['AAPL $189.42 ▲1.2%', 'NVDA $872.11 ▲3.4%', 'BTC $67,240 ▲2.1%', 'TSLA $241.56 ▼0.8%', 'ETH $3,498 ▲1.9%', 'SPY $521.18 ▲0.9%', 'META $513.33 ▲1.7%', 'GOLD $2,321 ▲0.3%', 'EUR/USD 1.0842 ▼0.1%', 'AMZN $187.71 ▲2.3%']

export default function LandingPage() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorHover, setCursorHover] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [billingAnnual, setBillingAnnual] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  /* stats counters */
  const c1 = useCounter(12847)
  const c2 = useCounter(50)
  const c3 = useCounter(133)
  const c4 = useCounter(98)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY })
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden', cursor: 'none' }}
      onMouseEnter={() => setCursorHover(false)}
    >
      {/* ── Custom cursor ─────────────────────────────────── */}
      <motion.div
        animate={{ x: cursorPos.x - (cursorHover ? 20 : 8), y: cursorPos.y - (cursorHover ? 20 : 8), scale: cursorHover ? 1.4 : 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35, mass: 0.3 }}
        style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          width: cursorHover ? 40 : 16, height: cursorHover ? 40 : 16,
          borderRadius: '50%',
          background: cursorHover ? 'transparent' : 'var(--green)',
          border: cursorHover ? '2px solid var(--green)' : 'none',
          mixBlendMode: 'difference',
          transition: 'width .2s, height .2s, background .2s',
        }}
      />

      {/* ── Sticky Nav ───────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 3rem',
          background: scrolled ? 'rgba(7,9,10,.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '.5px solid rgba(238,242,240,.06)' : 'none',
          transition: 'background .3s, backdrop-filter .3s',
        }}
      >
        <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 10 }}
            style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </motion.div>
          E-Trading
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['Características', 'Cómo funciona', 'Precios'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
              style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--white)'; setCursorHover(true) }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--muted)'; setCursorHover(false) }}
            >{item}</a>
          ))}
          <Link href="/login" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}
            onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
          >Iniciar sesión</Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/register"
              style={{ padding: '9px 22px', background: 'var(--green)', color: 'var(--bg)', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
            >Empezar gratis</Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <div ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(238,242,240,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(238,242,240,.04) 1px,transparent 1px)',
          backgroundSize: '54px 54px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%,black 5%,transparent 100%)',
        }} />

        {/* Animated glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 900, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(0,212,122,.18) 0%,transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', top: '60%', right: '10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(66,165,245,.18) 0%,transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', bottom: '20%', left: '8%',
            width: 350, height: 350, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(153,69,255,.18) 0%,transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size, borderRadius: '50%',
              background: 'var(--green)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Hero content — parallax */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, padding: '0 2rem' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '.5px solid rgba(0,212,122,.35)', background: 'rgba(0,212,122,.08)',
              padding: '6px 18px', borderRadius: 100, fontSize: 11, fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '2rem',
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'block' }}
            />
            Simulación educativa · Sin dinero real
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(48px,8vw,96px)', fontWeight: 800,
              lineHeight: 0.92, letterSpacing: '-.05em', marginBottom: '1.6rem',
            }}
          >
            <span style={{ color: 'var(--green)' }}>Aprende</span> a<br />
            invertir de<br />
            <span style={{ WebkitTextStroke: '1.5px rgba(238,242,240,.22)', color: 'transparent' }}>verdad</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 18, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 2.5rem' }}
          >
            De principiante absoluto a inversor autónomo en 20 semanas.
            IA personalizada, mercado real y gamificación que engancha.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register"
                style={{
                  background: 'var(--green)', color: 'var(--bg)', padding: '16px 40px',
                  borderRadius: 12, fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 0 40px rgba(0,212,122,.3)',
                }}
                onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
              >
                Empezar gratis → <span style={{ fontSize: 11, opacity: .7 }}>0€</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login"
                style={{
                  color: 'var(--muted)', fontSize: 14, border: '.5px solid var(--border2)',
                  borderRadius: 12, padding: '16px 28px', textDecoration: 'none',
                  background: 'rgba(255,255,255,.03)', backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
              >
                Ver demo →
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center',
              border: '.5px solid var(--border2)', borderRadius: 16, padding: '1rem 2.5rem',
              background: 'rgba(12,16,20,.9)', backdropFilter: 'blur(20px)',
            }}
          >
            {[
              { num: '12,847+', lbl: 'Usuarios activos' },
              { num: '50', lbl: 'Retos diseñados' },
              { num: '133+', lbl: 'Activos reales' },
              { num: '20 sem', lbl: 'Al inversor autónomo' },
            ].map(s => (
              <div key={s.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 800, color: 'var(--green)' }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <div style={{ fontSize: 10, color: 'var(--muted2)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(var(--green),transparent)' }} />
        </motion.div>
      </div>

      {/* ── Ticker tape ──────────────────────────────────── */}
      <div style={{ background: 'var(--bg1)', borderTop: '.5px solid var(--border)', borderBottom: '.5px solid var(--border)', overflow: 'hidden', padding: '10px 0' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap', fontSize: 12, fontFamily: 'var(--serif)', fontWeight: 600 }}
        >
          {[...TICKER, ...TICKER].map((t, i) => {
            const up = t.includes('▲')
            return (
              <span key={i} style={{ color: up ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                {t}
              </span>
            )
          })}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════════════════ */}
      <section id="caracteristicas" style={{ padding: '100px 3rem', maxWidth: 1200, margin: '0 auto' }}>
        <Section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { ref: c1.ref, count: c1.count, suffix: '+', label: 'Usuarios aprendiendo', icon: '👤' },
            { ref: c2.ref, count: c2.count, suffix: '', label: 'Retos diseñados', icon: '🎯' },
            { ref: c3.ref, count: c3.count, suffix: '+', label: 'Activos del mercado real', icon: '📊' },
            { ref: c4.ref, count: c4.count, suffix: '%', label: 'Satisfacción de usuarios', icon: '⭐' },
          ].map((s, i) => (
            <motion.div
              key={i}
              ref={s.ref}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,212,122,.08)' }}
              style={{
                background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 20,
                padding: '2rem', textAlign: 'center',
                transition: 'box-shadow .3s',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 42, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
                {s.count.toLocaleString()}{s.suffix}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{s.label}</div>
            </motion.div>
          ))}
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="como-funciona" style={{ padding: '80px 3rem 120px', background: 'var(--bg1)', borderTop: '.5px solid var(--border)', borderBottom: '.5px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              Cómo funciona
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 16 }}>
              Tres pasos para <span style={{ color: 'var(--green)' }}>transformarte</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Un camino diseñado para llevarte de cero conocimientos a inversor autónomo con criterio propio.
            </p>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                style={{
                  background: 'var(--bg)', border: '.5px solid var(--border2)', borderRadius: 24,
                  padding: '2.5rem', position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Number watermark */}
                <div style={{
                  position: 'absolute', top: -10, right: -6, fontFamily: 'var(--serif)',
                  fontSize: 120, fontWeight: 800, lineHeight: 1,
                  color: step.color, opacity: 0.06, userSelect: 'none', pointerEvents: 'none',
                }}>
                  {step.num}
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, background: `${step.color}18`,
                  border: `.5px solid ${step.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, color: step.color, marginBottom: 20,
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: '-.02em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>
                  {step.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: -22, transform: 'translateY(-50%)',
                    zIndex: 10, fontSize: 18, color: 'var(--border2)',
                  }}>→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 3rem', maxWidth: 1200, margin: '0 auto' }}>
        <Section style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Características
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 16 }}>
            Todo lo que necesitas para <br /><span style={{ color: 'var(--green)' }}>aprender a invertir</span>
          </h2>
        </Section>

        {/* Feature cards grid — 2+3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {FEATURES.slice(0, 2).map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, boxShadow: `0 30px 80px ${f.color}14` }}
              style={{
                background: f.gradient, border: `.5px solid ${f.color}28`,
                borderRadius: 24, padding: '2.5rem', cursor: 'default',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
            >
              <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: f.color, marginBottom: 12, letterSpacing: '-.02em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {FEATURES.slice(2).map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, boxShadow: `0 30px 80px ${f.color}14` }}
              style={{
                background: f.gradient, border: `.5px solid ${f.color}28`,
                borderRadius: 24, padding: '2.5rem', cursor: 'default',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: f.color, marginBottom: 10, letterSpacing: '-.02em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          APP MOCKUP / LIVE DEMO
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 3rem 120px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              La app
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,4vw,50px)', fontWeight: 800, letterSpacing: '-.04em' }}>
              Tu sala de trading <span style={{ color: 'var(--green)' }}>personal</span>
            </h2>
          </Section>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'var(--bg1)', border: '.5px solid var(--border2)',
              borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 60px 200px rgba(0,0,0,.8), 0 0 120px rgba(0,212,122,.06)',
            }}
          >
            {/* Mock browser bar */}
            <div style={{ background: 'var(--bg2)', padding: '12px 20px', borderBottom: '.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#EF5350', '#F9A825', '#00D47A'].map(c => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 6, padding: '5px 14px', fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>
                app.e-trading.com/dashboard
              </div>
            </div>

            {/* Mock dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 500 }}>
              {/* Sidebar */}
              <div style={{ background: 'var(--bg)', borderRight: '.5px solid var(--border)', padding: '20px 0' }}>
                <div style={{ padding: '0 16px', marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                    </div>
                    E-Trading
                  </div>
                </div>
                {[
                  { icon: '📊', label: 'Dashboard', active: true },
                  { icon: '🌐', label: 'Mercado', active: false },
                  { icon: '💼', label: 'Portafolio', active: false },
                  { icon: '📚', label: 'Clases', active: false },
                  { icon: '🎯', label: 'Retos', active: false },
                  { icon: '🤖', label: 'E-AI', active: false },
                  { icon: '🏆', label: 'Liga', active: false },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '10px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
                    background: item.active ? 'rgba(0,212,122,.08)' : 'transparent',
                    color: item.active ? 'var(--green)' : 'var(--muted)',
                    borderLeft: item.active ? '2px solid var(--green)' : '2px solid transparent',
                  }}>
                    <span>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignContent: 'start' }}>
                {/* Portfolio value */}
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg)', border: '.5px solid var(--border2)', borderRadius: 14, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Valor del portafolio</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800 }}>€11,432.80</div>
                    <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>▲ +€1,432.80 (+14.32%)</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[40, 55, 35, 62, 45, 70, 58, 80, 65, 90, 75, 95].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: h * 0.8 }} transition={{ delay: i * 0.05, duration: 0.4 }}
                        style={{ width: 6, background: h > 60 ? 'var(--green)' : 'var(--bg3)', borderRadius: 2, alignSelf: 'flex-end' }} />
                    ))}
                  </div>
                </div>

                {/* Mini cards */}
                {[
                  { label: 'AAPL', val: '$189.42', chg: '+1.23%', up: true },
                  { label: 'BTC', val: '$67,240', chg: '+2.14%', up: true },
                  { label: 'TSLA', val: '$241.56', chg: '-0.87%', up: false },
                ].map((card, i) => (
                  <div key={i} style={{ background: 'var(--bg)', border: '.5px solid var(--border2)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700 }}>{card.val}</div>
                    <div style={{ fontSize: 11, color: card.up ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>{card.chg}</div>
                  </div>
                ))}

                {/* XP Progress */}
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg)', border: '.5px solid var(--border2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 24 }}>⚡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Nivel 2 · Aficionado</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>847 / 1500 XP</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '56%' }} transition={{ delay: 0.5, duration: 0.8 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,var(--green),#00F090)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 3rem 120px', background: 'var(--bg1)', borderTop: '.5px solid var(--border)', borderBottom: '.5px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>Testimonios</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 800, letterSpacing: '-.04em' }}>
              Lo que dicen nuestros <span style={{ color: 'var(--green)' }}>traders</span>
            </h2>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                style={{
                  background: 'rgba(255,255,255,.03)', backdropFilter: 'blur(12px)',
                  border: '.5px solid var(--border2)', borderRadius: 20, padding: '2rem',
                }}
              >
                <div style={{ fontSize: 28, color: 'var(--green)', marginBottom: 16, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: 'var(--green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: 'var(--bg)',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BROKERS
      ══════════════════════════════════════════════════════ */}
      <BrokerSection />

      {/* ══════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════ */}
      <section id="precios" style={{ padding: '120px 3rem', maxWidth: 1200, margin: '0 auto' }}>
        <Section style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 16 }}>Precios</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 16 }}>
            Empieza gratis, <span style={{ color: 'var(--green)' }}>escala cuando quieras</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 420, margin: '0 auto', marginBottom: 32 }}>
            Sin contratos. Cancela en cualquier momento. Primera semana de Pro incluida gratis.
          </p>

          {/* Annual/monthly toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: billingAnnual ? 'var(--muted)' : 'var(--white)', fontWeight: billingAnnual ? 400 : 600, transition: 'color .2s' }}>Mensual</span>
            <div
              onClick={() => setBillingAnnual(v => !v)}
              style={{
                width: 48, height: 26, borderRadius: 100,
                background: billingAnnual ? 'var(--green)' : 'var(--bg3)',
                border: '.5px solid var(--border2)', cursor: 'pointer', position: 'relative',
                transition: 'background .25s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'var(--white)',
                position: 'absolute', top: 3, transition: 'left .25s',
                left: billingAnnual ? 26 : 4,
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: billingAnnual ? 'var(--white)' : 'var(--muted)', fontWeight: billingAnnual ? 600 : 400, transition: 'color .2s' }}>Anual</span>
              {billingAnnual && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'rgba(0,212,122,.12)', padding: '2px 8px', borderRadius: 100, border: '.5px solid rgba(0,212,122,.3)' }}>
                  2 meses gratis
                </span>
              )}
            </div>
          </div>
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {PLANS.map((plan, i) => {
            const displayPrice = billingAnnual && plan.annualPrice > 0
              ? plan.annualPrice
              : plan.monthlyPrice
            const displayUnit = billingAnnual && plan.annualPrice > 0 ? '€/año' : '€/mes'
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                style={{
                  background: plan.highlight ? `linear-gradient(135deg,rgba(0,212,122,.12),rgba(0,212,122,.04))` : 'var(--bg1)',
                  border: plan.highlight ? '1px solid rgba(0,212,122,.5)' : '.5px solid var(--border2)',
                  borderRadius: 24, padding: '2rem',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: plan.highlight ? '0 0 80px rgba(0,212,122,.12)' : 'none',
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'var(--green)', color: 'var(--bg)',
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                  }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24, transition: 'all .3s' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{displayPrice}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{displayUnit}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                      <span style={{ color: plan.highlight ? 'var(--green)' : plan.color, fontSize: 14 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/register" style={{
                    display: 'block', textAlign: 'center', padding: '12px',
                    background: plan.highlight ? 'var(--green)' : 'transparent',
                    color: plan.highlight ? 'var(--bg)' : plan.color,
                    border: plan.highlight ? 'none' : `.5px solid ${plan.color}55`,
                    borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  }}
                    onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
                  >{plan.cta}</Link>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 3rem 120px' }}>
        <Section>
          <motion.div
            whileInView={{ boxShadow: '0 0 120px rgba(0,212,122,.12)' }}
            viewport={{ once: true }}
            style={{
              maxWidth: 900, margin: '0 auto', textAlign: 'center',
              background: 'linear-gradient(135deg,rgba(0,212,122,.1),rgba(0,212,122,.03),rgba(66,165,245,.06))',
              border: '.5px solid rgba(0,212,122,.3)', borderRadius: 32, padding: '72px 3rem',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Background grid */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(0,212,122,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,122,.06) 1px,transparent 1px)',
              backgroundSize: '30px 30px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)',
              pointerEvents: 'none',
            }} />

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', top: -60, right: -60, width: 240, height: 240,
                borderRadius: '50%', border: '1px dashed rgba(0,212,122,.15)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 20 }}>
                Empieza hoy
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px,5vw,62px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 20 }}>
                Tu primer reto te espera.<br />
                <span style={{ color: 'var(--green)' }}>Sin excusas.</span>
              </h2>
              <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.7 }}>
                Miles de personas están aprendiendo ahora mismo. Únete y empieza a construir el futuro financiero que mereces.
              </p>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  background: 'var(--green)', color: 'var(--bg)',
                  padding: '18px 48px', borderRadius: 14,
                  fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 0 60px rgba(0,212,122,.4)',
                }}
                  onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
                >
                  Empezar gratis ahora →
                </Link>
              </motion.div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
                Sin tarjeta de crédito · Cancela cuando quieras · Primera semana Pro incluida
              </div>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '.5px solid var(--border)', padding: '60px 3rem 40px', background: 'var(--bg1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                </div>
                E-Trading
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 280 }}>
                La plataforma más efectiva para aprender a invertir de cero. Sin dinero real, con resultados reales.
              </p>
              <div style={{ marginTop: 20, fontSize: 11, color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                Simulación educativa · No es asesoramiento financiero
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Producto', links: ['Características', 'Cómo funciona', 'Precios', 'Retos', 'E-AI'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Careers', 'Prensa'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'Cookies', 'Contacto'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginBottom: 16, letterSpacing: '.04em' }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--white)'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(238,242,240,.45)'}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '.5px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted2)' }}>© 2026 E-Trading. Todos los derechos reservados.</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Hecho con ❤️ y Claude Code</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
