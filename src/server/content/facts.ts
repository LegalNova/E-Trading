// Hechos con fecha que citan las clases (auditoría CON-10 y apartado 5.3).
// Regla: un dato que caduca no se escribe a mano en el texto de una clase. Se apunta aquí con su valor, la fecha a la
// que corresponde, cuándo se comprobó y la fuente, y la clase lo cita desde aquí. `npm run check:content` avisa
// cuando un dato lleva más de 12 meses sin revisar (staleFacts). Al cambiar un valor, las traducciones (ca, en)
// se actualizan a mano: `scripts/content-i18n.ts check` falla si las cifras dejan de coincidir.
//
// Verificado el 12-11-2026 (informe de auditoría, 5.3). «oficial» = página del organismo; «secundaria» = despacho,
// prensa especializada o blog del propio emisor.

export interface Fact {
  /** Qué es, en una frase */
  what: string
  /** Valor tal como se usa en los textos */
  value: number | string
  /** Fecha a la que corresponde el dato (AAAA-MM-DD) */
  asOf: string
  /** Última vez que se comprobó en la fuente (AAAA-MM-DD) */
  checked: string
  source: string
  kind: 'oficial' | 'secundaria'
  /** Clases que lo citan */
  usedIn: string[]
  /** Cuándo hay que volver a mirarlo aunque no hayan pasado 12 meses */
  review?: string
}

