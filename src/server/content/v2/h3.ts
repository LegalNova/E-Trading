import 'server-only'
// Sección 0 «Invierte desde hoy» · Unidad «Tu primer análisis» (docs/curso-v2/06-enganche-y-progresion.md)
// Las clases vienen de otras unidades: conservan su id, el progreso de quien ya las hizo y sus traducciones.
import { buckets, candle, chart, chat, choose, fill, key, lesson, level, match, mission, multi, note, num, opt, order, play, point, say, scenario, single, spot, story, tf, timed, upDown, when } from '../dsl'

// Antes en u16 (mismo id: conserva progreso y traducciones)
export const u16l1 = lesson('u16l1', 'Precio y valor no son lo mismo', [
      play({
        title: 'Lo que pagas y lo que obtienes',
        intro: 'Una empresa gana **2 €** por acción al año y tú decides cuánto pagas por ella. ¿Cuántos años de beneficios tardas en recuperar el precio?',
        widget: { kind: 'valuation', price: 40, eps: 2, growth: 5, maxPrice: 80, maxGrowth: 20 },
        predict: {
          prompt: 'Pagas 40 € por la acción y sus beneficios crecen un 5 % al año. ¿En cuántos años los beneficios suman lo que pagaste?',
          options: ['En unos 5 años', 'En unos 15 años', 'En unos 40 años'],
          answer: 1,
          why: 'Sumando sus beneficios, que crecen un 5 % al año, tardas **15 años** en juntar 40 €.',
        },
        goal: { text: 'Sin tocar el crecimiento, busca el precio más alto con el que lo recuperas en 10 años.', when: [when('growth', '==', 5), when('payback', '<=', 10), when('price', '>=', 25)] },
        insight: 'A **25 €** la recuperas en 10 años; a 80 €, en 23. **El precio es lo que pagas y el valor, lo que obtienes**: la misma empresa puede ser buena compra a un precio y mala a otro.',
        lumi: [
          { when: when('payback', '>=', 20), say: 'Pagas tanto que tardarías décadas en recuperarlo.', mood: 'WORRIED' },
          { when: when('growth', '>=', 15), say: '¿Crecer así muchos años seguidos? Muy pocas empresas lo logran.', mood: 'THINKING' },
          { when: when('payback', '<=', 10), say: '¡Eso es un precio razonable para lo que gana!', mood: 'HAPPY' },
          { say: 'Mueve el precio y mira cuántos años tardas', mood: 'HAPPY' },
        ],
      }),
      story('El señor Mercado', [{ id: 'mercado', name: 'Señor Mercado' }], [
        note('Benjamin Graham imaginaba al mercado como un socio de humor cambiante que cada día te ofrece un precio.'),
        say('mercado', '¡Hoy estoy eufórico! Te compro tu parte por 40 €. Mañana, quién sabe.'),
        note('Una semana después, sin que el negocio haya cambiado nada…'),
        say('mercado', 'Todo va fatal. Te vendo mi parte por 12 €. ¡Corre!'),
        choose('Estimas que la empresa vale unos 20 € por acción. ¿Qué haces?', [
          opt('Vender: si él está asustado, algo pasará', 'bad', say('lumi', 'Venderías barato justo cuando el negocio no ha cambiado.')),
          opt('Comprobar que el negocio sigue igual y, si es así, comprar', 'good', say('lumi', 'Eso: el precio ha bajado, el valor no. Su precio es una oferta, no una orden.')),
          opt('Comprar con todo tu dinero sin revisar nada', 'ok', say('lumi', 'Buen instinto, pero revisa tu estimación y no lo pongas todo.')),
        ]),
        say('lumi', 'A 12 €, algo que vale 20 €: un **40 %** de margen de seguridad.'),
      ]),
      key('Margen de seguridad', '«El precio es lo que pagas; el valor es lo que obtienes» (Warren Buffett).\n\nEl **análisis fundamental** estudia el negocio (ventas, beneficios, deuda, competencia) para estimar cuánto **vale**: responde a *qué* comprar. El **técnico** estudia el gráfico e intenta responder a *cuándo*.\n\nSi estimas que una acción vale 20 € y solo la compras por debajo de 15 €, tienes un **25 % de margen de seguridad**: un colchón por si te has equivocado al estimar.', 'Una empresa excelente comprada demasiado cara puede ser una mala inversión.', 'El valor es una estimación; por eso necesitas colchón.'),
    ], [
      single('¿Qué intenta responder el análisis fundamental?', ['Qué comprar y si está caro o barato', 'Cuándo entrar exactamente', 'Qué vela viene mañana'], 0, 'El técnico intenta responder a cuándo; el fundamental, a qué y a qué precio.'),
      num('Estimas que una acción vale 40 € y cotiza a 30 €. ¿Qué margen de seguridad tienes sobre el valor estimado?', 25, '%', '(40 − 30) ÷ 40 = 25 %.'),
      num('Quieres un margen de seguridad del 30 % sobre un valor estimado de 50 €. ¿Por debajo de qué precio comprarías?', 35, '€', '50 × (1 − 0,30) = 35 €.'),
      tf('Una gran empresa es una buena inversión a cualquier precio.', false, 'Quien compró Microsoft en su máximo de 2000 tardó unos 16 años en recuperar ese precio, aunque el negocio siguió siendo excelente.'),
      scenario('El señor Mercado está deprimido: una empresa que estimas en 20 € por acción cotiza a 12 € tras una caída general de la bolsa, sin que su negocio haya cambiado. ¿Qué haría un inversor de valor?', [['Vender porque baja', 'Venderías justo cuando te ofrecen una ganga, sin que el negocio haya cambiado.'], ['Comprobar que el negocio sigue igual y, si es así, ver que el precio está muy por debajo del valor', 'Eso: el precio ha bajado, el valor no. Y aun así, revisa bien tu estimación.'], ['Comprar con todo su dinero sin revisar nada', 'El margen de seguridad no sustituye a revisar tu estimación ni a diversificar.']], 1, 'Graham aprovechaba los cambios de humor del mercado sin dejarse arrastrar por ellos.'),
      fill('La diferencia entre el valor estimado y el precio que pagas se llama margen de ____.', 'seguridad', ['beneficio', 'error', 'maniobra'], 'Te protege si te equivocas en la estimación.'),
      buckets('¿Habla de precio o de valor?', ['Precio', 'Valor'], [['La acción cerró ayer a 15,20 €', 0], ['La empresa generará unos 100 M€ de caja al año', 1], ['Ha subido un 8 % esta semana', 0], ['Tiene una marca que le permite subir precios', 1], ['Capitaliza 1.500 M€ en bolsa', 0]], 'El precio lo ves en la pantalla; el valor sale de analizar el negocio.'),
      timed(tf('El precio de una acción y su valor pueden estar muy separados durante años.', true, 'El precio lo fija el ánimo del mercado; el valor, lo que generará el negocio.'), 10),
      chat(['Esta acción ha caído un 60 %, ¡ya no puede bajar más!', 'Voy a comprar 🤑'], '¿Qué le contestas a Lumi?', [['Claro, ya está en el suelo', 'Lo que ha caído un 60 % puede caer otro 60 %.'], ['Primero mira por qué ha caído y cuánto vale el negocio: barato no es lo mismo que infravalorado', 'Vale… ¿y si cayó porque el negocio se ha roto? Entonces el valor también bajó.'], ['Compra el doble para promediar', 'Doblar sin analizar es apostar más a ciegas.']], 1, 'Un precio bajo solo es oportunidad si está por debajo del valor.'),
      single('Según Graham, ¿cómo hay que tratar al «señor Mercado»?', ['Aprovechar sus cambios de humor sin obedecerle', 'Hacer siempre lo que dice', 'Ignorar siempre los precios'], 0, 'Sus precios son una oferta que puedes aceptar o no.'),
    ], { source: '5.1', minutes: 6, retire: [3, 4, 7, 9] })

