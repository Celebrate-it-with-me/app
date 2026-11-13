import { describe, it, expect } from 'vitest'
import { commitmentRows, commitmentsPayload, commitmentsValid, emptyPadrino, formFromPadrino, padrinoErrors, padrinoPayload, whatsappUrl } from '../utils/padrinos'

describe('padrino form', () => {
  it('asks for a name and a valid phone', () => {
    expect(padrinoErrors(emptyPadrino())).toEqual({ name: 'app.padrinos.errors.name' })
    expect(padrinoErrors({ ...emptyPadrino(), name: 'Raúl', phone: 'abc' })).toEqual({ phone: 'app.padrinos.errors.phone' })
    expect(padrinoErrors({ ...emptyPadrino(), name: 'Raúl', phone: '+1 305 555 0101' })).toEqual({})
  })

  it('builds the payload and drops the thanks text when it is not public', () => {
    expect(padrinoPayload({ ...emptyPadrino(), name: ' Raúl ', thanksText: 'Gracias', publicThanks: false })).toMatchObject({ name: 'Raúl', phone: null, thanksText: null, publicThanks: false, status: 'invited' })
    expect(padrinoPayload({ ...emptyPadrino(), name: 'Raúl', thanksText: ' Gracias ', publicThanks: true }).thanksText).toBe('Gracias')
  })

  it('round-trips a padrino into the form', () => {
    expect(formFromPadrino({ name: 'A', phone: null, relationship: null, status: 'accepted', publicThanks: true, thanksText: null })).toEqual({
      name: 'A', phone: '', relationship: '', status: 'accepted', publicThanks: true, thanksText: ''
    })
  })
})

describe('commitments', () => {
  const items = [{ id: 1, title: 'Pastel', owed: 400 }, { id: 2, title: 'DJ', owed: 1200 }]

  it('checks the items the padrino already covers', () => {
    const rows = commitmentRows(items, [{ budgetItemId: 2, amount: 600 }])
    expect(rows.map(r => [r.budgetItemId, r.checked, r.amount])).toEqual([[1, false, ''], [2, true, '600']])
  })

  it('sends only checked rows, with numbers, and requires amounts above zero', () => {
    const rows = [{ budgetItemId: 1, checked: true, amount: '250.5' }, { budgetItemId: 2, checked: false, amount: '' }]
    expect(commitmentsPayload(rows)).toEqual([{ budgetItemId: 1, amount: 250.5 }])
    expect(commitmentsValid(rows)).toBe(true)
    expect(commitmentsValid([{ budgetItemId: 1, checked: true, amount: '' }])).toBe(false)
    expect(commitmentsValid([{ budgetItemId: 1, checked: false, amount: '' }])).toBe(true)
  })
})

it('builds the WhatsApp link', () => {
  expect(whatsappUrl('+1 (305) 555-0101', 'Hola')).toBe('https://wa.me/13055550101?text=Hola')
  expect(whatsappUrl(null, 'Hola')).toBe('https://wa.me/?text=Hola')
})
