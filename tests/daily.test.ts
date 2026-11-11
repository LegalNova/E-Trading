import { describe, expect, it } from 'vitest'
import { BIG_DAYS, calendar, chestOf, DAILY_DAYS, DAILY_PLAN, dayIndex, giftOf, isBig, isOpened, numYmd, previewItems, resolveItems, withOpened, ymdNum } from '@/shared/daily'
import { addDays, dayOf } from '@/shared/time'

const sum = (kind: string) => DAILY_PLAN.flat().filter(x => x.kind === kind).reduce((t, x) => t + x.amount, 0)
const wallet = { unlimitedLives: false, lives: 2, livesMax: 5, freezes: 0, maxFreezes: 2 }

describe('plan de los 30 regalos', () => {
  it('hay un regalo para cada uno de los 30 días, y ninguno vacío', () => {
    expect(DAILY_PLAN).toHaveLength(DAILY_DAYS)
    for (let n = 1; n <= DAILY_DAYS; n++) expect(giftOf(n).length).toBeGreaterThan(0)
    expect(giftOf(0)).toEqual([])
    expect(giftOf(31)).toEqual([])
  })
  it('el día 1 son 1.000 € para empezar a invertir', () => expect(giftOf(1)).toEqual([{ kind: 'CASH', amount: 1000 }]))
  it('los días 7, 14, 21 y 30 son grandes y van creciendo', () => {
    expect([...BIG_DAYS]).toEqual([7, 14, 21, 30])
    const value = (n: number) => giftOf(n).reduce((t, x) => t + (x.kind === 'CASH' ? x.amount / 10 : x.kind === 'FREEZE' ? 200 : x.amount), 0)
    for (const n of BIG_DAYS) {
      expect(isBig(n)).toBe(true)
      expect(giftOf(n).length).toBeGreaterThan(1)
    }
    expect(value(14)).toBeGreaterThanOrEqual(value(7))
    expect(value(21)).toBeGreaterThan(value(14))
    expect(value(30)).toBeGreaterThan(value(21))
    // Un día grande da más dinero y más gemas que cualquier día normal
    const normal = Array.from({ length: 30 }, (_, i) => i + 1).filter(n => !isBig(n))
    const most = (kind: string, days: number[]) => Math.max(...days.flatMap(n => giftOf(n).filter(x => x.kind === kind).map(x => x.amount)))
    for (const n of BIG_DAYS) {
      expect(most('CASH', [n])).toBeGreaterThan(most('CASH', normal))
      expect(most('GEMS', [n])).toBeGreaterThan(most('GEMS', normal))
    }
  })
  it('equilibrado con la economía: 10.000 € (el saldo de Free), menos de 600 gemas y 4 protectores', () => {
    expect(sum('CASH')).toBe(10_000)
    expect(sum('GEMS')).toBeLessThan(600)
    expect(sum('FREEZE')).toBe(4)
    expect(sum('XP')).toBeLessThanOrEqual(300)
  })
  it('variado: no se repite el mismo tipo de premio dos días seguidos', () => {
    for (let n = 2; n <= DAILY_DAYS; n++) expect(giftOf(n)[0].kind === giftOf(n - 1)[0].kind && !isBig(n) && !isBig(n - 1)).toBe(false)
  })
  it('giftOf devuelve una copia (no se puede cambiar el plan desde fuera)', () => {
    giftOf(1).push({ kind: 'GEMS', amount: 9999 })
    expect(giftOf(1)).toHaveLength(1)
  })
})

