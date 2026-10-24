// Textos legals en català (traducció de la versió en castellà, que preval en cas de dubte)
import { OWNER } from './owner'
import type { LegalDoc, LegalSlug } from './types'

const O = OWNER
const UPDATED = '24 d’octubre de 2026'

export const ca: Record<LegalSlug, LegalDoc> = {
  'aviso-legal': {
    title: 'Avís legal',
    intro: `Darrera actualització: ${UPDATED}. Informació exigida per la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE).`,
    sections: [
      { h: '1. Titular', table: { head: ['Dada', 'Valor'], rows: [['Titular', O.name], ['NIF', O.nif], ['Domicili', O.address], ['Email de contacte', O.email], ['Lloc web', O.site]] } },
      {
        h: '2. Què és E-Trading',
        p: [
          'E-Trading és una aplicació educativa per aprendre a invertir amb classes, qüestionaris i un simulador de mercat amb diners virtuals.',
          'E-Trading no és una entitat financera ni una empresa de serveis d’inversió: no rep diners dels usuaris, no executa operacions reals, no es connecta a cap bròquer i no presta assessorament en matèria d’inversió. Per això no està autoritzada ni supervisada per la Comissió Nacional del Mercat de Valors (CNMV).',
        ],
      },
      {
        h: '3. Informació de mercat',
        p: [
          'Els preus s’obtenen de fonts de tercers (Finnhub, Binance, Yahoo Finance i el Banc Central Europeu) i poden tenir retard o errors. Es mostren només amb finalitats educatives i no s’han de fer servir per prendre decisions d’inversió reals.',
          'Res del que apareix a l’aplicació —incloent-hi els missatges de la Lumi, els avisos de risc o les classes— és una recomanació personalitzada de comprar, vendre o mantenir cap instrument financer.',
        ],
      },
      { h: '4. Condicions d’ús del lloc', p: ['L’ús de l’aplicació implica acceptar aquest avís legal, les Condicions d’ús, la Política de privadesa i la Política de galetes.'] },
      {
        h: '5. Propietat intel·lectual',
        p: [
          'Els textos, exercicis, disseny, logotips, la mascota Lumi i el codi d’E-Trading pertanyen al seu titular o s’utilitzen amb llicència. No es poden copiar ni distribuir sense autorització, llevat d’ús personal i no comercial.',
          'Les marques i noms d’empreses que apareixen al simulador pertanyen als seus titulars i se citen només per identificar els actius.',
        ],
      },
      {
        h: '6. Responsabilitat',
        p: [
          'El titular procura que la informació sigui correcta i que el servei estigui disponible, però no garanteix l’absència d’errors ni d’interrupcions. No respon de les decisions preses fora de l’aplicació a partir del seu contingut.',
          'Els enllaços a llocs de tercers s’ofereixen només com a referència; el titular no en controla el contingut.',
        ],
      },
      { h: '7. Llei aplicable', p: ['Aquest avís legal es regeix per la llei espanyola. Per a qualsevol controvèrsia amb consumidors seran competents els jutjats i tribunals del domicili del consumidor.'] },
    ],
  },

  privacidad: {
    title: 'Política de privadesa',
    intro: `Darrera actualització: ${UPDATED}. T’expliquem quines dades tractem, per a què i quins drets tens, d’acord amb el Reglament general de protecció de dades (RGPD) i la Llei orgànica 3/2018 (LOPDGDD).`,
    sections: [
      { h: '1. Responsable del tractament', p: [`${O.name} (NIF ${O.nif}), amb domicili a ${O.address}. Ens pots escriure a ${O.email} per a qualsevol qüestió de privadesa.`] },
      {
        h: '2. Quines dades tractem',
        list: [
          'Compte: email, nom que triïs i contrasenya (desada xifrada amb un algorisme d’un sol sentit; mai no la veiem). Si entres amb Google, rebem el teu email i el teu nom de Google.',
          'Perfil: tractament (femení, masculí o neutre), data de naixement, objectius, objectiu diari, idioma, moneda i tema.',
          'Activitat educativa: lliçons, respostes dels qüestionaris, XP, ratxa, vides, gemmes, assoliments i posició a la lliga.',
          'Simulador: ordres, operacions, cartera virtual i alertes de preu. Tot són diners virtuals: no tractem dades bancàries ni de pagament.',
          'Dades tècniques: adreça IP i navegador, per a la seguretat, els límits d’ús i l’inici de sessió.',
          'Preguntes a la Lumi (la professora): el text de les teves preguntes, les respostes i el mode triat, per mostrar-te l’historial i comptar el teu límit diari. La Lumi funciona als nostres propis servidors: les teves preguntes no s’envien a cap servei d’intel·ligència artificial de tercers. Pots esborrar l’historial quan vulguis.',
          'Comunicacions: el que ens enviïs pel formulari de contacte i, si t’hi apuntes, el teu email a la llista de novetats.',
        ],
        p: ['No fem servir eines d’analítica ni de publicitat de tercers i no venem les teves dades.'],
      },
      {
        h: '3. Per a què i amb quina base legal',
        table: {
          head: ['Finalitat', 'Base legal (RGPD art. 6)'],
          rows: [
            ['Crear el teu compte i prestar-te el servei (classes, simulador, progrés, lliga)', 'Execució del contracte que acceptes en registrar-te (6.1.b)'],
            ['Mostrar el teu nom (nom i inicial) a la lliga setmanal', 'Interès legítim en el funcionament del joc (6.1.f). Pots aparèixer com a «Jugador anònim» a Configuració'],
            ['Seguretat, prevenció d’abusos i límits d’ús', 'Interès legítim a protegir el servei i els usuaris (6.1.f)'],
            ['Avisos dins de l’app (ratxa, ordres, assoliments)', 'Execució del contracte (6.1.b); els pots desactivar a Configuració'],
            ['Respondre les teves preguntes a la Lumi amb el manual del curs i el teu progrés', 'Execució del contracte (6.1.b)'],
            ['Respondre els teus missatges de contacte', 'La teva sol·licitud i el nostre interès legítim a atendre-la (6.1.b i 6.1.f)'],
            ['Enviar-te novetats si t’apuntes a la llista', 'El teu consentiment (6.1.a), que pots retirar quan vulguis'],
            ['Complir obligacions legals', 'Obligació legal (6.1.c)'],
          ],
        },
      },
      {
        h: '4. Menors d’edat',
        p: [
          'Per registrar-te has de tenir almenys 14 anys, l’edat a partir de la qual es pot consentir el tractament de dades a Espanya (LOPDGDD, art. 7). Si tens entre 14 i 17 anys pots fer servir el pla gratuït; per contractar Premium caldrà que ho confirmi la teva mare, pare o tutor.',
          'Si sabem que un compte pertany a un menor de 14 anys, l’eliminarem.',
        ],
      },
      {
        h: '5. Quant de temps desem les dades',
        list: [
          'Compte, progrés i simulador: mentre tinguis el compte. En esborrar-lo des de Configuració s’eliminen de seguida; les còpies de seguretat tècniques se sobreescriuen en un màxim de 7 dies.',
          'Registres de seguretat (per exemple, intents d’accés): fins a 12 mesos.',
          'Converses amb la Lumi: mentre tinguis el compte o fins que n’esborris l’historial.',
          'Missatges de contacte: 12 mesos des de la darrera resposta.',
          'Llista de novetats: fins que et donis de baixa.',
        ],
      },
      {
        h: '6. Qui tracta les dades per compte nostre',
        p: ['Comptem amb proveïdors que actuen com a encarregats del tractament, amb contracte d’acord amb l’art. 28 del RGPD:'],
        table: {
          head: ['Proveïdor', 'Servei', 'Ubicació i garanties'],
          rows: [
            ['Vercel Inc.', 'Allotjament de l’aplicació', 'EUA · Marc de privadesa de dades UE-EUA i clàusules contractuals tipus'],
            ['Neon Inc. (sobre Amazon Web Services)', 'Base de dades', 'EUA (us-east-1) · contracte d’encarregat i clàusules contractuals tipus'],
            ['Google LLC', 'Inici de sessió amb Google (només si el fas servir)', 'EUA · Marc de privadesa de dades UE-EUA'],
          ],
        },
      },
      { h: '7. Transferències internacionals', p: ['Alguns d’aquests proveïdors són als Estats Units. Les transferències s’emparen en la decisió d’adequació del Marc de privadesa de dades UE-EUA i, quan escau, en les clàusules contractuals tipus aprovades per la Comissió Europea.'] },
      { h: '8. Fonts de preus', p: ['El nostre servidor demana els preus a Finnhub, Binance, Yahoo Finance i el Banc Central Europeu. Aquestes fonts no reben cap dada teva.'] },
      {
        h: '9. Els teus drets',
        p: [
          'Pots accedir a les teves dades, rectificar-les, suprimir-les, oposar-te al tractament, demanar-ne la limitació i la portabilitat, i retirar el teu consentiment en qualsevol moment.',
          `Des de Configuració → Compte pots descarregar totes les teves dades (portabilitat) i esborrar el compte. Per a la resta, escriu-nos a ${O.email}. Et respondrem en un termini màxim d’un mes.`,
          'Si creus que no hem atès bé la teva sol·licitud, pots reclamar davant l’Agència Espanyola de Protecció de Dades (www.aepd.es).',
        ],
      },
      { h: '10. Decisions automatitzades', p: ['No prenem decisions amb efectes jurídics basades només en tractaments automatitzats. Els missatges de la Lumi i els avisos de risc es generen amb regles educatives senzilles i no limiten el que pots fer.'] },
      { h: '11. Seguretat', p: ['Tota la comunicació va xifrada (HTTPS). Les contrasenyes es desen amb hash, la sessió fa servir una galeta protegida (HttpOnly, Secure, SameSite) i apliquem límits d’ús i controls per evitar abusos.'] },
      { h: '12. Canvis', p: ['Si canviem aquesta política de manera important t’ho avisarem dins de l’aplicació. La data de la darrera actualització apareix a dalt.'] },
    ],
  },

  cookies: {
    title: 'Política de galetes',
    intro: `Darrera actualització: ${UPDATED}. D’acord amb l’art. 22.2 de la LSSI-CE i la Guia sobre l’ús de galetes de l’AEPD.`,
    sections: [
      { h: '1. Què són', p: ['Les galetes i tecnologies semblants (com l’emmagatzematge local del navegador) són petits fitxers que un web desa al teu dispositiu per recordar informació.'] },
      {
        h: '2. Què fem servir',
        p: ['E-Trading només fa servir galetes i emmagatzematge tècnics o de preferències que tu tries. No fem servir galetes d’analítica, de publicitat ni de tercers.'],
        table: {
          head: ['Nom', 'Titular', 'Per a què', 'Durada', 'Tipus'],
          rows: [
            ['__Secure-better-auth.session_token', 'E-Trading', 'Mantenir la sessió iniciada de manera segura', '30 dies', 'Tècnica, necessària'],
            ['better-auth.state', 'E-Trading', 'Protegir l’inici de sessió amb Google (només si el fas servir)', '10 minuts', 'Tècnica, necessària'],
            ['NEXT_LOCALE', 'E-Trading', 'Recordar l’idioma que triïs a Configuració', '1 any', 'De preferència triada per tu'],
            ['et-theme (emmagatzematge local)', 'E-Trading', 'Recordar el tema clar o fosc', 'Fins que l’esborris', 'De preferència triada per tu'],
            ['et-cookies (emmagatzematge local)', 'E-Trading', 'Recordar que ja has vist l’avís de galetes', 'Fins que l’esborris', 'Tècnica'],
          ],
        },
      },
      {
        h: '3. Consentiment',
        p: [
          'Les galetes tècniques i les de preferències que sol·licites estan exemptes de consentiment (LSSI-CE art. 22.2). Per això no et demanem que acceptis res: només t’informem.',
          'Si algun dia afegim galetes que necessitin el teu permís (per exemple, d’analítica), te’l demanarem abans de fer-les servir, amb les opcions «Acceptar» i «Rebutjar» al mateix nivell, i podràs canviar la teva decisió en qualsevol moment.',
        ],
      },
      { h: '4. Com esborrar-les o bloquejar-les', p: ['Pots esborrar o bloquejar les galetes des de la configuració del teu navegador. Si bloqueges la galeta de sessió no podràs iniciar sessió.'] },
    ],
  },

  terminos: {
    title: 'Condicions d’ús',
    intro: `Darrera actualització: ${UPDATED}. Aquestes condicions regulen l’ús d’E-Trading. En crear un compte les acceptes.`,
    sections: [
      { h: '1. El servei', p: [`E-Trading, de ${O.name}, ofereix classes, qüestionaris, un simulador de mercat amb diners virtuals i elements de joc (XP, ratxa, vides, gemmes, assoliments i lliga) per aprendre a invertir.`] },
      {
        h: '2. És una simulació educativa',
        list: [
          'No s’opera amb diners reals ni es poden ingressar o retirar diners. El saldo de la cartera és virtual i no té cap valor econòmic.',
          'No és assessorament financer ni una recomanació d’inversió. Els resultats del simulador no garanteixen resultats reals.',
          'Els preus vénen de fonts de tercers, poden tenir retard o errors i el simulador simplifica la realitat (per exemple, no hi ha dividends ni forquilles de preu).',
        ],
      },
      {
        h: '3. El teu compte',
        list: [
          'Has de tenir almenys 14 anys. Entre 14 i 17 anys, per contractar Premium cal el consentiment de la teva mare, pare o tutor.',
          'Un compte per persona. Vigila la teva contrasenya: ets responsable del que es faci amb el teu compte.',
          'Pots esborrar el compte quan vulguis des de Configuració.',
        ],
      },
      {
        h: '4. Ús acceptable',
        p: ['No es permet:'],
        list: [
          'Fer servir bots, scripts o qualsevol automatització per respondre, operar o guanyar XP, gemmes o posicions a la lliga.',
          'Aprofitar errors del servei per obtenir avantatges, o no avisar-nos-en quan els descobreixis.',
          'Crear diversos comptes per manipular la lliga o les recompenses.',
          'Intentar accedir a dades d’altres persones, saturar el servei o saltar-se’n els límits de seguretat.',
          'Fer servir noms ofensius, que suplantin una altra persona o que vulnerin drets de tercers.',
        ],
      },
      { h: '5. Conseqüències', p: ['Si s’incompleixen aquestes condicions podem corregir el progrés o les recompenses obtingudes indegudament, reiniciar la cartera virtual, suspendre o tancar el compte. T’ho explicarem i podràs respondre.'] },
      { h: '6. XP, gemmes, vides i assoliments', p: ['Són elements del joc, sense valor econòmic. No es poden comprar amb diners, vendre, transferir ni bescanviar per diners o premis. En podem ajustar el funcionament per millorar l’aprenentatge.'] },
      {
        h: '7. Premium',
        list: [
          'Premium amplia les classes, les vides, el saldo virtual i els tipus d’ordre. El preu i les condicions es mostren abans de contractar.',
          'Hi ha una prova gratuïta de 7 dies, una per persona. A la versió actual el pagament encara no està actiu: la prova s’acaba sola i tornes a Free sense cost.',
          'Quan el pagament estigui actiu: la subscripció es renovarà automàticament fins que la cancel·lis des de Configuració, t’avisarem abans de cada cobrament i, com a consumidor, tindràs 14 dies naturals per desistir des de la contractació.',
        ],
      },
      { h: '8. Propietat intel·lectual', p: ['El contingut d’E-Trading pertany al seu titular o s’utilitza amb llicència. El pots fer servir per al teu aprenentatge personal, però no copiar-lo ni distribuir-lo sense permís.'] },
      { h: '9. Responsabilitat', p: ['Posem la màxima cura en el servei, però pot tenir errors o interrupcions. No responem de decisions d’inversió reals preses a partir de l’aplicació. Res de l’anterior limita els drets que la llei et reconeix com a consumidor.'] },
      { h: '10. Canvis en el servei i en les condicions', p: ['Podem millorar o canviar funcions. Si canviem aquestes condicions de manera important t’avisarem amb antelació dins de l’aplicació.'] },
      { h: '11. Llei i conflictes', p: [`S’aplica la llei espanyola. Si tens un problema, escriu-nos primer a ${O.email} i el mirarem de resoldre. Com a consumidor també pots acudir als organismes de consum de la teva comunitat autònoma i als jutjats del teu domicili.`] },
    ],
  },
}