// Antes en u17 (mismo id: conserva progreso y traducciones)
export const u17l1 = lesson('u17l1', 'El PER', [
      story('PER 4: ¿una ganga?', [{ id: 'hugo', name: 'Hugo' }], [
        say('hugo', 'He encontrado una acción con PER 4. ¡Está regalada!'),
        say('hugo', 'Pagas solo 4 años de beneficio. Le meto todos mis ahorros.'),
        choose('¿Qué le dices?', [
          opt('¡Corre, que se escapa!', 'bad', say('lumi', 'Casi nada tiene PER 4 sin motivo. Primero hay que saber cuál.')),
          opt('Mira por qué es tan bajo antes de comprar', 'good', say('lumi', 'Bien. Un PER muy bajo es una **pregunta**, no una respuesta.')),
          opt('Compra solo un poco, por si acaso', 'ok', say('lumi', 'Prudente, pero sigues sin saber qué compras.')),
        ]),
        say('hugo', 'Vale… Sus ventas llevan cinco años cayendo.'),
        say('lumi', 'Ahí está: el mercado paga poco porque espera que gane **menos**.'),
        say('lumi', 'PER bajo puede ser declive o un beneficio puntual. PER alto, quizá crecimiento.'),
      ]),
      play({
        title: '¿Cuántos años de beneficio pagas?',
        intro: 'Esta empresa gana **2 € por acción** al año. Mueve el precio de la acción y mira qué pasa con el **PER**.',
        widget: { kind: 'valuation', price: 30, eps: 2, growth: 0, maxPrice: 80, maxGrowth: 30 },
        predict: {
          prompt: 'Si el beneficio no cambia y el precio pasa de 30 € a 60 €, ¿qué le pasa al PER?',
          options: ['Se queda igual', 'Se duplica', 'Baja a la mitad'],
          answer: 1,
          why: 'PER = precio ÷ beneficio por acción: 60 ÷ 2 = **30**, el doble que 30 ÷ 2 = 15.',
        },
        goal: { text: 'Busca el precio con el que pagas 20 años de beneficio.', when: [when('per', '==', 20)] },
        insight: '**PER = precio ÷ beneficio por acción**: los años de beneficio que pagas. Panadería Global (15 € y 0,975 € de BPA) tiene PER 15,4, y su inverso, la **rentabilidad por beneficio**, es un 6,5 %.',
        lumi: [
          { when: when('per', '>=', 30), say: 'Pagas 30 años de beneficio o más. ¿Crecerá para merecerlo?', mood: 'THINKING' },
          { when: when('per', '<=', 8), say: 'PER muy bajo… ¿ganga o empresa en apuros?', mood: 'THINKING' },
          { say: 'Mueve el precio y mira el PER', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'PER alto, ¿siempre caro?',
        intro: 'Ahora cotiza a **60 €**: PER 30. Sin crecer, tardas 30 años en recuperar el precio con los beneficios. ¿Y si crecen?',
        widget: { kind: 'valuation', price: 60, eps: 2, growth: 0, maxPrice: 80, maxGrowth: 30 },
        predict: {
          prompt: 'Si el beneficio crece un 10 % al año, ¿cuánto tardas en recuperar los 60 €?',
          options: ['Unos 15 años', 'Unos 27 años', 'Sigue en 30 años'],
          answer: 0,
          why: 'Con un 10 % anual, los beneficios suman 60 € en **15 años**: la mitad de tiempo.',
        },
        goal: { text: 'Con el precio en 60 €, busca el crecimiento que te devuelve el precio en 15 años o menos.', when: [when('price', '==', 60), when('payback', '<=', 15)] },
        insight: '**PER alto no es caro** si el beneficio crece deprisa, y **PER bajo no es barato** si va a menguar. Compáralo siempre con su crecimiento, su historia y su sector.',
        lumi: [
          { when: when('payback', '<=', 10), say: '¡Diez años o menos! Crecer rápido abarata un PER alto.', mood: 'CELEBRATE' },
          { when: when('growth', '==', 0), say: 'Sin crecer, PER 30 son 30 años. Sube el crecimiento.', mood: 'THINKING' },
          { say: 'Sube el crecimiento y mira los años', mood: 'HAPPY' },
        ],
      }),
      key('Histórico y adelantado', 'Con el beneficio del último año es el **PER histórico**; con el previsto, el **PER adelantado**. Si el beneficio va a crecer mucho, el adelantado será más bajo.\n\nLa media del mercado ronda **15-17**. Compara con su historia y su sector: un banco a PER 8 y un software a PER 35 pueden estar «en su precio».', 'Un PER de 10 puede ser caro y uno de 30 barato: depende de lo que vaya a ganar la empresa.'),
    ], [
      num('Una acción cotiza a 30 € y su BPA es de 2 €. ¿Cuál es su PER?', 15, 'veces', '30 ÷ 2 = 15: pagas 15 años del beneficio actual.'),
      num('Una empresa capitaliza 4.000 M€ y gana 250 M€ al año. ¿Cuál es su PER?', 16, 'veces', '4.000 ÷ 250 = 16. Da igual hacerlo por acción o con la empresa entera.'),
      num('Una acción tiene un PER de 20. ¿Cuál es su rentabilidad por beneficio?', 5, '%', '1 ÷ 20 = 5 %.'),
      fill('PER = precio ÷ ____.', 'BPA', ['ventas', 'dividendo', 'deuda'], 'Precio de la acción entre el beneficio por acción.'),
      fill('Si el BPA se duplica y el precio no se mueve, el PER se reduce a la ____.', 'mitad', ['tercera parte', 'cuarta parte', 'décima parte'], 'El mismo precio entre el doble de beneficio da la mitad de PER.'),
      tf('Un PER bajo siempre significa que la acción está barata.', false, 'Puede reflejar una empresa en declive o un beneficio puntual inflado.'),
      single('Un año, una empresa vende su sede y su beneficio se triplica. Su PER cae de 18 a 6. ¿Qué ha pasado?', ['El PER está distorsionado por un beneficio puntual', 'Se ha convertido en una ganga', 'Su negocio ha mejorado mucho'], 0, 'Ese beneficio no se repetirá: hay que mirar el beneficio recurrente.'),
      num('Una acción a 60 € tiene un BPA de 3 € este año y se espera un BPA de 4 € el próximo. ¿Cuál es su PER adelantado?', 15, 'veces', '60 ÷ 4 = 15. El histórico es 60 ÷ 3 = 20.'),
      timed(single('Rápido: precio 45 €, BPA 3 €. ¿PER?', ['12', '15', '18'], 1, '45 ÷ 3 = 15.'), 12),
      chat(['He encontrado una acción con PER 4 😍', '¡Está regalada!'], '¿Qué le contestas a Lumi?', [['Cómprala ya, que se escapa', 'Antes de nada: casi nada tiene PER 4 sin motivo, y hay que averiguar cuál.'], ['Mira por qué es tan bajo: beneficio puntual, negocio en declive o deuda enorme', 'Vale, investigo antes de enamorarme del número.'], ['Un PER bajo siempre es mejor', 'No siempre: a veces es la forma que tiene el mercado de decir «este beneficio no va a durar».']], 1, 'Un PER muy bajo es una pregunta, no una respuesta.'),
    ], { source: '5.5', minutes: 6, retire: [5, 8, 9] })

// Antes en u20 (mismo id: conserva progreso y traducciones)
export const u20l1 = lesson('u20l1', 'Anatomía de una vela', [
      story('Rojo es subir', [{ id: 'mei', name: 'Mei' }], [
        note('Mei, una amiga de Shanghái, te enseña su app de bolsa.'),
        say('mei', 'Hoy mi acción está en rojo. ¡Qué bien, ha subido!'),
        choose('¿Qué pasa aquí?', [
          opt('En China el rojo suele ser subida', 'good', say('lumi', 'Eso. En China, Japón y Corea los colores suelen ir al revés.')),
          opt('Se ha equivocado: rojo es bajar', 'bad', say('lumi', 'Aquí sí, pero en su app no. Mira siempre la leyenda.')),
          opt('Su app está rota', 'ok', say('lumi', 'No está rota: allí el rojo suele significar subida.')),
        ]),
        say('lumi', 'Las velas nacieron en el mercado de arroz de **Dojima** (Osaka), en el siglo XVIII.'),
        say('lumi', 'La tradición se las atribuye al comerciante Munehisa Homma.'),
        say('lumi', 'Steve Nison las trajo a Occidente en 1991. Hoy son el gráfico por defecto.'),
      ]),
      play({
        title: '¿Verde o roja?',
        intro: 'El **cuerpo** va de la apertura al cierre; las **mechas**, hasta el máximo y el mínimo. ¿De qué color es cada vela?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Verde' }, { label: 'Roja' }],
          cards: [
            { icon: 'candles', label: 'Abre en 100 y cierra en 106', bin: 0, why: 'Cierra por encima de la apertura. Cuerpo: 6.' },
            { icon: 'candles', label: 'Abre en 62 y cierra en 57', bin: 1, why: 'Cierra por debajo de la apertura. Cuerpo: 5.' },
            { icon: 'candles', label: 'Abre en 20, sube hasta 25 y cierra en 19', bin: 1, why: 'El máximo no decide el color: cierra por debajo de la apertura.' },
            { icon: 'candles', label: 'Abre en 40, baja hasta 35 y cierra en 41', bin: 0, why: 'Cayó mucho, pero cerró por encima de la apertura.' },
            { icon: 'candles', label: 'Abre en 75 y cierra en 80', bin: 0, why: 'El cierre queda arriba: verde.' },
            { icon: 'candles', label: 'Abre en 12 y cierra en 11', bin: 1, why: 'El cierre queda abajo: roja.' },
          ],
        },
        goal: { text: 'Pinta las seis velas.', when: [when('done', '==', 6)] },
        insight: '**Verde:** cierra por encima de la apertura. **Roja:** por debajo. Las mechas llegan al máximo y al mínimo, pero **no deciden el color**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Compara solo la apertura y el cierre.', mood: 'THINKING' },
          { say: '¿El cierre queda arriba o abajo?', mood: 'HAPPY' },
        ],
      }),
      chart('morning-star-1', 'Ahora en un gráfico real: toca la vela verde con el cuerpo más grande, la que más subió de la apertura al cierre', 'Esa. Su cuerpo va de la apertura (abajo) al cierre (arriba); las líneas finas marcan el máximo y el mínimo.', 'Busca el rectángulo verde más alto, sin contar las líneas finas.'),
      key('Un ejemplo con números', 'Vela con O = 100, H = 108, L = 97, C = 106: es verde (106 > 100), su cuerpo mide 6 (de 100 a 106), la mecha superior 2 (de 106 a 108), la inferior 3 (de 97 a 100) y el rango total 11.', 'El cuerpo va de la apertura al cierre; las mechas llegan al máximo y al mínimo.', 'Verde: el cierre está arriba. Roja: el cierre está abajo.'),
    ], [
      match('En una vela verde, empareja cada punto con su precio.', [['Parte alta del cuerpo', 'El cierre'], ['Parte baja del cuerpo', 'La apertura'], ['Punta de la mecha superior', 'El máximo'], ['Punta de la mecha inferior', 'El mínimo']], 'En una vela verde la apertura está abajo y el cierre arriba; en una roja, al revés. Las mechas siempre llegan al máximo y al mínimo.'),
      single('Vela con apertura 40, máximo 44, mínimo 39 y cierre 43. ¿De qué color es?', ['Verde', 'Roja'], 0, 'Cierra (43) por encima de la apertura (40): es alcista, verde.'),
      num('Vela con apertura 40, máximo 44, mínimo 39 y cierre 43. ¿Cuánto mide el cuerpo?', 3, 'puntos', 'Del 40 de la apertura al 43 del cierre: 3 puntos.'),
      num('Vela verde con apertura 40, máximo 44, mínimo 39 y cierre 43. ¿Cuánto mide su mecha inferior?', 1, 'puntos', 'De la apertura (40), que es la parte baja del cuerpo, al mínimo (39): 1 punto.'),
      num('Vela roja con apertura 62, máximo 63, mínimo 55 y cierre 57. ¿Cuánto mide su cuerpo?', 5, 'puntos', 'De 62 a 57: 5 puntos. En una roja, la apertura está arriba y el cierre abajo.'),
      fill('En una vela roja, la apertura está en la parte ____ del cuerpo.', 'alta', ['baja', 'media', 'exterior'], 'Si cierra por debajo de la apertura, la apertura queda arriba y el cierre abajo.'),
      candle('Toca la vela con la mecha inferior más larga.', 'hammer-3', 'El precio bajó mucho durante esa sesión, pero se recuperó antes del cierre. Esa línea fina es el camino hasta el mínimo.'),
      order('Ordena de menor a mayor los precios de una vela verde con mechas.', ['Mínimo', 'Apertura', 'Cierre', 'Máximo'], 'Mínimo ≤ apertura < cierre ≤ máximo. En una roja, apertura y cierre se intercambian.'),
      tf('En todas las plataformas del mundo, el verde significa que el precio subió.', false, 'En China, Japón y Corea los colores suelen ir al revés: rojo para subir y verde para bajar.'),
      timed(fill('El libro que llevó las velas japonesas a Occidente en 1991 lo escribió Steve ____.', 'Nison', ['Dow', 'Elder', 'Wilder'], 'Steve Nison publicó Japanese Candlestick Charting Techniques en 1991.'), 12),
    ], { source: '8.2', minutes: 6, retire: [1, 8, 9] })

