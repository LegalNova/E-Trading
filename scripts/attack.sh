#!/bin/bash
# Pruebas de ataque contra E-Trading. Uso: attack.sh <base-url>
BASE=${1:-http://localhost:3100}; B=$BASE/api; O="origin: $BASE"
pass=0; failn=0
ok() { echo "  ✅ $1"; pass=$((pass+1)); }
ko() { echo "  ❌ $1"; failn=$((failn+1)); }
new_user() { # $1 jar, $2 birth
  local J=$1; rm -f $J; local E="atk-$RANDOM$RANDOM@ejemplo.com"
  curl -s -c $J -b $J -H 'content-type: application/json' -H "$O" -X POST $B/auth/sign-up/email -d "{\"email\":\"$E\",\"password\":\"prueba1234\",\"name\":\"\"}" -o /dev/null
  curl -s -c $J -b $J -H 'content-type: application/json' -H "$O" -X PUT $B/onboarding -d "{\"step\":1,\"patch\":{\"name\":\"Ana Test\",\"gender\":\"F\",\"birthDate\":\"${2:-1995-01-01}\",\"disclaimerAccepted\":true}}" -o /dev/null
  curl -s -c $J -b $J -H "$O" -X POST $B/onboarding/complete -o /dev/null
}
c() { local J=$1; shift; curl -s -b $J -c $J -H 'content-type: application/json' -H "$O" "$@"; }
J=$(mktemp); J2=$(mktemp); T=$(mktemp -d)

echo "1. Compras simultáneas (10 × 2.500 € con 10.000 €)"
new_user $J
for i in $(seq 1 10); do c $J -X POST $B/orders -H "idempotency-key: r$i" -d '{"symbol":"BTC","side":"BUY","type":"MARKET","amount":"2500"}' -o $T/r$i.json & done; wait
filled=$(cat $T/r*.json | grep -o '"status":"FILLED"' | wc -l | tr -d ' ')
cash=$(c $J $B/portfolio | python3 -c "import sys,json; print(json.load(sys.stdin)['cash'])")
[ "$filled" -le 3 ] && python3 -c "import sys; sys.exit(0 if float('$cash')>=0 else 1)" && ok "solo $filled ejecutadas, efectivo $cash € (nunca negativo)" || ko "ejecutadas $filled, efectivo $cash"
rm -f $T/r*.json

echo "2. Abrir una lección bloqueada desde la URL"
code=$(c $J $B/lessons/u3l3 -o /dev/null -w "%{http_code}"); [ "$code" = 403 ] && ok "u3l3 → 403" || ko "u3l3 → $code"
code=$(c $J -X POST $B/quiz/u3l3/start -o /dev/null -w "%{http_code}"); [ "$code" = 403 ] && ok "quiz de u3l3 → 403" || ko "quiz u3l3 → $code"

echo "3. Repetir el mismo quiz para granjear XP"
xps=""
for i in 1 2 3 4; do
  A=$(c $J -X POST $B/quiz/u1l1/start | python3 -c "import sys,json; print(json.load(sys.stdin).get('attemptId',''))")
  for q in "u1l1-1:0" "u1l1-2:1" "u1l1-3:1"; do c $J -X POST $B/quiz/attempts/$A/answer -d "{\"questionId\":\"${q%%:*}\",\"answer\":${q##*:},\"elapsedMs\":1}" -o /dev/null; done
  xps="$xps $(c $J -X POST $B/quiz/attempts/$A/finish | python3 -c "import sys,json; print(json.load(sys.stdin)['xpBreakdown']['total'])")"
done
last=$(echo $xps | awk '{print $NF}'); [ "$last" = 0 ] && ok "XP por intento:$xps (a partir del 3.º, 0)" || ko "XP por intento:$xps"

echo "4. Test de nivel dos veces"
c $J -X POST $B/quiz/placement/start -o /dev/null; code=$(c $J -X POST $B/quiz/placement/start -o /dev/null -w "%{http_code}")
A=$(c $J -X POST $B/quiz/placement/start | python3 -c "import sys,json; print(json.load(sys.stdin).get('attemptId',''))")
[ -z "$A" ] && ok "segunda vez rechazada" || echo "  ℹ️ el primer intento sigue abierto hasta terminarlo ($code)"

echo "5. Premium gratis repetido"
c $J -X POST $B/billing/checkout -d '{"planId":"premium-year"}' -o /dev/null; c $J -X POST $B/billing/cancel -o /dev/null
code=$(c $J -X POST $B/billing/checkout -d '{"planId":"premium-year"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',{}).get('code'))")
[ "$code" = TRIAL_USED ] && ok "segunda prueba → TRIAL_USED" || ko "segunda prueba → $code"

