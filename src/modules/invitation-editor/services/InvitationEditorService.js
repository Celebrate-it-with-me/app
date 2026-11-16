import { CWM_API } from '@/services/axios'

/**
 * `VITE_INVITATION_EDITOR_MOCK` swaps the API for an in-memory copy of the contract (see invitationEditorMock.js).
 * Dev only: `import.meta.env.DEV` is a build-time constant, so production bundles drop the dynamic import and the mock.
 */
const getMock = async () =>
  import.meta.env.DEV && import.meta.env.VITE_INVITATION_EDITOR_MOCK ? (await import('./invitationEditorMock')).mockInvitationEditor : null

/** Organizer side of the invitation-editor contract (docs/plans/template-stage5-contract-draft.md §4). */
class InvitationEditorService {
  /** `GET event/{id}/invitation` -> `{ template, state, groups, fields, sections, previewToken }`. */
  async get(eventId) {
    const mock = await getMock()
    if (mock) return mock.get(eventId)
    return (await CWM_API.get(`event/${eventId}/invitation`)).data.data
  }

  /**
   * `PATCH event/{id}/invitation` with `{ fields: { <id>: value | null } }` -> `{ fields: [touched], savedAt }`.
   * `null` goes back to the template's value. 403 plan_required, 409 template_locked / package_no_cover_field, 404 field_not_found,
   * 422 with FLAT keys, `errors["fields.<id>"][0]` (and `errors["fields.<id>.es"][0]` for a language), or `errors.status[0] = event_archived`.
   */
  async saveFields(eventId, fields) {
    const mock = await getMock()
    if (mock) return mock.saveFields(eventId, fields)
    return (await CWM_API.patch(`event/${eventId}/invitation`, { fields })).data.data
  }

  /** `PATCH event/{id}/invitation/sections` with `{ sections: [{ type, enabled, order }] }`. */
  async saveSections(eventId, sections) {
    const mock = await getMock()
    if (mock) return mock.saveSections(eventId, sections)
    return (await CWM_API.patch(`event/${eventId}/invitation/sections`, { sections })).data.data
  }
}

export default new InvitationEditorService()
