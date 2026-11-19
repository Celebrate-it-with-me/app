import { describe, it, expect } from 'vitest'
import { DELIVERY_FILTERS, deliveryChips, deliveryOf, noDeliveryCounts } from '../utils/delivery'

const row = (delivery, extra = {}) => ({ id: 1, phone: '+13055550123', whatsappOptedOut: false, delivery, ...extra })

describe('deliveryOf', () => {
  it('is null when the roster did not report delivery', () => {
    expect(deliveryOf({ id: 1 })).toBeNull()
    expect(deliveryOf(null)).toBeNull()
    expect(deliveryOf(row({}))).toBeNull()
  })

  it('maps each state to a key, tone and icon', () => {
    for (const state of ['none', 'manual', 'queued', 'sent', 'delivered', 'read', 'failed', 'opted_out', 'no_phone']) {
      const view = deliveryOf(row({ state }))
      expect(view.key).toBe(state)
      expect(view.tone).toBeTruthy()
      expect(view.icon).toBeTruthy()
    }
  })

  it('shows no phone for an unsent family without number, and opt-out over everything', () => {
    expect(deliveryOf(row({ state: 'none' }, { phone: null })).key).toBe('no_phone')
    expect(deliveryOf(row({ state: 'read' }, { whatsappOptedOut: true })).key).toBe('opted_out')
  })

  it('builds the retry message of a failure, and takes the date from the message or the manual share', () => {
    const view = deliveryOf(row({ state: 'failed', lastMessageId: 5, lastAt: '2026-11-18T10:00:00Z', errorCode: '131026', errorMessage: 'x' }))
    expect(view.message).toEqual({ id: 5, status: 'failed', errorCode: '131026', errorMessage: 'x' })
    expect(view.at).toBe('2026-11-18T10:00:00Z')
    expect(deliveryOf(row({ state: 'failed', lastMessageId: 5 })).message).toMatchObject({ errorCode: null, errorMessage: null })
    expect(deliveryOf(row({ state: 'manual', sharedAt: '2026-11-17T09:00:00Z' })).at).toBe('2026-11-17T09:00:00Z')
    expect(deliveryOf(row({ state: 'none' })).at).toBeNull()
    expect(deliveryOf(row({ state: 'sent' })).message).toBeNull()
  })
})

describe('deliveryChips', () => {
  const counts = { ...noDeliveryCounts(), unsent: 4, queued: 1, sent: 2, delivered: 3, read: 1, failed: 1, shared: 2 }

  it('has the three filters the API takes', () => {
    expect(DELIVERY_FILTERS).toEqual(['unsent', 'sent', 'problem'])
  })

  it('gathers everything that left the organizer in "sent" in automatic mode', () => {
    expect(deliveryChips(counts, { automatic: true })).toEqual([
      { value: 'unsent', key: 'unsent', count: 4 },
      { value: 'sent', key: 'sent', count: 9 },
      { value: 'problem', key: 'problem', count: 1 }
    ])
  })

  it('calls them "opened" in manual mode and hides the problem chip while nothing failed', () => {
    expect(deliveryChips({ unsent: 2, shared: 3 }, { automatic: false })).toEqual([
      { value: 'unsent', key: 'unsent', count: 2 },
      { value: 'sent', key: 'opened', count: 3 }
    ])
    expect(deliveryChips({ failed: 1 }, { automatic: false }).map(c => c.value)).toContain('problem')
  })
})
