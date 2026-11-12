// Textos legales en castellano (versión de referencia). Ver docs/09-legal.md para las fuentes.
// Los precios NO se escriben aquí: salen de ./prices (que lee las tablas con las que se cobra).
import { LEGAL_UPDATED } from '@/shared/legal'
import { OWNER } from './owner'
import { giftPrice, groupRows, planPrice, RULES } from './prices'
import type { LegalDoc, LegalSlug } from './types'

const O = OWNER
const L = 'es' as const

export const es: Record<LegalSlug, LegalDoc> = {
  'aviso-legal': {
    title: 'Aviso legal',
    intro: `Última actualización: ${LEGAL_UPDATED}. Información exigida por la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).`,
    sections: [
      {
        h: '1. Titular',
        table: {
          head: ['Dato', 'Valor'],
          rows: [
            ['Titular', O.name],
            ['NIF', O.nif],
            ['Domicilio', O.address],
            ['Email de contacto', O.email],
            ['Sitio web', O.site],
          ],
        },
      },
      {
        h: '2. Qué es E-Trading',
        p: [
          'E-Trading es una aplicación educativa para aprender a invertir mediante clases, cuestionarios y un simulador de mercado con dinero virtual.',
          'E-Trading no es una entidad financiera ni una empresa de servicios de inversión: no recibe dinero de los usuarios, no ejecuta operaciones reales, no se conecta a ningún bróker y no presta asesoramiento en materia de inversión. Por ello no está autorizada ni supervisada por la Comisión Nacional del Mercado de Valores (CNMV).',
        ],
      },
      {
        h: '3. Información de mercado',
        p: [
          'Los precios se obtienen de fuentes de terceros (Yahoo Finance y, como respaldo para las divisas, el Banco Central Europeo) y pueden tener retraso o errores. Se muestran solo con fines educativos y no deben usarse para tomar decisiones de inversión reales.',
          'Nada de lo que aparece en la aplicación —incluidos los mensajes de Lumi, los avisos de riesgo o las clases— es una recomendación personalizada de comprar, vender o mantener ningún instrumento financiero.',
        ],
      },
      {
        h: '4. Condiciones de uso del sitio',
        p: ['El uso de la aplicación implica aceptar este aviso legal, los Términos de uso, la Política de privacidad y la Política de cookies.'],
      },
      {
        h: '5. Propiedad intelectual',
        p: [
          'Los textos, ejercicios, diseño, logotipos, la mascota Lumi y el código de E-Trading pertenecen a su titular o se usan con licencia. No se permite copiarlos ni distribuirlos sin autorización, salvo para uso personal y no comercial.',
          'Las marcas y nombres de empresas que aparecen en el simulador (por ejemplo, Apple o Banco Santander) pertenecen a sus titulares y se citan solo para identificar los activos.',
        ],
      },
      {
        h: '6. Responsabilidad',
        p: [
          'El titular procura que la información sea correcta y que el servicio esté disponible, pero no garantiza la ausencia de errores ni de interrupciones. No responde de las decisiones que se tomen fuera de la aplicación a partir de su contenido.',
          'Los enlaces a sitios de terceros se ofrecen solo como referencia; el titular no controla su contenido.',
        ],
      },
      {
        h: '7. Ley aplicable',
        p: ['Este aviso legal se rige por la ley española. Para cualquier controversia con consumidores serán competentes los juzgados y tribunales del domicilio del consumidor.'],
      },
    ],
  },

  privacidad: {
    title: 'Política de privacidad',
    intro: `Última actualización: ${LEGAL_UPDATED}. Te explicamos qué datos tratamos, para qué y qué derechos tienes, según el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).`,
    sections: [
      {
        h: '1. Responsable del tratamiento',
        p: [`${O.name} (NIF ${O.nif}), con domicilio en ${O.address}. Puedes escribirnos a ${O.email} para cualquier asunto de privacidad.`],
      },
      {
        h: '2. Qué datos tratamos',
        list: [
          'Cuenta: email, nombre que elijas y contraseña (guardada cifrada con un algoritmo de un solo sentido; nunca la vemos). Si entras con Google, recibimos tu email y tu nombre de Google.',
          'Perfil: tratamiento (femenino, masculino o neutro), fecha de nacimiento, objetivos, meta diaria, idioma, moneda y tema.',
          'Actividad educativa: lecciones, respuestas de los cuestionarios, XP, racha, vidas, gemas, logros y posición en la liga.',
          'Simulador: órdenes, operaciones, cartera virtual, diario de operaciones y alertas de precio. Todo es dinero virtual.',
          'Datos técnicos: dirección IP y navegador, para la seguridad, los límites de uso y el inicio de sesión.',
          'Uso de la app: qué pantallas visitas (como mucho una vez al día por pantalla), hasta qué paso llegas en cada clase y desde dónde llegaste la primera vez (por ejemplo, el enlace de un creador). Lo usamos solo nosotros, con nuestras propias herramientas, para mejorar el curso y la app.',
          'Preguntas a Lumi (la profesora): el texto de tus preguntas, sus respuestas y el modo elegido, para mostrarte el historial y contar tu límite diario. En Free y Plus, Lumi responde con nuestro propio motor, sin servicios externos. En Max, parte de las respuestas puede generarlas un modelo de inteligencia artificial de Anthropic: para ello se le envía tu pregunta, los últimos mensajes de la conversación y un resumen de tu cartera simulada, tu progreso y tu diario de operaciones, sin tu nombre ni tu email. Esas respuestas van marcadas como generadas con IA. Puedes borrar el historial cuando quieras.',
          'Avisos en el móvil o en el navegador (solo si los activas): el identificador que crea tu navegador para poder enviártelos y el tipo de navegador.',
          'Pagos (solo si contratas un plan o compras un regalo): qué has contratado, las fechas, el estado de la suscripción y el identificador de cliente que nos da Stripe. Los datos de la tarjeta los trata Stripe: nosotros no los vemos completos. Si haces un regalo, también el nombre de la persona y el mensaje que le escribas.',
          'Precio de estudiante (solo si lo pides): el nombre de tu centro de estudios, tu email de estudiante si lo indicas y una foto o un PDF de tu carné o de tu matrícula. Solo lo ve nuestro equipo y el archivo se borra en cuanto lo revisamos.',
          'Comunicaciones: lo que nos envíes por el formulario de contacto y, si te apuntas, tu email en la lista de novedades.',
        ],
        p: ['No usamos herramientas de analítica ni de publicidad de terceros y no vendemos tus datos.'],
      },
      {
        h: '3. Para qué y con qué base legal',
        table: {
          head: ['Finalidad', 'Base legal (RGPD art. 6)'],
          rows: [
            ['Crear tu cuenta y prestarte el servicio (clases, simulador, progreso, liga)', 'Ejecución del contrato que aceptas al registrarte (6.1.b)'],
            ['Mostrar tu nombre (nombre e inicial) en la liga semanal', 'Interés legítimo en el funcionamiento del juego (6.1.f). Puedes aparecer como «Jugador anónimo» en Ajustes'],
            ['Seguridad, prevención de abusos y límites de uso', 'Interés legítimo en proteger el servicio y a los usuarios (6.1.f)'],
            ['Estadísticas propias para mejorar el curso y la app (qué clases cuestan más, qué pantallas se usan, de dónde llegan los usuarios) y revisar tu cuenta si necesitas ayuda', 'Interés legítimo en mejorar el servicio y darte soporte (6.1.f). Sin herramientas de terceros'],
            ['Avisos dentro de la app (racha, órdenes, logros)', 'Ejecución del contrato (6.1.b); puedes desactivarlos en Ajustes'],
            ['Avisos en el móvil o en el navegador (racha, clases, precios)', 'Tu consentimiento (6.1.a): los activas tú y puedes desactivarlos cuando quieras en Ajustes o en tu navegador'],
            ['Responder a tus preguntas a Lumi con el manual del curso y tu progreso (en Max, también con un modelo de inteligencia artificial)', 'Ejecución del contrato (6.1.b)'],
            ['Cobrar los planes de pago y los regalos, y comprobar el precio de estudiante', 'Ejecución del contrato (6.1.b) y obligaciones legales de facturación (6.1.c)'],
            ['Responder a tus mensajes de contacto', 'Tu solicitud y nuestro interés legítimo en atenderla (6.1.b y 6.1.f)'],
            ['Enviarte novedades si te apuntas a la lista', 'Tu consentimiento (6.1.a), que puedes retirar cuando quieras'],
            ['Cumplir obligaciones legales', 'Obligación legal (6.1.c)'],
          ],
        },
      },
      {
        h: '4. Menores de edad',
        p: [
          'Para registrarte debes tener al menos 14 años, la edad a partir de la cual se puede consentir el tratamiento de datos en España (LOPDGDD, art. 7). Si tienes entre 14 y 17 años puedes usar el plan gratuito; para contratar un plan de pago (Plus o Max) hará falta que lo confirme tu madre, padre o tutor.',
          'Si sabemos que una cuenta pertenece a un menor de 14 años, la eliminaremos.',
        ],
      },
      {
        h: '5. Cuánto tiempo guardamos los datos',
        list: [
          'Cuenta, progreso y simulador: mientras tengas la cuenta. Al borrarla desde Ajustes se eliminan de inmediato; las copias de seguridad técnicas se sobrescriben en un máximo de 7 días.',
          'Registros de seguridad (por ejemplo, intentos de acceso): hasta 12 meses.',
          'Conversaciones con Lumi: mientras tengas la cuenta o hasta que borres el historial.',
          'Justificante de estudiante: se borra en cuanto aprobamos o rechazamos la solicitud.',
          'Cuentas de invitado («Probar sin registrarme») que no guardan su progreso: se borran con todos sus datos a los 30 días sin entrar.',
          'Mensajes de contacto: 12 meses desde la última respuesta.',
          'Lista de novedades: hasta que te des de baja.',
        ],
      },
      {
        h: '6. Quién trata los datos por nuestra cuenta',
        p: ['Contamos con proveedores que actúan como encargados del tratamiento, con contrato conforme al art. 28 del RGPD. La última fila es distinta: los avisos en el móvil pasan por el servicio de avisos del fabricante de tu navegador, que no trabaja por encargo nuestro.'],
        table: {
          head: ['Proveedor', 'Servicio', 'Ubicación y garantías'],
          rows: [
            ['Vercel Inc.', 'Alojamiento de la aplicación', 'EE. UU. · Marco de Privacidad de Datos UE-EE. UU. y cláusulas contractuales tipo'],
            ['Neon Inc. (sobre Amazon Web Services)', 'Base de datos', 'EE. UU. (us-east-1) · contrato de encargado y cláusulas contractuales tipo'],
            ['Google LLC', 'Inicio de sesión con Google (solo si lo usas)', 'EE. UU. · Marco de Privacidad de Datos UE-EE. UU.'],
            ['Stripe Payments Europe, Ltd.', 'Cobro de los planes de pago (solo si contratas uno): tarjeta, facturas y suscripción. Nosotros no vemos los datos completos de tu tarjeta', 'Irlanda (UE)'],
            ['Anthropic, PBC', 'Lumi con IA (solo en Max y cuando esté activada): tus preguntas a Lumi, los últimos mensajes de la conversación y un resumen de tu cartera simulada, tu progreso y tu diario de operaciones, sin tu nombre ni tu email. No se usan para entrenar sus modelos', 'EE. UU. · Marco de Privacidad de Datos UE-EE. UU. y cláusulas contractuales tipo'],
            ['Resend Inc.', 'Envío de emails de la cuenta (confirmar el email, cambiar la contraseña)', 'EE. UU. · contrato de encargado y cláusulas contractuales tipo'],
            ['Servicio de avisos de tu navegador (Google, Apple, Mozilla o Microsoft, según el que uses)', 'Entregar los avisos en el móvil o en el ordenador, solo si los activas. Recibe el identificador de tu dispositivo y el aviso cifrado; no recibe tu nombre ni tu email', 'Depende del fabricante · trata esos datos según su propia política de privacidad'],
          ],
        },
      },
      {
        h: '7. Transferencias internacionales',
        p: ['Algunos de estos proveedores están en Estados Unidos. Las transferencias se amparan en la decisión de adecuación del Marco de Privacidad de Datos UE-EE. UU. y, cuando corresponde, en las cláusulas contractuales tipo aprobadas por la Comisión Europea.'],
      },
      {
        h: '8. Fuentes de precios',
        p: ['Los precios del mercado los pide nuestro servidor a Yahoo Finance y, como respaldo para las divisas, al Banco Central Europeo. Estas fuentes no reciben ningún dato tuyo.'],
      },
      {
        h: '9. Tus derechos',
        p: [
          'Puedes acceder a tus datos, rectificarlos, suprimirlos, oponerte a su tratamiento, pedir su limitación y su portabilidad, y retirar tu consentimiento en cualquier momento.',
          `Desde Ajustes → Cuenta puedes descargar todos tus datos (portabilidad) y borrar tu cuenta. Para el resto, escríbenos a ${O.email}. Te responderemos en un plazo máximo de un mes.`,
          'Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ],
      },
      {
        h: '10. Decisiones automatizadas',
        p: [
          'No tomamos decisiones con efectos jurídicos basadas solo en tratamientos automatizados. Los avisos de riesgo y la mayoría de los mensajes de Lumi se generan con reglas educativas sencillas (por ejemplo, el peso de un activo en tu cartera) y no limitan lo que puedes hacer.',
          'En Max, algunas respuestas de Lumi las genera un modelo de inteligencia artificial. Van marcadas como tales, pueden contener errores y no son un consejo de inversión.',
        ],
      },
      {
        h: '11. Seguridad',
        p: ['Toda la comunicación va cifrada (HTTPS). Las contraseñas se guardan con hash, la sesión usa una cookie protegida (HttpOnly, Secure, SameSite) y aplicamos límites de uso y controles para evitar abusos.'],
      },
      {
        h: '12. Cambios',
        p: ['Si cambiamos esta política de forma importante te lo avisaremos dentro de la aplicación. La fecha de la última actualización aparece arriba.'],
      },
    ],
  },

  cookies: {
    title: 'Política de cookies',
    intro: `Última actualización: ${LEGAL_UPDATED}. Según el art. 22.2 de la LSSI-CE y la Guía sobre el uso de cookies de la AEPD.`,
    sections: [
      {
        h: '1. Qué son',
        p: ['Las cookies y tecnologías parecidas (como el almacenamiento local del navegador) son pequeños archivos que una web guarda en tu dispositivo para recordar información.'],
      },
      {
        h: '2. Qué usamos',
        p: ['E-Trading solo usa cookies y almacenamiento técnicos o de preferencias que tú eliges. No usamos cookies de analítica, de publicidad ni de terceros.'],
        table: {
          head: ['Nombre', 'Titular', 'Para qué', 'Duración', 'Tipo'],
          rows: [
            ['__Secure-better-auth.session_token', 'E-Trading', 'Mantener tu sesión iniciada de forma segura', '30 días', 'Técnica, necesaria'],
            ['better-auth.state', 'E-Trading', 'Proteger el inicio de sesión con Google (solo si lo usas)', '10 minutos', 'Técnica, necesaria'],
            ['NEXT_LOCALE', 'E-Trading', 'Recordar el idioma que elijas en Ajustes', '1 año', 'De preferencia elegida por ti'],
            ['et-theme (almacenamiento local)', 'E-Trading', 'Recordar el tema claro u oscuro', 'Hasta que lo borres', 'De preferencia elegida por ti'],
            ['et-cookies (almacenamiento local)', 'E-Trading', 'Recordar que ya has visto el aviso de cookies', 'Hasta que lo borres', 'Técnica'],
          ],
        },
      },
      {
        h: '3. Consentimiento',
        p: [
          'Las cookies técnicas y las de preferencias que tú solicitas están exentas de consentimiento (LSSI-CE art. 22.2). Por eso no te pedimos que aceptes nada: solo te informamos.',
          'Si algún día añadimos cookies que necesiten tu permiso (por ejemplo, de analítica), te lo pediremos antes de usarlas, con las opciones «Aceptar» y «Rechazar» al mismo nivel, y podrás cambiar tu decisión en cualquier momento.',
        ],
      },
      {
        h: '4. Cómo borrarlas o bloquearlas',
        p: ['Puedes borrar o bloquear las cookies desde la configuración de tu navegador (Chrome, Safari, Firefox o Edge). Si bloqueas la cookie de sesión no podrás iniciar sesión.'],
      },
    ],
  },

  terminos: {
    title: 'Términos de uso',
    intro: `Última actualización: ${LEGAL_UPDATED}. Estos términos regulan el uso de E-Trading. Al crear una cuenta los aceptas.`,
    sections: [
      {
        h: '1. El servicio',
        p: [`E-Trading, de ${O.name}, ofrece clases, cuestionarios, un simulador de mercado con dinero virtual y elementos de juego (XP, racha, vidas, gemas, logros y liga) para aprender a invertir.`],
      },
      {
        h: '2. Es una simulación educativa',
        list: [
          'No se opera con dinero real ni se puede ingresar o retirar dinero. El saldo de la cartera es virtual y no tiene ningún valor económico.',
          'No es asesoramiento financiero ni una recomendación de inversión. Los resultados del simulador no garantizan resultados reales.',
          'Los precios vienen de fuentes de terceros, pueden tener retraso o errores y el simulador simplifica la realidad (por ejemplo, no hay dividendos ni horquillas de precio).',
        ],
      },
      {
        h: '3. Tu cuenta',
        list: [
          'Debes tener al menos 14 años. Entre 14 y 17 años, para contratar un plan de pago (Plus o Max) hace falta el consentimiento de tu madre, padre o tutor.',
          'Una cuenta por persona. Cuida tu contraseña: eres responsable de lo que se haga con tu cuenta.',
          'Puedes borrar tu cuenta cuando quieras desde Ajustes.',
        ],
      },
      {
        h: '4. Uso aceptable',
        p: ['No está permitido:'],
        list: [
          'Usar bots, scripts o cualquier automatización para responder, operar o ganar XP, gemas o puestos en la liga.',
          'Aprovechar errores del servicio para obtener ventajas, o no avisarnos de ellos cuando los descubras.',
          'Crear varias cuentas para manipular la liga o las recompensas.',
          'Intentar acceder a datos de otras personas, saturar el servicio o saltarse sus límites de seguridad.',
          'Usar nombres ofensivos, que suplanten a otra persona o que vulneren derechos de terceros.',
        ],
      },
      {
        h: '5. Consecuencias',
        p: ['Si se incumplen estos términos podemos corregir el progreso o las recompensas obtenidas de forma indebida, reiniciar la cartera virtual, suspender o cerrar la cuenta. Te lo explicaremos y podrás responder.'],
      },
      {
        h: '6. XP, gemas, vidas y logros',
        p: ['Son elementos del juego, sin valor económico. No se pueden comprar con dinero, vender, transferir ni canjear por dinero o premios. Podemos ajustar su funcionamiento para mejorar el aprendizaje.'],
      },
      {
        h: '7. Planes de pago (Plus y Max)',
        list: [
          'Plus y Max amplían las clases, las vidas, el saldo virtual, los tipos de orden y las preguntas a Lumi. El precio y lo que incluye cada plan se muestran antes de contratar.',
          'Hay una prueba gratuita de 7 días, una por persona, que se desbloquea con una racha de 5 días seguidos o llegando con una invitación.',
          'La compra se rige por las Condiciones de contratación: precio, renovación, cancelación desde Ajustes, aviso antes de que termine la prueba y 14 días naturales para desistir.',
        ],
      },
      {
        h: '8. Invitaciones',
        list: [
          'Cada persona tiene un enlace de invitación. Quien crea su cuenta con él recibe 7 días de Max gratis al terminar la bienvenida; cuentan como su prueba gratis (una por persona).',
          'Quien invita recibe 7 días de Max cuando su amigo guarda la cuenta con email y contraseña y termina su primera clase, hasta un máximo de un año en total.',
          'El regalo no tiene valor económico, no se puede cambiar por dinero ni transferir, y se suma al Max que ya tengas.',
          'No vale invitarte a ti mismo, crear cuentas falsas ni comprar o vender invitaciones. Si pasa, podemos retirar los días regalados y aplicar el apartado 5.',
          'Podemos cambiar o terminar el programa avisando antes en la app; los días ya ganados se respetan.',
        ],
      },
      {
        h: '9. Propiedad intelectual',
        p: ['El contenido de E-Trading pertenece a su titular o se usa con licencia. Puedes usarlo para tu aprendizaje personal, pero no copiarlo ni distribuirlo sin permiso.'],
      },
      {
        h: '10. Responsabilidad',
        p: ['Ponemos el máximo cuidado en el servicio, pero puede tener errores o interrupciones. No respondemos de decisiones de inversión reales tomadas a partir de la aplicación. Nada de lo anterior limita los derechos que te reconoce la ley como consumidor.'],
      },
      {
        h: '11. Cambios en el servicio y en los términos',
        p: ['Podemos mejorar o cambiar funciones. Si cambiamos estos términos de forma importante te avisaremos con antelación dentro de la aplicación.'],
      },
      {
        h: '12. Ley y conflictos',
        p: [
          `Se aplica la ley española. Si tienes un problema, escríbenos primero a ${O.email} y lo intentaremos resolver. Como consumidor puedes acudir también a los organismos de consumo de tu comunidad autónoma y a los juzgados de tu domicilio.`,
        ],
      },
    ],
  },
  contratacion: {
    title: 'Condiciones de contratación',
    intro: `Última actualización: ${LEGAL_UPDATED}. Se aplican cuando contratas un plan de pago (Plus o Max) o compras un regalo y completan los Términos de uso. Cumplen el Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios) y la LSSI-CE.`,
    sections: [
      {
        h: '1. Quién te vende',
        table: {
          head: ['Dato', 'Valor'],
          rows: [
            ['Titular', O.name],
            ['NIF', O.nif],
            ['Domicilio', O.address],
            ['Email', O.email],
          ],
        },
      },
      {
        h: '2. Qué contratas y cuánto cuesta',
        p: ['Precios finales en euros, con todos los impuestos incluidos. No hay ningún otro cargo. Antes de pagar verás siempre el importe exacto que se te va a cobrar.'],
        table: {
          head: ['Plan', 'Qué incluye', 'Mensual', 'Anual'],
          rows: [
            ['Plus', 'Unidades 1 a 5 completas y las 5 primeras clases de cada unidad, vidas ilimitadas, 50.000 € virtuales y 30 preguntas al día a Lumi con el modo «Mi cartera».', planPrice('PLUS', 'MONTH', L), planPrice('PLUS', 'YEAR', L)],
            ['Max', 'Todo el curso, vidas ilimitadas, 50.000 € virtuales, órdenes avanzadas desde el primer día, 100 preguntas al día a Lumi con todos los modos y un protector de racha cada semana.', planPrice('PREMIUM', 'MONTH', L), planPrice('PREMIUM', 'YEAR', L)],
          ],
        },
      },
      {
        h: '3. Precio de estudiante',
        p: ['Si estudias en un instituto, en formación profesional o en la universidad, puedes pedir el precio de estudiante desde la pantalla de planes.'],
        list: [
          'Nos envías un justificante: una foto o un PDF de tu carné de estudiante o de tu matrícula. Lo revisa nuestro equipo, normalmente en uno o dos días, y borramos el archivo en cuanto decidimos.',
          `Si lo aprobamos, tienes el precio de estudiante durante ${RULES.studentMonths} meses, en los planes individuales y en los planes de grupo que pagues tú.`,
          'Si ya pagabas el precio normal, tu suscripción pasa al precio de estudiante desde el siguiente cobro. Lo que ya has pagado no cambia.',
          'Te avisamos antes de que termine para que puedas renovarlo con el justificante del curso nuevo. Si no lo renuevas, lo que contrates después será al precio normal.',
        ],
        table: {
          head: ['Plan (precio de estudiante)', 'Mensual', 'Anual'],
          rows: [
            ['Plus', planPrice('PLUS', 'MONTH', L, true), planPrice('PLUS', 'YEAR', L, true)],
            ['Max', planPrice('PREMIUM', 'MONTH', L, true), planPrice('PREMIUM', 'YEAR', L, true)],
          ],
        },
      },
      {
        h: '4. Planes de grupo',
        p: ['Una persona paga Plus o Max para su grupo y cada miembro lo usa con su propia cuenta. Quien paga también tiene el plan y ocupa una de las plazas. Las filas «estudiante» se aplican si quien paga tiene el precio de estudiante.'],
        list: [
          'Los miembros entran con el enlace del grupo. Quien ya pagaba una suscripción propia la conserva hasta que la cancele.',
          'El plan de grupo es una suscripción: se paga, se renueva y se cancela como se explica en los apartados 7 y 8, y tiene el mismo derecho de desistimiento (apartado 9). No tiene prueba gratuita.',
          'Si el grupo termina, los miembros que tenían el plan gracias al grupo vuelven a Free sin perder su progreso.',
        ],
        table: {
          head: ['Tamaño del grupo', 'Plus mensual', 'Plus anual', 'Max mensual', 'Max anual'],
          rows: [
            ...groupRows(L, size => (size === 0 ? `Sin límite (uso razonable, hasta ${RULES.groupCap} personas)` : `Hasta ${size} personas`)),
            ...groupRows(L, size => (size === 0 ? 'Sin límite · estudiante' : `Hasta ${size} personas · estudiante`), true),
          ],
        },
      },
      {
        h: '5. Cómo se contrata',
        list: [
          'Eliges el plan y el periodo en la pantalla de planes, revisas el precio y confirmas con el botón de compra. Antes de pagar puedes corregir cualquier dato volviendo atrás.',
          'El contrato queda celebrado al confirmar. Te enviamos la confirmación por email y puedes consultar tu plan en todo momento en Ajustes, Suscripción.',
          'El contrato se formaliza en castellano, catalán o inglés, según el idioma de la app. Guardamos el registro de la contratación y te lo enviamos si nos lo pides.',
        ],
      },
      {
        h: '6. Prueba gratuita',
        list: [
          'Puedes tener una prueba gratuita de 7 días (una vez por persona): se desbloquea con una racha de 5 días seguidos o llegando con la invitación de un amigo. También puedes contratar directamente, sin prueba.',
          'La prueba es del plan que elijas (Plus o Max) y para empezarla pones tu tarjeta. Si la cancelas antes de que termine, no se te cobra nada. Si no, al terminar se cobra el primer periodo de ese plan, al precio que viste al confirmar (el normal o el de estudiante).',
          'Si llegas con la invitación de un amigo, los 7 días son de Max, empiezan al terminar la bienvenida y no piden tarjeta: al acabar vuelves a Free sin ningún cobro.',
          'Te avisaremos dentro de la app (y en el móvil, si tienes los avisos activados) antes de que termine la prueba.',
        ],
      },
      {
        h: '7. Pago',
        list: [
          'Se paga con tarjeta a través de Stripe, que procesa el pago de forma segura. Nosotros no vemos ni guardamos los datos completos de tu tarjeta.',
          'Cada periodo se cobra por adelantado, el día en que empieza. Recibirás el justificante de cada cobro por email.',
          'Si un cobro falla, te avisaremos y lo intentaremos de nuevo durante unos días; si no se puede cobrar, el plan vuelve a Free sin perder tu progreso.',
        ],
      },
      {
        h: '8. Renovación, cambios y cancelación',
        list: [
          'La suscripción se renueva automáticamente por el mismo periodo y precio hasta que la canceles.',
          'Puedes cancelar cuando quieras en Ajustes, Suscripción, sin explicaciones. Mantienes el plan hasta el final del periodo pagado y no se te vuelve a cobrar.',
          'Si cambiamos el precio, te avisaremos con al menos 30 días de antelación y antes de tu siguiente renovación; si no estás de acuerdo, puedes cancelar antes de que se aplique.',
        ],
      },
      {
        h: '9. Derecho de desistimiento y devoluciones',
        list: [
          'Como consumidor, tienes 14 días naturales desde que contratas para desistir del contrato sin dar ninguna explicación.',
          'Además, como garantía comercial nuestra: si nos lo pides en los 14 días naturales siguientes a tu primer cobro, te devolvemos el importe completo, aunque ya hayas usado el plan.',
          `Para hacerlo, escríbenos a ${O.email} indicando el email de tu cuenta, o usa el formulario del apartado 13. Te devolveremos el dinero en un máximo de 14 días por el mismo medio de pago, sin ningún coste para ti.`,
        ],
      },
      {
        h: '10. Menores de edad',
        p: ['Si tienes entre 14 y 17 años, para contratar un plan de pago hace falta que tu madre, padre o tutor lo confirme. Sin esa confirmación no se puede completar la compra.'],
      },
      {
        h: '11. Si algo no funciona',
        p: [
          'El servicio debe funcionar como se describe. Si no es así, tienes derecho a que lo arreglemos y, si no lo conseguimos en un plazo razonable, a una rebaja del precio o a terminar el contrato con la devolución correspondiente (garantía de conformidad de los contenidos y servicios digitales).',
          'E-Trading es un servicio educativo con dinero virtual: no garantiza ningún resultado económico real.',
        ],
      },
      {
        h: '12. Dudas y reclamaciones',
        p: [
          `Escríbenos a ${O.email}: respondemos en un máximo de 7 días y procuramos hacerlo antes. Si no quedas satisfecho, puedes acudir a los servicios de consumo de tu comunidad autónoma o a los juzgados de tu domicilio.`,
          'Por ahora no estamos adheridos a ningún sistema de arbitraje de consumo.',
        ],
      },
      {
        h: '13. Modelo de formulario de desistimiento',
        p: [
          'Solo tienes que rellenarlo y enviárnoslo si quieres desistir del contrato. También vale un email con los mismos datos.',
          `A la atención de ${O.name}, ${O.address}, ${O.email}:`,
          'Por la presente le comunico que desisto de mi contrato del siguiente servicio: plan [Plus o Max], [individual o de grupo], [mensual o anual].',
          'Contratado el: [fecha] · Nombre: [tu nombre] · Email de la cuenta: [tu email] · Fecha: [fecha de hoy] · Firma (solo si lo envías en papel).',
        ],
      },
      {
        h: '14. Regalar E-Trading',
        p: ['Puedes regalar Plus o Max durante 1 mes (30 días) o 12 meses (365 días) a otra persona. Estas condiciones se aplican al regalo junto con las anteriores.'],
        list: [
          `Precio, con impuestos incluidos: Plus, ${giftPrice('PLUS', 1, L)} (1 mes) o ${giftPrice('PLUS', 12, L)} (12 meses); Max, ${giftPrice('PREMIUM', 1, L)} (1 mes) o ${giftPrice('PREMIUM', 12, L)} (12 meses). Es un pago único con tarjeta a través de Stripe: no es una suscripción, no se renueva y no habrá más cobros.`,
          'Al pagar recibes un enlace con un código personal. Quien lo tenga puede canjearlo, así que compártelo solo con la persona a la que se lo regalas. No puedes canjear un regalo que has comprado tú.',
          'Se puede canjear una sola vez, durante los 12 meses siguientes al pago. Pasado ese plazo caduca sin canjearse y no se devuelve el importe.',
          'Al canjearlo, quien lo recibe tiene el plan desde ese momento y durante los días del regalo. Si ya tenía un regalo o una prueba en marcha, los días se suman al final. Si paga una suscripción, su próximo cobro se retrasa esos días.',
          'Derecho de desistimiento: tienes 14 días naturales desde la compra para desistir, siempre que el regalo no se haya canjeado. Te devolvemos el importe completo por el mismo medio de pago y el enlace deja de funcionar. Escríbenos a ' + O.email + ' con el email de tu cuenta.',
          'Una vez canjeado, el regalo ya se ha disfrutado y no se puede devolver, porque el servicio empieza a prestarse en ese momento con el consentimiento de quien lo canjea.',
          'Para comprar un regalo entre los 14 y los 17 años hace falta la confirmación de tu madre, padre o tutor, como en el apartado 10.',
        ],
      },
    ],
  },
}
