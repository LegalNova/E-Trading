# Módulo 10 · Gestión del riesgo y plan de trading

> **Al acabar este módulo sabrás:** calcular el tamaño de cada operación para arriesgar solo un porcentaje fijo de tu cartera, colocar el stop loss con lógica, medir tus operaciones en múltiplos de riesgo (R), calcular la esperanza matemática de un sistema, entender las rachas de pérdidas, los peligros del apalancamiento, y escribir y probar tu propio plan de trading.
>
> **Este módulo desbloquea en E-Trading las órdenes límite, stop loss y take profit.**

---

## Lección 10.1 · Por qué la gestión del riesgo importa más que acertar

**Objetivo:** explicar por qué la supervivencia es la primera regla del trading.
**Idea clave:** puedes acertar el 60 % de las veces y arruinarte, o acertar el 40 % y ganar dinero. La diferencia es cuánto ganas cuando aciertas y cuánto pierdes cuando fallas.

### Las dos preguntas que hacen los principiantes y la que hacen los profesionales

- Principiante: "¿Qué compro?" y "¿Va a subir?".
- Profesional: "**¿Cuánto pierdo si me equivoco?**"

Nadie sabe si una operación concreta va a salir bien. Lo único que controlas es **cuánto arriesgas** en cada una. Por eso la gestión del riesgo es la única parte del trading que depende al 100 % de ti.

### La ruina

Recuerda la tabla de la lección 3.3: una pérdida del 50 % exige ganar un 100 %. Quien arriesga mucho en cada operación acaba, tarde o temprano, encadenando unas cuantas pérdidas que le dejan fuera del juego. **El primer objetivo de un trader es sobrevivir** para que su ventaja, si la tiene, pueda actuar.

### El ejemplo de las 10 pérdidas seguidas

Diez pérdidas seguidas pasan, incluso con un buen sistema (lección 10.6). Esto es lo que queda de tu cuenta según lo que arriesgues en cada operación:

| Riesgo por operación | Tras 10 pérdidas seguidas te queda… | Para recuperarte necesitas ganar… |
|---|---|---|
| 1 % | 90,4 % | +10,6 % |
| 2 % | 81,7 % | +22,4 % |
| 5 % | 59,9 % | +67 % |
| 10 % | 34,9 % | +187 % |

Con un 1 %, diez pérdidas son un mal mes. Con un 10 %, son el fin.

**Truco de Lumi:** "No puedes controlar si aciertas. Puedes controlar cuánto pierdes cuando fallas."

---

## Lección 10.2 · El tamaño de la posición: la regla del 1 %

**Objetivo:** calcular cuántas acciones comprar para arriesgar exactamente un porcentaje fijo de la cartera.
**Idea clave:** no decides cuánto compras: lo decide la distancia a tu stop. Primero el stop, después el tamaño.

### La fórmula

> **Tamaño (número de acciones) = (Capital × % de riesgo) ÷ (Precio de entrada − Precio del stop)**

### Ejemplo

- Capital: **10.000 €**.
- Riesgo por operación: **1 %** = 100 €.
- Entrada: **50 €**. Stop: **47 €**. Distancia: **3 €** por acción.
- Tamaño: 100 ÷ 3 = **33 acciones** (unos **1.650 €** invertidos).

Si salta el stop, pierdes 33 × 3 = 99 €, un 1 % de tu cuenta, aunque hayas invertido un 16,5 % del capital en esa posición.

### Fíjate en la diferencia

**Riesgo** no es lo mismo que **cantidad invertida**:
- Con un stop muy cercano (por ejemplo, a 1 €), podrías comprar 100 acciones (5.000 €) arriesgando lo mismo, 100 €.
- Con un stop lejano (a 10 €), solo 10 acciones (500 €).

Así, cada operación arriesga lo mismo, sea cual sea el activo y su volatilidad.

### ¿1 %, 2 % o menos?

