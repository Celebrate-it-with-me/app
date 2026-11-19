import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'

const { getAccess, verifyAccess } = vi.hoisted(() => ({ getAccess: vi.fn(), verifyAccess: vi.fn() }))
vi.mock('@/services/PublicEvents/InvitationService', () => ({ default: { getAccess, verifyAccess } }))

import i18n from '@/locales/i18n'
import { normalizeCode, useInvitationAccess } from '../composables/useInvitationAccess'
import { mockAccess } from '../dev/mockAccess'
import InvitationAccessView from '../views/InvitationAccessView.vue'

const t = (key, params) => i18n.global.t(`invitationAccess.${key}`, params)
const accessOf = name => ({ data: { data: { organizer_name: name } } })
const http = status => ({ response: { status, data: {} } })

async function mountAt(url) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/i/:slug', name: 'invitation-access', component: InvitationAccessView },
      { path: '/i/:slug/:code', name: 'invitation', component: { template: '<p>invitation</p>' } },
      { path: '/sign-in', component: { template: '<p>sign-in</p>' } }
    ]
  })
  router.push(url)
  await router.isReady()
  const wrapper = mount(InvitationAccessView, { global: { plugins: [router, i18n] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  getAccess.mockReset().mockResolvedValue(accessOf('Marisol'))
  verifyAccess.mockReset()
  document.head.querySelectorAll('meta[name="robots"]').forEach(node => node.remove())
})

describe('normalizeCode', () => {
  it('removes spaces and uppercases', () => {
    expect(normalizeCode(' va l001\n')).toBe('VAL001')
    expect(normalizeCode(null)).toBe('')
  })
})

describe('useInvitationAccess', () => {
  const make = (options = {}) => useInvitationAccess(() => 'xv', { api: { getAccess, verifyAccess }, ...options })

  it('loads the organizer name, or null when there is none', async () => {
    const a = make()
    expect(a.status.value).toBe('loading')
    await a.load()
    expect(a.status.value).toBe('ready')
    expect(a.organizer.value).toBe('Marisol')
    expect(a.hasOrganizer.value).toBe(true)
    getAccess.mockResolvedValue({ data: {} })
    await a.load()
    expect(a.organizer.value).toBeNull()
  })

  it('goes to error when the request fails and ignores a stale answer', async () => {
    getAccess.mockRejectedValueOnce(new Error('x'))
    const a = make()
    await a.load()
    expect(a.status.value).toBe('error')

    let release
    getAccess.mockImplementationOnce(() => new Promise(resolve => (release = resolve)))
    getAccess.mockResolvedValueOnce(accessOf('Lucia'))
    const first = a.load()
    await a.load()
    release(accessOf('Old'))
    await first
    expect(a.organizer.value).toBe('Lucia')

    getAccess.mockImplementationOnce(() => new Promise((_, reject) => (release = reject)))
    getAccess.mockResolvedValueOnce(accessOf('Lucia'))
    const failing = a.load()
    await a.load()
    release(new Error('late'))
    await failing
    expect(a.status.value).toBe('ready')
  })

  it('keeps the code and the invalid error that came with the redirect', () => {
    const a = make({ initialCode: 'abc 1', initialError: 'invalid' })
    expect(a.code.value).toBe('ABC1')
    expect(a.error.value).toBe('invalid')
    expect(make({ initialError: 'invalid' }).error.value).toBe('')
    expect(make({ initialCode: 'x', initialError: 'whatever' }).error.value).toBe('')
  })

  it('clears the error when the code changes', () => {
    const a = make({ initialCode: 'x', initialError: 'invalid' })
    a.setCode('val 1')
    expect(a.code.value).toBe('VAL1')
    expect(a.error.value).toBe('')
    a.setCode('v')
  })

  it('does not call the API with an empty code', async () => {
    const a = make()
    await a.submit()
    expect(a.error.value).toBe('empty')
    expect(verifyAccess).not.toHaveBeenCalled()
  })

  it('calls onValid with the code the API returns', async () => {
    const onValid = vi.fn()
    verifyAccess.mockResolvedValue({ data: { data: { valid: true, code: 'VAL001' } } })
    const a = make({ onValid })
    a.setCode('val001')
    await a.submit()
    expect(verifyAccess).toHaveBeenCalledWith('xv', 'VAL001')
    expect(onValid).toHaveBeenCalledWith('VAL001')
    expect(a.submitting.value).toBe(false)
  })

  it('maps 422, 429, any other failure and a 200 without valid to an error', async () => {
    const a = make()
    a.setCode('zzz')
    for (const [reply, expected] of [
      [Promise.reject(http(422)), 'invalid'],
      [Promise.reject(http(429)), 'limited'],
      [Promise.reject(http(500)), 'failed'],
      [Promise.reject(new Error('net')), 'failed'],
      [Promise.resolve({ data: { data: { valid: false } } }), 'invalid'],
      [Promise.resolve({}), 'invalid']
    ]) {
      verifyAccess.mockReturnValueOnce(reply)
      await a.submit()
      expect(a.error.value).toBe(expected)
    }
  })

  it('ignores a second submit while one is running', async () => {
    let release
    verifyAccess.mockImplementation(() => new Promise(resolve => (release = resolve)))
    const a = make()
    a.setCode('a')
    const running = a.submit()
    await a.submit()
    expect(verifyAccess).toHaveBeenCalledTimes(1)
    release({ data: { data: { valid: true, code: 'A' } } })
    await running
  })
})

describe('mockAccess', () => {
  it('serves every scenario', async () => {
    expect((await mockAccess().getAccess()).data.data.organizer_name).toBe('Marisol')
    expect((await mockAccess('anonymous').getAccess()).data.data.organizer_name).toBeNull()
    await expect(mockAccess('offline').getAccess()).rejects.toBeTruthy()
    let settled = false
    mockAccess('slow').getAccess().then(() => (settled = true))
    await Promise.resolve()
    expect(settled).toBe(false)
    expect((await mockAccess().verifyAccess('s', 'val001')).data.data).toEqual({ valid: true, code: 'VAL001' })
    await expect(mockAccess().verifyAccess('s', 'nope')).rejects.toMatchObject({ response: { status: 422 } })
    await expect(mockAccess('limited').verifyAccess('s', 'VAL001')).rejects.toMatchObject({ response: { status: 429 } })
  })
})

describe('InvitationAccessView', () => {
  it('shows the form, the organizer name, focus on the code and no index', async () => {
    const { wrapper } = await mountAt('/i/xv')
    expect(wrapper.get('h1').text()).toBe(t('title'))
    expect(wrapper.get('label').text()).toContain(t('label'))
    expect(wrapper.text()).toContain('Marisol')
    expect(wrapper.text()).toContain(t('contact', { name: 'Marisol' }))
    expect(wrapper.html()).not.toMatch(/@|mailto:/)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    expect(document.head.querySelector('meta[name="robots"]').content).toContain('noindex')
    expect(wrapper.get('a[href="/sign-in"]').text()).toBe(t('signIn'))
    wrapper.unmount()
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })

  it('shows a skeleton while loading', async () => {
    getAccess.mockReturnValue(new Promise(() => {}))
    const { wrapper } = await mountAt('/i/xv')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows the generic text without a name', async () => {
    getAccess.mockResolvedValue(accessOf(null))
    const { wrapper } = await mountAt('/i/xv')
    expect(wrapper.text()).toContain(t('contactGeneric'))
    wrapper.unmount()
  })

  it('shows a retry when the network fails', async () => {
    getAccess.mockRejectedValueOnce(new Error('net'))
    const { wrapper } = await mountAt('/i/xv')
    expect(wrapper.text()).toContain(t('contactFailed'))
    await wrapper.get('button.text-rose-600, button:not([type="submit"])').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(t('contact', { name: 'Marisol' }))
    wrapper.unmount()
  })

  it('uppercases what is typed and goes to the invitation on Enter', async () => {
    verifyAccess.mockResolvedValue({ data: { data: { valid: true, code: 'VAL001' } } })
    const { wrapper, router } = await mountAt('/i/xv')
    await wrapper.get('input').setValue('val 001')
    expect(wrapper.get('input').element.value).toBe('VAL001')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(verifyAccess).toHaveBeenCalledWith('xv', 'VAL001')
    expect(router.currentRoute.value.fullPath).toBe('/i/xv/VAL001')
    wrapper.unmount()
  })

  it.each([
    [422, 'errorInvalid', { name: 'Marisol' }],
    [429, 'errorLimited', undefined],
    [500, 'errorFailed', undefined]
  ])('shows the message for a %i answer', async (status, key, params) => {
    verifyAccess.mockRejectedValue(http(status))
    const { wrapper } = await mountAt('/i/xv')
    await wrapper.get('input').setValue('bad')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe(t(key, params))
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    wrapper.unmount()
  })

  it('uses the generic invalid text without a name and asks for a code when empty', async () => {
    getAccess.mockResolvedValue(accessOf(null))
    verifyAccess.mockRejectedValue(http(422))
    const { wrapper } = await mountAt('/i/xv')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toBe(t('errorEmpty'))
    await wrapper.get('input').setValue('x')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe(t('errorInvalidGeneric'))
    wrapper.unmount()
  })

  it('arrives from a rejected link with the code in the field and the error visible', async () => {
    const { wrapper } = await mountAt('/i/xv?code=zz9&error=invalid')
    expect(wrapper.get('input').element.value).toBe('ZZ9')
    expect(wrapper.get('[role="alert"]').text()).toBe(t('errorInvalid', { name: 'Marisol' }))
    expect(verifyAccess).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('takes the first value when the query repeats and uses the dev mock on ?mock=', async () => {
    const { wrapper } = await mountAt('/i/xv?code=a&code=b&mock=anonymous')
    expect(wrapper.get('input').element.value).toBe('A')
    expect(wrapper.text()).toContain(t('contactGeneric'))
    expect(getAccess).not.toHaveBeenCalled()
    wrapper.unmount()
    await nextTick()
  })
})
