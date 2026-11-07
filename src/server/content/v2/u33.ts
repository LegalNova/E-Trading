import 'server-only'
// Sección 11 · Unidad 33 · Elegir dónde invertir (docs/curso-v2/02-curriculo.md)
// Pago por flujo de órdenes: prohibido en la UE por el Reglamento (UE) 2024/791 (MiFIR), con excepción nacional hasta el 30/06/2026.
import { buckets, chat, choose, fill, key, lesson, match, multi, num, opt, order, play, say, scenario, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u33', order: 33, title: 'Elegir dónde invertir', description: 'Brókers seguros, comisiones, neobrókers y robo-advisors: cómo comparar sin caer en trampas',
  lessons: [
    lesson('u33l1', 'Cómo elegir un bróker', [
      story('Un bróker con regalo', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', '¡He encontrado un bróker con comisiones cero y te duplican el primer ingreso!'),
        say('pablo', 'Lo he buscado en la CNMV y no sale. Pero la web es superprofesional.'),
        choose('¿Qué le dices?', [
          opt('Aprovecha el bono, es dinero gratis', 'bad', say('lumi', 'Los bonos son el cebo típico. Sin autorización, no tienes ninguna protección.')),
          opt('Descártalo: sin autorización, no hay nada que comparar', 'good', say('lumi', '¡Eso! El primer filtro es la autorización. Las comisiones vienen después.')),
          opt('Prueba con poco y, si va bien, mete más', 'ok', say('lumi', 'Muchas estafas dejan ganar al principio para que aportes más.')),
        ]),
        say('lumi', 'Un bróker barato pero no autorizado es el más caro: puedes perderlo todo.'),
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
      multi('¿Qué compruebas antes de abrir una cuenta? Marca todo.', ['Que esté autorizado en los registros de la CNMV', 'Qué fondo de garantía le protege', 'Sus comisiones de compraventa, custodia y divisa', 'Cuántos seguidores tiene en redes'], [0, 1, 2], 'La popularidad en redes no dice nada sobre su seguridad.'),
      single('¿Qué es lo primero que debes comprobar de un bróker?', ['Que tenga la app más bonita', 'Que esté autorizado por la CNMV o un supervisor europeo con pasaporte', 'Que sea el más barato'], 1, 'Sin autorización, todo lo demás da igual.'),
      single('¿Qué cubre el FOGAIN?', ['Las pérdidas cuando cae la bolsa', 'Hasta 100.000 € si una entidad adherida no puede devolverte tu dinero o tus valores', 'Todo lo que inviertas, sin límite'], 1, 'Protege frente a fallos de la entidad, no frente a la evolución del mercado.'),
      tf('Un bróker extranjero suele retener impuestos por ti y enviar tus datos a Hacienda.', false, 'Normalmente no: te toca declarar todas las operaciones, y quizá presentar el modelo 720.'),
      scenario('Un bróker que no aparece en los registros de la CNMV te ofrece comisiones cero y un bono del 100 % de tu primer ingreso. ¿Qué haces?', [['Aprovecho el bono, es dinero gratis', 'Los bonos son el cebo típico, y sin autorización no tienes ninguna protección.'], ['Lo descarto: si no está autorizado, no hay nada que comparar', 'Bien: el primer filtro es la autorización. Las comisiones vienen después.'], ['Pruebo con poco y si va bien meto más', 'Muchas estafas dejan ganar al principio para que aportes más.']], 1, 'Sin autorización, una comisión cero puede costarte todo.'),
      buckets('¿Es más típico de un bróker español o de uno extranjero?', ['Bróker español', 'Bróker extranjero'], [['Retiene el 19 % y envía tus datos a Hacienda', 0], ['Te toca declarar tú todas las operaciones', 1], ['Puede obligarte a presentar el modelo 720', 1], ['La declaración de la renta sale casi hecha', 0]], 'La comodidad fiscal también cuenta al comparar.'),
      fill('El FOGAIN cubre hasta ____ € por inversor.', '100.000', ['20.000', '50.000', '1.000.000'], 'Si una entidad adherida no puede devolver tu dinero o tus valores.'),
      timed(tf('Tus acciones y ETF están separados del patrimonio del bróker.', true, 'Son tuyos: si el bróker quiebra, deberían devolvértelos.'), 10),
      match('Empareja cada término con su significado.', [['CNMV', 'Supervisor de los servicios de inversión en España'], ['FOGAIN', 'Fondo que cubre si una entidad no te devuelve lo tuyo'], ['Pasaporte europeo', 'Permiso para operar en España estando autorizado en otro país de la UE'], ['Modelo 720', 'Declaración de valores y cuentas en el extranjero']], 'Cuatro palabras que te ayudan a juzgar un bróker.'),
    ], { source: '12.1', minutes: 6, retire: [2, 4, 5, 8] }),

    lesson('u33l2', 'Las comisiones de un bróker', [
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
      play({
        title: 'Lo pequeño se compone',
        intro: 'Ana aporta **100 € al mes** durante 30 años, con un mercado del 7 % anual (ejemplo). Con unos costes totales del 0,2 % al año… o algo más.',
        widget: { kind: 'fees', amount: 0, monthly: 100, gross: 7, feeA: 0.2, feeB: 0.5, years: 30, maxFee: 2, maxYears: 40 },
        predict: {
          prompt: 'Pagar un 0,3 % más al año durante 30 años, ¿cuánto le cuesta a Ana?',
          options: ['Unos 60 €', 'Unos 6.000 €', 'Unos 60.000 €'],
          answer: 1,
          why: '**6.020 €** menos: 106.703 € frente a 112.722 €. Poco cada año, mucho compuesto.',
        },
        goal: { text: 'Pon un coste del 1,5 %, como el de muchos fondos activos de banco.', when: [when('feeB', '>=', 1.49)] },
        insight: 'Con un 1,5 % al año, los costes se llevan **23.630 €**, más de una quinta parte. Mira **todos** los costes: compraventa, custodia, divisa, inactividad y el TER de cada fondo.',
        lumi: [
          { when: when('lostPct', '>=', 20), say: 'Una quinta parte de todo, en comisiones. ¡Sin hacer nada!', mood: 'WORRIED' },
          { when: when('years', '<=', 5), say: 'A pocos años apenas se nota. Sube los años.', mood: 'THINKING' },
          { say: 'Sube el coste y mira cuánto se lleva', mood: 'HAPPY' },
        ],
      }),
      key('Qué te cobran', '• **Compraventa:** por cada operación (fija, porcentual o mixta).\n• **Custodia:** por guardar tus valores, a veces mensual o anual.\n• **Cambio de divisa:** al comprar en otra moneda. Suele ser el **coste oculto más alto**: del 0,1 % al 0,5 % o más por operación.\n• **Otras:** inactividad, retirada, cobro de dividendos.\n\nY dentro de cada fondo o ETF, su **TER**.', 'El bróker más barato es el que menos te cobra a ti, con tu forma de invertir.', 'Pruébalo: en Mercado, prepara una compra de 100 € y mira la comisión simulada.'),
    ], [
      num('Pagas 5 € de comisión fija por comprar 100 € de un ETF. ¿Qué porcentaje se va en comisión?', 5, '%', '5 ÷ 100 = 5 %. Tendrías que ganar un 5 % solo para empatar.'),
      num('Compras 2.000 € de acciones de EE. UU. y el bróker cobra un 0,5 % por el cambio de divisa. ¿Cuántos euros pagas solo por cambiar?', 10, '€', '2.000 × 0,005 = 10 €. Y al vender pagarías otra vez.'),
      num('Un bróker cobra un 0,2 % anual de custodia. Tienes 20.000 €. ¿Cuánto pagas al año?', 40, '€', '20.000 × 0,002 = 40 € al año, suba o baje tu cartera.'),
      match('Empareja cada comisión con lo que cobra.', [['Compraventa', 'Cada vez que compras o vendes'], ['Custodia', 'Guardar tus valores'], ['Cambio de divisa', 'Pasar de euros a otra moneda'], ['Inactividad', 'No operar durante un tiempo']], 'Mira todas, no solo la que anuncian en grande.'),
      single('¿Cuál suele ser el coste oculto más alto al comprar acciones en otra moneda?', ['La custodia', 'El cambio de divisa', 'La cuota de la app'], 1, 'Del 0,1 % al 0,5 % o más por operación, y a veces no aparece en la portada.'),
      scenario('Ana aporta 100 € al mes. El bróker A cobra 3 € fijos por compra; el B, un 0,5 % sin mínimo. ¿Cuál le sale más barato?', [['El A: 3 € es poco', 'Sobre 100 € son un 3 %: 36 € al año.'], ['El B: le cuesta 0,50 € por compra', 'Exacto: 6 € al año frente a 36 €. Con una compra única de 10.000 €, en cambio, ganaría el A (3 € frente a 50 €).'], ['Los dos cuestan lo mismo', 'Con 100 € al mes, no: 0,50 € frente a 3 €.']], 1, 'La comisión que más te conviene depende del tamaño de tus compras.'),
      tf('Si un bróker anuncia «0 € de comisión», invertir con él no tiene ningún coste.', false, 'Puede cobrar por el cambio de divisa, el spread, la custodia o ganar con otras vías.'),
      buckets('¿Se paga por operación o cada año?', ['En cada operación', 'Cada año'], [['Comisión de compraventa', 0], ['Custodia', 1], ['Cambio de divisa', 0], ['TER de un fondo', 1], ['Spread entre compra y venta', 0]], 'Los costes por operación castigan operar mucho; los anuales, mantener caro.'),
      timed(single('Rápido: ¿dónde encuentras el coste anual (TER) de un fondo o ETF?', ['En el KID, el documento de datos fundamentales', 'En su cuenta de Instagram', 'En tu declaración de la renta'], 0, 'Es obligatorio y está estandarizado para poder comparar.'), 12),
      order('Compra única de 100 €. Ordena de más barato a más caro.', ['0,1 % sin mínimo (0,10 €)', '0,5 % sin mínimo (0,50 €)', '2 € fijos', '5 € fijos'], 'Con importes pequeños, las comisiones fijas pesan muchísimo.'),
      scenario('Vas a aportar 100 € cada mes a un ETF que cotiza en dólares. Un bróker anuncia en grande «0 € de comisión». ¿Qué haces antes de elegirlo?', [['Lo elijo: 0 € no se puede mejorar', 'La compraventa puede ser gratis y el coste estar en el cambio de divisa o la custodia. El «0 €» en grande no dice nada de la letra pequeña.'], ['Miro también cuánto cobra por cambiar divisa y por custodia', 'Bien: si compras en dólares cada mes, el cambio de divisa puede ser tu coste más alto aunque la compraventa sea gratis.'], ['Elijo el que más anuncios hace, que será el más fiable', 'La publicidad no dice nada de lo que te cobran a ti ni de si está autorizado.']], 1, 'El bróker más barato es el que menos te cobra con tu forma de invertir: suma todos los costes. La tentadora, «0 €», falla porque solo mira una comisión.'),
    ], { source: '12.1', minutes: 6, retire: [0, 1, 2, 6, 8, 9] }),

    lesson('u33l3', 'Neobrókers: cómo ganan dinero', [
      play({
        title: '«0 € de comisión»',
        intro: 'Tu app no cobra comisión. Pero compras al mejor precio de **venta** y vendes al mejor de **compra**: mira este libro de órdenes de ejemplo.',
        widget: {
          kind: 'book', size: 100, maxSize: 3000,
          bids: [{ price: 9.98, size: 500 }, { price: 9.97, size: 800 }, { price: 9.96, size: 1200 }, { price: 9.95, size: 2000 }],
          asks: [{ price: 10, size: 300 }, { price: 10.01, size: 600 }, { price: 10.02, size: 1000 }, { price: 10.04, size: 2000 }],
        },
        predict: {
          prompt: 'Compras 100 acciones y las vendes al momento. ¿Qué pierdes?',
          options: ['Nada: la comisión es 0 €', 'La diferencia entre el precio de compra y el de venta', 'Siempre un 5 %'],
          answer: 1,
          why: 'Compras a 10,00 y solo podrías vender a 9,98: el **spread**, un **0,2 %**, se queda por el camino.',
        },
        goal: { text: 'Haz una compra grande: busca un tamaño con el que tu precio medio suba más de un 0,1 %.', when: [when('slippagePct', '>', 0.1)] },
        insight: 'El **spread** es un coste aunque la app diga «0 €», y en órdenes grandes se suma el **deslizamiento**. Además, un intermediario puede pagarle al bróker por enviarle tus órdenes: el **pago por flujo de órdenes** (PFOF).',
        lumi: [
          { when: when('slippagePct', '>', 0.1), say: 'Tu orden se come varios precios del libro: pagas más de media.', mood: 'THINKING' },
          { say: 'Mira la diferencia entre comprar y vender', mood: 'HAPPY' },
        ],
      }),
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
        insight: 'Saber de dónde vienen sus ingresos te dice **qué comportamiento te va a fomentar**. El reglamento europeo MiFIR (2024) **prohíbe el PFOF** a minoristas, con una excepción en algunos países hasta el 30 de junio de 2026.',
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
    ], [
      single('¿Qué es el pago por flujo de órdenes (PFOF)?', ['Una comisión que pagas tú al bróker', 'Lo que un intermediario paga al bróker por enviarle tus órdenes', 'Un impuesto sobre las operaciones'], 1, 'Por eso un bróker puede anunciar compraventa a 0 € y aun así ganar con tus órdenes.'),
      tf('En la UE, el pago por flujo de órdenes a clientes minoristas está prohibido, con una excepción temporal que terminó el 30 de junio de 2026.', true, 'Lo establece el Reglamento (UE) 2024/791, que reformó MiFIR.'),
      multi('¿De qué formas puede ganar dinero un neobróker «sin comisiones»? Marca todas.', ['Con el cambio de divisa', 'Con los intereses del efectivo que no te remunera', 'Prestando tus acciones a otros', 'Regalando dinero a sus clientes'], [0, 1, 2], 'Y también con suscripciones, spreads y productos como cripto o CFD.'),
      scenario('La app de Pablo le manda notificaciones, confeti en cada compra y retos de «racha». Ya opera 40 veces al mes. ¿Qué le recomiendas pensar?', [['Que siga: si la app lo premia, lo estará haciendo bien', 'La app premia que operes, no que ganes. Cuanto más operas, más costes acumulas.'], ['Que el diseño le empuja a operar más de lo que necesita su plan', 'Bien: un plan a largo plazo no necesita 40 operaciones al mes.'], ['Que cambie a otra app con más premios', 'Más premios, más empujones a operar.']], 1, 'La gamificación sirve al negocio del bróker, no necesariamente a tu plan.'),
      buckets('¿El neobróker gana más si operas mucho o gana aunque no operes?', ['Gana más si operas mucho', 'Gana aunque no operes'], [['Spread en cada compraventa', 0], ['Cambio de divisa en cada compra', 0], ['Intereses del efectivo que no te remunera', 1], ['Suscripción premium mensual', 1], ['Préstamo de tus acciones', 1]], 'Saber de dónde vienen sus ingresos te dice qué comportamiento te va a fomentar.'),
      num('Pablo opera 40 veces al mes, 500 € cada vez, y pierde un 0,2 % en spread por operación. ¿Cuánto le cuesta al año?', 480, '€', '500 × 0,2 % = 1 € por operación × 40 × 12 = 480 € al año, aunque la app diga «0 € de comisión».'),
      timed(tf('Si operar es gratis para ti, el bróker no gana dinero contigo.', false, 'Gana por otras vías: divisa, spread, intereses, préstamo de valores o suscripciones.'), 10),
      fill('El pago por ____ de órdenes es lo que un intermediario paga al bróker por enviarle tus órdenes.', 'flujo', ['volumen', 'cambio', 'riesgo'], 'En inglés, payment for order flow (PFOF).'),
      single('¿Qué deberías comprobar antes que nada de un neobróker?', ['Que esté autorizado y qué fondo de garantía te protege', 'Que tenga modo oscuro', 'Que dé más confeti'], 0, 'Es una entidad como cualquier otra: primero la seguridad.'),
      chat(['Me he bajado una app de inversión superchula 😍', 'Es todo gratis y me manda avisos de acciones que suben. ¡Hoy he hecho 8 compras!'], '¿Qué le contestas a Lumi?', [['¡Genial! Cuanto más operes, más aprendes', 'Más operaciones suele significar más costes y más decisiones impulsivas.'], ['Mira cómo gana dinero la app y si esas 8 compras estaban en tu plan', '¡Bien! «Gratis» casi nunca es gratis, y las notificaciones no son un plan.'], ['Activa también las alertas de cripto', 'Más alertas, más tentaciones.']], 1, 'Una app puede ser barata y a la vez empujarte a operar demasiado.'),
    ], { source: '12.1', minutes: 6, retire: [1, 3, 4, 5, 6] }),

    lesson('u33l4', 'Robo-advisors y gestión automatizada', [
      play({
        title: '¿Cuánto cuesta la comodidad?',
        intro: 'Una app te ofrece invertir tus **10.000 €** por ti, sin que tengas que pensar. Cobra un **0,6 %** al año entre gestión y fondos; hacerlo tú con indexados, un **0,2 %**. A 30 años y con un mercado del 7 % anual (ejemplo), ¿compensa?',
        widget: { kind: 'fees', amount: 10000, monthly: 0, gross: 7, feeA: 0.2, feeB: 0.6, years: 30, maxFee: 2, maxYears: 40 },
        predict: {
          prompt: 'A 30 años, ¿cuánto te cuesta el robo-advisor frente a hacerlo tú?',
          options: ['Unos 700 €', 'Unos 7.700 €', 'Unos 30.000 €'],
          answer: 1,
          why: '**7.662 €**: 71.968 € frente a 64.306 €. Merece la pena solo si te evita errores que costarían más.',
        },
        goal: { text: 'Ahora pon el coste de muchos fondos activos de banco: un 1,5 %.', when: [when('feeB', '>=', 1.49)] },
        insight: 'Un robo-advisor suele costar entre un **0,4 % y un 1 %** al año en total: más que hacerlo tú (≈ 0,1-0,3 %) y menos que muchos fondos activos (1,5 % o más). Con un 1,5 %, se van **22.128 €**, casi un tercio.',
        lumi: [
          { when: when('feeB', '>=', 1.49), say: 'Casi un tercio de todo se va en costes.', mood: 'WORRIED' },
          { say: 'Mueve el coste y mira la diferencia', mood: 'HAPPY' },
        ],
      }),
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
      single('¿Qué hace un robo-advisor después de tu test de perfil?', ['Te recomienda acciones de moda', 'Te asigna una cartera de indexados y la rebalancea por ti', 'Te garantiza una rentabilidad'], 1, 'Automatiza el reparto, las aportaciones y el rebalanceo.'),
      num('10.000 € a 30 años con un mercado al 7 % (ejemplo). Con un robo-advisor al 0,6 % total te quedan unos 64.306 €; haciéndolo tú al 0,2 %, unos 71.968 €. ¿Cuánto cuesta la comodidad?', 7662, '€', '71.968 − 64.306 = 7.662 €. Merece la pena solo si te evita errores que costarían más.', 1),
      tf('Un robo-advisor elimina el riesgo de que tu cartera caiga.', false, 'Reparte y rebalancea, pero si cae el mercado, cae tu cartera.'),
      scenario('Laura no tiene tiempo, nunca se acuerda de rebalancear y en 2022 vendió en plena caída. Duda entre un robo-advisor y montar ella su cartera indexada. ¿Qué tiene más sentido?', [['Montarla ella: es más barato y punto', 'Más barato sobre el papel, pero sus errores pasados le salieron más caros que la comisión.'], ['El robo-advisor puede compensarle si le ayuda a no repetir esos errores', 'Bien: paga un poco más a cambio de disciplina automática. Lo clave es que no lo abandone en una caída.'], ['Un fondo activo del banco al 1,8 %', 'Más caro que las dos opciones y, de media, peor que su índice.']], 1, 'El coste importa, pero los errores de comportamiento pueden costar aún más.'),
      buckets('¿Es ventaja del robo-advisor o de hacerlo tú?', ['Ventaja del robo-advisor', 'Ventaja de hacerlo tú'], [['Rebalancea automáticamente', 0], ['Costes totales más bajos', 1], ['No tienes que decidir qué fondos comprar', 0], ['Control total sobre cada producto', 1], ['Te quita la tentación de tocar la cartera', 0]], 'Comodidad y disciplina frente a coste y control.'),
      timed(tf('En España, un robo-advisor tiene que ser una entidad autorizada por la CNMV.', true, 'Gestionar carteras es un servicio de inversión regulado.'), 10),
      multi('¿Qué deberías mirar antes de contratar un robo-advisor? Marca todo.', ['Que esté autorizado por la CNMV', 'El coste total: gestión más fondos', 'Qué fondos usa y cómo rebalancea', 'Que prometa la mayor rentabilidad'], [0, 1, 2], 'Nadie serio promete rentabilidades.'),
      fill('El cuestionario que mide tus conocimientos, objetivos y tolerancia al riesgo antes de gestionar tu dinero se llama test de ____.', 'idoneidad', ['conveniencia', 'Turing', 'estrés'], 'Lo exige la normativa europea MiFID para el asesoramiento y la gestión de carteras.'),
      chat(['¿Me cojo un robo-advisor o lo hago yo? 🤖', 'No quiero estar pendiente de la bolsa.'], '¿Qué le contestas a Lumi?', [['Robo-advisor siempre, los robots no se equivocan', 'Los robots siguen reglas, pero el mercado puede caer igual. Y cobran por el servicio.'], ['Depende: si vas a ser constante, tú es más barato; si no, el robot te ayuda a no fallar', '¡Eso! Compara el coste extra con los errores que te evitaría.'], ['Ninguno, mejor un fondo de banco con gestor', 'Suele ser la opción más cara y, de media, rinde menos que su índice.']], 1, 'No hay una respuesta única: coste frente a disciplina.'),
    ], { minutes: 6, retire: [2, 3, 4, 6] }),
  ],
})
