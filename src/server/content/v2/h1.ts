import 'server-only'
// Sección 0 «Invierte desde hoy» · Unidad «Tu primera inversión» (docs/curso-v2/06-enganche-y-progresion.md)
// Las clases vienen de otras unidades: conservan su id, el progreso de quien ya las hizo y sus traducciones.
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, point, say, scenario, simTrade, single, story, tf, timed, upDown, when } from '../dsl'

// Primera clase de toda la app: el «momento aha» (vivir una inversión real y ver por qué empezar pronto lo cambia todo).
// Cifras comprobadas con charts.json y src/client/play/math.ts:
// · series-sp500-monthly: 1.000 € en 1985-01 → 38.109 € en 2025-12 (×38,1); desde 2005-01, ×5,8; caídas de −46 % (2000-2002) y −53 % (2007-2009).
// · growthPath: 50 €/mes 40 años al 7 % → 123.577 € (aporta 24.000 €); 100 €/mes 30 años → 116.945 € (aporta 36.000 €).
export const h1l1 = lesson('h1l1', 'Tu primera inversión en 3 minutos', [
  play({
    title: '40 años de bolsa en 20 segundos',
    intro: 'El **S&P 500** junta las 500 mayores empresas de EE. UU., como Apple o Amazon. Pones **1.000 €** virtuales en enero de 1985 y vives lo que pasó de verdad.',
    widget: { kind: 'crash', series: 'series-sp500-monthly', amount: 1000 },
    predict: {
      prompt: 'Sin añadir ni un euro, ¿cuánto valen esos 1.000 € a finales de 2025?',
      options: ['Unos 2.000 €', 'Unos 8.000 €', 'Más de 30.000 €'],
      answer: 2,
      why: 'Valen **38.109 €**: unas 38 veces lo que pusiste, sin contar dividendos ni el cambio de moneda.',
    },
    goal: { text: 'Llega hasta 2025. Si te asustas, puedes vender.', when: [when('played', '==', 1)] },
    insight: 'Hubo dos caídas de alrededor de la mitad (2000-2002 y 2008) y aun así quien no vendió multiplicó su dinero por **38**. Quien empezó en 2005, solo por **5,8**: **empezar pronto** pesa muchísimo.',
    lumi: [
      { when: when('sold', '==', 1), say: 'Has vendido. Mira cuánto valdría si hubieras aguantado.', mood: 'THINKING' },
      { when: when('played', '==', 1), say: 'Cuarenta años, varias crisis y unas 38 veces tu dinero.', mood: 'CELEBRATE' },
      { when: when('drop', '>=', 1000), say: 'Ya pasan de 11.000 €. Solo has tenido que esperar.', mood: 'HAPPY' },
      { say: 'Dale a empezar. Puedes vender cuando quieras.', mood: 'HAPPY' },
    ],
  }),
  story('Empiezo cuando gane más', [{ id: 'leo', name: 'Leo' }], [
    note('Leo tiene 20 años y acaba de ver ese mismo gráfico.'),
    say('leo', 'Brutal. Pero ahora solo puedo apartar 50 € al mes.'),
    say('leo', 'Mejor espero a los 30 y pongo 100 € al mes.'),
    choose('Hasta los 60 y ganando un 7 % al año, ¿cuándo acaba con más?', [
      opt('Si empieza ya, con 50 € al mes', 'good', say('lumi', 'Eso: pone 24.000 € y llega a más de 120.000 €.'), say('lumi', 'Si espera, pone 36.000 € y llega a unos 117.000 €.')),
      opt('Si espera a los 30, con 100 € al mes', 'bad', say('lumi', 'Con 36.000 € llega a unos 117.000 €. Empezando ya, a más de 120.000 €.')),
      opt('Más o menos igual', 'ok', say('lumi', 'Casi, pero empezando ya pone 12.000 € menos y acaba con más.')),
    ]),
    say('lumi', 'Es el **interés compuesto**: lo que ganas también gana, y el tiempo lo multiplica.'),
    say('lumi', 'El 7 % es un ejemplo: la bolsa no promete nada cada año.'),
    say('leo', '¿Y cómo empiezo sin arriesgar mi dinero?'),
    say('lumi', 'Con dinero virtual, aquí mismo. Te enseño.'),
  ]),
  key('Lo que acabas de descubrir', '• Una **acción** es un trocito de una empresa. Con el S&P 500 tienes un trocito de 500 a la vez.\n• La bolsa a veces cae, y mucho, pero en esos 40 años quien no vendió multiplicó su dinero. Eso no garantiza que se repita.\n• **Empezar pronto** pesa más que empezar con mucho.\n\nEn E-Trading practicas con dinero virtual: puedes equivocarte sin perder nada de verdad.', 'Invertir es comprar trocitos de empresas y darles tiempo para crecer.', 'Pruébalo: en Mercado, busca una empresa que conozcas y compra tu primera acción.'),
], [
  single('¿Qué compras cuando compras una acción?', ['Un préstamo a la empresa', 'Un trozo pequeño de la empresa', 'Un producto de la empresa con descuento'], 1, 'Una acción es una parte de la empresa: ganas si la empresa vale más, no porque te deba nada.'),
  scenario('Has puesto 1.000 € virtuales en el S&P 500 y en pocos meses caen a 700 €. No necesitas ese dinero en años. ¿Qué haces?', [['Aguanto: no lo necesito y tengo tiempo', 'Le das tiempo a recuperarse. En 2008 cayó más de la mitad y quien aguantó acabó multiplicando su dinero.'], ['Vendo todo para no perder más', 'Al vender conviertes una bajada en una pérdida real, y te pierdes la recuperación.'], ['Pido un préstamo para comprar más barato', 'Si sigue cayendo, pierdes con dinero que no es tuyo y además debes los intereses.']], 0, 'Las caídas forman parte de invertir. Si no necesitas el dinero, vender en plena caída es lo que convierte una bajada temporal en una pérdida de verdad.'),
  chat(['Invertir en bolsa es como ir al casino, ¿no?', 'O lo ganas todo o lo pierdes todo.'], '¿Qué le contestas?', [['No: compras trocitos de empresas que ganan dinero y crecen', 'Eso. Detrás de cada acción hay un negocio real, no una ruleta.'], ['Sí, es pura suerte', 'En el casino la banca siempre gana. Una empresa que gana dinero suele valer más con los años.'], ['Solo si eliges bien la empresa', 'Acertar ayuda, pero con 500 empresas a la vez ya no dependes de acertar una.']], 0, 'En el casino las cuentas están hechas para que pierdas. En bolsa compras partes de negocios que generan beneficios, y con tiempo y muchas empresas a la vez el resultado depende mucho menos de la suerte.'),
  buckets('¿Ayuda a tu dinero a largo plazo o le resta?', ['Le ayuda', 'Le resta'], [['Empezar pronto, aunque sea con poco', 0], ['Vender todo en cuanto la bolsa cae', 1], ['Repartir entre muchas empresas', 0], ['Esperar a tener mucho dinero para empezar', 1], ['Dejar pasar los años sin tocarlo', 0]], 'El tiempo y el reparto juegan a tu favor. Esperar o vender con miedo hace que el tiempo trabaje menos para ti.'),
  tf('Entre 1985 y 2025, el S&P 500 nunca cayó más de un 20 %.', false, 'Cayó casi a la mitad en 2000-2002 y más de la mitad en 2008-2009. Aun así, quien no vendió multiplicó su dinero por 38: las caídas fuertes pasan, y aguantar es lo difícil.'),
  single('1.000 € en el S&P 500 en 1985 se convirtieron en unos 38.000 € en 2025. ¿Qué hizo casi todo el trabajo?', ['El tiempo: 40 años sin vender', 'Comprar y vender en el momento justo', 'Una sola empresa que se disparó'], 0, 'Bastaba con no tocarlo durante 40 años. No hacía falta acertar cuándo comprar o vender, y el S&P 500 son 500 empresas, no una sola.'),
], { minutes: 3 })

