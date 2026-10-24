# Módulo 8 · Velas japonesas

> **Al acabar este módulo sabrás:** leer cualquier vela (cuerpo, mechas y color), interpretar la "batalla" entre compradores y vendedores que cuenta, reconocer los patrones de una, dos y tres velas más usados, aplicarlos solo en el contexto adecuado y saber **cuánto funcionan de verdad**, con las estadísticas de Thomas Bulkowski y la investigación académica.

---

## Lección 8.1 · De Sakata a tu pantalla: la historia de las velas

**Objetivo:** situar el origen de las velas japonesas y por qué se convirtieron en el estándar.
**Idea clave:** las velas nacieron en el mercado de arroz de Japón y llegaron a Occidente en 1991; hoy son el gráfico más usado del mundo.

### El mercado de arroz de Dojima

En el Japón del siglo XVIII, el arroz era moneda. En Osaka funcionaba el mercado de arroz de **Dojima**, uno de los primeros mercados de futuros organizados del mundo. Según la tradición, un comerciante llamado **Munehisa Homma**, de la ciudad de Sakata, registraba los precios y estudiaba el **comportamiento emocional** de los compradores y vendedores. Muchos nombres de patrones (*estrellas*, *soldados*, *cuervos*) vienen de esa tradición, aunque la forma gráfica actual se desarrolló más tarde, durante el periodo Meiji.

### Steve Nison

Las velas eran casi desconocidas fuera de Japón hasta que **Steve Nison** publicó *Japanese Candlestick Charting Techniques* en 1991. Hoy, prácticamente todas las plataformas (TradingView, brókers, E-Trading) muestran velas por defecto.

### Por qué gustan tanto

- Muestran los **cuatro precios** (apertura, máximo, mínimo, cierre) de un vistazo.
- El **color** dice al instante si el periodo fue alcista o bajista.
- La forma revela **quién controló** el periodo: compradores o vendedores.

**Truco de Lumi:** "Cada vela es un pequeño combate entre compradores y vendedores. El cierre dice quién ganó."

---

## Lección 8.2 · Anatomía de una vela

**Objetivo:** identificar el cuerpo, las mechas y el color de una vela y leer sus cuatro precios.
**Idea clave:** el cuerpo va de la apertura al cierre; las mechas llegan al máximo y al mínimo.

```
        │   ← mecha superior: hasta el MÁXIMO
      ┌─┴─┐ ← CIERRE (si es alcista)
      │   │
      │   │ ← CUERPO: entre apertura y cierre
      │   │
      └─┬─┘ ← APERTURA (si es alcista)
        │   ← mecha inferior: hasta el MÍNIMO
```

### Las partes

- **Cuerpo** (rectángulo): entre la apertura y el cierre.
- **Mecha superior** (o sombra): línea desde el cuerpo hasta el **máximo**.
- **Mecha inferior**: línea desde el cuerpo hasta el **mínimo**.

### El color

| Vela | Color en E-Trading (y en casi todas las plataformas) | Significa |
|---|---|---|
| **Alcista** | Verde (tradicionalmente, blanca o hueca) | Cierre **por encima** de la apertura. La apertura está abajo y el cierre arriba. |
| **Bajista** | Roja (tradicionalmente, negra o rellena) | Cierre **por debajo** de la apertura. La apertura está arriba y el cierre abajo. |

> En China, Japón y Corea los colores suelen ir **al revés**: rojo para subir y verde para bajar. Fíjate siempre en la leyenda de la plataforma.

### Ejemplo con números

Una vela diaria con **O = 100, H = 108, L = 97, C = 106**:
- Es **alcista** (cierra en 106, por encima de 100).
- Cuerpo de 100 a 106 (**6 puntos**).
- Mecha superior de 106 a 108 (**2 puntos**).
- Mecha inferior de 97 a 100 (**3 puntos**).
- Rango total: de 97 a 108 (**11 puntos**).

