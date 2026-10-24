import 'server-only'
// Unidad 8 · Velas japonesas (docs/curso/08). Acceso por plan: src/shared/plans.ts
// Ejercicios con velas REALES detectadas por scripts/build-lesson-charts.py. Estadísticas: Bulkowski (thepatternsite.com).
import { chart, fill, img, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u8', order: 8, title: 'Velas japonesas', description: 'Leer cada vela, los patrones principales y cuánto funcionan de verdad',
  lessons: [
    lesson('u8l1', 'De Sakata a tu pantalla', [
      text('El mercado de arroz de Dojima', 'En el Japón del siglo XVIII, el arroz era moneda. En Osaka funcionaba el mercado de **Dojima**, uno de los primeros de futuros del mundo. Según la tradición, el comerciante **Munehisa Homma** estudiaba el comportamiento emocional de compradores y vendedores.'),
      text('Steve Nison', 'Las velas eran casi desconocidas fuera de Japón hasta que **Steve Nison** publicó *Japanese Candlestick Charting Techniques* en 1991. Hoy casi todas las plataformas las muestran por defecto.'),
      text('Por qué gustan tanto', '• Muestran los cuatro precios de un vistazo.\n• El color dice si el periodo subió o bajó.\n• La forma revela quién controló el periodo.'),
      key('Lo que te llevas', 'Muchos nombres (estrellas, soldados, cuervos) vienen de esa tradición japonesa.', 'Las velas nacieron en el mercado de arroz de Japón y hoy son el gráfico más usado.', 'Cada vela es un pequeño combate. El cierre dice quién ganó.'),
    ], [
      single('¿Dónde nacieron las velas japonesas?', ['En Wall Street', 'En el mercado de arroz de Japón', 'En Londres'], 1, 'En el mercado de arroz de Dojima, en Osaka.'),
      single('¿Quién popularizó las velas en Occidente en 1991?', ['Warren Buffett', 'Steve Nison', 'Charles Dow'], 1, 'Con su libro sobre técnicas de velas japonesas.'),
      tf('Las velas muestran apertura, máximo, mínimo y cierre de un vistazo.', true, 'Es su gran ventaja frente a la línea.'),
      single('¿Qué revela la forma de una vela?', ['El dividendo', 'Quién controló el periodo', 'El número de acciones'], 1, 'Compradores o vendedores.'),
    ], { source: '8.1' }),

    lesson('u8l2', 'Anatomía de una vela', [
      img('anatomy', 'Las partes', '• **Cuerpo:** entre apertura y cierre.\n• **Mecha superior:** hasta el máximo.\n• **Mecha inferior:** hasta el mínimo.'),
      img('candles', 'El color', '**Verde:** cierra por encima de la apertura (apertura abajo, cierre arriba).\n**Roja:** cierra por debajo (apertura arriba, cierre abajo).\n\nEn China, Japón y Corea los colores suelen ir al revés: mira siempre la leyenda.'),
      text('Un ejemplo con números', 'Vela con **O = 100, H = 108, L = 97, C = 106**:\n\n• Verde (cierra en 106 > 100).\n• Cuerpo: de 100 a 106 (6 puntos).\n• Mecha superior: 106 a 108 (2).\n• Mecha inferior: 97 a 100 (3).'),
      sim('Lee cinco velas', 'En el gráfico de cualquier activo, pasa el dedo por una vela para ver sus cuatro precios.', 'Elige una vela y calcula el tamaño de su cuerpo y de sus mechas.'),
      key('Lo que te llevas', 'Practica hasta leer una vela de un vistazo.', 'El cuerpo va de la apertura al cierre; las mechas llegan al máximo y al mínimo.', 'Verde: el cierre arriba. Roja: el cierre abajo.'),
    ], [
      single('Una vela tiene O 40, H 44, L 39 y C 43. ¿De qué color es?', ['Verde', 'Roja'], 0, 'Cierra (43) por encima de la apertura (40).'),
      fill('En esa vela, el cuerpo mide ____ puntos.', '3', ['1', '4', '5'], 'De 40 a 43.'),
      order('Ordena de menor a mayor los precios de una vela verde.', ['Mínimo', 'Apertura', 'Cierre', 'Máximo'], 'Mínimo ≤ apertura < cierre ≤ máximo.'),
      tf('En todas las plataformas del mundo, el verde significa subida.', false, 'En China, Japón y Corea suele ser al revés.'),
    ], { source: '8.2' }),

    lesson('u8l3', 'Leer la batalla: cuerpo y mechas', [
      text('El cuerpo: la convicción', '• Cuerpo largo verde: dominaron los compradores.\n• Cuerpo largo rojo: dominaron los vendedores.\n• Cuerpo pequeño: indecisión.\n\n"Largo" siempre es relativo a las velas anteriores.'),
      text('Las mechas: el rechazo', '• **Mecha superior larga:** el precio subió, pero los vendedores lo devolvieron abajo.\n• **Mecha inferior larga:** cayó, pero los compradores lo devolvieron arriba.'),
      text('Una vela como una historia', 'O 50, mínimo 44, máximo 51, cierre 50,5:\n\n"Los vendedores lo hundieron un 12 %, pero los compradores no solo lo recuperaron: cerraron por encima de la apertura."\n\nSi aparece tras una caída, se llama **martillo**.'),
      chart('hammer-1', 'Toca la vela con la mecha inferior más larga', 'Los vendedores empujaron fuerte, pero el precio se recuperó antes del cierre: rechazo de los precios bajos.', 'Busca la línea fina más larga por debajo de un cuerpo.'),
      key('La ubicación lo es todo', 'La misma vela significa cosas distintas según dónde aparece: tras una caída larga en un soporte, o en mitad de la nada.', 'Un cuerpo grande es convicción; una mecha larga es un rechazo.', 'No leas una vela sola: mira de dónde viene el precio.'),
    ], [
      single('¿Qué indica una mecha superior muy larga?', ['Que los compradores dominaron todo el periodo', 'Rechazo de los precios altos', 'Nada'], 1, 'Los vendedores devolvieron el precio abajo.'),
      single('¿Qué indica un cuerpo muy pequeño?', ['Fuerza compradora', 'Indecisión', 'Una caída fuerte'], 1, 'Ni compradores ni vendedores ganaron con claridad.'),
      tf('El tamaño de una vela se juzga en relación con las velas anteriores.', true, 'Una vela de 2 € puede ser enorme o insignificante según el activo.'),
      single('Una vela abre en 20, baja a 17 y cierra en 19,8. ¿Qué cuenta su mecha inferior?', ['Que los compradores rechazaron los precios bajos', 'Que los vendedores ganaron', 'Que no hubo volumen'], 0, 'El precio cayó y se recuperó casi del todo.'),
    ], { source: '8.3' }),

    lesson('u8l4', 'Marubozu, peonza y doji', [
      text('Marubozu: fuerza', 'Cuerpo largo **sin mechas** ("cabeza rapada"). Alcista: abre en el mínimo y cierra en el máximo. Suele indicar continuación de la fuerza, sobre todo al empezar un movimiento.'),
      text('Peonza: duda', 'Cuerpo **pequeño** con mechas parecidas arriba y abajo. El precio fue a los dos lados y acabó cerca de donde empezó. Tras una tendencia larga, puede avisar de que pierde fuerza.'),
      text('Doji: empate', 'Apertura y cierre **casi iguales**:\n\n• Normal: una cruz.\n• Patas largas: mucha volatilidad.\n• Libélula (T): mecha inferior larga.\n• Lápida (T invertida): mecha superior larga.\n\nSegún Bulkowski, el doji libélula gira solo la mitad de las veces.'),
      chart('doji-1', 'Toca el doji: la vela con apertura y cierre casi iguales', 'Apertura y cierre casi iguales con mechas a los dos lados: empate entre compradores y vendedores.', 'Busca una vela cuyo cuerpo sea casi una raya.'),
      key('Lo que te llevas', 'Un doji es una señal de atención, no de acción.', 'Marubozu dice fuerza, peonza dice duda, doji dice empate.', 'Un doji no dice "va a girar": dice "nadie sabe qué hacer". Espera a la siguiente vela.'),
    ], [
      single('¿Qué es un doji?', ['Una vela sin mechas', 'Una vela con apertura y cierre casi iguales', 'Tres velas verdes'], 1, 'Es el empate perfecto.'),
      single('Un marubozu alcista indica…', ['Indecisión', 'Que los compradores controlaron todo el periodo', 'Un giro bajista seguro'], 1, 'Abre en el mínimo y cierra en el máximo.'),
      tf('Según Bulkowski, el doji libélula acierta el giro el 90 % de las veces.', false, 'Solo la mitad de las veces, como una moneda.'),
      fill('El doji con forma de T invertida (mecha superior larga) se llama doji ____.', 'lápida', ['libélula', 'martillo', 'marubozu'], 'Los compradores subieron el precio, pero los vendedores lo devolvieron abajo.'),
    ], { source: '8.4' }),

    lesson('u8l5', 'Martillo, hombre colgado y estrella fugaz', [
      text('La regla', 'Cuerpo **pequeño** en un extremo, una mecha al menos **2–3 veces** el cuerpo y poca mecha al otro lado.'),
      text('Cuatro nombres, según dónde aparezca', '• Mecha inferior larga tras una **caída**: **martillo**.\n• La misma tras una **subida**: **hombre colgado**.\n• Mecha superior larga tras una **caída**: martillo invertido.\n• La misma tras una **subida**: **estrella fugaz**.'),
      text('Lo que dicen los datos (Bulkowski)', '• Martillo: gira al alza el **60 %** (puesto 65 de 103).\n• Hombre colgado: ¡sigue al alza el 59 %! (puesto 87).\n• Estrella fugaz: gira a la baja el **59 %** (puesto 55).\n\nÉl mismo lo describe como "no muy lejos del azar".'),
      chart('shooting-star-1', 'Tras la subida, toca la estrella fugaz', 'Cuerpo pequeño abajo y mecha superior larga: los compradores lo intentaron y los vendedores lo devolvieron abajo.', 'Busca una vela con una mecha superior mucho más larga que su cuerpo.'),
      key('Cómo usarlas con criterio', 'Solo tras una tendencia clara, mejor en un soporte o resistencia, esperando confirmación y con el stop al otro lado de la mecha.', 'La misma forma cambia de nombre y significado según aparezca tras una subida o una bajada.', 'Sin contexto, el martillo acierta poco más que una moneda.'),
    ], [
      single('Vela de cuerpo pequeño arriba y mecha inferior larga, tras una fuerte subida:', ['Martillo', 'Hombre colgado', 'Estrella fugaz'], 1, 'La misma forma tras una caída sería un martillo.'),
      tf('Según Bulkowski, el martillo acierta el giro alcista el 90 % de las veces.', false, 'Alrededor del 60 %.'),
      single('¿Dónde suele ir el stop cuando compras tras un martillo?', ['Por debajo del mínimo del martillo', 'Por encima del máximo', 'No hace falta'], 0, 'Si el precio pierde ese mínimo, la señal ha fallado.'),
      single('¿Qué mejora los resultados del martillo según Bulkowski?', ['Que aparezca cerca del mínimo del año y con cuerpo verde', 'Que aparezca en mitad de un rango', 'Que no haya volumen'], 0, 'La posición dentro del rango anual cambia mucho los resultados.'),
    ], { source: '8.5', xp: 35 }),

    lesson('u8l6', 'Envolventes', [
      text('Envolvente alcista', 'Tras una **caída**: vela roja seguida de una verde que abre por debajo del cierre anterior y **cierra por encima de su apertura**. Su cuerpo envuelve el cuerpo rojo.\n\nLos compradores no solo frenaron la caída: recuperaron todo lo del día anterior.'),
      text('Envolvente bajista', 'Lo contrario: tras una **subida**, una vela verde seguida de una roja cuyo cuerpo envuelve el verde.'),
      text('La paradoja de los datos (Bulkowski)', '• Envolvente alcista: gira el **63 %** (puesto 84 de 103).\n• Envolvente bajista: gira el **79 %**, pero queda en el puesto **91**: el movimiento posterior suele ser pequeño.\n\nAcertar la dirección no basta: el recorrido tiene que compensar el riesgo.'),
      chart('bull-engulfing-1', 'Toca la vela verde que envuelve a la roja anterior', 'El cuerpo verde se come entero el cuerpo rojo anterior: los compradores recuperan todo lo perdido.', 'Busca una vela verde grande justo después de una roja más pequeña.'),
      chart('bear-engulfing-1', 'Ahora al revés: toca la vela roja que envuelve a la verde anterior', 'Tras la subida, el cuerpo rojo se come el verde: los vendedores toman el control.', 'Busca una vela roja grande justo después de una verde.'),
      key('Consejos de Bulkowski', 'Elige velas altas. La envolvente alcista funciona mejor cerca del mínimo anual y cuando la tendencia principal es alcista.', 'Una envolvente es una vela cuyo cuerpo se come el de la anterior, en sentido contrario.', 'Una envolvente gira a menudo, pero a veces gira poco.'),
    ], [
      single('Describe una envolvente alcista.', ['Tras una caída, una vela verde cuyo cuerpo envuelve el de la roja anterior', 'Tres velas verdes seguidas', 'Una vela sin mechas'], 0, 'Es un patrón de giro de dos velas.'),
      single('La envolvente bajista gira el 79 % pero queda en el puesto 91 de 103. ¿Por qué?', ['Porque es rara', 'Porque el movimiento posterior suele ser pequeño', 'Porque solo funciona en cripto'], 1, 'Acertar la dirección no basta si el recorrido no compensa.'),
      tf('Según Bulkowski, la envolvente alcista funciona mejor si la tendencia principal es alcista.', true, 'En una corrección dentro de una subida.'),
      fill('Una envolvente alcista aparece después de una tendencia ____.', 'bajista', ['alcista', 'lateral', 'perfecta'], 'Un patrón de giro necesita algo que girar.'),
    ], { source: '8.6', xp: 35 }),

    lesson('u8l7', 'Harami, pauta penetrante y nube oscura', [
      text('Harami ("embarazada")', 'Vela 1 con cuerpo **largo** en la dirección de la tendencia; vela 2 con cuerpo **pequeño** completamente **dentro** del primero.\n\nEs lo contrario de la envolvente: el impulso se frena. Si la segunda es un doji, se llama harami cruz.'),
      text('Pauta penetrante y nube oscura', '**Penetrante** (alcista): tras una caída, una verde que abre por debajo del mínimo anterior y cierra **por encima de la mitad** del cuerpo rojo.\n\n**Nube oscura** (bajista): tras una subida, una roja que abre por encima del máximo y cierra **por debajo de la mitad** del cuerpo verde. Bulkowski: gira el **60 %** (puesto 22 de 103).'),
      text('Nota sobre los huecos', 'En acciones, la segunda vela suele abrir con hueco. En cripto (24/7) y en divisas casi nunca hay huecos entre velas: estos patrones pierden sentido.'),
      key('Lo que te llevas', 'El harami avisa de pérdida de fuerza; es más débil que una envolvente.', 'El harami dice que la tendencia toma aire; la penetrante y la nube oscura muestran un contraataque a medias.', 'Un harami es la tendencia tomando aire: espera.'),
    ], [
      single('En un harami, la segunda vela…', ['Envuelve a la primera', 'Queda dentro del cuerpo de la primera', 'No tiene mechas'], 1, 'Es lo contrario de una envolvente.'),
      single('¿Qué indica sobre todo un harami?', ['Un giro seguro', 'Que el impulso se frena', 'Una subida fuerte'], 1, 'Es una señal de pérdida de fuerza.'),
      fill('En la nube oscura, la vela roja cierra por debajo de la ____ del cuerpo verde anterior.', 'mitad', ['apertura', 'mecha', 'cima'], 'Si lo envolviera entero sería una envolvente bajista.'),
      tf('Los patrones con hueco tienen el mismo sentido en criptomonedas que en acciones.', false, 'Las cripto cotizan 24/7 y casi nunca dejan huecos entre velas.'),
    ], { source: '8.7', xp: 35 }),

    lesson('u8l8', 'Estrellas, soldados y cuervos', [
      text('Estrella de la mañana (giro alcista)', '1. Tras una caída, vela roja larga.\n2. Vela pequeña con hueco abajo: la estrella.\n3. Vela verde larga que cierra al menos en la **mitad** del cuerpo de la primera.\n\nLos vendedores dominan, dudan y los compradores toman el control.'),
      text('Estrella de la tarde, soldados y cuervos', '• **Estrella de la tarde:** lo mismo al revés, tras una subida.\n• **Tres soldados blancos:** tres velas verdes largas, cada una cerrando más arriba.\n• **Tres cuervos negros:** tres rojas largas tras una subida.'),
      text('Los mejores números (Bulkowski)', '• Estrella de la mañana: gira el **78 %** (puesto 12).\n• Estrella de la tarde: **72 %** (puesto **4**).\n• Tres soldados blancos: **82 %** (puesto 32).\n• Tres cuervos negros: **78 %** (puesto **3**).\n\nMejores que las velas sueltas, pero mucho menos frecuentes.'),
      chart('morning-star-1', 'Toca la tercera vela de la estrella de la mañana: la verde que confirma el giro', 'Roja larga, vela pequeña de duda y verde larga que recupera más de la mitad: estrella de la mañana.', 'Busca la secuencia roja grande → vela pequeña → verde grande, y toca la verde.'),
      key('Lo que te llevas', 'Bulkowski: la estrella de la mañana va mejor cerca del mínimo anual, con velas altas y en un retroceso dentro de una tendencia alcista.', 'Los patrones de tres velas cuentan una historia más completa y están entre los que mejor funcionan.', 'Tres velas cuentan mejor la historia que una, y por eso son más raras.'),
    ], [
      order('Ordena las velas de una estrella de la mañana.', ['Roja larga', 'Vela pequeña con hueco abajo', 'Verde larga que cierra por encima de la mitad de la primera'], 'Dominio vendedor, duda y toma de control compradora.'),
      single('¿Qué patrón tiene, según Bulkowski, uno de los mejores rendimientos (puesto 3 de 103)?', ['Martillo', 'Tres cuervos negros', 'Doji libélula'], 1, 'Los patrones de tres velas superan a la mayoría de velas sueltas.'),
      tf('Los patrones de tres velas son más frecuentes que las velas sueltas.', false, 'Son menos frecuentes, pero con mejores estadísticas.'),
      single('Tres velas rojas largas seguidas tras una subida, cada una con nuevos mínimos:', ['Tres soldados blancos', 'Tres cuervos negros', 'Harami'], 1, 'Giro bajista el 78 % según Bulkowski.'),
    ], { source: '8.8', xp: 40 }),

    lesson('u8l9', 'El contexto: cuándo una vela importa', [
      text('Los cuatro filtros', '1. **Tendencia previa:** un patrón de giro necesita algo que girar.\n2. **Nivel:** soporte, resistencia, media móvil, máximo o mínimo anual.\n3. **Volumen:** mayor que la media, más creíble.\n4. **Confirmación:** la vela siguiente cierra en la dirección esperada.'),
      text('La temporalidad', 'Los patrones en gráficos **diarios y semanales** significan más que en gráficos de minutos, donde manda el ruido.'),
      text('Un ejemplo completo', 'Tendencia alcista de un año. Corrección del 12 % hasta la media de 200 sesiones, que coincide con un antiguo máximo. Martillo con volumen alto. Al día siguiente, una verde cierra por encima del martillo.\n\n**Cuatro de cuatro.** Aun así puede fallar: stop bajo el martillo y riesgo del 1 %.'),
      chart('hammer-2', 'Toca el martillo de este gráfico real y piensa: ¿cumple los cuatro filtros?', 'Es el martillo: mecha inferior larga tras una caída. Para operar, faltaría comprobar nivel, volumen y confirmación.', 'Busca la mecha inferior más larga tras la caída.'),
      key('Lo que te llevas', 'Sin contexto, un patrón es ruido. Con los cuatro filtros, es una pista.', 'Tendencia, nivel, volumen y confirmación convierten una vela en una señal útil.', 'La vela es la frase; el contexto, el libro entero.'),
    ], [
      multi('¿Cuáles son los cuatro filtros que dan valor a un patrón? Marca todos.', ['Tendencia previa', 'Nivel (soporte o resistencia)', 'Volumen', 'Confirmación', 'El color de la app'], [0, 1, 2, 3], 'Sin ellos, el patrón es poco más que ruido.'),
      single('Ves una estrella fugaz en 5 minutos, en mitad de un rango, con volumen bajo. ¿Vendes?', ['Sí, es una señal clara', 'No: falla los cuatro filtros', 'Solo si es viernes'], 1, 'Sin tendencia, sin nivel, sin volumen y sin confirmación.'),
      tf('Los patrones en gráficos diarios son más significativos que en gráficos de 1 minuto.', true, 'En temporalidades cortas domina el ruido.'),
      single('¿Qué es la confirmación?', ['Que la vela siguiente cierre en la dirección esperada', 'Que lo diga un foro', 'Que el precio sea redondo'], 0, 'Pierdes algo de recorrido, pero evitas muchas señales falsas.'),
    ], { source: '8.9', xp: 40 }),

    lesson('u8l10', 'Lo que dice la ciencia sobre las velas', [
      text('Los estudios académicos', '• **Marshall, Young y Rose** probaron 28 patrones en las acciones del Dow Jones (1992–2002): no aportaban valor.\n• Un estudio en Japón (1975–2004), la cuna de las velas, llegó a lo mismo.\n• Otros encuentran resultados en mercados concretos, difíciles de repetir y que suelen desaparecer tras los costes.'),
      text('Bulkowski, bien leído', '• Muchas velas famosas están cerca del **50–60 %**, apenas mejor que el azar.\n• Los patrones de tres velas tienen mejores números, pero son raros.\n• Sus pruebas no incluyen comisiones ni *spreads*.\n\nY si pruebas cien patrones, alguno parecerá funcionar por casualidad.'),
      text('Entonces, ¿para qué aprenderlas?', '1. Para **leer el mercado:** rechazo, convicción, indecisión.\n2. Para **gestionar el riesgo:** una mecha te da un sitio lógico para el stop.\n3. Como **una pieza más**, nunca la única.\n4. Para **no dejarte engañar** por quien vende patrones "con un 90 % de acierto".'),
      sim('El reto de las 20 velas', 'La mejor forma de entender los límites de los patrones es comprobarlo tú.', 'En 20 gráficos diarios, anota antes de mirar si la vela siguiente cerrará arriba o abajo, y calcula tu acierto.'),
      key('Lo que te llevas', 'Que un patrón acierte la dirección más del 50 % no significa que sea rentable tras costes.', 'Las velas son un idioma para leer el mercado, no una bola de cristal.', 'Desconfía de quien vende patrones con un 90 % de acierto.'),
    ], [
      single('¿Qué concluyeron Marshall, Young y Rose tras probar 28 patrones en el Dow Jones?', ['Que eran muy rentables', 'Que no aportaban valor', 'Que solo fallaban en enero'], 1, 'Y un estudio en Japón llegó a lo mismo.'),
      tf('Si un patrón acierta la dirección el 60 % de las veces, seguro que es rentable.', false, 'Depende del recorrido, de los costes y de cuánto pierdes cuando falla.'),
      single('¿Qué problema aparece al probar muchos patrones a la vez?', ['Que alguno parecerá funcionar por casualidad', 'Que se acaba el gráfico', 'Ninguno'], 0, 'Se llama sesgo de búsqueda de datos (data snooping).'),
      multi('¿Para qué SÍ sirven las velas? Marca todas.', ['Leer quién controla el mercado', 'Colocar el stop con lógica', 'Predecir con certeza', 'Detectar a vendedores de humo'], [0, 1, 3], 'Nada predice con certeza.'),
    ], { source: '8.10', xp: 40 }),
  ],
})
