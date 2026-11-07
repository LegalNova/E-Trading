import 'server-only'
// Textos de los avisos en el móvil. Cortos, concretos y con datos reales de la persona (racha, su clase a medias,
// lo que tiene que repasar, su puesto en la liga, el movimiento real de un activo que sigue). Sin emojis.
// Cada tipo tiene varias versiones que rotan para que no se repitan.

export type Lang = 'es' | 'ca' | 'en'
export type PushKind = 'streak' | 'streak_last' | 'unfinished' | 'unfinished2' | 'review' | 'daily' | 'nudge' | 'market' | 'pos_down' | 'pos_up' | 'watch_down' | 'watch_up' | 'morning' | 'evening' | 'league' | 'comeback' | 'trial'
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
  unfinished2: {
    es: [
      v => ({ title: `Te faltan ${v.left} pasos de «${v.lesson}»`, body: 'Lo difícil ya lo has hecho. Termínala ahora y suma tu racha de hoy.' }),
      v => ({ title: 'Última llamada para tu clase', body: `«${v.lesson}» sigue a medias. Tres minutos y la cierras.` }),
    ],
    ca: [
      v => ({ title: `Et falten ${v.left} passos de «${v.lesson}»`, body: 'El més difícil ja ho has fet. Acaba-la ara i suma la ratxa d’avui.' }),
      v => ({ title: 'Última crida per a la teva classe', body: `«${v.lesson}» continua a mitges. Tres minuts i la tanques.` }),
    ],
    en: [
      v => ({ title: `${v.left} steps left in «${v.lesson}»`, body: 'You’ve done the hard part. Finish it now and count today for your streak.' }),
      v => ({ title: 'Last call for your lesson', body: `«${v.lesson}» is still half done. Three minutes and it’s finished.` }),
    ],
  },
  nudge: {
    es: [
      v => ({ title: 'Hoy aún no has entrado', body: `Tu clase de hoy es «${v.lesson}». Cinco minutos y empiezas tu racha.` }),
      v => ({ title: 'Cinco minutos. Solo eso.', body: `«${v.lesson}» te está esperando. Mañana te lo agradecerás.` }),
    ],
    ca: [
      v => ({ title: 'Avui encara no has entrat', body: `La teva classe d’avui és «${v.lesson}». Cinc minuts i comences la ratxa.` }),
      v => ({ title: 'Cinc minuts. Només això.', body: `«${v.lesson}» t’està esperant. Demà t’ho agrairàs.` }),
    ],
    en: [
      v => ({ title: 'You haven’t been in today', body: `Today’s lesson is «${v.lesson}». Five minutes and your streak begins.` }),
      v => ({ title: 'Five minutes. That’s all.', body: `«${v.lesson}» is waiting. Tomorrow you’ll be glad you did.` }),
    ],
  },
  pos_down: {
    es: [
      v => ({ title: `Cuidado: ${v.name} está bajando`, body: `Lleva ${v.chg} hoy y está en tu cartera. Entra a ver qué pasa antes de decidir nada.` }),
      v => ({ title: `${v.name} ${v.chg} hoy`, body: 'Tu posición está cayendo. ¿Aguantas, vendes o pones un stop? Decide con cabeza, no con miedo.' }),
    ],
    ca: [
      v => ({ title: `Compte: ${v.name} està baixant`, body: `Porta ${v.chg} avui i és a la teva cartera. Entra a veure què passa abans de decidir res.` }),
      v => ({ title: `${v.name} ${v.chg} avui`, body: 'La teva posició està caient. Aguantes, vens o poses un stop? Decideix amb el cap, no amb la por.' }),
    ],
    en: [
      v => ({ title: `Heads up: ${v.name} is falling`, body: `It’s ${v.chg} today and it’s in your portfolio. Take a look before you decide anything.` }),
      v => ({ title: `${v.name} ${v.chg} today`, body: 'Your position is dropping. Hold, sell or set a stop? Decide with your head, not your fear.' }),
    ],
  },
  pos_up: {
    es: [
      v => ({ title: `Mira: ${v.name} está subiendo`, body: `Tu posición va ${v.chg} hoy. ¿Recoges beneficios o la dejas correr?` }),
      v => ({ title: `${v.name} ${v.chg} hoy`, body: 'Lo que tienes en cartera se está moviendo a tu favor. Entra a verlo.' }),
    ],
    ca: [
      v => ({ title: `Mira: ${v.name} està pujant`, body: `La teva posició va ${v.chg} avui. Reculls beneficis o la deixes córrer?` }),
      v => ({ title: `${v.name} ${v.chg} avui`, body: 'El que tens a la cartera es mou a favor teu. Entra a veure-ho.' }),
    ],
    en: [
      v => ({ title: `Look: ${v.name} is rising`, body: `Your position is ${v.chg} today. Take profits or let it run?` }),
      v => ({ title: `${v.name} ${v.chg} today`, body: 'What you hold is moving your way. Come and see.' }),
    ],
  },
  watch_down: {
    es: [
      v => ({ title: `${v.name} ha caído ${v.chg}`, body: 'La tienes en favoritos. ¿Es tu momento de comprarla? Pruébalo con tu dinero virtual.' }),
      v => ({ title: `¿Rebajas en ${v.name}?`, body: `${v.chg} hoy. Mira el gráfico y decide si entras: sin riesgo, con dinero virtual.` }),
    ],
    ca: [
      v => ({ title: `${v.name} ha caigut ${v.chg}`, body: 'La tens a preferits. És el teu moment de comprar-la? Prova-ho amb els teus diners virtuals.' }),
      v => ({ title: `Rebaixes a ${v.name}?`, body: `${v.chg} avui. Mira el gràfic i decideix si hi entres: sense risc, amb diners virtuals.` }),
    ],
    en: [
      v => ({ title: `${v.name} has dropped ${v.chg}`, body: 'It’s on your watchlist. Is this your moment to buy? Try it with your virtual money.' }),
      v => ({ title: `${v.name} on sale?`, body: `${v.chg} today. Check the chart and decide if you get in: no risk, virtual money.` }),
    ],
  },
  watch_up: {
    es: [
      v => ({ title: `${v.name} se dispara: ${v.chg}`, body: 'Está en tus favoritos y sube con fuerza. No te quedes mirando: practícalo con tu dinero virtual.' }),
      v => ({ title: `No pierdas de vista ${v.name}`, body: `${v.chg} hoy. ¿Entras ahora o esperas a que corrija?` }),
    ],
    ca: [
      v => ({ title: `${v.name} es dispara: ${v.chg}`, body: 'És als teus preferits i puja amb força. No et quedis mirant: practica-ho amb diners virtuals.' }),
      v => ({ title: `No perdis de vista ${v.name}`, body: `${v.chg} avui. Hi entres ara o esperes que corregeixi?` }),
    ],
    en: [
      v => ({ title: `${v.name} is surging: ${v.chg}`, body: 'It’s on your watchlist and climbing fast. Don’t just watch: practise with your virtual money.' }),
      v => ({ title: `Keep an eye on ${v.name}`, body: `${v.chg} today. Get in now or wait for a pullback?` }),
    ],
  },
  morning: {
    es: [
      v => ({ title: 'Buenos días: así se mueve lo tuyo', body: `${v.moves}. Hoy te toca «${v.lesson}».` }),
      v => ({ title: 'Tu mercado esta mañana', body: `${v.moves}. Y tu clase del día: «${v.lesson}».` }),
    ],
    ca: [
      v => ({ title: 'Bon dia: així es mou el que és teu', body: `${v.moves}. Avui et toca «${v.lesson}».` }),
      v => ({ title: 'El teu mercat aquest matí', body: `${v.moves}. I la teva classe del dia: «${v.lesson}».` }),
    ],
    en: [
      v => ({ title: 'Good morning: here’s how your picks move', body: `${v.moves}. Today’s lesson: «${v.lesson}».` }),
      v => ({ title: 'Your market this morning', body: `${v.moves}. And your lesson of the day: «${v.lesson}».` }),
    ],
  },
  evening: {
    es: [
      v => ({ title: 'Tu día en Lumi', body: `${v.summary}. Mañana: «${v.lesson}».` }),
      v => ({ title: 'Buen trabajo hoy', body: `${v.summary}. Descansa: mañana sigue «${v.lesson}».` }),
    ],
    ca: [
      v => ({ title: 'El teu dia a Lumi', body: `${v.summary}. Demà: «${v.lesson}».` }),
      v => ({ title: 'Bona feina avui', body: `${v.summary}. Descansa: demà continua «${v.lesson}».` }),
    ],
    en: [
      v => ({ title: 'Your day on Lumi', body: `${v.summary}. Tomorrow: «${v.lesson}».` }),
      v => ({ title: 'Good work today', body: `${v.summary}. Rest up: «${v.lesson}» is next.` }),
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
