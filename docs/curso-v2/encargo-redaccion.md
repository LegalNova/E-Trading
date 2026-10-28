# Encargo de redacción de unidades del curso v2

Proyecto: E-Trading, app (Next.js) para aprender a invertir, en `/Users/joanvidalalmirall/easytrading`. Público: 16-35 años, principiantes, en España. Idioma: español.

## Qué tienes que hacer

Escribir **unidades completas** del curso v2 como archivos TypeScript con el lenguaje de contenido del proyecto. Cada unidad tiene las clases que marca el mapa `docs/curso-v2/curriculo.json` (mismos títulos, mismo orden, ids `u{N}l{M}`), y cada clase tiene teoría corta + 8-12 ejercicios variados.

## Lee antes de escribir (en este orden)

1. `docs/curso-v2/03-ejercicios.md`: catálogo de los 18 tipos de ejercicio, estructura de cada clase, estilo, **exactitud y legalidad**.
2. `src/server/content/v2/u01.ts`: unidad de referencia ya terminada. Imita su nivel, longitud y variedad.
3. `src/server/content/dsl.ts`: las firmas exactas de los constructores (`lesson`, `unit`, `text`, `key`, `calc`, `chart`, `single`, `tf`, `multi`, `order`, `fill`, `match`, `buckets`, `num`, `scenario`, `chat`, `portfolio`, `spot`, `timed`, `trend`, `point`, `candle`, `upDown`, `level`, `simTrade`).
4. `docs/curso-v2/graficos.md`: los únicos gráficos reales que puedes usar (ids).
5. Las fuentes de tu bloque (te las indica tu encargo): las clases actuales en `src/server/content/course/uXX.ts` (reaprovecha su teoría y sus mejores preguntas, **reescribe las redundantes o aburridas** y conviértelas en ejercicios dinámicos) y el manual `docs/curso/NN-*.md` (datos contrastados).

## Formato del archivo

```ts
import 'server-only'
// Sección N · Unidad M · Título (docs/curso-v2/02-curriculo.md)
import { …solo lo que uses… } from '../dsl'

export default unit({
  id: 'u5', order: 5, title: 'La bolsa por dentro', description: 'Frase corta de lo que se aprende (máx. ~90 caracteres)',
  lessons: [
    lesson('u5l1', 'Qué es una bolsa', [ …2-3 pasos de teoría (máx. 4)… ], [ …8-12 ejercicios… ], { source: '2.3' }),
    …
  ],
})
```

- Archivo: `src/server/content/v2/uNN.ts` con dos cifras (u05.ts, u12.ts…). `id` = `u{N}` sin ceros, `order` = N.
- `source` = sección del manual de la que sale la clase (ej. `'2.3'`), solo si existe una equivalente; si no, omítelo.
- No añadas la clase de repaso ni el reto final: `unit()` y `section()` los generan solos.

## Reglas que comprueba el validador (si falla, corrige)

- 8-15 ejercicios por clase (apunta a 9-11), al menos 3 tipos distintos, al menos 1 dinámico (no solo `single`/`tf`), máximo 4 pantallas de teoría, cada pantalla ≤700 caracteres (apunta a ≤450).
- Test + V/F como máximo el 60 % de una clase. Incluye 1-2 `timed()` por clase. Varía la mezcla de una clase a la siguiente.
- Opciones sin repetir; `fill` con `____` y la respuesta entre las opciones; `match` sin dos derechas iguales; `num` con unidad y la cuenta hecha bien.

```bash
cd /Users/joanvidalalmirall/easytrading
npx tsx --conditions=react-server scripts/check-units.ts src/server/content/v2/u05.ts src/server/content/v2/u06.ts
npx tsc --noEmit
```

Los dos deben pasar sin errores (los avisos de «misma mezcla» o «más del 60 % de test» también se corrigen).

## Límites

- **Solo crea tus archivos `src/server/content/v2/uNN.ts`.** No toques `dsl.ts`, `index.ts`, `catalog.ts`, ni ningún otro archivo; no hagas commits, ni arranques servidores, ni instales paquetes.
- No inventes datos ni gráficos. Si dudas de una cifra, compruébala en el manual o búscala en la web; si no puedes confirmarla, no la uses.
- Nada de asesoramiento personalizado ni rentabilidades garantizadas (ver §4 de 03-ejercicios.md).

## Al terminar

Devuelve un resumen breve: archivos creados, clases y ejercicios por unidad, recuento por tipo, salida final del validador, y cualquier dato del que no estés seguro o decisión importante.
