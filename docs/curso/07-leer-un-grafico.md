# Módulo 7 · Leer un gráfico

> **Al acabar este módulo sabrás:** interpretar los ejes de un gráfico, elegir entre escala lineal y logarítmica, distinguir los tipos de gráfico, elegir la temporalidad adecuada, identificar una tendencia con máximos y mínimos, y leer el volumen.
>
> Todo lo puedes practicar en el gráfico profesional de cada ficha del Mercado de E-Trading.

---

## Lección 7.1 · Qué muestra un gráfico de precios

**Objetivo:** leer los ejes y los datos básicos de un gráfico de precios.
**Idea clave:** un gráfico de precios es la historia de lo que compradores y vendedores han acordado en cada momento.

### Los ejes

- **Eje horizontal (X):** el tiempo. Cada punto, barra o vela es un periodo (un minuto, una hora, un día, una semana…).
- **Eje vertical (Y):** el precio, normalmente a la derecha. En E-Trading está en la moneda del activo (dólares, euros, yenes…) o en puntos si es un índice.
- **Debajo:** el **volumen**, la cantidad negociada en cada periodo.

### Los cuatro precios de cada periodo (OHLC)

Para cada periodo hay cuatro datos:

| Dato | Inglés | Qué es |
|---|---|---|
| Apertura | *Open* (O) | El primer precio del periodo |
| Máximo | *High* (H) | El precio más alto |
| Mínimo | *Low* (L) | El precio más bajo |
| Cierre | *Close* (C) | El último precio del periodo. Es el más importante. |

En el gráfico de E-Trading, al pasar el dedo o el ratón por una vela aparece arriba su **O, H, L, C**, la variación y el volumen.

### Lo que un gráfico es y lo que no es

- **Es:** un registro exacto de lo que ha pasado.
- **No es:** una predicción. El análisis técnico trabaja con probabilidades, nunca con certezas (lo verás con datos en los módulos 8 y 9).

**Truco de Lumi:** "Un gráfico cuenta lo que pasó, no lo que va a pasar. Leerlo bien ya es una ventaja."

---

## Lección 7.2 · Tipos de gráfico

**Objetivo:** elegir el tipo de gráfico adecuado para cada uso.
**Idea clave:** la línea resume, las velas cuentan la batalla de cada periodo.

| Tipo | Qué muestra | Para qué sirve |
|---|---|---|
| **Línea** | Solo los cierres, unidos | Ver la tendencia general a largo plazo sin ruido |
| **Área** | La línea con el espacio de debajo coloreado | Igual que la línea, más visual (muy usado en apps como Revolut) |
| **Barras (OHLC)** | Una barra vertical del mínimo al máximo, con una rayita a la izquierda (apertura) y otra a la derecha (cierre) | Información completa, estilo occidental clásico |
| **Velas japonesas** | Cuerpo entre apertura y cierre, y mechas hasta máximo y mínimo; color según si sube o baja | La información completa, más fácil de leer. Es el estándar actual (módulo 8) |
| **Heikin Ashi** | Velas "promediadas" que suavizan el ruido | Ver tendencias con más claridad; **no** muestra los precios reales de cada periodo |

En el gráfico de E-Trading puedes cambiar entre **velas, Heikin Ashi, barras, línea y área** con el botón de tipo.

**Cuidado con Heikin Ashi:** como cada vela se calcula con promedios, su apertura y cierre **no son precios reales**. Sirve para ver la tendencia, nunca para decidir a qué precio entrar o salir.

**Truco de Lumi:** "Para ver hacia dónde va, la línea. Para ver quién gana cada día, las velas."

---

## Lección 7.3 · Temporalidades: el mismo activo, historias distintas

**Objetivo:** elegir la temporalidad adecuada para tu horizonte y combinar varias.
**Idea clave:** en un gráfico diario puedes ver una tendencia alcista y en uno de 5 minutos, una caída. Las dos son ciertas: depende de tu horizonte.

### Las temporalidades

| Temporalidad | Cada vela es… | Para quién |
|---|---|---|
| 1 min, 5 min, 15 min | Minutos | *Scalping* y *day trading* (muy difícil, mucho ruido) |
| 1 hora | Una hora | *Swing trading* de pocos días |
| Diario (1D) | Un día | *Swing trading* y posiciones de semanas o meses |
| Semanal (1S) | Una semana | Inversor de medio y largo plazo |
| Mensual (1M) | Un mes | Visión histórica y de largo plazo |

En E-Trading, los botones **1m, 5m, 15m, 1h, 1D, 1S y 1M** cambian la temporalidad. Cada uno carga la historia disponible: hasta 5 días en 1 minuto, varios años en diario y toda la historia en semanal y mensual.

### Ruido y señal

