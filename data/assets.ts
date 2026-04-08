export type AssetCategory = 'acciones-us' | 'acciones-eu' | 'cripto' | 'etfs' | 'forex' | 'materias' | 'indices'

export interface Asset {
  symbol: string
  name: string
  category: AssetCategory
  finnhubSymbol: string
  basePrice: number
  currency: string
  flag?: string
}

// ─── ACCIONES EEUU (50) ───────────────────────────────────────────────────
const ACCIONES_US: Asset[] = [
  { symbol: 'AAPL', name: 'Apple', category: 'acciones-us', finnhubSymbol: 'AAPL', basePrice: 185, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'acciones-us', finnhubSymbol: 'MSFT', basePrice: 415, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'acciones-us', finnhubSymbol: 'NVDA', basePrice: 875, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'TSLA', name: 'Tesla', category: 'acciones-us', finnhubSymbol: 'TSLA', basePrice: 175, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'AMZN', name: 'Amazon', category: 'acciones-us', finnhubSymbol: 'AMZN', basePrice: 185, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet', category: 'acciones-us', finnhubSymbol: 'GOOGL', basePrice: 165, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'META', name: 'Meta', category: 'acciones-us', finnhubSymbol: 'META', basePrice: 510, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'NFLX', name: 'Netflix', category: 'acciones-us', finnhubSymbol: 'NFLX', basePrice: 630, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'AMD', name: 'AMD', category: 'acciones-us', finnhubSymbol: 'AMD', basePrice: 165, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'INTC', name: 'Intel', category: 'acciones-us', finnhubSymbol: 'INTC', basePrice: 30, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'CRM', name: 'Salesforce', category: 'acciones-us', finnhubSymbol: 'CRM', basePrice: 295, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'ORCL', name: 'Oracle', category: 'acciones-us', finnhubSymbol: 'ORCL', basePrice: 125, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'BRK.B', name: 'Berkshire', category: 'acciones-us', finnhubSymbol: 'BRK.B', basePrice: 365, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'JPM', name: 'JPMorgan', category: 'acciones-us', finnhubSymbol: 'JPM', basePrice: 195, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'GS', name: 'Goldman Sachs', category: 'acciones-us', finnhubSymbol: 'GS', basePrice: 455, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'acciones-us', finnhubSymbol: 'JNJ', basePrice: 155, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'PFE', name: 'Pfizer', category: 'acciones-us', finnhubSymbol: 'PFE', basePrice: 28, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'V', name: 'Visa', category: 'acciones-us', finnhubSymbol: 'V', basePrice: 275, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'MA', name: 'Mastercard', category: 'acciones-us', finnhubSymbol: 'MA', basePrice: 475, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'KO', name: 'Coca-Cola', category: 'acciones-us', finnhubSymbol: 'KO', basePrice: 62, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'MCD', name: "McDonald's", category: 'acciones-us', finnhubSymbol: 'MCD', basePrice: 295, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'NKE', name: 'Nike', category: 'acciones-us', finnhubSymbol: 'NKE', basePrice: 95, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'DIS', name: 'Disney', category: 'acciones-us', finnhubSymbol: 'DIS', basePrice: 110, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'SPOT', name: 'Spotify', category: 'acciones-us', finnhubSymbol: 'SPOT', basePrice: 290, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'ABNB', name: 'Airbnb', category: 'acciones-us', finnhubSymbol: 'ABNB', basePrice: 155, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'UBER', name: 'Uber', category: 'acciones-us', finnhubSymbol: 'UBER', basePrice: 75, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'LYFT', name: 'Lyft', category: 'acciones-us', finnhubSymbol: 'LYFT', basePrice: 18, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'PLTR', name: 'Palantir', category: 'acciones-us', finnhubSymbol: 'PLTR', basePrice: 22, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'CRWD', name: 'CrowdStrike', category: 'acciones-us', finnhubSymbol: 'CRWD', basePrice: 320, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'SNOW', name: 'Snowflake', category: 'acciones-us', finnhubSymbol: 'SNOW', basePrice: 155, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'DDOG', name: 'Datadog', category: 'acciones-us', finnhubSymbol: 'DDOG', basePrice: 130, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'NET', name: 'Cloudflare', category: 'acciones-us', finnhubSymbol: 'NET', basePrice: 95, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'SQ', name: 'Block', category: 'acciones-us', finnhubSymbol: 'SQ', basePrice: 75, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'PYPL', name: 'PayPal', category: 'acciones-us', finnhubSymbol: 'PYPL', basePrice: 65, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'SHOP', name: 'Shopify', category: 'acciones-us', finnhubSymbol: 'SHOP', basePrice: 70, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'ZM', name: 'Zoom', category: 'acciones-us', finnhubSymbol: 'ZM', basePrice: 62, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'MRNA', name: 'Moderna', category: 'acciones-us', finnhubSymbol: 'MRNA', basePrice: 135, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'BNTX', name: 'BioNTech', category: 'acciones-us', finnhubSymbol: 'BNTX', basePrice: 90, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'XOM', name: 'ExxonMobil', category: 'acciones-us', finnhubSymbol: 'XOM', basePrice: 115, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'CVX', name: 'Chevron', category: 'acciones-us', finnhubSymbol: 'CVX', basePrice: 155, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'BA', name: 'Boeing', category: 'acciones-us', finnhubSymbol: 'BA', basePrice: 195, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'LMT', name: 'Lockheed Martin', category: 'acciones-us', finnhubSymbol: 'LMT', basePrice: 465, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'CAT', name: 'Caterpillar', category: 'acciones-us', finnhubSymbol: 'CAT', basePrice: 355, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'MMM', name: '3M', category: 'acciones-us', finnhubSymbol: 'MMM', basePrice: 95, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'F', name: 'Ford', category: 'acciones-us', finnhubSymbol: 'F', basePrice: 12, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'GM', name: 'General Motors', category: 'acciones-us', finnhubSymbol: 'GM', basePrice: 45, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'STLA', name: 'Stellantis', category: 'acciones-us', finnhubSymbol: 'STLA', basePrice: 22, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'RIVN', name: 'Rivian', category: 'acciones-us', finnhubSymbol: 'RIVN', basePrice: 12, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'LCID', name: 'Lucid', category: 'acciones-us', finnhubSymbol: 'LCID', basePrice: 3, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'WMT', name: 'Walmart', category: 'acciones-us', finnhubSymbol: 'WMT', basePrice: 60, currency: 'USD', flag: '🇺🇸' },
]

// ─── ACCIONES EUROPEAS (20) ───────────────────────────────────────────────
const ACCIONES_EU: Asset[] = [
  { symbol: 'ITX', name: 'Inditex', category: 'acciones-eu', finnhubSymbol: 'BME:ITX', basePrice: 48, currency: 'EUR', flag: '🇪🇸' },
  { symbol: 'MC', name: 'LVMH', category: 'acciones-eu', finnhubSymbol: 'EPA:MC', basePrice: 785, currency: 'EUR', flag: '🇫🇷' },
  { symbol: 'RMS', name: 'Hermès', category: 'acciones-eu', finnhubSymbol: 'EPA:RMS', basePrice: 2100, currency: 'EUR', flag: '🇫🇷' },
  { symbol: 'RACE', name: 'Ferrari', category: 'acciones-eu', finnhubSymbol: 'NYSE:RACE', basePrice: 395, currency: 'EUR', flag: '🇮🇹' },
  { symbol: 'ASML', name: 'ASML', category: 'acciones-eu', finnhubSymbol: 'NASDAQ:ASML', basePrice: 940, currency: 'EUR', flag: '🇳🇱' },
  { symbol: 'SAP', name: 'SAP', category: 'acciones-eu', finnhubSymbol: 'NYSE:SAP', basePrice: 195, currency: 'EUR', flag: '🇩🇪' },
  { symbol: 'SIE', name: 'Siemens', category: 'acciones-eu', finnhubSymbol: 'ETR:SIE', basePrice: 175, currency: 'EUR', flag: '🇩🇪' },
  { symbol: 'VOW3', name: 'Volkswagen', category: 'acciones-eu', finnhubSymbol: 'ETR:VOW3', basePrice: 115, currency: 'EUR', flag: '🇩🇪' },
  { symbol: 'BMW', name: 'BMW', category: 'acciones-eu', finnhubSymbol: 'ETR:BMW', basePrice: 92, currency: 'EUR', flag: '🇩🇪' },
  { symbol: 'NESN', name: 'Nestlé', category: 'acciones-eu', finnhubSymbol: 'VTX:NESN', basePrice: 92, currency: 'CHF', flag: '🇨🇭' },
  { symbol: 'ROG', name: 'Roche', category: 'acciones-eu', finnhubSymbol: 'VTX:ROG', basePrice: 235, currency: 'CHF', flag: '🇨🇭' },
  { symbol: 'NOVN', name: 'Novartis', category: 'acciones-eu', finnhubSymbol: 'VTX:NOVN', basePrice: 95, currency: 'CHF', flag: '🇨🇭' },
  { symbol: 'HSBA', name: 'HSBC', category: 'acciones-eu', finnhubSymbol: 'LON:HSBA', basePrice: 6.8, currency: 'GBP', flag: '🇬🇧' },
  { symbol: 'SAN', name: 'Santander', category: 'acciones-eu', finnhubSymbol: 'BME:SAN', basePrice: 4.2, currency: 'EUR', flag: '🇪🇸' },
  { symbol: 'BBVA', name: 'BBVA', category: 'acciones-eu', finnhubSymbol: 'BME:BBVA', basePrice: 9.8, currency: 'EUR', flag: '🇪🇸' },
  { symbol: 'BNP', name: 'BNP Paribas', category: 'acciones-eu', finnhubSymbol: 'EPA:BNP', basePrice: 58, currency: 'EUR', flag: '🇫🇷' },
  { symbol: 'TTE', name: 'TotalEnergies', category: 'acciones-eu', finnhubSymbol: 'EPA:TTE', basePrice: 60, currency: 'EUR', flag: '🇫🇷' },
  { symbol: 'SHEL', name: 'Shell', category: 'acciones-eu', finnhubSymbol: 'LON:SHEL', basePrice: 28, currency: 'GBP', flag: '🇬🇧' },
  { symbol: 'AZN', name: 'AstraZeneca', category: 'acciones-eu', finnhubSymbol: 'LON:AZN', basePrice: 125, currency: 'GBP', flag: '🇬🇧' },
  { symbol: 'AIR', name: 'Airbus', category: 'acciones-eu', finnhubSymbol: 'EPA:AIR', basePrice: 165, currency: 'EUR', flag: '🇫🇷' },
]

// ─── CRIPTOMONEDAS (30) ──────────────────────────────────────────────────
const CRIPTO: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', category: 'cripto', finnhubSymbol: 'BINANCE:BTCUSDT', basePrice: 67000, currency: 'USD' },
  { symbol: 'ETH', name: 'Ethereum', category: 'cripto', finnhubSymbol: 'BINANCE:ETHUSDT', basePrice: 3500, currency: 'USD' },
  { symbol: 'SOL', name: 'Solana', category: 'cripto', finnhubSymbol: 'BINANCE:SOLUSDT', basePrice: 175, currency: 'USD' },
  { symbol: 'BNB', name: 'BNB Chain', category: 'cripto', finnhubSymbol: 'BINANCE:BNBUSDT', basePrice: 580, currency: 'USD' },
  { symbol: 'XRP', name: 'XRP', category: 'cripto', finnhubSymbol: 'BINANCE:XRPUSDT', basePrice: 0.55, currency: 'USD' },
  { symbol: 'ADA', name: 'Cardano', category: 'cripto', finnhubSymbol: 'BINANCE:ADAUSDT', basePrice: 0.45, currency: 'USD' },
  { symbol: 'AVAX', name: 'Avalanche', category: 'cripto', finnhubSymbol: 'BINANCE:AVAXUSDT', basePrice: 38, currency: 'USD' },
  { symbol: 'DOT', name: 'Polkadot', category: 'cripto', finnhubSymbol: 'BINANCE:DOTUSDT', basePrice: 7.5, currency: 'USD' },
  { symbol: 'LINK', name: 'Chainlink', category: 'cripto', finnhubSymbol: 'BINANCE:LINKUSDT', basePrice: 18, currency: 'USD' },
  { symbol: 'UNI', name: 'Uniswap', category: 'cripto', finnhubSymbol: 'BINANCE:UNIUSDT', basePrice: 9.5, currency: 'USD' },
  { symbol: 'DOGE', name: 'Dogecoin', category: 'cripto', finnhubSymbol: 'BINANCE:DOGEUSDT', basePrice: 0.15, currency: 'USD' },
  { symbol: 'SHIB', name: 'Shiba Inu', category: 'cripto', finnhubSymbol: 'BINANCE:SHIBUSDT', basePrice: 0.000025, currency: 'USD' },
  { symbol: 'MATIC', name: 'Polygon', category: 'cripto', finnhubSymbol: 'BINANCE:MATICUSDT', basePrice: 0.85, currency: 'USD' },
  { symbol: 'LTC', name: 'Litecoin', category: 'cripto', finnhubSymbol: 'BINANCE:LTCUSDT', basePrice: 85, currency: 'USD' },
  { symbol: 'ATOM', name: 'Cosmos', category: 'cripto', finnhubSymbol: 'BINANCE:ATOMUSDT', basePrice: 8.5, currency: 'USD' },
  { symbol: 'ALGO', name: 'Algorand', category: 'cripto', finnhubSymbol: 'BINANCE:ALGOUSDT', basePrice: 0.18, currency: 'USD' },
  { symbol: 'XLM', name: 'Stellar', category: 'cripto', finnhubSymbol: 'BINANCE:XLMUSDT', basePrice: 0.12, currency: 'USD' },
  { symbol: 'VET', name: 'VeChain', category: 'cripto', finnhubSymbol: 'BINANCE:VETUSDT', basePrice: 0.035, currency: 'USD' },
  { symbol: 'TRX', name: 'Tron', category: 'cripto', finnhubSymbol: 'BINANCE:TRXUSDT', basePrice: 0.12, currency: 'USD' },
  { symbol: 'FIL', name: 'Filecoin', category: 'cripto', finnhubSymbol: 'BINANCE:FILUSDT', basePrice: 5.5, currency: 'USD' },
  { symbol: 'THETA', name: 'Theta', category: 'cripto', finnhubSymbol: 'BINANCE:THETAUSDT', basePrice: 1.8, currency: 'USD' },
  { symbol: 'HBAR', name: 'Hedera', category: 'cripto', finnhubSymbol: 'BINANCE:HBARUSDT', basePrice: 0.085, currency: 'USD' },
  { symbol: 'FTM', name: 'Fantom', category: 'cripto', finnhubSymbol: 'BINANCE:FTMUSDT', basePrice: 0.65, currency: 'USD' },
  { symbol: 'NEAR', name: 'Near', category: 'cripto', finnhubSymbol: 'BINANCE:NEARUSDT', basePrice: 5.8, currency: 'USD' },
  { symbol: 'APT', name: 'Aptos', category: 'cripto', finnhubSymbol: 'BINANCE:APTUSDT', basePrice: 9, currency: 'USD' },
  { symbol: 'SUI', name: 'Sui', category: 'cripto', finnhubSymbol: 'BINANCE:SUIUSDT', basePrice: 1.2, currency: 'USD' },
  { symbol: 'ARB', name: 'Arbitrum', category: 'cripto', finnhubSymbol: 'BINANCE:ARBUSDT', basePrice: 1.1, currency: 'USD' },
  { symbol: 'OP', name: 'Optimism', category: 'cripto', finnhubSymbol: 'BINANCE:OPUSDT', basePrice: 2.4, currency: 'USD' },
  { symbol: 'STX', name: 'Stacks', category: 'cripto', finnhubSymbol: 'BINANCE:STXUSDT', basePrice: 1.8, currency: 'USD' },
  { symbol: 'INJ', name: 'Injective', category: 'cripto', finnhubSymbol: 'BINANCE:INJUSDT', basePrice: 28, currency: 'USD' },
]

