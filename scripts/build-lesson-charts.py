#!/usr/bin/env python3
"""Gráficos de las lecciones con DATOS REALES (regla F1: nunca inventar precios).

Descarga velas diarias de Yahoo Finance de varios activos, busca de forma automática
ejemplos reales de cada patrón (martillo, doji, envolventes, tendencias…) y guarda
ventanas cortas en src/server/content/charts.json, con el activo y las fechas.

Uso:  python3 -I scripts/build-lesson-charts.py            (lo genera todo de nuevo: cambia los gráficos de las clases)
      python3 -I scripts/build-lesson-charts.py --repair   (arregla lo que hay sin cambiar los datos que citan las clases)

Fechas (auditoría P0-5): Yahoo marca cada vela semanal o mensual a las 00:00 de la bolsa de ese activo. Leída en UTC,
esa hora cae en el día anterior para las bolsas al este de Greenwich (Madrid, Tokio, Londres en verano), y el mes entero
se desplazaba. Aquí todas las marcas de tiempo se pasan a la hora de su bolsa nada más descargarlas (to_wall).
"""
import calendar, json, os, time, urllib.request, datetime
from zoneinfo import ZoneInfo

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'server', 'content', 'charts.json')
UA = {'User-Agent': 'E-Trading-edu-lesson-charts/1.0'}
# Plata: el futuro de Yahoo (SI=F) trae una de cada ocho sesiones solo con el cierre, sin apertura, máximo ni mínimo
# (velas planas, auditoría CON-24). Se usa un ETC europeo de plata física (WisdomTree Physical Silver, en dólares),
# que tiene las velas completas y es el tipo de producto que explica la clase de materias primas.
SILVER = ('PHAG.L', 'Plata (ETC físico)')
ASSETS = [
    ('AAPL', 'Apple'), ('MSFT', 'Microsoft'), ('NVDA', 'NVIDIA'), ('AMZN', 'Amazon'), ('KO', 'Coca-Cola'),
    ('SAN.MC', 'Banco Santander'), ('ITX.MC', 'Inditex'), ('IBE.MC', 'Iberdrola'), ('BBVA.MC', 'BBVA'),
    ('^GSPC', 'S&P 500'), ('^IBEX', 'IBEX 35'), ('^GDAXI', 'DAX'), ('BTC-EUR', 'Bitcoin'), ('EURUSD=X', 'EUR/USD'), ('GC=F', 'Oro'),
    ('TSLA', 'Tesla'), ('GOOGL', 'Alphabet'), ('META', 'Meta'), ('JPM', 'JPMorgan'), ('XOM', 'ExxonMobil'), ('ETH-EUR', 'Ethereum'),
    ('REP.MC', 'Repsol'), ('TEF.MC', 'Telefónica'), ('^NDX', 'Nasdaq 100'), ('CL=F', 'Petróleo WTI'), SILVER, ('USDJPY=X', 'USD/JPY'),
]

# Momentos históricos (velas semanales o mensuales): visible hasta «cut», se revela hasta «end»
HISTORY = [
    # id, símbolo, nombre, intervalo, desde, corte, hasta, pregunta de contexto
    ('hist-crash-1929', '^GSPC', 'S&P 500', '1wk', '1928-01-01', '1929-10-01', '1932-12-01'),
    ('hist-dotcom', '^NDX', 'Nasdaq 100', '1wk', '1998-01-01', '2000-03-06', '2002-12-30'),
    ('hist-2008', '^GSPC', 'S&P 500', '1wk', '2006-01-01', '2008-09-08', '2009-12-28'),
    ('hist-2009-bottom', '^GSPC', 'S&P 500', '1wk', '2007-06-01', '2009-03-02', '2010-12-27'),
    ('hist-japan-1989', '^N225', 'Nikkei 225', '1mo', '1985-01-01', '1989-12-01', '1995-12-01'),
    ('hist-ibex-2012', '^IBEX', 'IBEX 35', '1wk', '2010-01-01', '2012-07-23', '2013-12-30'),
    ('hist-covid', '^GSPC', 'S&P 500', '1d', '2019-11-01', '2020-03-23', '2020-08-31'),
    ('hist-btc-2021', 'BTC-USD', 'Bitcoin', '1wk', '2020-06-01', '2021-11-08', '2022-12-26'),
    ('hist-gold-2020', 'GC=F', 'Oro', '1wk', '2018-06-01', '2020-08-03', '2021-12-27'),
    ('hist-oil-2020', 'CL=F', 'Petróleo WTI', '1wk', '2019-06-01', '2020-04-20', '2021-06-28'),
    ('hist-rates-2022', 'TLT', 'Bonos del Tesoro a 20+ años (ETF)', '1wk', '2020-06-01', '2022-01-03', '2023-10-23'),
    ('hist-tsla-2020', 'TSLA', 'Tesla', '1wk', '2019-01-01', '2020-12-21', '2023-01-02'),
]


def ts(date):
    """«2012-07-23» → segundos de ese día a las 00:00 (igual en cualquier ordenador: no depende de su zona horaria)"""
    return calendar.timegm(datetime.datetime.strptime(date, '%Y-%m-%d').timetuple())


def to_wall(t, tz):
    """Marca de tiempo de Yahoo → la misma hora «de reloj» de la bolsa, para que el día y el mes salgan bien"""
    return t + int(datetime.datetime.fromtimestamp(t, tz).utcoffset().total_seconds())


def _rows(d):
    tz = ZoneInfo(d['meta'].get('exchangeTimezoneName') or 'UTC')
    t = [to_wall(x, tz) for x in d['timestamp']]
    o, h, l, c = (d['indicators']['quote'][0][k] for k in ('open', 'high', 'low', 'close'))
    return [(t[i], o[i], h[i], l[i], c[i]) for i in range(len(t)) if None not in (o[i], h[i], l[i], c[i])]


def _fetch(sym, query):
    q = urllib.parse.quote(sym, safe='')
    for host in ('query1', 'query2'):
        try:
            url = f'https://{host}.finance.yahoo.com/v8/finance/chart/{q}?{query}'
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
                return json.load(r)['chart']['result'][0]
        except Exception as e:  # noqa: BLE001
            err = e
    raise err


