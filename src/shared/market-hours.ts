// Horarios de mercado reales por bolsa (docs/03-mercado.md §3), en la zona horaria de cada una:
// así el cambio de hora de cada país sale bien solo. Incluye las pausas de mediodía de Asia.
// Los festivos solo están para EE. UU., España y Alemania; en el resto, el servidor no ejecuta
// órdenes a mercado con un precio viejo, así que un festivo se comporta como mercado cerrado.

export type ExchangeCode = string

interface Session {
  tz: string
  /** Tramos [inicio, fin] en minutos desde medianoche (hora local de la bolsa) */
  parts: [number, number][]
}

const m = (h: number, min = 0) => h * 60 + min
const S = (tz: string, ...parts: [number, number][]): Session => ({ tz, parts })

export const SESSIONS: Record<string, Session> = {
  // América
  US: S('America/New_York', [m(9, 30), m(16)]),
  NASDAQ: S('America/New_York', [m(9, 30), m(16)]),
  NYSE: S('America/New_York', [m(9, 30), m(16)]),
  INDEX_US: S('America/New_York', [m(9, 30), m(16)]),
  TSX: S('America/Toronto', [m(9, 30), m(16)]),
  B3: S('America/Sao_Paulo', [m(10), m(17, 55)]),
  BMV: S('America/Mexico_City', [m(8, 30), m(15)]),
  BCBA: S('America/Argentina/Buenos_Aires', [m(11), m(17)]),
  BCS: S('America/Santiago', [m(9, 30), m(16)]),
  // Europa
  LSE: S('Europe/London', [m(8), m(16, 30)]),
  XETRA: S('Europe/Berlin', [m(9), m(17, 30)]),
  EPA: S('Europe/Paris', [m(9), m(17, 30)]),
  AMS: S('Europe/Amsterdam', [m(9), m(17, 30)]),
  BRU: S('Europe/Brussels', [m(9), m(17, 30)]),
  LIS: S('Europe/Lisbon', [m(8), m(16, 30)]),
  MIL: S('Europe/Rome', [m(9), m(17, 30)]),
  BME: S('Europe/Madrid', [m(9), m(17, 30)]),
  INDEX_ES: S('Europe/Madrid', [m(9), m(17, 30)]),
  SIX: S('Europe/Zurich', [m(9), m(17, 30)]),
  STO: S('Europe/Stockholm', [m(9), m(17, 30)]),
  CPH: S('Europe/Copenhagen', [m(9), m(17)]),
  OSL: S('Europe/Oslo', [m(9), m(16, 20)]),
  HEL: S('Europe/Helsinki', [m(10), m(18, 30)]),
  DUB: S('Europe/Dublin', [m(8), m(16, 30)]),
  VIE: S('Europe/Vienna', [m(9), m(17, 30)]),
  WSE: S('Europe/Warsaw', [m(9), m(17)]),
  BIST: S('Europe/Istanbul', [m(10), m(18)]),
  // Asia-Pacífico
  TSE: S('Asia/Tokyo', [m(9), m(11, 30)], [m(12, 30), m(15, 30)]),
  HKEX: S('Asia/Hong_Kong', [m(9, 30), m(12)], [m(13), m(16)]),
  NSE: S('Asia/Kolkata', [m(9, 15), m(15, 30)]),
  KRX: S('Asia/Seoul', [m(9), m(15, 30)]),
  SGX: S('Asia/Singapore', [m(9), m(12)], [m(13), m(17)]),
  ASX: S('Australia/Sydney', [m(10), m(16)]),
  TWSE: S('Asia/Taipei', [m(9), m(13, 30)]),
  SSE: S('Asia/Shanghai', [m(9, 30), m(11, 30)], [m(13), m(15)]),
  SZSE: S('Asia/Shanghai', [m(9, 30), m(11, 30)], [m(13), m(15)]),
  IDX: S('Asia/Jakarta', [m(9), m(12)], [m(13, 30), m(15, 50)]),
  BURSA: S('Asia/Kuala_Lumpur', [m(9), m(12, 30)], [m(14, 30), m(17)]),
  SET: S('Asia/Bangkok', [m(10), m(12, 30)], [m(14, 30), m(16, 30)]),
  NZX: S('Pacific/Auckland', [m(10), m(16, 45)]),
}

