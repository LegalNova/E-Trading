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
    ('S&P 400', 'List_of_S&P_400_companies', 'Symbol', 'Security', 'GICS Sector', lambda t: t.replace('.', '-')),
    ('S&P 600', 'List_of_S&P_600_companies', 'Symbol', 'Security', 'GICS Sector', lambda t: t.replace('.', '-')),
    ('S&P/TSX 60', 'S&P/TSX_60', 'Symbol', 'Company', 'Sector', lambda t: t.replace('.', '-') + '.TO'),
    ('FTSE 250', 'FTSE_250_Index', 'Ticker', 'Company', 'FTSE Industry Classification Benchmark sector', lambda t: t.rstrip('.').replace('.', '-') + '.L'),
    ('SPI', 'Swiss_Performance_Index', 'Symbol', 'Company', None, lambda t: t + '.SW'),
    ('CSI 300', 'CSI_300_Index', 'Ticker', 'Company', 'Segment', lambda t: re.sub(r'\D', '', t).zfill(6) + ('.SZ' if t.upper().startswith('SZSE') else '.SS')),
    ('Hang Seng China Enterprises', 'Hang_Seng_China_Enterprises_Index', 'Ticker', 'Name', 'Industry', lambda t: after_colon(t).zfill(4) + '.HK'),
]

# Valores populares que no están en esos índices (ADRs, crecimiento, cripto-acciones…), mercado continuo español,
# Brasil y México. Cada uno se verifica contra Yahoo; el sector y el nombre se completan con su buscador.
POPULAR = {
    'Populares EE. UU.': '''BABA TSM ASML NVO SAP TM SONY BIDU JD PDD NIO XPEV LI SHOP SE MELI NU SPOT ARM RIVN LCID SOFI RBLX SNOW NET U DKNG AFRM UPST MSTR
        MARA RIOT CLSK HUT WULF BITF GME AMC BB NOK ZM DOCU PINS SNAP LYFT ROKU TWLO PATH AI IONQ RGTI QBTS RKLB ASTS LUNR SMCI CELH CVNA TTD ZS DDOG MDB OKTA
        TEAM WDAY HOOD COIN PLTR UBER ABNB DASH CRWD PANW TME BILI GRAB CPNG TCOM HMC UL BP SHEL TTE RIO BHP VALE PBR ITUB BBD INFY HDB IBN WIT AZN GSK NVS SNY
        DEO BTI BUD STLA RACE SAN BBVA TEF ING DB UBS BCS HSBC LYG NWG MUFG SMFG TD RY BNS ENB CNQ SU CP CNI BAM CCEP GFS MRVL OPEN PTON CHWY W BYND SPCE QS
        PLUG FCEL CHPT RUN SOUN BBAI HIMS OSCR DUOL RDDT CAVA TOST BIRK ONON CART KVUE CRCL CRWV NBIS TEM ALAB OKLO SMR NNE LEU ACHR JOBY FUTU TIGR XYZ SQ PYPL
        NFLX DIS F GM INTC AMD QCOM MU AVGO TXN ADBE CRM ORCL IBM CSCO V MA JPM BAC WFC C GS MS BRK-B KO PEP MCD SBUX NKE WMT COST TGT HD LOW''',
    'Mercado continuo': '''ALM.MC ATRY.MC A3M.MC AZK.MC CAF.MC CIE.MC DOM.MC EBRO.MC ENC.MC ECR.MC FAE.MC GEST.MC GRE.MC LDA.MC NEA.MC NHH.MC OHLA.MC PHM.MC PRS.MC
        PSG.MC CASH.MC TLGO.MC TRE.MC TUB.MC TRG.MC VID.MC VIS.MC ENO.MC MCM.MC AEDAS.MC HOME.MC MVC.MC LRE.MC ADX.MC GSJ.MC R4.MC RLIA.MC BKY.MC EZE.MC MDF.MC
        ORY.MC PVA.MC NXT.MC DIA.MC FDR.MC CIRSA.MC PUIG.MC HBX.MC ISUR.MC AMP.MC LLN.MC SLR.MC SCYR.MC MEL.MC IAG.MC AENA.MC ANE.MC IDR.MC SOL.MC COL.MC''',
    'Ibovespa': '''PETR4.SA PETR3.SA VALE3.SA ITUB4.SA BBDC4.SA BBAS3.SA ABEV3.SA B3SA3.SA WEGE3.SA RENT3.SA SUZB3.SA ELET3.SA RDOR3.SA PRIO3.SA JBSS3.SA GGBR4.SA
        LREN3.SA MGLU3.SA RADL3.SA EQTL3.SA VIVT3.SA CSAN3.SA HAPV3.SA RAIL3.SA SBSP3.SA TIMS3.SA EMBR3.SA BPAC11.SA ITSA4.SA CMIG4.SA CPLE6.SA UGPA3.SA
        KLBN11.SA BRFS3.SA AZUL4.SA CYRE3.SA NTCO3.SA TOTS3.SA HYPE3.SA ASAI3.SA CSNA3.SA USIM5.SA''',
    'S&P/BMV IPC': '''AMXB.MX WALMEX.MX GFNORTEO.MX FEMSAUBD.MX CEMEXCPO.MX GMEXICOB.MX BIMBOA.MX GAPB.MX ASURB.MX OMAB.MX KOFUBL.MX GRUMAB.MX ELEKTRA.MX TLEVISACPO.MX
        PINFRAL.MX AC.MX KIMBERA.MX ALFAA.MX ORBIA.MX BOLSAA.MX LABB.MX MEGACPO.MX GCARSOA1.MX PE&OLES.MX LIVEPOLC-1.MX''',
}


