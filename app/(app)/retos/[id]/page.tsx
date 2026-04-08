'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RETOS } from '@/data/retos'

// Static quiz data per reto (first 8 retos have full quiz)
const QUIZ_DATA: Record<string, { pregunta: string; opciones: string[]; correcta: number; explicacion: string }[]> = {
  r1: [
    { pregunta: '¿Qué función principal cumple el dinero en la economía?', opciones: ['Medio de intercambio, unidad de cuenta y reserva de valor', 'Solo sirve para comprar cosas físicas', 'Es un metal precioso'], correcta: 0, explicacion: 'El dinero tiene tres funciones: permite el intercambio, mide el valor de bienes y servicios, y almacena valor en el tiempo.' },
    { pregunta: '¿Qué sistema monetario usan la mayoría de países hoy?', opciones: ['Patrón oro', 'Dinero fiduciario (fiat)', 'Trueque avanzado'], correcta: 1, explicacion: 'El dinero fiat no está respaldado por oro. Su valor viene de la confianza en el gobierno que lo emite.' },
    { pregunta: '¿Qué es la inflación?', opciones: ['Subida del precio de las acciones', 'Pérdida del poder adquisitivo del dinero', 'Tipo de interés bancario'], correcta: 1, explicacion: 'La inflación significa que con el mismo dinero puedes comprar menos cosas con el tiempo.' },
    { pregunta: '¿Por qué guardar dinero en efectivo bajo el colchón es una mala idea?', opciones: ['Es peligroso por los robos', 'La inflación erosiona su valor real', 'Los bancos lo confiscan'], correcta: 1, explicacion: 'Con el 3% de inflación anual, 1.000€ hoy valdrán solo 744€ en 10 años en términos de poder adquisitivo.' },
    { pregunta: '¿Cuál es la diferencia entre precio y valor?', opciones: ['No hay diferencia, son lo mismo', 'El precio es lo que pagas; el valor es lo que obtienes', 'El valor siempre es mayor que el precio'], correcta: 1, explicacion: 'Warren Buffett lo resume perfectamente: "El precio es lo que pagas; el valor es lo que obtienes."' },
  ],
  r2: [
    { pregunta: '¿Qué es la inflación acumulada?', opciones: ['La inflación de un solo mes', 'El efecto compuesto de varios años de inflación', 'El tipo de interés del banco central'], correcta: 1, explicacion: 'Si la inflación es del 3% anual durante 10 años, los precios suben un 34% total, no un 30%.' },
    { pregunta: 'Si guardas 10.000€ con una inflación del 4% anual, ¿cuánto valen en términos reales tras 10 años?', opciones: ['Exactamente 10.000€', 'Unos 6.755€', '14.000€'], correcta: 1, explicacion: 'Con el 4% de inflación, el poder adquisitivo se reduce exponencialmente: 10.000 / (1.04^10) ≈ 6.755€.' },
    { pregunta: '¿Cuál es la tasa de inflación media histórica en Europa?', opciones: ['0-1%', '2-3%', '8-10%'], correcta: 1, explicacion: 'El BCE tiene como objetivo una inflación del 2% anual. Históricamente ha rondado ese valor en épocas normales.' },
    { pregunta: '¿Qué activos suelen proteger mejor contra la inflación?', opciones: ['Efectivo y cuentas de ahorro', 'Acciones, inmuebles y materias primas', 'Bonos del gobierno a corto plazo'], correcta: 1, explicacion: 'Las acciones representan participación en empresas que pueden subir precios, protegiendo contra la inflación.' },
    { pregunta: '¿Qué significa que el dinero pierde poder adquisitivo?', opciones: ['Que el dinero físico se deteriora', 'Que con el mismo dinero puedes comprar menos', 'Que el tipo de cambio baja'], correcta: 1, explicacion: 'Si antes con 100€ comprabas 50 kilos de arroz y ahora solo 45, has perdido poder adquisitivo.' },
  ],
  r3: [
    { pregunta: '¿Quién llamó al interés compuesto "la octava maravilla del mundo"?', opciones: ['Warren Buffett', 'Albert Einstein', 'Benjamin Franklin'], correcta: 1, explicacion: 'Se atribuye a Einstein la frase: "El interés compuesto es la octava maravilla del mundo. El que lo entiende, lo gana; el que no, lo paga."' },
    { pregunta: '¿Cuál es la diferencia entre interés simple e interés compuesto?', opciones: ['No hay diferencia práctica', 'El compuesto genera intereses sobre los intereses ya acumulados', 'El simple siempre da más dinero'], correcta: 1, explicacion: 'En el compuesto, los intereses se reinvierten. 1.000€ al 7% anual → 20 años después: simple=2.400€, compuesto=3.870€.' },
    { pregunta: 'Usando la "regla del 72", ¿en cuántos años se duplica una inversión al 8% anual?', opciones: ['18 años', '9 años', '6 años'], correcta: 1, explicacion: '72 / 8 = 9 años. La regla del 72 es una forma rápida de estimar el tiempo de duplicación.' },
    { pregunta: '¿Por qué es tan importante empezar a invertir joven?', opciones: ['Porque tienes más energía', 'Porque el tiempo amplifica el efecto compuesto exponencialmente', 'Porque los productos son más baratos'], correcta: 1, explicacion: 'Un euro invertido a los 25 vale mucho más a los 65 que uno invertido a los 45, gracias al tiempo de composición.' },
    { pregunta: '¿Qué es la rentabilidad anualizada (CAGR)?', opciones: ['La rentabilidad del mejor año', 'La tasa de crecimiento anual compuesto equivalente', 'El promedio aritmético de rentabilidades anuales'], correcta: 1, explicacion: 'El CAGR es la tasa constante que daría el mismo resultado final. Es más precisa que el promedio simple.' },
  ],
}

