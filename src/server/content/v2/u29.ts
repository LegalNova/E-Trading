import 'server-only'
// Sección 10 · Unidad 29 · Diversificación (docs/curso-v2/02-curriculo.md)
// Clases interactivas (docs/curso-v2/05-clases-interactivas.md). Las cifras de las carteras salen de mixPath y maxDrawdown
// (src/client/play/math.ts) con la serie mix-classic de charts.json; las de Japón, de series-japan.
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, num, opt, order, play, portfolio, say, scenario, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u29', order: 29, title: 'Diversificación', description: 'Repartir bien: empresas, activos, países, carteras indexadas, factores y ESG',
  lessons: [

    lesson('u29l2', 'La correlación', [
      play({
        title: 'Acciones, bonos y oro desde 2008',
        intro: 'Datos reales de 2008 a 2025. Tienes **10.000 €**, todo en acciones de EE. UU. Mézclalas con bonos y oro y mira la peor caída.',
        widget: { kind: 'mix', series: 'mix-classic', weights: [100, 0, 0], amount: 10000 },
        predict: {
          prompt: 'Entre enero de 2008 y febrero de 2009, las acciones cayeron un 45 %. ¿Qué hicieron los bonos?',
          options: ['Cayeron todavía más', 'Ganaron un poco', 'Cayeron lo mismo'],
          answer: 1,
          why: 'Los bonos de EE. UU. **ganaron un 2 %** mientras las acciones perdían un 45 %. No se movieron igual.',
        },
        goal: { text: 'Busca un reparto cuya peor caída sea como mucho la mitad (−23 %) y que aun así gane más de un 300 %.', when: [when('maxDD', '>=', -23), when('totalPct', '>=', 300)] },
        insight: 'Acciones, bonos y oro tuvieron su peor racha en años distintos (2009, 2022 y 2015). Mezclarlos baja la peor caída de **−46 %** a cerca de **−20 %**: eso es combinar activos con **correlación baja**.',
        lumi: [
          { when: when('w0', '==', 100), say: 'Todo en acciones: mira el agujero de 2008 y 2009.', mood: 'WORRIED' },
          { when: when('maxDD', '>=', -23), say: '¡La mitad de susto! Mira cuánto ganas aun así.', mood: 'CELEBRATE' },
          { say: 'Baja las acciones y reparte entre bonos y oro', mood: 'THINKING' },
        ],
      }),
      story('Tres fondos, una cartera', [{ id: 'marta', name: 'Marta' }], [
        say('marta', 'Tengo tres fondos: MSCI World, S&P 500 y Nasdaq 100. Superdiversificada, ¿no?'),
        choose('¿Qué le dices?', [
          opt('Sí: son tres índices distintos', 'bad', say('lumi', 'Tres nombres, casi la misma cartera: EE. UU. y las grandes tecnológicas se repiten.')),
          opt('Se solapan mucho: se moverán casi igual', 'good', say('lumi', 'Exacto: su correlación es muy alta. Un fondo mundial haría casi lo mismo.')),
          opt('Te faltan fondos: con diez estarías mejor', 'ok', say('lumi', 'Más fondos que compran lo mismo no reducen el riesgo.')),
        ]),
        say('marta', 'Vale. ¿Y qué me protege cuando cae todo?'),
        say('lumi', 'En un pánico, casi todo lo arriesgado cae a la vez: **las correlaciones suben**.'),
        say('lumi', 'Suelen proteger los bonos de calidad y la liquidez.'),
        say('lumi', 'Pero no siempre: en 2022, acciones −18 % y bonos −13 %.'),
      ]),
      key('Cómo se mide', 'La **correlación** dice si dos activos se mueven a la vez. Va de **+1** (siempre igual) a **−1** (siempre al contrario). Un **0** significa que no hay relación.\n\n• S&P 500 y Euro Stoxx 50: alta (0,7-0,9).\n• Dos criptos grandes: muy alta.\n• Acciones y bonos de calidad: baja o negativa en muchas crisis.\n• Acciones y oro: baja y variable.', 'Diversificar de verdad es tener cosas que no se hundan todas el mismo día.', 'Pruébalo: sigue SPY, TLT y GLD en Mercado y compáralos el próximo día rojo.'),
    ], [
      match('Empareja cada correlación con su significado.', [['+1', 'Se mueven siempre igual'], ['−1', 'Se mueven siempre al contrario'], ['0', 'No hay relación entre ellos'], ['0,8', 'Suelen moverse en la misma dirección']], 'Cuanto más cerca de +1, menos te protege uno del otro.'),
      single('¿Qué pareja suele tener una correlación más alta?', ['Bitcoin y ethereum', 'Acciones y bonos del Estado de calidad', 'Acciones y oro'], 0, 'Las grandes criptos tienden a subir y caer juntas: combinarlas apenas diversifica.'),
      trend('Así se movió el oro entre 2018 y el verano de 2020, incluido el desplome de las bolsas de marzo de 2020. ¿Qué tendencia ves?', 'hist-gold-2020', 'Alcista', 'Mientras las bolsas se hundían, el oro siguió su camino: por eso se dice que su correlación con las acciones es baja.'),
      upDown('Enero de 2022: bonos del Tesoro de EE. UU. a más de 20 años. La inflación se dispara y la Reserva Federal anuncia subidas de tipos. ¿Qué hicieron en los meses siguientes?', 'hist-rates-2022', 'El precio de un bono depende mucho de los tipos de interés: por eso su relación con las acciones cambia según la inflación.', 'los meses siguientes'),
      buckets('¿Correlación alta o baja?', ['Alta: se mueven parecido', 'Baja o variable'], [['S&P 500 y Euro Stoxx 50', 0], ['Dos fondos que replican el MSCI World', 0], ['Bitcoin y solana', 0], ['Acciones y bonos del Estado de calidad', 1], ['Acciones y oro', 1]], 'Las bolsas desarrolladas y las criptos van muy juntas; bonos de calidad y oro suelen ir más por libre.'),
      scenario('Marta tiene tres fondos: uno del MSCI World, otro del S&P 500 y otro del Nasdaq 100. Dice que está muy diversificada. ¿Qué opinas?', [['Tiene razón: son tres índices distintos', 'Tres nombres, casi la misma cartera: EE. UU. pesa mucho en los tres y las grandes tecnológicas se repiten.'], ['Se solapan mucho: se moverán casi igual', 'Exacto: su correlación es muy alta. Un fondo mundial haría casi lo mismo con menos lío.'], ['Solo estaría diversificada con 10 fondos', 'Más fondos que compran lo mismo no reducen el riesgo.']], 1, 'Lo que diversifica es combinar activos con correlación baja, no sumar fondos parecidos.'),
      tf('En 2022, acciones y bonos cayeron a la vez.', true, 'La inflación y las subidas rápidas de tipos golpearon a los dos: ninguna protección funciona siempre.'),
      timed(tf('En un pánico de mercado, las correlaciones entre activos de riesgo suelen subir.', true, 'Casi todo lo arriesgado cae a la vez: por eso la liquidez y los bonos de calidad son los que suelen proteger.'), 10),
      fill('Una correlación de ____ significa que dos activos se mueven siempre en sentido contrario.', '−1', ['+1', '0', '0,5'], 'Es el extremo opuesto: cuando uno sube, el otro baja.'),
      single('En la mayoría de los pánicos bursátiles, ¿qué ha protegido mejor una cartera?', ['Más acciones de otros países desarrollados', 'Bonos de calidad y liquidez', 'Criptomonedas'], 1, 'Las bolsas de otros países suelen caer a la vez. Los bonos de calidad y la liquidez son los que menos se mueven con ellas.'),
    ], { source: '3.5', minutes: 6, retire: [6, 7, 8] }),

    lesson('u29l3', 'Tu reparto de activos', [
      mission({
        title: 'Elige tu reparto',
        intro: 'Datos reales de 2008 a 2025. Empiezas con **10.000 €** todo en bonos. Sube las acciones y mira cuánto llegó a caer la cartera en lo peor.',
        widget: { kind: 'mix', series: 'mix-classic', weights: [0, 100, 0], amount: 10000 },
        predict: {
          prompt: 'Con todo en acciones desde 2008, ¿cuánto llegó a caer la cartera en lo peor?',
          options: ['Un 10 %', 'Casi la mitad', 'Todo'],
          answer: 1,
          why: 'Un **46 %** entre 2008 y 2009, con dividendos incluidos. Con 60 % en acciones y 40 % en bonos, un 27 %.',
        },
        goal: { text: 'Pon al menos un 60 % en acciones sin que la peor caída pase del 30 %.', when: [when('w0', '>=', 60), when('maxDD', '>=', -30)] },
        insight: 'El **reparto entre acciones, bonos y liquidez** decide cuánto puede caer tu cartera. Aquí, con el resto en bonos: 40 % en acciones, −21 %; 60 %, −27 %; 80 %, −37 %; 100 %, −46 %.',
        lumi: [
          { when: when('maxDD', '<=', -40), say: 'Casi la mitad, evaporada. ¿Aguantarías sin vender?', mood: 'WORRIED' },
          { when: when('maxDD', '<', -30), say: 'Te pasas del 30 %: baja un poco las acciones.', mood: 'THINKING' },
          { when: when('w0', '<=', 20), say: 'Muy tranquilo… pero mira lo poco que crece.', mood: 'CALM' },
          { when: when('w0', '>=', 60), say: 'Más crecimiento, con caídas que todavía se aguantan.', mood: 'CELEBRATE' },
          { say: 'Sube las acciones poco a poco', mood: 'HAPPY' },
        ],
      }),
      story('La entrada del piso', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Tengo 15.000 € para la entrada de un piso. Lo compro dentro de 2 años.'),
        say('pablo', 'Lo tengo todo en bolsa, que a la larga sube.'),
        choose('¿Qué le dices?', [
          opt('Bien hecho: a la larga siempre sube', 'bad', say('lumi', 'A 2 años no hay «larga». Una caída del 30 % le dejaría sin entrada.')),
          opt('Pásalo a algo de poco riesgo, como un depósito o un monetario', 'good', say('lumi', '¡Eso! El dinero con fecha cercana no debe depender de la bolsa.')),
          opt('Deja la mitad en bolsa, por si sube', 'ok', say('lumi', 'Menos riesgo, pero esa mitad aún puede caer justo antes de comprar.')),
        ]),
        say('pablo', '¿Y lo de la jubilación? Me quedan 35 años.'),
        say('lumi', 'Ahí sí caben muchas acciones: hay tiempo para recuperarse de las caídas.'),
      ]),
      key('Repartos de ejemplo', 'Estudios clásicos (Brinson y otros): este reparto explica la mayor parte de cómo oscila una cartera diversificada.\n\n• Conservador: 20-40 % acciones (caída posible: −10 a −20 %).\n• Moderado: 50-60 % (−20 a −30 %).\n• Decidido: 70-90 % (−30 a −45 %).\n• 100 % acciones: −50 % o más.\n\nCuanto más cerca está el objetivo, menos acciones. Una referencia antigua es «100 menos tu edad» en acciones; hoy muchos usan 110 o 120 menos la edad. Son ejemplos educativos, no recomendaciones.', 'Horizonte largo permite más acciones; horizonte corto pide más bonos y liquidez.', 'Pruébalo: en Cartera, mira el peso de tus acciones y compáralo con tu perfil.'),
    ], [
      single('¿Qué decisión explica la mayor parte de las oscilaciones de una cartera diversificada?', ['Qué día de la semana compras', 'El reparto entre acciones, bonos y liquidez', 'Elegir el fondo que más subió el año pasado'], 1, 'Es la asignación de activos: la palanca principal del riesgo que asumes.'),
      num('Tienes 10.000 € en una cartera 60 % acciones y 40 % bonos. Las acciones caen un 40 % y los bonos se quedan igual. ¿Cuánto cae tu cartera en total?', 24, '%', '0,6 × 40 % = 24 %. Con 100 % acciones habrías caído un 40 %.'),
      match('Empareja cada perfil de ejemplo con su reparto típico.', [['Conservador', '20-40 % en acciones'], ['Moderado', '50-60 % en acciones'], ['Decidido', '70-90 % en acciones'], ['Muy decidido y horizonte largo', '100 % en acciones']], 'Más acciones: más rentabilidad esperada y caídas más fuertes.'),
      portfolio('Ana tiene 25 años e invierte para dentro de 30. Ejemplo de reparto decidido: pon entre un 70 % y un 90 % en acciones y al menos un 10 % en bonos.', [['Fondo indexado de acciones mundiales', 'ACCIONES'], ['Fondo indexado de emergentes', 'ACCIONES'], ['Fondo de bonos globales cubierto a euros', 'BONOS'], ['Fondo monetario', 'LIQUIDEZ']], { minKind: { ACCIONES: 70, BONOS: 10 }, maxKind: { ACCIONES: 90 } }, 'Con 30 años por delante, un reparto con muchas acciones tiene tiempo de recuperarse de las caídas. Es un ejemplo para aprender, no una recomendación.'),
      scenario('Pablo necesita 15.000 € para la entrada de un piso dentro de 2 años y los tiene 100 % en bolsa. ¿Qué es lo más sensato?', [['Dejarlo todo en bolsa: a la larga sube', 'A 2 años no hay «larga». Una caída del 30 % justo antes de comprar le dejaría sin entrada.'], ['Pasar ese dinero a algo de poco riesgo, como un depósito o un monetario', 'Bien: el dinero con fecha cercana no debe depender de la bolsa.'], ['Meter más en bolsa para llegar antes', 'Más riesgo con un plazo tan corto aumenta la probabilidad de no llegar.']], 1, 'El horizonte manda: lo que necesitas en menos de 3-5 años no debería estar en acciones.'),
      tf('Cuanto más se acerca tu objetivo, más acciones conviene tener.', false, 'Al revés: con poco tiempo no puedes esperar a que se recupere una caída, así que se reduce la parte de acciones.'),
      fill('Una referencia antigua dice: pon en acciones «100 menos tu ____».', 'edad', ['sueldo', 'ahorro', 'deuda'], 'Hoy muchos usan 110 o 120 menos la edad. Es solo una orientación.'),
      num('Con la regla de «110 menos la edad», ¿qué porcentaje en acciones saldría a los 30 años?', 80, '%', '110 − 30 = 80 % en acciones. Es una orientación: tu tolerancia a las caídas también cuenta.'),
      timed(single('Rápido: una cartera 80 % acciones y 20 % bonos es de perfil…', ['Conservador', 'Decidido', 'Sin riesgo'], 1, 'En una crisis fuerte podría caer entre un 30 % y un 45 %.'), 12),
      chat(['Mi primo dice que con 25 años lo suyo es 100 % acciones.', 'Pero en 2020 lo vendí todo cuando cayó un 30 % 😬'], '¿Qué le dices a Lumi?', [['Tu primo tiene razón: 100 % acciones y aguanta', 'Por edad podrías, pero ya sabes que vendiste con un −30 %. Un plan que no aguantas no sirve.'], ['Mejor un reparto con algo de bonos que sí seas capaz de mantener', '¡Eso! La mejor mezcla es la que no abandonas en la próxima caída.'], ['Lo mejor es no invertir nada', 'Así evitas las caídas, pero la inflación se come tus ahorros poco a poco.']], 1, 'El reparto depende del horizonte y también de lo que aguantas sin vender.'),
      scenario('Tienes dos objetivos: 2.000 € para un viaje dentro de un año y la jubilación, dentro de 40. ¿Cómo lo organizas?', [['Todo junto en una cartera con muchas acciones: a la larga sube', 'La jubilación aguanta una caída; el viaje no: un mal año en bolsa te dejaría sin él.'], ['El dinero del viaje en algo de poco riesgo y el de la jubilación con muchas acciones', '¡Eso! Cada objetivo tiene su plazo, y el plazo decide el reparto.'], ['Todo en un depósito, para no arriesgar nada', 'Para el viaje, bien. Para 40 años, la inflación se comería buena parte.']], 1, 'El reparto se decide por objetivo: el dinero con fecha cercana no depende de la bolsa, y el de décadas puede llevar muchas acciones. Meterlo todo junto obliga a elegir mal para uno de los dos.'),
    ], { source: '4.4', minutes: 6, retire: [1, 4, 5, 7, 8] }),

    lesson('u29l4', 'Diversificar por países y divisas', [
      mission({
        title: 'Japón, 1989',
        intro: 'Es enero de 1985 y la bolsa japonesa no para de subir. Inviertes **10.000 €** en su índice, el Nikkei. **Datos reales**, mes a mes. Puedes vender cuando quieras.',
        widget: { kind: 'crash', series: 'series-japan', amount: 10000 },
        goal: { text: 'Llega hasta 2025, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'En 1989, Japón era la mayor bolsa del mundo. Desde su máximo cayó un **80 %** y tardó **34 años** en recuperarlo. Jugárselo todo a un país, sea cual sea, es concentrar.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira lo que viene después…', mood: 'THINKING' },
          { when: when('drop', '<=', -25), say: 'Casi veinte años después, por debajo de lo que pusiste. ¿Sigues?', mood: 'WORRIED' },
          { when: when('drop', '>=', 200), say: '¡Has triplicado tu dinero! ¿Quién no querría estar aquí?', mood: 'HAPPY' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'El segundo riesgo: la divisa',
        intro: 'Compras **1.000 €** de una acción de EE. UU. Tu resultado en euros depende de la acción… y del **dólar**.',
        widget: { kind: 'fx', amount: 1000, asset: 0, fx: 0, maxAsset: 30, maxFx: 20, currency: 'dólar' },
        predict: {
          prompt: 'La acción no se mueve en todo el año, pero el dólar cae un 10 % frente al euro. ¿Qué te pasa a ti?',
          options: ['Nada: la acción no se ha movido', 'Pierdes cerca de un 10 %', 'Ganas cerca de un 10 %'],
          answer: 1,
          why: 'Tu acción vale los mismos dólares, pero cada dólar te da menos euros: **−10 %** sin que la acción se mueva.',
        },
        goal: { text: 'Busca un caso en que la acción suba y tú pierdas dinero en euros.', when: [when('asset', '>', 0), when('eurPct', '<', 0)] },
        insight: 'Fuera del euro hay **un segundo riesgo: la divisa**. En acciones a largo plazo se suele aceptar; en **bonos**, que se mueven poco, se suelen elegir fondos **cubiertos a euros**.',
        lumi: [
          { when: when('fx', '<=', -10), say: 'El dólar se está comiendo tu ganancia.', mood: 'WORRIED' },
          { when: when('eurPct', '>=', 20), say: 'Acción y dólar a favor: doble alegría… y doble riesgo.', mood: 'THINKING' },
          { say: 'Mueve la acción y el dólar', mood: 'HAPPY' },
        ],
      }),
      key('El sesgo de casa', 'Tendemos a invertir en lo que conocemos: el **sesgo doméstico**. Pero España es **menos del 1 %** de la bolsa mundial, y EE. UU., más de dos tercios del índice de países desarrollados.\n\nUn índice mundial reparte entre decenas de países y monedas: si una región tiene una década mala, no lo pagas todo tú.', 'Diversificar por países reduce el riesgo de elegir «el Japón de los próximos 30 años».', 'Pruébalo: revisa tu Cartera y cuenta cuánto depende de un solo país.'),
    ], [
      single('¿Qué peso aproximado tiene la bolsa española en la bolsa mundial?', ['Menos del 1 %', 'Un 10 %', 'Un 25 %'], 0, 'Por eso una cartera solo española concentra mucho, aunque tenga 35 empresas.'),
      tf('Japón fue la mayor bolsa del mundo en 1989 y tardó 34 años en recuperar su máximo.', true, 'Un solo país puede estancarse décadas. Diversificar por países protege de eso.'),
      num('Tienes una acción de EE. UU. que vale 100 $ todo el año. El euro pasa de 1,00 a 1,10 dólares. ¿Cuántos euros vale ahora? (redondea)', 90.91, '€', '100 ÷ 1,10 ≈ 90,91 €: pierdes un 9 % solo por la divisa, sin que la acción se mueva.', 1),
      portfolio('Reparte una cartera de acciones por regiones. Reglas: al menos 4 fondos, ninguno por encima del 60 % y como máximo un 10 % en España.', [['Fondo de acciones de EE. UU.', 'EE. UU.'], ['Fondo de acciones europeas', 'EUROPA'], ['Fondo de acciones españolas', 'ESPAÑA'], ['Fondo de acciones japonesas', 'JAPÓN'], ['Fondo de emergentes', 'EMERGENTES']], { minAssets: 4, maxWeight: 60, maxKind: { ESPAÑA: 10 } }, 'Un índice mundial hace este reparto solo, según el tamaño de cada bolsa. Es un ejemplo para practicar, no una recomendación.'),
      scenario('Bruno invierte todo en el IBEX 35: «Son las empresas que conozco». ¿Qué le dices?', [['Bien hecho: conocer las empresas reduce el riesgo', 'Conocer las marcas no hace que el país entero no pueda tener una década mala.'], ['Que es el sesgo doméstico: concentra en menos del 1 % del mundo', 'Eso es. Puede mantener algo de España, pero repartir por el mundo reduce mucho el riesgo de un solo país.'], ['Que cambie todo a Japón, que está más barato', 'Pasar de un país a otro sigue siendo concentrar.']], 1, 'Invertir en casa se siente seguro, pero concentra. El mundo entero es la cesta más grande.'),
      buckets('¿Tiene riesgo de divisa para alguien que vive en euros?', ['Sí, depende del cambio', 'No, o casi nada'], [['Un fondo de acciones de EE. UU. sin cubrir', 0], ['Un depósito en euros en un banco español', 1], ['Bonos del Tesoro de EE. UU. sin cubrir', 0], ['Un fondo de bonos globales cubierto a euros', 1], ['Acciones japonesas compradas en yenes', 0]], 'Lo que cotiza o vale en otra moneda cambia de valor en euros aunque su precio no se mueva. La cobertura reduce ese efecto.'),
      timed(tf('Un fondo «cubierto a euros» reduce el efecto de los cambios de divisa.', true, 'Usa derivados para neutralizar casi todo el movimiento de la moneda. Tiene un pequeño coste.'), 10),
      fill('La tendencia a invertir sobre todo en tu propio país se llama sesgo ____.', 'doméstico', ['de confirmación', 'de recencia', 'de anclaje'], 'También se le llama sesgo local o «home bias».'),
      multi('¿Qué ventajas tiene repartir entre países? Marca todas.', ['Si una región tiene una década mala, no lo pagas todo', 'Te da acceso a empresas y sectores que no hay en tu país', 'Elimina las caídas de la bolsa', 'Reduce la dependencia de la economía de un solo país'], [0, 1, 3], 'Reduce el riesgo de un país, no el riesgo de mercado: si cae el mundo, cae tu cartera.'),
      single('¿Por qué en los fondos de bonos se suele elegir la versión cubierta a euros?', ['Porque son más baratos siempre', 'Porque la divisa podría moverse más que los propios bonos', 'Porque es obligatorio por ley'], 1, 'Un bono de calidad puede moverse poco; un 10 % de cambio de divisa borraría su papel de estabilizador.'),
    ], { source: '3.4', minutes: 6, retire: [1, 2, 5, 6] }),

    lesson('u29l5', 'Carteras sencillas con indexados', [
      story('¿Solo el S&P 500?', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'En internet todo el mundo lo mete todo en el S&P 500. ¿Lo hago y listo?'),
        choose('¿Qué le dices?', [
          opt('Sí: EE. UU. siempre es lo que más sube', 'bad', say('lumi', 'No siempre: en 2000-2009 sus acciones dieron casi cero y otras regiones subían.')),
          opt('Mejor un índice mundial: ya incluye EE. UU.', 'good', say('lumi', '¡Eso! Y te cubre si EE. UU. tiene una década mala, como 2000-2009.')),
          opt('No: EE. UU. ya no va a subir nunca', 'ok', say('lumi', 'Nadie lo sabe. No se trata de predecir, sino de no depender de un país.')),
        ]),
        say('laura', '¿Y cuántos fondos necesito para estar bien diversificada?'),
        say('lumi', 'Puede bastar uno: un índice mundial tiene miles de empresas de decenas de países.'),
      ]),
      play({
        title: 'Lo que hace falta y lo que sobra',
        intro: 'Una cartera indexada sencilla tiene **uno, dos o tres fondos**. ¿Qué necesita de verdad?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Hace falta' }, { label: 'No hace falta' }],
          cards: [
            { icon: 'pie', label: 'Decidir el reparto entre acciones y bonos', bin: 0, why: 'Es la decisión que más pesa en cómo se mueve tu cartera.' },
            { icon: 'layers', label: 'Tener 20 fondos distintos', bin: 1, why: 'Con uno a tres fondos indexados ya tienes miles de empresas.' },
            { icon: 'percent', label: 'Fondos con costes bajos', bin: 0, why: 'Lo que no pagas en comisiones se queda invirtiendo para ti.' },
            { icon: 'repeat', label: 'Cambiar cada año al fondo que más subió', bin: 1, why: 'Los ganadores de un año rara vez repiten: llegas tarde a cada moda.' },
            { icon: 'calendar', label: 'Una aportación automática cada mes', bin: 0, why: 'La constancia hace más que acertar el momento.' },
            { icon: 'eye', label: 'Mirar la bolsa todos los días', bin: 1, why: 'Solo añade nervios: basta con revisar una vez al año.' },
          ],
        },
        goal: { text: 'Clasifica las seis ideas.', when: [when('done', '==', 6)] },
        insight: 'Lo que sí hace falta: **reparto, costes bajos y constancia**. Ni muchos fondos, ni perseguir al ganador del año, ni mirar la bolsa a diario.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Esto reduce el riesgo o el coste, o solo da trabajo?', mood: 'THINKING' },
          { say: 'Clasifica cada idea', mood: 'HAPPY' },
        ],
      }),
      key('Uno, dos o tres productos', '• **Un producto:** un fondo o ETF de todo el mundo (MSCI ACWI o FTSE All-World), con miles de empresas de países desarrollados y emergentes.\n• **Dos:** acciones mundiales + bonos globales de calidad cubiertos a euros.\n• **Tres:** países desarrollados (MSCI World) + emergentes (10-12 %, más o menos su peso en el mundo) + bonos.\n\nSon ejemplos para entender cómo se construyen, no recomendaciones personalizadas.', 'Con uno a tres fondos indexados puedes tener miles de empresas de todo el mundo.', 'Pruébalo: busca VWCE en Mercado, un ETF de todo el mundo, y síguelo.'),
    ], [
      match('Empareja cada cartera de ejemplo con lo que lleva.', [['De un producto', 'Un fondo de acciones de todo el mundo'], ['De dos productos', 'Acciones mundiales + bonos de calidad'], ['De tres productos', 'Desarrollados + emergentes + bonos']], 'La proporción entre acciones y bonos depende del perfil y del horizonte.'),
      single('¿Cuántas empresas tiene aproximadamente un índice mundial como el MSCI ACWI o el FTSE All-World?', ['Unas 50', 'Unas 500', 'Entre 2.500 y más de 4.000'], 2, 'De decenas de países desarrollados y emergentes, en un solo producto.'),
      portfolio('Monta una cartera de ejemplo con tres fondos. Reglas: usa los tres, emergentes entre un 5 % y un 15 %, y bonos entre un 20 % y un 40 %.', [['Fondo indexado MSCI World', 'DESARROLLADOS'], ['Fondo indexado de emergentes', 'EMERGENTES'], ['Fondo de bonos globales cubierto a euros', 'BONOS']], { minAssets: 3, minKind: { EMERGENTES: 5, BONOS: 20 }, maxKind: { EMERGENTES: 15, BONOS: 40 } }, 'Emergentes cerca de su peso en el mundo y bonos según el perfil: así se construye una cartera de tres fondos. Ejemplo educativo, no recomendación.'),
      num('Tu cartera es 70 % en un fondo mundial que cobra un 0,20 %, 10 % en emergentes al 0,25 % y 20 % en bonos al 0,10 %. ¿Cuál es el coste medio anual?', 0.185, '%', '0,7 × 0,20 + 0,1 × 0,25 + 0,2 × 0,10 = 0,14 + 0,025 + 0,02 = 0,185 %.', 3),
      tf('Las acciones de EE. UU. han sido la mejor región en todas las décadas.', false, 'En 2000-2009 dieron una rentabilidad cercana a cero mientras otras regiones subían.'),
      multi('¿Qué NO hace falta para una buena cartera indexada? Marca todas.', ['Tener 20 fondos distintos', 'Costes bajos', 'Cambiar cada año al fondo que más subió', 'Mirar la bolsa todos los días'], [0, 2, 3], 'Lo que sí hace falta: diversificación, costes bajos y constancia.'),
      scenario('Laura cambia cada enero al fondo que más subió el año anterior. ¿Qué es lo más probable?', [['Que siempre tenga el mejor fondo', 'Los ganadores de un año rara vez repiten: suele llegar tarde a cada moda.'], ['Que acabe comprando caro lo que ya subió y pague más costes', 'Exacto: perseguir al ganador suele salir peor que quedarse con un índice barato.'], ['Que pague menos impuestos', 'Si vende para cambiar (sin traspaso), puede pagar más impuestos, no menos.']], 1, 'El éxito pasado casi nunca predice el futuro. Una cartera simple y estable gana a la mayoría de los cambios.'),
      order('Ordena los pasos para montar una cartera indexada sencilla.', ['Decidir el reparto entre acciones y bonos', 'Elegir fondos indexados baratos', 'Programar una aportación automática', 'Revisar y rebalancear una vez al año'], 'Primero el reparto (la decisión clave), luego los productos y después la disciplina.'),
      timed(single('Rápido: en una cartera de tres fondos, ¿qué peso aproximado tienen los emergentes?', ['Un 1 %', 'Un 10-12 %', 'Un 50 %'], 1, 'Es más o menos su peso en el mercado mundial.'), 12),
      chat(['¿Y por qué no meto todo en el S&P 500 y listo?', 'Es lo que hace todo el mundo en internet 🤷'], '¿Qué le contestas?', [['Porque EE. UU. ya no va a subir nunca', 'Nadie lo sabe. El argumento no es predecir, es no depender de un solo país.'], ['Porque el mundo ya incluye EE. UU. y te cubre si tiene una década mala', '¡Eso! Como en 2000-2009: EE. UU. dio casi cero mientras otras regiones subían.'], ['Porque el S&P 500 es un fondo activo', 'No: es un índice. El problema es la concentración en un país.']], 1, 'Un índice mundial diversifica entre países; el S&P 500, no.'),
    ], { source: '4.5', minutes: 6, retire: [3, 4, 5, 8, 9] }),

    lesson('u29l6', 'Factores: tamaño, valor, calidad y momentum', [
      story('El fondo de valor de Pablo', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Leí que el factor valor batió al mercado en el último siglo. Metí todo en un fondo de valor.'),
        say('pablo', 'Tres años después voy un 15 % por detrás del índice.'),
        choose('¿Qué le dices?', [
          opt('Cámbiate al factor que mejor ha ido', 'bad', say('lumi', 'Saltar de factor en factor es perseguir el pasado: compras caro y vendes barato.')),
          opt('Puede ir por detrás muchos años: decide si lo aguantas', 'good', say('lumi', 'Eso es. Si no lo aguantas, mejor un índice de todo el mercado.')),
          opt('Pide un préstamo y compra más, que ya rebotará', 'bad', say('lumi', 'Con dinero prestado, unos años malos te pueden obligar a vender en lo peor.')),
        ]),
        say('lumi', 'El valor lo hizo peor que el mercado durante buena parte de **2007-2020**.'),
        say('lumi', 'Y los fondos de factores («smart beta») suelen cobrar más que un indexado.'),
      ]),
      play({
        title: '¿Qué factor es?',
        intro: 'Pablo apostó por un **factor**: un rasgo que, de media y en décadas, se ha asociado a rentabilidades distintas. El de **tamaño** es fácil: empresas pequeñas. Clasifica los otros tres.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Valor' }, { label: 'Calidad' }, { label: 'Momentum' }],
          cards: [
            { icon: 'tag', label: 'PER bajo y cotiza por debajo de su valor contable', bin: 0, why: 'Barata respecto a lo que gana y a lo que tiene: factor valor.' },
            { icon: 'shield', label: 'Muy rentable y casi sin deuda', bin: 1, why: 'Rentabilidad alta y balance sano: factor calidad.' },
            { icon: 'rocket', label: 'Ha subido un 60 % en el último año', bin: 2, why: 'Lo que más ha subido en los últimos meses: momentum.' },
            { icon: 'scale', label: 'Cotiza barata frente a los beneficios que gana cada año', bin: 0, why: 'Precio bajo para lo que gana: valor.' },
            { icon: 'verified', label: 'Márgenes altos y beneficios estables durante años', bin: 1, why: 'Un negocio sólido y regular: calidad.' },
            { icon: 'up', label: 'Entre las que más han subido en los últimos seis meses', bin: 2, why: 'Compra lo que viene subiendo: momentum.' },
          ],
        },
        goal: { text: 'Clasifica las seis empresas.', when: [when('done', '==', 6)] },
        insight: 'Tamaño, valor, calidad y momentum son **inclinaciones de la cartera**. Eugene Fama y Kenneth French documentaron en los años 90 las primas de tamaño y valor, pero son **medias de décadas**, no una garantía.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Valor mira el precio; calidad, el negocio; momentum, lo que ha subido.', mood: 'THINKING' },
          { say: 'Clasifica cada empresa', mood: 'HAPPY' },
        ],
      }),
      key('Lo que te llevas', 'Un factor no es un atajo: puede pasar más de una década por detrás del índice, y hay que aguantarlo para cobrar la prima, si llega. Además, cuando muchos inversores conocen un factor, su prima puede reducirse.', 'Los factores son una forma de inclinar la cartera, no una garantía de ganar al mercado.', 'Pruébalo: en Mercado, compara a un año VLUE (valor) y MTUM (momentum).'),
    ], [
      match('Empareja cada factor con las empresas que busca.', [['Tamaño', 'Empresas pequeñas'], ['Valor', 'Baratas respecto a beneficios o valor contable'], ['Calidad', 'Muy rentables y con poca deuda'], ['Momentum', 'Las que más han subido en los últimos meses']], 'Son las cuatro inclinaciones más estudiadas.'),
      trend('Una estrategia momentum compra lo que más ha subido en el último año. ¿Qué tendencia ves en este gráfico?', 'hist-tsla-2020', 'Alcista', 'Un año de subida fortísima: exactamente lo que buscaría una estrategia momentum.'),
      upDown('Diciembre de 2020: Tesla ha multiplicado su precio en un año y entra en el S&P 500. Una estrategia momentum la compraría. ¿Qué hizo en los dos años siguientes?', 'hist-tsla-2020', 'Una prima de factor es una media de miles de acciones durante décadas; en una sola acción y un solo periodo puede pasar cualquier cosa.', 'los dos años siguientes'),
      single('¿Quiénes documentaron en los años 90 las primas de tamaño y valor?', ['Eugene Fama y Kenneth French', 'Warren Buffett y Charlie Munger', 'John Bogle y Harry Markowitz'], 0, 'Su modelo de tres factores (mercado, tamaño y valor) es la base de este enfoque.'),
      buckets('¿A qué factor corresponde cada empresa?', ['Tamaño', 'Valor', 'Calidad', 'Momentum'], [['Capitalización pequeña, poco conocida', 0], ['PER bajo y cotiza por debajo de su valor contable', 1], ['Rentabilidad sobre el capital muy alta y casi sin deuda', 2], ['Ha subido un 60 % en el último año', 3], ['Márgenes altos y beneficios estables durante años', 2]], 'Cada factor mira una característica distinta de la empresa.'),
      tf('Las primas de factores se han cumplido en todas las décadas.', false, 'El valor, por ejemplo, lo hizo peor que el mercado durante buena parte de 2007-2020.'),
      fill('La estrategia que compra lo que más ha subido recientemente se llama ____.', 'momentum', ['value', 'indexación', 'rebalanceo'], 'Se apoya en que las tendencias tienden a continuar un tiempo, aunque se giran a veces de golpe.'),
      timed(single('Rápido: un fondo de factores («smart beta») suele cobrar…', ['Más que un indexado de todo el mercado', 'Menos que un indexado de todo el mercado', 'Nada'], 0, 'Las reglas extra y la rotación cuestan dinero.'), 12),
      scenario('Pablo lee que el factor valor batió al mercado en el último siglo y mete el 100 % en un fondo de valor. Tres años después va un 15 % por detrás del índice. ¿Qué es lo más coherente?', [['Venderlo y pasarse al factor que mejor fue', 'Saltar de factor en factor es perseguir el pasado: suele comprar caro y vender barato.'], ['Entender que puede ir por detrás muchos años y decidir si lo aguanta', 'Bien: un factor exige paciencia larga. Si no lo aguantas, mejor un índice de todo el mercado.'], ['Pedir un préstamo para comprar más', 'Con dinero prestado, unos años malos pueden obligarte a vender en el peor momento.']], 1, 'La prima de un factor, si llega, se cobra en décadas, no en tres años.'),
      multi('¿Qué límites tienen los factores? Marca todos.', ['Pueden ir por detrás del índice durante años', 'Sus fondos suelen ser más caros', 'Garantizan batir al mercado', 'Cuando muchos los conocen, la prima puede reducirse'], [0, 1, 3], 'Nada garantiza batir al mercado: los factores son una apuesta razonable, no una certeza.'),
    ], { minutes: 6, retire: [4, 5, 7, 8] }),

    lesson('u29l7', 'Inversión sostenible (ESG)', [
      story('El fondo «Verde Futuro»', [{ id: 'marta', name: 'Marta' }], [
        say('marta', 'Mira este anuncio: «Verde Futuro». Bosques, molinos… ¡me lo quedo!'),
        say('marta', 'Aunque entre sus mayores posiciones hay petroleras. Raro, ¿no?'),
        choose('¿Qué le dices?', [
          opt('Si se llama verde, será verde', 'bad', say('lumi', 'El nombre y el anuncio no bastan: cuenta lo que hay dentro.')),
          opt('Mira su documentación, su clasificación SFDR y sus posiciones', 'good', say('lumi', '¡Bien! Así distingues un fondo sostenible de un caso de **greenwashing**.')),
          opt('Olvida la inversión sostenible: todo es mentira', 'ok', say('lumi', 'Hay fondos serios. El problema es no comprobar.')),
        ]),
        say('lumi', 'Ni las agencias de rating ESG se ponen de acuerdo.'),
        say('lumi', 'Un estudio del MIT (2022) halló una correlación media de solo **0,54** entre sus notas.'),
      ]),
      play({
        title: '¿E, S o G?',
        intro: '**ESG** son las siglas en inglés de tres áreas: **ambiental**, **social** y **gobierno corporativo**. ¿De cuál es cada tema?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Ambiental (E)' }, { label: 'Social (S)' }, { label: 'Gobierno (G)' }],
          cards: [
            { icon: 'factory', label: 'Emisiones de CO₂ de una fábrica', bin: 0, why: 'Emisiones, energía y residuos: ambiental.' },
            { icon: 'warning', label: 'Accidentes laborales', bin: 1, why: 'Condiciones de trabajo: social.' },
            { icon: 'briefcase', label: 'Consejeros independientes', bin: 2, why: 'Quién controla a la dirección: gobierno corporativo.' },
            { icon: 'leaf', label: 'Gestión del agua y los residuos', bin: 0, why: 'Impacto en el medio ambiente: ambiental.' },
            { icon: 'cash', label: 'Bonus enormes de la dirección', bin: 2, why: 'Sueldos de directivos: gobierno corporativo.' },
            { icon: 'lock', label: 'Protección de datos de los clientes', bin: 1, why: 'Cómo trata a sus clientes: social.' },
          ],
        },
        goal: { text: 'Clasifica los seis temas.', when: [when('done', '==', 6)] },
        insight: 'El ESG mide cómo gestiona una empresa ciertos **riesgos ambientales, sociales y de gobierno**. Un fondo ESG puede **excluir** sectores (tabaco, armas) o elegir a las mejores de cada sector, y no garantiza más ni menos rentabilidad.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'E: el planeta. S: las personas. G: quién manda y cómo.', mood: 'THINKING' },
          { say: 'Clasifica cada tema', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'La etiqueta europea',
        intro: 'El reglamento europeo **SFDR** clasifica los fondos en tres artículos (la UE lo está reformando y las categorías cambiarán de nombre). Coloca cada fondo en el suyo.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Artículo 6' }, { label: 'Artículo 8' }, { label: 'Artículo 9' }],
          cards: [
            { icon: 'chart', label: 'Fondo de bolsa sin ningún objetivo sostenible', bin: 0, why: 'Artículo 6: no promete nada ambiental ni social.' },
            { icon: 'sprout', label: 'Fondo que tiene como objetivo la inversión sostenible', bin: 2, why: 'Artículo 9: la sostenibilidad es su objetivo.' },
            { icon: 'leaf', label: 'Fondo que promueve características ambientales', bin: 1, why: 'Artículo 8: las promueve, pero no son su objetivo.' },
            { icon: 'pie', label: 'Indexado clásico que no menciona la sostenibilidad', bin: 0, why: 'Artículo 6: sin objetivo sostenible.' },
            { icon: 'target', label: 'Fondo cuyo objetivo es reducir emisiones de forma medible', bin: 2, why: 'Artículo 9: su objetivo es la inversión sostenible.' },
            { icon: 'family', label: 'Fondo que promueve características sociales, como buenas condiciones laborales', bin: 1, why: 'Artículo 8: promueve, no persigue un objetivo sostenible.' },
          ],
        },
        goal: { text: 'Coloca los seis fondos.', when: [when('done', '==', 6)] },
        insight: 'Desde 2025, la ESMA exige que un fondo con términos ESG en el nombre invierta **al menos un 80 %** en activos que cumplan esas características. Lee **qué hay dentro**, no solo el nombre. Pruébalo: en Mercado, compara el último año de ICLN, un ETF de energía limpia, con el de SPY.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '6: nada. 8: lo promueve. 9: es su objetivo.', mood: 'THINKING' },
          { say: 'Coloca cada fondo', mood: 'HAPPY' },
        ],
      }),
    ], [
      match('Empareja cada letra con lo que mide.', [['E', 'Emisiones y uso de energía'], ['S', 'Condiciones laborales y clientes'], ['G', 'Consejo, sueldos de directivos y transparencia']], 'Ambiental, social y gobierno corporativo.'),
      single('Según el reglamento europeo SFDR, ¿qué fondos tienen como objetivo la inversión sostenible?', ['Los del artículo 6', 'Los del artículo 8', 'Los del artículo 9'], 2, 'Los del artículo 8 solo «promueven» características ambientales o sociales.'),
      tf('Dos agencias de rating ESG casi siempre dan la misma nota a una empresa.', false, 'Usan métodos distintos: un estudio del MIT (2022) encontró una correlación media de solo 0,54 entre sus notas.'),
      buckets('¿Es un tema E, S o G?', ['Ambiental', 'Social', 'Gobierno corporativo'], [['Emisiones de CO₂ de una fábrica', 0], ['Accidentes laborales', 1], ['Consejeros independientes', 2], ['Gestión del agua y los residuos', 0], ['Bonus enormes de la dirección', 2], ['Protección de datos de los clientes', 1]], 'Cada área mira un tipo distinto de riesgo de la empresa.'),
      scenario('Marta ve un anuncio de un fondo «Verde Futuro» con bosques y molinos. Al mirar su cartera, entre las mayores posiciones hay petroleras. ¿Qué hace?', [['Lo contrata: si se llama verde, será verde', 'El nombre y el anuncio no bastan: lo que cuenta es lo que hay dentro.'], ['Revisa su documentación, su clasificación SFDR y sus principales posiciones', 'Bien: así distingue un fondo sostenible de un caso de greenwashing.'], ['Descarta toda la inversión sostenible por mentirosa', 'Hay fondos serios: el problema es no comprobar.']], 1, 'Antes de fiarte de una etiqueta, mira qué compra el fondo y cómo se clasifica.'),
      multi('¿Qué pueden ser señales de greenwashing? Marca todas.', ['Mucho marketing verde y poca información concreta', 'Entre sus mayores posiciones hay empresas muy contaminantes sin explicar por qué', 'Publica su método de selección y sus exclusiones', 'Promesas vagas como «invertir en un planeta mejor» sin datos'], [0, 1, 3], 'La transparencia (método, exclusiones, posiciones) es lo contrario del greenwashing.'),
      timed(tf('Un fondo ESG garantiza una rentabilidad mayor que uno tradicional.', false, 'No hay garantía ni en un sentido ni en otro: depende de lo que compre y de su coste.'), 10),
      fill('Presentar como sostenible algo que no lo es tanto se llama ____.', 'greenwashing', ['smart beta', 'rebalanceo', 'momentum'], 'Por eso la ESMA exige ahora que los fondos con términos ESG en el nombre cumplan unos mínimos.'),
      single('¿Qué hace un fondo ESG «de exclusión»?', ['Deja fuera sectores enteros, como tabaco o armas', 'Invierte solo en empresas pequeñas', 'Elimina el riesgo de mercado'], 0, 'Otra forma es «best in class»: elegir a las mejores de cada sector.'),
      chat(['Quiero que mi dinero apoye empresas responsables 🌱', '¿Basta con que el fondo ponga ESG en el nombre?'], '¿Qué le contestas a Lumi?', [['Sí, con el nombre es suficiente', 'Ojalá. Ahí entra el greenwashing: hay que mirar dentro.'], ['Mira su clasificación SFDR, sus exclusiones, sus posiciones y su coste', '¡Perfecto! Y compáralo con un indexado normal: el coste también cuenta.'], ['El ESG es solo marketing, olvídalo', 'Hay de todo. Con información puedes elegir con criterio.']], 1, 'El ESG puede reflejar tus valores, pero exige leer la letra pequeña.'),
    ], { minutes: 6, retire: [2, 3, 4, 6] }),
  ],
})
