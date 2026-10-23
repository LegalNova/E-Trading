// Carga el catálogo de activos (idempotente). Uso: npm run db:seed
import { config } from 'dotenv'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'
import { CATALOG } from '../src/server/market/catalog'

config({ path: '.env.local', quiet: true })
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema: 'v2' }) })

async function main() {
  for (const [i, a] of CATALOG.entries()) {
    const data = { ...a, sortOrder: i }
    await db.asset.upsert({ where: { symbol: a.symbol }, create: data, update: data })
  }
  console.log(`Activos: ${CATALOG.length}`)
}

main().finally(() => db.$disconnect())
