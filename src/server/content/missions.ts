import 'server-only'
// Misiones «Pruébalo»: cada clase termina con una frase «Pruébalo: …». Las que la app puede comprobar
// (abrir un activo, comprar, poner una alerta, un stop, un favorito, abrir la cartera, escribir en el diario…)
// tienen aquí su tipo. El texto de la misión es la propia frase de la clase (traducida en v2/i18n).
// Las que solo piden preguntar a la profesora o pensar algo no se pueden comprobar: no tienen misión.

export type MissionKind =
  | 'VIEW_ASSET' // abrir la ficha de un activo (sin target: cualquiera)
  | 'BUY_TYPE' // comprar un activo de ese tipo (sin target: cualquier compra)
  | 'BUY_SYMBOL' // comprar uno de esos activos
  | 'SELL'
  | 'WATCH' // añadir a Favoritos (con target: uno de esos)
  | 'ALERT' // crear una alerta de precio (con target: en uno de esos)
  | 'LIMIT_ORDER'
  | 'STOP_ORDER' // stop loss pendiente, o compra con stop (target BOTH: compra con stop y objetivo)
  | 'TAKE_PROFIT'
  | 'OPEN_PORTFOLIO'
  | 'EXPLORE' // abrir Explorar (target: tipo de activo del enlace)
  | 'JOURNAL' // apuntar el motivo de una operación en el diario

export interface MissionDef {
  kind: MissionKind
  /** Símbolos separados por «|» (vale cualquiera; el botón lleva al primero), tipo de activo o BOTH */
  target?: string
  /** Enlace del botón cuando no basta con el que sale del tipo */
  href?: string
}

/** XP de una misión cumplida (una vez) */
export const MISSION_XP = 20
/** Días que una misión sigue abierta */
export const MISSION_DAYS = 30

// Grupos de activos que las clases nombran de forma genérica
const SP500_ETF = 'SPY|VOO|IVV|CSPX.L|SXR8.DE|VUAA.DE|VUSA.AS'
const WORLD_ETF = 'VWCE.DE|IWDA.AS|EUNL.DE|SWDA.L|XDWD.DE|SPPW.DE|CW8.PA|VGWL.DE'
const MSCI_WORLD = 'IWDA.AS|EUNL.DE|SWDA.L|XDWD.DE|SPPW.DE|CW8.PA'

const view = (target?: string, href?: string): MissionDef => ({ kind: 'VIEW_ASSET', ...(target ? { target } : {}), ...(href ? { href } : {}) })
const buyType = (target?: string): MissionDef => ({ kind: 'BUY_TYPE', ...(target ? { target } : {}) })
const buy = (target: string): MissionDef => ({ kind: 'BUY_SYMBOL', target })
const watch = (target?: string): MissionDef => ({ kind: 'WATCH', ...(target ? { target } : {}) })
const alert = (target?: string): MissionDef => ({ kind: 'ALERT', ...(target ? { target } : {}) })
const stop = (both = false): MissionDef => ({ kind: 'STOP_ORDER', ...(both ? { target: 'BOTH' } : {}) })
const PORTFOLIO: MissionDef = { kind: 'OPEN_PORTFOLIO' }
const JOURNAL: MissionDef = { kind: 'JOURNAL' }
const explore = (target: string, href: string): MissionDef => ({ kind: 'EXPLORE', target, href })
const GAINERS = '/mercado/explorar?type=STOCK&sort=gainers'
const STOCKS = '/mercado/explorar?type=STOCK'

