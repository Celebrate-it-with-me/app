import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const http = vi.hoisted(() => ({ put: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: http }))

import PadrinosService from '../services/PadrinosService'

describe('PadrinosService.setCommitments', () => {
  beforeEach(() => http.put.mockReset())
  afterEach(() => localStorage.clear())

  it('sends the commitments (with resolutions) and returns data with warnings', async () => {
    http.put.mockResolvedValue({ data: { data: { id: 9 }, warnings: [{ code: 'commitments_exceed_cost', budgetItemId: 1 }] } })
    const sent = [{ budgetItemId: 1, amount: 500, resolution: 'additional' }]
    expect(await PadrinosService.setCommitments(7, 9, sent)).toEqual({ data: { id: 9 }, warnings: [{ code: 'commitments_exceed_cost', budgetItemId: 1 }] })
    expect(http.put).toHaveBeenCalledWith('/event/7/padrinos/9/commitments', { commitments: sent })
  })

  it('treats a response without warnings as an empty list', async () => {
    http.put.mockResolvedValue({ data: { data: { id: 9 } } })
    expect((await PadrinosService.setCommitments(7, 9, [])).warnings).toEqual([])
  })

  it('answers from the development mock, never touching the API, when the switch is on', async () => {
    localStorage.setItem('cwm.mockPadrinoCommitments', '1')
    await expect(PadrinosService.setCommitments(7, 9, [{ budgetItemId: 1, amount: 10 }])).rejects.toMatchObject({ response: { status: 409 } })
    expect((await PadrinosService.setCommitments(7, 9, [{ budgetItemId: 1, amount: 10, resolution: 'attribute_payments' }])).warnings).toEqual([])
    expect(http.put).not.toHaveBeenCalled()
  })
})
