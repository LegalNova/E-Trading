import 'server-only'
// Sección 11 · Unidad 33 · Elegir dónde invertir (docs/curso-v2/02-curriculo.md)
// Pago por flujo de órdenes: prohibido en la UE por el Reglamento (UE) 2024/791 (MiFIR), con excepción nacional hasta el 30/06/2026.
import { buckets, chat, choose, fill, key, lesson, match, multi, note, num, opt, order, play, say, scenario, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u33', order: 33, title: 'Elegir dónde invertir', description: 'Brókers seguros, comisiones, neobrókers y robo-advisors: cómo comparar sin caer en trampas',
  lessons: [
    lesson('u33l1', 'Cómo elegir un bróker', [
      // Auditoría RED-5: la historia del bróker sin registrar es de u5l5 y u12l7. Aquí va lo propio de esta unidad:
      // qué cambia entre un bróker español y uno de otro país de la UE (quién informa a Hacienda, modelo 720).
      story('El bróker de fuera', [{ id: 'ivan', name: 'Iván' }], [
        say('ivan', 'Abrí cuenta en un bróker alemán: más barato y con más ETF. Está autorizado en la UE.'),
        say('ivan', 'Ahora me llega el borrador de la renta… y mis ventas no aparecen.'),
        choose('¿Qué ha pasado?', [
          opt('Nada: como el bróker es alemán, no tiene que declararlo aquí', 'bad', say('lumi', 'Tributas donde resides. Que no salga en el borrador no significa que no haya que declararlo.')),
          opt('Su bróker no hace el papeleo fiscal español: le toca declararlo a él', 'good', say('lumi', 'Eso. Con un bróker extranjero, las ventas y los dividendos los metes tú, uno a uno.')),
          opt('Que el bróker es un chiringuito', 'bad', say('lumi', 'No: está autorizado. Simplemente no hace por ti el papeleo fiscal español.')),
        ]),
        say('ivan', '¿Y tengo que presentar algo más?'),
        say('lumi', 'Si a 31 de diciembre tienes más de **50.000 €** en valores en el extranjero, también el **modelo 720**.'),
      ]),
      play({
        title: '¿Seguridad, costes o Hacienda?',
        intro: 'Antes de abrir una cuenta, mira tres cosas. ¿A cuál pertenece cada una?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Seguridad' }, { label: 'Costes' }, { label: 'Fiscalidad' }],
          cards: [
            { icon: 'verified', label: 'Autorizado por la CNMV o con pasaporte europeo', bin: 0, why: 'Compruébalo en cnmv.es, no en su web.' },
            { icon: 'shield', label: 'Tus valores, separados del patrimonio del bróker', bin: 0, why: 'Son tuyos: si el bróker quiebra, deberían devolvértelos.' },
            { icon: 'umbrella', label: 'El FOGAIN cubre hasta 100.000 € por inversor', bin: 0, why: 'Cubre si una entidad adherida no te devuelve lo tuyo. No cubre las caídas del mercado.' },
            { icon: 'receipt', label: 'Comisión de custodia', bin: 1, why: 'Lo que te cobran por guardar tus valores.' },
            { icon: 'exchange', label: 'Cambio de divisa al comprar en dólares', bin: 1, why: 'Suele ser el coste más escondido.' },
            { icon: 'timer', label: 'Comisión por inactividad', bin: 1, why: 'Algunos cobran si pasas meses sin operar.' },
            { icon: 'bank', label: 'Retiene el 19 % e informa a Hacienda', bin: 2, why: 'Lo hacen los brókers españoles: la declaración sale casi hecha.' },
            { icon: 'document', label: 'Te toca declarar todo y quizá el modelo 720', bin: 2, why: 'Pasa con muchos brókers extranjeros.' },
          ],
        },
        goal: { text: 'Coloca los ocho criterios.', when: [when('done', '==', 8)] },
        insight: '**Primero, la seguridad**: autorizado y con protección. Después, costes y comodidad fiscal, y ojo: los fondos de garantía de otros países pueden tener límites más bajos.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Esto te protege, te cuesta dinero o es cosa de Hacienda?', mood: 'THINKING' },
          { say: 'Coloca cada criterio', mood: 'HAPPY' },
        ],
      }),
      key('El orden para elegir', '1. **Regulación:** CNMV o supervisor de la UE con pasaporte.\n2. **Protección:** valores separados y fondo de garantía (FOGAIN, hasta 100.000 €).\n3. **Costes:** compraventa, custodia, divisa, inactividad.\n4. **Productos:** ¿tiene los fondos indexados y ETF que quieres?\n5. **Fiscalidad:** un bróker español retiene e informa; con uno extranjero declaras tú todo.', 'Primero, que sea seguro y esté autorizado; después, que sea barato.', 'Pruébalo: en Mercado, busca un ETF del MSCI World y apunta su nombre.'),
    ], [
      order('Ordena los criterios para elegir un bróker, del primero al último que deberías mirar.', ['Regulación', 'Protección si quiebra', 'Costes', 'Productos', 'Fiscalidad y comodidad'], 'Seguridad primero; precio y comodidad después.'),
      multi('¿Qué compruebas antes de abrir una cuenta? Marca todo.', ['Que esté autorizado en los registros de la CNMV', 'Que tenga la app mejor valorada', 'Sus comisiones de compraventa, custodia y divisa', 'Cuántos seguidores tiene en redes'], [0, 2], 'Que esté autorizado en los registros de la CNMV y sus comisiones de compraventa, custodia y divisa; también qué fondo de garantía lo protege. La popularidad en redes o la nota de la app no dicen nada sobre su seguridad.'),
      single('¿Qué es lo primero que debes comprobar de un bróker?', ['Que tenga la app más bonita', 'Que esté autorizado por la CNMV o un supervisor europeo con pasaporte', 'Que sea el más barato'], 1, 'Sin autorización, todo lo demás da igual.'),
      single('¿Qué cubre el FOGAIN?', ['Las pérdidas cuando cae la bolsa', 'Hasta 100.000 € si la entidad falla', 'Todo lo que inviertas, sin ningún límite'], 1, 'Protege frente a fallos de la entidad, no frente a la evolución del mercado.'),
      tf('Un bróker extranjero suele retener impuestos por ti y enviar tus datos a Hacienda.', false, 'Normalmente no: te toca declarar todas las operaciones, y quizá presentar el modelo 720.'),
      scenario('Un bróker que no aparece en los registros de la CNMV te ofrece comisiones cero y un bono del 100 % de tu primer ingreso. ¿Qué haces?', [['Aprovecho el bono, es dinero gratis', 'Los bonos son el cebo típico, y sin autorización no tienes ninguna protección.'], ['Lo descarto: si no está autorizado, no hay nada que comparar', 'Bien: el primer filtro es la autorización. Las comisiones vienen después.'], ['Pruebo con poco y si va bien meto más', 'Muchas estafas dejan ganar al principio para que aportes más.']], 1, 'Sin autorización, una comisión cero puede costarte todo.'),
      buckets('¿Es más típico de un bróker español o de uno extranjero?', ['Bróker español', 'Bróker extranjero'], [['Retiene el 19 % y envía tus datos a Hacienda', 0], ['Te toca declarar tú todas las operaciones', 1], ['Puede obligarte a presentar el modelo 720', 1], ['La declaración de la renta sale casi hecha', 0]], 'La comodidad fiscal también cuenta al comparar.'),
      fill('El FOGAIN cubre hasta ____ € por inversor.', '100.000', ['20.000', '50.000', '1.000.000'], 'Si una entidad adherida no puede devolver tu dinero o tus valores.'),
      timed(tf('Tus acciones y ETF están separados del patrimonio del bróker.', true, 'Son tuyos: si el bróker quiebra, deberían devolvértelos.'), 10),
      match('Empareja cada término con su significado.', [['CNMV', 'Supervisor de los servicios de inversión en España'], ['FOGAIN', 'Fondo que cubre si una entidad no te devuelve lo tuyo'], ['Pasaporte europeo', 'Permiso para operar en España estando autorizado en otro país de la UE'], ['Modelo 720', 'Declaración de valores y cuentas en el extranjero']], 'Cuatro palabras que te ayudan a juzgar un bróker.'),
      tf('Si tu bróker está en otro país de la UE, tus ganancias tributan en ese país y no en España.', false, 'Si resides en España, tributas en España. Con un bróker extranjero solo cambia quién hace el papeleo: tú.'),
    ], { source: '12.1', minutes: 6, retire: [2, 4, 5, 7, 8] }),

    // Auditoría RED-5 y RED-20: repetía la pieza de comisiones (ya en u10l3 y u30l2) y el caso de los 3 € fijos de u30l3.
    // Ahora enseña a comparar dos brókeres con la factura de un año de tu forma de invertir.
    lesson('u33l2', 'Las comisiones de un bróker', [
      story('¿Cuál me sale más barato?', [{ id: 'ana', name: 'Ana' }], [
        say('ana', 'Aporto **100 € al mes** y tengo **3.000 €** invertidos. Dudo entre dos brókeres autorizados.'),
        note('El A cobra **2 € por compra** y nada más. El B no cobra por comprar, pero sí un **0,5 % al año** de custodia.'),
        choose('¿Cuál le sale más barato este año?', [
          opt('El A: 24 € al año', 'bad', say('lumi', 'Son 24 € frente a 15 €: hoy gana el B.')),
          opt('El B: 15 € al año', 'good', say('lumi', 'Eso: un 0,5 % de 3.000 € son 15 €, menos que los 24 € del A.')),
          opt('Cuestan lo mismo', 'bad', say('lumi', 'No: 24 € frente a 15 €.')),
        ]),
        say('ana', '¡Pues me voy al B!'),
        say('lumi', 'Hoy sí. Pero la custodia crece con tu cartera: con 20.000 €, el B te costaría **100 € al año** y el A, los mismos 24 €.'),
        say('lumi', 'El bróker más barato **depende de cómo inviertes tú**, y puede cambiar con los años.'),
      ]),
      play({
        title: '¿Barata o cara?',
        intro: 'Vas a meter **100 €** en un ETF y el bróker cobra **3 € fijos**. ¿Mucho o poco? Depende de lo que compres: ¿se lleva **menos del 1 %** o **un 1 % o más**?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Menos del 1 %' }, { label: 'Un 1 % o más' }],
          cards: [
            { icon: 'receipt', label: '3 € fijos en una compra de 10.000 €', bin: 0, why: 'Un 0,03 %: una ganga.' },
            { icon: 'receipt', label: '3 € fijos en una compra de 100 €', bin: 1, why: 'Un 3 %: tendrías que ganar un 3 % solo para empatar.' },
            { icon: 'percent', label: '0,5 % sin mínimo en una compra de 100 € (0,50 €)', bin: 0, why: 'Un 0,5 %. Con poco dinero, lo porcentual sin mínimo suele ganar.' },
            { icon: 'receipt', label: '5 € fijos en una compra de 100 €', bin: 1, why: 'Un 5 %: hay que ganar un 5 % solo para recuperar la comisión.' },
            { icon: 'coins', label: '2 € fijos en una compra de 1.000 €', bin: 0, why: 'Un 0,2 %.' },
            { icon: 'percent', label: '0,1 % con un mínimo de 5 € en una compra de 200 €', bin: 1, why: 'Manda el mínimo: 5 € sobre 200 € son un 2,5 %.' },
          ],
        },
        goal: { text: 'Clasifica las seis compras.', when: [when('done', '==', 6)] },
        insight: '3 € fijos son una ganga en 10.000 € (**0,03 %**) y una barbaridad en 100 € (**3 %**). Para aportar poco cada mes, busca costes **porcentuales bajos o sin mínimo**; para compras grandes y pocas, una fija puede salir mejor.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: 1 € por cada 100 € es un 1 %.', mood: 'THINKING' },
          { say: 'Compara la comisión con lo que compras', mood: 'HAPPY' },
        ],
      }),
      key('Tu factura del año', 'Para comparar dos brókeres, calcula lo que te costaría **un año tuyo**:\n\n• **Compras:** número de operaciones × comisión.\n• **Custodia:** fija, o un porcentaje de tu cartera.\n• **Divisa:** un porcentaje de lo que compres en otra moneda.\n• **Otras:** inactividad, retirada, traspaso de salida.\n\nRepite la cuenta cuando tu cartera crezca.', 'No hay un bróker más barato para todos: depende de cuánto aportas, cuántas veces y en qué moneda.', 'Pruébalo: en Mercado, prepara una compra de 100 € y mira la comisión simulada.'),
    ], [
      num('Pagas 5 € de comisión fija por comprar 100 € de un ETF. ¿Qué porcentaje se va en comisión?', 5, '%', '5 ÷ 100 = 5 %. Tendrías que ganar un 5 % solo para empatar.'),
      num('Compras 2.000 € de acciones de EE. UU. y el bróker cobra un 0,5 % por el cambio de divisa. ¿Cuántos euros pagas solo por cambiar?', 10, '€', '2.000 × 0,005 = 10 €. Y al vender pagarías otra vez.'),
      num('Un bróker cobra un 0,2 % anual de custodia. Tienes 20.000 €. ¿Cuánto pagas al año?', 40, '€', '20.000 × 0,002 = 40 € al año, suba o baje tu cartera.'),
      match('Empareja cada comisión con lo que cobra.', [['Compraventa', 'Cada vez que compras o vendes'], ['Custodia', 'Guardar tus valores'], ['Cambio de divisa', 'Pasar de euros a otra moneda'], ['Inactividad', 'No operar durante un tiempo']], 'Mira todas, no solo la que anuncian en grande.'),
      single('¿Cuál suele ser el coste oculto más alto al comprar acciones en otra moneda?', ['La custodia', 'El cambio de divisa', 'La cuota mensual de la app'], 1, 'Del 0,1 % al 0,5 % o más por operación, y a veces no aparece en la portada.'),
      scenario('Ana aporta 100 € al mes. El bróker A cobra 3 € fijos por compra; el B, un 0,5 % sin mínimo. ¿Cuál le sale más barato?', [['El A: 3 € es poco', 'Sobre 100 € son un 3 %: 36 € al año.'], ['El B: le cuesta 0,50 € por compra', 'Exacto: 6 € al año frente a 36 €. Con una compra única de 10.000 €, en cambio, ganaría el A (3 € frente a 50 €).'], ['Los dos cuestan lo mismo', 'Con 100 € al mes, no: 0,50 € frente a 3 €.']], 1, 'La comisión que más te conviene depende del tamaño de tus compras.'),
      tf('Si un bróker anuncia «0 € de comisión», invertir con él no tiene ningún coste.', false, 'Puede cobrar por el cambio de divisa, el spread, la custodia o ganar con otras vías.'),
      buckets('¿Se paga por operación o cada año?', ['En cada operación', 'Cada año'], [['Comisión de compraventa', 0], ['Custodia', 1], ['Cambio de divisa', 0], ['TER de un fondo', 1], ['Spread entre compra y venta', 0]], 'Los costes por operación castigan operar mucho; los anuales, mantener caro.'),
      timed(single('Rápido: ¿dónde encuentras el coste anual (TER) de un fondo o ETF?', ['En el KID, el documento de datos fundamentales', 'En su cuenta de Instagram', 'En tu declaración de la renta'], 0, 'Es obligatorio y está estandarizado para poder comparar.'), 12),
      order('Compra única de 100 €. Ordena de más barato a más caro.', ['0,1 % sin mínimo (0,10 €)', '0,5 % sin mínimo (0,50 €)', '2 € fijos', '5 € fijos'], 'Con importes pequeños, las comisiones fijas pesan muchísimo.'),
      scenario('Vas a aportar 100 € cada mes a un ETF que cotiza en dólares. Un bróker anuncia en grande «0 € de comisión». ¿Qué haces antes de elegirlo?', [['Lo elijo: 0 € no se puede mejorar', 'La compraventa puede ser gratis y el coste estar en el cambio de divisa o la custodia. El «0 €» en grande no dice nada de la letra pequeña.'], ['Miro también cuánto cobra por cambiar divisa y por custodia', 'Bien: si compras en dólares cada mes, el cambio de divisa puede ser tu coste más alto aunque la compraventa sea gratis.'], ['Elijo el que más anuncios hace, que será el más fiable', 'La publicidad no dice nada de lo que te cobran a ti ni de si está autorizado.']], 1, 'El bróker más barato es el que menos te cobra con tu forma de invertir: suma todos los costes. «0 €» solo mira una comisión.'),
      num('Haces 6 compras al año y tu bróker cobra 4 € por compra, más 12 € al año de custodia. ¿Cuánto pagas en un año?', 36, '€', '6 × 4 = 24 € en compras, más 12 € de custodia: 36 €.'),
      num('Tu bróker cobra un 0,4 % al año de custodia. Con 10.000 € invertidos, ¿cuánto pagas al año?', 40, '€', '10.000 × 0,004 = 40 €. Y sube cuando sube tu cartera.'),
      scenario('Tienes 40.000 € invertidos y haces dos compras al año. El bróker A cobra 5 € por compra y no cobra custodia. El B no cobra por comprar, pero sí un 0,3 % anual de custodia. ¿Cuál te sale más barato?', [['El A: 10 € al año', 'Eso: dos compras a 5 € son 10 €. La custodia del B serían 120 €.'], ['El B: no cobra por comprar', 'No cobra por comprar, pero un 0,3 % de 40.000 € son 120 € al año.'], ['Cuestan lo mismo', 'No: 10 € frente a 120 €.']], 0, 'Con una cartera grande y pocas operaciones, pesa más la custodia que la comisión por compra.'),
    ], { source: '12.1', minutes: 6, retire: [0, 1, 2, 5, 6, 8, 9, 10] }),

    lesson('u33l3', 'Neobrókers: cómo ganan dinero', [
      // Auditoría RED-5: la pieza del libro de órdenes con el «0 € de comisión» es de u6l2 y u28l3; aquí queda de qué vive un neobróker
      play({
        title: '¿Cómo gana dinero?',
        intro: 'Un neobróker «sin comisiones» gana dinero de otras formas. ¿Cuáles crecen **cuanto más operas**?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Gana más si operas mucho' }, { label: 'Gana aunque no operes' }],
          cards: [
            { icon: 'exchange', label: 'Spread en cada compraventa', bin: 0, why: 'Cada operación deja un poco por el camino.' },
            { icon: 'cash', label: 'Cambio de divisa al comprar en dólares', bin: 0, why: 'Cobra en cada compra en otra moneda.' },
            { icon: 'repeat', label: 'Pago por flujo de órdenes (PFOF)', bin: 0, why: 'Un intermediario le paga por cada orden que le envía.' },
            { icon: 'piggy', label: 'Intereses del efectivo que no te remunera', bin: 1, why: 'Tu dinero parado le rinde a él.' },
            { icon: 'deal', label: 'Préstamo de tus acciones a otros', bin: 1, why: 'Cobra por prestarlas, operes o no.' },
            { icon: 'card', label: 'Suscripción premium mensual', bin: 1, why: 'La pagas cada mes, operes o no.' },
          ],
        },
        goal: { text: 'Clasifica las seis fuentes de ingresos.', when: [when('done', '==', 6)] },
        insight: 'Saber de dónde vienen sus ingresos te dice **qué comportamiento te va a fomentar**. El reglamento europeo MiFIR **prohíbe el PFOF** a minoristas. Alemania mantuvo una excepción hasta junio de 2026; desde julio de 2026 está prohibido en toda la UE.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿cobra solo cuando pulsas «comprar»?', mood: 'THINKING' },
          { say: 'Coloca cada fuente de ingresos', mood: 'HAPPY' },
        ],
      }),
      story('Confeti en cada compra', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Mira mi app: confeti en cada compra y una racha de 12 días operando.'),
        say('pablo', 'Este mes ya llevo 40 operaciones de unos 500 €. ¡Y todo gratis!'),
        choose('¿Qué le dices?', [
          opt('¡Sigue así! Si la app te premia, lo haces bien', 'bad', say('lumi', 'La app premia que operes, no que ganes. Cuanto más operas, más gana ella.')),
          opt('El diseño te empuja a operar más de lo que necesita tu plan', 'good', say('lumi', 'Eso. Un plan a 20 años no necesita 40 operaciones al mes.')),
          opt('Cámbiate a otra app con más premios', 'bad', say('lumi', 'Más premios, más empujones a operar.')),
        ]),
        say('lumi', 'Con un 0,2 % de spread, son **480 € al año**, aunque diga «0 € de comisión».'),
        say('lumi', 'Un neobróker autorizado puede ser buena opción. Solo no dejes que decida cuánto operas.'),
        say('lumi', 'Pruébalo: abre tu Historial y cuenta cuántas operaciones hiciste este mes.'),
      ]),
      key('De qué vive un bróker «gratis»', '• **Horquilla y cambio de divisa:** se queda una parte de cada operación.\n• **Efectivo sin remunerar** y **préstamo de valores**.\n• **Productos caros:** cripto, CFD y derivados.\n• **Pago por flujo de órdenes (PFOF):** prohibido en la UE para clientes minoristas; la última excepción venció el 30 de junio de 2026.\n\nQue sea gratis no es malo. Lo que hay que mirar es qué te empuja a hacer.', 'Un neobróker autorizado puede ser buena opción: vigila la horquilla, la divisa y cuánto te hace operar.'),
    ], [
      single('¿Qué es el pago por flujo de órdenes (PFOF)?', ['Una comisión que pagas tú al bróker en cada orden', 'Lo que un intermediario paga al bróker por enviarle tus órdenes', 'Un impuesto sobre las operaciones'], 1, 'Por eso un bróker puede anunciar compraventa a 0 € y aun así ganar con tus órdenes.'),
      tf('En la UE, el pago por flujo de órdenes a clientes minoristas está prohibido, con una excepción temporal que terminó el 30 de junio de 2026.', true, 'Lo establece el Reglamento (UE) 2024/791, que reformó MiFIR.'),
      multi('¿De qué formas puede ganar dinero un neobróker «sin comisiones»? Marca todas.', ['Con el cambio de divisa', 'Con los intereses de tu efectivo', 'Con ayudas públicas de la CNMV', 'Con una comisión fija por cada compra'], [0, 1], 'Con el cambio de divisa y con los intereses del efectivo que no te remunera; también prestando tus acciones, con suscripciones, spreads y productos como cripto o CFD. No cobra comisión fija por compra ni recibe ayudas públicas.'),
      scenario('La app de Pablo le manda notificaciones, confeti en cada compra y retos de «racha». Ya opera 40 veces al mes. ¿Qué le recomiendas pensar?', [['Que siga: si la app lo premia, lo estará haciendo bien', 'La app premia que operes, no que ganes. Cuanto más operas, más costes acumulas.'], ['Que el diseño le empuja a operar más de lo que necesita su plan', 'Bien: un plan a largo plazo no necesita 40 operaciones al mes.'], ['Que cambie a otra app con más premios', 'Más premios, más empujones a operar.']], 1, 'La gamificación sirve al negocio del bróker, no necesariamente a tu plan.'),
      buckets('¿El neobróker gana más si operas mucho o gana aunque no operes?', ['Gana más si operas mucho', 'Gana aunque no operes'], [['Spread en cada compraventa', 0], ['Cambio de divisa en cada compra', 0], ['Intereses del efectivo que no te remunera', 1], ['Suscripción premium mensual', 1], ['Préstamo de tus acciones', 1]], 'Saber de dónde vienen sus ingresos te dice qué comportamiento te va a fomentar.'),
      num('Pablo opera 40 veces al mes, 500 € cada vez, y pierde un 0,2 % en spread por operación. ¿Cuánto le cuesta al año?', 480, '€', '500 × 0,2 % = 1 € por operación × 40 × 12 = 480 € al año, aunque la app diga «0 € de comisión».'),
      timed(tf('Si operar es gratis para ti, el bróker no gana dinero contigo.', false, 'Gana por otras vías: divisa, spread, intereses, préstamo de valores o suscripciones.'), 10),
      fill('El pago por ____ de órdenes es lo que un intermediario paga al bróker por enviarle tus órdenes.', 'flujo', ['volumen', 'cambio', 'riesgo'], 'En inglés, payment for order flow (PFOF).'),
      single('¿Qué deberías comprobar antes que nada de un neobróker?', ['Que esté autorizado', 'Que no cobre comisiones', 'Que tenga muchas acciones para elegir'], 0, 'Es una entidad como cualquier otra: primero la seguridad.'),
      chat(['Me he bajado una app de inversión superchula 😍', 'Es todo gratis y me manda avisos de acciones que suben. ¡Hoy he hecho 8 compras!'], 'Lumi usa una app «gratis» que le manda avisos de acciones que suben, y hoy ha hecho 8 compras. ¿Qué le contestas?', [['¡Genial! Cuanto más operes, más aprendes', 'Más operaciones suele significar más costes y más decisiones impulsivas.'], ['¿Esas 8 compras estaban en tu plan?', '¡Bien! «Gratis» casi nunca es gratis, y las notificaciones no son un plan.'], ['Activa también las alertas de cripto', 'Más alertas, más tentaciones.']], 1, 'Una app puede ser barata y a la vez empujarte a operar demasiado.'),
    ], { source: '12.1', minutes: 6, retire: [1, 3, 4, 5, 6] }),

    lesson('u33l4', 'Robo-advisors y gestión automatizada', [
      // Auditoría RED-5 y RED-20: la pieza de comisiones salía por sexta vez. Entra lo propio: el test de idoneidad
      // (obligatorio en la gestión de carteras, MiFID II: Directiva 2014/65/UE, art. 25.2).
      story('Antes de invertir, un test', [{ id: 'elena', name: 'Elena' }], [
        say('elena', 'El robo-advisor me ha hecho un test: edad, ingresos, para cuándo quiero el dinero y qué haría si mi cartera cayera un 20 %.'),
        say('elena', 'He puesto que vendería todo. Pero quiero la cartera más agresiva, que es la que más gana.'),
        choose('¿Qué hará un robo-advisor autorizado?', [
          opt('Darle la más agresiva: ella manda', 'bad', say('lumi', 'No puede: tiene que ofrecerle una cartera idónea para su perfil.')),
          opt('Asignarle una cartera más prudente, acorde con sus respuestas', 'good', say('lumi', 'Eso es el **test de idoneidad**: la cartera se ajusta a lo que puedes y quieres aguantar.')),
          opt('Rechazarla como clienta', 'bad', say('lumi', 'No hace falta: le propondrá una cartera con menos bolsa.')),
        ]),
        say('elena', '¿Y si miento en el test para que me den más bolsa?'),
        say('lumi', 'Te engañas a ti: en la primera caída tendrás una cartera que no aguantas.'),
      ]),
      story('Laura y la caída de 2022', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'No tengo tiempo y nunca me acuerdo de rebalancear.'),
        say('laura', 'Y en 2022 vendí en plena caída. Todavía me arrepiento.'),
        say('laura', '¿Me cojo un robo-advisor o monto yo mi cartera indexada?'),
        choose('¿Qué le dices?', [
          opt('Móntala tú: es más barato y punto', 'ok', say('lumi', 'Más barato sobre el papel. Pero sus errores le costaron más que la comisión.')),
          opt('El robo-advisor puede compensarte si te evita esos errores', 'good', say('lumi', 'Bien: paga algo más por disciplina automática. Clave: no abandonarlo en una caída.')),
          opt('Mejor un fondo activo del banco al 1,8 %', 'bad', say('lumi', 'Más caro que las dos opciones y, de media, peor que su índice.')),
        ]),
        say('lumi', 'Ojo: un robo-advisor **no elimina el riesgo**. Si cae el mercado, cae tu cartera.'),
      ]),
      key('Qué es un robo-advisor', 'Un servicio de **gestión automatizada**: respondes un cuestionario (el **test de idoneidad**), te asigna una cartera de fondos indexados según tu perfil y se encarga de aportar y **rebalancear** por ti.\n\nEn España tiene que ser una entidad **autorizada por la CNMV**.', 'Un robo-advisor automatiza la disciplina, pero cobra por ello y no elimina el riesgo de mercado.', 'Pruébalo: en tu Cartera, mira el peso de cada activo; un robo-advisor lo reajusta solo.'),
    ], [
      match('Empareja cada forma de invertir con su descripción.', [['Robo-advisor', 'Cartera automática de indexados según un test'], ['Hacerlo tú', 'Eliges y compras tus fondos indexados'], ['Fondo activo', 'Un gestor elige valores para batir al índice'], ['Gestión discrecional', 'Delegas las decisiones en una entidad autorizada']], 'El robo-advisor es una gestión discrecional automatizada y, normalmente, indexada.'),
      single('¿Qué hace un robo-advisor después de tu test de perfil?', ['Te recomienda las acciones de moda de cada mes', 'Te asigna una cartera de indexados y la rebalancea por ti', 'Te garantiza una rentabilidad'], 1, 'Automatiza el reparto, las aportaciones y el rebalanceo.'),
      num('10.000 € a 30 años con un mercado al 7 % (ejemplo). Con un robo-advisor al 0,6 % total te quedan unos 64.306 €; haciéndolo tú al 0,2 %, unos 71.968 €. ¿Cuánto cuesta la comodidad?', 7662, '€', '71.968 − 64.306 = 7.662 €. Merece la pena solo si te evita errores que costarían más.', 1),
      tf('Un robo-advisor elimina el riesgo de que tu cartera caiga.', false, 'Reparte y rebalancea, pero si cae el mercado, cae tu cartera.'),
      scenario('Laura no tiene tiempo, nunca se acuerda de rebalancear y en 2022 vendió en plena caída. Duda entre un robo-advisor y montar ella su cartera indexada. ¿Qué tiene más sentido?', [['Montarla ella: es más barato y punto', 'Más barato sobre el papel, pero sus errores pasados le salieron más caros que la comisión.'], ['El robo-advisor puede compensarle si le ayuda a no repetir esos errores', 'Bien: paga un poco más a cambio de disciplina automática. Lo clave es que no lo abandone en una caída.'], ['Un fondo activo del banco al 1,8 %', 'Más caro que las dos opciones y, de media, peor que su índice.']], 1, 'El coste importa, pero los errores de comportamiento pueden costar aún más.'),
      buckets('¿Es ventaja del robo-advisor o de hacerlo tú?', ['Ventaja del robo-advisor', 'Ventaja de hacerlo tú'], [['Rebalancea automáticamente', 0], ['Costes totales más bajos', 1], ['No tienes que decidir qué fondos comprar', 0], ['Control total sobre cada producto', 1], ['Te quita la tentación de tocar la cartera', 0]], 'Comodidad y disciplina frente a coste y control.'),
      timed(tf('En España, un robo-advisor tiene que ser una entidad autorizada por la CNMV.', true, 'Gestionar carteras es un servicio de inversión regulado.'), 10),
      multi('¿Qué deberías mirar antes de contratar un robo-advisor? Marca todo.', ['Que esté autorizado por la CNMV', 'El coste total: gestión más fondos', 'Que haya ganado más que nadie el último año', 'Que prometa la mayor rentabilidad'], [0, 1], 'El coste total (gestión más fondos) y que esté autorizado por la CNMV; también qué fondos usa y cómo rebalancea. Nadie serio promete rentabilidades, y haber ganado más el último año no dice nada del siguiente.'),
      fill('El cuestionario que mide tus conocimientos, objetivos y tolerancia al riesgo antes de gestionar tu dinero se llama test de ____.', 'idoneidad', ['conveniencia', 'Turing', 'estrés'], 'Lo exige la normativa europea MiFID para el asesoramiento y la gestión de carteras.'),
      chat(['¿Me cojo un robo-advisor o lo hago yo? 🤖', 'No quiero estar pendiente de la bolsa.'], 'Lumi no quiere estar pendiente de la bolsa y duda entre un robo-advisor o hacerlo ella. ¿Qué le contestas?', [['Robo-advisor siempre, los robots no se equivocan', 'Los robots siguen reglas, pero el mercado puede caer igual. Y cobran por el servicio.'], ['Depende de si vas a ser constante', '¡Eso! Compara el coste extra con los errores que te evitaría.'], ['Ninguno, mejor un fondo de banco con gestor', 'Suele ser la opción más cara y, de media, rinde menos que su índice.']], 1, 'No hay una respuesta única: coste frente a disciplina.'),
      num('Un robo-advisor cobra en total un 0,6 % al año. Con 10.000 € invertidos, ¿cuánto pagas al año?', 60, '€', '10.000 × 0,006 = 60 €. Haciéndolo tú con indexados al 0,2 % serían 20 €: la diferencia es lo que pagas por que lo haga por ti.'),
    ], { minutes: 6, retire: [2, 3, 4, 6] }),

    // Auditoría FAL-10 (y FAL-12): el primer día con dinero real, paso a paso, y lo que el simulador no enseña
    // (las emociones y todos los costes). Sin cifras nuevas. Al final de la unidad para no cambiar qué abre cada plan.
    lesson('u33l5', 'Tu primer día con dinero real', [
      story('Del simulador a tu cuenta', [{ id: 'dani', name: 'Dani' }], [
        say('dani', 'Llevo seis meses ganando en el simulador. Mañana abro una cuenta de verdad y paso **todos mis ahorros**.'),
        say('lumi', 'El simulador te ha enseñado cómo funciona. Hay dos cosas que no puede enseñarte.'),
        choose('¿Cuáles son?', [
          opt('Cómo se pone una orden y cómo se lee un gráfico', 'bad', say('lumi', 'Eso sí lo has practicado aquí, y funciona igual.')),
          opt('Lo que se siente al perder dinero tuyo y lo que cuesta de verdad operar', 'good', say('lumi', 'Eso. Aquí perder no duele, y no pagas todas las comisiones ni impuestos.')),
          opt('Nada: si gano aquí, ganaré fuera', 'bad', say('lumi', 'Con dinero real el miedo y la prisa cambian cómo decides.')),
        ]),
        say('lumi', 'Por eso el primer día se empieza **con poco**: para conocer el proceso y conocerte a ti.'),
      ]),
      story('El primer día, paso a paso', [{ id: 'elena', name: 'Elena' }], [
        say('elena', 'Ya he comprobado que mi bróker está autorizado. Ahora me pide el DNI y un montón de datos. ¿Es normal?'),
        say('lumi', 'Sí: una entidad autorizada **tiene que identificarte**. Desconfía de la que no te pida nada.'),
        say('elena', 'También me ofrece un test para operar con productos «complejos».'),
        choose('¿Para qué sirve ese test?', [
          opt('Para ver si entiendes esos productos antes de usarlos', 'good', say('lumi', 'Es el **test de conveniencia**. Si no los entiendes, lo sensato es no operarlos.')),
          opt('Para saber cuánto dinero tienes', 'bad', say('lumi', 'No mide tu dinero: mide si conoces el producto y sus riesgos.')),
          opt('Es un trámite: se contesta lo que haga falta para pasarlo', 'bad', say('lumi', 'Si lo pasas mintiendo, operarás algo que no entiendes. Te engañas a ti.')),
        ]),
        say('lumi', 'Después: una **transferencia pequeña** desde una cuenta a tu nombre y una **primera compra pequeña**.'),
        say('lumi', 'Y guarda la confirmación. La necesitarás para saber qué pagaste y para la renta.'),
        note('Para comprar acciones o fondos sencillos no hace falta ese test. Sí se exige para productos complejos, como los derivados (MiFID II).'),
      ]),
      key('Tu primer día, en cinco pasos', '1. **Comprueba** que la entidad está autorizada.\n2. **Abre la cuenta** e identifícate.\n3. **Transfiere poco** desde una cuenta a tu nombre.\n4. **Haz una compra pequeña** y mira lo que te cobran de verdad.\n5. **Guarda** la confirmación de cada operación y el resumen fiscal de cada año.\n\nEl simulador no reproduce dos cosas: **tus emociones** con dinero real y **todos los costes** (comisiones, cambio de divisa e impuestos). Por eso se empieza con poco y con el mismo plan que aquí.', 'El primer día no se trata de ganar: se trata de aprender el proceso con poco dinero.', 'Pruébalo: repasa tu diario del simulador y apunta qué regla te costaría más cumplir con dinero real.'),
    ], [
      order('Ordena los pasos de tu primer día con dinero real.', ['Comprobar que la entidad está autorizada', 'Abrir la cuenta e identificarte', 'Transferir un importe pequeño', 'Hacer una primera compra pequeña', 'Guardar la confirmación'], 'Primero la seguridad, después el dinero, y al final guardar lo que prueba cada operación.'),
      scenario('Dani lleva seis meses ganando en el simulador. Mañana abre una cuenta real y quiere transferir todos sus ahorros. ¿Qué le dirías?', [['Que adelante: seis meses ganando lo demuestran', 'En el simulador no arriesgaba nada suyo. Con dinero real se decide distinto.'], ['Que empiece con una parte pequeña y el mismo plan', 'Bien: así conoce el proceso y sus propias reacciones sin jugarse sus ahorros.'], ['Que espere un año más en el simulador', 'Más tiempo de simulador no le enseñará lo que solo enseña el dinero real. Mejor empezar con poco.']], 1, 'El simulador enseña cómo funciona el mercado. Cómo reaccionas tú cuando el dinero es tuyo solo lo aprendes con poco dinero real.'),
      tf('En el simulador se siente lo mismo que al invertir dinero real.', false, 'Perder dinero virtual no duele. Con dinero real aparecen el miedo y la prisa, y cambian las decisiones.'),
      buckets('¿Lo reproduce el simulador?', ['Sí lo reproduce', 'No lo reproduce'], [['Cómo funciona una orden', 0], ['El miedo a perder tu dinero', 1], ['Cómo se mueve el precio', 0], ['Todas las comisiones e impuestos', 1], ['Cómo se calcula una ganancia', 0], ['La prisa por recuperar una pérdida', 1]], 'La mecánica es la misma. Lo que cambia eres tú, y los costes reales.'),
      multi('¿Qué conviene guardar de tu cuenta real? Marca todo.', ['La confirmación de cada compra y venta', 'Una captura del precio de cada día', 'El resumen fiscal anual del bróker', 'Los mensajes de un grupo de inversión'], [0, 2], 'Las confirmaciones y el resumen fiscal dicen qué compraste, cuándo y a qué precio: lo necesitas para tus cuentas y para la renta. El precio de cada día y lo que digan otros no prueban nada tuyo.'),
      single('¿Para qué sirve el test de conveniencia?', ['Para comprobar que tienes dinero suficiente', 'Para ver si entiendes un producto complejo antes de operarlo', 'Para decidir qué acciones te convienen'], 1, 'Mide tus conocimientos y experiencia con ese producto. No es un examen que haya que aprobar: es un aviso.'),
      chat(['¡Ya tengo la cuenta abierta! 🎉', '¿Meto todo hoy y compro lo que más está subiendo?'], 'Lumi acaba de abrir su cuenta real y quiere meter todo hoy y comprar lo que más está subiendo. ¿Qué le contestas?', [['Sí: cuanto antes entres, antes ganas', 'Entrar con todo y persiguiendo lo que sube es empezar con las dos prisas a la vez.'], ['Empieza con poco y con lo que decía tu plan', '¡Eso! El primer día es para aprender el proceso, no para ganar.'], ['Mete la mitad hoy y la otra mitad mañana', 'Repartirlo en dos días no cambia nada: sigue siendo todo, y sin plan.']], 1, 'El primer día se empieza con un importe pequeño y con el plan que ya tenías. Lo que más sube hoy no estaba en ese plan.'),
      fill('La primera transferencia a tu bróker conviene hacerla desde una cuenta a tu ____.', 'nombre', ['alcance', 'gusto', 'cargo'], 'Lo habitual es que el bróker solo acepte dinero de cuentas del propio titular. Es también una protección frente al fraude.'),
      scenario('Haces tu primera compra real. Al día siguiente cae un 3 % y sientes ganas de vender. ¿Qué haces?', [['Vendo: no quiero empezar perdiendo', 'Un 3 % en un día es ruido. Vender por eso es dejar que decida el susto.'], ['Releo mi plan: no ha cambiado nada', 'Eso es. Lo que sientes es justo lo que el simulador no enseñaba, y para eso está el plan.'], ['Compro más para compensar', 'Aumentar por un impulso es tan poco plan como vender por un susto.']], 1, 'La primera caída con dinero real impresiona. Si tu plazo y tu plan no han cambiado, no hay nada que hacer.'),
    ], { minutes: 6 }),
  ],
})
