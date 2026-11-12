import 'server-only'
// Sección 3 · Unidad 9 · Bonos y renta fija (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u9', order: 9, title: 'Bonos y renta fija', description: 'Cómo funciona un bono, su rentabilidad, el efecto de los tipos y el riesgo de impago',
  lessons: [
    lesson('u9l1', 'Qué es un bono', [
      story('Prestar o entrar en el negocio', [{ id: 'irene', name: 'Irene' }], [
        note('Irene va a abrir su segunda panadería y busca dinero.'),
        say('irene', 'Necesito 1.000 €. Te propongo dos cosas.'),
        say('irene', 'O me los prestas: te pago un 3 % al año y te los devuelvo dentro de 5 años.'),
        say('irene', 'O entras en el negocio y te llevas una parte de los beneficios, si los hay.'),
        choose('Si se los prestas, ¿qué cobras?', [
          opt('30 € al año y mis 1.000 € al final', 'good', say('lumi', '¡Eso es un **bono**! Cinco cupones de 30 € más el nominal: **1.150 €**.')),
          opt('Una parte de los beneficios de la panadería', 'bad', say('lumi', 'Eso es entrar en el negocio, como con una **acción**. Prestando, cobras lo pactado.')),
          opt('Depende de cómo le vaya a la panadería', 'ok', say('lumi', 'Solo si quiebra. Si va bien o regular, cobras lo pactado.')),
        ]),
        say('lumi', 'Prestar: cobras un **cupón** y, al **vencimiento**, te devuelven el **nominal**.'),
      ]),
      // Auditoría RED-14: la pieza de clasificar «bono o acción» era el espejo de la de u8l1 («dueño o prestamista»).
      // Aquí el alumno calcula lo que cobra quien presta: cupón × años + nominal.
      play({
        title: 'Lo que cobra quien presta',
        intro: 'El bono de Irene: prestas **1.000 €** a 5 años con un cupón del **3 %**. Cada año cobras lo pactado, le vaya como le vaya a la panadería (salvo que quiebre).',
        widget: { kind: 'growth', initial: 1000, monthly: 0, rate: 3, years: 5, maxInitial: 1000, maxMonthly: 0, maxRate: 8, maxYears: 30, lines: ['mattress', 'simple'], controls: ['rate', 'years'] },
        predict: {
          prompt: 'Si a la panadería le va de maravilla y multiplica sus beneficios por diez, ¿cuánto cobras tú con tu bono?',
          options: ['Diez veces más', 'Lo mismo: 30 € al año y mis 1.000 € al final', 'Nada: eso es para los socios'],
          answer: 1,
          why: 'Quien presta cobra **lo pactado**: cinco cupones de 30 € y el nominal, 1.150 € en total. El éxito extra es para los dueños.',
        },
        goal: { text: 'Busca un bono a 10 años con el que acabes cobrando 1.400 € en total.', when: [when('years', '==', 10), when('final', '==', 1400)] },
        insight: 'Con un bono sabes de antemano lo que vas a cobrar: **cupón × años + nominal**. Por eso se llama **renta fija**. Si a la empresa le va muy bien, no ganas más; si quiebra, cobras antes que los accionistas.',
        lumi: [
          { when: when('final', '>=', 1400), say: 'Diez cupones de 40 € y tus 1.000 € de vuelta.', mood: 'HAPPY' },
          { when: when('rate', '>=', 6), say: 'Un cupón alto suele avisar de más riesgo de que no te paguen.', mood: 'THINKING' },
          { say: 'Mueve el cupón y los años', mood: 'HAPPY' },
        ],
      }),
      // Auditoría RED-34: la mezcla «acciones, bonos y oro 2008-2025» se vivía en siete clases. Aquí va otra serie real
      // (cierres mensuales ajustados de Yahoo Finance); las cifras del texto salen de `charts.json` con la cuenta de la pieza.
      mission({
        title: 'Para qué sirven los bonos',
        intro: 'Datos reales de 2003 a 2025: empiezas con **10.000 €**, todo en acciones de EE. UU. Pasa una parte a bonos del Tesoro, de largo o de corto plazo, y mira qué cambia.',
        widget: { kind: 'mix', series: 'mix-bonds', weights: [100, 0, 0], amount: 10000, rebalance: true },
        predict: {
          prompt: 'Si pasas una parte de las acciones a bonos, ¿qué crees que pasa?',
          options: ['Ganas más y caes menos', 'Caes menos, pero acabas con menos', 'No cambia nada'],
          answer: 1,
          why: 'Los bonos suelen moverse menos que las acciones: **amortiguan** las caídas, pero a largo plazo rinden menos.',
        },
        goal: { text: 'Añade bonos hasta que la peor caída no pase del 30 %.', when: [when('maxDD', '>=', -30)] },
        insight: 'Con un 40 % en bonos a corto plazo, la peor caída baja del 51 % al 30 %, a cambio de acabar con 58.694 € en vez de 120.980 €. Los bonos **amortiguan**, aunque no siempre: en 2022 los de largo plazo cayeron a la vez que las acciones.',
        lumi: [
          { when: when('maxDD', '<', -40), say: 'Mira esa caída: en 2008 y 2009 dolió de verdad.', mood: 'WORRIED' },
          { when: when('w2', '>=', 70), say: 'Muy tranquila… pero mira cuánto menos acabas teniendo.', mood: 'THINKING' },
          { when: when('maxDD', '>=', -30), say: '¡Eso es! Menos sustos por el camino.', mood: 'CELEBRATE' },
          { say: 'Pasa una parte de acciones a bonos', mood: 'HAPPY' },
        ],
      }),
      key('Fija, pero no inmóvil', 'En España, el Tesoro emite **letras** (hasta 12 meses), **bonos** (de 2 a 5 años) y **obligaciones** (más de 5). Las empresas emiten bonos corporativos, que suelen pagar más porque arriesgan más.\n\nEl cupón es fijo, pero el **precio** del bono cambia cada día. Si lo mantienes hasta el vencimiento, cobras lo pactado (si el emisor paga). Si lo vendes antes, puedes ganar o perder.', 'Un bono es un préstamo: cobras intereses y te devuelven el dinero al vencimiento, si el emisor puede pagar.', 'Pruébalo: en Mercado, compara el gráfico de IBGS, un ETF de deuda pública de la zona euro a 1-3 años, con el de SXR8, del S&P 500.'),
    ], [
      single('¿Qué recibes al comprar un bono?', ['Una parte de la empresa y derecho a voto', 'Intereses periódicos y la devolución del dinero al vencimiento', 'Un dividendo que decide la junta'], 1, 'Un bono es un préstamo: cupón mientras dura y nominal al final.'),
      num('Compras un bono de 1.000 € de nominal con un cupón del 3 % anual. ¿Cuánto cobras de cupón cada año?', 30, '€', '1.000 × 3 % = 30 € al año, pase lo que pase con su precio en el mercado.'),
      num('Ese bono vence dentro de 5 años y lo mantienes hasta el final. ¿Cuánto cobras en total entre cupones y devolución?', 1150, '€', '5 × 30 = 150 € de cupones + 1.000 € de nominal = 1.150 €, si el emisor paga.'),
      match('Empareja cada valor del Tesoro con su plazo.', [['Letra', 'Hasta 12 meses'], ['Bono', 'De 2 a 5 años'], ['Obligación', 'Más de 5 años']], 'Los tres son deuda del Estado; lo que cambia es el plazo.'),
      tf('Si una empresa quiebra, los bonistas cobran antes que los accionistas.', true, 'Los acreedores cobran primero; los accionistas, los últimos.'),
      tf('Que se llame renta fija significa que su precio en el mercado no cambia nunca.', false, 'El cupón es fijo; el precio del bono se mueve cada día con los tipos de interés y con la confianza en el emisor.'),
      buckets('¿Bono o acción?', ['Bono', 'Acción'], [['Tiene fecha de vencimiento', 0], ['Paga un cupón pactado', 0], ['Te hace copropietario', 1], ['Su rentabilidad depende de los beneficios', 1], ['Cobras antes si hay quiebra', 0]], 'El bonista presta y cobra lo pactado; el accionista es dueño y comparte el éxito y el riesgo.'),
      fill('El interés periódico que paga un bono se llama ____.', 'cupón', ['dividendo', 'nominal', 'vencimiento'], 'El nombre viene de los antiguos bonos en papel, que llevaban cupones recortables para cobrar cada pago.'),
      timed(single('Rápido: ¿qué es el nominal de un bono?', ['Lo que te devuelven al vencimiento', 'El interés anual', 'Su precio de hoy'], 0, 'Es la cantidad prestada que el emisor se compromete a devolver.'), 12),
      chat(['Mi abuelo dice que los bonos son «para gente mayor» 👴', '¿Para qué sirven en una cartera?'], '¿Qué le explicas?', [['Para nada, solo las acciones dan dinero', 'Las acciones suelen rendir más a largo plazo, pero los bonos dan ingresos previsibles y suelen amortiguar las caídas.'], ['Dan ingresos previsibles y suelen amortiguar las caídas de la bolsa', '¡Eso! Aunque no siempre: en 2022 cayeron a la vez que las acciones.'], ['Son imposibles de perder', 'Si el emisor no paga, o si vendes cuando han bajado, se puede perder.']], 1, 'Los bonos aportan ingresos y estabilidad, aunque ninguna protección funciona siempre.'),
      scenario('Tienes 3.000 € que no vas a tocar en 10 años, pero sabes que si ves tu inversión caer un 40 % te pondrás muy nervioso. ¿Qué haces?', [['Lo pongo todo en acciones y procuro no mirar', 'Puede salir bien, pero si en una caída fuerte no aguantas y vendes, conviertes el susto en pérdida.'], ['Pongo una parte en bonos para que las caídas duelan menos, aunque gane algo menos', 'Bien: los bonos suelen amortiguar las caídas. A cambio, a largo plazo se rinde menos.'], ['Lo pongo todo en bonos: así nunca bajará', 'Los bonos también bajan: en 2022 cayeron a la vez que las acciones. Y rinden menos a largo plazo.']], 1, 'Mezclar bonos con acciones cambia algo de rentabilidad por caídas más suaves. Todo en acciones tienta si solo miras lo que se gana, pero solo funciona si aguantas las caídas; todo en bonos no te libra de perder.'),
    ], { source: '2.2', minutes: 6, retire: [1, 2, 4, 6, 8] }),

    lesson('u9l2', 'Cupón, precio y TIR', [
      story('El cupón que engaña', [{ id: 'dani', name: 'Dani' }], [
        say('dani', 'Mira estos dos bonos. Mismo emisor, y los dos vencen dentro de un año.'),
        note('Bono A: cupón del 6 %, cuesta 1.030 € (cotiza «a 103»). Bono B: cupón del 2 %, cuesta 990 € («a 99»).'),
        say('dani', 'Yo me quedo el A, que paga el triple.'),
        choose('¿Cuál rinde más hasta el vencimiento?', [
          opt('El A: su cupón es el triple', 'bad', say('lumi', 'Cobra 60 €, pero pierde 30 € al vencimiento: unos **2,91 %**.')),
          opt('El B: lo compras por debajo de 100', 'good', say('lumi', '¡Bien! 20 € de cupón y 10 € de diferencia: unos **3,03 %**, más que el A.')),
          opt('Rinden exactamente lo mismo', 'ok', say('lumi', 'Se parecen, pero el B rinde un poco más: 3,03 % frente a 2,91 %.')),
        ]),
        say('lumi', 'Para comparar bonos, manda la **TIR**, no el cupón.'),
      ]),
      play({
        title: 'Un bono a 960 €',
        intro: 'Un bono de **1.000 €** con un cupón del 4 % vence dentro de un año. Su precio depende del **tipo de interés del mercado**.',
        widget: { kind: 'bond', face: 1000, coupon: 4, years: 1, rate: 4, maxRate: 12, maxYears: 10 },
        predict: {
          prompt: 'Lo compras por 960 €. ¿Qué rentabilidad sacas si lo mantienes hasta el final?',
          options: ['Un 4 %, lo que dice el cupón', 'Bastante más del 4 %', 'Menos del 4 %'],
          answer: 1,
          why: 'Cobras 40 € de cupón y te devuelven 1.000 € por algo que te costó 960 €: ganas **80 € sobre 960 €**, un 8,33 %.',
        },
        goal: { text: 'Busca el tipo de mercado con el que el bono vale unos 960 €.', when: [when('years', '==', 1), when('price', '>=', 959), when('price', '<=', 961)] },
        insight: 'Ese tipo es la **TIR**: lo que rinde el bono si lo mantienes hasta el vencimiento, un 8,33 % aquí. Si lo compras por debajo de 1.000 €, la TIR supera al cupón.',
        lumi: [
          { when: when('years', '>', 1), say: 'Este bono vence en 1 año: deja el plazo en 1.', mood: 'THINKING' },
          { when: when('price', '<', 959), say: 'Te has pasado: baja un poco el tipo.', mood: 'THINKING' },
          { when: when('price', '<=', 961), say: '¡Ahí! A ese tipo, el bono vale 960 €.', mood: 'CELEBRATE' },
          { say: 'Sube el tipo de interés del mercado', mood: 'HAPPY' },
        ],
      }),
      key('Tres rentabilidades', 'Los bonos cotizan en **% del nominal**: «a 96» son 960 € por cada 1.000 €.\n\n• **Cupón:** sobre el nominal. 40 € de 1.000 € = 4 %.\n• **Rentabilidad corriente:** cupón ÷ precio. 40 € ÷ 960 € = 4,17 %.\n• **TIR:** todo lo que ganas hasta el vencimiento, contando la diferencia de precio. Es la que sirve para comparar.\n\nY para saber si ganas poder de compra, réstale la inflación.', 'La TIR es lo que rinde un bono si lo mantienes hasta el vencimiento y el emisor paga.', 'Pruébalo: en Mercado, filtra por ETF y elige la categoría de renta fija: cada uno reúne muchos bonos.'),
    ], [
      num('Un bono de 1.000 € de nominal cotiza «a 96». ¿Cuánto pagas por él?', 960, '€', '96 % de 1.000 € = 960 €.'),
      num('Bono de 1.000 €, cupón del 5 %, vence dentro de un año. Lo compras a 1.000 €. ¿Cuál es su TIR?', 5, '%', 'Cobras 50 € y recuperas lo que pagaste: 50 ÷ 1.000 = 5 %. Si compras a 100, la TIR coincide con el cupón.'),
      num('Bono de 1.000 €, cupón del 4 %, vence dentro de un año. Lo compras a 960 €. ¿Cuál es su TIR? (dos decimales)', 8.33, '%', '(40 € de cupón + 40 € de diferencia) ÷ 960 € = 8,33 %.'),
      num('Bono de 1.000 €, cupón del 5 %, vence dentro de un año. Lo compras a 1.050 €. ¿Cuánto ganas en total al vencimiento?', 0, '€', '50 € de cupón − 50 € que pierdes al recibir 1.000 € por lo que pagaste a 1.050 € = 0 €. TIR del 0 %, aunque el cupón sea del 5 %.'),
      fill('Si compras un bono por debajo de su nominal, su TIR es ____ que su cupón.', 'mayor', ['menor', 'igual', 'siempre la mitad'], 'Además del cupón, al vencimiento recibes más de lo que pagaste.'),
      single('¿Qué rentabilidad usas para comparar dos bonos con distinto precio y plazo?', ['El cupón', 'La TIR', 'El nominal'], 1, 'La TIR resume en un solo número cupones y diferencia de precio hasta el vencimiento.'),
      match('Empareja cada concepto con lo que mide.', [['Cupón', 'Interés anual sobre el nominal'], ['Rentabilidad corriente', 'Cupón ÷ precio de compra'], ['TIR', 'Todo lo que ganas hasta el vencimiento'], ['Precio «a 104»', '104 % del nominal']], 'Cupón, rentabilidad corriente y TIR coinciden solo si compras exactamente a 100.'),
      scenario('Te ofrecen dos bonos del mismo emisor que vencen dentro de un año: A, cupón del 6 % a 103; B, cupón del 2 % a 99. ¿Cuál rinde más hasta el vencimiento?', [['A, porque su cupón es el triple', 'Cobra 60 €, pero pierde 30 € al vencimiento: (60 − 30) ÷ 1.030 ≈ 2,91 %.'], ['B, porque su TIR es algo mayor', 'Exacto: (20 + 10) ÷ 990 ≈ 3,03 %, frente al 2,91 % de A.'], ['Rinden exactamente lo mismo', 'Se parecen, pero B rinde un poco más: hay que hacer la cuenta.']], 1, 'El cupón engaña: manda la TIR, que incluye lo que ganas o pierdes con el precio.'),
      timed(fill('La rentabilidad que obtienes si mantienes el bono hasta el final se llama ____.', 'TIR', ['TAE', 'TER', 'PER'], 'Tasa interna de rentabilidad: la «rentabilidad a vencimiento».'), 15),
      num('Un bono tiene una TIR del 3 % y la inflación es del 2 %. ¿Cuál es su rentabilidad real aproximada?', 1, '%', '3 − 2 = 1 %. La TIR es nominal: réstale la inflación para saber si ganas poder de compra.'),
      tf('Un bono con cupón del 7 % siempre rinde más que uno con cupón del 3 %.', false, 'Depende del precio al que lo compres: la TIR es la que manda.'),
      scenario('Dos bonos del mismo emisor vencen dentro de un año y pagan el mismo cupón del 3 %. Uno cotiza a 100 y el otro a 104. ¿Cuál compras?', [['El de 104: si es más caro, será mejor', 'Mismo emisor, mismo cupón y mismo plazo: pagar más solo te deja menos ganancia.'], ['El de 100: con el mismo cupón, pagar 104 te hace perder 4 € por cada 100 al vencimiento', 'Bien: al vencimiento te devuelven 100 en los dos. Comprar por encima baja la TIR.'], ['Da igual: pagan el mismo cupón', 'El cupón es el mismo, pero no lo que pagas: su TIR es distinta.']], 1, 'Con todo lo demás igual, el bono más barato rinde más hasta el vencimiento. El cupón igual tienta a pensar que rinden igual, pero quien paga 104 solo recupera 100.'),
      buckets('Sin hacer cuentas: ¿su TIR será mayor o menor que su cupón?', ['TIR mayor que el cupón', 'TIR menor que el cupón'], [['Compras el bono a 95', 0], ['Compras el bono a 103', 1], ['Compras el bono a 98', 0], ['Compras el bono a 110', 1]], 'Por debajo de 100, al vencimiento recibes más de lo que pagaste y la TIR supera al cupón. Por encima de 100, recuperas menos de lo que pagaste y la TIR queda por debajo: un cupón alto no compensa pagar caro.'),
    ], { source: '2.2', minutes: 6, retire: [0, 2, 3, 7, 8, 9, 10] }),

    lesson('u9l3', 'Si suben los tipos, bajan los bonos', [
      play({
        title: 'El balancín',
        intro: 'Tienes un bono de **1.000 €** al 2 %, a 10 años, y los nuevos también pagan un 2 %. ¿Y si suben los tipos?',
        widget: { kind: 'bond', face: 1000, coupon: 2, years: 10, rate: 2, maxRate: 6, maxYears: 30 },
        predict: {
          prompt: 'Los tipos suben y los bonos nuevos pasan a pagar un 4 %. ¿Qué le pasa al precio del tuyo?',
          options: ['Nada: el cupón es fijo', 'Baja', 'Sube'],
          answer: 1,
          why: 'Nadie paga 1.000 € por un 2 % si los nuevos dan un 4 %: tu bono baja a unos **838 €**, un 16 % menos.',
        },
        goal: { text: 'Con los tipos al 4 %, alarga el plazo a 30 años.', when: [when('rate', '==', 4), when('years', '==', 30)] },
        insight: '**Tipos arriba, precio abajo.** Y cuanto más largo el bono, más se mueve: con la misma subida, a 1 año cae un 2 % y a 30 años, un 35 %. Esa sensibilidad es la **duración**.',
        lumi: [
          { when: when('change', '<=', -30), say: '¡Un tercio menos! Los bonos largos son los que más sufren.', mood: 'WORRIED' },
          { when: when('change', '<', 0), say: 'Los nuevos pagan más: el tuyo tiene que abaratarse.', mood: 'THINKING' },
          { when: when('change', '>', 0), say: 'Si los tipos bajan, tu bono vale más.', mood: 'HAPPY' },
          { say: 'Sube el tipo de interés del mercado', mood: 'HAPPY' },
        ],
      }),
      story('Cotiza a 82', [{ id: 'ana', name: 'Ana' }], [
        note('2021: Ana compra una obligación a 10 años con un cupón del 1 %.'),
        note('2023: los tipos han subido. Las nuevas pagan un 3,5 % y la suya cotiza a 82.'),
        say('ana', '¡Mi bono «seguro» vale un 18 % menos! No necesito ese dinero, pero me agobia.'),
        choose('¿Qué le dices?', [
          opt('Véndela ya, antes de que caiga más', 'bad', say('lumi', 'Vendiendo a 82, la caída del 18 % se convierte en pérdida real.')),
          opt('Si no lo necesitas, puedes mantenerla hasta el vencimiento', 'good', say('lumi', 'Si el emisor paga, al final cobra el **100 %**. Eso sí, solo al 1 %.')),
          opt('Espera a que bajen los tipos', 'ok', say('lumi', 'Nadie controla los tipos. Mejor decidir por su plan que por adivinarlos.')),
        ]),
        say('lumi', 'Una subida de tipos solo es pérdida si vendes antes o hay impago.'),
      ]),
      key('2022, el año que cayeron los bonos', 'La **duración** mide cuánto se mueve el precio si cambian los tipos:\n\n**Variación del precio ≈ − duración × cambio de tipos.**\n\nCon duración 7, si los tipos suben 1 punto, el bono cae un 7 % aproximadamente. En 2022 la inflación disparó los tipos y muchos índices de bonos a largo plazo cayeron más de un 20 %.', 'Tipos arriba, bonos abajo; cuanto más largo el bono, más fuerte el golpe.', 'Pruébalo: en Mercado, compara el gráfico de TLT, de bonos a más de 20 años, con el de SHY, de 1 a 3 años.'),
    ], [
      upDown('Enero de 2022: la inflación en EE. UU. está en máximos de casi 40 años y se espera que la Reserva Federal suba los tipos. Este es un ETF de bonos del Tesoro de EE. UU. a más de 20 años. ¿Qué hizo después?', 'hist-rates-2022', 'Los bonos a muy largo plazo tienen mucha duración: su precio es muy sensible a los cambios de tipos, en los dos sentidos.', 'hasta octubre de 2023'),
      single('El banco central sube los tipos. ¿Qué pasa con el precio de los bonos ya emitidos?', ['Sube', 'Baja', 'No cambia'], 1, 'Los nuevos pagan más, así que los antiguos solo se venden más baratos.'),
      num('Un bono tiene duración 7 y los tipos suben 1 punto. ¿Cuánto cae su precio aproximadamente?', 7, '%', '7 × 1 = 7 % de caída aproximada.'),
      num('Tienes 10.000 € en bonos con duración 6 y los tipos suben 2 puntos. ¿Cuántos euros pierdes aproximadamente?', 1200, '€', '6 × 2 = 12 % → 10.000 × 12 % = 1.200 €.'),
      num('Un bono con duración 8 y los tipos bajan 1,5 puntos. ¿Cuánto sube su precio aproximadamente?', 12, '%', '8 × 1,5 = 12 % de subida: el balancín también funciona hacia arriba.'),
      order('Ordena de menor a mayor sensibilidad a los tipos de interés.', ['Letra a 6 meses', 'Bono a 3 años', 'Obligación a 10 años', 'Obligación a 30 años'], 'Cuanto más largo el plazo, más duración: el de 30 años es el que más se mueve.'),
      scenario('Compraste en 2021 una obligación a 10 años con cupón del 1 %. En 2023 las nuevas pagan un 3,5 % y la tuya cotiza a 82. No necesitas ese dinero. ¿Qué opciones tienes?', [['Venderla ya para no perder más', 'Venderías a 82: convertirías en real una pérdida del 18 %.'], ['Mantenerla hasta el vencimiento y cobrar lo pactado', 'Si el emisor paga, al vencimiento recibes el 100 % del nominal y la caída desaparece, aunque tu rentabilidad (1 %) quede por debajo de la de los nuevos.'], ['Esperar a que el banco central baje los tipos a cero mañana', 'Nadie controla los tipos: no puedes basar tu plan en adivinarlos.']], 1, 'Las caídas por subidas de tipos solo se convierten en pérdida si vendes antes del vencimiento (o si el emisor no paga).'),
      tf('Si mantienes un bono hasta el vencimiento y el emisor paga, una subida de tipos no te hace perder el nominal.', true, 'Al vencimiento recibes el 100 %; lo que pierdes es la oportunidad de haber cobrado más interés.'),
      timed(single('Rápido: tipos abajo, precio de los bonos…', ['Arriba', 'Abajo', 'Igual'], 0, 'Si bajan los tipos, los bonos antiguos con cupones más altos valen más.'), 10),
      match('Empareja cada situación con lo que suele pasar.', [['Suben los tipos', 'Bajan los precios de los bonos'], ['Bajan los tipos', 'Suben los precios de los bonos'], ['Bono con más duración', 'Más sensible a los tipos'], ['Mantener hasta el vencimiento', 'Cobras lo pactado si el emisor paga']], 'Es la regla del balancín, más el papel de la duración y del plazo.'),
      scenario('Vas a guardar en bonos un dinero que quizá necesites dentro de un año, y se habla de que los tipos pueden subir. ¿Qué bono te expone menos?', [['Una obligación a 30 años, que paga más', 'Es la más sensible: si los tipos suben y tienes que vender, puede caer mucho.'], ['Una letra o un bono a corto plazo', 'Bien: con poco plazo, su precio apenas se mueve con los tipos y pronto te devuelven el dinero.'], ['Da igual el plazo: todos se mueven igual', 'No: cuanto más largo el bono, más se mueve su precio.']], 1, 'Con un plazo corto, la duración es pequeña y una subida de tipos apenas mueve el precio. El bono largo tienta porque suele pagar más, pero es el que más cae si suben los tipos y tienes que vender.'),
      buckets('¿Qué le pasa al precio del bono que ya tienes?', ['Sube', 'Baja'], [['El banco central sube los tipos', 1], ['Los bonos nuevos pasan a pagar menos', 0], ['Se esperan bajadas de tipos', 0], ['Los tipos del mercado pasan del 2 % al 4 %', 1]], 'Es el balancín: si los tipos suben, tu bono, con su cupón fijo, solo se vende más barato; si bajan, su cupón resulta más atractivo y su precio sube.'),
      chat(['He leído que el banco central va a bajar los tipos.', '¿Eso es bueno o malo para los bonos que ya tengo?'], '¿Qué le contestas?', [['Bueno: si bajan los tipos, el precio de tus bonos sube', 'Eso. Y cuanto más largo el bono, más sube.'], ['Malo: cobrarás menos cupón', 'Tu cupón es fijo y no cambia. Lo que cambia es el precio, y sube.'], ['Da igual: los bonos no se mueven', 'Sí se mueven: tipos abajo, precio arriba.']], 0, 'Si los tipos bajan, tu cupón fijo es más atractivo que el de los bonos nuevos y tu bono vale más. Lo tentador es pensar que cobrarás menos, pero eso solo les pasa a los bonos nuevos, no al tuyo.'),
    ], { source: '2.2', minutes: 6, retire: [1, 2, 3, 4, 6, 7, 8] }),

    lesson('u9l4', 'Rating y riesgo de impago', [
      story('El bono del 14 %', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'He encontrado un bono de una empresa que paga un 14 % al año.'),
        say('leo', 'Es como un depósito, pero mejor. ¡Voy a meter ahí todos mis ahorros!'),
        note('Las agencias de calificación le ponen a la empresa una nota CCC, de las más bajas.'),
        choose('¿Qué le dices?', [
          opt('Genial: el cupón es fijo', 'bad', say('lumi', 'Fijo, si la empresa puede pagarlo. Con CCC, el riesgo de impago es altísimo.')),
          opt('Ese 14 % es el precio de un riesgo alto de no cobrar', 'good', say('lumi', '¡Eso! El FGD cubre depósitos, no bonos. Uno basura puede no devolver casi nada.')),
          opt('Mete solo la mitad de tus ahorros', 'ok', say('lumi', 'Mejor, pero sigue siendo muchísimo en un solo emisor tan arriesgado.')),
        ]),
        say('lumi', 'Si un bono paga mucho más que los demás, pregúntate qué teme el mercado.'),
      ]),
      play({
        title: 'La nota del emisor',
        intro: 'Las agencias **S&P, Moody\'s y Fitch** ponen nota a la capacidad de pago de Estados y empresas, de la AAA a la D. Clasifica cada nota.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Grado de inversión' }, { label: 'Especulativo' }, { label: 'Impago' }],
          cards: [
            { icon: 'shield', label: 'AAA', bin: 0, why: 'Máxima calidad: el emisor más fiable.' },
            { icon: 'alert', label: 'BB+', bin: 1, why: 'Justo por debajo de BBB−: ya es high yield o «bono basura».' },
            { icon: 'verified', label: 'A', bin: 0, why: 'Grado de inversión: buena capacidad de pago.' },
            { icon: 'warning', label: 'D', bin: 2, why: 'La D es la nota de un emisor que ya no ha pagado.' },
            { icon: 'scale', label: 'BBB−', bin: 0, why: 'El último escalón del grado de inversión: la frontera.' },
            { icon: 'siren', label: 'CCC', bin: 1, why: 'Muy especulativo: el riesgo de no cobrar es alto.' },
          ],
        },
        goal: { text: 'Clasifica las seis notas.', when: [when('done', '==', 6)] },
        insight: 'La frontera está en **BBB−**: por encima, grado de inversión; por debajo, especulativo (*high yield*). A peor nota, más cupón… y **más riesgo de no cobrar**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: la frontera está en BBB−.', mood: 'THINKING' },
          { say: 'Clasifica cada nota', mood: 'HAPPY' },
        ],
      }),
      key('Cuando no pagan', 'Quien presta a alguien con peor nota exige más interés. La diferencia frente a un bono muy seguro se llama **prima de riesgo**; en España, la diferencia con el bono alemán a 10 años.\n\nEn 2012, los acreedores privados de Grecia aceptaron una quita de más de la mitad del nominal de sus bonos. Una empresa en quiebra puede no devolver casi nada. Por eso también se diversifica en renta fija.', 'La nota mide el riesgo de impago: a peor nota, más cupón y más riesgo de perder.', 'Pruébalo: en Mercado, compara el gráfico de EMB, de bonos de países emergentes, con el de IEF, del Tesoro de EE. UU.'),
    ], [
      match('Empareja cada nota con su significado.', [['AAA', 'Máxima calidad'], ['BBB−', 'Último escalón del grado de inversión'], ['BB', 'Especulativo (high yield)'], ['D', 'Impago']], 'Por encima de BBB− es grado de inversión; por debajo, especulativo.'),
      order('Ordena de mejor a peor calificación.', ['AAA', 'AA', 'A', 'BBB', 'BB', 'D'], 'Las letras bajan de calidad de la AAA a la D (impago).'),
      single('¿Por qué un bono high yield paga más interés?', ['Porque el emisor es más generoso', 'Porque el riesgo de impago es mayor', 'Porque vence antes'], 1, 'Quien presta a un emisor más arriesgado exige más interés a cambio.'),
      buckets('¿Grado de inversión o especulativo?', ['Grado de inversión', 'Especulativo (bono basura)'], [['AA+', 0], ['BBB−', 0], ['BB+', 1], ['CCC', 1], ['A', 0]], 'La frontera está en BBB−: por debajo empieza el high yield.'),
      scenario('Un amigo te enseña un bono de una empresa con nota CCC que paga un 14 % y dice que «es como un depósito, pero mejor». ¿Qué le dices?', [['Que tiene razón: el cupón es fijo', 'El cupón es fijo solo si la empresa puede pagarlo; con CCC, el riesgo de impago es muy alto.'], ['Que ese 14 % es el precio de un riesgo alto de no cobrar, nada que ver con un depósito', 'Exacto: un depósito está cubierto por el Fondo de Garantía de Depósitos hasta 100.000 €; un bono basura puede no devolver casi nada.'], ['Que meta ahí todos sus ahorros para asegurarse el 14 %', 'Concentrarlo todo en un emisor con nota CCC es asumir un riesgo enorme.']], 1, 'Un interés alto en renta fija casi siempre significa un riesgo alto de impago.'),
      tf('En 2012 los acreedores privados de Grecia aceptaron perder más de la mitad del nominal de sus bonos.', true, 'Fue una de las mayores reestructuraciones de deuda pública de la historia: hasta un Estado europeo puede no pagar lo pactado.'),
      fill('La diferencia entre lo que paga el bono español a 10 años y el alemán se llama ____.', 'prima de riesgo', ['inflación', 'TIR', 'cupón corrido'], 'Mide cuánto más exige el mercado por prestar a España que a Alemania.'),
      multi('¿Qué entidades califican la deuda de Estados y empresas? Marca todas.', ['S&P', 'Moody\'s', 'Fitch', 'La CNMV'], [0, 1, 2], 'La CNMV supervisa los mercados en España, pero no pone notas a los emisores.'),
      num('Del mismo plazo, un bono alemán paga un 2,5 % y uno español un 3,2 %. ¿Cuál es la prima de riesgo en puntos básicos? (1 punto = 100 pb)', 70, 'pb', '3,2 − 2,5 = 0,7 puntos = 70 puntos básicos.'),
      timed(single('Rápido: ¿qué significa una calificación D?', ['Impago', 'Muy segura', 'Sin calificar'], 0, 'D es la nota de un emisor que ya no ha pagado.'), 10),
      scenario('Quieres guardar en bonos el dinero de la entrada de un piso para dentro de 5 años. Te ofrecen dos: uno de un emisor con nota AAA y otro de una empresa con nota BB que paga bastante más. ¿Cuál eliges?', [['El de nota BB: paga más', 'Paga más porque el riesgo de no cobrar es mayor, y ese dinero no te lo puedes jugar.'], ['El de nota AAA, aunque pague menos', 'Bien: para un dinero con fecha que no puedes perder, manda la seguridad de cobrar.'], ['Mitad y mitad, para tener de los dos', 'Mejor que todo en BB, pero sigues arriesgando parte de un dinero que necesitas sí o sí.']], 1, 'Un cupón más alto es el precio de un riesgo de impago mayor. Para un dinero que necesitas en una fecha, la nota alta protege lo que importa; el interés extra tienta, pero puede costarte parte de la entrada.'),
    ], { source: '2.2', minutes: 6, retire: [3, 4, 5, 8, 9, 10] }),

    // Rehecha en la auditoría (RED-7, RED-16 y RED-31): depósitos, cuentas y garantía de depósitos se explican en u11l5.
    // Esta clase se queda con las letras: compra al descuento, subasta, cómo pedirlas e impuestos.
    // Fuente (12-11-2026): Tesoro Público, «Letras del Tesoro», https://www.tesoro.es/deuda-publica/los-valores-del-tesoro/letras-del-tesoro
    // (plazos de 3, 6, 9 y 12 meses; petición mínima de 1.000 €; emisión por subasta, al descuento; rendimientos sin retención a cuenta).
    lesson('u9l5', 'Letras del Tesoro', [
      story('Pagar 970 € por 1.000 €', [{ id: 'marc', name: 'Marc' }], [
        say('marc', 'He pedido una letra a 12 meses en la subasta del Tesoro. Me han cobrado **970 €** y dentro de un año me devuelven **1.000 €**.'),
        say('marc', '¿Y los intereses? No veo ningún cupón.'),
        choose('¿Dónde está su interés?', [
          opt('No tiene: las letras no pagan nada', 'bad', say('lumi', 'Sí paga, pero no con cupones.')),
          opt('En los 30 € que hay entre lo que paga y lo que recibe', 'good', say('lumi', 'Eso es comprar **al descuento**: 30 ÷ 970 = un 3,09 %.')),
          opt('En un cupón que cobrará al final', 'ok', say('lumi', 'No hay cupón: el interés es la diferencia entre los 970 € y los 1.000 €.')),
        ]),
        say('marc', '¿Y si necesito el dinero antes del año?'),
        say('lumi', 'Puedes venderla en el mercado, al precio de ese día: algo más o algo menos de lo que esperabas.'),
        say('lumi', 'Si esperas al vencimiento, recibes los 1.000 €, hayan hecho lo que hayan hecho los tipos.'),
      ]),
      play({
        title: 'El descuento lo pone el tipo',
        intro: 'Una letra a 12 meses devuelve siempre **1.000 €**. Mueve el tipo de interés y mira cuánto pagarías hoy por ella.',
        widget: { kind: 'bond', head: 'Lo que pagas hoy por una letra que devuelve 1.000 € dentro de un año', face: 1000, coupon: 0, years: 1, rate: 3, maxRate: 6, maxYears: 1 },
        predict: {
          prompt: 'Si el tipo de las letras sube del 2 % al 4 %, ¿qué pasa con el precio de una letra nueva?',
          options: ['Sube: pagas más', 'Baja: pagas menos por los mismos 1.000 €', 'No cambia'],
          answer: 1,
          why: 'Al 2 % pagarías **980,39 €**; al 4 %, **961,54 €**. Cuanto más alto es el tipo, mayor es el descuento.',
        },
        goal: { text: 'Busca el tipo con el que la letra cuesta menos de 955 €.', when: [when('price', '<', 955)] },
        insight: 'Lo que cambia de una letra a otra es **cuánto pagas hoy**: ese descuento es tu interés, y lo fija cada **subasta**.',
        lumi: [
          { when: when('price', '<', 955), say: 'Con tipos altos, la letra se compra más barata y rinde más.', mood: 'HAPPY' },
          { when: when('rate', '<=', 1), say: 'Con tipos casi a cero, apenas hay descuento.', mood: 'THINKING' },
          { say: 'Sube y baja el tipo de interés', mood: 'HAPPY' },
        ],
      }),
      key('Cómo se compra una letra', 'El Tesoro las emite por **subasta**, a 3, 6, 9 y 12 meses. Cada petición es de **1.000 €** como mínimo.\n\n• **Dónde**: en la web del Tesoro, con una cuenta directa en el Banco de España, o a través de tu banco o bróker (pregunta la comisión).\n• **Petición no competitiva**: aceptas el precio medio de la subasta. Es la habitual para un particular.\n• **Impuestos**: el interés no lleva retención, pero se declara en la renta.', 'Una letra es un préstamo corto al Estado: pagas menos de 1.000 € hoy y recibes 1.000 € al vencimiento.', 'Pruébalo: pregúntale a Lumi cómo se pide una letra en la web del Tesoro.'),
    ], [
      num('Compras una letra a 12 meses por 980 € y al vencimiento recibes 1.000 €. ¿Qué rentabilidad obtienes? (dos decimales)', 2.04, '%', '20 ÷ 980 = 2,04 %.'),
      num('Un depósito de 10.000 € al 2,5 % TAE durante un año. Con la retención del 19 %, ¿cuánto ganas neto?', 202.5, '€', '10.000 × 2,5 % = 250 € brutos; 250 × 0,81 = 202,50 € netos.'),
      num('Tienes 130.000 € en un depósito de un solo banco. Si el banco quiebra, ¿cuánto queda fuera del Fondo de Garantía de Depósitos?', 30000, '€', 'Cubre hasta 100.000 € por titular y entidad: 130.000 − 100.000 = 30.000 € sin cubrir.'),
      match('Empareja cada producto con su rasgo.', [['Letra del Tesoro', 'Se compra al descuento'], ['Depósito a plazo', 'Cubierto por el FGD hasta 100.000 €'], ['Cuenta corriente', 'Dinero disponible al momento'], ['Obligación del Estado', 'Plazo de más de 5 años']], 'Cada producto encaja con un plazo y un uso distinto.'),
      single('¿A qué plazos emite letras el Tesoro?', ['3, 6, 9 y 12 meses', '1, 2 y 5 años', '10 y 30 años'], 0, 'Las letras son siempre de un año o menos.'),
      tf('Las letras del Tesoro pagan un cupón cada trimestre.', false, 'Se compran al descuento: la diferencia entre lo que pagas y los 1.000 € que recibes es el interés.'),
      buckets('¿Para qué horizonte encaja mejor cada producto?', ['Dinero que necesitaré en menos de 1 año', 'Dinero para dentro de 20 años'], [['Letra a 6 meses', 0], ['Depósito a 12 meses', 0], ['Fondo indexado de acciones mundiales', 1], ['Fondo monetario', 0], ['Aportación mensual a un ETF mundial', 1]], 'Para el corto plazo prima la seguridad; para décadas, la rentabilidad a largo plazo pesa más que las oscilaciones.'),
      scenario('Laura tiene 15.000 € para la entrada de un piso que comprará dentro de 10 meses. ¿Qué tiene más sentido?', [['Meterlo en acciones para que crezca más', 'En 10 meses la bolsa puede caer un 20 % justo cuando necesite el dinero.'], ['Una letra o un depósito con un plazo que encaje con la fecha', 'Bien: poco riesgo y el dinero disponible cuando lo necesita.'], ['Dejarlo en una cuenta al 0 %', 'Es seguro, pero renuncia a un interés sin apenas riesgo.']], 1, 'El plazo manda: el dinero con fecha cercana no debe depender de la bolsa.'),
      timed(tf('El FGD cubre hasta 100.000 € por titular y por entidad.', true, 'Si tienes más en un mismo banco, el exceso no está cubierto.'), 10),
      fill('Las letras del Tesoro se compran desde ____ €.', '1.000', ['100', '10.000', '50'], 'Es el importe mínimo en las subastas del Tesoro.'),
      scenario('Tu banco te ofrece un depósito a 12 meses, pero no sabes si necesitarás el dinero antes. ¿Qué miras antes de firmar?', [['Solo la TAE: cuanto más alta, mejor', 'La TAE importa, pero si lo cancelas antes, la penalización puede comerse el interés.'], ['La penalización por sacarlo antes y si el plazo encaja con cuándo lo necesitarás', 'Bien: un depósito encaja si el plazo coincide con tu plan. Si no, quizá te convenga una letra más corta.'], ['Nada: todos los depósitos son iguales', 'Cambian el tipo, el plazo y la penalización: compáralos.']], 1, 'Un depósito te ata durante un plazo: lo primero es que encaje con cuándo necesitarás el dinero. Fijarse solo en la TAE más alta tienta, pero cancelar antes puede salir caro.'),
      chat(['Tengo 3.000 € para el viaje de fin de curso, dentro de 6 meses.', '¿Los meto en un ETF de acciones para sacar algo más?'], '¿Qué le contestas?', [['Mejor una letra a 6 meses o un depósito: en 6 meses la bolsa puede caer', 'Eso. Para un dinero con fecha tan cercana, prima que esté ahí.'], ['Sí: en 6 meses seguro que sube', 'Nadie lo sabe. Puede caer justo antes del viaje.'], ['Mejor en bitcoin, que sube más', 'Aún más volátil: podrías quedarte sin viaje.']], 0, 'El plazo manda: en 6 meses la bolsa puede estar abajo justo cuando necesites el dinero. Una letra o un depósito que venza a tiempo rinde poco, pero el dinero estará ahí; la bolsa tienta porque rinde más a largo plazo, no en unos meses.'),
      num('Compras una letra a 12 meses por 960 € y al vencimiento recibes 1.000 €. ¿Qué rentabilidad obtienes? (dos decimales)', 4.17, '%', '40 ÷ 960 = 0,0417 → 4,17 %.'),
      scenario('Compraste una letra a 12 meses. A los 6 meses necesitas el dinero, y los tipos han subido. ¿Qué pasa si la vendes ahora?', [['Recibo los 1.000 € igualmente', 'Los 1.000 € solo están asegurados al vencimiento.'], ['La vendo al precio de mercado, que puede ser menor de lo que esperaba', 'Eso: si los tipos han subido, las letras nuevas rinden más y la tuya vale algo menos.'], ['No se puede vender antes de que venza', 'Sí se puede: hay un mercado donde se compran y venden.']], 1, 'Hasta el vencimiento, el precio de una letra se mueve con los tipos, aunque poco, porque su plazo es corto.'),
      tf('El interés de una letra del Tesoro no lleva retención, pero hay que declararlo en la renta.', true, 'Está exento de retención a cuenta, no de impuestos: tributa en la base del ahorro.'),
      order('Ordena lo que pasa desde que pides una letra hasta que vence.', ['Haces una petición no competitiva', 'Se celebra la subasta y se fija el precio', 'Te cobran ese precio', 'Al vencimiento recibes 1.000 €'], 'Pides, la subasta fija el precio, lo pagas y al final recibes el nominal.'),
    ], { source: '2.2', minutes: 6, retire: [0, 1, 2, 3, 5, 6, 7, 8, 10, 11] }),

    lesson('u9l6', 'Bonos ligados a la inflación', [
      story('Protegida… ¿de todo?', [{ id: 'marta', name: 'Marta' }], [
        note('2021. Marta compra un fondo de bonos ligados a la inflación «para protegerse».'),
        note('2022. La inflación se dispara… y su fondo cae.'),
        say('marta', '¡No lo entiendo! Lo compré justo para esto.'),
        choose('¿Qué ha pasado?', [
          opt('El fondo es una estafa', 'bad', say('lumi', 'No. Estos bonos también bajan de precio cuando suben los tipos reales.')),
          opt('Subieron los tipos y eso pesó más que el ajuste por inflación', 'good', say('lumi', '¡Exacto! Protegen el poder de compra hasta el vencimiento, pero su precio se mueve.')),
          opt('La inflación hunde a los bonos ligados', 'ok', say('lumi', 'Al revés: el ajuste les ayuda. Lo que les pesó fue la subida de tipos.')),
        ]),
        say('lumi', 'Un fondo vende bonos antes del vencimiento: por eso sí nota las subidas de tipos.'),
      ]),
      play({
        title: '¿Y si la inflación se dispara?',
        intro: 'Piensa en un bono normal como una cuenta que paga un **3 %** fijo durante 10 años. Uno ligado a la inflación paga un **1 %** más la inflación.',
        widget: { kind: 'realrate', amount: 10000, nominal: 3, inflation: 1, years: 10, maxNominal: 6, maxInflation: 8 },
        predict: {
          prompt: 'El normal da un 3 %; el ligado, un 1 % más la inflación. ¿Con qué inflación empatan?',
          options: ['Con un 1 %', 'Con un 2 %', 'Con un 4 %'],
          answer: 1,
          why: 'Con un 2 % de inflación, el ligado da 1 + 2 = 3 %, lo mismo que el normal. Es la **inflación de equilibrio** que espera el mercado.',
        },
        goal: { text: 'Sube la inflación hasta que el bono normal rinda menos de un 1 % real.', when: [when('nominal', '==', 3), when('real', '<', 1)] },
        insight: 'Si la inflación supera la de equilibrio (aquí, un **2 %**), gana el bono ligado: sigue dando su 1 % real si lo mantienes hasta el final. Si se queda por debajo, gana el normal.',
        lumi: [
          { when: when('real', '<', 0), say: 'Ahora el bono normal ya pierde poder de compra.', mood: 'WORRIED' },
          { when: when('real', '<', 1), say: 'El ligado, con su 1 % real, ya gana al normal.', mood: 'THINKING' },
          { say: 'Sube la inflación poco a poco', mood: 'HAPPY' },
        ],
      }),
      key('Cómo funcionan', 'El bono ajusta su **nominal** con la inflación: con un 3 %, el nominal de 1.000 € pasa a 1.030 € y el cupón se calcula sobre esa cifra. El Tesoro español los liga a la inflación de la **zona euro** (sin tabaco); en EE. UU. se llaman **TIPS**.\n\nNo protegen de las subidas de tipos si vendes antes ni de un impago. Y si la inflación acaba siendo baja, rinden menos que un bono normal.', 'Protegen frente a la inflación inesperada si los mantienes hasta el final, no frente a todo.', 'Pruébalo: en Mercado, busca TIP, un ETF de bonos ligados a la inflación de EE. UU., y mira qué hizo en 2022.'),
    ], [
      num('Bono ligado a la inflación con nominal de 1.000 €. Este año la inflación es del 3 %. ¿Cuál es el nuevo nominal?', 1030, '€', '1.000 × 1,03 = 1.030 €.'),
      num('Ese bono paga un cupón real del 1 % sobre el nominal ajustado de 1.030 €. ¿Cuánto cobras este año? (dos decimales)', 10.3, '€', '1.030 × 1 % = 10,30 €.'),
      num('Un bono normal da un 3,2 % y uno ligado a la inflación del mismo plazo un 1,0 % real. ¿Qué inflación media descuenta el mercado?', 2.2, '%', '3,2 − 1,0 = 2,2 %: es la inflación de equilibrio.'),
      single('¿Cuándo gana el bono ligado a la inflación frente al normal?', ['Si la inflación acaba siendo mayor de lo que esperaba el mercado', 'Si la inflación es cero', 'Siempre'], 0, 'Si la inflación supera la de equilibrio, el ajuste del nominal compensa de sobra su cupón más bajo.'),
      tf('Un bono ligado a la inflación no puede bajar de precio.', false, 'Si suben los tipos reales, su precio baja como el de cualquier bono; en 2022 muchos cayeron.'),
      tf('Los bonos ligados a la inflación del Tesoro español se ajustan con la inflación de la zona euro.', true, 'Usan el índice armonizado de precios de la zona euro sin tabaco, no el IPC español.'),
      scenario('En 2021 Marta compra un fondo de bonos ligados a la inflación «para protegerse». En 2022 la inflación sube muchísimo… y el fondo cae. ¿Qué ha pasado?', [['El fondo es una estafa', 'No: los bonos ligados a la inflación también bajan de precio cuando suben los tipos reales.'], ['Subieron los tipos reales y eso pesó más que el ajuste por inflación', 'Exacto: protegen el poder de compra hasta el vencimiento, pero su precio se mueve con los tipos.'], ['La inflación baja el precio de todos los bonos ligados', 'Al contrario, el ajuste por inflación les ayuda; lo que les perjudicó fue la subida de tipos.']], 1, 'Un fondo vende y compra bonos antes del vencimiento, así que su valor sí sufre con las subidas de tipos.'),
      buckets('Bono ligado a la inflación mantenido hasta el vencimiento: ¿te protege o no?', ['Protege', 'No protege'], [['Una inflación mayor de la esperada', 0], ['Una subida de tipos si tienes que vender antes', 1], ['La pérdida de poder de compra', 0], ['Un impago del emisor', 1]], 'Cubre el riesgo de inflación; no el de tipos si vendes antes ni el de crédito.'),
      timed(fill('En EE. UU., los bonos ligados a la inflación se llaman ____.', 'TIPS', ['ETF', 'REIT', 'CFD'], 'Treasury Inflation-Protected Securities.'), 12),
      chat(['La inflación me da miedo 😱', '¿Con bonos ligados a la inflación ya estoy protegida de todo?'], '¿Qué le dices?', [['Sí, de todo', 'Protegen de la inflación, no de las subidas de tipos ni de un impago.'], ['Protegen de la inflación inesperada si los mantienes hasta el final, pero su precio también se mueve', '¡Bien! Cubren un riesgo concreto, no todos.'], ['No, no protegen de nada', 'Sí protegen el poder de compra si los mantienes hasta el vencimiento.']], 1, 'Cada activo cubre un riesgo concreto; ninguno lo cubre todo.'),
      scenario('Crees que la inflación de los próximos años será más alta de lo que espera el mercado, y vas a mantener el bono hasta que venza. ¿Cuál eliges?', [['Uno ligado a la inflación', 'Bien: su nominal sube con la inflación. Si es mayor de la esperada, gana al normal.'], ['Uno normal, que paga un cupón más alto', 'Su cupón es fijo: si la inflación sube más de lo previsto, se come su rentabilidad real.'], ['Ninguno: con inflación, los bonos siempre pierden', 'El ligado está pensado justo para eso, si lo mantienes hasta el final.']], 0, 'Si la inflación supera la que espera el mercado, el ajuste del nominal compensa el cupón más bajo del ligado. El cupón más alto del normal tienta, pero es fijo y la inflación lo erosiona.'),
    ], { minutes: 6, retire: [0, 1, 2, 4, 6, 8] }),
  ],
})
