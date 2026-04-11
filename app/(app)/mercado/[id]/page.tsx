'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ASSET_BY_SYMBOL, CATEGORY_LABELS } from '@/data/assets'
import { usePrices, formatPrice } from '@/hooks/usePrices'
import { usePortfolio } from '@/hooks/usePortfolio'

type Tab = '1D' | '1S' | '1M' | '3M' | '1A'
type OpType = 'buy' | 'sell'
type OrderType = 'market' | 'limit' | 'stop'

function generateChart(basePrice: number, points: number, volatility: number) {
  const data: number[] = []
  let price = basePrice * (1 + (Math.random() - 0.5) * 0.1)
  for (let i = 0; i < points; i++) {
    price *= 1 + (Math.random() - 0.499) * volatility
    data.push(price)
  }
  return data
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 600, h = 180
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#grad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function WeekRangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
        <span>Mín 52s</span>
        <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 10 }}>Rango anual</span>
        <span>Máx 52s</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--red),var(--amber),var(--green))', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: -3, left: `calc(${pct}% - 6px)`, width: 12, height: 12, borderRadius: '50%', background: 'var(--white)', border: '2px solid var(--bg)', boxShadow: '0 0 0 2px rgba(255,255,255,.3)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginTop: 6 }}>
        <span style={{ color: 'var(--red)' }}>—</span>
        <span style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 400 }}>Actual: {pct.toFixed(0)}% del rango</span>
        <span style={{ color: 'var(--green)' }}>—</span>
      </div>
    </div>
  )
}

