import { defineStore } from 'pinia'
import EventCommentsService from '../services/EventCommentsService'

export const useEventCommentsStore = defineStore('eventComments', {
  state: () => ({
    config: {
      id: null,
      title: '',
      subTitle: '',
      backgroundColor: '#fff',
      commentsTitle: '',
      buttonColor: '#fff',
      buttonText: '',
      maxComments: 3
    },
    eventComments: [],
    currentComment: {
      id: null,
      comment: null,
      author: null,
    },
    mode: 'create'
  }),
  actions: {
    async createCommentsConfig(eventId) {
      return await EventCommentsService.createCommentsConfig({
        eventId,
        ...this.config,
      })
    },

    async loadCommentsConfig(eventId) {
      return await EventCommentsService.loadCommentConfig({eventId})
    },

    async updateCommentsConfig(eventId) {
      return await EventCommentsService.updateCommentsConfig({
        eventId,
        ...this.config,
      })
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
