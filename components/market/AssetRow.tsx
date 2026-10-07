'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import type { Asset } from '@/data/assets'
import type { Quote } from '@/hooks/useQuotes'
import { syntheticSeries } from '@/lib/sim'
import { fprice, fpct } from '@/lib/format'
import { Spark } from '@/components/ui/Spark'
import { chip } from '@/components/ui/styles'

const DAY = 86_400_000

export function AssetAvatar({ symbol, size = 36 }: { symbol: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, flex: 'none', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', font: `600 ${size > 34 ? 13 : 12}px var(--font)`,
      }}
    >
      {symbol.replace(/[^A-Z]/g, '')[0] ?? symbol[0]}
    </span>
  )
}

/** Fila de activo: inicial · nombre · minigráfico de hoy · precio · variación */
export function AssetRow({ asset, q, last, href }: { asset: Asset; q?: Quote; last?: boolean; href?: string }) {
  const up = (q?.changePercent ?? 0) >= 0
  const spark = useMemo(
    () => (q ? syntheticSeries(asset.symbol, asset.basePrice, DAY, 24, q.price, q.prevClose) : []),
    // la forma solo depende del precio redondeado: evita recalcular en cada tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asset.symbol, q ? q.price.toPrecision(5) : 0, q?.prevClose],
  )
  return (
    <Link
      href={href ?? `/mercado/${encodeURIComponent(asset.symbol)}`}
      style={{
        minHeight: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', color: 'var(--text-primary)',
        textDecoration: 'none', borderBottom: last ? 'none' : '1px solid var(--border)',
      }}
    >
      <AssetAvatar symbol={asset.symbol} />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ font: '600 15px var(--font)' }}>{asset.symbol}</span>
        <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {asset.name}
        </span>
      </span>
      {q ? <Spark values={spark} up={up} /> : <span style={{ width: 56 }} />}
      <span style={{ width: 104, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {q ? (
          <>
            <span style={{ font: '500 15px var(--font)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {fprice(q.price, asset.currency, asset.category === 'forex')}
            </span>
            <span style={chip(up)}>{fpct(q.changePercent)}</span>
          </>
        ) : (
          <>
            <span className="skeleton" style={{ width: 72, height: 14 }} />
            <span className="skeleton" style={{ width: 56, height: 14 }} />
          </>
        )}
      </span>
    </Link>
  )
}
