// Motor de clases: cada tipo de ejercicio se corrige bien, la solución no se filtra y lo revelado viene de datos reales
import { describe, expect, it } from 'vitest'
import { buckets, chat, match, multi, num, order, portfolio, scenario, simTrade, single, spot, tf, timed, upDown, level, candle, fill, type ContentQuestion } from '@/server/content/dsl'
import { grade } from '@/server/content/grading'
import CHARTS from '@/server/content/charts.json'

const Q = (q: Omit<ContentQuestion, 'id'>) => ({ ...q, id: 't' }) as ContentQuestion
const fixtures = CHARTS as Record<string, { outcome?: string; entry?: number; support?: number; resistance?: number; atr?: number; target?: number }>
const firstOf = (prefix: string) => Object.keys(fixtures).find(k => k.startsWith(prefix))!

describe('tipos clásicos', () => {
  it('test de una respuesta: la correcta acierta y las demás fallan', () => {
    const q = Q(single('¿Cuánto es 2+2?', ['3', '4', '5'], 1, 'Cuatro.'))
    expect(grade(q, q.solution).correct).toBe(true)
    expect(grade(q, ((q.solution as number) + 1) % 3).correct).toBe(false)
  })
  it('verdadero o falso', () => {
    const q = Q(tf('El agua moja', true, 'Sí.'))
    expect(grade(q, 0).correct).toBe(true)
    expect(grade(q, 1).correct).toBe(false)
  })
  it('varias correctas: da igual el orden, pero tienen que ser todas', () => {
    const q = Q(multi('Pares', ['1', '2', '3', '4'], [1, 3], 'Ok'))
    const sol = q.solution as number[]
    expect(grade(q, [...sol].reverse()).correct).toBe(true)
    expect(grade(q, sol.slice(0, 1)).correct).toBe(false)
  })
  it('ordenar: solo vale el orden exacto', () => {
    const q = Q(order('Ordena', ['a', 'b', 'c'], 'Ok'))
    expect(grade(q, q.solution).correct).toBe(true)
    expect(grade(q, [...(q.solution as number[])].reverse()).correct).toBe(false)
  })
  it('rellenar huecos sin distinguir mayúsculas', () => {
    const q = Q(fill('La ____ sube los precios', 'inflación', ['deflación'], 'Ok'))
    expect(grade(q, 'Inflación').correct).toBe(true)
    expect(grade(q, 'deflación').correct).toBe(false)
  })
})