// Antes en u08 (mismo id: conserva progreso y traducciones)
export const u8l1 = lesson('u8l1', 'Qué es una acción', [
  story('¿Ya soy un poco dueña?', [{ id: 'sara', name: 'Sara' }], [
    say('sara', 'Me he comprado una acción de una empresa de videojuegos.'),
    say('sara', '¿Eso significa que ya soy un poco dueña?'),
    choose('¿Qué le contestas a Sara?', [
      opt('Sí: de una parte diminuta del negocio', 'good', say('lumi', 'Eso. Si el negocio va bien lo notas, y si va mal, también.')),
      opt('No: solo es un número que sube y baja', 'bad', say('lumi', 'Detrás del precio hay un negocio real, y tienes un trocito.')),
      opt('Sí, y ya puede mandar en la empresa', 'ok', say('lumi', 'Puede votar en la junta de accionistas, pero su voto pesa muy poco.')),
    ]),
    say('sara', '¿Y cómo gano dinero con ella?'),
    say('lumi', 'De dos formas: **dividendos** (reparte beneficios) y **revalorización** (sube el precio).'),
    say('lumi', 'A largo plazo, el precio sigue a los beneficios; a corto, a las expectativas.'),
    say('lumi', 'Si la empresa quiebra, el accionista cobra el último y casi nunca recupera nada.'),
  ]),
  play({
    title: '¿Dueño o prestamista?',
    intro: 'Inditex tiene unos 3.100 millones de **acciones**: con una eres dueño de un trocito. Con un **bono**, en cambio, le prestas dinero.',
    widget: {
      kind: 'sort',
      bins: [{ label: 'Acción: dueño' }, { label: 'Bono: prestamista' }],
      cards: [
        { icon: 'store', label: 'Tienes una parte de sus tiendas, marcas y beneficios', bin: 0, why: 'Eso es ser copropietario: renta variable.' },
        { icon: 'percent', label: 'Cobras un cupón pactado', bin: 1, why: 'El bonista cobra lo pactado si la empresa puede pagar.' },
        { icon: 'calendar', label: 'Te devuelven el dinero en una fecha', bin: 1, why: 'El bono vence; la acción no tiene fecha de vencimiento.' },
        { icon: 'coins', label: 'Cobras dividendos si la empresa los reparte', bin: 0, why: 'El dividendo es una parte del beneficio que se reparte a los dueños.' },
        { icon: 'alert', label: 'Si la empresa quiebra, cobras el último', bin: 0, why: 'Primero cobran los acreedores; el accionista casi nunca recupera nada.' },
        { icon: 'up', label: 'Ganas mucho si el negocio crece mucho', bin: 0, why: 'El accionista comparte el éxito y el riesgo del negocio.' },
      ],
    },
    goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
    insight: 'Una acción es **renta variable**: lo que ganas no está fijado, depende de cómo le vaya al negocio. El bonista, en cambio, cobra lo pactado.',
    lumi: [
      { when: when('wrong', '>=', 2), say: 'Pista: el dueño comparte éxito y riesgo; el prestamista cobra lo pactado.', mood: 'THINKING' },
      { when: when('done', '>=', 4), say: 'Más riesgo para el dueño, pero también más premio.', mood: 'HAPPY' },
      { say: 'Toca cada tarjeta: ¿dueño o prestamista?', mood: 'HAPPY' },
    ],
  }),
  mission({
    title: 'Una sola acción',
    intro: 'Datos reales: **10.000 €** en Tesla a finales de 2018, en dólares y sin dividendos. Así se vive la renta variable.',
    widget: { kind: 'crash', series: 'series-tsla', amount: 10000 },
    goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
    insight: 'Tesla se multiplicó por casi 19, pero llegó a caer un **72 %**, y es una excepción: solo un **4 %** de las acciones de EE. UU. generó toda la ganancia neta del mercado entre 1926 y 2016. Pruébalo: en Mercado, abre Tesla y mira su rango de 52 semanas: lo más bajo y lo más alto.',
    lumi: [
      { when: when('sold', '==', 1), say: 'Has vendido. Mira lo que pasa después…', mood: 'THINKING' },
      { when: when('drop', '<=', -30), say: 'Un 30 % por debajo de lo que pusiste. ¿Aguantas?', mood: 'WORRIED' },
      { when: when('drop', '>=', 100), say: 'Ya has más que duplicado. ¿Y si ahora cae?', mood: 'THINKING' },
      { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
    ],
  }),
], [
  single('Compras una acción de Inditex. ¿Qué eres?', ['Prestamista de la empresa', 'Copropietario de una parte diminuta de la empresa', 'Cliente con descuento en sus tiendas'], 1, 'Una acción es una parte del capital: participas en sus beneficios y en sus riesgos. Prestar dinero a la empresa sería comprar un bono.'),
  match('Empareja cada término con su significado.', [['Acción', 'Parte del capital de una empresa'], ['OPV', 'Salida a bolsa vendiendo acciones'], ['Dividendo', 'Beneficio repartido en efectivo'], ['Revalorización', 'Subida del precio de la acción']], 'Son las cuatro palabras básicas de la renta variable: qué compras, cómo llega a la bolsa y de dónde sale lo que ganas.'),
  fill('Rentabilidad total = dividendos + ____.', 'revalorización', ['comisiones', 'inflación', 'cupones'], 'Ganas por lo que reparte la empresa (dividendos) y por la subida del precio (revalorización). El cupón es propio de los bonos.'),
  tf('Cuando compras acciones de Inditex en bolsa, ese dinero va a Inditex.', false, 'Normalmente se lo pagas a otro inversor que vende. La empresa solo recibe dinero cuando emite acciones nuevas, como en su salida a bolsa o en una ampliación.'),
  num('Compraste una acción a 40 €. Hoy vale 46 € y este año has cobrado 1 € de dividendo. ¿Cuál es tu rentabilidad total?', 17.5, '%', '(46 − 40 + 1) ÷ 40 = 7 ÷ 40 = 17,5 %. Revalorización (6 €) + dividendo (1 €).'),
  buckets('¿Eres dueño (acción) o prestamista (bono)?', ['Dueño: acción', 'Prestamista: bono'], [['Votas en la junta', 0], ['Cobras un cupón pactado', 1], ['Te devuelven el dinero en una fecha', 1], ['Cobras dividendos si la empresa los reparte', 0], ['Ganas mucho si la empresa crece mucho', 0]], 'El accionista comparte el éxito y el riesgo del negocio; el bonista cobra lo pactado si la empresa puede pagar.'),
  tf('Si una empresa quiebra, los accionistas cobran antes que los bancos y los bonistas.', false, 'Cobran los últimos, después de todos los acreedores, y casi nunca recuperan nada.'),
  single('Según Bessembinder (2018), de unas 26.000 acciones de EE. UU. entre 1926 y 2016, ¿qué parte generó toda la ganancia neta del mercado?', ['Alrededor de un 4 %', 'La mitad', 'Casi todas'], 0, 'Solo un 4 % explicó toda la ganancia neta, y más de la mitad rindió menos que las letras del Tesoro. Por eso una sola acción es arriesgada y conviene diversificar.'),
  timed(tf('A las acciones también se las llama renta variable.', true, 'Lo que ganas no está fijado de antemano: depende de cómo le vaya a la empresa.'), 10),
  chat(['Me he comprado 1 acción de una empresa de videojuegos 🎮', '¿Eso significa que ya soy un poco dueña?'], '¿Qué le contestas a Lumi?', [['Sí: tienes una parte diminuta del negocio, con sus beneficios y sus riesgos', '¡Eso! Una entre millones, pero tuya: si el negocio va bien lo notas, y si va mal, también.'], ['No, solo has comprado un número que sube y baja', 'El precio se mueve cada día, pero detrás hay un negocio real del que tienes una parte.'], ['Sí, y ya puedes mandar en la empresa', 'Puedes votar en la junta, pero tu voto pesa lo que pesan tus acciones: muy poco.']], 0, 'Una acción es propiedad real de una parte del negocio, aunque sea diminuta.'),
  scenario('Tu prima quiere meter todos sus ahorros en una sola acción de moda porque «no para de subir». ¿Qué le aconsejas?', [['Repartir entre muchas empresas, por ejemplo con un fondo que compra las 500 del S&P 500', 'Si una empresa cae, las demás amortiguan el golpe: no depende de acertar la excepción.'], ['Todo a esa acción: si sube tanto, seguirá subiendo', 'Que haya subido no dice lo que hará. Tesla llegó a caer un 72 %: con todo dentro, cae todo su ahorro.'], ['Comprarla, pero vender en cuanto baje un poco', 'Venderá en la primera bajada normal, a menudo perdiendo, y sigue con todo en una sola empresa.']], 0, 'Una sola acción puede multiplicarse o hundirse, y muy pocas generan casi toda la ganancia. Repartir entre muchas evita que todo dependa de una sola; la tentación de «si sube, seguirá subiendo» olvida que también puede caer mucho.'),
  // Nueva (revisión de la sección 0): sustituye al emparejamiento con «OPV», un término que la clase no explica
  scenario('Tesla no reparte dividendos. Tu primo dice que entonces sus acciones no sirven para ganar dinero. ¿Qué le respondes?', [['Que también se gana si sube el precio: es la revalorización', 'Eso: sin dividendos, lo que ganas o pierdes depende de cuánto suba o baje el precio.'], ['Que tiene razón: sin dividendos no se gana nada', 'Se puede ganar con la subida del precio. Quien compró Tesla a finales de 2018 multiplicó su dinero sin cobrar dividendos.'], ['Que la empresa le devolverá el dinero en una fecha', 'Eso es un bono. Una acción no tiene fecha de devolución: ganas o pierdes según su precio.']], 0, 'Con una acción ganas de dos formas: con dividendos y con la revalorización, la subida del precio. Sin dividendos, todo depende del precio, que también puede bajar. La tentadora olvida que el precio puede subir.'),
], { source: '2.1', minutes: 6, retire: [1, 3, 4, 5, 8, 9] })

// Antes en u05 (mismo id: conserva progreso y traducciones)
export const u5l3 = lesson('u5l3', 'Oferta, demanda y precio', [
  play({
    title: 'El libro de órdenes',
    intro: 'Quieres 600 acciones ya y el vendedor más barato pide **10,04 €**. Este es el **libro de órdenes**: a la izquierda, quien quiere comprar (*bid*); a la derecha, quien quiere vender (*ask*).',
    widget: {
      kind: 'book', size: 100, maxSize: 2000,
      bids: [{ price: 10.02, size: 500 }, { price: 10.01, size: 700 }, { price: 10.0, size: 1200 }],
      asks: [{ price: 10.04, size: 300 }, { price: 10.05, size: 800 }, { price: 10.07, size: 1000 }],
    },
    predict: {
      prompt: 'Quieres comprar **600 acciones** ya. ¿A qué precio medio te salen?',
      options: ['A 10,04 €, el mejor precio de venta', 'Algo más caras que 10,04 €', 'A 10,02 €, el mejor precio de compra'],
      answer: 1,
      why: 'Solo hay 300 a 10,04 €: las otras 300 salen a 10,05 €. Pagas 6.027 €, una media de **10,045 €**.',
    },
    goal: { text: 'Compra tantas que tu precio medio se aleje más de un 0,1 % del mejor precio.', when: [when('slippagePct', '>', 0.1)] },
    insight: 'La diferencia entre el mejor *bid* y el mejor *ask* es la **horquilla** o *spread*. Si llegan más compradores con prisa, **se comen la oferta escalón a escalón** y el precio sube.',
    lumi: [
      { when: when('slippagePct', '>', 0.1), say: 'Tu propia compra ha empujado el precio hacia arriba. Así se mueve.', mood: 'THINKING' },
      { when: when('size', '>', 300), say: 'Se acabaron las de 10,04 €: las siguientes salen más caras.', mood: 'THINKING' },
      { say: 'Mueve cuántas acciones compras de golpe', mood: 'HAPPY' },
    ],
  }),
  story('Resultados por sorpresa', [{ id: 'leo', name: 'Leo' }], [
    note('Son las 10:00. La empresa de Leo anuncia que ha ganado mucho más de lo esperado.'),
    say('leo', 'En el libro, el mejor vendedor pedía 10,04 €. ¿Y ahora qué?'),
    choose('¿Qué crees que pasa con el precio?', [
      opt('Sube: los compradores se comen la oferta', 'good', say('lumi', 'Eso. Se agotan las de 10,04 €, se cruza a 10,05 €… y sube.')),
      opt('Nada: el precio lo fija la empresa', 'bad', say('lumi', 'La empresa no fija el precio: es el último acuerdo entre comprador y vendedor.')),
      opt('Depende solo de lo que valga la empresa', 'ok', say('lumi', 'A largo plazo importa. Hoy manda quién tiene más prisa por comprar.')),
    ]),
    say('leo', 'Entonces, ¿el precio es lo que vale la empresa?'),
    say('lumi', 'No: es lo que alguien **acaba de pagar**. Lo mueven noticias, resultados y datos.'),
  ]),
  key('Lo que mueve el precio', 'El precio que ves no es lo que vale la empresa: es lo que alguien **acaba de pagar**. Si llegan más compradores con prisa, sube; si llegan más vendedores, baja.\n\nLa Bolsa de Madrid abre y cierra con una **subasta**: de 8:30 a 9:00 y de 17:30 a 17:35 se juntan las órdenes y se fija un único precio, el que permite más compraventas.', 'El precio es el último acuerdo entre quien más paga y quien menos pide.', 'Pruébalo: en Mercado, abre Inditex y mira cuánto ha subido o bajado hoy.'),
], [
  single('El mejor precio de compra es 20,10 € y el de venta 20,14 €. Si compras ya, ¿a qué precio compras?', ['20,10 €', '20,12 €', '20,14 €'], 2, 'Compras al mejor precio de venta (ask): es lo que pide quien vende.'),
  timed(num('Rápido: en ese libro (20,10 € / 20,14 €), ¿de cuánto es el spread?', 0.04, '€', '20,14 − 20,10 = 0,04 €.'), 15),
  num('Simula tu compra: quieres 600 acciones ya. En el libro hay 300 a 10,04 € y 800 a 10,05 €. ¿Cuánto pagas en total?', 6027, '€', '300 × 10,04 = 3.012 € y 300 × 10,05 = 3.015 €. Total: 6.027 €.'),
  num('En esa compra de 600 acciones por 6.027 €, ¿cuál es tu precio medio por acción?', 10.045, '€', '6.027 ÷ 600 = 10,045 €: un poco más que el mejor precio porque te has comido dos escalones.', 0.02),
  order('Ordena lo que pasa cuando llegan muchos compradores con prisa.', ['Llegan muchas órdenes de compra a mercado', 'Se agotan las acciones a 10,04 €', 'Las siguientes compras se cruzan a 10,05 €', 'El último precio negociado sube'], 'Así sube el precio: la demanda se come la oferta escalón a escalón.'),
  order('Ordena una sesión de la Bolsa de Madrid.', ['Subasta de apertura (8:30-9:00)', 'Mercado abierto (9:00-17:30)', 'Subasta de cierre (17:30-17:35)', 'Se publica el precio de cierre'], 'Dos subastas enmarcan la sesión continua.'),
  tf('Si llegan más vendedores que compradores, el precio tiende a bajar.', true, 'Los vendedores con prisa aceptan precios cada vez más bajos del libro de compra.'),
  multi('¿Qué puede mover el precio de una acción? Marca todos.', ['Los resultados de la empresa', 'Un dato económico', 'Que lleguen más vendedores que compradores', 'El color de su logotipo'], [0, 1, 2], 'Todo lo que cambia lo que la gente está dispuesta a pagar mueve el precio.'),
  scenario('Ana quiere vender ya 2.000 acciones de una empresa pequeña. En el libro de compra hay 300 a 5,00 €, 500 a 4,90 € y 1.200 a 4,70 €. ¿Qué hace?', [['Pone una orden limitada a 5,00 € y vende poco a poco', 'Vende a su precio lo que haya y el resto espera: no regala el valor por las prisas.'], ['Vende las 2.000 a mercado', 'Se come el libro: cobra 9.590 €, una media de unos 4,80 € frente a los 5,00 € del mejor precio.'], ['Vende a mercado y además pone más órdenes a la vez', 'Más presión vendedora sobre un libro pequeño: el precio cae todavía más.']], 0, 'En valores poco líquidos, una orden grande a mercado mueve el precio en tu contra.'),
  timed(tf('El precio de una acción es lo que vale de verdad la empresa.', false, 'Es el último acuerdo entre un comprador y un vendedor; el valor de la empresa es otra cosa.'), 10),
  buckets('¿Empuja el precio hacia arriba o hacia abajo?', ['Hacia arriba', 'Hacia abajo'], [['La empresa gana mucho más de lo esperado', 0], ['Llegan muchos vendedores con prisa', 1], ['Llegan muchos compradores con prisa', 0], ['Sale la noticia de que sus ventas caen', 1]], 'El precio sube cuando hay más ganas de comprar que de vender, y baja al revés. Una buena noticia atrae compradores; una mala, vendedores.'),
], { source: '2.4', minutes: 6, retire: [1, 2, 3, 6, 9] })

// Antes en u06 (mismo id: conserva progreso y traducciones)
export const u6l1 = lesson('u6l1', 'La orden a mercado', [
  play({
    title: 'Comprar ya',
    intro: 'Quieres acciones de una empresa pequeña que casi no se negocia y le das a «comprar ya». Eso es una **orden a mercado**: compra al momento, al mejor precio de venta que haya.',
    widget: {
      kind: 'book', size: 100, maxSize: 2000,
      bids: [{ price: 3.95, size: 300 }, { price: 3.9, size: 500 }, { price: 3.8, size: 800 }, { price: 3.7, size: 1000 }],
      asks: [{ price: 4.0, size: 200 }, { price: 4.05, size: 300 }, { price: 4.2, size: 500 }, { price: 4.4, size: 1000 }],
    },
    predict: {
      prompt: 'Compras **1.000 acciones a mercado**. ¿Qué crees que pasará con tu precio?',
      options: ['Pagas 4,00 €, el mejor precio', 'Pagas bastante más de media', 'Pagas menos: compras al por mayor'],
      answer: 1,
      why: 'Solo hay 200 a 4,00 €. Las 1.000 te salen a **4,115 €** de media: casi un 3 % más.',
    },
    goal: { text: 'Sube la compra hasta las 1.000 acciones.', when: [when('size', '>=', 1000)] },
    insight: 'Una orden a mercado **garantiza que se ejecute, no el precio**. En valores poco líquidos, tu orden se come varios escalones del libro.',
    lumi: [
      { when: when('slippagePct', '>', 2), say: 'Más de un 2 % de más, solo por comprar con prisa.', mood: 'WORRIED' },
      { when: when('size', '>', 200), say: 'Se acabaron las de 4,00 €: ahora pagas más.', mood: 'THINKING' },
      { say: 'Sube la cantidad y mira tu precio medio', mood: 'HAPPY' },
    ],
  }),
  story('Rápido o barato', [{ id: 'laura', name: 'Laura' }], [
    say('laura', 'Quiero 5.000 acciones de una empresa que casi no se negocia.'),
    say('laura', 'Le doy a «comprar a mercado» y listo, ¿no?'),
    choose('¿Qué le aconsejas?', [
      opt('Sí: a mercado pagas el precio que ves', 'bad', say('lumi', 'A mercado aseguras la ejecución, no el precio. Aquí pagaría mucho más.')),
      opt('Mejor una orden con su precio máximo', 'good', say('lumi', 'Eso: una **limitada**. Compra hasta su precio y, si no hay vendedores, espera.')),
      opt('A mercado, pero en varias veces', 'ok', say('lumi', 'Ayuda un poco, pero sigue sin controlar el precio.')),
    ]),
    say('lumi', 'En grandes empresas y en horario normal, la diferencia suele ser de céntimos.'),
  ]),
  key('Cuándo sale cara', '• **Valores poco líquidos** (los que casi nadie compra ni vende): tu orden se come varios escalones del libro.\n• **Apertura o justo tras una noticia:** los precios saltan.\n• **Bolsa cerrada:** se ejecutará en la apertura, al precio que haya entonces.\n\nEn el simulador, la compra a mercado entra al último precio. Antes de comprar, piensa también tu **stop**: el precio al que venderías para cortar la pérdida si baja.', 'A mercado = rapidez garantizada, precio no garantizado.', 'Pruébalo: en Mercado, compra a mercado una gran empresa y mira a qué precio entras.'),
], [
  single('Libro: mejor compra 15,20 €, mejor venta 15,23 €. Das una orden de compra a mercado. ¿A qué precio entras?', ['15,23 €', '15,20 €', '15,215 €'], 0, 'Compras al mejor precio de venta (ask), el que pide quien vende.'),
  single('En ese mismo libro (15,20 € / 15,23 €), si vendes a mercado, ¿cuánto cobras por acción?', ['15,23 €', '15,20 €', '15,215 €'], 1, 'Vendes al mejor precio de compra (bid), el que paga quien compra.'),
  tf('Una orden a mercado garantiza el precio exacto al que compras.', false, 'Garantiza que se ejecute, no el precio: puede salir algo peor de lo que veías.'),
  tf('Una orden a mercado se ejecuta casi seguro si hay compradores y vendedores.', true, 'Por eso es la más rápida: acepta el mejor precio que haya.'),
  simTrade('Simula tu primera compra a mercado: tienes 10.000 € y no quieres arriesgar más de un 1 % (100 €). Coloca un stop por debajo del último mínimo y elige el importe.', 'lvl-3', 'Con una orden a mercado entras al último precio. Primero decides dónde saldrías (el stop) y, con esa distancia, cuánto comprar para no arriesgar más de 100 €.', { cash: 10_000, maxRiskPct: 1 }),
  num('Compras 40 acciones a mercado y se ejecutan a 25,10 €. ¿Cuánto pagas, sin contar comisiones?', 1004, '€', '40 × 25,10 = 1.004 €.'),
  scenario('Laura quiere comprar 5.000 acciones de una empresa muy pequeña que casi no se negocia. Piensa usar una orden a mercado. ¿Qué le conviene?', [['Usar una orden limitada con su precio máximo', 'Compra solo hasta el precio que fija; si no hay vendedores a ese precio, espera.'], ['Comprar a mercado', 'Con un libro tan fino, su orden se come varios escalones y paga mucho más de lo que veía.'], ['Comprar a mercado justo en la apertura', 'En la apertura los precios saltan más: lo peor de los dos mundos.']], 0, 'En valores poco líquidos, la orden a mercado puede salir cara.'),
  timed(single('Rápido: ¿qué te asegura una orden a mercado?', ['Que se ejecute', 'El precio exacto', 'Las dos cosas'], 0, 'Rapidez sí; precio exacto, no.'), 10),
  buckets('¿Orden a mercado razonable o arriesgada?', ['Razonable', 'Arriesgada'], [['10 acciones de una gran empresa del IBEX a media sesión', 0], ['Comprar justo en la apertura tras una noticia bomba', 1], ['Vender un valor que apenas se negocia', 1], ['Un ETF muy negociado a mitad de sesión', 0], ['Dar la orden un sábado para el lunes', 1]], 'Liquidez alta y horario normal: a mercado funciona bien. Poca liquidez, aperturas y noticias: mejor limitar el precio.'),
  order('Ordena lo que pasa al dar una orden de compra a mercado.', ['Pulsas «comprar a mercado»', 'El bróker envía la orden', 'Se cruza con el mejor precio de venta', 'Recibes la confirmación con el precio de ejecución'], 'El precio final lo sabes al final, no al pulsar.'),
  // Nuevas (revisión de la sección 0): sustituyen al ejercicio de la regla del 1 %, que se enseña más adelante
  scenario('A media sesión, das la orden de comprar a mercado 500 € de Apple, una de las empresas más negociadas del mundo. ¿Qué esperas?', [['Entrar casi al precio que ves en pantalla', 'Eso: en empresas muy negociadas y en horario normal, la diferencia suele ser de céntimos.'], ['Entrar exactamente al precio que ves, garantizado', 'A mercado se garantiza que la orden se ejecute, no el precio exacto: puede variar un poco.'], ['Pagar bastante más de lo que ves', 'Eso pasa en valores poco negociados, en la apertura o justo tras una noticia, no aquí.']], 0, 'Con mucha gente comprando y vendiendo a la vez, siempre hay alguien al otro lado a un precio casi igual. La orden a mercado sale cara cuando hay pocos vendedores, no en una gran empresa a media sesión.'),
  scenario('Es sábado y das una orden de compra a mercado de una acción española. ¿Qué pasa?', [['Espera y se ejecuta el lunes en la apertura, al precio que haya entonces', 'Eso: con la bolsa cerrada, la orden espera. El precio del lunes puede ser distinto del de ahora.'], ['Se ejecuta ya, al último precio del viernes', 'Con la bolsa cerrada no hay nadie con quien cruzarla: espera a que abra.'], ['Se cancela sola porque es fin de semana', 'No se cancela: queda pendiente hasta que abra la bolsa.']], 0, 'Con la bolsa cerrada, una orden a mercado se ejecuta en la apertura, al precio que salga entonces. Si llega una noticia el fin de semana, el precio puede saltar: «ya» no significa «a este precio».'),
], { source: '2.5', minutes: 6, retire: [2, 3, 4, 5, 6, 7] })

// Antes en u19 (mismo id: conserva progreso y traducciones)
export const u19l1 = lesson('u19l1', 'Qué muestra un gráfico de precios', [
  play({
    title: '¿Qué te cuenta un gráfico?',
    intro: 'Un amigo te enseña una acción que no para de subir: «¿Compro ya?». En su gráfico, el **tiempo** va en horizontal, el **precio** en vertical y el **volumen** (cuánto se negocia) debajo: ¿qué te dice y qué no?',
    widget: {
      kind: 'sort',
      bins: [{ label: 'Lo dice el gráfico' }, { label: 'No lo dice' }],
      cards: [
        { icon: 'candles', label: 'A qué precio abrió ayer', bin: 0, why: 'Cada vela, la barrita de cada día, guarda su apertura.' },
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
    insight: 'Leer el pasado es fácil; adivinar el futuro, no. Quien estudia gráficos trabaja con **probabilidades, nunca con certezas**.',
    lumi: [
      { when: when('right', '==', 3), say: '¡Tres de tres! Con tan pocas rondas, la suerte pesa mucho.', mood: 'CELEBRATE' },
      { when: when('done', '==', 3), say: 'Acertar el futuro con velas es difícil para todo el mundo.', mood: 'CALM' },
      { say: 'Mira las velas y elige: ¿sube o baja?', mood: 'HAPPY' },
    ],
  }),
  key('Cuatro precios por periodo', 'Cada **vela** resume un periodo (un día, una semana…) con cuatro datos (en inglés, **OHLC**):\n\n• **Apertura** (open): el primer precio.\n• **Máximo** (high) y **mínimo** (low).\n• **Cierre** (close): el último, y el más importante.\n\nEn E-Trading, al pasar el dedo por una vela ves sus cuatro precios, la variación y el volumen. Leer bien un gráfico ya es una ventaja: mucha gente solo mira si está en verde o en rojo.', 'Un gráfico cuenta lo que pasó, no lo que va a pasar.', 'Pruébalo: en Mercado, abre Microsoft, pon el gráfico en velas y pasa el dedo por la última.'),
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
  chat(['Esta acción lleva tres meses subiendo sin parar.', 'Así que seguro que sigue. ¿Meto todos mis ahorros?'], '¿Qué le contestas?', [['El gráfico dice lo que pasó, no lo que pasará: no lo apuestes todo', 'Eso. Puede seguir o darse la vuelta: son probabilidades, no certezas.'], ['Sí: si sube tres meses, seguirá', 'Nadie lo sabe. Un gráfico registra el pasado: la subida puede acabar mañana.'], ['No: si ha subido tanto, seguro que cae', 'Tampoco lo sabes: el gráfico no dice si va a subir o a bajar.']], 0, 'Un gráfico es el registro de lo que ya pasó. Sirve para ver cómo se ha movido el precio, pero no garantiza lo que hará: ni que siga subiendo ni que caiga.'),
], { source: '7.1', minutes: 6, retire: [5, 6, 7, 8] })

// Antes en u01 (mismo id: conserva progreso y traducciones)
export const u1l5 = lesson('u1l5', 'Interés simple e interés compuesto', [
  play({
    title: 'El colchón, el simple y el compuesto',
    intro: 'Tienes **1.000 €** y 30 años por delante. Tres formas de guardarlos:\n\n• **Colchón:** no crecen.\n• **Interés simple:** cobras siempre sobre lo que pusiste.\n• **Interés compuesto:** también ganas sobre lo ya ganado.',
    widget: { kind: 'growth', initial: 1000, monthly: 0, rate: 7, years: 30, maxInitial: 10000, maxMonthly: 500, maxRate: 12, maxYears: 40, lines: ['mattress', 'simple', 'compound'], controls: ['rate', 'years'] },
    predict: {
      prompt: '1.000 € al 7 % al año durante 30 años. ¿Cuánto tendrás con interés compuesto?',
      options: ['Unos 3.100 €', 'Unos 7.600 €', 'Unos 21.000 €'],
      answer: 1,
      why: 'Con interés simple serían 3.100 €. Con compuesto, **7.612 €**: casi dos veces y media más, sin poner ni un euro más.',
    },
    goal: { text: 'Llega a 10.000 € sin añadir dinero: juega con la rentabilidad (lo que gana tu dinero cada año) y los años.', when: [when('final', '>=', 10000)] },
    insight: 'El compuesto **acelera**: los últimos años crecen mucho más que los primeros. Por eso el tiempo pesa tanto como la rentabilidad.',
    lumi: [
      { when: when('rate', '>=', 11), say: 'Tanto no es normal: un 7 % al año ya es mucho a largo plazo.', mood: 'THINKING' },
      { when: when('years', '>=', 35), say: 'Mira el final de la curva verde: ¡se dispara!', mood: 'HAPPY' },
      { say: 'Mueve los años: fíjate en cómo se separan las líneas', mood: 'HAPPY' },
    ],
  }),
  play({
    title: 'Ana y Bruno',
    intro: 'Los dos apartan **200 € al mes** al 7 % hasta los 65. Ana empieza a los 25. ¿Y si Bruno empieza más tarde?',
    widget: { kind: 'race', monthly: 200, rate: 7, endAge: 65, a: { name: 'Ana', age: 25 }, b: { name: 'Bruno', age: 35 }, maxAge: 55 },
    predict: {
      prompt: 'Bruno empieza 10 años después que Ana. A los 65, ¿cuánto tendrá él comparado con ella?',
      options: ['Un 25 % menos', 'Menos de la mitad', 'Casi lo mismo'],
      answer: 1,
      why: 'Ana llega a unos **494.000 €** y Bruno a unos **234.000 €**: menos de la mitad, aunque Ana solo puso 24.000 € más.',
    },
    goal: { text: 'Retrasa a Bruno hasta que Ana tenga el triple que él.', when: [when('ratio', '>=', 3)] },
    insight: 'Cada año que esperas cuesta mucho más de lo que parece: los primeros euros son los que más tiempo tienen para componerse.',
    lumi: [
      { when: when('delay', '>=', 20), say: 'Empezando a los 45, Bruno ya no alcanza a Ana aunque aporte lo mismo.', mood: 'WORRIED' },
      { when: when('delay', '<=', 0), say: 'Si empiezan a la vez, acaban igual. Ahora retrasa a Bruno', mood: 'HAPPY' },
      { say: 'Cada año de retraso abre más la brecha. ¿Hasta dónde llega?', mood: 'THINKING' },
    ],
  }),
  key('También en tu contra', 'El interés compuesto funciona igual con las deudas: si una tarjeta te cobra intereses sobre intereses y no la pagas, lo que debes crece aunque no compres nada más.\n\nY recuerda: son ejemplos, no promesas. La bolsa no da un 7 % cada año.', 'Las ganancias generan nuevas ganancias: cuanto antes empiezas, más trabaja el tiempo por ti.', 'Pruébalo: abre Cartera y mira cuánto ha cambiado tu primera acción desde que la compraste.'),
], [
  num('1.000 € al 7 % de interés compuesto durante 30 años, ¿en cuánto se convierten? (redondea)', 7612, '€', '1.000 × 1,07³⁰ ≈ 7.612 €. Con interés simple serían 3.100 €.', 2),
  single('Ana y Bruno aportan 200 € al mes al 7 %, pero Ana empieza 10 años antes. A los 65, Ana tiene…', ['Un 25 % más', 'Más del doble', 'Lo mismo'], 1, '524.963 € frente a 243.994 €: los primeros años son los que más se componen.'),
  match('Empareja cada caso con el tipo de interés.', [['Cobras siempre sobre lo que pusiste', 'Interés simple'], ['Ganas también sobre lo ya ganado', 'Interés compuesto'], ['Una deuda de tarjeta que crece sobre sí misma', 'Interés compuesto en tu contra']], 'El compuesto acelera el crecimiento… también el de las deudas.'),
  num('10.000 € al 5 % compuesto durante 10 años, ¿cuánto suman? (redondea a euros)', 16289, '€', '10.000 × 1,05¹⁰ ≈ 16.289 €. Con simple serían 15.000 €.', 1),
  tf('El interés compuesto solo funciona a tu favor.', false, 'También en tu contra: una tarjeta revolving al 20 % duplica la deuda en menos de 4 años.'),
  order('Ordena de menos a más el resultado de 100 € al mes durante 30 años.', ['Al 0 %', 'Al 2 %', 'Al 5 %', 'Al 7 %'], '36.000 €, 49.273 €, 83.226 € y 121.997 €: unos pocos puntos de rentabilidad cambian muchísimo el final.'),
  scenario('Tienes 22 años y 50 € al mes para invertir. ¿Qué haces?', [['Espero a ganar más para empezar con algo «serio»', 'Esperar cuesta caro: los primeros años son los que más tiempo tienen para componerse.'], ['Empiezo ya con 50 € y subo la aportación cuando pueda', 'Bien: con el tiempo de tu lado, empezar pronto pesa más que empezar con mucho.'], ['Lo gasto: 50 € no dan para nada', '50 € al mes al 7 % durante 40 años son unos 130.000 €, con 24.000 € aportados.']], 1, 'Empezar pronto, aunque sea con poco, es lo que más aprovecha el interés compuesto.'),
  timed(tf('Con interés compuesto, el dinero crece más deprisa cuanto más tiempo pasa.', true, 'Cada año ganas sobre una base más grande: la curva se empina con el tiempo.'), 10),
  chat(['He visto que si dejo 1.000 € al 7 %, en 30 años tengo 7.600 €.', '¿Y si en vez de 30 son 40 años?'], '¿Qué le dices?', [['Un poco más, unos 8.500 €', 'Mucho más: 1.000 × 1,07⁴⁰ ≈ 14.974 €. Los últimos 10 años casi duplican el resultado.'], ['Casi el doble, unos 15.000 €', '¡Eso! Diez años más al 7 % multiplican por casi 2 (1,07¹⁰ ≈ 1,97).'], ['Lo mismo, el tiempo no importa', 'El tiempo es justo lo que más importa en el interés compuesto.']], 1, 'Cada década extra al 7 % casi duplica el dinero.'),
  scenario('Marta tiene 18 años y 1.000 € de un regalo. Piensa invertirlos «cuando acabe la carrera, dentro de 5 años». ¿Qué le aconsejas?', [['Empezar ya, aunque sea con una parte', 'Cada año que espera es un año menos de interés compuesto: los primeros euros son los que más tiempo tienen para crecer.'], ['Esperar: con 18 años es pronto para invertir', 'Al revés: a los 18 tiene el tiempo de su lado, que es lo que más pesa.'], ['Guardarlos en casa hasta entonces', 'En el colchón no crecen, y con los precios subiendo compran menos cada año.']], 0, 'El tiempo pesa tanto como la rentabilidad: empezar 5 años antes deja que el compuesto trabaje 5 años más. Esperar parece prudente, pero tiene un coste que no se ve.'),
  buckets('¿Interés simple o compuesto?', ['Simple', 'Compuesto'], [['Cobras cada año sobre lo que pusiste al principio', 0], ['Lo que ganas se suma y también genera ganancias', 1], ['La curva se empina cuanto más tiempo pasa', 1], ['Ganas lo mismo el año 1 que el año 30', 0]], 'Con el simple, la ganancia de cada año es siempre igual. Con el compuesto, ganas sobre una base cada vez más grande, y por eso los últimos años crecen mucho más que los primeros.'),
  // Nuevas (revisión de la sección 0): sustituyen a dos con cifras de otra convención (interés mensual nominal)
  // que no cuadraban con la primera clase; ahora salen de growthPath, como las piezas
  order('Ordena de menos a más lo que tendrías tras 30 años apartando 100 € al mes.', ['Al 0 % al año', 'Al 2 % al año', 'Al 5 % al año', 'Al 7 % al año'], 'Más o menos 36.000 €, 49.000 €, 82.000 € y 117.000 €. Pones lo mismo en los cuatro casos, 36.000 €: unos pocos puntos al año cambian muchísimo el final.'),
  scenario('Tienes 22 años y puedes apartar 50 € al mes para invertir. ¿Qué haces?', [['Empiezo ya con 50 € y subo la aportación cuando pueda', 'Bien: con el tiempo de tu lado, empezar pronto pesa más que empezar con mucho.'], ['Espero a ganar más para empezar con algo «serio»', 'Esperar cuesta caro: los primeros euros son los que más años tienen para crecer.'], ['Lo gasto: 50 € no dan para nada', 'Al 7 % al año, 50 € al mes durante 40 años llegan a más de 120.000 €, con 24.000 € puestos.']], 0, 'Empezar pronto, aunque sea con poco, es lo que más aprovecha el interés compuesto. El 7 % es un ejemplo para ver el efecto, no una promesa: la bolsa sube unos años y baja otros.'),
], { source: '1.3', minutes: 6, retire: [0, 1, 3, 5, 6, 7, 8] })

const lessons = [h1l1, u8l1, u5l3, u6l1, u19l1, u1l5]
export default lessons
