import 'server-only'
// Sección 9 · Unidad 28 · Emociones y hábitos (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/11 (11.4, 11.6, 11.7), 04 (4.2) y 01 (1.7); clase antigua course/u11.ts.
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, point, say, scenario, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u28', order: 28, title: 'Emociones y hábitos', description: 'Miedo, avaricia, venganza y exceso de operaciones: reglas para que no decidan por ti',
  lessons: [
    lesson('u28l1', 'Miedo y avaricia', [
      // Auditoría RED-12 y RED-34: cada episodio histórico se vive en una sola clase. Aquí va otra serie real (Yahoo Finance);
      // las cifras del texto están calculadas sobre `charts.json`.
      mission({
        title: 'Vive el lunes negro de 1987',
        intro: 'Junio de 1987. Tienes **10.000 €** en el S&P 500 para dentro de muchos años. Datos reales, día a día. Puedes vender cuando quieras.',
        widget: { kind: 'crash', series: 'series-crash-1987', amount: 10000 },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'El 19 de octubre de 1987 cayó un **20,5 %** en un solo día, la mayor caída diaria de su historia, y en menos de dos años volvió a su máximo. **El momento de más miedo suele ser el de más oportunidad**, y el pánico pide justo lo contrario.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -20), say: 'Los telediarios solo hablan de pánico. ¿Aguantas?', mood: 'WORRIED' },
          { when: when('drop', '>=', 5), say: 'Ya estás por encima de lo que pusiste.', mood: 'HAPPY' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      story('Te estás quedando atrás', [{ id: 'sergio', name: 'Sergio' }], [
        note('Noviembre de 2021. Bitcoin está en máximos y sale en todos los telediarios.'),
        say('sergio', '¡Yo ya he doblado lo que metí!'),
        say('sergio', '¿Tú aún no estás dentro? Te estás quedando atrás.'),
        choose('¿Qué haces?', [
          opt('Meto todos mis ahorros antes de que suba más', 'bad', say('lumi', 'Es avaricia y FOMO en pleno pico.')),
          opt('Respeto mi plan y mi límite de especulación', 'good', say('lumi', '¡Bien! Si algo entra, es la parte pequeña que podrías perder entera.')),
          opt('Pido un préstamo para entrar fuerte', 'bad', say('lumi', 'Deuda en plena euforia: la peor combinación posible.')),
        ]),
        say('lumi', 'Bitcoin cayó cerca de un **75 %** en el año siguiente.'),
        say('lumi', 'El momento de más euforia suele ser el de **más riesgo**.'),
      ]),
      key('El ciclo emocional', 'Optimismo → entusiasmo → **euforia** (máximo riesgo) → ansiedad → negación → miedo → **pánico y capitulación** (máxima oportunidad) → desesperanza → esperanza…\n\nNo se trata de adivinar el techo o el suelo: nadie lo hace de forma fiable. Se trata de que el miedo o la avaricia no cambien un plan escrito en calma.', 'Los inversores tienden a comprar en la euforia y vender en el pánico: justo al revés de lo que conviene.', 'Pruébalo: pon una alerta de caída en tu ETF y decide hoy qué harás.'),
    ], [
      order('Ordena esta parte del ciclo emocional del mercado.', ['Optimismo', 'Euforia', 'Ansiedad', 'Miedo', 'Pánico'], 'El máximo riesgo está en la euforia; la máxima oportunidad, en el pánico.'),
      point('Así iba el S&P 500 en la caída del covid. Toca el día de máximo pánico (el cierre más bajo).', 'hist-covid', 'min', 'Ese suelo de marzo de 2020 fue el peor momento para vender: el índice tardó unos 5 meses en volver a su máximo.'),
      upDown('25 de marzo de 2020: el S&P 500 acaba de caer un 34 % en un mes y los telediarios solo hablan de pánico. ¿Qué hizo en los meses siguientes?', 'hist-covid', 'Quien vendió en el pánico cristalizó la pérdida y se perdió la recuperación. El miedo grita más fuerte justo cerca de los suelos.', 'los meses siguientes'),
      trend('Gráfico real de una caída. ¿Qué tendencia ves?', 'trend-down-7', 'Bajista', 'Máximos y mínimos cada vez más bajos: es el terreno del miedo, donde más gente vende sin plan.'),
      scenario('Marzo de 2020. Tu fondo indexado de largo plazo cae un 30 % y tu grupo de amigos dice que «esto se va a cero». ¿Qué haces?', [['Vendo todo para no perder más', 'Vendes en el pánico: el índice volvió a máximos en unos 5 meses y tú te lo pierdes.'], ['Releo mi plan y sigo con mis aportaciones', 'Bien: tu plan ya preveía caídas. Tus aportaciones compraron barato.'], ['Paso todo a una sola acción que «ha caído más»', 'Cambiar de plan en pleno pánico, y concentrando, multiplica el riesgo.']], 1, 'El pánico pide vender; un plan escrito en calma te sostiene.'),
      scenario('Noviembre de 2021. Todo el mundo habla de criptos, tus amigos presumen de ganancias y sientes que «te estás quedando atrás». ¿Qué haces?', [['Meto todos mis ahorros antes de que suba más', 'Es avaricia y FOMO en pleno pico. Bitcoin cayó cerca de un 75 % en el año siguiente.'], ['Respeto mi límite de especulación y mi plan', 'Bien: si algo entra, entra con la parte pequeña que podrías perder entera.'], ['Pido un préstamo para entrar fuerte', 'Deuda en plena euforia: la peor combinación posible.']], 1, 'La euforia pide más; tus límites escritos dicen cuánto como máximo.'),
      single('¿En qué fase del ciclo suele estar el máximo riesgo?', ['En la euforia', 'En el pánico', 'En la desesperanza'], 0, 'Cuando todos están dentro y nadie ve riesgos, los precios suelen estar más altos de lo que justifica el valor.'),
      timed(tf('Lo habitual es que los inversores compren en el pánico y vendan en la euforia.', false, 'Suelen hacer justo lo contrario: comprar en la euforia y vender en el pánico.'), 10),
      match('Empareja cada momento de una operación con la emoción típica.', [['Antes de entrar', 'Prisa, FOMO'], ['La operación va en contra', 'Miedo, negación'], ['Tras una pérdida', 'Rabia, ganas de recuperar'], ['Tras varias ganancias', 'Euforia, exceso de confianza']], 'Conocer la emoción de cada momento te deja preparar la regla antes.'),
      buckets('¿Es miedo o es avaricia?', ['Miedo', 'Avaricia'], [['Vender todo tras un titular alarmante', 0], ['Subir el riesgo porque «estoy en racha»', 1], ['Quitar el stop porque «no puede bajar más»', 0], ['Entrar en algo que ha subido un 200 % para no quedarte fuera', 1], ['Cerrar una ganancia pequeña por pánico a devolverla', 0]], 'Las dos emociones empujan a saltarse el plan, en direcciones opuestas.'),
    ], { source: '11.6', minutes: 6, retire: [1, 2, 4, 5, 7] }),

    lesson('u28l2', 'Operar por venganza', [
      story('Tres pérdidas antes de comer', [{ id: 'ana', name: 'Ana' }], [
        say('ana', 'Tres pérdidas seguidas esta mañana. Todas dentro de mi plan.'),
        say('ana', 'Estoy que echo humo. Veo otra oportunidad y voy con el triple.'),
        choose('¿Qué le dices a Ana?', [
          opt('Venga, a por la revancha', 'bad', say('lumi', 'Es operar por **venganza**: si falla, en una tarde pierde lo de un mes.')),
          opt('Para por hoy y vuelve mañana con el tamaño normal', 'good', say('lumi', '¡Eso! Tres pérdidas son una racha normal. Lo raro es dejar que opere la rabia.')),
          opt('Quita los stops para que no salten más', 'bad', say('lumi', 'Sin stop, la siguiente pérdida no tiene límite.')),
        ]),
        say('lumi', 'El mercado no sabe que has perdido. No te debe nada.'),
        say('ana', 'Vale. Apago la pantalla y lo apunto en el diario.'),
      ]),
      play({
        title: 'Lo que pide la rabia',
        intro: 'Cuenta de **10.000 €**. Tras tres pérdidas de **100 €**, la rabia pide arriesgar **600 €** en la siguiente.',
        widget: { kind: 'position', account: 10000, riskPct: 6, stopPct: 5, entry: 30, maxRisk: 10, maxStop: 15 },
        predict: {
          prompt: 'Si esa cuarta operación también sale mal, ¿cuánto has perdido hoy en total?',
          options: ['300 €', '600 €', '900 €'],
          answer: 2,
          why: '3 × 100 + 600 = **900 €**: un 9 % de la cuenta en una tarde. Parando tras la tercera, habrían sido 300 €.',
        },
        goal: { text: 'Vuelve al riesgo de tu plan: un 1 % por operación.', when: [when('riskPct', '==', 1)] },
        insight: '**El riesgo por operación es siempre el mismo**, ganes o pierdas. Tras una pérdida, la siguiente operación tiene las mismas probabilidades que si vinieras de ganar.',
        lumi: [
          { when: when('riskPct', '<=', 1), say: 'Así, ganes o pierdas, el riesgo es siempre el mismo.', mood: 'HAPPY' },
          { when: when('after10', '<=', 6000), say: 'Con este riesgo, 10 pérdidas seguidas se llevan un 40 % o más.', mood: 'WORRIED' },
          { say: 'Baja el riesgo a lo que dice tu plan', mood: 'THINKING' },
        ],
      }),
      key('La regla preparada', '**«Tras 3 pérdidas seguidas, paro el resto del día.»**\n\nY además:\n• El riesgo por operación es siempre el mismo.\n• Si pierdes un 6 % en un mes, paras hasta el mes siguiente.\n• Apuntas en el diario cómo te sentías.', 'Tras una pérdida, la mejor decisión suele ser no tomar ninguna más ese día.', 'Pruébalo: revisa tu historial y mira qué hiciste justo después de tu última pérdida.'),
    ], [
      tf('Después de varias pérdidas, subir el tamaño de la siguiente operación ayuda a recuperar sin más riesgo.', false, 'Subes el riesgo justo cuando peor estás decidiendo. Si vuelve a salir mal, el agujero se duplica.'),
      scenario('Ana ha perdido tres operaciones seguidas esta mañana, todas dentro de su plan. Está enfadada y ve otra «oportunidad». ¿Qué hace?', [['Entra con el triple de tamaño para recuperarlo todo', 'Es operar por venganza: si falla, en una tarde pierde lo de un mes.'], ['Para el resto del día, apunta cómo se siente y vuelve mañana con el tamaño normal', 'Bien: las tres pérdidas son una racha normal. Lo que no es normal es dejar que la rabia opere.'], ['Quita los stops para que no salten más', 'Sin stop, la siguiente pérdida no tiene límite.']], 1, 'La regla de las 3 pérdidas existe para este momento exacto.'),
      chat(['Hoy he perdido 3 veces seguidas 😡', 'Ahora voy con todo, me lo debe el mercado.'], '¿Qué le dices a Lumi?', [['Venga, a por la revancha', 'El mercado no sabe que has perdido. Con rabia y el triple de tamaño, lo más probable es perder más.'], ['Para por hoy: eso es operar por venganza', 'Uff, tienes razón. Apago la pantalla, lo apunto en el diario y mañana vuelvo con el 1 %.'], ['Cambia de activo y sigue', 'Cambiar de activo no cambia el estado de ánimo con el que decides.']], 1, 'Tras una racha mala, parar es una decisión profesional, no una derrota.'),
      chat(['Ayer perdí 300 € y hoy he recuperado 50 € 😌', 'Si subo el tamaño, lo recupero todo esta tarde.'], '¿Qué le contestas?', [['Buena idea, ya estás en racha', 'Ganar 50 € no cambia las probabilidades de la siguiente operación.'], ['El tamaño no depende de lo que perdiste ayer: sigue con tu riesgo fijo', 'Vale. Si mi sistema tiene ventaja, se recupera con tiempo, no con prisa.'], ['Recupéralo con apalancamiento', 'El apalancamiento solo acelera lo que pase, y la prisa suele hacer que sea malo.']], 1, 'Recuperar pérdidas a la fuerza es la forma más rápida de agrandarlas.'),
      num('Cuenta de 10.000 €. Pierdes tres operaciones de 100 € y, por rabia, arriesgas 600 € en la cuarta, que también pierdes. ¿Cuánto has perdido en total?', 900, '€', '3 × 100 + 600 = 900 €: un 9 % de la cuenta en una tarde. Con la regla de parar, habrían sido 300 €.'),
      order('Ordena qué hacer después de tres pérdidas seguidas.', ['Apagar la pantalla', 'Anotar en el diario qué pasó y cómo te sentías', 'Revisar si las operaciones siguieron el plan', 'Volver otro día con el tamaño normal'], 'Primero cortar, luego registrar, luego analizar y, por último, volver sin cambiar el riesgo.'),
      timed(tf('Tras una pérdida, la siguiente operación tiene más probabilidades de salir bien.', false, 'Eso es la falacia del jugador: cada operación es casi independiente de la anterior.'), 10),
      multi('¿Qué señales indican que estás operando por venganza? Marca todas.', ['Entras sin que se cumpla tu señal', 'Subes el tamaño para recuperar', 'Sientes rabia o prisa', 'Sigues tu plan con el riesgo habitual'], [0, 1, 2], 'Seguir el plan con el riesgo habitual es justo lo contrario.'),
      fill('Regla preparada: tras ____ pérdidas seguidas, paro el resto del día.', '3', ['10', '20', '50'], 'Es la regla del manual: corta la espiral antes de que crezca.'),
      single('¿Qué tiene en común operar por venganza con la aversión a la pérdida?', ['Las dos nos hacen asumir más riesgo para no aceptar una pérdida', 'Las dos reducen el riesgo', 'No tienen nada en común'], 0, 'Cuando perdemos, nos volvemos más arriesgados: «doblo para recuperar».'),
    ], { source: '11.6', minutes: 6, retire: [0, 1, 2, 4, 6] }),

    lesson('u28l3', 'Operar demasiado', [
      story('20 operaciones a la semana', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Hago 20 operaciones a la semana. Si no opero, no gano.'),
        say('bruno', 'Mi diario dice que antes de costes casi empato… y después pierdo.'),
        choose('¿Qué debería cambiar Bruno?', [
          opt('Operar aún más para compensar', 'bad', say('lumi', 'Más operaciones, más costes. El agujero crece.')),
          opt('Quedarse solo con las pocas que cumplen su plan', 'good', say('lumi', '¡Eso! Menos operaciones, mejor elegidas, y los costes dejan de comérselo todo.')),
          opt('Pasarse a algo más volátil', 'ok', say('lumi', 'Más volatilidad no da ventaja: solo agranda las pérdidas.')),
        ]),
        say('lumi', 'Haz su cuenta: 20 operaciones a la semana son más de **1.000 al año**, y cada una paga comisión y *spread*.'),
        say('lumi', 'Para ganar, primero tiene que recuperar todos esos peajes. Ya viste en «Exceso de confianza» lo que les pasa a quienes más operan.'),
      ]),
      // Antes: la pieza de comisiones de fondos (0,2 % frente a 1,5 %), que no es el coste por operación y ya
      // sale en u10l3 y u30l2 (auditoría CON-18). Ahora: operar sin ventaja pagando 6 € cada vez.
      play({
        title: 'Cada operación paga peaje',
        intro: 'Simulación: 1.000 personas operan **sin ninguna ventaja**, como a cara o cruz. Cada operación paga **6 €** entre comisión y spread. Sube el número de operaciones.',
        widget: { kind: 'coinflip', traders: 1000, trades: 20, maxTrades: 500, fee: 6, stake: 100, win: 1 },
        predict: {
          prompt: 'Con 104 operaciones (2 a la semana durante un año), ¿cuánto ha pagado cada persona en costes?',
          options: ['Unos 60 €', 'Unos 600 €', 'Unos 6.000 €'],
          answer: 1,
          why: '104 × 6 € = **624 €**, gane o pierda. La suerte se reparte; los costes, no.',
        },
        goal: { text: 'Sube las operaciones hasta que pierdan 3 de cada 4.', when: [when('losersPct', '>=', 75)] },
        insight: '**Operar mucho es pagar costes una y otra vez.** Sin ventaja, cuantas más operaciones, más gente acaba en pérdidas: el coste es lo único seguro.',
        lumi: [
          { when: when('losersPct', '>=', 75), say: 'Tres de cada cuatro en pérdidas, y solo por los costes.', mood: 'WORRIED' },
          { when: when('trades', '>=', 100), say: 'Mira la media: cada operación le resta un poco.', mood: 'THINKING' },
          { say: 'Sube las operaciones de cada uno', mood: 'HAPPY' },
        ],
      }),
      key('Lo que te llevas', 'Cuanto más miras el mercado, más movimientos ves que no significan nada, y cada uno parece pedir una decisión.\n\nMenos operaciones, mejor elegidas, con costes bajos. Y para el largo plazo: aportaciones automáticas y revisar la cartera de vez en cuando, no cada día.', 'Cada operación paga costes: operar mucho convierte una ventaja pequeña en pérdida.', 'Pruébalo: deja en Favoritos solo los activos de tu plan y quita el resto.'),
    ], [
      num('Haces 2 operaciones a la semana y cada una te cuesta 6 € entre comisión y spread. ¿Cuánto pagas en un año de 52 semanas?', 624, '€', '2 × 6 × 52 = 624 €.'),
      num('Si tu cuenta es de 5.000 €, ¿qué porcentaje anual se comen esos 624 € de costes? (redondea a un decimal)', 12.5, '%', '624 ÷ 5.000 ≈ 0,125 → 12,5 % al año. Tendrías que ganar eso solo para quedarte igual.', 2),
      single('Según Barber y Odean (2000), ¿qué rentabilidad anual obtuvo el 20 % de hogares que más operaba?', ['Un 11,4 % frente al 17,9 % del mercado', 'Un 25 % frente al 17,9 % del mercado', 'Lo mismo que el mercado'], 0, 'Operar más les costó más de 6 puntos al año.'),
      num('10.000 € a 30 años con un 7 % de rentabilidad: con 0 % de costes llegas a unos 76.123 €; con un 1,5 % de costes, a unos 49.840 €. ¿Cuánto te cuestan los costes?', 26283, '€', '76.123 − 49.840 = 26.283 €: más de un tercio del resultado final.'),
      scenario('Bruno hace 20 operaciones a la semana porque «si no opero, no gano». Su diario dice que antes de costes casi empata y después pierde. ¿Qué cambia?', [['Opera aún más para compensar', 'Más operaciones = más costes. El agujero crece.'], ['Reduce a las pocas operaciones que cumplen su plan', 'Bien: menos operaciones, mejor elegidas, y los costes dejan de comérselo todo.'], ['Cambia a un activo más volátil para ganar más por operación', 'Más volatilidad no arregla un sistema sin ventaja: solo agranda las pérdidas.']], 1, 'Si antes de costes empatas, cada operación de más te hace perder.'),
      tf('Cuantas más operaciones haces, más rentabilidad sueles obtener.', false, 'Los datos de Barber y Odean dicen lo contrario: los que más operaban ganaban menos.'),
      timed(single('Rápido: ¿qué hábito ayuda a operar menos en tu cartera de largo plazo?', ['Mirarla cada hora', 'Automatizar aportaciones y revisarla de vez en cuando', 'Tener notificaciones de cada movimiento'], 1, 'Menos estímulos, menos tentaciones de tocarla.'), 12),
      buckets('¿Es una decisión útil o ruido?', ['Útil', 'Ruido'], [['Rebalancear una vez al año según el plan', 0], ['Vender porque la cartera ha bajado un 1 % hoy', 1], ['Comprar porque un vídeo dice que «hoy explota»', 1], ['Hacer la aportación mensual automática', 0], ['Cambiar de fondo cada mes según el que más subió', 1]], 'Las decisiones útiles salen del plan; el ruido sale de la pantalla.'),
      match('Empareja cada coste con su descripción.', [['Comisión', 'Lo que cobra el bróker por operación'], ['Spread', 'Diferencia entre el precio de compra y el de venta'], ['Financiación', 'Coste diario de mantener una posición apalancada'], ['Impuestos', 'Lo que pagas a Hacienda por las ganancias']], 'Todos crecen con el número de operaciones.'),
      chat(['Me he instalado alertas de precio en 40 acciones 📲', 'Así no me pierdo nada.'], '¿Qué le dices a Lumi?', [['Genial, más información es mejor', 'Más alertas suelen traer más operaciones impulsivas… y más costes.'], ['Cuidado: más estímulos suelen acabar en más operaciones y más costes', 'Tienes razón. Dejo alertas solo para mis stops y objetivos, y el resto lo miro con calma.'], ['Mejor pon 100 alertas', 'Eso es ruido en estado puro.']], 1, 'No necesitas ver cada movimiento: necesitas actuar solo cuando lo dice tu plan.'),
      scenario('Tu fondo indexado de largo plazo baja un 1 % un martes. Llevas tres días abriendo la app cada hora. ¿Qué haces?', [['Vendo hoy y recompro cuando baje más', 'Pagas costes dos veces y tienes que acertar dos momentos. Lo normal es fallar alguno.'], ['No lo toco: sigo con mis aportaciones y lo reviso de vez en cuando', 'Bien: un 1 % en un día es ruido para un plan de años.'], ['Me paso al fondo que más sube hoy', 'Cambiar según lo que sube hoy es perseguir el ruido, y cada cambio paga costes.']], 1, 'Para el largo plazo, un día malo no pide ninguna decisión: cada operación de más paga costes y rara vez mejora el resultado. Lo tentador es «hacer algo» porque lo estás mirando.'),
      multi('¿Qué pagas otra vez cada vez que compras o vendes? Marca todo.', ['La comisión del bróker', 'El spread entre el precio de compra y el de venta', 'Los impuestos, si vendes con ganancias', 'La rentabilidad del índice'], [0, 1, 2], 'Comisión, spread e impuestos se pagan en cada operación: por eso operar mucho se come una ventaja pequeña. La rentabilidad del índice no es un coste: es lo que ganas si no te mueves.'),
    ], { source: '11.4', minutes: 6, retire: [0, 1, 2, 3, 4, 5, 6] }),

    lesson('u28l4', 'Tu sistema anti-sesgos', [
      play({
        title: '¿Compras hoy?',
        intro: 'Antes de cada compra, una lista: plan, motivo en tres frases, tres motivos para equivocarte, stop, tamaño, calma y «¿lo compraría si nadie hablara de ello?».',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Hoy no compro' }, { label: 'La lista me deja' }],
          cards: [
            { icon: 'megaphone', label: 'No sé explicar el motivo sin decir «porque sube»', bin: 0, why: '«Porque sube» no es un motivo: es FOMO.' },
            { icon: 'shield', label: 'No sé dónde pondría el stop', bin: 0, why: 'Sin stop decidido, no sabes cuánto arriesgas.' },
            { icon: 'flame', label: 'Vengo de perder tres operaciones y estoy enfadado', bin: 0, why: 'Con rabia, la lista dice «hoy no».' },
            { icon: 'verified', label: 'Está en mi plan, sé mi stop, el tamaño cumple y estoy tranquilo', bin: 1, why: 'Si todo es «sí», la lista te deja operar.' },
            { icon: 'news', label: 'Todo el mundo habla de ella, pero sin eso no la compraría', bin: 0, why: 'Si solo la quieres porque se habla de ella, es efecto rebaño.' },
            { icon: 'search', label: 'He escrito tres motivos para equivocarme y aun así cumple todo', bin: 1, why: 'Has mirado el otro lado y la idea resiste: adelante, con tu tamaño.' },
          ],
        },
        goal: { text: 'Pasa la lista a las seis situaciones.', when: [when('done', '==', 6)] },
        insight: 'La lista solo funciona si se pasa **antes y entera**. **Si alguna respuesta es «no», no compres hoy.**',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: basta un solo «no» para esperar.', mood: 'THINKING' },
          { say: '¿Compras o esperas? Pasa la lista', mood: 'HAPPY' },
        ],
      }),
      story('Seis de siete', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'He pasado la lista: todo «sí»… menos la pregunta de la calma.'),
        say('pablo', 'Estoy eufórico: he ganado dos operaciones seguidas.'),
        choose('¿Qué hace Pablo?', [
          opt('Compra igual: 6 de 7 está muy bien', 'bad', say('lumi', 'Un solo «no» basta para esperar. Por algo está esa pregunta.')),
          opt('Hoy no compra y mañana lo revisa con calma', 'good', say('lumi', '¡Eso! Si mañana sigue teniendo sentido, la lista dará 7 de 7.')),
          opt('Compra el doble: está en racha', 'bad', say('lumi', 'Euforia y más tamaño: exceso de confianza de manual.')),
        ]),
        say('lumi', 'Los pilotos usan listas aunque sepan volar.'),
      ]),
      key('Revisión mensual', '• ¿He seguido mi plan? ¿En qué operaciones no, y por qué?\n• ¿Mi rentabilidad bate a la de un índice comparable?\n• ¿Qué sesgo he visto en mí este mes?\n\nY pregúntale a Lumi en el modo Sesgos: te hará de abogado del diablo.', 'No puedes eliminar las emociones; puedes impedir que decidan por ti.', 'Pruébalo: pasa la lista entera antes de tu próxima compra del simulador.'),
    ], [
      order('Ordena tu rutina anti-sesgos de una operación.', ['Antes: pasar la lista de comprobación', 'Al entrar: fijar stop y tamaño', 'Durante: no tocar el stop en contra', 'Al salir: anotarla en el diario', 'Cada mes: revisar estadísticas y compararte con un índice'], 'Cada momento tiene su regla: así las emociones no encuentran hueco.'),
      multi('¿Qué preguntas están en la lista antes de comprar? Marca todas.', ['¿Está en mi plan?', '¿Sé dónde está mi stop?', '¿Estoy tranquilo?', '¿Cuánto ha subido esta semana?'], [0, 1, 2], 'Cuánto ha subido alimenta el FOMO, no la decisión.'),
      multi('¿Qué situaciones significan «hoy no compro»? Marca todas.', ['No sé explicar el motivo sin decir «porque sube»', 'No sé dónde pondría el stop', 'Vengo de perder tres operaciones y estoy enfadado', 'Se cumplen mi plan, mi stop y mis límites'], [0, 1, 2], 'Si todo se cumple y estás tranquilo, la lista te deja operar.'),
      chat(['Quiero comprar esta acción ya 🏃', 'Todo el mundo habla de ella.'], 'Lumi te pide que pases la lista. ¿Qué le respondes?', [['No hace falta, se ve clarísimo', 'Cuando «se ve clarísimo» y hay prisa, es justo cuando más falta hace la lista.'], ['Pregunta 7: ¿la comprarías si nadie hablara de ella?', 'Mmm… sinceramente, no. Entonces hoy no compro.'], ['Compra la mitad y luego pasas la lista', 'La lista va antes de comprar: después ya no sirve.']], 1, 'La lista solo funciona si se pasa antes y entera.'),
      chat(['Este mes he ganado un 8 % 😎', 'Pero me salté el plan en 4 operaciones…'], '¿Qué le dices en la revisión mensual?', [['Si has ganado, da igual saltarse el plan', 'Ganar saltándote el plan te enseña a saltártelo. Un día saldrá caro.'], ['Revisa esas 4 operaciones: ¿qué te hizo saltarlo y cómo salieron?', 'Buena idea. Dos fueron por FOMO y una por venganza. Lo anoto como mis sesgos del mes.'], ['Sube el riesgo el mes que viene', 'Eso es exceso de confianza tras un buen mes.']], 1, 'La revisión mensual mira el proceso, no solo el resultado.'),
      match('Empareja cada sesgo con su antídoto.', [['Confirmación', 'Buscar la opinión contraria'], ['Coste hundido', 'Decidir desde hoy, sin mirar lo perdido'], ['FOMO', 'Regla de las 48 horas'], ['Exceso de confianza', 'Medir en el diario y compararte con un índice']], 'Cada sesgo tiene una regla concreta que lo frena.'),
      scenario('Pablo pasa la lista antes de comprar. Todo es «sí» excepto la 6: está eufórico tras ganar dos operaciones. ¿Qué hace?', [['Compra igual, 6 de 7 está muy bien', 'La regla dice que si alguna es «no», no compras hoy. Por algo está la 6.'], ['No compra hoy y lo revisa mañana con calma', 'Bien: si la operación sigue teniendo sentido mañana, la lista dará 7 de 7.'], ['Compra el doble porque está en racha', 'Euforia + más tamaño = exceso de confianza de manual.']], 1, 'La lista no se negocia: un solo «no» basta para esperar.'),
      timed(tf('Si tienes mucha experiencia, ya no necesitas una lista de comprobación.', false, 'Los pilotos la usan aunque sepan volar: la experiencia no elimina los sesgos.'), 10),
      single('¿Qué pregunta de la revisión mensual dice si tu gestión activa compensa?', ['¿Mi rentabilidad bate a la de un índice comparable?', '¿Cuántas operaciones he hecho?', '¿Cuánto tiempo he mirado la pantalla?'], 0, 'Si en varios años no bates al índice, comprar el índice te habría ido mejor.'),
      fill('Si alguna respuesta de la lista es «no», ____ compres hoy.', 'no', ['sí', 'siempre', 'también'], 'Esperar un día casi nunca cuesta; comprar sin pasar la lista, a menudo sí.'),
    ], { source: '11.7', minutes: 6, retire: [2, 6, 7] }),
  ],
})