export const FACTS = {
  ecbDepositRate: {
    what: 'Tipo de la facilidad de depósito del BCE (%)', value: 2.5, asOf: '2026-09-16', checked: '2026-11-12', kind: 'oficial',
    source: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html',
    usedIn: ['u18l3'], review: 'Tras cada reunión del BCE (la siguiente, 17-12-2026). Historia: 2,00 % desde 11-6-2025; 2,25 % desde 17-6-2026; 2,50 % desde 16-9-2026.',
  },
  capeSp500: {
    what: 'CAPE (PER de Shiller) del S&P 500, aproximado', value: 41, asOf: '2026-10-31', checked: '2026-11-12', kind: 'secundaria',
    source: 'Serie mensual de Robert Shiller (≈40,7 en octubre de 2026; otras fuentes, entre 40 y 41,8). Récord: 44,2 a finales de 1999.',
    usedIn: ['u17l6'], review: 'Cada trimestre: las clases dicen «ronda los 41».',
  },
  settlementT1: {
    what: 'Fecha en que la UE, Reino Unido y Suiza pasan a liquidar en T+1', value: '2027-10-11', asOf: '2027-10-11', checked: '2026-11-12', kind: 'secundaria',
    source: 'Reglamento (UE) 2025/2075. https://finreg.aoshearman.com/Regulation-to-shorten-settlement-cycle-to-T1-publ',
    usedIn: ['u5l5'], review: 'El 11-10-2027: a partir de ese día, reescribir u5l5 en presente (T+1).',
  },
  pfofBan: {
    what: 'Prohibición del pago por flujo de órdenes (PFOF) a minoristas en toda la UE', value: '2026-07-01', asOf: '2026-07-01', checked: '2026-11-12', kind: 'secundaria',
    source: 'MiFIR, art. 39 bis (Reglamento (UE) 2024/791). Solo Alemania usó la excepción, que venció el 30-6-2026. https://legal.pwc.de/en/news/articles/germanys-pfof-ban-is-now-fully-in-force',
    usedIn: ['u33l3'],
  },
  bitcoinEtfGap: {
    what: 'Brecha del inversor en los ETF de bitcoin al contado: rentabilidad anual de sus inversores frente a la del ETF', value: '−5,8 % frente a +8,5 %', asOf: '2026-06-30', checked: '2026-11-12', kind: 'secundaria',
    source: 'Morningstar, periodo de enero de 2024 al 30-6-2026. https://www.advisorperspectives.com/commentaries/2026/08/21/what-advisors-can-learn-from-the-investor-return-gap',
    usedIn: ['u27l1', 'u13l5'],
  },
  mindTheGap: {
    what: 'Morningstar «Mind the Gap»: rentabilidad de los fondos frente a la de sus inversores, 10 años', value: '9,9 % frente a 8,7 %', asOf: '2025-12-31', checked: '2026-11-12', kind: 'secundaria',
    source: 'Informe de 2026, fondos y ETF de EE. UU. https://www.morningstar.com/personal-finance/fund-investors-who-kept-it-simple-captured-more-return',
    usedIn: ['u27l1'],
  },
  spivaEurope: {
    what: 'SPIVA Europa, cierre de 2025: fondos activos de renta variable que quedaron por detrás de su índice', value: '81,8 % a 1 año · 97,0 % a 10 años', asOf: '2025-12-31', checked: '2026-11-12', kind: 'secundaria',
    source: 'Resumen de S&P (blog Indexology, abril de 2026): «el 81,8 % de los fondos activos de renta variable quedó por detrás en un año y el 97,0 % en diez». Es el conjunto de fondos de renta variable del informe europeo, no solo los que invierten en acciones europeas: por eso las clases dicen «fondos europeos de acciones». El PDF de S&P no se ha podido abrir (acceso bloqueado). https://www.indexologyblog.com/tag/spiva-europe/',
    usedIn: ['u7l5', 'u10l4', 'u25l1'], review: 'Si se consigue el PDF, anotar la tabla exacta.',
  },
  msciWorldCount: {
    what: 'Número de empresas del MSCI World', value: 1249, asOf: '2026-09-30', checked: '2026-11-12', kind: 'oficial',
    source: 'Ficha de MSCI (1.319 el 27-2-2026; 1.282 el 31-7-2026; 1.249 el 30-9-2026). https://www.msci.com/indexes/index/990100/msci-world-index',
    usedIn: ['u7l2'],
  },
  cnmvCryptoCircular: {
    what: 'La Circular 1/2024 de la CNMV deroga la 1/2022 (publicidad de criptoactivos): desde entonces rige MiCA directamente', value: '2024-12-28', asOf: '2024-12-28', checked: '2026-11-12', kind: 'oficial',
    source: 'BOE del 27-12-2024. https://boe.es/boe/dias/2024/12/27/pdfs/BOE-A-2024-27149.pdf',
    usedIn: ['u32l5'],
  },
  cfdAdBan: {
    what: 'España: prohibida la publicidad de CFD dirigida a minoristas', value: '2023-08-03', asOf: '2023-08-03', checked: '2026-11-12', kind: 'oficial',
    source: 'Resolución de la CNMV de 11-7-2023 (BOE del 14-7-2023). https://www.boe.es/boe/dias/2023/07/14/pdfs/BOE-A-2023-16394.pdf',
    usedIn: ['u11l3'],
  },
  etcTax: {
    what: 'Fiscalidad de los ETC y ETN en España: su resultado no se trata como el de un ETF', value: 'rendimiento del capital mobiliario (según la consulta citada)', asOf: '2025-03-13', checked: '2026-11-12', kind: 'secundaria',
    source: 'Consulta de la Dirección General de Tributos V0267-25, citada por asesorías; no se ha abierto en la base oficial.',
    usedIn: ['u15l4'], review: 'Pendiente: confirmarlo con un fiscalista antes de afirmar más en la clase.',
  },
  inflationSpain: {
    what: 'Inflación media de España (IPC, media anual) que usan los ejemplos de las clases (%)', value: 2.7, asOf: '2025-12-31', checked: '2026-11-12', kind: 'secundaria',
    source: 'INE, media anual de 2025 recogida por Funcas (https://www.funcas.es/wp-content/uploads/2026/01/IPC2512.pdf) y la prensa. Falta abrir la nota del INE de enero de 2026.',
    usedIn: ['u1l2', 'u1l4', 'u11l5'], review: 'Cada enero, cuando el INE publica la media del año anterior. Cambiar a la vez los ejemplos que usan esta cifra (u1l4, u11l5).',
  },
  savingsTaxScale: {
    what: 'Escala del ahorro del IRPF (territorio común): 19 % hasta 6.000 €, 21 % hasta 50.000 €, 23 % hasta 200.000 €, 27 % hasta 300.000 € y 30 % por encima', value: '19 · 21 · 23 · 27 · 30 %', asOf: '2026-01-01', checked: '2026-11-12', kind: 'secundaria',
    source: 'Guías fiscales de 2026 coincidentes (p. ej. https://guiafiscal.es/irpf/tramos-irpf-2026/). Falta confirmarlo en la web de la Agencia Tributaria.',
    usedIn: ['u31l1', 'u31l2', 'u31l4'], review: 'Cada enero, con los presupuestos del año. Toda la unidad u31 usa estos tramos en sus cálculos.',
  },
  revolvingUsury: {
    what: 'Criterio del Tribunal Supremo sobre la usura en tarjetas revolving: el interés es «notablemente superior» si supera en más de 6 puntos el tipo medio que publica el Banco de España para esas tarjetas en la fecha del contrato', value: '6 puntos', asOf: '2023-02-15', checked: '2026-11-12', kind: 'oficial',
    source: 'Sentencia del Pleno de la Sala de lo Civil del Tribunal Supremo 258/2023, de 15 de febrero de 2023 (informe de auditoría, apartado 5.3, FEC-13 / FAL-8: confirmado).',
    usedIn: ['u3l3'], review: 'Si el Supremo cambia de criterio o una ley fija un límite.',
  },
  withholding19: {
    what: 'Retención a cuenta del IRPF sobre dividendos, intereses y ganancias por transmisión de participaciones de fondos de inversión (%)', value: 19, asOf: '2025-12-31', checked: '2026-11-12', kind: 'oficial',
    source: 'Agencia Tributaria, cuadro de tipos de retención («tipo aplicable 2025», actualizado el 30-4-2026): capital mobiliario 19 % (arts. 25.1 y 101.4 LIRPF) y fondos de inversión 19 % (art. 101.6 LIRPF). https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/7-otras-obligaciones-fiscales-retenciones/7_1-cuadro-relacion-tipos-retencion-porcentaje.html',
    usedIn: ['u31l7'], review: 'Cada enero: comprobar el cuadro de tipos del año nuevo.',
  },
  filingLimits: {
    what: 'Límites para no estar obligado a declarar el IRPF (Renta de 2025): 22.000 € de rendimientos del trabajo de un solo pagador y 1.600 € conjuntos de rendimientos del capital mobiliario y ganancias patrimoniales sometidos a retención', value: '22.000 € · 1.600 €', asOf: '2025-12-31', checked: '2026-11-12', kind: 'oficial',
    source: 'Agencia Tributaria, Manual práctico de Renta 2025, «Contribuyentes no obligados a declarar: cuadro resumen». Tiene más supuestos (varios pagadores: 15.876 €; regla de los 1.000 €), que la clase resume como «tiene excepciones». https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c01-campana-declaracion-renta/quienes-estan-obligados-presentar-declaracion-irpf/contribuyentes-no-obligados-declarar-cuadro-resumen.html',
    usedIn: ['u31l7'], review: 'Cada abril, con el manual de la nueva campaña de renta.',
  },
  itf: {
    what: 'Impuesto sobre Transacciones Financieras: 0,2 % sobre la compra de acciones de sociedades españolas de más de 1.000 millones de euros de capitalización', value: '0,2 %', asOf: '2021-01-16', checked: '2026-11-12', kind: 'oficial',
    source: 'Ley 5/2020, de 15 de octubre, en vigor desde el 16-1-2021 (informe de auditoría, apartado 5.3, FAL-3). La Agencia Tributaria publica cada diciembre la lista de sociedades.',
    usedIn: ['u31l8'], review: 'Cada diciembre, con la lista nueva de sociedades.',
  },
  dac8: {
    what: 'Intercambio automático de información sobre criptoactivos (Directiva (UE) 2023/2226, «DAC8»): los proveedores recogen datos desde el 1-1-2026 y el primer envío a las haciendas es en 2027', value: '2026 · 2027', asOf: '2026-01-01', checked: '2026-11-12', kind: 'secundaria',
    source: 'Informe de auditoría, apartado 5.3 (FAL-2): fechas europeas confirmadas. El 12-11-2026 no se pudo confirmar en el BOE el estado de la ley española que la incorpora (había proyecto de ley y un real decreto en audiencia pública desde el 28-7-2025); por eso la clase solo cita las fechas europeas.',
    usedIn: ['u31l8'], review: 'Comprobar en el BOE cuando se publique la ley española y revisar la clase.',
  },
} as const satisfies Record<string, Fact>

const DAY_MS = 86_400_000

/** Hechos que llevan más de `months` meses sin comprobar en su fuente */
export function staleFacts(now = Date.now(), months = 12): string[] {
  return Object.entries(FACTS)
    .filter(([, f]) => now - Date.parse(f.checked) > months * 30.44 * DAY_MS)
    .map(([k, f]) => `${k}: «${f.what}» se comprobó por última vez el ${f.checked} (${f.usedIn.join(', ')})`)
}

/** 2.5 → «2,50» (los porcentajes de los textos van con coma y dos decimales) */
export const esNum = (n: number, decimals = 2) => n.toFixed(decimals).replace('.', ',')
