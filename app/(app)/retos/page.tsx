'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { RETOS, FASES, Reto } from '@/data/retos'
import { RachaBanner } from '@/components/banners/EducationalBanner'

const TIPO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  daily:   { bg: 'rgba(0,212,122,.08)',   color: 'var(--green)',  border: 'rgba(0,212,122,.25)' },
  weekly:  { bg: 'rgba(66,165,245,.08)',  color: 'var(--blue)',   border: 'rgba(66,165,245,.25)' },
  monthly: { bg: 'rgba(153,69,255,.08)', color: 'var(--purple)', border: 'rgba(153,69,255,.25)' },
  special: { bg: 'rgba(249,168,37,.08)', color: 'var(--amber)',  border: 'rgba(249,168,37,.25)' },
}

const PLAN_LOCKED = { free: false, starter: true, pro: true, elite: true }

function generateQuestions(reto: Reto) {
  return [
    {
      pregunta: `¿Cuál es el objetivo principal de "${reto.titulo}"?`,
      opciones: [
        'Ganar la mayor cantidad de XP posible sin aprender',
        reto.descripcion.slice(0, 60) + '...',
        'Memorizar datos sin aplicación práctica',
      ],
      correcta: 1,
    },
    {
      pregunta: '¿Cuál es una buena práctica al operar en el simulador?',
      opciones: [
        'Invertir todo el capital en un solo activo',
        'Diversificar y gestionar el riesgo con stop loss',
        'Ignorar los datos del mercado y operar por intuición',
      ],
      correcta: 1,
    },
    {
      pregunta: '¿Qué debes hacer al completar este reto?',
      opciones: [
        'Pasar al siguiente sin reflexionar',
        'Aplicar lo aprendido en el simulador y revisar tu portafolio',
        'Salir de la app y no volver hasta mañana',
      ],
      correcta: 1,
    },
  ]
}

