# Mapa del currículo v2 (Fase 2): secciones → unidades → clases.
# Genera docs/curso-v2/curriculo.json (esqueleto que luego llenará el contenido) y docs/curso-v2/02-curriculo.md (tabla para revisar).
# Uso: python3 -I scripts/curriculo/map.py
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')

# Tipos de ejercicio (catálogo completo en la Fase 3)
TYPES = {
    'TE': 'Test (una correcta)', 'VF': 'Verdadero o falso', 'MU': 'Varias correctas', 'OR': 'Ordenar pasos', 'EM': 'Emparejar conceptos',
    'HU': 'Rellenar huecos', 'LG': 'Leer un gráfico real', 'PG': 'Marcar un punto en el gráfico', 'SB': '¿Sube o baja? (histórico real)',
    'ST': 'Colocar stop loss / take profit', 'SI': 'Simulación de compra/venta', 'ES': 'Escenario con decisión', 'CA': 'Calculadora interactiva',
    'CT': 'Construir una cartera', 'DE': 'Detectar la estafa', 'CH': 'Conversación con Lumi', 'CR': 'Reto cronometrado', 'RP': 'Repaso espaciado de errores',
}

# Cada sección: (id, título, requisitos, unidades). Cada unidad: (id, título, clases). Cada clase: (título, objetivo, tipos, dificultad 1-5)
S = []

S.append(('s1', 'Fundamentos del dinero', [], [
    ('u1', 'El dinero y la inflación', [
        ('Qué es el dinero (y qué no)', 'Distinguir dinero, ahorro, renta y patrimonio', 'TE VF EM CH', 1),
        ('La inflación: por qué todo sube', 'Explicar la inflación y su efecto en el poder de compra', 'TE CA ES', 1),
        ('El IPC y tu cesta de la compra', 'Leer el IPC del INE y entender que tu inflación personal puede ser otra', 'LG TE HU', 1),
        ('El dinero parado pierde valor', 'Calcular cuánto pierde un ahorro sin rentabilidad en 10 años', 'CA VF ES', 1),
        ('Interés simple e interés compuesto', 'Diferenciar ambos y ver el efecto bola de nieve', 'CA TE OR', 1),
        ('La regla del 72', 'Estimar en cuántos años se duplica el dinero', 'CA CR HU', 1),
    ]),
    ('u2', 'Presupuesto y ahorro', [
        ('Tu presupuesto en 10 minutos', 'Clasificar ingresos y gastos fijos y variables', 'EM TE CT', 1),
        ('La regla 50/30/20', 'Repartir un sueldo con un método sencillo', 'CA CT VF', 1),
        ('Gastos hormiga y suscripciones', 'Detectar gastos pequeños que suman mucho al año', 'CA CR VF', 1),
        ('El fondo de emergencia', 'Calcular un colchón de 3 a 6 meses y dónde guardarlo', 'CA TE ES', 1),
        ('Págate primero a ti', 'Automatizar el ahorro antes de gastar', 'OR VF CH', 1),
    ]),
    ('u3', 'Deudas y crédito', [
        ('TIN, TAE y el coste real de un préstamo', 'Comparar préstamos por la TAE, no por la cuota', 'CA TE HU', 2),
        ('Deuda buena y deuda mala', 'Distinguir deuda que crea valor de la que lo destruye', 'EM ES VF', 1),
        ('Tarjetas revolving y minicréditos', 'Reconocer las deudas más caras y cómo salir de ellas', 'CA DE TE', 2),
        ('Bola de nieve o avalancha', 'Elegir un método para pagar varias deudas', 'OR CA ES', 2),
        ('Invertir o amortizar', 'Decidir entre pagar deuda o invertir según el tipo de interés', 'ES CA VF', 2),
    ]),
    ('u4', 'Tu primer plan financiero', [
        ('Ahorrar, invertir y especular', 'Distinguir las tres cosas por plazo, riesgo y objetivo', 'EM TE VF', 1),
        ('Objetivos con fecha y cifra', 'Convertir un deseo en un objetivo medible', 'OR HU CH', 1),
        ('Tu horizonte temporal', 'Relacionar plazo con el tipo de inversión adecuada', 'EM TE ES', 1),
        ('Cuánto riesgo puedes aguantar', 'Separar capacidad y tolerancia al riesgo', 'ES TE CH', 2),
        ('La verdad sobre hacerse rico rápido', 'Conocer los datos reales de los traders minoristas', 'VF TE DE', 2),
    ]),
]))

