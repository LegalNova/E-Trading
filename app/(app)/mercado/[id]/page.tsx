'use client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ASSET_BY_SYMBOL, CATEGORY_LABELS } from '@/data/assets'
import { useQuotes } from '@/hooks/useQuotes'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useMe } from '@/components/shell/MeProvider'
import { syntheticSeries, PERIODS, PERIOD_KEYS, Period } from '@/lib/sim'
import { fe, fes, fpct, fprice, fshares, fcompact, f2 } from '@/lib/format'
import { NavBar } from '@/components/ui/NavBar'
import { Icon, ICONS } from '@/components/ui/Icon'
import { Seg } from '@/components/ui/Seg'
import { AreaChart } from '@/components/ui/AreaChart'
import { Help } from '@/components/ui/Help'
import { useToast } from '@/components/ui/Toast'
import { AssetAvatar } from '@/components/market/AssetRow'
import { TradeSheet, TradeResult } from '@/components/market/TradeSheet'
import { card, h2, tag, btnPrimary } from '@/components/ui/styles'

const LABEL: Record<Period, string> = { '1D': 'hoy', '1S': 'esta semana', '1M': 'este mes', '3M': 'en 3 meses', '1A': 'este año', Todo: 'en 5 años' }

export default function AssetPage() {
  const params = useParams<{ id: string }>()
  const sym = decodeURIComponent(params?.id ?? '').toUpperCase()
  const asset = ASSET_BY_SYMBOL[sym]
  const router = useRouter()
  const toast = useToast()
  const { refresh: refreshMe } = useMe()
  const { quotes } = useQuotes(asset ? [asset.symbol] : [])
  const { data: pf, refetch } = usePortfolio()
  const [period, setPeriod] = useState<Period>('1D')
  const [fav, setFav] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)

  useEffect(() => {
    fetch('/api/favorites').then(r => (r.ok ? r.json() : { symbols: [] })).then(d => setFav((d.symbols ?? []).includes(sym))).catch(() => {})
  }, [sym])

  const q = asset ? quotes[asset.symbol] : undefined
  const forex = asset?.category === 'forex'

  const series = useMemo(() => {
    if (!asset || !q) return []
    const { span, points } = PERIODS[period]
    return syntheticSeries(asset.symbol, asset.basePrice, span, points, q.price, period === '1D' ? q.prevClose : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.symbol, period, q?.price.toPrecision(6), q?.prevClose])

  if (!asset) {
    return (
      <div className="et-page" style={{ padding: 16 }}>
        <NavBar title="Activo" back="/mercado" backLabel="Mercado" alwaysTitle />
        <div style={{ ...card, padding: 24, marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ font: '600 17px var(--font)' }}>No encontramos «{sym}»</span>
          <Link href="/mercado" style={{ ...btnPrimary, height: 44, textDecoration: 'none' }}>Volver al mercado</Link>
        </div>
      </div>
    )
  }

  const first = series[0] ?? 0
  const last = series[series.length - 1] ?? 0
  const pChg = last - first
  const pPct = first ? (pChg / first) * 100 : 0
  const up = pChg >= 0
  const position = pf?.positions.find(p => p.symbol === asset.symbol) ?? null
  const span = PERIODS[period].span
  const n = series.length

  const stats: [string, string, string][] = q
    ? ([
        ['Apertura', fprice(q.open, asset.currency, forex), 'apertura'],
        ['Máx.', fprice(q.high, asset.currency, forex), 'max'],
        ['Mín.', fprice(q.low, asset.currency, forex), 'min'],
        ['Cierre anterior', fprice(q.prevClose, asset.currency, forex), 'cierre'],
        ...(q.volume > 0 ? [['Volumen', fcompact(q.volume), 'vol'] as [string, string, string]] : []),
        ...(asset.marketCap ? [['Cap. bursátil', fcap(asset.marketCap), 'cap'] as [string, string, string]] : []),
        ...(asset.pe ? [['PER', f2(asset.pe), 'per'] as [string, string, string]] : []),
        ...(asset.dividendYield ? [['Dividendo', f2(asset.dividendYield) + ' %', 'div'] as [string, string, string]] : []),
      ])
    : []

  async function toggleFav() {
    const next = !fav
    setFav(next)
    const res = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: asset.symbol }) }).catch(() => null)
    if (!res?.ok) { setFav(!next); toast({ msg: 'No se pudo guardar el favorito', tone: 'error' }); return }
    toast(next ? `${asset.name} añadida a favoritos` : `${asset.name} eliminada de favoritos`)
  }

  function onTradeDone(r: TradeResult) {
    setTradeOpen(false)
    refetch()
    refreshMe()
    const msg = r.type === 'buy'
      ? `Compra realizada: ${fshares(r.shares)} ${r.symbol}`
      : `Venta realizada: recibes ${fe(r.totalEur)}${r.pnlEur != null ? ` (${fes(r.pnlEur)})` : ''}`
    toast({ msg, action: { label: 'Ver portafolio', onClick: () => router.push('/portafolio') } })
    if (r.badges?.length) setTimeout(() => toast(`Insignia desbloqueada: ${r.badges![0].emoji} ${r.badges![0].nombre}`), 4200)
  }

  // Resumen en lenguaje sencillo generado a partir de los datos
  const dayUp = (q?.changePercent ?? 0) >= 0
  const summary = q ? [
    `${asset.name} ${dayUp ? 'sube' : 'baja'} hoy un ${f2(Math.abs(q.changePercent))} % respecto al cierre anterior.`,
    asset.pe
      ? `Su PER de ${f2(asset.pe)} indica que pagas unos ${Math.round(asset.pe)} años de beneficios actuales: ${asset.pe > 30 ? 'el mercado espera que siga creciendo, y por eso una mala noticia puede hacerla caer más.' : 'una valoración moderada para una empresa cotizada.'}`
      : asset.category === 'cripto'
        ? 'Las criptomonedas no tienen beneficios ni dividendos: su precio depende solo de lo que otros estén dispuestos a pagar. Por eso se mueven tanto.'
        : asset.category === 'etfs'
          ? 'Un ETF reúne muchas empresas a la vez, así que reparte el riesgo de forma automática.'
          : null,
    asset.description ?? null,
    asset.category === 'etfs' ? null : 'Recuerda: un solo activo concentra el riesgo. Diversificar lo reparte.',
  ].filter(Boolean) as string[] : []

  return (
    <div className="et-page" style={{ paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}>
      <NavBar
        title={`${asset.symbol}${q ? ' · ' + fprice(q.price, asset.currency, forex) : ''}`}
        back="/mercado"
        backLabel="Mercado"
        right={
          <button onClick={toggleFav} aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'} aria-pressed={fav}
            style={{ width: 44, height: 44, border: 'none', background: 'none', color: fav ? 'var(--amber)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.star} size={22} fill={fav ? 'var(--amber)' : 'none'} />
          </button>
        }
      />

      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <AssetAvatar symbol={asset.symbol} size={32} />
          <span style={{ font: '600 17px var(--font)' }}>{asset.name}</span>
          <span style={tag}>{asset.symbol} · {CATEGORY_LABELS[asset.category]}</span>
        </div>
        {q ? (
          <>
            <span style={{ font: '600 48px/56px var(--font)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>
              {fprice(q.price, asset.currency, forex)}
            </span>
            <span style={{ font: '500 15px var(--font)', color: up ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
              {up ? '▲ +' : '▼ −'}{fprice(Math.abs(pChg), asset.currency, forex)} · {fpct(pPct).replace(/^[▲▼] /, '')} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{LABEL[period]}</span>
            </span>
            {(asset.currency !== 'EUR' || q.simulated) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 13px var(--font)', color: 'var(--text-secondary)', marginTop: 4, flexWrap: 'wrap' }}>
                {asset.currency !== 'EUR' && !forex && <>≈ {fe(q.priceEur)} por participación <Help k="fx" /></>}
                {q.simulated && <><span style={tag}>Precio simulado</span><Help k="simulado" /></>}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="skeleton" style={{ width: 200, height: 52, marginTop: 8 }} />
            <span className="skeleton" style={{ width: 160, height: 18 }} />
          </>
        )}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {q ? (
          <AreaChart
            values={series}
            up={up}
            height={180}
            label={`Gráfico del precio de ${asset.name} ${LABEL[period]}`}
            tooltip={i => {
              const t = Date.now() - span + (span * i) / Math.max(1, n - 1)
              const d = new Date(t)
              return {
                value: fprice(series[i], asset.currency, forex),
                date: period === '1D'
                  ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: period === '1A' || period === 'Todo' ? 'numeric' : undefined }),
              }
            }}
          />
        ) : <div className="skeleton" style={{ height: 180 }} />}
        <div style={{ marginTop: 12 }}>
          <Seg label="Periodo" options={PERIOD_KEYS} value={period} onChange={setPeriod} />
        </div>
        <p style={{ margin: '8px 0 0', font: '400 12px var(--font)', color: 'var(--text-tertiary)' }}>
          {q ? (q.simulated ? 'Precio y gráfico simulados.' : 'Precio actual real · el histórico del gráfico es aproximado.') : '\u00a0'}
        </p>
      </div>

      {position && (
        <div style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={h2}>Tu posición</h2>
          <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <Cell label="Participaciones" help="part" value={fshares(position.shares)} br bb />
            <Cell label="Precio medio" help="medio" value={fprice(position.avgPrice, asset.currency, forex)} bb />
            <Cell label="Valor actual" value={fe(position.valueEur)} br />
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>{position.pnlEur >= 0 ? 'Ganancia' : 'Pérdida'}</span>
              <span style={{ font: '600 17px var(--font)', color: position.pnlEur >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{fes(position.pnlEur)}</span>
              <span style={{ font: '500 12px var(--font)', color: position.pnlEur >= 0 ? 'var(--green)' : 'var(--red)' }}>{fpct(position.pnlPct)}</span>
            </div>
          </div>
        </div>
      )}

      {stats.length > 0 && (
        <div style={{ padding: '32px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={h2}>Datos clave</h2>
          <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
            {stats.map(([l, v, k], i) => (
              <div key={l} style={{
                padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2,
                borderBottom: i < stats.length - (stats.length % 2 === 0 ? 2 : 1) ? '1px solid var(--border)' : 'none',
                borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>{l}<Help k={k} /></span>
                <span style={{ font: '500 15px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.length > 0 && (
        <div style={{ padding: '32px 16px 0' }}>
          <div style={card}>
            <button onClick={() => setAiOpen(o => !o)} aria-expanded={aiOpen}
              style={{ width: '100%', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', border: 'none', background: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '8px 0' }}>
                <span style={{ font: '600 17px var(--font)' }}>En pocas palabras</span>
                <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)' }}>Resumen en lenguaje sencillo</span>
              </span>
              <span style={{ font: '400 22px var(--font)', color: 'var(--text-secondary)' }}>{aiOpen ? '−' : '+'}</span>
            </button>
            {aiOpen && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, font: '400 15px/22px var(--font)' }}>
                {summary.map((s, i) => <p key={i} style={{ margin: 0, color: i === summary.length - 1 ? 'var(--text-secondary)' : undefined }}>{s}</p>)}
                <Link href="/ia" style={{ font: '500 15px var(--font)' }}>Pregunta a la Profesora IA</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ margin: '24px 16px 0', font: '400 12px/16px var(--font)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Simulación educativa · No es asesoramiento financiero
      </p>

      {/* Barra inferior fija */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 35, borderTop: '1px solid var(--border)', background: 'var(--surface-1)',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div className="et-page" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ font: '400 12px var(--font)', color: 'var(--text-secondary)' }}>Saldo disponible</span>
            <span style={{ font: '600 17px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{pf ? fe(pf.cash) : '—'}</span>
          </span>
          <button onClick={() => setTradeOpen(true)} disabled={!q || !pf} style={{ ...btnPrimary, height: 44, padding: '0 24px', opacity: q && pf ? 1 : 0.5 }}>
            Comprar o vender
          </button>
        </div>
      </div>

      <TradeSheet
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        asset={asset}
        q={q}
        cash={pf?.cash ?? 0}
        position={position ? { shares: position.shares, valueEur: position.valueEur } : null}
        onDone={onTradeDone}
      />
    </div>
  )
}

/** "2.8T" → "2,8 bill. $", "560B" → "560 mil M $" */
function fcap(raw: string): string {
  const m = raw.match(/^([\d.]+)\s*([TBM])$/i)
  if (!m) return raw
  const n = Number(m[1]).toLocaleString('es-ES', { maximumFractionDigits: 1 })
  return `${n} ${{ T: 'bill.', B: 'mil M', M: 'M' }[m[2].toUpperCase() as 'T' | 'B' | 'M']} $`
}

function Cell({ label, value, help, br, bb }: { label: string; value: string; help?: string; br?: boolean; bb?: boolean }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, borderRight: br ? '1px solid var(--border)' : 'none', borderBottom: bb ? '1px solid var(--border)' : 'none' }}>
      <span style={{ font: '400 13px var(--font)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>{label}{help && <Help k={help} />}</span>
      <span style={{ font: '600 17px var(--font)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}
