import { defineStore } from 'pinia'
import EventCommentsService from '../services/EventCommentsService'

export const useEventCommentsStore = defineStore('eventComments', {
  state: () => ({
    id: null,
    config: {
      title: '',
      subTitle: '',
      backgroundColor: '#fff',
      commentsTitle: '',
      maxComments: 3
    },
    eventComments: [],
    mode: 'create'
  }),
  actions: {
    createCommentsConfig(eventId) {
      return EventCommentsService.createCommentsConfig({
        eventId,
        ...this.config,
      })
    }
  },
  getters: {}
})