S.append(('s2', 'Cómo funcionan los mercados', ['s1'], [
    ('u5', 'La bolsa por dentro', [
        ('Qué es una bolsa', 'Explicar para qué sirve un mercado de valores', 'TE VF CH', 1),
        ('Quién compra y quién vende', 'Conocer a minoristas, institucionales y creadores de mercado', 'EM TE ES', 2),
        ('Oferta, demanda y precio', 'Ver cómo se forma un precio en el libro de órdenes', 'SI TE OR', 2),
        ('Horarios y sesiones', 'Saber cuándo abre cada mercado (Madrid, Nueva York, cripto 24/7)', 'EM CR TE', 1),
        ('Bróker, cuenta y custodia', 'Entender qué hace un bróker y el Fondo de Garantía de Inversiones', 'TE VF ES', 2),
        ('Mercado primario y secundario: las OPV', 'Distinguir la salida a bolsa del día a día', 'TE EM VF', 2),
        ('La bolsa española: IBEX y mercado continuo', 'Conocer cómo funciona BME y sus segmentos', 'TE LG EM', 2),
    ]),
    ('u6', 'Las órdenes', [
        ('La orden a mercado', 'Comprar y vender al precio actual y entender cuándo se ejecuta', 'SI TE VF', 2),
        ('Horquilla, spread y deslizamiento', 'Ver los costes ocultos al operar', 'LG CA TE', 2),
        ('La orden limitada', 'Fijar el precio máximo de compra o mínimo de venta', 'SI ST ES', 2),
        ('El stop loss', 'Limitar pérdidas con una orden automática', 'ST SI TE', 2),
        ('El take profit', 'Asegurar beneficios con un objetivo de salida', 'ST SI VF', 2),
        ('Combinar órdenes: OCO', 'Usar stop y objetivo a la vez y saber qué pasa con los huecos', 'ST ES OR', 3),
    ]),
    ('u7', 'Índices y referencias', [
        ('Qué es un índice', 'Entender un índice como cesta de referencia', 'TE VF EM', 1),
        ('S&P 500, Nasdaq, IBEX 35 y MSCI World', 'Reconocer los índices principales y qué miden', 'EM LG TE', 2),
        ('Ponderar por capitalización', 'Calcular por qué unas empresas pesan más que otras', 'CA TE VF', 2),
        ('Índice de precios y de rentabilidad total', 'Ver el efecto de los dividendos en el largo plazo', 'LG CA TE', 2),
        ('Comparar tu rentabilidad', 'Usar un índice como vara de medir', 'CA ES TE', 2),
    ]),
]))

S.append(('s3', 'Productos de inversión', ['s2'], [
    ('u8', 'Acciones', [
        ('Qué es una acción', 'Entender que una acción es una parte de una empresa', 'TE VF CH', 1),
        ('Derechos del accionista', 'Conocer voto, dividendo e información', 'MU TE EM', 2),
        ('Dividendos: cómo y cuándo se cobran', 'Entender fecha ex-dividendo y por qué el precio baja', 'LG TE CA', 2),
        ('Splits, contrasplits y ampliaciones', 'Saber por qué cambia el número de acciones', 'CA VF TE', 2),
        ('Grandes, medianas y pequeñas', 'Comparar riesgo y potencial según el tamaño', 'EM TE ES', 2),
        ('Crecimiento y valor', 'Distinguir dos estilos de empresas', 'EM LG TE', 2),
        ('Recompras de acciones', 'Ver cómo devuelven dinero las empresas además del dividendo', 'TE CA VF', 3),
    ]),
    ('u9', 'Bonos y renta fija', [
        ('Qué es un bono', 'Entender un bono como préstamo con cupón y vencimiento', 'TE VF CH', 1),
        ('Cupón, precio y TIR', 'Calcular la rentabilidad real de un bono', 'CA TE HU', 3),
        ('Si suben los tipos, bajan los bonos', 'Entender la relación inversa y la duración', 'SB CA TE', 3),
        ('Rating y riesgo de impago', 'Leer calificaciones y entender el bono basura', 'EM TE ES', 2),
        ('Letras del Tesoro y depósitos', 'Comparar productos de ahorro seguros en España', 'CA EM TE', 2),
        ('Bonos ligados a la inflación', 'Saber cuándo protegen y cuándo no', 'TE VF ES', 3),
    ]),
    ('u10', 'Fondos y ETFs', [
        ('Qué es un fondo de inversión', 'Entender la inversión colectiva y la gestora', 'TE VF EM', 1),
        ('Qué es un ETF', 'Comparar ETF y fondo tradicional', 'EM LG CH', 2),
        ('Comisiones: el TER y los costes ocultos', 'Calcular cuánto cuesta un 1 % al año en 30 años', 'CA TE ES', 2),
        ('Gestión activa contra indexada', 'Conocer los datos SPIVA y qué significan', 'LG TE VF', 2),
        ('Acumulación o distribución', 'Elegir entre reinvertir o cobrar dividendos', 'EM TE ES', 2),
        ('Réplica física y sintética', 'Entender cómo replica un ETF su índice', 'TE VF MU', 3),
        ('Leer la ficha de un fondo (KID)', 'Encontrar riesgo, costes y política en un documento real', 'LG MU TE', 2),
    ]),
    ('u11', 'Otros activos', [
        ('Inmobiliario en bolsa: SOCIMIs y REITs', 'Invertir en inmuebles sin comprar un piso', 'TE EM VF', 2),
        ('Futuros y opciones en una lección', 'Saber qué son sin operar con ellos', 'EM HU ES', 3),
        ('CFD: por qué la mayoría pierde', 'Leer el aviso obligatorio de riesgo de los CFD', 'CA VF DE', 3),
        ('Planes de pensiones', 'Conocer sus ventajas fiscales y sus límites en España', 'TE CA ES', 2),
        ('Depósitos, cuentas remuneradas y monetarios', 'Comparar dónde guardar el dinero a corto plazo', 'EM CA TE', 1),
    ]),
]))