def get_range(sym, interval, start, end):
    """Velas entre dos fechas, con un mes de margen al final (quien llama recorta lo que necesita).
    Las semanales se piden de lunes a lunes: si no, Yahoo arma las semanas a partir del día de la semana pedido
    (velas de jueves a miércoles) y la primera y la última quedan a medias."""
    p1, p2 = ts(start), ts(end) + 86400 * 31
    if interval == '1wk':
        p1 -= when(p1).weekday() * 86400
        p2 += (7 - when(p2).weekday()) % 7 * 86400
    return _rows(_fetch(sym, f'period1={p1}&period2={p2}&interval={interval}'))


def get(sym, years=3):
    return _rows(_fetch(sym, f'range={years}y&interval=1d'))


def flat(x):
    """Vela sin rango (apertura = máximo = mínimo = cierre): es un hueco de datos, no una sesión real (CON-24)"""
    return x[2] == x[3]


import urllib.parse  # noqa: E402


def r2(v):
    return float(f'{v:.4g}') if abs(v) < 10 else round(v, 2)


EPOCH = datetime.datetime(1970, 1, 1)


def when(t):
    """Fecha de una marca de tiempo ya pasada a la hora de su bolsa (vale también para antes de 1970)"""
    return EPOCH + datetime.timedelta(seconds=t)


def day(t):
    return when(t).strftime('%d/%m/%Y')


MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def span(a, b):
    da, db = when(a), when(b)
    if da.year == db.year and da.month == db.month:
        return f'{MESES[da.month - 1]} de {da.year}'
    if da.year == db.year:
        return f'{MESES[da.month - 1]}–{MESES[db.month - 1]} de {da.year}'
    return f'{MESES[da.month - 1]} de {da.year} – {MESES[db.month - 1]} de {db.year}'


def body(x): return abs(x[4] - x[1])
def rng(x): return x[2] - x[3]
def upper(x): return x[2] - max(x[1], x[4])
def lower(x): return min(x[1], x[4]) - x[3]
def green(x): return x[4] > x[1]


def avg_range(rows, i, n=10):
    seg = rows[max(0, i - n):i] or rows[i:i + 1]
    return sum(rng(x) for x in seg) / len(seg)


def slope(vals):
    n = len(vals); mx = (n - 1) / 2; my = sum(vals) / n
    num = sum((i - mx) * (v - my) for i, v in enumerate(vals)); den = sum((i - mx) ** 2 for i in range(n))
    return num / den / my  # pendiente relativa por vela


def down_before(rows, i, n=5):
    return rows[i - n][4] > rows[i - 1][4] * 1.02


def up_before(rows, i, n=5):
    return rows[i - n][4] * 1.02 < rows[i - 1][4]


# ── Detectores: devuelven True si en la vela i hay un ejemplo claro ──
def is_hammer(rows, i):
    x = rows[i]; ar = avg_range(rows, i)
    return down_before(rows, i) and rng(x) > ar * 1.1 and lower(x) >= 2.5 * max(body(x), 1e-9) and upper(x) <= 0.25 * rng(x) and body(x) > 0.05 * rng(x)


def is_star(rows, i):  # estrella fugaz
    x = rows[i]; ar = avg_range(rows, i)
    return up_before(rows, i) and rng(x) > ar * 1.1 and upper(x) >= 2.5 * max(body(x), 1e-9) and lower(x) <= 0.25 * rng(x) and body(x) > 0.05 * rng(x)


def is_doji(rows, i):
    x = rows[i]; ar = avg_range(rows, i)
    return rng(x) > ar * 0.9 and body(x) <= 0.06 * rng(x) and upper(x) > 0.3 * rng(x) and lower(x) > 0.3 * rng(x)


def is_bull_engulf(rows, i):
    a, b = rows[i - 1], rows[i]
    return down_before(rows, i - 1) and not green(a) and green(b) and b[1] <= a[4] and b[4] >= a[1] and body(b) > body(a) * 1.3 and body(b) > avg_range(rows, i) * 0.6


def is_bear_engulf(rows, i):
    a, b = rows[i - 1], rows[i]
    return up_before(rows, i - 1) and green(a) and not green(b) and b[1] >= a[4] and b[4] <= a[1] and body(b) > body(a) * 1.3 and body(b) > avg_range(rows, i) * 0.6


def is_marubozu(rows, i):
    x = rows[i]; ar = avg_range(rows, i)
    return green(x) and body(x) > ar * 1.4 and upper(x) + lower(x) < 0.1 * rng(x)


def is_morning_star(rows, i):  # i = tercera vela
    a, b, c = rows[i - 2], rows[i - 1], rows[i]; ar = avg_range(rows, i)
    return down_before(rows, i - 2) and not green(a) and body(a) > ar * 0.7 and body(b) < body(a) * 0.35 and green(c) and body(c) > ar * 0.6 and c[4] > (a[1] + a[4]) / 2


# Para que el ejercicio sea inequívoco, la vela buscada debe destacar en su ventana
def unique_in_window(rows, s, e, i, key):
    vals = [(key(rows[j]), j) for j in range(s, e)]
    vals.sort(reverse=True)
    return vals[0][1] == i and (len(vals) < 2 or vals[0][0] > vals[1][0] * 1.35)


PATTERNS = {
    'hammer': (is_hammer, lambda x: lower(x) / max(rng(x), 1e-9) * rng(x)),
    'shooting-star': (is_star, lambda x: upper(x)),
    'doji': (is_doji, lambda x: rng(x) / max(body(x), rng(x) * 0.01)),
    'bull-engulfing': (is_bull_engulf, lambda x: body(x) if green(x) else 0),
    'bear-engulfing': (is_bear_engulf, lambda x: body(x) if not green(x) else 0),
    'marubozu': (is_marubozu, lambda x: body(x) if green(x) and upper(x) + lower(x) < 0.15 * rng(x) else 0),
    'morning-star': (is_morning_star, None),
}

W = 9  # velas por ventana

# Posición de la vela buscada dentro de la ventana (0 = primera). Antes era siempre la 7.ª y se acertaba sin mirar
# (auditoría P0-6). Ahora va de la 4.ª a la 8.ª, repartida, dejando delante las velas que dan sentido a la figura:
# la tendencia previa del martillo, la primera vela de una envolvente, las dos primeras de la estrella del amanecer.
POSITIONS = (3, 4, 5, 6, 7)
MIN_BEFORE = {'morning-star': 5, 'bull-engulfing': 4, 'bear-engulfing': 4}


