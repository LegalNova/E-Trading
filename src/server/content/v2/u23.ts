import 'server-only'
// Sección 7 · Unidad 23 · Juntarlo todo (docs/curso-v2/02-curriculo.md)
// Fuentes: docs/curso/07 (7.3), 09-analisis-tecnico.md (9.9, 9.10).
// Fuera del manual, verificado: Park e Irwin (2007), 95 estudios modernos: 56 positivos, 20 negativos y 19 mixtos, con problemas de método.
import { buckets, chat, choose, key, lesson, level, match, mission, multi, num, opt, order, play, say, scenario, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u23', order: 23, title: 'Juntarlo todo', description: 'Combinar señales, analizar de arriba abajo, probar reglas y saber qué funciona',
  lessons: [
    lesson('u23l1', 'Confluencia: señales que se confirman', [
      play({
        title: '¿Suma o se repite?',
        intro: 'Piensas en comprar y ya tienes el **RSI** en pantalla. ¿Qué te da información nueva?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Pieza distinta: suma' }, { label: 'Repetida u opinión: no suma' }],
          cards: [
            { icon: 'chart', label: 'La tendencia semanal es alcista', bin: 0, why: 'La tendencia es una pieza distinta del impulso.' },
            { icon: 'layers', label: 'Rebote en un soporte que ha aguantado tres veces', bin: 0, why: 'Un nivel relevante es otra pieza del gráfico.' },
            { icon: 'gauge', label: 'El estocástico también está en sobreventa', bin: 1, why: 'Mide impulso, como el RSI: es la misma opinión repetida.' },
            { icon: 'bars', label: 'Rotura con el doble del volumen medio', bin: 0, why: 'El volumen dice si hay gente detrás del movimiento.' },
            { icon: 'pulse', label: 'El CCI también lo confirma', bin: 1, why: 'Otro oscilador de impulso: no aporta nada nuevo.' },
            { icon: 'megaphone', label: 'Un influencer muy seguro de sí mismo', bin: 1, why: 'Una opinión ajena no es una pieza del gráfico.' },
          ],
        },
        goal: { text: 'Clasifica las seis piezas.', when: [when('done', '==', 6)] },
        insight: 'La **confluencia** viene de piezas **distintas**: tendencia, nivel, señal y volumen. Tres osciladores de impulso no son tres confirmaciones: son una repetida.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: RSI, estocástico y CCI miden casi lo mismo.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Pocas piezas, pero de tipos distintos.', mood: 'HAPPY' },
          { say: '¿Suma o se repite? Clasifica cada pieza', mood: 'HAPPY' },
        ],
      }),
      mission({
        title: 'Y aun así, un plan',
        intro: 'Velas reales de ethereum: tienes confluencia y compras al último precio. El **soporte** queda algo más de un 3 % por debajo.',
        widget: { kind: 'orders', chart: 'lvl-15', stopPct: 1, takePct: 3, maxPct: 12 },
        predict: {
          prompt: 'Con el stop bajo el soporte, ¿dónde debería estar el objetivo para que la operación merezca la pena?',
          options: ['A la misma distancia que el stop, pero hacia arriba', 'Al menos al doble de distancia que el stop', 'Con tanta confluencia, no hace falta objetivo'],
          answer: 1,
          why: 'Si el objetivo no está, como mínimo, a **2 veces** la distancia del stop, no merece la pena: la confluencia mejora la idea, no la asegura.',
        },
        goal: { text: 'Stop bajo el soporte y objetivo al menos al doble de distancia. Luego mira qué pasó.', when: [when('stopPct', '>=', 3.5), when('rr', '>=', 2), when('played', '==', 1), when('hit', '==', 2)] },
        insight: 'Con confluencia, la idea es **mejor, no segura**. Antes de entrar: dónde va el stop, dónde el objetivo (al menos **2 a 1**) y cuánto arriesgas.',
        lumi: [
          { when: when('hit', '==', 2), say: '¡Objetivo! Con un 2 a 1, puedes fallar a menudo y seguir ganando.', mood: 'CELEBRATE' },
          { when: when('hit', '==', 1), say: 'Saltó el stop. ¿Estaba por debajo del soporte?', mood: 'WORRIED' },
          { when: when('rr', '<', 2), say: 'El objetivo aún no está al doble de distancia que el stop.', mood: 'THINKING' },
          { say: 'Coloca el stop y el objetivo, y mira qué pasó', mood: 'HAPPY' },
        ],
      }),
      key('Piezas de tipos distintos', 'Mejor pocas herramientas de **tipos distintos**:\n\n• **Tendencia:** máximos y mínimos, medias, SMA 200.\n• **Impulso:** RSI o MACD (con uno basta).\n• **Volatilidad:** Bollinger, ATR.\n• **Volumen:** más gente detrás.\n\nY una **señal** sobre un **nivel**: vela de giro confirmada o rotura con volumen.', 'Busca coincidencias de piezas distintas, no más indicadores.', 'Antes de tu próxima compra en el simulador, busca tendencia, nivel, señal y volumen.'),
    ], [
      multi('Ya tienes el RSI en pantalla. ¿Qué piezas añadirían información distinta? Marca todas.', ['La tendencia de fondo (SMA 200)', 'Un soporte relevante', 'El volumen en la señal', 'El estocástico y el CCI', 'Una vela de giro confirmada'], [0, 1, 2, 4], 'El estocástico y el CCI miden impulso, igual que el RSI: no aportan una opinión nueva.'),
      multi('¿Qué cuenta como confluencia a favor de una posible compra? Marca todas.', ['Martillo confirmado sobre un soporte', 'Precio por encima de la SMA 200', 'Volumen alto en la vela de giro', 'Que el patrón salga en un vídeo viral', 'Que te guste la empresa'], [0, 1, 2], 'Tendencia, nivel, señal y volumen son piezas del gráfico. La popularidad de un vídeo o tu simpatía por la empresa no lo son.'),
      single('¿Qué combinación es menos redundante?', ['RSI, estocástico y CCI', 'SMA 200, RSI y volumen', 'Medias de 20, 21 y 22 sesiones'], 1, 'Tendencia, impulso y volumen miden cosas distintas.'),
      num('Entras a 50 € con el stop en 48 €. ¿A qué precio, como mínimo, debería estar el objetivo para una relación beneficio/riesgo de 2 a 1?', 54, '€', 'Riesgo: 2 €. Objetivo: 2 × 2 = 4 € por encima de la entrada → 54 €.'),
      buckets('¿Suma a favor de una compra o no suma?', ['Suma', 'No suma'], [['Tendencia semanal alcista', 0], ['Rebote en un soporte que ha aguantado tres veces', 0], ['Un cuarto oscilador de impulso', 1], ['Rotura con el doble del volumen medio', 0], ['Un influencer muy seguro de sí mismo', 1]], 'Suman las piezas distintas del gráfico; no suman las repetidas ni las opiniones ajenas.'),
      upDown('Busca tendencia, niveles y velas en este gráfico. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-11', 'Incluso con varias señales a favor, el resultado de 10 sesiones es incierto. La confluencia mejora las probabilidades; el stop protege cuando fallan.'),
      upDown('Otro gráfico, mismo método. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-40', 'Aplica siempre los mismos pasos: así sabrás si tu método aporta algo o si solo recuerdas los aciertos.'),
      level('Tienes confluencia y entras al último precio. Coloca el stop donde la idea deja de valer.', 'lvl-41', 'STOP', 'Por debajo del mínimo reciente: si el precio lo pierde, las piezas que te hicieron entrar ya no valen.'),
      scenario('Pablo tiene 9 indicadores en pantalla: 6 dicen «compra» y 3 «venta». ¿Qué le pasa?', [['Que tiene una señal clarísima: 6 contra 3', 'Si varios miden lo mismo, ese 6 contra 3 puede ser 1 contra 1 repetido.'], ['Que probablemente muchos miden lo mismo y la votación no significa nada', 'Eso: mejor pocas herramientas de tipos distintos que un parlamento de osciladores.'], ['Que le faltan indicadores', 'Añadir más solo multiplica las coincidencias por casualidad.']], 1, 'La confluencia viene de piezas distintas, no de contar indicadores.'),
      timed(tf('Tres osciladores de impulso que coinciden son tres confirmaciones independientes.', false, 'Miden casi lo mismo: es una sola opinión repetida.'), 10),
      scenario('Tienes confluencia para comprar: tendencia alcista, soporte y volumen. El stop va un 3 % por debajo, bajo el soporte, y la resistencia más cercana está solo un 2 % por encima. ¿Entras?', [['Sí: con tanta confluencia, seguro que la rompe', 'La confluencia mejora la idea, no la asegura. Y aquí arriesgas más de lo que puedes ganar hasta la resistencia.'], ['No: arriesgo más de lo que puedo ganar hasta la resistencia, así que no compensa', 'Eso: si el objetivo no está al menos al doble de distancia que el stop, la operación no merece la pena.'], ['Sí, pero acerco el stop a un 0,5 % para que cuadre', 'Mover el stop para que cuadren las cuentas lo deja dentro del ruido: saltará sin motivo.']], 1, 'Antes de entrar, compara: la distancia al objetivo debería ser al menos el doble que la del stop. Si no, ni la mejor confluencia compensa.'),
    ], { source: '9.9', minutes: 6, retire: [0, 3, 4, 6, 9] }),

    lesson('u23l2', 'Varias temporalidades', [
      story('¿A cuál hago caso?', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'En el gráfico de 15 minutos veo una subida brutal.'),
        say('leo', 'Pero en el semanal está en plena caída. ¿A cuál hago caso?'),
        choose('¿Qué le contestas?', [
          opt('Al de 15 minutos: es el más reciente', 'bad', say('lumi', 'Lo más reciente no es lo más importante: en 15 minutos manda el ruido.')),
          opt('Primero al semanal: marca la dirección', 'good', say('lumi', '¡Eso! De arriba abajo: **dirección**, **momento** y **entrada**.')),
          opt('A ninguno: los gráficos no sirven', 'ok', say('lumi', 'Sirven para ordenar la decisión y poner el stop con lógica.')),
        ]),
        say('lumi', 'Contra el semanal, la señal pesa menos: mejor ignorarla u operarla más pequeña.'),
      ]),
      play({
        title: 'Las tres pantallas',
        intro: 'El método de **Alexander Elder** mira tres temporalidades, de mayor a menor. ¿Qué pregunta responde cada una?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Semanal: la dirección' }, { label: 'Diaria: el momento' }, { label: 'Horas: la entrada' }],
          cards: [
            { icon: 'globe', label: '¿Cuál es la tendencia de fondo?', bin: 0, why: 'La temporalidad mayor pone el contexto.' },
            { icon: 'shield', label: '¿Está el precio por encima de la SMA 200?', bin: 0, why: 'Es el filtro de la tendencia de fondo.' },
            { icon: 'repeat', label: '¿Hay un retroceso o una figura?', bin: 1, why: 'La diaria dice si es buen momento dentro de esa tendencia.' },
            { icon: 'candles', label: '¿Ha aparecido una señal de giro?', bin: 1, why: 'La señal se busca en diario.' },
            { icon: 'target', label: '¿Dónde va exactamente el stop?', bin: 2, why: 'La temporalidad menor afina el stop.' },
            { icon: 'clock', label: '¿A qué precio entro?', bin: 2, why: 'Y también la entrada.' },
          ],
        },
        goal: { text: 'Coloca las seis preguntas.', when: [when('done', '==', 6)] },
        insight: 'Primero la **dirección** en la temporalidad mayor; después, el **momento** en la intermedia, y la **entrada y el stop** en la menor.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: de lo general a lo concreto.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Bien! Así no operas contra la corriente.', mood: 'HAPPY' },
          { say: '¿Qué pantalla responde cada pregunta?', mood: 'HAPPY' },
        ],
      }),
      key('El método en 7 pasos', '1. Semanal: tendencia y SMA 200.\n2. Estructura de máximos y mínimos.\n3. Niveles.\n4. Situación actual: ¿cerca de un nivel o en una figura?\n5. Señal en diario.\n6. Indicadores como filtro.\n7. Plan: entrada, stop, objetivo y riesgo.\n\nQue las temporalidades no coincidan también es información.', 'Primero la dirección en la temporalidad mayor; después, el momento en la menor.', 'Pruébalo: en Mercado, mira un activo en semanal antes de mirarlo en diario.'),
    ], [
      order('Ordena el análisis de arriba abajo.', ['Tendencia en el semanal', 'Retroceso o figura en el diario', 'Entrada y stop en el gráfico de horas'], 'De lo general a lo concreto: dirección, momento y entrada.'),
      order('Ordena los 7 pasos del método.', ['Tendencia semanal y SMA 200', 'Estructura de máximos y mínimos', 'Niveles', 'Situación actual', 'Señal en diario', 'Indicadores como filtro', 'Plan: entrada, stop, objetivo y riesgo'], 'El plan siempre va al final y nunca se salta.'),
      trend('Primera pantalla: la tendencia de fondo. ¿Qué ves?', 'trend-down-11', 'Bajista', 'Máximos y mínimos decrecientes: con este fondo, una señal de compra en diario iría contra la corriente.'),
      scenario('Semanal: máximos y mínimos decrecientes y precio por debajo de la SMA 200. Diario: aparece un martillo precioso. ¿Qué haces con lógica?', [['Compro fuerte: el martillo manda', 'El martillo va contra la tendencia de fondo: en ese contexto es una señal débil.'], ['La trato como una señal contra la corriente: o la ignoro o la opero más pequeña y con stop', 'Eso: cuando las temporalidades no coinciden, la señal pesa menos.'], ['Vendo todo lo que tengo en cartera', 'Un martillo no es una señal de venta, y una cartera a largo plazo no depende de una vela.']], 1, 'La temporalidad mayor pone el contexto; la menor no debería contradecirla sin más.'),
      buckets('¿Las temporalidades están alineadas?', ['Alineadas', 'Contra la corriente'], [['Semanal alcista y señal de compra en diario', 0], ['Semanal bajista y señal de compra en diario', 1], ['Semanal bajista y rotura a la baja en diario', 0], ['Semanal alcista y señal de venta en 5 minutos', 1]], 'Alineadas cuando la señal va en la dirección de la temporalidad mayor.'),
      upDown('Primero la vista grande: 30 velas diarias. ¿Sube o baja en las 10 siguientes?', 'ud-36', 'Ni mirando varias temporalidades se adivina el corto plazo. El método sirve para no operar contra la corriente y para saber dónde va el stop.'),
      upDown('Otro activo. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-47', 'Un método ordenado reduce errores tontos; no elimina la incertidumbre.'),
      single('En el método de las tres pantallas, ¿para qué sirve la temporalidad menor?', ['Para decidir la dirección de fondo', 'Para afinar la entrada y el stop', 'Para elegir qué activo comprar'], 1, 'La mayor da la dirección; la intermedia, el momento; la menor, la entrada y el stop.'),
      timed(single('Rápido: ¿quién propuso el método de las tres pantallas?', ['Alexander Elder', 'Charles Dow', 'John Bollinger'], 0, 'Alexander Elder, en Trading for a Living.'), 10),
      chat(['En el gráfico de 15 minutos veo una subida brutal 🚀', 'Pero en el semanal está en plena caída 📉', '¿A cuál hago caso?'], '¿Qué le contestas?', [['Al de 15 minutos, que es el más reciente', 'Lo más reciente no es lo más importante: en 15 minutos manda el ruido.'], ['Primero al semanal, que marca la dirección; el de 15 minutos solo afina el momento', '¡Eso! De arriba abajo: dirección, momento y entrada.'], ['A ninguno: los gráficos no sirven', 'Sirven para ordenar la decisión y poner el stop con lógica, aunque no predigan.']], 1, 'La temporalidad mayor manda; la menor afina.'),
    ], { source: '7.3', minutes: 6, retire: [6, 7, 8, 9] }),

    lesson('u23l3', 'El backtesting', [
      play({
        title: 'Mil reglas que no funcionan',
        intro: 'Imagina que pruebas **1.000 reglas** sin ninguna ventaja. Cada una es como alguien que opera a cara o cruz pagando comisión.',
        widget: { kind: 'coinflip', traders: 1000, trades: 100, maxTrades: 300, fee: 1, stake: 100, win: 1 },
        predict: {
          prompt: 'Tras 100 operaciones, ¿cuánto habrá ganado la mejor de las 1.000?',
          options: ['Casi nada: es una moneda', 'Muchísimo: parece un descubrimiento', 'Lo mismo que la media'],
          answer: 1,
          why: 'La mejor gana **2.700 €** por pura suerte, mientras la media pierde 109 €.',
        },
        goal: { text: 'Sube a 300 operaciones: ¿la mejor deja de parecer buena?', when: [when('trades', '>=', 300)] },
        insight: 'Con 1.000 reglas sin ventaja, la mejor **siempre** parece un descubrimiento. Es el **sobreajuste**: si eliges la ganadora mirando el pasado, eliges suerte.',
        lumi: [
          { when: when('best', '>=', 4000), say: 'La mejor ya gana miles… lanzando una moneda.', mood: 'THINKING' },
          { when: when('avg', '<=', -200), say: 'Mira la media: las comisiones van restando a casi todos.', mood: 'WORRIED' },
          { say: 'Mueve las operaciones y mira a la mejor de todas', mood: 'HAPPY' },
        ],
      }),
      story('El 40 % de Marta', [{ id: 'marta', name: 'Marta' }], [
        say('marta', 'He probado 300 variantes de mi regla con datos de 2015 a 2020.'),
        say('marta', 'La mejor ganó un 40 % anual. ¡La pongo en marcha!'),
        choose('¿Qué debería hacer antes?', [
          opt('Usarla ya con todo su dinero', 'bad', say('lumi', 'Con 300 variantes, la mejor puede ser pura casualidad.')),
          opt('Probarla una sola vez con datos que no haya usado, y con costes', 'good', say('lumi', '¡Eso! **Fuera de la muestra**: si se desinfla, era sobreajuste.')),
          opt('Buscar una variante que gane un 60 %', 'bad', say('lumi', 'Más variantes, más casualidades disfrazadas de descubrimiento.')),
        ]),
        say('marta', '¿Con qué datos la pruebo?'),
        say('lumi', 'Por ejemplo, de 2021 a 2024. Y con comisiones y *spread*.'),
      ]),
      key('Las trampas del backtest', '• **Sobreajuste:** pruebas tantas variantes que alguna sale bien por casualidad.\n• **Sesgo de anticipación:** usar datos que en ese momento aún no se conocían.\n• **Sesgo de supervivencia:** probar solo con empresas que hoy siguen vivas.\n• **Olvidar los costes:** comisiones, *spread* e impuestos.\n\nLa regla se escribe **antes** de mirar los resultados. Se diseña con una parte de los datos (**dentro de la muestra**) y se prueba una sola vez con otra (**fuera de la muestra**).', 'Un backtest dice lo que habría pasado, no lo que pasará.', 'Escribe tu regla antes de probarla en el simulador, y no la cambies.'),
    ], [
      num('Pruebas 100 reglas que en realidad no funcionan. Si cada una tiene un 5 % de probabilidad de parecer buena por casualidad, ¿cuántas esperas que «funcionen»?', 5, 'reglas', '100 × 0,05 = 5. Si solo enseñas esas 5, parecerá que has descubierto algo.'),
      num('Una regla gana de media un 0,10 % bruto por operación. Cada operación cuesta un 0,15 % entre comisión y spread. ¿Cuál es el resultado neto por operación?', -0.05, '%', '0,10 − 0,15 = −0,05 %. Con costes, la «ventaja» se convierte en pérdida.', 5),
      num('Una regla acierta el 40 % de las veces y gana 300 € cuando acierta; el 60 % restante pierde 100 €. ¿Cuánto gana de media por operación?', 60, '€', '0,4 × 300 − 0,6 × 100 = 120 − 60 = 60 €. Se puede fallar más de lo que se acierta y ganar, si las ganancias son mayores que las pérdidas.'),
      match('Empareja cada trampa con su ejemplo.', [['Sobreajuste', 'Probar 500 combinaciones de medias y quedarte con la mejor'], ['Sesgo de anticipación', 'Usar el cierre del día para comprar en la apertura de ese mismo día'], ['Sesgo de supervivencia', 'Probar solo con las empresas que hoy están en el índice'], ['Olvidar los costes', 'Calcular sin comisiones ni spread']], 'Cada trampa infla los resultados del pasado de una forma distinta.'),
      scenario('Marta prueba 300 variantes de una regla con datos de 2015 a 2020 y se queda con la que ganó un 40 % anual. ¿Qué debería hacer antes de fiarse?', [['Usarla ya con todo su dinero', 'Con 300 variantes, la mejor puede ser pura casualidad. Sin una prueba fuera de la muestra, no sabe nada.'], ['Probarla una sola vez con datos que no haya usado (por ejemplo, de 2021 a 2024) y con costes', 'Eso: si fuera de la muestra se desinfla, era sobreajuste.'], ['Buscar una variante que gane un 60 %', 'Probar más variantes agrava el problema: más casualidades disfrazadas de descubrimiento.']], 1, 'La prueba fuera de la muestra es la que separa una regla de una casualidad.'),
      scenario('Bruno hace un backtest desde el año 2000 con las 35 empresas que hoy forman el IBEX 35. Sale espectacular. ¿Cuál es el problema?', [['Ninguno: son empresas reales', 'Son reales, pero son las que sobrevivieron y crecieron. Las que cayeron o salieron del índice no están.'], ['Sesgo de supervivencia: deja fuera a las que salieron del índice o desaparecieron', 'Eso: probar con los ganadores de hoy infla los resultados del pasado.'], ['Que el año 2000 queda demasiado cerca', 'El periodo no es el problema principal: lo es elegir las empresas mirando el presente.']], 1, 'Elegir los datos con información de hoy es hacer trampa sin querer.'),
      single('¿Qué es probar una regla «fuera de la muestra»?', ['Probarla con datos que no se usaron para diseñarla', 'Probarla en otro bróker', 'Probarla solo con los mejores años'], 0, 'Es la prueba de fuego: datos nuevos que la regla no ha «visto».'),
      single('¿Qué hicieron Sullivan, Timmermann y White (1999) con las reglas de medias móviles?', ['Corrigieron el sesgo de búsqueda de datos, y los resultados se debilitaron mucho', 'Demostraron que eran infalibles', 'Consiguieron que se prohibieran'], 0, 'Mucho de lo que parecía ventaja era en parte casualidad.'),
      timed(tf('Un buen backtest garantiza que la regla funcionará en el futuro.', false, 'Dice lo que habría pasado con esos datos. El futuro puede ser distinto.'), 10),
      chat(['He hecho un backtest y mi regla gana un 80 % al año 🤑', 'Sin comisiones, eso sí.'], '¿Qué le preguntas primero?', [['¿Cuándo empiezas a operar con todo?', 'Primero habría que ver si sobrevive a los costes y a datos nuevos.'], ['¿Cuántas variantes probaste, y qué pasa con costes y con datos que no hayas usado?', '¡Bien! Esas preguntas tumban la mayoría de backtests espectaculares.'], ['¿Me pasas la regla?', 'Antes de copiarla, conviene comprobar si ese 80 % es real o un espejismo del sobreajuste.']], 1, 'Variantes probadas, costes y datos fuera de la muestra: las tres preguntas de cualquier backtest.'),
      buckets('¿Trampa del backtest o prueba honesta?', ['Trampa', 'Prueba honesta'], [['Probar 500 variantes y enseñar solo la mejor', 0], ['Escribir la regla antes de mirar los resultados', 1], ['Calcular sin comisiones ni spread', 0], ['Probarla una sola vez con datos que no se usaron para diseñarla', 1], ['Usar solo las empresas que hoy siguen en el índice', 0]], 'Las trampas inflan el pasado: quedarse con la mejor de muchas, olvidar los costes o mirar solo a las supervivientes. Lo honesto es fijar la regla antes y probarla con datos nuevos.'),
      scenario('Tu regla gana un poco de media por operación antes de costes, y opera varias veces al día. ¿Qué compruebas antes de usarla?', [['Nada: si gana antes de costes, ganará siempre', 'Con muchas operaciones, la comisión y el spread pueden comerse toda la ventaja.'], ['Si la ventaja sobrevive a la comisión y el spread de cada operación', 'Eso: cuantas más operaciones, más pesan los costes. Una ventaja pequeña puede convertirse en pérdida.'], ['Si puede operar todavía más veces al día', 'Más operaciones multiplican los costes, no la ventaja.']], 1, 'Un backtest sin costes engaña. Con muchas operaciones, una ventaja pequeña puede desaparecer al pagar comisión y spread.'),
    ], { source: '9.10', minutes: 6, retire: [1, 2, 4, 6, 7, 8, 9] }),

    lesson('u23l4', '¿Funciona el análisis técnico?', [
      play({
        title: 'Operar sin ventaja',
        intro: '**1.000 personas** sin ninguna ventaja operan a cara o cruz, pagando **2 €** de comisión cada vez. Así se ve operar cuando el análisis no aporta nada.',
        widget: { kind: 'coinflip', traders: 1000, trades: 10, maxTrades: 300, fee: 2, stake: 100, win: 1 },
        predict: {
          prompt: 'Tras 200 operaciones cada uno, ¿cómo acaba la mayoría?',
          options: ['Mitad gana, mitad pierde: es una moneda', 'La mayoría pierde: las comisiones inclinan la moneda', 'Casi todos ganan si operan mucho'],
          answer: 1,
          why: 'Cada operación cuesta 2 €: tras 200, el resultado medio ronda los **−400 €** y acaba perdiendo el **59 %**.',
        },
        goal: { text: 'Llega a 200 operaciones cada uno.', when: [when('trades', '>=', 200)] },
        insight: 'Sin ventaja, el resultado medio es justo **lo que pagas en costes**. Unos pocos ganan mucho por suerte, no por saber.',
        lumi: [
          { when: when('avg', '<=', -300), say: 'Cada operación resta 2 € de media. Se nota, ¿verdad?', mood: 'WORRIED' },
          { when: when('trades', '>=', 50), say: 'Algunos ganan mucho: no por saber, sino por suerte.', mood: 'THINKING' },
          { say: 'Sube el número de operaciones', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Qué dice la evidencia?',
        intro: 'Entonces, ¿qué partes del análisis técnico superan las pruebas serias?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Con respaldo' }, { label: 'Sin evidencia rigurosa o sin valor tras costes' }],
          cards: [
            { icon: 'up', label: 'Momentum de 3–12 meses', bin: 0, why: 'Jegadeesh y Titman (1993): las tendencias de 3–12 meses han tendido a persistir.' },
            { icon: 'chart', label: 'Seguimiento de tendencia en muchos mercados', bin: 0, why: 'Hurst, Ooi y Pedersen lo estudiaron con datos desde 1880.' },
            { icon: 'candles', label: 'Patrones de velas', bin: 1, why: 'Sin valor demostrado tras costes.' },
            { icon: 'percent', label: 'Niveles de Fibonacci', bin: 1, why: 'Sin evidencia rigurosa.' },
            { icon: 'repeat', label: 'Ondas de Elliott', bin: 1, why: 'Sin evidencia rigurosa.' },
            { icon: 'star', label: 'Gann', bin: 1, why: 'Sin evidencia rigurosa.' },
          ],
        },
        goal: { text: 'Clasifica las seis herramientas.', when: [when('done', '==', 6)] },
        insight: 'La **tendencia** y el **momentum** son la parte con más respaldo, en acciones, bonos, divisas y materias primas, aunque aprovecharlos tras costes es difícil.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: lo que tiene respaldo habla de tendencias, no de formas ni números mágicos.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'Bien. Poco tiene respaldo, y eso ya es mucho saber.', mood: 'HAPPY' },
          { say: 'Clasifica cada herramienta', mood: 'HAPPY' },
        ],
      }),
      key('Por qué aprenderlo igualmente', 'Park e Irwin (2007) revisaron 95 estudios modernos: 56 positivos, 20 negativos y 19 mixtos… pero la mayoría con problemas de método, y los más recientes encuentran poca o ninguna ventaja en acciones. Aun así, entre un 30 y un 40 % de los profesionales encuestados lo considera importante a corto plazo.\n\nSirve para poner entradas, salidas y stops con lógica, entender lo que hacen otros y detectar a los vendedores de humo. Una ventaja pequeña con buena gestión del riesgo puede bastar; una grande sin ella acaba en ruina.', 'Tendencia y momentum tienen respaldo; muchas otras ideas no superan las pruebas.', 'En tu próxima compra del simulador, decide dónde te equivocas antes de entrar.'),
    ], [
      tf('El momentum es una de las anomalías más estudiadas de las finanzas, con datos de más de un siglo.', true, 'Hurst, Ooi y Pedersen lo estudiaron con datos desde 1880, aunque aprovecharlo tras costes es difícil.'),
      tf('Según Park e Irwin, los estudios positivos sobre análisis técnico no tienen problemas de método.', false, 'Advierten de que la mayoría sí los tiene: búsqueda de datos y dificultad para estimar el riesgo y los costes.'),
      tf('Hay evidencia rigurosa de que las ondas de Elliott predicen el mercado.', false, 'Ni las ondas de Elliott, ni Fibonacci, ni Gann tienen evidencia rigurosa.'),
      timed(tf('Hurst, Ooi y Pedersen estudiaron el seguimiento de tendencia con datos desde 1880.', true, 'Más de un siglo de datos, con caídas largas por el camino.'), 12),
      single('¿Qué idea del análisis técnico tiene más respaldo académico?', ['Las ondas de Elliott', 'El momentum y el seguimiento de tendencia', 'Los niveles de Fibonacci'], 1, 'Es la excepción con más evidencia, en muchos mercados y durante mucho tiempo.'),
      buckets('¿Qué dice la evidencia de cada herramienta?', ['Con respaldo', 'Sin evidencia rigurosa o sin valor tras costes'], [['Momentum de 3–12 meses', 0], ['Seguimiento de tendencia en muchos mercados', 0], ['Patrones de velas', 1], ['Fibonacci', 1], ['Ondas de Elliott', 1]], 'La tendencia y el momentum son la parte con más respaldo; el resto, como mucho, ayuda a organizar decisiones.'),
      scenario('Un canal de Telegram promete un sistema técnico que «gana el 95 % de las operaciones, sin pérdidas». ¿Qué piensas con lo aprendido?', [['Que por fin alguien lo ha descubierto', 'Ningún estudio serio encuentra algo parecido; un 95 % sin pérdidas es una señal clásica de humo o de estafa.'], ['Que es una promesa imposible: la evidencia habla de ventajas pequeñas, si las hay, y siempre con pérdidas', 'Eso: hasta lo que tiene respaldo, como el momentum, sufre caídas largas.'], ['Que lo pruebo con poco dinero, por si acaso', 'Probar «con poco» sigue siendo darle dinero y datos a quien promete lo imposible.']], 1, 'Las promesas de acierto casi perfecto chocan con toda la evidencia disponible.'),
      scenario('Ana usa el análisis técnico así: marca dónde se equivoca (stop), arriesga un 1 % por operación y no persigue «el patrón perfecto». ¿Qué opinas?', [['Que pierde el tiempo: sin el patrón perfecto no se gana', 'No existe el patrón perfecto; buscarlo es la trampa.'], ['Que lo usa de forma sensata: como herramienta para gestionar el riesgo, no como bola de cristal', 'Eso: el valor está en decidir dónde te equivocas y cuánto te cuesta.'], ['Que debería arriesgar un 20 % por operación para que valga la pena', 'Con un 20 % por operación, unas pocas pérdidas seguidas la sacan del juego.']], 1, 'Usado con humildad y gestión del riesgo, el análisis técnico es una herramienta útil.'),
      single('¿Qué necesita cualquier herramienta técnica para servir de algo?', ['Más indicadores', 'Gestión del riesgo', 'Apalancamiento'], 1, 'Una ventaja grande sin gestión del riesgo acaba en ruina; una pequeña con buena gestión puede bastar.'),
      upDown('Última prueba de humildad: 30 velas reales, sin nombre. ¿Sube o baja en las 10 sesiones siguientes?', 'ud-98', 'Después de toda la sección, la conclusión honesta es la misma: nadie acierta el corto plazo de forma fiable. Lo que sí controlas es cuánto arriesgas.'),
      chat(['Entonces… ¿el análisis técnico funciona o no? 🤔'], '¿Qué le contestas a Lumi?', [['Sí, siempre: con práctica se acierta todo', 'La evidencia no dice eso: muchas reglas dejan de funcionar con datos nuevos.'], ['Algunas ideas tienen respaldo (tendencia, momentum), muchas no, y nada funciona sin gestión del riesgo', '¡Exacto! Herramienta útil, no bola de cristal.'], ['No, es todo humo', 'Tampoco: tendencia y momentum tienen más de un siglo de evidencia, aunque sean difíciles de aprovechar.']], 1, 'Ni magia ni humo: algunas piezas funcionan a veces, y la gestión del riesgo funciona siempre.'),
    ], { source: '9.10', minutes: 6, retire: [0, 2, 3, 5, 10] }),
  ],
})
