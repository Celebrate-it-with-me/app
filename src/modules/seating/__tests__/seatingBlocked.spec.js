import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({ toast: vi.fn(), createTable: vi.fn() }))
vi.mock('@/ui', () => ({ useToast: () => ({ toast: mocks.toast }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: k => k }) }))
vi.mock('@/modules/seating/composables/useMediaQuery', () => ({ useMediaQuery: () => ({ value: true }) }))
vi.mock('@/modules/seating/stores/useSeatingStore', () => ({
  useSeatingStore: () => ({ tables: [], unassigned: [], selectedTable: null, refresh: vi.fn(), createTable: mocks.createTable })
}))

import { useSeatingController } from '../composables/useSeatingController'

const apiError = (status, data) => Object.assign(new Error('x'), { response: { status, data } })
const form = { name: 'Mesa 1', capacity: 8, type: 'general' }

describe('seating first table refused by the template', () => {
  beforeEach(() => {
    mocks.toast.mockReset()
    mocks.createTable.mockReset()
  })
  it('keeps the form open and exposes the 409 data, without an error toast', async () => {
    mocks.createTable.mockRejectedValue(apiError(409, { code: 'template_missing_module', module: 'seating', template: { slug: 'm', name: 'Mínima' } }))
    const c = useSeatingController()
    await flushPromises()
    c.openCreate()
    await c.saveTable(form)
    expect(c.blocked.value).toEqual({ module: 'seating', templateName: 'Mínima' })
    expect(c.showFormModal.value).toBe(true)
    expect(mocks.toast).not.toHaveBeenCalled()
  })
  it('other failures keep the toast and no notice; a later success clears the notice', async () => {
    mocks.createTable.mockRejectedValueOnce(apiError(500, {}))
    const c = useSeatingController()
    await flushPromises()
    c.openCreate()
    await c.saveTable(form)
    expect(c.blocked.value).toBeNull()
    expect(mocks.toast).toHaveBeenCalled()
    c.blocked.value = { module: 'seating', templateName: 'x' }
    mocks.createTable.mockResolvedValueOnce({ name: 'Mesa 1' })
    await c.saveTable(form)
    expect(c.blocked.value).toBeNull()
    expect(c.showFormModal.value).toBe(false)
  })
})