// Antes en u21 (mismo id: conserva progreso y traducciones)
export const u21l1 = lesson('u21l1', 'Soportes y resistencias', [
      story('La memoria del mercado', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Compré a 50 € y la acción se hundió hasta 40 €.'),
        say('pablo', 'Ahora vuelve a 50 €. Solo quiero salir sin perder.'),
        note('Como Pablo, mucha gente compró a 50 € y lleva meses esperando.'),
        choose('¿Qué suele pasar cuando el precio vuelve a 50 €?', [
          opt('Nada: 50 € es un precio como otro', 'bad', say('lumi', 'Es justo donde muchos atrapados quieren salir: suele aparecer **venta**.')),
          opt('Aparece venta: actúa como resistencia', 'good', say('lumi', '¡Eso! Muchos venden ahí para «recuperar lo suyo». Eso es una **resistencia**.')),
          opt('Sube seguro con fuerza', 'ok', say('lumi', 'Puede romperla, pero cuesta: en 50 € hay vendedores esperando.')),
        ]),
        say('lumi', 'Un **soporte** es lo contrario: donde antes aparecieron compradores.'),
      ]),
      mission({
        title: 'Stop bajo el soporte',
        intro: 'Velas reales de Alphabet: compras al último precio. El **soporte** queda algo más de un 2 % por debajo y la **resistencia**, casi un 5 % por encima.',
        widget: { kind: 'orders', chart: 'lvl-12', stopPct: 1, takePct: 4, maxPct: 10 },
        predict: {
          prompt: '¿Dónde pondrías el stop de esta compra?',
          options: ['Justo encima del soporte, para perder poco', 'Un poco por debajo del soporte', 'Sin stop: el soporte aguantará'],
          answer: 1,
          why: 'Si el precio pierde el soporte, tu idea de compra deja de valer: el stop va al otro lado. Por encima, cualquier bajada normal te saca.',
        },
        goal: { text: 'Pon el stop bajo el soporte y el objetivo antes de la resistencia. Luego mira qué pasó.', when: [when('stopPct', '>=', 2.5), when('takePct', '<=', 4.5), when('played', '==', 1), when('hit', '==', 2)] },
        insight: 'El stop va **al otro lado del soporte**: si se pierde, la idea ya no vale. Y el objetivo, **antes de la resistencia**, donde suele aparecer venta.',
        lumi: [
          { when: when('hit', '==', 2), say: '¡Objetivo! El soporte aguantó y tu stop no saltó.', mood: 'CELEBRATE' },
          { when: when('hit', '==', 1), say: 'Saltó el stop. ¿Estaba por debajo del soporte o por encima?', mood: 'WORRIED' },
          { when: when('stopPct', '<', 2.5), say: 'Ese stop queda por encima del soporte: cualquier mecha lo salta.', mood: 'THINKING' },
          { say: 'Mueve el stop y el objetivo, y dale a ver qué pasó', mood: 'HAPPY' },
        ],
      }),
      key('Cómo trazarlos', '• Mejor en diario o semanal.\n• Busca zonas donde el precio haya girado al menos **2–3 veces**.\n• Traza una **zona** (un rectángulo estrecho), no una línea al céntimo.\n• Más toques y más volumen = más relevante. Los niveles antiguos y lejanos pesan menos.\n• Los números redondos y los máximos históricos también atraen órdenes.', 'Un soporte es donde antes aparecieron compradores; una resistencia, donde aparecieron vendedores.', 'Trázalos como zonas, no como líneas al milímetro.'),
    ], [
      point('En este tramo lateral, toca el techo: el cierre más alto, donde aparecieron vendedores', 'trend-flat-2', 'max', 'Esa zona actúa como resistencia: la subida se frenó ahí y el precio volvió a bajar.'),
      point('Ahora el suelo: toca el cierre más bajo, donde aparecieron compradores', 'trend-flat-3', 'min', 'Esa zona actuó como soporte: la caída se frenó y el precio rebotó con fuerza.'),
      level('Has comprado al último precio. Coloca el stop un poco por debajo del soporte: el mínimo reciente.', 'lvl-1', 'STOP', 'Si el precio pierde el soporte, la idea de compra deja de valer. El stop va algo por debajo, no justo encima de la línea, para que una mecha no lo salte.'),
      level('Coloca ahora el objetivo: cerca de la resistencia, el máximo anterior.', 'lvl-12', 'TAKE', 'En el máximo anterior suele aparecer venta: poner el objetivo en esa zona es más realista que esperar a que la atraviese.'),
      tf('Los soportes deben trazarse como líneas exactas al céntimo.', false, 'Son zonas donde muchos se ponen de acuerdo, no un precio exacto.'),
      multi('¿Qué hace más relevante un soporte? Marca todo.', ['Que el precio haya girado ahí varias veces', 'Que hubiera mucho volumen en esa zona', 'Que sea reciente', 'Que lo diga un anuncio en redes'], [0, 1, 2], 'Más toques, más volumen y más cercanía en el tiempo. Los niveles antiguos y lejanos pesan menos.'),
      upDown('Busca soportes y resistencias en estas 30 velas. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-20', 'Un soporte o una resistencia dicen dónde puede aparecer compra o venta, no qué pasará. Sirven sobre todo para saber dónde te has equivocado.'),
      scenario('Pablo compró a 50 €, la acción cayó a 40 € y ahora vuelve a 50 €. Muchos como él quieren «recuperar lo suyo». ¿Qué suele pasar en esa zona?', [['Nada especial: 50 € es un precio como otro', 'Es justo donde muchos compradores atrapados quieren salir: suele aparecer venta.'], ['Suele aparecer venta: actúa como resistencia', 'Eso: la memoria de los que compraron arriba crea oferta en ese nivel.'], ['El precio sube seguro con fuerza', 'Puede romperla, pero lo habitual es que cueste: allí hay vendedores esperando.']], 1, 'Las resistencias nacen de la memoria de los participantes: quien perdió quiere salir sin pérdidas.'),
      timed(single('Rápido: zona donde las caídas se han frenado varias veces.', ['Soporte', 'Resistencia', 'Clavicular'], 0, 'Es un soporte: ahí aparecieron compradores.'), 10),
      num('Un soporte está en la zona de 20 €. Pones el stop un 3 % por debajo. ¿A qué precio va?', 19.4, '€', '20 × 0,97 = 19,40 €. Dejar algo de margen evita que una simple mecha te saque.'),
    ], { source: '9.1', minutes: 6, retire: [3, 4, 7, 8] })

