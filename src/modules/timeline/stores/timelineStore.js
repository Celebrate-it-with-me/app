import { defineStore } from 'pinia'
import timelineService from '../services/timelineService'

/** The moments of the active event's program, in order. */
export const useTimelineStore = defineStore('timelineStore', {
  state: () => ({ timelines: [], loading: false }),

  actions: {
    async fetchTimelines(eventId) {
      this.loading = true
      try {
        this.timelines = await timelineService.list(eventId)
      } finally {
        this.loading = false
      }
    },
    async addTimeline(eventId, moment) {
      await timelineService.create(eventId, moment)
      await this.fetchTimelines(eventId)
    },
    async updateTimeline(eventId, id, moment) {
      await timelineService.update(eventId, id, moment)
      await this.fetchTimelines(eventId)
    },
    async deleteTimeline(eventId, id) {
      await timelineService.remove(eventId, id)
      this.timelines = this.timelines.filter(moment => moment.id !== id)
    },
    async startTypical(eventId) {
      this.timelines = await timelineService.typical(eventId)
    }
  }
})