**En el simulador:** en el gráfico de cualquier activo, pasa el dedo por una vela y mira arriba sus O, H, L y C. Calcula de cabeza el tamaño del cuerpo y de las mechas.

**Truco de Lumi:** "Verde: el cierre está arriba. Rojo: el cierre está abajo. Las mechas son hasta dónde se atrevieron a llegar."

---

## Lección 8.3 · Leer la batalla: cuerpo y mechas

**Objetivo:** interpretar lo que cuentan el tamaño del cuerpo y de las mechas sobre compradores y vendedores.
**Idea clave:** un cuerpo grande es convicción; una mecha larga es un rechazo.

### El cuerpo: la convicción

- **Cuerpo largo verde:** los compradores dominaron de principio a fin.
- **Cuerpo largo rojo:** los vendedores dominaron.
- **Cuerpo pequeño:** indecisión. Ninguno ganó con claridad.

"Largo" o "pequeño" es siempre **relativo a las velas anteriores**. Una vela de 2 € puede ser enorme en una acción tranquila e insignificante en una criptomoneda.

### Las mechas: el rechazo

- **Mecha superior larga:** el precio subió mucho durante el periodo, pero los vendedores lo **empujaron de vuelta** abajo. Hubo rechazo de los precios altos.
- **Mecha inferior larga:** el precio cayó mucho, pero los compradores lo **devolvieron arriba**. Hubo rechazo de los precios bajos.

### Leer una vela como una historia

Vela con apertura 50, mínimo 44, máximo 51, cierre 50,5:

> "Abrió en 50. Durante el día los vendedores lo hundieron hasta 44, un −12 %. Pero los compradores aparecieron con fuerza y no solo recuperaron todo: cerraron incluso un poco por encima de la apertura. Los vendedores no pudieron mantener los precios bajos."

Esa vela (cuerpo pequeño arriba, mecha inferior larga) se llama **martillo** si aparece después de una caída (lección 8.5).

### La ubicación lo es todo

La misma vela puede significar cosas distintas según **dónde aparece**:
- Una mecha inferior larga **tras una caída prolongada**, cerca de un soporte, puede indicar agotamiento vendedor.
- La misma vela **en medio de un rango** sin tendencia no significa casi nada.

**Truco de Lumi:** "No leas una vela sola. Pregúntate de dónde viene el precio y dónde está."

---

## Lección 8.4 · Velas individuales: marubozu, peonza y doji

**Objetivo:** reconocer las velas de fuerza (marubozu), de indecisión (peonza) y los distintos tipos de doji.
**Idea clave:** el marubozu dice "fuerza", la peonza dice "duda", el doji dice "empate".

### Marubozu (la vela sin mechas)

Cuerpo largo con poca o ninguna mecha. *Marubozu* significa "cabeza rapada" en japonés.

- **Marubozu alcista:** abre en el mínimo y cierra en el máximo. Los compradores controlaron todo el periodo.
- **Marubozu bajista:** abre en el máximo y cierra en el mínimo.

Suele indicar **continuación** de la fuerza en la dirección de la vela, sobre todo al principio de un movimiento o al romper un nivel.

### Peonza (*spinning top*)

Cuerpo **pequeño** con mechas **superiores e inferiores** de tamaño parecido. El precio se movió en las dos direcciones, pero acabó cerca de donde empezó: **indecisión**. Tras una tendencia larga puede avisar de que pierde fuerza, pero por sí sola no es una señal.

### Doji

Apertura y cierre **prácticamente iguales**: el cuerpo es una raya. Es la vela del **empate perfecto**.

