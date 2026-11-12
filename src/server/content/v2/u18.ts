import 'server-only'
// Sección 6 · Unidad 18 · Calidad del negocio y macro (docs/curso-v2/02-curriculo.md)
// Datos reales de Inditex (ejercicio 2024) solo como ejemplo para practicar, nunca como recomendación.
import { esNum, FACTS } from '../facts'
import { buckets, chat, choose, fill, key, lesson, match, mission, multi, note, num, opt, order, play, point, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u18', order: 18, title: 'Calidad del negocio y macro', description: 'Ventajas competitivas, ciclo, tipos de interés, datos macro y cómo analizar una empresa',
  lessons: [
    lesson('u18l1', 'Ventajas competitivas: el foso', [
      play({
        title: '¿Foso o no?',
        intro: '¿Por qué sigues en WhatsApp aunque salga una app mejor? Porque están tus amigos: eso es un **foso**, como lo llama Buffett, una ventaja que la competencia no puede copiar.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Es foso' }, { label: 'No es foso' }],
          cards: [
            { icon: 'pharma', label: 'Un medicamento con patente', bin: 0, why: 'Intangible: nadie puede copiarlo durante años.' },
            { icon: 'message', label: 'Una red social con miles de millones de usuarios', bin: 0, why: 'Efecto red: cada usuario la hace más útil para los demás.' },
            { icon: 'tv', label: 'Un buen anuncio en televisión', bin: 1, why: 'Lo puede pagar cualquier competidor.' },
            { icon: 'laptop', label: 'El software de gestión que usa toda una empresa', bin: 0, why: 'Costes de cambio: cambiarlo cuesta mucho tiempo y dinero.' },
            { icon: 'truck', label: 'Un distribuidor que compra más barato que nadie', bin: 0, why: 'Ventaja en costes: vende barato y sigue ganando.' },
            { icon: 'clothes', label: 'El producto de moda de este verano', bin: 1, why: 'Las modas pasan; un foso dura.' },
            { icon: 'fuel', label: 'El único oleoducto de una región', bin: 0, why: 'Escala eficiente: el mercado solo da para uno.' },
          ],
        },
        goal: { text: 'Clasifica las siete ventajas.', when: [when('done', '==', 7)] },
        insight: 'Un **foso** es una ventaja **difícil de copiar** y que dura: intangibles, costes de cambio, efecto red, ventaja en costes o escala eficiente.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿un competidor con dinero podría copiarlo mañana?', mood: 'THINKING' },
          { say: '¿Es difícil de copiar?', mood: 'HAPPY' },
        ],
      }),
      story('Año 2000: el mejor negocio del mundo', [{ id: 'luis', name: 'Tío Luis' }], [
        note('Año 2000. Microsoft es una de las mejores empresas del mundo.'),
        say('luis', 'Todo el mundo usa Windows. Compro acciones, al precio que sea.'),
        say('lumi', 'Ojo: Microsoft o Cisco cotizan a un PER de entre 60 y 100.'),
        choose('¿Qué le dices al tío Luis?', [
          opt('Con ese negocio, el precio da igual', 'bad', say('lumi', 'Quien compró en el máximo de 2000 tardó unos **16 años** en recuperarlo.')),
          opt('Gran negocio, pero mira si el precio es razonable', 'good', say('lumi', 'Exacto. El negocio siguió siendo excelente; el problema era el precio.')),
          opt('Espera a que lo recomienden en la tele', 'ok', say('lumi', 'Mejor mira el precio tú. Cuando todos hablan de algo, suele estar caro.')),
        ]),
        say('luis', 'Vaya. Buen negocio… y mala compra.'),
        say('lumi', 'Un buen negocio necesita foso. Una buena inversión, además, un buen precio.'),
      ]),
      key('Cómo se ve un foso en los números', '• Márgenes y ROIC **altos y estables** durante 10 años.\n• Puede **subir precios** sin perder clientes, incluso con inflación.\n• Mantiene o gana **cuota de mercado**.', 'Un buen negocio necesita un foso; una buena inversión necesita, además, un buen precio.', 'Pruébalo: pregúntale a Lumi qué foso tiene una app que uses cada día.'),
    ], [
      match('Empareja cada ejemplo con su foso.', [['Una red social con miles de millones de usuarios', 'Efecto red'], ['El software de gestión que usa toda una empresa', 'Costes de cambio'], ['Una farmacéutica con un medicamento patentado', 'Intangibles'], ['Un gran distribuidor que compra más barato que nadie', 'Ventaja en costes'], ['El único oleoducto de una región', 'Escala eficiente']], 'Los cinco fosos de Morningstar y Pat Dorsey.'),
      single('¿Qué foso tiene un sistema de pagos que aceptan casi todas las tiendas y usan casi todos los clientes?', ['Efecto red', 'Escala eficiente', 'Ninguno'], 0, 'Cuantas más tiendas lo aceptan, más clientes lo quieren, y al revés.'),
      multi('¿Qué señales en los números sugieren un foso? Marca todas.', ['Márgenes altos y estables durante años', 'Subir precios sin perder clientes', 'Pérdidas constantes', 'ROIC alto durante una década'], [0, 1, 3], 'Las pérdidas constantes indican justo lo contrario.'),
      scenario('Ana analiza una cafetería de moda con colas en la puerta que ganó mucho el año pasado. A 50 metros acaban de abrir otras tres parecidas. ¿Qué concluye sobre su foso?', [['Tiene un foso enorme: hay colas', 'La moda no es un foso: si es fácil de copiar, la competencia llega y se reparte las colas.'], ['Su foso es débil: es fácil de copiar y ya la están copiando', 'Eso: sin algo que impida a otros hacer lo mismo, los beneficios altos atraen competencia.'], ['El foso depende de la decoración del local', 'Sin una ventaja difícil de copiar, no hay foso.']], 1, 'Si un negocio gana mucho y es fácil de copiar, la competencia llegará.'),
      scenario('Bruno encuentra una empresa con un foso clarísimo… que cotiza a PER 90 y crece al 10 % anual. ¿Qué tiene en cuenta?', [['Que con ese foso cualquier precio está bien', 'Microsoft en 2000 también tenía foso, y quien compró en el máximo tardó unos 16 años en recuperar.'], ['Que su PEG es 9: el precio ya descuenta muchísimo', 'Eso: 90 ÷ 10 = 9. Un gran negocio puede ser una mala inversión si pagas de más.'], ['Que un PER alto garantiza que seguirá subiendo', 'No garantiza nada; solo indica expectativas muy altas.']], 1, 'Un buen negocio necesita, además, un buen precio.'),
      tf('Una empresa sin ninguna ventaja competitiva puede mantener márgenes muy altos durante décadas.', false, 'Los márgenes altos atraen competidores; sin foso, acaban bajando.'),
      buckets('¿Es foso o no lo es?', ['Es foso', 'No es foso'], [['Una patente de 15 años', 0], ['Un producto de moda este verano', 1], ['Clientes que perderían sus datos si se cambian', 0], ['Un buen anuncio en televisión', 1], ['Una licencia exclusiva para operar un aeropuerto', 0]], 'Un foso es una ventaja difícil de copiar y que dura.'),
      timed(single('Rápido: una app de mensajería vale más con cada usuario nuevo. ¿Qué foso es?', ['Efecto red', 'Ventaja en costes', 'Patente'], 0, 'Cada usuario hace el producto más útil para los demás.'), 10),
      num('Microsoft tardó unos 16 años en recuperar su máximo de 2000. Si la inflación hubiera sido del 2 % anual, ¿cuánto poder de compra habría perdido quien recuperó justo ese precio? (en %)', 27, '%', '1 ÷ 1,02¹⁶ ≈ 0,728: un 27 % menos de poder de compra en 16 años, sin contar dividendos.', 3),
      chat(['Me encanta esta marca, la uso cada día 😍', '¿Eso significa que tiene foso y que es buena inversión?'], '¿Qué le contestas a Lumi?', [['Sí: si te gusta a ti, le gusta a todos', 'Que te guste es un comienzo, no un análisis.'], ['Puede tener foso, pero hay que verlo en sus márgenes y su ROIC, y además mirar el precio', 'Vale: que me guste el producto no me dice si la acción está cara.'], ['No, las marcas nunca son foso', 'Las marcas fuertes pueden ser un foso muy potente.']], 1, 'Busca el foso en los números y no olvides el precio.'),
    ], { source: '5.7', minutes: 6, retire: [5, 6, 7, 8, 9] }),

    lesson('u18l2', 'Sectores cíclicos y defensivos', [
      play({
        title: '¿Cíclico o defensivo?',
        intro: 'Si mañana te quedaras sin trabajo, seguirías comprando comida, pero aplazarías el viaje de verano. A las empresas les pasa igual en una crisis: clasifica cada negocio.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Cíclico' }, { label: 'Defensivo' }],
          cards: [
            { icon: 'car', label: 'Fabricante de coches', bin: 0, why: 'Un coche nuevo se aplaza cuando vienen mal dadas.' },
            { icon: 'food', label: 'Supermercado', bin: 1, why: 'Se sigue comprando comida en cualquier crisis.' },
            { icon: 'plane', label: 'Aerolínea', bin: 0, why: 'Los viajes son de lo primero que se recorta.' },
            { icon: 'power', label: 'Eléctrica', bin: 1, why: 'La luz se paga igual con o sin crisis.' },
            { icon: 'gem', label: 'Marca de lujo', bin: 0, why: 'El capricho caro se aplaza.' },
            { icon: 'pharma', label: 'Farmacéutica', bin: 1, why: 'Los medicamentos no se dejan por una recesión.' },
            { icon: 'building', label: 'Constructora', bin: 0, why: 'Muy sensible al empleo, al crédito y a los tipos.' },
            { icon: 'bank', label: 'Banco', bin: 0, why: 'En una recesión crecen los impagos y se presta menos.' },
          ],
        },
        goal: { text: 'Clasifica los ocho negocios.', when: [when('done', '==', 8)] },
        insight: 'Lo que se compra igual en una crisis es **defensivo**: cae menos y sube menos. Lo que se aplaza es **cíclico**: sube más en las expansiones y cae más en las recesiones.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿esto lo dejaría de comprar si perdiera el trabajo?', mood: 'THINKING' },
          { say: 'Clasifica cada negocio', mood: 'HAPPY' },
        ],
      }),
      // Auditoría RED-12 y RED-34: cada episodio histórico se vive en una sola clase. Aquí va otra serie real (Yahoo Finance);
      // las cifras del texto están calculadas sobre `charts.json`.
      mission({
        title: 'Marzo de 2020',
        intro: 'Enero de 2020. Inviertes **10.000 €** en el Nasdaq 100, el índice de las grandes tecnológicas. Llega una pandemia y la economía se para. Datos reales, día a día.',
        widget: { kind: 'crash', series: 'series-ndx-2020', amount: 10000 },
        predict: {
          prompt: 'En marzo de 2020 los titulares hablan de recesión y paro récord. ¿Cuándo crees que tocó fondo la bolsa?',
          options: ['Cuando mejoraron los datos económicos', 'Con las noticias aún terribles', 'No se recuperó en todo el año'],
          answer: 1,
          why: 'Tocó fondo el **20 de marzo de 2020**, un 28 % por debajo de su máximo de febrero, cuando las noticias aún eran terribles.',
        },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'La bolsa **se adelanta**: mira lo que espera dentro de 6 o 12 meses. En 2020, el Nasdaq 100 tocó fondo el 20 de marzo y a principios de junio ya había recuperado su máximo.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira qué pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -20), say: 'Más de un 20 % abajo en semanas. Los titulares dan miedo. ¿Aguantas?', mood: 'WORRIED' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      key('El ciclo económico', '1. **Recuperación:** tipos bajos, la economía empieza a crecer.\n2. **Expansión:** empleo alto y beneficios al alza; puede aparecer la inflación.\n3. **Desaceleración:** suben los tipos y se frena el crecimiento.\n4. **Recesión:** cae el PIB (técnicamente, dos trimestres seguidos) y sube el paro.\n\nLa bolsa suele caer **antes** de una recesión y subir **antes** de que termine: en marzo de 2009 y en marzo de 2020 tocó fondo con noticias terribles.', 'La bolsa no mira el presente: mira lo que espera dentro de 6 o 12 meses.', 'Pruébalo: en Mercado, mira el sector de Inditex y el de Iberdrola: ¿cuál es defensivo?'),
    ], [
      buckets('¿Cíclico o defensivo?', ['Cíclico', 'Defensivo'], [['Fabricante de coches', 0], ['Eléctrica', 1], ['Cadena de hoteles', 0], ['Farmacéutica', 1], ['Marca de lujo', 0], ['Supermercado', 1]], 'Lo que se compra igual en una crisis es defensivo; lo que se aplaza, cíclico.'),
      match('Empareja cada fase del ciclo con lo que suele pasar.', [['Recuperación', 'Tipos bajos y la economía empieza a crecer'], ['Expansión', 'Empleo alto y beneficios al alza'], ['Desaceleración', 'Suben los tipos y se frena el crecimiento'], ['Recesión', 'Cae el PIB y sube el paro']], 'Y vuelta a empezar.'),
      // RED-34: antes, septiembre de 2008 (que se vive en la unidad de crisis). Inflación de EE. UU. de septiembre de 2022: 8,2 % interanual (BLS, publicada el 13-10-2022)
      upDown('Octubre de 2022: la inflación en EE. UU. supera el 8 %, la Reserva Federal sube los tipos al ritmo más rápido en décadas y casi todo el mundo espera una recesión. ¿Qué hizo el S&P 500 después?', 'hist-sp500-2022', 'El índice tocó suelo ese mismo mes, con las noticias aún malas, y subió un 33 % hasta finales de 2023. La bolsa mira lo que espera, no lo que dicen hoy los titulares.', 'hasta diciembre de 2023'),
      upDown('Marzo de 2009: el paro se dispara y los titulares son terribles. El S&P 500 ha caído más de un 50 % desde su máximo. ¿Qué hizo después?', 'hist-2009-bottom', 'Con noticias tan malas, casi nadie se atrevía a decidir nada. Recuerda que la bolsa mira lo que espera dentro de meses, no lo que pasa hoy.', 'hasta diciembre de 2010'),
      single('¿Qué es técnicamente una recesión?', ['Dos trimestres seguidos de caída del PIB', 'Una caída de la bolsa del 10 %', 'Una subida de tipos'], 0, 'Es la definición habitual.'),
      tf('La bolsa suele tocar fondo cuando ya han mejorado los datos económicos.', false, 'Suele adelantarse: en 2009 y en 2020 tocó fondo con las noticias todavía muy malas.'),
      scenario('Los datos apuntan a una desaceleración. Pablo tiene casi toda su cartera en bancos, automoción y hoteles. ¿Qué riesgo tiene?', [['Ninguno: esos sectores siempre suben', 'Son justo los más sensibles al ciclo: caen más en las recesiones.'], ['Está muy concentrado en cíclicos, que suelen caer más si llega una recesión', 'Eso: no se trata de adivinar la recesión, sino de no depender de un solo tipo de sector.'], ['Que los sectores defensivos no existen', 'Existen: alimentación, salud, eléctricas…']], 1, 'Repartir entre cíclicos y defensivos reduce la dependencia del ciclo.'),
      timed(single('Rápido: ¿qué sector suele caer menos en una recesión?', ['Alimentación', 'Aerolíneas', 'Automoción'], 0, 'La gente sigue comprando comida en las crisis.'), 10),
      multi('¿Qué sectores son defensivos? Marca todos.', ['Eléctricas', 'Salud', 'Alimentación', 'Construcción'], [0, 1, 2], 'La construcción es muy cíclica.'),
      num('En una recesión, un sector cíclico cae un 40 %. ¿Cuánto tiene que subir después para volver a su nivel?', 66.7, '%', '1 ÷ 0,60 ≈ 1,667 → +66,7 %. Un defensivo que cae un 15 % solo necesita un +17,6 %.', 2),
    ], { source: '6.3', minutes: 6, retire: [0, 3, 5, 7, 9] }),

    lesson('u18l3', 'Bancos centrales y tipos de interés', [
      story('El BCE sube los tipos', [{ id: 'dani', name: 'Dani' }], [
        note('El BCE quiere la inflación cerca del **2 %** a medio plazo. Hoy está bastante más alta.'),
        say('dani', 'Dicen en las noticias que el BCE sube los tipos. ¿Y eso a mí qué me afecta?'),
        choose('Dani tiene una hipoteca variable y un depósito. ¿Qué le pasa?', [
          opt('Paga más hipoteca y cobra más por el depósito', 'good', say('lumi', 'Eso. El dinero se encarece para quien pide y paga más a quien ahorra.')),
          opt('Nada: eso solo afecta a los bancos', 'bad', say('lumi', 'Los tipos son el **precio del dinero**: afectan a casi todo.')),
          opt('Solo le sube la hipoteca', 'ok', say('lumi', 'Y además su depósito pagará algo más.')),
        ]),
        say('lumi', 'Con préstamos más caros se consume e invierte menos. La economía se enfría.'),
        say('lumi', 'Y la inflación baja, pero con **12-24 meses** de retraso.'),
        say('dani', '¿Y la bolsa?'),
        say('lumi', 'Los beneficios futuros valen menos hoy. Y depósitos y bonos le hacen competencia.'),
      ]),
      // Auditoría RED-10: la pieza del bono a 30 años es de u9l3 («Si suben los tipos, bajan los bonos»). Aquí va cómo llegan
      // los tipos a una familia: la cuota de una hipoteca variable (préstamo francés, la misma fórmula que u3l1).
      play({
        title: 'Tu hipoteca cuando suben los tipos',
        intro: 'Una hipoteca variable de **150.000 €** a 25 años. Hoy pagas un **2 %**. El banco central sube los tipos y tu hipoteca se revisa…',
        widget: { kind: 'loan', amount: 150000, tin: 2, months: 300, fee: 0, maxAmount: 300000, maxTin: 6, maxMonths: 360 },
        predict: {
          prompt: 'Si tu tipo pasa del 2 % al 4 %, ¿cuánto sube la cuota de cada mes?',
          options: ['Unos 15 €', 'Unos 155 €', 'Se duplica'],
          answer: 1,
          why: 'Pasa de **635,78 €** a **791,76 €**: 156 € más cada mes, casi 1.900 € al año.',
        },
        goal: { text: 'Sube el tipo al 4 % y mira la cuota.', when: [when('tin', '==', 4)] },
        insight: 'Los tipos son el **precio del dinero**: cuando suben, las familias con hipoteca variable tienen menos para gastar, y las empresas endeudadas, menos para invertir. Así se enfría la economía.',
        lumi: [
          { when: when('tin', '>=', 5), say: 'Con un 5 %, casi 880 € al mes: 240 € más que al principio.', mood: 'WORRIED' },
          { when: when('tin', '<', 2), say: 'Si bajan los tipos pasa lo contrario: la cuota baja y queda más para gastar.', mood: 'HAPPY' },
          { say: 'Sube el TIN y mira la cuota', mood: 'THINKING' },
        ],
      }),
      play({
        title: '¿Quién sufre más?',
        intro: 'Suben los tipos de interés. ¿Quién lo nota más?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Sufre más' }, { label: 'Sufre menos' }],
          cards: [
            { icon: 'rocket', label: 'Tecnológica joven sin beneficios', bin: 0, why: 'Su valor está en beneficios lejanos, que se descuentan más.' },
            { icon: 'bank', label: 'Banco', bin: 1, why: 'Al principio cobra más por sus préstamos. Si la economía se frena mucho, también sufre.' },
            { icon: 'alert', label: 'Empresa muy endeudada', bin: 0, why: 'Le suben los intereses que paga.' },
            { icon: 'piggy', label: 'Un depósito nuevo', bin: 1, why: 'Pagará más interés que antes.' },
            { icon: 'home', label: 'Inmobiliaria', bin: 0, why: 'Vive de la deuda y de las hipotecas: todo se encarece.' },
            { icon: 'document', label: 'Bono a 30 años', bin: 0, why: 'Cuanto más largo, más cae su precio.' },
            { icon: 'food', label: 'Supermercado sin deuda', bin: 1, why: 'Se sigue comprando comida y no paga intereses.' },
          ],
        },
        goal: { text: 'Clasifica los siete.', when: [when('done', '==', 7)] },
        insight: 'Cuando el dinero se encarece, **el futuro vale menos**. En 2022, la subida de tipos más rápida en décadas hizo caer el Nasdaq más de un 30 % y los bonos largos más de un 20 %.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Depende de beneficios lejanos o de la deuda?', mood: 'THINKING' },
          { say: 'Clasifica cada uno', mood: 'HAPPY' },
        ],
      }),
      key('El precio del dinero', `• **BCE:** objetivo de inflación del **2 %** a medio plazo.\n• **Reserva Federal:** precios estables y máximo empleo.\n\nEl tipo de referencia del BCE es la **facilidad de depósito**: desde septiembre de 2026 está en el **${esNum(FACTS.ecbDepositRate.value)} %**. Consulta el valor vigente en ecb.europa.eu, porque cambia varias veces al año.`, 'Cuando el dinero se encarece, el futuro vale menos.', 'Pruébalo: busca en Mercado el ETF TLT de bonos largos y mira su 2022.'),
    ], [
      upDown('Enero de 2022: la inflación en EE. UU. está en máximos de casi 40 años y la Fed prepara subidas de tipos. Este es un ETF de bonos del Tesoro de EE. UU. a más de 20 años. ¿Qué hizo después?', 'hist-rates-2022', 'Los bonos largos son muy sensibles a los tipos: cuanto más lejos está el dinero que pagan, más cambia su valor de hoy cuando el tipo se mueve.', 'hasta octubre de 2023'),
      order('Ordena lo que pasa cuando el banco central sube los tipos.', ['Los préstamos se encarecen', 'Se consume e invierte menos', 'La economía se enfría', 'La inflación baja con retraso'], 'Con un retraso de 12 a 24 meses entre el primer paso y el último.'),
      scenario('El BCE sube los tipos más de lo esperado. Laura tiene una tecnológica joven sin beneficios, un banco y un fondo de bonos a 30 años. ¿Qué parte suele sufrir menos a corto plazo?', [['La tecnológica sin beneficios', 'Es la más sensible: su valor depende de beneficios muy lejanos.'], ['El banco', 'Eso: al principio, los bancos suelen cobrar más por sus préstamos. Aunque si la economía se frena mucho, también sufren.'], ['El fondo de bonos a 30 años', 'Es de lo que más cae cuando suben los tipos.']], 1, 'Las subidas de tipos castigan sobre todo lo que depende del futuro lejano.'),
      single('¿Cuál es el objetivo de inflación del BCE?', ['2 % a medio plazo', '0 %', '5 %'], 0, 'Por eso actúa cuando la inflación se aleja del 2 %.'),
      num('Un bono paga 20 € al año para siempre. Con tipos del 2 %, vale 20 ÷ 0,02 = 1.000 €. ¿Cuánto valdría si los tipos suben al 4 %?', 500, '€', '20 ÷ 0,04 = 500 €: los tipos se duplican y el precio cae a la mitad. Por eso los bonos más largos sufrieron tanto en 2022.'),
      tf('Las subidas de tipos suelen beneficiar a los bonos largos que ya tienes.', false, 'Su precio cae: los bonos nuevos pagan más y los viejos solo se venden más baratos.'),
      match('Empareja cada concepto con su significado.', [['QE (expansión cuantitativa)', 'El banco central compra bonos para inyectar dinero'], ['QT (contracción cuantitativa)', 'El banco central reduce los bonos que tiene'], ['Facilidad de depósito', 'Lo que paga el BCE a los bancos por dejarle dinero'], ['Mandato dual de la Fed', 'Precios estables y máximo empleo']], 'Además de los tipos, los bancos centrales mueven el mercado comprando o soltando bonos.'),
      timed(single('Rápido: suben los tipos. ¿Qué empresa suele sufrir más en bolsa?', ['Tecnológica joven sin beneficios', 'Supermercado', 'Eléctrica sin deuda'], 0, 'Su valor depende de beneficios lejanos, que se descuentan más.'), 10),
      tf('En 2022 cayeron a la vez las acciones tecnológicas y los bonos largos.', true, 'El Nasdaq cayó más de un 30 % y los bonos largos más de un 20 %: la subida de tipos golpeó a los dos.'),
      chat(['El BCE ha bajado los tipos 📉', '¿Eso es bueno o malo para la bolsa?'], '¿Qué le contestas a Lumi?', [['Siempre malo', 'Al contrario: suele estimular la economía y favorecer a bolsa y bonos… salvo que se baje por miedo a una crisis.'], ['Suele ser favorable, pero depende de si ya se esperaba y de por qué los bajan', '¡Ah! Si los bajan porque viene una crisis, igual no es tan buena noticia.'], ['No tiene ningún efecto', 'Los tipos son el precio del dinero: afectan a todo.']], 1, 'Bajar los tipos suele favorecer a bolsa y bonos, pero cuentan la sorpresa y el motivo.'),
    ], { source: '6.1', minutes: 6, retire: [0, 4, 5, 7] }),

    lesson('u18l4', 'Los datos que mueven el mercado', [
      story('Buen dato, bolsa en rojo', [{ id: 'hugo', name: 'Hugo' }], [
        note('Primer viernes del mes. Sale el dato de empleo de EE. UU.'),
        say('hugo', '¡Se han creado muchísimos más empleos de lo esperado!'),
        say('hugo', 'Y la bolsa… ¿cae? No entiendo nada.'),
        choose('¿Por qué crees que cae?', [
          opt('El mercado teme que los tipos sigan altos', 'good', say('lumi', 'Eso. Con tanto empleo, la Fed tiene menos prisa por bajarlos.')),
          opt('El dato será falso', 'bad', say('lumi', 'El dato es real. El mercado piensa en qué hará la Fed.')),
          opt('Es pura casualidad', 'ok', say('lumi', 'Puede haber ruido, pero aquí hay un motivo: los tipos.')),
        ]),
        say('lumi', 'El precio ya incluye lo **esperado**. Lo que mueve es la **sorpresa**.'),
        say('lumi', 'Bueno para la economía no siempre es bueno para la bolsa ese día.'),
      ]),
      play({
        title: 'Esperado contra real',
        intro: 'El mercado esperaba un dato y salió otro. ¿Sorpresa **buena**, **mala** o **ninguna** para la bolsa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Buena' }, { label: 'Mala' }, { label: 'Sin sorpresa' }],
          cards: [
            { icon: 'percent', label: 'Inflación esperada del 3 %; sale un 3,4 %', bin: 1, why: 'Más inflación de lo esperado: tipos altos más tiempo.' },
            { icon: 'factory', label: 'PMI esperado de 49; sale 52', bin: 0, why: 'Más actividad de la esperada, y por encima de 50: expansión.' },
            { icon: 'bars', label: 'PIB esperado del +0,3 %; sale un +0,3 %', bin: 2, why: 'Ya estaba en el precio: poco que ajustar.' },
            { icon: 'down', label: 'PIB esperado del +0,4 %; sale un −0,1 %', bin: 1, why: 'La economía va peor de lo que se creía.' },
            { icon: 'cart', label: 'Inflación esperada del 2,9 %; sale un 2,5 %', bin: 0, why: 'Menos inflación de la esperada acerca las bajadas de tipos.' },
            { icon: 'bank', label: 'El BCE baja los tipos 0,25 puntos, como se esperaba', bin: 2, why: 'Si todo el mundo lo esperaba, ya estaba en el precio.' },
            { icon: 'alert', label: 'Se esperaba que la Fed mantuviera los tipos y los sube', bin: 1, why: 'Dinero más caro sin avisar: mala sorpresa para la bolsa.' },
          ],
        },
        goal: { text: 'Clasifica los siete datos.', when: [when('done', '==', 7)] },
        insight: 'El mercado no reacciona a si el dato es bueno o malo, sino a si es **mejor o peor de lo esperado**. Lo esperado ya está en el precio.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Compara el dato con lo esperado, no con el mes anterior.', mood: 'THINKING' },
          { say: '¿Mejor, peor o igual de lo esperado?', mood: 'HAPPY' },
        ],
      }),
      key('El calendario económico', '• **IPC/IPCA:** inflación. Decide los tipos.\n• **PIB:** crecimiento de la economía.\n• **Empleo:** en EE. UU., las nóminas no agrícolas del primer viernes de cada mes; en España, la EPA y el paro registrado.\n• **PMI:** encuesta mensual a gestores de compras. **Por encima de 50 = expansión.** Se adelanta al PIB.\n• **Decisiones de tipos** del BCE y la Fed.', 'El mercado no reacciona a si el dato es bueno o malo, sino a si es mejor o peor de lo esperado.', 'Pruébalo: el primer viernes del mes, mira en Mercado cómo reacciona el S&P 500.'),
    ], [
      match('Empareja cada dato con lo que mide.', [['IPC', 'La inflación'], ['PIB', 'El crecimiento de la economía'], ['PMI', 'La actividad de fábricas y servicios, por encuesta'], ['EPA', 'El empleo y el paro en España']], 'Los datos que más se miran en el calendario.'),
      timed(single('Rápido: un PMI de 46 indica…', ['Contracción', 'Expansión', 'Nada relevante'], 0, 'Por debajo de 50, la actividad se contrae.'), 10),
      timed(fill('Un PMI por encima de ____ indica expansión de la actividad.', '50', ['0', '100', '10'], 'Por debajo de 50, contracción.'), 10),
      scenario('Se espera una inflación del 2,8 % y sale un 3,3 %. Tienes una posición grande en bonos largos. ¿Qué es lo más probable ese día?', [['Que los bonos suban', 'Un dato peor de lo esperado aleja las bajadas de tipos: lo habitual es que caigan.'], ['Que los bonos caigan: el mercado pasa a esperar tipos más altos', 'Eso: la sorpresa al alza en la inflación presiona los precios de los bonos.'], ['Nada, ya se sabía', 'Se esperaba un 2,8 %, no un 3,3 %: hay sorpresa.']], 1, 'Cuenta la diferencia entre el dato y lo esperado.'),
      scenario('Viernes: el dato de empleo de EE. UU. sale muchísimo mejor de lo esperado y la bolsa cae. Marta no lo entiende. ¿Cuál es la explicación más probable?', [['Que el dato es falso', 'El dato es real; el mercado está pensando en qué hará la Fed.'], ['Que el mercado teme que la Fed mantenga los tipos altos más tiempo', 'Eso: buena noticia para la economía, mala para quien esperaba bajadas de tipos.'], ['Que la bolsa siempre cae los viernes', 'No existe ninguna regla así.']], 1, 'Bueno para la economía no siempre es bueno para la bolsa ese día.'),
      single('¿Por qué se sigue tanto el PMI?', ['Porque se adelanta al PIB', 'Porque lo publica la bolsa', 'Porque mide el precio del oro'], 0, 'Es una encuesta mensual que llega mucho antes que el dato de PIB.'),
      buckets('El mercado esperaba un dato y salió otro. ¿Sorpresa positiva o negativa para la bolsa?', ['Positiva', 'Negativa'], [['Inflación esperada del 3 %; sale un 2,6 %', 0], ['PIB esperado del +0,5 %; sale un −0,2 %', 1], ['Inflación esperada del 2,5 %; sale un 3,1 %', 1], ['PMI esperado de 48; sale 51', 0]], 'Menos inflación y más actividad de lo esperado suelen gustar; lo contrario, no.'),
      tf('El mercado reacciona sobre todo a si el dato es bueno o malo, no a lo que se esperaba.', false, 'Reacciona a la sorpresa: lo esperado ya está en el precio.'),
      multi('¿Qué datos suelen mover más los mercados? Marca todos.', ['Las decisiones de tipos del BCE y la Fed', 'La inflación', 'El empleo de EE. UU.', 'El número de visitantes de un museo'], [0, 1, 2], 'Tipos, inflación y empleo deciden la política monetaria.'),
      single('Se esperaba un PIB del +0,3 % y sale un +0,3 %. ¿Reacción más probable?', ['Poca: ya estaba en el precio', 'Una subida enorme', 'Una caída enorme'], 0, 'Sin sorpresa, no hay mucho que ajustar.'),
    ], { source: '6.4', minutes: 6, retire: [1, 2, 4, 6, 7] }),

    lesson('u18l5', 'Empresas pequeñas y en crecimiento: qué mirar', [
      story('«Va a multiplicar por 10»', [{ id: 'marc', name: 'Marc' }], [
        say('marc', 'He encontrado una empresa que vende un 80 % más cada año.'),
        say('marc', '¡En el foro dicen que va a multiplicar por 10!'),
        say('lumi', '¿Gana dinero?'),
        say('marc', 'Todavía no. Tiene 120 M€ en caja y quema 10 M€ al mes.'),
        choose('¿Qué miras primero?', [
          opt('Cuántos meses aguanta y cómo se financiará', 'good', say('lumi', 'Clave: 120 ÷ 10 = **12 meses de caja**. Después, tendrá que pedir dinero.')),
          opt('Nada: si crece tanto, irá bien', 'bad', say('lumi', 'Crecer sin caja es una carrera contrarreloj.')),
          opt('Su PER', 'ok', say('lumi', 'Sin beneficio, el PER no sirve. Mira ventas, márgenes y caja.')),
        ]),
        say('lumi', 'Si no gana dinero a tiempo, **ampliará capital**: tu parte se diluye.'),
        say('lumi', 'O se endeudará. Y con tipos altos, estas empresas sufren más.'),
      ]),
      play({
        title: 'Sin beneficios: ¿qué mirar?',
        intro: 'Una empresa joven pierde dinero mientras crece. ¿Esto es **buena señal**, **mala señal** o **no dice nada**?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Buena señal' }, { label: 'Mala señal' }, { label: 'No dice nada' }],
          cards: [
            { icon: 'up', label: 'Sus ventas crecen fuerte varios años seguidos', bin: 0, why: 'Crecer de forma sostenida es lo primero que se busca.' },
            { icon: 'pie', label: 'Margen bruto del 70 %: cada venta deja dinero', bin: 0, why: 'Si cada venta deja dinero, crecer la acerca a ganar.' },
            { icon: 'hourglass', label: 'Caja para solo 6 meses', bin: 1, why: 'Lo más probable es que necesite más dinero pronto.' },
            { icon: 'megaphone', label: 'Muchos seguidores en redes sociales', bin: 2, why: 'La popularidad no paga nóminas.' },
            { icon: 'layers', label: 'Amplía capital cada año', bin: 1, why: 'Cada ampliación diluye a los accionistas.' },
            { icon: 'piggy', label: 'Caja para 30 meses', bin: 0, why: 'Tiempo de sobra para llegar a ganar dinero.' },
            { icon: 'message', label: 'En un foro dicen que «va a multiplicar por 10»', bin: 2, why: 'Una opinión no es un dato.' },
            { icon: 'down', label: 'Su margen bruto baja año tras año', bin: 1, why: 'Cada venta deja menos: crecer la aleja de ganar dinero.' },
          ],
        },
        goal: { text: 'Clasifica las ocho pistas.', when: [when('done', '==', 8)] },
        insight: 'En una empresa sin beneficios, la pregunta clave es **si llegará a ganar dinero antes de quedarse sin caja**. Mira crecimiento, margen bruto y **meses de caja = caja ÷ consumo mensual**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: '¿Le acerca a ganar dinero o le aleja?', mood: 'THINKING' },
          { say: 'Clasifica cada pista', mood: 'HAPPY' },
        ],
      }),
      key('Muchas no llegan', '• Sin beneficio, el PER no sirve. Se mira el **precio/ventas**: capitalización ÷ ventas.\n• Las pequeñas pueden multiplicarse… o desaparecer. Más de la mitad de las acciones de EE. UU. desde 1926 rindió menos que las letras del Tesoro.\n• Son de las que más sufren cuando suben los tipos.', 'En una empresa sin beneficios, la pregunta clave es si llegará a ganar dinero antes de quedarse sin caja.', 'Pruébalo: pregúntale a Lumi cómo se calculan los meses de caja de una empresa.'),
    ], [
      num('Una empresa tiene 90 M€ en caja y quema 7,5 M€ al mes. ¿Cuántos meses de caja tiene?', 12, 'meses', '90 ÷ 7,5 = 12 meses.'),
      num('Capitaliza 3.000 M€ y vende 200 M€ al año. ¿Cuál es su precio/ventas?', 15, 'veces', '3.000 ÷ 200 = 15: pagas 15 años de ventas, no de beneficios.'),
      num('Tienes 1 millón de acciones de una empresa con 100 millones (el 1 %). Amplía capital con 25 millones de acciones nuevas y no acudes. ¿Qué porcentaje tienes ahora?', 0.8, '%', '1 ÷ 125 = 0,8 %. Tu parte se ha reducido un 20 %.'),
      num('Una empresa vendió 50 M€ el año pasado y este año vende 80 M€. ¿Cuánto han crecido sus ventas?', 60, '%', '(80 − 50) ÷ 50 = 60 %.'),
      scenario('Ana encuentra una empresa pequeña que crece un 80 % en ventas, pierde dinero y tiene caja para 6 meses. En un foro dicen que «va a multiplicar por 10». ¿Qué mira primero?', [['Nada: si crece tanto, irá bien', 'Con 6 meses de caja, lo más probable a corto plazo es que necesite más dinero.'], ['Cómo va a financiarse: ampliación de capital, deuda o llegar a beneficios a tiempo', 'Eso: con 6 meses de caja, una ampliación que la diluya es muy probable.'], ['El número de seguidores del foro', 'La popularidad no paga nóminas.']], 1, 'Crecer sin caja es una carrera contrarreloj.'),
      scenario('Una empresa vende cada vez más, pero su margen bruto es del 5 % y bajando: casi todo lo que cobra se le va en lo que le cuesta vender. ¿Qué pinta tiene?', [['Excelente: crece mucho', 'Crecer vendiendo casi sin margen no acerca los beneficios: los aleja.'], ['Mala señal: crecer así no la acerca a ganar dinero', 'Eso: crecer solo vale si cada venta deja algo.'], ['Da igual el margen si las ventas suben', 'El margen dice si crecer crea o consume valor.']], 1, 'Mira si cada venta deja dinero, no solo cuántas ventas hay.'),
      single('¿Por qué el PER no sirve para una empresa que pierde dinero?', ['Porque sin beneficio sale negativo y no tiene sentido', 'Porque está prohibido calcularlo', 'Porque siempre sale 15'], 0, 'Por eso se miran ventas, márgenes y caja.'),
      tf('Las empresas de crecimiento sin beneficios suelen sufrir más cuando suben los tipos de interés.', true, 'Su valor depende de beneficios lejanos, que valen menos hoy con tipos más altos.'),
      timed(single('Rápido: 60 M€ de caja y 5 M€ quemados al mes. ¿Meses de caja?', ['6', '12', '30'], 1, '60 ÷ 5 = 12 meses.'), 12),
      multi('¿Qué conviene mirar en una empresa joven sin beneficios? Marca todo lo útil.', ['Crecimiento de ventas', 'Margen bruto', 'Meses de caja', 'Cuántas veces sale en redes sociales'], [0, 1, 2], 'Crecimiento, margen y caja dicen si el negocio puede llegar a ser rentable.'),
      buckets('Una empresa joven que aún pierde dinero: ¿buena o mala señal?', ['Buena señal', 'Mala señal'], [['Sus clientes repiten y pagan cada mes', 0], ['Sus pérdidas se reducen cada año', 0], ['Gasta en anuncios más de lo que vende', 1], ['Necesita una ampliación de capital cada año', 1], ['Le queda caja para dos años y medio', 0], ['Su margen bruto baja cada año', 1]], 'Lo bueno la acerca a ganar dinero antes de quedarse sin caja. Lo malo la aleja o la obliga a pedir dinero, y eso suele diluirte.'),
      scenario('Tienes acciones de una empresa joven que pierde dinero. Anuncia una ampliación de capital: emitirá muchas acciones nuevas y tú no vas a comprar ninguna. ¿Qué pasa con tu parte de la empresa?', [['Se hace más pequeña: el pastel se reparte entre más acciones', 'Eso es la dilución: tienes las mismas acciones, pero de un total mayor.'], ['Crece: entra dinero nuevo en la empresa', 'Entra dinero en la empresa, pero tu trozo del pastel se encoge.'], ['No cambia: sigo teniendo las mismas acciones', 'Tienes las mismas, pero ahora hay más en total: tu porcentaje baja.']], 0, 'Si hay más acciones y tú no compras, tu porcentaje baja: es la dilución. En empresas que queman caja es de lo más habitual, por eso se miran los meses de caja.'),
      single('Dos empresas inventadas sin beneficios venden 100 M€ al año. Una vale 300 M€ en bolsa; la otra, 3.000 M€. ¿Cuál está más cara según su precio/ventas?', ['La de 3.000 M€: pagas 30 veces sus ventas', 'La de 300 M€: es más pequeña', 'Las dos igual: venden lo mismo'], 0, 'Sin beneficios, se compara lo que vale con lo que vende: 3 veces las ventas frente a 30. La cara necesita crecer muchísimo para justificar su precio.'),
      chat(['Esta empresa vende un 80 % más cada año.', '¡Pero pierde dinero! ¿Cómo la valoro sin PER?'], '¿Qué le contestas a Lumi?', [['Con sus ventas, su margen bruto y sus meses de caja', 'Claro: precio/ventas, margen y caja. El PER aquí no sirve.'], ['Con el PER, como todas', 'Sin beneficio, el PER sale negativo y no dice nada.'], ['Por sus seguidores en redes', 'La popularidad no paga nóminas.']], 0, 'Sin beneficio, el PER no sirve. Se mira cuánto pagas por sus ventas, si cada venta deja dinero (margen bruto) y cuánto aguanta con su caja.'),
    ], { source: '5.5', minutes: 6, retire: [0, 1, 2, 3, 4, 7, 8, 9] }),

    lesson('u18l6', 'Analizar una empresa en 30 minutos', [
      story('Inditex en 30 minutos', [{ id: 'laura', name: 'Laura' }], [
        note('Laura analiza Inditex (ejercicio 2024) con una lista de 10 preguntas. Es práctica, **no una recomendación**.'),
        say('laura', 'Ventas: 38.632 M€, un 7,5 % más. Margen bruto: 57,8 %. Beneficio: 5.866 M€, un 9 % más.'),
        say('laura', '¿Crece? Sí. ¿Es rentable? Mucho. Ahora: ¿está sana? Tiene 11.495 M€ de caja neta.'),
        choose('¿Qué dice esa caja neta de su deuda?', [
          opt('Tiene más caja que deuda: muy sana', 'good', say('lumi', 'Eso. Con caja neta, la pregunta se responde rápido.')),
          opt('Que debe 11.495 M€', 'bad', say('lumi', 'Caja **neta** es caja menos deuda: le sobra dinero.')),
          opt('No se puede saber nada', 'ok', say('lumi', 'Sí: caja neta positiva significa más caja que deuda.')),
        ]),
        say('laura', 'Y paga 1,68 € de dividendo. Ahora la difícil: ¿está cara?'),
        say('lumi', 'Pesa tanto como las demás. Un gran negocio caro puede ser mala inversión.'),
      ]),
      play({
        title: 'Señales de alarma',
        intro: 'Los números a veces avisan antes que los titulares. ¿**Buena señal** o **alarma**?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Buena señal' }, { label: 'Alarma' }],
          cards: [
            { icon: 'cash', label: 'La caja libre va en línea con el beneficio', bin: 0, why: 'El beneficio se convierte en dinero de verdad.' },
            { icon: 'receipt', label: 'El beneficio crece y la caja no', bin: 1, why: '¿Dónde está el dinero? Hay que preguntarlo.' },
            { icon: 'document', label: 'Cambia de auditor y de director financiero', bin: 1, why: 'Cambios así en las cuentas piden explicaciones.' },
            { icon: 'layers', label: 'Ampliaciones de capital constantes', bin: 1, why: 'No genera el dinero que necesita y te diluye.' },
            { icon: 'shield', label: 'Tiene más caja que deuda', bin: 0, why: 'Aguanta mejor cualquier crisis.' },
            { icon: 'card', label: 'Paga el dividendo con deuda', bin: 1, why: 'Un dividendo sano sale de la caja.' },
            { icon: 'briefcase', label: 'Los directivos venden muchas acciones', bin: 1, why: 'Quien mejor la conoce está saliendo.' },
            { icon: 'alert', label: 'La deuda crece sin que crezcan los beneficios', bin: 1, why: 'Se endeuda sin ganar más: mala combinación.' },
          ],
        },
        goal: { text: 'Clasifica las ocho señales.', when: [when('done', '==', 8)] },
        insight: 'Las alarmas suelen estar en **la caja y la deuda**, no en el titular del beneficio. Si el beneficio sube y la caja no, pregunta por qué.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Sigue el dinero: ¿entra caja de verdad?', mood: 'THINKING' },
          { say: 'Clasifica cada señal', mood: 'HAPPY' },
        ],
      }),
      key('La lista de 10 preguntas', '1. ¿Entiendo cómo gana dinero?\n2. ¿Crece?\n3. ¿Es rentable (márgenes, ROE, ROIC)?\n4. ¿Genera caja?\n5. ¿Está sana (deuda)?\n6. ¿Tiene foso?\n7. ¿Quién la dirige?\n8. ¿Está cara?\n9. ¿Qué puede salir mal?\n10. ¿Qué me haría vender?', 'Si no puedes explicar en tres frases por qué compras una empresa, aún no estás listo para comprarla.', 'Pruébalo: elige una empresa en Mercado y repasa con Lumi las 10 preguntas.'),
    ], [
      order('Ordena los cinco primeros pasos de la lista.', ['¿Entiendo cómo gana dinero?', '¿Crece?', '¿Es rentable?', '¿Genera caja?', '¿Está sana?'], 'Primero entender el negocio; después, sus números.'),
      num('Con los datos de Inditex, ¿cuál fue su margen EBIT (EBIT ÷ ventas)? (un decimal)', 19.6, '%', '7.554 ÷ 38.632 ≈ 19,6 %: de cada 100 € vendidos, casi 20 € de beneficio operativo.', 2),
      single('Inditex tenía 11.495 M€ de caja neta. ¿Qué dice eso de su deuda neta/EBITDA?', ['Que es negativa: tiene más caja que deuda', 'Que es de unas 10 veces: muy preocupante', 'Que no se puede saber nada'], 0, 'Con caja neta, la pregunta 5 («¿está sana?») se responde rápido.'),
      multi('¿Qué son señales de alarma? Marca todas.', ['Dividendos pagados con deuda', 'Caja libre en línea con el beneficio', 'Cambios frecuentes de auditor', 'Ampliaciones de capital constantes'], [0, 2, 3], 'Que la caja acompañe al beneficio es buena señal.'),
      upDown('Gráfico real de una acción del IBEX 35: 30 sesiones sin nombre ni fecha. Aunque hubieras hecho tu análisis de 30 minutos, ¿sabrías qué hizo en las 10 siguientes?', 'ud-26', 'Un buen análisis te dice si el negocio es bueno y si su precio es razonable; no te dice qué hará el precio en dos semanas.'),
      point('Precio real de una gran tecnológica durante dos meses. Toca el punto más alto.', 'trend-up-2', 'max', 'El máximo de dos meses no dice si el negocio es bueno: eso lo responde la lista de comprobación.'),
      num('Inditex repartió un dividendo de 1,68 € y su beneficio por acción fue de unos 1,88 €. ¿Cuál fue su payout aproximado?', 89, '%', '1,68 ÷ 1,88 ≈ 89 %. Incluía 0,55 € de dividendo extraordinario; con tanta caja neta, un payout alto es más fácil de sostener que con deuda.', 2),
      scenario('Has aplicado la lista a una empresa: crece, gana mucho, genera caja, no tiene deuda y tiene una marca fuerte. Pero cotiza a un PER muy por encima de su media histórica. ¿Qué concluyes?', [['Compra segura: es un gran negocio', 'Gran negocio no es lo mismo que gran inversión: el precio importa.'], ['Es un gran negocio, pero tengo que decidir si el precio deja margen de seguridad', 'Eso: la pregunta 8 («¿está cara?») pesa tanto como las demás.'], ['Es una estafa', 'Nada lo indica: es un negocio sano a un precio exigente.']], 1, 'Un buen negocio necesita, además, un buen precio.'),
      timed(single('Rápido: ¿cuándo tiene sentido vender según tu análisis?', ['Cuando la tesis de inversión se rompe', 'Cuando el precio baja un 3 %', 'Cuando lo dice un foro'], 0, 'El precio puede bajar sin que el negocio empeore.'), 12),
      multi('¿Qué debe tener una buena tesis de inversión? Marca todo lo que corresponda.', ['Cómo gana dinero el negocio', 'Por qué el precio está por debajo del valor', 'Qué te haría vender', '«Porque está subiendo mucho»'], [0, 1, 2], 'Una tesis explica por qué el negocio vale más que su precio, y cuándo dejarías de creerlo.'),
      scenario('Aplicas la lista a dos empresas inventadas del mismo sector, al mismo PER. A crece, genera caja y tiene más caja que deuda. B crece igual, pero su beneficio no llega a la caja y amplía capital cada año. ¿Cuál pasa mejor el examen?', [['A: crece, convierte el beneficio en caja y está sana', 'Eso: al mismo precio, la que genera caja y no te diluye es mejor compra.'], ['B: crece lo mismo', 'Crece en papel, pero no genera caja y te diluye cada año.'], ['Las dos igual: tienen el mismo PER', 'El PER es igual; la calidad del beneficio, no.']], 0, 'Al mismo precio, gana la que responde mejor a «¿genera caja?» y «¿está sana?». Las alarmas suelen estar en la caja y la deuda, no en el titular del beneficio.'),
      chat(['Ya he hecho mi análisis de Inditex: es un negocio buenísimo.', '¿Compro ya?'], '¿Qué le contestas a Lumi?', [['Falta la pregunta 8: ¿el precio deja margen de seguridad?', 'Cierto: un gran negocio comprado caro puede ser mala inversión.'], ['Sí: si es buen negocio, el precio da igual', 'Recuerda a Microsoft en 2000: gran negocio, precio carísimo.'], ['No: los análisis no sirven para nada', 'Sirven para decidir con criterio, no para adivinar el precio.']], 0, 'La lista no termina en «es buen negocio»: también hay que decidir si el precio es razonable y qué te haría vender.'),
      buckets('¿Es un dato para tu análisis o es ruido?', ['Dato', 'Ruido'], [['Las ventas de los últimos cinco años', 0], ['Un mensaje que dice que la acción «va a explotar»', 1], ['La deuda frente a lo que gana', 0], ['Que ha subido un 8 % esta semana', 1], ['De dónde vienen sus ingresos', 0]], 'Un análisis se hace con el negocio y sus cuentas; lo que hizo el precio esta semana o lo que se dice en redes no cuenta.'),
    ], { source: '5.9', minutes: 6, retire: [1, 2, 3, 4, 5, 6, 8, 11] }),
  ],
})
