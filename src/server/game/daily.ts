import 'server-only'
// Regalo diario: 30 días con un regalo por día y, después, un cofre cada semana. Plan y cálculo del día: src/shared/daily.ts.
// Estado en los contadores del estado de juego (c.counters, se guardan solos):
//  · dailyStart: día de inicio del calendario (AAAAMMDD), el día en que se abre el primer regalo;
//  · dailyMask: días abiertos (bit n-1 = día n);
//  · dailyChest: semana del último cofre abierto (AAAAMMDD del lunes, semana de Madrid);
//  · dailyCash: euros virtuales regalados desde el último reinicio de la cartera (para no contarlos como rentabilidad).
// A prueba de trampas: el servidor decide el día y el premio; abrir es una escritura, así que withCtx bloquea la fila del
// usuario y dos peticiones a la vez se ejecutan una detrás de otra (la segunda ya ve el día abierto y falla con 409).
import type { DailyDayT, DailyOpenT, DailyT } from '@/shared/contract'
import { calendar, chestOf, DAILY_DAYS, dayIndex, giftOf, isBig, isOpened, numYmd, previewItems, resolveItems, withOpened, ymdNum, type Granted } from '@/shared/daily'
import { weekOf } from '@/shared/time'
import { viewAs } from '../view'
import { bump, endFx, fail, LIVES_MAX, MAX_FREEZES, withCtx, type Ctx } from './core'
import { track } from './analytics'
import { giveCash } from './trading'

const unlimited = (c: Ctx) => c.user.plan !== 'FREE'

function stateOf(c: Ctx) {
  const start = c.counters.dailyStart ? numYmd(c.counters.dailyStart) : null
  const day = start ? dayIndex(start, c.today) : 1
  const mask = c.counters.dailyMask ?? 0
  const week = weekOf(Date.now())
  return { start, day, mask, week, chestOpened: c.counters.dailyChest === ymdNum(week) }
}

function view(c: Ctx): DailyT {
  const s = stateOf(c)
  const status = calendar(s.day, s.mask)
  const days: DailyDayT[] = status.map((st, i) => ({ n: i + 1, status: st, big: isBig(i + 1), items: previewItems(giftOf(i + 1), unlimited(c)) }))
  const chest = s.day > DAILY_DAYS
  return {
    phase: chest ? 'CHEST' : 'CALENDAR',
    day: s.day,
    total: DAILY_DAYS,
    todayOpened: chest ? s.chestOpened : isOpened(s.mask, s.day),
    canOpen: !viewAs(),
    days,
    tomorrow: s.day < DAILY_DAYS ? days[s.day] : null,
    chest: chest ? { opened: s.chestOpened, items: previewItems(chestOf(s.week), unlimited(c)) } : null,
  }
}

export const daily = () => withCtx(async c => view(c))

/** Da los premios (ya resueltos) dentro de la transacción */
async function grant(c: Ctx, items: Granted[]) {
  for (const x of items) {
    if (x.kind === 'CASH') {
      // Dinero virtual a la cartera: como aportación, para que no cuente como rentabilidad en la liga
      await giveCash(c.tx, c.user, x.amount)
      bump(c, 'dailyCash', x.amount)
    } else if (x.kind === 'GEMS') c.g.gems += x.amount
    else if (x.kind === 'LIVES') {
      c.g.lives = LIVES_MAX
      c.g.livesUpdatedAt = new Date()
    } else if (x.kind === 'FREEZE') c.g.freezes = Math.min(MAX_FREEZES, c.g.freezes + x.amount)
    else if (x.kind === 'XP') {
      // Cuenta para el nivel, no para la liga de la semana (la liga se gana aprendiendo, no abriendo regalos)
      c.g.xp += x.amount
      c.fx.xp += x.amount
    }
  }
}

/** Abre el regalo de hoy (o el cofre de la semana, pasados los 30 días). El cliente no elige ni el día ni el premio. */
export const openDaily = () =>
  withCtx(async (c): Promise<DailyOpenT> => {
    if (viewAs()) fail(403, 'VIEW_ONLY', 'Estás viendo la app como otro usuario: no puedes abrir sus regalos.')
    const s = stateOf(c)
    const wallet = { unlimitedLives: unlimited(c), lives: c.g.lives, livesMax: LIVES_MAX, freezes: c.g.freezes, maxFreezes: MAX_FREEZES }
    let kind: DailyOpenT['kind']
    let items: Granted[]
    if (s.day > DAILY_DAYS) {
      if (s.chestOpened) fail(409, 'ALREADY_OPENED', 'Ya has abierto el cofre de esta semana. El lunes hay otro.')
      kind = 'CHEST'
      items = resolveItems(chestOf(s.week), wallet)
      c.counters.dailyChest = ymdNum(s.week)
    } else {
      if (isOpened(s.mask, s.day)) fail(409, 'ALREADY_OPENED', 'Ya has abierto el regalo de hoy. Vuelve mañana a por el siguiente.')
      kind = 'DAY'
      items = resolveItems(giftOf(s.day), wallet)
      if (!s.start) c.counters.dailyStart = ymdNum(c.today)
      c.counters.dailyMask = withOpened(s.mask, s.day)
    }
    await grant(c, items)
    await track(c.tx, c.user.id, 'daily_gift', { kind, day: s.day })
    const effects = await endFx(c)
    return { kind, day: s.day, items, daily: view(c), effects }
  })
