import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sql, addXP } from '@/lib/db'
import { CATALOGO, MODULOS, RETRY_MS, gradeQuiz, planIncludes } from '@/lib/learning'
import { CLASE_BY_ID } from '@/data/clases-contenido'
import { PLANES } from '@/lib/plans'
import { checkBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

type Estado = 'completada' | 'disponible' | 'espera' | 'bloqueada' | 'proximamente'

// GET /api/progress/clase → catálogo con el estado de cada clase para el usuario
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const db = sql()
  const [done, lastFails] = await Promise.all([
    db`SELECT clase_id FROM clases_completadas WHERE user_id = ${user.id}`,
    db`SELECT DISTINCT ON (clase_id) clase_id, attempted_at, passed
       FROM clase_attempts WHERE user_id = ${user.id}
       ORDER BY clase_id, attempted_at DESC`,
  ])
  const completed = new Set(done.map(r => r.clase_id as string))
  const retryWait = RETRY_MS[user.effectivePlan]
  const retryAt: Record<string, string> = {}
  for (const a of lastFails) {
    if (a.passed) continue
    const at = new Date(a.attempted_at as string).getTime() + retryWait
    if (at > Date.now()) retryAt[a.clase_id as string] = new Date(at).toISOString()
  }

  const clases = CATALOGO.map(c => {
    let estado: Estado
    if (completed.has(c.id)) estado = 'completada'
    else if (!c.disponible) estado = 'proximamente'
    else if (!planIncludes(user.effectivePlan, c.plan)) estado = 'bloqueada'
    else if (retryAt[c.id]) estado = 'espera'
    else estado = 'disponible'
    return { ...c, estado, retryAt: retryAt[c.id] ?? null }
  })

  return NextResponse.json({
    plan: user.effectivePlan,
    completedIds: Array.from(completed),
    modulos: MODULOS.map(m => ({
      ...m,
      total: 10,
      completadas: clases.filter(c => c.modulo === m.n && c.estado === 'completada').length,
    })),
    clases,
  })
}

// POST /api/progress/clase { claseId, answers: number[] }
// Corrige el quiz. Aprobado (≥3/5) → marca la clase y suma XP (una sola vez).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { claseId, answers } = (await req.json().catch(() => ({}))) as { claseId?: string; answers?: unknown }
  const clase = claseId ? CLASE_BY_ID[claseId] : undefined
  if (!clase) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
  if (!planIncludes(user.effectivePlan, clase.plan)) {
    return NextResponse.json({ error: 'Esta clase no está incluida en tu plan', locked: true }, { status: 403 })
  }

  const result = gradeQuiz(clase, answers)
  if (!result) return NextResponse.json({ error: 'Respuestas incompletas' }, { status: 400 })

  const db = sql()
  const [prev, today, already] = await Promise.all([
    db`SELECT attempted_at, passed FROM clase_attempts
       WHERE user_id = ${user.id} AND clase_id = ${clase.id}
       ORDER BY attempted_at DESC LIMIT 1`,
    db`SELECT count(*) AS n FROM clase_attempts
       WHERE user_id = ${user.id} AND attempted_at >= date_trunc('day', NOW())`,
    db`SELECT 1 FROM clases_completadas WHERE user_id = ${user.id} AND clase_id = ${clase.id}`,
  ])
  const alreadyCompleted = already.length > 0

  // Tiempo de espera tras un suspenso (no aplica si ya estaba aprobada: es un repaso)
  const last = prev[0] as { attempted_at: string; passed: boolean } | undefined
  if (!alreadyCompleted && last && !last.passed) {
    const retryAt = new Date(last.attempted_at).getTime() + RETRY_MS[user.effectivePlan]
    if (retryAt > Date.now()) {
      return NextResponse.json(
        { error: 'Todavía no puedes reintentar este quiz', retryAt: new Date(retryAt).toISOString() },
        { status: 429 },
      )
    }
  }

  // Límite de clases por día del plan
  const maxDia = PLANES[user.effectivePlan].clasesDia
  if (!alreadyCompleted && maxDia !== null && (today[0].n as number) >= maxDia) {
    return NextResponse.json(
      { error: `Has hecho las ${maxDia} clases de hoy de tu plan. Vuelve mañana o mejora tu plan.`, limitReached: true },
      { status: 429 },
    )
  }

  await db`INSERT INTO clase_attempts (user_id, clase_id, score, passed)
           VALUES (${user.id}, ${clase.id}, ${result.score}, ${result.passed})`

  let xpAwarded = 0
  let badges: Awaited<ReturnType<typeof checkBadges>> = []
  if (result.passed && !alreadyCompleted) {
    const inserted = await db`
      INSERT INTO clases_completadas (user_id, clase_id, score) VALUES (${user.id}, ${clase.id}, ${result.score})
      ON CONFLICT (user_id, clase_id) DO NOTHING
      RETURNING clase_id`
    if (inserted.length > 0) {
      xpAwarded = clase.xp
      await addXP(user.id, clase.xp)
      await db`
        INSERT INTO daily_usage (user_id, date, clases_vistas) VALUES (${user.id}, CURRENT_DATE, 1)
        ON CONFLICT (user_id, date) DO UPDATE SET clases_vistas = daily_usage.clases_vistas + 1`
      badges = await checkBadges(user.id)
    }
  }

  const xpTotal = ((await db`SELECT xp FROM users WHERE id = ${user.id}`)[0]?.xp as number) ?? user.xp
  const retryMs = RETRY_MS[user.effectivePlan]
  return NextResponse.json({
    score: result.score,
    total: clase.quiz.length,
    passed: result.passed,
    alreadyCompleted,
    xpAwarded,
    xpBefore: xpTotal - xpAwarded,
    xpTotal,
    retryAt: result.passed ? null : new Date(Date.now() + retryMs).toISOString(),
    badges,
  })
}
