import { computed, ref } from 'vue'
import InvitationService from '@/services/PublicEvents/InvitationService'

/** Codes are typed by hand: no spaces, always uppercase. */
export const normalizeCode = value => String(value ?? '').replace(/\s+/g, '').toUpperCase()

/**
 * State of the access screen (/i/:slug without a guest code).
 * `organizer` is the first name of the event owner, or null when the API has none to show (it never says why).
 * `error` is '', 'empty' | 'invalid' | 'limited' | 'failed'.
 * @param {() => string} slug
 * @param {{ initialCode?: string, initialError?: string, api?: object, onValid?: (code: string) => void }} options
 */
export function useInvitationAccess(slug, { initialCode = '', initialError = '', api = InvitationService, onValid = () => {} } = {}) {
  const status = ref('loading') // loading | ready | error
  const organizer = ref(null)
  const code = ref(normalizeCode(initialCode))
  const error = ref(initialError === 'invalid' && code.value ? 'invalid' : '')
  const submitting = ref(false)
  let requested = 0

  const hasOrganizer = computed(() => Boolean(organizer.value))

  async function load() {
    const request = ++requested
    status.value = 'loading'
    try {
      const { data } = await api.getAccess(slug())
      if (request !== requested) return
      organizer.value = data?.data?.organizer_name || null
      status.value = 'ready'
    } catch {
      if (request !== requested) return
      status.value = 'error'
    }
  }

  function setCode(value) {
    code.value = normalizeCode(value)
    if (error.value) error.value = ''
  }

  async function submit() {
    if (submitting.value) return
    if (!code.value) {
      error.value = 'empty'
      return
    }
    submitting.value = true
    error.value = ''
    try {
      const { data } = await api.verifyAccess(slug(), code.value)
      if (data?.data?.valid && data.data.code) onValid(data.data.code)
      else error.value = 'invalid'
    } catch (e) {
      const http = e?.response?.status
      error.value = http === 422 ? 'invalid' : http === 429 ? 'limited' : 'failed'
    } finally {
      submitting.value = false
    }
  }

  return { status, organizer, hasOrganizer, code, error, submitting, load, setCode, submit }
}
