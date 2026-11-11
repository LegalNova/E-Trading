import 'server-only'
// Datos de empresa de la ficha (capitalización, PER, dividendo, BPA, beta; en los ETF, la comisión anual).
// Reglas (como los precios, F1): datos reales de Yahoo o nada. Lo que no llega se guarda como null y no se enseña.
// - Se piden como mucho una vez al día por símbolo: al abrir la ficha (sin bloquearla) y en el repaso horario del cron,
//   que pone al día todo el catálogo de acciones en lotes de 50 (v7/quote, sin beta).
// - La ficha completa (quoteSummary, con beta y el perfil: sector, industria, descripción, empleados; en los fondos,
//   patrimonio y gestora; en las cripto, capitalización y monedas en circulación) se pide al abrirla si tiene más de un día.
import { after } from 'next/server'
import type { AssetTypeT, FundamentalsT } from '@/shared/contract'
import { db, DB_SCHEMA } from '../db'
import { yahooFundamentalsBatch, yahooSummary, type RawFundamentals, type RawProfile } from './providers'
import { fxRates, normCurrency, toEur, validSymbol } from './service'

const DAY_MS = 86_400_000
/** Un lote del cron vuelve a pedir lo que tenga más de esto (algo menos de un día, para que el repaso horario no se desplace) */
const BATCH_MAX_AGE_MS = 20 * 3_600_000
const SUMMARY_MAX_AGE_MS = DAY_MS
/** Esperar al proveedor en la primera visita, como mucho esto (la petición de la ficha va aparte y no la frena) */
const FIRST_WAIT_MS = 5_000
const WITH_DATA: AssetTypeT[] = ['STOCK', 'ETF', 'CRYPTO']
/** Versión de la ficha completa: las guardadas con otra (sin perfil) se vuelven a pedir */
const PROFILE_V = 2

interface Payload {
  currency?: string | null
  financialCurrency?: string | null
  ter?: number | null
  /** Rentabilidad por dividendo de los últimos 12 meses, en % */
  trailingYield?: number | null
  /** Última ficha completa (quoteSummary) */
  summaryAt?: string
  /** Último lote del cron (v7/quote) */
  batchAt?: string
  /** Perfil de la ficha completa (sector, industria, descripción…) y su versión */
  profile?: RawProfile
  v?: number
}

// ── Escritura ────────────────────────────────────────────
/** Guarda varios a la vez. `full` = trae la beta y la comisión (ficha completa); si no, se conservan las que hubiera. */
async function save(rows: RawFundamentals[], full: boolean) {
  if (!rows.length) return
  const now = new Date().toISOString()
  const data = rows.map(r => {
    const payload: Payload = { currency: r.currency, financialCurrency: r.financialCurrency, trailingYield: r.trailingYield, ...(full ? { ter: r.ter, summaryAt: now, profile: r.profile, v: PROFILE_V } : { batchAt: now }) }
    return { symbol: r.symbol, marketCap: r.marketCap, pe: r.pe, forwardPe: r.forwardPe, dividendYield: r.dividendYield, eps: r.eps, beta: r.beta, payload }
  })
  await db
    .$executeRawUnsafe(
      `INSERT INTO "${DB_SCHEMA}"."Fundamentals" ("symbol","marketCap","pe","forwardPe","dividendYield","eps","beta","payload","updatedAt")
       SELECT r.symbol, r."marketCap", r.pe, r."forwardPe", r."dividendYield", r.eps, r.beta, r.payload, now()
       FROM jsonb_to_recordset($1::jsonb) AS r(symbol text, "marketCap" float8, pe float8, "forwardPe" float8, "dividendYield" float8, eps float8, beta float8, payload jsonb)
       WHERE EXISTS (SELECT 1 FROM "${DB_SCHEMA}"."Asset" a WHERE a.symbol = r.symbol)
       ON CONFLICT ("symbol") DO UPDATE SET "marketCap" = EXCLUDED."marketCap", "pe" = EXCLUDED."pe", "forwardPe" = EXCLUDED."forwardPe",
         "dividendYield" = EXCLUDED."dividendYield", "eps" = EXCLUDED."eps",
         "beta" = ${full ? 'EXCLUDED."beta"' : '"Fundamentals"."beta"'},
         "payload" = COALESCE("Fundamentals"."payload", '{}'::jsonb) || EXCLUDED."payload", "updatedAt" = now()`,
      JSON.stringify(data),
    )
    .catch(e => console.error('fundamentals/save', e))
}

const empty = (symbol: string): RawFundamentals => ({ symbol, marketCap: null, pe: null, forwardPe: null, dividendYield: null, trailingYield: null, eps: null, beta: null, currency: null, financialCurrency: null, ter: null })