Cuanto más corta la temporalidad, más **ruido**: movimientos aleatorios que no significan nada. Por eso las señales en gráficos de minutos fallan más, y además cada operación paga comisión y *spread*. Es una de las razones por las que el *day trading* es tan difícil.

### Análisis en varias temporalidades

Una práctica habitual (el método de "las tres pantallas" de Alexander Elder):

1. **Temporalidad mayor** (por ejemplo, semanal): decide la **dirección**. Solo buscas compras si la tendencia semanal es alcista.
2. **Temporalidad intermedia** (diaria): buscas el **momento**, por ejemplo un retroceso.
3. **Temporalidad menor** (horas): afinas la **entrada** y el stop.

**En el simulador:** abre el gráfico del S&P 500 (^GSPC). Míralo en 1M, después en 1D y después en 15m. Escribe en una frase qué "tendencia" ves en cada uno.

**Truco de Lumi:** "Antes de mirar la vela de cinco minutos, mira dónde está la de la semana."

---

## Lección 7.4 · Escala lineal y escala logarítmica

**Objetivo:** elegir entre escala lineal y logarítmica según el periodo que analizas.
**Idea clave:** en escala logarítmica, la misma distancia vertical significa el mismo porcentaje. Para periodos largos es la única honesta.

### La diferencia

- **Lineal:** cada centímetro vale los mismos euros. De 10 a 20 € ocupa lo mismo que de 100 a 110 €.
- **Logarítmica:** cada centímetro vale el mismo porcentaje. De 10 a 20 € (+100 %) ocupa lo mismo que de 100 a 200 € (+100 %).

### Por qué importa

En un gráfico lineal de 50 años del S&P 500, las caídas de los años 70 o de 1987 parecen insignificantes y la de 2020 parece enorme. En escala logarítmica se ve que en 1987 la caída fue de más del 30 % en pocos días, comparable a la de 2020. Para activos que se han multiplicado mucho (bitcoin, grandes tecnológicas), el gráfico lineal **engaña**.

**Regla:** para periodos de varios años, escala logarítmica. Para días o semanas, da igual.

**Truco de Lumi:** "En el largo plazo, lo que importa son los porcentajes, no los euros. La escala logarítmica te los enseña."

---

## Lección 7.5 · La tendencia: máximos y mínimos

**Objetivo:** identificar si un activo está en tendencia alcista, bajista o lateral usando máximos y mínimos.
**Idea clave:** tendencia alcista = máximos y mínimos cada vez más altos. Bajista = cada vez más bajos.

### La teoría de Dow

Charles Dow, fundador del *Wall Street Journal*, formuló a finales del siglo XIX las ideas en las que se basa todo el análisis técnico:

1. **El precio lo descuenta todo:** la información conocida ya está en el precio.
2. **Los precios se mueven en tendencias.**
3. **Las tendencias tienen tres grados:** primaria (meses o años), secundaria (semanas o meses, las correcciones) y menor (días).
4. **Una tendencia sigue vigente hasta que hay señales claras de que ha cambiado.**
5. **El volumen debe confirmar la tendencia.**

### Cómo se identifica

- **Alcista:** cada subida supera el máximo anterior (**máximos crecientes**) y cada caída se queda por encima del mínimo anterior (**mínimos crecientes**).
- **Bajista:** máximos decrecientes y mínimos decrecientes.
- **Lateral (rango):** el precio rebota entre un techo y un suelo sin dirección clara.

### Cuándo cambia una tendencia

Una tendencia alcista se pone en duda cuando el precio **no supera el último máximo** y después **pierde el último mínimo**. Ese es el primer mínimo decreciente: la estructura se ha roto.

### Pendiente y fuerza

- Las tendencias muy verticales suelen ser insostenibles y acabar en correcciones bruscas.
- Las correcciones del 5–10 % son normales dentro de una tendencia alcista sana. Se producen varias veces al año en el S&P 500.

### La evidencia: el "momentum" existe

A diferencia de muchas herramientas técnicas, la **persistencia de las tendencias** tiene respaldo académico:
- **Momentum transversal:** las acciones que más han subido en los últimos 3–12 meses tienden a seguir rindiendo mejor que las que más han bajado durante unos meses (Jegadeesh y Titman, 1993).
- **Momentum temporal o seguimiento de tendencia:** en futuros de índices, divisas, bonos y materias primas, las rentabilidades de los últimos 1–12 meses han tendido a persistir (Moskowitz, Ooi y Pedersen, 2012). Hurst, Ooi y Pedersen encontraron este efecto en datos desde 1880.

Eso no significa que sea fácil de aprovechar: los costes, los giros bruscos y la disciplina necesaria lo complican mucho para un particular.

**En el simulador:** usa la herramienta **Línea de tendencia** en un gráfico diario y marca los dos últimos mínimos crecientes. Después marca los máximos con la **línea horizontal**.

