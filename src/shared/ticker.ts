/** Símbolo corto: SAN.MC → SAN, ^GSPC → GSPC, BTC-EUR → BTC, UNI7083-EUR → UNI, EURUSD=X → EUR/USD, GC=F → GC */
export function tickerOf(symbol: string, type: string) {
  if (type === 'CRYPTO') return symbol.replace(/-(EUR|USD)$/, '').replace(/(\D)\d{3,}$/, '$1')
  // Las divisas se leen como par: «EUR/USD», no «EURUSD» (auditoría APP-29)
  if (type === 'FX') return symbol.replace('=X', '').replace(/^([A-Z]{3})([A-Z]{3})$/, '$1/$2')
  if (type === 'COMMODITY') return symbol.replace('=F', '')
  if (type === 'INDEX') return symbol.replace(/^\^/, '').replace(/\..*$/, '')
  return symbol.replace(/\.[A-Z]+$/, '')
}
