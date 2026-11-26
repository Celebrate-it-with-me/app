import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n, { setLocale } from '@/locales/i18n'
import DashboardProgram from '../DashboardProgram.vue'
import { programMoments } from '../dashboardLogic'

const stubs = { RouterLink: { props: ['to'], template: '<a :data-to="to"><slot /></a>' } }
const moment = (id, title, startTime, description = null) => ({ id, title, type: 'other', description, startTime, endTime: null })
// Valentina's program (seed), out of order on purpose.
const MOMENTS = [
  moment(2, 'Cena', '2027-01-02 20:30:00'),
  moment(1, 'Ceremonia religiosa', '2027-01-02 16:30:00', 'Misa de acción de gracias en la parroquia.'),
  moment(3, 'Recepción', '2027-01-02 19:00:00', 'Llegada de los invitados y fotos.'),
  moment(4, 'Hora loca', '2027-01-03 00:30:00')
]
const mountProgram = (props = {}) => mount(DashboardProgram, { props: { moments: MOMENTS, status: 'ready', canEdit: true, ...props }, global: { plugins: [i18n], stubs } })

beforeEach(() => setLocale('es'))

describe('programMoments', () => {
  it('sorts by the wall clock (after midnight goes last) and keeps the description', () => {
    const list = programMoments(MOMENTS)
    expect(list.map(m => m.title)).toEqual(['Ceremonia religiosa', 'Recepción', 'Cena', 'Hora loca'])
    expect(list[0].description).toBe('Misa de acción de gracias en la parroquia.')
    expect(list[2].description).toBe('')
  })
  it('reads the snake_case field and drops moments without a title or a readable time', () => {
    const list = programMoments([{ id: 1, title: 'A', start_time: '2027-01-02 10:00:00' }, { id: 2, title: '', startTime: '2027-01-02 11:00:00' }, { id: 3, title: 'C', startTime: 'nope' }])
    expect(list.map(m => m.id)).toEqual([1])
    expect(programMoments(null)).toEqual([])
  })
})

describe('DashboardProgram', () => {
  it('draws each moment with a 12 h time, its title and its description', () => {
    const w = mountProgram()
    const times = w.findAll('[data-testid=program-time]').map(n => n.text())
    expect(times[0]).toMatch(/^4:30\sp\.\s?m\.$/)
    expect(times[3]).toMatch(/^12:30\sa\.\s?m\.$/)
    expect(w.findAll('[data-testid=program-moment]')[0].text()).toContain('Ceremonia religiosa')
    expect(w.findAll('[data-testid=program-description]')).toHaveLength(2)
    expect(w.find('[data-to="/dashboard/timeline"]').text()).toBe('Ver programa')
  })
  it('prints the time in English with the app in English', () => {
    setLocale('en')
    expect(mountProgram().findAll('[data-testid=program-time]')[0].text()).toMatch(/^4:30\sPM$/)
  })
  it('shows the first moments and a plural link to the rest', () => {
    const w = mountProgram({ max: 2 })
    expect(w.findAll('[data-testid=program-moment]')).toHaveLength(2)
    expect(w.get('[data-testid=program-more]').text()).toBe('Ver los 2 momentos que faltan')
    expect(mountProgram({ max: 3 }).get('[data-testid=program-more]').text()).toBe('Ver el momento que falta')
    expect(mountProgram().find('[data-testid=program-more]').exists()).toBe(false)
  })
  it('without moments: an empty state with the way to plan it, only for who can edit', () => {
    const w = mountProgram({ moments: [] })
    expect(w.get('[data-testid=program-empty]').text()).toContain('Arma el programa del día')
    expect(w.get('[data-testid=program-empty]').find('[data-to="/dashboard/timeline"]').exists()).toBe(true)
    expect(w.find('[data-testid=program-list]').exists()).toBe(false)
    const viewer = mountProgram({ moments: [], canEdit: false })
    expect(viewer.get('[data-testid=program-empty]').find('a').exists()).toBe(false)
  })
  it('loading draws the skeleton, never the empty state; an error offers retry', async () => {
    const loading = mountProgram({ moments: null, status: 'loading' })
    expect(loading.find('[data-testid=program-skeleton]').exists()).toBe(true)
    expect(loading.find('[data-testid=program-empty]').exists()).toBe(false)
    const error = mountProgram({ moments: null, status: 'error' })
    expect(error.find('[data-testid=program-empty]').exists()).toBe(false)
    expect(error.get('[data-testid=block-error]').text()).toContain('No pudimos cargar el programa del día')
    await error.get('[data-testid=block-retry]').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)
  })
})
