import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import i18n from '@/locales/i18n'

const http = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() }))
vi.mock('@/services/axios', () => ({ CWM_API: http }))

import TemplatePickerService from '../services/TemplatePickerService'
import * as mock from '../services/templatePickerMock'
import { readImageSize, readTemplateReturn } from '../utils/templatePicker'
import CoverFocusPicker from '../components/CoverFocusPicker.vue'
import TemplatePreviewFrame from '../components/TemplatePreviewFrame.vue'
import ModuleTemplateNotice from '../components/ModuleTemplateNotice.vue'
import TemplatePickerSheet from '../components/TemplatePickerSheet.vue'

describe('TemplatePickerService (real API)', () => {
  beforeEach(() => Object.values(http).forEach(fn => fn.mockReset()))

  it('reads templates and impact from the invitation endpoints', async () => {
    http.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } }).mockResolvedValueOnce({ data: { data: { templateId: 3 } } })
    expect(await TemplatePickerService.templates(5)).toEqual([{ id: 1 }])
    expect(http.get).toHaveBeenCalledWith('/event/5/invitation/templates')
    expect(await TemplatePickerService.impact(5, 3)).toEqual({ templateId: 3 })
    expect(http.get).toHaveBeenLastCalledWith('/event/5/invitation/templates/3/impact')
  })

  it('applies a template and marks the undo only when asked', async () => {
    http.put.mockResolvedValue({ data: { data: { ok: true } } })
    expect(await TemplatePickerService.apply(5, 3)).toEqual({ ok: true })
    expect(http.put).toHaveBeenLastCalledWith('/event/5/invitation/template', { template_id: 3 })
    await TemplatePickerService.apply(5, 3, { undo: true })
    expect(http.put).toHaveBeenLastCalledWith('/event/5/invitation/template', { template_id: 3, undo: true })
  })

  it('sends only what the preview was given', async () => {
    http.post.mockResolvedValue({ data: { data: { sections: [] } } })
    await TemplatePickerService.preview(5)
    expect(http.post).toHaveBeenLastCalledWith('/event/5/invitation/preview', {})
    await TemplatePickerService.preview(5, { templateId: 0, locale: 'en', state: 'no_photo', preset: 'rosa', fields: { cover_text: 'x' } })
    expect(http.post).toHaveBeenLastCalledWith('/event/5/invitation/preview', { template_id: 0, fields: { cover_text: 'x' }, locale: 'en', state: 'no_photo', preset: 'rosa' })
    await TemplatePickerService.preview(5, { templateId: 2, fields: {} })
    expect(http.post).toHaveBeenLastCalledWith('/event/5/invitation/preview', { template_id: 2 })
  })

  it('uploads the cover as multipart with the focus when there is one', async () => {
    http.post.mockResolvedValue({ data: { data: { url: 'u' } } })
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
    expect(await TemplatePickerService.uploadCover(5, file, '40% 20%')).toEqual({ url: 'u' })
    const [url, body, config] = http.post.mock.calls[0]
    expect(url).toBe('/event/5/invitation/cover-photo')
    expect(body.get('photo')).toBeInstanceOf(File)
    expect(body.get('focus')).toBe('40% 20%')
    expect(config.headers['Content-Type']).toBe('multipart/form-data')
    await TemplatePickerService.uploadCover(5, file)
    expect(http.post.mock.calls[1][1].has('focus')).toBe(false)
  })

  it('removes the cover and saves only the focus through PATCH', async () => {
    http.delete.mockResolvedValue({})
    await expect(TemplatePickerService.removeCover(5)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/event/5/invitation/cover-photo')
    http.patch.mockResolvedValue({ data: { data: { savedAt: 'now' } } })
    expect(await TemplatePickerService.saveFocus(5, '10% 90%')).toEqual({ savedAt: 'now' })
    expect(http.patch).toHaveBeenCalledWith('/event/5/invitation', { fields: { cover_photo: { focus: '10% 90%' } } })
  })

  it('does not touch the mock outside development flags (no env flag set)', async () => {
    http.get.mockResolvedValue({ data: { data: [] } })
    await TemplatePickerService.templates(1)
    expect(http.get).toHaveBeenCalled()
  })
})

