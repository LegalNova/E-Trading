# Encargo: rehacer clases como clases interactivas

Proyecto: E-Trading, una app para aprender a invertir (público de 16 a 35 años). Código en `/Users/joanvidalalmirall/easytrading`.

Lee antes estos tres sitios:

- `docs/curso-v2/05-clases-interactivas.md`: el modelo.
- `src/server/content/v2/u01.ts` a `u04.ts`: la sección 1 ya rehecha, que es la referencia de calidad y de estilo.
- `src/shared/play.ts`: el esquema exacto de cada pieza.

## Lo que pide el dueño de la app (obligatorio)

- **Adictivo y rápido:** «pum, pum, pum». Poca lectura, decisiones de un toque y retos cortos.
- **Nada de calculadora:** el alumno no tiene que salir de la app ni hacer cuentas a mano. Las piezas calculan solas. En las predicciones, las opciones se distinguen razonando, no con decimales.
- **Profesional: ningún emoji.** Ni en los textos de Lumi, ni en historias, ni en títulos. En las piezas, los objetos llevan `icon`, una clave del catálogo `src/shared/glyphs.ts` (por ejemplo `'bank'`, `'card'`, `'chart'`, `'bitcoin'`). Los personajes de las historias son `{ id, name }`, sin icono: se dibujan con sus iniciales.

## Qué hacer en cada lección de tus unidades

Repasos y retos finales no cuentan como lecciones.

1. **Pantallas de teoría:** sustituye los `text`, `key`, `calc` e `image` por **2-3 pantallas interactivas** y, como mucho, **una** `key` final para fijar la idea:
   - `story(...)`: chat con una decisión y sus consecuencias. Lumi explica.
   - `play({...})`: pieza para tocar, con `predict` antes cuando ayude, un `goal` alcanzable y `insight`.
   - `mission({...})`: lo mismo, pero el reto es lo central; úsala sobre todo con datos reales.
   - `chart('id', prompt, ok, ko)`: tocar una vela real (ya existía). Úsala en velas y figuras.
2. **El orden:** primero se hace y luego se entiende. La idea se nombra en `insight` cuando ya se ha visto.
3. **Contenido que se conserva:** los conceptos y las cifras del texto actual (ya revisados) pasan a historias, predicciones, `insight` y `key`. No pierdas contenido importante.
4. **El quiz:** NO cambies ni una letra de las preguntas existentes. El orden de sus opciones y sus traducciones dependen del texto. Para aligerarlo, retira las que la clase ya practica con `lesson(..., { retire: [índices desde 0] })`. Si la lección ya tiene opciones, añade `retire` a ellas y conserva `source`. Deja **5-8 preguntas**, de al menos 3 tipos y con al menos una dinámica (no test ni verdadero/falso). Quita primero las de verdadero/falso, las rápidas (`timed`) y las que repiten la historia.
5. **Duración:** añade `minutes: 6` a las opciones de la lección.

### Medidas

- `intro`: 1-2 frases.
- `insight`: 1-2 frases con **negrita** en la idea clave.
- Frases de Lumi: 15 palabras como mucho.
- Historias: 4-8 mensajes, con 1 elección de 3 opciones (una `good`, y `ok`/`bad`).
- Mensajes de los personajes: cortos y naturales, como en un chat.
- Lumi en las piezas: 2-4 frases con condición más una por defecto, la última y sin `when`. Usa `mood`: `HAPPY`, `CELEBRATE`, `WORRIED`, `CALM`, `SAD` o `THINKING`.

### Las cifras

Toda cifra que cites (en `predict.why`, `insight`, historias) tiene que salir de la pieza con esos parámetros, o del texto ya existente de la lección. Compruébalas con las funciones de `src/client/play/math.ts`, por ejemplo con un script de `npx tsx`. **Nunca inventes precios ni datos de mercado (regla F1).** Las piezas con datos reales usan series de `src/server/content/charts.json`.

## Las piezas (`widget`)

Copia la forma exacta de `src/shared/play.ts`. Entre paréntesis, las métricas que puedes usar en `goal.when` y en `lumi[].when` mediante `when('métrica', op, valor)`.

### Dinero y ahorro

- `basket` (years, rate, items, itemsPct, lost)
- `growth` (final, contributed, gain, multiple, years, monthly, rate, initial, simpleFinal, mattressFinal). Usa `lines` y `controls`.
- `race` (bAge, delay, ratio, aFinal, bFinal, aPut, bPut)
- `doubling` (rate, years, rule, doublings40)
- `realrate` (nominal, inflation, real, value, balance)
- `budget` (needsPct, wantsPct, savePct, offTarget, left)
- `leaks` (yearly, cut, invested, on)
- `emergency` (save, played, fund, debt, covered)
- `goalplan` (needed, available, fits, slack)

