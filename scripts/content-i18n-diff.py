# Lista las claves cuyo texto en castellano ha cambiado respecto al último commit, con su traducción actual (ca, en).
# Uso (desde la raíz del repo): python3 scripts/content-i18n-diff.py [--pending]   (--pending: solo las que aún no se han tocado en ca/en)
import json, subprocess, sys, glob, os
D = 'src/server/content/v2/i18n'
def walk(o, path=''):
    if isinstance(o, str): yield path, o
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, f'{path}[{i}]')
    elif isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, f'{path}.{k}' if path else k)
def head(p):
    try: return json.loads(subprocess.check_output(['git', 'show', f'HEAD:{p}'], stderr=subprocess.DEVNULL))
    except Exception: return {}
pending = '--pending' in sys.argv
for f in sorted(glob.glob(f'{D}/es/*.json')):
    u = os.path.basename(f)
    o, n = dict(walk(head(f))), dict(walk(json.load(open(f))))
    ch = [k for k in n if o.get(k) != n[k]]
    if not ch: continue
    cur = {l: dict(walk(json.load(open(f'{D}/{l}/{u}')))) for l in ('ca', 'en')}
    old = {l: dict(walk(head(f'{D}/{l}/{u}'))) for l in ('ca', 'en')}
    for k in ch:
        if pending and all(cur[l].get(k) != old[l].get(k) for l in ('ca', 'en')): continue
        print(f'## {u[:-5]} {k}\nES: {n[k]}\nCA: {cur["ca"].get(k)}\nEN: {cur["en"].get(k)}\n')