- La mayoría de profesionales arriesga entre el **0,5 % y el 2 %** por operación.
- Para quien empieza, **un 1 % o menos** es lo razonable.
- Además conviene limitar el **riesgo total abierto** (por ejemplo, no más del 5–6 % de la cuenta en riesgo en todas las posiciones a la vez) y el **peso de cada posición** (E-Trading avisa a partir del 20 % de la cartera en un solo activo).

### El criterio de Kelly (y por qué no usarlo entero)

La fórmula de Kelly calcula el porcentaje "óptimo" a arriesgar según tu porcentaje de acierto y tu relación ganancia/pérdida. En teoría maximiza el crecimiento, pero exige conocer con precisión tus estadísticas (nadie las conoce) y provoca caídas enormes. Quien la usa suele aplicar **una fracción** (un cuarto o la mitad de Kelly). Para un principiante: regla del 1 %.

**En el simulador:** antes de cada compra en E-Trading, decide dónde pondrías el stop y calcula el tamaño con la fórmula. Después usa la orden con stop loss que acabas de desbloquear.

**Truco de Lumi:** "Primero decides dónde te equivocas. Después, cuántas acciones compras. Nunca al revés."

---

## Lección 10.3 · Dónde poner el stop loss

**Objetivo:** colocar el stop en un nivel lógico según la estructura del gráfico o la volatilidad.
**Idea clave:** el stop va donde tu idea deja de ser válida, no donde te duele perder.

### Tres métodos

1. **Stop estructural:** al otro lado de un nivel técnico. Si compras en un soporte, el stop va **por debajo del soporte** (o por debajo del mínimo de la vela de giro). Si el precio pierde ese nivel, tu idea era errónea.
2. **Stop por volatilidad (ATR):** el **ATR** (*Average True Range*) mide el rango medio de las velas de los últimos 14 periodos. Un stop a 2–3 veces el ATR de distancia evita que te saque el ruido normal del mercado.
3. **Stop por tiempo:** si en un plazo determinado (por ejemplo, 10 sesiones) la operación no hace lo previsto, sales.

### Los errores típicos

- **Stop demasiado cerca:** te saca el ruido normal y luego el precio va donde pensabas.
- **Stop en números redondos obvios** (justo en 50,00 €): es donde están los stops de todo el mundo.
- **Mover el stop más lejos** cuando el precio se acerca: es la forma más rápida de convertir una pérdida pequeña en una grande. **Nunca se aleja un stop; solo se acerca a favor.**
- **No poner stop** "porque ya se recuperará". A veces no se recupera.

### El stop que sigue al precio

Cuando la operación va a favor, puedes **subir el stop** para proteger ganancias: al precio de entrada (*break-even*), bajo el último mínimo creciente, o con un **stop dinámico** a una distancia fija (lección 2.5).

### Recuerda los huecos

Un stop no garantiza el precio: si el activo abre con un hueco por debajo, se ejecuta peor. Por eso conviene no tener posiciones demasiado grandes antes de resultados o noticias importantes.

**Truco de Lumi:** "El stop no es donde te duele, es donde tu idea muere."

---

## Lección 10.4 · Pensar en R: ganancias y pérdidas en múltiplos de riesgo

**Objetivo:** medir cada operación en múltiplos de su riesgo inicial (R).
**Idea clave:** si arriesgas 100 € y ganas 300 €, has ganado 3R. Medir en R te deja comparar operaciones de cualquier tamaño.

### Qué es R

**1R** es lo que arriesgas en una operación: la distancia de la entrada al stop multiplicada por el tamaño. En el ejemplo de la lección 10.2, 1R = 100 €.

- Si salta el stop: **−1R**.
- Si ganas 250 €: **+2,5R**.
- Si sales antes con una pérdida de 40 €: **−0,4R**.

### La relación beneficio/riesgo

Antes de entrar, compara la distancia al **objetivo** con la distancia al **stop**:
- Entrada 50 €, stop 47 € (riesgo 3 €), objetivo 59 € (beneficio potencial 9 €): **relación 3:1**.

