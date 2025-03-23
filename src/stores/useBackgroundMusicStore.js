import { defineStore } from 'pinia'

export const useBackgroundMusicStore = defineStore('backgroundMusicStore', {
  state: () => ({
    iconSize: '30px',
    iconPosition: 'bottom-left',
    iconColor: 'green',
    autoplay: true,
    songFile: null
  }),
  actions: {},
  getters: {}
})