S.append(('s4', 'Criptomonedas y blockchain', ['s2'], [
    ('u12', 'Fundamentos cripto', [
        ('Qué es una blockchain', 'Entender un registro compartido que no se puede reescribir', 'OR TE VF', 2),
        ('Bitcoin: el oro digital', 'Conocer el límite de 21 millones y el halving', 'TE HU LG', 2),
        ('Minería y prueba de trabajo', 'Entender cómo se validan los bloques y por qué consume energía', 'OR TE VF', 3),
        ('Ethereum y los contratos inteligentes', 'Entender qué añade Ethereum a Bitcoin', 'EM TE VF', 2),
        ('Stablecoins', 'Saber cómo mantienen su valor y su riesgo', 'TE ES VF', 3),
        ('Wallets, claves y autocustodia', 'Proteger una frase semilla y entender el riesgo de custodia', 'OR DE TE', 2),
        ('Exchanges y MiCA', 'Saber qué exige la regulación europea a un exchange', 'TE MU VF', 3),
    ]),
    ('u13', 'Riesgos y realidad cripto', [
        ('La volatilidad cripto', 'Ver caídas reales del 70 % y cuánto tardaron en recuperarse', 'LG SB CA', 3),
        ('Cuando cae un exchange: FTX', 'Entender el riesgo de contraparte', 'ES TE VF', 3),
        ('Memecoins, airdrops y rug pulls', 'Reconocer proyectos diseñados para robar', 'DE TE ES', 3),
        ('Staking y DeFi: de dónde sale el rendimiento', 'Preguntar siempre quién paga el interés', 'ES TE VF', 4),
        ('ETFs y ETPs de cripto', 'Comparar comprar cripto directamente o a través de un ETF/ETP', 'EM TE ES', 3),
        ('Cuánta cripto en una cartera', 'Pensar el peso de la cripto en el conjunto', 'CT ES CA', 3),
    ]),
]))

S.append(('s5', 'Divisas y materias primas', ['s3'], [
    ('u14', 'Divisas (forex)', [
        ('Pares de divisas', 'Leer EUR/USD y saber qué divisa compras', 'TE HU LG', 2),
        ('Pips, lotes y apalancamiento', 'Calcular cuánto mueve un pip y por qué el forex es arriesgado', 'CA TE VF', 4),
        ('Qué mueve una divisa', 'Relacionar tipos de interés, inflación y comercio', 'ES EM TE', 3),
        ('El riesgo divisa en tu cartera', 'Ver cómo afecta el dólar a un fondo del S&P 500', 'CA SB TE', 3),
        ('Divisas refugio', 'Conocer el franco suizo, el yen y el dólar en crisis', 'TE LG VF', 3),
    ]),
    ('u15', 'Materias primas', [
        ('El oro', 'Entender cuándo y por qué se usa como refugio', 'LG SB TE', 2),
        ('El petróleo y la OPEP', 'Ver qué mueve el precio del crudo', 'ES LG TE', 3),
        ('Metales industriales y agrícolas', 'Relacionar cobre, trigo y café con la economía y el clima', 'EM TE SB', 3),
        ('Cómo se invierte en materias primas', 'Comparar ETC, futuros y acciones mineras', 'EM TE VF', 3),
        ('Contango y backwardation', 'Saber por qué un ETF de petróleo puede perder aunque el crudo suba', 'CA TE LG', 4),
    ]),
]))

