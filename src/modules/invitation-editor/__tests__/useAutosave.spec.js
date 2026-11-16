import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { useAutosave } from '../composables/useAutosave'
import { fieldErrorsFrom } from '../utils/editorFields'

const http = (status, data = {}) => Object.assign(new Error(`http ${status}`), { response: { status, data } })

function setup(options) {
  let api
  const app = createApp(defineComponent({ setup() { api = useAutosave(options); return () => h('div') } }))
  app.mount(document.createElement('div'))
  return { api, app }
}

describe('useAutosave', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('waits for the typing to stop and sends the last value once', async () => {
    const save = vi.fn().mockResolvedValue({ savedAt: 'now' })
    const { api } = setup({ save })
    api.queue('t', { es: 'a' })
    api.queue('t', { es: 'ab' })
    expect(api.status.value).toBe('saving')
    await vi.advanceTimersByTimeAsync(599)
    expect(save).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(2)
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({ t: { es: 'ab' } })
    expect(api.status.value).toBe('saved')
    expect(api.fieldState.t).toBe('saved')
  })

  it('sends choices at once and edits made in flight go in the next request', async () => {
    let release
    const save = vi.fn().mockImplementationOnce(() => new Promise(r => (release = r))).mockResolvedValue({})
    const { api } = setup({ save })
    api.queue('c', 'a', { immediate: true })
    await vi.advanceTimersByTimeAsync(1)
    expect(save).toHaveBeenCalledTimes(1)
    api.queue('c', 'b', { immediate: true })
    expect(api.isDirty('c')).toBe(true)
    release({})
    await vi.advanceTimersByTimeAsync(5)
    expect(save).toHaveBeenLastCalledWith({ c: 'b' })
    await vi.advanceTimersByTimeAsync(5)
    expect(api.isDirty('c')).toBe(false)
  })

  it('keeps the changes and retries after a network error', async () => {
    const save = vi.fn().mockRejectedValueOnce(Object.assign(new Error('Network Error'), {})).mockResolvedValue({})
    const { api } = setup({ save, retryDelays: [1000] })
    api.queue('c', 'a', { immediate: true })
    await vi.advanceTimersByTimeAsync(5)
    expect(api.status.value).toBe('offline')
    expect(api.hasPending.value).toBe(true)
    await vi.advanceTimersByTimeAsync(1000)
    expect(save).toHaveBeenCalledTimes(2)
    expect(api.status.value).toBe('saved')
    expect(api.hasPending.value).toBe(false)
  })

  it('gives up after the last delay and tries again by hand', async () => {
    const save = vi.fn().mockRejectedValue(http(500))
    const { api } = setup({ save, retryDelays: [100] })
    api.queue('c', 'a', { immediate: true })
    await vi.advanceTimersByTimeAsync(300)
    expect(api.status.value).toBe('error')
    expect(save).toHaveBeenCalledTimes(2)
    save.mockResolvedValue({})
    await api.retryNow()
    expect(api.status.value).toBe('saved')
  })

  it('reports a 422 by field, does not retry it and resends the others', async () => {
    const save = vi.fn()
      .mockRejectedValueOnce(http(422, { errors: { 'fields.color': ['invalid_color'] } }))
      .mockResolvedValue({})
    const onRejected = vi.fn()
    const { api } = setup({ save, onRejected, errorsFrom: fieldErrorsFrom, fieldIds: () => ['color', 'toggle'] })
    api.queue('color', '#zz', { immediate: true })
    api.queue('toggle', true, { immediate: true })
    await vi.advanceTimersByTimeAsync(10)
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({ toggle: true })
    expect(onRejected).toHaveBeenCalledWith({ color: { code: 'invalid_color' } }, expect.anything())
    expect(api.fieldState.color).toBe('error')
    expect(api.fieldState.toggle).toBe('saved')
    expect(api.isDirty('color')).toBe(false)
  })

  it('reports plan_required and template_locked without retrying', async () => {
    const onPlanRequired = vi.fn()
    const onTemplateLocked = vi.fn()
    const save = vi.fn()
      .mockRejectedValueOnce(http(403, { code: 'plan_required' }))
      .mockRejectedValueOnce(http(409, { code: 'template_locked' }))
    const { api } = setup({ save, onPlanRequired, onTemplateLocked })
    api.queue('p', '#fff', { immediate: true })
    await vi.advanceTimersByTimeAsync(10)
    expect(onPlanRequired).toHaveBeenCalledWith(['p'], expect.anything())
    api.queue('x', 1, { immediate: true })
    await vi.advanceTimersByTimeAsync(10)
    expect(onTemplateLocked).toHaveBeenCalled()
    expect(save).toHaveBeenCalledTimes(2)
  })
})
