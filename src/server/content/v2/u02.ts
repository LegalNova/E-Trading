import 'server-only'
// Sección 1 · Unidad 2 · Presupuesto y ahorro (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, portfolio, say, scenario, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u2', order: 2, title: 'Presupuesto y ahorro', description: 'Saber en qué se va tu dinero, montar tu colchón y sacar cada mes dinero para invertir',
  lessons: [
    lesson('u2l1', 'Tu presupuesto en 10 minutos', [
      story('¿Dónde se ha ido mi sueldo?', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Otra vez a final de mes casi a cero. ¡Pero si cobro 1.400 €!'),
        say('laura', 'No sé ni en qué me lo gasto.'),
        choose('¿Qué le aconsejas primero?', [
          opt('Que deje de salir y no se compre nada más', 'ok', say('lumi', 'Recortar a ciegas suele durar poco. Primero hay que saber **en qué** se va el dinero.')),
          opt('Que mire los movimientos del banco del último mes', 'good', say('lumi', '¡Eso es! Es la foto real de sus gastos, no la que cree. Con eso puede hacer su **presupuesto**.')),
          opt('Que pida un adelanto de la nómina', 'bad', say('lumi', 'Un adelanto solo pasa el problema al mes siguiente… y a veces con comisiones.')),
        ]),
        note('Laura abre la app del banco y empieza a apuntar…'),
      ]),
      play({
        title: 'Fijo o variable',
        intro: 'Estos son los gastos de Laura del último mes. Sepáralos: los **fijos** son casi iguales cada mes; los **variables** cambian y dependen más de ella.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Fijo' }, { label: 'Variable' }],
          cards: [
            { icon: 'home', label: 'Alquiler', value: 450, bin: 0, why: 'Es igual cada mes: solo se recorta cambiando de piso o compartiendo.' },
            { icon: 'pizza', label: 'Comida a domicilio', value: 160, bin: 1, why: 'Cambia cada mes y depende de ella: variable.' },
            { icon: 'phone', label: 'Tarifa del móvil', value: 20, bin: 0, why: 'El mismo importe cada mes. Se recorta una vez, cambiando de tarifa.' },
            { icon: 'clothes', label: 'Ropa', value: 150, bin: 1, why: 'Variable: unos meses mucho, otros nada.' },
            { icon: 'train', label: 'Abono de transporte', value: 20, bin: 0, why: 'Fijo: lo paga igual cada mes.' },
            { icon: 'ticket', label: 'Salidas y ocio', value: 280, bin: 1, why: 'Variable, y suele ser donde más margen hay.' },
            { icon: 'cart', label: 'Supermercado', value: 270, bin: 1, why: 'Cambia cada mes según lo que compra: variable.' },
            { icon: 'movie', label: 'Dos plataformas de series', value: 22, bin: 0, why: 'Se cobran solas cada mes: fijas (y fáciles de olvidar).' },
          ],
        },
        goal: { text: 'Clasifica todos sus gastos.', when: [when('done', '==', 8)] },
        insight: 'Laura gasta **1.372 €**: 512 € fijos y 860 € variables. De sus 1.400 € le quedan 28 €. Ahí está el problema… y también el margen: los fijos se recortan una vez; los variables, cada día.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿lo paga igual cada mes? Entonces es fijo.', mood: 'THINKING' },
          { say: '¿Fijo o variable? Elige para cada gasto', mood: 'HAPPY' },
        ],
      }),
      key('Lo que te queda es lo que puedes invertir', 'Ingresos − gastos = lo que te queda cada mes. Esa cifra llena primero tu colchón y después tus **aportaciones periódicas**: aunque sean 50 € al mes, el interés compuesto empieza a trabajar.\n\nSi no te queda nada, el presupuesto te dice de dónde sacarlo: casi siempre, de los gastos variables.', 'Si no sabes en qué se va tu dinero, no puedes decidir a dónde va.', 'Pruébalo: compra en el simulador un ETF por lo que te sobra al mes.'),
    ], [
      match('Empareja cada concepto con un ejemplo.', [['Ingreso', 'La nómina'], ['Gasto fijo', 'El alquiler'], ['Gasto variable', 'Las cenas con amigos'], ['Ahorro', 'Lo que queda a final de mes']], 'Ingresos − gastos (fijos y variables) = ahorro. Es la cuenta básica de cualquier presupuesto.'),
      buckets('¿Gasto fijo o variable?', ['Fijo', 'Variable'], [['Cuota del gimnasio', 0], ['Tarifa del móvil', 0], ['Ropa', 1], ['Pedidos de comida a domicilio', 1], ['Abono de transporte', 0], ['Regalos', 1]], 'Los fijos se repiten casi iguales cada mes; los variables cambian según lo que decides cada día.'),
      single('¿Cuál es la mejor forma de empezar un presupuesto?', ['Revisar los movimientos del banco de los últimos meses', 'Calcular de memoria lo que crees que gastas', 'Esperar a cobrar más para empezar'], 0, 'La memoria engaña: casi todos creemos gastar menos de lo que gastamos. El extracto del banco es la foto real.'),
      num('Pablo cobra 1.300 € al mes. Sus gastos fijos suman 700 € y los variables 450 €. ¿Cuánto le queda?', 150, '€', '1.300 − 700 − 450 = 150 €. Esa es su capacidad de ahorro mensual.'),
      num('Marta ingresa 1.600 € al mes y ahorra 240 €. ¿Qué porcentaje de sus ingresos ahorra?', 15, '%', '240 ÷ 1.600 = 0,15 → 15 %.'),
      portfolio('Ana cobra 1.200 € al mes y sus gastos fijos ya son 660 € (el 55 %). Reparte el 100 % de su sueldo: cubre los fijos, guarda al menos un 10 % para ahorro y no pases del 35 % en variables.', [['Alquiler y facturas', 'Fijos'], ['Transporte y móvil', 'Fijos'], ['Súper', 'Variables'], ['Ocio y ropa', 'Variables'], ['Ahorro', 'Ahorro']], { minKind: { Fijos: 55, Ahorro: 10 }, maxKind: { Variables: 35 } }, 'Con un 55 % fijo y al menos un 10 % de ahorro, a los variables les queda como mucho un 35 %: el súper y el ocio se reparten ese hueco.'),
      tf('La tarifa mensual del móvil es un gasto variable.', false, 'Es fija: pagas lo mismo cada mes. Se recorta una vez, cambiando a una tarifa más barata.'),
      timed(single('Rápido: ¿qué es más fácil de recortar esta misma semana?', ['El alquiler', 'Las comidas a domicilio', 'El seguro del coche'], 1, 'Los variables dependen de tus decisiones diarias; los fijos necesitan tiempo o renegociar.'), 10),
      scenario('Bruno llega a fin de mes sin un euro y no sabe por qué. ¿Qué hace?', [['Apunta todos sus gastos durante un mes', 'Descubre que 180 € se le van en pedidos y compras pequeñas: ya sabe por dónde recortar.'], ['Pide un adelanto de nómina', 'Tapa el agujero un mes, pero el problema sigue y ahora además debe dinero.'], ['Se convence de que solo necesita ganar más', 'Quizá, pero sin saber en qué gasta, un sueldo mayor suele acabar igual a fin de mes.']], 0, 'Antes de recortar o de buscar más ingresos, hay que saber a dónde va el dinero.'),
      multi('¿Qué son ingresos? Marca todos.', ['La nómina', 'Lo que cobras por dar clases particulares', 'La devolución de Hacienda', 'Lo que pagas de alquiler'], [0, 1, 2], 'Ingreso es todo lo que entra; el alquiler que pagas es un gasto fijo.'),
      scenario('Laura descubre que se le van 160 € al mes en comida a domicilio y lo deja en la mitad. Aún no tiene colchón. ¿Qué hace con los 80 € que libera?', [['Los aparta cada mes: primero para el colchón y luego para invertir', 'Con el colchón hecho, esos 80 € pasan a ser su aportación mensual a un ETF.'], ['Los gasta en ropa: total, ya ha recortado', 'El recorte desaparece y a final de mes vuelve a estar a cero.'], ['Los deja en la cuenta corriente, sin plan', 'Lo que no tiene destino se acaba gastando sin darte cuenta.']], 0, 'Un recorte solo sirve si ese dinero tiene destino: primero el colchón, después invertir. Dejarlo en la cuenta parece igual de bueno, pero sin plan se acaba gastando.'),
      chat(['Quiero empezar a invertir, pero no sé cuánto puedo.', '¿Por dónde empiezo?'], '¿Qué le contestas a Lumi?', [['Mira tus movimientos del último mes y calcula lo que te sobra', '¡Eso! Sabrás cuánto puedes aportar cada mes sin pasarte.'], ['Invierte todo lo que tengas en la cuenta', 'Sin colchón, el primer imprevisto te obliga a vender, quizá con pérdidas.'], ['Espera a ganar más para empezar', 'Con más sueldo suele subir el gasto: empezar pronto y con poco cuenta más.']], 0, 'Lo que puedes invertir sale de tu presupuesto real, no de una cifra a ojo. Invertirlo todo tienta, pero sin colchón cualquier susto te obliga a vender.'),
    ], { minutes: 6, retire: [1, 3, 4, 6, 7, 8] }),

    lesson('u2l2', 'La regla 50/30/20', [
      play({
        title: 'Reparte el sueldo de Laura',
        intro: 'Laura cobra **1.400 €** netos y quiere empezar a invertir. La regla **50/30/20** dice: el 50 % para necesidades, el 30 % para deseos y el 20 % para ahorrar. Así están ahora sus gastos:',
        widget: {
          kind: 'budget', salary: 1400, groups: ['Necesidades', 'Deseos', 'Ahorro'], targets: [50, 30, 20],
          cats: [
            { icon: 'home', label: 'Alquiler', group: 0, amount: 450, min: 350, max: 700 },
            { icon: 'cart', label: 'Supermercado', group: 0, amount: 270, min: 180, max: 350 },
            { icon: 'train', label: 'Transporte', group: 0, amount: 20, min: 20, max: 120 },
            { icon: 'power', label: 'Luz, agua e internet', group: 0, amount: 60, min: 40, max: 100 },
            { icon: 'ticket', label: 'Salidas y ocio', group: 1, amount: 280, min: 0, max: 400 },
            { icon: 'pizza', label: 'Comida a domicilio', group: 1, amount: 160, min: 0, max: 250 },
            { icon: 'clothes', label: 'Ropa', group: 1, amount: 150, min: 0, max: 250 },
          ],
        },
        predict: {
          prompt: 'Con estos gastos, ¿cuánto puede ahorrar Laura cada mes?',
          options: ['Unos 10 €', 'Unos 150 €', 'Unos 280 €, el 20 %'],
          answer: 0,
          why: 'Necesidades, 800 €; deseos, 590 €: le quedan **10 €**. No es que gane poco: es que todo se va en el día a día.',
        },
        goal: { text: 'Ajusta los gastos para que Laura ahorre al menos el 20 %.', when: [when('savePct', '>=', 20)] },
        insight: 'Con el ahorro **reservado**, el resto se reparte solo. Ese 20 % es el que llena tu colchón y, después, tus aportaciones para invertir.',
        lumi: [
          { when: when('left', '<', 0), say: '¡Cuidado! Así gasta más de lo que cobra.', mood: 'WORRIED' },
          { when: when('savePct', '>=', 15), say: '¡Casi! Un empujoncito más y llega al 20 %.', mood: 'HAPPY' },
          { when: when('wantsPct', '<=', 30), say: 'Los deseos ya están en su sitio. ¿Se puede ahorrar algo en el súper o en el alquiler?', mood: 'THINKING' },
          { say: 'Empieza por lo que más margen tiene: los deseos', mood: 'HAPPY' },
        ],
      }),
      key('Cuando no cuadra', 'La regla la popularizó la senadora estadounidense Elizabeth Warren. En ciudades caras, solo el alquiler puede llevarse el 40 % del sueldo. Entonces ajustas, pero **siempre con un porcentaje de ahorro reservado**, aunque empiece en un 5 %.', 'Lo importante no son los números exactos: es que el ahorro tenga su parte fija.', 'Pruébalo: pregúntale a la profesora Lumi cómo repartirías tu sueldo con la 50/30/20.'),
    ], [
      num('Tu sueldo neto es de 1.600 €. Según la regla 50/30/20, ¿cuánto va al ahorro?', 320, '€', '20 % de 1.600 = 320 €.'),
      num('Con un sueldo neto de 2.000 €, ¿cuánto tocaría a deseos?', 600, '€', '30 % de 2.000 = 600 €.'),
      buckets('Clasifica cada gasto según la regla 50/30/20.', ['Necesidades (50 %)', 'Deseos (30 %)', 'Ahorro (20 %)'], [['Alquiler', 0], ['Factura de la luz', 0], ['Entrada de un concierto', 1], ['Viaje en verano', 1], ['Aportación al fondo de emergencia', 2], ['Pagar de más una deuda', 2], ['Compra básica del súper', 0]], 'Necesidad es lo que no puedes dejar de pagar; deseo, lo que eliges; y el ahorro incluye pagar deudas antes de tiempo.'),
      portfolio('Reparte un sueldo de 1.500 € con la regla 50/30/20: como mucho un 50 % en necesidades y un 30 % en deseos, y al menos un 20 % de ahorro.', [['Alquiler y facturas', 'Necesidades'], ['Súper y transporte', 'Necesidades'], ['Ocio y salidas', 'Deseos'], ['Ropa y caprichos', 'Deseos'], ['Fondo de emergencia', 'Ahorro'], ['Inversión a largo plazo', 'Ahorro']], { maxKind: { Necesidades: 50, Deseos: 30 }, minKind: { Ahorro: 20 } }, 'Con 1.500 €: hasta 750 € en necesidades, hasta 450 € en deseos y al menos 300 € de ahorro.'),
      tf('La regla 50/30/20 se aplica sobre el sueldo bruto, antes de impuestos.', false, 'Se aplica sobre el neto: lo que de verdad llega a tu cuenta.'),
      tf('Si el alquiler ya se lleva el 45 % del sueldo, lo mejor es dejar de ahorrar hasta que cambie.', false, 'Mejor ajustar los porcentajes (por ejemplo, recortando deseos) y mantener algo de ahorro, aunque sea poco.'),
      fill('En la regla 50/30/20, el ____ % va al ahorro y a pagar deudas.', '20', ['30', '50', '10'], '50 % necesidades, 30 % deseos y 20 % ahorro.'),
      timed(single('Rápido: sueldo neto de 1.000 €. ¿Cuánto va a deseos?', ['200 €', '300 €', '500 €'], 1, '30 % de 1.000 = 300 €.'), 12),
      scenario('Laura cobra 1.800 € netos y sus necesidades ya suman 1.000 € (un 56 %). ¿Qué hace?', [['Recorta un poco los deseos y mantiene el ahorro en 360 €', 'Le quedan 440 € para deseos (un 24 %): ajusta la regla a su alquiler sin renunciar al ahorro.'], ['Deja de ahorrar hasta que le suban el sueldo', 'Puede pasar mucho tiempo, y sin colchón cualquier imprevisto acaba en deuda.'], ['Paga los deseos con la tarjeta a plazos', 'Así el 30 % se convierte en deuda con intereses: el agujero crece cada mes.']], 0, 'La regla se adapta: si las necesidades pesan más, se recortan los deseos, no el ahorro.'),
      chat(['Cobro 1.200 € y con la 50/30/20 me tocan 240 € de ahorro.', 'Pero este mes solo puedo apartar 60 €… ¿no vale la pena?'], '¿Qué le contestas a Lumi?', [['Si no llegas al 20 %, mejor no ahorrar nada', 'Así nunca empiezas: el hábito se crea con poco.'], ['Empieza con 60 € y ve subiendo cuando puedas', '¡Eso! 60 € al mes son 720 € al año. El hábito importa más que la cifra perfecta.'], ['Pide un préstamo para llegar a los 240 €', 'Ahorrar con dinero prestado es pagar intereses por nada.']], 1, 'La regla es una meta orientativa: empezar con poco y subir es mejor que no empezar.'),
      scenario('Ya tienes tu colchón completo y ninguna deuda cara. ¿Qué haces con el 20 % de cada mes?', [['Una aportación automática a un ETF indexado mundial', 'Tu ahorro empieza a trabajar cada mes sin que tengas que decidir nada.'], ['Seguir engordando el colchón sin límite', 'Seguro, pero lo que no necesitas en años pierde poder de compra.'], ['Comprar cada mes la acción que más subió la semana anterior', 'Eso es perseguir modas: compras caro lo que ya ha subido.']], 0, 'Con el colchón hecho, el 20 % pasa a ser tu aportación para invertir a largo plazo. Comprar lo que más ha subido tienta, pero es dejarse llevar por el FOMO.'),
      multi('¿Qué va en el 20 % de ahorro de la regla? Marca todas.', ['Llenar tu fondo de emergencia', 'Pagar antes una deuda cara', 'Tu aportación mensual a un ETF', 'La cena de los viernes'], [0, 1, 2], 'El 20 % es para tu yo del futuro: colchón, quitarte deudas caras e invertir. La cena es un deseo y va en el 30 %, por mucho que parezca imprescindible.'),
    ], { minutes: 6, retire: [0, 1, 2, 4, 7, 9] }),

    lesson('u2l3', 'Gastos hormiga y suscripciones', [
      play({
        title: 'Caza tus gastos hormiga',
        intro: 'Un **gasto hormiga** es pequeño y frecuente. Uno solo no se nota… ¿y todos juntos? Apaga los que podrías quitarte sin echarlos de menos.',
        widget: {
          kind: 'leaks', rate: 7, years: 10,
          items: [
            { icon: 'coffee', name: 'Café para llevar', amount: 1.8, per: 'day', on: true },
            { icon: 'soda', name: 'Refresco de la máquina', amount: 1.5, per: 'day', on: true },
            { icon: 'bike', name: 'Gastos de envío', amount: 4, per: 'week', on: true },
            { icon: 'movie', name: 'Tercera plataforma de series', amount: 12, per: 'month', on: true },
            { icon: 'gym', name: 'Gimnasio al que no vas', amount: 35, per: 'month', on: true },
            { icon: 'game', name: 'Recargas del juego', amount: 10, per: 'week', on: true },
          ],
        },
        predict: {
          prompt: 'Un café para llevar de 1,80 € cada día. ¿Cuánto es en un año?',
          options: ['Unos 65 €', 'Unos 650 €', 'Unos 1.800 €'],
          answer: 1,
          why: '1,80 € × 365 días = **657 €** al año. Lo pequeño, repetido, se hace grande.',
        },
        goal: { text: 'Recorta al menos 1.000 € al año sin quitarlo todo.', when: [when('cut', '>=', 1000), when('on', '>=', 2)] },
        insight: 'No se trata de no gastar nunca, sino de gastar en lo que **de verdad** te importa. Lo que recortas, invertido durante años, crece con el interés compuesto (7 % es un ejemplo, no una promesa).',
        lumi: [
          { when: when('on', '==', 0), say: '¡Todo fuera! No hace falta ser tan duro: quédate con lo que de verdad disfrutas.', mood: 'THINKING' },
          { when: when('cut', '>', 0), say: 'Cada interruptor que apagas es dinero para ti Mira la cifra de abajo.', mood: 'HAPPY' },
          { say: 'Apaga lo que podrías quitarte sin echarlo de menos', mood: 'HAPPY' },
        ],
      }),
      key('Las suscripciones', 'Streaming, música, gimnasio, apps, nube… Se cobran solas y por eso se olvidan. Cuatro suscripciones de 12 € son 48 € al mes: **576 € al año**.\n\nRevisa el extracto y pregúntate de cada una: ¿la he usado este mes? Muchas pruebas gratis pasan a ser de pago si no las cancelas.', 'Lo pequeño y repetido se hace grande: revisa tus cargos una vez al mes.', 'Pruébalo: compra en el simulador un ETF con lo que recortes este mes.'),
    ], [
      num('Tomas un café de 1,50 € cada día laborable (20 al mes). ¿Cuánto gastas en un año?', 360, '€', '1,50 × 20 × 12 = 360 €.'),
      timed(num('Rápido: 2 € al día durante todo un año (365 días). ¿Cuánto es?', 730, '€', '2 × 365 = 730 €.'), 20),
      tf('Un gasto de 2 € no merece la pena vigilarlo.', false, 'Si se repite cada día, son 730 € al año. Lo que pesa es la frecuencia.'),
      multi('¿Cuáles son gastos hormiga típicos? Marca todos.', ['El café para llevar de cada mañana', 'Los gastos de envío de pedidos pequeños', 'El alquiler', 'Las microcompras dentro de un juego'], [0, 1, 3], 'El alquiler es un gasto fijo grande; los hormiga son pequeños, frecuentes y casi invisibles.'),
      num('Pagas tres plataformas de 11 € al mes y un gimnasio de 30 € al que no vas. ¿Cuánto suman en un año?', 756, '€', '(3 × 11 + 30) × 12 = 63 × 12 = 756 €.'),
      scenario('Marta revisa su extracto y encuentra cinco suscripciones: dos las usa cada semana y tres no las abre desde hace meses. ¿Qué hace?', [['Cancela las que no usa y se queda las otras', 'Recupera ese dinero cada mes sin renunciar a lo que sí disfruta.'], ['No toca nada: son poco dinero', 'Poco al mes, pero sumado al año puede ser una escapada de fin de semana.'], ['Cancela todas, también las que usa a diario', 'Recortar lo que te gusta suele acabar en recaída: mejor recortar lo que no usas.']], 0, 'El objetivo es gastar en lo que valoras, no castigarte.'),
      order('Ordena los pasos para limpiar tus suscripciones.', ['Revisar el extracto de los últimos 3 meses', 'Hacer una lista de todos los cobros periódicos', 'Marcar las que no usaste el último mes', 'Darlas de baja', 'Mover ese dinero al ahorro'], 'Primero ver, luego decidir y, al final, que lo recuperado vaya al ahorro antes de que se gaste en otra cosa.'),
      timed(tf('Muchas pruebas gratuitas pasan a ser de pago automáticamente si no las cancelas.', true, 'Por eso conviene apuntar la fecha en la que termina la prueba.'), 10),
      fill('Cuatro suscripciones de 12 € al mes suman ____ € al año.', '576', ['48', '144', '480'], '12 × 4 = 48 € al mes; 48 × 12 = 576 € al año.'),
      chat(['Me he dado cuenta de que gasto 4 € al día en la máquina de la uni 🍫', 'Bah, son 4 €…'], '¿Qué le contestas a Lumi?', [['Sí, eso no es nada', 'Son 1.460 € al año: bastante más que «nada».'], ['Calcula cuánto es al año y decide si lo vale', 'Eso: 4 € al día son 1.460 € al año. Si lo vale para ti, adelante; si no, ya sabes de dónde sacar ahorro.'], ['Deja de comer en la uni para siempre', 'Tampoco hace falta pasar hambre: se trata de decidir, no de castigarse.']], 1, 'Pasar el gasto diario a cifra anual ayuda a decidir con la cabeza.'),
      scenario('Recortas 60 € al mes en suscripciones que no usabas. Ya tienes colchón. ¿Qué haces para que ese dinero no se esfume?', [['Programo ese mismo día una aportación de 60 € a un ETF', 'El dinero cambia de destino antes de que lo eches de menos, y empieza a crecer.'], ['Lo dejo en la cuenta corriente, ya veré', 'Sin destino, se acaba yendo en otros gastos pequeños.'], ['Me doy un capricho de 60 € para celebrarlo', 'Una vez está bien, pero si se repite, el recorte no ha servido de nada.']], 0, 'Un recorte solo cuenta si ese dinero tiene un destino automático. Dejarlo en la cuenta parece suficiente, pero lo que no se aparta se gasta.'),
      chat(['Me gasto 3 € al día en la máquina de la uni.', 'Si lo invirtiera, ¿cambiaría algo?'], '¿Qué le contestas a Lumi?', [['Nada: 3 € no son dinero', 'Son más de 1.000 € al año; invertidos durante años, bastante más.'], ['Sí: lo pequeño y repetido, invertido años, se nota mucho', '¡Eso! Y no hace falta quitarlo todo: con la mitad ya se nota.'], ['Solo si lo inviertes en cripto, que sube más', 'Lo que importa es la constancia y el tiempo, no perseguir lo que más sube.']], 1, 'Un gasto pequeño repetido cada día suma mucho al año, y si se invierte, el interés compuesto lo agranda. Pensar «son solo 3 €» tienta, pero lo que pesa es la frecuencia.'),
    ], { minutes: 6, retire: [0, 1, 2, 4, 8, 9] }),

    lesson('u2l4', 'El fondo de emergencia', [
      mission({
        title: 'Un año con imprevistos',
        intro: 'Laura cobra 1.400 € y gasta 1.200 € al mes. Este año le van a pasar cosas, como a todo el mundo. Decide cuánto aparta cada mes y vive el año.',
        widget: {
          kind: 'emergency', salary: 1400, spend: 1200, start: 0, maxSave: 200, loanRate: 22,
          events: [
            { month: 3, icon: 'phone', text: 'Se le rompe el móvil', cost: 250 },
            { month: 7, icon: 'doctor', text: 'Visita urgente al dentista', cost: 400 },
            { month: 10, icon: 'car', text: 'Avería del coche', cost: 600 },
          ],
        },
        predict: {
          prompt: 'Si Laura no aparta nada, ¿qué pasa cuando llegan los imprevistos?',
          options: ['Nada: ya se apañará', 'Los paga con la tarjeta y acaba debiendo dinero con intereses', 'El banco se los paga gratis'],
          answer: 1,
          why: 'Sin colchón, cada imprevisto se convierte en **deuda**, y la deuda de tarjeta cobra intereses altos.',
        },
        goal: { text: 'Vive el año sin acabar debiendo nada a la tarjeta.', when: [when('played', '==', 1), when('debt', '==', 0)] },
        insight: 'Ese colchón es tu **fondo de emergencia**: dinero apartado solo para imprevistos. La regla habitual: entre **3 y 6 meses de gastos** (de 6 a 12 si tu trabajo es inestable).',
        lumi: [
          { when: when('debt', '>', 0), say: '¡Ay! El imprevisto ha ido a la tarjeta… y ahora cobra intereses. Prueba a apartar más.', mood: 'WORRIED' },
          { when: when('save', '>', 0), say: 'Ahora dale a «Vivir el año» y mira qué pasa.', mood: 'HAPPY' },
          { say: 'Elige cuánto aparta Laura cada mes y dale a «Vivir el año»', mood: 'HAPPY' },
        ],
      }),
      story('Marzo de 2020', [{ id: 'leo', name: 'Leo' }], [
        note('Marzo de 2020. Leo tiene 4.000 € en un ETF del S&P 500 y ningún colchón.'),
        say('leo', 'La bolsa se hunde por el virus y a mí me han metido en un ERTE.'),
        say('leo', 'Necesito 1.000 € este mes y solo los tengo en el ETF…'),
        choose('¿Qué le habría salvado?', [
          opt('Tener un colchón aparte para imprevistos', 'good', say('lumi', 'Eso: paga con el colchón y el ETF puede esperar a recuperarse.')),
          opt('Haber vendido todo justo antes de la caída', 'bad', say('lumi', 'Nadie sabe cuándo llega una caída. El colchón funciona sin adivinar nada.')),
          opt('Pedir un minicrédito para no tocar el ETF', 'ok', say('lumi', 'No vende con pérdidas, pero paga intereses altísimos. El colchón sale gratis.')),
        ]),
        say('lumi', 'Sin colchón, te toca **vender en el peor momento**. Con colchón, decides tú.'),
      ]),
      key('Dónde guardarlo', 'Tiene que estar **disponible y sin riesgo**: cuenta remunerada, depósito que puedas cancelar sin perder lo que pusiste o Letras del Tesoro para una parte.\n\nLos depósitos están cubiertos por el **Fondo de Garantía de Depósitos hasta 100.000 €** por titular y entidad. **En bolsa, no:** las crisis traen a la vez despidos y caídas.', 'Un colchón a medias ya te salva de muchos sustos: empieza por un mes de gastos.', 'Pruébalo: pon una alerta de precio un 20 % por debajo de tu ETF.'),
    ], [
      num('Gastas 1.100 € al mes. ¿Cuánto debería tener un colchón de 6 meses?', 6600, '€', '1.100 × 6 = 6.600 €.'),
      single('¿Sobre qué se calcula el fondo de emergencia?', ['Tus gastos mensuales', 'Tu sueldo bruto', 'Lo que tienen ahorrado tus amigos'], 0, 'Lo que necesitas cubrir en una emergencia son tus gastos, no tu sueldo.'),
      buckets('¿Sirve para guardar el fondo de emergencia?', ['Sí', 'No'], [['Cuenta remunerada', 0], ['Acciones de una empresa', 1], ['Letras del Tesoro a 3 meses', 0], ['Criptomonedas', 1], ['Depósito que se puede cancelar sin perder capital', 0], ['Un fondo de bolsa mundial', 1]], 'El colchón tiene que estar disponible y sin riesgo de caída justo cuando lo necesitas.'),
      scenario('Pablo tiene 3.000 € de colchón y se le estropea el coche que usa para trabajar: 800 € de arreglo. ¿Qué hace?', [['Lo paga con el colchón y lo repone poco a poco', 'Para eso está: sin deudas ni intereses, y en unos meses vuelve a tenerlo completo.'], ['Lo paga con la tarjeta a plazos para no tocar el colchón', 'Paga intereses teniendo el dinero parado al lado: el colchón existe para esto.'], ['Vende sus inversiones aunque estén en pérdidas', 'Tenía dinero disponible y aun así convierte una caída temporal en pérdida real.']], 0, 'Un imprevisto pagado con el colchón no cuesta intereses ni obliga a vender en mal momento.'),
      tf('Si eres autónomo, conviene un colchón mayor que con un contrato indefinido.', true, 'Tus ingresos son más irregulares: se suele recomendar de 6 a 12 meses de gastos.'),
      num('Quieres un colchón de 4.800 € y apartas 200 € al mes. ¿Cuántos meses tardas?', 24, 'meses', '4.800 ÷ 200 = 24 meses.'),
      timed(single('Rápido: ¿qué cubre el Fondo de Garantía de Depósitos?', ['Hasta 100.000 € por titular y entidad', 'Toda tu cartera de acciones', 'Hasta 10.000 € por persona'], 0, 'Cubre los depósitos hasta 100.000 € por titular y entidad si el banco quiebra; no cubre las caídas de la bolsa.'), 15),
      multi('¿Cuáles son emergencias de verdad? Marca todas.', ['Quedarte sin trabajo', 'Una avería del coche que usas para trabajar', 'Las rebajas de enero', 'Una factura inesperada del dentista'], [0, 1, 3], 'Las rebajas se pueden planificar: no son una emergencia.'),
      scenario('Bruno tiene 10.000 €, ninguna deuda y gasta 1.000 € al mes. ¿Cómo lo organiza?', [['Todo en bolsa, que rinde más', 'Si llega un imprevisto en plena caída, tendrá que vender con pérdidas.'], ['6.000 € de colchón en una cuenta remunerada y 4.000 € para invertir a largo plazo', 'Tiene 6 meses cubiertos y el resto puede aguantar caídas sin agobios.'], ['Todo en la cuenta corriente al 0 %', 'Seguro, pero los 4.000 € que no necesitará en años pierden poder de compra.']], 1, 'Primero el colchón, luego invertir lo que no necesitarás en años.'),
      fill('Lo habitual es un colchón de entre 3 y ____ meses de gastos.', '6', ['1', '2', '24'], 'De 3 a 6 meses de gastos; más si tus ingresos son inestables.'),
      scenario('Tu cartera de ETF cae un 25 % y, la misma semana, te llega una avería de 900 €. Tienes un colchón de 3 meses. ¿Qué haces?', [['Pago la avería con el colchón y no toco la cartera', 'La caída sigue siendo temporal mientras no vendas, y el colchón ha hecho su trabajo.'], ['Vendo parte del ETF para pagarla', 'Conviertes una caída temporal en pérdida real teniendo el dinero al lado.'], ['La pago con la tarjeta a plazos', 'Pagas intereses teniendo un colchón pensado justo para esto.']], 0, 'El colchón existe para que nunca tengas que vender tus inversiones en plena caída. Vender un poco parece prudente, pero fija la pérdida justo en el peor momento.'),
    ], { source: '1.4', minutes: 6, retire: [0, 4, 5, 6] }),

    lesson('u2l5', 'Págate primero a ti', [
      story('El experimento de Pablo', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Este mes voy a ahorrar **lo que sobre** a final de mes. ¡Seguro que algo queda!'),
        note('Día 30…'),
        say('pablo', 'Pues… han sobrado 12 €. No sé cómo, pero siempre se va todo'),
        choose('¿Qué le propones para el mes que viene?', [
          opt('Que lo intente otra vez con más fuerza de voluntad', 'bad', say('lumi', 'La fuerza de voluntad se agota. El gasto se estira hasta llenar el sueldo: casi nunca «sobra».')),
          opt('Que programe una transferencia de 150 € el día que cobra', 'good', say('lumi', '¡Eso es **pagarte primero a ti**! El ahorro sale solo el día de cobro y gastas lo que queda.')),
          opt('Que guarde las monedas sueltas en una hucha', 'ok', say('lumi', 'Algo es algo, pero con monedas no llega lejos. Mejor un porcentaje fijo y automático.')),
        ]),
        note('Un mes después…'),
        say('pablo', '¡He apartado 150 € y ni lo he notado! He gastado un poco menos sin darme cuenta.'),
      ]),
      play({
        title: 'Lo que hace un hábito',
        intro: '¿Y si Pablo mantiene esa transferencia automática durante años y la invierte? Pongamos un 5 % al año: es un ejemplo, no una promesa.',
        widget: { kind: 'growth', initial: 0, monthly: 150, rate: 5, years: 10, maxInitial: 5000, maxMonthly: 500, maxRate: 8, maxYears: 40, lines: ['mattress', 'compound'], controls: ['monthly', 'years'] },
        goal: { text: 'Llega a 100.000 € apartando como mucho 200 € al mes.', when: [when('final', '>=', 100000), when('monthly', '<=', 200)] },
        insight: 'El ahorro automático no depende de tu fuerza de voluntad. Empieza con un 5-10 % del sueldo y súbelo con cada aumento: el tiempo hace el resto.',
        lumi: [
          { when: when('monthly', '>', 200), say: 'Así es fácil… ¡pero el reto es con 200 € al mes como mucho!', mood: 'THINKING' },
          { when: when('years', '>=', 20), say: 'Fíjate en cuánto pone el tiempo frente a lo que pones tú.', mood: 'HAPPY' },
          { say: 'Mueve los años y lo que aparta al mes', mood: 'HAPPY' },
        ],
      }),
      key('Automatízalo', '1. Abre una cuenta separada para el ahorro.\n2. Programa una **transferencia periódica** para el día después de cobrar.\n3. Con el colchón hecho, convierte esa transferencia en una **aportación periódica** a tu ETF.\n4. Empieza con un porcentaje que no duela (5-10 %) y súbelo con cada aumento de sueldo.', 'Primero ahorras; luego gastas lo que queda.', 'Pruébalo: elige en Mercado el ETF al que irá tu transferencia y añádelo a Favoritos.'),
    ], [
      order('Ordena el mes de quien se paga primero a sí mismo.', ['Cobra la nómina', 'Se ejecuta la transferencia automática al ahorro', 'Paga los gastos fijos', 'Gasta en variables lo que queda'], 'El ahorro sale antes que cualquier gasto: así no compite con los caprichos.'),
      tf('Ahorrar lo que sobra a final de mes es igual de eficaz que ahorrar al principio.', false, 'El gasto tiende a ocupar todo el dinero disponible; si el ahorro sale primero, no se lo come.'),
      num('Apartas el 10 % de una nómina de 1.400 € cada mes. ¿Cuánto ahorras en un año (12 nóminas)?', 1680, '€', '140 € × 12 = 1.680 €.'),
      match('Empareja cada truco con por qué funciona.', [['Cuenta separada', 'No gastas el ahorro sin darte cuenta'], ['Transferencia periódica', 'No depende de tu fuerza de voluntad'], ['Subir el % con cada aumento', 'El ahorro crece sin notar el recorte'], ['Hacerlo el día después de cobrar', 'Te pagas antes que a nadie']], 'Separar, automatizar y subir poco a poco: el sistema trabaja por ti.'),
      scenario('A Pablo le suben el sueldo 200 € al mes. ¿Qué hace?', [['Sube su transferencia automática 100 € y disfruta del resto', 'Mejora su vida y su ahorro a la vez, sin notar ningún recorte.'], ['Lo gasta todo: ya ahorrará cuando gane más', 'El gasto sube al nivel del sueldo y el ahorro se queda igual que antes.'], ['Se compra un coche con una cuota de 200 € al mes', 'El aumento entero se va en una cuota durante años.']], 0, 'Destinar parte de cada subida al ahorro es la forma más indolora de ahorrar más.'),
      timed(tf('Pagarte primero a ti significa darte un capricho nada más cobrar.', false, 'Significa apartar tu ahorro antes de gastar en nada.'), 10),
      chat(['Cada mes digo que voy a ahorrar…', 'Pero el día 20 ya no queda nada 😅'], '¿Qué le aconsejas a Lumi?', [['Gasta menos y ya', 'Fácil de decir… pero si depende de la fuerza de voluntad, el día 20 vuelve a pasar.'], ['Programa una transferencia al ahorro para el día que cobras', '¡Bien! Si sale antes de que lo veas, no te lo gastas. Empieza con poco y súbelo.'], ['Ahorra solo los meses buenos', 'Los meses «buenos» suelen ser pocos: así el hábito no se forma nunca.']], 1, 'Automatizar convierte el ahorro en algo que pasa solo.'),
      fill('Lo que funciona es ahorrar ____ de gastar, no lo que sobra.', 'antes', ['después', 'encima', 'lejos'], 'Págate primero a ti: el ahorro sale al cobrar.'),
      single('Marta cobra 2.000 € y quiere ahorrar 300 € al mes. ¿Cuándo programa la transferencia?', ['El día después de cobrar', 'El día 30, si sobra algo', 'Cuando se acuerde'], 0, 'Justo después de cobrar, antes de que el dinero se mezcle con los gastos.'),
      num('Ana empieza ahorrando el 5 % de 1.200 € al mes y a los 6 meses lo sube al 10 %. ¿Cuánto aparta en el primer año?', 1080, '€', '60 € × 6 + 120 € × 6 = 360 + 720 = 1.080 €.'),
      scenario('Pablo ya tiene su colchón completo, y su transferencia de 150 € sigue saliendo cada mes. ¿Qué hace con ella ahora?', [['La dirige a una aportación periódica a un ETF indexado', 'El hábito ya está hecho: ahora, además, su dinero trabaja para él.'], ['La para y se gasta esos 150 €', 'Pierde el hábito que más le había costado crear.'], ['Sigue engordando el colchón para siempre', 'Un colchón enorme no rinde: lo que no necesita en años pierde poder de compra.']], 0, 'Pagarte primero a ti sirve para llenar el colchón y, después, para invertir sin pensarlo. Seguir engordando el colchón parece prudente, pero ese dinero quieto pierde frente a la inflación.'),
    ], { minutes: 6, retire: [1, 2, 5, 6, 9] }),
  ],
})