// Default quiz for retos without specific content
const DEFAULT_QUIZ = [
  { pregunta: '¿Cuál es el principio más importante de la gestión del riesgo?', opciones: ['Invertir todo en un solo activo', 'No arriesgar más del 1-2% del capital por operación', 'Seguir siempre las recomendaciones de las redes sociales'], correcta: 1, explicacion: 'La regla del 1% protege tu capital de pérdidas devastadoras. Perder el 1% 10 veces consecutivas es recuperable.' },
  { pregunta: '¿Qué es la diversificación?', opciones: ['Comprar muchas acciones de la misma empresa', 'Distribuir el capital entre diferentes activos para reducir riesgo', 'Operar en múltiples brokers'], correcta: 1, explicacion: 'La diversificación reduce el riesgo no sistemático. Si una inversión falla, las otras compensan la pérdida.' },
  { pregunta: '¿Qué es el stop loss?', opciones: ['Orden para comprar cuando el precio sube', 'Orden automática para cerrar una posición si el precio cae a un nivel', 'Indicador de rentabilidad'], correcta: 1, explicacion: 'El stop loss es tu escudo. Define de antemano cuánto estás dispuesto a perder en cada operación.' },
  { pregunta: '¿Cuándo es mejor vender una acción?', opciones: ['Cuando todo el mundo la vende por pánico', 'Cuando los fundamentales que motivaron la compra han cambiado', 'Cuando ha subido un 10%'], correcta: 1, explicacion: 'La decisión de vender debe basarse en los fundamentos, no en el precio. Vender por pánico es el error más común.' },
  { pregunta: '¿Qué es el sesgo de anclaje?', opciones: ['Confiar demasiado en un precio de referencia pasado', 'Comprar cuando el mercado baja', 'Analizar demasiados datos'], correcta: 0, explicacion: 'El sesgo de anclaje hace que nos quedemos fijados en el precio al que compramos, afectando decisiones futuras.' },
]

function getQuiz(retoId: string) {
  return QUIZ_DATA[retoId] ?? DEFAULT_QUIZ
}

type Step = 'info' | 'quiz' | 'done'