export const MISSIONS: Record<string, MissionDef> = {
  // Sección 0 · Invierte desde hoy (revisada con el agente de contenido)
  h1l1: buyType('STOCK'),
  u8l1: view('TSLA'),
  u5l3: view('ITX.MC'),
  u6l1: buyType('STOCK'),
  u19l1: view('MSFT'),
  u1l5: PORTFOLIO,
  u7l1: view('^IBEX'),
  u10l2: view('SPY'),
  u29l1: PORTFOLIO,
  u25l2: buyType('ETF'),
  u10l3: buyType('ETF'),
  u4l3: view('^GSPC'),
  u16l1: explore('STOCK', '/mercado/explorar?type=STOCK&sort=losers'),
  u17l1: watch(),
  u20l1: view('AAPL'),
  u21l1: alert(),
  u24l3: alert(), // el texto actual pide una alerta; si la frase pasa a hablar del diario, cambiar a JOURNAL
  u27l4: watch(),
  // La bolsa
  u5l1: view('ITX.MC'),
  u5l2: watch(),
  u5l4: view('AAPL'),
  u5l5: buyType(),
  u5l6: view(undefined, STOCKS),
  u5l7: explore('STOCK', '/mercado/explorar?type=STOCK&index=IBEX%2035'),
  // Órdenes
  u6l3: alert(),
  u6l5: { kind: 'TAKE_PROFIT' },
  u6l6: stop(true),
  // Índices
  u7l2: view('^GSPC'),
  u7l3: view('AAPL'),
  u7l4: explore('ETF', '/mercado/explorar?type=ETF&q=Acc'),
  u7l5: watch(),
  // Acciones
  u8l2: watch(),
  u8l3: watch('IBE.MC'),
  u8l4: view('NVDA'),
  u8l5: view('IWM'),
  u8l6: view('NVDA'),
  u8l7: watch('AAPL'),
  // Bonos
  u9l1: view('SHY'),
  u9l2: explore('ETF', '/mercado/explorar?type=ETF&sector=ETF%20renta%20fija'),
  u9l3: view('TLT'),
  u9l4: view('EMB'),
  u9l5: view('SGOV'),
  u9l6: view('TIP'),
  // Fondos y ETF
  u10l1: watch('IWDA.AS'),
  u10l4: buy('CSPX.L'),
  u10l5: view('VWCE.DE|VGWL.DE'),
  u10l6: view('IWDA.AS|XDWD.DE'),
  // Otros activos
  u11l1: view('MRL.MC'),
  u11l2: stop(),
  u11l3: view('GC=F'),
  u11l5: PORTFOLIO,
  // Cripto
  u12l1: watch('BTC-EUR'),
  u12l2: view('BTC-EUR'),
  u12l3: alert('BTC-EUR'),
  u12l4: view('ETH-EUR'),
  u13l1: view('BTC-EUR'),
  u13l3: view('DOGE-EUR'),
  u13l5: view('IBIT'),
  u13l6: PORTFOLIO,
  // Divisas
  u14l1: view('EURUSD=X'),
  u14l2: view('EURUSD=X'),
  u14l3: alert('EURUSD=X'),
  u14l4: PORTFOLIO,
  u14l5: watch('USDJPY=X'),
  // Materias primas
  u15l1: view('GC=F'),
  u15l2: view('CL=F'),
  u15l3: watch('HG=F'),
  u15l4: view('GDX'),
  u15l5: view('USO'),
  // Análisis fundamental
  u16l2: watch('ITX.MC'),
  u16l6: alert('ITX.MC'),
  u17l6: view('^GSPC'),
  u18l2: view('ITX.MC'),
  u18l3: view('TLT'),
  u18l4: view('^GSPC'),
  // Gráficos
  u19l2: view('AAPL'),
  u19l3: view(),
  u19l4: view('BTC-EUR'),
  u19l5: view('AAPL'),
  u19l6: view(),
  // Velas
  u20l2: view('BTC-EUR'),
  u20l3: view('ITX.MC'),
  u20l4: view('TSLA'),
  u20l5: view('BTC-EUR'),
  u20l6: view('NVDA'),
  u20l7: view(),
  // Soportes, resistencias y figuras
  u21l2: alert(),
  u21l3: view('AAPL'),
  u21l4: view(),
  u21l5: alert(),
  u21l6: view('BTC-EUR'),
  u21l7: alert(),
  // Indicadores
  u22l1: view(),
  u22l2: view('^GSPC'),
  u22l3: view(undefined, GAINERS),
  u22l4: view(),
  u22l5: stop(),
  u22l6: view(undefined, GAINERS),
  u22l7: view(),
  u23l2: view(),
  // Gestión del riesgo
  u24l1: stop(),
  u24l4: stop(),
  u24l7: PORTFOLIO,
  // Estrategias
  u25l1: view(SP500_ETF),
  u25l3: alert(),
  u25l4: view(undefined, '/mercado/explorar?type=ETF&sector=ETF%20dividendos'),
  u25l5: watch(),
  u25l6: stop(true),
  u25l7: PORTFOLIO,
  u25l8: view(),
  u25l9: buy(WORLD_ETF),
  // Plan y diario
  u26l1: JOURNAL,
  u26l2: JOURNAL,
  u26l3: PORTFOLIO,
  u26l4: PORTFOLIO,
  // Psicología
  u27l2: PORTFOLIO,
  u27l3: stop(true),
  u27l5: PORTFOLIO,
  u27l7: view(SP500_ETF),
  u28l1: alert(),
  u28l2: PORTFOLIO,
  u28l4: JOURNAL,
  // Carteras
  u29l2: watch('SPY|TLT|GLD'),
  u29l3: PORTFOLIO,
  u29l4: PORTFOLIO,
  u29l5: watch('VWCE.DE'),
  u29l6: view('VLUE|MTUM'),
  u29l7: view('ICLN'),
  u30l1: PORTFOLIO,
  u30l3: buy(WORLD_ETF),
  u30l4: PORTFOLIO,
  u30l5: alert(),
  u30l6: buyType('ETF'),
  // El dinero
  u1l1: PORTFOLIO,
  u1l2: view('^GSPC'),
  u1l3: view('^GSPC'),
  u1l4: buy(WORLD_ETF),
  u1l6: view('^GSPC'),
  u2l1: buyType('ETF'),
  u2l3: buyType('ETF'),
  u2l4: alert(),
  u2l5: watch(),
  u3l3: view('^GSPC'),
  u3l4: buyType('ETF'),
  u4l1: view('BTC-EUR'),
  u4l2: buy(WORLD_ETF),
  u4l4: view('^GSPC'),
  u4l5: buy(WORLD_ETF),
  // Impuestos
  u31l1: PORTFOLIO,
  u31l2: PORTFOLIO,
  u31l3: PORTFOLIO,
  u31l4: buyType('ETF'),
  u31l5: view('VWCE.DE|VGWL.DE'),
  u31l6: PORTFOLIO,
  // Estafas
  u32l1: view('^GSPC'),
  u32l2: view('^GSPC'),
  u32l3: alert(),
  u32l5: watch(),
  // Brókers
  u33l1: view(MSCI_WORLD, '/mercado/explorar?type=ETF&q=MSCI%20World'),
  u33l3: PORTFOLIO,
  u33l4: PORTFOLIO,
  // Historia
  u34l1: JOURNAL,
  u34l2: PORTFOLIO,
  u34l3: PORTFOLIO,
  u34l4: alert(SP500_ETF),
  u34l5: view('^N225'),
  u34l6: view('^IBEX'),
  u34l8: PORTFOLIO,
  u34l9: PORTFOLIO,
  // Retos con datos reales
  u35l1: watch(),
  u35l2: view('BTC-EUR'),
  u35l3: view('EURUSD=X'),
  u35l4: view(undefined, STOCKS),
  u35l5: alert(),
  u35l6: stop(),
  u35l7: view(),
  u35l8: stop(true),
  u35l9: PORTFOLIO,
}