S.append(('s6', 'Análisis fundamental', ['s3'], [
    ('u16', 'Leer las cuentas de una empresa', [
        ('Precio y valor no son lo mismo', 'Separar lo que pagas de lo que vale', 'TE VF ES', 2),
        ('La cuenta de resultados', 'Leer ventas, márgenes y beneficio', 'LG HU TE', 3),
        ('El balance', 'Entender activo, pasivo y patrimonio', 'EM OR TE', 3),
        ('El flujo de caja', 'Distinguir beneficio de caja', 'CA TE ES', 3),
        ('La deuda de una empresa', 'Medir si una empresa debe demasiado', 'CA TE VF', 3),
        ('Resultados trimestrales y expectativas', 'Entender por qué una acción cae con buenos resultados', 'SB ES TE', 3),
        ('Leer un informe anual sin perderte', 'Encontrar lo importante en un informe real', 'LG MU OR', 4),
    ]),
    ('u17', 'Ratios y valoración', [
        ('El PER', 'Calcular e interpretar el PER', 'CA TE HU', 3),
        ('PEG, EV/EBITDA y precio/valor contable', 'Elegir el ratio según el tipo de empresa', 'EM CA TE', 4),
        ('ROE y ROIC: ¿es un buen negocio?', 'Medir la rentabilidad del capital', 'CA TE VF', 4),
        ('Rentabilidad por dividendo y payout', 'Detectar dividendos insostenibles', 'CA DE TE', 3),
        ('Descontar flujos (DCF) sin miedo', 'Entender un DCF simplificado y su sensibilidad', 'CA TE ES', 5),
        ('El CAPE y la valoración del mercado', 'Saber qué dice y qué no dice el CAPE', 'LG TE VF', 4),
    ]),
    ('u18', 'Calidad del negocio y macro', [
        ('Ventajas competitivas: el foso', 'Reconocer marcas, redes y costes de cambio', 'EM ES TE', 3),
        ('Sectores cíclicos y defensivos', 'Clasificar sectores según el ciclo', 'EM SB TE', 3),
        ('Bancos centrales y tipos de interés', 'Ver cómo afectan a bolsa y bonos', 'ES SB TE', 3),
        ('Los datos que mueven el mercado', 'Conocer IPC, empleo, PIB y PMI', 'EM ES CR', 3),
        ('Empresas pequeñas y en crecimiento: qué mirar', 'Valorar empresas sin beneficios todavía', 'ES TE CA', 4),
        ('Analizar una empresa en 30 minutos', 'Seguir una lista de comprobación con una empresa real', 'OR LG MU', 4),
    ]),
]))

S.append(('s7', 'Análisis técnico', ['s2'], [
    ('u19', 'Leer un gráfico', [
        ('Qué muestra un gráfico de precios', 'Leer ejes, precio y tiempo', 'LG PG TE', 1),
        ('Línea, barras y velas', 'Elegir el tipo de gráfico adecuado', 'EM LG TE', 2),
        ('Temporalidades', 'Ver cómo cambia la historia en 5 minutos o en un año', 'LG SB TE', 2),
        ('Escala lineal y logarítmica', 'Saber cuándo usar escala log', 'LG TE VF', 3),
        ('Tendencias: máximos y mínimos', 'Identificar tendencia alcista, bajista y lateral', 'LG PG SB', 2),
        ('El volumen', 'Usar el volumen para confirmar movimientos', 'LG TE SB', 3),
    ]),
    ('u20', 'Velas japonesas', [
        ('Anatomía de una vela', 'Leer apertura, cierre, máximo y mínimo', 'LG HU PG', 2),
        ('Cuerpo y mechas: la batalla', 'Interpretar quién ganó la sesión', 'LG TE SB', 2),
        ('Doji, peonza y marubozu', 'Reconocer indecisión y fuerza', 'LG EM CR', 3),
        ('Martillo y estrella fugaz', 'Reconocer velas de posible giro', 'LG PG SB', 3),
        ('Envolventes y harami', 'Reconocer patrones de dos velas', 'LG PG TE', 3),
        ('Estrellas, soldados y cuervos', 'Reconocer patrones de tres velas', 'LG EM SB', 3),
        ('El contexto lo es todo', 'Saber cuándo una vela importa y la evidencia real', 'SB VF TE', 3),
    ]),
    ('u21', 'Soportes, resistencias y figuras', [
        ('Soportes y resistencias', 'Marcar zonas de precio en un gráfico real', 'PG LG SB', 3),
        ('El cambio de rol', 'Ver cómo un soporte roto se vuelve resistencia', 'SB ES PG', 3),
        ('Líneas de tendencia y canales', 'Trazar tendencias y canales', 'PG LG TE', 3),
        ('Hombro-cabeza-hombro', 'Reconocer una figura de giro', 'LG PG SB', 4),
        ('Dobles techos y suelos', 'Reconocer techos y suelos dobles', 'LG SB CR', 4),
        ('Triángulos, banderas y rectángulos', 'Reconocer figuras de continuación', 'LG EM SB', 4),
        ('Rupturas falsas', 'Evitar entrar en una ruptura que no se confirma', 'SB ES ST', 4),
    ]),
    ('u22', 'Indicadores', [
        ('Medias móviles', 'Calcular y leer una media simple y exponencial', 'CA LG SB', 3),
        ('Cruce dorado y cruce de la muerte', 'Saber qué señalan y sus limitaciones', 'LG SB VF', 3),
        ('El RSI', 'Leer sobrecompra, sobreventa y divergencias', 'LG SB TE', 4),
        ('El MACD', 'Leer cruces e histograma', 'LG SB HU', 4),
        ('Bandas de Bollinger y ATR', 'Medir la volatilidad en un gráfico', 'LG CA ST', 4),
        ('Fibonacci sin magia', 'Usar retrocesos como zonas, no como predicciones', 'PG LG VF', 4),
        ('Volumen avanzado: OBV y VWAP', 'Usar el volumen acumulado y el precio medio ponderado', 'LG CA SB', 4),
    ]),
    ('u23', 'Juntarlo todo', [
        ('Confluencia: señales que se confirman', 'Combinar tendencia, nivel y volumen', 'LG SB MU', 4),
        ('Varias temporalidades', 'Analizar de arriba abajo', 'LG OR SB', 4),
        ('El backtesting', 'Probar una regla con datos pasados y sus trampas', 'CA TE ES', 4),
        ('¿Funciona el análisis técnico?', 'Conocer la evidencia académica a favor y en contra', 'VF TE ES', 3),
    ]),
]))