def pick_window(rows, i, pid, key, counts):
    """Ventana de W velas con la vela i en la posición menos usada hasta ahora que cumpla las condiciones"""
    for pos in sorted((q for q in POSITIONS if q >= MIN_BEFORE.get(pid, 3)), key=lambda q: (counts.get(q, 0), -q)):
        s, e = i - pos, i - pos + W
        if s < 0 or e > len(rows) or any(flat(x) for x in rows[s:e]):
            continue
        if key and not unique_in_window(rows, s, e, i, key):
            continue
        counts[pos] = counts.get(pos, 0) + 1
        return s, e
    return None


def fixture(fid, sym, name, rows, s, e, target=None, closes=False):
    seg = rows[s:e]
    f = {'id': fid, 'symbol': sym, 'name': name, 'from': day(seg[0][0]), 'to': day(seg[-1][0]),
         'caption': f'{name} · velas diarias · {span(seg[0][0], seg[-1][0])}'}
    if closes:
        f['closes'] = [r2(x[4]) for x in seg]
    else:
        f['candles'] = [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in seg]
    if target is not None:
        f['target'] = target - s
    return f


def main():
    data = {}
    for sym, name in ASSETS:
        try:
            data[sym] = (name, get(sym))
            print(f'{sym}: {len(data[sym][1])} velas')
        except Exception as e:  # noqa: BLE001
            print(f'⚠️  {sym}: {e}')
        time.sleep(0.5)
    out = {}
    counts = {}
    # Patrones de velas: hasta 3 ejemplos de cada uno, de activos distintos
    for pid, (det, key) in PATTERNS.items():
        n = 0
        for sym, (name, rows) in data.items():
            if n >= 3:
                break
            for i in range(len(rows) - 3, 12, -1):
                if not det(rows, i):
                    continue
                win = pick_window(rows, i, pid, key, counts)
                if not win:
                    continue
                s, e = win
                out[f'{pid}-{n + 1}'] = fixture(f'{pid}-{n + 1}', sym, name, rows, s, e, i)
                n += 1
                break
        print(f'{pid}: {n} ejemplos')
    # Tendencias (cierres): alcista, bajista y lateral, 14 velas semanales aproximadas (cada 3 días)
    for kind in ('up', 'down', 'flat'):
        n = 0
        for sym, (name, rows) in data.items():
            if n >= 3:
                break
            closes = rows[::3]
            for s in range(len(closes) - 15, 0, -7):
                seg = [x[4] for x in closes[s:s + 14]]
                sl = slope(seg); rel = (max(seg) - min(seg)) / (sum(seg) / len(seg))
                ok = (kind == 'up' and sl > 0.012) or (kind == 'down' and sl < -0.012) or (kind == 'flat' and abs(sl) < 0.0012 and 0.05 < rel < 0.12 and abs(seg[-1] / seg[0] - 1) < 0.025 and abs(seg[7] / seg[0] - 1) < 0.06)
                # en tendencia, al menos 3 mínimos/máximos que lo confirmen: el último ≥ 8 % del primero
                if kind == 'up':
                    ok = ok and seg[-1] > seg[0] * 1.08
                if kind == 'down':
                    ok = ok and seg[-1] < seg[0] * 0.92
                if ok and not any(flat(x) for x in closes[s:s + 14]):
                    sub = closes[s:s + 14]
                    out[f'trend-{kind}-{n + 1}'] = {'id': f'trend-{kind}-{n + 1}', 'symbol': sym, 'name': name, 'from': day(sub[0][0]), 'to': day(sub[-1][0]),
                                                  'caption': f'{name} · cierres cada 3 sesiones · {span(sub[0][0], sub[-1][0])}', 'closes': [r2(v) for v in seg]}
                    n += 1
                    break
        print(f'trend-{kind}: {n} ejemplos')
    # «¿Sube o baja?»: 30 velas visibles y 10 ocultas con un movimiento claro (equilibrado entre subidas y bajadas)
    nud = 0
    for sym, (name, rows) in data.items():
        thr = 0.08 if '-EUR' in sym else 0.012 if '=X' in sym else 0.05
        got = {'UP': 0, 'DOWN': 0}
        for e in range(len(rows) - 11, 60, -23):
            vis, fut = rows[e - 30:e], rows[e:e + 10]
            ch = fut[-1][4] / vis[-1][4] - 1
            way = 'UP' if ch > thr else 'DOWN' if ch < -thr else None
            if not way or got[way] >= 2 or any(flat(x) for x in vis + fut):
                continue
            got[way] += 1
            nud += 1
            fid = f'ud-{nud}'
            out[fid] = {'id': fid, 'symbol': sym, 'name': name, 'from': day(vis[0][0]), 'to': day(fut[-1][0]),
                        'caption': f'{name} · velas diarias · {span(vis[0][0], fut[-1][0])}',
                        'candles': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in vis],
                        'future': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in fut], 'outcome': way, 'changePct': round(ch * 100, 1)}
            if got['UP'] >= 2 and got['DOWN'] >= 2:
                break
    print(f'sube o baja: {nud} ejemplos')
    # Niveles: tendencia alcista con un mínimo reciente claro (para el stop) y un máximo previo (para el objetivo); 15 velas de futuro
    nl = 0
    for sym, (name, rows) in data.items():
        k = 0
        for e in range(len(rows) - 16, 60, -31):
            vis, fut = rows[e - 30:e], rows[e:e + 15]
            entry = vis[-1][4]
            low_i = min(range(18, 28), key=lambda j: vis[j][3])
            swing = vis[low_i][3]
            res = max(x[2] for x in vis[:18])
            atr = sum(rng(x) for x in vis[-14:]) / 14
            # mínimo reciente por debajo de la entrada (entre 1 y 4 ATR) y un máximo anterior por encima (≥ 2 ATR)
            if not (entry - 4 * atr < swing < entry - atr and res > entry + 2 * atr and vis[-1][4] > vis[0][4]) or any(flat(x) for x in vis + fut):
                continue
            nl += 1; k += 1
            fid = f'lvl-{nl}'
            out[fid] = {'id': fid, 'symbol': sym, 'name': name, 'from': day(vis[0][0]), 'to': day(fut[-1][0]),
                        'caption': f'{name} · velas diarias · {span(vis[0][0], fut[-1][0])}',
                        'candles': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in vis],
                        'future': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in fut],
                        'entry': r2(entry), 'support': r2(swing), 'resistance': r2(res), 'atr': r2(atr)}
            if k >= 2:
                break
    print(f'niveles: {nl} ejemplos')
    # Momentos históricos
    for item in HISTORY:
        try:
            out[item[0]] = history(*item)
        except Exception as e:  # noqa: BLE001
            print(f'⚠️  {item[0]}: {e}'); continue
        print(f'{item[0]}: visible {len(out[item[0]]["closes"])} · futuro {len(out[item[0]]["futureCloses"])} · {out[item[0]]["changePct"]} %')
        time.sleep(0.4)
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print('Guardado', os.path.relpath(OUT), len(out), 'gráficos')


