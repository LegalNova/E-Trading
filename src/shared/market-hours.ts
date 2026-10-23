// Horarios de mercado reales por bolsa (docs/03-mercado.md §3).
// Se calculan en la zona horaria de cada bolsa, así el cambio de hora de
// EE. UU. y Europa (que no coincide unas semanas) sale bien solo.

export type ExchangeCode = 'NASDAQ' | 'NYSE' | 'BME' | 'XETRA' | 'CRYPTO' | 'FX' | 'INDEX_US' | 'INDEX_ES'

interface Session { tz: string; open: [number, number]; close: [number, number] }

const SESSIONS: Partial<Record<ExchangeCode, Session>> = {
  NASDAQ: { tz: 'America/New_York', open: [9, 30], close: [16, 0] },
  NYSE: { tz: 'America/New_York', open: [9, 30], close: [16, 0] },
  INDEX_US: { tz: 'America/New_York', open: [9, 30], close: [16, 0] },
  BME: { tz: 'Europe/Madrid', open: [9, 0], close: [17, 30] },
  INDEX_ES: { tz: 'Europe/Madrid', open: [9, 0], close: [17, 30] },
  XETRA: { tz: 'Europe/Berlin', open: [9, 0], close: [17, 30] },
}

/** Festivos (fecha local de cada bolsa). En la etapa 3 vendrán de la tabla MarketHoliday. */
const HOLIDAYS: Partial<Record<ExchangeCode, string[]>> = {
  NASDAQ: ['2026-11-26', '2026-12-25', '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24'],
  BME: ['2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01', '2027-03-26', '2027-03-29', '2027-12-24', '2027-12-31'],
  XETRA: ['2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01', '2027-03-26', '2027-03-29', '2027-12-24', '2027-12-31'],
}
HOLIDAYS.NYSE = HOLIDAYS.NASDAQ
HOLIDAYS.INDEX_US = HOLIDAYS.NASDAQ
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
    if (wd === 'Sun') return mins >= 23 * 60
    if (wd === 'Fri') return mins < 23 * 60
    return true
  }
  const s = SESSIONS[exchange]
  if (!s) return false
  const { wd, ymd, mins } = parts(now, s.tz)
  if (wd === 'Sat' || wd === 'Sun') return false
  if (HOLIDAYS[exchange]?.includes(ymd)) return false
  return mins >= s.open[0] * 60 + s.open[1] && mins < s.close[0] * 60 + s.close[1]
}

/** Próxima apertura (para órdenes pendientes). Busca minuto a minuto en saltos de 15 min, como mucho 7 días. */
export function nextOpen(exchange: ExchangeCode, now = new Date()): Date | null {
  if (exchange === 'CRYPTO') return null
  if (isOpen(exchange, now)) return now
  const t = new Date(now)
  t.setSeconds(0, 0)
  t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15)
  for (let i = 0; i < 7 * 24 * 4; i++) {
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
  for (let i = 0; i < 7 * 24 * 4; i++) {
    t.setTime(t.getTime() + 15 * 60_000)
    if (!isOpen(exchange, t)) return t
  }
  return null
}