describe('templatePickerMock (dev stand-in of the contract)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })
  const run = async promise => {
    const settled = promise.then(v => ({ v }), e => ({ e }))
    await vi.runAllTimersAsync()
    return settled
  }
  const flag = value => localStorage.setItem('cwm.templatePickerMock', value)

  it('reads the flags from localStorage, trimmed', () => {
    flag('unlocked, photo')
    expect(mock.mockFlags()).toEqual(['unlocked', 'photo'])
  })

  it('lists the catalog with premium locked unless the plan is unlocked, and honours error and empty', async () => {
    flag('1')
    const locked = (await run(mock.templates(1))).v
    expect(locked.filter(t => t.locked).map(t => t.tier)).toEqual(['premium', 'premium'])
    expect(locked.find(t => t.current).id).toBe(1)
    flag('unlocked')
    expect((await run(mock.templates(1))).v.some(t => t.locked)).toBe(false)
    flag('missingcurrent')
    expect((await run(mock.templates(1))).v.find(t => t.id === 1).missingModules).toEqual(['comments', 'seating'])
    flag('error')
    expect((await run(mock.templates(1))).e.response.status).toBe(500)
    flag('empty')
    expect((await run(mock.templates(1))).v).toEqual([])
  })

  it('answers the impact, the 404 and the 500', async () => {
    flag('published')
    const impact = (await run(mock.impact(1, 3))).v
    expect(impact).toMatchObject({ templateId: 3, changesPublishedLook: true })
    expect(impact.resets[0].kind).toBe('preset')
    flag('1')
    expect((await run(mock.impact(1, 1))).v.resets).toEqual([{ kind: 'options', count: 1 }])
    expect((await run(mock.impact(1, 99))).e.response.data.code).toBe('template_not_found')
    flag('impacterror')
    expect((await run(mock.impact(1, 1))).e.response.status).toBe(500)
  })

  it('applies a template and remembers the previous one for undo, with the refusals of each flag', async () => {
    flag('published')
    expect((await run(mock.apply(1, { template_id: 2 }))).e.response.data.code).toBe('template_locked')
    flag('gone')
    expect((await run(mock.apply(1, { template_id: 2 }))).e.response.data.code).toBe('template_not_available')
    flag('1')
    expect((await run(mock.apply(1, { template_id: 3 }))).e.response.data.code).toBe('plan_required')
    flag('unlocked,noplan')
    expect((await run(mock.apply(1, { template_id: 3 }))).e.response.data.code).toBe('plan_required')
    expect((await run(mock.apply(1, { template_id: 99 }))).e.response.data.code).toBe('template_not_found')
    flag('unlocked')
    const applied = (await run(mock.apply(1, { template_id: 2 }))).v
    expect(applied.template.slug).toBe('sage-roses')
    expect(applied.undo.templateId).toBe(1)
    expect((await run(mock.templates(1))).v.find(t => t.current).id).toBe(2)
    expect((await run(mock.impact(1, 1))).v.restoresFromStash).toBe(false)
    expect((await run(mock.impact(1, 2))).v.restoresFromStash).toBe(false)
    await run(mock.apply(1, { template_id: 1 }))
  })

  it('renders previews per stage and locale, with and without the cover photo', async () => {
    flag('photo')
    const withPhoto = (await run(mock.preview(1, { template_id: 1, locale: 'en' }))).v
    expect(withPhoto.sections[0].title).toBe('Celebrate with me')
    expect(withPhoto.sections[0].data.image).toBeTruthy()
    expect((await run(mock.preview(1, { locale: 'fr', state: 'no_photo' }))).v.sections[0].data.image).toBeNull()
    const std = (await run(mock.preview(1, { template_id: 1, state: 'save_the_date' }))).v
    expect(std.stage).toBe('save_the_date')
    expect(std.sections[0].data.image).toBeNull()
    expect((await run(mock.preview(1, { template_id: 99 }))).e.response.status).toBe(404)
    flag('gone')
    expect((await run(mock.preview(1, { template_id: 2 }))).e.response.data.code).toBe('template_not_available')
  })

  it('uploads, refocuses and removes the cover, with the refusal flags', async () => {
    flag('nocover')
    expect((await run(mock.uploadCover(1, new File(['x'], 'a.jpg')))).e.response.data.code).toBe('package_no_cover_field')
    flag('cover:too_large')
    expect((await run(mock.uploadCover(1, new File(['x'], 'a.jpg')))).e.response.data.errors.photo).toEqual(['too_large'])
    flag('1')
    const up = (await run(mock.uploadCover(1, new File(['abc'], 'a.jpg'), '10% 10%'))).v
    expect(up).toMatchObject({ focus: '10% 10%', bytes: 3 })
    expect((await run(mock.uploadCover(1, undefined))).v.focus).toBe('50% 50%')
    const saved = (await run(mock.saveFocus(1, '70% 30%'))).v
    expect(saved.fields[0].value.focus).toBe('70% 30%')
    expect(mock.coverField().value.focus).toBe('70% 30%')
    await run(mock.removeCover())
    expect(mock.coverField()).toMatchObject({ value: null, isDefault: true })
    expect((await run(mock.saveFocus(1, '1% 1%'))).v.fields[0].value).toBeNull()
    flag('photo')
    expect(mock.coverField().value).toBeNull()
  })
})

