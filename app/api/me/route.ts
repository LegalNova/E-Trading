import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sql, trialDaysLeft } from '@/lib/db'
import { getXPProgress } from '@/lib/xp'
import { CATALOGO, planIncludes } from '@/lib/learning'
import { getRanking, weekEndsAt, zoneOf, getLigaNombre } from '@/lib/liga'
import { PLANES } from '@/lib/plans'

export const dynamic = 'force-dynamic'

// GET /api/me → perfil, nivel, objetivos de hoy, siguiente clase y liga
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const db = sql()
  const [counts, done, ranking] = await Promise.all([
    db`
      SELECT
        (SELECT count(*) FROM clases_completadas WHERE user_id = ${user.id}) AS clases,
        (SELECT count(*) FROM reto_progress WHERE user_id = ${user.id} AND completed) AS retos,
        (SELECT count(*) FROM badges WHERE user_id = ${user.id}) AS insignias,
        (SELECT count(*) FROM trades WHERE user_id = ${user.id}) AS trades,
        (SELECT count(*) FROM trades WHERE user_id = ${user.id} AND executed_at >= date_trunc('day', NOW())) AS trades_hoy,
        (SELECT count(*) FROM clase_attempts WHERE user_id = ${user.id} AND passed AND attempted_at >= date_trunc('day', NOW())) AS clases_hoy,
        (SELECT coalesce(max(ia_messages), 0) FROM daily_usage WHERE user_id = ${user.id} AND date = CURRENT_DATE) AS ia_hoy,
        (SELECT count(*) FROM trades WHERE user_id = ${user.id} AND type = 'sell' AND pnl_eur < 0
           AND executed_at >= NOW() - INTERVAL '14 days') AS ventas_perdida`,
    db`SELECT clase_id FROM clases_completadas WHERE user_id = ${user.id}`,
    getRanking(user.id),
  ])
  const c = counts[0] as Record<string, number>
  const completed = new Set(done.map(r => r.clase_id as string))

  const next = CATALOGO.find(k => k.disponible && !completed.has(k.id) && planIncludes(user.effectivePlan, k.plan))
  const xp = getXPProgress(user.xp)
  const me = ranking.find(e => e.isMe)
  const plan = PLANES[user.effectivePlan]

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name ?? user.email.split('@')[0],
      email: user.email,
      plan: user.effectivePlan,
      planLabel: plan.label,
      isTrial: user.plan === 'pro_trial' && user.effectivePlan === 'pro',
      trialDaysLeft: trialDaysLeft(user),
      xp: user.xp,
      racha: user.racha,
      onboarded: !!user.onboarding,
      createdAt: user.created_at,
    },
    level: {
      n: xp.nivel.nivel,
      nombre: xp.nivel.nombre,
      xpMin: xp.nivel.xpMin,
      xpMax: xp.nivel.xpMax,
      progress: xp.progreso,
      toNext: xp.xpParaSiguiente,
    },
    counts: { clases: c.clases, retos: c.retos, insignias: c.insignias, trades: c.trades },
    limits: { clasesDia: plan.clasesDia, opsSemana: plan.opsSemana, iaMsgsDia: plan.iaMsgsDia },
    daily: [
      { id: 'clase', titulo: 'Completa 1 clase', hecho: Math.min(c.clases_hoy, 1), meta: 1 },
      { id: 'operaciones', titulo: 'Haz 2 operaciones', hecho: Math.min(c.trades_hoy, 2), meta: 2 },
      { id: 'ia', titulo: 'Pregunta a la Profesora IA', hecho: Math.min(c.ia_hoy, 1), meta: 1 },
    ],
    nextClase: next ? { id: next.id, numero: next.numero, titulo: next.titulo, duracion: next.duracion, xp: next.xp, modulo: next.modulo } : null,
    alerta: c.ventas_perdida >= 2
      ? { tipo: 'aversion-perdida', texto: `Has vendido ${c.ventas_perdida} veces con pérdidas en dos semanas: puede ser miedo a perder.` }
      : null,
    liga: me ? {
      nombre: getLigaNombre(me.ligaNivel),
      pos: me.pos,
      total: ranking.length,
      xp: me.xp,
      zone: zoneOf(me.pos),
      endsAt: weekEndsAt().toISOString(),
    } : null,
  })
}
