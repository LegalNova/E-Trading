'use client'
import Link from 'next/link'
import { useQuotes } from '@/hooks/useQuotes'
import { ASSET_BY_SYMBOL } from '@/data/assets'
import { AssetRow } from '@/components/market/AssetRow'
import { Icon, ICONS } from '@/components/ui/Icon'
import { btnPrimary, card, h1 } from '@/components/ui/styles'

const DEMO = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'SPY', 'QQQ', 'BTC', 'ETH', 'ITX', 'SAN', 'GOLD']

/** Vista pública del mercado en directo (sin cuenta) */
export default function DemoPage() {
  const { quotes } = useQuotes(DEMO)
  const assets = DEMO.map(s => ASSET_BY_SYMBOL[s]).filter(Boolean)

  return (
    <div className="et-page" style={{ minHeight: '100dvh', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 4px', paddingTop: 'env(safe-area-inset-top, 0px)', boxSizing: 'content-box' }}>
        <Link href="/" style={{ height: 44, padding: '0 8px', color: 'var(--blue)', font: '400 17px var(--font)', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
          <Icon d={ICONS.back} size={20} />Inicio
        </Link>
      </div>
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={h1}>Mercado en directo</h1>
        <p style={{ margin: 0, font: '400 15px/22px var(--font)', color: 'var(--text-secondary)' }}>
          Estos son los precios con los que practicarás. Crea una cuenta gratis para invertir tus 10.000 € virtuales.
        </p>
      </div>
      <div style={{ padding: '24px 16px 0' }}>
        <div style={card}>
          {assets.map((a, i) => <AssetRow key={a.symbol} asset={a} q={quotes[a.symbol]} last={i === assets.length - 1} href="/register" />)}
        </div>
      </div>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, borderTop: '1px solid var(--border)', background: 'var(--surface-1)', padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="et-page">
          <Link href="/register" style={{ ...btnPrimary, textDecoration: 'none' }}>Empieza gratis</Link>
        </div>
      </div>
    </div>
  )
}