describe('template return and image size helpers', () => {
  it('readTemplateReturn answers null for broken storage', () => {
    sessionStorage.setItem('qv.templateReturn', '{not json')
    expect(readTemplateReturn(5)).toBeNull()
    sessionStorage.clear()
  })

  describe('readImageSize', () => {
    const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL, Image: globalThis.Image }
    afterEach(() => {
      URL.createObjectURL = original.create
      URL.revokeObjectURL = original.revoke
      globalThis.Image = original.Image
    })
    const fakeImage = outcome =>
      class {
        set src(_) {
          queueMicrotask(() => (outcome === 'ok' ? ((this.naturalWidth = 1440), (this.naturalHeight = 1800), this.onload()) : this.onerror()))
        }
      }

    it('resolves the natural size and frees the object URL', async () => {
      URL.createObjectURL = vi.fn(() => 'blob:x')
      URL.revokeObjectURL = vi.fn()
      globalThis.Image = fakeImage('ok')
      expect(await readImageSize(new File(['x'], 'a.jpg'))).toEqual({ width: 1440, height: 1800 })
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
    })

    it('resolves null when the browser cannot decode it', async () => {
      URL.createObjectURL = vi.fn(() => 'blob:y')
      URL.revokeObjectURL = vi.fn()
      globalThis.Image = fakeImage('bad')
      expect(await readImageSize(new File(['x'], 'a.jpg'))).toBeNull()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:y')
    })
  })
})

describe('CoverFocusPicker', () => {
  let w
  beforeEach(() => (i18n.global.locale.value = 'es'))
  afterEach(() => w?.unmount())
  const mountPicker = (props = {}) => {
    w = mount(CoverFocusPicker, { props: { src: '/a.webp', modelValue: '50% 50%', ...props }, global: { plugins: [i18n] }, attachTo: document.body })
    return w
  }
  const fire = (el, type, init = {}) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init })
    if (init.pointerId != null) Object.defineProperty(event, 'pointerId', { value: init.pointerId })
    el.dispatchEvent(event)
    return flushPromises()
  }
  const rectOf = el => (el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }))

  it('moves the focus with a tap and keeps following the pointer only while dragging', async () => {
    mountPicker()
    const slider = w.get('[role=slider]')
    rectOf(slider.element)
    await fire(slider.element, 'pointermove', { clientX: 10, clientY: 10 })
    expect(w.emitted('update:modelValue')).toBeUndefined()
    await fire(slider.element, 'pointerdown', { clientX: 100, clientY: 25 })
    expect(w.emitted('update:modelValue')[0]).toEqual(['50% 25%'])
    await fire(slider.element, 'pointermove', { clientX: 200, clientY: 100 })
    expect(w.emitted('update:modelValue')[1]).toEqual(['100% 100%'])
    await fire(slider.element, 'pointerup')
    await fire(slider.element, 'pointermove', { clientX: 0, clientY: 0 })
    expect(w.emitted('update:modelValue')).toHaveLength(2)
    await fire(slider.element, 'pointerdown', { clientX: 0, clientY: 0 })
    await fire(slider.element, 'pointercancel')
    await fire(slider.element, 'pointermove', { clientX: 100, clientY: 50 })
    expect(w.emitted('update:modelValue')).toHaveLength(3)
  })

  it('moves with the arrows (shift for fine steps) and ignores other keys', async () => {
    mountPicker({ modelValue: '40% 60%' })
    const slider = w.get('[role=slider]')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    await slider.trigger('keydown', { key: 'ArrowUp', shiftKey: true })
    await slider.trigger('keydown', { key: 'a' })
    expect(w.emitted('update:modelValue')).toEqual([['45% 60%'], ['40% 59%']])
    expect(slider.attributes('aria-valuenow')).toBe('40')
  })

  it('reads the natural size from the loaded image when the API did not give it, and uses the given size otherwise', async () => {
    mountPicker()
    const style = () => w.get('[role=slider]').attributes('style')
    expect(style()).toContain('aspect-ratio: 0.8')
    const img = w.get('img')
    Object.defineProperty(img.element, 'naturalWidth', { value: 2000 })
    Object.defineProperty(img.element, 'naturalHeight', { value: 1000 })
    await img.trigger('load')
    expect(style()).toContain('aspect-ratio: 2')
    w.unmount()
    mountPicker({ width: 1000, height: 500 })
    expect(style()).toContain('aspect-ratio: 2')
  })

  it('captures the pointer on press when the browser supports it', async () => {
    mountPicker()
    const slider = w.get('[role=slider]')
    rectOf(slider.element)
    slider.element.setPointerCapture = vi.fn()
    await fire(slider.element, 'pointerdown', { clientX: 10, clientY: 10, pointerId: 3 })
    expect(slider.element.setPointerCapture).toHaveBeenCalledWith(3)
  })
})

