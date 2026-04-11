import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import {
  getUserByEmail,
  getPortfolio,
  getPositionBySymbol,
  updatePortfolioCash,
  upsertPosition,
  deletePosition,
  recordTrade,
} from '@/lib/db'
import { ASSET_BY_SYMBOL } from '@/data/assets'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { type, symbol, amountEur, currentPrice } = body as {
      type: 'buy' | 'sell'
      symbol: string
      amountEur: number
      currentPrice: number
    }

    // Validation
    if (!type || !['buy', 'sell'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
    if (!symbol || !ASSET_BY_SYMBOL[symbol.toUpperCase()]) {
      return NextResponse.json({ error: 'Activo inválido' }, { status: 400 })
    }
    if (!amountEur || amountEur <= 0) {
      return NextResponse.json({ error: 'Importe inválido' }, { status: 400 })
    }
    if (!currentPrice || currentPrice <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const portfolio = await getPortfolio(user.id)
    if (!portfolio) return NextResponse.json({ error: 'Portfolio no encontrado' }, { status: 404 })

    const sym = symbol.toUpperCase()
    const shares = amountEur / currentPrice
    const cash = Number(portfolio.cash)

    if (type === 'buy') {
      if (cash < amountEur) {
        return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
      }

      // Update position (weighted average)
      const existing = await getPositionBySymbol(user.id, sym)
      let newShares: number
      let newAvgPrice: number
      if (existing) {
        const oldShares = Number(existing.shares)
        const oldAvg = Number(existing.avg_price)
        newShares = oldShares + shares
        newAvgPrice = (oldShares * oldAvg + shares * currentPrice) / newShares
      } else {
        newShares = shares
        newAvgPrice = currentPrice
      }

      await upsertPosition({ userId: user.id, symbol: sym, newShares, newAvgPrice })
      await updatePortfolioCash(user.id, cash - amountEur)
      await recordTrade({
        userId: user.id,
        type: 'buy',
        symbol: sym,
        shares,
        price: currentPrice,
        total: amountEur,
      })

      return NextResponse.json({
        success: true,
        message: `Compra ejecutada: ${shares.toFixed(6)} ${sym}`,
        newCash: cash - amountEur,
        shares,
      })
    } else {
      // Sell
      const existing = await getPositionBySymbol(user.id, sym)
      if (!existing) {
        return NextResponse.json({ error: 'No tienes posición en este activo' }, { status: 400 })
      }
      const currentShares = Number(existing.shares)
      if (currentShares < shares - 0.00001) {
        return NextResponse.json({ error: 'No tienes suficientes unidades' }, { status: 400 })
      }

      const remainingShares = currentShares - shares
      if (remainingShares < 0.00001) {
        await deletePosition(user.id, sym)
      } else {
        await upsertPosition({
          userId: user.id,
          symbol: sym,
          newShares: remainingShares,
          newAvgPrice: Number(existing.avg_price),
        })
      }

      await updatePortfolioCash(user.id, cash + amountEur)
      await recordTrade({
        userId: user.id,
        type: 'sell',
        symbol: sym,
        shares,
        price: currentPrice,
        total: amountEur,
      })

      return NextResponse.json({
        success: true,
        message: `Venta ejecutada: ${shares.toFixed(6)} ${sym}`,
        newCash: cash + amountEur,
        shares,
      })
    }
  } catch (err) {
    console.error('Trade execute error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
