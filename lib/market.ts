// Helpers de mercado del servidor: cotizaciones + tipo de cambio a euros.
import { ASSET_BY_SYMBOL, Asset } from '@/data/assets'
import { getPricesForSymbols, FinnhubQuote } from '@/lib/finnhub'
import { eurPer, getFxTable, FxTable } from '@/lib/fx'

export interface PricedAsset {
  asset: Asset
  quote: FinnhubQuote
  /** euros por unidad de la moneda del activo */
  fx: number
  /** precio de una participación en euros */
  priceEur: number
}

/** Cotizaciones de varios símbolos + tabla FX, en una sola pasada */
export async function getPriced(symbols: string[]): Promise<{ priced: Record<string, PricedAsset>; fx: FxTable }> {
  const valid = Array.from(new Set(symbols.filter(s => ASSET_BY_SYMBOL[s])))
  const [quotes, fx] = await Promise.all([valid.length ? getPricesForSymbols(valid) : Promise.resolve([]), getFxTable()])
  const bySym: Record<string, FinnhubQuote> = {}
  for (const q of quotes) bySym[q.symbol] = q

  const priced: Record<string, PricedAsset> = {}
  for (const s of valid) {
    const asset = ASSET_BY_SYMBOL[s]
    const quote = bySym[s]
    if (!asset || !quote) continue
    const rate = eurPer(asset.currency, fx)
    priced[s] = { asset, quote, fx: rate, priceEur: quote.price * rate }
  }
  return { priced, fx }
}