// ── Ficha completa de un símbolo ─────────────────────────
const inflight = new Map<string, Promise<void>>()
const failedAt = new Map<string, number>()
/** Freno por instancia: como mucho 40 fichas completas por minuto (alguien recorriendo el catálogo no dispara miles de llamadas) */
let windowStart = 0
let windowCount = 0

function refreshOne(symbol: string, type: AssetTypeT): Promise<void> {
  const running = inflight.get(symbol)
  if (running) return running
  if (Date.now() - (failedAt.get(symbol) ?? 0) < 5 * 60_000) return Promise.resolve()
  if (Date.now() - windowStart > 60_000) {
    windowStart = Date.now()
    windowCount = 0
  }
  if (++windowCount > 40) return Promise.resolve()
  const p = (async () => {
    const raw = await yahooSummary(symbol, type === 'ETF' ? 'ETF' : type === 'CRYPTO' ? 'CRYPTO' : 'STOCK')
    if (failedAt.size > 2000) failedAt.clear()
    // null = Yahoo no respondió (se reintenta en 5 min); una respuesta sin datos se guarda vacía (no se repite en un día)
    if (raw === null) failedAt.set(symbol, Date.now())
    else await save([raw], true)
  })()
    .catch(e => console.error('fundamentals/one', symbol, e))
    .finally(() => inflight.delete(symbol))
  inflight.set(symbol, p)
  return p
}

/** Reparto entre instancias: solo una pide la ficha de un símbolo viejo (la marca como recién pedida) */
async function claim(symbol: string): Promise<boolean> {
  try {
    const rows = await db.$queryRawUnsafe<{ symbol: string }[]>(
      `UPDATE "${DB_SCHEMA}"."Fundamentals" SET "payload" = COALESCE("payload", '{}'::jsonb) || jsonb_build_object('summaryAt', $2::text)
       WHERE "symbol" = $1 AND (("payload"->>'summaryAt') IS NULL OR ("payload"->>'summaryAt')::timestamptz < now() - interval '24 hours'
         OR ("payload"->>'v') IS DISTINCT FROM $3::text) RETURNING "symbol"`,
      symbol,
      // Si la petición falla, se podrá reintentar dentro de una hora
      new Date(Date.now() - 23 * 3_600_000).toISOString(),
      String(PROFILE_V),
    )
    return rows.length > 0
  } catch (e) {
    console.error('fundamentals/claim', e)
    return false
  }
}

const summaryAge = (p: Payload | null) => (p?.summaryAt && p.v === PROFILE_V ? Date.now() - new Date(p.summaryAt).getTime() : Infinity)

type Row = NonNullable<Awaited<ReturnType<typeof db.fundamentals.findUnique>>>

async function toApi(symbol: string, type: AssetTypeT, row: Row | null): Promise<FundamentalsT> {
  if (!row) return { symbol, available: false, marketCap: null, marketCapEur: null, currency: null, pe: null, dividendYield: null, eps: null, epsCurrency: null, beta: null, ter: null, updatedAt: null, profile: null }
  const p = (row.payload ?? {}) as Payload
  const cur = p.currency ? normCurrency(p.currency).cur : null
  // La capitalización llega en la moneda principal (libras, no peniques): sin dividir
  const eur = row.marketCap !== null && cur ? toEur(row.marketCap, cur, await fxRates()) : null
  const isFund = type === 'ETF'
  const isCrypto = type === 'CRYPTO'
  const pr = p.v === PROFILE_V ? p.profile : undefined
  const out: FundamentalsT = {
    symbol,
    available: false,
    marketCap: isFund ? null : row.marketCap,
    marketCapEur: isFund ? null : eur,
    currency: cur,
    pe: isFund || isCrypto ? null : row.pe,
    dividendYield: isCrypto ? null : row.dividendYield,
    eps: isFund || isCrypto ? null : row.eps,
    epsCurrency: p.financialCurrency ?? cur,
    beta: isCrypto ? null : row.beta,
    ter: isFund ? (p.ter ?? null) : null,
    updatedAt: row.updatedAt.toISOString(),
    profile: pr
      ? {
          sectorKey: pr.sectorKey ?? null, industryKey: pr.industryKey ?? null, industry: pr.industry ?? null, summary: pr.summary ?? null, employees: pr.employees ?? null,
          avgVolume: pr.avgVolume ?? null, totalAssets: pr.totalAssets ?? null, family: pr.family ?? null, category: pr.category ?? null, inception: pr.inception ?? null,
          circulating: pr.circulating ?? null, allTimeHigh: pr.allTimeHigh ?? null,
        }
      : null,
  }
  out.available = [out.marketCap, out.pe, out.dividendYield, out.eps, out.beta, out.ter].some(v => v !== null) || !!(pr && Object.values(pr).some(v => v !== null))
  return out
}

