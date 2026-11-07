import 'server-only'
// Sección 8 · Unidad 26 · Tu plan de trading (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/10 (10.6, 10.8, 10.9); clase antigua course/u10.ts.
import { buckets, chat, choose, fill, key, lesson, level, match, multi, note, num, opt, order, play, say, scenario, simTrade, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u26', order: 26, title: 'Tu plan de trading', description: 'Escribe tu plan, lleva un diario, aguanta las rachas y da el salto con cabeza',
  lessons: [
    lesson('u26l1', 'El plan de trading', [
      story('Se dispara un 8 %', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Mi plan dice: solo entro con vela de giro en un soporte.'),
        note('Una acción se dispara un 8 % en una hora. No cumple ninguna de sus reglas.'),
        say('pablo', '¡Se me escapa! ¿Entro?'),
        choose('¿Qué le dices a Pablo?', [
          opt('Entra: es una ocasión única', 'bad', say('lumi', 'Eso es FOMO. Y si sale mal, no sabrá si su plan funciona.')),
          opt('No entres y apúntalo en el diario como tentación', 'good', say('lumi', '¡Eso! Ocasiones habrá muchas. El plan solo sirve si lo sigues.')),
          opt('Entra con poco, por si acaso', 'ok', say('lumi', 'Poco o mucho, sigue siendo saltarse el plan.')),
        ]),
        say('lumi', 'Escribe el plan en calma. Lo vas a necesitar cuando no lo estés.'),
      ]),
      play({
        title: '¿Regla o deseo?',
        intro: 'Un plan dice cuánto dedicas, qué operas, cuándo entras, dónde va el stop, cuánto arriesgas, cómo sales y cuándo paras. ¿Estas frases sirven?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Regla concreta' }, { label: 'Frase vaga' }],
          cards: [
            { icon: 'target', label: 'Entro si rebota en la media de 50 sesiones con vela de giro y volumen superior a la media', bin: 0, why: 'Se puede comprobar: dos personas leyéndola harían lo mismo.' },
            { icon: 'cloud', label: 'Entro cuando lo vea claro', bin: 1, why: '¿Qué es «claro»? Cada día significará algo distinto.' },
            { icon: 'shield', label: 'Stop bajo el mínimo de la vela de giro, como mínimo a 1,5 ATR', bin: 0, why: 'Dice exactamente dónde va el stop y por qué.' },
            { icon: 'idea', label: 'Salgo cuando me parezca suficiente', bin: 1, why: 'Lo decidirá la emoción del momento, no el plan.' },
            { icon: 'timer', label: 'Si en 15 sesiones no llega a 1R, salgo', bin: 0, why: 'Una salida por tiempo, medible y sin discusión.' },
          ],
        },
        goal: { text: 'Clasifica las cinco frases.', when: [when('done', '==', 5)] },
        insight: 'Una regla concreta se puede comprobar: **dos personas leyéndola harían lo mismo**. Si no está escrito así, no es un plan: es una intuición.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿podrías comprobar después si la cumpliste?', mood: 'THINKING' },
          { say: '¿Regla o deseo? Clasifica cada frase', mood: 'HAPPY' },
        ],
      }),
      key('Los límites te protegen de ti', '«No opero el día de resultados. No promedio a la baja. No muevo el stop en contra. Si pierdo un 6 % en un mes, paro hasta el mes siguiente. Si la cuenta cae un 15 % desde su máximo, reduzco el riesgo a la mitad y reviso el plan.»\n\nY cada 20 operaciones, revisión de estadísticas.', 'Si no está escrito, no es un plan: es una intuición.', 'Pruébalo: escribe tu plan y haz tu próxima compra del simulador solo si lo cumple.'),
    ], [
      order('Ordena las partes de un plan de trading.', ['Capital dedicado', 'Mercados y temporalidad', 'Condiciones de entrada', 'Dónde va el stop', 'Tamaño de la posición', 'Cómo salgo', 'Límites y cuándo paro'], 'De lo general (cuánto y qué) a lo concreto (cuándo entro, cuánto arriesgo y cómo salgo).'),
      fill('Tamaño de la posición: riesgo del ____ por operación.', '1 %', ['10 %', '25 %', '50 %'], 'Para quien empieza, un 1 % o menos.'),
      fill('Límite mensual del plan de ejemplo: si pierdo un ____ en un mes, paro hasta el mes siguiente.', '6 %', ['1 %', '30 %', '60 %'], 'Un tope mensual corta las espirales de operar por venganza.'),
      buckets('¿Es una regla concreta o una frase vaga?', ['Regla concreta', 'Frase vaga'], [['Entro si rebota en la media de 50 sesiones con vela de giro y volumen superior a la media', 0], ['Entro cuando lo vea claro', 1], ['Stop bajo el mínimo de la vela de giro, como mínimo a 1,5 ATR', 0], ['Salgo cuando me parezca suficiente', 1], ['Si en 15 sesiones no llega a 1R, salgo', 0]], 'Una regla concreta se puede comprobar: dos personas leyéndola harían lo mismo.'),
      chat(['¡Ya tengo mi plan de trading! 📝', 'Comprar barato y vender caro.'], '¿Qué le dices a Lumi?', [['Perfecto, es el plan de todo el mundo', 'Ese es el problema: no dice cuándo entro, dónde está el stop ni cuánto arriesgo.'], ['Eso es un deseo; un plan dice cuándo entras, dónde está el stop y cuánto arriesgas', 'Vale… Entrada en soporte con vela de giro, stop bajo el mínimo, 1 % de riesgo y salida en 2R. ¿Mejor?'], ['No hace falta plan si tienes intuición', 'La intuición no se puede revisar ni mejorar. Un plan escrito, sí.']], 1, 'Un plan son reglas comprobables, no buenas intenciones.'),
      multi('¿Qué cosas van en el apartado «Lo que no hago» del plan de ejemplo? Marca todas.', ['No opero el día de resultados', 'No promedio a la baja', 'No muevo el stop en contra', 'No pongo nunca stop'], [0, 1, 2], 'No poner stop sería saltarse la base del plan.'),
      num('Tu plan limita el riesgo total abierto al 5 % de la cuenta y cada operación arriesga un 1 %. ¿Cuántas operaciones puedes tener abiertas a la vez como máximo?', 5, 'operaciones', '5 % ÷ 1 % = 5 operaciones abiertas.'),
      timed(tf('Un buen plan de trading incluye una predicción de lo que hará la bolsa.', false, 'Un plan son reglas para actuar pase lo que pase, no predicciones.'), 10),
      scenario('El plan de Pablo dice «solo entro con vela de giro en soporte». Hoy ve una acción que se dispara un 8 % en una hora y no cumple ninguna regla. ¿Qué hace?', [['Entra: es una ocasión única', 'Esa «ocasión única» es FOMO. Si sale mal, no sabrá si su plan funciona o no.'], ['No entra y lo anota en el diario como tentación', 'Bien: respeta el plan y aprende de lo que siente. Ocasiones habrá muchas.'], ['Entra con el doble de tamaño para aprovecharla', 'Saltarse el plan y además doblar el riesgo: dos errores en uno.']], 1, 'El plan solo sirve si lo sigues también cuando no te apetece.'),
      level('Tu plan dice: «stop bajo el mínimo reciente». Aplícalo a esta compra en un gráfico real.', 'lvl-18', 'STOP', 'Una regla concreta se aplica igual en cualquier gráfico: el stop va justo por debajo del mínimo reciente.'),
      single('¿Cada cuánto propone el plan de ejemplo revisar las estadísticas?', ['Cada 20 operaciones', 'Después de cada operación', 'Nunca'], 0, 'Una sola operación no dice nada; 20 empiezan a enseñar algo.'),
    ], { source: '10.8', minutes: 6, retire: [1, 3, 6, 7, 8] }),

    lesson('u26l2', 'El diario de operaciones', [
      story('Lo que dijo el diario de Marta', [{ id: 'marta', name: 'Marta' }], [
        say('marta', 'Llevo 40 operaciones apuntadas en mi diario.'),
        say('marta', 'Las que siguieron el plan: **+0,3R** de media. Las que me salté: **−0,6R**.'),
        choose('¿Qué debería cambiar Marta?', [
          opt('Su sistema: no funciona', 'bad', say('lumi', 'Cuando lo sigue, gana. Cambiarlo tiraría lo que funciona.')),
          opt('Dejar de saltarse el plan', 'good', say('lumi', '¡Exacto! El problema son las excepciones. Ahí está su mejora.')),
          opt('Dejar el diario, que la agobia', 'bad', say('lumi', 'Sin diario, nunca lo habría descubierto.')),
        ]),
        say('marta', 'Mi memoria me decía que las excepciones eran mis mejores operaciones…'),
        say('lumi', 'Tu memoria recuerda los aciertos y olvida los errores. El diario, no.'),
      ]),
      play({
        title: 'Repasa tu diario',
        intro: 'En cada línea del diario apuntas el motivo, la entrada, el stop, el tamaño, el resultado en R y tu emoción. ¿Seguiste el plan?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Seguí el plan' }, { label: 'Me lo salté' }],
          cards: [
            { icon: 'target', label: 'Entré en el soporte con vela de giro, como dice el plan', bin: 0, why: 'Motivo de entrada según el plan: así se puede medir si el sistema funciona.' },
            { icon: 'timer', label: 'Entré con prisa: «se me escapaba»', bin: 1, why: 'La prisa al entrar es la huella del FOMO. Apunta la emoción.' },
            { icon: 'shield', label: 'Moví el stop en contra «para darle aire»', bin: 1, why: 'Mover el stop en contra convierte una pérdida pequeña en una grande.' },
            { icon: 'flag', label: 'Vendí la mitad en 2R, como decía el plan', bin: 0, why: 'La salida estaba decidida antes de entrar.' },
            { icon: 'flame', label: 'Doblé el tamaño tras dos pérdidas', bin: 1, why: 'El tamaño es siempre el mismo, ganes o pierdas.' },
          ],
        },
        goal: { text: 'Revisa las cinco operaciones.', when: [when('done', '==', 5)] },
        insight: 'Comparar las operaciones **dentro y fuera del plan** suele ser lo más revelador del diario: te dice si saltarte las reglas te cuesta dinero.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿lo decidió el plan o la emoción del momento?', mood: 'THINKING' },
          { say: '¿Dentro o fuera del plan? Revisa cada línea', mood: 'HAPPY' },
        ],
      }),
      key('Una línea del diario', '12/11, compra a 4,10 €, stop 3,95 €, objetivo 4,40 €, 1R = 100 €, 666 acciones. Resultado: +180 €, +1,8R. Seguí el plan: sí. Emoción: tranquilo.\n\nDe ahí salen el acierto, la ganancia y pérdida media en R, la **esperanza** y las rachas.', 'El diario convierte tus operaciones en datos para mejorar.', 'Pruébalo: abre el historial de tu Cartera y apunta motivo y emoción de cada operación.'),
    ], [
      match('Empareja cada campo del diario con un ejemplo.', [['Motivo de entrada', 'Rebote en la media de 50 con martillo'], ['Resultado en R', '+1,8R'], ['Emoción al entrar', 'Con prisa'], ['¿Seguí el plan?', 'No: entré sin señal']], 'Cada campo responde a una pregunta que luego te ayudará a mejorar.'),
      match('Empareja cada estadística del diario con lo que te dice.', [['Porcentaje de acierto', 'Cuántas operaciones salen bien'], ['Esperanza', 'Si el sistema gana a largo plazo'], ['Racha máxima de pérdidas', 'Cuánto tienes que aguantar'], ['Dentro y fuera del plan', 'Si saltarte las reglas te cuesta dinero']], 'Ninguna estadística sola cuenta toda la historia.'),
      num('Riesgo por operación: 100 €. Entras a 4,10 € con el stop en 3,95 €. ¿Cuántas acciones compras? (redondea hacia abajo)', 666, 'acciones', 'Distancia: 0,15 €. 100 ÷ 0,15 = 666,7 → 666 acciones.', 0.5),
      num('Tu diario tiene 20 operaciones: 8 ganadoras y 12 perdedoras. ¿Cuál es tu porcentaje de acierto?', 40, '%', '8 ÷ 20 = 0,4 → 40 %.'),
      num('En esas 20 operaciones, las ganadoras dieron +2R de media y las perdedoras −1R. ¿Cuál es tu esperanza por operación?', 0.2, 'R', '0,4 × 2 − 0,6 × 1 = +0,2R.'),
      single('¿Qué estadística del diario dice si tu sistema gana a largo plazo?', ['La esperanza matemática', 'El número de operaciones', 'La hora de entrada'], 0, 'Combina el acierto con la ganancia y la pérdida media.'),
      scenario('Tras 40 operaciones, el diario de Marta muestra que las que siguieron el plan dan +0,3R de media y las que lo saltaron, −0,6R. ¿Qué hace?', [['Nada, los números son lo de menos', 'Los números le están diciendo exactamente dónde pierde dinero.'], ['Se centra en no saltarse el plan', 'Bien: el problema no es el sistema, son las excepciones. Ahí está su mejora.'], ['Cambia de sistema', 'Su sistema, cuando lo sigue, gana. Cambiarlo tiraría lo que funciona.']], 1, 'Comparar dentro y fuera del plan suele ser lo más revelador del diario.'),
      tf('Para saber cómo te va, tu memoria es tan fiable como un diario.', false, 'La memoria recuerda los aciertos y olvida los errores: el diario no.'),
      timed(single('Rápido: ¿qué columna del diario te ayuda a detectar el FOMO?', ['La emoción al entrar', 'El precio de entrada', 'La fecha'], 0, 'Si al entrar apuntas «prisa» o «miedo a perdérmelo», ya sabes qué buscar.'), 12),
      chat(['Llevar un diario es un rollo 😩', 'Total, ya me acuerdo de mis operaciones.'], '¿Qué le contestas a Lumi?', [['Tienes razón, con la memoria basta', 'Tu memoria guarda la operación que salió genial y olvida las cinco pequeñas pérdidas.'], ['Sin diario no puedes calcular tu esperanza ni ver tus errores', 'Vale… Si en 20 operaciones descubro que pierdo cuando opero con prisa, merece la pena.'], ['Apunta solo las ganadoras', 'Entonces tu diario diría que eres un genio… y te arruinaría.']], 1, 'Lo que no se mide no se puede mejorar.'),
      scenario('Repasas tu diario: casi todas las operaciones en las que apuntaste «con prisa» acabaron en pérdida; las demás van bien. ¿Qué haces?', [['Añado una regla al plan: si siento prisa, hoy no entro', 'Bien: el diario te ha enseñado dónde pierdes, y una regla escrita lo corta.'], ['Dejo de apuntar la emoción, que me agobia', 'Así el problema sigue ahí, pero ya no lo ves.'], ['Opero más rápido para no darle tiempo a la prisa', 'Más prisa es justo lo que te está costando dinero.']], 0, 'El diario sirve para cambiar el plan con datos: si una emoción se repite en las pérdidas, se convierte en una regla. La tentación es dejar de mirar lo que incomoda.'),
      buckets('¿Qué te dice cada hallazgo del diario?', ['Hay que revisar el sistema', 'Hay que seguir mejor el plan'], [['Sigues todas las reglas y, tras 100 operaciones, la esperanza sale negativa', 0], ['Pierdes sobre todo en las operaciones que hiciste sin señal', 1], ['Mueves el stop en contra y las pérdidas crecen', 1], ['Aplicas bien las reglas, pero los costes se comen lo que ganas', 0]], 'Si cumples el plan y aun así pierdes, el problema es el sistema. Si pierdes cuando te lo saltas, el sistema funciona: lo que falla es la disciplina. Confundirlos lleva a cambiar un plan que estaba bien.'),
    ], { source: '10.8', minutes: 6, retire: [2, 3, 4, 6, 7, 8] }),

    lesson('u26l3', 'Rachas de pérdidas y drawdown', [
      story('Siete pérdidas seguidas', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Tengo 120 operaciones en mi diario, con esperanza positiva.'),
        say('laura', 'Y ahora llevo **7 pérdidas seguidas**. Mi sistema ya no funciona.'),
        choose('¿Qué debería hacer Laura?', [
          opt('Cambiar de sistema', 'bad', say('lumi', 'Con un 40 % de acierto, 7 seguidas es la racha típica en 100 operaciones.')),
          opt('Seguir el plan y revisar que aplica bien las reglas', 'good', say('lumi', '¡Bien! Si no se ha saltado nada, deja que la estadística trabaje.')),
          opt('Doblar el riesgo para recuperar antes', 'bad', say('lumi', 'Si la racha sigue, el agujero se hace mucho más hondo.')),
        ]),
        say('lumi', 'Acertando el 50 %, la racha típica en 100 operaciones es de **6** seguidas.'),
        say('laura', 'Si cambio tras cada racha mala, nunca sabré si alguno funcionaba.'),
      ]),
      play({
        title: 'Diez pérdidas seguidas',
        intro: 'Las rachas son normales: con un 40 % de acierto, casi la mitad de las veces hay **8 o más pérdidas seguidas** en 100 operaciones. ¿Cuánto aguanta tu cuenta?',
        widget: { kind: 'position', account: 10000, riskPct: 5, stopPct: 5, entry: 30, maxRisk: 10, maxStop: 15 },
        predict: {
          prompt: 'Arriesgas un 5 % por operación. Tras 10 pérdidas seguidas, ¿cuánto queda de tus 10.000 €?',
          options: ['Unos 9.500 €', 'Unos 6.000 €', 'Nada: lo pierdes todo'],
          answer: 1,
          why: 'Quedan **5.987 €**: cada pérdida es un 5 % de lo que queda. Con un 1 %, quedarían 9.044 €.',
        },
        goal: { text: 'Busca el riesgo con el que, tras 10 pérdidas, aún te quedan más de 9.000 €.', when: [when('after10', '>=', 9000)] },
        insight: 'Con un **1 %**, 8 pérdidas seguidas son un −7,7 %; con un 5 %, un −33,7 %. **Arriesga poco para poder atravesar las rachas.**',
        lumi: [
          { when: when('after10', '>=', 9000), say: 'Así una racha mala no te saca del juego.', mood: 'HAPPY' },
          { when: when('riskPct', '>=', 5), say: 'Con este riesgo, una racha normal se lleva un buen trozo.', mood: 'WORRIED' },
          { say: 'Baja el riesgo por operación', mood: 'THINKING' },
        ],
      }),
      key('El drawdown', 'Es la caída de la cuenta desde su máximo hasta el mínimo siguiente. Cuesta más recuperarla que perderla: tras un −15 % hay que ganar un **17,6 %**; tras un −35 %, casi un **54 %**.\n\nRegla del plan de ejemplo: si la cuenta cae un 10–15 % desde su máximo, **reduces el riesgo a la mitad** y revisas.', 'Las rachas son estadística: arriesga poco para poder atravesarlas.', 'Pruébalo: busca en el historial de tu Cartera tu racha más larga de pérdidas.'),
    ], [
      single('Con un sistema que acierta el 50 %, ¿es raro encadenar 6 pérdidas seguidas en 100 operaciones?', ['Sí, casi imposible', 'No, es lo habitual', 'Solo pasa con sistemas malos'], 1, 'Es la racha más larga típica en 100 operaciones.'),
      num('Arriesgas un 1 % por operación y encadenas 8 pérdidas. ¿Cuánto cae tu cuenta? (redondea a un decimal)', 7.7, '%', '0,99⁸ ≈ 0,923 → caída del 7,7 %.', 2),
      num('Ahora arriesgando un 5 % por operación: 8 pérdidas seguidas. ¿Cuánto cae la cuenta? (redondea a un decimal)', 33.7, '%', '0,95⁸ ≈ 0,663 → caída del 33,7 %. La misma racha, cuatro veces más daño.', 2),
      match('Empareja el riesgo por operación con la caída tras 8 pérdidas seguidas.', [['1 % por operación', '−7,7 %'], ['2 % por operación', '−14,9 %'], ['5 % por operación', '−33,7 %'], ['10 % por operación', '−57 %']], 'Caída = 1 − (1 − riesgo)⁸. Con un 10 %, una racha normal se lleva más de la mitad.'),
      num('Tu cuenta cae un 15 % desde su máximo. ¿Cuánto tienes que ganar para volver a él? (redondea a un decimal)', 17.6, '%', '1 ÷ 0,85 − 1 ≈ 0,176 → +17,6 %.', 2),
      scenario('Laura lleva 120 operaciones registradas con esperanza positiva. Ahora encadena 7 pérdidas seguidas. ¿Qué hace?', [['Cambia de sistema: este ya no funciona', 'Con un 40 % de acierto, 7 seguidas es la racha típica. Cambiar ahora es tirar un sistema que funciona.'], ['Sigue su plan con el mismo riesgo y revisa que está aplicando bien las reglas', 'Bien: comprueba que no se ha saltado nada y deja que la estadística haga su trabajo.'], ['Dobla el riesgo para recuperar antes', 'Si la racha sigue, el agujero se hace mucho más hondo.']], 1, 'Una racha dentro de lo esperado no es motivo para abandonar un sistema con muchas operaciones detrás.'),
      scenario('La cuenta de Bruno cae un 15 % desde su máximo. ¿Qué dice el plan de ejemplo?', [['Doblar el riesgo para recuperar', 'Es la reacción más común y la más peligrosa.'], ['Reducir el riesgo a la mitad y revisar el plan', 'Así protege el capital mientras analiza qué está pasando.'], ['Dejar de usar stops', 'Sin stops, la caída podría ser mucho mayor.']], 1, 'Cuando la cuenta cae, primero se protege; después se analiza.'),
      tf('Ocho pérdidas seguidas demuestran que un sistema ha dejado de funcionar.', false, 'Con un 40 % de acierto, casi la mitad de las veces aparecen rachas de 8 o más en 100 operaciones.'),
      timed(single('Rápido: con un 40 % de acierto, ¿cuál es la racha de pérdidas típica en 100 operaciones?', ['2 seguidas', '7 seguidas', '20 seguidas'], 1, 'Y casi la mitad de las veces, 8 o más.'), 12),
      fill('La caída de la cuenta desde su máximo hasta el mínimo siguiente se llama ____.', 'drawdown', ['spread', 'pay-out', 'apalancamiento'], 'Es la medida que mejor refleja el dolor real de una estrategia.'),
      simTrade('Vienes de cuatro pérdidas seguidas, todas dentro del plan. Cuenta de 10.000 € y riesgo máximo del 1 %, como siempre. Elige stop e importe.', 'lvl-8', 'Tras una racha, el riesgo es el mismo de siempre: ni más para recuperar ni menos por miedo. Así cada operación cuenta igual en tus estadísticas.'),
      buckets('¿Es una racha normal o una señal para revisar el plan?', ['Racha normal: sigue el plan', 'Señal para revisar'], [['7 pérdidas seguidas con un 40 % de acierto, siguiendo todas las reglas', 0], ['La cuenta cae un 15 % desde su máximo', 1], ['6 pérdidas seguidas acertando el 50 %, en 100 operaciones', 0], ['Tras 100 operaciones, la esperanza después de costes es negativa', 1]], 'Las rachas dentro de lo esperado no dicen nada del sistema. Un drawdown del 15 % pide reducir el riesgo y revisar, y una esperanza negativa con muchas operaciones dice que no hay ventaja. Lo tentador es cambiar de sistema en cada racha.'),
    ], { source: '10.6', minutes: 6, retire: [1, 2, 4, 5, 7, 8] }),

    lesson('u26l4', 'Del simulador al dinero real', [
      play({
        title: '¿Talento o suerte?',
        intro: '1.000 personas operan **sin ninguna ventaja**: cada operación es cara o cruz. Empiezan con 15 operaciones cada una.',
        widget: { kind: 'coinflip', traders: 1000, trades: 15, maxTrades: 200, fee: 0, stake: 100, win: 1 },
        predict: {
          prompt: 'Nadie tiene ventaja. Tras 15 operaciones, ¿alguno parecerá un genio?',
          options: ['No: sin ventaja, nadie destaca', 'Sí: alguno tendrá un resultado espectacular', 'Todos acabarán igual'],
          answer: 1,
          why: 'El más afortunado gana **1.100 €**: acertó 13 de 15 lanzando una moneda.',
        },
        goal: { text: 'Sube hasta 100 operaciones cada uno y mira cuántos pierden.', when: [when('trades', '>=', 100)] },
        insight: 'Con **15 operaciones**, la suerte se parece mucho al talento. Hacen falta **50–100 operaciones** registradas, y mirar la esperanza después de costes.',
        lumi: [
          { when: when('trades', '>=', 100), say: 'Con más operaciones, la suerte se reparte: cerca de la mitad pierde.', mood: 'THINKING' },
          { when: when('trades', '<=', 20), say: 'Mira al mejor: parece un genio, y solo ha tenido suerte.', mood: 'THINKING' },
          { say: 'Sube las operaciones de cada uno', mood: 'HAPPY' },
        ],
      }),
      story('12 de 15', [{ id: 'raul', name: 'Raúl' }], [
        say('raul', '¡He ganado 12 de mis 15 primeras operaciones!'),
        say('raul', 'Voy a arriesgar un 10 % en cada una. Mi sistema funciona.'),
        choose('¿Qué le dices a Raúl?', [
          opt('Adelante: los números hablan', 'bad', say('lumi', 'Con un 10 %, 6–8 pérdidas seguidas se llevan entre la mitad y dos tercios.')),
          opt('Sigue con un 1 % y registra 50–100 operaciones', 'good', say('lumi', '¡Eso! Con más muestra y costes incluidos, sabrá si tiene ventaja.')),
          opt('Pasa ya al dinero real con todo', 'bad', say('lumi', 'Con dinero real se aprende quién eres. Empieza pequeño.')),
        ]),
        say('lumi', 'Ajustar el sistema hasta que el pasado salga perfecto tampoco vale: es **sobreoptimizar**.'),
        say('raul', 'Vale: más operaciones, mismas reglas y riesgo pequeño.'),
      ]),
      key('Las cuatro fases', '1. **Prueba histórica:** 50–100 señales con su resultado.\n2. **Fuera de muestra:** otros activos u otro periodo, sin cambiar las reglas.\n3. **Simulador en tiempo real:** 2–3 meses como mínimo.\n4. **Dinero real poco a poco:** una fracción del capital y la mitad del riesgo.\n\nSi tras 100 operaciones tu esperanza después de costes es negativa o casi cero, no tienes ventaja. No es un fracaso: es información.', 'Un sistema no está probado hasta que funciona en datos nuevos y con suficientes operaciones.', 'Pruébalo: cuenta en el historial de tu Cartera cuántas operaciones llevas: ¿llegas a 50?'),
    ], [
      order('Ordena las fases para validar un sistema.', ['Prueba histórica', 'Prueba fuera de muestra', 'Simulador en tiempo real', 'Dinero real en pequeño'], 'Cada fase elimina un tipo de autoengaño antes de arriesgar dinero.'),
      tf('Si ganas 12 de tus 15 primeras operaciones, tu sistema está probado.', false, 'Quince operaciones son una muestra demasiado pequeña: pueden ser suerte.'),
      tf('Ajustar los parámetros hasta que el pasado salga perfecto mejora los resultados futuros.', false, 'Eso es sobreoptimizar: el sistema se adapta al ruido del pasado y suele fallar después.'),
      scenario('Raúl ha ganado 12 de sus 15 primeras operaciones y quiere pasar a arriesgar un 10 % por operación «porque su sistema funciona». ¿Qué le dirías?', [['Adelante, los números hablan', 'Con un 10 %, una racha normal de 6–8 pérdidas le haría perder entre la mitad y dos tercios de la cuenta.'], ['Que siga con un 1 % y registre 50–100 operaciones antes de sacar conclusiones', 'Bien: con más muestra y la esperanza calculada después de costes sabrá si tiene ventaja.'], ['Que use apalancamiento para aprovechar la racha', 'Las rachas buenas se acaban; el apalancamiento haría que la mala le saque del juego.']], 1, 'Muestra pequeña + riesgo alto es la combinación más peligrosa.'),
      scenario('Marta ha superado las tres primeras fases y va a usar dinero real. ¿Cómo empieza?', [['Con todo el capital previsto y el mismo riesgo del simulador', 'Las emociones reales son otras: mejor descubrirlas con poco dinero en juego.'], ['Con una fracción pequeña del capital y la mitad del riesgo por operación', 'Bien: si las estadísticas reales se parecen a las del simulador, aumenta poco a poco.'], ['Con el doble de riesgo para recuperar el tiempo perdido', 'No hay tiempo perdido: hay prisa, y la prisa es mala consejera.']], 1, 'El paso al dinero real se da en pequeño y se amplía solo con datos.'),
      chat(['En el simulador he ganado un 20 % este mes 🏆', '¿Ya puedo meter mis ahorros?'], '¿Qué le respondes a Lumi?', [['¡Claro, ya estás preparada!', 'Un mes es muy poco… y con dinero real el miedo y la prisa cambian cómo opero.'], ['Primero más operaciones registradas; luego, una parte pequeña y con la mitad del riesgo', 'Vale: 100 operaciones en el diario, esperanza tras costes y empezar con poco.'], ['Mejor con un préstamo, así ganas más', 'Con deuda, una racha mala puede ser un problema serio.']], 1, 'Un buen mes en el simulador es un punto de partida, no una prueba.'),
      match('Empareja cada trampa estadística con su descripción.', [['Sobreoptimización', 'Ajustar parámetros hasta que el pasado salga perfecto'], ['Muestra pequeña', 'Sacar conclusiones con 15 operaciones'], ['Sesgo de supervivencia', 'Probar solo con empresas que siguen existiendo'], ['Sesgo retrospectivo', 'Ver clarísima en el pasado una señal que en directo no lo era']], 'Todas hacen que un sistema parezca mejor de lo que es.'),
      timed(tf('Con dinero real, las emociones suelen pesar más que en el simulador.', true, 'Por eso se empieza con poco: para descubrir cómo reaccionas de verdad.'), 10),
      num('Vas a empezar con 2.000 € reales y la mitad de tu riesgo habitual del 1 %. ¿Cuánto arriesgas por operación?', 10, '€', 'Mitad del 1 % = 0,5 %. 2.000 × 0,005 = 10 €.'),
      simTrade('Primera operación «en pequeño»: tu cuenta es de 2.000 € y, como empiezas, arriesgas como máximo un 0,5 %. Elige stop e importe.', 'lvl-7', 'Con la mitad del riesgo habitual, una racha mala al empezar con dinero real no te saca del juego mientras compruebas si tus estadísticas se parecen a las del simulador.', { cash: 2000, maxRiskPct: 0.5 }),
      multi('¿Qué cambia al pasar del simulador al dinero real? Marca todas.', ['Las emociones al ver pérdidas reales', 'El deslizamiento al ejecutar órdenes', 'Los impuestos sobre las ganancias', 'Las matemáticas de la esperanza'], [0, 1, 2], 'Las matemáticas son las mismas; lo que cambia es cómo reaccionas, los costes reales y Hacienda.'),
    ], { source: '10.9', minutes: 6, retire: [1, 2, 3, 7, 8] }),
  ],
})
