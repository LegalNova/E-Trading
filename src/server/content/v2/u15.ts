import 'server-only'
// Sección 5 · Unidad 15 · Materias primas (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, level, match, mission, multi, note, num, opt, play, point, say, scenario, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

const CFD = 'Los CFD son instrumentos complejos y están asociados a un riesgo elevado de perder dinero rápidamente debido al apalancamiento. Entre un 74 y un 89 % de los inversores minoristas pierden dinero cuando negocian con CFD.'

export default unit({
  id: 'u15', order: 15, title: 'Materias primas', description: 'Oro, petróleo, metales y agrícolas: qué los mueve y cómo se invierte en ellos',
  lessons: [
    lesson('u15l1', 'El oro', [
      mission({
        title: '25 años de oro',
        intro: 'Agosto de 2000: entras con **1.000 €** en oro. Vive 25 años mes a mes, con **datos reales**, y decide si vendes.',
        widget: { kind: 'crash', series: 'series-gold', amount: 1000 },
        predict: {
          prompt: 'El oro marcó un máximo en agosto de 2011. ¿Cuánto tardó en volver a superarlo?',
          options: ['Unos meses', 'Unos 2 años', 'Casi 9 años'],
          answer: 2,
          why: 'Cerró agosto de 2011 en 1.829 $ y bajó hasta 1.060 $ a finales de 2015 (**−42 %**). No volvió a superar aquel máximo hasta julio de 2020.',
        },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Quien aguantó multiplicó su dinero por más de 15, con **casi 9 años** por debajo del máximo de 2011. El oro no paga nada: solo ganas si otro paga más mañana.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('played', '==', 1), say: 'Más de 15 veces en 25 años, con un largo bache en medio.', mood: 'CALM' },
          { when: when('drop', '>=', 500), say: '¡Seis veces más! ¿Seguirá subiendo sin parar?', mood: 'THINKING' },
          { when: when('drop', '>=', 100), say: 'Ya se ha duplicado. Y no te ha pagado ni un euro de intereses.', mood: 'HAPPY' },
          { say: 'Dale a empezar: 25 años de oro, mes a mes', mood: 'HAPPY' },
        ],
      }),
      // Auditoría RED-34: la mezcla «acciones, bonos y oro 2008-2025» se vivía en siete clases. Aquí va otra serie real
      // (cierres mensuales ajustados de Yahoo Finance); las cifras del texto salen de `charts.json` con la cuenta de la pieza.
      play({
        title: 'Un poco de oro en la cartera',
        intro: 'Enero de 2007: **10.000 €** en acciones de EE. UU., rebalanceando cada año (datos reales hasta 2025). Añade algo de oro y mira la peor caída.',
        widget: { kind: 'mix', series: 'mix-commodities', weights: [100, 0, 0], amount: 10000, rebalance: true },
        predict: {
          prompt: 'En la crisis de 2008, mientras las acciones se hundían, ¿qué hizo el oro?',
          options: ['Se hundió igual que las acciones', 'Subió mientras la bolsa caía', 'Se multiplicó por dos'],
          answer: 1,
          why: 'De octubre de 2007 a febrero de 2009, las acciones cayeron un 51 % y el oro subió un 18 %.',
        },
        goal: { text: 'Con al menos un 10 % de oro, consigue que la peor caída no pase del −40 %.', when: [when('w1', '>=', 10), when('maxDD', '>=', -40)] },
        insight: 'Como a veces sube cuando la bolsa cae, **un poco de oro suavizó la peor caída**: del −51 % al −40 % con un 20 %. Pero solo, el oro también llegó a caer un 43 %. Y no todas las materias primas son refugio: la cesta variada cayó un 75 % y en 19 años apenas ganó un 15 %.',
        lumi: [
          { when: when('w1', '>=', 50), say: 'Mucho oro: recuerda que no paga intereses ni dividendos.', mood: 'THINKING' },
          { when: when('maxDD', '>=', -40), say: '¡Mira cómo se suaviza la peor caída!', mood: 'HAPPY' },
          { say: 'Sube el oro poco a poco y mira la peor caída', mood: 'HAPPY' },
        ],
      }),
      key('Por qué se compra oro', 'El oro **no paga intereses ni dividendos**. Se compra como **refugio**: en crisis, frente a la inflación o cuando se desconfía de las monedas, y los bancos centrales lo acumulan como reserva. Cuando los **tipos de interés reales** (descontada la inflación) suben, tenerlo «cuesta» más y suele sufrir.\n\nSu máximo de 1980, unos 850 $ la onza, no lo superó hasta **2008**, y por el camino perdió mucho valor real. En 2020 pasó de 2.000 $ y en 2025, por primera vez, de **4.000 $**.', 'El oro protege a veces, pero no produce nada.', 'Pruébalo: en Mercado, busca el oro y mira cuánto ha subido este año.'),
    ], [
      trend('Mira el oro desde 2018 hasta el verano de 2020. ¿Qué tendencia ves?', 'hist-gold-2020', 'Alcista', 'De unos 1.200 $ a más de 2.000 $: miedo, tipos bajos y pandemia empujaron al refugio.'),
      point('Toca el punto más bajo del oro en este periodo.', 'hist-gold-2020', 'min', 'El mínimo fue a finales de 2018, en torno a 1.190 $. Desde ahí subió alrededor de un 70 % hasta agosto de 2020.'),
      upDown('Agosto de 2020: el oro acaba de marcar un récord por encima de 2.000 $ en plena pandemia. ¿Qué hizo en los meses siguientes?', 'hist-gold-2020', 'Ese verano nadie sabía cuándo llegarían las vacunas ni qué harían los tipos de interés reales, que son de lo que más pesa en el oro.', 'hasta diciembre de 2021'),
      single('¿Qué genera el oro cada año a su dueño?', ['Nada: ni intereses ni dividendos', 'Un cupón fijo', 'Dividendos de las minas'], 0, 'Solo ganas si otro paga más mañana. Por eso no se puede valorar con un PER.'),
      tf('El oro marcó un máximo en 1980 que no volvió a superar hasta 2008.', true, 'Unos 850 $ la onza en 1980. Contando la inflación, quien compró en el máximo perdió muchísimo poder de compra.'),
      upDown('Gráfico real de una materia prima: 30 sesiones sin nombre ni fecha. ¿Qué hizo en las 10 siguientes?', 'ud-51', 'Que un activo sea «refugio» no lo hace predecible a corto plazo: también tiene semanas muy volátiles.'),
      multi('¿Qué suele favorecer al oro? Marca todas.', ['Miedo en los mercados', 'Bajadas de los tipos de interés reales', 'Compras de los bancos centrales', 'Tipos reales muy altos y subiendo'], [0, 1, 2], 'Con tipos reales altos, un bono que paga compite con ventaja frente a un activo que no paga nada.'),
      num('El oro pasó de unos 850 $ en 1980 a unos 2.000 $ en 2020. ¿Cuánto subió en total (en %)?', 135, '%', '(2.000 − 850) ÷ 850 ≈ 135 % en 40 años: poco más de un 2 % anual, por debajo de la inflación de EE. UU. en ese periodo.', 3),
      timed(single('Rápido: ¿qué suele pasarle al oro cuando suben mucho los tipos reales?', ['Suele sufrir', 'Siempre sube', 'Paga más dividendo'], 0, 'Tener un activo sin rentas sale más caro frente a un bono que paga más.'), 12),
      chat(['Mi tío dice que el oro «nunca baja» y que lo meta todo ahí 🪙'], '¿Qué le contestas a Lumi?', [['Tiene razón, es el refugio perfecto', 'Ojo: tardó 28 años en recuperar su máximo de 1980.'], ['El oro puede pasar décadas sin subir; como mucho, una parte pequeña para diversificar', 'Vale: no es una hucha mágica, es una pieza más de la cartera.'], ['El oro paga buenos dividendos', 'No paga nada: solo ganas si sube el precio.']], 1, 'Ningún activo «nunca baja». El oro diversifica, pero también tiene rachas muy largas sin subir.'),
      level('Has comprado oro al último precio. Aunque sea un refugio, coloca el stop algo por debajo del último mínimo.', 'lvl-8', 'STOP', 'Un refugio también cae: el oro llegó a perder un 42 % desde su máximo de 2011. El stop va algo por debajo del último mínimo, con margen, porque si lo pierde tu idea deja de valer. Ponerlo pegado al precio es la tentación, pero un vaivén normal lo salta.'),
    ], { source: '2.8', minutes: 6, retire: [2, 4, 7, 8, 9] }),

    lesson('u15l2', 'El petróleo y la OPEP', [
      mission({
        title: 'El petróleo, semana a semana',
        intro: 'Mayo de 2019: entras con **1.000 €** en petróleo WTI, justo antes de una pandemia y una guerra. Vívelo con **datos reales** y decide si vendes.',
        widget: { kind: 'crash', series: 'series-oil', amount: 1000 },
        predict: {
          prompt: 'Abril de 2020: el mundo está confinado. ¿Cuánto llegan a valer tus 1.000 €?',
          options: ['Unos 900 €: el petróleo siempre se necesita', 'Unos 600 €', 'Menos de 350 €'],
          answer: 2,
          why: 'La semana del 20 de abril de 2020 cerró en 16,94 $ el barril: **−68 %**. Tus 1.000 € valían unos 317 €.',
        },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Del −68 % de 2020 a más del doble en 2022: el crudo se mueve por **oferta, demanda y geopolítica**, y lo hace con violencia.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -50), say: 'Carreteras vacías y casi sin sitio para guardar crudo. ¿Vendes?', mood: 'WORRIED' },
          { when: when('drop', '>=', 50), say: '¡El crudo se dispara! Hace poco nadie lo quería.', mood: 'THINKING' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Qué mueve el crudo?',
        intro: 'El precio del petróleo depende de cuánto se pide, cuánto se produce y cuánto sobra. ¿Qué suele hacer en cada caso?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Tiende a subir' }, { label: 'Tiende a bajar' }],
          cards: [
            { icon: 'factory', label: 'La OPEP+ recorta su producción', bin: 0, why: 'Menos oferta con la misma demanda: el precio sube.' },
            { icon: 'down', label: 'Recesión mundial', bin: 1, why: 'Se fabrica y se viaja menos: cae la demanda.' },
            { icon: 'ship', label: 'Conflicto en el estrecho de Ormuz', bin: 0, why: 'Sube por miedo a que se corte el suministro.' },
            { icon: 'database', label: 'Inventarios llenos y sin sitio para almacenar', bin: 1, why: 'Sobra crudo: presión bajista, como en abril de 2020.' },
            { icon: 'globe', label: 'China crece más de lo esperado', bin: 0, why: 'EE. UU. y China son los que más pesan en la demanda.' },
            { icon: 'home', label: 'Confinamiento mundial: nadie viaja', bin: 1, why: 'Lo que pasó en 2020: la demanda se hundió de golpe.' },
          ],
        },
        goal: { text: 'Clasifica los seis casos.', when: [when('done', '==', 6)] },
        insight: 'La **OPEP+** (la OPEP, nacida en 1960, más Rusia y otros desde 2016) pacta cuánto se produce; la demanda la marcan sobre todo EE. UU. y China.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿hay más crudo del que se pide, o menos?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Oferta, demanda, almacenamiento y geopolítica.', mood: 'HAPPY' },
          { say: '¿Sube o baja el crudo? Clasifica cada caso', mood: 'HAPPY' },
        ],
      }),
      key('Brent, WTI y tres sustos', '**Brent** (mar del Norte) es la referencia en Europa; **WTI** (Texas, entregado en Cushing), en EE. UU. Se cotizan en **dólares por barril** (unos 159 litros): por eso a España también le afecta el dólar.\n\n• **1973:** el embargo de la OPEP cuadruplicó el precio.\n• **2008:** el WTI rozó los **147 $** en julio… y en diciembre estaba por debajo de 40 $.\n• **20 de abril de 2020:** el contrato de mayo del WTI cerró a **−37,63 $**: el vendedor pagaba por que se lo llevaran.', 'El petróleo se mueve por oferta, demanda y geopolítica, y puede hacerlo con violencia.', 'Pruébalo: en Mercado, compara el gráfico del petróleo WTI con el del Brent.'),
    ], [
      trend('Así se movió el WTI desde mediados de 2019 hasta abril de 2020. ¿Qué tendencia ves?', 'hist-oil-2020', 'Bajista', 'De más de 50 $ a menos de 20 $ en cierre semanal: la pandemia hundió la demanda justo cuando Arabia Saudí y Rusia peleaban por cuota de mercado.'),
      point('Toca el punto más bajo de este periodo (cierres semanales).', 'hist-oil-2020', 'min', 'La semana del 20 de abril de 2020 cerró en unos 17 $. El −37,63 $ no aparece en cierres semanales: fue un solo día y un solo contrato, el de mayo, justo antes de vencer.'),
      upDown('20 de abril de 2020: el WTI acaba de tocar precios negativos. Las carreteras están vacías y casi no queda dónde almacenar crudo. ¿Qué hizo el petróleo después?', 'hist-oil-2020', 'En ese momento casi nadie se atrevía con previsiones: todo dependía de cuándo terminaran los confinamientos y de los recortes de la OPEP+.', 'hasta junio de 2021'),
      scenario('Marzo de 2022: estalla la guerra en Ucrania y el Brent se dispara. Pablo quiere comprar ya acciones petroleras «porque esto solo puede subir». ¿Qué le dices?', [['Que compre todo lo que pueda', 'Entrar en pleno pico por euforia es muy arriesgado: el crudo también baja con violencia (2008).'], ['Que el precio ya refleja la noticia y puede girarse rápido: que no decida por titulares', 'Bien: tras el pico de marzo de 2022, el crudo bajó con fuerza en los meses siguientes.'], ['Que venda todo lo que tenga en bolsa', 'Una noticia no justifica deshacer toda una cartera.']], 1, 'Las materias primas reaccionan muy rápido a la geopolítica: cuando lees el titular, el precio ya ha saltado.'),
      single('¿Qué es la OPEP+?', ['La OPEP más otros productores como Rusia, que pactan cuotas de producción', 'Un índice de precios del petróleo', 'Una petrolera estatal saudí'], 0, 'Desde 2016 coordina la producción de una veintena de países.'),
      match('Empareja cada hecho con su efecto habitual en el crudo.', [['La OPEP+ recorta producción', 'Tiende a subir'], ['Recesión mundial', 'Tiende a bajar'], ['Inventarios llenos y sin sitio para almacenar', 'Presión bajista extrema'], ['Conflicto en una zona productora', 'Sube por miedo a un corte de suministro']], 'Oferta, demanda, almacenamiento y geopolítica.'),
      tf('El 20 de abril de 2020, el contrato de mayo del WTI cerró a −37,63 $: el vendedor pagaba al comprador.', true, 'Quien tenía contratos a punto de vencer no tenía dónde guardar el crudo y pagó por deshacerse de ellos.'),
      timed(fill('El Brent y el WTI se cotizan en dólares por ____.', 'barril', ['tonelada', 'litro', 'onza'], 'Un barril son unos 159 litros.'), 12),
      num('Un barril tiene unos 159 litros. Si el Brent cotiza a 80 $ y EUR/USD = 1,16, ¿cuánto cuesta un litro de crudo en euros? (redondea a céntimos)', 0.43, '€', '80 ÷ 1,16 ≈ 68,97 € por barril; 68,97 ÷ 159 ≈ 0,43 € por litro. El resto del precio de la gasolina son refino, transporte, márgenes e impuestos.', 3),
      single('¿Por qué un euro fuerte abarata el petróleo para España?', ['Porque el crudo se paga en dólares', 'Porque España produce mucho petróleo', 'Porque la OPEP cobra en euros'], 0, 'Con más dólares por euro, el mismo barril cuesta menos euros.'),
      level('Has comprado petróleo WTI al último precio. El crudo se mueve con violencia: coloca el stop algo por debajo del último mínimo.', 'lvl-19', 'STOP', 'Con un activo tan brusco, el stop necesita margen: algo por debajo del último mínimo, donde tu idea deja de valer. Pegado al precio, cualquier titular de la OPEP+ lo salta; sin stop, una caída como la de 2020 te pilla entera.'),
    ], { source: '2.8', minutes: 6, retire: [0, 2, 6, 7, 8] }),

    lesson('u15l3', 'Metales industriales y agrícolas', [
      story('El chocolate de Irene', [{ id: 'irene', name: 'Irene' }], [
        say('irene', 'Tengo una chocolatería y mi proveedor me ha vuelto a subir el precio. ¡Es una locura!'),
        note('2024: malas cosechas de cacao en África occidental.'),
        choose('¿Qué crees que pasó con el cacao ese año?', [
          opt('Subió un poco, como la inflación', 'bad', say('lumi', 'Mucho más: el cacao subió un **178 %** en 2024.')),
          opt('Se disparó: menos cosecha, precio mucho más alto', 'good', say('lumi', '¡Eso! Subió un **178 %** en el año: casi se triplicó.')),
          opt('Bajó, porque se vendía menos chocolate', 'bad', say('lumi', 'Al revés: con menos cosecha, el cacao subió un **178 %**.')),
        ]),
        say('lumi', 'En 2022, la invasión de Ucrania llevó el trigo a máximos de 14 años.'),
        say('lumi', 'Rusia y Ucrania sumaban cerca del 30 % de las exportaciones mundiales.'),
        say('irene', '¿Y si invierto en cacao para compensar?'),
        say('lumi', 'Se negocia con futuros: no es tan sencillo como «comprar cacao».'),
      ]),
      play({
        title: '¿Economía o clima?',
        intro: 'Unas materias primas se mueven con la **economía** y otras, con el **campo**. ¿De qué tipo es cada una?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Metal: lo mueve la economía' }, { label: 'Agrícola: lo mueve el clima' }],
          cards: [
            { icon: 'mining', label: 'Cobre', bin: 0, why: 'Cables, construcción, coches eléctricos: está en casi todo lo que se fabrica.' },
            { icon: 'coffee', label: 'Café', bin: 1, why: 'Una helada o una sequía en Brasil bastan para dispararlo.' },
            { icon: 'power', label: 'Litio', bin: 0, why: 'Va a las baterías: depende de la industria.' },
            { icon: 'bread', label: 'Trigo', bin: 1, why: 'Cosechas, clima y guerras en los grandes exportadores.' },
            { icon: 'factory', label: 'Aluminio', bin: 0, why: 'Un metal industrial: sube y baja con lo que se fabrica.' },
            { icon: 'leaf', label: 'Cacao', bin: 1, why: 'Depende de las cosechas de África occidental.' },
          ],
        },
        goal: { text: 'Clasifica las seis materias primas.', when: [when('done', '==', 6)] },
        insight: 'Al cobre le llaman **«doctor Cobre»** porque su precio suele anticipar cómo va la economía. Los agrícolas dependen de **cosechas, clima y guerras**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿sale de una mina o de un campo?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Cada materia prima tiene su motor.', mood: 'HAPPY' },
          { say: '¿Metal o agrícola? Clasifica cada una', mood: 'HAPPY' },
        ],
      }),
      key('Mucho más volátiles', 'La **plata** es mitad joya, mitad industria: casi el **60 %** de su demanda en 2024 fue industrial (electrónica, paneles solares). Aluminio, níquel y litio dependen de la industria y las baterías.\n\nLos agrícolas pueden duplicarse o hundirse por una sequía o una helada. Además se negocian con **futuros**, así que invertir en ellos no es tan sencillo como «comprar café».', 'Metales industriales: termómetro de la economía. Agrícolas: clima y cosechas.', 'Pruébalo: en Mercado, busca el cobre y añádelo a Favoritos como termómetro económico.'),
    ], [
      match('Empareja cada materia prima con lo que más la mueve.', [['Cobre', 'El ciclo económico y la construcción'], ['Cacao', 'Las cosechas de África occidental'], ['Trigo', 'Cosechas y conflictos en grandes exportadores'], ['Plata', 'La industria y la demanda como refugio']], 'Cada materia prima tiene su motor principal.'),
      buckets('¿Metal industrial o agrícola?', ['Metal industrial', 'Agrícola'], [['Cobre', 0], ['Café', 1], ['Aluminio', 0], ['Maíz', 1], ['Níquel', 0], ['Azúcar', 1]], 'Los metales dependen de la industria; los agrícolas, del campo y del clima.'),
      single('¿Por qué al cobre le llaman «doctor Cobre»?', ['Porque su precio suele anticipar cómo va la economía', 'Porque se usa mucho en hospitales', 'Porque lo regula un organismo médico'], 0, 'Está en casi todo lo que se construye y fabrica: si la economía se acelera o frena, se nota en su precio.'),
      upDown('Gráfico real de un metal (30 sesiones, sin nombre ni fecha). ¿Qué hizo en las 10 siguientes?', 'ud-95', 'Los metales con uso industrial y de inversión se mueven por dos fuerzas a la vez, la economía y el miedo. Eso los hace muy volátiles.'),
      upDown('Otro metal real, otras 30 sesiones. ¿Sube o baja?', 'ud-92', 'Un movimiento fuerte en un sentido no anticipa el siguiente: algunos metales se mueven un 10 % en pocas semanas, en cualquier dirección.'),
      tf('Más de la mitad de la demanda de plata es industrial.', true, 'En 2024, casi un 60 %: electrónica, paneles solares… Por eso la plata suele sufrir más que el oro cuando la economía se frena.'),
      num('El cacao cerró 2023 en unos 4.200 $ por tonelada y subió un 178 % en 2024. ¿A cuánto cerró 2024 aproximadamente?', 11676, '$', '4.200 × 2,78 ≈ 11.676 $. En la realidad cerró 2024 en torno a 11.675 $ la tonelada.', 2),
      scenario('Una helada en Brasil amenaza la cosecha de café. Marta tiene una cafetería en Valencia. ¿Qué es lo más probable?', [['Que el café en grano se abarate', 'Una mala cosecha reduce la oferta: lo normal es lo contrario.'], ['Que el café en grano se encarezca y le suban los costes', 'Eso: menos oferta, precio más alto. En 2024 la sequía en Brasil llevó el arábica a récords.'], ['Que no le afecte porque compra a un proveedor español', 'Brasil es el mayor productor del mundo: el precio mundial acaba llegando a su proveedor.']], 1, 'En agrícolas, el clima de un gran productor mueve el precio mundial.'),
      timed(single('Rápido: ¿qué guerra disparó el precio del trigo en 2022?', ['La invasión rusa de Ucrania', 'La guerra comercial entre EE. UU. y China', 'Ninguna, fue una plaga'], 0, 'Rusia y Ucrania sumaban cerca del 30 % de las exportaciones mundiales de trigo.'), 12),
      multi('¿Qué puede subir el precio de una materia prima agrícola? Marca todas.', ['Una sequía en un gran productor', 'Una guerra que bloquea puertos', 'Una cosecha récord', 'Plagas o enfermedades en los cultivos'], [0, 1, 3], 'Una cosecha récord aumenta la oferta y suele bajar el precio.'),
    ], { source: '2.8', minutes: 6, retire: [1, 2, 5, 6, 8] }),

    lesson('u15l4', 'Cómo se invierte en materias primas', [
      story('La minera de Dani', [{ id: 'dani', name: 'Dani' }], [
        say('dani', 'El oro ha subido un 10 % y mi minera ha subido mucho más. ¿Cómo puede ser?'),
        note('Su minera saca cada onza a un coste de 1.500 $ y la vende a 2.000 $.'),
        choose('Si el oro sube un 10 %, ¿cuánto sube su margen por onza?', [
          opt('Un 10 %, como el oro', 'bad', say('lumi', 'El coste no sube: el margen pasa de 500 $ a 700 $, un **+40 %**.')),
          opt('Un 40 %: de 500 $ a 700 $', 'good', say('lumi', '¡Eso! Los costes fijos **amplifican** lo que hace el metal.')),
          opt('Nada: el margen es fijo', 'bad', say('lumi', 'El coste es fijo, el margen no: pasa de 500 $ a 700 $.')),
        ]),
        say('dani', '¡Entonces las mineras son mejores que el oro!'),
        say('lumi', 'Y al revés: si el oro cae un 10 %, el margen cae un 40 %.'),
      ]),
      play({
        title: '¿Directa o a través de una empresa?',
        intro: 'Hay cuatro caminos: metal **físico**, **ETC** (cotiza como un ETF), **futuros** y **acciones** de mineras o petroleras. ¿Cuál te da el precio directamente?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Directa al precio' }, { label: 'A través de una empresa' }],
          cards: [
            { icon: 'gem', label: 'Lingotes y monedas de oro', bin: 0, why: 'Tienes el metal, pero hay que guardarlo y se compra y vende con margen.' },
            { icon: 'mining', label: 'Acciones de una minera de oro', bin: 1, why: 'Dependen del oro, pero también de sus costes, su deuda y sus directivos.' },
            { icon: 'chart', label: 'ETC de oro físico', bin: 0, why: 'Cotiza en bolsa y está respaldado por lingotes guardados en una cámara.' },
            { icon: 'fuel', label: 'Acciones de una petrolera', bin: 1, why: 'Reparte dividendos; el barril, no. Es otro negocio.' },
            { icon: 'calendar', label: 'Futuro sobre el WTI', bin: 0, why: 'Contrato para comprar o vender en una fecha: apalancado y complejo.' },
            { icon: 'factory', label: 'Acciones de una minera de cobre', bin: 1, why: 'Compras la empresa, con su gestión, sus costes y su deuda.' },
          ],
        },
        goal: { text: 'Clasifica las seis formas de invertir.', when: [when('done', '==', 6)] },
        insight: 'Con una empresa compras también su **gestión, su deuda y sus costes**: no es lo mismo invertir en oro que en una minera de oro.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿compras la materia prima o un negocio?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Cada camino tiene riesgos muy distintos.', mood: 'HAPPY' },
          { say: '¿Directa o a través de una empresa?', mood: 'HAPPY' },
        ],
      }),
      // Auditoría RED-21: la pieza del apalancamiento se queda en u11l3 y u25l8. Aquí va la idea propia de la clase:
      // invertir en el metal no es lo mismo que invertir en quien lo extrae. Datos: ETF SPDR Gold Shares (GLD) y VanEck Gold
      // Miners (GDX), cierres mensuales ajustados de Yahoo Finance, enero de 2007 a diciembre de 2025: 10.000 → 61.131 y 25.451;
      // peor caída −42,9 % y −77,5 %. Fixture `mix-gold-miners`.
      play({
        title: 'El oro o quien lo saca',
        intro: 'Datos reales de 2007 a 2025: tienes **10.000 €** en oro. Pásalos a acciones de **empresas mineras de oro** y compara.',
        widget: { kind: 'mix', series: 'mix-gold-miners', weights: [100, 0], amount: 10000 },
        predict: {
          prompt: 'Si el oro se multiplicó por seis en esos años, ¿qué hicieron las mineras de oro?',
          options: ['Ganaron todavía más', 'Ganaron menos de la mitad y cayeron mucho más por el camino', 'Lo mismo que el oro'],
          answer: 1,
          why: 'El oro acabó en **61.131 €**; las mineras, en **25.451 €**. Y en su peor momento las mineras perdían un 77 %, frente a un 43 % del oro.',
        },
        goal: { text: 'Pasa todo a mineras y mira la peor caída.', when: [when('w1', '==', 100)] },
        insight: 'Una minera es un **negocio**: tiene costes, deuda y gestores. Su acción depende del oro, pero también de todo eso. **No es lo mismo invertir en oro que en una minera de oro.**',
        lumi: [
          { when: when('w1', '==', 100), say: 'Un 77 % de caída: para recuperarlo hay que multiplicar por más de cuatro.', mood: 'WORRIED' },
          { say: 'Mueve el peso entre el oro y las mineras', mood: 'HAPPY' },
        ],
      }),
      key('Antes de comprar', '• **Físico:** tienes el metal, pero hay que guardarlo y se compra y vende con margen.\n• **ETC:** cotiza como un ETF; técnicamente es un título de deuda. Los de oro suelen estar respaldados por metal físico; los de petróleo o agrícolas usan **futuros**, con un coste oculto que verás en la próxima clase.\n\nEn España, los ETC no son fondos: no permiten traspasos sin pagar impuestos y Hacienda trata su resultado de forma distinta a la de un ETF. Lee el documento de datos fundamentales y mira si el producto es **físico** o replica con **futuros**.', 'No es lo mismo invertir en oro que en una minera de oro.', 'Pruébalo: en Mercado, compara el gráfico del oro con el del ETF GDX de mineras.'),
    ], [
      match('Empareja cada forma de invertir con su característica.', [['Lingotes y monedas', 'Tienes el metal, pero hay que guardarlo'], ['ETC de oro físico', 'Cotiza en bolsa y está respaldado por metal'], ['Futuros', 'Contrato con vencimiento y apalancamiento'], ['Acciones de una minera', 'Dependen del metal y de la gestión de la empresa']], 'Cuatro caminos con riesgos muy distintos.'),
      single('¿Qué es un ETC?', ['Un producto cotizado que replica una materia prima', 'Un fondo de empresas tecnológicas', 'Una cuenta de ahorro en oro del banco'], 0, 'Cotiza en bolsa como un ETF, pero sigue a una materia prima.'),
      tf('Una acción de una minera de oro se mueve exactamente igual que el oro.', false, 'Suele moverse más, en los dos sentidos, porque tiene costes fijos y deuda.'),
      num('Una minera produce oro a un coste de 1.500 $ la onza y lo vende a 2.000 $. Si el oro sube un 10 %, ¿cuánto sube su margen por onza (en %)?', 40, '%', 'Margen antes: 500 $. Con el oro a 2.200 $: 700 $. (700 − 500) ÷ 500 = +40 %. Por eso las mineras amplifican lo que hace el metal… también cuando baja.'),
      buckets('¿Te da exposición directa al precio o a través de una empresa?', ['Directa a la materia prima', 'Indirecta (a través de una empresa)'], [['Lingote de oro', 0], ['ETC de oro físico', 0], ['Acciones de una petrolera', 1], ['Acciones de una minera de cobre', 1], ['Futuro sobre el WTI', 0]], 'Con una empresa compras también su gestión, su deuda y sus costes.'),
      tf('Los ETC de oro físico suelen tener lingotes guardados en una cámara para respaldar el producto.', true, 'Por eso siguen al oro muy de cerca, menos su pequeña comisión anual.'),
      scenario('Bruno quiere «invertir en petróleo». Quiere entender bien lo que compra y no usar apalancamiento. ¿Qué opción descarta primero?', [['Un ETC sobre futuros del WTI', 'No es la primera a descartar, pero tiene costes de renovar futuros: debe entenderlos antes.'], ['Futuros del WTI apalancados desde una app', 'Eso es: apalancamiento y vencimientos son justo lo que quiere evitar.'], ['Un fondo de acciones del sector energético', 'Es la más fácil de entender, aunque no sigue exactamente al barril.']], 1, 'Los futuros apalancados no son para empezar: se puede perder muy deprisa.'),
      timed(single('Rápido: ¿qué opción te obliga a guardar el metal tú mismo?', ['Lingotes y monedas', 'ETC', 'Acciones mineras'], 0, 'Necesitas una caja fuerte o pagar un servicio de custodia.'), 10),
      multi('¿Qué inconvenientes tiene el oro en lingotes? Marca todos.', ['Hay que guardarlo y asegurarlo', 'La diferencia entre precio de compra y de venta puede ser grande', 'Paga un cupón anual', 'Venderlo rápido puede costar más'], [0, 1, 3], 'El oro no paga nada; y comprarlo y venderlo en físico tiene costes.'),
      chat(['He visto un anuncio: «Opera petróleo con 1:10 y gana un 300 % este mes» 🛢️'], '¿Qué le contestas a Lumi?', [['¡Apúntate ya!', 'Con 1:10, un 10 % en contra lo pierde todo. Y prometer un 300 % es una señal de alarma.'], ['Eso son CFD o futuros apalancados: un 10 % en contra lo pierde todo, y prometer ganancias es mala señal', 'Vale, mejor entiendo qué es un ETC antes de tocar nada apalancado.'], ['Mejor 1:100, que es más', 'Más apalancamiento, más rápido a cero.']], 1, `Con 1:10, un 10 % en contra te deja a cero. ${CFD}`),
    ], { source: '2.8', minutes: 6, retire: [2, 3, 4, 7] }),

    lesson('u15l5', 'Contango y backwardation', [
      story('El fondo que perdía sin que el crudo bajara', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Compré un fondo de petróleo. El barril no se ha movido… y yo pierdo. ¿Por qué?'),
        note('Un fondo no quiere recibir barriles: antes de que venza el contrato, vende el cercano y compra el siguiente.'),
        note('El fondo de Leo tiene 1.000 $ en el futuro de mayo, a 20 $. Al renovar, compra el de junio, a 25 $.'),
        choose('¿Cuántos barriles controla ahora el fondo?', [
          opt('Los mismos 50', 'bad', say('lumi', 'Con 1.000 $ a 25 $ solo compra **40 barriles**, no 50.')),
          opt('40: 1.000 ÷ 25', 'good', say('lumi', '¡Eso! En contango, cada renovación te deja con menos barriles.')),
          opt('Más de 50', 'bad', say('lumi', 'Eso pasaría en backwardation, con el siguiente más barato.')),
        ]),
        say('lumi', 'Si junio vence a 20 $, el fondo vale 40 × 20 = 800 $: **−20 %**.'),
        say('lumi', 'Y el crudo ni se ha movido. Ese es el **coste del contango**.'),
      ]),
      play({
        title: 'La curva de futuros',
        intro: 'Un futuro fija hoy el precio de un barril que se entrega más adelante, y cada mes tiene su precio. Si lo lejano está **más caro**, es **contango**; si está **más barato**, **backwardation**.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Contango' }, { label: 'Backwardation' }],
          cards: [
            { icon: 'up', label: 'Junio a 25 $ y julio a 28 $', bin: 0, why: 'Los lejanos, más caros que los cercanos: contango.' },
            { icon: 'down', label: 'Junio a 90 $ y julio a 85 $', bin: 1, why: 'Los lejanos, más baratos: backwardation.' },
            { icon: 'database', label: 'Sobra crudo y almacenarlo cuesta', bin: 0, why: 'Quien lo guarda cobra ese coste en los futuros lejanos.' },
            { icon: 'alert', label: 'Hay escasez: todos lo quieren ya', bin: 1, why: 'El barril de hoy vale más que el de mañana.' },
            { icon: 'repeat', label: 'Al renovar, con el mismo dinero tienes menos barriles', bin: 0, why: 'Vendes el cercano barato y compras el siguiente caro.' },
            { icon: 'layers', label: 'Al renovar, con el mismo dinero tienes más barriles', bin: 1, why: 'Vendes el cercano caro y compras el siguiente barato.' },
          ],
        },
        goal: { text: 'Clasifica los seis casos.', when: [when('done', '==', 6)] },
        insight: '**En contango, renovar resta**: con el mismo dinero, cada mes tienes menos barriles. En backwardation, al revés, renovar suma.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿el mes lejano está más caro o más barato?', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Es justo lo que le pasó al fondo de Leo.', mood: 'HAPPY' },
          { say: '¿Contango o backwardation? Clasifica cada caso', mood: 'HAPPY' },
        ],
      }),
      key('El caso de 2020', 'En abril de 2020 sobraba tanto crudo que el contrato de mayo del WTI llegó a **−37,63 $**, mientras los siguientes valían mucho más. El mayor ETF de petróleo de EE. UU. (USO) **perdió alrededor de un 68 % en 2020**, cuando el WTI al contado cayó en torno a un **20 %**.\n\nY tras una caída del 68 %, hace falta subir más de un 200 % para volver al punto de partida.', 'En contango, un fondo de futuros puede perder aunque el crudo suba.', 'Pruébalo: en Mercado, compara los gráficos del ETF USO y del petróleo WTI.'),
    ], [
      single('El futuro de junio vale 25 $ y el de julio 28 $. La curva está en…', ['Contango', 'Backwardation', 'Equilibrio'], 0, 'Lejanos más caros que cercanos = contango.'),
      num('Un fondo tiene 1.000 $ en el futuro de mayo, que vale 20 $. Al renovar, lo vende a 20 $ y compra el de junio, que vale 25 $. ¿Cuántos barriles controla ahora?', 40, 'barriles', 'Antes: 1.000 ÷ 20 = 50 barriles. Después: 1.000 ÷ 25 = 40. En contango, cada renovación te deja con menos.'),
      num('Siguiendo el caso anterior: el futuro de junio llega a su vencimiento valiendo 20 $, porque el crudo no se ha movido. ¿Cuánto vale ahora el fondo?', 800, '$', '40 barriles × 20 $ = 800 $: un −20 % sin que el crudo haya bajado. Es el coste del contango.'),
      point('Toca el punto más alto del WTI en este periodo (cierres semanales).', 'hist-oil-2020', 'max', 'Unos 63 $ en enero de 2020. Tres meses después cerraba semanas por debajo de 20 $, y el contrato de mayo llegó a cotizar en negativo.'),
      upDown('Gráfico real del petróleo: 30 sesiones sin fecha. ¿Qué hizo el crudo en las 10 siguientes?', 'ud-90', 'Aunque acertaras la dirección del barril, un fondo de futuros en contango podría ganar bastante menos, o incluso perder.'),
      tf('Un fondo de futuros de petróleo siempre sigue exactamente al precio del barril que sale en las noticias.', false, 'El de las noticias es el contrato cercano; el fondo renueva contratos y paga (o cobra) la diferencia de la curva.'),
      match('Empareja cada término con su definición.', [['Contango', 'Los futuros lejanos cuestan más que los cercanos'], ['Backwardation', 'Los futuros lejanos cuestan menos que los cercanos'], ['Precio al contado', 'Precio para entrega inmediata'], ['Renovación (roll)', 'Vender el contrato cercano y comprar el siguiente']], 'Con estas cuatro palabras ya entiendes por qué un fondo de petróleo no sigue al barril.'),
      scenario('Abril de 2020. Ana ve el crudo por los suelos y compra un fondo de futuros de petróleo «para cuando se recupere». ¿Qué riesgo no ha mirado?', [['Ninguno: si el crudo sube, ella gana lo mismo', 'Con un contango tan fuerte, cada renovación le hace perder barriles: aunque el crudo se recupere, el fondo puede quedarse muy atrás.'], ['El coste de renovar futuros en contango', 'Exacto: en 2020 el USO perdió cerca de un 68 % mientras el WTI al contado caía en torno a un 20 %.'], ['Que el fondo cotice en dólares', 'Es un riesgo, pero pequeño comparado con el contango de aquel momento.']], 1, 'En materias primas, el producto importa tanto como la dirección del precio.'),
      timed(single('Rápido: en backwardation, renovar futuros…', ['Suele sumar rentabilidad', 'Siempre resta', 'No tiene ningún efecto'], 0, 'Vendes el cercano caro y compras el lejano barato: con el mismo dinero tienes más barriles.'), 12),
      num('Un fondo pierde un 68 %. ¿Cuánto tiene que subir después para volver al punto de partida?', 212.5, '%', '1 ÷ 0,32 = 3,125 → hace falta un +212,5 %. Las caídas grandes cuestan muchísimo de recuperar.', 2),
      scenario('Laura quiere seguir el precio del oro durante años, sin pagar el coste de renovar futuros. ¿Qué producto mira primero?', [['Un fondo de futuros de oro que renueva contratos cada mes', 'Es justo el que paga la renovación: en contango, cada cambio de contrato le resta.'], ['Un ETC de oro físico, respaldado por lingotes', 'Bien: no renueva futuros, porque tiene el metal guardado. Sigue al oro de cerca, menos su comisión anual.'], ['Un CFD de oro con apalancamiento', 'Suma apalancamiento y costes de mantener la posición: no es para tenerlo años.']], 1, 'La buena acierta porque un producto físico no tiene que renovar contratos, así que el contango no le afecta. El fondo de futuros parece igual, pero puede quedarse muy por detrás del metal.'),
    ], { source: '2.8', minutes: 6, retire: [0, 1, 2, 8, 9] }),
  ],
})
