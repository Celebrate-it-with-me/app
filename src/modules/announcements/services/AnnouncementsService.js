import { CWM_API } from '@/services/axios'

/**
 * `VITE_ANNOUNCEMENTS_MOCK` swaps the API for an in-memory copy of the contract (see announcementsMock.js). Dev only:
 * `import.meta.env.DEV` is a build-time constant, so production bundles drop the dynamic import and the mock chunk.
 */
const getMock = async () => (import.meta.env.DEV && import.meta.env.VITE_ANNOUNCEMENTS_MOCK ? (await import('./announcementsMock')).mockAnnouncements : null)

/** Organizer side of the announcements contract (docs/plans/announcements-contract.md). */
class AnnouncementsService {
  /** `[{ id, level, title, body, ctaLabel, ctaUrl, dismissible }]`, already localized, at most 3. */
  async list(lang) {
    const mock = await getMock()
    if (mock) return mock.list(lang)
    const params = lang ? { lang } : {}
    return (await CWM_API.get('announcements', { params })).data.data
  }

  /** Idempotent. 404 `announcement_not_found`; 422 `errors.announcement[0] = not_dismissible`. */
  async dismiss(id) {
    const mock = await getMock()
    if (mock) return mock.dismiss(id)
    await CWM_API.post(`announcements/${id}/dismiss`)
  }
}

export default new AnnouncementsService()
