import 'server-only'
// Tarjetas para compartir (imagen y página pública). Solo datos reales de la app: el nombre del logro o de la clase
// sale del curso, la racha es un número acotado y el nombre, del código de invitación. Nadie puede inventar textos.
import { ACHIEVEMENTS, LESSON } from './content/catalog'
import { achievementT, lessonTitleT } from './content/translate'
import { inviterName } from './game/invites'

export type ShareLang = 'es' | 'ca' | 'en'
export interface ShareCard { kicker: string; big: string; stars?: number; slots?: number; title: string; who: string | null; cta: string; lang: ShareLang; code: string | null }

const TXT = {
  es: { logro: 'Insignia conseguida', racha: 'días seguidos aprendiendo a invertir', clase: 'Clase superada', who: (n: string) => `${n} aprende a invertir con Lumi`, anon: 'Aprendiendo a invertir con Lumi', cta: 'Pruébalo gratis: clases de 5 minutos y un mercado real con dinero virtual' },
  ca: { logro: 'Insígnia aconseguida', racha: 'dies seguits aprenent a invertir', clase: 'Classe superada', who: (n: string) => `${n} aprèn a invertir amb Lumi`, anon: 'Aprenent a invertir amb Lumi', cta: 'Prova-ho gratis: classes de 5 minuts i un mercat real amb diners virtuals' },
  en: { logro: 'Badge unlocked', racha: 'days in a row learning to invest', clase: 'Lesson completed', who: (n: string) => `${n} is learning to invest with Lumi`, anon: 'Learning to invest with Lumi', cta: 'Try it free: 5-minute lessons and a real market with virtual money' },
}

export async function resolveShare(q: URLSearchParams): Promise<ShareCard | null> {
  const lang: ShareLang = q.get('l') === 'ca' || q.get('l') === 'en' ? (q.get('l') as ShareLang) : 'es'
  const T = TXT[lang]
  const code = /^[a-z0-9]{4,12}$/.test(q.get('inv') ?? '') ? q.get('inv')! : null
  const inviter = code ? await inviterName(code) : null
  const who = inviter?.valid && inviter.name ? T.who(inviter.name) : T.anon
  const base = { who, cta: T.cta, lang, code: inviter?.valid ? code : null }
  switch (q.get('t')) {
    case 'tesis': return (await import('./share-thesis')).thesisCard(q, base, lang)
    case 'logro': {
      const a = ACHIEVEMENTS.find(x => x.code === q.get('id'))
      if (!a) return null
      return { ...base, kicker: T.logro, big: '', stars: 1, slots: 1, title: achievementT(lang, a.code)?.title ?? a.title }
    }
    case 'racha': {
      const n = Number(q.get('n'))
      if (!Number.isInteger(n) || n < 1 || n > 3650) return null
      return { ...base, kicker: '', big: String(n), title: T.racha }
    }
    case 'clase': {
      const id = q.get('id') ?? ''
      const l = LESSON[id]
      if (!l) return null
      const s = Math.max(0, Math.min(3, Number(q.get('s')) || 0))
      return { ...base, kicker: T.clase, big: '', stars: s, slots: 3, title: lessonTitleT(lang, id, l.title) }
    }
  }
  return null
}