describe('tipos dinámicos', () => {
  it('emparejar: cada izquierda con su derecha, la columna derecha barajada', () => {
    const q = Q(match('Empareja', [['PER', 'precio / beneficio'], ['ROE', 'beneficio / patrimonio'], ['TER', 'coste anual del fondo']], 'Ok'))
    const sol = q.solution as number[]
    sol.forEach((r, i) => expect(q.right![r]).toBe([['PER', 'precio / beneficio'], ['ROE', 'beneficio / patrimonio'], ['TER', 'coste anual del fondo']][i][1]))
    expect(grade(q, sol).correct).toBe(true)
    expect(grade(q, [sol[1], sol[0], sol[2]]).correct).toBe(false)
  })
  it('clasificar en grupos', () => {
    const q = Q(buckets('¿Buena o mala?', ['Buena', 'Mala'], [['Hipoteca a tipo bajo', 0], ['Revolving al 24 %', 1], ['Préstamo para formarte', 0]], 'Ok'))
    expect(grade(q, q.solution).correct).toBe(true)
    expect(grade(q, (q.solution as number[]).map(g => 1 - g)).correct).toBe(false)
  })
  it('número con margen relativo', () => {
    const q = Q(num('¿Cuánto es 1.000 € al 7 % en 10 años?', 1967.15, '€', 'Ok'))
    expect(grade(q, 1967).correct).toBe(true)
    expect(grade(q, 1980).correct).toBe(true) // dentro del 1 %
    expect(grade(q, 2100).correct).toBe(false)
  })
  it('escenario y chat: la explicación incluye la consecuencia de lo elegido', () => {
    const q = Q(scenario('Cae un 20 %', [['Vendo todo', 'Vendes en el pánico.'], ['Reviso mi plan', 'Bien: primero el plan.']], 1, 'Regla: plan antes que emoción.'))
    const good = grade(q, q.solution)
    expect(good.correct).toBe(true)
    expect(good.explanation).toContain('Bien: primero el plan.')
    const bad = grade(q, 1 - (q.solution as number))
    expect(bad.explanation).toContain('Vendes en el pánico.')
    const c = Q(chat(['¡Mira, sube un 40 %!'], '¿Qué le dices?', [['¡Compro ya!', 'Eso es FOMO.'], ['¿Por qué sube?', 'Exacto.']], 1, 'Ok'))
    expect(grade(c, c.solution).explanation).toContain('Exacto.')
    expect(c.meta?.lines).toEqual(['¡Mira, sube un 40 %!'])
  })
  it('detectar la estafa: hay que marcar todas', () => {
    const q = Q(spot('¿Cuáles son estafa?', [['Banco', 'Tu extracto ya está disponible en la app', false], ['+34 600…', 'Gana un 3 % diario garantizado', true], ['Inversor', 'Te duplico el dinero en 1 mes', true]], 'Ok'))
    expect(grade(q, q.solution).correct).toBe(true)
    expect(grade(q, (q.solution as number[]).slice(1)).correct).toBe(false)
  })
  it('cartera: suma 100 y cumple las reglas', () => {
    const q = Q(portfolio('Reparte', [['MSCI World', 'ACCIONES'], ['Bonos UE', 'BONOS'], ['Bitcoin', 'CRIPTO']], { maxWeight: 70, maxKind: { CRIPTO: 10 }, minKind: { BONOS: 20 } }, 'Ok'))
    expect(grade(q, [65, 30, 5]).correct).toBe(true)
    expect(grade(q, [50, 30, 20]).correct).toBe(false) // demasiada cripto
    expect(grade(q, [60, 30, 5]).correct).toBe(false) // no suma 100
    expect(grade(q, [80, 15, 5]).explanation).toContain('máximo por activo')
  })
  it('cronometrado: si se acaba el tiempo cuenta como fallo', () => {
    const q = Q(timed(tf('Rápido: ¿el IBEX es un índice?', true, 'Sí.'), 8))
    expect(q.meta?.timeLimit).toBe(8)
    expect(grade(q, '__timeout__').correct).toBe(false)
  })
})

describe('gráficos reales', () => {
  it('toca la vela del patrón detectado', () => {
    const q = Q(candle('Toca el martillo', 'hammer-1', 'Mecha larga abajo.'))
    expect(grade(q, fixtures['hammer-1'].target).correct).toBe(true)
  })
  it('¿sube o baja?: la solución sale del dato real y el futuro solo se ve al responder', () => {
    const id = firstOf('ud-')
    const q = Q(upDown('¿Qué crees que pasó?', id, 'Nadie lo sabe con certeza.'))
    expect(q.solution).toBe(fixtures[id].outcome === 'UP' ? 0 : 1)
    expect(q.candles?.length).toBe(30)
    const r = grade(q, q.solution)
    expect(r.correct).toBe(true)
    expect(r.reveal?.candles?.length).toBe(10)
    expect(r.reveal?.outcome).toMatch(/%/)
  })
  it('colocar el stop: vale justo por debajo del mínimo, no encima de la entrada', () => {
    const id = firstOf('lvl-')
    const f = fixtures[id]
    const q = Q(level('Pon el stop', id, 'STOP', 'Debajo del mínimo.'))
    expect(grade(q, f.support! - 0.5 * f.atr!).correct).toBe(true)
    expect(grade(q, f.entry! * 1.01).correct).toBe(false)
    expect(grade(q, f.support! - 5 * f.atr!).correct).toBe(false) // demasiado lejos
  })
  it('simular la operación: importe y stop con la regla del 1 %', () => {
    const id = firstOf('lvl-')
    const f = fixtures[id]
    const q = Q(simTrade('Compra con un riesgo del 1 %', id, 'Regla del 1 %.'))
    const stop = f.support! - 0.3 * f.atr!
    const amount = (100 * f.entry!) / (f.entry! - stop) // arriesga 100 € de 10.000 €
    const ok = grade(q, [Math.min(amount, 10_000), stop])
    expect(ok.correct).toBe(amount <= 10_000)
    expect(grade(q, [10_000, 0]).correct).toBe(false) // sin stop
    expect(grade(q, [10_000, stop]).correct).toBe(amount >= 10_000 * 0.95) // todo el saldo suele arriesgar de más
    expect(ok.reveal?.levels?.entry).toBe(f.entry)
  })
})
