import 'server-only'
// Unidad 10 · Gestión del riesgo y plan de trading (docs/curso/10).
// Gratis 10.1–10.3: aprobar u10l3 desbloquea las órdenes límite, stop loss y take profit (RISK_LESSON).
import { fill, img, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u10', order: 10, title: 'Gestión del riesgo', description: 'Tamaño de posición, stop loss, esperanza matemática y tu plan',
  unlocksFeature: 'STOP_LOSS',
  lessons: [
    lesson('u10l1', 'Por qué el riesgo importa más que acertar', [
      text('La pregunta del profesional', 'El principiante pregunta "¿qué compro?". El profesional, "**¿cuánto pierdo si me equivoco?**".\n\nNadie sabe si una operación saldrá bien. Lo único que controlas es cuánto arriesgas.'),
      text('Diez pérdidas seguidas', 'Pasan, incluso con un buen sistema. Lo que te queda según el riesgo por operación:\n\n• 1 %: **90,4 %** (recuperas con +10,6 %)\n• 2 %: 81,7 % (+22,4 %)\n• 5 %: 59,9 % (+67 %)\n• 10 %: **34,9 %** (+187 %)'),
      key('Sobrevivir primero', 'Quien arriesga mucho por operación acaba encadenando pérdidas que le sacan del juego.', 'Puedes acertar el 60 % y arruinarte, o acertar el 40 % y ganar: decide cuánto ganas al acertar y cuánto pierdes al fallar.', 'No controlas si aciertas. Controlas cuánto pierdes cuando fallas.'),
    ], [
      single('Tras 10 pérdidas seguidas arriesgando un 10 % por operación, ¿cuánto te queda?', ['90 %', 'Unos dos tercios', 'Alrededor de un 35 %'], 2, '0,9¹⁰ ≈ 34,9 %: necesitarías ganar un 187 %.'),
      single('¿Qué es lo único que controlas en cada operación?', ['Si saldrá bien', 'Cuánto arriesgas', 'Lo que hará el mercado'], 1, 'Por eso la gestión del riesgo depende 100 % de ti.'),
      tf('Con un riesgo del 1 % por operación, 10 pérdidas seguidas te dejan con un 90 % de la cuenta.', true, '0,99¹⁰ ≈ 90,4 %.'),
      single('¿Cuál es el primer objetivo de un trader?', ['Acertar mucho', 'Sobrevivir para que su ventaja actúe', 'Operar mucho'], 1, 'Sin capital no hay segunda oportunidad.'),
    ], { source: '10.1', xp: 35 }),

    lesson('u10l2', 'El tamaño de la posición: la regla del 1 %', [
      text('La fórmula', '**Tamaño = (capital × % de riesgo) ÷ (entrada − stop)**\n\nPrimero decides dónde está el stop; después, cuántas acciones compras.'),
      text('El ejemplo', 'Capital 10.000 €, riesgo 1 % = **100 €**. Entrada 50 €, stop 47 €: distancia 3 €.\n\nTamaño = 100 ÷ 3 = **33 acciones** (unos 1.650 €). Si salta el stop, pierdes 99 €: un 1 % de la cuenta.'),
      text('Riesgo no es cantidad invertida', 'Con un stop a 1 € podrías comprar 100 acciones arriesgando lo mismo; con uno a 10 €, solo 10.\n\nLos profesionales arriesgan del 0,5 % al 2 % por operación. Para empezar: **1 % o menos**, y no más del 5–6 % de riesgo abierto en total.'),
      sim('Calcula tu tamaño', 'Antes de comprar, decide el stop y usa la fórmula.', 'Con el valor de tu cartera simulada, calcula cuántas acciones comprarías arriesgando un 1 %.'),
      key('Lo que te llevas', 'Así cada operación arriesga lo mismo, sea cual sea el activo.', 'No decides cuánto compras: lo decide la distancia a tu stop.', 'Primero dónde te equivocas; después, cuántas acciones.'),
    ], [
      fill('Capital 20.000 €, riesgo 1 %, entrada 80 €, stop 76 €: compras ____ acciones.', '50', ['25', '250', '100'], '200 € ÷ 4 € = 50 acciones.'),
      tf('Riesgo por operación y cantidad invertida son lo mismo.', false, 'Puedes invertir el 16 % de tu capital arriesgando un 1 %.'),
      single('Si el stop está más lejos, para arriesgar lo mismo debes comprar…', ['Más acciones', 'Menos acciones', 'Las mismas'], 1, 'Más distancia por acción = menos acciones.'),
      single('¿Cuánto suelen arriesgar los profesionales por operación?', ['Del 0,5 % al 2 %', 'Del 10 % al 20 %', 'Todo'], 0, 'Para empezar, un 1 % o menos.'),
    ], { source: '10.2', xp: 40 }),

    lesson('u10l3', 'Dónde poner el stop loss', [
      text('Tres métodos', '1. **Estructural:** al otro lado de un nivel; si compras en un soporte, por debajo de él o del mínimo de la vela de giro.\n2. **Por volatilidad:** a 2–3 veces el **ATR** (rango medio de 14 velas), para que no te saque el ruido.\n3. **Por tiempo:** si en 10 sesiones no hace lo previsto, sales.'),
      text('Errores típicos', '• Stop demasiado cerca: te saca el ruido.\n• En números redondos obvios.\n• **Alejarlo** cuando el precio se acerca: convierte una pérdida pequeña en grande.\n• No ponerlo "porque ya se recuperará".'),
      text('Proteger ganancias', 'Si va a favor, súbelo: al precio de entrada, bajo el último mínimo creciente o con un stop dinámico.\n\nY recuerda: con un hueco de precio, el stop se ejecuta peor. Evita posiciones grandes antes de resultados.'),
      sim('Desbloquea el stop loss', 'Al aprobar esta lección se desbloquean en el Mercado las órdenes límite, stop loss y take profit.', 'Compra cualquier activo con un stop loss estructural y un take profit al doble de distancia.'),
      key('La regla de oro', 'Nunca se aleja un stop: solo se acerca a favor.', 'El stop va donde tu idea deja de ser válida, no donde te duele perder.', 'El stop no es donde te duele: es donde tu idea muere.'),
    ], [
      single('Compras en un soporte. ¿Dónde va un stop estructural?', ['Por debajo del soporte o del mínimo de la vela de giro', 'Justo en el precio de entrada', 'En un número redondo cualquiera'], 0, 'Si el precio pierde el soporte, tu idea era errónea.'),
      single('El precio se acerca a tu stop. ¿Qué no debes hacer nunca?', ['Dejarlo donde está', 'Alejarlo para darle espacio', 'Cerrar si tu plan lo dice'], 1, 'Es la forma más rápida de convertir una pérdida pequeña en grande.'),
      fill('El rango medio de las últimas 14 velas, útil para colocar stops, se llama ____.', 'ATR', ['RSI', 'MACD', 'PER'], 'Average True Range, de Wilder.'),
      tf('Un stop garantiza el precio exacto de salida.', false, 'Con un hueco de precio, se ejecuta al primer precio disponible.'),
      single('La operación va a favor. ¿Qué puedes hacer con el stop?', ['Subirlo para proteger ganancias', 'Quitarlo', 'Bajarlo'], 0, 'Al precio de entrada o bajo el último mínimo creciente.'),
    ], { source: '10.3', xp: 50 }),

    lesson('u10l4', 'Pensar en R', [
      text('Qué es R', '**1R** es lo que arriesgas en una operación (distancia al stop × tamaño). Si arriesgas 100 €:\n\n• Salta el stop: **−1R**.\n• Ganas 250 €: **+2,5R**.\n• Sales antes perdiendo 40 €: **−0,4R**.'),
      img('riskreward', 'La relación beneficio/riesgo', 'Entrada 50 €, stop 47 € (riesgo 3 €), objetivo 59 € (+9 €): relación **3:1**.\n\nMuchos operadores no entran por debajo de **2:1**.'),
      key('Lo que te llevas', 'Medir en R te deja comparar operaciones de cualquier tamaño.', 'Si arriesgas 100 € y ganas 300 €, has ganado 3R.', 'No cuentes euros: cuenta R.'),
    ], [
      fill('Arriesgas 150 € y ganas 450 €: has ganado ____R.', '3', ['1', '2', '4,5'], '450 ÷ 150 = 3R.'),
      single('Entrada 20 €, stop 19 €, objetivo 23 €. ¿Relación beneficio/riesgo?', ['1:1', '2:1', '3:1'], 2, 'Riesgo 1 €, beneficio potencial 3 €.'),
      tf('Si salta el stop, el resultado es −1R.', true, 'Por definición, 1R es lo que arriesgas.'),
      single('¿Por debajo de qué relación muchos operadores no entran?', ['1:2', '2:1', '10:1'], 1, 'Para que los aciertos compensen los fallos.'),
    ], { source: '10.4', xp: 40 }),

    lesson('u10l5', 'La esperanza matemática', [
      text('La fórmula', '**Esperanza = (% acierto × ganancia media) − (% fallo × pérdida media)**, en R.'),
      text('Cuatro sistemas', '• A: 40 % de acierto, gana 2R → **+0,2R** ✓\n• B: 60 %, gana 0,5R → **−0,1R** ✗\n• C: 30 %, gana 3R → **+0,2R** ✓\n• D: 50 %, gana 1R → **0** (y negativo tras costes)\n\nB acierta mucho y pierde. C acierta poco y gana.'),
      text('Los costes', 'Comisión, *spread* y financiación. Si tu esperanza es +0,1R y los costes 0,15R, pierdes. Cuantas más operaciones, más pesan: por eso fracasa tanto el *day trading*.'),
      key('Cuánto se puede ganar', 'Con +0,2R, un 1 % de riesgo y 100 operaciones al año: unos 20R, un 20 % anual con rachas malas por el camino. Una ventaja así ya es muy buena.', 'Un sistema gana si, de media, cada operación gana más de lo que pierde, contando aciertos y fallos.', 'No necesitas acertar mucho: necesitas que tus aciertos valgan más que tus fallos.'),
    ], [
      single('Aciertas el 45 %, ganas 2R de media y pierdes 1R. ¿Tu esperanza?', ['−0,1R', '+0,35R', '+0,9R'], 1, '0,45 × 2 − 0,55 × 1 = 0,35R.'),
      single('Un sistema acierta el 70 %, gana 0,4R y pierde 1R. ¿Es rentable?', ['Sí, acierta mucho', 'No: 0,7 × 0,4 − 0,3 × 1 = −0,02R'], 1, 'Acertar mucho no basta.'),
      tf('Un sistema que acierta solo el 30 % puede ser rentable.', true, 'Si gana 3R de media y pierde 1R: +0,2R.'),
      single('¿Por qué el day trading fracasa tanto?', ['Porque los costes pesan más cuantas más operaciones', 'Porque es ilegal', 'Porque no hay volumen'], 0, 'Una ventaja pequeña se la comen los costes.'),
    ], { source: '10.5', xp: 40 }),

    lesson('u10l6', 'Rachas de pérdidas', [
      text('Lo que dice la simulación', '20.000 secuencias de 100 operaciones:\n\n• Con un 50 % de acierto, la racha de pérdidas típica es de **6 seguidas**.\n• Con un 40 % (como el sistema A, que es rentable), de **7**, y casi la mitad de las veces hay **8 o más**.'),
      text('Qué hacer con esto', '1. Prepárate: 8 pérdidas seguidas no significan que el sistema haya muerto.\n2. Arriesga poco: con un 1 %, 8 pérdidas son un −7,7 %.\n3. No cambies de sistema tras cada racha.\n4. Define cuándo parar: si caes un 10–15 % desde el máximo, reduce el riesgo a la mitad y revisa.'),
      key('Lo que te llevas', 'Las rachas son estadística, no mala suerte personal.', 'Con un 50 % de acierto, encadenar 6 pérdidas en 100 operaciones es lo normal.', 'Ocho fallos seguidos no significan que el plan esté mal.'),
    ], [
      single('Con un 50 % de acierto, ¿es raro encadenar 6 pérdidas en 100 operaciones?', ['Sí, casi imposible', 'No, es lo habitual'], 1, 'Es la racha típica.'),
      fill('Con un riesgo del 1 % por operación, 8 pérdidas seguidas suponen una caída de alrededor del ____ %.', '7,7', ['1', '8', '50'], '0,99⁸ ≈ 92,3 %.'),
      tf('Tras una racha de pérdidas conviene cambiar de sistema enseguida.', false, 'Así nunca sabrás si alguno funcionaba.'),
      single('Tu cuenta cae un 15 % desde su máximo. ¿Qué es prudente?', ['Doblar el riesgo para recuperar', 'Reducir el riesgo a la mitad y revisar el plan', 'Dejar de usar stops'], 1, 'Proteges el capital mientras analizas.'),
    ], { source: '10.6', xp: 40 }),

    lesson('u10l7', 'Apalancamiento, CFD y cortos', [
      text('Qué es el apalancamiento', 'Operar con más dinero del que tienes. Con 1:10, con 1.000 € controlas 10.000 €:\n\n• +5 %: ganas un 50 %.\n• −5 %: pierdes un 50 %.\n• −10 %: lo pierdes **todo**.'),
      text('Los CFD', 'Contratos apalancados que replican un activo sin poseerlo. Entre el **74 % y el 89 %** de las cuentas minoristas pierde (ESMA). Desde 2018 en la UE: apalancamiento máximo 1:30 en divisas principales y **1:2 en cripto**, cierre si el margen baja del 50 % y no puedes perder más de lo depositado.'),
      text('Ponerse corto', 'Vender lo que no tienes para recomprarlo más barato. La pérdida potencial es **ilimitada** (el precio puede subir sin techo), pagas el préstamo y los dividendos, y puede haber subidas violentas como GameStop en 2021.'),
      key('La recomendación del curso', 'Mientras aprendes: sin apalancamiento y sin cortos.', 'El apalancamiento multiplica ganancias y pérdidas por igual, pero las pérdidas grandes te sacan del juego.', 'El apalancamiento no te hace mejor: hace que tus errores lleguen antes.'),
    ], [
      single('Con apalancamiento 1:10, ¿qué movimiento en contra se lleva todo tu margen?', ['1 %', '10 %', '50 %'], 1, '1 ÷ 10 = 10 %.'),
      single('¿Qué apalancamiento máximo tiene un minorista en la UE para criptomonedas en CFD?', ['1:2', '1:30', '1:100'], 0, 'Es el más bajo por su volatilidad.'),
      tf('La pérdida de una posición corta está limitada al dinero invertido.', false, 'El precio puede subir sin límite.'),
      multi('¿Qué protecciones tienen los minoristas de CFD en la UE? Marca todas.', ['No perder más de lo depositado', 'Apalancamiento limitado', 'Cierre si el margen baja del 50 %', 'Ganancia garantizada'], [0, 1, 2], 'Nadie garantiza ganancias.'),
    ], { source: '10.7', xp: 40 }),

    lesson('u10l8', 'Tu plan de trading y tu diario', [
      text('El plan', '1. Capital dedicado (máximo % del patrimonio).\n2. Mercados y temporalidad.\n3. Entrada: reglas concretas.\n4. Stop.\n5. Tamaño: 1 % por operación.\n6. Salida.\n7. Lo que no haces.\n8. Límites: si pierdes un 6 % en un mes, paras.\n9. Revisión cada 20 operaciones.'),
      text('El diario', 'Para cada operación: fecha, activo, motivo según el plan, entrada, stop, objetivo, tamaño, resultado en € y en R, si seguiste el plan, tu emoción y una captura.'),
      text('Lo que sale del diario', '• % de acierto.\n• Ganancia y pérdida media en R.\n• **Esperanza.**\n• Racha y caída máximas.\n• Resultado de las operaciones dentro del plan frente a las que lo saltaron.'),
      key('Lo que te llevas', 'Tu historial de órdenes en E-Trading es el punto de partida de tu diario.', 'Si no está escrito, no es un plan: es una intuición.', 'Tu diario te enseña los errores que tu memoria prefiere olvidar.'),
    ], [
      multi('¿Qué debe incluir un plan de trading? Marca todo.', ['Reglas de entrada', 'Dónde va el stop', 'Tamaño por operación', 'Una predicción de la bolsa'], [0, 1, 2], 'Un plan son reglas, no predicciones.'),
      single('¿Qué estadística del diario dice si tu sistema gana?', ['El número de operaciones', 'La esperanza matemática', 'La hora de entrada'], 1, 'Combina acierto, ganancia media y pérdida media.'),
      tf('Comparar las operaciones dentro del plan con las que lo saltaron suele ser revelador.', true, 'Muchas veces las pérdidas grandes vienen de saltarse el plan.'),
      single('Pierdes un 6 % en un mes. Según el plan de ejemplo…', ['Paras hasta el mes siguiente', 'Doblas el tamaño', 'Quitas los stops'], 0, 'Los límites te protegen de operar por venganza.'),
    ], { source: '10.8', xp: 40 }),

    lesson('u10l9', 'Del papel al dinero real', [
      text('Las cuatro fases', '1. **Prueba histórica:** 50–100 operaciones según tus reglas.\n2. **Fuera de muestra:** otros activos u otro periodo, sin cambiar reglas.\n3. **Simulador en tiempo real:** 2–3 meses.\n4. **Dinero real poco a poco:** una fracción y la mitad del riesgo.'),
      text('Las trampas', '• **Sobreoptimizar:** ajustar parámetros hasta que el pasado sale perfecto.\n• **Muestra pequeña:** 15 aciertos pueden ser suerte.\n• **Supervivencia:** olvidar las empresas que quebraron.\n• **Olvidar costes** y deslizamiento.\n• **Retrospectiva:** en el pasado todo "se ve" claro.'),
      text('Cuándo dejarlo', 'Si tras 100 operaciones bien registradas tu esperanza tras costes es negativa o casi cero, no tienes ventaja. No es un fracaso: es información. La inversión a largo plazo (unidad 4) sigue siendo la opción con más probabilidades.'),
      key('Lo que te llevas', 'Empieza pequeño y compara siempre las estadísticas reales con las de la prueba.', 'Un sistema no está probado hasta que funciona en datos nuevos y con suficientes operaciones.', 'En el simulador se aprende a operar. En el dinero real se aprende quién eres.'),
    ], [
      order('Ordena las fases para validar un sistema.', ['Prueba histórica', 'Prueba fuera de muestra', 'Simulador en tiempo real', 'Dinero real pequeño'], 'Cada fase elimina un tipo de autoengaño.'),
      single('¿Qué es sobreoptimizar?', ['Ajustar parámetros hasta que el pasado salga perfecto', 'Arriesgar poco', 'Usar stops'], 0, 'Funciona en el pasado y falla en el futuro.'),
      single('Raúl gana 12 de sus 15 primeras operaciones y quiere arriesgar un 10 %. ¿Qué le dices?', ['Adelante, su sistema funciona', 'Son pocas operaciones: puede ser suerte; sigue con un 1 %', 'Que use apalancamiento'], 1, 'Una racha normal de 6–8 pérdidas le haría perder más de la mitad.'),
      tf('Si tras 100 operaciones tu esperanza tras costes es negativa, no tienes ventaja.', true, 'Y la inversión a largo plazo sigue siendo una gran opción.'),
    ], { source: '10.9', xp: 40 }),
  ],
})
