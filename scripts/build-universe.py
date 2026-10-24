# Genera el catálogo de activos del simulador (src/server/market/universe.json).
# 1) Componentes de los índices desde Wikipedia (datos públicos).
# 2) Símbolo de Yahoo de cada bolsa.
# 3) Verificación una a una contra Yahoo: solo entra lo que tiene precio real.
# Uso: python3 -I scripts/build-universe.py   (tarda unos minutos; respeta los límites de Wikipedia y Yahoo)
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from html.parser import HTMLParser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sectors import canon_sector  # noqa: E402

UA = 'E-Trading-edu-universe-builder/1.0'
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'server', 'market', 'universe.json')


def get(url, tries=6):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA if 'wikipedia' in url else 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or i == tries - 1:
                raise
            time.sleep(6 * (i + 1))


def wiki_html(page):
    time.sleep(2.5)
    return get(f'https://en.wikipedia.org/w/api.php?action=parse&page={urllib.parse.quote(page)}&prop=text&format=json&formatversion=2&redirects=1')['parse']['text']


class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables, self.stack, self.row, self.cell, self.in_cell, self.skip = [], [], None, '', False, 0

    def handle_starttag(self, tag, attrs):
        if tag in ('style', 'script', 'sup'):
            self.skip += 1
        if tag == 'table':
            self.stack.append({'wiki': 'wikitable' in (dict(attrs).get('class') or ''), 'rows': []})
        elif tag == 'tr' and self.stack:
            self.row = []
        elif tag in ('td', 'th') and self.row is not None:
            self.in_cell, self.cell = True, ''

    def handle_endtag(self, tag):
        if tag in ('style', 'script', 'sup'):
            self.skip = max(0, self.skip - 1)
        if tag in ('td', 'th') and self.in_cell:
            self.row.append(re.sub(r'\s+', ' ', self.cell).strip())
            self.in_cell = False
        elif tag == 'tr' and self.stack and self.row is not None:
            if self.row:
                self.stack[-1]['rows'].append(self.row)
            self.row = None
        elif tag == 'table' and self.stack:
            t = self.stack.pop()
            if t['wiki'] and len(t['rows']) > 1:
                self.tables.append(t['rows'])

    def handle_data(self, d):
        if self.in_cell and not self.skip:
            self.cell += d


def table(page, ticker_col, name_col, sector_col=None):
    p = Tables()
    p.feed(wiki_html(page))
    for t in p.tables:
        head = [h.lower() for h in t[0]]
        ti = next((i for i, h in enumerate(head) if h == ticker_col.lower()), None)
        ni = next((i for i, h in enumerate(head) if h == name_col.lower()), None)
        if ti is None or ni is None:
            continue
        si = next((i for i, h in enumerate(head) if sector_col and h == sector_col.lower()), None)
        rows = []
        for r in t[1:]:
            if len(r) <= max(ti, ni):
                continue
            rows.append((r[ti], r[ni], r[si] if si is not None and len(r) > si else ''))
        return rows
    raise SystemExit(f'Sin tabla en {page}')


def after_colon(s):
    return s.split(':')[-1].strip()


