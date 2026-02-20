import { defineStore } from 'pinia'
import OrganizerRsvpService from '@/services/OrganizerRsvpService'
import { useEventsStore } from '@/modules/events/stores/useEventsStore'

export const useOrganizerRsvpStore = defineStore('organizerRsvp', {
  state: () => ({
    isLoading: false,
    isSaving: false,
    error: null,
    // RSVP Status Constants
    RSVP_STATUS: {
      ATTENDING: 'attending',
      NOT_ATTENDING: 'not_attending',
      PENDING: 'pending'
    }
  }),

  getters: {
    // Si hubiera getters que no requieren parámetros se pondrían aquí.
    // Los métodos utilitarios que reciben parámetros se moverán a actions por simplicidad en Pinia Option Stores
    // o pueden quedarse como funciones externas si no dependen del estado.
  },

  actions: {
    /**
     * Confirm RSVP for main guest and companions (unified modal approach)
     *
     * @param {number} guestId - Main guest ID
     * @param {Object} payload - RSVP confirmation data
     * @returns {Promise<Object>}
     */
    async confirmRsvp(guestId, payload) {
      this.isSaving = true
      this.error = null

      try {
        const eventsStore = useEventsStore()
        const eventId = eventsStore.activeEvent?.id
        if (!eventId) {
          throw new Error('No event selected')
        }

        const { data } = await OrganizerRsvpService.confirmRsvp({
          eventId,
          guestId,
          payload
        })

        return {
          success: true,
          main_guest: data.main_guest,
          updated_guests_summary: data.updated_guests_summary,
          statistics: data.statistics
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to confirm RSVP'
        console.error('Error confirming RSVP:', err)

        throw new Error(this.error)
      } finally {
        this.isSaving = false
      }
    },

    /**
     * Get RSVP status for main guest and companions (for modal pre-population)
     *
     * @param {number} guestId - Main guest ID
     * @returns {Promise<Object>}
     */
    async getRsvpStatus(guestId) {
      this.isLoading = true
      this.error = null

      try {
        const eventsStore = useEventsStore()
        const eventId = eventsStore.activeEvent?.id
        if (!eventId) {
          throw new Error('No event selected')
        }

        const { data } = await OrganizerRsvpService.getRsvpStatus({
          eventId,
          guestId
        })

        return {
          success: true,
          main_guest: data.main_guest,
          companions: data.companions
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to get RSVP status'
        console.error('Error getting RSVP status:', err)

        throw new Error(this.error)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Bulk apply status to all companions
     *
     * @param {number} guestId - Main guest ID
     * @param {string} rsvpStatus - Status to apply (attending, not_attending, pending)
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>}
     */
    async bulkApplyToCompanions(guestId, rsvpStatus, notes = '') {
      this.isSaving = true
      this.error = null

      try {
        const eventsStore = useEventsStore()
        const eventId = eventsStore.activeEvent?.id
        if (!eventId) {
          throw new Error('No event selected')
        }

        const { data } = await OrganizerRsvpService.bulkApplyToCompanions({
          eventId,
          guestId,
          payload: {
            rsvp_status: rsvpStatus,
            notes
          }
        })

        return {
          success: true,
          message: data.message,
          updated_companions: data.updated_companions,
          main_guest: data.main_guest
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to bulk update companions'
        console.error('Error bulk updating companions:', err)

        throw new Error(this.error)
      } finally {
        this.isSaving = false
      }
    },

    /**
     * Validate RSVP status
     *
     * @param {string} status - Status to validate
     * @returns {boolean}
     */
    isValidRsvpStatus(status) {
      return Object.values(this.RSVP_STATUS).includes(status)
    },

    /**
     * Get human readable status text
     *
     * @param {string} status - RSVP status
     * @returns {string}
     */
    getStatusText(status) {
      const statusMap = {
        [this.RSVP_STATUS.ATTENDING]: 'Attending',
        [this.RSVP_STATUS.NOT_ATTENDING]: 'Not Attending',
        [this.RSVP_STATUS.PENDING]: 'Pending'
      }

      return statusMap[status] || 'Unknown'
    },

    /**
     * Get status color class for UI
     *
     * @param {string} status - RSVP status
     * @returns {string}
     */
    getStatusColorClass(status) {
      const colorMap = {
        [this.RSVP_STATUS.ATTENDING]: 'text-green-600 bg-green-100',
        [this.RSVP_STATUS.NOT_ATTENDING]: 'text-red-600 bg-red-100',
        [this.RSVP_STATUS.PENDING]: 'text-orange-600 bg-orange-100'
      }

      return colorMap[status] || 'text-gray-600 bg-gray-100'
    },

    /**
     * Prepare payload for RSVP confirmation
     *
     * @param {Object} mainGuestData - Main guest form data
     * @param {Array} companionsData - Companions form data
     * @returns {Object}
     */
    prepareConfirmationPayload(mainGuestData, companionsData) {
      return {
        main_guest: {
          rsvp_status: mainGuestData.rsvp_status,
          notes: mainGuestData.notes || ''
        },
        companions: companionsData.map(companion => ({
          id: companion.id,
          rsvp_status: companion.rsvp_status,
          notes: companion.notes || ''
        }))
      }
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Reset store state
     */
    resetStore() {
      this.isLoading = false
      this.isSaving = false
      this.error = null
    }
  }
})
