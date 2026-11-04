import 'server-only'
// Sección 7 · Unidad 19 · Leer un gráfico (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/07-leer-un-grafico.md. Gráficos reales: docs/curso-v2/graficos.md
import { buckets, candle, chart, chat, choose, fill, key, lesson, match, mission, multi, num, opt, order, play, point, say, scenario, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u19', order: 19, title: 'Leer un gráfico', description: 'Ejes, tipos de gráfico, temporalidades, escalas, tendencia y volumen',
  lessons: [
    lesson('u19l1', 'Qué muestra un gráfico de precios', [
      play({
        title: '¿Qué te cuenta un gráfico?',
        intro: 'En horizontal, el **tiempo**. En vertical, el **precio**. Debajo, el **volumen**. ¿Qué puedes saber mirándolo?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Lo dice el gráfico' }, { label: 'No lo dice' }],
          cards: [
            { icon: 'candles', label: 'A qué precio abrió ayer', bin: 0, why: 'Cada vela guarda su apertura.' },
            { icon: 'clock', label: 'El precio de mañana', bin: 1, why: 'Nadie lo sabe: el gráfico es un registro del pasado.' },
            { icon: 'up', label: 'El precio más alto de la semana', bin: 0, why: 'Cada vela guarda su máximo y su mínimo.' },
            { icon: 'bars', label: 'Cuánto se negoció hoy', bin: 0, why: 'Es el volumen: las barras de abajo.' },
            { icon: 'company', label: 'Si la empresa es un buen negocio', bin: 1, why: 'Eso lo dicen sus cuentas, no su gráfico.' },
            { icon: 'calendar', label: 'El cierre de hace un año', bin: 0, why: 'El eje horizontal te lleva hacia atrás en el tiempo.' },
            { icon: 'target', label: 'Si va a seguir subiendo', bin: 1, why: 'Puede seguir o no: son probabilidades, nunca certezas.' },
          ],
        },
        goal: { text: 'Clasifica las siete preguntas.', when: [when('done', '==', 7)] },
        insight: 'Un gráfico es el **registro exacto** de lo que compradores y vendedores acordaron. Cuenta lo que pasó, **no lo que va a pasar**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Ya ha pasado o todavía no? Esa es la clave.', mood: 'THINKING' },
          { say: '¿Lo puedes leer en el gráfico?', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Leer no es adivinar',
        intro: 'Tres gráficos reales de 30 velas diarias. Léelos y decide: ¿**sube o baja** en las 10 sesiones siguientes?',
        widget: { kind: 'guess', rounds: ['ud-8', 'ud-24', 'ud-91'] },
        goal: { text: 'Juega las tres rondas.', when: [when('done', '==', 3)] },
        insight: 'Leer el pasado es fácil; adivinar el futuro, no. El análisis técnico trabaja con **probabilidades, nunca con certezas**.',
        lumi: [
          { when: when('right', '==', 3), say: '¡Tres de tres! Con tan pocas rondas, la suerte pesa mucho.', mood: 'CELEBRATE' },
          { when: when('done', '==', 3), say: 'Acertar el futuro con velas es difícil para todo el mundo.', mood: 'CALM' },
          { say: 'Mira las velas y elige: ¿sube o baja?', mood: 'HAPPY' },
        ],
      }),
      key('Cuatro precios por periodo', 'De cada periodo se guardan cuatro datos (en inglés, **OHLC**):\n\n• **Apertura** (open): el primer precio.\n• **Máximo** (high) y **mínimo** (low).\n• **Cierre** (close): el último, y el más importante.\n\nEn E-Trading, al pasar el dedo por una vela ves sus cuatro precios, la variación y el volumen.', 'Un gráfico cuenta lo que pasó, no lo que va a pasar.', 'Leerlo bien ya es una ventaja: mucha gente solo mira si está en verde o en rojo.'),
    ], [
      match('Empareja cada parte del gráfico con lo que muestra.', [['Eje horizontal', 'El tiempo'], ['Eje vertical', 'El precio'], ['Barras de abajo', 'El volumen negociado'], ['Cada vela', 'Lo que pasó en un periodo']], 'El tiempo va de izquierda a derecha, el precio en vertical y el volumen debajo. Cada vela resume un periodo: un minuto, un día o una semana.'),
      single('¿Qué precio de cada periodo se considera el más importante?', ['La apertura', 'El cierre', 'El máximo'], 1, 'El cierre es el precio en el que compradores y vendedores se quedaron al final del periodo. Casi todos los indicadores se calculan con cierres.'),
      point('Toca el cierre más alto de este gráfico', 'trend-up-2', 'max', 'El máximo llegó antes del final y después el precio retrocedió un poco. El punto más alto no tiene por qué ser el último.'),
      point('Ahora toca el cierre más bajo', 'trend-down-1', 'min', 'El mínimo no está al final: tras tocarlo, el precio rebotó. Localizar los extremos es el primer paso para leer un gráfico.'),
      fill('En inglés, los cuatro precios de cada periodo se resumen como ____.', 'OHLC', ['ETF', 'RSI', 'IPC'], 'Open, high, low, close: apertura, máximo, mínimo y cierre.'),
      num('Una acción cerró ayer en 50 € y hoy en 53 €. ¿Cuánto ha variado en el día?', 6, '%', '(53 − 50) ÷ 50 = 0,06 → +6 %. La variación diaria se calcula entre un cierre y el anterior.'),
      tf('Si un gráfico lleva tres meses subiendo, es seguro que mañana también subirá.', false, 'Un gráfico registra el pasado. La tendencia puede seguir o no: se habla de probabilidades, nunca de certezas.'),
      upDown('Primer contacto: 30 velas diarias reales, sin nombre ni fecha. ¿Qué crees que hizo el precio en las 10 sesiones siguientes?', 'ud-2', 'Mirando solo un gráfico nadie lo sabe con certeza. Este ejercicio sirve para notar la diferencia entre leer el pasado y adivinar el futuro.'),
      timed(single('Rápido: ¿qué eje muestra el tiempo?', ['El horizontal', 'El vertical', 'Ninguno: va en la leyenda'], 0, 'El tiempo avanza de izquierda a derecha; el precio va en vertical.'), 10),
      multi('Pasas el dedo por una vela en el gráfico de E-Trading. ¿Qué datos ves? Marca todos.', ['La apertura', 'El máximo y el mínimo', 'El cierre', 'El precio de mañana'], [0, 1, 2], 'Ves los cuatro precios del periodo, además de la variación y el volumen. El precio de mañana no lo sabe nadie.'),
    ], { source: '7.1', minutes: 6, retire: [6, 7, 8] }),

    lesson('u19l2', 'Línea, barras y velas', [
      story('Solo una línea', [{ id: 'hugo', name: 'Hugo' }], [
        say('hugo', 'Mi app de inversión solo me enseña una línea. ¿Me pierdo algo?'),
        choose('¿Qué le dices?', [
          opt('Para ver años, la línea basta; las velas enseñan cada sesión', 'good', say('lumi', 'Eso. La línea une los cierres; las velas guardan los cuatro precios.')),
          opt('Nada: la línea lo dice todo', 'bad', say('lumi', 'Sin velas no ves máximos, mínimos ni lo que pasó dentro del día.')),
          opt('Sin velas no se puede invertir', 'ok', say('lumi', 'Se puede invertir bien mirando poco el gráfico. Las velas son útiles, no obligatorias.')),
        ]),
        say('lumi', 'Las **barras** muestran del mínimo al máximo, con dos rayitas.'),
        say('lumi', 'La de la izquierda es la apertura; la de la derecha, el cierre.'),
        say('lumi', 'Las **velas** dicen lo mismo con un cuerpo de color. Son el estándar.'),
        say('hugo', 'Vale, ¡enséñame una!'),
      ]),
      chart('marubozu-1', 'En velas se ve la batalla de cada día. Toca la vela verde más larga', 'Abrió cerca del mínimo y cerró cerca del máximo: los compradores mandaron toda la sesión. En un gráfico de línea solo verías un punto más arriba.', 'Busca el cuerpo verde más alto, casi sin líneas finas arriba y abajo.'),
      play({
        title: '¿Línea o velas?',
        intro: 'Cada gráfico responde a una pregunta. ¿Cuál usarías para cada cosa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Línea o área' }, { label: 'Velas o barras' }],
          cards: [
            { icon: 'chart', label: 'Ver cómo ha ido un fondo indexado en 10 años', bin: 0, why: 'Para la tendencia larga, la línea basta y se lee mejor.' },
            { icon: 'candles', label: 'Ver si hoy el precio subió y luego volvió abajo', bin: 1, why: 'Solo las velas y las barras guardan el máximo del día.' },
            { icon: 'shield', label: 'Saber el mínimo de ayer para poner un stop', bin: 1, why: 'La línea solo tiene cierres: no ves el mínimo.' },
            { icon: 'globe', label: 'Comparar dos índices durante décadas', bin: 0, why: 'La línea enseña la dirección sin ruido.' },
            { icon: 'clock', label: 'Leer la apertura y el cierre de cada día', bin: 1, why: 'Son dos de los cuatro precios de cada vela.' },
            { icon: 'pie', label: 'Enseñar cuánto ha subido tu cartera en 5 años', bin: 0, why: 'Para una evolución larga, la línea o el área.' },
          ],
        },
        goal: { text: 'Clasifica los seis usos.', when: [when('done', '==', 6)] },
        insight: 'La **línea** resume hacia dónde va; las **velas** cuentan quién ganó cada periodo. Para operar hacen falta los cuatro precios.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Te basta el cierre o necesitas lo que pasó dentro del día?', mood: 'THINKING' },
          { say: 'Elige el gráfico para cada cosa', mood: 'HAPPY' },
        ],
      }),
      key('Cuidado con Heikin Ashi', 'Hay más formas: el **área** (la línea con relleno, como en muchas apps) y el **Heikin Ashi**, velas promediadas que suavizan el ruido.\n\nSus aperturas y cierres se calculan con promedios: **no son precios reales**. Sirve para ver la tendencia, nunca para decidir a qué precio entrar o dónde poner un stop.', 'La línea resume; las velas cuentan la batalla de cada periodo.', 'Para ver hacia dónde va, la línea. Para ver quién gana cada día, las velas.'),
    ], [
      match('Empareja cada tipo de gráfico con lo que muestra.', [['Línea', 'Solo los cierres unidos'], ['Barras', 'Del mínimo al máximo, con rayitas de apertura y cierre'], ['Velas', 'Cuerpo de color entre apertura y cierre'], ['Heikin Ashi', 'Velas promediadas, sin precios reales']], 'Línea y área resumen; barras y velas tienen los cuatro precios; Heikin Ashi suaviza a costa de no mostrar precios reales.'),
      single('¿Qué gráfico no muestra los precios reales de apertura y cierre?', ['Velas', 'Barras', 'Heikin Ashi'], 2, 'Heikin Ashi calcula cada vela con promedios para suavizar el ruido: sus aperturas y cierres no son precios negociados.'),
      candle('Toca la vela con el cuerpo verde más grande.', 'bull-engulfing-1', 'Ese cuerpo enorme dice que los compradores dominaron la sesión de principio a fin. Un gráfico de línea solo te mostraría un cierre más alto.'),
      tf('En un gráfico de barras, la rayita de la izquierda marca el cierre.', false, 'La de la izquierda es la apertura; la de la derecha, el cierre.'),
      buckets('¿Qué gráfico usarías para cada cosa?', ['Línea o área', 'Velas o barras'], [['Ver la tendencia de 10 años de un índice', 0], ['Saber si hoy hubo rechazo de los precios altos', 1], ['Enseñar cuánto ha subido un fondo en 5 años', 0], ['Poner un stop bajo el mínimo de ayer', 1], ['Leer la apertura y el cierre de cada día', 1]], 'La línea resume la tendencia; las velas y las barras tienen los cuatro precios de cada periodo, que son los que hacen falta para operar.'),
      trend('En línea, la dirección se ve de un vistazo. ¿Qué tendencia tiene?', 'trend-down-2', 'Bajista', 'Cada rebote se queda por debajo del anterior y los cierres van cada vez más abajo.'),
      fill('El gráfico que suaviza el ruido con promedios se llama ____.', 'Heikin Ashi', ['Marubozu', 'Doji', 'Fibonacci'], 'Heikin Ashi sirve para ver la tendencia; marubozu y doji son tipos de vela y Fibonacci es una herramienta de retrocesos.'),
      scenario('Pablo mira un gráfico Heikin Ashi, ve que la última vela cerró en 102 € y pone una orden de venta a ese precio exacto. ¿Qué le dices?', [['Bien hecho: es el cierre de la vela', 'Ese 102 € es un promedio calculado, no un precio negociado: su orden puede no ejecutarse donde cree.'], ['Que mire los precios reales en velas o barras antes de fijar la orden', 'Eso es: Heikin Ashi sirve para la tendencia; los precios para operar se miran en velas, barras o línea.'], ['Que espere a que el Heikin Ashi se ponga verde', 'El color ayuda a ver la tendencia, pero sus precios siguen sin ser reales.']], 1, 'Cada tipo de gráfico tiene su uso: Heikin Ashi para la tendencia, velas o barras para los precios reales.'),
      timed(single('Rápido: ¿qué gráfico es el estándar en casi todas las plataformas?', ['Velas japonesas', 'Puntos y figuras', 'Área'], 0, 'Las velas muestran los cuatro precios de forma fácil de leer.'), 10),
      chat(['Mi app de inversión solo me enseña una línea 📈', '¿Me estoy perdiendo algo?'], '¿Qué le contestas a Lumi?', [['No, la línea lo dice todo', 'La línea solo une los cierres: no ves máximos, mínimos ni lo que pasó dentro de cada día.'], ['Para ver la evolución a largo plazo, la línea basta; las velas sirven para ver cada sesión por dentro', '¡Eso! Para mirar un fondo a años, la línea va bien. Para operar, hacen falta los cuatro precios.'], ['Sí: sin velas no se puede invertir', 'Se puede invertir muy bien mirando poco el gráfico. Las velas son útiles, no obligatorias.']], 1, 'Cada gráfico responde a una pregunta: la línea, hacia dónde va; las velas, quién ganó cada periodo.'),
    ], { source: '7.2', minutes: 6, retire: [3, 4, 8, 9] }),

    lesson('u19l3', 'Temporalidades', [
      story('El gráfico de 5 minutos', [{ id: 'irene', name: 'Irene' }], [
        say('irene', 'Invierto a 10 años en una acción. En el gráfico semanal lleva un año subiendo.'),
        say('irene', 'Pero hoy, en el de 5 minutos, ¡lleva toda la mañana cayendo! ¿Vendo?'),
        choose('¿Qué le dices?', [
          opt('Mira la temporalidad de tu horizonte', 'good', say('lumi', 'Eso. A 10 años manda el semanal; la mañana es ruido.')),
          opt('Vende ya: la tendencia ha cambiado', 'bad', say('lumi', 'Una mañana en 5 minutos no rompe la tendencia de un año.')),
          opt('Compra más para aprovechar la caída', 'ok', say('lumi', 'Ni vender ni comprar por una mañana: es la herramienta equivocada.')),
        ]),
        say('lumi', 'Cada vela puede ser un minuto, una hora, un día, una semana o un mes.'),
        say('lumi', 'En diario puede verse una subida y en 5 minutos, una caída. Ambas son ciertas.'),
      ]),
      play({
        title: 'Operar cada pocos minutos',
        intro: 'En minutos manda el **ruido**: las señales fallan como una moneda. Y cada operación paga comisión y *spread*.',
        widget: { kind: 'coinflip', traders: 1000, trades: 1, maxTrades: 500, fee: 5, stake: 100, win: 1 },
        predict: {
          prompt: 'Mil personas operan a cara o cruz pagando 5 € cada vez. Tras 300 operaciones, ¿cuántas pierden?',
          options: ['La mitad: es una moneda', 'La gran mayoría', 'Casi nadie'],
          answer: 1,
          why: 'Pierde el **80 %**: la comisión inclina la moneda en su contra en cada operación.',
        },
        goal: { text: 'Llega a 300 operaciones por persona y mira cuántos pierden.', when: [when('trades', '>=', 300)] },
        insight: 'Cuanto más corta la temporalidad, más operaciones y más **costes**. En un estudio de *day trading* en Brasil (2013-2015), el **97 %** de quienes insistieron más de 300 días perdió dinero.',
        lumi: [
          { when: when('losersPct', '>=', 80), say: 'Ocho de cada diez pierden, y nadie ha hecho nada raro.', mood: 'WORRIED' },
          { when: when('trades', '==', 1), say: 'Con una operación, mitad y mitad: es una moneda.', mood: 'CALM' },
          { say: 'Sube las operaciones y mira a los que pierden', mood: 'THINKING' },
        ],
      }),
      play({
        title: 'Cada horizonte, su gráfico',
        intro: 'La temporalidad se elige según cuánto tiempo mantienes tus inversiones. ¿Qué gráfico encaja con cada persona?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Minutos u horas' }, { label: 'Diario' }, { label: 'Semanal o mensual' }],
          cards: [
            { icon: 'person', label: 'Sara abre y cierra sus operaciones el mismo día', bin: 0, why: 'Para el mismo día, velas de minutos u horas.' },
            { icon: 'person', label: 'Leo mantiene sus operaciones unas semanas', bin: 1, why: 'De semanas a meses, el gráfico diario.' },
            { icon: 'person', label: 'Nora revisa su plan de pensiones una vez al año', bin: 2, why: 'A muchos años, semanal o mensual.' },
            { icon: 'person', label: 'Iván hace scalping con cripto', bin: 0, why: 'Operaciones de segundos o minutos.' },
            { icon: 'person', label: 'Eva busca operaciones de uno a tres meses', bin: 1, why: 'Meses: el diario es su gráfico.' },
            { icon: 'person', label: 'Hugo invierte en un fondo indexado a 20 años', bin: 2, why: 'Las velas de minutos solo le darían sustos.' },
          ],
        },
        goal: { text: 'Coloca a las seis personas.', when: [when('done', '==', 6)] },
        insight: 'Elige la temporalidad según tu **horizonte** y mira siempre **la mayor antes que la menor**. Método de Elder: semanal para la dirección, diario para el momento y horas para afinar la entrada y el stop.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Cuánto tiempo mantiene cada uno su inversión?', mood: 'THINKING' },
          { say: 'Coloca a cada persona', mood: 'HAPPY' },
        ],
      }),
    ], [
      order('Ordena de más ruido a menos ruido.', ['5 minutos', '1 hora', 'Diario', 'Semanal', 'Mensual'], 'Cuanto más corta la temporalidad, más movimientos aleatorios sin significado.'),
      buckets('¿Qué temporalidad encaja con cada persona?', ['Minutos u horas', 'Diario', 'Semanal o mensual'], [['Ana invierte para su jubilación', 2], ['Bruno abre y cierra operaciones el mismo día', 0], ['Marta mantiene posiciones unas semanas', 1], ['Laura revisa su fondo indexado cada trimestre', 2], ['Pablo hace scalping', 0]], 'La temporalidad se elige según el horizonte: quien invierte a años no necesita mirar velas de minutos.'),
      trend('Estos cierres cubren unas ocho semanas. ¿Qué tendencia ves?', 'trend-up-2', 'Alcista', 'En esta escala, máximos y mínimos suben. Dentro de esas semanas hubo días de caída que en un gráfico de 5 minutos parecerían un drama.'),
      upDown('Gráfico diario de 30 sesiones, sin nombre ni fecha. ¿Sube o baja en las 10 siguientes?', 'ud-5', 'Diez sesiones son un horizonte corto, y en él pesa mucho el ruido. Fíjate en cuánto se movió y piensa si lo habrías aguantado.'),
      upDown('Otro activo, el mismo reto. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-43', 'Cambia el activo, no la idea: a corto plazo nadie acierta de forma fiable solo mirando velas.'),
      single('En el método de las tres pantallas, ¿para qué sirve la temporalidad mayor?', ['Para afinar la entrada', 'Para decidir la dirección', 'Para elegir el bróker'], 1, 'La mayor marca la dirección: si el semanal es alcista, solo se buscan compras. La menor afina la entrada y el stop.'),
      tf('Cuanto más corta la temporalidad, más fiables son las señales.', false, 'Al revés: en minutos domina el ruido, las señales fallan más y los costes se acumulan.'),
      scenario('En el gráfico semanal, una acción lleva un año con máximos y mínimos crecientes. En el de 5 minutos, lleva toda la mañana cayendo. Marta, que invierte a varios años, se asusta. ¿Qué le dices?', [['Que venda ya: la tendencia ha cambiado', 'Una mañana en 5 minutos no rompe una tendencia de un año: para su horizonte es ruido.'], ['Que mire la temporalidad que encaja con su horizonte', 'Bien: para años manda el semanal. La caída de la mañana puede ser parte del ruido.'], ['Que compre más para aprovechar la caída', 'Ni vender ni comprar por una mañana: decidir con el gráfico de 5 minutos es usar la herramienta equivocada.']], 1, 'Cada horizonte tiene su temporalidad. Mezclarlas lleva a decisiones impulsivas.'),
      timed(single('Rápido: un inversor a largo plazo debería mirar sobre todo…', ['Velas de 1 minuto', 'Gráficos semanales y mensuales', 'Solo las noticias del día'], 1, 'Su horizonte son años, no minutos.'), 12),
      num('Un day trader hace 5 operaciones al día y paga 2 € de comisión por cada una. ¿Cuánto paga en un mes de 20 sesiones?', 200, '€', '5 × 2 × 20 = 200 €, sin contar el spread. En temporalidades cortas, los costes se acumulan muy deprisa.'),
    ], { source: '7.3', minutes: 6, retire: [1, 6, 7, 8] }),

    lesson('u19l4', 'Escala lineal y logarítmica', [
      story('Bitcoin, una línea plana', [{ id: 'dani', name: 'Dani' }], [
        say('dani', 'He visto un gráfico de bitcoin desde 2013. Hasta 2017 es una línea plana.'),
        say('dani', '¿Antes no se movía?'),
        choose('¿Qué le dices?', [
          opt('Es la escala lineal: con precios bajos, los porcentajes enormes ocupan poco', 'good', say('lumi', 'Eso. En logarítmica, un +100 % ocupa lo mismo en 2014 que en 2024.')),
          opt('No, antes no pasaba nada', 'bad', say('lumi', 'Pasaba muchísimo, con caídas de más del 80 %. En lineal no se ve.')),
          opt('El gráfico estará mal hecho', 'ok', say('lumi', 'Está bien hecho. Lo que engaña es la escala lineal para tantos años.')),
        ]),
        say('lumi', '**Lineal:** cada centímetro vale los mismos euros.'),
        say('lumi', '**Logarítmica:** cada centímetro vale el mismo porcentaje.'),
        say('lumi', 'En logarítmica, de 10 a 20 € ocupa lo que de 100 a 200 €.'),
      ]),
      mission({
        title: 'Bitcoin, arriba y abajo',
        intro: 'Finales de 2020. Inviertes **10.000 €** en bitcoin. Datos reales, semana a semana. Fíjate en los porcentajes.',
        widget: { kind: 'crash', series: 'series-btc', amount: 10000 },
        predict: {
          prompt: 'Si algo cae un 75 %, ¿cuánto tiene que subir después para volver a donde estaba?',
          options: ['Un 75 %', 'Un 150 %', 'Un 300 %'],
          answer: 2,
          why: 'De 100 a 25 es −75 %; de 25 a 100 hay que multiplicar por 4: **+300 %**.',
        },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Bitcoin cayó un **75 %** desde su máximo de 2021 y necesitó subir un **302 %** para volver. Los porcentajes **no son simétricos**, y la escala logarítmica respeta esas proporciones; la lineal, no.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -40), say: 'Casi la mitad de lo que pusiste. ¿Cuánto haría falta para recuperarlo?', mood: 'WORRIED' },
          { when: when('drop', '>=', 80), say: '¡Casi el doble! Bitcoin se mueve mucho en los dos sentidos.', mood: 'HAPPY' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Qué escala elegirías?',
        intro: 'En gráficos largos, la escala cambia lo que ves. ¿**Logarítmica** o **da casi igual**?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Logarítmica' }, { label: 'Da casi igual' }],
          cards: [
            { icon: 'chart', label: 'El Nasdaq 100 desde 1985', bin: 0, why: 'Cuatro décadas y precios muy distintos: logarítmica.' },
            { icon: 'calendar', label: 'Una acción esta semana', bin: 1, why: 'En tramos cortos, euros y porcentajes van casi a la par.' },
            { icon: 'bitcoin', label: 'Una cripto que se ha multiplicado por 100', bin: 0, why: 'En lineal, sus primeros años parecerían una línea plana.' },
            { icon: 'exchange', label: 'El euro frente al dólar hoy', bin: 1, why: 'Un solo día: la escala apenas cambia nada.' },
            { icon: 'piggy', label: 'Un fondo durante 40 años', bin: 0, why: 'Para comparar épocas, mira porcentajes.' },
            { icon: 'clock', label: 'Una acción en el último mes', bin: 1, why: 'Movimientos pequeños: casi no hay diferencia.' },
          ],
        },
        goal: { text: 'Clasifica los seis gráficos.', when: [when('done', '==', 6)] },
        insight: 'Para periodos largos o activos que se han multiplicado mucho, **logarítmica**. En tramos cortos, euros y porcentajes van casi a la par.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Son años y precios muy distintos, o unos pocos días?', mood: 'THINKING' },
          { say: '¿Logarítmica o da igual?', mood: 'HAPPY' },
        ],
      }),
    ], [
      single('Una acción ha pasado de 1 € a 300 € en 15 años. ¿Qué escala usas para estudiar su historia?', ['Lineal', 'Logarítmica', 'Da igual'], 1, 'En lineal, los primeros años parecerían una línea plana aunque hubiera subidas del 100 %. La logarítmica muestra bien los porcentajes.'),
      tf('En escala lineal, subir de 10 a 20 € ocupa lo mismo que subir de 100 a 200 €.', false, 'Eso pasa en la logarítmica. En lineal, de 100 a 200 € ocupa diez veces más que de 10 a 20 €.'),
      num('Una acción pasa de 20 € a 30 €. ¿Qué porcentaje ha subido?', 50, '%', '(30 − 20) ÷ 20 = 0,5 → +50 %.'),
      num('Otra acción pasa de 200 € a 210 €. ¿Qué porcentaje ha subido?', 5, '%', '10 € sobre 200 € = +5 %. En lineal, este salto de 10 € ocupa lo mismo que el de 20 a 30 €; en logarítmica, se ve diez veces más pequeño.'),
      buckets('¿Qué escala elegirías?', ['Logarítmica', 'Da casi igual'], [['Bitcoin desde 2013', 0], ['El S&P 500 desde 1950', 0], ['Una acción en las últimas 3 semanas', 1], ['Un índice durante una sola sesión', 1], ['Una tecnológica que se ha multiplicado por 50', 0]], 'Para periodos largos o activos que se han multiplicado mucho, logarítmica. En tramos cortos, euros y porcentajes van casi a la par.'),
      tf('Si un activo cae un 50 %, necesita subir un 100 % para volver al punto de partida.', true, 'De 100 a 50 es −50 %; de 50 a 100 es +100 %. Por eso hay que pensar en porcentajes, no en euros.'),
      upDown('S&P 500, finales de septiembre de 1929: los cierres semanales llevan casi dos años subiendo. ¿Qué crees que pasó después?', 'hist-crash-1929', 'Con movimientos tan grandes, la escala decide lo que ves: en un gráfico lineal de cien años, cualquier tramo antiguo parece una línea plana. Para comparar épocas, mira porcentajes.', 'los tres años siguientes'),
      fill('En escala logarítmica, la misma distancia vertical representa el mismo ____.', 'porcentaje', ['número de euros', 'volumen', 'número de días'], 'Por eso compara bien épocas con precios muy distintos.'),
      timed(tf('Para mirar unas pocas semanas, la escala apenas cambia el gráfico.', true, 'En tramos cortos los movimientos son pequeños y euros y porcentajes van casi a la par.'), 10),
      chat(['He visto un gráfico de bitcoin desde 2013 👀', 'Hasta 2017 es una línea plana y luego todo pasa al final.', '¿Antes no se movía?'], '¿Qué le contestas?', [['No, antes no pasaba nada', 'Pasaba muchísimo, con caídas de más del 80 %. En lineal, como los precios eran bajos, no se ve.'], ['Es la escala lineal: con precios bajos, movimientos enormes en porcentaje ocupan poco. En logarítmica se verían', '¡Eso! En logarítmica, un +100 % ocupa lo mismo en 2014 que en 2024.'], ['Es que el gráfico está mal hecho', 'El gráfico está bien; lo que engaña es usar escala lineal para tantos años.']], 1, 'En periodos largos, la escala lineal esconde los movimientos antiguos. La logarítmica los pone en su sitio.'),
    ], { source: '7.4', minutes: 6, retire: [4, 5, 8, 9] }),

    lesson('u19l5', 'Tendencias: máximos y mínimos', [
      story('¿Sigue subiendo?', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Mi acción subía: máximo en 40 €, bajó a 36 € y rebotó a 39 €.'),
        say('leo', 'Ahora ha caído a 35 €. ¿Sigue la tendencia alcista?'),
        choose('¿Qué le dices?', [
          opt('Se ha puesto en duda: máximo y mínimo más bajos', 'good', say('lumi', 'Exacto. No superó los 40 € y perdió los 36 €.')),
          opt('Sí, solo es una corrección normal', 'ok', say('lumi', 'Corregir un 5-10 % es normal. Pero aquí se ha roto la estructura.')),
          opt('Va a caer seguro un 50 %', 'bad', say('lumi', 'Romper la estructura no dice cuánto caerá. Puede pasar a lateral.')),
        ]),
        say('lumi', '**Alcista:** máximos y mínimos cada vez más altos. **Bajista:** cada vez más bajos.'),
        say('lumi', 'Lo formuló Charles Dow a finales del siglo XIX.'),
      ]),
      play({
        title: 'Máximos y mínimos',
        intro: 'Te damos los tres últimos máximos y mínimos de cada gráfico. ¿Qué tendencia es?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Alcista' }, { label: 'Bajista' }, { label: 'Lateral' }],
          cards: [
            { icon: 'chart', label: 'Máximos 30, 33, 37 · mínimos 27, 30, 34', bin: 0, why: 'Suben los máximos y los mínimos.' },
            { icon: 'chart', label: 'Máximos 90, 85, 80 · mínimos 84, 79, 73', bin: 1, why: 'Bajan los dos.' },
            { icon: 'chart', label: 'Máximos 50, 51, 50 · mínimos 45, 44, 45', bin: 2, why: 'Se repiten: techo y suelo sin dirección.' },
            { icon: 'chart', label: 'Máximos 15, 17, 19 · mínimos 13, 14, 16', bin: 0, why: 'Cada caída se queda más arriba que la anterior.' },
            { icon: 'chart', label: 'Máximos 64, 60, 57 · mínimos 58, 55, 51', bin: 1, why: 'Los rebotes no llegan al máximo anterior.' },
            { icon: 'chart', label: 'Máximos 120, 119, 121 · mínimos 110, 111, 110', bin: 2, why: 'Rebota entre un techo y un suelo.' },
          ],
        },
        goal: { text: 'Clasifica las seis secuencias.', when: [when('done', '==', 6)] },
        insight: 'Si suben máximos y mínimos, **alcista**; si bajan los dos, **bajista**; si se repiten, **lateral**. Corregir un 5-10 % es normal dentro de una subida sana.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Mira primero los mínimos: ¿suben, bajan o se repiten?', mood: 'THINKING' },
          { say: 'Clasifica cada secuencia', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Sigue la tendencia?',
        intro: 'Cuatro gráficos reales con una dirección clara. ¿Sube o baja en las 10 sesiones siguientes? ¿**Sigue** la tendencia o **gira**?',
        widget: { kind: 'guess', rounds: ['ud-77', 'ud-69', 'ud-55', 'ud-73'] },
        goal: { text: 'Juega las cuatro rondas.', when: [when('done', '==', 4)] },
        insight: 'En estas cuatro rondas, la tendencia siguió en tres y giró en una. El **momentum** existe en los datos, pero es una probabilidad, no una promesa.',
        lumi: [
          { when: when('right', '>=', 3), say: 'Seguir la tendencia ha funcionado aquí. No siempre lo hace.', mood: 'HAPPY' },
          { when: when('done', '==', 4), say: 'Una tendencia puede girar sin avisar.', mood: 'THINKING' },
          { say: 'Mira hacia dónde van las velas y decide', mood: 'HAPPY' },
        ],
      }),
      key('El momentum existe', 'Las tendencias de 3–12 meses han tendido a persistir en acciones, bonos, divisas y materias primas (Jegadeesh y Titman, 1993; Moskowitz, Ooi y Pedersen, 2012). Aprovecharlo tras costes y giros bruscos es otra historia.', 'Alcista = máximos y mínimos más altos; bajista = más bajos.', 'La tendencia es tu amiga… hasta que deja de hacer máximos más altos.'),
    ], [
      trend('¿Qué tendencia tiene este gráfico?', 'trend-up-3', 'Alcista', 'Cada caída se queda por encima de la anterior y cada subida supera el máximo previo.'),
      trend('¿Y este?', 'trend-down-3', 'Bajista', 'Los rebotes no llegan a los máximos anteriores y los mínimos son cada vez más bajos.'),
      trend('¿Y este otro?', 'trend-flat-1', 'Lateral', 'El precio sube y baja entre un techo y un suelo; al final está casi donde empezó.'),
      point('En esta tendencia lateral, toca el suelo del rango: el cierre más bajo', 'trend-flat-1', 'min', 'Ahí aparecieron compradores. Si el precio vuelve a esa zona, mucha gente la estará vigilando.'),
      single('Máximos en 50, 54 y 58 €; mínimos en 45, 48 y 52 €. ¿Qué tendencia es?', ['Alcista', 'Bajista', 'Lateral'], 0, 'Máximos y mínimos crecientes: es la definición de tendencia alcista.'),
      buckets('Clasifica cada secuencia de máximos y mínimos.', ['Alcista', 'Bajista', 'Lateral'], [['Máximos 20, 22, 25 · mínimos 18, 19, 21', 0], ['Máximos 80, 76, 71 · mínimos 74, 70, 65', 1], ['Máximos 40, 40, 41 · mínimos 35, 36, 35', 2], ['Máximos 100, 104, 109 · mínimos 95, 99, 102', 0], ['Máximos 12, 11, 10 · mínimos 10, 9, 8', 1]], 'Si suben los dos, alcista; si bajan los dos, bajista; si se repiten, lateral.'),
      scenario('Una acción sube durante meses. Marca un máximo en 60 €, cae a 54 €, rebota solo hasta 58 € y después cae a 52 €. ¿Qué ha pasado?', [['Nada: sigue la tendencia alcista', 'No supera el máximo (58 < 60) y pierde el mínimo (52 < 54): la estructura alcista se ha roto.'], ['La tendencia alcista se ha puesto en duda', 'Exacto: máximo más bajo y mínimo más bajo. No dice cuánto caerá, pero ya no es una subida limpia.'], ['Va a caer seguro un 50 %', 'Que se rompa la estructura no dice cuánto caerá: puede pasar a lateral.']], 1, 'Según la teoría de Dow, una tendencia alcista se pone en duda cuando no supera el último máximo y pierde el último mínimo.'),
      upDown('Fíjate en la estructura de estas 30 velas diarias. ¿Sube o baja en las 10 siguientes?', 'ud-53', 'El momentum es una tendencia estadística sobre meses, no una promesa para la semana que viene. La estructura te ayuda a saber dónde te equivocas.'),
      timed(tf('Una corrección del 7 % dentro de una tendencia alcista significa que la tendencia ha terminado.', false, 'Las correcciones del 5–10 % son normales en subidas sanas. Lo que importa es si se rompe la estructura de máximos y mínimos.'), 12),
      single('¿Qué idea del análisis técnico tiene más respaldo académico?', ['Que las tendencias de 3–12 meses tienden a persistir (momentum)', 'Que los niveles de Fibonacci predicen los giros', 'Que cada vela verde anuncia otra'], 0, 'El momentum aparece en acciones, bonos, divisas y materias primas, con datos de más de un siglo. Aun así, es difícil de aprovechar tras costes.'),
    ], { source: '7.5', minutes: 6, retire: [5, 8, 9] }),

    lesson('u19l6', 'El volumen', [
      story('Rotura con poca gente', [{ id: 'sara', name: 'Sara' }], [
        say('sara', '¡Mi acción acaba de superar su máximo del año! Compro ya.'),
        say('lumi', '¿Y el volumen de hoy?'),
        say('sara', 'La mitad de lo normal. ¿Importa?'),
        choose('¿Qué le dices?', [
          opt('Sí: espera a ver si cierra arriba con volumen', 'good', say('lumi', 'Bien. Con volumen alto, la rotura es mucho más creíble.')),
          opt('No: rotura es rotura', 'bad', say('lumi', 'Sin volumen, poca gente la respalda. Es la típica **falsa rotura**.')),
          opt('Vende: el volumen bajo garantiza una caída', 'ok', say('lumi', 'Pone en duda la rotura, pero no garantiza nada.')),
        ]),
        say('lumi', 'El **volumen** es lo que cambia de manos en cada periodo: las barras de abajo.'),
        say('lumi', 'El precio te dice qué pasa. El volumen, cuánta gente se lo cree.'),
      ]),
      play({
        title: '¿Confirma o pone en duda?',
        intro: 'El mismo movimiento de precio, con distinto volumen. ¿El volumen lo **confirma** o lo **pone en duda**?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Lo confirma' }, { label: 'Lo pone en duda' }],
          cards: [
            { icon: 'up', label: 'Sube con el triple de volumen que la media', bin: 0, why: 'Mucha gente detrás de la subida: convicción.' },
            { icon: 'flag', label: 'Supera una resistencia con un volumen bajísimo', bin: 1, why: 'Poca gente detrás: riesgo de falsa rotura.' },
            { icon: 'gauge', label: 'Cada día sube, pero con menos volumen', bin: 1, why: 'Posible agotamiento: cada vez se apunta menos gente.' },
            { icon: 'down', label: 'Pierde un soporte con un volumen enorme', bin: 0, why: 'La rotura tiene mucha gente detrás: más fiable.' },
            { icon: 'mountain', label: 'Marca un máximo con un volumen muy superior a la media', bin: 0, why: 'Volumen alto en la rotura: más creíble.' },
          ],
        },
        goal: { text: 'Clasifica los cinco movimientos.', when: [when('done', '==', 5)] },
        insight: 'Un movimiento con mucho volumen tiene a **mucha gente detrás**. Sin volumen puede ser una ilusión, como una **falsa rotura**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Hay mucha gente detrás del movimiento, o poca?', mood: 'THINKING' },
          { say: '¿Confirma o pone en duda?', mood: 'HAPPY' },
        ],
      }),
      key('Picos y límites', '• Sube con volumen alto: convicción. Baja con volumen bajo: corrección tranquila.\n• Los picos de volumen llegan con noticias, vencimientos, pánico o euforia; tras una caída fuerte, a veces marcan la **capitulación**.\n• En divisas no hay volumen centralizado y en cripto se reparte entre muchas plataformas.', 'Un movimiento con mucho volumen tiene a mucha gente detrás; sin volumen puede ser una ilusión.', 'El precio te dice qué pasa. El volumen, cuánta gente se lo cree.'),
    ], [
      buckets('¿El volumen confirma el movimiento o lo pone en duda?', ['Lo confirma', 'Lo pone en duda'], [['Sube con volumen muy superior a la media', 0], ['Rompe una resistencia con un volumen bajísimo', 1], ['Sube con volumen cada vez menor', 1], ['Rompe un soporte con un volumen enorme', 0]], 'Volumen alto = mucha gente detrás del movimiento. Volumen bajo o decreciente = poca convicción.'),
      single('El precio rompe una resistencia con un volumen muy inferior a la media. ¿Qué riesgo hay?', ['Ninguno', 'Que sea una falsa rotura', 'Que suspendan la cotización'], 1, 'Sin volumen, la rotura tiene poca gente detrás y es más fácil que el precio vuelva dentro.'),
      match('Empareja cada situación con su lectura habitual.', [['Sube con volumen alto', 'Subida con convicción'], ['Baja con volumen bajo', 'Corrección tranquila'], ['Pico enorme tras una caída fuerte', 'Posible capitulación'], ['Sube con volumen decreciente', 'Posible agotamiento']], 'Son lecturas habituales, no reglas exactas: el volumen da contexto, no certezas.'),
      candle('Toca la vela de más convicción: cuerpo grande y casi sin mechas.', 'marubozu-3', 'Abrió casi en el mínimo y cerró casi en el máximo. Si además llegara con volumen alto, la señal de fuerza sería más creíble.'),
      tf('En divisas, el volumen que muestran muchos gráficos es un dato parcial.', true, 'El mercado de divisas no tiene una bolsa central: cada proveedor ve solo una parte de lo negociado.'),
      upDown('Sin ver el volumen solo tienes media historia. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-32', 'Aunque vieras el volumen, una sola pista no basta para adivinar el corto plazo. El volumen sirve para valorar si un movimiento tiene gente detrás.'),
      scenario('Bruno ve que una acción supera su máximo del año, pero el volumen de ese día es la mitad de lo normal. Quiere comprar ya. ¿Qué sería lo más prudente según lo aprendido?', [['Comprar todo lo que pueda: rotura es rotura', 'Sin volumen, la rotura tiene poca gente detrás: es el caso típico de falsa rotura.'], ['Esperar a ver si cierra por encima con volumen', 'Bien: un cierre claro al otro lado con volumen superior a la media hace la rotura más creíble.'], ['Vender, porque el volumen bajo garantiza una caída', 'El volumen bajo pone en duda la rotura, pero no garantiza nada en ningún sentido.']], 1, 'Una rotura con poco volumen es sospechosa. Esperar confirmación reduce las falsas roturas.'),
      timed(single('Rápido: un pico de volumen enorme tras una caída fuerte puede indicar…', ['Capitulación', 'Cruce dorado', 'Que el mercado está cerrado'], 0, 'Los últimos vendedores se rinden. No siempre: puede haber varios picos.'), 10),
      fill('Un movimiento con mucho volumen tiene a mucha gente detrás; uno sin volumen puede ser una ____.', 'ilusión', ['garantía', 'tendencia', 'divergencia'], 'El volumen mide cuánta gente respalda un movimiento.'),
      multi('¿En qué casos el dato de volumen es menos fiable? Marca todos.', ['Divisas, sin bolsa central', 'Criptomonedas, repartidas entre muchas plataformas', 'Índices, según cómo lo calcule cada proveedor', 'Ninguno: el volumen siempre es exacto'], [0, 1, 2], 'En divisas no hay volumen centralizado, en cripto se reparte y parte puede ser artificial, y en índices depende del proveedor.'),
    ], { source: '7.6', minutes: 6, retire: [0, 4, 6, 7] }),
  ],
})
