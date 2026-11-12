import 'server-only'
// Sección 2 · Unidad 5 · La bolsa por dentro (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, multi, note, num, opt, order, play, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u5', order: 5, title: 'La bolsa por dentro', description: 'Qué es una bolsa, quién opera, cómo se forma el precio y cómo funciona la española',
  lessons: [
    lesson('u5l1', 'Qué es una bolsa', [
      story('¿A quién le compras?', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Quiero comprar acciones de Inditex. Se las compro a Inditex, ¿no?'),
        choose('¿A quién le compra Laura sus acciones?', [
          opt('A Inditex, que es la dueña', 'bad', say('lumi', 'En el día a día, no. Inditex solo recibe dinero cuando emite acciones nuevas.')),
          opt('A otro inversor que quiere vender', 'good', say('lumi', '¡Eso! La bolsa junta a quien compra con quien vende.')),
          opt('A la bolsa, que tiene acciones guardadas', 'ok', say('lumi', 'La bolsa no tiene acciones: solo cruza órdenes de compra y venta.')),
        ]),
        say('laura', '¿Y cómo llego yo hasta la bolsa?'),
        say('lumi', 'Con un **bróker** autorizado: él lleva tu orden al mercado.'),
        say('lumi', 'Cada vez que compras, alguien vende. ¿Qué sabrá él que tú no?'),
      ]),
      play({
        title: '¿Para qué sirve una bolsa?',
        intro: 'Una **bolsa** es un mercado regulado donde se compran y venden acciones, bonos y ETFs. ¿Qué hace y qué no?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Lo hace la bolsa' }, { label: 'Eso no lo hace' }],
          cards: [
            { icon: 'company', label: 'Que una empresa consiga dinero para crecer', bin: 0, why: 'Vendiendo acciones o bonos a inversores, sin pedir un préstamo.' },
            { icon: 'exchange', label: 'Que puedas vender tus acciones cuando quieras', bin: 0, why: 'Es la **liquidez**: la bolsa reúne a compradores y vendedores cada día.' },
            { icon: 'up', label: 'Garantizar que las acciones suban', bin: 1, why: 'La bolsa no promete nada sobre el precio: solo hace posible comprar y vender.' },
            { icon: 'chart', label: 'Dar un precio público de cada valor', bin: 0, why: 'Todos ven el mismo precio, en cada momento.' },
            { icon: 'shield', label: 'Asegurar un precio mínimo a las acciones', bin: 1, why: 'El precio puede caer tanto como caigan las ganas de comprar.' },
            { icon: 'scale', label: 'Aplicar las mismas reglas a todos', bin: 0, why: 'Es un mercado organizado: reglas iguales y precios públicos para todos.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'Una bolsa **junta a quien compra con quien vende**, con reglas iguales y precios públicos. Sirve a las empresas y a los inversores, pero no garantiza nada sobre el precio.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: la bolsa organiza el mercado, pero no promete ganancias.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: '¡Vas muy bien! Ya casi lo tienes.', mood: 'HAPPY' },
          { say: 'Toca cada tarjeta: ¿lo hace la bolsa o no?', mood: 'HAPPY' },
        ],
      }),
      key('Quién es quién', 'En España la bolsa la gestiona **BME** (Bolsas y Mercados Españoles), del grupo suizo SIX, y la supervisa la **CNMV**.\n\nTú no vas a la bolsa: compras a través de un **bróker** autorizado, que lleva tu orden al mercado.', 'La bolsa es el punto de encuentro; el bróker, la puerta de entrada.', 'Pruébalo: en Mercado, busca Inditex: ese precio lo ve igual todo el mundo.'),
    ], [
      single('¿Qué es una bolsa?', ['Un mercado regulado donde se cruzan órdenes de compra y venta de valores', 'Un banco que guarda tus ahorros', 'Una empresa que te vende sus propias acciones cada día'], 0, 'La bolsa cruza órdenes: junta compradores y vendedores con reglas y precios públicos.'),
      multi('¿Para qué sirve la bolsa? Marca todas.', ['Que las empresas consigan financiación', 'Que los inversores puedan vender cuando quieran', 'Garantizar que las acciones suban', 'Dar un precio público de cada valor'], [0, 1, 3], 'La bolsa no garantiza nada sobre el precio: solo hace posible comprar y vender.'),
      tf('Cuando compras una acción en bolsa, normalmente se la compras a otro inversor, no a la empresa.', true, 'La empresa solo recibe dinero cuando emite acciones nuevas (salida a bolsa o ampliación).'),
      match('Empareja cada nombre con su papel.', [['BME', 'Gestiona la bolsa española'], ['CNMV', 'Supervisa los mercados de valores en España'], ['Bróker', 'Lleva tu orden al mercado'], ['Empresa cotizada', 'Sus acciones se compran y venden en bolsa']], 'Mercado, supervisor, intermediario y empresa: cuatro papeles distintos.'),
      fill('Poder vender tus acciones cuando quieras se llama ____.', 'liquidez', ['solvencia', 'rentabilidad', 'inflación'], 'La liquidez es una de las grandes ventajas de la bolsa frente a, por ejemplo, un piso.'),
      timed(tf('La bolsa garantiza un precio mínimo a las acciones.', false, 'El precio puede caer tanto como caigan las ganas de comprar. Nadie lo garantiza.'), 10),
      scenario('Laura quiere comprar acciones de una empresa española y un desconocido le escribe por Instagram: «Te las compro yo directamente en la bolsa, hazme un Bizum». ¿Qué hace?', [['Usa un bróker autorizado por la CNMV', 'Las acciones quedan a su nombre, con un intermediario supervisado.'], ['Le hace el Bizum', 'Lo más probable es que ese dinero no vuelva: nadie compra en bolsa por Bizum.'], ['Va a la sede de la Bolsa de Madrid a comprarlas', 'La Bolsa no atiende a particulares: se opera siempre a través de un intermediario.']], 0, 'A la bolsa se accede con un intermediario autorizado, nunca por mensajes de desconocidos.'),
      chat(['Si compro una acción de Inditex, ¿le doy el dinero a Inditex? 🤔'], '¿Qué le contestas a Lumi?', [['Sí, siempre', 'Solo en una salida a bolsa o una ampliación. En el día a día, el dinero va a otro inversor.'], ['Normalmente no: se lo pagas a otro inversor que vende', '¡Eso! La empresa solo recibe dinero cuando emite acciones nuevas.'], ['Se lo das a la CNMV', 'La CNMV supervisa; no recibe tu dinero.']], 1, 'En el mercado del día a día, los inversores se compran y venden acciones entre ellos.'),
      timed(single('Rápido: ¿quién supervisa los mercados de valores en España?', ['La CNMV', 'El INE', 'La Agencia Tributaria'], 0, 'La Comisión Nacional del Mercado de Valores.'), 10),
      tf('Una bolsa aplica las mismas reglas y precios públicos a todos los participantes.', true, 'Por eso es un mercado organizado y transparente.'),
    ], { source: '2.3', minutes: 6, retire: [1, 2, 5, 7] }),

    lesson('u5l2', 'Quién compra y quién vende', [
      play({
        title: '¿Quién está al otro lado?',
        intro: 'Cuando compras una acción, alguien te la vende. ¿Quién puede ser? Clasifica a cada uno.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Particular (minorista)' }, { label: 'Profesional' }],
          cards: [
            { icon: 'person', label: 'Un estudiante que invierte 50 € al mes desde su app', bin: 0, why: 'Es un **minorista**: un particular que invierte su propio dinero.' },
            { icon: 'briefcase', label: 'Un plan de pensiones', bin: 1, why: 'Es un **institucional**: mueve el dinero de miles de personas.' },
            { icon: 'bot', label: 'Un algoritmo que opera en microsegundos', bin: 1, why: 'Es **alta frecuencia**: compra y vende a velocidades imposibles para una persona.' },
            { icon: 'exchange', label: 'Alguien que siempre pone un precio de compra y otro de venta', bin: 1, why: 'Es un **creador de mercado**: gana con la diferencia entre los dos precios.' },
            { icon: 'bank', label: 'Un banco central que compra bonos', bin: 1, why: 'Bancos centrales y gobiernos operan en bonos y divisas.' },
            { icon: 'family', label: 'Tu tía, que compra un poco de un fondo cada mes', bin: 0, why: 'Otra minorista: invierte su dinero, en pequeñas cantidades.' },
          ],
        },
        goal: { text: 'Clasifica a los seis participantes.', when: [when('done', '==', 6)] },
        insight: 'Al otro lado de tu orden suele haber **profesionales** con más información, mejores herramientas y costes casi nulos. Por eso ganarles a corto plazo es tan difícil.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: si mueve el dinero de muchos o es una máquina, es profesional.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Mira cuántos tipos de profesionales hay en el mercado.', mood: 'HAPPY' },
          { say: 'Toca cada tarjeta: ¿particular o profesional?', mood: 'HAPPY' },
        ],
      }),
      story('Ganarles en velocidad', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Una acción ha caído un 8 % en minutos tras sus resultados.'),
        say('bruno', '¡Voy a comprar y vender toda la tarde para ganarles a los algoritmos!'),
        choose('¿Qué le dices a Bruno?', [
          opt('Adelante: si es rápido, ganará', 'bad', say('lumi', 'Los algoritmos reaccionaron en microsegundos. Bruno siempre llegará tarde.')),
          opt('Su ventaja no es la velocidad, es el tiempo', 'good', say('lumi', '¡Eso! Puede esperar años y mantener costes muy bajos.')),
          opt('Que lo haga, pero con poco dinero', 'ok', say('lumi', 'Pierde menos, pero sigue en una carrera que no puede ganar.')),
        ]),
        say('bruno', '¿Entonces los particulares no pintamos nada?'),
        say('lumi', 'A largo plazo no compites con ellos: participas de lo que ganan las empresas.'),
      ]),
      key('Tu ventaja', 'Un minorista no rinde cuentas cada trimestre, puede esperar años y puede mantener costes muy bajos. Esa es su ventaja, no la velocidad.', 'La bolsa está llena de profesionales: tu ventaja está en el tiempo y en los costes bajos.', 'Pruébalo: en Mercado, añade a Favoritos una empresa que quieras tener durante años.'),
    ], [
      match('Empareja cada participante con lo que hace.', [['Minorista', 'Particular que invierte su dinero'], ['Institucional', 'Fondo de pensiones o aseguradora'], ['Creador de mercado', 'Pone precio de compra y de venta a la vez'], ['Alta frecuencia', 'Algoritmos que operan en microsegundos']], 'Cada participante tiene objetivos y herramientas distintos.'),
      single('¿Cómo gana dinero un creador de mercado?', ['Con la diferencia entre su precio de compra y el de venta', 'Cobrando una cuota a la CNMV', 'Con los dividendos de las empresas'], 0, 'Compra un poco más barato de lo que vende: esa diferencia es su margen.'),
      buckets('¿Minorista o institucional?', ['Minorista', 'Institucional'], [['Ana, que invierte 100 € al mes', 0], ['Un fondo de pensiones de empleo', 1], ['Una aseguradora', 1], ['Pablo desde la app de su bróker', 0], ['Una gestora de fondos indexados', 1]], 'Los institucionales invierten el dinero de miles de personas.'),
      scenario('Bruno ve que una acción cae un 8 % en minutos tras unos resultados y quiere «ganarles en velocidad» a los algoritmos comprando y vendiendo durante la tarde. ¿Qué hace?', [['Recuerda que compite con máquinas más rápidas y no opera por impulso', 'Se ahorra comisiones, spreads y nervios en una carrera que no puede ganar.'], ['Opera toda la tarde a golpe de noticia', 'Llega tarde a cada movimiento: los algoritmos reaccionaron en microsegundos.'], ['Pone todo su dinero en una sola operación rápida', 'Riesgo enorme en una apuesta contra los participantes más rápidos del mercado.']], 0, 'A corto plazo, el minorista juega en desventaja.'),
      tf('Los inversores institucionales, como fondos y aseguradoras, mueven mucho más dinero que un particular.', true, 'Gestionan el dinero de miles de personas: sus órdenes son enormes.'),
      timed(single('Rápido: ¿quién opera en microsegundos?', ['Los algoritmos de alta frecuencia', 'Los fondos de pensiones', 'Los minoristas'], 0, 'Son programas que compran y venden a velocidades imposibles para una persona.'), 10),
      tf('Un minorista compite en igualdad de información y velocidad con los profesionales.', false, 'Los profesionales tienen más datos, mejores herramientas y costes casi nulos.'),
      multi('¿Qué ventajas tiene un minorista a largo plazo? Marca todas.', ['Puede esperar años sin rendir cuentas a nadie', 'No necesita ganar cada trimestre', 'Tiene la información antes que nadie', 'Puede mantener costes muy bajos'], [0, 1, 3], 'La información y la velocidad no están de su lado; la paciencia y los costes, sí.'),
      fill('Cada vez que compras una acción, otro inversor la ____.', 'vende', ['regala', 'presta', 'alquila'], 'Toda compra tiene una venta al otro lado.'),
      chat(['He leído que los fondos y los algoritmos dominan la bolsa 😰', '¿Entonces los particulares no pintamos nada?'], '¿Qué le contestas a Lumi?', [['Exacto, mejor ni lo intentes', 'Tampoco: no hace falta ganarles en velocidad para invertir bien a largo plazo.'], ['A corto plazo es difícil ganarles; a largo plazo no compites con ellos', '¡Bien visto! Invertir a largo plazo es participar de lo que ganan las empresas.'], ['Hay que operar más rápido que ellos', 'Ellos operan en microsegundos: esa carrera está perdida.']], 1, 'El minorista no gana por velocidad, sino por tiempo y costes bajos.'),
      scenario('Leo invierte 50 € al mes en un fondo indexado. Un amigo le dice que así nunca ganará a los profesionales y que debería operar cada día. ¿Qué hace?', [['Sigue con su plan: su ventaja es el tiempo y los costes bajos', 'No compite en velocidad: participa durante años de lo que ganan las empresas.'], ['Empieza a operar cada día para ganarles', 'Entra en la carrera donde algoritmos y profesionales tienen ventaja, y paga costes en cada operación.'], ['Deja de invertir: la bolsa es solo para profesionales', 'Renuncia a su gran ventaja, el tiempo. A largo plazo no necesita ganarles en velocidad.']], 0, 'La tentación es operar más, pero a corto plazo el minorista juega en desventaja. A largo plazo, el tiempo y los costes bajos juegan a su favor.'),
    ], { source: '2.3', minutes: 6, retire: [3, 4, 5, 9] }),

    lesson('u5l4', 'Horarios y sesiones', [
      play({
        title: 'Jueves, 20:00 en España',
        intro: 'Cada mercado tiene su horario. Es jueves y son las **20:00** (hora peninsular). ¿Qué está abierto?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Abierto' }, { label: 'Cerrado' }],
          cards: [
            { icon: 'building', label: 'Bolsa de Madrid', bin: 1, why: 'Abre de 9:00 a 17:30: hace horas que cerró.' },
            { icon: 'building', label: 'Bolsa de Nueva York', bin: 0, why: 'De 9:30 a 16:00 allí: de **15:30 a 22:00** en España.' },
            { icon: 'building', label: 'Bolsa de Londres', bin: 1, why: 'De 8:00 a 16:30 allí: de 9:00 a 17:30 en España.' },
            { icon: 'bitcoin', label: 'Bitcoin', bin: 0, why: 'Las criptomonedas cotizan 24 horas, 7 días, también festivos.' },
            { icon: 'exchange', label: 'El euro frente al dólar', bin: 0, why: 'Las divisas cotizan 24 horas, de domingo noche a viernes noche.' },
            { icon: 'building', label: 'Bolsa de Tokio', bin: 1, why: 'Abre de madrugada en España.' },
            { icon: 'building', label: 'Bolsa de Fráncfort', bin: 1, why: 'Como Madrid y París: de 9:00 a 17:30.' },
          ],
        },
        goal: { text: 'Clasifica los siete mercados.', when: [when('done', '==', 7)] },
        insight: '**Madrid, de 9:00 a 17:30; Nueva York, de 15:30 a 22:00** en España. Las criptomonedas no cierran nunca y las divisas, solo el fin de semana.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: Nueva York abre por la tarde en España y cierra a las 22:00.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'A esta hora, casi toda Europa ya ha cerrado.', mood: 'HAPPY' },
          { say: 'Toca cada mercado: ¿abierto o cerrado?', mood: 'HAPPY' },
        ],
      }),
      story('Una orden a las 23:00', [{ id: 'pablo', name: 'Pablo' }], [
        note('Son las 23:00 en España. Nueva York cerró hace una hora.'),
        say('pablo', '¡Una empresa de EE. UU. acaba de dar resultados buenísimos! Compro ya a mercado.'),
        choose('¿Qué le pasará a la orden de Pablo?', [
          opt('Se ejecuta ya, al precio de cierre', 'bad', say('lumi', 'Con la bolsa cerrada no hay con quién cruzarla: espera a la apertura.')),
          opt('Espera a la apertura y puede salir mucho más cara', 'good', say('lumi', 'Eso. Si abre con un **hueco** al alza, paga mucho más de lo que ve.')),
          opt('Se cancela sola por ser de noche', 'ok', say('lumi', 'Normalmente queda pendiente hasta la apertura, al precio que haya.')),
        ]),
        say('pablo', '¿Un hueco?'),
        say('lumi', 'Un salto de precio entre el cierre y la apertura, sin precios intermedios.'),
      ]),
      key('Ojo con el reloj', 'Por el **cambio de hora**, EE. UU. y Europa no cambian el reloj el mismo día: unas semanas al año Nueva York abre a las **14:30** en España.\n\nTokio abre de madrugada en España y hace una pausa a mediodía (hora de Tokio).', 'Antes de operar, mira si el mercado está abierto.', 'Pruébalo: en Mercado, mira si Apple pone «abierto» o «cerrado» ahora mismo.'),
    ], [
      match('Empareja cada mercado con su horario (hora peninsular).', [['Bolsa de Madrid', 'De 9:00 a 17:30'], ['Nueva York', 'De 15:30 a 22:00'], ['Criptomonedas', '24 horas, 7 días'], ['Divisas', 'De domingo noche a viernes noche']], 'Cada mercado tiene su horario; las cripto no cierran nunca.'),
      timed(multi('Rápido: un miércoles normal a las 16:00 (hora peninsular), ¿qué está abierto? Marca todos.', ['Bolsa de Madrid', 'Bolsa de Nueva York', 'Criptomonedas', 'Bolsa de Tokio'], [0, 1, 2], 'A las 16:00 coinciden Madrid y Nueva York; Tokio cerró hace horas y las cripto nunca cierran.'), 20),
      timed(single('Rápido: sábado a las 12:00. ¿Qué puedes comprar al momento?', ['Acciones del IBEX 35', 'Bitcoin', 'Acciones de Apple en Nueva York'], 1, 'El fin de semana las bolsas cierran; las criptomonedas cotizan 24/7.'), 10),
      single('¿A qué hora abre normalmente la bolsa de Nueva York en hora peninsular española?', ['9:00', '15:30', '22:00'], 1, 'De 9:30 a 16:00 en Nueva York = de 15:30 a 22:00 en España.'),
      num('¿Cuántas horas dura la sesión de la Bolsa de Madrid, de 9:00 a 17:30?', 8.5, 'horas', 'De 9:00 a 17:30 hay 8 horas y media: 8,5.'),
      tf('Por el cambio de hora, unas semanas al año Nueva York abre a las 14:30 en España.', true, 'EE. UU. y Europa no adelantan ni retrasan el reloj el mismo día.'),
      scenario('Son las 23:00. Una empresa de EE. UU. acaba de publicar muy buenos resultados y Pablo pone una orden de compra a mercado. ¿Qué es lo más probable?', [['Se ejecuta en la apertura, quizá a un precio mucho más alto que el cierre', 'Si la acción abre con un hueco al alza, paga bastante más de lo que veía en pantalla.'], ['Se ejecuta ahora mismo al último precio de cierre', 'La bolsa está cerrada: no hay nadie en el libro con quien cruzar en horario normal.'], ['Se cancela sola por ser de noche', 'Normalmente queda pendiente hasta la apertura.']], 0, 'Con el mercado cerrado, una orden a mercado se ejecuta en la apertura, al precio que haya.'),
      buckets('Un martes a las 10:00 (hora peninsular), ¿abierto o cerrado?', ['Abierto', 'Cerrado'], [['Bolsa de Madrid', 0], ['Bolsa de Nueva York', 1], ['Bolsa de Londres', 0], ['Bitcoin', 0], ['Bolsa de Fráncfort', 0], ['Bolsa de Tokio', 1]], 'A las 10:00 en España, Nueva York aún no ha abierto y Tokio ya ha cerrado.'),
      tf('Si das una orden con la bolsa cerrada, se ejecuta al último precio de cierre.', false, 'Espera a la apertura y se ejecuta al precio que haya entonces.'),
      fill('Cuando una acción abre muy lejos del cierre anterior por noticias de la noche, se produce un ____.', 'hueco', ['spread', 'dividendo', 'desdoblamiento'], 'El hueco (gap) es un salto de precio sin cotizaciones intermedias.'),
      scenario('Leo trabaja de 9:00 a 18:00 y quiere comprar acciones de Microsoft con la bolsa de Nueva York abierta. ¿Cuándo puede hacerlo un día normal?', [['Al salir del trabajo, antes de las 22:00', 'Nueva York abre de 15:30 a 22:00 en España: por la tarde tiene tiempo de sobra.'], ['A la hora de comer, a las 14:00', 'A las 14:00 Nueva York aún no ha abierto: la orden esperaría a la apertura.'], ['A medianoche, con calma', 'A medianoche Nueva York ya ha cerrado: la orden se ejecutaría al día siguiente, al precio que haya.']], 0, 'Nueva York abre por la tarde en España, de 15:30 a 22:00. Comprar fuera de ese horario es tentador por comodidad, pero la orden espera a la apertura y puede salir a otro precio.'),
    ], { source: '2.3', minutes: 6, retire: [1, 2, 4, 6, 8] }),

    lesson('u5l5', 'Bróker, cuenta y custodia', [
      story('Cero comisiones y un bono', [{ id: 'marta', name: 'Marta' }], [
        say('marta', 'Mira este bróker: 0 comisiones y bono de bienvenida.'),
        say('marta', 'No sale en los registros de la CNMV ni tiene pasaporte europeo. ¿Importa?'),
        choose('¿Qué le dices a Marta?', [
          opt('Que abra cuenta: cero comisiones es imbatible', 'bad', say('lumi', 'Si es un chiringuito, puede perderlo todo, sin supervisor al que acudir.')),
          opt('Que busque un bróker autorizado', 'good', say('lumi', 'Eso. Autorizado por la CNMV o por otro supervisor de la UE.')),
          opt('Que pruebe solo con 500 €', 'ok', say('lumi', 'También puede perder esos 500 €. Y suelen pedir más después.')),
        ]),
        say('marta', '¿Y qué hace exactamente un bróker?'),
        say('lumi', 'Recibe tu orden, la lleva al mercado y te cobra comisiones.'),
      ]),
      play({
        title: '¿Y si algo sale mal?',
        intro: 'Tras comprar, tus acciones quedan **registradas a tu nombre**, separadas del patrimonio del bróker. ¿Qué te protege y qué no?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Estás protegido' }, { label: 'Es riesgo tuyo' }],
          cards: [
            { icon: 'lock', label: 'Tu bróker quiebra, pero tus acciones están a tu nombre', bin: 0, why: 'El **custodio** las guarda separadas del patrimonio del bróker: siguen siendo tuyas.' },
            { icon: 'bank', label: 'Un bróker español quiebra y falta parte de lo tuyo', bin: 0, why: 'Actúa el **FOGAIN**, hasta 100.000 € por inversor.' },
            { icon: 'down', label: 'Tus acciones caen un 30 % en bolsa', bin: 1, why: 'El FOGAIN no cubre las caídas del mercado: son riesgo tuyo.' },
            { icon: 'warning', label: 'Un chiringuito sin registro desaparece con tu dinero', bin: 1, why: 'Sin autorización no hay supervisor ni fondo de garantía.' },
            { icon: 'company', label: 'La empresa en la que invertiste quiebra', bin: 1, why: 'Es el riesgo de tu inversión, no del bróker: nadie te lo devuelve.' },
          ],
        },
        goal: { text: 'Clasifica los cinco casos.', when: [when('done', '==', 5)] },
        insight: 'Tus valores se guardan **a tu nombre**. El **FOGAIN** cubre hasta 100.000 € si la entidad no puede devolverte lo tuyo, **no si la bolsa baja**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: el fondo de garantía protege de la entidad, no del mercado.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'Fíjate: lo que hace la bolsa con tu dinero es cosa tuya.', mood: 'CALM' },
          { say: '¿Te protege o es riesgo tuyo? Toca cada caso', mood: 'HAPPY' },
        ],
      }),
      key('Liquidación y custodia', 'Tras el cruce, la operación se **liquida**: el dinero va al vendedor y las acciones a ti. En Europa tarda dos días hábiles (**T+2**) y pasará a uno (T+1) el 11 de octubre de 2027; en EE. UU. ya es uno desde 2024. En España el registro central es **Iberclear**.\n\nCon un bróker de otro país de la UE te cubre el fondo de ese país, que puede ser menor (el mínimo europeo es 20.000 €). Antes de abrir cuenta, comprueba en la web de la CNMV que el bróker está autorizado.', 'El bróker es tu puerta de entrada; tus valores se guardan a tu nombre.', 'Pruébalo: haz una compra en el Mercado y busca la operación en tu Cartera.'),
    ], [
      single('¿Qué hace un bróker?', ['Recibe tu orden y la lleva al mercado', 'Decide qué empresas cotizan', 'Garantiza que tus inversiones suban'], 0, 'Es el intermediario entre tú y el mercado.'),
      tf('Si tu bróker quiebra, tus acciones se pierden con él.', false, 'Están a tu nombre y separadas de su patrimonio.'),
      tf('El FOGAIN te compensa si tus acciones caen en bolsa.', false, 'Solo cubre que la entidad no pueda devolverte tu dinero o tus valores. Las caídas de la bolsa son riesgo tuyo.'),
      timed(single('Rápido: ¿hasta cuánto cubre el FOGAIN por inversor?', ['100.000 €', '20.000 €', 'No tiene límite'], 0, 'Hasta 100.000 € por inversor, si la entidad española no puede devolverte lo tuyo.'), 12),
      order('Ordena el recorrido de tu orden de compra.', ['Das la orden en la app', 'El bróker la lleva al mercado', 'Se cruza con un vendedor', 'Se liquida en dos días hábiles', 'Las acciones quedan registradas a tu nombre'], 'De la app al registro: así llegan las acciones a ser tuyas.'),
      scenario('Marta ve un anuncio de un bróker con «0 comisiones y bono de bienvenida». No aparece en los registros de la CNMV ni tiene pasaporte europeo. ¿Qué hace?', [['Busca otro bróker autorizado', 'Sus valores quedarán custodiados por una entidad supervisada.'], ['Abre cuenta: cero comisiones es imbatible', 'Si es un chiringuito, puede perder todo lo que ingrese, sin supervisor al que acudir.'], ['Ingresa solo 500 € para probar', 'Si no está autorizado, también puede perder esos 500 €. Y suelen pedir más después.']], 0, 'Sin autorización no hay supervisión ni fondo de garantía.'),
      match('Empareja cada nombre con su función.', [['Bróker', 'Lleva tu orden al mercado'], ['Iberclear', 'Registro central de valores en España'], ['Custodio', 'Guarda tus valores a tu nombre'], ['FOGAIN', 'Fondo de garantía de inversiones en España']], 'Cada pieza protege una parte del proceso.'),
      fill('En Europa, una compra de acciones se liquida en ____ días hábiles.', 'dos', ['cero', 'cinco', 'treinta'], 'T+2: el día de la operación más dos días hábiles. Desde el 11 de octubre de 2027 será uno (T+1).'),
      timed(tf('Antes de abrir cuenta conviene comprobar que el bróker está autorizado por la CNMV o por otro supervisor de la UE.', true, 'Es la primera comprobación: si no aparece, no es una entidad autorizada.'), 10),
      scenario('Pablo tiene 60.000 € en un bróker con sede en otro país de la UE y da por hecho que le cubre el FOGAIN español. ¿Qué hace?', [['Comprueba qué fondo de garantía le aplica y hasta cuánto cubre', 'Descubre que le cubre el fondo del país del bróker, con otro límite: ya sabe a qué atenerse.'], ['Nada: todos los fondos de garantía son iguales', 'No lo son: el mínimo europeo es 20.000 € y cada país fija el suyo.'], ['Lo saca todo y lo guarda en casa', 'En casa no hay ninguna protección y además pierde poder de compra.']], 0, 'La protección depende del país de la entidad: compruébalo antes de abrir cuenta.'),
    ], { source: '2.3', minutes: 6, retire: [1, 2, 5, 8] }),

    lesson('u5l6', 'Mercado primario y secundario: las OPV', [
      story('La salida a bolsa de moda', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Todo el mundo habla de la salida a bolsa de una marca de moda.'),
        say('bruno', 'Si sale a bolsa es porque va genial, ¿no? ¡Meto todos mis ahorros!'),
        choose('¿Qué le aconsejas?', [
          opt('Que meta todo: es una oportunidad única', 'bad', say('lumi', 'Si cae un 30 % los primeros meses, se queda sin colchón y con pérdidas.')),
          opt('Que lea el folleto y, si invierte, con una parte pequeña', 'good', say('lumi', 'Eso. El **folleto**, aprobado por la CNMV, explica el negocio y los riesgos.')),
          opt('Que espere a ver qué dicen en redes', 'ok', say('lumi', 'Las redes no conocen la empresa. El folleto, sí.')),
        ]),
        say('lumi', 'El precio lo fija quien vende, y conoce la empresa mejor que tú.'),
        say('lumi', 'Muchas salidas a bolsa acaban cotizando por debajo de su precio de salida.'),
      ]),
      play({
        title: '¿Quién recibe tu dinero?',
        intro: 'En el **mercado primario** se emiten valores nuevos. En el **secundario**, los inversores se compran y venden los que ya existen.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'El emisor (primario)' }, { label: 'Otro inversor (secundario)' }],
          cards: [
            { icon: 'company', label: 'Una empresa amplía capital con acciones nuevas', bin: 0, why: 'Emite acciones nuevas: el dinero va a la empresa.' },
            { icon: 'phone', label: 'Compras 10 acciones de Iberdrola desde tu app', bin: 1, why: 'Se las compras a otro inversor: Iberdrola no recibe nada.' },
            { icon: 'rocket', label: 'Una salida a bolsa con acciones de nueva emisión', bin: 0, why: 'Acciones nuevas: el dinero entra en la empresa.' },
            { icon: 'person', label: 'Vendes tus acciones a otro inversor', bin: 1, why: 'Cambia de manos algo que ya existe.' },
            { icon: 'bank', label: 'El Tesoro emite letras en subasta', bin: 0, why: 'Valores nuevos: el dinero va al Estado, que es el emisor.' },
            { icon: 'document', label: 'Compras un bono del Estado que ya cotiza', bin: 1, why: 'Ya existía: se lo compras a otro inversor.' },
          ],
        },
        goal: { text: 'Clasifica las seis operaciones.', when: [when('done', '==', 6)] },
        insight: '**Primario:** se emiten valores nuevos y el dinero va al emisor. **Secundario:** cambian de manos los que ya existen y la empresa no recibe nada.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿recibe dinero nuevo quien emite el valor?', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'La bolsa del día a día es casi toda mercado secundario.', mood: 'HAPPY' },
          { say: 'Toca cada operación: ¿primario o secundario?', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿OPS u OPV?',
        intro: 'Para salir a bolsa hay dos formas, a menudo combinadas. La clave: **¿quién se queda el dinero?**',
        widget: {
          kind: 'sort',
          bins: [{ label: 'OPS: va a la empresa' }, { label: 'OPV: va a los dueños que venden' }],
          cards: [
            { icon: 'factory', label: 'Se crean acciones nuevas para abrir fábricas', bin: 0, why: 'Oferta pública de **suscripción**: acciones nuevas, dinero para la empresa.' },
            { icon: 'person', label: 'La fundadora vende parte de sus acciones', bin: 1, why: 'Oferta pública de **venta**: vende algo que ya existe y el dinero es para ella.' },
            { icon: 'briefcase', label: 'Un fondo que entró hace años vende su parte', bin: 1, why: 'Los dueños actuales venden: la empresa no recibe nada.' },
            { icon: 'receipt', label: 'La empresa emite acciones para pagar su deuda', bin: 0, why: 'Emite acciones nuevas: el dinero va a la empresa.' },
          ],
        },
        goal: { text: 'Clasifica los cuatro casos.', when: [when('done', '==', 4)] },
        insight: '**OPS:** acciones nuevas y dinero para la empresa. **OPV:** los dueños venden y el dinero va a ellos. En inglés, una salida a bolsa se llama IPO. Pruébalo: en Mercado, mira el gráfico mensual de una empresa y busca su primer día en bolsa.',
        lumi: [
          { when: when('wrong', '>=', 1), say: 'Si no se crean acciones nuevas, la empresa no cobra.', mood: 'THINKING' },
          { when: when('done', '>=', 2), say: 'Antes de una salida a bolsa, mira quién vende y por qué.', mood: 'HAPPY' },
          { say: 'Toca cada caso: ¿OPS u OPV?', mood: 'HAPPY' },
        ],
      }),
    ], [
      match('Empareja cada término con lo que significa.', [['OPS', 'Acciones nuevas; el dinero va a la empresa'], ['OPV', 'Los dueños venden; el dinero va a ellos'], ['Mercado secundario', 'Inversores comprando y vendiendo entre sí'], ['Folleto', 'Información y riesgos aprobados por la CNMV']], 'Saber quién recibe el dinero es la clave para distinguirlos.'),
      buckets('¿Mercado primario o secundario?', ['Primario', 'Secundario'], [['Una empresa amplía capital con acciones nuevas', 0], ['Compras 10 acciones de Iberdrola desde tu app', 1], ['Salida a bolsa con acciones de nueva emisión', 0], ['Vendes tus acciones a otro inversor', 1], ['El Tesoro emite letras en subasta', 0], ['Compras un bono del Estado que ya cotiza', 1]], 'Si el emisor recibe dinero nuevo, es primario; si cambia de manos lo que ya existe, secundario.'),
      single('Compras hoy acciones de Inditex en bolsa. ¿Quién recibe tu dinero?', ['El inversor que te las vende', 'Inditex', 'La CNMV'], 0, 'Es mercado secundario: Inditex no recibe nada de esa compra.'),
      tf('En una OPV pura, la empresa no recibe dinero nuevo: lo reciben los accionistas que venden.', true, 'Si la empresa quiere dinero nuevo, tiene que emitir acciones (OPS).'),
      timed(tf('Que una salida a bolsa tenga mucha publicidad garantiza que subirá.', false, 'La publicidad no cambia lo que vale la empresa; muchas acaban por debajo del precio de salida.'), 10),
      single('¿Qué documento deberías leer antes de acudir a una salida a bolsa?', ['El folleto aprobado por la CNMV', 'Los comentarios en redes sociales', 'El resumen de un influencer'], 0, 'El folleto explica el negocio, las cuentas y los riesgos.'),
      scenario('Todo el mundo habla de la salida a bolsa de una empresa de moda y Bruno quiere meter todos sus ahorros el primer día. ¿Qué hace?', [['Lee el folleto y, si invierte, que sea una parte pequeña', 'Si el estreno sale mal, su plan no se rompe.'], ['Mete todos sus ahorros', 'Si la acción cae un 30 % en los primeros meses, se queda sin colchón y con pérdidas.'], ['Pide un préstamo para comprar más', 'Deuda para una apuesta en una empresa que acaba de empezar a cotizar: doble riesgo.']], 0, 'Una OPV es una inversión más, no una oportunidad única.'),
      fill('Cuando una empresa que ya cotiza emite acciones nuevas para conseguir dinero, hace una ____ de capital.', 'ampliación', ['reducción', 'liquidación', 'subasta'], 'La ampliación de capital es mercado primario aunque la empresa ya cotice.'),
      order('Ordena los pasos de una salida a bolsa.', ['La empresa decide salir a bolsa', 'La CNMV aprueba el folleto', 'Los inversores piden acciones al precio fijado', 'Primer día de cotización en el mercado secundario'], 'Después del estreno, las acciones pasan a negociarse entre inversores.'),
      chat(['Si una empresa sale a bolsa, es porque va genial, ¿no? 🚀'], '¿Qué le contestas a Lumi?', [['Sí, solo salen las mejores', 'Salen las que quieren dinero o cuyos dueños quieren vender: no tiene por qué ser buena señal.'], ['No necesariamente: a veces los dueños aprovechan para vender caro', '¡Eso! Quien vende conoce la empresa mejor que tú. Lee el folleto antes de decidir.'], ['Si sale a bolsa, está garantizado que sube', 'Nada garantiza que suba: muchas acaban por debajo de su precio de salida.']], 1, 'En una OPV, quien vende elige el momento, y suele elegir uno bueno para él.'),
      scenario('Una empresa anuncia su salida a bolsa. El folleto dice que todas las acciones que se ofrecen son de sus fundadores, que venden parte de lo suyo. ¿Qué significa?', [['Es una OPV: el dinero va a los fundadores, no a la empresa', 'No se crean acciones nuevas: la empresa no recibe nada. Conviene preguntarse por qué venden ahora.'], ['Es una OPS: la empresa recibe dinero para crecer', 'En una OPS se emiten acciones nuevas. Aquí solo cambian de manos las que ya existían.'], ['Que es buena señal: si salen a bolsa, es que va muy bien', 'Quien vende conoce la empresa mejor que tú y elige el momento que le conviene a él.']], 0, 'Si no se emiten acciones nuevas, es una OPV y la empresa no cobra. La tentación es leerlo como buena señal, pero quien vende elige el momento que le conviene.'),
    ], { source: '2.1', minutes: 6, retire: [1, 4, 6, 9] }),

    lesson('u5l7', 'La bolsa española: IBEX y mercado continuo', [
      story('Fuera del IBEX', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'La empresa de la que tengo acciones ha salido del IBEX 35. ¿Va fatal?'),
        choose('¿Qué le dices a Pablo?', [
          opt('Sí: en el IBEX solo están las mejores', 'bad', say('lumi', 'Están las 35 **más líquidas**, no las mejores.')),
          opt('No necesariamente: ahora se negocia menos que otras', 'good', say('lumi', 'Eso. No estar en el IBEX no significa ser mala empresa.')),
          opt('Ya no cotiza en bolsa', 'ok', say('lumi', 'Sigue cotizando en el mercado continuo, con más de un centenar de empresas.')),
        ]),
        say('pablo', '¿Y quién decide eso?'),
        say('lumi', 'Un comité técnico, dos veces al año: en junio y en diciembre.'),
      ]),
      play({
        title: '¿Dónde cotiza?',
        intro: 'Más de un centenar de empresas cotizan en el **mercado continuo**, pero no todas en el mismo escaparate.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'IBEX 35' }, { label: 'BME Growth' }, { label: 'Latibex' }],
          cards: [
            { icon: 'power', label: 'Una gran eléctrica con millones de acciones negociadas al día', bin: 0, why: 'Está entre las 35 más líquidas: entra en el IBEX.' },
            { icon: 'rocket', label: 'Una startup tecnológica pequeña que busca crecer', bin: 1, why: '**BME Growth**: empresas pequeñas en expansión, con menos requisitos y más riesgo.' },
            { icon: 'globe', label: 'Una empresa mexicana que quiere cotizar en euros', bin: 2, why: '**Latibex** reúne empresas latinoamericanas que cotizan en euros.' },
            { icon: 'bank', label: 'Un gran banco español muy negociado', bin: 0, why: 'Mucha liquidez: es de las 35 que forman el IBEX.' },
            { icon: 'store', label: 'Una empresa familiar pequeña en expansión', bin: 1, why: 'Pequeña y en expansión: encaja en BME Growth (antes, MAB).' },
          ],
        },
        goal: { text: 'Coloca las cinco empresas.', when: [when('done', '==', 5)] },
        insight: 'El **IBEX 35** es el escaparate; el mercado continuo, la tienda entera. **BME Growth** tiene empresas pequeñas y más riesgo, y **Latibex**, latinoamericanas.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: el IBEX va por liquidez; BME Growth, por tamaño pequeño.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'Tamaño, liquidez y origen deciden el segmento.', mood: 'HAPPY' },
          { say: 'Toca cada empresa: ¿dónde cotiza?', mood: 'HAPPY' },
        ],
      }),
      key('El IBEX 35 y el mercado continuo', 'El **mercado continuo** (SIBE) une en un sistema electrónico las bolsas de Madrid, Barcelona, Bilbao y Valencia, con un único libro de órdenes por valor. Lo gestiona **BME**, del grupo suizo SIX desde 2020.\n\nEl **IBEX 35** pondera por capitalización, contando solo las acciones que se negocian libremente. Su base fueron **3.000 puntos** a finales de 1989.', 'El IBEX 35 es el escaparate; el mercado continuo, la tienda entera.', 'Pruébalo: en Mercado, usa «Explorar por índice» y mira las 35 empresas del IBEX.'),
    ], [
      match('Empareja cada nombre con lo que es.', [['IBEX 35', 'Las 35 empresas más líquidas'], ['Mercado continuo', 'Sistema electrónico que une las cuatro bolsas'], ['BME Growth', 'Empresas pequeñas en expansión'], ['Latibex', 'Empresas latinoamericanas en euros']], 'La bolsa española tiene varios segmentos con reglas y riesgos distintos.'),
      single('¿Cada cuánto se revisa de forma ordinaria la composición del IBEX 35?', ['Dos veces al año', 'Cada día', 'Nunca: siempre son las mismas'], 0, 'En junio y diciembre un comité técnico decide qué entra y qué sale.'),
      upDown('IBEX 35, julio de 2012: crisis de deuda, prima de riesgo disparada y rescate a la banca española. ¿Qué crees que hizo el índice en el año y medio siguiente?', 'hist-ibex-2012', 'Con los peores titulares es cuando más difícil resulta prever el mercado: por eso conviene un plan que no dependa de adivinarlo.', 'el año y medio siguiente'),
      tf('El IBEX 35 incluye todas las empresas que cotizan en la bolsa española.', false, 'Solo las 35 más líquidas; en el mercado continuo hay más de un centenar.'),
      timed(tf('Una empresa puede salir del IBEX 35 en una revisión.', true, 'Si deja de estar entre las más líquidas, el comité puede sacarla.'), 10),
      buckets('¿En qué segmento encaja cada empresa?', ['Mercado continuo (IBEX)', 'BME Growth', 'Latibex'], [['Un gran banco español muy negociado', 0], ['Una startup tecnológica pequeña que busca crecer', 1], ['Una empresa brasileña que quiere cotizar en euros', 2], ['Una eléctrica grande con millones de acciones negociadas al día', 0], ['Una empresa familiar pequeña en expansión', 1]], 'Tamaño, liquidez y origen deciden el segmento.'),
      fill('El IBEX 35 empezó con una base de ____ puntos a finales de 1989.', '3.000', ['100', '1.000', '35'], 'Desde esa base se mide cuánto ha subido o bajado.'),
      scenario('Pablo quiere meter casi todos sus ahorros en una empresa de BME Growth porque «puede multiplicarse». ¿Qué tiene en cuenta?', [['Que suelen ser más pequeñas, menos líquidas y con más riesgo', 'Si invierte, lo hace con una parte pequeña y sabiendo que puede costar vender.'], ['Que tiene la misma liquidez que una del IBEX', 'No: con poco volumen, vender rápido puede obligarle a bajar mucho el precio.'], ['Que BME Growth garantiza la inversión', 'Ningún segmento de la bolsa garantiza nada.']], 0, 'Empresa pequeña: más potencial y también más riesgo y menos liquidez.'),
      single('¿Cómo pondera el IBEX 35 a sus empresas?', ['Por capitalización, contando las acciones que se negocian libremente', 'Todas pesan lo mismo', 'Por número de empleados'], 0, 'Las más grandes en bolsa pesan más en el índice.'),
    ], { source: '2.6', minutes: 6, retire: [3, 4, 5] }),
  ],
})
