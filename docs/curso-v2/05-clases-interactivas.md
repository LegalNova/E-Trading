# Clases interactivas

Las clases dejan de ser «leer y responder». El orden es el contrario: **primero haces y luego entiendes**. La idea se nombra cuando ya la has visto con tus ojos.

Piloto: sección 1 (unidades 1-4, 21 clases). Si funciona con usuarios reales, se extiende al resto del curso con el mismo sistema.

## La forma de una clase (5-7 min)

1. **Gancho:** una historia corta con una decisión (`story`) o una predicción («¿qué crees que pasará?»).
2. **Juega:** una pieza interactiva (`play`) con un reto pequeño. En lo que tiene datos reales, una **misión** (`mission`).
3. **Descubre:** al cumplir el reto aparece «Lo que acabas de descubrir», 1-2 frases con la idea clave.
4. **Aplica:** otra historia o pieza donde usar lo aprendido.
5. **Quiz** más corto (5-7 ejercicios): ya se ha practicado dentro de la clase.

Lumi acompaña todo el rato. En cada pieza comenta lo que estás haciendo y lo celebra al cumplir el reto. En las historias es un personaje más.

Como mucho, **una** pantalla de solo texto por clase (`key`), para fijar la idea.

## Las piezas (`src/client/play`)

Cada pieza publica unas **métricas** (números). El reto y las frases de Lumi son condiciones sobre ellas (`when('itemsPct', '<=', 50)`), así que el contenido decide qué celebrar sin programar nada.

| Pieza | Para qué | Métricas |
|---|---|---|
| `basket` | Cesta que encoge con la inflación | years, rate, items, itemsPct, lost |
| `growth` | Colchón, interés simple y compuesto | final, contributed, gain, multiple, years, monthly, rate, initial, simpleFinal, mattressFinal |
| `race` | Dos personas, una empieza más tarde | bAge, delay, ratio, aFinal, bFinal, aPut, bPut |
| `doubling` | Regla del 72 | rate, years, rule, doublings40 |
| `realrate` | Rentabilidad real | nominal, inflation, real, value, balance |
| `sort` | Clasificar con respuesta al momento (con importes, suma) | done, cards, correct, wrong, net |
| `budget` | Repartir el sueldo frente a 50/30/20 | needsPct, wantsPct, savePct, offTarget, left |
| `leaks` | Gastos hormiga | yearly, cut, invested, on |
| `emergency` | Un año con imprevistos (misión) | save, played, fund, debt, covered |
| `goalplan` | Objetivos con cifra y fecha | needed, available, fits, slack |
| `loan` | Cuota, intereses y TAE | amount, tin, months, payment, interest, total, tae |
| `revolving` | Cuánto tardas en pagar la tarjeta | payment, months, interest, total |
| `debts` | Bola de nieve o avalancha | method, extra, months, interest, saved, firstPaid |
| `horizon` | **Datos reales**: con cuántos años nunca se perdió | years, windows, lossPct, worst, best |
| `crash` | **Datos reales**: vive la crisis de 2008 y decide si vendes | played, sold, drop, final, hold, soldDrop |
| `coinflip` | Simulación (dice que lo es): operar sin ventaja con comisiones | trades, losersPct, avg, best |

Las cuentas están en `src/client/play/math.ts` y se prueban en `tests/play.test.ts`.

**Datos reales (regla F1):** `horizon` y `crash` usan series de `charts.json`. Se generan con `python3 -I scripts/build-lesson-charts.py --append-series`, sin tocar lo que ya existe. El pie del gráfico dice siempre qué es, por ejemplo «cierres mensuales, sin dividendos». Las cifras que cita el texto se han calculado con esas mismas series.

## Escribirla (`src/server/content/dsl.ts`)

```ts
play({
  title: 'Tu cesta dentro de unos años',
  intro: 'Hoy, con **50 €** te llevas toda esta cesta…',
  widget: { kind: 'basket', money: 50, rate: 3, years: 0, maxYears: 30, maxRate: 10, items: [...] },
  predict: { prompt: '¿Qué te llevarás dentro de 20 años?', options: [...], answer: 1, why: '…' },
  goal: { text: 'Busca qué inflación deja tu cesta a la mitad en 10 años.', when: [when('years', '==', 10), when('itemsPct', '<=', 51)] },
  insight: '**70 ÷ inflación** = años hasta que tu dinero compra la mitad.',
  lumi: [
    { when: when('itemsPct', '<', 35), say: '¡Uf!…', mood: 'WORRIED' },
    { say: 'Arrastra los años 👇', mood: 'HAPPY' },   // la de por defecto, siempre la última
  ],
}),
story('Las 100 pesetas de la abuela', [{ id: 'abuela', name: 'Abuela Carmen', emoji: '👵' }], [
  say('abuela', '…'),
  choose('¿Por qué crees que pasa esto?', [opt('…', 'good', say('lumi', '…')), opt('…', 'bad', say('lumi', '…'))]),
  note('Tres meses después…'),
]),
```

Reglas que comprueba `npm run check:content`:

- Las métricas del reto y de Lumi existen en esa pieza.
- La frase de Lumi sin condición va la última.
- Una misión tiene reto.
- En la historia solo habla quien está en el reparto (además de `lumi` y `me`).
- Cada elección tiene una opción buena y todas tienen consecuencia.
- El quiz tiene 5-12 ejercicios.

**Preguntas retiradas:** `lesson(..., { retire: [5, 7] })` quita del quiz las preguntas que la clase ya practica sin renumerar las demás. El id de cada pregunta (`u1l1-8`) depende de su posición, y lo usan las traducciones y los fallos guardados.

**Bloqueo:** «Continuar» espera a que se cumpla el reto o termine la historia. A los 40 segundos aparece «Seguir sin completarlo», para que nadie se atasque.

## Traducción

Los textos de una pieza o historia se exportan como una lista `texts` en un orden fijo (`walkTexts` en `src/shared/play.ts`). No se traducen ni se exportan los ids, los emojis, las condiciones ni las cifras. Flujo:

1. `content-i18n.ts export`
2. Traducir `ca/` y `en/`
3. `check`
4. `index`
