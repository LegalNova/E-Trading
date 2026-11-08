// QA del proyecto final y de Lumi con IA (solo v2_dev y cuentas qa-tesis-*):
//   pass-boss <email>  marca aprobado el reto final de «Invierte desde hoy» (s0boss)
//   premium <email>    le da Max 3 días (grantPlan)
//   state <email>      XP, contadores, tesis y eventos de la IA
if (process.env.DB_SCHEMA !== 'v2_dev') throw new Error('solo v2_dev')
const { db } = await import('../src/server/db')
const [cmd, email] = process.argv.slice(2)
if (!email?.startsWith('qa-tesis-')) throw new Error('solo cuentas qa-tesis-*')
const u = await db.user.findUniqueOrThrow({ where: { email } })
if (cmd === 'pass-boss') console.log(await db.lessonProgress.upsert({ where: { userId_lessonId: { userId: u.id, lessonId: 's0boss' } }, create: { userId: u.id, lessonId: 's0boss', stars: 2 }, update: { stars: 2 } }))
if (cmd === 'premium') {
  const { grantPlan } = await import('../src/server/game/grants')
  console.log(await db.$transaction(tx => grantPlan(tx, u.id, 'PREMIUM', 3, `qa-tesis-${u.id}`)))
}
if (cmd === 'state') {
  const g = await db.gameState.findUnique({ where: { userId: u.id } })
  const theses = await db.thesis.findMany({ where: { userId: u.id }, select: { symbol: true, status: true, score: true, shareCode: true } })
  const events = await db.event.findMany({ where: { userId: u.id, name: { in: ['tutor_ai', 'thesis_done'] } }, select: { name: true, props: true } })
  const msgs = await db.tutorMessage.findMany({ where: { userId: u.id, role: 'assistant' }, select: { engine: true } })
  console.log(JSON.stringify({ plan: u.plan, xp: g?.xp, counters: g?.counters, theses, events, engines: msgs.map(m => m.engine) }, null, 1))
}
if (cmd === 'ai-sim') {
  // Lumi con IA de principio a fin con una API simulada en local (ANTHROPIC_BASE_URL): nada sale a Anthropic
  const http = await import('node:http')
  let body: { system: { text: string }[]; messages: { role: string; content: string }[]; model: string; fallbacks?: string } | null = null
  const srv = http.createServer((req, res) => {
    let raw = ''
    req.on('data', d => (raw += d))
    req.on('end', () => {
      body = JSON.parse(raw)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ id: 'msg_sim', type: 'message', role: 'assistant', model: body!.model, content: [{ type: 'text', text: 'Respuesta simulada.\n\n**Siguiente paso:** haz la clase del stop loss.' }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1800, output_tokens: 320, cache_read_input_tokens: 900, cache_creation_input_tokens: 0 } }))
    })
  })
  await new Promise<void>(r => srv.listen(3199, '127.0.0.1', () => r()))
  process.env.ANTHROPIC_BASE_URL = 'http://127.0.0.1:3199'
  process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-' + 'q'.repeat(90)
  await db.journalEntry.create({ data: { userId: u.id, symbol: 'AAPL', side: 'BUY', tag: 'SOCIAL', reason: 'Lo vi en TikTok', priceAt: 180, remindAt: new Date(Date.now() + 86_400_000) } })
  const fresh = await db.user.findUniqueOrThrow({ where: { email } })
  const { ask } = await import('../src/server/tutor/tutor')
  const { withLocale } = await import('../src/server/locale')
  const out = await withLocale('ca', () => ask(fresh, '¿Qué opinas de Apple? ¿Diversifico bien?', 'PORTFOLIO'))
  console.log('RESPUESTA', out.engine, out.ai, out.sources.map(x => x.title), out.answer.slice(0, 40))
  const sys = body!.system[1].text
  console.log('MODEL', body!.model, 'fallbacks', body!.fallbacks, 'cache', JSON.stringify((body!.system[0] as unknown as { cache_control: unknown }).cache_control))
  console.log('CONTEXTO\n' + sys.slice(0, 1600))
  console.log('MENSAJES', body!.messages.length, body!.messages.map(m => m.role).join(','), '| última:', body!.messages.at(-1)!.content)
  const ev = await db.event.findFirst({ where: { userId: u.id, name: 'tutor_ai' }, orderBy: { createdAt: 'desc' } })
  console.log('EVENTO', JSON.stringify(ev?.props))
  srv.close()
}
await db.$disconnect()