S.append(('s8', 'Riesgo, estrategias y trading', ['s7'], [
    ('u24', 'Gestión del riesgo', [
        ('Por qué el riesgo importa más que acertar', 'Ver que se puede ganar acertando menos de la mitad', 'CA SB TE', 3),
        ('Las matemáticas de las pérdidas', 'Calcular cuánto hay que ganar para recuperar una caída', 'CA CR VF', 2),
        ('La regla del 1 %', 'Arriesgar poco por operación', 'CA ES TE', 3),
        ('El tamaño de la posición', 'Calcular cuántas acciones comprar según el stop', 'CA ST SI', 4),
        ('Dónde poner el stop loss', 'Colocar el stop por estructura o por volatilidad', 'ST LG ES', 4),
        ('Pensar en R: riesgo y beneficio', 'Medir operaciones en múltiplos de riesgo', 'CA ST TE', 4),
        ('La esperanza matemática', 'Calcular si un sistema gana a largo plazo', 'CA TE ES', 4),
    ]),
    ('u25', 'Estrategias', [
        ('Comprar y mantener', 'Conocer la estrategia con más evidencia a largo plazo', 'LG CA TE', 2),
        ('Aportaciones periódicas (DCA)', 'Comparar DCA con invertir de golpe', 'CA SB ES', 2),
        ('Value investing al estilo Buffett', 'Conocer la inversión en valor y el margen de seguridad', 'ES CA TE', 3),
        ('Invertir por dividendos', 'Ver ventajas y trampas de vivir de dividendos', 'CA DE TE', 3),
        ('Seguir la tendencia y el momentum', 'Entender estrategias de tendencia', 'LG SB TE', 4),
        ('Swing trading', 'Entender operaciones de días o semanas', 'LG ST SI', 4),
        ('Day trading: lo que dicen los datos', 'Conocer los estudios sobre day traders', 'VF TE ES', 4),
        ('Apalancamiento y cortos', 'Ver cómo multiplican pérdidas y ganancias', 'CA ES VF', 5),
        ('Elegir tu estrategia', 'Relacionar estrategia, tiempo y personalidad', 'ES CH TE', 3),
    ]),
    ('u26', 'Tu plan de trading', [
        ('El plan de trading', 'Escribir reglas de entrada, salida y riesgo', 'OR HU CH', 4),
        ('El diario de operaciones', 'Registrar operaciones para aprender', 'EM TE ES', 3),
        ('Rachas de pérdidas y drawdown', 'Calcular rachas probables y no abandonar el plan', 'CA TE ES', 4),
        ('Del simulador al dinero real', 'Saber qué cambia con dinero de verdad', 'ES VF CH', 3),
    ]),
]))

S.append(('s9', 'Psicología del inversor', ['s2'], [
    ('u27', 'Los sesgos que cuestan dinero', [
        ('Tu cerebro no está hecho para invertir', 'Entender los dos sistemas de pensamiento', 'TE ES CH', 2),
        ('Aversión a la pérdida', 'Ver por qué duele más perder que ganar', 'ES CA TE', 2),
        ('El efecto disposición', 'Detectar que vendes lo que gana y aguantas lo que pierde', 'ES SI TE', 3),
        ('FOMO y efecto rebaño', 'Reconocer la presión de comprar lo que sube', 'ES SB DE', 2),
        ('Exceso de confianza', 'Comprobar que acertar dos veces no te hace experto', 'SB CR TE', 3),
        ('Anclaje y confirmación', 'Detectar que te aferras a un precio o una idea', 'ES TE EM', 3),
        ('Recencia y supervivencia', 'Entender por qué el pasado reciente engaña', 'ES LG TE', 3),
    ]),
    ('u28', 'Emociones y hábitos', [
        ('Miedo y avaricia', 'Reconocer las emociones del ciclo de mercado', 'LG ES TE', 2),
        ('Operar por venganza', 'Parar después de una pérdida', 'ES CH VF', 3),
        ('Operar demasiado', 'Ver cómo las comisiones y el ruido destruyen rentabilidad', 'CA ES TE', 3),
        ('Tu sistema anti-sesgos', 'Crear reglas escritas antes de operar', 'OR CH MU', 3),
    ]),
]))

