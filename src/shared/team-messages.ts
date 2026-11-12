// Mensajes del equipo: plantillas (con el nombre de la persona) y reglas del texto, iguales en el panel y en el servidor.
import { realName } from './names'

export type TeamLang = 'es' | 'ca' | 'en'
export const TEAM_TEMPLATES = ['welcome', 'comeback', 'congrats', 'thanks'] as const
export type TeamTemplate = (typeof TEAM_TEMPLATES)[number]

export const TITLE_MAX = 80
export const TEXT_MAX = 1000

/** Cabecera de la ventana y título por defecto del aviso */
export const TEAM_HEADER: Record<TeamLang, string> = {
  es: 'Mensaje del equipo de E-Trading',
  ca: 'Missatge de l’equip d’E-Trading',
  en: 'A message from the E-Trading team',
}

/** {nombre} (o {nom}, {name}) se cambia por el nombre de cada persona */
export const TEMPLATE_TEXT: Record<TeamLang, Record<TeamTemplate, { title: string; text: string }>> = {
  es: {
    welcome: { title: 'Te damos la bienvenida', text: 'Hola {nombre}, gracias por confiar en nosotros. Hemos creado E-Trading para que aprendas a invertir con calma: sin gurús, sin señales y sin promesas. Si algo no se entiende o echas algo en falta, cuéntanoslo con «Algo no está bien». Lo leemos todo.' },
    comeback: { title: 'Te echamos de menos', text: 'Hola {nombre}, hace unos días que no te vemos. Tu próxima clase dura pocos minutos y tu cartera virtual te espera. ¿Te animas hoy?' },
    congrats: { title: '¡Enhorabuena!', text: 'Hola {nombre}, queríamos felicitarte por lo que llevas aprendido. Sigue así: aprender a decidir con calma es lo que más cuenta.' },
    thanks: { title: 'Gracias por tu opinión', text: 'Hola {nombre}, gracias por contarnos lo que piensas. Lo tenemos en cuenta para mejorar la app.' },
  },
  ca: {
    welcome: { title: 'Et donem la benvinguda', text: 'Hola {nom}, gràcies per confiar en nosaltres. Hem creat E-Trading perquè aprenguis a invertir amb calma: sense gurus, sense senyals i sense promeses. Si alguna cosa no s’entén o hi trobes a faltar alguna cosa, explica-ho amb «Alguna cosa no va bé». Ho llegim tot.' },
    comeback: { title: 'Et trobem a faltar', text: 'Hola {nom}, fa uns dies que no et veiem. La teva propera classe dura pocs minuts i la teva cartera virtual t’espera. T’hi animes avui?' },
    congrats: { title: 'Enhorabona!', text: 'Hola {nom}, volíem felicitar-te per tot el que has après. Continua així: aprendre a decidir amb calma és el que més compta.' },
    thanks: { title: 'Gràcies per la teva opinió', text: 'Hola {nom}, gràcies per explicar-nos què en penses. Ho tenim en compte per millorar l’app.' },
  },
  en: {
    welcome: { title: 'Welcome aboard', text: 'Hi {name}, thanks for trusting us. We built E-Trading so you can learn to invest calmly: no gurus, no signals, no promises. If anything is unclear or missing, tell us with “Something’s not right”. We read everything.' },
    comeback: { title: 'We miss you', text: 'Hi {name}, we haven’t seen you for a few days. Your next lesson only takes a few minutes and your virtual portfolio is waiting. Fancy it today?' },
    congrats: { title: 'Congratulations!', text: 'Hi {name}, we wanted to congratulate you on everything you’ve learnt. Keep going: learning to decide calmly is what matters most.' },
    thanks: { title: 'Thanks for your feedback', text: 'Hi {name}, thanks for telling us what you think. We’re using it to improve the app.' },
  },
}

const NAME_TOKEN = /\{(nombre|nom|name)\}/gi

/** Primer nombre de la persona («Marta Ruiz» → «Marta»); vacío si no lo sabemos */
export const firstName = (name: string | null | undefined) => realName(name).split(/\s+/)[0]?.slice(0, 30) ?? ''

/** Pone el nombre. Sin nombre, quita el hueco: «Hola {nombre}, gracias» → «Hola, gracias» */
export function personalize(text: string, name: string | null | undefined) {
  const n = firstName(name)
  if (n) return text.replace(NAME_TOKEN, n)
  return text
    .replace(/\s*\{(nombre|nom|name)\}/gi, '')
    .replace(/ +([,.!?;:])/g, '$1')
    .trim()
}

/** Enlaces de cualquier tipo (como en los regalos): el mensaje del equipo no los lleva */
export const HAS_LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ly|es|cat|eu|app|me|co|xyz|info|link|site|online|top|shop|gg|tv|ai|dev)\b)/i
/** Etiquetas HTML: se escribe solo texto */
export const HAS_HTML = /<\/?[a-z!][^>]*>/i
