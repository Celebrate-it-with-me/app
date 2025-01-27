import { defineStore } from 'pinia'

export const useSTDStore = defineStore('stdStore', {
  state: () => ({
    activeSTD: false,
    message: '',
    image_url: '',
    is_enabled: false
  }),
})