S.append(('s10', 'Construir tu cartera', ['s3', 's9'], [
    ('u29', 'Diversificación', [
        ('Diversificar: lo único gratis en finanzas', 'Ver cómo baja el riesgo al combinar activos', 'CT CA TE', 2),
        ('La correlación', 'Entender por qué unos activos protegen a otros', 'LG EM TE', 3),
        ('Tu reparto de activos', 'Elegir el peso de acciones y bonos según tu horizonte', 'CT ES CA', 3),
        ('Diversificar por países y divisas', 'Evitar el sesgo de invertir solo en casa', 'CT TE VF', 3),
        ('Carteras sencillas con indexados', 'Conocer carteras de 1, 2 y 3 fondos', 'CT EM TE', 3),
        ('Factores: tamaño, valor, calidad y momentum', 'Saber qué son los factores y su evidencia', 'EM LG TE', 4),
        ('Inversión sostenible (ESG)', 'Entender qué mide el ESG y sus límites', 'TE VF ES', 3),
    ]),
    ('u30', 'Gestionar tu cartera', [
        ('Rebalancear', 'Volver al reparto objetivo y cuándo hacerlo', 'CT CA ES', 3),
        ('El coste de las comisiones a largo plazo', 'Comparar el resultado de 0,2 % y 1,8 % en 30 años', 'CA TE VF', 2),
        ('Invertir con poco: 50 € al mes', 'Ver que se puede empezar con poco y el efecto del tiempo', 'CA CT ES', 2),
        ('Medir tu rentabilidad bien', 'Distinguir rentabilidad simple, anualizada y ponderada', 'CA TE HU', 4),
        ('Tu Declaración de Política de Inversión', 'Escribir tu plan por escrito', 'OR CH HU', 3),
        ('Reto: tu cartera de 10.000 €', 'Construir y defender una cartera diversificada', 'CT SI ES', 3),
    ]),
]))

S.append(('s11', 'España: impuestos y estafas', ['s3'], [
    ('u31', 'Fiscalidad de tus inversiones', [
        ('La base del ahorro y sus tramos', 'Saber cuánto tributa una ganancia en España', 'CA TE HU', 3),
        ('Ganancias, pérdidas y compensación', 'Compensar pérdidas con ganancias', 'CA ES TE', 3),
        ('La regla de los dos meses', 'Evitar perder la compensación al recomprar', 'ES VF TE', 3),
        ('Traspasos de fondos sin pagar impuestos', 'Entender la ventaja fiscal de los fondos frente a los ETFs', 'EM TE ES', 3),
        ('Dividendos y doble imposición', 'Recuperar retenciones en origen', 'CA TE VF', 4),
        ('Cripto y modelos 720 y 721', 'Conocer las obligaciones de informar', 'TE MU VF', 4),
    ]),
    ('u32', 'Estafas y cómo detectarlas', [
        ('Chiringuitos financieros', 'Consultar la lista de la CNMV antes de invertir', 'DE OR TE', 2),
        ('Esquemas Ponzi y piramidales', 'Reconocer rentabilidades imposibles', 'DE ES TE', 2),
        ('Pump and dump y grupos de señales', 'Detectar manipulación en Telegram y redes', 'DE ES VF', 3),
        ('Phishing y suplantación', 'Proteger tus cuentas y claves', 'DE MU TE', 2),
        ('Finfluencers y publicidad', 'Saber qué puede y qué no puede decir un influencer', 'DE TE ES', 2),
        ('Si te han estafado', 'Saber qué hacer y dónde reclamar', 'OR TE VF', 2),
    ]),
    ('u_broker', 'Elegir dónde invertir', [
        ('Cómo elegir un bróker', 'Comprobar regulación, garantías y costes', 'OR MU TE', 2),
        ('Las comisiones de un bróker', 'Comparar compraventa, custodia y cambio de divisa', 'CA EM TE', 2),
        ('Neobrókers: cómo ganan dinero', 'Entender el pago por flujo de órdenes y otros ingresos', 'TE ES VF', 3),
        ('Robo-advisors y gestión automatizada', 'Comparar gestión automatizada con hacerlo tú', 'EM TE ES', 2),
    ]),
]))