def cut_label(iv, t):
    """Hasta dónde llega lo visible, dicho según el tipo de vela (cada vela lleva la fecha en que empieza)"""
    d = when(t)
    return f'el {day(t)}' if iv == '1d' else f'la semana del {day(t)}' if iv == '1wk' else f'{MESES[d.month - 1]} de {d.year}'


def history(fid, sym, name, iv, a, cut, b, legacy=False):
    """Momento histórico: lo visible llega hasta la vela del corte y el resto se revela al responder.
    Si hay que saltar puntos (más de 80), se cuenta desde el corte hacia atrás para que la última vela visible salga
    siempre. `legacy` repite el muestreo antiguo (desde el principio): solo lo usa --repair para comparar."""
    rows = get_range(sym, iv, a, b)
    tc, tb = ts(cut), ts(b) + 86400 * 7
    vis = [x for x in rows if x[0] <= tc + 86400 * 3]
    fut = [x for x in rows if tc + 86400 * 3 < x[0] < tb]
    # como mucho 80 puntos visibles y 80 de futuro
    sv, sf = max(1, len(vis) // 80 + (len(vis) % 80 > 0)), max(1, len(fut) // 80 + (len(fut) % 80 > 0))
    per = {'1d': 'cierres diarios', '1wk': 'cierres semanales', '1mo': 'cierres mensuales'}[iv]
    return {'id': fid, 'symbol': sym, 'name': name, 'from': day(vis[0][0]), 'to': day(fut[-1][0]),
            'caption': f'{name} · {per} · {span(vis[0][0], fut[-1][0])}', 'cutDate': day(vis[-1][0]), 'cutLabel': cut_label(iv, vis[-1][0]),
            'closes': [r2(x[4]) for x in (vis[::sv] if legacy else vis[(len(vis) - 1) % sv::sv])], 'futureCloses': [r2(x[4]) for x in fut[::sf]],
            'changePct': round((fut[-1][4] / vis[-1][4] - 1) * 100, 1), 'minPct': round((min(x[3] for x in fut) / vis[-1][4] - 1) * 100, 1)}


def append_trends(per_kind=8):
    """Añade gráficos de tendencia nuevos sin tocar los existentes (las clases ya usan sus ids)"""
    out = json.load(open(OUT))
    data = {}
    for sym, name in ASSETS:
        try:
            data[sym] = (name, get(sym))
        except Exception as e:  # noqa: BLE001
            print(f'⚠️  {sym}: {e}')
        time.sleep(0.4)
    used = {(v['symbol'], v['from']) for v in out.values()}
    for kind in ('up', 'down', 'flat'):
        n = len([k for k in out if k.startswith(f'trend-{kind}-')])
        per_asset = {}
        for sym, (name, rows) in data.items():
            closes = rows[::3]
            for s0 in range(len(closes) - 15, 0, -5):
                if n >= per_kind or per_asset.get(sym, 0) >= 1:
                    break
                seg = [x[4] for x in closes[s0:s0 + 14]]
                sl = slope(seg); rel = (max(seg) - min(seg)) / (sum(seg) / len(seg))
                ok = (kind == 'up' and sl > 0.012 and seg[-1] > seg[0] * 1.08) or (kind == 'down' and sl < -0.012 and seg[-1] < seg[0] * 0.92) or \
                     (kind == 'flat' and abs(sl) < 0.0012 and 0.05 < rel < 0.12 and abs(seg[-1] / seg[0] - 1) < 0.025 and abs(seg[7] / seg[0] - 1) < 0.06)
                sub = closes[s0:s0 + 14]
                if not ok or (sym, day(sub[0][0])) in used:
                    continue
                n += 1
                per_asset[sym] = per_asset.get(sym, 0) + 1
                fid = f'trend-{kind}-{n}'
                out[fid] = {'id': fid, 'symbol': sym, 'name': name, 'from': day(sub[0][0]), 'to': day(sub[-1][0]),
                            'caption': f'{name} · cierres cada 3 sesiones · {span(sub[0][0], sub[-1][0])}', 'closes': [r2(v) for v in seg]}
        print(f'trend-{kind}: {n} en total')
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)

# Activos de más solo para los lotes añadidos (auditoría RED-11 y RED-34): gráficos que el alumno no ha visto
EXTRA_ASSETS = [
    ('ASML.AS', 'ASML'), ('SAP.DE', 'SAP'), ('MC.PA', 'LVMH'), ('AIR.PA', 'Airbus'), ('SIE.DE', 'Siemens'), ('NESN.SW', 'Nestlé'),
    ('NKE', 'Nike'), ('DIS', 'Disney'), ('V', 'Visa'), ('JNJ', 'Johnson & Johnson'), ('PG', 'Procter & Gamble'), ('MCD', "McDonald's"),
    ('CABK.MC', 'CaixaBank'), ('FER.MC', 'Ferrovial'), ('AMS.MC', 'Amadeus'), ('AENA.MC', 'Aena'), ('NFLX', 'Netflix'), ('WMT', 'Walmart'),
]