# Índices, ETFs, materias primas, divisas y cripto (lista curada)
def _x(typ, cat, txt):
    """«SÍMBOLO|Nombre; SÍMBOLO|Nombre; …» → filas (símbolo, nombre, tipo, categoría)"""
    return [(a.strip(), b.strip(), typ, cat) for a, b in (x.split('|') for x in txt.split(';') if x.strip())]


EXTRA = [
    *_x('INDEX', 'Índice', """^GSPC|S&P 500; ^NDX|Nasdaq 100; ^IXIC|Nasdaq Composite; ^DJI|Dow Jones; ^RUT|Russell 2000; ^NYA|NYSE Composite; ^MID|S&P MidCap 400;
        ^SML|S&P SmallCap 600; ^VIX|VIX (volatilidad); ^GSPTSE|S&P/TSX Composite; ^BVSP|Ibovespa; ^MXX|S&P/BMV IPC; ^MERV|Merval; ^IPSA|S&P IPSA;
        ^STOXX50E|Euro Stoxx 50; ^STOXX|STOXX Europe 600; ^FTSE|FTSE 100; ^FTMC|FTSE 250; ^GDAXI|DAX; ^MDAXI|MDAX; ^TECDAX|TecDAX; ^FCHI|CAC 40; ^IBEX|IBEX 35;
        FTSEMIB.MI|FTSE MIB; ^AEX|AEX; ^SSMI|SMI; ^OMX|OMX Stockholm 30; ^OMXC25|OMX Copenhagen 25; ^OMXH25|OMX Helsinki 25; ^OSEAX|Oslo All-Share;
        ^BFX|BEL 20; PSI20.LS|PSI; ^ATX|ATX; ^ISEQ|ISEQ 20; WIG20.WA|WIG 20; XU100.IS|BIST 100;
        ^N225|Nikkei 225; ^HSI|Hang Seng; ^HSCE|Hang Seng China Enterprises; 000001.SS|Shanghai Composite; 399001.SZ|Shenzhen Component; 000300.SS|CSI 300;
        ^NSEI|Nifty 50; ^BSESN|BSE Sensex; ^KS11|KOSPI; ^STI|Straits Times; ^AXJO|S&P/ASX 200; ^TWII|Taiwan Weighted; ^JKSE|Jakarta Composite;
        ^KLSE|FTSE Bursa Malaysia KLCI; ^SET.BK|SET Tailandia; ^NZ50|S&P/NZX 50"""),
    *_x('ETF', 'ETF EE. UU.', """SPY|SPDR S&P 500 ETF; VOO|Vanguard S&P 500 ETF; IVV|iShares Core S&P 500; SPLG|SPDR Portfolio S&P 500; RSP|Invesco S&P 500 Equal Weight;
        VTI|Vanguard Total Stock Market; QQQ|Invesco QQQ (Nasdaq 100); QQQM|Invesco Nasdaq 100; DIA|SPDR Dow Jones; IWM|iShares Russell 2000; IJH|iShares Core S&P Mid-Cap;
        IJR|iShares Core S&P Small-Cap; MDY|SPDR S&P MidCap 400; VB|Vanguard Small-Cap; VO|Vanguard Mid-Cap; VUG|Vanguard Growth; VTV|Vanguard Value;
        SCHG|Schwab U.S. Large-Cap Growth; SCHX|Schwab U.S. Large-Cap; MTUM|iShares MSCI USA Momentum; QUAL|iShares MSCI USA Quality; VLUE|iShares MSCI USA Value;
        USMV|iShares MSCI USA Min Vol; SPLV|Invesco S&P 500 Low Volatility"""),
    *_x('ETF', 'ETF dividendos', """VIG|Vanguard Dividend Appreciation; VYM|Vanguard High Dividend Yield; SCHD|Schwab U.S. Dividend Equity; DGRO|iShares Core Dividend Growth;
        NOBL|ProShares S&P 500 Dividend Aristocrats; SDY|SPDR S&P Dividend; JEPI|JPMorgan Equity Premium Income; JEPQ|JPMorgan Nasdaq Equity Premium Income"""),
    *_x('ETF', 'ETF sectorial', """XLK|Technology Select Sector SPDR; XLF|Financial Select Sector SPDR; XLE|Energy Select Sector SPDR; XLV|Health Care Select Sector SPDR;
        XLI|Industrial Select Sector SPDR; XLY|Consumer Discretionary Select Sector SPDR; XLP|Consumer Staples Select Sector SPDR; XLU|Utilities Select Sector SPDR;
        XLB|Materials Select Sector SPDR; XLRE|Real Estate Select Sector SPDR; XLC|Communication Services Select Sector SPDR; SMH|VanEck Semiconductor;
        SOXX|iShares Semiconductor; VGT|Vanguard Information Technology; IGV|iShares Expanded Tech-Software; XBI|SPDR S&P Biotech; IBB|iShares Biotechnology;
        KRE|SPDR S&P Regional Banking; KBE|SPDR S&P Bank; ITB|iShares U.S. Home Construction; XHB|SPDR S&P Homebuilders; XRT|SPDR S&P Retail;
        VNQ|Vanguard Real Estate; IYR|iShares U.S. Real Estate; JETS|U.S. Global Jets; ITA|iShares U.S. Aerospace & Defense"""),
    *_x('ETF', 'ETF temático', """ARKK|ARK Innovation; ARKG|ARK Genomic Revolution; ARKW|ARK Next Generation Internet; ICLN|iShares Global Clean Energy; TAN|Invesco Solar;
        LIT|Global X Lithium & Battery Tech; URA|Global X Uranium; HACK|Amplify Cybersecurity; CIBR|First Trust Nasdaq Cybersecurity; BOTZ|Global X Robotics & AI;
        ROBO|ROBO Global Robotics and Automation; AIQ|Global X Artificial Intelligence & Technology; ESPO|VanEck Video Gaming and eSports; BLOK|Amplify Transformational Data Sharing;
        KWEB|KraneShares CSI China Internet; DRIV|Global X Autonomous & Electric Vehicles"""),
    *_x('ETF', 'ETF mundial', """VT|Vanguard Total World; ACWI|iShares MSCI ACWI; VEA|Vanguard FTSE Developed Markets; EFA|iShares MSCI EAFE; IEFA|iShares Core MSCI EAFE;
        VXUS|Vanguard Total International Stock; VWCE.DE|Vanguard FTSE All-World (Acc); VGWL.DE|Vanguard FTSE All-World (Dist); IWDA.AS|iShares Core MSCI World;
        EUNL.DE|iShares Core MSCI World (Xetra); SWDA.L|iShares Core MSCI World (Londres); XDWD.DE|Xtrackers MSCI World; SPPW.DE|SPDR MSCI World;
        CW8.PA|Amundi MSCI World; IUSQ.DE|iShares MSCI ACWI (Acc); SSAC.L|iShares MSCI ACWI (Londres); IUSN.DE|iShares MSCI World Small Cap; ZPRV.DE|SPDR MSCI USA Small Cap Value"""),
    *_x('ETF', 'ETF EE. UU. (UCITS)', """CSPX.L|iShares Core S&P 500 (Acc); VUSA.AS|Vanguard S&P 500 (Dist); VUAA.DE|Vanguard S&P 500 (Acc); SXR8.DE|iShares Core S&P 500 (Xetra);
        SXRV.DE|iShares Nasdaq 100 (Xetra); CNDX.L|iShares Nasdaq 100 (Londres); EQQQ.L|Invesco EQQQ Nasdaq-100"""),
    *_x('ETF', 'ETF Europa', """EXSA.DE|iShares STOXX Europe 600; MEUD.PA|Amundi STOXX Europe 600; VEUR.AS|Vanguard FTSE Developed Europe; SXR7.DE|iShares Core MSCI EMU;
        EXS1.DE|iShares Core DAX; EXW1.DE|iShares Core Euro Stoxx 50; VGK|Vanguard FTSE Europe; EZU|iShares MSCI Eurozone; EWG|iShares MSCI Germany; EWU|iShares MSCI United Kingdom;
        EWQ|iShares MSCI France; EWP|iShares MSCI Spain; EWI|iShares MSCI Italy; EWL|iShares MSCI Switzerland"""),
    *_x('ETF', 'ETF emergentes', """EEM|iShares MSCI Emerging Markets; IEMG|iShares Core MSCI Emerging Markets; VWO|Vanguard FTSE Emerging Markets; IS3N.DE|iShares Core MSCI EM IMI;
        EIMI.L|iShares Core MSCI EM IMI (Londres); VFEM.AS|Vanguard FTSE Emerging Markets (UCITS); EWZ|iShares MSCI Brazil; EWW|iShares MSCI Mexico; FXI|iShares China Large-Cap"""),
    *_x('ETF', 'ETF Asia', """EWJ|iShares MSCI Japan; MCHI|iShares MSCI China; INDA|iShares MSCI India; EWY|iShares MSCI South Korea; EWT|iShares MSCI Taiwan; EWH|iShares MSCI Hong Kong;
        EWA|iShares MSCI Australia; EWC|iShares MSCI Canada"""),
    *_x('ETF', 'ETF renta fija', """BND|Vanguard Total Bond Market; AGG|iShares Core U.S. Aggregate Bond; BNDX|Vanguard Total International Bond; TLT|iShares 20+ Year Treasury;
        IEF|iShares 7-10 Year Treasury; SHY|iShares 1-3 Year Treasury; SGOV|iShares 0-3 Month Treasury; TIP|iShares TIPS Bond; LQD|iShares iBoxx Investment Grade Corporate;
        HYG|iShares iBoxx High Yield Corporate; EMB|iShares J.P. Morgan USD Emerging Markets Bond; AGGH.L|iShares Core Global Aggregate Bond; IEAG.AS|iShares Core Euro Aggregate Bond;
        IBGS.AS|iShares Euro Government Bond 1-3yr"""),
    *_x('ETF', 'ETF materias primas', """GLD|SPDR Gold Shares; IAU|iShares Gold Trust; SLV|iShares Silver Trust; PPLT|abrdn Platinum Shares; PALL|abrdn Palladium Shares; GDX|VanEck Gold Miners;
        GDXJ|VanEck Junior Gold Miners; SIL|Global X Silver Miners; COPX|Global X Copper Miners; USO|United States Oil Fund; UNG|United States Natural Gas Fund;
        DBC|Invesco DB Commodity Index; DBA|Invesco DB Agriculture; PDBC|Invesco Optimum Yield Diversified Commodity; CPER|United States Copper Index;
        4GLD.DE|Xetra-Gold; SGLD.L|Invesco Physical Gold; IGLN.L|iShares Physical Gold; PHAG.L|WisdomTree Physical Silver; PHPT.L|WisdomTree Physical Platinum;
        PHPD.L|WisdomTree Physical Palladium"""),
    *_x('ETF', 'ETF cripto', """IBIT|iShares Bitcoin Trust; FBTC|Fidelity Wise Origin Bitcoin; GBTC|Grayscale Bitcoin Trust; BITO|ProShares Bitcoin Strategy; ETHA|iShares Ethereum Trust"""),
    *_x('ETF', 'ETF apalancado', """TQQQ|ProShares UltraPro QQQ (3x); SQQQ|ProShares UltraPro Short QQQ (−3x); SPXL|Direxion S&P 500 Bull 3x; SOXL|Direxion Semiconductor Bull 3x;
        SH|ProShares Short S&P 500 (−1x); UVXY|ProShares Ultra VIX Short-Term Futures"""),
    *_x('COMMODITY', 'Metales', """GC=F|Oro; SI=F|Plata; PL=F|Platino; PA=F|Paladio; HG=F|Cobre; ALI=F|Aluminio"""),
    *_x('COMMODITY', 'Energía', """CL=F|Petróleo WTI; BZ=F|Petróleo Brent; NG=F|Gas natural; HO=F|Gasóleo de calefacción; RB=F|Gasolina RBOB"""),
    *_x('COMMODITY', 'Agrícolas', """ZW=F|Trigo; KE=F|Trigo KC HRW; ZC=F|Maíz; ZS=F|Soja; ZM=F|Harina de soja; ZL=F|Aceite de soja; ZO=F|Avena; ZR=F|Arroz;
        KC=F|Café; CC=F|Cacao; SB=F|Azúcar; CT=F|Algodón; OJ=F|Zumo de naranja"""),
    *_x('COMMODITY', 'Ganado', """LE=F|Ganado vivo; GF=F|Ganado de engorde; HE=F|Cerdo magro"""),
    *_x('FX', 'Divisas', """EURUSD=X|EUR/USD; GBPUSD=X|GBP/USD; USDJPY=X|USD/JPY; USDCHF=X|USD/CHF; AUDUSD=X|AUD/USD; NZDUSD=X|NZD/USD; USDCAD=X|USD/CAD;
        EURGBP=X|EUR/GBP; EURCHF=X|EUR/CHF; EURJPY=X|EUR/JPY; GBPJPY=X|GBP/JPY; GBPCHF=X|GBP/CHF; AUDJPY=X|AUD/JPY; CADJPY=X|CAD/JPY; CHFJPY=X|CHF/JPY;
        EURAUD=X|EUR/AUD; EURNZD=X|EUR/NZD; AUDNZD=X|AUD/NZD; EURCAD=X|EUR/CAD; USDCNY=X|USD/CNY; USDHKD=X|USD/HKD; USDSGD=X|USD/SGD; USDINR=X|USD/INR;
        USDKRW=X|USD/KRW; USDMXN=X|USD/MXN; USDBRL=X|USD/BRL; USDZAR=X|USD/ZAR; USDTRY=X|USD/TRY; USDSEK=X|USD/SEK; USDNOK=X|USD/NOK; USDPLN=X|USD/PLN;
        EURPLN=X|EUR/PLN; EURTRY=X|EUR/TRY; EURSEK=X|EUR/SEK; EURNOK=X|EUR/NOK; EURCZK=X|EUR/CZK; EURHUF=X|EUR/HUF"""),
]
# Cripto: se prueba en euros y, si Yahoo no la tiene, en dólares (se convierte a euros con el tipo real).
# Algunas llevan un número en Yahoo para distinguirlas de otra con el mismo nombre.
CRYPTO = {
    'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'SOL': 'Solana', 'BNB': 'BNB', 'XRP': 'XRP', 'ADA': 'Cardano', 'DOGE': 'Dogecoin', 'TRX': 'TRON', 'TON11419': 'Toncoin',
    'AVAX': 'Avalanche', 'SHIB': 'Shiba Inu', 'DOT': 'Polkadot', 'LINK': 'Chainlink', 'BCH': 'Bitcoin Cash', 'NEAR': 'NEAR Protocol', 'LTC': 'Litecoin',
    'POL28321': 'Polygon (POL)', 'UNI7083': 'Uniswap', 'ICP': 'Internet Computer', 'APT21794': 'Aptos', 'ETC': 'Ethereum Classic', 'XLM': 'Stellar',
    'FIL': 'Filecoin', 'HBAR': 'Hedera', 'ATOM': 'Cosmos', 'ARB11841': 'Arbitrum', 'OP': 'Optimism', 'VET': 'VeChain', 'INJ': 'Injective', 'RENDER': 'Render',
    'IMX10603': 'Immutable', 'GRT6719': 'The Graph', 'ALGO': 'Algorand', 'AAVE': 'Aave', 'MKR': 'Maker', 'SAND': 'The Sandbox', 'MANA': 'Decentraland',
    'AXS': 'Axie Infinity', 'EOS': 'EOS', 'XTZ': 'Tezos', 'FLOW': 'Flow', 'CHZ': 'Chiliz', 'CRV': 'Curve DAO', 'SNX': 'Synthetix', 'COMP': 'Compound',
    'LDO': 'Lido DAO', 'SUI20947': 'Sui', 'PEPE24478': 'Pepe', 'SEI': 'Sei', 'FET': 'Artificial Superintelligence Alliance', 'XMR': 'Monero', 'KAS': 'Kaspa',
    'TAO22974': 'Bittensor', 'WLD': 'Worldcoin', 'JUP29210': 'Jupiter', 'BONK': 'Bonk', 'ENA': 'Ethena', 'HYPE32196': 'Hyperliquid', 'TRUMP35336': 'Official Trump',
}

