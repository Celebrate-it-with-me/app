import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import i18n from '@/locales/i18n'

const hoisted = vi.hoisted(() => ({
  service: {
    list: vi.fn(),
    download: vi.fn(),
    downloadVenue: vi.fn(),
    setLocale: vi.fn()
  },
  saveBlob: vi.fn(),
  success: vi.fn(),
  error: vi.fn()
}))

vi.mock('@/modules/events/stores/useEventsStore', () => ({
  useEventsStore: () => ({ activeEvent: { id: 7, userRole: 'owner', eventName: 'XV' }, fetchEvent: () => Promise.resolve() })
}))
vi.mock('../services/RosterService', () => ({ default: hoisted.service }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: {} }), useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/ui/useToast', () => ({ useToast: () => ({ success: hoisted.success, error: hoisted.error }) }))
vi.mock('../utils/roster', async importOriginal => ({ ...(await importOriginal()), saveBlob: hoisted.saveBlob }))

import RosterDownloadMenu from '../components/RosterDownloadMenu.vue'
import GuestLocaleSelect from '../components/GuestLocaleSelect.vue'
import RosterView from '../views/RosterView.vue'
import { effectiveLocale } from '../utils/roster'

// UiDropdown renders in a portal; this stub shows its items as plain buttons.
const UiDropdown = {
  props: ['items'],
  template: `<div><slot name="trigger" /><button v-for="(item, i) in items" :key="i" type="button" class="item" @click="item.onSelect()">{{ item.label }}</button></div>`
}

const t = (key, params) => i18n.global.t(key, params)

beforeEach(() => {
  i18n.global.locale.value = 'es'
  Object.values(hoisted.service).forEach(fn => fn.mockReset())
  hoisted.saveBlob.mockReset()
  hoisted.success.mockReset()
  hoisted.error.mockReset()
})

describe('effectiveLocale', () => {
  it('is the guest\'s own language, then the event\'s, then Spanish', () => {
    expect(effectiveLocale({ locale: 'en' }, 'es')).toBe('en')
    expect(effectiveLocale({ locale: null }, 'en')).toBe('en')
    expect(effectiveLocale({ locale: null }, undefined)).toBe('es')
  })
})

describe('RosterDownloadMenu', () => {
  const mountMenu = props => mount(RosterDownloadMenu, { props: { eventId: 7, ...props }, global: { plugins: [i18n], stubs: { UiDropdown } } })
  const labels = wrapper => wrapper.findAll('.item').map(b => b.text())

  it('offers all the guests and the venue list; the current tab only when it is filtered', async () => {
    expect(labels(mountMenu({ status: 'all' }))).toEqual([t('app.roster.download.all'), t('app.roster.download.venue')])

    const wrapper = mountMenu({ status: 'pending' })
    expect(labels(wrapper)).toEqual([
      t('app.roster.download.current', { tab: t('app.roster.tabs.pending') }),
      t('app.roster.download.all'),
      t('app.roster.download.venue')
    ])
    expect(labels(mountMenu({ status: 'all', search: ' ana ' }))).toHaveLength(3)
  })

  it('downloads the current tab with its status, search and the language of the organizer', async () => {
    hoisted.service.download.mockResolvedValue({ blob: new Blob(['x']), filename: 'invitados-xv.xlsx' })
    const wrapper = mountMenu({ status: 'pending', search: ' ana ' })

    await wrapper.findAll('.item')[0].trigger('click')
    await flushPromises()

    expect(hoisted.service.download).toHaveBeenCalledWith(7, { status: 'pending', search: 'ana', locale: 'es' })
    expect(hoisted.saveBlob).toHaveBeenCalledWith(expect.any(Blob), 'invitados-xv.xlsx')
    expect(hoisted.success).toHaveBeenCalledWith(t('app.roster.download.done'))
  })

  it('downloads everybody, or the venue list, in the current language', async () => {
    hoisted.service.download.mockResolvedValue({ blob: new Blob(['x']), filename: 'a.xlsx' })
    hoisted.service.downloadVenue.mockResolvedValue({ blob: new Blob(['x']), filename: 'b.xlsx' })
    i18n.global.locale.value = 'en'
    const wrapper = mountMenu({ status: 'pending' })

    await wrapper.findAll('.item')[1].trigger('click')
    await flushPromises()
    await wrapper.findAll('.item')[2].trigger('click')
    await flushPromises()

    expect(hoisted.service.download).toHaveBeenCalledWith(7, { locale: 'en' })
    expect(hoisted.service.downloadVenue).toHaveBeenCalledWith(7, { locale: 'en' })
  })

  it('shows a toast and saves nothing when the download fails, with its own text for the rate limit', async () => {
    hoisted.service.download.mockRejectedValueOnce(new Error('boom')).mockRejectedValueOnce({ response: { status: 429 } })
    const wrapper = mountMenu({ status: 'all' })

    await wrapper.findAll('.item')[0].trigger('click')
    await flushPromises()
    await wrapper.findAll('.item')[0].trigger('click')
    await flushPromises()

    expect(hoisted.saveBlob).not.toHaveBeenCalled()
    expect(hoisted.error).toHaveBeenNthCalledWith(1, t('app.roster.download.error'))
    expect(hoisted.error).toHaveBeenNthCalledWith(2, t('app.roster.download.tooMany'))
  })
})