### Deudas

- `loan` (amount, tin, months, payment, interest, total, tae)
- `revolving` (payment, months, interest, total)
- `debts` (method, extra, months, interest, saved, firstPaid)

### Clasificar con respuesta al momento (muy versátil)

- `sort` (done, cards, correct, wrong, net). Tiene `bins` con 2-3 grupos y `cards` con `icon`, `label`, `bin` y `why`, más `value` si hay importes. El reto típico es `when('done', '==', N)`.

### Mercados con datos reales

- `horizon` (years, windows, lossPct, worst, best). Necesita una serie **mensual**: `series-sp500-monthly`, `series-japan`, `series-ibex` o `series-gold`.
- `crash` (played, sold, drop, final, hold, soldDrop). Vive una serie y decide si vendes. Series disponibles:
  - `series-crash-2008`, `series-crash-1929`, `series-dotcom`, `series-japan`
  - `series-covid`, `series-btc`, `series-ibex`, `series-gold`
  - `series-eurusd`, `series-oil`, `series-tsla`, `series-sp500-monthly`
- `mix` (totalPct, maxDD, final, w0, w1, w2). Carteras con rentabilidad total:
  - `series: 'mix-classic'`: acciones, bonos y oro, 2008-2025.
  - `series: 'mix-crypto'`: acciones, bonos y bitcoin, 2015-2025.
  - `weights` en % y deben sumar 100; `rebalance: true` rebalancea una vez al año.
- `dca` (start, lumpFinal, dcaFinal, lumpWins, diffPct). Necesita una serie mensual.
- `orders` (stopPct, takePct, rr, played, hit, pnlPct). `chart: 'lvl-N'` (lvl-1 a lvl-23): el alumno coloca el stop y el objetivo sobre velas reales y ve qué toca primero. `hit` vale 1 (stop), 2 (objetivo) o 0 (ninguno).
- `guess` (done, right, rounds). `rounds: ['ud-N', …]`: 3-5 rondas de «¿sube o baja?» con velas reales. Usa ids de `ud` que no salgan en el quiz de esa lección; búscalo en tu archivo.

### Gráficos para `chart()` (tocar la vela que muestra el patrón)

- `hammer-1..3`, `shooting-star-1..3`, `doji-1..3`
- `bull-engulfing-1..3`, `bear-engulfing-1..3`, `marubozu-1..3`, `morning-star-1..3`

### Productos, trading y fiscalidad

- `fees` (feeB, years, finalA, finalB, lost, lostPct): fondo barato frente a fondo caro.
- `bond` (rate, years, price, change): si suben los tipos, el precio baja; con más años, baja más.
- `fx` (asset, fx, eurPct). `currency` es el nombre de la divisa, por ejemplo «dólar».
- `leverage` (lev, move, pnlPct, wiped, exposure)
- `position` (riskPct, stopPct, size, posPct, riskEur, after10)
- `taxes` (gain, loss, base, tax, effPct, marginal): base del ahorro de 2025 (19/21/23/27/30 %) y pérdidas que compensan.
- `book` (size, avg, slippagePct, spreadPct): libro de órdenes **de ejemplo** con precios inventados, y la pieza lo dice. Úsalo solo para explicar el mecanismo.
- `valuation` (price, growth, per, peg, yieldPct, payback)
- `coinflip` (trades, losersPct, avg, best): simulación matemática de operar sin ventaja.

## Cómo comprobar (obligatorio antes de terminar)

```bash
cd /Users/joanvidalalmirall/easytrading
npx tsx --conditions=react-server scripts/check-units.ts src/server/content/v2/u05.ts   # tus archivos
npm run check:content
npx tsc --noEmit
npx eslint src/server/content/v2/u05.ts                                              # quita imports que no uses
```

Todo tiene que pasar sin errores. Los avisos de `check-units` sobre la mezcla de tipos del quiz se pueden quedar, pero revisa el resto.

## Límites

- Solo modifica tus archivos `src/server/content/v2/uNN.ts`.
- No toques el código, otras unidades, las traducciones, ni el `index.ts` de las secciones.
- No hagas commits.
- Si necesitas una pieza que no existe, apáñate con `sort`, `story` u otra parecida, y apúntalo en tu informe.

Al terminar devuelve:

- las lecciones rehechas;
- las preguntas retiradas, por lección;
- las cifras que has calculado y cómo;
- las dudas o problemas.
