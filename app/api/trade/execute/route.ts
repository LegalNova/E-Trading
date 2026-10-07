import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sql, getMonday } from '@/lib/db'
import { getPriced } from '@/lib/market'
import { PLANES } from '@/lib/plans'
import { checkBadges } from '@/lib/badges'
import { ASSET_BY_SYMBOL } from '@/data/assets'

// POST /api/trade/execute
//   { type: 'buy',  symbol, amountEur }   compra por importe en euros
//   { type: 'sell', symbol, percent }     vende un % (1-100) de la posición
//
// El precio lo pone el servidor (nunca el cliente) y toda la operación
// (límite semanal, saldo, posición e historial) se aplica en una única
// sentencia SQL: o se hace todo o no se hace nada.
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: { type?: string; symbol?: string; amountEur?: number; percent?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  const type = body.type
  const sym = String(body.symbol ?? '').toUpperCase()
  const asset = ASSET_BY_SYMBOL[sym]
  if (type !== 'buy' && type !== 'sell') return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  if (!asset) return NextResponse.json({ error: 'Activo inválido' }, { status: 400 })

  const amount = Math.round(Number(body.amountEur) * 100) / 100
  const percent = Number(body.percent)
  if (type === 'buy' && !(amount >= 1 && amount <= 1_000_000)) {
    return NextResponse.json({ error: 'El importe mínimo es 1 €' }, { status: 400 })
  }
  if (type === 'sell' && !(percent > 0 && percent <= 100)) {
    return NextResponse.json({ error: 'Porcentaje inválido' }, { status: 400 })
  }

  const { priced } = await getPriced([sym])
  const p = priced[sym]
  if (!p || !(p.priceEur > 0)) return NextResponse.json({ error: 'Precio no disponible' }, { status: 503 })

  const plan = PLANES[user.effectivePlan]
  const limit = plan.opsSemana ?? 1_000_000_000
  const week = getMonday(new Date())
  const db = sql()

  try {
    if (type === 'buy') {
      const shares = amount / p.priceEur
      const rows = await db`
        WITH ok AS (
          SELECT 1 FROM portfolio WHERE user_id = ${user.id} AND cash >= ${amount}::numeric
        ),
        ops AS (
          INSERT INTO weekly_usage (user_id, week_start, ops_count)
          SELECT ${user.id}, ${week}::date, 1 FROM ok
          ON CONFLICT (user_id, week_start) DO UPDATE SET ops_count = weekly_usage.ops_count + 1
          WHERE weekly_usage.ops_count < ${limit}::int
          RETURNING ops_count
        ),
        pay AS (
          UPDATE portfolio SET cash = cash - ${amount}::numeric, updated_at = NOW()
          WHERE user_id = ${user.id} AND cash >= ${amount}::numeric AND EXISTS (SELECT 1 FROM ops)
          RETURNING cash
        ),
        pos AS (
          INSERT INTO positions (user_id, symbol, shares, avg_price, cost_eur)
          SELECT ${user.id}, ${sym}, ${shares}::numeric, ${p.quote.price}::numeric, ${amount}::numeric FROM pay
          ON CONFLICT (user_id, symbol) DO UPDATE SET
            avg_price = (positions.shares * positions.avg_price + EXCLUDED.shares * EXCLUDED.avg_price)
                        / (positions.shares + EXCLUDED.shares),
            shares    = positions.shares + EXCLUDED.shares,
            cost_eur  = positions.cost_eur + EXCLUDED.cost_eur
          RETURNING shares
        ),
        tr AS (
          INSERT INTO trades (user_id, type, symbol, shares, price, total, currency, fx_rate)
          SELECT ${user.id}, 'buy', ${sym}, ${shares}::numeric, ${p.quote.price}::numeric, ${amount}::numeric,
                 ${asset.currency}, ${p.fx}::numeric
          FROM pay
          RETURNING id
        )
        SELECT EXISTS (SELECT 1 FROM ok) AS has_cash,
               EXISTS (SELECT 1 FROM ops) AS within_limit,
               (SELECT cash FROM pay) AS cash,
               (SELECT shares FROM pos) AS position_shares`
      const r = rows[0] as { has_cash: boolean; within_limit: boolean; cash: number | null; position_shares: number | null }

      if (!r.has_cash) return NextResponse.json({ error: 'No tienes suficiente saldo virtual' }, { status: 400 })
      if (!r.within_limit) return limitError(plan.label, plan.opsSemana)
      if (r.cash === null) return NextResponse.json({ error: 'No tienes suficiente saldo virtual' }, { status: 400 })

      const badges = await checkBadges(user.id, await categoriesTraded(user.id))
      return NextResponse.json({
        success: true,
        type,
        symbol: sym,
        shares,
        price: p.quote.price,
        currency: asset.currency,
        fx: p.fx,
        totalEur: amount,
        cash: r.cash,
        positionShares: r.position_shares,
        badges,
      })
    }

    // Venta por porcentaje de la posición
    const f = percent / 100
    const rows = await db`
      WITH p AS (
        SELECT shares, cost_eur FROM positions
        WHERE user_id = ${user.id} AND symbol = ${sym}
        FOR UPDATE
      ),
      ops AS (
        INSERT INTO weekly_usage (user_id, week_start, ops_count)
        SELECT ${user.id}, ${week}::date, 1 FROM p
        ON CONFLICT (user_id, week_start) DO UPDATE SET ops_count = weekly_usage.ops_count + 1
        WHERE weekly_usage.ops_count < ${limit}::int
        RETURNING ops_count
      ),
      s AS (
        SELECT shares * ${f}::numeric AS sh, cost_eur * ${f}::numeric AS cost
        FROM p WHERE EXISTS (SELECT 1 FROM ops)
      ),
      upd AS (
        UPDATE positions SET shares = positions.shares - s.sh, cost_eur = positions.cost_eur - s.cost
        FROM s
        WHERE positions.user_id = ${user.id} AND positions.symbol = ${sym} AND ${f}::numeric < 1
        RETURNING positions.shares
      ),
      del AS (
        DELETE FROM positions
        WHERE user_id = ${user.id} AND symbol = ${sym} AND ${f}::numeric >= 1 AND EXISTS (SELECT 1 FROM s)
        RETURNING 1
      ),
      pay AS (
        UPDATE portfolio SET cash = cash + round((SELECT sh FROM s) * ${p.priceEur}::numeric, 2), updated_at = NOW()
        WHERE user_id = ${user.id} AND EXISTS (SELECT 1 FROM s)
        RETURNING cash
      ),
      tr AS (
        INSERT INTO trades (user_id, type, symbol, shares, price, total, currency, fx_rate, pnl_eur)
        SELECT ${user.id}, 'sell', ${sym}, s.sh, ${p.quote.price}::numeric,
               round(s.sh * ${p.priceEur}::numeric, 2), ${asset.currency}, ${p.fx}::numeric,
               round(s.sh * ${p.priceEur}::numeric - s.cost, 2)
        FROM s
        RETURNING shares, total, pnl_eur
      )
      SELECT EXISTS (SELECT 1 FROM p) AS has_position,
             EXISTS (SELECT 1 FROM ops) AS within_limit,
             (SELECT cash FROM pay) AS cash,
             (SELECT shares FROM tr) AS shares,
             (SELECT total FROM tr) AS total,
             (SELECT pnl_eur FROM tr) AS pnl,
             coalesce((SELECT shares FROM upd), 0) AS remaining`
    const r = rows[0] as {
      has_position: boolean; within_limit: boolean; cash: number | null
      shares: number | null; total: number | null; pnl: number | null; remaining: number
    }

    if (!r.has_position) return NextResponse.json({ error: 'No tienes posición en este activo' }, { status: 400 })
    if (!r.within_limit) return limitError(plan.label, plan.opsSemana)

    const badges = await checkBadges(user.id, await categoriesTraded(user.id))
    return NextResponse.json({
      success: true,
      type,
      symbol: sym,
      shares: r.shares,
      price: p.quote.price,
      currency: asset.currency,
      fx: p.fx,
      totalEur: r.total,
      pnlEur: r.pnl,
      cash: r.cash,
      positionShares: r.remaining,
      badges,
    })
  } catch (err) {
    console.error('Trade execute error:', err)
    return NextResponse.json({ error: 'No se pudo ejecutar la operación' }, { status: 500 })
  }
}

function limitError(planLabel: string, max: number | null) {
  return NextResponse.json(
    {
      error: `Has llegado a las ${max} operaciones de esta semana del plan ${planLabel}. Se renuevan el lunes.`,
      limitReached: true,
    },
    { status: 429 },
  )
}

async function categoriesTraded(userId: string): Promise<number> {
  const rows = await sql()`SELECT DISTINCT symbol FROM trades WHERE user_id = ${userId}`
  return new Set(rows.map(r => ASSET_BY_SYMBOL[r.symbol as string]?.category).filter(Boolean)).size
}
