import { CWM_API } from '@/services/axios'
import { mockAnnouncements } from './announcementsMock'

/** `VITE_ANNOUNCEMENTS_MOCK` swaps the API for an in-memory copy of the contract (see announcementsMock.js). */
const mocked = () => !!import.meta.env.VITE_ANNOUNCEMENTS_MOCK

/** Organizer side of the announcements contract (docs/plans/announcements-contract.md). */
class AnnouncementsService {
  /** `[{ id, level, title, body, ctaLabel, ctaUrl, dismissible }]`, already localized, at most 3. */
  async list(lang) {
    if (mocked()) return mockAnnouncements.list(lang)
    const params = lang ? { lang } : {}
    return (await CWM_API.get('announcements', { params })).data.data
  }

  /** Idempotent. 404 `announcement_not_found`; 422 `errors.announcement[0] = not_dismissible`. */
  async dismiss(id) {
    if (mocked()) return mockAnnouncements.dismiss(id)
    await CWM_API.post(`announcements/${id}/dismiss`)
  }
}

export default new AnnouncementsService()
