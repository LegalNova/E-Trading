'use client'
import { useState, useRef, useEffect } from 'react'

const MODOS = [
  { id: 'explicar', emoji: '👨‍🏫', label: 'Explicar', desc: 'Explica conceptos de inversión', placeholder: 'Explícame qué es el PER, la diversificación, el interés compuesto...' },
  { id: 'operacion', emoji: '📊', label: 'Mi operación', desc: 'Analiza tus operaciones', placeholder: 'Acabo de comprar 5 acciones de Apple a $185. ¿Qué opinas de esta decisión?' },
  { id: 'aprender', emoji: '🗺️', label: 'Qué aprender', desc: 'Ruta de aprendizaje personalizada', placeholder: 'He completado los primeros 5 retos. ¿Qué debería aprender ahora?' },
  { id: 'mercado', emoji: '🌍', label: 'Mercado', desc: 'Análisis del mercado en vivo', placeholder: '¿Qué está pasando con el mercado hoy? ¿Por qué sube la bolsa?' },
  { id: 'sesgos', emoji: '🧠', label: 'Sesgos', desc: 'Detecta sesgos conductuales', placeholder: 'Siento que tengo que comprar Bitcoin ahora que está subiendo mucho...' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  mode?: string
  ts: number
}

function renderContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export default function IAPage() {
  const [modo, setModo] = useState('explicar')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy **E-AI**, tu profesor personal de inversión en E-Trading.\n\nEstoy aquí para ayudarte a aprender sobre mercados financieros de forma segura — todo es **simulación educativa**, sin dinero real.\n\nElige un modo arriba y pregúntame lo que quieras. Recuerda: no hay preguntas tontas cuando se aprende a invertir. 📈',
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isDemo, setIsDemo] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const modoActual = MODOS.find(m => m.id === modo)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const newMessage: Message = { role: 'user', content: userMsg, mode: modo, ts: Date.now() }
    setMessages(prev => [...prev, newMessage])
    setLoading(true)

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, mode: modo, history }),
      })
      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}`, ts: Date.now() }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, mode: modo, ts: Date.now() }])
        if (data.remaining !== undefined) setRemaining(data.remaining)
        if (data.isDemo !== undefined) setIsDemo(data.isDemo)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error de conexión. Comprueba tu conexión e intenta de nuevo.', ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px 0', borderBottom: '.5px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 800 }}>🤖 E-AI Profesora</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDemo !== null && (
              <div style={{ fontSize: 11, color: isDemo ? 'var(--amber)' : 'var(--green)', background: isDemo ? 'rgba(249,168,37,.1)' : 'rgba(0,212,122,.1)', padding: '4px 10px', borderRadius: 100, border: `.5px solid ${isDemo ? 'rgba(249,168,37,.3)' : 'rgba(0,212,122,.3)'}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDemo ? 'var(--amber)' : 'var(--green)', display: 'inline-block' }} />
                {isDemo ? 'Modo demo' : 'IA conectada'}
              </div>
            )}
            {remaining !== null && (
              <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--bg2)', padding: '4px 10px', borderRadius: 100, border: '.5px solid var(--border2)' }}>
                {remaining} mensajes restantes hoy
              </div>
            )}
          </div>
        </div>

        {/* Modos */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 12, overflowX: 'auto' }}>
          {MODOS.map(m => (
            <button key={m.id} onClick={() => setModo(m.id)} style={{
              padding: '6px 14px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0,
              border: `.5px solid ${modo === m.id ? 'var(--green)' : 'var(--border2)'}`,
              background: modo === m.id ? 'var(--gfaint)' : 'transparent',
              color: modo === m.id ? 'var(--green)' : 'var(--muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: msg.role === 'assistant' ? 'var(--green)' : 'var(--bg2)', border: '.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div style={{ maxWidth: '72%' }}>
              {msg.role === 'assistant' && msg.mode && (
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '.04em' }}>
                  {MODOS.find(m => m.id === msg.mode)?.emoji} {MODOS.find(m => m.id === msg.mode)?.label}
                </div>
              )}
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'var(--gfaint)' : 'var(--bg1)',
                border: `.5px solid ${msg.role === 'user' ? 'rgba(0,212,122,.2)' : 'var(--border2)'}`,
                fontSize: 13, lineHeight: 1.7,
              }}
                dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
              />
              <div style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {new Date(msg.ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🤖</div>
            <div style={{ padding: '14px 18px', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: '14px 14px 14px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: `blink 1.2s ${i * 0.2}s infinite` }} />
              ))}
              <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 6 }}>E-AI está pensando...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Modo description */}
      <div style={{ padding: '8px 24px', borderTop: '.5px solid var(--border)', borderBottom: '.5px solid var(--border)', background: 'var(--bg1)', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span>{modoActual.emoji}</span>
        <span><strong style={{ color: 'var(--white)' }}>{modoActual.label}:</strong> {modoActual.desc}</span>
      </div>

      {/* Input */}
      <div style={{ padding: '14px 24px', display: 'flex', gap: 10, flexShrink: 0, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={modoActual.placeholder}
          rows={2}
          style={{
            flex: 1, background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 12,
            padding: '12px 16px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none',
            resize: 'none', lineHeight: 1.5,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 20px', background: 'var(--green)', color: 'var(--bg)', border: 'none',
            borderRadius: 12, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            opacity: loading || !input.trim() ? .5 : 1, flexShrink: 0,
          }}
        >
          Enviar ↑
        </button>
      </div>
    </div>
  )
}
