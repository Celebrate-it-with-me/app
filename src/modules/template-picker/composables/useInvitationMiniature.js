import { computed, onBeforeUnmount, ref, toValue, watch } from 'vue'
import { useTemplatePicker } from './useTemplatePicker'
import { writeErrorCode } from '../utils/templatePicker'

/** Sections the miniature keeps: only the cover, so the iframe stays light and shows what a thumbnail should. */
export const MINIATURE_SECTIONS = ['cover']

/** The payload with `sections` reduced to the cover, or null when there is no cover (or the payload is not usable). */
export function coverOnly(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.sections) || !payload.theme) return null
  const sections = payload.sections.filter(item => item && MINIATURE_SECTIONS.includes(item.type))
  return sections.length ? { ...payload, sections } : null
}

/**
 * Loads the real invitation payload of an event (active template unless `templateId` says otherwise) and keeps the
 * cover section. `status` is `idle | loading | ready | failed`; failures (including 429) and timeouts end in `failed`,
 * which the caller answers with the template's image or the stationery card. `eventId`, `templateId` and `locale` may
 * be refs or getters. With a `session` (see useMiniatureSession) the payload comes from the shared cache and queue.
 */
export function useInvitationMiniature(eventId, { templateId, locale, timeout = 10000, session = null } = {}) {
  const picker = useTemplatePicker(eventId)
  const own = ref({ status: 'idle', payload: null, error: null })
  let ticket = 0
  const rawStatus = computed(() => (session ? own.value.status : picker.previewStatus.value))
  const rawPayload = computed(() => (session ? own.value.payload : picker.previewPayload.value))
  const rawError = computed(() => (session ? own.value.error : picker.previewError.value))
  const timedOut = ref(false)
  let timer = null

  const payload = computed(() => (rawStatus.value === 'ready' ? coverOnly(rawPayload.value) : null))
  const status = computed(() => {
    if (timedOut.value || rawStatus.value === 'error') return 'failed'
    if (rawStatus.value === 'ready') return payload.value ? 'ready' : 'failed'
    return rawStatus.value === 'loading' ? 'loading' : 'idle'
  })
  /** `too_many_attempts` for a 429, `timeout`, or another code/null. */
  const error = computed(() => (timedOut.value ? 'timeout' : rawError.value))

  function clear() {
    clearTimeout(timer)
    timer = null
  }

  function resetState() {
    ticket++
    if (session) own.value = { status: 'idle', payload: null, error: null }
    else picker.resetPreview()
  }

  async function loadFromSession() {
    const mine = ++ticket
    own.value = { status: 'loading', payload: null, error: null }
    try {
      const data = await session.fetch(toValue(eventId), toValue(templateId), toValue(locale))
      if (mine === ticket) own.value = { status: 'ready', payload: data, error: null }
    } catch (e) {
      if (mine === ticket) own.value = { status: 'error', payload: null, error: writeErrorCode(e) }
    }
  }

  async function load() {
    clear()
    timedOut.value = false
    timer = setTimeout(() => {
      timedOut.value = true
      resetState()
    }, timeout)
    if (session) await loadFromSession()
    else await picker.loadPreview({ id: toValue(templateId) }, { locale: toValue(locale) })
    clear()
  }

  function reset() {
    clear()
    timedOut.value = false
    resetState()
  }

  watch(
    () => [toValue(eventId), toValue(templateId)],
    () => status.value !== 'idle' && load()
  )
  onBeforeUnmount(reset)

  return { payload, status, error, load, reset }
}
