#!/bin/bash
# Prueba HTTP del área de Mercado (local, v2_dev): datos de empresa, ideas, seguir, órdenes y alertas.
BASE=${1:-http://localhost:3100}; J=$(mktemp); B=$BASE/api
case "$BASE" in http://localhost*|http://127.0.0.1*) ;; *) echo "Solo en local"; exit 1 ;; esac
c() { curl -s -b $J -c $J -H 'content-type: application/json' -H "origin: $BASE" "$@"; }
py() { python3 -c "import sys,json; d=json.load(sys.stdin); $1"; }
E="qa-market-${2:-1}@ejemplo.com"
c -X POST $B/auth/sign-up/email -d "{\"email\":\"$E\",\"password\":\"prueba1234\",\"name\":\"\"}" -o /dev/null -w "registro %{http_code}\n"
c -X PUT $B/onboarding -d '{"step":1,"patch":{"name":"QA Mercado","gender":"N","birthDate":"2000-01-01"}}' -o /dev/null -w "bienvenida 1 %{http_code}\n"
c -X PUT $B/onboarding -d '{"step":5,"patch":{"skinId":"grafito","disclaimerAccepted":true}}' -o /dev/null -w "bienvenida 5 %{http_code}\n"
c -X POST $B/onboarding/complete -o /dev/null -w "bienvenida fin %{http_code}\n"
echo "── Datos de empresa"
for s in SAN.MC AAPL TEF.MC IWDA.AS BTC-EUR; do c $B/market/assets/$s/fundamentals -w " [%{http_code} %{time_total}s]\n" | cut -c1-220; done
echo "── Ideas"
c $B/market/ideas | py "
for l in d['lists']: print(' ', l['id'], l['asOf'], l['lessonId'], len(l['items']), [i['asset']['ticker'] for i in l['items'][:4]])"
S=$(c $B/market/ideas | py "print(d['lists'][3]['items'][0]['asset']['symbol'])")
c -X POST $B/watchlist/$S | py "print('  seguir $S →', '$S' in d)"
c $B/watchlist | py "print('  favoritos', d)"
c -X POST $B/watchlist/$S | py "print('  dejar de seguir $S →', '$S' not in d)"
echo "── Páginas (SSR)"
for p in /es/mercado /es/mercado/ideas /ca/mercado/ideas /en/mercado/ideas /es/mercado/SAN.MC /es/mercado/cartera /es/mercado/ordenes /es/mercado/explorar; do c "$BASE$p" -o /dev/null -w "  $p %{http_code} %{time_total}s\n"; done
echo "── Órdenes (compra y venta a mercado; límite y stop están bloqueados hasta la clase del stop loss) y alertas"
echo "── HTML de las páginas nuevas (textos traducidos, sin claves sueltas)"
for p in /es/mercado /ca/mercado /en/mercado /es/mercado/ideas /ca/mercado/ideas /en/mercado/ideas; do H=$(c "$BASE$p"); echo "  $p · claves sin traducir: $(echo "$H" | grep -o 'market2\.[a-zA-Z.]*' | sort -u | head -3 | tr '\n' ' ') · $(echo "$H" | grep -o -E 'Bolsas abiertas ahora|Borses obertes ara|Markets open now|Ideas para estudiar|Idees per estudiar|Ideas to study' | sort -u | tr '\n' ',')"; done
c -X POST $B/orders -H "idempotency-key: k-$RANDOM" -d '{"symbol":"BTC-EUR","side":"BUY","type":"MARKET","amount":"300"}' | py "print('  compra BTC', d.get('order',{}).get('status'), d.get('error'))"
c -X POST $B/orders -H "idempotency-key: k-$RANDOM" -d '{"symbol":"SAN.MC","side":"BUY","type":"LIMIT","amount":"200","triggerPrice":"1"}' | py "print('  límite SAN', d.get('order',{}).get('status'), d.get('error'))"
c $B/orders | py "print('  pendientes', [(o['type'], o['side'], o['symbol']) for o in d])"
O=$(c $B/orders | py "print(next((o['id'] for o in d if o['type']=='LIMIT'), ''))")
[ -n "$O" ] && c -X DELETE $B/orders/$O -o /dev/null -w "  cancelar límite %{http_code}\n"
c -X POST $B/orders -H "idempotency-key: k-$RANDOM" -d '{"symbol":"BTC-EUR","side":"SELL","type":"MARKET","qty":"0.0001"}' | py "print('  venta BTC', d.get('order',{}).get('status'), d.get('error'))"
c -X POST $B/alerts -d '{"symbol":"SAN.MC","condition":"BELOW","price":"1"}' -o /dev/null -w "  alerta %{http_code}\n"
c $B/alerts | py "print('  alertas', [(a['symbol'], a['condition'], a['price']) for a in d])"
c -X POST $B/orders/preview -d '{"symbol":"<script>","side":"BUY","type":"MARKET","amount":"10"}' -w " [preview raro %{http_code}]\n" | cut -c1-160
c -X DELETE $B/me -o /dev/null -w "borrar cuenta %{http_code}\n"
rm -f $J