# Sufijo de Yahoo → (bolsa, país, región)
SUFFIX = {
    '': ('US', 'Estados Unidos', 'AMERICA'), 'L': ('LSE', 'Reino Unido', 'EUROPE'), 'DE': ('XETRA', 'Alemania', 'EUROPE'), 'F': ('XETRA', 'Alemania', 'EUROPE'),
    'PA': ('EPA', 'Francia', 'EUROPE'), 'MC': ('BME', 'España', 'EUROPE'), 'MI': ('MIL', 'Italia', 'EUROPE'), 'AS': ('AMS', 'Países Bajos', 'EUROPE'),
    'BR': ('BRU', 'Bélgica', 'EUROPE'), 'LS': ('LIS', 'Portugal', 'EUROPE'), 'SW': ('SIX', 'Suiza', 'EUROPE'), 'ST': ('STO', 'Suecia', 'EUROPE'),
    'CO': ('CPH', 'Dinamarca', 'EUROPE'), 'OL': ('OSL', 'Noruega', 'EUROPE'), 'HE': ('HEL', 'Finlandia', 'EUROPE'), 'IR': ('DUB', 'Irlanda', 'EUROPE'), 'VI': ('VIE', 'Austria', 'EUROPE'),
    'T': ('TSE', 'Japón', 'ASIA'), 'HK': ('HKEX', 'Hong Kong', 'ASIA'), 'NS': ('NSE', 'India', 'ASIA'), 'KS': ('KRX', 'Corea del Sur', 'ASIA'), 'SI': ('SGX', 'Singapur', 'ASIA'),
    'AX': ('ASX', 'Australia', 'ASIA'), 'TW': ('TWSE', 'Taiwán', 'ASIA'), 'SS': ('SSE', 'China', 'ASIA'), 'SZ': ('SZSE', 'China', 'ASIA'),
    'TO': ('TSX', 'Canadá', 'AMERICA'), 'SA': ('B3', 'Brasil', 'AMERICA'), 'MX': ('BMV', 'México', 'AMERICA'),
}