describe('GuestLocaleSelect', () => {
  const stubs = { UiSelect: { props: ['modelValue', 'options', 'disabled'], emits: ['update:modelValue'], template: `<select :disabled="disabled" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select>` } }
  const mountSelect = (family, extra = {}) => mount(GuestLocaleSelect, { props: { family, eventLocale: 'en', ...extra }, global: { plugins: [i18n], stubs } })

  it('offers the event\'s language (named), Spanish and English, and selects the guest\'s own', () => {
    const wrapper = mountSelect({ locale: null })
    expect(wrapper.findAll('option').map(o => o.text())).toEqual([t('app.roster.locale.event', { lang: t('app.roster.locale.en') }), t('app.roster.locale.es'), t('app.roster.locale.en')])
    expect(wrapper.get('select').element.value).toBe('event')
    expect(mountSelect({ locale: 'es' }).get('select').element.value).toBe('es')
  })

  it('emits the language, and null for "the event\'s"; nothing when it did not change', async () => {
    const wrapper = mountSelect({ locale: 'es' })
    await wrapper.get('select').setValue('en')
    await wrapper.get('select').setValue('event')
    await wrapper.get('select').setValue('es')
    expect(wrapper.emitted('change')).toEqual([['en'], [null]])
  })

  it('is disabled for those who cannot edit', () => {
    expect(mountSelect({ locale: null }, { disabled: true }).get('select').attributes('disabled')).toBeDefined()
  })
})

describe('RosterView language change', () => {
  const family = () => ({ id: 1, name: 'Ana', status: 'pending', companions: [], locale: null, effectiveLocale: 'es' })
  // The card is a stub with a button that asks for a language, so the test needs neither the dropdown nor the select.
  const GuestCard = {
    props: ['family', 'eventLocale', 'canEdit'],
    emits: ['locale'],
    template: `<div class="card" :data-locale="family.locale" :data-effective="family.effectiveLocale"><button class="en" @click="$emit('locale', family, 'en')" /></div>`
  }

  async function mountView() {
    hoisted.service.list.mockResolvedValue({
      data: [family()],
      meta: { currentPage: 1, lastPage: 1, total: 1 },
      counts: { all: 1, attending: 0, pending: 1, notAttending: 0, families: 1, limit: null },
      eventLocale: 'es'
    })
    const wrapper = mount(RosterView, {
      global: {
        plugins: [i18n],
        stubs: { GuestCard, GuestLimitBanner: true, GuestFormModal: true, ConfirmModal: true, GuestImportModal: true, RosterDownloadMenu: true, UiModal: true, RouterLink: true }
      }
    })
    await flushPromises()
    return wrapper
  }

  it('changes at once, then keeps what the server answers', async () => {
    const wrapper = await mountView()
    let finish
    hoisted.service.setLocale.mockReturnValue(new Promise(resolve => (finish = resolve)))

    await wrapper.get('.en').trigger('click')
    expect(wrapper.get('.card').attributes('data-locale')).toBe('en')
    expect(wrapper.get('.card').attributes('data-effective')).toBe('en')

    finish({ locale: 'en', effectiveLocale: 'en' })
    await flushPromises()

    expect(hoisted.service.setLocale).toHaveBeenCalledWith(7, 1, 'en')
    expect(hoisted.success).toHaveBeenCalledWith(t('app.roster.locale.saved'))
    expect(wrapper.get('.card').attributes('data-locale')).toBe('en')
  })

  it('goes back to the previous language and shows an error toast when it fails', async () => {
    const wrapper = await mountView()
    hoisted.service.setLocale.mockRejectedValue(new Error('403'))

    await wrapper.get('.en').trigger('click')
    await flushPromises()

    expect(wrapper.get('.card').attributes('data-locale')).toBeUndefined()
    expect(wrapper.get('.card').attributes('data-effective')).toBe('es')
    expect(hoisted.error).toHaveBeenCalledWith(t('app.roster.locale.error'))
    expect(hoisted.success).not.toHaveBeenCalled()
  })
})
