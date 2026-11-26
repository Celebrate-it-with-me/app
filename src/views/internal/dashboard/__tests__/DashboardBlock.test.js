import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardBlock from '../DashboardBlock.vue'

const mountBlock = status =>
  mount(DashboardBlock, {
    props: { status, errorText: 'No pudimos cargarlo' },
    slots: { skeleton: '<i data-testid="sk" />', default: '<b data-testid="content" />' },
    global: { plugins: [i18n] }
  })

beforeEach(() => setLocale('es'))

describe('DashboardBlock', () => {
  it('draws only the skeleton while loading, marked busy', () => {
    const w = mountBlock('loading')
    expect(w.find('[data-testid=sk]').exists()).toBe(true)
    expect(w.find('[data-testid=content]').exists()).toBe(false)
    expect(w.get('[data-testid=block-loading]').attributes('aria-busy')).toBe('true')
  })
  it('draws the error as an alert with a retry that emits', async () => {
    const w = mountBlock('error')
    expect(w.get('[role=alert]').text()).toContain('No pudimos cargarlo')
    expect(w.find('[data-testid=content]').exists()).toBe(false)
    await w.get('[data-testid=block-retry]').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })
  it('says retry in English', () => {
    setLocale('en')
    expect(mountBlock('error').get('[data-testid=block-retry]').text()).toBe('Try again')
  })
  it('draws the content when ready', () => {
    const w = mountBlock('ready')
    expect(w.find('[data-testid=content]').exists()).toBe(true)
    expect(w.find('[data-testid=sk]').exists()).toBe(false)
  })
})
