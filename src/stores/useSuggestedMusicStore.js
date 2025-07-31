import { defineStore } from 'pinia'
import SongsService from '../services/SongsService'

export const useSuggestedMusicStore = defineStore('suggestedMusicStore', {
  state: () => ({
    config: {
      id: null,
      title: 'Music Suggestions',
      subTitle: 'Please send us you preferred music',
      usePreview: false,
      mainColor: '#1f2937',
      secondaryColor: '#111827',
      useVoteSystem: true,
      searchLimit: 10
    },
    selectedSongs: []
  }),
  actions: {
    async saveSuggestedConfig({ eventId }) {
      return await SongsService.saveSuggestedConfig({
        eventId,
        title: this.title,
        subTitle: this.subTitle,
        usePreview: this.usePreview,
        mainColor: this.mainColor,
        secondaryColor: this.secondaryColor,
        useVoteSystem: this.useVoteSystem,
        searchLimit: this.searchLimit
      })
    },

    async updateSuggestedConfig() {
      return await SongsService.updateSuggestedConfig({
        id: this.config.id,
        title: this.config.title,
        subTitle: this.config.subTitle,
        usePreview: this.config.usePreview,
        mainColor: this.config.mainColor,
        secondaryColor: this.config.secondaryColor,
        useVoteSystem: this.config.useVoteSystem,
        searchLimit: this.config.searchLimit
      })
    },

    async getSuggestedSongs(eventId) {
      return await SongsService.getSuggestedSongs(eventId)
    },

    async addNewSong({ eventId, platformId, title, artist, album, thumbnailUrl, accessCode }) {
      return await SongsService.create({
        eventId,
        platformId,
        title,
        artist,
        album,
        thumbnailUrl,
        accessCode
      })
    },

    addSong(song) {
      if (!this.selectedSongs.some(s => s.id === song.id)) {
        this.selectedSongs.push(song)
      }
    },

    removeSong(songId) {
      this.selectedSongs = this.selectedSongs.filter(song => song.id !== songId)
    },

    clearSelectedSongs() {
      this.selectedsongs = []
    }
  },
  getters: {
    songCount: () => this.selectedSongs.length
  }
})
