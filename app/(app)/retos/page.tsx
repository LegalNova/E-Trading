'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { RETOS, FASES, Reto } from '@/data/retos'

const TIPO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  daily:   { bg: 'rgba(0,212,122,.08)',   color: 'var(--green)',  border: 'rgba(0,212,122,.25)' },
  weekly:  { bg: 'rgba(66,165,245,.08)',  color: 'var(--blue)',   border: 'rgba(66,165,245,.25)' },
  monthly: { bg: 'rgba(153,69,255,.08)', color: 'var(--purple)', border: 'rgba(153,69,255,.25)' },
  special: { bg: 'rgba(249,168,37,.08)', color: 'var(--amber)',  border: 'rgba(249,168,37,.25)' },
}

interface Question {
  pregunta: string
  opciones: string[]
  correcta: number
  explicacion: string
}

/* Real educational questions per reto */
const RETO_QUESTIONS: Record<string, Question[]> = {
  r1: [
    { pregunta: '¿Qué es el dinero en términos modernos?', opciones: ['Papel impreso por los gobiernos sin valor intrínseco', 'Un medio de intercambio y reserva de valor respaldado por la confianza colectiva', 'Solo monedas metálicas con valor físico'], correcta: 1, explicacion: 'El dinero moderno es "fiat" — su valor depende de la confianza en el sistema, no de un respaldo físico como el oro.' },
    { pregunta: '¿Qué es la masa monetaria M2?', opciones: ['Solo los billetes y monedas en circulación', 'El dinero en efectivo más los depósitos bancarios y fondos del mercado monetario', 'Únicamente las reservas de los bancos centrales'], correcta: 1, explicacion: 'M2 incluye el efectivo, depósitos a la vista y depósitos de ahorro — es la medida más usada de la cantidad de dinero.' },
    { pregunta: 'Si un banco recibe €100 en depósitos y tiene reserva obligatoria del 10%, ¿cuánto puede prestar?', opciones: ['€100 — todo el depósito', '€90 — y este ciclo se repite creando más dinero', '€10 — solo las reservas'], correcta: 1, explicacion: 'El sistema bancario de reserva fraccionaria multiplica el dinero inicial. Este es el "efecto multiplicador del crédito".' },
    { pregunta: '¿Qué ocurrió cuando España abandonó la peseta por el euro?', opciones: ['Perdió el control de su política monetaria nacional', 'Ganó la capacidad de devaluar su moneda libremente', 'No cambió nada relevante para la economía'], correcta: 0, explicacion: 'Al adoptar el euro, España cedió la política monetaria al BCE. Ya no puede devaluar o subir tipos unilateralmente.' },
    { pregunta: 'La hiperinflación en Alemania de 1923 fue causada principalmente por:', opciones: ['Demasiados impuestos', 'Imprimir dinero sin respaldo para pagar deudas de guerra', 'La caída de las exportaciones'], correcta: 1, explicacion: 'Alemania imprimió billetes masivamente para pagar reparaciones de la WWI. El marco perdió toda su valor.' },
  ],
  r2: [
    { pregunta: '¿Cuánto poder adquisitivo pierde €100 con una inflación del 5% en 10 años?', opciones: ['€50', '€38.60', '€95'], correcta: 1, explicacion: '100 / (1.05^10) = 61.39€ — has perdido €38.61 de poder adquisitivo real.' },
    { pregunta: 'La inflación actual en España se mide principalmente mediante:', opciones: ['El Producto Interior Bruto (PIB)', 'El Índice de Precios al Consumo (IPC) del INE', 'El tipo de interés del BCE'], correcta: 1, explicacion: 'El IPC mide la variación de precios de una cesta representativa de bienes y servicios que consume un hogar medio.' },
    { pregunta: 'Con inflación del 3% anual, ¿cuándo se reduce a la mitad el valor real de tu dinero?', opciones: ['En 12 años (regla del 72: 72/3=24... no, 72/6=12)', 'En 24 años (72/3=24)', 'En 15 años'], correcta: 1, explicacion: 'Regla del 72: 72/3 = 24 años para que tu dinero valga la mitad en términos reales.' },
    { pregunta: '¿Qué tipo de deudas se benefician de la inflación?', opciones: ['Las deudas a tipo variable', 'Las hipotecas a tipo fijo contratadas antes de la inflación', 'Ningún tipo de deuda se beneficia'], correcta: 1, explicacion: 'Con una hipoteca fija, pagas el mismo importe nominal aunque el dinero valga menos. El deudor gana poder adquisitivo.' },
    { pregunta: 'La inflación subyacente excluye:', opciones: ['Los servicios básicos', 'La energía y los alimentos frescos (por su volatilidad)', 'Los salarios y el empleo'], correcta: 1, explicacion: 'La inflación subyacente elimina energía y alimentos para ver la tendencia de fondo, más estable.' },
  ],
  r3: [
    { pregunta: 'En el simulador de E-Trading, ¿cuánto capital virtual tienes para empezar?', opciones: ['€5.000', '€10.000', '€50.000'], correcta: 1, explicacion: 'Empiezas con €10.000 virtuales. Este capital te permite practicar sin ningún riesgo financiero real.' },
    { pregunta: 'Si compras 10 acciones de AAPL a €190, ¿cuál es tu inversión total?', opciones: ['€190', '€1.900', '€19.000'], correcta: 1, explicacion: '10 acciones × €190 = €1.900. En el simulador se descuenta este importe de tu efectivo disponible.' },
    { pregunta: '¿Cuál es la diferencia entre una orden de mercado y una orden límite?', opciones: ['No hay diferencia en el precio', 'La orden de mercado ejecuta al precio actual; la límite solo ejecuta si el precio llega a tu nivel', 'La orden límite es más rápida'], correcta: 1, explicacion: 'Con una orden de mercado compras inmediatamente al precio actual. Con límite, fijas el máximo que pagas.' },
    { pregunta: 'Al comprar acciones en el simulador, ¿qué riesgo real asumes?', opciones: ['Perder dinero real si la empresa quiebra', 'Ningún riesgo financiero real — es dinero virtual', 'Perder reputación en la liga'], correcta: 1, explicacion: 'El simulador usa dinero virtual (€10.000 de inicio). No hay dinero real en juego, solo aprendizaje.' },
    { pregunta: 'Si TSLA sube un 5% tras comprarlo, ¿qué pasa con tu posición?', opciones: ['El precio cae para compensar', 'Tu posición vale un 5% más y tienes plusvalías latentes', 'Automáticamente se vende'], correcta: 1, explicacion: 'Las plusvalías son latentes hasta que vendes. El valor aumenta pero no realizas el beneficio hasta cerrar la posición.' },
  ],
  r4: [
    { pregunta: '¿Qué es el interés compuesto?', opciones: ['Interés que solo se aplica al capital inicial', 'Interés que se aplica también sobre los intereses acumulados', 'Un tipo de préstamo bancario'], correcta: 1, explicacion: 'En el interés compuesto, los intereses generados se suman al capital y generan nuevos intereses. Efecto bola de nieve.' },
    { pregunta: 'Aplicando la regla del 72, ¿cuántos años tarda en duplicarse €1.000 al 6%?', opciones: ['6 años', '12 años', '20 años'], correcta: 1, explicacion: '72 / 6 = 12 años. Esta regla es una aproximación práctica del tiempo de duplicación.' },
    { pregunta: '€1.000 al 7% anual compuesto durante 30 años, ¿cuánto genera?', opciones: ['€3.100', '€7.612', '€2.100'], correcta: 1, explicacion: '1000 × (1.07^30) ≈ €7.612. El compuesto multiplica 7.6 veces el capital en 30 años.' },
    { pregunta: '¿Por qué es crucial empezar a invertir joven?', opciones: ['Porque los jóvenes tienen más información', 'Porque el tiempo es el multiplicador más poderoso del interés compuesto', 'Porque las comisiones son menores'], correcta: 1, explicacion: '20 años más de compuesto pueden significar 4-8 veces más capital final. El tiempo no se recupera.' },
    { pregunta: 'Si retiras €500 de una inversión compuesta de €1.000 al año 15, ¿qué pierdes?', opciones: ['Solo €500', 'Los €500 más todo el crecimiento futuro de esos €500 en los próximos 15-30 años', 'Solo los intereses de un año'], correcta: 1, explicacion: 'Interrumpir el compuesto tiene un costo exponencial. €500 retirados a los 15 años pueden costar €4.000+ a los 40 años.' },
  ],
  r5: [
    { pregunta: '¿Cuál es la bolsa con mayor capitalización del mundo?', opciones: ['London Stock Exchange (LSE)', 'New York Stock Exchange (NYSE)', 'Tokyo Stock Exchange (TSE)'], correcta: 1, explicacion: 'NYSE tiene una capitalización superior a €25 billones, seguido de cerca por el NASDAQ. Son los mercados más influyentes.' },
    { pregunta: 'Cuando los mercados europeos cierran, ¿qué mercado ya lleva horas abierto?', opciones: ['Ninguno — todos cierran juntos', 'Los mercados americanos llevan 2-3 horas abiertos cuando Europa cierra', 'Los mercados asiáticos'], correcta: 1, explicacion: 'NYSE/NASDAQ abren a las 15:30 CET cuando Europa está a 2 horas de cerrar. El solapamiento crea volatilidad.' },
    { pregunta: '¿Qué significa que el Nikkei caiga un 3% en Tokio para los mercados europeos?', opciones: ['Europa subirá un 3% por efecto contrario', 'Europa tenderá a abrir con caídas similares por el sentimiento global', 'No tiene ninguna relación'], correcta: 1, explicacion: 'Los mercados están globalmente correlacionados. Una caída en Asia crea nerviosismo y tendencia a bajas en Europa y EEUU.' },
    { pregunta: 'El IBEX 35 es:', opciones: ['El índice de las 35 empresas más grandes de toda Europa', 'El índice bursátil de las 35 principales empresas cotizadas en la Bolsa española', 'El tipo de interés de referencia en España'], correcta: 1, explicacion: 'El IBEX 35 incluye empresas como Inditex, Santander, BBVA, Telefónica, Iberdrola. Mide la bolsa española.' },
    { pregunta: '¿Cuál es el impacto de una subida de tipos de la Fed (EE.UU.) en los mercados europeos?', opciones: ['Ningún impacto — son mercados independientes', 'Suele provocar volatilidad y presión bajista también en Europa', 'Hace subir automáticamente la bolsa europea'], correcta: 1, explicacion: 'La Fed es el banco central más influyente del mundo. Sus decisiones mueven los mercados globales, incluyendo Europa.' },
  ],
  r6: [
    { pregunta: '¿Cuál de estos NO es un tipo de activo financiero?', opciones: ['Una acción de Apple', 'El inmueble donde vives (si no cotiza)', 'Un bono del Gobierno español'], correcta: 1, explicacion: 'Los activos financieros son instrumentos que cotizan o pueden comprarse/venderse en mercados: acciones, bonos, ETFs, cripto.' },
    { pregunta: 'Un bono del Estado al 4% anual garantiza:', opciones: ['Un retorno del 4% más el capital al vencimiento (asumiendo que el Estado no quiebra)', 'Solo el 4% pero puede perder el capital', 'Un retorno variable según la economía'], correcta: 0, explicacion: 'Los bonos soberanos pagan un cupón fijo y devuelven el principal al vencimiento. Son los activos más seguros.' },
    { pregunta: 'La principal diferencia entre una acción y un ETF es:', opciones: ['Los ETFs siempre son más rentables', 'Un ETF agrupa múltiples activos, una acción es de una sola empresa', 'Las acciones cotizan en bolsa pero los ETFs no'], correcta: 1, explicacion: 'Un ETF del S&P 500 te da exposición a 500 empresas en una sola compra. Una acción te expone a una empresa.' },
    { pregunta: 'En períodos de crisis económica, ¿qué activo suele comportarse como refugio?', opciones: ['Las acciones tecnológicas de alto crecimiento', 'El Oro (XAU)', 'Las criptomonedas'], correcta: 1, explicacion: 'El oro históricamente sube o mantiene valor en períodos de incertidumbre, inflación alta y crisis financieras.' },
    { pregunta: 'El Forex (mercado de divisas) mueve al día:', opciones: ['€500 millones', '€6 billones (6.000.000 millones)', '€60.000 millones'], correcta: 1, explicacion: 'El mercado Forex mueve ~$6.6 trillones diarios. Es el mayor mercado financiero del mundo, mayor que todas las bolsas juntas.' },
  ],
}

