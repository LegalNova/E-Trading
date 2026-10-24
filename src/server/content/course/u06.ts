import 'server-only'
// Unidad 6 · La economía que mueve los mercados (docs/curso/06). Premium.
import { fill, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u6', order: 6, title: 'La economía y los mercados', description: 'Tipos de interés, inflación, ciclo y datos económicos', premiumOnly: true,
  lessons: [
    lesson('u6l1', 'Bancos centrales y tipos de interés', [
      text('Quién fija el precio del dinero', '• **BCE:** zona euro, objetivo de inflación del 2 %.\n• **Reserva Federal:** EE. UU., precios estables y máximo empleo.\n\nEn junio de 2026 el BCE subió la facilidad de depósito al **2,25 %**.'),
      text('Cuando suben los tipos', '1. Préstamos e hipotecas más caros.\n2. Se consume e invierte menos.\n3. La economía se enfría y la inflación baja (con 12–24 meses de retraso).\n4. Depósitos y bonos pagan más: competencia para la bolsa.\n5. Los beneficios futuros valen menos hoy.'),
      text('Quién sufre más', '• Empresas de crecimiento sin beneficios actuales.\n• Empresas muy endeudadas e inmobiliarias.\n• Bonos largos.\n\nEn 2022 el Nasdaq cayó más de un 30 % y los bonos largos más de un 20 %.'),
      key('Lo que te llevas', 'Además de los tipos, los bancos centrales compran bonos (QE) o los dejan vencer (QT).', 'El tipo de interés es el precio del dinero. Cuando sube, lo que depende del futuro vale menos.', 'Cuando el dinero se encarece, el futuro vale menos.'),
    ], [
      single('¿Cuál es el objetivo de inflación del BCE?', ['0 %', '2 % a medio plazo', '5 %'], 1, 'Por eso actúa cuando la inflación se aleja del 2 %.'),
      single('El BCE sube los tipos. ¿Qué empresa suele sufrir más en bolsa?', ['Una eléctrica sin deuda', 'Una tecnológica joven sin beneficios', 'Un supermercado'], 1, 'Su valor depende de beneficios lejanos, que se descuentan más.'),
      order('Ordena lo que pasa cuando suben los tipos.', ['Los préstamos se encarecen', 'Se consume e invierte menos', 'La economía se enfría', 'La inflación baja'], 'Con un retraso de 12 a 24 meses.'),
      tf('Las subidas de tipos suelen beneficiar a los bonos largos que ya tienes.', false, 'Su precio cae cuando suben los tipos.'),
    ], { source: '6.1' }),

    lesson('u6l2', 'La inflación y la bolsa', [
      text('Quién gana y quién pierde', '• **Liquidez:** pierde poder de compra.\n• **Bonos a tipo fijo:** caen con inflación alta e inesperada.\n• **Bonos ligados a la inflación:** protegen.\n• **Acciones:** sufren a corto plazo, protegen a largo.\n• **Oro y materias primas:** suelen subir.'),
      text('El poder de fijar precios', 'Las empresas que pueden subir precios sin perder clientes trasladan la inflación a sus ventas y protegen sus márgenes. Las que no, ven cómo sus costes suben más que sus ingresos.'),
      key('Lo que te llevas', 'A largo plazo, ser dueño de buenos negocios ha protegido mejor que tener el dinero quieto.', 'Contra la inflación, la mejor defensa es ser dueño de negocios que puedan subir sus precios.', 'La liquidez es la que más pierde con la inflación.'),
    ], [
      single('¿Qué activo suele perder más con una inflación alta e inesperada?', ['Bonos ligados a la inflación', 'Bonos a tipo fijo de largo plazo', 'Oro'], 1, 'Suben los tipos y su precio cae.'),
      single('¿Qué empresas protegen mejor sus márgenes con inflación?', ['Las que pueden subir precios sin perder clientes', 'Las más endeudadas', 'Las que no tienen marca'], 0, 'Trasladan la subida de costes a sus precios.'),
      tf('Con inflación, el dinero en efectivo gana poder de compra.', false, 'Lo pierde: compra menos cada año.'),
      single('A largo plazo, frente a la inflación, las acciones de buenas empresas han…', ['Protegido bien', 'Perdido siempre', 'Dado lo mismo que la liquidez'], 0, 'Aunque a corto plazo puedan sufrir.'),
    ], { source: '6.2' }),

    lesson('u6l3', 'El ciclo económico y los sectores', [
      text('Las cuatro fases', '1. **Recuperación:** tipos bajos, la economía empieza a crecer.\n2. **Expansión:** empleo alto, beneficios al alza.\n3. **Desaceleración:** suben los tipos, se frena.\n4. **Recesión:** el PIB cae (técnicamente, dos trimestres seguidos).'),
      text('Cíclicos y defensivos', '**Cíclicos:** coches, lujo, viajes, industria, banca, tecnología. Suben más en expansión y caen más en recesión.\n\n**Defensivos:** alimentación, salud, eléctricas, agua. Caen menos y suben menos.'),
      text('La bolsa se adelanta', 'Suele caer **antes** de una recesión y subir **antes** de que termine. En marzo de 2009 y de 2020 tocó fondo con noticias todavía terribles.'),
      sim('Compara sectores', 'El explorador del Mercado permite filtrar por sector.', 'Compara cómo se han movido hoy los servicios públicos frente al consumo discrecional.'),
      key('Lo que te llevas', 'Esperar a que mejoren las noticias suele significar entrar tarde.', 'La economía alterna expansiones y recesiones; la bolsa se adelanta unos meses.', 'La bolsa no mira el presente: mira lo que espera dentro de 6–12 meses.'),
    ], [
      multi('¿Qué sectores son defensivos? Marca todos.', ['Eléctricas', 'Fabricantes de coches', 'Salud', 'Alimentación'], [0, 2, 3], 'Se consumen igual en crisis.'),
      tf('La bolsa suele tocar fondo cuando ya han mejorado los datos económicos.', false, 'Suele adelantarse: en 2009 y 2020 tocó fondo con noticias malas.'),
      order('Ordena las fases del ciclo económico.', ['Recuperación', 'Expansión', 'Desaceleración', 'Recesión'], 'Y vuelta a empezar.'),
      single('¿Qué es técnicamente una recesión?', ['Una caída de la bolsa del 10 %', 'Dos trimestres seguidos de caída del PIB', 'Una subida de tipos'], 1, 'Es la definición habitual.'),
    ], { source: '6.3' }),

    lesson('u6l4', 'Los datos que mueven el mercado', [
      text('El calendario económico', '• **IPC/IPCA:** inflación.\n• **PIB:** crecimiento.\n• **Empleo:** en EE. UU., las nóminas del primer viernes de mes.\n• **PMI:** encuesta mensual; más de 50 = expansión.\n• **Decisiones de tipos** del BCE y la Fed.\n• **Resultados** trimestrales de las empresas.'),
      text('Sorpresa frente a expectativa', 'Si se espera un 3 % de inflación y sale un 3,4 %, la bolsa puede caer aunque la inflación esté bajando. Y una empresa puede caer un 10 % con beneficios récord si se esperaba más.\n\nEl precio ya incorpora lo esperado.'),
      text('Temporada de resultados', 'Cuatro veces al año. Son días de movimientos bruscos y huecos de precio: justo cuando un stop puede ejecutarse muy por debajo de lo previsto.'),
      key('Lo que te llevas', 'Por eso operar con noticias es tan difícil.', 'El mercado reacciona a si el dato es mejor o peor de lo esperado, no a si es bueno o malo.', 'Una buena noticia que ya se esperaba no es noticia.'),
    ], [
      single('El mercado espera una inflación del 2,8 % y sale un 3,3 %. ¿Qué es más probable?', ['Que la bolsa caiga', 'Que suba', 'Nada'], 0, 'El dato es peor de lo esperado.'),
      fill('Un PMI por encima de ____ indica expansión de la actividad.', '50', ['0', '100', '10'], 'Por debajo de 50 indica contracción.'),
      tf('Una empresa puede caer en bolsa aunque presente beneficios récord.', true, 'Si el mercado esperaba aún más.'),
      single('¿Por qué los días de resultados son peligrosos para un stop loss?', ['Por los huecos de precio', 'Porque cierran las bolsas', 'Porque no hay volumen'], 0, 'El precio puede saltar por encima de tu stop.'),
    ], { source: '6.4' }),

    lesson('u6l5', 'La curva de tipos, la prima de riesgo y el VIX', [
      text('La curva de tipos', 'Lo que pagan los bonos a distintos plazos.\n\n• **Normal:** los largos pagan más.\n• **Invertida:** los cortos pagan más; el mercado espera problemas.\n\nCasi todas las recesiones de EE. UU. desde 1970 vinieron tras una inversión, con 6–24 meses de retraso. Pero en 2022–2024 estuvo invertida sin recesión.'),
      text('La prima de riesgo', 'La diferencia entre lo que paga el bono español a 10 años y el alemán. En 2012, en la crisis del euro, superó los **600 puntos básicos**.'),
      text('El índice del miedo', 'El **VIX** mide la volatilidad esperada del S&P 500 en 30 días. Menos de 15: calma. Más de 30: miedo. En marzo de 2020 superó 80. Lo tienes en el Mercado.'),
      key('Lo que te llevas', 'Son señales útiles para entender el mercado, no relojes.', 'Las señales macro dicen que puede llover, pero nunca a qué hora.', 'Ninguna señal macro es infalible.'),
    ], [
      single('¿Qué es una curva de tipos invertida?', ['Los bonos largos pagan más', 'Los cortos pagan más que los largos', 'Los tipos son negativos'], 1, 'Suele indicar que se espera una desaceleración.'),
      tf('Una curva invertida predice con exactitud la fecha de la recesión.', false, 'El retraso ha ido de 6 a 24 meses, y en 2022–2024 falló.'),
      single('Un VIX de 45 indica…', ['Calma', 'Mucho miedo', 'Que la bolsa está cerrada'], 1, 'Por encima de 30 se considera miedo.'),
      single('¿Qué mide la prima de riesgo española?', ['La diferencia entre el bono español y el alemán a 10 años', 'El precio del IBEX', 'La inflación'], 0, 'Mide la desconfianza en la deuda de un país.'),
    ], { source: '6.5' }),

    lesson('u6l6', 'Por qué predecir la macro no sirve', [
      text('Tres razones', '1. **Los economistas fallan mucho:** en 2023 muchos anunciaron una recesión en EE. UU. que no llegó.\n2. **La bolsa ya descuenta lo esperado:** hay que acertar mejor que el consenso.\n3. **Economía y bolsa van poco de la mano a corto plazo:** China creció muchísimo y su bolsa decepcionó al inversor extranjero.'),
      text('Para qué sirve la macro', '• Para **entender** por qué se mueve el mercado y no asustarse.\n• Para **elegir bien el reparto** (los bonos largos son peligrosos si los tipos pueden subir mucho).\n• Para **gestionar el riesgo:** no abrir posiciones grandes justo antes de un dato importante.'),
      key('Lo que te llevas', 'Vender todo porque "viene una recesión" exige acertar dos veces: cuándo salir y cuándo volver.', 'Aunque supieras el dato de mañana, no sabrías cómo reaccionará el mercado.', 'Entender la economía quita el miedo; intentar predecirla quita el dinero.'),
    ], [
      single('¿Por qué no basta con acertar el próximo dato económico?', ['Porque la bolsa ya descuenta lo esperado', 'Porque los datos son secretos', 'Porque la bolsa no se mueve'], 0, 'Hay que acertar mejor que el consenso.'),
      tf('Un país con mucho crecimiento siempre tiene una bolsa rentable.', false, 'China creció mucho y su bolsa decepcionó.'),
      single('Tu amigo quiere venderlo todo porque "viene una recesión". ¿Qué riesgo corre?', ['Ninguno', 'Tener que acertar dos veces: cuándo salir y cuándo volver', 'Pagar menos impuestos'], 1, 'La bolsa suele rebotar antes de que acaben las recesiones.'),
      single('¿Para qué SÍ sirve seguir la macro?', ['Para predecir la bolsa cada semana', 'Para entender el mercado y gestionar el riesgo', 'Para nada'], 1, 'Por ejemplo, evitar posiciones grandes antes de un dato clave.'),
    ], { source: '6.6' }),
  ],
})
