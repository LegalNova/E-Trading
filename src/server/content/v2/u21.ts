import 'server-only'
// Sección 7 · Unidad 21 · Soportes, resistencias y figuras (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/09-analisis-tecnico.md (9.1–9.4). Estadísticas de figuras: Bulkowski.
import { buckets, chat, choose, fill, key, lesson, level, match, multi, note, num, opt, order, play, point, say, scenario, simTrade, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u21', order: 21, title: 'Soportes, resistencias y figuras', description: 'Zonas de precio, líneas de tendencia, figuras chartistas y rupturas falsas',
  lessons: [

    lesson('u21l2', 'El cambio de rol', [
      story('El suelo que se volvió techo', [{ id: 'laura', name: 'Laura' }], [
        note('Un soporte en 30 € aguantó un año. Un día, el precio cierra en 27 € con mucho volumen.'),
        say('laura', 'Ahora rebota hasta 30 €. ¡Seguro que vuelve a subir como antes!'),
        choose('¿Qué es lo más probable en 30 €?', [
          opt('Que lo atraviese sin problemas', 'bad', say('lumi', 'Ahora en 30 € hay vendedores: los que compraron en el soporte quieren salir.')),
          opt('Que encuentre venta: el viejo soporte puede hacer de resistencia', 'good', say('lumi', '¡Exacto! Es el **cambio de papel**. No es seguro, pero conviene vigilarlo.')),
          opt('Que el nivel ya no importe', 'ok', say('lumi', 'Al contrario: los niveles rotos importan aún más. Mucha gente los recuerda.')),
        ]),
        say('laura', 'O sea, que lo que era suelo ahora puede ser techo…'),
        say('lumi', 'Y al revés: una resistencia rota suele convertirse en **soporte**.'),
      ]),
      play({
        title: '¿Suelo o techo, después de romper?',
        intro: 'Un nivel roto no desaparece: **cambia de papel**. Coloca cada caso.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Nuevo soporte' }, { label: 'Nueva resistencia' }],
          cards: [
            { icon: 'chart', label: 'Una resistencia rota al alza con volumen', bin: 0, why: 'Lo que antes frenaba las subidas ahora suele sostener las caídas.' },
            { icon: 'candles', label: 'Un soporte perdido con mucho volumen', bin: 1, why: 'Quien compró ahí querrá salir «sin perder» si el precio vuelve: aparece venta.' },
            { icon: 'flag', label: 'El máximo del año, superado con volumen', bin: 0, why: 'Quien vendió en ese techo querrá recomprar si el precio vuelve.' },
            { icon: 'bars', label: 'El mínimo de varios meses, perdido con volumen', bin: 1, why: 'El antiguo suelo suele frenar los rebotes.' },
            { icon: 'target', label: 'Techo de 50 € roto; semanas después, el precio vuelve a 50 €', bin: 0, why: 'Es la vuelta al nivel: si aguanta como suelo, la rotura gana credibilidad.' },
            { icon: 'scale', label: 'Suelo de 30 € roto; el precio rebota hasta 30 €', bin: 1, why: 'Es el caso de Laura: el antiguo suelo hace de techo.' },
          ],
        },
        goal: { text: 'Coloca los seis casos.', when: [when('done', '==', 6)] },
        insight: 'Un soporte roto suele volverse **resistencia**, y una resistencia rota, **soporte**. Lo que antes era techo puede ser el nuevo suelo.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: piensa en quién quiere salir «sin perder» en ese nivel.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Fíjate hacia dónde se rompió cada nivel.', mood: 'HAPPY' },
          { say: 'Coloca cada caso: ¿suelo o techo?', mood: 'HAPPY' },
        ],
      }),
      key('La vuelta al nivel', 'Tras una rotura, el precio a menudo vuelve a **probar** el nivel antes de seguir. Bulkowski lo llama *throwback* si la rotura fue al alza y *pullback* si fue a la baja. En el hombro-cabeza-hombro, por ejemplo, vuelve a la clavicular el **68 %** de las veces.\n\nSi el nivel roto aguanta en la vuelta, la rotura gana credibilidad. Si el precio se mete otra vez dentro con claridad, la rotura era falsa y la idea ha fallado.', 'Un soporte roto suele volverse resistencia, y una resistencia rota, soporte.', 'Lo que antes era techo puede ser el nuevo suelo.'),
    ], [
      single('El precio rompe con fuerza una resistencia en 50 € y semanas después vuelve a 50 €. ¿Qué papel suele jugar ahora ese nivel?', ['Resistencia otra vez', 'Soporte', 'Ninguno'], 1, 'Es el cambio de papel: el antiguo techo suele actuar como suelo.'),
      scenario('Un soporte en 30 € aguantó un año. Hoy el precio cierra en 27 € con mucho volumen. Días después rebota hasta 30 €. Laura tiene acciones y espera que «vuelva a subir como antes». ¿Qué es lo más probable en 30 €?', [['Que lo atraviese sin problemas', 'Puede pasar, pero ahora ahí hay vendedores: los que compraron en el soporte quieren salir sin perder.'], ['Que encuentre venta: el antiguo soporte puede actuar como resistencia', 'Ese es el cambio de papel. No es seguro, pero es lo que conviene vigilar.'], ['Que el nivel ya no importe', 'Los niveles rotos suelen importar todavía más: mucha gente los recuerda.']], 1, 'Un soporte roto con volumen suele convertirse en resistencia.'),
      scenario('Bruno compró tras la rotura de una resistencia en 100 €. El precio sube a 106 € y vuelve a 101 €. ¿Qué hace con lógica?', [['Vende en pánico: todo se ha acabado', 'Volver a probar el nivel roto es muy habitual. Si aguanta por encima de 100 €, la rotura sigue viva.'], ['Vigila si 100 € aguanta como soporte; su stop ya estaba por debajo de esa zona', 'Bien: si el antiguo techo aguanta como suelo, la idea sigue; si cierra claramente dentro, la rotura era falsa.'], ['Compra el triple para promediar', 'Aumentar sin plan en plena duda multiplica el riesgo.']], 1, 'La vuelta al nivel roto es normal; lo que decide es si aguanta.'),
      level('Has comprado al último precio. Coloca el stop donde la idea deja de valer: por debajo del último mínimo relevante.', 'lvl-3', 'STOP', 'Por debajo del mínimo reciente, la estructura que justificaba la compra se rompe.'),
      level('Coloca el objetivo en el máximo anterior, donde antes apareció venta.', 'lvl-17', 'TAKE', 'El máximo anterior es una resistencia: ahí es razonable esperar venta y recoger beneficios.'),
      upDown('Sin nombre ni fecha. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-22', 'Que un nivel cambie de papel es habitual, no seguro. Por eso cada idea lleva un stop al otro lado del nivel.'),
      upDown('Otro gráfico real. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-31', 'Los niveles ayudan a decidir dónde entrar y dónde salir si te equivocas; no adivinan el resultado.'),
      buckets('Tras una rotura, ¿qué papel suele jugar el nivel?', ['Nuevo soporte', 'Nueva resistencia'], [['Resistencia rota al alza', 0], ['Soporte roto a la baja', 1], ['Máximo anual superado con volumen', 0], ['Mínimo de varios meses perdido con volumen', 1]], 'Lo que se rompe hacia arriba suele pasar a sostener; lo que se rompe hacia abajo, a frenar.'),
      timed(tf('Tras romper un nivel, el precio a menudo vuelve a probarlo antes de seguir.', true, 'Es muy habitual: en el HCH, por ejemplo, vuelve a la clavicular el 68 % de las veces.'), 10),
      fill('Cuando el precio rompe al alza y luego vuelve al nivel roto, Bulkowski lo llama ____.', 'throwback', ['pullback', 'squeeze', 'gap'], 'Tras una rotura a la baja, la vuelta se llama pullback.'),
    ], { source: '9.1', minutes: 6, retire: [0, 1, 7, 8] }),

    lesson('u21l3', 'Líneas de tendencia y canales', [
      play({
        title: '¿Buena línea o línea forzada?',
        intro: 'Una **línea de tendencia** une puntos de giro del precio. Clasifica cada una.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Línea alcista válida' }, { label: 'Línea bajista válida' }, { label: 'Forzada o frágil' }],
          cards: [
            { icon: 'chart', label: 'Une dos mínimos crecientes y un tercero la toca', bin: 0, why: 'Dos mínimos crecientes la trazan; el tercer toque la confirma.' },
            { icon: 'candles', label: 'Une tres máximos cada vez más bajos', bin: 1, why: 'Una línea bajista une máximos decrecientes por encima del precio.' },
            { icon: 'warning', label: 'Para encajar, atraviesa varias velas', bin: 2, why: 'Si tienes que forzarla, la línea está en tu cabeza, no en el gráfico.' },
            { icon: 'rocket', label: 'Casi vertical tras subir un 40 % en tres semanas', bin: 2, why: 'Las líneas muy verticales se rompen pronto; las de unos 30–45 grados aguantan más.' },
            { icon: 'bars', label: 'Une dos máximos decrecientes', bin: 1, why: 'Con dos máximos decrecientes ya se puede trazar.' },
            { icon: 'mountain', label: 'Sube con una pendiente moderada y tres toques', bin: 0, why: 'Una pendiente moderada con varios toques es la más sostenible.' },
          ],
        },
        goal: { text: 'Clasifica las seis líneas.', when: [when('done', '==', 6)] },
        insight: 'Una línea **alcista** une mínimos crecientes; una **bajista**, máximos decrecientes. Dos puntos la trazan, el tercero la confirma, y **nunca se fuerza**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: las alcistas van por debajo del precio, por los mínimos.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'Vas bien. Ojo con las que parecen demasiado bonitas.', mood: 'HAPPY' },
          { say: 'Clasifica cada línea', mood: 'HAPPY' },
        ],
      }),
      story('Se rompió la línea', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'La acción ha roto su línea alcista. ¡Esto se acabó, lo vendo todo!'),
        note('El precio sigue por encima de su último mínimo relevante.'),
        choose('¿Qué le dices a Leo?', [
          opt('Que tiene razón: empieza una tendencia bajista', 'bad', say('lumi', 'No siempre: romper la línea puede dar paso solo a un **lateral**.')),
          opt('Que mire también la estructura de máximos y mínimos', 'good', say('lumi', '¡Eso! La rotura de la línea se combina con los máximos y mínimos.')),
          opt('Que redibuje la línea hasta que vuelva a encajar', 'ok', say('lumi', 'Forzar la línea es engañarse. Mejor mirar máximos y mínimos.')),
        ]),
        say('leo', 'Vale, no vendo por una línea. Miro si pierde el último mínimo.'),
        say('lumi', 'Romper la línea es un aviso, no una sentencia.'),
      ]),
      key('Canales y pendiente', 'Una paralela por los máximos de una tendencia alcista forma un **canal**: la parte baja actúa como soporte y la alta, como resistencia.\n\nLas líneas muy verticales se rompen pronto; las de unos **30–45 grados** suelen aguantar más. En gráficos de varios años, usa **escala logarítmica**.', 'Una línea alcista une mínimos crecientes; mientras se respete, la tendencia sigue.', 'Si tienes que forzar la línea para que toque los puntos, la línea está en tu cabeza.'),
    ], [
      single('Una línea de tendencia alcista une…', ['Máximos decrecientes', 'Mínimos crecientes', 'Cierres elegidos al azar'], 1, 'Dos mínimos crecientes la trazan y un tercer toque la confirma.'),
      trend('Fíjate en los mínimos: ¿qué tendencia marcan?', 'trend-up-4', 'Alcista', 'Cada mínimo queda por encima del anterior: se podría trazar una línea alcista por debajo.'),
      trend('Ahora fíjate en los máximos: ¿qué tendencia marcan?', 'trend-down-4', 'Bajista', 'Los máximos son cada vez más bajos: una línea bajista los uniría por encima.'),
      point('Para trazar la línea bajista hace falta el punto de partida: toca el cierre más alto', 'trend-down-2', 'max', 'Es el primer cierre: desde ahí, cada máximo fue más bajo. La línea bajista uniría ese pico con los siguientes máximos.'),
      point('En esta subida, toca el cierre más bajo: el arranque de la línea alcista', 'trend-up-3', 'min', 'Desde ese mínimo, cada caída se quedó más arriba: es el primer apoyo de la línea.'),
      tf('Romper una línea de tendencia alcista significa siempre que empieza una tendencia bajista.', false, 'Puede empezar un lateral. Hay que mirarlo junto a la estructura de máximos y mínimos.'),
      single('¿Qué escala conviene para trazar líneas de tendencia de varios años?', ['Lineal', 'Logarítmica'], 1, 'En lineal, una tendencia exponencial parece romper su línea cuando no lo hace.'),
      fill('Si trazas una paralela por los máximos de una tendencia alcista, obtienes un ____.', 'canal', ['triángulo', 'doji', 'hueco'], 'Dentro del canal, la parte baja actúa como soporte y la alta como resistencia.'),
      timed(single('Rápido: ¿cuántos mínimos crecientes hacen falta, como mínimo, para trazar una línea alcista?', ['Uno', 'Dos', 'Cinco'], 1, 'Dos la trazan; un tercer toque la confirma.'), 10),
      scenario('Ana traza una línea de tendencia casi vertical tras una subida del 40 % en tres semanas. ¿Qué le dices?', [['Perfecto: cuanto más vertical, más fuerte', 'Las líneas muy verticales suelen romperse pronto: una subida así es difícil de sostener.'], ['Que probablemente se romperá pronto, y que romperla no significará el fin de todo', 'Eso: una línea tan vertical se rompe con facilidad, y la rotura puede dar paso solo a un lateral.'], ['Que borre la línea y compre más', 'Ignorar el riesgo de una subida tan vertical no es un plan.']], 1, 'Pendientes de 30–45 grados son más sostenibles; las verticales acaban en correcciones bruscas.'),
    ], { source: '9.2', minutes: 6, retire: [0, 5, 8, 9] }),

    lesson('u21l4', 'Hombro-cabeza-hombro', [
      story('¿Vender antes de la rotura?', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Mira: tras una gran subida, dos hombros y una cabeza. ¡Un hombro-cabeza-hombro de libro!'),
        say('pablo', 'Aún no ha roto la clavicular, pero vendo ya para adelantarme.'),
        choose('¿Qué le dices?', [
          opt('Bien: adelantarse siempre paga', 'bad', say('lumi', 'Sin rotura, la figura no existe: muchas acaban en nuevos máximos.')),
          opt('Que la figura no existe hasta que cierre bajo la clavicular', 'good', say('lumi', '¡Eso! Y aun confirmada, fracasa un **19 %** de las veces.')),
          opt('Que compre más: la figura es alcista', 'bad', say('lumi', 'El HCH normal es bajista. El **invertido**, tras una caída, es el alcista.')),
        ]),
        say('lumi', 'La **línea clavicular** une los mínimos entre los picos. Su rotura confirma la figura.'),
      ]),
      play({
        title: '¿Hay figura o todavía no?',
        intro: 'Tres picos no bastan. Decide qué es cada caso.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'HCH (bajista)' }, { label: 'HCH invertido (alcista)' }, { label: 'Aún no es figura' }],
          cards: [
            { icon: 'mountain', label: 'Tras una subida: tres máximos, el central más alto, y cierre bajo la clavicular', bin: 0, why: 'Todo en orden: subida previa, cabeza más alta y rotura con cierre.' },
            { icon: 'chart', label: 'Tras una caída: tres mínimos, el central más bajo, y cierre sobre la clavicular', bin: 1, why: 'Es la versión alcista: aparece tras una caída y rompe hacia arriba.' },
            { icon: 'eye', label: 'Dos hombros y una cabeza, con el precio aún sobre la clavicular', bin: 2, why: 'Sin rotura, solo es una posibilidad.' },
            { icon: 'candles', label: 'Tres máximos tras una subida y solo una mecha bajo la clavicular', bin: 2, why: 'Una mecha no confirma nada: hace falta un cierre.' },
            { icon: 'search', label: 'Tres mínimos tras una caída, con el precio aún bajo la clavicular', bin: 2, why: 'El invertido también necesita romper su clavicular, hacia arriba.' },
          ],
        },
        goal: { text: 'Clasifica los cinco casos.', when: [when('done', '==', 5)] },
        insight: 'Sin **cierre al otro lado de la clavicular**, no hay figura. Un HCH sin rotura es solo una montaña con forma bonita.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Busca siempre lo mismo: ¿hay cierre al otro lado de la clavicular?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'Muy bien. Fíjate también en lo que pasó antes: ¿subida o caída?', mood: 'HAPPY' },
          { say: 'Lee cada caso y decide', mood: 'HAPPY' },
        ],
      }),
      key('El objetivo y los datos', 'Objetivo clásico: la distancia de la cabeza a la clavicular, proyectada desde la rotura. Cabeza en 120 €, clavicular en 100 €: altura 20 € → objetivo **80 €**. Bulkowski propone uno más prudente, con la mitad de la altura → **90 €**.\n\nSus datos: caída media tras la rotura, **16 %**; fracasa (no cae ni un 5 %), **19 %**; vuelve a la clavicular, **68 %**; alcanza el objetivo clásico, solo el **51 %**.', 'Sin rotura de la clavicular, no hay figura.', 'Un HCH sin rotura es solo una montaña con forma bonita.'),
    ], [
      order('Ordena cómo se forma un hombro-cabeza-hombro.', ['Subida previa', 'Hombro izquierdo', 'Cabeza, más alta', 'Hombro derecho, más bajo que la cabeza', 'Cierre por debajo de la clavicular'], 'La figura solo existe cuando llega el último paso: la rotura de la clavicular.'),
      single('¿Cuándo se confirma un hombro-cabeza-hombro?', ['Al formarse la cabeza', 'Al cerrar por debajo de la línea clavicular', 'Al aparecer el hombro derecho'], 1, 'Antes de la rotura, solo es una posibilidad.'),
      num('Cabeza en 120 € y clavicular en 100 €. ¿Cuál es el objetivo clásico tras la rotura?', 80, '€', 'Altura: 120 − 100 = 20 €. Proyectada desde 100 €: 100 − 20 = 80 €.'),
      num('Cabeza en 120 € y clavicular en 100 €. ¿Cuál es el objetivo prudente de Bulkowski, con la mitad de la altura?', 90, '€', 'Mitad de la altura: 10 €. 100 − 10 = 90 €. Solo el 51 % alcanza el objetivo completo.'),
      num('HCH invertido: cabeza (el mínimo) en 40 € y clavicular en 50 €. ¿Objetivo clásico tras romper al alza?', 60, '€', 'Altura de 10 €, proyectada hacia arriba desde 50 €: 60 €.'),
      point('Antes de buscar hombros, localiza la cumbre: toca el cierre más alto de este tramo', 'trend-flat-1', 'max', 'En un HCH, la cabeza sería ese pico. Pero para hablar de figura harían falta dos hombros más bajos y, sobre todo, la rotura de la clavicular.'),
      tf('Según Bulkowski, casi todos los HCH alcanzan su objetivo clásico.', false, 'Solo el 51 %. Por eso propone un objetivo de la mitad de la altura.'),
      upDown('Nasdaq 100, marzo de 2000, tras años de fuertes subidas. ¿Qué crees que pasó después?', 'hist-dotcom', 'Las figuras de giro se confirman con la rotura de su línea clave, y eso solo se ve después. En la cumbre, nadie tiene aún esa confirmación.', 'los años siguientes'),
      timed(single('Rápido: ¿qué línea une los mínimos entre la cabeza y los hombros?', ['La clavicular', 'La de tendencia alcista', 'La media de 200'], 0, 'La línea clavicular: su rotura confirma la figura.'), 10),
      scenario('Una acción ha formado dos hombros y una cabeza, pero aún no ha roto la clavicular. Pablo quiere vender todo ya «para adelantarse». ¿Qué le dices?', [['Bien: adelantarse siempre paga', 'Sin rotura, la figura no existe: muchas acaban en nuevos máximos.'], ['Que la figura no está confirmada hasta el cierre por debajo de la clavicular', 'Eso: hasta la rotura es solo una posibilidad. Y aun confirmada, fracasa un 19 % de las veces.'], ['Que compre más: la figura es alcista', 'El HCH (no invertido) es una figura bajista: esa idea no tiene sentido.']], 1, 'Sin rotura no hay figura. Anticiparse es apostar por algo que aún no existe.'),
    ], { source: '9.3', minutes: 6, retire: [1, 6, 8, 9] }),

    lesson('u21l5', 'Dobles techos y suelos', [
      story('Dos picos', [{ id: 'ana', name: 'Ana' }], [
        say('ana', 'Dos máximos casi iguales: ¡un doble techo! Vendo antes de que caiga.'),
        note('El precio sigue por encima del mínimo del valle entre los dos picos.'),
        choose('¿Qué error comete Ana?', [
          opt('Ninguno: se adelanta a todos', 'bad', say('lumi', 'Se adelanta a una figura que aún no existe. Muchas son solo pausas.')),
          opt('Anticipa una figura sin confirmar', 'good', say('lumi', '¡Eso! Un doble techo se confirma al **romper el valle**. Antes, son dos picos.')),
          opt('Vende demasiado tarde', 'ok', say('lumi', 'Al revés: vende antes de tener la confirmación.')),
        ]),
        say('lumi', 'Muchos «dobles techos en formación» acaban siendo pausas antes de nuevos máximos.'),
      ]),
      play({
        title: '¿Confirmada o solo posible?',
        intro: 'Doble techo en forma de **M**, doble suelo en forma de **W**. ¿Cuáles están confirmados?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Confirmada' }, { label: 'Solo posible' }],
          cards: [
            { icon: 'mountain', label: 'Dos máximos parecidos y un cierre por debajo del valle', bin: 0, why: 'El doble techo se confirma al romper el mínimo del valle con un cierre.' },
            { icon: 'eye', label: 'Dos máximos parecidos y el precio aún por encima del valle', bin: 1, why: 'Sin rotura del valle, solo tienes dos picos.' },
            { icon: 'chart', label: 'Dos mínimos parecidos y un cierre por encima del máximo intermedio', bin: 0, why: 'El doble suelo se confirma al superar el máximo intermedio.' },
            { icon: 'candles', label: 'Dos mínimos parecidos y una mecha que toca el máximo intermedio', bin: 1, why: 'Una mecha no basta: hace falta un cierre al otro lado.' },
            { icon: 'search', label: 'Forma de W, con el precio a medio camino del máximo intermedio', bin: 1, why: 'Parece un doble suelo, pero aún no ha superado su línea clave.' },
          ],
        },
        goal: { text: 'Clasifica los cinco casos.', when: [when('done', '==', 5)] },
        insight: 'Doble techo (**M**): se confirma al **romper el valle**; doble suelo (**W**), al **superar el máximo intermedio**. Siempre con un cierre, no con una mecha.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate siempre: ¿ha cerrado al otro lado de la línea clave?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! La forma no basta: manda la rotura.', mood: 'HAPPY' },
          { say: 'Lee cada caso: ¿confirmada o solo posible?', mood: 'HAPPY' },
        ],
      }),
      key('El objetivo', 'Objetivo clásico: la altura de la figura, proyectada desde la rotura.\n\nDoble suelo con mínimos en 40 € y máximo intermedio en 50 €. Altura: 10 €. Al superar 50 € con un cierre, el objetivo clásico es **60 €**. Si después vuelve a cerrar claramente por debajo de 50 €, la rotura ha fallado.', 'Sin rotura no hay figura.', 'Dos picos no son un doble techo hasta que el valle se rompe.'),
    ], [
      timed(single('Rápido: forma de M.', ['Doble techo', 'Doble suelo', 'Triángulo'], 0, 'Dos máximos parecidos con un valle en medio.'), 8),
      timed(single('Rápido: ¿cuándo se confirma un doble suelo?', ['Al marcar el segundo mínimo', 'Al superar el máximo intermedio', 'Al subir el volumen'], 1, 'Hasta entonces, solo son dos mínimos.'), 12),
      num('Doble suelo: mínimos en 40 € y máximo intermedio en 50 €. ¿Objetivo clásico tras superar los 50 €?', 60, '€', 'Altura: 50 − 40 = 10 €. Proyectada desde 50 €: 60 €.'),
      num('Doble techo: máximos en 80 € y valle en 72 €. ¿Objetivo clásico tras perder los 72 €?', 64, '€', 'Altura: 80 − 72 = 8 €. Proyectada hacia abajo desde 72 €: 64 €.'),
      scenario('Ana ve un doble techo «casi formado» y vende antes de que el precio rompa el mínimo intermedio. ¿Qué error comete?', [['Ninguno: se adelanta a todos', 'Se adelanta a una figura que aún no existe: muchas acaban siendo pausas antes de nuevos máximos.'], ['Anticipa una figura sin confirmar', 'Eso: sin rotura del valle no hay doble techo, solo dos picos.'], ['Vende demasiado tarde', 'Al contrario: vende antes de tener la confirmación.']], 1, 'Las figuras se confirman con la rotura de su línea clave, no con la forma.'),
      buckets('¿Figura confirmada o solo posible?', ['Confirmada', 'Solo posible'], [['Dos máximos parecidos y un cierre por debajo del valle', 0], ['Dos máximos parecidos y el precio aún por encima del valle', 1], ['Dos mínimos parecidos y un cierre por encima del máximo intermedio', 0], ['Dos mínimos parecidos y una mecha que toca el máximo intermedio', 1]], 'Hace falta un cierre al otro lado de la línea clave. Una mecha no basta.'),
      point('Toca el cierre más bajo de este tramo: en un doble suelo, sería uno de los dos apoyos', 'trend-down-1', 'min', 'Ahí aparecieron compradores y el precio rebotó. Para hablar de doble suelo haría falta un segundo mínimo parecido y superar el máximo intermedio.'),
      upDown('Fíjate en los últimos máximos y mínimos. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-33', 'Una figura a medio formar es solo una hipótesis. Hasta que rompe su línea clave, puede acabar en cualquier lado.'),
      upDown('Otro gráfico real, sin nombre. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-49', 'Buscar M y W en cada gráfico es tentador; el ojo encuentra formas en cualquier parte. Por eso se exige la rotura.'),
      tf('Un doble techo se confirma en cuanto el precio marca el segundo máximo.', false, 'Se confirma al romper el mínimo del valle entre los dos máximos.'),
    ], { source: '9.3', minutes: 6, retire: [0, 1, 4, 5, 9] }),

    lesson('u21l6', 'Triángulos, banderas y rectángulos', [
      play({
        title: '¿Hacia dónde suele romper?',
        intro: 'Las figuras de continuación son pausas del precio. Su forma dice quién aprieta.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Suele romper al alza' }, { label: 'Suele romper a la baja' }, { label: 'Hacia cualquier lado' }],
          cards: [
            { icon: 'chart', label: 'Triángulo ascendente: techo horizontal y mínimos crecientes', bin: 0, why: 'Los compradores aprietan desde abajo contra un techo fijo.' },
            { icon: 'candles', label: 'Triángulo descendente: suelo horizontal y máximos decrecientes', bin: 1, why: 'Los vendedores aprietan desde arriba contra un suelo fijo.' },
            { icon: 'scale', label: 'Triángulo simétrico: máximos más bajos y mínimos más altos', bin: 2, why: 'Nadie domina: decide la rotura.' },
            { icon: 'layers', label: 'Rectángulo: techo y suelo horizontales', bin: 2, why: 'Es un rango lateral: la rotura con volumen marca la dirección.' },
            { icon: 'flag', label: 'Bandera tras un mástil alcista, en mercado alcista', bin: 0, why: 'Según Bulkowski, rompe al alza el 60 % de las veces.' },
          ],
        },
        goal: { text: 'Clasifica las cinco figuras.', when: [when('done', '==', 5)] },
        insight: 'El triángulo **ascendente** y el **descendente** tienen sesgo; el simétrico y el rectángulo dependen de la rotura. El **volumen** suele bajar mientras se forman y subir al romper.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: la línea horizontal es la que alguien defiende. ¿Quién empuja contra ella?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'Bien visto. Ahora, a probarlo con velas reales.', mood: 'HAPPY' },
          { say: 'Clasifica cada figura', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Pausas con velas reales',
        intro: 'Cuatro gráficos reales: ¿ves alguna pausa tras un movimiento fuerte? Decide si sube o baja en las 10 sesiones siguientes.',
        widget: { kind: 'guess', rounds: ['ud-54', 'ud-91', 'ud-93', 'ud-75'] },
        goal: { text: 'Responde las cuatro rondas.', when: [when('done', '==', 4)] },
        insight: 'Aunque veas una bandera de libro, **fracasa casi la mitad de las veces**. Las figuras de continuación dan probabilidades modestas: lo que decides de verdad es cuánto arriesgas.',
        lumi: [
          { when: when('done', '==', 4), say: 'Hecho. Acertar o fallar cuatro rondas dice muy poco.', mood: 'CALM' },
          { when: when('right', '>=', 2), say: 'Vas bien… pero la pausa no dice cómo termina.', mood: 'THINKING' },
          { say: 'Mira las velas y elige: ¿sube o baja?', mood: 'HAPPY' },
        ],
      }),
      key('Banderas y rectángulos', '• **Bandera:** tras un movimiento fuerte y rápido (el **mástil**), unos días en un pequeño rectángulo inclinado contra la tendencia. Dura **menos de 3 semanas**. Si es un pequeño triángulo, es un **banderín**.\n• **Rectángulo:** rango lateral entre un soporte y una resistencia claros.\n\nBulkowski: en mercado alcista, las banderas rompen al alza el **60 %** de las veces, el movimiento medio tras la rotura ronda el **9 %** y **fracasan** (no avanzan ni un 5 %) en torno al **44–45 %**.', 'Las figuras de continuación son el mercado tomando aire, aunque a veces se gira.', 'Una bandera es una pausa para respirar, pero casi la mitad de las veces el corredor se queda sin aire.'),
    ], [
      match('Empareja cada figura con su forma.', [['Triángulo ascendente', 'Techo horizontal y mínimos crecientes'], ['Triángulo descendente', 'Suelo horizontal y máximos decrecientes'], ['Triángulo simétrico', 'Máximos más bajos y mínimos más altos'], ['Rectángulo', 'Techo y suelo horizontales']], 'La forma dice quién aprieta: en el ascendente, los compradores; en el descendente, los vendedores.'),
      match('Empareja cada parte con su definición.', [['Mástil', 'Movimiento fuerte y rápido previo'], ['Bandera', 'Pequeño rectángulo inclinado contra la tendencia'], ['Banderín', 'Pequeño triángulo tras el mástil'], ['Rotura', 'Salida de la figura, mejor con volumen']], 'Mástil, pausa y rotura: así se cuenta una figura de continuación.'),
      buckets('¿Hacia dónde suele romper?', ['Suele romper al alza', 'Suele romper a la baja', 'Hacia cualquier lado'], [['Triángulo ascendente', 0], ['Triángulo descendente', 1], ['Triángulo simétrico', 2], ['Rectángulo sin más contexto', 2]], 'El ascendente y el descendente tienen sesgo; el simétrico y el rectángulo dependen de la rotura.'),
      trend('Un rectángulo es un rango lateral. ¿Qué tendencia tiene este tramo?', 'trend-flat-2', 'Lateral', 'El precio oscila entre un techo y un suelo y termina casi donde empezó: así se ve un rectángulo.'),
      single('Según Bulkowski, ¿qué porcentaje de banderas fracasa (no avanza ni un 5 %) en mercados alcistas?', ['Alrededor del 5 %', 'En torno al 44 %', 'El 90 %'], 1, 'Son figuras de recorrido corto: casi la mitad no llega ni a un 5 %.'),
      tf('El volumen suele bajar mientras se forma un triángulo.', true, 'Y suele subir en la rotura.'),
      upDown('¿Ves alguna pausa tras un movimiento fuerte? ¿Sube o baja en las 10 sesiones siguientes?', 'ud-95', 'Aunque la figura fuera de libro, una bandera fracasa casi la mitad de las veces según Bulkowski. La pausa no dice cómo termina.'),
      upDown('Otro gráfico, sin nombre ni fecha. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-78', 'Las figuras de continuación hablan de probabilidades modestas. La decisión real es cuánto arriesgas si fallan.'),
      timed(single('Rápido: una «bandera» que dura dos meses…', ['Sigue siendo una bandera', 'Es más bien un rectángulo o un canal', 'Es un doji'], 1, 'Las banderas duran menos de 3 semanas.'), 12),
      fill('Una bandera dura normalmente menos de ____ semanas.', '3', ['10', '26', '52'], 'Si dura más, se habla de rectángulo o de canal.'),
    ], { source: '9.4', minutes: 6, retire: [2, 5, 7, 8] }),

    lesson('u21l7', 'Rupturas falsas', [
      story('La rotura de Marta', [{ id: 'marta', name: 'Marta' }], [
        note('Resistencia en 100 €. Hoy el precio llega a 101,50 € durante la sesión.'),
        say('marta', '¡Ha roto! Compro a 101 € antes de que se escape.'),
        note('Al cierre: 99,20 €, con poco volumen.'),
        choose('¿Qué ha pasado?', [
          opt('Ha entrado en una rotura confirmada', 'bad', say('lumi', 'No: cerró por debajo del nivel y sin volumen. Fue una mecha.')),
          opt('Ha comprado una excursión que no se confirmó', 'good', say('lumi', '¡Eso! Sin cierre por encima ni volumen, no hay rotura: es una **ruptura falsa**.')),
          opt('Lo correcto: hay que entrar antes que nadie', 'ok', say('lumi', 'Entrar antes de confirmar es la forma típica de caer en una ruptura falsa.')),
        ]),
        say('marta', '¿Y ahora qué hago?'),
        say('lumi', 'Si tiene stop, el error le cuesta poco. Sin stop, puede quedar atrapada.'),
      ]),
      play({
        title: 'Filtros contra las rupturas falsas',
        intro: 'Quien compra la rotura y el precio vuelve dentro queda **atrapado**. ¿Qué te protege y qué te mete en la trampa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Filtra rupturas falsas' }, { label: 'Te mete en la trampa' }],
          cards: [
            { icon: 'clock', label: 'Esperar un cierre al otro lado del nivel', bin: 0, why: 'Un cierre dice mucho más que una mecha de unas horas.' },
            { icon: 'bars', label: 'Pedir volumen superior a la media', bin: 0, why: 'Con volumen, hay mucha gente detrás del movimiento.' },
            { icon: 'percent', label: 'Exigir que el cierre supere el nivel en un 1–3 %', bin: 0, why: 'Un margen extra deja fuera muchas excursiones.' },
            { icon: 'candles', label: 'Entrar con la primera mecha que asome', bin: 1, why: 'Es justo lo que atrapa a la mayoría en las rupturas falsas.' },
            { icon: 'repeat', label: 'Mirar si el nivel roto aguanta en la vuelta', bin: 0, why: 'Si el antiguo techo aguanta como suelo, la rotura gana credibilidad.' },
            { icon: 'message', label: 'Comprar porque un foro grita «¡ha roto!»', bin: 1, why: 'La euforia ajena no confirma nada.' },
          ],
        },
        goal: { text: 'Clasifica las seis ideas.', when: [when('done', '==', 6)] },
        insight: 'Una rotura se confirma con el **cierre** y el **volumen**, no con la mecha. Y ningún filtro las elimina todas: según Bulkowski, el HCH fracasa un 19 % de las veces y las banderas, en torno al 44 %.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: lo que exige paciencia suele filtrar; lo que da prisa, atrapa.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Ya tienes media lista de filtros.', mood: 'HAPPY' },
          { say: 'Clasifica cada idea', mood: 'HAPPY' },
        ],
      }),
      key('Y si falla, el stop', 'Ningún filtro las elimina todas. Por eso el stop va donde la rotura deja de tener sentido: de vuelta dentro de la zona, por debajo del último mínimo relevante. Y el tamaño se calcula para que ese fallo cueste poco.', 'Una rotura sin cierre ni volumen es solo una excursión.', 'Antes de entrar en una rotura, decide dónde reconocerás que era falsa.'),
    ], [
      multi('¿Qué reduce el riesgo de entrar en una ruptura falsa? Marca todo.', ['Esperar un cierre al otro lado', 'Pedir volumen superior a la media', 'Exigir que el cierre supere el nivel en un 1–3 %', 'Entrar con la primera mecha que asome'], [0, 1, 2], 'La primera mecha es justo lo que atrapa a la mayoría en las roturas falsas.'),
      scenario('Resistencia en 100 €. Hoy el precio llega a 101,50 € durante la sesión, pero cierra en 99,20 € con volumen bajo. Marta compró a 101 € al ver «la rotura». ¿Qué ha pasado?', [['Ha entrado en una rotura confirmada', 'No: cerró por debajo del nivel y sin volumen. Fue una mecha, no una rotura.'], ['Ha comprado una excursión que no se confirmó', 'Eso: sin cierre por encima ni volumen, la rotura no existe. Si no tenía stop, ahora está atrapada.'], ['Ha hecho lo correcto: hay que entrar antes que nadie', 'Entrar antes de la confirmación es la forma más típica de caer en una ruptura falsa.']], 1, 'Una rotura se confirma con el cierre y el volumen, no con la mecha.'),
      num('Una resistencia está en 50 €. Exiges que el cierre la supere en un 2 % para darla por rota. ¿Por encima de qué precio debe cerrar?', 51, '€', '50 × 1,02 = 51 €.'),
      level('Has comprado tras una rotura. Coloca el stop donde la rotura dejaría de tener sentido: por debajo del último mínimo relevante.', 'lvl-5', 'STOP', 'Si el precio vuelve por debajo del mínimo reciente, la rotura ha fallado y la idea ya no vale.'),
      level('Otro caso: coloca el stop por debajo del mínimo reciente.', 'lvl-14', 'STOP', 'Justo por debajo del mínimo reciente, con algo de margen: ahí es donde reconoces el error.'),
      simTrade('Tienes 10.000 € y, si la rotura resulta falsa, quieres perder como mucho un 1 %. Elige el stop y el importe.', 'lvl-10', 'Primero el stop (donde la rotura falla) y después el importe: con 100 € de riesgo máximo, cuanto más lejos el stop, menos acciones puedes comprar.', { cash: 10_000, maxRiskPct: 1 }),
      upDown('Otro gráfico real, sin nombre ni fecha. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-52', 'Ni las roturas con volumen garantizan nada. Lo que sí puedes controlar es dónde sales si fallan y cuánto pierdes.'),
      tf('Si el precio supera una resistencia solo con la mecha y cierra por debajo, la rotura está confirmada.', false, 'Una mecha no confirma nada: hace falta un cierre al otro lado, mejor con volumen.'),
      timed(single('Rápido: ¿qué confirma mejor una rotura?', ['Una mecha al otro lado', 'Un cierre al otro lado con volumen alto', 'Un comentario en un foro'], 1, 'Cierre más volumen: mucha gente detrás del movimiento.'), 10),
      chat(['He comprado una rotura y al día siguiente el precio ha vuelto dentro del rango 😬', '¿Aguanto, que seguro vuelve a subir?'], '¿Qué le contestas?', [['Sí, aguanta lo que haga falta', 'Si la rotura ha fallado, aguantar sin plan convierte un error pequeño en uno grande.'], ['Si cierra claramente dentro y toca tu stop, la idea ha fallado: se sale y se aprende', '¡Eso! El stop está para esto. Una ruptura falsa con stop es un coste pequeño; sin stop, puede ser enorme.'], ['Compra más para bajar el precio medio', 'Promediar a la baja una idea que ya ha fallado suele agrandar la pérdida.']], 1, 'Las rupturas falsas son parte del juego: el stop decide cuánto cuestan.'),
    ], { source: '9.1', minutes: 6, retire: [0, 1, 7, 8, 9] }),
  ],
})
