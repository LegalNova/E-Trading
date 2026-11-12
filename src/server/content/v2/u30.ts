import 'server-only'
// Sección 10 · Unidad 30 · Gestionar tu cartera (docs/curso-v2/02-curriculo.md)
// Clases interactivas (docs/curso-v2/05-clases-interactivas.md). Cifras calculadas con src/client/play/math.ts:
// mixPath/maxDrawdown sobre mix-classic (charts.json) y growthPath (7 % anual equivalente, como las piezas).
import { buckets, chat, choose, fill, key, lesson, level, match, multi, note, num, opt, order, play, portfolio, say, scenario, simTrade, single, story, text, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u30', order: 30, title: 'Gestionar tu cartera', description: 'Rebalancear, vigilar costes, aportar poco a poco, medir bien y escribir tu plan',
  lessons: [
    lesson('u30l1', 'Rebalancear', [
      play({
        title: 'Un 60/40 que vuelve a su sitio',
        intro: 'Datos reales de 2008 a 2025. Tu cartera es **60 % acciones y 40 % bonos**, y cada enero **vuelves a ese reparto**: rebalanceas.',
        widget: { kind: 'mix', series: 'mix-classic', weights: [60, 40, 0], amount: 10000, rebalance: true },
        predict: {
          prompt: 'Si no la hubieras tocado nunca, ¿cuántas acciones tendría tu 60/40 en 2025?',
          options: ['Más o menos un 60 %', 'Más de un 80 %', 'Menos de un 40 %'],
          answer: 1,
          why: 'Las acciones subieron mucho más que los bonos: sin tocarla, acabó con un **86 % en acciones**. Mucho más riesgo del que elegiste.',
        },
        goal: { text: 'Busca un reparto rebalanceado cuya peor caída no pase del 20 %.', when: [when('maxDD', '>=', -20)] },
        insight: 'Rebalancear mantiene **el riesgo que elegiste**. Sin tocarlo, aquel 60/40 habría ganado más (48.150 € frente a 42.007 €), pero habría acabado con un 86 % en acciones.',
        lumi: [
          { when: when('maxDD', '<=', -35), say: 'Mucha bolsa: aunque rebalancees, la caída es grande.', mood: 'WORRIED' },
          { when: when('maxDD', '>=', -20), say: '¡Eso es! Menos acciones, caídas más pequeñas.', mood: 'CELEBRATE' },
          { say: 'Mueve el reparto y mira la peor caída', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Toca rebalancear?',
        intro: 'Tu plan: **60 % acciones y 40 % bonos**. Corriges si una parte se aleja **más de 5 puntos**. ¿Qué haces en cada caso?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Paso de acciones a bonos' }, { label: 'Paso de bonos a acciones' }, { label: 'No toco nada' }],
          cards: [
            { icon: 'up', label: 'Tras dos años buenos estás en 72/28', bin: 0, why: '12 puntos de más en acciones: vendes un poco o aportas a bonos.' },
            { icon: 'down', label: 'Marzo de 2020: la bolsa se hunde y estás en 50/50', bin: 1, why: 'Da miedo, pero tu regla pide comprar acciones: compras barato.' },
            { icon: 'scale', label: 'Estás en 62/38', bin: 2, why: 'Solo 2 puntos: dentro de tu margen.' },
            { icon: 'rocket', label: 'La bolsa se dispara y estás en 68/32', bin: 0, why: '8 puntos de más: vuelves al 60/40.' },
            { icon: 'alert', label: 'Tras una caída fuerte estás en 53/47', bin: 1, why: '7 puntos de menos en acciones: toca reponer.' },
            { icon: 'calendar', label: 'Estás en 57/43', bin: 2, why: '3 puntos: no hace falta tocar nada.' },
          ],
        },
        goal: { text: 'Decide los seis casos.', when: [when('done', '==', 6)] },
        insight: 'Rebalancear te obliga a **vender algo de lo que más subió y comprar lo que se quedó atrás**, sin adivinar nada. En las caídas da miedo; por eso conviene tener la regla escrita.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Mira cuántos puntos se aleja del 60 %: ¿más de 5?', mood: 'THINKING' },
          { say: '¿Qué haces en cada caso?', mood: 'HAPPY' },
        ],
      }),
      key('Tres formas de rebalancear', '1. **Por calendario:** una vez al año, por ejemplo en enero.\n2. **Por umbral:** cuando una parte se aleja más de 5 puntos.\n3. **Con las aportaciones:** el dinero nuevo va a lo que se ha quedado corto. No vendes, así que no generas impuestos.\n\nCon fondos de inversión también puedes rebalancear por **traspaso**, sin tributar.', 'Calendario, umbral o aportaciones: lo importante es tener una regla y seguirla.', 'Pruébalo: en Cartera, mira el «Peso en cartera» de cada activo frente a tu plan.'),
    ], [
      single('Tu plan es 60/40 y tras una racha buena estás en 72/28. Rebalancear es…', ['Comprar más acciones, que van bien', 'Vender acciones o aportar a bonos hasta volver al 60/40', 'No tocar nada nunca'], 1, 'Vuelves al nivel de riesgo que elegiste con calma.'),
      num('Tienes 10.000 €: 6.000 € en acciones y 4.000 € en bonos. Las acciones suben un 40 % y los bonos se quedan igual. ¿Qué porcentaje de la cartera son ahora las acciones? (redondea a un decimal)', 67.7, '%', 'Acciones: 8.400 €. Total: 12.400 €. 8.400 ÷ 12.400 ≈ 67,7 %.', 1),
      num('Siguiendo el caso anterior (8.400 € en acciones y 4.000 € en bonos), ¿cuántos euros de acciones tendrías que vender para volver al 60 %?', 960, '€', 'El 60 % de 12.400 € son 7.440 €. 8.400 − 7.440 = 960 €, que pasan a bonos.'),
      num('Y si prefieres no vender: ¿cuánto dinero nuevo tendrías que aportar a bonos para volver al 60/40?', 1600, '€', 'Si 8.400 € deben ser el 60 %, el total debe ser 14.000 €. Bonos: 14.000 − 8.400 = 5.600 €. Ya tienes 4.000 €: aportas 1.600 €.'),
      portfolio('Tu cartera se ha ido a 75 % acciones y 25 % renta fija. Tu plan es 60/40. Reparte cómo debería quedar: entre un 58 % y un 62 % en acciones.', [['Fondo indexado de acciones mundiales', 'ACCIONES'], ['Fondo indexado de emergentes', 'ACCIONES'], ['Fondo de bonos globales cubierto a euros', 'RENTA FIJA'], ['Fondo monetario', 'RENTA FIJA']], { minKind: { ACCIONES: 58 }, maxKind: { ACCIONES: 62 } }, 'Volver al 60/40 devuelve la cartera al riesgo que decidiste. Ejemplo educativo, no recomendación.'),
      match('Empareja cada forma de rebalancear con cómo funciona.', [['Por calendario', 'Revisas en una fecha fija, por ejemplo cada enero'], ['Por umbral', 'Corriges si una parte se aleja más de 5 puntos'], ['Con aportaciones', 'El dinero nuevo va a lo que se ha quedado atrás']], 'Las tres sirven; con aportaciones evitas vender y pagar impuestos.'),
      scenario('Marzo de 2020: la bolsa ha caído un 30 % y tu cartera 60/40 está en 50/50. Tu plan dice «rebalanceo si me desvío más de 5 puntos». ¿Qué haces?', [['Vendo todas las acciones antes de que caigan más', 'Justo lo contrario del plan. Y en 2020 el mercado recuperó su máximo en unos 5 meses.'], ['Sigo el plan: muevo dinero de bonos a acciones hasta el 60/40', 'Es lo que pide tu regla. Da miedo, y por eso conviene tenerla escrita de antemano.'], ['Espero a ver qué dicen las noticias', 'Las noticias en pleno pánico no te van a dar el suelo. Tu regla ya decidió por ti.']], 1, 'Rebalancear en las caídas obliga a comprar barato. Por eso es tan útil… y tan difícil sin un plan escrito.'),
      timed(tf('Rebalancear con las aportaciones nuevas evita pagar impuestos por vender.', true, 'Si no vendes, no hay ganancia que declarar.'), 10),
      fill('Si decides corregir solo cuando una parte se aleja más de 5 puntos, rebalanceas por ____.', 'umbral', ['calendario', 'intuición', 'rumor'], 'También se puede hacer por calendario, una vez al año.'),
      single('Con fondos de inversión en España, ¿cómo puedes rebalancear sin pagar impuestos?', ['Vendiendo y comprando en el mismo día', 'Mediante un traspaso entre fondos', 'No se puede'], 1, 'El traspaso entre fondos no tributa hasta el reembolso final. Los ETF no tienen esta ventaja.'),
      scenario('Tu plan es 70 % acciones y 30 % bonos, y tras un buen año estás en 78/22. Este mes vas a aportar 300 €. ¿Qué haces?', [['Aporto los 300 € a acciones, que son las que van bien', 'Así te alejas aún más del plan: cada vez más riesgo del que elegiste.'], ['Aporto los 300 € a bonos, y lo mismo los meses siguientes hasta volver al 70/30', '¡Bien! Rebalanceas sin vender nada, así que no pagas impuestos.'], ['Vendo ya todas las acciones que sobran', 'Funciona, pero si son ETF o acciones, vender con ganancias tributa. Con las aportaciones lo evitas.']], 1, 'Rebalancear con las aportaciones devuelve la cartera a tu plan sin vender, así que no generas impuestos. Meter el dinero en lo que más sube parece lógico, pero te aleja del riesgo que elegiste.'),
    ], { source: '4.6', minutes: 6, retire: [1, 2, 3, 6, 7] }),

    lesson('u30l2', 'El coste de las comisiones a largo plazo', [
      play({
        title: 'Lo que se lleva una comisión',
        intro: 'Inviertes **10.000 €** durante 30 años y el mercado da un 7 % anual (ejemplo, no promesa). Un fondo indexado cobra un **0,2 %**; otro, un **1,5 %**.',
        widget: { kind: 'fees', amount: 10000, monthly: 0, gross: 7, feeA: 0.2, feeB: 1.5, years: 30, maxFee: 2.5, maxYears: 40 },
        predict: {
          prompt: 'A 30 años, ¿cuánto te cuesta elegir el fondo del 1,5 %?',
          options: ['Casi nada: es solo un poco más al año', 'Casi un tercio de lo que tendrías', 'Más de lo que tendrías con el barato'],
          answer: 1,
          why: 'Con el barato acabas con **71.968 €**; con el caro, **49.840 €**. La comisión de más se lleva 22.128 €, un 31 %.',
        },
        goal: { text: 'A 30 años, busca la comisión con la que pierdes más de un tercio.', when: [when('years', '==', 30), when('lostPct', '>=', 34)] },
        insight: 'Las comisiones también **se componen, pero en tu contra**. Un 1,5 % al año suena a poco; a 30 años se lleva casi un tercio de tu dinero.',
        lumi: [
          { when: when('lostPct', '>=', 34), say: '¡Más de un tercio para el fondo! Y el riesgo lo corres tú.', mood: 'SAD' },
          { when: when('years', '<=', 10), say: 'A 10 años aún parece poco. Alarga el plazo.', mood: 'THINKING' },
          { say: 'Sube la comisión del fondo caro', mood: 'HAPPY' },
        ],
      }),
      story('El gestor estrella', [{ id: 'banco', name: 'Tu banco' }], [
        say('banco', 'Te recomiendo nuestro fondo estrella. Gastos: **1,9 %**. El gestor es buenísimo.'),
        say('me', 'La alternativa es un indexado mundial al 0,2 %…'),
        choose('¿Qué piensas?', [
          opt('El gestor estrella compensará la comisión', 'bad', say('lumi', 'SPIVA: en 10 años, el 97 % de estos fondos quedó tras su índice.')),
          opt('Tendría que batir al índice por 1,7 puntos al año solo para empatar', 'good', say('lumi', 'Exacto: cada año, durante décadas. Casi nadie lo consigue.')),
          opt('Da igual, la diferencia es pequeña', 'bad', say('lumi', 'A 30 años, esa diferencia puede ser un tercio de tu dinero.')),
        ]),
        say('lumi', 'Una comisión alta es un **lastre seguro**. Batir al índice, una esperanza incierta.'),
      ]),
      key('Todos los costes', 'Gastos corrientes o **TER** (vienen en el KID), comisión por operación, spread, custodia, cambio de divisa e impuestos.\n\nJohn Bogle, fundador de Vanguard, lo resumía así: «En inversión, obtienes aquello por lo que no pagas».', 'Cada punto de comisión anual se come una parte enorme del resultado por el interés compuesto.', 'Pruébalo: pregúntale a Lumi qué TER es barato para un ETF indexado.'),
    ], [
      num('10.000 € a 30 años con un mercado al 7 %. Sin costes acabas con 76.123 € y con un 1,5 % anual con 49.840 €. ¿Cuánto se ha llevado la comisión?', 26283, '€', '76.123 − 49.840 = 26.283 €: más de un tercio del resultado.', 1),
      num('Mismo caso, pero con un 1,8 % de costes (rentabilidad neta del 5,2 %). ¿Cuánto tendrías a los 30 años? (redondea)', 45759, '€', '10.000 × 1,052³⁰ ≈ 45.759 €, frente a 71.968 € con un 0,2 %.', 2),
      single('Aportando 300 € al mes durante 30 años, ¿cuánto separa un 0,2 % de costes de un 1,8 %?', ['Unos 9.000 €', 'Unos 30.000 €', 'Más de 80.000 €'], 2, 'Unos 338.200 € frente a unos 253.400 € con un mercado al 7 %: casi 85.000 € de diferencia.'),
      tf('Un 1 % anual de comisiones apenas importa a 30 años.', false, 'Por el interés compuesto, cada punto anual se lleva una parte enorme del resultado final.'),
      multi('¿Qué costes debes mirar antes de invertir? Marca todos.', ['Los gastos corrientes o TER del fondo', 'La comisión por compra y venta', 'El cambio de divisa', 'El color de la app'], [0, 1, 2], 'También el spread, la custodia y los impuestos.'),
      fill('El coste anual de un fondo o ETF se llama gastos corrientes o ____.', 'TER', ['IVA', 'IPC', 'PER'], 'Viene en el documento de datos fundamentales (KID).'),
      order('10.000 € a 30 años con un mercado al 7 %. Ordena de más a menos dinero final.', ['Sin costes', 'Costes del 0,2 %', 'Costes del 1,5 %', 'Costes del 1,8 %'], '76.123 €, 71.968 €, 49.840 € y unos 45.759 €.'),
      timed(single('Rápido: ¿de quién es la frase «en inversión, obtienes aquello por lo que no pagas»?', ['John Bogle', 'Elon Musk', 'Isaac Newton'], 0, 'El fundador de Vanguard y del primer fondo indexado para minoristas (1976).'), 12),
      scenario('Tu banco te ofrece un fondo con un 1,9 % de gastos «con un gestor estrella». La alternativa es un indexado mundial al 0,2 %. ¿Qué piensas?', [['El gestor estrella compensará la comisión', 'Según SPIVA, en 10 años un 97 % de los fondos de acciones europeos quedó por detrás de su índice. La estrella tendría que ser excepcional… durante décadas.'], ['Necesitaría batir al índice por 1,7 puntos al año, cada año, para empatar', 'Exacto: es un listón altísimo que casi nadie supera de forma sostenida.'], ['Da igual, la diferencia es pequeña', 'A 30 años, esa diferencia puede ser un tercio de tu dinero.']], 1, 'Una comisión alta es un handicap seguro; batir al índice, una esperanza incierta.'),
      chat(['Mi fondo cobra un 1,5 %, pero este año ha subido un 10 % 🚀', 'Así que el coste da igual, ¿no?'], '¿Qué le contestas a Lumi?', [['Sí, con un 10 % no importa', 'Ese 10 % ya es neto de comisiones, pero sin ellas habría sido un 11,5 %. Y el año que no suba, el 1,5 % se cobra igual.'], ['Compáralo con su índice: si el índice subió un 12 %, el fondo lo hizo peor', '¡Eso! Lo que importa es cuánto te deja frente a la alternativa barata, año tras año.'], ['Entonces mejor un fondo que cobre un 3 %', 'Cobrar más no hace subir más. Lo único seguro de una comisión es que se paga.']], 1, 'Juzga un fondo frente a su índice y durante muchos años, no por un buen año.'),
      scenario('Tienes un ETF del MSCI World que cobra un 0,20 %, con buenas ganancias. Descubres otro del mismo índice al 0,12 %. ¿Qué haces?', [['Vendo el mío ya y compro el barato', 'Vender un ETF con ganancias tributa hoy: pagarías impuestos para ahorrar un 0,08 % al año.'], ['Mantengo el que tengo y llevo las aportaciones nuevas al barato', '¡Eso! Ahorras costes en lo nuevo sin pagar impuestos por vender lo viejo.'], ['Me da igual: los costes no importan', 'Sí importan, pero aquí la diferencia es pequeña. Lo caro sería vender con prisa.']], 1, 'Entre dos ETF baratos del mismo índice, la diferencia es pequeña y vender tiene un coste fiscal seguro. Lo sensato es que el dinero nuevo vaya al más barato. Cambiar de golpe solo compensa cuando la diferencia es grande, como de 1,5 % a 0,2 %.'),
    ], { source: '4.2', minutes: 6, retire: [0, 1, 3, 7, 8] }),

    lesson('u30l3', 'Invertir con poco: 50 € al mes', [
      play({
        title: '50 € al mes',
        intro: 'No hace falta tener miles de euros. Aportas **50 € al mes** y el mercado da un 7 % anual (ejemplo, no promesa).',
        widget: { kind: 'growth', initial: 0, monthly: 50, rate: 7, years: 30, maxInitial: 1000, maxMonthly: 300, maxRate: 10, maxYears: 40, lines: ['mattress', 'compound'], controls: ['monthly', 'years'] },
        predict: {
          prompt: 'A 30 años, ¿con cuánto acabas?',
          options: ['Con lo que has puesto, 18.000 €', 'Con más del triple de lo que pones', 'Con más de un millón'],
          answer: 1,
          why: 'Pones 18.000 € y acabas con unos **58.500 €**: más del triple. El resto lo hace el interés compuesto.',
        },
        goal: { text: 'Sin subir de 50 € al mes, busca con cuántos años pasas de 100.000 €.', when: [when('monthly', '==', 50), when('final', '>=', 100000)] },
        insight: 'Con 50 € al mes, pasar de 30 a 40 años solo añade 6.000 € de tu bolsillo, pero el final salta de unos 58.500 € a **más de 123.000 €**. El **tiempo** hace la mayor parte del trabajo.',
        lumi: [
          { when: when('final', '>=', 100000), say: '¡Seis cifras con 50 € al mes! El tiempo trabaja por ti.', mood: 'CELEBRATE' },
          { when: when('monthly', '>', 50), say: 'Poner más ayuda… pero prueba a alargar los años.', mood: 'THINKING' },
          { say: 'Alarga los años y mira la curva', mood: 'HAPPY' },
        ],
      }),
      story('Esperar a tener 5.000 €', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Tengo 22 años. Quiero esperar a juntar 5.000 € para invertir «en serio».'),
        say('pablo', 'Tardaré unos 4 años. Con poco no merece la pena, ¿no?'),
        choose('¿Qué le dices?', [
          opt('Espera: con poco no merece la pena', 'bad', say('lumi', 'Mientras espera, la inflación muerde y pierde años de interés compuesto.')),
          opt('Empieza ya con poco y de forma automática', 'good', say('lumi', '¡Eso! Empieza el hábito y el tiempo trabaja desde hoy.')),
          opt('Mételo todo en una cripto para llegar antes', 'bad', say('lumi', 'Eso es apostar, no invertir: puede perderlo todo.')),
        ]),
        say('lumi', 'Y si un mes la bolsa baja, tus 50 € compran **más participaciones**.'),
        say('pablo', '¿Y cómo hago para que las comisiones no se lo coman?'),
      ]),
      play({
        title: '¿Ayuda o complica?',
        intro: 'Con poco dinero, los **costes fijos** pesan mucho. ¿Esto te ayuda o te complica?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Ayuda' }, { label: 'Complica' }],
          cards: [
            { icon: 'pie', label: 'Fondos indexados sin importe mínimo', bin: 0, why: 'Puedes empezar con 50 € sin trabas.' },
            { icon: 'calendar', label: 'Aportación automática el día que cobras', bin: 0, why: 'Inviertes antes de gastar, sin tener que pensarlo cada mes.' },
            { icon: 'receipt', label: 'Una comisión fija de 10 € por compra', bin: 1, why: 'Con 50 € al mes, se lleva una quinta parte de cada aportación.' },
            { icon: 'hourglass', label: 'Esperar a tener mucho para empezar', bin: 1, why: 'Pierdes años de interés compuesto.' },
            { icon: 'lock', label: 'Una custodia mínima de 30 € al año', bin: 1, why: 'Con 600 € aportados al año, se come un 5 %.' },
            { icon: 'repeat', label: 'Un plan de aportación periódica sin coste', bin: 0, why: 'Todo tu dinero se pone a trabajar.' },
          ],
        },
        goal: { text: 'Clasifica las seis opciones.', when: [when('done', '==', 6)] },
        insight: 'Con poco dinero, busca **cero comisiones fijas** y automatiza la aportación. Pruébalo: en Mercado, compra 50 € de un ETF mundial, como VWCE, con tu dinero virtual.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿se come una parte fija de cada aportación?', mood: 'THINKING' },
          { say: 'Clasifica cada opción', mood: 'HAPPY' },
        ],
      }),
    ], [
      num('50 € al mes durante 30 años con un 7 % anual (ejemplo, no promesa). ¿Con cuánto acabarías aproximadamente?', 61000, '€', 'Unos 60.999 €, de los que 18.000 € son tus aportaciones y el resto, interés compuesto.', 2),
      num('En ese mismo caso, ¿cuánto dinero habrías aportado tú en total?', 18000, '€', '50 € × 12 meses × 30 años = 18.000 €. Los otros 43.000 € los genera el tiempo.'),
      single('Si en vez de 30 años son 40 (50 € al mes, 7 %), ¿cuánto tendrías aproximadamente?', ['Unos 70.000 €', 'Unos 131.000 €', 'Unos 300.000 €'], 1, 'Diez años más aportan solo 6.000 € más, pero el resultado se duplica de sobra.'),
      num('Inviertes 100 € al mes y el precio pasa por 10, 8, 5, 8 y 10 €. Compras 65 participaciones con 500 €. ¿Cuál es tu precio medio? (dos decimales)', 7.69, '€', '500 ÷ 65 ≈ 7,69 €: por debajo de 10 € aunque el precio empezó y acabó ahí.', 1),
      portfolio('Repartes tus 50 € al mes. Reglas: al menos 2 productos, ninguno por encima del 85 %, como máximo un 5 % en cripto y un 10 % en una acción suelta.', [['Fondo indexado mundial', 'ACCIONES'], ['Fondo de bonos', 'BONOS'], ['Bitcoin', 'CRIPTO'], ['La acción de moda', 'ACCIÓN SUELTA']], { minAssets: 2, maxWeight: 85, maxKind: { CRIPTO: 5, 'ACCIÓN SUELTA': 10 } }, 'La base, diversificada y barata; lo especulativo, pequeño. La cripto es muy volátil y puede perderse la totalidad de lo invertido. Ejemplo, no recomendación.'),
      scenario('Pablo tiene 22 años y quiere esperar a tener 5.000 € ahorrados para empezar a invertir «en serio». Tardará 4 años. ¿Qué le dices?', [['Que espere: con poco no merece la pena', 'Mientras espera, el dinero pierde frente a la inflación y pierde años de interés compuesto.'], ['Que puede empezar ya con una aportación pequeña y automática', 'Bien: empieza el hábito y el tiempo trabaja desde hoy. Ya subirá la cantidad.'], ['Que lo meta todo en una cripto para llegar antes a 5.000 €', 'Eso es apostar, no invertir: puede perderlo todo.']], 1, 'Empezar con poco crea el hábito y aprovecha el tiempo, que es lo que más pesa.'),
      tf('Si cada compra de 50 € te cuesta 2 € de comisión, pierdes un 4 % de entrada.', true, '2 ÷ 50 = 4 %. Con poco dinero, busca opciones sin comisión fija por compra.'),
      buckets('¿Ayuda o complica invertir con poco dinero?', ['Ayuda', 'Complica'], [['Fondos indexados sin importe mínimo', 0], ['Aportación automática el día de cobro', 0], ['Una comisión fija de 10 € por compra', 1], ['Esperar a tener mucho para empezar', 1], ['Una custodia mínima de 30 € al año', 1]], 'Con poco dinero, los costes fijos se comen gran parte de la aportación.'),
      timed(single('Rápido: con una suma grande, ¿qué ganó más veces en los estudios de Vanguard?', ['Invertirla de golpe', 'Repartirla en 3 años', 'Esperar a una caída'], 0, 'Unas dos de cada tres veces, porque el mercado sube más veces de las que baja. Con un sueldo, aportar cada mes es lo natural.'), 12),
      chat(['Solo puedo ahorrar 50 € al mes 😔', 'Con eso no voy a ningún sitio, ¿verdad?'], '¿Qué le contestas a Lumi?', [['Tienes razón, mejor gastarlos', 'Gastar es legítimo, pero 50 € al mes durante décadas pueden ser decenas de miles de euros.'], ['Empieza con 50 € y súbelo cuando ganes más: el tiempo hace el resto', '¡Así se hace! Lo que más pesa es empezar pronto y no parar.'], ['Pide un préstamo para invertir más', 'Invertir con dinero prestado convierte una caída en un problema serio.']], 1, 'Con poco y pronto se llega lejos. Lo importante es el hábito.'),
      scenario('Aportas 50 € cada mes a un fondo indexado. Este mes la bolsa ha caído un 20 %. ¿Qué haces con la aportación?', [['La paro hasta que la bolsa se recupere', 'Justo cuando está barato dejas de comprar: te pierdes las participaciones a mejor precio.'], ['La mantengo: con los mismos 50 € compro más participaciones', '¡Eso! Aportar en las caídas baja tu precio medio sin que tengas que adivinar nada.'], ['Vendo lo que llevo para no perder más', 'Vender en la caída convierte una bajada temporal en una pérdida definitiva.']], 1, 'Con una aportación fija, cuando el precio baja compras más participaciones y tu precio medio baja. Parar en las caídas parece prudente, pero es dejar de comprar justo cuando está más barato.'),
      scenario('Vas a invertir 50 € al mes. El bróker A cobra 3 € por cada compra y su ETF, un 0,10 % al año. El B no cobra por comprar y su ETF cuesta un 0,20 %. ¿Cuál te conviene?', [['El A: su ETF es más barato', 'Su ETF sí, pero 3 € de cada 50 € se van antes de invertir: eso pesa mucho más.'], ['El B: sin comisión fija, todo tu dinero se pone a trabajar', 'Exacto. Con aportaciones pequeñas, una comisión fija por compra es lo más caro.'], ['Da igual: la diferencia es mínima', 'No lo es: con 50 € al mes, 3 € por compra se lleva una parte grande de cada aportación.']], 1, 'Con poco dinero, una comisión fija se come un trozo de cada aportación (3 € de 50 € es mucho más que una décima de punto al año). Por eso el ETF más barato no siempre es la opción más barata.'),
    ], { source: '4.3', minutes: 6, retire: [0, 1, 2, 3, 5, 7] }),

    lesson('u30l4', 'Medir tu rentabilidad bien', [
      story('El fondo ganó; Laura, no', [{ id: 'laura', name: 'Laura' }], [
        note('Laura mete 1.000 € en un fondo. Sube un 20 %: ya tiene 1.200 €.'),
        say('laura', '¡Qué bien va! Le meto 10.000 € más.'),
        note('Justo después, el fondo cae un 10 %. Laura tiene 10.080 €.'),
        choose('¿Laura ha ganado o ha perdido?', [
          opt('Ha ganado: el fondo sube un 8 % en total', 'ok', say('lumi', 'El fondo, sí. Pero Laura puso 11.000 € y tiene 10.080 €.')),
          opt('Ha perdido 920 €, aunque el fondo gane un 8 %', 'good', say('lumi', '¡Exacto! Tenía casi todo dentro justo en la caída.')),
          opt('Ha perdido un 10 %, como el fondo', 'bad', say('lumi', 'El fondo no pierde en total: gana un 8 %. Y ella pierde 920 €.')),
        ]),
        say('lumi', 'Ponderada **por tiempo**: lo que hizo el fondo. Sirve para comparar fondos.'),
        say('lumi', 'Ponderada **por dinero**: lo que ganaste **tú**, según cuándo metiste el dinero.'),
      ]),
      play({
        title: '¿Cuánto es al año?',
        intro: 'Un fondo convierte **10.000 € en 15.000 €** en 5 años: un +50 % en total. ¿Qué ritmo anual es eso?',
        widget: { kind: 'growth', initial: 10000, monthly: 0, rate: 10, years: 5, maxInitial: 20000, maxMonthly: 100, maxRate: 15, maxYears: 10, lines: ['mattress', 'compound'], controls: ['rate'] },
        predict: {
          prompt: '+50 % en 5 años, ¿cuánto es al año?',
          options: ['Un 10 % al año: 50 entre 5', 'Algo menos del 10 % al año', 'Un 50 % al año'],
          answer: 1,
          why: 'El interés se compone: al 10 % anual, 10.000 € serían **16.105 €** en 5 años. Hace falta menos.',
        },
        goal: { text: 'Busca el % anual que convierte 10.000 € en unos 15.000 € en 5 años.', when: [when('final', '>=', 15000), when('final', '<', 15100)] },
        insight: 'Un +50 % en 5 años es un **8,4 % anual**, no un 10 %: anualizar es componer al revés. Compara siempre **% anual con % anual**.',
        lumi: [
          { when: when('final', '>=', 15100), say: 'Te pasas: el interés de cada año también gana interés.', mood: 'THINKING' },
          { when: when('final', '>=', 15000), say: '¡Justo! Ni un 10 % ni un 50 %: algo más de un 8 %.', mood: 'CELEBRATE' },
          { say: 'Mueve el % anual hasta llegar a 15.000 €', mood: 'HAPPY' },
        ],
      }),
      key('Medir con honestidad', 'Resta comisiones e impuestos, compara con un índice de referencia y recuerda la inflación.\n\nUna app que te dice «+40 % desde el inicio» sin decir en cuántos años no te dice casi nada.', 'Para comparar, usa la rentabilidad anualizada; para saber cuánto ganaste tú, la ponderada por dinero.', 'Pruébalo: compara la «Rentabilidad» de tu Cartera con la de SXR8, un ETF del S&P 500, en ese tiempo.'),
    ], [
      num('Inviertes 2.000 € y hoy valen 2.600 €. ¿Cuál es tu rentabilidad simple?', 30, '%', '(2.600 − 2.000) ÷ 2.000 = 0,30 → 30 %.'),
      num('Una inversión gana un 50 % en total en 5 años. ¿Cuál es su rentabilidad anualizada? (un decimal)', 8.4, '%', '1,5^(1/5) − 1 ≈ 0,084 → 8,4 % anual. No es 10 %: el interés se compone.', 2),
      single('Una inversión duplica su valor (+100 %) en 10 años. ¿Su rentabilidad anualizada es…?', ['10 % anual', 'Unos 7,2 % anual', '20 % anual'], 1, '2^(1/10) − 1 ≈ 7,2 %. Cuadra con la regla del 72: 72 ÷ 7,2 = 10 años.'),
      fill('La rentabilidad que mide lo que hizo el fondo, sin importar cuándo metiste dinero, es la ponderada por ____.', 'tiempo', ['dinero', 'riesgo', 'volumen'], 'Es la que se usa para comparar fondos y gestores entre sí.'),
      match('Empareja cada medida con su uso.', [['Rentabilidad simple', 'Cuánto ha cambiado el valor en total'], ['Rentabilidad anualizada', 'El ritmo medio por año'], ['Ponderada por tiempo', 'Comparar fondos entre sí'], ['Ponderada por dinero', 'Saber cuánto has ganado tú']], 'Cada una responde a una pregunta distinta.'),
      num('Laura mete 1.000 €, que suben un 20 % (1.200 €). Entonces aporta 10.000 € más y la cartera cae un 10 %: acaba con 10.080 €. ¿Cuántos euros ha ganado o perdido en total? (usa signo menos si pierde)', -920, '€', 'Aportó 11.000 € y tiene 10.080 €: −920 €. El fondo, en cambio, hizo 1,2 × 0,9 = +8 %.', 1),
      tf('En el caso de Laura, el fondo ganó un 8 % y ella perdió dinero. Las dos cosas pueden ser ciertas a la vez.', true, 'Ponderada por tiempo: +8 %. Ponderada por dinero: negativa, porque tenía casi todo dentro justo en la caída.'),
      timed(single('Rápido: +21 % en 2 años. ¿Rentabilidad anualizada?', ['10 %', '10,5 %', '21 %'], 0, '1,21^(1/2) = 1,10 → 10 % anual. 1,1 × 1,1 = 1,21.'), 15),
      scenario('Una app presume de que tu cartera lleva «+40 % desde el inicio». Empezaste hace 7 años. Un fondo indexado mundial ha dado un 7 % anual en ese tiempo. ¿Cómo lo valoras?', [['Genial: un 40 % es muchísimo', 'Sin el plazo no se sabe: en 7 años, un 40 % es menos de un 5 % anual.'], ['Lo anualizo: 1,4^(1/7) − 1 ≈ 4,9 % anual, por debajo del índice', 'Exacto. Solo al anualizar puedes comparar, y aquí la comparación no sale bien.'], ['Mejor no mirar la rentabilidad', 'Medir bien es justo lo que te permite decidir.']], 1, 'Una cifra total sin plazo no dice nada. Anualiza y compara con un índice de referencia.'),
      multi('¿Qué debes tener en cuenta para medir tu rentabilidad con honestidad? Marca todo.', ['Restar comisiones e impuestos', 'Compararla con un índice de referencia', 'Tener en cuenta la inflación', 'Fijarte solo en el mejor año'], [0, 1, 2], 'El mejor año dice poco: importa el resultado neto, a largo plazo y frente a una alternativa.'),
      scenario('El fondo A anuncia «+60 % en 10 años». El fondo B, «un 6 % anual durante los últimos 5 años». ¿Cuál ha ido mejor cada año?', [['El A: un 60 % es mucho más que un 6 %', 'Comparas un total con un ritmo anual. Hay que pasarlos a la misma medida.'], ['El B: +60 % en 10 años es menos de un 6 % al año, porque el interés se compone', '¡Bien! Repartido entre 10 años y compuesto, ese 60 % da menos que el 6 % anual de B.'], ['No se pueden comparar', 'Sí se puede: anualizando los dos. Y ojo, plazos distintos no dicen qué pasará después.']], 1, 'Para comparar, todo tiene que estar en % anual. 60 entre 10 sería un 6 %, pero al componerse hace falta menos cada año para llegar al 60 %, así que A va por detrás de B.'),
    ], { minutes: 6, retire: [0, 1, 5, 6, 7] }),

    lesson('u30l5', 'Tu Declaración de Política de Inversión', [
      story('Tu plan, en una página', [{ id: 'ana', name: 'Ana' }], [
        say('ana', 'En marzo de 2020 la bolsa cayó un 30 % y lo vendí todo.'),
        say('ana', 'Luego subió y me quedé fuera. ¿Cómo evito que me vuelva a pasar?'),
        say('lumi', 'Con un plan escrito en una página: tu **Declaración de Política de Inversión**.'),
        say('lumi', 'Dice qué haces, por qué y qué harás cuando el mercado se ponga feo.'),
        choose('Punto 8: «Si la bolsa cae un 30 %, yo…»', [
          opt('…vendo todo y vuelvo cuando se calme', 'bad', say('lumi', 'Eso no lo decides en calma: lo decide el miedo.')),
          opt('…no vendo, sigo aportando y rebalanceo si toca', 'good', say('lumi', '¡Eso es un plan! Y rebalancear te hará comprar barato.')),
          opt('…ya veré qué dicen las noticias', 'ok', say('lumi', 'En pleno pánico, las noticias no te darán el suelo. Decide hoy.')),
        ]),
        say('lumi', 'Es el punto más importante: decides hoy, con calma, lo que harás con miedo.'),
      ]),
      play({
        title: '¿Va en tu Declaración?',
        intro: 'Tu plan recoge **reglas que tú controlas**. ¿Qué entra y qué no pinta nada?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Va en el plan' }, { label: 'No pinta nada' }],
          cards: [
            { icon: 'pie', label: 'Reparto: 70 % acciones mundiales y 30 % bonos', bin: 0, why: 'La decisión clave, por escrito.' },
            { icon: 'calendar', label: 'Aporto 200 € el día 1 de cada mes', bin: 0, why: 'Una regla automática que depende de ti.' },
            { icon: 'video', label: 'La acción que recomendó un tiktoker', bin: 1, why: 'Una moda no es un plan.' },
            { icon: 'search', label: 'Dónde estará el IBEX en diciembre', bin: 1, why: 'Nadie lo sabe: las predicciones no van en el plan.' },
            { icon: 'repeat', label: 'Rebalanceo cada enero', bin: 0, why: 'Cuándo vuelves a tu reparto.' },
            { icon: 'lock', label: 'Nunca invertiré con dinero prestado', bin: 0, why: 'Va en «qué no haré nunca».' },
          ],
        },
        goal: { text: 'Clasifica las seis frases.', when: [when('done', '==', 6)] },
        insight: 'Un buen plan tiene **reglas que tú controlas**: reparto, aportaciones, rebalanceo y límites. Ni predicciones ni modas.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Depende de ti o del mercado?', mood: 'THINKING' },
          { say: 'Clasifica cada frase', mood: 'HAPPY' },
        ],
      }),
      story('Bruno quiere más', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Mi plan dice 80 % acciones y 20 % bonos.'),
        say('bruno', 'Pero llevo dos años buenísimos. Me paso al 100 % acciones: los bonos no rinden.'),
        choose('¿Qué le dices?', [
          opt('Hazlo: la bolsa está subiendo', 'bad', say('lumi', 'Subir el riesgo después de las subidas es comprar euforia.')),
          opt('Relee por qué elegiste el 80/20. Si tu vida no ha cambiado, mantenlo', 'good', say('lumi', '¡Bien! El plan existe para no decidir con la emoción del momento.')),
          opt('Pásalo todo a bonos, por si acaso', 'bad', say('lumi', 'Cambiar por miedo tampoco es seguir el plan.')),
        ]),
        say('lumi', 'Revísalo cada año o si cambia tu vida. **Nunca** por el mercado.'),
      ]),
      key('La plantilla', '1. Objetivos («X € en el año Y para Z»).\n2. Horizonte.\n3. Colchón.\n4. Reparto.\n5. Productos y coste máximo.\n6. Aportación automática.\n7. Cuándo rebalanceo.\n8. Qué haré si la bolsa cae un 30 %.\n9. Qué no haré nunca.\n10. Límite para especular (opcional).', 'Un plan escrito en un momento de calma es lo que te salva en un momento de pánico.', 'Pruébalo: pon una alerta un 20 % bajo tu ETF principal; si salta, relee tu plan.'),
    ], [
      order('Ordena las primeras secciones de una Declaración de Política de Inversión.', ['Objetivos', 'Horizonte', 'Colchón', 'Reparto', 'Productos', 'Aportaciones'], 'Primero qué y para cuándo; después con qué colchón, cómo repartir y con qué productos.'),
      fill('La Declaración se revisa una vez al año o cuando cambia tu ____, no cuando cambia el mercado.', 'vida', ['cartera', 'bróker', 'humor'], 'Un trabajo nuevo o un hijo cambian tus objetivos; una caída de la bolsa, no.'),
      single('¿Qué punto de la Declaración es el que más te protege del pánico?', ['La lista de acciones de moda', 'Qué harás si la bolsa cae un 30 %', 'Tu predicción para el año que viene'], 1, 'Lo decides en calma y te lo recuerdas cuando todo el mundo vende.'),
      multi('¿Qué puede ir en la sección «qué no haré nunca»? Marca todas.', ['Invertir con dinero prestado', 'Comprar algo que no entiendo', 'Aportar cada mes de forma automática', 'Poner más del 20 % en un solo activo'], [0, 1, 3], 'Aportar cada mes es parte del plan, no algo que evitar.'),
      buckets('¿Va en tu Declaración o no?', ['Sí, va en el plan', 'No pinta nada'], [['Reparto: 70 % acciones mundiales y 30 % bonos', 0], ['Aporto 200 € el día 1 de cada mes', 0], ['La acción que recomendó un tiktoker', 1], ['Dónde estará el IBEX en diciembre', 1], ['Rebalanceo cada enero', 0]], 'El plan recoge reglas que tú controlas, no predicciones ni modas.'),
      num('Tu Declaración dice que como máximo un 5 % de tu patrimonio irá a especular. Tienes 18.000 €. ¿Cuál es el máximo?', 900, '€', '18.000 × 0,05 = 900 €, y solo dinero que puedas perder entero.'),
      tf('Si la bolsa sube mucho dos años seguidos, conviene reescribir la Declaración con más acciones.', false, 'Cambiar el plan por lo que hizo el mercado es justo lo que la Declaración intenta evitar.'),
      scenario('La Declaración de Bruno dice 80 % acciones y 20 % bonos. Tras dos años muy buenos, quiere pasar al 100 % acciones «porque los bonos no rinden». ¿Qué le dices?', [['Que lo haga: la bolsa está subiendo', 'Subir el riesgo después de las subidas es comprar euforia. Su plan ya tenía en cuenta que los bonos rinden menos.'], ['Que relea por qué eligió el 80/20 y, si su vida no ha cambiado, lo mantenga', 'Bien: el plan existe para no decidir con la emoción del momento.'], ['Que lo pase todo a bonos por si acaso', 'Cambiar por miedo tampoco es seguir el plan.']], 1, 'La Declaración cambia con tu vida, no con el mercado.'),
      timed(tf('Escribir el plan en calma sirve para no decidir en pleno pánico.', true, 'Es su función principal: separar la decisión del momento de miedo.'), 10),
      chat(['La bolsa ha caído un 30 % 😱 Todo el mundo vende.', '¿Qué dice tu Declaración de Política de Inversión?'], '¿Qué le contestas a Lumi?', [['Que venda todo y vuelva cuando se calme', 'Eso no lo decidiste en calma: lo está decidiendo el miedo.'], ['No vendo, sigo aportando, rebalanceo si toca y releo el plan', '¡Eso es tener un plan! Y en caídas así, rebalancear te hace comprar barato.'], ['Pido un préstamo para comprar más', 'Tu Declaración seguramente dice «nunca con dinero prestado». Por algo.']], 1, 'El punto 8 del plan existe para este momento.'),
      scenario('Tu Declaración dice «como mucho un 5 % para especular». Un año después, tu apuesta en una cripto se ha triplicado y ya pesa un 14 % de tu cartera. ¿Qué haces?', [['La dejo correr: está funcionando', 'Ahora un 14 % de tu dinero depende de algo que puede perderse entero. Tu límite era para esto.'], ['Vendo lo que pasa del 5 % y lo llevo al resto de la cartera', '¡Eso es seguir el plan! Te quedas con parte de la ganancia y el riesgo vuelve a su sitio.'], ['Compro más, que va muy bien', 'Subir la apuesta tras una subida es dejar que la euforia decida por ti.']], 1, 'El límite para especular se respeta también cuando sale bien: si la apuesta crece, se recorta hasta su peso. Dejarla correr parece ganar más, pero convierte lo pequeño en lo que más riesgo tiene.'),
      level('Tu Declaración dice «en la parte para especular, siempre con stop». Compras bitcoin al último precio. Coloca el stop algo por debajo del mínimo reciente.', 'lvl-70', 'STOP', 'La regla escrita decide cuánto puedes perder antes de que el miedo o la euforia decidan por ti. El stop va algo por debajo del mínimo reciente: justo encima, cualquier mecha lo saltaría.'),
    ], { source: '4.8', minutes: 6, retire: [4, 5, 6, 7, 8, 9] }),

    lesson('u30l6', 'Reto: tu cartera de 10.000 €', [
      text('El reto', 'Tienes **10.000 €** para invertir a 20 años (ya tienes tu colchón aparte). Construye una cartera diversificada, barata y que puedas defender en una mala racha.\n\nUsa todo lo de la sección: reparto según horizonte, varios países, pocos productos, costes bajos y una parte pequeña para especular si quieres.'),
      key('Cómo se defiende una cartera', 'Con argumentos, no con predicciones: «tengo miles de empresas de todo el mundo, un 20 % en bonos para las caídas, un coste del 0,2 % y una regla escrita para rebalancear». Es un ejercicio para aprender, no una recomendación.', 'Una buena cartera no es la que más sube un año, sino la que puedes mantener 20 años.', 'Pruébalo: monta tu cartera en Mercado con dinero virtual, por ejemplo con VWCE e IEAG.'),
    ], [
      portfolio('Reparte los 10.000 €. Reglas: al menos 4 productos, ninguno por encima del 60 %, al menos un 15 % en bonos, como máximo un 10 % en oro, un 10 % en una acción suelta y un 5 % en cripto.', [['Fondo indexado MSCI World', 'ACCIONES'], ['Fondo indexado de emergentes', 'ACCIONES'], ['Fondo de bonos globales cubierto a euros', 'BONOS'], ['Fondo monetario', 'LIQUIDEZ'], ['Oro (ETC)', 'ORO'], ['Bitcoin', 'CRIPTO'], ['Una acción que te gusta', 'ACCIÓN SUELTA']], { minAssets: 4, maxWeight: 60, minKind: { BONOS: 15 }, maxKind: { ORO: 10, 'ACCIÓN SUELTA': 10, CRIPTO: 5 } }, 'Núcleo diversificado y barato, colchón de bonos para las caídas y lo especulativo limitado. La cripto puede perderse entera. Ejemplo educativo, no recomendación.'),
      simTrade('Reservaste una parte pequeña para especular. Quieres operar el IBEX 35 sin arriesgar más del 1 % de tus 10.000 € (100 €). Elige el importe y coloca el stop.', 'lvl-5', 'La parte especulativa también lleva reglas: el stop y el tamaño deciden cuánto puedes perder, no el mercado.', { cash: 10000, maxRiskPct: 1 }),
      scenario('Primer año: la bolsa cae un 25 % y tu cartera un 18 %. Un amigo te dice que lo vendas todo. ¿Qué haces?', [['Vendo antes de que caiga más', 'Convertir una caída en pérdida definitiva es el error más caro de la historia de los mercados.'], ['Sigo el plan: aporto, rebalanceo a acciones si toca y no vendo', 'Bien: con 20 años de horizonte, un mal año es parte del camino.'], ['Paso todo a bitcoin para recuperar rápido', 'Perseguir la recuperación con más riesgo suele agrandar el agujero.']], 1, 'Los bonos amortiguaron la caída (−18 % frente a −25 %). Ahora toca el punto 8 de tu plan.'),
      scenario('Un compañero te dice: «Vende los bonos y mete todo en la acción que más ha subido este año». ¿Qué le contestas?', [['Le hago caso: los bonos no rinden', 'Los bonos están para las caídas, no para ganar más. Y perseguir lo que más subió suele llegar tarde.'], ['Que mi cartera tiene un reparto elegido para 20 años y no persigo modas', 'Así se defiende una cartera: con el plan, no con el último titular.'], ['Que lo pensaré si sube otro 20 %', 'Esperar a que suba más para entrar es el mismo error con retraso.']], 1, 'Diversificar es renunciar a acertar la estrella del año a cambio de no depender de ella.'),
      single('¿Qué argumento defiende mejor una cartera diversificada?', ['«El año pasado subió más que la de mi primo»', '«Tiene miles de empresas, costes bajos y un reparto que aguanto en una caída»', '«Un influencer dice que va a subir»'], 1, 'Diversificación, coste y tolerancia a las caídas: lo que puedes controlar.'),
      num('Tu cartera: 60 % en un fondo al 0,20 %, 20 % en emergentes al 0,30 % y 20 % en bonos al 0,15 %. ¿Cuántos euros pagas al año sobre 10.000 €?', 21, '€', '0,6 × 0,20 + 0,2 × 0,30 + 0,2 × 0,15 = 0,21 % → 10.000 × 0,0021 = 21 € al año.', 2),
      multi('¿Qué debería tener tu cartera de 10.000 € a 20 años? Marca todo.', ['Diversificación por empresas y países', 'Costes bajos', 'Una regla para rebalancear', 'Una apuesta fuerte en la moda del momento'], [0, 1, 2], 'Lo especulativo, si lo hay, pequeño y limitado.'),
      timed(tf('Una cartera de 10.000 € necesita al menos 15 productos para estar diversificada.', false, 'Con uno a tres fondos indexados ya tienes miles de empresas de todo el mundo.'), 10),
      order('Ordena los pasos para poner en marcha la cartera.', ['Tener el colchón aparte', 'Decidir el reparto', 'Elegir productos baratos', 'Automatizar las aportaciones', 'Rebalancear una vez al año'], 'Primero la base y la decisión clave; después los productos y la disciplina.'),
      chat(['A ver, defiéndeme tu cartera 🧐', '¿Por qué crees que va a funcionar?'], '¿Qué le contestas a Lumi?', [['Porque he elegido lo que más va a subir', 'Nadie sabe qué subirá más. Una cartera que depende de acertar es frágil.'], ['No sé si subirá este año, pero está diversificada, es barata y sé qué haré en una caída', '¡Defensa perfecta! Has hablado de lo que controlas, no de lo que adivinas.'], ['Porque la bolsa siempre sube', 'A largo plazo ha subido, pero con caídas de hasta un 50 % por el camino.']], 1, 'Una cartera se defiende con diversificación, costes y un plan, no con predicciones.'),
    ], { source: '4.5', retire: [5, 7] }),
  ],
})
