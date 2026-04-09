'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePrices, formatPrice } from '@/hooks/usePrices'

const DEMO_ASSETS = ['AAPL', 'TSLA', 'NVDA', 'BTC', 'ETH', 'SPY']

interface Position {
  symbol: string
  shares: number
  avgPrice: number
}

export default function DemoPage() {
  const { prices } = usePrices(DEMO_ASSETS)
  const [cash, setCash] = useState(10000)
  const [positions, setPositions] = useState<Position[]>([])
  const [selected, setSelected] = useState('AAPL')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [ops, setOps] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function execute() {
    const price = prices[selected]?.price
    if (!price || !amount) return
    const euros = parseFloat(amount)
    if (isNaN(euros) || euros <= 0) return

    if (mode === 'buy') {
      if (euros > cash) { showToast('No tienes suficiente dinero'); return }
      const shares = euros / price
      setCash(c => c - euros)
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === selected)
        if (existing) {
          return prev.map(p => p.symbol === selected
            ? { ...p, shares: p.shares + shares, avgPrice: (p.avgPrice * p.shares + euros) / (p.shares + shares) }
            : p)
        }
        return [...prev, { symbol: selected, shares, avgPrice: price }]
      })
      showToast(`✅ Comprado ${shares.toFixed(4)} ${selected}`)
    } else {
      const pos = positions.find(p => p.symbol === selected)
      if (!pos) { showToast('No tienes esta posición'); return }
      const sharesToSell = euros / price
      if (sharesToSell > pos.shares) { showToast('No tienes suficientes acciones'); return }
      const proceeds = sharesToSell * price
      setCash(c => c + proceeds)
      setPositions(prev => {
        const remaining = pos.shares - sharesToSell
        if (remaining < 0.0001) return prev.filter(p => p.symbol !== selected)
        return prev.map(p => p.symbol === selected ? { ...p, shares: remaining } : p)
      })
      showToast(`✅ Vendido ${sharesToSell.toFixed(4)} ${selected}`)
    }

    setAmount('')
    const newOps = ops + 1
    setOps(newOps)
    if (newOps >= 5) setShowModal(true)
  }

  const totalInvested = positions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0)
  const totalValue = positions.reduce((sum, p) => {
    const price = prices[p.symbol]?.price ?? p.avgPrice
    return sum + p.shares * price
  }, 0)
  const totalPnL = totalValue - totalInvested
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const portfolioTotal = cash + totalValue

  return (
    <div style={{ minHeight: '100vh', background: '#07090A', color: '#EEF2F0', fontFamily: 'var(--sans, Mulish, sans-serif)' }}>

      {/* Top banner */}
      <div style={{
        background: 'rgba(249,168,37,.12)', borderBottom: '.5px solid rgba(249,168,37,.25)',
        padding: '10px 24px', textAlign: 'center', fontSize: 13, color: '#F9A825',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span>🎮 Modo Demo — Dinero virtual €10.000. Sin registro. Sin riesgo real.</span>
        <Link href="/register" style={{
          background: '#F9A825', color: '#07090A', padding: '4px 12px',
          borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none',
        }}>Crear cuenta gratis →</Link>
      </div>

      {/* Header */}
      <div style={{
        borderBottom: '.5px solid rgba(238,242,240,.06)', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#00D47A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07090A" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontWeight: 800, fontSize: 18 }}>E-Trading</span>
          <span style={{
            background: 'rgba(249,168,37,.15)', color: '#F9A825', fontSize: 10,
            fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '.06em',
          }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" style={{
            padding: '8px 16px', borderRadius: 8, border: '.5px solid rgba(238,242,240,.12)',
            color: '#EEF2F0', fontSize: 13, textDecoration: 'none',
          }}>Iniciar sesión</Link>
          <Link href="/register" style={{
            padding: '8px 16px', borderRadius: 8, background: '#00D47A',
            color: '#07090A', fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>Regístrate gratis</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, minHeight: 'calc(100vh - 100px)' }}>

        {/* Left — Market + Trade */}
        <div style={{ padding: 24, borderRight: '.5px solid rgba(238,242,240,.06)' }}>
          <h2 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            Simulador de mercado
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(238,242,240,.45)', marginBottom: 24 }}>
            Selecciona un activo, elige cuánto invertir y practica sin riesgo.
          </p>

          {/* Asset grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
            {DEMO_ASSETS.map(sym => {
              const p = prices[sym]
              const isSelected = selected === sym
              return (
                <button key={sym} onClick={() => setSelected(sym)} style={{
                  background: isSelected ? 'rgba(0,212,122,.12)' : '#0C1014',
                  border: `.5px solid ${isSelected ? 'rgba(0,212,122,.4)' : 'rgba(238,242,240,.06)'}`,
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all .15s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#EEF2F0', marginBottom: 4 }}>{sym}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--serif, Syne, sans-serif)', color: '#EEF2F0' }}>
                    {p ? `$${formatPrice(p.price)}` : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: p && p.changePct >= 0 ? '#00D47A' : '#EF5350', marginTop: 2 }}>
                    {p ? `${p.changePct >= 0 ? '+' : ''}${p.changePct.toFixed(2)}%` : '—'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Trade panel */}
          <div style={{
            background: '#0C1014', border: '.5px solid rgba(238,242,240,.08)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['buy', 'sell'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  background: mode === m ? (m === 'buy' ? '#00D47A' : '#EF5350') : '#182030',
                  color: mode === m ? '#07090A' : 'rgba(238,242,240,.45)',
                  transition: 'all .15s',
                }}>
                  {m === 'buy' ? 'Comprar' : 'Vender'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(238,242,240,.45)', display: 'block', marginBottom: 8 }}>
                Activo seleccionado
              </label>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#00D47A' }}>{selected}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(238,242,240,.45)', display: 'block', marginBottom: 8 }}>
                Importe en €
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100"
                style={{
                  width: '100%', background: '#101820', border: '.5px solid rgba(238,242,240,.08)',
                  borderRadius: 10, padding: '12px 16px', color: '#EEF2F0', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {[100, 250, 500, 1000].map(v => (
                  <button key={v} onClick={() => setAmount(String(v))} style={{
                    flex: 1, padding: '6px', borderRadius: 6, border: '.5px solid rgba(238,242,240,.1)',
                    background: 'transparent', color: 'rgba(238,242,240,.55)', fontSize: 12, cursor: 'pointer',
                  }}>€{v}</button>
                ))}
              </div>
            </div>

            <button onClick={execute} style={{
              width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: mode === 'buy' ? '#00D47A' : '#EF5350', color: '#07090A',
              fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 15, fontWeight: 700,
            }}>
              {mode === 'buy' ? `Comprar ${selected}` : `Vender ${selected}`} →
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(238,242,240,.35)', marginTop: 12 }}>
              Operaciones demo: {ops}/5
            </div>
          </div>
        </div>

        {/* Right — Portfolio */}
        <div style={{ padding: 24 }}>
          <div style={{
            background: '#0C1014', border: '.5px solid rgba(238,242,240,.08)',
            borderRadius: 16, padding: 20, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(238,242,240,.45)', marginBottom: 12 }}>
              Portafolio virtual
            </div>
            <div style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
              €{portfolioTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 13, color: totalPnL >= 0 ? '#00D47A' : '#EF5350' }}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}€ ({totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <div style={{ background: '#101820', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(238,242,240,.45)', marginBottom: 4 }}>EFECTIVO</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>€{cash.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: '#101820', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(238,242,240,.45)', marginBottom: 4 }}>INVERTIDO</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>€{totalValue.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(238,242,240,.45)', marginBottom: 12 }}>
            Posiciones ({positions.length})
          </div>
          {positions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(238,242,240,.25)', fontSize: 13 }}>
              Aún no tienes posiciones.<br />Compra tu primer activo.
            </div>
          ) : (
            positions.map(pos => {
              const currentPrice = prices[pos.symbol]?.price ?? pos.avgPrice
              const value = pos.shares * currentPrice
              const pnl = value - pos.shares * pos.avgPrice
              const pnlPct = (pnl / (pos.shares * pos.avgPrice)) * 100
              return (
                <div key={pos.symbol} style={{
                  background: '#0C1014', border: '.5px solid rgba(238,242,240,.06)',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{pos.symbol}</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>€{value.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,242,240,.45)' }}>
                    <span>{pos.shares.toFixed(4)} uds · avg €{pos.avgPrice.toFixed(2)}</span>
                    <span style={{ color: pnl >= 0 ? '#00D47A' : '#EF5350' }}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}€ ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )
            })
          )}

          {ops >= 3 && ops < 5 && (
            <div style={{
              marginTop: 20, background: 'rgba(0,212,122,.08)', border: '.5px solid rgba(0,212,122,.2)',
              borderRadius: 12, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#EEF2F0', marginBottom: 10 }}>
                ¿Te gusta E-Trading? Regístrate para guardar tu progreso.
              </div>
              <Link href="/register" style={{
                background: '#00D47A', color: '#07090A', padding: '8px 20px',
                borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block',
              }}>Crear cuenta gratis →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal after 5 ops */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(7,9,10,.85)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
        }}>
          <div style={{
            background: '#0C1014', border: '.5px solid rgba(238,242,240,.1)',
            borderRadius: 24, padding: '40px', maxWidth: 400, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--serif, Syne, sans-serif)', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
              ¡Has completado la demo!
            </h2>
            <p style={{ color: 'rgba(238,242,240,.55)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Has usado 5 operaciones de demo. Regístrate gratis para continuar sin límites, guardar tu progreso y acceder a los 100 retos.
            </p>
            <Link href="/register" style={{
              display: 'block', background: '#00D47A', color: '#07090A', padding: '14px',
              borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', marginBottom: 12,
            }}>Crear cuenta gratis →</Link>
            <button onClick={() => setShowModal(false)} style={{
              background: 'transparent', border: 'none', color: 'rgba(238,242,240,.4)',
              fontSize: 13, cursor: 'pointer',
            }}>Seguir en modo demo</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#0C1014', border: '.5px solid rgba(238,242,240,.12)',
          borderRadius: 10, padding: '12px 20px', fontSize: 14, color: '#EEF2F0',
          zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,.4)',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        input::placeholder { color: rgba(238,242,240,.25); }
        input:focus { border-color: rgba(0,212,122,.4) !important; }
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  )
}
