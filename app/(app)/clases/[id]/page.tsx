'use client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getClaseContenido } from '@/data/clases-contenido'
import { MODULOS, QUIZ_PASS } from '@/lib/learning'
import { getXPProgress } from '@/lib/xp'
import { fwait } from '@/lib/format'
import { useMe } from '@/components/shell/MeProvider'
import { useToast } from '@/components/ui/Toast'
import { NavBar } from '@/components/ui/NavBar'
import { Icon, ICONS } from '@/components/ui/Icon'
import { card, btnPrimary, btnSecondary, btnDisabled, h1, h2, bar } from '@/components/ui/styles'

interface Result {
  score: number
  total: number
  passed: boolean
  alreadyCompleted: boolean
  xpAwarded: number
  xpBefore: number
  xpTotal: number
  retryAt: string | null
  badges: { nombre: string; emoji: string }[]
}

interface Estado {
  estado: 'completada' | 'disponible' | 'espera' | 'bloqueada' | 'proximamente'
  retryAt: string | null
  nextId: string | null
}

/** Renderiza **negritas** del contenido */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return <>{parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}</>
}

function toEmbed(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : url
}

export default function ClasePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const clase = getClaseContenido(id)
  const router = useRouter()
  const toast = useToast()
  const { me, refresh } = useMe()

  const [stage, setStage] = useState<'lesson' | 'quiz' | 'result'>('lesson')
  const [estado, setEstado] = useState<Estado | null>(null)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [submitErr, setSubmitErr] = useState('')
  const [sending, setSending] = useState(false)
  const [xpShown, setXpShown] = useState(0)
  const [flash, setFlash] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval>>()

  const loadEstado = useCallback(() => {
    fetch('/api/progress/clase', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { clases: { id: string; estado: Estado['estado']; retryAt: string | null }[] } | null) => {
        if (!d) return
        const c = d.clases.find(x => x.id === id)
        const next = d.clases.find(x => x.id !== id && x.estado === 'disponible')
        setEstado({ estado: c?.estado ?? 'disponible', retryAt: c?.retryAt ?? null, nextId: next?.id ?? null })
      })
      .catch(() => {})
  }, [id])

  useEffect(() => { loadEstado() }, [loadEstado])
  useEffect(() => () => clearInterval(timer.current), [])
  useEffect(() => { window.scrollTo(0, 0) }, [stage])

  if (!clase) {
    return (
      <div className="et-page">
        <NavBar title="Clase" back="/clases" backLabel="Clases" alwaysTitle />
        <div style={{ ...card, margin: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center' }}>
          <span style={{ font: '600 17px var(--font)' }}>Esta clase aún no está publicada</span>
          <span style={{ font: '400 15px var(--font)', color: 'var(--text-secondary)' }}>Estamos preparando su contenido. Mientras tanto, continúa con las disponibles.</span>
          <Link href="/clases" style={{ ...btnPrimary, height: 44, textDecoration: 'none' }}>Ver clases</Link>
        </div>
      </div>
    )
  }

  const modulo = MODULOS.find(m => m.n === clase.modulo)
  const numero = Number(clase.id.slice(1))
  const Q = clase.quiz[qi]

  function startQuiz() {
    setQi(0); setPicked(null); setAnswers([]); setResult(null); setSubmitErr('')
    setStage('quiz')
  }

  function animateXp(from: number, to: number) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || from === to) { setXpShown(to); return }
    setXpShown(from); setFlash(true)
    const start = Date.now()
    const DURATION = 840
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      const k = Math.min(1, (Date.now() - start) / DURATION)
      setXpShown(Math.round(from + (to - from) * k))
      if (k >= 1) { clearInterval(timer.current); setTimeout(() => setFlash(false), 300) }
    }, 35)
  }

  async function submit(all: number[]) {
    setSending(true); setSubmitErr('')
    try {
      const res = await fetch('/api/progress/clase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claseId: clase!.id, answers: all }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitErr(data.error ?? 'No se pudo guardar el resultado'); return }
      const r = data as Result
      setResult(r)
      setStage('result')
      if (r.passed && r.xpAwarded > 0) animateXp(r.xpBefore, r.xpTotal); else setXpShown(r.xpTotal)
      if (r.badges?.length) setTimeout(() => toast(`Insignia desbloqueada: ${r.badges[0].emoji} ${r.badges[0].nombre}`), 1200)
      refresh(); loadEstado()
    } catch {
      setSubmitErr('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  function next() {
    const all = [...answers, picked as number]
    if (qi < clase!.quiz.length - 1) { setAnswers(all); setQi(qi + 1); setPicked(null) }
    else { setAnswers(all); submit(all) }
  }

  // ─── QUIZ ───────────────────────────────────────────────────
  if (stage === 'quiz') {
    const answered = picked !== null
    const ok = picked === Q.correcta
    return (
      <div className="et-page" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 16px calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, paddingTop: 'env(safe-area-inset-top, 0px)', boxSizing: 'content-box' }}>
          <button onClick={() => setStage('lesson')} aria-label="Salir del quiz" style={{ width: 44, height: 44, marginLeft: -12, border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.close} size={20} />
          </button>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${clase.quiz.length}, 1fr)`, gap: 4 }} role="progressbar" aria-valuemin={1} aria-valuemax={clase.quiz.length} aria-valuenow={qi + 1}>
            {clase.quiz.map((_, i) => <i key={i} style={{ height: 4, background: i < qi || (i === qi && answered) ? 'var(--green)' : 'var(--surface-2)', transition: 'background 200ms ease-out' }} />)}
          </div>
          <span style={{ width: 32, textAlign: 'right', font: '500 12px var(--font)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{qi + 1}/{clase.quiz.length}</span>
        </div>
        <h1 style={{ margin: '32px 0 24px', font: '700 28px/34px var(--font)', letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}>{Q.pregunta}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup">
          {Q.opciones.map((t, i) => {
            const st = !answered ? 'idle' : i === Q.correcta ? 'ok' : i === picked ? 'bad' : 'dim'
            const border = st === 'ok' ? 'var(--green)' : st === 'bad' ? 'var(--red)' : 'var(--border)'
            return (
              <button
                key={i}
                role="radio"
                aria-checked={picked === i}
                disabled={answered}
                onClick={() => setPicked(i)}
                style={{
                  minHeight: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 6, border: `1px solid ${border}`,
                  background: st === 'ok' ? 'color-mix(in srgb, var(--green) 10%, var(--surface-1))' : st === 'bad' ? 'color-mix(in srgb, var(--red) 10%, var(--surface-1))' : 'var(--surface-1)',
                  color: 'var(--text-primary)', textAlign: 'left', cursor: answered ? 'default' : 'pointer', opacity: st === 'dim' ? 0.55 : 1, transition: 'all 150ms ease-out',
                }}
              >
                <span style={{ width: 28, height: 28, flex: 'none', border: `1px solid ${border}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px var(--font)', color: st === 'ok' ? 'var(--green)' : st === 'bad' ? 'var(--red)' : 'var(--text-secondary)' }}>
                  {st === 'ok' ? '✓' : st === 'bad' ? '✕' : String.fromCharCode(65 + i)}
                </span>
                <span style={{ font: '400 17px/22px var(--font)' }}>{t}</span>
              </button>
            )
          })}
        </div>
        {answered && (
          <div aria-live="polite" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4, animation: 'etfade 200ms ease-out' }}>
            <span style={{ font: '600 17px var(--font)', color: ok ? 'var(--green)' : 'var(--red)' }}>{ok ? '¡Correcto!' : 'No exactamente'}</span>
            <p style={{ margin: 0, font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>{Q.explicacion}</p>
          </div>
        )}
        {submitErr && <p role="alert" style={{ margin: '16px 0 0', font: '400 15px/22px var(--font)', color: 'var(--red)' }}>{submitErr}</p>}
        <div style={{ flex: 1 }} />
        {answered && (
          <button onClick={next} disabled={sending} style={{ ...btnPrimary, marginTop: 24, opacity: sending ? 0.6 : 1 }}>
            {qi < clase.quiz.length - 1 ? 'Siguiente' : sending ? 'Corrigiendo…' : 'Ver resultado'}
          </button>
        )}
      </div>
    )
  }

  // ─── RESULTADO ──────────────────────────────────────────────
  if (stage === 'result' && result) {
    const lv = getXPProgress(xpShown)
    const name = me?.user.name?.split(' ')[0]
    return (
      <div className="et-page" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', gap: 24, padding: 'calc(56px + env(safe-area-inset-top, 0px)) 16px calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {result.passed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: '500 13px var(--font)', color: 'var(--green)' }}>Clase {numero} {result.alreadyCompleted ? 'repasada' : 'completada'} · {result.score}/{result.total} aciertos</span>
              <h1 style={h1}>{name ? `¡Bien hecho, ${name}!` : '¡Bien hecho!'}</h1>
            </div>
            <div style={{ ...card, position: 'relative', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
              {flash && <i style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--green) 22%, transparent), transparent 60%)', animation: 'etflash 900ms ease-out forwards', pointerEvents: 'none' }} />}
              <span style={{ font: '500 13px var(--font)', color: 'var(--green)' }}>{result.xpAwarded > 0 ? `+${result.xpAwarded} XP` : 'Ya habías ganado el XP de esta clase'}</span>
              <span style={{ font: '600 56px/60px var(--font)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {xpShown.toLocaleString('es-ES')} <span style={{ font: '500 22px var(--font)', color: 'var(--text-secondary)' }}>XP</span>
              </span>
              <div style={bar(lv.progreso).track}><i style={{ ...bar(lv.progreso).fill, transition: 'none' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>
                <span>Nivel {lv.nivel.nivel} · {lv.nivel.nombre}</span>
                {lv.xpParaSiguiente !== null && <span style={{ fontVariantNumeric: 'tabular-nums' }}>Faltan {lv.xpParaSiguiente.toLocaleString('es-ES')} XP para el nivel {lv.nivel.nivel + 1}</span>}
              </div>
            </div>
            {!!me?.user.racha && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 6, font: '400 15px var(--font)' }}>
                <Icon d={ICONS.flame} size={18} color="var(--amber)" />
                Racha de {me.user.racha} {me.user.racha === 1 ? 'día' : 'días'}. Vuelve mañana para mantenerla.
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ font: '500 13px var(--font)', color: 'var(--text-secondary)' }}>{result.score}/{result.total} aciertos</span>
            <h1 style={h1}>Casi lo tienes</h1>
            <p style={{ margin: 0, font: '400 17px/24px var(--font)', color: 'var(--text-secondary)' }}>
              Necesitas {QUIZ_PASS} aciertos. Repasa la clase con calma: {result.retryAt && new Date(result.retryAt).getTime() > Date.now() + 1000
                ? `con tu plan podrás reintentar el quiz en ${fwait(result.retryAt)}.`
                : 'puedes reintentarlo cuando quieras.'}
            </p>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.passed ? (
            estado?.nextId
              ? <button onClick={() => { setStage('lesson'); router.push(`/clases/${estado.nextId}`) }} style={btnPrimary}>Siguiente clase</button>
              : <Link href="/clases" style={{ ...btnPrimary, textDecoration: 'none' }}>Ver clases</Link>
          ) : (
            <button onClick={() => setStage('lesson')} style={btnPrimary}>Repasar la clase</button>
          )}
          <Link href="/dashboard" style={{ ...btnSecondary, border: 'none', textDecoration: 'none', fontWeight: 500 }}>Volver al inicio</Link>
        </div>
      </div>
    )
  }

  // ─── CLASE ──────────────────────────────────────────────────
  const waiting = estado?.estado === 'espera' && estado.retryAt && new Date(estado.retryAt).getTime() > Date.now()
  const locked = estado?.estado === 'bloqueada'
  const completed = estado?.estado === 'completada'

  return (
    <div className="et-page" style={{ paddingBottom: 32 }}>
      <NavBar title={clase.titulo} back="/clases" backLabel="Clases" />
      <article style={{ maxWidth: 680, padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: '500 12px var(--font)', color: 'var(--green)' }}>{modulo?.titulo} · Clase {numero}</span>
          <h1 style={{ ...h1, textWrap: 'balance' } as React.CSSProperties}>{clase.titulo}</h1>
          <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>
            {clase.duracion} · +{clase.xp} XP{completed ? ' · ' : ''}{completed && <span style={{ color: 'var(--green)' }}>Completada</span>}
          </span>
        </div>
        <p style={{ margin: 0, font: '400 19px/29px var(--font)' }}><Rich text={clase.introduccion} /></p>
        {clase.secciones.map((s, i) => (
          <section key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={h2}>{s.titulo}</h2>
            {s.videoUrl && (
              <div style={{ aspectRatio: '16 / 9', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface-2)' }}>
                <iframe src={toEmbed(s.videoUrl)} title={s.titulo} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 0 }} />
              </div>
            )}
            <p style={{ margin: 0, font: '400 17px/27px var(--font)' }}><Rich text={s.contenido} /></p>
          </section>
        ))}
        {clase.ejercicioSimulador && (
          <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ font: '500 12px var(--font)', color: 'var(--blue)' }}>Practica en el simulador</span>
            <span style={{ font: '400 15px/22px var(--font)' }}>{clase.ejercicioSimulador}</span>
            <Link href="/mercado" style={{ ...btnSecondary, textDecoration: 'none' }}>Abrir el mercado</Link>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ font: '400 15px/20px var(--font)', color: 'var(--text-secondary)' }}>
            {clase.quiz.length} preguntas · Necesitas {QUIZ_PASS} aciertos para aprobar{completed ? ' · Repasar no da XP' : ''}
          </span>
          {locked ? (
            <Link href="/precios" style={{ ...btnPrimary, textDecoration: 'none' }}>Ver planes para desbloquearla</Link>
          ) : waiting ? (
            <button disabled style={btnDisabled}>Podrás reintentar en {fwait(estado!.retryAt)}</button>
          ) : (
            <button onClick={startQuiz} style={btnPrimary}>{completed ? 'Repasar el quiz' : 'Empezar el quiz'}</button>
          )}
        </div>
      </article>
    </div>
  )
}
