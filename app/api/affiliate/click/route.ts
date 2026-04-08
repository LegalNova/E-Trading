import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getServerSupabase } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { broker, source } = await req.json()
    if (!broker) return NextResponse.json({ ok: false }, { status: 400 })

    const session = await getServerSession(authOptions)
    const db      = getServerSupabase()

    await db.from('affiliate_clicks').insert({
      user_id: session?.user?.id ?? null,
      broker,
      source: source ?? 'unknown',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
