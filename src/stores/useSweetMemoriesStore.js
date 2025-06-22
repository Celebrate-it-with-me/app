import { defineStore } from 'pinia'
import SweetMemoriesService from '@/services/SweetMemoriesService'
import { useUserStore } from '@/stores/useUserStore'

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
      thumbnail: null
    },
    mode: 'create'
  }),
  actions: {
    async createSweetMemoriesConfig(eventId) {
      return await SweetMemoriesService.createSweetMemoriesConfig({
        eventId,
        ...this.config
      })
    },

    async loadSweetMemoriesConfig(eventId) {
      return await SweetMemoriesService.loadSweetMemoriesConfig({ eventId })
    },

    async updateSweetMemoriesConfig(eventId) {
      return await SweetMemoriesService.updateSweetMemoriesConfig({
        eventId,
        ...this.config
      })
    },

    async uploadSweetMemoriesImages(files, eventId) {
      return await SweetMemoriesService.uploadSweetMemoriesImages(files, eventId)
    },

    async updateSweetMemoriesImages(eventId, files) {
      console.log('in sweet memories store', files)
      return await SweetMemoriesService.updateSweetMemoriesImages({
        eventId,
        files
      })
    },

    async loadSweetMemoriesImages(eventId) {
      try {
        const response = await SweetMemoriesService.loadSweetMemoriesImages(eventId)

        if (response.status === 200) {
          const images = response.data.data ?? []

          this.memoriesImages = images.map(image => ({
            id: image.id,
            url: image.imagePath,
            name: image.imageOriginalName ?? '',
            size: image.imageSize,
            file: null,
            isExisting: true
          }))

          this.mode = this.memoriesImages.length > 0 ? 'update' : 'create'
          return { success: true, images: this.memoriesImages }
        } else {
          this.mode = 'create'
          this.memoriesImages = []
          return { success: false, error: response }
        }
      } catch (error) {
        this.mode = 'create'
        console.error('Error loading sweet memories event images:', error)
        return { success: false, error }
      }
    },

    async removeSweetMemoriesImage(eventId, fileId) {
      return await SweetMemoriesService.removeSweetMemoriesImage(eventId, fileId)
    },

    async updateImageName(imageId, name) {
      return await SweetMemoriesService.updateImageName(imageId, name)
    },

    //------------ New Version 2.0 Methods -------------//

    async createSweetMemory(memory) {
      const userStore = useUserStore()
      console.log('checking memory in store', memory)
      return await SweetMemoriesService.createSweetMemory({
        eventId: userStore.activeEvent,
        ...memory
      })
    }
  },
  getters: {}
})
