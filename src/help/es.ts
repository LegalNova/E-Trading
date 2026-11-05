import type { HelpDoc } from './types'

export const es: HelpDoc = {
  title: 'Centro de ayuda',
  intro: 'Respuestas cortas a lo que más nos preguntan. Si no encuentras lo tuyo, escríbenos.',
  search: 'Busca: vidas, racha, cancelar, contraseña…',
  noResults: 'No hemos encontrado nada con esas palabras. Prueba con otras o escríbenos.',
  all: 'Todo',
  contactTitle: '¿No encuentras tu respuesta?',
  contactBody: 'Escríbenos desde el formulario de contacto. Respondemos en uno o dos días laborables.',
  contactCta: 'Ir a Contacto',
  legalTitle: 'Documentos legales',
  categories: [
    {
      id: 'empezar',
      title: 'Empezar',
      items: [
        { id: 'que-es', q: '¿Qué es Lumi?', a: ['Una app para aprender a invertir desde cero: clases cortas e interactivas, quizzes y un mercado con precios reales donde practicas con dinero virtual. Lumi, la mascota, te acompaña en cada paso.'] },
        { id: 'dinero-real', q: '¿Se usa dinero real?', a: ['No. Todo el dinero del simulador es virtual y no tiene ningún valor: no puedes ingresar ni retirar dinero, y tus operaciones no llegan a ningún mercado real.'] },
        { id: 'cuesta', q: '¿Cuesta algo?', a: ['El plan Free es gratis para siempre. Plus y Max son opcionales y amplían el curso y Lumi.', 'Ahora mismo el pago no está activo: los planes de pago se pueden probar 7 días gratis y, al terminar, vuelves a Free sin ningún cargo.'] },
        { id: 'saber-antes', q: '¿Necesito saber algo antes?', a: ['No. El curso empieza por lo más básico (qué es el dinero y por qué pierde valor). Si ya sabes algo, al empezar puedes hacer un test de nivel para saltarte lo que dominas.'] },
        { id: 'edad', q: '¿Desde qué edad se puede usar?', a: ['Desde los 14 años. Entre 14 y 17, para contratar un plan de pago hace falta que lo confirme tu madre, padre o tutor.'] },
        { id: 'asesoramiento', q: '¿Lumi me dice en qué invertir?', a: ['No. Lumi es educación, no asesoramiento financiero: nada de la app es una recomendación para comprar o vender nada. Aprendes cómo funcionan los mercados para que algún día decidas tú, con criterio.'] },
      ],
    },
    {
      id: 'clases',
      title: 'Clases y progreso',
      items: [
        { id: 'como-clases', q: '¿Cómo son las clases?', a: ['Unos 6 minutos cada una. Primero haces (una historia con decisiones, una pieza para tocar o una misión con datos reales) y después entiendes la idea. Cada clase termina con un quiz corto.'] },
        { id: 'bloqueadas', q: '¿Por qué hay clases bloqueadas?', a: ['Las clases se abren en orden: al terminar una, se abre la siguiente. Cada sección se abre al superar el reto final de la anterior.', 'Algunas clases son de Plus o Max: las verás con un candado y el nombre del plan.'] },
        { id: 'vidas', q: '¿Qué son las vidas?', a: ['En el plan Free tienes 5 vidas para los quizzes. Pierdes una cuando fallas una pregunta y recuperas una cada 4 horas. También puedes recargarlas con gemas.', 'En Plus y Max las vidas son ilimitadas.'] },
        { id: 'racha', q: '¿Cómo funciona la racha?', a: ['Suma un día cada día que terminas una clase o un quiz, o haces una operación en el simulador. Si un día no haces nada, vuelve a empezar.', 'Un protector de racha la salva un día que no puedas: se compra con gemas (puedes tener 2 como mucho). En Max recibes uno cada semana.'] },
        { id: 'xp-gemas', q: '¿Para qué sirven la XP y las gemas?', a: ['La XP mide lo que aprendes y practicas: con ella subes de nivel y compites en la liga.', 'Las gemas se ganan con logros, objetivos del día y subiendo de división. Sirven para protectores de racha y recargar vidas. No se compran con dinero ni se pueden cambiar por nada.'] },
        { id: 'liga', q: '¿Cómo funciona la liga?', a: ['Cada semana compites en un grupo de hasta 30 personas por la XP que ganas esa semana. Los 7 primeros suben de división (y ganan gemas) y los últimos bajan. Se reinicia cada lunes.', 'Si prefieres no salir con tu nombre, en Ajustes puedes aparecer como «Jugador anónimo».'] },
        { id: 'repaso', q: '¿Qué pasa con las preguntas que fallo?', a: ['Se guardan para repasarlas más adelante, justo cuando estás a punto de olvidarlas. Así lo aprendido se queda.'] },
      ],
    },
    {
      id: 'mercado',
      title: 'Simulador de mercado',
      items: [
        { id: 'saldo', q: '¿Con cuánto dinero empiezo?', a: ['Con 10.000 € virtuales en Free y 50.000 € en Plus y Max.'] },
        { id: 'precios', q: '¿Los precios son reales?', a: ['Sí: salen de fuentes públicas de datos de mercado. Pueden llegar con retraso (en algunas bolsas, 15 minutos o más) o tener errores puntuales. Solo sirven para aprender.'] },
        { id: 'ordenes', q: '¿Qué tipos de orden puedo usar?', a: ['Desde el principio, órdenes a mercado. Las órdenes limitadas, stop loss y take profit se abren cuando terminas la clase del stop loss (en Max, desde el primer día).'] },
        { id: 'no-ejecuta', q: '¿Por qué no se ejecuta mi orden?', a: ['Las causas más habituales: el mercado de ese activo está cerrado (la orden espera a que abra), el precio aún no ha llegado al que pusiste en una orden limitada o stop, o no tienes saldo suficiente.'] },
        { id: 'comisiones', q: '¿Hay comisiones?', a: ['Sí, simuladas, para que se parezca a la realidad: el 0,1 % de cada operación, con un mínimo de 1 € virtual.'] },
        { id: 'reiniciar', q: '¿Puedo empezar de cero con la cartera?', a: ['Sí, hasta 3 veces al año desde la cartera. Vuelves al saldo inicial y se cierran tus posiciones; conservas tu XP, tu racha y tus logros.'] },
      ],
    },
    {
      id: 'lumi',
      title: 'Pregúntale a Lumi',
      items: [
        { id: 'que-hace', q: '¿Qué puedo preguntarle a Lumi?', a: ['Dudas del curso, conceptos que no entiendes, qué estudiar ahora y, en los planes de pago, cómo va tu cartera o qué sesgos se ven en tus operaciones. Responde con el contenido del curso y tu progreso.'] },
        { id: 'limite', q: '¿Cuántas preguntas puedo hacer?', a: ['5 al día en Free, 30 en Plus y 100 en Max. El contador se reinicia cada día.'] },
        { id: 'privacidad-lumi', q: '¿Mis preguntas salen de Lumi?', a: ['No. Lumi funciona en nuestros propios servidores: tus preguntas no se envían a ningún servicio de inteligencia artificial de terceros. Puedes borrar el historial cuando quieras desde la propia conversación.'] },
      ],
    },
    {
      id: 'planes',
      title: 'Planes y pagos',
      items: [
        { id: 'diferencias', q: '¿Qué diferencia hay entre Free, Plus y Max?', a: ['Free: unidades 1 a 3 completas y las 3 primeras clases de cada unidad, con 5 vidas y 5 preguntas al día a Lumi.', 'Plus (3,99 €/mes o 29,99 €/año): unidades 1 a 5 completas y las 5 primeras clases de cada unidad, vidas ilimitadas, 50.000 € virtuales y 30 preguntas al día.', 'Max (7,99 €/mes o 59,99 €/año): todo el curso, vidas ilimitadas, órdenes avanzadas desde el primer día, 100 preguntas al día con todos los modos y un protector de racha cada semana.'], links: [{ href: '/premium', label: 'Ver los planes' }] },
        { id: 'prueba', q: '¿Cómo funciona la prueba gratis?', a: ['Tienes 7 días para probar Plus o Max, una vez por persona. Ahora mismo el pago no está activo: la prueba termina sola y vuelves a Free sin ningún cargo.', 'Cuando el pago esté activo, te avisaremos antes de que termine la prueba y podrás cancelarla sin coste.'] },
        { id: 'cancelar', q: '¿Cómo cancelo mi plan?', a: ['En Ajustes, Suscripción, «Cancelar suscripción». Sin llamadas ni preguntas. Conservas lo que hayas pagado hasta el final del periodo.'] },
        { id: 'reembolso', q: '¿Puedo pedir que me devolváis el dinero?', a: ['Sí. Tienes 14 días para desistir desde que contratas y, además, si nos lo pides en los 14 días siguientes a tu primer cobro, te devolvemos el importe completo.'], links: [{ href: '/legal/contratacion', label: 'Condiciones de contratación' }] },
      ],
    },
    {
      id: 'cuenta',
      title: 'Cuenta y privacidad',
      items: [
        { id: 'sin-registro', q: '¿Puedo probar sin registrarme?', a: ['Sí: toca «Probar sin registrarme» y entras al momento, sin email ni contraseña. Si te gusta, en «Guardar» le pones email y contraseña a tu cuenta y conservas todo tu progreso.', 'Si no lo guardas, la cuenta de invitado se borra a los 30 días sin entrar. Para probar Plus o Max hay que guardar antes el progreso.'] },
        { id: 'google-bluetooth', q: 'Al entrar con Google me pide activar el Bluetooth', a: ['Es un paso de Google, no de Lumi: si tu cuenta de Google tiene una llave de acceso (passkey), Google intenta usar tu móvil como llave y para eso necesita Bluetooth.', 'Si no funciona, en esa pantalla de Google toca «Probar otra manera» y elige tu contraseña de Google o un código en el móvil. También puedes entrar con tu email y una contraseña de Lumi.'] },
        { id: 'crear-contrasena', q: 'Me registré con Google: ¿puedo entrar con email?', a: ['Sí. Entra una vez con Google y ve a Ajustes, Cuenta, «Crear una contraseña». A partir de ahí puedes entrar con tu email y esa contraseña, o seguir usando Google.'] },
        { id: 'contrasena', q: 'He olvidado la contraseña', a: ['En «Entrar», toca «¿Has olvidado la contraseña?». Si la recuperación por email aún no está disponible, escríbenos desde Contacto con el email de tu cuenta y te ayudamos.'], links: [{ href: '/recuperar', label: 'Recuperar la contraseña' }] },
        { id: 'ajustes', q: '¿Dónde cambio mi nombre, idioma o tema?', a: ['En Perfil, Ajustes. También puedes cambiar tu meta diaria, los avisos y el nombre y aspecto de Lumi.'] },
        { id: 'datos', q: '¿Qué datos guardáis y para qué?', a: ['Solo lo necesario para que la app funcione y para mejorarla: tu cuenta, tu progreso, tu actividad en el simulador y estadísticas de uso propias. No usamos publicidad ni herramientas de terceros y no vendemos tus datos.'], links: [{ href: '/legal/privacidad', label: 'Política de privacidad' }] },
        { id: 'descargar-borrar', q: '¿Cómo descargo o borro mis datos?', a: ['En Ajustes, Cuenta: puedes descargar todos tus datos en un archivo y borrar tu cuenta. Al borrarla se eliminan tu progreso, tu cartera y tu historial, y no se puede deshacer.'] },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      items: [
        { id: 'fraude', q: 'Alguien dice ser de Lumi y me ofrece invertir', a: ['Es un fraude. Lumi nunca te pedirá dinero, datos de tu banco, tu contraseña ni códigos por email, mensaje o redes sociales, y nunca te ofrecerá invertir ni «gestionar» tu dinero.', 'No respondas, no pagues nada y avísanos desde Contacto. Si ya has pagado, contacta con tu banco y denúncialo a la policía.'] },
        { id: 'cuenta-segura', q: '¿Cómo protejo mi cuenta?', a: ['Usa una contraseña que no uses en otros sitios, con al menos 8 caracteres y un número, o entra con Google. Si alguien más usa tu dispositivo, cierra la sesión al terminar.'] },
        { id: 'error', q: 'He encontrado un error', a: ['Gracias por avisar. Escríbenos desde Contacto explicando qué hacías y qué pasó; si puedes, añade una captura. Aprovechar un error para ganar ventaja en la liga va contra las normas.'] },
      ],
    },
  ],
}
