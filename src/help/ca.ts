import type { HelpDoc } from './types'

export const ca: HelpDoc = {
  title: 'Centre d’ajuda',
  intro: 'Respostes curtes al que més ens pregunten. Si no trobes el que busques, escriu-nos.',
  search: 'Cerca: vides, ratxa, cancel·lar, contrasenya…',
  noResults: 'No hem trobat res amb aquestes paraules. Prova’n d’altres o escriu-nos.',
  all: 'Tot',
  contactTitle: 'No trobes la resposta?',
  contactBody: 'Escriu-nos des del formulari de contacte. Responem en un o dos dies laborables.',
  contactCta: 'Anar a Contacte',
  legalTitle: 'Documents legals',
  categories: [
    {
      id: 'empezar',
      title: 'Començar',
      items: [
        { id: 'que-es', q: 'Què és Lumi?', a: ['Una app per aprendre a invertir des de zero: classes curtes i interactives, qüestionaris i un mercat amb preus reals on practiques amb diners virtuals. La Lumi, la mascota, t’acompanya a cada pas.'] },
        { id: 'dinero-real', q: 'S’hi fan servir diners reals?', a: ['No. Tots els diners del simulador són virtuals i no tenen cap valor: no pots ingressar ni retirar diners, i les teves operacions no arriben a cap mercat real.'] },
        { id: 'cuesta', q: 'Costa alguna cosa?', a: ['El pla Free és gratuït per sempre. Plus i Max són opcionals i amplien el curs i la Lumi.', 'Ara mateix el pagament no està actiu: els plans de pagament es poden provar 7 dies gratis i, en acabar, tornes a Free sense cap càrrec.'] },
        { id: 'saber-antes', q: 'Necessito saber alguna cosa abans?', a: ['No. El curs comença pel més bàsic (què són els diners i per què perden valor). Si ja en saps, en començar pots fer un test de nivell per saltar-te el que domines.'] },
        { id: 'edad', q: 'A partir de quina edat es pot fer servir?', a: ['A partir dels 14 anys. Entre els 14 i els 17, per contractar un pla de pagament cal que ho confirmi la teva mare, el teu pare o el teu tutor.'] },
        { id: 'asesoramiento', q: 'La Lumi em diu en què invertir?', a: ['No. Lumi és educació, no assessorament financer: res de l’app és una recomanació per comprar o vendre res. Aprens com funcionen els mercats perquè algun dia decideixis tu, amb criteri.'] },
      ],
    },
    {
      id: 'clases',
      title: 'Classes i progrés',
      items: [
        { id: 'como-clases', q: 'Com són les classes?', a: ['Uns 6 minuts cadascuna. Primer fas (una història amb decisions, una peça per tocar o una missió amb dades reals) i després entens la idea. Cada classe acaba amb un qüestionari curt.'] },
        { id: 'bloqueadas', q: 'Per què hi ha classes bloquejades?', a: ['Les classes s’obren en ordre: quan n’acabes una, s’obre la següent. Cada secció s’obre quan superes el repte final de l’anterior.', 'Algunes classes són de Plus o Max: les veuràs amb un cadenat i el nom del pla.'] },
        { id: 'vidas', q: 'Què són les vides?', a: ['Al pla Free tens 5 vides per als qüestionaris. En perds una quan falles una pregunta i en recuperes una cada 4 hores. També les pots recarregar amb gemmes.', 'A Plus i Max les vides són il·limitades.'] },
        { id: 'racha', q: 'Com funciona la ratxa?', a: ['Suma un dia cada dia que acabes una classe o un qüestionari, o fas una operació al simulador. Si un dia no fas res, torna a començar.', 'Un protector de ratxa la salva un dia que no puguis: es compra amb gemmes (en pots tenir 2 com a màxim). A Max en reps un cada setmana.'] },
        { id: 'xp-gemas', q: 'Per a què serveixen l’XP i les gemmes?', a: ['L’XP mesura el que aprens i practiques: amb ella puges de nivell i competeixes a la lliga.', 'Les gemmes es guanyen amb assoliments, objectius del dia i pujant de divisió. Serveixen per a protectors de ratxa i per recarregar vides. No es compren amb diners ni es poden canviar per res.'] },
        { id: 'liga', q: 'Com funciona la lliga?', a: ['Cada setmana competeixes en un grup de fins a 30 persones per l’XP que guanyes aquella setmana. Els 7 primers pugen de divisió (i guanyen gemmes) i els últims baixen. Es reinicia cada dilluns.', 'Si prefereixes no sortir amb el teu nom, a Configuració pots aparèixer com a «Jugador anònim».'] },
        { id: 'repaso', q: 'Què passa amb les preguntes que fallo?', a: ['Es desen per repassar-les més endavant, just quan estàs a punt d’oblidar-les. Així el que has après es queda.'] },
      ],
    },
    {
      id: 'mercado',
      title: 'Simulador de mercat',
      items: [
        { id: 'saldo', q: 'Amb quants diners començo?', a: ['Amb 10.000 € virtuals a Free i 50.000 € a Plus i Max.'] },
        { id: 'precios', q: 'Els preus són reals?', a: ['Sí: surten de fonts públiques de dades de mercat. Poden arribar amb retard (en algunes borses, 15 minuts o més) o tenir errors puntuals. Només serveixen per aprendre.'] },
        { id: 'ordenes', q: 'Quins tipus d’ordre puc fer servir?', a: ['Des del principi, ordres a mercat. Les ordres limitades, stop loss i take profit s’obren quan acabes la classe de l’stop loss (a Max, des del primer dia).'] },
        { id: 'no-ejecuta', q: 'Per què no s’executa la meva ordre?', a: ['Les causes més habituals: el mercat d’aquell actiu està tancat (l’ordre espera que obri), el preu encara no ha arribat al que vas posar en una ordre limitada o stop, o no tens prou saldo.'] },
        { id: 'comisiones', q: 'Hi ha comissions?', a: ['Sí, simulades, perquè s’assembli a la realitat: el 0,1 % de cada operació, amb un mínim d’1 € virtual.'] },
        { id: 'reiniciar', q: 'Puc començar de zero amb la cartera?', a: ['Sí, fins a 3 vegades l’any des de la cartera. Tornes al saldo inicial i es tanquen les posicions; conserves l’XP, la ratxa i els assoliments.'] },
      ],
    },
    {
      id: 'lumi',
      title: 'Pregunta-li a la Lumi',
      items: [
        { id: 'que-hace', q: 'Què li puc preguntar a la Lumi?', a: ['Dubtes del curs, conceptes que no entens, què estudiar ara i, als plans de pagament, com va la teva cartera o quins biaixos es veuen a les teves operacions. Respon amb el contingut del curs i el teu progrés.'] },
        { id: 'limite', q: 'Quantes preguntes puc fer?', a: ['5 al dia a Free, 30 a Plus i 100 a Max. El comptador es reinicia cada dia.'] },
        { id: 'privacidad-lumi', q: 'Les meves preguntes surten de Lumi?', a: ['No. La Lumi funciona als nostres propis servidors: les teves preguntes no s’envien a cap servei d’intel·ligència artificial de tercers. Pots esborrar l’historial quan vulguis des de la mateixa conversa.'] },
      ],
    },
    {
      id: 'planes',
      title: 'Plans i pagaments',
      items: [
        { id: 'diferencias', q: 'Quina diferència hi ha entre Free, Plus i Max?', a: ['Free: unitats 1 a 3 completes i les 3 primeres classes de cada unitat, amb 5 vides i 5 preguntes al dia a la Lumi.', 'Plus (3,99 €/mes o 29,99 €/any): unitats 1 a 5 completes i les 5 primeres classes de cada unitat, vides il·limitades, 50.000 € virtuals i 30 preguntes al dia.', 'Max (7,99 €/mes o 59,99 €/any): tot el curs, vides il·limitades, ordres avançades des del primer dia, 100 preguntes al dia amb tots els modes i un protector de ratxa cada setmana.'], links: [{ href: '/premium', label: 'Veure els plans' }] },
        { id: 'prueba', q: 'Com funciona la prova gratuïta?', a: ['Tens 7 dies per provar Plus o Max, una vegada per persona. Ara mateix el pagament no està actiu: la prova s’acaba sola i tornes a Free sense cap càrrec.', 'Quan el pagament estigui actiu, t’avisarem abans que s’acabi la prova i la podràs cancel·lar sense cost.'] },
        { id: 'cancelar', q: 'Com cancel·lo el meu pla?', a: ['A Configuració, Subscripció, «Cancel·lar la subscripció». Sense trucades ni preguntes. Conserves el que hagis pagat fins al final del període.'] },
        { id: 'reembolso', q: 'Puc demanar que em torneu els diners?', a: ['Sí. Tens 14 dies per desistir des que contractes i, a més, si ens ho demanes en els 14 dies següents al teu primer cobrament, et tornem l’import complet.'], links: [{ href: '/legal/contratacion', label: 'Condicions de contractació' }] },
      ],
    },
    {
      id: 'cuenta',
      title: 'Compte i privadesa',
      items: [
        { id: 'sin-registro', q: 'Puc provar-ho sense registrar-me?', a: ['Sí: toca «Provar sense registrar-me» i entres al moment, sense correu ni contrasenya. Si t’agrada, a «Desar» li poses correu i contrasenya al teu compte i conserves tot el progrés.', 'Si no el deses, el compte de convidat s’esborra als 30 dies sense entrar. Per provar Plus o Max cal desar abans el progrés.'] },
        { id: 'google-bluetooth', q: 'En entrar amb Google em demana activar el Bluetooth', a: ['És un pas de Google, no de Lumi: si el teu compte de Google té una clau d’accés (passkey), Google intenta fer servir el mòbil com a clau i per això necessita Bluetooth.', 'Si no funciona, en aquella pantalla de Google toca «Prova una altra manera» i tria la contrasenya de Google o un codi al mòbil. També pots entrar amb el teu correu i una contrasenya de Lumi.'] },
        { id: 'crear-contrasena', q: 'Em vaig registrar amb Google: puc entrar amb correu?', a: ['Sí. Entra un cop amb Google i ves a Configuració, Compte, «Crear una contrasenya». A partir d’aleshores pots entrar amb el teu correu i aquesta contrasenya, o continuar fent servir Google.'] },
        { id: 'invitar', q: 'Com funciona convidar amics?', a: ['A Perfil, «Convida els teus amics», tens el teu enllaç. El teu amic té 14 dies de Max gratis només entrar. Tu sumes 14 dies de Max quan desa el compte i acaba la primera classe, fins a un any en total.'], links: [{ href: '/perfil/invitar', label: 'Convidar amics' }] },
        { id: 'contrasena', q: 'He oblidat la contrasenya', a: ['A «Entrar», toca «Has oblidat la contrasenya?». Si la recuperació per correu encara no està disponible, escriu-nos des de Contacte amb el correu del teu compte i t’ajudem.'], links: [{ href: '/recuperar', label: 'Recuperar la contrasenya' }] },
        { id: 'ajustes', q: 'On canvio el nom, l’idioma o el tema?', a: ['A Perfil, Configuració. També hi pots canviar la meta diària, els avisos i el nom i l’aspecte de la Lumi.'] },
        { id: 'datos', q: 'Quines dades deseu i per a què?', a: ['Només el necessari perquè l’app funcioni i per millorar-la: el teu compte, el teu progrés, la teva activitat al simulador i estadístiques d’ús pròpies. No fem servir publicitat ni eines de tercers i no venem les teves dades.'], links: [{ href: '/legal/privacidad', label: 'Política de privadesa' }] },
        { id: 'descargar-borrar', q: 'Com descarrego o esborro les meves dades?', a: ['A Configuració, Compte: pots descarregar totes les teves dades en un fitxer i esborrar el compte. Si l’esborres, s’eliminen el progrés, la cartera i l’historial, i no es pot desfer.'] },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguretat',
      items: [
        { id: 'fraude', q: 'Algú diu que és de Lumi i m’ofereix invertir', a: ['És un frau. Lumi mai no et demanarà diners, dades del teu banc, la contrasenya ni codis per correu, missatge o xarxes socials, i mai no t’oferirà invertir ni «gestionar» els teus diners.', 'No responguis, no paguis res i avisa’ns des de Contacte. Si ja has pagat, contacta amb el teu banc i denuncia-ho a la policia.'] },
        { id: 'cuenta-segura', q: 'Com protegeixo el meu compte?', a: ['Fes servir una contrasenya que no facis servir en altres llocs, amb almenys 8 caràcters i un número, o entra amb Google. Si algú més fa servir el teu dispositiu, tanca la sessió en acabar.'] },
        { id: 'error', q: 'He trobat un error', a: ['Gràcies per avisar. Escriu-nos des de Contacte explicant què feies i què ha passat; si pots, afegeix-hi una captura. Aprofitar un error per guanyar avantatge a la lliga va contra les normes.'] },
      ],
    },
  ],
}
