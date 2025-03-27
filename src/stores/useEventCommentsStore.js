import { defineStore } from 'pinia'

export const useEventCommentsStore = defineStore('eventComments', {
  state: () => ({
    id: null,
    config: {
      title: '',
      subTitle: '',
      backgroundColor: 'transparent',
      commentsTitle: '',
      maxComments: 5
    },
    eventComments: [],
    mode: 'create'
  }),
  actions: {

  },
  getters: {}
})
