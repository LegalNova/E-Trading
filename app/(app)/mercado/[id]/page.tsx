'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ASSET_BY_SYMBOL, CATEGORY_LABELS } from '@/data/assets'
import { usePrices, formatPrice } from '@/hooks/usePrices'

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

  const [tab, setTab] = useState<Tab>('1D')
  const [opType, setOpType] = useState<OpType>('buy')
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [chartData, setChartData] = useState<number[]>([])
  const [notification, setNotification] = useState('')

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

  // 52-week simulated range
  const low52 = asset.basePrice * 0.68
  const high52 = asset.basePrice * 1.42

  function handleOperate(e: React.FormEvent) {
    e.preventDefault()
    const total = parseFloat(amount)
    if (!total || total <= 0) return
    const orderLabel = orderType === 'market' ? 'mercado' : orderType === 'limit' ? 'límite' : 'stop-loss'
    const priceLabel = orderType === 'market' ? formatPrice(currentPrice, asset.symbol) : `${limitPrice} ${asset.currency}`
    setNotification(`✅ Orden ${orderLabel} ${opType === 'buy' ? 'compra' : 'venta'} enviada: ${units.toFixed(4)} ${asset.symbol} · ${priceLabel}`)
    setAmount('')
    setLimitPrice('')
    setTimeout(() => setNotification(''), 5000)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/mercado" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Mercado</Link>
          <span>›</span>
          <span style={{ color: 'var(--white)' }}>{asset.symbol}</span>
        </div>

        {/* Asset header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--green)' }}>
              {asset.flag ?? asset.symbol.slice(0, 3)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800 }}>{asset.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                <span>{asset.symbol}</span>
                <span>·</span>
                <span>{CATEGORY_LABELS[asset.category]}</span>
                <span>·</span>
                <span>{asset.currency}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800, color: pd?.direction === 'up' ? 'var(--green)' : pd?.direction === 'down' ? 'var(--red)' : 'var(--white)' }}>
              {formatPrice(currentPrice, asset.symbol)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
              {up ? '+' : ''}{pd?.changePct.toFixed(2) ?? '0.00'}%
              <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 400 }}>hoy</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { lbl: 'Máx. día', val: formatPrice(pd?.high ?? asset.basePrice * 1.008, asset.symbol) },
            { lbl: 'Mín. día', val: formatPrice(pd?.low ?? asset.basePrice * 0.992, asset.symbol) },
            { lbl: 'Volumen', val: pd?.volume ? `${(pd.volume / 1000000).toFixed(1)}M` : '—' },
            { lbl: 'Apertura', val: formatPrice(asset.basePrice, asset.symbol) },
          ].map(s => (
            <div key={s.lbl} style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{s.lbl}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* 52-week range */}
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
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

        {/* Chart */}
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: tab === t ? (up ? 'var(--green)' : 'var(--red)') : 'var(--bg2)',
                color: tab === t ? 'var(--bg)' : 'var(--muted)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>
          <MiniChart data={chartData} color={chartColor} />
        </div>

        {/* AI Analysis */}
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🤖 Análisis E-AI</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
            {asset.name} muestra una variación de <strong style={{ color: up ? 'var(--green)' : 'var(--red)' }}>{up ? '+' : ''}{pd?.changePct.toFixed(2) ?? '0.00'}%</strong> hoy.
            {asset.category === 'cripto' && ' Las criptomonedas tienen alta volatilidad — la gestión del riesgo es crítica. Nunca inviertas más de lo que puedas perder.'}
            {asset.category === 'acciones-us' && ' Recuerda analizar los fundamentales antes de operar. Busca el PER y el crecimiento de beneficios.'}
            {asset.category === 'forex' && ' El mercado forex opera 24/5 y reacciona a eventos macroeconómicos y decisiones de bancos centrales.'}
            {asset.category === 'etfs' && ' Los ETFs ofrecen diversificación instantánea. Revisa el TER (coste anual) antes de invertir.'}
            {asset.category === 'materias' && ' Las materias primas son sensibles a eventos geopolíticos y oferta/demanda global.'}
            {' '}Practica en el simulador antes de arriesgar capital real.
          </div>
          <Link href="/ia" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
            Analizar {asset.symbol} con E-AI →
          </Link>
        </div>

        {/* Broker affiliate card */}
        <div style={{ background: 'linear-gradient(135deg,rgba(0,212,122,.06),rgba(66,165,245,.06))', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 28 }}>🏦</div>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700 }}>¿Listo para invertir con dinero real?</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Estos son los brokers regulados que recomendamos para invertir en {asset.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { name: 'DEGIRO', note: 'Comisiones desde 0€', href: process.env.NEXT_PUBLIC_AFFILIATE_DEGIRO ?? '/brokers' },
              { name: 'Trading212', note: 'Sin comisiones en ETFs', href: process.env.NEXT_PUBLIC_AFFILIATE_TRADING212 ?? '/brokers' },
              { name: 'eToro', note: 'Ideal para cripto', href: process.env.NEXT_PUBLIC_AFFILIATE_ETORO ?? '/brokers' },
            ].map(b => (
              <a key={b.name} href={b.href} target="_blank" rel="noopener noreferrer nofollow"
                onClick={() => fetch('/api/affiliate/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ broker: b.name.toLowerCase().replace(' ', ''), source: `asset_${asset.symbol}` }) }).catch(() => {})}
                style={{ flex: 1, background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '10px 14px', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', transition: '.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
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
      </div>

      {/* Trading panel */}
      <div style={{ width: 310, flexShrink: 0, borderLeft: '.5px solid var(--border2)', padding: '20px', overflowY: 'auto', background: 'var(--bg1)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Simulador</div>

        {/* Buy / Sell */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
          {(['buy', 'sell'] as OpType[]).map(t => (
            <button key={t} onClick={() => setOpType(t)} style={{
              padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: opType === t ? (t === 'buy' ? 'var(--green)' : 'var(--red)') : 'var(--bg2)',
              color: opType === t ? 'var(--bg)' : 'var(--muted)',
              fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
            }}>
              {t === 'buy' ? '▲ Comprar' : '▼ Vender'}
            </button>
          ))}
        </div>

        {/* Order type tabs */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>Tipo de orden</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([['market', 'Mercado'], ['limit', 'Límite'], ['stop', 'Stop-Loss']] as [OrderType, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setOrderType(k)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 8, border: `.5px solid ${orderType === k ? (k === 'stop' ? 'var(--amber)' : 'var(--border2)') : 'var(--border2)'}`,
                background: orderType === k ? (k === 'stop' ? 'rgba(249,168,37,.1)' : 'var(--bg3)') : 'transparent',
                color: orderType === k ? (k === 'stop' ? 'var(--amber)' : 'var(--white)') : 'var(--muted)',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
            {orderType === 'market' && 'Se ejecuta inmediatamente al precio actual del mercado.'}
            {orderType === 'limit' && 'Se ejecuta solo cuando el precio llegue al nivel que indiques.'}
            {orderType === 'stop' && 'Venta automática si el precio cae al nivel que indiques. Protege tu capital.'}
          </div>
        </div>

        <form onSubmit={handleOperate}>
          {/* Precio actual */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Precio actual</label>
            <div style={{ background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
              {formatPrice(currentPrice, asset.symbol)} {asset.currency}
            </div>
          </div>

          {/* Precio límite / stop (condicional) */}
          {(orderType === 'limit' || orderType === 'stop') && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: orderType === 'stop' ? 'var(--amber)' : 'var(--muted)', display: 'block', marginBottom: 6 }}>
                {orderType === 'limit' ? 'Precio límite' : 'Precio stop-loss'}
              </label>
              <input
                type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                placeholder={formatPrice(currentPrice * (orderType === 'limit' ? 0.98 : 0.95), asset.symbol).replace(/[^0-9.]/g, '')}
                min="0" step="any" required
                style={{ width: '100%', background: 'var(--bg2)', border: `.5px solid ${orderType === 'stop' ? 'rgba(249,168,37,.4)' : 'var(--border2)'}`, borderRadius: 10, padding: '10px 14px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 14, outline: 'none' }}
              />
            </div>
          )}

          {/* Importe */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Importe (€)</label>
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="100" min="1" step="any" required
              style={{ width: '100%', background: 'var(--bg2)', border: '.5px solid var(--border2)', borderRadius: 10, padding: '10px 14px', color: 'var(--white)', fontFamily: 'var(--sans)', fontSize: 14, outline: 'none' }}
            />
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            {[100, 250, 500, 1000].map(v => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} style={{
                flex: 1, padding: '5px', borderRadius: 7, border: '.5px solid var(--border2)',
                background: amount === String(v) ? 'var(--bg3)' : 'transparent',
                color: amount === String(v) ? 'var(--white)' : 'var(--muted)',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>€{v}</button>
            ))}
          </div>

          {/* Unidades */}
          {amount && units > 0 && (
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Unidades</span>
              <span style={{ fontFamily: 'var(--serif)', color: 'var(--white)', fontWeight: 700 }}>{units.toFixed(6)} {asset.symbol}</span>
            </div>
          )}

          {/* Capital */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
            <span>Capital disponible</span>
            <span style={{ fontWeight: 700, color: 'var(--white)' }}>€10.000,00</span>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '13px', border: 'none', borderRadius: 10,
            background: opType === 'buy' ? 'var(--green)' : 'var(--red)',
            color: 'var(--bg)', fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            {opType === 'buy' ? '▲ Comprar' : '▼ Vender'} {asset.symbol}
          </button>
        </form>

        {notification && (
          <div style={{ marginTop: 12, background: 'var(--gfaint)', border: '.5px solid rgba(0,212,122,.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--green)', lineHeight: 1.5 }}>
            {notification}
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 10, color: 'var(--muted2)', lineHeight: 1.6, textAlign: 'center' }}>
          💡 Simulación educativa — no se usa dinero real
        </div>
      </div>
    </div>
  )
}
