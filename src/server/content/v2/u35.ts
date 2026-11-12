import 'server-only'
// Sección 13 · Unidad 35 · Retos con datos reales (docs/curso-v2/02-curriculo.md)
// Laboratorio de mercado: práctica pura con gráficos reales de docs/curso-v2/graficos.md (cada clase usa gráficos distintos).
// En «¿Sube o baja?» las explicaciones son neutrales: el resultado real lo revela el motor al responder.
import { candle, chart, chat, choose, fill, key, lesson, level, match, mission, multi, note, num, opt, order, play, point, portfolio, say, scenario, simTrade, single, story, tf, timed, trend, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u35', order: 35, title: 'Retos con datos reales', description: 'Predice, marca niveles y opera con gráficos reales para ver qué pasó de verdad',
  lessons: [
    lesson('u35l1', '¿Sube o baja? Acciones', [
      mission({
        title: '¿Sube o baja?',
        intro: '30 velas diarias reales de una acción. Decide si **10 sesiones después** el precio estaba más arriba o más abajo, y mira qué pasó.',
        widget: { kind: 'guess', rounds: ['ud-4', 'ud-113', 'ud-56', 'ud-63', 'ud-19'] },
        predict: {
          prompt: 'Si lanzaras una moneda en vez de mirar el gráfico, ¿cuántas acertarías de cada 10, de media?',
          options: ['Ninguna', 'Unas 5', 'Las 10'],
          answer: 1,
          why: 'Al azar se acierta **la mitad**, de media. Para saber si lo haces mejor que una moneda, hacen falta muchos intentos.',
        },
        goal: { text: 'Juega las cinco rondas.', when: [when('done', '==', 5)] },
        insight: 'A corto plazo el precio tiene mucho **ruido**: en dos semanas, una noticia lo cambia todo. **Lo que sí controlas es cuánto arriesgas.**',
        lumi: [
          { when: when('right', '>=', 4), say: '¡Muy bien! ¿Habilidad o suerte? Con cinco intentos, imposible saberlo.', mood: 'THINKING' },
          { when: when('done', '==', 5), say: 'Hecho. ¿Ha sido más fácil o más difícil de lo que creías?', mood: 'CALM' },
          { say: 'Mira la tendencia, dónde está el precio y el tamaño de las velas', mood: 'HAPPY' },
        ],
      }),
      story('Siete de diez', [{ id: 'leo', name: 'Leo' }], [
        say('leo', '¡He acertado 7 de 10 en el «¿sube o baja?»!'),
        say('leo', 'He encontrado mi método. Mañana meto mis ahorros.'),
        choose('¿Qué le dices?', [
          opt('¡Adelante! 7 de 10 es un método infalible', 'bad', say('lumi', 'Tirando una moneda, 7 de 10 o más sale un 17 % de las veces.')),
          opt('Con 10 intentos manda la suerte: necesitas muchos más', 'good', say('lumi', 'Eso. Hacen falta decenas o cientos de intentos para separar habilidad de suerte.')),
          opt('Prueba primero con la mitad de tus ahorros', 'ok', say('lumi', 'Menos riesgo, pero la misma prueba de 10 intentos: aún no dice nada.')),
        ]),
        say('lumi', 'Y ojo con la falacia del jugador: las sesiones no «se deben» nada.'),
      ]),
      key('Qué mirar antes de decidir', '• **Tendencia previa:** ¿máximos y mínimos crecientes o decrecientes?\n• **Dónde está el precio:** ¿cerca de máximos, de mínimos o en medio?\n• **Tamaño de las velas:** velas grandes = más volatilidad = más incertidumbre.\n\nNada de esto garantiza el resultado: en dos semanas, una noticia lo cambia todo. Apunta si aciertas en cada gráfico. Con pocos intentos, la suerte manda.', 'A corto plazo el precio tiene mucho de ruido: lo que sí controlas es cuánto arriesgas.', 'Pruébalo: pon una acción en Favoritos, predice si sube y compruébalo en dos semanas.'),
    ], [
      upDown('Mira las 30 velas. ¿El precio acabó más arriba o más abajo 10 sesiones después?', 'ud-1', 'En plazos de dos semanas, el resultado depende mucho de noticias que nadie ve venir. Por eso nadie serio opera sin stop: no porque espere fallar, sino porque sabe que puede fallar.'),
      upDown('Otra acción, otro momento. ¿Más arriba o más abajo dentro de 10 sesiones?', 'ud-131', 'Fíjate en el tamaño de las velas: cuanto más grandes, más incierto es el siguiente movimiento, en cualquier dirección. La volatilidad dice cuánto se mueve, no hacia dónde.'),
      trend('Sin adivinar el futuro: ¿qué tendencia tenía este precio?', 'trend-up-16', 'Alcista', 'Máximos y mínimos cada vez más altos: de unos 91 $ a unos 122 $. Leer la tendencia pasada es fácil; saber cuánto durará, no.'),
      upDown('Las últimas velas han sido intensas. ¿Más arriba o más abajo 10 sesiones después?', 'ud-15', 'Tras un movimiento fuerte, el cerebro tienta con dos ideas opuestas: «seguirá así» (sesgo de recencia) o «ya toca darse la vuelta» (falacia del jugador). Ninguna es fiable por sí sola.'),
      single('Llevas 7 aciertos de 10 en «¿Sube o baja?». ¿Qué conclusión es la más sensata?', ['He encontrado un método infalible', 'Con 10 intentos la suerte pesa mucho: necesito muchos más para saber si tengo ventaja', 'Ya puedo operar con dinero real'], 1, 'Lanzando una moneda 10 veces, sacar 7 caras o más pasa en torno al 17 % de las veces. Hacen falta decenas o cientos de intentos para separar habilidad de suerte.'),
      upDown('Acción europea, velas diarias. ¿Subió o bajó en las 10 sesiones siguientes?', 'ud-26', 'Cuando el precio está en mitad de su rango reciente, ni siquiera hay un nivel claro que vigilar ni un sitio lógico para el stop. En esos casos, no operar también es una decisión.'),
      timed(upDown('¡20 segundos! ¿Más arriba o más abajo 10 sesiones después?', 'ud-21', 'Has decidido con prisa, como quien opera mirando el móvil en el metro. Las decisiones rápidas tiran de intuición, y la intuición es justo donde viven los sesgos.'), 20),
      trend('¿Qué tendencia ves en este tramo?', 'trend-down-10', 'Bajista', 'Máximos y mínimos cada vez más bajos: de unos 173 € a unos 152 €. En una tendencia bajista, «ya está barata» no es un argumento: puede abaratarse más.'),
      tf('Si una acción ha subido 5 días seguidos, es más probable que baje el sexto.', false, 'Es la falacia del jugador: las sesiones no «se deben» nada entre sí. Una racha no hace más probable el cambio de dirección.'),
      upDown('Banco estadounidense, velas diarias. ¿Más arriba o más abajo 10 sesiones después?', 'ud-64', 'A un banco grande lo mueven los tipos de interés, la economía y sus resultados, no solo su gráfico. Mirar únicamente las velas deja fuera media historia.'),
      timed(upDown('¡Último, 20 segundos! ¿Más arriba o más abajo 10 sesiones después?', 'ud-60', 'Las grandes tecnológicas pueden moverse más de un 10 % en un solo día de resultados, hacia arriba o hacia abajo. Si tu operación coincide con esa fecha, el precio puede abrir con un hueco y saltarse tu stop.'), 20),
    ], { minutes: 6, retire: [4, 6, 9, 10] }),

    lesson('u35l2', '¿Sube o baja? Cripto', [
      mission({
        title: '¿Sube o baja? Cripto',
        intro: 'Velas diarias reales de bitcoin y ethereum: ¿**10 días después**, más arriba o más abajo? En cripto no hay cierre: cotiza **24 horas, 7 días**.',
        widget: { kind: 'guess', rounds: ['ud-144', 'ud-146', 'ud-142', 'ud-140'] },
        goal: { text: 'Juega las cuatro rondas.', when: [when('done', '==', 4)] },
        insight: 'El bitcoin tiene una volatilidad anual del **50–80 %**, frente al ~15 % de un índice mundial de acciones, y ha caído más de un 70 % desde máximos varias veces. No está regulado como un depósito: **puede perderse la totalidad de lo invertido**.',
        lumi: [
          { when: when('done', '==', 4), say: 'Las cuatro se movieron más de un 8 % en solo 10 días.', mood: 'THINKING' },
          { say: 'Mira el tamaño de las velas antes de decidir', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Más volátil, más pequeño',
        intro: 'Tienes **10.000 €** y arriesgas como mucho un **1 %** por operación: 100 €. En una acción tranquila el stop puede ir a un 3 %, pero en cripto el ruido obliga a alejarlo.',
        widget: { kind: 'position', account: 10000, riskPct: 1, stopPct: 3, entry: 50, maxRisk: 5, maxStop: 20 },
        predict: {
          prompt: 'Si alejas el stop del 3 % al 10 % arriesgando lo mismo, ¿cuánto puedes comprar?',
          options: ['Más', 'Lo mismo', 'Bastante menos'],
          answer: 2,
          why: 'Los mismos 100 € de riesgo: con el stop al 3 %, unos 3.333 €; al 10 %, solo **1.000 €**.',
        },
        goal: { text: 'Pon el stop al 10 %, típico de una cripto, con un 1 % de riesgo.', when: [when('stopPct', '==', 10), when('riskPct', '==', 1)] },
        insight: '**Cuanto más volátil es el activo, más lejos va el stop y más pequeña es la posición.** Así, aunque salte, pierdes lo mismo.',
        lumi: [
          { when: when('riskPct', '>=', 3), say: 'Con tanto riesgo, diez fallos seguidos dejan la cuenta muy tocada.', mood: 'WORRIED' },
          { when: when('stopPct', '>=', 10), say: 'Stop lejos, posición pequeña. Así un mal día no te hunde.', mood: 'HAPPY' },
          { say: 'Mueve la distancia del stop', mood: 'THINKING' },
        ],
      }),
      key('Lo que cuesta recuperarse', '• Si cae un **50 %**, tiene que subir un **+100 %** para volver al punto de partida.\n• Si cae un **80 %**, un **+400 %**: multiplicar por 5.\n\nEl bitcoin ha caído más de un 70 % desde máximos varias veces.', 'Las caídas grandes son muy difíciles de recuperar: en cripto, solo dinero que podrías perder entero.', 'Pruébalo: en Mercado, abre el bitcoin y mira cuánto se movió en la última semana.'),
    ], [
      upDown('Criptomoneda, velas diarias. ¿Más arriba o más abajo 10 días después?', 'ud-43', 'En cripto, 10 días son 10 sesiones completas sin pausa, fines de semana incluidos: hay más tiempo para que pase de todo. Moverse un 10 % en una semana no es raro.', 'los 10 días siguientes'),
      num('Una cripto cae un 75 % desde su máximo. ¿Cuánto tiene que subir después para volver a él?', 300, '%', 'De 100 pasa a 25. Para volver de 25 a 100 hay que multiplicar por 4: +300 %. Las caídas grandes son muy difíciles de recuperar.'),
      upDown('Otra criptomoneda. ¿Más arriba o más abajo 10 días después?', 'ud-150', 'Las grandes criptos suelen moverse en la misma dirección que el bitcoin, a menudo con más fuerza. Tener varias apenas reduce el riesgo: cuando cae una, suelen caer juntas.', 'los 10 días siguientes'),
      scenario('Bruno ve que una cripto ha subido un 40 % en una semana y en redes no se habla de otra cosa. Tiene 1.000 € apartados para el alquiler del mes que viene. ¿Qué hace?', [['Mete los 1.000 € antes de que suba más', 'Es el dinero del alquiler. Si cae un 30 % en pocos días, como ha pasado muchas veces, no puede pagar. FOMO de manual.'], ['No toca el alquiler; si quiere probar, usa solo dinero que podría perder entero', 'Bien: en cripto solo entra dinero cuya pérdida total no te cambie la vida.'], ['Pide un préstamo para meter más', 'Deuda para comprar el activo más volátil del mercado: si cae, sigue debiendo el dinero y ya no tiene la cripto.']], 1, 'El FOMO empuja a comprar después de una gran subida y con dinero que no toca. En cripto, solo dinero que puedas perder del todo.'),
      upDown('Velas diarias de una cripto que ha tenido semanas movidas. ¿Más arriba o más abajo 10 días después?', 'ud-45', 'Que una cripto «haya caído mucho» no la hace barata: no tiene beneficios ni dividendos con los que estimar un valor. Su precio depende de lo que otros estén dispuestos a pagar mañana.', 'los 10 días siguientes'),
      upDown('Diciembre de 2017: el bitcoin se ha multiplicado por más de 20 en un año y sale en todos los telediarios. ¿Qué hizo el precio en el año siguiente?', 'hist-btc-2017', 'Cuando un activo está en máximos y en todas las portadas, la sensación de seguridad es la mayor posible, pero ese optimismo ya está en el precio. Pregúntate siempre cuánto perderías si te equivocas, no solo cuánto podrías ganar.', 'hasta diciembre de 2018'),
      timed(upDown('¡20 segundos! ¿Más arriba o más abajo 10 días después?', 'ud-42', 'Con prisa y un gráfico tan nervioso, es fácil ver patrones que no existen: el cerebro busca orden incluso en el azar.', 'los 10 días siguientes'), 20),
      num('Tienes 10.000 € y arriesgas como máximo un 1 % por operación. Compras una cripto con el stop un 10 % por debajo de la entrada. ¿Cuánto puedes invertir como máximo?', 1000, '€', 'El 1 % de 10.000 € son 100 €. Si el stop está a un 10 %, 100 ÷ 0,10 = 1.000 €. Cuanto más volátil es el activo, más lejos va el stop y más pequeña es la posición.'),
      tf('Si tu cartera tiene dos criptomonedas distintas, ya está bien diversificada.', false, 'Las grandes criptos suelen moverse juntas. Diversificar es combinar activos distintos (acciones, bonos, liquidez…), no dos fichas del mismo juego.'),
      upDown('Vuelve la primera cripto, en otro momento. ¿Más arriba o más abajo 10 días después?', 'ud-44', 'En cripto el sábado por la noche también se puede desplomar o disparar el precio. Por eso muchos dejan órdenes stop puestas en lugar de vigilar la pantalla a todas horas.', 'los 10 días siguientes'),
      timed(upDown('¡Rápido! Velas diarias de una cripto. ¿Más arriba o más abajo 10 días después?', 'ud-72', 'Decidir por corazonada es lo habitual en cripto. En un activo tan volátil, una corazonada equivocada sin stop puede costar muy cara.', 'los 10 días siguientes'), 20),
    ], { minutes: 6, retire: [0, 1, 4, 6, 7, 10] }),

    lesson('u35l3', '¿Sube o baja? Divisas y oro', [
      play({
        title: 'Oro en dólares, ganancias en euros',
        intro: 'Compras **1.000 €** de oro desde España y el oro sube un 10 %. ¿Has ganado un 10 %? El oro **cotiza en dólares**: también cuenta lo que hace el dólar frente al euro.',
        widget: { kind: 'fx', amount: 1000, asset: 10, fx: 0, maxAsset: 30, maxFx: 20, currency: 'dólar' },
        predict: {
          prompt: 'El oro sube un 10 % en dólares, pero el dólar cae un 10 % frente al euro. ¿Qué ganas en euros?',
          options: ['Un 10 %', 'Más o menos nada', 'Un 20 %'],
          answer: 1,
          why: '1,10 × 0,90 = 0,99: **un −1 %**. Lo que gana el oro se lo come la divisa.',
        },
        goal: { text: 'Busca un caso en que el oro suba en dólares y tú pierdas en euros.', when: [when('asset', '>', 0), when('eurPct', '<', 0)] },
        insight: 'En euros cuentan el activo **y la divisa**. Y lo que más mueve las divisas son los **tipos de interés** y las sorpresas económicas de cada país.',
        lumi: [
          { when: when('eurPct', '<', 0), say: 'En euros, pierdes. Mira qué ha hecho el dólar.', mood: 'THINKING' },
          { say: 'Mueve el oro y el dólar', mood: 'HAPPY' },
        ],
      }),
      mission({
        title: '¿Sube o baja? Divisas y metales',
        intro: 'Velas diarias reales de divisas, oro y plata: ¿**10 sesiones después**, más arriba o más abajo? Mira bien la escala.',
        widget: { kind: 'guess', rounds: ['ud-47', 'ud-161', 'ud-48', 'ud-162', 'ud-97'] },
        goal: { text: 'Juega las cinco rondas.', when: [when('done', '==', 5)] },
        insight: 'Las divisas grandes se mueven poco: **un 2 % en dos semanas ya es mucho**. Los metales, bastante más: al oro lo mueven los tipos, el dólar y el miedo, y nada de eso se ve en 30 velas.',
        lumi: [
          { when: when('done', '==', 5), say: 'Divisas: menos de un 2 %. Oro y plata: más de un 9 %.', mood: 'THINKING' },
          { say: 'Fíjate en la escala del eje antes de decidir', mood: 'HAPPY' },
        ],
      }),
      key('El oro, refugio con matices', 'Un par como **EUR/USD** dice cuántos dólares vale un euro: si pasa de 1,10 a 1,12, el euro se ha apreciado frente al dólar.\n\nEl oro no paga intereses ni dividendos. Se suele buscar en las crisis y frente a la inflación, pero puede pasar años sin subir: de 1980 a 2000 perdió mucho valor real.\n\nEn divisas, mira bien la escala del eje: un 1 % ya es mucho.', 'Refugio no significa que siempre suba: significa que mucha gente lo busca cuando tiene miedo.', 'Pruébalo: en Mercado, abre el EUR/USD y mira cuánto se ha movido en un mes.'),
    ], [
      single('El EUR/USD pasa de 1,08 a 1,12. ¿Qué ha pasado?', ['El euro se ha apreciado frente al dólar', 'El dólar se ha apreciado frente al euro', 'Los dos han perdido el mismo valor'], 0, 'EUR/USD = dólares que cuesta un euro. Si hacen falta más dólares para comprar un euro, el euro vale más.'),
      upDown('Par de divisas, velas diarias. ¿Más arriba o más abajo 10 sesiones después?', 'ud-157', 'Fíjate en la escala: en divisas, lo que parece un desplome puede ser un 1 %. Por eso en forex se ofrece tanto apalancamiento… y por eso tanta gente pierde con él.'),
      num('El EUR/USD sube de 1,10 a 1,122. ¿Cuánto ha subido, en porcentaje?', 2, '%', '(1,122 − 1,10) ÷ 1,10 = 0,02 → 2 %. En una divisa principal, un 2 % en pocas semanas es un movimiento grande.'),
      upDown('Metal precioso, velas diarias. ¿Subió o bajó en las 10 sesiones siguientes?', 'ud-50', 'El oro no tiene beneficios que valorar: lo mueven los tipos de interés, el dólar y el miedo. Ninguno de los tres se ve en un gráfico de 30 velas.'),
      trend('Mira este tramo de la plata. ¿Qué tendencia tenía?', 'trend-up-22', 'Alcista', 'De unos 45 $ a unos 60 $ en dos meses, con máximos y mínimos crecientes: una tendencia alcista de libro.'),
      upDown('Otro par de divisas. ¿Más arriba o más abajo 10 sesiones después?', 'ud-154', 'El yen se ha usado como refugio en momentos de miedo, y los tipos de Japón han estado durante años muy por debajo de los de EE. UU. Esa diferencia de tipos mueve el par más que cualquier vela.'),
      single('A medio plazo, ¿qué suele mover más una divisa principal?', ['Los tipos de interés y las sorpresas económicas de su país', 'Los patrones de velas de la última semana', 'Lo que comentan los influencers de forex'], 0, 'Si un banco central sube tipos más de lo esperado, su moneda suele atraer dinero. Las velas reflejan esos cambios; no los causan.'),
      timed(upDown('¡20 segundos! Divisas, velas diarias. ¿Más arriba o más abajo 10 sesiones después?', 'ud-96', 'Movimientos de un 1–3 % parecen pequeños, pero con apalancamiento se convierten en ganancias o pérdidas enormes. Sin él, apenas los notarías en tu cartera.'), 20),
      upDown('Otro metal, velas diarias. ¿Subió o bajó en las 10 sesiones siguientes?', 'ud-92', 'La plata se parece al oro, pero es bastante más volátil porque también tiene mucho uso industrial. Dos activos «parecidos» pueden tener riesgos muy distintos.'),
      upDown('Vuelve el EUR/USD, en otra época. ¿Más arriba o más abajo 10 sesiones después?', 'ud-49', 'Fíjate en las mechas: en divisas, un dato de empleo o de inflación de EE. UU. provoca picos en minutos. Una sola vela no cuenta toda la historia.'),
      timed(single('Rápido: si el USD/JPY sube, ¿qué moneda se ha fortalecido?', ['El dólar', 'El yen', 'El euro'], 0, 'USD/JPY = yenes que cuesta un dólar. Si sube, cada dólar compra más yenes: el dólar se ha fortalecido.'), 12),
    ], { minutes: 6, retire: [2, 7, 8, 9, 10] }),

    lesson('u35l4', 'Encuentra la vela', [
      chart('hammer-4', 'Calienta: toca el martillo (cuerpo pequeño arriba y mecha inferior larga, después de una caída).', '¡Ese es! Los vendedores empujaron el precio abajo y los compradores lo devolvieron arriba.', 'Busca la vela con la mecha de abajo mucho más larga que su cuerpo.'),
      chart('bear-engulfing-4', 'Ahora toca la vela que completa la envolvente bajista: un cuerpo rojo que se come el verde anterior, tras una subida.', '¡Esa! Los vendedores borraron de golpe todo lo del día anterior.', 'Busca una vela roja cuyo cuerpo cubra por completo el cuerpo verde de antes.'),
      play({
        title: '¿Qué cuenta cada vela?',
        intro: 'Cada patrón sugiere algo **según dónde aparece**. ¿Apunta a un posible giro al alza, a la baja o a indecisión?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Posible giro al alza' }, { label: 'Posible giro a la baja' }, { label: 'Indecisión' }],
          cards: [
            { icon: 'candles', label: 'Martillo tras una caída', bin: 0, why: 'Mecha inferior larga: los compradores rechazaron los precios bajos.' },
            { icon: 'candles', label: 'Estrella fugaz tras una subida', bin: 1, why: 'Mecha superior larga: los vendedores devolvieron el precio abajo.' },
            { icon: 'candles', label: 'Doji: apertura casi igual al cierre', bin: 2, why: 'Nadie ganó la sesión. Espera a la vela siguiente.' },
            { icon: 'candles', label: 'Envolvente alcista tras una caída', bin: 0, why: 'Un cuerpo verde se come el rojo anterior.' },
            { icon: 'candles', label: 'La forma de un martillo, pero tras una subida', bin: 1, why: 'Es el hombre colgado: la forma es igual; el contexto, no.' },
            { icon: 'candles', label: 'Estrella de la mañana: roja grande, pequeña y verde fuerte', bin: 0, why: 'Tres velas que cuentan que los compradores toman el mando.' },
            { icon: 'candles', label: 'Envolvente bajista tras una subida', bin: 1, why: 'Un cuerpo rojo se come el verde anterior.' },
          ],
        },
        goal: { text: 'Clasifica los siete patrones.', when: [when('done', '==', 7)] },
        insight: '**Un patrón es una pista, no una orden**: muchos fallan. Se confirma con el contexto y la vela siguiente, y siempre con un stop.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Primero mira de dónde viene el precio: ¿subía o bajaba?', mood: 'THINKING' },
          { say: 'Clasifica cada patrón', mood: 'HAPPY' },
        ],
      }),
      key('Chuleta de patrones', '• **Martillo:** mecha inferior larga tras una caída.\n• **Estrella fugaz:** mecha superior larga tras una subida.\n• **Doji:** apertura ≈ cierre.\n• **Envolvente:** un cuerpo se come el anterior, en sentido contrario.\n• **Marubozu:** cuerpo largo sin apenas mechas.\n• **Estrella de la mañana:** roja grande, pequeña y verde fuerte.\n\nAntes de buscar la vela, mira de dónde viene el precio.', 'Un patrón es una pista, no una orden: confírmalo con el contexto.', 'Pruébalo: abre una acción en velas diarias y busca un martillo tras una caída.'),
    ], [
      candle('Toca el martillo.', 'hammer-5', 'Cuerpo pequeño en la parte alta y una mecha inferior de al menos el doble del cuerpo, tras varias velas a la baja.'),
      candle('Toca la estrella fugaz.', 'shooting-star-4', 'Mecha superior larga y cuerpo pequeño abajo, después de subir: los compradores lo intentaron y los vendedores devolvieron el precio abajo.'),
      match('Empareja cada vela con lo que cuenta.', [['Marubozu', 'Un bando dominó toda la sesión'], ['Doji', 'Empate: nadie ganó'], ['Martillo', 'Rechazo de los precios bajos'], ['Estrella fugaz', 'Rechazo de los precios altos']], 'Cada vela resume una batalla entre compradores y vendedores: el cuerpo dice quién ganó y las mechas, hasta dónde llegó el otro bando.'),
      candle('Toca el doji.', 'doji-4', 'Apertura y cierre casi iguales, con mechas a ambos lados: indecisión. Espera a la vela siguiente antes de sacar conclusiones.'),
      candle('Toca la vela que completa la envolvente alcista.', 'bull-engulfing-4', 'Una vela verde cuyo cuerpo envuelve por completo el cuerpo rojo anterior, después de una caída.'),
      timed(candle('¡15 segundos! Toca el martillo.', 'hammer-3', 'Mecha inferior muy larga tras una caída: el mercado rechazó los precios bajos ese día.'), 15),
      candle('Toca la vela que completa la envolvente bajista.', 'bear-engulfing-2', 'Una vela roja cuyo cuerpo se come el verde anterior, después de una subida.'),
      tf('Un martillo garantiza que el precio va a subir.', false, 'Es una pista de posible giro, no una garantía: muchos patrones fallan. Por eso se espera a la vela siguiente y se pone un stop bajo la mecha.'),
      candle('Toca el marubozu.', 'marubozu-4', 'Cuerpo verde largo, casi sin mechas: los compradores mandaron de principio a fin de la sesión.'),
      candle('Toca la tercera vela de la estrella de la mañana.', 'morning-star-4', 'Primero una roja grande, luego una pequeña de duda y por último una verde fuerte que cierra por encima de la mitad de la primera.'),
      single('Una vela con la misma forma que un martillo, pero que aparece después de una subida, se llama…', ['Hombre colgado', 'Estrella fugaz', 'Doji'], 0, 'La forma es igual; lo que cambia es el contexto. Tras una caída es martillo; tras una subida, hombre colgado.'),
      timed(candle('¡15 segundos! Toca la estrella fugaz.', 'shooting-star-2', 'Mecha superior larga tras subir: los vendedores devolvieron el precio abajo antes del cierre.'), 15),
    ], { minutes: 6, retire: [5, 6, 10, 11] }),

    lesson('u35l5', 'Marca el soporte', [
      mission({
        title: 'Opera con el soporte',
        intro: 'Velas reales: el precio tiene un **soporte** un 3 % por debajo de tu entrada y una **resistencia** un 7,5 % por encima. Coloca tu stop y tu objetivo.',
        widget: { kind: 'orders', chart: 'lvl-57', stopPct: 1, takePct: 2, maxPct: 12 },
        goal: { text: 'Pon el stop por debajo del soporte y el objetivo cerca de la resistencia. Luego, mira qué pasó.', when: [when('stopPct', '>=', 3.5), when('takePct', '>=', 7), when('takePct', '<=', 8.5), when('played', '==', 1)] },
        insight: 'Un **soporte** es una zona donde el precio dejó de caer varias veces (aparecen compradores); una **resistencia**, donde dejó de subir. **Dan un sitio lógico al stop y al objetivo**, aunque nada asegura que se respeten.',
        lumi: [
          { when: when('stopPct', '<', 3), say: 'Tu stop está por encima del soporte: el ruido puede hacerlo saltar.', mood: 'WORRIED' },
          { when: when('hit', '==', 1), say: 'Saltó el stop: esta vez el soporte no aguantó. Has perdido lo previsto, no más.', mood: 'CALM' },
          { when: when('hit', '==', 2), say: '¡Objetivo! Esta vez el soporte aguantó.', mood: 'CELEBRATE' },
          { say: 'Busca el suelo en el gráfico y pon el stop debajo', mood: 'HAPPY' },
        ],
      }),
      story('¿Soporte roto?', [{ id: 'nuria', name: 'Nuria' }], [
        say('nuria', 'Mi acción lleva meses rebotando en el mismo suelo.'),
        say('nuria', 'Hoy ha cerrado un pelín por debajo. ¡Soporte roto! Lo vendo todo.'),
        choose('¿Qué le dices?', [
          opt('Sí, vende antes de que se hunda', 'ok', say('lumi', 'Puede ser. Pero muchas roturas son falsas: cruzan unos días y vuelven.')),
          opt('Espera a ver si cierra varias sesiones por debajo, con volumen', 'good', say('lumi', 'Bien. Así se filtran muchas roturas falsas.')),
          opt('Compra más: ahora está más barata', 'bad', say('lumi', 'Si el soporte se rompe de verdad, «más barata» puede abaratarse mucho más.')),
        ]),
        note('Dos días después, el precio vuelve dentro del rango.'),
        say('lumi', 'Una **falsa rotura**. Por eso los soportes son **zonas**, no líneas.'),
        say('lumi', 'Y si se rompen de verdad, cambian de papel: la resistencia rota pasa a soporte.'),
      ]),
      key('Cómo encontrarlos', 'Busca los mínimos y máximos que más destacan y mira si el precio ha vuelto a ellos. Cuantas más veces se respeta un nivel, más gente lo vigila. Pero muchas roturas son **falsas**: el precio cruza unos días y vuelve dentro. Dibuja zonas anchas, no líneas finas: el mercado no usa regla.', 'Un soporte es donde aparecieron compradores antes; nada asegura que vuelvan.', 'Pruébalo: marca un soporte en el gráfico de una acción y pon una alerta ahí.'),
    ], [
      point('Rango lateral. Toca el punto más bajo: el suelo que vigilan los compradores.', 'trend-flat-17', 'min', 'Unos 303 $: el mínimo del rango marca el soporte. Si el precio vuelve ahí, mucha gente mirará si aguanta.'),
      point('Ahora el techo: toca el punto más alto de este rango.', 'trend-flat-15', 'max', 'Unos 153 $: ahí se frenaron las subidas. Es la resistencia del rango.'),
      fill('Una zona donde el precio ha dejado de caer varias veces se llama ____.', 'soporte', ['resistencia', 'tendencia', 'hueco'], 'En el soporte aparecen compradores; en la resistencia, vendedores.'),
      upDown('Índice bursátil, velas diarias. Mira dónde está el precio respecto a sus mínimos recientes. ¿Más arriba o más abajo 10 sesiones después?', 'ud-174', 'Estar cerca de un soporte no garantiza un rebote: puede aguantar o romperse. Lo que sí te da es un sitio lógico para el stop si te equivocas.'),
      point('Tendencia bajista. Toca el mínimo: el nivel que los compradores tendrán que defender.', 'trend-down-16', 'min', 'Unos 84 $: tras ese mínimo hubo un rebote. Un mínimo así se convierte en referencia para el futuro.'),
      tf('Cuando una resistencia se rompe con claridad, suele convertirse en soporte.', true, 'Es el cambio de papel: quien no compró antes lo ve como segunda oportunidad. Muchas veces el precio vuelve a «probar» el nivel antes de seguir.'),
      timed(point('¡15 segundos! Toca el punto más alto.', 'trend-up-2', 'max', 'Unos 504 $: el último máximo de una tendencia alcista es la resistencia que el precio tendrá que superar.'), 15),
      upDown('Otro índice. ¿Ves algún suelo claro cerca del precio actual? Decide: ¿más arriba o más abajo 10 sesiones después?', 'ud-176', 'Si no hay un soporte claro cerca, el stop tendría que ir lejos y la operación tendría peor relación beneficio/riesgo. A veces lo mejor es no operar.'),
      point('Rango lateral con una caída que no duró. Toca el mínimo.', 'trend-flat-14', 'min', 'Unos 336 $: el precio perdió el rango unos días y volvió dentro. Eso es una falsa rotura, y por eso los soportes son zonas, no líneas.'),
      single('El precio rompe un soporte, pasa dos días por debajo y vuelve dentro del rango. ¿Qué ha sido?', ['Una falsa rotura', 'Un cambio de tendencia confirmado', 'Un cruce dorado'], 0, 'Muchas roturas fallan. Para filtrarlas, se mira si la rotura llega con volumen y si el precio cierra varias sesiones al otro lado.'),
      timed(upDown('¡20 segundos! ¿Más arriba o más abajo 10 sesiones después?', 'ud-34', 'Con prisa solo se miran las últimas velas. Localizar los suelos y techos anteriores te da contexto… aunque tampoco adivina el futuro.'), 20),
    ], { minutes: 6, retire: [5, 6, 9, 10] }),

    lesson('u35l6', 'Coloca tu stop', [
      mission({
        title: 'Coloca tu stop',
        intro: 'Velas reales: has comprado al último precio y el último mínimo relevante está **un 1,6 %** por debajo. ¿Dónde pones el stop y el objetivo?',
        widget: { kind: 'orders', chart: 'lvl-14', stopPct: 1, takePct: 2, maxPct: 12 },
        goal: { text: 'Stop por debajo del mínimo, con margen, y un objetivo de al menos el doble. Luego, mira qué pasó.', when: [when('stopPct', '>=', 2.5), when('rr', '>=', 2), when('played', '==', 1)] },
        insight: 'El stop va **donde tu idea deja de tener sentido**: justo por debajo del último mínimo relevante, con margen para el ruido. El objetivo, cerca del máximo anterior: muchos no entran por debajo de **2:1**.',
        lumi: [
          { when: when('hit', '==', 1), say: 'Saltó el stop. ¿Estaba demasiado pegado al mínimo?', mood: 'SAD' },
          { when: when('hit', '==', 2), say: '¡Objetivo! El stop con margen aguantó el ruido.', mood: 'CELEBRATE' },
          { when: when('rr', '<', 2), say: 'Tu objetivo no llega al doble del riesgo. ¿Compensa?', mood: 'THINKING' },
          { say: 'Coloca el stop y el objetivo', mood: 'HAPPY' },
        ],
      }),
      story('El precio se acerca al stop', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Compré con el stop bajo el último mínimo. Y ahora el precio baja…'),
        say('laura', 'Está a punto de tocarlo. ¿Lo bajo un poco para darle aire?'),
        choose('¿Qué le dices?', [
          opt('Sí, bájalo: seguro que rebota', 'bad', say('lumi', 'Así una pérdida pequeña y prevista se hace grande. Es el efecto disposición.')),
          opt('Déjalo: era el punto en el que tu idea fallaba', 'good', say('lumi', 'Eso. Si salta, pierdes lo previsto y pasas a la siguiente.')),
          opt('Compra más para bajar el precio medio', 'bad', say('lumi', 'Doblas la apuesta en una idea que el mercado desmiente.')),
        ]),
        say('lumi', 'El stop se decide en frío, antes de entrar. Nunca lo muevas en contra.'),
      ]),
      key('Primero el stop, después el tamaño', 'Tamaño = (capital × % de riesgo) ÷ (entrada − stop).\n\nCon 10.000 € y un 1 % de riesgo arriesgas 100 €. Entrada a 50 € y stop a 47 €: 100 ÷ 3 = **33 acciones** (unos 1.650 €).\n\nUn stop muy pegado salta con el ruido normal; uno muy lejos te obliga a comprar muy poco.', 'No decides cuánto compras: lo decide la distancia a tu stop.', 'Pruébalo: en tu próxima compra del simulador, pon el stop bajo el último mínimo.'),
    ], [
      trend('Antes de comprar, mira la tendencia. ¿Cuál es?', 'trend-up-18', 'Alcista', 'Máximos y mínimos crecientes: de unos 225 $ a máximos de unos 266 $. Comprar a favor de la tendencia y poner el stop bajo el último mínimo es el planteamiento clásico.'),
      level('Has comprado al último precio. Coloca tu stop loss donde tu idea deja de ser válida.', 'lvl-45', 'STOP', 'Justo por debajo del último mínimo relevante (unos 264 $), con un pequeño margen. Si el precio pierde ese suelo, la tendencia que buscabas ya no está.'),
      level('Ahora el objetivo: coloca tu take profit.', 'lvl-48', 'TAKE', 'Cerca del máximo anterior (unos 8,90 €): ahí aparecieron vendedores la última vez. Apuntar mucho más arriba es esperar algo que el precio aún no ha hecho.'),
      num('Entrada a 40 €, stop a 38 € y objetivo a 46 €. ¿Cuántas veces es mayor el beneficio potencial que el riesgo?', 3, 'veces', 'Riesgo: 40 − 38 = 2 €. Beneficio potencial: 46 − 40 = 6 €. 6 ÷ 2 = 3, una relación 3:1.'),
      level('Coloca el stop de esta compra.', 'lvl-50', 'STOP', 'Por debajo del mínimo reciente (unos 39 €). Ni pegado al precio, porque el ruido lo haría saltar, ni tan lejos que la pérdida se dispare.'),
      num('Tienes 10.000 € y arriesgas un 1 %. Entras a 80 € con el stop a 76 €. ¿Cuántas acciones compras?', 25, 'acciones', 'El 1 % son 100 €. Distancia al stop: 4 €. 100 ÷ 4 = 25 acciones (2.000 € invertidos).'),
      simTrade('Tienes 10.000 € y arriesgas como mucho un 1 %. Coloca el stop y elige el importe.', 'lvl-46', 'Primero el stop bajo el último mínimo; después el importe, para que si salta pierdas como mucho 100 €. El resultado depende del mercado; el riesgo, de ti.'),
      timed(single('¡Rápido! En una compra, ¿dónde va el stop?', ['Justo por debajo del último mínimo relevante', 'Justo por encima del precio de entrada', 'Donde la pérdida sea un número redondo de euros'], 0, 'El stop va donde tu idea deja de ser válida. Si estuviera por encima de la entrada, saltaría al momento.'), 12),
      level('Coloca el objetivo de esta operación.', 'lvl-43', 'TAKE', 'Cerca del máximo anterior (unos 172 $). Si el precio lo supera con fuerza, siempre puedes subir el stop y dejar correr la ganancia.'),
      scenario('Laura compra con el stop bajo el último mínimo. El precio baja y se acerca peligrosamente al stop. ¿Qué hace?', [['Baja el stop para darle «más aire»', 'Así una pérdida pequeña y prevista se convierte en una grande. Es el efecto disposición: aguantar lo que pierde.'], ['Lo deja donde estaba: era el punto en el que su idea fallaba', 'Bien: si salta, pierde lo previsto y pasa a la siguiente con la cuenta intacta.'], ['Compra más para bajar el precio medio', 'Dobla la apuesta en una idea que el mercado está desmintiendo. Su riesgo ya no es el 1 %.']], 1, 'El stop se decide con la cabeza fría, antes de entrar. Moverlo en contra por miedo a perder es uno de los errores más caros.'),
      simTrade('Otra operación: 5.000 € de capital y un riesgo máximo del 1 %.', 'lvl-14', 'Con 5.000 € y un 1 %, como mucho puedes perder 50 €. El importe invertido puede ser bastante mayor que el riesgo: lo que manda es la distancia al stop.', { cash: 5000, maxRiskPct: 1 }),
    ], { minutes: 6, retire: [3, 5, 7, 9, 10] }),

    lesson('u35l7', 'Noticias y reacciones', [
      story('Beneficios récord', [{ id: 'marta', name: 'Marta' }], [
        say('marta', '¡Mi empresa ha presentado beneficios récord!'),
        say('marta', 'Y su acción cae un 8 %. ¿Qué broma es esta?'),
        choose('¿Qué ha pasado?', [
          opt('El mercado esperaba aún más', 'good', say('lumi', 'Eso. El precio ya incluía lo esperado, y un récord también puede decepcionar.')),
          opt('Alguien se ha equivocado al publicar el precio', 'bad', say('lumi', 'No hay error: el mercado compara con lo que esperaba.')),
          opt('Los récords siempre hacen caer la acción', 'ok', say('lumi', 'No hay regla fija: depende de lo que esperaba el mercado.')),
        ]),
        say('lumi', 'Cuando tú lees el titular, miles de personas y algoritmos ya han reaccionado.'),
      ]),
      play({
        title: '¿Noticia o sorpresa?',
        intro: 'El precio se mueve por **la sorpresa**, no por la noticia. ¿Esto ya lo sabía el mercado o le pilla por sorpresa?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Ya estaba en el precio' }, { label: 'Sorpresa: puede mover el precio' }],
          cards: [
            { icon: 'news', label: 'Beneficios récord, justo lo que esperaban los analistas', bin: 0, why: 'Si pasa lo esperado, ya estaba dentro del precio.' },
            { icon: 'bank', label: 'El banco central sube los tipos más de lo esperado', bin: 1, why: 'Lo inesperado es lo que mueve el precio.' },
            { icon: 'phone', label: 'La presentación del nuevo móvil, anunciada hace semanas', bin: 0, why: 'Todo el mundo la conocía antes que tú.' },
            { icon: 'percent', label: 'Inflación del 3,4 % cuando se esperaba un 3 %', bin: 1, why: 'Un dato peor de lo esperado suele pesar a corto plazo.' },
            { icon: 'calendar', label: 'Una empresa entra en un índice, anunciado semanas antes', bin: 0, why: 'Una compra obligada y anunciada suele moverse antes del día señalado.' },
            { icon: 'alert', label: 'Se descubre por sorpresa un fraude contable', bin: 1, why: 'Nadie lo esperaba: el precio se ajusta de golpe.' },
          ],
        },
        goal: { text: 'Clasifica los seis titulares.', when: [when('done', '==', 6)] },
        insight: '**En bolsa, una buena noticia que ya se esperaba no es noticia.** Antes de reaccionar, pregúntate qué esperaba el mercado.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pregúntate: ¿esto lo sabía ya todo el mundo?', mood: 'THINKING' },
          { say: 'Clasifica cada titular', mood: 'HAPPY' },
        ],
      }),
      key('Qué hacer ante un titular', '• Pregúntate qué **esperaba** el mercado, no si la noticia es buena o mala.\n• No operes en los primeros minutos: el precio salta y el *spread* se abre.\n• Si ya tienes una posición, que decida tu stop, no el pánico.', 'En bolsa, una buena noticia que ya se esperaba no es noticia.', 'Pruébalo: ante un titular, abre el activo en Mercado y mira si ya se movió.'),
    ], [
      single('Una empresa presenta beneficios récord y su acción cae un 8 %. ¿Cuál es la explicación más probable?', ['El mercado esperaba aún más', 'Los beneficios récord siempre hacen caer la acción', 'Alguien se ha equivocado al publicar el precio'], 0, 'El precio ya incorpora lo esperado. Si el consenso esperaba más, un récord puede ser una decepción.'),
      // RED-11: el laboratorio usa episodios que el alumno no ha visto. Meta: ingresos a la baja por primera vez en el 2.º trimestre de 2022; cifras del gráfico
      upDown('Octubre de 2022: Meta (Facebook) ha perdido tres cuartas partes de su valor en un año, sus ingresos caen por primera vez y gasta miles de millones en el metaverso. ¿Qué hizo la acción después?', 'hist-meta-2022', 'La bolsa se mueve por lo que espera del futuro, no por los titulares de hoy. Ante noticias terribles, la pregunta clave es si lo que viene será peor o mejor de lo que el precio ya refleja.', 'hasta octubre de 2023'),
      scenario('Pablo lee en el móvil: «La Reserva Federal sube los tipos más de lo esperado». El índice cae un 2 % en minutos y Pablo tiene una posición abierta con su stop puesto. ¿Qué hace?', [['Vende todo a mercado ya, antes de que caiga más', 'Vende en el peor momento, con el spread abierto y el precio saltando. Si luego rebota, se queda fuera.'], ['Deja trabajar su plan: el stop ya marca cuánto está dispuesto a perder', 'Bien: el stop se decidió con la cabeza fría. Si salta, pierde lo previsto; si no, sigue su plan.'], ['Compra más porque «seguro que rebota»', 'Aumenta el riesgo en plena tormenta por una corazonada. Eso ya no es un plan.']], 1, 'En los minutos tras una noticia, el precio se mueve a saltos y los costes suben. Las decisiones tomadas antes, con calma, suelen ser mejores.'),
      // Netflix: −35,1 % el 20-4-2022 (Yahoo Finance, cierres diarios), tras anunciar su primera pérdida de suscriptores en más de diez años
      upDown('Abril de 2022: Netflix anuncia que ha perdido suscriptores por primera vez en más de diez años y su acción cae un 35 % en un solo día. ¿Qué hizo después?', 'hist-nflx-2022', 'Los titulares extremos describen el momento; no dicen qué viene después. Un año más tarde, la acción estaba un 53 % por encima.', 'hasta abril de 2023'),
      timed(tf('Si una noticia es buena para una empresa, su acción siempre sube ese día.', false, 'Depende de lo que se esperaba: una buena noticia ya descontada puede venir con caídas.'), 10),
      scenario('Marta lee en un foro que una empresa «va a ser comprada seguro». La acción ya ha subido un 25 % en tres días. ¿Qué hace?', [['Compra ya: si se confirma, subirá más', 'Si el rumor ya ha subido el precio un 25 %, buena parte está descontada. Y si se desmiente, la caída puede ser brusca.'], ['Desconfía: el rumor ya está en el precio y no sabe quién lo difunde ni por qué', 'Bien: «compra con el rumor, vende con la noticia» existe por algo, y los foros son terreno de manipulaciones.'], ['Se pone corta porque «seguro que es mentira»', 'Otra apuesta a ciegas, ahora con pérdida potencial ilimitada si la compra se confirma.']], 1, 'Un rumor que ya ha movido el precio ofrece poco margen y mucho riesgo. Y quien lo difunde puede tener interés en que compres.'),
      upDown('Enero de 2022: la inflación en EE. UU. ronda el 7 % y la Reserva Federal avisa de que empezará a subir los tipos. ¿Qué hizo después un ETF de bonos del Tesoro estadounidense a más de 20 años?', 'hist-rates-2022', 'Los bonos a largo plazo son muy sensibles a los tipos: su «duración» es alta. Lo difícil no es saber si la noticia es buena o mala, sino cuánto la había descontado ya el precio.', 'hasta octubre de 2023'),
      multi('¿Qué conviene preguntarse antes de reaccionar a un titular? Marca todas.', ['¿Lo esperaba ya el mercado?', '¿Quién publica la noticia y con qué interés?', '¿Cuánto pierdo si me equivoco?', '¿Cuántos «me gusta» tiene la publicación?'], [0, 1, 2], 'Expectativas, fuente y riesgo. La popularidad de un post no dice nada del precio… salvo que quizá ya llegas tarde.'),
      upDown('Diciembre de 2020: Tesla entra en el S&P 500 tras subir más de un 700 % en el año, y los fondos indexados tienen que comprar sus acciones. ¿Qué hizo el precio en los dos años siguientes?', 'hist-tsla-2020', 'Una compra obligada y anunciada con semanas de antelación es una noticia que conoce todo el mundo: el precio suele moverse antes del día señalado. Lo de después depende de otras cosas: beneficios, tipos y expectativas.', 'hasta enero de 2023'),
      timed(single('¡Rápido! El mercado esperaba una inflación del 3 % y sale del 3,4 %. ¿Qué es más probable a corto plazo?', ['Que la bolsa reaccione a la baja por la sorpresa', 'Que la bolsa suba porque la inflación es baja', 'Que no pase nada porque el dato ya se conocía'], 0, 'Lo que mueve es la sorpresa: un dato peor de lo esperado suele pesar aunque la inflación esté bajando respecto al mes anterior.'), 15),
      chat(['¡Notición! 📱 Una gran marca de móviles presenta su nuevo modelo hoy.', 'Compro sus acciones ya, que van a subir, ¿no?'], '¿Qué le contestas a Lumi?', [['Seguro, es una buena noticia', 'Las presentaciones se anuncian con semanas de antelación: el precio ya lo sabía antes que tú.'], ['Esa noticia ya la sabía todo el mundo: lo que mueve el precio es la sorpresa', '¡Exacto! Precio = expectativas. Si pasa lo esperado, ya estaba dentro. 🧠'], ['Mejor vendo: con las buenas noticias siempre cae', 'Tampoco hay regla fija al revés. Depende de lo que esperaba el mercado.']], 1, 'Lo que el mercado ya espera está en el precio. Solo la sorpresa, buena o mala, lo mueve.'),
    ], { minutes: 6, retire: [0, 4, 6, 8, 9, 10] }),

    lesson('u35l8', 'Operación completa', [
      mission({
        title: 'Stop y objetivo',
        intro: 'Velas reales: tu tesis es que el precio rebota en su soporte, un **7,5 %** por debajo de la entrada. Coloca el **stop** y el **objetivo**, y mira qué pasó.',
        widget: { kind: 'orders', chart: 'lvl-2', stopPct: 4, takePct: 8, maxPct: 20 },
        goal: { text: 'Pon el stop por debajo del soporte y mira qué pasó.', when: [when('stopPct', '>=', 8), when('played', '==', 1)] },
        insight: 'Esta vez saltó el stop, pero sin él, 15 sesiones después, ibas perdiendo un 21,8 %. **Un buen plan no garantiza ganar: garantiza que, si pierdes, pierdes lo previsto.**',
        lumi: [
          { when: when('hit', '==', 1), say: 'Saltó el stop. Duele, pero es justo lo que habías decidido arriesgar.', mood: 'CALM' },
          { when: when('stopPct', '<', 7.5), say: 'Tu stop está por encima del soporte.', mood: 'THINKING' },
          { say: 'Busca el soporte y pon el stop debajo', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'El tamaño',
        intro: 'Cuenta de **10.000 €** y un riesgo del **1 %** (100 €), con el stop un **8 %** por debajo de la entrada. ¿Cuánto compras?',
        widget: { kind: 'position', account: 10000, riskPct: 1, stopPct: 3, entry: 25, maxRisk: 5, maxStop: 20 },
        predict: {
          prompt: 'Con el stop al 8 % y un 1 % de riesgo, si salta el stop, ¿cuánto pierdes?',
          options: ['100 €', '800 €', 'Todo lo invertido'],
          answer: 0,
          why: 'Compras solo **1.250 €** (100 ÷ 8 %). Si salta, pierdes el 8 % de eso: **100 €, o sea, 1R**.',
        },
        goal: { text: 'Pon el stop al 8 % con un 1 % de riesgo.', when: [when('stopPct', '==', 8), when('riskPct', '==', 1)] },
        insight: '**No decides cuánto compras: lo decide la distancia a tu stop.** Lo que arriesgas al entrar es **1R**: si arriesgas 100 € y ganas 250 €, has ganado 2,5R.',
        lumi: [
          { when: when('size', '==', 1250), say: '1.250 €: si salta el stop, pierdes justo 100 €.', mood: 'CELEBRATE' },
          { when: when('riskPct', '>', 2), say: 'Con más de un 2 % por operación, una mala racha duele mucho.', mood: 'WORRIED' },
          { say: 'Mueve la distancia del stop', mood: 'THINKING' },
        ],
      }),
      key('Cinco decisiones antes de entrar', '1. **Tesis:** por qué crees que puede subir.\n2. **Stop:** dónde te equivocas.\n3. **Objetivo:** dónde recoges.\n4. **Tamaño:** cuánto compras para arriesgar solo un 1 %.\n5. **Registro:** lo apuntas en tu diario.\n\nMedir en **R** permite comparar operaciones de distinto tamaño y saber si tu sistema gana a la larga. Revisa el diario cada 20 operaciones: te enseña lo que tu memoria prefiere olvidar.', 'Una buena operación es la que sigue el plan, aunque pierda.', 'Pruébalo: haz una compra en el simulador con stop, objetivo y un 1 % de riesgo.'),
    ], [
      order('Ordena los pasos de una operación bien hecha.', ['Escribir la tesis', 'Decidir dónde va el stop', 'Fijar el objetivo', 'Calcular el tamaño de la posición', 'Enviar la orden', 'Apuntarla en el diario'], 'Primero la idea y dónde te equivocas; después el objetivo y el tamaño, que depende del stop; al final la orden y el registro.'),
      level('Paso 2: coloca el stop de esta compra.', 'lvl-54', 'STOP', 'Por debajo del último mínimo (unos 21,96 €), con un margen para el ruido. Ahí es donde tu idea deja de valer.'),
      level('Paso 3, en otra operación: coloca el objetivo.', 'lvl-40', 'TAKE', 'Cerca del máximo anterior (unos 293 $), donde la última vez aparecieron vendedores.'),
      num('Paso 4: tienes 10.000 € y arriesgas un 1 %. Entras a 25 € con el stop a 24 €. ¿Cuántas acciones compras?', 100, 'acciones', '100 € de riesgo ÷ 1 € de distancia al stop = 100 acciones (2.500 € invertidos).'),
      simTrade('Ejecuta la operación completa: 10.000 €, riesgo máximo del 1 %. Pon el stop bajo el mínimo y ajusta el importe.', 'lvl-9', 'Un buen plan no garantiza ganar: garantiza que, si pierdes, pierdes lo previsto.'),
      num('Arriesgaste 80 € y cerraste la operación ganando 200 €. ¿Cuántas R has ganado?', 2.5, 'R', '200 ÷ 80 = 2,5R. Con R puedes comparar esta operación con cualquier otra, sea del tamaño que sea.'),
      scenario('Ana ha perdido tres operaciones seguidas, todas siguiendo su plan. Está enfadada y ve otra oportunidad. ¿Qué hace?', [['Abre una operación el doble de grande para recuperar', 'Operar por venganza: si falla, la racha mala se convierte en un agujero.'], ['Para por hoy y revisa el diario mañana con calma', 'Bien: tres pérdidas seguidas es la señal para parar. Con un 1 % por operación, ha perdido menos de un 3 %.'], ['Cambia de estrategia ya, porque «no funciona»', 'Tres operaciones son una muestra minúscula: hasta un buen sistema encadena pérdidas.']], 1, 'Las rachas de pérdidas son normales. La regla: tras tres pérdidas seguidas, se para el día.'),
      multi('¿Qué debe apuntar tu diario de cada operación? Marca todas.', ['El motivo de la entrada', 'El stop y el objetivo', 'El resultado en R', 'Cómo te sentías', 'Lo que opinaba un influencer ese día'], [0, 1, 2, 3], 'Plan, resultado y emociones: con eso descubres tus errores repetidos. Lo que diga otro no explica tus decisiones.'),
      simTrade('Segunda operación: 3.000 € de capital y un riesgo máximo del 1 %.', 'lvl-47', 'Con 3.000 € y un 1 %, el riesgo máximo son 30 €. Con poco capital la regla es la misma: el tamaño lo marca la distancia al stop.', { cash: 3000, maxRiskPct: 1 }),
      timed(fill('Si arriesgas 100 € y salta tu stop, has perdido ____.', '1R', ['2R', '0,5R', '10R'], 'Por definición, lo que arriesgas al entrar es 1R.'), 12),
      tf('Una operación que gana dinero siempre fue una buena operación.', false, 'Si ganaste sin stop o arriesgando un 10 %, tuviste suerte con un mal plan. Juzga el proceso, no solo el resultado.'),
    ], { minutes: 6, retire: [3, 5, 9, 10] }),

    lesson('u35l9', 'El reto de la semana', [
      play({
        title: '¿Cumple las reglas?',
        intro: 'Reglas del reto, con 10.000 € virtuales: ningún activo pasa del **40 %**, al menos **4 activos**, cripto como mucho un **10 %** y cada operación arriesga como mucho un **1 %**. ¿Cumple o rompe una regla?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Cumple' }, { label: 'Rompe una regla' }],
          cards: [
            { icon: 'pie', label: 'MSCI World 40 %, bonos 30 %, oro 20 %, bitcoin 10 %', bin: 0, why: 'Cuatro activos, ninguno pasa del 40 % y la cripto se queda en el 10 %.' },
            { icon: 'bitcoin', label: 'Bitcoin al 15 % de la cartera', bin: 1, why: 'La cripto puede perderse entera: como mucho, un 10 %.' },
            { icon: 'layers', label: 'Solo tres activos, a partes iguales', bin: 1, why: 'Hacen falta al menos 4.' },
            { icon: 'target', label: 'Una operación que arriesga 80 €', bin: 0, why: 'El 1 % de 10.000 € son 100 €: 80 € está dentro.' },
            { icon: 'flag', label: 'El ETF del IBEX 35 al 45 %', bin: 1, why: 'Ningún activo puede pasar del 40 %.' },
            { icon: 'alert', label: 'Una operación que arriesga 300 €', bin: 1, why: 'Es un 3 % de la cartera: el triple de lo permitido.' },
          ],
        },
        goal: { text: 'Revisa los seis casos.', when: [when('done', '==', 6)] },
        insight: 'Con un máximo del 40 % por activo y al menos 4 activos, **ninguna sorpresa puede hundir tu semana**. Y la cripto, poca: puede perderse entera.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Repasa las cuatro reglas: peso, número de activos, cripto y riesgo.', mood: 'THINKING' },
          { say: '¿Cumple o rompe una regla?', mood: 'HAPPY' },
        ],
      }),
      story('Martes: la bolsa cae', [{ id: 'alex', name: 'Álex' }], [
        note('Martes. Sale un dato de inflación peor de lo esperado y la bolsa cae un 3 %.'),
        note('Tu cartera pierde 180 €: un −1,8 %.'),
        say('alex', '¿Has visto? Yo lo vendo todo antes de que caiga más.'),
        choose('¿Qué haces tú?', [
          opt('Vendo todas las acciones para que no caiga más', 'bad', say('lumi', 'Conviertes una caída normal en pérdida, y luego tendrás que adivinar cuándo volver.')),
          opt('No toco nada: la cartera está repartida y la caída es normal', 'good', say('lumi', 'Eso. Un −1,8 % en un día malo es para lo que está pensada.')),
          opt('Paso todo a bitcoin para recuperarlo rápido', 'bad', say('lumi', 'Rompes la regla del 10 % y operas por venganza.')),
        ]),
        say('lumi', 'La bolsa cayó un 3 %; tu cartera, solo un 1,8 %. Eso es diversificar.'),
      ]),
      key('Tu semana', 'No gana quien más sube, sino quien **cumple las reglas** y toma decisiones que podría explicar. El lunes repartes, durante la semana llegan noticias y oportunidades, y el viernes revisas.\n\nEs una simulación educativa con **10.000 € virtuales**, no una recomendación.\n\nSi una decisión no la podrías explicar en voz alta, no la tomes.', 'Las reglas se escriben el lunes con la cabeza fría; el resto de la semana solo se cumplen.', 'Pruébalo: reparte tu Cartera virtual con las reglas del reto y revísala el viernes.'),
    ], [
      portfolio('Lunes: reparte tus 10.000 € virtuales cumpliendo las reglas del reto.', [['Fondo indexado MSCI World', 'ACCIONES'], ['ETF del IBEX 35', 'ACCIONES'], ['Fondo de bonos europeos', 'BONOS'], ['Oro (ETC)', 'ORO'], ['Bitcoin', 'CRIPTO']], { maxWeight: 40, minAssets: 4, maxKind: { CRIPTO: 10 } }, 'Con un máximo del 40 % por activo y al menos 4 activos, ninguna sorpresa puede hundir tu semana. Si incluyes cripto, que sea poco: puede perderse la totalidad de lo invertido.'),
      scenario('Martes: la bolsa cae un 3 % por un dato de inflación peor de lo esperado y tu cartera pierde 180 €. ¿Qué haces?', [['Vendo todas las acciones para que no caiga más', 'Conviertes una caída normal en una pérdida definitiva, y te toca adivinar cuándo volver a entrar.'], ['No toco nada: la cartera está repartida y la caída entra en lo normal', 'Bien: un −1,8 % en un día malo es justo para lo que está pensada una cartera diversificada.'], ['Paso todo a bitcoin para recuperarlo rápido', 'Rompes la regla del 10 % y concentras todo en el activo más volátil. Eso es operar por venganza.']], 1, 'Las caídas de varios puntos son parte del viaje. Lo que convierte una caída en pérdida es vender por pánico.'),
      scenario('Miércoles: pusiste un 10 % en bitcoin y esta semana ha subido un 25 %. Ahora pesa un 12 % de la cartera y tu regla dice 10 % como máximo. ¿Qué haces?', [['Lo dejo: está subiendo', 'Incumples tu propia regla justo cuando hay más riesgo: si cae, te dolerá más de lo que pactaste contigo.'], ['Vendo lo que sobra para volver al 10 % y lo reparto en el resto', 'Rebalancear: vendes parte de lo que ha subido y vuelves al riesgo que elegiste.'], ['Compro más para aprovechar la racha', 'FOMO con las reglas rotas. Así una cartera prudente se convierte en una apuesta.']], 1, 'Rebalancear devuelve la cartera al riesgo que elegiste con la cabeza fría.'),
      num('Tu cartera vale 10.250 € y el bitcoin, 1.250 €. ¿Cuántos euros de bitcoin tienes que vender para que vuelva a pesar un 10 %?', 225, '€', 'El 10 % de 10.250 € son 1.025 €. 1.250 − 1.025 = 225 €. El dinero pasa a otros activos, así que la cartera sigue valiendo lo mismo.'),
      simTrade('Jueves: ves una oportunidad en una acción. Cartera de 10.000 €, riesgo máximo del 1 %. Pon el stop y el importe.', 'lvl-51', 'Con el stop bajo el último mínimo y un 1 % de riesgo, aunque salga mal pierdes como mucho 100 €. Dentro de una cartera, una operación nunca debe poder arruinarte la semana.'),
      num('Jueves por la noche: tu cartera es 50 % acciones, 30 % bonos y 20 % oro. Esta semana las acciones han hecho −3 %, los bonos +1 % y el oro +4 %. ¿Cuánto ha hecho la cartera?', -0.4, '%', '0,5 × (−3) + 0,3 × 1 + 0,2 × 4 = −1,5 + 0,3 + 0,8 = −0,4 %. Las acciones cayeron un 3 %, pero la cartera solo un 0,4 %: eso es diversificar.', 5),
      upDown('Viernes: el índice tecnológico que sigues lleva así 30 sesiones. ¿Más arriba o más abajo 10 sesiones después?', 'ud-179', 'En una cartera diversificada no necesitas acertar esto: lo que pase en dos semanas pesa poco frente a años de aportaciones.'),
      timed(tf('Si tu cartera cumple todas las reglas, es imposible que pierda dinero en una semana.', false, 'Las reglas limitan cuánto puedes perder, no evitan las pérdidas. En una semana mala, una cartera diversificada también baja.'), 10),
      portfolio('Viernes: prepara la cartera de la semana que viene con reglas más prudentes: máximo un 35 % por activo, al menos 5 activos, como mucho un 5 % en cripto y al menos un 20 % en bonos.', [['Fondo indexado MSCI World', 'ACCIONES'], ['Fondo indexado de EE. UU.', 'ACCIONES'], ['Fondo de bonos europeos', 'BONOS'], ['Letras del Tesoro', 'BONOS'], ['Oro (ETC)', 'ORO'], ['Ethereum', 'CRIPTO']], { maxWeight: 35, minAssets: 5, maxKind: { CRIPTO: 5 }, minKind: { BONOS: 20 } }, 'Más activos, más renta fija y menos cripto: reglas más prudentes reducen cuánto se mueve la cartera. Es un ejercicio de reglas, no una recomendación de reparto.'),
      chat(['Viernes 🎉 Mi cartera ha ganado un 1 % esta semana.', 'La de mi primo ha ganado un 20 % con una sola cripto. ¿He hecho el tonto?'], '¿Qué le contestas a Lumi?', [['Sí: la próxima vez, todo a una cripto', 'Una semana de +20 % puede ser un −40 % la siguiente. Copiar al que más gana es efecto rebaño.'], ['No: tu primo ha asumido un riesgo enorme y una semana no dice quién lo ha hecho mejor', '¡Eso! Lo que cuenta es el resultado según el riesgo y durante años, no una captura de pantalla. 😌'], ['Depende de cuántos «me gusta» tenga su post', 'Los «me gusta» no pagan pérdidas. 😅 Compara riesgos, no capturas.']], 1, 'Una semana es ruido. Se compara el resultado teniendo en cuenta el riesgo asumido, y en plazos largos.'),
    ], { minutes: 6, retire: [1, 3, 5, 7, 9] }),
  ],
})