| Tipo | Forma | Lectura habitual |
|---|---|---|
| **Doji normal** | Una cruz: mechas parecidas arriba y abajo | Indecisión total |
| **Doji de patas largas** | Mechas muy largas arriba y abajo | Mucha volatilidad, nadie gana |
| **Doji libélula** (*dragonfly*) | Forma de "T": mecha inferior larga, sin mecha superior | Los vendedores bajaron el precio, pero los compradores lo devolvieron arriba del todo |
| **Doji lápida** (*gravestone*) | Forma de "T" invertida: mecha superior larga | Los compradores subieron el precio, pero los vendedores lo devolvieron abajo del todo |

### Lo que dicen los datos del doji

Nison destacaba que un doji **después de una subida larga** (en sobrecompra) es más significativo que tras una caída. Pero las estadísticas de Bulkowski son modestas: por ejemplo, el **doji libélula** actúa como giro **solo la mitad de las veces**, lo mismo que tirar una moneda. El doji es una señal de **atención**, no de acción: espera a la vela siguiente.

**En el simulador:** busca un doji en el gráfico diario de cualquier índice y mira las tres velas siguientes. ¿Giró el precio o siguió igual? Repite con cinco dojis distintos y anota los resultados.

**Truco de Lumi:** "Un doji no dice 'va a girar'. Dice 'nadie sabe qué hacer'. Espera a la siguiente vela."

---

## Lección 8.5 · Martillo, hombre colgado, martillo invertido y estrella fugaz

**Objetivo:** distinguir las cuatro velas de mecha larga según su forma y su ubicación.
**Idea clave:** la misma forma tiene nombres y significados distintos según aparezca tras una subida o tras una bajada.

### La regla de identificación

- Cuerpo **pequeño** en un extremo del rango.
- Una mecha **al menos dos o tres veces más larga** que el cuerpo.
- Poca o ninguna mecha en el otro lado.

### Las cuatro combinaciones

| Forma | Tras una **caída** | Tras una **subida** |
|---|---|---|
| Cuerpo arriba, mecha **inferior** larga | **Martillo** (posible giro alcista) | **Hombre colgado** (posible giro bajista) |
| Cuerpo abajo, mecha **superior** larga | **Martillo invertido** (posible giro alcista) | **Estrella fugaz** (posible giro bajista) |

### Lo que dicen las estadísticas (Bulkowski)

Thomas Bulkowski analizó miles de casos en acciones de EE. UU. Mide si el precio **cierra por encima del máximo del patrón** (giro alcista) o **por debajo del mínimo** (giro bajista) antes que lo contrario, y ordena 103 patrones del 1 (mejor) al 103 (peor) según su rendimiento posterior.

| Patrón | Comportamiento medido | Rendimiento global (de 103) |
|---|---|---|
| **Martillo** | Giro alcista el **60 %** de las veces | Puesto 65 |
| **Hombre colgado** | ¡Continuación **alcista** el **59 %**! (lo contrario de lo que dice la teoría) | Puesto 87 |
| **Estrella fugaz** | Giro bajista el **59 %** | Puesto 55 |

Bulkowski describe estos resultados como **"no muy lejos del azar"** (50 %). Sus consejos para mejorar los resultados:
- El martillo funciona mejor **cerca del mínimo del año** (en el tercio inferior del rango anual), y los de **cuerpo blanco/verde** van mejor.
- La estrella fugaz funciona mejor cuando aparece en un **rebote dentro de una tendencia bajista**.

### Cómo usarlas con criterio

1. Solo cuentan **tras una tendencia clara** (al menos varias velas en una dirección).
2. Mejor si aparecen **en un soporte o resistencia** (módulo 9).
3. **Espera la confirmación:** la vela siguiente debe cerrar en la dirección del giro (por encima del máximo del martillo, por ejemplo).
4. El stop natural está **al otro lado de la mecha** (debajo del mínimo del martillo).

**Truco de Lumi:** "El martillo solo es martillo si cae tras una caída. Y aun así, acierta poco más que una moneda si no hay contexto."

---

## Lección 8.6 · Patrones de dos velas: envolventes

