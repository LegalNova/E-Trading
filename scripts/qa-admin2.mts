// QA del área admin2 (solo v2_dev): da ADMIN a una cuenta de prueba o lee el estado de otra
if (process.env.DB_SCHEMA !== 'v2_dev') throw new Error('solo v2_dev')
const { db } = await import('../src/server/db')
const [cmd, email] = process.argv.slice(2)
if (!email?.startsWith('qa-admin-')) throw new Error('solo cuentas qa-admin-*')
if (cmd === 'promote') console.log((await db.user.update({ where: { email }, data: { role: 'ADMIN' } })).role)
if (cmd === 'state') {
  const u = await db.user.findUniqueOrThrow({ where: { email }, include: { game: true, subscription: true, sessions: { select: { id: true } } } })
  const gifts = await db.gift.findMany({ where: { redeemedById: u.id } })
  const notes = await db.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: 'desc' }, take: 3 })
  const audit = await db.auditLog.findMany({ where: { entityId: u.id }, orderBy: { createdAt: 'desc' }, take: 10 })
  console.log(JSON.stringify({ plan: u.plan, blockedAt: u.blockedAt, blockReason: u.blockReason, sessions: u.sessions.length, sub: u.subscription, lives: u.game?.lives, gems: u.game?.gems, streak: u.game?.streak, best: u.game?.bestStreak, last: u.game?.lastActiveDay, gifts: gifts.map(g => [g.code, g.tier, g.days, g.status, g.message]), notes: notes.map(n => [n.type, n.title, n.body, n.deepLink]), audit: audit.map(a => [a.actor, a.action, JSON.stringify(a.after)]) }, null, 1))
}
await db.$disconnect()