Muchos operadores no entran en operaciones con una relación inferior a **2:1**. El motivo lo verás en la lección siguiente.

**Truco de Lumi:** "No cuentes euros: cuenta R. Así tus operaciones grandes y pequeñas hablan el mismo idioma."

---

## Lección 10.5 · La esperanza matemática: el único número que importa

**Objetivo:** calcular la esperanza matemática de un sistema a partir de su porcentaje de acierto y su ganancia media.
**Idea clave:** un sistema es rentable si, de media, cada operación gana más de lo que pierde, contando aciertos y fallos.

### La fórmula

> **Esperanza (en R) = (% de acierto × ganancia media en R) − (% de fallo × pérdida media en R)**

### Ejemplos

| Sistema | Acierto | Ganancia media | Pérdida media | Esperanza por operación |
|---|---|---|---|---|
| A | 40 % | 2R | 1R | 0,4 × 2 − 0,6 × 1 = **+0,2R** ✅ |
| B | 60 % | 0,5R | 1R | 0,6 × 0,5 − 0,4 × 1 = **−0,1R** ❌ |
| C | 30 % | 3R | 1R | 0,3 × 3 − 0,7 × 1 = **+0,2R** ✅ |
| D | 50 % | 1R | 1R | **0** (y negativo tras costes) ❌ |

El sistema **B acierta el 60 %** y pierde dinero. El **C acierta solo el 30 %** y gana. Por eso los principiantes que buscan "un sistema que acierte mucho" suelen perder: cortan las ganancias pronto (para sentir que aciertan) y dejan correr las pérdidas.

### Y los costes

Cada operación paga comisión, *spread* y, si hay apalancamiento, financiación. Si tu esperanza es +0,1R y los costes suponen 0,15R por operación, tu sistema real pierde. **Cuantas más operaciones haces, más pesan los costes.** Es la razón principal por la que el *day trading* fracasa tanto.

### Cuánto puedes ganar

Con una esperanza de +0,2R, arriesgando un 1 % por operación y haciendo 100 operaciones al año, la ganancia esperada sería de unos 20R = **un 20 % anual**, con rachas de pérdidas importantes por el camino. Una ventaja de +0,2R ya es **muy buena** y difícil de conseguir de forma sostenida. Desconfía de quien promete mucho más.

**Truco de Lumi:** "No necesitas acertar mucho. Necesitas que tus aciertos valgan más que tus fallos."

---

## Lección 10.6 · Rachas de pérdidas y caídas de la cuenta

**Objetivo:** anticipar las rachas de pérdidas que tendrá incluso un buen sistema.
**Idea clave:** con un sistema que acierta el 50 %, encadenar 6 o más pérdidas seguidas en 100 operaciones es lo normal, no la excepción.

### Simulación

Simulando 20.000 secuencias de 100 operaciones:
- Con un **50 %** de acierto, la racha de pérdidas más larga **típica** es de **6 seguidas**, y más de la mitad de las veces hay al menos una racha de 6 o más.
- Con un **40 %** de acierto (como el sistema A, que es rentable), la racha típica es de **7 pérdidas seguidas**, y casi la mitad de las veces hay rachas de **8 o más**.

### Consecuencias

1. **Prepárate psicológicamente:** 8 pérdidas seguidas con un sistema ganador no significan que el sistema haya dejado de funcionar.
2. **Ajusta el riesgo** para que esas rachas no te destrocen: con un 1 % por operación, 8 pérdidas son un −7,7 %.
3. **No cambies de sistema tras cada racha mala**: así nunca sabrás si alguno funcionaba.
4. **Define cuándo parar:** por ejemplo, si la cuenta cae un 10–15 % desde su máximo, reduces el riesgo a la mitad y revisas.

**Truco de Lumi:** "Ocho fallos seguidos no significan que el plan esté mal. Significan que estás en una racha. Por eso arriesgas poco."

---

## Lección 10.7 · Apalancamiento, CFD y posiciones cortas

