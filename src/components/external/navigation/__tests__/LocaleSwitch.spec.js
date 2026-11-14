import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n, { setLocale, LOCALE_STORAGE_KEY } from '@/locales/i18n'
import LocaleSwitch from '../LocaleSwitch.vue'

async function mountSwitch() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' }, meta: { titleKey: 'invitation.pageTitle' } }]
  })
  router.push('/')
  await router.isReady()
  return mount(LocaleSwitch, { global: { plugins: [i18n, router] } })
}

describe('LocaleSwitch', () => {
  beforeEach(() => {
    localStorage.clear()
    setLocale('es')
    localStorage.clear()
  })

  it('offers one button per locale and marks the active one', async () => {
    const wrapper = await mountSwitch()
    const buttons = wrapper.findAll('button')
    expect(buttons.map(b => b.text().toLowerCase())).toEqual(['es', 'en'])
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-pressed')).toBe('false')
  })

  it('switches the language, remembers it, updates <html lang> and the document title', async () => {
    const wrapper = await mountSwitch()
    await wrapper.findAll('button')[1].trigger('click')

    expect(i18n.global.locale.value).toBe('en')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe(`${i18n.global.t('invitation.pageTitle')} · Quinvite`)
    expect(wrapper.findAll('button')[1].attributes('aria-pressed')).toBe('true')
  })
})
