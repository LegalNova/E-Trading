# Módulo 3 · Riesgo y rentabilidad

> **Al acabar este módulo sabrás:** medir el riesgo con la volatilidad y la máxima caída, calcular cuánto hay que subir para recuperar una pérdida, explicar por qué diversificar es "lo único gratis" en finanzas, y qué nos enseña la historia de las grandes crisis.

---

## Lección 3.1 · No hay rentabilidad sin riesgo

**Objetivo:** relacionar la rentabilidad esperada de cada activo con su riesgo.
**Idea clave:** si alguien te ofrece mucha rentabilidad sin riesgo, o no lo entiende o te está engañando.

### La escalera del riesgo

Datos de 125 años (1900–2024, 35 mercados, UBS Global Investment Returns Yearbook 2025), rentabilidad anual **por encima de la inflación**:

| Activo | Rentabilidad real anual mundial |
|---|---|
| Letras del Tesoro (dinero a muy corto plazo) | 0,5 % |
| Bonos del Estado | 1,7 % |
| Acciones | 5,2 % |

En EE. UU., las acciones dieron cerca de un **9,7 % nominal** al año (6,6 % real) desde 1900. Un dólar invertido en 1900 se habría convertido en más de 100.000 dólares a finales de 2024.

Las acciones rinden más **porque son más arriesgadas**: los inversores exigen una **prima de riesgo** por aguantar las caídas. Si no hubiera caídas, no habría prima.

### Lo que no aparece en la media

En el siglo XXI la rentabilidad real de la bolsa mundial ha sido más baja: alrededor de un **3,5 % anual** de 2000 a 2024, por empezar en la burbuja de 2000 y pasar por dos crisis enormes. Las medias de largo plazo esconden décadas buenas y décadas perdidas.

**Truco de Lumi:** "La rentabilidad es el premio por aguantar. El riesgo es lo que tienes que aguantar."

---

## Lección 3.2 · Medir el riesgo: volatilidad y máxima caída

**Objetivo:** interpretar la volatilidad y la máxima caída (*drawdown*) de un activo.
**Idea clave:** la volatilidad mide cuánto se mueve; la máxima caída mide cuánto puede doler.

### Volatilidad

La **volatilidad** es la **desviación típica** de las rentabilidades: cuánto se alejan normalmente de su media. Valores orientativos anuales:

| Activo | Volatilidad anual aproximada |
|---|---|
| Letras del Tesoro | < 1 % |
| Bonos de grandes Estados a medio plazo | 4–7 % |
| Índice mundial de acciones | 15 % |
| Una acción individual grande | 25–35 % |
| Una acción pequeña o tecnológica joven | 40–70 % |
| Bitcoin | 50–80 % |

**Regla práctica:** en un año normal, un activo con una rentabilidad esperada del 7 % y una volatilidad del 15 % se moverá dos de cada tres años entre **−8 % y +22 %** (media ± 1 desviación), y diecinueve de cada veinte entre **−23 % y +37 %** (media ± 2). Las crisis fuertes caen fuera de ese rango más a menudo de lo que diría la estadística "normal": los mercados tienen **colas gruesas**.

### Máxima caída (*drawdown*)

La **máxima caída** es la mayor bajada desde un máximo hasta el mínimo siguiente. Es la medida que mejor refleja **el dolor real**.

| Episodio | Caída del S&P 500 (precio) | Tiempo hasta volver al máximo |
|---|---|---|
| 1929–1932 | −83 % | Unos 15 años con dividendos, 25 sin ellos |
| 2000–2002 (puntocom) | −49 % | Unos 7 años en precio (y volvió a caer en 2008) |
| 2007–2009 (crisis financiera) | −57 % | Unos 4 años con dividendos |
| 2020 (covid) | −34 % en 33 días | Unos 5 meses |
| 2022 (inflación y tipos) | Cerca del −25 % | Unos 2 años |

El Nasdaq cayó cerca de un **78 %** de 2000 a 2002 y tardó unos 15 años en recuperar su máximo. El IBEX 35 cayó más de un 50 % en 2008–2012.

**En el simulador:** en la ficha de cualquier índice, usa el gráfico de intervalo mensual (1M) y busca con la herramienta **Medir** las mayores caídas desde un máximo.