export default function RetosPage() {
  const { data: session } = useSession()
  const racha = (session?.user as Record<string, unknown>)?.racha as number ?? 0

  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [selectedReto, setSelectedReto] = useState<Reto | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizDone, setQuizDone] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [xpToast, setXpToast] = useState<number | null>(null)

  const faseGrupos = FASES.map(f => ({
    ...f,
    retos: RETOS.filter(r => r.fase === f.fase),
  }))

  const totalCompleted = completedIds.length

  useEffect(() => {
    fetch('/api/progress/reto')
      .then(r => r.json())
      .then(d => { if (d.completedIds) setCompletedIds(d.completedIds) })
      .catch(() => {})
  }, [])

  function openPanel(reto: Reto) {
    setSelectedReto(reto)
    setPanelOpen(true)
    setCurrentQ(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizAnswers([])
    setQuizDone(false)
  }

  function closePanel() {
    setPanelOpen(false)
    setTimeout(() => setSelectedReto(null), 300)
  }

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    setShowResult(true)
  }

  function handleNext() {
    if (!selectedReto) return
    const questions = generateQuestions(selectedReto)
    const newAnswers = [...quizAnswers, selectedAnswer ?? -1]
    setQuizAnswers(newAnswers)

    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizDone(true)
    }
  }

  async function handleComplete() {
    if (!selectedReto || completing) return
    if (completedIds.includes(selectedReto.id)) {
      closePanel()
      return
    }
    setCompleting(true)
    try {
      const res = await fetch('/api/progress/reto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retoId: selectedReto.id }),
      })
      const data = await res.json()
      if (data.success) {
        setCompletedIds(prev => [...prev, selectedReto.id])
        if (!data.alreadyCompleted) {
          setXpToast(selectedReto.xp)
          setTimeout(() => setXpToast(null), 3000)
        }
      }
    } catch { /* ignore */ }
    setCompleting(false)
    closePanel()
  }

  const questions = selectedReto ? generateQuestions(selectedReto) : []
  const q = questions[currentQ]
  const isCorrect = selectedAnswer === q?.correcta
  const tc = selectedReto ? TIPO_COLORS[selectedReto.tipo] : TIPO_COLORS.daily

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, position: 'relative' }}>
      {/* XP Toast */}
      {xpToast !== null && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: 'var(--green)', color: 'var(--bg)',
          fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800,
          padding: '12px 24px', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,212,122,.4)',
          animation: 'fadeInUp .4s ease',
        }}>
          +{xpToast} XP ✨
        </div>
      )}

      <RachaBanner racha={racha} />
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Retos</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>100 retos · 7 fases · Tu camino a inversor autónomo</div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700 }}>Progreso total</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{totalCompleted} / 100</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalCompleted}%`, background: 'linear-gradient(90deg,var(--green),#00F090)', borderRadius: 3, transition: 'width .6s' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Completa retos para ganar XP y ascender en la liga</div>
      </div>

      {/* Fases */}
      {faseGrupos.map(fase => {
        const faseCompleted = fase.retos.filter(r => completedIds.includes(r.id)).length
        return (
          <div key={fase.fase} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: '.5px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>
                {fase.fase}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700 }}>Fase {fase.fase}: {fase.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fase.retos.length} retos · {fase.xpRange} XP · Plan: {fase.plan}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: faseCompleted > 0 ? 'var(--green)' : 'var(--muted)' }}>
                {faseCompleted} / {fase.retos.length} completados
              </div>
            </div>

            {/* Retos grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {fase.retos.map(reto => {
                const rtc = TIPO_COLORS[reto.tipo]
                const locked = PLAN_LOCKED[reto.plan]
                const done = completedIds.includes(reto.id)
                return (
                  <div
                    key={reto.id}
                    onClick={() => !locked && openPanel(reto)}
                    style={{
                      background: done ? 'rgba(0,212,122,.06)' : 'var(--bg1)',
                      border: done ? '.5px solid rgba(0,212,122,.35)' : '.5px solid var(--border2)',
                      borderRadius: 12, padding: 14, cursor: locked ? 'not-allowed' : 'pointer',
                      transition: '.15s', opacity: locked ? 0.55 : 1,
                      display: 'flex', flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: rtc.bg, color: rtc.color, border: `.5px solid ${rtc.border}` }}>
                        {reto.tipo}
                      </span>
                      {locked
                        ? <span style={{ fontSize: 11, opacity: .6 }}>🔒</span>
                        : done
                          ? <span style={{ fontSize: 13 }}>✅</span>
                          : <span style={{ fontSize: 11, color: 'var(--muted2)' }}>#{reto.numero}</span>
                      }
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, lineHeight: 1.3, flex: 1, color: done ? 'var(--green)' : 'var(--white)' }}>{reto.titulo}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>+{reto.xp} XP</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{reto.duracion}m</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Slide-over backdrop */}
      {panelOpen && (
        <div
          onClick={closePanel}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(7,9,10,.7)', backdropFilter: 'blur(4px)',
            transition: 'opacity .3s',
          }}
        />
      )}

      {/* Slide-over panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
        width: 520, maxWidth: '95vw',
        background: 'var(--bg1)', borderLeft: '.5px solid var(--border2)',
        display: 'flex', flexDirection: 'column',
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(0.22,1,0.36,1)',
        overflowY: 'auto',
      }}>
        {selectedReto && (
          <>
            {/* Panel header */}
            <div style={{ padding: '20px 24px', borderBottom: '.5px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: tc.bg, color: tc.color, border: `.5px solid ${tc.border}` }}>
                  {selectedReto.tipo}
                </span>
                <button onClick={closePanel} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{selectedReto.titulo}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>{selectedReto.descripcion}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>+{selectedReto.xp} XP</span>
                </div>
                <div style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--muted)' }}>
                  {selectedReto.duracion} min
                </div>
                <div style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--muted)' }}>
                  Fase {selectedReto.fase}
                </div>
              </div>
            </div>

            {/* Quiz or done */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {completedIds.includes(selectedReto.id) ? (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Reto completado</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Ya has completado este reto</div>
                </div>
              ) : !quizDone ? (
                <>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Pregunta {currentQ + 1} de {questions.length}
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((currentQ) / questions.length) * 100}%`, background: 'var(--green)', borderRadius: 2, transition: 'width .4s' }} />
                  </div>

                  <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, marginBottom: 20, lineHeight: 1.4 }}>{q?.pregunta}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {q?.opciones.map((op, idx) => {
                      let bg = 'var(--bg2)', border = 'var(--border2)', color = 'var(--white)'
                      if (showResult) {
                        if (idx === q.correcta) { bg = 'rgba(0,212,122,.15)'; border = 'var(--green)'; color = 'var(--green)' }
                        else if (idx === selectedAnswer && idx !== q.correcta) { bg = 'rgba(239,83,80,.12)'; border = 'var(--red)'; color = 'var(--red)' }
                        else color = 'var(--muted)'
                      } else if (selectedAnswer === idx) { bg = 'var(--bg3)'; border = 'var(--green)' }
                      return (
                        <div
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          style={{ background: bg, border: `.5px solid ${border}`, borderRadius: 12, padding: '12px 16px', cursor: showResult ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, color }}
                        >
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span style={{ fontSize: 13, lineHeight: 1.4 }}>{op}</span>
                          {showResult && idx === q.correcta && <span style={{ marginLeft: 'auto' }}>✅</span>}
                          {showResult && idx === selectedAnswer && idx !== q.correcta && <span style={{ marginLeft: 'auto' }}>❌</span>}
                        </div>
                      )
                    })}
                  </div>

                  {showResult && (
                    <div style={{ background: isCorrect ? 'rgba(0,212,122,.08)' : 'rgba(239,83,80,.08)', border: `.5px solid ${isCorrect ? 'rgba(0,212,122,.3)' : 'rgba(239,83,80,.3)'}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginBottom: 4 }}>{isCorrect ? '✅ ¡Correcto!' : '❌ No exactamente'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>La respuesta correcta es la opción {String.fromCharCode(65 + (q?.correcta ?? 0))}.</div>
                    </div>
                  )}

                  {showResult && (
                    <button onClick={handleNext} style={{ width: '100%', padding: 14, background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      {currentQ < questions.length - 1 ? 'Siguiente →' : 'Ver resultado →'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 20 }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>¡Quiz completado!</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
                    {quizAnswers.filter((a, i) => a === questions[i]?.correcta).length} / {questions.length} correctas
                  </div>
                  <div style={{ background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.3)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>+{selectedReto.xp} XP</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Se añadirán a tu perfil</div>
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    style={{ width: '100%', padding: 14, background: completing ? 'var(--bg3)' : 'var(--green)', color: completing ? 'var(--muted)' : 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: completing ? 'not-allowed' : 'pointer' }}
                  >
                    {completing ? 'Guardando...' : 'Completar reto →'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
