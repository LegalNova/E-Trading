import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Tarea diaria (Vercel Cron, ver vercel.json). Vercel envía
// "Authorization: Bearer $CRON_SECRET" cuando CRON_SECRET está configurada.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const db = sql()
  const [trials, rachas, resets] = await db.transaction([
    // Pruebas Pro caducadas → plan Free
    db`UPDATE users SET plan = 'free' WHERE plan = 'pro_trial' AND trial_ends_at < NOW() RETURNING id`,
    // Rachas rotas: sin actividad ayer ni hoy
    db`UPDATE users SET racha = 0 WHERE racha > 0 AND (last_active IS NULL OR last_active < CURRENT_DATE - 1) RETURNING id`,
    // Enlaces de recuperación de contraseña caducados
    db`DELETE FROM password_resets WHERE expires_at < NOW() - INTERVAL '1 day' RETURNING id`,
  ])

  return NextResponse.json({ ok: true, trialsDowngraded: trials.length, rachasReset: rachas.length, resetsDeleted: resets.length })
}
