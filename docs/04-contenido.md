# 04 · Contenido

> Estado: **curso completo en la app (octubre 2026).** 12 unidades, 108 lecciones y 395 preguntas a partir del manual `docs/curso` (D-048 a D-051). El esqueleto de la sección 4 queda como historia.
>
> **Cómo añadir o cambiar una lección:** edita `src/server/content/course/uNN.ts` (pasos con `text`, `key`, `img`, `chart`, `sim`; preguntas con `single`, `tf`, `multi`, `order`, `fill`, `trend`, `point`) y ejecuta `npx tsx --conditions=react-server scripts/check-content.ts`. Si cambias el manual, regenera la base de Lumi con `npx tsx scripts/build-tutor-kb.ts`.

## 1. Cómo se escribe una lección

**Regla de oro:** primero se define **qué sabrá hacer el alumno** al acabar. De ese objetivo salen la lección y su quiz, escritos a la vez.

1. **Objetivo de aprendizaje** (una frase con verbo de acción). Ej.: «Identifica si una vela es alcista o bajista y qué indican sus mechas».
2. **Idea clave** en una frase, que es lo que se debe recordar.
3. **Pasos** (4–7, unos 5 minutos en total):

| Tipo de paso | Para qué |
|---|---|
| Texto | Explicar una idea, con frases cortas |
| Imagen | Un diagrama sencillo |
| Vídeo | Opcional, ≤ 2 min |
| Gráfico interactivo | Practicar con **datos reales** fijos (p. ej. "toca la vela…"); la solución vive solo en el servidor |
| Tarea en el simulador | Aplicarlo en el Mercado (p. ej. "compra cualquier activo con stop loss"); se valida sola |
| Truco de Lumi | Recordatorio corto |

4. **Quiz** de 5–6 preguntas, todas ligadas al objetivo:
   - Mezcla de tipos: opción única, múltiple, verdadero/falso, ordenar, rellenar hueco, punto del gráfico y tendencia del gráfico.
   - Cada pregunta lleva su **explicación**, que se ve al responder.
   - Al menos una pregunta de **aplicación**, no de memoria.

## 2. Criterios de calidad

- **Exactitud:** cada dato tiene fuente (CNMV, Banco de España, BCE, documentación de bolsas, libros de referencia) anotada en el archivo de la lección.
- **Sin recomendaciones:** los ejemplos usan activos reales para explicar, nunca para sugerir. Ningún texto dice qué comprar.
- **Lenguaje claro:** frases de 20 palabras como máximo, un concepto por paso y términos técnicos explicados la primera vez. Pensado también para TDAH y dislexia.
- **Tono:** cercano, de tú, sin jerga innecesaria y sin promesas de ganancias.
- **Revisión humana** antes de publicar: el fundador o alguien con formación financiera.
- **Traducción:** castellano (original), catalán e inglés. El sistema admite añadir idiomas sin tocar código.

## 3. Dónde vive el contenido

- **En el MVP**, cada lección es un **archivo en el repositorio** (`content/<curso>/<unidad>/<lección>.<idioma>.json`).
  - Ventajas: se revisa como un documento, queda versionado y se traduce archivo a archivo.
  - Un proceso lo carga en la base de datos (*seed*).
- **Más adelante**, el editor del panel de admin (pantalla 07.2) permitirá editarlo sin programar.

## 4. Esqueleto del curso «Trading desde cero» (propuesta)

El diseño define **6 unidades**: la 2 es «Leer un gráfico» y la 3, «Gestión del riesgo».

| Unidad | Título | Desbloquea | Plan | Estado |
|---|---|---|---|---|
| 1 | Primeros pasos: qué es invertir, la bolsa, acciones y ETFs, inflación e interés compuesto | — | Free | Para el MVP |
| 2 | Leer un gráfico: precio, tendencias, velas, soportes y resistencias | — | Free | Para el MVP |
| 3 | Gestión del riesgo: diversificar, tamaño de posición, stop loss y take profit | **Límite, stop loss y take profit** en el Mercado | Premium (según el diseño) | Para el MVP |
| 4 | Psicología del inversor: sesgos, miedo, FOMO, diario de inversión | — | Premium | Después |
| 5 | Invertir a largo plazo: ETFs, DCA, cartera diversificada, fiscalidad básica en España | — | Premium | Después |
| 6 | Cripto y otros mercados: qué es real, volatilidad, custodia, divisas | — | Premium | Después |

Más el **test de nivel** (8 preguntas, unidades 1 y 2), que permite saltarse lo que ya se sabe.

**Contenido de la v1 que se puede aprovechar:** las 10 clases de Fundamentos ya escritas sirven de material de partida para las unidades 1 y 3.

> **Decisión pendiente:** según el diseño (landing 01), Free incluye las unidades 1 y 2. Pero si la unidad 3 es solo Premium, un usuario Free **nunca** podrá desbloquear las órdenes avanzadas estudiando. Propuesta: dejar **gratis la lección «Gestión del riesgo»** de la unidad 3, como muestra de lo que ofrece Premium y para que estudiar siempre tenga recompensa.
>
> **Pendiente de decidir juntos (etapa 5):** el temario lección a lección, el número de lecciones por unidad (propuesta: 4–6), qué unidades son gratuitas y quién hace la revisión financiera.
