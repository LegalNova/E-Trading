import 'server-only'
// Sección 2 · Unidad 6 · Las órdenes (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, key, lesson, level, match, mission, multi, note, num, opt, order, play, say, scenario, simTrade, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u6', order: 6, title: 'Las órdenes', description: 'A mercado, limitada, stop loss, take profit y OCO: qué orden usar y qué cuesta',
  lessons: [

    lesson('u6l2', 'Horquilla, spread y deslizamiento', [
      play({
        title: 'Comprar y vender al momento',
        intro: 'Esta es una acción grande y muy negociada. Compras 100 y, un segundo después, cambias de idea.',
        widget: {
          kind: 'book', size: 100, maxSize: 3000,
          bids: [{ price: 10.0, size: 800 }, { price: 9.99, size: 1500 }, { price: 9.97, size: 2000 }],
          asks: [{ price: 10.02, size: 500 }, { price: 10.03, size: 1000 }, { price: 10.06, size: 2000 }],
        },
        predict: {
          prompt: 'Las **vendes al momento**. ¿Qué pasa?',
          options: ['Te quedas igual', 'Pierdes unos 2 €', 'Ganas un poco'],
          answer: 1,
          why: 'Compras a 10,02 €, lo que piden los vendedores (*ask*), y vendes a 10,00 €, lo que pagan los compradores (*bid*): pierdes **2 €**, un 0,2 %.',
        },
        goal: { text: 'Compra tanto que el deslizamiento supere al spread (0,2 %).', when: [when('slippagePct', '>', 0.2)] },
        insight: 'Esa diferencia entre *ask* y *bid* es la **horquilla** o *spread*: la pierdes al comprar y vender al momento. Si compras mucho, pagas además **deslizamiento**: la diferencia entre el precio que esperabas y el que obtienes.',
        lumi: [
          { when: when('slippagePct', '>', 0.2), say: 'Ahora el deslizamiento te cuesta más que la horquilla.', mood: 'WORRIED' },
          { when: when('size', '>', 500), say: 'Ya no te llega con el primer escalón del libro.', mood: 'THINKING' },
          { say: 'Mira la horquilla y luego sube la cantidad', mood: 'HAPPY' },
        ],
      }),
      story('«Cero comisiones»', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Mi bróker es de 0 comisiones. Hago 20 operaciones al mes de 1.000 €.'),
        say('pablo', 'Entre spread y lo demás, cada una me cuesta un 0,3 %. Nada.'),
        choose('¿Le sale gratis operar así?', [
          opt('Sí: su bróker no cobra comisiones', 'bad', say('lumi', 'El spread se paga igual: compra al ask y vende al bid.')),
          opt('Casi: un 0,3 % es muy poco', 'ok', say('lumi', 'Son 3 € por operación: en un año, **720 €**.')),
          opt('No: pagará mucho, gane o pierda', 'good', say('lumi', 'Eso: 3 € × 20 × 12 meses = **720 €** al año.')),
        ]),
        say('pablo', 'Uf… ¿y qué hago?'),
        say('lumi', 'Operar menos. Los costes son lo único seguro de una inversión.'),
      ]),
      key('Cuándo hay más deslizamiento', 'Cuando tu orden es grande para el libro o el precio se mueve muy rápido: en la **apertura**, tras una **noticia** o en momentos de **pánico**.\n\nCuanta más **liquidez**, más estrecha es la horquilla. En porcentaje, spread ÷ precio: 10,00 € / 10,02 € es un 0,2 %.', 'Spread, deslizamiento y comisiones son costes de operar: cuanto más operas, más pagas.', 'Pruébalo: antes de comprar en el Mercado, mira la comisión simulada de tu orden.'),
    ], [
      timed(num('Rápido: bid 20,10 €, ask 20,14 €. ¿Spread en euros?', 0.04, '€', '20,14 − 20,10 = 0,04 €.'), 15),
      num('Una acción cotiza a 50,00 € (compra) y 50,25 € (venta). ¿Qué spread es, en % del precio de compra?', 0.5, '%', '0,25 ÷ 50 = 0,005 → 0,5 %.'),
      num('Compras 1.000 acciones a 10,04 € (ask) y las vendes al momento a 10,02 € (bid). ¿Cuánto pierdes?', 20, '€', '0,02 € × 1.000 = 20 €, solo por el spread.'),
      num('Esperabas comprar a 30,00 € y tu orden se ejecutó a 30,15 €. ¿Cuánto deslizamiento por acción?', 0.15, '€', '30,15 − 30,00 = 0,15 € por acción.'),
      single('¿Qué suele tener el spread más pequeño?', ['Una acción grande del S&P 500', 'Una empresa pequeña de BME Growth', 'Una criptomoneda poco conocida'], 0, 'Cuanta más liquidez, más estrecha es la horquilla.'),
      match('Empareja cada coste con su definición.', [['Spread', 'Diferencia entre bid y ask'], ['Deslizamiento', 'Diferencia entre el precio esperado y el obtenido'], ['Comisión', 'Lo que cobra el bróker por operar'], ['Liquidez', 'Poder operar mucho sin mover el precio']], 'Los tres primeros son costes; la liquidez es lo que los mantiene bajos.'),
      num('Pablo cierra 20 operaciones al mes de 1.000 € y cada una le cuesta un 0,3 % entre spread y comisiones. ¿Cuánto paga en un año?', 720, '€', '0,3 % de 1.000 € = 3 € por operación. 3 × 20 × 12 = 720 € al año.'),
      timed(tf('El spread es un coste aunque el bróker anuncie «0 comisiones».', true, 'Lo pagas al comprar al ask y vender al bid, cobre o no comisión el bróker.'), 10),
      multi('¿Cuándo suele haber más deslizamiento? Marca todas.', ['Con una orden limitada que fija tu precio', 'Con órdenes grandes en valores poco líquidos', 'Con una orden pequeña en una gran empresa a media sesión', 'En momentos de pánico, con el precio moviéndose muy rápido'], [1, 3], 'El deslizamiento aparece cuando falta liquidez o el precio corre: órdenes grandes en valores poco líquidos, momentos de pánico, aperturas tras una noticia. Una limitada fija tu precio.'),
      scenario('Marta quiere comprar 3.000 € de una empresa pequeña con un spread de un 1 %. ¿Qué hace?', [['Usa una orden limitada y opera poco ese valor', 'Controla el precio de entrada y no paga el 1 % una y otra vez.'], ['Compra a mercado y vende en cuanto gane un poco', 'Necesita que suba más de un 1 % solo para empatar el spread.'], ['Compra y vende varias veces al día para aprovechar los movimientos', 'Cada vuelta le cuesta un 1 %: el spread se come cualquier ganancia.']], 0, 'En valores con spread alto, operar mucho es perder dinero seguro.'),
      buckets('¿Horquilla estrecha o ancha?', ['Estrecha', 'Ancha'], [['Una acción grande del S&P 500 a media sesión', 0], ['Una empresa pequeña de BME Growth', 1], ['Un ETF muy negociado del S&P 500', 0], ['Una criptomoneda poco conocida', 1], ['Una acción poco negociada justo en la apertura', 1], ['El euro frente al dólar', 0]], 'Donde hay muchos compradores y vendedores, la horquilla es estrecha. Con poca liquidez, o en la apertura, se abre: por eso lo pequeño y lo poco negociado cuesta más de operar.'),
      chat(['Mi bróker es de 0 comisiones: puedo comprar y vender cada día gratis, ¿no?'], 'Lumi cree que con un bróker de 0 comisiones comprar y vender cada día le sale gratis. ¿Qué le contestas?', [['Exacto: si el bróker no cobra comisión, operar no cuesta nada', 'Cada vuelta paga la horquilla: compras al ask y vendes al bid, cobre o no comisión el bróker.'], ['No: cada compra y cada venta paga la horquilla', '¡Eso! Los costes de operar se suman en cada operación, ganes o pierdas.'], ['Solo pagas si pierdes dinero', 'Los costes se pagan en cada operación, también en las que ganas.']], 1, '«0 comisiones» no es gratis: el spread y el deslizamiento se pagan siempre, y se multiplican con cada operación.'),
    ], { source: '2.4', minutes: 6, retire: [0, 1, 2, 3, 6, 7] }),

    lesson('u6l3', 'La orden limitada', [
      play({
        title: '¿Se ejecuta?',
        intro: 'Una acción cotiza a 50 € y tú solo la quieres a 47 €. Con una **orden limitada** pones tú el precio: compras a tu precio **o más barato** y vendes a tu precio **o más caro**.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Se ejecuta' }, { label: 'No se ejecuta' }],
          cards: [
            { icon: 'cart', label: 'Limitada de compra a 47 €. El mínimo del día es 47,40 €', bin: 1, why: 'El precio no llegó a tu límite: la orden sigue esperando (o caduca, si era del día).' },
            { icon: 'cart', label: 'Limitada de compra a 47 €. El precio baja a 46,80 €', bin: 0, why: 'Llega a tu límite: compras a 47 € o mejor.' },
            { icon: 'tag', label: 'Limitada de venta a 60 €. Alguien paga 60,30 €', bin: 0, why: 'Vende a tu precio o mejor: si alguien paga más, mejor para ti.' },
            { icon: 'tag', label: 'Limitada de venta a 60 €. El máximo del día es 59,50 €', bin: 1, why: 'No llegó a tu precio: no vendes.' },
            { icon: 'up', label: 'Limitada de compra a 52 € con la acción a 50 €', bin: 0, why: 'Por encima del precio actual se ejecuta al momento, al mejor precio disponible.' },
            { icon: 'calendar', label: 'Limitada «del día» que no llega a su precio', bin: 1, why: 'Caduca al cierre sin ejecutarse.' },
          ],
        },
        goal: { text: 'Decide qué pasa con las seis órdenes.', when: [when('done', '==', 6)] },
        insight: '**Limitada = precio garantizado, ejecución no garantizada.** Si el precio no llega a tu límite, no se ejecuta, o se ejecuta solo en parte.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: compra a tu precio o menos; venta, a tu precio o más.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Ya ves: tú pones el precio, el mercado decide si llega.', mood: 'HAPPY' },
          { say: '¿Se ejecuta o no? Toca cada orden', mood: 'HAPPY' },
        ],
      }),
      story('La orden olvidada', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Hace un mes puse una limitada de compra «hasta cancelar». Ni me acordaba.'),
        say('leo', '¡Hoy se ha ejecutado, justo después de una noticia malísima!'),
        choose('¿Qué le dices a Leo?', [
          opt('Genial: has comprado barato', 'bad', say('lumi', 'Quizá, pero ha comprado sin decidirlo hoy, con información nueva.')),
          opt('Revisa tus órdenes vivas de vez en cuando', 'good', say('lumi', 'Eso. Una orden viva no sabe que han cambiado las noticias.')),
          opt('Usa siempre órdenes del día', 'ok', say('lumi', 'Caducan al cierre, sí. Pero las de hasta cancelar sirven si las revisas.')),
        ]),
        say('lumi', 'Muchos brókers les ponen un máximo, a menudo de 90 días.'),
      ]),
      key('Cuándo usarla', 'Cuando el precio te importa: valores poco líquidos, horquillas amplias, aperturas o si solo quieres comprar en una zona concreta.\n\n**Validez:** del día (caduca al cierre) o hasta cancelar (*GTC*), que sigue viva hasta que se cumpla o la canceles.', 'Con una limitada controlas el precio; a cambio, puede no ejecutarse nunca.', 'Pruébalo: en Mercado, pon una alerta de precio donde pondrías tu orden limitada.'),
    ], [
      single('Quieres comprar, pero solo si el precio baja a 45 €. ¿Qué orden usas?', ['A mercado, cuando baje a 45 €', 'Limitada de compra a 45 €', 'Take profit a 45 €'], 1, 'La limitada solo se ejecuta a 45 € o menos.'),
      single('Cotiza a 50 €. Pones una limitada de compra a 47 € y mañana el mínimo del día es 47,40 €. ¿Qué pasa?', ['No se ejecuta', 'Compras a 47,40 €', 'Compras a 47 €'], 0, 'El precio no llegó a tu límite: la orden sigue esperando (o caduca, si era del día).'),
      tf('Una limitada de venta a 60 € puede ejecutarse a 60,30 €.', true, 'Vende a tu precio o mejor: si alguien paga más, mejor para ti.'),
      level('Tienes acciones compradas al último precio. Coloca una orden limitada de venta en un nivel con opciones reales de ejecutarse.', 'lvl-4', 'TAKE', 'Cerca del máximo anterior suele aparecer venta: es un objetivo razonable. Mucho más arriba, la orden puede no ejecutarse nunca.'),
      simTrade('Compras con una cartera de 5.000 € y arriesgas como mucho un 2 % (100 €). Coloca el stop y elige cuánto invertir.', 'lvl-63', 'El importe sale del stop: con un stop más lejano compras menos para no pasar de 100 € de riesgo.', { cash: 5_000, maxRiskPct: 2 }),
      scenario('Ana quiere 1.000 acciones de un valor poco líquido: el mejor vendedor pide 8,40 € pero solo por 100 acciones, y los siguientes piden 8,90 €. ¿Qué hace?', [['Limitada de compra a 8,45 €', 'Compra lo que haya hasta 8,45 € y el resto espera. No paga 8,90 € por sorpresa.'], ['Compra a mercado', 'Se come el libro: 100 a 8,40 € y 900 a 8,90 € o más.'], ['Limitada de compra a 9,50 €, para asegurar', 'Eso no limita nada: se ejecutaría casi como a mercado.']], 0, 'Un límite útil está cerca del precio que de verdad quieres pagar.'),
      chat(['Puse una limitada de compra «hasta cancelar» hace un mes y ni me acordaba 😅', '¡Hoy se ha ejecutado justo después de una noticia malísima!'], '¿Qué le dices a Lumi?', [['Genial, has comprado barato', 'Quizá, pero has comprado sin decidirlo hoy, con información nueva.'], ['Revisa tus órdenes vivas: siguen activas aunque cambie la situación', 'Eso: una orden hasta cancelar no sabe que han cambiado las noticias. Revísalas de vez en cuando.'], ['Las limitadas nunca se ejecutan', 'Sí se ejecutan cuando el precio llega a tu límite.']], 1, 'Las órdenes vivas trabajan solas: conviene revisarlas.'),
      match('Empareja cada orden con lo que hace.', [['Limitada de compra', 'A tu precio o más barato'], ['Limitada de venta', 'A tu precio o más caro'], ['Validez del día', 'Caduca al cierre'], ['Hasta cancelar', 'Sigue viva hasta que se cumpla o la canceles']], 'Precio límite y validez: las dos cosas que eliges en una limitada.'),
      timed(tf('Una orden limitada siempre se ejecuta.', false, 'Si el precio no llega a tu límite, no se ejecuta.'), 10),
      num('Pones una limitada de compra de 200 acciones a 12,50 € y se ejecuta a 12,46 €. ¿Cuánto pagas de menos frente a tu límite?', 8, '€', '0,04 € × 200 = 8 €. La limitada compra a tu precio o mejor.'),
    ], { source: '2.5', minutes: 6, retire: [1, 2, 6, 8, 9] }),

    // Rehecha en la auditoría (RED-1): dónde va el stop, cuánto comprar y la relación riesgo-beneficio se enseñaban tres
    // veces (aquí, en la sección 0 y en la unidad 24). Esta unidad se queda con la mecánica de las órdenes: qué hace un stop,
    // a mercado o limitado, huecos y validez. El criterio (dónde y cuánto) es de la unidad 24.
    lesson('u6l4', 'El stop loss', [
      mission({
        title: 'Tu salida de emergencia',
        intro: 'Compras Tesla al último precio y te vas a dormir. Un **stop loss** es una orden dormida: solo despierta si el precio **cae hasta el nivel** que elijas.',
        widget: { kind: 'orders', chart: 'lvl-10', stopPct: 2, takePct: 6, maxPct: 12 },
        predict: {
          prompt: 'El precio cae hasta tu stop mientras duermes. ¿Qué hace la orden?',
          options: ['Te avisa para que decidas', 'Vende sola, al precio que haya en ese momento', 'Vende justo al precio del stop, garantizado'],
          answer: 1,
          why: 'Al tocar el nivel, el stop se convierte en una orden **a mercado**: vende al mejor precio disponible, sin preguntarte.',
        },
        goal: { text: 'Pon un stop y un objetivo y mira cuál de las dos órdenes se ejecuta.', when: [when('played', '==', 1)] },
        insight: 'El stop no avisa ni pregunta: **vende solo** cuando el precio toca su nivel. Dónde ponerlo para que el ruido no lo haga saltar lo verás en «Gestión del riesgo».',
        lumi: [
          { when: when('hit', '==', 2), say: 'Ha tocado tu objetivo antes que el stop: se ha ejecutado la venta con ganancia.', mood: 'CELEBRATE' },
          { when: when('hit', '==', 1), say: 'Ha saltado el stop: la orden ha vendido sola.', mood: 'THINKING' },
          { say: 'Mueve el stop y dale a ver qué pasó', mood: 'HAPPY' },
        ],
      }),
      story('El stop que no vendió', [{ id: 'sara', name: 'Sara' }], [
        say('sara', 'Compré a 20 € y puse un **stop limitado**: si toca 18 €, vender, pero no por menos de 17,80 €.'),
        note('Malas noticias antes de abrir. La acción abre directamente a **16,50 €**.'),
        choose('¿Qué pasa con su orden?', [
          opt('Se vende a 18 €', 'bad', say('lumi', 'A 18 € ya no hay compradores: el precio ha saltado por debajo.')),
          opt('Se activa, pero no se vende: nadie paga 17,80 €', 'good', say('lumi', 'Eso. Su orden limitada se queda esperando, y Sara sigue dentro mientras cae.')),
          opt('Se vende a 16,50 €', 'ok', say('lumi', 'Eso habría pasado con un stop a mercado. Con el limitado, por debajo de 17,80 € no vende.')),
        ]),
        say('sara', 'Entonces, ¿con uno a mercado habría vendido a 16,50 €?'),
        say('lumi', 'Sí: peor de lo previsto, pero fuera. **A mercado sales seguro; limitado controlas el precio, pero puedes no salir.**'),
      ]),
      key('Antes de dejarlo puesto', '• **Validez:** un stop «del día» caduca al cierre. Para que siga puesto mañana, elige «hasta cancelar».\n• **Huecos:** si el precio abre por debajo de tu nivel, el stop a mercado vende al primer precio que haya.\n• **No se aleja:** el stop se decide antes de entrar, con la cabeza fría.\n\nCuánto comprar para que esa pérdida sea pequeña se aprende en «Gestión del riesgo».', 'Un stop es una orden dormida que vende sola cuando el precio toca su nivel.', 'Aprueba esta clase y añade un stop loss a tu próxima compra del Mercado.'),
    ], [
      level('Has comprado al último precio. Coloca el stop loss donde tu idea deja de ser válida.', 'lvl-59', 'STOP', 'Un poco por debajo del último mínimo relevante: si lo pierde, la subida que esperabas ya no se cumple.'),
      level('Otra operación: coloca el stop loss con la misma lógica.', 'lvl-60', 'STOP', 'Por debajo del mínimo reciente, con algo de margen para que el ruido diario no te saque.'),
      simTrade('Tienes 10.000 € y arriesgas como mucho un 1 %. Primero el stop, después el importe.', 'lvl-67', 'Riesgo = importe × distancia al stop ÷ precio de entrada. Con el stop decidido, el importe sale solo.', { cash: 10_000, maxRiskPct: 1 }),
      num('Tienes 10.000 € y arriesgas el 1 %. Compras a 50 € con el stop a 45 €. ¿Cuántas acciones puedes comprar?', 20, 'acciones', 'Riesgo máximo: 100 €. Riesgo por acción: 5 €. 100 ÷ 5 = 20 acciones.'),
      num('Compras 80 acciones a 25 € con el stop a 23,50 €. Si salta, ¿cuánto pierdes (sin costes)?', 120, '€', '(25 − 23,50) × 80 = 1,50 × 80 = 120 €.'),
      single('¿Dónde tiene más lógica un stop loss?', ['Algo por debajo del último mínimo', 'A unos céntimos del precio de compra, para perder poco', 'En un número redondo cualquiera'], 0, 'Ahí tu idea deja de ser válida; muy cerca, el ruido normal te saca sin motivo.'),
      tf('Un stop loss garantiza que nunca perderás más de lo previsto.', false, 'Si el precio abre con un hueco por debajo de tu stop, se vende al primer precio disponible, que puede ser peor.'),
      timed(single('Rápido: compras a 100 € con el stop a 95 €. ¿Riesgo por acción?', ['5 €', '95 €', '0,95 €'], 0, '100 − 95 = 5 € por acción.'), 12),
      match('Empareja cada caso con lo que pasa.', [['Stop a mercado', 'Sale seguro, quizá a peor precio'], ['Stop limitado', 'Controla el precio, pero puede no ejecutarse'], ['Stop muy ajustado', 'El ruido normal te saca'], ['Sin stop', 'No sabes cuánto puedes perder']], 'No hay stop perfecto: cada opción tiene su coste.'),
      scenario('Bruno compró a 40 € con el stop a 37 €. El precio baja a 37,50 € y piensa en bajar el stop a 33 € «para darle aire». ¿Qué hace?', [['Mantiene el stop donde lo puso', 'Si salta, pierde lo que había previsto. Si no, sigue su plan.'], ['Lo baja a 33 €', 'Ahora arriesga más del doble de lo planeado: así empiezan las grandes pérdidas.'], ['Quita el stop y espera a que se recupere', 'Sin stop, la pérdida no tiene límite.']], 0, 'El stop se decide antes de entrar, con la cabeza fría, y no se aleja después.'),
      scenario('Tienes un stop a mercado en 30 €. La acción cierra a 31 € y al día siguiente abre a 27 €. ¿A qué precio vendes?', [['A 30 €, como marca el stop', 'El stop no garantiza el precio: a 30 € no hubo ninguna operación.'], ['Hacia 27 €', 'Eso: el stop se activa en la apertura y vende a mercado.'], ['No se vende', 'Un stop a mercado se ejecuta siempre que haya compradores.']], 1, 'Con un hueco, el stop a mercado vende al primer precio disponible, que puede ser peor que tu nivel.'),
      buckets('¿Es propio de un stop a mercado o de un stop limitado?', ['Stop a mercado', 'Stop limitado'], [['Vende seguro al tocar el nivel', 0], ['Puede quedarse sin ejecutar', 1], ['El precio de venta puede ser peor de lo previsto', 0], ['Fijas el peor precio que aceptas', 1]], 'A mercado sales seguro; limitado controlas el precio, pero puedes no salir.'),
      single('Pones un stop «del día» y el precio no lo toca. ¿Qué pasa al cierre?', ['Sigue activo mañana', 'Caduca: mañana no tienes stop', 'Se convierte en una orden a mercado'], 1, 'Una orden del día caduca al cierre. Para que siga puesta, elige «hasta cancelar».'),
    ], { source: '2.5', minutes: 6, retire: [1, 2, 3, 4, 6, 7, 9] }),

    lesson('u6l5', 'El take profit', [
      mission({
        title: 'Pon tu objetivo',
        intro: 'Compras Ethereum al último precio y no quieres pasarte el día mirando. Un **take profit** venderá solo si el precio **sube hasta tu objetivo**.',
        widget: { kind: 'orders', chart: 'lvl-16', stopPct: 5, takePct: 15, maxPct: 15 },
        predict: {
          prompt: 'Tu objetivo está un **15 %** arriba, muy por encima del máximo anterior. ¿Qué crees?',
          options: ['Se tocará: las criptomonedas se mueven mucho', 'Puede que no se toque nunca', 'Se toca seguro: solo hay que esperar'],
          answer: 1,
          why: 'El máximo anterior está un **10,7 %** arriba: ahí muchos vendieron y suele volver a aparecer venta.',
        },
        goal: { text: 'Pon el objetivo donde el precio pueda llegar y mira si se ejecuta.', when: [when('hit', '==', 2)] },
        insight: 'Al 15 %, el objetivo no se toca en estas velas (acaban en +5,5 %); **cerca del máximo anterior**, sí. Un take profit es una **orden limitada de venta**: si el precio no llega, no se ejecuta.',
        lumi: [
          { when: when('hit', '==', 2), say: '¡Objetivo tocado! La venta se hizo sola.', mood: 'CELEBRATE' },
          { when: when('hit', '==', 1), say: 'Saltó el stop. Ponlo bajo el último mínimo.', mood: 'THINKING' },
          { when: when('played', '==', 1), say: 'Ni stop ni objetivo. ¿Y si lo acercas al máximo anterior?', mood: 'THINKING' },
          { say: 'Coloca el objetivo y dale a ver qué pasó', mood: 'HAPPY' },
        ],
      }),
      story('Se vendió… y siguió subiendo', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Compré a 30 € con el objetivo en 36 €. Se vendió en tres semanas.'),
        say('laura', 'Una semana después cotiza a 39 €. ¡Qué rabia!'),
        choose('¿Qué le dices a Laura?', [
          opt('Cumplió su plan: ganó un 20 %', 'good', say('lumi', 'Eso. Un buen plan no acierta el máximo: protege lo que ganas.')),
          opt('Que revise si su objetivo era razonable', 'ok', say('lumi', 'Bien, pero sin castigarse: ganó un 20 % siguiendo su plan.')),
          opt('Que vuelva a comprar ya, a 39 €', 'bad', say('lumi', 'Comprar por rabia no es un plan: es una reacción.')),
        ]),
        say('lumi', 'Lo que sube después de tu objetivo ya no es tuyo.'),
        say('lumi', 'Es el precio de tener un plan. Decide el objetivo antes de entrar.'),
      ]),
      // RED-1: la relación riesgo-beneficio (1:2, cuántas aciertas) es de u24l6 y u24l7; aquí queda la mecánica de la orden
      key('Lo que hace un take profit', 'Es una **orden limitada de venta** por encima del precio: vende sola si el precio sube hasta tu objetivo.\n\n• Si el precio **no llega**, no se ejecuta y sigues dentro.\n• Como toda orden, tiene **validez**: del día o hasta cancelar.\n• Se decide **antes de entrar**, no cuando ya vas ganando.\n\nCuánto conviene ganar por cada euro que arriesgas se aprende en «Gestión del riesgo».', 'El take profit sale por arriba; el stop, por abajo.', 'Pruébalo: en tu próxima compra del Mercado, añade un take profit cerca del máximo anterior.'),
    ], [
      level('Has comprado al último precio. Coloca tu objetivo (take profit) en un sitio lógico.', 'lvl-61', 'TAKE', 'Cerca del máximo anterior: es donde muchos vendieron y suele aparecer venta otra vez.'),
      level('Otra operación: coloca el take profit.', 'lvl-13', 'TAKE', 'Cerca del máximo anterior, sin pasarte: un objetivo demasiado ambicioso puede no tocarse nunca.'),
      simTrade('Tienes 8.000 € y arriesgas como mucho un 1 % (80 €). Elige el importe y el stop.', 'lvl-64', 'Con un stop cerca del mínimo reciente, la distancia es corta y puedes comprar más sin pasar de 80 € de riesgo.', { cash: 8_000, maxRiskPct: 1 }),
      num('Compras a 50 €, con el stop a 47 € y el objetivo a 56 €. ¿Cuántas veces el riesgo es el beneficio posible?', 2, 'veces', 'Ganas 6 € y arriesgas 3 €: 6 ÷ 3 = 2. Relación 1:2.'),
      num('Arriesgas 3 € para ganar 6 € por acción. En 10 operaciones aciertas 4. ¿Cuál es el resultado por acción, antes de costes?', 6, '€', '4 × 6 = 24 € ganados; 6 × 3 = 18 € perdidos. 24 − 18 = 6 €.'),
      tf('Un take profit vende automáticamente cuando el precio sube hasta tu objetivo.', true, 'Asegura la ganancia sin que tengas que estar mirando.'),
      tf('Con un take profit, si el precio sigue subiendo después, también ganas esa subida.', false, 'Ya has vendido: lo que suba después no es tuyo.'),
      timed(tf('El take profit se coloca por debajo del precio de compra.', false, 'Va por encima; por debajo va el stop loss.'), 10),
      scenario('Laura compró a 30 € con el objetivo en 36 €. En tres semanas llega a 36 € y se vende. Una semana después cotiza a 39 €. ¿Qué hace?', [['Acepta que cumplió su plan y revisa si el objetivo era razonable', 'Ganó un 20 % siguiendo su plan. La próxima vez decidirá el objetivo con el mismo método.'], ['Decide no volver a poner objetivos nunca', 'La próxima vez, sin objetivo, puede ver cómo la ganancia se evapora.'], ['Vuelve a comprar a 39 € por rabia', 'Comprar por rabia no es un plan: es una reacción.']], 0, 'Un buen plan no acierta el máximo: protege lo que ganas.'),
      multi('¿Qué hace un take profit? Marca todas.', ['Vende sin que estés mirando', 'Asegura la ganancia si se llega al objetivo', 'Garantiza vender en el máximo', 'Te protege si el precio cae'], [0, 1], 'El take profit vende solo, sin que estés mirando, y asegura la ganancia si se llega al objetivo. No garantiza vender en el máximo, y de las caídas te protege el stop, no él.'),
      chat(['Pongo el objetivo un 50 % por encima: así, cuando llegue, gano mucho más'], 'Lumi quiere poner su objetivo un 50 % por encima del precio para ganar más. ¿Qué le contestas?', [['Buena idea: cuanto más lejos, más ganas', 'Solo si llega. Un objetivo demasiado lejano puede no tocarse nunca y acabar en el stop.'], ['Mejor cerca del máximo anterior', '¡Eso! Un objetivo razonable se toca más a menudo: ganar algo menos, pero de verdad.'], ['Mejor no poner objetivo y vender a ojo', 'Sin objetivo deciden la avaricia o el miedo, justo en el peor momento.']], 1, 'El objetivo lejano parece que gana más, pero si no se toca no gana nada. Cerca del máximo anterior suele aparecer venta, y ahí el objetivo tiene opciones reales.'),
      scenario('Laura usa siempre una relación 1:2: arriesga 3 € para ganar 6 €. Acierta 4 de cada 10 operaciones y cree que es mala trader. ¿Qué le dirías?', [['Que, antes de costes, va ganando: cada acierto vale el doble que cada fallo', 'Con 1:2, 4 aciertos dan 24 € y 6 fallos quitan 18 € por acción. Fallar más de lo que acierta no la hace perder.'], ['Que lo deje: si falla más de la mitad, pierde dinero', 'No necesariamente: depende de cuánto gana al acertar frente a lo que pierde al fallar.'], ['Que quite el stop para fallar menos', 'Sin stop, una sola mala operación puede borrar muchos aciertos.']], 0, 'Lo que cuenta no es solo cuántas aciertas, sino cuánto ganas al acertar frente a lo que pierdes al fallar. El error habitual es fijarse solo en el porcentaje de aciertos.'),
      single('Tu take profit está en 36 €, con validez «del día». El precio sube hasta 35,90 € y la sesión cierra. ¿Qué pasa?', ['Se vende a 35,90 €', 'No se vende y caduca', 'Se vende mañana, cuando toque 36 €'], 1, 'Una limitada de venta solo se ejecuta a su precio o mejor. Y si era del día, mañana ya no está puesta.'),
      buckets('¿Take profit o stop loss?', ['Take profit', 'Stop loss'], [['Va por encima del precio de compra', 0], ['Va por debajo del precio de compra', 1], ['Es una orden limitada de venta', 0], ['Al activarse, vende a mercado', 1], ['Asegura una ganancia', 0], ['Limita una pérdida', 1]], 'El take profit sale por arriba, con una limitada; el stop, por abajo, a mercado.'),
    ], { source: '2.5', minutes: 6, retire: [2, 3, 4, 5, 6, 7, 8, 11] }),

    lesson('u6l6', 'Combinar órdenes: OCO', [
      mission({
        title: 'Monta tu OCO',
        intro: 'Te vas una semana de viaje y no podrás mirar el precio. Una **OCO** junta un stop por debajo y un objetivo por encima: **cuando salta una, la otra se cancela sola.**',
        widget: { kind: 'orders', chart: 'lvl-18', stopPct: 1, takePct: 5, maxPct: 10 },
        goal: { text: 'Pon el stop bajo el último mínimo, el objetivo cerca del máximo anterior, y mira qué salta.', when: [when('stopPct', '>=', 2.5), when('takePct', '>=', 4), when('played', '==', 1)] },
        insight: 'Una OCO es un plan completo de salida: **cuando salta una orden, la otra se cancela sola**. No te queda ninguna orden suelta.',
        lumi: [
          { when: when('hit', '==', 1), say: 'Saltó el stop: el objetivo se ha cancelado solo.', mood: 'CALM' },
          { when: when('hit', '==', 2), say: 'Objetivo tocado: el stop se ha cancelado solo.', mood: 'CELEBRATE' },
          { when: when('played', '==', 1), say: 'No saltó ninguna: las dos siguen vivas.', mood: 'THINKING' },
          { say: 'Coloca stop y objetivo, y dale a ver qué pasó', mood: 'HAPPY' },
        ],
      }),
      story('El hueco', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Compré a 40 €. Tengo una OCO con el stop en 38 €.'),
        note('Por la noche, la empresa da malos resultados. Abre a 34 €.'),
        choose('¿A qué precio vende Pablo, más o menos?', [
          opt('A 38 €, su stop', 'bad', say('lumi', 'No hubo precios entre 38 y 34 €: es un **hueco**.')),
          opt('Alrededor de 34 €', 'good', say('lumi', 'Eso. El stop vende al primer precio disponible.')),
          opt('No vende: el precio se ha saltado el stop', 'ok', say('lumi', 'Sí vende, pero al primer precio que hay: unos 34 €.')),
        ]),
        say('pablo', '¿Y mi objetivo?'),
        say('lumi', 'Se cancela solo. Pero ningún stop es un seguro perfecto.'),
        say('lumi', 'Contra los huecos, tu mejor defensa es el **tamaño** de la posición.'),
      ]),
      key('El stop dinámico', 'El **stop dinámico** (*trailing stop*) sube con el precio a una distancia fija: con un 8 %, si el precio pasa de 100 € a 120 €, tu stop sube de 92 € a 110,40 €. Nunca baja.\n\nLos huecos también pasan al alza: si abre por encima de tu objetivo, el take profit se ejecuta a ese precio, mejor que el previsto.\n\nNo todos los brókers ofrecen órdenes OCO: compruébalo antes.', 'OCO = plan completo de salida; los huecos son su límite.', 'Pruébalo: en el Mercado, pon stop y take profit en la misma compra.'),
    ], [
      level('Monta tu OCO. Primero, coloca el stop loss.', 'lvl-17', 'STOP', 'Por debajo del mínimo reciente: si lo pierde, tu idea ya no vale.'),
      level('Ahora, en la misma operación, coloca el take profit.', 'lvl-17', 'TAKE', 'Cerca del máximo anterior. Con stop y objetivo puestos, la OCO cancela uno cuando salta el otro.'),
      order('Ordena lo que pasa con una OCO que acaba en el objetivo.', ['Compras la acción', 'Colocas el stop y el objetivo como OCO', 'El precio sube hasta el objetivo', 'Se venden las acciones', 'El stop se cancela solo'], 'Una se ejecuta y la otra desaparece: no te quedas con una orden suelta.'),
      single('Pablo tiene acciones compradas a 40 € con un stop (a mercado) en 38 €. Tras malos resultados por la noche, la acción abre a 34 €. ¿A qué precio vende, aproximadamente?', ['Alrededor de 34 €', 'A 38 € exactos', 'No vende'], 0, 'No hubo precios entre 38 y 34 €: el stop se ejecuta al primer precio disponible.'),
      scenario('Bruno va a mantener unas acciones el día que la empresa presenta resultados y sabe que puede haber un hueco. ¿Qué hace?', [['Reduce el tamaño de la posición', 'Si abre con hueco, pierde más de lo previsto por acción, pero sobre una posición pequeña.'], ['Confía en que el stop le protege seguro', 'Con un hueco, el stop se ejecuta muy por debajo de su nivel.'], ['Duplica la posición porque tiene stop', 'Doble tamaño y un stop que no protege de los huecos: doble golpe.']], 0, 'Contra los huecos, la mejor defensa es el tamaño de la posición.'),
      num('Compraste a 50 € con el stop a 47,50 €. La acción abre con un hueco a 42,50 € y el stop se ejecuta ahí. ¿Cuántos euros por acción pierdes de más respecto a lo previsto?', 5, '€', 'Previsto: 50 − 47,50 = 2,50 €. Real: 50 − 42,50 = 7,50 €. De más: 5 €.'),
      num('Stop dinámico del 10 %. El precio sube de 80 € a 95 €. ¿Dónde está ahora el stop?', 85.5, '€', '95 × 0,90 = 85,50 €. El stop sigue al precio hacia arriba.'),
      tf('En una OCO, si salta el stop, el take profit sigue activo.', false, 'Se cancela solo: por eso se llama «una cancela a la otra».'),
      timed(tf('Un stop loss puede ejecutarse peor que su nivel si hay un hueco.', true, 'Sin precios intermedios, se vende al primero disponible.'), 10),
      match('Empareja cada término con su significado.', [['OCO', 'Stop y objetivo: uno cancela al otro'], ['Hueco', 'Salto de precio sin cotizaciones intermedias'], ['Stop dinámico', 'Sube con el precio y nunca baja'], ['Stop limitado', 'Puede no ejecutarse si el precio salta']], 'Las órdenes combinadas automatizan tu plan, pero no eliminan los huecos.'),
      chat(['Con mi OCO ya no puedo perder más del 5 %, ¿verdad? 😎'], '¿Qué le contestas a Lumi?', [['Exacto, estás totalmente protegido', 'Con un hueco por la noche, el stop puede ejecutarse muy por debajo de ese 5 %.'], ['Casi siempre, pero un hueco puede hacerte perder más', '¡Eso! Por eso también cuenta cuánto dinero pones en cada operación.'], ['La OCO no sirve para nada', 'Sí sirve: automatiza tu salida. Solo que no es un seguro perfecto.']], 1, 'La OCO organiza la salida; el tamaño de la posición limita el daño de lo imprevisto.'),
    ], { source: '2.5', minutes: 6, retire: [3, 5, 6, 7, 8, 10] }),
  ],
})
