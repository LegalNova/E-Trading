'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ASSETS, CATEGORY_LABELS, AssetCategory } from '@/data/assets'
import { usePrices, formatPrice } from '@/hooks/usePrices'

type SortKey = 'symbol' | 'price' | 'changePct' | 'volume'
type SortDir = 'asc' | 'desc'
type ViewMode = 'table' | 'cards'

const CATS: { key: AssetCategory | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'acciones-us', label: '🇺🇸 Acciones EE.UU.' },
  { key: 'acciones-eu', label: '🇪🇺 Acciones Europa' },
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
  const w = 80, h = 28
  const min = Math.min(...pts), max = Math.max(...pts)
  const range = max - min || 1
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  const color = up ? '#00D47A' : '#EF5350'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: 80, height: 28 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

export default function MercadoPage() {
  const { prices } = usePrices()
  const [cat, setCat] = useState<AssetCategory | 'todos'>('todos')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('symbol')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filterMode, setFilterMode] = useState<'all' | 'up' | 'down'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const filtered = useMemo(() => {
    let list = ASSETS
    if (cat !== 'todos') list = list.filter(a => a.category === cat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
    }
    if (filterMode === 'up') list = list.filter(a => (prices[a.symbol]?.changePct ?? 0) >= 0)
    if (filterMode === 'down') list = list.filter(a => (prices[a.symbol]?.changePct ?? 0) < 0)
    return [...list].sort((a, b) => {
      let av: number | string, bv: number | string
      if (sortKey === 'symbol') { av = a.symbol; bv = b.symbol }
      else if (sortKey === 'price') { av = prices[a.symbol]?.price ?? 0; bv = prices[b.symbol]?.price ?? 0 }
      else if (sortKey === 'changePct') { av = prices[a.symbol]?.changePct ?? 0; bv = prices[b.symbol]?.changePct ?? 0 }
      else { av = prices[a.symbol]?.volume ?? 0; bv = prices[b.symbol]?.volume ?? 0 }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
  }, [cat, search, sortKey, sortDir, filterMode, prices])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span style={{ fontSize: 9, opacity: sortKey === k ? 1 : 0.3, marginLeft: 3 }}>
      {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px 0', borderBottom: '.5px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800 }}>Mercado</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {ASSETS.length} activos · {filtered.length} mostrando ·{' '}
              <span style={{ color: 'var(--green)' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', marginRight: 4, animation: 'blink 1.5s infinite', verticalAlign: 'middle' }} />
                Precios en tiempo real
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 9, padding: 3, gap: 2 }}>
              {([['table', '☰ Tabla'], ['cards', '⊞ Cards']] as [ViewMode, string][]).map(([v, label]) => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: viewMode === v ? 'var(--bg3)' : 'transparent',
                  color: viewMode === v ? 'var(--white)' : 'var(--muted)',
                  fontSize: 11, fontWeight: 600,
                }}>{label}</button>
              ))}
            </div>
            {/* Búsqueda */}
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Buscar..."
              style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '9px 14px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none', width: 220 }}
            />
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12 }}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)} style={{
              padding: '5px 12px', borderRadius: 100, whiteSpace: 'nowrap',
              border: `.5px solid ${cat === c.key ? 'var(--green)' : 'var(--border2)'}`,
              background: cat === c.key ? 'var(--gfaint)' : 'transparent',
              color: cat === c.key ? 'var(--green)' : 'var(--muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{c.label}</button>
          ))}
          <div style={{ width: 1, background: 'var(--border2)', margin: '0 4px', flexShrink: 0 }} />
          {(['all', 'up', 'down'] as const).map(f => (
            <button key={f} onClick={() => setFilterMode(f)} style={{
              padding: '5px 12px', borderRadius: 100,
              border: `.5px solid ${filterMode === f ? (f === 'up' ? 'var(--green)' : f === 'down' ? 'var(--red)' : 'var(--border2)') : 'var(--border2)'}`,
              background: filterMode === f ? (f === 'up' ? 'rgba(0,212,122,.1)' : f === 'down' ? 'rgba(239,83,80,.1)' : 'var(--bg3)') : 'transparent',
              color: filterMode === f ? (f === 'up' ? 'var(--green)' : f === 'down' ? 'var(--red)' : 'var(--white)') : 'var(--muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              {f === 'all' ? 'Todos' : f === 'up' ? '▲ Subidas' : '▼ Bajadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {viewMode === 'table' ? (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 110px', padding: '8px 20px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10, borderBottom: '.5px solid var(--border)' }}>
              {[
                { k: 'symbol' as SortKey, label: 'Activo' },
                { k: 'price' as SortKey, label: 'Precio', right: true },
                { k: 'changePct' as SortKey, label: 'Cambio 24h', right: true },
                { k: 'volume' as SortKey, label: 'Volumen', right: true },
              ].map(col => (
                <div key={col.k} onClick={() => toggleSort(col.k)} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', cursor: 'pointer', textAlign: col.right ? 'right' : 'left', userSelect: 'none' }}>
                  {col.label}<SortIcon k={col.k} />
                </div>
              ))}
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>Categoría</div>
              <div />
            </div>

            {filtered.map(asset => {
              const pd = prices[asset.symbol]
              if (!pd) return null
              const up = pd.changePct >= 0
              const flash = pd.direction === 'up' ? 'rgba(0,212,122,.04)' : pd.direction === 'down' ? 'rgba(239,83,80,.04)' : 'transparent'
              return (
                <div key={asset.symbol} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 110px', padding: '10px 20px', borderBottom: '.5px solid var(--border)', alignItems: 'center', background: flash, transition: 'background .5s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, color: 'var(--green)', flexShrink: 0, letterSpacing: '-.02em' }}>
                      {asset.flag ?? asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{asset.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{asset.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, color: pd.direction === 'up' ? 'var(--green)' : pd.direction === 'down' ? 'var(--red)' : 'var(--white)', transition: 'color .3s' }}>
                    {formatPrice(pd.price, asset.symbol)}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
                      {up ? '+' : ''}{pd.changePct.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: 10, color: up ? 'var(--green)' : 'var(--red)', opacity: .7 }}>
                      {up ? '+' : ''}{formatPrice(Math.abs(pd.change), asset.symbol)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>
                    {pd.volume > 1000000 ? `${(pd.volume / 1000000).toFixed(1)}M` : pd.volume > 1000 ? `${(pd.volume / 1000).toFixed(0)}K` : pd.volume}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--muted3)', color: 'var(--muted)', border: '.5px solid var(--border2)' }}>
                      {CATEGORY_LABELS[asset.category]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                    <Link href={`/mercado/${asset.symbol.toLowerCase()}`} style={{ padding: '6px 14px', background: 'var(--green)', color: 'var(--bg)', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                      Operar
                    </Link>
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          /* Cards grid */
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {filtered.map(asset => {
              const pd = prices[asset.symbol]
              if (!pd) return null
              const up = pd.changePct >= 0
              return (
                <Link key={asset.symbol} href={`/mercado/${asset.symbol.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg1)', border: `.5px solid ${pd.direction === 'up' ? 'rgba(0,212,122,.2)' : pd.direction === 'down' ? 'rgba(239,83,80,.2)' : 'var(--border2)'}`,
                    borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                    transition: 'border-color .3s, transform .15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--green)' }}>
                          {asset.flag ?? asset.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)' }}>{asset.symbol}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{asset.name.length > 14 ? asset.name.slice(0, 13) + '…' : asset.name}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)', background: up ? 'rgba(0,212,122,.1)' : 'rgba(239,83,80,.1)', padding: '2px 7px', borderRadius: 6 }}>
                        {up ? '+' : ''}{pd.changePct.toFixed(2)}%
                      </span>
                    </div>

                    {/* Price */}
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, marginBottom: 8, color: pd.direction === 'up' ? 'var(--green)' : pd.direction === 'down' ? 'var(--red)' : 'var(--white)', transition: 'color .3s' }}>
                      {formatPrice(pd.price, asset.symbol)}
                    </div>

                    {/* Sparkline */}
                    <MiniSparkline up={up} />

                    {/* Volume */}
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Vol: {pd.volume > 1000000 ? `${(pd.volume / 1000000).toFixed(1)}M` : `${(pd.volume / 1000).toFixed(0)}K`}</span>
                      <span style={{ color: up ? 'var(--green)' : 'var(--red)' }}>
                        {up ? '+' : ''}{formatPrice(Math.abs(pd.change), asset.symbol)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700 }}>Sin resultados</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Prueba con otro ticker o categoría</div>
          </div>
        )}
      </div>
    </div>
  )
}