// Antes en u24 (mismo id: conserva progreso y traducciones)
export const u24l3 = lesson('u24l3', 'La regla del 1 %', [
      play({
        title: 'Arriesgar no es invertir',
        intro: 'Cuenta de **10.000 €**. La regla del 1 %: si salta el stop, pierdes como mucho **100 €**.',
        widget: { kind: 'position', account: 10000, riskPct: 1, stopPct: 2, entry: 50, maxRisk: 5, maxStop: 15 },
        predict: {
          prompt: '¿Significa que solo puedes invertir 100 €?',
          options: ['Sí: 100 € y ni un euro más', 'No: lo que inviertes depende de dónde va el stop', 'No: puedes invertir lo que quieras, sin stop'],
          answer: 1,
          why: 'Con el stop al 2 %, puedes invertir **5.000 €** y, si salta, pierdes 100 €. Riesgo no es lo mismo que cantidad invertida.',
        },
        goal: { text: 'Con el riesgo en el 1 %, busca el stop que deja la posición en 2.000 €.', when: [when('riskEur', '==', 100), when('size', '==', 2000)] },
        insight: '**Tamaño = riesgo ÷ distancia al stop.** Stop cerca, compras más; stop lejos, compras menos. La pérdida máxima es siempre la misma.',
        lumi: [
          { when: when('riskPct', '>', 2), say: 'Más de un 2 % por operación es mucho, sobre todo al empezar.', mood: 'WORRIED' },
          { when: when('posPct', '>=', 100), say: 'Con el stop tan cerca, metes toda la cuenta. ¿Seguro?', mood: 'THINKING' },
          { when: when('stopPct', '>=', 10), say: 'Stop lejos: compras poco, pero arriesgas lo mismo.', mood: 'HAPPY' },
          { say: 'Deja el 1 % y mueve el stop', mood: 'HAPPY' },
        ],
      }),
      story('«Estoy segurísimo»', [{ id: 'bruno', name: 'Bruno' }], [
        say('bruno', 'Tengo 8.000 € y esta operación es segura. Arriesgo un 10 %.'),
        choose('¿Qué le recomiendas?', [
          opt('Adelante: si está seguro, no hay riesgo', 'bad', say('lumi', 'Si falla, pierde **800 €** de golpe. Su seguridad no cambia nada.')),
          opt('Que mantenga el 1 %: 80 € de riesgo, como en cualquier otra', 'good', say('lumi', '¡Eso! Nadie sabe qué operación saldrá bien: el riesgo es el mismo en todas.')),
          opt('Que arriesgue el 10 %, pero sin stop', 'bad', say('lumi', 'Sin stop, la pérdida no tiene límite. Todavía peor.')),
        ]),
        say('bruno', '¿Y si de verdad sale bien?'),
        say('lumi', 'Ganará algo menos. Pero seguirá en el juego cuando falle otra.'),
      ]),
      key('Límites que se suman', 'La mayoría de profesionales arriesga entre el **0,5 % y el 2 %** por operación; para empezar, un 1 % o menos. Además conviene limitar el **riesgo total abierto** (no más del 5–6 % a la vez) y el **peso de cada posición** (E-Trading avisa a partir del 20 %).', 'Riesgo no es lo mismo que cantidad invertida: puedes invertir un 16 % y arriesgar un 1 %.', 'Primero decides dónde te equivocas. Después, cuántas acciones compras.'),
    ], [
      single('Tienes 10.000 € y sigues la regla del 1 %. ¿Qué significa?', ['Que solo puedes invertir 100 €', 'Que si salta el stop pierdes como mucho 100 €', 'Que esperas ganar un 1 % por operación'], 1, 'La regla limita la pérdida si te equivocas, no la cantidad invertida.'),
      num('Tu cartera simulada vale 5.000 €. Con la regla del 1 %, ¿cuánto puedes perder como máximo en una operación?', 50, '€', '5.000 × 0,01 = 50 €.'),
      num('Tienes 20.000 €, arriesgas un 1 %, compras a 80 € y pones el stop en 76 €. ¿Cuántas acciones compras?', 50, 'acciones', '20.000 × 1 % = 200 €. Distancia al stop: 4 €. 200 ÷ 4 = 50 acciones.'),
      num('En la operación anterior (50 acciones a 80 € con 20.000 € de capital), ¿qué porcentaje de tu capital has invertido?', 20, '%', '50 × 80 = 4.000 €; 4.000 ÷ 20.000 = 20 %. Inviertes un 20 % pero solo arriesgas un 1 %.'),
      tf('Riesgo por operación y cantidad invertida son lo mismo.', false, 'El riesgo es lo que pierdes si salta el stop; la cantidad invertida puede ser mucho mayor.'),
      buckets('Tienes 10.000 €. ¿Respeta la regla del 1 %?', ['Sí la respeta', 'No la respeta'], [['Si salta el stop pierdo 100 €', 0], ['Si salta el stop pierdo 150 €', 1], ['Si salta el stop pierdo 80 €', 0], ['Invierto 1.000 € sin stop', 1], ['Si salta el stop pierdo 500 €', 1]], 'Sin stop, el riesgo es todo lo invertido: 1.000 € es un 10 % de la cuenta.'),
      scenario('Bruno tiene 8.000 € y está «segurísimo» de una operación. Quiere arriesgar un 10 % en ella. ¿Qué le recomiendas como concepto?', [['Que lo haga: si está seguro, no hay riesgo', 'La seguridad que siente no cambia nada: si falla, pierde 800 € de golpe.'], ['Que mantenga el 1 %: 80 € de riesgo, como en cualquier otra', 'Bien: el riesgo es el mismo en todas, porque nadie sabe qué operación saldrá bien.'], ['Que arriesgue el 10 % pero sin stop', 'Sin stop la pérdida no tiene límite: es todavía peor.']], 1, 'El riesgo por operación no depende de lo convencido que estés: es siempre el mismo.'),
      multi('¿Qué límites de riesgo propone el curso para quien empieza? Marca todos.', ['Arriesgar un 1 % o menos por operación', 'No más del 5–6 % de riesgo abierto a la vez', 'Vigilar el peso de cada posición (aviso a partir del 20 %)', 'Usar al menos un apalancamiento 1:10'], [0, 1, 2], 'El apalancamiento no forma parte de la regla: mientras aprendes, mejor sin él.'),
      timed(single('Rápido: ¿cuánto suelen arriesgar los profesionales por operación?', ['Entre el 0,5 % y el 2 %', 'Entre el 10 % y el 20 %', 'Todo lo que pueden'], 0, 'Y para quien empieza, un 1 % o menos.'), 12),
      fill('Primero decides dónde va el ____; después, cuántas acciones compras.', 'stop', ['objetivo', 'dividendo', 'apalancamiento'], 'El tamaño sale de la distancia al stop, nunca al revés.'),
      chat(['Con la regla del 1 % y 10.000 €, ¿solo puedo comprar 100 € de acciones? 🤔', 'Así no gano nada...'], '¿Qué le explicas a Lumi?', [['Sí, solo 100 € por operación', 'Eso confunde riesgo con inversión: puedes invertir bastante más.'], ['Puedes invertir más: lo que no puedes es perder más de 100 € si salta el stop', '¡Ahh! Entonces, con el stop a 3 € de la entrada, compro 33 acciones y arriesgo 99 €.'], ['La regla solo sirve con cuentas grandes', 'Funciona igual con 1.000 € o con 100.000 €: siempre es un porcentaje.']], 1, 'El 1 % limita la pérdida, no la inversión.'),
    ], { source: '10.2', minutes: 6, retire: [0, 4, 6, 8, 10] })