**Objetivo:** reconocer la envolvente alcista y la bajista y conocer su fiabilidad real.
**Idea clave:** una envolvente es una vela cuyo cuerpo "se come" el cuerpo de la anterior, en sentido contrario.

### Envolvente alcista (*bullish engulfing*)

- Tendencia previa **bajista**.
- Vela 1: **roja**.
- Vela 2: **verde**, que abre por debajo del cierre de la vela 1 y **cierra por encima de su apertura**. Su cuerpo envuelve por completo el cuerpo rojo.

Historia: los vendedores seguían mandando, pero los compradores no solo frenaron la caída: recuperaron todo lo perdido el día anterior y más.

### Envolvente bajista (*bearish engulfing*)

Lo contrario: tras una **subida**, una vela verde seguida de una roja cuyo cuerpo envuelve el verde.

### Estadísticas (Bulkowski)

| Patrón | Comportamiento medido | Rendimiento global (de 103) | Frecuencia |
|---|---|---|---|
| **Envolvente alcista** | Giro alcista el **63 %** | Puesto 84 | Muy frecuente (puesto 12) |
| **Envolvente bajista** | Giro bajista el **79 %** | Puesto 91 | Muy frecuente (puesto 11) |

Fíjate en la paradoja: la envolvente bajista "gira" muy a menudo, pero el **movimiento posterior es pequeño**, por eso queda en el puesto 91 de rendimiento. **Acertar la dirección no basta: el recorrido tiene que compensar el riesgo.**

### Consejos de Bulkowski

- Elige velas **altas** (cuerpos grandes en relación con las anteriores).
- La envolvente alcista funciona mejor **cerca del mínimo anual** y si la **tendencia principal es alcista** (es decir, en una corrección dentro de una subida). Evítala cuando la tendencia principal es bajista.

**En el simulador:** busca una envolvente alcista en el gráfico diario de una acción grande. Usa la herramienta **Medir** desde el cierre de la envolvente hasta el precio 10 velas después.

**Truco de Lumi:** "Una envolvente gira a menudo, pero a veces gira poco. Mira cuánto puede subir antes de entusiasmarte."

---

## Lección 8.7 · Más patrones de dos velas: harami, pauta penetrante y nube oscura

**Objetivo:** reconocer el harami, la pauta penetrante y la cubierta de nube oscura.
**Idea clave:** el harami avisa de que la tendencia pierde fuerza; la pauta penetrante y la nube oscura muestran un contraataque a medias.

### Harami ("embarazada" en japonés)

- Vela 1: cuerpo **largo** en la dirección de la tendencia.
- Vela 2: cuerpo **pequeño** completamente **dentro** del cuerpo de la vela 1.

Es lo contrario de la envolvente: la vela pequeña indica que el impulso se ha frenado. **Harami cruz** si la segunda vela es un doji. Es una señal de **pérdida de fuerza**, más débil que una envolvente.

### Pauta penetrante (*piercing line*)

- Tendencia bajista.
- Vela 1: roja larga.
- Vela 2: verde que **abre por debajo del mínimo** de la vela 1 (con hueco) y **cierra por encima de la mitad** de su cuerpo, sin llegar a envolverlo.

### Cubierta de nube oscura (*dark cloud cover*)

La versión bajista:
- Tendencia alcista.
- Vela 1: verde larga.
- Vela 2: roja que abre **por encima del máximo** de la vela 1 y cierra **por debajo de la mitad** de su cuerpo.

Bulkowski: la cubierta de nube oscura actúa como **giro bajista el 60 %** de las veces, con un rendimiento global aceptable (**puesto 22 de 103**).

### Nota sobre los huecos

En acciones, la apertura de la segunda vela suele producirse con un **hueco** respecto al cierre anterior. En **criptomonedas** (24/7) y en gráficos de **divisas** casi nunca hay huecos entre velas, así que estos patrones se forman de otra manera o pierden sentido.

