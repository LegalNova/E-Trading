'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { ASSET_BY_SYMBOL } from '@/data/assets'
import { fe, fes, fpct, fprice, fshares, fdate } from '@/lib/format'
import { NavBar } from '@/components/ui/NavBar'
import { Seg } from '@/components/ui/Seg'
import { Help } from '@/components/ui/Help'
import { Icon, ICONS } from '@/components/ui/Icon'
import { AssetAvatar } from '@/components/market/AssetRow'
import { card, chip, h1, sectionLabel, btnPrimary } from '@/components/ui/styles'

type Tab = 'Posiciones' | 'Historial'

export default function PortafolioPage() {
  const { data, error } = usePortfolio()
  const [tab, setTab] = useState<Tab>('Posiciones')

  return (
    <div className="et-page" style={{ paddingBottom: 32 }}>
      <NavBar title="Portafolio" />
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ ...h1, marginBottom: 16 }}>Portafolio</h1>
        <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Valor total</span>
        {data ? (
          <span style={{ font: '600 44px/52px var(--font)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{fe(data.total)}</span>
        ) : error ? (
          <span style={{ font: '400 15px var(--font)', color: 'var(--red)' }}>{error}</span>
        ) : (
          <span className="skeleton" style={{ width: 220, height: 48 }} />
        )}
      </div>

      {data && (
        <>
          <div style={{ margin: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid var(--border)' }}>
              <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>Efectivo <Help k="efectivo" /></span>
              <span style={{ font: '600 17px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{fe(data.cash)}</span>
            </div>
            <div style={{ padding: '0 0 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>Rentabilidad total <Help k="rent" /></span>
              <span style={{ font: '600 17px var(--font)', color: data.pnlPct >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{fpct(data.pnlPct)}</span>
              <span style={{ font: '400 12px var(--font)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{fes(data.pnlEur)} desde 10.000 €</span>
            </div>
          </div>

          <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={sectionLabel}>Distribución</span>
            <div style={{ display: 'flex', height: 12, gap: 2 }} role="img" aria-label={'Distribución: ' + data.allocation.map(a => `${a.label} ${Math.round(a.pct)} %`).join(', ')}>
              {data.allocation.map(a => <i key={a.label} style={{ display: 'block', height: '100%', width: `${a.pct}%`, minWidth: 2, background: a.color }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {data.allocation.map(a => (
                <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 13px var(--font)' }}>
                  <i style={{ width: 8, height: 8, background: a.color, display: 'block', flex: 'none' }} />
                  <span style={{ flex: 1 }}>{a.label}</span>
                  <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{a.pct.toLocaleString('es-ES', { maximumFractionDigits: 1 })} %</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Seg label="Vista" options={['Posiciones', 'Historial'] as const} value={tab} onChange={setTab} />

            {tab === 'Posiciones' && (data.positions.length === 0 ? (
              <Empty
                text="Aún no tienes inversiones. Haz tu primera compra con 100 € virtuales."
                cta="Ir al mercado"
              />
            ) : (
              <div style={card}>
                {data.positions.map((p, i) => (
                  <Link key={p.symbol} href={`/mercado/${encodeURIComponent(p.symbol)}`}
                    style={{ minHeight: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', borderBottom: i < data.positions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <AssetAvatar symbol={p.symbol} />
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ font: '600 15px var(--font)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{fshares(p.shares)} participaciones</span>
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ font: '500 15px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{fe(p.valueEur)}</span>
                      <span style={chip(p.pnlEur >= 0)}>{fpct(p.pnlPct)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ))}

            {tab === 'Historial' && (data.trades.length === 0 ? (
              <Empty text="Todavía no has hecho ninguna operación." cta="Ir al mercado" />
            ) : (
              <div style={card}>
                {data.trades.map((t, i) => {
                  const c = t.type === 'buy' ? 'var(--green)' : 'var(--red)'
                  return (
                    <div key={t.id} style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < data.trades.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ font: '500 12px var(--font)', padding: '2px 6px', borderRadius: 2, border: `1px solid ${c}`, color: c, width: 56, textAlign: 'center', flex: 'none' }}>
                        {t.type === 'buy' ? 'Compra' : 'Venta'}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ font: '600 15px var(--font)' }}>{t.symbol}</span>
                        <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fdate(t.executedAt)} · {fprice(t.price, t.currency, ASSET_BY_SYMBOL[t.symbol]?.category === 'forex')}
                        </span>
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <span style={{ font: '500 15px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{fe(t.totalEur)}</span>
                        {t.pnlEur !== null && (
                          <span style={{ font: '500 12px var(--font)', color: t.pnlEur >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{fes(t.pnlEur)}</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Empty({ text, cta }: { text: string; cta: string }) {
  return (
    <div style={{ ...card, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
      <Icon d={ICONS.portfolio} size={40} color="var(--text-tertiary)" stroke={1} />
      <span style={{ font: '400 15px/22px var(--font)', color: 'var(--text-secondary)', maxWidth: 280 }}>{text}</span>
      <Link href="/mercado" style={{ ...btnPrimary, height: 44, textDecoration: 'none' }}>{cta}</Link>
    </div>
  )
}