// Antes en u27 (mismo id: conserva progreso y traducciones)
export const u27l4 = lesson('u27l4', 'FOMO y efecto rebaño', [
      mission({
        title: 'Vive la fiebre puntocom',
        intro: 'Diciembre de 1998. Internet lo va a cambiar todo y tus amigos solo hablan de tecnológicas. Metes **10.000 €** en el Nasdaq 100, con datos reales.',
        widget: { kind: 'crash', series: 'series-dotcom', amount: 10000 },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Subió un **156 %** en 15 meses; luego cayó un **83 %** desde el máximo y no lo recuperó hasta 2015. **Cuando todo el mundo habla de algo que «solo sube», el riesgo suele ser máximo.**',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -40), say: 'De la euforia al desplome. Y nadie avisó del techo.', mood: 'WORRIED' },
          { when: when('drop', '>=', 100), say: '¡Más del doble! Ahora todo el mundo quiere entrar.', mood: 'HAPPY' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      story('«¡Entra hoy!»', [{ id: 'alex', name: 'Álex' }], [
        say('alex', 'Esta acción ha subido un **200 %** en dos semanas.'),
        say('alex', 'Todos en el grupo están dentro. ¡Entra hoy o te lo pierdes!'),
        choose('No está en tu plan. ¿Qué haces?', [
          opt('Compro ya, antes de que suba más', 'bad', say('lumi', 'Eso es **FOMO**: compras sin saber qué hace la empresa, tras una subida enorme.')),
          opt('Espero 48 horas y me pregunto si la compraría si nadie hablara de ella', 'good', say('lumi', '¡Eso! Si en dos días sigue teniendo sentido, lo decides con calma.')),
          opt('Pido un préstamo para entrar fuerte', 'bad', say('lumi', 'Deuda y FOMO: la receta clásica de las peores pérdidas.')),
        ]),
        say('lumi', 'Cuando **todos** ya han comprado, no queda nadie para seguir empujando.'),
        say('lumi', 'La urgencia es el combustible del FOMO. Quítale tiempo y se apaga.'),
      ]),
      key('Señales de alarma', '• Te enteras por amigos o redes que nunca habían invertido.\n• La razón es que «**sube mucho**», no qué hace el activo.\n• Sientes **urgencia**: «si no compro hoy, me lo pierdo».\n• Se dice que «**esta vez es diferente**».\n\nAntídotos: la **regla de las 48 horas** y un **límite de especulación** escrito en tu plan.', 'Cuando todo el mundo habla de algo que «solo sube», el riesgo suele ser máximo.', 'Si tu peluquero te recomienda una criptomoneda, quizá ya es tarde.'),
    ], [
      spot('Marca los mensajes que intentan activar tu FOMO para venderte algo o engañarte.', [['Grupo «Lambo 2030»', '🚀 Esta cripto ha subido un 300 % en un mes. Mañana será tarde. ¡Entra YA!', true], ['Tu bróker', 'Recordatorio: tu aportación periódica de 100 € se ejecutará el día 5.', false], ['Influencer', 'Solo quedan 3 plazas en mi grupo de señales. Esta vez es diferente, no te quedes fuera.', true], ['Tu primo', 'Todo el mundo está ganando con esta acción. Mete los ahorros, no lo pienses.', true], ['CNMV', 'Consulta si una entidad está autorizada antes de invertir con ella.', false]], 'Urgencia, «esta vez es diferente» y «todo el mundo gana» son las señales clásicas del FOMO.'),
      upDown('Noviembre de 2021: bitcoin está en máximos, sale en todos los telediarios y tus amigos que nunca habían invertido están comprando. ¿Qué hizo después?', 'hist-btc-2021', 'Bitcoin cayó cerca de un 75 % en el año siguiente. El momento de máxima euforia suele ser el de máximo riesgo. Recuerda: en cripto puede perderse la totalidad de lo invertido.', 'el año siguiente'),
      upDown('Este activo ha subido con fuerza y en redes todo el mundo habla de él. ¿Sube o baja en las sesiones siguientes?', 'ud-95', 'Ni la euforia en redes ni las subidas anteriores te dicen qué viene. Por eso existe la regla de las 48 horas.'),
      scenario('Un amigo te escribe: «Esta acción ha subido un 200 % en dos semanas. Todos en el grupo están dentro. ¡Entra hoy!». No está en tu plan. ¿Qué haces?', [['Compro ya, antes de que suba más', 'Estás comprando por FOMO: sin saber qué hace la empresa y después de una subida enorme.'], ['Aplico la regla de las 48 horas y me pregunto si la compraría si nadie hablara de ella', 'Bien: si en dos días sigue teniendo sentido y cabe en tu límite de especulación, lo decides con calma.'], ['Pido un préstamo para entrar fuerte', 'Deuda + FOMO es la receta clásica de las peores pérdidas.']], 1, 'La urgencia es el combustible del FOMO: quitarle tiempo a la decisión es su antídoto.'),
      single('¿Qué regla ayuda contra el FOMO?', ['Comprar enseguida para no perder la subida', 'Esperar 48 horas cualquier compra que no esté en tu plan', 'Doblar la posición si sigue subiendo'], 1, 'Dos días bastan para que se pase la urgencia.'),
      multi('¿Cuáles son señales de alarma de una burbuja? Marca todas.', ['«Esta vez es diferente»', 'Gente sin experiencia recomendándolo', 'La única razón es que sube mucho', 'Beneficios crecientes y estables durante años'], [0, 1, 2], 'Unos beneficios estables no son señal de burbuja: lo son la euforia y la falta de motivos.'),
      tf('Cuando ya todo el mundo ha comprado algo, suele quedarle mucho recorrido al alza.', false, 'Si todos han comprado ya, no queda nadie para seguir empujando el precio.'),
      timed(single('Rápido: ¿qué pregunta te protege del efecto rebaño?', ['¿Cuánto ha subido esta semana?', '¿Lo compraría si nadie hablara de ello?', '¿Qué dicen en el foro?'], 1, 'Separa el valor de lo que hace la multitud.'), 12),
      match('Empareja cada burbuja con su época.', [['Puntocom', '1999–2000'], ['Bolsa japonesa', '1989'], ['Meme stocks', '2021'], ['Criptomonedas (dos veces)', '2017 y 2021']], 'Cambian los activos; el FOMO es siempre el mismo.'),
      chat(['Todo el mundo en TikTok está ganando con una moneda nueva 🐶', 'Si no entro hoy, me lo pierdo.'], '¿Qué le dices a Lumi?', [['Entra ya, que vuela', 'Si entro por miedo a quedarme fuera, lo más probable es que compre cerca del techo.'], ['Espera 48 horas y piensa si la comprarías si nadie hablara de ella', 'Vale… Si sigue teniendo sentido en dos días, la meto en mi límite de especulación. Si no, nada.'], ['Mete los ahorros de emergencia', 'Eso es lo único que nunca se toca. Y en cripto se puede perder todo lo invertido.']], 1, 'La prisa es la señal: cuando sientes urgencia, para.'),
    ], { source: '11.3', minutes: 6, retire: [3, 4, 6, 7] })

export default [u16l1, u17l1, u20l1, u21l1, u24l3, u27l4]