# índice → (página, columna ticker, columna nombre, columna sector, conversor a símbolo Yahoo)
SOURCES = [
    ('S&P 500', 'List_of_S&P_500_companies', 'Symbol', 'Security', 'GICS Sector', lambda t: t.replace('.', '-')),
    ('Euro Stoxx 50', 'EURO_STOXX_50', 'Ticker', 'Name', 'Sector', lambda t: t),
    ('FTSE 100', 'FTSE_100_Index', 'Ticker', 'Company', 'FTSE industry classification benchmark sector', lambda t: t.rstrip('.').replace('.', '-') + '.L'),
    ('DAX', 'DAX', 'Ticker', 'Company', 'Prime Standard Sector', lambda t: t),
    ('CAC 40', 'CAC_40', 'Ticker', 'Company', 'Sector', lambda t: t),
    ('IBEX 35', 'IBEX_35', 'Ticker', 'Company', 'Sector', lambda t: t),
    ('FTSE MIB', 'FTSE_MIB', 'Ticker', 'Company', 'ICB Sector', lambda t: t),
    ('AEX', 'AEX_index', 'Ticker', 'Company', 'ICB Sector', lambda t: t),
    ('SMI', 'Swiss_Market_Index', 'Ticker', 'Name', 'Sector', lambda t: t + '.SW'),
    ('OMX Stockholm 30', 'OMX_Stockholm_30', 'Ticker', 'Company', 'GICS sector', lambda t: t),
    ('OMX Copenhagen 25', 'OMX_Copenhagen_25', 'Ticker symbol', 'Company', 'ICB Sector', lambda t: t.replace(' ', '-') + '.CO'),
    ('OBX', 'OBX_Index', 'Ticker symbol', 'Company', 'ICB subsector', lambda t: after_colon(t) + '.OL'),
    ('OMX Helsinki 25', 'OMX_Helsinki_25', 'Ticker', 'Company', 'GICS sector', lambda t: t),
    ('BEL 20', 'BEL_20', 'Ticker symbol', 'Company', 'ICB Sector', lambda t: after_colon(t) + '.BR'),
    ('PSI', 'PSI-20', 'Ticker', 'Company', 'Industry', lambda t: t + '.LS'),
    ('Hang Seng', 'Hang_Seng_Index', 'Ticker', 'Name', 'Sub-index', lambda t: after_colon(t).zfill(4) + '.HK'),
    ('Nifty 50', 'NIFTY_50', 'Symbol', 'Company name', 'Sector', lambda t: t + '.NS'),
    ('Straits Times', 'Straits_Times_Index', 'Stock symbol', 'Company', None, lambda t: after_colon(t) + '.SI'),
    ('S&P/ASX 50', 'S&P/ASX_50', 'Symbol', 'Company', 'Sector', lambda t: t + '.AX'),
    ('KOSPI 200', 'KOSPI_200', 'Symbol', 'Company', 'GICS Sector', lambda t: re.sub(r'\D', '', t).zfill(6) + '.KS'),
]

