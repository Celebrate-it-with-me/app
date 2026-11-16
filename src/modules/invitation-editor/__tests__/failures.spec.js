import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { useAutosave } from '../composables/useAutosave'
import { classify, FAILURE_CODES, previewOverrides } from '../utils/editorFields'

const http = (status, data = {}) => Object.assign(new Error(`http ${status}`), { response: { status, data } })

describe('classify', () => {
  it.each([
    [http(422, { errors: { status: ['event_archived'] } }), 'archived'],
    [http(422, { errors: { 'fields.cover_text.es': ['too_long'] } }), 'validation'],
    [http(403, {}), 'forbidden'],
    [http(403, { code: 'plan_required' }), 'plan'],
    [http(404, { code: 'field_not_found' }), 'notfound'],
    [http(409, { code: 'package_no_cover_field' }), 'nocover'],
    [http(409, { code: 'template_locked' }), 'locked'],
    [http(500), 'server'],
    [Object.assign(new Error('offline'), {}), 'network']
  ])('reads %#', (error, kind) => expect(classify(error)).toBe(kind))

  it('has an i18n code for every failure that is not a field error', () => {
    expect(Object.keys(FAILURE_CODES).sort()).toEqual(['archived', 'forbidden', 'nocover', 'notfound'])
  })
})

describe('useAutosave with failures that are not about a field', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it.each([
    [http(422, { errors: { status: ['event_archived'] } }), 'archived'],
    [http(404, { code: 'field_not_found' }), 'notfound'],
    [http(409, { code: 'package_no_cover_field' }), 'nocover'],
    [http(403, {}), 'forbidden']
  ])('reports %# once, without retrying', async (error, kind) => {
    const save = vi.fn().mockRejectedValue(error)
    const onFailed = vi.fn()
    let api
    createApp(defineComponent({ setup() { api = useAutosave({ save, onFailed }); return () => h('div') } })).mount(document.createElement('div'))
    api.queue('cover_text', { es: 'a', en: 'a' }, { immediate: true })
    await vi.advanceTimersByTimeAsync(20000)
    expect(save).toHaveBeenCalledTimes(1)
    expect(onFailed).toHaveBeenCalledWith(kind, ['cover_text'], error)
    expect(api.status.value).toBe('error')
    expect(api.isDirty('cover_text')).toBe(false)
  })
})

describe('previewOverrides', () => {
  const f = (over) => ({ type: 'text', locked: false, isDefault: false, ...over })
  it('sends only edited, unlocked, valid fields and never photos', () => {
    const fields = [
      f({ id: 'a', value: { es: ' Hola ', en: 'Hi' } }),
      f({ id: 'same', isDefault: true, value: { es: 'x', en: 'x' } }),
      f({ id: 'locked', locked: true, type: 'color', value: '#fff' }),
      f({ id: 'photo', type: 'image', value: { url: 'x' } }),
      f({ id: 'bad', type: 'color', value: 'nope' }),
      f({ id: 'err', type: 'toggle', value: true }),
      f({ id: 'ok', type: 'choice', choices: [{ value: 'b' }], value: 'b' })
    ]
    expect(previewOverrides(fields, { err: { code: 'invalid_type' } })).toEqual({ a: { es: 'Hola', en: 'Hi' }, ok: 'b' })
  })
})
