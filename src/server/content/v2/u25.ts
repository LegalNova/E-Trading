import 'server-only'
// Sección 8 · Unidad 25 · Estrategias (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/04 (4.1, 4.3, 4.7), 03 (3.6), 05 (5.1, 5.6, 5.8), 09 (9.10), 10 (10.5, 10.7), 01 (1.7); clases antiguas course/u04.ts y u10.ts.
import { buckets, chat, choose, fill, key, lesson, level, match, mission, multi, note, num, opt, order, play, point, say, scenario, simTrade, single, spot, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u25', order: 25, title: 'Estrategias', description: 'De comprar y mantener al day trading: qué dice la evidencia de cada estrategia',
  lessons: [
    lesson('u25l1', 'Comprar y mantener', [
      story('Salir «solo unos días»', [{ id: 'tomas', name: 'Tomás' }], [
        say('tomas', 'La bolsa está cayendo fuerte. Salgo unos días y vuelvo cuando se calme.'),
        choose('¿Qué le dices a Tomás?', [
          opt('Buena idea: así esquiva lo peor', 'bad', say('lumi', 'Los mejores días suelen llegar pegados a los peores. Fuera, se los pierde.')),
          opt('Cuidado: los mejores días llegan justo después de los peores', 'good', say('lumi', '¡Eso! De los 10 mejores días, 7 llegaron muy cerca de los peores.')),
          opt('Vale, pero que sea solo un día', 'ok', say('lumi', 'Basta un día: si es de los mejores, sale muy caro.')),
        ]),
        say('lumi', 'J.P. Morgan: 10.000 $ en el S&P 500 (2005-2024) acabaron en **71.750 $**.'),
        say('lumi', 'Perdiéndose solo los 10 mejores días: **32.871 $**. Menos de la mitad.'),
        say('tomas', 'Vale. Me quedo dentro y miro menos la pantalla.'),
      ]),
      mission({
        title: '¿Y si eliges mal el país?',
        intro: 'Datos reales: la bolsa japonesa mes a mes desde 1985. Invierte en un mes cualquiera y espera unos años.',
        widget: { kind: 'horizon', series: 'series-japan', years: 1, maxYears: 30 },
        predict: {
          prompt: 'En Japón, si invertías un mes cualquiera y esperabas **20 años**, ¿cuántas veces perdiste dinero?',
          options: ['Nunca: 20 años es muchísimo tiempo', 'Más o menos la mitad de las veces', 'Siempre'],
          answer: 1,
          why: 'Un **52 %** de los periodos de 20 años acabó en pérdidas. El Nikkei tardó 34 años en recuperar su máximo de 1989.',
        },
        goal: { text: 'Alarga la espera hasta 30 años. ¿Desaparecen las pérdidas?', when: [when('years', '==', 30)] },
        insight: 'Ni con 30 años: un **36 %** de los periodos seguía en pérdidas. Comprar y mantener funciona mejor con **un índice amplio y mundial** que con un solo país.',
        lumi: [
          { when: when('years', '>=', 25), say: 'Ni esperando décadas desaparecen las pérdidas. Todo por depender de un país.', mood: 'WORRIED' },
          { when: when('years', '>=', 10), say: 'Con 10 años o más, cerca de la mitad de los periodos perdía.', mood: 'THINKING' },
          { say: 'Alarga la espera y mira cuántas veces se perdió', mood: 'HAPPY' },
        ],
      }),
      key('La estrategia aburrida que funciona', 'Comprar un índice amplio y barato, **mantenerlo durante décadas** y aportar con regularidad.\n\nSegún SPIVA (cierre de 2025), el **97 %** de los fondos de acciones europeos quedó por detrás de su índice en 10 años. Comprar el índice ya te pone por delante de casi todos.', 'En bolsa, el tiempo dentro del mercado vale más que acertar cuándo entrar.', 'Pruébalo: en Mercado, abre el ETF del S&P 500 y mira su gráfico mensual.'),
    ], [
      trend('Así iba el S&P 500 hasta marzo de 2009. ¿Qué tendencia ves?', 'hist-2009-bottom', 'Bajista', 'Caída de más de un 50 % desde 2007: el momento en que más gente abandonó el «comprar y mantener».'),
      upDown('Marzo de 2009: tras la peor crisis en décadas, mucha gente vende para «no perder más». ¿Qué hizo el S&P 500 después?', 'hist-2009-bottom', 'Quien aguantó (o siguió aportando) recuperó. Quien vendió en el pánico convirtió una caída temporal en una pérdida definitiva.', 'el año y medio siguiente'),
      num('Según J.P. Morgan, 10.000 $ invertidos en el S&P 500 de 2005 a 2024 acabaron en 71.750 $; perdiéndose los 10 mejores días, en 32.871 $. ¿Cuánta diferencia hay?', 38879, '$', '71.750 − 32.871 = 38.879 $: más de la mitad del resultado se jugó en 10 días.'),
      match('Empareja cada plazo con la proporción histórica de periodos con ganancia en el S&P 500.', [['1 día', 'Algo más del 50 %'], ['1 año', 'Alrededor del 73 %'], ['10 años', 'Alrededor del 90 %'], ['20 años', 'Casi el 100 %']], 'A más plazo, menos probabilidad de perder en la historia de EE. UU. No es una ley física.'),
      tf('Comprar y mantener garantiza ganar a 20 años en cualquier país.', false, 'Japón tardó 34 años en recuperar su máximo de 1989. Por eso se diversifica entre países.'),
      upDown('Diciembre de 1989: la bolsa japonesa es la mayor del mundo y lleva años subiendo. ¿Qué hizo el Nikkei 225 después?', 'hist-japan-1989', 'El Nikkei tardó 34 años en volver a aquel máximo. Comprar y mantener funciona mejor con un índice mundial que con un solo país.', 'los seis años siguientes'),
      scenario('Marzo de 2020: el S&P 500 cae un 34 % en un mes por el covid. Pablo tiene un fondo indexado para su jubilación, dentro de 35 años. ¿Qué hace?', [['Vende todo y espera a que pase', 'El índice recuperó su máximo en unos 5 meses. Pablo se habría perdido los rebotes más fuertes.'], ['Sigue con su plan y sus aportaciones', 'Bien: sus aportaciones compraron barato y en unos meses el índice volvió a máximos.'], ['Pide un préstamo para comprar más', 'Invertir con deuda en plena crisis puede obligarte a vender en el peor momento.']], 1, 'Comprar y mantener exige aguantar las caídas: ahí se gana o se pierde la estrategia.'),
      timed(single('Rápido: según SPIVA, ¿qué proporción de fondos de acciones europeos quedó por detrás de su índice en 10 años?', ['El 30 %', 'El 60 %', 'El 97 %'], 2, 'Cierre de 2025. Y casi ninguno de los que lo baten repite.'), 12),
      multi('¿Qué necesita la estrategia de comprar y mantener para funcionar? Marca todas.', ['Diversificar mucho (un índice amplio)', 'Costes bajos', 'Aguantar las caídas sin vender', 'Vender cada vez que cae un 10 %'], [0, 1, 2], 'Vender en cada caída es justo lo contrario: te pierde los rebotes.'),
      chat(['Comprar y mantener es de abuelos 👴', 'Yo prefiero algo con emoción.'], '¿Qué le respondes a Lumi?', [['Tienes razón, aburrido es malo', 'Pues según SPIVA, el 97 % de los fondos activos europeos rinde menos que el índice en 10 años…'], ['Aburrido no es malo: es la estrategia con más evidencia a largo plazo', 'Vale, vale. Lo aburrido para el dinero de largo plazo, y la emoción, con una parte pequeña.'], ['Mejor busca la acción que más suba este año', 'Eso es apostar: la mayoría de acciones individuales rinden menos que el índice.']], 1, 'La emoción no paga: lo que paga es estar invertido, diversificado y con costes bajos durante años.'),
    ], { source: '4.1', minutes: 6, retire: [2, 4, 5, 7] }),

    lesson('u25l3', 'Value investing al estilo Buffett', [
      story('El señor Mercado', [{ id: 'mercado', name: 'Señor Mercado' }], [
        note('Graham imaginaba a la bolsa como un socio de humor cambiante: el señor Mercado.'),
        say('lumi', 'Has estudiado la empresa: estimas que cada acción vale unos **19,60 €**.'),
        say('mercado', '¡Hoy estoy eufórico! Te vendo mi parte a 30 € la acción.'),
        note('Una semana después, el negocio sigue igual.'),
        say('mercado', 'Todo se hunde. ¡Te la dejo a 15 €, llévatela!'),
        choose('¿Qué haces?', [
          opt('Vendo lo que tengo: si cae, algo malo pasa', 'bad', say('lumi', 'Eso es dejar que el señor Mercado decida por ti en su día de pánico.')),
          opt('Compro a 15 €: el negocio no ha cambiado', 'good', say('lumi', '¡Eso! Un **23 %** por debajo de tu estimación: tu **margen de seguridad**.')),
          opt('No le hago caso: está loco', 'ok', say('lumi', 'No tienes que hacerle caso cada día. Pero sus días de pánico pueden ser oportunidades.')),
        ]),
        say('lumi', 'Buffett: «El precio es lo que pagas; el valor es lo que obtienes».'),
      ]),
      play({
        title: '¿Ganga o trampa?',
        intro: 'Un inversor en valor solo compra si el precio está claramente por debajo de lo que vale el negocio. ¿Hay valor o es una trampa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Puede haber valor' }, { label: 'Posible trampa de valor' }],
          cards: [
            { icon: 'company', label: 'Beneficios estables y poca deuda; cae un 30 % por un pánico general', bin: 0, why: 'El negocio no ha cambiado y el precio sí: puede haber margen. Primero se comprueba.' },
            { icon: 'down', label: 'PER 4, con las ventas cayendo desde hace 5 años', bin: 1, why: 'El PER bajo refleja que el mercado espera que los beneficios sigan cayendo.' },
            { icon: 'shield', label: 'Clientes fieles y una ventaja difícil de copiar (un foso)', bin: 0, why: 'Un foso protege el negocio de la competencia: es una señal de calidad.' },
            { icon: 'factory', label: 'Un sector que desaparece y una deuda que no para de crecer', bin: 1, why: 'Barato no es lo mismo que infravalorado: el negocio se está encogiendo.' },
            { icon: 'tag', label: 'Estaba a 100 € y ahora a 40 €, sin mirar nada más', bin: 1, why: 'Que antes valiera 100 € no dice nada de lo que vale hoy.' },
          ],
        },
        goal: { text: 'Clasifica las cinco empresas.', when: [when('done', '==', 5)] },
        insight: '**Barato no es lo mismo que infravalorado.** Un PER bajo puede esconder un negocio en declive: una **trampa de valor**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: mira el negocio, no solo el precio.', mood: 'THINKING' },
          { say: '¿Valor o trampa? Clasifica cada empresa', mood: 'HAPPY' },
        ],
      }),
      key('Lo que no es', 'Value no es comprar lo que ha caído mucho ni lo que tiene el PER más bajo. Un PER bajo puede ser un negocio en declive: una **trampa de valor**. Y el estilo puede pasar años por detrás del mercado.', 'Comprar negocios por menos de lo que valen, con margen por si te equivocas.', 'Pruébalo: pon una alerta de precio bajo lo que crees que vale tu empresa favorita.'),
    ], [
      num('Estimas que una acción vale 20 € y cotiza a 15 €. ¿Qué margen de seguridad tienes respecto a tu valor estimado?', 25, '%', '(20 − 15) ÷ 20 = 0,25 → 25 %.'),
      num('Estimas que una empresa vale 40 € por acción y exiges un margen de seguridad del 30 %. ¿Qué precio máximo pagarías?', 28, '€', '40 × (1 − 0,30) = 28 €.'),
      single('¿Quién es el «señor Mercado» de Graham?', ['Un socio de humor cambiante que cada día te ofrece un precio distinto', 'El presidente de la bolsa', 'Un índice de valoración'], 0, 'No tienes que hacerle caso: puedes aprovechar sus días de pánico y no comprarle en sus días de euforia.'),
      scenario('Por un pánico general, una empresa con beneficios estables, poca deuda y clientes fieles cae un 30 % en un mes sin que su negocio haya cambiado. ¿Cómo lo ve un inversor en valor?', [['Vende: si cae, algo malo pasa', 'Eso es dejar que el señor Mercado decida por ti, justo en su día de pánico.'], ['Revisa si el negocio sigue igual y si ahora hay margen de seguridad', 'Bien: si el valor no ha cambiado y el precio sí, puede haber una oportunidad. Primero se comprueba.'], ['Compra con todo su dinero sin mirar nada', 'Sin análisis ni diversificación no es value investing: es apostar.']], 1, 'El inversor en valor separa el precio (que cambia cada día) del valor del negocio (que cambia despacio).'),
      scenario('Bruno encuentra una acción con PER 4. Las ventas caen desde hace 5 años, la deuda no para de subir y el sector está desapareciendo. ¿Qué es?', [['Una ganga segura por su PER bajo', 'El PER bajo refleja que el mercado espera que los beneficios sigan cayendo.'], ['Probablemente una trampa de valor', 'Exacto: barato no es lo mismo que infravalorado. El negocio se está encogiendo.'], ['Una empresa de crecimiento', 'Sus ventas caen: es lo contrario.']], 1, 'Un ratio bajo no basta: hay que mirar si el negocio se mantiene.'),
      match('Empareja cada concepto con su significado.', [['Valor intrínseco', 'Lo que estimas que vale el negocio'], ['Margen de seguridad', 'Colchón entre ese valor y el precio'], ['Señor Mercado', 'El humor cambiante de los precios'], ['Foso (moat)', 'Ventaja que protege al negocio de la competencia']], 'Son las piezas básicas de la inversión en valor de Graham y Buffett.'),
      tf('Un PER bajo significa siempre que la acción está barata.', false, 'Puede ser una empresa en declive o con un beneficio puntual inflado. Compara con el sector y con su crecimiento.'),
      tf('El estilo value bate al mercado todos los años.', false, 'Ha tenido periodos largos, de más de una década, por detrás del mercado. Exige mucha paciencia.'),
      timed(fill('Buffett: «El precio es lo que pagas; el ____ es lo que obtienes».', 'valor', ['dividendo', 'beneficio', 'riesgo'], 'Precio y valor no son lo mismo: el value investing vive de esa diferencia.'), 12),
      multi('¿Qué señales apuntan a una posible trampa de valor? Marca todas.', ['Ventas que caen año tras año', 'Deuda que no para de crecer', 'Un sector que está desapareciendo', 'Beneficios estables y un ROIC alto'], [0, 1, 2], 'Beneficios estables y alta rentabilidad sobre el capital son señales de calidad, no de trampa.'),
      chat(['Value investing es comprar lo que más ha caído, ¿no? 📉', 'Esta acción estaba a 100 € y ahora a 40 €: ¡chollo!'], '¿Qué le contestas a Lumi?', [['Sí, cuanto más cae, mejor', 'Eso es anclaje: que antes valiera 100 € no dice nada de lo que vale hoy.'], ['Lo que importa es cuánto vale el negocio, no a cuánto estuvo', 'Ah, vale: primero estimo el valor, y solo si el precio está bastante por debajo, hay margen.'], ['Value es comprar lo que más sube', 'Eso se parece más al momentum, otra estrategia distinta.']], 1, 'Value compara precio con valor, no precio de hoy con precio de ayer.'),
    ], { source: '5.1', minutes: 6, retire: [0, 1, 2, 6, 7, 8] }),

    lesson('u25l4', 'Invertir por dividendos', [
      story('El euro «gratis»', [{ id: 'ines', name: 'Inés' }], [
        say('ines', '¡Mi acción me ha pagado 1 € de dividendo! Dinero gratis.'),
        note('Ese mismo día, la acción cotiza 1 € más barata: es la fecha ex-dividendo.'),
        choose('¿Inés es ahora más rica?', [
          opt('Sí: tiene 1 € más por acción', 'bad', say('lumi', 'Tiene 1 € en efectivo y 1 € menos en acciones. Se queda igual.')),
          opt('No: ese euro ha salido del valor de la empresa', 'good', say('lumi', '¡Exacto! El dividendo no es dinero gratis: sale de la empresa.')),
          opt('Sí, y además sin impuestos', 'bad', say('lumi', 'Tributa en el IRPF, del 19 % al 30 %. Suelen retener un 19 %.')),
        ]),
        say('ines', 'Entonces, ¿qué miro?'),
        say('lumi', 'La **rentabilidad total**: precio más dividendos. Y que el dividendo sea sostenible.'),
      ]),
      play({
        title: '¿Dividendo sano o alarma?',
        intro: 'Dos ratios ayudan: la **rentabilidad por dividendo** (dividendo ÷ precio) y el ***pay-out*** (dividendo ÷ beneficio). Clasifica cada caso.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Parece sostenible' }, { label: 'Señal de alarma' }],
          cards: [
            { icon: 'percent', label: 'Un dividendo del 3 % cubierto con holgura por el beneficio', bin: 0, why: 'Un dividendo moderado que el beneficio cubre de sobra.' },
            { icon: 'down', label: 'Un dividendo del 12 % con los beneficios en caída', bin: 1, why: 'Muchas veces el precio ha caído porque el mercado espera un recorte.' },
            { icon: 'gauge', label: 'Un pay-out del 95 % durante años', bin: 1, why: 'Reparte casi todo lo que gana: poco margen si los beneficios bajan.' },
            { icon: 'warning', label: 'Un 15 % de dividendo «garantizado», solo hoy', bin: 1, why: 'Ninguna acción garantiza su dividendo: es la señal clásica de fraude.' },
            { icon: 'bank', label: 'Un dividendo cubierto por el beneficio y por el flujo de caja', bin: 0, why: 'Si lo cubren el beneficio y la caja, es más probable que se mantenga.' },
          ],
        },
        goal: { text: 'Clasifica los cinco dividendos.', when: [when('done', '==', 5)] },
        insight: 'Un dividendo altísimo a veces es una **alarma**, no un regalo. Con un *pay-out* por encima del **80–90 %** de forma continuada, el dividendo puede estar en peligro.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: cuanto más alto y más «seguro», más sospechoso.', mood: 'THINKING' },
          { say: '¿Sano o alarma? Clasifica cada dividendo', mood: 'HAPPY' },
        ],
      }),
      key('Acumulación o distribución', 'Los fondos de **distribución** te pagan los dividendos en la cuenta: útiles si necesitas rentas.\n\nPara acumular patrimonio, los de **acumulación** reinvierten sin pagar impuestos hasta la venta.', 'El dividendo no es dinero gratis: sale del valor de la empresa. Lo que importa es la rentabilidad total.', 'Pruébalo: abre en Mercado una empresa de dividendo alto y mira si su precio crece.'),
    ], [
      num('Una acción cotiza a 15 € y paga 0,50 € de dividendo al año. ¿Cuál es su rentabilidad por dividendo? (redondea a un decimal)', 3.3, '%', '0,50 ÷ 15 ≈ 0,033 → 3,3 %.', 2),
      num('Una empresa gana 2 € por acción y paga 1,80 € de dividendo. ¿Cuál es su pay-out?', 90, '%', '1,80 ÷ 2 = 0,9 → 90 %: reparte casi todo lo que gana. Si los beneficios bajan, el dividendo peligra.'),
      num('Cobras 1.000 € brutos de dividendos de empresas españolas y te retienen un 19 %. ¿Cuánto te llega a la cuenta?', 810, '€', '1.000 × (1 − 0,19) = 810 €. Luego, en la declaración, se ajusta a tu tramo.'),
      spot('Marca los mensajes que son estafa o una trampa evidente.', [['Canal «Rentas VIP»', '🔥 Acción que paga un 15 % de dividendo GARANTIZADO. Solo hoy, plazas limitadas.', true], ['Tu bróker', 'La empresa en la que tienes acciones pagará un dividendo de 0,40 € por acción. Fecha ex-dividendo: el día 12.', false], ['Desconocido', 'Fondo exclusivo: 1 % de dividendo cada mes asegurado, sin riesgo. Transfiere hoy a esta cuenta.', true], ['Influencer', 'Vive de dividendos con solo 1.000 € 💸 Únete a mi grupo de pago y te digo cuáles.', true], ['Agencia Tributaria', 'Recuerda: los dividendos se declaran como rendimientos del capital mobiliario en tu IRPF.', false]], 'Promesas de dividendos garantizados, urgencia y «vivir de rentas con 1.000 €» son señales de fraude. Ninguna acción garantiza su dividendo.'),
      tf('Cuando una empresa paga un dividendo, el precio de su acción suele bajar aproximadamente en esa cantidad.', true, 'El dinero sale de la empresa: tu patrimonio total no cambia por cobrarlo.'),
      single('Una acción ofrece un dividendo del 13 %. ¿Qué deberías comprobar primero?', ['Si el beneficio y la caja cubren el dividendo, y por qué ha caído tanto el precio', 'Cuántos seguidores tiene en redes', 'Nada: un 13 % es siempre una ganga'], 0, 'Un rendimiento así suele indicar que el mercado espera un recorte.'),
      buckets('¿Es propio de un fondo de acumulación o de distribución?', ['Acumulación', 'Distribución'], [['Reinvierte los dividendos automáticamente', 0], ['Te paga los dividendos en la cuenta', 1], ['No pagas impuestos hasta vender', 0], ['Útil si necesitas rentas periódicas', 1]], 'En la fase de acumular patrimonio, los de acumulación suelen ser más eficientes fiscalmente.'),
      timed(single('Rápido: un pay-out del 95 % durante años, ¿qué puede indicar?', ['Que el dividendo puede estar en peligro', 'Que la empresa crece muy deprisa', 'Que el dividendo está garantizado'], 0, 'Reparte casi todo lo que gana: poco margen si los beneficios caen.'), 12),
      scenario('Bruno busca rentas. Duda entre una empresa con un dividendo del 12 %, beneficios en caída y deuda creciente, y otra con un 3 % cubierto con holgura por el beneficio. ¿Qué es más prudente como criterio?', [['La del 12 %: cobra cuatro veces más', 'Si recorta el dividendo y la acción cae, Bruno pierde rentas y capital a la vez.'], ['Mirar la sostenibilidad del dividendo, no solo su tamaño', 'Bien: un dividendo cubierto y estable vale más que uno alto en peligro.'], ['Elegir según el que más ha subido este mes', 'Eso no dice nada de si el dividendo es sostenible.']], 1, 'Lo importante es la rentabilidad total y que el dividendo sea sostenible.'),
      fill('El día en que la acción empieza a cotizar sin derecho al dividendo se llama fecha ____.', 'ex-dividendo', ['de pago', 'de valor', 'de emisión'], 'Ese día el precio baja aproximadamente lo que se paga de dividendo.'),
      scenario('Tienes 20 años y quieres hacer crecer tu dinero durante décadas, sin necesitar rentas. Dudas entre la versión de acumulación y la de distribución del mismo fondo indexado. ¿Cuál encaja mejor?', [['La de distribución: así cobro algo cada año', 'Cobrarías dividendos que no necesitas y que tributan cada año: te retienen un 19 % antes de reinvertir.'], ['La de acumulación: reinvierte sola y no pagas impuestos hasta vender', 'Bien: todo el dividendo sigue trabajando dentro del fondo, y Hacienda espera a que vendas.'], ['Da igual: son el mismo fondo', 'Invierten en lo mismo, pero no tributan igual: para acumular, la diferencia suma con los años.']], 1, 'Si no necesitas rentas, la acumulación es más eficiente: el dividendo se reinvierte entero. La distribución tienta porque «cobras», pero cada pago tributa antes de volver a invertirlo.'),
      chat(['Voy a comprar la acción con el dividendo más alto del Mercado.', 'Un 12 % al año: rentas aseguradas.'], '¿Qué le contestas a Lumi?', [['Perfecto: cuanto más alto, mejor', 'Un 12 % suele significar que el precio ha caído porque el mercado espera un recorte.'], ['Antes, mira si el beneficio lo cubre y por qué ha caído el precio', 'Vale: si los beneficios caen, ese 12 % es una alarma, no un regalo.'], ['Compra también la del segundo dividendo más alto', 'Dos dividendos en peligro no hacen uno seguro.']], 1, 'Un dividendo altísimo a veces es la señal de que va a recortarse: lo que importa es que el beneficio lo cubra. La tentación es mirar solo el tamaño del dividendo.'),
    ], { source: '4.7', minutes: 6, retire: [0, 1, 2, 4, 5, 7] }),

    lesson('u25l5', 'Seguir la tendencia y el momentum', [
      story('Las 20 operaciones de Hugo', [{ id: 'hugo', name: 'Hugo' }], [
        say('hugo', 'Sigo tendencias. De mis últimas 20 operaciones, solo acerté 7.'),
        say('hugo', 'Eso sí: cuando acierto gano 3 veces lo que arriesgo. Cuando fallo, pierdo 1.'),
        choose('¿Hugo gana o pierde dinero?', [
          opt('Pierde: falla casi dos de cada tres', 'bad', say('lumi', '7 aciertos de 3R son 21R; 13 fallos de 1R, 13R. Gana **8R**.')),
          opt('Gana: sus aciertos son mucho más grandes que sus fallos', 'good', say('lumi', '¡Exacto! 21R ganados menos 13R perdidos: **+0,4R** por operación, antes de costes.')),
          opt('Imposible saberlo', 'ok', say('lumi', 'Se puede: 7 × 3R − 13 × 1R = **+8R** en 20 operaciones.')),
        ]),
        say('lumi', 'Así es seguir tendencias: **muchas pérdidas pequeñas y pocas ganancias grandes**.'),
        say('hugo', 'Por eso nunca quito el stop.'),
      ]),
      play({
        title: '¿Dónde le va bien?',
        intro: 'Seguir la tendencia es comprar lo que lleva tiempo subiendo y salir cuando se rompe. ¿En qué mercado funciona y en cuál sufre?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Le va bien' }, { label: 'Sufre' }],
          cards: [
            { icon: 'up', label: 'Una subida que dura varios meses', bin: 0, why: 'Las tendencias de 3 a 12 meses han tendido a persistir: es su terreno.' },
            { icon: 'repeat', label: 'Un mercado lateral, sin dirección', bin: 1, why: 'Da señales falsas una y otra vez: entra y sale con pequeñas pérdidas.' },
            { icon: 'flame', label: 'Un giro brusco de la noche a la mañana', bin: 1, why: 'Los giros bruscos le pillan dentro. Por eso el stop.' },
            { icon: 'globe', label: 'Tendencias largas en bonos, divisas y materias primas', bin: 0, why: 'Los estudios encuentran el momentum en muchos mercados, con datos desde 1880.' },
          ],
        },
        goal: { text: 'Clasifica los cuatro mercados.', when: [when('done', '==', 4)] },
        insight: 'Las tendencias de **3 a 12 meses** han tendido a persistir (Jegadeesh y Titman; Moskowitz, Ooi y Pedersen). En un **lateral**, en cambio, sufre: su ventaja depende de cortar rápido las pérdidas.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: sin dirección clara, no hay tendencia que seguir.', mood: 'THINKING' },
          { say: '¿Le va bien o sufre? Clasifica cada mercado', mood: 'HAPPY' },
        ],
      }),
      key('Una regla típica', 'Comprar cuando el precio supera su media de muchas sesiones, con stop bajo el último mínimo creciente, y subir el stop a medida que avanza.', 'El momentum es una de las anomalías más estudiadas, pero solo funciona con disciplina y gestión del riesgo.', 'Pruébalo: busca en Mercado un activo en tendencia alcista y añádelo a Favoritos.'),
    ], [
      trend('¿Qué tendencia ves en este gráfico real?', 'trend-up-1', 'Alcista', 'Máximos y mínimos cada vez más altos: es el terreno del seguidor de tendencias.'),
      trend('¿Y en este otro?', 'trend-down-6', 'Bajista', 'Máximos y mínimos cada vez más bajos: un seguidor de tendencias en compras se quedaría fuera.'),
      trend('Último gráfico. ¿Qué tendencia hay?', 'trend-flat-5', 'Lateral', 'Sin dirección clara: aquí las estrategias de tendencia sufren señales falsas.'),
      upDown('Este activo venía subiendo. Como seguidor de tendencias, ¿qué crees que hizo en las sesiones siguientes?', 'ud-11', 'Que una tendencia persista más veces de las que se gira no significa que lo haga siempre: por eso el stop.'),
      upDown('Otro gráfico real de un índice. ¿Sube o baja después?', 'ud-84', 'La ventaja del momentum es estadística, sobre muchas operaciones. En un caso suelto, cualquier cosa puede pasar.'),
      single('¿En qué plazo han tendido a persistir las tendencias según los estudios de momentum?', ['De 3 a 12 meses', 'De 1 a 5 minutos', 'De 20 a 30 años'], 0, 'Es el horizonte de la mayoría de estudios, en muchos mercados y desde hace más de un siglo.'),
      tf('Las estrategias de tendencia suelen acertar la mayoría de sus operaciones.', false, 'Suelen acertar menos de la mitad: ganan porque sus aciertos son mucho más grandes que sus fallos.'),
      num('Un sistema de tendencia acierta el 35 %, gana 3R de media y pierde 1R. ¿Cuál es su esperanza?', 0.4, 'R', '0,35 × 3 − 0,65 × 1 = 1,05 − 0,65 = +0,4R, antes de costes.'),
      timed(single('Rápido: ¿dónde sufre más un seguidor de tendencias?', ['En un mercado lateral', 'En una tendencia larga', 'En un mercado que sube despacio'], 0, 'Sin dirección clara, entra y sale una y otra vez con pequeñas pérdidas.'), 12),
      order('Ordena los pasos de una regla sencilla de seguimiento de tendencia.', ['Comprobar que hay tendencia alcista (máximos y mínimos crecientes)', 'Entrar cuando se cumple la señal de tu regla', 'Poner el stop bajo el último mínimo creciente', 'Calcular el tamaño con el 1 % de riesgo', 'Subir el stop a medida que avanza la tendencia'], 'Sin el stop y el tamaño, ninguna regla de tendencia sobrevive a sus giros.'),
    ], { source: '9.10', minutes: 6, retire: [6, 7, 8] }),

    lesson('u25l6', 'Swing trading', [
      story('La noche antes de resultados', [{ id: 'nora', name: 'Nora' }], [
        say('nora', 'Tengo una compra para unas semanas, con su stop. Mañana la empresa presenta resultados.'),
        say('nora', 'Total, si sale mal, salta el stop y ya.'),
        choose('¿Qué haces tú en su lugar?', [
          opt('La dejo igual: el stop me protege', 'bad', say('lumi', 'Si mañana abre muy por debajo, el stop se ejecuta allí, lejos de lo previsto.')),
          opt('Reduzco el tamaño o cierro antes de resultados', 'good', say('lumi', '¡Bien! Mejor no tener posiciones grandes antes de resultados.')),
          opt('Compro más: seguro que salen buenos', 'bad', say('lumi', 'Nadie sabe cómo saldrán. Doblar justo antes es apostar.')),
        ]),
        note('A la mañana siguiente, el precio abre lejos del cierre de ayer.'),
        say('lumi', 'Eso es un **hueco**. En swing, la noche y el fin de semana también cuentan.'),
      ]),
      play({
        title: 'Cuánto comprar en un swing',
        intro: 'Cuenta de **10.000 €**. El stop va bajo el mínimo reciente, un **5 %** por debajo de tu entrada.',
        widget: { kind: 'position', account: 10000, riskPct: 3, stopPct: 8, entry: 30, maxRisk: 5, maxStop: 15 },
        predict: {
          prompt: 'Con un 1 % de riesgo y el stop a un 5 %, ¿qué parte de la cuenta compras?',
          options: ['Toda la cuenta', 'Una quinta parte', 'Solo un 1 %'],
          answer: 1,
          why: 'Arriesgas 100 €. Si el stop está un 5 % abajo, compras **2.000 €**: un 20 % de la cuenta.',
        },
        goal: { text: 'Pon el riesgo en el 1 % y el stop a un 5 %.', when: [when('riskPct', '==', 1), when('stopPct', '==', 5)] },
        insight: 'El tamaño sale del stop: **riesgo ÷ distancia al stop**. Stop, objetivo y tamaño se deciden antes de entrar.',
        lumi: [
          { when: when('riskPct', '>', 1), say: 'Arriesgas más del 1 %: una racha mala dolería mucho.', mood: 'WORRIED' },
          { when: when('stopPct', '>', 5), say: 'Con el stop más lejos compras menos. Lo que arriesgas no cambia.', mood: 'THINKING' },
          { say: 'Ajusta el riesgo y la distancia al stop', mood: 'HAPPY' },
        ],
      }),
      key('Lo que te llevas', 'Swing: operaciones de **días a semanas**, en gráfico diario. Se busca un tramo: comprar en un retroceso o un soporte dentro de una tendencia y salir cerca de la resistencia.\n\nCada operación paga comisión y *spread*, y cuanto más corto el plazo, más señales falsas.', 'Swing: tramos de días o semanas, con stop por estructura y relación beneficio/riesgo de 2:1 o más.', 'Pruébalo: en tu próxima compra del simulador, pon stop y objetivo antes de entrar.'),
    ], [
      simTrade('Operación de swing: tienes 10.000 € y arriesgas como máximo un 1 %. Elige stop e importe.', 'lvl-14', 'Stop bajo el mínimo reciente y tamaño calculado con ese stop. Lo demás lo decide el mercado.'),
      simTrade('Otra operación, ahora con una cuenta de 5.000 €. Mismo límite: 1 % como máximo.', 'lvl-21', 'Si el precio va en contra, el stop limita la pérdida a lo previsto. Por eso se decide antes de entrar.', { cash: 5000 }),
      level('Swing en un índice. Coloca el stop de esta compra.', 'lvl-5', 'STOP', 'Por debajo del mínimo reciente: si se pierde, el retroceso se ha convertido en otra cosa.'),
      level('Ahora coloca el objetivo de esta compra.', 'lvl-10', 'TAKE', 'Cerca del máximo anterior, donde suele aparecer venta. Compáralo con la distancia al stop.'),
      trend('Un swing trader busca rangos y tendencias. ¿Qué ves aquí?', 'trend-flat-6', 'Lateral', 'En un lateral, el swing trader compra cerca del suelo del rango y vende cerca del techo, con stop bajo el suelo.'),
      point('En un rango, el objetivo de una compra suele ir cerca del techo. Toca el punto más alto.', 'trend-flat-1', 'max', 'El techo del rango es donde otras veces apareció la venta.'),
      match('Empareja cada estilo con su plazo típico.', [['Day trading', 'Minutos u horas; cierra el mismo día'], ['Swing trading', 'De días a semanas'], ['Seguimiento de tendencia', 'De meses'], ['Comprar y mantener', 'Años o décadas']], 'Cuanto más corto el plazo, más ruido y más costes por cada euro ganado.'),
      single('¿Qué riesgo tiene el swing trading que no tiene el day trading?', ['Los huecos de precio entre una sesión y la siguiente', 'Que no hay comisiones', 'Que no se usan stops'], 0, 'Al dejar posiciones abiertas por la noche, el precio puede abrir lejos de tu stop.'),
      timed(tf('El swing trading se hace normalmente en gráficos de 1 minuto.', false, 'Se suele usar el gráfico diario: operaciones de días a semanas.'), 10),
      num('Swing: entras a 30 €, stop en 28,50 € y objetivo en 34,50 €. Si llega al objetivo, ¿cuántos R ganas?', 3, 'R', 'Riesgo: 1,50 €. Beneficio: 4,50 €. 4,50 ÷ 1,50 = 3R.'),
    ], { source: '7.3', minutes: 6, retire: [1, 7, 8, 9] }),

    lesson('u25l7', 'Day trading: lo que dicen los datos', [
      mission({
        title: 'Un año de day trading',
        intro: '1.000 personas hacen *day trading* sin ventaja: cada operación es cara o cruz. Cada una cuesta **5 €** entre comisión y *spread*.',
        widget: { kind: 'coinflip', traders: 1000, trades: 4, maxTrades: 1000, fee: 5, stake: 100, win: 1 },
        predict: {
          prompt: 'A 4 operaciones al día, un año son unas 1.000. ¿Cuántos acaban perdiendo?',
          options: ['Más o menos la mitad', 'Casi todos', 'Casi nadie'],
          answer: 1,
          why: 'Solo en costes: 4 × 5 € × 250 días = **5.000 €** al año. En la simulación pierde el **96 %**.',
        },
        goal: { text: 'Llega a un año entero: 1.000 operaciones.', when: [when('trades', '>=', 1000)] },
        insight: 'Los datos reales se parecen: en Brasil, de quienes hicieron *day trading* más de 300 días, **el 97 % perdió** y solo un 1,1 % ganó más que el salario mínimo. En Taiwán, **menos del 1 %** gana de forma persistente tras comisiones.',
        lumi: [
          { when: when('losersPct', '>=', 90), say: 'Casi todos en rojo. Nadie es peor que nadie: son los costes.', mood: 'WORRIED' },
          { when: when('avg', '<=', -1000), say: 'La media ya pierde más de 1.000 €. Y sigue.', mood: 'THINKING' },
          { say: 'Sube las operaciones de cada uno', mood: 'HAPPY' },
        ],
      }),
      story('Capturas de 3.000 €', [{ id: 'guru', name: '@TraderDeLujo' }], [
        say('guru', 'Hoy he ganado **3.000 €** en un día. Aquí tienes la captura.'),
        say('guru', 'Mi curso para vivir del trading: solo 500 €. ¡Últimas plazas!'),
        choose('¿Qué haces?', [
          opt('Compro el curso: la captura lo demuestra', 'bad', say('lumi', 'Una captura no es un historial: no ves las pérdidas ni cuánto gana con cursos.')),
          opt('Le pido su historial completo y verificado', 'good', say('lumi', '¡Bien! Lo normal es que no lo tenga. Y casi todos pierden.')),
          opt('Le pregunto qué compra mañana', 'ok', say('lumi', 'Aunque acierte una vez, no sabes cómo le va en total.')),
        ]),
        say('lumi', 'En redes solo ves capturas de ganancias, nunca el historial completo.'),
      ]),
      key('Por qué pierden', '• **Costes:** comisión y *spread* en cada operación. Con muchas al día, se comen cualquier ventaja pequeña.\n• **Competencia:** profesionales y algoritmos con mejores datos y costes casi nulos.\n• **Ruido:** en gráficos de minutos, la mayoría de movimientos no significan nada.', 'La gran mayoría de quienes hacen day trading de forma continuada pierde dinero.', 'Pruébalo: abre el historial de tu Cartera y cuenta cuántas operaciones hiciste este mes.'),
    ], [
      tf('Según el estudio de Brasil, la mayoría de quienes hicieron day trading más de 300 días ganó dinero.', false, 'El 97 % perdió dinero (Chague, De-Losso y Giovannetti, 2020).'),
      single('En ese estudio de Brasil, ¿qué porcentaje ganó más que el salario mínimo?', ['Alrededor del 1 %', 'Alrededor del 25 %', 'Alrededor del 50 %'], 0, 'Un 1,1 %: incluso entre los pocos que ganaban, casi ninguno ganaba lo bastante para vivir de ello.'),
      tf('En Taiwán, menos del 1 % de los day traders consigue ganar de forma predecible después de comisiones.', true, 'Barber, Lee, Liu y Odean, con datos de la bolsa de Taiwán de 1992 a 2006.'),
      fill('De quienes hicieron day trading más de 300 días en Brasil, el ____ perdió dinero.', '97 %', ['50 %', '70 %', '30 %'], 'Chague, De-Losso y Giovannetti (2020).'),
      num('Haces 4 operaciones al día y cada una te cuesta 5 € entre comisión y spread. En 250 días de mercado, ¿cuánto pagas en costes?', 5000, '€', '4 × 5 × 250 = 5.000 €: antes de ganar nada, ya tienes que recuperar eso.'),
      multi('¿Por qué pierde la mayoría de day traders? Marca todas.', ['Los costes de operar tanto', 'La competencia de profesionales y algoritmos', 'El ruido de los gráficos de minutos', 'Que está prohibido en España'], [0, 1, 2], 'No está prohibido: simplemente, las cuentas juegan en contra.'),
      scenario('Un influencer enseña capturas de 3.000 € ganados en un día y vende un curso de 500 € para «vivir del trading». ¿Qué haces?', [['Compro el curso, las capturas lo demuestran', 'Una captura no es un historial: no ves las pérdidas ni cuánto gana con los cursos.'], ['Pido su historial completo y verificado, y recuerdo los estudios', 'Bien: lo normal es que no lo tenga. Y los datos dicen que el 97 % de los persistentes pierde.'], ['Le copio las operaciones con dinero prestado', 'Pierdes el dinero y además debes el préstamo.']], 1, 'Las capturas de ganancias no prueban nada: cuenta el historial completo, con costes.'),
      buckets('¿Dato real o mito?', ['Dato real', 'Mito'], [['El 97 % de quienes hicieron day trading más de 300 días en Brasil perdió', 0], ['Con 500 € y un buen curso se puede vivir del trading', 1], ['En Taiwán, menos del 1 % gana de forma persistente tras comisiones', 0], ['Las capturas en redes muestran el historial completo', 1], ['Cuantas más operaciones, más pesan los costes', 0]], 'Los datos vienen de estudios con millones de operaciones; los mitos, de capturas sueltas.'),
      timed(single('Rápido: ¿qué convierte una ventaja pequeña en pérdida cuando operas mucho?', ['Los costes', 'Los dividendos', 'La inflación'], 0, 'Comisión y spread en cada operación: cuantas más, más pesan.'), 12),
      chat(['Estoy pensando en dejar el trabajo para hacer day trading 🚀', 'He ganado 3 días seguidos con el simulador.'], '¿Qué le dices a Lumi?', [['¡Adelante, tienes talento!', 'Tres días son una muestra ridícula… y los datos dicen que casi todos los que lo intentan en serio pierden.'], ['Tres días no prueban nada; los estudios dicen que casi todos pierden', 'Vale, mejor sigo aprendiendo, registro 100 operaciones en el simulador y mantengo el trabajo.'], ['Pide un préstamo para tener más capital', 'Eso convierte una mala idea en una peor: pérdidas y deudas.']], 1, 'Antes de arriesgar tu sustento, mira la evidencia y tus propias estadísticas con muchas operaciones.'),
    ], { source: '1.7', minutes: 6, retire: [0, 2, 4, 6, 8] }),

    lesson('u25l8', 'Apalancamiento y cortos', [
      play({
        title: 'El efecto lupa',
        intro: 'Pones **1.000 €** de garantía y el bróker te deja mover mucho más. Mueve el apalancamiento y el precio.',
        widget: { kind: 'leverage', margin: 1000, lev: 10, move: 0, maxLev: 30, maxMove: 10 },
        predict: {
          prompt: 'Con 1:10, el precio baja un 10 %. ¿Qué pasa con tus 1.000 €?',
          options: ['Pierdes 100 €', 'Pierdes la mitad', 'Lo pierdes todo'],
          answer: 2,
          why: 'Mueves 10.000 €: un 10 % son 1.000 €, toda tu garantía. Si sube un 5 %, ganas un 50 %; si baja un 5 %, pierdes un 50 %.',
        },
        goal: { text: 'Con 1:30, busca el movimiento en contra más pequeño que se lleva toda la garantía.', when: [when('lev', '==', 30), when('wiped', '==', 1), when('move', '>=', -3.5)] },
        insight: 'Con 1:30 basta un **3,3 %** en contra para perderlo todo: un movimiento normal de un par de días. **El apalancamiento multiplica ganancias y pérdidas por igual.**',
        lumi: [
          { when: when('wiped', '==', 1), say: 'Garantía a cero. Y el precio apenas se ha movido.', mood: 'WORRIED' },
          { when: when('pnlPct', '>=', 50), say: '¡Un +50 %! Ahora mueve el precio al revés.', mood: 'HAPPY' },
          { say: 'Sube el apalancamiento y mueve el precio', mood: 'HAPPY' },
        ],
      }),
      story('Leo se pone corto', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Esta acción está carísima. Me pongo corto: vendo sin tenerla y la recompro más barata.'),
        say('lumi', '¿Y si, en vez de bajar, sube?'),
        choose('¿Cuánto puede perder Leo como máximo?', [
          opt('Lo que puso, como al comprar', 'bad', say('lumi', 'Eso pasa al comprar. En corto, cada euro que sube el precio es pérdida.')),
          opt('En teoría, sin límite: el precio no tiene techo', 'good', say('lumi', '¡Exacto! La pérdida en corto es **ilimitada**.')),
          opt('Nada, porque lleva stop', 'ok', say('lumi', 'El stop ayuda, pero un hueco puede saltárselo.')),
        ]),
        note('Enero de 2021: GameStop se dispara y los que estaban cortos tienen que recomprar a la vez.'),
        say('leo', 'Vale. Mientras aprendo, nada de cortos.'),
      ]),
      key('Lo que dice la CNMV', 'Un **CFD** replica un activo con apalancamiento. Aviso obligatorio: «Entre un **74 y un 89 %** de los inversores minoristas pierden dinero cuando negocian con CFD».\n\nEn la UE (ESMA, 2018): como máximo **1:30** en divisas principales, 1:20 en índices, 1:5 en acciones y **1:2 en cripto**. Cierre si el margen baja del 50 % y no puedes perder más de lo depositado. Mantenerlo abierto paga **financiación** diaria.', 'El apalancamiento multiplica ganancias y pérdidas por igual, pero las pérdidas grandes te sacan del juego.', 'Pruébalo: mira en Mercado cuánto se mueve en un día tu activo favorito.'),
    ], [
      num('Con apalancamiento 1:10 pones 1.000 € de margen. El activo sube un 5 %. ¿Cuánto ganas?', 500, '€', 'Controlas 10.000 €: 10.000 × 5 % = 500 €, un 50 % de tu dinero. Si hubiera bajado un 5 %, perderías lo mismo.'),
      num('Con apalancamiento 1:30, ¿qué movimiento en contra se lleva todo el margen de la posición? (redondea a un decimal)', 3.3, '%', '100 % ÷ 30 ≈ 3,3 %: un movimiento normal de un par de días.', 2),
      num('Con apalancamiento 1:5, ¿qué caída del activo se lleva todo tu margen?', 20, '%', '100 % ÷ 5 = 20 %.'),
      tf('Según la advertencia oficial, entre un 74 y un 89 % de los inversores minoristas pierden dinero con CFD.', true, 'Es el rango que los brókeres en la UE deben mostrar; cada uno publica además su propio porcentaje.'),
      tf('En la UE, un cliente minorista puede perder más de lo que ha depositado al operar con CFD.', false, 'Desde 2018 hay protección frente a saldo negativo: no puedes perder más de lo depositado.'),
      scenario('Laura quiere abrir un CFD sobre un índice con 1.000 € y el apalancamiento máximo «para que cunda». No ha usado nunca un stop. ¿Qué le dirías como concepto?', [['Adelante, así gana más rápido', 'Con 1:20, una caída del 5 % del índice se lleva todo su margen. Puede pasar en una semana.'], ['Primero aprender sin apalancamiento; si algún día lo usa, poco, con stop y calculando sobre la exposición total', 'Bien: el apalancamiento solo amplifica lo que ya haces. Sin método, amplifica los errores.'], ['Mejor ponerse corto, que es más seguro', 'Al revés: en corto la pérdida potencial es ilimitada.']], 1, 'Primero el método y la gestión del riesgo; el apalancamiento, si acaso, mucho después.'),
      single('¿Por qué la pérdida de una posición corta es potencialmente ilimitada?', ['Porque el precio puede subir sin límite', 'Porque los cortos no pagan comisión', 'Porque el bróker no permite stops'], 0, 'Si compras, lo máximo que pierdes es lo invertido; en corto, cada euro que sube el precio es pérdida.'),
      match('Empareja cada producto con el apalancamiento máximo para minoristas en CFD en la UE.', [['Divisas principales', '1:30'], ['Índices principales', '1:20'], ['Acciones individuales', '1:5'], ['Criptomonedas', '1:2']], 'Cuanto más volátil el activo, menor el apalancamiento permitido (ESMA, 2018).'),
      timed(tf('El apalancamiento multiplica las ganancias pero no las pérdidas.', false, 'Multiplica las dos por igual.'), 10),
      fill('Cuando una subida violenta obliga a los que están cortos a recomprar a la vez, se produce un ____.', 'short squeeze', ['margin call', 'dividendo', 'split'], 'Como en GameStop en 2021: los cortos recomprando empujan aún más el precio.'),
    ], { source: '10.7', minutes: 6, retire: [0, 1, 2, 3, 8] }),

    lesson('u25l9', 'Elegir tu estrategia', [
      mission({
        title: '¿Qué caída aguantarías?',
        intro: 'Datos reales de 2008 a 2025, con dividendos y cupones. Pones **10.000 €** y eliges la mezcla.',
        widget: { kind: 'mix', series: 'mix-classic', weights: [100, 0, 0], amount: 10000 },
        predict: {
          prompt: 'Con todo en acciones de EE. UU., ¿cuánto llegó a caer la cartera en su peor momento?',
          options: ['Un 10 %', 'Casi la mitad', 'Nunca cayó'],
          answer: 1,
          why: 'Cayó un **46 %** en la crisis de 2008. Al final ganó un 593 %… para quien no vendió.',
        },
        goal: { text: 'Busca una mezcla cuya peor caída no pase del 30 %.', when: [when('maxDD', '>=', -30)] },
        insight: 'Con un **60 %** en acciones, la peor caída se quedó en un 27 % y aun así ganó más de un 380 %. **La mejor estrategia es la que vas a poder mantener** cuando vaya mal.',
        lumi: [
          { when: when('maxDD', '<=', -40), say: 'Casi la mitad de tu dinero, en rojo. ¿Lo aguantarías sin vender?', mood: 'WORRIED' },
          { when: when('maxDD', '>=', -30), say: 'Una caída más llevadera. Mira cuánto ganó igualmente.', mood: 'HAPPY' },
          { say: 'Mueve los porcentajes y mira la peor caída', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Qué le encaja a cada uno?',
        intro: 'La estrategia tiene que caber en tu **tiempo**, tu **horizonte**, tu **temperamento** y tus **conocimientos**.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Indexado automático' }, { label: 'Estudiar empresas' }, { label: 'Swing con plan' }],
          cards: [
            { icon: 'person', label: 'Marta: 30 minutos al mes y odia mirar la bolsa', bin: 0, why: 'Aportaciones automáticas a un indexado: funciona sin ella.' },
            { icon: 'book', label: 'Pablo: le encanta leer cuentas de empresas', bin: 1, why: 'Value investing: estudiar negocios es justo lo que disfruta.' },
            { icon: 'chart', label: 'Ana: revisa gráficos a diario y sigue reglas', bin: 2, why: 'Swing trading con plan y diario: tiene el tiempo y la disciplina.' },
            { icon: 'calendar', label: 'Bruno: horizonte de 40 años y quiere algo simple', bin: 0, why: 'Comprar y mantener un índice mundial, aportando cada mes.' },
            { icon: 'briefcase', label: 'Laura: trabaja 10 horas y solo mira el móvil en los descansos', bin: 0, why: 'Necesita algo que no dependa de mirar el mercado.' },
          ],
        },
        goal: { text: 'Encuentra la estrategia de cada persona.', when: [when('done', '==', 5)] },
        insight: 'No hay una estrategia mejor para todos: hay **la que tú puedes mantener**. Son ejemplos educativos, no recomendaciones.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: si no tiene tiempo, mejor algo que funcione sin mirar.', mood: 'THINKING' },
          { say: 'Lee cada caso y elige su estrategia', mood: 'HAPPY' },
        ],
      }),
      key('Núcleo y satélite', 'Mucha gente separa una **cartera principal** de largo plazo (diversificada, barata, automática) de una **parte pequeña** para especular o aprender, con un límite escrito que podría perder entera.', 'Primero el núcleo aburrido; la emoción, si acaso, con una parte pequeña y limitada.', 'Pruébalo: en el simulador, compra un ETF mundial como núcleo y deja el satélite pequeño.'),
    ], [
      match('Empareja cada personaje con la estrategia que más encaja con lo que cuenta de sí mismo.', [['Marta: 30 minutos al mes y odia mirar la bolsa', 'Aportaciones automáticas a un indexado'], ['Pablo: le encanta leer cuentas de empresas', 'Value investing con estudio de negocios'], ['Ana: revisa gráficos a diario y sigue reglas', 'Swing trading con plan y diario'], ['Bruno: horizonte de 40 años y quiere algo simple', 'Comprar y mantener un índice mundial']], 'Son ejemplos educativos de encaje entre tiempo, gustos y estrategia, no recomendaciones.'),
      scenario('Bruno trabaja 10 horas al día y solo puede mirar el móvil en los descansos. Quiere empezar con day trading. ¿Qué le encaja mejor como concepto?', [['Day trading en los descansos', 'Sin poder mirar la pantalla, cada operación queda a merced del ruido. Y la mayoría pierde incluso dedicándose a tiempo completo.'], ['Una estrategia que no dependa de mirar el mercado, como aportar cada mes a un indexado', 'Bien: encaja con su tiempo y no le obliga a decidir con prisa entre reunión y reunión.'], ['Day trading con apalancamiento para compensar el poco tiempo', 'Peor todavía: más riesgo con menos atención.']], 1, 'La estrategia tiene que caber en tu vida real.'),
      scenario('Ana se pone muy nerviosa con los números rojos y en 2022 vendió todo tras una caída del 15 %. Ahora quiere volver a invertir. ¿Qué tiene más sentido?', [['Una cartera 100 % acciones de crecimiento', 'Con su reacción a las caídas, es probable que vuelva a vender en el peor momento.'], ['Una mezcla con más bonos y liquidez y aportaciones automáticas, con su plan escrito', 'Bien: una cartera que pueda aguantar le dará mejor resultado que una «óptima» que abandone.'], ['No invertir nunca', 'La inflación seguirá restando poder de compra a su dinero parado.']], 1, 'El temperamento importa tanto como la rentabilidad esperada.'),
      chat(['Vale, pero dime ya cuál es la mejor estrategia 😅', 'La que más gane.'], '¿Qué le contestas?', [['La que más subió el año pasado', 'Eso es recencia: lo que mejor fue un año rara vez lo repite al siguiente.'], ['La que encaje con mi tiempo, mi horizonte y lo que aguanto sin vender', '¡Eso! Una estrategia buena que abandonas en la primera caída rinde menos que una sencilla que mantienes.'], ['El day trading, que es la más rápida', 'Rápida sí… y los datos dicen que casi todos pierden.']], 1, 'No hay una estrategia mejor para todos: hay la que tú puedes mantener.'),
      single('¿Qué hace la estructura de «núcleo y satélite»?', ['Separa una cartera principal de largo plazo de una parte pequeña para especular', 'Invierte todo en una sola acción', 'Usa apalancamiento en el núcleo'], 0, 'El satélite tiene un límite escrito: lo que podrías perder entero sin que cambie tu vida.'),
      buckets('¿Cuánto tiempo exige cada estrategia?', ['Mucho tiempo a diario', 'Poco tiempo'], [['Day trading', 0], ['Aportaciones automáticas a un indexado', 1], ['Analizar a fondo las cuentas de empresas', 0], ['Rebalancear una vez al año', 1]], 'Si no tienes tiempo, elige algo que funcione sin ti.'),
      tf('La mejor estrategia para ti es la que más rentabilidad dio el año pasado.', false, 'El rendimiento de un año no predice el siguiente; importa que encaje contigo y tenga evidencia detrás.'),
      timed(single('Rápido: ¿qué estrategia tiene más evidencia a largo plazo para la mayoría de la gente?', ['Comprar y mantener una cartera diversificada y barata', 'Day trading', 'Seguir consejos de redes'], 0, 'Lo dicen SPIVA, Bogle, Sharpe y un siglo de datos.'), 12),
      order('Ordena los pasos para elegir tu estrategia.', ['Definir objetivo y horizonte', 'Ver cuánto tiempo puedes dedicar', 'Decidir qué caída aguantarías sin vender', 'Escribir tus reglas', 'Probarla en el simulador'], 'Primero conocerte; después escribir el plan; al final, probarlo sin dinero real.'),
      multi('¿Qué preguntas te haces antes de elegir estrategia? Marca todas.', ['¿Cuándo necesitaré este dinero?', '¿Cuánto tiempo puedo dedicarle?', '¿Qué caída aguantaría sin vender?', '¿Cuál es la que más ha subido este mes?'], [0, 1, 2], 'Lo que más ha subido este mes no te dice qué estrategia vas a poder mantener.'),
    ], { minutes: 6, retire: [0, 4, 6, 7] }),
  ],
})
