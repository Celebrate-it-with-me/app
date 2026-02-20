import { defineStore } from 'pinia'
import SaveTheDateService from '../services/SaveTheDateService'

export const useSaveTheDateStore = defineStore('saveTheDate', {
  state: () => ({
    config: null,
    loading: false,
    saving: false
  }),

  getters: {
    isEnabled: state => !!state.config && state.config.is_enabled !== false
  },

  actions: {
    async fetchConfig(eventId) {
      this.loading = true
      try {
        const { data } = await SaveTheDateService.getConfig(eventId)
        this.config = data.data || null
      } catch (error) {
        // If 404, it means it's disabled/no record
        if (error.response?.status === 404) {
          this.config = null
        } else {
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    async saveConfig(eventId, payload) {
      this.saving = true
      try {
        const response = await SaveTheDateService.updateConfig(eventId, payload)
        this.config = response.data.data
        return response.data
      } finally {
        this.saving = false
      }
    },

    async disableConfig(eventId) {
      this.saving = true
      try {
        await SaveTheDateService.deleteConfig(eventId)
        this.config = null
      } finally {
        this.saving = false
      }
    },

    setConfig(config) {
      this.config = config
    }
  }
})
