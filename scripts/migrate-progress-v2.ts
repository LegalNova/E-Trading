// Paso del curso anterior al curso v2.
//   --first-run  (UNA sola vez por esquema, al activar el curso v2): cada lección antigua aprobada se apunta en su
//                equivalente nueva (src/server/content/v2/legacy-map.ts) y se borran los fallos antiguos (sus preguntas
//                ya no existen). No se puede repetir: varios ids antiguos coinciden con ids nuevos (u1l1…).
//   --bosses     (repetible): da por superado el reto final de cada sección en la que el alumno ya tiene aprobado
//                al menos el 60 % de las clases, para que quien iba avanzado no tenga que volver a empezar.
// Sin --apply solo cuenta. Uso: DB_SCHEMA=v2 npx tsx scripts/migrate-progress-v2.ts --first-run --bosses --apply
import { readFileSync } from 'node:fs'
import { config } from 'dotenv'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'
import { LEGACY_TO_V2 } from '../src/server/content/v2/legacy-map'

config({ path: '.env.local', quiet: true })
const schema = process.env.DB_SCHEMA ?? 'v2_dev'
const apply = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }, { schema }) })

interface Map { sections: { id: string; units: { lessons: { id: string; review?: boolean }[] }[] }[] }

async function firstRun() {
  const old = await db.lessonProgress.findMany({ where: { lessonId: { in: Object.keys(LEGACY_TO_V2) } } })
  const best = new Map<string, { userId: string; lessonId: string; stars: number; skipped: boolean }>()
  for (const p of old) {
    const lessonId = LEGACY_TO_V2[p.lessonId]
    const k = `${p.userId}:${lessonId}`
    const prev = best.get(k)
    if (!prev || p.stars > prev.stars) best.set(k, { userId: p.userId, lessonId, stars: p.stars, skipped: p.skipped })
  }
  const mistakes = await db.mistake.count()
  console.log(`[${schema}] ${old.length} lecciones antiguas → ${best.size} nuevas · ${mistakes} fallos antiguos`)
  if (!apply) return
  for (const r of best.values()) await db.lessonProgress.upsert({ where: { userId_lessonId: { userId: r.userId, lessonId: r.lessonId } }, create: r, update: { stars: r.stars } })
  const keep = new Set([...best.values()].map(r => `${r.userId}:${r.lessonId}`))
  const stale = old.filter(p => !keep.has(`${p.userId}:${p.lessonId}`))
  for (const p of stale) await db.lessonProgress.delete({ where: { userId_lessonId: { userId: p.userId, lessonId: p.lessonId } } }).catch(() => null)
  const del = await db.mistake.deleteMany({})
  console.log(`Hecho: ${best.size} apuntadas, ${stale.length} antiguas retiradas, ${del.count} fallos antiguos borrados`)
}

async function bosses() {
  const map = JSON.parse(readFileSync('docs/curso-v2/curriculo.json', 'utf8')) as Map
  const rows = await db.lessonProgress.findMany({ select: { userId: true, lessonId: true } })
  const byUser = new Map<string, Set<string>>()
  for (const r of rows) (byUser.get(r.userId) ?? byUser.set(r.userId, new Set()).get(r.userId)!).add(r.lessonId)
  const grants: { userId: string; lessonId: string }[] = []
  for (const [userId, done] of byUser)
    for (const s of map.sections) {
      const ids = s.units.flatMap(u => u.lessons.filter(l => !l.review).map(l => l.id))
      const boss = `${s.id}boss`
      if (!done.has(boss) && ids.filter(id => done.has(id)).length / ids.length >= 0.6) grants.push({ userId, lessonId: boss })
    }
  console.log(`[${schema}] retos finales a dar por superados: ${grants.length}`)
  if (apply) for (const g of grants) await db.lessonProgress.upsert({ where: { userId_lessonId: g }, create: { ...g, stars: 1 }, update: {} })
}

async function main() {
  if (!process.argv.includes('--first-run') && !process.argv.includes('--bosses')) throw new Error('Indica --first-run y/o --bosses')
  if (process.argv.includes('--first-run')) await firstRun()
  if (process.argv.includes('--bosses')) await bosses()
  if (!apply) console.log('Prueba en seco: añade --apply para escribir')
}

main().finally(() => db.$disconnect())
