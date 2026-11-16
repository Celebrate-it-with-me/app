import { CWM_API } from '@/services/axios'

const base = eventId => `/event/${eventId}/invitation`

/**
 * `VITE_INVITATION_PICKER_MOCK` swaps the API for an in-memory copy of the contract (see templatePickerMock.js). Dev only:
 * `import.meta.env.DEV` is a build-time constant, so production bundles drop the dynamic import and the mock chunk.
 */
const getMock = async () => (import.meta.env.DEV && import.meta.env.VITE_INVITATION_PICKER_MOCK ? await import('./templatePickerMock') : null)

/** Organizer side of the template selector and cover photo (docs/plans/template-stage5-contract-draft.md, section 4). */
class TemplatePickerService {
  /** `Template[]` the event may see: `{ id, slug, name, description, tier, locked, current, previewImage, eventTypes, hasPresets }`. */
  async templates(eventId) {
    const mock = await getMock()
    if (mock) return mock.templates(eventId)
    return (await CWM_API.get(`${base(eventId)}/templates`)).data.data
  }

  /** What changing to the template keeps and resets: `{ templateId, tier, locked, willPin, keeps, resets, restoresFromStash, changesPublishedLook }`. */
  async impact(eventId, templateId) {
    const mock = await getMock()
    if (mock) return mock.impact(eventId, templateId)
    return (await CWM_API.get(`${base(eventId)}/templates/${templateId}/impact`)).data.data
  }

  /**
   * Applies the template. Answers the editor state (like GET invitation) with `undo: { until, templateId }`.
   * `undo: true` marks the call as the "Deshacer" of the last change (the API only logs it differently).
   * A published invitation answers 409 `template_locked` (D-1): there is no "confirm" way around it, only support.
   */
  async apply(eventId, templateId, { undo = false } = {}) {
    const body = { template_id: templateId }
    if (undo) body.undo = true
    const mock = await getMock()
    if (mock) return mock.apply(eventId, body)
    return (await CWM_API.put(`${base(eventId)}/template`, body)).data.data
  }

  /**
   * The invitation payload (same shape as the public one) with the real event data and the changes applied in memory.
   * `fields` is `{ <fieldId>: value }` (unsaved edits of the editor).
   */
  async preview(eventId, { templateId, locale, state, preset, fields } = {}) {
    const body = {}
    if (templateId != null) body.template_id = templateId
    if (fields && Object.keys(fields).length) body.fields = fields
    if (locale) body.locale = locale
    if (state) body.state = state
    if (preset) body.preset = preset
    const mock = await getMock()
    if (mock) return mock.preview(eventId, body)
    return (await CWM_API.post(`${base(eventId)}/preview`, body)).data.data
  }

  /** Uploads the cover photo (multipart): `{ url, thumbUrl, width, height, focus, bytes }`. */
  async uploadCover(eventId, file, focus) {
    const body = new FormData()
    body.append('photo', file)
    if (focus) body.append('focus', focus)
    const mock = await getMock()
    if (mock) return mock.uploadCover(eventId, file, focus)
    return (await CWM_API.post(`${base(eventId)}/cover-photo`, body, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data
  }

  /** Removes the cover photo (idempotent). */
  async removeCover(eventId) {
    const mock = await getMock()
    if (mock) return mock.removeCover(eventId)
    await CWM_API.delete(`${base(eventId)}/cover-photo`)
  }

  /** Saves where the cover photo is centred (`"40% 25%"`): the only thing PATCH accepts for `cover_photo`. */
  async saveFocus(eventId, focus) {
    const mock = await getMock()
    if (mock) return mock.saveFocus(eventId, focus)
    return (await CWM_API.patch(base(eventId), { fields: { cover_photo: { focus } } })).data.data
  }
}

export default new TemplatePickerService()
