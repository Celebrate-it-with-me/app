import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const api = vi.hoisted(() => ({ summary: vi.fn(), items: vi.fn() }))
vi.mock('../../services/BudgetService', () => ({ default: api }))

import { useBudgetStore } from '../useBudgetStore'

const A = { summary: { cap: 18000, totals: { paid: 12030 } }, items: [{ id: 1, title: 'Banquete' }] }
const B = { summary: { cap: null, totals: { paid: 0 } }, items: [] }

beforeEach(() => {
  setActivePinia(createPinia())
  api.summary.mockReset()
  api.items.mockReset()
})

describe('useBudgetStore', () => {
  it('reads an event and remembers whose budget it holds', async () => {
    api.summary.mockResolvedValue(A.summary)
    api.items.mockResolvedValue(A.items)
    const store = useBudgetStore()
    await store.fetch(1)
    expect(store.summary).toEqual(A.summary)
    expect(store.eventId).toBe(1)
  })

  it('clears event A before reading event B: no amount of A while B loads', async () => {
    api.summary.mockResolvedValueOnce(A.summary)
    api.items.mockResolvedValueOnce(A.items)
    const store = useBudgetStore()
    await store.fetch(1)
    let resolve
    api.summary.mockReturnValueOnce(new Promise(r => (resolve = r)))
    api.items.mockResolvedValueOnce(B.items)
    const pending = store.fetch(2)
    expect(store.summary).toBeNull()
    expect(store.items).toEqual([])
    resolve(B.summary)
    await pending
    expect(store.summary).toEqual(B.summary)
  })

  it('a failed read (a 403 for a viewer of B) leaves nothing on screen and rethrows', async () => {
    api.summary.mockResolvedValueOnce(A.summary)
    api.items.mockResolvedValueOnce(A.items)
    const store = useBudgetStore()
    await store.fetch(1)
    api.summary.mockRejectedValueOnce({ response: { status: 403 } })
    api.items.mockResolvedValueOnce([])
    await expect(store.fetch(1)).rejects.toEqual({ response: { status: 403 } })
    expect(store.summary).toBeNull()
    expect(store.items).toEqual([])
    expect(store.eventId).toBeNull()
  })

  it('drops a late answer of the previous event', async () => {
    let resolveA
    api.summary.mockReturnValueOnce(new Promise(r => (resolveA = r)))
    api.items.mockResolvedValueOnce(A.items)
    api.summary.mockResolvedValueOnce(B.summary)
    api.items.mockResolvedValueOnce(B.items)
    const store = useBudgetStore()
    const first = store.fetch(1)
    await store.fetch(2)
    resolveA(A.summary)
    await first
    expect(store.summary).toEqual(B.summary)
    expect(store.eventId).toBe(2)
  })

  it('fetchSummary follows the same rules', async () => {
    api.summary.mockResolvedValueOnce(A.summary)
    const store = useBudgetStore()
    await store.fetchSummary(1)
    expect(store.summary).toEqual(A.summary)
    api.summary.mockRejectedValueOnce(new Error('500'))
    await expect(store.fetchSummary(2)).rejects.toThrow('500')
    expect(store.summary).toBeNull()
  })
})
