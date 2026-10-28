# 03 · Catálogo de ejercicios y guía de redacción (Fase 3)

> El motor corrige **siempre en el servidor**: la solución, las consecuencias y el futuro de los gráficos nunca llegan al móvil antes de responder.
> Código: constructores en `src/server/content/dsl.ts`, corrección en `src/server/content/grading.ts`, pantallas en `src/client/screens/exercises.tsx` y `quiz.tsx`, tests en `tests/grading.test.ts`.
> Unidad de referencia escrita con todo esto: `src/server/content/v2/u01.ts`.

## 1. Los 18 tipos de ejercicio

| # | Tipo (constructor) | Objetivo pedagógico | Mecánica | Si aciertas / si fallas | Dónde encaja |
|---|---|---|---|---|---|
| 1 | **Test** `single(enunciado, opciones, correcta, explicación)` | Comprobar un concepto (recuperación) | Una correcta entre 3; la posición se reparte sola | Explicación del porqué en ambos casos | Todas las clases (sin abusar: máx. 60 % junto con V/F) |
| 2 | **Verdadero o falso** `tf(afirmación, esVerdad, explicación)` | Desmontar mitos | Dos botones | Explicación | Mitos, matices |
| 3 | **Varias correctas** `multi(enunciado, opciones, [correctas], explicación)` | Distinguir lo que sí y lo que no | Marca todas las correctas | Se ven las correctas | Listas de características, señales |
| 4 | **Ordenar** `order(enunciado, [en orden], explicación)` | Procesos y secuencias | Tocar en orden | Se muestra el orden bueno | Pasos (abrir cuenta, plan, crisis) |
| 5 | **Emparejar** `match(enunciado, [[izq, der], …], explicación)` | Asociar conceptos y definiciones | Tocar izquierda y luego derecha; colores por pareja | Se muestran las parejas buenas | Vocabulario, ratios, sesgos |
| 6 | **Clasificar** `buckets(enunciado, [grupos], [[elemento, grupo], …], explicación)` | Discriminar categorías | Cada elemento elige su grupo | Cada fallo dice su grupo | ¿Deuda buena o mala?, ¿cíclico o defensivo? |
| 7 | **Rellenar huecos** `fill(frase con ____, respuesta, [distractores], explicación)` | Fijar la palabra exacta | Elegir la palabra | Se marca la buena | Definiciones, fórmulas |
| 8 | **Cálculo** `num(enunciado, respuesta, unidad, explicación, margen%=1)` | Aplicar fórmulas | Teclado numérico (coma o punto) | «Era X» + cálculo en la explicación | Interés, inflación, PER, tamaño de posición, impuestos |
| 9 | **Leer un gráfico real** `trend(…)` / `point(…)` | Leer tendencias y extremos | Elegir tendencia o tocar el punto | Explicación | Análisis técnico |
| 10 | **Toca la vela** `candle(enunciado, idGráfico, explicación)` | Reconocer patrones en datos reales | Tocar la vela | Se marca la vela buena | Velas japonesas |
| 11 | **¿Sube o baja?** `upDown(enunciado, idGráfico, explicación, horizonte?)` | Humildad ante la predicción, contexto histórico | Gráfico real sin nombre ni fecha → Sube/Baja | **Se revela** el activo, las fechas y lo que pasó (velas o línea) | Laboratorio, sesgos, crisis, macro |
| 12 | **Coloca el nivel** `level(enunciado, idGráfico, 'STOP'|'TAKE', explicación)` | Poner stop y objetivo con lógica | Tocar/arrastrar el precio en el gráfico (+/−) | Se marca la zona buena y se revela si se tocó tu nivel | Órdenes, gestión del riesgo |
| 13 | **Simula la operación** `simTrade(enunciado, idGráfico, explicación, { cash, maxRiskPct })` | Tamaño de posición con riesgo controlado | Importe con deslizador + stop en el gráfico; riesgo en directo | Revela lo que pasó y el resultado en € | Riesgo, plan de trading, laboratorio |
| 14 | **Escenario** `scenario(historia, [[decisión, consecuencia], …], mejor, explicación)` | Decidir en contexto | Elegir decisión | **Consecuencia de lo elegido** + regla general | Sesgos, crisis, ahorro, deudas, noticias |
| 15 | **Chat con Lumi** `chat([mensajes de Lumi], enunciado, [[respuesta, réplica de Lumi], …], mejor, explicación)` | Explicar con tus palabras, humor | Burbujas de chat, eliges qué contestar | Lumi te responde según lo que elijas | Cierre de conceptos, sesgos, mitos |
| 16 | **Construye la cartera** `portfolio(enunciado, [[activo, tipo], …], reglas, explicación)` | Diversificar con restricciones | Deslizadores que suman 100 % | Lista de reglas incumplidas o «cumple todas» | Diversificación, reparto, cripto |
| 17 | **Detecta la estafa** `spot(enunciado, [[remitente, mensaje, esEstafa], …], explicación)` | Reconocer señales de fraude | Mensajes tipo móvil; marcar todos los fraudes | Se marcan los fraudes | Estafas, cripto, finfluencers |
| 18 | **Reto cronometrado** `timed(cualquierPregunta, segundos)` | Automatizar lo básico | Cuenta atrás; a 0 cuenta como fallo | Igual que el tipo envuelto | 1-2 por clase, preguntas rápidas |

