import 'server-only'
// Sección 8 · Unidad 24 · Gestión del riesgo (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/10 (10.1–10.5) y docs/curso/03 (3.3); clases antiguas course/u10.ts y u03.ts.
import { buckets, chat, choose, fill, key, lesson, level, match, mission, multi, note, num, opt, order, play, point, say, scenario, simTrade, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u24', order: 24, title: 'Gestión del riesgo', description: 'Cuánto arriesgar, dónde poner el stop y cómo saber si un sistema gana',
  lessons: [
    lesson('u24l1', 'Por qué el riesgo importa más que acertar', [
      play({
        title: 'Diez fallos seguidos',
        intro: 'Tienes **10.000 €**, e incluso con un buen sistema a veces llegan **10 pérdidas seguidas**. ¿Cuánto arriesgas en cada operación?',
        widget: { kind: 'position', account: 10000, riskPct: 10, stopPct: 5, entry: 50, maxRisk: 10, maxStop: 15 },
        predict: {
          prompt: 'Arriesgas un 10 % en cada una y pierdes 10 seguidas. ¿Qué te queda?',
          options: ['Nada: 10 × 10 % = 100 %', 'Algo más de un tercio', 'Casi todo'],
          answer: 1,
          why: 'Cada pérdida se aplica a lo que queda: te quedan **3.487 €**, un 34,9 %. Para volver necesitarías ganar un **187 %**.',
        },
        goal: { text: 'Encuentra el riesgo que te deja al menos 9.000 € tras 10 fallos.', when: [when('after10', '>=', 9000)] },
        insight: 'Con un **1 %**, diez pérdidas son un mal mes (te queda el 90,4 %); con un 10 %, son el final. **Lo que controlas es cuánto arriesgas**, no si aciertas.',
        lumi: [
          { when: when('after10', '>=', 9000), say: 'Así sí: diez fallos seguidos y sigues en el juego.', mood: 'CELEBRATE' },
          { when: when('riskPct', '>=', 5), say: 'Con este riesgo, una racha normal se lleva buena parte de la cuenta.', mood: 'WORRIED' },
          { when: when('riskPct', '>', 1), say: 'Mejor, pero una mala racha aún duele mucho.', mood: 'THINKING' },
          { say: 'Baja el riesgo por operación y mira la cuenta', mood: 'HAPPY' },
        ],
      }),
      story('Acertar mucho no basta', [{ id: 'pablo', name: 'Pablo' }, { id: 'laura', name: 'Laura' }], [
        say('pablo', 'Yo acierto el 60 % de mis operaciones.'),
        say('laura', 'Pues yo solo el 40 %.'),
        note('Pablo gana 50 € cuando acierta y pierde 150 € cuando falla. Laura gana 300 € y pierde 100 €.'),
        choose('Tras 10 operaciones, ¿quién va mejor?', [
          opt('Pablo: acierta más', 'bad', say('lumi', 'Pablo: 6 × 50 − 4 × 150 = **−300 €**. Acertar mucho no le salva.')),
          opt('Laura: sus aciertos valen más que sus fallos', 'good', say('lumi', 'Laura: 4 × 300 − 6 × 100 = **+600 €**. Falla más, pero pierde poco.')),
          opt('Empatan', 'ok', say('lumi', 'No: importa cuánto ganas y pierdes en cada una, no solo cuántas.')),
        ]),
        say('lumi', 'No controlas si aciertas. Controlas **cuánto pierdes** cuando fallas.'),
      ]),
      key('La pregunta del profesional', 'El principiante pregunta «¿qué compro?» y «¿va a subir?». El profesional pregunta: **«¿cuánto pierdo si me equivoco?»**.\n\nNadie sabe si una operación concreta saldrá bien. Puedes acertar el 60 % de las veces y arruinarte, o acertar el 40 % y ganar dinero: la diferencia está en cuánto ganas cuando aciertas y cuánto pierdes cuando fallas.', 'El primer objetivo de un trader es sobrevivir para que su ventaja, si la tiene, pueda actuar.', 'Pruébalo: en tu próxima compra del simulador, arriesga como mucho un 1 %.'),
    ], [
      single('¿Qué es lo único que controlas al 100 % en cada operación?', ['Si el precio subirá después de comprar', 'Cuánto arriesgas si te equivocas', 'Lo que harán los demás inversores'], 1, 'El resultado de una operación concreta nadie lo sabe. El riesgo que asumes lo decides tú antes de entrar.'),
      upDown('Primera prueba de humildad: mira este gráfico real. ¿Qué hizo el precio en las sesiones siguientes?', 'ud-3', 'Mirar el gráfico no basta para saberlo con seguridad. Por eso los profesionales deciden antes cuánto pierden si fallan.'),
      upDown('Gráfico real, sin nombre ni fecha. ¿Sube o baja después?', 'ud-29', 'Acertar o fallar una predicción suelta dice poco. Lo que decide tu resultado a largo plazo es cuánto arriesgas en cada intento.'),
      match('Empareja el riesgo por operación con lo que te queda tras 10 pérdidas seguidas.', [['1 % por operación', 'Te queda el 90,4 %'], ['2 % por operación', 'Te queda el 81,7 %'], ['5 % por operación', 'Te queda el 59,9 %'], ['10 % por operación', 'Te queda el 34,9 %']], 'Cada pérdida se aplica sobre lo que queda: 0,99¹⁰ ≈ 90,4 % y 0,9¹⁰ ≈ 34,9 %.'),
      num('Arriesgas un 2 % por operación y encadenas 10 pérdidas. ¿Qué porcentaje de la cuenta te queda? (redondea a un decimal)', 81.7, '%', '0,98¹⁰ ≈ 0,817 → te queda el 81,7 %. Para volver necesitarías ganar un 22,4 %.'),
      scenario('Pablo acierta el 60 % de sus operaciones, pero gana 50 € cuando acierta y pierde 150 € cuando falla. Laura acierta solo el 40 %, pero gana 300 € y pierde 100 €. Tras 10 operaciones, ¿quién va mejor?', [['Pablo, porque acierta más', 'Pablo: 6 × 50 − 4 × 150 = −300 €. Acertar mucho no le salva.'], ['Laura, porque sus aciertos valen más que sus fallos', 'Laura: 4 × 300 − 6 × 100 = +600 €. Falla más, pero sus fallos son pequeños.'], ['Empatan, los dos aciertan la mitad de media', 'No: lo que importa es el tamaño de cada acierto y de cada fallo, no solo cuántos.']], 1, 'El resultado depende del porcentaje de acierto y también de cuánto ganas y pierdes en cada caso.'),
      tf('Se puede ganar dinero acertando menos de la mitad de las operaciones.', true, 'Si cuando aciertas ganas bastante más de lo que pierdes cuando fallas, sí. Lo verás con la esperanza matemática.'),
      buckets('¿Lo controlas tú o no?', ['Lo controlo yo', 'No lo controlo'], [['Cuánto arriesgo en la operación', 0], ['Si la empresa da buenos resultados', 1], ['Dónde pongo el stop', 0], ['Lo que hará el mercado mañana', 1], ['Cuántas operaciones hago', 0]], 'Céntrate en lo que depende de ti: riesgo, stop y número de operaciones.'),
      timed(single('Rápido: arriesgas un 10 % por operación y pierdes 10 seguidas. ¿Cuánto te queda?', ['Un 90 %', 'Unos dos tercios', 'Alrededor de un 35 %'], 2, '0,9¹⁰ ≈ 34,9 %: necesitarías ganar un 187 % para volver.'), 15),
      chat(['Tengo un método que acierta muchísimo 😎', 'Por eso meto un 20 % de la cuenta en cada operación.'], '¿Qué le contestas a Lumi?', [['Si aciertas mucho, perfecto', 'Hasta que llegue la racha mala: con un 20 % por operación, cuatro fallos seguidos te dejan con un 41 %.'], ['Lo importante es cuánto pierdes cuando fallas', '¡Eso! Ningún método acierta siempre, y con tanto riesgo una racha normal me saca del juego.'], ['Mejor un 50 %, así recuperas antes', 'Eso acelera la ruina: dos fallos y te queda un 25 %.']], 1, 'Sobrevivir a las rachas malas es lo primero: el riesgo por operación tiene que ser pequeño.'),
      scenario('Empiezas con 10.000 € en el simulador. Sabes que incluso un buen sistema encadena a veces 10 pérdidas seguidas. ¿Cuánto arriesgas en cada operación?', [['Un 10 %: así gano rápido', 'Con un 10 %, diez fallos seguidos te dejan con 3.487 €, y necesitarías ganar un 187 % para volver.'], ['Un 1 %: diez fallos serían un mal mes, no el final', 'Eso: con un 1 %, tras diez fallos te queda el 90,4 % de la cuenta.'], ['Depende de lo seguro que esté de cada operación', 'Nadie sabe qué operación saldrá bien: sentirte seguro no cambia el riesgo.']], 1, 'El riesgo por operación tiene que ser pequeño para sobrevivir a las rachas malas, que llegan incluso con un buen sistema.'),
      buckets('Encadenas diez pérdidas seguidas. ¿Sigues en el juego o te deja muy tocado?', ['Sigues en el juego', 'Te deja muy tocado'], [['Arriesgar un 1 % por operación', 0], ['Arriesgar un 2 % por operación', 0], ['Arriesgar un 10 % por operación', 1], ['Arriesgar un 20 % por operación', 1]], 'Con un 1 % te queda el 90,4 % de la cuenta; con un 2 %, el 81,7 %. Con un 10 %, solo el 34,9 %, y con un 20 % bastan cuatro fallos para quedarte con un 41 %.'),
    ], { source: '10.1', minutes: 6, retire: [3, 4, 5, 6, 8, 9, 10] }),

    lesson('u24l2', 'Las matemáticas de las pérdidas', [
      // Auditoría RED-12 y RED-34: cada episodio histórico se vive en una sola clase. Aquí va otra serie real (Yahoo Finance);
      // las cifras del texto están calculadas sobre `charts.json`.
      mission({
        title: 'Vive una caída del 76 %',
        intro: 'Datos reales: las acciones de Meta (Facebook) semana a semana desde mayo de 2021. Inviertes **10.000 €** y puedes vender cuando quieras.',
        widget: { kind: 'crash', series: 'series-meta', amount: 10000 },
        predict: {
          prompt: 'Si tu inversión cae a la mitad, ¿cuánto tiene que subir después para volver?',
          options: ['Un 50 %', 'Un 100 %: tiene que duplicarse', 'Un 25 %'],
          answer: 1,
          why: 'De 10.000 € a 5.000 €: para volver a 10.000 € tienes que **duplicar**. Pierdes la mitad y necesitas ganar el doble.',
        },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Del máximo de septiembre de 2021 al mínimo de octubre de 2022, la acción cayó un **76 %**: para volver hacía falta subir un **317 %**. Esta vez lo consiguió, en enero de 2024; no siempre pasa.',
        lumi: [
          { when: when('played', '==', 1), say: 'Fin. ¿Ves por qué evitar las grandes caídas importa tanto?', mood: 'CALM' },
          { when: when('drop', '<=', -50), say: 'Con un −50 %, volver a tus 10.000 € exige un +100 %.', mood: 'WORRIED' },
          { when: when('drop', '<=', -20), say: 'Un −20 %: para volver ya necesitas un +25 %.', mood: 'WORRIED' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      story('Subir 30 y bajar 30', [{ id: 'ana', name: 'Ana' }, { id: 'bruno', name: 'Bruno' }], [
        say('ana', 'Mi fondo subió un 30 % y luego cayó un 30 %. Me quedo igual, ¿no?'),
        say('bruno', 'El mío subió un 10 % y cayó un 5 %. Menos emocionante.'),
        choose('¿Quién acaba mejor?', [
          opt('Ana: subió más', 'bad', say('lumi', 'Ana: 1,3 × 0,7 = 0,91. **Pierde un 9 %** pese a la gran subida.')),
          opt('Bruno: cayó menos', 'good', say('lumi', 'Bruno: 1,1 × 0,95 = 1,045. **Gana un 4,5 %**: las caídas pequeñas se recuperan.')),
          opt('Quedan igual', 'ok', say('lumi', 'No: con porcentajes, las caídas pesan más que las subidas del mismo tamaño.')),
        ]),
        say('ana', 'Vaya. Entonces lo importante es no caer mucho.'),
        say('lumi', 'Eso es: evitar las grandes caídas suele valer más que buscar grandes subidas.'),
      ]),
      key('Lo que cuesta volver', '**Subida necesaria = 1 ÷ (1 − caída) − 1**\n\n• Pierdes 10 % → necesitas +11,1 %\n• Pierdes 20 % → +25 %\n• Pierdes 30 % → +42,9 %\n• Pierdes 50 % → **+100 %**\n• Pierdes 75 % → +300 %\n• Pierdes 90 % → **+900 %**\n\nY la media engaña: +50 % y −50 % es 100 € → 150 € → 75 €. Con apalancamiento 1:5, una caída del 20 % del activo se lleva todo tu dinero.', 'Evitar las grandes pérdidas es más importante que buscar grandes ganancias.', 'Pon un stop en tu próxima compra del simulador: así cortas las caídas grandes.'),
    ], [
      num('Tu cartera cae un 20 %. ¿Cuánto tiene que subir para volver al punto de partida?', 25, '%', '1 ÷ (1 − 0,20) − 1 = 1 ÷ 0,8 − 1 = 0,25 → +25 %.'),
      timed(tf('Si pierdes un 50 %, te basta con ganar un 50 % para recuperarte.', false, 'Necesitas un 100 %: de 100 € pasas a 50 €, y para volver a 100 € tienes que duplicar.'), 10),
      num('Una acción cae un 40 %. ¿Qué subida necesita para recuperar su precio? (redondea a un decimal)', 66.7, '%', '1 ÷ 0,6 − 1 ≈ 0,667 → +66,7 %.'),
      match('Empareja cada caída con la subida que hace falta para recuperarla.', [['Caída del 10 %', '+11,1 %'], ['Caída del 20 %', '+25 %'], ['Caída del 50 %', '+100 %'], ['Caída del 90 %', '+900 %']], 'Cuanto mayor es la caída, más se dispara la subida necesaria.'),
      num('Inviertes 1.000 €. El primer año ganas un 50 % y el segundo pierdes un 50 %. ¿Cuánto tienes?', 750, '€', '1.000 × 1,5 = 1.500 €; 1.500 × 0,5 = 750 €. La «media del 0 %» esconde una pérdida del 25 %.'),
      order('Ordena estas caídas de menor a mayor esfuerzo para recuperarse.', ['Caer un 10 %', 'Caer un 30 %', 'Caer un 50 %', 'Caer un 75 %'], 'Necesitan +11,1 %, +42,9 %, +100 % y +300 %.'),
      scenario('El fondo de Ana sube un 30 % y luego cae un 30 %. El de Bruno sube un 10 % y luego cae un 5 %. ¿Quién acaba mejor?', [['Ana, porque subió más', 'Ana: 1,3 × 0,7 = 0,91 → pierde un 9 % pese a la gran subida.'], ['Bruno, porque cayó menos', 'Bruno: 1,1 × 0,95 = 1,045 → gana un 4,5 %. Las caídas pequeñas se recuperan fácil.'], ['Los dos quedan igual', 'No: con porcentajes, las caídas pesan más que las subidas del mismo tamaño.']], 1, 'Evitar caídas grandes suele valer más que buscar subidas grandes.'),
      upDown('Marzo de 2000: el Nasdaq 100 lleva años subiendo sin parar. ¿Qué hizo después?', 'hist-dotcom', 'Tras una caída de cerca del 83 %, un índice necesita subir casi un 490 % para volver: el Nasdaq tardó unos 15 años en recuperar aquel máximo.', 'los dos años y medio siguientes'),
      fill('Con apalancamiento 1:5, una caída del ____ del activo se lleva todo tu dinero.', '20 %', ['5 %', '50 %', '80 %'], '5 × 20 % = 100 %: el apalancamiento acelera las pérdidas grandes.'),
      timed(single('Rápido: pierdes un 75 %. ¿Cuánto tienes que ganar para recuperarte?', ['+75 %', '+150 %', '+300 %'], 2, '1 ÷ 0,25 − 1 = 3 → +300 %.'), 15),
      scenario('Tu cartera del simulador ha caído un 30 %. Para recuperarte antes, piensas duplicar el riesgo en las próximas operaciones. ¿Qué haces?', [['Duplico el riesgo: hay que volver cuanto antes', 'Si sale mal, la caída se hace más grande, y cuanto más caes, mucho más tienes que subir para volver.'], ['Mantengo el riesgo pequeño', 'Eso: ya necesitas un +42,9 % para volver; si llegaras a un −50 %, haría falta un +100 %.'], ['Lo vendo todo y no vuelvo a invertir', 'Abandonar convierte la caída en definitiva. Lo sensato es seguir con un riesgo pequeño.']], 1, 'Las pérdidas grandes se recuperan muy despacio. Tras una caída, lo prudente no es arriesgar más, sino seguir con un riesgo pequeño.'),
      chat(['Mi cartera prudente cae menos en las crisis, pero también sube menos.', '¿No sería mejor arriesgar más? Ya recuperaré lo que caiga.'], 'Lumi cree que sería mejor arriesgar más porque «ya recuperará lo que caiga». ¿Qué le dices?', [['Sí: lo que cae se recupera con una subida igual', 'Eso creía… pero tras un −50 % haría falta un +100 % para volver.'], ['Ojo: cuanto más cae, más cuesta volver', 'Vale: evitar las grandes caídas puede valer más que buscar grandes subidas.'], ['Mejor no invertir nunca', 'Tampoco: se trata de no caer tanto, no de quedarse fuera.']], 1, 'Una caída del 50 % exige una subida del 100 %. Por eso caer menos suele valer más que subir más.'),
    ], { source: '3.3', minutes: 6, retire: [0, 1, 2, 6, 7, 9] }),

    lesson('u24l4', 'El tamaño de la posición', [
      story('El stop de Marta', [{ id: 'marta', name: 'Marta' }], [
        note('Marta tiene 10.000 €. Quiere comprar a 20 €, y el mínimo reciente está en 18,50 €.'),
        say('marta', 'Si pongo el stop en 19,90 €, ¡puedo comprar 1.000 acciones!'),
        choose('¿Qué le dices?', [
          opt('Genial: mucho tamaño con poco riesgo', 'bad', say('lumi', 'El ruido de un día mueve más de 10 céntimos: saltará sin motivo.')),
          opt('Que ponga el stop bajo los 18,50 € y calcule el tamaño con esa distancia', 'good', say('lumi', '¡Eso! Con algo más de 1,50 € de distancia: unas 60 acciones.')),
          opt('Que compre las 1.000 sin stop', 'bad', say('lumi', 'Son 20.000 € con una cuenta de 10.000 €, y sin límite de pérdida.')),
        ]),
        say('lumi', 'El stop lo marca el gráfico; el tamaño se adapta a él, **nunca al revés**.'),
      ]),
      play({
        title: 'El tamaño sale solo',
        intro: 'Cuenta de **10.000 €** y la regla del **1 %** que ya conoces: 100 € de riesgo. Compras a **50 €** y el stop está un 6 % por debajo, en **47 €**.',
        widget: { kind: 'position', account: 10000, riskPct: 1, stopPct: 6, entry: 50, maxRisk: 3, maxStop: 15 },
        predict: {
          prompt: '¿Cuántas acciones puedes comprar?',
          options: ['Todas las que quepan en tus 10.000 €', 'Las justas para perder 100 € si salta el stop', 'Una por cada euro de riesgo: 100'],
          answer: 1,
          why: 'Arriesgas 3 € por acción: la pieza calcula **33 acciones**, unos 1.650 €. Si salta el stop, pierdes 99 €.',
        },
        goal: { text: 'Aleja el stop al 10 % sin cambiar el riesgo. ¿Cuántas acciones ahora?', when: [when('stopPct', '==', 10), when('riskEur', '==', 100)] },
        insight: 'Con el stop al 10 % compras solo **20 acciones**: el activo más volátil necesita un stop más lejano y, por tanto, **menos acciones**. El riesgo sigue en 100 €.',
        lumi: [
          { when: when('riskPct', '>', 1), say: 'El riesgo se queda en el 1 %: mueve solo el stop.', mood: 'THINKING' },
          { when: when('stopPct', '>=', 10), say: 'Stop más lejos, menos acciones. El riesgo, igual.', mood: 'HAPPY' },
          { when: when('stopPct', '<', 6), say: 'Stop más cerca, más acciones… y más fácil que salte con el ruido.', mood: 'THINKING' },
          { say: 'Mira cuántas acciones compras y luego aleja el stop', mood: 'HAPPY' },
        ],
      }),
      key('Lo que te llevas', 'Con un stop a 1 € podrías comprar 100 acciones; con uno a 10 €, solo 10. Las dos operaciones arriesgan 100 €. Así cada operación pesa lo mismo, sea cual sea el activo.\n\n**Tamaño = (capital × % de riesgo) ÷ (entrada − stop)**', 'No decides cuánto compras: lo decide la distancia a tu stop.', 'Pruébalo: en tu próxima compra del simulador, pon primero el stop y luego el importe.'),
    ], [
      num('Capital 10.000 €, riesgo 1 %, entrada 50 €, stop 47 €. ¿Cuántas acciones compras? (redondea hacia abajo)', 33, 'acciones', '100 € ÷ 3 € = 33,3 → 33 acciones.', 2),
      num('En esa operación (33 acciones a 50 €), ¿cuánto dinero inviertes?', 1650, '€', '33 × 50 = 1.650 €, un 16,5 % de la cuenta, con solo un 1 % en riesgo.'),
      simTrade('Tienes 10.000 € y arriesgas como mucho un 1 %. Coloca el stop donde tu idea deja de ser válida y ajusta el importe para no pasarte.', 'lvl-62', 'Primero el stop (bajo el mínimo reciente), después el tamaño: riesgo = acciones × (entrada − stop).'),
      simTrade('Ahora con una cuenta de 5.000 € y el mismo límite del 1 % (50 €). Elige stop e importe.', 'lvl-36', 'Con menos capital, el riesgo máximo baja a 50 €: el mismo stop permite menos acciones.', { cash: 5000 }),
      level('Has comprado al último precio. Antes de calcular el tamaño, coloca el stop donde la idea deja de ser válida.', 'lvl-65', 'STOP', 'Justo por debajo del mínimo reciente: si el precio lo pierde, la idea de compra ya no vale. Con ese stop ya puedes calcular el tamaño.'),
      match('Arriesgas 100 €. Empareja la distancia al stop con las acciones que compras.', [['Stop a 1 €', '100 acciones'], ['Stop a 2 €', '50 acciones'], ['Stop a 4 €', '25 acciones'], ['Stop a 5 €', '20 acciones']], 'Acciones = 100 € ÷ distancia al stop.'),
      timed(num('Rápido: arriesgas 200 € y la distancia al stop es de 4 €. ¿Cuántas acciones?', 50, 'acciones', '200 ÷ 4 = 50.'), 15),
      single('Si alejas el stop, para arriesgar lo mismo debes comprar…', ['Más acciones', 'Menos acciones', 'Las mismas acciones'], 1, 'Más distancia por acción = menos acciones para la misma pérdida máxima.'),
      tf('Con un stop más cercano puedes comprar más acciones arriesgando la misma cantidad.', true, 'Pero un stop demasiado cerca te puede sacar con el ruido normal del precio.'),
      scenario('Marta tiene 10.000 € y quiere comprar una acción a 20 €. El mínimo reciente está en 18,50 €, pero pone el stop en 19,90 € para poder comprar 1.000 acciones. ¿Qué pasa?', [['Genial: mucho tamaño con poco riesgo', 'El ruido normal de un día mueve más de 10 céntimos: lo más probable es que salte el stop sin motivo.'], ['Mejor el stop bajo los 18,50 € y calcular el tamaño con esa distancia', 'Bien: con algo más de 1,50 € de distancia y 100 € de riesgo, unas 60 acciones.'], ['Mejor sin stop y con las 1.000 acciones', 'Son 20.000 € de posición con una cuenta de 10.000 €: imposible sin apalancamiento y sin límite de pérdida.']], 1, 'El stop se pone donde dice el gráfico; el tamaño se adapta a él, nunca al revés.'),
      scenario('Con 10.000 € y la regla del 1 %, quieres comprar dos activos: uno tranquilo, con el stop a un 2 %, y una cripto, con el stop a un 8 %. ¿Cómo repartes el dinero?', [['El mismo importe en los dos', 'Con el mismo importe, la cripto arriesgaría cuatro veces más que el activo tranquilo.'], ['Más en el tranquilo y menos en la cripto', 'Eso: con el stop cuatro veces más lejos, cuatro veces menos importe. Cada operación pesa lo mismo.'], ['Más importe en la cripto, que puede subir más', 'Así la operación más volátil sería también la más grande: un fallo ahí te costaría mucho más.']], 1, 'El importe se adapta a la distancia del stop: con el stop al 2 %, unos 5.000 €; al 8 %, unos 1.250 €. Las dos operaciones arriesgan 100 €.'),
      buckets('¿Compras más o menos acciones que antes?', ['Más acciones', 'Menos acciones'], [['Acercas el stop a la entrada, con el mismo riesgo', 0], ['Alejas el stop porque el activo se mueve mucho', 1], ['Tu cuenta crece y el 1 % son más euros', 0], ['Bajas el riesgo del 1 % al 0,5 %', 1]], 'Acciones = riesgo en euros ÷ distancia al stop. Con más distancia o menos riesgo, compras menos; con menos distancia o más euros de riesgo, compras más.'),
    ], { source: '10.2', minutes: 6, retire: [0, 1, 6, 7, 8, 9] }),

    lesson('u24l5', 'Dónde poner el stop loss', [
      mission({
        title: 'Stop con margen',
        // RED-1: gráfico propio (antes era el mismo de u6l4). Siemens, mayo-julio de 2025: soporte a −2,1 %, ATR 1,7 %;
        // después el precio baja hasta −3,4 % (día 4) y sube hasta +5,6 % (día 12). Fixture `lvl-32`.
        intro: 'Velas reales de Siemens: compras al último precio. El **soporte** está un 2 % por debajo y el precio se mueve de media un 1,7 % al día (su ATR).',
        widget: { kind: 'orders', chart: 'lvl-32', stopPct: 2, takePct: 5, maxPct: 10 },
        predict: {
          prompt: '¿Dónde va el stop de esta compra?',
          options: ['Justo en el soporte', 'Por debajo del soporte, con margen para el ruido', 'Donde me duela perder'],
          answer: 1,
          why: 'Justo en el soporte, cualquier mecha lo salta. Con margen (por ejemplo, una parte del ATR), solo salta si la idea falla de verdad.',
        },
        goal: { text: 'Pon el stop bajo el soporte con margen y el objetivo a no más de un 5,5 %.', when: [when('stopPct', '>=', 3.5), when('takePct', '<=', 5.5), when('played', '==', 1), when('hit', '==', 2)] },
        insight: 'El stop va **donde tu idea deja de ser válida**, con margen para el ruido. Pegado al soporte, una simple mecha te saca justo antes de la subida.',
        lumi: [
          { when: when('hit', '==', 2), say: '¡Bien! Con margen, el ruido no te sacó.', mood: 'CELEBRATE' },
          { when: when('hit', '==', 1), say: 'Saltó por poco. ¿Tenía margen bajo el soporte?', mood: 'WORRIED' },
          { when: when('stopPct', '<', 3.5), say: 'Ese stop está pegado al soporte, o por encima.', mood: 'THINKING' },
          { say: 'Coloca el stop y el objetivo, y mira qué pasó', mood: 'HAPPY' },
        ],
      }),
      story('Nervios a 40 céntimos', [], [
        note('Compraste a 50 € con el stop en 47 €. Hoy el precio baja a 47,40 €.'),
        say('me', 'Uf… está a punto de saltar.'),
        choose('¿Qué haces?', [
          opt('Bajo el stop a 44 € para darle más espacio', 'bad', say('lumi', 'Acabas de **duplicar** tu riesgo. Así una pérdida pequeña se vuelve grande.')),
          opt('Lo dejo donde está', 'good', say('lumi', 'Bien: lo decidiste en calma. Si salta, pierdes **1R** y sigues en el juego.')),
          opt('Quito el stop: ya se recuperará', 'bad', say('lumi', 'Sin stop no hay límite de pérdida. A veces no se recupera.')),
        ]),
        say('lumi', 'Un stop nunca se aleja en contra. A favor, sí puedes subirlo.'),
      ]),
      key('Tres métodos y sus errores', '1. **Estructural:** al otro lado de un nivel, o bajo el mínimo de la vela de giro.\n2. **Por volatilidad:** a 2–3 veces el **ATR** (rango medio de las últimas 14 velas).\n3. **Por tiempo:** si en, por ejemplo, 10 sesiones no hace lo previsto, sales.\n\nErrores típicos: ponerlo demasiado cerca, en números redondos obvios (50,00 €), alejarlo cuando el precio se acerca o no ponerlo. Y con un hueco de precio, se ejecuta peor de lo previsto. Si va a favor, puedes subirlo al precio de entrada o bajo el último mínimo creciente.', 'El stop va donde tu idea deja de ser válida, no donde te duele perder.', 'En tu próxima compra del simulador, pon el stop bajo el último mínimo.'),
    ], [
      level('Compras al último precio tras un rebote. Coloca el stop donde la idea deja de ser válida.', 'lvl-39', 'STOP', 'Por debajo del último mínimo relevante: si el precio lo pierde, el rebote ha fallado.'),
      level('Gráfico real. Coloca un stop estructural para esta compra.', 'lvl-11', 'STOP', 'Bajo el mínimo reciente, con un pequeño margen para el ruido normal.'),
      level('Una acción española. Coloca el stop con lógica, no donde te duele.', 'lvl-17', 'STOP', 'El nivel que invalida la idea es el mínimo reciente: el stop va justo por debajo.'),
      trend('Antes de colocar un stop, lee el contexto. ¿Qué tendencia ves?', 'trend-up-8', 'Alcista', 'Máximos y mínimos crecientes. En una tendencia alcista, el stop de una compra suele ir bajo el último mínimo creciente.'),
      point('En un mercado lateral, el stop de una compra en la parte baja del rango va bajo el mínimo del rango. Toca ese mínimo.', 'trend-flat-10', 'min', 'Si el precio pierde el suelo del rango, la idea de rebote deja de valer.'),
      scenario('Compraste a 50 € con el stop en 47 €. El precio baja a 47,40 € y te pones nervioso. ¿Qué haces?', [['Bajo el stop a 44 € para darle más espacio', 'Acabas de duplicar tu riesgo: así es como una pérdida pequeña se convierte en grande.'], ['Dejo el stop donde está', 'Bien: lo decidiste en calma. Si salta, pierdes 1R y sigues en el juego.'], ['Quito el stop, ya se recuperará', 'Sin stop no hay límite de pérdida. A veces no se recupera.']], 1, 'Nunca se aleja un stop en contra: solo se acerca a favor.'),
      num('Compras a 50 €. El ATR es de 2 € y pones el stop a 2 ATR de distancia. ¿A qué precio va el stop?', 46, '€', '2 × 2 € = 4 €; 50 − 4 = 46 €.'),
      fill('El rango medio de las últimas 14 velas, muy usado para colocar stops, se llama ____.', 'ATR', ['RSI', 'PER', 'MACD'], 'Average True Range, creado por J. Welles Wilder en 1978.'),
      timed(tf('Un stop loss garantiza siempre el precio exacto de salida.', false, 'Si el precio abre con un hueco por debajo, se ejecuta al primer precio disponible, que puede ser peor.'), 10),
      multi('¿Cuáles son errores típicos con el stop? Marca todos.', ['Ponerlo justo en un número redondo obvio', 'Decidirlo antes de comprar', 'Ponerlo bajo el mínimo de la vela de giro', 'Ponerlo tan cerca que lo saca el ruido'], [0, 3], 'Ponerlo dentro del ruido o en un número redondo obvio son errores, igual que alejarlo cuando el precio se acerca. Decidirlo antes de comprar y colocarlo bajo el mínimo de la vela de giro es lo correcto.'),
      single('La operación va a favor y ya ganas 2R. ¿Qué puedes hacer con el stop?', ['Subirlo al precio de entrada', 'Quitarlo, ya vas ganando', 'Bajarlo un poco para que no salte'], 0, 'Subir el stop a favor protege lo ganado sin cambiar tu plan.'),
    ], { source: '10.3', minutes: 6, retire: [1, 2, 5, 6, 8] }),

    lesson('u24l6', 'Pensar en R: riesgo y beneficio', [
      mission({
        title: 'Mide en R',
        // RED-1: gráfico propio (antes era el mismo de u6l5). SAP, agosto-octubre de 2026: después el precio baja como
        // mucho un 1,9 % y sube hasta +8,7 %. Fixture `lvl-26`.
        intro: 'Velas reales de SAP: compras al último precio. Lo que te separa del stop es **1R**, lo que arriesgas.',
        widget: { kind: 'orders', chart: 'lvl-26', stopPct: 3, takePct: 3, maxPct: 12 },
        predict: {
          prompt: 'Con el objetivo a la misma distancia que el stop, ¿qué te juegas?',
          options: ['Ganar 1R o perder 1R', 'Ganar 3R o perder 1R', 'Nada'],
          answer: 0,
          why: 'Con un **1:1**, necesitas acertar más de la mitad de las veces para ganar. Por eso muchos no entran por debajo de **2:1**.',
        },
        goal: { text: 'Coloca el objetivo al menos a 2R y mira qué pasa.', when: [when('rr', '>=', 2), when('played', '==', 1), when('hit', '==', 2)] },
        insight: 'Resultado en R = lo ganado ÷ lo arriesgado: arriesgando un 3 % y ganando un 6 %, son **+2R**. Así comparas operaciones de **cualquier tamaño**.',
        lumi: [
          { when: when('hit', '==', 2), say: '¡Objetivo! Mira la relación: esos son los R que has ganado.', mood: 'CELEBRATE' },
          { when: when('hit', '==', 1), say: 'Saltó el stop: −1R. Ni más ni menos de lo previsto.', mood: 'CALM' },
          { when: when('rr', '<', 2), say: 'Aún por debajo de 2:1. Sube el objetivo o acerca el stop.', mood: 'THINKING' },
          { say: 'Coloca el objetivo y mira qué pasó', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Cumple 2:1?',
        intro: 'Antes de entrar, compara la distancia al **objetivo** con la distancia al **stop**.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Cumple (2:1 o más)' }, { label: 'No cumple' }],
          cards: [
            { icon: 'target', label: 'Entrada 100 €, stop 95 €, objetivo 115 €', bin: 0, why: 'Arriesgas 5 € para ganar 15 €: 3:1.' },
            { icon: 'scale', label: 'Entrada 40 €, stop 38 €, objetivo 42 €', bin: 1, why: 'Arriesgas 2 € para ganar 2 €: 1:1.' },
            { icon: 'flag', label: 'Entrada 10 €, stop 9 €, objetivo 12 €', bin: 0, why: 'Arriesgas 1 € para ganar 2 €: justo 2:1.' },
            { icon: 'bars', label: 'Entrada 60 €, stop 54 €, objetivo 66 €', bin: 1, why: 'Arriesgas 6 € para ganar 6 €: 1:1.' },
            { icon: 'alert', label: 'Entrada 25 €, stop 24 €, objetivo 25,50 €', bin: 1, why: 'Arriesgas 1 € para ganar 0,50 €: arriesgas el doble de lo que puedes ganar.' },
          ],
        },
        goal: { text: 'Clasifica las cinco operaciones.', when: [when('done', '==', 5)] },
        insight: '**Beneficio/riesgo** = distancia al objetivo ÷ distancia al stop. Muchos operadores no entran por debajo de **2:1**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Resta: entrada menos stop, y objetivo menos entrada. ¿Cuál es mayor?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Ya lo ves de un vistazo.', mood: 'HAPPY' },
          { say: '¿Cumple 2:1? Clasifica cada operación', mood: 'HAPPY' },
        ],
      }),
      key('Qué es R', '**1R** es lo que arriesgas en una operación: distancia al stop × número de acciones. Si arriesgas 100 €:\n\n• Salta el stop: **−1R**.\n• Ganas 250 €: **+2,5R**.\n• Sales antes perdiendo 40 €: **−0,4R**.\n\nSi arriesgas 100 € y ganas 300 €, has ganado 3R. Si arriesgas 50 € y ganas 150 €, también 3R: las dos fueron igual de buenas.', 'Una operación se mide en múltiplos de lo que arriesgaste.', 'Antes de tu próxima compra en el simulador, pon el objetivo al menos a 2R.'),
    ], [
      num('Arriesgas 150 € y ganas 450 €. ¿Cuántos R has ganado?', 3, 'R', '450 ÷ 150 = 3R.'),
      num('Arriesgas 200 € y sales antes de tiempo perdiendo 80 €. ¿Cuál es el resultado en R?', -0.4, 'R', '−80 ÷ 200 = −0,4R: perdiste menos de lo que arriesgabas.'),
      match('1R = 100 €. Empareja cada resultado con su valor en R.', [['Ganas 250 €', '+2,5R'], ['Salta el stop', '−1R'], ['Pierdes 40 €', '−0,4R'], ['Ganas 100 €', '+1R']], 'Resultado en R = resultado en € ÷ lo que arriesgaste.'),
      single('Entrada 20 €, stop 19 €, objetivo 23 €. ¿Cuál es la relación beneficio/riesgo?', ['1:1', '2:1', '3:1'], 2, 'Riesgo: 1 €. Beneficio potencial: 3 €. 3 ÷ 1 = 3:1.'),
      level('Has comprado al último precio. Coloca el objetivo (take profit) donde es razonable que aparezca venta.', 'lvl-56', 'TAKE', 'Cerca del máximo anterior: es donde muchos vendieron antes y puede frenar la subida.'),
      level('Gráfico real. ¿Dónde pondrías el objetivo de esta compra?', 'lvl-9', 'TAKE', 'El máximo anterior es una referencia lógica para el objetivo. Compara esa distancia con la del stop para saber tu relación beneficio/riesgo.'),
      num('Entras a 50 € con el stop en 47 €. Quieres una relación de 2:1 exacta. ¿Dónde pones el objetivo?', 56, '€', 'Riesgo: 3 €. Beneficio: 2 × 3 = 6 €. 50 + 6 = 56 €.'),
      buckets('¿La operación cumple un mínimo de 2:1?', ['Cumple (2:1 o más)', 'No cumple'], [['Riesgo 2 €, objetivo a 6 €', 0], ['Riesgo 5 €, objetivo a 5 €', 1], ['Riesgo 1 €, objetivo a 1,50 €', 1], ['Riesgo 3 €, objetivo a 9 €', 0], ['Riesgo 4 €, objetivo a 8 €', 0]], 'Divide la distancia al objetivo entre la distancia al stop.'),
      timed(tf('Si salta el stop, el resultado de la operación es −1R.', true, 'Por definición: 1R es lo que arriesgabas hasta el stop.'), 10),
      single('¿Para qué sirve medir las operaciones en R?', ['Para comparar operaciones de tamaños distintos', 'Para pagar menos comisiones', 'Para acertar más veces'], 0, 'Una operación de 50 € de riesgo y otra de 200 € se comparan fácilmente en R.'),
      scenario('Vas a comprar al último precio. El stop lógico está un 4 % por debajo, bajo el soporte, y el máximo anterior solo un 2 % por encima. ¿Esta operación compensa?', [['Sí: si acierto, gano', 'Si aciertas ganas medio R y si fallas pierdes 1R: tendrías que acertar muchísimo para que salga a cuenta.'], ['No: arriesgo 1R para ganar medio R', 'Eso: muchos operadores no entran por debajo de 2:1, y aquí ganarías la mitad de lo que arriesgas.'], ['Sí, si pongo el objetivo muy por encima del máximo', 'Poner el objetivo donde no es razonable llegar solo maquilla la cuenta: el máximo anterior puede frenar la subida.']], 1, 'Antes de entrar, compara la distancia al objetivo con la del stop. Con medio R de premio por 1R de riesgo, la operación no compensa.'),
      scenario('Dos operaciones cerradas. Ana arriesgó 100 € y ganó 300 €. Bruno arriesgó 400 € y ganó 400 €. ¿Cuál fue mejor operación?', [['La de Bruno: ganó más euros', 'Ganó más euros, pero arriesgando cuatro veces más: solo +1R.'], ['La de Ana: ganó 3R', 'Eso: Ana ganó el triple de lo que arriesgó; Bruno, lo mismo que arriesgó.'], ['Las dos igual: las dos ganaron', 'Ganar no basta: importa cuánto ganas por cada euro que pones en riesgo.']], 1, 'En R se comparan operaciones de cualquier tamaño: lo ganado entre lo arriesgado. Ana, 3R; Bruno, 1R.'),
      chat(['Mi última operación: saltó el stop y perdí 100 €.', 'Arriesgaba justo 100 €. ¿Ha sido un desastre?'], 'A Lumi le saltó el stop y perdió 100 €, justo lo que arriesgaba. Pregunta si ha sido un desastre. ¿Qué le dices?', [['Sí: perder siempre es un desastre', 'Pero perdí exactamente lo previsto… eso no suena a desastre.'], ['No: es −1R, lo previsto', 'Cierto: −1R es una pérdida planificada. Lo malo sería perder más por quitar el stop.'], ['Sí: deberías haber quitado el stop', 'Sin stop, la pérdida podría haber sido mucho mayor que 1R.']], 1, 'Si salta el stop, el resultado es −1R: una pérdida pequeña y planificada, no un desastre.'),
    ], { source: '10.4', minutes: 6, retire: [0, 1, 5, 6, 7, 8, 9] }),

    lesson('u24l7', 'La esperanza matemática', [
      play({
        title: 'Acertar la mitad y ganar',
        intro: '1.000 personas operan a cara o cruz: si sale cara ganan **200 €**; si sale cruz pierden **100 €**. Pagan 2 € de comisión cada vez.',
        widget: { kind: 'coinflip', traders: 1000, trades: 5, maxTrades: 300, fee: 2, stake: 100, win: 2 },
        predict: {
          prompt: 'Solo aciertan la mitad. Tras 100 operaciones, ¿cuántos acaban ganando?',
          options: ['La mitad', 'Prácticamente todos', 'Casi nadie'],
          answer: 1,
          why: 'De media, cada operación vale 0,5 × 200 − 0,5 × 100 − 2 = **+48 €**. Tras 100, ninguno de los 1.000 acaba perdiendo.',
        },
        goal: { text: 'Llega a 100 operaciones cada uno.', when: [when('trades', '>=', 100)] },
        insight: '**Esperanza = % de acierto × ganancia media − % de fallo × pérdida media.** Aquí, +48 € por operación: tras 100, el resultado medio ronda los 4.800 €.',
        lumi: [
          { when: when('losersPct', '>=', 10), say: 'Con pocas operaciones, la suerte aún pesa mucho.', mood: 'THINKING' },
          { when: when('trades', '>=', 100), say: 'Con ventaja y muchas operaciones, la suerte deja de mandar.', mood: 'CELEBRATE' },
          { say: 'Sube el número de operaciones', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Gana o pierde a la larga?',
        intro: 'Cada sistema dice cuánto acierta, cuánto gana cuando acierta y cuánto pierde cuando falla. ¿Cuáles tienen esperanza positiva?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Esperanza positiva' }, { label: 'Cero o negativa' }],
          cards: [
            { icon: 'dice', label: 'A: acierta el 40 %, gana 2R y pierde 1R', bin: 0, why: '0,4 × 2 − 0,6 × 1 = +0,2R. Falla más de lo que acierta, pero gana.' },
            { icon: 'dice', label: 'B: acierta el 60 %, gana 0,5R y pierde 1R', bin: 1, why: '0,6 × 0,5 − 0,4 × 1 = −0,1R. Acierta mucho y pierde.' },
            { icon: 'dice', label: 'C: acierta el 30 %, gana 3R y pierde 1R', bin: 0, why: '0,3 × 3 − 0,7 × 1 = +0,2R.' },
            { icon: 'dice', label: 'D: acierta el 50 %, gana 1R y pierde 1R', bin: 1, why: 'Esperanza 0: tras costes, pierde.' },
            { icon: 'dice', label: 'E: acierta el 90 %, gana 0,1R y pierde 2R', bin: 1, why: '0,9 × 0,1 − 0,1 × 2 = −0,11R. Sus pocos fallos son enormes.' },
          ],
        },
        goal: { text: 'Clasifica los cinco sistemas.', when: [when('done', '==', 5)] },
        insight: 'El % de acierto solo no dice nada: hay que combinarlo con **cuánto ganas y cuánto pierdes**. El sistema B acierta el 60 % y pierde dinero.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Ojo: un acierto alto no basta si los fallos son grandes.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Mira siempre las dos partes de la cuenta.', mood: 'HAPPY' },
          { say: '¿Gana o pierde a la larga? Clasifica cada sistema', mood: 'HAPPY' },
        ],
      }),
      key('Los costes', 'Cada operación paga comisión, *spread* y, si hay apalancamiento, financiación. Si tu esperanza es +0,1R y los costes suponen 0,15R por operación, tu sistema real **pierde**. Cuantas más operaciones, más pesan.\n\nCon +0,2R, un 1 % de riesgo y 100 operaciones al año saldrían unos 20R: cerca de un 20 % anual, con rachas de pérdidas por el camino. Es solo un ejemplo, no una promesa.', 'Un sistema gana si, de media, cada operación gana más de lo que pierde, contando aciertos y fallos.', 'Pruébalo: en Cartera, compara lo que ganas de media con lo que pierdes.'),
    ], [
      num('Aciertas el 45 % de las veces, ganas 2R de media y pierdes 1R. ¿Cuál es tu esperanza por operación?', 0.35, 'R', '0,45 × 2 − 0,55 × 1 = 0,90 − 0,55 = +0,35R.'),
      num('Un sistema acierta el 70 %, gana 0,4R de media y pierde 1R. ¿Cuál es su esperanza?', -0.02, 'R', '0,7 × 0,4 − 0,3 × 1 = 0,28 − 0,30 = −0,02R. Acierta mucho y aun así pierde.', 5),
      single('El sistema B acierta el 60 % y pierde dinero. ¿Por qué?', ['Porque sus ganancias medias son pequeñas frente a sus pérdidas', 'Porque acierta demasiado', 'Porque opera poco'], 0, 'Gana 0,5R y pierde 1R: los fallos pesan el doble que los aciertos.'),
      scenario('Puedes seguir uno de estos tres sistemas, todos con pérdidas de 1R. ¿Cuál eliges?', [['A: acierta el 40 % y gana 2R', 'Esperanza: 0,4 × 2 − 0,6 = +0,2R por operación. Falla más de lo que acierta, pero gana.'], ['B: acierta el 60 % y gana 0,5R', 'Esperanza: 0,3 − 0,4 = −0,1R. Te sentirás bien acertando… mientras pierdes dinero.'], ['D: acierta el 50 % y gana 1R', 'Esperanza: 0. Después de comisiones y spread, pierde.']], 0, 'El porcentaje de acierto solo no dice nada: hay que combinarlo con el tamaño de aciertos y fallos.'),
      tf('Un sistema que acierta solo el 30 % de las veces puede ser rentable.', true, 'Si gana 3R de media y pierde 1R: 0,3 × 3 − 0,7 × 1 = +0,2R.'),
      buckets('Con pérdidas de 1R, ¿tiene esperanza positiva antes de costes?', ['Positiva', 'Cero o negativa'], [['Acierta 35 % y gana 2R', 0], ['Acierta 55 % y gana 0,8R', 1], ['Acierta 25 % y gana 4R', 0], ['Acierta 50 % y gana 1R', 1], ['Acierta 60 % y gana 1R', 0]], '0,35 × 2 − 0,65 = +0,05R; 0,55 × 0,8 − 0,45 = −0,01R; 0,25 × 4 − 0,75 = +0,25R; 0,5 − 0,5 = 0; 0,6 − 0,4 = +0,2R.'),
      num('Tu sistema tiene una esperanza de +0,2R, arriesgas un 1 % por operación y haces 100 operaciones al año. ¿Qué ganancia esperada sale, como ejemplo teórico?', 20, '%', '100 × 0,2R = 20R; con 1R = 1 % de la cuenta, unos 20 %. Es una esperanza, no una promesa: habrá rachas malas.'),
      timed(single('Rápido: tu esperanza es +0,1R y los costes son 0,15R por operación. ¿Qué pasa?', ['Ganas 0,25R', 'Pierdes 0,05R por operación', 'Quedas en 0'], 1, '0,1 − 0,15 = −0,05R: los costes se comen la ventaja.'), 15),
      fill('Esperanza = (% de acierto × ganancia media) − (% de fallo × ____).', 'pérdida media', ['comisión media', 'ganancia máxima', 'capital total'], 'Cada fallo resta lo que pierdes de media cuando fallas.'),
      chat(['¡He encontrado un sistema que acierta el 90 %! 🤩', 'Gana 0,1R cuando acierta y pierde 2R cuando falla.'], '¿Qué le dices a Lumi?', [['¡Enhorabuena, con un 90 % es imposible perder!', 'Hagamos la cuenta: 0,9 × 0,1 − 0,1 × 2 = −0,11R. Pierdo en cada operación de media… 😳'], ['Calculemos la esperanza antes de celebrarlo', 'Vale: 0,09 − 0,20 = −0,11R. Acierta mucho, pero sus fallos son enormes.'], ['Sube el riesgo al 10 % para aprovecharlo', 'Con esperanza negativa, más riesgo solo acelera las pérdidas.']], 1, 'Acertar mucho no sirve si los pocos fallos se llevan más de lo que ganan los aciertos.'),
      scenario('Un curso promete un sistema que «acierta el 85 % de las operaciones». ¿Qué preguntas antes de pagar nada?', [['Cuántos alumnos lo usan ya', 'Que mucha gente lo use no dice si gana dinero.'], ['Cuánto gana y cuánto pierde, tras costes', 'Eso: sin esas dos cifras, el 85 % no dice nada. Un sistema que acierta el 90 % puede perder dinero.'], ['Si hay descuento por pagar hoy mismo el curso', 'La prisa por pagar es una señal de alarma, no un dato del sistema.']], 1, 'El porcentaje de acierto solo no dice nada: la esperanza combina cuánto aciertas con cuánto ganas y pierdes en cada caso.'),
      scenario('Dos sistemas tienen la misma ventaja antes de costes. A opera 5 veces al año; B, 500 veces, y paga comisión y spread en cada una. ¿Cuál tiene más riesgo de perder dinero en la práctica?', [['A, porque opera poco', 'Operar poco no es un problema: paga muy pocos costes.'], ['B: paga costes en cada operación', 'Eso: cuantas más operaciones, más pesan los costes.'], ['Los dos igual: tienen la misma ventaja', 'La misma ventaja antes de costes no es la misma ventaja real.']], 1, 'Cada operación paga comisión y spread. Si los costes superan la ventaja, el sistema pierde, y con muchas operaciones se nota más.'),
      chat(['Mi sistema tiene esperanza positiva.', 'Así que puedo arriesgar un 20 % por operación, ¿no?'], 'Lumi cree que, como su sistema tiene esperanza positiva, puede arriesgar un 20 % por operación. ¿Qué le dices?', [['Sí: con esperanza positiva no se puede perder', 'Con pocas operaciones aún manda la suerte. Una racha mala al 20 % me sacaría.'], ['Una racha mala te sacaría antes', 'Tiene sentido: mejor un riesgo pequeño para llegar a esa «larga».'], ['Mejor un 50 %, para aprovecharlo al máximo', 'Eso solo acelera la ruina: dos fallos seguidos y me quedaría con un 25 %.']], 1, 'La esperanza positiva se nota con muchas operaciones. Para llegar hasta ahí hay que sobrevivir a las rachas malas con un riesgo pequeño.'),
    ], { source: '10.5', minutes: 6, retire: [0, 1, 2, 4, 5, 6, 7, 9] }),
  ],
})
