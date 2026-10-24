import 'server-only'
// Unidad 3 · Riesgo y rentabilidad (docs/curso/03)
import { fill, img, key, lesson, multi, order, point, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u3', order: 3, title: 'Riesgo y rentabilidad', description: 'Volatilidad, caídas, diversificación y lecciones de las crisis', premiumOnly: false,
  lessons: [
    lesson('u3l1', 'No hay rentabilidad sin riesgo', [
      text('La escalera del riesgo', 'Rentabilidad anual por encima de la inflación, 1900–2024, 35 países (UBS Yearbook 2025):\n\n• Letras del Tesoro: **0,5 %**\n• Bonos del Estado: **1,7 %**\n• Acciones: **5,2 %**'),
      text('La prima de riesgo', 'Las acciones rinden más **porque son más arriesgadas**: los inversores exigen un premio por aguantar las caídas. Si no hubiera caídas, no habría premio.\n\nEn EE. UU., las acciones dieron un 9,7 % nominal al año desde 1900.'),
      text('Lo que esconde la media', 'De 2000 a 2024, la bolsa mundial dio solo un **3,5 %** real anual: empezó en una burbuja y pasó por dos crisis enormes. Las medias de largo plazo esconden décadas perdidas.'),
      key('Lo que te llevas', 'Desconfía de quien promete mucha rentabilidad sin riesgo: o no lo entiende o te engaña.', 'La rentabilidad es el premio por aguantar. El riesgo es lo que tienes que aguantar.', 'Mucha rentabilidad sin riesgo no existe.'),
    ], [
      single('Rentabilidad real anual de las acciones mundiales desde 1900 (UBS 2025):', ['1,7 %', '5,2 %', '12 %'], 1, 'Frente al 1,7 % de los bonos y el 0,5 % de las letras.'),
      single('¿Por qué las acciones rinden más que los bonos a largo plazo?', ['Por suerte', 'Porque son más arriesgadas y los inversores exigen un premio', 'Porque pagan menos impuestos'], 1, 'Es la prima de riesgo.'),
      tf('Las medias de largo plazo garantizan esa rentabilidad cada década.', false, 'De 2000 a 2024 la bolsa mundial dio solo un 3,5 % real anual.'),
      order('Ordena de menor a mayor rentabilidad real histórica.', ['Letras del Tesoro', 'Bonos del Estado', 'Acciones'], '0,5 %, 1,7 % y 5,2 % anual.'),
    ], { source: '3.1' }),

    lesson('u3l2', 'Medir el riesgo: volatilidad y caídas', [
      text('Volatilidad', 'Cuánto se mueve un precio (la desviación típica). Valores anuales orientativos:\n\n• Letras: menos del 1 %\n• Bonos: 4–7 %\n• Índice mundial: **15 %**\n• Una acción grande: 25–35 %\n• Bitcoin: 50–80 %'),
      text('Cómo leerla', 'Con un 7 % esperado y un 15 % de volatilidad, dos de cada tres años la cartera se moverá entre **−8 % y +22 %**.\n\nLas crisis se salen de ese rango más de lo que diría la estadística: los mercados tienen colas gruesas.'),
      text('La máxima caída', '• 1929–1932: −83 %\n• 2000–2002: −49 % (Nasdaq: −78 %)\n• 2007–2009: −57 %\n• 2020: −34 % en 33 días\n• 2022: cerca del −25 %\n\nEs la medida que mejor refleja el dolor real.'),
      sim('Mide una caída', 'En la ficha de cualquier índice, el gráfico profesional tiene la herramienta **Medir**.', 'Abre el S&P 500 en intervalo mensual y mide la caída de 2007 a 2009.'),
      key('Lo que te llevas', 'Antes de invertir, pregúntate cuánto puede caer y si aguantarías sin vender.', 'La volatilidad mide cuánto se mueve; la máxima caída, cuánto puede doler.', 'No preguntes cuánto puedes ganar: pregunta cuánto puede caer.'),
    ], [
      single('Volatilidad anual típica de un índice mundial de acciones:', ['1 %', '15 %', '70 %'], 1, 'Una acción suelta ronda el 25–35 % y bitcoin el 50–80 %.'),
      single('Rentabilidad esperada del 7 % y volatilidad del 15 %. Dos de cada tres años, entre…', ['0 % y 7 %', '−8 % y +22 %', '−50 % y +50 %'], 1, 'Media ± una desviación típica.'),
      single('¿Cuánto cayó el S&P 500 entre 2007 y 2009?', ['Un 15 %', 'Un 57 %', 'Un 90 %'], 1, 'Y el Nasdaq cayó un 78 % entre 2000 y 2002.'),
      point('Toca el punto más bajo de este periodo', 'trend-down-2', 'min', 'Ese mínimo marca el final de la caída en el periodo: desde el máximo anterior hasta ahí está la máxima caída.'),
    ], { source: '3.2' }),

    lesson('u3l3', 'Las matemáticas de las pérdidas', [
      img('drawdown', 'Pérdidas y ganancias no son simétricas', '**Subida necesaria = 1 ÷ (1 − caída) − 1**\n\nCon pérdidas pequeñas apenas se nota. Con grandes es devastador: una acción que cae un 90 % tiene que multiplicarse por diez para volver.'),
      text('La media engaña', '+50 % un año y −50 % al siguiente no es "0 % de media":\n\n100 € → 150 € → **75 €**. Has perdido un 25 %.'),
      text('Consecuencias prácticas', '• Diversificar evita que una empresa te cause un −90 %.\n• El apalancamiento acelera las pérdidas: con 1:5, una caída del 20 % se lo lleva todo.\n• En trading, el stop impide pérdidas de las que cuesta mucho recuperarse.'),
      key('Lo que te llevas', 'Evitar las grandes pérdidas importa más que buscar grandes ganancias.', 'Perder el 50 % exige ganar el 100 %.', 'Protege primero lo que tienes.'),
    ], [
      single('Una acción cae un 50 %. ¿Cuánto tiene que subir para volver al precio inicial?', ['50 %', '75 %', '100 %'], 2, '1 ÷ 0,5 − 1 = 100 %.'),
      single('Empiezas con 1.000 €, ganas un 50 % y luego pierdes un 50 %. Tienes…', ['1.000 €', '750 €', '500 €'], 1, '1.000 → 1.500 → 750.'),
      fill('Si pierdes un 20 %, necesitas ganar un ____ % para recuperarte.', '25', ['20', '40', '15'], '1 ÷ 0,8 − 1 = 25 %.'),
      tf('Con apalancamiento 1:5, una caída del 20 % del activo se lleva todo tu dinero.', true, '20 % × 5 = 100 %.'),
    ], { source: '3.3' }),

    lesson('u3l4', 'Diversificar: lo único gratis en finanzas', [
      text('Dos tipos de riesgo', '**Específico:** lo que le pasa a una empresa (un fraude, la quiebra). Se elimina diversificando.\n\n**De mercado:** lo que afecta a todas (una recesión). No se elimina con más acciones, solo combinando con bonos o liquidez.'),
      img('diversify', 'Cuántas acciones hacen falta', 'Una acción: 30–35 % de volatilidad. Con 20–30 de sectores distintos, cerca del 20 %. Con un índice, el nivel del mercado (≈ 15 %). Markowitz lo llamó "el único almuerzo gratis".'),
      text('Diversifica en varias dimensiones', '• Empresas: muchas.\n• Sectores: tecnología, salud, banca, consumo…\n• Países: España es menos del 1 % de la bolsa mundial.\n• Tipos de activo: acciones, bonos, liquidez.\n• Tiempo: invertir poco a poco.'),
      text('Lo que no es diversificar', '• 10 fondos con las mismas 50 tecnológicas.\n• 15 criptomonedas que caen a la vez.\n• Todo en la empresa donde trabajas: si va mal, pierdes sueldo y ahorros.'),
      sim('Construye una cartera variada', 'E-Trading te avisa si una compra supera el 20 % de tu cartera en un solo activo.', 'Monta una cartera con 6–8 activos de regiones y tipos distintos y mira la distribución en Cartera.'),
      key('Lo que te llevas', 'Además, diversificar asegura que tengas el 4 % de empresas que hacen ganar al mercado.', 'Con muchas empresas, los desastres de unas se compensan con los éxitos de otras.', 'No pongas todos los huevos en la misma cesta.'),
    ], [
      single('¿Qué riesgo elimina diversificar entre muchas acciones?', ['El de mercado', 'El específico de cada empresa', 'Todo el riesgo'], 1, 'El de mercado solo se reduce combinando con otros activos.'),
      single('¿Qué combinación diversifica mejor?', ['15 criptomonedas', '10 fondos tecnológicos de EE. UU.', 'Acciones mundiales y bonos de calidad'], 2, 'Activos distintos que no se hunden todos el mismo día.'),
      tf('España supone más del 10 % de la bolsa mundial.', false, 'Es menos del 1 %: invertir solo en España es concentrar.'),
      multi('¿Qué NO es diversificar? Marca todas.', ['Varios fondos que compran las mismas empresas', 'Todo en la empresa donde trabajas', 'Un fondo mundial con miles de empresas', 'Muchas criptomonedas'], [0, 1, 3], 'Un índice mundial sí reparte entre miles de empresas y países.'),
    ], { source: '3.4' }),

    lesson('u3l5', 'Correlación: por qué unos activos protegen a otros', [
      text('Qué es', 'La **correlación** mide si dos activos se mueven a la vez: **+1** siempre igual, **−1** siempre al contrario, **0** sin relación.\n\n• S&P 500 y Euro Stoxx 50: alta (0,7–0,9).\n• Acciones y bonos de calidad: baja o negativa en muchas crisis.\n• Dos criptos grandes: muy alta.'),
      text('La trampa de las crisis', 'En un pánico, muchos activos de riesgo caen a la vez: las correlaciones suben. Por eso los bonos de calidad y la liquidez son los que suelen proteger.\n\nPero en 2022 la inflación hizo caer acciones y bonos juntos.'),
      key('Lo que te llevas', 'Combinar activos que no se mueven igual suaviza la cartera, aunque ninguna protección funciona siempre.', 'Diversificar de verdad es tener cosas que no se hundan el mismo día.', 'Busca activos que se comporten distinto, no solo nombres distintos.'),
    ], [
      single('Una correlación de −1 significa que dos activos…', ['Se mueven siempre igual', 'Se mueven siempre al contrario', 'No tienen relación'], 1, '+1 igual, −1 al contrario, 0 sin relación.'),
      single('¿Qué pareja suele tener correlación muy alta?', ['Dos criptomonedas grandes', 'Acciones y bonos de calidad', 'Oro y acciones'], 0, 'Suelen subir y caer a la vez.'),
      tf('En 2022, acciones y bonos cayeron a la vez.', true, 'La inflación y las subidas de tipos golpearon a los dos.'),
      single('¿Qué suele pasar con las correlaciones en un pánico?', ['Bajan', 'Suben', 'Desaparecen'], 1, 'Casi todos los activos de riesgo caen juntos.'),
    ], { source: '3.5' }),

    lesson('u3l6', 'El horizonte cambia el riesgo', [
      text('Probabilidad de ganar según el plazo', 'S&P 500, histórico aproximado:\n\n• 1 día: algo más del 50 %\n• 1 año: cerca del 73 %\n• 10 años: cerca del 90 %\n• 20 años: casi todos los periodos desde 1926'),
      text('Los límites', 'Es la historia de EE. UU., el mercado que mejor ha ido. Japón tardó 34 años en recuperar su máximo de 1989. Por eso diversificar por países importa.'),
      text('Perderse los mejores días', 'J.P. Morgan (2005–2024): 10.000 $ en el S&P 500 se convirtieron en **71.750 $**. Quien se perdió los 10 mejores días acabó con **32.871 $**.\n\n7 de los 10 mejores días llegaron a menos de dos semanas de uno de los peores.'),
      key('Lo que te llevas', 'Salir "para esperar a que pase la tormenta" suele hacer perder justo los rebotes.', 'A un día, la bolsa es casi una moneda al aire; a veinte años, históricamente ha sido muy probable ganar.', 'El tiempo dentro del mercado vale más que acertar cuándo entrar.'),
    ], [
      single('Perderse los 10 mejores días del S&P 500 entre 2005 y 2024 redujo el resultado final…', ['Un 5 %', 'A la mitad aproximadamente', 'Nada'], 1, 'De 71.750 $ a 32.871 $.'),
      single('¿Cuánto tardó el Nikkei en recuperar su máximo de 1989?', ['5 años', '15 años', 'Unos 34 años'], 2, 'Un solo país puede estancarse décadas.'),
      tf('Los mejores días de bolsa suelen llegar cerca de los peores.', true, '7 de los 10 mejores llegaron a menos de dos semanas de uno de los 10 peores.'),
      order('Ordena los plazos de menor a mayor probabilidad histórica de ganar en el S&P 500.', ['1 día', '1 año', '10 años', '20 años'], 'El riesgo de perder baja con el tiempo.'),
    ], { source: '3.6' }),

    lesson('u3l7', 'Lecciones de las grandes crisis', [
      text('Cinco crisis, cinco lecciones', '• **1929:** se compraba con un 10 % del dinero. El apalancamiento convierte una caída en ruina.\n• **Japón 1989:** un país puede estancarse décadas.\n• **2000:** pagar demasiado por buenas empresas sale caro.\n• **2008:** hasta los expertos fallan.\n• **2020:** nadie adivina el suelo; vender en pánico fue el error.'),
      text('2022: las modas caen más', 'Inflación y subidas de tipos: cayeron acciones y bonos a la vez, y las criptos más de un 70 %. Ninguna protección funciona siempre.'),
      key('Las cinco reglas', '1. Nada de dinero prestado. 2. Diversifica empresas, sectores y países. 3. Ten colchón. 4. No pagues cualquier precio. 5. No vendas en pánico.', 'Quien estaba diversificado, sin deudas y con paciencia, se recuperó de todas.', 'Las crisis no avisan, pero sí se pueden preparar.'),
    ], [
      single('¿Qué lección deja el crack de 1929?', ['El apalancamiento convierte una caída en ruina', 'Hay que invertir solo en Japón', 'Las crisis duran un mes'], 0, 'Se compraban acciones con un 10 % del dinero.'),
      single('¿Qué lección deja la burbuja puntocom de 2000?', ['El precio importa: pagar demasiado sale caro', 'La tecnología nunca cae', 'Hay que vender siempre en enero'], 0, 'El Nasdaq cayó un 78 %.'),
      tf('En la caída del covid (2020), vender en pánico fue una buena decisión.', false, 'El mercado recuperó su máximo en unos meses.'),
      multi('¿Cuáles son reglas que salen de la historia? Marca todas.', ['No invertir con dinero prestado', 'Tener colchón', 'Concentrarse en la moda del momento', 'No vender en pánico'], [0, 1, 3], 'Las modas especulativas son las que más caen.'),
    ], { source: '3.7' }),
  ],
})
