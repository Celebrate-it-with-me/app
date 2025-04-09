import { defineStore } from 'pinia'
import EventCommentsService from '../services/EventCommentsService'
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
    memories: [],
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
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      return await SweetMemoriesService.uploadSweetMemoriesImages(formData, eventId)
    },

    async addComment({ eventId, userId, origin }) {
      return EventCommentsService.addComment({ eventId, userId, origin, ...this.currentComment })
    },

    async loadComments(eventId) {
      return EventCommentsService.loadComments(eventId)
    },

    async loadMoreComments(eventId, page) {
      return EventCommentsService.loadMoreComments(eventId, page)
    }
  },
  getters: {}
})
