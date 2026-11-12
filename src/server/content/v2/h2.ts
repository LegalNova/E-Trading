import 'server-only'
// Sección 0 «Invierte desde hoy» · Unidad «Invertir como los que ganan» (docs/curso-v2/06-enganche-y-progresion.md)
// Las clases vienen de otras unidades: conservan su id, el progreso de quien ya las hizo y sus traducciones.
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, portfolio, say, scenario, single, story, tf, timed, upDown, when } from '../dsl'

// Antes en u07 (mismo id: conserva progreso y traducciones)
export const u7l1 = lesson('u7l1', 'Qué es un índice', [
  story('El fondo que ganó un 8 %', [{ id: 'marta', name: 'Marta' }], [
    say('marta', '¡Mi fondo ha ganado un 8 % este año! Es buenísimo, ¿no?'),
    note('Ese año, el índice de su mercado, la media de sus grandes empresas, subió un 14 %.'),
    choose('¿Qué le dices a Marta?', [
      opt('Enhorabuena: un 8 % es genial', 'bad', say('lumi', 'Suena bien… pero copiar el índice le habría dado un 14 %.')),
      opt('Ha quedado 6 puntos por detrás de su índice', 'good', say('lumi', 'Eso. Para eso sirve un índice: es la **vara de medir**.')),
      opt('Depende de cuánto dinero haya puesto', 'ok', say('lumi', 'El importe no cambia el porcentaje: 8 % frente a 14 %.')),
    ]),
    say('marta', '¿Y cómo compro yo ese índice?'),
    say('lumi', 'No se compra tal cual: se compra un **fondo o ETF** que lo replica.'),
  ]),
  play({
    title: '¿Para qué sirve un índice?',
    intro: 'Un **índice** resume en una cifra cómo va un grupo de valores. Se usa para tres cosas.',
    widget: {
      kind: 'sort',
      bins: [{ label: 'Termómetro' }, { label: 'Vara de medir' }, { label: 'Base de productos' }],
      cards: [
        { icon: 'news', label: '«La bolsa española sube hoy un 1 %»', bin: 0, why: 'Es el IBEX 35, el índice de las 35 grandes de la bolsa española.' },
        { icon: 'scale', label: 'Un fondo compara su resultado con el IBEX 35', bin: 1, why: 'El índice es la referencia para saber si el fondo lo hizo bien.' },
        { icon: 'layers', label: 'Un ETF que copia el S&P 500', bin: 2, why: 'El S&P 500 reúne 500 grandes empresas de EE. UU.; los ETF lo copian con costes bajos.' },
        { icon: 'bank', label: 'Saber cómo va hoy el sector bancario', bin: 0, why: 'Hay índices de países y de sectores: termómetros más concretos.' },
        { icon: 'pie', label: 'Comprobar si tu cartera lo hizo bien', bin: 1, why: 'Compárala con un índice que se parezca a lo que tienes.' },
        { icon: 'piggy', label: 'Un fondo indexado para aportar cada mes', bin: 2, why: 'El fondo indexado copia el índice: así se «compra».' },
      ],
    },
    goal: { text: 'Clasifica los seis usos.', when: [when('done', '==', 6)] },
    insight: 'Un índice es **termómetro**, **vara de medir** y **base de productos**. Cada uno tiene sus reglas: qué empresas entran, cuánto pesa cada una y cada cuánto se revisa.',
    lumi: [
      { when: when('wrong', '>=', 2), say: 'Pista: ¿informa, sirve para compararse o se compra como fondo?', mood: 'THINKING' },
      { when: when('done', '>=', 4), say: 'Una cifra con muchos trabajos distintos.', mood: 'HAPPY' },
      { say: 'Toca cada caso: ¿para qué se usa el índice?', mood: 'HAPPY' },
    ],
  }),
  key('Puntos, no euros', 'Un índice se mide en puntos, no en euros. Lo que importa es la **variación**: si pasa de 14.000 a 14.700 puntos, ha subido un 5 %.\n\nComprarlo entero, con un fondo o un ETF, es invertir en todo ese mercado a la vez, no en una sola empresa.', 'Un índice es una cesta de referencia, no algo que se compra tal cual.', 'Pruébalo: en Mercado, busca el IBEX 35 y mira si hoy sube o baja.'),
], [
  single('¿Qué es un índice bursátil?', ['Una cifra que resume cómo va un grupo de valores', 'Una empresa que cotiza en bolsa', 'Un tipo de interés'], 0, 'Es una cesta de referencia con reglas sobre qué entra y cuánto pesa.'),
  tf('Se puede comprar directamente el índice S&P 500.', false, 'Se compra un fondo o ETF que lo replica.'),
  num('Un índice pasa de 14.000 a 14.700 puntos. ¿Cuánto ha subido?', 5, '%', '(14.700 − 14.000) ÷ 14.000 = 0,05 → 5 %.'),
  timed(num('Rápido: un índice pasa de 5.000 a 4.600 puntos. ¿Cuánto ha caído, en %? (escríbelo en positivo)', 8, '%', '400 ÷ 5.000 = 0,08 → ha caído un 8 %.'), 20),
  match('Empareja cada uso del índice con un ejemplo.', [['Termómetro', 'Saber cómo va un mercado hoy'], ['Vara de medir', 'Comparar la rentabilidad de un fondo'], ['Base de productos', 'Fondos y ETFs que lo copian'], ['Reglas del índice', 'Qué entra, cuánto pesa y cuándo se revisa']], 'Un índice informa, sirve de referencia y es la base de los fondos indexados.'),
  tf('Si el IBEX 35 está en 14.000 puntos, comprarlo cuesta 14.000 €.', false, 'Los puntos no son euros: miden la evolución desde una base.'),
  multi('¿Qué fijan las reglas de un índice? Marca todas.', ['Qué empresas entran', 'Cuánto pesa cada una', 'Cada cuánto se revisa', 'Lo que opine cada día un tertuliano'], [0, 1, 2], 'Las reglas son públicas y objetivas: por eso el índice sirve de referencia.'),
  scenario('Un fondo presume en un anuncio: «¡Hemos ganado un 8 % este año!». El índice de su mercado ha subido un 14 %. ¿Qué piensas?', [['Que ha quedado 6 puntos por detrás de su referencia', 'Ganar un 8 % suena bien, pero un fondo indexado de ese mercado habría dado bastante más.'], ['Que es un fondo excelente', 'Solo lo parece si no lo comparas con nada.'], ['Que no se puede comparar con nada', 'Para eso sirven los índices: son la vara de medir.']], 0, 'Una rentabilidad sola no dice si es buena: hay que compararla con su índice.'),
  timed(tf('Si un índice sube, todas sus empresas han subido.', false, 'Es una media ponderada: unas suben, otras bajan, y el índice resume el conjunto.'), 10),
  fill('Un índice no se compra directamente: se compra un fondo o un ____ que lo replica.', 'ETF', ['IPC', 'bono', 'depósito'], 'Los ETFs y fondos indexados copian el índice con costes bajos.'),
  // Nuevas (sección 0): sustituyen a las dos de cálculo
  upDown('Este gráfico es un índice real: la media de las grandes empresas de un país, sin nombre ni fecha. ¿Qué hizo en las 10 sesiones siguientes?', 'ud-39', 'Un índice resume en una sola línea cómo les fue a todas sus empresas juntas: por eso sirve de termómetro del mercado. Lo que no hace es adivinar el futuro: ni el índice entero se puede prever a dos semanas vista.'),
  scenario('Imagina: tu cartera de acciones españolas ha ganado un 5 % este año y el IBEX 35, un 12 %. Un amigo te dice que eres un crack. ¿Qué concluyes?', [['Que lo he hecho peor que el índice: copiarlo me habría dado más', 'Eso es: un fondo que copia el IBEX 35 te habría dado más, y sin elegir empresas.'], ['Que soy un crack: he ganado dinero', 'Ganar no basta: tienes que compararte con lo que habrías ganado copiando el índice.'], ['Que el índice no tiene nada que ver con mi cartera', 'Si tienes acciones españolas, el IBEX 35 es justo tu vara de medir.']], 0, 'Un resultado solo es bueno o malo comparado con su índice: con un 5 % frente a un 12 %, copiar el índice habría ganado más. «He ganado dinero» no basta: una ganancia sin vara de medir no dice si lo hiciste bien.'),
], { source: '2.6', minutes: 6, retire: [1, 2, 3, 4, 7, 8, 10] })