# Índices, ETFs, materias primas, divisas y cripto (lista curada)
EXTRA = [
    # (símbolo Yahoo, nombre, tipo, sector/categoría)
    ('^GSPC', 'S&P 500', 'INDEX', 'Índice'), ('^NDX', 'Nasdaq 100', 'INDEX', 'Índice'), ('^DJI', 'Dow Jones', 'INDEX', 'Índice'), ('^RUT', 'Russell 2000', 'INDEX', 'Índice'),
    ('^VIX', 'VIX (volatilidad)', 'INDEX', 'Índice'), ('^STOXX50E', 'Euro Stoxx 50', 'INDEX', 'Índice'), ('^STOXX', 'STOXX Europe 600', 'INDEX', 'Índice'),
    ('^FTSE', 'FTSE 100', 'INDEX', 'Índice'), ('^GDAXI', 'DAX', 'INDEX', 'Índice'), ('^FCHI', 'CAC 40', 'INDEX', 'Índice'), ('^IBEX', 'IBEX 35', 'INDEX', 'Índice'),
    ('FTSEMIB.MI', 'FTSE MIB', 'INDEX', 'Índice'), ('^AEX', 'AEX', 'INDEX', 'Índice'), ('^SSMI', 'SMI', 'INDEX', 'Índice'),
    ('^N225', 'Nikkei 225', 'INDEX', 'Índice'), ('^HSI', 'Hang Seng', 'INDEX', 'Índice'), ('000001.SS', 'Shanghai Composite', 'INDEX', 'Índice'),
    ('^NSEI', 'Nifty 50', 'INDEX', 'Índice'), ('^KS11', 'KOSPI', 'INDEX', 'Índice'), ('^STI', 'Straits Times', 'INDEX', 'Índice'), ('^AXJO', 'S&P/ASX 200', 'INDEX', 'Índice'), ('^TWII', 'Taiwan Weighted', 'INDEX', 'Índice'),
    ('SPY', 'SPDR S&P 500 ETF', 'ETF', 'ETF EE. UU.'), ('VOO', 'Vanguard S&P 500 ETF', 'ETF', 'ETF EE. UU.'), ('QQQ', 'Invesco QQQ (Nasdaq 100)', 'ETF', 'ETF EE. UU.'),
    ('VTI', 'Vanguard Total Stock Market', 'ETF', 'ETF EE. UU.'), ('IWM', 'iShares Russell 2000', 'ETF', 'ETF EE. UU.'), ('DIA', 'SPDR Dow Jones', 'ETF', 'ETF EE. UU.'),
    ('VT', 'Vanguard Total World', 'ETF', 'ETF mundial'), ('EFA', 'iShares MSCI EAFE', 'ETF', 'ETF mundial'), ('EEM', 'iShares MSCI Emerging Markets', 'ETF', 'ETF emergentes'),
    ('GLD', 'SPDR Gold Shares', 'ETF', 'ETF materias primas'), ('TLT', 'iShares 20+ Year Treasury', 'ETF', 'ETF renta fija'), ('ARKK', 'ARK Innovation', 'ETF', 'ETF temático'),
    ('VWCE.DE', 'Vanguard FTSE All-World (Acc)', 'ETF', 'ETF mundial'), ('IWDA.AS', 'iShares Core MSCI World', 'ETF', 'ETF mundial'), ('EUNL.DE', 'iShares Core MSCI World (Xetra)', 'ETF', 'ETF mundial'),
    ('CSPX.L', 'iShares Core S&P 500 (Acc)', 'ETF', 'ETF EE. UU.'), ('VUSA.AS', 'Vanguard S&P 500 (Dist)', 'ETF', 'ETF EE. UU.'), ('SXR8.DE', 'iShares Core S&P 500 (Xetra)', 'ETF', 'ETF EE. UU.'),
    ('EXSA.DE', 'iShares STOXX Europe 600', 'ETF', 'ETF Europa'), ('MEUD.PA', 'Amundi STOXX Europe 600', 'ETF', 'ETF Europa'), ('IS3N.DE', 'iShares Core MSCI EM IMI', 'ETF', 'ETF emergentes'),
    ('EWJ', 'iShares MSCI Japan', 'ETF', 'ETF Asia'), ('MCHI', 'iShares MSCI China', 'ETF', 'ETF Asia'), ('INDA', 'iShares MSCI India', 'ETF', 'ETF Asia'),
    ('GC=F', 'Oro', 'COMMODITY', 'Metales'), ('SI=F', 'Plata', 'COMMODITY', 'Metales'), ('HG=F', 'Cobre', 'COMMODITY', 'Metales'), ('PL=F', 'Platino', 'COMMODITY', 'Metales'),
    ('CL=F', 'Petróleo WTI', 'COMMODITY', 'Energía'), ('BZ=F', 'Petróleo Brent', 'COMMODITY', 'Energía'), ('NG=F', 'Gas natural', 'COMMODITY', 'Energía'),
    ('ZW=F', 'Trigo', 'COMMODITY', 'Agrícolas'), ('ZC=F', 'Maíz', 'COMMODITY', 'Agrícolas'), ('KC=F', 'Café', 'COMMODITY', 'Agrícolas'), ('CC=F', 'Cacao', 'COMMODITY', 'Agrícolas'),
    ('EURUSD=X', 'EUR/USD', 'FX', 'Divisas'), ('GBPUSD=X', 'GBP/USD', 'FX', 'Divisas'), ('USDJPY=X', 'USD/JPY', 'FX', 'Divisas'), ('EURGBP=X', 'EUR/GBP', 'FX', 'Divisas'),
    ('EURCHF=X', 'EUR/CHF', 'FX', 'Divisas'), ('EURJPY=X', 'EUR/JPY', 'FX', 'Divisas'), ('AUDUSD=X', 'AUD/USD', 'FX', 'Divisas'), ('USDCAD=X', 'USD/CAD', 'FX', 'Divisas'),
    ('USDCHF=X', 'USD/CHF', 'FX', 'Divisas'), ('USDCNY=X', 'USD/CNY', 'FX', 'Divisas'), ('USDINR=X', 'USD/INR', 'FX', 'Divisas'), ('USDMXN=X', 'USD/MXN', 'FX', 'Divisas'),
]
CRYPTO = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'LTC', 'TRX', 'XLM', 'ATOM', 'UNI', 'NEAR', 'BCH', 'SHIB', 'ETC', 'AAVE']
CRYPTO_NAMES = {'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'SOL': 'Solana', 'BNB': 'BNB', 'XRP': 'XRP', 'ADA': 'Cardano', 'DOGE': 'Dogecoin', 'AVAX': 'Avalanche', 'DOT': 'Polkadot', 'LINK': 'Chainlink', 'LTC': 'Litecoin', 'TRX': 'TRON', 'XLM': 'Stellar', 'ATOM': 'Cosmos', 'UNI': 'Uniswap', 'NEAR': 'NEAR Protocol', 'BCH': 'Bitcoin Cash', 'SHIB': 'Shiba Inu', 'ETC': 'Ethereum Classic', 'AAVE': 'Aave'}

# Sufijo de Yahoo → (bolsa, país, región)
SUFFIX = {
    '': ('US', 'Estados Unidos', 'AMERICA'), 'L': ('LSE', 'Reino Unido', 'EUROPE'), 'DE': ('XETRA', 'Alemania', 'EUROPE'), 'F': ('XETRA', 'Alemania', 'EUROPE'),
    'PA': ('EPA', 'Francia', 'EUROPE'), 'MC': ('BME', 'España', 'EUROPE'), 'MI': ('MIL', 'Italia', 'EUROPE'), 'AS': ('AMS', 'Países Bajos', 'EUROPE'),
    'BR': ('BRU', 'Bélgica', 'EUROPE'), 'LS': ('LIS', 'Portugal', 'EUROPE'), 'SW': ('SIX', 'Suiza', 'EUROPE'), 'ST': ('STO', 'Suecia', 'EUROPE'),
    'CO': ('CPH', 'Dinamarca', 'EUROPE'), 'OL': ('OSL', 'Noruega', 'EUROPE'), 'HE': ('HEL', 'Finlandia', 'EUROPE'), 'IR': ('DUB', 'Irlanda', 'EUROPE'), 'VI': ('VIE', 'Austria', 'EUROPE'),
    'T': ('TSE', 'Japón', 'ASIA'), 'HK': ('HKEX', 'Hong Kong', 'ASIA'), 'NS': ('NSE', 'India', 'ASIA'), 'KS': ('KRX', 'Corea del Sur', 'ASIA'), 'SI': ('SGX', 'Singapur', 'ASIA'),
    'AX': ('ASX', 'Australia', 'ASIA'), 'TW': ('TWSE', 'Taiwán', 'ASIA'), 'SS': ('SSE', 'China', 'ASIA'),
}


# Índices (^XXX): país y región según la zona horaria de su bolsa
INDEX_TZ = {
    'America/New_York': ('US', 'Estados Unidos', 'AMERICA'), 'America/Chicago': ('US', 'Estados Unidos', 'AMERICA'),
    'Europe/Zurich': ('INDEX_EU', 'Europa', 'EUROPE'), 'Europe/London': ('LSE', 'Reino Unido', 'EUROPE'), 'Europe/Berlin': ('XETRA', 'Alemania', 'EUROPE'),
    'Europe/Paris': ('EPA', 'Francia', 'EUROPE'), 'Europe/Madrid': ('BME', 'España', 'EUROPE'), 'Europe/Amsterdam': ('AMS', 'Países Bajos', 'EUROPE'),
    'Asia/Tokyo': ('TSE', 'Japón', 'ASIA'), 'Asia/Hong_Kong': ('HKEX', 'Hong Kong', 'ASIA'), 'Asia/Kolkata': ('NSE', 'India', 'ASIA'),
    'Asia/Seoul': ('KRX', 'Corea del Sur', 'ASIA'), 'Asia/Singapore': ('SGX', 'Singapur', 'ASIA'), 'Australia/Sydney': ('ASX', 'Australia', 'ASIA'),
    'Asia/Taipei': ('TWSE', 'Taiwán', 'ASIA'),
}


def classify(sym):
    if sym.endswith('=X'):
        return ('FX', 'Divisas', 'GLOBAL')
    if sym.endswith('=F'):
        return ('CME', 'Materias primas', 'GLOBAL')
    if sym.endswith('-EUR') or sym.endswith('-USD'):
        return ('CRYPTO', 'Cripto', 'GLOBAL')
    suf = sym.split('.')[-1] if '.' in sym else ''
    return SUFFIX.get(suf, ('US', 'Estados Unidos', 'AMERICA'))


def spark(symbols):
    q = ','.join(urllib.parse.quote(s, safe='') for s in symbols)
    d = get(f'https://query1.finance.yahoo.com/v7/finance/spark?symbols={q}&range=1d&interval=1d')
    out = {}
    for r in (d.get('spark') or {}).get('result') or []:
        m = ((r.get('response') or [{}])[0]).get('meta') or {}
        if m.get('regularMarketPrice'):
            out[r['symbol']] = m
    return out


def main():
    rows = {}
    for idx, page, tcol, ncol, scol, conv in SOURCES:
        try:
            got = table(page, tcol, ncol, scol)
        except Exception as e:
            print(f'⚠️  {idx}: {e}')
            continue
        n = 0
        for t, name, sector in got:
            t = t.strip()
            if not t:
                continue
            sym = conv(t)
            if len(sym) > 20 or ' ' in sym:
                continue
            e = rows.setdefault(sym, {'symbol': sym, 'name': name, 'type': 'STOCK', 'sector': sector, 'indices': []})
            if idx not in e['indices']:
                e['indices'].append(idx)
            if not e['sector'] and sector:
                e['sector'] = sector
            n += 1
        print(f'{idx}: {n}')
    # Nikkei 225 (componentes en el texto de la página)
    txt = re.sub(r'<[^>]+>', '', wiki_html('Nikkei_225'))
    nk = re.findall(r'\n\s*([^\n(]{2,80}?)\s*\(TYO:\s*(\d{4})\)', txt)
    for name, code in nk:
        e = rows.setdefault(code + '.T', {'symbol': code + '.T', 'name': name.strip(), 'type': 'STOCK', 'sector': '', 'indices': []})
        e['indices'].append('Nikkei 225')
    print(f'Nikkei 225: {len(nk)}')
    for sym, name, typ, cat in EXTRA:
        rows[sym] = {'symbol': sym, 'name': name, 'type': typ, 'sector': cat, 'indices': []}
    for c in CRYPTO:
        rows[f'{c}-EUR'] = {'symbol': f'{c}-EUR', 'name': CRYPTO_NAMES[c], 'type': 'CRYPTO', 'sector': 'Cripto', 'indices': []}
    # Tipos de cambio necesarios para pasar todo a euros
    for cur in ['USD', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK', 'JPY', 'HKD', 'INR', 'KRW', 'SGD', 'AUD', 'TWD', 'CNY', 'CAD', 'MXN']:
        rows.setdefault(f'EUR{cur}=X', {'symbol': f'EUR{cur}=X', 'name': f'EUR/{cur}', 'type': 'FX', 'sector': 'Divisas', 'indices': [], 'hidden': cur not in ('USD', 'GBP', 'CHF', 'JPY')})

    syms = list(rows)
    print(f'Total a verificar: {len(syms)}')
    ok = {}
    for i in range(0, len(syms), 20):
        chunk = syms[i:i + 20]
        try:
            ok.update(spark(chunk))
        except Exception as e:
            print('  lote fallido', chunk[0], e)
        time.sleep(0.6)
        if i % 400 == 0:
            print(f'  verificados {i + len(chunk)}/{len(syms)} · con precio {len(ok)}')
    out = []
    for sym in syms:
        m = ok.get(sym)
        if not m:
            continue
        e = rows[sym]
        exch, country, region = classify(sym)
        if sym.startswith('^') and m.get('exchangeTimezoneName') in INDEX_TZ:
            exch, country, region = INDEX_TZ[m['exchangeTimezoneName']]
        cur = m.get('currency') or 'USD'
        out.append({
            'symbol': sym, 'name': e['name'] or m.get('shortName') or sym, 'type': e['type'], 'sector': (canon_sector(e['sector']) if e['type'] == 'STOCK' else e['sector']) or '', 'indices': e['indices'],
            'exchange': exch, 'exchangeName': m.get('fullExchangeName') or exch, 'country': country, 'region': region,
            'currency': cur, 'tz': m.get('exchangeTimezoneName') or 'UTC', **({'hidden': True} if e.get('hidden') else {}),
        })
    missing = [s for s in syms if s not in ok]
    print(f'Con precio: {len(out)} · sin precio (descartados): {len(missing)}')
    print('Ejemplos descartados:', missing[:40])
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('Guardado en', os.path.relpath(OUT))


if __name__ == '__main__':
    main()
