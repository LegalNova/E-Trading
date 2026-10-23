// Da el rol ADMIN a una cuenta ya creada (D-038). Uso: DB_SCHEMA=v2 npx tsx scripts/promote-admin.ts email@ejemplo.com
// Solo tras confirmar con su dueño que la cuenta es suya: sin verificación de email, el registro no lo garantiza.
import { config } from 'dotenv'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'

config({ path: '.env.local', quiet: true })
const email = process.argv[2]?.toLowerCase()
const schema = process.env.DB_SCHEMA ?? 'v2'
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema }) })

async function main() {
  if (!email) throw new Error('Falta el email')
  const u = await db.user.update({ where: { email }, data: { role: 'ADMIN' } })
  await db.auditLog.create({ data: { actor: 'script', action: 'ROLE_ADMIN_GRANTED', entity: 'User', entityId: u.id } })
  console.log(`ADMIN: ${u.email} (${schema})`)
}
main().finally(() => db.$disconnect())