# Criptos, divisas, metales e índices para el segundo lote (los ejercicios de esas clases piden ese tipo de activo)
MACRO_ASSETS = [
    ('BTC-EUR', 'Bitcoin'), ('ETH-EUR', 'Ethereum'), ('SOL-EUR', 'Solana'), ('EURUSD=X', 'EUR/USD'), ('USDJPY=X', 'USD/JPY'), ('GBPUSD=X', 'GBP/USD'),
    ('GC=F', 'Oro'), SILVER, ('HG=F', 'Cobre'), ('CL=F', 'Petróleo WTI'), ('^GSPC', 'S&P 500'), ('^IBEX', 'IBEX 35'), ('^GDAXI', 'DAX'), ('^NDX', 'Nasdaq 100'),
    ('^STOXX50E', 'Euro Stoxx 50'), ('^FTSE', 'FTSE 100'),
]


def append_lab(levels=44, per_trend=10, per_pattern=4, updown=40, assets=None, each_way=1):
    """Añade un lote de gráficos nuevos (niveles, tendencias, velas y «¿sube o baja?») sin tocar los existentes.
    Ningún tramo se solapa con otro ya guardado del mismo activo: son gráficos que el alumno no ha visto."""
    out = json.load(open(OUT))
    data = {}
    for sym, name in assets or EXTRA_ASSETS + ASSETS:
        try:
            data[sym] = (name, get(sym))
            print(f'{sym}: {len(data[sym][1])} velas')
        except Exception as e:  # noqa: BLE001
            print(f'⚠️  {sym}: {e}')
        time.sleep(0.4)
    taken = {}
    for v in out.values():
        if 'symbol' in v and 'from' in v and 'to' in v:
            taken.setdefault(v['symbol'], []).append((v['from'], v['to']))

    def iso(d):  # «25/03/2020» → «2020-03-25»
        return '-'.join(reversed(d.split('/')))

    def free(sym, a, b):
        return all(iso(b) < iso(x) or iso(a) > iso(y) for x, y in taken.get(sym, []))

    def take(sym, f):
        taken.setdefault(sym, []).append((f['from'], f['to']))

    def num(prefix):
        return max([int(k.rsplit('-', 1)[1]) for k in out if k.rsplit('-', 1)[0] == prefix] or [0])

    # Niveles (mismo criterio que main): como mucho 2 por activo
    nl, added = num('lvl'), 0
    for sym, (name, rows) in data.items():
        k = 0
        for e in range(len(rows) - 16, 60, -7):
            if added >= levels or k >= 2:
                break
            vis, fut = rows[e - 30:e], rows[e:e + 15]
            entry = vis[-1][4]
            low_i = min(range(18, 28), key=lambda j: vis[j][3])
            swing = vis[low_i][3]
            res = max(x[2] for x in vis[:18])
            atr = sum(rng(x) for x in vis[-14:]) / 14
            if not (entry - 4 * atr < swing < entry - atr and res > entry + 2 * atr and vis[-1][4] > vis[0][4]) or any(flat(x) for x in vis + fut):
                continue
            if not free(sym, day(vis[0][0]), day(fut[-1][0])):
                continue
            nl += 1; k += 1; added += 1
            fid = f'lvl-{nl}'
            out[fid] = {'id': fid, 'symbol': sym, 'name': name, 'from': day(vis[0][0]), 'to': day(fut[-1][0]),
                        'caption': f'{name} · velas diarias · {span(vis[0][0], fut[-1][0])}',
                        'candles': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in vis],
                        'future': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in fut],
                        'entry': r2(entry), 'support': r2(swing), 'resistance': r2(res), 'atr': r2(atr)}
            take(sym, out[fid])
    print(f'niveles nuevos: {added}')
    # Tendencias: una por activo y tipo
    for kind in ('up', 'down', 'flat'):
        n, added = num(f'trend-{kind}'), 0
        for sym, (name, rows) in data.items():
            closes = rows[::3]
            for s0 in range(len(closes) - 15, 0, -3):
                if added >= per_trend:
                    break
                seg = [x[4] for x in closes[s0:s0 + 14]]
                sl = slope(seg); rel = (max(seg) - min(seg)) / (sum(seg) / len(seg))
                ok = (kind == 'up' and sl > 0.012 and seg[-1] > seg[0] * 1.08) or (kind == 'down' and sl < -0.012 and seg[-1] < seg[0] * 0.92) or \
                     (kind == 'flat' and abs(sl) < 0.0012 and 0.05 < rel < 0.12 and abs(seg[-1] / seg[0] - 1) < 0.025 and abs(seg[7] / seg[0] - 1) < 0.06)
                sub = closes[s0:s0 + 14]
                if not ok or any(flat(x) for x in sub) or not free(sym, day(sub[0][0]), day(sub[-1][0])):
                    continue
                n += 1; added += 1
                fid = f'trend-{kind}-{n}'
                out[fid] = {'id': fid, 'symbol': sym, 'name': name, 'from': day(sub[0][0]), 'to': day(sub[-1][0]),
                            'caption': f'{name} · cierres cada 3 sesiones · {span(sub[0][0], sub[-1][0])}', 'closes': [r2(v) for v in seg]}
                take(sym, out[fid])
                break
        print(f'trend-{kind} nuevos: {added}')
    # Patrones de velas: uno por activo
    counts = {}
    for k, v in out.items():
        if 'target' in v:
            counts[v['target']] = counts.get(v['target'], 0) + 1
    for pid, (det, key) in PATTERNS.items():
        n, added = num(pid), 0
        for sym, (name, rows) in data.items():
            if added >= per_pattern:
                break
            for i in range(len(rows) - 3, 12, -1):
                if not det(rows, i):
                    continue
                win = pick_window(rows, i, pid, key, dict(counts))
                if not win or not free(sym, day(rows[win[0]][0]), day(rows[win[1] - 1][0])):
                    continue
                s0, e0 = win
                n += 1; added += 1
                out[f'{pid}-{n}'] = fixture(f'{pid}-{n}', sym, name, rows, s0, e0, i)
                counts[i - s0] = counts.get(i - s0, 0) + 1
                take(sym, out[f'{pid}-{n}'])
                break
        print(f'{pid} nuevos: {added}')
    # «¿Sube o baja?»: como mucho uno de cada sentido por activo
    nud, added = num('ud'), 0
    for sym, (name, rows) in data.items():
        thr = 0.08 if '-EUR' in sym else 0.012 if '=X' in sym else 0.05
        got = {'UP': 0, 'DOWN': 0}
        for e in range(len(rows) - 11, 60, -5):
            if added >= updown:
                break
            vis, fut = rows[e - 30:e], rows[e:e + 10]
            ch = fut[-1][4] / vis[-1][4] - 1
            way = 'UP' if ch > thr else 'DOWN' if ch < -thr else None
            if not way or got[way] >= each_way or any(flat(x) for x in vis + fut) or not free(sym, day(vis[0][0]), day(fut[-1][0])):
                continue
            got[way] += 1; nud += 1; added += 1
            fid = f'ud-{nud}'
            out[fid] = {'id': fid, 'symbol': sym, 'name': name, 'from': day(vis[0][0]), 'to': day(fut[-1][0]),
                        'caption': f'{name} · velas diarias · {span(vis[0][0], fut[-1][0])}',
                        'candles': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in vis],
                        'future': [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in fut], 'outcome': way, 'changePct': round(ch * 100, 1)}
            take(sym, out[fid])
    print(f'sube o baja nuevos: {added}')
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print('Guardado', len(out), 'gráficos')


