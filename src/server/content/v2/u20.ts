import 'server-only'
// Sección 7 · Unidad 20 · Velas japonesas (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/08-velas-japonesas.md. Estadísticas: Bulkowski (thepatternsite.com).
// Velas reales detectadas por scripts/build-lesson-charts.py (docs/curso-v2/graficos.md).
import { buckets, candle, chart, chat, choose, fill, key, lesson, match, multi, num, opt, order, play, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u20', order: 20, title: 'Velas japonesas', description: 'Leer cada vela, sus patrones principales y cuánto funcionan de verdad',
  lessons: [

    lesson('u20l2', 'Cuerpo y mechas: la batalla', [
      story('Un 5 % que se esfumó', [{ id: 'pau', name: 'Pau' }], [
        say('pau', 'Hoy mi acción subió un 5 % por la mañana.'),
        say('pau', 'Pero cerró casi en el precio de apertura. ¿Qué ha pasado?'),
        choose('¿Cómo es su vela de hoy?', [
          opt('Cuerpo pequeño y mecha superior larga', 'good', say('lumi', 'Eso. Hubo **rechazo de los precios altos**: los vendedores ganaron el final.')),
          opt('Una verde grande: gran día para los compradores', 'bad', say('lumi', 'A media mañana, sí. Pero cuenta el cierre, no el máximo.')),
          opt('Una vela sin mechas', 'ok', say('lumi', 'Subió un 5 % y volvió: ese viaje es la mecha.')),
        ]),
        say('lumi', '**Cuerpo largo:** convicción. **Cuerpo pequeño:** indecisión.'),
        say('lumi', '**Mecha larga:** un rechazo. Arriba, de los precios altos; abajo, de los bajos.'),
        say('lumi', '«Largo» es relativo: 2 € es mucho en una acción tranquila; en una cripto, nada.'),
      ]),
      chart('hammer-1', 'Toca la vela que cuenta esta historia: «los vendedores la hundieron y los compradores la devolvieron casi arriba»', 'Esa mecha inferior larga es el rechazo de los precios bajos. Tras varias caídas, así se ve un martillo.', 'Busca la línea fina más larga por debajo de un cuerpo pequeño.'),
      play({
        title: '¿Quién ganó la sesión?',
        intro: 'Cada vela es una batalla entre compradores y vendedores. ¿Quién la ganó?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Compradores' }, { label: 'Vendedores' }, { label: 'Empate' }],
          cards: [
            { icon: 'candles', label: 'Verde larga que cierra en su máximo', bin: 0, why: 'Mandaron de principio a fin.' },
            { icon: 'candles', label: 'Roja larga sin apenas mechas', bin: 1, why: 'Los vendedores dominaron toda la sesión.' },
            { icon: 'candles', label: 'Cuerpo diminuto con mechas iguales arriba y abajo', bin: 2, why: 'Lo intentaron los dos y nadie ganó.' },
            { icon: 'candles', label: 'Abre en 20, cae a 17 y cierra en 20,40', bin: 0, why: 'Cayó, pero cerró por encima de la apertura.' },
            { icon: 'candles', label: 'Abre en 80, sube a 86 y cierra en 79', bin: 1, why: 'Subió mucho, pero cerró por debajo de la apertura.' },
            { icon: 'candles', label: 'Abre y cierra en 45, tras moverse mucho', bin: 2, why: 'Mucho movimiento y ningún ganador.' },
          ],
        },
        goal: { text: 'Decide las seis batallas.', when: [when('done', '==', 6)] },
        insight: 'Lo que manda es **dónde cierra** respecto a la apertura y cuánto cuerpo deja. Las mechas cuentan los **intentos fallidos** de cada bando.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Fíjate en el cierre, no en el máximo ni en el mínimo.', mood: 'THINKING' },
          { say: '¿Quién ganó cada batalla?', mood: 'HAPPY' },
        ],
      }),
      key('La ubicación lo es todo', 'La misma vela significa cosas distintas según dónde aparece: tras una caída larga y en un soporte puede indicar agotamiento vendedor; en mitad de un rango, casi nada.', 'Un cuerpo grande es convicción; una mecha larga es un rechazo.', 'No leas una vela sola: pregúntate de dónde viene el precio.'),
    ], [
      single('¿Qué indica una mecha superior muy larga?', ['Que los compradores dominaron todo el periodo', 'Rechazo de los precios altos', 'Que no hubo operaciones'], 1, 'El precio llegó arriba, pero los vendedores lo devolvieron abajo antes del cierre.'),
      buckets('¿Quién ganó la sesión?', ['Compradores', 'Vendedores', 'Empate'], [['Verde larga, casi sin mechas', 0], ['Roja larga que cierra en el mínimo', 1], ['Cuerpo diminuto con mechas iguales', 2], ['Abre en 50, cae a 44 y cierra en 50,5', 0], ['Abre en 30, sube a 34 y cierra en 29', 1]], 'Lo que manda es dónde cierra respecto a la apertura y cuánto cuerpo deja. Las mechas cuentan los intentos fallidos.'),
      candle('Toca la vela donde los vendedores ganaron con más claridad: el cuerpo rojo más grande.', 'bear-engulfing-2', 'Abrió arriba y cerró casi en el mínimo, sin apenas mechas: los vendedores mandaron toda la sesión.'),
      candle('Ahora busca el rechazo de los precios altos: toca la vela con la mecha superior más larga.', 'shooting-star-1', 'Los compradores llevaron el precio muy arriba, pero la sesión cerró lejos de ese máximo.'),
      num('Una vela abre en 50, baja hasta 44 y cierra en 50,5. ¿Cuánto llegó a caer desde la apertura, en porcentaje?', 12, '%', '(50 − 44) ÷ 50 = 0,12 → −12 %. Y aun así cerró por encima de la apertura: los compradores ganaron la batalla.'),
      tf('Una vela de 2 € de cuerpo siempre es una vela grande.', false, 'Depende del activo y de las velas anteriores: 2 € es enorme en una acción de 20 € y casi nada en una de 500 €.'),
      upDown('Lee las últimas velas como una batalla. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-14', 'Saber quién ganó cada sesión no dice quién ganará la siguiente. Las velas describen; no adivinan.'),
      scenario('Ves una vela con una mecha inferior larguísima en mitad de un rango lateral, sin tendencia previa. Laura dice que es una señal de compra clarísima. ¿Qué le contestas?', [['Que tiene razón: mecha larga, compra segura', 'En mitad de un rango, sin tendencia que girar, esa mecha significa muy poco.'], ['Que la ubicación importa: en mitad de un rango, esa vela dice poco', 'Exacto: la misma vela tras una caída larga y en un soporte contaría otra historia.'], ['Que es una señal de venta', 'La mecha inferior es rechazo de los precios bajos: no es señal de venta, pero aquí tampoco de compra.']], 1, 'Una vela se lee en su contexto: de dónde viene el precio y dónde está.'),
      timed(single('Rápido: un cuerpo muy pequeño significa…', ['Fuerza compradora', 'Indecisión', 'Caída segura'], 1, 'Ni compradores ni vendedores ganaron con claridad.'), 10),
      chat(['Hoy mi acción subió un 5 % durante la mañana 🚀', 'Pero cerró casi en el precio de apertura 😕'], '¿Cómo le explicas a Lumi lo que pasó?', [['Que fue un gran día para los compradores', 'A media mañana sí, pero al cierre los vendedores devolvieron el precio abajo. Mira el cierre, no el máximo.'], ['Que la vela tiene una mecha superior larga: hubo rechazo de los precios altos', '¡Eso! Los compradores llegaron lejos, pero los vendedores ganaron el final de la batalla.'], ['Que es un error de la app', 'No hay error: subir y volver es muy normal, y la vela lo registra con la mecha.']], 1, 'El máximo cuenta hasta dónde llegaron los compradores; el cierre, quién ganó.'),
    ], { source: '8.3', minutes: 6, retire: [1, 5, 8, 9] }),

    lesson('u20l3', 'Doji, peonza y marubozu', [
      chart('doji-1', 'Toca el doji: la vela cuya apertura y cierre casi coinciden', 'Cuerpo casi inexistente y mechas a los dos lados: ni compradores ni vendedores ganaron esa sesión.', 'Busca la vela cuyo cuerpo es casi una raya.'),
      play({
        title: '¿Fuerza o indecisión?',
        intro: '**Marubozu** es «cabeza rapada» en japonés: cuerpo largo y casi sin mechas. La **peonza** y el **doji**, lo contrario. Clasifícalas.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Fuerza' }, { label: 'Indecisión' }],
          cards: [
            { icon: 'candles', label: 'Marubozu alcista: abre en el mínimo y cierra en el máximo', bin: 0, why: 'Los compradores mandaron toda la sesión.' },
            { icon: 'candles', label: 'Peonza: cuerpo pequeño y mechas parecidas', bin: 1, why: 'Movimiento a los dos lados y nadie gana.' },
            { icon: 'candles', label: 'Marubozu bajista: abre en el máximo y cierra en el mínimo', bin: 0, why: 'Los vendedores mandaron toda la sesión.' },
            { icon: 'candles', label: 'Doji: apertura y cierre casi iguales', bin: 1, why: 'Empate: el cuerpo es una raya.' },
            { icon: 'candles', label: 'Doji de patas largas', bin: 1, why: 'Mucha batalla y ningún ganador.' },
            { icon: 'candles', label: 'Cuerpo largo con mechas mínimas', bin: 0, why: 'Convicción: suele indicar que la fuerza continúa.' },
          ],
        },
        goal: { text: 'Clasifica las seis velas.', when: [when('done', '==', 6)] },
        insight: '**Marubozu** dice fuerza, sobre todo al empezar un movimiento o al romper un nivel. **Peonza**, duda; **doji**, empate.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Cuerpo grande, convicción. Cuerpo pequeño, duda.', mood: 'THINKING' },
          { say: '¿Fuerza o indecisión?', mood: 'HAPPY' },
        ],
      }),
      story('El doji libélula', [{ id: 'eva', name: 'Eva' }], [
        say('eva', '¡Mira! Un doji libélula: forma de T, con la mecha inferior larguísima.'),
        say('eva', 'Eso es giro seguro, ¿no? Voy a comprar.'),
        choose('¿Qué le dices?', [
          opt('Espera a la vela siguiente', 'good', say('lumi', 'Bien. Según Bulkowski, gira solo **la mitad de las veces**.')),
          opt('Compra fuerte: es giro seguro', 'bad', say('lumi', 'La mitad de las veces, como una moneda. No es una señal de acción.')),
          opt('Vende: el doji es bajista', 'ok', say('lumi', 'El doji no tiene dirección. Es un empate.')),
        ]),
        say('lumi', 'Un doji no dice «va a girar». Dice «nadie sabe qué hacer».'),
        say('lumi', 'Es una señal de **atención**, no de acción.'),
      ]),
      key('Los cuatro doji', '• **Normal:** una cruz con mechas parecidas.\n• **De patas largas:** mechas muy largas a los dos lados.\n• **Libélula:** una T, con mecha inferior larga.\n• **Lápida:** una T invertida, con mecha superior larga.', 'Marubozu dice fuerza; peonza, duda; doji, empate.', 'Un doji no dice «va a girar». Dice «nadie sabe qué hacer». Espera a la vela siguiente.'),
    ], [
      match('Empareja cada vela con lo que cuenta.', [['Marubozu alcista', 'Los compradores mandaron toda la sesión'], ['Peonza', 'Indecisión con movimiento a los dos lados'], ['Doji', 'Empate: apertura y cierre casi iguales'], ['Marubozu bajista', 'Los vendedores mandaron toda la sesión']], 'El tamaño del cuerpo cuenta la convicción; las mechas, los intentos de cada bando.'),
      match('Empareja cada doji con su forma.', [['Doji libélula', 'T: mecha inferior larga, sin mecha superior'], ['Doji lápida', 'T invertida: mecha superior larga'], ['Doji de patas largas', 'Mechas muy largas a los dos lados'], ['Doji normal', 'Una cruz con mechas parecidas']], 'En la libélula, los compradores devolvieron el precio arriba del todo; en la lápida, los vendedores lo devolvieron abajo.'),
      candle('Toca el doji de este gráfico.', 'doji-2', 'Apertura y cierre casi idénticos: el cuerpo es una raya. Empate en esa sesión.'),
      candle('Toca el marubozu: la vela verde con cuerpo grande y casi sin mechas.', 'marubozu-2', 'Abrió prácticamente en el mínimo y cerró en el máximo: los compradores controlaron toda la sesión.'),
      timed(single('Rápido: apertura 25,10 y cierre 25,11, con mechas a los dos lados. ¿Qué vela es?', ['Doji', 'Marubozu', 'Martillo'], 0, 'Apertura y cierre casi iguales: doji.'), 10),
      timed(tf('Un marubozu alcista abre en el máximo y cierra en el mínimo.', false, 'Al revés: abre en el mínimo y cierra en el máximo.'), 10),
      tf('Según Bulkowski, el doji libélula acierta el giro 9 de cada 10 veces.', false, 'Solo la mitad de las veces, como una moneda. Por eso es una señal de atención, no de acción.'),
      fill('El doji con forma de T invertida, con una mecha superior larga, se llama doji ____.', 'lápida', ['libélula', 'martillo', 'marubozu'], 'Los compradores subieron el precio, pero los vendedores lo devolvieron abajo del todo.'),
      scenario('Tras tres semanas de subida aparece un doji. Ana quiere vender todo porque «el doji anuncia el giro». ¿Qué le dices?', [['Que venda todo ya', 'El doji solo indica empate. Tras una subida larga merece atención, pero sin confirmación es casi una moneda al aire.'], ['Que espere a la vela siguiente para ver quién gana', 'Bien: si la siguiente cierra con fuerza a la baja, el doji gana importancia; si no, era una pausa.'], ['Que compre más: el doji es alcista', 'El doji no tiene dirección: es indecisión.']], 1, 'Un doji pide atención y confirmación, no una decisión inmediata.'),
      buckets('¿Fuerza o indecisión?', ['Fuerza', 'Indecisión'], [['Marubozu', 0], ['Doji', 1], ['Peonza', 1], ['Cuerpo largo con mechas mínimas', 0], ['Doji de patas largas', 1]], 'Cuerpo grande sin mechas = fuerza. Cuerpo pequeño o inexistente = duda o empate.'),
    ], { source: '8.4', minutes: 6, retire: [4, 5, 6, 9] }),

    lesson('u20l4', 'Martillo y estrella fugaz', [
      chart('shooting-star-3', 'Tras la subida, toca la estrella fugaz: cuerpo pequeño abajo y mecha superior larga', 'Esa. Los compradores lo intentaron y los vendedores lo devolvieron abajo.', 'Busca la mecha superior más larga después de varias velas al alza.'),
      story('¿Martillo?', [{ id: 'nora', name: 'Nora' }], [
        say('nora', 'Tras un mes subiendo, sale una vela con la mecha inferior larguísima. ¡Un martillo!'),
        choose('¿Cómo se llama esa vela tras una subida?', [
          opt('Hombre colgado', 'good', say('lumi', 'Eso. Misma forma, pero tras una subida cambia de nombre.')),
          opt('Martillo', 'bad', say('lumi', 'Solo es martillo **tras una caída**. Aquí es hombre colgado.')),
          opt('Estrella fugaz', 'ok', say('lumi', 'Casi: la estrella fugaz tiene la mecha larga **arriba**.')),
        ]),
        say('nora', '¿Y eso anuncia una caída?'),
        say('lumi', 'En teoría. Según Bulkowski, ¡sigue al alza el **59 %** de las veces!'),
        say('lumi', 'Él mismo describe estas velas como «no muy lejos del azar».'),
      ]),
      play({
        title: 'Forma y contexto',
        intro: 'Cuerpo **pequeño** en un extremo y una mecha de al menos **2-3 veces** el cuerpo. ¿Martillo, estrella fugaz o ninguna de las dos?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Martillo' }, { label: 'Estrella fugaz' }, { label: 'Ninguna de las dos' }],
          cards: [
            { icon: 'candles', label: 'Mecha inferior larga tras una caída', bin: 0, why: 'Rechazo de los precios bajos tras caer: martillo.' },
            { icon: 'candles', label: 'Mecha superior larga tras una subida', bin: 1, why: 'Rechazo de los precios altos tras subir: estrella fugaz.' },
            { icon: 'candles', label: 'Mecha inferior larga tras una subida', bin: 2, why: 'Es un hombre colgado.' },
            { icon: 'candles', label: 'Mecha superior larga tras una caída', bin: 2, why: 'Es un martillo invertido.' },
            { icon: 'candles', label: 'Cuerpo pequeño arriba y mecha larga abajo, en el mínimo de varias semanas', bin: 0, why: 'Forma de martillo y en buen sitio.' },
            { icon: 'candles', label: 'Cuerpo pequeño abajo y mecha larga arriba, en el máximo del mes', bin: 1, why: 'Forma de estrella fugaz tras subir.' },
          ],
        },
        goal: { text: 'Pon nombre a las seis velas.', when: [when('done', '==', 6)] },
        insight: 'Primero la **forma** (dónde está la mecha larga) y después el **contexto** (de dónde viene el precio): la misma vela cambia de nombre.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Dónde está la mecha larga? ¿Venía subiendo o bajando?', mood: 'THINKING' },
          { say: 'Mira la forma y luego el contexto', mood: 'HAPPY' },
        ],
      }),
      key('Lo que dicen los datos (Bulkowski)', '• Martillo: gira al alza el **60 %** (puesto 65 de 103).\n• Hombre colgado: ¡sigue al alza el **59 %**! (puesto 87).\n• Estrella fugaz: gira a la baja el **59 %** (puesto 55).\n\nÉl mismo los describe como «no muy lejos del azar».', 'La misma forma cambia de nombre según venga tras una subida o tras una bajada.', 'El martillo solo es martillo tras una caída. Y aun así, sin contexto acierta poco más que una moneda.'),
    ], [
      candle('Tras la caída, toca el martillo.', 'hammer-2', 'Cuerpo pequeño arriba y mecha inferior larguísima tras varias velas rojas: los vendedores empujaron y los compradores devolvieron el precio arriba.'),
      candle('Tras la subida, toca la estrella fugaz.', 'shooting-star-2', 'Mecha superior varias veces mayor que el cuerpo: el intento de subir fue rechazado.'),
      buckets('Pon nombre a cada vela según su forma y su contexto.', ['Martillo', 'Hombre colgado', 'Estrella fugaz', 'Martillo invertido'], [['Mecha inferior larga tras una caída', 0], ['Mecha inferior larga tras una subida', 1], ['Mecha superior larga tras una subida', 2], ['Mecha superior larga tras una caída', 3], ['Cuerpo pequeño arriba y mecha inferior larga en el mínimo de varias semanas', 0]], 'Primero la forma (dónde está la mecha larga) y después el contexto (de dónde viene el precio).'),
      single('¿Dónde va el stop lógico si compras tras un martillo confirmado?', ['Justo por debajo del mínimo del martillo', 'Justo por encima de su máximo', 'No hace falta stop'], 0, 'Si el precio pierde el mínimo de la mecha, la idea del rechazo de los precios bajos ha fallado.'),
      num('Un martillo tiene máximo 52 € y mínimo 47 €. Compras en 52 € tras la confirmación y pones el stop en 46,50 €. ¿Cuánto arriesgas por acción?', 5.5, '€', '52 − 46,50 = 5,50 € por acción. El stop va un poco por debajo de la mecha para no saltar por una simple mecha.'),
      tf('Según Bulkowski, tras un hombre colgado el precio sigue subiendo más veces de las que gira.', true, 'Continuación alcista el 59 %: lo contrario de lo que dice la teoría clásica.'),
      upDown('Fíjate en las mechas de las últimas velas. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-25', 'Martillos y estrellas fugaces giran alrededor del 60 % de las veces según Bulkowski: algo mejor que una moneda, lejos de una certeza.'),
      scenario('Ves un martillo de manual en un gráfico diario, tras dos semanas de caída y cerca del mínimo del año. ¿Qué haces según lo aprendido?', [['Compro ya con todo', 'Aun en buenas condiciones falla a menudo: entrar con todo y sin stop convierte un 60 % en una ruleta.'], ['Espero la confirmación y, si entro, pongo el stop bajo la mecha', 'Bien: confirmación (un cierre por encima del máximo del martillo) y un stop donde la idea deja de valer.'], ['Lo ignoro: las velas no sirven para nada', 'Las velas no predicen solas, pero dan contexto y un sitio lógico para el stop.']], 1, 'Un martillo es una pista, no una orden: confirmación, stop y tamaño prudente.'),
      timed(single('Rápido: mecha superior larga tras una subida.', ['Martillo', 'Estrella fugaz', 'Marubozu'], 1, 'Cuerpo pequeño abajo y mecha superior larga tras subir: estrella fugaz.'), 10),
      single('Según Bulkowski, ¿qué mejora los resultados del martillo?', ['Que aparezca cerca del mínimo del año', 'Que aparezca en mitad de un rango', 'Que tenga el cuerpo rojo'], 0, 'Funciona mejor en el tercio inferior del rango anual, y los de cuerpo verde van mejor.'),
    ], { source: '8.5', minutes: 6, retire: [2, 5, 8] }),

    lesson('u20l5', 'Envolventes y harami', [
      chart('bull-engulfing-2', 'Tras la caída, toca la vela verde que envuelve a la roja anterior', 'Su cuerpo se come entero el rojo del día anterior: los compradores recuperaron todo lo perdido y más.', 'Busca una vela verde enorme justo después de una roja.'),
      chart('bear-engulfing-3', 'Ahora al revés: tras la subida, toca la vela roja cuyo cuerpo envuelve a la verde anterior', 'Su cuerpo rojo se come el verde de la víspera: los vendedores borran todo lo ganado.', 'Busca una roja grande justo después de una verde pequeña.'),
      story('Un 79 % de aciertos', [{ id: 'hugo', name: 'Hugo' }], [
        say('hugo', 'La envolvente bajista acierta la dirección el 79 % de las veces. ¡Voy con todo!'),
        choose('¿Qué le falta mirar?', [
          opt('Cuánto suele caer frente a lo que pierde si falla', 'good', say('lumi', 'Eso. Gira a menudo, pero **gira poco**: puesto 91 de 103.')),
          opt('Nada: un 79 % es casi seguro', 'bad', say('lumi', 'Si el recorrido es pequeño y el stop grande, puedes perder acertando.')),
          opt('El color de la vela anterior', 'ok', say('lumi', 'Ya sabe que es verde. Importa cuánto gana y cuánto arriesga.')),
        ]),
        say('lumi', 'La envolvente alcista gira el **63 %** y queda en el puesto 84.'),
        say('lumi', 'La nube oscura gira el **60 %** y aun así queda en el puesto **22**.'),
        say('lumi', 'Acertar la dirección no basta: el recorrido tiene que compensar el riesgo.'),
      ]),
      key('Harami, penetrante y nube oscura', '• **Envolvente:** el cuerpo de la segunda vela se come el de la primera, en sentido contrario.\n• **Harami** («embarazada»): vela larga y después una pequeña **dentro** de su cuerpo. El impulso se frena.\n• **Pauta penetrante:** tras una caída, una verde que cierra **por encima de la mitad** del cuerpo rojo anterior.\n• **Nube oscura:** tras una subida, una roja que cierra **por debajo de la mitad** del verde.', 'Acertar la dirección no basta: el recorrido tiene que compensar el riesgo.', 'Una envolvente gira a menudo, pero a veces gira poco.'),
    ], [
      candle('Tras la subida, toca la vela roja que envuelve a la verde anterior.', 'bear-engulfing-1', 'El cuerpo rojo se come el verde anterior: los vendedores borran todo lo ganado la sesión previa.'),
      candle('Toca la envolvente alcista de este gráfico.', 'bull-engulfing-3', 'Vela verde cuyo cuerpo cubre por completo el de la roja anterior, después de varias sesiones flojas.'),
      single('En un harami, la segunda vela…', ['Envuelve el cuerpo de la primera', 'Queda dentro del cuerpo de la primera', 'No tiene mechas'], 1, 'Es lo contrario de una envolvente: una vela pequeña dentro de la grande indica que el impulso se frena.'),
      match('Empareja cada patrón de dos velas con su historia.', [['Envolvente alcista', 'Los compradores recuperan todo lo de ayer y más'], ['Harami', 'Vela pequeña dentro de la grande: el impulso se frena'], ['Nube oscura', 'Tras subir, los vendedores borran más de media vela verde'], ['Pauta penetrante', 'Tras caer, los compradores recuperan más de media vela roja']], 'La envolvente es un contraataque completo; la penetrante y la nube oscura, un contraataque a medias; el harami, una pausa.'),
      single('La envolvente bajista gira el 79 % de las veces, pero queda en el puesto 91 de 103 en rendimiento. ¿Por qué?', ['Porque es muy rara', 'Porque el movimiento posterior suele ser pequeño', 'Porque solo funciona en cripto'], 1, 'Acierta la dirección a menudo, pero el recorrido es corto. Además es muy frecuente (puesto 11).'),
      num('Vela 1 roja: abre en 30 € y cierra en 27 €. Vela 2 verde: abre en 26,50 €. ¿Por encima de qué precio tiene que cerrar para ser una envolvente alcista?', 30, '€', 'Debe cerrar por encima de la apertura de la vela roja (30 €), para que su cuerpo cubra el rojo entero.'),
      fill('En la nube oscura, la vela roja cierra por debajo de la ____ del cuerpo verde anterior.', 'mitad', ['apertura', 'mecha', 'cima'], 'Si lo envolviera entero, sería una envolvente bajista.'),
      tf('Los patrones con hueco entre velas tienen el mismo sentido en criptomonedas que en acciones.', false, 'Las cripto cotizan 24/7 y las divisas casi sin pausa: apenas hay huecos entre velas, así que estos patrones se forman de otra manera o pierden sentido.'),
      timed(single('Rápido: vela verde cuyo cuerpo se come el cuerpo rojo anterior, tras una caída.', ['Envolvente alcista', 'Harami', 'Estrella fugaz'], 0, 'Es la envolvente alcista.'), 10),
      scenario('Marta encuentra una envolvente bajista de manual. Sabe que gira el 79 % de las veces y quiere apostar fuerte. ¿Qué le falta mirar?', [['Nada: un 79 % es casi seguro', 'Acierta la dirección a menudo, pero si el recorrido es pequeño y el stop grande, puede perder dinero acertando.'], ['Cuánto puede caer frente a lo que pierde si falla', 'Eso: con un recorrido medio pequeño, la relación beneficio/riesgo puede no compensar.'], ['El color de la vela anterior', 'Ya lo sabe: verde. La pregunta importante es cuánto gana si acierta y cuánto pierde si falla.']], 1, 'Acertar la dirección no basta: hay que comparar el recorrido esperado con el riesgo.'),
    ], { source: '8.6', minutes: 6, retire: [4, 7, 8, 9] }),

    lesson('u20l6', 'Estrellas, soldados y cuervos', [
      chart('morning-star-2', 'Tras una roja larga y una vela pequeña de duda, toca la tercera vela de la estrella de la mañana: la verde que confirma', 'Roja larga, vela pequeña de duda y verde larga que recupera terreno: estrella de la mañana.', 'Busca la secuencia roja grande → vela pequeña → verde grande, y toca la verde.'),
      play({
        title: '¿Giro alcista o bajista?',
        intro: 'Los patrones de tres velas cuentan una historia completa. ¿Hacia dónde apunta cada uno?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Alcista' }, { label: 'Bajista' }],
          cards: [
            { icon: 'sun', label: 'Estrella de la mañana', bin: 0, why: 'Tras una caída: roja larga, vela pequeña y verde larga.' },
            { icon: 'star', label: 'Estrella de la tarde', bin: 1, why: 'Lo mismo al revés, tras una subida.' },
            { icon: 'flag', label: 'Tres soldados blancos', bin: 0, why: 'Tres verdes largas, cada una cerrando más arriba y cerca de su máximo.' },
            { icon: 'alert', label: 'Tres cuervos negros', bin: 1, why: 'Tres rojas largas tras una subida, cada una con nuevos mínimos.' },
            { icon: 'star', label: 'Estrella doji de la tarde', bin: 1, why: 'Una estrella de la tarde con un doji en medio.' },
            { icon: 'sun', label: 'Estrella doji de la mañana', bin: 0, why: 'Una estrella de la mañana con un doji en medio.' },
          ],
        },
        goal: { text: 'Clasifica los seis patrones.', when: [when('done', '==', 6)] },
        insight: 'Tres velas cuentan **mejor la historia** que una: un bando domina, después duda y al final el otro toma el control.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Mañana y soldados, al alza. Tarde y cuervos, a la baja.', mood: 'THINKING' },
          { say: '¿Alcista o bajista?', mood: 'HAPPY' },
        ],
      }),
      story('Tres soldados blancos', [{ id: 'leo', name: 'Leo' }], [
        say('leo', '¡Tres soldados blancos en mi acción! Bulkowski dice 82 %. Casi seguro, ¿no?'),
        choose('¿Qué le dices?', [
          opt('Es de los mejores, pero falla casi 1 de cada 5', 'good', say('lumi', 'Eso. Y Bulkowski mide sin comisiones ni spreads.')),
          opt('Con un 82 % no hay riesgo', 'bad', say('lumi', 'Un 18 % de fallos es casi una de cada cinco veces.')),
          opt('Las velas no sirven: olvídalo', 'ok', say('lumi', 'Sirven para leer el mercado y poner stops con lógica. No garantizan nada.')),
        ]),
        say('leo', 'La acción venía de meses bajando, eso sí.'),
        say('lumi', 'Ojo: como rebote en una tendencia bajista, la bajada suele continuar.'),
        say('lumi', 'Los mejores patrones mejoran las probabilidades. No las convierten en certezas.'),
      ]),
      key('Los mejores números (Bulkowski)', '• Estrella de la mañana: gira el **78 %** (puesto 12 de 103).\n• Estrella de la tarde: **72 %** (puesto **4**).\n• Tres soldados blancos: **82 %** (puesto 32).\n• Tres cuervos negros: **78 %** (puesto **3**).\n\nMejores que las velas sueltas, pero mucho menos frecuentes.', 'Tres velas cuentan mejor la historia que una.', 'Por eso son más fiables… y más raras.'),
    ], [
      order('Ordena las velas de una estrella de la mañana.', ['Roja larga tras una caída', 'Vela pequeña con hueco abajo', 'Verde larga que cierra por encima de la mitad de la primera'], 'Los vendedores dominan, después dudan y al final los compradores toman el control.'),
      candle('Toca la vela que completa la estrella de la mañana.', 'morning-star-3', 'Tras una roja larga y una vela pequeña de duda, esta verde larga cierra el patrón.'),
      match('Empareja cada patrón con su señal.', [['Estrella de la mañana', 'Giro alcista tras una caída'], ['Estrella de la tarde', 'Giro bajista tras una subida'], ['Tres soldados blancos', 'Avance firme de los compradores'], ['Tres cuervos negros', 'Avance firme de los vendedores tras una subida']], 'Los nombres vienen de la tradición japonesa de los comerciantes de arroz.'),
      match('Empareja cada patrón con su puesto de rendimiento según Bulkowski (de 103).', [['Tres cuervos negros', 'Puesto 3'], ['Estrella de la tarde', 'Puesto 4'], ['Estrella de la mañana', 'Puesto 12'], ['Martillo', 'Puesto 65']], 'Los patrones de tres velas están entre los mejores; muchas velas sueltas famosas quedan a media tabla o por debajo.'),
      single('Si los patrones de tres velas tienen mejores números, ¿por qué no lo resuelven todo?', ['Porque aparecen pocas veces', 'Porque solo existen en Japón', 'Porque no tienen nombre'], 0, 'Son poco frecuentes, y Bulkowski mide sin comisiones ni spreads.'),
      tf('Según Bulkowski, unos tres soldados blancos que aparecen como rebote dentro de una tendencia bajista suelen dar paso a que la bajada continúe.', true, 'El contexto manda: en una tendencia bajista de fondo, ese rebote suele quedarse en eso.'),
      upDown('Busca patrones de tres velas al final de este gráfico. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-7', 'Aunque encontraras una estrella de la mañana de libro, Bulkowski mide un 78 % de giros: más de una de cada cinco falla.'),
      fill('Si la vela del medio de una estrella de la tarde es un doji, el patrón se llama estrella ____ de la tarde.', 'doji', ['fugaz', 'martillo', 'marubozu'], 'Bulkowski le da un 71 % de giros bajistas (puesto 30).'),
      timed(single('Rápido: tres velas rojas largas tras una subida, cada una con nuevos mínimos.', ['Tres soldados blancos', 'Tres cuervos negros', 'Harami'], 1, 'Son los tres cuervos negros: giro bajista el 78 % según Bulkowski.'), 10),
      chat(['He encontrado tres soldados blancos en una acción 🪖🪖🪖', 'Bulkowski dice 82 %. ¡Es casi seguro!'], '¿Qué le dices?', [['Sí, con un 82 % no hay riesgo', 'Un 18 % de fallos es casi una de cada cinco. Y Bulkowski mide sin comisiones ni spreads.'], ['Es de los mejores patrones, pero falla casi una de cada cinco veces y hay que mirar el contexto', '¡Exacto! Y si aparece como rebote dentro de una tendencia bajista, suele fallar.'], ['Las velas no sirven, olvídalo', 'Sirven para leer el mercado y poner stops con lógica; lo que no hacen es garantizar nada.']], 1, 'Los mejores patrones mejoran las probabilidades, no las convierten en certezas.'),
    ], { source: '8.8', minutes: 6, retire: [2, 5, 8, 9] }),

    lesson('u20l7', 'El contexto lo es todo', [
      chart('hammer-3', 'Toca el martillo y después fíjate en las dos velas siguientes', 'Es el martillo. La vela siguiente cerró por encima de su máximo (confirmación)… y la otra cayó con fuerza. Confirmar reduce errores; no los elimina.', 'Busca la mecha inferior más larga tras la caída.'),
      play({
        title: 'Los cuatro filtros',
        intro: 'Has visto un martillo. ¿Qué le da más credibilidad y qué no?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Suma credibilidad' }, { label: 'No suma' }],
          cards: [
            { icon: 'down', label: 'Llega tras tres meses de caída', bin: 0, why: 'Tendencia previa: un patrón de giro necesita algo que girar.' },
            { icon: 'scale', label: 'Aparece en mitad de un rango lateral', bin: 1, why: 'No hay tendencia que girar ni nivel que defender.' },
            { icon: 'shield', label: 'Aparece en el mínimo del año, sobre un soporte', bin: 0, why: 'Nivel relevante: mucha gente lo vigila.' },
            { icon: 'timer', label: 'Es un gráfico de 1 minuto', bin: 1, why: 'En minutos manda el ruido. Mejor diario o semanal.' },
            { icon: 'bars', label: 'Volumen del doble de la media', bin: 0, why: 'Mucha gente detrás: más creíble.' },
            { icon: 'megaphone', label: 'Un influencer dice que acierta el 90 %', bin: 1, why: 'Ningún estudio serio da algo así.' },
            { icon: 'verified', label: 'La vela siguiente cierra al alza', bin: 0, why: 'Confirmación: el precio va en la dirección esperada.' },
            { icon: 'gauge', label: 'Volumen bajísimo', bin: 1, why: 'Poca gente detrás de la señal.' },
          ],
        },
        goal: { text: 'Clasifica las ocho pistas.', when: [when('done', '==', 8)] },
        insight: 'Cuatro filtros: **tendencia previa, nivel, volumen y confirmación**. Y mejor en gráfico diario o semanal que en minutos.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Piensa en tendencia, nivel, volumen y confirmación.', mood: 'THINKING' },
          { say: '¿Suma o no suma?', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Solo con velas',
        intro: 'Reto final: cuatro gráficos reales, sin contexto. ¿Sube o baja en las 10 sesiones siguientes?',
        widget: { kind: 'guess', rounds: ['ud-18', 'ud-30', 'ud-62', 'ud-94'] },
        goal: { text: 'Juega las cuatro rondas.', when: [when('done', '==', 4)] },
        insight: 'Solo con velas, los aciertos rondan los de una moneda. **Marshall, Young y Rose** probaron 28 patrones en las acciones del Dow Jones (1992–2002): no aportaban valor.',
        lumi: [
          { when: when('right', '==', 4), say: '¡Cuatro de cuatro! Con tan pocas rondas, la suerte pesa mucho.', mood: 'CELEBRATE' },
          { when: when('done', '==', 4), say: 'Por eso los estudios serios usan miles de casos.', mood: 'THINKING' },
          { say: 'Mira solo las velas y decide', mood: 'HAPPY' },
        ],
      }),
      key('Entonces, ¿para qué sirven?', 'Un estudio en Japón (1975–2004), la cuna de las velas, llegó a lo mismo que Marshall, Young y Rose. Bulkowski mide sin comisiones ni *spreads*. Y si pruebas cien patrones, alguno parecerá funcionar por casualidad (*data snooping*).\n\nLas velas sirven para **leer** el mercado (rechazo, convicción, indecisión), para poner el **stop** en un sitio lógico y para no dejarte engañar por quien vende patrones «con un 90 % de acierto».', 'Las velas son un idioma, no una bola de cristal.', 'La vela es la frase; el contexto, el libro entero.'),
    ], [
      multi('¿Cuáles son los cuatro filtros que dan valor a un patrón de velas? Marca todos.', ['Tendencia previa', 'Nivel relevante', 'Volumen', 'Confirmación', 'Que el gráfico sea de 1 minuto'], [0, 1, 2, 3], 'Sin ellos, el patrón es poco más que ruido. Y en gráficos de minutos el ruido manda.'),
      upDown('Reto: mira solo las velas y decide. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-60', 'Apunta tus aciertos en estos retos: con suficientes intentos verás que, solo con velas, rondan los de una moneda al aire.'),
      upDown('Otro activo, otro intento. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-82', 'Cada gráfico tiene su historia, pero ninguno trae la respuesta escrita. Lo que sí controlas es cuánto arriesgas.'),
      upDown('Y uno más. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-92', 'Tres intentos son muy pocos para sacar conclusiones: por eso los estudios serios usan miles de casos.'),
      tf('Si un patrón acierta la dirección el 60 % de las veces, seguro que es rentable.', false, 'Depende del recorrido cuando acierta, de lo que pierdes cuando falla y de los costes.'),
      tf('Marshall, Young y Rose concluyeron que 28 patrones de velas no aportaban valor en las acciones del Dow Jones.', true, 'Y un estudio en el mercado japonés (1975–2004) llegó a la misma conclusión.'),
      single('Ves una estrella fugaz en el gráfico de 5 minutos de una cripto, en mitad de un rango y con volumen bajo. ¿Cuántos filtros cumple?', ['Los cuatro', 'Ninguno', 'Solo el de volumen'], 1, 'No hay tendencia previa, ni nivel relevante, el volumen es bajo y no hay confirmación. Además, en 5 minutos manda el ruido.'),
      single('¿Qué es el sesgo de búsqueda de datos (data snooping)?', ['Probar muchos patrones hasta que alguno parece funcionar por casualidad', 'Mirar los datos en tiempo real', 'Usar velas en vez de líneas'], 0, 'Con suficientes pruebas, la casualidad siempre regala algún «descubrimiento».'),
      scenario('Una acción en tendencia alcista de un año corrige un 12 % hasta su media de 200 sesiones, que coincide con un antiguo máximo. Forma un martillo con volumen alto y al día siguiente cierra por encima. Bruno ve los cuatro filtros. ¿Qué es lo sensato?', [['Entrar sin stop: con cuatro de cuatro no puede fallar', 'Puede fallar igual. Sin stop, un fallo puede costar mucho más de lo previsto.'], ['Si entra, stop bajo el mínimo del martillo y una posición pequeña', 'Eso: cuatro de cuatro mejora las probabilidades, y la gestión del riesgo le protege cuando falla.'], ['No entrar nunca: las velas no funcionan', 'Las velas solas aportan poco, pero con contexto son una pista razonable para quien opera con un plan.']], 1, 'El contexto mejora las probabilidades; el stop y el tamaño protegen cuando aun así sale mal.'),
      timed(tf('Un patrón de velas en un gráfico diario es más significativo que en uno de 1 minuto.', true, 'En temporalidades cortas domina el ruido.'), 10),
      chat(['Un influencer vende un curso de velas «con un 90 % de acierto» 💸', '¿Tú qué opinas?'], '¿Qué le contestas a Lumi?', [['Que un 90 % es una pasada', 'Los mejores patrones que mide Bulkowski giran en torno al 70–80 % de las veces, sin costes. Un 90 % es una señal de alarma.'], ['Que desconfío: ningún estudio serio da algo así, y los costes se comen gran parte', '¡Bien visto! Muchas velas famosas están en el 50–60 %, y los estudios académicos no encuentran valor tras costes.'], ['Que depende de cuántos seguidores tenga', 'Tener muchos seguidores no hace verdadera una cifra.']], 1, 'Desconfía de cualquier porcentaje de acierto espectacular: la evidencia dice otra cosa.'),
    ], { source: '8.9', minutes: 6, retire: [2, 3, 4, 9] }),
  ],
})