**Truco de Lumi:** "No preguntes cuánto puedes ganar. Pregunta cuánto puede caer y si aguantarías sin vender."

---

## Lección 3.3 · Las matemáticas de las pérdidas

**Objetivo:** calcular la subida necesaria para recuperar una pérdida.
**Idea clave:** las pérdidas y las ganancias no son simétricas. Evitar las grandes pérdidas es más importante que buscar grandes ganancias.

### La tabla que todo inversor debe conocer

> **Subida necesaria = 1 ÷ (1 − caída) − 1**

| Si pierdes… | …necesitas ganar para recuperarte |
|---|---|
| 10 % | 11,1 % |
| 20 % | 25 % |
| 30 % | 42,9 % |
| 50 % | 100 % |
| 75 % | 300 % |
| 90 % | 900 % |

Con pérdidas pequeñas la diferencia apenas se nota. Con pérdidas grandes es devastadora: una acción que cae un 90 % tiene que multiplicarse por diez para volver al punto de partida.

### Consecuencias prácticas

1. **Diversificar** evita que una sola empresa te provoque una pérdida del 90 %.
2. **El apalancamiento** acelera las pérdidas grandes: con apalancamiento 1:5, una caída del 20 % del activo se lleva el 100 % de tu dinero.
3. **En trading**, el stop loss sirve para que ninguna operación te cause una pérdida de la que cueste mucho recuperarse.
4. **La media engaña:** +50 % un año y −50 % al siguiente no es "0 % de media". 100 € → 150 € → 75 €. Has perdido un 25 %.

**Truco de Lumi:** "Perder el 50 % exige ganar el 100 %. Protege primero lo que tienes."

---

## Lección 3.4 · Diversificar: lo único gratis en finanzas

**Objetivo:** explicar por qué repartir la inversión reduce el riesgo sin reducir necesariamente la rentabilidad esperada.
**Idea clave:** con muchas empresas, los desastres de unas se compensan con los éxitos de otras.

### Riesgo específico y riesgo de mercado

- **Riesgo específico:** lo que le pasa a una empresa concreta (un fraude, un producto fallido, la quiebra). Se puede **eliminar** diversificando.
- **Riesgo de mercado** (sistemático): lo que afecta a todas a la vez (una recesión, una pandemia). **No** se elimina diversificando en acciones, solo se reduce combinando con otros activos (bonos, liquidez).

Harry Markowitz, premio Nobel, llamó a la diversificación **"el único almuerzo gratis"** en finanzas: reduces riesgo sin renunciar a rentabilidad esperada.

### Cuántas acciones hacen falta

Con una sola acción, la volatilidad típica ronda el 30–35 %. Con 20–30 acciones de sectores distintos baja hacia el 20 %. Con un índice de miles de empresas, al nivel del mercado (unos 15 %). A partir de ahí no se reduce más con acciones: es el riesgo de mercado.

### El argumento de Bessembinder

Diversificar no solo reduce el riesgo. También **asegura que tengas las pocas empresas que hacen ganar al mercado**. Recuerda: desde 1926, solo un 4 % de las acciones de EE. UU. explicó toda la ganancia neta, y más de la mitad rindió menos que las letras del Tesoro. Si eliges 5 acciones, lo más probable es que no estén las ganadoras. Si compras el índice, las tienes seguro.

### Diversificar en varias dimensiones

1. **Empresas:** muchas, no pocas.
2. **Sectores:** tecnología, salud, banca, consumo, energía, industria…
3. **Países y regiones:** América, Europa, Asia, emergentes. España supone menos del 1 % de la bolsa mundial; Japón fue la mayor bolsa del mundo en 1989 y tardó 34 años en recuperar aquel máximo.
4. **Tipos de activo:** acciones, bonos, liquidez y quizás oro.
5. **Tiempo:** invertir poco a poco reduce el riesgo de entrar todo en un mal momento (módulo 4).

### Lo que no es diversificar

- Tener 10 fondos que compran las mismas 50 tecnológicas.
- Tener 15 criptomonedas: suelen caer todas a la vez.
- Tener todo en acciones de la empresa donde trabajas: si va mal, pierdes el sueldo y los ahorros a la vez.

