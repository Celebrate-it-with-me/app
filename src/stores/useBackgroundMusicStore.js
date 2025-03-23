import { defineStore } from 'pinia'
import BackgroundMusicService from '../services/BackgroundMusicService'

export const useBackgroundMusicStore = defineStore('backgroundMusicStore', {
  state: () => ({
    iconSize: '30px',
    iconPosition: 'bottom-left',
    iconColor: '',
    autoplay: null,
    songFile: null
  }),
  actions: {
    async addBackgroundMusic(eventId){
      return BackgroundMusicService.create({
        eventId,
        iconSize: this.iconSize,
        iconPosition: this.iconPosition,
        iconColor: this.iconColor,
        autoplay: this.autoplay,
        songFile: this.songFile
      })
    }
  },
  getters: {}
})
