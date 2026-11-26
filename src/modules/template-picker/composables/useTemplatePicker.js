import { ref, toValue } from 'vue'
import TemplatePickerService from '../services/TemplatePickerService'
import { sortTemplates, writeErrorCode } from '../utils/templatePicker'

/**
 * State of the template selector for one event: the list, the live preview payload of the template being looked at,
 * the impact of a change and the apply/undo calls. The API decides everything (locked, available, plan): this only
 * keeps what it answered and turns failures into a code the screens can speak about.
 * `eventId` may be a ref or a getter.
 */
/** Combinations kept at once: enough for a few templates with their palettes and both languages. */
const CACHE_LIMIT = 32
const cacheKey = (template, { locale, state, preset, fields } = {}) =>
  fields && Object.keys(fields).length ? null : [template?.id ?? 'current', preset || '', locale || '', state || ''].join('|')

export function useTemplatePicker(eventId) {
  const templates = ref([])
  const status = ref('idle') // idle | loading | ready | error
  const previewPayload = ref(null)
  const previewStatus = ref('idle') // idle | loading | ready | error
  const previewError = ref(null)
  const comparePayload = ref(null)
  const compareStatus = ref('idle') // idle | loading | ready | error
  const impact = ref(null)
  const impactStatus = ref('idle')
  const applying = ref(false)
  const undo = ref(null) // { until, templateId, name } after a change

  let previewTicket = 0
  let compareTicket = 0
  // template + palette + language + stage -> payload (or the request in flight): coming back to a combination is instant.
  const previewCache = new Map()
  let impactTicket = 0

  async function load() {
    status.value = 'loading'
    try {
      templates.value = sortTemplates(await TemplatePickerService.templates(toValue(eventId)))
      status.value = 'ready'
    } catch {
      status.value = 'error'
    }
  }

  /** The payload of a combination: from the cache, or asked once (a second caller shares the request in flight). Failures are not kept. */
  function fetchPreview(template, options = {}) {
    const key = cacheKey(template, options)
    const ask = () => TemplatePickerService.preview(toValue(eventId), { templateId: template?.id, ...options })
    if (key === null) return ask()
    if (previewCache.has(key)) return previewCache.get(key)
    const request = ask().catch(error => {
      previewCache.delete(key)
      throw error
    })
    previewCache.set(key, request)
    if (previewCache.size > CACHE_LIMIT) previewCache.delete(previewCache.keys().next().value)
    return request
  }

  /** Warms the cache for a combination she is likely to look at next (hover, focus). Silent. */
  function prefetchPreview(template, options = {}) {
    if (!template) return
    fetchPreview(template, options).catch(() => {})
  }

  /** Renders `template` with the event's real data. Only the latest request may write the result; the previous payload stays until it arrives. */
  async function loadPreview(template, { locale, state, preset, fields } = {}) {
    const ticket = ++previewTicket
    previewStatus.value = 'loading'
    previewError.value = null
    try {
      const payload = await fetchPreview(template, { locale, state, preset, fields })
      if (ticket !== previewTicket) return
      previewPayload.value = payload
      previewStatus.value = 'ready'
    } catch (e) {
      if (ticket !== previewTicket) return
      previewError.value = writeErrorCode(e)
      previewStatus.value = 'error'
    }
  }

  /** The invitation as it is saved now (no template asked), for "compare with the current one". */
  async function loadCompare({ locale, state } = {}) {
    const ticket = ++compareTicket
    compareStatus.value = 'loading'
    try {
      const payload = await fetchPreview(null, { locale, state })
      if (ticket !== compareTicket) return
      comparePayload.value = payload
      compareStatus.value = 'ready'
    } catch {
      if (ticket === compareTicket) compareStatus.value = 'error'
    }
  }

  function resetCompare() {
    compareTicket++
    comparePayload.value = null
    compareStatus.value = 'idle'
  }

  /** Forgets what was kept (the event changed, or the saved invitation did). */
  function clearPreviewCache() {
    previewCache.clear()
  }

  function resetPreview() {
    previewTicket++
    resetCompare()
    previewPayload.value = null
    previewStatus.value = 'idle'
    previewError.value = null
  }

  async function loadImpact(template) {
    const ticket = ++impactTicket
    impact.value = null
    impactStatus.value = 'loading'
    try {
      const data = await TemplatePickerService.impact(toValue(eventId), template.id)
      if (ticket !== impactTicket) return null
      impact.value = data
      impactStatus.value = 'ready'
      return data
    } catch {
      if (ticket === impactTicket) impactStatus.value = 'error'
      return null
    }
  }

  /** `{ ok: true, data }` or `{ ok: false, code }` (`plan_required`, `template_locked`, `template_not_available`, `template_not_found`, `event_archived`, `forbidden`, `other`). */
  async function apply(template, { undo: isUndo = false, preset } = {}) {
    applying.value = true
    try {
      const previous = templates.value.find(item => item.current)
      const data = await TemplatePickerService.apply(toValue(eventId), template.id, { undo: isUndo, preset })
      undo.value = data?.undo ? { ...data.undo, name: templates.value.find(item => item.id === data.undo.templateId)?.name ?? previous?.name ?? '' } : null
      // The saved invitation changed: what was cached for "the current one" and the palettes' activePreset are stale.
      clearPreviewCache()
      templates.value = sortTemplates(
        templates.value.map(item => ({ ...item, current: item.id === template.id, ...(item.id === template.id && preset !== undefined ? { activePreset: preset } : {}) }))
      )
      return { ok: true, data }
    } catch (e) {
      return { ok: false, code: writeErrorCode(e) ?? 'other' }
    } finally {
      applying.value = false
    }
  }

  /** Goes back to the template she had before the last change (the API keeps what is proper to each template apart). */
  async function undoLast() {
    if (!undo.value) return { ok: false, code: 'other' }
    const target = { id: undo.value.templateId }
    // Undoing a palette-only change sends the old palette back (null clears it): the API says so with `preset` in `undo`.
    const options = 'preset' in undo.value ? { undo: true, preset: undo.value.preset } : { undo: true }
    const result = await apply(target, options)
    if (result.ok) undo.value = null
    return result
  }

  return { templates, status, previewPayload, previewStatus, previewError, comparePayload, compareStatus, loadCompare, resetCompare, prefetchPreview, clearPreviewCache, impact, impactStatus, applying, undo, load, loadPreview, resetPreview, loadImpact, apply, undoLast }
}
