// Pasa el progreso del curso anterior al curso v2: cada lección aprobada se apunta en su equivalente nueva
// (src/server/content/v2/legacy-map.ts) con las mismas estrellas, y se borran los fallos pendientes de repasar
// del curso anterior (sus preguntas ya no existen). Ejecutar UNA vez, al activar el curso v2 (después borraría también fallos nuevos).
// Uso: DB_SCHEMA=v2_dev npx tsx scripts/migrate-progress-v2.ts [--apply]   (sin --apply solo cuenta)
import { config } from 'dotenv'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'
import { LEGACY_TO_V2 } from '../src/server/content/v2/legacy-map'

config({ path: '.env.local', quiet: true })
const schema = process.env.DB_SCHEMA ?? 'v2_dev'
const apply = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema }) })

async function main() {
  const old = await db.lessonProgress.findMany({ where: { lessonId: { in: Object.keys(LEGACY_TO_V2) } } })
  // Mejor resultado por usuario y lección nueva
  const best = new Map<string, { userId: string; lessonId: string; stars: number; skipped: boolean }>()
  for (const p of old) {
    const lessonId = LEGACY_TO_V2[p.lessonId]
    const k = `${p.userId}:${lessonId}`
    const prev = best.get(k)
    if (!prev || p.stars > prev.stars) best.set(k, { userId: p.userId, lessonId, stars: p.stars, skipped: p.skipped })
  }
  const mistakes = await db.mistake.count({ where: { questionId: { startsWith: 'u' } } })
  console.log(`[${schema}] ${old.length} lecciones antiguas aprobadas → ${best.size} lecciones nuevas · ${mistakes} fallos antiguos por repasar`)
  if (!apply) return console.log('Prueba en seco: añade --apply para escribir')
  for (const r of best.values())
    await db.lessonProgress.upsert({ where: { userId_lessonId: { userId: r.userId, lessonId: r.lessonId } }, create: r, update: { stars: r.stars } })
  // Las ids antiguas que coinciden con ids nuevas (u1l1…) se sustituyen; las demás se borran
  const newIds = new Set([...best.values()].map(r => `${r.userId}:${r.lessonId}`))
  const stale = old.filter(p => !newIds.has(`${p.userId}:${p.lessonId}`))
  for (const p of stale) await db.lessonProgress.delete({ where: { userId_lessonId: { userId: p.userId, lessonId: p.lessonId } } }).catch(() => null)
  const del = await db.mistake.deleteMany({ where: { questionId: { startsWith: 'u' } } })
  console.log(`Hecho: ${best.size} lecciones apuntadas, ${stale.length} antiguas retiradas, ${del.count} fallos antiguos borrados`)
}

main().finally(() => db.$disconnect())