**Truco de Lumi:** "La tendencia es tu amiga… hasta que deja de hacer máximos más altos."

---

## Lección 7.6 · El volumen: la fuerza detrás del precio

**Objetivo:** usar el volumen para confirmar o poner en duda un movimiento del precio.
**Idea clave:** un movimiento con mucho volumen tiene a mucha gente detrás. Uno sin volumen puede ser una ilusión.

### Qué es

El **volumen** es la cantidad de acciones, contratos o monedas que cambian de manos en un periodo. En E-Trading aparece como barras debajo del gráfico, verdes si la vela subió y rojas si bajó (activa o desactiva "Volumen" en Indicadores).

### Cómo se lee

| Precio | Volumen | Interpretación habitual |
|---|---|---|
| Sube | Alto | Subida con convicción, confirma la tendencia |
| Sube | Bajo y decreciente | Subida débil, posible agotamiento |
| Baja | Alto | Venta con convicción (en una caída fuerte, puede ser pánico y capitulación) |
| Baja | Bajo | Corrección tranquila dentro de una tendencia alcista |
| Rompe un nivel importante | Alto | Rotura más fiable |
| Rompe un nivel importante | Bajo | Riesgo de **falsa rotura** |

### Picos de volumen

Los picos enormes de volumen suelen aparecer en **noticias** (resultados, fusiones), en **vencimientos** de derivados y en **momentos de pánico o euforia**. Tras una caída fuerte, un pico de volumen extremo a veces marca la **capitulación**: los últimos vendedores se rinden. No siempre: puede haber varios.

### Limitaciones

- En **divisas** no hay un volumen centralizado: lo que muestran muchos gráficos es un dato parcial.
- En **criptomonedas**, el volumen se reparte entre muchas plataformas y parte puede ser artificial.
- En **índices**, el volumen depende de cómo lo calcule cada proveedor.

**Truco de Lumi:** "El precio te dice qué pasa. El volumen te dice cuánta gente lo cree."

---

## Banco de preguntas · Módulo 7

**1.** En una vela diaria, ¿qué dato se considera más importante?
- a) La apertura.
- b) **El cierre.** ✅
- c) El máximo.

**2.** ¿Qué tipo de gráfico NO muestra los precios reales de apertura y cierre de cada periodo?
- a) Velas japonesas.
- b) Barras.
- c) **Heikin Ashi.** ✅

**3.** Una acción ha pasado de 1 € a 300 € en 15 años. ¿Qué escala usarías para analizar su historia?
- a) Lineal.
- b) **Logarítmica.** ✅

**4.** Los máximos de un activo son 50, 54 y 58 €, y sus mínimos 45, 48 y 52 €. ¿Qué tendencia tiene?
- a) **Alcista.** ✅
- b) Bajista.
- c) Lateral.

**5.** Verdadero o falso: "Cuanto más corta es la temporalidad, más ruido aleatorio hay en el gráfico."
- **Verdadero** ✅

**6.** El precio rompe una resistencia importante con un volumen muy inferior a la media. ¿Qué riesgo hay?
- **Que sea una falsa rotura.** ✅

**7.** Según la teoría de Dow, ¿cuándo se pone en duda una tendencia alcista?
- **Cuando el precio no supera el máximo anterior y pierde el último mínimo.** ✅

**8.** ¿Qué dice la evidencia académica sobre el *momentum*?
- a) Que no existe.
- b) **Que las tendencias de 3–12 meses han tendido a persistir en muchos mercados, aunque es difícil de aprovechar tras costes.** ✅
- c) Que garantiza ganancias.

**9.** Ordena las temporalidades de menor a mayor ruido: Mensual → Semanal → Diario → 1 hora → 5 minutos ✅

**10. Práctica en el gráfico.** Abre el gráfico semanal de un índice. Marca con la línea horizontal el máximo más alto de los últimos 2 años y con la línea de tendencia los dos últimos mínimos importantes. ¿La tendencia es alcista, bajista o lateral?
*Se valida en la app según los máximos y mínimos del gráfico real.*

---

## Fuentes del módulo

- Murphy, J. (1999). *Technical Analysis of the Financial Markets*. New York Institute of Finance.
- Dow, C., recopilado en Rhea, R. (1932). *The Dow Theory*.
- Elder, A. (1993). *Trading for a Living* (sistema de las tres pantallas).
- Jegadeesh, N. y Titman, S. (1993). *Returns to Buying Winners and Selling Losers*. Journal of Finance.
- Moskowitz, T., Ooi, Y. y Pedersen, L. (2012). *Time Series Momentum*. Journal of Financial Economics.
- Hurst, B., Ooi, Y. y Pedersen, L. *A Century of Evidence on Trend-Following Investing*. AQR.