**Truco de Lumi:** "Un harami es la tendencia tomando aire. Puede seguir corriendo o pararse: espera."

---

## Lección 8.8 · Patrones de tres velas: estrellas, soldados y cuervos

**Objetivo:** reconocer la estrella de la mañana, la estrella de la tarde, los tres soldados blancos y los tres cuervos negros.
**Idea clave:** los patrones de tres velas cuentan una historia más completa y, según Bulkowski, están entre los que mejor funcionan.

### Estrella de la mañana (*morning star*) · giro alcista

1. Tendencia **bajista** y vela roja **larga**.
2. Vela **pequeña** (de cualquier color) que abre con hueco por debajo del cuerpo anterior: la "estrella". Indecisión.
3. Vela **verde larga** que cierra **al menos en la mitad** del cuerpo de la primera vela.

Historia: los vendedores dominan, después dudan, y finalmente los compradores toman el control.

### Estrella de la tarde (*evening star*) · giro bajista

Lo mismo al revés, tras una subida: verde larga, estrella pequeña con hueco arriba, roja larga que cierra por debajo de la mitad de la primera.

Si la vela del medio es un doji, se llaman **estrella doji de la mañana / de la tarde**.

### Tres soldados blancos (*three white soldiers*)

Tres velas **verdes largas** seguidas, cada una con cierre más alto, cerrando cerca de su máximo, y abriendo dentro del cuerpo de la anterior. Indican un avance firme de los compradores.

### Tres cuervos negros (*three black crows*)

Tres velas **rojas largas** seguidas, tras una subida, cada una cerrando cerca de su mínimo y con nuevos mínimos.

### Estadísticas (Bulkowski)

| Patrón | Comportamiento medido | Rendimiento global (de 103) | Frecuencia |
|---|---|---|---|
| **Estrella de la mañana** | Giro alcista el **78 %** | **Puesto 12** | Poco frecuente (66) |
| **Estrella de la tarde** | Giro bajista el **72 %** | **Puesto 4** | Poco frecuente (71) |
| **Estrella doji de la tarde** | Giro bajista el **71 %** | Puesto 30 | |
| **Tres soldados blancos** | Giro alcista el **82 %** | Puesto 32 | Poco frecuente (67) |
| **Tres cuervos negros** | Giro bajista el **78 %** | **Puesto 3** | Poco frecuente (60) |

Los patrones de tres velas son **menos frecuentes** pero tienen mejores estadísticas que las velas sueltas.

Consejos de Bulkowski:
- La estrella de la mañana funciona mejor **cerca del mínimo anual**, con **velas altas**, y en un **retroceso dentro de una tendencia alcista principal**.
- Los tres soldados blancos que aparecen como **rebote dentro de una tendencia bajista** suelen dar paso a que **la bajada continúe**.

**Truco de Lumi:** "Tres velas cuentan mejor la historia que una. Por eso son más fiables, y también más raras."

---

## Lección 8.9 · El contexto: cuándo una vela importa y cuándo no

**Objetivo:** aplicar los cuatro filtros que convierten una vela en una señal útil.
**Idea clave:** un patrón de velas sin contexto es ruido. Con tendencia, nivel, volumen y confirmación, es una pista.

### Los cuatro filtros

1. **Tendencia previa:** un patrón de giro necesita algo que girar. Un martillo sin caída previa no es un martillo.
2. **Nivel:** ¿aparece en un **soporte o resistencia** relevante, en una media móvil importante o en un máximo o mínimo anual? (módulo 9). Bulkowski encuentra repetidamente que la posición dentro del rango anual cambia los resultados.
3. **Volumen:** un patrón de giro con volumen superior a la media es más creíble.
4. **Confirmación:** espera a que la vela siguiente cierre en la dirección esperada. Pierdes un poco de recorrido, pero evitas muchas señales falsas.

### Temporalidad

Los patrones en gráficos **diarios y semanales** son más significativos que en gráficos de minutos, donde el ruido domina.

