import 'server-only'
// Sección 1 · Unidad 4 · Tu primer plan financiero (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, say, scenario, single, spot, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u4', order: 4, title: 'Tu primer plan financiero', description: 'Objetivos con cifra y fecha, tu plazo, tu riesgo y lo que dicen los datos del trading',
  lessons: [
    lesson('u4l1', 'Ahorrar, invertir y especular', [
      play({
        title: '¿Ahorrar, invertir o especular?',
        intro: '• **Ahorrar:** apartar sin arriesgar, para lo cercano.\n• **Invertir:** poner dinero en lo que **produce valor** (empresas, préstamos, inmuebles), para 5 años o más.\n• **Especular:** comprar esperando que otro te lo compre más caro pronto.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Ahorrar' }, { label: 'Invertir' }, { label: 'Especular' }],
          cards: [
            { emoji: '🏖️', label: 'Cuenta remunerada para el viaje del verano', bin: 0, why: 'Lo necesitas pronto y sin riesgo: ahorrar.' },
            { emoji: '🌍', label: 'Aportar cada mes a un fondo indexado mundial durante 20 años', bin: 1, why: 'Compras un trocito de miles de empresas que generan beneficios: invertir.' },
            { emoji: '🚀', label: 'Una moneda nueva porque en TikTok dicen que «va a explotar»', bin: 2, why: 'No produce nada: solo esperas que otro pague más. Especular.' },
            { emoji: '🏛️', label: 'Letras del Tesoro para la entrada del piso, dentro de un año', bin: 0, why: 'Plazo corto y sin riesgo de caídas: ahorrar.' },
            { emoji: '📉', label: 'CFD apalancados para ganar en una semana', bin: 2, why: 'Apuestas a corto plazo y multiplicadas: especulación pura.' },
            { emoji: '🏢', label: 'Acciones de muchas empresas para dentro de 15 años', bin: 1, why: 'Beneficios de empresas, diversificado y a largo plazo: invertir.' },
          ],
        },
        goal: { text: 'Clasifica los seis casos.', when: [when('done', '==', 6)] },
        insight: 'Pregúntate **de dónde sale la ganancia**: del interés (ahorro), de lo que produce lo que compras (inversión) o del bolsillo de otro que acierta menos que tú (especulación).',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿eso produce algo, o solo esperas que suba?', mood: 'THINKING' },
          { say: 'Clasifica cada caso 👇', mood: 'HAPPY' },
        ],
      }),
      story('La moneda de moda', [{ id: 'nico', name: 'Nico', emoji: '😎' }], [
        say('nico', '¡Mete 5.000 € en esta moneda! Ha subido un 300 % este mes y todo el mundo está entrando 🚀'),
        note('Tienes 12.000 € ahorrados y gastas 1.200 € al mes.'),
        choose('¿Qué haces?', [
          opt('Meto los 5.000 €: no quiero quedarme fuera', 'bad', say('lumi', 'Eso es **FOMO**, el miedo a quedarte fuera. Comprar porque ya ha subido mucho es especular… con casi la mitad de tus ahorros.')),
          opt('Si acaso, una cantidad pequeña que pueda perder entera', 'good', say('lumi', 'Bien: se especula **solo con lo que puedes perder**. Antes, el colchón y la inversión a largo plazo.')),
          opt('Le paso mis claves para que lo gestione él', 'bad', say('lumi', '¡Nunca des el control de tu dinero ni tus claves a nadie! Es la puerta de muchas estafas.')),
        ]),
        say('lumi', 'Se ahorra para lo cercano, se invierte para lo lejano y se especula solo con lo que puedes perder.'),
      ]),
    ], [
      match('Empareja cada actividad con de dónde sale su ganancia.', [['Ahorrar', 'Intereses sin arriesgar lo que pusiste'], ['Invertir', 'Beneficios, intereses o rentas a largo plazo'], ['Especular', 'Que otro pague más caro pronto']], 'La pregunta clave es siempre la misma: ¿de dónde sale la ganancia?'),
      buckets('¿Es ahorrar, invertir o especular?', ['Ahorrar', 'Invertir', 'Especular'], [['Depósito a 12 meses', 0], ['Aportar cada mes a un fondo indexado mundial durante 20 años', 1], ['Comprar una moneda de moda porque está subiendo', 2], ['Letras del Tesoro', 0], ['Operar cada pocos minutos con apalancamiento', 2], ['Acciones de muchas empresas para 15 años', 1]], 'Plazo, riesgo y origen de la ganancia separan las tres cosas.'),
      single('Necesitas el dinero para un viaje dentro de un año. ¿Qué tiene más sentido?', ['Ahorrarlo en una cuenta o depósito', 'Invertirlo en acciones', 'Especular con criptomonedas'], 0, 'A un año, el dinero no debe estar en algo que puede caer un 30 %.'),
      single('¿De dónde sale la ganancia de quien invierte en una empresa a largo plazo?', ['De otro inversor que pierde', 'De los beneficios que genera la empresa', 'De la suerte'], 1, 'Invertir es participar en lo que el activo produce: beneficios, intereses o rentas.'),
      tf('Especular es un juego de suma cero antes de costes.', true, 'Lo que gana uno lo pierde otro; después de comisiones e impuestos, el total es negativo.'),
      tf('Invertir significa que no puedes perder dinero.', false, 'Las inversiones suben y bajan, a veces mucho y durante años. Por eso se invierte a largo plazo y diversificando.'),
      timed(tf('Comprar una cripto porque «todo el mundo dice que va a subir» es invertir.', false, 'Es especular: la ganancia depende de que otro pague más, no de lo que produce el activo.'), 10),
      scenario('Pablo tiene 12.000 €, gasta 1.200 € al mes y quiere probar suerte con 5.000 € en una moneda que «va a multiplicarse». ¿Qué hace?', [['Aparta su colchón, invierte a largo plazo y, si quiere especular, solo con una parte pequeña que pueda perder entera', 'Si la moneda se hunde, su vida no cambia: el plan aguanta.'], ['Mete los 5.000 € en la moneda', 'Un 40 % de su dinero depende de que otro pague más caro: puede perderlo casi todo.'], ['Mete los 12.000 € en la moneda para ganar más', 'Sin colchón y todo en una apuesta: cualquier imprevisto o caída lo deja sin nada.']], 0, 'Especular, si acaso, con una parte pequeña que puedas perder entera.'),
      fill('Se ahorra para lo cercano, se invierte para lo ____ y se especula solo con lo que puedes perder.', 'lejano', ['urgente', 'seguro', 'divertido'], 'Cuanto más lejos está el objetivo, más tiempo hay para recuperarse de las caídas.'),
      multi('¿Cuáles son ejemplos de especulación? Marca todos.', ['Operar cada pocos minutos', 'Comprar una moneda de moda porque sube', 'Aportar cada mes a un fondo mundial durante 20 años', 'Usar mucho apalancamiento'], [0, 1, 3], 'Aportar a largo plazo a un fondo diversificado es invertir.'),
    ], { source: '1.2', minutes: 6, retire: [1, 4, 5, 7] }),

    lesson('u4l2', 'Objetivos con fecha y cifra', [
      story('«Quiero ahorrar más»', [{ id: 'sara', name: 'Sara', emoji: '👩' }], [
        say('sara', 'Este año me propongo… ¡ahorrar más! 💪'),
        choose('¿Qué le falta a ese objetivo?', [
          opt('Nada, es un objetivo perfecto', 'bad', say('lumi', '«Ahorrar más» no se puede medir: ¿cuánto? ¿Para cuándo? ¿Para qué? Así es imposible saber si lo cumples.')),
          opt('Una cifra, una fecha y un para qué', 'good', say('lumi', '¡Eso es! Un buen objetivo es **SMART**: específico, medible, alcanzable, relevante y con fecha.')),
          opt('Más motivación', 'ok', say('lumi', 'La motivación ayuda, pero sin cifra ni fecha no sabes si vas bien. Un objetivo concreto motiva más.')),
        ]),
        say('sara', 'Vale: quiero **900 €** para irme de viaje en verano, dentro de 6 meses.'),
        say('lumi', '¡Mucho mejor! Eso son 150 € al mes. ¿Y si tienes varios objetivos a la vez?'),
      ]),
      play({
        title: 'Tus objetivos, en cifras',
        intro: 'Sara tiene tres objetivos y puede apartar **250 € al mes**. Para cada uno: lo que necesita ÷ los meses que faltan = lo que tiene que apartar.',
        widget: {
          kind: 'goalplan', available: 250, maxMonths: 24,
          goals: [
            { emoji: '✈️', label: 'Viaje en verano', amount: 900, months: 6 },
            { emoji: '💻', label: 'Portátil nuevo', amount: 1200, months: 8 },
            { emoji: '🚗', label: 'Carné de conducir', amount: 1000, months: 10 },
          ],
        },
        predict: {
          prompt: 'Con 250 € al mes, ¿puede Sara conseguir los tres objetivos en esos plazos?',
          options: ['Sí, y le sobra', 'No: necesitaría 400 € al mes', 'Solo le faltan unos euros'],
          answer: 1,
          why: '900 ÷ 6 + 1.200 ÷ 8 + 1.000 ÷ 10 = **400 € al mes**. Le faltan 150 €.',
        },
        goal: { text: 'Cambia los plazos para que todo quepa en 250 € al mes.', when: [when('fits', '==', 1)] },
        insight: 'Si no llegas, no renuncies: **mueve la fecha** o la cifra. Y separa cada objetivo en su «hucha», para no gastarte el viaje en el portátil.',
        lumi: [
          { when: when('slack', '<', -100), say: 'Así no cuadra: le faltan más de 100 € al mes.', mood: 'WORRIED' },
          { when: when('slack', '<', 0), say: '¡Casi! Un poco más de plazo en algo y cabe.', mood: 'THINKING' },
          { say: 'Alarga el plazo de lo que menos prisa corre 👇', mood: 'HAPPY' },
        ],
      }),
    ], [
      order('Ordena los pasos para calcular tu aportación mensual.', ['Decidir cuánto necesitas', 'Ponerle fecha', 'Restar lo que ya tienes', 'Dividir lo que falta entre los meses que quedan'], 'Cifra, fecha, punto de partida y división: así un deseo se convierte en un plan mensual.'),
      num('Quieres 3.000 € para un viaje dentro de 12 meses y ya tienes 600 €. ¿Cuánto tienes que apartar al mes?', 200, '€', '(3.000 − 600) ÷ 12 = 200 € al mes.'),
      num('Quieres 30.000 € de entrada para un piso en 5 años y empiezas de cero. Sin contar intereses, ¿cuánto al mes?', 500, '€', '30.000 ÷ 60 meses = 500 € al mes.'),
      fill('Un objetivo SMART es específico, medible, alcanzable, relevante y tiene ____.', 'fecha', ['suerte', 'riesgo', 'apalancamiento'], 'Sin fecha no puedes calcular cuánto aportar cada mes.'),
      single('¿Qué objetivo está bien planteado?', ['Ser rico', 'Ahorrar mucho', 'Tener 12.000 € para un coche en 2029 aportando 250 € al mes'], 2, 'Tiene cantidad, fecha y plan: se puede medir y seguir.'),
      buckets('¿Es solo un deseo o un objetivo medible?', ['Solo un deseo', 'Objetivo medible'], [['Quiero ser rico', 0], ['Ahorrar más este año', 0], ['4.000 € para un máster en septiembre de 2027, con 250 € al mes', 1], ['Tener 4.500 € de colchón en diciembre', 1], ['Viajar mucho', 0]], 'Cifra y fecha convierten un deseo en algo que puedes seguir mes a mes.'),
      chat(['Mi objetivo para este año: ¡ahorrar! 💪', '¿Lo he planteado bien?'], '¿Qué le contestas a Lumi?', [['Perfecto, así no te agobias', 'Sin cifra ni fecha, en diciembre no sabrás si lo has conseguido.'], ['Ponle cifra y fecha: por ejemplo, 1.800 € en diciembre', '¡Así sí! 1.800 € en 12 meses son 150 € al mes: ya sabes qué hacer cada mes.'], ['Mejor no te pongas objetivos, que luego fallas', 'Sin objetivo es más fácil que el ahorro se quede en nada.']], 1, 'Un objetivo medible te dice qué hacer cada mes.'),
      timed(single('Rápido: necesitas 2.400 € en 12 meses. ¿Cuánto al mes?', ['100 €', '200 €', '240 €'], 1, '2.400 ÷ 12 = 200 €.'), 12),
      scenario('Ana quiere un colchón de 3.000 €, un viaje de 1.500 € en verano y la entrada de un piso dentro de 6 años. Lo guarda todo junto en la misma cuenta. ¿Qué le conviene?', [['Separar cada objetivo en su propia cuenta o hucha', 'Ve cuánto lleva de cada uno y el viaje no se come el colchón.'], ['Seguir con todo junto: es más sencillo', 'En verano no sabrá cuánto puede gastar sin tocar el colchón o el piso.'], ['Ir a por un objetivo cada vez y olvidar los demás', 'Mientras tanto, los otros plazos siguen corriendo.']], 0, 'Un cajón por objetivo: así el dinero de cada meta no se mezcla.'),
      tf('Si el objetivo es a 2 años, la aportación mensual es lo que falta dividido entre 24.', true, '2 años son 24 meses (sin contar intereses).'),
    ], { source: '1.5', minutes: 6, retire: [6, 7, 9] }),

    lesson('u4l3', 'Tu horizonte temporal', [
      mission({
        title: '¿Cuánto hay que esperar?',
        intro: 'Datos reales: el S&P 500 mes a mes durante 40 años. Imagina que invertiste en **cualquier** mes y esperaste unos años. ¿Cuántas veces habrías perdido dinero?',
        widget: { kind: 'horizon', series: 'series-sp500-monthly', years: 1, maxYears: 20 },
        predict: {
          prompt: 'Si invertías en un mes cualquiera y vendías **un año después**, ¿cuántas veces perdiste dinero?',
          options: ['Casi nunca', 'Más o menos 1 de cada 5 veces', 'La mitad de las veces'],
          answer: 1,
          why: 'En estos 40 años, el **20,8 %** de los periodos de un año acabó en pérdida, y el peor perdió un 45 %.',
        },
        goal: { text: 'Encuentra a partir de cuántos años no hubo ni un solo caso con pérdida.', when: [when('lossPct', '==', 0)] },
        insight: 'En estos datos, esperando **14 años o más** nunca se perdió dinero. Pero el pasado no garantiza el futuro: quien compró en 1929, o en Japón en 1989, esperó mucho más. El plazo decide el riesgo que puedes asumir.',
        lumi: [
          { when: when('years', '<=', 2), say: 'A corto plazo la bolsa es una montaña rusa: casi cualquier cosa puede pasar.', mood: 'WORRIED' },
          { when: when('years', '>=', 10), say: 'Mira el peor caso: aún hay periodos largos en pérdidas (los que empezaron en 2000).', mood: 'THINKING' },
          { say: 'Sigue alargando la espera 👇', mood: 'HAPPY' },
        ],
      }),
      key('Ponle fecha a cada euro', '• **Colchón:** siempre disponible → cuenta remunerada, fondo monetario.\n• **Viaje o coche (1-3 años)** → depósitos, letras.\n• **Entrada de un piso (3-7 años)** → mezcla prudente, más renta fija.\n• **Jubilación (15 años o más)** → sobre todo acciones diversificadas.', 'No se invierte en bolsa el dinero que se necesita pronto: puede estar bajando justo cuando lo necesites.'),
    ], [
      match('Empareja cada objetivo con dónde suele tener sentido.', [['Colchón de emergencia', 'Cuenta remunerada'], ['Viaje dentro de un año', 'Depósito o letras'], ['Entrada de un piso en 5 años', 'Mezcla prudente, más renta fija'], ['Jubilación en 35 años', 'Sobre todo acciones diversificadas']], 'A más plazo, más tiempo para recuperarse de las caídas.'),
      single('Necesitas la entrada de un piso dentro de 18 meses. ¿Dónde tiene más sentido?', ['100 % en acciones tecnológicas', 'Depósitos o un fondo monetario', 'Criptomonedas'], 1, 'A 18 meses, una caída del 30 % arruinaría el plan.'),
      order('Ordena de menor a mayor el riesgo que suele admitir cada objetivo.', ['Colchón de emergencia', 'Viaje en un año', 'Entrada de un piso en 5 años', 'Jubilación en 30 años'], 'Cuanto más lejos está el objetivo, más caídas se pueden aguantar por el camino.'),
      tf('En periodos de 20 años, el S&P 500 casi nunca ha dado pérdidas.', true, 'Casi nunca no es nunca: por eso también conviene diversificar por países.'),
      scenario('Bruno tiene 8.000 € para la matrícula de un máster que paga dentro de 10 meses. Un amigo le dice que en bolsa «sacará algo más». ¿Qué hace?', [['Lo deja en un depósito o letras hasta el pago', 'Gana poco, pero el día de la matrícula los 8.000 € estarán ahí.'], ['Lo mete todo en bolsa', 'Si la bolsa cae un 20 % justo antes, le faltarían 1.600 € para la matrícula.'], ['Lo mete en una cripto que ha subido mucho', 'Caídas del 50 % en pocos meses no son raras en cripto: podría quedarse sin máster.']], 0, 'Dinero con fecha cercana: sin riesgo, aunque rinda poco.'),
      upDown('S&P 500, septiembre de 2008. Imagina que aquí tienes el dinero de la entrada de un piso que pagas en 6 meses. ¿Qué crees que hizo el índice en los meses siguientes?', 'hist-2008', 'Sea cual sea el resultado, el dinero que necesitas en pocos meses no debería depender de lo que haga la bolsa en ese plazo.', 'los meses siguientes'),
      timed(single('Rápido: dinero que necesitarás en 2 años. ¿En bolsa?', ['Mejor no: puede estar cayendo justo cuando lo necesites', 'Sí: en 2 años siempre sube', 'Sí, si es una sola empresa'], 0, 'A 2 años, la bolsa puede estar en plena caída el día que necesitas el dinero.'), 12),
      buckets('¿Corto o largo plazo?', ['Corto plazo (menos de 3 años)', 'Largo plazo (más de 10 años)'], [['Jubilación', 1], ['Vacaciones del verano que viene', 0], ['Ahorro para la universidad de un bebé', 1], ['Cambiar de móvil', 0], ['Independencia financiera a los 50 (tienes 25)', 1], ['Fianza de un alquiler dentro de 6 meses', 0]], 'Lo que necesitas pronto, sin riesgo; lo lejano puede aguantar más altibajos.'),
      num('Si el S&P 500 ha caído aproximadamente uno de cada cuatro años, ¿en cuántos años de cada 40 esperarías caídas, más o menos?', 10, 'años', '40 ÷ 4 = 10 años. Las caídas son normales: lo que cambia con el plazo es el tiempo para recuperarse.'),
      fill('No se invierte en bolsa el dinero que se necesita ____.', 'pronto', ['nunca', 'en 30 años', 'para jubilarse'], 'No porque vaya a bajar seguro, sino porque puede estar bajando justo cuando lo necesites.'),
    ], { source: '1.5', minutes: 6, retire: [3, 6, 8] }),

    lesson('u4l4', 'Cuánto riesgo puedes aguantar', [
      mission({
        title: 'Vive la crisis de 2008',
        intro: 'Es octubre de 2007. Inviertes **10.000 €** en el S&P 500. Dale a empezar y mira cómo evoluciona semana a semana, con **datos reales**. Puedes vender cuando quieras.',
        widget: { kind: 'crash', series: 'series-crash-2008', amount: 10000 },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Esto es la **tolerancia al riesgo**: cuánto puedes ver caer tu dinero sin vender en pánico. La caída llegó al 56 %. Quien vendió en lo peor convirtió una caída temporal en una pérdida real; quien aguantó recuperó su dinero en 2013 (sin contar dividendos).',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Ahora mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -45), say: 'Tu inversión ha perdido casi la mitad. Las noticias dicen que esto no ha hecho más que empezar. ¿Aguantas?', mood: 'WORRIED' },
          { when: when('drop', '<=', -20), say: 'Un 20 % abajo… ¿cómo te sientes?', mood: 'WORRIED' },
          { when: when('drop', '>', 5), say: '¡Ya está por encima! Esto es fácil… ¿no?', mood: 'HAPPY' },
          { say: 'Dale a empezar. Puedes vender cuando quieras 👇', mood: 'HAPPY' },
        ],
      }),
      key('Capacidad y tolerancia', '**Capacidad de riesgo:** cuánto puedes perder **sin que cambie tu vida** (ingresos, colchón, cargas, plazo). Es objetiva.\n\n**Tolerancia al riesgo:** cuánto puedes ver caer tu dinero **sin vender en pánico**. Es psicológica, y casi todos la sobrestiman cuando la bolsa sube.\n\nTu perfil real es **el menor de los dos**.', 'Todo el mundo es valiente cuando la bolsa sube.', 'Al abrir cuenta en un bróker europeo te harán un test MiFID: contéstalo con sinceridad, te protege de productos que no entiendes.'),
    ], [
      single('¿Cuál es tu perfil de riesgo real?', ['El mayor entre capacidad y tolerancia', 'El menor entre capacidad y tolerancia', 'El que tenga tu mejor amigo'], 1, 'Si puedes perder mucho pero no lo soportas, venderás en pánico; si lo soportas pero no puedes permitírtelo, te arriesgas demasiado.'),
      match('Empareja cada concepto con su significado.', [['Capacidad de riesgo', 'Cuánto puedes perder sin que cambie tu vida'], ['Tolerancia al riesgo', 'Cuánto aguantas ver caer sin vender'], ['Test MiFID', 'Comprueba tu experiencia y tus conocimientos'], ['Horizonte', 'Cuándo vas a necesitar el dinero']], 'Capacidad y horizonte son objetivos; la tolerancia es psicológica.'),
      scenario('Marta tiene 23 años, contrato estable, un colchón de 6 meses e invierte para dentro de 30 años en una cartera diversificada. Su cartera cae un 35 %. ¿Qué decisión encaja con su plan?', [['Mantiene el plan y sigue con sus aportaciones', 'Su plazo y su colchón le permiten esperar: la caída solo es pérdida real si vende.'], ['Vende todo para no perder más', 'Convierte una caída temporal en pérdida definitiva y, si luego hay rebote, se lo pierde.'], ['Pide un préstamo para comprar más', 'Endeudarse para invertir multiplica el riesgo: si sigue cayendo, debe dinero y pierde.']], 0, 'Con capacidad y plazo, el plan importa más que el titular del día.'),
      tf('Una caída del 40 % en bolsa es algo teórico que no ha pasado nunca.', false, 'La bolsa mundial cayó más del 50 % en 2007-2009 y casi un 50 % en 2000-2002.'),
      num('Tus 10.000 € caen un 40 %. ¿Cuánto valen ahora?', 6000, '€', '10.000 × (1 − 0,40) = 6.000 €.'),
      num('Después de caer un 40 %, ¿cuánto tiene que subir tu cartera para volver a 10.000 €? (redondea)', 66.7, '%', 'De 6.000 a 10.000 € hay que ganar 4.000 €: 4.000 ÷ 6.000 ≈ 66,7 %. Las caídas grandes cuestan mucho de recuperar.', 2),
      buckets('¿Esto suma o resta capacidad de riesgo?', ['Suma capacidad', 'Resta capacidad'], [['Un sueldo estable', 0], ['Un colchón de 6 meses', 0], ['Hijos a tu cargo', 1], ['Necesitar el dinero en 2 años', 1], ['Un horizonte de 30 años', 0], ['Deudas caras', 1]], 'La capacidad depende de tu situación objetiva: ingresos, colchón, cargas y plazo.'),
      chat(['Yo invirtiendo soy superagresivo 😎', 'Aunque cuando el mes pasado bajó un 5 % no pegué ojo…'], '¿Qué le dices a Lumi?', [['Entonces eres agresivo; solo ha sido un mal mes', 'Si un 5 % te quita el sueño, ¿cómo llevarías un 40 %?'], ['Tu tolerancia real parece más baja de lo que crees', 'Eso: tu perfil lo marca cómo reaccionas en las caídas, no cómo te sientes cuando sube.'], ['Invierte aún más para acostumbrarte', 'Más riesgo con poca tolerancia suele acabar vendiendo en pánico.']], 1, 'La tolerancia se descubre en las caídas, no en las subidas.'),
      timed(single('Rápido: ¿para qué sirve el test MiFID del bróker?', ['Para cobrarte más comisiones', 'Para protegerte de productos que no entiendes', 'Para nada'], 1, 'La normativa europea obliga a comprobar tu experiencia y tus conocimientos.'), 12),
      single('Te pones muy nervioso al ver números rojos y vas a necesitar el dinero en 3 años. Tu perfil es…', ['Conservador', 'Muy decidido', 'Especulador'], 0, 'Baja tolerancia y plazo corto: mucha renta fija y poca bolsa.'),
    ], { source: '1.6', minutes: 6, retire: [3, 7, 8] }),

    lesson('u4l5', 'La verdad sobre hacerse rico rápido', [
      play({
        title: '1.000 traders a cara o cruz',
        intro: 'Imagina 1.000 personas que operan sin ninguna ventaja: cada operación es como **lanzar una moneda**. Pero cada vez pagan una pequeña comisión.',
        widget: { kind: 'coinflip', traders: 1000, trades: 20, maxTrades: 500, fee: 2, stake: 100, win: 1 },
        predict: {
          prompt: 'Si cada uno hace cada vez más operaciones, ¿qué crees que pasa?',
          options: ['La mitad gana y la mitad pierde, siempre', 'Cada vez pierden más, por las comisiones', 'Acaba ganando casi todo el mundo'],
          answer: 1,
          why: 'Sin ventaja, la moneda es neutra… pero las **comisiones** siempre restan. Cuanto más operas, más pesan.',
        },
        goal: { text: 'Sube las operaciones hasta que pierdan más de 6 de cada 10.', when: [when('losersPct', '>', 60)] },
        insight: 'Los datos reales son peores: entre el **74 % y el 89 %** de las cuentas minoristas de CFD pierden dinero (ESMA), y en Brasil el **97 %** de quienes hicieron *day trading* más de 300 días perdió. Lo que funciona: aportar con regularidad, diversificar, pocas comisiones y mucho tiempo.',
        lumi: [
          { when: when('trades', '>=', 100), say: 'Fíjate en la media: cada vez más en rojo. Nadie es peor que nadie: son las comisiones.', mood: 'WORRIED' },
          { say: 'Sube las operaciones de cada uno 👇', mood: 'HAPPY' },
        ],
      }),
      story('El gurú de Instagram', [{ id: 'guru', name: '@MillonarioA22', emoji: '🕶️' }], [
        say('guru', 'Hace un año era camarero. Hoy gano **5.000 € al mes** haciendo trading desde la playa 🏝️'),
        say('guru', 'Copia mis operaciones por solo **99 € al mes**. ¡Quedan 10 plazas! Abre cuenta en este bróker con mi enlace 👇'),
        choose('¿Cuántas señales de alarma ves?', [
          opt('Ninguna: si gana tanto, sabrá lo que hace', 'bad', say('lumi', 'Si ganara 5.000 € al mes operando, ¿para qué necesitaría venderte nada? Gana con **tu** cuota y con la comisión del bróker.')),
          opt('Varias: promesas, prisas, la cuota y el enlace al bróker', 'good', say('lumi', '¡Todas! Promete mucho sin enseñar su historial completo, mete prisa («10 plazas»), vende suscripciones y cobra por llevarte a un bróker.')),
          opt('Solo una: que cobra 99 €', 'ok', say('lumi', 'Hay más: la prisa, las promesas sin historial y el enlace a un bróker concreto, por el que suele cobrar.')),
        ]),
        say('lumi', 'Antes de dar dinero a nadie, mira si está registrado en la **CNMV** y si aparece en su lista de «chiringuitos financieros».'),
      ]),
    ], [
      tf('La mayoría de quienes hacen day trading de forma continuada gana dinero.', false, 'En Brasil, el 97 % de quienes lo hicieron más de 300 días perdió dinero.'),
      single('Según la ESMA, ¿qué porcentaje de cuentas minoristas de CFD pierde dinero?', ['20-30 %', 'Alrededor del 50 %', '74-89 %'], 2, 'Por eso desde 2018 el apalancamiento está limitado para minoristas y los brókers tienen que mostrar el aviso.'),
      spot('Marca los mensajes que tienen pinta de estafa o de gurú.', [['@TraderLibre', 'Dejé mi trabajo gracias al trading. Mi curso VIP, solo hoy, a 497 € 🚀', true], ['Desconocido', 'Garantizamos un 5 % semanal sin riesgo. Ábrete cuenta en este bróker con mi enlace.', true], ['Tu bróker', 'Recuerda: los CFD son complejos y la mayoría de cuentas minoristas pierde dinero con ellos.', false], ['Grupo de Telegram', 'Señales de compra 100 % acertadas. Plazas limitadas: entra antes de medianoche.', true], ['Amiga', 'He empezado a aportar 50 € al mes a un fondo indexado. Aburrido, pero ahí va 😴', false]], 'Promesas de ganancias garantizadas, prisa y enlaces a un bróker concreto son señales clásicas.'),
      tf('Los hogares que más operaban ganaban más que el mercado.', false, 'Ganaban un 11,4 % frente al 17,9 % del mercado: el exceso de confianza sale caro.'),
      single('En Brasil, de quienes hicieron day trading más de 300 días, ¿cuántos perdieron dinero?', ['El 30 %', 'El 60 %', 'El 97 %'], 2, 'Y solo un 1,1 % ganó más que el salario mínimo (Chague, De-Losso y Giovannetti, 2020).'),
      multi('¿Qué son señales de estafa? Marca todas.', ['Rentabilidad alta garantizada', 'Prisa por decidir', 'Registro en la CNMV y documento de riesgos', 'Solo enseña capturas de ganancias'], [0, 1, 3], 'Una entidad legal está registrada y explica sus riesgos y costes.'),
      scenario('Un influencer con un coche de lujo te ofrece copiar sus operaciones por 99 € al mes: «el mes pasado gané un 40 %». ¿Qué haces?', [['Busco si está registrado en la CNMV y pido su historial completo', 'No aparece registrado y solo tiene capturas de días buenos: te ahorras 99 € al mes y probablemente mucho más.'], ['Me suscribo: los resultados hablan solos', 'Una captura de un mes bueno no dice nada de los meses malos que no enseña.'], ['Le paso también mis claves del bróker para que opere por mí', 'Nunca compartas tus claves: puede vaciarte la cuenta.']], 0, 'Antes de pagar a nadie: registro en la CNMV, historial completo y cero prisas.'),
      num('Según Barber y Odean, los hogares que más operaban ganaban un 11,4 % anual y el mercado un 17,9 %. ¿Cuántos puntos al año se dejaban?', 6.5, 'puntos', '17,9 − 11,4 = 6,5 puntos al año, sobre todo por costes y exceso de confianza.'),
      timed(tf('Si alguien te promete rentabilidad alta sin riesgo, es una señal de alarma.', true, 'Rentabilidad y riesgo van juntos: lo «alto y seguro» no existe.'), 8),
      fill('Lo que funciona: aportar con regularidad, diversificar, costes bajos, mucho tiempo y no vender en ____.', 'pánico', ['euros', 'verano', 'Navidad'], 'Vender en pánico convierte las caídas temporales en pérdidas reales.'),
    ], { source: '1.7', minutes: 6, retire: [0, 3, 8] }),
  ],
})
