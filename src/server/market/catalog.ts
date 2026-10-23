// Catálogo real del simulador y fuente de cada activo, según la prueba de fuentes (docs/03-mercado.md §2).
// Se carga en la tabla Asset con `npm run db:seed`.
import type { ExchangeCode } from '@/shared/market-hours'

export type Provider = 'FINNHUB' | 'BINANCE' | 'YAHOO'

export interface CatalogAsset {
  symbol: string
  name: string
  type: 'STOCK' | 'ETF' | 'INDEX' | 'CRYPTO' | 'FX'
  exchange: string
  hours: ExchangeCode
  currency: 'EUR' | 'USD'
  provider: Provider
  providerSymbol: string
  delayedMinutes: number
  description: string
}

export const CATALOG: CatalogAsset[] = [
  { symbol: 'AAPL', name: 'Apple', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'AAPL', delayedMinutes: 0, description: 'Diseña iPhone, Mac y servicios como App Store o Apple Music.' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'MSFT', delayedMinutes: 0, description: 'Software, la nube Azure y Office.' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'NVDA', delayedMinutes: 0, description: 'Chips gráficos usados para videojuegos e inteligencia artificial.' },
  { symbol: 'TSLA', name: 'Tesla', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'TSLA', delayedMinutes: 0, description: 'Coches eléctricos, baterías y energía solar.' },
  { symbol: 'AMZN', name: 'Amazon', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'AMZN', delayedMinutes: 0, description: 'Comercio electrónico y la nube AWS.' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'GOOGL', delayedMinutes: 0, description: 'Google, YouTube y Android.' },
  { symbol: 'META', name: 'Meta', type: 'STOCK', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'META', delayedMinutes: 0, description: 'Facebook, Instagram y WhatsApp.' },
  { symbol: 'SAN', name: 'Banco Santander', type: 'STOCK', exchange: 'BME', hours: 'BME', currency: 'EUR', provider: 'YAHOO', providerSymbol: 'SAN.MC', delayedMinutes: 15, description: 'Uno de los mayores bancos de Europa.' },
  { symbol: 'ITX', name: 'Inditex', type: 'STOCK', exchange: 'BME', hours: 'BME', currency: 'EUR', provider: 'YAHOO', providerSymbol: 'ITX.MC', delayedMinutes: 15, description: 'Zara, Massimo Dutti, Pull&Bear y más.' },
  { symbol: 'BBVA', name: 'BBVA', type: 'STOCK', exchange: 'BME', hours: 'BME', currency: 'EUR', provider: 'YAHOO', providerSymbol: 'BBVA.MC', delayedMinutes: 15, description: 'Banco español con fuerte presencia en México.' },
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'ETF', exchange: 'NYSE', hours: 'NYSE', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'SPY', delayedMinutes: 0, description: 'Un fondo que reúne las 500 mayores empresas de EE. UU.' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'ETF', exchange: 'NASDAQ', hours: 'NASDAQ', currency: 'USD', provider: 'FINNHUB', providerSymbol: 'QQQ', delayedMinutes: 0, description: 'Las 100 mayores empresas no financieras del Nasdaq.' },
  { symbol: 'VWCE', name: 'Vanguard FTSE All-World', type: 'ETF', exchange: 'XETRA', hours: 'XETRA', currency: 'EUR', provider: 'YAHOO', providerSymbol: 'VWCE.DE', delayedMinutes: 15, description: 'Miles de empresas de todo el mundo en un solo fondo.' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', exchange: 'Cripto', hours: 'CRYPTO', currency: 'EUR', provider: 'BINANCE', providerSymbol: 'BTCEUR', delayedMinutes: 0, description: 'La primera criptomoneda. Muy volátil.' },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', exchange: 'Cripto', hours: 'CRYPTO', currency: 'EUR', provider: 'BINANCE', providerSymbol: 'ETHEUR', delayedMinutes: 0, description: 'Red para aplicaciones y contratos inteligentes.' },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', exchange: 'Cripto', hours: 'CRYPTO', currency: 'EUR', provider: 'BINANCE', providerSymbol: 'SOLEUR', delayedMinutes: 0, description: 'Cadena de bloques rápida y de bajo coste.' },
  { symbol: 'SPX', name: 'S&P 500', type: 'INDEX', exchange: 'Índice', hours: 'INDEX_US', currency: 'USD', provider: 'YAHOO', providerSymbol: '^GSPC', delayedMinutes: 0, description: 'Índice de las 500 mayores empresas de EE. UU.' },
  { symbol: 'IBEX', name: 'IBEX 35', type: 'INDEX', exchange: 'Índice', hours: 'INDEX_ES', currency: 'EUR', provider: 'YAHOO', providerSymbol: '^IBEX', delayedMinutes: 15, description: 'Las 35 empresas más negociadas de la bolsa española.' },
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'FX', exchange: 'Divisa', hours: 'FX', currency: 'USD', provider: 'YAHOO', providerSymbol: 'EURUSD=X', delayedMinutes: 0, description: 'Cuántos dólares vale un euro.' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'FX', exchange: 'Divisa', hours: 'FX', currency: 'USD', provider: 'YAHOO', providerSymbol: 'GBPUSD=X', delayedMinutes: 0, description: 'Cuántos dólares vale una libra.' },
]
