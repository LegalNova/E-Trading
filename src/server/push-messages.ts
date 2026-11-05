import 'server-only'
// Textos de los avisos en el móvil. Cortos, concretos y con datos reales de la persona (racha, su clase a medias,
// lo que tiene que repasar, su puesto en la liga, el movimiento real de un activo que sigue). Sin emojis.
// Cada tipo tiene varias versiones que rotan para que no se repitan.

export type Lang = 'es' | 'ca' | 'en'
export type PushKind = 'streak' | 'streak_last' | 'unfinished' | 'review' | 'daily' | 'market' | 'league' | 'comeback' | 'trial'
type V = Record<string, string | number>
type Msg = { title: string; body: string }

const T: Record<PushKind, Record<Lang, ((v: V) => Msg)[]>> = {
  streak: {
    es: [
      v => ({ title: `Tu racha de ${v.n} días sigue viva`, body: 'Aún estás a tiempo: una clase de 5 minutos y mañana sigue creciendo.' }),
      v => ({ title: `${v.n} días seguidos. No lo tires ahora`, body: `Te espera «${v.lesson}». Cinco minutos y la racha está salvada.` }),
      v => ({ title: 'Lumi te guarda el sitio', body: `Llevas ${v.n} días aprendiendo sin fallar. Hoy todavía no: ¿una clase rápida?` }),
    ],
    ca: [
      v => ({ title: `La teva ratxa de ${v.n} dies continua viva`, body: 'Encara hi ets a temps: una classe de 5 minuts i demà continua creixent.' }),
      v => ({ title: `${v.n} dies seguits. No ho llencis ara`, body: `T’espera «${v.lesson}». Cinc minuts i la ratxa està salvada.` }),
      v => ({ title: 'La Lumi et guarda el lloc', body: `Portes ${v.n} dies aprenent sense fallar. Avui encara no: una classe ràpida?` }),
    ],
    en: [
      v => ({ title: `Your ${v.n}-day streak is still alive`, body: 'There’s still time: one 5-minute lesson and it keeps growing tomorrow.' }),
      v => ({ title: `${v.n} days in a row. Don’t throw it away now`, body: `«${v.lesson}» is waiting. Five minutes and your streak is safe.` }),
      v => ({ title: 'Lumi is saving your spot', body: `You’ve learned ${v.n} days without missing one. Not today yet: a quick lesson?` }),
    ],
  },
  streak_last: {
    es: [v => ({ title: `Últimas horas para tu racha de ${v.n} días`, body: 'A medianoche se pierde. Un repaso de 2 minutos también cuenta.' })],
    ca: [v => ({ title: `Últimes hores per a la teva ratxa de ${v.n} dies`, body: 'A mitjanit es perd. Un repàs de 2 minuts també compta.' })],
    en: [v => ({ title: `Last hours for your ${v.n}-day streak`, body: 'It resets at midnight. A 2-minute review counts too.' })],
  },
  unfinished: {
    es: [
      v => ({ title: 'Te quedaste a medias', body: `«${v.lesson}»: llegaste al paso ${v.step} de ${v.of}. Te falta muy poco para terminarla.` }),
      v => ({ title: `«${v.lesson}» te está esperando`, body: `Ibas por el paso ${v.step}. Termínala y llévate tus ${v.xp} XP.` }),
    ],
    ca: [
      v => ({ title: 'Et vas quedar a mitges', body: `«${v.lesson}»: vas arribar al pas ${v.step} de ${v.of}. Et falta molt poc per acabar-la.` }),
      v => ({ title: `«${v.lesson}» t’està esperant`, body: `Anaves pel pas ${v.step}. Acaba-la i emporta’t els teus ${v.xp} XP.` }),
    ],
    en: [
      v => ({ title: 'You stopped halfway', body: `«${v.lesson}»: you reached step ${v.step} of ${v.of}. You’re very close to the end.` }),
      v => ({ title: `«${v.lesson}» is waiting for you`, body: `You were on step ${v.step}. Finish it and grab your ${v.xp} XP.` }),
    ],
  },
  review: {
    es: [
      v => ({ title: `${v.n} conceptos a punto de olvidarse`, body: 'Un repaso rápido ahora y se te quedan para siempre. Son 2 minutos.' }),
      v => ({ title: 'Lo que fallaste, hoy lo clavas', body: `Tienes ${v.n} preguntas para repasar justo cuando más se aprende.` }),
    ],
    ca: [
      v => ({ title: `${v.n} conceptes a punt d’oblidar-se`, body: 'Un repàs ràpid ara i se’t queden per sempre. Són 2 minuts.' }),
      v => ({ title: 'El que vas fallar, avui ho claves', body: `Tens ${v.n} preguntes per repassar just quan més s’aprèn.` }),
    ],
    en: [
      v => ({ title: `${v.n} ideas about to slip away`, body: 'A quick review now and they stick for good. It takes 2 minutes.' }),
      v => ({ title: 'What you missed, you nail today', body: `You have ${v.n} questions to review right when it helps most.` }),
    ],
  },
  daily: {
    es: [
      v => ({ title: 'Tu clase de hoy está lista', body: `«${v.lesson}» · ${v.min} minutos. Empieza el día sabiendo algo nuevo de tu dinero.` }),
      v => ({ title: `Hoy toca: ${v.lesson}`, body: 'Cinco minutos, una historia con decisiones y un reto. ¿Vamos?' }),
      v => ({ title: 'Cinco minutos para tu yo de dentro de 10 años', body: `Tu siguiente clase: «${v.lesson}».` }),
    ],
    ca: [
      v => ({ title: 'La teva classe d’avui és a punt', body: `«${v.lesson}» · ${v.min} minuts. Comença el dia sabent una cosa nova dels teus diners.` }),
      v => ({ title: `Avui toca: ${v.lesson}`, body: 'Cinc minuts, una història amb decisions i un repte. Som-hi?' }),
      v => ({ title: 'Cinc minuts per al teu jo d’aquí a 10 anys', body: `La teva classe següent: «${v.lesson}».` }),
    ],
    en: [
      v => ({ title: 'Today’s lesson is ready', body: `«${v.lesson}» · ${v.min} minutes. Start the day knowing something new about your money.` }),
      v => ({ title: `Today: ${v.lesson}`, body: 'Five minutes, a story with choices and a challenge. Shall we?' }),
      v => ({ title: 'Five minutes for future you', body: `Your next lesson: «${v.lesson}».` }),
    ],
  },
  market: {
    es: [
      v => ({ title: `${v.name} se mueve hoy: ${v.chg}`, body: 'Abre el mercado y mira qué está pasando. Con dinero virtual, sin riesgo.' }),
      v => ({ title: 'Es tu momento del día en el mercado', body: `${v.name} ${v.chg} hoy. ¿Lo sigues de cerca o esperas?` }),
    ],
    ca: [
      v => ({ title: `${v.name} es mou avui: ${v.chg}`, body: 'Obre el mercat i mira què està passant. Amb diners virtuals, sense risc.' }),
      v => ({ title: 'És el teu moment del dia al mercat', body: `${v.name} ${v.chg} avui. El segueixes de prop o esperes?` }),
    ],
    en: [
      v => ({ title: `${v.name} is moving today: ${v.chg}`, body: 'Open the market and see what’s happening. Virtual money, no risk.' }),
      v => ({ title: 'Your market moment of the day', body: `${v.name} ${v.chg} today. Keep a close eye or wait?` }),
    ],
  },
  league: {
    es: [
      v => ({ title: `Puesto ${v.rank} en tu liga`, body: Number(v.gap) > 0 ? `Te faltan ${v.gap} puntos para la zona de ascenso. Quedan ${v.hours} horas.` : `Estás en zona de ascenso. Quedan ${v.hours} horas: defiéndela.` }),
    ],
    ca: [
      v => ({ title: `Lloc ${v.rank} a la teva lliga`, body: Number(v.gap) > 0 ? `Et falten ${v.gap} punts per a la zona d’ascens. Queden ${v.hours} hores.` : `Ets a la zona d’ascens. Queden ${v.hours} hores: defensa-la.` }),
    ],
    en: [
      v => ({ title: `${v.rank}${v.rank === 1 ? 'st' : v.rank === 2 ? 'nd' : v.rank === 3 ? 'rd' : 'th'} in your league`, body: Number(v.gap) > 0 ? `${v.gap} points from the promotion zone. ${v.hours} hours left.` : `You’re in the promotion zone. ${v.hours} hours left: hold on to it.` }),
    ],
  },
  comeback: {
    es: [
      () => ({ title: 'Lumi te echa de menos', body: 'Tu cartera virtual sigue moviéndose. Entra a ver cómo va y haz una clase corta.' }),
      v => ({ title: 'Retoma donde lo dejaste', body: `Tu siguiente clase es «${v.lesson}». Cinco minutos y vuelves a coger el ritmo.` }),
    ],
    ca: [
      () => ({ title: 'La Lumi et troba a faltar', body: 'La teva cartera virtual continua movent-se. Entra a veure com va i fes una classe curta.' }),
      v => ({ title: 'Reprèn-ho on ho vas deixar', body: `La teva classe següent és «${v.lesson}». Cinc minuts i tornes a agafar el ritme.` }),
    ],
    en: [
      () => ({ title: 'Lumi misses you', body: 'Your virtual portfolio keeps moving. Come and see how it’s doing and take a short lesson.' }),
      v => ({ title: 'Pick up where you left off', body: `Your next lesson is «${v.lesson}». Five minutes and you’re back in rhythm.` }),
    ],
  },
  trial: {
    es: [v => ({ title: `Te quedan ${v.n} días de Max`, body: 'Aprovecha: todo el curso abierto y vidas ilimitadas. Hoy, una clase de las avanzadas.' })],
    ca: [v => ({ title: `Et queden ${v.n} dies de Max`, body: 'Aprofita-ho: tot el curs obert i vides il·limitades. Avui, una classe de les avançades.' })],
    en: [v => ({ title: `${v.n} days of Max left`, body: 'Make the most of it: the whole course and unlimited lives. Try an advanced lesson today.' })],
  },
}

/** Mensaje del tipo indicado; la versión depende del día, para que no se repita siempre la misma */
export function pushText(kind: PushKind, lang: Lang, vars: V, seed: number): Msg {
  const list = T[kind][lang] ?? T[kind].es
  return list[Math.abs(seed) % list.length](vars)
}
