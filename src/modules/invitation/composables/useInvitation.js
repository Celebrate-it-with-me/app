import { computed, inject, provide, ref } from 'vue'
import i18n from '@/locales/i18n'
import InvitationService from '@/services/PublicEvents/InvitationService'

export const INVITATION_KEY = Symbol('invitation')

/** 'es' → 'es-US', 'en' → 'en-US': Intl locales for dates (Miami audience). */
const INTL = { es: 'es-US', en: 'en-US' }

/**
 * Loads one invitation and exposes it with helpers for the section components.
 * The invitation has its own language (guest, event or ?lang=), independent of the
 * organizer's app language, so texts are translated with an explicit locale and the
 * global locale is never touched.
 */
export function useInvitationData(slug, code) {
  const status = ref('loading') // loading | ready | notFound | error
  const invitation = ref(null)
  let requested = 0

  async function load(lang) {
    const request = ++requested
    // Switching language keeps the page on screen instead of flashing a skeleton.
    if (!invitation.value) status.value = 'loading'
    try {
      const { data } = await InvitationService.get({ slug: slug(), code: code(), lang })
      if (request !== requested) return
      invitation.value = data.data
      status.value = 'ready'
    } catch (error) {
      if (request !== requested) return
      status.value = error?.response?.status === 404 ? 'notFound' : 'error'
    }
  }

  const locale = computed(() => invitation.value?.locale ?? i18n.global.locale.value)

  /** Translate `invitation.<key>` in the invitation's language. */
  const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: locale.value })

  /** Wall-clock times: the API sends them without offset, the browser must not convert them. */
  const formatDate = (iso, options = { dateStyle: 'long' }) =>
    iso ? new Intl.DateTimeFormat(INTL[locale.value], options).format(new Date(iso)) : ''

  /** Replace the data of one section after the guest changed it (e.g. the RSVP answer). */
  function updateSection(type, data) {
    const section = invitation.value?.sections.find(item => item.type === type)
    if (section) section.data = data
  }

  return { status, invitation, locale, tt, formatDate, load, updateSection, slug, code }
}

export function provideInvitation(context) {
  provide(INVITATION_KEY, context)
}

export function useInvitationContext() {
  const context = inject(INVITATION_KEY)
  if (!context) throw new Error('useInvitationContext() must be used inside the invitation view')
  return context
}
