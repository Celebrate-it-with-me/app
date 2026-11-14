import { defineStore } from 'pinia'
import AnnouncementsService from '../services/AnnouncementsService'
import { MIN_REFRESH_MS, normalizeAnnouncements } from '../utils/announcements'

/**
 * The announcements the organizer sees. A failure never reaches the person: the list simply stays as it was.
 * Queries are spaced at least MIN_REFRESH_MS apart (`force` skips that, for a language change).
 */
export const useAnnouncementsStore = defineStore('announcements', {
  state: () => ({
    items: [],
    fetchedAt: 0,
    loading: false
  }),
  persist: false,
  actions: {
    async load({ lang, force = false } = {}) {
      if (this.loading) return
      if (!force && this.fetchedAt && Date.now() - this.fetchedAt < MIN_REFRESH_MS) return
      this.loading = true
      // Stamp before the answer so a failing API is not hammered either.
      this.fetchedAt = Date.now()
      try {
        this.items = normalizeAnnouncements(await AnnouncementsService.list(lang))
      } catch {
        // Silent on purpose: an announcement never breaks the app.
      } finally {
        this.loading = false
      }
    },

    /** Optimistic: it disappears at once and comes back if the API refuses (404 means it is gone for good). */
    async dismiss(id) {
      const index = this.items.findIndex(a => a.id === id)
      if (index === -1 || !this.items[index].dismissible) return false
      const [removed] = this.items.splice(index, 1)
      try {
        await AnnouncementsService.dismiss(id)
        return true
      } catch (error) {
        const status = error?.response?.status
        if (status === 404) return true
        const notDismissible = error?.response?.data?.errors?.announcement?.[0] === 'not_dismissible'
        this.items.splice(Math.min(index, this.items.length), 0, notDismissible ? { ...removed, dismissible: false } : removed)
        return false
      }
    }
  }
})