SERIES = [
    # id, símbolo, nombre, intervalo, desde, hasta, formato de fecha, descripción
    ('series-sp500-monthly', '^GSPC', 'S&P 500', '1mo', '1985-01-01', '2025-12-01', '%Y-%m', 'cierres mensuales, sin dividendos'),
    ('series-crash-2008', '^GSPC', 'S&P 500', '1wk', '2007-10-01', '2013-06-30', '%d/%m/%Y', 'cierres semanales, sin dividendos'),
    ('series-crash-1929', '^GSPC', 'S&P 500', '1wk', '1929-01-01', '1954-12-31', '%d/%m/%Y', 'cierres semanales, sin dividendos'),
    ('series-dotcom', '^NDX', 'Nasdaq 100', '1wk', '1999-01-01', '2016-12-31', '%d/%m/%Y', 'cierres semanales, sin dividendos'),
    ('series-japan', '^N225', 'Nikkei 225', '1mo', '1985-01-01', '2025-12-01', '%Y-%m', 'cierres mensuales, sin dividendos'),
    ('series-covid', '^GSPC', 'S&P 500', '1d', '2020-01-02', '2020-12-31', '%d/%m/%Y', 'cierres diarios, sin dividendos'),
    ('series-btc', 'BTC-USD', 'Bitcoin', '1wk', '2021-01-01', '2024-12-31', '%d/%m/%Y', 'cierres semanales, en dólares'),
    ('series-ibex', '^IBEX', 'IBEX 35', '1mo', '2006-12-01', '2025-12-01', '%Y-%m', 'cierres mensuales, sin dividendos'),
    ('series-gold', 'GC=F', 'Oro', '1mo', '2000-01-01', '2025-12-01', '%Y-%m', 'cierres mensuales, en dólares por onza'),
    ('series-eurusd', 'EURUSD=X', 'Euro/dólar', '1mo', '2004-01-01', '2025-12-01', '%Y-%m', 'cierres mensuales, dólares por euro'),
    ('series-oil', 'CL=F', 'Petróleo WTI', '1wk', '2019-06-01', '2022-12-31', '%d/%m/%Y', 'cierres semanales, en dólares por barril'),
    ('series-tsla', 'TSLA', 'Tesla', '1wk', '2019-01-01', '2024-12-31', '%d/%m/%Y', 'cierres semanales, en dólares'),
]

# Carteras: varios activos con las mismas fechas, rentabilidad total (con dividendos y cupones reinvertidos)
MIXES = [
    ('mix-classic', '2008-01-01', '2025-12-01', [('stocks', 'SPY', 'Acciones de EE. UU. (S&P 500)'), ('bonds', 'AGG', 'Bonos de EE. UU.'), ('gold', 'GLD', 'Oro')]),
    ('mix-crypto', '2015-01-01', '2025-12-01', [('stocks', 'SPY', 'Acciones de EE. UU. (S&P 500)'), ('bonds', 'AGG', 'Bonos de EE. UU.'), ('bitcoin', 'BTC-USD', 'Bitcoin')]),
]


def get_adj(sym, start, end):
    """Cierres mensuales ajustados (dividendos incluidos) por mes AAAA-MM"""
    d = _fetch(sym, f'period1={ts(start)}&period2={ts(end) + 86400 * 31}&interval=1mo')
    tz = ZoneInfo(d['meta'].get('exchangeTimezoneName') or 'UTC')
    adj = (d['indicators'].get('adjclose') or [{}])[0].get('adjclose') or d['indicators']['quote'][0]['close']
    return {when(to_wall(t, tz)).strftime('%Y-%m'): v for t, v in zip(d['timestamp'], adj) if v is not None}


def append_mixes():
    out = json.load(open(OUT))
    for fid, start, end, assets in MIXES:
        if fid in out:
            print(f'{fid}: ya existe'); continue
        data = {}
        for key, sym, name in assets:
            data[key] = get_adj(sym, start, end)
            time.sleep(0.5)
        months = sorted(set.intersection(*[set(v) for v in data.values()]))
        out[fid] = {'id': fid, 'from': months[0], 'to': months[-1],
                    'caption': f'Rentabilidad total en dólares (dividendos y cupones incluidos) · {months[0]} a {months[-1]}',
                    'dates': months,
                    'assets': [{'key': key, 'symbol': sym, 'name': name, 'closes': [r2(data[key][m]) for m in months]} for key, sym, name in assets]}
        print(fid, len(months), [a[1] for a in assets])
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)


def series(fid, sym, name, interval, start, end, fmt, what, exact_end=False):
    """Serie larga. Las mensuales llegan justo hasta el mes de «end»; las demás conservan el mes de margen de siempre"""
    rows = get_range(sym, interval, start, end)
    last = ts(end) + (86400 if interval == '1mo' or exact_end else 86400 * 31)
    rows = [r for r in rows if r[0] < last]
    return {'id': fid, 'symbol': sym, 'name': name, 'from': day(rows[0][0]), 'to': day(rows[-1][0]),
            'caption': f'{name} · {what} · {span(rows[0][0], rows[-1][0])}',
            'dates': [when(r[0]).strftime(fmt) for r in rows], 'closes': [r2(r[4]) for r in rows]}


