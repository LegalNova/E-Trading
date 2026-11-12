import 'server-only'
// Sección 4 · Unidad 12 · Fundamentos cripto (docs/curso-v2/02-curriculo.md)
// Clases de cripto: recordar siempre que es un activo muy volátil y que puede perderse la totalidad de lo invertido.
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, say, scenario, single, spot, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u12', order: 12, title: 'Fundamentos cripto', description: 'Blockchain, Bitcoin, Ethereum, stablecoins, wallets y la regulación europea MiCA',
  lessons: [
    lesson('u12l1', 'Qué es una blockchain', [
      story('Las cuentas del piso', [{ id: 'leo', name: 'Leo' }, { id: 'irene', name: 'Irene' }], [
        note('Cuatro compañeros de piso apuntan los gastos comunes. Cada uno guarda una copia de la lista.'),
        say('leo', 'Pues en mi copia pone que la compra de marzo la pagué yo.'),
        say('irene', 'En las otras tres copias pone que la pagué yo.'),
        choose('¿Qué lista vale?', [
          opt('La de Leo: es su copia', 'bad', say('lumi', 'Una copia sola no manda. Si no coincide con las demás, se rechaza.')),
          opt('La que coincide en la mayoría de copias', 'good', say('lumi', '¡Eso es una **blockchain**! Miles de ordenadores con la misma copia del registro.')),
          opt('Que lo decida un notario', 'ok', say('lumi', 'Funcionaría, pero la gracia es justo no necesitar un intermediario.')),
        ]),
        say('lumi', 'Para colar un cambio habría que controlar la mayoría de la red. En Bitcoin, carísimo.'),
      ]),
      play({
        title: '¿Lo hace una blockchain?',
        intro: 'Una **blockchain** es un registro de transacciones que comparten miles de ordenadores (**nodos**). ¿Qué hace y qué no?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Sí lo hace' }, { label: 'No lo hace' }],
          cards: [
            { icon: 'document', label: 'Registrar quién envía qué a quién', bin: 0, why: 'Es su función: un registro de transacciones.' },
            { icon: 'up', label: 'Garantizar que el precio suba', bin: 1, why: 'La blockchain protege el registro, no el precio.' },
            { icon: 'server', label: 'Guardar copias en miles de ordenadores', bin: 0, why: 'Cada nodo guarda una copia: nadie lo controla en solitario.' },
            { icon: 'repeat', label: 'Devolverte el dinero si te equivocas de dirección', bin: 1, why: 'Lo registrado no se puede deshacer: tampoco tus errores.' },
            { icon: 'eye', label: 'Que cualquiera pueda verificar las transacciones', bin: 0, why: 'En una blockchain pública, el registro está a la vista de todos.' },
            { icon: 'shield', label: 'Protegerte como el Fondo de Garantía de Depósitos', bin: 1, why: 'Ningún fondo de garantía cubre las criptomonedas.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'Una blockchain registra quién tiene qué **sin un intermediario**. No hace que un activo valga más: las criptos son muy volátiles y **puede perderse la totalidad de lo invertido**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: protege el registro, no tu dinero.', mood: 'THINKING' },
          { say: 'Clasifica cada tarjeta', mood: 'HAPPY' },
        ],
      }),
      key('Por qué no se puede reescribir', 'Las transacciones se agrupan en **bloques**. Cada bloque lleva una huella (**hash**) del anterior: así quedan encadenados.\n\nSi alguien cambia una transacción antigua, cambia la huella de ese bloque y se rompen todos los siguientes. Además, los demás nodos tienen la copia buena y rechazan la falsa.', 'Blockchain: un registro compartido y encadenado que nadie puede reescribir en solitario.', 'Pruébalo: en Mercado, busca Bitcoin y añádelo a Favoritos para seguirlo esta semana.'),
    ], [
      order('Ordena cómo se registra una transacción en una blockchain.', ['Envías la transacción a la red', 'Los nodos comprueban que tienes saldo', 'Se agrupa con otras en un bloque', 'El bloque se añade a la cadena y todos actualizan su copia'], 'Comprobar, agrupar, encadenar y copiar: así nadie necesita fiarse de un intermediario.'),
      single('¿Quién controla una blockchain pública como la de Bitcoin?', ['Un banco central', 'Nadie en solitario: miles de nodos', 'La empresa que la creó y la mantiene'], 1, 'Ese es su rasgo clave: el registro está repartido entre muchos participantes.'),
      tf('Cambiar una transacción antigua en una blockchain grande es fácil si tienes un buen ordenador.', false, 'Habría que rehacer todos los bloques siguientes y superar al resto de la red: un solo ordenador no puede.'),
      fill('Cada bloque guarda la huella o ____ del bloque anterior.', 'hash', ['nominal', 'cupón', 'ISIN'], 'El hash es una huella digital: si cambias un solo dato, cambia por completo.'),
      match('Empareja cada término con su significado.', [['Blockchain', 'Registro compartido de transacciones'], ['Bloque', 'Grupo de transacciones'], ['Nodo', 'Ordenador que guarda una copia'], ['Hash', 'Huella digital de unos datos']], 'Son las cuatro piezas básicas de cualquier cadena de bloques.'),
      tf('Que un proyecto use blockchain garantiza que es una buena inversión.', false, 'La tecnología no dice nada del valor del activo: muchas criptos sobre blockchain han perdido casi todo su valor.'),
      multi('¿Qué consigue una blockchain pública? Marca todo.', ['Que nadie pueda robarte tus criptos', 'Que sea muy difícil reescribir el pasado', 'Que cualquiera pueda verificar las transacciones', 'Que el precio de la cripto no baje'], [1, 2], 'La blockchain protege el registro: es muy difícil reescribirlo y cualquiera puede verificarlo. No protege el precio ni tus claves: si te las roban, pierdes tus criptos.'),
      timed(single('Rápido: si alguien altera un bloque antiguo…', ['Se rompe la cadena de huellas y la red lo rechaza', 'Se actualiza en todos los nodos', 'Nadie se da cuenta'], 0, 'El hash cambia y deja de encajar con el bloque siguiente.'), 12),
      scenario('Pablo lee en un anuncio: «Token X, con tecnología blockchain: inversión segura al 100 %». ¿Qué piensa?', [['Que, si usa blockchain, la inversión es segura', 'Blockchain registra transacciones; no protege del precio ni de que el proyecto sea un fraude.'], ['Que «seguro al 100 %» es una señal de alarma', 'Bien: blockchain no protege del precio ni de un fraude; nadie serio promete seguridad total.'], ['Que tiene que invertir ya, antes de que suba', 'La prisa es otra señal clásica de alarma.']], 1, 'Usar palabras técnicas para prometer seguridad es una táctica habitual de las estafas.'),
      buckets('¿Lo hace una blockchain o no?', ['Sí', 'No'], [['Registrar transacciones', 0], ['Garantizar que el precio suba', 1], ['Guardar copias en miles de nodos', 0], ['Devolverte el dinero si te equivocas de dirección', 1]], 'Lo que se registra no se puede deshacer: tampoco tus errores.'),
    ], { source: '2.9', minutes: 6, retire: [2, 5, 7, 9] }),

    lesson('u12l2', 'Bitcoin: el oro digital', [
      mission({
        title: 'Vive bitcoin de 2021 a 2025',
        intro: 'Diciembre de 2020: inviertes **1.000 €** en bitcoin y lo vives semana a semana, con **datos reales** (en dólares, sin contar el cambio). Puedes vender cuando quieras.',
        widget: { kind: 'crash', series: 'series-btc', amount: 1000 },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'En 2021 casi duplicó su valor; desde ese máximo cayó un **75 %** hasta noviembre de 2022, y luego se recuperó. Eso es **volatilidad extrema**: el pasado no garantiza nada y puede perderse la totalidad de lo invertido.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -40), say: 'Más de un 40 % abajo. ¿Aguantas?', mood: 'WORRIED' },
          { when: when('drop', '>=', 80), say: 'Muy arriba… ¿y si ahora se da la vuelta?', mood: 'THINKING' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      story('«Oro digital»', [{ id: 'nico', name: 'Nico' }], [
        say('nico', 'Bitcoin es oro digital: nunca habrá más de 21 millones.'),
        say('nico', 'Así que no puede bajar mucho, ¿no?'),
        choose('¿Qué le contestas?', [
          opt('Claro: es escaso, como el oro', 'bad', say('lumi', 'Escaso no es estable: acabas de ver una caída del 75 %.')),
          opt('Su oferta es limitada, pero su precio depende de la demanda', 'good', say('lumi', '¡Eso! No hay beneficios ni intereses detrás: vale lo que otros paguen.')),
          opt('Solo baja cuando hay un halving', 'ok', say('lumi', 'No: el halving frena la emisión, pero el precio se mueve por la demanda.')),
        ]),
        say('lumi', 'Bitcoin ha caído más de un 70 % varias veces.'),
      ]),
      key('El halving', 'Bitcoin nació en 2009, creado por alguien con el seudónimo **Satoshi Nakamoto**. Los bitcoins nuevos nacen como premio a quien añade bloques (los mineros). Cada **210.000 bloques**, unos **4 años**, ese premio se reduce a la mitad: es el **halving**.\n\n50 → 25 (2012) → 12,5 (2016) → 6,25 (2020) → **3,125** (2024). Tras el de 2024 ya se había emitido el 93,75 % de todos los bitcoins.', 'Bitcoin: máximo de 21 millones y una emisión que se reduce a la mitad cada unos 4 años.', 'Pruébalo: en Mercado, busca Bitcoin y mira cuánto ha caído desde su máximo.'),
    ], [
      single('¿Cuántos bitcoins podrán existir como máximo?', ['21 millones', '100 millones', 'Ilimitados'], 0, 'Está fijado en su protocolo: la emisión se va frenando con cada halving.'),
      fill('Cada unos 4 años, el premio por bloque de Bitcoin se reduce a la mitad: es el ____.', 'halving', ['staking', 'split', 'airdrop'], 'Halving significa «reducir a la mitad».'),
      order('Ordena la recompensa por bloque de Bitcoin a lo largo del tiempo.', ['50 BTC (2009)', '25 BTC (2012)', '12,5 BTC (2016)', '6,25 BTC (2020)', '3,125 BTC (2024)'], 'Cada halving divide el premio entre dos: la emisión se frena hasta llegar a los 21 millones.'),
      num('Tras el halving de 2024 el premio es de 3,125 BTC por bloque. ¿Cuál será tras el siguiente halving?', 1.5625, 'BTC', '3,125 ÷ 2 = 1,5625 BTC por bloque.'),
      num('En Bitcoin se añade un bloque cada 10 minutos de media. ¿Cuántos bloques salen al día?', 144, 'bloques', '24 × 60 ÷ 10 = 144 bloques al día.'),
      upDown('Este es el gráfico de una de las grandes criptomonedas, en velas diarias. ¿Qué hizo en las 10 sesiones siguientes?', 'ud-45', 'En cripto, unas pocas semanas pueden traer movimientos de dos cifras en cualquier dirección: por eso se habla de volatilidad extrema.'),
      tf('Que el número de bitcoins esté limitado garantiza que su precio siempre sube.', false, 'El precio depende de la demanda. Con su oferta limitada, Bitcoin ha caído más de un 70 % varias veces.'),
      timed(fill('Bitcoin lo creó alguien con el seudónimo Satoshi ____.', 'Nakamoto', ['Buterin', 'Bogle', 'Sharpe'], 'Su identidad real sigue sin conocerse. Vitalik Buterin es el cocreador de Ethereum.'), 12),
      chat(['Bitcoin es oro digital, así que nunca puede bajar mucho, ¿no? 🪙'], '¿Qué le contestas?', [['Claro, es como el oro', 'Hasta el oro ha pasado años perdiendo valor, y Bitcoin ha caído más de un 70 % en varias ocasiones.'], ['Su oferta es limitada, pero su precio es muy volátil y ha caído más de un 70 % varias veces', '¡Eso! Escasez no es estabilidad: en cripto puede perderse la totalidad de lo invertido.'], ['No baja porque solo existen 21 bitcoins', 'Son 21 millones como máximo, no 21, y su precio sí baja.']], 1, 'La escasez explica parte del atractivo de Bitcoin, no su estabilidad.'),
      single('¿Qué hay detrás del precio de Bitcoin?', ['Lo que otros quieran pagar por él', 'Los beneficios de la empresa que lo emite', 'Los intereses que paga'], 0, 'No genera beneficios ni intereses: su precio depende de la adopción y de la demanda.'),
      scenario('Bitcoin lleva semanas cayendo. Nico tiene un poco y lee en redes: «Tras cada halving siempre sube, mete todo lo que puedas». ¿Qué hace?', [['Mete todos sus ahorros: el halving lo garantiza', 'El halving solo frena la emisión de bitcoins nuevos. El precio depende de la demanda, y ha caído más de un 70 % varias veces.'], ['Sigue su plan: solo lo que podría perder', 'Bien: la escasez no garantiza el precio; lo decide lo que la gente esté dispuesta a pagar.'], ['Lo vende todo porque, si cae, es que Bitcoin ha muerto', 'Decidir por el miedo de unas semanas es tan arriesgado como decidir por la euforia.']], 1, 'La buena es seguir un plan con una cantidad que puedas perder. El «siempre sube» confunde escasez programada con precio garantizado.'),
    ], { source: '2.9', minutes: 6, retire: [3, 4, 6, 7, 8] }),

    lesson('u12l3', 'Minería y prueba de trabajo', [
      story('Mina desde tu móvil', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Mira este anuncio: «Mina bitcoins desde tu móvil y gana 50 € al día».'),
        say('laura', '¿Me descargo la app?'),
        choose('¿Qué le dices?', [
          opt('Sí, es dinero fácil', 'bad', say('lumi', 'La minería real usa máquinas especializadas y mucha electricidad. Un móvil no compite.')),
          opt('Es casi seguro un engaño: un móvil no puede competir', 'good', say('lumi', '¡Bien! Muchas «apps de minería» son estafas o usan tu móvil para otras cosas.')),
          opt('Instálala solo para probar', 'ok', say('lumi', 'Estas apps pueden exponer tus datos o tu cartera. Mejor no.')),
        ]),
        say('lumi', 'Cuando una promesa no encaja con cómo funciona la tecnología, desconfía.'),
      ]),
      play({
        title: '¿Trabajo o participación?',
        intro: 'Dos formas de decidir quién añade el siguiente bloque: **gastando energía** en cálculos o **arriesgando monedas** como garantía. ¿Cuál es cuál?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Prueba de trabajo' }, { label: 'Prueba de participación' }],
          cards: [
            { icon: 'bitcoin', label: 'Bitcoin', bin: 0, why: 'Los mineros compiten gastando energía en cálculos.' },
            { icon: 'gem', label: 'Ethereum, desde 2022', bin: 1, why: 'Dejó la minería en 2022: validan quienes bloquean ETH.' },
            { icon: 'lock', label: 'Validan quienes bloquean sus monedas como garantía', bin: 1, why: 'Es la prueba de participación (proof of stake).' },
            { icon: 'cpu', label: 'Máquinas especializadas probando combinaciones sin parar', bin: 0, why: 'Hay que dar con un hash válido: no hay atajos.' },
            { icon: 'leaf', label: 'Consume más de un 99 % menos de energía', bin: 1, why: 'No necesita una competición de cálculo.' },
            { icon: 'power', label: 'Atacarla exige más potencia que todos los mineros juntos', bin: 0, why: 'La energía gastada es lo que protege el registro.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'Bitcoin usa la **prueba de trabajo**: gasta mucha energía, y eso hace carísimo atacarlo. Ethereum pasó en 2022 a la **prueba de participación**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿gasta electricidad o arriesga monedas?', mood: 'THINKING' },
          { say: 'Clasifica cada tarjeta', mood: 'HAPPY' },
        ],
      }),
      key('Una competición de cálculo', 'Los **mineros** agrupan transacciones en un bloque y compiten por encontrar un número que haga que su hash cumpla una condición. El primero cobra el **premio** más las **comisiones**. Buscar la solución cuesta mucho; comprobarla, muy poco.\n\nLa **dificultad** se ajusta cada 2.016 bloques para que salga un bloque cada **10 minutos** de media. Y la tecnología no cambia el riesgo de precio: en cripto **puede perderse todo lo invertido**.', 'Prueba de trabajo: se gana el derecho a añadir bloques gastando energía en cálculos.', 'Pruébalo: crea una alerta de precio en Bitcoin y mira cuánto se mueve esta semana.'),
    ], [
      order('Ordena cómo se mina un bloque de Bitcoin.', ['El minero agrupa transacciones pendientes', 'Prueba combinaciones hasta dar con un hash válido', 'La red comprueba que el bloque es correcto', 'El bloque se añade y el minero cobra premio y comisiones'], 'Buscar la solución cuesta mucho; comprobarla, muy poco: esa asimetría es la base de la prueba de trabajo.'),
      single('¿Qué ganan los mineros por añadir un bloque?', ['Bitcoins nuevos y comisiones', 'Un sueldo fijo del banco central', 'Acciones de Bitcoin'], 0, 'Con cada halving el premio baja, así que las comisiones pesarán cada vez más.'),
      tf('La dificultad de la minería se ajusta para que salga un bloque cada unos 10 minutos.', true, 'Si entran más mineros, sube la dificultad; si se van, baja.'),
      tf('La minería de Bitcoin consume poca energía porque solo es software.', false, 'Usa máquinas especializadas funcionando sin parar: su consumo eléctrico es enorme.'),
      match('Empareja cada concepto con su significado.', [['Prueba de trabajo', 'Validar gastando energía en cálculos'], ['Prueba de participación', 'Validar dejando monedas como garantía'], ['Dificultad', 'Lo difícil que es encontrar un bloque válido'], ['Minero', 'Quien compite por añadir bloques']], 'Dos formas de decidir quién añade el siguiente bloque: gastando energía o arriesgando monedas.'),
      fill('Ethereum abandonó la minería en 2022 y pasó a la prueba de ____.', 'participación', ['trabajo', 'reserva', 'identidad'], 'Proof of stake: validan quienes bloquean ETH como garantía.'),
      num('La dificultad se ajusta cada 2.016 bloques. A 10 minutos por bloque, ¿cada cuántos días aproximadamente?', 14, 'días', '2.016 × 10 = 20.160 minutos ÷ 1.440 minutos al día = 14 días.'),
      timed(single('Rápido: ¿qué protege la prueba de trabajo?', ['Que sea carísimo reescribir el registro', 'Que el precio suba', 'Que las comisiones sean cero'], 0, 'Atacar la red exigiría más potencia de cálculo que todos los demás mineros juntos.'), 12),
      scenario('Laura lee: «Mina bitcoins desde tu móvil con nuestra app y gana 50 € al día». ¿Qué piensa?', [['Que es una forma fácil de ganar dinero', 'La minería real exige máquinas especializadas y mucha electricidad: un móvil no compite.'], ['Que es casi seguro un engaño: un móvil no puede competir con la minería profesional', 'Bien: muchas «apps de minería» son estafas o usan tu móvil para otros fines.'], ['Que la instala solo para probar', 'Instalar este tipo de apps puede exponer tus datos o tu cartera.']], 1, 'Cuando una promesa no encaja con cómo funciona la tecnología, desconfía.'),
      multi('¿Qué es cierto sobre la prueba de trabajo? Marca todo.', ['Consume mucha electricidad', 'Hace que enviar bitcoins sea gratis', 'Los mineros compiten por resolver un cálculo', 'La usa Ethereum desde 2022'], [0, 2], 'Los mineros compiten por resolver un cálculo, y eso consume mucha electricidad. Enviar bitcoins no es gratis: se pagan comisiones. Y Ethereum la abandonó en 2022 para pasar a la prueba de participación.'),
      scenario('Un conocido le ofrece a Leo un «plan de minería en la nube»: paga una cuota y cobra un 2 % diario fijo, sin hacer nada. ¿Qué piensa Leo?', [['Que es una forma cómoda de minar sin máquinas', 'Lo que gana un minero de verdad cambia cada día: depende del precio, de la dificultad y de las comisiones.'], ['Que un rendimiento fijo es señal de estafa', 'Bien: un minero cobra premio y comisiones solo si gana la competición. Nadie serio puede prometer un 2 % diario fijo.'], ['Que prueba con poco, por si acaso', 'Si es una estafa, ese poco se pierde entero y no hay a quién reclamar.']], 1, 'La buena acierta porque la minería no da un rendimiento fijo: depende del precio, la dificultad y la competencia. Probar con poco sigue siendo darle dinero a un posible fraude.'),
    ], { source: '2.9', minutes: 6, retire: [2, 3, 6, 7, 8] }),

    lesson('u12l4', 'Ethereum y los contratos inteligentes', [
      story('Tokens gratis', [{ id: 'web', name: 'Web desconocida' }], [
        say('web', '¡Enhorabuena! Tienes 500 tokens gratis esperándote.'),
        say('web', 'Conecta tu cartera y firma este contrato para reclamarlos.'),
        choose('¿Qué haces?', [
          opt('Firmo: es gratis', 'bad', say('lumi', 'Firmar un contrato que no entiendes puede dar permiso para vaciar tu cartera.')),
          opt('No firmo nada que no entienda y compruebo el proyecto por sus canales oficiales', 'good', say('lumi', '¡Bien! Muchas estafas usan firmas de contratos inteligentes para robar.')),
          opt('Firmo con mi cartera principal, para recibir más', 'bad', say('lumi', 'Si es una trampa, perderás todo lo que haya en esa cartera.')),
        ]),
        say('lumi', 'En un contrato inteligente, el código es la ley… también cuando tiene un error.'),
      ]),
      play({
        title: '¿Bitcoin o Ethereum?',
        intro: '**Ethereum** (2015) es una blockchain que, además de enviar dinero, ejecuta programas; su moneda es el **ether (ETH)**. ¿Es de Bitcoin o de Ethereum?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Bitcoin' }, { label: 'Ethereum' }],
          cards: [
            { icon: 'coins', label: 'Nunca habrá más de 21 millones', bin: 0, why: 'Es la regla estrella de Bitcoin.' },
            { icon: 'document', label: 'Ejecuta contratos inteligentes', bin: 1, why: 'Programas que se ejecutan solos, sin intermediario.' },
            { icon: 'bank', label: 'Préstamos e intercambios sin banco (DeFi)', bin: 1, why: 'Se construyen con contratos inteligentes sobre Ethereum.' },
            { icon: 'gem', label: 'Lo llaman «oro digital»', bin: 0, why: 'Por su escasez programada.' },
            { icon: 'fuel', label: 'Cada operación paga «gas», que sube si la red se satura', bin: 1, why: 'El gas se paga en ether (ETH).' },
            { icon: 'award', label: 'Certificados digitales de propiedad (NFT)', bin: 1, why: 'Otra de las cosas que se construyen encima de Ethereum, como muchos tokens.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'Bitcoin hace una cosa: **dinero escaso**. Ethereum es una **plataforma**: sus contratos inteligentes son un «si pasa esto, haz aquello» que se ejecuta solo.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: Bitcoin es dinero; Ethereum, una plataforma para programas.', mood: 'THINKING' },
          { say: 'Clasifica cada tarjeta', mood: 'HAPPY' },
        ],
      }),
      key('Más posibilidades, más riesgos', 'Más funciones también significan más formas de fallar: un error en el código de un contrato puede vaciarlo, y en una blockchain no hay a quién reclamar.\n\nETH es muy volátil y **puede perderse la totalidad de lo invertido**.', 'Ethereum añade a Bitcoin la posibilidad de ejecutar programas: los contratos inteligentes.', 'Pruébalo: en Mercado, busca Ethereum y compara su gráfico con el de Bitcoin.'),
    ], [
      match('Empareja cada concepto con su significado.', [['Contrato inteligente', 'Programa que se ejecuta solo en la blockchain'], ['Gas', 'Comisión por operar en Ethereum'], ['Token', 'Moneda creada sobre otra blockchain'], ['ETH', 'La moneda de Ethereum']], 'El vocabulario básico para entender qué pasa dentro de Ethereum.'),
      match('Empareja cada elemento con lo que lo define.', [['Bitcoin', 'Dinero digital escaso, máximo 21 millones'], ['Ethereum', 'Plataforma para contratos inteligentes'], ['Stablecoin', 'Token que intenta valer siempre 1 dólar o 1 euro'], ['NFT', 'Certificado digital de propiedad']], 'Bitcoin y Ethereum son redes distintas; stablecoins y NFT son cosas que se construyen encima.'),
      single('¿Qué añade Ethereum a lo que hace Bitcoin?', ['Ejecutar programas en la blockchain', 'Un máximo de 21 millones de monedas', 'La garantía de un banco central detrás'], 0, 'Por eso sobre Ethereum se construyen tokens, DeFi y NFT.'),
      tf('El gas de Ethereum es una comisión fija que nunca cambia.', false, 'Sube cuando la red está saturada y baja cuando hay poca demanda.'),
      tf('Si un contrato inteligente tiene un error de programación, alguien puede aprovecharlo y vaciar su dinero.', true, 'Ha pasado muchas veces, y en una blockchain no hay un banco al que reclamar.'),
      buckets('¿Es un uso habitual de Ethereum?', ['Sí', 'No'], [['Préstamos sin banco (DeFi)', 0], ['Crear tokens', 0], ['Garantizar un 10 % anual', 1], ['NFT', 0], ['Proteger tus criptos como el Fondo de Garantía de Depósitos', 1]], 'Ethereum permite muchas cosas, pero ninguna garantiza rentabilidades ni protege tu dinero como un depósito.'),
      scenario('Una web te pide conectar tu cartera de Ethereum y firmar un contrato para «reclamar tokens gratis». ¿Qué haces?', [['Firmo: es gratis', 'Firmar un contrato que no entiendes puede dar permiso para vaciar tu cartera.'], ['No firmo nada que no entienda y compruebo el proyecto por sus canales oficiales', 'Bien: muchas estafas usan firmas de contratos inteligentes para robar.'], ['Firmo con mi cartera principal para recibir más', 'Si es una trampa, perderás todo lo que haya en esa cartera.']], 1, 'Con contratos inteligentes, una firma puede autorizar movimientos de todo tu saldo.'),
      timed(single('Rápido: ¿en qué moneda se paga el gas de Ethereum?', ['ETH', 'BTC', 'Euros'], 0, 'Cada operación en Ethereum paga su comisión en ether.'), 10),
      fill('Los programas que se ejecutan solos en Ethereum se llaman contratos ____.', 'inteligentes', ['de futuros', 'por diferencias', 'de depósito'], 'Smart contracts: se ejecutan cuando se cumplen sus condiciones, sin intermediario.'),
      num('Enviar unos tokens cuesta 0,0005 ETH de gas y el ETH vale 2.000 €. ¿Cuánto pagas de comisión?', 1, '€', '0,0005 × 2.000 = 1 €. Si la red se satura, puede costar bastante más.'),
      scenario('Irene quiere enviar unos tokens sin ninguna prisa. Su wallet avisa de que hoy el gas está carísimo porque la red está saturada. ¿Qué hace?', [['Lo envía ya mismo: el gas es una comisión fija', 'El gas no es fijo: sube cuando la red está saturada y baja cuando hay poca demanda.'], ['Espera a que la red esté más tranquila', 'Bien: sin prisa, esperar suele abaratar mucho la comisión.'], ['Lo envía en Bitcoin para no pagar gas', 'Los tokens de Ethereum viven en Ethereum: no se pueden enviar por la red de Bitcoin.']], 1, 'La buena funciona porque el gas sube y baja con la demanda de la red. El gas no es una tarifa fija, sino un precio que cambia.'),
    ], { source: '2.9', minutes: 6, retire: [3, 4, 6, 7, 9] }),

    lesson('u12l5', 'Stablecoins', [
      story('El 20 % «estable»', [{ id: 'bruno', name: 'Bruno' }], [
        note('Mayo de 2022. Bruno tiene sus ahorros en UST, una stablecoin que intenta valer siempre 1 dólar.'),
        say('bruno', 'Una plataforma me paga casi un 20 % al año por tenerlos ahí. ¡Y es estable!'),
        note('De pronto, el UST empieza a valer 0,95 $.'),
        say('bruno', '¿Es el momento de comprar más?'),
        choose('¿Qué le dices?', [
          opt('Sí: compra más, volverá a 1 $', 'bad', say('lumi', 'En días, el UST se hundió muy por debajo de 1 $. Nunca se recuperó.')),
          opt('Ese 20 % «sin riesgo» escondía un riesgo enorme', 'good', say('lumi', 'Eso: el UST perdió la paridad y LUNA cayó casi a cero en días.')),
          opt('Espera tranquilo: siempre vuelven a 1 $', 'ok', say('lumi', 'Algunas vuelven; el UST no. «Estable» es un objetivo, no una garantía.')),
        ]),
        say('lumi', 'Mucha gente lo perdió casi todo. Rendimiento alto y «sin riesgo» no existe.'),
      ]),
      play({
        title: '¿Con reservas o algorítmica?',
        intro: 'Una **stablecoin** intenta valer siempre lo mismo que una moneda, normalmente **1 dólar**, y hay dos formas de intentarlo. ¿Cuál es cada una?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Con reservas' }, { label: 'Algorítmica' }],
          cards: [
            { icon: 'bank', label: 'Guarda dólares y letras del Tesoro por cada token', bin: 0, why: 'Su valor depende de que esas reservas existan y estén disponibles.' },
            { icon: 'bot', label: 'Se sostiene con otra cripto y un algoritmo', bin: 1, why: 'Sin reservas reales: si se rompe la confianza, puede hundirse en espiral.' },
            { icon: 'flame', label: 'TerraUSD (UST), mayo de 2022', bin: 1, why: 'Se hundió y arrastró a LUNA casi a cero.' },
            { icon: 'alert', label: 'USDC, marzo de 2023: cae a unos 0,87 $', bin: 0, why: 'Quebró un banco donde tenía parte de sus reservas. Recuperó la paridad en pocos días.' },
            { icon: 'coins', label: 'USDT (Tether)', bin: 0, why: 'Como USDC, respalda sus tokens con reservas.' },
          ],
        },
        goal: { text: 'Clasifica las cinco tarjetas.', when: [when('done', '==', 5)] },
        insight: 'Las de reservas dependen de que **el respaldo exista** y esté disponible; las algorítmicas, solo de la **confianza** en el mecanismo.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿hay dinero real detrás o solo un mecanismo?', mood: 'THINKING' },
          { say: 'Clasifica cada tarjeta', mood: 'HAPPY' },
        ],
      }),
      key('Qué exige MiCA', 'Las stablecoins sirven para moverse entre criptos sin pasar por el banco y para hacer pagos. Las más usadas son **USDT** (Tether) y **USDC** (Circle).\n\nEn la UE, el reglamento **MiCA** exige que sus emisores estén autorizados, tengan **reservas** suficientes y separadas y permitan **canjear** los tokens a la par. Aun así, «estable» no es «garantizado»: no las cubre el Fondo de Garantía de Depósitos y **puede perderse lo invertido**.', 'Una stablecoin vale lo que valgan sus reservas y la confianza en su emisor.', 'Si te ofrecen un 20 % «estable», pregúntale antes a la profesora Lumi.'),
    ], [
      single('¿Qué intenta una stablecoin?', ['Valer siempre lo mismo que una moneda', 'Subir más que Bitcoin con menos sobresaltos', 'Pagar un dividendo'], 0, 'Su objetivo es la estabilidad frente a una moneda, no la revalorización.'),
      match('Empareja cada caso o concepto con su significado.', [['TerraUSD (UST), mayo de 2022', 'Stablecoin algorítmica que se hundió'], ['USDC, marzo de 2023', 'Cayó a unos 0,87 $ por la quiebra de un banco'], ['Reservas', 'Dinero y deuda que respaldan cada token'], ['Canje a la par', 'Cambiar 1 token por 1 dólar o 1 euro']], 'Dos episodios reales que muestran los dos riesgos: sin reservas y con reservas en problemas.'),
      tf('Una stablecoin está cubierta por el Fondo de Garantía de Depósitos, como una cuenta bancaria.', false, 'El FGD cubre depósitos en bancos, no criptoactivos.'),
      tf('Una stablecoin algorítmica no tiene reservas reales que la respalden.', true, 'Depende de un mecanismo con otra cripto; si la confianza se rompe, puede hundirse en espiral.'),
      scenario('Mayo de 2022. Bruno tiene sus ahorros en UST porque una plataforma le paga casi un 20 % anual «por ser estable». El UST empieza a valer 0,95 $. ¿Qué aprendemos de lo que pasó?', [['Que era una oportunidad para comprar más', 'En pocos días el UST se hundió muy por debajo de 1 $ y nunca se recuperó: quien compró más lo perdió.'], ['Que un rendimiento altísimo «estable» escondía un riesgo enorme', 'Exacto: el UST perdió la paridad y LUNA cayó casi a cero en días. Mucha gente lo perdió casi todo.'], ['Que las stablecoins siempre vuelven a 1 $', 'Algunas se recuperan; el UST no. «Estable» es un objetivo, no una garantía.']], 1, 'Un rendimiento alto y supuestamente sin riesgo suele esconder un riesgo que no se ve.'),
      multi('¿Qué exige MiCA a los emisores de stablecoins en la UE? Marca todo.', ['Estar cubiertos por el Fondo de Garantía de Depósitos', 'Tener reservas suficientes', 'Permitir canjear los tokens', 'Garantizar una rentabilidad anual'], [1, 2], 'MiCA exige reservas suficientes y que puedas canjear el token. No exige que rinda nada, y una stablecoin no es un depósito: no la cubre el Fondo de Garantía de Depósitos.'),
      buckets('¿Con reservas o algorítmica?', ['Con reservas', 'Algorítmica'], [['Guarda dólares y letras del Tesoro por cada token', 0], ['Se sostiene con otra criptomoneda y un algoritmo', 1], ['TerraUSD (UST)', 1], ['USDC', 0]], 'Las de reservas dependen de que el respaldo exista; las algorítmicas, de la confianza en el mecanismo.'),
      timed(tf('«Estable» significa que es imposible perder dinero con una stablecoin.', false, 'UST se hundió en 2022 y hasta USDC perdió la paridad unos días en 2023.'), 10),
      fill('En marzo de 2023, la stablecoin ____ cayó a unos 0,87 $ por la quiebra de un banco donde tenía reservas.', 'USDC', ['UST', 'BTC', 'ETH'], 'Recuperó la paridad en pocos días, cuando se aseguró el acceso a esas reservas.'),
      single('¿Qué riesgo principal tiene una stablecoin con reservas?', ['Que las reservas fallen o pierdan valor', 'Que su precio suba demasiado', 'Que pague demasiados intereses a quien la tiene'], 0, 'Por eso MiCA exige reservas suficientes, separadas y auditables.'),
    ], { source: '2.9', minutes: 6, retire: [2, 4, 6, 7] }),

    lesson('u12l6', 'Wallets, claves y autocustodia', [
      play({
        title: '¿Se puede enseñar?',
        intro: 'Acabas de crear tu primera **wallet**, la app que guarda las **claves** de tus criptos. Todos te piden algo: ¿qué puedes enseñar sin problema y qué jamás?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Sin problema' }, { label: 'Jamás' }],
          cards: [
            { icon: 'mail', label: 'Tu dirección pública, para que te paguen', bin: 0, why: 'Es como tu IBAN: sirve para recibir, no para sacar.' },
            { icon: 'key', label: 'Tu clave privada', bin: 1, why: 'Firma los envíos: quien la tiene, controla el dinero.' },
            { icon: 'phone', label: 'Tu frase semilla, al «soporte técnico»', bin: 1, why: 'Nadie legítimo te la pedirá jamás.' },
            { icon: 'camera', label: 'Una foto de tu frase semilla, guardada en la nube', bin: 1, why: 'Todo lo conectado a internet puede ser robado o filtrado.' },
            { icon: 'search', label: 'El registro de una transacción, para demostrar un pago', bin: 0, why: 'En una blockchain pública, las transacciones están a la vista de todos.' },
            { icon: 'person', label: 'Tu frase semilla, a un amigo para que te la guarde', bin: 1, why: 'Quien la tiene puede llevárselo todo, sin vuelta atrás.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'La **dirección** se comparte como un IBAN. La **clave privada** y la **frase semilla** (12 o 24 palabras, que recuperan todas tus claves), jamás: quien las tiene, controla tus criptos.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿sirve para recibir o para mover tu dinero?', mood: 'THINKING' },
          { say: 'Clasifica cada tarjeta', mood: 'HAPPY' },
        ],
      }),
      story('«Soporte técnico»', [{ id: 'soporte', name: 'Soporte técnico' }], [
        note('Ana guarda sus criptos en autocustodia. Le llega un mensaje por Telegram.'),
        say('soporte', 'Hola, Ana. Hemos detectado un fallo en tu wallet.'),
        say('soporte', 'Para proteger tus fondos, valida tu frase semilla en este formulario. Es urgente.'),
        choose('¿Qué hace Ana?', [
          opt('Rellena el formulario rápido, para no perder nada', 'bad', say('lumi', 'Acaba de entregar su dinero: con la frase, lo vacían en minutos.')),
          opt('Ignora el mensaje: ningún soporte legítimo pide la frase semilla', 'good', say('lumi', '¡Bien! Es una de las estafas más comunes en cripto.')),
          opt('Manda solo la mitad de las palabras', 'bad', say('lumi', 'Ninguna parte se comparte. Y quien la pide insistirá hasta tener el resto.')),
        ]),
        say('lumi', 'Quien te pide tu frase semilla te está robando.'),
      ]),
      key('Custodia propia o ajena', '• **En un exchange:** él guarda las claves. Cómodo, pero si quiebra o te bloquea, dependes de él (FTX, 2022).\n• **Autocustodia:** tú guardas las claves, en una wallet de software o de hardware. Nadie puede congelarlas… pero si pierdes la frase semilla, **nadie** puede recuperarlas.\n\nTu frase semilla, **en papel o metal, fuera de internet**, en un sitio seguro. Nunca en una foto, un correo o la nube.', '«Not your keys, not your coins»: quien controla las claves controla las criptos.', 'Pregúntale a la profesora Lumi qué diferencia hay entre tu dirección y tu clave privada.'),
    ], [
      order('Ordena los pasos para crear una wallet de autocustodia de forma segura.', ['Descargar la wallet desde su web oficial', 'Generarla y anotar la frase semilla en papel', 'Guardar el papel en un sitio seguro fuera de internet', 'Enviar una cantidad pequeña de prueba antes de mover más'], 'Origen fiable, copia de la frase fuera de internet y una prueba pequeña antes de arriesgar más.'),
      spot('Marca los mensajes que son estafa.', [['Soporte «Ledger»', 'Tu wallet ha sido comprometida. Verifica tus 24 palabras en este enlace para protegerla.', true], ['App de tu exchange', 'Nuevo inicio de sesión desde otro dispositivo. Si no has sido tú, revisa tu cuenta desde la app.', false], ['@CriptoAyuda', 'Vi tu problema en el foro. Pásame tu frase semilla y te recupero los fondos.', true], ['Amigo de Instagram', 'Te devuelvo el doble si me envías 0,1 ETH a esta dirección 😉', true], ['App de tu wallet', 'Recuerda: nunca compartas tu frase semilla con nadie.', false]], 'Nadie legítimo pide la frase semilla, y «te devuelvo el doble» es un clásico. Los avisos que te mandan a tu propia app sin pedir datos son normales.'),
      single('¿Qué permite recuperar tu frase semilla?', ['Todas las claves de tu wallet', 'Solo la contraseña de tu cuenta del exchange', 'Nada, es decorativa'], 0, 'Por eso quien la tenga puede quedarse con todo.'),
      single('¿Dónde es más seguro guardar tu frase semilla?', ['En papel o metal, fuera de internet', 'En una foto del móvil', 'En un correo que te envías a ti mismo'], 0, 'Todo lo que está conectado a internet puede ser robado o filtrado.'),
      tf('Puedes compartir tu dirección pública para que te envíen criptos.', true, 'Es como dar tu IBAN: sirve para recibir, no para sacar.'),
      tf('Si pierdes la frase semilla de una wallet de autocustodia, el soporte puede recuperártela.', false, 'Nadie puede: es el precio de no depender de nadie.'),
      buckets('¿Autocustodia o custodia en un exchange?', ['Autocustodia', 'Custodia en exchange'], [['Si quiebra la plataforma, puedes perder el acceso', 1], ['Si pierdes la frase semilla, lo pierdes todo', 0], ['Tú controlas las claves privadas', 0], ['Pueden bloquear tu cuenta', 1]], 'Cada opción cambia un riesgo por otro: el de la plataforma o el de tus propios errores.'),
      scenario('Ana tiene criptos en autocustodia. Le escribe por Telegram alguien del «soporte técnico»: hay un fallo y debe validar su frase semilla en un formulario. ¿Qué hace?', [['Rellena el formulario rápido para no perder nada', 'Acaba de entregar su dinero: con la frase semilla, el estafador lo vacía en minutos.'], ['Ignora el mensaje: ningún soporte legítimo pide la frase semilla', 'Bien: es una de las estafas más comunes en cripto.'], ['Le manda solo la mitad de las palabras', 'Ninguna parte de la frase se comparte, y quien la pide insistirá hasta conseguir el resto.']], 1, 'La frase semilla no se comparte nunca, con nadie, por ningún canal.'),
      timed(single('Rápido: ¿quién controla tus criptos?', ['Quien tenga la clave privada', 'Quien tenga tu dirección pública', 'La CNMV'], 0, 'La clave privada firma los envíos: quien la tiene, manda.'), 10),
      match('Empareja cada elemento con su función.', [['Dirección pública', 'Recibir criptos, como un IBAN'], ['Clave privada', 'Firmar envíos'], ['Frase semilla', 'Recuperar todas tus claves'], ['Wallet de hardware', 'Guardar las claves en un aparato sin conexión']], 'Saber qué hace cada pieza te dice cuál puedes compartir (solo la dirección) y cuál nunca.'),
    ], { source: '2.9', minutes: 6, retire: [4, 5, 7, 8] }),

    lesson('u12l7', 'Exchanges y MiCA', [
      story('Un exchange con regalo', [{ id: 'marta', name: 'Marta' }], [
        say('marta', '¡He encontrado un exchange con comisiones bajísimas y bono de bienvenida!'),
        note('La plataforma no aparece en los registros de la CNMV ni de ESMA.'),
        choose('¿Qué le aconsejas?', [
          opt('Úsalo: las comisiones es lo que más importa', 'bad', say('lumi', 'Sin autorización, nadie vigila si guarda tus criptos separadas ni cómo las usa.')),
          opt('Busca un proveedor autorizado, aunque cobre algo más', 'good', say('lumi', '¡Bien! Primero, que esté supervisado; después, que sea barato.')),
          opt('Deposita poco, para probar', 'ok', say('lumi', 'Aunque sea poco, puedes perderlo y no tener a quién reclamar.')),
        ]),
        say('lumi', 'Igual que con un bróker: primero quién lo vigila, después cuánto cobra.'),
      ]),
      play({
        title: '¿Te protege MiCA?',
        intro: 'Un **exchange** es una plataforma para comprar y vender criptos, y casi siempre las custodia por ti; el reglamento europeo **MiCA** le exige una autorización. ¿De qué te protege?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Lo protege o lo reduce' }, { label: 'No lo protege' }],
          cards: [
            { icon: 'layers', label: 'Que el exchange mezcle tus criptos con las suyas', bin: 0, why: 'MiCA le obliga a separar las criptos de los clientes de las propias.' },
            { icon: 'down', label: 'Una caída del 70 % del precio', bin: 1, why: 'MiCA regula a las empresas, no el precio de las criptos.' },
            { icon: 'news', label: 'Que la plataforma no informe de sus riesgos', bin: 0, why: 'Exige información clara y un sistema de reclamaciones.' },
            { icon: 'key', label: 'Perder tu frase semilla en autocustodia', bin: 1, why: 'Tus propios errores no entran en su protección.' },
            { icon: 'verified', label: 'Que opere en España una plataforma sin autorización', bin: 0, why: 'Según la CNMV, desde el 1 de julio de 2026 solo pueden operar los autorizados.' },
            { icon: 'umbrella', label: 'Que te devuelvan lo perdido si baja tu cripto', bin: 1, why: 'No existe un fondo de garantía para el precio de las criptos.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'MiCA reduce el riesgo de que **la plataforma** use tu dinero como no debe. El precio y tus propios errores siguen siendo **tu riesgo**: puede perderse la totalidad de lo invertido.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: MiCA vigila a las empresas, no al precio.', mood: 'THINKING' },
          { say: 'Clasifica cada tarjeta', mood: 'HAPPY' },
        ],
      }),
      key('Qué les exige MiCA', '• **Autorización** de un supervisor nacional (en España, la CNMV), válida en toda la UE.\n• **Separar** las criptos de los clientes de las suyas.\n• Requisitos de **capital**, gobierno y gestión de conflictos de interés.\n• Información clara y un sistema de **reclamaciones**.\n\nSegún la CNMV, desde el **1 de julio de 2026** solo pueden operar en España los proveedores autorizados. Antes de abrir cuenta, búscalo en los registros de la **CNMV** o de **ESMA**.', 'MiCA exige autorización, separación de activos y transparencia a los exchanges en la UE.', 'Antes de abrir cuenta en un exchange real, pregúntale a la profesora Lumi cómo comprobarlo.'),
    ], [
      multi('¿Qué exige MiCA a un exchange que opera en la UE? Marca todo.', ['Autorización de un supervisor', 'Separar las criptos de los clientes de las propias', 'Cubrir tus criptos con un fondo de garantía', 'Garantizar que el precio no baje'], [0, 1], 'MiCA exige autorización y separar las criptos de los clientes de las propias. No regula el precio, y no existe un fondo de garantía para criptos como el de los depósitos.'),
      multi('¿Dónde compruebas si un exchange está autorizado? Marca todo.', ['Registros de la CNMV', 'Registro de ESMA', 'La web del propio exchange', 'Lo que diga un influencer'], [0, 1], 'Solo los registros oficiales sirven: cualquiera puede poner un sello falso en su web.'),
      single('Según la CNMV, desde el 1 de julio de 2026, ¿quién puede prestar servicios de criptoactivos en España?', ['Solo proveedores con autorización MiCA', 'Cualquiera con una web', 'Solo los bancos españoles de toda la vida'], 0, 'Ese día terminó el periodo transitorio en España.'),
      tf('MiCA crea un fondo de garantía que te devuelve el dinero si tu cripto baja de precio.', false, 'No existe tal fondo: las caídas de precio son tu riesgo.'),
      tf('Una autorización MiCA concedida en otro país de la UE permite operar en España.', true, 'Funciona como un pasaporte europeo: una autorización vale en toda la UE.'),
      scenario('Marta encuentra un exchange con comisiones muy bajas y bono de bienvenida, pero no aparece en los registros de la CNMV ni de ESMA. ¿Qué hace?', [['Lo usa: las comisiones son lo más importante', 'Sin autorización, nadie supervisa si guarda tus criptos separadas ni cómo las usa.'], ['Busca un proveedor autorizado, aunque cobre algo más', 'Bien: primero que sea seguro y esté supervisado; después, que sea barato.'], ['Deposita poco para probar', 'Con una plataforma no autorizada, aunque sea poco, puedes perderlo y no tener a quién reclamar.']], 1, 'Igual que con un bróker: primero quién lo vigila, después cuánto cobra.'),
      match('Empareja cada sigla con su significado.', [['MiCA', 'Reglamento europeo de criptoactivos'], ['CASP', 'Proveedor de servicios de criptoactivos'], ['ESMA', 'Supervisor europeo de los mercados'], ['CNMV', 'Supervisor español de los mercados']], 'Las siglas que verás en cualquier aviso sobre plataformas cripto en Europa.'),
      timed(single('Rápido: ¿qué es lo primero que miras de un exchange?', ['Que esté autorizado', 'Que tenga muchas criptos para elegir', 'Que regale un bono de bienvenida'], 0, 'La autorización va antes que el catálogo y los regalos.'), 10),
      fill('El reglamento europeo que regula a los proveedores de criptoactivos se llama ____.', 'MiCA', ['MiFID', 'UCITS', 'SPIVA'], 'Markets in Crypto-Assets. MiFID regula los servicios de inversión tradicionales.'),
      buckets('¿MiCA te protege de esto o no?', ['Lo protege o lo reduce', 'No lo protege'], [['Que el exchange mezcle tus criptos con las suyas', 0], ['Una caída del 70 % del precio', 1], ['Que la plataforma no informe de sus riesgos', 0], ['Que pierdas tu frase semilla en autocustodia', 1]], 'MiCA regula a las empresas; ni el precio ni tus propios errores entran en su protección.'),
    ], { source: '2.9', minutes: 6, retire: [3, 5, 7, 9] }),
  ],
})
