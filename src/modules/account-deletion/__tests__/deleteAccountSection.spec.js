import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DeleteAccountSection from '../components/DeleteAccountSection.vue'

describe('DeleteAccountSection', () => {
  beforeEach(() => setLocale('es'))

  it('shows the danger zone closed and opens the deletion dialog from its button', async () => {
    const w = mount(DeleteAccountSection, { global: { plugins: [i18n], stubs: { DeleteAccountDialog: { props: ['open'], template: '<div data-testid="dialog" :data-open="open" />' } } } })
    expect(w.text()).toContain(i18n.global.t('accountDeletion.zoneTitle'))
    expect(w.get('[data-testid=dialog]').attributes('data-open')).toBe('false')
    await w.get('button').trigger('click')
    expect(w.get('[data-testid=dialog]').attributes('data-open')).toBe('true')
  })
})
