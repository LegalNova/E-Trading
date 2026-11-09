#!/bin/bash
# Pasa E-Trading a cobros reales con Stripe. Lo ejecuta Joan: pega la clave secreta REAL (sk_live_…) y no se muestra.
#  1. Crea en la cuenta real los productos, precios, portales del cliente y el aviso (webhook) → scripts/stripe-setup.ts
#  2. Guarda la clave y el secreto del aviso en Vercel (solo producción de e-trading-app)
# Nada se escribe en .env.local (allí sigue la clave de prueba) ni se imprime ninguna clave.
set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT=prj_PSaejG3PYxmPfgCteKnSnVRslmcH

echo
echo "Pega la clave secreta REAL de Stripe (empieza por sk_live_) y pulsa Enter."
echo "(No se verá nada mientras la pegas: es normal.)"
read -rs KEY
echo
if [[ ! "$KEY" =~ ^(sk|rk)_live_[A-Za-z0-9]{20,}$ ]]; then
  echo "Esa no parece una clave real de Stripe (sk_live_…). No he cambiado nada."
  exit 1
fi

TMP="$(mktemp -d)"
chmod 700 "$TMP"
trap 'rm -rf "$TMP"' EXIT

echo "1/2 Preparando productos, precios, portal y aviso en tu cuenta real de Stripe…"
STRIPE_SECRET_KEY="$KEY" STRIPE_ENV_FILE="$TMP/live.env" APP_URL="https://e-trading-app.vercel.app" \
  npx tsx scripts/stripe-setup.ts --live --create-webhook
WHSEC="$(grep -E '^STRIPE_WEBHOOK_SECRET=' "$TMP/live.env" 2>/dev/null | cut -d= -f2- || true)"
if [[ -z "$WHSEC" ]]; then
  echo "No se ha podido crear el aviso (webhook). No he tocado Vercel. Avisa a Claude."
  exit 1
fi

echo "2/2 Guardando las claves en Vercel (producción)…"
for NAME in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET; do
  if [[ "$NAME" == STRIPE_SECRET_KEY ]]; then VALUE="$KEY"; else VALUE="$WHSEC"; fi
  NAME="$NAME" VALUE="$VALUE" node -e 'process.stdout.write(JSON.stringify({ key: process.env.NAME, value: process.env.VALUE, type: "encrypted", target: ["production"] }))' > "$TMP/body.json"
  vercel api "/v10/projects/$PROJECT/env?upsert=true" -X POST --input "$TMP/body.json" --silent
  rm -f "$TMP/body.json"
done

echo
echo "Listo. Dile a Claude: «hecho». Él publica la app con los cobros reales y lo comprueba."
