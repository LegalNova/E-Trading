// Prueba de los datos de empresa contra v2_dev: repaso del catálogo y ficha de unos símbolos
if (process.env.DB_SCHEMA !== 'v2_dev') throw new Error('solo v2_dev')
const { db } = await import('../src/server/db')
const f = await import('../src/server/market/fundamentals')
const budget = Number(process.argv[2] ?? 60_000)
// «force»: da por viejos todos los datos guardados (solo en v2_dev) para probar el repaso entero
if (process.argv[3] === 'force') await db.$executeRawUnsafe(`UPDATE "v2_dev"."Fundamentals" SET "updatedAt" = now() - interval '2 days'`)
if (budget > 0) console.log('repaso', await f.refreshFundamentals(budget))
for (const s of ['SAN.MC', 'AAPL', 'HSBA.L', '7203.T', 'TEF.MC', 'SPY', 'IWDA.AS', 'BTC-EUR', 'NOEXISTE']) {
  const t = Date.now()
  console.log(s, Date.now() - t, 'ms', JSON.stringify(await f.fundamentals(s)))
}
console.log('filas', await db.fundamentals.count(), 'con PER', await db.fundamentals.count({ where: { pe: { not: null } } }), 'con dividendo', await db.fundamentals.count({ where: { dividendYield: { not: null } } }))
await db.$disconnect()