**Objetivo:** entender cómo funciona el apalancamiento y por qué es la causa principal de pérdidas de los minoristas.
**Idea clave:** el apalancamiento multiplica las ganancias y las pérdidas por igual, pero las pérdidas grandes te sacan del juego.

### Qué es

**Apalancamiento** es operar con más dinero del que tienes. Con un apalancamiento **1:10**, con 1.000 € controlas una posición de 10.000 €.

- Si el activo sube un 5 %: ganas 500 €, un **+50 %** de tu dinero.
- Si baja un 5 %: pierdes 500 €, un **−50 %**.
- Si baja un 10 %: pierdes **todo**.

### Los CFD

Un **CFD** (contrato por diferencias) es un contrato con el bróker que replica la variación del precio de un activo, normalmente con apalancamiento. No eres dueño del activo.

Según la **ESMA**, entre el **74 % y el 89 %** de las cuentas minoristas de CFD pierden dinero. Por eso desde 2018 en la UE:
- El apalancamiento máximo para minoristas está limitado: **1:30** en divisas principales, **1:20** en índices principales, menos en acciones y **1:2 en criptomonedas**.
- El bróker debe **cerrar la posición** si tu margen cae por debajo del 50 % del requerido.
- **No puedes perder más de lo que has depositado** (protección frente a saldo negativo).
- Debe mostrar el porcentaje de sus clientes que pierde dinero.

Con 1:30, un movimiento del **3,3 %** en contra se lleva todo el margen de esa posición.

### Los costes ocultos del apalancamiento

Mantener un CFD abierto de un día para otro paga **financiación** diaria. A semanas o meses, este coste se come la rentabilidad.

### Posiciones cortas (vender sin tener)

**Ponerse corto** es vender un activo que no tienes (prestado o con un CFD) esperando recomprarlo más barato. Riesgos:
- La pérdida potencial es **ilimitada**: el precio puede subir sin techo.
- Pagas el préstamo de los títulos y los dividendos.
- Las subidas violentas obligan a los cortos a recomprar (*short squeeze*), como en el caso de GameStop en 2021.

### La recomendación de este curso

Mientras aprendes: **sin apalancamiento y sin cortos**. Si algún día los usas, que sea con una parte pequeña del capital, con stop siempre, y calculando el tamaño sobre la **exposición total**, no sobre el margen.

**Truco de Lumi:** "El apalancamiento no te hace mejor trader. Solo hace que tus errores lleguen antes."

---

## Lección 10.8 · Tu plan de trading y tu diario

**Objetivo:** escribir un plan de trading completo y llevar un diario de operaciones.
**Idea clave:** si no está escrito, no es un plan: es una intuición.

### Plantilla del plan de trading

1. **Capital dedicado:** "Dedico X € (como máximo un X % de mi patrimonio) al trading. El resto sigue mi Declaración de Política de Inversión del módulo 4."
2. **Mercados y temporalidad:** "Opero acciones grandes de EE. UU. y Europa en gráfico diario, con posiciones de días a semanas."
3. **Condiciones de entrada:** reglas concretas y comprobables. Por ejemplo: "Precio por encima de la SMA 200 semanal; retroceso a un soporte o a la SMA 50 diaria; vela de giro alcista confirmada con volumen superior a la media."
4. **Stop:** "Bajo el mínimo de la vela de giro o del soporte, como mínimo a 1,5 ATR."
5. **Tamaño:** "Riesgo del 1 % por operación. Máximo 5 % de riesgo total abierto y 20 % del capital por posición."
6. **Salida:** "Mitad en 2R, el resto con stop bajo el último mínimo creciente. Si en 15 sesiones no ha llegado a 1R, salgo."
7. **Lo que no hago:** "No opero el día de resultados. No promedio a la baja. No muevo el stop en contra. No opero por aburrimiento."
8. **Límites:** "Si pierdo un 6 % en un mes, paro hasta el mes siguiente. Si la cuenta cae un 15 % desde su máximo, reduzco el riesgo a la mitad y reviso el plan."
9. **Revisión:** "Cada 20 operaciones reviso las estadísticas del diario."

