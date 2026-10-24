import 'server-only'
// Unidad 11 · Psicología del inversor (docs/curso/11). Premium.
import { fill, key, lesson, multi, order, sim, single, text, tf, unit } from '../dsl'

export default unit({
  id: 'u11', order: 11, title: 'Psicología del inversor', description: 'Sesgos, emociones y reglas para protegerte de ti mismo', premiumOnly: true,
  lessons: [
    lesson('u11l1', 'Tu cerebro no está hecho para invertir', [
      text('Los dos sistemas', 'Daniel Kahneman (Nobel de Economía):\n\n• **Sistema 1:** rápido, intuitivo, emocional. Útil para esquivar un coche.\n• **Sistema 2:** lento y analítico. Útil para calcular una esperanza.\n\nEn bolsa solemos decidir con el sistema 1: con miedo, prisa o euforia.'),
      text('La brecha del inversor', 'Morningstar, 10 años hasta 2025:\n\n• Los fondos de EE. UU. ganaron un **9,9 %** anual.\n• El dinero de sus inversores, un **8,7 %**: 1,2 puntos menos por comprar y vender en mal momento.\n• En los ETF de bitcoin: inversores −5,8 % frente a +8,5 % del ETF.'),
      key('Lo que te llevas', 'La brecha fue mayor en los fondos más volátiles (−2,1 puntos) que en los tranquilos (−0,4).', 'El cerebro huye del peligro y sigue al grupo: en bolsa eso lleva a vender en las caídas y comprar en las euforias.', 'El mayor riesgo de tu cartera suele estar delante de la pantalla.'),
    ], [
      single('Según Morningstar, ¿cuánto ganó de menos el inversor medio frente a sus fondos al año?', ['Nada', 'Alrededor de 1,2 puntos', '10 puntos'], 1, 'Por comprar y vender en mal momento.'),
      single('¿Dónde fue mayor esa brecha?', ['En los fondos menos volátiles', 'En los más volátiles'], 1, '−2,1 puntos frente a −0,4.'),
      tf('El sistema 1 de Kahneman es lento y analítico.', false, 'Es el rápido, intuitivo y emocional.'),
      single('En los ETF de bitcoin, los inversores obtuvieron…', ['Más que el ETF', 'Mucho menos que el ETF', 'Lo mismo'], 1, 'Compraron en picos y vendieron en caídas.'),
    ], { source: '11.1', xp: 35 }),

    lesson('u11l2', 'Aversión a la pérdida y efecto disposición', [
      text('Aversión a la pérdida', 'Perder 100 € duele aproximadamente **el doble** de lo que alegra ganarlos (Kahneman y Tversky, 1979).\n\nPor eso evitamos vender en pérdidas aunque la empresa empeore, y arriesgamos más cuando perdemos ("doblo para recuperar").'),
      text('Efecto disposición', 'Vendemos mucho antes lo que gana que lo que pierde. Odean (1998) lo midió en miles de cuentas: las ganadoras vendidas siguieron rindiendo **mejor** que las perdedoras conservadas.\n\nJusto lo contrario de "corta las pérdidas y deja correr las ganancias".'),
      text('Cómo protegerte', '• Stop definido antes de entrar.\n• Pregúntate: **"si no la tuviera, ¿la compraría hoy a este precio?"**\n• Al mercado no le importa a cuánto compraste.'),
      key('Lo que te llevas', 'Decide la salida en calma, antes de entrar.', 'Perder duele el doble: por eso vendemos lo que gana y nos aferramos a lo que pierde.', 'Decide con lo que sabes hoy, no con tu precio de compra.'),
    ], [
      single('Según la teoría prospectiva, perder 100 € duele…', ['Lo mismo que alegra ganarlos', 'El doble', 'La mitad'], 1, 'Por eso cuesta tanto vender en pérdidas.'),
      single('¿Qué es el efecto disposición?', ['Vender pronto lo que gana y mantener lo que pierde', 'Comprar lo que sube', 'No invertir nunca'], 0, 'Odean lo midió en miles de cuentas.'),
      fill('La pregunta clave: "si no la tuviera, ¿la ____ hoy a este precio?"', 'compraría', ['vendería', 'regalaría', 'olvidaría'], 'Así decides con lo que sabes hoy.'),
      tf('El precio al que compraste es importante para el mercado.', false, 'Solo es importante para ti, por tus sesgos.'),
    ], { source: '11.2', xp: 35 }),

    lesson('u11l3', 'FOMO y efecto rebaño', [
      text('FOMO', 'Miedo a quedarse fuera cuando algo sube mucho y todos parecen ganar. Es el motor de las burbujas: puntocom (1999), cripto (2017 y 2021), *meme stocks* (2021).'),
      text('Señales de alarma', '• Te enteras por gente que nunca había invertido.\n• La razón es "**sube mucho**".\n• Sientes urgencia.\n• Se dice que "**esta vez es diferente**".\n\nCuando todos han comprado ya, no queda nadie para seguir comprando.'),
      text('Cómo protegerte', '• **Regla de las 48 horas** para toda compra fuera del plan.\n• Límite de especulación de tu Declaración.\n• Pregúntate: "¿lo compraría si nadie hablara de ello?"'),
      key('Lo que te llevas', 'Cuando todo el mundo habla de algo que solo sube, el riesgo suele ser máximo.', 'El FOMO compra en la euforia; las reglas escritas lo frenan.', 'Si tu peluquero te recomienda una cripto, quizá ya es tarde.'),
    ], [
      single('¿Qué regla ayuda contra el FOMO?', ['Comprar enseguida', 'Esperar 48 horas cualquier compra fuera del plan', 'Doblar la posición'], 1, 'La urgencia es el combustible del FOMO.'),
      multi('¿Qué son señales de burbuja? Marca todas.', ['"Esta vez es diferente"', 'Gente sin experiencia recomendándolo', 'La razón es que sube mucho', 'Beneficios crecientes y estables'], [0, 1, 2], 'Los beneficios estables no son una señal de burbuja.'),
      tf('Cuando todo el mundo ya ha comprado, suele quedar mucho recorrido al alza.', false, 'No queda nadie que empuje.'),
      single('¿Qué pregunta te protege del rebaño?', ['¿Cuánto ha subido?', '¿Lo compraría si nadie hablara de ello?', '¿Qué dice el foro?'], 1, 'Separa el valor del ruido.'),
    ], { source: '11.3', xp: 35 }),

    lesson('u11l4', 'Exceso de confianza y confirmación', [
      text('Exceso de confianza', '• Los hogares que más operaban: **11,4 %** anual frente al **17,9 %** del mercado.\n• Los hombres operaban un **45 % más** que las mujeres y perdían más rentabilidad (Barber y Odean, 2001).\n• Unas cuantas ganancias al principio son lo más peligroso: confundes suerte con habilidad.'),
      text('Sesgo de confirmación', 'Tras comprar, lees solo las buenas noticias, sigues a quien opina igual y descartas las críticas. Cuando llegan las alarmas, no las ves.'),
      text('Cómo protegerte', '• Escribe **tres motivos por los que podrías equivocarte**.\n• Busca la opinión contraria.\n• Mide en tu diario, no en tu memoria.\n• Compárate siempre con un índice.'),
      key('Lo que te llevas', 'Si en varios años no bates a un índice, la gestión activa no te compensa.', 'Creemos saber más de lo que sabemos y buscamos solo lo que nos da la razón.', 'Si solo lees a quien te da la razón, no analizas: te animas.'),
    ], [
      single('¿Cuánto más operaban los hombres que las mujeres según Barber y Odean?', ['Lo mismo', 'Un 45 % más', 'La mitad'], 1, 'Y su rentabilidad neta se reducía más.'),
      single('Antes de comprar, ¿qué ayuda contra el sesgo de confirmación?', ['Leer solo opiniones a favor', 'Escribir tres motivos por los que podrías equivocarte', 'No leer nada'], 1, 'Obliga a mirar el otro lado.'),
      tf('Ganar las primeras operaciones demuestra que tienes habilidad.', false, 'Con pocas operaciones, la suerte pesa mucho.'),
      single('¿Con qué deberías comparar tu rentabilidad?', ['Con la de un amigo', 'Con un índice comparable', 'Con nada'], 1, 'Si no lo bates, compra el índice.'),
    ], { source: '11.4', xp: 35 }),

    lesson('u11l5', 'Anclaje, recencia y otros atajos', [
      text('Cuatro atajos que salen caros', '• **Anclaje:** "estaba a 100 € y ahora a 60 €: está barata".\n• **Recencia:** tras dos años de subidas, creer que siempre sube.\n• **Coste hundido:** "ya he perdido 3.000 €, no vendo ahora".\n• **Falacia del jugador:** "ha bajado 6 días, mañana sube seguro".'),
      text('Y tres más', '• **País propio:** todo en el IBEX (España es menos del 1 % del mundo).\n• **Contabilidad mental:** arriesgar más con "el dinero ganado".\n• **Retrospectiva:** "era obvio que iba a pasar".'),
      key('Los antídotos', 'Valora con datos actuales · mira décadas, no meses · decide desde hoy · cada día es casi independiente · diversifica · un euro es un euro · escribe tus previsiones antes.', 'El cerebro usa atajos que en bolsa salen caros.', 'Que algo haya caído mucho no lo hace barato.'),
    ], [
      single('"Estaba a 120 € y ahora a 70 €, está tirada." ¿Qué sesgo es?', ['FOMO', 'Anclaje', 'Recencia'], 1, 'El precio pasado no dice nada del valor actual.'),
      single('"Ha bajado siete días seguidos, mañana tiene que subir." ¿Qué sesgo es?', ['Anclaje', 'Falacia del jugador', 'Recencia'], 1, 'Cada día es casi independiente del anterior.'),
      single('Laura cree que la bolsa "siempre sube" tras dos años buenos. Sesgo principal:', ['Recencia', 'Coste hundido', 'País propio'], 0, 'Da demasiado peso a lo reciente.'),
      tf('Arriesgar más con el dinero ganado que con el ahorrado es racional.', false, 'Es contabilidad mental: un euro es un euro.'),
    ], { source: '11.5', xp: 35 }),

    lesson('u11l6', 'Miedo, avaricia y venganza', [
      text('El ciclo emocional', 'Optimismo → entusiasmo → **euforia** (máximo riesgo) → ansiedad → negación → miedo → **pánico** (máxima oportunidad) → desesperanza → esperanza…\n\nTendemos a comprar en la euforia y vender en el pánico.'),
      text('Reglas preparadas', '• Antes de entrar (prisa): solo si se cumple el plan.\n• Va en contra (miedo): el stop no se toca.\n• Va a favor (miedo a devolverlo): sales según el plan.\n• Tras una pérdida (rabia): **tras 3 pérdidas seguidas, paras el día**.\n• Tras ganar (euforia): el riesgo es siempre el mismo.'),
      text('Hábitos que ayudan', '• No mires la cartera de largo plazo a diario (aversión miope a la pérdida).\n• Automatiza aportaciones y rebalanceo.\n• Descansa.\n• Separa la cartera de largo plazo de la de especulación.'),
      key('Lo que te llevas', 'No puedes eliminar las emociones; puedes impedir que decidan por ti.', 'Reglas preparadas antes de operar evitan que el miedo y la euforia decidan.', 'Después de tres pérdidas seguidas, la mejor operación es apagar la pantalla.'),
    ], [
      single('Pierdes tres operaciones y quieres recuperarlo con una más grande. ¿Cómo se llama?', ['Operar por venganza', 'Rebalancear', 'Diversificar'], 0, 'Para, respeta el tamaño fijo y no operes más ese día.'),
      tf('Mirar a diario la cartera de largo plazo ayuda a decidir mejor.', false, 'Aumenta las veces que la ves en pérdidas y las tentaciones.'),
      order('Ordena parte del ciclo emocional del mercado.', ['Entusiasmo', 'Euforia', 'Ansiedad', 'Pánico'], 'El máximo riesgo está en la euforia; la máxima oportunidad, en el pánico.'),
      single('La operación va en contra y te da miedo. ¿Regla preparada?', ['Alejar el stop', 'El stop no se toca', 'Comprar más'], 1, 'La decisión se tomó en calma.'),
    ], { source: '11.6', xp: 35 }),

    lesson('u11l7', 'Tu sistema anti-sesgos', [
      text('Antes de cada compra', '1. ¿Está en mi plan?\n2. ¿Puedo explicarlo en tres frases sin decir "porque sube"?\n3. ¿He escrito tres motivos por los que podría equivocarme?\n4. ¿Sé dónde está mi stop o qué me haría vender?\n5. ¿Respeta mis límites de tamaño?\n6. ¿Estoy tranquilo?\n7. ¿Lo compraría si nadie hablara de ello?'),
      text('Revisión mensual', '• ¿He seguido mi plan? ¿Dónde no y por qué?\n• ¿Bato a un índice comparable?\n• ¿Qué sesgo he visto en mí este mes?'),
      sim('Lumi como abogado del diablo', 'Pregúntale a Lumi por tus operaciones y te señalará los sesgos que vea.', 'Revisa tus últimas 10 operaciones y anota en cuáles hubo FOMO, anclaje o venganza.'),
      key('Lo que te llevas', 'Si alguna respuesta es "no", no compres hoy.', 'Los pilotos usan listas de comprobación aunque sepan volar. Tú también.', 'No necesitas ser una máquina: necesitas reglas que funcionen aunque no lo seas.'),
    ], [
      multi('¿Qué preguntas van en la lista antes de comprar? Marca todas.', ['¿Está en mi plan?', '¿Sé dónde está mi stop?', '¿Cuánto ha subido esta semana?', '¿Estoy tranquilo?'], [0, 1, 3], 'Cuánto ha subido alimenta el FOMO, no la decisión.'),
      single('Si alguna respuesta de la lista es "no"…', ['Compras igual', 'No compras hoy', 'Compras el doble'], 1, 'Es la regla de la lista.'),
      tf('La revisión mensual incluye comparar tu rentabilidad con un índice.', true, 'Es la prueba de si tu gestión activa compensa.'),
      single('Relaciona: sesgo de confirmación →', ['Buscar la opinión contraria', 'Comprar más', 'No usar stop'], 0, 'El abogado del diablo es su mejor antídoto.'),
    ], { source: '11.7', xp: 40 }),
  ],
})