export default function RetoPage() {
  const params = useParams()
  const router = useRouter()
  const retoId = params.id as string
  const reto = RETOS.find(r => r.id === retoId)

  const [step, setStep] = useState<Step>('info')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [showExpl, setShowExpl] = useState(false)
  const [, setScore] = useState(0)
  const [celebrating, setCelebrating] = useState(false)

  if (!reto) {
    return (
      <div style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700 }}>Reto no encontrado</div>
        <Link href="/retos" style={{ color: 'var(--green)', textDecoration: 'none', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Volver a Retos</Link>
      </div>
    )
  }

  const quiz = getQuiz(reto.id)
  const q = quiz[currentQ]
  const isCorrect = selected === q?.correcta
  const finalScore = answers.filter((a, i) => a === quiz[i]?.correcta).length

  function handleAnswer(idx: number) {
    if (showExpl) return
    setSelected(idx)
    setShowExpl(true)
  }

  function handleNext() {
    const newAnswers = [...answers, selected ?? -1]
    setAnswers(newAnswers)

    if (currentQ < quiz.length - 1) {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setShowExpl(false)
    } else {
      // Calculate final score
      const correct = newAnswers.filter((a, i) => a === quiz[i]?.correcta).length
      setScore(correct)
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 3000)
      setStep('done')
    }
  }

  const TIPO_COLOR: Record<string, string> = { daily: 'var(--green)', weekly: 'var(--blue)', monthly: 'var(--purple)', special: 'var(--amber)' }

  if (step === 'info') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px', overflowY: 'auto' }}>
        <Link href="/retos" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Volver a Retos</Link>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>
              {reto.numero}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: `${TIPO_COLOR[reto.tipo]}20`, color: TIPO_COLOR[reto.tipo], border: `.5px solid ${TIPO_COLOR[reto.tipo]}40` }}>{reto.tipo}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--muted3)', color: 'var(--muted)', border: '.5px solid var(--border2)' }}>Fase {reto.fase}</span>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800 }}>{reto.titulo}</div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>{reto.descripcion}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { lbl: 'XP al completar', val: `+${reto.xp} XP`, color: 'var(--green)' },
              { lbl: 'Duración estimada', val: `${reto.duracion} min` },
              { lbl: 'Tipo', val: reto.tipo },
            ].map(s => (
              <div key={s.lbl} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{s.lbl}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: s.color ?? 'var(--white)' }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📋 Este reto incluye</div>
            {[
              '5 preguntas de opción múltiple sobre el tema',
              'Feedback inmediato con explicación detallada',
              'Puntuación final y XP obtenidos',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {item}
              </div>
            ))}
          </div>

          <button onClick={() => setStep('quiz')} style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Empezar el reto →
          </button>
        </div>
      </div>
    )
  }

  if (step === 'quiz') {
    const progress = ((currentQ) / quiz.length) * 100
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pregunta {currentQ + 1} de {quiz.length}</span>
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>+{reto.xp} XP al completar</span>
        </div>
        <div style={{ height: 4, background: 'var(--border2)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--green)', borderRadius: 2, transition: 'width .4s' }} />
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, marginBottom: 24, lineHeight: 1.3 }}>
            {q.pregunta}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {q.opciones.map((op, idx) => {
              let bg = 'var(--bg2)', border = 'var(--border2)', color = 'var(--white)'
              if (showExpl) {
                if (idx === q.correcta) { bg = 'rgba(0,212,122,.15)'; border = 'var(--green)'; color = 'var(--green)' }
                else if (idx === selected && idx !== q.correcta) { bg = 'rgba(239,83,80,.12)'; border = 'var(--red)'; color = 'var(--red)' }
                else { color = 'var(--muted)' }
              } else if (selected === idx) {
                bg = 'var(--gfaint)'; border = 'var(--green)'
              }
              return (
                <div key={idx} onClick={() => handleAnswer(idx)} style={{ background: bg, border: `.5px solid ${border}`, borderRadius: 12, padding: '14px 18px', cursor: showExpl ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: '.15s', color }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{op}</span>
                  {showExpl && idx === q.correcta && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✅</span>}
                  {showExpl && idx === selected && idx !== q.correcta && <span style={{ marginLeft: 'auto', fontSize: 16 }}>❌</span>}
                </div>
              )
            })}
          </div>

          {showExpl && (
            <>
              <div style={{ background: isCorrect ? 'rgba(0,212,122,.08)' : 'rgba(239,83,80,.08)', border: `.5px solid ${isCorrect ? 'rgba(0,212,122,.3)' : 'rgba(239,83,80,.3)'}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginBottom: 6 }}>
                  {isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{q.explicacion}</div>
              </div>
              <button onClick={handleNext} style={{ width: '100%', padding: 13, background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                {currentQ < quiz.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados →'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Done
  const passed = finalScore >= 3
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 24px', textAlign: 'center' }}>
      {celebrating && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 800, color: 'var(--green)', animation: 'xpFly .8s ease forwards', zIndex: 999, pointerEvents: 'none' }}>
          +{reto.xp} XP ✨
        </div>
      )}

      <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? '🎉' : '💪'}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        {passed ? '¡Reto completado!' : 'Sigue practicando'}
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
        Has respondido correctamente {finalScore} de {quiz.length} preguntas
      </div>

      {/* Score */}
      <div style={{ background: 'var(--bg1)', border: `.5px solid ${passed ? 'rgba(0,212,122,.3)' : 'var(--border2)'}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 800, color: passed ? 'var(--green)' : 'var(--amber)', marginBottom: 4 }}>
          {finalScore}/{quiz.length}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>{passed ? `Has ganado +${reto.xp} XP` : 'Necesitas 3/5 para pasar'}</div>

        {passed && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            <div style={{ background: 'var(--gfaint)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>XP GANADOS</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>+{reto.xp}</div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>RACHA</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800 }}>🔥 +1 día</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {!passed && (
          <button onClick={() => { setStep('quiz'); setCurrentQ(0); setAnswers([]); setSelected(null); setShowExpl(false) }} style={{ flex: 1, padding: 13, background: 'var(--bg2)', border: '.5px solid var(--border2)', color: 'var(--white)', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Repetir reto
          </button>
        )}
        <button onClick={() => router.push('/retos')} style={{ flex: 1, padding: 13, background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {passed ? 'Siguiente reto →' : 'Volver a retos'}
        </button>
      </div>
    </div>
  )
}