// Antes en u10 (mismo id: conserva progreso y traducciones)
export const u10l2 = lesson('u10l2', 'Qué es un ETF', [
  story('Las 500 de golpe', [{ id: 'nora', name: 'Nora' }], [
    say('nora', 'Quiero invertir 100 € en el S&P 500, las 500 grandes de EE. UU.'),
    say('nora', '¿Tengo que comprar 500 acciones, una de cada empresa?'),
    choose('¿Qué le dices?', [
      opt('Sí: una de cada, y mucha paciencia', 'bad', say('lumi', 'Necesitarías mucho dinero y 500 compras. Hay un atajo.')),
      opt('Compra un ETF del S&P 500: una sola compra y llevas las 500', 'good', say('lumi', '¡Eso! Un **ETF** es un fondo que copia un índice y cotiza como una acción.')),
      opt('Compra solo la más grande: es casi lo mismo', 'ok', say('lumi', 'No: eso es apostar por una empresa, no por las 500.')),
    ]),
    say('nora', 'Si se compra como una acción, ¿es igual de arriesgado que una sola empresa?'),
    say('lumi', 'No: dentro lleva cientos de empresas. Pero si cae todo el mercado, cae también.'),
    say('lumi', 'Un ETF de índice es comprar el supermercado entero en vez de un solo producto.'),
  ]),
  play({
    title: '¿ETF o fondo tradicional?',
    intro: 'El **ETF** cotiza en bolsa como una acción; el fondo de siempre, no. ¿De cuál es cada rasgo?',
    widget: {
      kind: 'sort',
      bins: [{ label: 'ETF' }, { label: 'Fondo tradicional' }],
      cards: [
        { icon: 'clock', label: 'Lo compras a las 11:37 al precio que ves en pantalla', bin: 0, why: 'El ETF cotiza durante toda la sesión: su precio cambia a cada momento.' },
        { icon: 'repeat', label: 'Lo cambias por otro sin pagar impuestos', bin: 1, why: 'Es el traspaso: la gran ventaja del fondo tradicional en España.' },
        { icon: 'receipt', label: 'Pagas comisión del bróker y spread', bin: 0, why: 'Se compra en bolsa: pagas al bróker (el intermediario) y el spread, la diferencia entre precio de compra y de venta.' },
        { icon: 'calendar', label: 'Su precio se calcula una vez al día', bin: 1, why: 'El precio del fondo, su valor liquidativo, se fija una vez cada día.' },
        { icon: 'percent', label: 'Cada venta con ganancia tributa, aunque reinviertas', bin: 0, why: 'En España, los ETF no tienen el régimen de traspaso.' },
        { icon: 'bank', label: 'Lo contratas en la gestora, el banco o una plataforma', bin: 1, why: 'El fondo tradicional no cotiza: se suscribe directamente.' },
      ],
    },
    goal: { text: 'Clasifica los seis rasgos.', when: [when('done', '==', 6)] },
    insight: 'El ETF se compra y se vende **en bolsa, como una acción**, y los grandes cuestan del **0,03 % al 0,30 %** al año. El fondo tradicional tiene, en España, la ventaja del **traspaso**.',
    lumi: [
      { when: when('wrong', '>=', 2), say: 'Pista: ¿cotiza en bolsa o no?', mood: 'THINKING' },
      { say: 'Clasifica cada rasgo', mood: 'HAPPY' },
    ],
  }),
  key('Una cesta que cotiza', 'Con una sola compra llevas todas las empresas del índice, y los ETF grandes cuestan muy poco al año.\n\nCon dinero real, en Europa se compran ETF europeos: llevan «**UCITS**» en el nombre. Qué significa esa etiqueta y cómo leer la ficha de un fondo lo verás más adelante. En el simulador puedes practicar también con ETF de EE. UU.', 'Un ETF es un fondo, casi siempre indexado, que se compra y se vende en bolsa como una acción.', 'Pruébalo: en Mercado, busca SPY, un ETF del S&P 500, y compara su gráfico con el del índice.'),
], [
  match('Empareja cada término con su significado.', [['ETF', 'Fondo que cotiza en bolsa'], ['Participación', 'Cada parte del ETF que compras'], ['Coste anual', 'Lo que cobra el fondo cada año'], ['Índice', 'Cesta de empresas que copia el ETF']], 'Son las cuatro palabras que verás al buscar cualquier ETF.'),
  buckets('¿ETF o fondo tradicional?', ['ETF', 'Fondo tradicional'], [['Lo compras a las 11:37 al precio que ves en pantalla', 0], ['Se traspasa sin pagar impuestos en España', 1], ['Pagas comisión del bróker y spread', 0], ['Su precio se calcula una vez al día', 1], ['Puedes venderlo en cualquier momento de la sesión', 0]], 'Cotizar en bolsa da flexibilidad al ETF; el régimen de traspaso es la gran ventaja del fondo en España.'),
  upDown('Este gráfico es un índice que copian varios ETF: un ETF de ese índice hará lo mismo, menos sus costes. ¿Qué hizo en las 10 sesiones siguientes?', 'ud-37', 'Un ETF indexado no elimina los vaivenes del mercado: tienes exactamente lo que haga el índice, para bien y para mal.'),
  single('¿Qué coste anual suelen tener los grandes ETF indexados?', ['Del 0,03 % al 0,30 %', 'Del 1,5 % al 2 %', 'Del 5 % al 10 %'], 0, 'Copiar un índice es barato: no hace falta un equipo eligiendo empresas.'),
  tf('En España, si vendes un ETF para comprar otro el mismo día, no pagas impuestos.', false, 'Los ETF no tienen el régimen de traspaso: cada venta con ganancia tributa.'),
  single('¿Por qué un minorista europeo no puede comprar muchos ETF de EE. UU.?', ['Porque no tienen el documento KID', 'Porque está prohibido invertir en dólares', 'Porque cotizan de noche'], 0, 'Sin KID, no se pueden comercializar a minoristas en la UE.'),
  num('Compras 15 participaciones de un ETF a 98,40 € y el bróker cobra 2 € de comisión. ¿Cuánto pagas en total?', 1478, '€', '15 × 98,40 = 1.476 € + 2 € de comisión = 1.478 €.'),
  timed(tf('Un ETF se puede comprar y vender durante toda la sesión de bolsa.', true, 'Cotiza como una acción, con un precio que cambia a cada momento.'), 10),
  chat(['Me han dicho que un ETF es «como una acción».', '¿Entonces es igual de arriesgado que comprar una sola empresa?'], '¿Qué le contestas?', [['Sí, igual de arriesgado', 'Se compra como una acción, pero dentro lleva cientos o miles de empresas.'], ['Se compra como una acción, pero dentro hay una cesta de muchas empresas', '¡Eso! Uno del MSCI World lleva más de mil empresas de países desarrollados.'], ['No tiene ningún riesgo', 'Tiene el riesgo del índice que copia: si el mercado cae un 30 %, el ETF también.']], 1, 'La forma de comprarlo es como una acción; el riesgo es el de toda la cesta.'),
  fill('Los ETF que puede comprar un minorista en la UE suelen llevar la etiqueta ____.', 'UCITS', ['TIPS', 'REIT', 'SPIVA'], 'Es la norma europea que fija reglas de diversificación, custodia e información.'),
  // Retirada la 6.ª (por qué no se venden aquí muchos ETF de EE. UU.: el KID se explica en u10l7, auditoría CON-21)
], { source: '2.7', minutes: 6, retire: [1, 2, 5, 6, 7] })

