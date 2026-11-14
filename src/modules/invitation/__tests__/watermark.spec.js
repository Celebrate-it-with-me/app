import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import i18n from '@/locales/i18n'
import { INVITATION_KEY, invitationHelpers } from '../composables/useInvitation'
import InvitationClosing from '../components/InvitationClosing.vue'

function render(branding) {
  const invitation = ref({ locale: 'es', branding, sections: [] })
  i18n.global.locale.value = 'es'
  return mount(InvitationClosing, {
    props: { section: { type: 'closing', title: 'Gracias', text: '', data: {} } },
    global: { plugins: [i18n], provide: { [INVITATION_KEY]: { invitation, ...invitationHelpers(invitation) } } }
  })
}

describe('"Hecho con Quinvite" mark', () => {
  it('shows only when branding.watermark is exactly true', () => {
    expect(render({ watermark: true }).text()).toContain('Hecho con Quinvite')
  })

  it('stays hidden when it is false, missing, or branding is absent', () => {
    expect(render({ watermark: false }).text()).not.toContain('Hecho con Quinvite')
    expect(render({}).text()).not.toContain('Hecho con Quinvite')
    expect(render(undefined).text()).not.toContain('Hecho con Quinvite')
  })
})