S.append(('s12', 'Historia de crisis y burbujas', ['s9'], [
    ('u33', 'Burbujas y crisis', [
        ('Tulipanes y la Compañía de los Mares del Sur', 'Reconocer el patrón eterno de las burbujas', 'OR TE ES', 2),
        ('El crack de 1929', 'Ver cuánto tardó en recuperarse el mercado', 'LG SB TE', 3),
        ('La burbuja puntocom', 'Ver qué pasó con el Nasdaq de 2000 a 2015', 'LG SB ES', 3),
        ('La crisis de 2008', 'Entender las hipotecas subprime y la caída de Lehman', 'OR ES TE', 3),
        ('Japón 1989: treinta años para recuperar', 'Ver que los índices también pueden tardar décadas', 'LG SB TE', 3),
        ('España: burbuja inmobiliaria y prima de riesgo', 'Conocer la crisis de 2010-2012 en España', 'LG TE ES', 3),
        ('El crash del COVID en 2020', 'Ver la caída y recuperación más rápidas', 'SB LG ES', 3),
        ('Cripto 2022: Terra y FTX', 'Aprender del colapso de 2022', 'ES DE TE', 3),
        ('Qué tienen en común todas las crisis', 'Extraer reglas para la siguiente', 'MU CH ES', 3),
    ]),
]))

S.append(('s13', 'Laboratorio de mercado', ['s7', 's8'], [
    ('u34', 'Retos con datos reales', [
        ('¿Sube o baja? Acciones', 'Predecir con histórico real y ver qué pasó', 'SB LG CR', 3),
        ('¿Sube o baja? Cripto', 'Comprobar lo difícil que es predecir la cripto', 'SB CA ES', 3),
        ('¿Sube o baja? Divisas y oro', 'Predecir activos refugio con histórico real', 'SB LG TE', 3),
        ('Encuentra la vela', 'Localizar patrones de velas en gráficos reales', 'PG LG CR', 3),
        ('Marca el soporte', 'Encontrar niveles en gráficos reales', 'PG SB CR', 3),
        ('Coloca tu stop', 'Colocar stop y objetivo en un gráfico real', 'ST LG SI', 4),
        ('Noticias y reacciones', 'Decidir ante una noticia real y ver la reacción del mercado', 'ES SB TE', 4),
        ('Operación completa', 'Planificar, ejecutar y revisar una operación simulada', 'SI ST OR', 4),
        ('El reto de la semana', 'Gestionar una cartera virtual durante una semana', 'CT SI ES', 4),
    ]),
]))

# Vocabulario: unidad aparte, como ahora (se puede hacer en cualquier momento)
SIDE = ('vocab', 'Vocabulario del inversor', [
    ('El dinero y el ahorro', 'Repasar palabras clave del ahorro', 'EM HU CR', 1),
    ('La bolsa por dentro', 'Repasar palabras clave de los mercados', 'HU TE VF', 1),
    ('Fondos, ETFs y bonos', 'Repasar palabras de productos', 'EM CR TE', 2),
    ('Riesgo y cartera', 'Repasar palabras de riesgo', 'HU EM VF', 2),
    ('Gráficos y velas', 'Repasar palabras de gráficos', 'EM TE CR', 2),
    ('Indicadores técnicos', 'Repasar palabras de indicadores', 'HU VF CR', 3),
    ('Trading y gestión del riesgo', 'Repasar palabras de trading', 'EM HU TE', 3),
    ('Los sesgos que cuestan dinero', 'Repasar los nombres de los sesgos', 'TE CR VF', 2),
    ('Empresas y valoración', 'Repasar palabras de análisis fundamental', 'EM HU CR', 3),
    ('Invertir desde España', 'Repasar palabras de impuestos y regulación', 'HU TE CR', 2),
])


