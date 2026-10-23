// Configuración de Prisma 7. Las tablas de la v2 viven en el esquema "v2" de Neon,
// separadas de las de la v1 (que sigue en producción hasta el cambio, D-009).
import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ path: '.env.local', quiet: true })

export const DB_SCHEMA = 'v2'
const base = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? ''
const url = base ? `${base}${base.includes('?') ? '&' : '?'}schema=${DB_SCHEMA}` : ''

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url },
})
