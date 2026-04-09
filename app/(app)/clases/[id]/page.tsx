'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CLASES } from '@/data/clases'

const CLASE_CONTENT: Record<string, {
  intro: string
  secciones: { titulo: string; contenido: string }[]
  conceptosClave: string[]
  quiz: { pregunta: string; opciones: string[]; correcta: number; explicacion: string }[]
}> = {
  c1: {
    intro: 'Cada día que pasa con tu dinero parado, estás perdiendo dinero. No es una metáfora: la inflación es un impuesto invisible que erosiona tu riqueza sin que nadie te lo avise.',
    secciones: [
      {
        titulo: '¿Qué es la inflación?',
        contenido: 'La inflación es el aumento generalizado y sostenido de los precios de bienes y servicios en una economía. Cuando la inflación es del 3% anual, todo lo que compras cuesta un 3% más que el año pasado.\n\nLa consecuencia directa: tu dinero vale menos. Con 100€ hoy puedes comprar más que con 100€ dentro de 5 años, aunque el billete sea el mismo.',
      },
      {
        titulo: 'El ejemplo del café',
        contenido: 'En 2010, un café costaba 1€. Con una inflación media del 3% anual, en 2025 ese mismo café cuesta aproximadamente 1,56€. Si guardaste 1€ en 2010 bajo el colchón, hoy solo alcanza para pagar el 64% de ese café.\n\nMultiplica esto por tu patrimonio completo y entenderás la urgencia.',
      },
      {
        titulo: '¿Cuánto pierde mi dinero?',
        contenido: 'Con una inflación del 3% anual:\n• En 5 años, 10.000€ equivalen a 8.626€ en poder adquisitivo\n• En 10 años, equivalen a 7.441€\n• En 20 años, equivalen a 5.537€\n\nEsto significa que si no haces nada con tu dinero, en 20 años habrás "perdido" el 45% de tu riqueza.',
      },
      {
        titulo: 'La solución: hacer que tu dinero trabaje',
        contenido: 'La única forma de combatir la inflación es invertir. Si tu inversión genera un 7% anual y la inflación es del 3%, tu rentabilidad real es del 4%.\n\nNo invertir no es "no arriesgar" — es aceptar una pérdida garantizada del 3% anual.',
      },
    ],
    conceptosClave: ['Inflación', 'Poder adquisitivo', 'Rentabilidad real', 'Interés real = Interés nominal - Inflación'],
    quiz: [
      { pregunta: '¿Qué le pasa a tu dinero si la inflación es del 3% y tu cuenta da un 1% de interés?', opciones: ['Ganas un 4%', 'Pierdes poder adquisitivo neto del 2%', 'Tu dinero se mantiene igual'], correcta: 1, explicacion: 'Rentabilidad real = 1% - 3% = -2%. Tu dinero pierde valor aunque el saldo suba en términos nominales.' },
      { pregunta: '¿Cuánto valdrán 10.000€ tras 20 años con una inflación del 3%?', opciones: ['Unos 5.500€ en poder adquisitivo', '16.000€', '10.000€ exactamente'], correcta: 0, explicacion: '10.000 / (1.03^20) = 5.537€. La inflación compuesta destruye más del 44% del valor real.' },
      { pregunta: 'La inflación beneficia a...', opciones: ['Los ahorradores que guardan efectivo', 'Los deudores que tienen créditos a tipo fijo', 'Los que invierten en bonos del Estado a largo plazo'], correcta: 1, explicacion: 'Los deudores pagan su deuda con dinero que vale menos. Si pediste 100.000€ al 2% fijo y la inflación es del 5%, tu deuda real baja.' },
      { pregunta: '¿Cuál es la tasa de inflación objetivo del BCE?', opciones: ['0%', '2%', '5%'], correcta: 1, explicacion: 'El BCE tiene como objetivo una inflación del 2% anual, considerada la más compatible con el crecimiento económico.' },
      { pregunta: 'Si la inflación es mayor que tu salario nominal, ¿qué ocurre?', opciones: ['Ganas más en términos reales', 'Tu poder adquisitivo baja aunque cobres más', 'Tu situación económica mejora'], correcta: 1, explicacion: 'Si suben los precios un 5% y tu salario sube un 3%, en realidad estás cobrando un 2% menos en términos reales.' },
    ],
  },
  c2: {
    intro: 'Muchas personas confunden ahorrar con invertir. Son conceptos radicalmente distintos con resultados muy diferentes en el largo plazo.',
    secciones: [
      { titulo: '¿Qué es ahorrar?', contenido: 'Ahorrar es guardar dinero sin arriesgar el capital. El objetivo es tener liquidez disponible. Las herramientas típicas son: cuentas de ahorro, depósitos a plazo fijo y fondos monetarios.\n\nEl problema: la rentabilidad raramente supera la inflación, lo que significa que en términos reales estás perdiendo dinero.' },
      { titulo: '¿Qué es invertir?', contenido: 'Invertir es poner capital a trabajar aceptando cierto riesgo a cambio de una rentabilidad superior. El objetivo es hacer crecer tu patrimonio en el tiempo.\n\nLas herramientas incluyen: acciones, ETFs, bonos, inmuebles, criptomonedas, fondos de inversión.' },
      { titulo: 'Los números no mienten', contenido: '10.000€ en 2004 en distintos vehículos:\n• Cuenta corriente (0%): 10.000€\n• Depósito (1%): 11.490€\n• Índice S&P 500 (≈10% anual): 67.275€\n• NVIDIA (+35% anual): millones\n\nLa diferencia es brutal y se amplifica con el tiempo.' },
      { titulo: 'La regla: primero el colchón, luego invertir', contenido: 'No es una guerra entre ahorrar e invertir — ambas son necesarias.\n\n1. Mantén un fondo de emergencia: 3-6 meses de gastos en una cuenta líquida.\n2. Invierte el resto de forma progresiva según tu tolerancia al riesgo.\n\nInvertir sin colchón de emergencia te obliga a vender en el peor momento.' },
    ],
    conceptosClave: ['Liquidez', 'Riesgo', 'Rentabilidad', 'Fondo de emergencia', 'Horizonte temporal'],
    quiz: [
      { pregunta: '¿Cuál es la principal diferencia entre ahorrar e invertir?', opciones: ['El ahorro siempre da más rentabilidad', 'La inversión acepta riesgo a cambio de mayor rentabilidad potencial', 'Solo los ricos pueden invertir'], correcta: 1, explicacion: 'Ahorrar protege el capital con baja rentabilidad. Invertir asume riesgo para obtener mayor crecimiento.' },
      { pregunta: '¿Cuánto dinero deberías tener en un fondo de emergencia?', opciones: ['Lo máximo posible, todo tu dinero', '3-6 meses de gastos mensuales', 'Solo 1.000€'], correcta: 1, explicacion: 'El fondo de emergencia te da estabilidad para no tener que vender inversiones en momentos de necesidad.' },
      { pregunta: 'Un depósito bancario al 2% con inflación del 4% genera...', opciones: ['Una ganancia real del 2%', 'Una pérdida real del 2%', 'Ni ganancias ni pérdidas'], correcta: 1, explicacion: 'Rentabilidad real = 2% - 4% = -2%. Nominalmente tienes más dinero, pero puedes comprar menos.' },
      { pregunta: '¿Cuál de estos NO es un instrumento de inversión?', opciones: ['Acciones de empresas', 'Depósito a plazo fijo al 0.5%', 'ETF del S&P 500'], correcta: 1, explicacion: 'Un depósito al 0.5% es ahorro, no inversión. No supera la inflación y el riesgo es mínimo.' },
      { pregunta: '¿Por qué es importante el horizonte temporal para invertir?', opciones: ['A largo plazo se reducen los impuestos', 'A largo plazo el riesgo disminuye y el interés compuesto actúa', 'A corto plazo se gana más'], correcta: 1, explicacion: 'Con 10+ años de horizonte, los mercados históricamente siempre han sido positivos, aunque con volatilidad.' },
    ],
  },
  c4: {
    intro: 'El 90% de los traders pierde dinero. El 10% que gana tiene una cosa en común: gestionan el riesgo antes de pensar en las ganancias.',
    secciones: [
      { titulo: 'La regla del 1%', contenido: 'La regla de oro: nunca arriesgues más del 1% de tu capital total en una sola operación.\n\nSi tienes 10.000€ de capital, el máximo que puedes perder en una operación es 100€.\n\nEsto parece poco, pero es lo que permite sobrevivir rachas de 20 operaciones negativas consecutivas sin arruinarse.' },
      { titulo: 'Stop Loss: tu mejor amigo', contenido: 'El stop loss es una orden que cierra automáticamente tu posición si el precio cae a un nivel predefinido.\n\nSin stop loss:\n• Una operación puede liquidar toda tu cuenta\n• Las pérdidas pequeñas se convierten en grandes\n\nCon stop loss:\n• El máximo de pérdida está controlado antes de entrar\n• Puedes dormir tranquilo sin monitorizar 24h' },
      { titulo: 'El ratio riesgo/beneficio (R/B)', contenido: 'Nunca entres en una operación si el beneficio potencial no es al menos el doble que el riesgo.\n\nEjemplo:\n• Stop loss: -100€ (si el trade sale mal)\n• Objetivo: +200€ (si el trade sale bien)\n• Ratio R/B: 1:2 ✓\n\nCon un ratio 1:2, solo necesitas acertar el 34% de las veces para ser rentable a largo plazo.' },
      { titulo: 'Tamaño de posición correcto', contenido: 'Fórmula para calcular cuántas acciones comprar:\n\nUnidades = (Capital × % de riesgo) / (Precio entrada - Precio stop)\n\nEjemplo con 10.000€, riesgo 1%, entrada a 100€, stop a 95€:\n• Riesgo monetario = 10.000 × 0.01 = 100€\n• Distancia al stop = 100 - 95 = 5€\n• Unidades = 100 / 5 = 20 acciones\n• Total invertido = 20 × 100 = 2.000€ (20% del capital)' },
    ],
    conceptosClave: ['Regla del 1%', 'Stop Loss', 'Take Profit', 'Ratio Riesgo/Beneficio', 'Tamaño de posición'],
    quiz: [
      { pregunta: 'Con 5.000€ de capital y regla del 1%, ¿cuánto puedes perder máximo en una operación?', opciones: ['500€', '50€', '250€'], correcta: 1, explicacion: '5.000 × 0.01 = 50€. El 1% limita las pérdidas a una cantidad que puedes recuperar fácilmente.' },
      { pregunta: 'Tienes stop a 5€ de tu entrada y quieres arriesgar 100€. ¿Cuántas acciones compras?', opciones: ['50 acciones', '20 acciones', '500 acciones'], correcta: 1, explicacion: '100€ / 5€ = 20 acciones. Fórmula: Riesgo € / Distancia al stop = Unidades.' },
      { pregunta: '¿Qué ratio R/B mínimo deberías exigir en cada operación?', opciones: ['1:1 (igual riesgo que beneficio)', '1:2 (beneficio doble que riesgo)', '1:0.5 (riesgo mayor que beneficio)'], correcta: 1, explicacion: 'Con ratio 1:2 y 40% de aciertos ya eres rentable. Con 1:1 necesitas acertar el 50%+.' },
      { pregunta: 'Un trader sin stop loss y con 10.000€ compra 100 acciones a 100€. La empresa quiebra. ¿Qué pasa?', opciones: ['Pierde solo el 1%', 'Pierde 10.000€ (toda la inversión)', 'El broker le protege automáticamente'], correcta: 1, explicacion: 'Sin stop loss, una empresa puede bajar al 0 y llevarse toda tu inversión.' },
      { pregunta: '¿Cuántas operaciones negativas seguidas puede soportar una cuenta con regla del 1%?', opciones: ['10 operaciones', 'Más de 50 operaciones', '3 operaciones'], correcta: 1, explicacion: 'Con pérdidas del 1% cada vez, tras 50 operaciones malas la cuenta aún conserva ~60% del capital.' },
    ],
  },
  c5: {
    intro: 'Los bancos centrales mueven los mercados. Cuando el BCE o la Fed actúan, millones de inversores reaccionan. Entender esta relación te da una ventaja enorme.',
    secciones: [
      { titulo: '¿Qué son los tipos de interés?', contenido: 'Los tipos de interés son el precio del dinero. Cuando el banco central sube tipos, pedir prestado dinero cuesta más.\n\nEn España y Europa, el banco central es el BCE (Banco Central Europeo). En EE.UU. es la Reserva Federal (Fed).\n\nSu objetivo: mantener la inflación cerca del 2% anual.' },
      { titulo: 'Tipos altos → bolsas bajan (generalmente)', contenido: '¿Por qué?\n\n1. Las empresas se financian más caro → menos beneficios\n2. Los bonos del Estado dan rentabilidades altas → el dinero sale de la bolsa hacia bonos "seguros"\n3. El crédito al consumo sube → la gente gasta menos → las empresas venden menos\n4. Las hipotecas son más caras → el sector inmobiliario sufre\n\nEjemplo: La Fed subió tipos 11 veces de 2022 a 2023. El S&P 500 cayó un -19% en 2022.' },
      { titulo: 'Tipos bajos → bolsas suben (generalmente)', contenido: 'La lógica inversa:\n\n1. Las empresas se financian barato → más beneficios\n2. Los bonos dan poco → el dinero busca más rentabilidad en bolsa\n3. El crédito barato → más consumo → más ventas\n\nEl periodo 2009-2022, con tipos cercanos a 0%, fue el mayor bull market de la historia moderna.' },
      { titulo: 'Cómo usarlo como inversor', contenido: '• Sigue el calendario de reuniones del BCE y la Fed\n• Cuando suben tipos: favorece sectores defensivos (utilities, salud) y bonos cortos\n• Cuando bajan tipos: favorece crecimiento (tecnología), small caps e inmobiliario\n• El mercado anticipa los cambios: suele moverse antes de la decisión oficial\n\nFrase célebre: "No luches contra la Fed" (Don\'t fight the Fed).' },
    ],
    conceptosClave: ['BCE', 'Fed', 'Tipos de interés', 'Política monetaria', 'Curva de tipos', 'Bonos vs bolsa'],
    quiz: [
      { pregunta: '¿Qué suele pasar con las acciones cuando el banco central sube los tipos?', opciones: ['Suben siempre', 'Tienden a bajar', 'No les afecta'], correcta: 1, explicacion: 'Tipos más altos = mayor coste de financiación para empresas + competencia de bonos. Generalmente negativo para bolsa.' },
      { pregunta: '¿Cuál es el tipo de interés objetivo del BCE?', opciones: ['0%', '2% de inflación (no de tipos)', '5%'], correcta: 1, explicacion: 'El BCE tiene como mandato principal mantener la inflación cerca del 2%, ajustando tipos para lograrlo.' },
      { pregunta: 'En un entorno de tipos bajando, ¿qué sector suele beneficiarse más?', opciones: ['Bancos (se benefician de tipos altos)', 'Tecnología y growth (necesitan financiación barata)', 'Utilities (ya estables)'], correcta: 1, explicacion: 'Las empresas de crecimiento se valoran por flujos futuros descontados. Tipos bajos = mayor valor presente de esos flujos.' },
      { pregunta: '¿Qué significa "curva de tipos invertida"?', opciones: ['Los bonos a corto plazo pagan más que los de largo plazo — señal de recesión', 'Los tipos bajan de forma curva', 'El banco central sube tipos muy rápido'], correcta: 0, explicacion: 'La inversión de la curva (2y > 10y) ha precedido todas las recesiones de los últimos 50 años en EE.UU.' },
      { pregunta: '"No luches contra la Fed" significa...', opciones: ['No compres acciones americanas', 'Adapta tu estrategia a la dirección de la política monetaria', 'Invierte en oro siempre'], correcta: 1, explicacion: 'La política monetaria tiene un efecto enorme en los mercados. Ignorarla es uno de los mayores errores.' },
    ],
  },
  c6: {
    intro: '"No pongas todos los huevos en la misma cesta." Este proverbio tiene más de 300 años y sigue siendo la estrategia de inversión más poderosa que existe.',
    secciones: [
      { titulo: '¿Por qué diversificar?', contenido: 'Imagina que tienes todo tu dinero en una sola empresa. Si esa empresa quiebra (como Enron, Lehman Brothers o Wirecard), pierdes todo.\n\nLa diversificación elimina el riesgo específico de cada activo. Con 20+ activos no correlacionados, el riesgo de ruina cae a casi cero.' },
      { titulo: 'Correlación: la clave de la diversificación', contenido: 'Dos activos están correlacionados si se mueven en la misma dirección.\n\n• Correlación +1: se mueven igual (no diversifican)\n• Correlación 0: independientes (diversifican bien)\n• Correlación -1: se mueven opuesto (cobertura perfecta)\n\nEjemplo: AAPL y MSFT tienen correlación alta. Tener ambas no diversifica mucho. Añadir ORO o bonos sí diversifica.' },
      { titulo: 'Cómo diversificar correctamente', contenido: '1. Por activos: acciones, bonos, oro, cripto, inmuebles\n2. Por geografía: EE.UU., Europa, Asia, emergentes\n3. Por sectores: tecnología, salud, energía, consumo, financiero\n4. Por tamaño: large caps, mid caps, small caps\n5. Por divisa: USD, EUR, JPY\n\nRegla práctica: Si todos tus activos suben o bajan juntos, no estás diversificado.' },
      { titulo: 'El límite de la diversificación', contenido: 'La diversificación elimina el riesgo específico, pero no el riesgo de mercado (riesgo sistémico).\n\nEn una crisis como 2008 o el COVID-19, casi todo cae a la vez. Para protegerse del riesgo sistémico se necesitan activos de cobertura: oro, bonos del gobierno, volatilidad (VIX).\n\nDemasiada diversificación también diluye las ganancias. Un portafolio de 500 activos se comporta como el índice.' },
    ],
    conceptosClave: ['Correlación', 'Riesgo específico', 'Riesgo sistémico', 'Asset allocation', 'Rebalanceo'],
    quiz: [
      { pregunta: '¿Qué tipo de riesgo elimina la diversificación?', opciones: ['El riesgo de mercado global', 'El riesgo específico de cada empresa/activo', 'Los impuestos sobre ganancias'], correcta: 1, explicacion: 'La diversificación elimina el riesgo no sistemático (quiebra de empresa, escándalo...). No protege de crisis globales.' },
      { pregunta: 'Dos activos con correlación de +0.95 en tu cartera...', opciones: ['Diversifican perfectamente', 'Prácticamente no diversifican', 'Son ideales para cubrir riesgos'], correcta: 1, explicacion: 'Una correlación cercana a 1 significa que se mueven casi igual. No aportan diversificación real.' },
      { pregunta: '¿Cuántos activos son suficientes para una diversificación adecuada?', opciones: ['1-5 activos concentrados', '15-30 activos no correlacionados', 'Más de 500 activos'], correcta: 1, explicacion: 'Con 15-30 activos bien diversificados se elimina la mayor parte del riesgo específico. Más activos añaden complejidad sin beneficio.' },
      { pregunta: 'Durante la crisis de 2008, la correlación entre activos...', opciones: ['Bajó — todo se movió independientemente', 'Subió — casi todo cayó junto', 'Se mantuvo igual'], correcta: 1, explicacion: 'En las crisis, las correlaciones tienden a converger a 1. Todos los activos caen juntos.' },
      { pregunta: '¿Qué activo históricamente tiene baja correlación con la bolsa?', opciones: ['Otra acción tecnológica', 'El oro', 'Un ETF del S&P 500'], correcta: 1, explicacion: 'El oro tiende a subir cuando la bolsa cae o hay incertidumbre. Es un activo refugio con correlación baja.' },
    ],
  },
  c3: {
    intro: '"El interés compuesto es la octava maravilla del mundo. El que lo entiende, lo gana; el que no, lo paga." — Albert Einstein',
    secciones: [
      { titulo: '¿Qué es el interés compuesto?', contenido: 'El interés compuesto consiste en reinvertir los intereses generados para que también generen intereses. Es el efecto "bola de nieve": cuanto más rueda, más grande se hace.\n\nInterés simple: 1.000€ al 10% = 100€/año = 2.000€ tras 10 años\nInterés compuesto: 1.000€ al 10% = 2.594€ tras 10 años\n\nLa diferencia: 594€ extra solo por reinvertir los intereses.' },
      { titulo: 'La regla del 72', contenido: 'Una forma rápida de calcular cuándo se duplica una inversión:\n\nAños para duplicar = 72 / rentabilidad anual\n\nEjemplos:\n• Al 6% anual: 72/6 = 12 años para doblar\n• Al 9% anual: 72/9 = 8 años para doblar\n• Al 12% anual: 72/12 = 6 años para doblar\n\nEl tiempo es el ingrediente secreto.' },
      { titulo: 'El efecto del tiempo', contenido: 'Ana invierte 10.000€ a los 25 años al 8% anual y no vuelve a tocarlos.\nCarlos invierte 10.000€ a los 45 años al 8% anual.\n\nA los 65 años:\n• Ana tiene: 217.245€\n• Carlos tiene: 46.610€\n\nLa diferencia de 20 años vale 170.000€. El tiempo es el activo más valioso.' },
      { titulo: '¿Cómo aprovecharlo?', contenido: '1. Empieza lo antes posible — el tiempo es irreemplazable\n2. Reinvierte siempre los dividendos e intereses\n3. Aporta regularmente (DCA - Dollar Cost Averaging)\n4. No toques el capital — interrumpir el compounding es devastador\n5. Busca rentabilidades razonables a largo plazo (7-10% anual en bolsa histórica)' },
    ],
    conceptosClave: ['Interés compuesto', 'Regla del 72', 'Reinversión', 'Horizonte temporal', 'DCA'],
    quiz: [
      { pregunta: 'Usando la regla del 72, ¿cuántos años tarda en duplicarse una inversión al 9% anual?', opciones: ['6 años', '8 años', '18 años'], correcta: 1, explicacion: '72 / 9 = 8 años. Simple y efectivo para estimar el tiempo de duplicación.' },
      { pregunta: '¿Cuál es el factor más importante para el interés compuesto?', opciones: ['La cantidad inicial invertida', 'El tiempo disponible', 'La frecuencia de reinversión'], correcta: 1, explicacion: 'El tiempo es el multiplicador definitivo del interés compuesto. Un año más puede significar miles de euros.' },
      { pregunta: '1.000€ al 7% anual compuesto durante 30 años se convierten en...', opciones: ['3.100€', '7.612€', '2.100€'], correcta: 1, explicacion: '1000 × (1.07^30) = 7.612€. El compuesto multiplica casi 8 veces el capital en 30 años.' },
      { pregunta: '¿Qué es el DCA (Dollar Cost Averaging)?', opciones: ['Comprar todo de una vez al precio más bajo', 'Invertir cantidades fijas periódicas independientemente del precio', 'Diversificar entre dólares y euros'], correcta: 1, explicacion: 'El DCA elimina el riesgo de invertir todo en el peor momento, promediando el precio de compra.' },
      { pregunta: '¿Por qué interrumpir una inversión compuesta es tan costoso?', opciones: ['Porque hay penalizaciones fiscales', 'Porque cada año perdido no se recupera y la bola de nieve se reinicia', 'Porque los mercados bajan al retirar dinero'], correcta: 1, explicacion: 'Retirar el capital interrumpe el ciclo de composición. Los años finales son los que más valor generan.' },
    ],
  },
}

