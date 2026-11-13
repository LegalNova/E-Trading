import { describe, expect, it } from 'vitest'
import { splitText, wordCount } from '@/shared/split-text'

const para = (n: number, w = 'palabra') => Array.from({ length: n }, () => w).join(' ')

describe('una idea por pantalla (PRO-16)', () => {
  it('un texto corto no se parte', () => expect(splitText(para(40))).toHaveLength(1))
  it('un párrafo largo sin cortes no se parte', () => expect(splitText(para(90))).toHaveLength(1))
  it('se corta entre párrafos y no se pierde nada', () => {
    const body = [para(25), para(25), para(25)].join('\n\n')
    const parts = splitText(body)
    expect(parts.length).toBeGreaterThan(1)
    expect(parts.join('\n\n')).toBe(body)
    expect(parts.reduce((a, p) => a + wordCount(p), 0)).toBe(75)
  })
  it('como mucho tres pantallas', () => expect(splitText([para(30), para(30), para(30), para(30), para(30)].join('\n\n')).length).toBeLessThanOrEqual(3))
  it('no deja una pantalla con menos de 8 palabras', () => expect(splitText([para(50), para(4)].join('\n\n'))).toHaveLength(1))
  it('una lista no se rompe (va en un solo párrafo)', () => {
    const list = ['• uno dos tres cuatro', '• cinco seis siete ocho', '• nueve diez once doce'].join('\n')
    const parts = splitText([para(40), list].join('\n\n'))
    expect(parts.some(p => p === list)).toBe(true)
  })
})
