// Contenido completo de las clases de E-Trading.
// Fuente: etrading-clases-retos.md (documento del fundador).
// Estado: Módulo 1 (c1–c10) COMPLETO. Módulos 2-5 se irán añadiendo en siguientes iteraciones.
// Las clases que aún no tienen contenido detallado caen al viewer de metadata en /clases/[id].

import type { Plan } from './clases'

export interface QuizPregunta {
  pregunta: string
  opciones: string[]
  correcta: number // índice 0-based
  explicacion: string
}

export interface ClaseSeccion {
  titulo: string
  contenido: string
  videoUrl?: string
}

export interface ClaseContenido {
  id: string // c1..c50
  titulo: string
  duracion: string // "10 min"
  xp: number
  plan: Plan
  modulo: 1 | 2 | 3 | 4 | 5
  introduccion: string
  secciones: ClaseSeccion[]
  ejercicioSimulador?: string
  quiz: QuizPregunta[]
}

// ────────────────────────────────────────────────────────────────────────────
// MÓDULO 1 — FUNDAMENTOS (Free)
// ────────────────────────────────────────────────────────────────────────────

export const CLASES_CONTENIDO: ClaseContenido[] = [
  {
    id: 'c1',
    titulo: '¿Qué es invertir y por qué todos deberían hacerlo?',
    duracion: '10 min',
    xp: 50,
    plan: 'free',
    modulo: 1,
    introduccion:
      'La mayoría de la gente trabaja para ganar dinero. Los inversores hacen que su dinero trabaje para ellos. Esta diferencia, a lo largo de 20-30 años, crea una brecha enorme en el patrimonio de dos personas con el mismo salario.',
    secciones: [
      {
        titulo: 'Inflación: tu dinero pierde valor cada año',
        contenido:
          'Aunque no toques tu dinero, cada año vale menos. Con una inflación del 3%, €10.000 hoy equivalen a €7.440 en 10 años. Guardar dinero debajo del colchón o en una cuenta corriente al 0% es, literalmente, perder dinero. La inflación media en España los últimos 20 años ha sido 2-3% anual.',
      },
      {
        titulo: 'Inversión vs ahorro',
        contenido:
          'El ahorro conserva, la inversión hace crecer. Una cuenta de ahorro al 0,5% no cubre la inflación. La bolsa americana (S&P 500) ha dado un 10% anual de media en los últimos 100 años. Esa diferencia, compuesta, es la diferencia entre acabar como Carlos o como María del ejemplo que verás en el quiz.',
      },
      {
        titulo: 'El tiempo como aliado',
        contenido:
          'Quien empieza a invertir €200/mes a los 25 años acaba con más dinero a los 65 que quien empieza con €400/mes a los 40. La diferencia no es el dinero — es el tiempo. El interés compuesto necesita tiempo para hacer magia.',
      },
      {
        titulo: 'Riesgo: invertir tiene riesgo, NO invertir también',
        contenido:
          'Invertir tiene riesgo (la bolsa puede bajar). No invertir también tiene riesgo (la inflación garantiza que pierdes poder adquisitivo). La pregunta no es si asumir riesgo, sino qué tipo de riesgo prefieres. En E-Trading aprenderás a gestionar el primero; el segundo es inevitable si no haces nada.',
      },
      {
        titulo: 'Ejemplo real: Carlos vs María',
        contenido:
          'Ambos ganan €2.000/mes. Carlos guarda €200/mes en una cuenta corriente durante 30 años → tiene €72.000. María invierte €200/mes en un fondo indexado al 8% anual durante 30 años → tiene €272.000. **La diferencia es €200.000 haciendo exactamente lo mismo cada mes.** La única diferencia es que María eligió invertir.',
      },
    ],
    quiz: [
      {
        pregunta: '¿Cuánto valen €10.000 en 10 años con inflación del 3%?',
        opciones: ['€13.000', '€10.000', '€7.440', '€9.000'],
        correcta: 2,
        explicacion:
          'Con un 3% de inflación anual compuesta, el poder adquisitivo cae un 26% en 10 años. €10.000 × (1/1,03)^10 ≈ €7.440.',
      },
      {
        pregunta: '¿Cuál ha sido la rentabilidad media anual histórica de la bolsa americana?',
        opciones: ['3%', '6%', '10%', '15%'],
        correcta: 2,
        explicacion:
          'El S&P 500 ha promediado aproximadamente un 10% anual en los últimos 100 años (≈7% ajustado por inflación).',
      },
      {
        pregunta: '¿Qué diferencia a invertir de ahorrar?',
        opciones: [
          'El riesgo',
          'El dinero que se pone',
          'Que la inversión busca hacer crecer el dinero',
          'El tiempo',
        ],
        correcta: 2,
        explicacion:
          'El ahorro conserva el capital (con suerte); la inversión lo expone a riesgo a cambio de hacerlo crecer por encima de la inflación.',
      },
      {
        pregunta: 'Si inviertes €200/mes durante 30 años al 8%, ¿cuánto tendrías aproximadamente?',
        opciones: ['€72.000', '€150.000', '€272.000', '€500.000'],
        correcta: 2,
        explicacion:
          'Fórmula de aportaciones periódicas: ≈€272.000. De eso, solo €72.000 son aportaciones tuyas; los otros €200.000 son interés compuesto.',
      },
      {
        pregunta: '¿Cuál es el mayor riesgo de NO invertir?',
        opciones: [
          'No hay riesgo',
          'Perder contra la inflación',
          'Que suba la bolsa',
          'Gastar demasiado',
        ],
        correcta: 1,
        explicacion:
          'No invertir parece "seguro" pero garantiza una pérdida real: tu dinero pierde 2-3% de poder adquisitivo cada año.',
      },
    ],
  },

  {
    id: 'c2',
    titulo: 'Cómo funciona la bolsa: el mercado en 10 minutos',
    duracion: '12 min',
    xp: 55,
    plan: 'free',
    modulo: 1,
    introduccion:
      'La bolsa no es un casino ni un sistema para ricos. Es un mercado donde empresas venden trozos de sí mismas a cambio de dinero para crecer, y los inversores compran esos trozos esperando que la empresa valga más en el futuro.',
    secciones: [
      {
        titulo: 'Qué es una acción',
        contenido:
          'Un trozo de propiedad de una empresa. Si Apple tiene 15.000 millones de acciones y tú compras 10, eres dueño de una parte minúscula pero real de Apple. Tienes derecho a una parte proporcional de sus beneficios futuros (vía dividendos o subida de precio).',
      },
      {
        titulo: 'Cómo se forma el precio',
        contenido:
          'El precio es simplemente lo que alguien está dispuesto a pagar ahora mismo. Sube cuando hay más compradores que vendedores, baja cuando pasa lo contrario. Nadie "decide" el precio de Apple; emerge en tiempo real del equilibrio entre oferta y demanda.',
      },
      {
        titulo: 'Bolsas del mundo',
        contenido:
          'Mercados organizados donde se compran y venden acciones. NYSE y Nasdaq (EEUU), BME (España), Frankfurt (Alemania), Tokyo (Japón). Horarios: 9:30-16:00 Nueva York, 9:00-17:30 Madrid. Fuera de horario, el precio "congela".',
      },
      {
        titulo: 'Índices bursátiles',
        contenido:
          'Un "resumen" del mercado. El **S&P 500** mide las 500 mayores empresas de EEUU. El **IBEX 35**, las 35 mayores españolas. El **Nasdaq 100**, las 100 mayores tecnológicas. Si oyes "la bolsa subió un 1%", casi seguro se refiere al S&P 500.',
      },
      {
        titulo: 'Broker: tu puerta al mercado',
        contenido:
          'Es la plataforma que te permite comprar y vender. En España los populares para principiantes son **DEGIRO** (comisiones bajas) y **Trading 212** (sin comisiones en acciones/ETFs). Interactive Brokers es el estándar profesional.',
      },
    ],
    ejercicioSimulador:
      'Abre el simulador de E-Trading, encuentra Apple (AAPL) y observa cómo cambia el precio en tiempo real durante 2 minutos.',
    quiz: [
      {
        pregunta: '¿Qué es una acción?',
        opciones: [
          'Un préstamo a una empresa',
          'Un trozo de propiedad de una empresa',
          'Un contrato de seguro',
          'Un depósito bancario',
        ],
        correcta: 1,
        explicacion:
          'Una acción te convierte en copropietario de la empresa, con derecho a su parte de beneficios.',
      },
      {
        pregunta: '¿Qué pasa con el precio cuando hay más compradores que vendedores?',
        opciones: ['Baja', 'Se queda igual', 'Sube', 'Desaparece'],
        correcta: 2,
        explicacion:
          'La demanda supera a la oferta, así que quienes quieren comprar tienen que ofrecer más para encontrar vendedor.',
      },
      {
        pregunta: '¿Qué mide el S&P 500?',
        opciones: [
          'Las 100 mayores empresas del mundo',
          'Las 500 mayores empresas de EEUU',
          'Todas las empresas americanas',
          'Las mejores acciones del año',
        ],
        correcta: 1,
        explicacion:
          'S&P 500 = índice ponderado por capitalización de las 500 mayores compañías cotizadas en EEUU.',
      },
      {
        pregunta: '¿A qué hora cierra la bolsa de Madrid?',
        opciones: ['16:00', '17:30', '18:00', '20:00'],
        correcta: 1,
        explicacion:
          'Horario continuo de Madrid: 9:00 a 17:30 hora española.',
      },
      {
        pregunta: '¿Para qué sirve un broker?',
        opciones: [
          'Para asesorarte sobre qué comprar',
          'Para permitirte comprar y vender acciones',
          'Para gestionar tu dinero',
          'Para prestarte dinero',
        ],
        correcta: 1,
        explicacion:
          'Un broker ejecuta tus órdenes en el mercado. No te asesora (eso son los asesores financieros regulados).',
      },
    ],
  },

  {
    id: 'c3',
    titulo: 'Interés compuesto: la máquina de hacer dinero',
    duracion: '10 min',
    xp: 60,
    plan: 'free',
    modulo: 1,
    introduccion:
      'Einstein (supuestamente) llamó al interés compuesto "la octava maravilla del mundo". No importa si lo dijo o no — lo que importa es que los números lo demuestran.',
    secciones: [
      {
        titulo: 'Simple vs compuesto',
        contenido:
          'Con interés **simple**, €1.000 al 10% anual dan €100 cada año. Siempre €100. Con interés **compuesto**, el año 2 ganas intereses sobre €1.100; el año 3 sobre €1.210; el año 4 sobre €1.331... La bola de nieve.',
      },
      {
        titulo: 'La regla del 72',
        contenido:
          'Para saber en cuántos años se dobla tu dinero, divide 72 entre la rentabilidad anual. Al 8%, tu dinero se dobla en 72÷8 = **9 años**. Al 6%, en 12 años. Al 12%, en 6 años. Regla aproximada pero increíblemente útil para cálculos mentales rápidos.',
      },
      {
        titulo: 'El tiempo es el factor dominante',
        contenido:
          '€10.000 al 8% durante 10 años → €21.589 (dobla). Durante 30 años → €100.627 (×10). **Los últimos 20 años generan más que los primeros 10.** Por eso empezar pronto, aunque con poco, bate casi siempre a empezar tarde con mucho.',
      },
      {
        titulo: 'Aportar de forma regular',
        contenido:
          'Invertir €200/mes es más poderoso que invertir €2.400 una vez al año, porque cada euro invertido antes tiene más tiempo para crecer. Y además, es psicológicamente más fácil (no tienes que ahorrar €2.400 de golpe).',
      },
    ],
    ejercicioSimulador:
      'Usa la calculadora de interés compuesto y calcula cuánto tendrías si invirtieras tu edad en euros cada mes durante 30 años al 8%.',
    quiz: [
      {
        pregunta: '¿Qué diferencia al interés compuesto del simple?',
        opciones: [
          'Que da más interés el primer año',
          'Que los intereses generan más intereses',
          'Que es más seguro',
          'Que lo usan los bancos',
        ],
        correcta: 1,
        explicacion:
          'La "magia" del compuesto es que los intereses del año anterior también generan intereses el año siguiente.',
      },
      {
        pregunta: 'Según la regla del 72, ¿en cuántos años se dobla el dinero al 9% anual?',
        opciones: ['9', '8', '6', '12'],
        correcta: 1,
        explicacion:
          '72 ÷ 9 = 8 años. Regla aproximada pero muy precisa para tasas entre 4% y 15%.',
      },
      {
        pregunta: '€5.000 al 8% durante 20 años son aproximadamente:',
        opciones: ['€9.000', '€13.000', '€23.305', '€50.000'],
        correcta: 2,
        explicacion:
          '5.000 × 1,08^20 ≈ €23.305. El dinero se multiplica por ~4,7 en 20 años al 8%.',
      },
      {
        pregunta: '¿Por qué es mejor aportar €200/mes que €2.400 al final del año?',
        opciones: [
          'Porque el banco cobra menos',
          'Porque el dinero tiene más tiempo para crecer',
          'Porque es más fácil',
          'No hay diferencia',
        ],
        correcta: 1,
        explicacion:
          'Los primeros €200 están invertidos 11 meses más que los últimos. A lo largo de 30 años, esa diferencia suma miles de euros.',
      },
      {
        pregunta: 'En el interés compuesto, ¿cuándo se genera más dinero?',
        opciones: [
          'Los primeros años',
          'Los últimos años',
          'Todos los años igual',
          'El primer año',
        ],
        correcta: 1,
        explicacion:
          'La base sobre la que se calculan los intereses crece cada año, así que los últimos años generan valores absolutos mucho mayores.',
      },
    ],
  },

  {
    id: 'c4',
    titulo: 'Los 5 tipos de activos: ¿en qué puedes invertir?',
    duracion: '12 min',
    xp: 60,
    plan: 'free',
    modulo: 1,
    introduccion:
      'No toda la inversión es comprar acciones de Apple. Existen varios tipos de activos con características muy distintas. Conocerlos es esencial para construir una cartera equilibrada.',
    secciones: [
      {
        titulo: 'Acciones (renta variable)',
        contenido:
          'Comprar partes de empresas. Alta rentabilidad potencial (8-12% anual histórico), alta volatilidad (pueden caer 30-50% en crisis). A largo plazo (15+ años), históricamente el activo más rentable del mundo.',
      },
      {
        titulo: 'Bonos (renta fija)',
        contenido:
          'Prestarle dinero a empresas o gobiernos a cambio de un interés fijo. Más seguros que las acciones, menos rentables. El bono del Tesoro español a 10 años paga ~3,5% anual. Los bonos bajan de precio cuando suben los tipos de interés.',
      },
      {
        titulo: 'ETFs y fondos indexados',
        contenido:
          'Cesta de muchas acciones en un solo producto. Comprar un ETF del S&P 500 es comprar las 500 mayores empresas americanas a la vez. Bajo coste (0,03-0,20% anual), muy diversificados. La opción más inteligente para el 95% de los inversores.',
      },
      {
        titulo: 'Criptomonedas',
        contenido:
          'Activos digitales descentralizados. Alta volatilidad (±80% en un año es normal), sin flujo de caja, máximo riesgo. Bitcoin y Ethereum son los más establecidos. Regla de oro: nunca más del 5-10% de tu cartera.',
      },
      {
        titulo: 'Materias primas e inmuebles',
        contenido:
          '**Oro**: históricamente refugio en crisis (3-5% anual). **Petróleo, plata, trigo**: muy cíclicos. **Inmuebles**: comprar propiedades para alquilar o vía REITs cotizados (accesible con €100 vs €200.000).',
      },
    ],
    quiz: [
      {
        pregunta: '¿Qué es un ETF del S&P 500?',
        opciones: [
          'Una acción de EEUU',
          'Una cesta con las 500 mayores empresas americanas',
          'Un bono del gobierno americano',
          'Una cuenta de ahorro',
        ],
        correcta: 1,
        explicacion:
          'Un ETF indexado replica el índice: comprando una participación, indirectamente posees las 500 empresas.',
      },
      {
        pregunta: '¿Qué activo tiene históricamente la mayor rentabilidad a largo plazo?',
        opciones: ['Oro', 'Bonos', 'Acciones', 'Inmuebles'],
        correcta: 2,
        explicacion:
          'En horizontes de 20+ años, las acciones diversificadas baten a cualquier otra clase de activo.',
      },
      {
        pregunta: '¿Qué activo funciona mejor como refugio en crisis?',
        opciones: ['Criptomonedas', 'Acciones', 'Oro', 'Inmuebles'],
        correcta: 2,
        explicacion:
          'El oro tiende a subir (o al menos mantener valor) cuando las bolsas caen con miedo extremo.',
      },
      {
        pregunta: '¿Qué ventaja tienen los ETFs sobre acciones individuales?',
        opciones: [
          'Más rentabilidad',
          'Diversificación inmediata y bajo coste',
          'Sin riesgo',
          'Garantía de rentabilidad',
        ],
        correcta: 1,
        explicacion:
          'Con una sola operación obtienes cientos o miles de empresas. Reduces el riesgo específico casi a cero.',
      },
      {
        pregunta: 'Si quieres alta liquidez y bajo riesgo, ¿qué eliges?',
        opciones: [
          'Inmuebles',
          'Cripto',
          'Bonos del gobierno',
          'Acciones de pequeñas empresas',
        ],
        correcta: 2,
        explicacion:
          'Los bonos de gobiernos estables (España, Alemania, EEUU) combinan seguridad y liquidez casi inmediata.',
      },
    ],
  },

  {
    id: 'c5',
    titulo: 'Riesgo y rentabilidad: la relación fundamental',
    duracion: '10 min',
    xp: 55,
    plan: 'free',
    modulo: 1,
    introduccion:
      'No existe alta rentabilidad sin alto riesgo. Cualquiera que te prometa lo contrario te está mintiendo. Entender esta relación es la base de cualquier decisión de inversión sensata.',
    secciones: [
      {
        titulo: 'La frontera eficiente',
        contenido:
          'Para cada nivel de riesgo existe un máximo de rentabilidad esperada. No puedes obtener más rentabilidad sin asumir más riesgo. Si alguien te promete "10% sin riesgo", es estafa — garantizado.',
      },
      {
        titulo: 'Volatilidad como medida de riesgo',
        contenido:
          'La volatilidad mide cuánto sube y baja un activo. Una acción que oscila ±5% diario es más arriesgada que una que se mueve ±0,5%. Se mide con la desviación estándar de los rendimientos.',
      },
      {
        titulo: 'Beta',
        contenido:
          'Mide cómo se mueve un activo respecto al mercado. **Beta 1** = se mueve igual que el mercado. **Beta 2** = sube el doble cuando sube, pero baja el doble. **Beta 0,5** = menos volátil que el mercado. Tesla tiene beta ~2; Coca-Cola ~0,6.',
      },
      {
        titulo: 'Horizonte temporal: el tiempo "doma" el riesgo',
        contenido:
          'A corto plazo la bolsa es muy volátil. A largo plazo (10+ años) el riesgo de pérdida en un fondo indexado global es casi nulo históricamente. Nunca ha habido un período de 20 años donde el S&P 500 haya dado retornos negativos.',
      },
      {
        titulo: 'Tu perfil de riesgo',
        contenido:
          'Depende de tu edad, ingresos, deudas y — sobre todo — de cuánto puedes dormir tranquilo si tu cartera baja un 30%. Si te genera ansiedad severa, tu cartera está mal calibrada para ti.',
      },
    ],
    quiz: [
      {
        pregunta: '¿Qué mide la volatilidad?',
        opciones: [
          'La rentabilidad',
          'Cuánto sube y baja un activo',
          'El volumen de operaciones',
          'El precio actual',
        ],
        correcta: 1,
        explicacion:
          'Volatilidad = amplitud de los movimientos. Mayor volatilidad → mayor incertidumbre sobre dónde estará el precio mañana.',
      },
      {
        pregunta: 'Una acción con beta 2 ¿cómo se comporta si el mercado sube 5%?',
        opciones: ['Sube 2,5%', 'Sube 5%', 'Sube 10%', 'Sube 2%'],
        correcta: 2,
        explicacion:
          'Beta 2 amplifica el movimiento del mercado ×2. Pero ojo: también amplifica las caídas.',
      },
      {
        pregunta: '¿Cómo afecta el horizonte temporal al riesgo?',
        opciones: [
          'No afecta',
          'A más tiempo, más riesgo',
          'A más tiempo, el riesgo de pérdida se reduce',
          'Solo afecta en renta fija',
        ],
        correcta: 2,
        explicacion:
          'El tiempo "diluye" la volatilidad. En 20+ años, la probabilidad de acabar en pérdidas en un índice global es prácticamente nula.',
      },
      {
        pregunta: '¿Qué relación existe entre riesgo y rentabilidad?',
        opciones: [
          'Son independientes',
          'A más riesgo, menos rentabilidad',
          'A más riesgo, más rentabilidad potencial',
          'Solo se relacionan en cripto',
        ],
        correcta: 2,
        explicacion:
          'Los inversores exigen más rentabilidad esperada para aceptar más riesgo. No es garantía — es exigencia.',
      },
      {
        pregunta: '¿Qué define principalmente tu perfil de riesgo?',
        opciones: [
          'Tu edad y cuánto puedes permitirte perder sin pánico',
          'Tus conocimientos de inversión',
          'El tipo de broker que usas',
          'Cuánto dinero tienes',
        ],
        correcta: 0,
        explicacion:
          'Capacidad de asumir pérdidas (horizonte/edad) + tolerancia psicológica (dormir tranquilo) = tu perfil real.',
      },
    ],
  },

  {
    id: 'c6',
    titulo: 'Diversificación: no pongas todos los huevos en la misma cesta',
    duracion: '12 min',
    xp: 65,
    plan: 'free',
    modulo: 1,
    introduccion:
      'Si inviertes todos tus ahorros en una sola empresa y esa empresa quiebra, lo pierdes todo. La diversificación elimina este riesgo sin sacrificar rentabilidad — es la única "comida gratis" en inversión.',
    secciones: [
      {
        titulo: 'Riesgo específico vs riesgo de mercado',
        contenido:
          'El **riesgo específico** (que una empresa concreta quiebre) se elimina diversificando. El **riesgo de mercado** (que la bolsa en general baje) no se puede eliminar, pero sí gestionar con activos no correlacionados.',
      },
      {
        titulo: '¿Cuántas acciones necesitas?',
        contenido:
          'Con 15-20 acciones bien distribuidas ya eliminas ~90% del riesgo específico. Más acciones no reducen significativamente el riesgo. Por eso los ETFs con 500+ empresas son tan eficientes.',
      },
      {
        titulo: 'Correlación',
        contenido:
          'La diversificación solo funciona si los activos no se mueven juntos. Si tienes 20 empresas tecnológicas americanas, **no estás diversificado**: todas caerán juntas en una crisis tech. Necesitas correlación baja.',
      },
      {
        titulo: 'Diversificación geográfica y sectorial',
        contenido:
          'No solo España, no solo EEUU. Incluir Europa, mercados emergentes, Asia reduce el riesgo de crisis local. Sectorial: tecnología, salud, consumo, energía, financiero — no concentrar.',
      },
      {
        titulo: 'La solución simple',
        contenido:
          'Un ETF del índice mundial (MSCI World o FTSE All-World) te da exposición a ~1.500-4.000 empresas de 23-47 países en **un solo producto**. Para el 95% de inversores, esto es suficiente.',
      },
    ],
    ejercicioSimulador:
      'Crea una cartera en el simulador con al menos 5 activos de categorías distintas (acciones, ETFs, cripto, materias primas) y observa la distribución.',
    quiz: [
      {
        pregunta: '¿Qué tipo de riesgo elimina la diversificación?',
        opciones: [
          'El riesgo de mercado',
          'El riesgo específico de cada empresa',
          'Todos los riesgos',
          'El riesgo de inflación',
        ],
        correcta: 1,
        explicacion:
          'El riesgo específico (una empresa concreta) se diluye. El riesgo de mercado (que caiga todo) persiste.',
      },
      {
        pregunta: '¿Cuántas acciones necesitas aproximadamente para diversificar bien?',
        opciones: ['2-3', '5-7', '15-20', '100+'],
        correcta: 2,
        explicacion:
          'Con 15-20 acciones bien distribuidas por sector y geografía eliminas la mayor parte del riesgo específico.',
      },
      {
        pregunta: '¿Qué es la correlación entre activos?',
        opciones: [
          'El precio relativo',
          'Cómo se mueven juntos o en sentido contrario',
          'Su rentabilidad histórica',
          'Su tamaño en el mercado',
        ],
        correcta: 1,
        explicacion:
          'Correlación alta = se mueven juntos. Diversificar requiere correlación baja o negativa entre activos.',
      },
      {
        pregunta: '¿Está bien diversificada una cartera con 20 empresas tecnológicas americanas?',
        opciones: [
          'Sí, son muchas empresas',
          'No, todas son del mismo sector y país',
          'Sí, si todas son grandes',
          'Depende del precio',
        ],
        correcta: 1,
        explicacion:
          'Alta correlación sectorial y geográfica. Una crisis tech o una recesión en EEUU afectaría a todas.',
      },
      {
        pregunta: '¿Qué ventaja tiene un ETF del MSCI World?',
        opciones: [
          'Mayor rentabilidad garantizada',
          'Exposición a 1.500+ empresas de 23 países en un producto',
          'Sin riesgo',
          'Solo invierte en las mejores empresas',
        ],
        correcta: 1,
        explicacion:
          'Diversificación masiva con una sola operación y coste bajísimo (0,20% anual típico).',
      },
    ],
  },

  {
    id: 'c7',
    titulo: 'Tu primera inversión: paso a paso',
    duracion: '15 min',
    xp: 80,
    plan: 'free',
    modulo: 1,
    introduccion:
      'Saber la teoría está bien, pero lo que te hace aprender de verdad es hacer. Esta clase es práctica: vas a ejecutar tu primera operación en el simulador de E-Trading, paso a paso.',
    secciones: [
      {
        titulo: 'Elegir un broker',
        contenido:
          'Para dinero real necesitas un broker. En España, los mejores para empezar: **DEGIRO** (comisiones bajas, muy completo), **Trading 212** (sin comisiones en acciones/ETFs, interfaz limpia), **Interactive Brokers** (profesional, cuando tengas más experiencia). Todos regulados.',
      },
      {
        titulo: 'Tipos de órdenes básicas',
        contenido:
          '**Orden de mercado:** compras al precio actual, inmediata, no controlas el precio exacto. **Orden limitada:** defines el precio máximo que quieres pagar; solo se ejecuta si el mercado llega a ese nivel. La limitada es más segura pero puede no ejecutarse.',
      },
      {
        titulo: 'El spread (diferencial)',
        contenido:
          'Diferencia entre el precio de compra (bid) y el de venta (ask). Si AAPL cotiza a $195,20 / $195,25, el spread es $0,05. Es un coste implícito de cada operación — siempre "pagas" el spread al entrar.',
      },
      {
        titulo: 'Gestión básica de posiciones',
        contenido:
          'Tras comprar tienes una **posición**. Necesitas saber: cuánto invertiste, cuánto vale ahora, y tu ganancia/pérdida en €/%. El portafolio de E-Trading te muestra todo esto automáticamente.',
      },
    ],
    ejercicioSimulador:
      '1) Ve al Mercado del simulador. 2) Busca Apple (AAPL). 3) Compra €100 con orden de mercado. 4) Observa cómo aparece en tu portafolio. 5) Comprueba tu posición.',
    quiz: [
      {
        pregunta: '¿Qué diferencia una orden de mercado de una limitada?',
        opciones: [
          'El precio',
          'La velocidad',
          'Que la limitada solo se ejecuta al precio que defines',
          'La comisión',
        ],
        correcta: 2,
        explicacion:
          'Mercado = velocidad garantizada, precio no. Limitada = precio garantizado, ejecución no.',
      },
      {
        pregunta: '¿Qué es el spread?',
        opciones: [
          'La comisión del broker',
          'La diferencia entre el precio de compra y venta',
          'El precio máximo de una acción',
          'El volumen diario',
        ],
        correcta: 1,
        explicacion:
          'Spread = ask − bid. Coste implícito que pagas en toda operación, además de las comisiones del broker.',
      },
      {
        pregunta: '¿Cuál es una buena opción de broker para principiantes en España?',
        opciones: [
          'Solo los bancos',
          'DEGIRO o Trading 212',
          'Solo apps americanas',
          'No existen brokers en España',
        ],
        correcta: 1,
        explicacion:
          'DEGIRO y Trading 212 son los más usados por pequeños inversores en España: regulados, comisiones bajas.',
      },
      {
        pregunta: 'Si compras €100 en AAPL con orden de mercado, ¿qué pasa?',
        opciones: [
          'Esperas a que baje el precio',
          'Se ejecuta inmediatamente al precio actual',
          'El broker decide el precio',
          'Tienes que llamar al broker',
        ],
        correcta: 1,
        explicacion:
          'La orden de mercado busca la mejor oferta disponible y se ejecuta en segundos.',
      },
      {
        pregunta: '¿Dónde ves tus posiciones abiertas?',
        opciones: [
          'En el historial',
          'En el portafolio',
          'En el mercado',
          'En la página de la empresa',
        ],
        correcta: 1,
        explicacion:
          'El portafolio lista todas las posiciones abiertas con valor actual y P&L. El historial muestra operaciones pasadas.',
      },
    ],
  },

  {
    id: 'c8',
    titulo: 'Psicología del inversor: tus peores enemigos',
    duracion: '12 min',
    xp: 70,
    plan: 'free',
    modulo: 1,
    introduccion:
      'Los inversores no pierden dinero por falta de información. Lo pierden por tomar decisiones emocionales. Esta clase trata los errores psicológicos que cometen casi todos los principiantes, y cómo evitarlos.',
    secciones: [
      {
        titulo: 'FOMO (Fear Of Missing Out)',
        contenido:
          'Comprar algo porque "todo el mundo lo está comprando" o "ya subió mucho y no quiero quedarme fuera". GameStop en enero 2021 y Bitcoin a $69.000 en 2021 son ejemplos perfectos: los que entraron por FOMO perdieron 70-90%.',
      },
      {
        titulo: 'Aversión a la pérdida',
        contenido:
          'El dolor de perder €100 es psicológicamente **2x más intenso** que el placer de ganar €100 (Kahneman & Tversky, Nobel 2002). Esto nos lleva a mantener posiciones perdedoras demasiado tiempo ("a ver si se recupera") y vender ganadoras demasiado pronto.',
      },
      {
        titulo: 'Efecto disposición',
        contenido:
          'Vendemos las acciones que suben (para "asegurar ganancias") y mantenemos las que bajan (esperando recuperación). Exactamente al revés de lo óptimo — estadísticamente las ganadoras tienden a seguir ganando y las perdedoras a seguir perdiendo.',
      },
      {
        titulo: 'Sesgo de confirmación',
        contenido:
          'Solo leemos noticias que confirman lo que ya creemos. Si compraste Bitcoin, solo buscas razones por las que Bitcoin va a subir. Antídoto: busca activamente el argumento contrario antes de comprar algo.',
      },
      {
        titulo: 'Mentalidad de rebaño',
        contenido:
          'Hacer lo mismo que hacen todos, por miedo a equivocarse solo. Warren Buffett: **"Sé codicioso cuando otros tienen miedo, y ten miedo cuando otros son codiciosos"**. Las grandes oportunidades están donde el rebaño no está.',
      },
    ],
    quiz: [
      {
        pregunta: '¿Qué es el FOMO en inversión?',
        opciones: [
          'Una estrategia de diversificación',
          'Comprar por miedo a perderse una subida',
          'Un tipo de bono',
          'Una técnica de análisis',
        ],
        correcta: 1,
        explicacion:
          'FOMO = Fear Of Missing Out. El motor psicológico de las burbujas y los techos de mercado.',
      },
      {
        pregunta: 'Según Kahneman, ¿cuántas veces más duele perder €100 que alegra ganar €100?',
        opciones: ['Lo mismo', '1,5 veces', '2 veces', '3 veces'],
        correcta: 2,
        explicacion:
          'Aproximadamente 2:1. Kahneman & Tversky demostraron empíricamente esta asimetría — el Nobel lo consolidó.',
      },
      {
        pregunta: '¿Qué es el efecto disposición?',
        opciones: [
          'Vender todo cuando hay caídas',
          'Vender ganadores pronto y mantener perdedores',
          'Comprar en mínimos',
          'Diversificar la cartera',
        ],
        correcta: 1,
        explicacion:
          'Justo lo contrario de la máxima "corta pérdidas rápido y deja correr ganancias".',
      },
      {
        pregunta: '¿Qué es el sesgo de confirmación?',
        opciones: [
          'Buscar solo información que confirma tus creencias',
          'Confirmar cada operación',
          'Leer las noticias diariamente',
          'Revisar tu cartera cada día',
        ],
        correcta: 0,
        explicacion:
          'Filtramos inconscientemente la información que contradice lo que ya pensamos. Antídoto: busca al contrario.',
      },
      {
        pregunta: 'Warren Buffett recomienda ser codicioso cuando...',
        opciones: [
          'El mercado sube',
          'Todos tienen miedo',
          'Las empresas dan buenos resultados',
          'Hay bajas comisiones',
        ],
        correcta: 1,
        explicacion:
          'Las mejores oportunidades están en los momentos de máximo pesimismo — donde nadie quiere comprar.',
      },
    ],
  },

  {
    id: 'c9',
    titulo: '¿Cómo leer un gráfico? Análisis técnico básico',
    duracion: '14 min',
    xp: 75,
    plan: 'free',
    modulo: 1,
    introduccion:
      'Un gráfico de precios cuenta la historia de lo que compradores y vendedores han pensado sobre una empresa durante meses o años. Saber leerlo básicamente es una habilidad valiosa aunque no seas un trader activo.',
    secciones: [
      {
        titulo: 'Línea vs velas japonesas',
        contenido:
          'El **gráfico de línea** muestra solo el precio de cierre: limpio pero pierde información. Las **velas japonesas** muestran apertura, cierre, máximo y mínimo de cada período — el estándar profesional.',
      },
      {
        titulo: 'Anatomía de una vela',
        contenido:
          'El **cuerpo** muestra la diferencia entre apertura y cierre. Las **mechas** (sombras) muestran máximo y mínimo. **Verde/blanca** = cerró por encima de donde abrió (alcista). **Roja/negra** = cerró por debajo (bajista). Una vela con cuerpo pequeño y mechas largas = indecisión.',
      },
      {
        titulo: 'Tendencias',
        contenido:
          '**Alcista:** máximos y mínimos cada vez más altos. **Bajista:** máximos y mínimos cada vez más bajos. **Lateral (rango):** sin dirección clara, oscila entre dos niveles. Regla fundamental: no luches contra la tendencia.',
      },
      {
        titulo: 'Soportes y resistencias',
        contenido:
          '**Soporte:** nivel de precio donde el activo "rebota" al bajar — hay muchos compradores esperando. **Resistencia:** nivel donde "frena" al subir — muchos vendedores. Cuanto más veces se ha respetado un nivel, más importante es.',
      },
      {
        titulo: 'Volumen',
        contenido:
          'Número de acciones negociadas. Un movimiento de precio con **alto volumen** es "real" y significativo; con **poco volumen** es sospechoso (puede ser manipulación o falta de convicción).',
      },
    ],
    ejercicioSimulador:
      'Abre el gráfico de AAPL en el simulador. Cambia a vistas 1S y 1M. Identifica visualmente si la tendencia actual es alcista, bajista o lateral.',
    quiz: [
      {
        pregunta: '¿Qué muestra una vela japonesa verde?',
        opciones: [
          'Que el precio bajó',
          'Que cerró por encima de donde abrió',
          'Que hubo mucho volumen',
          'Que la empresa ganó dinero',
        ],
        correcta: 1,
        explicacion:
          'Verde/blanca = vela alcista (close > open). Roja/negra = bajista (close < open).',
      },
      {
        pregunta: '¿Qué es un soporte?',
        opciones: [
          'Un nivel de resistencia',
          'Donde el precio suele rebotar al bajar porque hay compradores',
          'El precio mínimo histórico',
          'Una orden de compra',
        ],
        correcta: 1,
        explicacion:
          'Zona donde la demanda históricamente ha superado a la oferta, frenando las caídas.',
      },
      {
        pregunta: 'En tendencia alcista, ¿qué característica tienen máximos y mínimos?',
        opciones: [
          'Los dos bajan',
          'El máximo baja, el mínimo sube',
          'Los dos suben progresivamente',
          'Se mantienen iguales',
        ],
        correcta: 2,
        explicacion:
          'Higher highs + higher lows = definición técnica de tendencia alcista.',
      },
      {
        pregunta: '¿Qué significa movimiento con alto volumen?',
        opciones: [
          'Muchos inversores pequeños',
          'Movimiento más significativo y con convicción',
          'El precio seguirá esa dirección seguro',
          'El mercado va a cerrar',
        ],
        correcta: 1,
        explicacion:
          'Alto volumen = muchos participantes involucrados = el movimiento refleja un consenso real.',
      },
      {
        pregunta: '¿Diferencia principal vela japonesa vs línea?',
        opciones: [
          'Solo el color',
          'La vela muestra apertura, cierre, máximo y mínimo',
          'El de línea es más preciso',
          'No hay diferencia',
        ],
        correcta: 1,
        explicacion:
          'La vela condensa 4 datos por período; la línea, solo el cierre.',
      },
    ],
  },

  {
    id: 'c10',
    titulo: 'Análisis fundamental: ¿vale lo que cuesta?',
    duracion: '14 min',
    xp: 75,
    plan: 'free',
    modulo: 1,
    introduccion:
      'El análisis técnico mira el gráfico. El análisis fundamental mira la empresa. La pregunta es: ¿cuánto vale esta empresa de verdad, y está el mercado pagando más o menos de eso?',
    secciones: [
      {
        titulo: 'Ratio P/E (Price to Earnings)',
        contenido:
          'Precio de la acción dividido entre el beneficio por acción. Un **P/E de 20** significa que pagas €20 por cada €1 de beneficio anual. P/E alto → mercado espera mucho crecimiento. P/E bajo → empresa barata o en problemas. P/E medio histórico S&P 500: ~16.',
      },
      {
        titulo: 'EPS (Earnings Per Share)',
        contenido:
          'Beneficio total de la empresa dividido entre número de acciones. Si Apple gana $100.000M y tiene 15.000M de acciones, EPS = $6,67. El crecimiento del EPS año a año es la métrica clave de salud empresarial.',
      },
      {
        titulo: 'Dividendo',
        contenido:
          'Parte del beneficio que la empresa reparte entre accionistas. Un dividendo del 3% te paga €3 por cada €100 invertidos, sin vender nada. Empresas maduras pagan dividendo; empresas en crecimiento prefieren reinvertir.',
      },
      {
        titulo: 'Deuda / Equity',
        contenido:
          'Cuánta deuda tiene la empresa vs patrimonio propio. Mucha deuda = peligro, especialmente con tipos de interés subiendo. Un ratio D/E por debajo de 1 es generalmente sano (varía por sector: utilities aceptan más deuda).',
      },
      {
        titulo: 'Free Cash Flow',
        contenido:
          'El dinero **real** que genera la empresa después de todos sus gastos e inversiones. Más fiable que el beneficio contable, que puede manipularse. Si una empresa crece en beneficio pero no en FCF, desconfía.',
      },
    ],
    quiz: [
      {
        pregunta: '¿Qué significa un P/E de 25?',
        opciones: [
          'La empresa tiene 25 empleados',
          'Pagas 25 veces el beneficio anual',
          'La acción vale $25',
          'Creció un 25% este año',
        ],
        correcta: 1,
        explicacion:
          'P/E = precio / beneficio por acción. Pagas 25€ por cada 1€ de beneficio que genera.',
      },
      {
        pregunta: '¿Qué es el EPS?',
        opciones: [
          'El precio de la acción',
          'El beneficio por acción',
          'El dividendo anual',
          'El volumen diario',
        ],
        correcta: 1,
        explicacion:
          'Earnings Per Share = beneficio neto / número de acciones en circulación.',
      },
      {
        pregunta: 'Una empresa con P/E muy bajo puede indicar:',
        opciones: [
          'Que es la mejor inversión',
          'Que está barata o en problemas',
          'Que es nueva en bolsa',
          'Que paga dividendos altos',
        ],
        correcta: 1,
        explicacion:
          'P/E bajo = el mercado no confía en el crecimiento futuro (problemas) o está realmente infravalorada (oportunidad). Hay que investigar.',
      },
      {
        pregunta: '¿Qué es el Free Cash Flow?',
        opciones: [
          'Las ventas totales',
          'El beneficio contable',
          'El dinero real tras todos los gastos e inversiones',
          'Los dividendos',
        ],
        correcta: 2,
        explicacion:
          'FCF = caja operativa − capex. El indicador más honesto de salud financiera real.',
      },
      {
        pregunta: 'Empresa con mucha deuda y tipos subiendo:',
        opciones: [
          'Más rentable',
          'Más riesgo',
          'Paga más dividendos',
          'Su P/E baja',
        ],
        correcta: 1,
        explicacion:
          'Tipos altos = refinanciar deuda cuesta más = menos beneficio = riesgo de solvencia en casos extremos.',
      },
    ],
  },
]

export const CLASE_BY_ID: Record<string, ClaseContenido> = Object.fromEntries(
  CLASES_CONTENIDO.map((c) => [c.id, c]),
)

/** Devuelve el contenido detallado de una clase, o null si aún no está escrito. */
export function getClaseContenido(id: string): ClaseContenido | null {
  return CLASE_BY_ID[id] ?? null
}