// Default content for classes without full content
function getDefaultContent(clase: { titulo: string; descripcion: string; xp: number }) {
  return {
    intro: clase.descripcion,
    secciones: [
      { titulo: 'Conceptos fundamentales', contenido: `Esta clase cubre los aspectos esenciales de "${clase.titulo}". Los conceptos que aprenderás aquí son la base para operaciones más avanzadas en el simulador de E-Trading.` },
      { titulo: 'Aplicación práctica', contenido: 'Los conocimientos teóricos deben trasladarse a la práctica. En el simulador de E-Trading puedes aplicar lo aprendido sin riesgo real, construyendo confianza y experiencia.' },
      { titulo: 'Errores comunes', contenido: 'Conocer los errores más frecuentes te ahorra tiempo y dinero. Cada concepto mal aplicado puede tener consecuencias en tu portafolio. Aprende de los errores de otros, no de los tuyos.' },
    ],
    conceptosClave: ['Análisis', 'Estrategia', 'Gestión del riesgo', 'Práctica'],
    quiz: [
      { pregunta: '¿Cuál es el principio más importante al invertir?', opciones: ['Buscar el activo que más suba', 'Gestionar el riesgo antes que la rentabilidad', 'Seguir a los inversores famosos'], correcta: 1, explicacion: 'Sin gestión del riesgo, cualquier racha positiva puede borrarse en un mal día.' },
      { pregunta: '¿Qué debe tener siempre un inversor antes de operar?', opciones: ['Mucho capital disponible', 'Un plan con reglas claras de entrada y salida', 'Información privilegiada'], correcta: 1, explicacion: 'Operar sin plan es apostar. Un buen plan incluye cuándo comprar, cuándo vender y cuánto arriesgar.' },
      { pregunta: 'La diversificación reduce...', opciones: ['La rentabilidad potencial siempre', 'El riesgo específico de cada activo', 'El tiempo de análisis necesario'], correcta: 1, explicacion: 'Diversificar reduce el riesgo no sistemático. Si una empresa quiebra, no pierdes todo.' },
      { pregunta: '¿Cuándo es mejor revisar tu portafolio?', opciones: ['Cada 5 minutos para no perder ningún movimiento', 'Periódicamente según tu estrategia (diario, semanal, mensual)', 'Solo cuando hay grandes noticias'], correcta: 1, explicacion: 'La frecuencia depende de tu estrategia. El exceso de monitoreo lleva a decisiones emocionales.' },
      { pregunta: '¿Qué es el horizonte temporal de una inversión?', opciones: ['El momento ideal para vender', 'El tiempo que planeas mantener la inversión', 'El plazo del broker para ejecutar órdenes'], correcta: 1, explicacion: 'El horizonte temporal determina qué activos son apropiados. A largo plazo, puedes tolerar más volatilidad.' },
    ],
  }
}

