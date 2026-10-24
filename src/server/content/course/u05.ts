import 'server-only'
// Unidad 5 · Análisis fundamental (docs/curso/05). Premium. Ejemplo inventado: «Panadería Global».
import { fill, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u5', order: 5, title: 'Análisis fundamental', description: 'Cuentas, ratios, ventajas competitivas y valoración', premiumOnly: true,
  lessons: [
    lesson('u5l1', 'Precio y valor no son lo mismo', [
      text('Dos formas de mirar', '**Fundamental:** estudia el negocio para estimar cuánto **vale** y compararlo con su **precio**. Responde a *qué* comprar.\n\n**Técnico:** estudia el gráfico para anticipar movimientos. Intenta responder a *cuándo*.'),
      text('El señor Mercado', 'Benjamin Graham imaginaba un socio maníaco-depresivo que cada día te ofrece un precio distinto por el negocio. Unos días pide una locura; otros te lo regala. No tienes por qué hacerle caso: puedes aprovechar sus cambios de humor.'),
      text('Margen de seguridad', 'El valor siempre es una estimación. Por eso Graham compraba solo cuando el precio estaba **claramente por debajo** del valor estimado: esa diferencia te protege si te equivocas.'),
      key('Lo que te llevas', '"El precio es lo que pagas; el valor es lo que obtienes" (Buffett).', 'Una empresa excelente comprada demasiado cara puede ser una mala inversión.', 'Busca un precio claramente por debajo del valor.'),
    ], [
      single('¿Qué intenta responder el análisis fundamental?', ['Cuándo comprar', 'Qué comprar y si está caro o barato', 'Qué vela viene mañana'], 1, 'El técnico intenta responder a cuándo.'),
      fill('La diferencia entre el valor estimado y el precio pagado se llama margen de ____.', 'seguridad', ['beneficio', 'error', 'maniobra'], 'Te protege si te equivocas en la estimación.'),
      tf('Una gran empresa es siempre una buena inversión, a cualquier precio.', false, 'Si pagas demasiado, puede ser una mala inversión durante años.'),
      single('Según Graham, ¿cómo hay que tratar al "señor Mercado"?', ['Hacer siempre lo que dice', 'Aprovechar sus cambios de humor sin obedecerle', 'Ignorar los precios'], 1, 'Sus precios son una oferta, no una orden.'),
    ], { source: '5.1' }),

    lesson('u5l2', 'La cuenta de resultados', [
      text('De arriba abajo', 'Panadería Global (millones €), un ejemplo inventado:\n\n• Ventas: 1.000\n• − Coste de ventas: 600 → **margen bruto 400** (40 %)\n• − Gastos operativos: 200 → **EBITDA 200**\n• − Amortizaciones: 50 → **EBIT 150** (15 %)\n• − Intereses: 20 − Impuestos: 32,5 → **beneficio neto 97,5**'),
      text('El beneficio por acción', 'Con 100 millones de acciones, el **BPA** es 97,5 ÷ 100 = **0,975 €**. Es la base del PER.'),
      text('Qué mirar en los márgenes', '• Margen bruto alto (60–80 %) en software o lujo; bajo (20–30 %) en supermercados.\n• Lo importante es la **tendencia**: márgenes que suben año tras año suelen indicar poder para fijar precios.'),
      key('Lo que te llevas', 'De las ventas se restan costes hasta llegar al beneficio neto.', 'La cuenta de resultados va de las ventas al beneficio neto.', 'Las ventas son vanidad, el beneficio cordura y la caja realidad.'),
    ], [
      order('Ordena la cuenta de resultados de arriba abajo.', ['Ventas', 'Margen bruto', 'EBITDA', 'EBIT', 'Beneficio neto'], 'Se van restando costes, amortizaciones, intereses e impuestos.'),
      fill('Beneficio neto de 50 M€ y 25 millones de acciones: el BPA es ____ €.', '2', ['0,5', '20', '1.250'], '50 ÷ 25 = 2 € por acción.'),
      single('¿Qué suele indicar un margen que sube año tras año?', ['Problemas contables', 'Poder para fijar precios', 'Que va a quebrar'], 1, 'La tendencia importa más que la cifra suelta.'),
      single('EBITDA significa beneficio antes de…', ['Ventas y costes', 'Intereses, impuestos, depreciaciones y amortizaciones', 'Dividendos'], 1, 'Mide lo que gana el negocio en sí.'),
    ], { source: '5.2' }),

    lesson('u5l3', 'El balance', [
      text('Lo que tiene y lo que debe', '**Activo = pasivo + patrimonio neto.**\n\nPanadería Global: caja 80, deuda financiera 400, patrimonio neto 450 (millones €).'),
      text('Los ratios del balance', '• **Deuda neta** = deuda − caja = 320 M€.\n• **Deuda neta / EBITDA** = 320 ÷ 200 = **1,6 veces**. Menos de 2 es cómodo; más de 4, preocupante (según el sector).\n• **Valor contable por acción** = 450 ÷ 100 = 4,5 €.'),
      key('Lo que te llevas', 'Las eléctricas e inmobiliarias suelen tener más deuda; compara siempre dentro del sector.', 'Activo = pasivo + patrimonio neto. La deuda neta/EBITDA mide cuánto pesa la deuda.', 'La deuda no hunde a una empresa en los años buenos: la hunde en los malos.'),
    ], [
      single('Deuda financiera 300 M€, caja 100 M€, EBITDA 100 M€. Deuda neta/EBITDA:', ['1', '2', '3'], 1, '(300 − 100) ÷ 100 = 2 veces.'),
      fill('Activo = pasivo + ____.', 'patrimonio neto', ['ventas', 'EBITDA', 'dividendos'], 'Lo que la empresa tiene se financia con deudas o con dinero de los accionistas.'),
      tf('Una deuda neta/EBITDA de 6 veces suele considerarse cómoda.', false, 'Por encima de 4 suele ser preocupante, según el sector.'),
      single('¿Qué sectores suelen tener más deuda de forma normal?', ['Software', 'Eléctricas e inmobiliarias', 'Consultoras'], 1, 'Tienen ingresos estables y muchos activos físicos.'),
    ], { source: '5.3' }),

    lesson('u5l4', 'El flujo de caja libre', [
      text('Las tres partes del flujo de caja', '1. **Operativo:** dinero que genera el negocio.\n2. **De inversión:** hornos, tiendas, compras de empresas (*capex*).\n3. **De financiación:** deuda, dividendos y recompras.'),
      text('El flujo de caja libre', '**FCF = flujo operativo − inversiones.**\n\nPanadería Global genera 160 M€ e invierte 60 M€: FCF = **100 M€**, 1 € por acción. Es lo que podría repartir o usar para reducir deuda.'),
      text('La señal de alarma', 'Beneficios año tras año con flujo de caja libre siempre negativo: algo no cuadra. Muchos fraudes (Enron, Wirecard, Gowex) tenían beneficios que no se convertían en caja.'),
      key('Lo que te llevas', 'El flujo de caja es mucho más difícil de maquillar que el beneficio.', 'El beneficio es una opinión contable; la caja es un hecho.', 'Si los beneficios nunca llegan a la caja, desconfía.'),
    ], [
      fill('Flujo operativo de 80 M€ e inversiones de 30 M€: el flujo de caja libre es ____ M€.', '50', ['110', '30', '2,7'], '80 − 30 = 50 M€.'),
      single('Beneficios crecientes y caja libre negativa durante cinco años. ¿Qué indica?', ['Una empresa muy sana', 'Una señal de alarma', 'Nada'], 1, 'Los beneficios no se están convirtiendo en dinero real.'),
      tf('El flujo de caja libre es más fácil de maquillar que el beneficio.', false, 'Es al revés: la caja es un hecho.'),
      multi('¿Qué entra en el flujo de financiación? Marca todos.', ['Dividendos', 'Pedir o devolver deuda', 'Recompras de acciones', 'Ventas a clientes'], [0, 1, 2], 'Las ventas forman parte del flujo operativo.'),
    ], { source: '5.4' }),

    lesson('u5l5', 'PER, PEG y otros ratios', [
      text('Panadería Global a 15 €', '• **PER** = precio ÷ BPA = 15 ÷ 0,975 = **15,4**. Pagas 15,4 años de beneficios.\n• **PEG** = PER ÷ crecimiento (%) = 15,4 ÷ 8 = **1,9**.\n• **EV/EBITDA** = (1.500 + 320) ÷ 200 = **9,1**. Incluye la deuda.'),
      text('Más ratios', '• **Rentabilidad por FCF:** 1 ÷ 15 = 6,7 %.\n• **Rentabilidad por dividendo:** 0,50 ÷ 15 = 3,3 %.\n• ***Pay-out*** = dividendo ÷ BPA = 51 %. Más del 80–90 % sostenido pone el dividendo en riesgo.'),
      text('Cuidado con los ratios', '• PER bajo no es barato: puede ser una empresa en declive.\n• PER alto no es caro: puede crecer mucho (para eso está el PEG).\n• Compara dentro del sector: un banco a PER 8 y un software a PER 35 pueden estar en su precio.'),
      key('Lo que te llevas', 'Un PEG cercano a 1 se considera razonable; por encima de 2, caro para su crecimiento.', 'Un ratio solo dice algo si lo comparas: con su historia, su sector y su crecimiento.', 'Un PER de 10 puede ser caro y uno de 30 barato.'),
    ], [
      single('Una acción cotiza a 30 € con un BPA de 2 €. ¿Su PER?', ['2', '15', '60'], 1, '30 ÷ 2 = 15.'),
      single('Dos empresas con PER 20: A crece un 20 % y B un 5 %. ¿Cuál es más barata por PEG?', ['A (PEG 1)', 'B (PEG 4)', 'Igual'], 0, 'El PEG relaciona el precio con el crecimiento.'),
      single('¿Qué ratio tiene en cuenta la deuda de la empresa?', ['PER', 'EV/EBITDA', 'Rentabilidad por dividendo'], 1, 'El valor de empresa suma la deuda neta.'),
      tf('Un PER bajo siempre significa que la acción está barata.', false, 'Puede reflejar declive o un beneficio puntual inflado.'),
      fill('Una empresa reparte 1,10 € de dividendo con un BPA de 1 €: su pay-out es del ____ %.', '110', ['10', '50', '90'], 'Paga más de lo que gana: el dividendo podría recortarse.'),
    ], { source: '5.5', xp: 35 }),

    lesson('u5l6', 'ROE, ROIC: ¿es un buen negocio?', [
      text('Dos medidas', '• **ROE** = beneficio neto ÷ patrimonio neto = 97,5 ÷ 450 = **21,7 %**. Más del 15 % sostenido es muy bueno.\n• **ROIC** = EBIT × (1 − impuestos) ÷ (patrimonio + deuda neta) = 112,5 ÷ 770 = **14,6 %**. Debe superar el coste del capital (≈ 8–10 %).'),
      text('El truco del ROE', 'El ROE se puede inflar con **deuda**: con mucha deuda el patrimonio es pequeño y el ROE parece enorme. El ROIC incluye la deuda, por eso es más fiable.'),
      key('Máquinas de componer', 'Una empresa con ROIC del 20 % que puede reinvertir a esa tasa durante años multiplica su valor de forma espectacular.', 'Los mejores negocios ganan mucho con poco capital, y pueden reinvertir a esas tasas.', 'Busca negocios que conviertan cada euro en mucho más de un euro.'),
    ], [
      fill('Beneficio neto de 30 M€ y patrimonio neto de 200 M€: el ROE es del ____ %.', '15', ['6,7', '30', '170'], '30 ÷ 200 = 15 %.'),
      single('¿Por qué el ROIC es más fiable que el ROE?', ['Porque es más alto', 'Porque incluye la deuda y no se infla con ella', 'Porque lo calcula Hacienda'], 1, 'El ROE se dispara si la empresa se endeuda mucho.'),
      tf('Un ROIC del 5 % con un coste de capital del 9 % crea valor.', false, 'Si el ROIC no supera el coste del capital, destruye valor.'),
      single('¿Qué ROE sostenido se considera muy bueno?', ['Más del 15 %', 'Alrededor del 3 %', 'Negativo'], 0, 'Siempre que no venga de un endeudamiento excesivo.'),
    ], { source: '5.6', xp: 35 }),

    lesson('u5l7', 'Ventajas competitivas: el foso', [
      text('Los cinco fosos', '1. **Intangibles:** marcas, patentes, licencias.\n2. **Costes de cambio:** cambiar de proveedor cuesta mucho (software empresarial, bancos).\n3. **Efecto red:** más usuarios = más valor (redes sociales, pagos, bolsas).\n4. **Costes bajos:** escala o procesos.\n5. **Escala eficiente:** el mercado solo da para uno o dos.'),
      text('Cómo se ve en los números', '• Márgenes y ROIC altos y estables 10 años.\n• Puede subir precios sin perder clientes, incluso con inflación.\n• Mantiene o gana cuota de mercado.'),
      text('Pagar el foso demasiado caro', 'En 2000, Microsoft o Cisco cotizaban a PER de 60–100. Quien compró Microsoft en su máximo de 2000 tardó unos 16 años en recuperar ese precio.'),
      key('Lo que te llevas', 'Sin foso, la competencia acaba comiéndose los beneficios de cualquier empresa.', 'Un buen negocio necesita un foso; una buena inversión, además, un buen precio.', 'Busca el foso, pero no lo pagues a cualquier precio.'),
    ], [
      single('Una red social con miles de millones de usuarios tiene sobre todo…', ['Ventaja en costes', 'Efecto red', 'Una patente'], 1, 'Vale más cuantos más usuarios tiene.'),
      single('Cambiar el software de gestión de una gran empresa es caro y arriesgado. ¿Qué foso es?', ['Costes de cambio', 'Escala eficiente', 'Ninguno'], 0, 'El cliente se queda aunque suban los precios.'),
      tf('Si una empresa tiene un gran foso, su acción es una buena compra a cualquier precio.', false, 'Microsoft tardó unos 16 años en recuperar su máximo de 2000.'),
      multi('¿Qué señales en los números indican un foso? Marca todas.', ['Márgenes altos y estables', 'Subir precios sin perder clientes', 'Pérdidas constantes', 'ROIC alto durante años'], [0, 1, 3], 'Las pérdidas constantes indican lo contrario.'),
    ], { source: '5.7', xp: 35 }),

    lesson('u5l8', 'Valorar: descuento de flujos y CAPE', [
      text('Descontar el futuro', 'Un euro dentro de 10 años vale menos que hoy, porque hoy podrías invertirlo.\n\n**Valor hoy = flujo futuro ÷ (1 + tasa)^años**'),
      text('Panadería Global', 'FCF de 1 €/acción, crece un 6 % 10 años y después un 2 %, con una tasa del 9 %:\n\n• Flujos de 10 años descontados: ≈ 8,6 €\n• Valor terminal descontado: ≈ 11,0 €\n• **Valor ≈ 19,6 €.** A 15 €, margen del 23 %.'),
      text('La lección del DCF', 'Con una tasa del 10 %: unos 17 €. Con un crecimiento del 4 %: unos 16,9 €. Con las dos: **14,7 €**, ya por debajo del precio.\n\nPequeños cambios, grandes diferencias: sirve para pensar, no para dar una cifra exacta.'),
      text('Valorar el mercado: el CAPE', 'Precio del índice ÷ media de beneficios reales de **10 años**.\n\n• Media del S&P 500 desde 1871: unos 17.\n• Máximo: 44 (1999).\n• Octubre de 2026: cerca de **41**.\n\nNo dice cuándo caerá, pero se ha asociado a rentabilidades más bajas en los 10 años siguientes.'),
      key('Lo que te llevas', 'Un CAPE alto en EE. UU. es otro argumento para diversificar por países.', 'Una empresa vale el dinero que generará en el futuro, traído al presente.', 'Si cambias un poco las hipótesis y el valor se desploma, ve con cuidado.'),
    ], [
      single('En un DCF, si subes la tasa de descuento, el valor…', ['Sube', 'Baja', 'No cambia'], 1, 'El dinero futuro vale menos hoy.'),
      single('¿Qué divide el CAPE?', ['Precio entre el beneficio del último año', 'Precio entre la media de beneficios reales de 10 años', 'Ventas entre deuda'], 1, 'Suaviza el ciclo económico.'),
      tf('Un CAPE muy alto indica exactamente cuándo caerá el mercado.', false, 'Puede seguir caro años; se asocia a rentabilidades futuras más bajas.'),
      single('¿Para qué sirve sobre todo un DCF?', ['Para obtener el valor exacto', 'Para pensar qué crecimiento descuenta el precio', 'Para elegir el bróker'], 1, 'Pequeños cambios en las hipótesis cambian mucho el resultado.'),
    ], { source: '5.8', xp: 40 }),

    lesson('u5l9', 'Analizar una empresa en 30 minutos', [
      text('La lista', '1. ¿Entiendo cómo gana dinero?\n2. ¿Crece?\n3. ¿Es rentable (márgenes, ROIC)?\n4. ¿Genera caja?\n5. ¿Está sana (deuda)?\n6. ¿Tiene foso?\n7. ¿Quién la dirige?\n8. ¿Está cara?\n9. ¿Qué puede salir mal?\n10. ¿Qué me haría vender?'),
      text('Señales de alarma', '• Beneficios que crecen y caja que no.\n• Deuda que crece sin beneficios.\n• Cambios de auditor o de director financiero.\n• Ampliaciones de capital constantes.\n• Dividendos pagados con deuda.\n• Directivos que venden muchas acciones.'),
      text('Dónde están los datos', '• Web de relación con inversores de cada empresa.\n• CNMV (empresas españolas).\n• SEC EDGAR (EE. UU.: informes 10-K y 10-Q).'),
      sim('Tu primer análisis', 'Elige una empresa que conozcas como cliente.', 'Aplica la lista de 10 preguntas y escribe en tres frases por qué la comprarías o no.'),
      key('Lo que te llevas', 'Vende si la tesis se rompe, no porque el precio baje.', 'Antes de comprar, explica en tres frases por qué y qué te haría vender.', 'Si no puedes explicarlo en tres frases, aún no estás listo.'),
    ], [
      multi('¿Qué son señales de alarma? Marca todas.', ['Dividendos pagados con deuda', 'Caja libre en línea con el beneficio', 'Cambios frecuentes de auditor', 'Ampliaciones de capital constantes'], [0, 2, 3], 'Que la caja acompañe al beneficio es buena señal.'),
      single('¿Dónde encuentras los informes oficiales de una empresa de EE. UU.?', ['En la SEC (EDGAR)', 'En la CNMV', 'En redes sociales'], 0, 'Informes 10-K anuales y 10-Q trimestrales.'),
      single('¿Cuándo tiene sentido vender según tu análisis?', ['Cuando el precio baja un poco', 'Cuando la tesis de inversión se rompe', 'Cuando lo dice un foro'], 1, 'El precio puede bajar sin que el negocio empeore.'),
      tf('"Porque sube" es una buena tesis de inversión.', false, 'Una tesis explica por qué el negocio vale más que su precio.'),
    ], { source: '5.9', xp: 40 }),
  ],
})
