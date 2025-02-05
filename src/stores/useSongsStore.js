import { defineStore } from 'pinia'

export const useSongsStore = defineStore('songStore', {
  state: () => ({
    selectedSongs: [],
  }),
  actions: {
    addSong(song) {
      if (!this.selectedSongs.some(s => s.id === song.id)) {
        this.selectedSongs.push(song)
      }
    },

    removeSong(songId) {
      this.selectedSongs = this.selectedSongs.filter((song) => song.id !== songId)
    },

    clearSelectedSongs() {
      this.selectedsongs = []
    }
  },
  getters: {
      songCount: () => this.selectedSongs.length,
  },
})