/** Símbolos de una misión (vacío: vale cualquiera) */
export const targetsOf = (d: MissionDef) => (d.target && d.kind !== 'BUY_TYPE' && d.kind !== 'EXPLORE' && d.target !== 'BOTH' ? d.target.split('|') : [])

/** Adónde lleva el botón de la misión */
export function hrefOf(d: MissionDef): string {
  if (d.href) return d.href
  const first = targetsOf(d)[0]
  const asset = first ? `/mercado/${encodeURIComponent(first)}` : null
  switch (d.kind) {
    case 'VIEW_ASSET':
    case 'BUY_SYMBOL':
    case 'WATCH':
    case 'ALERT':
      return asset ?? '/mercado'
    case 'BUY_TYPE':
    case 'EXPLORE':
      return d.target ? `/mercado/explorar?type=${d.target}` : '/mercado'
    case 'OPEN_PORTFOLIO':
    case 'SELL':
      return '/mercado/cartera'
    case 'JOURNAL':
      return '/mercado/diario'
    default:
      return '/mercado'
  }
}

/** Comienzo de la frase en los tres idiomas («Pruébalo:», «Ahora tú:», «Prova-ho:», «Try it:»…) */
const MARK = /(Pruébalo|Ahora tú|Prova-ho|Ara tu|Try it|Your turn|Now you)\s*:\s*/g

/** Frase «Pruébalo» de un texto (sin la entrada ni las negritas), o null */
export function tryItIn(text: string): string | null {
  let last: RegExpExecArray | null = null
  for (let m = MARK.exec(text); m; m = MARK.exec(text)) last = m
  MARK.lastIndex = 0
  if (!last) return null
  const s = text.slice(last.index + last[0].length).replace(/\*\*/g, '').trim()
  return s ? s[0].toUpperCase() + s.slice(1) : null
}