def append_series():
    """Series largas para las misiones del simulador (clases interactivas). Añade sin tocar lo existente."""
    out = json.load(open(OUT))
    for fid, sym, name, interval, start, end, fmt, what in SERIES:
        if fid in out:
            print(f'{fid}: ya existe'); continue
        out[fid] = series(fid, sym, name, interval, start, end, fmt, what)
        print(fid, len(out[fid]['closes']), out[fid]['caption'])
        time.sleep(0.5)
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)


# ── Reparación (auditoría, ronda 2) ───────────────────────────────────────────────────────────────────────────
# Corrige lo que ya hay en charts.json sin cambiar los datos que citan las clases:
#   1. Fechas: vuelve a descargar cada gráfico, comprueba que los valores son los mismos y solo entonces le pone
#      las fechas bien calculadas (hora de su bolsa). Si los valores no coinciden, no toca nada y lo dice.
#   2. Series del IBEX y del Nikkei: las vuelve a generar (estaban corridas un mes).
#   3. «Toca la vela»: mueve la ventana para que la vela buscada no caiga siempre en la 7.ª posición.
#   4. Velas planas (huecos de datos): cambia la ventana por otra del mismo activo y el mismo desenlace.
REGEN_SERIES = ('series-ibex', 'series-japan')


def close_to(a, b, tol=0.003):
    return abs(a - b) <= tol * max(abs(a), abs(b), 1e-9)


def same(a, b):
    return len(a) == len(b) and all(close_to(x, y) for x, y in zip(a, b))