/** Bolsa de cada zona horaria (para los índices, que no tienen sufijo) */
export const EXCHANGE_BY_TZ: Record<string, string> = {
  'America/New_York': 'US', 'Europe/London': 'LSE', 'Europe/Berlin': 'XETRA', 'Europe/Paris': 'EPA', 'Europe/Amsterdam': 'AMS', 'Europe/Madrid': 'BME',
  'Europe/Rome': 'MIL', 'Europe/Zurich': 'SIX', 'Asia/Tokyo': 'TSE', 'Asia/Hong_Kong': 'HKEX', 'Asia/Kolkata': 'NSE', 'Asia/Seoul': 'KRX',
  'Asia/Singapore': 'SGX', 'Australia/Sydney': 'ASX', 'Asia/Taipei': 'TWSE', 'Asia/Shanghai': 'SSE',
  'America/Chicago': 'US', 'America/Toronto': 'TSX', 'America/Sao_Paulo': 'B3', 'America/Mexico_City': 'BMV', 'America/Argentina/Buenos_Aires': 'BCBA',
  'America/Santiago': 'BCS', 'Europe/Stockholm': 'STO', 'Europe/Copenhagen': 'CPH', 'Europe/Oslo': 'OSL', 'Europe/Helsinki': 'HEL', 'Europe/Brussels': 'BRU',
  'Europe/Lisbon': 'LIS', 'Europe/Vienna': 'VIE', 'Europe/Dublin': 'DUB', 'Europe/Warsaw': 'WSE', 'Europe/Istanbul': 'BIST', 'Asia/Jakarta': 'IDX',
  'Asia/Kuala_Lumpur': 'BURSA', 'Asia/Bangkok': 'SET', 'Pacific/Auckland': 'NZX',
}

/** Festivos conocidos (fecha local de cada bolsa) */
const HOLIDAYS: Record<string, string[]> = {
  US: ['2026-11-26', '2026-12-25', '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24'],
  BME: ['2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01', '2027-03-26', '2027-03-29', '2027-12-24', '2027-12-31'],
  XETRA: ['2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01', '2027-03-26', '2027-03-29', '2027-12-24', '2027-12-31'],
}
HOLIDAYS.NASDAQ = HOLIDAYS.US
HOLIDAYS.NYSE = HOLIDAYS.US
HOLIDAYS.INDEX_US = HOLIDAYS.US
HOLIDAYS.INDEX_ES = HOLIDAYS.BME

function parts(date: Date, tz: string) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date)
  const get = (t: string) => p.find(x => x.type === t)?.value ?? ''
  return { wd: get('weekday'), ymd: `${get('year')}-${get('month')}-${get('day')}`, mins: (Number(get('hour')) % 24) * 60 + Number(get('minute')) }
}

/** ¿Está abierta esta bolsa en este instante? */
export function isOpen(exchange: ExchangeCode, now = new Date()): boolean {
  if (exchange === 'CRYPTO') return true
  if (exchange === 'FX') {
    // Domingo 23:00 – viernes 23:00 (hora de Madrid)
    const { wd, mins } = parts(now, 'Europe/Madrid')
    if (wd === 'Sat') return false
    if (wd === 'Sun') return mins >= m(23)
    if (wd === 'Fri') return mins < m(23)
    return true
  }
  if (exchange === 'CME') {
    // Futuros: domingo 18:00 – viernes 17:00 (Nueva York), con pausa diaria de 17:00 a 18:00
    const { wd, mins } = parts(now, 'America/New_York')
    if (wd === 'Sat') return false
    if (wd === 'Sun') return mins >= m(18)
    if (wd === 'Fri') return mins < m(17)
    return mins < m(17) || mins >= m(18)
  }
  const s = SESSIONS[exchange]
  if (!s) return false
  const { wd, ymd, mins } = parts(now, s.tz)
  if (wd === 'Sat' || wd === 'Sun') return false
  if (HOLIDAYS[exchange]?.includes(ymd)) return false
  return s.parts.some(([a, b]) => mins >= a && mins < b)
}

/** Próxima apertura (para órdenes pendientes). Busca en saltos de 15 min, como mucho 8 días. */
export function nextOpen(exchange: ExchangeCode, now = new Date()): Date | null {
  if (exchange === 'CRYPTO') return null
  if (isOpen(exchange, now)) return now
  const t = new Date(now)
  t.setSeconds(0, 0)
  t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15)
  for (let i = 0; i < 8 * 24 * 4; i++) {
    if (isOpen(exchange, t)) return t
    t.setTime(t.getTime() + 15 * 60_000)
  }
  return null
}

/** Próximo cierre si está abierta */
export function nextClose(exchange: ExchangeCode, now = new Date()): Date | null {
  if (exchange === 'CRYPTO' || !isOpen(exchange, now)) return null
  const t = new Date(now)
  t.setSeconds(0, 0)
  for (let i = 0; i < 8 * 24 * 4; i++) {
    t.setTime(t.getTime() + 15 * 60_000)
    if (!isOpen(exchange, t)) return t
  }
  return null
}
