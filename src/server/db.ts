import 'server-only'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

// Esquema: «v2» en producción; «v2_dev» en local (DB_SCHEMA en .env.local).
// Se valida porque también se usa en alguna consulta SQL escrita a mano.
export const DB_SCHEMA = /^[a-z0-9_]+$/.test(process.env.DB_SCHEMA ?? '') ? process.env.DB_SCHEMA! : 'v2'

// Un solo cliente por instancia (en desarrollo, también entre recargas en caliente).
// Vercel reparte muchas peticiones a la vez en la misma instancia y cada transacción ocupa una conexión mientras dura:
// con el valor por defecto (10) hacían cola con 50 usuarios a la vez. El pooler de Neon admite miles de conexiones.
const globalForDb = globalThis as unknown as { db?: PrismaClient }

function create() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL, max: 30, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 }, { schema: DB_SCHEMA })
  return new PrismaClient({ adapter })
}

export const db = globalForDb.db ?? create()
if (process.env.NODE_ENV !== 'production') globalForDb.db = db
