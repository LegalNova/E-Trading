#!/bin/bash
BASE=${1:-http://localhost:3100}; J=$(mktemp); B=$BASE/api
c() { curl -s -b $J -c $J -H 'content-type: application/json' -H "origin: $BASE" "$@"; }
py() { python3 -c "import sys,json; d=json.load(sys.stdin); $1"; }
E="e2e-$RANDOM@ejemplo.com"
c -X POST $B/auth/sign-up/email -d "{\"email\":\"$E\",\"password\":\"prueba1234\",\"name\":\"\"}" -o /dev/null -w "signup %{http_code}\n"
c $B/session; echo
c -X PUT $B/onboarding -d '{"step":1,"patch":{"name":"Marta Ruiz","gender":"F","birthDate":"2001-05-09"}}' -o /dev/null -w "onb1 %{http_code}\n"
c -X PUT $B/onboarding -d '{"step":5,"patch":{"skinId":"grafito","disclaimerAccepted":true}}' -o /dev/null -w "onb5 %{http_code}\n"
c -X POST $B/onboarding/complete -o /dev/null -w "complete %{http_code}\n"
c $B/home | py "print('HOME', d['user'], d['nextLesson']['title'], d['portfolio']['totalValue'], '|', d['companion']['message'])"
c $B/lessons/u1l1 | py "print('LECCION', d['title'], len(d['steps']), 'pasos')"
A=$(c -X POST $B/quiz/u1l1/start | py "print(d['attemptId']); print(len(d['questions']), 'preguntas · vidas', d['lives']['current'], ' · ¿soluciones en la respuesta?', 'solution' in json.dumps(d), file=sys.stderr)")
for q in "u1l1-1:0" "u1l1-2:1" "u1l1-3:2"; do id=${q%%:*}; a=${q##*:}; c -X POST $B/quiz/attempts/$A/answer -d "{\"questionId\":\"$id\",\"answer\":$a,\"elapsedMs\":4000}" | py "print('  ', '$id', 'correcta' if d['correct'] else 'fallo', 'vidas', d['livesLeft'])"; done
c -X POST $B/quiz/attempts/$A/finish | py "print('FIN', d['correct'],'/',d['total'], 'estrellas', d['stars'], 'XP', d['xp'], 'racha', d['streak'], 'logros', [a['code'] for a in d['achievementsUnlocked']], 'objetivos', d['goalsCompleted'])"
c -X POST $B/orders/preview -d '{"symbol":"AAPL","side":"BUY","type":"MARKET","amount":"500"}' | py "print('PREVIEW AAPL 500€ → qty', d['qty'], 'comisión', d['fee'], 'peso', round(d['weightPct'],1), 'riesgo', d['risk']['flagged'])"
c -X POST $B/orders -H "idempotency-key: k-$RANDOM" -d '{"symbol":"BTC","side":"BUY","type":"MARKET","amount":"300"}' | py "print('ORDEN BTC', d['order']['status'], d['order']['fillPrice'], 'XP', d['xp'], d.get('companion',{}).get('message'))"
c -X POST $B/orders -d '{"symbol":"AAPL","side":"SELL","type":"STOP_LOSS","qty":"1","triggerPrice":"300"}' | py "print('STOP (bloqueado):', d)"
c $B/portfolio | py "print('CARTERA', d['totalValue'], 'efectivo', d['cash'], [ (p['symbol'], p['qty']) for p in d['positions']])"
c $B/league/current | py "print('LIGA', d['division']['name'], [(m['rank'], m['displayName'], m['weeklyXp']) for m in d['members']][:5])"
c $B/achievements | py "print('LOGROS', sum(a['unlocked'] for a in d), '/', len(d))"
c $B/streak | py "print('RACHA', d['current'], 'hoy', d['todayDone'])"
c $B/me | py "print('YO', d['name'], d['level'], d['gems'], 'gemas')"
c $B/admin/metrics -o /dev/null -w "admin (no admin) %{http_code}\n"
c -X DELETE $B/me -o /dev/null -w "borrar cuenta %{http_code}\n"
c $B/session; echo
