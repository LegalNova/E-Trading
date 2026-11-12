import 'server-only'
// Sección 1 · Unidad 3 · Deudas y crédito (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, multi, num, opt, order, play, say, scenario, single, spot, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u3', order: 3, title: 'Deudas y crédito', description: 'Cuánto cuesta de verdad una deuda, cuáles evitar y por qué la cara va antes que invertir',
  lessons: [
    lesson('u3l1', 'TIN, TAE y el coste real de un préstamo', [
      story('«Solo 149 € al mes»', [{ id: 'vendedor', name: 'Vendedor' }], [
        say('vendedor', 'Este coche te lo llevas hoy por **solo 149 € al mes**. ¿Firmamos?'),
        choose('¿Qué preguntas antes de firmar?', [
          opt('¿Dónde firmo? 149 € me cuadra', 'bad', say('lumi', 'La cuota sola no dice nada. ¿Durante cuántos meses? ¿Con qué interés? ¿Cuánto pagas en total?')),
          opt('¿Cuántos meses, qué interés y cuánto pago en total?', 'good', say('lumi', '¡Perfecto! Con esas cifras ya puedes comparar con otras ofertas.')),
          opt('¿Me lo dejan en 129 €?', 'ok', say('lumi', 'Regatear la cuota sin mirar el plazo es una trampa: te la pueden bajar alargando años.')),
        ]),
        say('vendedor', 'Ehh… son 96 meses al 9,9 % TIN.'),
        say('lumi', '8 años pagando: más de **14.300 €** por un coche de unos 10.000 €. ¿Seguro que es «solo» 149 €?'),
      ]),
      play({
        title: 'Lo que de verdad cuesta un préstamo',
        intro: 'Pides **6.000 €**. El banco te ofrece un 7 % TIN y un 3 % de comisión de apertura. La **TAE** suma las comisiones y te dice el coste real en un año.',
        widget: { kind: 'loan', amount: 6000, tin: 7, months: 48, fee: 3, maxAmount: 20000, maxTin: 15, maxMonths: 96 },
        predict: {
          prompt: 'A 4 años, ¿cuánto acabarás devolviendo en total, con la comisión?',
          options: ['Los 6.000 € y poco más', 'Unos 1.000 € más de lo que pediste', 'El doble de lo que pediste'],
          answer: 1,
          why: 'Cuota de 143,68 € × 48 meses + 180 € de comisión = **7.077 €**. Los 6.000 € te cuestan 1.077 €.',
        },
        goal: { text: 'Con 6.000 €, encuentra el plazo con el que el préstamo te cuesta menos de 500 €.', when: [when('interest', '<', 500), when('amount', '==', 6000)] },
        insight: 'Una cuota baja no es un préstamo barato: suele ser un préstamo **más largo**. Para comparar, mira siempre la **TAE** y cuánto pagas en total.',
        lumi: [
          { when: when('months', '>=', 84), say: 'Cuota pequeñita… ¡pero mira cuánto devuelves en total!', mood: 'WORRIED' },
          { when: when('tae', '>', 8), say: '¿Ves que la TAE es mayor que el TIN? Es la comisión.', mood: 'THINKING' },
          { say: 'Mueve el plazo y mira la cuota y el total', mood: 'HAPPY' },
        ],
      }),
      key('TIN y TAE', '• **TIN:** el interés «puro» que te cobran por el dinero prestado.\n• **TAE:** suma las **comisiones** obligatorias y tiene en cuenta cada cuánto pagas. Es el coste real en un año.\n\nA 3 años, un préstamo al 6 % TIN con un 3 % de comisión sale más caro que otro al 7,5 % TIN sin comisión: **TAE del 8,36 % frente al 7,76 %**.\n\nY si piensas en invertir: un préstamo al 7 % TAE te cuesta ese 7 % **seguro** cada año.', 'Para comparar préstamos, mira la TAE, no el TIN ni la cuota.', 'Pruébalo: pregúntale a la profesora Lumi cuánto te costaría tu préstamo a otro plazo.'),
    ], [
      fill('Para comparar préstamos hay que mirar la ____, porque incluye las comisiones.', 'TAE', ['TIN', 'cuota', 'IBAN'], 'La TAE recoge el interés, las comisiones obligatorias y la frecuencia de pago: es el coste comparable.'),
      single('Préstamo A: 6 % TIN y 3 % de comisión de apertura. Préstamo B: 7,5 % TIN sin comisiones. Mismo importe y plazo (3 años). ¿Cuál es más barato?', ['A, porque su TIN es bastante menor', 'B, porque su TAE es menor', 'Cuestan lo mismo'], 1, 'TAE de A ≈ 8,36 %; de B ≈ 7,76 %. La comisión de apertura encarece A aunque su TIN sea menor.'),
      num('Pides 10.000 € a 5 años al 7 % TIN y pagas 198,01 € al mes. ¿Cuánto pagas en intereses en total? (redondea)', 1881, '€', '198,01 × 60 = 11.880,60 €; menos los 10.000 € prestados = unos 1.881 € de intereses.'),
      tf('La TAE nunca puede ser mayor que el TIN.', false, 'Suele ser mayor: suma comisiones y el efecto de pagar intereses cada mes.'),
      scenario('Bruno va a comprar un coche y el concesionario le ofrece «una cuota de solo 149 € al mes». ¿Qué hace?', [['Pregunta la TAE, el plazo y el total que pagará', 'Descubre que son 84 cuotas: casi 12.520 € en total. Ahora sí puede comparar con otras ofertas.'], ['Firma: 149 € al mes le caben', 'Que la cuota quepa no dice nada del coste: puede estar pagando el coche casi dos veces.'], ['Pide que le alarguen aún más el plazo para pagar menos', 'Cuota más baja, pero más meses pagando intereses.']], 0, 'La cuota sola engaña: lo que cuenta es la TAE y el total a pagar.'),
      timed(single('Rápido: ¿qué cifra incluye las comisiones obligatorias?', ['TIN', 'TAE', 'Euríbor'], 1, 'La TAE. El TIN es solo el interés; el euríbor es un índice de referencia para préstamos variables.'), 10),
      match('Empareja cada término con lo que significa.', [['TIN', 'El interés puro del préstamo'], ['TAE', 'El coste anual con comisiones incluidas'], ['Comisión de apertura', 'Un pago al firmar que sube la TAE'], ['Plazo más largo', 'Cuota menor y más intereses en total']], 'Para comparar préstamos: misma cantidad, mismo plazo y la TAE más baja.'),
      num('Pides 20.000 € al 8 % TIN. A 5 años pagas 4.332 € de intereses; a 8 años, 7.142 €. ¿Cuánto más pagas por alargarlo?', 2810, '€', '7.142 − 4.332 = 2.810 € más por tener la cuota más baja.'),
      fill('Un TIN del 12 % con pagos mensuales equivale a una TAE de ____.', '12,68 %', ['12 %', '1 %', '144 %'], '1,01¹² − 1 ≈ 0,1268 → 12,68 %. El interés de cada mes genera interés.'),
      multi('¿Qué puede hacer que un préstamo salga más caro? Marca todas.', ['Un TIN más bajo con las mismas comisiones', 'Un plazo más largo', 'Un seguro obligatorio vinculado', 'Devolverlo antes sin penalización'], [1, 2], 'Un plazo más largo y un seguro obligatorio encarecen el préstamo, igual que una comisión de apertura. Devolverlo antes sin penalización o un TIN más bajo lo abaratan.'),
      scenario('Quieres empezar a invertir y el banco te ofrece un préstamo personal al 9 % TAE para hacerlo «a lo grande». ¿Qué haces?', [['No lo pido: empiezo con lo que ahorro', 'Sin intereses que pagar, cualquier ganancia es tuya, y una caída no te deja debiendo dinero.'], ['Lo pido: la bolsa sube a largo plazo más que ese 9 %', 'Tendrías que ganar más de un 9 % cada año solo para empatar, y la cuota llega aunque la bolsa caiga.'], ['Pido la mitad, por si acaso', 'Menos riesgo que pedirlo todo, pero sigues debiendo un 9 % seguro por algo que no lo es.']], 0, 'La deuda cobra un 9 % seguro; la inversión, en cambio, puede caer justo cuando toca pagar la cuota. Lo tentador es pensar que la bolsa siempre sube, pero a corto plazo nadie lo garantiza.'),
      chat(['El concesionario me ofrece el coche al 0 % TIN.', '¡Es gratis! ¿Firmo ya?'], '¿Qué le contestas a Lumi?', [['Firma: al 0 % no pagas nada', 'El TIN no incluye comisiones ni seguros obligatorios: mira la TAE.'], ['Antes pide la TAE y el total que vas a pagar', '¡Eso! Con comisiones y seguros, un 0 % TIN puede salir caro.'], ['Pide que te alarguen el plazo para pagar menos', 'Cuota más baja, pero más meses pagando intereses y comisiones.']], 1, 'Un 0 % TIN puede esconder comisiones de apertura o seguros vinculados que solo aparecen en la TAE y en el total a pagar. Lo tentador es quedarse con el «0 %», pero lo que se compara es la TAE.'),
    ], { minutes: 6, retire: [2, 3, 4, 5, 7, 8] }),

    lesson('u3l2', 'Deuda buena y deuda mala', [
      story('Japón a plazos', [{ id: 'marta', name: 'Marta' }], [
        say('marta', '¡Me voy a Japón! El viaje cuesta 3.000 € y me lo financian a 24 meses al 18 % TAE. ¡Me lo merezco!'),
        choose('¿Qué le dices?', [
          opt('¡Genial, aprovecha!', 'bad', say('lumi', 'A ese interés pagará **más de 500 €** de intereses, y seguirá pagando el viaje más de un año después de volver.')),
          opt('¿Y si lo ahorras unos meses y vas el año que viene?', 'good', say('lumi', '¡Buena idea! Con 250 € al mes lo tiene en un año, **sin intereses**, y disfruta igual del viaje.')),
          opt('Pídelo con la revolving, que es más cómodo', 'bad', say('lumi', 'Peor aún: la cuota pequeña de la revolving puede alargar la deuda durante años.')),
        ]),
        say('marta', 'Vale… ¡pero el año que viene me voy sí o sí!'),
      ]),
      play({
        title: '¿Crea valor o lo destruye?',
        intro: 'No toda deuda es igual. La que **puede tener sentido** paga algo que dura o te genera ingresos, a un interés razonable. La que conviene **evitar** paga algo que se acaba antes que la deuda, y cara.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Puede tener sentido' }, { label: 'Mejor evitarla' }],
          cards: [
            { icon: 'home', label: 'Hipoteca con cuota asumible y colchón hecho', bin: 0, why: 'El piso dura décadas y el interés suele ser bajo… siempre que puedas pagar la cuota.' },
            { icon: 'phone', label: 'Móvil último modelo con la tarjeta revolving', bin: 1, why: 'Se queda viejo antes de pagarlo, y una revolving puede pasar del 20 % TAE.' },
            { icon: 'study', label: 'Préstamo barato para una formación que sube tu sueldo', bin: 0, why: 'Si de verdad mejora tus ingresos, la deuda se paga sola.' },
            { icon: 'plane', label: 'Vacaciones a 24 plazos', bin: 1, why: 'El viaje dura una semana; la deuda, dos años.' },
            { icon: 'car', label: 'Coche sencillo que necesitas para trabajar, al 6 % TAE', bin: 0, why: 'Si sin coche no puedes trabajar, puede tener sentido… sin pasarte de coche.' },
            { icon: 'cash', label: 'Minicrédito para llegar a fin de mes', bin: 1, why: 'Sus TAE pueden superar el 2.000 %: tapa un agujero abriendo otro más grande.' },
          ],
        },
        goal: { text: 'Clasifica las seis deudas.', when: [when('done', '==', 6)] },
        insight: '**Tres preguntas antes de firmar:** ¿durará más que la deuda? ¿Cuál es la TAE (por encima del 7-8 %, es cara)? ¿Podría pagarla si mis ingresos bajaran? Las cuotas de todas tus deudas no deberían pasar del **30-35 %** de tus ingresos.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿esto me durará más de lo que tardo en pagarlo?', mood: 'THINKING' },
          { say: 'Clasifica cada deuda', mood: 'HAPPY' },
        ],
      }),
      key('La deuda cara va antes que invertir', 'Una deuda al 20 % te cobra ese 20 % **seguro** cada año. Ninguna inversión te garantiza ganar eso: ni siquiera la bolsa, que tiene años buenos y años muy malos.\n\nPor eso la deuda cara se quita antes de invertir. La barata y asumible, como una hipoteca con una cuota razonable, puede convivir con tu cartera.', 'Si una deuda te cuesta más de lo que esperas ganar invirtiendo, quítatela primero.', 'Pruébalo: pregúntale a la profesora Lumi si tu deuda es cara o barata.'),
    ], [
      buckets('¿Esta deuda suele crear o destruir valor?', ['Suele crear valor', 'Suele destruir valor'], [['Hipoteca asumible al 3 %', 0], ['Vacaciones pagadas con la revolving', 1], ['Préstamo barato para una FP que sube tu sueldo', 0], ['Cena de cumpleaños aplazada con la tarjeta al 20 %', 1], ['Móvil de 1.200 € a 24 meses con intereses', 1]], 'La pregunta clave: ¿lo que compras dura o rinde más que lo que cuesta la deuda?'),
      match('Empareja cada deuda con su descripción.', [['Hipoteca a 25 años', 'Una vivienda que dura más que la deuda'], ['Tarjeta revolving', 'Deuda cara que se alarga sin fin'], ['Préstamo para formación', 'Puede subir tus ingresos futuros'], ['Minicrédito', 'Dinero rápido a un coste altísimo']], 'El tipo de interés y para qué se usa el dinero deciden si una deuda ayuda o hunde.'),
      tf('Toda hipoteca es deuda buena.', false, 'Solo si la cuota es asumible y tienes colchón. Una hipoteca que no puedes pagar es un problema enorme.'),
      timed(tf('Una deuda al 20 % TAE es deuda cara.', true, 'Muy por encima del 7-8 %: hay que eliminarla cuanto antes.'), 10),
      scenario('Marta, de 24 años, quiere ir a Japón. El viaje cuesta 3.000 € y le ofrecen financiarlo a 2 años con una TAE del 14 %. ¿Qué hace?', [['Ahorra 250 € al mes y viaja dentro de un año', 'Viaja un año más tarde, sin intereses y sin cuotas a la vuelta.'], ['Lo financia: así viaja ya', 'Pagará el viaje durante dos años y con unos 430 € de intereses: el recuerdo dura menos que la deuda.'], ['Lo paga con la tarjeta revolving', 'Con una TAE de en torno al 20 % o más, el viaje puede costarle mucho más y durante años.']], 0, 'Para los deseos, mejor ahorrar antes que deber después.'),
      num('Cobras 1.800 € netos. Si las cuotas de tus deudas no deben pasar del 35 % de tus ingresos, ¿cuánto puedes pagar como máximo al mes?', 630, '€', '1.800 × 0,35 = 630 €.'),
      single('¿Qué deuda tiene más sentido?', ['Una hipoteca que puedes pagar bien', 'Una revolving para pagar un viaje este verano', 'Un minicrédito para un concierto'], 0, 'Barata, para algo que dura y con una cuota asumible.'),
      chat(['Me quiero comprar el móvil nuevo de 1.200 € 📱', 'La tienda me lo financia a 24 meses, ¡solo 60 € al mes!'], '¿Qué le dices a Lumi?', [['¡Genial, así no se nota!', 'Se nota: 60 × 24 = 1.440 €. Pagas 240 € más por algo que en 2 años valdrá mucho menos.'], ['Mira la TAE y cuánto pagas en total', '¡Bien! 60 × 24 = 1.440 €: 240 € de intereses. Quizá ahorrar unos meses salga mejor.'], ['Mejor uno de 2.000 €, la cuota sube poco', 'Así solo alargas la deuda por algo que pierde valor muy rápido.']], 1, 'Antes de financiar un capricho, multiplica la cuota por los meses.'),
      scenario('Pablo puede pedir 6.000 € al 6 % TAE para un curso certificado con el que, en su sector, el sueldo suele subir unos 300 € al mes. Tiene colchón. ¿Qué hace?', [['Comprueba que la cuota le cabe y lo pide', 'Si la subida de sueldo llega, la deuda se paga sola en poco tiempo: es deuda que puede crear valor.'], ['Lo pone en la revolving para no pedir préstamo', 'Misma compra, pero a un interés mucho más alto.'], ['Pide 10.000 € para darse algún capricho también', 'Mezcla una deuda que crea valor con otra que lo destruye.']], 0, 'La misma deuda puede ser buena o mala: depende del coste y de lo que te devuelve.'),
      buckets('Antes de empezar a invertir, ¿esta deuda la quitas o puede convivir con tu cartera?', ['Quitarla primero', 'Puede convivir'], [['Revolving al 22 %', 0], ['Minicrédito', 0], ['Hipoteca fija al 2 % con cuota asumible', 1], ['Préstamo de estudios al 3 %', 1], ['Compra a plazos al 18 %', 0]], 'La deuda cara cobra seguro más de lo que una inversión puede prometerte, así que va primero. Con la barata y asumible no hay tanta prisa: amortizarla solo te ahorra su interés, y puedes invertir a la vez.'),
    ], { source: '1.4', minutes: 6, retire: [0, 2, 4, 5] }),

    lesson('u3l3', 'Tarjetas revolving y minicréditos', [
      play({
        title: 'La trampa de la cuota pequeña',
        intro: 'Te compras un portátil con la tarjeta y eliges la «cuota cómoda» de una **revolving**: debes **3.000 €** al 22 % y pagas **60 € al mes**. Parece poco… pero la cuota apenas cubre los intereses.',
        widget: { kind: 'revolving', debt: 3000, apr: 22, payment: 60, minPayment: 40, maxPayment: 300 },
        predict: {
          prompt: 'Debes 3.000 € al 22 % y pagas 60 € al mes. ¿Cuánto tardas en pagarlo todo?',
          options: ['Unos 4 años', 'Más de 11 años', 'Nunca la terminas'],
          answer: 1,
          why: '**137 meses**: más de 11 años, y pagas unos **5.200 € de intereses**, casi el doble de lo que debías.',
        },
        goal: { text: 'Encuentra la cuota con la que la liquidas en 2 años o menos.', when: [when('months', '<=', 24)] },
        insight: 'La cuota pequeña es el anzuelo: mira **cuánto debes y cuánto pagas en total**. Sube la cuota todo lo que puedas y, cuando la liquides, pásala a pago total a fin de mes.',
        lumi: [
          { when: when('months', '>=', 999), say: '¡Con esa cuota no pagas ni los intereses! La deuda no baja nunca.', mood: 'SAD' },
          { when: when('months', '>=', 100), say: 'Años y años pagando… y los intereses se comen casi toda la cuota.', mood: 'WORRIED' },
          { when: when('months', '<=', 36), say: '¡Así sí! Cuanto más subes la cuota, menos intereses regalas.', mood: 'HAPPY' },
          { say: 'Sube la cuota y mira cuánto te ahorras', mood: 'THINKING' },
        ],
      }),
      story('300 € en 10 minutos', [{ id: 'sms', name: 'SMS' }], [
        say('sms', '¡Hola! Te prestamos **300 € en 10 minutos**, sin papeleos. Solo devuelves 390 € en 30 días. Pídelo ya'),
        choose('Te falta dinero para el alquiler. ¿Qué haces?', [
          opt('Lo pido, son solo 90 € más', 'bad', say('lumi', '90 € por 300 € en un mes es una **TAE de más del 2.300 %**. Y si no lo devuelves a tiempo, las penalizaciones lo hacen crecer.')),
          opt('Hablo con el casero o con mi familia y reviso gastos', 'good', say('lumi', 'Bien: negociar un retraso o pedir ayuda sale muchísimo más barato que un minicrédito.')),
          opt('Lo pido y lo pago con la tarjeta revolving', 'bad', say('lumi', 'Tapar una deuda cara con otra cara es la forma más rápida de entrar en una espiral.')),
        ]),
        say('lumi', 'Regla de oro: si te ofrecen dinero **rápido y fácil**, suele ser **caro**.'),
        say('lumi', 'Si un interés te parece abusivo, reclama al banco y luego al Banco de España.'),
        say('lumi', 'Pruébalo: en Mercado, mira cómo sube y baja el S&P 500; tu revolving cobra siempre.'),
      ]),
    ], [
      num('Debes 1.000 € en una revolving al 2 % mensual. ¿Cuántos euros de intereses pagas el primer mes?', 20, '€', '1.000 × 0,02 = 20 €.'),
      timed(num('Rápido: pagas 30 € de cuota y 20 € son intereses. ¿Cuánto baja tu deuda ese mes?', 10, '€', '30 − 20 = 10 €. Solo un tercio de lo que pagas reduce la deuda.'), 15),
      spot('Marca los mensajes que son una trampa de deuda o una estafa.', [['Préstamos Rápidos', '¡300 € en 10 minutos, sin papeles y sin preguntas! Devuelve solo 390 € en 30 días.', true], ['Tu banco', 'Has cambiado tu tarjeta a pago total a fin de mes. Ya no se aplicarán intereses por aplazamiento.', false], ['Tarjeta Plus', '¡Enhorabuena! Paga todas tus compras en cómodas cuotas de solo 25 € al mes. Actívalo ya.', true], ['+34 6…', 'Te cancelamos todas tus deudas. Solo tienes que adelantar 200 € de gestión por Bizum.', true], ['Tu banco', 'Recordatorio: a tu préstamo le quedan 14 cuotas. TAE: 7,2 %.', false]], 'Dinero inmediato sin preguntas, cuotas mínimas que esconden la deuda y pagos por adelantado para «cancelar deudas» son señales de alarma.'),
      single('¿Por qué una revolving sale tan cara?', ['Porque la cuota apenas reduce la deuda', 'Porque cobra una comisión por cada compra en tiendas', 'Porque solo se puede usar fuera de España'], 0, 'Con 30 € de cuota sobre 1.000 € al 2 % mensual, solo 10 € bajan la deuda el primer mes.'),
      tf('Pasar la tarjeta a pago total a fin de mes evita pagar intereses por aplazar.', true, 'Pagas lo gastado de una vez, sin aplazamiento y sin intereses.'),
      scenario('Ana debe 2.000 € en una revolving al 22 % TAE y paga 50 € al mes. Tiene 4.000 € en una cuenta al 2 %, y su colchón ideal es de 2.000 €. ¿Qué hace?', [['Cancela la revolving y conserva 2.000 € de colchón', 'Se ahorra un 22 % seguro y sigue teniendo colchón: gana por todas partes.'], ['Lo deja todo como está', 'Cobra un 2 % en la cuenta mientras paga un 22 % en la tarjeta: pierde unos 400 € al año.'], ['Invierte los 4.000 € en bolsa para ganar más que el 22 %', 'Ninguna inversión garantiza un 22 %; la deuda, en cambio, cobra seguro.']], 0, 'Pagar una deuda cara es la mejor «inversión» segura que existe.'),
      multi('¿Qué ayuda a salir de una revolving? Marca todas.', ['Dejar de usarla', 'Subir la cuota mensual', 'Pagarla con un minicrédito', 'Pagar solo el mínimo cada mes'], [0, 1], 'Dejar de usarla y subir la cuota (o pasarla a pago a fin de mes) recorta la deuda. Pagar solo el mínimo la alarga años, y taparla con un minicrédito la encarece.'),
      timed(single('Rápido: ¿qué deuda es más cara?', ['Préstamo personal al 8 % TAE', 'Revolving al 22 % TAE', 'Hipoteca al 3 % TAE'], 1, 'La revolving: casi tres veces el préstamo personal y más de siete la hipoteca.'), 10),
      fill('Un minicrédito de 300 € por el que devuelves 390 € a los 30 días tiene una TAE de más del ____.', '2.300 %', ['30 %', '39 %', '90 %'], 'Un 30 % en un mes, compuesto durante un año, supera el 2.300 %.'),
      chat(['Mi tarjeta me deja pagar solo 25 € al mes de lo que debo 😌', 'Así voy tranquila, ¿no?'], '¿Qué le contestas a Lumi?', [['Sí, así no te agobias', 'Con 1.000 € al 2 % mensual, a 25 € al mes tardarías unos 81 meses y pagarías más de 2.000 €.'], ['Cuidado: con esa cuota casi todo son intereses', '¡Eso! Sube la cuota todo lo que puedas y deja de usarla hasta liquidarla.'], ['Pide otra tarjeta para pagar esta', 'Así tendrías dos deudas caras en lugar de una.']], 1, 'Una cuota cómoda puede esconder una deuda que dura años.'),
    ], { minutes: 6, retire: [0, 1, 7, 9] }),

    lesson('u3l4', 'Bola de nieve o avalancha', [
      play({
        title: 'Cuatro deudas, un plan',
        intro: 'Pablo tiene cuatro deudas. Cada mes paga el **mínimo en todas** y lo que le sobra va a una sola:\n\n• **Bola de nieve:** primero la más **pequeña**.\n• **Avalancha:** primero la de **mayor interés**.',
        widget: {
          kind: 'debts', extra: 100, maxExtra: 400,
          debts: [
            { icon: 'card', name: 'Tarjeta revolving', balance: 1200, rate: 22, min: 40 },
            { icon: 'phone', name: 'Móvil a plazos', balance: 400, rate: 9, min: 40 },
            { icon: 'car', name: 'Préstamo del coche', balance: 5000, rate: 8, min: 150 },
            { icon: 'study', name: 'Préstamo del máster', balance: 2500, rate: 5, min: 60 },
          ],
        },
        predict: {
          prompt: '¿Con qué método pagará Pablo menos intereses en total?',
          options: ['Bola de nieve', 'Avalancha', 'Da igual: pagan lo mismo'],
          answer: 1,
          why: 'La **avalancha** ataca primero la deuda más cara, la que más intereses genera cada mes.',
        },
        goal: { text: 'Prueba los dos métodos y quédate con el que menos intereses paga.', when: [when('method', '==', 1), when('saved', '>=', 0)] },
        insight: 'Con los números en la mano gana la **avalancha**. Pero la bola de nieve da victorias rápidas (¡una deuda menos en pocos meses!), y un plan que cumples vale más que uno perfecto que abandonas.',
        lumi: [
          { when: when('method', '==', 0), say: 'Con la bola de nieve, Pablo se quita una deuda en pocos meses. ¡Eso motiva! Ahora prueba la avalancha.', mood: 'HAPPY' },
          { when: when('extra', '>=', 300), say: '¡Con más extra, mira cuántos meses te quitas de encima!', mood: 'CELEBRATE' },
          { say: 'Compara los intereses de los dos métodos', mood: 'THINKING' },
        ],
      }),
      key('Lo que no funciona (y lo que viene después)', 'Repartir lo que sobra sin criterio, o pedir otra deuda cara para pagar las anteriores.\n\nY un truco: cuando cancelas una deuda, **su cuota se suma a la siguiente**. Por eso el plan va cada vez más deprisa, como una bola que crece. Cuando cae la última, esa cuota liberada pasa a ser tu **aportación mensual para invertir**.', 'Mínimos a todas; el resto, a una sola. Así se sale de las deudas.', 'Pruébalo: cuando liquides una deuda, compra un ETF en el simulador con esa cuota.'),
    ], [
      order('Método avalancha: ordena qué deuda atacas primero.', ['Revolving: 1.200 € al 22 %', 'Compra a plazos: 800 € al 12 %', 'Préstamo del coche: 6.000 € al 7 %', 'Préstamo de un familiar: 500 € al 0 %'], 'En la avalancha manda el tipo de interés: de mayor a menor.'),
      order('Método bola de nieve con las mismas deudas: ordena de primera a última.', ['Préstamo de un familiar: 500 € al 0 %', 'Compra a plazos: 800 € al 12 %', 'Revolving: 1.200 € al 22 %', 'Préstamo del coche: 6.000 € al 7 %'], 'En la bola de nieve manda el saldo: de menor a mayor.'),
      match('Empareja cada término con su significado.', [['Avalancha', 'Primero la de mayor interés'], ['Bola de nieve', 'Primero la de menor saldo'], ['Pago mínimo', 'Lo que pagas en todas las demás'], ['Efecto bola', 'La cuota liberada se suma a la siguiente']], 'En los dos métodos pagas el mínimo en todas y concentras el extra en una.'),
      num('Debes 1.200 € en una revolving al 22 % anual. ¿Cuántos intereses te ahorras en un año si la cancelas ya? (aproximado, interés simple)', 264, '€', '1.200 × 0,22 = 264 € al año.'),
      timed(num('Rápido: cancelas la compra a plazos, que tenía una cuota de 90 €. A la revolving le pagabas 150 €. ¿Cuánto le pagas ahora cada mes?', 240, '€', '150 + 90 = 240 €: la cuota liberada se suma a la siguiente deuda.'), 20),
      scenario('Pablo ha intentado dos veces la avalancha y lo ha dejado: su deuda grande no se acaba nunca y se desanima. ¿Qué hace?', [['Prueba la bola de nieve para ganar motivación', 'Cancela dos deudas pequeñas en pocos meses y recupera las ganas. Paga algo más de intereses, pero no abandona.'], ['Pide un minicrédito para pagarlo todo de golpe', 'Cambia varias deudas por una carísima: el problema crece.'], ['Deja de pagar la grande un tiempo', 'Recargos, intereses de demora y posibles ficheros de morosos.']], 0, 'El mejor método es el que consigues mantener.'),
      scenario('Laura recibe una paga extra de 1.000 €. Debe 1.000 € en una revolving al 21 % y 4.000 € del coche al 6 %. ¿Qué hace con la paga?', [['Cancela la revolving', 'Se quita la deuda más cara y libera esa cuota para el coche.'], ['La reparte a medias entre las dos', 'Deja viva la deuda al 21 %: paga intereses caros que podía evitar.'], ['Adelanta 1.000 € del coche', 'Ahorra un 6 % pudiendo ahorrar un 21 %.']], 0, 'Con dinero extra, la primera en caer es la de mayor interés.'),
      tf('La bola de nieve es siempre el método que menos intereses te hace pagar.', false, 'Esa es la avalancha. La bola de nieve sacrifica algo de dinero a cambio de motivación.'),
      timed(single('Rápido: en la avalancha, ¿qué miras para elegir?', ['El tipo de interés', 'El saldo pendiente', 'El nombre del banco'], 0, 'El interés: primero la deuda más cara.'), 10),
      multi('¿Qué es mala idea si tienes varias deudas? Marca todas.', ['Pedir un minicrédito para pagar la tarjeta', 'Dejar de pagar el mínimo de alguna', 'Pagar el mínimo en todas y el extra a una', 'Empezar por la deuda con el interés más alto'], [0, 1], 'Dejar de pagar un mínimo o tapar la tarjeta con un minicrédito empeora las cosas. Pagar el mínimo en todas y concentrar el extra, empezando por la más cara, es justo el método.'),
      scenario('Pablo acaba de liquidar su última deuda cara y le quedan libres 300 € al mes que antes iban a cuotas. Ya tiene colchón. ¿Qué hace?', [['Los convierte en ahorro e inversión automáticos', 'Sigue viviendo igual que antes, pero ahora esos 300 € trabajan para él.'], ['Sube su nivel de gasto: se lo ha ganado tras tanto esfuerzo', 'Es tentador, pero pierde la mejor ocasión de empezar a invertir sin notarlo.'], ['Los deja en la cuenta corriente', 'Sin destino, se acaban gastando y además pierden poder de compra.']], 0, 'Pablo ya vivía sin esos 300 €, así que invertirlos no le cuesta nada en su día a día. Subir el gasto tienta como premio, pero frena en seco el impulso que había cogido.'),
    ], { minutes: 6, retire: [3, 4, 7, 8] }),

    lesson('u3l5', 'Invertir o amortizar', [
      story('La paga extra de Bruno', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Me han dado una paga extra de **3.000 €**. Tengo un préstamo del coche al 9 % y quería empezar a invertir. ¿Qué hago primero?'),
        choose('¿Qué le dices?', [
          opt('Invierte: la bolsa da más a largo plazo', 'ok', say('lumi', 'Puede que sí… o puede que no: la bolsa no garantiza nada. Amortizar el préstamo es **un 9 % seguro**.')),
          opt('Amortiza el préstamo: es un 9 % seguro', 'good', say('lumi', '¡Eso es! Devolver antes una deuda te da una rentabilidad **segura igual a su interés**. Con un 9 %, casi siempre gana amortizar.')),
          opt('Guárdalo en la cuenta y ya verás', 'bad', say('lumi', 'En la cuenta a casi un 0 % mientras pagas un 9 % de intereses: pierdes por los dos lados.')),
        ]),
        say('bruno', '¿Y si fuera mi hipoteca al 2 %?'),
        say('lumi', 'Ahí la cosa cambia. Vamos a ordenarlo'),
      ]),
      play({
        title: '¿Colchón, amortizar o invertir?',
        intro: '**La regla:** amortizar una deuda equivale a ganar su tipo de interés sin riesgo. Pero antes de nada, el colchón para imprevistos.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Primero, el colchón' }, { label: 'Amortiza' }, { label: 'Invertir puede tener sentido' }],
          cards: [
            { icon: 'card', label: 'Revolving al 21 %, con colchón hecho', bin: 1, why: 'Amortizarla es un 21 % seguro: ninguna inversión garantiza eso.' },
            { icon: 'warning', label: 'Una deuda al 8 % y ningún ahorro para imprevistos', bin: 0, why: 'Si vacías la cuenta y llega una avería, acabarás pidiendo prestado otra vez, y más caro.' },
            { icon: 'home', label: 'Hipoteca fija al 2 %, colchón de 6 meses y 20 años por delante', bin: 2, why: 'Con una deuda tan barata y el colchón hecho, puedes compaginar amortizar e invertir a largo plazo.' },
            { icon: 'car', label: 'Préstamo del coche al 9 %, con colchón hecho', bin: 1, why: 'Por encima del 7-8 %, amortizar casi siempre gana.' },
            { icon: 'family', label: 'Préstamo de tu familia al 0 %, con colchón hecho', bin: 2, why: 'Amortizar al 0 % no te da ninguna rentabilidad (aunque deber a la familia también pesa).' },
          ],
        },
        goal: { text: 'Decide qué haría Bruno en cada caso.', when: [when('done', '==', 5)] },
        insight: '**Por orden:** colchón, deudas caras (más del 7-8 %) e invertir a largo plazo; las baratas, amortízalas si te da tranquilidad, mirando antes si cobran comisión. Pruébalo: cuéntale tu caso a la profesora Lumi y pregúntale por dónde empezar.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate primero: ¿tiene colchón? Luego mira el interés de la deuda.', mood: 'THINKING' },
          { say: '¿Qué haría Bruno en cada caso?', mood: 'HAPPY' },
        ],
      }),
    ], [
      buckets('¿Qué suele tener más sentido?', ['Amortizar primero', 'Se puede compaginar con invertir'], [['Revolving al 22 %', 0], ['Préstamo personal al 9 %', 0], ['Hipoteca fija al 2 %', 1], ['Minicrédito', 0], ['Préstamo de un familiar al 0 %', 1], ['Hipoteca variable al 2,5 %', 1]], 'Por encima del 7-8 %, amortizar suele ganar; con deuda barata hay margen para decidir.'),
      num('Amortizas 3.000 € de un préstamo al 9 %. ¿Cuántos intereses te ahorras el primer año, aproximadamente?', 270, '€', '3.000 × 0,09 = 270 €: una rentabilidad segura del 9 %.'),
      scenario('Bruno tiene una hipoteca fija al 2 %, un colchón de 6 meses y 10.000 € más ahorrados que no necesitará en 15 años. ¿Qué hace?', [['Compara amortizar al 2 % con invertir a largo plazo', 'Entiende lo que gana con cada opción y puede repartir entre las dos.'], ['Lo mete todo en una sola acción de moda porque la hipoteca es barata', 'Una sola empresa puede hundirse: eso no es comparar, es apostar.'], ['Pide otro préstamo para invertir más', 'Endeudarse para invertir multiplica el riesgo.']], 0, 'Con deuda barata no hay una única respuesta correcta: lo importante es comparar bien y no tocar el colchón.'),
      scenario('Marta tiene 3.000 € de revolving al 21 % y otros 3.000 € que quiere empezar a invertir en un fondo. ¿Qué hace primero?', [['Paga la revolving', 'Se asegura un 21 % al año sin riesgo. Luego invierte lo que antes pagaba de cuota.'], ['Invierte los 3.000 € y sigue pagando la tarjeta', 'Para salir ganando, el fondo tendría que rendir más de un 21 % al año.'], ['Invierte la mitad y paga la mitad', 'Mejor que nada, pero mantiene viva una deuda al 21 %.']], 0, 'Invertir con una deuda al 21 % es llenar un cubo agujereado.'),
      tf('Amortizar una deuda al 20 % equivale a una rentabilidad segura del 20 %.', true, 'Cada euro que devuelves deja de costarte un 20 % al año.'),
      timed(tf('Conviene usar el fondo de emergencia para amortizar la hipoteca.', false, 'El colchón es para imprevistos; si lo gastas, el siguiente susto acaba en deuda cara.'), 10),
      single('Tienes una deuda al 4 %. ¿Qué te da amortizarla?', ['Un 4 % seguro', 'Un 4 % que puede ser negativo', 'Nada, porque no cobras intereses'], 0, 'Lo que dejas de pagar es una ganancia segura igual al tipo de interés.'),
      num('Tu hipoteca fija cobra un 0,5 % de comisión por amortizar antes. Amortizas 10.000 €. ¿Cuánto pagas de comisión?', 50, '€', '10.000 × 0,005 = 50 €. Mira siempre tu contrato antes de amortizar.'),
      chat(['Tengo una hipoteca al 2 % y me sobran 200 € al mes.', '¿Amortizo o invierto?'], '¿Qué le contestas a Lumi?', [['Siempre amortizar: cualquier deuda es mala y hay que quitársela', 'No siempre: al 2 % es deuda barata. Depende de tu colchón, tu plazo y tu tranquilidad.'], ['Depende: compara ese 2 % con invertir a largo plazo', 'Eso: con deuda barata no hay una sola respuesta; lo importante es entender qué comparas.'], ['Invierte en lo que más haya subido este año', 'Eso no es comparar: es perseguir modas.']], 1, 'Amortizar da una rentabilidad segura; invertir, una esperada. Con deuda barata, las dos opciones pueden tener sentido.'),
      order('Ordena las prioridades habituales de tu dinero.', ['Saber cuánto gastas', 'Fondo de emergencia', 'Eliminar deudas caras', 'Invertir a largo plazo'], 'La pirámide del dinero: sin base, cualquier imprevisto te obliga a vender en el peor momento.'),
    ], { source: '1.4', minutes: 6, retire: [0, 1, 4, 5, 7] }),
  ],
})
