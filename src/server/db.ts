import 'server-only'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

// Esquema: «v2» en producción; «v2_dev» en local (DB_SCHEMA en .env.local)
// Una sola conexión por instancia (en desarrollo, también entre recargas en caliente)
const globalForDb = globalThis as unknown as { db?: PrismaClient }

function create() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema: process.env.DB_SCHEMA ?? 'v2' })
  return new PrismaClient({ adapter })
}

export const db = globalForDb.db ?? create()
if (process.env.NODE_ENV !== 'production') globalForDb.db = db
