import 'server-only'
// Unidad 2 · Cómo funciona el mercado (docs/curso/02)
import { fill, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u2', order: 2, title: 'Cómo funciona el mercado', description: 'Acciones, bonos, bolsas, órdenes, índices, ETFs y cripto', premiumOnly: false,
  lessons: [
    lesson('u2l1', 'Qué es una acción', [
      text('Ser dueño de una parte', 'Inditex está dividida en unos 3.100 millones de acciones. Si compras una, eres dueño de una parte diminuta de sus tiendas, sus marcas y sus beneficios futuros.\n\nComo accionista puedes cobrar **dividendos** y votar en la junta.'),
      text('De dónde sale la rentabilidad', '**Rentabilidad total = dividendos + revalorización.**\n\nA largo plazo, el precio sigue a los beneficios. A corto plazo lo mueven las expectativas y el ánimo de los inversores.'),
      text('El riesgo', 'Una empresa puede ir mal o quebrar. Si quiebra, el accionista cobra el último y casi nunca recupera nada.\n\nDato: de 26.000 acciones de EE. UU. (1926–2016), más de la mitad rindió menos que las letras del Tesoro. Solo un 4 % generó toda la ganancia neta.'),
      sim('Tu primera ficha', 'Busca una empresa en el Mercado y abre su ficha: verás su bolsa, país, sector, moneda y en qué índices está.', 'Abre la ficha de Inditex (ITX.MC) y localiza su sector y sus índices.'),
      key('Lo que te llevas', 'Una sola acción es arriesgada. Por eso conviene tener muchas, como verás en la unidad 3.', 'Una acción es un trocito de una empresa: ganas si la empresa gana más y reparte o crece.', 'Comprar una acción es comprar un negocio, no un número.'),
    ], [
      single('Compras una acción. ¿Qué eres?', ['Prestamista de la empresa', 'Copropietario de una parte de la empresa', 'Cliente de la empresa'], 1, 'La acción es una parte del capital: participas en beneficios y riesgos.'),
      fill('Rentabilidad total = dividendos + ____.', 'revalorización', ['comisiones', 'impuestos', 'inflación'], 'Ganas por lo que reparte la empresa y por la subida del precio.'),
      tf('Si una empresa quiebra, los accionistas cobran antes que los bancos.', false, 'Cobran los últimos, después de acreedores y bonistas.'),
      single('Según Bessembinder, ¿qué parte de las acciones de EE. UU. explica toda la ganancia neta del mercado desde 1926?', ['Alrededor del 4 %', 'La mitad', 'Casi todas'], 0, 'Por eso diversificar asegura tener las pocas ganadoras.'),
    ], { source: '2.1' }),

    lesson('u2l2', 'Qué es un bono', [
      text('Prestar en lugar de ser dueño', 'Con un **bono** prestas dinero a un Estado o empresa. A cambio recibes un **cupón** (interés periódico) y la devolución del dinero al **vencimiento**.\n\nEl Tesoro emite letras (hasta 12 meses), bonos (2–5 años) y obligaciones (más de 5).'),
      text('El balancín de los tipos', '**Si los tipos suben, el precio de los bonos que ya existen baja**, y al revés.\n\nTienes un bono al 2 % y los nuevos pagan un 4 %: para vender el tuyo tendrás que bajar su precio. En 2022 los bonos largos cayeron más de un 20 %.'),
      text('El riesgo de impago', 'Si el emisor no paga, pierdes. Las agencias puntúan de AAA (máxima calidad) a D (impago). Por debajo de BBB− es *high yield* o bono basura: paga más porque arriesga más.'),
      key('Para qué sirven', 'Dan ingresos previsibles y suelen amortiguar las caídas de la bolsa, aunque no siempre (en 2022 cayeron a la vez).', 'Un bono es un préstamo: cobras intereses y te devuelven el dinero al vencimiento, si el emisor puede pagar.', 'Bonos y tipos juegan al balancín.'),
    ], [
      single('El BCE sube los tipos. ¿Qué suele pasar con el precio de los bonos ya emitidos?', ['Sube', 'Baja', 'No cambia'], 1, 'Los nuevos pagan más, así que los antiguos solo se venden más baratos.'),
      single('¿Qué recibes al comprar un bono?', ['Una parte de la empresa', 'Intereses y la devolución del dinero al vencimiento', 'Derecho a voto'], 1, 'Un bono es un préstamo.'),
      tf('Un bono con calificación AAA paga más interés que uno high yield.', false, 'El high yield paga más porque es más arriesgado.'),
      fill('Los bonos del Tesoro a menos de 12 meses se llaman ____.', 'letras', ['obligaciones', 'acciones', 'cupones'], 'Letras (hasta 12 meses), bonos (2–5 años), obligaciones (más de 5).'),
    ], { source: '2.2' }),

    lesson('u2l3', 'Qué es una bolsa y quién participa', [
      text('Las grandes bolsas', '• NYSE y Nasdaq (EE. UU.): de 15:30 a 22:00 en España.\n• Bolsa de Madrid (IBEX 35): de 9:00 a 17:30.\n• Xetra (DAX), Euronext (CAC 40), Londres (FTSE 100).\n• Tokio y Hong Kong: abren mientras dormimos.\n\nLas criptomonedas cotizan 24/7.'),
      text('El camino de tu orden', '1. Tú das la orden.\n2. El bróker la lleva al mercado (debe estar autorizado por la CNMV o un supervisor europeo).\n3. Se cruza con un vendedor.\n4. Se liquida: en Europa en dos días hábiles, en EE. UU. en uno.\n5. El custodio guarda tus valores a tu nombre.'),
      text('¿Y si quiebra el bróker?', 'Tus acciones son tuyas: están separadas del patrimonio del bróker. Si faltara algo, actúan los fondos de garantía (en España, el FOGAIN, hasta 100.000 €).'),
      key('Quién más compra y vende', 'Particulares, fondos, aseguradoras, creadores de mercado y algoritmos que operan en microsegundos.', 'La bolsa cruza órdenes de compra y venta; tu bróker es la puerta de entrada.', 'Cada vez que compras, alguien vende. ¿Qué sabe él que tú no?'),
    ], [
      order('Ordena el recorrido de tu orden de compra.', ['Tú das la orden', 'El bróker la lleva al mercado', 'Se cruza con un vendedor', 'Liquidación y custodia'], 'Así llega tu orden de la app al registro de tus valores.'),
      single('¿A qué hora abre la bolsa de EE. UU. en hora peninsular española?', ['9:00', '15:30', '22:00'], 1, 'De 9:30 a 16:00 en Nueva York = 15:30 a 22:00 en España.'),
      tf('Si tu bróker quiebra, tus acciones se pierden con él.', false, 'Están a tu nombre y separadas de su patrimonio.'),
      single('¿Qué mercado está abierto un domingo a las 12:00?', ['Bolsa de Madrid', 'Nasdaq', 'Criptomonedas'], 2, 'Las cripto cotizan las 24 horas, los 7 días.'),
    ], { source: '2.3' }),

    lesson('u2l4', 'Cómo se forma un precio', [
      text('El libro de órdenes', 'Cada valor tiene dos listas:\n\n• Compradores (*bid*): el mejor paga **10,02 €**.\n• Vendedores (*ask*): el mejor pide **10,04 €**.\n\nLa diferencia, 0,02 €, es el **spread**: un coste oculto de cada operación.'),
      text('Liquidez', 'Un activo es líquido si se compra y vende mucho sin mover el precio. Las grandes acciones tienen *spreads* diminutos; las empresas pequeñas o las criptos raras, enormes.'),
      text('Por qué se mueve', 'Si llegan más compradores impacientes que vendedores, se "comen" las órdenes de venta y el precio sube. Si llegan más vendedores, baja.\n\nLas bolsas abren y cierran con una **subasta** (en Madrid, de 8:30 a 9:00 y de 17:30 a 17:35).'),
      key('Precio y valor', 'El precio es solo el último acuerdo. El valor de la empresa es otra cosa (unidad 5).', 'El precio es el último acuerdo entre quien más paga y quien menos pide.', 'El precio no es lo que vale una empresa: es lo que alguien acaba de pagar.'),
    ], [
      single('El mejor precio de compra es 20,10 € y el de venta 20,14 €. ¿El spread?', ['0,40 €', '0,04 €', '20,12 €'], 1, '20,14 − 20,10 = 0,04 €.'),
      single('Si compras ya, a mercado, ¿a qué precio compras en ese libro?', ['20,10 €', '20,12 €', '20,14 €'], 2, 'Compras al mejor precio de venta (ask).'),
      tf('Un activo poco líquido suele tener un spread más grande.', true, 'Hay pocos participantes: comprar y vender cuesta más.'),
      multi('¿Qué puede mover el precio de una acción? Marca todos.', ['Resultados de la empresa', 'Un dato económico', 'Que lleguen más vendedores que compradores', 'El color de su logotipo'], [0, 1, 2], 'Todo lo que cambia lo que la gente está dispuesta a pagar.'),
    ], { source: '2.4' }),

    lesson('u2l5', 'Tipos de órdenes', [
      text('A mercado y limitada', '**A mercado:** compra o vende ya al mejor precio. Se ejecuta seguro, pero no controlas el precio exacto.\n\n**Limitada:** compra a un precio máximo o vende a un mínimo. Controlas el precio, pero puede no ejecutarse nunca.'),
      text('Órdenes para salir', '**Stop loss:** si el precio cae hasta un nivel, vende. Limita la pérdida.\n**Take profit:** si sube hasta un nivel, vende. Asegura la ganancia.\n**Stop dinámico:** el stop sube con el precio a una distancia fija.'),
      text('El hueco de precio', 'Si una empresa da malos resultados de noche, puede abrir un 15 % más abajo. Tu stop al −5 % se ejecutará al −15 %: no hubo precios intermedios.\n\nEl stop no es un seguro perfecto.'),
      sim('Prueba una orden limitada', 'En E-Trading puedes usar órdenes a mercado y limitadas desde el principio. El stop loss y el take profit se desbloquean en la unidad 10.', 'Pon una orden limitada de compra un 2 % por debajo del precio actual y mira si se ejecuta.'),
      key('Cuál usar', 'Validez: del día (caduca al cierre) o hasta cancelar.', 'La orden a mercado asegura que entras; la limitada asegura el precio; las de stop sirven para salir.', 'Si te importa el precio, limitada. Si te importa salir, stop.'),
    ], [
      single('Quieres comprar solo si el precio baja a 45 €. ¿Qué orden usas?', ['A mercado', 'Limitada a 45 €', 'Take profit a 45 €'], 1, 'La limitada solo se ejecuta a ese precio o mejor.'),
      tf('Un stop loss garantiza que nunca perderás más de lo previsto.', false, 'Con un hueco de precio, se ejecuta al primer precio disponible.'),
      single('¿Qué orden vende automáticamente si el precio sube hasta tu objetivo?', ['Stop loss', 'Take profit', 'A mercado'], 1, 'Take profit = asegurar la ganancia.'),
      single('¿Qué riesgo tiene una orden limitada?', ['Que pagues más de lo previsto', 'Que no se ejecute nunca', 'Ninguno'], 1, 'Si el precio no llega, la orden no se cruza.'),
    ], { source: '2.5' }),

    lesson('u2l6', 'Índices: el termómetro del mercado', [
      text('Para qué sirven', 'Decir "la bolsa ha subido" es decir "el índice ha subido". El **IBEX 35** agrupa las 35 empresas más líquidas de España; el **S&P 500**, las 500 grandes de EE. UU.\n\nUn índice no se compra directamente: se compra un fondo o ETF que lo copia.'),
      text('Cómo se ponderan', '• **Por capitalización** (S&P 500, IBEX, MSCI World): pesa más la que más vale. Capitalización = precio × número de acciones.\n• **Por precio** (Dow Jones, Nikkei): pesa más la acción más cara. Método antiguo.\n• **Equiponderado:** todas igual.'),
      text('Con y sin dividendos', 'El IBEX 35 de las noticias no incluye los dividendos. El **IBEX 35 con dividendos** muestra lo que ganó quien los reinvirtió: está muy por encima de su máximo de 2007.'),
      sim('Da la vuelta al mundo', 'En la portada del Mercado puedes cambiar de región y ver los índices de América, Europa y Asia.', 'Mira qué índices están abiertos ahora y cuáles cerrados.'),
      key('Lo que te llevas', 'Índices principales: S&P 500, Nasdaq 100, Euro Stoxx 50, DAX, IBEX 35, FTSE 100, Nikkei 225, Hang Seng, MSCI World.', 'Un índice resume en una cifra a un grupo de empresas.', 'Comprar el índice es apostar por toda la economía, no por una empresa.'),
    ], [
      single('¿Cómo se calcula la capitalización?', ['Beneficio × acciones', 'Precio de la acción × número de acciones', 'Ventas ÷ precio'], 1, 'Es lo que vale la empresa en bolsa.'),
      tf('Se puede comprar directamente el índice S&P 500.', false, 'Se compra un fondo o ETF que lo replica.'),
      single('Un amigo dice que el IBEX está igual que en 2007. ¿Qué le falta considerar?', ['Los dividendos', 'La inflación de Japón', 'El horario'], 0, 'Con dividendos reinvertidos, el IBEX está muy por encima de 2007.'),
      single('¿Qué índice pondera por precio?', ['S&P 500', 'Dow Jones', 'MSCI World'], 1, 'El Dow Jones y el Nikkei 225 pesan cada acción por su precio unitario.'),
    ], { source: '2.6' }),

    lesson('u2l7', 'Fondos de inversión y ETFs', [
      text('Fondo de inversión', 'Reúne el dinero de miles de personas y lo invierte una gestora. Compras participaciones a su valor liquidativo, que se calcula una vez al día.\n\nEn España, los **traspasos entre fondos no tributan** hasta que vendes del todo.'),
      text('ETF', 'Un fondo que **cotiza en bolsa** como una acción. Casi siempre copia un índice, con costes del 0,03 % al 0,30 % anual.\n\nEn España tributa en cada venta: no tiene el régimen de traspaso.'),
      text('Qué mirar antes de elegir', '1. Qué índice o política sigue.\n2. Costes anuales (TER).\n3. Tamaño y antigüedad.\n4. Acumulación (reinvierte dividendos) o distribución (los paga).\n5. Que sea UCITS y tenga su KID, el resumen obligatorio de riesgos y costes.'),
      key('El supermercado entero', 'Con un solo fondo indexado mundial puedes tener miles de empresas de decenas de países.', 'Fondos y ETFs reúnen el dinero de muchos para comprar muchos activos; el ETF cotiza como una acción.', 'Un ETF de índice es comprar el supermercado entero, no un solo producto.'),
    ], [
      single('¿Qué ventaja fiscal tienen en España los fondos frente a los ETFs?', ['No pagan nunca impuestos', 'Se pueden traspasar sin tributar hasta el reembolso', 'Sus dividendos están exentos'], 1, 'El traspaso permite cambiar de fondo sin pagar impuestos.'),
      single('Un fondo de acumulación…', ['Reparte los dividendos', 'Reinvierte los dividendos', 'No invierte en empresas'], 1, 'Reinvierte y no tributas hasta vender.'),
      tf('Un ETF solo se puede comprar una vez al día, al valor liquidativo.', false, 'Eso es un fondo tradicional. El ETF cotiza durante todo el horario.'),
      fill('El documento obligatorio de 3 páginas con riesgos y costes se llama ____.', 'KID', ['IBAN', 'IRPF', 'PER'], 'El Documento de Datos Fundamentales (KID).'),
    ], { source: '2.7' }),

    lesson('u2l8', 'Divisas y materias primas', [
      text('Divisas', '**EUR/USD = 1,08** significa que 1 euro vale 1,08 dólares.\n\nSi sube a 1,10, el euro se aprecia; si baja a 1,05, se deprecia. Se mueven por los tipos de interés, la inflación y el miedo.'),
      text('El riesgo de divisa', 'Te afecta aunque no operes en divisas: si compras Apple en dólares y el dólar cae un 10 % frente al euro, pierdes ese 10 % en euros aunque la acción no se mueva.\n\nE-Trading te muestra el precio en su moneda y su equivalente en euros.'),
      text('Materias primas', '• Oro y plata: refugio, pero el oro perdió mucho valor real de 1980 a 2000.\n• Petróleo y gas: economía y geopolítica.\n• Cobre: termómetro de la economía.\n• Trigo, café, cacao: clima y cosechas.\n\nNo generan beneficios ni intereses.'),
      key('Lo que te llevas', 'La mayoría de materias primas se negocian con futuros: contratos para comprar o vender en una fecha futura.', 'En divisas siempre compras una moneda vendiendo otra; las materias primas dependen de oferta y demanda.', 'Una divisa nunca sube sola: sube frente a otra.'),
    ], [
      single('EUR/USD pasa de 1,10 a 1,05. El euro…', ['Se ha apreciado', 'Se ha depreciado', 'Sigue igual'], 1, 'Ahora un euro compra menos dólares.'),
      single('Tu acción de EE. UU. no se mueve, pero el dólar cae un 8 % frente al euro. En euros…', ['Ganas un 8 %', 'Pierdes alrededor de un 8 %', 'Ni ganas ni pierdes'], 1, 'Tus dólares valen menos euros.'),
      tf('El oro genera dividendos.', false, 'Las materias primas no generan beneficios ni intereses.'),
      single('¿Qué materia prima se considera un termómetro de la economía mundial?', ['Cobre', 'Café', 'Plata'], 0, 'Se usa en construcción, electricidad e industria.'),
    ], { source: '2.8' }),

    lesson('u2l9', 'Criptomonedas: qué son de verdad', [
      text('Qué son', 'Activos digitales sobre una **cadena de bloques**: un registro compartido que nadie controla solo.\n\n• Bitcoin (2009): máximo de 21 millones.\n• Ethereum: plataforma de programas.\n• *Stablecoins*: ligadas al dólar.\n• Miles más, muchas sin uso real.'),
      text('Riesgos reales', '• Caídas de más del 70 % (2014, 2018, 2022).\n• Sin beneficios ni intereses: el precio depende de la adopción.\n• Si pierdes las claves o quiebra la plataforma (FTX, 2022), puedes perderlo todo.\n• Estafas y *pump and dump*.'),
      text('Regulación en Europa', 'El reglamento **MiCA** regula a los proveedores. Desde el **1 de julio de 2026** solo pueden operar en España los autorizados por la CNMV u otra autoridad europea. Compruébalo antes de usar una plataforma.'),
      key('Cómo encajan', 'Si decides tenerlas: una parte pequeña que podrías perder entera, entendiendo lo que compras y en plataformas autorizadas.', 'Las criptomonedas son muy volátiles y sin flujos de caja: pueden subir mucho y perder casi todo.', 'Subir un 300 % en un año también significa poder caer un 75 %.'),
    ], [
      single('¿Cuántos bitcoins podrán existir como máximo?', ['21 millones', '100 millones', 'Ilimitados'], 0, 'Está fijado en su protocolo.'),
      tf('Las criptomonedas generan beneficios o intereses por sí mismas, como una empresa.', false, 'Su precio depende de la adopción y de lo que otros paguen.'),
      single('Según la CNMV, desde julio de 2026, ¿con qué plataformas cripto conviene operar en España?', ['Con cualquiera', 'Solo con proveedores autorizados bajo MiCA', 'Solo con las que más anuncios hacen'], 1, 'Las no autorizadas quedan fuera de la protección y la supervisión.'),
      multi('¿Qué riesgos tienen las criptomonedas? Marca todos.', ['Volatilidad extrema', 'Perder las claves', 'Quiebra de la plataforma', 'Fondo de garantía de 100.000 €'], [0, 1, 2], 'No hay un fondo de garantía como en bancos o brókers.'),
    ], { source: '2.9' }),
  ],
})
