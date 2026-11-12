import 'server-only'
// Sección 2 · Unidad 7 · Índices y referencias (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, mission, note, num, opt, play, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u7', order: 7, title: 'Índices y referencias', description: 'Qué mide cada índice, cómo se pondera y cómo usarlo para medir tu rentabilidad',
  lessons: [

    lesson('u7l2', 'S&P 500, Nasdaq, IBEX 35 y MSCI World', [
      story('Repartido por el planeta', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Tengo un fondo del MSCI World: estoy repartido por todo el planeta.'),
        choose('¿Qué le dices a Leo?', [
          opt('Sí: todos los países por igual', 'bad', say('lumi', 'No: más de dos tercios es EE. UU. y no hay emergentes.')),
          opt('Muy diversificado, pero sobre todo en EE. UU.', 'good', say('lumi', 'Eso. Más de mil empresas, pero no repartidas por igual.')),
          opt('Depende sobre todo de Europa', 'ok', say('lumi', 'Europa pesa mucho menos: lo que más le mueve es EE. UU.')),
        ]),
        say('leo', '¿Y cómo sé qué hay dentro de cada índice?'),
        say('lumi', 'Mira su composición por países y sectores. El nombre no basta.'),
      ]),
      play({
        title: '¿Está en el MSCI World?',
        intro: 'El **MSCI World** reúne grandes y medianas empresas de **23 países desarrollados**. ¿Cuáles de estas tiene dentro?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Está dentro' }, { label: 'Fuera: país emergente' }],
          cards: [
            { icon: 'phone', label: 'Apple (EE. UU.)', bin: 0, why: 'EE. UU. es desarrollado y pesa más de dos tercios del índice.' },
            { icon: 'coffee', label: 'Nestlé (Suiza)', bin: 0, why: 'Suiza es un país desarrollado: está dentro.' },
            { icon: 'car', label: 'Toyota (Japón)', bin: 0, why: 'Japón es desarrollado: está dentro.' },
            { icon: 'globe', label: 'Una gran empresa china', bin: 1, why: 'China es emergente: está en el **MSCI ACWI**, no en el World.' },
            { icon: 'chip', label: 'Una gran tecnológica india', bin: 1, why: 'India es emergente: fuera del MSCI World.' },
            { icon: 'clothes', label: 'Inditex (España)', bin: 0, why: 'España es un país desarrollado: Inditex está dentro.' },
          ],
        },
        goal: { text: 'Clasifica las seis empresas.', when: [when('done', '==', 6)] },
        insight: '«Mundial» no significa repartido: **más de dos tercios es EE. UU.** y no hay emergentes como China o India. Para sumarlos existe el **MSCI ACWI**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: China, India o Brasil son países emergentes.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Más de mil empresas, pero no de todos los países.', mood: 'HAPPY' },
          { say: 'Toca cada empresa: ¿dentro o fuera?', mood: 'HAPPY' },
        ],
      }),
      key('Los grandes índices', '• **S&P 500:** unas 500 grandes de EE. UU., ponderadas por capitalización; cubre en torno al 80 % del valor de su bolsa.\n• **Nasdaq 100:** las 100 mayores no financieras del Nasdaq; mucha tecnología.\n• **Dow Jones:** solo 30 empresas; pondera por precio.\n• **Euro Stoxx 50:** 50 grandes de la zona euro. **DAX:** Alemania.\n• **MSCI World:** unas 1.250-1.300 empresas en 2026; la cifra cambia con cada revisión.', 'Cada índice mide una parte del mercado: mira qué hay dentro antes de compararte con él.', 'Pruébalo: en Mercado, compara el gráfico del S&P 500 con el del IBEX 35.'),
    ], [
      match('Empareja cada índice con lo que mide.', [['S&P 500', 'Unas 500 grandes empresas de EE. UU.'], ['Nasdaq 100', 'Las 100 mayores no financieras del Nasdaq'], ['IBEX 35', 'Las 35 más líquidas de España'], ['MSCI World', 'Grandes y medianas de 23 países desarrollados'], ['Dow Jones', '30 empresas ponderadas por precio']], 'Cada índice es una ventana distinta al mercado.'),
      upDown('Velas diarias reales de uno de los índices de esta clase, sin nombre ni fechas. ¿Sube o baja en las sesiones siguientes?', 'ud-34', 'Nadie lee de forma fiable dos semanas de un índice: por eso los índices sirven de referencia, no de bola de cristal.'),
      single('¿Qué índice incluye también países emergentes como China o India?', ['MSCI ACWI', 'MSCI World', 'S&P 500'], 0, 'El MSCI World solo incluye desarrollados; el ACWI suma los emergentes.'),
      tf('El MSCI World incluye todos los países del mundo.', false, 'Solo 23 países desarrollados: no hay emergentes como China, India o Brasil.'),
      timed(single('Rápido: ¿qué índice pondera por precio?', ['Dow Jones', 'S&P 500', 'IBEX 35'], 0, 'El Dow Jones (y el Nikkei 225) pesan cada empresa por el precio de su acción.'), 10),
      buckets('¿Qué índice lo refleja mejor?', ['S&P 500', 'IBEX 35', 'MSCI World'], [['Cómo van las grandes empresas de EE. UU.', 0], ['Cómo va la bolsa española', 1], ['Cómo van los países desarrollados en conjunto', 2], ['Un fondo con Apple, Nestlé, Toyota y otras más de mil empresas', 2], ['Un fondo de grandes empresas españolas', 1]], 'Elige siempre el índice que se parezca a lo que miras.'),
      tf('En el MSCI World, EE. UU. pesa más de dos tercios.', true, 'Por eso un fondo «mundial» depende mucho de lo que haga la bolsa estadounidense.'),
      upDown('Nasdaq 100, marzo de 2000: la tecnología lleva años disparada y todo el mundo habla de internet. ¿Qué hizo el índice en los años siguientes?', 'hist-dotcom', 'Un índice muy concentrado en un sector depende de lo que le pase a ese sector, para bien y para mal.', 'los años siguientes'),
      chat(['Tengo un fondo del MSCI World, así que estoy repartido por todo el planeta 🌍'], '¿Qué le contestas a Lumi?', [['Sí, todo el mundo por igual', 'No del todo: más de dos tercios es EE. UU. y no hay emergentes.'], ['Bastante diversificado, pero sobre todo en EE. UU. y sin emergentes', '¡Eso! Más de mil empresas, pero no repartidas por igual entre países.'], ['Solo tienes empresas europeas', 'Al revés: Europa pesa mucho menos que EE. UU.']], 1, 'Diversificado no significa repartido a partes iguales.'),
      fill('El MSCI World cubre grandes y medianas empresas de ____ países desarrollados.', '23', ['50', '100', '195'], '23 países desarrollados; para los emergentes existe el MSCI Emerging Markets y, juntos, el ACWI.'),
    ], { source: '2.6', minutes: 6, retire: [3, 4, 6, 8] }),

    lesson('u7l3', 'Ponderar por capitalización', [
      story('El índice de tres empresas', [{ id: 'sara', name: 'Sara' }], [
        say('sara', 'Hoy casi todas las empresas de mi fondo del S&P 500 han bajado.'),
        say('sara', 'Y aun así el fondo ha subido. ¿Cómo puede ser?'),
        note('Un índice de juguete con tres empresas: A vale 600 millones; B, 300; C, 100. A sube un 10 % y las otras no se mueven.'),
        choose('Si pondera por lo que vale cada empresa, ¿cuánto sube el índice?', [
          opt('Lo mismo que A', 'bad', say('lumi', 'A pesa 600 de 1.000, un **60 %**: el índice sube un 6 %.')),
          opt('Bastante, pero menos que A', 'good', say('lumi', 'Eso. A pesa un 60 %: el índice sube un 6 %.')),
          opt('Un tercio de lo que sube A: es una de tres', 'ok', say('lumi', 'Eso sería si pesaran igual. A pesa un 60 %: sube un 6 %.')),
        ]),
        say('sara', 'O sea, que las grandes mandan.'),
        say('lumi', '**Capitalización = precio × número de acciones.** La que más vale, más pesa.'),
      ]),
      play({
        title: '¿Cómo pondera cada índice?',
        intro: 'Casi todos los índices modernos pesan a cada empresa por lo que **vale en bolsa**. Algunos, no.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Por capitalización' }, { label: 'Por precio' }, { label: 'Todas igual' }],
          cards: [
            { icon: 'chart', label: 'S&P 500', bin: 0, why: 'Por capitalización: las más grandes pesan más.' },
            { icon: 'chart', label: 'Dow Jones', bin: 1, why: 'Por el precio de la acción: un método antiguo.' },
            { icon: 'chart', label: 'IBEX 35', bin: 0, why: 'Por capitalización, contando solo las acciones que se negocian libremente.' },
            { icon: 'chart', label: 'Nikkei 225', bin: 1, why: 'También por precio, como el Dow Jones.' },
            { icon: 'chart', label: 'MSCI World', bin: 0, why: 'Por capitalización: por eso EE. UU. pesa tanto.' },
            { icon: 'scale', label: 'Un índice equiponderado', bin: 2, why: 'Todas pesan lo mismo, sean grandes o pequeñas.' },
          ],
        },
        goal: { text: 'Clasifica los seis índices.', when: [when('done', '==', 6)] },
        insight: 'En un índice **por precio** pesa más la acción con el precio unitario más alto, aunque la empresa sea más pequeña. Por eso casi todos usan la **capitalización**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: solo el Dow Jones y el Nikkei 225 van por precio.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'El precio de una acción no dice lo grande que es la empresa.', mood: 'HAPPY' },
          { say: 'Toca cada índice: ¿cómo pondera?', mood: 'HAPPY' },
        ],
      }),
      key('La concentración', 'Con capitalización, las ganadoras pesan cada vez más. En 2026, unas pocas tecnológicas suponen más de un tercio del S&P 500: comprar el índice es, en buena parte, comprar esas empresas. Mira sus 10 mayores posiciones: te dicen qué compras de verdad.', 'Capitalización = precio × número de acciones; quien más vale, más pesa.', 'Pruébalo: en Mercado, compara hoy cuánto se mueve Apple y cuánto el S&P 500.'),
    ], [
      num('Una empresa tiene 2.000 millones de acciones a 15 € cada una. ¿Cuál es su capitalización, en millones de euros?', 30000, 'millones de €', '2.000 millones × 15 € = 30.000 millones de €.'),
      num('Un índice tiene tres empresas: A vale 600, B 300 y C 100 (millones de €). ¿Cuánto pesa A?', 60, '%', '600 ÷ (600 + 300 + 100) = 600 ÷ 1.000 = 60 %.'),
      num('En ese índice, A sube un 10 % y B y C no se mueven. ¿Cuánto sube el índice?', 6, '%', 'A pesa un 60 %: 0,60 × 10 % = 6 %. Por eso las grandes mueven el índice.'),
      timed(num('Rápido: índice equiponderado de 4 empresas. ¿Cuánto pesa cada una?', 25, '%', '100 ÷ 4 = 25 %.'), 12),
      single('En un índice ponderado por precio, como el Dow Jones, ¿qué pesa más?', ['La acción con el precio por acción más alto', 'La empresa que más vale en bolsa', 'La que tiene más empleados'], 0, 'Por eso es un método poco lógico: el precio de una acción no dice lo grande que es la empresa.'),
      tf('En un índice ponderado por capitalización, una empresa que vale el doble pesa el doble.', true, 'El peso es proporcional a la capitalización.'),
      tf('Una acción de 500 € siempre es de una empresa más grande que una acción de 50 €.', false, 'Depende del número de acciones: lo que cuenta es precio × número de acciones.'),
      single('Empresa X: 100 millones de acciones a 50 €. Empresa Y: 1.000 millones a 10 €. ¿Cuál pesa más en un índice por capitalización?', ['Y', 'X', 'Pesan igual'], 0, 'X vale 5.000 millones de €; Y, 10.000 millones. Y pesa el doble aunque su acción sea más barata.'),
      buckets('¿Cómo pondera cada índice?', ['Por capitalización', 'Por precio'], [['S&P 500', 0], ['Dow Jones', 1], ['IBEX 35', 0], ['Nikkei 225', 1], ['MSCI World', 0]], 'Casi todos los índices modernos ponderan por capitalización.'),
      timed(tf('El IBEX 35 pondera por capitalización.', true, 'Por capitalización, contando las acciones que se negocian libremente.'), 10),
      scenario('Laura compra un fondo del S&P 500 creyendo que tiene «500 empresas a partes iguales». ¿Qué le conviene hacer?', [['Mirar sus 10 mayores posiciones', 'Descubre que unas pocas tecnológicas pesan más de un tercio: ahora sabe lo que compra de verdad.'], ['Dar por hecho que cada empresa pesa un 0,2 %', 'En realidad las grandes pesan muchísimo más: su riesgo depende de pocas empresas.'], ['Venderlo porque «está mal hecho»', 'No está mal hecho: así funciona la capitalización. Solo hay que entenderlo.']], 0, 'Entender cómo pondera un índice es saber qué riesgo compras.'),
      chat(['Mi fondo del S&P 500 casi no nota si caen las grandes tecnológicas, ¿verdad?'], '¿Qué le contestas a Lumi?', [['Sí: son pocas empresas de 500', 'Son pocas, pero pesan más de un tercio del índice: si caen, tu fondo lo nota mucho.'], ['Lo nota bastante: por capitalización, esas pocas pesan muchísimo', '¡Eso! En 2026, unas pocas tecnológicas suponen más de un tercio del S&P 500.'], ['No lo nota nada: el fondo está diversificado', 'Diversificado no significa repartido por igual: las grandes mandan.']], 1, 'La tentadora es contar empresas: «son pocas de 500». Pero en un índice por capitalización pesa lo que vale cada una, y esas pocas suponen más de un tercio.'),
    ], { source: '2.6', minutes: 6, retire: [0, 1, 2, 3, 5, 8, 9] }),

    lesson('u7l4', 'Índice de precios y de rentabilidad total', [
      mission({
        title: 'El IBEX que «no subía»',
        intro: 'Datos reales: **10.000 €** en el IBEX 35 a finales de 2006, el índice que sale en las noticias. Dale a empezar.',
        widget: { kind: 'crash', series: 'series-ibex', amount: 10000 },
        goal: { text: 'Llega hasta el final, vendas o no.', when: [when('played', '==', 1)] },
        insight: 'Con cierres mensuales, el IBEX de precios no superó su máximo de 2007 **hasta octubre de 2025**, y 10.000 € eran 12.235 € a finales de 2025. Pero no cuenta los dividendos: **el IBEX 35 con dividendos ha estado muy por encima**.',
        lumi: [
          { when: when('sold', '==', 1), say: 'Has vendido. Mira lo que pasa después…', mood: 'THINKING' },
          { when: when('drop', '<=', -50), say: 'Más de la mitad abajo. Y sin contar dividendos.', mood: 'WORRIED' },
          { when: when('drop', '<=', -20), say: 'Un 20 % abajo… y este índice no cuenta los dividendos.', mood: 'WORRIED' },
          { say: 'Dale a empezar. Puedes vender cuando quieras', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Con o sin dividendos',
        intro: 'Ese IBEX es un índice **de precios**: no cuenta los dividendos. Imagina uno que sube un 5 % al año de precio y reparte un 2 % más en dividendos.',
        widget: { kind: 'growth', initial: 10000, monthly: 0, rate: 5, years: 30, maxInitial: 10000, maxMonthly: 500, maxRate: 10, maxYears: 40, lines: ['compound'], controls: ['rate', 'years'] },
        predict: {
          prompt: 'A 30 años, ¿cuánto cambia reinvertir ese 2 % de dividendos?',
          options: ['Casi nada: un 2 % es poco', 'Algo: un 10 % más', 'Casi el doble de dinero'],
          answer: 2,
          why: 'Al 5 %, 10.000 € se convierten en **43.219 €**. Al 7 %, en **76.123 €**. Pruébalo.',
        },
        goal: { text: 'Sube la rentabilidad al 7 %: precio más dividendos reinvertidos.', when: [when('rate', '==', 7), when('years', '==', 30)] },
        insight: 'Los índices de **rentabilidad total**, como el IBEX 35 con dividendos, suponen que se reinvierten: **a 30 años, casi el doble**. Son ejemplos, no promesas: los índices no suben lo mismo cada año.',
        lumi: [
          { when: when('rate', '>=', 7), say: 'Eso es reinvertir los dividendos: mira la diferencia.', mood: 'CELEBRATE' },
          { when: when('years', '<', 20), say: 'Alarga los años: la diferencia se compone.', mood: 'THINKING' },
          { say: 'Sube la rentabilidad del 5 % al 7 %', mood: 'HAPPY' },
        ],
      }),
      key('Compara igual con igual', 'Si cuentas los dividendos que cobras, compárate con el índice **con dividendos**. Si no, parecerá que lo haces mejor de lo que lo haces.\n\nUn **fondo de acumulación** reinvierte los dividendos por ti.', 'Para medir una inversión a largo plazo, usa el índice con dividendos.', 'Pruébalo: en Mercado, busca un ETF con «Acc» en el nombre: reinvierte los dividendos.'),
    ], [
      num('Un índice sube un 4 % de precio y reparte un 3 % en dividendos. ¿Cuál es su rentabilidad total aproximada?', 7, '%', '4 % + 3 % ≈ 7 %.'),
      num('10.000 € al 5 % anual durante 30 años, ¿en cuánto se convierten? (redondea)', 43219, '€', '10.000 × 1,05³⁰ ≈ 43.219 €.'),
      num('¿Y si al 5 % le sumas un 2 % de dividendos reinvertidos (un 7 % anual durante 30 años)? (redondea)', 76123, '€', '10.000 × 1,07³⁰ ≈ 76.123 €: casi el doble que sin dividendos.'),
      single('¿Qué mide un índice de rentabilidad total?', ['El precio más los dividendos reinvertidos', 'Solo la variación del precio', 'Los beneficios de las empresas'], 0, 'Es lo que habría ganado un inversor que reinvirtiera todo.'),
      tf('El IBEX 35 que sale en las noticias incluye los dividendos.', false, 'Es un índice de precios; existe aparte el IBEX 35 con dividendos.'),
      upDown('Nikkei 225 (Japón), diciembre de 1989: el índice lleva años de subidas espectaculares. ¿Qué hizo en los años siguientes?', 'hist-japan-1989', 'Lo que pasó lo ves en el gráfico. Recuerda que es un índice de precios: no cuenta los dividendos que cobraba quien lo tenía.', 'los años siguientes'),
      match('Empareja cada término con su significado.', [['Índice de precios', 'Solo la variación de las cotizaciones'], ['Índice de rentabilidad total', 'Precio más dividendos reinvertidos'], ['Dividendo', 'Parte del beneficio que se reparte'], ['Fondo de acumulación', 'Reinvierte los dividendos por ti']], 'Para comparar bien, compara siempre «con dividendos» con «con dividendos».'),
      chat(['Mi tío dice que durante años el IBEX no subió nada desde 2007 🤷', '¿Entonces la bolsa española no da nada?'], '¿Qué le contestas a Lumi?', [['Tiene razón, no da nada', 'Le falta una parte: los dividendos.'], ['Ese IBEX no cuenta los dividendos; con ellos, la historia cambia mucho', '¡Eso! El IBEX 35 con dividendos ha estado muy por encima del de precios.'], ['Es que el IBEX está mal calculado', 'Está bien calculado: solo mide otra cosa, el precio.']], 1, 'El índice de precios cuenta solo media historia.'),
      timed(tf('A largo plazo, la diferencia entre reinvertir los dividendos o no es pequeña.', false, 'A 30 años, un 5 % frente a un 7 % es casi el doble de dinero.'), 10),
      single('Comparas tu cartera, contando los dividendos que cobraste, con el IBEX 35 de precios. ¿Qué pasa?', ['Te comparas con ventaja: deberías usar el IBEX con dividendos', 'Es la comparación correcta', 'Te comparas con desventaja'], 0, 'Tú cuentas dividendos y el índice no: parecerá que lo haces mejor de lo que lo haces.'),
    ], { source: '2.6', minutes: 6, retire: [0, 1, 2, 4, 8] }),

    lesson('u7l5', 'Comparar tu rentabilidad', [
      story('«He ganado»', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Este año mi cartera de acciones españolas ha ganado un 4 %. ¡Bien!'),
        note('Ese año, el IBEX 35 con dividendos subió un 12 %.'),
        choose('¿Qué le dices a Pablo?', [
          opt('Genial: ganar es ganar', 'bad', say('lumi', 'Ganar menos que la alternativa más sencilla también es perder.')),
          opt('Ha quedado 8 puntos por detrás de su referencia', 'good', say('lumi', 'Eso. Un fondo indexado del IBEX le habría dado el triple.')),
          opt('Que se compare con un depósito al 2 %', 'ok', say('lumi', 'Es otro riesgo: unas acciones se comparan con un índice de acciones.')),
        ]),
        say('pablo', 'Vaya… ¿y cómo me comparo bien?'),
        say('lumi', 'Mismo periodo, misma moneda, con dividendos y después de comisiones.'),
      ]),
      play({
        title: '¿Con qué índice te comparas?',
        intro: 'Tu **índice de referencia** (*benchmark*) tiene que parecerse a lo que inviertes. Y siempre, con dividendos.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'MSCI World' }, { label: 'IBEX 35' }, { label: 'S&P 500' }],
          cards: [
            { icon: 'globe', label: 'Una cartera de acciones de todo el mundo desarrollado', bin: 0, why: 'Grandes y medianas de 23 países desarrollados: el MSCI World.' },
            { icon: 'bank', label: 'Acciones de Santander, Iberdrola e Inditex', bin: 1, why: 'Grandes empresas españolas: el IBEX 35 con dividendos.' },
            { icon: 'company', label: 'Un fondo de grandes empresas de EE. UU.', bin: 2, why: 'Unas 500 grandes de EE. UU.: el S&P 500 con dividendos.' },
            { icon: 'layers', label: 'Un fondo con Apple, Nestlé, Toyota y más de mil empresas', bin: 0, why: 'Muchos países desarrollados a la vez: el MSCI World.' },
            { icon: 'building', label: 'Un fondo de grandes empresas españolas', bin: 1, why: 'La bolsa española: el IBEX 35 con dividendos.' },
            { icon: 'chart', label: 'Acciones de Apple, Microsoft y Amazon', bin: 2, why: 'Grandes de EE. UU.: el S&P 500 con dividendos.' },
          ],
        },
        goal: { text: 'Busca la referencia de las seis carteras.', when: [when('done', '==', 6)] },
        insight: 'La referencia tiene que **parecerse a tu cartera**: mundial con el MSCI World, española con el IBEX 35 y de EE. UU. con el S&P 500, siempre **con dividendos**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: fíjate en el país de las empresas.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Compararte con lo que no se parece no te dice nada.', mood: 'HAPPY' },
          { say: 'Toca cada cartera: ¿con qué índice la comparas?', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Quedarse atrás también se compone',
        intro: 'Dos fondos del mismo mercado rinden un 7 % bruto. Uno cuesta un 0,2 % al año; el otro, un 1,8 %: **1,6 puntos por detrás** cada año.',
        widget: { kind: 'fees', amount: 10000, monthly: 0, gross: 7, feeA: 0.2, feeB: 1.8, years: 10, maxFee: 2.5, maxYears: 40 },
        predict: {
          prompt: 'Con 10.000 € durante 30 años, ¿cuánto del resultado se llevan esos 1,6 puntos?',
          options: ['Un 1,6 %, poca cosa', 'Algo más de un tercio', 'Casi todo'],
          answer: 1,
          why: 'El barato acaba en **71.968 €** y el caro, en **45.759 €**: se pierden 26.209 €, un 36 %.',
        },
        goal: { text: 'Lleva el plazo a 30 años.', when: [when('years', '==', 30), when('feeB', '>=', 1.75)] },
        insight: 'Batir al índice es difícil incluso para profesionales: según SPIVA (cierre de 2025), un **97 %** de los fondos activos de acciones europeas quedó por detrás en 10 años. Y el inversor medio gana **1,2 puntos al año menos** que sus fondos por comprar y vender en mal momento (Morningstar). Pruébalo: busca en Mercado el índice que se parece a tu cartera y añádelo a Favoritos.',
        lumi: [
          { when: when('lostPct', '>=', 30), say: 'Más de un tercio, solo por quedarse atrás cada año.', mood: 'WORRIED' },
          { when: when('years', '>=', 20), say: 'Sigue: los puntos que pierdes también se componen.', mood: 'THINKING' },
          { say: 'Alarga los años y mira la diferencia', mood: 'HAPPY' },
        ],
      }),
    ], [
      num('Tu cartera ganó un 6 % y su índice de referencia un 9 %. ¿Cuántos puntos quedaste por detrás?', 3, 'puntos', '9 − 6 = 3 puntos.'),
      num('Empiezas el año con 5.000 €, no aportas nada y lo acabas con 5.400 €. ¿Qué rentabilidad has tenido?', 8, '%', '400 ÷ 5.000 = 0,08 → 8 %.'),
      num('Empiezas con 5.000 €, aportas 1.000 € durante el año y acabas con 6.300 €. ¿Cuánto has ganado de verdad?', 300, '€', '6.300 − 5.000 − 1.000 = 300 €. Lo que aportas no es ganancia.'),
      match('Empareja cada cartera con su índice de referencia.', [['Acciones de todo el mundo desarrollado', 'MSCI World con dividendos'], ['Acciones españolas', 'IBEX 35 con dividendos'], ['Grandes empresas de EE. UU.', 'S&P 500 con dividendos'], ['Tecnológicas grandes del Nasdaq', 'Nasdaq 100 con dividendos']], 'La referencia tiene que parecerse a lo que inviertes.'),
      scenario('Pablo invierte en acciones españolas y un año gana un 4 %, mientras el IBEX 35 con dividendos sube un 12 %. Está contento porque «ha ganado». ¿Qué le dirías?', [['Que ha quedado 8 puntos por detrás de su referencia', 'Un fondo indexado del IBEX le habría dado tres veces más. Es una señal para revisar lo que hace.'], ['Que lo ha hecho genial: ganar es ganar', 'Ganar menos que la alternativa más sencilla también es perder, aunque no se vea.'], ['Que debería compararse con un depósito al 2 %', 'Es otro riesgo: una cartera de acciones se compara con un índice de acciones.']], 0, 'Sin vara de medir no sabes si lo haces bien.'),
      scenario('Marta elige un fondo porque batió a su índice el año pasado. ¿Qué le conviene?', [['Mirar también su historial a 5-10 años y sus costes', 'Comprueba si fue suerte de un año o algo constante, y cuánto le cuesta.'], ['Invertir todo: si ganó, ganará', 'Según SPIVA, muy pocos de los que baten al índice un periodo lo repiten el siguiente.'], ['Elegir el que más perdió para «comprar barato»', 'Perder mucho un año tampoco dice que vaya a ganar el siguiente.']], 0, 'El éxito pasado no predice el futuro: mira periodos largos y costes.'),
      single('Según SPIVA (cierre de 2025), ¿qué porcentaje de fondos activos de acciones europeas quedó por detrás de su índice en 10 años?', ['Alrededor del 30 %', 'Alrededor del 60 %', 'Un 97 %'], 2, 'Casi todos: los costes y la competencia hacen muy difícil batir al índice durante años.'),
      tf('Para comparar bien, hay que usar el índice con dividendos y tu rentabilidad después de comisiones.', true, 'Así comparas lo que de verdad ganaste con lo que habría dado el índice.'),
      timed(single('Rápido: tu cartera de acciones mundiales ganó un 10 % y el MSCI World con dividendos un 12 %. ¿Cómo lo hiciste?', ['Peor, por 2 puntos', 'Mejor: ganaste un 10 %', 'Igual'], 0, '10 − 12 = −2 puntos frente a tu referencia.'), 12),
      tf('Comparar una cartera de acciones con un depósito al 2 % es una buena forma de saber si la gestionas bien.', false, 'Son riesgos distintos. Una cartera de acciones se compara con un índice de acciones parecido.'),
      chat(['Empecé el año con 5.000 €, metí 1.000 € más y acabo con 6.300 €', '¡He ganado 1.300 €!'], '¿Qué le contestas a Lumi?', [['¡Enhorabuena, 1.300 € de ganancia!', 'No todo es ganancia: 1.000 € los pusiste tú. Lo que aportas no es rentabilidad.'], ['Parte de eso lo pusiste tú: la ganancia de verdad es mucho menor', '¡Eso! Has ganado 300 €: el resto es dinero que aportaste.'], ['Has perdido dinero', 'Tampoco: la cartera vale más que todo lo que metiste.']], 1, 'La tentadora es mirar solo cuánto ha crecido la cuenta. Para medir lo que ganas, resta lo que has aportado: si no, te comparas con ventaja.'),
      scenario('Leo tiene un fondo de grandes empresas de EE. UU. Este año su fondo ha subido y el IBEX 35 ha bajado, y Leo presume: «Lo hago mejor que la bolsa». ¿Qué le dices?', [['Que se compare con el S&P 500 con dividendos, que se parece a su fondo', 'Su fondo es de grandes empresas de EE. UU.: esa es su vara de medir, no la bolsa española.'], ['Que tiene razón: ha batido al IBEX', 'Batir a un índice que no se parece a tu cartera no dice nada de cómo lo haces.'], ['Que se compare con un depósito', 'Es otro riesgo: unas acciones se comparan con un índice de acciones parecido.']], 0, 'La referencia tiene que parecerse a lo que inviertes. La tentadora es compararse con el índice que le deja mejor: así cualquiera «bate al mercado».'),
    ], { source: '4.1', minutes: 6, retire: [0, 1, 2, 3, 4, 7, 8] }),
  ],
})