type Step = 'lectura' | 'quiz' | 'done'
type Tab = 'teoria' | 'practica' | 'quiz'

const PRACTICA_EJERCICIOS: Record<string, { titulo: string; descripcion: string }[]> = {
  c1: [
    { titulo: 'Calcula tu pérdida por inflación', descripcion: 'Si tienes 10.000€ en una cuenta al 0% y la inflación es del 3%, calcula cuánto poder adquisitivo pierdes en 5 años. Fórmula: Valor real = Capital / (1 + inflación)^años' },
    { titulo: 'Busca la inflación actual en España', descripcion: 'Visita el INE (ine.es) y busca el IPC actual. Compara con el interés de una cuenta de ahorro estándar y calcula tu rentabilidad real.' },
  ],
  c2: [
    { titulo: 'Calcula tu fondo de emergencia ideal', descripcion: 'Suma tus gastos mensuales fijos (alquiler, comida, transporte, servicios). Multiplica por 3 y por 6. Ese es el rango de tu fondo de emergencia.' },
    { titulo: 'Simula €10.000 en distintos vehículos', descripcion: 'Compara qué pasa con €10.000 en: (1) cuenta corriente 0%, (2) depósito 2%, (3) ETF S&P 500 histórico 10%. Usa la fórmula: Capital × (1+r)^n durante 20 años.' },
  ],
  c3: [
    { titulo: 'Aplica la regla del 72', descripcion: 'Calcula cuántos años tardarás en duplicar tu dinero si inviertes al 6%, 8% y 12% anual. Fórmula: 72 / rentabilidad = años para doblar.' },
    { titulo: 'Compara dos inversores', descripcion: 'Ana invierte €5.000 a los 25 años al 8%. Carlos invierte €5.000 a los 45 años al 8%. Calcula cuánto tienen cada uno a los 65 años. Fórmula: C × (1.08)^años.' },
  ],
  c4: [
    { titulo: 'Calcula el tamaño de posición correcto', descripcion: 'Tienes €10.000. Regla del 1%. Compras AAPL a €150. Stop loss en €145. ¿Cuántas acciones puedes comprar? Fórmula: (Capital × 1%) / (Precio entrada - Stop) = unidades.' },
    { titulo: 'Diseña un trade con ratio 1:2', descripcion: 'Escoge un activo del simulador. Define entrada, stop loss y take profit de forma que el ratio beneficio/riesgo sea al menos 1:2.' },
  ],
}

