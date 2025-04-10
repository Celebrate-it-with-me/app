import { defineStore } from 'pinia'
import SweetMemoriesService from '@/services/SweetMemoriesService'

export const useSweetMemoriesStore = defineStore('sweetMemories', {
  state: () => ({
    config: {
      id: null,
      title: '',
      subTitle: '',
      backgroundColor: '#fff',
      maxPictures: 5
    },
    memoriesImages: [],
    memory: {
      id: null,
      picture: null,
      thumbnail: null,
    },
    mode: 'create'
  }),
  actions: {
    async createSweetMemoriesConfig(eventId) {
      return await SweetMemoriesService.createSweetMemoriesConfig({
        eventId,
        ...this.config,
      })
    },

    async loadSweetMemoriesConfig(eventId) {
      return await SweetMemoriesService.loadSweetMemoriesConfig({eventId})
    },

    async updateSweetMemoriesConfig(eventId) {
      return await SweetMemoriesService.updateSweetMemoriesConfig({
        eventId,
        ...this.config,
      })
    },

    async uploadSweetMemoriesImages(files, eventId){
      return await SweetMemoriesService.uploadSweetMemoriesImages(files, eventId)
    },

    async updateSweetMemoriesImages(eventId, files) {
      console.log('in sweet memories store', files)
      return await SweetMemoriesService.updateSweetMemoriesImages({
        eventId,
        files,
      })
    },

    async loadSweetMemoriesImages(eventId){
      return await SweetMemoriesService.loadSweetMemoriesImages(eventId)
    },

    async removeSweetMemoriesImage(eventId, fileId) {
      return await SweetMemoriesService.removeSweetMemoriesImage(eventId, fileId)
    },

    async updateImageName(imageId, name) {
      return await SweetMemoriesService.updateImageName(imageId, name)
    }

  },
  getters: {}
})
