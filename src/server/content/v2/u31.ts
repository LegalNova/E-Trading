import 'server-only'
// Sección 11 · Unidad 31 · Fiscalidad de tus inversiones (docs/curso-v2/02-curriculo.md)
// Normativa estatal vigente en 2026 (territorio común; País Vasco y Navarra tienen normas propias). Escala del ahorro
// comprobada en el Manual práctico de Renta 2025 de la AEAT (estatal 9,5/10,5/11,5/13,5/15 % + autonómica igual).
// Clases interactivas (docs/curso-v2/05-clases-interactivas.md): cifras con savingsTax y growthPath (src/client/play/math.ts).
import { buckets, chat, choose, fill, key, lesson, match, multi, num, opt, order, play, say, scenario, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u31', order: 31, title: 'Fiscalidad de tus inversiones', description: 'Cuánto pagas a Hacienda por invertir en España y cómo pagar lo justo legalmente',
  lessons: [
    lesson('u31l1', 'La base del ahorro y sus tramos', [
      story('El fondo de Ana', [{ id: 'ana', name: 'Ana' }], [
        say('ana', '¡Mi fondo ha ganado 15.000 € este año! No he vendido nada.'),
        say('ana', 'Me va a tocar pagar un dineral en la renta, ¿no?'),
        choose('¿Cuánto paga Ana por esa ganancia?', [
          opt('Unos 3.000 €, por la escala del ahorro', 'bad', say('lumi', 'Solo pagaría si vendiera. Sin vender, no hay ganancia que declarar.')),
          opt('Nada hasta que venda o reembolse', 'good', say('lumi', '¡Exacto! Ese impuesto aplazado sigue invirtiendo para ella: **diferimiento fiscal**.')),
          opt('El 19 % de todo lo que vale el fondo', 'bad', say('lumi', 'Ni siquiera al vender se paga por todo: solo por la ganancia.')),
        ]),
        say('ana', '¿Y los dividendos y los intereses?'),
        say('lumi', 'Esos tributan el año que los cobras, con una retención del 19 % a cuenta.'),
      ]),
      play({
        title: 'Por tramos, no de golpe',
        intro: 'Vendes con ganancias. La ganancia va a la **base del ahorro** del IRPF, que paga **por tramos**: cada parte, a su tipo.',
        widget: { kind: 'taxes', gain: 8000, loss: 0, maxGain: 60000 },
        predict: {
          prompt: 'Ganas 8.000 € vendiendo acciones. ¿Cómo tributan?',
          options: ['Los 8.000 € al 21 %', 'Los primeros 6.000 € al 19 % y el resto al 21 %', 'Nada hasta los 50.000 €'],
          answer: 1,
          why: '6.000 × 19 % + 2.000 × 21 % = **1.560 €**. Los primeros 6.000 € pagan siempre el 19 %.',
        },
        goal: { text: 'Busca desde qué ganancia el último euro paga un 23 %.', when: [when('marginal', '==', 23)] },
        insight: 'Subir de tramo **solo encarece lo que pasa del límite**. Con 50.500 € de ganancia, el último euro paga un 23 %, pero tu tipo medio es del 20,8 %.',
        lumi: [
          { when: when('marginal', '>=', 23), say: 'Ese 23 % solo se aplica a lo que pasa de 50.000 €.', mood: 'CELEBRATE' },
          { when: when('marginal', '==', 21), say: 'Los primeros 6.000 € siguen pagando un 19 %.', mood: 'THINKING' },
          { say: 'Sube la ganancia y mira los tramos', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Ahorro o general?',
        intro: 'El IRPF tiene dos bases. ¿Dónde va cada ingreso?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Base del ahorro' }, { label: 'Base general' }],
          cards: [
            { icon: 'coins', label: 'Dividendos de acciones', bin: 0, why: 'Rendimiento de tus ahorros: base del ahorro.' },
            { icon: 'bank', label: 'Intereses de un depósito', bin: 0, why: 'También rendimiento del capital: base del ahorro.' },
            { icon: 'chart', label: 'Ganancia al vender un ETF', bin: 0, why: 'Ganancia por vender: base del ahorro.' },
            { icon: 'briefcase', label: 'Tu nómina', bin: 1, why: 'Rendimiento del trabajo: base general.' },
            { icon: 'piggy', label: 'El rescate de un plan de pensiones', bin: 1, why: 'Al rescatarlo tributa como rendimiento del trabajo.' },
            { icon: 'bitcoin', label: 'Ganancia al vender bitcoin', bin: 0, why: 'Cripto vendida con ganancia: base del ahorro.' },
          ],
        },
        goal: { text: 'Clasifica los seis ingresos.', when: [when('done', '==', 6)] },
        insight: 'Intereses, dividendos y ganancias por vender acciones, fondos, ETF o cripto van a la **base del ahorro**. La nómina y el rescate de un plan de pensiones, a la **general**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Viene de tu trabajo o de tus ahorros?', mood: 'THINKING' },
          { say: 'Clasifica cada ingreso', mood: 'HAPPY' },
        ],
      }),
      key('La escala del ahorro (2026)', '• Hasta 6.000 €: **19 %**\n• De 6.000 a 50.000 €: **21 %**\n• De 50.000 a 200.000 €: **23 %**\n• De 200.000 a 300.000 €: **27 %**\n• Más de 300.000 €: **30 %**\n\nEs la escala de territorio común. País Vasco y Navarra tienen normas propias; consulta siempre la Agencia Tributaria.', 'Las inversiones tributan en la base del ahorro, del 19 % al 30 %, y las ganancias solo cuando vendes.', 'Pruébalo: en Cartera, mira lo «No realizado»: solo tributaría si vendieras.'),
    ], [
      num('Vendes acciones con una ganancia de 8.000 €. ¿Cuánto pagas con la escala del ahorro?', 1560, '€', '6.000 × 19 % + 2.000 × 21 % = 1.140 + 420 = 1.560 €.'),
      timed(fill('En la base del ahorro, los primeros 6.000 € tributan al ____ %.', '19', ['15', '21', '25'], 'Del 6.000 € a 50.000 € se pasa al 21 %.'), 12),
      num('Ganancia de 20.000 € por la venta de un fondo. ¿Cuánto pagas?', 4080, '€', '6.000 × 19 % + 14.000 × 21 % = 1.140 + 2.940 = 4.080 €.'),
      single('Vendes con una ganancia de 10.000 €. ¿Cuánto pagas?', ['1.900 €', '1.980 €', '2.100 €'], 1, '6.000 × 19 % + 4.000 × 21 % = 1.140 + 840 = 1.980 €. Solo la parte que supera 6.000 € paga el 21 %.'),
      match('Empareja cada tramo de la base del ahorro con su tipo.', [['Hasta 6.000 €', '19 %'], ['De 6.000 a 50.000 €', '21 %'], ['De 50.000 a 200.000 €', '23 %'], ['De 200.000 a 300.000 €', '27 %'], ['Más de 300.000 €', '30 %']], 'Escala estatal más autonómica vigente en 2026 en territorio común.'),
      tf('Si ganas 7.000 € vendiendo acciones, los 7.000 € tributan al 21 %.', false, 'Solo los 1.000 € por encima de 6.000 € pagan el 21 %: 6.000 × 19 % + 1.000 × 21 % = 1.350 €.'),
      buckets('¿En qué base del IRPF tributa cada cosa?', ['Base del ahorro', 'Base general'], [['Dividendos de acciones', 0], ['Intereses de un depósito', 0], ['Ganancia al vender un ETF', 0], ['Tu nómina', 1], ['El rescate de un plan de pensiones', 1], ['Ganancia al vender bitcoin', 0]], 'El plan de pensiones tributa como rendimiento del trabajo al rescatarlo, en la base general.'),
      num('Con una ganancia de 10.000 € pagas 1.980 €. ¿Cuál es tu tipo medio? (un decimal)', 19.8, '%', '1.980 ÷ 10.000 = 0,198 → 19,8 %. El tipo medio siempre queda por debajo del tipo del último tramo.'),
      scenario('El fondo de Ana ha ganado 15.000 € este año, pero no ha vendido nada. ¿Cuánto paga por esa ganancia en la próxima declaración?', [['3.000 € aproximadamente', 'Solo pagaría si vendiera o reembolsara. Mientras no venda, no hay ganancia que declarar.'], ['Nada: solo tributará cuando venda o reembolse', 'Exacto. Ese impuesto aplazado sigue invirtiendo para ella: es el diferimiento fiscal.'], ['El 19 % de lo que valga el fondo', 'Ni siquiera al vender se paga sobre todo el valor, solo sobre la ganancia.']], 1, 'Las ganancias latentes no tributan. Comprar y mantener también ahorra impuestos.'),
      single('¿Qué territorios tienen su propia normativa de IRPF?', ['Canarias y Baleares', 'País Vasco y Navarra', 'Ceuta y Melilla'], 1, 'Tienen régimen foral. En el resto (territorio común) se aplica la escala estatal más la autonómica.'),
      scenario('Es diciembre. Este año ya ganaste 4.000 € vendiendo unas acciones. Ahora quieres vender un ETF con 5.000 € de ganancia, pero no necesitas el dinero hasta marzo. ¿Cuándo vendes?', [['Ahora: da igual el año en que venda', 'No da igual: este año se sumarían 9.000 € y parte pagaría el 21 %.'], ['En enero: cada año, sus primeros 6.000 € de ganancia pagan el 19 %', '¡Bien visto! Repartida en dos años, toda la ganancia paga el tipo más bajo.'], ['Nunca, para no pagar impuestos', 'Necesitas el dinero en marzo. No vender nunca no es un plan: algún día tributará.']], 1, 'La escala se aplica a lo que ganas en cada año. Si puedes esperar unas semanas, repartir las ventas entre dos años puede dejar todo en el tramo del 19 %. Vender ya parece lo mismo, pero suma las dos ganancias en el mismo año.'),
      scenario('Este año llevas 5.900 € de ganancia por ventas. Si vendes un poco más, pasarás de 6.000 € y entrarás en el tramo del 21 %. ¿Te frena?', [['Sí: todo lo que gane pasará a pagar un 21 %', 'Es el gran mito de los tramos: lo que ya tienes sigue pagando un 19 %.'], ['No: solo la parte que pase de 6.000 € paga el 21 %', 'Exacto. Subir de tramo nunca te deja con menos dinero.'], ['Sí: mejor vender a pérdidas para compensar', 'Perder dinero para pagar menos impuestos es perder dos veces.']], 1, 'Cada tramo solo encarece lo que pasa de su límite. Ganar un euro más nunca te hace pagar más de un euro de impuestos, así que el tramo no debería decidir si vendes.'),
      chat(['Este año he cobrado 600 € de dividendos y he ganado 2.000 € vendiendo un ETF.', '¿Eso se suma a mi nómina en la renta?'], '¿Qué le contestas a Lumi?', [['Sí: todo va junto con la nómina', 'No: la nómina va a la base general y tus inversiones, a la del ahorro, con su escala.'], ['No: va a la base del ahorro, que tiene su propia escala del 19 % al 30 %', '¡Eso es! Y con 2.600 € en total, todo paga el 19 %.'], ['No tributa: hasta 6.000 € es gratis', 'No es gratis: los primeros 6.000 € pagan el 19 %, el tipo más bajo.']], 1, 'Dividendos, intereses y ganancias por ventas van a la base del ahorro, separada de la nómina. El error tentador es creer que los primeros 6.000 € están exentos: pagan el 19 %.'),
    ], { source: '12.3', minutes: 6, retire: [0, 1, 2, 3, 5, 6, 7, 8] }),

    lesson('u31l2', 'Ganancias, pérdidas y compensación', [
      play({
        title: 'Las pérdidas también cuentan',
        intro: 'Este año ganas **5.000 €** vendiendo unas acciones y pierdes **3.000 €** con otras.',
        widget: { kind: 'taxes', gain: 5000, loss: 3000, maxGain: 20000 },
        predict: {
          prompt: '¿Por cuánto tributas?',
          options: ['Por 5.000 €: las pérdidas no cuentan', 'Por 2.000 €', 'Por 8.000 €'],
          answer: 1,
          why: 'Las pérdidas por ventas **se restan** de las ganancias por ventas del mismo año: 5.000 − 3.000 = 2.000 €.',
        },
        goal: { text: 'Ahora ganas 8.000 €. ¿Cuánta pérdida hace falta para que todo tribute al 19 %?', when: [when('gain', '==', 8000), when('base', '>', 0), when('base', '<=', 6000)] },
        insight: 'Una pérdida declarada **reduce tus impuestos**: con 8.000 € de ganancia, 2.000 € de pérdida dejan la base en 6.000 €, toda al 19 %. Por eso conviene declarar también las ventas con pérdidas.',
        lumi: [
          { when: when('base', '==', 0), say: 'Base a cero: este año no pagas por tus ventas.', mood: 'CALM' },
          { when: when('marginal', '==', 21), say: 'Parte de tu ganancia ya paga un 21 %.', mood: 'THINKING' },
          { say: 'Mueve la ganancia y la pérdida', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Es una venta para Hacienda?',
        intro: 'Solo tributa lo que **vendes o cambias**. ¿Esto genera una ganancia o una pérdida este año?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Sí: es una venta' }, { label: 'No tributa todavía' }],
          cards: [
            { icon: 'chart', label: 'Vendes acciones con beneficio', bin: 0, why: 'Ganancia = valor de venta − valor de compra, con las comisiones incluidas.' },
            { icon: 'exchange', label: 'Cambias bitcoin por ether sin pasar por euros', bin: 0, why: 'Es una permuta: cuenta como venta.' },
            { icon: 'down', label: 'Vendes un ETF con pérdidas', bin: 0, why: 'Una pérdida realizada: te sirve para compensar.' },
            { icon: 'cart', label: 'Compras más acciones', bin: 1, why: 'Comprar no tributa.' },
            { icon: 'up', label: 'Tu fondo sube un 20 % y no vendes', bin: 1, why: 'Ganancia latente: no tributa hasta que vendas.' },
            { icon: 'wallet', label: 'Pasas euros del banco al bróker', bin: 1, why: 'Mover tu dinero no es ganar nada.' },
          ],
        },
        goal: { text: 'Clasifica los seis movimientos.', when: [when('done', '==', 6)] },
        insight: '**Ganancia = venta − compra**, con las comisiones de las dos. Si compraste en varias veces, se aplica **FIFO**: se venden primero las que compraste primero.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Ha salido algo de tu cartera a cambio de otra cosa?', mood: 'THINKING' },
          { say: 'Clasifica cada movimiento', mood: 'HAPPY' },
        ],
      }),
      story('La pérdida que sobra', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Este año gané 4.000 € con unas acciones y perdí 6.000 € con otras.'),
        say('pablo', 'También cobré 4.000 € de dividendos. ¿Los 2.000 € de pérdida que sobran se pierden?'),
        choose('¿Qué le dices?', [
          opt('Sí, se pierden', 'bad', say('lumi', 'No: la ley permite aprovecharlos de dos formas.')),
          opt('Una parte resta de los dividendos y el resto, de los años siguientes', 'good', say('lumi', 'Exacto: hasta el **25 %** de los dividendos; el resto, en **4 años**.')),
          opt('Hacienda le devuelve 2.000 € en efectivo', 'bad', say('lumi', 'No hay devolución: la pérdida solo reduce lo que tributas.')),
        ]),
        say('lumi', 'Pasados esos 4 años, la pérdida que no hayas aprovechado caduca.'),
        say('lumi', 'Pruébalo: en Cartera, mira tu «Resultado realizado»: es lo que vería Hacienda.'),
      ]),
    ], [
      num('Compras 100 acciones a 20 € con 10 € de comisión y las vendes a 30 € con otros 10 € de comisión. ¿Cuál es tu ganancia fiscal?', 980, '€', 'Compra: 2.000 + 10 = 2.010 €. Venta: 3.000 − 10 = 2.990 €. Ganancia: 2.990 − 2.010 = 980 €.'),
      num('Compras 10 acciones a 50 € y, meses después, otras 10 a 80 €. Vendes 10 a 90 €. Con el método FIFO, ¿cuánto ganas? (sin comisiones)', 400, '€', 'FIFO: vendes las primeras, las de 50 €. 10 × (90 − 50) = 400 €.'),
      single('Este año ganas 5.000 € vendiendo unas acciones y pierdes 3.000 € con otras. ¿Por cuánto tributas?', ['Por 5.000 €', 'Por 2.000 €', 'Por 8.000 €'], 1, 'Las pérdidas se restan de las ganancias del mismo año: 5.000 − 3.000 = 2.000 €.'),
      num('En el caso anterior, ¿cuánto pagas por esos 2.000 € de ganancia neta?', 380, '€', '2.000 × 19 % = 380 €. Sin compensar, habrías pagado por 5.000 €: 950 €.'),
      scenario('Pablo gana 4.000 € con unas acciones, pierde 6.000 € con otras y cobra 4.000 € de dividendos. ¿Qué pasa con los 2.000 € de pérdida que le sobran?', [['Se pierden', 'No se pierden: la ley permite aprovecharlos de dos formas.'], ['Compensa 1.000 € con sus dividendos (el 25 % de 4.000 €) y arrastra 1.000 € a los 4 años siguientes', 'Exacto: primero hasta el 25 % de los rendimientos y el resto, a los cuatro años siguientes.'], ['Hacienda le devuelve 2.000 € en efectivo', 'No hay devolución de la pérdida: solo reduce lo que tributas.']], 1, 'Las pérdidas sobrantes se compensan hasta el 25 % de dividendos e intereses y el resto se arrastra cuatro años.'),
      num('En el caso de Pablo, ¿cuántos euros de pérdida le quedan para los años siguientes?', 1000, '€', 'Le sobran 2.000 €; compensa el 25 % de 4.000 € = 1.000 € con los dividendos. Quedan 1.000 € para los próximos 4 años.'),
      order('Ordena cómo se aprovecha una pérdida por venta.', ['Se resta de las ganancias por ventas del mismo año', 'Lo que sobre, de dividendos e intereses hasta un 25 %', 'Lo que quede, en los 4 años siguientes'], 'Después de cuatro años, la pérdida no aprovechada caduca.'),
      timed(tf('Las pérdidas que no puedas compensar se pueden aplicar en los 4 años siguientes.', true, 'Pasado ese plazo, caducan.'), 10),
      fill('Si compraste en varias veces, se consideran vendidas primero las primeras que compraste: método ____.', 'FIFO', ['LIFO', 'DCA', 'PER'], 'First in, first out: lo primero que entra es lo primero que sale.'),
      single('Cambias bitcoin por ether sin pasar por euros. Fiscalmente…', ['No pasa nada hasta que vuelvas a euros', 'Es una venta que puede generar ganancia o pérdida', 'Está exento por ser cripto'], 1, 'Es una permuta: tributa la diferencia entre lo que te costó el bitcoin y lo que valía al cambiarlo.'),
      scenario('Es noviembre. Este año has ganado 4.000 € vendiendo un ETF. Tienes otra acción que va 1.500 € en pérdidas y en la que ya no crees. ¿Qué te conviene?', [['Venderla antes del 31 de diciembre: la pérdida resta de la ganancia de este año', '¡Bien! Tributas por 2.500 € en vez de por 4.000 €, y sales de algo en lo que no crees.'], ['Esperar a que vuelva a subir para no perder', 'Si ya no crees en ella, aguantarla solo por no ver la pérdida es el efecto disposición.'], ['Venderla en enero', 'La pérdida contaría para el año que viene, y este año pagarías por los 4.000 € enteros.']], 0, 'Las pérdidas por ventas se restan de las ganancias del mismo año. Si ya ibas a vender algo en pérdidas, hacerlo antes de fin de año reduce lo que pagas. Esperar a enero parece igual, pero la pérdida ya no compensa la ganancia de este año.'),
      single('Compraste participaciones del mismo ETF en 2019 y en 2024, más caras. Vendes la mitad. ¿Cuáles cuentan como vendidas para Hacienda?', ['Las de 2019, las primeras que compraste', 'Las de 2024, las últimas', 'Las que tú elijas'], 0, 'Se aplica FIFO: lo primero que entra es lo primero que sale. Por eso no puedes elegir vender las de 2024 para declarar menos ganancia.'),
      buckets('¿Resta de tus ganancias por ventas de este año?', ['Sí, resta este año', 'No resta este año'], [['Vendes acciones con 800 € de pérdida', 0], ['Tu ETF va 800 € en pérdidas y no lo vendes', 1], ['Cambias bitcoin por ether con pérdidas', 0], ['Vendes un ETF con pérdidas', 0], ['Tu acción ha caído un 30 % pero la mantienes', 1]], 'Solo cuenta la pérdida realizada: la que aparece al vender o cambiar. Una pérdida latente, sin vender, no resta nada todavía.'),
    ], { source: '12.4', minutes: 6, retire: [0, 1, 2, 3, 4, 5, 7, 9] }),

    lesson('u31l3', 'La regla de los dos meses', [
      story('El truco de diciembre', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Tengo un truco: el 30 de diciembre vendo con pérdidas y así pago menos.'),
        say('leo', 'Y el 2 de enero recompro lo mismo. Listo.'),
        choose('¿Funciona?', [
          opt('Sí: la venta fue en diciembre', 'bad', say('lumi', 'Recompra lo mismo antes de dos meses: la ley lo impide.')),
          opt('No: la pérdida queda aplazada hasta que venda lo recomprado', 'good', say('lumi', 'Exacto. No la pierde, pero tendrá que esperar.')),
          opt('No: es ilegal y le multarán', 'ok', say('lumi', 'Vender no es ilegal. Solo que aún no puede usar la pérdida.')),
        ]),
        say('lumi', 'Es la **regla de los dos meses**: artículo 33.5 de la Ley del IRPF.'),
        say('lumi', 'Mira dos meses **antes y después** de vender. Si no cotiza, un año.'),
      ]),
      play({
        title: '¿Se aplica la regla?',
        intro: 'Una pérdida espera si compras **valores homogéneos** (los mismos) en los dos meses anteriores o posteriores a la venta.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'La pérdida se aplaza' }, { label: 'No se aplica' }],
          cards: [
            { icon: 'calendar', label: 'Vendes un ETF con pérdidas y recompras el mismo 3 semanas después', bin: 0, why: 'Dentro de los dos meses posteriores.' },
            { icon: 'clock', label: 'Vendes con pérdidas y recompras lo mismo 3 meses después', bin: 1, why: 'Fuera de la ventana: la pérdida cuenta ya.' },
            { icon: 'repeat', label: 'Compraste más de la misma acción un mes antes de vender con pérdidas', bin: 0, why: 'La ventana también mira hacia atrás.' },
            { icon: 'up', label: 'Vendes con ganancias y recompras al día siguiente', bin: 1, why: 'Solo afecta a las pérdidas: tributas normal.' },
            { icon: 'company', label: 'Vendes una acción con pérdidas y compras otra empresa distinta', bin: 1, why: 'No son valores homogéneos.' },
            { icon: 'document', label: 'Vendes con pérdidas acciones que no cotizan y recompras a los 6 meses', bin: 0, why: 'Para los valores no cotizados, el plazo es de un año.' },
          ],
        },
        goal: { text: 'Decide los seis casos.', when: [when('done', '==', 6)] },
        insight: 'La regla **no castiga: aplaza**. Solo afecta a las pérdidas, y la pérdida se aplica cuando vendas los valores recomprados.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Dos preguntas: ¿es pérdida? ¿Recompras lo mismo dentro de la ventana?', mood: 'THINKING' },
          { say: 'Decide cada caso', mood: 'HAPPY' },
        ],
      }),
      key('Optimización legal', 'Antes de acabar el año, algunos inversores realizan pérdidas para compensar ganancias, respetando los dos meses (por ejemplo, cambiando a un producto distinto que replique un índice parecido).\n\nEs legal, pero la fiscalidad nunca debería ser el motivo principal de una inversión.', 'Si recompras lo mismo en dos meses, la pérdida espera.', 'Pruébalo: antes de vender con pérdidas, mira en el Historial cuándo compraste.'),
    ], [
      single('¿Qué hace la regla de los dos meses?', ['Prohíbe vender con pérdidas en diciembre', 'Aplaza la pérdida si compras los mismos valores dos meses antes o después de venderlos', 'Obliga a mantener las acciones dos meses'], 1, 'Evita vender solo para pagar menos y recomprar enseguida.'),
      tf('Si se aplica la regla de los dos meses, la pérdida se pierde para siempre.', false, 'Solo se aplaza: la aplicarás cuando vendas los valores que recompraste.'),
      scenario('Laura vende un ETF con pérdidas el 10 de diciembre y vuelve a comprar el mismo ETF el 5 de enero. ¿Puede restar esa pérdida en la declaración de este año?', [['Sí, la venta fue en diciembre', 'Recompró los mismos valores menos de dos meses después: la regla lo impide de momento.'], ['No: queda aplazada hasta que venda el ETF recomprado', 'Exacto. No la pierde, pero tendrá que esperar.'], ['Sí, porque es un ETF y no una acción', 'La regla se aplica igual a acciones y ETF cotizados.']], 1, 'Dentro de los dos meses posteriores, la recompra de los mismos valores aplaza la pérdida.'),
      scenario('Bruno compró más acciones de una empresa el 15 de febrero. El 1 de marzo vende con pérdidas las que tenía de antes. ¿Qué pasa?', [['Nada, la regla solo mira lo que compras después', 'También cuenta lo que compraste en los dos meses anteriores a la venta.'], ['La pérdida queda aplazada porque compró valores iguales dos meses antes', 'Eso es: la ventana es de dos meses hacia atrás y hacia delante.'], ['Pierde las acciones compradas en febrero', 'No pierde nada: solo se retrasa el uso fiscal de la pérdida.']], 1, 'La regla mira los dos meses anteriores y los dos posteriores a la venta.'),
      buckets('¿Se aplica la regla de los dos meses?', ['Sí, la pérdida se aplaza', 'No se aplica'], [['Vendes un ETF con pérdidas y recompras el mismo 3 semanas después', 0], ['Vendes con pérdidas y recompras lo mismo 3 meses después', 1], ['Compraste más de la misma acción un mes antes de vender con pérdidas', 0], ['Vendes con ganancias y recompras al día siguiente', 1], ['Vendes una acción con pérdidas y compras otra empresa distinta', 1]], 'Solo afecta a pérdidas y a valores homogéneos dentro de la ventana de dos meses.'),
      timed(tf('Para valores que no cotizan en mercados regulados, el plazo es de un año.', true, 'Para los cotizados, dos meses; para los no cotizados, un año.'), 10),
      fill('La regla se aplica si compras valores ____, es decir, los mismos que vendiste.', 'homogéneos', ['cotizados', 'extranjeros', 'líquidos'], 'Por ejemplo, acciones de la misma empresa o el mismo ETF.'),
      num('Vendes con pérdidas el 15 de octubre. ¿Cuántos meses tienes que esperar para recomprar lo mismo sin que la pérdida se aplace? (valores cotizados)', 2, 'meses', 'La ventana es de dos meses: si recompras pasado el 15 de diciembre, ya no se activa (siempre que no compraras lo mismo en los dos meses anteriores a la venta).'),
      multi('¿Qué es cierto sobre la regla de los dos meses? Marca todo.', ['Está en el artículo 33.5 de la Ley del IRPF', 'Solo afecta a las pérdidas', 'Aplaza la pérdida, no la elimina', 'Prohíbe vender antes de dos meses desde la compra'], [0, 1, 2], 'Puedes vender cuando quieras; lo que cambia es cuándo puedes usar la pérdida.'),
      chat(['Tengo un truco 😏', 'Vendo hoy con pérdidas para pagar menos y mañana lo recompro igual.'], '¿Qué le contestas a Lumi?', [['Genial, todo el mundo debería hacerlo', 'Ese truco es justo el que la ley desactiva.'], ['Con la regla de los dos meses, esa pérdida quedaría aplazada', '¡Exacto! O esperas dos meses, o la pérdida espera a que vendas lo recomprado.'], ['Es ilegal y te pueden multar por vender', 'Vender no es ilegal: simplemente no podrás usar la pérdida todavía.']], 1, 'La regla no castiga: aplaza la pérdida hasta que vendas de verdad.'),
      scenario('Es 20 de diciembre. Tu ETF del MSCI World va 2.000 € en pérdidas y este año ganaste 3.000 € con otra venta. Quieres seguir invertido en bolsa mundial. ¿Qué haces?', [['Lo vendo y recompro el mismo ETF el 2 de enero', 'Recompras lo mismo antes de dos meses: la pérdida queda aplazada y este año no te sirve.'], ['Lo vendo y compro a la vez un ETF de otro índice mundial parecido', '¡Bien! No son valores homogéneos: la pérdida compensa este año y sigues invertido.'], ['No hago nada', 'Es válido, pero pagarás por los 3.000 € enteros pudiendo compensar.']], 1, 'La regla solo aplaza la pérdida si recompras los mismos valores. Cambiar a un producto distinto que replica un índice parecido es legal y te deja seguir invertido. Recomprar lo mismo en enero parece listo, pero es justo lo que la regla desactiva.'),
      scenario('Vendiste un ETF cotizado con pérdidas el 1 de diciembre y no habías comprado más antes. ¿Desde cuándo puedes recomprar el mismo ETF sin que la pérdida se aplace?', [['Desde el 2 de enero: ya es otro año', 'El cambio de año no cuenta: la ventana es de dos meses desde la venta.'], ['Pasados dos meses, a partir del 2 de febrero', 'Exacto: fuera de la ventana de dos meses, la pérdida cuenta ya.'], ['Nunca: ese ETF queda prohibido', 'No hay prohibición: solo se retrasa el uso fiscal de la pérdida.']], 1, 'Para valores cotizados, la ventana es de dos meses antes y después de la venta, sin importar el año. Recomprar en enero es la trampa típica: el año cambia, pero sigues dentro de los dos meses.'),
    ], { source: '12.4', minutes: 6, retire: [1, 2, 4, 5, 7, 9] }),

    lesson('u31l4', 'Traspasos de fondos sin pagar impuestos', [
      story('Del fondo caro al barato', [{ id: 'marta', name: 'Marta' }], [
        say('marta', 'Tengo 20.000 € en un fondo del banco que cobra un 1,8 %. Llevo 6.000 € de ganancia.'),
        say('marta', 'Quiero pasarme a un indexado al 0,2 %. ¿Cómo lo hago?'),
        choose('¿Qué le dices?', [
          opt('Reembolsa y compra el indexado con el dinero', 'bad', say('lumi', 'Pagaría 6.000 × 19 % = **1.140 €** sin necesidad.')),
          opt('Pide un traspaso desde la entidad del indexado', 'good', say('lumi', '¡Eso! Cambia de fondo sin pagar nada ahora.')),
          opt('Quédate en el caro para no pagar impuestos', 'ok', say('lumi', 'No hace falta: el traspaso existe justo para esto.')),
        ]),
        say('lumi', 'En un **traspaso**, el dinero va de fondo a fondo sin pasar por tu cuenta.'),
        say('lumi', 'Mantienes la fecha y el precio de compra. Pagas solo cuando reembolsas de verdad.'),
      ]),
      play({
        title: '¿Sin pagar impuestos?',
        intro: 'El traspaso funciona entre **fondos de inversión**. ¿Puedes hacer esto sin tributar ahora?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Sí, por traspaso' }, { label: 'No, tributa' }],
          cards: [
            { icon: 'repeat', label: 'Rebalancear entre dos fondos indexados', bin: 0, why: 'De fondo a fondo: traspaso.' },
            { icon: 'exchange', label: 'Vender un ETF para comprar otro', bin: 1, why: 'Aunque sean fondos por dentro, los ETF tributan en cada venta.' },
            { icon: 'building', label: 'Cambiar de gestora de fondos', bin: 0, why: 'Se pide en la gestora de destino y no tributa.' },
            { icon: 'company', label: 'Vender acciones para comprar un fondo', bin: 1, why: 'Vender acciones siempre tributa.' },
            { icon: 'shield', label: 'Pasar de un fondo de bolsa a uno monetario', bin: 0, why: 'Los dos son fondos: traspaso.' },
            { icon: 'wallet', label: 'Reembolsar a tu cuenta y comprar otro fondo', bin: 1, why: 'Si el dinero pasa por tu cuenta, ya no es un traspaso.' },
          ],
        },
        goal: { text: 'Clasifica los seis movimientos.', when: [when('done', '==', 6)] },
        insight: '**Fondos:** traspaso sin tributar. **ETF:** tributan en cada venta, como una acción (salvo una excepción técnica muy limitada). Si mantienes años sin tocar, la diferencia es pequeña; si mueves la cartera, importa.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Es de fondo a fondo y sin pasar por tu cuenta?', mood: 'THINKING' },
          { say: 'Clasifica cada movimiento', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'El valor de aplazar',
        intro: 'Si traspasas en vez de reembolsar, los **950 €** de impuestos que no pagas hoy siguen invertidos (7 % anual, ejemplo, no promesa).',
        widget: { kind: 'growth', initial: 950, monthly: 0, rate: 7, years: 1, maxInitial: 2000, maxMonthly: 100, maxRate: 10, maxYears: 30, lines: ['mattress', 'compound'], controls: ['years'] },
        predict: {
          prompt: '¿En cuánto se convierten esos 950 € en 20 años?',
          options: ['En unos 1.900 €', 'En unos 3.700 €', 'En unos 19.000 €'],
          answer: 1,
          why: 'Al 7 %, el dinero se duplica más o menos cada 10 años: dos veces en 20. Son **3.676 €**.',
        },
        goal: { text: 'Llévalos a 20 años.', when: [when('years', '>=', 20)] },
        insight: 'Aplazar impuestos también **se compone**: al final pagarás, pero sobre una bola más grande. Pruébalo: en tu Cartera de ETF, rebalancea con la próxima compra en vez de vender.',
        lumi: [
          { when: when('years', '>=', 20), say: '¡Casi cuatro veces más! Y sin hacer nada.', mood: 'CELEBRATE' },
          { say: 'Arrastra los años', mood: 'HAPPY' },
        ],
      }),
    ], [
      match('Empareja cada producto con su fiscalidad.', [['Fondo de inversión', 'Se traspasa sin tributar hasta el reembolso'], ['ETF', 'Tributa en cada venta'], ['Acción', 'Tributa al vender'], ['Plan de pensiones', 'Desgrava al aportar y tributa como trabajo al rescatar']], 'Cada vehículo tiene su propia regla fiscal.'),
      num('Tu fondo pasó de 10.000 € a 15.000 €. Si lo reembolsas para comprar otro, en vez de traspasar, ¿cuánto pagas de impuestos?', 950, '€', 'Ganancia: 5.000 €. 5.000 × 19 % = 950 €. Con un traspaso, pagarías 0 € ahora.'),
      single('¿Cuánto pagas de impuestos al traspasar de un fondo a otro?', ['El 19 % de la ganancia', 'Nada hasta que reembolses', 'Una tasa fija de 50 €'], 1, 'El impuesto se aplaza hasta el reembolso definitivo.'),
      scenario('Marta tiene 20.000 € en un fondo del banco con un 1,8 % de comisiones y 6.000 € de ganancia. Quiere pasarse a un indexado al 0,2 %. ¿Cómo lo hace?', [['Reembolsa, recibe el dinero en su cuenta y compra el indexado', 'Pagaría 6.000 × 19 % = 1.140 € sin necesidad. Le convenía el traspaso.'], ['Pide un traspaso desde la entidad del fondo indexado', 'Bien: cambia de fondo sin pagar nada ahora y empieza a ahorrar comisiones.'], ['Se queda en el fondo caro para no pagar impuestos', 'No hace falta: el traspaso existe justo para esto.']], 1, 'El traspaso permite dejar un fondo caro sin pagar impuestos por el camino.'),
      tf('Los ETF tienen el mismo régimen de traspaso sin tributar que los fondos.', false, 'En general no: cada venta de un ETF tributa como la de una acción.'),
      order('Ordena cómo funciona un traspaso entre fondos.', ['Eliges el fondo de destino', 'Das la orden de traspaso en la entidad de destino', 'Esa entidad pide el dinero a la de origen', 'El dinero pasa de fondo a fondo sin tocar tu cuenta'], 'Lo inicias en el destino; tú no tienes que vender nada en el origen.'),
      timed(tf('Si el dinero pasa por tu cuenta corriente, ya no es un traspaso y tributa.', true, 'Sería un reembolso y una nueva compra: la ganancia tributa.'), 10),
      buckets('¿Puedes hacerlo sin tributar gracias al traspaso?', ['Sí, por traspaso', 'No, tributa'], [['Rebalancear entre dos fondos indexados', 0], ['Vender un ETF para comprar otro', 1], ['Cambiar de gestora de fondos', 0], ['Vender acciones para comprar un fondo', 1], ['Pasar de un fondo de bolsa a uno monetario', 0]], 'El traspaso funciona entre fondos de inversión, no con ETF ni acciones.'),
      fill('Pagar el impuesto más tarde y que ese dinero siga invirtiendo se llama ____ fiscal.', 'diferimiento', ['fraude', 'rescate', 'redondeo'], 'Es legal y es la gran ventaja del traspaso.'),
      num('Los 950 € de impuestos que no pagaste siguen invertidos 20 años al 7 % (ejemplo, no promesa). ¿En cuánto se convierten? (redondea)', 3676, '€', '950 × 1,07²⁰ ≈ 3.676 €. Aplazar impuestos también se compone.', 2),
      scenario('Tienes 15.000 € en un fondo indexado de bolsa, con 4.000 € de ganancia. Te compras un piso dentro de 3 años y quieres bajar el riesgo. ¿Qué haces?', [['Traspaso el dinero a un fondo monetario', '¡Bien! Bajas el riesgo sin pagar nada ahora: tributarás al reembolsar para el piso.'], ['Lo reembolso y lo meto en un depósito', 'Bajas el riesgo, pero pagas ya por los 4.000 € de ganancia sin necesidad.'], ['Lo dejo en bolsa: a la larga sube', 'A 3 años no hay «larga»: una caída fuerte justo antes de comprar te dejaría corto.']], 0, 'Con fondos, cambiar de riesgo se hace por traspaso, sin tributar hasta el reembolso final. Reembolsar también baja el riesgo, pero adelanta el impuesto y ese dinero deja de trabajar para ti.'),
      chat(['Tengo un ETF del S&P 500 con mucha ganancia.', 'Quiero pasarme a uno mundial. ¿Lo traspaso sin pagar, como un fondo?'], '¿Qué le contestas a Lumi?', [['Sí, los ETF se traspasan igual que los fondos', 'Ojalá. En general, vender un ETF tributa como vender una acción.'], ['No: venderlo tributa; puedes dejarlo y llevar lo nuevo al mundial', '¡Eso! Sin vender no pagas, y las aportaciones nuevas ya van al mundial.'], ['Mejor no invertir más hasta decidir', 'Parar tus aportaciones no arregla nada: el tiempo invertido también cuenta.']], 1, 'Los ETF no tienen el traspaso de los fondos: cada venta tributa. Si ya tienes ganancias, suele ser mejor no vender y dirigir las aportaciones nuevas al producto que prefieres.'),
    ], { source: '12.5', minutes: 6, retire: [1, 3, 4, 6, 7, 9] }),

    lesson('u31l5', 'Dividendos y doble imposición', [
      story('El formulario W-8BEN', [{ id: 'broker', name: 'Tu bróker' }], [
        say('broker', 'Vas a cobrar dividendos de empresas de EE. UU. ¿Quieres firmar el formulario W-8BEN?'),
        choose('¿Qué haces?', [
          opt('Lo firmo', 'good', say('lumi', 'Bien: EE. UU. te retendrá un **15 %**, el máximo del convenio.')),
          opt('Paso, más papeleo', 'bad', say('lumi', 'Sin él, EE. UU. retiene un **30 %**, y aquí solo deduces el 15 %.')),
          opt('Ya lo firmaré el año que viene', 'ok', say('lumi', 'Mientras tanto, cada dividendo pierde un 30 % en origen.')),
        ]),
        say('me', '¿Y luego vuelvo a pagar en España?'),
        say('lumi', 'Tributa en España (19-30 %), pero deduces lo pagado allí: la **doble imposición internacional**.'),
        say('lumi', 'Como máximo el % del convenio, y nunca más de lo que pagarías aquí.'),
      ]),
      play({
        title: '¿Este año o al vender?',
        intro: 'Lo que **cobras** tributa al cobrarlo. Lo que **sube sin vender**, no. ¿Cuándo tributa cada cosa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Tributa este año' }, { label: 'No hasta que vendas' }],
          cards: [
            { icon: 'coins', label: 'Dividendo cobrado de una acción', bin: 0, why: 'Lo cobras: tributa este año.' },
            { icon: 'repeat', label: 'Un ETF de acumulación que reinvierte los dividendos', bin: 1, why: 'Reinvierte por dentro: no tributas hasta vender.' },
            { icon: 'bank', label: 'Intereses de un depósito', bin: 0, why: 'Los cobras: tributan este año.' },
            { icon: 'up', label: 'Un fondo que sube un 20 % sin venderlo', bin: 1, why: 'Ganancia latente: hasta que vendas, nada.' },
            { icon: 'cash', label: 'Dividendo de un ETF de distribución', bin: 0, why: 'Te lo paga: tributa al cobrarlo.' },
          ],
        },
        goal: { text: 'Clasifica las cinco.', when: [when('done', '==', 5)] },
        insight: 'Los **ETF y fondos europeos de acumulación** reinvierten los dividendos por dentro y no tributas hasta vender. Y el dividendo no es gratis: el precio baja más o menos en esa cantidad.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Te llega el dinero a la cuenta o se queda dentro?', mood: 'THINKING' },
          { say: 'Clasifica cada caso', mood: 'HAPPY' },
        ],
      }),
      key('Cuando retienen de más', 'Algunos países retienen más de lo que permite el convenio: Suiza, un **35 %**. Recuperar el exceso exige trámites allí.\n\nLos ETF y fondos europeos de acumulación gestionan esto por dentro.', 'Firma el W-8BEN si cobras dividendos de EE. UU., y deduce la doble imposición en tu declaración.', 'Pruébalo: en Mercado, compara VWCE (acumulación) y VGWL (distribución), el mismo índice.'),
    ], [
      num('Cobras un dividendo bruto de 1.000 € de una empresa de EE. UU. y has firmado el W-8BEN. ¿Cuántos euros retiene EE. UU.?', 150, '€', '1.000 × 15 % = 150 €, el máximo del convenio entre España y EE. UU.'),
      num('Siguiendo el caso: en España te corresponde un 19 % (190 €) y deduces los 150 € pagados en EE. UU. ¿Cuánto pagas además en España?', 40, '€', '190 − 150 = 40 €. En total pagas 190 €: no pagas dos veces.'),
      single('Si no firmas el W-8BEN, ¿cuánto suele retener EE. UU. sobre tus dividendos?', ['Un 0 %', 'Un 15 %', 'Un 30 %'], 2, 'Y en España solo puedes deducir hasta el 15 % del convenio: el resto lo pierdes salvo que lo reclames allí.'),
      num('Mismo dividendo de 1.000 € pero sin W-8BEN: EE. UU. retiene 300 €, en España te tocan 190 € y solo deduces 150 €. ¿Cuánto pagas en total entre los dos países?', 340, '€', '300 en EE. UU. + (190 − 150) = 40 en España = 340 €, frente a 190 € con el formulario.'),
      tf('La deducción por doble imposición puede ser mayor que el impuesto que pagarías en España por ese dividendo.', false, 'Tiene dos límites: el % del convenio y lo que te correspondería pagar en España.'),
      tf('Cuando una empresa paga un dividendo, su precio suele bajar más o menos en esa cantidad.', true, 'Pasas a tener dinero en efectivo y algo menos en acciones. Y ese dinero tributa.'),
      match('Empareja cada término con su significado.', [['W-8BEN', 'Formulario para la retención reducida de EE. UU.'], ['Retención en origen', 'Lo que cobra el país de la empresa'], ['Doble imposición internacional', 'Deducción para no pagar dos veces'], ['ETF de acumulación', 'Reinvierte los dividendos sin que tributes hasta vender']], 'Con estos cuatro conceptos entiendes casi toda la fiscalidad de los dividendos de fuera.'),
      timed(single('Rápido: ¿qué tipo de fondo reinvierte los dividendos sin que tributes hasta vender?', ['De acumulación', 'De distribución', 'Monetario'], 0, 'Por eso suelen ser más eficientes mientras acumulas patrimonio.'), 12),
      scenario('Pablo cobra dividendos de una empresa suiza. Suiza le retiene un 35 % y el convenio con España solo permite un 15 %. ¿Qué pasa con la diferencia?', [['Se la deduce entera en España', 'En España solo puede deducir hasta el 15 % del convenio.'], ['Para recuperar el exceso tiene que reclamarlo a Suiza con sus trámites', 'Exacto: el 20 % de más hay que pedírselo a la Hacienda suiza.'], ['Nada, Suiza se lo devuelve automáticamente', 'No es automático: hay que solicitarlo.']], 1, 'Algunos países retienen más de lo que permite el convenio. Por eso muchos prefieren fondos de acumulación.'),
      buckets('¿Tributa este año o no hasta que vendas?', ['Tributa este año', 'No tributa hasta vender'], [['Dividendo cobrado de una acción', 0], ['Un ETF de acumulación que reinvierte dividendos', 1], ['Intereses de un depósito', 0], ['Un fondo que sube un 20 % sin venderlo', 1], ['Dividendo de un ETF de distribución', 0]], 'Lo que cobras tributa al cobrarlo; lo que sube sin vender, no.'),
      scenario('Tienes 25 años, inviertes cada mes para dentro de 30 y no necesitas cobrar rentas. ¿ETF de acumulación o de distribución?', [['De distribución: me gusta cobrar dividendos', 'Es legítimo, pero pagas impuestos cada año por lo que cobras y luego tienes que reinvertirlo tú.'], ['De acumulación: reinvierte por dentro y no tributo hasta vender', '¡Eso! Mientras acumulas, el impuesto que no pagas sigue trabajando para ti.'], ['Da igual: fiscalmente son lo mismo', 'No lo son: el de distribución tributa cada dividendo; el de acumulación, solo al vender.']], 1, 'Si no necesitas rentas, la acumulación aplaza impuestos y ese dinero sigue componiéndose. Cobrar dividendos parece ganar más, pero el precio baja en esa cantidad y además tributa.'),
      chat(['Esta empresa paga un dividendo del 8 % al año.', '¡Es dinero gratis! La compro solo por eso, ¿no?'], '¿Qué le contestas a Lumi?', [['Sí: un 8 % gratis cada año', 'No es gratis: al pagarlo, el precio de la acción baja más o menos esa cantidad.'], ['El precio baja lo que paga y además tributa: mira si el negocio es bueno', '¡Bien! Un dividendo alto puede venir de un negocio en apuros.'], ['Solo si la empresa es de EE. UU.', 'El país no lo convierte en gratis, y fuera puede haber retención extra.']], 1, 'El dividendo sale del valor de la empresa: tu dinero pasa de acciones a efectivo, y ese efectivo tributa. Un dividendo alto no basta para comprar: importa el negocio que lo paga.'),
    ], { source: '12.6', minutes: 6, retire: [0, 1, 3, 4, 5, 7, 9] }),

    lesson('u31l6', 'Cripto y modelos 720 y 721', [
      story('Diez cambios, cero euros', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Este año he hecho diez cambios entre criptos. Nunca he pasado a euros.'),
        say('bruno', 'Así que no tengo nada que declarar, ¿no?'),
        choose('¿Qué le dices?', [
          opt('Claro: sin euros no hay ganancia', 'bad', say('lumi', 'Cada cambio entre criptos es una venta para Hacienda.')),
          opt('Cada cambio es una venta: calcula la ganancia o pérdida de cada uno', 'good', say('lumi', 'Exacto. Lleva un registro con la fecha y el valor en euros de cada operación.')),
          opt('Declara solo el que más ganó', 'ok', say('lumi', 'Hay que declararlos todos. Y las pérdidas también te ayudan a compensar.')),
        ]),
        say('lumi', 'Comprar y mantener no tributa. Vender o cambiar, sí: del 19 % al 30 %.'),
        say('lumi', 'Y recuerda: la cripto **puede perderse entera**. No está protegida como un depósito.'),
      ]),
      play({
        title: '¿Qué modelo toca?',
        intro: 'Si tienes en el extranjero **más de 50.000 €**, Hacienda quiere saberlo. ¿Qué modelo toca a 31 de diciembre?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Modelo 720' }, { label: 'Modelo 721' }, { label: 'Ninguno' }],
          cards: [
            { icon: 'building', label: '70.000 € en acciones en un bróker extranjero', bin: 0, why: 'Valores en el extranjero por más de 50.000 €: modelo 720.' },
            { icon: 'bitcoin', label: '80.000 € en cripto en un exchange extranjero', bin: 1, why: 'Cripto custodiada fuera por más de 50.000 €: modelo 721.' },
            { icon: 'bank', label: '200.000 € en un bróker español', bin: 2, why: 'Está en España: estos modelos son para lo que tienes fuera.' },
            { icon: 'wallet', label: '30.000 € en una cuenta de un banco extranjero', bin: 2, why: 'No llega a 50.000 €.' },
            { icon: 'home', label: 'Un piso en Francia de 90.000 €', bin: 0, why: 'El 720 también cubre inmuebles en el extranjero.' },
            { icon: 'coins', label: '20.000 € en cripto en un exchange extranjero', bin: 2, why: 'No llega a 50.000 €.' },
          ],
        },
        goal: { text: 'Clasifica los seis casos.', when: [when('done', '==', 6)] },
        insight: 'El **720** cubre cuentas, valores e inmuebles en el extranjero; el **721**, la cripto custodiada fuera. Son **informativos**: presentarlos no cuesta impuestos.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Primero: ¿está fuera de España? Luego: ¿pasa de 50.000 €?', mood: 'THINKING' },
          { say: 'Clasifica cada caso', mood: 'HAPPY' },
        ],
      }),
      key('Informar no es pagar', '• **Modelo 720:** de enero a marzo. Después, solo si el valor sube más de 20.000 € o dejas de tener esos bienes.\n• **Modelo 721:** cripto custodiada en el extranjero por más de 50.000 € a 31 de diciembre.\n\nEl Tribunal de Justicia de la UE anuló en 2022 las sanciones desproporcionadas del 720, pero **la obligación de informar sigue**.', 'Las inversiones en el extranjero por encima de 50.000 € deben declararse, aunque no generen impuestos.', 'Pruébalo: en el Historial, cuenta tus ventas de cripto: cada una se declara.'),
    ], [
      single('Cambias 0,5 ether por solana sin pasar por euros. ¿Qué es para Hacienda?', ['Nada: solo cuenta al pasar a euros', 'Una venta que puede generar ganancia o pérdida', 'Una donación'], 1, 'Cada permuta entre criptos tributa por la diferencia entre su coste y su valor en ese momento.'),
      multi('¿En qué casos tendrías que presentar el modelo 720? Marca todos.', ['60.000 € en acciones en un bróker con sede en Alemania', '40.000 € en una cuenta de un banco extranjero', 'Un piso en Portugal que vale 120.000 €', '55.000 € en cripto en un exchange extranjero'], [0, 2], 'La cuenta no llega a 50.000 €. La cripto en el extranjero va al modelo 721, no al 720.'),
      tf('El modelo 721 es para cripto custodiada en el extranjero por más de 50.000 € a 31 de diciembre.', true, 'Existe desde 2024 y, como el 720, es informativo.'),
      num('Compras 0,1 bitcoin a 30.000 € el bitcoin y lo vendes a 60.000 € el bitcoin. ¿Cuánto pagas de impuestos? (sin comisiones)', 570, '€', 'Compra: 3.000 €. Venta: 6.000 €. Ganancia: 3.000 € × 19 % = 570 €.'),
      buckets('¿Qué modelo informativo toca? (a 31 de diciembre)', ['Modelo 720', 'Modelo 721', 'Ninguno'], [['70.000 € en acciones en un bróker extranjero', 0], ['80.000 € en cripto en un exchange extranjero', 1], ['200.000 € en un bróker español', 2], ['30.000 € en una cuenta de un banco extranjero', 2], ['Un inmueble en Francia de 90.000 €', 0]], 'El 720 cubre cuentas, valores e inmuebles en el extranjero; el 721, la cripto custodiada fuera. Por debajo de 50.000 € por categoría, ninguno.'),
      tf('Como se anularon las sanciones del modelo 720, ya no hay que presentarlo.', false, 'El TJUE anuló en 2022 las sanciones desproporcionadas, no la obligación de informar.'),
      single('¿Cuándo se presenta el modelo 720?', ['De enero a marzo', 'En junio, con la renta', 'Cada mes'], 0, 'Del 1 de enero al 31 de marzo, sobre la situación a 31 de diciembre del año anterior.'),
      scenario('Bruno ha hecho este año diez cambios entre criptos y nunca ha pasado a euros. Dice que no tiene nada que declarar. ¿Qué le dices?', [['Tiene razón: sin euros no hay ganancia', 'Cada cambio entre criptos es una venta fiscal.'], ['Que cada cambio es una venta y debe calcular la ganancia o pérdida de cada uno', 'Exacto. Le conviene llevar un registro de cada operación con su fecha y su valor en euros.'], ['Que solo declare el que más ganó', 'Hay que declararlos todos; las pérdidas también le pueden ayudar a compensar.']], 1, 'En cripto, cada permuta tributa. Llevar un registro te ahorra problemas.'),
      timed(tf('Tras presentar el 720, solo hay que volver a presentarlo si el valor sube más de 20.000 € o dejas de tener esos bienes.', true, 'Esa es la regla general para los años siguientes.'), 12),
      fill('El modelo informativo para cripto custodiada en el extranjero por más de 50.000 € es el ____.', '721', ['720', '100', '303'], 'El 720 es para cuentas, valores e inmuebles; el 100, la renta; el 303, el IVA.'),
      scenario('Tienes cripto en un exchange extranjero. El 31 de diciembre vale 56.000 €. No has vendido nada. ¿Qué te toca?', [['Vender una parte antes del 31 para quedarme por debajo de 50.000 €', 'Vender sí tributaría por la ganancia. Informar, en cambio, no te cuesta impuestos.'], ['Presentar el modelo 721 entre enero y marzo: informar no es pagar', '¡Exacto! Hacienda solo quiere saberlo. Pagarás cuando vendas con ganancias.'], ['Nada: mientras no pase a euros, no cuenta', 'Para el 721 cuenta lo que tienes fuera a 31 de diciembre, lo hayas vendido o no.']], 1, 'Pasar de 50.000 € en cripto custodiada fuera obliga a presentar el 721, que es solo informativo. Vender para evitarlo es la tentación, pero convierte un trámite gratis en un impuesto real.'),
    ], { source: '12.6', minutes: 6, retire: [3, 4, 5, 7, 8] }),
  ],
})