describe('TemplatePreviewFrame', () => {
  let w
  afterEach(() => w?.unmount())
  const payload = { sections: [{ type: 'cover' }] }
  const mountFrame = props => {
    w = mount(TemplatePreviewFrame, { props: { title: 'Vista', payload: null, ...props }, attachTo: document.body })
    return w
  }
  const ready = (source, origin = window.location.origin, type = 'qv-preview-ready') => {
    window.dispatchEvent(new MessageEvent('message', { data: { type }, origin, source }))
    return flushPromises()
  }

  it('hands the payload to its own iframe only after the iframe says it is ready, and on every change', async () => {
    mountFrame({ payload })
    const post = vi.fn()
    Object.defineProperty(w.get('iframe').element, 'contentWindow', { value: { postMessage: post }, configurable: true })
    await w.setProps({ payload: { sections: [] } })
    expect(post).not.toHaveBeenCalled()
    await ready(w.get('iframe').element.contentWindow)
    expect(post).toHaveBeenCalledWith({ type: 'qv-preview', payload: { sections: [] } }, window.location.origin)
    await w.setProps({ payload })
    expect(post).toHaveBeenLastCalledWith({ type: 'qv-preview', payload }, window.location.origin)
    expect(w.get('iframe').attributes('title')).toBe('Vista')
  })

  it('ignores other origins, other windows and other messages', async () => {
    mountFrame({ payload })
    const post = vi.fn()
    const own = { postMessage: post }
    Object.defineProperty(w.get('iframe').element, 'contentWindow', { value: own, configurable: true })
    await ready(own, 'https://evil.test')
    await ready({ postMessage: vi.fn() })
    await ready(own, window.location.origin, 'something-else')
    expect(post).not.toHaveBeenCalled()
  })

  it('has nothing to send without a payload, and stops listening when unmounted', async () => {
    mountFrame({ payload: null })
    const post = vi.fn()
    const own = { postMessage: post }
    Object.defineProperty(w.get('iframe').element, 'contentWindow', { value: own, configurable: true })
    await ready(own)
    expect(post).not.toHaveBeenCalled()
    await w.setProps({ payload })
    expect(post).toHaveBeenCalledTimes(1)
    w.unmount()
    await ready(own)
    expect(post).toHaveBeenCalledTimes(1)
  })
})

describe('ModuleTemplateNotice wording', () => {
  let w
  beforeEach(() => (i18n.global.locale.value = 'es'))
  afterEach(() => {
    w?.unmount()
    document.body.innerHTML = ''
  })
  const mountNotice = props => {
    w = mount(ModuleTemplateNotice, { props: { eventId: 5, module: 'seating', ...props }, global: { plugins: [i18n, createPinia()] }, attachTo: document.body })
    return w
  }

  it('names the template when the 409 gave it and falls back to a generic sentence otherwise', () => {
    expect(mountNotice({ templateName: 'Mínima' }).text()).toContain('Mínima')
    w.unmount()
    const generic = mountNotice().text()
    expect(generic).not.toContain('Mínima')
    expect(generic.length).toBeGreaterThan(20)
  })

  it('passes up what the selector reports when the template changed', () => {
    mountNotice()
    w.findComponent(TemplatePickerSheet).vm.$emit('changed', { id: 1 }, { id: 2 }, { until: 'x' })
    expect(w.emitted('changed')[0]).toEqual([{ id: 1 }, { id: 2 }, { until: 'x' }])
  })

  it('shows an unknown module slug as it came', () => {
    expect(mountNotice({ module: 'nonexistent' }).text()).toContain('nonexistent')
  })
})
