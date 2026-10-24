'use client'
// Piezas comunes del Mercado: formato de precios en cualquier moneda, estado de la bolsa, filas y pestañas
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { AssetItemT, AssetTypeT } from '@/shared/contract'
import { arrowPct, toNum } from '@/shared/format'
import { useLang } from '../hooks'
import { Sparkline } from '../ui/charts'
import { Seg } from '../ui/kit'

/** Decimales adecuados al tamaño del precio y al tipo de activo */
export function decimalsFor(type: AssetTypeT, v: number) {
  if (type === 'FX') return 4
  if (v >= 1000) return type === 'INDEX' ? 2 : 2
  if (v >= 1) return 2
  if (v >= 0.01) return 4
  // Memecoins (0,000004 $): tres cifras significativas
  return v > 0 ? Math.min(10, 2 - Math.floor(Math.log10(v))) : 6
}

/** Precio en su moneda: 333,57 $ · 1.352,00 £ · ¥3.105 · 11,51 € (índices y divisas, sin símbolo) */
export function fmtAssetPrice(a: { price: string; currency: string; type: AssetTypeT }, locale: string) {
  const v = toNum(a.price)
  const d = decimalsFor(a.type, v)
  if (a.type === 'FX' || a.type === 'INDEX') return new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
  try {
    const f = new Intl.NumberFormat(locale, { style: 'currency', currency: a.currency, currencyDisplay: 'narrowSymbol' })
    const def = f.resolvedOptions().maximumFractionDigits ?? 2
    // Monedas sin decimales (JPY, KRW) se respetan; el resto según el tamaño
    const digits = def === 0 ? 0 : d
    return new Intl.NumberFormat(locale, { style: 'currency', currency: a.currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v)
  } catch {
    return `${v.toFixed(d)} ${a.currency}`
  }
}

/** Símbolo corto de una moneda (€, $, £, ¥…) */
export function currencySymbol(cur: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find(p => p.type === 'currency')?.value ?? cur
  } catch {
    return cur
  }
}

const FLAGS: Record<string, string> = {
  'Estados Unidos': '🇺🇸', 'Reino Unido': '🇬🇧', Alemania: '🇩🇪', Francia: '🇫🇷', España: '🇪🇸', Italia: '🇮🇹', 'Países Bajos': '🇳🇱', Bélgica: '🇧🇪', Portugal: '🇵🇹',
  Suiza: '🇨🇭', Suecia: '🇸🇪', Dinamarca: '🇩🇰', Noruega: '🇳🇴', Finlandia: '🇫🇮', Irlanda: '🇮🇪', Austria: '🇦🇹', Japón: '🇯🇵', 'Hong Kong': '🇭🇰', India: '🇮🇳',
  'Corea del Sur': '🇰🇷', Singapur: '🇸🇬', Australia: '🇦🇺', Taiwán: '🇹🇼', China: '🇨🇳', Canadá: '🇨🇦', Brasil: '🇧🇷', México: '🇲🇽', Argentina: '🇦🇷',
  Chile: '🇨🇱', Polonia: '🇵🇱', Turquía: '🇹🇷', Indonesia: '🇮🇩', Malasia: '🇲🇾', Tailandia: '🇹🇭', 'Nueva Zelanda': '🇳🇿', Europa: '🇪🇺',
}
export const flagOf = (country: string) => FLAGS[country] ?? ''

export function useStatus() {
  const t = useTranslations('market')
  return (a: Pick<AssetItemT, 'type' | 'exchange' | 'isOpen' | 'delayedMinutes'>) => {
    if (a.type === 'CRYPTO') return t('crypto247')
    const name = a.type === 'FX' ? t('fx') : a.type === 'COMMODITY' ? t('commodity') : a.exchange
    const base = `${name} · ${a.isOpen ? t('open') : t('closed')}`
    return a.delayedMinutes ? `${base} · ${t('delayed', { n: a.delayedMinutes })}` : base
  }
}

export function useUnit() {
  const t = useTranslations('market')
  return (type: AssetTypeT, ticker: string) => (type === 'CRYPTO' ? ticker : type === 'FX' || type === 'COMMODITY' ? t('units') : type === 'ETF' ? t('shares') : t('stocks'))
}

/** Valor que parpadea en verde o rojo cuando cambia */
export function Live({ value, children, className }: { value: number; children: React.ReactNode; className?: string }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState('')
  useEffect(() => {
    if (value !== prev.current) {
      setFlash(value > prev.current ? 'flash-up' : 'flash-down')
      prev.current = value
      const id = setTimeout(() => setFlash(''), 800)
      return () => clearTimeout(id)
    }
  }, [value])
  return <span className={`${className ?? ''} ${flash}`}>{children}</span>
}

export const assetHref = (symbol: string) => `/mercado/${encodeURIComponent(symbol)}`

/** Logotipo de texto: iniciales del activo en un cuadrado (sin logos de terceros) */
export function AssetBadge({ a, size = 40 }: { a: Pick<AssetItemT, 'ticker' | 'type'>; size?: number }) {
  const dark = a.type === 'INDEX' || a.type === 'CRYPTO'
  return (
    <span className="flex flex-none items-center justify-center rounded-xl font-extrabold" style={{ width: size, height: size, fontSize: size * 0.27, background: dark ? 'var(--ink)' : 'var(--fill)', color: dark ? 'var(--bg)' : 'var(--ink)' }}>
      {a.ticker.replace(/[^A-Za-z0-9]/g, '').slice(0, 4)}
    </span>
  )
}

export function AssetRow({ a, rank }: { a: AssetItemT; rank?: number }) {
  const locale = useLang()
  const status = useStatus()
  const up = a.changePct >= 0
  return (
    <Link href={assetHref(a.symbol)} className="li">
      {rank !== undefined && <span className="t-cap w-4 text-right">{rank}</span>}
      <AssetBadge a={a} />
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[15px]">
          {a.name}
        </b>
        <span className="t-cap block truncate">
          {flagOf(a.country)} {a.ticker} · {status(a)}
        </span>
      </span>
      <span className="hidden sm:block">
        <Sparkline values={a.sparkline} up={up} />
      </span>
      <span className="w-[104px] text-right">
        <Live value={toNum(a.price)} className="block text-[15px] font-bold tabular-nums">
          {fmtAssetPrice(a, locale)}
        </Live>
        <span className={`t-cap font-bold tabular-nums ${up ? 'up' : 'down'}`}>{arrowPct(a.changePct, locale)}</span>
      </span>
    </Link>
  )
}

export function MarketSeg({ active }: { active: 'assets' | 'portfolio' | 'orders' }) {
  const t = useTranslations('market')
  const router = useRouter()
  return (
    <Seg
      label={t('sections')}
      value={active}
      onChange={v => router.push(v === 'assets' ? '/mercado' : v === 'portfolio' ? '/mercado/cartera' : '/mercado/ordenes')}
      options={[
        { value: 'assets', label: t('assets') },
        { value: 'portfolio', label: t('portfolio') },
        { value: 'orders', label: t('orders') },
      ]}
    />
  )
}
