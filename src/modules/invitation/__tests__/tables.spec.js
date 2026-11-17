import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY } from '../composables/useInvitation'
import InvitationTables from '../components/InvitationTables.vue'

const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: 'es' })

function mountTables(data, props = {}) {
  return mount(InvitationTables, {
    props: { section: { type: 'tables', title: null, text: null, settings: {}, data }, ...props },
    global: { provide: { [INVITATION_KEY]: { invitation: ref({ locale: 'es' }), tt } } }
  })
}

describe('InvitationTables', () => {
  it('shows one line when everyone shares the table', () => {
    const wrapper = mountTables({ tables: [{ personId: 1, name: 'Valentina', table: '5 · Familia', seat: '3' }], sameTable: true })
    expect(wrapper.text()).toContain(tt('tables.title'))
    expect(wrapper.text()).toContain('Mesa 5 · Familia')
    expect(wrapper.text()).toContain('Asiento 3')
  })

  it('omits the seat when there is none', () => {
    const wrapper = mountTables({ tables: [{ personId: 1, name: 'Valentina', table: '5', seat: null }], sameTable: true })
    expect(wrapper.text()).not.toContain('Asiento')
  })

  it('lists each person when tables differ', () => {
    const wrapper = mountTables({
      tables: [
        { personId: 1, name: 'Rosa', table: '5', seat: null },
        { personId: 2, name: 'Jorge', table: '7', seat: '2' }
      ],
      sameTable: false
    })
    const rows = wrapper.findAll('li')
    expect(rows).toHaveLength(2)
    expect(rows[1].text()).toContain('Jorge')
    expect(rows[1].text()).toContain('Mesa 7')
    expect(rows[1].text()).toContain('Asiento 2')
  })

  it('draws nothing without an assignment and has no actions', () => {
    expect(mountTables({ tables: [], sameTable: true }).find('section').exists()).toBe(false)
    expect(mountTables({}).html()).not.toContain('<section')
    expect(mountTables({ tables: [{ personId: 1, name: 'A', table: '1', seat: null }], sameTable: true }).findAll('button, a, input')).toHaveLength(0)
  })

  it('escapes names and supports the inline variant', () => {
    const wrapper = mountTables({ tables: [{ personId: 1, name: 'A', table: '<i>1</i>', seat: null }], sameTable: true }, { variant: 'inline' })
    expect(wrapper.find('i').exists()).toBe(false)
    expect(wrapper.find('[data-variant="inline"]').exists()).toBe(true)
  })
})
