// Auditoría P0-8: el invitado no se llama «Anonymous»
import { describe, expect, it } from 'vitest'
import { guestName, realName } from '@/shared/names'
import { firstName, personalize } from '@/shared/team-messages'

describe('nombre del invitado', () => {
  it('el «Anonymous» de la cuenta de invitado no es un nombre', () => {
    expect(realName('Anonymous')).toBe('')
    expect(realName(' anonymous ')).toBe('')
    expect(realName('')).toBe('')
    expect(realName(null)).toBe('')
  })
  it('quita el «Anonymous» que quedó pegado delante del nombre', () => {
    expect(realName('AnonymousPrueba')).toBe('Prueba')
    expect(realName('Anonymousmarta')).toBe('marta')
  })
  it('no toca los nombres de verdad', () => {
    expect(realName('Marta Ruiz')).toBe('Marta Ruiz')
    expect(realName('  Joan ')).toBe('Joan')
    expect(realName('Ana Anonymous')).toBe('Ana Anonymous')
  })
  it('sin nombre, a los demás se les muestra «Invitado» en su idioma', () => {
    expect(guestName('es')).toBe('Invitado')
    expect(guestName('ca')).toBe('Convidat')
    expect(guestName('en')).toBe('Guest')
    expect(guestName('fr')).toBe('Invitado')
  })
  it('los mensajes con {nombre} no saludan a «Anonymous»', () => {
    expect(firstName('Anonymous')).toBe('')
    expect(personalize('Hola {nombre}, gracias', 'Anonymous')).toBe('Hola, gracias')
    expect(personalize('Hola {nombre}, gracias', 'AnonymousLeo')).toBe('Hola Leo, gracias')
  })
})
