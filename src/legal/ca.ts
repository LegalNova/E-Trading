// Textos legals en català (traducció de la versió en castellà, que preval en cas de dubte)
import { OWNER } from './owner'
import type { LegalDoc, LegalSlug } from './types'

const O = OWNER
const UPDATED = '5 de novembre de 2026'

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
          'Els preus s’obtenen de fonts de tercers (Yahoo Finance i, com a reserva per a les divises, el Banc Central Europeu) i poden tenir retard o errors. Es mostren només amb finalitats educatives i no s’han de fer servir per prendre decisions d’inversió reals.',
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
          'Ús de l’app: quines pantalles visites (com a molt un cop al dia per pantalla), fins a quin pas arribes a cada classe i des d’on vas arribar la primera vegada (per exemple, l’enllaç d’un creador). Ho fem servir només nosaltres, amb eines pròpies, per millorar el curs i l’app.',
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
            ['Estadístiques pròpies per millorar el curs i l’app (quines classes costen més, quines pantalles es fan servir, d’on arriben els usuaris) i revisar el teu compte si necessites ajuda', 'Interès legítim a millorar el servei i donar-te suport (6.1.f). Sense eines de tercers'],
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
          'Per registrar-te has de tenir almenys 14 anys, l’edat a partir de la qual es pot consentir el tractament de dades a Espanya (LOPDGDD, art. 7). Si tens entre 14 i 17 anys pots fer servir el pla gratuït; per contractar un pla de pagament (Plus o Max) caldrà que ho confirmi la teva mare, pare o tutor.',
          'Si sabem que un compte pertany a un menor de 14 anys, l’eliminarem.',
        ],
      },
      {
        h: '5. Quant de temps desem les dades',
        list: [
          'Compte, progrés i simulador: mentre tinguis el compte. En esborrar-lo des de Configuració s’eliminen de seguida; les còpies de seguretat tècniques se sobreescriuen en un màxim de 7 dies.',
          'Registres de seguretat (per exemple, intents d’accés): fins a 12 mesos.',
          'Converses amb la Lumi: mentre tinguis el compte o fins que n’esborris l’historial.',
          'Comptes de convidat («Provar sense registrar-me») que no desen el progrés: s’esborren amb totes les dades als 30 dies sense entrar.',
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
            ['Stripe Payments Europe, Ltd.', 'Cobrament dels plans de pagament (només si en contractes un): targeta, factures i subscripció. Nosaltres no veiem les dades completes de la teva targeta', 'Irlanda (UE)'],
            ['Anthropic, PBC', 'La Lumi amb IA (només a Max i quan estigui activada): les teves preguntes a la Lumi i un resum de la teva cartera simulada, el teu progrés i el teu diari d’operacions, sense el teu nom ni el teu correu. No s’utilitzen per entrenar els seus models', 'EUA · Marc de Privacitat de Dades UE-EUA i clàusules contractuals tipus'],
            ['Resend Inc.', 'Enviament de correus del compte (confirmar el correu, canviar la contrasenya)', 'EUA · contracte d’encarregat i clàusules contractuals tipus'],
          ],
        },
      },
      { h: '7. Transferències internacionals', p: ['Alguns d’aquests proveïdors són als Estats Units. Les transferències s’emparen en la decisió d’adequació del Marc de privadesa de dades UE-EUA i, quan escau, en les clàusules contractuals tipus aprovades per la Comissió Europea.'] },
      { h: '8. Fonts de preus', p: ['El nostre servidor demana els preus a Yahoo Finance i, com a reserva per a les divises, al Banc Central Europeu. Aquestes fonts no reben cap dada teva.'] },
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
          'Has de tenir almenys 14 anys. Entre 14 i 17 anys, per contractar un pla de pagament (Plus o Max) cal el consentiment de la teva mare, pare o tutor.',
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
        h: '7. Plans de pagament (Plus i Max)',
        list: [
          'Plus i Max amplien les classes, les vides, el saldo virtual, els tipus d’ordre i les preguntes a la Lumi. El preu i el que inclou cada pla es mostren abans de contractar.',
          'Hi ha una prova gratuïta de 7 dies, una per persona, que es desbloqueja amb una ratxa de 5 dies seguits o arribant amb una invitació.',
          'La compra es regeix per les Condicions de contractació: preu, renovació, cancel·lació des de Configuració, avís abans que s’acabi la prova i 14 dies naturals per desistir.',
        ],
      },
      {
        h: '8. Invitacions',
        list: [
          'Cada persona té un enllaç d’invitació. Qui crea el compte amb aquest enllaç rep 7 dies de Max gratis en acabar la benvinguda; compten com la seva prova gratuïta (una per persona).',
          'Qui convida rep 7 dies de Max quan el seu amic desa el compte amb correu i contrasenya i acaba la primera classe, fins a un màxim d’un any en total.',
          'El regal no té valor econòmic, no es pot canviar per diners ni transferir, i se suma al Max que ja tinguis.',
          'No val convidar-te a tu mateix, crear comptes falsos ni comprar o vendre invitacions. Si passa, podem retirar els dies regalats i aplicar l’apartat 5.',
          'Podem canviar o acabar el programa avisant abans a l’app; els dies ja guanyats es respecten.',
        ],
      },
      { h: '9. Propietat intel·lectual', p: ['El contingut d’E-Trading pertany al seu titular o s’utilitza amb llicència. El pots fer servir per al teu aprenentatge personal, però no copiar-lo ni distribuir-lo sense permís.'] },
      { h: '10. Responsabilitat', p: ['Posem la màxima cura en el servei, però pot tenir errors o interrupcions. No responem de decisions d’inversió reals preses a partir de l’aplicació. Res de l’anterior limita els drets que la llei et reconeix com a consumidor.'] },
      { h: '11. Canvis en el servei i en les condicions', p: ['Podem millorar o canviar funcions. Si canviem aquestes condicions de manera important t’avisarem amb antelació dins de l’aplicació.'] },
      { h: '12. Llei i conflictes', p: [`S’aplica la llei espanyola. Si tens un problema, escriu-nos primer a ${O.email} i el mirarem de resoldre. Com a consumidor també pots acudir als organismes de consum de la teva comunitat autònoma i als jutjats del teu domicili.`] },
    ],
  },
  contratacion: {
    title: 'Condicions de contractació',
    intro: `Darrera actualització: ${UPDATED}. S’apliquen quan contractes un pla de pagament (Plus o Max) o compres un regal i completen les Condicions d’ús. Compleixen el Reial decret legislatiu 1/2007 (Llei general per a la defensa dels consumidors i usuaris) i la LSSI-CE. En cas de dubte, preval la versió en castellà.`,
    sections: [
      {
        h: '1. Qui et ven',
        table: {
          head: ['Dada', 'Valor'],
          rows: [
            ['Titular', O.name],
            ['NIF', O.nif],
            ['Domicili', O.address],
            ['Correu', O.email],
          ],
        },
      },
      {
        h: '2. Què contractes i quant costa',
        p: ['Preus finals en euros, amb tots els impostos inclosos. No hi ha cap altre càrrec.'],
        table: {
          head: ['Pla', 'Què inclou', 'Mensual', 'Anual'],
          rows: [
            ['Plus', 'Unitats 1 a 5 completes i les 5 primeres classes de cada unitat, vides il·limitades, 50.000 € virtuals i 30 preguntes al dia a la Lumi amb el mode «La meva cartera».', '3,99 €/mes', '29,99 €/any'],
            ['Max', 'Tot el curs, vides il·limitades, 50.000 € virtuals, ordres avançades des del primer dia, 100 preguntes al dia a la Lumi amb tots els modes i un protector de ratxa cada setmana.', '7,99 €/mes', '59,99 €/any'],
          ],
        },
      },
      {
        h: '3. Com es contracta',
        list: [
          'Tries el pla i el període a la pantalla de plans, revises el preu i confirmes amb el botó de compra. Abans de pagar pots corregir qualsevol dada tornant enrere.',
          'El contracte queda formalitzat en confirmar. T’enviem la confirmació per correu i pots consultar el teu pla en tot moment a Configuració, Subscripció.',
          'El contracte es formalitza en castellà, català o anglès, segons l’idioma de l’app. Desem el registre de la contractació i te l’enviem si ens el demanes.',
        ],
      },
      {
        h: '4. Prova gratuïta',
        list: [
          'Pots tenir una prova gratuïta de 7 dies (una vegada per persona): es desbloqueja amb una ratxa de 5 dies seguits o arribant amb la invitació d’un amic. També pots contractar directament, sense prova.',
          'Si la cancel·les abans que s’acabi, no se’t cobra res. Si no, en acabar es cobra el primer període del pla triat.',
          'T’avisarem dins de l’app (i al mòbil, si tens els avisos activats) abans que s’acabi la prova.',
        ],
      },
      {
        h: '5. Pagament',
        list: [
          'Es paga amb targeta a través de Stripe, que processa el pagament de manera segura. Nosaltres no veiem ni desem les dades completes de la teva targeta.',
          'Cada període es cobra per avançat, el dia que comença. Rebràs el justificant de cada cobrament per correu.',
          'Si un cobrament falla, t’avisarem i ho tornarem a provar durant uns dies; si no es pot cobrar, el pla torna a Free sense perdre el teu progrés.',
        ],
      },
      {
        h: '6. Renovació, canvis i cancel·lació',
        list: [
          'La subscripció es renova automàticament pel mateix període i preu fins que la cancel·lis.',
          'Pots cancel·lar quan vulguis a Configuració, Subscripció, sense explicacions. Mantens el pla fins al final del període pagat i no se’t torna a cobrar.',
          'Si canviem el preu, t’avisarem amb almenys 30 dies d’antelació i abans de la renovació següent; si no hi estàs d’acord, pots cancel·lar abans que s’apliqui.',
        ],
      },
      {
        h: '7. Dret de desistiment i devolucions',
        list: [
          'Com a consumidor, tens 14 dies naturals des que contractes per desistir del contracte sense donar cap explicació.',
          'A més, com a garantia comercial nostra: si ens ho demanes en els 14 dies naturals següents al teu primer cobrament, et tornem l’import complet, encara que ja hagis fet servir el pla.',
          `Per fer-ho, escriu-nos a ${O.email} indicant el correu del teu compte, o fes servir el formulari de l’apartat 11. Et retornarem els diners en un màxim de 14 dies pel mateix mitjà de pagament, sense cap cost per a tu.`,
        ],
      },
      {
        h: '8. Menors d’edat',
        p: ['Si tens entre 14 i 17 anys, per contractar un pla de pagament cal que la teva mare, el teu pare o el teu tutor ho confirmi. Sense aquesta confirmació no es pot completar la compra.'],
      },
      {
        h: '9. Si alguna cosa no funciona',
        p: [
          'El servei ha de funcionar tal com es descriu. Si no és així, tens dret que ho arreglem i, si no ho aconseguim en un termini raonable, a una rebaixa del preu o a acabar el contracte amb la devolució corresponent (garantia de conformitat dels continguts i serveis digitals).',
          'E-Trading és un servei educatiu amb diners virtuals: no garanteix cap resultat econòmic real.',
        ],
      },
      {
        h: '10. Dubtes i reclamacions',
        p: [
          `Escriu-nos a ${O.email}: responem en un màxim de 7 dies i procurem fer-ho abans. Si no en quedes satisfet, pots acudir als serveis de consum de la teva comunitat autònoma o als jutjats del teu domicili.`,
          'De moment no estem adherits a cap sistema d’arbitratge de consum.',
        ],
      },
      {
        h: '11. Model de formulari de desistiment',
        p: [
          'Només l’has d’emplenar i enviar-nos-el si vols desistir del contracte. També val un correu amb les mateixes dades.',
          `A l’atenció de ${O.name}, ${O.address}, ${O.email}:`,
          'Per la present li comunico que desisteixo del meu contracte del servei següent: pla [Plus o Max], [mensual o anual].',
          'Contractat el: [data] · Nom: [el teu nom] · Correu del compte: [el teu correu] · Data: [data d’avui] · Signatura (només si l’envies en paper).',
        ],
      },
      {
        h: '12. Regalar E-Trading',
        p: ['Pots regalar Plus o Max durant 1 mes (30 dies) o 12 mesos (365 dies) a una altra persona. Aquestes condicions s’apliquen al regal juntament amb les anteriors.'],
        list: [
          'Preu: el d’1 mes o l’anual del pla (Plus: 3,99 € o 29,99 €; Max: 7,99 € o 59,99 €), amb impostos inclosos. És un pagament únic amb targeta a través de Stripe: no és una subscripció, no es renova i no hi haurà més cobraments.',
          'En pagar reps un enllaç amb un codi personal. Qui el tingui el pot bescanviar, així que comparteix-lo només amb la persona a qui el regales. No pots bescanviar un regal que has comprat tu.',
          'Es pot bescanviar una sola vegada, durant els 12 mesos següents al pagament. Passat aquest termini caduca sense bescanviar-se i no es retorna l’import.',
          'En bescanviar-lo, qui el rep té el pla des d’aquell moment i durant els dies del regal. Si ja tenia un regal o una prova en marxa, els dies se sumen al final. Si paga una subscripció, el seu proper cobrament es retarda aquests dies.',
          'Dret de desistiment: tens 14 dies naturals des de la compra per desistir, sempre que el regal no s’hagi bescanviat. Et retornem l’import complet pel mateix mitjà de pagament i l’enllaç deixa de funcionar. Escriu-nos a ' + O.email + ' amb el correu del teu compte.',
          'Un cop bescanviat, el regal ja s’ha gaudit i no es pot retornar, perquè el servei comença a prestar-se en aquell moment amb el consentiment de qui el bescanvia.',
          'Per comprar un regal entre els 14 i els 17 anys cal la confirmació de la teva mare, el teu pare o el teu tutor, com a l’apartat 8.',
        ],
      },
    ],
  },
}