def find_candles(rows, seq):
    """Posición en rows de una secuencia de velas [apertura, máximo, mínimo, cierre] ya guardada (o None)"""
    for j in range(len(rows) - len(seq) + 1):
        if all(close_to(rows[j + k][1 + m], seq[k][m]) for k in (0, len(seq) - 1, len(seq) // 2) for m in range(4)) and \
           all(close_to(rows[j + k][4], seq[k][3]) for k in range(len(seq))):
            return j
    return None


def find_closes(rows, seq, step):
    for j in range(len(rows) - step * (len(seq) - 1)):
        if all(close_to(rows[j + step * k][4], seq[k]) for k in range(len(seq))):
            return j
    return None


def ohlc(seg):
    return [[r2(x[1]), r2(x[2]), r2(x[3]), r2(x[4])] for x in seg]


def repair(write=True):
    out = json.load(open(OUT))
    log = []

    def relabel(fid, new, keys):
        diff = {k: (out[fid].get(k), new[k]) for k in keys if out[fid].get(k) != new[k]}
        out[fid].update({k: new[k] for k in keys})
        if diff:
            log.append(f'{fid}: ' + ' · '.join(f'{k}: {a} → {b}' for k, (a, b) in diff.items() if k != 'dates') + (' · fechas de la serie corregidas' if 'dates' in diff else ''))

    # 1) Momentos históricos
    for item in HISTORY:
        fid, iv = item[0], item[3]
        new = history(*item, legacy=True)
        time.sleep(0.4)
        if same(out[fid]['closes'], new['closes']) and same(out[fid]['futureCloses'], new['futureCloses']):
            relabel(fid, new, ('from', 'to', 'caption', 'cutDate', 'cutLabel'))
        elif realign(out[fid], item):
            relabel(fid, realign(out[fid], item), ('from', 'to', 'caption', 'cutDate', 'cutLabel'))
        else:
            # Los datos de hoy no son idénticos (Yahoo rehace a veces la última vela o las series muy antiguas):
            # se dejan los valores y las fechas como estaban y solo se añade la forma nueva de decir el corte
            d = datetime.datetime.strptime(out[fid]['cutDate'], '%d/%m/%Y')
            out[fid]['cutLabel'] = cut_label(iv, calendar.timegm(d.timetuple()))
            log.append(f'⚠️  {fid}: los valores de hoy no son idénticos a los guardados ({len(out[fid]["closes"])}+{len(out[fid]["futureCloses"])} frente a {len(new["closes"])}+{len(new["futureCloses"])}); se dejan como estaban')

    # 2) Series largas
    for item in SERIES:
        fid = item[0]
        new = series(*item)
        time.sleep(0.4)
        if fid in REGEN_SERIES:
            old = dict(zip(out[fid]['dates'], out[fid]['closes']))
            log.append(f'{fid}: regenerada · {out[fid]["dates"][0]}…{out[fid]["dates"][-1]} ({len(old)} puntos) → {new["dates"][0]}…{new["dates"][-1]} ({len(new["closes"])} puntos)')
            out[fid] = new
        elif same(out[fid]['closes'], new['closes']):
            relabel(fid, new, ('from', 'to', 'caption', 'dates'))
        else:
            log.append(f'⚠️  {fid}: los valores descargados no coinciden con los guardados ({len(out[fid]["closes"])} frente a {len(new["closes"])} puntos); no se toca')

    # 3) Gráficos diarios (velas, tendencias, «¿sube o baja?», niveles)
    by_sym = {}
    for fid, f in out.items():
        if fid.startswith(('hist-', 'series-', 'mix-')):
            continue
        by_sym.setdefault(f['symbol'], []).append(fid)
    counts = {}
    names = dict(ASSETS)
    # «Toca la vela»: solo se recolocan si alguna posición se repite demasiado (más del 30 %), como pide el validador
    targets = [f['target'] for f in out.values() if 'target' in f]
    rewindow = bool(targets) and max(targets.count(t) for t in set(targets)) > 0.3 * len(targets)
    for sym, fids in by_sym.items():
        rows = get(sym, years=5)
        time.sleep(0.4)
        for fid in fids:
            f = out[fid]
            if 'candles' in f:
                seq = f['candles'] + f.get('future', [])
                j = find_candles(rows, seq)
                if j is None:
                    log.append(f'⚠️  {fid} ({sym}): no encuentro esas velas en los datos de hoy; no se toca'); continue
                seg = rows[j:j + len(seq)]
                kind = 'velas diarias'
                if 'target' in f and not rewindow:
                    counts[f['target']] = counts.get(f['target'], 0) + 1
                elif 'target' in f:  # «toca la vela»: nueva posición
                    pid = fid.rsplit('-', 1)[0]
                    i = j + f['target']
                    win = pick_window(rows, i, pid, PATTERNS[pid][1], counts)
                    if not win:
                        log.append(f'⚠️  {fid}: no hay otra ventana válida; se queda en la posición {f["target"] + 1}'); counts[f['target']] = counts.get(f['target'], 0) + 1
                    else:
                        s0, e0 = win
                        seg = rows[s0:e0]
                        if i - s0 != f['target']:
                            log.append(f'{fid}: la vela buscada pasa de la posición {f["target"] + 1} a la {i - s0 + 1}')
                        f['candles'], f['target'] = ohlc(seg), i - s0
                elif any(flat(x) for x in seg):
                    alt = same_dates(f, *SILVER) if sym == 'SI=F' else None
                    if not alt:
                        log.append(f'⚠️  {fid} ({sym}): tiene velas planas y no hay otra ventana equivalente; no se toca'); continue
                    log.append(f'{fid}: velas planas · {sym} {f["from"]}–{f["to"]} → {alt["symbol"]} {alt["from"]}–{alt["to"]}' + (f' · {f["changePct"]} % → {alt["changePct"]} %' if 'changePct' in f else f' · entrada {f["entry"]} → {alt["entry"]}'))
                    f.update(alt)
                    continue
            else:
                j = find_closes(rows, f['closes'], 3)
                if j is None:
                    log.append(f'⚠️  {fid} ({sym}): no encuentro esos cierres en los datos de hoy; no se toca'); continue
                seg = rows[j:j + 3 * (len(f['closes']) - 1) + 1]
                kind = 'cierres cada 3 sesiones'
            relabel(fid, {'from': day(seg[0][0]), 'to': day(seg[-1][0]), 'caption': f'{f.get("name") or names.get(sym, sym)} · {kind} · {span(seg[0][0], seg[-1][0])}'}, ('from', 'to', 'caption'))
    print('\n'.join(log))
    print('Posición de la vela buscada (0 = primera):', dict(sorted(counts.items())))
    if write:
        json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
        print('Guardado', os.path.relpath(OUT), len(out), 'gráficos')
    else:
        print('(simulacro: no se ha guardado nada)')


def realign(f, item):
    """Fechas de un momento histórico guardado, buscando sus mismos cierres en los datos de hoy (por si el borde
    del tramo ya no cae igual). Devuelve las etiquetas nuevas, o None si los cierres no aparecen."""
    fid, sym, name, iv, a, cut, b = item
    rows = get_range(sym, iv, a, b)
    per = {'1d': 'cierres diarios', '1wk': 'cierres semanales', '1mo': 'cierres mensuales'}[iv]
    for sv in (1, 2, 3):
        o = find_closes(rows, f['closes'], sv)
        if o is None:
            continue
        cut_i = max(k for k, x in enumerate(rows) if x[0] <= ts(cut) + 86400 * 3)
        for sf in (1, 2, 3):
            if all(cut_i + 1 + sf * k < len(rows) and close_to(rows[cut_i + 1 + sf * k][4], v) for k, v in enumerate(f['futureCloses'])):
                last = cut_i + 1 + sf * (len(f['futureCloses']) - 1)  # la vela del último punto guardado
                return {'from': day(rows[o][0]), 'to': day(rows[last][0]), 'caption': f'{name} · {per} · {span(rows[o][0], rows[last][0])}',
                        'cutDate': day(rows[cut_i][0]), 'cutLabel': cut_label(iv, rows[cut_i][0])}
    return None


_alt_rows = {}


def same_dates(f, sym, name):
    """El mismo tramo de fechas con otro activo equivalente (misma materia prima), si allí no hay velas planas y
    el ejercicio sigue siendo el mismo: mismo sentido en «¿sube o baja?», mismas condiciones en los niveles"""
    if sym not in _alt_rows:
        _alt_rows[sym] = get(sym, years=5)
    rows = _alt_rows[sym]
    start = calendar.timegm(datetime.datetime.strptime(f['from'], '%d/%m/%Y').timetuple())
    nv, nf = len(f['candles']), len(f['future'])
    # se prueba la misma fecha de inicio y las sesiones de alrededor (los festivos de Londres y Nueva York no coinciden)
    j0 = next((k for k, x in enumerate(rows) if x[0] >= start), None)
    if j0 is None:
        return None
    for j in sorted(range(max(0, j0 - 3), j0 + 4), key=lambda k: abs(k - j0)):
        vis, fut = rows[j:j + nv], rows[j + nv:j + nv + nf]
        if len(fut) < nf or any(flat(x) for x in vis + fut):
            continue
        base = {'symbol': sym, 'name': name, 'from': day(vis[0][0]), 'to': day(fut[-1][0]), 'caption': f'{name} · velas diarias · {span(vis[0][0], fut[-1][0])}',
                'candles': ohlc(vis), 'future': ohlc(fut)}
        if 'outcome' in f:
            ch = fut[-1][4] / vis[-1][4] - 1
            if abs(ch) > 0.05 and (ch > 0) == (f['outcome'] == 'UP'):
                return {**base, 'outcome': f['outcome'], 'changePct': round(ch * 100, 1)}
        else:
            entry = vis[-1][4]
            swing = vis[min(range(18, 28), key=lambda k: vis[k][3])][3]
            res = max(x[2] for x in vis[:18])
            atr = sum(rng(x) for x in vis[-14:]) / 14
            if entry - 4 * atr < swing < entry - atr and res > entry + 2 * atr and vis[-1][4] > vis[0][4]:
                return {**base, 'entry': r2(entry), 'support': r2(swing), 'resistance': r2(res), 'atr': r2(atr)}
    return None


if __name__ == '__main__':
    import sys
    if '--repair' in sys.argv:
        repair(write='--dry' not in sys.argv)
    elif '--append-series' in sys.argv:
        append_series(), append_mixes()
    elif '--append-trends' in sys.argv:
        append_trends()
    elif '--append-lab' in sys.argv:
        append_lab()
    elif '--append-lab-macro' in sys.argv:
        append_lab(levels=16, per_trend=4, per_pattern=0, updown=48, assets=MACRO_ASSETS, each_way=2)
    else:
        main()