/** Datos de empresa para la ficha. Sin datos guardados espera al proveedor (poco); si son viejos, los renueva en segundo plano. */
export async function fundamentals(symbol: string): Promise<FundamentalsT | null> {
  if (!validSymbol(symbol)) return null
  const [asset, saved] = await Promise.all([db.asset.findUnique({ where: { symbol }, select: { type: true, enabled: true } }), db.fundamentals.findUnique({ where: { symbol } })])
  if (!asset?.enabled) return null
  if (!WITH_DATA.includes(asset.type)) return toApi(symbol, asset.type, null)
  let row = saved
  if (summaryAge(row?.payload as Payload | null) > SUMMARY_MAX_AGE_MS) {
    // Sin datos, o guardados antes de que hubiera perfil: se espera un poco al proveedor (solo una instancia lo pide)
    if (!row || ((row.payload as Payload | null)?.v !== PROFILE_V && (await claim(symbol)))) {
      await Promise.race([refreshOne(symbol, asset.type), new Promise(r => setTimeout(r, FIRST_WAIT_MS))])
      row = await db.fundamentals.findUnique({ where: { symbol } })
    } else {
      const run = async () => {
        if (await claim(symbol)) await refreshOne(symbol, asset.type)
      }
      try {
        after(run)
      } catch {
        void run()
      }
    }
  }
  return toApi(symbol, asset.type, row)
}

// ── Repaso del catálogo (cron) ───────────────────────────
/** Pone al día las acciones con datos de más de ~20 h (o sin datos), en lotes de 50, hasta agotar el tiempo.
 *  Primero lo que alguien tiene en cartera o sigue, después el IBEX 35 y los grandes índices, y luego el resto. */
let upToDateAt = 0

export async function refreshFundamentals(budgetMs = 8_000) {
  const t0 = Date.now()
  // Si el último repaso lo dejó todo al día, no se vuelve a mirar en media hora (el cron puede correr cada minuto)
  if (t0 - upToDateAt < 30 * 60_000) return { pending: 0, updated: 0, failed: 0, ms: 0, skipped: true }
  const old = new Date(Date.now() - BATCH_MAX_AGE_MS)
  const [stocks, hot] = await Promise.all([
    db.asset.findMany({ where: { enabled: true, type: 'STOCK' }, select: { symbol: true, indices: true } }),
    Promise.all([
      db.position.findMany({ select: { symbol: true }, distinct: ['symbol'] }),
      db.watchItem.findMany({ select: { symbol: true }, distinct: ['symbol'], take: 2000 }),
    ]).then(r => new Set(r.flat().map(x => x.symbol))),
  ])
  const fresh = new Set(
    (await db.fundamentals.findMany({ where: { updatedAt: { gte: old } }, select: { symbol: true } })).map(f => f.symbol),
  )
  const rank = (a: (typeof stocks)[number]) => (hot.has(a.symbol) ? 0 : a.indices.includes('IBEX 35') ? 1 : a.indices.some(i => BIG_INDICES.includes(i)) ? 2 : 3)
  const queue = stocks.filter(a => !fresh.has(a.symbol)).sort((a, b) => rank(a) - rank(b)).map(a => a.symbol)
  let updated = 0
  let failed = 0
  const CONC = 4
  for (let i = 0; i < queue.length && Date.now() - t0 < budgetMs; i += 50 * CONC) {
    const batches = [0, 1, 2, 3].map(k => queue.slice(i + k * 50, i + (k + 1) * 50)).filter(b => b.length)
    const res = await Promise.all(batches.map(b => yahooFundamentalsBatch(b).catch(() => null)))
    const rows: RawFundamentals[] = []
    res.forEach((r, k) => {
      if (!r) return void (failed += batches[k].length)
      const got = new Map(r.map(x => [x.symbol, x]))
      // Lo que Yahoo no devuelve se guarda vacío: no se vuelve a pedir hasta mañana
      for (const s of batches[k]) rows.push(got.get(s) ?? empty(s))
    })
    await save(rows, false)
    updated += rows.length
    // Si Yahoo no deja entrar, no se insiste en este repaso
    if (rows.length === 0) break
  }
  if (updated >= queue.length && !failed) upToDateAt = Date.now()
  return { pending: queue.length, updated, failed, ms: Date.now() - t0, skipped: false }
}

/** Índices de las grandes empresas de cada región (para las listas y el orden del repaso) */
export const BIG_INDICES = ['S&P 500', 'Euro Stoxx 50', 'IBEX 35', 'DAX', 'CAC 40', 'FTSE 100', 'FTSE MIB', 'AEX', 'SMI', 'Nikkei 225', 'Hang Seng']
