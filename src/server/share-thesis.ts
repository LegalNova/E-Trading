import 'server-only'
// Certificado público de una tesis terminada (/s?t=tesis&code=… y su imagen). Solo enseña el nombre de pila,
// la empresa analizada y la puntuación: nada de las respuestas ni otros datos de la persona.
import { firstName } from '@/shared/thesis'
import { db } from './db'
import type { ShareCard, ShareLang } from './share'

const TXT = {
  es: { done: 'Completada', kicker: (c: string) => `Tesis de inversión · ${c}`, first: (n: string) => `${n} ha completado su primera tesis de inversión con E-Trading`, next: (n: string) => `${n} ha completado una tesis de inversión con E-Trading`, who: 'Puntuación de la tesis, de 0 a 100', anon: 'Alguien' },
  ca: { done: 'Completada', kicker: (c: string) => `Tesi d'inversió · ${c}`, first: (n: string) => `${n} ha completat la seva primera tesi d'inversió amb E-Trading`, next: (n: string) => `${n} ha completat una tesi d'inversió amb E-Trading`, who: 'Puntuació de la tesi, de 0 a 100', anon: 'Algú' },
  en: { done: 'Completed', kicker: (c: string) => `Investment thesis · ${c}`, first: (n: string) => `${n} has completed their first investment thesis with E-Trading`, next: (n: string) => `${n} has completed an investment thesis with E-Trading`, who: 'Thesis score, out of 100', anon: 'Someone' },
}

export async function thesisCard(q: URLSearchParams, base: Omit<ShareCard, 'kicker' | 'big' | 'title'>, lang: ShareLang): Promise<ShareCard | null> {
  const code = q.get('code') ?? ''
  if (!/^[a-f0-9]{12}$/.test(code)) return null
  const t = await db.thesis.findUnique({ where: { shareCode: code }, select: { userId: true, symbol: true, score: true, status: true, completedAt: true, user: { select: { name: true, isAnonymous: true } } } })
  if (!t || t.status !== 'DONE' || t.score === null || !t.completedAt) return null
  const [asset, earlier] = await Promise.all([
    db.asset.findUnique({ where: { symbol: t.symbol }, select: { name: true } }),
    db.thesis.count({ where: { userId: t.userId, status: 'DONE', completedAt: { lt: t.completedAt } } }),
  ])
  const T = TXT[lang]
  const name = (!t.user.isAnonymous && firstName(t.user.name)) || T.anon
  return { ...base, kicker: T.kicker(asset?.name ?? t.symbol), // La puntuación solo se enseña si es buena: compartir no debe dejar a nadie en mal lugar
    big: t.score >= 70 ? `${t.score}/100` : T.done, title: earlier ? T.next(name) : T.first(name), who: t.score >= 70 ? T.who : '' }
}