function getDefaultQuestions(reto: Reto): Question[] {
  return [
    { pregunta: `¿Cuál es el objetivo principal de "${reto.titulo}"?`, opciones: ['Acumular XP sin aprender nada', reto.descripcion.slice(0, 70) + (reto.descripcion.length > 70 ? '...' : ''), 'Superar a otros usuarios en la liga sin esfuerzo'], correcta: 1, explicacion: 'Cada reto está diseñado con un objetivo de aprendizaje concreto y medible.' },
    { pregunta: 'En el simulador de E-Trading, ¿cuánto capital virtual tienes disponible?', opciones: ['€1.000', '€10.000', '€100.000'], correcta: 1, explicacion: 'Empiezas con €10.000 virtuales. Este capital te permite practicar estrategias reales sin riesgo financiero.' },
    { pregunta: '¿Cuál es la regla de oro para proteger tu capital en el trading?', opciones: ['Invertir todo en el activo más popular', 'Nunca arriesgar más del 1-2% de tu capital total en una sola operación', 'Comprar y vender lo más rápido posible'], correcta: 1, explicacion: 'La regla del 1% limita cada pérdida individual, permitiendo sobrevivir rachas negativas y aprender sin arruinarse.' },
    { pregunta: '¿Qué es la diversificación en inversión?', opciones: ['Invertir todo en un activo muy seguro', 'Distribuir el capital entre distintos activos para reducir el riesgo', 'Cambiar de estrategia cada semana'], correcta: 1, explicacion: 'Diversificar significa no poner todos los huevos en la misma cesta. Reduce el riesgo específico de cada activo.' },
    { pregunta: `Si este reto (${reto.tipo}) forma parte de la Fase ${reto.fase}, ¿qué implica?`, opciones: ['Es un reto independiente sin estructura', `Es parte de una ruta de aprendizaje progresiva. La Fase ${reto.fase} requiere conocimientos de las fases anteriores`, 'Solo afecta a los usuarios con plan Elite'], correcta: 1, explicacion: `Las 7 fases de E-Trading tienen una progresión deliberada. La Fase ${reto.fase} construye sobre habilidades anteriores.` },
  ]
}

