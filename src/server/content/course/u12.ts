import 'server-only'
// Unidad 12 · Invertir de verdad desde España (docs/curso/12). Acceso por plan: src/shared/plans.ts
// Fiscalidad estatal vigente en 2026; revisar cada enero (docs/curso/E-bibliografia §8).
import { fill, key, lesson, multi, order, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u12', order: 12, title: 'Invertir desde España', description: 'Bróker, estafas, impuestos y el paso al dinero real',
  lessons: [
    lesson('u12l1', 'Cómo elegir un bróker', [
      text('1. Regulación', 'Debe estar **autorizado por la CNMV** o por un supervisor de la UE con pasaporte para operar en España. Compruébalo en los registros de cnmv.es, no en la web del bróker.'),
      text('2. Protección y 3. costes', '• Tus valores son tuyos y están separados del bróker. Si faltara algo, el **FOGAIN** cubre hasta **100.000 €** (no cubre caídas del mercado).\n• Costes: comisión por operación, custodia, **cambio de divisa** (el coste oculto más alto), inactividad.'),
      text('4. Productos y 5. fiscalidad', '• ¿Tiene los fondos indexados y ETF UCITS que quieres?\n• Los brókers **españoles** retienen e informan a Hacienda: la declaración es casi automática.\n• Los **extranjeros** no: declaras tú todo, y quizá el modelo 720.'),
      key('Lo que te llevas', 'Primero que sea seguro y esté autorizado; después, que sea barato.', 'Antes de mirar cuánto cobra un bróker, mira quién lo vigila.', 'Comprueba siempre en la CNMV, no en la web del propio bróker.'),
    ], [
      single('¿Qué es lo primero que compruebas de un bróker?', ['Que tenga la app más bonita', 'Que esté autorizado por la CNMV o un supervisor europeo', 'Que sea el más barato'], 1, 'La seguridad va antes que el precio.'),
      single('¿Qué cubre el FOGAIN?', ['Las caídas del mercado', 'Hasta 100.000 € si una entidad adherida no puede devolver lo tuyo', 'Todo lo que inviertas'], 1, 'No cubre pérdidas por la evolución del mercado.'),
      tf('Un bróker extranjero suele enviar tus datos fiscales a Hacienda y retener por ti.', false, 'Normalmente no: te toca declararlo todo.'),
      single('¿Cuál suele ser el coste oculto más alto al comprar en otra moneda?', ['La custodia', 'El cambio de divisa', 'La app'], 1, 'Del 0,1 % al 0,5 % o más por operación.'),
    ], { source: '12.1', xp: 35 }),

    lesson('u12l2', 'Chiringuitos financieros y estafas', [
      text('Las estafas más habituales', '• Llamadas o mensajes no solicitados de "asesores".\n• Anuncios falsos con famosos.\n• Esquemas Ponzi: pagan a los primeros con el dinero de los nuevos.\n• Estafas de "recuperación" tras una estafa.\n• Grupos de Telegram con señales que inflan una moneda.\n• Webs que imitan a bancos o brókers.'),
      text('Las señales de alarma', '1. Te contactan sin pedirlo.\n2. Rentabilidades altas garantizadas.\n3. Prisa.\n4. Te piden instalar AnyDesk o TeamViewer.\n5. Transferencias al extranjero o en cripto.\n6. No están en la CNMV o están en su lista de advertencias.\n7. Ves tu saldo crecer, pero no puedes retirarlo sin pagar.'),
      text('Qué hacer', '• Comprueba la entidad en cnmv.es (registros y advertencias).\n• Nunca des contraseñas, códigos ni acceso a tu ordenador.\n• Si te han estafado: denuncia a la Policía o la Guardia Civil y avisa a la CNMV.'),
      key('Lo que te llevas', 'Un chiringuito ofrece servicios de inversión sin autorización. La CNMV publica cientos de advertencias cada año.', 'Si te contactan sin pedirlo para ofrecerte rentabilidades altas y seguras, es casi seguro una estafa.', 'Nadie que gane un 20 % al mes te llamaría para contártelo.'),
    ], [
      single('Te llama un "asesor" desconocido y te ofrece un 5 % mensual garantizado. ¿Qué haces?', ['Invierto un poco para probar', 'Cuelgo y compruebo el nombre en las advertencias de la CNMV', 'Le doy acceso a mi ordenador'], 1, 'Es una señal clara de chiringuito.'),
      multi('¿Qué son señales de estafa? Marca todas.', ['Piden instalar AnyDesk', 'No puedes retirar tu saldo sin pagar', 'Autorización de la CNMV comprobada en su web oficial', 'Rentabilidad garantizada'], [0, 1, 3], 'La autorización comprobada en cnmv.es es lo que debe tener una entidad legal.'),
      tf('Tras una estafa, un despacho que promete recuperar tu dinero a cambio de una comisión suele ser otra estafa.', true, 'Se llaman estafas de recuperación.'),
      fill('Una entidad que ofrece inversiones sin autorización se llama ____ financiero.', 'chiringuito', ['bróker', 'fondo', 'banco'], 'La CNMV publica la lista de advertencias.'),
    ], { source: '12.2', xp: 35 }),

    lesson('u12l3', 'Cómo tributan tus inversiones', [
      text('La base del ahorro', 'Intereses, dividendos y ganancias por ventas van a la base del ahorro del IRPF (escala estatal 2026):\n\n• Hasta 6.000 €: **19 %**\n• 6.000–50.000 €: **21 %**\n• 50.000–200.000 €: **23 %**\n• 200.000–300.000 €: **27 %**\n• Más de 300.000 €: **30 %**'),
      text('Cuándo se paga', '• Dividendos e intereses: el año en que los cobras (retención del 19 %).\n• Ganancias: **solo cuando vendes**. Mientras mantengas, no pagas: diferimiento fiscal.\n\nGanancia = venta − compra, incluidos gastos. Si compraste en varias veces: **FIFO**.'),
      text('Ejemplos', '• Ganancia de 8.000 €: 6.000 × 19 % + 2.000 × 21 % = **1.560 €**.\n• Ganancia de 60.000 €: **12.680 €**.\n\nCuidado en cripto: cambiar una por otra también es una venta fiscal.'),
      key('Lo que te llevas', 'País Vasco y Navarra tienen normas propias. Comprueba siempre en la Agencia Tributaria.', 'Las ganancias tributan en la base del ahorro, del 19 % al 30 %, y solo cuando las haces realidad.', 'Comprar y mantener también ahorra impuestos.'),
    ], [
      single('Vendes con una ganancia de 10.000 €. ¿Impuesto con la escala de 2026?', ['1.900 €', '1.980 €', '3.000 €'], 1, '6.000 × 19 % + 4.000 × 21 % = 1.980 €.'),
      tf('Pagas impuestos cada año por lo que sube tu fondo aunque no vendas.', false, 'Solo al vender o reembolsar.'),
      fill('Si compraste en varias veces, se consideran vendidas primero las primeras compradas: método ____.', 'FIFO', ['LIFO', 'DCA', 'PER'], 'First in, first out.'),
      single('Cambias bitcoin por ether sin pasar por euros. Fiscalmente…', ['No pasa nada', 'Es una venta que puede generar ganancia o pérdida', 'Está exento'], 1, 'Es una permuta: tributa.'),
    ], { source: '12.3', xp: 40 }),

    lesson('u12l4', 'Compensar pérdidas y la regla de los dos meses', [
      text('Compensación', '• Las pérdidas por ventas se restan de las ganancias del mismo año.\n• Lo que sobre, de los dividendos e intereses hasta un **25 %**.\n• Y lo que quede, en los **4 años siguientes**.\n\nGanas 5.000 € con unas acciones y pierdes 3.000 € con otras: tributas por 2.000 €.'),
      text('La regla de los dos meses', 'Artículo 33.5 de la Ley del IRPF: una pérdida **no se aplica todavía** si has comprado valores homogéneos (los mismos) en los **dos meses anteriores o posteriores** (un año si no cotizan).\n\nNo se pierde: queda aplazada hasta que vendas los recomprados.'),
      key('Optimización legal', 'Realizar pérdidas a final de año para compensar ganancias es legal, respetando los dos meses. Pero la fiscalidad nunca debe ser el motivo principal de una inversión.', 'Las pérdidas reducen tus impuestos durante 4 años, pero no si recompras lo mismo en dos meses.', 'Si recompras lo mismo en dos meses, la pérdida espera.'),
    ], [
      single('Ganas 4.000 € con unas acciones y pierdes 6.000 € con otras. ¿Qué pasa con los 2.000 € que sobran?', ['Se pierden', 'Compensan hasta un 25 % de dividendos e intereses y el resto, 4 años', 'Te los devuelve Hacienda en efectivo'], 1, 'Es la compensación de rentas del IRPF.'),
      single('Vendes un ETF con pérdidas el 10 de diciembre y lo recompras el 5 de enero. ¿Aplicas la pérdida?', ['Sí', 'No: queda aplazada por la regla de los dos meses'], 1, 'Se aplicará cuando vendas los recomprados.'),
      fill('Las pérdidas no compensadas se pueden aplicar en los ____ años siguientes.', '4', ['2', '10', '1'], 'Después caducan.'),
      tf('La regla de los dos meses hace que la pérdida se pierda para siempre.', false, 'Solo la aplaza.'),
    ], { source: '12.4', xp: 40 }),

    lesson('u12l5', 'Fondos, ETFs y planes de pensiones', [
      text('El traspaso entre fondos', 'Puedes mover dinero de un fondo a otro **sin pagar impuestos** si no pasa por tu cuenta y se hace por traspaso. Pagas solo al reembolsar.\n\nPermite rebalancear, cambiar de gestora o de estrategia sin coste fiscal.'),
      text('ETFs', 'No tienen el régimen de traspaso (salvo una excepción técnica muy limitada). Cada venta tributa. Para quien mantiene a largo plazo la diferencia es pequeña; para quien mueve mucho, importa.'),
      text('Planes de pensiones', '• Aportar reduce la base imponible general: hasta **1.500 €/año** en planes individuales, ampliable con planes de empresa hasta **10.000 €** en ciertos casos.\n• Al rescatar, **todo** tributa como rendimiento del trabajo.\n• Liquidez limitada.\n• Mira el TER: muchos son caros.'),
      key('Lo que te llevas', 'El plan de pensiones compensa si tu tipo marginal hoy es alto y esperas que sea más bajo al jubilarte.', 'Los fondos se mueven sin pagar impuestos; los ETFs, no; los planes desgravan hoy y tributan mañana.', 'El traspaso entre fondos es cambiar de carril sin peaje.'),
    ], [
      single('¿Qué ventaja fiscal tienen los fondos frente a los ETFs en España?', ['El traspaso no tributa hasta el reembolso', 'No tributan nunca', 'Sus dividendos están exentos'], 0, 'Es el régimen de traspasos.'),
      single('¿Cómo tributa el rescate de un plan de pensiones?', ['Base del ahorro, 19–30 %', 'Rendimiento del trabajo, a tu tipo marginal, por todo lo rescatado', 'Exento'], 1, 'Aportaciones y ganancias.'),
      fill('El límite general de aportación a un plan de pensiones individual es de ____ € al año.', '1.500', ['8.000', '500', '20.000'], 'Ampliable con aportaciones de empresa en ciertos casos.'),
      tf('Para que el traspaso no tribute, el dinero puede pasar por tu cuenta corriente.', false, 'Debe hacerse por el procedimiento de traspaso.'),
    ], { source: '12.5', xp: 40 }),

    lesson('u12l6', 'Dividendos extranjeros y modelos 720 y 721', [
      text('Doble imposición', 'Un dividendo de EE. UU. paga primero allí (**15 %** si firmaste el **W-8BEN**; si no, 30 %) y después en España.\n\nPuedes deducir la doble imposición hasta el límite del convenio. Un ETF europeo de acumulación lo gestiona por dentro.'),
      text('Modelo 720', 'Si tienes en el extranjero más de **50.000 €** en cuentas, **valores** (en un bróker extranjero) o inmuebles, presentas el modelo 720 entre enero y marzo. Las sanciones desproporcionadas se anularon en 2022, pero la obligación sigue.'),
      text('Modelo 721 y patrimonio', '• **721:** criptomonedas custodiadas en el extranjero por más de 50.000 € a 31 de diciembre.\n• **Patrimonio:** por encima de 700.000 € (más hasta 300.000 € de vivienda), con variaciones por comunidad. No afecta a la mayoría de quien empieza.'),
      key('Lo que te llevas', 'Un bróker extranjero puede ser barato, pero el papeleo con Hacienda corre de tu cuenta.', 'Los dividendos de fuera pueden pagar dos veces, y los bienes en el extranjero por encima de 50.000 € se declaran.', 'Firma el W-8BEN si cobras dividendos de EE. UU.'),
    ], [
      single('¿Qué formulario reduce al 15 % la retención de EE. UU. sobre dividendos?', ['W-8BEN', 'Modelo 100', 'KID'], 0, 'Sin él, retienen un 30 %.'),
      single('Tienes 60.000 € en acciones en un bróker con sede en Alemania. ¿Qué obligación tienes?', ['Ninguna', 'Presentar el modelo 720', 'Pagar un 50 % extra'], 1, 'Superas los 50.000 € en valores en el extranjero.'),
      fill('El modelo informativo de criptomonedas en el extranjero por más de 50.000 € es el ____.', '721', ['720', '100', '303'], 'Desde 2024.'),
      tf('Las sanciones del modelo 720 se anularon y por eso ya no hay que presentarlo.', false, 'Se anularon las sanciones desproporcionadas, no la obligación.'),
    ], { source: '12.6', xp: 40 }),

    lesson('u12l7', 'Tu plan financiero completo', [
      text('Las piezas', '1. Presupuesto: ahorra al menos un 10–20 %.\n2. Colchón de 3–6 meses.\n3. Fuera deudas caras.\n4. Seguros: salud, vida si tienes personas a cargo, hogar.\n5. Inversión a largo plazo con aportación automática.\n6. Especulación opcional, pequeña y con plan.\n7. Fiscalidad: fondos, compensación, plan de pensiones.\n8. Revisión anual.'),
      text('Carla, 27 años', 'Ingresa 1.900 €/mes netos, gasta 1.400 €.\n\n• Colchón: 6.000 €.\n• Sin deudas.\n• **400 €/mes** automáticos: 80 % fondo mundial, 20 % bonos.\n• **100 €/mes** como máximo para especular con su plan. Si en un año no bate al fondo mundial, lo deja.\n• Revisión cada enero.'),
      key('Lo que te llevas', 'Invertir es una pieza de tu vida financiera, no un fin en sí mismo.', 'Un buen plan une colchón, deudas, seguros, inversión y fiscalidad en una página.', 'El mejor plan es el que eres capaz de seguir veinte años.'),
    ], [
      order('Ordena las primeras piezas del plan financiero.', ['Presupuesto', 'Colchón', 'Eliminar deudas caras', 'Invertir a largo plazo'], 'La base primero.'),
      single('¿Qué parte de los ingresos se suele recomendar ahorrar e invertir como mínimo?', ['1 %', '10–20 %', '80 %'], 1, 'Es una referencia habitual.'),
      tf('Los seguros forman parte de un plan financiero.', true, 'Protegen frente a golpes que ninguna inversión cubre.'),
      single('Si en un año su especulación no bate al fondo mundial, Carla…', ['Arriesga más', 'Lo deja', 'Pide un préstamo'], 1, 'Comparar con un índice es la prueba honesta.'),
    ], { source: '12.7', xp: 40 }),

    lesson('u12l8', 'Del simulador al dinero real', [
      text('Cuándo estás listo', '✓ Cumples la lista de los 4 puntos (unidad 1).\n✓ Has escrito tu Declaración de Política de Inversión.\n✓ Llevas 2–3 meses en el simulador.\n✓ Has vivido una caída sin vender en pánico.\n✓ Tienes un bróker autorizado y entiendes sus costes.\n✓ Para trading: 50+ operaciones con esperanza positiva tras costes.'),
      text('La transición', '1. Mes 1: abre la cuenta y aporta poco (50–100 €) de forma automática.\n2. Meses 2–6: sube hasta tu aportación del plan.\n3. Trading: una fracción pequeña y la mitad del riesgo del simulador.\n4. Sigue usando E-Trading para probar ideas.'),
      key('Lo que has aprendido', 'El dinero parado pierde valor · la rentabilidad viene del riesgo y la paciencia · diversificar, gastar poco y no vender en pánico funciona · los gráficos son un idioma · en trading manda la gestión del riesgo · combate tus sesgos con reglas · aprovecha la fiscalidad legal.', 'Pasa al dinero real con un plan escrito, la base preparada y empezando con poco.', 'El siguiente paso es pequeño, aburrido y automático. Por eso funciona.'),
    ], [
      multi('¿Qué necesitas antes de pasar al dinero real? Marca todo.', ['Colchón y sin deudas caras', 'Un plan escrito', 'Un bróker autorizado', 'Haber acertado una moneda de moda'], [0, 1, 2], 'La suerte con una moda no es preparación.'),
      single('Al empezar con dinero real en trading, ¿qué riesgo por operación usas?', ['El doble que en el simulador', 'La mitad que en el simulador', 'Todo'], 1, 'Aparece la psicología del dinero real.'),
      order('Ordena la transición al dinero real.', ['Base preparada', 'Plan escrito', 'Bróker autorizado', 'Aportación automática pequeña', 'Subir poco a poco'], 'Sin prisas.'),
      tf('Después de pasar al dinero real, el simulador ya no sirve para nada.', false, 'Sirve para probar ideas antes de arriesgar dinero.'),
    ], { source: '12.8', xp: 50 }),
  ],
})
