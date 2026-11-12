# Cuando cambia el enunciado de una pregunta, el motor rebaraja sus opciones (la semilla es el enunciado).
# Las traducciones van por posición: este script aplica a ca/ y en/ la misma permutación que ha sufrido es/
# en las listas `options`, `feedback` y `right` de cada pregunta (solo si el contenido en castellano es el mismo
# y solo ha cambiado el orden). Uso, desde la raíz del repo y tras `content-i18n.ts export`: python3 scripts/content-i18n-reorder.py
import json, subprocess, glob, os
D = 'src/server/content/v2/i18n'
def head(p):
    try: return json.loads(subprocess.check_output(['git', 'show', f'HEAD:{p}'], stderr=subprocess.DEVNULL))
    except Exception: return None
n = 0
for f in sorted(glob.glob(f'{D}/es/*.json')):
    u = os.path.basename(f)
    old, new = head(f), json.load(open(f))
    if not old or 'questions' not in new: continue
    tr = {l: json.load(open(f'{D}/{l}/{u}')) for l in ('ca', 'en')}
    trh = {l: head(f'{D}/{l}/{u}') for l in ('ca', 'en')}
    touched = False
    for qid, q in new['questions'].items():
        o = old.get('questions', {}).get(qid)
        if not o: continue
        for field in ('options', 'right'):
            a, b = o.get(field), q.get(field)
            if not a or not b or a == b or sorted(a) != sorted(b) or len(set(a)) != len(a): continue
            perm = [a.index(x) for x in b]            # nueva posición i ← antigua perm[i]
            for l in ('ca', 'en'):
                tq, hq = tr[l]['questions'].get(qid), (trh[l] or {}).get('questions', {}).get(qid)
                if not tq or not hq or tq.get(field) != hq.get(field): continue   # ya tocada a mano
                tq[field] = [hq[field][i] for i in perm]
                if field == 'options' and hq.get('feedback') and len(hq['feedback']) == len(perm): tq['feedback'] = [hq['feedback'][i] for i in perm]
                touched = True
            n += 1
            print(f'{u[:-5]} {qid}.{field}: {perm}')
    if touched:
        for l in ('ca', 'en'):
            json.dump(tr[l], open(f'{D}/{l}/{u}', 'w'), ensure_ascii=False, indent=1); open(f'{D}/{l}/{u}', 'a').write('\n')
print(n, 'listas reordenadas')
