// Textos legales en castellano (versión de referencia). Ver docs/09-legal.md para las fuentes.
import { LEGAL_UPDATED } from '@/shared/legal'
import { OWNER } from './owner'
import type { LegalDoc, LegalSlug } from './types'

const O = OWNER

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
          'Los precios se obtienen de fuentes de terceros (Finnhub, Binance, Yahoo Finance y el Banco Central Europeo) y pueden tener retraso o errores. Se muestran solo con fines educativos y no deben usarse para tomar decisiones de inversión reales.',
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
          'Simulador: órdenes, operaciones, cartera virtual y alertas de precio. Todo es dinero virtual: no tratamos datos bancarios ni de pago.',
          'Datos técnicos: dirección IP y navegador, para la seguridad, los límites de uso y el inicio de sesión.',
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
            ['Avisos dentro de la app (racha, órdenes, logros)', 'Ejecución del contrato (6.1.b); puedes desactivarlos en Ajustes'],
            ['Responder a tus mensajes de contacto', 'Tu solicitud y nuestro interés legítimo en atenderla (6.1.b y 6.1.f)'],
            ['Enviarte novedades si te apuntas a la lista', 'Tu consentimiento (6.1.a), que puedes retirar cuando quieras'],
            ['Cumplir obligaciones legales', 'Obligación legal (6.1.c)'],
          ],
        },
      },
      {
        h: '4. Menores de edad',
        p: [
          'Para registrarte debes tener al menos 14 años, la edad a partir de la cual se puede consentir el tratamiento de datos en España (LOPDGDD, art. 7). Si tienes entre 14 y 17 años puedes usar el plan gratuito; para contratar Premium hará falta que lo confirme tu madre, padre o tutor.',
          'Si sabemos que una cuenta pertenece a un menor de 14 años, la eliminaremos.',
        ],
      },
      {
        h: '5. Cuánto tiempo guardamos los datos',
        list: [
          'Cuenta, progreso y simulador: mientras tengas la cuenta. Al borrarla desde Ajustes se eliminan de inmediato; las copias de seguridad técnicas se sobrescriben en un máximo de 7 días.',
          'Registros de seguridad (por ejemplo, intentos de acceso): hasta 12 meses.',
          'Mensajes de contacto: 12 meses desde la última respuesta.',
          'Lista de novedades: hasta que te des de baja.',
        ],
      },
      {
        h: '6. Quién trata los datos por nuestra cuenta',
        p: ['Contamos con proveedores que actúan como encargados del tratamiento, con contrato conforme al art. 28 del RGPD:'],
        table: {
          head: ['Proveedor', 'Servicio', 'Ubicación y garantías'],
          rows: [
            ['Vercel Inc.', 'Alojamiento de la aplicación', 'EE. UU. · Marco de Privacidad de Datos UE-EE. UU. y cláusulas contractuales tipo'],
            ['Neon Inc. (sobre Amazon Web Services)', 'Base de datos', 'EE. UU. (us-east-1) · contrato de encargado y cláusulas contractuales tipo'],
            ['Google LLC', 'Inicio de sesión con Google (solo si lo usas)', 'EE. UU. · Marco de Privacidad de Datos UE-EE. UU.'],
          ],
        },
      },
      {
        h: '7. Transferencias internacionales',
        p: ['Algunos de estos proveedores están en Estados Unidos. Las transferencias se amparan en la decisión de adecuación del Marco de Privacidad de Datos UE-EE. UU. y, cuando corresponde, en las cláusulas contractuales tipo aprobadas por la Comisión Europea.'],
      },
      {
        h: '8. Fuentes de precios',
        p: ['Los precios del mercado los pide nuestro servidor a Finnhub, Binance, Yahoo Finance y el Banco Central Europeo. Estas fuentes no reciben ningún dato tuyo.'],
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
        p: ['No tomamos decisiones con efectos jurídicos basadas solo en tratamientos automatizados. Los mensajes de Lumi y los avisos de riesgo se generan con reglas educativas sencillas (por ejemplo, el peso de un activo en tu cartera) y no limitan lo que puedes hacer.'],
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
          'Debes tener al menos 14 años. Entre 14 y 17 años, para contratar Premium hace falta el consentimiento de tu madre, padre o tutor.',
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
        h: '7. Premium',
        list: [
          'Premium amplía las clases, las vidas, el saldo virtual y los tipos de orden. El precio y las condiciones se muestran antes de contratar.',
          'Hay una prueba gratuita de 7 días, una por persona. En la versión actual el pago todavía no está activo: la prueba termina sola y vuelves a Free sin coste.',
          'Cuando el pago esté activo: la suscripción se renovará automáticamente hasta que la canceles desde Ajustes, te avisaremos antes de cada cobro y, como consumidor, tendrás 14 días naturales para desistir desde la contratación.',
        ],
      },
      {
        h: '8. Propiedad intelectual',
        p: ['El contenido de E-Trading pertenece a su titular o se usa con licencia. Puedes usarlo para tu aprendizaje personal, pero no copiarlo ni distribuirlo sin permiso.'],
      },
      {
        h: '9. Responsabilidad',
        p: ['Ponemos el máximo cuidado en el servicio, pero puede tener errores o interrupciones. No respondemos de decisiones de inversión reales tomadas a partir de la aplicación. Nada de lo anterior limita los derechos que te reconoce la ley como consumidor.'],
      },
      {
        h: '10. Cambios en el servicio y en los términos',
        p: ['Podemos mejorar o cambiar funciones. Si cambiamos estos términos de forma importante te avisaremos con antelación dentro de la aplicación.'],
      },
      {
        h: '11. Ley y conflictos',
        p: [
          `Se aplica la ley española. Si tienes un problema, escríbenos primero a ${O.email} y lo intentaremos resolver. Como consumidor puedes acudir también a los organismos de consumo de tu comunidad autónoma y a los juzgados de tu domicilio.`,
        ],
      },
    ],
  },
}
