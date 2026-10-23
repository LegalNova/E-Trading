import 'server-only'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

// Esquema: «v2» en producción; «v2_dev» en local (DB_SCHEMA en .env.local).
// Se valida porque también se usa en alguna consulta SQL escrita a mano.
export const DB_SCHEMA = /^[a-z0-9_]+$/.test(process.env.DB_SCHEMA ?? '') ? process.env.DB_SCHEMA! : 'v2'

// Una sola conexión por instancia (en desarrollo, también entre recargas en caliente)
const globalForDb = globalThis as unknown as { db?: PrismaClient }

function create() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema: DB_SCHEMA })
  return new PrismaClient({ adapter })
}

export const db = globalForDb.db ?? create()
if (process.env.NODE_ENV !== 'production') globalForDb.db = db
