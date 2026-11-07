# Encargo: pasada de enganche a las clases (noviembre de 2026)

Proyecto: **Lumi**, una app para aprender a invertir (público de 16 a 35 años, España). Código en `/Users/joanvidalalmirall/Proyectos/Lumi/Codigo/lumi` (rama `v2`).

Lee antes, en este orden:

1. `docs/curso-v2/06-enganche-y-progresion.md`: **el porqué de este encargo**. Lo más importante son las reglas de la sección 5.
2. `docs/curso-v2/encargo-interactivas.md`: las piezas (`widget`), sus métricas, las medidas de textos y cómo comprobar. Sigue valiendo todo, salvo las rutas: el código está ahora en la carpeta de arriba.
3. `src/shared/play.ts` (esquema exacto de las piezas) y `src/server/content/dsl.ts` (constructores: `lesson`, `story`, `play`, `mission`, `key`, `single`, `scenario`, `upDown`, `level`, `simTrade`, `sim`…).
4. Tus unidades.

## Qué hacer en cada clase de tus unidades

Repasos (`…r`) y retos finales (`…boss`) se generan solos: no los toques.

1. **Gancho en la primera pantalla.** Si la clase empieza con una definición o un texto abstracto, cámbialo por un caso concreto:
   - una historia con una decisión;
   - una predicción sobre datos reales;
   - una situación que le pase a alguien de 20 años.

   Si ya empieza con algo concreto y bueno, déjalo.
2. **Cero cuentas a mano.** Mira cada pregunta `num(...)` (tipo `NUMBER`) del quiz:
   - **Retira las de cálculo puro** (sumar, multiplicar, porcentajes con decimales) con `retire` en las opciones de `lesson(...)`.
   - Puede quedar **una como mucho por clase**, solo si se responde razonando y no calculando, y solo si enseña algo importante.
   - En las **clases de la sección 0** (lista abajo) no puede quedar ninguna.
   - En las piezas y las historias, la cifra la da la pieza, no el alumno.
3. **Para qué te sirve hoy.** Que la última pantalla (normalmente la `key`, o el `insight` de la última pieza) acabe con una acción concreta en la app. Ejemplos:
   - «Pruébalo: en Mercado, busca el ETF del S&P 500 y mira cuánto ha subido en 10 años.»
   - «Pon un stop en tu próxima compra del simulador.»

   Una frase, sin emojis. La app tiene: Mercado (buscar activos, ver gráfico, comprar y vender con dinero virtual, órdenes límite, stop y objetivo cuando se han desbloqueado), Cartera, Favoritos, Alertas de precio y la profesora Lumi.
4. **Quiz: 5-8 preguntas, al menos 3 tipos**, con prioridad a las de decidir: `scenario`, `upDown`, `level` (colocar stop u objetivo), `simTrade`, `buckets`, `chat`, `spot`. Si al retirar se queda por debajo de 5, **añade preguntas nuevas AL FINAL de la lista** (nunca en medio: los identificadores van por posición).
   - **Las preguntas existentes NO se tocan ni una letra**; solo se retiran.
   - Las nuevas no pueden ser `num`.
5. **Siempre el porqué.** Cada explicación de pregunta nueva dice por qué la buena es buena y, si cabe, por qué falla la tentadora.
6. **Lenguaje de principiante en las clases de la sección 0.** Serán de las primeras que vea alguien que no sabe nada. Quita las referencias a clases anteriores («como vimos en la unidad 3…»), explica cada término la primera vez y no des por sabido el patrimonio, el TIN, etc.
7. **Reglas de siempre:**
   - sin emojis;
   - frases de Lumi de 15 palabras como mucho;
   - **nunca inventes precios ni datos de mercado** (las piezas con datos reales usan `src/server/content/charts.json`);
   - toda cifra que cites tiene que salir de la pieza o del texto que ya había.

No hace falta rehacer clases que ya cumplen todo. Prioridad, en este orden:

1. clases de la sección 0;
2. quitar cuentas;
3. ganchos;
4. «para qué te sirve».

## Clases que pasan a la sección 0 «Invierte desde hoy» (las mueve el coordinador; tú solo mejóralas)

- Unidad «Tu primera inversión»: u8l1, u5l3, u6l1, u19l1, u1l5
- Unidad «Invertir como los que ganan»: u7l1, u10l2, u29l1, u25l2, u10l3, u4l3
- Unidad «Tu primer análisis»: u16l1, u17l1, u20l1, u21l1, u24l3, u27l4

Para estas: cero preguntas `num`, gancho fuerte, lenguaje de principiante y ninguna referencia a clases de antes. Deben poder hacerse en este orden sin haber visto nada más del curso.

## Traducciones (obligatorio)

Cada unidad tiene su traducción en `src/server/content/v2/i18n/ca/<unidad>.json` y `.../en/<unidad>.json`. El nombre del archivo es el id de la unidad: `u5.json`, no `u05.json`.

- **Pasos de una clase** (`lessons[id].steps`): si cambias los pasos de una clase, su traducción tiene que tener **exactamente la misma forma**.
  - Mismo número de pasos.
  - En `play`/`story`, la lista `texts` con los textos en el mismo orden en que los recorre `walkTexts`.
  - Si no encaja, la app enseña esa clase en castellano.
  - Para ver la forma exacta, genera el español con `export` (abajo) y mira `i18n/es/<unidad>.json`.
- **Preguntas nuevas** (`questions["<idClase>-<n>"]`): `n` es su posición en la lista original contando las retiradas, empezando en 1. Tradúcelas a catalán y a inglés con la misma forma que las demás. Las retiradas pueden quedarse en el JSON.
- **Estilo:**
  - catalán: «la Lumi», «en Pablo», «Vertader/Fals»;
  - inglés: «€10,000», comillas «».
  - Conserva las cifras, el número de opciones y los `____` de los huecos.

## Cómo comprobar (obligatorio antes de terminar)

```bash
cd /Users/joanvidalalmirall/Proyectos/Lumi/Codigo/lumi
npx tsx --conditions=react-server scripts/check-units.ts src/server/content/v2/u05.ts src/server/content/v2/u06.ts   # tus archivos
npx tsx --conditions=react-server scripts/content-i18n.ts export
npx tsx --conditions=react-server scripts/content-i18n.ts check u5 u6                                                  # tus unidades
npx tsc --noEmit
npx eslint src/server/content/v2/u05.ts
```

- Otros agentes trabajan a la vez en otras unidades. Si `tsc` o `export` fallan **por un archivo que no es tuyo**, espera un minuto y repite. No lo arregles tú.
- Los avisos de `check-units` sobre la mezcla de tipos se pueden quedar; los errores, no.

## Límites

- **Solo** puedes modificar tus archivos `src/server/content/v2/uNN.ts` y sus traducciones `i18n/ca/uN.json` e `i18n/en/uN.json`.
- La carpeta `i18n/es/` la regenera `export`: no la edites a mano.
- No toques el código de la app, `index.ts`, `dsl.ts`, `catalog.ts`, otras unidades ni `i18n/index.ts`.
- No hagas commits.

## Informe final (breve)

- **Por clase:** qué has cambiado (gancho, preguntas retiradas, preguntas nuevas, frase final).
- **Recuento:** preguntas `num` antes y después en tus unidades.
- **Pendiente:** problemas o dudas.