echo "6. Menor de edad contratando Premium"
new_user $J2 2010-03-03
code=$(c $J2 -X POST $B/billing/checkout -d '{"planId":"premium-month"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',{}).get('code'))")
[ "$code" = GUARDIAN_CONSENT_REQUIRED ] && ok "16 años → GUARDIAN_CONSENT_REQUIRED" || ko "menor → $code"

echo "7. Menor de 14 en el registro"
code=$(c $J2 -X PUT $B/onboarding -d '{"step":1,"patch":{"birthDate":"2016-01-01"}}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',{}).get('code'))")
[ "$code" = UNDER_MIN_AGE ] && ok "10 años → UNDER_MIN_AGE" || ko "→ $code"

echo "8. CSRF: petición desde otra web"
code=$(curl -s -b $J -H 'content-type: application/json' -H 'origin: https://evil.example' -X POST $B/orders -d '{"symbol":"BTC","side":"BUY","type":"MARKET","amount":"10"}' -o /dev/null -w "%{http_code}")
[ "$code" = 403 ] && ok "origen ajeno → 403" || ko "origen ajeno → $code"

echo "9. Clave antiduplicados de otro usuario"
o1=$(c $J -X POST $B/orders -H 'idempotency-key: compartida' -d '{"symbol":"ETH","side":"BUY","type":"MARKET","amount":"20"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['order']['id'])")
o2=$(c $J2 -X POST $B/orders -H 'idempotency-key: compartida' -d '{"symbol":"ETH","side":"BUY","type":"MARKET","amount":"20"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['order']['id'])")
[ "$o1" != "$o2" ] && ok "cada usuario recibe su propia orden" || ko "¡devolvió la orden de otro! $o1"

echo "10. Stop loss sin haber hecho la lección"
code=$(c $J2 -X POST $B/orders -d '{"symbol":"ETH","side":"SELL","type":"STOP_LOSS","qty":"0.001","triggerPrice":"100"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',{}).get('code'))")
[ "$code" = FEATURE_LOCKED ] && ok "→ FEATURE_LOCKED" || ko "→ $code"

echo "11. Admin registrándose con el email de admin (sin verificar)"
c $J2 -X DELETE $B/me -o /dev/null; rm -f $J2; E=jvidalalmirall@gmail.com
curl -s -c $J2 -b $J2 -H 'content-type: application/json' -H "$O" -X POST $B/auth/sign-up/email -d "{\"email\":\"$E\",\"password\":\"prueba1234\",\"name\":\"\"}" -o /dev/null
adm=$(c $J2 $B/session | python3 -c "import sys,json; print(json.load(sys.stdin).get('isAdmin'))"); code=$(c $J2 $B/admin/metrics -o /dev/null -w "%{http_code}")
[ "$adm" = False ] && [ "$code" = 403 ] && ok "no es admin (403)" || ko "isAdmin=$adm admin=$code"
c $J2 -X DELETE $B/me -o /dev/null

echo "12. Contraseña sin números"
code=$(curl -s -H 'content-type: application/json' -H "$O" -X POST $B/auth/sign-up/email -d '{"email":"nonum@ejemplo.com","password":"abcdefghij","name":""}' -o /dev/null -w "%{http_code}")
[ "$code" = 400 ] && ok "→ 400" || ko "→ $code"

echo "13. Petición enorme"
big=$(python3 -c "print('{\"name\":\"' + 'x'*40000 + '\"}')")
code=$(c $J -X PATCH $B/me/settings -d "$big" -o /dev/null -w "%{http_code}"); [ "$code" = 413 ] && ok "→ 413" || ko "→ $code"

echo "14. Spam en la lista de espera (6 seguidas)"
for i in 1 2 3 4 5 6; do code=$(curl -s -H 'content-type: application/json' -H "$O" -X POST $B/waitlist -d "{\"email\":\"spam$i-$RANDOM@ejemplo.com\"}" -o /dev/null -w "%{http_code}"); done
[ "$code" = 429 ] && ok "la 6.ª → 429" || ko "la 6.ª → $code"

echo "15. Tarea programada sin clave"
code=$(curl -s $B/cron/tick -o /dev/null -w "%{http_code}"); [ "$code" = 401 ] && ok "→ 401" || ko "→ $code"

c $J -X DELETE $B/me -o /dev/null
echo; echo "Resultado: $pass superadas, $failn fallidas"
