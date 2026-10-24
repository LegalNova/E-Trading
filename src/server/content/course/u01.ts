import 'server-only'
// Unidad 1 · El dinero y por qué invertir (docs/curso/01)
import { fill, img, key, lesson, multi, order, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u1', order: 1, title: 'El dinero y por qué invertir', description: 'Inflación, interés compuesto y si estás listo para invertir', premiumOnly: false,
  lessons: [
    lesson('u1l1', 'Tu dinero pierde valor cada día', [
      text('Qué es la inflación', 'La inflación es la subida general de los precios. Si el pan, la luz y el alquiler suben de media un 3 % en un año, la inflación ha sido del 3 %.\n\nEn España la mide el INE con el IPC. En 2025 fue del **2,7 %** de media.'),
      text('Cuánto pierdes', 'Con los mismos euros compras menos cosas cada año.\n\n• 1.000 € con un 2,7 % de inflación durante 10 años compran lo que hoy **766 €**.\n• Con un 3 % durante 20 años, lo que hoy **554 €**.\n\nTruco rápido: 70 ÷ inflación = años hasta que tu dinero compra la mitad.'),
      text('La rentabilidad real', 'Para no perder poder de compra, tu dinero tiene que rendir más que la inflación.\n\n**Rentabilidad real ≈ rentabilidad − inflación.**\n\nUna cuenta al 2 % con un 2,7 % de inflación te hace perder un 0,7 % al año.'),
      key('Lo que te llevas', 'El BCE busca una inflación del 2 % a medio plazo. Incluso cuando todo va bien, el dinero parado pierde un 2 % al año de poder de compra.', 'El dinero parado no está a salvo: cada año compra menos.', 'Guardar dinero no es lo mismo que protegerlo.'),
    ], [
      single('La inflación es del 3 % anual. ¿Cuánto podrán comprar 1.000 € dentro de 20 años, en euros de hoy?', ['940 €', '554 €', '400 €'], 1, '1.000 ÷ 1,03²⁰ ≈ 554 €. Cada año los precios suben y el mismo dinero compra menos.'),
      single('Tu cuenta paga un 1,5 % y la inflación es del 2,7 %. ¿Tu rentabilidad real?', ['+1,5 %', '+4,2 %', '−1,2 %'], 2, 'Real ≈ 1,5 − 2,7 = −1,2 %. Ganas euros, pero pierdes poder de compra.'),
      tf('El objetivo de inflación del BCE es el 0 %.', false, 'Es el 2 % a medio plazo. Por eso el dinero parado pierde valor incluso en años normales.'),
      fill('Con la regla del 70, una inflación del 2 % reduce a la mitad el poder de compra en unos ____ años.', '35', ['10', '70', '20'], '70 ÷ 2 = 35 años.'),
    ], { source: '1.1' }),

    lesson('u1l2', 'Ahorrar, invertir y especular', [
      text('Ahorrar', 'Apartar dinero **sin arriesgarlo**: cuenta remunerada, depósito o letras del Tesoro.\n\nLos depósitos están cubiertos hasta 100.000 € por el Fondo de Garantía de Depósitos. Sirve para el colchón y para gastos de menos de 2–3 años.'),
      text('Invertir', 'Poner dinero en cosas que **producen valor**: empresas (acciones), préstamos (bonos), inmuebles. Ganas porque generan beneficios, intereses o rentas.\n\nSube y baja, a veces mucho. Sirve para objetivos a 5 años o más.'),
      text('Especular', 'Comprar esperando que **otro te lo compre más caro pronto**, sin que el activo genere valor en ese plazo: operar a minutos, perseguir modas, usar apalancamiento.\n\nEs un juego de suma cero antes de costes y negativo después. La mayoría pierde.'),
      key('La diferencia en una frase', 'La CNMV pide a todo inversor saber distinguir invertir de especular. La clave es de dónde sale la ganancia.', 'Se ahorra para lo cercano, se invierte para lo lejano y se especula solo con lo que puedes perder.', 'Si no sabes de dónde sale la ganancia, probablemente sale de tu bolsillo.'),
    ], [
      tf('Especular es comprar algo esperando que otro te lo compre más caro pronto, aunque no genere valor en ese plazo.', true, 'Esa es la diferencia con invertir, donde la ganancia sale de lo que el activo produce.'),
      single('Necesitas el dinero para un viaje dentro de un año. ¿Qué tiene más sentido?', ['Ahorrarlo en una cuenta o depósito', 'Invertirlo en acciones', 'Especular con criptomonedas'], 0, 'A un año, el dinero no debe estar en algo que puede caer un 30 %.'),
      single('¿De dónde sale la ganancia de quien invierte en una empresa a largo plazo?', ['De otro inversor que pierde', 'De los beneficios que genera la empresa', 'De la suerte'], 1, 'Invertir es participar en lo que el activo produce: beneficios, intereses o rentas.'),
      multi('¿Cuáles son ejemplos de especulación? Marca todos.', ['Operar cada pocos minutos', 'Comprar una moneda de moda porque sube', 'Aportar cada mes a un fondo mundial durante 20 años', 'Usar mucho apalancamiento'], [0, 1, 3], 'Aportar a largo plazo a un fondo diversificado es invertir.'),
    ], { source: '1.2' }),

    lesson('u1l3', 'La octava maravilla: el interés compuesto', [
      text('Simple y compuesto', '**Simple:** cobras siempre sobre lo que pusiste. 1.000 € al 7 % dan 70 € al año: en 30 años, 3.100 €.\n\n**Compuesto:** ganas sobre lo que pusiste más lo ya ganado. Esos 1.000 € se convierten en **7.612 €**.'),
      img('compound', 'El tiempo hace el trabajo', '100 € al mes durante 30 años (36.000 € aportados):\n\n• Al 0 %: 36.000 €\n• Al 2 %: 49.273 €\n• Al 5 %: 83.226 €\n• Al 7 %: **121.997 €**\n\nSon ejemplos, no promesas: la bolsa no da un 7 % cada año.'),
      text('Ana y Bruno', 'Los dos aportan 200 € al mes al 7 % hasta los 65.\n\n• Ana empieza a los 25: llega a **524.963 €**.\n• Bruno empieza a los 35: llega a **243.994 €**.\n\nAna aporta solo 24.000 € más y acaba con más del doble.', 'Regla del 72: 72 ÷ rentabilidad = años para duplicar.'),
      key('También funciona en tu contra', 'Una tarjeta revolving al 20 % duplica la deuda en menos de 4 años. Y un 1,5 % de comisiones al año se come un tercio del resultado a 30 años.', 'Las ganancias generan nuevas ganancias. Cuanto antes empiezas, más trabaja el tiempo por ti.', 'El mejor momento para empezar fue hace diez años. El segundo mejor es hoy.'),
    ], [
      fill('Según la regla del 72, al 6 % anual el dinero se duplica en unos ____ años.', '12', ['6', '20', '72'], '72 ÷ 6 = 12 años.'),
      single('Ana y Bruno aportan 200 € al mes al 7 %, pero Ana empieza 10 años antes. A los 65, Ana tiene…', ['Un 25 % más', 'Más del doble', 'Lo mismo'], 1, '524.963 € frente a 243.994 €: los primeros años son los que más se componen.'),
      single('1.000 € al 7 % compuesto durante 30 años se convierten aproximadamente en…', ['3.100 €', '7.600 €', '21.000 €'], 1, '1.000 × 1,07³⁰ ≈ 7.612 €. Con interés simple serían 3.100 €.'),
      tf('El interés compuesto solo funciona a tu favor.', false, 'También funciona en tu contra con las deudas caras y las comisiones.'),
    ], { source: '1.3' }),

    lesson('u1l4', 'Antes de invertir: colchón y deudas', [
      text('La pirámide del dinero', 'Invertir es el cuarto escalón, no el primero:\n\n1. Controlar los gastos.\n2. Colchón de emergencia: **3 a 6 meses de gastos**.\n3. Eliminar las deudas caras.\n4. Invertir lo que no necesitarás en 5 años o más.'),
      text('Por qué el colchón va primero', 'Sin colchón, cualquier imprevisto te obliga a vender tus inversiones. Y suele pasar justo cuando la bolsa ha caído: las crisis traen a la vez despidos y caídas.'),
      text('Deudas caras y baratas', 'Pagar una deuda al 20 % es una ganancia segura del 20 %. Ninguna bolsa lo garantiza.\n\nUna hipoteca al 2–3 % sí se puede compaginar con invertir.'),
      key('La lista de los 4 puntos', 'Estás listo si respondes sí a todo: sé cuánto gasto · tengo de 3 a 6 meses apartados · no tengo deudas de más del 7–8 % · no necesitaré este dinero en 5 años.', 'Primero el colchón y fuera las deudas caras; después, invertir.', 'Invertir con deudas al 20 % es llenar un cubo agujereado.'),
    ], [
      order('Ordena la pirámide del dinero, de primero a último.', ['Controlar gastos', 'Colchón de emergencia', 'Eliminar deudas caras', 'Invertir'], 'Sin base, cualquier imprevisto te obliga a vender en el peor momento.'),
      single('Laura tiene 8.000 € ahorrados, gasta 1.500 € al mes y debe 3.000 € en una tarjeta al 21 %. ¿Qué hace primero?', ['Invertir los 8.000 €', 'Pagar la tarjeta y dejar el resto de colchón', 'Comprar criptomonedas'], 1, 'Pagar la deuda es un 21 % seguro. Le quedan 5.000 €: algo más de 3 meses de gastos.'),
      single('¿Cuánto debería tener un colchón de emergencia?', ['Un mes de sueldo', 'De 3 a 6 meses de gastos', 'Todo lo que tengas'], 1, 'Más si tu trabajo es inestable o eres autónomo.'),
      tf('Tener una hipoteca al 2 % impide invertir.', false, 'Una deuda barata se puede compaginar con invertir. Las que hay que eliminar antes son las caras.'),
    ], { source: '1.4' }),

    lesson('u1l5', 'Tus objetivos y tu horizonte', [
      text('Ponle fecha a cada euro', 'Cada objetivo tiene un plazo:\n\n• Colchón: siempre disponible → cuenta remunerada.\n• Viaje o coche (1–3 años) → depósitos, letras.\n• Entrada de un piso (3–7 años) → mezcla prudente.\n• Jubilación (15+ años) → sobre todo acciones diversificadas.'),
      text('El riesgo baja con el tiempo', 'El S&P 500 ha caído aproximadamente uno de cada cuatro años. Pero en periodos de 20 años, perder ha sido rarísimo.\n\nRaro no es imposible: quien entró en 1929 o en 2000 esperó más de una década.'),
      text('Objetivos que funcionan', 'Mal: "quiero tener dinero".\n\nBien: "quiero **30.000 €** para la entrada de un piso en **junio de 2031**, aportando **400 € al mes**".\n\nEspecífico, medible, alcanzable, relevante y con fecha.'),
      key('La regla del plazo', 'No se invierte en bolsa el dinero que se necesita pronto: no porque vaya a bajar seguro, sino porque puede estar bajando justo cuando lo necesites.', 'El plazo decide el riesgo que puedes asumir.', 'El dinero de dentro de dos años no debería estar en algo que cae un 30 % en un mes.'),
    ], [
      single('Necesitas la entrada de un piso dentro de 18 meses. ¿Dónde tiene más sentido?', ['100 % en acciones tecnológicas', 'Depósitos o un fondo monetario', 'Criptomonedas'], 1, 'A 18 meses, una caída del 30 % arruinaría el plan.'),
      tf('En periodos de 20 años, el S&P 500 casi nunca ha dado pérdidas.', true, 'Casi nunca no es nunca: por eso conviene diversificar por países.'),
      single('¿Cuál es un objetivo bien planteado?', ['Ser rico', 'Ahorrar mucho', 'Tener 12.000 € para un coche en 2029 aportando 250 € al mes'], 2, 'Tiene cantidad, fecha y plan: se puede medir y seguir.'),
      order('Ordena de menor a mayor el riesgo que suele admitir cada objetivo.', ['Colchón de emergencia', 'Viaje en un año', 'Entrada de un piso en 5 años', 'Jubilación en 30 años'], 'A más plazo, más tiempo para recuperarse de las caídas.'),
    ], { source: '1.5' }),

    lesson('u1l6', 'Cuánto riesgo puedes aguantar', [
      text('Dos ingredientes', '**Capacidad de riesgo:** cuánto puedes perder sin que cambie tu vida (ingresos, colchón, cargas, plazo).\n\n**Tolerancia:** cuánto puedes ver caer tu dinero sin vender en pánico. Casi todos la sobrestiman cuando la bolsa sube.\n\nTu perfil real es el menor de los dos.'),
      text('La prueba del 40 %', 'Inviertes 10.000 € y en seis meses valen 6.000 €. ¿Qué harías?\n\n• Vender todo → perfil conservador.\n• Aguantar → moderado.\n• Aportar más → decidido, si tienes capacidad.\n\nLa bolsa mundial cayó más de un 50 % en 2007–2009.'),
      text('El test MiFID', 'Al abrir cuenta en un bróker europeo te harán un test de conveniencia o idoneidad. Contéstalo con sinceridad: te protege de productos complejos que no entiendes.'),
      key('Tu perfil de verdad', 'La caída que aguantarías sin vender es la que debe marcar tu reparto entre acciones y bonos.', 'Tu perfil depende de cuánto puedes perder y de cómo reaccionas al perder.', 'Todo el mundo es valiente cuando la bolsa sube.'),
    ], [
      single('¿Cuál es tu perfil de riesgo real?', ['El mayor entre capacidad y tolerancia', 'El menor entre capacidad y tolerancia', 'El que diga tu amigo'], 1, 'Si puedes perder mucho pero no lo soportas, venderás en pánico.'),
      tf('Una caída del 40 % en bolsa es algo teórico que no ha pasado nunca.', false, 'La bolsa mundial cayó más del 50 % en 2007–2009 y casi un 50 % en 2000–2002.'),
      single('¿Para qué sirve el test MiFID del bróker?', ['Para cobrarte más', 'Para protegerte de productos que no entiendes', 'Para nada'], 1, 'La normativa europea obliga a comprobar tu experiencia y tus conocimientos.'),
      single('Te pones muy nervioso si ves números rojos y necesitas el dinero en 3 años. Tu perfil es…', ['Conservador', 'Muy decidido', 'Especulador'], 0, 'Baja tolerancia y plazo corto: mucha renta fija y poca bolsa.'),
    ], { source: '1.6' }),

    lesson('u1l7', 'La verdad sobre hacerse rico con el trading', [
      text('Lo que dicen los datos', '• Brasil: el **97 %** de quienes hicieron *day trading* más de 300 días perdió dinero.\n• Europa: entre el **74 % y el 89 %** de las cuentas minoristas de CFD pierde dinero (ESMA).\n• EE. UU.: los hogares que más operaban ganaban un 11,4 % anual frente al 17,9 % del mercado.'),
      text('Por qué pasa', '• Cada operación paga comisión y *spread*.\n• Al otro lado hay profesionales y algoritmos.\n• Cortamos las ganancias pronto y dejamos correr las pérdidas.\n• El apalancamiento multiplica las pérdidas.'),
      text('Señales de un gurú o una estafa', '• Promete rentabilidades altas sin riesgo.\n• Enseña capturas, nunca su historial completo.\n• Vende cursos o señales con prisa.\n• Te pide abrir cuenta en un bróker concreto.\n• No está registrado en la CNMV.'),
      key('Cómo se gana de verdad', 'Lo que funciona para la mayoría: aportar con regularidad, diversificar, pagar poco en comisiones, durante mucho tiempo y sin vender en pánico.', 'La mayoría de quien especula a corto plazo pierde; la mayoría de quien invierte con paciencia gana.', 'Si fuera fácil hacerse rico en una semana, nadie te lo vendería.'),
    ], [
      single('Según la ESMA, ¿qué porcentaje de cuentas minoristas de CFD pierde dinero?', ['20–30 %', 'Alrededor del 50 %', '74–89 %'], 2, 'Por eso desde 2018 el apalancamiento está limitado para minoristas.'),
      single('En Brasil, de quienes hicieron day trading más de 300 días, ¿cuántos perdieron dinero?', ['El 30 %', 'El 60 %', 'El 97 %'], 2, 'Solo un 1,1 % ganó más que el salario mínimo (Chague y otros, 2020).'),
      multi('¿Qué son señales de estafa? Marca todas.', ['Rentabilidad alta garantizada', 'Prisa por decidir', 'Registro en la CNMV y documento de riesgos', 'Solo enseñan capturas de ganancias'], [0, 1, 3], 'Una entidad legal está registrada y explica sus riesgos y costes.'),
      tf('Los hogares que más operaban ganaban más que el mercado.', false, 'Ganaban un 11,4 % frente al 17,9 % del mercado: el exceso de confianza sale caro.'),
    ], { source: '1.7' }),
  ],
})
