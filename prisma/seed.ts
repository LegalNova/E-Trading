// Carga el catálogo global de activos (src/server/market/universe.json) en la tabla Asset.
// Idempotente. Uso: npm run db:seed  (DB_SCHEMA=v2 para producción)
import { readFileSync } from 'node:fs'
import { config } from 'dotenv'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'
import { EXCHANGE_BY_TZ } from '../src/shared/market-hours'

config({ path: '.env.local', quiet: true })
const schema = process.env.DB_SCHEMA ?? 'v2'
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema }) })

interface U { symbol: string; name: string; type: 'STOCK' | 'ETF' | 'INDEX' | 'CRYPTO' | 'FX' | 'COMMODITY'; sector: string; indices: string[]; exchange: string; exchangeName: string; country: string; region: string; currency: string; tz: string; hidden?: boolean }

// Retraso habitual de los datos gratuitos por bolsa (minutos)
const DELAY: Record<string, number> = { US: 0, CRYPTO: 0, FX: 0, CME: 10, TSE: 20, KRX: 20, ASX: 20 }

function sessionOf(a: U) {
  if (a.type === 'CRYPTO') return 'CRYPTO'
  if (a.type === 'FX') return 'FX'
  if (a.type === 'COMMODITY') return 'CME'
  if (a.type === 'INDEX') return EXCHANGE_BY_TZ[a.tz] ?? 'US'
  return a.exchange
}

async function main() {
  const universe: U[] = JSON.parse(readFileSync('src/server/market/universe.json', 'utf8'))
  const keep = new Set(universe.map(a => a.symbol))
  const old = await db.asset.deleteMany({ where: { symbol: { notIn: [...keep] } } })
  const rows = universe.map((a, i) => {
    const hours = sessionOf(a)
    return {
      symbol: a.symbol, name: a.name, type: a.type, exchange: hours, exchangeName: a.exchangeName, hours, currency: a.currency, provider: 'YAHOO', providerSymbol: a.symbol,
      delayedMinutes: a.type === 'INDEX' && a.symbol !== '^GSPC' && a.symbol !== '^NDX' && a.symbol !== '^DJI' ? 15 : (DELAY[hours] ?? 15),
      hidden: !!a.hidden, sortOrder: i, region: a.region, country: a.country, sector: a.sector, indices: a.indices, enabled: true,
    }
  })
  // Por lotes: crear los nuevos y actualizar los existentes
  const existing = new Set((await db.asset.findMany({ select: { symbol: true } })).map(a => a.symbol))
  const create = rows.filter(r => !existing.has(r.symbol))
  for (let i = 0; i < create.length; i += 500) await db.asset.createMany({ data: create.slice(i, i + 500), skipDuplicates: true })
  const update = rows.filter(r => existing.has(r.symbol))
  for (let i = 0; i < update.length; i += 50) await Promise.all(update.slice(i, i + 50).map(({ symbol, ...data }) => db.asset.update({ where: { symbol }, data })))
  console.log(`[${schema}] Activos: ${rows.length} (nuevos ${create.length}, actualizados ${update.length}, retirados ${old.count})`)
}

main().finally(() => db.$disconnect())
