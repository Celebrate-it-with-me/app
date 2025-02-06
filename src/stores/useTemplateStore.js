import { defineStore } from 'pinia'

export const useTemplateStore = defineStore('templateStore', {
  state: () => ({
    event: {},
    guest: {}
  }),
  actions: {
    getEventData() {

    }
  }
})