function getQuestions(reto: Reto): Question[] {
  return RETO_QUESTIONS[reto.id] ?? getDefaultQuestions(reto)
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2, elite: 3, pro_trial: 2 }

const CORRECT_MSGS = ['¡Perfecto!', '¡Exacto!', '¡Muy bien!', '¡Brillante!', '¡Correcto!']
const WRONG_MSGS = ['Casi', 'No exactamente', 'Sigue intentando']

export default function RetosPage() {
  const { data: session } = useSession()
  const racha = (session?.user as Record<string, unknown>)?.racha as number ?? 0
  const userPlan = (session?.user as Record<string, unknown>)?.plan as string ?? 'free'
  const userPlanLevel = PLAN_ORDER[userPlan] ?? 0

  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [expandedFases, setExpandedFases] = useState<number[]>([1])
  const [selectedReto, setSelectedReto] = useState<Reto | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [xpToast, setXpToast] = useState<number | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')

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

  function isLocked(reto: Reto): boolean {
    return PLAN_ORDER[reto.plan] > userPlanLevel
  }

  function isUnlocked(reto: Reto): boolean {
    if (isLocked(reto)) return false
    // Must complete previous reto in same phase
    const phaseRetos = RETOS.filter(r => r.fase === reto.fase)
    const idx = phaseRetos.findIndex(r => r.id === reto.id)
    if (idx === 0) {
      // First in phase: check if previous phase is >50% complete or phase 1
      if (reto.fase === 1) return true
      const prevPhaseRetos = RETOS.filter(r => r.fase === (reto.fase - 1 as typeof reto.fase))
      const prevCompleted = prevPhaseRetos.filter(r => completedIds.includes(r.id)).length
      return prevCompleted >= Math.ceil(prevPhaseRetos.length / 2)
    }
    // Must have completed at least the previous reto
    return completedIds.includes(phaseRetos[idx - 1].id)
  }

  const openPanel = useCallback((reto: Reto) => {
    const qs = shuffleArray(getQuestions(reto))
    setSelectedReto(reto)
    setQuestions(qs)
    setCurrentQ(0)
    setSelected(null)
    setShowResult(false)
    setCorrectCount(0)
    setQuizDone(false)
    setPanelOpen(true)
    setFeedbackMsg('')
  }, [])

  function closePanel() {
    setPanelOpen(false)
    setTimeout(() => setSelectedReto(null), 300)
  }

  function handleAnswer(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    setShowResult(true)
    const q = questions[currentQ]
    const correct = idx === q.correcta
    if (correct) {
      setCorrectCount(c => c + 1)
      setFeedbackMsg(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)])
    } else {
      setFeedbackMsg(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)])
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setShowResult(false)
      setFeedbackMsg('')
    } else {
      const finalCorrect = correctCount + (selected === questions[currentQ]?.correcta ? 1 : 0)
      setCorrectCount(finalCorrect)
      setQuizDone(true)
    }
  }

  async function handleComplete() {
    if (!selectedReto || completing) return
    if (completedIds.includes(selectedReto.id)) {
      closePanel(); return
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

  function retryQuiz() {
    if (!selectedReto) return
    const qs = shuffleArray(getQuestions(selectedReto))
    setQuestions(qs)
    setCurrentQ(0)
    setSelected(null)
    setShowResult(false)
    setCorrectCount(0)
    setQuizDone(false)
    setFeedbackMsg('')
  }

  const q = questions[currentQ]
  const isCorrect = selected !== null && selected === q?.correcta
  const tc = selectedReto ? TIPO_COLORS[selectedReto.tipo] : TIPO_COLORS.daily
  const MIN_CORRECT = 4 // Need 4/5 to pass

  // Final correct count (include last answer)
  const finalCorrect = quizDone
    ? correctCount
    : correctCount
  const passed = finalCorrect >= MIN_CORRECT

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
          +{xpToast} XP
        </div>
      )}

      {/* Racha badge */}
      {racha > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(249,168,37,.08)', border: '.5px solid rgba(249,168,37,.25)',
          borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: 'var(--amber)',
          marginBottom: 16,
        }}>
          Racha activa: {racha} dias seguidos
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Retos</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>7 fases · Tu camino a inversor autónomo</div>
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700 }}>Progreso total</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{totalCompleted} / {RETOS.length}</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(totalCompleted / RETOS.length) * 100}%`, background: 'linear-gradient(90deg,var(--green),#00F090)', borderRadius: 3, transition: 'width .6s' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Completa retos para ganar XP y ascender en la liga</div>
      </div>

      {/* Fases - expandable */}
      {faseGrupos.map(fase => {
        const faseCompleted = fase.retos.filter(r => completedIds.includes(r.id)).length
        const isExpanded = expandedFases.includes(fase.fase)
        const pct = (faseCompleted / fase.retos.length) * 100

        return (
          <div key={fase.fase} style={{ marginBottom: 16, background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, overflow: 'hidden' }}>
            {/* Phase header */}
            <div
              onClick={() => setExpandedFases(prev =>
                prev.includes(fase.fase) ? prev.filter(f => f !== fase.fase) : [...prev, fase.fase]
              )}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: faseCompleted === fase.retos.length ? 'rgba(0,212,122,.15)' : 'var(--bg2)', border: `.5px solid ${faseCompleted === fase.retos.length ? 'rgba(0,212,122,.3)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>
                {faseCompleted === fase.retos.length ? '✓' : fase.fase}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700 }}>Fase {fase.fase}: {fase.nombre}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 120 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 2, transition: 'width .4s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: faseCompleted > 0 ? 'var(--green)' : 'var(--muted)' }}>
                    {faseCompleted}/{fase.retos.length}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{fase.xpRange} XP · {fase.plan}</span>
                </div>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 16, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</div>
            </div>

            {/* Retos grid */}
            {isExpanded && (
              <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {fase.retos.map(reto => {
                  const rtc = TIPO_COLORS[reto.tipo]
                  const locked = isLocked(reto)
                  const unlocked = isUnlocked(reto)
                  const done = completedIds.includes(reto.id)
                  const canOpen = !locked && unlocked

                  return (
                    <div
                      key={reto.id}
                      onClick={() => canOpen && openPanel(reto)}
                      title={locked ? `Requiere plan ${reto.plan}` : !unlocked ? 'Completa el reto anterior primero' : ''}
                      style={{
                        background: done ? 'rgba(0,212,122,.06)' : 'var(--bg2)',
                        border: done ? '.5px solid rgba(0,212,122,.3)' : `.5px solid ${!canOpen && !done ? 'rgba(238,242,240,.04)' : 'var(--border2)'}`,
                        borderRadius: 10, padding: 12,
                        cursor: canOpen ? 'pointer' : 'not-allowed',
                        opacity: (locked || !unlocked) && !done ? 0.45 : 1,
                        transition: 'all .15s',
                        display: 'flex', flexDirection: 'column',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: rtc.bg, color: rtc.color, border: `.5px solid ${rtc.border}` }}>
                          {reto.tipo}
                        </span>
                        {done ? <span style={{ fontSize: 12 }}>✅</span>
                          : locked ? <span style={{ fontSize: 11, opacity: .6 }}>🔒</span>
                          : !unlocked ? <span style={{ fontSize: 11, opacity: .6 }}>🔗</span>
                          : <span style={{ fontSize: 10, color: 'var(--muted2)' }}>#{reto.numero}</span>
                        }
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 5, lineHeight: 1.3, flex: 1, color: done ? 'var(--green)' : 'var(--white)' }}>
                        {reto.titulo}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700 }}>+{reto.xp} XP</span>
                        <span style={{ fontSize: 9, color: 'var(--muted)' }}>{reto.duracion}m</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Slide-over backdrop */}
      {panelOpen && (
        <div
          onClick={closePanel}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(7,9,10,.75)', backdropFilter: 'blur(4px)', transition: 'opacity .3s' }}
        />
      )}

      {/* Slide-over panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
        width: 540, maxWidth: '95vw',
        background: 'var(--bg1)', borderLeft: '.5px solid var(--border2)',
        display: 'flex', flexDirection: 'column',
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(0.22,1,0.36,1)',
        overflowY: 'hidden',
      }}>
        {selectedReto && (
          <>
            {/* Panel header */}
            <div style={{ padding: '20px 24px', borderBottom: '.5px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: tc.bg, color: tc.color, border: `.5px solid ${tc.border}` }}>
                  {selectedReto.tipo}
                </span>
                <button onClick={closePanel} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>{selectedReto.titulo}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 10 }}>{selectedReto.descripcion}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>+{selectedReto.xp} XP</span>
                <span style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: 'var(--muted)' }}>{selectedReto.duracion} min</span>
                <span style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: 'var(--muted)' }}>Fase {selectedReto.fase}</span>
              </div>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {completedIds.includes(selectedReto.id) ? (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Reto completado</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Ya has completado este reto y ganado sus XP.</div>
                  <button onClick={closePanel} style={{ padding: '12px 24px', background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cerrar</button>
                </div>
              ) : !quizDone ? (
                <>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Pregunta {currentQ + 1} de {questions.length}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                        {correctCount} correctas
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${((currentQ) / questions.length) * 100}%`, background: 'var(--green)', borderRadius: 3, transition: 'width .4s' }} />
                    </div>
                  </div>

                  <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, marginBottom: 20, lineHeight: 1.4 }}>{q?.pregunta}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {q?.opciones.map((op, idx) => {
                      let bg = 'var(--bg2)', border = 'var(--border2)', color = 'var(--white)'
                      if (showResult) {
                        if (idx === q.correcta) { bg = 'rgba(0,212,122,.15)'; border = 'var(--green)'; color = 'var(--green)' }
                        else if (idx === selected && idx !== q.correcta) { bg = 'rgba(239,83,80,.12)'; border = 'var(--red)'; color = 'var(--red)' }
                        else { color = 'var(--muted)' }
                      } else if (selected === idx) { bg = 'var(--bg3)'; border = 'var(--green)' }
                      return (
                        <div
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          style={{ background: bg, border: `.5px solid ${border}`, borderRadius: 12, padding: '12px 16px', cursor: showResult ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, color, transition: 'all .1s' }}
                        >
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span style={{ fontSize: 13, lineHeight: 1.4 }}>{op}</span>
                          {showResult && idx === q.correcta && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✅</span>}
                          {showResult && idx === selected && idx !== q.correcta && <span style={{ marginLeft: 'auto', fontSize: 14 }}>❌</span>}
                        </div>
                      )
                    })}
                  </div>

                  {showResult && (
                    <div style={{ background: isCorrect ? 'rgba(0,212,122,.08)' : 'rgba(239,83,80,.08)', border: `.5px solid ${isCorrect ? 'rgba(0,212,122,.3)' : 'rgba(239,83,80,.3)'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginBottom: 4 }}>
                        {feedbackMsg}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>{q?.explicacion}</div>
                    </div>
                  )}

                  {showResult && (
                    <button onClick={handleNext} style={{ width: '100%', padding: 13, background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      {currentQ < questions.length - 1 ? 'Siguiente →' : 'Ver resultado →'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 16 }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>{passed ? '🎯' : '💪'}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                    {passed ? '¡Reto superado!' : 'Casi lo tienes'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                    {finalCorrect} / {questions.length} correctas · Mínimo {MIN_CORRECT}/{questions.length} para pasar
                  </div>

                  {passed ? (
                    <div style={{ background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.3)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800, color: 'var(--green)' }}>+{selectedReto.xp} XP</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Se añadirán a tu perfil</div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(239,83,80,.08)', border: '.5px solid rgba(239,83,80,.25)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                      <div style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.6 }}>
                        Necesitas {MIN_CORRECT} respuestas correctas. Solo has obtenido {finalCorrect}. Repasa la teoría e inténtalo de nuevo.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    {!passed && (
                      <button onClick={retryQuiz} style={{ flex: 1, padding: 12, background: 'var(--bg2)', border: '.5px solid var(--border2)', color: 'var(--white)', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Intentar de nuevo
                      </button>
                    )}
                    {passed && (
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        style={{ flex: 1, padding: 12, background: completing ? 'var(--bg3)' : 'var(--green)', color: completing ? 'var(--muted)' : 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, cursor: completing ? 'not-allowed' : 'pointer' }}
                      >
                        {completing ? 'Guardando...' : 'Completar reto →'}
                      </button>
                    )}
                    <button onClick={closePanel} style={{ padding: '12px 18px', background: 'var(--bg2)', border: '.5px solid var(--border2)', color: 'var(--muted)', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 13, cursor: 'pointer' }}>
                      Cerrar
                    </button>
                  </div>
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