# Índices (^XXX): país y región según la zona horaria de su bolsa
INDEX_TZ = {
    'America/New_York': ('US', 'Estados Unidos', 'AMERICA'), 'America/Chicago': ('US', 'Estados Unidos', 'AMERICA'),
    'Europe/Zurich': ('INDEX_EU', 'Europa', 'EUROPE'), 'Europe/London': ('LSE', 'Reino Unido', 'EUROPE'), 'Europe/Berlin': ('XETRA', 'Alemania', 'EUROPE'),
    'Europe/Paris': ('EPA', 'Francia', 'EUROPE'), 'Europe/Madrid': ('BME', 'España', 'EUROPE'), 'Europe/Amsterdam': ('AMS', 'Países Bajos', 'EUROPE'),
    'Asia/Tokyo': ('TSE', 'Japón', 'ASIA'), 'Asia/Hong_Kong': ('HKEX', 'Hong Kong', 'ASIA'), 'Asia/Kolkata': ('NSE', 'India', 'ASIA'),
    'Asia/Seoul': ('KRX', 'Corea del Sur', 'ASIA'), 'Asia/Singapore': ('SGX', 'Singapur', 'ASIA'), 'Australia/Sydney': ('ASX', 'Australia', 'ASIA'),
    'Asia/Taipei': ('TWSE', 'Taiwán', 'ASIA'), 'Asia/Shanghai': ('SSE', 'China', 'ASIA'),
    'America/Toronto': ('TSX', 'Canadá', 'AMERICA'), 'America/Sao_Paulo': ('B3', 'Brasil', 'AMERICA'), 'America/Mexico_City': ('BMV', 'México', 'AMERICA'),
    'America/Argentina/Buenos_Aires': ('BCBA', 'Argentina', 'AMERICA'), 'America/Santiago': ('BCS', 'Chile', 'AMERICA'),
    'Europe/Stockholm': ('STO', 'Suecia', 'EUROPE'), 'Europe/Copenhagen': ('CPH', 'Dinamarca', 'EUROPE'), 'Europe/Oslo': ('OSL', 'Noruega', 'EUROPE'),
    'Europe/Helsinki': ('HEL', 'Finlandia', 'EUROPE'), 'Europe/Brussels': ('BRU', 'Bélgica', 'EUROPE'), 'Europe/Lisbon': ('LIS', 'Portugal', 'EUROPE'),
    'Europe/Vienna': ('VIE', 'Austria', 'EUROPE'), 'Europe/Dublin': ('DUB', 'Irlanda', 'EUROPE'), 'Europe/Warsaw': ('WSE', 'Polonia', 'EUROPE'),
    'Europe/Istanbul': ('BIST', 'Turquía', 'EUROPE'), 'Europe/Rome': ('MIL', 'Italia', 'EUROPE'),
    'Asia/Jakarta': ('IDX', 'Indonesia', 'ASIA'), 'Asia/Kuala_Lumpur': ('BURSA', 'Malasia', 'ASIA'), 'Asia/Bangkok': ('SET', 'Tailandia', 'ASIA'),
    'Pacific/Auckland': ('NZX', 'Nueva Zelanda', 'ASIA'),
}


