import { defineStore } from 'pinia'
import SongsService from '../services/SongsService'

export const useSuggestedMusicStore = defineStore('suggestedMusicStore', {
  state: () => ({
    selectedSongs: [],
    loading: false,
    error: null
  }),

  actions: {
    /**
     * Get suggested songs for an event (organizer view)
     * @param {number} eventId
     * @param {object} options - { perPage, orderBy, search }
     */
    async getSuggestedSongs(eventId, options = {}) {
      try {
        this.loading = true
        this.error = null
        return await SongsService.getSuggestedSongs(eventId, options)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add a new song (organizer)
     * @param {object} songData
     */
    async addNewSong(songData) {
      try {
        this.loading = true
        this.error = null
        return await SongsService.create(songData)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete a song (organizer)
     * @param {number} eventId
     * @param {number} songId
     */
    async deleteSong(eventId, songId) {
      try {
        this.loading = true
        this.error = null
        return await SongsService.deleteSong(eventId, songId)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Vote on a song (guest with accessCode)
     * @param {number} eventId
     * @param {number} songId
     * @param {string} direction - 'up' or 'down'
     * @param {string} accessCode
     */
    async voteSong(eventId, songId, direction, accessCode) {
      try {
        this.loading = true
        this.error = null
        return await SongsService.voteSong(eventId, songId, direction, accessCode)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Get available votes for a guest
     * @param {number} eventId
     * @param {string} accessCode
     */
    async getAvailableVotes(eventId, accessCode) {
      try {
        return await SongsService.getAvailableVotes(eventId, accessCode)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    /**
     * Add a song to local state (after successful API call)
     * @param {object} song
     */
    addSong(song) {
      if (!this.selectedSongs.some(s => s.id === song.id)) {
        this.selectedSongs.push(song)
      }
    },

    /**
     * Remove a song from local state (after successful API call)
     * @param {number} songId
     */
    removeSong(songId) {
      this.selectedSongs = this.selectedSongs.filter(song => song.id !== songId)
    },

    /**
     * Clear all selected songs
     */
    clearSelectedSongs() {
      this.selectedSongs = []
    },

    /**
     * Set songs from API response
     * @param {array} songs
     */
    setSongs(songs) {
      this.selectedSongs = songs
    }
  },

  getters: {
    songCount: state => state.selectedSongs.length,

    totalVotes: state => {
      return state.selectedSongs.reduce((total, song) => {
        const upVotes = song.votes?.up || 0
        const downVotes = song.votes?.down || 0
        return total + upVotes + downVotes
      }, 0)
    },

    topSong: state => {
      if (state.selectedSongs.length === 0) return null

      return state.selectedSongs.reduce((top, song) => {
        const currentNetScore = (song.votes?.up || 0) - (song.votes?.down || 0)
        const topNetScore = (top.votes?.up || 0) - (top.votes?.down || 0)
        return currentNetScore > topNetScore ? song : top
      })
    },

    guestSuggestedCount: state => {
      return state.selectedSongs.filter(song => song.suggestedBy?.isOrganizer === false).length
    }
  }
})
