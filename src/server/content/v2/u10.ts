import 'server-only'
// Sección 3 · Unidad 10 · Fondos y ETFs (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

const KID = 'Extracto de un KID (ficticio): «Fondo Ejemplo Mundial, clase Acc. ISIN IE00XXXXXXXX. Objetivo: replicar el índice MSCI World. Indicador de riesgo: 4 de 7. Costes corrientes: 0,20 % anual. Periodo de mantenimiento recomendado: 5 años».'

export default unit({
  id: 'u10', order: 10, title: 'Fondos y ETFs', description: 'Fondos, ETFs, comisiones, gestión indexada y cómo leer su ficha',
  lessons: [
    lesson('u10l1', 'Qué es un fondo de inversión', [
      story('Cambiar de fondo', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Tengo 5.000 € en un fondo, con 1.000 € de ganancia.'),
        say('pablo', 'He encontrado otro parecido pero más barato. ¿Cómo me cambio?'),
        choose('¿Qué le dices?', [
          opt('Vende, y con el dinero compra el nuevo', 'bad', say('lumi', 'Al vender tributa por los 1.000 € de ganancia: unos 190 € para Hacienda.')),
          opt('Pide un traspaso del fondo viejo al nuevo', 'good', say('lumi', '¡Eso! En España el traspaso no tributa. Pagará cuando venda del todo.')),
          opt('Espera a no tener ganancias', 'ok', say('lumi', 'Podría esperar años. Con un traspaso se cambia hoy, sin pagar.')),
        ]),
        say('lumi', 'Ojo: para que sea traspaso, el dinero no puede pasar por tu cuenta.'),
      ]),
      play({
        title: '¿Quién hace qué?',
        intro: 'Un **fondo de inversión** reúne el dinero de miles de personas, que compran **participaciones**, y lo invierte según una política. ¿Quién hace cada cosa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Gestora' }, { label: 'Depositaria' }, { label: 'CNMV' }],
          cards: [
            { icon: 'briefcase', label: 'Decide qué compra el fondo', bin: 0, why: 'La gestora invierte según la política del fondo.' },
            { icon: 'lock', label: 'Guarda los activos del fondo', bin: 1, why: 'La depositaria custodia lo que compra el fondo.' },
            { icon: 'search', label: 'Registra y supervisa los fondos españoles', bin: 2, why: 'La CNMV es el supervisor de los mercados en España.' },
            { icon: 'eye', label: 'Vigila que la gestora cumpla las reglas', bin: 1, why: 'La depositaria también controla a la gestora.' },
            { icon: 'chart', label: 'Calcula el valor liquidativo cada día', bin: 0, why: 'Patrimonio del fondo entre sus participaciones, una vez al día.' },
            { icon: 'alert', label: 'Avisa de las entidades no autorizadas', bin: 2, why: 'En su web puedes comprobar quién está registrado.' },
          ],
        },
        goal: { text: 'Clasifica las seis tareas.', when: [when('done', '==', 6)] },
        insight: 'Cada pieza vigila a otra, y el dinero del fondo es **de los partícipes**, separado del de la gestora: si la gestora quiebra, no se lo lleva.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: una decide, otra guarda y vigila, y la CNMV supervisa.', mood: 'THINKING' },
          { say: 'Clasifica cada tarea', mood: 'HAPPY' },
        ],
      }),
      key('Activa o indexada', 'Hay fondos de **gestión activa** (el gestor elige para intentar batir al índice) e **indexados** (copian un índice con costes bajos).\n\nEl precio de cada participación, el **valor liquidativo**, se calcula una vez al día. Y un fondo no garantiza ganancias: su valor sube y baja con lo que tiene dentro.\n\nEl traspaso entre fondos es cambiar de carril sin pagar peaje.', 'Un fondo reúne el dinero de muchos para comprar muchos activos, con una gestora al mando.', 'Pruébalo: en Mercado, busca IWDA, un ETF que copia el índice MSCI World, y añádelo a Favoritos.'),
    ], [
      match('Empareja cada pieza con su papel.', [['Gestora', 'Decide en qué se invierte'], ['Depositaria', 'Guarda los activos y vigila'], ['CNMV', 'Supervisa y registra'], ['Partícipe', 'Tú: dueño de participaciones']], 'Cada pieza vigila a otra: así el dinero de los partícipes está protegido de la gestora.'),
      num('Un fondo tiene un valor liquidativo de 12,50 €. Inviertes 1.000 €. ¿Cuántas participaciones compras?', 80, 'participaciones', '1.000 ÷ 12,50 = 80 participaciones.'),
      num('Un año después el valor liquidativo es de 13,75 €. ¿Cuánto valen tus 80 participaciones?', 1100, '€', '80 × 13,75 = 1.100 €: un 10 % más.'),
      single('Si la gestora del fondo quiebra, ¿qué pasa con tu dinero?', ['Se pierde con la gestora', 'Sigue siendo de los partícipes', 'Lo cubre el Fondo de Garantía de Depósitos'], 1, 'El patrimonio del fondo no es de la gestora. Ojo: el FGD cubre depósitos, no fondos de inversión.'),
      tf('El valor liquidativo de un fondo tradicional cambia a cada segundo, como una acción.', false, 'Se calcula una vez al día. El que cotiza durante toda la sesión es el ETF.'),
      tf('En España puedes pasar el dinero de un fondo a otro sin pagar impuestos si lo haces por traspaso.', true, 'Pagas solo cuando reembolsas definitivamente.'),
      buckets('¿Gestión activa o indexada?', ['Activa', 'Indexada'], [['El gestor elige empresas para batir al índice', 0], ['Copia el MSCI World', 1], ['Costes muy bajos', 1], ['Suele cobrar más del 1 % al año', 0], ['Cambia la cartera según la visión del gestor', 0]], 'La activa intenta ganar al índice y cobra más por ello; la indexada lo copia barato.'),
      scenario('Pablo tiene 5.000 € en un fondo con una ganancia de 1.000 € y quiere pasarse a otro fondo más barato. ¿Cómo lo hace?', [['Vende, recibe el dinero en su cuenta y compra el nuevo', 'Al vender tributa por la ganancia de 1.000 € (unos 190 €) antes de reinvertir.'], ['Pide un traspaso del fondo antiguo al nuevo', 'Bien: el dinero pasa directamente sin tributar; pagará cuando reembolse del todo.'], ['No se puede cambiar de fondo', 'Sí se puede, y en España con ventaja fiscal.']], 1, 'El traspaso permite cambiar de fondo sin pasar por Hacienda, siempre que el dinero no pase por tu cuenta.'),
      timed(fill('El precio de una participación de un fondo se llama valor ____.', 'liquidativo', ['nominal', 'contable', 'facial'], 'Es el patrimonio del fondo dividido entre sus participaciones, calculado cada día.'), 15),
      multi('¿Qué ventajas tiene un fondo frente a comprar acciones sueltas? Marca todas.', ['Diversificas con poco dinero', 'Nunca cobra comisiones', 'En España se puede traspasar sin impuestos', 'Tiene ganancias garantizadas'], [0, 2], 'Con un fondo diversificas con poco dinero y, en España, puedes traspasarlo sin pagar impuestos; además lo gestionan profesionales. Pero cobra comisiones y no garantiza ganancias.'),
      scenario('Ana quiere invertir 50 € al mes en empresas de todo el mundo. ¿Qué le encaja más?', [['Comprar cada mes una acción suelta distinta', 'Con 50 € al mes tardaría años en estar repartida, y pagaría una comisión por cada compra.'], ['Un fondo repartido por todo el mundo', 'Bien: con cada aportación compra un trocito de miles de empresas, con costes bajos.'], ['La acción que más ha subido este año', 'Todo a una sola empresa, elegida por lo que ya subió: mucho riesgo.']], 1, 'Un fondo reúne el dinero de muchos y te da miles de empresas con poco dinero. Ir comprando acciones sueltas parece más controlado, pero con poco dinero diversificas mal y pagas más comisiones.'),
      chat(['El banco me ofrece un fondo y dice que «siempre acaba ganando».', '¿Los fondos no pierden nunca?'], 'A Lumi le ofrecen un fondo que «siempre acaba ganando» y pregunta si los fondos no pierden nunca. ¿Qué le contestas?', [['Un fondo sube y baja con lo que tiene dentro: no garantiza ganancias', 'Eso. Y el FGD no cubre los fondos de inversión.'], ['Si lo vende un banco, es seguro', 'El banco lo vende, pero su valor depende de lo que compra el fondo.'], ['No pierden: la CNMV los supervisa y garantiza el resultado', 'La CNMV supervisa los fondos, pero no garantiza que ganen.']], 0, 'Un fondo normal no garantiza nada: vale lo que valen sus activos. Que lo venda un banco o lo supervise la CNMV da seguridad sobre las reglas y la custodia, no sobre la rentabilidad.'),
    ], { source: '2.7', minutes: 6, retire: [0, 1, 2, 4, 7, 8] }),

    lesson('u10l4', 'Gestión activa contra indexada', [
      mission({
        title: 'Haz de gestor activo',
        intro: 'Tu trabajo: adivinar hacia dónde va el mercado. Cuatro índices reales: ¿suben o bajan en las sesiones siguientes?',
        widget: { kind: 'guess', rounds: ['ud-35', 'ud-38', 'ud-39', 'ud-87'] },
        goal: { text: 'Juega las cuatro rondas.', when: [when('done', '==', 4)] },
        insight: 'Acertar a veces es fácil; acertar **año tras año**, casi imposible. Según SPIVA, en 10 años el **97 %** de los fondos europeos de acciones quedó por detrás de su índice.',
        lumi: [
          { when: when('right', '==', 4), say: '¡Cuatro de cuatro! ¿Podrías repetirlo diez años seguidos?', mood: 'CELEBRATE' },
          { when: when('done', '==', 4), say: 'Acertar a veces es fácil. Acertar siempre, casi imposible.', mood: 'THINKING' },
          { say: '¿Sube o baja? Elige en cada ronda', mood: 'HAPPY' },
        ],
      }),
      story('El fondo del +45 %', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Ya sé qué fondo comprar: el primero del ranking.'),
        say('bruno', '¡Subió un 45 % el año pasado! El gestor es un genio.'),
        choose('¿Qué le dices?', [
          opt('Buena idea: si subió tanto, repetirá', 'bad', say('lumi', 'Muy pocos repiten. A menudo, el que más sube es el que más riesgo asumió.')),
          opt('El ranking del año pasado apenas predice el siguiente: mira costes y política', 'good', say('lumi', '¡Bien! Perseguir al ganador del año pasado suele salir mal.')),
          opt('Compra los cinco primeros, por si acaso', 'ok', say('lumi', 'Cinco ganadores de un año no son cinco ganadores de diez años.')),
        ]),
        say('lumi', 'La rentabilidad pasada dice poco del futuro. Los costes, en cambio, se repiten.'),
      ]),
      key('La aritmética de Sharpe', '1. Todos los inversores juntos **son** el mercado.\n2. Antes de costes, el inversor activo medio gana lo mismo que el mercado.\n3. Después de costes, **tiene que** ganar menos.\n\nNo es que los gestores sean malos: compiten entre ellos y cobran más. SPIVA (Europa, cierre de 2025): en solo **1 año**, el **81,8 %** de los fondos europeos de acciones ya quedó por detrás de su índice. Buffett ganó una apuesta de 10 años con un indexado del S&P 500 frente a una selección de *hedge funds*. Si casi nadie bate al índice, comprar el índice ya te pone por delante de casi todos.', 'A largo plazo, la gran mayoría de fondos activos rinde menos que su índice, sobre todo por los costes.', 'Pruébalo: en el simulador, compra un poco de CSPX, un ETF que copia el S&P 500, y déjalo crecer.'),
    ], [
      single('Según SPIVA (Europa, cierre de 2025), ¿qué porcentaje de fondos europeos de acciones quedó por detrás de su índice en 10 años?', ['Un 40 %', 'Un 65 %', 'Un 97 %'], 2, 'En 1 año ya era el 81,8 %; a 10 años, casi todos.'),
      num('De 100 fondos activos europeos de acciones, ¿cuántos batieron a su índice en 10 años, según ese 97 %?', 3, 'fondos', '100 − 97 = 3. Y el verdadero problema es encontrar esos 3 por adelantado.'),
      order('Ordena el razonamiento de William Sharpe.', ['Todos los inversores juntos son el mercado', 'Antes de costes, el inversor activo medio gana lo mismo que el mercado', 'El activo paga más comisiones y opera más', 'Después de costes, el activo medio gana menos'], 'Es pura aritmética: no depende de que los gestores sean buenos o malos.'),
      tf('Los fondos que baten a su índice un año suelen repetirlo los años siguientes.', false, 'SPIVA también mide la persistencia: muy pocos repiten. El éxito pasado no predice el futuro.'),
      upDown('Imagina que eres gestor activo y tu trabajo es acertar hacia dónde va el mercado. Esto es un gran índice de acciones. ¿Qué hizo en las 10 sesiones siguientes?', 'ud-34', 'Acertar una y otra vez el próximo movimiento del mercado es lo que intenta la gestión activa, y lo que casi nadie consigue de forma constante.'),
      scenario('Bruno elige su fondo mirando el ranking: compra el que más subió el año pasado, un +45 %. ¿Qué le dirías?', [['Buena idea: si subió tanto, el gestor es un genio', 'Muy pocos repiten. A menudo el que más sube un año es el que más riesgo asumió.'], ['Que el ranking del año pasado apenas predice el siguiente, y que mire costes y política', 'Bien: según SPIVA, perseguir al ganador del año pasado suele salir mal.'], ['Que compre los cinco primeros del ranking para asegurarse', 'Cinco ganadores de un año no son cinco ganadores de diez años.']], 1, 'La rentabilidad pasada de un fondo dice muy poco de la futura; los costes, en cambio, se mantienen.'),
      single('Según Sharpe, ¿por qué el inversor activo medio obtiene menos que el mercado?', ['Porque antes de costes gana lo mismo y luego paga más costes', 'Porque la mayoría de los gestores no sabe invertir', 'Porque el mercado hace trampas'], 0, 'Es la aritmética de la gestión activa (Sharpe, 1991).'),
      timed(tf('Un fondo indexado intenta batir a su índice.', false, 'Intenta copiarlo con el menor coste posible.'), 10),
      fill('El informe que compara los fondos activos con su índice se llama ____.', 'SPIVA', ['KID', 'UCITS', 'MiCA'], 'Lo publica S&P Dow Jones Indices para Europa, EE. UU. y otras regiones.'),
      multi('¿Qué conclusiones son razonables a partir de SPIVA? Marca todas.', ['La mayoría de fondos activos no bate a su índice a largo plazo', 'El fondo que ganó el año pasado repetirá', 'Ningún gestor activo ha batido nunca al mercado', 'Es difícil saber de antemano quién batirá al índice'], [0, 3], 'La mayoría no bate a su índice a largo plazo y es difícil saber de antemano quién lo hará; los costes explican buena parte. Algunos sí lo baten, pero haber ganado un año no predice el siguiente.'),
      chat(['Mi banco me recomienda su fondo estrella: cobra un 1,8 % al año.', 'Dice que su gestor bate al mercado. ¿Lo contrato?'], 'El banco de Lumi le recomienda un fondo que cobra un 1,8 % al año y dice que su gestor bate al mercado. ¿Qué le contestas?', [['Antes compáralo con un indexado barato', 'Eso. Y recuerda: ese 1,8 % lo pagas cada año, gane o pierda.'], ['Sí: si lo dice el banco, que es experto, será verdad', 'El banco cobra por venderlo. La mayoría de activos no bate a su índice.'], ['Sí, y cuanto más cobre, mejor gestor', 'Cobrar más no te hace mejor: los costes restan cada año.']], 0, 'Según SPIVA, casi todos los fondos activos quedan por detrás de su índice a 10 años, y sus costes se repiten cada año. Fiarse del banco tienta, pero quien te lo vende cobra por hacerlo.'),
    ], { source: '4.1', minutes: 6, retire: [1, 3, 4, 5, 7] }),

    lesson('u10l5', 'Acumulación o distribución', [
      story('Ver el dinero', [{ id: 'lucia', name: 'Lucía' }], [
        say('lucia', 'Prefiero el de distribución: así «veo» el dinero.'),
        say('lucia', 'Con el de acumulación parece que no gano nada.'),
        note('Lucía tiene 10.000 € en un fondo que reparte un 3 % en dividendos.'),
        choose('¿Qué le dices?', [
          opt('Tienes razón, el de acumulación no da nada', 'bad', say('lumi', 'Sí da: sus 300 € se reinvierten y sus participaciones valen más.')),
          opt('Ganas lo mismo, solo que reinvertido, y pagas impuestos más tarde', 'good', say('lumi', '¡Eso! Con el de distribución cobraría 300 €, pero tras la retención le llegarían 243 €.')),
          opt('Da igual, elige el que quieras', 'ok', say('lumi', 'Antes de impuestos rinden igual. Si no necesitas las rentas, suele ganar el de acumulación.')),
        ]),
        say('lumi', 'No ver el dinero no significa no ganarlo.'),
      ]),
      play({
        title: '¿Acc o Dist?',
        intro: 'Dos versiones del mismo fondo, con las **mismas empresas** dentro: solo cambia qué se hace con los dividendos. ¿De cuál es cada rasgo?',
        widget: {
          kind: 'swipe',
          bins: [{ label: 'Acumulación (Acc)' }, { label: 'Distribución (Dist)' }],
          cards: [
            { icon: 'cash', label: 'Te ingresa dinero cada trimestre', bin: 1, why: 'El de distribución te paga los dividendos, normalmente cada trimestre o semestre.' },
            { icon: 'repeat', label: 'Reinvierte los dividendos dentro del fondo', bin: 0, why: 'No recibes nada: tus participaciones valen más.' },
            { icon: 'receipt', label: 'Tributas por los dividendos cada año', bin: 1, why: 'Lo que cobras tributa ese año, con una retención del 19 %.' },
            { icon: 'hourglass', label: 'No pagas impuestos hasta vender', bin: 0, why: 'Los dividendos siguen componiéndose sin pasar por Hacienda.' },
            { icon: 'family', label: 'Útil para vivir de las rentas en la jubilación', bin: 1, why: 'Si necesitas ingresos periódicos, la distribución encaja.' },
            { icon: 'sprout', label: 'Para hacer crecer tu dinero durante 30 años', bin: 0, why: 'Reinvertir y aplazar impuestos ayuda a que todo se componga.' },
          ],
        },
        goal: { text: 'Clasifica los seis rasgos.', when: [when('done', '==', 6)] },
        insight: 'Acumular **reinvierte y aplaza impuestos**; distribuir te paga rentas que tributan cada año. El nombre del ETF te lo dice: «Acc» o «Dist».',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿te paga los dividendos o los reinvierte?', mood: 'THINKING' },
          { say: 'Clasifica cada rasgo', mood: 'HAPPY' },
        ],
      }),
      key('Cuál encaja en cada fase', 'Para **acumular** patrimonio durante años, el de acumulación suele ser más eficiente: los 300 € siguen trabajando. El de distribución tiene sentido si **necesitas rentas** (por ejemplo, en la jubilación).\n\nNo es que uno rinda más: cambia cuándo pagas impuestos.', 'Acumular reinvierte y aplaza impuestos; distribuir te paga rentas que tributan cada año.', 'Pruébalo: en Mercado, busca Vanguard FTSE All-World y encontrarás sus dos versiones, Acc y Dist.'),
    ], [
      match('Empareja cada término con su significado.', [['Acc', 'Reinvierte los dividendos'], ['Dist', 'Paga los dividendos al partícipe'], ['Diferimiento fiscal', 'No pagas hasta vender'], ['Retención', 'El 19 % que se descuenta al cobrar']], 'Acumulación y distribución solo cambian qué se hace con los dividendos y cuándo tributan.'),
      num('Un ETF de distribución te paga 400 € de dividendos este año. Con una retención del 19 %, ¿cuánto te llega?', 324, '€', '400 × 0,81 = 324 €. Los otros 76 € van a Hacienda este año.'),
      single('En España, ¿qué versión suele ser más eficiente fiscalmente para acumular patrimonio durante años?', ['Acumulación', 'Distribución', 'Las dos igual'], 0, 'Al no repartir, no tributas por los dividendos hasta vender y todo sigue componiéndose.'),
      scenario('Marta, ya jubilada, quiere complementar su pensión con ingresos cada trimestre. Pablo, de 24 años, quiere que su dinero crezca durante 30 años. ¿Qué versión encaja con cada uno?', [['Marta: distribución; Pablo: acumulación', 'Bien: Marta necesita rentas; Pablo, que el dinero se componga sin pagar impuestos cada año.'], ['Los dos, distribución', 'Pablo pagaría impuestos cada año por unos dividendos que no necesita.'], ['Marta: acumulación; Pablo: distribución', 'Al revés: Marta tendría que vender participaciones para tener rentas y Pablo pagaría impuestos sin necesidad.']], 0, 'La versión adecuada depende de si necesitas ingresos ahora o buscas hacer crecer el patrimonio.'),
      tf('Un ETF de acumulación no cobra los dividendos de las empresas que tiene.', false, 'Sí los cobra, pero los reinvierte dentro del fondo en lugar de pagártelos.'),
      buckets('¿Acumulación o distribución?', ['Acumulación', 'Distribución'], [['Te ingresa dinero cada trimestre', 1], ['Su nombre lleva «Acc»', 0], ['Tributas por los dividendos cada año', 1], ['No pagas impuestos hasta vender', 0], ['Útil para vivir de las rentas', 1]], 'Acumulación = reinvertir y aplazar impuestos. Distribución = cobrar rentas que tributan cada año.'),
      num('Inviertes 10.000 € en un fondo de acumulación que cobra un 3 % anual en dividendos y los reinvierte. Sin contar subidas de precio, ¿cuánto tendrías tras 2 años? (redondea)', 10609, '€', '10.000 × 1,03² = 10.609 €. Los dividendos reinvertidos también generan dividendos.'),
      timed(single('Rápido: ¿qué versión te paga los dividendos?', ['Distribución', 'Acumulación', 'Ninguna'], 0, 'La de distribución (Dist) los reparte; la de acumulación (Acc) los reinvierte.'), 10),
      chat(['Prefiero el de distribución: así «veo» el dinero 💸', 'Con el de acumulación parece que no gano nada.'], '¿Qué le dices?', [['Tienes razón, el de acumulación no da nada', 'Sí da: los dividendos se reinvierten y tus participaciones valen más.'], ['Ganas lo mismo, solo que reinvertido, y en España pagas impuestos más tarde', '¡Eso! No ver el dinero no significa no ganarlo.'], ['El de distribución rinde el doble', 'Antes de impuestos rinden igual; después, el de distribución suele quedarse algo atrás si no necesitas las rentas.']], 1, 'Las dos versiones tienen las mismas empresas; cambia el momento en que cobras y en que tributas.'),
      fill('Lo que reparte un fondo de distribución tributa el año en que lo ____.', 'cobras', ['vendes', 'compras', 'reinviertes'], 'Por eso, si no necesitas esas rentas, pagas impuestos antes de tiempo.'),
      scenario('En Mercado encuentras Vanguard FTSE All-World en dos versiones, Acc y Dist. Tienes 22 años y vas a aportar cada mes durante décadas. ¿Cuál eliges?', [['La Acc, que reinvierte los dividendos', 'Bien: todo sigue componiéndose y no pagas impuestos por los dividendos hasta vender.'], ['La Dist, para ir cobrando los dividendos', 'Los cobrarías, pero tributarías cada año por unas rentas que no necesitas.'], ['Da igual: son fondos distintos', 'Tienen las mismas empresas dentro: solo cambia qué hacen con los dividendos.']], 0, 'Si no necesitas rentas, la Acc deja que los dividendos se reinviertan sin pasar por Hacienda cada año. Cobrar con la Dist tienta porque «ves» el dinero, pero ese ingreso tributa y deja de componerse.'),
    ], { source: '4.7', minutes: 6, retire: [1, 4, 5, 6, 7, 8] }),

    lesson('u10l6', 'Réplica física y sintética', [
      story('Dos ETF del mismo índice', [{ id: 'ana', name: 'Ana' }], [
        say('ana', 'Dudo entre dos ETF del mismo índice. Uno físico, con un TER del 0,07 %. Otro sintético, del 0,05 %.'),
        say('ana', 'Me quedo el más barato y listo, ¿no?'),
        choose('¿Qué más debería mirar?', [
          opt('Nada: el más barato, siempre', 'bad', say('lumi', 'El TER importa, pero también cuánto se desvía de verdad del índice y su tamaño.')),
          opt('La diferencia de seguimiento real, el tamaño y el tipo de réplica', 'good', say('lumi', '¡Bien! Son las piezas para comparar dos ETF del mismo índice.')),
          opt('Cuántos años lleva en el mercado', 'ok', say('lumi', 'Ayuda algo, pero lo clave es cuánto se desvía y su tamaño.')),
        ]),
        say('lumi', 'Dos ETF del mismo índice no son idénticos: mira cuánto se desvía cada uno.'),
      ]),
      play({
        title: '¿Física o sintética?',
        intro: 'Dos formas de copiar un índice: **comprar** lo que hay dentro o que un banco te **pague** lo que haga. ¿Cuál es cuál?',
        widget: {
          kind: 'swipe',
          bins: [{ label: 'Réplica física' }, { label: 'Réplica sintética' }],
          cards: [
            { icon: 'cart', label: 'Compra las acciones del índice', bin: 0, why: 'Tiene dentro lo mismo que el índice, con su peso.' },
            { icon: 'deal', label: 'Firma un swap con un banco', bin: 1, why: 'El banco, la contraparte, le paga lo que haga el índice.' },
            { icon: 'pie', label: 'Compra solo una muestra representativa', bin: 0, why: 'Réplica por muestreo: útil en índices con miles de valores.' },
            { icon: 'layers', label: 'Tiene otra cesta de activos como garantía', bin: 1, why: 'Por el swap recibe la rentabilidad del índice a cambio de la de su cesta.' },
            { icon: 'coins', label: 'Presta parte de sus acciones a cambio de una comisión', bin: 0, why: 'Es el préstamo de valores, con garantías.' },
            { icon: 'shield', label: 'Su riesgo con el banco está limitado al 10 %', bin: 1, why: 'La norma UCITS limita la exposición a la contraparte al 10 % del fondo.' },
          ],
        },
        goal: { text: 'Clasifica los seis rasgos.', when: [when('done', '==', 6)] },
        insight: '**Física:** compra lo que hay en el índice. **Sintética:** un banco le paga lo que hace el índice, a menudo con mucha precisión; su riesgo propio es que ese banco falle.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿tiene las acciones o un contrato con un banco?', mood: 'THINKING' },
          { say: 'Clasifica cada rasgo', mood: 'HAPPY' },
        ],
      }),
      key('Cuánto se desvía', 'La **diferencia de seguimiento** (*tracking difference*) es lo que el ETF se queda por detrás (o por delante) de su índice en un año. Suele parecerse al TER.\n\nLa sintética puede seguir al índice con mucha precisión y, en algunos casos, ahorrar impuestos. Mira la diferencia de seguimiento junto al tamaño del ETF y su tipo de réplica.', 'Física: compra lo que hay en el índice. Sintética: un banco le paga lo que hace el índice.', 'Pruébalo: en Mercado, busca IWDA y XDWD: dos ETF de gestoras distintas que copian el mismo MSCI World.'),
    ], [
      multi('¿Qué es cierto de un ETF de réplica física? Marca todo.', ['Compra las acciones del índice', 'Puede comprar solo una muestra representativa', 'No tiene ningún coste para el inversor', 'Depende de un swap con un banco'], [0, 1], 'La réplica física compra las acciones del índice, a veces solo una muestra representativa, y puede prestar valores. El swap es propio de la sintética, y todo ETF tiene costes.'),
      multi('¿Qué rasgos tiene la réplica sintética? Marca todos.', ['Riesgo de contraparte', 'Usa un swap', 'Tiene dentro todas las acciones del índice', 'No sigue al índice en absoluto'], [0, 1], 'La sintética usa un swap y por eso tiene riesgo de contraparte (en UCITS, limitado al 10 %). Sigue al índice con mucha precisión, pero sin tener dentro sus acciones.'),
      single('En un ETF sintético, ¿quién paga la rentabilidad del índice?', ['La contraparte del swap, normalmente un banco', 'La CNMV', 'Los demás partícipes del fondo'], 0, 'El banco se compromete a pagar lo que haga el índice a cambio de lo que rinde la cesta del ETF.'),
      tf('Un ETF sintético no tiene ningún activo dentro.', false, 'Tiene una cesta de activos que sirve de garantía; por el swap recibe la rentabilidad del índice.'),
      match('Empareja cada término con su significado.', [['Réplica completa', 'Compra todos los valores del índice'], ['Muestreo', 'Compra una selección representativa'], ['Swap', 'Contrato que intercambia rentabilidades'], ['Diferencia de seguimiento', 'Lo que se desvía del índice en un año']], 'Son las piezas para entender cómo copia un ETF su índice y con qué precisión.'),
      num('Un índice sube un 10,00 % en un año y el ETF que lo replica, un 9,78 %. ¿Cuál es la diferencia de seguimiento en puntos?', 0.22, 'puntos', '10,00 − 9,78 = 0,22 puntos, en línea con lo que cuesta un ETF barato.'),
      scenario('Ana compara dos ETF del mismo índice: uno físico con un TER del 0,07 % y uno sintético con un TER del 0,05 %. ¿Qué mira además?', [['Nada: el más barato siempre', 'El TER importa, pero también cuánto se desvía de verdad del índice y su tamaño.'], ['La diferencia de seguimiento real, el tamaño del ETF y el tipo de réplica', 'Bien: son las piezas para comparar dos ETF del mismo índice.'], ['Cuál tiene un nombre más corto', 'El nombre no dice cómo replica ni cuánto se desvía.']], 1, 'Dos ETF del mismo índice pueden diferir en costes reales, tamaño y riesgos de réplica.'),
      timed(tf('La réplica por muestreo es habitual en índices con miles de valores.', true, 'Comprar miles de valores pequeños saldría caro; una muestra bien elegida sigue al índice casi igual.'), 10),
      buckets('¿Física o sintética?', ['Física', 'Sintética'], [['Compra las acciones del índice', 0], ['Firma un swap con un banco', 1], ['Un banco le paga la rentabilidad del índice', 1], ['Préstamo de valores de su cartera', 0]], 'La física tiene lo que hay en el índice; la sintética recibe su rentabilidad mediante un contrato.'),
      fill('En un ETF sintético, el banco con el que firma el swap se llama ____.', 'contraparte', ['depositaria', 'gestora', 'emisora'], 'Si la contraparte falla, el ETF puede perder hasta lo que le deba, que UCITS limita al 10 %.'),
      scenario('Lees que el banco con el que tu ETF sintético firma el swap tiene problemas. ¿Qué haces?', [['Vendo todo ya, antes de perderlo todo', 'No lo perderías todo: la norma limita lo que el ETF puede tener en juego con ese banco.'], ['Compruebo su exposición a ese banco', 'Bien: UCITS limita la exposición a la contraparte al 10 % y el ETF tiene una cesta de activos como garantía.'], ['Nada: un ETF no puede perder por eso', 'Sí puede perder algo: es justo el riesgo propio de la réplica sintética.']], 1, 'El riesgo de la sintética es la contraparte, pero está acotado: como mucho un 10 % del fondo, y con garantías. Vender en pánico tienta, pero supone un riesgo mucho mayor del real; ignorarlo del todo también es un error.'),
    ], { source: '2.7', minutes: 6, retire: [3, 5, 6, 7, 8] }),

    lesson('u10l7', 'Leer la ficha de un fondo (KID)', [
      story('«Es una oportunidad»', [{ id: 'laura', name: 'Laura' }, { id: 'comercial', name: 'Comercial' }], [
        say('comercial', 'Laura, esto es una oportunidad. Hay que entrar ya.'),
        note('La ficha oficial del producto, el KID, dice: indicador de riesgo 7. Periodo de mantenimiento recomendado: 1 día.'),
        say('laura', 'El objetivo del producto no lo acabo de entender…'),
        choose('¿Qué hace Laura?', [
          opt('Lo compra: si tiene KID, es seguro', 'bad', say('lumi', 'Tener KID solo significa que informa, no que sea adecuado para ella.')),
          opt('No lo compra mientras no entienda qué es y cuánto puede perder', 'good', say('lumi', '¡Bien! Riesgo 7 y un plazo de un día: producto complejo y especulativo.')),
          opt('Compra un poco para probar', 'ok', say('lumi', 'Probar con algo que no entiendes no es aprender: es apostar.')),
        ]),
        say('lumi', 'El KID sirve para esto: ver en un minuto que algo no es para ti.'),
      ]),
      play({
        title: '¿Está en el KID?',
        intro: 'Todo fondo o ETF que se vende a minoristas en la UE tiene un **KID**: como máximo 3 páginas, siempre con las mismas secciones. ¿Qué encontrarás?',
        widget: {
          kind: 'swipe',
          bins: [{ label: 'Está en el KID' }, { label: 'No está' }],
          cards: [
            { icon: 'receipt', label: 'Los costes', bin: 0, why: 'Siempre: lo que pagas cada año y el resto de costes.' },
            { icon: 'gauge', label: 'El indicador de riesgo, del 1 al 7', bin: 0, why: 'Del 1 (riesgo más bajo) al 7 (más alto).' },
            { icon: 'message', label: 'La opinión del comercial', bin: 1, why: 'El KID tiene un formato fijo y objetivo: sin opiniones.' },
            { icon: 'hourglass', label: 'El periodo de mantenimiento recomendado', bin: 0, why: 'Cuánto tiempo deberías mantenerlo.' },
            { icon: 'star', label: 'Una rentabilidad garantizada', bin: 1, why: 'Sus escenarios de rentabilidad son simulaciones, no promesas.' },
            { icon: 'alert', label: 'Qué pasa si la entidad no puede pagar', bin: 0, why: 'Es una de sus secciones obligatorias, como cómo reclamar.' },
          ],
        },
        goal: { text: 'Clasifica las seis cosas.', when: [when('done', '==', 6)] },
        insight: 'El KID te dice en 3 páginas **qué compras, cuánto puede doler y cuánto cuesta**. Sus escenarios (de tensión, desfavorable, moderado, favorable) son simulaciones, no promesas.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: el KID es objetivo, sin opiniones ni garantías.', mood: 'THINKING' },
          { say: 'Clasifica cada cosa', mood: 'HAPPY' },
        ],
      }),
      key('Lo que buscas en un minuto', '1. **ISIN:** el DNI del fondo (12 caracteres; empieza por el país, como IE o LU).\n2. **Objetivo y política:** ¿qué compra?\n3. **Indicador de riesgo** (1-7): un monetario suele estar en 1; uno de acciones mundiales, en torno a 4; uno de un solo sector o de emergentes, más arriba.\n4. **Costes** anuales.\n5. **Periodo de mantenimiento recomendado.**\n\nMuchos ETF de EE. UU. no tienen KID: por eso no se venden a particulares en la UE y aquí se compran los europeos, con «UCITS» en el nombre. Si no entiendes el KID de un producto, no lo compres.', 'El KID te dice en 3 páginas qué compras, cuánto puede doler y cuánto cuesta.', 'Pruébalo: pregúntale a la profesora Lumi qué mirar en un ETF antes de comprarlo.'),
    ], [
      single(`${KID} ¿Qué nivel de riesgo indica?`, ['Medio: 4 de 7', 'Muy bajo: 4 sobre 100', 'El máximo posible'], 0, 'Un 4 de 7 es habitual en un fondo de acciones mundiales: oscila bastante, pero está diversificado.'),
      num(`${KID} Si inviertes 5.000 €, ¿cuánto pagarás al año en costes corrientes?`, 10, '€', '5.000 × 0,20 % = 10 € al año.'),
      multi('¿Qué encontrarás siempre en un KID? Marca todo.', ['El indicador de riesgo del 1 al 7', 'Los costes', 'El precio al que cotizará dentro de un año', 'La rentabilidad garantizada de los próximos 5 años'], [0, 1], 'Un KID trae siempre los costes y el indicador de riesgo del 1 al 7, además del periodo de mantenimiento recomendado. Sus escenarios son simulaciones: no garantiza rentabilidades ni precios.'),
      match('Empareja cada dato del KID con lo que te dice.', [['ISIN', 'El código que identifica el fondo'], ['Indicador de riesgo', 'Cuánto puede oscilar, del 1 al 7'], ['Costes corrientes', 'Lo que pagas cada año'], ['Periodo recomendado', 'Cuánto tiempo deberías mantenerlo']], 'Con estos cuatro datos ya sabes qué es, cuánto puede doler, cuánto cuesta y para qué plazo está pensado.'),
      order('Ordena de menor a mayor indicador de riesgo típico.', ['Fondo monetario', 'Fondo de bonos a corto plazo', 'Fondo de acciones mundiales', 'Fondo de acciones de un solo país emergente'], 'Cuanto más concentrado y volátil es lo que compra, más alto el indicador.'),
      tf('Los escenarios de rentabilidad del KID son una promesa de lo que vas a ganar.', false, 'Son simulaciones a partir de datos pasados; el resultado real puede quedar fuera de esos escenarios.'),
      fill('El código de 12 caracteres que identifica un fondo se llama ____.', 'ISIN', ['IBAN', 'NIF', 'TER'], 'Con el ISIN encuentras el fondo exacto en cualquier bróker o en la CNMV.'),
      scenario('A Laura le dan el KID de un producto con indicador de riesgo 7, periodo recomendado de 1 día y un objetivo que no entiende. El comercial insiste en que «es una oportunidad». ¿Qué hace?', [['Lo compra: si tiene KID, es seguro', 'Tener KID solo significa que cumple la obligación de informar, no que sea adecuado para ella.'], ['No lo compra mientras no entienda qué es y cuánto puede perder', 'Bien: riesgo 7 y un horizonte de un día apuntan a un producto complejo y especulativo.'], ['Compra un poco para probar', 'Probar con algo que no entiendes no es aprender: es apostar.']], 1, 'El KID sirve justo para esto: detectar en un minuto que un producto no es lo que te están vendiendo.'),
      timed(single('Rápido: en el indicador de riesgo del KID, ¿qué número es el más arriesgado?', ['7', '1', '10'], 0, 'La escala va del 1 (más bajo) al 7 (más alto).'), 10),
      buckets('¿Está en el KID o no?', ['Está en el KID', 'No está en el KID'], [['Costes', 0], ['Indicador de riesgo', 0], ['La opinión del comercial', 1], ['Qué pasa si la entidad no puede pagar', 0], ['Una previsión garantizada de la bolsa', 1]], 'El KID tiene un formato fijo y objetivo: ni opiniones ni garantías.'),
      scenario('Comparas el KID de dos fondos que copian el MSCI World. Los dos tienen un indicador de riesgo 4. Uno cuesta un 0,20 % al año y el otro, un 1,80 %. Vas a mantenerlo 20 años. ¿Cuál eliges?', [['El del 0,20 %', 'Bien: mismo índice y mismo riesgo; la diferencia de costes se repite cada año durante 20 años.'], ['El del 1,80 %: si cuesta más, será mejor', 'Copian el mismo índice: pagar más no te da más, solo te deja menos.'], ['Da igual: es poca diferencia', 'En un año parece poco, pero en 20 años se come una parte grande de lo ganado.']], 0, 'Si dos fondos compran lo mismo, el coste es lo que más los diferencia. Pensar que más caro es mejor tienta, pero en un indexado el coste extra solo resta.'),
    ], { source: '2.7', minutes: 6, retire: [1, 5, 7, 8, 9] }),
  ],
})
