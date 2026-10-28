import 'server-only'
// Sección 6 · Unidad 17 · Ratios y valoración (docs/curso-v2/02-curriculo.md)
// Ejemplo inventado del manual: «Panadería Global, S. A.» (cotiza a 15 €, BPA 0,975 €, FCF 1 € por acción).
import { buckets, chat, fill, key, lesson, match, num, order, scenario, single, spot, text, tf, timed, trend, unit, upDown } from '../dsl'

export default unit({
  id: 'u17', order: 17, title: 'Ratios y valoración', description: 'PER, PEG, EV/EBITDA, ROE, dividendos, DCF y CAPE con números de verdad',
  lessons: [
    lesson('u17l1', 'El PER', [
      text('Qué es el PER', '**PER = precio ÷ BPA** (o capitalización ÷ beneficio neto).\n\nPanadería Global cotiza a 15 € y su BPA es 0,975 €: **PER = 15,4**. Pagas 15,4 veces el beneficio de un año.\n\nSu inverso es la **rentabilidad por beneficio**: 1 ÷ 15,4 = **6,5 %**, comparable con lo que paga un bono.'),
      text('Cómo leerlo', '• La media histórica del mercado ronda **15-17**.\n• **PER bajo no es barato:** puede ser una empresa en declive o con un beneficio puntual inflado (por vender un edificio).\n• **PER alto no es caro:** puede crecer muy deprisa.\n• Compara con su **historia** y su **sector**: un banco a PER 8 y un software a PER 35 pueden estar «en su precio».'),
      key('Histórico y adelantado', 'Con el beneficio del último año es el PER histórico; con el beneficio previsto, el **PER adelantado**. Si el beneficio va a crecer mucho, el adelantado será más bajo.', 'Un PER de 10 puede ser caro y uno de 30 barato: depende de lo que vaya a ganar la empresa.'),
    ], [
      num('Una acción cotiza a 30 € y su BPA es de 2 €. ¿Cuál es su PER?', 15, 'veces', '30 ÷ 2 = 15: pagas 15 años del beneficio actual.'),
      num('Una empresa capitaliza 4.000 M€ y gana 250 M€ al año. ¿Cuál es su PER?', 16, 'veces', '4.000 ÷ 250 = 16. Da igual hacerlo por acción o con la empresa entera.'),
      num('Una acción tiene un PER de 20. ¿Cuál es su rentabilidad por beneficio?', 5, '%', '1 ÷ 20 = 5 %.'),
      fill('PER = precio ÷ ____.', 'BPA', ['ventas', 'dividendo', 'deuda'], 'Precio de la acción entre el beneficio por acción.'),
      fill('Si el BPA se duplica y el precio no se mueve, el PER se reduce a la ____.', 'mitad', ['tercera parte', 'cuarta parte', 'décima parte'], 'El mismo precio entre el doble de beneficio da la mitad de PER.'),
      tf('Un PER bajo siempre significa que la acción está barata.', false, 'Puede reflejar una empresa en declive o un beneficio puntual inflado.'),
      single('Un año, una empresa vende su sede y su beneficio se triplica. Su PER cae de 18 a 6. ¿Qué ha pasado?', ['El PER está distorsionado por un beneficio puntual', 'Se ha convertido en una ganga', 'Su negocio ha mejorado mucho'], 0, 'Ese beneficio no se repetirá: hay que mirar el beneficio recurrente.'),
      num('Una acción a 60 € tiene un BPA de 3 € este año y se espera un BPA de 4 € el próximo. ¿Cuál es su PER adelantado?', 15, 'veces', '60 ÷ 4 = 15. El histórico es 60 ÷ 3 = 20.'),
      timed(single('Rápido: precio 45 €, BPA 3 €. ¿PER?', ['12', '15', '18'], 1, '45 ÷ 3 = 15.'), 12),
      chat(['He encontrado una acción con PER 4 😍', '¡Está regalada!'], '¿Qué le contestas a Lumi?', [['Cómprala ya, que se escapa', 'Antes de nada: casi nada tiene PER 4 sin motivo, y hay que averiguar cuál.'], ['Mira por qué es tan bajo: beneficio puntual, negocio en declive o deuda enorme', 'Vale, investigo antes de enamorarme del número.'], ['Un PER bajo siempre es mejor', 'No siempre: a veces es la forma que tiene el mercado de decir «este beneficio no va a durar».']], 1, 'Un PER muy bajo es una pregunta, no una respuesta.'),
    ], { source: '5.5' }),

    lesson('u17l2', 'PEG, EV/EBITDA y precio/valor contable', [
      text('PEG: el PER con crecimiento', '**PEG = PER ÷ crecimiento anual esperado del BPA (en %).**\n\nPanadería Global: PER 15,4 y crece al 8 % → PEG = **1,9**.\n\n• Cerca de 1: razonable.\n• Por encima de 2: caro para su crecimiento.\n\nDos empresas con PER 20: si una crece al 20 % (PEG 1) y otra al 5 % (PEG 4), la primera es más barata.'),
      text('EV/EBITDA: con la deuda dentro', '**EV (valor de empresa) = capitalización + deuda neta.** Es lo que costaría comprar la empresa entera, deudas incluidas.\n\nPanadería Global: (1.500 + 320) ÷ 200 = **9,1**.\n\nSirve para comparar empresas con distinta deuda, que el PER no ve.'),
      key('P/VC: para bancos y aseguradoras', '**P/VC = precio ÷ valor contable por acción.** Panadería Global: 15 ÷ 4,5 = **3,3**.\n\nSe usa sobre todo en bancos y aseguradoras, cuyo balance está lleno de activos financieros. En una empresa de software, que vale por sus ideas y no por sus activos, dice poco.', 'Elige el ratio según el tipo de empresa.'),
    ], [
      match('Empareja cada empresa con el ratio que más se suele usar para ella.', [['Un banco', 'Precio / valor contable'], ['Una tecnológica que crece al 25 %', 'PEG'], ['Una industrial con mucha deuda', 'EV/EBITDA'], ['Una empresa madura y estable', 'PER']], 'Cada ratio ilumina una cosa distinta.'),
      num('PER de 30 y crecimiento esperado del BPA del 15 % anual. ¿Cuál es su PEG?', 2, 'veces', '30 ÷ 15 = 2: cara para su crecimiento.'),
      num('Capitalización de 2.000 M€, deuda neta de 600 M€ y EBITDA de 260 M€. ¿Cuál es su EV/EBITDA?', 10, 'veces', '(2.000 + 600) ÷ 260 = 10.'),
      num('Un banco cotiza a 6 € y su valor contable por acción es de 7,5 €. ¿Cuál es su P/VC?', 0.8, 'veces', '6 ÷ 7,5 = 0,8: cotiza por debajo de su valor en libros.'),
      single('Dos empresas con PER 20. A crece un 20 % al año y B un 5 %. ¿Cuál es más barata según el PEG?', ['A (PEG 1)', 'B (PEG 4)', 'Las dos igual'], 0, 'El PEG relaciona el precio con el crecimiento.'),
      single('¿Por qué el EV/EBITDA sirve para comparar empresas con distinta deuda?', ['Porque suma la deuda neta al valor de la empresa', 'Porque ignora la deuda', 'Porque solo mira el dividendo'], 0, 'Al comprar una empresa entera, te quedas también con sus deudas.'),
      tf('Dos empresas con el mismo PER pueden tener un EV/EBITDA muy distinto.', true, 'Si una tiene mucha deuda, su EV es mucho mayor que su capitalización.'),
      scenario('A y B capitalizan 1.000 M€ y tienen un EBITDA de 100 M€. A no tiene deuda; B tiene 800 M€ de deuda neta. Un amigo dice que «cuestan lo mismo». ¿Qué le dices?', [['Que tiene razón: capitalizan lo mismo', 'La capitalización no incluye la deuda: comprando B te quedas también con 800 M€ que devolver.'], ['Que B es más cara: EV/EBITDA de 18 frente a 10', 'Eso: (1.000 + 800) ÷ 100 = 18, frente a 1.000 ÷ 100 = 10.'], ['Que B es más barata porque tiene deuda', 'La deuda es algo que se debe, no un regalo.']], 1, 'El valor de empresa mira la empresa entera, deuda incluida.'),
      timed(single('Rápido: PER 12 y crecimiento del 12 %. ¿PEG?', ['0,5', '1', '2'], 1, '12 ÷ 12 = 1.'), 12),
      buckets('Según el PEG, ¿razonable o cara para su crecimiento?', ['Razonable (PEG de 1 o menos)', 'Cara (PEG de 2 o más)'], [['PER 15, crece al 15 %', 0], ['PER 40, crece al 10 %', 1], ['PER 10, crece al 12 %', 0], ['PER 24, crece al 8 %', 1]], 'PEG de 1; 4; 0,83; y 3.'),
    ], { source: '5.5' }),

    lesson('u17l3', 'ROE y ROIC: ¿es un buen negocio?', [
      text('ROE: la rentabilidad del accionista', '**ROE = beneficio neto ÷ patrimonio neto.**\n\nPanadería Global: 97,5 ÷ 450 = **21,7 %**. Por cada 100 € de los accionistas gana casi 22 € al año.\n\nUn ROE por encima del **15 %** de forma sostenida es muy bueno.'),
      text('ROIC: la rentabilidad del negocio', '**ROIC = EBIT × (1 − impuestos) ÷ (patrimonio + deuda neta).**\n\nPanadería Global: 150 × 0,75 = 112,5; y 112,5 ÷ (450 + 320) = **14,6 %**.\n\nDebe superar el **coste del capital** (≈ 8-10 %); si no, la empresa crece destruyendo valor.'),
      key('El truco del ROE', 'Con mucha deuda, el patrimonio es pequeño y el ROE se dispara. El ROIC incluye la deuda, por eso cuesta más inflarlo. Los mejores negocios ganan mucho con poco capital y pueden **reinvertir** a esas tasas durante años.', 'Busca negocios que conviertan cada euro invertido en mucho más de un euro, año tras año.'),
    ], [
      num('Beneficio neto de 50 M€ y patrimonio neto de 250 M€. ¿Cuál es el ROE?', 20, '%', '50 ÷ 250 = 20 %.'),
      num('EBIT de 200 M€, impuestos del 25 %, patrimonio de 600 M€ y deuda neta de 400 M€. ¿Cuál es el ROIC?', 15, '%', '200 × 0,75 = 150; 150 ÷ (600 + 400) = 15 %.'),
      num('Una empresa gana 40 M€ con un patrimonio de 400 M€ (ROE del 10 %). Recompra acciones con deuda: su patrimonio baja a 200 M€ y, por los intereses, su beneficio baja a 36 M€. ¿Cuál es su nuevo ROE?', 18, '%', '36 ÷ 200 = 18 %. El ROE casi se duplica sin que el negocio haya mejorado: es efecto de la deuda.'),
      tf('Un ROIC del 5 % con un coste del capital del 9 % crea valor.', false, 'Si el ROIC no supera el coste del capital, cada euro reinvertido destruye valor.'),
      tf('Un ROE muy alto puede deberse a que la empresa tiene mucha deuda.', true, 'Con poco patrimonio, cualquier beneficio parece una rentabilidad enorme.'),
      single('¿Por qué el ROIC es más fiable que el ROE para juzgar el negocio?', ['Porque incluye la deuda en el capital', 'Porque siempre sale más alto', 'Porque lo calcula Hacienda'], 0, 'El ROE se dispara si la empresa se endeuda; el ROIC, no tanto.'),
      timed(single('Rápido: ¿qué ROE sostenido se considera muy bueno?', ['Más del 15 %', 'Alrededor del 3 %', 'Negativo'], 0, 'Siempre que no venga de un endeudamiento excesivo.'), 10),
      order('Coste del capital del 9 %. Ordena de mejor a peor negocio por su ROIC.', ['ROIC del 30 %', 'ROIC del 15 %', 'ROIC del 9 %', 'ROIC del 4 %'], 'Por encima del 9 % crea valor; en el 9 %, ni crea ni destruye; por debajo, lo destruye.'),
      scenario('Laura compara dos empresas. A: ROE del 25 % con deuda neta/EBITDA de 5. B: ROE del 18 %, sin deuda y con ROIC del 18 %. ¿Cuál parece mejor negocio?', [['A: su ROE es mayor', 'Con tanta deuda, ese ROE puede venir del apalancamiento más que del negocio.'], ['B: gana mucho sobre todo su capital sin depender de la deuda', 'Eso: un ROIC del 18 % sin deuda es un negocio de calidad.'], ['No se puede saber nada', 'Con ROE, ROIC y deuda ya puedes formarte una idea bastante buena.']], 1, 'Mira el ROE junto al ROIC y la deuda.'),
      num('Una empresa con ROIC del 20 % reinvierte todo su beneficio a esa tasa durante 10 años. ¿Por cuánto se multiplica su capital? (un decimal)', 6.2, 'veces', '1,20¹⁰ ≈ 6,19. Es la idea de las «máquinas de componer»: un ejemplo, no una promesa.', 2),
    ], { source: '5.6' }),

    lesson('u17l4', 'Rentabilidad por dividendo y payout', [
      text('Dos ratios', '• **Rentabilidad por dividendo** = dividendo por acción ÷ precio. Panadería Global paga 0,50 € y cotiza a 15 €: **3,3 %**.\n• **Payout** = dividendo ÷ BPA. 0,50 ÷ 0,975 = **51 %**: reparte la mitad y reinvierte la otra mitad.'),
      text('Cuándo un dividendo está en peligro', '• **Payout por encima del 80-90 %** de forma continuada, y más aún por encima del 100 %: paga más de lo que gana.\n• **Dividendo mayor que el flujo de caja libre:** se paga con deuda.\n• **Rentabilidad altísima** (10 %, 12 %…): a menudo es porque el precio se ha hundido y el mercado espera un recorte.'),
      key('El dividendo no es un regalo', 'Cuando una empresa paga 1 € por acción, la acción suele bajar alrededor de 1 € ese día: el dinero pasa de la empresa a tu bolsillo, y Hacienda se lleva su parte. Lo que cuenta es la **rentabilidad total**.', 'Un dividendo sostenible sale de la caja, no de la deuda.'),
    ], [
      num('Una acción cotiza a 40 € y paga 1,60 € de dividendo al año. ¿Cuál es su rentabilidad por dividendo?', 4, '%', '1,60 ÷ 40 = 4 %.'),
      num('BPA de 2 € y dividendo de 1,50 €. ¿Cuál es el payout?', 75, '%', '1,50 ÷ 2 = 75 %: reparte tres cuartas partes de lo que gana.'),
      num('Inditex propuso un dividendo de 1,68 € por acción por su ejercicio 2024. Si la acción cotizara a 48 €, ¿cuál sería su rentabilidad por dividendo?', 3.5, '%', '1,68 ÷ 48 = 3,5 %. Es un cálculo con un precio de ejemplo, no una recomendación.'),
      spot('Marca los mensajes que son señal de estafa o de engaño con los dividendos.', [['Canal de Telegram', '🔥 Acción con dividendo del 25 % ANUAL GARANTIZADO. Solo hoy, plazas limitadas.', true], ['Web de una cotizada', 'La junta aprueba un dividendo de 0,50 € por acción, que se pagará el 2 de julio.', false], ['Desconocido por WhatsApp', 'Te pago un «dividendo» del 3 % mensual si me transfieres tu dinero a esta cuenta.', true], ['Tu bróker', 'Has recibido 12,40 € de dividendos, netos de retención.', false], ['Influencer', 'Vive de dividendos con 1.000 €: mi curso te enseña cómo por 499 €.', true]], 'Rentabilidades garantizadas, «dividendos» mensuales fuera de cualquier mercado regulado y promesas de vivir de rentas con 1.000 € son señales clásicas de engaño. Con un 4 %, 1.000 € dan unos 40 € al año.'),
      single('Una empresa ofrece una rentabilidad por dividendo del 12 % y su acción ha caído un 50 % este año. ¿Qué suele indicar?', ['Que el mercado espera un recorte del dividendo', 'Que es una ganga segura', 'Que la empresa va muy bien'], 0, 'La rentabilidad ha subido porque el precio se ha hundido, no porque paguen más.'),
      tf('Un payout del 110 % durante tres años seguidos es sostenible.', false, 'Paga más de lo que gana: tira de caja o de deuda, y tarde o temprano tendrá que recortar.'),
      scenario('Bruno compara dos acciones por su dividendo. A: rentabilidad del 3,5 %, payout del 50 % y caja libre que cubre el dividendo dos veces. B: rentabilidad del 9 %, payout del 130 % y deuda creciendo. ¿Qué tiene más sentido?', [['Fijarse en B: paga casi el triple', 'Paga más de lo que gana y se endeuda para hacerlo: ese 9 % puede desaparecer de golpe.'], ['Fijarse en A: su dividendo está cubierto por el beneficio y la caja', 'Eso: un dividendo menor pero sostenible suele valer más que uno alto en peligro.'], ['Da igual: los dividendos están garantizados', 'Ningún dividendo de una acción está garantizado.']], 1, 'Antes de mirar cuánto paga, mira de dónde sale.'),
      timed(single('Rápido: precio 20 €, dividendo 1 €. ¿Rentabilidad por dividendo?', ['2 %', '5 %', '20 %'], 1, '1 ÷ 20 = 5 %.'), 10),
      num('Una acción vale 30 € y paga un dividendo de 0,90 €. Sin otras noticias, ¿a qué precio aproximado suele abrir el día en que descuenta el dividendo?', 29.1, '€', '30 − 0,90 = 29,10 €. El dividendo sale del valor de la empresa.'),
      fill('Payout = dividendo por acción ÷ ____.', 'BPA', ['precio', 'ventas', 'deuda'], 'Qué parte del beneficio se reparte.'),
    ], { source: '5.5' }),

    lesson('u17l5', 'Descontar flujos (DCF) sin miedo', [
      text('Traer el futuro a hoy', 'Un euro dentro de 10 años vale menos que un euro hoy, porque hoy podrías invertirlo.\n\n**Valor hoy = flujo futuro ÷ (1 + tasa)^años**\n\nCon una tasa del 9 %, 100 € dentro de un año valen hoy 100 ÷ 1,09 = **91,74 €**.'),
      text('El DCF de Panadería Global', 'FCF de 1 € por acción, que crece un 6 % durante 10 años y luego un 2 % para siempre. Tasa de descuento: 9 %.\n\n• Flujos de los años 1-10, descontados: ≈ **8,6 €**\n• Valor terminal (fórmula de Gordon): FCF del año 11 ÷ (9 % − 2 %) ≈ 26,1 €; traído a hoy: ≈ **11,0 €**\n• **Valor ≈ 19,6 €.** Cotiza a 15 €: un margen del 23 %.'),
      key('La lección del DCF', 'Cambia un poco las hipótesis:\n\n• Tasa del 10 %: unos **17 €**.\n• Crecimiento del 4 %: unos **16,9 €**.\n• Las dos cosas a la vez: unos **14,7 €**, ya por debajo del precio.\n\nEl DCF sirve para **pensar** («¿qué crecimiento descuenta el precio?»), no para dar una cifra exacta.', 'Si cambias un poco las hipótesis y el valor se desploma, ve con cuidado.'),
    ], [
      num('Con una tasa del 10 %, ¿cuánto valen hoy 110 € que cobrarás dentro de un año?', 100, '€', '110 ÷ 1,10 = 100 €.'),
      num('Con una tasa del 8 %, ¿cuánto valen hoy 1.000 € que cobrarás dentro de 5 años?', 680.58, '€', '1,08⁵ ≈ 1,4693; 1.000 ÷ 1,4693 ≈ 680,58 €.'),
      num('Valor terminal con la fórmula de Gordon: el FCF del año siguiente es 2 €, la tasa de descuento un 9 % y el crecimiento perpetuo un 2 %. ¿Cuánto vale?', 28.57, '€', '2 ÷ (0,09 − 0,02) = 2 ÷ 0,07 ≈ 28,57 €.'),
      num('Tu DCF dice que una acción vale 25 € y cotiza a 20 €. ¿Qué margen de seguridad tienes sobre el valor?', 20, '%', '(25 − 20) ÷ 25 = 20 %.'),
      single('En un DCF, si subes la tasa de descuento, el valor estimado…', ['Baja', 'Sube', 'No cambia'], 0, 'El dinero futuro vale menos hoy si exiges más rentabilidad.'),
      single('¿Para qué sirve sobre todo un DCF?', ['Para pensar qué crecimiento descuenta el precio', 'Para obtener el valor exacto de una empresa', 'Para saber cuándo subirá la acción'], 0, 'Pequeños cambios en las hipótesis cambian mucho el resultado.'),
      tf('En el ejemplo de Panadería Global, subir la tasa al 10 % y bajar el crecimiento al 4 % deja el valor por debajo del precio de 15 €.', true, 'Unos 14,7 €: dos retoques razonables se comen todo el margen de seguridad.'),
      scenario('Pablo hace un DCF: una empresa que cotiza a 60 € «vale» 120 €. Para llegar ahí ha supuesto un crecimiento del 25 % anual durante 10 años y una tasa del 6 %. ¿Qué debería hacer?', [['Comprar con todo: vale el doble', 'Su resultado depende de hipótesis muy optimistas: con otras más prudentes, el «doble» puede desaparecer.'], ['Probar hipótesis más prudentes y ver cuánto cambia el valor', 'Bien: si con un crecimiento y una tasa razonables el valor se desploma, el margen era una ilusión.'], ['Publicarlo en un foro', 'Antes de convencer a nadie, convéncete tú con hipótesis prudentes.']], 1, 'Un DCF es tan bueno como sus hipótesis.'),
      timed(tf('Un euro dentro de 10 años vale más que un euro hoy.', false, 'Vale menos: hoy podrías invertirlo y tenerlo creciendo 10 años.'), 10),
      order('Ordena los pasos de un DCF simplificado.', ['Estimar el flujo de caja libre de los próximos años', 'Descontar cada flujo a hoy con tu tasa', 'Calcular el valor terminal y descontarlo', 'Sumarlo todo y compararlo con el precio'], 'Futuro, descuento, valor terminal y comparación.'),
      chat(['Mi DCF dice que esta acción vale 47,32 € exactamente 🤓'], '¿Qué le contestas a Lumi?', [['¡Perfecto! Si cotiza a 47,31 €, está barata', 'Un céntimo no es margen: tu cifra puede fallar en varios euros arriba o abajo.'], ['Mejor piensa en un rango y exige un buen margen de seguridad', 'Tienes razón: muevo un punto la tasa y me sale 40 €. ¡Uf!'], ['Los DCF no sirven para nada', 'Sirven, para pensar. No para dar decimales.']], 1, 'Un DCF da un rango orientativo, no una cifra exacta.'),
    ], { source: '5.8' }),

    lesson('u17l6', 'El CAPE y la valoración del mercado', [
      text('El PER de todo el mercado', 'El **CAPE** (o PER de Shiller) divide el precio de un índice entre la **media de los beneficios de los últimos 10 años**, ajustados por la inflación. Al usar 10 años, suaviza los altibajos del ciclo económico.'),
      text('Los datos del S&P 500', '• Media desde 1871: unos **17**.\n• Máximo: **44** en diciembre de 1999, justo antes del estallido de las puntocom.\n• Octubre de 2026: alrededor de **41**, de los niveles más altos de la historia.'),
      key('Qué dice y qué no', '**Sí:** históricamente, un CAPE alto se ha asociado a **rentabilidades más bajas en los 10 años siguientes**.\n**No:** no dice **cuándo** caerá el mercado; puede seguir caro durante años.\n\nOtras regiones cotizan bastante más baratas: otro argumento para diversificar por países.', 'El CAPE sirve para ajustar expectativas, no para adivinar el próximo mes.'),
    ], [
      trend('Mira el Nasdaq 100 desde finales de 1997 hasta marzo de 2000. ¿Qué tendencia ves?', 'hist-dotcom', 'Alcista', 'Una subida enorme: las valoraciones llegaron a niveles nunca vistos.'),
      upDown('Marzo de 2000: el CAPE del S&P 500 acaba de marcar su récord (44, en diciembre de 1999) y el Nasdaq 100 lleva años disparado. ¿Qué hizo el Nasdaq 100 después?', 'hist-dotcom', 'Una valoración extrema dice que las rentabilidades futuras serán probablemente bajas, pero no dice cuándo ni cuánto se moverá el precio.', 'hasta diciembre de 2002'),
      upDown('Noviembre de 1989: la bolsa japonesa cotiza a valoraciones de récord tras una década de euforia. ¿Qué hizo el Nikkei 225 en los años siguientes?', 'hist-japan-1989', 'Igual que con el CAPE de EE. UU., una valoración muy alta no fija una fecha: solo cambia las probabilidades de lo que vendrá.', 'hasta noviembre de 1995'),
      fill('El CAPE divide el precio entre la media de los beneficios reales de los últimos ____ años.', '10', ['1', '5', '30'], 'Diez años suavizan el ciclo económico.'),
      single('¿Cuál ha sido la media histórica del CAPE del S&P 500 desde 1871?', ['Unos 17', 'Unos 41', 'Unos 5'], 0, 'En octubre de 2026 rondaba los 41, muy por encima de esa media.'),
      tf('Un CAPE muy alto indica exactamente cuándo caerá el mercado.', false, 'Puede seguir caro durante años; lo que sí se ha asociado es a rentabilidades más bajas a 10 años.'),
      tf('Históricamente, un CAPE alto se ha asociado a rentabilidades más bajas en los 10 años siguientes.', true, 'Pagar caro deja menos margen para ganar después.'),
      num('Un índice cotiza a 4.100 puntos y la media de sus beneficios reales de 10 años es de 100 puntos. ¿Cuál es su CAPE?', 41, 'veces', '4.100 ÷ 100 = 41.'),
      num('Con un CAPE de 41, ¿cuál es la rentabilidad por beneficio implícita (su inverso)?', 2.44, '%', '1 ÷ 41 ≈ 2,44 %. Con un CAPE de 17 sería ≈ 5,9 %: pagar más caro deja menos rentabilidad esperada.', 2),
      scenario('Octubre de 2026: el CAPE del S&P 500 ronda los 41. Marta invierte cada mes en un fondo indexado mundial con un horizonte de 25 años. Lee que «el mercado está carísimo» y quiere venderlo todo. ¿Qué le dirías?', [['Que venda todo y espere la caída', 'El CAPE no dice cuándo: tendría que acertar cuándo salir y cuándo volver.'], ['Que un CAPE alto sugiere expectativas más modestas, no una fecha de caída, y que revise con calma su reparto y su diversificación por países', 'Bien: un fondo mundial ya incluye regiones más baratas, y su plan es a 25 años.'], ['Que compre más con deuda', 'Endeudarse en un mercado caro suma riesgo sobre riesgo.']], 1, 'El CAPE sirve para ajustar expectativas y diversificar, no para entrar y salir del mercado.'),
      timed(single('Rápido: ¿cuál fue el CAPE máximo del S&P 500?', ['44 (1999)', '25 (2008)', '17 (1871)'], 0, 'Diciembre de 1999, justo antes del estallido de las puntocom.'), 12),
    ], { source: '5.8' }),
  ],
})