def main():
    out, rows, n = {'types': TYPES, 'sections': []}, [], 0
    lessons_total = reviews = bosses = 0
    un = 0
    for sid, stitle, req, units in S:
        sec = {'id': sid, 'title': stitle, 'requires': req, 'units': []}
        for _, utitle, lessons in units:
            un += 1
            uid = f'u{un}'
            unit = {'id': uid, 'title': utitle, 'lessons': []}
            for i, (title, goal, types, diff) in enumerate(lessons, 1):
                n += 1
                lid = f'{uid}l{i}'
                unit['lessons'].append({'id': lid, 'title': title, 'goal': goal, 'types': types.split(), 'difficulty': diff, 'requires': f'{uid}l{i - 1}' if i > 1 else None})
                rows.append((stitle, utitle, n, title, goal, types.replace(' ', ', '), diff))
                lessons_total += 1
            unit['lessons'].append({'id': f'{uid}r', 'title': 'Repaso de la unidad', 'goal': 'Repasar con repetición espaciada los errores de la unidad', 'types': ['RP', 'CR'], 'difficulty': max(l[3] for l in lessons), 'review': True})
            rows.append((stitle, utitle, '—', 'Repaso de la unidad', 'Repasar los errores de la unidad (repetición espaciada)', 'RP, CR + mezcla', max(l[3] for l in lessons)))
            reviews += 1
            sec['units'].append(unit)
        sec['boss'] = {'id': f'{sid}boss', 'title': f'Reto final: {stitle}', 'types': ['CR', 'ES', 'SB', 'mezcla'], 'passPct': 80}
        rows.append((stitle, '—', '—', f'**Reto final de la sección**', 'Demostrar el dominio de la sección (aprobar con 80 %)', 'CR, ES, SB + mezcla', max(l[3] for _, _, ls in units for l in ls)))
        bosses += 1
        out['sections'].append(sec)
    side = {'id': SIDE[0], 'title': SIDE[1], 'side': True, 'lessons': [{'id': f'{SIDE[0]}l{i}', 'title': t, 'goal': g, 'types': ty.split(), 'difficulty': d} for i, (t, g, ty, d) in enumerate(SIDE[2], 1)]}
    out['side'] = side
    for i, (t, g, ty, d) in enumerate(SIDE[2], 1):
        n += 1
        rows.append(('Vocabulario (aparte)', SIDE[1], n, t, g, ty.replace(' ', ', '), d))
        lessons_total += 1
    out['totals'] = {'lessons': lessons_total, 'unitReviews': reviews, 'sectionBosses': bosses, 'units': sum(len(s['units']) for s in out['sections']) + 1, 'sections': len(out['sections'])}
    json.dump(out, open(os.path.join(ROOT, 'docs/curso-v2/curriculo.json'), 'w'), ensure_ascii=False, indent=1)

    # Tipos usados
    used = {}
    for r in rows:
        for t in r[5].replace(' + mezcla', '').split(', '):
            if t in TYPES:
                used[t] = used.get(t, 0) + 1
    md = ['# 02 · Mapa del currículo (Fase 2)', '',
          f"**{lessons_total} clases** en {out['totals']['sections']} secciones y {out['totals']['units']} unidades, más **{reviews} repasos de unidad** y **{bosses} retos finales de sección**. "
          'Cada clase dura 3-6 minutos y tiene 8-15 ejercicios de al menos 3 tipos.', '',
          '## Qué pasa con las 119 clases actuales', '',
          '- Unas **110 se reaprovechan**: su teoría y sus preguntas pasan a la clase equivalente del mapa nuevo, con ejercicios de los tipos nuevos y repartidas en clases más cortas.',
          '- Unas **115 clases son nuevas**: presupuesto y deudas, bonos, productos, cripto en profundidad, divisas y materias primas, fiscalidad, estafas, historia de las crisis, elegir bróker y el laboratorio de mercado.',
          '- El progreso de quien ya ha hecho clases se conserva: cada clase antigua se asigna a su equivalente nueva.',
          '- Qué es gratis y qué es de pago se decide en la Fase 4 (gamificación y planes).', '',
          '## Cómo se desbloquea', '',
          '- Dentro de una unidad, las clases van en orden. El repaso de la unidad se abre al terminar todas sus clases.',
          '- El **reto final** de una sección se abre al terminar sus unidades; aprobarlo (80 %) desbloquea las secciones que dependen de ella.',
          '- Secciones que dependen de otra (se pueden hacer en paralelo cuando se cumplen sus requisitos):', '']
    for sid, st, req, _ in S:
        md.append(f"  - **{sid.upper()} · {st}** ← {', '.join(r.upper() for r in req) if req else 'ninguna (inicio)'}")
    md += ['- El vocabulario es una unidad aparte: se puede hacer en cualquier momento.', '',
           '## Leyenda de tipos de ejercicio', '', '| Código | Tipo | Veces en el mapa |', '|---|---|---|']
    md += [f'| {k} | {v} | {used.get(k, 0)} |' for k, v in TYPES.items()]
    md += ['', 'Dificultad: 1 = principiante absoluto · 5 = avanzado.', '', '## Mapa completo', '',
           '| Sección | Unidad | Nº | Clase | Objetivo | Tipos | Dif. |', '|---|---|---|---|---|---|---|']
    md += [f'| {a} | {b} | {c} | {d} | {e} | {f} | {g} |' for a, b, c, d, e, f, g in rows]
    open(os.path.join(ROOT, 'docs/curso-v2/02-curriculo.md'), 'w').write('\n'.join(md) + '\n')
    print(out['totals'], 'tipos usados', len(used))


if __name__ == '__main__':
    main()
