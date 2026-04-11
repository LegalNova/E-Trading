'use client'
import Link from 'next/link'
import { usePortfolio } from '@/hooks/usePortfolio'
import { usePrices, formatPrice } from '@/hooks/usePrices'
import { ASSET_BY_SYMBOL } from '@/data/assets'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--serif)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.1em',
      color: 'var(--muted)',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function PortafolioPage() {
  const { data, loading, error } = usePortfolio()
  const heldSymbols = data?.positions.map(p => p.symbol) ?? []
  const { prices } = usePrices(heldSymbols.length ? heldSymbols : undefined)

  if (loading && !data) {
    return (
      <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
        <div style={{
          background: 'var(--bg1)',
          border: '.5px solid var(--border2)',
          borderRadius: 14,
          padding: '60px 0',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: 14,
        }}>
          Cargando portafolio...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
        <div style={{
          background: 'rgba(239,83,80,.08)',
          border: '.5px solid rgba(239,83,80,.3)',
          borderRadius: 14,
          padding: 24,
          color: 'var(--red)',
          fontSize: 14,
        }}>
          Error al cargar el portafolio: {error}
        </div>
      </div>
    )
  }

  const cash = data?.cash ?? 0
  const positions = data?.positions ?? []
  const trades = data?.trades ?? []

  const invested = positions.reduce((acc, p) => acc + p.shares * p.avg_price, 0)
  const marketValue = positions.reduce((acc, p) => {
    const current = prices[p.symbol]?.price ?? p.avg_price
    return acc + p.shares * current
  }, 0)
  const totalValue = cash + marketValue
  const pnlEur = marketValue - invested
  const pnlPct = invested > 0 ? (pnlEur / invested) * 100 : 0
  const pnlColor = pnlEur >= 0 ? 'var(--green)' : 'var(--red)'

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 800, marginBottom: 4, color: 'var(--white)' }}>
          Mi Portafolio
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {positions.length} {positions.length === 1 ? 'posición abierta' : 'posiciones abiertas'}
          {' · '}
          {trades.length} {trades.length === 1 ? 'operación registrada' : 'operaciones registradas'}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>Valor total</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>
            €{formatPrice(totalValue)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Cash + mercado</div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>Disponible</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>
            €{formatPrice(cash)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Cash libre</div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>Invertido</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, color: 'var(--white)' }}>
            €{formatPrice(invested)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Coste de las posiciones</div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>P&amp;L total</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 800, color: pnlColor }}>
            {pnlEur >= 0 ? '+' : '−'}€{formatPrice(Math.abs(pnlEur))}
          </div>
          <div style={{ fontSize: 11, color: pnlColor, marginTop: 4, fontWeight: 600 }}>
            {pnlEur >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Positions */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Posiciones abiertas</SectionTitle>

        {positions.length === 0 ? (
          <div style={{
            background: 'var(--bg1)',
            border: '.5px solid var(--border2)',
            borderRadius: 14,
            padding: '50px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--white)' }}>
              Aún no tienes posiciones
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              Empieza comprando tu primer activo en el mercado
            </div>
            <Link
              href="/mercado"
              style={{
                display: 'inline-block',
                padding: '11px 24px',
                background: 'var(--green)',
                color: 'var(--bg)',
                borderRadius: 10,
                fontFamily: 'var(--serif)',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Explorar mercado →
            </Link>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg1)',
            border: '.5px solid var(--border2)',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr 1.3fr 1.2fr',
              gap: 10,
              padding: '12px 18px',
              borderBottom: '.5px solid var(--border)',
              background: 'var(--bg2)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              <div>Activo</div>
              <div style={{ textAlign: 'right' }}>Unidades</div>
              <div style={{ textAlign: 'right' }}>Coste medio</div>
              <div style={{ textAlign: 'right' }}>Precio actual</div>
              <div style={{ textAlign: 'right' }}>Valor actual</div>
              <div style={{ textAlign: 'right' }}>P&amp;L</div>
              <div style={{ textAlign: 'right' }}>Acción</div>
            </div>

            {positions.map(p => {
              const asset = ASSET_BY_SYMBOL[p.symbol]
              const current = prices[p.symbol]?.price ?? p.avg_price
              const posValue = p.shares * current
              const posCost = p.shares * p.avg_price
              const posPnl = posValue - posCost
              const posPnlPct = posCost > 0 ? (posPnl / posCost) * 100 : 0
              const posColor = posPnl >= 0 ? 'var(--green)' : 'var(--red)'

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr 1.3fr 1.2fr',
                    gap: 10,
                    padding: '14px 18px',
                    borderBottom: '.5px solid var(--border)',
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: 'var(--bg2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 11, color: 'var(--green)', flexShrink: 0,
                      border: '.5px solid var(--border2)',
                    }}>
                      {asset?.flag ?? p.symbol.slice(0, 3)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.symbol}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {asset?.name ?? p.symbol}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--white)' }}>
                    {p.shares.toFixed(6)}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 600, color: 'var(--muted)' }}>
                    {formatPrice(p.avg_price, p.symbol)}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--white)' }}>
                    {formatPrice(current, p.symbol)}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 800, color: 'var(--white)' }}>
                    €{formatPrice(posValue)}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, color: posColor, fontSize: 13 }}>
                      {posPnl >= 0 ? '+' : '−'}€{formatPrice(Math.abs(posPnl))}
                    </div>
                    <div style={{ fontSize: 11, color: posColor, fontWeight: 600 }}>
                      {posPnl >= 0 ? '+' : ''}{posPnlPct.toFixed(2)}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <Link
                      href={`/mercado/${p.symbol}`}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--bg2)',
                        border: '.5px solid var(--border2)',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--muted)',
                        textDecoration: 'none',
                      }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/mercado/${p.symbol}?action=sell`}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(239,83,80,.1)',
                        border: '.5px solid rgba(239,83,80,.3)',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--red)',
                        textDecoration: 'none',
                      }}
                    >
                      Vender
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trades history */}
      <div>
        <SectionTitle>Historial reciente</SectionTitle>
        {trades.length === 0 ? (
          <div style={{
            background: 'var(--bg1)',
            border: '.5px solid var(--border2)',
            borderRadius: 14,
            padding: '28px 20px',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--muted)',
          }}>
            Aún no has realizado operaciones
          </div>
        ) : (
          <div style={{
            background: 'var(--bg1)',
            border: '.5px solid var(--border2)',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr .8fr 1fr 1fr 1fr 1.1fr',
              gap: 10,
              padding: '12px 18px',
              borderBottom: '.5px solid var(--border)',
              background: 'var(--bg2)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}>
              <div>Fecha</div>
              <div>Tipo</div>
              <div>Activo</div>
              <div style={{ textAlign: 'right' }}>Unidades</div>
              <div style={{ textAlign: 'right' }}>Precio</div>
              <div style={{ textAlign: 'right' }}>Total</div>
            </div>

            {trades.map(t => {
              const isBuy = t.type === 'buy'
              const tColor = isBuy ? 'var(--green)' : 'var(--red)'
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr .8fr 1fr 1fr 1fr 1.1fr',
                    gap: 10,
                    padding: '12px 18px',
                    borderBottom: '.5px solid var(--border)',
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(t.executed_at)}</div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: isBuy ? 'rgba(0,212,122,.1)' : 'rgba(239,83,80,.1)',
                      color: tColor,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '.06em',
                    }}>
                      {isBuy ? 'COMPRA' : 'VENTA'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{t.symbol}</div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 600, color: 'var(--muted)' }}>
                    {t.shares.toFixed(6)}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 600, color: 'var(--muted)' }}>
                    {formatPrice(t.price, t.symbol)}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 800, color: 'var(--white)' }}>
                    €{formatPrice(t.total)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
