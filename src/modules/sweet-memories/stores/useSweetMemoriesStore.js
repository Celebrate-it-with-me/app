import { defineStore } from 'pinia'
import SweetMemoriesService from '@/modules/sweet-memories/services/SweetMemoriesService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

const currentEventId = () => useEventsStore().activeEvent?.id || 0

/**
 * Pure data store: actions reload state and throw on API errors.
 * User feedback (toasts, i18n) lives in useMemoriesController.
 */
export const useSweetMemoriesStore = defineStore('sweetMemories', {
  state: () => ({
    memories: []
  }),

  actions: {
    async loadMemories() {
      const response = await SweetMemoriesService.loadImages({ eventId: currentEventId() })
      this.memories = response.data?.data || []
    },

    async createMemory(formData) {
      await SweetMemoriesService.createImage({ eventId: currentEventId(), formData })
      await this.loadMemories()
    },

    async updateMemory(id, formData) {
      await SweetMemoriesService.updateImage({ eventId: currentEventId(), id, formData })
      await this.loadMemories()
    },

    async deleteMemory(id) {
      await SweetMemoriesService.deleteImage({ eventId: currentEventId(), id })
      await this.loadMemories()
    }
  }
})
