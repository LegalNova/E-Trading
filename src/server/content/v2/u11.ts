import 'server-only'
// Sección 3 · Unidad 11 · Otros activos (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, multi, note, num, opt, order, play, say, scenario, single, spot, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u11', order: 11, title: 'Otros activos', description: 'SOCIMIs, derivados, CFD, planes de pensiones y dónde guardar el dinero a corto plazo',
  lessons: [
    lesson('u11l1', 'Inmobiliario en bolsa: SOCIMIs y REITs', [
      play({
        title: '¿Piso propio o SOCIMI?',
        intro: 'Tienes 500 € y quieres invertir en inmuebles. Una **SOCIMI** (en EE. UU., un **REIT**) es una empresa cotizada con oficinas, naves o viviendas en alquiler: ¿piso propio o SOCIMI?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Piso propio' }, { label: 'SOCIMI' }],
          cards: [
            { icon: 'cash', label: 'Necesitas decenas de miles de euros de entrada', bin: 0, why: 'Comprar un piso exige mucho dinero de golpe.' },
            { icon: 'timer', label: 'Puedes vender en segundos', bin: 1, why: 'Cotiza en bolsa: vendes cuando quieras.' },
            { icon: 'building', label: 'Diversificas en muchos inmuebles', bin: 1, why: 'Oficinas, naves, centros comerciales… en una sola acción.' },
            { icon: 'repair', label: 'Tú buscas inquilino y arreglas la caldera', bin: 0, why: 'Con un piso propio, la gestión es tuya.' },
            { icon: 'chart', label: 'Su precio cambia cada día', bin: 1, why: 'Cotiza, así que puede caer como la bolsa.' },
            { icon: 'coins', label: 'Reparte la mayor parte del beneficio en dividendos', bin: 1, why: 'A cambio de pagar muy poco impuesto de sociedades: por eso sus dividendos suelen ser altos.' },
          ],
        },
        goal: { text: 'Clasifica los seis rasgos.', when: [when('done', '==', 6)] },
        insight: 'Con una SOCIMI compras sus acciones en bolsa y pasas a ser dueño de una parte de muchos edificios, **con poco dinero** y pudiendo vender en segundos. Lo que no te quitas es que su precio se mueva cada día.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿cotiza en bolsa o lo tienes que gestionar tú?', mood: 'THINKING' },
          { say: 'Clasifica cada rasgo', mood: 'HAPPY' },
        ],
      }),
      story('¿Ladrillo que cae?', [{ id: 'bruno', name: 'Bruno' }], [
        note('Los tipos de interés suben con fuerza y las SOCIMIs caen un 25 %.'),
        say('bruno', '¿Cómo puede caer tanto algo que tiene edificios detrás?'),
        choose('¿Qué le explicas?', [
          opt('Que eso no debería pasar con inmuebles', 'bad', say('lumi', 'Pasa: se endeudan para comprar y, con tipos altos, financiarse cuesta más.')),
          opt('Que son sensibles a los tipos: es parte de su riesgo', 'good', say('lumi', '¡Eso! Su deuda cuesta más y los bonos compiten con sus dividendos.')),
          opt('Que venda ya, por si acaso', 'ok', say('lumi', 'Si conocía el riesgo al comprar, mejor decidir por su plan que por el susto.')),
        ]),
        say('lumi', 'Conocer de antemano los riesgos de un activo ayuda a no reaccionar en caliente.'),
      ]),
      key('Ventajas y riesgos', 'Una SOCIMI debe repartir al menos el **80 %** del beneficio que sale de los alquileres; un REIT de EE. UU., al menos el **90 %** de su beneficio fiscal.\n\nRiesgos: cotizan y **pueden caer como la bolsa**, sufren con las subidas de tipos (se endeudan y compiten con los bonos) y dependen de su sector, como las oficinas tras la pandemia.', 'Una SOCIMI es ladrillo que cotiza: diversificado y líquido, pero con la volatilidad de la bolsa.', 'Pruébalo: en Mercado, busca Merlin Properties, una SOCIMI del IBEX 35, y mira su gráfico con velas mensuales.'),
    ], [
      single('¿Qué es una SOCIMI?', ['Una cotizada que alquila inmuebles', 'Una hipoteca para inversores', 'Un fondo de inmuebles garantizado por el Estado'], 0, 'Es la versión española de los REIT: inmuebles en alquiler dentro de una empresa que cotiza.'),
      match('Empareja cada concepto con su significado.', [['SOCIMI', 'Inmobiliaria cotizada española'], ['REIT', 'Su equivalente en EE. UU.'], ['Dividendo obligatorio', 'Reparto de la mayor parte del beneficio'], ['Liquidez', 'Poder vender en segundos en bolsa']], 'Inmuebles, reglas de reparto y la ventaja de poder vender cuando quieras.'),
      num('Una SOCIMI obtiene 10 millones de beneficio por alquileres. ¿Qué mínimo tiene que repartir como dividendo?', 8, 'millones de €', 'Al menos el 80 %: 10 × 0,8 = 8 millones.'),
      num('Una SOCIMI cotiza a 10 € y reparte 0,45 € al año. ¿Cuál es su rentabilidad por dividendo?', 4.5, '%', '0,45 ÷ 10 = 4,5 %.'),
      tf('Las SOCIMIs no pueden bajar mucho de precio porque tienen edificios detrás.', false, 'Cotizan en bolsa: en una crisis o con subidas de tipos pueden caer bastante, como otras acciones.'),
      tf('Con una SOCIMI puedes invertir en inmuebles con mucho menos dinero que comprando un piso.', true, 'Basta con comprar unas pocas acciones en bolsa.'),
      buckets('¿Piso propio para alquilar o SOCIMI?', ['Piso propio', 'SOCIMI'], [['Necesitas decenas de miles de euros de entrada', 0], ['Puedes vender en segundos', 1], ['Diversificas en muchos inmuebles', 1], ['Tú buscas inquilino y arreglas la caldera', 0], ['Su precio cambia cada día en bolsa', 1]], 'La SOCIMI da liquidez y diversificación; el piso propio, control total, pero mucho dinero concentrado y trabajo.'),
      scenario('Los tipos de interés suben con fuerza y las SOCIMIs caen un 25 %. Bruno, que tiene algunas, se asusta. ¿Qué tiene en cuenta?', [['Que eso no debería pasar con inmuebles', 'Pasa: se endeudan para comprar y, con tipos altos, financiarse cuesta más y los bonos compiten con sus dividendos.'], ['Que las inmobiliarias cotizadas son sensibles a los tipos y que eso forma parte de su riesgo', 'Bien: si lo sabía al comprar, puede decidir según su plan y no según el susto.'], ['Que el Estado le devolverá la pérdida', 'Nadie garantiza el precio de una acción.']], 1, 'Conocer de antemano los riesgos de un activo ayuda a no reaccionar en caliente cuando aparecen.'),
      timed(single('Rápido: ¿qué parte del beneficio por alquileres debe repartir como mínimo una SOCIMI?', ['80 %', '10 %', '100 %'], 0, 'Es una de las condiciones para su régimen fiscal especial.'), 12),
      multi('¿Qué riesgos tiene invertir en una SOCIMI? Marca todos.', ['Que su precio caiga con la bolsa', 'Que le perjudiquen las subidas de tipos', 'Responder de sus deudas con tu patrimonio', 'Tener que buscar inquilino tú mismo'], [0, 1], 'Su precio cae con la bolsa y las subidas de tipos la perjudican. De buscar inquilinos se ocupa la SOCIMI y, como accionista, no respondes de sus deudas: lo máximo que puedes perder es lo invertido.'),
      scenario('Tienes 300 € y quieres invertir en inmuebles españoles. ¿Qué opción tiene sentido?', [['Comprar acciones de una SOCIMI del IBEX 35, como Merlin Properties', 'Bien: con poco dinero tienes una parte de muchos edificios y puedes vender cuando quieras.'], ['Esperar a tener para la entrada de un piso', 'Puede ser un objetivo, pero tardarías años y lo tendrías todo en un solo inmueble.'], ['Una plataforma que promete un 15 % garantizado en pisos', 'Nadie puede garantizar un 15 %: es la promesa típica de una estafa.']], 0, 'Una SOCIMI te deja invertir en inmuebles con poco dinero, diversificado y con liquidez, a cambio de que su precio se mueva cada día. La rentabilidad garantizada tienta, pero en inversión no existe.'),
      chat(['Las SOCIMIs reparten dividendos altos.', '¿Entonces son como un depósito, pero mejor?'], 'Lumi pregunta si una SOCIMI, con sus dividendos altos, es como un depósito pero mejor. ¿Qué le contestas?', [['No: el dividendo no está garantizado y el precio puede caer como la bolsa', 'Eso. Y el FGD no cubre acciones.'], ['Sí: el dividendo es fijo', 'Depende del beneficio de los alquileres: puede bajar.'], ['Sí, y además las cubre el Fondo de Garantía de Depósitos', 'El FGD cubre depósitos en bancos, no acciones.']], 0, 'Una SOCIMI es una acción: reparte mucho porque la ley la obliga, pero su dividendo depende de los alquileres y su precio cotiza. Compararla con un depósito tienta por el dividendo, pero no tiene interés fijo ni FGD.'),
    ], { minutes: 6, retire: [2, 3, 4, 6, 7, 8] }),

    lesson('u11l2', 'Futuros y opciones en una lección', [
      story('El trigo de Tomás', [{ id: 'tomas', name: 'Tomás' }], [
        note('Tomás es agricultor. Recogerá su trigo dentro de seis meses.'),
        say('tomas', 'Hoy el trigo está a buen precio. ¿Y si cuando coseche ha bajado?'),
        choose('¿Qué puede hacer con los futuros?', [
          opt('Vender hoy futuros y fijar el precio de su trigo', 'good', say('lumi', '¡Cubrirse! Si el precio baja, el futuro compensa; si sube, renuncia a esa ganancia.')),
          opt('Comprar futuros de trigo para ganar si sube', 'bad', say('lumi', 'Así duplica su apuesta a que el trigo sube: lo contrario de cubrirse.')),
          opt('Nada: los futuros solo sirven para especular', 'ok', say('lumi', 'Nacieron precisamente para cubrir riesgos como el suyo.')),
        ]),
        say('lumi', 'Un **futuro** obliga a ambas partes: fecha futura, precio pactado hoy.'),
      ]),
      play({
        title: '¿Obligación o derecho?',
        intro: 'Una **opción** da el derecho, pero no la obligación, de comprar (**call**) o vender (**put**) a un precio pactado, el **strike**. Por ese derecho se paga una **prima**.',
        widget: {
          kind: 'swipe',
          bins: [{ label: 'Tiene una obligación' }, { label: 'Solo tiene un derecho' }],
          cards: [
            { icon: 'document', label: 'Quien compra un futuro', bin: 0, why: 'En un futuro, las dos partes están obligadas a cumplir.' },
            { icon: 'up', label: 'Quien compra una call', bin: 1, why: 'La call da derecho a comprar al strike. Si no le conviene, no la usa.' },
            { icon: 'deal', label: 'Quien vende un futuro', bin: 0, why: 'También está obligado: el futuro obliga a las dos partes.' },
            { icon: 'down', label: 'Quien compra una put', bin: 1, why: 'La put da derecho a vender al strike.' },
            { icon: 'cash', label: 'Quien vende una opción y cobra la prima', bin: 0, why: 'Cobra la prima y asume la obligación si el comprador la ejerce.' },
          ],
        },
        goal: { text: 'Clasifica los cinco casos.', when: [when('done', '==', 5)] },
        insight: 'El futuro **obliga** a las dos partes. La opción da un **derecho** a quien la compra, a cambio de una prima; quien la vende asume la obligación.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: quien paga la prima es quien elige.', mood: 'THINKING' },
          { say: 'Clasifica cada caso', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Tu call, al vencimiento',
        intro: 'Compras una **call** con strike de **100 €** y pagas **5 €** de prima. Al vencimiento, ¿ganas o pierdes?',
        widget: {
          kind: 'swipe',
          bins: [{ label: 'Ganas' }, { label: 'Pierdes' }],
          cards: [
            { icon: 'up', label: 'La acción acaba a 130 €', bin: 0, why: 'Compras a 100 € algo que vale 130 €: 30 € menos 5 € de prima, ganas 25 €.' },
            { icon: 'down', label: 'La acción acaba a 80 €', bin: 1, why: 'No te interesa comprar a 100 €: no la ejerces y pierdes la prima, 5 €.' },
            { icon: 'chart', label: 'La acción acaba a 103 €', bin: 1, why: 'Ejerces y ganas 3 €, pero pagaste 5 € de prima: pierdes 2 €.' },
            { icon: 'rocket', label: 'La acción acaba a 150 €', bin: 0, why: '150 − 100 − 5 = 45 € de ganancia por acción.' },
            { icon: 'snowflake', label: 'La acción se hunde hasta 50 €', bin: 1, why: 'Aunque se hunda, solo pierdes la prima: 5 €.' },
          ],
        },
        goal: { text: 'Resuelve los cinco finales.', when: [when('done', '==', 5)] },
        insight: 'Con una opción comprada ganas si el precio supera **strike + prima** (aquí, 105 €), y lo máximo que pierdes es la **prima**. Quien te la vendió, en cambio, puede perder mucho más.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: por debajo de 105 € no recuperas la prima.', mood: 'THINKING' },
          { say: '¿Ganas o pierdes en cada final?', mood: 'HAPPY' },
        ],
      }),
      key('Por qué no son para empezar', 'Futuros y opciones son **derivados**: su valor depende de otro activo. En un futuro solo depositas una **garantía**, una fracción del valor: eso es apalancamiento.\n\nUn movimiento pequeño se convierte en una ganancia o una pérdida grande y, en algunos casos (vender opciones, futuros), puedes perder más de lo que pusiste. Si no sabes explicar cuánto puedes perder en el peor caso, no operes con derivados.', 'Futuro = obligación a un precio pactado. Opción = derecho a cambio de una prima.', 'Pruébalo: en tu próxima compra del simulador, pon un stop: limita tu pérdida sin usar derivados.'),
    ], [
      match('Empareja cada término con su definición.', [['Futuro', 'Obligación de comprar o vender en una fecha a un precio pactado'], ['Call', 'Derecho a comprar a un precio pactado'], ['Put', 'Derecho a vender a un precio pactado'], ['Prima', 'Lo que pagas por una opción']], 'La diferencia clave: el futuro obliga; la opción comprada solo da un derecho.'),
      fill('Una opción da el ____, pero no la obligación, de comprar o vender.', 'derecho', ['deber', 'dividendo', 'cupón'], 'Por eso quien la compra paga una prima: tiene la libertad de no usarla.'),
      fill('Una opción de compra se llama ____.', 'call', ['put', 'swap', 'strike'], 'La put es la opción de venta; el strike, el precio pactado.'),
      num('Compras una call con strike de 100 € y pagas una prima de 5 €. Al vencimiento la acción vale 112 €. ¿Cuánto ganas por acción?', 7, '€', 'Compras a 100 € algo que vale 112 €: 12 € − 5 € de prima = 7 €.'),
      num('Con la misma call (strike 100 €, prima 5 €), al vencimiento la acción vale 95 €. ¿Cuánto pierdes por acción?', 5, '€', 'No te interesa comprar a 100 € algo que vale 95 €: no ejerces y pierdes la prima, 5 €.'),
      scenario('Un agricultor teme que el precio del trigo baje antes de la cosecha. ¿Qué uso de los futuros tiene sentido para él?', [['Vender hoy futuros para fijar el precio al que venderá su trigo', 'Bien: es una cobertura. Si el precio baja, el futuro compensa; si sube, renuncia a esa ganancia.'], ['Comprar futuros de trigo para ganar más si sube', 'Así duplica su apuesta a que el trigo sube, justo lo contrario de cubrirse.'], ['No hacer nada: los futuros solo sirven para especular', 'Nacieron precisamente para cubrir riesgos como el suyo.']], 0, 'Los derivados pueden reducir un riesgo que ya tienes (cobertura) o crear uno nuevo (especulación).'),
      scenario('Marta ve en redes a alguien que «gana miles al mes vendiendo opciones» y quiere probar con sus ahorros. ¿Qué tiene en cuenta?', [['Que vender opciones es cobrar primas fáciles sin riesgo', 'Cobras primas pequeñas muchas veces… hasta que un movimiento fuerte te hace perder mucho más de lo ingresado.'], ['Que puede perder mucho más de lo que cobra', 'Bien: vender una call sin tener la acción tiene, en teoría, pérdida ilimitada.'], ['Que si sale en redes es que está comprobado', 'Las redes enseñan las ganancias, rara vez las pérdidas.']], 1, 'Quien vende una opción cobra poco y asume un riesgo que puede ser enorme.'),
      tf('Con una opción comprada, lo máximo que puedes perder es la prima.', true, 'Si no te conviene ejercerla, la dejas caducar: pierdes lo que pagaste y nada más.'),
      timed(single('Rápido: ¿qué tipo de opción te da derecho a vender?', ['Put', 'Call', 'Futuro'], 0, 'Put = vender; call = comprar.'), 10),
      buckets('¿Tiene una obligación o solo un derecho?', ['Obligación', 'Derecho'], [['Comprador de un futuro', 0], ['Comprador de una call', 1], ['Vendedor de un futuro', 0], ['Comprador de una put', 1], ['Vendedor de una opción, si el comprador la ejerce', 0]], 'En un futuro, las dos partes se obligan; en una opción, el comprador tiene el derecho y el vendedor, la obligación.'),
      buckets('¿Se cubre de un riesgo o especula?', ['Se cubre de un riesgo que ya tiene', 'Crea un riesgo nuevo (especula)'], [['Una aerolínea compra futuros de petróleo para fijar lo que pagará por el combustible', 0], ['Un agricultor vende futuros de su cosecha', 0], ['Alguien sin acciones compra calls para ganar si la bolsa sube', 1], ['Tienes acciones y compras una put por si caen', 0], ['Vendes calls sin tener la acción para cobrar la prima', 1]], 'Cubrirse es usar el derivado para reducir un riesgo que ya tienes: el combustible, la cosecha, tus acciones. Si no tienes ese riesgo de antes, el derivado no te protege de nada: es una apuesta, y vender calls sin la acción puede salir muy caro.'),
    ], { source: '2.8', minutes: 6, retire: [3, 5, 7, 8, 9] }),

    lesson('u11l3', 'CFD: por qué la mayoría pierde', [
      play({
        title: 'Un 5 % que lo borra todo',
        intro: 'Un anuncio te invita a operar con **CFD** «a 20 a 1». Con un CFD cobras o pagas la diferencia de precio de un activo, **con apalancamiento**: pones una garantía y mueves una posición mucho mayor.',
        widget: { kind: 'leverage', margin: 1000, lev: 1, move: 0, maxLev: 30, maxMove: 10 },
        predict: {
          prompt: 'Pones 1.000 € con un apalancamiento de 20 a 1. ¿Qué caída del precio se lleva toda tu garantía?',
          options: ['Una del 50 %', 'Una del 20 %', 'Una del 5 %'],
          answer: 2,
          why: 'Con 20 a 1 mueves **20.000 €**, y un 5 % de 20.000 € son justo tus 1.000 €: 100 % ÷ 20 = 5 %.',
        },
        goal: { text: 'Con ×20, busca la caída que borra tu garantía.', when: [when('lev', '==', 20), when('wiped', '==', 1)] },
        insight: 'El apalancamiento **multiplica** el movimiento: con ×20, un 5 % en contra se lleva el 100 % de tu garantía. Un movimiento normal de unas semanas puede borrarla.',
        lumi: [
          { when: when('wiped', '==', 1), say: 'Garantía perdida. Y el bróker cierra la posición.', mood: 'SAD' },
          { when: when('pnlPct', '<=', -30), say: 'Un movimiento pequeño, un mordisco enorme.', mood: 'WORRIED' },
          { when: when('pnlPct', '>=', 30), say: 'Multiplica las ganancias… y también las pérdidas.', mood: 'THINKING' },
          { say: 'Sube el apalancamiento y mueve el precio', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Por qué la mayoría pierde',
        intro: 'Simulación: 1.000 personas operan con CFD **sin ninguna ventaja**, como a cara o cruz. Cada operación paga **5 €** entre spread y financiación.',
        widget: { kind: 'coinflip', traders: 1000, trades: 10, maxTrades: 300, fee: 5, stake: 100, win: 1 },
        goal: { text: 'Sube las operaciones hasta que pierdan 3 de cada 4.', when: [when('losersPct', '>=', 75)] },
        insight: 'Sin ventaja, los costes de cada operación hacen que pierda la mayoría. En la realidad, según el aviso obligatorio de la CNMV, **entre un 74 y un 89 %** de los minoristas pierde dinero con CFD.',
        lumi: [
          { when: when('losersPct', '>=', 75), say: 'Tres de cada cuatro en pérdidas. Y nadie lo ha hecho peor que nadie.', mood: 'WORRIED' },
          { when: when('trades', '>=', 100), say: 'Mira la media: cada operación le resta un poco.', mood: 'THINKING' },
          { say: 'Sube las operaciones de cada uno', mood: 'HAPPY' },
        ],
      }),
      key('Lo que exige la UE', 'Un CFD no te da el activo: es un contrato con tu bróker por la **diferencia de precio**. Y pagas **financiación** cada noche que la posición sigue abierta.\n\nApalancamiento máximo para minoristas en la UE: 30 a 1 en divisas principales, 20 a 1 en índices principales y oro, 5 a 1 en acciones y **2 a 1 en cripto**. Y cada bróker debe mostrar el aviso de la CNMV, junto a su propio porcentaje: «Los CFD son instrumentos complejos y están asociados a un riesgo elevado de perder dinero rápidamente debido al apalancamiento». En España está prohibido anunciar CFD al público desde agosto de 2023: si te llega un anuncio, ya es una señal de alarma.', 'El apalancamiento multiplica las ganancias y, sobre todo, las pérdidas: la mayoría de minoristas pierde con CFD.', 'Pruébalo: en Mercado, abre el gráfico del oro con velas semanales y piensa qué le haría cada semana un ×20 a tu garantía.'),
    ], [
      num('Pones 1.000 € de garantía con un apalancamiento de 20 a 1. ¿Qué posición mueves?', 20000, '€', '1.000 × 20 = 20.000 €.'),
      num('Con esa posición de 20.000 €, el activo cae un 2 %. ¿Cuánto pierdes?', 400, '€', '20.000 × 2 % = 400 €: un 40 % de tu garantía por un movimiento del 2 %.'),
      num('Con un apalancamiento de 20 a 1, ¿qué caída del activo se lleva entera tu garantía?', 5, '%', '100 % ÷ 20 = 5 %. Un movimiento normal de unas semanas puede borrarla.'),
      tf('Según el aviso obligatorio de la CNMV, entre un 74 y un 89 % de los inversores minoristas pierden dinero con CFD.', true, 'Es el dato de la intervención de ESMA de 2018, que cada bróker debe mostrar junto a su porcentaje propio.'),
      tf('Con un CFD sobre una acción eres dueño de esa acción.', false, 'Solo tienes un contrato con el bróker por la diferencia de precio: sin propiedad ni voto.'),
      tf('En la UE, un minorista puede operar CFD de cripto con un apalancamiento de 100 a 1.', false, 'El máximo para minoristas en cripto es de 2 a 1.'),
      spot('Marca los mensajes que son señal de peligro o de estafa.', [['Anuncio en redes', '«Multiplica x50 tu dinero con CFD de oro. Sin riesgo. Plazas limitadas.»', true], ['Tu bróker', '«Aviso: entre un 74 y un 89 % de los inversores minoristas pierden dinero con CFD.»', false], ['+357 9…', '«Soy tu gestor personal. Deposita 250 € y te opero con apalancamiento 1:500.»', true], ['Canal «VIP Trading»', '«Copia mis operaciones con CFD: 95 % de aciertos garantizado.»', true], ['Web de la CNMV', '«Lista de advertencias sobre entidades no autorizadas.»', false]], 'Rentabilidad «sin riesgo», apalancamientos prohibidos para minoristas en la UE, «gestores» que te escriben y aciertos garantizados son señales clásicas de chiringuito.'),
      single('¿Por qué la mayoría de minoristas pierde con CFD?', ['Por el apalancamiento y los costes de cada noche', 'Porque los CFD están prohibidos', 'Porque solo se pueden operar de madrugada, con poca liquidez'], 0, 'Apalancamiento, costes de financiación y decisiones en caliente: una combinación que castiga sobre todo al principiante.'),
      timed(single('Rápido: apalancamiento de 10 a 1 y el activo cae un 3 %. ¿Qué parte de tu garantía pierdes?', ['30 %', '3 %', '10 %'], 0, '10 × 3 % = 30 % de la garantía.'), 15),
      scenario('Pablo abrió un CFD con apalancamiento y va perdiendo. El bróker le avisa de que su garantía ha bajado a la mitad de lo exigido. ¿Qué pasa si sigue cayendo?', [['Nada: el bróker espera a que el precio se recupere', 'No: en la UE, al bajar la garantía al 50 % de lo exigido, el bróker cierra la posición y la pérdida se hace real.'], ['El bróker cierra la posición y no puede perder más de lo que tiene en la cuenta', 'Exacto: hay cierre automático y protección frente a saldo negativo para minoristas, pero la pérdida ya es suya.'], ['El bróker le devuelve el dinero perdido', 'Nadie devuelve las pérdidas de un CFD.']], 1, 'Las normas europeas limitan el daño (cierre al 50 % y sin saldo negativo), pero no evitan perder lo depositado.'),
    ], { source: '10.7', minutes: 6, retire: [0, 1, 2, 4, 8] }),

    lesson('u11l4', 'Planes de pensiones', [
      story('Un plan «para desgravar»', [{ id: 'ana', name: 'Ana' }], [
        note('Ana tiene 23 años y su primer sueldo. Su tipo marginal del IRPF es bajo.'),
        say('ana', 'El banco me ofrece un plan de pensiones «para desgravar». Cobra un 1,5 % al año.'),
        choose('¿Qué le dices?', [
          opt('Desgravar siempre compensa', 'bad', say('lumi', 'Con un tipo bajo, ahorra poco. Y pagaría un 1,5 % al año durante décadas.')),
          opt('Depende de su tipo marginal, las comisiones y si necesitará el dinero', 'good', say('lumi', '¡Eso! Compensa con tipo alto hoy, comisiones bajas y dinero que no necesitarás.')),
          opt('Al rescatarlo no pagará impuestos', 'bad', say('lumi', 'Sí pagará: todo lo rescatado tributa como rendimiento del trabajo.')),
        ]),
        say('lumi', 'Un plan de pensiones no es bueno ni malo en general: depende de tu situación.'),
      ]),
      play({
        title: 'La letra pequeña',
        intro: 'Lo que aportas a un **plan de pensiones** reduce tu IRPF de hoy, pero tiene letra pequeña. ¿Ventaja o inconveniente?',
        widget: {
          kind: 'swipe',
          bins: [{ label: 'Ventaja' }, { label: 'Inconveniente' }],
          cards: [
            { icon: 'percent', label: 'Reduce tu IRPF el año en que aportas', bin: 0, why: 'Hasta 1.500 € al año en un plan individual.' },
            { icon: 'lock', label: 'El dinero queda bloqueado durante años', bin: 1, why: 'Solo se rescata en la jubilación o en casos concretos.' },
            { icon: 'receipt', label: 'Al rescatar, tributa todo como rendimiento del trabajo', bin: 1, why: 'Aportaciones y ganancias, a tu tipo marginal de ese momento.' },
            { icon: 'sprout', label: 'Las ganancias no tributan mientras sigue invertido', bin: 0, why: 'El dinero crece sin pagar impuestos hasta el rescate.' },
            { icon: 'bank', label: 'Comisiones altas en muchos planes bancarios', bin: 1, why: 'Míralas: pueden comerse la ventaja fiscal.' },
          ],
        },
        goal: { text: 'Clasifica los cinco rasgos.', when: [when('done', '==', 5)] },
        insight: 'Desgravas al entrar, el dinero crece sin tributar y **pagas al salir**. La balanza depende de tu tipo marginal, de las comisiones y de cuándo necesitarás el dinero.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: piensa en hoy, en los años de espera y en el rescate.', mood: 'THINKING' },
          { say: 'Clasifica cada rasgo', mood: 'HAPPY' },
        ],
      }),
      key('Desgrava hoy, tributa mañana', 'Aportar a un plan individual reduce tu base imponible hasta **1.500 € al año** (hasta 10.000 € en total con aportaciones a planes de empresa). Con un tipo marginal del 30 %, aportar 1.500 € te ahorra **450 €** ese año.\n\nSolo se rescata en la jubilación, en casos concretos (desempleo de larga duración, enfermedad grave, incapacidad, dependencia) o las aportaciones con más de **10 años**. Compensa sobre todo si hoy tu tipo es alto y esperas que sea más bajo al jubilarte. Y mira las comisiones: el plan no te las ahorra.', 'El plan de pensiones aplaza impuestos y bloquea el dinero: útil si hoy pagas mucho IRPF.', 'Pruébalo: pregunta a la profesora Lumi si con tu sueldo de hoy te compensaría un plan de pensiones.'),
    ], [
      num('Tu tipo marginal del IRPF es del 30 % y aportas 1.500 € a tu plan individual. ¿Cuánto IRPF te ahorras ese año?', 450, '€', '1.500 × 30 % = 450 €.'),
      num('Con un tipo marginal del 19 %, ¿cuánto te ahorras aportando 1.500 €?', 285, '€', '1.500 × 19 % = 285 €. Cuanto menor es tu tipo, menor la ventaja.'),
      single('¿Cómo tributa el rescate de un plan de pensiones?', ['Como rendimiento del trabajo, a tu tipo marginal, por todo lo rescatado', 'En la base del ahorro, como un fondo, y solo por la ganancia', 'No tributa'], 0, 'Como las aportaciones desgravaron al entrar, al salir tributa todo.'),
      single('¿Cuál es el límite general de aportación a un plan de pensiones individual?', ['1.500 € al año', '10.000 € al año', 'No hay límite'], 0, 'Se puede llegar a 10.000 € en total solo sumando aportaciones a planes de empresa.'),
      multi('¿Cuándo puedes rescatar un plan de pensiones? Marca todos.', ['Al jubilarte', 'Para comprar tu primera vivienda', 'Las aportaciones con más de 10 años de antigüedad', 'Cuando quieras, pagando una penalización'], [0, 2], 'Al jubilarte y con las aportaciones de más de 10 años; también en casos graves, como el paro de larga duración. Fuera de esos supuestos el dinero está bloqueado: ni pagando una penalización ni para comprar una vivienda.'),
      scenario('Ana tiene 23 años, cobra poco y su tipo marginal es bajo. El banco le ofrece un plan con un 1,5 % de comisión anual «para desgravar». ¿Qué tiene en cuenta?', [['Que desgravar siempre compensa', 'Con un tipo bajo la ventaja fiscal es pequeña, y el dinero queda bloqueado décadas pagando un 1,5 % al año.'], ['Que la ventaja depende de su tipo marginal, de las comisiones y de que no necesite el dinero', 'Bien: compensa más con tipos altos hoy, comisiones bajas y dinero que no vas a necesitar.'], ['Que al rescatarlo no pagará impuestos', 'Pagará: todo lo rescatado tributa como rendimiento del trabajo.']], 1, 'Un plan de pensiones no es bueno ni malo en general: depende de tu tipo marginal, de sus costes y de tu horizonte.'),
      tf('Al rescatar un plan de pensiones solo pagas impuestos por las ganancias, no por lo que aportaste.', false, 'Tributa todo, aportaciones y ganancias, porque las aportaciones ya desgravaron.'),
      timed(tf('Las aportaciones a un plan de pensiones reducen la base imponible del IRPF.', true, 'Con el límite de 1.500 € al año en un plan individual.'), 10),
      order('Ordena la vida de un plan de pensiones.', ['Aportas y reduces tu IRPF ese año', 'El dinero se invierte durante años sin tributar', 'Llega la jubilación u otro supuesto de rescate', 'Rescatas y tributa como rendimiento del trabajo'], 'Desgravas al entrar, el dinero crece sin tributar y pagas al salir.'),
      buckets('¿Ventaja o inconveniente del plan de pensiones?', ['Ventaja', 'Inconveniente'], [['Reduce el IRPF del año en que aportas', 0], ['Dinero bloqueado durante años', 1], ['Al rescatar tributa todo como rendimiento del trabajo', 1], ['Las ganancias no tributan mientras sigue invertido', 0], ['Comisiones altas en muchos planes bancarios', 1]], 'Pesa las dos columnas antes de decidir; la balanza depende de tu situación.'),
      scenario('Javier tiene 50 años, un sueldo alto y un tipo marginal del IRPF alto. No necesitará ese dinero hasta jubilarse. Le ofrecen un plan indexado con comisiones bajas. ¿Le encaja?', [['Sí: desgrava mucho y los costes son bajos', 'Bien: es el caso en que el plan suele compensar, sobre todo si al jubilarse su tipo baja.'], ['No: un plan de pensiones nunca compensa a nadie', 'Depende de cada caso, y el suyo es de los que más ganan con la ventaja fiscal.'], ['Solo si le garantizan la rentabilidad', 'Un plan indexado sube y baja con la bolsa: la ventaja está en los impuestos, no en una garantía.']], 0, 'El plan compensa con un tipo marginal alto hoy, comisiones bajas y un dinero que no se va a necesitar, y Javier cumple las tres. Descartarlo siempre o exigir garantías tienta, pero ignora su situación.'),
      chat(['Me han dicho que de un plan de pensiones saco el dinero cuando quiera.', 'Así lo uso de colchón para emergencias, ¿no?'], 'Lumi quiere usar un plan de pensiones como colchón porque cree que puede sacar el dinero cuando quiera. ¿Qué le contestas?', [['No: queda bloqueado salvo en casos concretos', 'Eso. Para emergencias, mejor una cuenta remunerada.'], ['Sí, funciona como una cuenta', 'No: el dinero queda bloqueado durante años.'], ['Sí, en cualquier momento, pagando una pequeña comisión', 'No es cuestión de comisión: fuera de los supuestos legales, no se puede sacar.']], 0, 'Un plan de pensiones solo se rescata en la jubilación, en casos concretos o con aportaciones de más de 10 años. Usarlo de colchón tienta por la desgravación, pero un colchón tiene que estar disponible al momento.'),
    ], { source: '12.5', minutes: 6, retire: [0, 1, 5, 6, 7, 9] }),

    lesson('u11l5', 'Depósitos, cuentas remuneradas y monetarios', [
      play({
        title: '¿Y lo que compran?',
        intro: 'Tienes **10.000 €** en un depósito que paga un **2,5 %**. La inflación está en el **2,7 %**.',
        widget: { kind: 'realrate', amount: 10000, nominal: 2.5, inflation: 2.7, years: 10, maxNominal: 6, maxInflation: 8 },
        predict: {
          prompt: '¿Ganas poder de compra con ese depósito?',
          options: ['Sí: un 2,5 % al año', 'No: pierdes un poquito cada año', 'Depende del banco'],
          answer: 1,
          why: '2,5 − 2,7 ≈ **−0,2 %** al año: en 10 años tendrás 12.801 €, que comprarán lo que hoy 9.807 €.',
        },
        goal: { text: 'Con esa inflación, busca qué tendría que pagar para ganar un 1 % real.', when: [when('inflation', '==', 2.7), when('real', '>=', 1)] },
        insight: 'Para ganar un 1 % real con un 2,7 % de inflación, el depósito tendría que pagar casi un **3,75 %**, y eso antes de la retención del 19 %. Estos productos son para **guardar**, no para hacerse rico.',
        lumi: [
          { when: when('real', '<', 0), say: 'Tu saldo sube, pero compra un poco menos cada año.', mood: 'WORRIED' },
          { when: when('real', '<', 1), say: 'Ya no pierdes. Sigue subiendo un poco más.', mood: 'THINKING' },
          { say: 'Sube lo que paga el depósito', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Lo cubre el FGD?',
        intro: 'El **Fondo de Garantía de Depósitos** (FGD) cubre hasta **100.000 €** por titular y entidad si un banco quiebra. ¿Qué cubre?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Sí, hasta 100.000 €' }, { label: 'No' }],
          cards: [
            { icon: 'card', label: 'Cuenta corriente', bin: 0, why: 'Es dinero depositado en un banco.' },
            { icon: 'lock', label: 'Depósito a 12 meses', bin: 0, why: 'Cubierto hasta 100.000 € por titular y entidad.' },
            { icon: 'pie', label: 'Fondo monetario', bin: 1, why: 'Es un fondo de inversión: sin FGD, pero su patrimonio está separado de la gestora.' },
            { icon: 'company', label: 'Acciones de un banco', bin: 1, why: 'Son una inversión, no un depósito.' },
            { icon: 'piggy', label: 'Cuenta remunerada', bin: 0, why: 'Dinero depositado en un banco: cubierto.' },
            { icon: 'bitcoin', label: 'Una stablecoin', bin: 1, why: 'El FGD cubre depósitos en bancos, no criptoactivos.' },
          ],
        },
        goal: { text: 'Clasifica los seis productos.', when: [when('done', '==', 6)] },
        insight: 'El FGD cubre el dinero **depositado en bancos**, no las inversiones. El monetario no lo tiene, pero su riesgo es muy bajo (no nulo) y, como fondo, se puede **traspasar** sin tributar.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿es un depósito en un banco o una inversión?', mood: 'THINKING' },
          { say: 'Clasifica cada producto', mood: 'HAPPY' },
        ],
      }),
      story('El colchón de Bruno', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Quiero un colchón de 6.000 € para emergencias. Dudo entre tres opciones.'),
        note('Un depósito a 3 años con penalización por cancelar, una cuenta remunerada sin permanencia o un ETF de acciones.'),
        choose('¿Qué encaja mejor con un colchón?', [
          opt('El depósito a 3 años, que paga algo más', 'ok', say('lumi', 'Si surge una emergencia, cancelarlo le costará la penalización.')),
          opt('La cuenta remunerada sin permanencia', 'good', say('lumi', '¡Bien! Disponible al momento, cubierta por el FGD y con algo de interés.')),
          opt('El ETF de acciones, que rinde más', 'bad', say('lumi', 'En una crisis puede caer un 30 % justo cuando más lo necesite.')),
        ]),
        say('lumi', 'Un colchón no está para rendir: está para estar ahí cuando lo necesites.'),
      ]),
      key('Tres sitios para el corto plazo', '• **Cuenta remunerada:** paga intereses y sacas el dinero cuando quieras. Ojo a los límites: a veces solo remunera hasta cierta cantidad o unos meses.\n• **Depósito a plazo:** inmovilizas el dinero un tiempo a un tipo fijo.\n• **Fondo monetario:** deuda a muy corto plazo y de alta calidad; su rentabilidad sigue a los tipos del BCE.\n\nCompara siempre la **TAE** y las condiciones. Son para el colchón de emergencia y lo que necesitarás en meses o pocos años, no para el largo plazo.', 'Corto plazo: liquidez y seguridad antes que rentabilidad.', 'Pruébalo: abre tu Cartera y mira cuánto dinero virtual tienes sin invertir: es tu colchón en el simulador.'),
    ], [
      match('Empareja cada producto con su rasgo.', [['Cuenta remunerada', 'Dinero disponible cuando quieras'], ['Depósito a plazo', 'Dinero inmovilizado a un tipo fijo'], ['Fondo monetario', 'Deuda a muy corto plazo; se puede traspasar'], ['FGD', 'Cubre hasta 100.000 € por titular y entidad']], 'Tres productos para el corto plazo y la red de seguridad que cubre a dos de ellos.'),
      num('Tienes 6.000 € en una cuenta al 2 % TAE durante un año. ¿Cuánto ganas de interés bruto?', 120, '€', '6.000 × 2 % = 120 € brutos (después se retiene un 19 %).'),
      num('Una cuenta paga un 3 % TAE, pero solo por los primeros 5.000 €; el resto, un 0 %. Tienes 8.000 €. ¿Interés bruto en un año?', 150, '€', '5.000 × 3 % = 150 €; los otros 3.000 € no rinden nada. Sobre 8.000 €, un 1,875 %.'),
      num('Un depósito paga un 2,5 % y la inflación es del 2,7 %. ¿Rentabilidad real aproximada antes de impuestos?', -0.2, '%', '2,5 − 2,7 = −0,2 %: ni siquiera mantiene el poder de compra.', 5),
      single('¿Cuál de estos productos NO está cubierto por el Fondo de Garantía de Depósitos?', ['Fondo monetario', 'Depósito a plazo', 'Cuenta remunerada'], 0, 'El FGD cubre depósitos; el monetario es un fondo de inversión, con su patrimonio separado de la gestora.'),
      buckets('¿Cubierto por el FGD?', ['Sí, hasta 100.000 €', 'No'], [['Cuenta corriente', 0], ['Depósito a 12 meses', 0], ['Fondo monetario', 1], ['Acciones de un banco', 1], ['Cuenta remunerada', 0]], 'El FGD cubre el dinero depositado en bancos, no las inversiones en fondos ni en acciones.'),
      scenario('Bruno quiere un colchón de emergencia de 6.000 €. Duda entre un depósito a 3 años con penalización por cancelar, una cuenta remunerada sin permanencia y un ETF de acciones. ¿Qué encaja mejor con un colchón?', [['El depósito a 3 años, que paga algo más', 'Si surge una emergencia, cancelarlo le costará la penalización.'], ['La cuenta remunerada sin permanencia', 'Bien: disponible al instante, cubierta por el FGD y con algo de interés.'], ['El ETF de acciones, que rinde más a largo plazo', 'En una crisis puede caer un 30 % justo cuando más lo necesite.']], 1, 'Un colchón tiene que estar disponible y no depender de la bolsa.'),
      timed(single('Rápido: ¿qué mide la TAE?', ['La rentabilidad anual comparable de un producto', 'La comisión del banco', 'La inflación del año'], 0, 'Permite comparar productos con plazos y pagos distintos.'), 12),
      tf('En España, un fondo monetario se puede traspasar a otro fondo sin tributar.', true, 'Es un fondo de inversión, así que tiene el régimen de traspasos.'),
      tf('Un fondo monetario no puede perder dinero nunca.', false, 'Su riesgo es muy bajo, no nulo: invierte en deuda que, en casos extremos, puede bajar de precio o no pagarse.'),
      scenario('Una cuenta anuncia un «4 % TAE». La letra pequeña: solo durante 3 meses y hasta 5.000 €. Tienes 10.000 € de colchón. ¿Qué haces?', [['La contrato ya: un 4 % es mucho y puede acabarse', 'Solo pagaría ese 4 % unos meses y por la mitad de tu dinero: el resto del año, quizá nada.'], ['Calculo lo que me daría en todo el año', 'Bien: lo que importa es lo que cobras de verdad por todo tu dinero durante el año.'], ['Lo meto en acciones, que rinden más', 'Es tu colchón: tiene que estar disponible y no depender de la bolsa.']], 1, 'Las ofertas con límite de tiempo o de cantidad pagan mucho menos de lo que anuncian sobre todo tu dinero. El número grande del anuncio tienta, pero lo que manda son las condiciones.'),
      buckets('¿Dónde encaja mejor cada dinero?', ['Cuenta remunerada, depósito o monetario', 'Fondo o ETF de acciones'], [['El colchón de emergencia', 0], ['Un viaje dentro de 6 meses', 0], ['La jubilación, dentro de 40 años', 1], ['La entrada de un piso dentro de 1 año', 0], ['Una aportación mensual para dentro de 20 años', 1]], 'Lo que necesitarás pronto tiene que estar seguro y disponible, aunque rinda poco. Para décadas, la bolsa compensa sus caídas; para unos meses, no da tiempo a recuperarse de una.'),
    ], { source: '1.4', minutes: 6, retire: [1, 2, 3, 5, 6, 7] }),
  ],
})
