import 'server-only'
// Unidad 9 · Análisis técnico (docs/curso/09). Premium. Estadísticas de figuras: Bulkowski.
import { fill, img, key, lesson, multi, order, sim, single, text, tf, trend, unit } from '../dsl'

export default unit({
  id: 'u9', order: 9, title: 'Análisis técnico', description: 'Soportes, figuras, medias, RSI, MACD, Bollinger y Fibonacci', premiumOnly: true,
  lessons: [
    lesson('u9l1', 'Soportes y resistencias', [
      img('support', 'Qué son', '**Soporte:** zona donde las caídas se han frenado varias veces porque aparecen compradores.\n**Resistencia:** zona donde las subidas se han frenado porque aparecen vendedores.'),
      text('Por qué existen', 'Son la memoria del mercado: quien compró en 50 € y vio caer a 40 € querrá "salir sin perder" en 50 € (crea resistencia). Quien no compró en 40 € comprará si vuelve (crea soporte). Los números redondos y los máximos históricos atraen órdenes.'),
      text('Cómo trazarlos', '1. Gráfico diario o semanal.\n2. Zonas con al menos 2–3 giros.\n3. Una **zona** (rectángulo), no una línea al céntimo.\n4. Más toques y más volumen = más relevante.\n\n**Cambio de papel:** una resistencia rota suele convertirse en soporte.'),
      text('Falsas roturas', 'Muchas roturas fallan y el precio vuelve dentro. Para reducirlas: espera un **cierre** al otro lado (no solo una mecha) y pide **volumen** superior a la media.'),
      sim('Marca tus zonas', 'El gráfico profesional tiene la herramienta de rectángulo.', 'Marca dos soportes y dos resistencias en el gráfico diario de una acción del IBEX.'),
      key('Lo que te llevas', 'Tras romper un nivel, el precio a menudo vuelve a probarlo antes de seguir.', 'Un soporte es donde antes aparecieron compradores; una resistencia, donde aparecieron vendedores.', 'Trázalos como zonas, no como líneas al milímetro.'),
    ], [
      single('El precio rompe con fuerza una resistencia en 50 € y semanas después vuelve a 50 €. ¿Qué papel suele jugar ahora?', ['Resistencia', 'Soporte', 'Ninguno'], 1, 'Es el cambio de papel.'),
      tf('Los soportes deben trazarse como líneas exactas al céntimo.', false, 'Son zonas donde muchos se ponen de acuerdo.'),
      single('¿Cómo reduces el riesgo de falsa rotura?', ['Esperar un cierre al otro lado con volumen superior a la media', 'Entrar con la primera mecha', 'Ignorar el volumen'], 0, 'La mecha sola no confirma nada.'),
      multi('¿Qué hace más relevante un soporte? Marca todo.', ['Más toques', 'Más volumen en esa zona', 'Que sea reciente', 'Que lo diga un anuncio'], [0, 1, 2], 'Los niveles antiguos y lejanos pesan menos.'),
    ], { source: '9.1', xp: 35 }),

    lesson('u9l2', 'Líneas de tendencia y canales', [
      text('Cómo se traza', '• **Alcista:** une al menos dos mínimos crecientes; se confirma con un tercer toque.\n• **Bajista:** une máximos decrecientes.\n• No la fuerces: si atraviesa varias velas, no es buena.'),
      text('Canales y pendiente', 'Una paralela por los máximos forma un **canal**. Las líneas muy verticales se rompen pronto. En gráficos de años, usa escala logarítmica.'),
      text('Rotura de la línea', 'No es por sí sola un cambio de tendencia: puede iniciar un lateral. Combínala con la estructura de máximos y mínimos.'),
      key('Lo que te llevas', 'Practica con la herramienta de línea de tendencia del gráfico.', 'Una línea alcista une mínimos crecientes; mientras se respete, la tendencia sigue.', 'Si tienes que forzar la línea, la línea está en tu cabeza.'),
    ], [
      single('Una línea de tendencia alcista une…', ['Máximos decrecientes', 'Mínimos crecientes', 'Cierres al azar'], 1, 'Se confirma con un tercer toque.'),
      tf('Romper una línea de tendencia significa siempre que empieza una tendencia contraria.', false, 'Puede empezar un lateral.'),
      single('¿Qué escala conviene para trazar tendencias de varios años?', ['Lineal', 'Logarítmica'], 1, 'En lineal, una tendencia exponencial parece romperse cuando no lo hace.'),
      trend('Fíjate en los mínimos: ¿qué tendencia tiene?', 'trend-up-3', 'Alcista', 'Los mínimos son cada vez más altos: se podría trazar una línea alcista.'),
    ], { source: '9.2', xp: 35 }),

    lesson('u9l3', 'Figuras de cambio de tendencia', [
      text('Hombro-cabeza-hombro', 'Tras una subida, tres máximos: el central (**cabeza**) más alto que los laterales (**hombros**). La **línea clavicular** une los mínimos entre ellos.\n\nSe confirma al **cerrar por debajo** de la clavicular. Objetivo clásico: la altura de la cabeza a la clavicular, proyectada desde la rotura.'),
      text('Lo que dicen los datos (Bulkowski)', '• Caída media tras la rotura: **16 %**.\n• Fracasa (no cae ni un 5 %) el **19 %**.\n• Vuelve a la clavicular el **68 %**.\n• Solo el **51 %** alcanza el objetivo clásico: usa la mitad de la altura como objetivo prudente.'),
      text('Doble techo y doble suelo', '**Doble techo (M):** dos máximos parecidos; se confirma al romper el mínimo intermedio.\n**Doble suelo (W):** dos mínimos parecidos; se confirma al superar el máximo intermedio.\n\nEl gran error: llamar "doble techo" a cualquier par de máximos antes de la rotura.'),
      key('Lo que te llevas', 'Muchos dobles techos "en formación" acaban siendo pausas antes de nuevos máximos.', 'Las figuras solo se confirman al romper su línea clave.', 'Sin rotura no hay figura.'),
    ], [
      single('¿Cuándo se confirma un hombro-cabeza-hombro?', ['Al formarse la cabeza', 'Al cerrar por debajo de la clavicular', 'Al subir el volumen'], 1, 'Antes, solo es una posibilidad.'),
      fill('Cabeza en 120 € y clavicular en 100 €: el objetivo clásico tras la rotura es ____ €.', '80', ['90', '60', '100'], 'Altura de 20 €, proyectada desde 100 €. El prudente de Bulkowski sería 90 €.'),
      single('Según Bulkowski, ¿qué porcentaje de HCH alcanza el objetivo clásico completo?', ['Alrededor del 51 %', 'El 95 %', 'El 5 %'], 0, 'Por eso propone un objetivo de la mitad.'),
      tf('Un doble techo se confirma en cuanto el precio marca el segundo máximo.', false, 'Se confirma al romper el mínimo intermedio.'),
    ], { source: '9.3', xp: 35 }),

    lesson('u9l4', 'Triángulos, banderas y rectángulos', [
      text('Triángulos', '• **Simétrico:** máximos más bajos y mínimos más altos. Indecisión.\n• **Ascendente:** techo horizontal y mínimos crecientes; suele romper al alza.\n• **Descendente:** suelo horizontal y máximos decrecientes; suele romper a la baja.\n\nEl volumen baja al formarse y sube en la rotura.'),
      text('Banderas', 'Tras un movimiento fuerte (el **mástil**), unos días en un pequeño rectángulo inclinado contra la tendencia. Menos de 3 semanas.\n\nBulkowski: rompen al alza el **60 %**, avanzan de media un **9 %** y **fracasan en torno al 44 %**.'),
      text('Rectángulos', 'Un rango lateral entre un soporte y una resistencia claros. La rotura con volumen suele marcar la dirección siguiente.'),
      key('Lo que te llevas', 'Son figuras de recorrido corto: el riesgo debe ser pequeño.', 'Las figuras de continuación son el mercado tomando aire, aunque a veces se gira.', 'Casi la mitad de las veces, la bandera se queda sin aire.'),
    ], [
      single('Techo horizontal y mínimos crecientes. ¿Qué triángulo es?', ['Simétrico', 'Ascendente', 'Descendente'], 1, 'Los compradores aprietan contra la resistencia.'),
      single('Según Bulkowski, ¿qué porcentaje de banderas fracasa en mercados alcistas?', ['5 %', 'Alrededor del 44 %', '90 %'], 1, 'Son figuras de recorrido corto.'),
      tf('El volumen suele bajar mientras se forma un triángulo.', true, 'Y subir en la rotura.'),
      single('¿Cuánto suele durar como máximo una bandera?', ['Menos de 3 semanas', '6 meses', '2 años'], 0, 'Si dura más, es un rectángulo o un canal.'),
    ], { source: '9.4', xp: 35 }),

    lesson('u9l5', 'Medias móviles', [
      text('Qué son', '• **Simple (SMA):** media de los últimos N cierres.\n• **Exponencial (EMA):** pesa más los recientes; reacciona antes.\n\nEn E-Trading puedes activar las de 20, 50, 200 y la exponencial de 21.'),
      text('Cómo se usan', '• **Filtro:** por encima de la SMA 200, tendencia de fondo alcista.\n• **Soporte dinámico:** rebotes en la SMA 20 o 50.\n• **Cruce dorado:** la SMA 50 cruza por encima de la 200. **De la muerte:** por debajo.'),
      text('La evidencia', 'Brock, Lakonishok y LeBaron (1992) vieron que funcionaban en el Dow Jones de 1897 a 1986. Corrigiendo el sesgo de búsqueda de datos, Sullivan, Timmermann y White debilitaron mucho esos resultados, y su poder predictivo disminuyó tras 1986.\n\nEn muchos mercados a la vez, las reglas de tendencia sí han funcionado más de un siglo.'),
      sim('Cruces en el S&P 500', 'Activa las medias en Indicadores.', 'Activa la SMA 50 y la SMA 200 en el gráfico diario del S&P 500 y busca los cruces de los últimos 5 años.'),
      key('Lo que te llevas', 'La SMA 200 es más útil como filtro de riesgo que como sistema para ganar operación a operación.', 'Una media móvil suaviza el precio y muestra la tendencia, siempre con retraso.', 'Las medias no predicen: confirman tarde lo que ya pasa.'),
    ], [
      single('¿Qué es un cruce dorado?', ['La SMA 50 cruza por encima de la 200', 'El precio toca la banda superior', 'El RSI supera 70'], 0, 'El cruce de la muerte es lo contrario.'),
      single('¿Cuál es el principal defecto de las medias móviles?', ['Llegan tarde y fallan en laterales', 'Son muy difíciles de calcular', 'Solo sirven en cripto'], 0, 'Dan "latigazos" cuando no hay tendencia.'),
      tf('La media exponencial reacciona antes que la simple.', true, 'Da más peso a los cierres recientes.'),
      single('¿Qué concluyeron Sullivan, Timmermann y White sobre las reglas de medias?', ['Que funcionaban aún mejor', 'Que corrigiendo el sesgo de búsqueda de datos se debilitaban mucho', 'Que eran ilegales'], 1, 'Muchos resultados del pasado eran en parte casualidad.'),
    ], { source: '9.5', xp: 35 }),

    lesson('u9l6', 'El RSI', [
      text('Qué es', 'El **RSI** (Wilder, 1978) mide la fuerza de las subidas frente a las bajadas de los últimos 14 periodos. Va de 0 a 100.\n\n• Más de 70: sobrecompra.\n• Menos de 30: sobreventa.'),
      text('El error más común', 'Vender porque el RSI supera 70. En tendencias fuertes puede quedarse en 70–80 durante semanas mientras el precio sigue subiendo.'),
      text('Usos más sensatos', '• **Régimen:** en tendencias alcistas, se mueve entre 40 y 80; en bajistas, entre 20 y 60.\n• **Sobreventa en tendencia alcista:** posible zona de compra, con stop.\n• **Divergencias:** precio con máximo más alto y RSI con máximo más bajo. Pueden durar mucho.'),
      key('Lo que te llevas', 'El RSI es un filtro, no una señal suficiente.', 'Un RSI alto no significa "va a caer": en tendencias fuertes puede seguir alto semanas.', 'Sobrecompra significa "ha subido mucho", no "va a caer".'),
    ], [
      single('El RSI lleva tres semanas por encima de 75 y el precio sigue subiendo. ¿Lo más prudente?', ['Vender en corto', 'Entender que en tendencia fuerte puede seguir alto', 'Comprar con apalancamiento'], 1, 'No es una señal de venta por sí solo.'),
      fill('El RSI estándar usa ____ periodos.', '14', ['7', '50', '200'], 'Es el valor que propuso Wilder.'),
      single('Precio con un máximo más alto y RSI con un máximo más bajo. ¿Qué es?', ['Divergencia bajista', 'Cruce dorado', 'Doble suelo'], 0, 'La subida pierde fuerza, pero puede durar mucho.'),
      tf('En tendencias alcistas, el RSI suele moverse entre 40 y 80.', true, 'En bajistas, entre 20 y 60.'),
    ], { source: '9.6', xp: 35 }),

    lesson('u9l7', 'MACD y bandas de Bollinger', [
      text('MACD (12, 26, 9)', '• **Línea MACD:** EMA 12 − EMA 26.\n• **Señal:** EMA 9 de la línea MACD.\n• **Histograma:** la diferencia.\n\nCruce al alza de la señal: más impulso. Por encima de cero: tendencia alcista. Al estar hecho con medias, llega tarde.'),
      text('Bandas de Bollinger (20, 2)', 'Media de 20 con bandas a 2 desviaciones típicas.\n\n• **Se estrechan:** volatilidad baja, suele preceder a un movimiento fuerte (sin decir hacia dónde).\n• En tendencias, el precio puede "caminar" por la banda superior: tocarla no es vender.'),
      key('Lo que te llevas', 'Puedes activar el MACD (en su panel) y las bandas en Indicadores.', 'El MACD mide el impulso; las bandas de Bollinger, la volatilidad.', 'Bollinger estrecho = calma antes de la tormenta, pero no dice hacia dónde.'),
    ], [
      single('Las bandas de Bollinger se estrechan mucho. ¿Qué indica?', ['Que el precio subirá', 'Baja volatilidad, posible movimiento fuerte en cualquier dirección', 'Que el precio bajará'], 1, 'No indica la dirección.'),
      fill('La línea MACD es la EMA de 12 menos la EMA de ____.', '26', ['9', '50', '200'], 'Por eso se escribe MACD (12, 26, 9).'),
      tf('Si el precio toca la banda superior de Bollinger, hay que vender.', false, 'En tendencias fuertes puede caminar por ella días.'),
      single('¿Qué comparten el MACD y las medias móviles?', ['Que llegan tarde', 'Que predicen el futuro', 'Que miden el volumen'], 0, 'El MACD está construido con medias.'),
    ], { source: '9.7', xp: 35 }),

    lesson('u9l8', 'Fibonacci: útil, pero sin magia', [
      text('Qué es', 'Tras un movimiento fuerte, el precio suele retroceder una parte. El **retroceso de Fibonacci** marca los niveles del **23,6 %, 38,2 %, 50 %, 61,8 % y 78,6 %**.\n\nEn E-Trading: herramienta F, toca el mínimo y después el máximo.'),
      text('Uso habitual', 'En tendencia alcista, buscar zonas de compra en retrocesos del 38,2–61,8 %, sobre todo si coinciden con un soporte o una media.'),
      text('Escepticismo', '• No hay pruebas sólidas de que funcionen mejor que otros porcentajes.\n• Con cinco niveles, el precio casi siempre "respeta" alguno.\n• Puede funcionar en parte porque muchos ponen órdenes ahí.'),
      key('Lo que te llevas', 'Úsalo para organizar las zonas de un retroceso, no para predecir.', 'Fibonacci marca zonas típicas de retroceso sin poder especial demostrado.', 'Si trazas cinco líneas, el precio siempre tocará alguna.'),
    ], [
      multi('¿Qué niveles marca el retroceso de Fibonacci? Marca todos.', ['23,6 %', '38,2 %', '61,8 %', '90 %'], [0, 1, 2], 'También el 50 % y el 78,6 %.'),
      tf('Hay pruebas sólidas de que los niveles de Fibonacci predicen los giros.', false, 'No hay evidencia rigurosa.'),
      single('¿Por qué parece que "siempre funciona"?', ['Porque es magia', 'Porque con cinco niveles el precio casi siempre toca alguno', 'Porque lo usan los bancos centrales'], 1, 'Es fácil verlo a posteriori.'),
      single('¿Para qué conviene usarlo?', ['Para organizar zonas de retroceso junto a otros niveles', 'Para predecir con certeza', 'Para elegir bróker'], 0, 'Combinado con soportes y medias.'),
    ], { source: '9.8', xp: 35 }),

    lesson('u9l9', 'Combinar señales en 7 pasos', [
      text('El método', '1. **Semanal:** tendencia de fondo y SMA 200.\n2. **Estructura:** máximos y mínimos.\n3. **Niveles:** soportes y resistencias.\n4. **Situación:** ¿cerca de un nivel o en una figura?\n5. **Señal (diario):** vela confirmada, rotura con volumen o rebote en una media.\n6. **Indicadores como filtro.**\n7. **Plan:** entrada, stop, objetivo y riesgo.'),
      img('riskreward', 'El último paso decide', 'Si el objetivo no está al menos a **2 veces** la distancia del stop, la operación no merece la pena (unidad 10).'),
      text('Indicadores redundantes', 'RSI, estocástico y CCI miden casi lo mismo: tres no son tres confirmaciones, son una. Mejor uno de cada tipo: **tendencia** (medias), **impulso** (RSI o MACD), **volatilidad** (Bollinger) y **volumen**.'),
      key('Lo que te llevas', 'Busca confluencia de piezas distintas.', 'Cada herramienta aporta una pieza: busca coincidencias y no repitas indicadores que dicen lo mismo.', 'Diez indicadores no son diez opiniones.'),
    ], [
      order('Ordena los primeros pasos del método.', ['Tendencia semanal', 'Estructura de máximos y mínimos', 'Niveles', 'Señal de entrada', 'Plan con stop'], 'De lo general a lo concreto.'),
      single('¿Qué combinación es menos redundante?', ['RSI, estocástico y CCI', 'SMA 200, RSI y volumen', 'Tres medias de 20, 21 y 22'], 1, 'Tendencia, impulso y volumen miden cosas distintas.'),
      single('El objetivo está a 1,5 € y el stop a 1 €. Según la regla del método…', ['Merece la pena', 'No llega a 2 veces el riesgo: mejor no operar', 'Hay que doblar el tamaño'], 1, 'La relación beneficio/riesgo debe ser al menos 2:1.'),
      tf('Más indicadores siempre dan más confirmaciones.', false, 'Si miden lo mismo, es la misma opinión repetida.'),
    ], { source: '9.9', xp: 40 }),

    lesson('u9l10', '¿Funciona el análisis técnico?', [
      text('Lo que tiene respaldo', 'El **momentum** y el **seguimiento de tendencia**: las tendencias de 3–12 meses han tendido a persistir en acciones, bonos, divisas y materias primas, con datos desde 1880. Además, un 30–40 % de los profesionales lo considera importante a corto plazo.'),
      text('Lo que no supera las pruebas', '• Muchas reglas dejaron de funcionar con datos nuevos (Park e Irwin, 2007).\n• Patrones de velas: sin valor demostrado tras costes.\n• Fibonacci, ondas de Elliott, Gann: sin evidencia rigurosa.'),
      text('Por qué aprenderlo', '1. Para entradas, salidas y stops con lógica.\n2. Para entender a otros participantes.\n3. Porque una ventaja pequeña con buena gestión del riesgo puede bastar.\n4. Para detectar a los vendedores de humo.'),
      key('Lo que te llevas', 'Ninguna herramienta funciona sin gestión del riesgo: es la unidad siguiente.', 'Tendencia y momentum tienen respaldo; muchas otras ideas no superan las pruebas rigurosas.', 'El análisis técnico te ayuda a decidir dónde te equivocas y cuánto te cuesta.'),
    ], [
      single('¿Qué idea del análisis técnico tiene más respaldo académico?', ['Ondas de Elliott', 'Momentum y seguimiento de tendencia', 'Niveles de Fibonacci'], 1, 'Con datos de más de un siglo.'),
      tf('Según Park e Irwin, la rentabilidad del análisis técnico en acciones ha disminuido o desaparecido en los estudios recientes.', true, 'Muchas reglas antiguas dejaron de funcionar.'),
      single('¿Qué necesita cualquier herramienta técnica para servir de algo?', ['Más indicadores', 'Gestión del riesgo', 'Apalancamiento'], 1, 'Una ventaja grande sin gestión del riesgo acaba en ruina.'),
      multi('¿Qué NO tiene evidencia rigurosa? Marca todo.', ['Ondas de Elliott', 'Fibonacci', 'Momentum', 'Gann'], [0, 1, 3], 'El momentum es la excepción con más respaldo.'),
    ], { source: '9.10', xp: 40 }),
  ],
})