// Antes en u29 (mismo id: conserva progreso y traducciones)
export const u29l1 = lesson('u29l1', 'Diversificar: lo único gratis en finanzas', [
  story('Todo a una carta', [{ id: 'bruno', name: 'Bruno' }], [
    say('bruno', 'He metido mis 3.000 € en una sola empresa. ¡Va a ser la próxima gran tecnológica!'),
    say('bruno', 'La conozco bien: me he leído todo sobre ella.'),
    choose('¿Qué le dices?', [
      opt('Perfecto: si la conoces, no hay riesgo', 'bad', say('lumi', 'Conocerla no la protege de un fraude, un producto fallido o una quiebra.')),
      opt('Reparte: entre muchas empresas, una quiebra apenas se nota', 'good', say('lumi', '¡Eso! Si una empresa pesa un 0,1 %, su desastre casi ni se ve.')),
      opt('Compra otra más y así tienes dos', 'ok', say('lumi', 'Mejor que una, pero dos empresas siguen siendo muy pocas.')),
    ]),
    say('lumi', 'Una sola empresa puede caer un **90 %**. Para recuperarte necesitarías un **+900 %**.'),
    say('bruno', 'Uf. ¿Y si reparto, ya no hay ningún riesgo?'),
    say('lumi', 'Hay dos tipos de riesgo. Vamos a separarlos.'),
  ]),
  play({
    title: '¿De una empresa o de todas?',
    intro: 'El riesgo **específico** golpea a una empresa concreta. El **de mercado**, a todas a la vez. ¿Cuál es cada uno?',
    widget: {
      kind: 'sort',
      bins: [{ label: 'Específico: de una empresa' }, { label: 'De mercado: de todas' }],
      cards: [
        { icon: 'alert', label: 'Un fraude contable en una empresa', bin: 0, why: 'Le pasa a una sola: en un índice de miles de empresas, apenas se nota.' },
        { icon: 'globe', label: 'Una recesión mundial', bin: 1, why: 'Golpea a casi todas a la vez: no se diluye con más acciones.' },
        { icon: 'package', label: 'El producto estrella de una empresa fracasa', bin: 0, why: 'Un problema de esa empresa, no de toda la economía.' },
        { icon: 'siren', label: 'Una pandemia que cierra la economía', bin: 1, why: 'Afecta a todo el mercado: repartir entre más acciones no lo evita.' },
        { icon: 'factory', label: 'Una huelga larga en la fábrica de una empresa', bin: 0, why: 'Solo frena a esa empresa: sus competidoras siguen vendiendo.' },
        { icon: 'percent', label: 'El banco central sube los tipos de golpe', bin: 1, why: 'Cambia el precio del dinero para todas las empresas a la vez.' },
      ],
    },
    goal: { text: 'Clasifica los seis sustos.', when: [when('done', '==', 6)] },
    insight: 'Diversificar **elimina el riesgo específico**: una quiebra pesa poco entre miles de empresas. El **riesgo de mercado** no desaparece con más acciones; solo se suaviza combinando con bonos (préstamos a Estados o empresas) o dinero en cuenta.',
    lumi: [
      { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿le pasa a una empresa o a toda la economía?', mood: 'THINKING' },
      { when: when('done', '==', 6), say: '¡Bien separado! Ahora, el único almuerzo gratis.', mood: 'CELEBRATE' },
      { say: 'Clasifica cada susto', mood: 'HAPPY' },
    ],
  }),
  key('El almuerzo gratis', 'Cuánto sube y baja en un año típico (su **volatilidad**): una acción suelta, un 25-35 %; 20-30 acciones de sectores distintos, cerca del 20 %; un índice mundial, un 15 %.\n\nA Harry Markowitz, Nobel de Economía, se le atribuye llamar a esto **el único almuerzo gratis**: menos riesgo sin renunciar a rentabilidad esperada. Un ETF de un índice mundial te da esa cesta en una sola compra.', 'Con muchas empresas, los desastres de unas se compensan con los éxitos de otras.', 'Pruébalo: abre Cartera y mira si alguna posición pesa más del 20 %.'),
], [
  single('¿Qué riesgo elimina repartir tu dinero entre cientos de acciones?', ['El riesgo de mercado', 'El riesgo específico de cada empresa', 'Todo el riesgo'], 1, 'Una quiebra deja de ser un drama si pesa un 0,1 %. Pero si cae todo el mercado, caen todas: ese riesgo solo se suaviza con bonos o liquidez.'),
  num('Repartes 10.000 € a partes iguales entre 20 acciones. Una quiebra y pierde todo su valor; el resto se queda igual. ¿Cuántos euros pierdes?', 500, '€', '10.000 ÷ 20 = 500 € por acción. Con una sola acción, esa quiebra se habría llevado los 10.000 €.'),
  buckets('¿Es riesgo específico o riesgo de mercado?', ['Específico (de una empresa)', 'De mercado (de todas)'], [['Un fraude contable en una empresa', 0], ['Una recesión mundial', 1], ['Un producto estrella que fracasa', 0], ['Una pandemia que cierra la economía', 1], ['Una subida fuerte de tipos del banco central', 1], ['Una huelga larga en la fábrica de una empresa', 0]], 'Lo que afecta a una empresa se diluye en un índice; lo que afecta a toda la economía, no.'),
  portfolio('Ejercicio de práctica (no es una recomendación): reparte 10.000 € entre estas acciones. Reglas: al menos 6 empresas, ninguna por encima del 20 % y ningún sector por encima del 30 %.', [['Iberdrola', 'ENERGÍA'], ['Repsol', 'ENERGÍA'], ['BBVA', 'BANCA'], ['Banco Santander', 'BANCA'], ['Inditex', 'CONSUMO'], ['Coca-Cola', 'CONSUMO'], ['Apple', 'TECNOLOGÍA'], ['Microsoft', 'TECNOLOGÍA']], { minAssets: 6, maxWeight: 20, maxKind: { ENERGÍA: 30, BANCA: 30, CONSUMO: 30, TECNOLOGÍA: 30 } }, 'Repartir entre empresas y sectores reduce el riesgo específico. Aun así, 8 acciones siguen siendo pocas: un índice tiene cientos o miles.'),
  timed(single('Rápido: volatilidad anual típica de un índice mundial de acciones…', ['Un 15 %', 'Un 35 %', 'Un 70 %'], 0, 'Una acción suelta ronda el 25-35 % y una pequeña o joven puede pasar del 40 %.'), 12),
  multi('¿Qué NO es diversificar? Marca todas.', ['Tener 10 fondos que compran las mismas 50 tecnológicas', 'Tener 15 criptomonedas distintas', 'Un fondo de acciones de todo el mundo y otro de bonos', 'Tener casi todo en acciones de la empresa donde trabajas'], [0, 1, 3], 'Nombres distintos no son activos distintos: las criptos suelen caer juntas y los fondos repetidos compran lo mismo.'),
  tf('España supone más del 10 % de la bolsa mundial.', false, 'Es menos del 1 %. Invertir solo en España es concentrar, aunque tengas 35 empresas.'),
  scenario('Pablo tiene el 80 % de sus ahorros en acciones de la empresa donde trabaja: «La conozco mejor que nadie». ¿Qué le dices?', [['Tiene razón: conocer la empresa elimina el riesgo', 'Conocerla no la protege de una crisis del sector. Y si va mal, Pablo pierde a la vez el sueldo y los ahorros.'], ['Que concentra dos riesgos en el mismo sitio: su sueldo y sus ahorros', 'Eso es: si la empresa tropieza, le golpea por los dos lados. Es justo el riesgo que diversificar elimina.'], ['Que pase todo a otra empresa que le guste más', 'Cambiar una sola empresa por otra deja el mismo problema: todo en una cesta.']], 1, 'Concentrar en tu propia empresa es doble riesgo. Diversificar lo reduce sin renunciar a rentabilidad esperada.'),
  fill('A Markowitz se le atribuye llamar a la diversificación «el único almuerzo ____» de las finanzas.', 'gratis', ['caro', 'seguro', 'rápido'], 'Reduces el riesgo sin pagar a cambio menos rentabilidad esperada.'),
  chat(['Tengo 300 € en 15 criptomonedas distintas 😎', 'Ya estoy superdiversificado, ¿no?'], '¿Qué le contestas a Lumi?', [['Sí, 15 son muchísimas', 'Ojalá… pero cuando bitcoin cae con fuerza, la mayoría de las demás caen con él.'], ['No: si todas caen a la vez, es como tener una sola', '¡Bien visto! Diversificar es tener cosas que se comportan distinto, no muchos nombres.'], ['Sí, sobre todo si son nuevas', 'Las más nuevas suelen ser aún más volátiles. Más nombres no es menos riesgo.']], 1, 'Activos muy correlacionados no diversifican. Y recuerda: en cripto puede perderse la totalidad de lo invertido.'),
], { source: '3.4', minutes: 6, retire: [1, 2, 4, 6] })

// Antes en u25 (mismo id: conserva progreso y traducciones)
export const u25l2 = lesson('u25l2', 'Aportaciones periódicas (DCA)', [
  story('El precio baja… y vuelve', [{ id: 'irene', name: 'Irene' }], [
    say('irene', 'Aporto 100 € cada mes a un fondo, pase lo que pase.'),
    note('Con cada 100 € compra participaciones, trocitos del fondo. En cinco meses, su precio pasa por 10 €, 8 €, 5 €, 8 € y vuelve a 10 €.'),
    say('irene', 'Ha vuelto a donde estaba. Supongo que estoy igual que al principio.'),
    choose('¿Cómo está Irene?', [
      opt('Igual: el precio acabó donde empezó', 'bad', say('lumi', 'No: cuando estaba barato, sus 100 € compraron más participaciones.')),
      opt('Ganando: compró más participaciones cuando estaba barato', 'good', say('lumi', '¡Eso! Puso 500 € y ahora tiene 650 €: un **30 %** más.')),
      opt('Perdiendo: compró en plena caída', 'ok', say('lumi', 'Al revés: en la caída, el mismo dinero le dio más participaciones.')),
    ]),
    say('lumi', 'Invertir **la misma cantidad cada mes** se llama DCA. Las caídas juegan a tu favor.'),
  ]),
  play({
    title: '¿De golpe o poco a poco?',
    intro: 'Tienes **12.000 €** para el S&P 500, con datos reales. ¿Todo el primer mes o repartido en 12? Mira cuánto tendrías 10 años después.',
    widget: { kind: 'dca', series: 'series-sp500-monthly', total: 12000, spread: 12, window: 120, start: 0 },
    predict: {
      prompt: 'Mirando todos los meses de inicio posibles, ¿qué gana más veces a 10 años?',
      options: ['Repartir, casi siempre', 'Todo de golpe, unas tres de cada cuatro veces', 'Mitad y mitad'],
      answer: 1,
      why: 'Todo de golpe gana en el **74 %** de los meses de inicio. La gestora Vanguard, con el índice mundial MSCI World de 1976 a 2022, lo vio un 68 % de las veces tras un año.',
    },
    goal: { text: 'Busca un mes de inicio en el que repartir saliera mejor.', when: [when('lumpWins', '==', 0)] },
    insight: '**De golpe suele ganar**, porque el mercado sube más veces de las que baja. **Repartir** gana justo antes de una caída y reduce el arrepentimiento, pero nadie sabe cuándo llega.',
    lumi: [
      { when: when('lumpWins', '==', 0), say: '¡Aquí ganó repartir! Mira lo que vino justo después: una caída.', mood: 'THINKING' },
      { when: when('diffPct', '>=', 10), say: 'De golpe gana por mucho: el mercado subió desde el principio.', mood: 'HAPPY' },
      { say: 'Mueve el mes de inicio. Prueba justo antes de una crisis', mood: 'HAPPY' },
    ],
  }),
  key('Con una suma grande', 'Con el sueldo, lo natural es aportar una parte cada mes. Si un día tienes una suma grande (una herencia, un finiquito), una solución intermedia razonable es repartirla en **6–12 meses** con aportaciones automáticas.\n\nLo que no funciona es esperar «a que baje»: nadie sabe cuándo es el suelo.', 'De golpe suele ganar más veces; poco a poco reduce el arrepentimiento. Lo importante es empezar y no parar.', 'Pruébalo: en Mercado, compra un poco de un ETF: será tu aportación de este mes.'),
], [
  num('Inviertes 100 € al mes y el precio pasa por 10, 8, 5, 8 y 10 €. ¿Cuántas participaciones tienes en total?', 65, 'participaciones', '100 ÷ 10 + 100 ÷ 8 + 100 ÷ 5 + 100 ÷ 8 + 100 ÷ 10 = 10 + 12,5 + 20 + 12,5 + 10 = 65.'),
  num('Con esas 65 participaciones por 500 €, ¿cuál es tu precio medio de compra? (redondea a dos decimales)', 7.69, '€', '500 ÷ 65 ≈ 7,69 €. Al acabar en 10 €, ganas un 30 % sin que el precio haya subido.'),
  upDown('Septiembre de 2008. Empiezas a aportar 200 € al mes a un fondo del S&P 500. ¿Qué hizo el índice en los meses siguientes?', 'hist-2008', 'Con aportaciones periódicas, cuando el precio cae compras más participaciones con el mismo dinero: las caídas trabajan a tu favor si no paras.', 'los meses siguientes'),
  upDown('Julio de 2012: el IBEX 35 lleva años de crisis y casi nadie quiere invertir en España. Si aportabas cada mes, ¿qué pasó después?', 'hist-ibex-2012', 'Quien aportaba cada mes compró muchas participaciones baratas en lo peor de la crisis. El DCA no exige adivinar el suelo.', 'el año y medio siguiente'),
  scenario('Ana hereda 30.000 € para invertir a largo plazo. Sabe por experiencia que si lo invierte todo y cae un 20 % al mes siguiente, lo vendería todo por nervios. ¿Qué opción encaja mejor con lo que sabe de sí misma?', [['Invertirlo todo hoy', 'Estadísticamente gana entre 2 de cada 3 y 3 de cada 4 veces, según el estudio, pero Ana ya sabe que abandonaría en una caída, y eso sería lo peor.'], ['Repartirlo en 6–12 meses con aportaciones automáticas', 'Buena solución intermedia: entra en el mercado sin el miedo a hacerlo todo el peor día.'], ['Esperar a que la bolsa baje', 'Nadie sabe cuándo bajará: mientras espera, el mercado puede subir un 30 %.']], 1, 'La mejor estrategia es la que vas a poder mantener. Esperar «el momento» suele ser la peor.'),
  tf('Según Vanguard, invertir una suma grande de golpe ganó a repartirla unas dos de cada tres veces.', true, 'Porque el mercado sube más veces de las que baja: esperar suele costar.'),
  single('¿Por qué invertir de golpe gana más veces que repartir?', ['Porque el mercado sube más veces de las que baja', 'Porque las comisiones son menores', 'Porque los bancos lo prefieren'], 0, 'Cada mes que esperas, el dinero que falta por invertir no está en el mercado.'),
  buckets('¿Es una ventaja de las aportaciones periódicas o de invertir de golpe?', ['Aportaciones periódicas', 'De golpe'], [['Reduce el arrepentimiento si cae justo después', 0], ['Históricamente gana más veces', 1], ['Encaja con cobrar un sueldo cada mes', 0], ['Todo el dinero trabaja desde el primer día', 1], ['Automatiza la disciplina', 0]], 'Las dos son válidas: lo que no funciona es intentar adivinar el momento.'),
  timed(tf('Las aportaciones periódicas garantizan comprar en el precio mínimo.', false, 'Compras a precios variados: tu precio medio es razonable, pero no el mínimo.'), 10),
  fill('Invertir la misma cantidad cada mes, pase lo que pase, se llama ____.', 'DCA', ['rebalanceo', 'apalancamiento', 'market timing'], 'Dollar-cost averaging: aportaciones periódicas.'),
], { source: '4.3', minutes: 6, retire: [0, 1, 5, 6, 8] })

// Antes en u10 (mismo id: conserva progreso y traducciones)
export const u10l3 = lesson('u10l3', 'Comisiones: el TER y los costes ocultos', [
  story('El equipo estrella', [{ id: 'ana', name: 'Ana' }, { id: 'banco', name: 'Gestor del banco' }], [
    note('Ana tiene 24 años y va al banco a hacer su primera inversión.'),
    say('banco', 'Ana, te recomiendo nuestro fondo de acciones. Lo gestiona un equipo estrella.'),
    say('ana', '¿Y cuánto cobra?'),
    say('banco', 'Un 2 % al año. Es calidad.'),
    note('Un fondo indexado parecido, que solo copia el índice, cobra un 0,2 %.'),
    choose('¿Qué debería pensar Ana?', [
      opt('Si es un equipo estrella, merece la pena', 'bad', say('lumi', 'Tendría que batir al índice 1,8 puntos al año, años seguidos. Casi nadie lo logra.')),
      opt('El caro tiene que ganar 1,8 puntos más cada año solo para empatar', 'good', say('lumi', '¡Eso! El coste es seguro; batir al índice, no.')),
      opt('Que lo pruebe un año y compare', 'ok', say('lumi', 'Un año dice poco: puede ser suerte. El coste, en cambio, se paga siempre.')),
    ]),
    say('lumi', '¿Un 2 % te parece poco? Mira lo que se come en 30 años.'),
  ]),
  play({
    title: 'El coste que no ves',
    intro: 'Los mismos **10.000 €** y el mismo mercado: un 7 % al año antes de costes. Un fondo cobra un **0,2 %** al año; el otro, lo que tú elijas.',
    widget: { kind: 'fees', amount: 10000, monthly: 0, gross: 7, feeA: 0.2, feeB: 0.5, years: 10, maxFee: 2.5, maxYears: 40 },
    predict: {
      prompt: 'A 30 años, un fondo cobra un 0,2 % y otro un 1,5 %. ¿Cuánto se lleva la diferencia?',
      options: ['Poco: más o menos un 1 % del resultado', 'Casi un tercio del resultado', 'Más de la mitad'],
      answer: 1,
      why: 'El coste se cobra **cada año** y se compone: el barato acaba en 71.968 € y el caro en 49.840 €. Son **22.128 €**, un 31 %.',
    },
    goal: { text: 'Pon el fondo caro al 1,5 % y mira qué pasa a 30 años.', when: [when('feeB', '>=', 1.45), when('years', '>=', 30)] },
    insight: 'El **TER** (gastos corrientes) no llega en ninguna factura: se descuenta poco a poco del valor del fondo. A 30 años, un 1,5 % al año se lleva **casi un tercio** de tu dinero.',
    lumi: [
      { when: when('lostPct', '>=', 30), say: '¡Casi un tercio de tu dinero, en comisiones!', mood: 'WORRIED' },
      { when: when('lostPct', '>=', 10), say: 'Sigue: con más años, la diferencia se dispara.', mood: 'THINKING' },
      { say: 'Sube la comisión del fondo caro y los años', mood: 'HAPPY' },
    ],
  }),
  key('Los costes ocultos', 'Un indexado puede cobrar un 0,1-0,3 % al año; muchos fondos activos (con un equipo que elige empresas) en España, un 1,5 % o más. Lo verás en el **KID**, como gastos corrientes.\n\nAdemás del TER: comisión del bróker por operación, *spread* (la diferencia entre el precio de compra y el de venta), custodia (lo que cobran por guardarte los valores), cambio de divisa y, en algunos fondos, comisiones al entrar o al salir (de suscripción o de reembolso). Súmalos todos.', 'Cada 1 % anual de costes se come una parte enorme del resultado, por el interés compuesto.', 'Pruébalo: en Mercado, empieza a comprar un ETF y mira la comisión simulada antes de confirmar.'),
], [
  num('10.000 € a 30 años al 7 % anual sin costes se convierten en 76.123 €. Con un 1 % de costes anuales (6 % neto), ¿en cuánto? (redondea a euros)', 57435, '€', '10.000 × 1,06³⁰ ≈ 57.435 €.'),
  num('Con esos datos, ¿cuánto te cuesta en total ese 1 % anual a 30 años? (redondea)', 18688, '€', '76.123 − 57.435 = 18.688 €: casi el doble de lo que invertiste, solo en costes.'),
  num('Tienes 20.000 € en un fondo con un TER del 1,8 %. ¿Cuánto pagas este año?', 360, '€', '20.000 × 1,8 % = 360 €. En un indexado al 0,2 % serían 40 €.'),
  single('¿Dónde encuentras los gastos corrientes de un fondo?', ['En el KID (Documento de Datos Fundamentales)', 'En una factura mensual de la gestora', 'Solo en la publicidad del banco'], 0, 'Es obligatorio que aparezcan en el KID, junto al resto de costes.'),
  multi('¿Qué costes pueden reducir tu rentabilidad? Marca todos.', ['TER o gastos corrientes', 'Comisión del bróker', 'Cambio de divisa', 'Que el fondo tenga muchos partícipes'], [0, 1, 2], 'También el spread, la custodia y los impuestos. El número de partícipes no es un coste.'),
  scenario('El banco le ofrece a Ana un fondo de acciones con un TER del 2 % «porque lo gestiona un equipo estrella». Un indexado parecido cobra un 0,2 %. ¿Qué piensa?', [['Si es un equipo estrella, merece la pena', 'Para compensar, el equipo tiene que batir al índice por 1,8 puntos al año durante años. Muy pocos lo consiguen.'], ['Que el caro tiene que ganar 1,8 puntos más cada año solo para empatar', 'Bien: el coste es seguro; batir al índice, no.'], ['Elige el que tenga mejor logo', 'El logo no cambia la cuenta: lo que pagas cada año, sí.']], 1, 'Un coste alto es una desventaja segura; la supuesta habilidad para compensarlo, no.'),
  order('Ordena de mayor a menor resultado: 10.000 € a 30 años con un mercado al 7 %.', ['Sin costes', 'Con un 0,2 % de costes', 'Con un 1 % de costes', 'Con un 1,5 % de costes'], '76.123 €, 71.968 €, 57.435 € y 49.840 €.'),
  tf('Un TER del 1,5 % solo te quita un 1,5 % del resultado final a 30 años.', false, 'Se cobra cada año y se compone: a 30 años se lleva alrededor de un tercio del resultado.'),
  timed(fill('El coste anual de un fondo o ETF se llama gastos corrientes o ____.', 'TER', ['IVA', 'TAE', 'PER'], 'Total Expense Ratio. Lo encontrarás en el KID.'), 12),
  chat(['Mi fondo cobra un 1,8 %, pero nunca me han cobrado nada en la cuenta 🤔'], '¿Qué le explicas?', [['Entonces no lo cobra', 'Sí lo cobra: sale del valor del fondo cada día, por eso no lo ves.'], ['Se descuenta cada día del valor del fondo, por eso no lo ves', '¡Eso! Es el coste más silencioso: no llega factura, pero lo pagas.'], ['Lo cobra Hacienda a final de año', 'No es un impuesto: es lo que se queda la gestora.']], 1, 'Que no veas un cargo no significa que no pagues: el TER ya está restado del valor liquidativo.'),
  // Nuevas (sección 0): sustituyen a las tres de cálculo
  scenario('Dos ETF copian exactamente el mismo índice. Uno cobra un 0,2 % al año y el otro, un 1 %. Vas a dejar 10.000 € durante 30 años. ¿Cuál eliges?', [['El del 0,2 %: si copian lo mismo, el barato te deja más', 'Eso es: antes de costes darán lo mismo, así que gana el que menos se queda por el camino.'], ['El del 1 %: si cobra más, será mejor', 'Copian el mismo índice: cobrar más no les hace ganar más, solo te deja menos a ti.'], ['Da igual: es menos de un punto de diferencia', 'Ese punto se cobra cada año y se compone: a 30 años son miles de euros.']], 0, 'Con el mismo índice dentro, el coste es lo único que cambia. Con un mercado al 7 %, el del 0,2 % acaba en 71.968 € y el del 1 %, en 57.435 €. «Menos de un punto» parece poco, pero se cobra cada año sobre todo lo acumulado.'),
  buckets('¿Coste bajo o alto para un fondo de acciones?', ['Bajo, como un indexado', 'Alto, como muchos fondos activos'], [['Un TER del 0,2 %', 0], ['Un TER del 1,8 %', 1], ['Un TER del 0,1 %', 0], ['Un TER del 2 %', 1], ['Un TER del 0,3 %', 0], ['Un TER del 1,5 %', 1]], 'Un indexado puede cobrar un 0,1-0,3 % al año; muchos fondos activos, con un equipo que elige empresas, un 1,5 % o más. Parece poca diferencia, pero se cobra cada año: a 30 años, un 1,5 % se lleva casi un tercio del resultado.'),
], { source: '4.2', minutes: 6, retire: [0, 1, 2, 5, 6, 7, 8] })

// Antes en u04 (mismo id: conserva progreso y traducciones)
export const u4l3 = lesson('u4l3', 'Tu horizonte temporal', [
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
    insight: 'En estos datos, sin contar dividendos, esperando **14 años o más** nunca se perdió dinero. Pero el pasado no garantiza el futuro: quien compró en 1929, o en Japón en 1989, esperó mucho más. El plazo decide el riesgo que puedes asumir.',
    lumi: [
      { when: when('years', '<=', 2), say: 'A corto plazo la bolsa es una montaña rusa: casi cualquier cosa puede pasar.', mood: 'WORRIED' },
      { when: when('years', '>=', 10), say: 'Mira el peor caso: aún hay periodos largos en pérdidas (los que empezaron en 2000).', mood: 'THINKING' },
      { say: 'Sigue alargando la espera', mood: 'HAPPY' },
    ],
  }),
  key('Ponle fecha a cada euro', '• **Colchón para imprevistos (siempre disponible):** cuenta remunerada, que te paga intereses, o fondo monetario, muy estable.\n• **Viaje o coche (1-3 años):** depósitos o Letras del Tesoro, es decir, prestar al banco o al Estado a plazo fijo.\n• **Entrada de un piso (3-7 años):** mezcla prudente, con más renta fija (bonos).\n• **Jubilación (15 años o más):** sobre todo acciones diversificadas.\n\nUn ejemplo de cartera sencilla a largo plazo: un ETF indexado de todo el mundo, comisiones bajas, una aportación cada mes y solo dinero que no vayas a necesitar en muchos años.', 'No se invierte en bolsa el dinero que se necesita pronto: puede estar bajando justo cuando lo necesites.', 'Pruébalo: en Mercado, abre el S&P 500 en velas mensuales y mira cuánto tardó en recuperarse de 2008.'),
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
], { source: '1.5', minutes: 6, retire: [3, 6, 8] })

const lessons = [u7l1, u10l2, u29l1, u25l2, u10l3, u4l3]
export default lessons
