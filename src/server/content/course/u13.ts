import 'server-only'
// Unidad extra · Vocabulario del inversor (docs/curso/A-glosario). Unidad paralela: se puede hacer en cualquier momento.
// Acceso por plan: src/shared/plans.ts (Free las 3 primeras, Plus las 5 primeras, Max todas).
import { fill, key, lesson, multi, order, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u13', order: 13, title: 'Vocabulario del inversor', description: 'Las palabras del mercado, de «acción» a «venganza», para entender cualquier noticia', side: true,
  lessons: [
    lesson('u13l1', 'El dinero y el ahorro', [
      text('Seis palabras básicas', '• **Inflación:** subida general de los precios. Tu dinero compra menos.\n• **IPC:** el índice que mide la inflación en España.\n• **Interés compuesto:** ganar intereses sobre los intereses.\n• **Rentabilidad real:** rentabilidad menos inflación.\n• **Colchón de emergencia:** 3–6 meses de gastos sin riesgo.\n• **Horizonte temporal:** cuándo necesitarás el dinero.'),
      key('Para recordar', 'Si entiendes estas seis, entiendes por qué invertir.', 'La inflación encoge el dinero parado; el interés compuesto lo hace crecer con el tiempo.', 'Repasa una palabra al día: en un mes hablarás como un inversor.'),
    ], [
      single('¿Qué es la rentabilidad real?', ['La rentabilidad menos la inflación', 'La rentabilidad antes de impuestos', 'Lo que te dice el banco'], 0, 'Es lo que ganas de verdad en poder de compra.'),
      fill('El índice que mide la inflación en España se llama ____.', 'IPC', ['IBEX', 'PER', 'BCE'], 'Índice de Precios de Consumo, del INE.'),
      single('Ganar intereses sobre los intereses ya ganados es…', ['Interés simple', 'Interés compuesto', 'Inflación'], 1, 'Por eso el tiempo pesa tanto.'),
      tf('El horizonte temporal es cuánto dinero tienes.', false, 'Es cuándo lo vas a necesitar.'),
      single('¿Cuánto suele tener un colchón de emergencia?', ['Una semana de gastos', 'De 3 a 6 meses de gastos', 'Un año de sueldo siempre'], 1, 'Más si tus ingresos son inestables.'),
    ], { source: 'A' }),

    lesson('u13l2', 'La bolsa por dentro', [
      text('Las palabras del mercado', '• **Acción:** una parte de una empresa.\n• **Dividendo:** parte del beneficio que se reparte.\n• **Capitalización:** precio × número de acciones.\n• **Índice:** resume un grupo de empresas (IBEX 35, S&P 500).\n• **OPV:** salida a bolsa.\n• **Bróker:** quien lleva tus órdenes al mercado.'),
      text('Comprar y vender', '• **Bid / ask:** mejor precio de compra y de venta.\n• **Spread:** la diferencia entre los dos.\n• **Liquidez:** facilidad para comprar o vender sin mover el precio.\n• **Orden a mercado:** se ejecuta ya.\n• **Orden limitada:** solo a tu precio.'),
      key('Para recordar', 'Cada vez que compras, alguien vende al otro lado del libro de órdenes.', 'El spread es un coste oculto: cuanto menos líquido el activo, más grande.', 'Mira siempre el spread antes de comprar algo poco conocido.'),
    ], [
      single('Precio de la acción × número de acciones es…', ['El dividendo', 'La capitalización', 'El spread'], 1, 'Lo que vale la empresa en bolsa.'),
      fill('La diferencia entre el mejor precio de compra y el de venta se llama ____.', 'spread', ['dividendo', 'cupón', 'índice'], 'También se llama horquilla.'),
      single('Una OPV es…', ['Una salida a bolsa', 'Un tipo de bono', 'Un impuesto'], 0, 'La empresa vende parte de su propiedad a inversores.'),
      tf('Un activo muy líquido se puede comprar y vender mucho sin mover el precio.', true, 'Las grandes acciones del S&P 500 son muy líquidas.'),
      single('¿Qué orden garantiza el precio pero no la ejecución?', ['A mercado', 'Limitada', 'Ninguna'], 1, 'Si el precio no llega, no se ejecuta.'),
    ], { source: 'A' }),

    lesson('u13l3', 'Fondos, ETFs y bonos', [
      text('Fondos y ETFs', '• **Fondo de inversión:** dinero de muchos gestionado en común.\n• **ETF:** fondo que cotiza en bolsa, casi siempre indexado.\n• **Fondo indexado:** copia un índice con costes bajos.\n• **TER:** coste anual del fondo.\n• **Acumulación / distribución:** reinvierte o reparte dividendos.\n• **KID:** resumen obligatorio de riesgos y costes.'),
      text('Bonos', '• **Bono:** un préstamo a un Estado o empresa.\n• **Cupón:** el interés que paga.\n• **Vencimiento:** cuándo te devuelven el dinero.\n• **Duración:** cuánto se mueve su precio si cambian los tipos.\n• **High yield:** bonos de peor calidad que pagan más.'),
      key('Para recordar', 'Un TER bajo es una de las pocas cosas que sí puedes controlar.', 'Fondos y ETFs reparten tu dinero entre muchos activos; los bonos son préstamos con intereses.', 'Antes de comprar un fondo, busca su TER en el KID.'),
    ], [
      fill('El coste anual de un fondo o ETF se llama ____.', 'TER', ['KID', 'IPC', 'ATR'], 'Gastos corrientes.'),
      single('Un fondo de acumulación…', ['Reparte los dividendos', 'Los reinvierte', 'No invierte'], 1, 'No tributas hasta vender.'),
      single('El interés que paga un bono se llama…', ['Dividendo', 'Cupón', 'Spread'], 1, 'Periódico y pactado.'),
      tf('Un bono high yield es más seguro que uno AAA.', false, 'Paga más porque es más arriesgado.'),
      single('¿Qué mide la duración de un bono?', ['Su sensibilidad a los tipos de interés', 'Los años que lleva emitido', 'Su color'], 0, 'Duración 7 ≈ −7 % si los tipos suben un punto.'),
    ], { source: 'A' }),

    lesson('u13l4', 'Riesgo y cartera', [
      text('Medir el riesgo', '• **Volatilidad:** cuánto se mueve un precio.\n• **Drawdown:** la mayor caída desde un máximo.\n• **Correlación:** si dos activos se mueven juntos (de −1 a +1).\n• **Riesgo específico:** el de una empresa concreta.\n• **Riesgo de mercado:** el que afecta a todas.'),
      text('Gestionar la cartera', '• **Diversificar:** repartir entre muchos activos.\n• **Asignación de activos:** cuánto en acciones, bonos y liquidez.\n• **Rebalancear:** volver al reparto elegido.\n• **Apalancamiento:** operar con más dinero del que tienes.\n• **Ponerse corto:** vender lo que no tienes para recomprarlo más barato.'),
      key('Para recordar', 'Diversificar elimina el riesgo específico; el de mercado solo se reduce con otros activos.', 'Volatilidad es cuánto se mueve; drawdown, cuánto duele.', 'Cuando oigas "apalancado", piensa: "las pérdidas también se multiplican".'),
    ], [
      single('La mayor caída desde un máximo se llama…', ['Volatilidad', 'Drawdown', 'Rebalanceo'], 1, 'Mide el dolor real de una inversión.'),
      single('¿Qué riesgo elimina la diversificación?', ['El de mercado', 'El específico de cada empresa', 'Todos'], 1, 'El de mercado queda.'),
      fill('Volver al reparto de activos que elegiste se llama ____.', 'rebalancear', ['apalancar', 'especular', 'indexar'], 'Vendes lo que más subió y compras lo que menos.'),
      tf('Una correlación de +1 significa que dos activos se mueven siempre igual.', true, '−1 sería siempre al contrario.'),
      single('Vender algo que no tienes esperando recomprarlo más barato es…', ['Ponerse corto', 'Diversificar', 'Rebalancear'], 0, 'Su pérdida potencial es ilimitada.'),
    ], { source: 'A' }),

    lesson('u13l5', 'Gráficos y velas', [
      text('Leer un gráfico', '• **OHLC:** apertura, máximo, mínimo y cierre.\n• **Tendencia:** alcista, bajista o lateral.\n• **Soporte / resistencia:** zonas donde el precio dejó de caer / de subir.\n• **Volumen:** cuánto se negoció.\n• **Gap (hueco):** salto entre un cierre y la siguiente apertura.'),
      text('Las velas', '• **Cuerpo:** de la apertura al cierre. **Mecha:** hasta el máximo y el mínimo.\n• **Doji:** apertura y cierre casi iguales.\n• **Martillo:** mecha inferior larga tras una caída.\n• **Estrella fugaz:** mecha superior larga tras una subida.\n• **Envolvente:** una vela cuyo cuerpo se come el de la anterior.\n• **Marubozu:** cuerpo largo sin mechas.'),
      key('Para recordar', 'Una vela es una frase; el contexto es el libro entero.', 'El cierre es el precio más importante de cada vela.', 'Cuando veas una vela rara, pregúntate primero de dónde viene el precio.'),
    ], [
      single('Apertura y cierre casi iguales, con mechas a los dos lados:', ['Martillo', 'Doji', 'Marubozu'], 1, 'Indecisión.'),
      fill('El salto de precio entre un cierre y la apertura siguiente se llama ____.', 'gap', ['spread', 'doji', 'cupón'], 'En español, hueco.'),
      single('Mecha inferior larga y cuerpo pequeño arriba, tras una caída:', ['Martillo', 'Estrella fugaz', 'Envolvente'], 0, 'Tras una subida se llamaría hombre colgado.'),
      order('Ordena las letras de OHLC.', ['Apertura', 'Máximo', 'Mínimo', 'Cierre'], 'Open, high, low, close.'),
      tf('Una resistencia es una zona donde el precio ha dejado de subir varias veces.', true, 'El soporte es lo contrario.'),
    ], { source: 'A' }),

    lesson('u13l6', 'Indicadores técnicos', [
      text('Los más usados', '• **Media móvil (SMA / EMA):** media de los últimos precios.\n• **Cruce dorado:** la media de 50 cruza por encima de la de 200.\n• **RSI:** fuerza de 0 a 100; más de 70, sobrecompra.\n• **MACD:** impulso con dos medias exponenciales.\n• **Bandas de Bollinger:** volatilidad alrededor de una media.\n• **ATR:** rango medio de las velas.\n• **Fibonacci:** niveles típicos de retroceso.\n• **Momentum:** lo que más sube tiende a seguir un tiempo.'),
      key('Para recordar', 'Muchos indicadores miden lo mismo: elige uno de tendencia, uno de impulso y el volumen.', 'Los indicadores confirman; no predicen.', 'Sobrecompra no significa "va a caer".'),
    ], [
      single('La media de 50 sesiones cruza por encima de la de 200:', ['Cruce dorado', 'Cruce de la muerte', 'Doji'], 0, 'Señal alcista clásica.'),
      fill('El indicador de fuerza de 0 a 100 se llama ____.', 'RSI', ['MACD', 'ATR', 'TER'], 'Relative Strength Index, de Wilder.'),
      single('¿Qué mide el ATR?', ['El rango medio de las velas', 'Los dividendos', 'El volumen'], 0, 'Útil para colocar stops.'),
      tf('El momentum es una de las ideas técnicas con más respaldo académico.', true, 'Con datos de más de un siglo.'),
      single('Las bandas de Bollinger miden sobre todo…', ['La volatilidad', 'El beneficio de la empresa', 'Los impuestos'], 0, 'Se estrechan con poca volatilidad.'),
    ], { source: 'A' }),

    lesson('u13l7', 'Trading y gestión del riesgo', [
      text('Las palabras del trader', '• **Stop loss:** orden que vende si el precio cae a un nivel.\n• **Take profit:** vende al llegar a tu objetivo.\n• **Tamaño de posición:** cuántas acciones compras según tu stop.\n• **R:** lo que arriesgas en una operación.\n• **Esperanza matemática:** lo que gana de media cada operación.\n• **Backtesting:** probar un sistema en el pasado.\n• **Sobreoptimización:** ajustarlo tanto al pasado que falla en el futuro.\n• **Diario de trading:** registro de cada operación.'),
      key('Para recordar', 'Primero el stop, después el tamaño.', 'Si no sabes cuánto arriesgas (1R), no estás operando: estás apostando.', 'Una operación sin stop es una pregunta sin respuesta.'),
    ], [
      single('Lo que arriesgas en una operación, en múltiplos, se llama…', ['R', 'PER', 'TER'], 0, 'Si arriesgas 100 € y ganas 300 €, ganas 3R.'),
      fill('Probar un sistema con datos del pasado se llama ____.', 'backtesting', ['rebalanceo', 'apalancamiento', 'scalping'], 'Imprescindible antes de usar dinero real.'),
      single('Ajustar un sistema hasta que el pasado sale perfecto es…', ['Diversificar', 'Sobreoptimizar', 'Indexar'], 1, 'Suele fallar en el futuro.'),
      tf('La esperanza matemática mide cuánto gana de media cada operación.', true, 'Contando aciertos y fallos.'),
      single('¿Qué orden vende automáticamente al llegar a tu objetivo?', ['Stop loss', 'Take profit', 'Limitada de compra'], 1, 'Asegura la ganancia.'),
    ], { source: 'A' }),

    lesson('u13l8', 'Los sesgos que cuestan dinero', [
      text('Cuando el cerebro decide por ti', '• **Aversión a la pérdida:** perder duele el doble que alegra ganar.\n• **Efecto disposición:** vender pronto lo que gana y aguantar lo que pierde.\n• **FOMO:** miedo a quedarse fuera de una subida.\n• **Efecto rebaño:** hacer lo que hace la mayoría.\n• **Exceso de confianza:** creer que sabes más de lo que sabes.'),
      text('Más atajos peligrosos', '• **Sesgo de confirmación:** leer solo lo que te da la razón.\n• **Anclaje:** fijarte en un precio pasado ("estaba a 100").\n• **Recencia:** creer que lo último seguirá pasando.\n• **Coste hundido:** seguir porque ya perdiste mucho.\n• **Falacia del jugador:** "ha bajado 6 días, mañana sube seguro".\n• **Venganza** (*revenge trading*): operar más grande para recuperar una pérdida.'),
      key('Para recordar', 'Ponerle nombre a un sesgo es el primer paso para frenarlo.', 'Los sesgos no se eliminan: se frenan con reglas escritas antes de operar.', 'Después de tres pérdidas seguidas, apaga la pantalla.'),
    ], [
      single('"Estaba a 120 € y ahora a 70 €: está tirada." ¿Qué sesgo es?', ['Anclaje', 'FOMO', 'Recencia'], 0, 'El precio pasado no dice nada del valor actual.'),
      single('Tras tres pérdidas, abres una operación el doble de grande para recuperar. Eso es…', ['Diversificar', 'Operar por venganza', 'Rebalancear'], 1, 'Revenge trading: uno de los errores más caros.'),
      fill('Vender pronto lo que gana y mantener lo que pierde se llama efecto ____.', 'disposición', ['rebaño', 'anclaje', 'red'], 'Odean lo midió en miles de cuentas.'),
      multi('¿Cuáles son sesgos? Marca todos.', ['FOMO', 'Coste hundido', 'Falacia del jugador', 'Diversificación'], [0, 1, 2], 'Diversificar es una buena práctica, no un sesgo.'),
      single('Leer solo opiniones que te dan la razón es…', ['Sesgo de confirmación', 'Aversión a la pérdida', 'Momentum'], 0, 'Su antídoto: buscar la opinión contraria.'),
    ], { source: 'A' }),

    lesson('u13l9', 'Empresas y valoración', [
      text('Los números de una empresa', '• **BPA:** beneficio por acción.\n• **PER:** precio ÷ BPA. Cuántos años de beneficio pagas.\n• **PEG:** PER ÷ crecimiento.\n• **EBITDA:** beneficio antes de intereses, impuestos y amortizaciones.\n• **Flujo de caja libre:** caja que genera menos lo que invierte.\n• **ROE / ROIC:** rentabilidad de los fondos propios / del capital invertido.\n• **Foso:** ventaja competitiva duradera.\n• **Margen de seguridad:** valor estimado menos precio.\n• **CAPE:** PER de 10 años del mercado entero.'),
      key('Para recordar', 'Un PER bajo no es barato si la empresa va mal; uno alto no es caro si crece mucho.', 'Precio es lo que pagas; valor, lo que obtienes.', 'Si los beneficios nunca llegan a la caja, desconfía.'),
    ], [
      fill('Precio de la acción dividido entre el beneficio por acción es el ____.', 'PER', ['ROE', 'TER', 'IPC'], 'Cuántos años de beneficios actuales pagas.'),
      single('Una ventaja competitiva duradera se llama…', ['Foso', 'Gap', 'Cupón'], 0, 'Moat, en inglés.'),
      single('¿Qué ratio relaciona el PER con el crecimiento?', ['PEG', 'ROE', 'CAPE'], 0, 'Cerca de 1 se considera razonable.'),
      tf('El margen de seguridad es comprar claramente por debajo del valor estimado.', true, 'Te protege si te equivocas.'),
      single('El CAPE mide…', ['El PER de una empresa en un año', 'El PER del mercado con beneficios de 10 años', 'Los dividendos'], 1, 'Muy alto se ha asociado a rentabilidades futuras más bajas.'),
    ], { source: 'A' }),

    lesson('u13l10', 'Invertir desde España', [
      text('Las palabras que te encontrarás', '• **Base del ahorro:** la parte del IRPF donde tributan tus inversiones (19–30 %).\n• **Traspaso:** mover dinero entre fondos sin pagar impuestos.\n• **Regla de los dos meses:** si recompras lo mismo en dos meses, la pérdida espera.\n• **FOGAIN:** fondo que cubre hasta 100.000 € si quiebra tu bróker.\n• **Chiringuito:** entidad sin autorización.\n• **CNMV:** el supervisor de los mercados.\n• **Modelo 720 / 721:** declarar bienes o cripto en el extranjero de más de 50.000 €.\n• **W-8BEN:** baja al 15 % la retención de EE. UU.\n• **MiCA:** la ley europea de criptoactivos.'),
      key('Para recordar', 'Antes de usar un bróker o una plataforma cripto, búscala en la CNMV.', 'Las ganancias solo tributan cuando vendes; los fondos se traspasan sin peaje.', 'Si te contactan sin pedirlo, comprueba en cnmv.es antes de nada.'),
    ], [
      single('Una entidad que ofrece inversiones sin autorización es un…', ['Chiringuito', 'FOGAIN', 'ETF'], 0, 'La CNMV publica la lista de advertencias.'),
      fill('Mover dinero de un fondo a otro sin pagar impuestos se llama ____.', 'traspaso', ['rescate', 'cupón', 'spread'], 'Ventaja de los fondos frente a los ETFs.'),
      single('¿Cuánto cubre el FOGAIN por inversor?', ['20.000 €', '100.000 €', 'Todo'], 1, 'Si una entidad adherida no puede devolver lo tuyo.'),
      tf('El modelo 720 sirve para declarar bienes en el extranjero de más de 50.000 €.', true, 'El 721 es para criptomonedas.'),
      single('¿Qué formulario reduce la retención de EE. UU. sobre dividendos al 15 %?', ['W-8BEN', 'KID', 'Modelo 100'], 0, 'Lo firmas con tu bróker.'),
    ], { source: 'A' }),
  ],
})