**En el simulador:** la app te avisa si una compra supera el 20 % de tu cartera en un solo activo. Prueba a construir una cartera con 6–8 activos de regiones y tipos distintos y mira el gráfico de distribución en "Cartera".

**Truco de Lumi:** "No pongas todos los huevos en la misma cesta, ni todas las cestas en el mismo camión."

---

## Lección 3.5 · Correlación: por qué unos activos protegen a otros

**Objetivo:** usar la correlación para entender qué activos combinan bien.
**Idea clave:** combinar activos que no se mueven igual suaviza la cartera.

### Qué es

La **correlación** mide si dos activos se mueven a la vez. Va de **+1** (siempre igual) a **−1** (siempre al contrario). 0 significa que no hay relación.

| Pareja | Correlación típica |
|---|---|
| Dos índices de bolsa desarrollados (S&P 500 y Euro Stoxx 50) | Alta (0,7–0,9) |
| Acciones y bonos del Estado de calidad | Baja o negativa en muchas crisis, pero positiva en otras (2022) |
| Acciones y oro | Baja, variable |
| Dos criptomonedas grandes | Muy alta |

### La trampa de las crisis

En las crisis, muchas correlaciones **suben**: casi todos los activos de riesgo caen a la vez. Por eso la renta fija de calidad y la liquidez son las que realmente protegen en un pánico. En 2022, en cambio, la inflación hizo caer acciones y bonos juntos: ninguna protección es perfecta siempre.

**Truco de Lumi:** "Diversificar de verdad es tener cosas que no se hundan todas el mismo día."

---

## Lección 3.6 · El horizonte temporal cambia el riesgo

**Objetivo:** explicar por qué el riesgo de perder baja al alargar el plazo, y sus límites.
**Idea clave:** a un día, la bolsa es casi una moneda al aire; a veinte años, históricamente ha sido muy probable ganar.

### Probabilidad de ganar según el plazo (S&P 500, histórico aproximado)

| Plazo | Proporción de periodos con ganancia |
|---|---|
| 1 día | Algo más del 50 % |
| 1 año | Alrededor del 73 % |
| 10 años | Alrededor del 90 % |
| 20 años | Casi el 100 % de los periodos desde 1926 |

### Los límites

- Esto es **historia de EE. UU.**, el mercado que mejor ha ido del mundo. Otros mercados han tenido décadas perdidas (Japón desde 1989, Italia, España en ciertos tramos).
- **No es una ley física.** Por eso diversificar por países es importante: reduce el riesgo de elegir "el Japón de los próximos 30 años".

### Perderse los mejores días

J.P. Morgan calcula que 10.000 $ invertidos en el S&P 500 de 2005 a 2024 se convirtieron en unos **71.750 $** (10,4 % anual). Quien se perdió solo **los 10 mejores días** acabó con unos **32.871 $** (6,1 %). Y **7 de los 10 mejores días** llegaron a menos de dos semanas de alguno de los 10 peores. Salir del mercado "para esperar a que pase la tormenta" suele hacer perder justo los rebotes.

**Truco de Lumi:** "En bolsa, el tiempo dentro del mercado vale más que acertar cuándo entrar."

---

## Lección 3.7 · Lecciones de las grandes crisis

**Objetivo:** extraer de las crisis históricas reglas prácticas para no repetir los errores.
**Idea clave:** las crisis siempre parecen distintas y siempre se repite lo mismo: quien estaba diversificado, sin deudas y con paciencia, se recuperó.

| Crisis | Qué pasó | Lección |
|---|---|---|
| **Crack de 1929** | Burbuja financiada con préstamos (se compraba con un 10 % del dinero). Caída del 83 % y Gran Depresión. | El apalancamiento convierte una caída en ruina. |
| **Japón 1989** | Burbuja de bolsa e inmobiliaria. El Nikkei tardó 34 años en recuperar su máximo. | Un solo país puede estancarse décadas. Diversifica geográficamente. |
| **Burbuja puntocom (2000)** | Empresas sin beneficios valoradas en miles de millones. El Nasdaq cayó un 78 %. | El precio importa. Una gran empresa puede ser una mala inversión si pagas demasiado. |
| **Crisis financiera (2008)** | Hipotecas basura, bancos apalancados, quiebra de Lehman Brothers. Bolsas −50 %. | Hasta los "expertos" fallan. Ten colchón y evita productos que no entiendes. |
| **Covid (2020)** | Caída del 34 % en un mes y recuperación en meses. | Nadie predice el suelo. Vender en pánico fue el gran error. |
| **2022** | Inflación y subidas rápidas de tipos: caen acciones y bonos a la vez; las criptos, más de un 70 %. | Ninguna protección funciona siempre. Las modas especulativas son las que más caen. |

