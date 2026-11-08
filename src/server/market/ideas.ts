import 'server-only'
// «Ideas para estudiar»: listas con un criterio transparente, calculadas con datos reales (precios guardados y Fundamentals).
// No son recomendaciones: la pantalla lo dice en cada lista. Aquí solo se aplica el criterio, sin juicios.
import type { IdeaItemT, IdeaListIdT, IdeaListT, IdeasT } from '@/shared/contract'
import { db } from '../db'
import { BIG_INDICES } from './fundamentals'
import { fxRates, loadAssetsLazy, normCurrency, toEur, toItem } from './service'

/** Ideas para alguien que empieza en España: empresas de EE. UU. y Europa (nombres que conoce y puede investigar) */
const IDEA_REGIONS = ['AMERICA', 'EUROPE']
const PER_LIST = 10
/** Los datos de empresa más viejos que esto no entran en las listas */
const MAX_FUND_AGE_MS = 7 * 86_400_000
/** Un precio de hace más de esto no cuenta como «la última sesión» */
const MAX_QUOTE_AGE_MS = 5 * 86_400_000
const CACHE_MS = 10 * 60_000
/** Mínimo de empresas de un sector para calcular su mediana */
const MIN_SECTOR = 8

/** Clase que enseña a analizar cada lista */
const LESSON: Record<IdeaListIdT, string> = {
  drops: 'u16l1', // Precio y valor no son lo mismo
  dividend: 'u17l4', // Rentabilidad por dividendo y payout
  lowPe: 'u17l1', // El PER
  ibex: 'u5l7', // La bolsa española: IBEX y mercado continuo
  etf: 'u10l2', // Qué es un ETF
}

/** ETF de índices amplios de nuestro catálogo: mundo, S&P 500, Europa y emergentes (primero los UCITS en euros) */
const STARTER_ETFS = ['IWDA.AS', 'VWCE.DE', 'IUSQ.DE', 'SXR8.DE', 'VUAA.DE', 'MEUD.PA', 'EXW1.DE', 'VFEM.AS', 'VT', 'VOO']

interface Pick { symbol: string; value: number | null; ref: number | null }
interface Selection { id: IdeaListIdT; asOf: Date | null; picks: Pick[] }

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
/** Una sola línea por empresa: fuera las otras clases de acción (GOOG y GOOGL) y la misma empresa en otra bolsa
 *  (mismo nombre, o misma primera palabra y casi la misma capitalización en euros). La lista llega de mayor a menor. */
const SUFFIX = /\s+(company|co|limited|ltd|inc|incorporated|corp|corporation|plc|sa|se|ag|nv|ab|asa|spa|group|holdings?)$/
function baseName(n: string) {
  let s = n.replace(/\s*\((class|clase|serie|series)[^)]*\)\s*$/i, '').replace(/[.,]/g, '').trim().toLowerCase()
  for (let prev = ''; prev !== s; ) {
    prev = s
    s = s.replace(SUFFIX, '')
  }
  return s
}
function dedupe<T>(xs: T[], nameOf: (x: T) => string, capOf: (x: T) => number | null = () => null): T[] {
  const kept: { name: string; first: string; cap: number | null }[] = []
  return xs.filter(x => {
    const name = baseName(nameOf(x))
    const first = name.split(/\s+/)[0]
    const cap = capOf(x)
    const twin = kept.some(k => k.name === name || (k.first === first && cap !== null && k.cap !== null && Math.abs(k.cap - cap) / Math.max(k.cap, cap) < 0.05))
    if (!twin) kept.push({ name, first, cap })
    return !twin
  })
}
const oldest = (ds: Date[]) => (ds.length ? new Date(Math.min(...ds.map(d => d.getTime()))) : null)