export default function ClasePage() {
  const params = useParams()
  const router = useRouter()
  const claseId = params.id as string
  const clase = CLASES.find(c => c.id === claseId)

  const [step, setStep] = useState<Step>('lectura')
  const [activeTab, setActiveTab] = useState<Tab>('teoria')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [showExpl, setShowExpl] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [xpToast, setXpToast] = useState<number | null>(null)

  useEffect(() => {
    if (!clase) return
    fetch('/api/progress/clase')
      .then(r => r.json())
      .then(d => {
        if (d.completedIds?.includes(clase.id)) setAlreadyCompleted(true)
      })
      .catch(() => {})
  }, [clase])

  async function markCompleted(claseId: string, xp: number) {
    try {
      const res = await fetch('/api/progress/clase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claseId }),
      })
      const data = await res.json()
      if (data.success && !data.alreadyCompleted) {
        setAlreadyCompleted(true)
        setXpToast(xp)
        setTimeout(() => setXpToast(null), 3000)
      }
    } catch {
      // non-blocking
    }
  }

  if (!clase) {
    return (
      <div style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700 }}>Clase no encontrada</div>
        <Link href="/clases" style={{ color: 'var(--green)', textDecoration: 'none', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Volver a Clases</Link>
      </div>
    )
  }

  const content = CLASE_CONTENT[clase.id] ?? getDefaultContent(clase)
  const { quiz } = content
  const q = quiz[currentQ]
  const isCorrect = selected === q?.correcta
  const finalScore = answers.filter((a, i) => a === quiz[i]?.correcta).length

  function handleAnswer(idx: number) {
    if (showExpl) return
    setSelected(idx)
    setShowExpl(true)
  }

  function handleNext() {
    const newAnswers = [...answers, selected ?? -1]
    setAnswers(newAnswers)
    if (currentQ < quiz.length - 1) {
      setCurrentQ(q => q + 1); setSelected(null); setShowExpl(false)
    } else {
      const correct = newAnswers.filter((a, i) => a === quiz[i]?.correcta).length
      if (correct >= 3) {
        setCelebrating(true)
        setTimeout(() => setCelebrating(false), 3000)
        markCompleted(clase!.id, clase!.xp)
      }
      setStep('done')
    }
  }

  const PLAN_BADGE: Record<string, string> = { free: '🟢 Free', starter: '🔵 Starter', pro: '🟣 Pro', elite: '🟡 Elite' }

  // Extract YouTube video ID from URL
  function getYoutubeId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const ejercicios = PRACTICA_EJERCICIOS[clase.id] ?? [
    { titulo: 'Aplica en el simulador', descripcion: 'Abre el mercado en E-Trading y busca un activo relacionado con el tema de esta clase. Observa su gráfico y anota 3 observaciones basadas en lo que has aprendido.' },
    { titulo: 'Reflexión guiada', descripcion: '¿Cómo cambiaría tu comportamiento financiero real si aplicaras este concepto? Escribe al menos 3 acciones concretas que podrías tomar hoy.' },
  ]

  if (step === 'lectura') {
    const TABS: { key: Tab; label: string }[] = [
      { key: 'teoria', label: 'Teoría' },
      { key: 'practica', label: 'Práctica' },
      { key: 'quiz', label: 'Quiz' },
    ]

    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 24px', overflowY: 'auto', position: 'relative' }}>
        {/* XP toast */}
        {xpToast !== null && (
          <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 9999,
            background: 'var(--green)', color: 'var(--bg)',
            fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 800,
            padding: '12px 24px', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,212,122,.4)',
            animation: 'fadeInUp .4s ease',
          }}>
            +{xpToast} XP ✨
          </div>
        )}
        <Link href="/clases" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', gap: 4, marginBottom: 20 }}>← Volver a Clases</Link>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: 'var(--gfaint)', color: 'var(--green)', border: '.5px solid rgba(0,212,122,.2)' }}>{PLAN_BADGE[clase.plan]}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: 'var(--muted3)', color: 'var(--muted)', border: '.5px solid var(--border2)' }}>{clase.categoria.replace('-', ' ')}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: 'var(--muted3)', color: 'var(--muted)', border: '.5px solid var(--border2)' }}>{clase.duracion} min</span>
            {alreadyCompleted && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(0,212,122,.1)', color: 'var(--green)', border: '.5px solid rgba(0,212,122,.3)' }}>✅ Completada</span>}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>{clase.titulo}</div>
          <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>{content.intro}</div>
        </div>

        {/* YouTube embed if available */}
        {clase.videoUrl && (() => {
          const vid = getYoutubeId(clase.videoUrl!)
          return vid ? (
            <div style={{ marginBottom: 28, borderRadius: 14, overflow: 'hidden', border: '.5px solid var(--border2)', aspectRatio: '16/9', position: 'relative' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1`}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={clase.titulo}
              />
            </div>
          ) : null
        })()}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '.5px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '10px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === t.key ? '2px solid var(--green)' : '2px solid transparent',
              color: activeTab === t.key ? 'var(--white)' : 'var(--muted)',
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500,
              cursor: 'pointer', transition: 'all .15s', marginBottom: -1,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Teoría */}
        {activeTab === 'teoria' && (
          <>
            {content.secciones.map((sec, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,212,122,.1)', border: '.5px solid rgba(0,212,122,.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 12, fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>{i + 1}</span>
                  {sec.titulo}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, whiteSpace: 'pre-line', paddingLeft: 38 }}>{sec.contenido}</div>
              </div>
            ))}
            {/* Key concepts */}
            <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Conceptos clave</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {content.conceptosClave.map(c => (
                  <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: 'var(--gfaint)', color: 'var(--green)', border: '.5px solid rgba(0,212,122,.2)' }}>{c}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab: Práctica */}
        {activeTab === 'practica' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Los conocimientos teóricos solo tienen valor cuando se aplican. Completa estos ejercicios en el simulador de E-Trading.
            </div>
            {ejercicios.map((ej, i) => (
              <div key={i} style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,212,122,.1)', border: '.5px solid rgba(0,212,122,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--green)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{ej.titulo}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{ej.descripcion}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ background: 'rgba(66,165,245,.06)', border: '.5px solid rgba(66,165,245,.2)', borderRadius: 12, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--blue)', lineHeight: 1.6 }}>
                Cuando hayas completado los ejercicios, ve a la pestaña <strong>Quiz</strong> para demostrar lo aprendido y ganar +{clase.xp} XP.
              </div>
            </div>
          </div>
        )}

        {/* Tab: Quiz */}
        {activeTab === 'quiz' && (
          <div>
            <div style={{ background: alreadyCompleted ? 'rgba(0,212,122,.06)' : 'var(--bg1)', border: `.5px solid ${alreadyCompleted ? 'rgba(0,212,122,.4)' : 'rgba(0,212,122,.2)'}`, borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                    {alreadyCompleted ? '✅ Clase completada' : 'Quiz final'}
                  </div>
                  {alreadyCompleted
                    ? <div style={{ fontSize: 13, color: 'var(--green)' }}>Has ganado +{clase.xp} XP. Bien hecho.</div>
                    : (
                      <ul style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 18, lineHeight: 1.8, margin: 0 }}>
                        <li>5 preguntas de opción múltiple</li>
                        <li>Necesitas 3/5 correctas para pasar</li>
                        <li>Puedes repetir si no superas el umbral</li>
                        <li>Ganas <strong style={{ color: 'var(--green)' }}>+{clase.xp} XP</strong> al completar</li>
                      </ul>
                    )
                  }
                </div>
                {!alreadyCompleted && (
                  <button onClick={() => setStep('quiz')} style={{ padding: '12px 24px', background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    Empezar quiz →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    )
  }

  if (step === 'quiz') {
    const progress = (currentQ / quiz.length) * 100
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pregunta {currentQ + 1} de {quiz.length}</span>
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>+{clase.xp} XP al aprobar</span>
        </div>
        <div style={{ height: 4, background: 'var(--border2)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--green)', borderRadius: 2, transition: 'width .4s' }} />
        </div>

        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 800, marginBottom: 24, lineHeight: 1.3 }}>{q.pregunta}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {q.opciones.map((op, idx) => {
              let bg = 'var(--bg2)', border = 'var(--border2)', color = 'var(--white)'
              if (showExpl) {
                if (idx === q.correcta) { bg = 'rgba(0,212,122,.15)'; border = 'var(--green)'; color = 'var(--green)' }
                else if (idx === selected && idx !== q.correcta) { bg = 'rgba(239,83,80,.12)'; border = 'var(--red)'; color = 'var(--red)' }
                else { color = 'var(--muted)' }
              } else if (selected === idx) { bg = 'var(--gfaint)'; border = 'var(--green)' }
              return (
                <div key={idx} onClick={() => handleAnswer(idx)} style={{ background: bg, border: `.5px solid ${border}`, borderRadius: 12, padding: '13px 18px', cursor: showExpl ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'center', color }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{String.fromCharCode(65 + idx)}</div>
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{op}</span>
                  {showExpl && idx === q.correcta && <span style={{ marginLeft: 'auto' }}>✅</span>}
                  {showExpl && idx === selected && idx !== q.correcta && <span style={{ marginLeft: 'auto' }}>❌</span>}
                </div>
              )
            })}
          </div>
          {showExpl && (
            <>
              <div style={{ background: isCorrect ? 'rgba(0,212,122,.08)' : 'rgba(239,83,80,.08)', border: `.5px solid ${isCorrect ? 'rgba(0,212,122,.3)' : 'rgba(239,83,80,.3)'}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginBottom: 5 }}>{isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{q.explicacion}</div>
              </div>
              <button onClick={handleNext} style={{ width: '100%', padding: 13, background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {currentQ < quiz.length - 1 ? 'Siguiente →' : 'Ver resultado →'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const passed = finalScore >= 3
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 24px', textAlign: 'center' }}>
      {celebrating && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 800, color: 'var(--green)', zIndex: 999, pointerEvents: 'none', animation: 'xpFly .8s ease forwards' }}>
          +{clase.xp} XP ✨
        </div>
      )}
      <div style={{ fontSize: 60, marginBottom: 14 }}>{passed ? '🎓' : '💪'}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{passed ? '¡Clase superada!' : 'Casi lo tienes'}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{finalScore}/{quiz.length} respuestas correctas</div>

      <div style={{ background: 'var(--bg1)', border: `.5px solid ${passed ? 'rgba(0,212,122,.3)' : 'var(--border2)'}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 800, color: passed ? 'var(--green)' : 'var(--amber)', marginBottom: 6 }}>{finalScore}/{quiz.length}</div>
        {passed && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Has ganado <strong style={{ color: 'var(--green)' }}>+{clase.xp} XP</strong></div>}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {!passed && <button onClick={() => { setStep('quiz'); setCurrentQ(0); setAnswers([]); setSelected(null); setShowExpl(false) }} style={{ flex: 1, padding: 12, background: 'var(--bg2)', border: '.5px solid var(--border2)', color: 'var(--white)', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Repetir quiz</button>}
        <button onClick={() => router.push('/clases')} style={{ flex: 1, padding: 12, background: 'var(--green)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {passed ? 'Siguiente clase →' : 'Volver a clases'}
        </button>
      </div>
    </div>
  )
}
