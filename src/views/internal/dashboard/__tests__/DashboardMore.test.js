import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardMore from '../DashboardMore.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a><slot /></a>' } }
const mountMore = program => mount(DashboardMore, { props: { program }, global: { plugins: [i18n], stubs } })

beforeEach(() => setLocale('es'))

describe('DashboardMore (program only)', () => {
  it('lists the moments of the day', () => {
    const w = mountMore([{ id: 1, title: 'Misa', time: '4:30 p. m.' }])
    expect(w.text()).toContain('Misa')
    expect(w.text()).toContain('4:30 p. m.')
  })
  it('says when there is no program yet, and has no budget anymore', () => {
    const w = mountMore([])
    expect(w.text()).toContain('Aún no has agregado momentos al programa')
    expect(w.text()).not.toContain('Presupuesto')
  })
})