describe('cálculo del día', () => {
  it('el día de inicio es el 1 y cada día de calendario suma uno', () => {
    expect(dayIndex('2026-11-11', '2026-11-11')).toBe(1)
    expect(dayIndex('2026-11-11', '2026-11-12')).toBe(2)
    expect(dayIndex('2026-11-11', '2026-12-10')).toBe(30)
    expect(dayIndex('2026-11-11', '2026-12-11')).toBe(31)
  })
  it('cambio de hora (último domingo de octubre) y de mes o año sin saltos', () => {
    expect(dayIndex('2026-10-24', '2026-10-26')).toBe(3)
    expect(dayIndex('2026-03-28', '2026-03-30')).toBe(3)
    expect(dayIndex('2026-12-31', '2027-01-01')).toBe(2)
    expect(dayIndex('2028-02-28', '2028-03-01')).toBe(3)
  })
  it('nunca menos de 1 (reloj atrasado o datos raros)', () => {
    expect(dayIndex('2026-11-11', '2026-11-09')).toBe(1)
    expect(dayIndex('', '2026-11-09')).toBe(1)
  })
  it('el día cambia a medianoche de Madrid, como la racha', () => {
    const start = dayOf(new Date('2026-11-11T10:00:00Z'))
    expect(dayIndex(start, dayOf(new Date('2026-11-11T22:59:00Z')))).toBe(1) // 23:59 en Madrid
    expect(dayIndex(start, dayOf(new Date('2026-11-11T23:00:00Z')))).toBe(2) // 00:00 en Madrid
  })
  it('AAAAMMDD ↔ AAAA-MM-DD', () => {
    expect(ymdNum('2026-11-11')).toBe(20261111)
    expect(numYmd(20261111)).toBe('2026-11-11')
    expect(numYmd(ymdNum(addDays('2026-11-11', 40)))).toBe('2026-12-21')
  })
})

describe('calendario', () => {
  it('días abiertos, de hoy, perdidos y próximos', () => {
    const mask = withOpened(withOpened(0, 1), 3)
    const s = calendar(4, mask)
    expect(s.slice(0, 5)).toEqual(['OPENED', 'MISSED', 'OPENED', 'TODAY', 'UPCOMING'])
    expect(s).toHaveLength(30)
  })
  it('hoy abierto ya sale como abierto', () => expect(calendar(2, withOpened(0, 2))[1]).toBe('OPENED'))
  it('pasados los 30 días, lo no abierto queda perdido', () => {
    const s = calendar(31, withOpened(0, 30))
    expect(s[29]).toBe('OPENED')
    expect(s.filter(x => x === 'MISSED')).toHaveLength(29)
  })
  it('la máscara de bits guarda los 30 días sin desbordar', () => {
    let m = 0
    for (let n = 1; n <= 30; n++) m = withOpened(m, n)
    expect(m).toBe(2 ** 30 - 1)
    for (let n = 1; n <= 30; n++) expect(isOpened(m, n)).toBe(true)
    expect(isOpened(m, 31)).toBe(false)
    expect(withOpened(m, 5)).toBe(m) // abrir dos veces no cambia nada
  })
})

describe('premios que no sirven', () => {
  it('con vidas llenas o ilimitadas, la recarga se cambia por gemas', () => {
    expect(resolveItems([{ kind: 'LIVES', amount: 5 }], { ...wallet, lives: 5 })).toEqual([{ kind: 'GEMS', amount: 20, from: 'LIVES' }])
    expect(resolveItems([{ kind: 'LIVES', amount: 5 }], { ...wallet, unlimitedLives: true })).toEqual([{ kind: 'GEMS', amount: 20, from: 'LIVES' }])
    expect(resolveItems([{ kind: 'LIVES', amount: 5 }], wallet)).toEqual([{ kind: 'LIVES', amount: 5 }])
  })
  it('con el máximo de protectores, el protector se cambia por gemas', () => {
    expect(resolveItems([{ kind: 'FREEZE', amount: 1 }], { ...wallet, freezes: 2 })).toEqual([{ kind: 'GEMS', amount: 40, from: 'FREEZE' }])
    expect(resolveItems([{ kind: 'FREEZE', amount: 1 }], { ...wallet, freezes: 1 })).toEqual([{ kind: 'FREEZE', amount: 1 }])
  })
  it('el resto se da tal cual', () => expect(resolveItems(giftOf(30), { ...wallet, freezes: 0 })).toEqual(giftOf(30)))
  it('vista previa: con Plus o Max la recarga de vidas ya se enseña como gemas', () => {
    expect(previewItems(giftOf(3), true)).toEqual([{ kind: 'GEMS', amount: 20 }])
    expect(previewItems(giftOf(3), false)).toEqual(giftOf(3))
  })
})

describe('cofre semanal', () => {
  it('cambia cada semana y se repite cada 4', () => {
    const w = ['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23'].map(chestOf)
    expect(new Set(w.map(x => x[0].kind)).size).toBe(4)
    expect(chestOf('2026-11-30')).toEqual(w[0])
  })
  it('es pequeño: menos que un día grande', () => {
    for (const k of ['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23']) for (const x of chestOf(k)) expect(x.kind === 'CASH' ? x.amount <= 500 : x.amount <= 50).toBe(true)
  })
})