### El diario de operaciones

Para cada operación, anota:

| Campo | Ejemplo |
|---|---|
| Fecha, activo, dirección | 12/11, SAN.MC, compra |
| Motivo de entrada (según el plan) | Rebote en SMA 50 con martillo confirmado |
| Entrada, stop, objetivo, R | 4,10 €, 3,95 €, 4,40 €, 1R = 100 € |
| Tamaño | 666 acciones |
| Resultado en € y en R | +180 €, +1,8R |
| ¿Seguí el plan? | Sí / No (¿por qué?) |
| Emoción al entrar y al salir | Tranquilo / con prisa / miedo |
| Captura del gráfico | |

### Las estadísticas que salen del diario

- Porcentaje de acierto.
- Ganancia media y pérdida media en R.
- **Esperanza** por operación (lección 10.5).
- Máxima racha de pérdidas y máxima caída de la cuenta.
- Resultado de las operaciones **dentro** del plan frente a las que lo saltaron (suele ser revelador).

**En el simulador:** el historial de órdenes de E-Trading es el punto de partida de tu diario. La IA profesora puede analizar tus operaciones en el modo "Mi operación".

**Truco de Lumi:** "Tu diario es tu mejor profesor: te enseña los errores que tu memoria prefiere olvidar."

---

## Lección 10.9 · Probar un sistema: del papel al dinero real

**Objetivo:** validar un sistema de trading antes de arriesgar dinero real y evitar el autoengaño estadístico.
**Idea clave:** un sistema no está probado hasta que funciona en datos que no usaste para diseñarlo, y con suficientes operaciones.

### Las cuatro fases

1. **Prueba histórica manual** (*backtesting*): recorre el gráfico hacia atrás y apunta cada señal que cumpla tus reglas, con su resultado. Mínimo **50–100 operaciones**.
2. **Prueba fuera de muestra:** prueba las mismas reglas en otros activos o en otro periodo **sin cambiarlas**.
3. **Prueba en simulador** (*paper trading*) en tiempo real durante al menos **2–3 meses**. Aquí aparece la psicología: no es lo mismo ver una señal en el pasado que ejecutarla hoy.
4. **Dinero real, poco a poco:** empieza con **una fracción pequeña** del capital previsto y con la mitad del riesgo por operación. Aumenta solo si las estadísticas reales se parecen a las de la prueba.

### Las trampas estadísticas

- **Sobreoptimización:** ajustar los parámetros (la media de 47 en lugar de la de 50, el RSI de 13…) hasta que el pasado salga perfecto. Funciona de maravilla en el pasado y fracasa en el futuro.
- **Muestra pequeña:** 15 operaciones ganadoras seguidas pueden ser suerte. Con menos de 30–50 operaciones, las estadísticas casi no significan nada.
- **Sesgo de supervivencia:** probar solo con las empresas que existen hoy olvida las que quebraron.
- **Olvidar los costes:** comisiones, *spread* y deslizamiento (*slippage*) en cada operación.
- **Sesgo retrospectivo:** en el pasado "se ve" claramente la vela de giro; en tiempo real, nunca está tan claro.

### Cuándo dejarlo

Si tras 100 operaciones bien registradas tu esperanza después de costes es negativa o cercana a cero, **no tienes ventaja**. No es un fracaso: es información valiosa. La alternativa, invertir a largo plazo en una cartera diversificada (módulo 4), sigue siendo la que más probabilidades tiene de hacerte ganar dinero.

**Truco de Lumi:** "En el simulador se aprende a operar. En el dinero real se aprende quién eres. Empieza pequeño."

---

## Banco de preguntas · Módulo 10

**1.** Tienes 20.000 €, arriesgas un 1 % por operación, compras a 80 € con el stop en 76 €. ¿Cuántas acciones compras?
- a) 25
- b) **50** ✅
- c) 250