async function select(): Promise<Selection[]> {
  const now = Date.now()
  const [drops, funds, rates] = await Promise.all([
    // Las que más bajaron en su última sesión, entre las grandes empresas
    db.asset.findMany({
      where: { enabled: true, hidden: false, type: 'STOCK', region: { in: IDEA_REGIONS }, indices: { hasSome: BIG_INDICES }, quote: { changePct: { lt: 0 }, asOf: { gte: new Date(now - MAX_QUOTE_AGE_MS) } } },
      include: { quote: true },
      orderBy: { quote: { changePct: 'asc' } },
      take: PER_LIST * 2,
    }).then(xs => dedupe(xs, x => x.name).slice(0, PER_LIST)),
    db.fundamentals.findMany({ where: { updatedAt: { gte: new Date(now - MAX_FUND_AGE_MS) } } }),
    fxRates(),
  ])
  const stocks = new Map(
    (await db.asset.findMany({ where: { enabled: true, hidden: false, type: 'STOCK', region: { in: IDEA_REGIONS }, symbol: { in: funds.map(f => f.symbol) } }, select: { symbol: true, name: true, sector: true, indices: true } })).map(a => [a.symbol, a]),
  )
  const bySize = (a: { capEur: number | null }, b: { capEur: number | null }) => (b.capEur ?? -1) - (a.capEur ?? -1)
  const all = funds
    .filter(f => stocks.has(f.symbol))
    .map(f => {
      const cur = (f.payload as { currency?: string } | null)?.currency
      return { ...f, asset: stocks.get(f.symbol)!, capEur: f.marketCap !== null && cur ? toEur(f.marketCap, normCurrency(cur).cur, rates) : null }
    })
    .sort(bySize)
  // Se queda la línea más grande de cada empresa
  const rows = dedupe(all, r => r.asset.name, r => r.capEur)

  // Dividendo alto: rentabilidad > 4 % con dato real, la prevista y también la de los dividendos pagados en los últimos
  // 12 meses (si las dos no cuadran, el dato no es fiable y la empresa no entra); de mayor a menor tamaño
  const trailing = (r: (typeof rows)[number]) => (r.payload as { trailingYield?: number | null } | null)?.trailingYield ?? null
  const dividend = rows.filter(r => r.dividendYield !== null && r.dividendYield > 4 && (trailing(r) ?? 0) > 4 && r.capEur !== null).slice(0, PER_LIST)

  // PER bajo para su sector: PER > 0 y por debajo de la mediana de su sector; de mayor a menor tamaño
  const sectorPe = new Map<string, number[]>()
  for (const r of rows) if (r.pe !== null && r.pe > 0 && r.asset.sector) sectorPe.set(r.asset.sector, [...(sectorPe.get(r.asset.sector) ?? []), r.pe])
  const medians = new Map([...sectorPe].filter(([, v]) => v.length >= MIN_SECTOR).map(([k, v]) => [k, median(v)]))
  const lowPe = rows
    .filter(r => r.pe !== null && r.pe > 0 && r.capEur !== null && medians.has(r.asset.sector) && r.pe < medians.get(r.asset.sector)!)
    .sort(bySize)
    .slice(0, PER_LIST)

  // IBEX 35: las más grandes por capitalización (las que no tienen el dato, al final)
  const ibexAll = await db.asset.findMany({ where: { enabled: true, indices: { has: 'IBEX 35' } }, select: { symbol: true } })
  const capOf = new Map(all.map(r => [r.symbol, r]))
  const ibex = ibexAll
    .map(a => capOf.get(a.symbol) ?? { symbol: a.symbol, capEur: null, updatedAt: null })
    .sort(bySize)
    .slice(0, PER_LIST)

  return [
    { id: 'drops', asOf: oldest(drops.map(d => d.quote!.asOf)), picks: drops.map(d => ({ symbol: d.symbol, value: d.quote!.changePct, ref: null })) },
    { id: 'dividend', asOf: oldest(dividend.map(r => r.updatedAt)), picks: dividend.map(r => ({ symbol: r.symbol, value: r.dividendYield, ref: null })) },
    { id: 'lowPe', asOf: oldest(lowPe.map(r => r.updatedAt)), picks: lowPe.map(r => ({ symbol: r.symbol, value: r.pe, ref: medians.get(r.asset.sector) ?? null })) },
    { id: 'ibex', asOf: oldest(ibex.flatMap(r => (r.updatedAt ? [r.updatedAt] : []))), picks: ibex.map(r => ({ symbol: r.symbol, value: r.capEur, ref: null })) },
    { id: 'etf', asOf: null, picks: STARTER_ETFS.map(symbol => ({ symbol, value: null, ref: null })) },
  ]
}

let cache: { at: number; data: Selection[] } | null = null
let running: Promise<Selection[]> | null = null

async function selection() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data
  running ??= select()
    .then(data => ((cache = { at: Date.now(), data }), data))
    .finally(() => (running = null))
  return running
}

/** Las cinco listas, con los precios guardados de cada activo (se ponen al día en segundo plano, sin esperar) */
export async function ideas(): Promise<IdeasT> {
  const sel = await selection()
  const rows = new Map((await loadAssetsLazy([...new Set(sel.flatMap(s => s.picks.map(p => p.symbol)))])).map(a => [a.symbol, a]))
  const lists: IdeaListT[] = sel.map(s => {
    const items: IdeaItemT[] = []
    for (const p of s.picks) {
      const row = rows.get(p.symbol)
      const asset = row && toItem(row)
      if (asset) items.push({ asset, value: p.value, ref: p.ref })
    }
    // Los ETF no tienen dato de criterio: su fecha es la del precio más viejo que se enseña
    const asOf = s.asOf ?? oldest(items.map(i => new Date(i.asset.asOf)))
    return { id: s.id, asOf: asOf?.toISOString() ?? null, lessonId: LESSON[s.id], items }
  })
  return { lists }
}
