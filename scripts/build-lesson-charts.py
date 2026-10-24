#!/usr/bin/env python3
"""Gráficos de las lecciones con DATOS REALES (regla F1: nunca inventar precios).

Descarga velas diarias de Yahoo Finance de varios activos, busca de forma automática
ejemplos reales de cada patrón (martillo, doji, envolventes, tendencias…) y guarda
ventanas cortas en src/server/content/charts.json, con el activo y las fechas.

Uso:  python3 -I scripts/build-lesson-charts.py
"""
import json, os, time, urllib.request, datetime

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'server', 'content', 'charts.json')
UA = {'User-Agent': 'E-Trading-edu-lesson-charts/1.0'}
ASSETS = [
    ('AAPL', 'Apple'), ('MSFT', 'Microsoft'), ('NVDA', 'NVIDIA'), ('AMZN', 'Amazon'), ('KO', 'Coca-Cola'),
    ('SAN.MC', 'Banco Santander'), ('ITX.MC', 'Inditex'), ('IBE.MC', 'Iberdrola'), ('BBVA.MC', 'BBVA'),
    ('^GSPC', 'S&P 500'), ('^IBEX', 'IBEX 35'), ('^GDAXI', 'DAX'), ('BTC-EUR', 'Bitcoin'), ('EURUSD=X', 'EUR/USD'), ('GC=F', 'Oro'),
]


def get(sym):
    q = urllib.parse.quote(sym, safe='')
    for host in ('query1', 'query2'):
        try:
            url = f'https://{host}.finance.yahoo.com/v8/finance/chart/{q}?range=3y&interval=1d'
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
                d = json.load(r)['chart']['result'][0]
            t = d['timestamp']
            o, h, l, c = (d['indicators']['quote'][0][k] for k in ('open', 'high', 'low', 'close'))
            rows = [(t[i], o[i], h[i], l[i], c[i]) for i in range(len(t)) if None not in (o[i], h[i], l[i], c[i])]
            return rows
        except Exception as e:  # noqa: BLE001
            err = e
    raise err


import urllib.parse  # noqa: E402


def r2(v):
    return float(f'{v:.4g}') if abs(v) < 10 else round(v, 2)


def day(ts):
    return datetime.datetime.utcfromtimestamp(ts).strftime('%d/%m/%Y')


MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def span(a, b):
    da, db = datetime.datetime.utcfromtimestamp(a), datetime.datetime.utcfromtimestamp(b)
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


def window(rows, i, before=6):
    s = max(0, i - before); e = min(len(rows), s + W)
    s = e - W
    return s, e


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
    # Patrones de velas: hasta 3 ejemplos de cada uno, de activos distintos
    for pid, (det, key) in PATTERNS.items():
        n = 0
        for sym, (name, rows) in data.items():
            if n >= 3:
                break
            for i in range(len(rows) - 3, 12, -1):
                if not det(rows, i):
                    continue
                s, e = window(rows, i)
                if key and not unique_in_window(rows, s, e, i, key):
                    continue
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
                if ok:
                    sub = closes[s:s + 14]
                    out[f'trend-{kind}-{n + 1}'] = {'id': f'trend-{kind}-{n + 1}', 'symbol': sym, 'name': name, 'from': day(sub[0][0]), 'to': day(sub[-1][0]),
                                                  'caption': f'{name} · cierres cada 3 sesiones · {span(sub[0][0], sub[-1][0])}', 'closes': [r2(v) for v in seg]}
                    n += 1
                    break
        print(f'trend-{kind}: {n} ejemplos')
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print('Guardado', os.path.relpath(OUT), len(out), 'gráficos')


if __name__ == '__main__':
    main()