# Índices cuya zona horaria en Yahoo no es la de su bolsa
INDEX_FIX = {
    '^OMXC25': ('CPH', 'Dinamarca', 'EUROPE', 'Europe/Copenhagen'), '^OMXH25': ('HEL', 'Finlandia', 'EUROPE', 'Europe/Helsinki'),
    '^ATX': ('VIE', 'Austria', 'EUROPE', 'Europe/Vienna'), '^SSMI': ('SIX', 'Suiza', 'EUROPE', 'Europe/Zurich'),
    '399001.SZ': ('SZSE', 'China', 'ASIA', 'Asia/Shanghai'),
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


def fill_profiles(rows, ok):
    """Acciones sin sector o sin nombre: se completan con el buscador de Yahoo (nombre largo, sector e industria)"""
    need = [s for s, e in rows.items() if s in ok and e['type'] == 'STOCK' and (not canon_sector(e['sector']) or not e['name'])]
    print(f'Completando perfil de {len(need)} acciones…')
    for i, sym in enumerate(need):
        try:
            d = get(f'https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(sym, safe="")}&quotesCount=5&newsCount=0', tries=3)
            q = next((x for x in d.get('quotes') or [] if x.get('symbol') == sym), None)
            if q:
                e = rows[sym]
                if not canon_sector(e['sector']) and q.get('sector'):
                    e['sector'] = q['sector']
                if not e['name']:
                    e['name'] = q.get('longname') or q.get('shortname') or ''
        except Exception:
            pass
        time.sleep(0.25)
        if i % 200 == 0:
            print(f'  {i}/{len(need)}')


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
    for idx, txt in POPULAR.items():
        for sym in txt.split():
            e = rows.setdefault(sym, {'symbol': sym, 'name': '', 'type': 'STOCK', 'sector': '', 'indices': []})
            if idx in ('Ibovespa', 'S&P/BMV IPC') and idx not in e['indices']:
                e['indices'].append(idx)
    for sym, name, typ, cat in EXTRA:
        rows[sym] = {'symbol': sym, 'name': name, 'type': typ, 'sector': cat, 'indices': []}
    for c, name in CRYPTO.items():
        for q in ('EUR', 'USD'):
            rows[f'{c}-{q}'] = {'symbol': f'{c}-{q}', 'name': name, 'type': 'CRYPTO', 'sector': 'Cripto', 'indices': [], 'pair': c}
    # Tipos de cambio necesarios para pasar todo a euros
    for cur in ['USD', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK', 'JPY', 'HKD', 'INR', 'KRW', 'SGD', 'AUD', 'TWD', 'CNY', 'CAD', 'MXN', 'BRL']:
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
    # Cripto: si hay par en euros, fuera el de dólares
    for sym, e in rows.items():
        if e.get('pair') and sym.endswith('-USD') and f"{e['pair']}-EUR" in ok:
            ok.pop(sym, None)
    fill_profiles(rows, ok)
    out = []
    for sym in syms:
        m = ok.get(sym)
        if not m:
            continue
        e = rows[sym]
        exch, country, region = classify(sym)
        if e['type'] == 'INDEX' and m.get('exchangeTimezoneName') in INDEX_TZ:
            exch, country, region = INDEX_TZ[m['exchangeTimezoneName']]
        tz = m.get('exchangeTimezoneName') or 'UTC'
        if sym in INDEX_FIX:
            exch, country, region, tz = INDEX_FIX[sym]
        cur = m.get('currency') or 'USD'
        out.append({
            'symbol': sym, 'name': e['name'] or m.get('shortName') or sym, 'type': e['type'], 'sector': (canon_sector(e['sector']) if e['type'] == 'STOCK' else e['sector']) or '', 'indices': e['indices'],
            'exchange': exch, 'exchangeName': m.get('fullExchangeName') or exch, 'country': country, 'region': region,
            'currency': cur, 'tz': tz, **({'hidden': True} if e.get('hidden') else {}),
        })
    missing = [s for s in syms if s not in ok]
    print(f'Con precio: {len(out)} · sin precio (descartados): {len(missing)}')
    print('Ejemplos descartados:', missing[:40])
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('Guardado en', os.path.relpath(OUT))


if __name__ == '__main__':
    main()
