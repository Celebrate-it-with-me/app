import { defineStore } from 'pinia'
import timelineService from '../services/timelineService'

export const useTimelineStore = defineStore('timelineStore', {
  state: () => ({
    timelines: [],
    loading: false,
    error: null
  }),

  getters: {
    sortedTimelines: state => {
      const parseDate = dateStr => {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) return d
        const [datePart, timePart = '00:00'] = (dateStr || '').replace(',', '').split(' ')
        const [month, day, year] = datePart.split('/').map(Number)
        const [hour, minute] = timePart.split(':').map(Number)
        return new Date(year, month - 1, day, hour, minute)
      }
      return [...state.timelines].sort((a, b) => {
        return parseDate(a.start_time) - parseDate(b.start_time)
      })
    },
    timelineCount: state => state.timelines.length
  },

  actions: {
    async fetchTimelines(eventId) {
      try {
        this.loading = true
        this.error = null
        const response = await timelineService.getTimelines(eventId)
        this.timelines = response.data?.data || []
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addTimeline(eventId, timelineData) {
      try {
        this.loading = true
        this.error = null
        const response = await timelineService.createTimeline(eventId, timelineData)
        const newTimeline = response.data?.data
        if (newTimeline) {
          this.timelines.push(newTimeline)
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTimeline(eventId, id, timelineData) {
      try {
        this.loading = true
        this.error = null
        const response = await timelineService.updateTimeline(eventId, id, timelineData)
        const updatedTimeline = response.data?.data
        if (updatedTimeline) {
          const index = this.timelines.findIndex(t => t.id === id)
          if (index !== -1) {
            this.timelines[index] = updatedTimeline
          }
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTimeline(eventId, id) {
      try {
        this.loading = true
        this.error = null
        const response = await timelineService.deleteTimeline(eventId, id)
        this.timelines = this.timelines.filter(t => t.id !== id)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