### Las cinco reglas que salen de la historia

1. No inviertas con dinero prestado.
2. Diversifica entre empresas, sectores y países.
3. Ten un colchón para no tener que vender en una crisis.
4. No pagues cualquier precio: las burbujas acaban mal.
5. No vendas en pánico. Si tu plan era a 20 años, una caída de 6 meses no lo cambia.

**Truco de Lumi:** "Las crisis no avisan, pero sí se pueden preparar: colchón, diversificación y nada de deudas."

---

## Banco de preguntas · Módulo 3

**1.** Según el UBS Yearbook 2025, ¿cuál ha sido la rentabilidad real anual de las acciones mundiales desde 1900?
- a) 1,7 %
- b) **5,2 %** ✅
- c) 12 %

**2.** Una acción cae un 50 %. ¿Cuánto tiene que subir para volver al precio inicial?
- a) 50 %
- b) 75 %
- c) **100 %** ✅

**3.** Un activo sube un 50 % un año y cae un 50 % al siguiente. Empezaste con 1.000 €. ¿Cuánto tienes?
- a) 1.000 €
- b) **750 €** ✅
- c) 500 €

*Explicación:* 1.000 → 1.500 → 750.

**4.** ¿Qué riesgo elimina la diversificación entre muchas acciones?
- a) El riesgo de mercado.
- b) **El riesgo específico de cada empresa.** ✅
- c) Todo el riesgo.

**5.** Verdadero o falso: "Según Bessembinder, la mayoría de las acciones de EE. UU. desde 1926 rindió más que las letras del Tesoro."
- **Falso** ✅

*Explicación:* más de la mitad rindió menos. Solo un 4 % explicó toda la ganancia neta del mercado.

**6.** ¿Qué combinación diversifica mejor?
- a) 15 criptomonedas distintas.
- b) 10 fondos tecnológicos de EE. UU.
- c) **Un fondo de acciones mundiales y otro de bonos de calidad.** ✅

**7.** Según J.P. Morgan (2005–2024), quien se perdió los 10 mejores días del S&P 500 obtuvo aproximadamente:
- a) Lo mismo que quien estuvo invertido siempre.
- b) **La mitad del resultado final.** ✅
- c) El doble.

**8.** Una cartera tiene una rentabilidad esperada del 7 % y una volatilidad del 15 %. ¿Entre qué valores se moverá aproximadamente dos de cada tres años?
- a) Entre 0 % y 7 %.
- b) **Entre −8 % y +22 %.** ✅
- c) Entre −50 % y +50 %.

**9.** ¿Qué lección deja el caso de Japón desde 1989?
- **Un solo país puede pasar décadas sin recuperar su máximo: hay que diversificar entre países.** ✅

**10.** Ordena de menor a mayor volatilidad típica: Letras del Tesoro → Bonos del Estado → Índice mundial de acciones → Acción individual → Bitcoin ✅

**11. Caso práctico.** Pedro tiene el 80 % de sus ahorros en acciones de la empresa donde trabaja, porque "la conoce bien". ¿Qué riesgo corre?
*Respuesta modelo:* concentración extrema. Si la empresa va mal, puede perder el empleo y gran parte de sus ahorros a la vez. Es justo el riesgo específico que la diversificación elimina.

---

## Fuentes del módulo

- Dimson, Marsh y Staunton, *UBS Global Investment Returns Yearbook 2025* (rentabilidades reales 1900–2024).
- Bessembinder, H. (2018). *Do Stocks Outperform Treasury Bills?*
- Markowitz, H. (1952). *Portfolio Selection*. Journal of Finance.
- J.P. Morgan Asset Management, *Guide to Retirement* (efecto de perderse los mejores días, 2005–2024).
- Datos históricos de caídas del S&P 500 (precio y rentabilidad total): S&P Dow Jones Indices y recopilaciones como DQYDJ.
