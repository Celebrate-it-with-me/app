import { describe, it, expect } from 'vitest'
import { TABS, noCounts, peopleIn, personErrors, personPayload, whatsappNumber, whatsappUrl } from '../utils/roster'

describe('roster helpers', () => {
  it('has the four tabs and a counter key for each', () => {
    expect(TABS.map(t => t.value)).toEqual(['all', 'attending', 'pending', 'not-attending'])
    expect(TABS.every(t => t.count in noCounts())).toBe(true)
  })

  it('validates name, email and phone', () => {
    expect(personErrors({ name: ' ', email: 'no', phone: 'abc' })).toEqual({
      name: 'app.roster.errors.name', email: 'app.roster.errors.email', phone: 'app.roster.errors.phone'
    })
    expect(personErrors({ name: 'Ana', email: 'ana@example.com', phone: '+1 305 555 0101' })).toEqual({})
    expect(personErrors({ name: 'Ana', email: '', phone: '' })).toEqual({})
  })

  it('sends empty optional fields as null', () => {
    expect(personPayload({ name: ' Ana ', email: '', phone: ' +1 305 ', notes: '' })).toEqual({ name: 'Ana', email: null, phone: '+1 305', notes: null })
  })

  it('counts the people of a family', () => {
    expect(peopleIn({ companions: [{}, {}] })).toBe(3)
    expect(peopleIn({ companions: [] })).toBe(1)
  })

  it('builds WhatsApp links from digits only', () => {
    expect(whatsappNumber('+1 (305) 555-0101')).toBe('13055550101')
    expect(whatsappNumber('123')).toBeNull()
    expect(whatsappUrl('+1 305 555 0101', 'Hola ¿qué tal?')).toBe('https://wa.me/13055550101?text=Hola%20%C2%BFqu%C3%A9%20tal%3F')
    expect(whatsappUrl(null, 'x')).toBe('https://wa.me/?text=x')
  })
})
