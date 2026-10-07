import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sql, getPortfolio, getPositions, getTrades } from '@/lib/db'
import { getPriced } from '@/lib/market'
import { ASSET_BY_SYMBOL, AssetCategory } from '@/data/assets'

export const dynamic = 'force-dynamic'

const INITIAL_CASH = 10000

const GROUP: Record<AssetCategory, string> = {
  'acciones-us': 'Acciones',
  'acciones-eu': 'Acciones',
  etfs: 'ETFs',
  cripto: 'Cripto',
  forex: 'Forex',
  materias: 'Materias primas',
  indices: 'Índices',
}

const GROUP_COLOR: Record<string, string> = {
  Acciones: 'var(--green)',
  ETFs: 'var(--blue)',
  Cripto: 'var(--purple)',
  Forex: 'var(--amber)',
  'Materias primas': 'var(--gold)',
  Índices: 'var(--red)',
  Efectivo: 'var(--text-tertiary)',
}

const r2 = (n: number) => Math.round(n * 100) / 100

// GET /api/portfolio → valor total, posiciones valoradas en €, distribución, histórico y operaciones
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const [portfolio, positions, trades] = await Promise.all([
    getPortfolio(user.id),
    getPositions(user.id),
    getTrades(user.id, 50),
  ])
  const cash = portfolio?.cash ?? INITIAL_CASH
  const { priced } = await getPriced(positions.map(p => p.symbol))

  let invested = 0
  let todayChange = 0
  const groups: Record<string, number> = {}

  const pos = positions.map(p => {
    const pr = priced[p.symbol]
    const asset = ASSET_BY_SYMBOL[p.symbol]
    const priceEur = pr?.priceEur ?? p.avg_price
    const value = p.shares * priceEur
    const cost = p.cost_eur > 0 ? p.cost_eur : p.shares * p.avg_price
    const chgPct = pr?.quote.changePercent ?? 0
    invested += value
    todayChange += value - value / (1 + chgPct / 100)
    const g = asset ? GROUP[asset.category] : 'Acciones'
    groups[g] = (groups[g] ?? 0) + value
    return {
      symbol: p.symbol,
      name: asset?.name ?? p.symbol,
      category: asset?.category ?? null,
      currency: asset?.currency ?? 'USD',
      shares: p.shares,
      avgPrice: p.avg_price,
      price: pr?.quote.price ?? p.avg_price,
      changePct: chgPct,
      valueEur: r2(value),
      costEur: r2(cost),
      pnlEur: r2(value - cost),
      pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
    }
  }).sort((a, b) => b.valueEur - a.valueEur)

  const total = cash + invested
  groups.Efectivo = cash

  // Un punto por día para el gráfico del portafolio
  const db = sql()
  await db`
    INSERT INTO portfolio_snapshots (user_id, date, value_eur) VALUES (${user.id}, CURRENT_DATE, ${r2(total)})
    ON CONFLICT (user_id, date) DO UPDATE SET value_eur = EXCLUDED.value_eur`
  const snaps = await db`
    SELECT date, value_eur FROM portfolio_snapshots WHERE user_id = ${user.id} ORDER BY date ASC`

  const history = [
    { date: user.created_at.slice(0, 10), value: INITIAL_CASH },
    ...snaps.map(s => ({ date: s.date as string, value: s.value_eur as number })),
  ]

  return NextResponse.json({
    total: r2(total),
    cash: r2(cash),
    invested: r2(invested),
    pnlEur: r2(total - INITIAL_CASH),
    pnlPct: ((total - INITIAL_CASH) / INITIAL_CASH) * 100,
    todayEur: r2(todayChange),
    todayPct: total - todayChange > 0 ? (todayChange / (total - todayChange)) * 100 : 0,
    allocation: Object.entries(groups)
      .filter(([, v]) => v > 0.005)
      .sort(([a, va], [b, vb]) => (a === 'Efectivo' ? 1 : b === 'Efectivo' ? -1 : vb - va))
      .map(([label, v]) => ({ label, valueEur: r2(v), pct: total > 0 ? (v / total) * 100 : 0, color: GROUP_COLOR[label] })),
    positions: pos,
    history,
    trades: trades.map(t => ({
      id: t.id,
      type: t.type,
      symbol: t.symbol,
      name: ASSET_BY_SYMBOL[t.symbol]?.name ?? t.symbol,
      shares: t.shares,
      price: t.price,
      currency: ASSET_BY_SYMBOL[t.symbol]?.currency ?? 'USD',
      totalEur: t.total,
      pnlEur: (t as { pnl_eur?: number | null }).pnl_eur ?? null,
      executedAt: t.executed_at,
    })),
  })
}