### Un ejemplo completo

> Una acción en tendencia alcista desde hace un año (máximos y mínimos crecientes en el semanal) corrige un 12 % en tres semanas hasta su media móvil de 200 sesiones, que coincide con un antiguo máximo. Ahí forma un **martillo** con volumen alto. Al día siguiente, una vela verde cierra por encima del máximo del martillo.

Tendencia principal alcista, corrección a un nivel relevante, patrón de giro, volumen y confirmación: **cuatro de cuatro**. Aun así, puede fallar. Por eso el stop va debajo del mínimo del martillo, y el tamaño de la posición se calcula para perder como mucho un 1 % de la cartera (módulo 10).

**Truco de Lumi:** "La vela es la frase. El contexto es el libro entero."

---

## Lección 8.10 · Lo que dice la ciencia sobre las velas

**Objetivo:** valorar con datos hasta qué punto los patrones de velas permiten ganar dinero.
**Idea clave:** que un patrón "acierte la dirección" más del 50 % de las veces no significa que sea rentable después de costes.

### Los estudios académicos

- **Marshall, Young y Rose** (Massey University) probaron **28 patrones** de velas en las acciones del Dow Jones (1992–2002), manteniendo la posición 10 días. Los patrones alcistas de una vela fueron seguidos de subidas **menos de la mitad de las veces**, y la conclusión general fue que las estrategias de velas **no aportaban valor**. Un estudio similar en el mercado japonés (1975–2004), el país de origen de las velas, llegó a la misma conclusión.
- Otros trabajos encuentran **resultados positivos en mercados o periodos concretos** (por ejemplo, algunos patrones de un día en el Dow Jones o en mercados emergentes), pero son difíciles de repetir fuera de la muestra y suelen desaparecer tras los costes.
- El problema de fondo es el **sesgo de búsqueda de datos** (*data snooping*): si pruebas cien patrones, alguno parecerá funcionar por pura casualidad.

### Las estadísticas de Bulkowski, bien leídas

- Muchas velas famosas (martillo, estrella fugaz, doji libélula) están **cerca del 50–60 %**, apenas mejor que el azar.
- Los patrones de **tres velas** (estrellas, tres cuervos) tienen mejores números, pero son **poco frecuentes**.
- Sus pruebas miden giros sobre el precio, **sin comisiones ni *spreads***, y en acciones de EE. UU.

### Entonces, ¿para qué aprender velas?

1. Para **leer el mercado:** las velas son el idioma en que hablan los gráficos. Entenderlas te dice qué está pasando: rechazo, convicción, indecisión.
2. Para **gestionar el riesgo:** una mecha larga te da un sitio lógico para el stop.
3. Como **una pieza más**, nunca la única: tendencia + nivel + vela + volumen + gestión del riesgo.
4. Para **no dejarte engañar** por quien vende patrones "con un 90 % de acierto".

**En el simulador:** E-Trading te propondrá un reto de 20 velas: anota antes de mirar lo que crees que hará el precio, y después compruébalo. Es la mejor forma de descubrir por ti mismo hasta dónde llegan los patrones.

**Truco de Lumi:** "Las velas son un idioma, no una bola de cristal."

---

## Banco de preguntas · Módulo 8

**1.** Una vela tiene apertura 40, máximo 44, mínimo 39 y cierre 43. ¿De qué color es en E-Trading?
- a) **Verde** ✅
- b) Roja

*Explicación:* cierra (43) por encima de la apertura (40).

**2.** En la vela anterior, ¿cuánto mide el cuerpo y cuánto la mecha superior?
- **Cuerpo: 3 (de 40 a 43). Mecha superior: 1 (de 43 a 44).** ✅

**3.** ¿Qué indica una mecha superior muy larga?
- a) Que los compradores dominaron todo el periodo.
- b) **Que hubo rechazo de los precios altos: los vendedores devolvieron el precio abajo.** ✅
- c) Nada.

