import 'server-only'
// Unidad 4 · Invertir a largo plazo (docs/curso/04). Gratis 4.1–4.3; resto Premium.
import { fill, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u4', order: 4, title: 'Invertir a largo plazo', description: 'Indexación, comisiones, aportaciones, cartera y tu plan', premiumOnly: true, freeLessonIds: ['u4l1', 'u4l2', 'u4l3'],
  lessons: [
    lesson('u4l1', 'Gestión activa contra pasiva', [
      text('Dos filosofías', '**Activa:** un gestor elige qué comprar para intentar batir al mercado.\n\n**Pasiva (indexada):** se compra todo el índice y se mantiene, con costes mínimos.'),
      text('Lo que dicen los datos', 'Informe SPIVA, Europa, cierre de 2025:\n\n• En 1 año, el **81,8 %** de los fondos de acciones europeos quedó por detrás de su índice.\n• En 10 años, el **97 %**.\n\nY casi ninguno de los que baten al índice lo repite.'),
      text('La aritmética de Sharpe', '1. Todos los inversores juntos son el mercado.\n2. Antes de costes, el inversor activo medio obtiene lo mismo que el mercado.\n3. Después de costes, **tiene que** obtener menos.\n\nNo es que los gestores sean malos: compiten entre ellos y cobran caro.'),
      key('El consejo de Buffett', 'Buffett dejó escrito que el dinero de su familia vaya un 90 % a un fondo indexado del S&P 500 barato y un 10 % a bonos cortos. Y ganó su apuesta de 10 años contra los hedge funds.', 'A largo plazo, casi todos los gestores rinden menos que el índice que intentan batir.', 'Si casi nadie bate al índice, comprarlo te pone por delante de casi todos.'),
    ], [
      single('Según SPIVA, ¿qué proporción de fondos de acciones europeos quedó por detrás de su índice en 10 años?', ['30 %', '60 %', '97 %'], 2, 'Cierre de 2025.'),
      single('¿Por qué el inversor activo medio obtiene menos que el mercado tras costes?', ['Porque es tonto', 'Porque antes de costes obtiene lo mismo y paga más costes', 'Porque el mercado hace trampas'], 1, 'Es la aritmética de William Sharpe.'),
      tf('Los fondos que baten al índice un año suelen repetirlo los años siguientes.', false, 'El éxito pasado casi nunca predice el futuro.'),
      single('¿Qué recomendó Buffett para el dinero de su familia?', ['Elegir acciones una a una', '90 % en un indexado del S&P 500 y 10 % en bonos cortos', 'Todo en oro'], 1, 'Incluso el inversor activo más famoso recomienda indexarse.'),
    ], { source: '4.1' }),

    lesson('u4l2', 'Las comisiones: el enemigo silencioso', [
      text('El ejemplo', '10.000 € durante 30 años con un mercado al 7 %:\n\n• Sin costes: **76.123 €**\n• Con un 0,2 % (indexado): **71.968 €**\n• Con un 1,5 % (fondo activo típico): **49.840 €**\n\nUn 1,5 % se lleva más de 26.000 €: un tercio del resultado.'),
      text('Con aportaciones', '300 € al mes durante 30 años:\n\n• Con un 0,2 % de costes: unos **351.900 €**\n• Con un 1,8 %: unos **259.100 €**\n\nMás de 90.000 € de diferencia.'),
      text('Todos los costes', '1. Gastos corrientes o TER (en el KID).\n2. Comisión del bróker por operación.\n3. *Spread*.\n4. Custodia.\n5. Cambio de divisa.\n6. Impuestos (unidad 12).'),
      key('Bogle lo resumía así', '"En inversión, obtienes aquello por lo que no pagas."', 'Cada 1 % anual de costes se come una parte enorme del resultado, por el interés compuesto.', 'Un 1,5 % al año suena a poco. A 30 años, es un tercio de tu dinero.'),
    ], [
      single('10.000 € a 30 años al 7 %. ¿Cuánto se lleva aproximadamente un coste del 1,5 % anual?', ['1.500 €', '10.000 €', 'Más de 26.000 €'], 2, '76.123 € frente a 49.840 €.'),
      fill('El coste anual de un fondo o ETF se llama gastos corrientes o ____.', 'TER', ['IVA', 'IPC', 'PER'], 'Lo encontrarás en el KID.'),
      multi('¿Qué costes debes mirar? Marca todos.', ['Gastos corrientes', 'Comisión por operación', 'Cambio de divisa', 'El color de la app'], [0, 1, 2], 'También el spread, la custodia y los impuestos.'),
      tf('Un 1 % de comisiones anuales apenas importa a 30 años.', false, 'Por el interés compuesto, se come una parte enorme del resultado.'),
    ], { source: '4.2' }),

    lesson('u4l3', 'Poco a poco o de golpe', [
      text('Aportaciones periódicas (DCA)', 'Invertir la misma cantidad cada mes, pase lo que pase:\n\n• Compras más cuando está barato.\n• Automatiza la disciplina.\n• Encaja con cobrar un sueldo.'),
      text('El ejemplo', '100 € al mes, con el precio en 10 → 8 → 5 → 8 → 10 €.\n\nCompras **65 participaciones** por 500 €. Tu precio medio: **7,69 €**. Ganas un 30 % aunque el precio empezó y acabó en 10 €.'),
      text('¿Y si tengo una suma grande?', 'Vanguard: invertir todo **de golpe** ganó unas **dos de cada tres veces**, porque el mercado sube más veces de las que baja.\n\nPero DCA evita el arrepentimiento. Una solución intermedia: repartir en 6–12 meses.'),
      sim('Aportación semanal', 'Practica el hábito en el simulador.', 'Compra 100 € del mismo ETF cada lunes durante un mes y calcula tu precio medio.'),
      key('Lo que no funciona', 'Esperar "a que baje" suele salir mal: nadie sabe dónde está el suelo.', 'De golpe gana más veces; poco a poco reduce el arrepentimiento. Lo importante es empezar y no parar.', 'Invertir cada mes es subir una escalera sin pararse.'),
    ], [
      single('Inviertes 100 € al mes y el precio pasa por 10, 8, 5, 8 y 10 €. ¿Tu precio medio?', ['Más de 10 €', 'Unos 7,69 €', 'Exactamente 10 €'], 1, 'Compras más participaciones cuando está barato.'),
      single('Con una suma grande, ¿qué ganó más veces según Vanguard?', ['Invertirla de golpe', 'Repartirla en 3 años', 'Esperar una caída'], 0, 'Unas dos de cada tres veces.'),
      tf('Aportar la misma cantidad cada mes compra más participaciones cuando el precio baja.', true, 'Por eso el precio medio queda por debajo de la media de precios.'),
      single('¿Qué ventaja principal tiene repartir una suma en varios meses?', ['Gana siempre', 'Reduce el arrepentimiento si el mercado cae justo después', 'Evita impuestos'], 1, 'Es sobre todo una ventaja psicológica.'),
    ], { source: '4.3' }),

    lesson('u4l4', 'Tu reparto de activos', [
      text('La decisión más importante', 'El reparto entre acciones y bonos explica la mayor parte de cómo se comporta una cartera diversificada, mucho más que los fondos concretos que elijas.'),
      text('Repartos de ejemplo', '• Conservador: 20–40 % acciones (caída posible −10 a −20 %).\n• Moderado: 50–60 % (−20 a −30 %).\n• Decidido: 70–90 % (−30 a −45 %).\n• 100 % acciones: −50 % o más.\n\nSon ejemplos educativos, no recomendaciones.'),
      text('Ajustar con el tiempo', 'A medida que se acerca el objetivo, se reduce la parte de acciones. Una referencia antigua: "100 (o 110) menos tu edad en acciones".'),
      key('Lo que te llevas', 'Elige la mezcla pensando en la caída que aguantarías sin vender.', 'El reparto entre acciones y bonos explica casi todo el comportamiento de la cartera.', 'La mezcla buena es la que te deja dormir en una caída del 30 %.'),
    ], [
      single('¿Qué decisión explica la mayor parte del comportamiento de una cartera diversificada?', ['El día de compra', 'El reparto entre acciones, bonos y liquidez', 'El fondo que más subió el año pasado'], 1, 'Estudios clásicos de Brinson y otros.'),
      single('Una cartera 80 % acciones / 20 % bonos corresponde a un perfil…', ['Conservador', 'Decidido', 'Sin riesgo'], 1, 'Puede caer entre un 30 % y un 45 % en una crisis fuerte.'),
      tf('Cuanto más se acerca el objetivo, más acciones conviene tener.', false, 'Al revés: se reduce el riesgo cuando queda poco tiempo.'),
      order('Ordena de menos a más arriesgado.', ['30 % acciones', '60 % acciones', '80 % acciones', '100 % acciones'], 'Más acciones = más rentabilidad esperada y caídas más fuertes.'),
    ], { source: '4.4', xp: 35 }),

    lesson('u4l5', 'Carteras sencillas con fondos indexados', [
      text('Un solo producto', 'Un fondo o ETF de **todo el mundo** (MSCI ACWI o FTSE All-World) tiene entre 2.500 y 4.000 empresas de países desarrollados y emergentes. Una compra al mes y listo.'),
      text('Dos o tres productos', '• **Dos:** acciones mundiales + bonos globales de calidad cubiertos a euros.\n• **Tres:** países desarrollados (MSCI World) + emergentes (≈ 10–12 %) + bonos.\n\nNo hacen falta 20 fondos ni cambiar cada año.'),
      text('¿Por qué no solo el S&P 500?', 'EE. UU. es hoy el 60–70 % del mundo desarrollado y ha ido muy bien. Pero en 2000–2009 dio casi cero mientras otras regiones subían. El índice mundial ya incluye EE. UU. y diversifica frente a su década mala.'),
      sim('Dos carteras, una prueba', 'Compara una cartera "mundial" con otra concentrada.', 'Monta una cartera con 2–3 ETF mundiales y otra con 3 acciones que te gusten, y compáralas dentro de unas semanas.'),
      key('Lo que te llevas', 'Estas carteras son ejemplos para entender cómo se construyen, no recomendaciones personalizadas.', 'Con uno a tres fondos indexados puedes tener miles de empresas de todo el mundo.', 'Una cartera aburrida es una cartera que funciona.'),
    ], [
      single('¿Cuántas empresas tiene aproximadamente un índice mundial como el MSCI ACWI?', ['50', 'Unas 500', 'Entre 2.500 y 4.000'], 2, 'Países desarrollados y emergentes en un solo producto.'),
      tf('Las acciones de EE. UU. siempre han sido la mejor región en cada década.', false, 'En 2000–2009 rindieron casi cero.'),
      single('En una cartera de tres fondos, ¿qué peso aproximado tienen los emergentes según su peso en el mundo?', ['1 %', '10–12 %', '50 %'], 1, 'Es aproximadamente su peso en el mercado mundial.'),
      single('¿Qué NO hace falta para una buena cartera indexada?', ['Costes bajos', 'Diversificación', 'Cambiar de fondo cada año según el que más subió'], 2, 'Perseguir al ganador del año pasado suele salir mal.'),
    ], { source: '4.5', xp: 35 }),

    lesson('u4l6', 'Rebalancear: volver al plan', [
      text('Por qué se desvía', 'Tu plan es 60 % acciones / 40 % bonos. Tras dos años buenos de bolsa estás en 72/28: sin darte cuenta, tu cartera es más arriesgada.'),
      text('Cómo se hace', '1. **Por calendario:** una vez al año vuelves al 60/40.\n2. **Por umbral:** si una parte se desvía más de 5 puntos.\n3. **Con las aportaciones:** añades dinero a lo que se ha quedado atrás. Es lo más eficiente: vender genera impuestos.'),
      key('El efecto psicológico', 'En 2009 o en marzo de 2020, rebalancear obligaba a comprar acciones justo cuando más miedo había.', 'Rebalancear es vender un poco de lo que más ha subido y comprar lo que menos.', 'Es la forma automática de comprar barato cuando todos venden.'),
    ], [
      single('Tu plan es 60/40 y estás en 72/28. Rebalancear es…', ['Comprar más acciones', 'Vender acciones o aportar a bonos hasta volver al 60/40', 'No tocar nada nunca'], 1, 'Vuelves al riesgo que elegiste.'),
      single('¿Cuál es la forma más eficiente fiscalmente de rebalancear?', ['Vender todo cada año', 'Usar las aportaciones nuevas', 'Cambiar de bróker'], 1, 'Vender genera impuestos; aportar no.'),
      tf('Rebalancear obliga a comprar lo que ha caído.', true, 'Por eso es una forma disciplinada de comprar barato.'),
      fill('Rebalancear por ____ significa corregir cuando una parte se desvía más de 5 puntos.', 'umbral', ['calendario', 'intuición', 'rumor'], 'También se puede hacer por calendario, una vez al año.'),
    ], { source: '4.6', xp: 35 }),

    lesson('u4l7', 'Dividendos y la trampa del rendimiento alto', [
      text('El dividendo no es gratis', 'Cuando una empresa paga 1 € de dividendo, su precio baja aproximadamente 1 € ese día. No eres más rico: tienes 1 € en efectivo y 1 € menos en acciones. Y ese euro paga impuestos.'),
      text('Acumulación o distribución', '• **Acumulación:** reinvierte sin pagar impuestos hasta vender. Mejor para acumular patrimonio.\n• **Distribución:** paga los dividendos. Útil si necesitas rentas.'),
      text('La trampa del 12 %', 'Un dividendo altísimo suele significar que el precio ha caído porque el mercado espera un **recorte** o problemas. Mira si está cubierto por el beneficio y la caja (unidad 5).'),
      key('Lo que te llevas', 'Lo que importa es la rentabilidad total, no solo el dividendo.', 'El dividendo sale del valor de la empresa.', 'Un dividendo altísimo a veces es una alarma, no un regalo.'),
    ], [
      tf('Cuando una empresa paga un dividendo, su precio suele bajar aproximadamente esa cantidad.', true, 'El dinero sale de la empresa y llega a tu cuenta.'),
      single('Una acción ofrece un dividendo del 13 %. ¿Qué compruebas primero?', ['Que el dividendo esté cubierto por el beneficio y por qué ha caído el precio', 'Nada, es una ganga', 'El número de empleados'], 0, 'Muchas veces anticipa un recorte.'),
      single('Para acumular patrimonio sin pagar impuestos cada año, suele ser más eficiente un fondo…', ['De distribución', 'De acumulación', 'Monetario'], 1, 'Reinvierte y no tributa hasta la venta.'),
      single('¿Qué importa más a largo plazo?', ['El dividendo', 'La rentabilidad total', 'El precio de la acción'], 1, 'Dividendos + revalorización.'),
    ], { source: '4.7', xp: 35 }),

    lesson('u4l8', 'Tu Declaración de Política de Inversión', [
      text('Qué es', 'Un documento de una página con qué haces, por qué y **qué harás cuando el mercado se ponga feo**. Los grandes inversores la tienen; tú también deberías.'),
      text('La plantilla', '1. Objetivos.\n2. Horizonte.\n3. Colchón.\n4. Reparto.\n5. Productos y costes máximos.\n6. Aportación automática.\n7. Cuándo rebalanceas.\n8. Qué harás si la bolsa cae un 30 %.\n9. Qué no harás nunca.\n10. Límite de especulación.'),
      text('Revísalo', 'Una vez al año o si cambia tu vida (trabajo, hijos, casa). **No** porque el mercado haya subido o bajado.'),
      sim('Escribe la tuya', 'Pregúntale a Lumi: te ayudará a revisarla.', 'Escribe tu Declaración con la plantilla y pídele a Lumi que la revise.'),
      key('Lo que te llevas', 'El punto 8 es el más importante: decide hoy, con calma, qué harás con miedo.', 'Un plan escrito en calma te salva en el pánico.', 'Escribe hoy lo que harás el día que todo el mundo tenga miedo.'),
    ], [
      single('¿Qué debe incluir siempre tu Declaración de Política de Inversión?', ['Una predicción de la bolsa', 'Qué harás si la bolsa cae mucho', 'Las acciones de moda'], 1, 'Es lo que te protege del pánico.'),
      tf('La Declaración se cambia cada vez que el mercado sube o baja mucho.', false, 'Se revisa si cambia tu vida, no el mercado.'),
      order('Ordena las primeras secciones de la Declaración.', ['Objetivos', 'Horizonte', 'Reparto', 'Productos', 'Aportaciones'], 'Primero qué y cuándo; después cómo.'),
      multi('¿Qué puede ir en "qué no haré nunca"? Marca todas.', ['Invertir con dinero prestado', 'Comprar algo que no entiendo', 'Aportar cada mes', 'Poner más del 20 % en un solo activo'], [0, 1, 3], 'Aportar cada mes es parte del plan.'),
    ], { source: '4.8', xp: 40 }),
  ],
})
