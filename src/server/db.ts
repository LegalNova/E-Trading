import 'server-only'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

// Una sola conexión por instancia (en desarrollo, también entre recargas en caliente)
const globalForDb = globalThis as unknown as { db?: PrismaClient }

function create() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema: 'v2' })
  return new PrismaClient({ adapter })
}

export const db = globalForDb.db ?? create()
if (process.env.NODE_ENV !== 'production') globalForDb.db = db