*Explicación:* 20.000 × 1 % = 200 €. 200 ÷ (80 − 76) = 50 acciones.

**2.** Verdadero o falso: "Riesgo por operación y cantidad invertida son lo mismo."
- **Falso** ✅

*Explicación:* el riesgo es lo que pierdes si salta el stop. Puedes invertir el 16 % de tu capital arriesgando solo un 1 %.

**3.** ¿Dónde se coloca un stop estructural en una compra en un soporte?
- **Por debajo del soporte o del mínimo de la vela de giro.** ✅

**4.** El precio se acerca a tu stop. ¿Qué no debes hacer nunca?
- a) Dejar el stop donde está.
- b) **Alejar el stop para darle "más espacio".** ✅
- c) Cerrar la posición si tu plan lo dice.

**5.** Calcula la esperanza: aciertas el 45 %, ganas 2R de media y pierdes 1R.
- a) −0,1R
- b) **+0,35R** ✅
- c) +0,9R

*Explicación:* 0,45 × 2 − 0,55 × 1 = 0,35R.

**6.** Un sistema acierta el 70 % de las veces, gana 0,4R de media y pierde 1R. ¿Es rentable?
- a) Sí, acierta mucho.
- b) **No: 0,7 × 0,4 − 0,3 × 1 = −0,02R.** ✅

**7.** Con un sistema que acierta el 50 %, ¿es raro encadenar 6 pérdidas seguidas en 100 operaciones?
- a) Sí, casi imposible.
- b) **No, es lo habitual.** ✅

**8.** Con un apalancamiento 1:10, ¿qué movimiento en contra se lleva todo tu margen?
- a) 1 %
- b) **10 %** ✅
- c) 50 %

**9.** ¿Qué protección tienen los clientes minoristas de CFD en la UE desde 2018?
- **No pueden perder más de lo depositado, el apalancamiento está limitado (por ejemplo, 1:30 en divisas principales y 1:2 en cripto) y el bróker cierra la posición si el margen cae por debajo del 50 %.** ✅

**10.** ¿Por qué la pérdida de una posición corta es potencialmente ilimitada?
- **Porque el precio puede subir sin límite.** ✅

**11.** Ordena las fases para validar un sistema: Prueba histórica → Prueba fuera de muestra → Simulador en tiempo real → Dinero real pequeño ✅

**12.** ¿Qué es la sobreoptimización?
- **Ajustar los parámetros hasta que el pasado salga perfecto, con lo que el sistema suele fallar en el futuro.** ✅

**13. Caso práctico.** Raúl ha ganado 12 de sus 15 primeras operaciones y quiere pasar a arriesgar un 10 % por operación "porque su sistema funciona". ¿Qué le dirías?
*Respuesta modelo:* 15 operaciones son una muestra demasiado pequeña: pueden ser suerte. Con un 10 % de riesgo, una racha normal de 6–8 pérdidas le haría perder entre la mitad y dos tercios de la cuenta. Debería seguir con un 1 %, registrar al menos 50–100 operaciones y calcular su esperanza después de costes.

---

## Fuentes del módulo

- Tharp, V. (2006). *Trade Your Way to Financial Freedom* (múltiplos de R, esperanza, tamaño de posición).
- Kelly, J. L. (1956). *A New Interpretation of Information Rate*. Bell System Technical Journal; Thorp, E. (2006), *The Kelly Criterion in Blackjack, Sports Betting and the Stock Market*.
- Wilder, J. W. (1978). *New Concepts in Technical Trading Systems* (ATR).
- ESMA (2018). Medidas de intervención sobre CFD (límites de apalancamiento, cierre de margen al 50 %, protección frente a saldo negativo, advertencia de riesgo).
- Chague, De-Losso y Giovannetti (2020); Barber, Lee, Liu y Odean (Taiwán).
- Bailey, D., Borwein, J., López de Prado, M. y Zhu, Q. (2014). *Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting*. Notices of the AMS.
- Simulaciones propias de rachas de pérdidas (20.000 secuencias de 100 operaciones).
