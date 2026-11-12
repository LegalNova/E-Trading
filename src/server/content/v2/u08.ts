import 'server-only'
// Sección 3 · Unidad 8 · Acciones (docs/curso-v2/02-curriculo.md)
import { buckets, chat, choose, fill, key, lesson, match, multi, note, num, opt, order, play, say, scenario, single, story, tf, timed, unit, upDown, when } from '../dsl'

export default unit({
  id: 'u8', order: 8, title: 'Acciones', description: 'Qué compras con una acción, cómo cobras dividendos y qué tipos de empresas hay',
  lessons: [

    lesson('u8l2', 'Derechos del accionista', [
      story('La junta', [{ id: 'pablo', name: 'Pablo' }], [
        say('pablo', 'Tengo 50 acciones y me ha llegado la convocatoria de la junta.'),
        say('pablo', 'Se vota subir mucho el sueldo del consejero delegado. Total, mi voto no cuenta…'),
        choose('¿Qué le dices a Pablo?', [
          opt('Que lea la propuesta y vote o delegue a distancia', 'good', say('lumi', 'Eso. Es su derecho como dueño, y las juntas suman votos grandes y pequeños.')),
          opt('Que no haga nada: con 50 acciones da igual', 'bad', say('lumi', 'Su voto pesa poco, pero cuenta. Si no vota, otros deciden por él.')),
          opt('Que venda todo en protesta', 'ok', say('lumi', 'Puede, pero renuncia a su parte sin haber usado su voz.')),
        ]),
        say('lumi', 'Por regla general, **una acción = un voto**. Los grandes fondos sí mueven votaciones.'),
      ]),
      play({
        title: 'Tus derechos',
        intro: 'Ser accionista te da tres tipos de derechos, en proporción a tus acciones.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Económico' }, { label: 'Político' }, { label: 'De información' }],
          cards: [
            { icon: 'coins', label: 'Cobrar el dividendo si se reparte', bin: 0, why: 'Es un derecho económico: tu parte del beneficio repartido.' },
            { icon: 'cash', label: 'Tu parte si la empresa se vende o se liquida', bin: 0, why: 'Otro derecho económico: te toca lo que corresponda a tus acciones.' },
            { icon: 'megaphone', label: 'Votar en la junta general de accionistas', bin: 1, why: 'Es un derecho político: decides con tu voto.' },
            { icon: 'briefcase', label: 'Votar los sueldos de los consejeros', bin: 1, why: 'Se vota en la junta: derecho político.' },
            { icon: 'document', label: 'Recibir las cuentas anuales', bin: 2, why: 'Es un derecho de información.' },
            { icon: 'news', label: 'Conocer la información relevante a la vez que todos', bin: 2, why: 'Las cotizadas la comunican a la CNMV para que todos la conozcan a la vez.' },
          ],
        },
        goal: { text: 'Clasifica los seis derechos.', when: [when('done', '==', 6)] },
        insight: 'Derechos **económicos**, **políticos** y **de información**. Y uno muy útil: la **suscripción preferente**, para comprar antes que nadie en una ampliación y no perder tu porcentaje.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: cobrar es económico; votar, político; saber, información.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Tienes más derechos de los que parece.', mood: 'HAPPY' },
          { say: 'Toca cada derecho: ¿de qué tipo es?', mood: 'HAPPY' },
        ],
      }),
      key('Información para todos a la vez', 'Las cotizadas deben publicar sus cuentas y comunicar a la **CNMV** cualquier **información privilegiada** (resultados, compras, problemas) para que todos los inversores la conozcan a la vez. Las cuentas de cualquier cotizada española están gratis en la web de la CNMV.\n\nAlgunas empresas tienen acciones **sin voto** o dan voto doble a quien las mantiene años.', 'Ser accionista te da derechos económicos, políticos y de información, en proporción a tus acciones.', 'Pruébalo: en Mercado, añade a Favoritos tres empresas de las que te gustaría ser dueño.'),
    ], [
      multi('¿Qué derechos te da ser accionista? Marca todos.', ['Votar en la junta general', 'Cobrar dividendos si se reparten', 'Recibir las cuentas de la empresa', 'Que te devuelvan el dinero en una fecha fija'], [0, 1, 2], 'Que te devuelvan el dinero en una fecha fija es propio de un bono: la acción no tiene vencimiento.'),
      match('Empareja cada derecho con su tipo.', [['Cobrar el dividendo', 'Económico'], ['Votar al consejo de administración', 'Político'], ['Recibir las cuentas anuales', 'De información'], ['Comprar antes que nadie en una ampliación', 'Suscripción preferente']], 'Económicos, políticos y de información, más la suscripción preferente para no perder tu porcentaje.'),
      single('En la junta, ¿cuánto pesa normalmente tu voto?', ['Lo mismo que el de un gran fondo', 'Según el número de acciones que tengas', 'Según lo que pagaste por cada acción'], 1, 'Por regla general, una acción = un voto. Quien tiene más acciones, tiene más votos.'),
      num('Una empresa pequeña tiene 4 millones de acciones y tú tienes 20.000. ¿Qué porcentaje de los votos tienes?', 0.5, '%', '20.000 ÷ 4.000.000 = 0,005 → 0,5 % de los votos (si todas las acciones tienen voto).'),
      tf('Si tienes pocas acciones, no tienes derecho a votar en la junta.', false, 'Todos los accionistas con voto pueden votar o delegar. Algunas empresas piden un mínimo de acciones para asistir en persona, pero puedes votar a distancia o agruparte con otros.'),
      scenario('Pablo tiene 50 acciones de una cotizada. Le llega la convocatoria de la junta: se vota subir mucho el sueldo del consejero delegado. ¿Qué hace?', [['Nada: con 50 acciones su voto no cuenta', 'Su voto pesa poco, pero cuenta, y si no vota, otros deciden por él.'], ['Lee la propuesta y vota o delega su voto a distancia', 'Bien: es su derecho como dueño, y las juntas se deciden sumando votos grandes y pequeños.'], ['Vende todas sus acciones en protesta', 'Puede hacerlo, pero renuncia a su parte del negocio por una votación sin haber usado su voz.']], 1, 'Votar o delegar es la forma de ejercer tu derecho político; las cotizadas facilitan el voto a distancia.'),
      fill('Las cotizadas deben comunicar a la ____ la información privilegiada para que todos la conozcan a la vez.', 'CNMV', ['Agencia Tributaria', 'OCU', 'DGT'], 'La Comisión Nacional del Mercado de Valores supervisa la bolsa española y publica esa información gratis.'),
      single('¿Qué es el derecho de suscripción preferente?', ['Cobrar el dividendo antes que los demás accionistas', 'Poder comprar acciones nuevas antes que otros en una ampliación, para no perder tu porcentaje', 'Votar dos veces en la junta'], 1, 'Si la empresa emite acciones nuevas, los accionistas actuales pueden comprar primero en proporción a lo que tienen.'),
      multi('¿Qué puede decidir la junta general de accionistas? Marca todo.', ['Aprobar las cuentas anuales', 'Nombrar a los consejeros', 'Aprobar el reparto de dividendos', 'Fijar el precio de la acción en bolsa'], [0, 1, 2], 'El precio lo fija el mercado con la oferta y la demanda, no la junta.'),
      timed(tf('Una acción no tiene fecha de vencimiento.', true, 'A diferencia de un bono, la acción existe mientras exista la empresa (o hasta que la vendas).'), 10),
      scenario('La empresa de la que Sara tiene acciones anuncia una ampliación de capital: emitirá acciones nuevas para conseguir dinero. Sara no quiere perder su porcentaje. ¿Qué hace?', [['Usa su derecho de suscripción preferente y compra las acciones nuevas que le tocan', 'Bien: compra en proporción a lo que ya tiene y su porcentaje no cambia.'], ['No hace nada: sus acciones siguen siendo suyas', 'Siguen siendo suyas, pero habrá más acciones en total: su porcentaje baja. Es la dilución.'], ['Vota en contra en la junta y se olvida', 'Votar es su derecho, pero si la ampliación sale aprobada, se diluye igual.']], 0, 'La suscripción preferente existe para esto: comprar primero lo que te toca y no perder tu parte. Quedarse quieto parece neutro, pero con más acciones en circulación tu porcentaje baja.'),
    ], { source: '2.1', minutes: 6, retire: [0, 3, 4, 5, 9] }),

    lesson('u8l3', 'Dividendos: cómo y cuándo se cobran', [
      story('El plan maestro', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Plan: compro a 20 € justo antes del dividendo, cobro 0,50 € y vendo.'),
        say('leo', '¡Dinero gratis!'),
        choose('¿Qué falla en el plan de Leo?', [
          opt('Nada: es dinero gratis', 'bad', say('lumi', 'El día que se descuenta el dividendo, la acción abre en torno a 19,50 €.')),
          opt('El precio baja más o menos lo que cobra', 'good', say('lumi', 'Eso. Tiene 0,50 € en efectivo y 0,50 € menos en acciones.')),
          opt('Que tiene que esperar a la fecha de pago', 'ok', say('lumi', 'Cobrará ese día, sí. Pero el precio ya habrá bajado unos 0,50 €.')),
        ]),
        say('leo', 'Bueno, al menos cobro el dividendo, ¿no?'),
        say('lumi', 'Y tributa: en España el pagador ya **retiene un 19 %**.'),
      ]),
      play({
        title: '¿Cobras el dividendo?',
        intro: 'Desde la **fecha ex-dividendo**, la acción cotiza sin el derecho a ese dividendo. Para cobrarlo, tienes que tenerla **antes**.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Lo cobras' }, { label: 'No lo cobras' }],
          cards: [
            { icon: 'cart', label: 'Compras dos días antes de la fecha ex-dividendo', bin: 0, why: 'La tienes antes del ex-dividendo: cobras.' },
            { icon: 'cart', label: 'Compras la víspera de la fecha ex-dividendo', bin: 0, why: 'Es el último día para comprar y cobrar.' },
            { icon: 'cart', label: 'Compras el mismo día ex-dividendo', bin: 1, why: 'Ese día ya cotiza sin el derecho a ese dividendo.' },
            { icon: 'cart', label: 'Compras el día de pago', bin: 1, why: 'Demasiado tarde: ya se miró quién era accionista en la fecha de registro.' },
            { icon: 'tag', label: 'La tenías desde hace un año y la vendes el día ex-dividendo', bin: 0, why: 'La tenías antes del ex-dividendo: ese dividendo es tuyo.' },
          ],
        },
        goal: { text: 'Decide en los cinco casos.', when: [when('done', '==', 5)] },
        insight: 'El orden es **anuncio, ex-dividendo, registro y pago**. Para cobrarlo, la acción tiene que ser tuya **como tarde la víspera del ex-dividendo**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: lo único que importa es tenerla antes del ex-dividendo.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: 'La fecha clave no es la de pago, sino la ex-dividendo.', mood: 'HAPPY' },
          { say: '¿Lo cobras o no? Toca cada caso', mood: 'HAPPY' },
        ],
      }),
      key('Rentabilidad por dividendo', '**Rentabilidad por dividendo = dividendo anual ÷ precio.** Una acción de 30 € que paga 1,20 € al año rinde un 4 %.\n\nOjo: un dividendo altísimo a veces avisa de que el precio ha caído porque se espera un recorte.', 'El dividendo no es dinero gratis: sale del valor de la empresa.', 'Pruébalo: en Mercado, busca Iberdrola, que reparte dividendo cada año, y añádela a Favoritos.'),
    ], [
      order('Ordena las fechas de un dividendo.', ['Anuncio', 'Fecha ex-dividendo', 'Fecha de registro', 'Fecha de pago'], 'Primero se anuncia; desde el ex-dividendo la acción cotiza sin el derecho; después se mira quién es accionista (registro) y por último se paga.'),
      single('¿Qué día tienes que tener la acción, como tarde, para cobrar el dividendo?', ['El mismo día de pago', 'El día anterior a la fecha ex-dividendo', 'La fecha de registro, aunque compres ese mismo día'], 1, 'Si compras el día ex-dividendo o después, la acción ya cotiza sin ese dividendo.'),
      num('Una acción cotiza a 20 € y mañana es la fecha ex-dividendo de un dividendo de 0,50 €. ¿A qué precio aproximado abrirá, si nada más cambia?', 19.5, '€', '20 − 0,50 = 19,50 €. El precio baja más o menos lo que sale de la empresa.'),
      num('Una acción de 30 € paga 1,20 € de dividendo al año. ¿Cuál es su rentabilidad por dividendo?', 4, '%', '1,20 ÷ 30 = 0,04 → 4 %.'),
      num('Tienes 200 acciones y cada una paga 0,50 € de dividendo. Con la retención del 19 %, ¿cuánto llega a tu cuenta?', 81, '€', '200 × 0,50 = 100 € brutos; 100 − 19 = 81 € netos.'),
      tf('Cobrar un dividendo te hace más rico al instante.', false, 'El precio baja más o menos lo mismo que cobras: tu patrimonio apenas cambia, y encima ese dividendo tributa.'),
      upDown('Esta es la acción de una eléctrica conocida por repartir dividendo con regularidad. ¿Qué hizo en las 10 sesiones siguientes?', 'ud-28', 'Que una empresa pague dividendo no hace previsible su precio a corto plazo: el dividendo es una parte de la rentabilidad total, no una garantía.'),
      scenario('Bruno ve una acción con un dividendo del 14 % y quiere meter ahí todos sus ahorros. ¿Qué haces si estás en su lugar?', [['Compro ya, un 14 % es un chollo', 'Si el mercado espera un recorte, el dividendo puede bajar y el precio caer todavía más: el 14 % era una ilusión.'], ['Miro por qué ha caído el precio y si el beneficio cubre el dividendo', 'Bien: un dividendo así suele ser una alarma. Si los beneficios no lo cubren, es probable que se recorte.'], ['Compro justo antes de la fecha ex-dividendo, cobro y vendo', 'El precio baja más o menos el dividendo el día ex-dividendo y encima pagas impuestos: no hay dinero gratis.']], 1, 'La rentabilidad por dividendo sube cuando cae el precio; a veces anticipa problemas en la empresa.'),
      timed(fill('Rentabilidad por dividendo = dividendo anual ÷ ____.', 'precio', ['beneficio', 'número de acciones', 'capitalización'], 'Por eso, si el precio cae, la rentabilidad por dividendo «sube» aunque la empresa no pague más.'), 15),
      single('En España, ¿qué retención se aplica normalmente a los dividendos?', ['19 %', '0 %', '50 %'], 0, 'El pagador retiene un 19 % a cuenta del IRPF. Luego van a la base del ahorro, que tributa del 19 % al 30 %.'),
    ], { source: '4.7', minutes: 6, retire: [1, 2, 3, 4, 5] }),

    lesson('u8l4', 'Splits, contrasplits y ampliaciones', [
      story('«Ha caído un 90 %»', [{ id: 'marta', name: 'Marta' }], [
        say('marta', '¡Socorro! Mi acción ha caído un 90 % hoy.'),
        say('marta', 'Tenía 5 acciones… y ahora me salen 50.'),
        choose('¿Qué ha pasado?', [
          opt('Ha perdido el 90 % de su dinero', 'bad', say('lumi', 'Tiene diez veces más acciones, a la décima parte del precio: lo mismo.')),
          opt('Ha habido un split 10×1', 'good', say('lumi', 'Eso. Misma pizza, cortada en más trozos: su dinero vale lo mismo.')),
          opt('La empresa le ha regalado 45 acciones', 'ok', say('lumi', 'No es un regalo: cada una vale la décima parte. Es un **split**.')),
        ]),
        say('marta', 'Uf. ¿Y para qué lo hacen?'),
        say('lumi', 'Para que cada acción sea más manejable. NVIDIA hizo un 10×1 en 2024.'),
      ]),
      play({
        title: '¿Qué ha pasado aquí?',
        intro: 'Tres operaciones que cambian el número de acciones. Solo una mete **dinero nuevo** en la empresa.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Split' }, { label: 'Contrasplit' }, { label: 'Ampliación' }],
          cards: [
            { icon: 'layers', label: 'Tus 10 acciones a 400 € pasan a ser 40 a 100 €', bin: 0, why: 'Más trozos, mismo valor: sigues teniendo 4.000 €.' },
            { icon: 'layers', label: 'Tus 1.000 acciones a 0,20 € pasan a ser 100 a 2 €', bin: 1, why: 'Se agrupan: menos acciones, más caras, mismo valor.' },
            { icon: 'cash', label: 'La empresa emite acciones nuevas para conseguir dinero', bin: 2, why: 'Entra dinero nuevo y más dueños.' },
            { icon: 'phone', label: 'Apple divide cada acción en cuatro (2020)', bin: 0, why: 'Un split 4×1: cuatro veces más acciones, a la cuarta parte.' },
            { icon: 'down', label: 'Una acción que cotiza a céntimos agrupa sus acciones', bin: 1, why: 'Suele hacerlo quien ha caído mucho: cambia el precio, no el valor.' },
            { icon: 'pie', label: 'Si no compras, tu porcentaje de la empresa baja', bin: 2, why: 'Es la **dilución**: hay más acciones y tú tienes las mismas.' },
          ],
        },
        goal: { text: 'Clasifica los seis casos.', when: [when('done', '==', 6)] },
        insight: 'Split y contrasplit solo cambian el número de trozos. La **ampliación de capital** sí cambia el pastel: entra dinero nuevo y más dueños, y si no acudes, **te diluyes**.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿entra dinero nuevo en la empresa o solo se corta distinto?', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Cortar la pizza en más trozos no te da más pizza.', mood: 'HAPPY' },
          { say: 'Toca cada caso: ¿split, contrasplit o ampliación?', mood: 'HAPPY' },
        ],
      }),
      key('Lo que cambia y lo que no', 'En una ampliación, el **derecho de suscripción preferente** te deja comprar antes que nadie las acciones nuevas que te tocan: así mantienes tu porcentaje.\n\nAlgunas empresas españolas pagan el dividendo en acciones nuevas si quieres: el *scrip* o dividendo flexible.\n\nSi un titular dice «la acción se desploma un 75 %», mira antes si ha habido un split.', 'Split y contrasplit no cambian lo que tienes; una ampliación a la que no acudes, sí: te diluye.', 'Pruébalo: en Mercado, busca NVIDIA, que hizo un split 10×1 en 2024, y mira su gráfico con velas mensuales.'),
    ], [
      num('Tienes 10 acciones a 400 € y la empresa hace un split 4×1. ¿Cuántas acciones tienes después?', 40, 'acciones', '10 × 4 = 40 acciones a 100 € cada una: sigues teniendo 4.000 €.'),
      num('Tienes 1.000 acciones a 0,20 € y hay un contrasplit 1×10. ¿A qué precio cotizará cada acción nueva, si nada más cambia?', 2, '€', '1.000 ÷ 10 = 100 acciones; 200 € ÷ 100 = 2 € por acción.'),
      tf('Después de un split 10×1 eres diez veces más rico.', false, 'Tienes diez veces más acciones, cada una a la décima parte del precio: el valor total es el mismo.'),
      num('Una empresa tiene 100 millones de acciones y tú 1 millón (el 1 %). Amplía capital con 25 millones de acciones nuevas y no compras ninguna. ¿Qué porcentaje tienes ahora?', 0.8, '%', '1 ÷ 125 = 0,008 → 0,8 %. Es la dilución.'),
      match('Empareja cada operación con lo que pasa.', [['Split', 'Más acciones, más baratas, mismo valor'], ['Contrasplit', 'Menos acciones, más caras, mismo valor'], ['Ampliación de capital', 'Acciones nuevas y dinero nuevo para la empresa'], ['Dividendo flexible (scrip)', 'Eliges cobrar en efectivo o en acciones nuevas']], 'Split y contrasplit no cambian el valor de tu posición; la ampliación y el scrip sí cambian el número total de acciones de la empresa.'),
      single('¿Por qué suele hacer una empresa un split?', ['Para que cada acción sea más barata y manejable', 'Para conseguir dinero nuevo', 'Para pagar menos impuestos'], 0, 'No entra dinero ni cambia el valor de la empresa: solo baja el precio de cada acción.'),
      buckets('¿Qué le pasa a tu porcentaje de la empresa?', ['No cambia', 'Baja (dilución)'], [['Split 4×1', 0], ['Contrasplit 1×20', 0], ['Ampliación a la que no acudes', 1], ['Ampliación en la que compras todo lo que te corresponde', 0], ['Split 10×1', 0]], 'Solo la ampliación a la que no acudes te diluye. Si ejerces tu suscripción preferente, mantienes tu porcentaje.'),
      tf('Un contrasplit suele llegar después de buenas noticias para la empresa.', false, 'No cambia el valor, pero suele hacerlo quien ha caído mucho y cotiza a céntimos.'),
      timed(single('Rápido: split 2×1 de una acción de 80 €. ¿Nuevo precio?', ['40 €', '160 €', '80 €'], 0, '80 ÷ 2 = 40 €, y tienes el doble de acciones.'), 12),
      scenario('Marta ve en su app que una acción suya «ha caído un 90 % hoy». Tenía 5 acciones y ahora le aparecen 50. ¿Qué ha pasado?', [['Ha perdido el 90 % de su dinero', 'Sería así con las mismas acciones, pero ahora tiene diez veces más.'], ['Ha habido un split 10×1 y su dinero vale lo mismo', 'Exacto: de 5 a 50 acciones a la décima parte del precio. El valor total no cambia.'], ['La empresa le ha regalado 45 acciones', 'Nadie regala nada: la pizza es la misma, cortada en más trozos.']], 1, 'Antes de asustarte por una caída enorme, comprueba si ha habido un split.'),
      scenario('NVIDIA anuncia un split 10×1 y un amigo te dice: «Ahora que cada acción cuesta diez veces menos, es el momento de comprar». ¿Qué le contestas?', [['Que tiene razón: ahora está mucho más barata', 'Cada acción cuesta menos, pero la empresa vale lo mismo: no está más barata.'], ['Que el split no cambia lo que vale la empresa: hay que decidir por el negocio y su precio total', 'Bien: diez trozos más pequeños de la misma pizza siguen siendo la misma pizza.'], ['Que venda las que tenga antes del split para no perder', 'No hay nada que perder: tras el split, su dinero vale lo mismo.']], 1, 'Un split cambia el precio de cada acción, no el valor de la empresa. Lo tentador es ver una ganga en el precio por acción más bajo, pero lo que pagas por todo el negocio no ha cambiado.'),
      chat(['Mi empresa va a ampliar capital con acciones nuevas.', 'Yo no pienso comprar ninguna. ¿Me afecta en algo?'], '¿Qué le contestas?', [['Sí: si no acudes, tu porcentaje de la empresa baja', 'Eso. Hay más acciones y tú tienes las mismas: te diluyes.'], ['No: tus acciones siguen siendo las mismas', 'Las mismas acciones, pero de un pastel con más trozos: tu parte baja.'], ['Sí: te quitan parte de tus acciones', 'Nadie te quita nada: lo que baja es tu porcentaje.']], 0, 'En una ampliación salen acciones nuevas: si no compras las que te tocan, tu porcentaje baja (dilución). Lo tentador es pensar que no pasa nada porque conservas tus acciones, pero el total ha crecido.'),
    ], { minutes: 6, retire: [0, 1, 2, 3, 7, 9] }),

    lesson('u8l5', 'Grandes, medianas y pequeñas', [
      story('La micro cap del foro', [{ id: 'ana', name: 'Ana' }], [
        say('ana', 'En un foro dicen que esta micro cap, una empresa diminuta, puede multiplicarse por 10.'),
        say('ana', 'Voy a meter todo mi ahorro. ¡Me lo juego todo a esta!'),
        choose('¿Qué le dices a Ana?', [
          opt('Que las pequeñas siempre suben más', 'bad', say('lumi', 'A veces suben más, pero muchas se quedan por el camino o quiebran.')),
          opt('Que puede perderlo casi todo: mejor no jugárselo todo a una', 'good', say('lumi', 'Eso. El potencial existe, pero el riesgo de una sola pequeña es enorme.')),
          opt('Que invierta solo la mitad', 'ok', say('lumi', 'Sigue siendo mucho en una sola empresa pequeña y poco líquida.')),
        ]),
        say('lumi', 'Ojo: los foros también son el sitio favorito de quien quiere inflar una acción.'),
      ]),
      play({
        title: '¿Grande o pequeña?',
        intro: '**Capitalización = precio × número de acciones**: lo que vale la empresa en bolsa. Según su tamaño, cambia su perfil.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Más propio de una grande' }, { label: 'Más propio de una pequeña' }],
          cards: [
            { icon: 'rocket', label: 'Puede multiplicar su tamaño varias veces', bin: 1, why: 'Una empresa de 500 millones puede multiplicarse; una gigante, difícilmente.' },
            { icon: 'eye', label: 'La siguen cientos de analistas', bin: 0, why: 'Las grandes están vigiladas por todo el mercado.' },
            { icon: 'exchange', label: 'Horquillas (spreads) más amplias', bin: 1, why: 'Hay menos compradores y vendedores: operar cuesta más.' },
            { icon: 'shield', label: 'Un precio más estable', bin: 0, why: 'Las grandes suelen ser menos volátiles.' },
            { icon: 'alert', label: 'Quiebra con más frecuencia', bin: 1, why: 'Las pequeñas son más frágiles: quiebran más.' },
            { icon: 'chart', label: 'Está en el S&P 500 o en el IBEX 35', bin: 0, why: 'Son índices de grandes empresas.' },
            { icon: 'flag', label: 'Está en el Russell 2000', bin: 1, why: 'El Russell 2000 reúne pequeñas empresas de EE. UU.' },
          ],
        },
        goal: { text: 'Clasifica los siete rasgos.', when: [when('done', '==', 7)] },
        insight: 'Más pequeña = **más potencial**, pero también **más volatilidad, menos liquidez y más riesgo de quiebra**. Las grandes son más estables y las siguen cientos de analistas.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: lo pequeño crece más deprisa, pero se rompe con más facilidad.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Potencial y riesgo vienen siempre juntos.', mood: 'HAPPY' },
          { say: 'Toca cada rasgo: ¿grande o pequeña?', mood: 'HAPPY' },
        ],
      }),
      key('Tamaños e índices', 'Una convención habitual (en dólares):\n• **Grandes** (*large caps*): más de 10.000 millones.\n• **Medianas** (*mid caps*): de 2.000 a 10.000 millones.\n• **Pequeñas** (*small caps*): de 300 a 2.000 millones.\n• Por debajo, *micro caps*.\n\nEn España están el IBEX Medium Cap y el IBEX Small Cap. Un índice mundial pondera por capitalización: pesan más las gigantes.', 'Más pequeña = más potencial, pero también más volatilidad y más riesgo de quiebra.', 'Pruébalo: en Mercado, compara el gráfico de SXR8, de grandes empresas de EE. UU., con el de IUSN, de pequeñas empresas de todo el mundo.'),
    ], [
      num('Una empresa cotiza a 50 € y tiene 200 millones de acciones. ¿Cuál es su capitalización?', 10000, 'millones de €', '50 × 200 millones = 10.000 millones de euros.'),
      match('Empareja cada tamaño con su capitalización aproximada (convención en dólares).', [['Grande', 'Más de 10.000 millones'], ['Mediana', 'De 2.000 a 10.000 millones'], ['Pequeña', 'De 300 a 2.000 millones'], ['Micro', 'Menos de 300 millones']], 'Son rangos orientativos que usan índices y gestoras; no hay una frontera oficial única.'),
      match('Empareja cada índice con lo que mide.', [['S&P 500', 'Grandes empresas de EE. UU.'], ['Russell 2000', 'Pequeñas empresas de EE. UU.'], ['IBEX 35', 'Las 35 más líquidas de España'], ['IBEX Small Cap', 'Pequeñas empresas españolas']], 'Hay índices para cada tamaño: así se puede comparar cómo se comportan.'),
      single('¿Qué suele tener una empresa pequeña frente a una gigante?', ['Menos volatilidad', 'Más potencial de crecimiento y más riesgo', 'Más analistas siguiéndola'], 1, 'Puede crecer más deprisa, pero sus precios se mueven más y quiebra con más frecuencia.'),
      tf('Una acción de 2 € es de una empresa pequeña y una de 500 € es de una empresa grande.', false, 'El precio de una acción no dice nada del tamaño: hay que multiplicarlo por el número de acciones.'),
      buckets('¿Grande o pequeña? Calcula la capitalización.', ['Grande (más de 10.000 M)', 'Pequeña (300–2.000 M)'], [['20 € × 1.000 millones de acciones', 0], ['5 € × 200 millones de acciones', 1], ['300 € × 50 millones de acciones', 0], ['40 € × 25 millones de acciones', 1]], '20.000 M, 1.000 M, 15.000 M y 1.000 M. El precio por sí solo no dice nada.'),
      scenario('Ana quiere meter todo su ahorro en una micro cap de la que habla un foro: «puede multiplicarse por 10». ¿Qué tiene en cuenta?', [['Que las pequeñas siempre suben más', 'A veces suben más, pero muchas se quedan por el camino o quiebran.'], ['Que es muy volátil y poco líquida, que puede perderlo casi todo y que no conviene jugárselo todo a una', 'Bien: el potencial existe, pero el riesgo de una sola empresa pequeña es enorme.'], ['Que si sale en un foro está bien analizada', 'Los foros también son el sitio favorito de quien quiere inflar una acción para venderla.']], 1, 'Más potencial viene siempre con más riesgo, y concentrarlo todo en una empresa pequeña lo multiplica.'),
      timed(single('Rápido: ¿cómo se calcula la capitalización?', ['Precio × número de acciones', 'Beneficio × precio', 'Ventas ÷ número de acciones'], 0, 'Es el valor de la empresa en bolsa.'), 12),
      tf('Las acciones pequeñas suelen tener spreads (horquillas) más amplios que las grandes.', true, 'Hay menos compradores y vendedores, así que comprar y vender cuesta más.'),
      chat(['Las pequeñas suben más que las grandes, ¿no?', 'Pues me paso todo a small caps 🚀'], '¿Qué le dices?', [['Sí, a largo plazo siempre ganan', 'No siempre: ha habido periodos de muchos años en que las grandes les han ganado con claridad.'], ['Pueden rendir más, pero con más riesgo, y no es una regla fija', '¡Eso! Más potencial, más sustos y años en que van peor.'], ['No, las pequeñas nunca suben', 'Algunas pequeñas se convierten en gigantes; lo difícil es saber cuáles de antemano.']], 1, 'El tamaño cambia el perfil de riesgo, pero no garantiza un resultado.'),
      scenario('Quieres invertir en pequeñas empresas de EE. UU., pero sin jugártelo todo a una. ¿Qué haces?', [['Compro un ETF del Russell 2000, que reúne unas 2.000 pequeñas', 'Bien: tienes el potencial de las pequeñas, repartido entre muchas. Si una quiebra, apenas lo notas.'], ['Compro la pequeña que más ha subido este mes', 'Lo que más ha subido no es lo que más subirá, y sigues con todo en una sola empresa.'], ['Compro la micro cap que recomiendan en un foro', 'Una sola empresa diminuta y poco líquida: si sale mal, lo pierdes casi todo.']], 0, 'Un ETF de pequeñas te da su potencial sin depender de una sola. Elegir una suelta por lo que ha subido o por un foro es tentador, pero concentra todo el riesgo de quiebra.'),
    ], { source: '2.6', minutes: 6, retire: [0, 2, 4, 5, 6, 8] }),

    lesson('u8l6', 'Crecimiento y valor', [
      story('PER de 70 o PER de 9', [{ id: 'laura', name: 'Laura' }], [
        say('laura', 'Dudo entre una tecnológica con PER de 70 que crece un 40 % al año…'),
        say('laura', '…y una aseguradora con PER de 9 que crece un 3 %. ¿Cuál es mejor?'),
        choose('¿Qué razonamiento es el bueno?', [
          opt('La de PER 70: crece mucho más', 'bad', say('lumi', 'Si ese crecimiento ya está en el precio, cualquier decepción la hunde.')),
          opt('Depende de si el precio refleja bien su futuro', 'good', say('lumi', 'Eso. Importa lo que pagas por lo que recibes.')),
          opt('La de PER 9: es barata', 'ok', say('lumi', 'Puede ser barata por algo: un negocio estancado también decepciona.')),
        ]),
        say('lumi', 'Lo barato a veces es barato por algo: es la **trampa de valor**.'),
        say('lumi', 'Una gran empresa no siempre es una gran inversión: depende del precio.'),
      ]),
      // Auditoría RED-15: el PER y su pieza son de u17l1 (sección 0); aquí se da por sabido y la clase va de los dos estilos.
      // Datos de la pieza: ETF iShares Russell 1000 Value (IWD) y Growth (IWF), cierres mensuales ajustados de Yahoo Finance,
      // de junio de 2000 a diciembre de 2006: 10.000 → 17.301 y 6.711. Fixture `mix-styles-2000` (u25l3 vive 2007-2020).
      play({
        title: 'Ningún estilo gana siempre',
        intro: 'Datos reales, de junio de 2000 a diciembre de 2006, justo después de la burbuja tecnológica: tienes **10.000 €** en acciones «de crecimiento» de EE. UU. Pásalos a acciones «de valor» y compara.',
        widget: { kind: 'mix', series: 'mix-styles-2000', weights: [0, 100], amount: 10000 },
        predict: {
          prompt: 'En esos años, ¿qué estilo salió mejor parado?',
          options: ['El crecimiento: las tecnológicas siempre ganan', 'El valor, con mucha diferencia', 'Más o menos igual'],
          answer: 1,
          why: 'Los 10.000 € en crecimiento se quedaron en **6.711 €**; en valor, subieron a **17.301 €**.',
        },
        goal: { text: 'Pasa todo a valor y compara.', when: [when('w0', '==', 100)] },
        insight: 'Tras la burbuja, el crecimiento perdió un tercio y el valor ganó un 73 %. En los catorce años siguientes pasó lo contrario. **Ningún estilo gana siempre**: por eso muchos inversores tienen de los dos.',
        lumi: [
          { when: when('w0', '==', 100), say: 'Aquí ganó el valor. Entre 2007 y 2020 ganó el crecimiento.', mood: 'THINKING' },
          { say: 'Mueve el peso entre crecimiento y valor', mood: 'HAPPY' },
        ],
      }),
      play({
        title: '¿Crecimiento o valor?',
        intro: 'Dos estilos: **crecimiento**, pagas hoy por beneficios futuros, y **valor**, compras beneficios actuales con descuento.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Crecimiento' }, { label: 'Valor' }],
          cards: [
            { icon: 'rocket', label: 'Sus ventas crecen un 40 % al año', bin: 0, why: 'Crece deprisa: el mercado paga hoy por lo que espera mañana.' },
            { icon: 'coins', label: 'PER de 8 y dividendo estable', bin: 1, why: 'Barata frente a lo que gana hoy, y reparte: valor.' },
            { icon: 'sprout', label: 'Reinvierte todo y no paga dividendo', bin: 0, why: 'Reinvierte casi todo para seguir creciendo.' },
            { icon: 'store', label: 'Empresa madura de consumo', bin: 1, why: 'Negocio maduro: el clásico de valor.' },
            { icon: 'tag', label: 'Cotiza barata frente a su patrimonio', bin: 1, why: 'Barata respecto a lo que tiene: valor.' },
            { icon: 'chip', label: 'PER de 50 por un producto nuevo', bin: 0, why: 'Cara frente a lo que gana hoy: crecimiento.' },
          ],
        },
        goal: { text: 'Clasifica las seis empresas.', when: [when('done', '==', 6)] },
        insight: 'Crecimiento: **PER alto**, poco dividendo y mucha reinversión; valor: **PER bajo**, negocio maduro y dividendo, y ninguno gana siempre. Pruébalo: en Mercado, compara el gráfico de NVIDIA con el de Coca-Cola.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: ¿reinvierte para crecer o reparte lo que gana?', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Fíjate en el PER: alto en crecimiento, bajo en valor.', mood: 'HAPPY' },
          { say: 'Toca cada empresa: ¿crecimiento o valor?', mood: 'HAPPY' },
        ],
      }),
    ], [
      match('Empareja cada concepto con su significado.', [['Crecimiento', 'Pagas hoy por beneficios futuros'], ['Valor', 'Compras beneficios actuales con descuento'], ['Trampa de valor', 'Barata porque el negocio va a peor'], ['PER', 'Precio ÷ beneficio por acción']], 'Dos estilos, una herramienta para medirlos y una trampa que conviene conocer.'),
      buckets('¿Crecimiento o valor?', ['Crecimiento', 'Valor'], [['Tecnológica joven que duplica ventas y no paga dividendo', 0], ['Eléctrica madura con PER de 11 y dividendo estable', 1], ['PER de 60 por las expectativas de un producto nuevo', 0], ['Banco que cotiza por debajo de su valor contable', 1], ['Reinvierte todo el beneficio para expandirse', 0]], 'Crecimiento: PER alto, poco dividendo y mucha reinversión. Valor: PER bajo, negocio maduro y dividendo.'),
      num('Una acción cotiza a 100 € y gana 2 € por acción. ¿Cuál es su PER?', 50, 'veces', '100 ÷ 2 = 50: pagas 50 años de los beneficios actuales.'),
      upDown('Marzo de 2000: el Nasdaq 100, lleno de tecnológicas de crecimiento, se ha multiplicado por más de 4 desde finales de 1997. ¿Qué pasó después?', 'hist-dotcom', 'Con PER altísimos, el precio depende de que se cumplan expectativas muy exigentes. Es un caso clásico para estudiar crecimiento y valoración.', 'hasta finales de 2002'),
      upDown('Esta es la acción de una empresa de valor clásica: madura, de consumo, y que paga dividendo desde hace décadas. ¿Qué hizo en las 10 sesiones siguientes?', 'ud-17', 'Ser una empresa estable no hace previsible su precio a corto plazo: las acciones de valor también suben y bajan.'),
      single('¿Qué es una trampa de valor?', ['Una acción barata que sigue bajando porque su negocio se deteriora', 'Una acción de crecimiento muy cara', 'Un fondo que cobra comisiones ocultas'], 0, 'Un PER bajo puede reflejar que los beneficios van a caer: lo barato a veces es barato por algo.'),
      tf('Las acciones de crecimiento suelen repartir dividendos altos.', false, 'Reinvierten casi todo el beneficio para seguir creciendo.'),
      timed(fill('PER = precio ÷ ____ por acción.', 'beneficio', ['dividendo', 'ventas', 'deuda'], 'El PER mide cuántos años de beneficios actuales estás pagando.'), 15),
      scenario('Laura duda entre una tecnológica con PER de 70 que crece un 40 % al año y una aseguradora con PER de 9 que crece un 3 %. ¿Qué razonamiento es el bueno?', [['La de PER 70 es mejor porque crece más', 'Si ese crecimiento ya está en el precio, cualquier decepción puede hundirla.'], ['La de PER 9 es mejor porque es barata', 'Puede ser barata por algo: un negocio que se estanca también decepciona.'], ['Ninguna es mejor por sí sola: depende de si el precio refleja bien su futuro', 'Exacto: crecimiento y valor son estilos, no garantías. Importa lo que pagas por lo que recibes.']], 2, 'Ni «crece mucho» ni «es barata» bastan: hay que comparar el precio con lo que la empresa puede ganar.'),
      single('¿Qué estilo sufre más si el crecimiento esperado decepciona?', ['El de valor', 'El de crecimiento', 'Los dos igual'], 1, 'Con un PER alto, el precio descuenta beneficios futuros; si no llegan, el PER se desinfla.'),
      scenario('Una empresa de crecimiento con PER de 60 presenta resultados: gana más que el año pasado, pero menos de lo que se esperaba. ¿Qué es lo más probable?', [['Sube: ha ganado más', 'Ganar más no basta si el precio ya contaba con todavía más.'], ['Cae con fuerza: el precio descontaba más crecimiento', 'Eso: con un PER alto, una decepción pequeña se paga cara.'], ['No se mueve', 'Los resultados que sorprenden mueven el precio.']], 1, 'En crecimiento pagas por expectativas: lo que cuenta es si se cumplen.'),
      num('Una empresa de valor paga 2 € de dividendo al año y cotiza a 40 €. ¿Qué rentabilidad por dividendo ofrece?', 5, '%', '2 ÷ 40 = 0,05 → 5 %. Las empresas de valor suelen repartir una parte mayor de lo que ganan.'),
    ], { source: '5.5', minutes: 6, retire: [1, 2, 3, 4, 6, 7, 8] }),

    lesson('u8l7', 'Recompras de acciones', [
      story('Menos acciones, más beneficio', [{ id: 'leo', name: 'Leo' }], [
        say('leo', 'Tengo acciones de una empresa que va a recomprar las suyas. ¿Eso a mí qué me da?'),
        note('Una empresa gana 500 millones y tiene 100 millones de acciones: **5 € de beneficio por acción** (BPA).'),
        say('leo', 'Ha anunciado que recompra y amortiza 10 millones de sus propias acciones.'),
        choose('¿Qué pasa con el beneficio por acción?', [
          opt('Sube: el mismo beneficio entre menos acciones', 'good', say('lumi', 'Eso: 500 entre 90 millones, **5,56 €**. Un 11 % más.')),
          opt('Baja: la empresa se ha gastado dinero', 'bad', say('lumi', 'El beneficio es el mismo, pero se reparte entre menos acciones: sube.')),
          opt('No cambia: el beneficio es el mismo', 'ok', say('lumi', 'El beneficio sí, pero hay menos acciones: a cada una le toca más.')),
        ]),
        say('leo', '¿Y yo, que no he hecho nada?'),
        say('lumi', 'Tu porcentaje de la empresa sube sin que pongas un euro.'),
      ]),
      play({
        title: '¿Dividendo o recompra?',
        intro: 'Las dos devuelven dinero al accionista, pero de forma distinta. ¿Qué va con cada una?',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Dividendo' }, { label: 'Recompra' }],
          cards: [
            { icon: 'cash', label: 'Te llega dinero a la cuenta', bin: 0, why: 'El dividendo se cobra en efectivo.' },
            { icon: 'down', label: 'Baja el número de acciones', bin: 1, why: 'Las acciones recompradas se amortizan: quedan menos.' },
            { icon: 'receipt', label: 'Tributas el año en que lo cobras', bin: 0, why: 'El dividendo tributa al cobrarlo.' },
            { icon: 'hourglass', label: 'Solo tributas cuando vendes', bin: 1, why: 'La ganancia se acumula en el precio y pagas al vender.' },
            { icon: 'pie', label: 'Tu porcentaje de la empresa sube', bin: 1, why: 'Menos acciones en total: cada una es una parte mayor.' },
            { icon: 'calendar', label: 'La acción baja el día ex-dividendo', bin: 0, why: 'Ese día el precio baja más o menos lo que se reparte.' },
          ],
        },
        goal: { text: 'Clasifica las seis tarjetas.', when: [when('done', '==', 6)] },
        insight: 'El **dividendo** te llega en efectivo y tributa ese año. La **recompra** sube tu parte y solo tributas cuando vendes.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: la recompra no te ingresa nada; sube tu parte.', mood: 'THINKING' },
          { when: when('done', '>=', 4), say: 'Dos caminos para devolver dinero, con distinta fiscalidad.', mood: 'HAPPY' },
          { say: 'Toca cada tarjeta: ¿dividendo o recompra?', mood: 'HAPPY' },
        ],
      }),
      key('A qué precio recompra', 'Apple lleva desde 2012 recomprando acciones por cientos de miles de millones de dólares.\n\nPero recomprar **caro** destruye valor, y hacerlo **con deuda** añade riesgo.', 'Una recompra reparte el pastel entre menos dueños.', 'Pruébalo: en Mercado, busca Apple, que recompra acciones desde 2012, y añádela a Favoritos.'),
    ], [
      single('¿Qué hace una empresa en una recompra de acciones?', ['Compra sus propias acciones y normalmente las amortiza', 'Emite acciones nuevas', 'Presta dinero a sus accionistas'], 0, 'Al amortizarlas, hay menos acciones y cada una vale una parte mayor de la empresa.'),
      num('Una empresa gana 500 millones y tiene 100 millones de acciones. Recompra y amortiza 10 millones. ¿Nuevo beneficio por acción? (dos decimales)', 5.56, '€', '500 ÷ 90 = 5,56 €, frente a 5 € antes: un 11 % más con el mismo beneficio.'),
      num('Tienes 1.000 de las 1.000.000 de acciones de una empresa (el 0,1 %). Recompra y amortiza 200.000. ¿Qué porcentaje tienes ahora?', 0.125, '%', '1.000 ÷ 800.000 = 0,00125 → 0,125 %. Tu parte crece sin comprar nada.'),
      tf('Recomprar acciones siempre crea valor para el accionista.', false, 'Si la empresa recompra muy caro o se endeuda para hacerlo, puede destruir valor.'),
      buckets('¿Dividendo o recompra?', ['Dividendo', 'Recompra'], [['Te llega dinero a la cuenta', 0], ['Baja el número de acciones', 1], ['Tributa el año en que lo cobras', 0], ['No pagas impuestos hasta que vendes', 1], ['Sube el beneficio por acción', 1]], 'Las dos devuelven dinero al accionista, pero de forma distinta y con distinta fiscalidad.'),
      match('Empareja cada uso del beneficio con su efecto.', [['Dividendo', 'Efectivo para el accionista'], ['Recompra', 'Menos acciones y más parte para cada una'], ['Reinversión', 'Más fábricas, tiendas o investigación'], ['Pagar deuda', 'Menos intereses y menos riesgo']], 'Una empresa puede repartir, recomprar, reinvertir o desendeudarse: cada opción tiene sentido en un momento distinto.'),
      scenario('Una empresa anuncia una gran recompra pagada con un préstamo, justo con su acción en máximos históricos y un PER muy alto. ¿Cómo lo valoras?', [['Genial: toda recompra es buena', 'Recomprar caro y con deuda puede destruir valor: paga mucho por cada acción y añade riesgo.'], ['Con cautela: el precio y la deuda importan', 'Bien: una recompra crea valor si se hace a buen precio y sin poner en riesgo la empresa.'], ['Mal: las recompras son ilegales', 'Son legales y habituales; en EE. UU. pagan desde 2023 un impuesto del 1 %.']], 1, 'Una recompra es tan buena como el precio al que se hace y la forma de pagarla.'),
      timed(tf('Al amortizar las acciones recompradas, el número total de acciones baja.', true, 'Por eso cada acción representa más beneficio.'), 10),
      fill('BPA significa beneficio por ____.', 'acción', ['año', 'activo', 'accionista'], 'Beneficio neto ÷ número de acciones. Una recompra lo sube porque baja el denominador.'),
      single('¿Por qué algunos inversores prefieren las recompras a los dividendos?', ['Porque no tributan hasta que vendes', 'Porque son más seguras', 'Porque las paga Hacienda'], 0, 'El dividendo tributa al cobrarlo; con la recompra, tu ganancia se acumula en el precio y pagas al vender.'),
    ], { minutes: 6, retire: [1, 2, 3, 4, 7] }),
  ],
})
