import { defineStore } from 'pinia'
import BackgroundMusicService from '../services/BackgroundMusicService'

export const useBackgroundMusicStore = defineStore('backgroundMusicStore', {
  state: () => ({
    id: null,
    iconSize: '',
    iconPosition: '',
    iconColor: '',
    autoplay: false,
    songFile: null,
    mode: 'create'
  }),
  actions: {
    async addBackgroundMusic(eventId) {
      return await BackgroundMusicService.create({
        eventId,
        iconSize: this.iconSize,
        iconPosition: this.iconPosition,
        iconColor: this.iconColor,
        autoplay: this.autoplay,
        songFile: this.songFile
      })
    },

    async loadBackgroundMusic(eventId) {
      return await BackgroundMusicService.load({ eventId })
    },

    async editBackgroundMusic() {
      const options = {
        backgroundMusicId: this.id,
        iconSize: this.iconSize,
        iconPosition: this.iconPosition,
        iconColor: this.iconColor,
        autoplay: this.autoplay,
        songFile: this.songFile
      }

      return BackgroundMusicService.update({ ...options })
    }
  },
  getters: {}
})
