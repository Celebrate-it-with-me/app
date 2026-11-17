import { computed, inject, provide, ref, watch } from 'vue'
import i18n, { loadLocale } from '@/locales/i18n'
import InvitationService from '@/services/PublicEvents/InvitationService'
import { formatWallClock } from './wallClock'

export const INVITATION_KEY = Symbol('invitation')

/**
 * Language and data helpers shared by the public invitation and the admin preview:
 * both render the same section components from an `invitation` ref.
 */
export function invitationHelpers(invitation) {
  const locale = computed(() => invitation.value?.locale ?? i18n.global.locale.value)
  // The invitation's language is independent of the app's: make sure its messages are registered (a no-op when they are).
  watch(locale, value => loadLocale(value).catch(() => {}), { immediate: true })

  /** Translate `invitation.<key>` in the invitation's language. */
  const tt = (key, params = {}) => i18n.global.t(`invitation.${key}`, params, { locale: locale.value })

  /** Wall-clock times: the API sends them without offset, the browser must not convert them (see wallClock.js). */
  const formatDate = (iso, options = { dateStyle: 'long' }) => formatWallClock(iso, locale.value, options)

  /** Replace the data of one section after the guest changed it (e.g. the RSVP answer). */
  function updateSection(type, data) {
    const section = invitation.value?.sections.find(item => item.type === type)
    if (section) section.data = data
  }

  return { locale, tt, formatDate, updateSection }
}

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
      // The texts of the invitation's language must be there before the first paint (no raw keys on screen).
      await loadLocale(data.data?.locale).catch(() => {})
      if (request !== requested) return
      invitation.value = data.data
      status.value = 'ready'
    } catch (error) {
      if (request !== requested) return
      status.value = error?.response?.status === 404 ? 'notFound' : 'error'
    }
  }

  const helpers = invitationHelpers(invitation)

  return { status, invitation, ...helpers, load, slug, code, preview: false }
}

export function provideInvitation(context) {
  provide(INVITATION_KEY, context)
}

export function useInvitationContext() {
  const context = inject(INVITATION_KEY)
  if (!context) throw new Error('useInvitationContext() must be used inside the invitation view')
  return context
}