**4.** Una vela con cuerpo pequeño arriba y mecha inferior larga aparece tras una fuerte **subida**. ¿Cómo se llama?
- a) Martillo
- b) **Hombre colgado** ✅
- c) Estrella fugaz

**5.** Verdadero o falso: "Según Bulkowski, el martillo acierta el giro alcista el 90 % de las veces."
- **Falso** ✅

*Explicación:* lo hace alrededor del 60 %, y él mismo lo describe como cercano al azar.

**6.** ¿Qué es un doji?
- **Una vela con apertura y cierre prácticamente iguales: indecisión.** ✅

**7.** Describe una envolvente alcista.
- **Tras una caída, una vela roja seguida de una verde cuyo cuerpo envuelve por completo el cuerpo rojo.** ✅

**8.** La envolvente bajista acierta el giro el 79 % de las veces según Bulkowski, pero queda en el puesto 91 de 103 en rendimiento. ¿Por qué?
- **Porque el movimiento posterior suele ser pequeño: acertar la dirección no basta si el recorrido no compensa.** ✅

**9.** Ordena las velas de una estrella de la mañana: Roja larga → Vela pequeña con hueco abajo → Verde larga que cierra por encima de la mitad de la primera ✅

**10.** ¿Qué patrón tiene, según Bulkowski, uno de los mejores rendimientos globales (puesto 3)?
- a) Martillo
- b) **Tres cuervos negros** ✅
- c) Doji libélula

**11.** ¿Cuáles son los cuatro filtros que dan valor a un patrón de velas?
- **Tendencia previa, nivel (soporte/resistencia), volumen y confirmación.** ✅

**12.** ¿Qué concluyeron Marshall, Young y Rose al probar 28 patrones de velas en el Dow Jones?
- **Que las estrategias basadas en velas no aportaban valor para generar beneficios.** ✅

**13. Práctica en el gráfico.** En el gráfico diario que te muestra la app, toca la vela que forma un martillo.
*Pregunta de tipo "punto del gráfico": la solución vive en el servidor.*

**14. Caso práctico.** Ves una estrella fugaz en el gráfico de 5 minutos de una criptomoneda, en mitad de un rango lateral, con volumen bajo. ¿Abrirías una venta?
*Respuesta modelo:* no. Falla en los cuatro filtros: no hay tendencia previa clara, no está en un nivel relevante, el volumen es bajo y no hay confirmación. Además, en 5 minutos domina el ruido y la estrella fugaz, incluso en buenas condiciones, solo acierta alrededor del 59 %.

---

## Fuentes del módulo

- Nison, S. (1991). *Japanese Candlestick Charting Techniques*. New York Institute of Finance.
- Bulkowski, T. (2008). *Encyclopedia of Candlestick Charts*. Wiley; y estadísticas actualizadas en thepatternsite.com (martillo 60 %, puesto 65; envolvente alcista 63 %, puesto 84; envolvente bajista 79 %, puesto 91; estrella fugaz 59 %, puesto 55; hombre colgado: continuación alcista 59 %, puesto 87; estrella de la mañana 78 %, puesto 12; estrella de la tarde 72 %, puesto 4; estrella doji de la tarde 71 %, puesto 30; tres soldados blancos 82 %, puesto 32; tres cuervos negros 78 %, puesto 3; nube oscura 60 %, puesto 22; doji libélula ≈ 50 %).
- Marshall, B., Young, M. y Rose, L. *Candlestick Technical Trading Strategies: Can They Create Value for Investors?* (Dow Jones, 1992–2002); y Young, M. (2006), *Are Candlestick Technical Trading Strategies Profitable in the Japanese Equity Market?*
- Sullivan, R., Timmermann, A. y White, H. (1999). *Data-Snooping, Technical Trading Rule Performance, and the Bootstrap*. Journal of Finance.