Además, en la teoría: **calculadora interactiva** `calc(tipo, título, texto)` con deslizadores (`compound`, `inflation`, `rule72`, `position`, `recovery`, `fees`, `dca`, `budget`, `loan`) y el paso «toca la vela» `chart(…)`.

**Repaso espaciado:** cada fallo va a la lista «Repasar fallos» (`/quiz/review`); el **repaso de unidad** mezcla preguntas de todas sus clases (primero las dinámicas) y el **reto final de sección** mezcla 12 de toda la sección y exige un **80 %**.

## 2. Estructura de cada clase

```ts
lesson('u5l2', 'Título corto', [
  text('Idea 1', 'Máx. ~500 caracteres. **Negrita** para lo clave. Listas con •.'),
  calc('compound', 'Pruébalo', 'Qué mover y qué mirar.'),           // opcional
  key('Lo que te llevas', 'Cierre con un ejemplo concreto.', 'Una frase-resumen.', 'Consejo de Lumi (opcional)'),
], [
  /* 8-12 ejercicios, ≥3 tipos, ≥1 dinámico (no solo test y V/F), 1-2 timed() */
], { source: '2.1' })   // sección del manual docs/curso de la que sale (para Lumi), si existe
```

- **Teoría:** 2-3 pantallas (máximo 4, contando la calculadora). Cada pantalla, una idea. La última suele ser `key(...)`.
- **Ejercicios:** 8-12 (máx. 15). Al menos 3 tipos distintos y al menos uno dinámico. Test + V/F como máximo el 60 %. No repetir exactamente la misma mezcla de tipos que la clase anterior.
- **Progresión dentro de la clase:** primero recordar (test, emparejar), luego aplicar (cálculo, escenario, gráfico) y al final una pregunta de transferencia o un chat con Lumi.
- **Explicación siempre:** di **por qué**, con el número o el dato. Nunca «Correcto» a secas.
- Cada clase dura 3-6 minutos (unos 40 s por pantalla de teoría y 25 s por ejercicio).

## 3. Estilo

- Español claro, cercano y joven, **sin infantilizar**. Tuteo. Frases cortas.
- Ejemplos cotidianos (el café, la nómina, el alquiler, la paga) y empresas reales **como ejemplo, nunca como recomendación**.
- Personajes recurrentes en escenarios: Laura, Pablo, Marta, Ana y Bruno (no hace falta pronombre).
- Un toque de humor en los chats con Lumi y en las consecuencias de los escenarios, sin burlarse del alumno.
- Formato español: coma decimal (7,5 %), punto de miles (10.000 €), espacio antes de % y €.
- Distractores plausibles: errores que de verdad comete la gente, no opciones absurdas.

## 4. Exactitud y legalidad (obligatorio)

- **Cada dato tiene que ser correcto.** Fuente principal: el manual `docs/curso/` (contrastado). Si dudas de una cifra, búscala o no la uses. Haz las cuentas de cada `num()` antes de escribirlo.
- **Nunca asesoramiento personalizado:** nada de «compra X», «vende X», «esto encaja con tu perfil». Se enseñan conceptos, procesos y la historia con datos reales.
- **Nunca rentabilidades garantizadas** ni urgencias. Los ejemplos de rentabilidad se presentan como ejemplos («no es una promesa»).
- Clases de **cripto**: recordar que es un activo muy volátil y no regulado como un depósito: «puede perderse la totalidad de lo invertido».
- Clases de **apalancamiento/CFD**: incluir la advertencia oficial de la CNMV: «Los CFD son instrumentos complejos y están asociados a un riesgo elevado de perder dinero rápidamente debido al apalancamiento. Entre un 74 y un 89 % de los inversores minoristas pierden dinero cuando negocian con CFD.»
- **Gráficos:** solo los reales de `docs/curso-v2/graficos.md`. En «¿Sube o baja?» la explicación no puede delatar el resultado. `charts.json` es fijo: **no regenerarlo** sin revisar las clases que lo usan.

## 5. Cómo se comprueba

```bash
npx tsx --conditions=react-server scripts/check-units.ts src/server/content/v2/u05.ts   # una o varias unidades
npm run check:content                                                                # curso entero
npm test                                                                              # motor de corrección
```
