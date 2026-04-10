'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ASSETS, AssetCategory } from '@/data/assets'
import { usePrices, formatPrice } from '@/hooks/usePrices'

const CATS: { key: AssetCategory | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'acciones-us', label: '🇺🇸 Acciones US' },
  { key: 'acciones-eu', label: '🇪🇺 Europa' },
  { key: 'cripto', label: '₿ Cripto' },
  { key: 'etfs', label: '📦 ETFs' },
  { key: 'forex', label: '💱 Forex' },
  { key: 'materias', label: '🛢️ Materias' },
  { key: 'indices', label: '📊 Índices' },
]

function MiniSparkline({ up }: { up: boolean }) {
  const pts = useMemo(() => {
    const arr: number[] = []
    let v = 50
    for (let i = 0; i < 20; i++) {
      v = Math.max(10, Math.min(90, v + (Math.random() - (up ? 0.44 : 0.56)) * 12))
      arr.push(v)
    }
    return arr
  }, [up])
  const w = 80, h = 32
  const min = Math.min(...pts), max = Math.max(...pts)
  const range = max - min || 1
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  const color = up ? '#00D47A' : '#EF5350'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: 80, height: 32 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

export default function MercadoPage() {
  const { prices } = usePrices()
  const [cat, setCat] = useState<AssetCategory | 'todos'>('todos')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = ASSETS
    if (cat !== 'todos') list = list.filter(a => a.category === cat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
    }
    return list
  }, [cat, search])

  // Top movers: 6 assets with highest absolute changePct
  const topMovers = useMemo(() => {
    return [...ASSETS]
      .filter(a => prices[a.symbol])
      .sort((a, b) => Math.abs(prices[b.symbol]?.changePct ?? 0) - Math.abs(prices[a.symbol]?.changePct ?? 0))
      .slice(0, 8)
  }, [prices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Search bar */}
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar activos..."
            style={{
              width: '100%',
              background: 'var(--bg2)',
              border: '.5px solid var(--border2)',
              borderRadius: 14,
              padding: '13px 16px 13px 44px',
              color: 'var(--white)',
              fontFamily: 'var(--sans)',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
          {CATS.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              style={{
                padding: '7px 16px',
                borderRadius: 100,
                whiteSpace: 'nowrap',
                border: 'none',
                background: cat === c.key ? 'var(--green)' : 'var(--bg2)',
                color: cat === c.key ? 'var(--bg)' : 'var(--muted)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background .15s, color .15s',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Top movers horizontal scroll — only when not filtering */}
        {cat === 'todos' && !search.trim() && topMovers.length > 0 && (
          <div style={{ padding: '4px 20px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Más activos hoy
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
              {topMovers.map(asset => {
                const pd = prices[asset.symbol]
                if (!pd) return null
                const up = pd.changePct >= 0
                return (
                  <Link
                    key={asset.symbol}
                    href={`/mercado/${asset.symbol.toLowerCase()}`}
                    style={{ textDecoration: 'none', flexShrink: 0 }}
                  >
                    <div
                      style={{
                        width: 120,
                        background: 'var(--bg1)',
                        border: '.5px solid var(--border2)',
                        borderRadius: 16,
                        padding: '14px 12px',
                        cursor: 'pointer',
                        transition: 'border-color .15s, transform .15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = up ? 'rgba(0,212,122,.4)' : 'rgba(239,83,80,.4)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border2)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: 'var(--bg2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 11, color: 'var(--green)', marginBottom: 8,
                      }}>
                        {asset.flag ?? asset.symbol.slice(0, 3)}
                      </div>
                      {/* Symbol */}
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--white)', marginBottom: 2 }}>{asset.symbol}</div>
                      {/* Change badge */}
                      <div style={{
                        display: 'inline-block',
                        fontSize: 11, fontWeight: 700,
                        color: up ? 'var(--green)' : 'var(--red)',
                        background: up ? 'rgba(0,212,122,.1)' : 'rgba(239,83,80,.1)',
                        padding: '2px 6px', borderRadius: 6, marginBottom: 6,
                      }}>
                        {up ? '+' : ''}{pd.changePct.toFixed(2)}%
                      </div>
                      {/* Price */}
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>
                        {formatPrice(pd.price, asset.symbol)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Main list */}
        <div style={{ padding: '0 0 20px' }}>
          {cat === 'todos' && !search.trim() && (
            <div style={{ padding: '0 20px 10px', fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Todos los activos
            </div>
          )}

          {filtered.map((asset, idx) => {
            const pd = prices[asset.symbol]
            if (!pd) return null
            const up = pd.changePct >= 0
            return (
              <Link
                key={asset.symbol}
                href={`/mercado/${asset.symbol.toLowerCase()}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom: idx < filtered.length - 1 ? '.5px solid rgba(255,255,255,.05)' : 'none',
                    transition: 'background .15s',
                    cursor: 'pointer',
                    gap: 12,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Left: icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: 'var(--bg2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 11, color: 'var(--green)', flexShrink: 0,
                      letterSpacing: '-.02em',
                    }}>
                      {asset.flag ?? asset.symbol.slice(0, 3)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {asset.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{asset.symbol}</div>
                    </div>
                  </div>

                  {/* Center: sparkline */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <MiniSparkline up={up} />
                  </div>

                  {/* Right: price + change */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
                    <div style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 15,
                      fontWeight: 700,
                      color: pd.direction === 'up' ? 'var(--green)' : pd.direction === 'down' ? 'var(--red)' : 'var(--white)',
                      transition: 'color .3s',
                      marginBottom: 3,
                    }}>
                      {formatPrice(pd.price, asset.symbol)}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: up ? 'var(--green)' : 'var(--red)',
                      background: up ? 'rgba(0,212,122,.1)' : 'rgba(239,83,80,.1)',
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}>
                      {up ? '+' : ''}{pd.changePct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700 }}>Sin resultados</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Prueba con otro ticker o categoría</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
