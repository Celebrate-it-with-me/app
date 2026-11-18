import { computed, onBeforeUnmount, ref, toValue, watch } from 'vue'
import { useTemplatePicker } from './useTemplatePicker'

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
 * be refs or getters.
 */
export function useInvitationMiniature(eventId, { templateId, locale, timeout = 10000 } = {}) {
  const picker = useTemplatePicker(eventId)
  const timedOut = ref(false)
  let timer = null

  const payload = computed(() => (picker.previewStatus.value === 'ready' ? coverOnly(picker.previewPayload.value) : null))
  const status = computed(() => {
    if (timedOut.value || picker.previewStatus.value === 'error') return 'failed'
    if (picker.previewStatus.value === 'ready') return payload.value ? 'ready' : 'failed'
    return picker.previewStatus.value === 'loading' ? 'loading' : 'idle'
  })
  /** `too_many_attempts` for a 429, `timeout`, or another code/null. */
  const error = computed(() => (timedOut.value ? 'timeout' : picker.previewError.value))

  function clear() {
    clearTimeout(timer)
    timer = null
  }

  async function load() {
    clear()
    timedOut.value = false
    timer = setTimeout(() => {
      timedOut.value = true
      picker.resetPreview()
    }, timeout)
    await picker.loadPreview({ id: toValue(templateId) }, { locale: toValue(locale) })
    clear()
  }

  function reset() {
    clear()
    timedOut.value = false
    picker.resetPreview()
  }

  watch(
    () => [toValue(eventId), toValue(templateId)],
    () => status.value !== 'idle' && load()
  )
  onBeforeUnmount(reset)

  return { payload, status, error, load, reset }
}
