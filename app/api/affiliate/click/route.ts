import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { broker, source } = await req.json()
    if (!broker) return NextResponse.json({ ok: false }, { status: 400 })

    const session = await getServerSession(authOptions)
    await sql()`
      INSERT INTO affiliate_clicks (user_id, broker, source)
      VALUES (${session?.user?.id ?? null}, ${broker}, ${source ?? 'unknown'})`

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
