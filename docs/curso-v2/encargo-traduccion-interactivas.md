# Encargo: traducir las clases interactivas (catalán e inglés)

Proyecto: E-Trading, una app para aprender a invertir (de 16 a 35 años), en `/Users/joanvidalalmirall/easytrading`.

Antes de empezar, lee el encargo general de traducción: `docs/curso-v2/encargo-traduccion.md`. Sus reglas de estructura, cifras, huecos, estilo y terminología siguen valiendo. Aquí van las novedades.

## Qué ha cambiado

Las lecciones de tus unidades se han rehecho como clases interactivas. Mira `src/server/content/v2/i18n/es/<unidad>.json`. Cada lección tiene ahora pasos de dos tipos:

- `{ "texts": [ … ] }`: la lista de **todas** las frases de una pieza interactiva o de una historia con decisiones, en un orden fijo. Incluye títulos, explicaciones, frases de Lumi, nombres de objetos o de activos, mensajes de los personajes, opciones, etiquetas de grupos y, en algunas piezas, el nombre de una divisa («dólar») o una cabecera.
- `{ title, body, key, tip }`: una pantalla de texto.

Además, se han **retirado** algunas preguntas del quiz.

## Tu tarea

Trabajas solo con tus unidades, y en las dos lenguas: catalán e inglés británico.

1. En `ca/<unidad>.json` y en `en/<unidad>.json`, sustituye `lessons.<id>.steps` de **todas** las lecciones por la traducción de los `steps` del español. La forma tiene que ser idéntica: los mismos objetos, las mismas claves, y las listas `texts` con el mismo número de elementos y en el mismo orden.
   - Si un paso `title/body/key/tip` no ha cambiado respecto a la versión anterior, puedes reutilizar la traducción que ya había. Para compararlo, usa `git show HEAD:src/server/content/v2/i18n/es/<unidad>.json`.
   - Los títulos de lección y el bloque `unit` ya están traducidos. No los toques.
2. Borra de `questions` las preguntas que ya no existen en el español. El resto de preguntas no se toca.
3. **Ningún emoji.** Mantén **negritas**, «», saltos de línea y viñetas.
4. Los nombres de los personajes se mantienen.
   - En catalán llevan artículo personal: «en Pablo», «la Laura», «l'Ana».
   - Si un nombre lleva título, se adapta: «Tío Javi» pasa a «Tiet Javi» y «Uncle Javi».
   - Los nombres de empresas o de activos reales no se traducen (Inditex, S&P 500, Bitcoin…).
   - Las etiquetas descriptivas sí se traducen: por ejemplo, «Acciones de EE. UU.» y «Oro».
5. Cifras:
   - En inglés: «€1,400», con el símbolo delante, y «7 %», con espacio.
   - En catalán: «1.400 €» y «7,5 %».
   - Mantén siempre las mismas cifras.
6. Usa el vocabulario que ya está en esos archivos y en `messages/ca.json` y `messages/en.json`:
   - «cushion» para el colchón;
   - «palanquejament»;
   - «bròquer»;
   - «Vertader/Fals»;
   - «nominal rate» y «APR» en inglés; TIN y TAE en catalán;
   - «la Lumi».
7. Las frases tienen que ser cortas y sonar naturales, con el tono de Lumi: cercano, joven y claro.

## Comprobar (obligatorio)

```bash
cd /Users/joanvidalalmirall/easytrading
npx tsx --conditions=react-server scripts/content-i18n.ts check u5 u6 u7 u8   # tus unidades, sin .json
```

El resultado tiene que terminar con «✓ Traducciones correctas». Corrige todo lo que marque.

## Límites

- Solo modifica `ca/<tus unidades>.json` y `en/<tus unidades>.json`.
- No toques el español, el código ni otros archivos, y no hagas commits.
- Para los scripts temporales, usa tu propia subcarpeta dentro del scratchpad: hay otros traductores trabajando a la vez.
- Lee y escribe el JSON con `ensure_ascii=False`, `indent=1` y un salto de línea al final.
- Traduce cada frase con cuidado; nada de literal.

Al terminar, devuelve los archivos que has tocado, el resultado del comprobador y tus dudas de terminología.