// ─── ETFs (15) ────────────────────────────────────────────────────────────
const ETFS: Asset[] = [
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'etfs', finnhubSymbol: 'SPY', basePrice: 520, currency: 'USD' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'etfs', finnhubSymbol: 'QQQ', basePrice: 445, currency: 'USD' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', category: 'etfs', finnhubSymbol: 'IWM', basePrice: 205, currency: 'USD' },
  { symbol: 'VTI', name: 'Total Market ETF', category: 'etfs', finnhubSymbol: 'VTI', basePrice: 240, currency: 'USD' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', category: 'etfs', finnhubSymbol: 'VOO', basePrice: 475, currency: 'USD' },
  { symbol: 'GLD', name: 'Gold ETF', category: 'etfs', finnhubSymbol: 'GLD', basePrice: 220, currency: 'USD' },
  { symbol: 'SLV', name: 'Silver ETF', category: 'etfs', finnhubSymbol: 'SLV', basePrice: 25, currency: 'USD' },
  { symbol: 'IAU', name: 'iShares Gold', category: 'etfs', finnhubSymbol: 'IAU', basePrice: 40, currency: 'USD' },
  { symbol: 'USO', name: 'Oil ETF', category: 'etfs', finnhubSymbol: 'USO', basePrice: 75, currency: 'USD' },
  { symbol: 'TLT', name: 'Treasury Bond 20Y', category: 'etfs', finnhubSymbol: 'TLT', basePrice: 95, currency: 'USD' },
  { symbol: 'HYG', name: 'High Yield Bond', category: 'etfs', finnhubSymbol: 'HYG', basePrice: 78, currency: 'USD' },
  { symbol: 'EEM', name: 'Emerging Markets', category: 'etfs', finnhubSymbol: 'EEM', basePrice: 42, currency: 'USD' },
  { symbol: 'VNQ', name: 'Real Estate ETF', category: 'etfs', finnhubSymbol: 'VNQ', basePrice: 88, currency: 'USD' },
  { symbol: 'XLK', name: 'Tech Sector ETF', category: 'etfs', finnhubSymbol: 'XLK', basePrice: 215, currency: 'USD' },
  { symbol: 'XLF', name: 'Financial ETF', category: 'etfs', finnhubSymbol: 'XLF', basePrice: 42, currency: 'USD' },
]

// ─── FOREX (28 pares) ─────────────────────────────────────────────────────
const FOREX: Asset[] = [
  { symbol: 'EURUSD', name: 'EUR / USD', category: 'forex', finnhubSymbol: 'OANDA:EUR_USD', basePrice: 1.085, currency: 'USD' },
  { symbol: 'GBPUSD', name: 'GBP / USD', category: 'forex', finnhubSymbol: 'OANDA:GBP_USD', basePrice: 1.265, currency: 'USD' },
  { symbol: 'USDJPY', name: 'USD / JPY', category: 'forex', finnhubSymbol: 'OANDA:USD_JPY', basePrice: 151.5, currency: 'JPY' },
  { symbol: 'USDCHF', name: 'USD / CHF', category: 'forex', finnhubSymbol: 'OANDA:USD_CHF', basePrice: 0.895, currency: 'CHF' },
  { symbol: 'AUDUSD', name: 'AUD / USD', category: 'forex', finnhubSymbol: 'OANDA:AUD_USD', basePrice: 0.655, currency: 'USD' },
  { symbol: 'USDCAD', name: 'USD / CAD', category: 'forex', finnhubSymbol: 'OANDA:USD_CAD', basePrice: 1.355, currency: 'CAD' },
  { symbol: 'NZDUSD', name: 'NZD / USD', category: 'forex', finnhubSymbol: 'OANDA:NZD_USD', basePrice: 0.605, currency: 'USD' },
  { symbol: 'EURGBP', name: 'EUR / GBP', category: 'forex', finnhubSymbol: 'OANDA:EUR_GBP', basePrice: 0.858, currency: 'GBP' },
  { symbol: 'EURJPY', name: 'EUR / JPY', category: 'forex', finnhubSymbol: 'OANDA:EUR_JPY', basePrice: 164.4, currency: 'JPY' },
  { symbol: 'GBPJPY', name: 'GBP / JPY', category: 'forex', finnhubSymbol: 'OANDA:GBP_JPY', basePrice: 191.5, currency: 'JPY' },
  { symbol: 'EURCHF', name: 'EUR / CHF', category: 'forex', finnhubSymbol: 'OANDA:EUR_CHF', basePrice: 0.971, currency: 'CHF' },
  { symbol: 'AUDJPY', name: 'AUD / JPY', category: 'forex', finnhubSymbol: 'OANDA:AUD_JPY', basePrice: 99.2, currency: 'JPY' },
  { symbol: 'CHFJPY', name: 'CHF / JPY', category: 'forex', finnhubSymbol: 'OANDA:CHF_JPY', basePrice: 169.3, currency: 'JPY' },
  { symbol: 'EURAUD', name: 'EUR / AUD', category: 'forex', finnhubSymbol: 'OANDA:EUR_AUD', basePrice: 1.655, currency: 'AUD' },
  { symbol: 'EURCAD', name: 'EUR / CAD', category: 'forex', finnhubSymbol: 'OANDA:EUR_CAD', basePrice: 1.469, currency: 'CAD' },
  { symbol: 'GBPAUD', name: 'GBP / AUD', category: 'forex', finnhubSymbol: 'OANDA:GBP_AUD', basePrice: 1.930, currency: 'AUD' },
  { symbol: 'GBPCAD', name: 'GBP / CAD', category: 'forex', finnhubSymbol: 'OANDA:GBP_CAD', basePrice: 1.714, currency: 'CAD' },
  { symbol: 'AUDCAD', name: 'AUD / CAD', category: 'forex', finnhubSymbol: 'OANDA:AUD_CAD', basePrice: 0.887, currency: 'CAD' },
  { symbol: 'NZDJPY', name: 'NZD / JPY', category: 'forex', finnhubSymbol: 'OANDA:NZD_JPY', basePrice: 91.6, currency: 'JPY' },
  { symbol: 'EURNZD', name: 'EUR / NZD', category: 'forex', finnhubSymbol: 'OANDA:EUR_NZD', basePrice: 1.793, currency: 'NZD' },
  { symbol: 'USDMXN', name: 'USD / MXN', category: 'forex', finnhubSymbol: 'OANDA:USD_MXN', basePrice: 17.05, currency: 'MXN' },
  { symbol: 'USDBRL', name: 'USD / BRL', category: 'forex', finnhubSymbol: 'OANDA:USD_BRL', basePrice: 4.97, currency: 'BRL' },
  { symbol: 'USDZAR', name: 'USD / ZAR', category: 'forex', finnhubSymbol: 'OANDA:USD_ZAR', basePrice: 18.65, currency: 'ZAR' },
  { symbol: 'USDSGD', name: 'USD / SGD', category: 'forex', finnhubSymbol: 'OANDA:USD_SGD', basePrice: 1.345, currency: 'SGD' },
  { symbol: 'USDHKD', name: 'USD / HKD', category: 'forex', finnhubSymbol: 'OANDA:USD_HKD', basePrice: 7.82, currency: 'HKD' },
  { symbol: 'USDNOK', name: 'USD / NOK', category: 'forex', finnhubSymbol: 'OANDA:USD_NOK', basePrice: 10.55, currency: 'NOK' },
  { symbol: 'USDSEK', name: 'USD / SEK', category: 'forex', finnhubSymbol: 'OANDA:USD_SEK', basePrice: 10.35, currency: 'SEK' },
  { symbol: 'USDDKK', name: 'USD / DKK', category: 'forex', finnhubSymbol: 'OANDA:USD_DKK', basePrice: 6.89, currency: 'DKK' },
]

// ─── MATERIAS PRIMAS (10) ─────────────────────────────────────────────────
const MATERIAS: Asset[] = [
  { symbol: 'GOLD', name: 'Oro', category: 'materias', finnhubSymbol: 'OANDA:XAU_USD', basePrice: 2320, currency: 'USD' },
  { symbol: 'SILVER', name: 'Plata', category: 'materias', finnhubSymbol: 'OANDA:XAG_USD', basePrice: 27, currency: 'USD' },
  { symbol: 'WTI', name: 'Petróleo WTI', category: 'materias', finnhubSymbol: 'OANDA:BCO_USD', basePrice: 82, currency: 'USD' },
  { symbol: 'BRENT', name: 'Petróleo Brent', category: 'materias', finnhubSymbol: 'OANDA:BCO_USD', basePrice: 86, currency: 'USD' },
  { symbol: 'NATGAS', name: 'Gas Natural', category: 'materias', finnhubSymbol: 'OANDA:NATGAS_USD', basePrice: 1.85, currency: 'USD' },
  { symbol: 'COPPER', name: 'Cobre', category: 'materias', finnhubSymbol: 'OANDA:XCU_USD', basePrice: 4.2, currency: 'USD' },
  { symbol: 'PLAT', name: 'Platino', category: 'materias', finnhubSymbol: 'OANDA:XPT_USD', basePrice: 975, currency: 'USD' },
  { symbol: 'PALL', name: 'Paladio', category: 'materias', finnhubSymbol: 'OANDA:XPD_USD', basePrice: 985, currency: 'USD' },
  { symbol: 'WHEAT', name: 'Trigo', category: 'materias', finnhubSymbol: 'OANDA:WHEAT_USD', basePrice: 5.8, currency: 'USD' },
  { symbol: 'CORN', name: 'Maíz', category: 'materias', finnhubSymbol: 'OANDA:CORN_USD', basePrice: 4.4, currency: 'USD' },
]

// ─── ÍNDICES (10) ─────────────────────────────────────────────────────────
const INDICES: Asset[] = [
  { symbol: 'SPX', name: 'S&P 500', category: 'indices', finnhubSymbol: '^GSPC', basePrice: 5200, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'NDX', name: 'Nasdaq 100', category: 'indices', finnhubSymbol: '^NDX', basePrice: 18200, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'indices', finnhubSymbol: '^DJI', basePrice: 39200, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'RUT', name: 'Russell 2000', category: 'indices', finnhubSymbol: '^RUT', basePrice: 2045, currency: 'USD', flag: '🇺🇸' },
  { symbol: 'IBEX', name: 'IBEX 35', category: 'indices', finnhubSymbol: '^IBEX', basePrice: 11200, currency: 'EUR', flag: '🇪🇸' },
  { symbol: 'DAX', name: 'DAX', category: 'indices', finnhubSymbol: '^GDAXI', basePrice: 18500, currency: 'EUR', flag: '🇩🇪' },
  { symbol: 'CAC', name: 'CAC 40', category: 'indices', finnhubSymbol: '^FCHI', basePrice: 8100, currency: 'EUR', flag: '🇫🇷' },
  { symbol: 'FTSE', name: 'FTSE 100', category: 'indices', finnhubSymbol: '^FTSE', basePrice: 7950, currency: 'GBP', flag: '🇬🇧' },
  { symbol: 'NKY', name: 'Nikkei 225', category: 'indices', finnhubSymbol: '^N225', basePrice: 38500, currency: 'JPY', flag: '🇯🇵' },
  { symbol: 'HSI', name: 'Hang Seng', category: 'indices', finnhubSymbol: '^HSI', basePrice: 16800, currency: 'HKD', flag: '🇭🇰' },
]

// ─── EXPORTACIONES ────────────────────────────────────────────────────────
export const ASSETS: Asset[] = [
  ...ACCIONES_US,
  ...ACCIONES_EU,
  ...CRIPTO,
  ...ETFS,
  ...FOREX,
  ...MATERIAS,
  ...INDICES,
]

export const ASSET_BY_SYMBOL = Object.fromEntries(ASSETS.map(a => [a.symbol, a]))

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  'acciones-us': 'Acciones EE.UU.',
  'acciones-eu': 'Acciones Europa',
  'cripto': 'Criptomonedas',
  'etfs': 'ETFs',
  'forex': 'Forex',
  'materias': 'Materias Primas',
  'indices': 'Índices',
}

export const CATEGORY_COUNTS = {
  'acciones-us': ACCIONES_US.length,
  'acciones-eu': ACCIONES_EU.length,
  'cripto': CRIPTO.length,
  'etfs': ETFS.length,
  'forex': FOREX.length,
  'materias': MATERIAS.length,
  'indices': INDICES.length,
}
