import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import i18n, { setLocale } from '@/locales/i18n'
import { useToast } from '@/ui'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const api = vi.hoisted(() => ({ list: vi.fn(), setCommitments: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
vi.mock('../services/PadrinosService', () => ({ default: api }))
const budget = vi.hoisted(() => ({ items: vi.fn() }))
vi.mock('@/modules/budget/services/BudgetService', () => ({ default: budget }))

import PadrinosView from '../views/PadrinosView.vue'
import PadrinoCard from '../components/PadrinoCard.vue'
import PadrinoFormModal from '../components/PadrinoFormModal.vue'
import CommitmentsModal from '../components/CommitmentsModal.vue'

const raul = (extra = {}) => ({
  id: 9, name: 'Tío Raúl', status: 'accepted', phone: '+1 305 555 0101', relationship: 'Tío', publicThanks: true,
  commitments: [{ budgetItemId: 1, itemTitle: 'Banquete', amount: 1000 }], committed: 1000, paid: 250, progress: 'partial', ...extra
})
const listOf = (data, totals = { committed: 1000, paid: 250, remaining: 750, count: data.length }) => ({ data, totals, currency: 'USD' })
const ITEMS = [{ id: 1, title: 'Banquete', owed: 5000 }]

describe('PadrinosView', () => {
  let wrapper
  const body = () => document.body
  const text = () => body().textContent
  const toasts = () => useToast().toasts.map(t => `${t.tone}:${t.title}`)
  const button = label => [...body().querySelectorAll('button')].find(b => b.textContent.trim() === label)
  const click = async el => { el.click(); await flushPromises() }
  const types = (selector, value) => {
    const el = body().querySelector(selector)
    el.value = value
    el.dispatchEvent(new Event('input'))
    return nextTick()
  }

  async function setup({ role = 'owner', list = listOf([raul()]), activeEvent = true } = {}) {
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    if (activeEvent) useEventsStore().activeEvent = { id: 7, userRole: role, eventName: 'XV de Val' }
    api.list.mockResolvedValue(list)
    budget.items.mockResolvedValue(ITEMS)
    wrapper = mount(PadrinosView, { global: { plugins: [i18n, pinia] }, attachTo: document.body })
    await flushPromises()
    return pinia
  }

  beforeEach(() => {
    setLocale('es')
    Object.values(api).forEach(fn => fn.mockReset())
    budget.items.mockReset()
    useToast().toasts.splice(0)
  })
  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('does nothing until an event is active, then loads when it appears', async () => {
    const pinia = await setup({ activeEvent: false })
    expect(api.list).not.toHaveBeenCalled()
    useEventsStore(pinia).activeEvent = { id: 7, userRole: 'owner', eventName: 'XV' }
    await flushPromises()
    expect(api.list).toHaveBeenCalledWith(7)
    expect(text()).toContain('Tío Raúl')
  })

  it('shows the summary with the paid share and the cards', async () => {
    await setup()
    expect(text()).toContain('Tío Raúl')
    expect(body().querySelector('section [role=progressbar]').getAttribute('aria-valuenow')).toBe('25')
    expect(text()).toContain('$1,000')
    expect(text()).toContain('$750')
  })

  it('hides the summary when nothing is committed yet', async () => {
    await setup({ list: listOf([raul({ commitments: [], committed: 0, paid: 0, progress: 'none' })], { committed: 0, paid: 0, remaining: 0, count: 1 }) })
    expect(body().querySelector('section [role=progressbar]')).toBeNull()
    expect(text()).toContain('Tío Raúl')
  })

  it('shows the empty state with a call to action for editors and a skeleton while loading', async () => {
    let release
    api.list.mockReturnValue(new Promise(resolve => { release = resolve }))
    budget.items.mockResolvedValue(ITEMS)
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'editor', eventName: 'XV' }
    wrapper = mount(PadrinosView, { global: { plugins: [i18n, pinia] }, attachTo: document.body })
    await nextTick()
    expect(wrapper.findAll('.h-28').length).toBe(2)
    release(listOf([], { committed: 0, paid: 0, remaining: 0, count: 0 }))
    await flushPromises()
    expect(wrapper.findAll('.h-28').length).toBe(0)
    expect(button('Añadir el primer padrino') ?? button(i18n.global.t('app.padrinos.addFirst'))).toBeDefined()
  })

  it('does not offer to add or edit to a viewer', async () => {
    await setup({ role: 'viewer', list: listOf([]) })
    expect(button(i18n.global.t('app.padrinos.add'))).toBeUndefined()
    expect(button(i18n.global.t('app.padrinos.addFirst'))).toBeUndefined()
  })

  it('reports a load failure with a toast and leaves the page usable', async () => {
    api.list.mockRejectedValue(new Error('down'))
    budget.items.mockResolvedValue(ITEMS)
    const pinia = createPinia()
    createApp({}).use(pinia)
    setActivePinia(pinia)
    useEventsStore().activeEvent = { id: 7, userRole: 'owner', eventName: 'XV' }
    wrapper = mount(PadrinosView, { global: { plugins: [i18n, pinia] }, attachTo: document.body })
    await flushPromises()
    expect(toasts()).toContain(`danger:${i18n.global.t('app.padrinos.loadError')}`)
    expect(wrapper.findAll('.h-28').length).toBe(0)
  })

  it('creates a padrino from the form, reloads and closes it', async () => {
    await setup({ list: listOf([]) })
    api.create.mockResolvedValue({})
    await click(button(i18n.global.t('app.padrinos.addFirst')))
    await click(body().querySelector('button[form=padrino-form]'))
    expect(api.create).not.toHaveBeenCalled()
    expect(body().querySelector('#padrino-form').textContent).toContain(i18n.global.t('app.padrinos.errors.name'))
    await types('#padrino-form input', ' Tía Rosa ')
    await click(body().querySelector('button[form=padrino-form]'))
    expect(api.create).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'Tía Rosa', phone: null, status: 'invited' }))
    expect(api.list).toHaveBeenCalledTimes(2)
    expect(toasts()).toContain(`success:${i18n.global.t('app.padrinos.saved')}`)
    expect(body().querySelector('#padrino-form')).toBeNull()
  })

  it('keeps the form open and says so when saving fails', async () => {
    await setup({ list: listOf([]) })
    api.create.mockRejectedValue(new Error('500'))
    await click(button(i18n.global.t('app.padrinos.addFirst')))
    await types('#padrino-form input', 'Rosa')
    await click(body().querySelector('button[form=padrino-form]'))
    expect(toasts()).toContain(`danger:${i18n.global.t('app.padrinos.saveError')}`)
    expect(body().querySelector('#padrino-form')).not.toBeNull()
  })

  it('edits through the card event, prefilled, using update', async () => {
    await setup()
    api.update.mockResolvedValue({})
    wrapper.findComponent(PadrinoCard).vm.$emit('edit', raul())
    await flushPromises()
    expect(body().querySelector('#padrino-form input').value).toBe('Tío Raúl')
    await click(body().querySelector('button[form=padrino-form]'))
    expect(api.update).toHaveBeenCalledWith(7, 9, expect.objectContaining({ name: 'Tío Raúl', publicThanks: true }))
    expect(api.create).not.toHaveBeenCalled()
  })

  it('removes after confirming, and cancelling removes nothing', async () => {
    await setup()
    api.remove.mockResolvedValue()
    wrapper.findComponent(PadrinoCard).vm.$emit('remove', raul())
    await flushPromises()
    expect(text()).toContain('Tío Raúl')
    await click(button(i18n.global.t('app.padrinos.cancel')))
    expect(api.remove).not.toHaveBeenCalled()
    wrapper.findComponent(PadrinoCard).vm.$emit('remove', raul())
    await flushPromises()
    await click(button(i18n.global.t('app.padrinos.menu.remove')))
    expect(api.remove).toHaveBeenCalledWith(7, 9)
    expect(toasts()).toContain(`success:${i18n.global.t('app.padrinos.removed')}`)
  })

  it('explains that a padrino with payments cannot be removed', async () => {
    await setup()
    api.remove.mockRejectedValue({ response: { data: { errors: { padrino: ['has payments'] } } } })
    wrapper.findComponent(PadrinoCard).vm.$emit('remove', raul())
    await flushPromises()
    await click(button(i18n.global.t('app.padrinos.menu.remove')))
    expect(toasts()).toContain(`danger:${i18n.global.t('app.padrinos.hasPayments')}`)
  })

  it('closes the remove dialog, the form and the commitments modal with Escape', async () => {
    await setup()
    const esc = () => { body().querySelector('[role=dialog]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return flushPromises() }
    wrapper.findComponent(PadrinoCard).vm.$emit('remove', raul())
    await flushPromises()
    await esc()
    expect(body().querySelector('[role=dialog]')).toBeNull()
    wrapper.findComponent(PadrinoCard).vm.$emit('edit', raul())
    await flushPromises()
    await esc()
    expect(body().querySelector('#padrino-form')).toBeNull()
    wrapper.findComponent(PadrinoCard).vm.$emit('commitments', raul())
    await flushPromises()
    await esc()
    expect(body().querySelector('#commitments-form')).toBeNull()
    expect(api.remove).not.toHaveBeenCalled()
  })

  it('opens WhatsApp with the padrino text in a new, isolated window', async () => {
    await setup()
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    wrapper.findComponent(PadrinoCard).vm.$emit('whatsapp', raul())
    expect(open).toHaveBeenCalledTimes(1)
    const [url, target, features] = open.mock.calls[0]
    expect(url).toMatch(/^https:\/\/wa\.me\/13055550101\?text=/)
    expect(decodeURIComponent(url)).toContain('Tío Raúl')
    expect(decodeURIComponent(url)).toContain('XV de Val')
    expect([target, features]).toEqual(['_blank', 'noopener'])
  })

  it('opens the commitments modal from the card event for the right padrino', async () => {
    await setup()
    wrapper.findComponent(PadrinoCard).vm.$emit('commitments', raul())
    await flushPromises()
    expect(body().querySelector('#commitments-form')).not.toBeNull()
  })

  it('does not remove or update anything when the failure carries no padrino error (generic message)', async () => {
    await setup()
    api.update.mockRejectedValue({ response: { data: { errors: { other: [] } } } })
    wrapper.findComponent(PadrinoCard).vm.$emit('edit', raul())
    await flushPromises()
    await click(body().querySelector('button[form=padrino-form]'))
    expect(toasts()).toContain(`danger:${i18n.global.t('app.padrinos.saveError')}`)
  })
})

describe('PadrinoCard', () => {
  const mountCard = (props = {}) => mount(PadrinoCard, { props: { padrino: raul(), currency: 'USD', canEdit: true, ...props }, global: { plugins: [i18n] } })
  beforeEach(() => setLocale('es'))

  it('shows progress, commitments and the thanks hint', () => {
    const w = mountCard()
    expect(w.text()).toContain('Banquete')
    expect(w.text()).toContain('Tío · +1 305 555 0101')
    expect(w.find('[role=progressbar]').attributes('aria-valuenow')).toBe('25')
    expect(w.text()).toContain(i18n.global.t('app.padrinos.shownInInvitation'))
  })

  it('without commitments says so and offers to add them; the button emits commitments', async () => {
    const w = mountCard({ padrino: raul({ commitments: [], publicThanks: false, relationship: null, phone: null, progress: 'none' }) })
    expect(w.text()).toContain(i18n.global.t('app.padrinos.noCommitments'))
    expect(w.text()).not.toContain(i18n.global.t('app.padrinos.shownInInvitation'))
    expect(w.find('p.mt-0\\.5').exists()).toBe(false)
    const add = w.findAll('button').find(b => b.text() === i18n.global.t('app.padrinos.addCommitments'))
    await add.trigger('click')
    expect(w.emitted('commitments')).toHaveLength(1)
  })

  it('hides the editing actions from a viewer', () => {
    const w = mountCard({ canEdit: false })
    expect(w.findAll('button').find(b => b.text() === i18n.global.t('app.padrinos.changeCommitments'))).toBeUndefined()
  })

  it('the card button for a padrino with commitments says "change"', () => {
    const w = mountCard()
    expect(w.findAll('button').some(b => b.text() === i18n.global.t('app.padrinos.changeCommitments'))).toBe(true)
  })
})

describe('PadrinoCard menu', () => {
  let w
  beforeEach(() => setLocale('es'))
  afterEach(() => { w?.unmount(); document.body.innerHTML = '' })

  async function openMenu(props) {
    w = mount(PadrinoCard, { props: { padrino: raul(), canEdit: true, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
    const trigger = w.find('button[aria-haspopup=menu]')
    trigger.element.focus()
    trigger.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    await new Promise(r => setTimeout(r, 20))
    await flushPromises()
    return [...document.body.querySelectorAll('[role=menuitem]')]
  }
  const pick = async item => {
    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }))
    item.click()
    await flushPromises()
  }

  it('editors get WhatsApp, commitments, edit and remove, each emitting its event', async () => {
    const items = await openMenu()
    expect(items.map(i => i.textContent.trim())).toEqual(['menu.whatsapp', 'menu.commitments', 'menu.edit', 'menu.remove'].map(k => i18n.global.t(`app.padrinos.${k}`)))
    await pick(items[2])
    expect(w.emitted('edit')).toHaveLength(1)
    for (const [index, event] of [[0, 'whatsapp'], [1, 'commitments'], [3, 'remove']]) {
      const open = await openMenu()
      await pick(open[index])
      expect(w.emitted(event)).toHaveLength(1)
      w.unmount()
      document.body.innerHTML = ''
    }
  })

  it('viewers only get WhatsApp, disabled when the padrino has no phone', async () => {
    const items = await openMenu({ canEdit: false, padrino: raul({ phone: null }) })
    expect(items).toHaveLength(1)
    expect(items[0].getAttribute('data-disabled')).not.toBeNull()
  })
})

describe('PadrinoFormModal', () => {
  let w
  beforeEach(() => setLocale('es'))
  afterEach(() => { w?.unmount(); document.body.innerHTML = '' })
  const mountForm = props => {
    w = mount(PadrinoFormModal, { props: { open: false, ...props }, global: { plugins: [i18n] }, attachTo: document.body })
    return w
  }

  it('validates the phone, reveals the thanks text only when public, and emits a copy of the form', async () => {
    mountForm()
    await w.setProps({ open: true })
    await flushPromises()
    const inputs = () => document.body.querySelectorAll('#padrino-form input')
    inputs()[0].value = 'Rosa'
    inputs()[0].dispatchEvent(new Event('input'))
    const phone = document.body.querySelector('#padrino-form input[type=tel]')
    phone.value = 'abc'
    phone.dispatchEvent(new Event('input'))
    await nextTick()
    document.body.querySelector('#padrino-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await nextTick()
    expect(w.emitted('save')).toBeUndefined()
    expect(document.body.querySelector('#padrino-form').textContent).toContain(i18n.global.t('app.padrinos.errors.phone'))
    expect(document.body.querySelector('#padrino-form textarea')).toBeNull()
    phone.value = '+1 305 555 0101'
    phone.dispatchEvent(new Event('input'))
    document.body.querySelector('#padrino-form [role=switch]').click()
    await nextTick()
    expect(document.body.querySelector('#padrino-form textarea')).not.toBeNull()
    document.body.querySelector('#padrino-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await nextTick()
    expect(w.emitted('save')[0][0]).toMatchObject({ name: 'Rosa', phone: '+1 305 555 0101', publicThanks: true })
  })

  it('resets to an empty form when reopened for a new padrino and prefills when editing', async () => {
    mountForm({ padrino: raul() })
    await w.setProps({ open: true })
    await flushPromises()
    expect(document.body.querySelector('#padrino-form input').value).toBe('Tío Raúl')
    await w.setProps({ open: false })
    await w.setProps({ padrino: null, open: true })
    await flushPromises()
    expect(document.body.querySelector('#padrino-form input').value).toBe('')
  })

  it('cancel asks the parent to close it', async () => {
    mountForm()
    await w.setProps({ open: true })
    await flushPromises()
    const cancel = [...document.body.querySelectorAll('button')].find(b => b.textContent.trim() === i18n.global.t('app.padrinos.cancel'))
    cancel.click()
    await flushPromises()
    expect(w.emitted('update:open')[0]).toEqual([false])
  })
})

describe('CommitmentsModal', () => {
  let w
  beforeEach(() => setLocale('es'))
  afterEach(() => { w?.unmount(); document.body.innerHTML = '' })
  const mountModal = props => {
    w = mount(CommitmentsModal, { props: { open: false, padrino: raul(), items: ITEMS, currency: 'USD', ...props }, global: { plugins: [i18n] }, attachTo: document.body })
    return w
  }

  it('says there is nothing to cover when the budget has no items', async () => {
    mountModal({ items: [] })
    await w.setProps({ open: true })
    await flushPromises()
    expect(document.body.textContent).toContain(i18n.global.t('app.padrinos.commitments.empty'))
    expect(document.body.querySelector('#commitments-form')).toBeNull()
  })

  it('suggests the full amount when an item is checked and refuses to submit an empty amount', async () => {
    mountModal({ padrino: raul({ commitments: [] }) })
    await w.setProps({ open: true })
    await flushPromises()
    const box = document.body.querySelector('#commitments-form input[type=checkbox]')
    box.checked = true
    box.dispatchEvent(new Event('change'))
    await nextTick()
    const amount = document.body.querySelector('#commitments-form input[type=number]')
    expect(amount.value).toBe('5000')
    amount.value = ''
    amount.dispatchEvent(new Event('input'))
    await nextTick()
    document.body.querySelector('#commitments-form').dispatchEvent(new Event('submit', { cancelable: true }))
    await nextTick()
    expect(w.emitted('save')).toBeUndefined()
    expect(document.body.querySelector('#commitments-form input[type=number]').getAttribute('aria-invalid')).toBe('true')
    amount.value = '1200'
    amount.dispatchEvent(new Event('input'))
    await nextTick()
    document.body.querySelector('#commitments-form').dispatchEvent(new Event('submit', { cancelable: true }))
    expect(w.emitted('save')[0][0]).toEqual([{ budgetItemId: 1, amount: 1200 }])
  })

  it('keeps an amount the organizer already typed when re-checking', async () => {
    mountModal({ padrino: null })
    await w.setProps({ open: true })
    await flushPromises()
    expect(document.body.textContent).toContain('Banquete')
    const box = document.body.querySelector('#commitments-form input[type=checkbox]')
    box.checked = true
    box.dispatchEvent(new Event('change'))
    await nextTick()
    const amount = document.body.querySelector('#commitments-form input[type=number]')
    amount.value = '77'
    amount.dispatchEvent(new Event('input'))
    box.dispatchEvent(new Event('change'))
    await nextTick()
    expect(document.body.querySelector('#commitments-form input[type=number]').value).toBe('77')
  })
})