export default function AssetPage() {
  const params = useParams()
  const symbolRaw = (params.id as string).toUpperCase()
  const asset = ASSET_BY_SYMBOL[symbolRaw]
  const { prices } = usePrices(asset ? [asset.symbol] : [])
  const pd = asset ? prices[asset.symbol] : null
  const { data: portfolio, refetch: refetchPortfolio } = usePortfolio()

  const [tab, setTab] = useState<Tab>('1D')
  const [opType, setOpType] = useState<OpType>('buy')
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [chartData, setChartData] = useState<number[]>([])
  const [notification, setNotification] = useState('')
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const TABS: Tab[] = ['1D', '1S', '1M', '3M', '1A']
  const TAB_CONFIG: Record<Tab, { points: number; vol: number }> = {
    '1D': { points: 80, vol: 0.002 },
    '1S': { points: 120, vol: 0.004 },
    '1M': { points: 150, vol: 0.008 },
    '3M': { points: 180, vol: 0.015 },
    '1A': { points: 250, vol: 0.025 },
  }

  useEffect(() => {
    if (!asset) return
    const { points, vol } = TAB_CONFIG[tab]
    setChartData(generateChart(asset.basePrice, points, vol))
  }, [tab, asset?.symbol]) // eslint-disable-line

  if (!asset) {
    return (
      <div style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700 }}>Activo no encontrado</div>
        <Link href="/mercado" style={{ color: 'var(--green)', textDecoration: 'none', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Volver al mercado</Link>
      </div>
    )
  }

  const up = (pd?.changePct ?? 0) >= 0
  const chartColor = up ? '#00D47A' : '#EF5350'
  const currentPrice = pd?.price ?? asset.basePrice
  const units = amount ? parseFloat(amount) / currentPrice : 0
  const low52 = asset.basePrice * 0.68
  const high52 = asset.basePrice * 1.42

  function openModal(type: OpType) {
    setOpType(type)
    setShowTradeModal(true)
  }

  function handleOperate(e: React.FormEvent) {
    e.preventDefault()
    const total = parseFloat(amount)
    if (!total || total <= 0) return
    setShowConfirm(true)
  }

  async function confirmTrade() {
    setConfirming(true)
    try {
      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: opType,
          symbol: asset.symbol,
          amountEur: parseFloat(amount),
          currentPrice: currentPrice,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setNotification(`Error: ${json.error ?? 'No se pudo ejecutar'}`)
      } else {
        setNotification(`${opType === 'buy' ? 'Compra' : 'Venta'} ejecutada: ${Number(json.shares).toFixed(6)} ${asset.symbol}`)
        setAmount('')
        setLimitPrice('')
        setShowTradeModal(false)
        await refetchPortfolio()
      }
    } catch {
      setNotification('Error de conexión')
    } finally {
      setConfirming(false)
      setShowConfirm(false)
      setTimeout(() => setNotification(''), 5000)
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

        {/* A. Sticky top header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(7,9,10,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '.5px solid var(--border)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <Link href="/mercado" style={{
            color: 'var(--muted)', textDecoration: 'none', fontSize: 20, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8, background: 'var(--bg2)',
            flexShrink: 0,
          }}>←</Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {asset.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{asset.symbol}</div>
          </div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800, flexShrink: 0,
            color: pd?.direction === 'up' ? 'var(--green)' : pd?.direction === 'down' ? 'var(--red)' : 'var(--white)',
            transition: 'color .3s',
          }}>
            {formatPrice(currentPrice, asset.symbol)}
          </div>
        </div>

        {/* Main scrollable area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>

          {/* Notification */}
          {notification && (
            <div style={{ margin: '12px 16px 0', background: 'var(--gfaint)', border: '.5px solid rgba(0,212,122,.3)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: 'var(--green)', lineHeight: 1.5 }}>
              ✅ {notification}
            </div>
          )}

          {/* B. Hero section */}
          <div style={{ padding: '24px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: 'var(--bg2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 16, color: 'var(--green)', flexShrink: 0,
              }}>
                {asset.flag ?? asset.symbol.slice(0, 3)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, color: 'var(--white)', marginBottom: 2 }}>
                  {asset.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span>{asset.symbol}</span>
                  <span>·</span>
                  <span>{CATEGORY_LABELS[asset.category]}</span>
                  <span>·</span>
                  <span>{asset.currency}</span>
                  {asset.sector && <><span>·</span><span>{asset.sector}</span></>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{
                fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 800, lineHeight: 1,
                color: pd?.direction === 'up' ? 'var(--green)' : pd?.direction === 'down' ? 'var(--red)' : 'var(--white)',
                transition: 'color .3s', marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              }}>
                <span>{formatPrice(currentPrice, asset.symbol)}</span>
                {pd?.source === 'simulated' && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
                    padding: '2px 6px', borderRadius: 4,
                    background: 'var(--bg3)', color: 'var(--muted)',
                    fontFamily: 'var(--sans)',
                  }}>SIM</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
                  color: up ? 'var(--green)' : 'var(--red)',
                  background: up ? 'rgba(0,212,122,.1)' : 'rgba(239,83,80,.1)',
                }}>
                  {up ? '+' : ''}{pd?.changePct.toFixed(2) ?? '0.00'}%
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {up ? '+' : ''}{formatPrice(Math.abs(pd?.change ?? 0), asset.symbol)} hoy
                </span>
              </div>
              {asset.description && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginTop: 14, marginBottom: 0 }}>
                  {asset.description}
                </p>
              )}
            </div>
          </div>

          {/* C. Chart section */}
          <div style={{ margin: '0 16px 16px', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 16, padding: 18 }}>
            {/* Time tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none',
                  background: tab === t ? (up ? 'var(--green)' : 'var(--red)') : 'var(--bg2)',
                  color: tab === t ? 'var(--bg)' : 'var(--muted)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
            <MiniChart data={chartData} color={chartColor} />
            {/* Chart stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 14 }}>
              {[
                { lbl: 'Apertura', val: formatPrice(asset.basePrice, asset.symbol) },
                { lbl: 'Máx. día', val: formatPrice(pd?.high ?? asset.basePrice * 1.008, asset.symbol) },
                { lbl: 'Mín. día', val: formatPrice(pd?.low ?? asset.basePrice * 0.992, asset.symbol) },
              ].map(s => (
                <div key={s.lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 3 }}>{s.lbl}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* D. Key stats grid */}
          <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Estadísticas clave</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {[
                { lbl: 'Cap. mercado', val: asset.marketCap ? asset.marketCap : '—' },
                { lbl: 'PER', val: asset.pe != null ? `${asset.pe}x` : '—' },
                { lbl: 'Dividendo', val: asset.dividendYield != null ? `${asset.dividendYield}%` : '—' },
                { lbl: 'Volumen', val: pd?.volume ? (pd.volume > 1000000 ? `${(pd.volume / 1000000).toFixed(1)}M` : `${(pd.volume / 1000).toFixed(0)}K`) : '—' },
                { lbl: 'Máx. 52 sem.', val: formatPrice(high52, asset.symbol) },
                { lbl: 'Mín. 52 sem.', val: formatPrice(low52, asset.symbol) },
              ].map(s => (
                <div key={s.lbl} style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{s.lbl}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 52-week range */}
          <div style={{ margin: '0 16px 16px', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Rango 52 semanas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right', minWidth: 70 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Mínimo</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{formatPrice(low52, asset.symbol)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <WeekRangeBar low={low52} high={high52} current={currentPrice} />
              </div>
              <div style={{ minWidth: 70 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Máximo</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{formatPrice(high52, asset.symbol)}</div>
              </div>
            </div>
          </div>

          {/* E. About section */}
          {asset.description && (
            <div style={{ margin: '0 16px 16px', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
                Sobre {asset.name}
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
                {asset.description}
              </p>
              {asset.sector && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: 'var(--bg2)', color: 'var(--muted)', border: '.5px solid var(--border2)' }}>
                    {asset.sector}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* F. Contexto educativo */}
          <div style={{ margin: '0 16px 16px', background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>💡 Contexto educativo</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
              {asset.name} muestra una variación de{' '}
              <strong style={{ color: up ? 'var(--green)' : 'var(--red)' }}>
                {up ? '+' : ''}{pd?.changePct.toFixed(2) ?? '0.00'}%
              </strong>{' '}hoy.
              {asset.category === 'cripto' && ' Las criptomonedas tienen alta volatilidad — la gestión del riesgo es crítica. Nunca inviertas más de lo que puedas perder.'}
              {asset.category === 'acciones-us' && ' Recuerda analizar los fundamentales antes de operar. Busca el PER y el crecimiento de beneficios.'}
              {asset.category === 'acciones-eu' && ' Las acciones europeas pueden estar influenciadas por decisiones del BCE y el tipo de cambio EUR/USD.'}
              {asset.category === 'forex' && ' El mercado forex opera 24/5 y reacciona a eventos macroeconómicos y decisiones de bancos centrales.'}
              {asset.category === 'etfs' && ' Los ETFs ofrecen diversificación instantánea. Revisa el TER (coste anual) antes de invertir.'}
              {asset.category === 'materias' && ' Las materias primas son sensibles a eventos geopolíticos y oferta/demanda global.'}
              {asset.category === 'indices' && ' Los índices reflejan la salud del mercado en su conjunto. Invertir en índices es la base del value investing.'}
              {' '}Practica en el simulador antes de arriesgar capital real.
            </div>
            <Link href="/ia" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
              Analizar {asset.symbol} con E-AI →
            </Link>
          </div>

          {/* G. Brokers card */}
          <div style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg,rgba(0,212,122,.06),rgba(66,165,245,.06))', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>🏦</div>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700 }}>¿Listo para invertir con dinero real?</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Brokers regulados para invertir en {asset.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { name: 'DEGIRO', note: 'Comisiones desde 0€', href: process.env.NEXT_PUBLIC_AFFILIATE_DEGIRO ?? '/brokers' },
                { name: 'Trading212', note: 'Sin comisiones en ETFs', href: process.env.NEXT_PUBLIC_AFFILIATE_TRADING212 ?? '/brokers' },
                { name: 'eToro', note: 'Ideal para cripto', href: process.env.NEXT_PUBLIC_AFFILIATE_ETORO ?? '/brokers' },
              ].map(b => (
                <a key={b.name} href={b.href} target="_blank" rel="noopener noreferrer nofollow"
                  onClick={() => fetch('/api/affiliate/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ broker: b.name.toLowerCase().replace(' ', ''), source: `asset_${asset.symbol}` }) }).catch(() => {})}
                  style={{ flex: 1, minWidth: 100, background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '10px 14px', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', transition: '.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--green)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border2)')}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{b.note}</div>
                </a>
              ))}
              <Link href="/brokers" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', background: 'transparent', border: '.5px solid var(--border2)', borderRadius: 10, color: 'var(--muted)', fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                Ver todos →
              </Link>
            </div>
          </div>

          {/* H. Bottom spacer */}
          <div style={{ height: 20 }} />
        </div>

        {/* I. Sticky bottom bar */}
        <div style={{
          position: 'sticky', bottom: 0, left: 0, right: 0,
          background: 'var(--bg1)',
          borderTop: '.5px solid var(--border2)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          zIndex: 30,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 1 }}>Precio actual</div>
            <div style={{
              fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800,
              color: pd?.direction === 'up' ? 'var(--green)' : pd?.direction === 'down' ? 'var(--red)' : 'var(--white)',
              transition: 'color .3s',
            }}>
              {formatPrice(currentPrice, asset.symbol)}
            </div>
          </div>
          <button
            onClick={() => openModal('buy')}
            style={{
              flex: 1, padding: '13px', border: 'none', borderRadius: 12, cursor: 'pointer',
              background: 'var(--green)', color: 'var(--bg)',
              fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
            }}
          >
            ▲ Comprar
          </button>
          <button
            onClick={() => openModal('sell')}
            style={{
              flex: 1, padding: '13px', border: 'none', borderRadius: 12, cursor: 'pointer',
              background: 'var(--red)', color: 'var(--white)',
              fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
            }}
          >
            ▼ Vender
          </button>
        </div>
      </div>

      {/* J. Trade Modal */}
      {showTradeModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            animation: 'fadeIn .2s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowTradeModal(false) }}
        >
          <div style={{
            background: 'var(--bg1)',
            borderRadius: '24px 24px 0 0',
            width: '100%',
            maxWidth: 540,
            padding: '24px 24px 32px',
            animation: 'slideUp .3s ease',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 800 }}>Simulador</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{asset.name} · {formatPrice(currentPrice, asset.symbol)}</div>
              </div>
              <button
                onClick={() => setShowTradeModal(false)}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--bg2)', color: 'var(--muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Buy / Sell toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {(['buy', 'sell'] as OpType[]).map(t => (
                <button key={t} onClick={() => setOpType(t)} style={{
                  padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: opType === t ? (t === 'buy' ? 'var(--green)' : 'var(--red)') : 'var(--bg2)',
                  color: opType === t ? (t === 'buy' ? 'var(--bg)' : 'var(--white)') : 'var(--muted)',
                  fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
                }}>
                  {t === 'buy' ? '▲ Comprar' : '▼ Vender'}
                </button>
              ))}
            </div>

            {/* Order type */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>Tipo de orden</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['market', 'Mercado'], ['limit', 'Límite'], ['stop', 'Stop-Loss']] as [OrderType, string][]).map(([k, label]) => (
                  <button key={k} onClick={() => setOrderType(k)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 9,
                    border: `.5px solid ${orderType === k ? (k === 'stop' ? 'var(--amber)' : 'var(--green)') : 'var(--border2)'}`,
                    background: orderType === k ? (k === 'stop' ? 'rgba(249,168,37,.1)' : 'rgba(0,212,122,.08)') : 'transparent',
                    color: orderType === k ? (k === 'stop' ? 'var(--amber)' : 'var(--green)') : 'var(--muted)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                {orderType === 'market' && 'Se ejecuta inmediatamente al precio actual del mercado.'}
                {orderType === 'limit' && 'Se ejecuta solo cuando el precio llegue al nivel que indiques.'}
                {orderType === 'stop' && 'Venta automática si el precio cae al nivel que indiques. Protege tu capital.'}
              </div>
            </div>

            <form onSubmit={handleOperate}>
              {/* Current price display */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Precio actual</label>
                <div style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
                  {formatPrice(currentPrice, asset.symbol)} {asset.currency}
                </div>
              </div>

              {/* Limit / stop price */}
              {(orderType === 'limit' || orderType === 'stop') && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: orderType === 'stop' ? 'var(--amber)' : 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    {orderType === 'limit' ? 'Precio límite' : 'Precio stop-loss'}
                  </label>
                  <input
                    type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                    placeholder={formatPrice(currentPrice * (orderType === 'limit' ? 0.98 : 0.95), asset.symbol).replace(/[^0-9.]/g, '')}
                    min="0" step="any" required
                    style={{ width: '100%', background: 'var(--bg2)', border: `.5px solid ${orderType === 'stop' ? 'rgba(249,168,37,.4)' : 'var(--border2)'}`, borderRadius: 10, padding: '11px 14px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {/* Amount */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Importe (€)</label>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="100" min="1" step="any" required
                  style={{ width: '100%', background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '11px 14px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[100, 250, 500, 1000].map(v => (
                  <button key={v} type="button" onClick={() => setAmount(String(v))} style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, border: '.5px solid var(--border2)',
                    background: amount === String(v) ? 'var(--bg3)' : 'transparent',
                    color: amount === String(v) ? 'var(--white)' : 'var(--muted)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>€{v}</button>
                ))}
              </div>

              {/* Units display */}
              {amount && units > 0 && (
                <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Unidades</span>
                  <span style={{ fontFamily: 'var(--serif)', color: 'var(--white)', fontWeight: 700 }}>{units.toFixed(6)} {asset.symbol}</span>
                </div>
              )}

              {/* Available capital */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Capital disponible</span>
                <span style={{ fontWeight: 700, color: 'var(--white)' }}>
                  {portfolio ? `€${formatPrice(portfolio.cash)}` : '—'}
                </span>
              </div>

              {opType === 'buy' && portfolio && parseFloat(amount || '0') > portfolio.cash && (
                <div style={{
                  background: 'rgba(239,83,80,.08)',
                  border: '.5px solid rgba(239,83,80,.3)',
                  borderRadius: 10,
                  padding: '9px 14px',
                  fontSize: 12,
                  color: 'var(--red)',
                  fontWeight: 600,
                  marginBottom: 12,
                }}>
                  Saldo insuficiente
                </div>
              )}

              {(opType !== 'buy' || !portfolio || parseFloat(amount || '0') <= portfolio.cash) && (
                <div style={{ height: 10 }} />
              )}

              <button
                type="submit"
                disabled={opType === 'buy' && portfolio !== null && parseFloat(amount || '0') > portfolio.cash}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                  background: opType === 'buy' ? 'var(--green)' : 'var(--red)',
                  color: opType === 'buy' ? 'var(--bg)' : 'var(--white)',
                  fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700,
                  cursor: opType === 'buy' && portfolio !== null && parseFloat(amount || '0') > portfolio.cash ? 'not-allowed' : 'pointer',
                  opacity: opType === 'buy' && portfolio !== null && parseFloat(amount || '0') > portfolio.cash ? 0.5 : 1,
                }}
              >
                {opType === 'buy' ? '▲ Comprar' : '▼ Vender'} {asset.symbol}
              </button>
            </form>

            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted2)', lineHeight: 1.6, textAlign: 'center' }}>
              💡 Simulación educativa — no se usa dinero real
            </div>
          </div>
        </div>
      )}

      {/* K. Confirm Modal */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn .18s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget && !confirming) setShowConfirm(false) }}
        >
          <div style={{
            background: 'var(--bg1)',
            borderRadius: 18,
            border: '.5px solid var(--border2)',
            width: '100%',
            maxWidth: 440,
            padding: 28,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--white)',
              marginBottom: 4,
            }}>
              Confirmar {opType === 'buy' ? 'compra' : 'venta'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
              Revisa los detalles antes de ejecutar la orden
            </div>

            <div style={{
              background: 'var(--bg2)',
              border: '.5px solid var(--border2)',
              borderRadius: 12,
              padding: 18,
              marginBottom: 22,
            }}>
              {[
                { lbl: 'Activo', val: `${asset.name} (${asset.symbol})` },
                { lbl: 'Tipo de orden', val: orderType === 'market' ? 'Mercado' : orderType === 'limit' ? 'Límite' : 'Stop-Loss' },
                { lbl: 'Precio', val: `${formatPrice(currentPrice, asset.symbol)} ${asset.currency}` },
                { lbl: 'Unidades', val: `${units.toFixed(6)} ${asset.symbol}`, mono: true },
                { lbl: 'Importe total', val: `€${formatPrice(parseFloat(amount || '0'))}`, strong: true },
                {
                  lbl: 'Saldo después',
                  val: portfolio
                    ? `€${formatPrice(opType === 'buy' ? portfolio.cash - parseFloat(amount || '0') : portfolio.cash + parseFloat(amount || '0'))}`
                    : '—',
                },
              ].map((row, idx, arr) => (
                <div
                  key={row.lbl}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: idx < arr.length - 1 ? '.5px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{row.lbl}</span>
                  <span style={{
                    fontSize: row.strong ? 14 : 13,
                    fontWeight: row.strong ? 800 : 700,
                    color: 'var(--white)',
                    fontFamily: row.mono || row.strong ? 'var(--serif)' : 'var(--sans)',
                  }}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={confirming}
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: '13px',
                  border: 'none',
                  borderRadius: 12,
                  background: 'var(--bg3)',
                  color: 'var(--muted)',
                  fontFamily: 'var(--sans)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: confirming ? 'not-allowed' : 'pointer',
                  opacity: confirming ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirming}
                onClick={confirmTrade}
                style={{
                  flex: 1.3,
                  padding: '13px',
                  border: 'none',
                  borderRadius: 12,
                  background: opType === 'buy' ? 'var(--green)' : 'var(--red)',
                  color: opType === 'buy' ? 'var(--bg)' : 'var(--white)',
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: confirming ? 'not-allowed' : 'pointer',
                  opacity: confirming ? 0.7 : 1,
                }}
              >
                {confirming ? 'Procesando...' : opType === 'buy' ? 'Confirmar compra' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
