import { ref, toValue } from 'vue'
import TemplatePickerService from '../services/TemplatePickerService'
import { errorCode, sortTemplates } from '../utils/templatePicker'

/**
 * State of the template selector for one event: the list, the live preview payload of the template being looked at,
 * the impact of a change and the apply/undo calls. The API decides everything (locked, available, plan): this only
 * keeps what it answered and turns failures into a code the screens can speak about.
 * `eventId` may be a ref or a getter.
 */
export function useTemplatePicker(eventId) {
  const templates = ref([])
  const status = ref('idle') // idle | loading | ready | error
  const previewPayload = ref(null)
  const previewStatus = ref('idle') // idle | loading | ready | error
  const previewError = ref(null)
  const impact = ref(null)
  const impactStatus = ref('idle')
  const applying = ref(false)
  const undo = ref(null) // { until, templateId, name } after a change

  let previewTicket = 0
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

  /** Renders `template` with the event's real data. Only the latest request may write the result. */
  async function loadPreview(template, { locale, state, preset } = {}) {
    const ticket = ++previewTicket
    previewStatus.value = 'loading'
    previewError.value = null
    try {
      const payload = await TemplatePickerService.preview(toValue(eventId), { templateId: template.id, locale, state, preset })
      if (ticket !== previewTicket) return
      previewPayload.value = payload
      previewStatus.value = 'ready'
    } catch (e) {
      if (ticket !== previewTicket) return
      previewError.value = errorCode(e)
      previewStatus.value = 'error'
    }
  }

  function resetPreview() {
    previewTicket++
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
      if (ticket !== impactTicket) return
      impact.value = data
      impactStatus.value = 'ready'
    } catch {
      if (ticket !== impactTicket) return
      impactStatus.value = 'error'
    }
  }

  /** `{ ok: true, data }` or `{ ok: false, code }` (`plan_required`, `template_locked`, `template_not_available`, `template_not_found`, `other`). */
  async function apply(template, { confirm = false } = {}) {
    applying.value = true
    try {
      const previous = templates.value.find(item => item.current)
      const data = await TemplatePickerService.apply(toValue(eventId), template.id, { confirm })
      undo.value = data?.undo ? { ...data.undo, name: templates.value.find(item => item.id === data.undo.templateId)?.name ?? previous?.name ?? '' } : null
      templates.value = sortTemplates(templates.value.map(item => ({ ...item, current: item.id === template.id })))
      return { ok: true, data }
    } catch (e) {
      return { ok: false, code: errorCode(e) ?? 'other' }
    } finally {
      applying.value = false
    }
  }

  /** Goes back to the template she had before the last change (the API keeps what is proper to each template apart). */
  async function undoLast() {
    if (!undo.value) return { ok: false, code: 'other' }
    const target = { id: undo.value.templateId }
    const result = await apply(target)
    if (result.ok) undo.value = null
    return result
  }

  return { templates, status, previewPayload, previewStatus, previewError, impact, impactStatus, applying, undo, load, loadPreview, resetPreview, loadImpact, apply, undoLast }
}
